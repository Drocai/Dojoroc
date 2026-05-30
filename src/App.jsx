import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import DojoCoreCanvas from './components/DojoCoreCanvas';
import TrackLane from './components/TrackLane';
import QuencyChat from './components/QuencyChat';
import FamilyChat from './components/FamilyChat';
import HandoffKit from './components/HandoffKit';
import DockedChat from './components/DockedChat';
import ArcadeOverlay from './components/arcade/ArcadeOverlay';
import Hub from './components/hub/Hub';
import Onboarding from './components/Onboarding';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import { activePack } from '../packs/index.js';
import { themeFor } from './lib/theme';
import { rankFor } from './lib/rank';
import { Zap, Trophy, Flame, Rocket, Gamepad2, Music, BookOpen, Brain, Sparkles, LayoutGrid, Award, Loader2 } from 'lucide-react';

const BRAND_ICONS = { Zap, Flame, Rocket, Gamepad2, Music, BookOpen, Brain, Sparkles };

const { brand, sensei, missions, lore } = activePack;
const BrandIcon = BRAND_ICONS[brand.icon] || Zap;
const accent = themeFor(brand.accent);
const ROOM_ID = activePack.id;

const TASK_TITLE = Object.fromEntries(missions.map((t) => [t.id, t.title]));
const TOTAL_XP = missions.reduce((s, t) => s + t.xp, 0);
const GAME_XP_DIV = { clicker: 15, shooter: 3, tetris: 25 };

const VIEWS = [
  { key: 'missions', label: 'Missions' },
  { key: 'quency', label: `${sensei.name} AI` },
  { key: 'family', label: 'Chat' },
  { key: 'handoff', label: 'Handoff Kit' },
  { key: 'profile', label: 'Profile' },
];

const missionXpOf = (tasks) => (tasks || []).reduce((s, id) => s + (missions.find((t) => t.id === id)?.xp || 0), 0);
const hzFor = (xp) => 100 + Math.round((xp / TOTAL_XP) * 200);
const levelFor = (xp) => Math.floor(xp / 200) + 1;
const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const pushLog = (logs, entry) => [entry, ...(logs || [])].slice(0, 12);
const seedRoom = { tasks: [], xp: 0, bonusXp: 0, scores: {}, logs: [lore.boot] };

