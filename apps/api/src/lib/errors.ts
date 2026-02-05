export type ErrorCode =
	| 'VALIDATION_ERROR'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'CONFLICT'
	| 'RATE_LIMITED'
	| 'INTERNAL_ERROR'
	| 'IDEMPOTENCY_KEY_REUSED'
	| 'SESSION_NOT_FOUND'
	| 'DEVICE_NOT_FOUND'
	| 'DEVICE_OFFLINE'
	| 'REQUEST_TOO_LARGE'
	| 'TIMEOUT'
	| 'SERVICE_UNAVAILABLE'
	| 'BAD_GATEWAY'
	| 'CIRCUIT_BREAKER_OPEN';

export class AppError extends Error {
	public readonly status: number;
	public readonly code: ErrorCode;
	public readonly details?: Record<string, unknown>;

	constructor(opts: { status: number; code: ErrorCode; message: string; details?: Record<string, unknown> }) {
		super(opts.message);
		this.name = 'AppError';
		this.status = opts.status;
		this.code = opts.code;
		this.details = opts.details;
	}
}

export function errorResponse(opts: {
	status: number;
	code: ErrorCode;
	message: string;
	requestId?: string;
	details?: Record<string, unknown>;
}) {
	return new Response(
		JSON.stringify({
			error: {
				code: opts.code,
				message: opts.message,
				request_id: opts.requestId,
				details: opts.details,
			},
		}),
		{
			status: opts.status,
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'x-request-id': opts.requestId ?? '',
			},
		},
	);
}

export function isAppError(err: unknown): err is AppError {
	return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AppError';
}
