import React, { useRef, useEffect } from 'react';
import { hexFor } from '../lib/theme';

// The animated reactor core. It reads live `hz` from a ref so the requestAnimation
// loop is started once and never torn down on XP changes — only the value it
// reads updates. Colors follow the active room's accent.
const DojoCoreCanvas = ({ hz = 100, size = 240, label = 'DOJO CORE', unit = 'HZ', accent = 'emerald' }) => {
  const canvasRef = useRef(null);
  const hzRef = useRef(hz);
  hzRef.current = hz;
  const c = hexFor(accent);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.29;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const power = Math.min(hzRef.current / 300, 1.2);
      const time = Date.now() / 600;

      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.5,
        centerX, centerY, baseRadius * (1.6 + power * 0.4)
      );
      glowGradient.addColorStop(0, c.base);
      glowGradient.addColorStop(0.35, c.deep);
      glowGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * (1 + power * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = c.dark;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = c.base;
      ctx.fill();

      const ringRadius = baseRadius * (1.15 + Math.sin(time) * 0.12);
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgb(${c.rgb} / 0.45)`;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [size, c.base, c.deep, c.dark, c.rgb]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas ref={canvasRef} width={size} height={size} style={{ filter: `drop-shadow(0 0 30px rgb(${c.rgb} / 0.15))` }} />
      <div className="absolute bottom-6 text-center">
        <div className="text-[10px] font-mono tracking-[2px]" style={{ color: `rgb(${c.rgb} / 0.7)` }}>{label}</div>
        <div className="text-4xl font-black tabular-nums text-white tracking-tighter">{hz}</div>
        <div className="text-[10px] -mt-1" style={{ color: `rgb(${c.rgb} / 0.6)` }}>{unit}</div>
      </div>
    </div>
  );
};

export default React.memo(DojoCoreCanvas);
