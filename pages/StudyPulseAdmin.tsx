import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Crown,
  FileText,
  Flame,
  Search,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { supabase } from '../services/supabase';
import {
  adminGetRecentCheckins,
  adminGetRecentDailyTasks,
  adminGetAllWeeklySummaries,
  adminGetAllExamTargets,
  type Checkin,
  type DailyTask,
  type WeeklySummary,
  type ExamTarget,
} from '../services/studyquest';

/* ── types ── */
interface MembershipRow {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  preferred_language?: 'en' | 'zh';
  current_period_end?: string | null;
  created_at: string;
}
interface ChildRow {
  id: string;
  parent_id: string;
  name: string;
  level: string;
  whatsapp_number: string;
  study_days?: number[];
  cca_days?: number[];
}
interface SubjectRow {
  id: string;
  child_id: string;
  subject_name: string;
  exam_type: string;
  exam_date: string;
}
interface RequestRow {
  id: string;
  parent_id: string;
  child_id: string;
  trigger_reason: string;
  created_at: string;
  status: string;
  // embedded at insert time — reliable without a join
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  child_name?: string;
  child_level?: string;
}

/* ── helpers ── */
const badge = (type: string) => {
  const map: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    premium: 'bg-amber-100 text-amber-700',
    premium_active: 'bg-emerald-100 text-emerald-700',
    premium_cancelled: 'bg-red-100 text-red-600',
    free_active: 'bg-slate-100 text-slate-600',
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    contacted: 'bg-blue-100 text-blue-700',
  };
  return map[type] || 'bg-slate-100 text-slate-500';
};

