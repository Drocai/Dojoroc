import React, { useState, useRef, useEffect } from 'react';
import { Swords, Trophy, RotateCcw } from 'lucide-react';
import RocAvatar from './RocAvatar';
import { themeFor } from '../lib/theme';
import { rocBelt, rocTier } from '../lib/rocs';
import { initBout, playTurn, MOVES, boutReward, makeOpponent } from '../lib/sparring';

// Dojo Sparring: pick a difficulty, then duel a generated opponent with your
// active Roc. A win awards XP to the Roc (onWin), so battling is another way to
// train — and it shows off belts, personality taunts, and the avatars.
const HpBar = ({ side, color }) => {
  const t = themeFor(color);
  const pct = Math.max(0, Math.round((side.hp / side.max) * 100));
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="truncate font-semibold">{side.roc.name}</span>
        <span className="font-mono text-zinc-400">{side.hp}/{side.max}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${t.solid} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Sparring = ({ roc, onWin }) => {
  const [bout, setBout] = useState(null);
  const [tier, setTier] = useState(null); // chosen difficulty
  const [rewarded, setRewarded] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [bout]);

  if (!roc) return <div className="text-sm text-zinc-500">Pick an active Roc to spar with.</div>;
  const theme = themeFor(roc.color);
  const myTier = rocTier(roc);

  const start = (t) => {
    setTier(t);
    setRewarded(false);
    setBout(initBout(roc, makeOpponent(t)));
  };

  const move = (key) => {
    setBout((b) => {
      const next = playTurn(b, key);
      if (next.over && next.winner === 'you' && !rewarded) {
        setRewarded(true);
        onWin?.(boutReward(next.foe.roc));
      }
      return next;
    });
  };

  if (!bout) {
    return (
      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="text-sm font-semibold mb-1 flex items-center gap-2"><Swords size={16} className={theme.text} /> Dojo Sparring</div>
        <p className="text-xs text-zinc-500 mb-4">Duel an opponent to train {roc.name}. Win to earn XP. Tougher foes pay more.</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { t: Math.max(0, myTier - 1), label: 'Easy' },
            { t: myTier, label: 'Even' },
            { t: myTier + 1, label: 'Hard' },
          ].map((d) => (
            <button key={d.label} onClick={() => start(d.t)} className={`rounded-2xl border border-zinc-700 hover:border-zinc-500 py-3 text-sm font-medium`}>
              {d.label}
              <span className="block text-[10px] text-zinc-500">+{30 + d.t * 15} XP</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <RocAvatar roc={bout.you.roc} size={44} idle={!bout.over} />
        <HpBar side={bout.you} color={bout.you.roc.color} />
        <span className="text-xs text-zinc-600 font-mono">VS</span>
        <HpBar side={bout.foe} color={bout.foe.roc.color} />
        <RocAvatar roc={bout.foe.roc} size={44} />
      </div>

      <div ref={logRef} className="h-32 overflow-y-auto bg-zinc-950/50 border border-zinc-800 rounded-2xl p-3 space-y-1 text-xs text-zinc-300 mb-3">
        {bout.log.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      {bout.over ? (
        <div className="space-y-2">
          <div className={`text-sm font-semibold flex items-center gap-2 ${bout.winner === 'you' ? theme.text : 'text-rose-400'}`}>
            <Trophy size={16} /> {bout.winner === 'you' ? `Victory! +${boutReward(bout.foe.roc)} XP to ${roc.name}` : 'Defeated — train more and rematch.'}
          </div>
          <button onClick={() => { setBout(null); setTier(null); }} className={`w-full py-2.5 rounded-2xl ${theme.btn} text-white text-sm font-medium flex items-center justify-center gap-2`}>
            <RotateCcw size={15} /> Spar again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {MOVES.map((m) => (
            <button key={m.key} onClick={() => move(m.key)} className="rounded-2xl border border-zinc-700 hover:border-zinc-500 py-2.5 text-sm font-medium">
              {m.label}
              <span className="block text-[9px] text-zinc-500">{m.note}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sparring;
