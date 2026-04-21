import { supabase } from './supabase';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
export type PlanType = 'free' | 'premium';
export type CheckoutPlan = 'monthly_flex' | 'pass_1m' | 'pack_2m' | 'pack_4m';
export type MembershipStatus = 'free' | 'premium_active' | 'premium_past_due' | 'premium_cancelled';
export type CheckinStatus = 'pending' | 'yes' | 'partially' | 'no' | 'forgot' | 'excused';
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
  preferred_language?: 'en' | 'zh';
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
  cca_days?: number[];   // days skipped due to CCA (no check-in sent)
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
  days_to_exam?: string | number;
}

export interface WeeklyTarget {
  id: string;
  child_id: string;
  subject_name: string;
  week_start: string;
  target_text: string;
  target_quantity: number;
  target_unit: string;
  daily_quantity: number;
  remaining_quantity: number;
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

export const CHECKOUT_PLAN_OPTIONS: Array<{
  code: CheckoutPlan;
  label: string;
  priceLabel: string;
  description: string;
}> = [
  { code: 'monthly_flex', label: 'Core Monthly', priceLabel: '$9.90/mo', description: 'Recurring monthly plan · lowest monthly cost · cancel anytime in Billing' },
  { code: 'pass_1m', label: 'Exam Pass (30 Days)', priceLabel: '$14.90', description: 'One-time payment · no auto-renew' },
  { code: 'pack_2m', label: 'Exam Sprint (60 Days)', priceLabel: '$24.90', description: 'One-time payment · no auto-renew · exam-focused push' },
  { code: 'pack_4m', label: 'Exam Season (120 Days)', priceLabel: '$43.90', description: 'One-time payment · no auto-renew · longest coverage' },
];

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

export async function createMembership(userId: string, planType: PlanType = 'free', profile?: { name?: string; email?: string; phone?: string; language?: 'en' | 'zh' }): Promise<Membership | null> {
  if (!supabase) return null;

  const fullPayload: Record<string, any> = {
    user_id: userId,
    plan_type: planType,
    status: planType === 'free' ? 'free' : 'premium_active',
    ...(profile?.name && { parent_name: profile.name }),
    ...(profile?.email && { parent_email: profile.email }),
    ...(profile?.phone && { parent_phone: profile.phone }),
    ...(profile?.language && { preferred_language: profile.language }),
  };

  const withoutPhone = { ...fullPayload };
  delete withoutPhone.parent_phone;

  const withoutLanguage = { ...fullPayload };
  delete withoutLanguage.preferred_language;

  const withoutPhoneAndLanguage = { ...withoutPhone };
  delete withoutPhoneAndLanguage.preferred_language;

  const minimalPayload = {
    user_id: userId,
    plan_type: planType,
    status: planType === 'free' ? 'free' : 'premium_active',
  };

  const attempts: Array<Record<string, any>> = [
    fullPayload,
    withoutPhone,
    withoutLanguage,
    withoutPhoneAndLanguage,
    minimalPayload,
  ];

  const seen = new Set<string>();
  let lastError: any = null;

  for (const payload of attempts) {
    const key = JSON.stringify(payload);
    if (seen.has(key)) continue;
    seen.add(key);

    const { error } = await supabase
      .from('sq_memberships')
      .upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      // Best effort: return canonical DB row when SELECT policy allows it.
      const refreshed = await getMembership(userId);
      if (refreshed) return refreshed;

      // If SELECT is blocked or schema drifts, still treat bootstrap as successful.
      return {
        id: '',
        user_id: userId,
        plan_type: planType,
        status: planType === 'free' ? 'free' : 'premium_active',
        ...(profile?.name ? { parent_name: profile.name } : {}),
        ...(profile?.email ? { parent_email: profile.email } : {}),
        ...(profile?.phone ? { parent_phone: profile.phone } : {}),
        ...(profile?.language ? { preferred_language: profile.language } : {}),
      } as Membership;
    }

    lastError = error;
    const msg = String(error.message || '').toLowerCase();

    const recoverable =
      msg.includes('uq_sq_memberships_parent_phone') ||
      (msg.includes('column') && msg.includes('does not exist'));

    if (!recoverable) break;
  }

  console.error('createMembership failed:', lastError);
  return null;
}

