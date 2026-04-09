import { supabase } from './supabase';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
export type PlanType = 'free' | 'premium';
export type MembershipStatus = 'free' | 'premium_active' | 'premium_past_due' | 'premium_cancelled';
export type CheckinStatus = 'pending' | 'yes' | 'partially' | 'no';
export type DailyTaskStatus = 'pending' | 'done' | 'postpone' | 'incomplete' | 'did_extra';
export type PlanApproval = 'pending' | 'approved' | 'revision_requested';
export type ExamType = 'normal' | 'major';
export type CycleStatus = 'active' | 'paused' | 'ended' | 'restarted';
export type ExamReason = 'careless_mistakes' | 'dont_understand_topic' | 'didnt_finish_paper' | 'no_revision' | 'other';

export interface Membership {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: MembershipStatus;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
}

export interface SQChild {
  id: string;
  parent_id: string;
  name: string;
  level: string;
  whatsapp_number?: string;
  study_days?: number[]; // 0=Sun,1=Mon,...6=Sat
}

export interface MonitoredSubject {
  id: string;
  child_id: string;
  subject_name: string;
}

export interface ExamTarget {
  id: string;
  subject_id: string;
  child_id: string;
  exam_type: ExamType;
  exam_date: string;
  cycle_status: CycleStatus;
}

export interface StudySettings {
  id: string;
  child_id: string;
  commence_date: string;
  study_days_per_week: number;
  first_reminder_time: string;
  check_completion_time: string;
}

export interface WeeklyPlan {
  id: string;
  child_id: string;
  subject_id?: string;
  week_start: string;
  plan_text: string;
  status: PlanApproval;
  ready_for_daily_split: boolean;
}

export interface Checkin {
  id: string;
  child_id: string;
  subject_id?: string;
  checkin_date: string;
  status: CheckinStatus;
  note?: string;
}

export interface DailyTask {
  id: string;
  child_id: string;
  subject_id?: string;
  task_date: string;
  status: DailyTaskStatus;
  note?: string;
}

export interface WeeklySummary {
  id: string;
  child_id: string;
  week_start: string;
  checkins_completed: number;
  checkins_total: number;
  completion_state?: string;
  days_to_exam?: number;
}

export interface ExamResult {
  id: string;
  child_id: string;
  subject_id?: string;
  exam_target_id?: string;
  score?: number;
  reason?: ExamReason;
  entered_at: string;
}

// ═══════════════════════════════════════════
// PLAN LIMITS
// ═══════════════════════════════════════════
export const PLAN_LIMITS: Record<PlanType, { maxChildren: number; maxSubjects: number; dailyMode: boolean }> = {
  free: { maxChildren: 1, maxSubjects: 1, dailyMode: false },
  premium: { maxChildren: 99, maxSubjects: 99, dailyMode: true },
};

export const PLAN_PRICES: Record<PlanType, number> = {
  free: 0,
  premium: 9.90,
};

export const FREE_CHECKIN_DAYS = ['Tuesday', 'Thursday', 'Saturday'] as const;
export const PREMIUM_SUBJECTS = ['Math', 'Science', 'Chinese'] as const;

// ═══════════════════════════════════════════
// MEMBERSHIP
// ═══════════════════════════════════════════
export async function getMembership(userId: string): Promise<Membership | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('sq_memberships').select('*').eq('user_id', userId).single();
  return data;
}

export async function createMembership(userId: string, planType: PlanType = 'free', profile?: { name?: string; email?: string; phone?: string }): Promise<Membership | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('sq_memberships').upsert({
    user_id: userId,
    plan_type: planType,
    status: planType === 'free' ? 'free' : 'premium_active',
    ...(profile?.name && { parent_name: profile.name }),
    ...(profile?.email && { parent_email: profile.email }),
    ...(profile?.phone && { parent_phone: profile.phone }),
  }, { onConflict: 'user_id' }).select().single();
  return data;
}

export async function upgradeMembership(userId: string, planType: PlanType): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('sq_memberships').update({
    plan_type: planType,
    status: 'premium_active',
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  return !error;
}

export function isPremium(m: Membership | null): boolean {
  return !!m && (m.status === 'premium_active');
}

// ═══════════════════════════════════════════
// CHILDREN
// ═══════════════════════════════════════════
export async function getChildren(parentId: string): Promise<SQChild[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_children').select('*').eq('parent_id', parentId).order('created_at');
  return data || [];
}

export async function createChild(parentId: string, child: { name: string; level: string; whatsapp_number?: string }): Promise<SQChild | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('sq_children').insert({ parent_id: parentId, ...child }).select().single();
  return data;
}

export async function updateStudyDays(childId: string, studyDays: number[]): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('sq_children').update({ study_days: studyDays }).eq('id', childId);
  return !error;
}