/* ═══════════════════════════════════════════ */
const StudyPulseAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [tutorReqs, setTutorReqs] = useState<RequestRow[]>([]);
  const [diagReqs, setDiagReqs] = useState<RequestRow[]>([]);
  const [crashReqs, setCrashReqs] = useState<RequestRow[]>([]);
  const [holidayReqs, setHolidayReqs] = useState<RequestRow[]>([]);

  // Monitoring data
  const [recentCheckins, setRecentCheckins] = useState<Checkin[]>([]);
  const [recentTasks, setRecentTasks] = useState<DailyTask[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [examTargets, setExamTargets] = useState<ExamTarget[]>([]);

  const [adminTab, setAdminTab] = useState<'monitoring'|'members'|'requests'|'preview'>('monitoring');
  const [filter, setFilter] = useState<'all'|'free'|'premium'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewParentId, setPreviewParentId] = useState<string>('');
  const [previewChildId, setPreviewChildId] = useState<string>('');
  const [previewLangMode, setPreviewLangMode] = useState<'auto' | 'en' | 'zh'>('auto');
  const [expandedRequestKey, setExpandedRequestKey] = useState<string | null>(null);
  const [updatingRequestKey, setUpdatingRequestKey] = useState<string | null>(null);
  const [updatingMembershipId, setUpdatingMembershipId] = useState<string | null>(null);
  const [membershipActionMessage, setMembershipActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const [mRes, cRes, sRes, trRes, drRes, crRes, hrRes] = await Promise.all([
        supabase.from('sq_memberships').select('*').order('created_at', { ascending: false }),
        supabase.from('sq_children').select('*'),
        supabase.from('sq_monitored_subjects').select('*'),
        supabase.from('sq_tutor_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('sq_diagnostic_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('sq_crash_course_interest').select('*').order('created_at', { ascending: false }),
        supabase.from('sq_holiday_programme_interest').select('*').order('created_at', { ascending: false }),
      ]);
      setMemberships(mRes.data || []);
      setChildren(cRes.data || []);
      setSubjects(sRes.data || []);
      setTutorReqs(trRes.data || []);
      setDiagReqs(drRes.data || []);
      setCrashReqs(crRes.data || []);
      setHolidayReqs(hrRes.data || []);
      // Load monitoring data
      const [rc, rt, ws, et] = await Promise.all([
        adminGetRecentCheckins(14),
        adminGetRecentDailyTasks(14),
        adminGetAllWeeklySummaries(200),
        adminGetAllExamTargets(),
      ]);
      setRecentCheckins(rc);
      setRecentTasks(rt);
      setWeeklySummaries(ws);
      setExamTargets(et);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!previewParentId) return;
    const firstChild = children.find(c => c.parent_id === previewParentId);
    if (firstChild && !children.some(c => c.id === previewChildId && c.parent_id === previewParentId)) {
      setPreviewChildId(firstChild.id);
    }
  }, [previewParentId, previewChildId, children]);

  const filtered = memberships
    .filter(m => filter === 'all' || m.plan_type === filter)
    .filter(m => !search || m.parent_name?.toLowerCase().includes(search.toLowerCase()) || m.parent_email?.toLowerCase().includes(search.toLowerCase()));

  const freeCt = memberships.filter(m => m.plan_type === 'free').length;
  const premCt = memberships.filter(m => m.plan_type !== 'free').length;
  const totalChildren = children.length;
  const totalReqs = tutorReqs.length + diagReqs.length + crashReqs.length + holidayReqs.length;

  // ── Monitoring analytics ──
  const todayStr = new Date().toISOString().split('T')[0];
  const allActivity = [...recentCheckins.map(c => ({ childId: c.child_id, date: c.checkin_date, status: c.status })), ...recentTasks.map(t => ({ childId: t.child_id, date: t.task_date, status: t.status }))];
  const todayActivity = allActivity.filter(a => a.date === todayStr);
  const todayDone = todayActivity.filter(a => a.status === 'done' || a.status === 'did_extra' || a.status === 'yes').length;
  const todayTotal = todayActivity.length;

  // Overall 14-day compliance
  const allDone = allActivity.filter(a => a.status === 'done' || a.status === 'did_extra' || a.status === 'yes').length;
  const overallCompliance = allActivity.length > 0 ? Math.round((allDone / allActivity.length) * 100) : 0;

  // Per-child compliance (last 14 days)
  const childComplianceMap: Record<string, { done: number; total: number }> = {};
  allActivity.forEach(a => {
    if (!childComplianceMap[a.childId]) childComplianceMap[a.childId] = { done: 0, total: 0 };
    childComplianceMap[a.childId].total++;
    if (a.status === 'done' || a.status === 'did_extra' || a.status === 'yes') childComplianceMap[a.childId].done++;
  });

  // Children who haven't checked in today
  const activeChildIds = new Set(children.map(c => c.id));
  const checkedInToday = new Set(todayActivity.map(a => a.childId));
  const notCheckedInToday = children.filter(c => activeChildIds.has(c.id) && !checkedInToday.has(c.id));

  // At-risk children: compliance < 40% with data, or zero activity
  const atRiskChildren = children.filter(c => {
    const stats = childComplianceMap[c.id];
    if (!stats) return true; // no activity at all
    return stats.total > 0 && (stats.done / stats.total) < 0.4;
  });

  // Exam urgency: exams within 14 days
  const urgentExams = examTargets.filter(e => {
    const days = Math.max(0, Math.ceil((new Date(e.exam_date).getTime() - Date.now()) / 86400000));
    return days <= 14;
  });

  // Tier comparison
  const freeParentIds = new Set(memberships.filter(m => m.plan_type === 'free').map(m => m.user_id));
  const premParentIds = new Set(memberships.filter(m => m.plan_type !== 'free').map(m => m.user_id));
  const freeChildIds = new Set(children.filter(c => freeParentIds.has(c.parent_id)).map(c => c.id));
  const premChildIds = new Set(children.filter(c => premParentIds.has(c.parent_id)).map(c => c.id));
  const freeActivity = allActivity.filter(a => freeChildIds.has(a.childId));
  const premActivity = allActivity.filter(a => premChildIds.has(a.childId));
  const freeCompliancePct = freeActivity.length > 0 ? Math.round(freeActivity.filter(a => a.status === 'done' || a.status === 'did_extra' || a.status === 'yes').length / freeActivity.length * 100) : 0;
  const premCompliancePct = premActivity.length > 0 ? Math.round(premActivity.filter(a => a.status === 'done' || a.status === 'did_extra' || a.status === 'yes').length / premActivity.length * 100) : 0;

  // Helper: find parent for a child
  const findParent = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return null;
    return memberships.find(m => m.user_id === child.parent_id);
  };
  const findChild = (childId: string) => children.find(c => c.id === childId);

  const markRequestStatus = async (
    table: 'sq_tutor_requests' | 'sq_diagnostic_requests' | 'sq_crash_course_interest' | 'sq_holiday_programme_interest',
    id: string,
    status: string
  ) => {
    if (!supabase) return;
    const key = `${table}:${id}`;
    setUpdatingRequestKey(key);
    const { error } = await supabase.from(table).update({ status }).eq('id', id);
    setUpdatingRequestKey(null);
    if (error) return;

    const applyStatus = (rows: RequestRow[]) => rows.map((row) => (row.id === id ? { ...row, status } : row));
    if (table === 'sq_tutor_requests') setTutorReqs((prev) => applyStatus(prev));
    if (table === 'sq_diagnostic_requests') setDiagReqs((prev) => applyStatus(prev));
    if (table === 'sq_crash_course_interest') setCrashReqs((prev) => applyStatus(prev));
    if (table === 'sq_holiday_programme_interest') setHolidayReqs((prev) => applyStatus(prev));
  };

  const setMembershipPlan = async (membership: MembershipRow, target: 'premium' | 'free') => {
    if (!supabase) return;

    const isPremiumTarget = target === 'premium';
    const actionLabel = isPremiumTarget ? 'grant premium access' : 'revert this account to free';
    const owner = membership.parent_name || membership.parent_email || membership.user_id;
    const confirmed = window.confirm(`Confirm: ${actionLabel} for ${owner}?`);
    if (!confirmed) return;

    setMembershipActionMessage(null);
    setUpdatingMembershipId(membership.id);

    const nowIso = new Date().toISOString();
    const currentPeriodEndIso = membership.current_period_end && !Number.isNaN(new Date(membership.current_period_end).getTime())
      ? membership.current_period_end
      : null;
    const defaultPremiumEndIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const payload = isPremiumTarget
      ? {
          plan_type: 'premium',
          status: 'premium_active',
          current_period_end: currentPeriodEndIso || defaultPremiumEndIso,
          updated_at: nowIso,
        }
      : {
          plan_type: 'free',
          status: 'free',
          current_period_end: null,
          updated_at: nowIso,
        };

    const { error } = await supabase
      .from('sq_memberships')
      .update(payload)
      .eq('id', membership.id);

    setUpdatingMembershipId(null);
    if (error) {
      setMembershipActionMessage({ type: 'error', text: `Could not update membership: ${error.message}` });
      return;
    }

    setMemberships((prev) => prev.map((row) => (
      row.id === membership.id
        ? {
            ...row,
            ...payload,
          }
        : row
    )));

    setMembershipActionMessage({
      type: 'success',
      text: isPremiumTarget
        ? 'Premium access granted successfully.'
        : 'Account reverted to free successfully.',
    });
  };

  const previewParent = memberships.find(m => m.user_id === previewParentId) || null;
  const previewChildren = previewParent ? children.filter(c => c.parent_id === previewParent.user_id) : [];
  const previewChild = previewChildren.find(c => c.id === previewChildId) || previewChildren[0] || null;
  const previewWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  })();
  const previewStatuses = previewChild
    ? [
        ...recentCheckins.filter(c => c.child_id === previewChild.id && c.checkin_date >= previewWeekStart).map(c => c.status),
        ...recentTasks.filter(t => t.child_id === previewChild.id && t.task_date >= previewWeekStart).map(t => t.status),
      ]
    : [];
  const previewDoneCount = previewStatuses.filter(s => s === 'yes' || s === 'done' || s === 'did_extra').length;
  const previewMissedCount = previewStatuses.filter(s => s === 'no' || s === 'incomplete').length;
  const previewStudyDays = previewChild?.study_days?.length || (previewParent?.plan_type === 'free' ? 3 : 5);
  const previewLang = previewLangMode === 'auto' ? (previewParent?.preferred_language || 'en') : previewLangMode;
  const previewMidweek = previewChildren.map((kid) => {
    const kidCount = [...recentCheckins.filter(c => c.child_id === kid.id && c.checkin_date >= previewWeekStart).map(c => c.status), ...recentTasks.filter(t => t.child_id === kid.id && t.task_date >= previewWeekStart).map(t => t.status)]
      .filter(s => s === 'yes' || s === 'done' || s === 'did_extra').length;
    return `${kid.name}: ${kidCount} check-ins so far`;
  }).join('\n');
  const previewExam = previewChild ? examTargets.filter(e => e.child_id === previewChild.id && e.cycle_status === 'active').sort((a, b) => a.exam_date.localeCompare(b.exam_date))[0] : null;
  const previewSubject = previewExam ? (subjects.find(s => s.id === previewExam.subject_id)?.subject_name || previewExam.exam_type) : null;
  const previewDaysToExam = previewExam ? Math.max(0, Math.ceil((new Date(previewExam.exam_date).getTime() - Date.now()) / 86400000)) : null;
  const weeklyPreviewText = !previewChild || !previewParent
    ? 'Select a StudyPulse parent to preview the outbound message.'
    : previewLang === 'zh'
      ? `📊 *${previewChild.name} 的周报*\n${previewWeekStart} 这一周\n\n✅ 完成：${previewDoneCount}/${previewStudyDays} 天\n${previewMissedCount > 0 ? `❌ 缺席：${previewMissedCount} 天\n` : ''}\n${previewDoneCount >= previewStudyDays ? `🎉 完美的一周！${previewChild.name} 每个学习日都打卡了。` : previewDoneCount > 0 ? '不错 — 继续保持！' : '下周争取更多打卡 💪'}\n\n📋 *您这周检查过 ${previewChild.name} 的作业吗？*\n回复 *CONFIRM* 确认，或 *ADJUST* 调整。`
      : `📊 *Weekly Summary for ${previewChild.name}*\nWeek of ${previewWeekStart}\n\n✅ Completed: ${previewDoneCount}/${previewStudyDays} days\n${previewMissedCount > 0 ? `❌ Missed: ${previewMissedCount} days\n` : ''}\n${previewDoneCount >= previewStudyDays ? `🎉 Perfect week! ${previewChild.name} checked in every study day.` : previewDoneCount > 0 ? 'Good effort — keep building the habit!' : `Let's aim for more check-ins next week 💪`}\n\n📋 *Have you seen ${previewChild.name}'s work this week?*\nReply *confirm* if yes, or *adjust* if not accurate.`;
  const midweekPreviewText = !previewParent
    ? 'Select a StudyPulse parent to preview the mid-week nudge.'
    : previewLang === 'zh'
      ? `📋 *周中检查* — 温习进行得怎样？\n\n${previewChildren.map(kid => `${kid.name}：到目前为止 ${[...recentCheckins.filter(c => c.child_id === kid.id && c.checkin_date >= previewWeekStart).map(c => c.status), ...recentTasks.filter(t => t.child_id === kid.id && t.task_date >= previewWeekStart).map(t => t.status)].filter(s => s === 'yes' || s === 'done' || s === 'did_extra').length} 次打卡`).join('\n')}\n\n您检查过他们的作业吗？看一看能保持诚实！👀`
      : `📋 *Mid-week check* — how's the studying going?\n\n${previewMidweek || 'No child activity yet'}\n\nHave you checked their work? A quick look keeps things honest! 👀`;
  const examPreviewText = !previewParent || !previewChild
    ? 'Select a StudyPulse parent to preview the exam reminder.'
    : previewExam && previewDaysToExam !== null
      ? previewLang === 'zh'
        ? `📅 ${previewChild.name} 的 ${previewSubject} 考试还有 *${previewDaysToExam} 天*。是时候巩固复习了。`
        : `📅 ${previewChild.name}'s ${previewSubject} exam is in *${previewDaysToExam} days*. Good time to review and consolidate.`
      : previewLang === 'zh'
        ? `目前没有即将发送的考试提醒。`
        : `There is no urgent exam reminder to send right now.`;

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 px-4 py-4 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-300">StudyPulse Admin</p>
            <p className="text-lg font-black">Study Monitoring Dashboard</p>
          </div>
          <Link to="/admin" className="flex items-center text-xs text-slate-400 hover:text-white">
            <ArrowLeft size={14} className="mr-1" /> Main Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Parents', value: memberships.length, icon: Users, color: 'bg-blue-100 text-blue-700' },
            { label: 'Free / Premium', value: `${freeCt} / ${premCt}`, icon: Crown, color: 'bg-amber-100 text-amber-700' },
            { label: 'Children', value: totalChildren, icon: BookOpen, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'CTA Requests', value: totalReqs, icon: Zap, color: 'bg-purple-100 text-purple-700', clickable: true },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                if ((s as any).clickable) setAdminTab('requests');
              }}
              className={`rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm ${
                (s as any).clickable ? 'transition hover:border-purple-300 hover:bg-purple-50/30' : ''
              }`}
            >
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">{s.label}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{s.value}</p>
              {(s as any).clickable && <p className="mt-1 text-[10px] font-semibold text-purple-600">Click to open Requests</p>}
            </button>
          ))}
        </div>

        {/* ── Admin Tab Navigation ── */}
        <nav className="mb-6 flex gap-2 border-b border-slate-200 pb-3">
          {([
            { id: 'monitoring' as const, label: 'Monitoring', icon: Shield },
            { id: 'members' as const, label: 'Members', icon: Users },
            { id: 'requests' as const, label: 'Requests', icon: Zap },
            { id: 'preview' as const, label: 'Message Preview', icon: FileText },
          ]).map((t) => (
            <button key={t.id} onClick={() => setAdminTab(t.id)} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${adminTab === t.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </nav>

        {/* ═══════════ MONITORING TAB ═══════════ */}
        {adminTab === 'monitoring' && (
          <div className="space-y-6">
            {/* Platform Health Row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <BarChart3 size={18} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">14-Day Compliance</p>
                <p className={`mt-1 text-2xl font-black ${overallCompliance >= 70 ? 'text-emerald-600' : overallCompliance >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{overallCompliance}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Flame size={18} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Checked In Today</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{todayDone}<span className="text-sm font-normal text-slate-400">/{totalChildren}</span></p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <AlertTriangle size={18} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">At-Risk Children</p>
                <p className="mt-1 text-2xl font-black text-red-600">{atRiskChildren.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Target size={18} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Exams This Fortnight</p>
                <p className="mt-1 text-2xl font-black text-amber-600">{urgentExams.length}</p>
              </div>
            </div>

            {/* Tier Comparison */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">📊 Free vs Premium Compliance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Free ({freeChildIds.size} children)</span>
                    <span className="text-xs font-bold text-slate-700">{freeCompliancePct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full transition-all ${freeCompliancePct >= 70 ? 'bg-emerald-500' : freeCompliancePct >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${freeCompliancePct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-600">Premium ({premChildIds.size} children)</span>
                    <span className="text-xs font-bold text-slate-700">{premCompliancePct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full transition-all ${premCompliancePct >= 70 ? 'bg-emerald-500' : premCompliancePct >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${premCompliancePct}%` }} />
                  </div>
                </div>
              </div>
              {premCompliancePct > freeCompliancePct + 10 && (
                <p className="mt-3 text-xs text-emerald-600">
                  <TrendingUp size={12} className="inline mr-1" />Premium users are {premCompliancePct - freeCompliancePct}% more compliant — daily check-ins work!
                </p>
              )}
            </div>

            {/* Exception Alerts: Not Checked In Today */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">🔴 Not Checked In Today</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">{notCheckedInToday.length}</span>
              </div>
              {notCheckedInToday.length === 0 ? (
                <p className="text-xs text-emerald-600">✅ All children have checked in today!</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {notCheckedInToday.map(c => {
                    const parent = memberships.find(m => m.user_id === c.parent_id);
                    const stats = childComplianceMap[c.id];
                    const pct = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                    return (
                      <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{c.name} <span className="text-slate-400">({c.level})</span></p>
                          <p className="text-[10px] text-slate-400">Parent: {parent?.parent_name || '—'}</p>
                        </div>
                        <span className={`text-xs font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{pct}% compliance</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* At-Risk Children */}
            <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-red-700">⚠️ At-Risk Children ({"<"}40% compliance or no activity)</h3>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-600">{atRiskChildren.length}</span>
              </div>
              {atRiskChildren.length === 0 ? (
                <p className="text-xs text-emerald-600">✅ No at-risk children. Everyone is on track!</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {atRiskChildren.map(c => {
                    const parent = memberships.find(m => m.user_id === c.parent_id);
                    const stats = childComplianceMap[c.id];
                    const pct = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                    const noData = !stats || stats.total === 0;
                    const childExams = examTargets.filter(e => e.child_id === c.id);
                    const nextExam = childExams.length > 0 ? childExams[0] : null;
                    const daysToExam = nextExam ? Math.max(0, Math.ceil((new Date(nextExam.exam_date).getTime() - Date.now()) / 86400000)) : null;
                    return (
                      <div key={c.id} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{c.name} <span className="font-normal text-slate-400">({c.level})</span></p>
                            <p className="text-[10px] text-slate-500">Parent: {parent?.parent_name || '—'} · {parent?.parent_email || '—'}</p>
                          </div>
                          <div className="text-right">
                            {noData ? (
                              <span className="text-xs font-bold text-slate-400">No activity</span>
                            ) : (
                              <span className="text-xs font-bold text-red-600">{pct}%</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {noData && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">Zero check-ins recorded</span>}
                          {!noData && pct < 40 && <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] text-red-700">Below min compliance</span>}
                          {daysToExam !== null && daysToExam <= 21 && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] text-amber-700">Exam in {daysToExam}d</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Exams */}
            {urgentExams.length > 0 && (
              <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-amber-700 mb-3">📅 Exams Within 14 Days</h3>
                <div className="space-y-2">
                  {urgentExams.map(e => {
                    const child = findChild(e.child_id);
                    const parent = child ? memberships.find(m => m.user_id === child.parent_id) : null;
                    const subj = subjects.find(s => s.id === e.subject_id);
                    const days = Math.max(0, Math.ceil((new Date(e.exam_date).getTime() - Date.now()) / 86400000));
                    const stats = childComplianceMap[e.child_id];
                    const pct = stats && stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                    return (
                      <div key={e.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{child?.name || '—'} — {subj?.subject_name || '—'}</p>
                          <p className="text-[10px] text-slate-400">{e.exam_date} · {e.exam_type} · Parent: {parent?.parent_name || '—'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black ${days <= 7 ? 'text-red-600' : 'text-amber-600'}`}>{days}d</p>
                          <p className={`text-[10px] ${pct >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>{pct}% prep</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Per-Child Compliance Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">📋 All Children — Compliance Overview</h3>
                <p className="text-[10px] text-slate-400 mt-1">Based on last 14 days of check-in/task data</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Child</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Level</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Parent</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Plan</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Done / Total</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Compliance</th>
                      <th className="px-4 py-2.5 font-bold text-slate-500 text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children
                      .map(c => {
                        const stats = childComplianceMap[c.id] || { done: 0, total: 0 };
                        const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                        return { ...c, done: stats.done, total: stats.total, pct };
                      })
                      .sort((a, b) => a.pct - b.pct)
                      .map(c => {
                        const parent = memberships.find(m => m.user_id === c.parent_id);
                        const statusLabel = c.total === 0 ? 'No Data' : c.pct >= 80 ? 'Excellent' : c.pct >= 60 ? 'Good' : c.pct >= 40 ? 'Needs Attention' : 'At Risk';
                        const statusColor = c.total === 0 ? 'bg-slate-100 text-slate-500' : c.pct >= 80 ? 'bg-emerald-100 text-emerald-700' : c.pct >= 60 ? 'bg-blue-100 text-blue-700' : c.pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
                        return (
                          <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-semibold text-slate-900">{c.name}</td>
                            <td className="px-4 py-2.5 text-slate-500">{c.level}</td>
                            <td className="px-4 py-2.5 text-slate-500">{parent?.parent_name || '—'}</td>
                            <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge(parent?.plan_type || 'free')}`}>{parent?.plan_type || 'free'}</span></td>
                            <td className="px-4 py-2.5 text-slate-600">{c.done} / {c.total}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-16 rounded-full bg-slate-100">
                                  <div className={`h-2 rounded-full ${c.pct >= 80 ? 'bg-emerald-500' : c.pct >= 60 ? 'bg-blue-500' : c.pct >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${c.pct}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{c.pct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>{statusLabel}</span></td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ PREVIEW TAB ═══════════ */}
        {adminTab === 'preview' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Admin-only WhatsApp preview</h3>
              <p className="mt-1 text-xs text-slate-500">This shows the final outbound message in the parent's preferred language before the cron sends it.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Parent</label>
                  <select className={inputCls + ' mt-1'} value={previewParentId} onChange={(e) => setPreviewParentId(e.target.value)}>
                    <option value="">Select a parent...</option>
                    {memberships.map((m) => (
                      <option key={m.user_id} value={m.user_id}>{m.parent_name || m.parent_email || m.user_id.slice(0, 8)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Child</label>
                  <select className={inputCls + ' mt-1'} value={previewChild?.id || ''} onChange={(e) => setPreviewChildId(e.target.value)} disabled={!previewParent}>
                    <option value="">{previewParent ? 'Select a child...' : 'Select a parent first'}</option>
                    {previewChildren.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Preview language</label>
                  <select className={inputCls + ' mt-1'} value={previewLangMode} onChange={(e) => setPreviewLangMode(e.target.value as 'auto' | 'en' | 'zh')}>
                    <option value="auto">Auto (saved setting)</option>
                    <option value="en">Force English</option>
                    <option value="zh">Force Chinese</option>
                  </select>
                </div>
              </div>
              {previewParent && (
                <p className="mt-3 text-xs text-slate-500">Saved parent language: <strong>{previewParent.preferred_language === 'zh' ? 'Chinese' : previewParent.preferred_language === 'en' ? 'English' : 'Not set'}</strong> · Preview currently showing: <strong>{previewLang === 'zh' ? 'Chinese' : 'English'}</strong></p>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-700">Weekly Summary Preview</h4>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{weeklyPreviewText}</pre>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-700">Mid-week Nudge Preview</h4>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{midweekPreviewText}</pre>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-700">Exam Reminder Preview</h4>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{examPreviewText}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ MEMBERS TAB ═══════════ */}
        {adminTab === 'members' && (
          <div>
            {membershipActionMessage && (
              <div className={`mb-4 rounded-xl border px-4 py-3 text-xs font-semibold ${membershipActionMessage.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                {membershipActionMessage.text}
              </div>
            )}
            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={inputCls + ' pl-9'} placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {(['all', 'free', 'premium'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    {f === 'all' ? 'All' : f === 'free' ? 'Free' : 'Premium'}
                  </button>
                ))}
              </div>
            </div>

            {/* Memberships table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 font-bold text-slate-500"></th>
                  <th className="px-4 py-3 font-bold text-slate-500">Parent</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Plan</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Status</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Children</th>
                  <th className="px-4 py-3 font-bold text-slate-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No memberships found.</td></tr>
                )}
                {filtered.map((m) => {
                  const kids = children.filter(c => c.parent_id === m.user_id);
                  const expanded = expandedId === m.id;
                  return (
                    <React.Fragment key={m.id}>
                      <tr className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(expanded ? null : m.id)}>
                        <td className="px-4 py-3 text-slate-400">{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{m.parent_name || '—'}</p>
                          <p className="text-xs text-slate-400">{m.parent_email}</p>
                        </td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${badge(m.plan_type)}`}>{m.plan_type}</span></td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${badge(m.status)}`}>{m.status}</span></td>
                        <td className="px-4 py-3 font-semibold">{kids.length}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{m.created_at?.split('T')[0]}</td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50 px-6 py-4">
                            <div className="space-y-3">
                              <p className="text-xs text-slate-500"><strong>Phone:</strong> {m.parent_phone || '—'}</p>
                              <div className="flex flex-wrap gap-2">
                                {m.status !== 'premium_active' ? (
                                  <button
                                    type="button"
                                    disabled={updatingMembershipId === m.id}
                                    onClick={() => setMembershipPlan(m, 'premium')}
                                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                  >
                                    {updatingMembershipId === m.id ? 'Saving...' : 'Grant Premium'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={updatingMembershipId === m.id}
                                    onClick={() => setMembershipPlan(m, 'free')}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                  >
                                    {updatingMembershipId === m.id ? 'Saving...' : 'Revert to Free'}
                                  </button>
                                )}
                              </div>
                              {kids.map((k) => {
                                const subs = subjects.filter(s => s.child_id === k.id);
                                return (
                                  <div key={k.id} className="rounded-xl bg-white p-3 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-bold text-slate-900">{k.name} <span className="font-normal text-slate-400">({k.level})</span></p>
                                      <p className="text-xs text-slate-400">WhatsApp: {k.whatsapp_number || '—'}</p>
                                    </div>
                                    {subs.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {subs.map((s) => (
                                          <span key={s.id} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                            {s.subject_name} {s.exam_type === 'major' ? '★' : ''} {s.exam_date ? `(${s.exam_date})` : ''}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        )}

        {/* ═══════════ REQUESTS TAB ═══════════ */}
        {adminTab === 'requests' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-bold text-blue-800">How this queue works</p>
            <p className="mt-1 text-xs text-blue-700">When a parent taps an action button in StudyPulse, the request is stored here in this admin queue. Open a row to see parent and child details, then mark it as contacted after outreach.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
          {[
            { title: 'Tutor Requests', data: tutorReqs, icon: UserPlus, color: 'text-blue-700', table: 'sq_tutor_requests' as const },
            { title: 'Diagnostic Requests', data: diagReqs, icon: Target, color: 'text-purple-700', table: 'sq_diagnostic_requests' as const },
            { title: 'Crash Course Interest', data: crashReqs, icon: Zap, color: 'text-orange-700', table: 'sq_crash_course_interest' as const },
            { title: 'Holiday Programme Interest', data: holidayReqs, icon: CalendarDays, color: 'text-emerald-700', table: 'sq_holiday_programme_interest' as const },
          ].map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <section.icon size={16} className={section.color} />
                <h3 className="text-sm font-bold text-slate-700">{section.title}</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{section.data.length}</span>
              </div>
              {section.data.length === 0 ? (
                <p className="text-xs text-slate-400">None yet.</p>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto">
                  {section.data.slice(0, 50).map((r, idx) => {
                    const parent = memberships.find(m => m.user_id === r.parent_id);
                    const child = findChild(r.child_id);
                    const key = `${section.table}:${r.id}`;
                    const isExpanded = expandedRequestKey === key;
                    // Use embedded fields first (new requests), fall back to join (old requests)
                    const parentName = r.parent_name || parent?.parent_name || r.parent_email || parent?.parent_email || '(No name set)';
                    const parentPhone = r.parent_phone || parent?.parent_phone || 'Not provided';
                    const parentEmail = r.parent_email || parent?.parent_email || 'Not provided';
                    const parentPhoneDigits = (r.parent_phone || parent?.parent_phone || '').replace(/[^0-9]/g, '');
                    const childName = r.child_name || child?.name || '(Unknown child)';
                    const childLevel = r.child_level || child?.level || '';
                    const refNo = `#${String(idx + 1).padStart(3, '0')}`;
                    return (
                      <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setExpandedRequestKey(isExpanded ? null : key)}
                          className="flex w-full items-center justify-between gap-3 text-left"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-700">
                              <span className="mr-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-black text-slate-500">{refNo}</span>
                              {parentName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{childName}{childLevel ? ` · ${childLevel}` : ''}</p>
                            <p className="text-[10px] text-slate-400">{r.trigger_reason || 'manual_request'} · {r.created_at?.split('T')[0]}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge(r.status || 'pending')}`}>{r.status || 'pending'}</span>
                            {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 rounded-lg bg-white p-3">
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Parent:</strong> {parentName}</p>
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">WhatsApp:</strong> {parentPhone}</p>
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Email:</strong> {parentEmail}</p>
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Child:</strong> {childName}{childLevel ? ` (${childLevel})` : ''}</p>
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Request Type:</strong> {r.trigger_reason || 'manual_request'}</p>
                            <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Submitted:</strong> {r.created_at ? new Date(r.created_at).toLocaleString('en-SG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                disabled={updatingRequestKey === key}
                                onClick={() => markRequestStatus(section.table, r.id, 'contacted')}
                                className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-50"
                              >
                                {updatingRequestKey === key ? 'Saving...' : 'Mark Contacted'}
                              </button>
                              <button
                                type="button"
                                disabled={updatingRequestKey === key}
                                onClick={() => markRequestStatus(section.table, r.id, 'pending')}
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 disabled:opacity-50"
                              >
                                Set Pending
                              </button>
                              {parentPhoneDigits && (
                                <a
                                  href={`https://wa.me/${parentPhoneDigits}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
                                >
                                  Open WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default StudyPulseAdmin;