export async function upgradeMembership(userId: string, planType: PlanType): Promise<boolean> {
  if (!supabase) return false;

  // Premium must be activated by Stripe webhook, never directly from the client.
  if (planType === 'premium') {
    console.warn('upgradeMembership blocked: premium activation must come from Stripe webhook confirmation.');
    return false;
  }

  const { error } = await supabase.from('sq_memberships').update({
    plan_type: planType,
    status: 'free',
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);
  if (error) console.error('upgradeMembership failed:', error);
  return !error;
}

export async function startPremiumCheckout(plan: CheckoutPlan = 'monthly_flex'): Promise<{ ok: boolean; url?: string; message?: string }> {
  if (!supabase) return { ok: false, message: 'Billing service is not configured yet.' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { ok: false, message: 'Please sign in again before upgrading.' };
  }

  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        plan,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.url) {
      return { ok: false, message: payload?.error || 'Could not start secure checkout yet.' };
    }

    return { ok: true, url: payload.url };
  } catch (error) {
    console.error('startPremiumCheckout failed:', error);
    return { ok: false, message: 'Could not reach the billing service right now.' };
  }
}

export async function openBillingPortal(): Promise<{ ok: boolean; url?: string; message?: string }> {
  if (!supabase) return { ok: false, message: 'Billing service is not configured yet.' };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { ok: false, message: 'Please sign in again before managing billing.' };
  }

  try {
    const response = await fetch('/api/stripe/create-billing-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        origin: typeof window !== 'undefined' ? window.location.origin : '',
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.url) {
      return { ok: false, message: payload?.error || 'Could not open billing settings yet.' };
    }

    return { ok: true, url: payload.url };
  } catch (error) {
    console.error('openBillingPortal failed:', error);
    return { ok: false, message: 'Could not reach the billing service right now.' };
  }
}

export function isPremium(m: Membership | null): boolean {
  if (!m || m.status !== 'premium_active') return false;

  if (m.current_period_end) {
    const endsAt = new Date(m.current_period_end);
    if (!Number.isNaN(endsAt.getTime()) && endsAt.getTime() < Date.now()) {
      return false;
    }
  }

  return true;
}

async function updateCurrentUserMetadata(patch: Record<string, unknown>): Promise<boolean> {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const currentMeta = (user.user_metadata || {}) as Record<string, unknown>;
  const { error } = await supabase.auth.updateUser({ data: { ...currentMeta, ...patch } });
  if (error) {
    console.error('updateCurrentUserMetadata failed:', error);
    return false;
  }
  return true;
}

function getLocalDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  const storageKey = 'studypulse_device_id';
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated = window.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

export async function enforceParentDeviceAccess(maxDevices = 2): Promise<{ ok: boolean; reason?: string }> {
  if (!supabase) return { ok: false, reason: 'Authentication service is not configured.' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'Please sign in again.' };

  const deviceId = getLocalDeviceId();
  if (!deviceId) return { ok: true };

  const meta = (user.user_metadata || {}) as Record<string, any>;
  const knownDevices = Array.isArray(meta.studypulse_devices)
    ? (meta.studypulse_devices as string[]).filter(Boolean)
    : [];

  if (knownDevices.includes(deviceId)) return { ok: true };

  if (knownDevices.length >= maxDevices) {
    return {
      ok: false,
      reason: 'This account is already active on the maximum number of devices. Please use your usual device or reset your password first.',
    };
  }

  const saved = await updateCurrentUserMetadata({
    studypulse_devices: [...knownDevices, deviceId].slice(-maxDevices),
  });

  return saved
    ? { ok: true }
    : { ok: false, reason: 'Could not verify this device. Please try again.' };
}

export async function updateLanguagePreference(userId: string, language: 'en' | 'zh'): Promise<boolean> {
  if (!supabase) return false;

  let dbOk = false;
  const existing = await getMembership(userId);
  const { error } = await supabase
    .from('sq_memberships')
    .upsert({
      user_id: userId,
      plan_type: existing?.plan_type || 'free',
      status: existing?.status || 'free',
      parent_name: existing?.parent_name || null,
      parent_email: existing?.parent_email || null,
      parent_phone: existing?.parent_phone || null,
      preferred_language: language,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('id')
    .single();

  if (error) {
    console.error('updateLanguagePreference failed:', error);
  } else {
    dbOk = true;
  }

  const metadataOk = await updateCurrentUserMetadata({ preferred_language: language });
  return dbOk || metadataOk;
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

  // Enforce plan child limit (counts ALL children ever created, including deleted ones via soft-check on active)
  const membership = await getMembership(parentId);
  const plan = (membership?.plan_type || 'free') as PlanType;
  const limit = PLAN_LIMITS[plan].maxChildren;

  const { count } = await supabase
    .from('sq_children')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId);

  if ((count ?? 0) >= limit) {
    console.warn(`createChild blocked: plan=${plan} limit=${limit} current=${count}`);
    return null;
  }

  const { data } = await supabase.from('sq_children').insert({ parent_id: parentId, ...child }).select().single();
  return data;
}

export async function updateStudyDays(childId: string, studyDays: number[]): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('sq_children').update({ study_days: studyDays }).eq('id', childId);
  return !error;
}

