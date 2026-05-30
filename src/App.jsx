import React, { useState } from 'react';
import { useDojoSession } from './hooks/useDojoSession';
import DojoCoreCanvas from './components/DojoCoreCanvas';
import TrackLane from './components/TrackLane';
import QuencyChat from './components/QuencyChat';
import FamilyChat from './components/FamilyChat';
import HandoffKit from './components/HandoffKit';
import DockedChat from './components/DockedChat';
import ArcadeOverlay from './components/arcade/ArcadeOverlay';
import Hub from './components/hub/Hub';
import Onboarding from './components/Onboarding';
import { activePack } from '../packs/index.js';
import { themeFor } from './lib/theme';
import { Zap, Trophy, Flame, Rocket, Gamepad2, Music, BookOpen, Brain, Sparkles, LayoutGrid } from 'lucide-react';

// Brand icons a pack can choose from by name (keeps lucide tree-shakeable —
// importing the whole library balloons the bundle). Add more here as needed.
const BRAND_ICONS = { Zap, Flame, Rocket, Gamepad2, Music, BookOpen, Brain, Sparkles };

const { brand, players, sensei, missions, lore } = activePack;
const mentor = players[0];
const student = players[1] || players[0];
const BrandIcon = BRAND_ICONS[brand.icon] || Zap;
const accent = themeFor(brand.accent);
const mentorTheme = themeFor(mentor.color);
const studentTheme = themeFor(student.color);

const TASK_TITLE = Object.fromEntries(missions.map((t) => [t.id, t.title]));
const PLAYER_LABEL = Object.fromEntries(players.map((p) => [p.key, p.label]));
const TOTAL_XP = missions.reduce((s, t) => s + t.xp, 0);

// How arcade scores convert to dojo XP (each game scores on a different scale).
const GAME_XP_DIV = { clicker: 15, shooter: 3, tetris: 25 };

const VIEWS = [
  { key: 'missions', label: 'Missions' },
  { key: 'quency', label: `${sensei.name} AI` },
  { key: 'family', label: `${mentor.chatName} ↔ ${student.chatName}` },
  { key: 'handoff', label: 'Handoff Kit' },
];

// XP from cleared missions, plus arcade-earned bonus XP. Hz (the Dojo Core
// power) and level scale with the TOTAL so playing in the arcade visibly
// raises your frequency too.
const missionXpFor = (player) =>
  (player?.tasks || []).reduce((s, id) => s + (missions.find((t) => t.id === id)?.xp || 0), 0);
const totalXpFor = (player) => missionXpFor(player) + (player?.bonusXp || 0);
const hzFor = (xp) => 100 + Math.round((xp / TOTAL_XP) * 200); // 100 → 300 at full missions
const levelFor = (xp) => Math.floor(xp / 200) + 1;

const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const pushLog = (logs, entry) => [entry, ...(logs || [])].slice(0, 12);

function App() {
  const { session, updateSession, loading } = useDojoSession();
  const [currentUser, setCurrentUser] = useState(mentor.key);
  const [view, setView] = useState('missions');
  const [showHub, setShowHub] = useState(false);
  const [onboarded, setOnboarded] = useState(
    () => typeof localStorage === 'undefined' || localStorage.getItem('dojo.onboarded') === '1'
  );

  const toggleTask = (playerKey, taskId) => {
    const player = session[playerKey];
    const current = player.tasks || [];
    const adding = !current.includes(taskId);
    const newTasks = adding ? [...current, taskId] : current.filter((id) => id !== taskId);

    const oldTotal = totalXpFor(player);
    const updated = { ...player, tasks: newTasks, xp: missionXpFor({ tasks: newTasks }) };
    const newTotal = totalXpFor(updated);
    updated.hz = hzFor(newTotal);

    const name = PLAYER_LABEL[playerKey] || playerKey;
    let logs = pushLog(session.logs, `${stamp()} · ${name} ${adding ? 'cleared' : 'reopened'} "${TASK_TITLE[taskId]}"`);
    if (levelFor(newTotal) > levelFor(oldTotal)) logs = pushLog(logs, `${stamp()} · ${lore.levelUp(levelFor(newTotal), name)}`);

    updateSession({ [playerKey]: updated, logs });
  };

  // Arcade result → shared high score + dojo XP for the current player.
  const awardArcade = (game, score) => {
    if (!score || score <= 0) return;
    const player = session[currentUser] || {};
    const name = PLAYER_LABEL[currentUser] || currentUser;

    const scores = { ...(session.scores || {}) };
    const mine = { ...(scores[currentUser] || {}) };
    mine[game] = Math.max(mine[game] || 0, Math.round(score));
    scores[currentUser] = mine;

    const xpGain = Math.min(60, Math.max(1, Math.round(score / (GAME_XP_DIV[game] || 15))));
    const oldTotal = totalXpFor(player);
    const updated = { ...player, bonusXp: (player.bonusXp || 0) + xpGain };
    const newTotal = totalXpFor(updated);
    updated.hz = hzFor(newTotal);

    let logs = pushLog(session.logs, `${stamp()} · ${lore.arcadeXp(xpGain, name)}`);
    if (levelFor(newTotal) > levelFor(oldTotal)) logs = pushLog(logs, `${stamp()} · ${lore.levelUp(levelFor(newTotal), name)}`);

    updateSession({ [currentUser]: updated, scores, logs });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Dojo...</div>;

  const active = session[currentUser] || { tasks: [] };
  const activeXp = totalXpFor(active);
  const activePlayer = players.find((p) => p.key === currentUser) || mentor;
  const combinedXp = players.reduce((s, p) => s + totalXpFor(session[p.key]), 0);
  const combinedPct = Math.min(100, Math.round((combinedXp / (TOTAL_XP * players.length)) * 100));
  // The mission the current player is working on (first not-yet-cleared one).
  const focusMission = missions.find((m) => !(active.tasks || []).includes(m.id)) || null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      <div className="dojo-fx" aria-hidden="true" />

      <nav className="border-b border-white/10 px-4 sm:px-8 h-16 flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3 min-w-0">
          <BrandIcon className={accent.text} />
          <div className="min-w-0">
            <div className="font-display font-bold tracking-[1px] text-lg sm:text-2xl dojo-glow truncate">{brand.title}</div>
            <div className="hidden sm:block text-[10px] text-zinc-500 font-mono tracking-wide -mt-1 truncate">{lore.tagline}</div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowHub((v) => !v)}
            className={`px-3 py-2 rounded-2xl text-sm flex items-center gap-1.5 transition-colors ${
              showHub ? `${accent.solid} text-white` : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <LayoutGrid size={15} /> <span className="hidden sm:inline">Rooms</span>
          </button>
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

      {!showHub && (<>
      <div className="border-b border-white/5 px-4 sm:px-8 flex gap-1 overflow-x-auto relative">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative">
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

              <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
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
              <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
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

              <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="text-sm font-semibold mb-3">Activity</div>
                <div className="space-y-2 text-xs text-zinc-400 font-mono">
                  {(session.logs || []).length === 0 && <div className="text-zinc-600">{lore.emptyActivity}</div>}
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
      </>)}

      {showHub && <Hub onClose={() => setShowHub(false)} />}

      <DockedChat currentUser={currentUser} />
      <ArcadeOverlay
        currentUser={currentUser}
        players={players}
        scores={session.scores || {}}
        focusMission={focusMission}
        onResult={awardArcade}
      />

      {!onboarded && <Onboarding onDone={() => setOnboarded(true)} />}
    </div>
  );
}

export default App;
