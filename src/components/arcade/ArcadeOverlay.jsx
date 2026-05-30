import React, { useState, lazy, Suspense } from 'react';
import { Gamepad2, X, Target, Loader2 } from 'lucide-react';
import { activePack } from '../../../packs/index.js';
import { themeFor } from '../../lib/theme';
import { GAMES, poolFor } from '../../lib/arcade';

// Games are code-split: their logic only loads when the arcade is opened, so
// the launcher button stays instant and the initial bundle stays lean.
const ClickerGame = lazy(() => import('./ClickerGame'));
const ShooterGame = lazy(() => import('./ShooterGame'));
const TetrisGame = lazy(() => import('./TetrisGame'));

const accent = themeFor(activePack.brand.accent);

const GAME_COMPONENTS = { clicker: ClickerGame, shooter: ShooterGame, tetris: TetrisGame };

// Glass "dead-time" arcade. Tap the controller from anywhere and a translucent
// layer drops over the current screen — you keep your place in whatever you're
// doing (it's still visible/working behind), and play while you wait. Each game
// teaches from the active room, feeds dojo XP, and keeps a shared high score.
const ArcadeOverlay = ({ currentUser, players = activePack.players, scores = {}, focusMission, onResult }) => {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('dojo.arcade.game');
    return GAME_COMPONENTS[saved] ? saved : 'clicker';
  });
  const pickGame = (key) => {
    setGame(key);
    try { localStorage.setItem('dojo.arcade.game', key); } catch { /* ignore */ }
  };
  const Game = GAME_COMPONENTS[game];
  const pool = poolFor(focusMission?.id);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open arcade"
        className={`fixed bottom-5 left-5 z-50 w-14 h-14 rounded-full ${accent.btn} text-white shadow-lg shadow-black/40 flex items-center justify-center transition-transform active:scale-95`}
      >
        <Gamepad2 size={24} />
      </button>
    );
  }

  return (
    // Full-screen glass: dims + blurs the dojo behind without unmounting it.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/45 backdrop-blur-md">
      <div className="hud w-[min(95vw,400px)] max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-zinc-900/70 backdrop-blur-xl shadow-2xl shadow-black/60">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Gamepad2 size={18} className={accent.text} />
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm truncate">Dead-Time Arcade</div>
              <div className="text-[10px] text-zinc-300/80 -mt-0.5 truncate">Playing over your screen — your work's still there</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close arcade" className="text-zinc-300 hover:text-white p-1.5 rounded-xl bg-white/5">
            <X size={18} />
          </button>
        </div>

        {focusMission && (
          <div className="px-4 py-1.5 border-b border-white/10 flex items-center gap-1.5 text-[10px] text-zinc-300/80">
            <Target size={12} className={accent.text} />
            <span className="truncate">Focus: {focusMission.title}</span>
          </div>
        )}

        <div className="px-3 py-2 border-b border-white/10 flex gap-1.5">
          {GAMES.map((g) => (
            <button
              key={g.key}
              onClick={() => pickGame(g.key)}
              className={`flex-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                game === g.key ? `${accent.solid} text-white` : 'bg-white/5 text-zinc-300 hover:bg-white/10'
              }`}
            >
              <div className="leading-tight">{g.label}</div>
              <div className="text-[9px] opacity-70 uppercase tracking-wide">{g.tag}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<div className="flex justify-center py-10 text-zinc-400"><Loader2 className="animate-spin" size={20} /></div>}>
            <Game accent={accent} tips={pool.tips} quiz={pool.quiz} onResult={(score) => onResult?.(game, score)} />
          </Suspense>
        </div>

        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-zinc-400 truncate">{GAMES.find((g) => g.key === game)?.desc}</span>
          <span className="font-mono text-zinc-200 whitespace-nowrap flex gap-2">
            {players.map((p) => (
              <span key={p.key} className={p.key === currentUser ? themeFor(p.color).text : ''}>
                {p.label.split(' ')[0]} {scores[p.key]?.[game] || 0}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArcadeOverlay;
