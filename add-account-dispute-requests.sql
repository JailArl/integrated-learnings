-- Add StudyPulse account dispute CTA queue for admin follow-up

CREATE TABLE IF NOT EXISTS sq_account_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES sq_children(id) ON DELETE SET NULL,
  issue_type TEXT NOT NULL DEFAULT 'account_dispute',
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  child_name TEXT,
  child_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sq_account_disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sq_account_dispute_owner ON sq_account_disputes;
CREATE POLICY sq_account_dispute_owner ON sq_account_disputes
FOR ALL USING (auth.uid() = parent_id);

CREATE INDEX IF NOT EXISTS idx_sq_account_disputes_parent ON sq_account_disputes(parent_id);
CREATE INDEX IF NOT EXISTS idx_sq_account_disputes_status ON sq_account_disputes(status);
