import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env';
import { SCHEMA_SQL } from '../db/schema';
import { getIceServers } from '../lib/ice';
import { AppError } from '../lib/errors';
import { id, nowMs } from '../lib/id';
import { sha256Hex } from '../lib/crypto';
import { signJwtHs256, decodeJwtPayloadUnsafe, verifyJwtHs256 } from '../lib/jwt';
import { safeString, safeId, safeArray, safeRecord, paginationSchema } from '../lib/validation';
import { createLogger } from '../lib/logger';
import { getRateLimit, getClientIp, hashIp } from '../lib/security';
import { withTimeout, retryWithBackoff, isRetryableError } from '../lib/resilience';

type AuthContext = {
	orgId: string;
	apiKeyId: string;
	scopes: string[];
};

type Variables = {
	requestId: string;
	auth?: AuthContext;
	logger: ReturnType<typeof createLogger>;
};

type HonoApp = {
	Bindings: Env;
	Variables: Variables;
};

const deviceRegisterSchema = z.object({
	name: safeString(1, 255),
	external_id: safeString(1, 255).optional(),
	agent: z
		.object({
			version: safeString(1, 50).optional(),
			os: z.enum(['Windows', 'Linux', 'macOS', 'windows', 'linux', 'macos']),
			arch: safeString(1, 20).optional(),
		})
		.optional(),
	capabilities: z
		.object({
			webrtc: z.boolean().optional(),
			screen_capture: z.boolean().optional(),
			input_injection: z.boolean().optional(),
			clipboard_sync: z.boolean().optional(),
		})
		.optional(),
	public_key_pem: safeString(1, 4096).optional(),
	tags: safeArray(safeString(1, 50), 50).optional(),
});

const sessionCreateSchema = z.object({
	device_id: safeId,
	purpose: safeString(1, 500).optional(),
	expires_in_seconds: z
		.number()
		.int()
		.positive()
		.max(24 * 60 * 60)
		.optional(),
	webrtc: z
		.object({
			preferred_codec: safeString(1, 50).optional(),
			max_bitrate_kbps: z.number().int().positive().max(100000).optional(),
		})
		.optional(),
	metadata: safeRecord(z.unknown(), 50).optional(),
});

const sessionJoinSchema = z.object({
	role: z.enum(['controller', 'observer', 'agent']).optional(),
});

const pairingCodeCreateSchema = z.object({
	device_name_hint: safeString(1, 255).optional(),
	expires_in_seconds: z
		.number()
		.int()
		.positive()
		.max(60 * 60)
		.optional(),
});

const devicePairSchema = z.object({
	code: safeString(1, 100),
	name: safeString(1, 255).optional(),
	agent: deviceRegisterSchema.shape.agent.optional(),
	tags: deviceRegisterSchema.shape.tags.optional(),
});

const aiRunCreateSchema = z.object({
	session_id: safeId,
	goal: safeString(1, 2000),
	mode: z.enum(['observe', 'control']).optional(),
	policy: safeRecord(z.unknown(), 20).optional(),
	context: safeRecord(z.unknown(), 50).optional(),
});

const aiProposeSchema = z.object({
	session_id: safeId,
	goal: safeString(1, 2000),
});

const aiApproveSchema = z.object({
	session_id: safeId,
	plan_id: safeId,
	run_id: safeId,
	actions: safeArray(
		z.object({
			action_id: safeId,
			type: safeString(1, 50),
			args: safeRecord(z.unknown(), 20).optional(),
			requires_confirmation: z.boolean().optional(),
			confidence: z.number().min(0).max(1).optional(),
		}),
		100
	),
});

