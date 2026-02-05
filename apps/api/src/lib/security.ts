import type { Context } from 'hono';
import type { Env } from '../env';
import { AppError } from './errors';

/**
 * Security headers for all responses
 */
export function getSecurityHeaders(): Record<string, string> {
	return {
		// Prevent MIME type sniffing
		'X-Content-Type-Options': 'nosniff',
		// Prevent clickjacking
		'X-Frame-Options': 'DENY',
		// XSS protection (legacy but still useful)
		'X-XSS-Protection': '1; mode=block',
		// Referrer policy
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		// Content Security Policy
		'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
		// Permissions policy
		'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
		// HSTS (only in production)
		// 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	};
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(headers: Headers, env: Env): void {
	const securityHeaders = getSecurityHeaders();

	// Add HSTS only in production
	if (env.ENVIRONMENT === 'prod') {
		securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
	}

	for (const [key, value] of Object.entries(securityHeaders)) {
		headers.set(key, value);
	}
}

/**
 * Validate request size
 */
export function validateRequestSize(contentLength: string | null, maxSize: number): void {
	if (contentLength) {
		const size = parseInt(contentLength, 10);
		if (size > maxSize) {
			throw new AppError({
				status: 413,
				code: 'REQUEST_TOO_LARGE',
				message: `Request body too large. Maximum size: ${maxSize} bytes`,
			});
		}
	}
}

/**
 * Rate limit configuration per endpoint
 */
export const RATE_LIMITS = {
	// Authentication endpoints
	'auth:login': { limit: 5, windowSeconds: 60 },
	'auth:register': { limit: 3, windowSeconds: 3600 },

	// Session endpoints
	'sessions:create': { limit: 30, windowSeconds: 60 },
	'sessions:join': { limit: 50, windowSeconds: 60 },

	// Device endpoints
	'devices:register': { limit: 10, windowSeconds: 60 },
	'devices:pair': { limit: 5, windowSeconds: 60 },

	// AI endpoints
	'ai:runs': { limit: 20, windowSeconds: 60 },
	'ai:propose': { limit: 30, windowSeconds: 60 },

	// Default
	default: { limit: 100, windowSeconds: 60 },
} as const;

/**
 * Get rate limit for endpoint
 */
export function getRateLimit(endpoint: string): { limit: number; windowSeconds: number } {
	return RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] ?? RATE_LIMITS.default;
}

/**
 * Validate IP address format
 */
export function isValidIp(ip: string): boolean {
	// IPv4
	const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
	if (ipv4Regex.test(ip)) {
		const parts = ip.split('.');
		return parts.every((part) => {
			const num = parseInt(part, 10);
			return num >= 0 && num <= 255;
		});
	}

	// IPv6 (simplified check)
	const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
	return ipv6Regex.test(ip);
}

/**
 * Extract client IP from request
 */
export function getClientIp(request: Request): string | null {
	// Cloudflare provides CF-Connecting-IP
	const cfIp = request.headers.get('cf-connecting-ip');
	if (cfIp && isValidIp(cfIp)) return cfIp;

	// Fallback to X-Forwarded-For (first IP)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		const firstIp = forwardedFor.split(',')[0].trim();
		if (isValidIp(firstIp)) return firstIp;
	}

	// Fallback to X-Real-IP
	const realIp = request.headers.get('x-real-ip');
	if (realIp && isValidIp(realIp)) return realIp;

	return null;
}

/**
 * Hash IP address for privacy
 */
export async function hashIp(ip: string, salt: string = ''): Promise<string> {
	const data = `${ip}:${salt}`;
	const bytes = new TextEncoder().encode(data);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	const hashArray = Array.from(new Uint8Array(digest));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate User-Agent
 */
export function isValidUserAgent(userAgent: string | null): boolean {
	if (!userAgent) return false;
	if (userAgent.length > 500) return false;
	// Check for suspicious patterns
	const suspiciousPatterns = [/sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /metasploit/i];
	return !suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Check if request is from a bot (basic check)
 */
export function isLikelyBot(userAgent: string | null): boolean {
	if (!userAgent) return true;
	const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /java/i];
	return botPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Validate request origin
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
	if (!origin) return true; // No origin header is OK for non-browser requests

	// Check exact match
	if (allowedOrigins.includes(origin)) return true;

	// Check wildcard
	if (allowedOrigins.includes('*')) return true;

	return false;
}

/**
 * Generate secure random token
 */
export function generateSecureToken(prefix: string, length: number = 32): string {
	const randomPart = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
	return `${prefix}_${randomPart.slice(0, length)}`;
}

/**
 * Timing-safe string comparison
 */
export function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	const aBytes = new TextEncoder().encode(a);
	const bBytes = new TextEncoder().encode(b);

	let result = 0;
	for (let i = 0; i < aBytes.length; i++) {
		result |= aBytes[i] ^ bBytes[i];
	}

	return result === 0;
}

/**
 * Validate webhook signature
 */
export async function validateWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

	const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	const expectedSignature = Array.from(new Uint8Array(signatureBytes))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return timingSafeEqual(signature, expectedSignature);
}

/**
 * Check if environment is production
 */
export function isProduction(env: Env): boolean {
	return env.ENVIRONMENT === 'prod' || env.ENVIRONMENT === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment(env: Env): boolean {
	return env.ENVIRONMENT === 'dev' || env.ENVIRONMENT === 'development' || !env.ENVIRONMENT;
}
