import type { Env } from '../env';
import { nowMs } from '../lib/id';

type CheckRequest = {
	key: string;
	limit: number;
	windowSeconds: number;
};

type CheckResponse = {
	allowed: boolean;
	limit: number;
	remaining: number;
	reset: number; // epoch seconds
};

export class RateLimitDO implements DurableObject {
	private readonly state: DurableObjectState;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		void env;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (request.method === 'POST' && url.pathname === '/check') {
			const body = (await request.json()) as CheckRequest;
			const key = String(body.key);
			const limit = Number(body.limit);
			const windowSeconds = Number(body.windowSeconds);
			if (!key || !Number.isFinite(limit) || !Number.isFinite(windowSeconds) || windowSeconds <= 0 || limit <= 0) {
				return new Response('bad request', { status: 400 });
			}

			const now = nowMs();
			const storageKey = `rl:${key}`;
			const existing = (await this.state.storage.get<{ count: number; resetAtMs: number }>(storageKey)) ?? null;
			const resetAtMs = existing && existing.resetAtMs > now ? existing.resetAtMs : now + windowSeconds * 1000;
			const count = existing && existing.resetAtMs > now ? existing.count : 0;
			const nextCount = count + 1;
			const allowed = nextCount <= limit;
			const storedCount = allowed ? nextCount : count;

			await this.state.storage.put(storageKey, { count: storedCount, resetAtMs });

			const res: CheckResponse = {
				allowed,
				limit,
				remaining: Math.max(0, limit - storedCount),
				reset: Math.floor(resetAtMs / 1000),
			};
			return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
		}

		return new Response('not found', { status: 404 });
	}
}