export function createV1App() {
	const v1 = new Hono<HonoApp>();

	// Note: requestId is already set by parent app middleware in index.ts

	// --- Dev bootstrap (local / staging only) ---
	v1.post('/dev/migrate', async (c) => {
		const bootstrapToken = c.req.header('x-dev-bootstrap-token');
		if (!c.env.DEV_BOOTSTRAP_TOKEN || bootstrapToken !== c.env.DEV_BOOTSTRAP_TOKEN) {
			throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' });
		}
		await applySqlBatch(c.env.DB, SCHEMA_SQL);
		return c.json({ ok: true });
	});

	v1.post('/dev/bootstrap', async (c) => {
		const bootstrapToken = c.req.header('x-dev-bootstrap-token');
		if (!c.env.DEV_BOOTSTRAP_TOKEN || bootstrapToken !== c.env.DEV_BOOTSTRAP_TOKEN) {
			throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Not found' });
		}

		const now = nowMs();
		const orgId = id('org');
		const userId = id('usr');
		const apiKeyId = id('key');
		const deviceId = id('dev');

		const apiKeyRaw = `vl_api_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
		const apiKeyHash = await sha256Hex(apiKeyRaw);

		const deviceTokenRaw = `vl_dev_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
		const deviceTokenHash = await sha256Hex(deviceTokenRaw);

		await c.env.DB.batch([
			c.env.DB.prepare(`INSERT INTO orgs (id, name, plan, status, created_at, updated_at) VALUES (?, ?, 'free', 'active', ?, ?)`).bind(
				orgId,
				'Dev Org',
				now,
				now,
			),
			c.env.DB.prepare(
				`INSERT INTO users (id, org_id, email, email_verified, display_name, role, status, created_at, updated_at)
				 VALUES (?, ?, ?, 1, 'Dev User', 'owner', 'active', ?, ?)`,
			).bind(userId, orgId, 'dev@getscreen.local', now, now),
			c.env.DB.prepare(
				`INSERT INTO api_keys (id, org_id, name, key_hash, scopes_json, created_by_user_id, created_at)
				 VALUES (?, ?, 'dev', ?, ?, ?, ?)`,
			).bind(apiKeyId, orgId, apiKeyHash, JSON.stringify(['*']), userId, now),
			c.env.DB.prepare(
				`INSERT INTO devices (id, org_id, name, os, arch, agent_version, status, tags_json, created_at, updated_at)
				 VALUES (?, ?, 'Dev Device', 'linux', 'x64', '0.0.0', 'offline', ?, ?, ?)`,
			).bind(deviceId, orgId, JSON.stringify(['dev']), now, now),
			c.env.DB.prepare(`INSERT INTO device_credentials (device_id, secret_hash, created_at) VALUES (?, ?, ?)`).bind(
				deviceId,
				deviceTokenHash,
				now,
			),
		]);

		return c.json({
			org: { id: orgId, name: 'Dev Org' },
			user: { id: userId, email: 'dev@getscreen.local' },
			api_key: { id: apiKeyId, key: apiKeyRaw },
			device: { id: deviceId, device_token: deviceTokenRaw },
		});
	});

	// --- Health ---
	v1.get('/healthz', (c) => c.json({ ok: true }));

	v1.get('/readyz', async (c) => {
		try {
			await withTimeout(
				c.env.DB.prepare('SELECT 1 as ok').first(),
				3000,
				'Database health check timeout'
			);
			return c.json({ ok: true, timestamp: new Date().toISOString() });
		} catch (err) {
			const requestId = c.get('requestId');
			const logger = c.get('logger');
			logger.error('Database not ready', { requestId, error: err });
			throw new AppError({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'DB not ready', details: { requestId } });
		}
	});

	// --- Auth (API key only for MVP) ---
	v1.use('*', async (c, next) => {
		// Allow unauthenticated health and bootstrap
		// SECURITY: Use exact path matching for WebSocket to prevent bypass
		if (
			c.req.path === '/healthz' ||
			c.req.path === '/readyz' ||
			c.req.path === '/dev/migrate' ||
			c.req.path === '/dev/bootstrap' ||
			c.req.path === '/ws'
		)
			return next();

		const apiKey = c.req.header('x-api-key');
		if (!apiKey) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Missing X-API-Key' });

		const apiKeyHash = await sha256Hex(apiKey);

		// Add timeout to database query
		const row = await withTimeout(
			c.env.DB.prepare(`SELECT id, org_id, scopes_json, revoked_at FROM api_keys WHERE key_hash = ? LIMIT 1`)
				.bind(apiKeyHash)
				.first<{ id: string; org_id: string; scopes_json: string; revoked_at: number | null }>(),
			5000,
			'Database query timeout'
		);

		if (!row || row.revoked_at) {
			const logger = c.get('logger');
			logger.logSecurity('Invalid API key attempt', {
				requestId: c.get('requestId'),
				apiKeyPrefix: apiKey.slice(0, 10),
			});
			throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Invalid API key' });
		}

		const scopes = safeParseJsonArray(row.scopes_json);
		c.set('auth', { orgId: row.org_id, apiKeyId: row.id, scopes });

		// Update last_used_at asynchronously (fire and forget)
		const now = nowMs();
		c.executionCtx.waitUntil(
			c.env.DB.prepare(`UPDATE api_keys SET last_used_at = ? WHERE id = ?`)
				.bind(now, row.id)
				.run()
				.catch(() => {
					// Ignore errors for last_used_at update
				})
		);

		return next();
	});

	// --- Devices ---
	v1.post('/devices', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const rateLimit = getRateLimit('devices:register');
		await enforceRateLimit(c.env, auth.orgId, 'devices:register', rateLimit.limit, rateLimit.windowSeconds);

		const body = deviceRegisterSchema.parse(await c.req.json());
		const now = nowMs();
		const deviceId = id('dev');
		const tagsJson = body.tags ? JSON.stringify(body.tags) : null;
		const os = body.agent?.os?.toLowerCase() ?? 'linux';
		const arch = body.agent?.arch ?? null;
		const agentVersion = body.agent?.version ?? null;

		const deviceTokenRaw = `vl_dev_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
		const deviceTokenHash = await sha256Hex(deviceTokenRaw);

		await withTimeout(
			c.env.DB.batch([
				c.env.DB.prepare(
					`INSERT INTO devices (id, org_id, name, os, arch, agent_version, status, tags_json, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, 'offline', ?, ?, ?)`,
				).bind(deviceId, auth.orgId, body.name, os, arch, agentVersion, tagsJson, now, now),
				c.env.DB.prepare(`INSERT INTO device_credentials (device_id, secret_hash, created_at) VALUES (?, ?, ?)`).bind(
					deviceId,
					deviceTokenHash,
					now,
				),
			]),
			10000,
			'Database operation timeout'
		);

		const logger = c.get('logger');
		logger.logAudit('device.created', {
			requestId: c.get('requestId'),
			orgId: auth.orgId,
			deviceId,
		});

		return c.json({
			id: deviceId,
			name: body.name,
			status: 'offline',
			created_at: new Date(now).toISOString(),
			last_seen_at: null,
			tags: body.tags ?? [],
			device_token: deviceTokenRaw,
		});
	});

	v1.get('/devices', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const limit = clampInt(Number(c.req.query('limit') ?? 20), 1, 100);
		const status = c.req.query('status');
		const search = c.req.query('search');
		const cursor = c.req.query('cursor');
		const tag = c.req.queries('tag');
		const cursorObj = cursor ? decodeCursor(cursor) : null;

		// Validate search input
		if (search && search.length > 255) {
			throw new AppError({ status: 400, code: 'VALIDATION_ERROR', message: 'Search query too long' });
		}

		const where: string[] = ['org_id = ?'];
		const bindings: (string | number | null)[] = [auth.orgId];
		if (status) {
			where.push('status = ?');
			bindings.push(status);
		}
		if (search) {
			where.push('(name LIKE ? OR id LIKE ?)');
			const sanitizedSearch = search.replace(/[%_]/g, '\\$&'); // Escape SQL LIKE wildcards
			bindings.push(`%${sanitizedSearch}%`, `%${sanitizedSearch}%`);
		}
		if (tag && tag.length > 0) {
			for (const t of tag.slice(0, 10)) { // Limit to 10 tags
				where.push('tags_json LIKE ?');
				const sanitizedTag = t.replace(/[%_"]/g, '\\$&');
				bindings.push(`%\"${sanitizedTag}\"%`);
			}
		}
		if (cursorObj) {
			where.push('(created_at < ? OR (created_at = ? AND id < ?))');
			bindings.push(cursorObj.created_at, cursorObj.created_at, cursorObj.id);
		}

		const sql = `
			SELECT id, name, status, last_seen_at, tags_json, created_at
			FROM devices
			WHERE ${where.join(' AND ')}
			ORDER BY created_at DESC, id DESC
			LIMIT ?
		`;
		bindings.push(limit + 1);

		const result = await withTimeout(
			c.env.DB.prepare(sql)
				.bind(...bindings)
				.all<{
					id: string;
					name: string;
					status: string;
					last_seen_at: number | null;
					tags_json: string | null;
					created_at: number;
				}>(),
			10000,
			'Database query timeout'
		);

		const rows = result.results ?? [];
		const page = rows.slice(0, limit);
		const next = rows.length > limit ? rows[limit] : null;
		const nextCursor = next ? encodeCursor({ created_at: next.created_at, id: next.id }) : null;

		return c.json({
			items: page.map((r) => ({
				id: r.id,
				name: r.name,
				status: r.status,
				last_seen_at: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
				tags: safeParseJsonArray(r.tags_json),
			})),
			next_cursor: nextCursor,
		});
	});

	// --- Pairing (device enrollment) ---
	v1.post('/devices/pairing-codes', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const body = pairingCodeCreateSchema.parse(await c.req.json().catch(() => ({})));
		const now = nowMs();
		const ttlSeconds = body.expires_in_seconds ?? 10 * 60;
		const code = `pair_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
		const expiresAt = now + ttlSeconds * 1000;

		await c.env.DB.prepare(
			`INSERT INTO pairing_codes (code, org_id, device_name_hint, expires_at, created_at)
				 VALUES (?, ?, ?, ?, ?)`,
		)
			.bind(code, auth.orgId, body.device_name_hint ?? null, expiresAt, now)
			.run();

		return c.json({ code, expires_at: new Date(expiresAt).toISOString() }, 201);
	});

	v1.post('/devices/pair', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const body = devicePairSchema.parse(await c.req.json());
		const now = nowMs();

		const pairing = await c.env.DB.prepare(
			`SELECT code, device_name_hint, expires_at, consumed_at FROM pairing_codes WHERE org_id = ? AND code = ? LIMIT 1`,
		)
			.bind(auth.orgId, body.code)
			.first<{ code: string; device_name_hint: string | null; expires_at: number; consumed_at: number | null }>();

		if (!pairing) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Pairing code not found' });
		if (pairing.consumed_at) throw new AppError({ status: 409, code: 'CONFLICT', message: 'Pairing code already used' });
		if (pairing.expires_at <= now) throw new AppError({ status: 410, code: 'CONFLICT', message: 'Pairing code expired' });

		const deviceId = id('dev');
		const deviceName = body.name ?? pairing.device_name_hint ?? 'New Device';
		const tagsJson = body.tags ? JSON.stringify(body.tags) : null;
		const os = body.agent?.os?.toLowerCase() ?? 'linux';
		const arch = body.agent?.arch ?? null;
		const agentVersion = body.agent?.version ?? null;

		const deviceTokenRaw = `vl_dev_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
		const deviceTokenHash = await sha256Hex(deviceTokenRaw);

		await c.env.DB.batch([
			c.env.DB.prepare(
				`INSERT INTO devices (id, org_id, name, os, arch, agent_version, status, tags_json, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, 'offline', ?, ?, ?)`,
			).bind(deviceId, auth.orgId, deviceName, os, arch, agentVersion, tagsJson, now, now),
			c.env.DB.prepare(`INSERT INTO device_credentials (device_id, secret_hash, created_at) VALUES (?, ?, ?)`).bind(
				deviceId,
				deviceTokenHash,
				now,
			),
			c.env.DB.prepare(`UPDATE pairing_codes SET consumed_at = ?, consumed_by_device_id = ? WHERE org_id = ? AND code = ?`).bind(
				now,
				deviceId,
				auth.orgId,
				body.code,
			),
		]);

		return c.json(
			{
				id: deviceId,
				name: deviceName,
				status: 'offline',
				created_at: new Date(now).toISOString(),
				last_seen_at: null,
				tags: body.tags ?? [],
				device_token: deviceTokenRaw,
			},
			201,
		);
	});

	// --- Sessions ---
	v1.post('/sessions', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const rateLimit = getRateLimit('sessions:create');
		await enforceRateLimit(c.env, auth.orgId, 'sessions:create', rateLimit.limit, rateLimit.windowSeconds);

		const idempotencyKey = c.req.header('idempotency-key');
		const body = sessionCreateSchema.parse(await c.req.json());
		const requestHash = await sha256Hex(JSON.stringify(body));

		if (idempotencyKey) {
			// Validate idempotency key format
			if (idempotencyKey.length > 255) {
				throw new AppError({ status: 400, code: 'VALIDATION_ERROR', message: 'Idempotency-Key too long' });
			}

			const existing = await withTimeout(
				c.env.DB.prepare(
					`SELECT response_status, response_json, request_hash FROM idempotency_keys WHERE org_id = ? AND key = ? LIMIT 1`,
				)
					.bind(auth.orgId, idempotencyKey)
					.first<{ response_status: number; response_json: string; request_hash: string }>(),
				5000,
				'Idempotency check timeout'
			);

			if (existing) {
				if (existing.request_hash !== requestHash) {
					throw new AppError({
						status: 409,
						code: 'IDEMPOTENCY_KEY_REUSED',
						message: 'Idempotency-Key reused with different payload',
					});
				}
				return new Response(existing.response_json, {
					status: existing.response_status,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				});
			}
		}

		const device = await withTimeout(
			c.env.DB.prepare(`SELECT id, status FROM devices WHERE id = ? AND org_id = ? LIMIT 1`)
				.bind(body.device_id, auth.orgId)
				.first<{ id: string; status: string }>(),
			5000,
			'Device lookup timeout'
		);

		if (!device) throw new AppError({ status: 404, code: 'DEVICE_NOT_FOUND', message: 'Device not found' });

		const sessionId = id('ses');
		const now = nowMs();
		const expiresAt = now + (body.expires_in_seconds ?? 1800) * 1000;

		await withTimeout(
			c.env.DB.prepare(
				`INSERT INTO sessions (id, org_id, device_id, mode, status, recording_enabled, region_hint, expires_at, created_at, updated_at)
				 VALUES (?, ?, ?, 'manual', 'waiting_for_device', 0, ?, ?, ?, ?)`,
			)
				.bind(sessionId, auth.orgId, body.device_id, c.req.raw.cf?.colo ?? null, expiresAt, now, now)
				.run(),
			10000,
			'Session creation timeout'
		);

		const sessionToken = await issueSessionJoinToken(c.env, {
			sessionId,
			orgId: auth.orgId,
			role: 'controller',
			ttlSeconds: 300,
		});

		const responseBody = {
			id: sessionId,
			status: 'waiting_for_device',
			device_id: body.device_id,
			created_at: new Date(now).toISOString(),
			expires_at: new Date(expiresAt).toISOString(),
			session_token: sessionToken,
			ws_url: wsUrlFromRequest(c.req.raw, '/v1/ws'),
			ice_servers: getIceServers(c.env),
		};

		if (idempotencyKey) {
			// Store idempotency key asynchronously
			c.executionCtx.waitUntil(
				c.env.DB.prepare(
					`INSERT INTO idempotency_keys (org_id, key, method, path, request_hash, response_status, response_json, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(auth.orgId, idempotencyKey, 'POST', '/v1/sessions', requestHash, 201, JSON.stringify(responseBody), now)
					.run()
					.catch(() => {
						// Ignore errors for idempotency key storage
					})
			);
		}

		const logger = c.get('logger');
		logger.logAudit('session.created', {
			requestId: c.get('requestId'),
			orgId: auth.orgId,
			sessionId,
			deviceId: body.device_id,
		});

		return c.json(responseBody, 201);
	});

	v1.get('/sessions/:id', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const sessionId = c.req.param('id');
		const row = await c.env.DB.prepare(
			`SELECT id, status, device_id, created_at, expires_at, ended_at FROM sessions WHERE id = ? AND org_id = ? LIMIT 1`,
		)
			.bind(sessionId, auth.orgId)
			.first<{ id: string; status: string; device_id: string; created_at: number; expires_at: number; ended_at: number | null }>();
		if (!row) throw new AppError({ status: 404, code: 'SESSION_NOT_FOUND', message: 'Session not found' });

		return c.json({
			id: row.id,
			status: row.status,
			device_id: row.device_id,
			created_at: new Date(row.created_at).toISOString(),
			expires_at: new Date(row.expires_at).toISOString(),
			ended_at: row.ended_at ? new Date(row.ended_at).toISOString() : null,
		});
	});

	v1.delete('/sessions/:id', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const sessionId = c.req.param('id');
		const now = nowMs();
		const res = await c.env.DB.prepare(
			`UPDATE sessions SET status = 'ended', ended_at = ?, updated_at = ? WHERE id = ? AND org_id = ? AND status NOT IN ('ended')`,
		)
			.bind(now, now, sessionId, auth.orgId)
			.run();
		if (!res.success) throw new AppError({ status: 404, code: 'SESSION_NOT_FOUND', message: 'Session not found' });

		const stub = c.env.SESSION_DO.getByName(sessionId);
		await stub.fetch('https://session/end', { method: 'POST', headers: { 'x-session-id': sessionId } });
		return new Response(null, { status: 204 });
	});

	v1.post('/sessions/:id/join', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const sessionId = c.req.param('id');
		const body = sessionJoinSchema.parse(await c.req.json().catch(() => ({})));
		const role = body.role ?? 'controller';

		const session = await c.env.DB.prepare(`SELECT id FROM sessions WHERE id = ? AND org_id = ? LIMIT 1`)
			.bind(sessionId, auth.orgId)
			.first<{ id: string }>();
		if (!session) throw new AppError({ status: 404, code: 'SESSION_NOT_FOUND', message: 'Session not found' });

		const joinToken = await issueSessionJoinToken(c.env, { sessionId, orgId: auth.orgId, role, ttlSeconds: 300 });
		return c.json({
			session_id: sessionId,
			join_token: joinToken,
			ws_url: wsUrlFromRequest(c.req.raw, '/v1/ws'),
		});
	});

	// --- Billing (MVP: daily aggregate read) ---
	v1.get('/billing/usage', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const day = c.req.query('day') ?? new Date().toISOString().slice(0, 10);
		const row = await c.env.DB.prepare(
			`SELECT devices_active, ai_steps, bandwidth_in_bytes, bandwidth_out_bytes
				 FROM usage_daily WHERE org_id = ? AND day = ? LIMIT 1`,
		)
			.bind(auth.orgId, day)
			.first<{ devices_active: number; ai_steps: number; bandwidth_in_bytes: number; bandwidth_out_bytes: number }>();

		return c.json({
			day,
			devices_active: row?.devices_active ?? 0,
			ai_steps: row?.ai_steps ?? 0,
			bandwidth_in_bytes: row?.bandwidth_in_bytes ?? 0,
			bandwidth_out_bytes: row?.bandwidth_out_bytes ?? 0,
		});
	});

	// --- AI (MVP stub; broadcasts plans/actions over SessionDO) ---
	v1.post('/ai/runs', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const body = aiRunCreateSchema.parse(await c.req.json());
		const runId = id('run');
		const now = nowMs();
		const nowIso = new Date(now).toISOString();

		const session = await c.env.DB.prepare(`SELECT id FROM sessions WHERE id = ? AND org_id = ? LIMIT 1`)
			.bind(body.session_id, auth.orgId)
			.first<{ id: string }>();
		if (!session) throw new AppError({ status: 404, code: 'SESSION_NOT_FOUND', message: 'Session not found' });

		await c.env.DB.prepare(
			`INSERT INTO ai_runs (id, org_id, session_id, goal, mode, status, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)`,
		)
			.bind(runId, auth.orgId, body.session_id, body.goal, body.mode ?? 'observe', now, now)
			.run();

		const stub = c.env.SESSION_DO.getByName(body.session_id);
		await stub.fetch('https://session/broadcast', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-session-id': body.session_id },
			body: JSON.stringify({
				roles: ['controller', 'observer'],
				envelope: {
					type: 'ai.status',
					ts: nowIso,
					payload: { run_id: runId, status: 'queued', goal: body.goal, mode: body.mode ?? 'observe' },
				},
			}),
		});

		return c.json({ id: runId, session_id: body.session_id, status: 'queued', created_at: nowIso }, 202);
	});

	v1.get('/ai/runs/:id', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const runId = c.req.param('id');
		const row = await c.env.DB.prepare(
			`SELECT id, session_id, status, created_at, ended_at, error_code, error_message
				 FROM ai_runs WHERE id = ? AND org_id = ? LIMIT 1`,
		)
			.bind(runId, auth.orgId)
			.first<{
				id: string;
				session_id: string;
				status: string;
				created_at: number;
				ended_at: number | null;
				error_code: string | null;
				error_message: string | null;
			}>();
		if (!row) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'AI run not found' });

		return c.json({
			id: row.id,
			session_id: row.session_id,
			status: row.status,
			created_at: new Date(row.created_at).toISOString(),
			ended_at: row.ended_at ? new Date(row.ended_at).toISOString() : null,
			error: row.error_code ? { code: row.error_code, message: row.error_message ?? 'Run failed' } : null,
		});
	});

	v1.post('/ai/steps:propose', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const body = aiProposeSchema.parse(await c.req.json());
		const planId = id('plan');
		const runId = id('run');
		const now = nowMs();
		const nowIso = new Date(now).toISOString();

		const session = await c.env.DB.prepare(`SELECT id FROM sessions WHERE id = ? AND org_id = ? LIMIT 1`)
			.bind(body.session_id, auth.orgId)
			.first<{ id: string }>();
		if (!session) throw new AppError({ status: 404, code: 'SESSION_NOT_FOUND', message: 'Session not found' });

		const actions = [
			{
				action_id: id('act'),
				type: 'screenshot',
				args: { format: 'png' },
				requires_confirmation: false,
				confidence: 0.5,
			},
		];

		const stub = c.env.SESSION_DO.getByName(body.session_id);
		await stub.fetch('https://session/broadcast', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-session-id': body.session_id },
			body: JSON.stringify({
				roles: ['controller', 'observer'],
				envelope: {
					type: 'ai.status',
					ts: nowIso,
					payload: { run_id: runId, status: 'awaiting_confirmation', plan_id: planId, goal: body.goal, actions },
				},
			}),
		});

		await c.env.DB.prepare(
			`INSERT INTO ai_runs (id, org_id, session_id, goal, mode, status, created_at, updated_at)
				 VALUES (?, ?, ?, ?, 'control', 'awaiting_confirmation', ?, ?)`,
		)
			.bind(runId, auth.orgId, body.session_id, body.goal, now, now)
			.run();

		return c.json({ run_id: runId, plan_id: planId, status: 'awaiting_confirmation', actions });
	});

	v1.post('/ai/steps:approve', async (c) => {
		const auth = c.get('auth');
		if (!auth) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

		const body = aiApproveSchema.parse(await c.req.json());
		const now = nowMs();
		const nowIso = new Date(now).toISOString();
		const stub = c.env.SESSION_DO.getByName(body.session_id);

		// Inform UI that execution started.
		await stub.fetch('https://session/broadcast', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-session-id': body.session_id },
			body: JSON.stringify({
				roles: ['controller', 'observer'],
				envelope: {
					type: 'ai.status',
					ts: nowIso,
					payload: { run_id: body.run_id, status: 'running', plan_id: body.plan_id },
				},
			}),
		});

		await c.env.DB.prepare(`UPDATE ai_runs SET status = 'running', updated_at = ? WHERE id = ? AND org_id = ?`)
			.bind(now, body.run_id, auth.orgId)
			.run();

		// Send actions to agent.
		for (const action of body.actions) {
			await stub.fetch('https://session/broadcast', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-session-id': body.session_id },
				body: JSON.stringify({
					roles: ['agent'],
					envelope: { type: 'action', ts: nowIso, payload: { run_id: body.run_id, action } },
				}),
			});
		}

		return c.json({ ok: true });
	});

	// --- WebSocket (forward upgrade to SessionDO) ---
	v1.get('/ws', async (c) => {
		if (c.req.header('Upgrade') !== 'websocket') {
			return c.text('Upgrade required', 426);
		}
		const url = new URL(c.req.url);
		const authHeader = c.req.header('Authorization') ?? '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : url.searchParams.get('token');
		if (!token) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Missing bearer token' });

		// SECURITY: Verify JWT signature before trusting payload
		if (!c.env.SESSION_JWT_SECRET) {
			throw new AppError({ status: 500, code: 'INTERNAL_ERROR', message: 'SESSION_JWT_SECRET not set' });
		}

		let payload;
		try {
			payload = await verifyJwtHs256(token, c.env.SESSION_JWT_SECRET);
		} catch {
			throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
		}

		const sessionId = typeof payload?.session_id === 'string' ? payload.session_id : null;
		if (!sessionId) throw new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Invalid token' });

		const stub = c.env.SESSION_DO.getByName(sessionId);
		return stub.fetch(c.req.raw);
	});

	return v1;
}

function clampInt(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.max(min, Math.min(max, Math.trunc(value)));
}

function safeParseJsonArray(value: string | null): string[] {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value) as unknown;
		return Array.isArray(parsed) ? (parsed.filter((x) => typeof x === 'string') as string[]) : [];
	} catch {
		return [];
	}
}

function wsUrlFromRequest(request: Request, pathname: string): string {
	const url = new URL(request.url);
	url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
	url.pathname = pathname;
	url.search = '';
	url.hash = '';
	return url.toString();
}

function encodeCursor(value: { created_at: number; id: string }): string {
	return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function decodeCursor(cursor: string): { created_at: number; id: string } | null {
	const base64 = cursor
		.replaceAll('-', '+')
		.replaceAll('_', '/')
		.padEnd(Math.ceil(cursor.length / 4) * 4, '=');
	try {
		const parsed = JSON.parse(atob(base64)) as { created_at: number; id: string };
		if (!parsed || typeof parsed.created_at !== 'number' || typeof parsed.id !== 'string') return null;
		return parsed;
	} catch {
		return null;
	}
}

async function issueSessionJoinToken(
	env: Env,
	opts: { sessionId: string; orgId: string; role: 'controller' | 'observer' | 'agent'; ttlSeconds: number },
) {
	if (!env.SESSION_JWT_SECRET) throw new AppError({ status: 500, code: 'INTERNAL_ERROR', message: 'SESSION_JWT_SECRET not set' });
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + opts.ttlSeconds;
	return signJwtHs256(
		{
			typ: 'session_join',
			session_id: opts.sessionId,
			org_id: opts.orgId,
			role: opts.role,
			iat,
			exp,
		},
		env.SESSION_JWT_SECRET,
	);
}

async function enforceRateLimit(env: Env, orgId: string, key: string, limit: number, windowSeconds: number) {
	// Best-effort rate limiting. If DO is unavailable, fail open to avoid hard outages.
	if (env.ENVIRONMENT === 'test') return;
	try {
		const stub = env.RATE_LIMIT_DO.getByName(orgId);
		const response = await withTimeout(
			stub.fetch('https://ratelimit/check', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ key, limit, windowSeconds }),
			}),
			3000,
			'Rate limit check timeout'
		);

		if (!response.ok) return;
		const data = (await response.json()) as { allowed?: boolean; limit?: number; remaining?: number; reset?: number };
		if (data.allowed === false) {
			throw new AppError({
				status: 429,
				code: 'RATE_LIMITED',
				message: 'Rate limited',
				details: { key, limit: data.limit, remaining: data.remaining, reset: data.reset },
			});
		}
	} catch (err) {
		if (err instanceof AppError) throw err;
		// Fail open on errors
	}
}

async function applySqlBatch(db: D1Database, sql: string) {
	const stripped = sql
		.split('\n')
		.map((line) => line.replace(/--.*$/g, '').trimEnd())
		.join('\n');

	const statements = stripped
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	if (statements.length === 0) return;
	await db.batch(statements.map((s) => db.prepare(s)));
}