function App() {
  const { profile, ready, signUp, login, logout, updateData } = useAuth();
  const [view, setView] = useState('missions');
  const [showHub, setShowHub] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-300 bg-[#0a0a0f] gap-2">
        <Loader2 className="animate-spin" size={18} /> Entering the dojo…
      </div>
    );
  }

  if (!profile) {
    return <AuthScreen onSignUp={signUp} onLogin={login} />;
  }

  const data = profile.data || {};
  const rooms = data.rooms || {};
  const prog = { ...seedRoom, ...(rooms[ROOM_ID] || {}) };
  const me = { key: profile.username, label: profile.display_name, color: profile.color };
  const theme = themeFor(profile.color);

  const roomMissionXp = missionXpOf(prog.tasks);
  const roomTotal = roomMissionXp + (prog.bonusXp || 0);
  const roomPct = Math.min(100, Math.round((roomTotal / TOTAL_XP) * 100));
  const crossTotal = Object.values(rooms).reduce((s, r) => s + (r.xp || 0) + (r.bonusXp || 0), 0) + (rooms[ROOM_ID] ? 0 : roomTotal);
  const rank = rankFor(crossTotal);
  const focusMission = missions.find((m) => !(prog.tasks || []).includes(m.id)) || null;
  const onboarded = data.onboarded === true;

  const updateRoom = (patch) =>
    updateData((d) => {
      const cur = { ...seedRoom, ...((d.rooms || {})[ROOM_ID] || {}) };
      return { ...d, rooms: { ...(d.rooms || {}), [ROOM_ID]: { ...cur, ...patch } } };
    });

  const toggleTask = (taskId) => {
    const current = prog.tasks || [];
    const adding = !current.includes(taskId);
    const newTasks = adding ? [...current, taskId] : current.filter((id) => id !== taskId);
    const xp = missionXpOf(newTasks);
    const oldTotal = roomTotal;
    const newTotal = xp + (prog.bonusXp || 0);
    let logs = pushLog(prog.logs, `${stamp()} · ${me.label} ${adding ? 'cleared' : 'reopened'} "${TASK_TITLE[taskId]}"`);
    if (levelFor(newTotal) > levelFor(oldTotal)) logs = pushLog(logs, `${stamp()} · ${lore.levelUp(levelFor(newTotal), me.label)}`);
    updateRoom({ tasks: newTasks, xp, logs });
  };

  const awardArcade = (game, score) => {
    if (!score || score <= 0) return;
    const gain = Math.min(60, Math.max(1, Math.round(score / (GAME_XP_DIV[game] || 15))));
    const oldTotal = roomTotal;
    const bonusXp = (prog.bonusXp || 0) + gain;
    const scores = { ...(prog.scores || {}), [game]: Math.max(prog.scores?.[game] || 0, Math.round(score)) };
    const newTotal = roomMissionXp + bonusXp;
    let logs = pushLog(prog.logs, `${stamp()} · ${lore.arcadeXp(gain, me.label)}`);
    if (levelFor(newTotal) > levelFor(oldTotal)) logs = pushLog(logs, `${stamp()} · ${lore.levelUp(levelFor(newTotal), me.label)}`);
    updateRoom({ bonusXp, scores, logs });
  };

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
          <button
            onClick={() => { setShowHub(false); setView('profile'); }}
            className={`pl-2 pr-3 py-1.5 rounded-2xl text-sm flex items-center gap-2 ${theme.solid} text-white`}
          >
            <span className="w-6 h-6 rounded-full bg-black/25 flex items-center justify-center text-xs font-black">
              {me.label.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold">{me.label}</span>
              <span className="text-[9px] opacity-80 flex items-center gap-0.5"><Award size={9} /> {rank.name}</span>
            </span>
          </button>
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
              <TrackLane title={`${me.label}'s Mission`} tasks={missions} completed={prog.tasks || []} onToggle={toggleTask} />

              <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold"><Trophy size={16} className="text-amber-400" /> Room Power</div>
                  <div className="text-xs font-mono text-zinc-400">{roomTotal} / {TOTAL_XP} XP</div>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className={`h-full ${theme.solid} transition-all duration-500`} style={{ width: `${roomPct}%` }} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <DojoCoreCanvas hz={hzFor(roomTotal)} size={240} label={brand.coreLabel} unit={brand.coreUnit} />
                <div className="mt-4 flex items-center justify-center gap-6 text-center">
                  <div>
                    <div className={`text-2xl font-black ${theme.text}`}>{roomTotal}</div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">Room XP</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${accent.text}`}>{rank.name.split(' ')[0]}</div>
                    <div className="text-[10px] uppercase tracking-wide text-zinc-500">Belt</div>
                  </div>
                </div>
              </div>

              <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="text-sm font-semibold mb-3">Activity</div>
                <div className="space-y-2 text-xs text-zinc-400 font-mono">
                  {(prog.logs || []).length === 0 && <div className="text-zinc-600">{lore.emptyActivity}</div>}
                  {(prog.logs || []).map((l, i) => (
                    <div key={i} className="truncate">{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'quency' && <div className="max-w-2xl mx-auto"><QuencyChat /></div>}
        {view === 'family' && <div className="max-w-2xl mx-auto"><FamilyChat displayName={me.label} /></div>}
        {view === 'handoff' && <HandoffKit />}
        {view === 'profile' && (
          <Profile profile={profile} rank={rank} crossTotal={crossTotal} rooms={rooms} scores={prog.scores} onLogout={logout} />
        )}
      </main>
      </>)}

      {showHub && <Hub onClose={() => setShowHub(false)} />}

      <DockedChat displayName={me.label} />
      <ArcadeOverlay
        currentUser={me.key}
        players={[me]}
        scores={{ [me.key]: prog.scores || {} }}
        focusMission={focusMission}
        onResult={awardArcade}
      />

      {!onboarded && <Onboarding name={me.label} onDone={() => updateData((d) => ({ ...d, onboarded: true }))} />}
    </div>
  );
}

export default App;
