import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { ARCADE_TIPS, saveScore, pickRandom } from '../../lib/arcade';

// Tap the core to score. Tapping fast builds a combo multiplier; every 20 taps
// flips a flashcard so you learn a little while you grind.
const ClickerGame = ({ accent }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [best, setBest] = useState(0);
  const [tip, setTip] = useState('Tap fast to build a combo!');
  const [pulse, setPulse] = useState(false);
  const tapsRef = useRef(0);
  const comboTimer = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Persist the run as a high score when leaving the game.
  useEffect(() => () => setBest(saveScore('clicker', scoreRef.current)), []);

  const tap = useCallback(() => {
    setScore((s) => s + combo);
    setPulse(true);
    setTimeout(() => setPulse(false), 90);

    tapsRef.current += 1;
    if (tapsRef.current % 20 === 0) {
      setTip(pickRandom(ARCADE_TIPS));
      setCombo((c) => Math.min(c + 1, 9)); // reward sustained focus
    }

    clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(1), 1400); // idle resets combo
  }, [combo]);

  useEffect(() => () => clearTimeout(comboTimer.current), []);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="flex items-center gap-6 text-center">
        <div>
          <div className={`text-3xl font-black ${accent.text}`}>{score}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Score</div>
        </div>
        <div>
          <div className="text-3xl font-black text-amber-400">×{combo}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Combo</div>
        </div>
        <div>
          <div className="text-3xl font-black text-zinc-300">{best}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Best</div>
        </div>
      </div>

      <button
        onClick={tap}
        className={`relative w-40 h-40 rounded-full ${accent.solid} text-white flex items-center justify-center transition-transform select-none shadow-2xl shadow-black/40 ${
          pulse ? 'scale-95' : 'scale-100'
        } active:scale-90`}
      >
        <Zap size={56} />
      </button>

      <div className="min-h-[48px] max-w-xs text-center text-xs text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5">
        💡 {tip}
      </div>
    </div>
  );
};

export default ClickerGame;