export async function updateCCADays(childId: string, ccaDays: number[]): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('sq_children').update({ cca_days: ccaDays }).eq('id', childId);
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

export async function updateExamTargetDate(examId: string, examDate: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('sq_exam_targets')
    .update({ exam_date: examDate })
    .eq('id', examId);
  if (error) {
    console.error('updateExamTargetDate failed:', error);
    return false;
  }
  return true;
}

export async function updateExamTargetCycleStatus(examId: string, status: CycleStatus): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('sq_exam_targets')
    .update({ cycle_status: status })
    .eq('id', examId);
  if (error) {
    console.error('updateExamTargetCycleStatus failed:', error);
    return false;
  }
  return true;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12);
}

export function getRecommendedStartDate(examDate: string): string {
  const exam = parseDateOnly(examDate);
  const start = new Date(exam);
  start.setDate(start.getDate() - 56); // 8 weeks before
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  // If recommended start is in the past, use today
  return start < today ? formatLocalDate(today) : formatLocalDate(start);
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

export async function getWeeklyTargets(childId: string, forWeek?: string): Promise<WeeklyTarget[]> {
  if (!supabase) return [];
  let q = supabase.from('sq_weekly_targets').select('*').eq('child_id', childId).order('subject_name');
  if (forWeek) q = q.eq('week_start', forWeek);
  const { data, error } = await q;
  if (error) {
    console.error('getWeeklyTargets failed:', error);
    return [];
  }
  return (data || []) as WeeklyTarget[];
}

export async function upsertWeeklyTarget(target: {
  child_id: string;
  subject_name: string;
  week_start: string;
  target_quantity: number;
  target_unit: string;
  study_days_count: number;
}): Promise<boolean> {
  if (!supabase) return false;
  const quantity = Math.max(0, Math.floor(target.target_quantity));
  const days = Math.max(1, Math.floor(target.study_days_count || 1));
  const daily = Math.max(1, Math.ceil(quantity / days));

  const { error } = await supabase.from('sq_weekly_targets').upsert({
    child_id: target.child_id,
    subject_name: target.subject_name,
    week_start: target.week_start,
    target_text: `${quantity} ${target.target_unit}`,
    target_quantity: quantity,
    target_unit: target.target_unit,
    daily_quantity: daily,
    remaining_quantity: quantity,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'child_id,subject_name,week_start' });

  if (error) {
    console.error('upsertWeeklyTarget failed:', error);
    return false;
  }
  return true;
}

export async function deleteWeeklyTarget(childId: string, subjectName: string, week: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('sq_weekly_targets')
    .delete()
    .eq('child_id', childId)
    .eq('subject_name', subjectName)
    .eq('week_start', week);
  if (error) {
    console.error('deleteWeeklyTarget failed:', error);
    return false;
  }
  return true;
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
  const { error } = await supabase
    .from('sq_checkins')
    .upsert(checkin, { onConflict: 'child_id,checkin_date' });
  if (error) console.error('upsertCheckin failed:', error);
}

export async function upsertExcuse(childId: string, date: string, reason: string): Promise<boolean> {
  if (!supabase) return false;

  let dbOk = false;
  const { error } = await supabase
    .from('sq_checkins')
    .upsert(
      { child_id: childId, checkin_date: date, status: 'excused', note: reason },
      { onConflict: 'child_id,checkin_date' }
    );
  if (error) {
    console.error('upsertExcuse failed:', error);
  } else {
    dbOk = true;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const existingExcuses = ((user?.user_metadata as Record<string, any> | undefined)?.studypulse_excused_days || {}) as Record<string, Record<string, string>>;
  const metadataOk = await updateCurrentUserMetadata({
    studypulse_excused_days: {
      ...existingExcuses,
      [childId]: {
        ...(existingExcuses[childId] || {}),
        [date]: reason,
      },
    },
  });

  return dbOk || metadataOk;
}

// ═══════════════════════════════════════════
// DAILY TASKS (premium)
// ═══════════════════════════════════════════
export async function getDailyTasks(childId: string, from?: string, to?: string): Promise<DailyTask[]> {
  if (!supabase) return [];
  let q = supabase.from('sq_daily_tasks').select('*').eq('child_id', childId).order('task_date', { ascending: false });
  if (from) q = q.gte('task_date', from);
  if (to) q = q.lte('task_date', to);
  const { data, error } = await q;
  if (error) {
    console.error('getDailyTasks failed:', error);
    return [];
  }
  return data || [];
}

export async function upsertDailyTask(task: { child_id: string; subject_id?: string; task_date: string; status: DailyTaskStatus; note?: string }): Promise<boolean> {
  if (!supabase) return false;

  let query = supabase
    .from('sq_daily_tasks')
    .select('id')
    .eq('child_id', task.child_id)
    .eq('task_date', task.task_date);

  query = task.subject_id
    ? query.eq('subject_id', task.subject_id)
    : query.is('subject_id', null);

  const { data: existing, error: findError } = await query.limit(1);
  if (findError) {
    console.error('upsertDailyTask lookup failed:', findError);
    return false;
  }

  if (existing && existing.length > 0) {
    const { error: updateError } = await supabase
      .from('sq_daily_tasks')
      .update({ status: task.status, note: task.note ?? null })
      .eq('id', existing[0].id);
    if (updateError) {
      console.error('upsertDailyTask update failed:', updateError);
      return false;
    }
    return true;
  }

  const { error: insertError } = await supabase.from('sq_daily_tasks').insert(task);
  if (insertError) {
    console.error('upsertDailyTask insert failed:', insertError);
    return false;
  }
  return true;
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

export async function submitExamResult(result: { child_id: string; subject_id?: string; exam_target_id?: string; score?: number; reason?: ExamReason }): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('sq_exam_results').insert(result);
  if (error) {
    console.error('submitExamResult failed:', error);
    return false;
  }
  return true;
}

// ═══════════════════════════════════════════
// CTA REQUESTS
// ═══════════════════════════════════════════
export async function submitCTARequest(
  table: 'sq_tutor_requests' | 'sq_diagnostic_requests' | 'sq_crash_course_interest' | 'sq_holiday_programme_interest' | 'sq_account_disputes',
  parentId: string,
  childId: string,
  extra?: Record<string, unknown>
): Promise<boolean> {
  if (!supabase) return false;
  const triggerReason = typeof extra?.trigger_reason === 'string' ? extra.trigger_reason : null;
  const readableSummary = [
    typeof extra?.parent_name === 'string' && extra.parent_name ? `Parent: ${extra.parent_name}` : '',
    typeof extra?.parent_phone === 'string' && extra.parent_phone ? `Phone: ${extra.parent_phone}` : '',
    typeof extra?.parent_email === 'string' && extra.parent_email ? `Email: ${extra.parent_email}` : '',
    typeof extra?.child_name === 'string' && extra.child_name ? `Child: ${extra.child_name}` : '',
    typeof extra?.child_level === 'string' && extra.child_level ? `Level: ${extra.child_level}` : '',
    triggerReason ? `Reason: ${triggerReason}` : '',
  ].filter(Boolean).join(' | ');

  const payload = table === 'sq_crash_course_interest'
    ? {
        parent_id: parentId,
        child_id: childId,
        course_type: triggerReason || 'manual_request',
        notes: readableSummary || null,
      }
    : table === 'sq_holiday_programme_interest'
    ? {
        parent_id: parentId,
        child_id: childId,
        availability_dates: null,
        notes: readableSummary || null,
      }
    : table === 'sq_account_disputes'
    ? {
        parent_id: parentId,
        child_id: childId,
        issue_type: triggerReason || 'account_dispute',
        details: readableSummary || null,
        parent_name: typeof extra?.parent_name === 'string' ? extra.parent_name : null,
        parent_phone: typeof extra?.parent_phone === 'string' ? extra.parent_phone : null,
        parent_email: typeof extra?.parent_email === 'string' ? extra.parent_email : null,
        child_name: typeof extra?.child_name === 'string' ? extra.child_name : null,
        child_level: typeof extra?.child_level === 'string' ? extra.child_level : null,
      }
    : {
        parent_id: parentId,
        child_id: childId,
        trigger_reason: triggerReason || 'manual_request',
      };

  const { error } = await supabase.from(table).insert(payload);
  if (error) {
    console.error('submitCTARequest failed:', error);
    return false;
  }
  return true;
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
