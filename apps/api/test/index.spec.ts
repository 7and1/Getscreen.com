import { beforeAll, describe, expect, it } from 'vitest';
import { SELF } from 'cloudflare:test';

type BootstrapResponse = {
	api_key: { key: string };
	device: { id: string; device_token: string };
};

beforeAll(async () => {
	const response = await SELF.fetch('https://example.com/v1/dev/migrate', {
		method: 'POST',
		headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
	});
	if (response.status !== 200) {
		// eslint-disable-next-line no-console
		console.log('migrate failed:', response.status, await response.text());
	}
	expect(response.status).toBe(200);
});

describe('getscreen api', () => {
	it('responds to healthz without auth', async () => {
		const response = await SELF.fetch('https://example.com/v1/healthz');
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
	});

	it('bootstraps org + api key in test env', async () => {
		const response = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		expect(response.status).toBe(200);
		const body = (await response.json()) as BootstrapResponse;
		expect(body.api_key.key).toMatch(/^vl_api_/);
		expect(body.device.device_token).toMatch(/^vl_dev_/);
	});

	it('creates a session and routes websocket signaling through SessionDO', async () => {
		const bootstrapResp = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		const bootstrap = (await bootstrapResp.json()) as BootstrapResponse;

		const sessionResp = await SELF.fetch('https://example.com/v1/sessions', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-api-key': bootstrap.api_key.key,
				'idempotency-key': 'test-key-1',
			},
			body: JSON.stringify({ device_id: bootstrap.device.id, expires_in_seconds: 60 }),
		});
		expect(sessionResp.status).toBe(201);
		const sessionBody = (await sessionResp.json()) as { id: string; session_token: string };
		expect(sessionBody.session_token).toContain('.');

		const getResp = await SELF.fetch(`https://example.com/v1/sessions/${sessionBody.id}`, {
			headers: { 'x-api-key': bootstrap.api_key.key },
		});
		expect(getResp.status).toBe(200);
		const sessionGet = (await getResp.json()) as { expires_at?: string };
		expect(sessionGet.expires_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);

		const agentJoinResp = await SELF.fetch(`https://example.com/v1/sessions/${sessionBody.id}/join`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-api-key': bootstrap.api_key.key },
			body: JSON.stringify({ role: 'agent' }),
		});
		expect(agentJoinResp.status).toBe(200);
		const agentJoin = (await agentJoinResp.json()) as { join_token: string };
		expect(agentJoin.join_token).toContain('.');

		const controllerUpgrade = await SELF.fetch('https://example.com/v1/ws', {
			headers: { Upgrade: 'websocket', Authorization: `Bearer ${sessionBody.session_token}` },
		});
		if (controllerUpgrade.status !== 101) {
			// eslint-disable-next-line no-console
			console.log('controller ws upgrade failed:', controllerUpgrade.status, await controllerUpgrade.text());
		}
		const controllerWs = controllerUpgrade.webSocket;
		expect(controllerWs).toBeTruthy();
		controllerWs.accept();

		const agentUpgrade = await SELF.fetch('https://example.com/v1/ws', {
			headers: { Upgrade: 'websocket', Authorization: `Bearer ${agentJoin.join_token}` },
		});
		if (agentUpgrade.status !== 101) {
			// eslint-disable-next-line no-console
			console.log('agent ws upgrade failed:', agentUpgrade.status, await agentUpgrade.text());
		}
		const agentWs = agentUpgrade.webSocket;
		expect(agentWs).toBeTruthy();

		const gotOffer = new Promise<string>((resolve) => {
			agentWs.addEventListener('message', (event) => {
				try {
					const text = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
					const parsed = JSON.parse(text) as { type?: string };
					if (parsed.type === 'offer') resolve(text);
				} catch {
					// ignore
				}
			});
		});

		agentWs.accept();

		controllerWs.send(
			JSON.stringify({
				type: 'offer',
				id: 'msg_1',
				ts: new Date().toISOString(),
				session_id: sessionBody.id,
				payload: { sdp: 'v=0\\r\\n...', webrtc_session_id: 'rtc_1' },
			}),
		);

		const offerText = await gotOffer;
		const offer = JSON.parse(offerText) as { type: string; payload?: { sdp?: string } };
		expect(offer.type).toBe('offer');
		expect(offer.payload?.sdp).toContain('v=0');

		controllerWs.close();
		agentWs.close();
	}, 15_000);

	it('creates an AI run and returns run status', async () => {
		const bootstrapResp = await SELF.fetch('https://example.com/v1/dev/bootstrap', {
			method: 'POST',
			headers: { 'x-dev-bootstrap-token': 'test-bootstrap' },
		});
		const bootstrap = (await bootstrapResp.json()) as BootstrapResponse;

		const sessionResp = await SELF.fetch('https://example.com/v1/sessions', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-api-key': bootstrap.api_key.key,
				'idempotency-key': 'test-key-ai-1',
			},
			body: JSON.stringify({ device_id: bootstrap.device.id, expires_in_seconds: 60 }),
		});
		expect(sessionResp.status).toBe(201);
		const sessionBody = (await sessionResp.json()) as { id: string };

		const runResp = await SELF.fetch('https://example.com/v1/ai/runs', {
			method: 'POST',
			headers: { 'content-type': 'application/json', 'x-api-key': bootstrap.api_key.key },
			body: JSON.stringify({ session_id: sessionBody.id, goal: 'Take a screenshot', mode: 'observe' }),
		});
		expect(runResp.status).toBe(202);
		const run = (await runResp.json()) as { id: string; session_id: string; status: string };
		expect(run.id).toMatch(/^run_/);
		expect(run.session_id).toBe(sessionBody.id);
		expect(run.status).toBe('queued');

		const runGetResp = await SELF.fetch(`https://example.com/v1/ai/runs/${run.id}`, {
			headers: { 'x-api-key': bootstrap.api_key.key },
		});
		expect(runGetResp.status).toBe(200);
		const runGet = (await runGetResp.json()) as { id: string; session_id: string; status: string };
		expect(runGet.id).toBe(run.id);
		expect(runGet.session_id).toBe(sessionBody.id);
		expect(runGet.status).toBe('queued');
	});
});
