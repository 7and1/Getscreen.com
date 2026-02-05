import { beforeAll, describe, expect, it } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('sessions API', () => {
	let apiKey: string;
	let deviceId: string;

	beforeAll(async () => {
		const migrate = await SELF.fetch('https://example.com/v1/dev/migrate', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		expect(migrate.status).toBe(200);

		const response = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		const body = (await response.json()) as { api_key: { key: string }; device: { id: string } };
		apiKey = body.api_key.key;
		deviceId = body.device.id;
	});

	describe('POST /sessions', () => {
		it('creates session', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: deviceId }),
			});
			expect(response.status).toBe(201);
			const body = await response.json();
			expect(body.id).toMatch(/^ses_/);
			expect(body.device_id).toBe(deviceId);
			expect(body.session_token).toBeTruthy();
			expect(body.ws_url).toBeTruthy();
			expect(body.ice_servers).toBeInstanceOf(Array);
		});

		it('creates session with custom expiry', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: deviceId, expires_in_seconds: 3600 }),
			});
			expect(response.status).toBe(201);
		});

		it('respects idempotency key', async () => {
			const idempotencyKey = `test-idempotent-${Date.now()}`;
			const body = JSON.stringify({ device_id: deviceId });

			const resp1 = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': idempotencyKey,
				},
				body,
			});
			const body1 = await resp1.json();

			const resp2 = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': idempotencyKey,
				},
				body,
			});
			const body2 = await resp2.json();

			expect(body1.id).toBe(body2.id);
		});

		it('rejects idempotency key with different payload', async () => {
			const idempotencyKey = `test-conflict-${Date.now()}`;

			await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': idempotencyKey,
				},
				body: JSON.stringify({ device_id: deviceId, expires_in_seconds: 60 }),
			});

			const resp2 = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': idempotencyKey,
				},
				body: JSON.stringify({ device_id: deviceId, expires_in_seconds: 120 }),
			});
			expect(resp2.status).toBe(409);
			const body = await resp2.json();
			expect(body.error.code).toBe('IDEMPOTENCY_KEY_REUSED');
		});

		it('rejects invalid device_id', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: 'invalid_device' }),
			});
			expect(response.status).toBe(404);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ device_id: deviceId }),
			});
			expect(response.status).toBe(401);
		});

		it('rejects invalid body', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ invalid: 'data' }),
			});
			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe('GET /sessions/:id', () => {
		it('retrieves session', async () => {
			const createResp = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: deviceId }),
			});
			const createBody = await createResp.json();

			const getResp = await SELF.fetch(`https://example.com/v1/sessions/${createBody.id}`, {
				headers: { 'x-api-key': apiKey },
			});
			expect(getResp.status).toBe(200);
			const getBody = await getResp.json();
			expect(getBody.id).toBe(createBody.id);
			expect(getBody.device_id).toBe(deviceId);
			expect(getBody.status).toBeTruthy();
		});

		it('returns 404 for non-existent session', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions/ses_nonexistent', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(404);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions/ses_test');
			expect(response.status).toBe(401);
		});
	});

	describe('POST /sessions/:id/join', () => {
		it('creates join token', async () => {
			const createResp = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: deviceId }),
			});
			const createBody = await createResp.json();

			const joinResp = await SELF.fetch(`https://example.com/v1/sessions/${createBody.id}/join`, {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ role: 'observer' }),
			});
			expect(joinResp.status).toBe(200);
			const joinBody = await joinResp.json();
			expect(joinBody.join_token).toBeTruthy();
			expect(joinBody.ws_url).toBeTruthy();
		});

		it('supports different roles', async () => {
			const createResp = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: deviceId }),
			});
			const createBody = await createResp.json();

			const roles = ['controller', 'observer', 'agent'];
			for (const role of roles) {
				const joinResp = await SELF.fetch(`https://example.com/v1/sessions/${createBody.id}/join`, {
					method: 'POST',
					headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
					body: JSON.stringify({ role }),
				});
				expect(joinResp.status).toBe(200);
			}
		});

		it('returns 404 for non-existent session', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions/ses_nonexistent/join', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ role: 'observer' }),
			});
			expect(response.status).toBe(404);
		});
	});

	describe('DELETE /sessions/:id', () => {
		it('ends session', async () => {
			const createResp = await SELF.fetch('https://example.com/v1/sessions', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'x-api-key': apiKey,
					'idempotency-key': `test-${Date.now()}`,
				},
				body: JSON.stringify({ device_id: deviceId }),
			});
			const createBody = await createResp.json();

			const deleteResp = await SELF.fetch(`https://example.com/v1/sessions/${createBody.id}`, {
				method: 'DELETE',
				headers: { 'x-api-key': apiKey },
			});
			expect(deleteResp.status).toBe(204);
		});

		it('returns 404 for non-existent session', async () => {
			const response = await SELF.fetch('https://example.com/v1/sessions/ses_nonexistent', {
				method: 'DELETE',
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(404);
		});
	});
});
