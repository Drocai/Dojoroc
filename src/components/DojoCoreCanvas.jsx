import React, { useRef, useEffect } from 'react';

const DojoCoreCanvas = ({ hz = 100, size = 240, label = 'DOJO CORE', unit = 'HZ' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.29;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const power = Math.min(hz / 300, 1.2);
      const time = Date.now() / 600;

      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.5,
        centerX, centerY, baseRadius * (1.6 + power * 0.4)
      );
      glowGradient.addColorStop(0, '#10b981');
      glowGradient.addColorStop(0.35, '#059669');
      glowGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * (1 + power * 0.35), 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = '#052e16';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      const ringRadius = baseRadius * (1.15 + Math.sin(time) * 0.12);
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [hz, size]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas ref={canvasRef} width={size} height={size} className="drop-shadow-[0_0_30px_rgba(16,185,129,0.15)]" />
      <div className="absolute bottom-6 text-center">
        <div className="text-[10px] font-mono tracking-[2px] text-emerald-400/70">{label}</div>
        <div className="text-4xl font-black tabular-nums text-white tracking-tighter">{hz}</div>
        <div className="text-[10px] text-emerald-400/60 -mt-1">{unit}</div>
      </div>
    </div>
  );
};

export default DojoCoreCanvas;
