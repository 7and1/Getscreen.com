export const SCHEMA_SQL = `PRAGMA foreign_keys = ON;

-- Tenancy / orgs
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- free/pro/business/enterprise
  status TEXT NOT NULL DEFAULT 'active', -- active/suspended
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  email TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- owner/admin/member/viewer
  status TEXT NOT NULL DEFAULT 'active', -- active/blocked
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  UNIQUE (org_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User sessions (refresh tokens stored as hashes)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- API keys (server-to-server)
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes_json TEXT NOT NULL, -- JSON array
  created_by_user_id TEXT,
  last_used_at INTEGER,
  revoked_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  os TEXT NOT NULL, -- windows/linux/macos
  arch TEXT, -- x64/arm64
  agent_version TEXT,
  status TEXT NOT NULL DEFAULT 'offline', -- offline/online/blocked
  tags_json TEXT, -- JSON array of strings
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_devices_org_status ON devices(org_id, status);
CREATE INDEX IF NOT EXISTS idx_devices_org_last_seen ON devices(org_id, last_seen_at);

-- Device credentials (hash secrets; optional public key for signing later)
CREATE TABLE IF NOT EXISTS device_credentials (
  device_id TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL,
  public_key_jwk TEXT, -- future-proofing for signed requests
  created_at INTEGER NOT NULL,
  rotated_at INTEGER,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_device_credentials_secret_hash ON device_credentials(secret_hash);

-- Pairing codes (one-time)
CREATE TABLE IF NOT EXISTS pairing_codes (
  code TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  created_by_user_id TEXT,
  device_name_hint TEXT,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  consumed_by_device_id TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (consumed_by_device_id) REFERENCES devices(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_pairing_codes_expires_at ON pairing_codes(expires_at);

-- Sessions (interactive remote sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  created_by_user_id TEXT,
  mode TEXT NOT NULL DEFAULT 'manual', -- manual/ai_assist/automation
  status TEXT NOT NULL DEFAULT 'creating', -- creating/active/ended/failed
  recording_enabled INTEGER NOT NULL DEFAULT 0,
  region_hint TEXT, -- e.g. colo or region
  started_at INTEGER,
  ended_at INTEGER,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_org_created_at ON sessions(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_device_status ON sessions(device_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_org_expires_at ON sessions(org_id, expires_at);

-- Session participants (Phase 1: controller only; Phase 2+: observers)
CREATE TABLE IF NOT EXISTS session_participants (
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'controller', -- controller/observer
  joined_at INTEGER NOT NULL,
  left_at INTEGER,
  PRIMARY KEY (session_id, user_id),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON session_participants(user_id);

-- AI runs (Phase 1 MVP)
CREATE TABLE IF NOT EXISTS ai_runs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'observe', -- observe/control
  status TEXT NOT NULL DEFAULT 'queued', -- queued/running/awaiting_confirmation/succeeded/failed/canceled
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ended_at INTEGER,
  error_code TEXT,
  error_message TEXT,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_ai_runs_org_created_at ON ai_runs(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_runs_session_id ON ai_runs(session_id);

-- Automations (definitions)
CREATE TABLE IF NOT EXISTS automations (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  definition_json TEXT NOT NULL, -- JSON definition of flow/goal
  status TEXT NOT NULL DEFAULT 'active', -- active/archived
  created_by_user_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_automations_org_created_at ON automations(org_id, created_at);

-- Automation runs
CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  automation_id TEXT NOT NULL,
  device_id TEXT,
  session_id TEXT,
  triggered_by TEXT NOT NULL, -- user/schedule/api
  triggered_by_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued', -- queued/running/succeeded/failed/canceled
  started_at INTEGER,
  ended_at INTEGER,
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (automation_id) REFERENCES automations(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_automation_runs_org_created_at ON automation_runs(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status_created_at ON automation_runs(status, created_at);

-- Run steps (AI steps + agent actions)
CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  kind TEXT NOT NULL, -- ai_plan/ai_verify/agent_action/extract
  status TEXT NOT NULL DEFAULT 'proposed', -- proposed/approved/executed/failed/skipped
  model TEXT, -- gemini-2.5-flash|gemini-2.5-pro
  input_ref TEXT, -- R2 key or short inline summary
  output_ref TEXT, -- R2 key
  tokens_in INTEGER,
  tokens_out INTEGER,
  cost_usd_micros INTEGER, -- cost in micro-USD
  approved_by_user_id TEXT,
  approved_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (run_id) REFERENCES automation_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (run_id, seq)
);
CREATE INDEX IF NOT EXISTS idx_run_steps_run_id_seq ON run_steps(run_id, seq);
CREATE INDEX IF NOT EXISTS idx_run_steps_org_created_at ON run_steps(org_id, created_at);

-- Artifacts (R2 pointers)
CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  kind TEXT NOT NULL, -- snapshot/recording/log/file/prompt/response
  session_id TEXT,
  run_id TEXT,
  step_id TEXT,
  r2_key TEXT NOT NULL,
  sha256 TEXT,
  size_bytes INTEGER,
  content_type TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (run_id) REFERENCES automation_runs(id) ON DELETE SET NULL,
  FOREIGN KEY (step_id) REFERENCES run_steps(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_artifacts_org_kind_created_at ON artifacts(org_id, kind, created_at);
CREATE INDEX IF NOT EXISTS idx_artifacts_session_created_at ON artifacts(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_artifacts_run_created_at ON artifacts(run_id, created_at);

-- Audit events (high-level index; large payloads should be in R2)
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  actor_type TEXT NOT NULL, -- user/device/system
  actor_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  metadata_json TEXT, -- JSON (small)
  created_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_audit_events_org_created_at ON audit_events(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_action_created_at ON audit_events(action, created_at);

-- Webhooks (integrations)
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  url TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  events_json TEXT NOT NULL, -- JSON array: ["run.succeeded", ...]
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON webhooks(org_id);

-- Daily usage aggregation for analytics
CREATE TABLE IF NOT EXISTS usage_daily (
  org_id TEXT NOT NULL,
  day TEXT NOT NULL, -- YYYY-MM-DD (UTC)
  devices_active INTEGER NOT NULL DEFAULT 0,
  ai_steps INTEGER NOT NULL DEFAULT 0,
  bandwidth_in_bytes INTEGER NOT NULL DEFAULT 0,
  bandwidth_out_bytes INTEGER NOT NULL DEFAULT 0,
  r2_storage_bytes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (org_id, day),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_usage_daily_day ON usage_daily(day);

-- Idempotency keys (API safety)
CREATE TABLE IF NOT EXISTS idempotency_keys (
  org_id TEXT NOT NULL,
  key TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (org_id, key),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_idempotency_org_created ON idempotency_keys(org_id, created_at);

`;
