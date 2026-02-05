import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from './env';
import { errorResponse, isAppError, AppError } from './lib/errors';
import { createV1App } from './routes/v1';
import { applySecurityHeaders, getClientIp, isValidUserAgent } from './lib/security';
import { createLogger } from './lib/logger';
import { MAX_REQUEST_SIZE } from './lib/validation';
import { id } from './lib/id';

import { SessionDO } from './do/SessionDO';
import { DeviceDO } from './do/DeviceDO';
import { RateLimitDO } from './do/RateLimitDO';

type App = {
	Bindings: Env;
	Variables: {
		requestId: string;
		startTime: number;
		logger: ReturnType<typeof createLogger>;
	};
};

const app = new Hono<App>();

app.onError((err, c) => handleError(err, c));

// Request ID and timing middleware
app.use('*', async (c, next) => {
	const requestId = c.req.header('x-request-id') ?? id('req');
	const startTime = Date.now();
	const logger = createLogger(c.env);

	c.set('requestId', requestId);
	c.set('startTime', startTime);
	c.set('logger', logger);

	await next();

	// Log request
	const duration = Date.now() - startTime;
	logger.logRequest({
		requestId,
		method: c.req.method,
		path: c.req.path,
		status: c.res.status,
		duration,
	});

	// Add request ID to response
	try {
		c.res.headers.set('x-request-id', requestId);
	} catch {
		// Immutable headers (e.g., WebSocket upgrade)
	}
});

// Security headers middleware
app.use('*', async (c, next) => {
	await next();

	try {
		applySecurityHeaders(c.res.headers, c.env);
	} catch {
		// Immutable headers
	}
});

// Request validation middleware
app.use('*', async (c, next) => {
	// Validate User-Agent
	const userAgent = c.req.header('user-agent') ?? null;
	if (!isValidUserAgent(userAgent)) {
		const logger = c.get('logger');
		logger.logSecurity('Invalid User-Agent', {
			requestId: c.get('requestId'),
			userAgent: userAgent?.slice(0, 100),
		});
	}

	// Validate request size for POST/PUT/PATCH
	if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
		const contentLength = c.req.header('content-length');
		if (contentLength) {
			const size = parseInt(contentLength, 10);
			if (size > MAX_REQUEST_SIZE) {
				throw new AppError({
					status: 413,
					code: 'REQUEST_TOO_LARGE',
					message: `Request body too large. Maximum size: ${MAX_REQUEST_SIZE} bytes`,
				});
			}
		}
	}

	await next();
});

// CORS middleware
app.use('*', async (c, next) => {
	const origin = c.req.header('origin');
	const allowOrigin = getAllowedCorsOrigin(c.env, origin);

	// Preflight
	if (c.req.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: corsHeaders(allowOrigin),
		});
	}

	await next();

	// Best-effort headers (some responses have immutable headers).
	try {
		const headers = corsHeaders(allowOrigin);
		for (const [k, v] of headers) c.res.headers.set(k, v);
	} catch {
		// ignore
	}
});

// Mount v1 at both /v1 and /api/v1 to satisfy docs variants.
const v1 = createV1App();
app.route('/v1', v1);
app.route('/api/v1', v1);

app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404));

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		void ctx;
		return app.fetch(request, env);
	},
} satisfies ExportedHandler<Env>;

export { SessionDO, DeviceDO, RateLimitDO };

function handleError(err: unknown, c: Context) {
	const requestId = (() => {
		try {
			return (c.get as (k: string) => string | undefined)('requestId');
		} catch {
			return crypto.randomUUID();
		}
	})();

	const logger = (() => {
		try {
			return (c.get as (k: string) => ReturnType<typeof createLogger> | undefined)('logger');
		} catch {
			return undefined;
		}
	})();

	if (isAppError(err)) {
		if (err.status >= 500) {
			logger?.error('Application error', { requestId, code: err.code, message: err.message, details: err.details });
		} else {
			logger?.warn('Client error', { requestId, code: err.code, message: err.message });
		}
		return errorResponse({ status: err.status, code: err.code, message: err.message, requestId, details: err.details });
	}

	// Zod validation
	if (typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'ZodError') {
		logger?.warn('Validation error', { requestId, issues: (err as { issues?: unknown }).issues });
		return errorResponse({
			status: 400,
			code: 'VALIDATION_ERROR',
			message: 'Validation error',
			requestId,
			details: { issues: (err as { issues?: unknown }).issues },
		});
	}

	// Unhandled errors
	logger?.error('Unhandled error', { requestId, error: err });
	return errorResponse({
		status: 500,
		code: 'INTERNAL_ERROR',
		message: 'Internal error',
		requestId,
	});
}

function corsHeaders(allowOrigin: string | null): Headers {
	const headers = new Headers();
	if (allowOrigin) {
		headers.set('Access-Control-Allow-Origin', allowOrigin);
		headers.append('Vary', 'Origin');
	}
	headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
	headers.set(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, X-API-Key, Idempotency-Key, X-Request-Id, X-Dev-Bootstrap-Token',
	);
	headers.set('Access-Control-Max-Age', '86400');
	headers.set('Access-Control-Expose-Headers', 'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
	return headers;
}

function getAllowedCorsOrigin(env: Env, origin: string | null | undefined): string | null {
	if (!origin) return null;
	const configured = (env.CORS_ORIGINS ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	if (configured.includes(origin)) return origin;

	// SECURITY: Never allow wildcard in production
	const environment = env.ENVIRONMENT ?? 'dev';
	if (environment === 'prod' || environment === 'production') {
		return null; // Production must use explicit whitelist
	}

	// SECURITY: Wildcard only in non-production
	if (configured.includes('*')) return origin;

	if (environment !== 'prod' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) return origin;
	return null;
}
