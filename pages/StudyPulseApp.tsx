import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Crown,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Loader2,
  Microscope,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Zap,
} from 'lucide-react';
import { supabase } from '../services/supabase';
import {
  type Membership,
  type SQChild,
  type MonitoredSubject,
  type ExamTarget,
  type WeeklyPlan,
  type WeeklyTarget,
  type Checkin,
  type DailyTask,
  type WeeklySummary,
  type ExamResult,
  type CheckinStatus,
  type DailyTaskStatus,
  type PlanApproval,
  type ExamReason,
  type ExamType,
  getMembership,
  getChildren,
  getSubjects,
  getExamTargets,
  getWeeklyPlans,
  getWeeklyTargets,
  getCheckins,
  getDailyTasks,
  getWeeklySummaries,
  getExamResults,
  submitExamResult,
  submitCTARequest,
  upgradeMembership,
  startPremiumCheckout,
  openBillingPortal,
  isPremium,
  updateStudyDays,
  updateCCADays,
  upsertExcuse,
  addExamTarget,
  updateExamTargetDate,
  updateExamTargetCycleStatus,
  getRecommendedStartDate,
  getActiveExamLimit,
  upsertWeeklyTarget,
  deleteWeeklyTarget,
  createChild,
  addSubject,
  upsertStudySettings,
  createMembership,
  updateLanguagePreference,
  getCheckinHistory,
  getDailyTasksHistory,
  enforceParentDeviceAccess,
  PLAN_LIMITS,
  FREE_CHECKIN_DAYS,
  CHECKOUT_PLAN_OPTIONS,
  type CheckoutPlan,
} from '../services/studyquest';

/* ── helpers ── */

// Normalise Singapore phone numbers to E.164 (+65XXXXXXXX)
function normaliseSGPhone(raw: string): string {
  const digits = raw.replace(/[\s\-().+]/g, '');
  if (digits.startsWith('65') && digits.length === 10) return `+${digits}`;
  if (digits.length === 8) return `+65${digits}`;
  if (raw.trim().startsWith('+')) return raw.trim();
  return `+65${digits}`;
}

function toComparablePhone(raw?: string | null): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length > 8 ? digits.slice(-8) : digits;
}

function isSameWhatsAppNumber(a?: string | null, b?: string | null): boolean {
  const left = toComparablePhone(a);
  const right = toComparablePhone(b);
  return Boolean(left) && Boolean(right) && left === right;
}

async function persistParentProfile(userId: string, fullName: string, phone: string, email?: string): Promise<{ ok: boolean; message?: string; nameOk?: boolean; phoneOk?: boolean }> {
  if (!supabase) return { ok: false, message: 'Authentication service is not configured.' };

  const parentName = fullName.trim();
  const parentPhone = normaliseSGPhone(phone);
  let nameOk = false;
  let phoneOk = false;

  // Step 1: Always save name (and email) — this never conflicts
  const { data: nameUpdated, error: nameError } = await supabase
    .from('sq_memberships')
    .update({ parent_name: parentName, ...(email ? { parent_email: email } : {}) })
    .eq('user_id', userId)
    .select('id, parent_phone')
    .maybeSingle();

  if (nameError) {
    return { ok: false, nameOk: false, phoneOk: false, message: `Could not save name: ${nameError.message}` };
  }
  if (!nameUpdated) {
    return { ok: false, nameOk: false, phoneOk: false, message: 'Membership row not found — please refresh and try again.' };
  }
  nameOk = true;

  // Step 2: Save phone only if it changed (avoids self-collision on unique index)
  const currentPhone = nameUpdated.parent_phone;
  const normalizedCurrent = currentPhone ? currentPhone.replace(/[^0-9+]/g, '') : '';
  const normalizedNew = parentPhone.replace(/[^0-9+]/g, '');

  if (normalizedCurrent !== normalizedNew) {
    const { error: phoneError } = await supabase
      .from('sq_memberships')
      .update({ parent_phone: parentPhone })
      .eq('user_id', userId);

    if (phoneError) {
      if (phoneError.message.includes('uq_sq_memberships_parent_phone')) {
        return { ok: false, nameOk: true, phoneOk: false, message: 'Name saved! But this WhatsApp number is already linked to another account. Please use a different number.' };
      }
      return { ok: false, nameOk: true, phoneOk: false, message: `Name saved, but could not save phone: ${phoneError.message}` };
    }
  }
  phoneOk = true;

  // Step 3: Upsert parent_profiles
  const profileEmail = email || '';
  await supabase
    .from('parent_profiles')
    .upsert({ id: userId, full_name: parentName, email: profileEmail, phone: parentPhone }, { onConflict: 'id' });

  return { ok: true, nameOk, phoneOk };
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

function daysUntil(dateStr: string): number {
  const d = parseDateOnly(dateStr);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86400000));
}
function weekStart(): string {
  const d = new Date();
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return formatLocalDate(d);
}
const today = () => formatLocalDate(new Date());
const dayName = (d: Date) => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
const isFreeCheckinDay = () => FREE_CHECKIN_DAYS.includes(dayName(new Date()) as any);
const DEFAULT_STUDY_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri for both plans
const getEffectiveStudyDays = (child: SQChild | undefined): number[] => {
  const savedDays = Array.isArray(child?.study_days)
    ? child!.study_days!.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : [];
  if (savedDays.length > 0) return savedDays;
  return DEFAULT_STUDY_DAYS;
};

function getLevelDefaultCheckTime(level: string, isWeekend: boolean): string {
  const l = level.trim().toUpperCase();
  if (/^(P[1-3]|PRIMARY [1-3])$/.test(l)) return isWeekend ? '15:00' : '18:30';
  if (/^(P[4-6]|PRIMARY [4-6])$/.test(l)) return isWeekend ? '15:00' : '19:00';
  if (/^(SEC[1-3]|SECONDARY [1-3])$/.test(l)) return isWeekend ? '15:30' : '20:00';
  return isWeekend ? '16:00' : '20:00'; // Sec4/5, JC
}

function to12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

