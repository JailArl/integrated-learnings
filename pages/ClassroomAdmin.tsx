import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { RefreshCw, Users, Trophy, GamepadIcon, Play, Square, LogOut, FileText, X } from 'lucide-react';

const GOAL_LABELS: Record<string, string> = {
  ff_earliest: '🏁 First to FF',
  highest_nw: '💰 Net Worth',
  highest_hi: '😊 Happiness',
  highest_cpf: '🏛️ CPF',
  balanced_life: '⚖️ Balanced Life',
  combined: '🥇 Combined',
};

interface ClassroomAuth {
  eventId: string;
  classId: string;
  schoolName: string;
  instructorName: string | null;
  sessionMode: string;
  expiresAt: string;
}

const ClassroomAdmin: React.FC = () => {
  const [subCode, setSubCode] = useState('');
  const [auth, setAuth] = useState<ClassroomAuth | null>(null);
  const [error, setError] = useState('');
  const [logging, setLogging] = useState(false);

  // Dashboard state
  const [rounds, setRounds] = useState<any[]>([]);
  const [classRoundStatus, setClassRoundStatus] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem('classroom_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt) > new Date()) {
          setAuth(parsed);
        } else {
          sessionStorage.removeItem('classroom_auth');
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Auto refresh every 15s
  useEffect(() => {
    if (!auth || !autoRefresh) return;
    const interval = setInterval(() => loadDashboard(), 15000);
    return () => clearInterval(interval);
  }, [auth, autoRefresh]);

  // Load dashboard on auth
  useEffect(() => {
    if (auth) loadDashboard();
  }, [auth]);

  const login = async () => {
    if (!supabase || !subCode.trim()) return;
    setLogging(true);
    setError('');
    try {
      const { data, error: err } = await supabase.rpc('validate_classroom_code', {
        p_sub_code: subCode.trim().toUpperCase(),
      });
      if (err) throw new Error(err.message);
      if (!data || data.length === 0) {
        setError('Invalid code. Check with your chief instructor.');
        setLogging(false);
        return;
      }
      const row = data[0];
      if (!row.is_valid) {
        setError('This event has expired or been deactivated.');
        setLogging(false);
        return;
      }
      const authData: ClassroomAuth = {
        eventId: row.event_id,
        classId: row.class_id,
        schoolName: row.school_name,
        instructorName: row.instructor_name,
        sessionMode: row.session_mode,
        expiresAt: row.expires_at,
      };
      setAuth(authData);
      sessionStorage.setItem('classroom_auth', JSON.stringify(authData));
    } catch (e: any) {
      setError(e.message || 'Login failed');
    }
    setLogging(false);
  };

  const logout = () => {
    setAuth(null);
    setSubCode('');
    sessionStorage.removeItem('classroom_auth');
    setRounds([]);
    setSessions([]);
    setPlayers([]);
    setClassRoundStatus([]);
  };

  const loadDashboard = useCallback(async () => {
    if (!supabase || !auth) return;
    setLoading(true);

    // Load rounds for this event
    const { data: rds } = await supabase.from('game_rounds').select('*').eq('event_id', auth.eventId).order('round_number');
    setRounds(rds || []);

    // Load class round status
    const { data: crs } = await supabase.from('class_round_status').select('*').eq('event_id', auth.eventId).eq('class_id', auth.classId);
    setClassRoundStatus(crs || []);

    // Load players for this class only
    const { data: pls } = await supabase.from('players').select('*').eq('event_id', auth.eventId).eq('class_id', auth.classId);
    setPlayers(pls || []);

    // Determine active round for this class
    const classActiveRound = (crs || []).find((cr: any) => cr.is_active);
    const globalActiveRound = (rds || []).find((r: any) => r.is_active);
    const activeRoundId = auth.sessionMode === 'classroom'
      ? classActiveRound?.round_id
      : globalActiveRound?.id;

    if (activeRoundId) {
      // Load sessions for active round, filtered to this class's players
      const playerIds = (pls || []).map((p: any) => p.id);
      if (playerIds.length > 0) {
        const { data: sess } = await supabase
          .from('game_sessions')
          .select('*, players(class_id, index_number)')
          .eq('round_id', activeRoundId)
          .in('player_id', playerIds)
          .order('final_score', { ascending: false });
        setSessions(sess || []);
      } else {
        setSessions([]);
      }
    } else {
      setSessions([]);
    }

    setLoading(false);
  }, [auth]);

  const activateClassRound = async (roundId: string) => {
    if (!supabase || !auth) return;
    try {
      await supabase.rpc('activate_class_round', {
        p_event_id: auth.eventId,
        p_class_id: auth.classId,
        p_round_id: roundId,
      });
      await loadDashboard();
    } catch (e: any) {
      alert('Error activating round: ' + e.message);
    }
  };

  const endClassRound = async () => {
    if (!supabase || !auth) return;
    try {
      await supabase.rpc('end_class_round', {
        p_event_id: auth.eventId,
        p_class_id: auth.classId,
      });
      await loadDashboard();
    } catch (e: any) {
      alert('Error ending round: ' + e.message);
    }
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

  const playerStatus = (s: any) => {
    if (s.is_complete) return { label: '✅ Done', bg: 'bg-green-100', color: 'text-green-700' };
    const updated = new Date(s.updated_at).getTime();
    if (Date.now() - updated < 120000) return { label: '🎮 Playing', bg: 'bg-blue-100', color: 'text-blue-700' };
    return { label: '💤 Idle', bg: 'bg-gray-100', color: 'text-gray-500' };
  };

  // ── Analyze player for report card ──
  const analyzePlayer = (gs: any) => {
    if (!gs) return null;
    const inv = gs.inv || {};
    const log = gs.log || [];
    const invTotal = Object.values(inv).reduce((s: number, v: any) => s + (v || 0), 0) as number;
    const safeTotal = (inv.bank || 0) + (inv.fd || 0) + (inv.ssb || 0);
    const riskyTotal = (inv.stock || 0) + (inv.etf || 0) + (inv.reit || 0) + (inv.bank_stock || 0);
    const totalDebt = (gs.studyLoan || 0) + (gs.propLoan || 0) + (gs.carLoan || 0) + (gs.emergencyDebt || 0) + (gs.ccDebt || 0) + (gs.weddingLoan || 0);

    const titles: any[] = [];
    if (invTotal > 0 && safeTotal / Math.max(1, invTotal) > 0.7) titles.push({ icon: '🛡️', name: 'Safe Investor', color: '#0891b2' });
    if (invTotal > 0 && riskyTotal / Math.max(1, invTotal) > 0.6) titles.push({ icon: '🎲', name: 'Risk Taker', color: '#dc2626' });
    if (gs.ffAge && gs.ffAge <= 45) titles.push({ icon: '🏆', name: 'Early Retirement', color: '#d97706' });
    if (totalDebt === 0 && (gs.yearsWorked || 0) > 5) titles.push({ icon: '⚔️', name: 'Debt Free', color: '#16a34a' });
    if (invTotal > 200000) titles.push({ icon: '📈', name: 'Portfolio Builder', color: '#059669' });
    if (!gs.insurance) titles.push({ icon: '⚠️', name: 'Uninsured', color: '#f97316' });

    const moments: any[] = [];
    log.forEach((entry: any) => {
      const m = entry.msg || '';
      if (m.includes('Emergency debt') || m.includes('Graduated') || m.includes('Promoted') || m.includes('BTO') || m.includes('ORD'))
        moments.push({ age: entry.age, text: m });
    });

    return { titles, moments: moments.slice(0, 10), invTotal, safeTotal, riskyTotal, totalDebt };
  };

  // ── LOGIN SCREEN ──
  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              🎓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Classroom Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your classroom code to view your class dashboard</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Classroom Code</label>
              <input
                value={subCode}
                onChange={e => setSubCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="e.g. ABC123-3A"
                maxLength={12}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-xl font-mono font-bold tracking-widest uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              onClick={login}
              disabled={logging || !subCode.trim()}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {logging ? 'Verifying...' : 'Enter Dashboard →'}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Get your classroom code from the chief instructor.
          </p>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──
  const classActiveRound = classRoundStatus.find((cr: any) => cr.is_active);
  const globalActiveRound = rounds.find((r: any) => r.is_active);
  const isClassroomMode = auth.sessionMode === 'classroom';
  const activeRound = isClassroomMode
    ? rounds.find((r: any) => r.id === classActiveRound?.round_id)
    : globalActiveRound;

  const completed = sessions.filter((s: any) => s.is_complete);
  const playing = sessions.filter((s: any) => !s.is_complete && Date.now() - new Date(s.updated_at).getTime() < 120000);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-bold text-sm text-gray-900">{auth.schoolName} — Class {auth.classId}</p>
              <p className="text-xs text-gray-500">
                {auth.instructorName ? `${auth.instructorName} · ` : ''}
                {isClassroomMode ? '🏫 Classroom Mode' : '👥 Cohort Mode'}
                {' · ⏱️ ' + timeLeft(auth.expiresAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 text-xs rounded-lg border ${autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸ Auto-refresh OFF'}
            </button>
            <button onClick={() => loadDashboard()} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw size={16} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={logout} className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-1">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Users size={20} className="mx-auto text-blue-500 mb-1" />
            <p className="text-3xl font-bold">{players.length}</p>
            <p className="text-xs text-gray-500">Registered</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <GamepadIcon size={20} className="mx-auto text-purple-500 mb-1" />
            <p className="text-3xl font-bold">{sessions.length}</p>
            <p className="text-xs text-gray-500">Started</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Play size={16} className="mx-auto text-yellow-500 mb-1" />
            <p className="text-3xl font-bold">{playing.length}</p>
            <p className="text-xs text-gray-500">Playing Now</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <Trophy size={20} className="mx-auto text-green-500 mb-1" />
            <p className="text-3xl font-bold">{completed.length}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>

        {/* Round Control */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-gray-900 mb-3">
            🔄 Rounds {isClassroomMode ? '(You control for your class)' : '(Chief controls for all)'}
          </h4>
          <div className="space-y-2">
            {rounds.map((r: any) => {
              const isActive = isClassroomMode
                ? classRoundStatus.some((cr: any) => cr.round_id === r.id && cr.is_active)
                : r.is_active;
              return (
                <div key={r.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isActive ? '● LIVE' : '○'}
                  </span>
                  <span className="flex-1 font-semibold text-sm">Round {r.round_number}: {r.round_name}</span>
                  <span className="text-xs text-gray-400">{GOAL_LABELS[r.goal] || r.goal}</span>
                  {isClassroomMode && !isActive && (
                    <button
                      onClick={() => activateClassRound(r.id)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ▶ Start for Class
                    </button>
                  )}
                  {isClassroomMode && isActive && (
                    <button
                      onClick={endClassRound}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                    >
                      <Square size={12} /> End Round
                    </button>
                  )}
                </div>
              );
            })}
            {rounds.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No rounds created yet. Ask the chief instructor to set up rounds.</p>
            )}
          </div>
          {!isClassroomMode && (
            <p className="text-xs text-gray-400 mt-3 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
              ⚠️ This event is in <strong>Cohort Mode</strong> — rounds are controlled by the chief instructor for all classes simultaneously. You can monitor but not start/end rounds.
            </p>
          )}
        </div>

        {/* Leaderboard */}
        {activeRound && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-900">
                🏆 Class {auth.classId} Leaderboard — Round {activeRound.round_number}
              </h4>
              <span className="text-xs text-gray-400">{GOAL_LABELS[activeRound.goal] || activeRound.goal}</span>
            </div>

            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No students playing this round yet.</p>
            ) : (
              <>
                {/* Top 3 podium */}
                <div className="flex justify-center gap-4 mb-4">
                  {sessions.filter((s: any) => s.final_score > 0).slice(0, 3).map((s: any, i: number) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const sizes = ['text-4xl', 'text-3xl', 'text-3xl'];
                    return (
                      <div key={s.id} className="text-center cursor-pointer" onClick={() => setSelectedSession(s)}>
                        <div className={sizes[i]}>{medals[i]}</div>
                        <p className="font-bold text-sm">{s.players?.class_id}-{s.players?.index_number}</p>
                        <p className="text-xs font-mono text-blue-600">{s.final_score?.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Full table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2">#</th>
                        <th className="pb-2">Student</th>
                        <th className="pb-2">Age</th>
                        <th className="pb-2">Cash</th>
                        <th className="pb-2">Net Worth</th>
                        <th className="pb-2">CPF</th>
                        <th className="pb-2">HI</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s: any, i: number) => {
                        const st = playerStatus(s);
                        return (
                          <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedSession(s)}>
                            <td className="py-2 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                            <td className="py-2 font-semibold">{s.players?.class_id}-{s.players?.index_number}</td>
                            <td className="py-2">{s.age}</td>
                            <td className={`py-2 font-mono ${(s.cash || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(s.cash || 0)}</td>
                            <td className="py-2 font-mono text-blue-600">{fmt(s.net_worth || 0)}</td>
                            <td className="py-2 font-mono text-purple-600">{fmt(s.cpf || 0)}</td>
                            <td className="py-2">{s.happiness}</td>
                            <td className="py-2 font-bold text-blue-600">{s.final_score?.toLocaleString()}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${st.bg} ${st.color}`}>{st.label}</span>
                            </td>
                            <td className="py-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedSession(s); }}
                                className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 flex items-center gap-1"
                              >
                                <FileText size={12} /> Report
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {!activeRound && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
            <GamepadIcon size={40} className="mx-auto mb-2 opacity-50" />
            <p className="font-semibold">
              {isClassroomMode
                ? 'No active round for your class. Start a round above!'
                : 'No active round. Waiting for chief instructor to start a round.'}
            </p>
          </div>
        )}

        {/* Player roster */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-gray-900 mb-3">📋 Class {auth.classId} Roster ({players.length} students)</h4>
          {players.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {players.map((p: any) => {
                const hasSession = sessions.some((s: any) => s.player_id === p.id);
                const isComplete = sessions.some((s: any) => s.player_id === p.id && s.is_complete);
                return (
                  <div
                    key={p.id}
                    className={`text-center px-2 py-2 rounded-lg border text-xs font-semibold ${
                      isComplete ? 'bg-green-50 border-green-200 text-green-700' :
                      hasSession ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {p.index_number}
                    <div className="text-[10px] mt-0.5">
                      {isComplete ? '✅' : hasSession ? '🎮' : '⏳'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center">No students registered yet. They will appear once they enter the access code and join.</p>
          )}
        </div>
      </div>

      {/* Report Card Modal */}
      {selectedSession && (() => {
        const gs = selectedSession.game_state;
        const report = analyzePlayer(gs);
        const student = `${selectedSession.players?.class_id}-${selectedSession.players?.index_number}`;
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">📋 {student}</h3>
                  <p className="text-xs text-gray-400">
                    Age {gs?.age || '?'} | Score: {selectedSession.final_score?.toLocaleString()} | {selectedSession.is_complete ? '✅ Done' : '🎮 Playing'}
                  </p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Net Worth', value: fmtFull(selectedSession.net_worth || 0), color: 'text-blue-600' },
                    { label: 'Cash', value: fmtFull(selectedSession.cash || 0), color: (selectedSession.cash || 0) >= 0 ? 'text-green-600' : 'text-red-600' },
                    { label: 'CPF', value: fmtFull(selectedSession.cpf || 0), color: 'text-purple-600' },
                    { label: 'Happiness', value: String(selectedSession.happiness || 0), color: 'text-yellow-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Titles */}
                {report && report.titles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">🏅 Titles</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.titles.map((t: any, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: t.color + '15', color: t.color }}>
                          {t.icon} {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Key moments */}
                {report && report.moments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">⚡ Key Moments</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {report.moments.map((m: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs px-3 py-1.5 bg-gray-50 rounded">
                          <span className="font-bold whitespace-nowrap">Age {m.age}</span>
                          <span className="text-gray-600">{m.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!report && (
                  <p className="text-sm text-gray-400 text-center py-4">No detailed data yet — student may still be playing.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ClassroomAdmin;
