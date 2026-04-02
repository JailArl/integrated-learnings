import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  GraduationCap,
  Microscope,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingDown,
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
  type Checkin,
  type DailyTask,
  type WeeklySummary,
  type ExamResult,
  type CheckinStatus,
  type DailyTaskStatus,
  type PlanApproval,
  type ExamReason,
  getMembership,
  getChildren,
  getSubjects,
  getExamTargets,
  getWeeklyPlans,
  getCheckins,
  getDailyTasks,
  getWeeklySummaries,
  getExamResults,
  createWeeklyPlan,
  updatePlanStatus,
  upsertCheckin,
  upsertDailyTask,
  submitExamResult,
  submitCTARequest,
  upgradeMembership,
  isPremium,
  PLAN_LIMITS,
  FREE_CHECKIN_DAYS,
} from '../services/studyquest';

/* ── helpers ── */
function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86400000));
}
function weekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split('T')[0];
}
const today = () => new Date().toISOString().split('T')[0];
const dayName = (d: Date) => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
const isFreeCheckinDay = () => FREE_CHECKIN_DAYS.includes(dayName(new Date()) as any);

/* ═══════════════════════════════════════════ */
const StudyPulseApp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [children, setChildren] = useState<SQChild[]>([]);
  const [activeChild, setActiveChild] = useState(0);

  // per-child data
  const [subjects, setSubjects] = useState<MonitoredSubject[]>([]);
  const [exams, setExams] = useState<ExamTarget[]>([]);
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  // UI state
  const [tab, setTab] = useState<'overview'|'plan'|'checkin'|'exams'|'reports'|'actions'>('overview');
  const [newPlanText, setNewPlanText] = useState('');
  const [newPlanSubject, setNewPlanSubject] = useState('');
  const [checkinNote, setCheckinNote] = useState('');
  const [examScore, setExamScore] = useState('');
  const [examReason, setExamReason] = useState<ExamReason>('careless_mistakes');
  const [expandedChild, setExpandedChild] = useState<number|null>(null);

  const premium = isPremium(membership);
  const child = children[activeChild];

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/studypulse/login'); return; }
      setUserId(user.id);
      const m = await getMembership(user.id);
      if (!m) { navigate('/studypulse/setup'); return; }
      setMembership(m);
      const kids = await getChildren(user.id);
      setChildren(kids);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!child) return;
    (async () => {
      const [s, e, p, c, d, sm, r] = await Promise.all([
        getSubjects(child.id),
        getExamTargets(child.id),
        getWeeklyPlans(child.id),
        getCheckins(child.id),
        getDailyTasks(child.id, today()),
        getWeeklySummaries(child.id),
        getExamResults(child.id),
      ]);
      setSubjects(s); setExams(e); setPlans(p); setCheckins(c);
      setDailyTasks(d); setSummaries(sm); setResults(r);
    })();
  }, [child]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100"><div className="text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" /><p className="text-sm text-slate-500">Loading dashboard…</p></div></div>;
  if (!membership || children.length === 0) return <div className="flex min-h-screen items-center justify-center bg-slate-100"><div className="text-center"><p className="text-lg font-bold text-slate-700">No setup found</p><Link to="/studypulse/setup" className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Complete Setup</Link></div></div>;

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

  const handleSubmitPlan = async () => {
    if (!child || !newPlanText.trim()) return;
    await createWeeklyPlan({ child_id: child.id, subject_id: newPlanSubject || undefined, week_start: weekStart(), plan_text: newPlanText });
    setNewPlanText('');
    const p = await getWeeklyPlans(child.id);
    setPlans(p);
  };

  const handleUpgrade = async () => {
    if (!userId) return;
    // In production this would redirect to Stripe Checkout first,
    // then the webhook would call upgradeMembership. For now, upgrade directly.
    const ok = await upgradeMembership(userId, 'premium');
    if (ok) {
      const m = await getMembership(userId);
      setMembership(m);
      alert('Upgraded to Premium! Refresh to unlock all features.');
    }
  };

  const handleApprovePlan = async (planId: string, status: PlanApproval) => {
    await updatePlanStatus(planId, status, premium && status === 'approved');
    const p = await getWeeklyPlans(child.id);
    setPlans(p);
  };

  const handleCheckin = async (status: CheckinStatus) => {
    if (!child) return;
    await upsertCheckin({ child_id: child.id, subject_id: displaySubjects[0]?.id, checkin_date: today(), status, note: checkinNote || undefined });
    setCheckinNote('');
    const c = await getCheckins(child.id);
    setCheckins(c);
  };

  const handleDailyTask = async (status: DailyTaskStatus) => {
    if (!child) return;
    await upsertDailyTask({ child_id: child.id, subject_id: displaySubjects[0]?.id, task_date: today(), status, note: checkinNote || undefined });
    setCheckinNote('');
    const d = await getDailyTasks(child.id, today());
    setDailyTasks(d);
  };

  const handleExamResult = async (targetId: string) => {
    if (!child || !examScore) return;
    await submitExamResult({ child_id: child.id, subject_id: displaySubjects[0]?.id, exam_target_id: targetId, score: parseFloat(examScore), reason: examReason });
    setExamScore('');
    const r = await getExamResults(child.id);
    setResults(r);
  };

  const handleCTA = async (table: 'sq_tutor_requests'|'sq_diagnostic_requests'|'sq_crash_course_interest'|'sq_holiday_programme_interest', reason?: string) => {
    if (!userId || !child) return;
    await submitCTARequest(table, userId, child.id, { trigger_reason: reason });
    alert('Request submitted!');
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const chipActive = 'bg-slate-900 text-white';
  const chipInactive = 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';

  const TABS: { id: typeof tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'plan', label: 'Weekly Plan', icon: FileText },
    { id: 'checkin', label: premium ? 'Daily Check' : 'Check-in', icon: CheckCircle2 },
    { id: 'exams', label: 'Exams', icon: Target },
    { id: 'reports', label: 'Reports', icon: CalendarDays },
    { id: 'actions', label: 'Actions', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-300">StudyPulse</p>
            <p className="text-sm font-semibold">{membership?.plan_type === 'free' ? 'Free Plan' : 'Premium'}</p>
          </div>
          <div className="flex items-center gap-3">
            {!premium && (
              <button onClick={handleUpgrade} className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">
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
        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Stats banner */}
            <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e3a5f_60%,#0c4a3e_100%)] p-5 text-white">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Children</p>
                  <p className="mt-1 text-2xl font-black">{displayChildren.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Subjects</p>
                  <p className="mt-1 text-2xl font-black">{displaySubjects.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Streak</p>
                  <p className="mt-1 text-2xl font-black">{streak > 0 ? `🔥 ${streak}` : '—'}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">Plan</p>
                  <p className="mt-1 text-2xl font-black">{premium ? '⭐' : 'Free'}</p>
                </div>
              </div>
            </div>

            {/* Streak celebration */}
            {streak >= 3 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <Flame size={24} className="text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {streak >= 14 ? `${streak}-day streak! Amazing consistency!` : streak >= 7 ? `${streak}-day streak! One full week — well done!` : `${streak}-day streak! Keep it going!`}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {streak >= 7 ? 'Consistency like this is what builds real results before exams.' : 'Your child is building a great study rhythm. Every check-in counts.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Child cards */}
            {displayChildren.map((c, ci) => {
              const isPSLELevel = ['Primary 4','Primary 5','Primary 6'].includes(c.level);
              const isOLevel = ['Secondary 3','Secondary 4'].includes(c.level);
              const childSubjects = (premium ? subjects : subjects.slice(0, 1)).filter(s => s.child_id === c.id || ci === activeChild);
              return (
              <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.level}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${premium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {premium ? 'Daily Mode' : 'Weekly Mode'}
                  </span>
                </div>
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

                {/* Subject gap nudge — only for free PSLE/O-level parents */}
                {!premium && childSubjects.length === 1 && (isPSLELevel || isOLevel) && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                    <p className="text-xs font-semibold text-amber-800">
                      {isPSLELevel
                        ? `Most P5/P6 parents also track Science and Chinese for PSLE. You're only monitoring ${childSubjects[0]?.subject_name || '1 subject'}.`
                        : `O-Level students often need monitoring across multiple subjects. You're only tracking ${childSubjects[0]?.subject_name || '1 subject'}.`}
                    </p>
                    <button onClick={handleUpgrade} className="mt-2 text-xs font-bold text-amber-700 underline">Add more subjects with Premium →</button>
                  </div>
                )}
              </article>
              );
            })}

            {/* Missed-days awareness — shows on check-in gap days */}
            {!premium && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900">This week&apos;s monitoring</h3>
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => {
                    const isCheckDay = ['Tue','Thu','Sat'].includes(d);
                    const todayShort = dayName(new Date()).slice(0, 3);
                    const isPast = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(d) < ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(todayShort);
                    return (
                      <div key={d} className={`rounded-lg py-2 text-center text-[10px] font-bold ${
                        isCheckDay ? 'bg-emerald-100 text-emerald-700' :
                        isPast ? 'bg-red-50 text-red-300' :
                        'bg-slate-100 text-slate-300'
                      }`}>
                        {d}
                        <div className="mt-0.5 text-[8px]">{isCheckDay ? '✓' : isPast ? '—' : ''}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-600">3 check-in days</span> per week on Free. Upgrade to Premium for <span className="font-semibold text-emerald-600">daily check-ins</span> and stronger streaks.
                </p>
              </div>
            )}

            {/* Exam proximity upgrade nudge */}
            {!premium && nextExam && daysUntil(nextExam.exam_date) <= 30 && (
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {daysUntil(nextExam.exam_date)} days to exam — daily check-ins help build momentum
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      On Free, your child checks in <strong>{Math.floor(daysUntil(nextExam.exam_date) * 3 / 7)} times</strong> before the exam.
                      With Premium, that&apos;s <strong>{daysUntil(nextExam.exam_date)} daily check-ins</strong> — a much stronger revision habit.
                    </p>
                    <button onClick={handleUpgrade} className="mt-3 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
                      Switch to Daily Check-ins <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Free upgrade prompt — emotional, not feature-listy */}
            {!premium && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <Crown size={20} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">$9.90/mo — build daily study habits</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Daily check-ins build consistency. When your child checks in every day, studying becomes routine — not something you have to nag about.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-start gap-2"><span className="text-amber-500">→</span> <strong>Daily check-ins</strong> — build a streak your child can be proud of</li>
                      <li className="flex items-start gap-2"><span className="text-amber-500">→</span> <strong>3 subjects</strong> — track Math, Science, and Chinese together</li>
                      <li className="flex items-start gap-2"><span className="text-amber-500">→</span> <strong>Up to 3 children</strong> — one dashboard for the whole family</li>
                      <li className="flex items-start gap-2"><span className="text-amber-500">→</span> <strong>Exam auto-cycle</strong> — pause after SA2, restart for year-end automatically</li>
                    </ul>
                    <button onClick={handleUpgrade} className="mt-4 inline-flex items-center rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow">
                      Upgrade Now — $9.90/mo <ArrowRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WEEKLY PLAN ── */}
        {tab === 'plan' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Weekly Plan</h2>
              <p className="mt-1 text-xs text-slate-500">Week of {weekStart()}</p>

              {currentPlan ? (
                <div className="mt-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{currentPlan.plan_text}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${currentPlan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : currentPlan.status === 'revision_requested' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                        {currentPlan.status}
                      </span>
                      {premium && currentPlan.ready_for_daily_split && <span className="text-[10px] text-slate-400">Ready for daily split</span>}
                    </div>
                  </div>
                  {currentPlan.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleApprovePlan(currentPlan.id, 'approved')} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Approve</button>
                      <button onClick={() => handleApprovePlan(currentPlan.id, 'revision_requested')} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600">Request Revision</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <p className="mb-3 text-sm text-slate-500">No plan for this week yet. Enter the child&apos;s study plan:</p>
                  {subjects.length > 0 && (
                    <select className={inputCls + ' mb-3'} value={newPlanSubject} onChange={(e) => setNewPlanSubject(e.target.value)}>
                      <option value="">All subjects</option>
                      {displaySubjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                  )}
                  <textarea className={inputCls + ' min-h-[100px]'} placeholder="e.g. 140 math questions&#10;21 Chinese passages&#10;70 xizi words" value={newPlanText} onChange={(e) => setNewPlanText(e.target.value)} />
                  <button onClick={handleSubmitPlan} disabled={!newPlanText.trim()} className="mt-3 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                    Submit Plan
                  </button>
                </div>
              )}
            </div>

            {/* Plan history */}
            {plans.length > 1 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Previous Plans</h3>
                {plans.slice(1, 5).map((p) => (
                  <div key={p.id} className="mb-2 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Week of {p.week_start}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{p.status}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-600">{p.plan_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHECK-IN / DAILY ── */}
        {tab === 'checkin' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">{premium ? 'Daily Accountability' : 'Weekly Check-in'}</h2>
              <p className="mt-1 text-xs text-slate-500">{today()} — {dayName(new Date())}</p>

              {!premium && !isFreeCheckinDay() ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-base font-bold text-slate-700">It&apos;s {dayName(new Date())}.</p>
                    <p className="mt-1 text-sm text-slate-500">Today isn&apos;t a check-in day on the Free plan. Your child&apos;s next check-in is on the next scheduled day.</p>
                    <p className="mt-3 text-xs text-slate-400">Free check-ins: <strong>Tuesday, Thursday, Saturday</strong></p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold text-slate-900">Want to build a daily habit instead?</p>
                    <p className="mt-1 text-xs text-slate-500">Premium check-ins happen every day — so your child builds a real streak and you see the full picture.</p>
                    <button onClick={handleUpgrade} className="mt-3 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
                      <Crown size={12} className="mr-1" /> Switch to Daily — $9.90/mo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <textarea className={inputCls + ' mb-3 min-h-[60px]'} placeholder="Optional note…" value={checkinNote} onChange={(e) => setCheckinNote(e.target.value)} />
                  {premium ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {(['done','postpone','incomplete','did_extra'] as DailyTaskStatus[]).map((s) => (
                          <button key={s} onClick={() => handleDailyTask(s)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${s === 'done' ? 'bg-emerald-600 text-white' : s === 'did_extra' ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
                            {s === 'done' ? '✓ Done' : s === 'postpone' ? '⏸ Postpone' : s === 'incomplete' ? '✗ Incomplete' : '⚡ Did Extra!'}
                          </button>
                        ))}
                      </div>
                      {/* Streak encouragement after check-in */}
                      {dailyTasks.some(t => t.task_date === today() && (t.status === 'done' || t.status === 'did_extra')) && (
                        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                          <p className="text-xs font-bold text-emerald-700">{streak >= 5 ? `🔥 ${streak}-day streak! Excellent consistency.` : streak >= 2 ? `🔥 ${streak}-day streak! Keep it going!` : '✓ Checked in for today. Great work!'}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {(['yes','partially','no'] as CheckinStatus[]).map((s) => (
                          <button key={s} onClick={() => handleCheckin(s)} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${s === 'yes' ? 'bg-emerald-600 text-white' : s === 'partially' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'}`}>
                            {s === 'yes' ? '✓ Yes' : s === 'partially' ? '~ Partially' : '✗ No'}
                          </button>
                        ))}
                      </div>
                      {/* Encouragement after free check-in */}
                      {checkins.some(c => c.checkin_date === today() && c.status === 'yes') && (
                        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                          <p className="text-xs font-bold text-emerald-700">{streak >= 3 ? `🔥 ${streak} in a row! Great consistency.` : '✓ Checked in! Every check-in builds the habit.'}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Today's tasks (premium) */}
            {premium && dailyTasks.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Today&apos;s Records</h3>
                {dailyTasks.map((t) => (
                  <div key={t.id} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                    <span className="text-xs text-slate-600">{t.note || 'Task'}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.status === 'done' || t.status === 'did_extra' ? 'bg-emerald-100 text-emerald-700' : t.status === 'postpone' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent checkins (free) */}
            {!premium && checkins.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Recent Check-ins</h3>
                {checkins.slice(0, 6).map((c) => (
                  <div key={c.id} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                    <span className="text-xs text-slate-600">{c.checkin_date}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status === 'yes' ? 'bg-emerald-100 text-emerald-700' : c.status === 'partially' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Premium consolidated summary placeholder */}
            {premium && displayChildren.length > 1 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Consolidated Summary</h3>
                {displayChildren.map((c) => (
                  <div key={c.id} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                    <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-400">Placeholder</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EXAMS ── */}
        {tab === 'exams' && (
          <div className="space-y-5">
            {/* Active exam targets */}
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
                        {/* Progress bar */}
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                          <div className={`h-2 rounded-full ${days <= 14 ? 'bg-amber-500' : days <= 30 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.max(5, Math.min(100, 100 - days))}%` }} />
                        </div>
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

            {/* Cycle status info */}
            {premium && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-700">
                <Sparkles size={14} className="inline mr-1" /> <strong>Premium:</strong> After exams, the system auto-pauses and restarts for the new term. Exam result reminders are sent 1 week and 2 weeks after the exam date.
              </div>
            )}
            {!premium && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500">
                <strong>Free plan:</strong> After each exam cycle ends, you&apos;ll need to manually restart monitoring for the next term.
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === 'reports' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Weekly Reports</h2>
              <p className="mt-1 text-xs text-slate-500">{premium ? 'Consolidated daily summaries available' : 'Sunday weekly report'}</p>
              {summaries.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No reports yet. Reports are generated each Sunday.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {summaries.map((s) => (
                    <div key={s.id} className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Week of {s.week_start}</span>
                        <span className="text-xs font-semibold text-slate-500">{s.checkins_completed}/{s.checkins_total} check-ins</span>
                      </div>
                      {s.completion_state && <p className="mt-1 text-xs text-slate-500">{s.completion_state}</p>}
                      {s.days_to_exam != null && <p className="mt-1 text-xs text-amber-600">{s.days_to_exam} days to exam at report time</p>}
                      <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${s.checkins_total ? (s.checkins_completed / s.checkins_total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parent summaries placeholder */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Parent Summaries</h3>
              <p className="mt-2 text-xs text-slate-500">Consolidated parent briefings will appear here once the monitoring system has collected enough data.</p>
            </div>

            {/* Blurred premium daily insights — free users only */}
            {!premium && (
              <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
                  <Crown size={24} className="text-amber-500 mb-2" />
                  <p className="text-sm font-bold text-slate-900">Premium Daily Insights</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">See your child&apos;s full daily breakdown — subjects completed, time patterns, and weekly trends.</p>
                  <button onClick={handleUpgrade} className="mt-3 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
                    <Crown size={12} className="mr-1" /> Unlock Daily Insights
                  </button>
                </div>
                {/* Fake blurred daily rows */}
                <h3 className="text-sm font-bold text-slate-700 select-none">Daily Breakdown</h3>
                <div className="mt-3 space-y-2 select-none">
                  {['Monday: Math — 40 questions done ✓','Tuesday: Completed revision chapter 5','Wednesday: Science worksheet — partially done','Thursday: Chinese 字词 — 35/50 words','Friday: Math paper 2 practice — not started'].map((text) => (
                    <div key={text} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                      <span className="text-xs text-slate-500">{text}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">done</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIONS (CTA triggers) ── */}
        {tab === 'actions' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Actions & Support</h2>
              <p className="mt-1 text-xs text-slate-500">Extra help when your child needs it.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tutor */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Search size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Request Tutor</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {premium ? 'Triggered when follow-through is consistently poor or results are declining.' : 'Visible when completion is low or exam results are poor.'}
                </p>
                <button onClick={() => handleCTA('sq_tutor_requests', 'manual_request')} className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">
                  Find a Tutor
                </button>
              </article>

              {/* Diagnostic */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Microscope size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Book One-Time Diagnostic</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Work is being done but results aren&apos;t improving. A diagnostic session can identify whether the revision approach needs adjustment.
                </p>
                <button onClick={() => handleCTA('sq_diagnostic_requests', 'manual_request')} className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-bold text-white">
                  Book Diagnostic
                </button>
              </article>

              {/* Crash Course */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Flame size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Explore Crash Course</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Intensive revision before major exams or holiday catch-up courses available after mid-year and end-year exams.
                </p>
                <button onClick={() => handleCTA('sq_crash_course_interest', 'manual_request')} className="mt-3 w-full rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white">
                  Express Interest
                </button>
              </article>

              {/* Holiday Programme */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Explore Holiday Programme</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Financial literacy enrichment for P4–P6 and Sec 1–3 students during school holidays. Fun, structured, and skill-building.
                </p>
                <button onClick={() => handleCTA('sq_holiday_programme_interest', 'manual_request')} className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">
                  Register Interest
                </button>
                <Link to="/enrichment" className="mt-2 inline-block text-xs font-semibold text-emerald-700 underline">
                  Learn more about enrichment programmes →
                </Link>
              </article>
            </div>

            {/* Upgrade messaging for free */}
            {!premium && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                <h3 className="text-sm font-bold text-slate-900">Premium gives smarter triggers</h3>
                <p className="mt-2 text-xs text-slate-600">
                  Premium users get automatic prompts for tutors, diagnostics, and crash courses based on daily accountability data — more timely and relevant than manual requests.
                </p>
                <button onClick={handleUpgrade} className="mt-3 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
                  <Crown size={12} className="mr-1" /> Upgrade to Premium — $9.90/mo
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPulseApp;