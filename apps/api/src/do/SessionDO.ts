import type { Env } from '../env';
import { AppError, errorResponse } from '../lib/errors';
import { decodeJwtPayloadUnsafe, verifyJwtHs256 } from '../lib/jwt';

type Role = 'controller' | 'observer' | 'agent';

type JoinClaims = {
	typ: 'session_join';
	session_id: string;
	org_id: string;
	role: Role;
	sub?: string;
	exp?: number;
	iat?: number;
};

type WsEnvelope = {
	type: string;
	id?: string;
	ts?: string;
	session_id?: string;
	payload?: unknown;
};

export class SessionDO implements DurableObject {
	private readonly state: DurableObjectState;
	private readonly env: Env;

	private sessionId: string | null = null;
	private sockets = new Map<string, { role: Role; ws: WebSocket; lastPing: number }>();
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.startHeartbeat();
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (request.headers.get('Upgrade') === 'websocket') {
			// SECURITY: Validate WebSocket origin
			const origin = request.headers.get('Origin');
			if (origin && !this.isOriginAllowed(origin)) {
				return errorResponse({ status: 403, code: 'FORBIDDEN', message: 'Origin not allowed' });
			}

			const url = new URL(request.url);
			const authHeader = request.headers.get('Authorization') || '';
			const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : url.searchParams.get('token');
			if (!token) {
				return errorResponse({ status: 401, code: 'UNAUTHORIZED', message: 'Missing bearer token' });
			}

			let claims: JoinClaims;
			try {
				claims = await this.verifyJoinToken(token);
			} catch {
				return errorResponse({ status: 401, code: 'UNAUTHORIZED', message: 'Invalid token' });
			}

			this.sessionId = claims.session_id;

			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair);
			server.accept();

			const connId = crypto.randomUUID();
			const now = Date.now();
			this.sockets.set(connId, { role: claims.role, ws: server, lastPing: now });
			this.debug('ws.open', { role: claims.role, session_id: claims.session_id, connections: this.sockets.size });

			server.addEventListener('message', (event) => {
				void this.handleMessage(connId, event.data);
			});

			server.addEventListener('close', () => {
				this.sockets.delete(connId);
				void this.broadcast({
					type: 'session.status',
					session_id: claims.session_id,
					payload: { status: 'participant_left', role: claims.role },
				});
			});

			server.addEventListener('error', () => {
				this.sockets.delete(connId);
			});

			void this.broadcast({
				type: 'session.status',
				session_id: claims.session_id,
				payload: { status: 'participant_joined', role: claims.role },
			});

