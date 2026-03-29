import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Plus, RefreshCw, Download, Trash2, Play, Square, ChevronLeft, Users, Trophy, GamepadIcon, Clock, FileText, X } from 'lucide-react';

interface Props {
  events: any[];
  setEvents: (e: any[]) => void;
  detail: any;
  setDetail: (d: any) => void;
  rounds: any[];
  setRounds: (r: any[]) => void;
  sessions: any[];
  setSessions: (s: any[]) => void;
  players: any[];
  setPlayers: (p: any[]) => void;
  newSchool: string;
  setNewSchool: (s: string) => void;
  newHours: number;
  setNewHours: (h: number) => void;
}

const GOAL_LABELS: Record<string, string> = {
  ff_earliest: '🏁 First to FF',
  highest_nw: '💰 Net Worth',
  highest_hi: '😊 Happiness',
  highest_cpf: '🏛️ CPF',
  balanced_life: '⚖️ Balanced Life',
  combined: '🥇 Combined',
};

type RunLevel = 'class' | 'school';

const RUN_LEVEL_NOTE_RE = /\[run_level:(class|school)\]/i;

function getRunLevelFromNotes(notes: string | null | undefined): RunLevel {
  if (!notes) return 'class';
  const match = notes.match(RUN_LEVEL_NOTE_RE);
  return match?.[1]?.toLowerCase() === 'school' ? 'school' : 'class';
}

function withRunLevelNote(notes: string | null | undefined, runLevel: RunLevel): string {
  const base = (notes || '').replace(RUN_LEVEL_NOTE_RE, '').trim();
  const prefix = `[run_level:${runLevel}]`;
  return base ? `${prefix} ${base}` : prefix;
}

