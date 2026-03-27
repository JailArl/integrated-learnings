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
  const [selectedSession, setSelectedSession] = useState<any>(null);

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
    });
    if (data && !error) {
      setNewSchool('');
      loadEvents();
    } else {
      alert('Error creating event: ' + (error?.message || 'Unknown'));
    }
    setCreating(false);
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
    const { data: rds } = await supabase.from('game_rounds').select('*').eq('event_id', evt.id).order('round_number');
    setRounds(rds || []);
    const { data: pls } = await supabase.from('players').select('*').eq('event_id', evt.id);
    setPlayers(pls || []);
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
    if ((gs.emergencyFund || 0) > 20000) titles.push({ id: 'emergency_ready', name: 'Emergency Ready', icon: '🛟', color: '#0d9488', desc: 'Strong emergency fund cushion' });
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
    if ((gs.emergencyFund || 0) < 3000 && (gs.yearsWorked || 0) > 3) tips.push('🛟 Emergency fund too small. Aim for 3-6 months of expenses before investing.');
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

  // ─── Event Detail View ───
  if (detail) {
    const expired = new Date(detail.expires_at) < new Date();
    const active = detail.is_active && !expired;
    const activeRound = rounds.find((r: any) => r.is_active);
    const completed = sessions.filter((s: any) => s.is_complete);

    return (
      <div className="space-y-4">
        {/* Report Card Modal */}
        {renderReportCard()}

        {/* Back button */}
        <button onClick={() => setDetail(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} /> Back to Events
        </button>

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
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Share this code with students: <strong>integratedlearnings.com.sg/games/life-choices.html</strong>
          </p>
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

        {/* Rounds */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-gray-900 mb-3">🔄 Rounds</h4>
          <div className="space-y-2">
            {rounds.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {r.is_active ? '● LIVE' : '○'}
                </span>
                <span className="flex-1 font-semibold text-sm">Round {r.round_number}: {r.round_name}</span>
                <span className="text-xs text-gray-400">{GOAL_LABELS[r.goal] || r.goal}</span>
                {!r.is_active && (
                  <button
                    onClick={() => activateRound(r.id, detail.id)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    ▶ Activate
                  </button>
                )}
              </div>
            ))}
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
              <button onClick={() => loadDetail(detail)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <RefreshCw size={14} /> Refresh
              </button>
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
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.is_complete ? 'Done' : 'Playing'}
                  </span>
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${s.is_complete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {s.is_complete ? 'Done' : 'Playing'}
                        </span>
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

        return (
          <div key={evt.id} className={`bg-white rounded-lg shadow p-5 border-l-4 ${active ? 'border-green-500' : expired ? 'border-red-300' : 'border-gray-300'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">🏫 {evt.school_name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">Created: {new Date(evt.created_at).toLocaleString()}</p>
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
