PRAGMA foreign_keys = ON;

-- Sessions: store expiry timestamp to support cleanup and GET /sessions returning expires_at
ALTER TABLE sessions ADD COLUMN expires_at INTEGER;
CREATE INDEX IF NOT EXISTS idx_sessions_org_expires_at ON sessions(org_id, expires_at);

-- AI runs: minimal persisted run status (Phase 1 MVP)
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