const EnrichmentAdminPanel: React.FC<Props> = ({
  events, setEvents, detail, setDetail,
  rounds, setRounds, sessions, setSessions,
  players, setPlayers, newSchool, setNewSchool,
  newHours, setNewHours,
}) => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundGoal, setNewRoundGoal] = useState('combined');
  const [newRunLevel, setNewRunLevel] = useState<RunLevel>('class');
  const [dashboardViewMode, setDashboardViewMode] = useState<RunLevel>('class');
  const [extendingEventId, setExtendingEventId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showRoundReport, setShowRoundReport] = useState(false);
  const [classroomCodes, setClassroomCodes] = useState<any[]>([]);
  const [newClassId, setNewClassId] = useState('');
  const [newInstructorName, setNewInstructorName] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);
  const [classRoundStatuses, setClassRoundStatuses] = useState<any[]>([]);

  // Load events on mount
  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('game_events').select('*').order('created_at', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  const createEvent = async () => {
    if (!supabase || !newSchool.trim()) return;
    setCreating(true);
    const { data, error } = await supabase.rpc('create_game_event', {
      p_school_name: newSchool.trim(),
      p_hours: newHours,
      p_notes: withRunLevelNote('', newRunLevel),
    });
    if (data && !error) {
      setNewSchool('');
      setNewRunLevel('class');
      loadEvents();
    } else {
      alert('Error creating event: ' + (error?.message || 'Unknown'));
    }
    setCreating(false);
  };

  const updateEventRunLevel = async (eventId: string, runLevel: RunLevel, notes: string | null | undefined) => {
    if (!supabase) return;
    const mergedNotes = withRunLevelNote(notes, runLevel);
    const { error } = await supabase.from('game_events').update({ notes: mergedNotes }).eq('id', eventId);
    if (error) {
      alert('Unable to update event level: ' + error.message);
      return;
    }

    setDashboardViewMode(runLevel);
    if (detail?.id === eventId) {
      setDetail({ ...detail, notes: mergedNotes });
      await loadDetail({ ...detail, notes: mergedNotes });
    }
    await loadEvents();
  };

  const prolongAccessCode = async (eventId: string, expiresAt: string, addHours: number) => {
    if (!supabase) return;
    setExtendingEventId(eventId);
    const baseTs = Math.max(Date.now(), new Date(expiresAt).getTime());
    const nextExpiry = new Date(baseTs + addHours * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('game_events')
      .update({ expires_at: nextExpiry, is_active: true })
      .eq('id', eventId);

    if (error) {
      alert('Unable to prolong access code: ' + error.message);
      setExtendingEventId(null);
      return;
    }

    if (detail?.id === eventId) {
      const updatedDetail = { ...detail, expires_at: nextExpiry, is_active: true };
      setDetail(updatedDetail);
      await loadDetail(updatedDetail);
    }
    await loadEvents();
    setExtendingEventId(null);
  };

  const toggleEvent = async (id: string, activate: boolean) => {
    if (!supabase) return;
    await supabase.from('game_events').update({ is_active: activate }).eq('id', id);
    loadEvents();
    if (detail?.id === id) setDetail({ ...detail, is_active: activate });
  };

  const exportEvent = async (id: string) => {
    if (!supabase) return;
    const { data } = await supabase.rpc('export_event_report', { p_event_id: id });
    if (!data) { alert('No data to export'); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteEvent = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Delete this event and ALL student data? This cannot be undone.')) return;
    await supabase.rpc('cleanup_event', { p_event_id: id });
    if (detail?.id === id) setDetail(null);
    loadEvents();
  };

  const loadDetail = async (evt: any) => {
    if (!supabase) return;
    setDetail(evt);
    setDashboardViewMode(getRunLevelFromNotes(evt?.notes));
    const { data: rds } = await supabase.from('game_rounds').select('*').eq('event_id', evt.id).order('round_number');
    setRounds(rds || []);
    const { data: pls } = await supabase.from('players').select('*').eq('event_id', evt.id);
    setPlayers(pls || []);
    loadClassroomCodes(evt.id);
    // Load class round statuses for classroom mode
    const { data: crs } = await supabase.from('class_round_status').select('*').eq('event_id', evt.id);
    setClassRoundStatuses(crs || []);
    const activeRound = (rds || []).find((r: any) => r.is_active);
    if (activeRound) {
      const { data: sess } = await supabase
        .from('game_sessions')
        .select('*, players(class_id, index_number)')
        .eq('round_id', activeRound.id)
        .order('final_score', { ascending: false });
      setSessions(sess || []);
    } else {
      setSessions([]);
    }
  };

  const activateRound = async (roundId: string, eventId: string) => {
    if (!supabase) return;
    // Deactivate all rounds for this event, then activate selected
    for (const r of rounds) {
      await supabase.from('game_rounds').update({ is_active: r.id === roundId }).eq('id', r.id);
    }
    loadDetail(detail);
  };

  const createRound = async () => {
    if (!supabase || !detail || !newRoundName.trim()) return;
    const nextNum = rounds.reduce((m: number, r: any) => Math.max(m, r.round_number || 0), 0) + 1;
    await supabase.from('game_rounds').insert({
      event_id: detail.id,
      round_name: newRoundName.trim(),
      round_number: nextNum,
      goal: newRoundGoal,
      is_active: false,
    });
    setNewRoundName('');
    loadDetail(detail);
  };

  // ── Classroom Codes ──
  const loadClassroomCodes = async (eventId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('classroom_codes').select('*').eq('event_id', eventId).order('class_id');
    setClassroomCodes(data || []);
  };

  const createClassroomCode = async () => {
    if (!supabase || !detail || !newClassId.trim()) return;
    setCreatingCode(true);
    const { data, error } = await supabase.rpc('create_classroom_code', {
      p_event_id: detail.id,
      p_class_id: newClassId.trim(),
      p_instructor_name: newInstructorName.trim() || null,
    });
    if (error) {
      alert('Error creating classroom code: ' + error.message);
    } else {
      setNewClassId('');
      setNewInstructorName('');
      await loadClassroomCodes(detail.id);
    }
    setCreatingCode(false);
  };

  const toggleClassroomCode = async (codeId: string, activate: boolean) => {
    if (!supabase) return;
    await supabase.from('classroom_codes').update({ is_active: activate }).eq('id', codeId);
    if (detail) loadClassroomCodes(detail.id);
  };

  const deleteClassroomCode = async (codeId: string) => {
    if (!supabase) return;
    if (!confirm('Delete this classroom code? The instructor will lose access.')) return;
    await supabase.from('classroom_codes').delete().eq('id', codeId);
    if (detail) loadClassroomCodes(detail.id);
  };

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  const fmtFull = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const timeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m left`;
  };

  // ── Player Analysis Engine ──
  const analyzePlayer = (gs: any) => {
    if (!gs) return null;
    const inv = gs.inv || {};
    const snaps = gs.snapshots || [];
    const log = gs.log || [];
    const invTotal = Object.values(inv).reduce((s: number, v: any) => s + (v || 0), 0);
    const safeTotal = (inv.bank || 0) + (inv.fd || 0) + (inv.ssb || 0);
    const riskyTotal = (inv.stock || 0) + (inv.etf || 0) + (inv.reit || 0) + (inv.bank_stock || 0);
    const totalDebt = (gs.studyLoan || 0) + (gs.propLoan || 0) + (gs.carLoan || 0) + (gs.emergencyDebt || 0) + (gs.ccDebt || 0) + (gs.weddingLoan || 0);

    // Titles
    const titles: any[] = [];
    if (invTotal > 0 && safeTotal / Math.max(1, invTotal) > 0.7) titles.push({ id: 'safe_investor', name: 'Safe Investor', icon: '🛡️', color: '#0891b2', desc: 'Over 70% in bank/FD/SSB — plays it very safe' });
    if (invTotal > 0 && riskyTotal / Math.max(1, invTotal) > 0.6) titles.push({ id: 'risk_taker', name: 'Risk Taker', icon: '🎲', color: '#dc2626', desc: 'Over 60% in stocks/ETF/REIT — not afraid of volatility' });
    if (invTotal > 0 && Math.max(...Object.values(inv).map((v: any) => v || 0)) / invTotal < 0.4) titles.push({ id: 'diversifier', name: 'Diversifier', icon: '🎯', color: '#7c3aed', desc: 'No single instrument over 40% — diversified' });
    if ((inv.cpfsa || 0) > 30000) titles.push({ id: 'cpf_maximizer', name: 'CPF Maximizer', icon: '🏛️', color: '#2563eb', desc: 'Built serious CPF-SA via voluntary top-ups' });
    if ((gs.totalDividends || 0) > 15000) titles.push({ id: 'dividend_collector', name: 'Dividend Collector', icon: '💵', color: '#16a34a', desc: 'Earned $15K+ in dividends' });
    if ((inv.bank || 0) > 20000) titles.push({ id: 'emergency_ready', name: 'Emergency Ready', icon: '🛟', color: '#0d9488', desc: 'Strong bank savings cushion' });
    if (invTotal > 200000) titles.push({ id: 'portfolio_builder', name: 'Portfolio Builder', icon: '📈', color: '#059669', desc: 'Portfolio worth over $200K' });
    if (invTotal > 500000) titles.push({ id: 'half_millionaire', name: 'Half Millionaire', icon: '💎', color: '#d97706', desc: 'Portfolio exceeded $500K!' });
    if (gs.ffAge && gs.ffAge <= 45) titles.push({ id: 'early_ff', name: 'Early Retirement', icon: '🏆', color: '#d97706', desc: 'Financial Freedom before 45!' });
    else if (gs.ffAge && gs.ffAge <= 55) titles.push({ id: 'ff_achieved', name: 'Financial Freedom', icon: '⭐', color: '#eab308', desc: 'Reached Financial Freedom' });
    if ((gs.luxurySpent || 0) > 80000) titles.push({ id: 'big_spender', name: 'Big Spender', icon: '🎉', color: '#ec4899', desc: 'Spent over $80K on luxuries' });
    if ((gs.luxurySpent || 0) < 5000 && invTotal > 100000) titles.push({ id: 'frugal_titan', name: 'Frugal Titan', icon: '🧙', color: '#4f46e5', desc: 'Barely spent on luxuries, built serious wealth' });
    if (totalDebt === 0 && (gs.yearsWorked || 0) > 5) titles.push({ id: 'debt_free', name: 'Debt Free', icon: '⚔️', color: '#16a34a', desc: 'Zero debt' });
    if ((gs.ccDebt || 0) > 10000) titles.push({ id: 'debt_trapped', name: 'Debt Trapped', icon: '🪤', color: '#dc2626', desc: 'Stuck with CC debt' });
    if ((gs.emergencyDebt || 0) > 20000) titles.push({ id: 'emergency_spiral', name: 'Emergency Spiral', icon: '🚨', color: '#dc2626', desc: 'Deep in 26% emergency debt' });
    if ((gs.certs || []).length >= 4) titles.push({ id: 'certified_pro', name: 'Certified Pro', icon: '📋', color: '#6366f1', desc: '4+ certifications collected' });
    if (gs.insurance) titles.push({ id: 'insured', name: 'Protected', icon: '🛡️', color: '#059669', desc: 'Bought personal insurance' });
    if ((gs.resetCount || 0) >= 3) titles.push({ id: 'persistent', name: 'Persistent Learner', icon: '🔄', color: '#8b5cf6', desc: 'Reset 3+ times — kept trying' });

    // Behavioral from snapshots
    let panicSwitch = false, lateBloomer = false, consistentGrowth = false;
    if (snaps.length >= 5) {
      for (let si = 1; si < snaps.length; si++) {
        const prev = snaps[si - 1], curr = snaps[si];
        const prevI = Object.values(prev.inv || {}).reduce((s: number, v: any) => s + (v || 0), 0);
        const currI = Object.values(curr.inv || {}).reduce((s: number, v: any) => s + (v || 0), 0);
        const prevR = ((prev.inv?.stock || 0) + (prev.inv?.etf || 0) + (prev.inv?.reit || 0)) / Math.max(1, prevI);
        const currR = ((curr.inv?.stock || 0) + (curr.inv?.etf || 0) + (curr.inv?.reit || 0)) / Math.max(1, currI);
        if (prevR > 0.4 && currR < 0.15) { panicSwitch = true; break; }
      }
      const midIdx = Math.floor(snaps.length / 2);
      const firstNW = snaps[0].nw || 0, midNW = snaps[midIdx].nw || 0, lastNW = snaps[snaps.length - 1].nw || 0;
      if (firstNW > 0 && midNW / firstNW < 1.2 && lastNW / Math.max(1, midNW) > 1.5) lateBloomer = true;
      consistentGrowth = true;
      for (let ci = 3; ci < snaps.length; ci += 3) {
        if (snaps[ci].nw <= (snaps[ci - 3]?.nw || 0)) { consistentGrowth = false; break; }
      }
    }
    if (panicSwitch) titles.push({ id: 'panic_switcher', name: 'Panic Switcher', icon: '😱', color: '#f97316', desc: 'Moved to all-safe after a crash' });
    if (lateBloomer) titles.push({ id: 'late_bloomer', name: 'Late Bloomer', icon: '🌱', color: '#22c55e', desc: 'Slow start, strong finish' });
    if (consistentGrowth && snaps.length >= 6) titles.push({ id: 'steady_climber', name: 'Steady Climber', icon: '📈', color: '#2563eb', desc: 'Net worth grew consistently' });

    // Key moments from log
    const moments: any[] = [];
    log.forEach((entry: any) => {
      const m = entry.msg || '';
      if (m.includes('Emergency debt') || m.includes('26%')) moments.push({ age: entry.age, type: 'danger', text: m });
      else if (m.includes('Emergency liquidation')) moments.push({ age: entry.age, type: 'danger', text: m });
      else if (m.includes('DEBT FREE')) moments.push({ age: entry.age, type: 'win', text: m });
      else if (m.includes('Graduated')) moments.push({ age: entry.age, type: 'milestone', text: m });
      else if (m.includes('Promoted')) moments.push({ age: entry.age, type: 'win', text: m });
      else if (m.includes('ORD LOH')) moments.push({ age: entry.age, type: 'milestone', text: m });
      else if (m.includes('Bought') && (m.includes('Condo') || m.includes('HDB'))) moments.push({ age: entry.age, type: 'milestone', text: m });
      else if (m.includes('scam') || m.includes('Scam')) moments.push({ age: entry.age, type: 'danger', text: m });
      else if (m.includes('Work First:') || m.includes('started as')) moments.push({ age: entry.age, type: 'milestone', text: m });
      else if (m.includes('BTO Ballot SUCCESS')) moments.push({ age: entry.age, type: 'win', text: m });
      else if (m.includes('MATURED')) moments.push({ age: entry.age, type: 'win', text: m });
    });

    // Learning tips
    const tips: string[] = [];
    if (safeTotal / Math.max(1, invTotal) > 0.8) tips.push('📊 Consider diversifying beyond bank savings. ETFs and REITs give higher returns over time with moderate risk.');
    if ((inv.stock || 0) / Math.max(1, invTotal) > 0.5) tips.push('⚠️ Over 50% in growth stocks is very aggressive. A crash could wipe out years of gains.');
    if (!gs.insurance) tips.push('🛡️ No insurance! One illness or accident could destroy your finances.');
    if ((inv.bank || 0) < 3000 && (gs.yearsWorked || 0) > 3) tips.push('🛟 Bank savings (emergency fund) too small. Aim for 3-6 months of expenses before investing.');
    if (totalDebt > 50000) tips.push('🚨 High debt. Prioritize paying off high-interest debt (CC/emergency at 26%) before investing.');
    if (panicSwitch) tips.push('😱 After a crash you moved to all-safe. Markets usually recover in 3-5 years. Staying invested wins long-term.');
    if ((gs.ccDebt || 0) > 0) tips.push('💳 CC debt at 26% is an emergency. No investment earns 26%. Pay this off FIRST.');
    if (invTotal === 0 && (gs.yearsWorked || 0) > 5) tips.push('📈 You have not invested yet. Even small amounts grow significantly over 20+ years.');
    if ((gs.luxurySpent || 0) > 50000 && invTotal < 20000) tips.push('🎯 Spent ' + Math.round((gs.luxurySpent || 0) / 1000) + 'K on luxuries but only invested ' + Math.round(invTotal / 1000) + 'K. The Rule of 72 says that money could have doubled!');
    if (lateBloomer) tips.push('🌱 You improved a lot in the second half. Next round, start those good habits earlier!');
    if (consistentGrowth) tips.push('👏 Net worth grew steadily. Consistency is the real secret to wealth.');

    // Risk profile over time
    const riskProfile = snaps.filter((s: any) => {
      const tot = Object.values(s.inv || {}).reduce((sum: number, v: any) => sum + (v || 0), 0);
      return tot >= 100;
    }).map((snap: any) => {
      const tot = Object.values(snap.inv || {}).reduce((sum: number, v: any) => sum + (v || 0), 0);
      const risky = ((snap.inv?.stock || 0) + (snap.inv?.etf || 0) + (snap.inv?.reit || 0) + (snap.inv?.bank_stock || 0)) / tot;
      return { age: snap.age, risky: Math.round(risky * 100) };
    });

    return { titles, moments: moments.slice(0, 15), tips: tips.slice(0, 5), riskProfile, snaps, invTotal, safeTotal, riskyTotal, totalDebt, gs };
  };

  // ── Student Report Card Component ──
  const renderReportCard = () => {
    if (!selectedSession) return null;
    const gs = selectedSession.game_state;
    const report = analyzePlayer(gs);
    if (!report) return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg" onClick={e => e.stopPropagation()}>
          <p className="text-gray-500">No game data available yet. Student may still be playing.</p>
          <button onClick={() => setSelectedSession(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg text-sm">Close</button>
        </div>
      </div>
    );
    const student = `${selectedSession.players?.class_id}-${selectedSession.players?.index_number}`;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
            <div>
              <h3 className="text-lg font-bold text-gray-900">📋 Report Card: {student}</h3>
              <p className="text-xs text-gray-400">Age {gs?.age || '?'} | Score: {selectedSession.final_score?.toLocaleString()} | {selectedSession.is_complete ? '✅ Completed' : '🎮 Still Playing'}</p>
            </div>
            <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Titles / Badges */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">🏅 Titles Earned</h4>
              {report.titles.length === 0 ? (
                <p className="text-sm text-gray-400">No special titles yet — still early in the game</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {report.titles.map((t: any) => (
                    <div key={t.id} className="group relative">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border"
                        style={{ backgroundColor: t.color + '15', color: t.color, borderColor: t.color + '40' }}
                      >
                        {t.icon} {t.name}
                      </span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-48 z-10 shadow-lg">
                        {t.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Net Worth', value: fmtFull(selectedSession.net_worth || 0), color: 'text-blue-600' },
                { label: 'Cash', value: fmtFull(selectedSession.cash || 0), color: (selectedSession.cash || 0) >= 0 ? 'text-green-600' : 'text-red-600' },
                { label: 'CPF', value: fmtFull(selectedSession.cpf || 0), color: 'text-purple-600' },
                { label: 'Happiness', value: String(selectedSession.happiness || 0), color: 'text-yellow-600' },
                { label: 'Invested', value: fmtFull(report.invTotal), color: 'text-blue-500' },
                { label: 'Safe %', value: `${report.invTotal > 0 ? Math.round(report.safeTotal / report.invTotal * 100) : 0}%`, color: 'text-teal-600' },
                { label: 'Risky %', value: `${report.invTotal > 0 ? Math.round(report.riskyTotal / report.invTotal * 100) : 0}%`, color: 'text-red-500' },
                { label: 'Total Debt', value: fmtFull(report.totalDebt), color: report.totalDebt > 0 ? 'text-red-600' : 'text-green-600' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Risk Profile Over Time */}
            {report.riskProfile.length >= 3 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">📊 Risk Profile Over Time</h4>
                <div className="flex items-end gap-1 h-24 bg-gray-50 rounded-lg p-3">
                  {report.riskProfile.map((r: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`Age ${r.age}: ${r.risky}% risky`}>
                      <div className="w-full flex flex-col" style={{ height: '60px' }}>
                        <div style={{ height: `${r.risky}%`, minHeight: r.risky > 0 ? '2px' : 0 }} className="bg-red-400 rounded-t-sm" />
                        <div style={{ height: `${100 - r.risky}%`, minHeight: (100 - r.risky) > 0 ? '2px' : 0 }} className="bg-teal-400 rounded-b-sm" />
                      </div>
                      <span className="text-[9px] text-gray-400">{r.age}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded" /> Risky</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-400 rounded" /> Safe</span>
                </div>
              </div>
            )}

            {/* Key Moments Timeline */}
            {report.moments.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">⚡ Key Moments</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {report.moments.map((m: any, i: number) => (
                    <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                      m.type === 'danger' ? 'bg-red-50 text-red-700' :
                      m.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      m.type === 'win' ? 'bg-green-50 text-green-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <span className="font-bold whitespace-nowrap">Age {m.age}</span>
                      <span>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Tips */}
            {report.tips.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">💡 Learning Tips</h4>
                <div className="space-y-2">
                  {report.tips.map((tip: string, i: number) => (
                    <div key={i} className="text-sm bg-blue-50 text-blue-800 rounded-lg px-4 py-3 border border-blue-100">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Player Status Helper ──
  const playerStatus = (s: any): { label: string; color: string; bg: string } => {
    if (s.is_complete) return { label: 'Done', color: 'text-green-700', bg: 'bg-green-100' };
    const updatedAt = s.updated_at ? new Date(s.updated_at).getTime() : 0;
    const staleMs = Date.now() - updatedAt;
    if (staleMs > 120000) return { label: 'Offline', color: 'text-gray-500', bg: 'bg-gray-100' };
    return { label: 'Playing', color: 'text-yellow-700', bg: 'bg-yellow-100' };
  };

  // ── Round Report with Rankings, Tiebreakers, Highlights, PDF Export ──
  const renderRoundReport = () => {
    if (!showRoundReport) return null;
    const activeRound = rounds.find((r: any) => r.is_active);
    if (!activeRound) return null;
    const goal = activeRound.goal || 'combined';
    const goalLabel = GOAL_LABELS[goal] || goal;

    // Build ranked list with tiebreaker data
    const ranked = sessions
      .filter((s: any) => s.final_score > 0)
      .map((s: any) => {
        const gs = s.game_state || {};
        const inv = gs.inv || {};
        const invTotal = Object.values(inv).reduce((sum: number, v: any) => sum + (v || 0), 0);
        const report = analyzePlayer(gs);
        // Compute combined score for tiebreaking (mirrors game's combined formula)
        const _nw = s.net_worth || 0;
        const _hi = gs.hi || 0;
        const _cpf = gs.cpf || 0;
        const _ffAge = gs.ffAge || 0;
        const combinedScore = Math.max(0, Math.round(_nw / 200 + _hi * 5 + _cpf / 500 + (_ffAge ? (65 - _ffAge) * 200 : 0)));
        return {
          ...s,
          student: `${s.players?.class_id}-${s.players?.index_number}`,
          nw: s.net_worth || 0,
          hi: s.happiness || 0,
          cpf: s.cpf || 0,
          ffAge: gs.ffAge || null,
          invTotal,
          combinedScore,
          field: gs.field || 'Unknown',
          married: gs.married || false,
          hasChildren: gs.hasChildren || false,
          certs: (gs.certs || []).length,
          luxurySpent: gs.luxurySpent || 0,
          titles: report?.titles || [],
          moments: report?.moments || [],
          tips: report?.tips || [],
        };
      })
      .sort((a: any, b: any) => {
        // Primary ranking by the round's goal metric
        if (goal === 'ff_earliest') {
          const aFF = a.ffAge || 999, bFF = b.ffAge || 999;
          if (aFF !== bFF) return aFF - bFF; // earliest FF wins
          return b.combinedScore - a.combinedScore; // tiebreak: combined
        }
        if (goal === 'highest_nw') {
          if (b.nw !== a.nw) return b.nw - a.nw;
          return b.combinedScore - a.combinedScore;
        }
        if (goal === 'highest_hi') {
          if (b.hi !== a.hi) return b.hi - a.hi;
          return b.combinedScore - a.combinedScore;
        }
        if (goal === 'highest_cpf') {
          if (b.cpf !== a.cpf) return b.cpf - a.cpf;
          return b.combinedScore - a.combinedScore;
        }
        if (goal === 'balanced_life' || goal === 'combined') {
          if (b.final_score !== a.final_score) return b.final_score - a.final_score;
          if (b.nw !== a.nw) return b.nw - a.nw;
          if (b.hi !== a.hi) return b.hi - a.hi;
          return b.cpf - a.cpf;
        }
        return b.final_score - a.final_score;
      });

    // Goal-specific primary metric labels
    const GOAL_PRIMARY: Record<string, string> = {
      ff_earliest: 'Earliest Financial Freedom Age',
      highest_nw: 'Highest Net Worth',
      highest_hi: 'Highest Happiness Index',
      highest_cpf: 'Highest CPF Balance',
      balanced_life: 'Balanced Life Score',
      combined: 'Combined Score',
    };

    // Tiebreaker explanation between two players
    const tieExplain = (higher: any, lower: any): string | null => {
      if (!higher || !lower) return null;
      if (goal === 'ff_earliest') {
        const hFF = higher.ffAge || 999, lFF = lower.ffAge || 999;
        if (hFF === lFF && higher.combinedScore !== lower.combinedScore)
          return `Same FF age (${hFF === 999 ? 'not achieved' : hFF}) — higher Combined Score (${higher.combinedScore.toLocaleString()} vs ${lower.combinedScore.toLocaleString()})`;
        return null;
      }
      if (goal === 'highest_nw' && higher.nw === lower.nw && higher.combinedScore !== lower.combinedScore)
        return `Same Net Worth — higher Combined Score (${higher.combinedScore.toLocaleString()} vs ${lower.combinedScore.toLocaleString()})`;
      if (goal === 'highest_hi' && higher.hi === lower.hi && higher.combinedScore !== lower.combinedScore)
        return `Same Happiness — higher Combined Score (${higher.combinedScore.toLocaleString()} vs ${lower.combinedScore.toLocaleString()})`;
      if (goal === 'highest_cpf' && higher.cpf === lower.cpf && higher.combinedScore !== lower.combinedScore)
        return `Same CPF — higher Combined Score (${higher.combinedScore.toLocaleString()} vs ${lower.combinedScore.toLocaleString()})`;
      if ((goal === 'balanced_life' || goal === 'combined') && higher.final_score === lower.final_score) {
        if (higher.nw !== lower.nw) return `Same score — higher Net Worth (${fmtFull(higher.nw)} vs ${fmtFull(lower.nw)})`;
        if (higher.hi !== lower.hi) return `Same score & NW — higher Happiness (${higher.hi} vs ${lower.hi})`;
        if (higher.cpf !== lower.cpf) return `Same score, NW & HI — higher CPF (${fmtFull(higher.cpf)} vs ${fmtFull(lower.cpf)})`;
      }
      return null;
    };

    // Find interesting behavioral highlights across all players
    const highlights: { icon: string; text: string }[] = [];
    const allTitles: Record<string, string[]> = {};
    ranked.forEach((p: any) => {
      p.titles.forEach((t: any) => {
        if (!allTitles[t.name]) allTitles[t.name] = [];
        allTitles[t.name].push(p.student);
      });
    });

    // Most common & rarest titles
    const titleEntries = Object.entries(allTitles).sort((a, b) => b[1].length - a[1].length);
    if (titleEntries.length > 0) {
      const most = titleEntries[0];
      highlights.push({ icon: '📊', text: `Most common behavior: "${most[0]}" — ${most[1].length} player(s): ${most[1].slice(0, 5).join(', ')}` });
    }
    const rare = titleEntries.filter(e => e[1].length === 1);
    if (rare.length > 0) {
      const pick = rare[Math.floor(Math.random() * rare.length)];
      highlights.push({ icon: '💎', text: `Unique achievement: "${pick[0]}" — only ${pick[1][0]} earned this!` });
    }

    // Biggest spender, most frugal, most certs
    const byLuxury = [...ranked].sort((a: any, b: any) => b.luxurySpent - a.luxurySpent);
    if (byLuxury.length > 0 && byLuxury[0].luxurySpent > 10000)
      highlights.push({ icon: '🎉', text: `Biggest spender: ${byLuxury[0].student} spent ${fmtFull(byLuxury[0].luxurySpent)} on luxuries!` });
    const frugal = byLuxury[byLuxury.length - 1];
    if (frugal && frugal.luxurySpent < 5000 && frugal.invTotal > 50000)
      highlights.push({ icon: '🧙', text: `Most frugal investor: ${frugal.student} — only ${fmtFull(frugal.luxurySpent)} on luxuries, ${fmtFull(frugal.invTotal)} invested!` });
    const byCerts = [...ranked].sort((a: any, b: any) => b.certs - a.certs);
    if (byCerts.length > 0 && byCerts[0].certs >= 3)
      highlights.push({ icon: '📋', text: `Most certified: ${byCerts[0].student} with ${byCerts[0].certs} certifications!` });

    // Anyone with panic switch or debt spiral
    const panickers = ranked.filter((p: any) => p.titles.some((t: any) => t.id === 'panic_switcher'));
    if (panickers.length > 0)
      highlights.push({ icon: '😱', text: `Panic sold after crash: ${panickers.map((p: any) => p.student).join(', ')} — key lesson about staying invested!` });
    const debtSpiral = ranked.filter((p: any) => p.titles.some((t: any) => t.id === 'emergency_spiral' || t.id === 'debt_trapped'));
    if (debtSpiral.length > 0)
      highlights.push({ icon: '🚨', text: `Fell into debt trap: ${debtSpiral.map((p: any) => p.student).join(', ')} — great discussion topic on credit card danger!` });

    // FF achievers
    const ffPlayers = ranked.filter((p: any) => p.ffAge);
    if (ffPlayers.length > 0)
      highlights.push({ icon: '🏁', text: `Achieved Financial Freedom: ${ffPlayers.map((p: any) => `${p.student} (age ${p.ffAge})`).join(', ')}` });

    const handlePrint = () => {
      const el = document.getElementById('round-report-content');
      if (!el) return;
      const win = window.open('', '_blank', 'width=900,height=700');
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><title>Round Report - ${detail.school_name}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;color:#1e293b;font-size:12px;line-height:1.6}
          h1{font-size:20px;margin-bottom:4px} h2{font-size:16px;margin:16px 0 8px;color:#334155;border-bottom:2px solid #e2e8f0;padding-bottom:4px}
          h3{font-size:13px;margin:12px 0 6px;color:#475569}
          .medal{font-size:18px;margin-right:4px} .score{font-family:monospace;font-weight:700;color:#2563eb}
          .tie{font-size:10px;color:#d97706;font-style:italic;margin-left:8px}
          table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11px}
          th{background:#f1f5f9;text-align:left;padding:6px 8px;font-weight:700;border-bottom:2px solid #cbd5e1}
          td{padding:5px 8px;border-bottom:1px solid #e2e8f0}
          tr:nth-child(even){background:#f8fafc}
          .highlight{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:6px 10px;margin:4px 0;font-size:11px}
          .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;margin:1px 2px}
          .meta{color:#6b7280;font-size:11px}
          @media print{body{padding:12px} .no-print{display:none!important}}
        </style></head><body>`);
      win.document.write(el.innerHTML);
      win.document.write('</body></html>');
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRoundReport(false)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header with actions */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900">📊 Round Report: {activeRound.round_name}</h3>
              <p className="text-xs text-gray-400">{detail.school_name} · {goalLabel} · {ranked.length} players · {sessions.filter((s: any) => s.is_complete).length} completed</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 flex items-center gap-1">
                📄 Export PDF
              </button>
              <button onClick={() => setShowRoundReport(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Report Content (used for PDF export) */}
          <div id="round-report-content" className="p-6 space-y-5">
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800 }}>🏫 {detail.school_name} — Round Report</h1>
              <p className="meta" style={{ fontSize: '12px', color: '#6b7280' }}>
                Round {activeRound.round_number}: {activeRound.round_name} · Goal: {goalLabel} · {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Top 3 Podium */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px' }}>🏆 Top 3 Positions</h2>
              <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>Ranked by: <strong>{GOAL_PRIMARY[goal]}</strong> · Tiebreaker: Combined Score</p>
              {ranked.slice(0, 3).map((p: any, i: number) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                const position = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';
                const tieNote = i > 0 ? tieExplain(ranked[i - 1], p) : null;
                const primaryVal = goal === 'ff_earliest' ? (p.ffAge ? `FF Age ${p.ffAge}` : 'Not achieved')
                  : goal === 'highest_nw' ? fmtFull(p.nw)
                  : goal === 'highest_hi' ? `HI: ${p.hi}`
                  : goal === 'highest_cpf' ? fmtFull(p.cpf)
                  : `${p.final_score.toLocaleString()} pts`;
                return (
                  <div key={p.id} style={{ background: i === 0 ? '#fefce8' : i === 1 ? '#f0f9ff' : '#fff7ed', border: `1.5px solid ${i === 0 ? '#fde68a' : i === 1 ? '#bae6fd' : '#fed7aa'}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '22px', marginRight: '8px' }}>{medal}</span>
                        <strong style={{ fontSize: '15px' }}>{position}: {p.student}</strong>
                        <span style={{ marginLeft: '12px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{primaryVal}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
                        Age {p.age} · {p.field}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '11px', color: '#475569' }}>
                      <span>💰 NW: {fmtFull(p.nw)}</span>
                      <span>😊 HI: {p.hi}</span>
                      <span>🏛️ CPF: {fmtFull(p.cpf)}</span>
                      {p.ffAge && <span>🏁 FF: Age {p.ffAge}</span>}
                      <span>📋 {p.certs} certs</span>
                      {p.married && <span>💍</span>}
                      {p.hasChildren && <span>👶</span>}
                      <span style={{ color: '#9ca3af' }}>Combined: {p.combinedScore.toLocaleString()}</span>
                    </div>
                    {/* Titles/badges */}
                    {p.titles.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {p.titles.slice(0, 6).map((t: any) => (
                          <span key={t.id} className="badge" style={{ backgroundColor: t.color + '20', color: t.color }}>{t.icon} {t.name}</span>
                        ))}
                      </div>
                    )}
                    {tieNote && (
                      <div className="tie" style={{ marginTop: '4px', fontSize: '10px', color: '#d97706', fontStyle: 'italic' }}>
                        ⚖️ Tiebreaker vs {ranked[i - 1].student}: {tieNote}
                      </div>
                    )}
                  </div>
                );
              })}
              {ranked.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No scores yet!</p>}
            </div>

            {/* Full Standings Table */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>📋 Full Standings</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>#</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Student</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>{GOAL_PRIMARY[goal]}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Combined</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Net Worth</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>HI</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>CPF</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>FF Age</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Status</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((p: any, i: number) => {
                    const st = playerStatus(p);
                    return (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '5px 8px', fontWeight: 700 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                        <td style={{ padding: '5px 8px', fontWeight: 600 }}>{p.student}</td>
                        <td style={{ padding: '5px 8px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{goal === 'ff_earliest' ? (p.ffAge ? `Age ${p.ffAge}` : '—') : goal === 'highest_nw' ? fmtFull(p.nw) : goal === 'highest_hi' ? p.hi : goal === 'highest_cpf' ? fmtFull(p.cpf) : p.final_score.toLocaleString()}</td>
                        <td style={{ padding: '5px 8px', fontFamily: 'monospace', color: '#6b7280' }}>{p.combinedScore.toLocaleString()}</td>
                        <td style={{ padding: '5px 8px', fontFamily: 'monospace' }}>{fmtFull(p.nw)}</td>
                        <td style={{ padding: '5px 8px' }}>{p.hi}</td>
                        <td style={{ padding: '5px 8px', fontFamily: 'monospace' }}>{fmtFull(p.cpf)}</td>
                        <td style={{ padding: '5px 8px' }}>{p.ffAge || '—'}</td>
                        <td style={{ padding: '5px 8px' }}><span className={`px-2 py-0.5 rounded-full text-xs ${st.bg} ${st.color}`}>{st.label}</span></td>
                        <td style={{ padding: '5px 8px' }}>
                          {p.titles.slice(0, 3).map((t: any) => (
                            <span key={t.id} style={{ fontSize: '10px', marginRight: '2px' }} title={t.name}>{t.icon}</span>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Behavioral Highlights */}
            {highlights.length > 0 && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>🔍 Interesting Highlights</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {highlights.map((h, i) => (
                    <div key={i} className="highlight" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                      {h.icon} {h.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Class Summary Stats */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '2px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>📈 Class Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                {[
                  { label: 'Avg Score', value: ranked.length > 0 ? Math.round(ranked.reduce((s: number, p: any) => s + p.final_score, 0) / ranked.length).toLocaleString() : '—' },
                  { label: 'Avg Net Worth', value: ranked.length > 0 ? fmtFull(Math.round(ranked.reduce((s: number, p: any) => s + p.nw, 0) / ranked.length)) : '—' },
                  { label: 'Avg Happiness', value: ranked.length > 0 ? Math.round(ranked.reduce((s: number, p: any) => s + p.hi, 0) / ranked.length).toString() : '—' },
                  { label: 'FF Achieved', value: `${ffPlayers.length} / ${ranked.length}` },
                  { label: 'Highest Score', value: ranked.length > 0 ? ranked[0].final_score.toLocaleString() : '—' },
                  { label: 'Lowest Score', value: ranked.length > 0 ? ranked[ranked.length - 1].final_score.toLocaleString() : '—' },
                  { label: 'Total Players', value: sessions.length.toString() },
                  { label: 'Completed', value: sessions.filter((s: any) => s.is_complete).length.toString() },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Event Detail View ───
  if (detail) {
    const expired = new Date(detail.expires_at) < new Date();
    const active = detail.is_active && !expired;
    const activeRound = rounds.find((r: any) => r.is_active);
    const completed = sessions.filter((s: any) => s.is_complete);
    const eventRunLevel = getRunLevelFromNotes(detail.notes);
    const byClassMap = players.reduce((acc: Record<string, any[]>, p: any) => {
      const key = p.class_id || 'UNASSIGNED';
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
    const classProgress = Object.entries(byClassMap)
      .map(([classId, classPlayers]: [string, any[]]) => {
        const classPlayerIds = new Set(classPlayers.map((p: any) => p.id));
        const classSessions = sessions.filter((s: any) => classPlayerIds.has(s.player_id));
        const started = new Set(classSessions.map((s: any) => s.player_id)).size;
        const completedCount = new Set(classSessions.filter((s: any) => s.is_complete).map((s: any) => s.player_id)).size;
        const playingNow = classSessions.filter((s: any) => {
          if (s.is_complete) return false;
          const updatedAt = s.updated_at ? new Date(s.updated_at).getTime() : 0;
          return Date.now() - updatedAt <= 120000;
        }).length;
        const registered = classPlayers.length;
        const participationRate = registered > 0 ? Math.round((started / registered) * 100) : 0;
        const completionRate = registered > 0 ? Math.round((completedCount / registered) * 100) : 0;

        return {
          classId,
          registered,
          started,
          completed: completedCount,
          playingNow,
          participationRate,
          completionRate,
        };
      })
      .sort((a, b) => a.classId.localeCompare(b.classId));

    const totalRegistered = players.length;
    const totalStarted = new Set(sessions.map((s: any) => s.player_id)).size;
    const totalCompleted = new Set(sessions.filter((s: any) => s.is_complete).map((s: any) => s.player_id)).size;
    const totalPlayingNow = sessions.filter((s: any) => {
      if (s.is_complete) return false;
      const updatedAt = s.updated_at ? new Date(s.updated_at).getTime() : 0;
      return Date.now() - updatedAt <= 120000;
    }).length;
    const notStarted = Math.max(0, totalRegistered - totalStarted);
    const schoolParticipationRate = totalRegistered > 0 ? Math.round((totalStarted / totalRegistered) * 100) : 0;
    const schoolCompletionRate = totalRegistered > 0 ? Math.round((totalCompleted / totalRegistered) * 100) : 0;

    return (
      <div className="space-y-4">
        {/* Report Card Modal */}
        {renderReportCard()}
        {/* Round Report Modal */}
        {renderRoundReport()}

        {/* Back + Delete */}
        <div className="flex items-center justify-between">
          <button onClick={() => setDetail(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft size={16} /> Back to Events
          </button>
          <button
            onClick={() => deleteEvent(detail.id)}
            className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 flex items-center gap-1"
          >
            <Trash2 size={14} /> Delete Event
          </button>
        </div>

        {/* Event header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">🏫 {detail.school_name}</h3>
              <p className="text-sm text-gray-500 mt-1">Created: {new Date(detail.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold tracking-widest text-blue-600">{detail.access_code}</div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                active ? 'bg-green-100 text-green-700' : expired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {active ? '● ACTIVE' : expired ? '✖ EXPIRED' : '○ INACTIVE'}
              </span>
              {!expired && (
                <p className={`text-xs mt-1 ${new Date(detail.expires_at).getTime() - Date.now() < 7200000 ? 'text-red-600' : 'text-gray-500'}`}>
                  ⏱️ {timeLeft(detail.expires_at)}
                </p>
              )}
              <div className="mt-3 flex gap-2 justify-end">
                <button
                  onClick={() => prolongAccessCode(detail.id, detail.expires_at, 24)}
                  disabled={extendingEventId === detail.id}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs hover:bg-amber-100 disabled:opacity-50"
                >
                  {extendingEventId === detail.id ? 'Updating...' : '+24h Code'}
                </button>
                <button
                  onClick={() => prolongAccessCode(detail.id, detail.expires_at, 72)}
                  disabled={extendingEventId === detail.id}
                  className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs hover:bg-green-100 disabled:opacity-50"
                >
                  {extendingEventId === detail.id ? 'Updating...' : '+72h Code'}
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Share this code with students: <strong>integratedlearnings.com.sg/games/life-choices.html</strong>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Run Level</p>
              <p className="text-sm font-semibold text-gray-700">
                {eventRunLevel === 'school' ? 'School level cohort' : 'Class level cohorts'}
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => updateEventRunLevel(detail.id, 'class', detail.notes)}
                className={`px-3 py-1.5 text-xs font-semibold ${eventRunLevel === 'class' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Class Level
              </button>
              <button
                onClick={() => updateEventRunLevel(detail.id, 'school', detail.notes)}
                className={`px-3 py-1.5 text-xs font-semibold ${eventRunLevel === 'school' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                School Level
              </button>
            </div>
          </div>
        </div>

        {/* Classroom Codes — for part-time instructors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-gray-900 mb-1">🔑 Classroom Instructor Codes</h4>
          <p className="text-xs text-gray-500 mb-4">
            Generate sub-codes for part-time instructors. They use these at <strong>/classroom-admin</strong> to monitor their class only.
          </p>
          {classroomCodes.length > 0 && (
            <div className="space-y-2 mb-4">
              {classroomCodes.map((cc: any) => (
                <div key={cc.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-mono font-bold text-blue-600 tracking-wider text-sm">{cc.sub_code}</span>
                  <span className="text-sm font-semibold text-gray-800">Class {cc.class_id}</span>
                  {cc.instructor_name && <span className="text-xs text-gray-500">({cc.instructor_name})</span>}
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${cc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {cc.is_active ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleClassroomCode(cc.id, !cc.is_active)}
                    className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100"
                  >
                    {cc.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteClassroomCode(cc.id)}
                    className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end flex-wrap">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Class ID</label>
              <input
                value={newClassId}
                onChange={e => setNewClassId(e.target.value.toUpperCase())}
                placeholder="e.g. 3A"
                maxLength={10}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Instructor Name (optional)</label>
              <input
                value={newInstructorName}
                onChange={e => setNewInstructorName(e.target.value)}
                placeholder="e.g. Mr Tan"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40"
              />
            </div>
            <button
              onClick={createClassroomCode}
              disabled={creatingCode || !newClassId.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {creatingCode ? 'Creating...' : '+ Generate Code'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Users size={20} className="mx-auto text-blue-500 mb-1" />
            <p className="text-3xl font-bold">{players.length}</p>
            <p className="text-xs text-gray-500">Players</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <GamepadIcon size={20} className="mx-auto text-purple-500 mb-1" />
            <p className="text-3xl font-bold">{sessions.length}</p>
            <p className="text-xs text-gray-500">Sessions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Trophy size={20} className="mx-auto text-green-500 mb-1" />
            <p className="text-3xl font-bold">{completed.length}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>

        {/* Participation Visibility */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-bold text-gray-900">👥 Participation Visibility</h4>
              <p className="text-xs text-gray-500">
                Track exactly who has joined, who is active now, and completion by class or whole-school cohort.
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setDashboardViewMode('class')}
                className={`px-3 py-1.5 text-xs font-semibold ${dashboardViewMode === 'class' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Class View
              </button>
              <button
                onClick={() => setDashboardViewMode('school')}
                className={`px-3 py-1.5 text-xs font-semibold ${dashboardViewMode === 'school' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                School View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { label: 'Registered', value: totalRegistered.toString() },
              { label: 'Started', value: totalStarted.toString() },
              { label: 'Playing Now', value: totalPlayingNow.toString() },
              { label: 'Completed', value: totalCompleted.toString() },
              { label: 'Not Started', value: notStarted.toString() },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {dashboardViewMode === 'school' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">School Participation</p>
                <p className="text-3xl font-bold text-blue-600">{schoolParticipationRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{totalStarted}/{Math.max(1, totalRegistered)} started the round</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">School Completion</p>
                <p className="text-3xl font-bold text-green-600">{schoolCompletionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{totalCompleted}/{Math.max(1, totalRegistered)} completed this round</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Class</th>
                    <th className="pb-2">Registered</th>
                    <th className="pb-2">Started</th>
                    <th className="pb-2">Playing Now</th>
                    <th className="pb-2">Completed</th>
                    <th className="pb-2">Start %</th>
                    <th className="pb-2">Done %</th>
                  </tr>
                </thead>
                <tbody>
                  {classProgress.map((row) => (
                    <tr key={row.classId} className="border-b border-gray-100">
                      <td className="py-2 font-semibold text-gray-800">{row.classId}</td>
                      <td className="py-2">{row.registered}</td>
                      <td className="py-2">{row.started}</td>
                      <td className="py-2">{row.playingNow}</td>
                      <td className="py-2">{row.completed}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{row.participationRate}%</span>
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">{row.completionRate}%</span>
                      </td>
                    </tr>
                  ))}
                  {classProgress.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-400">No class roster detected yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rounds */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-gray-900 mb-3">🔄 Rounds {detail.session_mode === 'classroom' ? <span className="text-xs font-normal text-amber-600 ml-2">📚 Classroom mode — each instructor controls their own class rounds</span> : ''}</h4>
          <div className="space-y-2">
            {rounds.map((r: any) => {
              // In classroom mode, show per-class status instead of global activate button
              const classStatuses = detail.session_mode === 'classroom'
                ? classRoundStatuses.filter((crs: any) => crs.round_id === r.id && crs.is_active)
                : [];
              return (
              <div key={r.id} className="py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.is_active ? 'bg-green-100 text-green-700' : detail.session_mode === 'classroom' && classStatuses.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.is_active ? '● LIVE (all)' : detail.session_mode === 'classroom' && classStatuses.length > 0 ? `● ${classStatuses.length} class${classStatuses.length > 1 ? 'es' : ''}` : '○'}
                  </span>
                  <span className="flex-1 font-semibold text-sm">Round {r.round_number}: {r.round_name}</span>
                  <span className="text-xs text-gray-400">{GOAL_LABELS[r.goal] || r.goal}</span>
                  {detail.session_mode !== 'classroom' && !r.is_active && (
                    <button
                      onClick={() => activateRound(r.id, detail.id)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ▶ Activate
                    </button>
                  )}
                </div>
                {detail.session_mode === 'classroom' && classStatuses.length > 0 && (
                  <div className="mt-1 ml-8 flex flex-wrap gap-1">
                    {classStatuses.map((cs: any) => (
                      <span key={cs.id} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                        Class {cs.class_id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
          </div>
          {/* Add round */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <input
              value={newRoundName}
              onChange={e => setNewRoundName(e.target.value)}
              placeholder="Round name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={newRoundGoal}
              onChange={e => setNewRoundGoal(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Object.entries(GOAL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button onClick={createRound} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              + Round
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900">🏆 Leaderboard {activeRound ? `— Round ${activeRound.round_number}` : ''}</h4>
              <div className="flex gap-2">
                <button onClick={() => setShowRoundReport(true)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 flex items-center gap-1">
                  📊 Round Report
                </button>
                <button onClick={() => loadDetail(detail)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {sessions.filter((s: any) => s.final_score > 0).slice(0, 15).map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setSelectedSession(s)}>
                  <span className="w-6 text-center text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <span className="flex-1 font-semibold text-sm">{s.players?.class_id}-{s.players?.index_number}</span>
                  {/* Show top title badge */}
                  {s.game_state && (() => {
                    const r = analyzePlayer(s.game_state);
                    return r && r.titles.length > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: r.titles[0].color + '15', color: r.titles[0].color }}>
                        {r.titles[0].icon} {r.titles[0].name}
                      </span>
                    ) : null;
                  })()}
                  {(() => { const st = playerStatus(s); return (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}>{st.label}</span>
                  ); })()}
                  <span className="font-bold font-mono text-blue-600">{s.final_score?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Full session table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Age</th>
                    <th className="pb-2">Cash</th>
                    <th className="pb-2">Net Worth</th>
                    <th className="pb-2">CPF</th>
                    <th className="pb-2">HI</th>
                    <th className="pb-2">Score</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s: any) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedSession(s)}>
                      <td className="py-2 font-semibold">{s.players?.class_id}-{s.players?.index_number}</td>
                      <td className="py-2">{s.age}</td>
                      <td className={`py-2 font-mono ${(s.cash || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(s.cash || 0)}</td>
                      <td className="py-2 font-mono text-blue-600">{fmt(s.net_worth || 0)}</td>
                      <td className="py-2 font-mono text-purple-600">{fmt(s.cpf || 0)}</td>
                      <td className="py-2">{s.happiness}</td>
                      <td className="py-2 font-bold text-blue-600">{s.final_score?.toLocaleString()}</td>
                      <td className="py-2">
                        {(() => { const st = playerStatus(s); return (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${st.bg} ${st.color}`}>{st.label}</span>
                        ); })()}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedSession(s); }}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 flex items-center gap-1"
                        >
                          <FileText size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
            <GamepadIcon size={40} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold">{activeRound ? 'No sessions yet — students playing this round will appear here.' : 'No active round. Activate a round above to start.'}</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Events List View ───
  return (
    <div className="space-y-4">
      {/* Create Event */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎟️ Create New Event</h3>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">School Name</label>
            <input
              value={newSchool}
              onChange={e => setNewSchool(e.target.value)}
              placeholder="e.g. Raffles Institution"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Duration (hrs)</label>
            <input
              type="number"
              value={newHours}
              onChange={e => setNewHours(parseInt(e.target.value) || 48)}
              min={1}
              max={168}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-44">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Run Level</label>
            <select
              value={newRunLevel}
              onChange={e => setNewRunLevel(e.target.value as RunLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">Class level</option>
              <option value="school">School level</option>
            </select>
          </div>
          <button
            onClick={createEvent}
            disabled={creating || !newSchool.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} />
            {creating ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>

      {/* Refresh */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">📋 Events</h3>
        <button onClick={loadEvents} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <RefreshCw size={14} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Events list */}
      {events.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
          <GamepadIcon size={40} className="mx-auto mb-2 opacity-50" />
          <p className="font-semibold">No events yet</p>
          <p className="text-sm mt-1">Create an event above to get an access code for students.</p>
        </div>
      )}

      {events.map((evt: any) => {
        const expired = new Date(evt.expires_at) < new Date();
        const active = evt.is_active && !expired;
        const runLevel = getRunLevelFromNotes(evt.notes);

        return (
          <div key={evt.id} className={`bg-white rounded-lg shadow p-5 border-l-4 ${active ? 'border-green-500' : expired ? 'border-red-300' : 'border-gray-300'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">🏫 {evt.school_name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Created: {new Date(evt.created_at).toLocaleString()}</p>
                <p className="text-xs mt-1 text-indigo-600 font-semibold">
                  {runLevel === 'school' ? 'School level cohort mode' : 'Class level cohort mode'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold tracking-widest text-blue-600">{evt.access_code}</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                  active ? 'bg-green-100 text-green-700' : expired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {active ? '● ACTIVE' : expired ? '✖ EXPIRED' : '○ INACTIVE'}
                </span>
              </div>
            </div>

            {!expired && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${
                new Date(evt.expires_at).getTime() - Date.now() < 7200000 ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Clock size={12} /> {timeLeft(evt.expires_at)}
              </p>
            )}

            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={() => loadDetail(evt)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1">
                📊 Dashboard
              </button>
              <button
                onClick={() => prolongAccessCode(evt.id, evt.expires_at, 24)}
                disabled={extendingEventId === evt.id}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs hover:bg-amber-100 disabled:opacity-50"
              >
                {extendingEventId === evt.id ? 'Updating...' : '+24h Code'}
              </button>
              {active && (
                <button onClick={() => toggleEvent(evt.id, false)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100">
                  🛑 Deactivate
                </button>
              )}
              {!active && !expired && (
                <button onClick={() => toggleEvent(evt.id, true)} className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs hover:bg-green-100">
                  ▶ Activate
                </button>
              )}
              <button onClick={() => exportEvent(evt.id)} className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-xs hover:bg-purple-100">
                📥 Export
              </button>
              <button onClick={() => deleteEvent(evt.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100">
                🗑️ Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnrichmentAdminPanel;
