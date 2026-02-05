import { beforeAll, describe, expect, it } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('usage API', () => {
	let apiKey: string;

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
		const body = (await response.json()) as { api_key: { key: string } };
		apiKey = body.api_key.key;
	});

	describe('GET /usage/daily', () => {
		it('retrieves usage for today', async () => {
			const response = await SELF.fetch('https://example.com/v1/usage/daily', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.day).toBeTruthy();
			expect(typeof body.devices_active).toBe('number');
			expect(typeof body.ai_steps).toBe('number');
			expect(typeof body.bandwidth_in_bytes).toBe('number');
			expect(typeof body.bandwidth_out_bytes).toBe('number');
		});

		it('retrieves usage for specific day', async () => {
			const response = await SELF.fetch('https://example.com/v1/usage/daily?day=2024-01-01', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.day).toBe('2024-01-01');
		});

		it('returns zero values for day without data', async () => {
			const response = await SELF.fetch('https://example.com/v1/usage/daily?day=2020-01-01', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.devices_active).toBe(0);
			expect(body.ai_steps).toBe(0);
			expect(body.bandwidth_in_bytes).toBe(0);
			expect(body.bandwidth_out_bytes).toBe(0);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/usage/daily');
			expect(response.status).toBe(401);
		});
	});
});
