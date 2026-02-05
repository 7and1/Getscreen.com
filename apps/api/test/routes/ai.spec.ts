import { beforeAll, describe, expect, it } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('AI API', () => {
	let apiKey: string;
	let deviceId: string;
	let sessionId: string;

	beforeAll(async () => {
		const bootstrapResp = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		const bootstrap = (await bootstrapResp.json()) as { api_key: { key: string }; device: { id: string } };
		apiKey = bootstrap.api_key.key;
		deviceId = bootstrap.device.id;

		const sessionResp = await SELF.fetch('https://example.com/v1/sessions', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-api-key': apiKey,
				'idempotency-key': `test-ai-${Date.now()}`,
			},
			body: JSON.stringify({ device_id: deviceId }),
		});
		const session = (await sessionResp.json()) as { id: string };
		sessionId = session.id;
	});

	describe('POST /ai/runs', () => {
		it('creates AI run', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: sessionId, goal: 'Take a screenshot' }),
			});
			expect(response.status).toBe(202);
			const body = await response.json();
			expect(body.id).toMatch(/^run_/);
			expect(body.session_id).toBe(sessionId);
			expect(body.status).toBe('queued');
		});

		it('creates AI run with mode', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: sessionId, goal: 'Click button', mode: 'control' }),
			});
			expect(response.status).toBe(202);
		});

		it('rejects invalid session_id', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: 'invalid_session', goal: 'Test' }),
			});
			expect(response.status).toBe(404);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ session_id: sessionId, goal: 'Test' }),
			});
			expect(response.status).toBe(401);
		});

		it('rejects empty goal', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: sessionId, goal: '' }),
			});
			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe('GET /ai/runs/:id', () => {
		it('retrieves AI run', async () => {
			const createResp = await SELF.fetch('https://example.com/v1/ai/runs', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: sessionId, goal: 'Test goal' }),
			});
			const createBody = await createResp.json();

			const getResp = await SELF.fetch(`https://example.com/v1/ai/runs/${createBody.id}`, {
				headers: { 'x-api-key': apiKey },
			});
			expect(getResp.status).toBe(200);
			const getBody = await getResp.json();
			expect(getBody.id).toBe(createBody.id);
			expect(getBody.session_id).toBe(sessionId);
			expect(getBody.status).toBeTruthy();
		});

		it('returns 404 for non-existent run', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs/run_nonexistent', {
				headers: { 'x-api-key': apiKey },
			});
			expect(response.status).toBe(404);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/runs/run_test');
			expect(response.status).toBe(401);
		});
	});

	describe('POST /ai/steps:propose', () => {
		it('proposes AI steps', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/steps:propose', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: sessionId, goal: 'Take screenshot' }),
			});
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.run_id).toMatch(/^run_/);
			expect(body.plan_id).toMatch(/^plan_/);
			expect(body.status).toBe('awaiting_confirmation');
			expect(body.actions).toBeInstanceOf(Array);
		});

		it('rejects invalid session_id', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/steps:propose', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: 'invalid', goal: 'Test' }),
			});
			expect(response.status).toBe(404);
		});
	});

	describe('POST /ai/steps:approve', () => {
		it('approves AI steps', async () => {
			const proposeResp = await SELF.fetch('https://example.com/v1/ai/steps:propose', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({ session_id: sessionId, goal: 'Test' }),
			});
			const proposeBody = await proposeResp.json();

			const approveResp = await SELF.fetch('https://example.com/v1/ai/steps:approve', {
				method: 'POST',
				headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
				body: JSON.stringify({
					session_id: sessionId,
					plan_id: proposeBody.plan_id,
					run_id: proposeBody.run_id,
					actions: proposeBody.actions,
				}),
			});
			expect(approveResp.status).toBe(200);
			const approveBody = await approveResp.json();
			expect(approveBody.ok).toBe(true);
		});

		it('rejects without authentication', async () => {
			const response = await SELF.fetch('https://example.com/v1/ai/steps:approve', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					session_id: sessionId,
					plan_id: 'plan_test',
					run_id: 'run_test',
					actions: [],
				}),
			});
			expect(response.status).toBe(401);
		});
	});
});
