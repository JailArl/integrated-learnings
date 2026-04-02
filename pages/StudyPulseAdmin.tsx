import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Crown,
  FileText,
  Search,
  Target,
  TrendingDown,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { supabase } from '../services/supabase';

/* ── types ── */
interface MembershipRow {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  created_at: string;
}
interface ChildRow {
  id: string;
  parent_id: string;
  name: string;
  level: string;
  whatsapp_number: string;
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

  const [filter, setFilter] = useState<'all'|'free'|'premium'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      setLoading(false);
    })();
  }, []);

  const filtered = memberships
    .filter(m => filter === 'all' || m.plan_type === filter)
    .filter(m => !search || m.parent_name?.toLowerCase().includes(search.toLowerCase()) || m.parent_email?.toLowerCase().includes(search.toLowerCase()));

  const freeCt = memberships.filter(m => m.plan_type === 'free').length;
  const premCt = memberships.filter(m => m.plan_type !== 'free').length;
  const totalChildren = children.length;
  const totalReqs = tutorReqs.length + diagReqs.length + crashReqs.length + holidayReqs.length;

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
            { label: 'CTA Requests', value: totalReqs, icon: Zap, color: 'bg-purple-100 text-purple-700' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">{s.label}</p>
              <p className="mt-1 text-xl font-black text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

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

        {/* CTA Requests */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {[
            { title: 'Tutor Requests', data: tutorReqs, icon: UserPlus, color: 'text-blue-700' },
            { title: 'Diagnostic Requests', data: diagReqs, icon: Target, color: 'text-purple-700' },
            { title: 'Crash Course Interest', data: crashReqs, icon: Zap, color: 'text-orange-700' },
            { title: 'Holiday Programme Interest', data: holidayReqs, icon: CalendarDays, color: 'text-emerald-700' },
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {section.data.slice(0, 10).map((r) => {
                    const parent = memberships.find(m => m.user_id === r.parent_id);
                    return (
                      <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{parent?.parent_name || r.parent_id.slice(0, 8)}</p>
                          <p className="text-[10px] text-slate-400">{r.trigger_reason} · {r.created_at?.split('T')[0]}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge(r.status || 'pending')}`}>{r.status || 'pending'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudyPulseAdmin;
