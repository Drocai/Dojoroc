import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, RotateCcw, Crosshair } from 'lucide-react';
import { ARCADE_QUIZ, saveScore, pickRandom } from '../../lib/arcade';

// Quiz Blaster (reworked): the question sits up top; its answers descend
// together, one per column (no overlap, big tap targets). Tap the correct
// answer to blast it before the row reaches the floor. Wrong tap or letting
// the row land costs a life. Speeds up gently as you score.

const FLOOR = 86; // % — the danger line
const TICK = 50; // ms

const makeRound = (quiz) => {
  const q = pickRandom(quiz);
  const answers = q.answers.slice(0, 3);
  const order = answers.map((_, i) => i).sort(() => Math.random() - 0.5); // shuffle columns
  return {
    question: q.q,
    correct: q.correct,
    chips: order.map((answerIdx, col) => ({
      id: `${Date.now()}-${col}`,
      text: answers[answerIdx],
      correct: answerIdx === q.correct,
      col, // 0..2
    })),
  };
};

const ShooterGame = ({ accent, quiz = ARCADE_QUIZ, onResult }) => {
  const [round, setRound] = useState(() => makeRound(quiz));
  const [y, setY] = useState(0); // shared descent of the current row (0..100)
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState(null); // 'hit' | 'miss'
  const [gone, setGone] = useState({}); // chip ids already blasted this round

  const scoreRef = useRef(0);
  const speedRef = useRef(1);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = 1 + Math.min(1.6, score / 200); // ramps up
  }, [score]);

  const endGame = useCallback(() => {
    setOver(true);
    setBest(saveScore('shooter', scoreRef.current));
    onResultRef.current?.(scoreRef.current);
  }, []);

  const loseLife = useCallback(() => {
    setLives((l) => {
      const n = l - 1;
      if (n <= 0) endGame();
      return n;
    });
    setFlash('miss');
    setTimeout(() => setFlash(null), 220);
  }, [endGame]);

  const next = useCallback(() => {
    setRound(makeRound(quiz));
    setY(0);
    setGone({});
  }, [quiz]);

  // Descent loop.
  useEffect(() => {
    if (over) return;
    const t = setInterval(() => {
      setY((prev) => {
        const ny = prev + 0.55 * speedRef.current;
        if (ny >= FLOOR) {
          loseLife();
          next();
          return 0;
        }
        return ny;
      });
    }, TICK);
    return () => clearInterval(t);
  }, [over, loseLife, next]);

  const blast = (chip) => {
    if (over || gone[chip.id]) return;
    if (chip.correct) {
      setScore((s) => s + 10);
      setFlash('hit');
      setTimeout(() => setFlash(null), 180);
      next();
    } else {
      setGone((g) => ({ ...g, [chip.id]: true }));
      loseLife();
    }
  };

  const restart = () => {
    setScore(0);
    setLives(3);
    setOver(false);
    next();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className={`font-black ${accent.text}`}>{score}</div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <Heart key={i} size={16} className={i < lives ? 'text-rose-500 fill-rose-500' : 'text-zinc-700'} />
          ))}
        </div>
        <div className="text-zinc-400 text-xs">Best {best}</div>
      </div>

      <div className="text-center text-sm font-semibold text-white bg-black/50 border border-zinc-700 rounded-2xl px-3 py-2 min-h-[44px] flex items-center justify-center">
        {round.question}
      </div>

      <div
        className={`relative h-[300px] rounded-2xl overflow-hidden border bg-black/40 transition-colors ${
          flash === 'hit' ? 'border-emerald-500' : flash === 'miss' ? 'border-rose-500' : 'border-zinc-700'
        }`}
      >
        {/* danger line */}
        <div className="absolute left-0 right-0 border-t border-dashed border-rose-500/40" style={{ top: `${FLOOR}%` }} />

        {over ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
            <div className="text-lg font-bold">Game Over</div>
            <div className="text-sm text-zinc-400">Score {score} · Best {best}</div>
            <button onClick={restart} className={`px-4 py-2 rounded-2xl ${accent.btn} text-white text-sm flex items-center gap-2`}>
              <RotateCcw size={15} /> Play again
            </button>
          </div>
        ) : (
          round.chips.map((chip) =>
            gone[chip.id] ? null : (
              <button
                key={chip.id}
                onClick={() => blast(chip)}
                style={{ left: `${4 + chip.col * 32}%`, top: `${y}%`, width: '28%' }}
                className={`absolute px-2 py-2 rounded-xl border text-xs leading-tight text-white text-center shadow-lg active:scale-95 transition-transform ${accent.solid} border-white/20`}
              >
                {chip.text}
              </button>
            )
          )
        )}
      </div>
      <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
        <Crosshair size={12} /> Tap the right answer before it crosses the line.
      </p>
    </div>
  );
};

export default ShooterGame;