// ═══════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════
export async function getSubjects(childId: string): Promise<MonitoredSubject[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_monitored_subjects').select('*').eq('child_id', childId);
  return data || [];
}

export async function addSubject(childId: string, subjectName: string): Promise<MonitoredSubject | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('sq_monitored_subjects').insert({ child_id: childId, subject_name: subjectName }).select().single();
  return data;
}

// ═══════════════════════════════════════════
// EXAM TARGETS
// ═══════════════════════════════════════════
export async function getExamTargets(childId: string): Promise<ExamTarget[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_exam_targets').select('*').eq('child_id', childId).order('exam_date');
  return data || [];
}

export async function addExamTarget(target: { subject_id: string; child_id: string; exam_type: ExamType; exam_date: string }): Promise<ExamTarget | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('sq_exam_targets').insert(target).select().single();
  return data;
}

export function getRecommendedStartDate(examDate: string): string {
  const exam = new Date(examDate);
  const start = new Date(exam);
  start.setDate(start.getDate() - 56); // 8 weeks before
  const today = new Date();
  // If recommended start is in the past, use today
  return start < today ? today.toISOString().split('T')[0] : start.toISOString().split('T')[0];
}

export function getActiveExamLimit(planType: PlanType): number {
  return planType === 'free' ? 1 : 3;
}

// ═══════════════════════════════════════════
// STUDY SETTINGS
// ═══════════════════════════════════════════
export async function upsertStudySettings(childId: string, settings: Partial<StudySettings>): Promise<void> {
  if (!supabase) return;
  await supabase.from('sq_study_settings').upsert({ child_id: childId, ...settings }, { onConflict: 'child_id' });
}

// ═══════════════════════════════════════════
// WEEKLY PLANS
// ═══════════════════════════════════════════
export async function getWeeklyPlans(childId: string): Promise<WeeklyPlan[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_weekly_plans').select('*').eq('child_id', childId).order('week_start', { ascending: false });
  return data || [];
}

export async function createWeeklyPlan(plan: { child_id: string; subject_id?: string; week_start: string; plan_text: string }): Promise<WeeklyPlan | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('sq_weekly_plans').insert(plan).select().single();
  return data;
}

export async function updatePlanStatus(planId: string, status: PlanApproval, readyForSplit?: boolean): Promise<void> {
  if (!supabase) return;
  const update: Record<string, unknown> = { status };
  if (readyForSplit !== undefined) update.ready_for_daily_split = readyForSplit;
  await supabase.from('sq_weekly_plans').update(update).eq('id', planId);
}

// ═══════════════════════════════════════════
// CHECKINS
// ═══════════════════════════════════════════
export async function getCheckins(childId: string, from?: string, to?: string): Promise<Checkin[]> {
  if (!supabase) return [];
  let q = supabase.from('sq_checkins').select('*').eq('child_id', childId).order('checkin_date', { ascending: false });
  if (from) q = q.gte('checkin_date', from);
  if (to) q = q.lte('checkin_date', to);
  const { data } = await q;
  return data || [];
}

export async function upsertCheckin(checkin: { child_id: string; subject_id?: string; checkin_date: string; status: CheckinStatus; note?: string }): Promise<void> {
  if (!supabase) return;
  await supabase.from('sq_checkins').insert(checkin);
}

// ═══════════════════════════════════════════
// DAILY TASKS (premium)
// ═══════════════════════════════════════════
export async function getDailyTasks(childId: string, date: string): Promise<DailyTask[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_daily_tasks').select('*').eq('child_id', childId).eq('task_date', date);
  return data || [];
}

export async function upsertDailyTask(task: { child_id: string; subject_id?: string; task_date: string; status: DailyTaskStatus; note?: string }): Promise<void> {
  if (!supabase) return;
  await supabase.from('sq_daily_tasks').insert(task);
}

