-- ═══════════════════════════════════════════════════════════
-- StudyQuest — Study Monitoring System database schema
-- Run in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════

-- 1. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS sq_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free','premium')),
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free','premium_active','premium_past_due','premium_cancelled')),
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','zh')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. CHILDREN
CREATE TABLE IF NOT EXISTS sq_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MONITORED SUBJECTS
CREATE TABLE IF NOT EXISTS sq_monitored_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. EXAM TARGETS
CREATE TABLE IF NOT EXISTS sq_exam_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES sq_monitored_subjects(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('normal','major')),
  exam_date DATE NOT NULL,
  cycle_status TEXT NOT NULL DEFAULT 'active' CHECK (cycle_status IN ('active','paused','ended','restarted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. STUDY SETTINGS (per child)
CREATE TABLE IF NOT EXISTS sq_study_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  commence_date DATE NOT NULL DEFAULT CURRENT_DATE,
  study_days_per_week INT NOT NULL DEFAULT 5 CHECK (study_days_per_week BETWEEN 1 AND 7),
  first_reminder_time TIME NOT NULL DEFAULT '16:00',
  check_completion_time TIME NOT NULL DEFAULT '21:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- 6. WEEKLY PLANS
CREATE TABLE IF NOT EXISTS sq_weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES sq_monitored_subjects(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  plan_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','revision_requested')),
  ready_for_daily_split BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CHECK-IN RECORDS (free = Tue/Thu/Sat, premium = daily)
CREATE TABLE IF NOT EXISTS sq_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES sq_monitored_subjects(id) ON DELETE SET NULL,
  checkin_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','yes','partially','no','forgot','excused')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. DAILY TASK RECORDS (premium only)
CREATE TABLE IF NOT EXISTS sq_daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES sq_monitored_subjects(id) ON DELETE SET NULL,
  task_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','postpone','incomplete','did_extra')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. WEEKLY SUMMARIES
CREATE TABLE IF NOT EXISTS sq_weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  checkins_completed INT NOT NULL DEFAULT 0,
  checkins_total INT NOT NULL DEFAULT 0,
  completion_state TEXT,
  days_to_exam INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. EXAM RESULTS
CREATE TABLE IF NOT EXISTS sq_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES sq_monitored_subjects(id) ON DELETE SET NULL,
  exam_target_id UUID REFERENCES sq_exam_targets(id) ON DELETE SET NULL,
  score NUMERIC,
  reason TEXT CHECK (reason IN ('careless_mistakes','dont_understand_topic','didnt_finish_paper','no_revision','other')),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. CTA REQUEST TABLES
CREATE TABLE IF NOT EXISTS sq_tutor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  trigger_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sq_diagnostic_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  trigger_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sq_crash_course_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  course_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sq_holiday_programme_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES sq_children(id) ON DELETE CASCADE,
  availability_dates TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- ═══════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════
ALTER TABLE sq_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_monitored_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_exam_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_study_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_tutor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_diagnostic_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_crash_course_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_holiday_programme_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE sq_account_disputes ENABLE ROW LEVEL SECURITY;

-- Parent can CRUD own data
CREATE POLICY "sq_memberships_owner" ON sq_memberships FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "sq_children_owner" ON sq_children FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "sq_subjects_owner" ON sq_monitored_subjects FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_exams_owner" ON sq_exam_targets FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_settings_owner" ON sq_study_settings FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_plans_owner" ON sq_weekly_plans FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_checkins_owner" ON sq_checkins FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_daily_owner" ON sq_daily_tasks FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_summaries_owner" ON sq_weekly_summaries FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_results_owner" ON sq_exam_results FOR ALL USING (
  child_id IN (SELECT id FROM sq_children WHERE parent_id = auth.uid())
);
CREATE POLICY "sq_tutor_req_owner" ON sq_tutor_requests FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "sq_diag_req_owner" ON sq_diagnostic_requests FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "sq_crash_owner" ON sq_crash_course_interest FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "sq_holiday_owner" ON sq_holiday_programme_interest FOR ALL USING (auth.uid() = parent_id);
CREATE POLICY "sq_account_dispute_owner" ON sq_account_disputes FOR ALL USING (auth.uid() = parent_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_sq_children_parent ON sq_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_sq_subjects_child ON sq_monitored_subjects(child_id);
CREATE INDEX IF NOT EXISTS idx_sq_exams_child ON sq_exam_targets(child_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sq_checkins_child_date ON sq_checkins(child_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_sq_daily_child_date ON sq_daily_tasks(child_id, task_date);
CREATE INDEX IF NOT EXISTS idx_sq_plans_child_week ON sq_weekly_plans(child_id, week_start);
CREATE INDEX IF NOT EXISTS idx_sq_account_disputes_parent ON sq_account_disputes(parent_id);
CREATE INDEX IF NOT EXISTS idx_sq_account_disputes_status ON sq_account_disputes(status);
