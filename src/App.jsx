import React, { useState } from 'react';
import { useDojoSession } from './hooks/useDojoSession';
import DojoCoreCanvas from './components/DojoCoreCanvas';
import TrackLane from './components/TrackLane';
import QuencyChat from './components/QuencyChat';
import FamilyChat from './components/FamilyChat';
import HandoffKit from './components/HandoffKit';
import DockedChat from './components/DockedChat';
import ArcadeOverlay from './components/arcade/ArcadeOverlay';
import { activePack } from '../packs/index.js';
import { themeFor } from './lib/theme';
import { Zap, Trophy, Flame, Rocket, Gamepad2, Music, BookOpen, Brain, Sparkles } from 'lucide-react';

// Brand icons a pack can choose from by name (keeps lucide tree-shakeable —
// importing the whole library balloons the bundle). Add more here as needed.
const BRAND_ICONS = { Zap, Flame, Rocket, Gamepad2, Music, BookOpen, Brain, Sparkles };

const { brand, players, sensei, missions } = activePack;
const mentor = players[0];
const student = players[1] || players[0];
const BrandIcon = BRAND_ICONS[brand.icon] || Zap;
const accent = themeFor(brand.accent);
const mentorTheme = themeFor(mentor.color);
const studentTheme = themeFor(student.color);

const TASK_TITLE = Object.fromEntries(missions.map((t) => [t.id, t.title]));
const PLAYER_LABEL = Object.fromEntries(players.map((p) => [p.key, p.label]));
const TOTAL_XP = missions.reduce((s, t) => s + t.xp, 0);

const VIEWS = [
  { key: 'missions', label: 'Missions' },
  { key: 'quency', label: `${sensei.name} AI` },
  { key: 'family', label: `${mentor.chatName} ↔ ${student.chatName}` },
  { key: 'handoff', label: 'Handoff Kit' },
];

// XP earned by a player = sum of completed task XP. Hz (the Dojo Core power)
// scales with progress so the visual reacts as they level up.
const xpFor = (player) =>
  (player?.tasks || []).reduce((s, id) => s + (missions.find((t) => t.id === id)?.xp || 0), 0);
const hzFor = (xp) => 100 + Math.round((xp / TOTAL_XP) * 200); // 100 → 300
const levelFor = (xp) => Math.floor(xp / 200) + 1;

function App() {
  const { session, updateSession, loading } = useDojoSession();
  const [currentUser, setCurrentUser] = useState(mentor.key);
  const [view, setView] = useState('missions');

  const toggleTask = (playerKey, taskId) => {
    const current = session[playerKey].tasks || [];
    const adding = !current.includes(taskId);
    const newTasks = adding ? [...current, taskId] : current.filter((id) => id !== taskId);
    const xp = newTasks.reduce((s, id) => s + (missions.find((t) => t.id === id)?.xp || 0), 0);

    const name = PLAYER_LABEL[playerKey] || playerKey;
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry = `${stamp} · ${name} ${adding ? 'cleared' : 'reopened'} "${TASK_TITLE[taskId]}"`;
    const logs = [entry, ...(session.logs || [])].slice(0, 12);

    updateSession({ [playerKey]: { ...session[playerKey], tasks: newTasks, xp, hz: hzFor(xp) }, logs });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Dojo...</div>;

  const active = session[currentUser] || { tasks: [] };
  const activeXp = xpFor(active);
  const activePlayer = players.find((p) => p.key === currentUser) || mentor;
  const combinedXp = players.reduce((s, p) => s + xpFor(session[p.key]), 0);
  const combinedPct = Math.round((combinedXp / (TOTAL_XP * players.length)) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/10 px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandIcon className={accent.text} />
          <div className="font-bold tracking-[-1.5px] text-xl sm:text-2xl">{brand.title}</div>
        </div>
        <div className="flex gap-2">
          {players.map((p) => (
            <button
              key={p.key}
              onClick={() => setCurrentUser(p.key)}
              className={`px-4 py-2 rounded-2xl text-sm transition-colors ${
                currentUser === p.key ? `${themeFor(p.color).solid} text-white` : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="border-b border-white/5 px-4 sm:px-8 flex gap-1 overflow-x-auto">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              view === v.key ? `${accent.border} text-white` : 'border-transparent text-zinc-500 hover:text-zinc-300'
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
                {players.map((p) => (
                  <TrackLane
                    key={p.key}
                    title={`${p.label}'s Mission`}
                    tasks={missions}
                    completed={session[p.key]?.tasks || []}
                    onToggle={(id) => toggleTask(p.key, id)}
                  />
                ))}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Trophy size={16} className="text-amber-400" /> Combined Dojo Power</div>
                  <div className="text-xs font-mono text-zinc-400">{combinedXp} / {TOTAL_XP * players.length} XP</div>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${mentorTheme.gradFrom} ${studentTheme.gradTo} transition-all duration-500`} style={{ width: `${combinedPct}%` }} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <DojoCoreCanvas hz={active.hz || hzFor(activeXp)} size={240} label={brand.coreLabel} unit={brand.coreUnit} />
                <div className="mt-4 flex items-center justify-center gap-6 text-center">
                  <div>
                    <div className={`text-2xl font-black ${accent.text}`}>{activeXp}</div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">XP</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${themeFor(activePlayer.color).text}`}>Lv {levelFor(activeXp)}</div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">{activePlayer.label}</div>
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

      <DockedChat currentUser={currentUser} />
      <ArcadeOverlay currentUser={currentUser} />
    </div>
  );
}

export default App;
