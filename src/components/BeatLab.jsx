import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Music2, Trash2 } from 'lucide-react';
import { themeFor } from '../lib/theme';
import { playNote, playDrum, SCALE, DRUMS } from '../lib/audio';

// Hands-on music for the Sound Dojo: tap notes to hear them, then program a
// 8-step drum loop and play it back. Pure Web Audio — makes real sound, no
// assets. Only mounts in the Sound Dojo gym.
const STEPS = 8;

const BeatLab = ({ accent = 'purple', onPlay }) => {
  const theme = themeFor(accent);
  const [grid, setGrid] = useState(() => DRUMS.map(() => Array(STEPS).fill(false)));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [bpm, setBpm] = useState(100);
  const timer = useRef(null);
  const stepRef = useRef(0);

  const toggle = (r, c) =>
    setGrid((g) => g.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row)));

  useEffect(() => () => clearInterval(timer.current), []);

  const stop = () => {
    clearInterval(timer.current);
    setPlaying(false);
    setStep(-1);
  };

  const start = () => {
    if (playing) return stop();
    setPlaying(true);
    onPlay?.();
    stepRef.current = 0;
    const interval = (60 / bpm / 2) * 1000; // 8th notes
    timer.current = setInterval(() => {
      const s = stepRef.current % STEPS;
      setStep(s);
      grid.forEach((row, r) => { if (row[s]) playDrum(DRUMS[r]); });
      stepRef.current += 1;
    }, interval);
  };

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold flex items-center gap-2"><Music2 size={16} className={theme.text} /> Beat Lab</div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-zinc-500">{bpm} BPM</label>
          <input type="range" min="60" max="160" value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-20 accent-current" style={{ color: theme.solid.includes('purple') ? '#a855f7' : undefined }} />
          <button onClick={start} className={`px-3 py-1.5 rounded-xl ${theme.btn} text-white text-xs flex items-center gap-1`}>
            {playing ? <Square size={12} /> : <Play size={12} />} {playing ? 'Stop' : 'Play'}
          </button>
          <button onClick={() => setGrid(DRUMS.map(() => Array(STEPS).fill(false)))} className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-rose-400" aria-label="Clear"><Trash2 size={13} /></button>
        </div>
      </div>

      {/* Step sequencer */}
      <div className="space-y-1.5 mb-5">
        {DRUMS.map((drum, r) => (
          <div key={drum} className="flex items-center gap-1.5">
            <span className="w-10 text-[10px] uppercase text-zinc-500">{drum}</span>
            <div className="flex gap-1 flex-1">
              {grid[r].map((on, c) => (
                <button
                  key={c}
                  onClick={() => toggle(r, c)}
                  className={`flex-1 h-7 rounded-md border transition-colors ${
                    on ? `${theme.solid} border-transparent` : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                  } ${step === c ? 'ring-2 ring-white/40' : ''}`}
                  aria-label={`${drum} step ${c + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tone keys */}
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Play notes</div>
      <div className="flex gap-1">
        {SCALE.map((n) => (
          <button
            key={n}
            onClick={() => { playNote(n); onPlay?.(); }}
            className={`flex-1 h-12 rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700 hover:border-zinc-500 active:${theme.solid} text-[10px] text-zinc-400 flex items-end justify-center pb-1`}
          >
            {n.replace(/\d/, '')}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2">Tap the grid to build a beat, hit Play, then jam on the notes.</p>
    </div>
  );
};

export default BeatLab;
