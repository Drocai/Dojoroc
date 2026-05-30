import React, { useState } from 'react';
import { useDojoSession } from './hooks/useDojoSession';
import DojoCoreCanvas from './components/DojoCoreCanvas';
import TrackLane from './components/TrackLane';
import QuencyChat from './components/QuencyChat';
import FamilyChat from './components/FamilyChat';
import HandoffKit from './components/HandoffKit';
import { Zap } from 'lucide-react';

const INITIAL_TASKS = [
  { id: 'git_install', title: 'Forge the Tools', desc: 'Download Git', link: 'https://git-scm.com/downloads', xp: 100 },
  { id: 'node_install', title: 'Ignite the Engine', desc: 'Install Node.js', link: 'https://nodejs.org/', xp: 100 },
  { id: 'hermes_clone', title: 'The Summoning', desc: 'Run the install script', cmd: 'curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash', xp: 250 },
  { id: 'api_key', title: 'The Neural Link', desc: 'Add your API key to .env', xp: 150 },
];

const VIEWS = [
  { key: 'missions', label: 'Missions' },
  { key: 'quency', label: 'Quency AI' },
  { key: 'family', label: 'Dad ↔ Graysen' },
  { key: 'handoff', label: 'Handoff Kit' },
];

function App() {
  const { session, updateSession, loading } = useDojoSession();
  const [currentUser, setCurrentUser] = useState('derrick');
  const [view, setView] = useState('missions');

  const toggleTask = (player, taskId) => {
    const current = session[player].tasks || [];
    const newTasks = current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId];
    updateSession({ [player]: { ...session[player], tasks: newTasks, xp: newTasks.length * 100 } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Dojo...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/10 px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Zap className="text-emerald-400" />
          <div className="font-bold tracking-[-1.5px] text-xl sm:text-2xl">FREQUENCY DOJO</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentUser('derrick')} className={`px-4 py-2 rounded-2xl text-sm ${currentUser === 'derrick' ? 'bg-emerald-600' : 'bg-zinc-900'}`}>Derrick</button>
          <button onClick={() => setCurrentUser('graysen')} className={`px-4 py-2 rounded-2xl text-sm ${currentUser === 'graysen' ? 'bg-purple-600' : 'bg-zinc-900'}`}>Graysen</button>
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
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TrackLane title="Derrick's Mission" tasks={INITIAL_TASKS} completed={session.derrick.tasks || []} onToggle={(id) => toggleTask('derrick', id)} />
                <TrackLane title="Graysen's Mission" tasks={INITIAL_TASKS} completed={session.graysen.tasks || []} onToggle={(id) => toggleTask('graysen', id)} />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <DojoCoreCanvas hz={session[currentUser].hz || 100} size={240} />
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
