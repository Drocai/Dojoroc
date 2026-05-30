import React, { useState } from 'react';
import { Gamepad2, X, Target } from 'lucide-react';
import { activePack } from '../../../packs/index.js';
import { themeFor } from '../../lib/theme';
import { GAMES, poolFor } from '../../lib/arcade';
import ClickerGame from './ClickerGame';
import ShooterGame from './ShooterGame';
import TetrisGame from './TetrisGame';

const accent = themeFor(activePack.brand.accent);

const GAME_COMPONENTS = {
  clicker: ClickerGame,
  shooter: ShooterGame,
  tetris: TetrisGame,
};

// Toggleable "dead-time" arcade. Pops up over the dojo while you wait on a task
// or on the other person — the rest of the app keeps running behind it. Each
// game teaches from the active pack (narrowed to your current mission when it
// has its own content), keeps a shared high score, and feeds dojo XP via
// onResult.
const ArcadeOverlay = ({ currentUser, players = activePack.players, scores = {}, focusMission, onResult }) => {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState('clicker');
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
    <div className="hud fixed bottom-5 left-5 z-50 w-[min(94vw,360px)] h-[min(88vh,680px)] bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2 bg-zinc-950/60">
        <div className="flex items-center gap-2 min-w-0">
          <Gamepad2 size={18} className={accent.text} />
          <div className="min-w-0">
            <div className="font-display font-semibold text-sm truncate">Dead-Time Arcade</div>
            <div className="text-[10px] text-zinc-400 -mt-0.5 truncate">Play &amp; learn while you wait</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close arcade" className="text-zinc-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      {focusMission && (
        <div className="px-4 py-1.5 border-b border-zinc-800 bg-zinc-950/40 flex items-center gap-1.5 text-[10px] text-zinc-400">
          <Target size={12} className={accent.text} />
          <span className="truncate">Focus: {focusMission.title}</span>
        </div>
      )}

      <div className="px-3 py-2 border-b border-zinc-800 flex gap-1.5 bg-zinc-950/30">
        {GAMES.map((g) => (
          <button
            key={g.key}
            onClick={() => setGame(g.key)}
            className={`flex-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              game === g.key ? `${accent.solid} text-white` : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <div className="leading-tight">{g.label}</div>
            <div className="text-[9px] opacity-70 uppercase tracking-wide">{g.tag}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Game
          accent={accent}
          tips={pool.tips}
          quiz={pool.quiz}
          onResult={(score) => onResult?.(game, score)}
        />
      </div>

      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-zinc-500 truncate">{GAMES.find((g) => g.key === game)?.desc}</span>
        <span className="font-mono text-zinc-300 whitespace-nowrap flex gap-2">
          {players.map((p) => (
            <span key={p.key} className={p.key === currentUser ? themeFor(p.color).text : ''}>
              {p.label.split(' ')[0]} {scores[p.key]?.[game] || 0}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

export default ArcadeOverlay;