			return new Response(null, { status: 101, webSocket: client });
		}

		if (request.method === 'POST' && url.pathname === '/end') {
			const hinted = request.headers.get('x-session-id');
			if (!this.sessionId && hinted) this.sessionId = hinted;
			await this.broadcast({ type: 'session.ended', session_id: this.sessionId ?? undefined, payload: {} });
			for (const { ws } of this.sockets.values()) ws.close(1000, 'session ended');
			this.sockets.clear();
			this.stopHeartbeat();
			return new Response(null, { status: 204 });
		}

		if (request.method === 'POST' && url.pathname === '/broadcast') {
			const hinted = request.headers.get('x-session-id');
			if (!this.sessionId && hinted) this.sessionId = hinted;
			const body = (await request.json().catch(() => null)) as { roles?: unknown; envelope?: WsEnvelope } | null;
			if (!body || !body.envelope || typeof body.envelope.type !== 'string') return new Response('bad request', { status: 400 });
			const roles = Array.isArray(body.roles)
				? (body.roles.filter((r) => r === 'controller' || r === 'observer' || r === 'agent') as Role[])
				: null;
			if (!roles || roles.length === 0) return new Response('bad request', { status: 400 });
			this.sendToRoles(roles, { ...body.envelope, session_id: this.sessionId ?? body.envelope.session_id ?? 'unknown' });
			return new Response(null, { status: 204 });
		}

		if (request.method === 'GET' && url.pathname === '/') {
			const hinted = request.headers.get('x-session-id');
			if (!this.sessionId && hinted) this.sessionId = hinted;
			const counts = { controller: 0, observer: 0, agent: 0 };
			for (const s of this.sockets.values()) counts[s.role] += 1;
			return new Response(JSON.stringify({ session_id: this.sessionId ?? undefined, connections: counts }), {
				status: 200,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response('not found', { status: 404 });
	}

	private async verifyJoinToken(token: string): Promise<JoinClaims> {
		const secret = this.env.SESSION_JWT_SECRET;
		if (!secret) throw new AppError({ status: 500, code: 'INTERNAL_ERROR', message: 'SESSION_JWT_SECRET not set' });
		const payload = await verifyJwtHs256(token, secret);
		if (payload.typ !== 'session_join') throw new Error('wrong typ');
		return payload as unknown as JoinClaims;
	}

	private async handleMessage(connId: string, data: string | ArrayBuffer) {
		const sender = this.sockets.get(connId);
		if (!sender) return;

		// Update last ping time
		sender.lastPing = Date.now();

		// SECURITY: Enforce message size limit (1MB)
		const size = typeof data === 'string' ? data.length : (data as ArrayBuffer).byteLength;
		if (size > 1024 * 1024) {
			sender.ws.close(1009, 'Message too large');
			this.sockets.delete(connId);
			return;
		}

		const message = this.parseEnvelope(data);
		if (!message) return;

		this.debug('ws.in', { from: sender.role, type: message.type });

		// Basic heartbeat
		if (message.type === 'ping') {
			sender.ws.send(JSON.stringify({ type: 'pong', ts: new Date().toISOString() }));
			return;
		}

		const sessionId = this.sessionId ?? 'unknown';
		const envelope: WsEnvelope = {
			...message,
			session_id: sessionId,
		};

		// fanout rules (Phase 1): controller <-> agent, observers receive broadcasts
		if (sender.role === 'agent') {
			this.debug('ws.fanout', { from: sender.role, to: ['controller', 'observer'], type: envelope.type });
			this.sendToRoles(['controller', 'observer'], envelope);
			return;
		}

		if (sender.role === 'controller') {
			this.debug('ws.fanout', { from: sender.role, to: ['agent'], type: envelope.type });
			this.sendToRoles(['agent'], envelope);
			return;
		}

		// observer: read-only by default
		if (sender.role === 'observer') {
			sender.ws.send(
				JSON.stringify({
					type: 'error',
					session_id: sessionId,
					payload: { code: 'FORBIDDEN', message: 'Observer cannot send messages' },
				}),
			);
		}
	}

	private parseEnvelope(data: string | ArrayBuffer): WsEnvelope | null {
		try {
			const text = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer);
			const parsed = JSON.parse(text) as WsEnvelope;
			if (!parsed || typeof parsed.type !== 'string') return null;
			return parsed;
		} catch {
			return null;
		}
	}

	private sendToRoles(roles: Role[], envelope: WsEnvelope) {
		const payload = JSON.stringify(envelope);
		let sent = 0;
		for (const { role, ws } of this.sockets.values()) {
			if (roles.includes(role)) {
				try {
					ws.send(payload);
					sent += 1;
				} catch (error) {
					this.debug('ws.send.error', { role, error });
				}
			}
		}
		this.debug('ws.out', { type: envelope.type, to: roles, sent });
	}

	private async broadcast(envelope: WsEnvelope) {
		const payload = JSON.stringify(envelope);
		for (const { ws } of this.sockets.values()) {
			try {
				ws.send(payload);
			} catch (error) {
				this.debug('ws.broadcast.error', { error });
			}
		}
	}

	private startHeartbeat() {
		if (this.heartbeatInterval) return;

		this.heartbeatInterval = setInterval(() => {
			const now = Date.now();
			const toRemove: string[] = [];
			const CONNECTION_TIMEOUT = 90000; // 90 seconds

			// Check for stale connections
			for (const [connId, conn] of this.sockets.entries()) {
				if (now - conn.lastPing > CONNECTION_TIMEOUT) {
					this.debug('ws.timeout', { connId, role: conn.role });
					toRemove.push(connId);
					try {
						conn.ws.close(1000, 'Connection timeout');
					} catch {
						// Ignore close errors
					}
				}
			}

			// Remove stale connections
			for (const connId of toRemove) {
				this.sockets.delete(connId);
			}

			// Send heartbeat to all active connections
			const heartbeat = JSON.stringify({ type: 'heartbeat', ts: new Date().toISOString() });
			for (const { ws } of this.sockets.values()) {
				try {
					ws.send(heartbeat);
				} catch {
					// Ignore send errors
				}
			}
		}, 30000); // 30 seconds
	}

	private stopHeartbeat() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	private debug(message: string, data?: unknown) {
		if (this.env.LOG_LEVEL !== 'debug') return;
		// eslint-disable-next-line no-console
		console.log(`[SessionDO] ${message}`, data ?? '');
	}

	private isOriginAllowed(origin: string): boolean {
		// SECURITY: Validate WebSocket origin against CORS whitelist
		const configured = (this.env.CORS_ORIGINS ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		if (configured.includes(origin)) return true;

		// Allow wildcard only in non-production
		const environment = this.env.ENVIRONMENT ?? 'dev';
		if (environment !== 'prod' && environment !== 'production') {
			if (configured.includes('*')) return true;
			if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
		}

		return false;
	}
}