// ═══════════════════════════════════════════
// WEEKLY SUMMARIES
// ═══════════════════════════════════════════
export async function getWeeklySummaries(childId: string): Promise<WeeklySummary[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_weekly_summaries').select('*').eq('child_id', childId).order('week_start', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════
// EXAM RESULTS
// ═══════════════════════════════════════════
export async function getExamResults(childId: string): Promise<ExamResult[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('sq_exam_results').select('*').eq('child_id', childId).order('entered_at', { ascending: false });
  return data || [];
}

export async function submitExamResult(result: { child_id: string; subject_id?: string; exam_target_id?: string; score?: number; reason?: ExamReason }): Promise<void> {
  if (!supabase) return;
  await supabase.from('sq_exam_results').insert(result);
}

// ═══════════════════════════════════════════
// CTA REQUESTS
// ═══════════════════════════════════════════
export async function submitCTARequest(
  table: 'sq_tutor_requests' | 'sq_diagnostic_requests' | 'sq_crash_course_interest' | 'sq_holiday_programme_interest',
  parentId: string,
  childId: string,
  extra?: Record<string, unknown>
): Promise<void> {
  if (!supabase) return;
  await supabase.from(table).insert({ parent_id: parentId, child_id: childId, ...extra });
}

// ═══════════════════════════════════════════
// SETUP (step 3 — full onboarding)
// ═══════════════════════════════════════════
export interface SetupPayload {
  parentName: string;
  parentEmail: string;
  parentWhatsapp: string;
  planType: PlanType;
  children: {
    name: string;
    level: string;
    whatsapp: string;
    subjects: { name: string; examType: ExamType; examDate: string }[];
    commenceDate: string;
    studyDaysPerWeek: number;
    reminderTime: string;
    checkTime: string;
  }[];
}

export async function completeSetup(userId: string, payload: SetupPayload): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 1. Upsert membership with parent profile
    await createMembership(userId, payload.planType, {
      name: payload.parentName,
      email: payload.parentEmail,
      phone: payload.parentWhatsapp,
    });

    // 2. Update parent profile name/phone
    await supabase.from('parent_profiles').upsert({
      id: userId,
      full_name: payload.parentName,
      email: payload.parentEmail,
      phone: payload.parentWhatsapp,
    }, { onConflict: 'id' });

    // 3. Create children + subjects + exams + settings
    for (const c of payload.children) {
      const child = await createChild(userId, { name: c.name, level: c.level, whatsapp_number: c.whatsapp });
      if (!child) continue;

      for (const s of c.subjects) {
        const subj = await addSubject(child.id, s.name);
        if (subj) {
          await addExamTarget({ subject_id: subj.id, child_id: child.id, exam_type: s.examType, exam_date: s.examDate });
        }
      }

      await upsertStudySettings(child.id, {
        commence_date: c.commenceDate,
        study_days_per_week: c.studyDaysPerWeek,
        first_reminder_time: c.reminderTime,
        check_completion_time: c.checkTime,
      });
    }
    return true;
  } catch (e) {
    console.error('StudyPulse setup failed:', e);
    return false;
  }
}

// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// ADMIN QUERIES
// ═══════════════════════════════════════════
export async function adminGetAllRequests(table: string): Promise<unknown[]> {
  if (!supabase) return [];
  const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════
// ANALYTICS — Parent Dashboard
// ═══════════════════════════════════════════

/** Get check-in history for a child over the past N weeks */
export async function getCheckinHistory(childId: string, weeks: number = 8): Promise<Checkin[]> {
  if (!supabase) return [];
  const from = new Date();
  from.setDate(from.getDate() - weeks * 7);
  const { data } = await supabase
    .from('sq_checkins')
    .select('*')
    .eq('child_id', childId)
    .gte('checkin_date', from.toISOString().split('T')[0])
    .order('checkin_date', { ascending: true });
  return data || [];
}

/** Get daily tasks history for a child over the past N weeks */
export async function getDailyTasksHistory(childId: string, weeks: number = 8): Promise<DailyTask[]> {
  if (!supabase) return [];
  const from = new Date();
  from.setDate(from.getDate() - weeks * 7);
  const { data } = await supabase
    .from('sq_daily_tasks')
    .select('*')
    .eq('child_id', childId)
    .gte('task_date', from.toISOString().split('T')[0])
    .order('task_date', { ascending: true });
  return data || [];
}

// ═══════════════════════════════════════════
// ANALYTICS — Admin Monitoring
// ═══════════════════════════════════════════

/** Get all check-ins across platform for past N days */
export async function adminGetRecentCheckins(days: number = 14): Promise<Checkin[]> {
  if (!supabase) return [];
  const from = new Date();
  from.setDate(from.getDate() - days);
  const { data } = await supabase
    .from('sq_checkins')
    .select('*')
    .gte('checkin_date', from.toISOString().split('T')[0])
    .order('checkin_date', { ascending: false });
  return data || [];
}

/** Get all daily tasks across platform for past N days */
export async function adminGetRecentDailyTasks(days: number = 14): Promise<DailyTask[]> {
  if (!supabase) return [];
  const from = new Date();
  from.setDate(from.getDate() - days);
  const { data } = await supabase
    .from('sq_daily_tasks')
    .select('*')
    .gte('task_date', from.toISOString().split('T')[0])
    .order('task_date', { ascending: false });
  return data || [];
}

/** Get all weekly summaries across platform */
export async function adminGetAllWeeklySummaries(limit: number = 100): Promise<WeeklySummary[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('sq_weekly_summaries')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(limit);
  return data || [];
}

/** Get all exam targets across platform */
export async function adminGetAllExamTargets(): Promise<ExamTarget[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('sq_exam_targets')
    .select('*')
    .eq('cycle_status', 'active')
    .order('exam_date', { ascending: true });
  return data || [];
}
