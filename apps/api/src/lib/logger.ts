import type { Env } from '../env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
	requestId?: string;
	orgId?: string;
	userId?: string;
	deviceId?: string;
	sessionId?: string;
	method?: string;
	path?: string;
	status?: number;
	duration?: number;
	error?: unknown;
	[key: string]: unknown;
}

export class Logger {
	private readonly env: Env;
	private readonly serviceName: string;
	private readonly environment: string;
	private readonly logLevel: LogLevel;

	constructor(env: Env) {
		this.env = env;
		this.serviceName = env.SERVICE_NAME ?? 'api';
		this.environment = env.ENVIRONMENT ?? 'dev';
		this.logLevel = (env.LOG_LEVEL as LogLevel) ?? 'info';
	}

	debug(message: string, context?: LogContext): void {
		if (this.shouldLog('debug')) {
			this.log('debug', message, context);
		}
	}

	info(message: string, context?: LogContext): void {
		if (this.shouldLog('info')) {
			this.log('info', message, context);
		}
	}

	warn(message: string, context?: LogContext): void {
		if (this.shouldLog('warn')) {
			this.log('warn', message, context);
		}
	}

	error(message: string, context?: LogContext): void {
		if (this.shouldLog('error')) {
			this.log('error', message, context);
		}
	}

	/**
	 * Log API request/response
	 */
	logRequest(context: LogContext): void {
		const { method, path, status, duration, requestId } = context;
		const level = status && status >= 500 ? 'error' : status && status >= 400 ? 'warn' : 'info';

		this.log(level, `${method} ${path} ${status}`, {
			...context,
			type: 'http_request',
			duration_ms: duration,
		});
	}

	/**
	 * Log audit event
	 */
	logAudit(action: string, context: LogContext): void {
		this.log('info', `Audit: ${action}`, {
			...context,
			type: 'audit',
			action,
		});
	}

	/**
	 * Log security event
	 */
	logSecurity(event: string, context: LogContext): void {
		this.log('warn', `Security: ${event}`, {
			...context,
			type: 'security',
			event,
		});
	}

	/**
	 * Log performance metric
	 */
	logMetric(metric: string, value: number, context?: LogContext): void {
		this.log('info', `Metric: ${metric}`, {
			...context,
			type: 'metric',
			metric,
			value,
		});
	}

	private shouldLog(level: LogLevel): boolean {
		const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
		const currentLevelIndex = levels.indexOf(this.logLevel);
		const messageLevelIndex = levels.indexOf(level);
		return messageLevelIndex >= currentLevelIndex;
	}

	private log(level: LogLevel, message: string, context?: LogContext): void {
		const logEntry = {
			timestamp: new Date().toISOString(),
			level,
			service: this.serviceName,
			environment: this.environment,
			message,
			...this.sanitizeContext(context),
		};

		const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
		logFn(JSON.stringify(logEntry));
	}

	private sanitizeContext(context?: LogContext): LogContext {
		if (!context) return {};

		const sanitized: LogContext = {};
		for (const [key, value] of Object.entries(context)) {
			// Redact sensitive fields
			if (this.isSensitiveField(key)) {
				sanitized[key] = '[REDACTED]';
			} else if (value instanceof Error) {
				sanitized[key] = {
					name: value.name,
					message: value.message,
					stack: this.environment === 'dev' ? value.stack : undefined,
				};
			} else if (typeof value === 'object' && value !== null) {
				// Limit object depth
				sanitized[key] = JSON.stringify(value).slice(0, 1000);
			} else {
				sanitized[key] = value;
			}
		}
		return sanitized;
	}

	private isSensitiveField(key: string): boolean {
		const sensitivePatterns = ['password', 'secret', 'token', 'key', 'auth', 'credential', 'api_key', 'apikey', 'bearer'];
		const lowerKey = key.toLowerCase();
		return sensitivePatterns.some((pattern) => lowerKey.includes(pattern));
	}
}

/**
 * Create logger instance
 */
export function createLogger(env: Env): Logger {
	return new Logger(env);
}
