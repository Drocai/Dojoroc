import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calculator, Timer, Zap, RotateCcw } from 'lucide-react';
import { themeFor } from '../lib/theme';

// Hands-on math for the Number Dojo: a 30-second sprint of mental-math problems.
// Difficulty scales with the streak of correct answers. Pure + self-contained.
// Only mounts in the Number Dojo gym; finishing a round nudges the daily quest.
const ROUND_SECONDS = 30;

function makeProblem(level) {
  const ops = level < 3 ? ['+', '-'] : level < 6 ? ['+', '-', '×'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const cap = op === '×' ? 4 + level : 10 + level * 4;
  let a = 1 + Math.floor(Math.random() * cap);
  let b = 1 + Math.floor(Math.random() * cap);
  if (op === '-' && b > a) [a, b] = [b, a]; // keep it non-negative
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { text: `${a} ${op} ${b}`, answer };
}

const MathSprint = ({ accent = 'amber', onFinish, best = 0 }) => {
  const theme = themeFor(accent);
  const [state, setState] = useState('idle'); // idle | playing | done
  const [problem, setProblem] = useState(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState(null); // 'right' | 'wrong'
  const [time, setTime] = useState(ROUND_SECONDS);
  const timer = useRef(null);
  const inputRef = useRef(null);

  const stop = useCallback(() => {
    clearInterval(timer.current);
    setState('done');
    setProblem(null);
  }, []);

  useEffect(() => () => clearInterval(timer.current), []);

  const start = () => {
    setScore(0); setStreak(0); setTime(ROUND_SECONDS); setInput('');
    setProblem(makeProblem(0));
    setState('playing');
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timer.current); setState('done'); setProblem(null); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Fire the daily-quest nudge once when a round ends.
  useEffect(() => {
    if (state === 'done') onFinish?.(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (state !== 'playing' || input === '') return;
    const correct = Number(input) === problem.answer;
    if (correct) {
      const ns = streak + 1;
      setStreak(ns);
      setScore((s) => s + 10 + Math.min(20, ns * 2));
      setFlash('right');
      setProblem(makeProblem(Math.floor(ns / 2)));
    } else {
      setStreak(0);
      setFlash('wrong');
      setProblem(makeProblem(0));
    }
    setInput('');
    setTimeout(() => setFlash(null), 200);
    inputRef.current?.focus();
  };

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Calculator size={16} className={theme.text} /> Math Sprint</div>
        <span className="text-[10px] text-zinc-500">Best: {best}</span>
      </div>

      {state === 'idle' && (
        <div className="text-center py-6">
          <p className="text-sm text-zinc-400 mb-4">Solve as many as you can in {ROUND_SECONDS}s. Answer streaks score more!</p>
          <button onClick={start} className={`px-5 py-2.5 rounded-2xl ${theme.btn} text-white text-sm font-medium inline-flex items-center gap-2`}>
            <Zap size={15} /> Start Sprint
          </button>
        </div>
      )}

      {state === 'playing' && problem && (
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-mono text-zinc-400 flex items-center gap-1"><Timer size={12} /> {time}s</span>
            <span className={`font-mono ${theme.text}`}>{score} pts{streak > 1 ? ` · 🔥${streak}` : ''}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-4">
            <div className={`h-full ${theme.solid} transition-all duration-1000 linear`} style={{ width: `${(time / ROUND_SECONDS) * 100}%` }} />
          </div>
          <div className={`text-center text-4xl font-black mb-4 transition-colors ${flash === 'right' ? theme.text : flash === 'wrong' ? 'text-rose-400' : 'text-white'}`}>
            {problem.text}
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="answer"
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-center text-lg outline-none"
            />
            <button type="submit" className={`px-6 rounded-2xl ${theme.btn} text-white font-semibold`}>Go</button>
          </form>
        </div>
      )}

      {state === 'done' && (
        <div className="text-center py-6">
          <div className={`text-3xl font-black ${theme.text}`}>{score} pts</div>
          <div className="text-xs text-zinc-500 mb-4">{score > best ? 'New best! 🎉' : 'Nice work.'}</div>
          <button onClick={start} className={`px-5 py-2.5 rounded-2xl ${theme.btn} text-white text-sm font-medium inline-flex items-center gap-2`}>
            <RotateCcw size={15} /> Go again
          </button>
        </div>
      )}
    </div>
  );
};

export default MathSprint;
