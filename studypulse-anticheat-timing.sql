-- ═══════════════════════════════════════════════════════════════
-- STUDYPULSE: ANTI-CHEAT VERIFICATION TEMPLATES + TIMING CONFIG
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════


-- ─── 1. VERIFICATION FOLLOW-UP TEMPLATES ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  -- After "yes/done" → ask what subject (always, low friction)
  (
    'sp_verify_what_subject',
    'studypulse_verify',
    'active',
    'Nice work! What subject did you study today? 📚',
    false,
    NULL
  ),
  -- Random photo request (premium, 30% chance)
  (
    'sp_verify_photo',
    'studypulse_verify',
    'active',
    '📸 Want to show off your work? Send a photo of what you did!',
    false,
    NULL
  ),
  -- Parent confirm/adjust
  (
    'sp_parent_confirm',
    'studypulse_verify',
    'active',
    '📊 {child_name} said: {status} today.' || E'\n' || 'Does this look right? Reply CONFIRM or ADJUST.',
    true,
    'child_name, status'
  ),
  -- Honesty reward — when kid says "no" or "incomplete"
  (
    'sp_brave_checkin',
    'studypulse_verify',
    'active',
    'Thanks for being honest, {child_name}. Not every day is a study day — checking in still counts. 💪',
    true,
    'child_name'
  ),
  -- Fast-responder follow-up (< 10 seconds reply, suspicious)
  (
    'sp_verify_quick_reply',
    'studypulse_verify',
    'active',
    'That was fast! 😄 Quick question — what topic did you work on?',
    false,
    NULL
  ),
  -- After parent says ADJUST
  (
    'sp_parent_adjusted',
    'studypulse_verify',
    'active',
    'Got it — we''ve updated {child_name}''s record. Thanks for keeping things accurate!',
    true,
    'child_name'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── 2. CHECK-IN TIMING CONFIG TABLE ───

CREATE TABLE IF NOT EXISTS sq_checkin_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_group TEXT NOT NULL,            -- 'primary_lower', 'primary_upper', 'secondary_lower', 'secondary_upper_jc'
  level_range TEXT NOT NULL,            -- 'P1-P3', 'P4-P6', 'Sec1-Sec3', 'Sec4-JC2'
  weekday_kid_checkin TIME NOT NULL,    -- when kid gets the check-in prompt
  weekday_followup TIME NOT NULL,       -- follow-up if no reply
  weekday_parent_report TIME NOT NULL,  -- parent gets daily summary
  weekend_kid_checkin TIME NOT NULL,    -- Saturday/Sunday check-in
  weekend_parent_report TIME NOT NULL,  -- Saturday/Sunday parent report
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sq_checkin_schedule ENABLE ROW LEVEL SECURITY;

-- Only service_role can modify schedule
CREATE POLICY "sq_checkin_schedule_read" ON sq_checkin_schedule
  FOR SELECT USING (true);

CREATE POLICY "sq_checkin_schedule_admin" ON sq_checkin_schedule
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Insert default timing
INSERT INTO sq_checkin_schedule (level_group, level_range, weekday_kid_checkin, weekday_followup, weekday_parent_report, weekend_kid_checkin, weekend_parent_report)
VALUES
  ('primary_lower',        'P1-P3',       '20:00', '20:45', '21:15', '16:00', '20:00'),
  ('primary_upper',        'P4-P6',       '20:30', '21:15', '21:45', '16:00', '20:00'),
  ('secondary_lower',      'Sec1-Sec3',   '21:00', '21:45', '22:15', '16:00', '20:30'),
  ('secondary_upper_jc',   'Sec4-JC2',    '21:30', '22:15', '22:45', '17:00', '20:30')
ON CONFLICT DO NOTHING;


-- ─── 3. ADD RESPONSE TRACKING COLUMNS TO sq_checkins ───
-- (Track response time for anti-cheat analysis)

ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS prompt_sent_at TIMESTAMPTZ;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMPTZ;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS response_seconds INTEGER;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS subject_reported TEXT;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS parent_confirmed BOOLEAN;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS parent_adjusted BOOLEAN DEFAULT false;
ALTER TABLE sq_checkins ADD COLUMN IF NOT EXISTS verification_type TEXT;  -- 'none', 'subject', 'photo', 'quiz'

-- Same columns for premium daily tasks
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS prompt_sent_at TIMESTAMPTZ;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMPTZ;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS response_seconds INTEGER;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS subject_reported TEXT;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS parent_confirmed BOOLEAN;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS parent_adjusted BOOLEAN DEFAULT false;
ALTER TABLE sq_daily_tasks ADD COLUMN IF NOT EXISTS verification_type TEXT;


-- ─── 4. PARENT ADJUSTMENT TRACKING ───

CREATE TABLE IF NOT EXISTS sq_parent_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL,
  checkin_date DATE NOT NULL,
  original_status TEXT NOT NULL,
  adjusted_status TEXT NOT NULL,
  parent_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sq_parent_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sq_parent_adjustments_own" ON sq_parent_adjustments
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "sq_parent_adjustments_insert" ON sq_parent_adjustments
  FOR INSERT WITH CHECK (auth.uid() = parent_id);


-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════
-- SELECT * FROM sq_checkin_schedule ORDER BY weekday_kid_checkin;
-- SELECT template_name, message_text FROM whatsapp_message_templates WHERE template_name LIKE 'sp_verify%' OR template_name LIKE 'sp_brave%' OR template_name LIKE 'sp_parent_%';
