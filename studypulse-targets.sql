-- ═══════════════════════════════════════════════════════════════
-- STUDYPULSE: WEEKLY TARGETS & CONVERSATION STATE
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Weekly targets set by the kid
CREATE TABLE IF NOT EXISTS sq_weekly_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  subject_name TEXT NOT NULL,           -- 'Math', 'Science', etc.
  week_start DATE NOT NULL,
  target_text TEXT NOT NULL,            -- raw reply: "20 questions"
  target_quantity INTEGER NOT NULL,     -- 20
  target_unit TEXT NOT NULL,            -- "questions", "chapters", "pages", "worksheets"
  daily_quantity INTEGER NOT NULL,      -- 20 / study_days = 4
  remaining_quantity INTEGER NOT NULL,  -- decreases as kid completes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, subject_name, week_start)
);

ALTER TABLE sq_weekly_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sq_weekly_targets_read" ON sq_weekly_targets
  FOR SELECT USING (true);

CREATE POLICY "sq_weekly_targets_service" ON sq_weekly_targets
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 2. Conversation state on sq_children (tracks what the kid is doing in WhatsApp)
ALTER TABLE sq_children ADD COLUMN IF NOT EXISTS conversation_state TEXT DEFAULT 'idle';
-- States: 'idle', 'setting_target_subject', 'setting_target_amount', 'checkin_partial_count'

ALTER TABLE sq_children ADD COLUMN IF NOT EXISTS conversation_context JSONB DEFAULT '{}';
-- Stores temp data: { "current_subject": "Math", "awaiting": "amount" }

-- 3. Track daily target completion in sq_checkins
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS target_quantity INTEGER;      -- daily target (e.g. 4)
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS completed_quantity INTEGER;   -- what kid actually did (e.g. 2)
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS target_unit TEXT;             -- "questions", "pages" etc.
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS rollover_quantity INTEGER DEFAULT 0; -- carried from yesterday

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_sq_weekly_targets_child ON sq_weekly_targets(child_id, week_start);
