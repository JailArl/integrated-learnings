import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Plus, RefreshCw, Download, Trash2, Play, Square, ChevronLeft, Users, Trophy, GamepadIcon, Clock } from 'lucide-react';

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
  const timeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m left`;
  };

  // ─── Event Detail View ───
  if (detail) {
    const expired = new Date(detail.expires_at) < new Date();
    const active = detail.is_active && !expired;
    const activeRound = rounds.find((r: any) => r.is_active);
    const completed = sessions.filter((s: any) => s.is_complete);

    return (
      <div className="space-y-4">
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
                <div key={s.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="w-6 text-center text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <span className="flex-1 font-semibold text-sm">{s.players?.class_id}-{s.players?.index_number}</span>
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
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s: any) => (
                    <tr key={s.id} className="border-b border-gray-50">
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
