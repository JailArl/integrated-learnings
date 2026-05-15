-- StudyPulse runtime flags for admin-operable controls (e.g., payments kill switch)

CREATE TABLE IF NOT EXISTS sq_runtime_flags (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by text
);

ALTER TABLE sq_runtime_flags ENABLE ROW LEVEL SECURITY;

INSERT INTO sq_runtime_flags (key, value_json, updated_by)
VALUES ('studypulse_payments', '{"enabled": false}'::jsonb, 'migration')
ON CONFLICT (key) DO NOTHING;
