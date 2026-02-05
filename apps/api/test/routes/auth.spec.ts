import { beforeAll, describe, expect, it } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('authentication', () => {
	let apiKey: string;

	beforeAll(async () => {
		const response = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		const body = (await response.json()) as { api_key: { key: string } };
		apiKey = body.api_key.key;
	});

	describe('API key authentication', () => {
		it('rejects request without API key', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices');
			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.error.code).toBe('UNAUTHORIZED');
		});

		it('rejects request with invalid API key', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-api-key': 'invalid_key' },
			});
			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.error.code).toBe('UNAUTHORIZED');
		});

		it('accepts request with valid API key', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
		});

		it('rejects empty API key', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-api-key': '' },
			});
			expect(response.status).toBe(401);
		});

		it('rejects malformed API key', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-api-key': 'not_a_valid_format' },
			});
			expect(response.status).toBe(401);
		});
	});

	describe('unauthenticated endpoints', () => {
		it('allows healthz without auth', async () => {
			const response = await SELF.fetch('https://example.com/v1/healthz');
			expect(response.status).toBe(200);
		});

		it('allows readyz without auth', async () => {
			const response = await SELF.fetch('https://example.com/v1/readyz');
			expect(response.status).toBe(200);
		});

		it('allows dev/bootstrap with bootstrap token', async () => {
			const response = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
				method: 'POST',
				headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
			});
			expect(response.status).toBe(200);
		});

		it('rejects dev/bootstrap without token', async () => {
			const response = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
				method: 'POST',
			});
			expect(response.status).toBe(404);
		});

		it('rejects dev/bootstrap with wrong token', async () => {
			const response = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
				method: 'POST',
				headers: { 'x-dev-bootstrap-token': 'wrong-token' },
			});
			expect(response.status).toBe(404);
		});
	});

	describe('request ID tracking', () => {
		it('generates request ID when not provided', async () => {
			const response = await SELF.fetch('https://example.com/v1/healthz');
			const requestId = response.headers.get('x-request-id');
			expect(requestId).toBeTruthy();
			expect(requestId).toMatch(/^req_/);
		});

		it('preserves provided request ID', async () => {
			const response = await SELF.fetch('https://example.com/v1/healthz', {
				headers: { 'x-request-id': 'custom_req_123' },
			});
			const requestId = response.headers.get('x-request-id');
			expect(requestId).toBe('custom_req_123');
		});

		it('includes request ID in error responses', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-request-id': 'test_req_456' },
			});
			expect(response.status).toBe(401);
			const requestId = response.headers.get('x-request-id');
			expect(requestId).toBe('test_req_456');
		});
	});
});
