import { describe, expect, it } from 'vitest';
import { AppError, errorResponse, isAppError } from '../../src/lib/errors';

describe('errors', () => {
	describe('AppError', () => {
		it('creates error with required fields', () => {
			const error = new AppError({
				status: 404,
				code: 'NOT_FOUND',
				message: 'Resource not found',
			});
			expect(error.status).toBe(404);
			expect(error.code).toBe('NOT_FOUND');
			expect(error.message).toBe('Resource not found');
			expect(error.name).toBe('AppError');
		});

		it('creates error with details', () => {
			const error = new AppError({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'Invalid input',
				details: { field: 'email', reason: 'invalid format' },
			});
			expect(error.details).toEqual({ field: 'email', reason: 'invalid format' });
		});

		it('extends Error', () => {
			const error = new AppError({
				status: 500,
				code: 'INTERNAL_ERROR',
				message: 'Something went wrong',
			});
			expect(error).toBeInstanceOf(Error);
		});

		it('has stack trace', () => {
			const error = new AppError({
				status: 500,
				code: 'INTERNAL_ERROR',
				message: 'Error',
			});
			expect(error.stack).toBeDefined();
		});

		it('handles all error codes', () => {
			const codes = [
				'VALIDATION_ERROR',
				'UNAUTHORIZED',
				'FORBIDDEN',
				'NOT_FOUND',
				'CONFLICT',
				'RATE_LIMITED',
				'INTERNAL_ERROR',
				'IDEMPOTENCY_KEY_REUSED',
				'SESSION_NOT_FOUND',
				'DEVICE_NOT_FOUND',
				'DEVICE_OFFLINE',
			] as const;

			codes.forEach((code) => {
				const error = new AppError({ status: 400, code, message: 'Test' });
				expect(error.code).toBe(code);
			});
		});
	});

	describe('errorResponse', () => {
		it('creates response with error structure', () => {
			const response = errorResponse({
				status: 404,
				code: 'NOT_FOUND',
				message: 'Resource not found',
			});
			expect(response.status).toBe(404);
			expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8');
		});

		it('includes error in response body', async () => {
			const response = errorResponse({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'Invalid input',
			});
			const body = await response.json();
			expect(body.error.code).toBe('VALIDATION_ERROR');
			expect(body.error.message).toBe('Invalid input');
		});

		it('includes request_id when provided', async () => {
			const response = errorResponse({
				status: 500,
				code: 'INTERNAL_ERROR',
				message: 'Error',
				requestId: 'req_123',
			});
			const body = await response.json();
			expect(body.error.request_id).toBe('req_123');
			expect(response.headers.get('x-request-id')).toBe('req_123');
		});

		it('includes details when provided', async () => {
			const response = errorResponse({
				status: 400,
				code: 'VALIDATION_ERROR',
				message: 'Invalid',
				details: { field: 'email' },
			});
			const body = await response.json();
			expect(body.error.details).toEqual({ field: 'email' });
		});

		it('handles missing optional fields', async () => {
			const response = errorResponse({
				status: 404,
				code: 'NOT_FOUND',
				message: 'Not found',
			});
			const body = await response.json();
			expect(body.error.request_id).toBeUndefined();
			expect(body.error.details).toBeUndefined();
		});

		it('sets correct status codes', () => {
			const statuses = [400, 401, 403, 404, 409, 429, 500, 503];
			statuses.forEach((status) => {
				const response = errorResponse({
					status,
					code: 'INTERNAL_ERROR',
					message: 'Error',
				});
				expect(response.status).toBe(status);
			});
		});
	});

	describe('isAppError', () => {
		it('returns true for AppError', () => {
			const error = new AppError({
				status: 404,
				code: 'NOT_FOUND',
				message: 'Not found',
			});
			expect(isAppError(error)).toBe(true);
		});

		it('returns false for regular Error', () => {
			const error = new Error('Regular error');
			expect(isAppError(error)).toBe(false);
		});

		it('returns false for null', () => {
			expect(isAppError(null)).toBe(false);
		});

		it('returns false for undefined', () => {
			expect(isAppError(undefined)).toBe(false);
		});

		it('returns false for string', () => {
			expect(isAppError('error')).toBe(false);
		});

		it('returns false for number', () => {
			expect(isAppError(404)).toBe(false);
		});

		it('returns false for object without name', () => {
			expect(isAppError({ status: 404 })).toBe(false);
		});

		it('returns false for object with wrong name', () => {
			expect(isAppError({ name: 'Error' })).toBe(false);
		});

		it('returns true for object with AppError name', () => {
			expect(isAppError({ name: 'AppError' })).toBe(true);
		});
	});
});
