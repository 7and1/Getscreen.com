import { z } from 'zod';

// Request size limits (bytes)
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_JSON_DEPTH = 10;
export const MAX_ARRAY_LENGTH = 1000;
export const MAX_STRING_LENGTH = 10000;
export const MAX_OBJECT_KEYS = 100;

// Sanitization patterns
const SQL_INJECTION_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi;
const XSS_PATTERN = /<script|javascript:|onerror=|onload=/gi;
const PATH_TRAVERSAL_PATTERN = /\.\.[\/\\]/g;
const NULL_BYTE_PATTERN = /\0/g;

/**
 * Sanitize text input to prevent injection attacks
 */
export function sanitizeText(input: string): string {
	if (typeof input !== 'string') return '';

	// Remove null bytes
	let sanitized = input.replace(NULL_BYTE_PATTERN, '');

	// Trim and limit length
	sanitized = sanitized.trim().slice(0, MAX_STRING_LENGTH);

	return sanitized;
}

/**
 * Validate that text doesn't contain dangerous patterns
 */
export function validateSafeText(input: string): boolean {
	if (typeof input !== 'string') return false;

	// Check for SQL injection patterns
	if (SQL_INJECTION_PATTERN.test(input)) return false;

	// Check for XSS patterns
	if (XSS_PATTERN.test(input)) return false;

	// Check for path traversal
	if (PATH_TRAVERSAL_PATTERN.test(input)) return false;

	// Check for null bytes
	if (NULL_BYTE_PATTERN.test(input)) return false;

	return true;
}

/**
 * Enhanced string schema with sanitization and validation
 */
export const safeString = (minLength = 1, maxLength = MAX_STRING_LENGTH) =>
	z
		.string()
		.min(minLength)
		.max(maxLength)
		.transform(sanitizeText)
		.refine(validateSafeText, { message: 'Input contains potentially dangerous content' });

/**
 * Safe ID schema (alphanumeric with underscores/hyphens only)
 */
export const safeId = z
	.string()
	.min(1)
	.max(255)
	.regex(/^[a-zA-Z0-9_-]+$/, 'ID must contain only alphanumeric characters, underscores, and hyphens');

/**
 * Safe email schema
 */
export const safeEmail = z.string().email().max(255).toLowerCase().transform(sanitizeText);

/**
 * Safe URL schema
 */
export const safeUrl = z
	.string()
	.url()
	.max(2048)
	.refine(
		(url) => {
			try {
				const parsed = new URL(url);
				// Only allow http/https
				return parsed.protocol === 'http:' || parsed.protocol === 'https:';
			} catch {
				return false;
			}
		},
		{ message: 'Invalid URL or unsupported protocol' },
	);

/**
 * Safe array schema with length limits
 */
export const safeArray = <T extends z.ZodTypeAny>(schema: T, maxLength = MAX_ARRAY_LENGTH) => z.array(schema).max(maxLength);

/**
 * Safe record/object schema with key limits
 */
export const safeRecord = <T extends z.ZodTypeAny>(schema: T, maxKeys = MAX_OBJECT_KEYS) =>
	z.record(z.string(), schema).refine((obj) => Object.keys(obj).length <= maxKeys, {
		message: `Object cannot have more than ${maxKeys} keys`,
	});

/**
 * Validate JSON depth to prevent stack overflow
 */
export function validateJsonDepth(obj: unknown, maxDepth = MAX_JSON_DEPTH, currentDepth = 0): boolean {
	if (currentDepth > maxDepth) return false;

	if (obj === null || typeof obj !== 'object') return true;

	if (Array.isArray(obj)) {
		return obj.every((item) => validateJsonDepth(item, maxDepth, currentDepth + 1));
	}

	return Object.values(obj).every((value) => validateJsonDepth(value, maxDepth, currentDepth + 1));
}

/**
 * Safe JSON parsing with depth validation
 */
export function safeParseJson<T = unknown>(text: string): T | null {
	try {
		const parsed = JSON.parse(text);
		if (!validateJsonDepth(parsed)) {
			throw new Error('JSON depth exceeds maximum allowed');
		}
		return parsed as T;
	} catch {
		return null;
	}
}

/**
 * Validate pagination parameters
 */
export const paginationSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	cursor: z.string().optional(),
});

/**
 * Validate timestamp parameters
 */
export const timestampSchema = z
	.object({
		start: z.coerce.number().int().positive().optional(),
		end: z.coerce.number().int().positive().optional(),
	})
	.refine(
		(data) => {
			if (data.start && data.end) {
				return data.start <= data.end;
			}
			return true;
		},
		{ message: 'Start timestamp must be before end timestamp' },
	);
