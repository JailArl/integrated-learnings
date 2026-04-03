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
  Settings,
  Sparkles,
  Star,
  Target,
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
  const [tab, setTab] = useState<'today'|'weekly'|'streaks'|'exams'|'reports'|'actions'>('today');
  const [examScore, setExamScore] = useState('');
  const [examReason, setExamReason] = useState<ExamReason>('careless_mistakes');

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

  const handleUpgrade = async () => {
    if (!userId) return;
    const ok = await upgradeMembership(userId, 'premium');
    if (ok) {
      const m = await getMembership(userId);
      setMembership(m);
      alert('Upgraded to Premium! Refresh to unlock all features.');
    }
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

  // Build weekly grid data
  const buildWeekGrid = () => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return days.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isPast = d < new Date(today());
      const isToday = dateStr === today();
      // Check for check-in or daily task on this date
      const task = dailyTasks.find(t => t.task_date === dateStr);
      const checkin = checkins.find(c => c.checkin_date === dateStr);
      const status = task?.status || checkin?.status || (isPast ? 'missed' : null);
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
        {/* ── TODAY ── */}
        {tab === 'today' && (
          <div className="space-y-5">
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
                          <p className="mt-1 text-xs text-slate-500">{c.name} will receive a WhatsApp prompt this evening.</p>
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

            {/* Free plan upgrade nudge */}
            {!premium && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Crown size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Free plan: 3 check-ins/week</p>
                    <p className="mt-1 text-xs text-slate-600">Upgrade for daily check-ins, 3 subjects, and up to 3 children.</p>
                    <button onClick={handleUpgrade} className="mt-2 inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">
                      Upgrade — $9.90/mo <ArrowRight size={12} className="ml-1" />
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

              {/* 7-day grid */}
              <div className="mt-4 grid grid-cols-7 gap-2">
                {buildWeekGrid().map((d) => {
                  const bg = d.status === 'done' || d.status === 'did_extra' || d.status === 'yes'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : d.status === 'partially' || d.status === 'postpone'
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : d.status === 'no' || d.status === 'incomplete' || d.status === 'missed'
                    ? 'bg-red-50 border-red-200 text-red-400'
                    : d.isToday
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400';
                  const icon = d.status === 'done' || d.status === 'did_extra' || d.status === 'yes'
                    ? '✅' : d.status === 'partially' || d.status === 'postpone'
                    ? '~' : d.status === 'no' || d.status === 'incomplete'
                    ? '✗' : d.status === 'missed'
                    ? '—' : d.isToday ? '•' : '';
                  return (
                    <div key={d.label} className={`rounded-xl border p-2.5 text-center ${bg}`}>
                      <p className="text-[10px] font-bold uppercase">{d.label}</p>
                      <p className="mt-1 text-lg">{icon}</p>
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
                  const missed = week.filter(d => d.status === 'no' || d.status === 'incomplete' || d.status === 'missed').length;
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
                  Free plan check-in days: <strong className="text-emerald-600">Tue, Thu, Sat</strong>. Upgrade for daily check-ins.
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
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Weekly Reports</h2>
              <p className="mt-1 text-xs text-slate-500">Summaries generated each Sunday and sent via WhatsApp.</p>
              {summaries.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No reports yet. Your first report will arrive after the first full week of check-ins.</p>
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

            {/* Blurred premium insights — free users */}
            {!premium && (
              <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
                  <Crown size={24} className="text-amber-500 mb-2" />
                  <p className="text-sm font-bold text-slate-900">Premium Daily Insights</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">See daily breakdowns, subject balance, and weekly trend analysis.</p>
                  <button onClick={handleUpgrade} className="mt-3 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
                    <Crown size={12} className="mr-1" /> Unlock Insights
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
        )}

        {/* ── ACTIONS ── */}
        {tab === 'actions' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Actions &amp; Support</h2>
              <p className="mt-1 text-xs text-slate-500">Extra help when your child needs it.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Search size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Request Tutor</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Need a tutor for a subject? We&apos;ll match you with a vetted tutor.</p>
                <button onClick={() => handleCTA('sq_tutor_requests', 'manual_request')} className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Find a Tutor</button>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700"><Microscope size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Book Diagnostic</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Results not improving despite effort? A diagnostic can identify the issue.</p>
                <button onClick={() => handleCTA('sq_diagnostic_requests', 'manual_request')} className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-bold text-white">Book Diagnostic</button>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700"><Flame size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Crash Course</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Intensive revision before major exams or holiday catch-up sessions.</p>
                <button onClick={() => handleCTA('sq_crash_course_interest', 'manual_request')} className="mt-3 w-full rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white">Express Interest</button>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><GraduationCap size={20} /></div>
                <h3 className="text-base font-bold text-slate-900">Holiday Programme</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">Financial literacy enrichment for P4–P6 and Sec 1–3 during school holidays.</p>
                <button onClick={() => handleCTA('sq_holiday_programme_interest', 'manual_request')} className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Register Interest</button>
                <Link to="/enrichment" className="mt-2 inline-block text-xs font-semibold text-emerald-700 underline">Learn more →</Link>
              </article>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPulseApp;