import { beforeAll, describe, expect, it } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('devices API', () => {
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

	describe('POST /devices', () => {
		it('creates device with minimal data', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ name: 'Test Device' }),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.id).toMatch(/^dev_/);
			expect(body.name).toBe('Test Device');
			expect(body.status).toBe('offline');
			expect(body.device_token).toMatch(/^vl_dev_/);
		});

		it('creates device with agent info', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({
					name: 'Linux Device',
					agent: { os: 'Linux', arch: 'x64', version: '1.0.0' },
				}),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.name).toBe('Linux Device');
		});

		it('creates device with tags', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({
					name: 'Tagged Device',
					tags: ['production', 'web-server'],
				}),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.tags).toEqual(['production', 'web-server']);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name: 'Test' }),
			});
			expect(response.status).toBe(401);
		});

		it('rejects invalid body', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ invalid: 'data' }),
			});
			expect(response.status).toBeGreaterThanOrEqual(400);
		});

		it('rejects empty name', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ name: '' }),
			});
			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe('GET /devices', () => {
		it('lists devices', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.items).toBeInstanceOf(Array);
			expect(body.items.length).toBeGreaterThan(0);
		});

		it('returns device properties', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices', {
				headers: { 'x-api-key': apiKey },
			});
			const body = await response.json();
			const device = body.items[0];
			expect(device.id).toBeTruthy();
			expect(device.name).toBeTruthy();
			expect(device.status).toBeTruthy();
			expect(device.tags).toBeInstanceOf(Array);
		});

		it('supports limit parameter', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices?limit=5', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.items.length).toBeLessThanOrEqual(5);
		});

		it('supports status filter', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices?status=offline', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			body.items.forEach((device: { status: string }) => {
				expect(device.status).toBe('offline');
			});
		});

		it('supports search parameter', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices?search=Dev', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
		});

		it('supports tag filter', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices?tag=dev', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
		});

		it('supports pagination cursor', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices?limit=1', {
				headers: { 'x-api-key': apiKey },
			});
			const body = await response.json();
			if (body.next_cursor) {
				const nextResponse = await SELF.fetch(`https://example.com/v1/devices?cursor=${body.next_cursor}`, {
					headers: { 'x-api-key': apiKey },
				});
				expect(nextResponse.status).toBe(200);
			}
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices');
			expect(response.status).toBe(401);
		});
	});

	describe('pairing flow', () => {
		it('creates pairing code', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices/pairing-codes', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({}),
			});
			expect(response.status).toBe(201);
			const body = await response.json();
			expect(body.code).toMatch(/^pair_/);
			expect(body.expires_at).toBeTruthy();
		});

		it('creates pairing code with device name hint', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices/pairing-codes', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ device_name_hint: 'My Laptop' }),
			});
			expect(response.status).toBe(201);
		});

		it('creates pairing code with custom expiry', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices/pairing-codes', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ expires_in_seconds: 300 }),
			});
			expect(response.status).toBe(201);
		});

		it('pairs device with code', async () => {
			const codeResp = await SELF.fetch('https://example.com/v1/devices/pairing-codes', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ device_name_hint: 'Paired Device' }),
			});
			const codeBody = await codeResp.json();

			const pairResp = await SELF.fetch('https://example.com/v1/devices/pair', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ code: codeBody.code }),
			});
			expect(pairResp.status).toBe(201);
			const pairBody = await pairResp.json();
			expect(pairBody.id).toMatch(/^dev_/);
			expect(pairBody.device_token).toMatch(/^vl_dev_/);
		});

		it('rejects invalid pairing code', async () => {
			const response = await SELF.fetch('https://example.com/v1/devices/pair', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ code: 'invalid_code' }),
			});
			expect(response.status).toBe(404);
		});

		it('rejects reused pairing code', async () => {
			const codeResp = await SELF.fetch('https://example.com/v1/devices/pairing-codes', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({}),
			});
			const codeBody = await codeResp.json();

			await SELF.fetch('https://example.com/v1/devices/pair', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ code: codeBody.code }),
			});

			const secondPair = await SELF.fetch('https://example.com/v1/devices/pair', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ code: codeBody.code }),
			});
			expect(secondPair.status).toBe(409);
		});
	});
});
