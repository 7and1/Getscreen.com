import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
				isolatedStorage: false,
				miniflare: {
					bindings: {
						SERVICE_NAME: 'getscreen-api-test',
						ENVIRONMENT: 'test',
						LOG_LEVEL: 'error',
						SESSION_JWT_SECRET: 'test-secret',
						DEV_BOOTSTRAP_TOKEN: 'test-bootstrap',
					},
					d1Databases: ['DB'],
				},
			},
		},
	},
});
