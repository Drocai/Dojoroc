import React, { useState, useRef, useMemo } from 'react';
import { Sparkles, RotateCcw, Check } from 'lucide-react';
import { themeFor, hexFor } from '../lib/theme';

// Hands-on space for the Cosmos Lab: a star field where you connect stars in
// order to trace a real constellation. Pure SVG, no assets. Completing one
// nudges the daily quest. Only mounts in the Cosmos Lab gym.

// Each constellation: named star points (0-100 coord space) in connect order.
const CONSTELLATIONS = [
  { name: 'The Dipper', stars: [[20, 30], [34, 26], [48, 30], [60, 38], [60, 55], [44, 58], [46, 42]] },
  { name: 'Orion', stars: [[30, 18], [62, 22], [40, 40], [46, 42], [52, 44], [34, 70], [60, 68]] },
  { name: 'Cassiopeia', stars: [[18, 45], [34, 30], [50, 48], [66, 32], [82, 46]] },
  { name: 'The Cross', stars: [[50, 18], [50, 70], [28, 44], [72, 44]] },
];

const StarMap = ({ accent = 'blue', onComplete }) => {
  const theme = themeFor(accent);
  const c = hexFor(accent);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0); // next star to click
  const [done, setDone] = useState(false);
  // Random faint background stars for atmosphere (stable per mount).
  const bgStars = useMemo(() => Array.from({ length: 40 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, r: Math.random() * 0.8 + 0.3 })), []);

  const con = CONSTELLATIONS[idx];

  const clickStar = (i) => {
    if (done) return;
    if (i === progress) {
      const np = progress + 1;
      setProgress(np);
      if (np >= con.stars.length) {
        setDone(true);
        onComplete?.();
      }
    } else {
      setProgress(0); // wrong order — reset the trace
    }
  };

  const next = () => {
    setIdx((idx + 1) % CONSTELLATIONS.length);
    setProgress(0);
    setDone(false);
  };

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Sparkles size={16} className={theme.text} /> Star Map</div>
        <span className="text-[10px] text-zinc-500">Trace: <span className="text-zinc-300">{con.name}</span></span>
      </div>

      <svg viewBox="0 0 100 80" className="w-full rounded-2xl bg-[#05060f] border border-zinc-800" style={{ aspectRatio: '5 / 4' }}>
        {bgStars.map((s, i) => <circle key={i} cx={s.x} cy={s.y * 0.8} r={s.r} fill="#fff" opacity="0.4" />)}
        {/* drawn connection lines so far */}
        {con.stars.slice(1, progress).map((s, i) => {
          const a = con.stars[i];
          return <line key={i} x1={a[0]} y1={a[1]} x2={s[0]} y2={s[1]} stroke={c.base} strokeWidth="0.7" opacity="0.9" />;
        })}
        {/* the stars */}
        {con.stars.map((s, i) => {
          const lit = i < progress;
          const nextUp = i === progress && !done;
          return (
            <g key={i} onClick={() => clickStar(i)} style={{ cursor: 'pointer' }}>
              <circle cx={s[0]} cy={s[1]} r="4" fill="transparent" />
              <circle cx={s[0]} cy={s[1]} r={lit ? 2 : 1.6} fill={lit ? c.base : '#fff'} opacity={lit ? 1 : 0.85}
                style={nextUp ? { filter: 'drop-shadow(0 0 2px #fff)' } : undefined} />
              {nextUp && <circle cx={s[0]} cy={s[1]} r="3.2" fill="none" stroke={c.base} strokeWidth="0.5" opacity="0.9" className="belt-up-badge" />}
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-zinc-500">
          {done ? <span className={`flex items-center gap-1 ${theme.text}`}><Check size={13} /> {con.name} traced!</span>
            : `Click the stars in order — ${progress}/${con.stars.length}`}
        </span>
        <button onClick={next} className={`px-3 py-1.5 rounded-xl ${done ? theme.btn + ' text-white' : 'bg-zinc-800 text-zinc-300'} text-xs flex items-center gap-1`}>
          <RotateCcw size={12} /> {done ? 'Next' : 'New one'}
        </button>
      </div>
    </div>
  );
};

export default StarMap;
