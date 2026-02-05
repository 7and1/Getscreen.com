export interface Env {
	DB: D1Database;

	SESSION_DO: DurableObjectNamespace;
	DEVICE_DO: DurableObjectNamespace;
	RATE_LIMIT_DO: DurableObjectNamespace;

	ARTIFACTS?: R2Bucket;

	AI_JOBS?: Queue<unknown>;
	AUDIT?: Queue<unknown>;
	BILLING?: Queue<unknown>;

	SERVICE_NAME?: string;
	ENVIRONMENT?: string;
	LOG_LEVEL?: string;

	CORS_ORIGINS?: string;
	ICE_SERVERS_JSON?: string;

	SESSION_JWT_SECRET?: string;
	DEV_BOOTSTRAP_TOKEN?: string;
}