/* ─── AddSubjectInline ───────────────────────────────────────── */
const AddSubjectInline: React.FC<{
  childId: string;
  onAdded: (subject: any) => void;
}> = ({ childId, onAdded }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const SUBJECT_OPTIONS = [
    'Math', 'Science', 'English', 'Chinese', 'Malay', 'Tamil',
    'Physics', 'Chemistry', 'Biology', 'A Math', 'E Math',
    'History', 'Geography', 'Literature', 'Economics', 'Other',
  ];
  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const result = await addSubject(childId, name.trim());
    if (result) onAdded(result);
    setName('');
    setSaving(false);
  };
  return (
    <div className="mt-3 flex gap-2">
      <select
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">Select subject…</option>
        {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button
        disabled={!name || saving}
        onClick={handleAdd}
        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
      >
        {saving ? '…' : 'Add'}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════ */
const StudyPulseApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [children, setChildren] = useState<SQChild[]>([]);
  const [activeChild, setActiveChild] = useState(0);

  // per-child data
  const [subjects, setSubjects] = useState<MonitoredSubject[]>([]);
  const [exams, setExams] = useState<ExamTarget[]>([]);
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [weeklyTargets, setWeeklyTargets] = useState<WeeklyTarget[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  // UI state
  const [tab, setTab] = useState<'today'|'weekly'|'streaks'|'exams'|'reports'|'actions'|'settings'>('today');
  const [examScore, setExamScore] = useState('');
  const [examReason, setExamReason] = useState<ExamReason>('careless_mistakes');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamType, setNewExamType] = useState<'normal' | 'major'>('normal');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingExamDate, setEditingExamDate] = useState('');
  const [savingExamEdit, setSavingExamEdit] = useState(false);

  // Settings edit state
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editChildWhatsapp, setEditChildWhatsapp] = useState('');
  const [savingChildWhatsapp, setSavingChildWhatsapp] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletingAccountBusy, setDeletingAccountBusy] = useState(false);
  const [copiedChildId, setCopiedChildId] = useState<string | null>(null);
  const [submittedCTAs, setSubmittedCTAs] = useState<Set<string>>(new Set());
  const [upgraded, setUpgraded] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [openingBilling, setOpeningBilling] = useState(false);
  const [editingStudyDaysId, setEditingStudyDaysId] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [refreshingBilling, setRefreshingBilling] = useState(false);
  const [showBillingEscalation, setShowBillingEscalation] = useState(false);
  const [savingParentLanguage, setSavingParentLanguage] = useState(false);
  const [parentLanguageMessage, setParentLanguageMessage] = useState('');
  const [targetQuantities, setTargetQuantities] = useState<Record<string, string>>({});
  const [targetUnits, setTargetUnits] = useState<Record<string, string>>({});
  const [savingTargets, setSavingTargets] = useState(false);
  const [targetSaveMessage, setTargetSaveMessage] = useState('');
  const [metadataExcuses, setMetadataExcuses] = useState<Record<string, Record<string, string>>>({});
  const [childCheckTimes, setChildCheckTimes] = useState<Record<string, string>>({});
  const [savingCheckTimeId, setSavingCheckTimeId] = useState<string | null>(null);

  // Excuse modal
  const [excuseDay, setExcuseDay] = useState<{ dateStr: string; label: string } | null>(null);
  const [excuseReason, setExcuseReason] = useState('');
  const [savingExcuse, setSavingExcuse] = useState(false);
  const [excuseSaveMessage, setExcuseSaveMessage] = useState('');

  const premium = isPremium(membership);
  const child = children[activeChild];

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/studypulse/login'); return; }
      const access = await enforceParentDeviceAccess(2);
      if (!access.ok) {
        await supabase.auth.signOut();
        navigate('/studypulse/login', { replace: true, state: { error: access.reason } });
        return;
      }
      setUserId(user.id);
      const userMeta = (user.user_metadata || {}) as Record<string, any>;
      setMetadataExcuses((userMeta.studypulse_excused_days || {}) as Record<string, Record<string, string>>);
      // Ensure membership exists (Google OAuth users may not have one yet)
      let m = await getMembership(user.id);
      if (!m) {
        m = await createMembership(user.id, 'free', { email: user.email || '', language: userMeta.preferred_language === 'zh' ? 'zh' : 'en' });
      }
      if (m && (userMeta.preferred_language === 'en' || userMeta.preferred_language === 'zh')) {
        if (m.preferred_language !== userMeta.preferred_language) {
          await updateLanguagePreference(user.id, userMeta.preferred_language);
        }
        m = { ...m, preferred_language: userMeta.preferred_language };
      }
      setMembership(m);
      const kids = await getChildren(user.id);
      setChildren(kids);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!child) return;
    (async () => {
      const currentWeek = weekStart();
      const [s, e, p, wt, c, d, sm, r] = await Promise.all([
        getSubjects(child.id),
        getExamTargets(child.id),
        getWeeklyPlans(child.id),
        getWeeklyTargets(child.id, currentWeek),
        getCheckins(child.id),
        getDailyTasks(child.id, currentWeek, today()),
        getWeeklySummaries(child.id),
        getExamResults(child.id),
      ]);
      setSubjects(s); setExams(e); setPlans(p); setWeeklyTargets(wt); setCheckins(c);
      setDailyTasks(d); setSummaries(sm); setResults(r);

      const nextQuantities: Record<string, string> = {};
      const nextUnits: Record<string, string> = {};
      s.forEach((subject) => {
        const existingTarget = wt.find(t => t.subject_name === subject.subject_name);
        nextQuantities[subject.id] = existingTarget ? String(existingTarget.target_quantity) : '';
        nextUnits[subject.id] = existingTarget?.target_unit || 'questions';
      });
      setTargetQuantities(nextQuantities);
      setTargetUnits(nextUnits);
      setTargetSaveMessage('');
    })();
  }, [child]);

  useEffect(() => {
    if (!supabase || children.length === 0) return;
    (async () => {
      const childIds = children.map((c) => c.id);
      const { data } = await supabase
        .from('sq_study_settings')
        .select('child_id, first_reminder_time')
        .in('child_id', childIds);

      const next: Record<string, string> = {};
      (data || []).forEach((row: any) => {
        if (row?.child_id && row?.first_reminder_time) {
          next[row.child_id] = row.first_reminder_time;
        }
      });
      setChildCheckTimes(next);
    })();
  }, [children]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const billing = params.get('billing');
    if (billing === 'success') {
      setShowBillingEscalation(false);
      setDashboardNotice({ type: 'success', text: 'Payment received. Premium access will refresh shortly.' });
    } else if (billing === 'cancel') {
      setShowBillingEscalation(false);
      setDashboardNotice({ type: 'info', text: 'Checkout was canceled. No charge was made.' });
    } else if (billing === 'setup_error') {
      setShowBillingEscalation(false);
      setDashboardNotice({ type: 'error', text: 'Your account was created, but checkout did not start. Please use Billing below to retry.' });
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('billing') !== 'success' || !userId) return;

    let cancelled = false;
    let attempts = 0;

    const pollMembership = async () => {
      if (cancelled) return;
      setRefreshingBilling(true);

      const nextMembership = await getMembership(userId);
      if (cancelled) return;

      if (nextMembership) {
        setMembership(nextMembership);
        if (isPremium(nextMembership)) {
          // Clear any stale free-plan pending check-ins for today so the premium
          // daily cron can send a fresh prompt the same evening.
          if (supabase && userId) {
            const todayStr = new Date(Date.now() + 8 * 3600000).toISOString().split('T')[0];
            const { data: kids } = await supabase.from('sq_children').select('id').eq('parent_id', userId);
            if (kids && kids.length > 0) {
              const childIds = kids.map((k: any) => k.id);
              await supabase.from('sq_checkins')
                .delete()
                .in('child_id', childIds)
                .eq('checkin_date', todayStr)
                .eq('status', 'pending');
            }
          }
          setRefreshingBilling(false);
          setShowBillingEscalation(false);
          setUpgraded(true);
          setDashboardNotice({ type: 'success', text: 'Premium access is now active. Daily check-ins will begin from tonight.' });
          return;
        }
      }

      attempts += 1;
      if (attempts >= 15) {
        setRefreshingBilling(false);
        setShowBillingEscalation(true);
        setDashboardNotice({ type: 'info', text: 'Payment was received. Premium unlock is still syncing. If access does not update in a minute, contact admin and we can unlock it manually.' });
        return;
      }

      window.setTimeout(pollMembership, 2000);
    };

    void pollMembership();

    return () => {
      cancelled = true;
      setRefreshingBilling(false);
    };
  }, [location.search, userId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100"><div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" /><p className="text-sm text-slate-500">Loading dashboard…</p></div></div>;

  // ── Inline onboarding when no children exist yet ──
  if (!membership || children.length === 0) return <OnboardingWizard userId={userId!} membership={membership} onComplete={async () => {
    if (!userId) return;
    const m = await getMembership(userId);
    setMembership(m);
    const kids = await getChildren(userId);
    setChildren(kids);
  }} />;

  const displayChildren = premium ? children : children.slice(0, 1);
  const displaySubjects = premium ? subjects : subjects.slice(0, 1);
  const nextExam = exams.filter(e => e.cycle_status === 'active').sort((a, b) => a.exam_date.localeCompare(b.exam_date))[0];
  const currentPlan = plans.find(p => p.week_start === weekStart());

  // Streak: count consecutive recent check-ins/tasks with positive status
  const computeStreak = (): number => {
    const items = premium
      ? [...dailyTasks].sort((a, b) => b.task_date.localeCompare(a.task_date))
      : [...checkins].sort((a, b) => b.checkin_date.localeCompare(a.checkin_date));
    let streak = 0;
    for (const item of items) {
      const s = 'status' in item ? item.status : '';
      if (s === 'done' || s === 'did_extra' || s === 'yes') streak++;
      else break;
    }
    return streak;
  };
  const streak = computeStreak();
  const billingDaysLeft = membership?.current_period_end ? daysUntil(membership.current_period_end.split('T')[0]) : null;
  const billingHelperText = premium && billingDaysLeft !== null
    ? membership?.stripe_subscription_id
      ? `Monthly Flex renews automatically in ${billingDaysLeft} day${billingDaysLeft === 1 ? '' : 's'}.`
      : `Your premium pass ends in ${billingDaysLeft} day${billingDaysLeft === 1 ? '' : 's'}. Renew before it expires to keep daily check-ins active.`
    : null;

  const getBillingEscalationLink = (): string => {
    const supportNumber = '6598882675';
    const message = [
      'Hi admin, I paid for StudyPulse but premium is still locked.',
      `User ID: ${userId || '-'}`,
      `Name: ${membership?.parent_name || '-'}`,
      `Email: ${membership?.parent_email || '-'}`,
      `Phone: ${membership?.parent_phone || '-'}`,
      `Plan Type: ${membership?.plan_type || '-'}`,
      `Status: ${membership?.status || '-'}`,
      membership?.current_period_end ? `Current Period End: ${membership.current_period_end}` : 'Current Period End: -',
    ].join('\n');
    return `https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleUpgrade = async (plan: CheckoutPlan = 'monthly_flex') => {
    if (!userId || upgrading) return;
    setDashboardNotice(null);
    setUpgrading(true);

    try {
      const checkout = await startPremiumCheckout(plan);
      if (checkout.ok && checkout.url) {
        window.location.assign(checkout.url);
        return;
      }

      setDashboardNotice({ type: 'error', text: checkout.message || 'Could not start secure checkout yet. Please try again.' });
    } catch (err: any) {
      setDashboardNotice({ type: 'error', text: err?.message || 'Something went wrong starting checkout. Please try again.' });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    if (openingBilling) return;
    setDashboardNotice(null);
    setOpeningBilling(true);

    const portal = await openBillingPortal();
    if (portal.ok && portal.url) {
      window.location.assign(portal.url);
      return;
    }

    setDashboardNotice({ type: 'error', text: portal.message || 'Could not open billing settings yet.' });
    setOpeningBilling(false);
  };

  const handlePermanentDeleteAccount = async () => {
    if (!supabase || deletingAccountBusy) return;

    setDeletingAccountBusy(true);
    setDashboardNotice(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setDashboardNotice({ type: 'error', text: 'Please sign in again before deleting account.' });
        setDeletingAccountBusy(false);
        return;
      }

      const response = await fetch('/api/studypulse/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: true }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        setDashboardNotice({
          type: 'error',
          text: payload?.error || 'Could not permanently delete your account. Please try again.',
        });
        setDeletingAccountBusy(false);
        return;
      }

      await supabase.auth.signOut();
      navigate('/studypulse/login', {
        replace: true,
        state: { success: 'Your StudyPulse account was permanently deleted.' },
      });
    } catch (error: any) {
      setDashboardNotice({ type: 'error', text: error?.message || 'Unexpected delete account error.' });
      setDeletingAccountBusy(false);
    }
  };

  const handleExamResult = async (targetId: string) => {
    if (!child || !examScore) return;
    const parsedScore = parseFloat(examScore);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setDashboardNotice({ type: 'error', text: 'Please enter a valid exam score between 0 and 100.' });
      return;
    }
    const examTarget = exams.find(e => e.id === targetId);
    const ok = await submitExamResult({ child_id: child.id, subject_id: examTarget?.subject_id || displaySubjects[0]?.id, exam_target_id: targetId, score: parsedScore, reason: examReason });
    if (!ok) {
      setDashboardNotice({ type: 'error', text: 'Could not save the exam result yet. Please try again.' });
      return;
    }
    setDashboardNotice({ type: 'success', text: 'Exam result saved.' });
    setExamScore('');
    const r = await getExamResults(child.id);
    setResults(r);
  };

  const handleCTA = async (table: 'sq_tutor_requests'|'sq_diagnostic_requests'|'sq_crash_course_interest'|'sq_holiday_programme_interest'|'sq_account_disputes', reason?: string) => {
    if (!userId || !child) return;
    // Best-effort DB insert — embed readable info so admin queue never shows raw UUIDs
    const ok = await submitCTARequest(table, userId, child.id, {
      trigger_reason: reason,
      parent_name: membership?.parent_name || '',
      parent_phone: membership?.parent_phone || '',
      parent_email: membership?.parent_email || '',
      child_name: child.name,
      child_level: child.level,
    }).catch(() => false);
    setSubmittedCTAs(prev => new Set([...prev, table]));
    const requestLabel = {
      sq_tutor_requests: 'Tutor Request',
      sq_diagnostic_requests: 'Diagnostic Booking',
      sq_crash_course_interest: 'Crash Course Interest',
      sq_holiday_programme_interest: 'Holiday Programme Interest',
      sq_account_disputes: 'Account Dispute',
    }[table];
    if (ok) {
      setDashboardNotice({ type: 'success', text: `✅ ${requestLabel} submitted for ${child.name}. Our team will WhatsApp you within 24 hours.` });
    } else {
      setDashboardNotice({ type: 'success', text: `${requestLabel} for ${child.name} noted — we'll be in touch via WhatsApp shortly.` });
    }
  };

  const openCrashCourseWhatsApp = () => {
    const name = child?.name ?? 'my child';
    const level = child?.level ?? '';
    const msg = encodeURIComponent(
      `Hi, I'd like to find out more about the June Holiday Crash Course for ${name}${level ? ` (${level})` : ''}. Please send me more details. Thank you!`
    );
    window.open(`https://wa.me/6598882675?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const openHolidayProgrammeWhatsApp = () => {
    const name = child?.name ?? 'my child';
    const msg = encodeURIComponent(
      `Hi, I'd like to find out more about the Holiday Programme for ${name}. Please send me more details. Thank you!`
    );
    window.open(`https://wa.me/6598882675?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const getParentActivationLink = (childNameOverride?: string) => {
    const parentName = membership?.parent_name?.trim() || 'the parent';
    const childName = childNameOverride || child?.name || 'my child';
    const msg = encodeURIComponent(
      `Hi StudyPulse, I'm ${parentName}, parent of ${childName}. Please activate my weekly parent updates.`
    );
    return `https://wa.me/6589598553?text=${msg}`;
  };

  const handleSaveWeeklyTargets = async () => {
    if (!child) return;
    const studyDaysCount = Math.max(1, getEffectiveStudyDays(child).length);
    const currentWeek = weekStart();
    setSavingTargets(true);
    setTargetSaveMessage('');

    const ops = await Promise.all(displaySubjects.map(async (subject) => {
      const raw = (targetQuantities[subject.id] || '').trim();
      const unit = targetUnits[subject.id] || 'questions';

      if (!raw || Number(raw) <= 0) {
        return deleteWeeklyTarget(child.id, subject.subject_name, currentWeek);
      }

      const quantity = Number(raw);
      if (!Number.isFinite(quantity)) return false;

      return upsertWeeklyTarget({
        child_id: child.id,
        subject_name: subject.subject_name,
        week_start: currentWeek,
        target_quantity: quantity,
        target_unit: unit,
        study_days_count: studyDaysCount,
      });
    }));

    if (ops.every(Boolean)) {
      const refreshedTargets = await getWeeklyTargets(child.id, currentWeek);
      setWeeklyTargets(refreshedTargets);
      setTargetSaveMessage('Weekly targets saved. StudyPulse will use these for daily reminders.');
      setDashboardNotice({ type: 'success', text: 'Weekly targets updated successfully.' });
    } else {
      setTargetSaveMessage('Could not save all weekly targets yet. Please try again.');
      setDashboardNotice({ type: 'error', text: 'Some weekly targets could not be saved.' });
    }

    setSavingTargets(false);
  };

  // Build weekly grid data
  const buildWeekGrid = () => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return days.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      d.setHours(12, 0, 0, 0);
      const dateStr = formatLocalDate(d);
      const isPast = dateStr < today();
      const isToday = dateStr === today();
      // Check for check-in or daily task on this date
      const task = dailyTasks.find(t => t.task_date === dateStr);
      const checkin = checkins.find(c => c.checkin_date === dateStr);
      const metadataExcuse = child ? metadataExcuses[child.id]?.[dateStr] : undefined;
      // Only mark as missed on days that are actually study days for this child
      const childStudyDays: number[] = getEffectiveStudyDays(child);
      const ccaDays: number[] = child?.cca_days || [];
      const dayOfWeek = d.getDay(); // 0=Sun
      const isStudyDay = childStudyDays.includes(dayOfWeek);
      const isCCADay = ccaDays.includes(dayOfWeek);
      const status = metadataExcuse || checkin?.status === 'excused'
        ? 'excused'
        : task?.status || checkin?.status || (isCCADay ? 'cca' : (isPast && isStudyDay ? 'missed' : null));
      return { label, dateStr, isPast, isToday, status };
    });
  };

  // Subject breakdown from check-ins/tasks
  const subjectBreakdown = () => {
    const counts: Record<string, { done: number; total: number }> = {};
    for (const s of displaySubjects) {
      const taskCount = dailyTasks.filter(t => t.subject_id === s.id).length;
      const doneCount = dailyTasks.filter(t => t.subject_id === s.id && (t.status === 'done' || t.status === 'did_extra')).length;
      const checkinCount = checkins.filter(c => c.subject_id === s.id).length;
      const checkinDone = checkins.filter(c => c.subject_id === s.id && c.status === 'yes').length;
      counts[s.subject_name] = { done: doneCount + checkinDone, total: taskCount + checkinCount };
    }
    return counts;
  };

  const chipActive = 'bg-slate-900 text-white';
  const chipInactive = 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';
  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  const TABS: { id: typeof tab; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'weekly', label: 'This Week', icon: CalendarDays },
    { id: 'streaks', label: 'Streaks', icon: Flame },
    { id: 'exams', label: 'Exams', icon: Target },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Returns check-in time label. Parent-set time takes priority, then level default fallback.
  function getCheckinTimeLabel(childRow: SQChild): string {
    const now = new Date();
    const sgDay = new Date(now.getTime() + 8 * 60 * 60 * 1000).getUTCDay();
    const isWeekend = sgDay === 0 || sgDay === 6;
    return to12h(getEffectiveCheckinTimeValue(childRow, isWeekend));
  }

  function getEffectiveCheckinTimeValue(childRow: SQChild, isWeekend: boolean): string {
    const raw = childCheckTimes[childRow.id];
    if (!raw) return getLevelDefaultCheckTime(childRow.level, isWeekend);

    const timeHHMM = raw.slice(0, 5);
    return timeHHMM;
  }

  const CHECK_TIME_OPTIONS = [
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-300">StudyPulse</p>
            <p className="text-sm font-semibold">
              {membership?.parent_name
                ? `Hi, ${membership.parent_name.split(' ')[0]}`
                : membership?.parent_email
                ? membership.parent_email
                : membership?.plan_type === 'free' ? 'Free Plan' : 'Premium'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => { if (supabase) { await supabase.auth.signOut(); navigate('/studypulse'); } }}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Sign Out
            </button>
            {!premium && (
              <button onClick={() => setShowPlanModal(true)} className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">
                <Crown size={12} className="mr-1" /> Upgrade
              </button>
            )}
            <Link to="/studypulse" className="text-xs text-slate-400 hover:text-white">Overview</Link>
          </div>
        </div>
      </header>

      {/* Child selector */}
      {displayChildren.length > 1 && (
        <div className="border-b border-slate-200 bg-white px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-6xl gap-2">
            {displayChildren.map((c, i) => (
              <button key={c.id} onClick={() => setActiveChild(i)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${i === activeChild ? chipActive : chipInactive}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab nav */}
      <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 overflow-x-auto">
        <div className="mx-auto flex max-w-6xl gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition ${tab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* Global notice banner — visible on every tab */}
        {dashboardNotice && (
          <div className={`mb-5 rounded-2xl border p-4 ${
            dashboardNotice.type === 'error'
              ? 'border-red-200 bg-red-50'
              : dashboardNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}>
            <p className={`text-sm font-semibold ${
              dashboardNotice.type === 'error'
                ? 'text-red-700'
                : dashboardNotice.type === 'success'
                ? 'text-emerald-700'
                : 'text-amber-800'
            }`}>{dashboardNotice.text}</p>
            {showBillingEscalation && !premium && (
              <div className="mt-3">
                <a
                  href={getBillingEscalationLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50"
                >
                  I paid but premium is still locked
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── TODAY ── */}
        {tab === 'today' && (
          <div className="space-y-5">

            {/* Setup guide for new parents */}
            {children.length > 0 && children.some(c => !c.whatsapp_number || checkins.length === 0) && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <BookOpen size={16} /> Quick Setup Guide
                </h3>
                <div className="mt-3 space-y-3 text-xs text-blue-800">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">1</span>
                    <div>
                      <p className="font-bold">Choose study days &amp; set weekly target</p>
                      <p className="text-blue-700">Go to <strong>Settings</strong> tab → pick which days your child studies. Then in <strong>Targets</strong> tab, set the weekly goal (e.g. 20 questions of Math).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">2</span>
                    <div>
                      <p className="font-bold">Activate your WhatsApp</p>
                      <p className="text-blue-700">In <strong>Settings</strong> → scroll to your Account card → tap <strong>&ldquo;Activate parent updates&rdquo;</strong>. This lets you receive reports.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">3</span>
                    <div>
                      <p className="font-bold">Send the activation link to your child</p>
                      <p className="text-blue-700">In <strong>Settings</strong> → find your child&apos;s card → tap <strong>&ldquo;🔗 Copy link to send to [name]&rdquo;</strong> and send it to them via WhatsApp or SMS. They must tap it on <em>their own phone</em>.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">4</span>
                    <div>
                      <p className="font-bold">Done! Check-ins will start automatically</p>
                      <p className="text-blue-700">{premium ? 'Your child will get a WhatsApp prompt every study day evening.' : 'Your child will get bundled check-ins every Tue, Thu & Sat evening.'} You&apos;ll receive reports automatically.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Today's status per child */}
            {displayChildren.map((c, ci) => {
              const todayTask = dailyTasks.find(t => t.task_date === today() && (t.subject_id ? true : true));
              const todayCheckin = checkins.find(ch => ch.checkin_date === today());
              const status = todayTask?.status || todayCheckin?.status || null;
              const statusLabel = status === 'done' || status === 'did_extra' ? '✅ Done' : status === 'yes' ? '✅ Studied' : status === 'partially' ? '~ Partially' : status === 'no' || status === 'incomplete' ? '❌ No' : status === 'postpone' ? '⏸ Postponed' : null;
              const childSubjects = displaySubjects.filter(s => s.child_id === c.id || ci === activeChild);

              return (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.level}</p>
                    </div>
                    <div className="text-right">
                      {streak > 0 && <p className="text-sm font-bold text-amber-600">🔥 {streak}-day streak</p>}
                    </div>
                  </div>

                  {/* Today's check-in result */}
                  <div className={`mt-4 rounded-xl p-4 ${statusLabel ? (status === 'done' || status === 'did_extra' || status === 'yes' ? 'bg-emerald-50 border border-emerald-200' : status === 'partially' || status === 'postpone' ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200') : 'bg-slate-50 border border-slate-200'}`}>
                    {statusLabel ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Today&apos;s Check-in</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {todayTask?.note || todayCheckin?.note || 'Checked in via WhatsApp'}
                          </p>
                        </div>
                        <span className="text-2xl">{statusLabel.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-700">Waiting for check-in</p>
                          <p className="mt-1 text-xs text-slate-500">{c.name} will receive a WhatsApp prompt at <strong>{getCheckinTimeLabel(c)}</strong>{(() => { const sgDay = new Date(new Date().getTime() + 8*60*60*1000).getUTCDay(); return sgDay === 0 || sgDay === 6 ? ' today.' : ' tonight.'; })()}</p>
                        </div>
                        <Clock3 size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Subject + exam summary */}
                  <div className="mt-4 space-y-2">
                    {childSubjects.map((s) => {
                      const exam = exams.find(e => e.subject_id === s.id && e.cycle_status === 'active');
                      return (
                        <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                          <span className="text-sm font-semibold text-slate-700">{s.subject_name}</span>
                          {exam && <span className="text-xs font-bold text-amber-600">{daysUntil(exam.exam_date)} days to exam</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Streak celebration */}
            {streak >= 3 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <Flame size={24} className="text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {streak >= 14 ? `${streak}-day streak! Amazing consistency!` : streak >= 7 ? `${streak}-day streak! One full week!` : `${streak}-day streak! Keep it going!`}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {streak >= 7 ? 'This kind of consistency builds real results before exams.' : 'Your child is building a great study rhythm.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade success banner */}
            {upgraded && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">🎉 Welcome to Premium!</p>
                <p className="mt-1 text-xs text-emerald-700">Daily check-ins, all subjects, and unlimited children are now active.</p>
              </div>
            )}

            {/* Free plan upgrade nudge */}
            {!premium && !upgraded && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Crown size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Free plan: Tue, Thu, Sat check-ins</p>
                    <p className="mt-1 text-xs text-slate-600">Upgrade for daily check-ins, all subjects, and unlimited children.</p>
                    <button onClick={() => setShowPlanModal(true)} className="mt-2 inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">
                      Choose a plan <ArrowRight size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── THIS WEEK ── */}
        {tab === 'weekly' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">This Week</h2>
              <p className="mt-1 text-xs text-slate-500">Week of {weekStart()}</p>

              {/* Excuse modal */}
              {excuseDay && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4" onClick={() => { setExcuseDay(null); setExcuseReason(''); setExcuseSaveMessage(''); }}>
                  <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-black text-slate-900">Mark {excuseDay.label} as excused</h3>
                    <p className="mt-1 text-xs text-slate-500">This day won't count as missed and will show ⭐ on the grid.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {['Sick / unwell', 'School event', 'Family event', 'Overseas / holiday', 'Exam / test day', 'Other'].map(r => (
                        <button
                          key={r}
                          onClick={() => { setExcuseReason(r); setExcuseSaveMessage(''); }}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold text-left transition ${
                            excuseReason === r
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >{r}</button>
                      ))}
                    </div>
                    {excuseSaveMessage && <p className="mt-3 text-xs text-red-600">{excuseSaveMessage}</p>}
                    <div className="mt-3 flex gap-2">
                      <button
                        disabled={!excuseReason || savingExcuse}
                        onClick={async () => {
                          if (!child || !excuseReason) return;
                          setExcuseSaveMessage('');
                          setSavingExcuse(true);
                          const ok = await upsertExcuse(child.id, excuseDay.dateStr, excuseReason);
                          if (ok) {
                            setMetadataExcuses(prev => ({
                              ...prev,
                              [child.id]: {
                                ...(prev[child.id] || {}),
                                [excuseDay.dateStr]: excuseReason,
                              },
                            }));
                            setCheckins(prev => {
                              const filtered = prev.filter(c => c.checkin_date !== excuseDay.dateStr);
                              return [...filtered, { id: excuseDay.dateStr, child_id: child.id, checkin_date: excuseDay.dateStr, status: 'excused' as any, note: excuseReason }];
                            });
                            setSavingExcuse(false);
                            setExcuseDay(null);
                            setExcuseReason('');
                            setExcuseSaveMessage('');
                            return;
                          }
                          setSavingExcuse(false);
                          setExcuseSaveMessage('Could not save the excuse yet. Please try again.');
                        }}
                        className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                      >
                        {savingExcuse ? 'Saving…' : 'Mark as excused'}
                      </button>
                      <button onClick={() => { setExcuseDay(null); setExcuseReason(''); setExcuseSaveMessage(''); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 7-day grid */}
              <div className="mt-4 grid grid-cols-7 gap-2">
                {buildWeekGrid().map((d) => {
                  const isExcusable = (d.status === 'no' || d.status === 'incomplete' || d.status === 'missed' || d.status === 'forgot') && d.isPast;
                  const bg = d.status === 'done' || d.status === 'did_extra' || d.status === 'yes'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : d.status === 'partially' || d.status === 'postpone'
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : d.status === 'no' || d.status === 'incomplete' || d.status === 'missed' || d.status === 'forgot'
                    ? 'bg-red-50 border-red-200 text-red-400'
                    : d.status === 'excused'
                    ? 'bg-slate-100 border-slate-300 text-slate-500'
                    : d.status === 'cca'
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : d.isToday
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400';
                  const icon = d.status === 'done' || d.status === 'did_extra' || d.status === 'yes'
                    ? '✅' : d.status === 'partially' || d.status === 'postpone'
                    ? '~' : d.status === 'no' || d.status === 'incomplete'
                    ? '✗' : d.status === 'forgot'
                    ? '😴' : d.status === 'excused'
                    ? '⭐' : d.status === 'cca'
                    ? '🏃' : d.status === 'missed'
                    ? '—' : d.isToday ? '•' : '';
                  return (
                    <div
                      key={d.label}
                      onClick={() => isExcusable ? setExcuseDay({ dateStr: d.dateStr, label: d.label }) : undefined}
                      className={`rounded-xl border p-2.5 text-center ${bg} ${isExcusable ? 'cursor-pointer hover:ring-2 hover:ring-slate-400' : ''}`}
                    >
                      <p className="text-[10px] font-bold uppercase">{d.label}</p>
                      <p className="mt-1 text-lg">{icon}</p>
                      {isExcusable && <p className="text-[9px] text-slate-400 mt-0.5">tap</p>}
                    </div>
                  );
                })}
              </div>

              {/* Week summary stats */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {(() => {
                  const week = buildWeekGrid();
                  const done = week.filter(d => d.status === 'done' || d.status === 'did_extra' || d.status === 'yes').length;
                  const partial = week.filter(d => d.status === 'partially' || d.status === 'postpone').length;
                  const missed = week.filter(d => d.status === 'no' || d.status === 'incomplete' || d.status === 'missed' || d.status === 'forgot').length;
                  return (
                    <>
                      <div className="rounded-xl bg-emerald-50 p-3 text-center">
                        <p className="text-xl font-black text-emerald-700">{done}</p>
                        <p className="text-[10px] text-emerald-600">Completed</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-3 text-center">
                        <p className="text-xl font-black text-amber-700">{partial}</p>
                        <p className="text-[10px] text-amber-600">Partial</p>
                      </div>
                      <div className="rounded-xl bg-red-50 p-3 text-center">
                        <p className="text-xl font-black text-red-500">{missed}</p>
                        <p className="text-[10px] text-red-400">Missed</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Free plan day indicator */}
              {!premium && (
                <p className="mt-4 text-xs text-slate-500">
                  Free plan check-ins: <strong className="text-emerald-600">Tue, Thu, Sat</strong> (bundled — covers all your study days). Upgrade for daily check-ins.
                </p>
              )}
            </div>

            {/* Recent check-in history */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-700">Recent Check-ins</h3>
              {(premium ? dailyTasks : checkins).length === 0 ? (
                <p className="text-sm text-slate-500">No check-ins recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {(premium
                    ? dailyTasks.slice(0, 10).map(t => ({ date: t.task_date, status: t.status, note: t.note }))
                    : checkins.slice(0, 10).map(c => ({ date: c.checkin_date, status: c.status, note: c.note }))
                  ).map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                      <div>
                        <span className="text-xs font-semibold text-slate-700">{item.date}</span>
                        {item.note && <span className="ml-2 text-xs text-slate-400">{item.note}</span>}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.status === 'done' || item.status === 'did_extra' || item.status === 'yes' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'partially' || item.status === 'postpone' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-600'
                      }`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STREAKS ── */}
        {tab === 'streaks' && (
          <div className="space-y-5">
            {/* Current streak hero */}
            <div className={`rounded-2xl p-6 text-center ${streak >= 7 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : streak >= 3 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
              <Flame size={40} className={`mx-auto ${streak >= 3 ? 'text-white' : 'text-slate-300'}`} />
              <p className="mt-3 text-5xl font-black">{streak}</p>
              <p className="mt-1 text-sm font-semibold">{streak === 0 ? 'No active streak' : streak === 1 ? 'day streak' : 'day streak'}</p>
              <p className="mt-2 text-xs opacity-80">
                {streak >= 14 ? 'Incredible consistency. This is what builds exam confidence.' :
                 streak >= 7 ? 'One full week of daily check-ins. The habit is forming.' :
                 streak >= 3 ? 'Great start! 3+ days shows real commitment.' :
                 streak === 0 ? 'Every streak starts with one check-in.' :
                 'Keep going — 3 days is the first milestone!'}
              </p>
            </div>

            {/* Subject breakdown */}
            {displaySubjects.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Subject Breakdown</h3>
                {Object.entries(subjectBreakdown()).map(([subject, { done, total }]) => (
                  <div key={subject} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700">{subject}</span>
                      <span className="text-xs text-slate-500">{done}/{total} completed</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
                {Object.keys(subjectBreakdown()).length === 0 && (
                  <p className="text-sm text-slate-500">Check-in data will appear here as your child reports subjects.</p>
                )}
              </div>
            )}

            {/* Consistency insights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-700">Milestones</h3>
              <div className="space-y-3">
                {[
                  { days: 3, label: '3-day streak', emoji: '🔥', desc: 'The habit begins' },
                  { days: 7, label: '7-day streak', emoji: '🔥🔥', desc: 'One full week' },
                  { days: 14, label: '14-day streak', emoji: '🏆', desc: 'Two weeks strong' },
                  { days: 30, label: '30-day streak', emoji: '🌟', desc: 'Study habit locked in' },
                ].map((m) => (
                  <div key={m.days} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${streak >= m.days ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                    <span className="text-xl">{streak >= m.days ? m.emoji : '🔒'}</span>
                    <div>
                      <p className={`text-sm font-bold ${streak >= m.days ? 'text-emerald-700' : 'text-slate-400'}`}>{m.label}</p>
                      <p className="text-xs text-slate-500">{m.desc}</p>
                    </div>
                    {streak >= m.days && <Check size={16} className="ml-auto text-emerald-600" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EXAMS ── */}
        {tab === 'exams' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Exam Tracker</h2>
              {exams.filter(e => e.cycle_status === 'active').length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No active exam targets.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {exams.filter(e => e.cycle_status === 'active').map((e) => {
                    const subj = subjects.find(s => s.id === e.subject_id);
                    const days = daysUntil(e.exam_date);
                    return (
                      <div key={e.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{subj?.subject_name || 'Subject'}</p>
                            <p className="text-xs text-slate-500">{e.exam_type === 'major' ? 'Major' : 'Normal'} Exam · {e.exam_date}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-black ${days <= 14 ? 'text-amber-600' : days <= 30 ? 'text-amber-500' : 'text-emerald-600'}`}>{days}</p>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">days left</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div className={`h-2 rounded-full ${days <= 14 ? 'bg-amber-500' : days <= 30 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.max(5, Math.min(100, 100 - days))}%` }} />
                        </div>
                        {/* Check-in consistency leading up to exam */}
                        <p className="mt-2 text-xs text-slate-500">
                          Current streak: <strong className="text-slate-700">{streak} days</strong> · {streak >= 7 ? 'Great momentum heading into this exam.' : streak >= 3 ? 'Building consistency.' : 'Daily check-ins build exam confidence.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Enter exam result */}
            {exams.filter(e => e.cycle_status === 'active' && daysUntil(e.exam_date) === 0).length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="text-sm font-bold text-slate-900">Enter Exam Result</h3>
                <p className="mt-1 text-xs text-slate-500">An exam date has passed. Record the result below.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input className={inputCls} type="number" placeholder="Score" min="0" max="100" value={examScore} onChange={(e) => setExamScore(e.target.value)} />
                  <select className={inputCls} value={examReason} onChange={(e) => setExamReason(e.target.value as ExamReason)}>
                    <option value="careless_mistakes">Careless mistakes</option>
                    <option value="dont_understand_topic">Don&apos;t understand topic</option>
                    <option value="didnt_finish_paper">Didn&apos;t finish paper</option>
                    <option value="no_revision">No revision</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button onClick={() => handleExamResult(exams.find(e => daysUntil(e.exam_date) === 0)!.id)} disabled={!examScore} className="mt-3 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  Submit Result
                </button>
              </div>
            )}

            {/* Exam history */}
            {results.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Exam History</h3>
                {results.map((r) => {
                  const subj = subjects.find(s => s.id === r.subject_id);
                  return (
                    <div key={r.id} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                      <div>
                        <span className="text-sm font-semibold text-slate-700">{subj?.subject_name || 'Subject'}</span>
                        <span className="ml-2 text-xs text-slate-400">{r.entered_at?.split('T')[0]}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900">{r.score}</span>
                        {r.reason && <p className="text-[10px] text-slate-400">{r.reason.replace(/_/g, ' ')}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === 'reports' && (
          <ReportsPanel
            child={child}
            premium={premium}
            summaries={summaries}
            checkins={checkins}
            dailyTasks={dailyTasks}
            subjects={displaySubjects}
            exams={exams}
            streak={streak}
            onUpgrade={() => setShowPlanModal(true)}
          />
        )}

        {/* ── ACTIONS ── */}
        {tab === 'actions' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Actions &amp; Support</h2>
              <p className="mt-1 text-xs text-slate-500">Extra help when your child needs it.</p>
              <p className="mt-2 text-xs text-slate-600">
                Every button here sends a request into our internal StudyPulse admin queue, and our team follows up via WhatsApp.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Search size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Request Tutor</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Need a tutor for a subject? We&apos;ll match you with a vetted tutor.</p>
                <p className="mt-1 text-[11px] text-slate-400">This submits directly to the StudyPulse Admin Requests queue.</p>
                {submittedCTAs.has('sq_tutor_requests') ? (
                  <p className="mt-3 rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700">✅ Request sent — we&apos;ll WhatsApp you within 24 hours.</p>
                ) : (
                  <button onClick={() => handleCTA('sq_tutor_requests', 'manual_request')} className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Find a Tutor</button>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><Microscope size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Book Diagnostic</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Results not improving despite effort? A diagnostic can identify the issue.</p>
                <p className="mt-1 text-[11px] text-slate-400">This submits directly to the StudyPulse Admin Requests queue.</p>
                {submittedCTAs.has('sq_diagnostic_requests') ? (
                  <p className="mt-3 rounded-lg bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-700">✅ Booking received — we&apos;ll WhatsApp you within 24 hours to confirm.</p>
                ) : (
                  <button onClick={() => handleCTA('sq_diagnostic_requests', 'manual_request')} className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-bold text-white">Book Diagnostic</button>
                )}
              </article>

              <article className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Flame size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Crash Course</h3>
                <p className="mt-1 text-[11px] font-semibold text-orange-600">📅 June Holidays · 16-25 Jun 2026</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">Half-day model: PSLE morning track (10am-1pm, Math/Science alternating daily) + O-Level afternoon track (2pm-5pm, Physics/Chem/A Math/E Math sprints). All materials provided. Max 6 per class.</p>
                {submittedCTAs.has('sq_crash_course_interest') ? (
                  <p className="mt-3 rounded-lg bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-700">✅ Interest registered — we'll WhatsApp you with details!</p>
                ) : (
                  <button
                    onClick={() => { handleCTA('sq_crash_course_interest', 'manual_request'); openCrashCourseWhatsApp(); }}
                    className="mt-3 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-400"
                  >
                    🔥 Reserve a Spot — WhatsApp Us
                  </button>
                )}
                <div className="mt-2 flex gap-3">
                  <a href="/family/crash-courses/psle-june-intensive" className="text-xs font-semibold text-sky-600 underline">PSLE Intensive →</a>
                  <a href="/family/crash-courses/o-level-june-intensive" className="text-xs font-semibold text-emerald-600 underline">O-Level Intensive →</a>
                </div>
              </article>

              <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><GraduationCap size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Holiday Programme</h3>
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">📅 June & December Holidays</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">Financial literacy & life skills enrichment for P4–P6 and Sec 1–3. Fun, hands-on workshops designed to build real-world confidence alongside academic preparation.</p>
                {submittedCTAs.has('sq_holiday_programme_interest') ? (
                  <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">✅ Interest registered — we'll WhatsApp you with details!</p>
                ) : (
                  <button
                    onClick={() => { handleCTA('sq_holiday_programme_interest', 'manual_request'); openHolidayProgrammeWhatsApp(); }}
                    className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                  >
                    📲 Register Interest — WhatsApp Us
                  </button>
                )}
                <Link to="/enrichment" className="mt-2 inline-block text-xs font-semibold text-emerald-700 underline">Learn more →</Link>
              </article>

              <article className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700"><AlertCircle size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Account Dispute</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Billing mismatch, access issue, or account conflict? Send it to the StudyPulse admin dispute queue for direct follow-up.</p>
                <p className="mt-1 text-[11px] text-slate-400">Use this for premium unlock/payment/account ownership disputes.</p>
                {submittedCTAs.has('sq_account_disputes') ? (
                  <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">✅ Dispute submitted — admin will contact you via WhatsApp.</p>
                ) : (
                  <button
                    onClick={() => handleCTA('sq_account_disputes', 'account_dispute')}
                    className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-500"
                  >
                    Report Account Dispute
                  </button>
                )}
              </article>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="space-y-5">

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-bold text-sky-800">Parent Quick Guide (Start Here)</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-sky-700">
                <li>Activate WhatsApp for both parent and child (one-time setup).</li>
                <li>Set Study Days and Check-In Time for each child.</li>
                <li>Set Weekly Targets to control daily workload.</li>
                <li>Use Actions tab for tutor/diagnostic/crash-course requests.</li>
              </ol>
            </div>

            {/* WhatsApp activation reminder */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800 mb-1">📲 WhatsApp — One-Time Setup Required</p>
              <p className="text-xs text-amber-700 mb-1">
                WhatsApp won&apos;t let businesses message you first — both you and your child must send one message to activate.
              </p>
              <ul className="text-xs text-amber-700 list-disc list-inside space-y-0.5">
                <li><strong>You (parent):</strong> tap &ldquo;Activate parent updates&rdquo; in your Account card below.</li>
                <li><strong>Your child:</strong> copy the link in their card and send it to them via WhatsApp/SMS — they must tap it on <em>their own phone</em>.</li>
              </ul>
              <div className="mt-3 rounded-xl border border-amber-300 bg-white/70 p-3">
                <p className="text-xs font-bold text-amber-900">⏰ Check-In Time Defaults (if parents do not set a custom time)</p>
                <p className="mt-1 text-xs text-amber-800">StudyPulse will still auto-send check-ins using level defaults:</p>
                <p className="mt-1 text-xs text-amber-800">P1-3: 6:30pm weekday / 3:00pm weekend · P4-6: 7:00pm weekday / 3:00pm weekend</p>
                <p className="mt-1 text-xs text-amber-800">Sec1-3: 8:00pm weekday / 3:30pm weekend · Sec4/5/JC: 8:00pm weekday / 4:00pm weekend</p>
              </div>
            </div>

            {/* Study Days per child */}
            {displayChildren.map((c, ci) => {
              const DAY_LABELS = [
                { value: 0, label: 'Sun' },
                { value: 1, label: 'Mon' },
                { value: 2, label: 'Tue' },
                { value: 3, label: 'Wed' },
                { value: 4, label: 'Thu' },
                { value: 5, label: 'Fri' },
                { value: 6, label: 'Sat' },
              ];
              const savedDays: number[] = Array.isArray(c.study_days)
                ? c.study_days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
                : [];
              const currentDays: number[] = savedDays.length > 0 ? savedDays : getEffectiveStudyDays(c);
              const isEditingStudyDays = editingStudyDaysId === c.id;

              const toggleDay = async (dayNum: number) => {
                // If there is no custom schedule saved yet, treat the first tap as choosing exact days,
                // instead of toggling against the default schedule.
                const baseDays = savedDays.length > 0 ? currentDays : [];

                // Both plans allow unlimited study days

                const updated = baseDays.includes(dayNum)
                  ? baseDays.filter(d => d !== dayNum)
                  : [...baseDays, dayNum].sort();
                if (updated.length === 0) return; // must have at least 1 day
                const ok = await updateStudyDays(c.id, updated);
                if (ok) {
                  setChildren(prev => prev.map((ch, i) =>
                    ch.id === c.id ? { ...ch, study_days: updated } : ch
                  ));
                  const selectedLabels = DAY_LABELS
                    .filter((d) => updated.includes(d.value))
                    .map((d) => d.label)
                    .join(', ');
                  setDashboardNotice({
                    type: 'success',
                    text: `${c.name}'s study days updated: ${selectedLabels}. Future reminders will follow this schedule.`,
                  });
                  if (child?.id === c.id && weeklyTargets.length > 0) {
                    const recalc = await Promise.all(weeklyTargets.map((target) => upsertWeeklyTarget({
                      child_id: c.id,
                      subject_name: target.subject_name,
                      week_start: target.week_start,
                      target_quantity: target.target_quantity,
                      target_unit: target.target_unit,
                      study_days_count: updated.length,
                    })));
                    if (recalc.every(Boolean)) {
                      const refreshedTargets = await getWeeklyTargets(c.id, weekStart());
                      setWeeklyTargets(refreshedTargets);
                      setTargetSaveMessage('Study days changed, and the daily target split was updated automatically.');
                    }
                  }
                } else {
                  setDashboardNotice({ type: 'error', text: 'Could not update the study days yet. Please try again.' });
                }
              };

              return (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900">{c.name}</h3>
                  {editingChildId === c.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="tel"
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="+65 8123 4567"
                        value={editChildWhatsapp}
                        onChange={(e) => setEditChildWhatsapp(e.target.value)}
                      />
                      <button
                        disabled={savingChildWhatsapp}
                        onClick={async () => {
                          if (!supabase) return;
                          setSavingChildWhatsapp(true);
                          const normChild = normaliseSGPhone(editChildWhatsapp);

                          const currentParentPhone = membership?.parent_phone || null;
                          if (isSameWhatsAppNumber(normChild, currentParentPhone)) {
                            setDashboardNotice({
                              type: 'error',
                              text: 'Parent and child WhatsApp numbers must be different. Please use separate numbers.',
                            });
                            setSavingChildWhatsapp(false);
                            return;
                          }

                          const { error: childPhoneError } = await supabase
                            .from('sq_children')
                            .update({ whatsapp_number: normChild })
                            .eq('id', c.id);

                          if (childPhoneError) {
                            setDashboardNotice({
                              type: 'error',
                              text: childPhoneError.message || 'Could not update child WhatsApp number yet. Please try again.',
                            });
                            setSavingChildWhatsapp(false);
                            return;
                          }

                          setChildren(prev => prev.map(ch => ch.id === c.id ? { ...ch, whatsapp_number: normChild } : ch));
                          setEditingChildId(null);
                          setSavingChildWhatsapp(false);
                        }}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {savingChildWhatsapp ? '...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingChildId(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500">Cancel</button>
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-slate-500">{c.level} · WhatsApp: {c.whatsapp_number || 'Not set'}</p>
                      <button
                        onClick={() => { setEditingChildId(c.id); setEditChildWhatsapp(c.whatsapp_number || ''); }}
                        className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      {c.whatsapp_number && (
                        <span className="w-full mt-1">
                          <span className="block text-xs text-amber-700 font-semibold mb-1">⚠️ {c.name} must tap this link on their own phone:</span>
                          <span className="flex flex-wrap gap-2">
                            <button
                              onClick={async () => {
                                const link = `https://wa.me/6589598553?text=Hi+StudyPulse%2C+I'm+${encodeURIComponent(c.name)}+and+I'm+ready+for+my+daily+check-ins!`;
                                if (navigator.share) {
                                  await navigator.share({ title: 'Activate StudyPulse', url: link });
                                } else {
                                  await navigator.clipboard.writeText(link);
                                  setCopiedChildId(c.id);
                                  setTimeout(() => setCopiedChildId(null), 2000);
                                }
                              }}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              {copiedChildId === c.id ? '✅ Copied!' : '🔗 Share / Copy link to send to ' + c.name}
                            </button>
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-700">Study Days</p>
                      <button
                        onClick={() => setEditingStudyDaysId(isEditingStudyDays ? null : c.id)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold ${isEditingStudyDays ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {isEditingStudyDays ? 'Done' : 'Edit Study Days'}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Parents can change {c.name}'s study schedule anytime. The system will update automatically and remind {c.name} only on the selected days.
                    </p>
                    {isEditingStudyDays ? (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Editing is on — tap the days below to update the schedule.</p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">Need to change the plan? Tap Edit Study Days.</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      {DAY_LABELS.map((d) => {
                        const isActive = currentDays.includes(d.value);
                        return (
                          <button
                            key={d.value}
                            disabled={!isEditingStudyDays}
                            onClick={() => toggleDay(d.value)}
                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                              isActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'border border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      <strong className="text-slate-700">{currentDays.length} days</strong> selected · Daily target = weekly target ÷ {currentDays.length}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-bold text-slate-700">First Reminder Time</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Set what time {c.name} receives the first WhatsApp reminder/check-in prompt.
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      If you do not save a custom time, StudyPulse uses the level-based default timing automatically.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        value={getEffectiveCheckinTimeValue(c, false)}
                        onChange={(e) => setChildCheckTimes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      >
                        {CHECK_TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        disabled={savingCheckTimeId === c.id}
                        onClick={async () => {
                          const selected = getEffectiveCheckinTimeValue(c, false);
                          setSavingCheckTimeId(c.id);
                          await upsertStudySettings(c.id, { first_reminder_time: selected });
                          setSavingCheckTimeId(null);
                          setDashboardNotice({ type: 'success', text: `${c.name}'s first reminder time updated to ${selected}.` });
                        }}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {savingCheckTimeId === c.id ? 'Saving...' : 'Save Time'}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Used for both weekdays and weekends unless changed again.</p>
                  </div>

                  {/* CCA Days */}
                  {premium && (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-slate-700">CCA Days <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span></p>
                      <p className="mt-1 text-xs text-slate-500">
                        On CCA days {c.name} won't get a check-in prompt — no message, no missed mark.
                      </p>
                      <div className="mt-3 flex gap-2">
                        {DAY_LABELS.map((d) => {
                          const currentCCADays: number[] = c.cca_days || [];
                          const isActive = currentCCADays.includes(d.value);
                          return (
                            <button
                              key={d.value}
                              onClick={async () => {
                                const updated = isActive
                                  ? currentCCADays.filter(x => x !== d.value)
                                  : [...currentCCADays, d.value].sort();
                                const ok = await updateCCADays(c.id, updated);
                                if (ok) setChildren(prev => prev.map(ch => ch.id === c.id ? { ...ch, cca_days: updated } : ch));
                              }}
                              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold transition ${
                                isActive
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'border border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                      {(c.cca_days && c.cca_days.length > 0) && (
                        <p className="mt-2 text-xs text-slate-500">
                          🏃 CCA on: <strong className="text-amber-700">{c.cca_days.map(v => DAY_LABELS.find(d => d.value === v)?.label).join(', ')}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {!premium && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Free plan:</strong> Check-ins every Tue, Thu &amp; Sun — covering all your study days in bundles. Upgrade for daily check-ins.
                      </p>
                    </div>
                  )}

                  {/* Delete child */}
                  {deletingChildId === c.id ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-700">Delete {c.name}? This removes all their check-in history.</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={async () => {
                            if (!supabase) return;
                            await supabase.from('sq_children').delete().eq('id', c.id);
                            setChildren(prev => prev.filter(ch => ch.id !== c.id));
                            setActiveChild(0);
                            setDeletingChildId(null);
                          }}
                          className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white"
                        >
                          Yes, delete
                        </button>
                        <button onClick={() => setDeletingChildId(null)} className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-500">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingChildId(c.id)}
                      className="mt-4 text-xs font-semibold text-red-400 hover:text-red-600"
                    >
                      Delete {c.name}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Weekly Target Management */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Weekly Study Targets</h3>
              <p className="mt-1 text-xs text-slate-500">
                Parents set the weekly target here. StudyPulse will split it across the selected study days and send the child the daily target automatically after WhatsApp activation.
              </p>

              {child && !child.whatsapp_number && (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    Set the weekly target now. Once {child.name} activates WhatsApp, the system will start sending the daily target reminders.
                  </p>
                </div>
              )}

              {displaySubjects.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Add a subject first to create weekly targets.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {displaySubjects.map((subject) => {
                    const existing = weeklyTargets.find(t => t.subject_name === subject.subject_name);
                    const studyDaysCount = Math.max(1, getEffectiveStudyDays(child).length);
                    const quantity = Number(targetQuantities[subject.id] || 0);
                    const perDay = quantity > 0 ? Math.ceil(quantity / studyDaysCount) : 0;
                    return (
                      <div key={subject.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-800">{subject.subject_name}</p>
                          {existing && <span className="text-[11px] font-semibold text-emerald-700">{existing.remaining_quantity} left this week</span>}
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="Weekly amount"
                            value={targetQuantities[subject.id] || ''}
                            onChange={(e) => setTargetQuantities(prev => ({ ...prev, [subject.id]: e.target.value }))}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                          <select
                            value={targetUnits[subject.id] || 'questions'}
                            onChange={(e) => setTargetUnits(prev => ({ ...prev, [subject.id]: e.target.value }))}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                          >
                            {['questions', 'pages', 'chapters', 'worksheets', 'minutes', 'papers'].map((unit) => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600">
                            {perDay > 0 ? `${perDay} / study day` : 'Set amount to preview'}
                          </div>
                        </div>
                        {existing && (
                          <p className="mt-2 text-xs text-slate-500">
                            Current plan: {existing.target_quantity} {existing.target_unit} per week · {existing.daily_quantity} per study day.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {targetSaveMessage && (
                <p className={`mt-3 text-xs ${targetSaveMessage.startsWith('Could not') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {targetSaveMessage}
                </p>
              )}

              <button
                disabled={savingTargets || displaySubjects.length === 0}
                onClick={handleSaveWeeklyTargets}
                className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {savingTargets ? 'Saving targets...' : 'Save Weekly Targets'}
              </button>
            </div>

            {/* Subject Management */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Subjects</h3>
              <p className="mt-1 text-xs text-slate-500">
                Manage the subjects being tracked for {child?.name || 'your child'}.
                {!premium && ' Free plan: 1 subject. Upgrade for more.'}
              </p>
              {/* Existing subjects */}
              {subjects.length > 0 && (
                <div className="mt-3 space-y-2">
                  {subjects.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <span className="text-sm font-semibold text-slate-800">{s.subject_name}</span>
                      {subjects.length > 1 && (
                        <button
                          onClick={async () => {
                            if (!supabase) return;
                            if (!window.confirm(`Remove ${s.subject_name}? This will also remove its weekly targets.`)) return;
                            await supabase.from('sq_monitored_subjects').delete().eq('id', s.id);
                            setSubjects(prev => prev.filter(x => x.id !== s.id));
                          }}
                          className="text-xs font-semibold text-red-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Add subject form */}
              {(premium || subjects.length === 0) && (() => {
                const maxReached = !premium ? subjects.length >= 1 : subjects.length >= 5;
                if (maxReached && premium) return (
                  <p className="mt-3 text-xs text-slate-400">Maximum 5 subjects reached.</p>
                );
                return (
                  <AddSubjectInline
                    childId={child?.id || ''}
                    onAdded={(newSubject) => setSubjects(prev => [...prev, newSubject])}
                  />
                );
              })()}
              {!premium && subjects.length >= 1 && (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs text-blue-800">Upgrade to Premium to track multiple subjects.</p>
                  <button onClick={() => setShowPlanModal(true)} className="mt-2 inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">
                    Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Exam Management */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Exam Dates</h3>
              <p className="mt-1 text-xs text-slate-500">
                Set exam dates — the system will count down daily and adjust study intensity.
                {!premium && ' Free plan: 1 active exam. Upgrade for up to 3.'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                You can correct a wrong exam date here. After an exam is over, mark it completed and add the next real exam instead of repeatedly changing the old one.
              </p>

              {/* Current active exams */}
              {exams.filter(e => e.cycle_status === 'active').length > 0 && (
                <div className="mt-3 space-y-2">
                  {exams.filter(e => e.cycle_status === 'active').map((e) => {
                    const subj = subjects.find(s => s.id === e.subject_id);
                    const days = daysUntil(e.exam_date);
                    return (
                      <div key={e.id} className="rounded-xl bg-slate-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-700">{subj?.subject_name || 'Subject'}</span>
                            <span className="ml-2 text-xs text-slate-400">{e.exam_date}</span>
                          </div>
                          <span className={`text-sm font-black ${days <= 7 ? 'text-red-600' : days <= 14 ? 'text-amber-600' : 'text-emerald-600'}`}>{days}d</span>
                        </div>

                        {editingExamId === e.id ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <input
                              type="date"
                              min={today()}
                              value={editingExamDate}
                              onChange={(evt) => setEditingExamDate(evt.target.value)}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              disabled={!editingExamDate || savingExamEdit}
                              onClick={async () => {
                                if (!editingExamDate) return;
                                setSavingExamEdit(true);
                                const ok = await updateExamTargetDate(e.id, editingExamDate);
                                if (ok) {
                                  const refreshed = await getExamTargets(child!.id);
                                  setExams(refreshed);
                                  setEditingExamId(null);
                                  setEditingExamDate('');
                                  setDashboardNotice({ type: 'success', text: 'Exam date updated.' });
                                } else {
                                  setDashboardNotice({ type: 'error', text: 'Could not update the exam date yet. Please try again.' });
                                }
                                setSavingExamEdit(false);
                              }}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                            >
                              {savingExamEdit ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditingExamId(null); setEditingExamDate(''); }}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => { setEditingExamId(e.id); setEditingExamDate(e.exam_date); }}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Edit date
                            </button>
                            <button
                              onClick={async () => {
                                const ok = await updateExamTargetCycleStatus(e.id, 'ended');
                                if (ok) {
                                  const refreshed = await getExamTargets(child!.id);
                                  setExams(refreshed);
                                  setDashboardNotice({ type: 'success', text: 'Exam marked as completed.' });
                                } else {
                                  setDashboardNotice({ type: 'error', text: 'Could not mark the exam completed yet.' });
                                }
                              }}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Mark completed
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new exam */}
              {(() => {
                const activeCount = exams.filter(e => e.cycle_status === 'active').length;
                const limit = getActiveExamLimit(membership?.plan_type || 'free');
                if (activeCount >= limit) {
                  return (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs text-amber-800">
                        {!premium
                          ? 'Free plan: 1 active exam. Upgrade to Premium for up to 3 exams.'
                          : `You've reached the ${limit} exam limit. Complete or remove an exam to add more.`}
                      </p>
                      {!premium && (
                        <button onClick={() => setShowPlanModal(true)} className="mt-2 inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">
                          <Crown size={12} className="mr-1" /> Choose a plan
                        </button>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Add Exam</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <select
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        value={newExamSubject}
                        onChange={(e) => setNewExamSubject(e.target.value)}
                      >
                        <option value="">Subject</option>
                        {displaySubjects.map(s => (
                          <option key={s.id} value={s.id}>{s.subject_name}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        value={newExamDate}
                        onChange={(e) => setNewExamDate(e.target.value)}
                        min={today()}
                      />
                      <select
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        value={newExamType}
                        onChange={(e) => setNewExamType(e.target.value as 'normal' | 'major')}
                      >
                        <option value="normal">Normal</option>
                        <option value="major">Major (SA/PSLE/O-level)</option>
                      </select>
                    </div>
                    {newExamDate && (
                      <p className="mt-2 text-xs text-blue-600">
                        📅 Recommended start: <strong>{getRecommendedStartDate(newExamDate)}</strong> (8 weeks before exam)
                        {daysUntil(newExamDate) < 28 && (
                          <span className="ml-1 text-amber-600">⚠️ Less than 4 weeks — consider a crash course!</span>
                        )}
                      </p>
                    )}
                    <button
                      disabled={!newExamSubject || !newExamDate}
                      onClick={async () => {
                        if (!child || !newExamSubject || !newExamDate) return;
                        await addExamTarget({ subject_id: newExamSubject, child_id: child.id, exam_type: newExamType, exam_date: newExamDate });
                        const e = await getExamTargets(child.id);
                        setExams(e);
                        setNewExamDate('');
                        setNewExamSubject('');
                      }}
                      className="mt-3 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Add Exam Date
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Language preference */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">WhatsApp Language</h3>
              <p className="mt-1 text-xs text-slate-500">Your child receives messages in English. Choose your language for parent updates.</p>
              <div className="mt-3 flex gap-3">
                {(['en', 'zh'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    disabled={savingParentLanguage}
                    onClick={async () => {
                      if (!userId || savingParentLanguage) return;
                      const previousLanguage = (membership?.preferred_language || 'en') as 'en' | 'zh';
                      setParentLanguageMessage('');
                      setSavingParentLanguage(true);
                      setMembership(prev => prev ? { ...prev, preferred_language: l } : prev);
                      const ok = await updateLanguagePreference(userId, l);
                      if (!ok) {
                        setMembership(prev => prev ? { ...prev, preferred_language: previousLanguage } : prev);
                        setParentLanguageMessage('Could not save your language yet. Please try again.');
                      } else {
                        setParentLanguageMessage(l === 'zh' ? 'Parent updates will be sent in Chinese.' : 'Parent updates will be sent in English.');
                      }
                      setSavingParentLanguage(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      (membership?.preferred_language || 'en') === l
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe size={14} /> {l === 'en' ? 'English' : '中文'}
                  </button>
                ))}
              </div>
              {parentLanguageMessage && (
                <p className={`mt-2 text-xs ${parentLanguageMessage.startsWith('Could not') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {parentLanguageMessage}
                </p>
              )}
            </div>

            {/* Plan info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Your Plan</h3>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-slate-900">{membership?.plan_type === 'free' ? 'Free' : 'Premium'}</p>
                  <p className="text-xs text-slate-500">
                    {premium ? 'Daily check-ins · All subjects · Unlimited children' : 'Tue/Thu/Sat bundled check-ins · 1 subject · 1 child'}
                  </p>
                  {membership?.current_period_end && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {membership?.stripe_subscription_id ? 'Next renewal / period end:' : 'Pass ends on:'} {membership.current_period_end.split('T')[0]}
                    </p>
                  )}
                </div>
                {(membership?.stripe_customer_id || membership?.stripe_subscription_id) && (
                  <button
                    disabled={openingBilling}
                    onClick={handleManageBilling}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {openingBilling ? 'Opening billing...' : 'Manage Billing / Cancel Core Monthly'}
                  </button>
                )}
              </div>

              {!premium && (
                <div className="mt-4">
                  {upgrading && (
                    <p className="mb-2 text-xs font-semibold text-amber-700">Opening secure checkout — please wait...</p>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2">
                  {CHECKOUT_PLAN_OPTIONS.map((plan) => (
                    <button
                      key={plan.code}
                      disabled={upgrading}
                      onClick={() => handleUpgrade(plan.code)}
                      className={`rounded-xl border px-3 py-3 text-left transition disabled:opacity-50 ${plan.code === 'monthly_flex' ? 'border-amber-300 bg-amber-50 hover:bg-amber-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{plan.label}</span>
                        <span className="text-xs font-black text-slate-900">{plan.priceLabel}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{plan.description}</p>
                    </button>
                  ))}
                  </div>
                </div>
              )}

              {billingHelperText && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {billingHelperText}
                </p>
              )}
            </div>

            {/* Account */}
            <div className={`rounded-2xl border p-5 shadow-sm ${!membership?.parent_name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <h3 className="text-sm font-bold text-slate-700">Account</h3>
              {!membership?.parent_name && !editingProfile && (
                <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-white p-3">
                  <span className="text-base">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-red-700">Your name is not set</p>
                    <p className="text-[11px] text-red-600 mt-0.5">Without a name, our team cannot identify you when you send a tutor/diagnostic request. Please update it now.</p>
                    <button
                      onClick={() => { setProfileSaveMsg(null); setEditingProfile(true); setEditProfileName(membership?.parent_name || ''); setEditProfilePhone(membership?.parent_phone || ''); }}
                      className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      Set my name now →
                    </button>
                  </div>
                </div>
              )}

              {editingProfile ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Your Name</label>
                    <input type="text" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={editProfileName} onChange={e => setEditProfileName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Your WhatsApp Number</label>
                    <input type="tel" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="+65 9123 4567" value={editProfilePhone} onChange={e => setEditProfilePhone(e.target.value)} />
                  </div>
                  {profileSaveMsg && (
                    <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${profileSaveMsg.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                      {profileSaveMsg.text}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      disabled={savingProfile}
                      onClick={async () => {
                        if (!supabase || !userId) return;
                        setProfileSaveMsg(null);
                        if (!editProfileName.trim()) {
                          setProfileSaveMsg({ type: 'error', text: 'Please enter your name before saving.' });
                          return;
                        }
                        if (!editProfilePhone.trim()) {
                          setProfileSaveMsg({ type: 'error', text: 'Please enter your WhatsApp number before saving.' });
                          return;
                        }

                        const normalizedParentPhone = normaliseSGPhone(editProfilePhone);
                        const sameAsChild = children.some((childRow) =>
                          isSameWhatsAppNumber(normalizedParentPhone, childRow.whatsapp_number)
                        );
                        if (sameAsChild) {
                          setProfileSaveMsg({
                            type: 'error',
                            text: 'Parent and child WhatsApp numbers must be different. Please use separate numbers.',
                          });
                          return;
                        }

                        setSavingProfile(true);
                        const result = await persistParentProfile(userId, editProfileName, editProfilePhone, membership?.parent_email || undefined);

                        // Always update local state for whatever DID save
                        if (result.nameOk) {
                          setMembership(prev => prev ? { ...prev, parent_name: editProfileName.trim() } : prev);
                        }
                        if (result.phoneOk) {
                          const normPhone = normaliseSGPhone(editProfilePhone);
                          setMembership(prev => prev ? { ...prev, parent_phone: normPhone } : prev);
                        }

                        if (!result.ok) {
                          setSavingProfile(false);
                          setProfileSaveMsg({ type: 'error', text: result.message || 'Could not save your profile yet. Please try again.' });
                          return;
                        }

                        setEditingProfile(false);
                        setSavingProfile(false);
                        setProfileSaveMsg(null);
                        setDashboardNotice({ type: 'success', text: 'Profile updated successfully.' });
                      }}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingProfile(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-slate-700 font-semibold">{membership?.parent_name || <span className="text-red-400 italic">No name set</span>}</p>
                  <p className="text-xs text-slate-500">Email: {membership?.parent_email || 'Not set'}</p>
                  <p className="text-xs text-slate-500">WhatsApp: {membership?.parent_phone || 'Not set'}</p>
                  {membership?.parent_phone && (
                    <a
                      href={getParentActivationLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      📲 Activate parent updates
                    </a>
                  )}
                  <button
                    onClick={() => { setProfileSaveMsg(null); setEditingProfile(true); setEditProfileName(membership?.parent_name || ''); setEditProfilePhone(membership?.parent_phone || ''); }}
                    className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Edit Profile
                  </button>
                </div>
              )}

              <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col gap-2">
                {(membership?.stripe_customer_id || membership?.stripe_subscription_id) && (
                  <button
                    disabled={openingBilling}
                    onClick={handleManageBilling}
                    className="w-full rounded-xl border border-emerald-200 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    {openingBilling ? 'Opening billing...' : 'Manage Billing / Cancel Membership'}
                  </button>
                )}
                <button
                  onClick={async () => { if (supabase) { await supabase.auth.signOut(); navigate('/studypulse'); } }}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Sign Out
                </button>
                {!deletingAccount ? (
                  <button onClick={() => setDeletingAccount(true)} className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50">
                    Delete Account Permanently
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold text-red-700">This will permanently delete your StudyPulse account and sign you out. This cannot be undone.</p>
                    <p className="mt-1 text-[11px] text-red-600">If you still have an active premium subscription, cancel it in Billing first.</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handlePermanentDeleteAccount}
                        disabled={deletingAccountBusy}
                        className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        {deletingAccountBusy ? 'Deleting...' : 'Yes, permanently delete my account'}
                      </button>
                      <button onClick={() => setDeletingAccount(false)} disabled={deletingAccountBusy} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── UPGRADE PLAN MODAL ── */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4" onClick={() => !upgrading && setShowPlanModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Crown size={20} className="text-amber-500" /> Choose Your Plan
            </h2>
            <p className="mt-1 text-xs text-slate-500">All plans include daily check-ins, all subjects, and unlimited children.</p>

            {upgrading && (
              <p className="mt-3 text-xs font-bold text-amber-700">Opening secure checkout — please wait...</p>
            )}

            <div className="mt-4 grid gap-3">
              {CHECKOUT_PLAN_OPTIONS.map((plan) => (
                <button
                  key={plan.code}
                  disabled={upgrading}
                  onClick={async () => {
                    if (!userId || upgrading) return;
                    setDashboardNotice(null);
                    setUpgrading(true);
                    try {
                      const checkout = await startPremiumCheckout(plan.code);
                      if (checkout.ok && checkout.url) {
                        window.location.assign(checkout.url);
                        return;
                      }
                      setDashboardNotice({ type: 'error', text: checkout.message || 'Could not start checkout. Please try again.' });
                    } catch (err: any) {
                      setDashboardNotice({ type: 'error', text: err?.message || 'Something went wrong. Please try again.' });
                    } finally {
                      setUpgrading(false);
                    }
                    setShowPlanModal(false);
                  }}
                  className={`rounded-xl border px-4 py-4 text-left transition disabled:opacity-50 ${plan.code === 'monthly_flex' ? 'border-amber-300 bg-amber-50 hover:bg-amber-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{plan.label}</span>
                    <span className="text-sm font-black text-slate-900">{plan.priceLabel}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                </button>
              ))}
            </div>

            <button
              disabled={upgrading}
              onClick={() => setShowPlanModal(false)}
              className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   ONBOARDING WIZARD — shown inside dashboard
   when no children are set up yet
   ═══════════════════════════════════════════ */
const LEVELS = [
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6',
  'Secondary 1','Secondary 2','Secondary 3','Secondary 4','Secondary 5',
  'JC 1','JC 2',
];
const SUBJECT_OPTIONS = ['Math','Science','Chinese','English','Malay','Tamil','Other'];

interface OnboardingWizardProps {
  userId: string;
  membership: Membership | null;
  onComplete: () => Promise<void>;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userId, membership, onComplete }) => {
  const [step, setStep] = useState(1); // 1=profile, 2=child, 3=subject, 4=done
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — profile
  const [fullName, setFullName] = useState(membership?.parent_name || '');
  const [whatsapp, setWhatsapp] = useState(membership?.parent_phone || '');
  const [parentLang, setParentLang] = useState<'en' | 'zh'>(membership?.preferred_language || 'en');

  // Step 2 — child
  const [childName, setChildName] = useState('');
  const [childLevel, setChildLevel] = useState('');
  const [childWhatsapp, setChildWhatsapp] = useState('');
  const [onboardCCADays, setOnboardCCADays] = useState<number[]>([]);

  // Step 3 — subject + exam
  const [subjectName, setSubjectName] = useState('');
  const [examType, setExamType] = useState<'normal' | 'major'>('normal');
  const [examDate, setExamDate] = useState('');

  // Created child ID (from step 2)
  const [createdChildId, setCreatedChildId] = useState('');

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelCls = 'block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 mb-1.5';

  const handleSaveProfile = async () => {
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!whatsapp.trim()) { setError('WhatsApp number is required.'); return; }
    setError('');
    setSaving(true);
    let ensuredMembership = await createMembership(userId, membership?.plan_type || 'free', {
      name: fullName,
      email: membership?.parent_email || '',
      phone: normaliseSGPhone(whatsapp),
      language: parentLang,
    });

    // Extra guardrail for production policy/config drift:
    // try direct server bootstrap once more so users get a specific reason.
    if (!ensuredMembership && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          const bootstrap = await fetch('/api/studypulse/bootstrap-membership', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId,
              planType: membership?.plan_type || 'free',
              profile: {
                name: fullName,
                email: membership?.parent_email || '',
                phone: normaliseSGPhone(whatsapp),
                language: parentLang,
              },
            }),
          });

          const payload = await bootstrap.json().catch(() => ({}));
          if (bootstrap.ok && payload?.ok) {
            ensuredMembership = (await getMembership(userId)) || ({} as Membership);
          } else {
            setSaving(false);
            setError(payload?.error || 'Could not initialize your parent profile. Please try again.');
            return;
          }
        }
      } catch (bootstrapErr: any) {
        setSaving(false);
        setError(bootstrapErr?.message || 'Could not initialize your parent profile. Please try again.');
        return;
      }
    }

    if (!ensuredMembership) {
      setSaving(false);
      setError('Could not initialize your parent profile. Please try again.');
      return;
    }

    const persisted = await persistParentProfile(userId, fullName, whatsapp, membership?.parent_email || undefined);
    if (!persisted.ok) {
      setSaving(false);
      setError(persisted.message || 'Could not save your profile yet. Please try again.');
      return;
    }

    setSaving(false);
    setStep(2);
  };

  const handleSaveChild = async () => {
    if (!childName.trim()) { setError('Child name is required.'); return; }
    if (!childLevel) { setError('Select your child\'s level.'); return; }
    if (!childWhatsapp.trim()) { setError('Child WhatsApp number is required.'); return; }

    const normalizedParentPhone = normaliseSGPhone(whatsapp);
    const normalizedChildPhone = normaliseSGPhone(childWhatsapp);
    if (isSameWhatsAppNumber(normalizedParentPhone, normalizedChildPhone)) {
      setError('Parent and child WhatsApp numbers must be different. Please use separate numbers.');
      return;
    }

    setError('');
    setSaving(true);
    const child = await createChild(userId, { name: childName, level: childLevel, whatsapp_number: normalizedChildPhone });
    if (!child) { setError('Child limit reached for your plan. Upgrade to Premium to add more children.'); setSaving(false); return; }
    setCreatedChildId(child.id);
    if (onboardCCADays.length > 0) {
      await updateCCADays(child.id, onboardCCADays);
    }
    // Create default study settings
    await upsertStudySettings(child.id, {
      commence_date: today(),
      study_days_per_week: 5,
      first_reminder_time: '18:30',
      check_completion_time: '20:45',
    });
    setSaving(false);
    setStep(3);
  };

  const handleSaveSubject = async () => {
    if (!subjectName) { setError('Select a subject.'); return; }
    if (!examDate) { setError('Enter the next exam date.'); return; }
    setError('');
    setSaving(true);
    const subj = await addSubject(createdChildId, subjectName);
    if (subj) {
      await addExamTarget({ subject_id: subj.id, child_id: createdChildId, exam_type: examType, exam_date: examDate });
    }
    setSaving(false);
    setStep(4);
    // Trigger parent refresh
    await onComplete();
  };

  const stepLabels = ['Your Details', 'Add Child', 'Subject & Exam', 'Ready!'];

  const onboardingParentActivationLink = (childNameOverride?: string) => {
    const parentName = fullName.trim() || 'the parent';
    const childRef = childNameOverride || childName || 'my child';
    const msg = encodeURIComponent(
      `Hi StudyPulse, I'm ${parentName}, parent of ${childRef}. Please activate my weekly parent updates.`
    );
    return `https://wa.me/6589598553?text=${msg}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-slate-900">Welcome to StudyPulse</h1>
          <p className="mt-2 text-sm text-slate-500">Let&apos;s get you set up in under a minute.</p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {stepLabels.map((label, i) => (
            <div key={label} className={`flex-1 rounded-full py-2 text-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-emerald-100 text-emerald-700' : step === i + 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {step > i + 1 ? <Check size={14} className="inline mr-1" /> : null}{label}
            </div>
          ))}
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

        {/* STEP 1: Profile */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp Number</label>
                <input className={inputCls} type="tel" placeholder="+65 9123 4567" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp Language</label>
                <p className="mb-2 text-xs text-slate-500">Your child&apos;s messages stay in English. Choose your preferred language for parent updates.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setParentLang('en')} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${parentLang === 'en' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    English
                  </button>
                  <button type="button" onClick={() => setParentLang('zh')} className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${parentLang === 'zh' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    中文
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <>Next <ArrowRight size={16} className="ml-1.5" /></>}
            </button>
          </div>
        )}

        {/* STEP 2: Add Child */}
        {step === 2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">Add Your Child</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Child Name</label>
                <input className={inputCls} placeholder="Child's name" value={childName} onChange={(e) => setChildName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Level</label>
                <select className={inputCls} value={childLevel} onChange={(e) => setChildLevel(e.target.value)}>
                  <option value="">Select level</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Child WhatsApp Number</label>
                <input className={inputCls} type="tel" placeholder="+65 8123 4567" value={childWhatsapp} onChange={(e) => setChildWhatsapp(e.target.value)} />
                <p className="mt-1 text-xs text-slate-400">Daily check-ins are sent to this number.</p>
                {childWhatsapp.trim() && (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-800 mb-2">⚠️ {childName || 'Your child'} must tap this on <em>their own phone</em></p>
                    <p className="text-xs text-emerald-700 mb-2">Send this activation link to {childName || 'your child'} via WhatsApp or SMS.</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const link = `https://wa.me/6589598553?text=Hi+StudyPulse%2C+I'm+${encodeURIComponent(childName || 'joining')}+and+I'm+ready+for+my+daily+check-ins!`;
                          if (navigator.share) {
                            await navigator.share({ title: `Activate ${childName || 'your child'}'s StudyPulse`, url: link });
                          } else {
                            await navigator.clipboard.writeText(link);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        🔗 Share / Copy link to send to {childName || 'child'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Optional CCA Days */}
              <div>
                <label className={labelCls}>CCA Days <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                <p className="mb-2 text-xs text-slate-500">No check-in on days with CCA — nothing logged as missed.</p>
                <div className="flex gap-2 flex-wrap">
                  {[{v:0,l:'Sun'},{v:1,l:'Mon'},{v:2,l:'Tue'},{v:3,l:'Wed'},{v:4,l:'Thu'},{v:5,l:'Fri'},{v:6,l:'Sat'}].map(d => (
                    <button
                      key={d.v}
                      type="button"
                      onClick={() => setOnboardCCADays(prev => prev.includes(d.v) ? prev.filter(x => x !== d.v) : [...prev, d.v].sort())}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold transition ${
                        onboardCCADays.includes(d.v)
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleSaveChild} disabled={saving} className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <>Next <ArrowRight size={16} className="ml-1.5" /></>}
            </button>
          </div>
        )}

        {/* STEP 3: Subject & Exam */}
        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">First Subject & Exam</h2>
            <p className="mb-4 text-xs text-slate-500">You can add more subjects later in Settings.</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Subject</label>
                <select className={inputCls} value={subjectName} onChange={(e) => setSubjectName(e.target.value)}>
                  <option value="">Select subject</option>
                  {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Exam Type</label>
                <select className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value as 'normal' | 'major')}>
                  <option value="normal">Normal Exam</option>
                  <option value="major">Major Exam (SA/PSLE/O-Level)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Next Exam Date</label>
                <input className={inputCls} type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} min={today()} />
                {examDate && (
                  <p className="mt-1 text-xs text-blue-600">📅 Recommended start: <strong>{getRecommendedStartDate(examDate)}</strong></p>
                )}
              </div>
            </div>
            <button onClick={handleSaveSubject} disabled={saving} className="mt-6 flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <>Start Monitoring <ArrowRight size={16} className="ml-1.5" /></>}
            </button>
          </div>
        )}

        {/* STEP 4: Done */}
        {step === 4 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">You&apos;re All Set!</h2>
            <p className="mt-2 text-sm text-slate-600">
              {childName} will receive daily check-ins on WhatsApp.<br />
              You&apos;ll get weekly summaries and insights.
            </p>
            <div className="mt-5 space-y-3 text-left">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">One last step — activate WhatsApp:</p>
              {/* Parent activation — parent taps on their own device */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-800 mb-2">1️⃣ Your parent updates</p>
                <p className="text-xs text-blue-700 mb-2">Tap this yourself first — it activates your weekly parent reports.</p>
                <a
                  href={onboardingParentActivationLink(childName)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  📲 Tap to activate your updates
                </a>
              </div>
              {/* Child activation — parent must SEND this link to child's phone */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-bold text-emerald-800 mb-2">2️⃣ {childName}&apos;s check-ins</p>
                <p className="text-xs text-emerald-700 mb-2">{childName} must tap this link on <strong>their own phone</strong>. Send it to them via WhatsApp or SMS.</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={async () => {
                      const link = `https://wa.me/6589598553?text=Hi+StudyPulse%2C+I'm+${encodeURIComponent(childName)}+and+I'm+ready+for+my+daily+check-ins!`;
                      if (navigator.share) {
                        await navigator.share({ title: `Activate ${childName}'s StudyPulse`, url: link });
                      } else {
                        await navigator.clipboard.writeText(link);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    🔗 Share / Copy link to send to {childName}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">Both need to send once. After that, everything is automatic.</p>
            </div>
            <button onClick={onComplete} className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
              Go to Dashboard <ArrowRight size={16} className="ml-1.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   REPORTS PANEL — Rich analysis for parents
   ═══════════════════════════════════════════════════════════════════ */

interface ReportsPanelProps {
  child: SQChild;
  premium: boolean;
  summaries: WeeklySummary[];
  checkins: Checkin[];
  dailyTasks: DailyTask[];
  subjects: MonitoredSubject[];
  exams: ExamTarget[];
  streak: number;
  onUpgrade: () => void;
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({ child, premium, summaries, checkins, dailyTasks, subjects, exams, streak, onUpgrade }) => {
  const [historyCheckins, setHistoryCheckins] = useState<Checkin[]>([]);
  const [historyTasks, setHistoryTasks] = useState<DailyTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!child) return;
    (async () => {
      const [hc, ht] = await Promise.all([
        getCheckinHistory(child.id, 8),
        getDailyTasksHistory(child.id, 8),
      ]);
      setHistoryCheckins(hc);
      setHistoryTasks(ht);
      setLoaded(true);
    })();
  }, [child]);

  // ── Compute weekly compliance for past 4 weeks ──
  const weeklyCompliance = (): { weekLabel: string; done: number; total: number; pct: number }[] => {
    const weeks: { weekLabel: string; done: number; total: number; pct: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const wStart = new Date();
      wStart.setDate(wStart.getDate() - ((wStart.getDay() + 6) % 7) - w * 7);
      wStart.setHours(12, 0, 0, 0);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      wEnd.setHours(12, 0, 0, 0);
      const wStartStr = formatLocalDate(wStart);
      const wEndStr = formatLocalDate(wEnd);
      const label = `${wStart.getDate()}/${wStart.getMonth() + 1}`;

      const items = premium
        ? historyTasks.filter(t => t.task_date >= wStartStr && t.task_date <= wEndStr)
        : historyCheckins.filter(c => c.checkin_date >= wStartStr && c.checkin_date <= wEndStr);
      const done = items.filter(i => i.status === 'done' || i.status === 'did_extra' || i.status === 'yes').length;
      const total = Math.max(items.length, premium ? 7 : 3);
      weeks.push({ weekLabel: label, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 });
    }
    return weeks;
  };

  // ── Subject completion rates ──
  const subjectRates = (): { name: string; done: number; total: number; pct: number; trend: 'up' | 'down' | 'flat' }[] => {
    return subjects.map(s => {
      const allItems = premium
        ? historyTasks.filter(t => t.subject_id === s.id)
        : historyCheckins.filter(c => c.subject_id === s.id);
      const done = allItems.filter(i => i.status === 'done' || i.status === 'did_extra' || i.status === 'yes').length;
      const total = allItems.length || 1;
      // Trend: compare last 2 weeks vs previous 2 weeks
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      twoWeeksAgo.setHours(12, 0, 0, 0);
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      fourWeeksAgo.setHours(12, 0, 0, 0);
      const twoWeeksAgoStr = formatLocalDate(twoWeeksAgo);
      const fourWeeksAgoStr = formatLocalDate(fourWeeksAgo);
      const recent = allItems.filter(i => {
        const d = (i as any).task_date || (i as any).checkin_date;
        return d >= twoWeeksAgoStr;
      });
      const older = allItems.filter(i => {
        const d = (i as any).task_date || (i as any).checkin_date;
        return d >= fourWeeksAgoStr && d < twoWeeksAgoStr;
      });
      const recentPct = recent.length ? recent.filter(i => i.status === 'done' || i.status === 'did_extra' || i.status === 'yes').length / recent.length : 0;
      const olderPct = older.length ? older.filter(i => i.status === 'done' || i.status === 'did_extra' || i.status === 'yes').length / older.length : 0;
      const trend = recentPct > olderPct + 0.05 ? 'up' : recentPct < olderPct - 0.05 ? 'down' : 'flat';
      return { name: s.subject_name, done, total, pct: Math.round((done / total) * 100), trend };
    });
  };

  // ── Generate flags/alerts ──
  const generateFlags = (): { icon: string; text: string; severity: 'warning' | 'danger' | 'info' }[] => {
    const flags: { icon: string; text: string; severity: 'warning' | 'danger' | 'info' }[] = [];
    const weeks = weeklyCompliance();
    const thisWeek = weeks[weeks.length - 1];
    const lastWeek = weeks.length >= 2 ? weeks[weeks.length - 2] : null;

    if (thisWeek && thisWeek.pct < 50) {
      flags.push({ icon: '⚠️', text: `This week: only ${thisWeek.pct}% completed. Check in with ${child.name}.`, severity: 'danger' });
    }
    if (lastWeek && thisWeek && thisWeek.pct < lastWeek.pct - 20) {
      flags.push({ icon: '📉', text: `Drop from ${lastWeek.pct}% → ${thisWeek.pct}% this week. Consistency declining.`, severity: 'warning' });
    }
    if (streak === 0) {
      flags.push({ icon: '🔴', text: `${child.name} has no active streak. Encourage a check-in today.`, severity: 'danger' });
    }
    const activeExams = exams.filter(e => e.cycle_status === 'active');
    activeExams.forEach(e => {
      const days = Math.max(0, Math.ceil((new Date(e.exam_date).getTime() - Date.now()) / 86400000));
      const subj = subjects.find(s => s.id === e.subject_id);
      if (days <= 7) {
        flags.push({ icon: '🔥', text: `${subj?.subject_name || 'Exam'} in ${days} days! Final revision push.`, severity: 'danger' });
      } else if (days <= 14) {
        flags.push({ icon: '⏰', text: `${subj?.subject_name || 'Exam'} in ${days} days. Ramp up revision.`, severity: 'warning' });
      }
    });
    if (flags.length === 0) {
      flags.push({ icon: '✅', text: `${child.name} is on track. No concerns this week.`, severity: 'info' });
    }
    return flags;
  };

  // ── Overall compliance rate (all time from loaded history) ──
  const overallRate = (): number => {
    const items = premium ? historyTasks : historyCheckins;
    if (items.length === 0) return 0;
    const done = items.filter(i => i.status === 'done' || i.status === 'did_extra' || i.status === 'yes').length;
    return Math.round((done / items.length) * 100);
  };

  const weeks = loaded ? weeklyCompliance() : [];
  const sRates = loaded ? subjectRates() : [];
  const flags = loaded ? generateFlags() : [];
  const overall = loaded ? overallRate() : 0;
  const overallColor = overall >= 80 ? 'text-emerald-600' : overall >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-5">
      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className={`text-2xl font-black ${overallColor}`}>{overall}%</p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 mt-1">Compliance Rate</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-slate-900">🔥 {streak}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 mt-1">Current Streak</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-slate-900">{subjects.length}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 mt-1">Subjects Tracked</p>
        </div>
      </div>

      {/* ── Flags / Alerts ── */}
      {flags.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🚩 Alerts &amp; Observations</h3>
          <div className="space-y-2">
            {flags.map((f, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 text-sm ${f.severity === 'danger' ? 'bg-red-50 border border-red-200 text-red-800' : f.severity === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
                {f.icon} {f.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4-Week Compliance Trend ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-1">📊 Weekly Consistency — Last 4 Weeks</h3>
        <p className="text-xs text-slate-400 mb-4">How consistently {child.name} checked in each week.</p>
        {!loaded ? (
          <p className="text-center text-xs text-slate-400 py-6">Loading history…</p>
        ) : weeks.length === 0 || weeks.every(w => w.total === 0) ? (
          <p className="text-center text-xs text-slate-500 py-6">Not enough data yet. Check back after the first week.</p>
        ) : (
          <div className="space-y-3">
            {weeks.map((w, i) => {
              const barColor = w.pct >= 80 ? 'bg-emerald-500' : w.pct >= 50 ? 'bg-amber-500' : 'bg-red-400';
              const prevPct = i > 0 ? weeks[i - 1].pct : null;
              const trendIcon = prevPct !== null ? (w.pct > prevPct ? '↑' : w.pct < prevPct ? '↓' : '→') : '';
              return (
                <div key={w.weekLabel}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Wk {w.weekLabel}</span>
                    <span className="text-xs text-slate-500">{w.done}/{w.total} · <strong>{w.pct}%</strong> {trendIcon}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full ${barColor} transition-all`} style={{ width: `${w.pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Subject Completion Rates ── */}
      {sRates.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">📚 Subject Completion Rates</h3>
          <div className="space-y-4">
            {sRates.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${s.trend === 'up' ? 'text-emerald-600' : s.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                      {s.trend === 'up' ? '📈 Improving' : s.trend === 'down' ? '📉 Declining' : '→ Steady'}
                    </span>
                    <span className="text-xs text-slate-500">{s.pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className={`h-2.5 rounded-full transition-all ${s.pct >= 80 ? 'bg-emerald-500' : s.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Weekly Summaries (historical) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-1">📋 Weekly Report History</h3>
        <p className="text-xs text-slate-400 mb-3">Summaries generated each Sunday and sent via WhatsApp.</p>
        {summaries.length === 0 ? (
          <p className="text-sm text-slate-500">No reports yet. Your first report will arrive after the first full week.</p>
        ) : (
          <div className="space-y-3">
            {summaries.map((s) => {
              const pct = s.checkins_total ? Math.round((s.checkins_completed / s.checkins_total) * 100) : 0;
              return (
                <div key={s.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">Week of {s.week_start}</span>
                    <span className={`text-xs font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{pct}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">{s.checkins_completed}/{s.checkins_total} check-ins</span>
                    {s.days_to_exam != null && <span className="text-xs text-amber-600">📅 {s.days_to_exam}d to exam</span>}
                  </div>
                  {s.completion_state && <p className="mt-1 text-xs text-slate-500">{s.completion_state}</p>}
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Premium daily insights (blurred for free) ── */}
      {!premium && (
        <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
            <Crown size={24} className="text-amber-500 mb-2" />
            <p className="text-sm font-bold text-slate-900">Premium Daily Insights</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">See daily breakdowns, subject balance, and deeper trend analysis.</p>
            <button onClick={onUpgrade} className="mt-3 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
              <Crown size={12} className="mr-1" /> Unlock Insights — $9.90/mo
            </button>
          </div>
          <h3 className="text-sm font-bold text-slate-700 select-none">Daily Breakdown</h3>
          <div className="mt-3 space-y-2 select-none">
            {['Monday: Math — done ✓','Tuesday: Science — done ✓','Wednesday: Chinese — partially','Thursday: Math — done ✓','Friday: English — not started'].map((text) => (
              <div key={text} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                <span className="text-xs text-slate-500">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPulseApp;