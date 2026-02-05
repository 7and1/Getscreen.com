import type { Env as InternalEnv } from './src/env';

declare global {
	// Used by Wrangler / cloudflare:test typing.
	// Keep in sync with `src/env.ts`.
	interface Env extends InternalEnv {}
}

export {};
