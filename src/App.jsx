import React, { useState } from 'react';
import { useDojoSession } from './hooks/useDojoSession';
import DojoCoreCanvas from './components/DojoCoreCanvas';
import TrackLane from './components/TrackLane';
import QuencyChat from './components/QuencyChat';
import FamilyChat from './components/FamilyChat';
import HandoffKit from './components/HandoffKit';
import { Zap, Trophy } from 'lucide-react';

const INITIAL_TASKS = [
  { id: 'git_install', title: 'Forge the Tools', desc: 'Download Git', link: 'https://git-scm.com/downloads', xp: 100 },
  { id: 'node_install', title: 'Ignite the Engine', desc: 'Install Node.js', link: 'https://nodejs.org/', xp: 100 },
  { id: 'hermes_clone', title: 'The Summoning', desc: 'Run the install script', cmd: 'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash', xp: 250 },
  { id: 'api_key', title: 'The Neural Link', desc: 'Add your API key to .env', xp: 150 },
];

const TASK_TITLE = Object.fromEntries(INITIAL_TASKS.map((t) => [t.id, t.title]));
const TOTAL_XP = INITIAL_TASKS.reduce((s, t) => s + t.xp, 0);

const VIEWS = [
  { key: 'missions', label: 'Missions' },
  { key: 'quency', label: 'Quency AI' },
  { key: 'family', label: 'Dad ↔ Graysen' },
  { key: 'handoff', label: 'Handoff Kit' },
];

// XP earned by a player = sum of completed task XP. Hz (the Dojo Core power)
// scales with progress so the visual reacts as they level up.
const xpFor = (player) =>
  (player?.tasks || []).reduce((s, id) => s + (INITIAL_TASKS.find((t) => t.id === id)?.xp || 0), 0);
const hzFor = (xp) => 100 + Math.round((xp / TOTAL_XP) * 200); // 100 → 300
const levelFor = (xp) => Math.floor(xp / 200) + 1;

function App() {
  const { session, updateSession, loading } = useDojoSession();
  const [currentUser, setCurrentUser] = useState('derrick');
  const [view, setView] = useState('missions');

  const toggleTask = (player, taskId) => {
    const current = session[player].tasks || [];
    const adding = !current.includes(taskId);
    const newTasks = adding ? [...current, taskId] : current.filter((id) => id !== taskId);
    const xp = newTasks.reduce((s, id) => s + (INITIAL_TASKS.find((t) => t.id === id)?.xp || 0), 0);

    const name = player === 'graysen' ? 'Graysen' : 'Derrick';
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry = `${stamp} · ${name} ${adding ? 'cleared' : 'reopened'} "${TASK_TITLE[taskId]}"`;
    const logs = [entry, ...(session.logs || [])].slice(0, 12);

    updateSession({ [player]: { ...session[player], tasks: newTasks, xp, hz: hzFor(xp) }, logs });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Dojo...</div>;

  const active = session[currentUser] || { tasks: [] };
  const activeXp = xpFor(active);
  const combinedXp = xpFor(session.derrick) + xpFor(session.graysen);
  const combinedPct = Math.round((combinedXp / (TOTAL_XP * 2)) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/10 px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Zap className="text-emerald-400" />
          <div className="font-bold tracking-[-1.5px] text-xl sm:text-2xl">FREQUENCY DOJO</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentUser('derrick')} className={`px-4 py-2 rounded-2xl text-sm transition-colors ${currentUser === 'derrick' ? 'bg-emerald-600' : 'bg-zinc-900 hover:bg-zinc-800'}`}>Derrick</button>
          <button onClick={() => setCurrentUser('graysen')} className={`px-4 py-2 rounded-2xl text-sm transition-colors ${currentUser === 'graysen' ? 'bg-purple-600' : 'bg-zinc-900 hover:bg-zinc-800'}`}>Graysen</button>
        </div>
      </nav>

      <div className="border-b border-white/5 px-4 sm:px-8 flex gap-1 overflow-x-auto">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              view === v.key ? 'border-emerald-400 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {view === 'missions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TrackLane title="Derrick's Mission" tasks={INITIAL_TASKS} completed={session.derrick.tasks || []} onToggle={(id) => toggleTask('derrick', id)} />
                <TrackLane title="Graysen's Mission" tasks={INITIAL_TASKS} completed={session.graysen.tasks || []} onToggle={(id) => toggleTask('graysen', id)} />
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Trophy size={16} className="text-amber-400" /> Combined Dojo Power</div>
                  <div className="text-xs font-mono text-zinc-400">{combinedXp} / {TOTAL_XP * 2} XP</div>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all duration-500" style={{ width: `${combinedPct}%` }} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <DojoCoreCanvas hz={active.hz || hzFor(activeXp)} size={240} />
                <div className="mt-4 flex items-center justify-center gap-6 text-center">
                  <div>
                    <div className="text-2xl font-black text-emerald-400">{activeXp}</div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-purple-400">Lv {levelFor(activeXp)}</div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">{currentUser === 'graysen' ? 'Graysen' : 'Derrick'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="text-sm font-semibold mb-3">Activity</div>
                <div className="space-y-2 text-xs text-zinc-400 font-mono">
                  {(session.logs || []).length === 0 && <div className="text-zinc-600">No activity yet. Clear a task to begin.</div>}
                  {(session.logs || []).map((l, i) => (
                    <div key={i} className="truncate">{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'quency' && (
          <div className="max-w-2xl mx-auto">
            <QuencyChat />
          </div>
        )}

        {view === 'family' && (
          <div className="max-w-2xl mx-auto">
            <FamilyChat currentUser={currentUser} />
          </div>
        )}

        {view === 'handoff' && <HandoffKit />}
      </main>
    </div>
  );
}

export default App;
