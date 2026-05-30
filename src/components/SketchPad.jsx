import React, { useRef, useState, useEffect } from 'react';
import { Palette, Eraser, Trash2, Save, Check } from 'lucide-react';
import { themeFor } from '../lib/theme';

// Hands-on art for the Art Dojo: a simple canvas you draw on with color +
// brush size, then save a small thumbnail to your profile gallery. Pointer
// events so it works with mouse and touch. Only mounts in the Art Dojo gym.
const COLORS = ['#f43f5e', '#f59e0b', '#fde047', '#10b981', '#3b82f6', '#a855f7', '#ffffff', '#0a0a0f'];
const SIZES = [3, 8, 16];

const SketchPad = ({ accent = 'rose', onSave, savedCount = 0, onDraw }) => {
  const theme = themeFor(accent);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [color, setColor] = useState('#f43f5e');
  const [size, setSize] = useState(8);
  const [erasing, setErasing] = useState(false);
  const [saved, setSaved] = useState(false);
  const drewOnce = useRef(false);

  // Prime the canvas with a dark background once.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

  const pos = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * cv.width, y: ((e.clientY - r.top) / r.height) * cv.height };
  };

  const start = (e) => {
    drawing.current = true;
    last.current = pos(e);
    if (!drewOnce.current) { drewOnce.current = true; onDraw?.(); }
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    ctx.strokeStyle = erasing ? '#0a0a0f' : color;
    ctx.lineWidth = erasing ? size * 2.2 : size;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => { drawing.current = false; };

  const clear = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drewOnce.current = false;
  };

  const save = () => {
    // Downscale to a small thumbnail to keep the profile blob light.
    const cv = canvasRef.current;
    const tmp = document.createElement('canvas');
    tmp.width = 160; tmp.height = 120;
    tmp.getContext('2d').drawImage(cv, 0, 0, 160, 120);
    const dataUrl = tmp.toDataURL('image/png');
    onSave?.(dataUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Palette size={16} className={theme.text} /> Sketch Pad</div>
        <span className="text-[10px] text-zinc-500">{savedCount} in your gallery</span>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full rounded-2xl border border-zinc-700 bg-[#0a0a0f] touch-none cursor-crosshair"
        style={{ aspectRatio: '4 / 3' }}
      />

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setErasing(false); }}
              aria-label={`color ${c}`}
              className={`w-6 h-6 rounded-full border ${color === c && !erasing ? 'ring-2 ring-white' : 'border-zinc-700'}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex gap-1 ml-1">
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`w-7 h-7 rounded-lg flex items-center justify-center ${size === s ? theme.solid : 'bg-zinc-950 border border-zinc-700'}`}>
              <span className="rounded-full bg-white block" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
        <button onClick={() => setErasing((v) => !v)} className={`px-2.5 h-7 rounded-lg text-xs flex items-center gap-1 ${erasing ? theme.solid + ' text-white' : 'bg-zinc-950 border border-zinc-700 text-zinc-300'}`}>
          <Eraser size={13} /> Erase
        </button>
        <div className="flex-1" />
        <button onClick={clear} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400" aria-label="Clear"><Trash2 size={14} /></button>
        <button onClick={save} className={`px-3 h-8 rounded-xl ${theme.btn} text-white text-xs font-medium flex items-center gap-1.5`}>
          {saved ? <Check size={13} /> : <Save size={13} />} {saved ? 'Saved!' : 'Save to gallery'}
        </button>
      </div>
    </div>
  );
};

export default SketchPad;
