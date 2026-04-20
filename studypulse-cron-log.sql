-- ── sq_cron_log ──────────────────────────────────────────────────────────
-- Persistent execution log for every studypulse-cron phase run.
-- Allows operators to see when the cron last ran, what it did, and what
-- failed — without relying solely on Supabase function logs.
-- RLS: service_role only (no user-level access).
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sq_cron_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  job_type         TEXT NOT NULL,        -- 'cron_run' | 'checkins:...' | 'followups:...' | 'exam-proximity' | 'weekly-summaries' | 'queue-drain' | etc.
  idempotency_key  TEXT,                 -- mirrors the key used in sq_outbound_queue, where applicable
  level_group      TEXT,                 -- level group when job is per-level-group
  messages_sent    INT DEFAULT 0,
  messages_queued  INT DEFAULT 0,
  error_type       TEXT,                 -- NULL = success | 'MISSING_SCHEDULE' | 'PHASE_ERROR' | 'SEND_FAILED' | 'DB_ERROR'
  error_detail     TEXT,
  duration_ms      INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for the admin health dashboard query (latest N rows)
CREATE INDEX IF NOT EXISTS idx_sq_cron_log_run_at ON sq_cron_log (run_at DESC);

-- Index for quickly finding the last successful cron run
CREATE INDEX IF NOT EXISTS idx_sq_cron_log_job_type ON sq_cron_log (job_type, run_at DESC);

-- RLS: disable public access; only service_role can read/write.
ALTER TABLE sq_cron_log DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE sq_cron_log IS 'Persistent execution log for studypulse-cron phases. Used by admin health dashboard to detect missing or failed cron runs.';
