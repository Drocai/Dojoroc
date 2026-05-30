import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { ARCADE_QUIZ, saveScore, pickRandom } from '../../lib/arcade';

// A learning shooter: a question shows up top, answer pods drift down. Tap the
// correct one to "blast" it. Wrong tap or letting the correct pod escape costs
// a life. Three lives, then game over with a high score.

const SPEED = 0.22; // % of play height per tick
const TICK = 40; // ms

const newRound = () => {
  const q = pickRandom(ARCADE_QUIZ);
  // Build pods (one per answer) at staggered heights + random x lanes.
  const lanes = [12, 38, 62, 86];
  const order = [...q.answers.keys()].sort(() => Math.random() - 0.5);
  const pods = q.answers.map((text, i) => ({
    id: `${Date.now()}-${i}`,
    text,
    correct: i === q.correct,
    x: lanes[order[i] % lanes.length],
    y: -10 - i * 22, // staggered entry
  }));
  return { q: q.q, pods };
};

const ShooterGame = ({ accent }) => {
  const [round, setRound] = useState(newRound);
  const [pods, setPods] = useState(round.pods);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState(null); // 'hit' | 'miss'
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const loseLife = useCallback(() => {
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        setOver(true);
        setBest(saveScore('shooter', scoreRef.current));
      }
      return next;
    });
  }, []);

  const nextRound = useCallback(() => {
    const r = newRound();
    setRound(r);
    setPods(r.pods);
  }, []);

  // Falling animation.
  useEffect(() => {
    if (over) return;
    const t = setInterval(() => {
      setPods((prev) => {
        let lostCorrect = false;
        const moved = prev
          .map((p) => ({ ...p, y: p.y + SPEED * TICK }))
          .filter((p) => {
            if (p.y >= 100) {
              if (p.correct) lostCorrect = true; // the right answer escaped
              return false;
            }
            return true;
          });
        if (lostCorrect) {
          setFlash('miss');
          setTimeout(() => setFlash(null), 250);
          loseLife();
          setTimeout(nextRound, 0);
          return [];
        }
        return moved;
      });
    }, TICK);
    return () => clearInterval(t);
  }, [over, loseLife, nextRound]);

  useEffect(() => () => saveScore('shooter', scoreRef.current), []);

  const shoot = (pod) => {
    if (over) return;
    if (pod.correct) {
      setScore((s) => s + 10);
      setFlash('hit');
      setTimeout(() => setFlash(null), 200);
      nextRound();
    } else {
      setPods((prev) => prev.filter((p) => p.id !== pod.id));
      setFlash('miss');
      setTimeout(() => setFlash(null), 200);
      loseLife();
    }
  };

  const restart = () => {
    setScore(0);
    setLives(3);
    setOver(false);
    nextRound();
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

      <div className="text-center text-sm font-medium text-white bg-zinc-950 border border-zinc-800 rounded-2xl px-3 py-2 min-h-[40px] flex items-center justify-center">
        {round.q}
      </div>

      <div
        className={`relative h-[300px] rounded-2xl overflow-hidden border bg-zinc-950 transition-colors ${
          flash === 'hit' ? 'border-emerald-500' : flash === 'miss' ? 'border-rose-500' : 'border-zinc-800'
        }`}
      >
        {over ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/90">
            <div className="text-lg font-bold">Game Over</div>
            <div className="text-sm text-zinc-400">
              Score {score} · Best {best}
            </div>
            <button onClick={restart} className={`px-4 py-2 rounded-2xl ${accent.btn} text-white text-sm flex items-center gap-2`}>
              <RotateCcw size={15} /> Play again
            </button>
          </div>
        ) : (
          pods.map((p) => (
            <button
              key={p.id}
              onClick={() => shoot(p)}
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, 0)' }}
              className="absolute max-w-[44%] px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-[11px] leading-tight text-white shadow-lg"
            >
              {p.text}
            </button>
          ))
        )}
      </div>
      <p className="text-[11px] text-zinc-500 text-center">Tap the correct answer before it reaches the bottom.</p>
    </div>
  );
};

export default ShooterGame;
