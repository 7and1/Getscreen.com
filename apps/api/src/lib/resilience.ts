import { AppError } from './errors';

/**
 * Circuit breaker states
 */
type CircuitState = 'closed' | 'open' | 'half-open';

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerConfig {
	failureThreshold: number; // Number of failures before opening
	successThreshold: number; // Number of successes to close from half-open
	timeout: number; // Time in ms before attempting to close
	monitoringPeriod: number; // Time window for failure counting
}

/**
 * Circuit breaker for external calls
 */
export class CircuitBreaker {
	private state: CircuitState = 'closed';
	private failureCount = 0;
	private successCount = 0;
	private lastFailureTime = 0;
	private nextAttemptTime = 0;

	constructor(
		private readonly name: string,
		private readonly config: CircuitBreakerConfig,
	) {}

	async execute<T>(fn: () => Promise<T>): Promise<T> {
		if (this.state === 'open') {
			if (Date.now() < this.nextAttemptTime) {
				throw new AppError({
					status: 503,
					code: 'INTERNAL_ERROR',
					message: `Circuit breaker open for ${this.name}`,
					details: { circuit: this.name, state: this.state },
				});
			}
			// Transition to half-open
			this.state = 'half-open';
			this.successCount = 0;
		}

		try {
			const result = await fn();
			this.onSuccess();
			return result;
		} catch (error) {
			this.onFailure();
			throw error;
		}
	}

	private onSuccess(): void {
		this.failureCount = 0;

		if (this.state === 'half-open') {
			this.successCount++;
			if (this.successCount >= this.config.successThreshold) {
				this.state = 'closed';
				this.successCount = 0;
			}
		}
	}

	private onFailure(): void {
		this.lastFailureTime = Date.now();
		this.failureCount++;

		if (this.state === 'half-open') {
			this.state = 'open';
			this.nextAttemptTime = Date.now() + this.config.timeout;
			this.successCount = 0;
		} else if (this.failureCount >= this.config.failureThreshold) {
			this.state = 'open';
			this.nextAttemptTime = Date.now() + this.config.timeout;
		}
	}

	getState(): CircuitState {
		return this.state;
	}

	reset(): void {
		this.state = 'closed';
		this.failureCount = 0;
		this.successCount = 0;
		this.lastFailureTime = 0;
		this.nextAttemptTime = 0;
	}
}

/**
 * Retry configuration
 */
interface RetryConfig {
	maxAttempts: number;
	initialDelay: number; // ms
	maxDelay: number; // ms
	backoffMultiplier: number;
	retryableErrors?: (error: unknown) => boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxAttempts: 3,
	initialDelay: 100,
	maxDelay: 5000,
	backoffMultiplier: 2,
};

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, config: Partial<RetryConfig> = {}): Promise<T> {
	const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
	let lastError: unknown;
	let delay = cfg.initialDelay;

	for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			// Check if error is retryable
			if (cfg.retryableErrors && !cfg.retryableErrors(error)) {
				throw error;
			}

			// Don't retry on last attempt
			if (attempt === cfg.maxAttempts) {
				break;
			}

			// Wait before retry
			await sleep(delay);

			// Exponential backoff with jitter
			delay = Math.min(delay * cfg.backoffMultiplier, cfg.maxDelay);
			delay = delay * (0.5 + Math.random() * 0.5); // Add jitter
		}
	}

	throw lastError;
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage = 'Operation timed out'): Promise<T> {
	const timeoutPromise = new Promise<never>((_, reject) => {
		setTimeout(() => {
			reject(
				new AppError({
					status: 504,
					code: 'INTERNAL_ERROR',
					message: errorMessage,
					details: { timeout: timeoutMs },
				}),
			);
		}, timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch processor with concurrency control
 */
export class BatchProcessor<T, R> {
	constructor(
		private readonly processFn: (item: T) => Promise<R>,
		private readonly concurrency: number = 5,
	) {}

	async process(items: T[]): Promise<R[]> {
		const results: R[] = [];
		const queue = [...items];
		const inProgress: Promise<void>[] = [];

		while (queue.length > 0 || inProgress.length > 0) {
			// Start new tasks up to concurrency limit
			while (inProgress.length < this.concurrency && queue.length > 0) {
				const item = queue.shift()!;
				const task = this.processFn(item)
					.then((result) => {
						results.push(result);
					})
					.finally(() => {
						const index = inProgress.indexOf(task);
						if (index > -1) inProgress.splice(index, 1);
					});
				inProgress.push(task);
			}

			// Wait for at least one task to complete
			if (inProgress.length > 0) {
				await Promise.race(inProgress);
			}
		}

		return results;
	}
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delayMs: number): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delayMs);
	};
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, limitMs: number): (...args: Parameters<T>) => void {
	let lastRun = 0;

	return (...args: Parameters<T>) => {
		const now = Date.now();
		if (now - lastRun >= limitMs) {
			lastRun = now;
			fn(...args);
		}
	};
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
	if (error instanceof AppError) {
		// Retry on 5xx errors and 429 (rate limit)
		return error.status >= 500 || error.status === 429;
	}

	// Retry on network errors
	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		return message.includes('network') || message.includes('timeout') || message.includes('econnrefused') || message.includes('enotfound');
	}

	return false;
}

/**
 * Create circuit breaker with default config
 */
export function createCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
	const defaultConfig: CircuitBreakerConfig = {
		failureThreshold: 5,
		successThreshold: 2,
		timeout: 60000, // 1 minute
		monitoringPeriod: 120000, // 2 minutes
	};

	return new CircuitBreaker(name, { ...defaultConfig, ...config });
}

/**
 * Global circuit breakers registry
 */
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create circuit breaker
 */
export function getCircuitBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
	if (!circuitBreakers.has(name)) {
		circuitBreakers.set(name, createCircuitBreaker(name, config));
	}
	return circuitBreakers.get(name)!;
}
