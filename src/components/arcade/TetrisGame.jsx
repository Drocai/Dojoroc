import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, ChevronsDown, RotateCcw } from 'lucide-react';
import { ARCADE_TIPS, saveScore, pickRandom } from '../../lib/arcade';

// A compact but real Tetris. Clears lines, keeps score, speeds up as you clear,
// and flashes a learning tip on every line clear. Keyboard + touch controls.

const COLS = 10;
const ROWS = 18;
const CELL = 20;

const SHAPES = {
  I: { m: [[1, 1, 1, 1]], c: '#22d3ee' },
  O: { m: [[1, 1], [1, 1]], c: '#fbbf24' },
  T: { m: [[0, 1, 0], [1, 1, 1]], c: '#a78bfa' },
  S: { m: [[0, 1, 1], [1, 1, 0]], c: '#34d399' },
  Z: { m: [[1, 1, 0], [0, 1, 1]], c: '#fb7185' },
  J: { m: [[1, 0, 0], [1, 1, 1]], c: '#60a5fa' },
  L: { m: [[0, 0, 1], [1, 1, 1]], c: '#f59e0b' },
};
const KEYS = Object.keys(SHAPES);

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const rotate = (m) => m[0].map((_, i) => m.map((row) => row[i]).reverse());

const collide = (board, shape, x, y) => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
};

const spawn = () => {
  const k = KEYS[Math.floor(Math.random() * KEYS.length)];
  const { m, c } = SHAPES[k];
  return { shape: m, color: c, x: Math.floor((COLS - m[0].length) / 2), y: -m.length + 1 };
};

const TetrisGame = ({ accent }) => {
  const canvasRef = useRef(null);
  const game = useRef(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [tip, setTip] = useState('Clear a line to learn something!');
  const scoreRef = useRef(0);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !game.current) return;
    const { board, piece } = game.current;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    const cell = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    };
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (board[y][x]) cell(x, y, board[y][x]);
    if (piece) {
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++)
          if (piece.shape[r][c] && piece.y + r >= 0) cell(piece.x + c, piece.y + r, piece.color);
    }
  }, []);

  const lock = useCallback(() => {
    const g = game.current;
    const { board, piece } = g;
    piece.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v && piece.y + r >= 0) board[piece.y + r][piece.x + c] = piece.color;
      })
    );
    // Clear full lines.
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every((v) => v)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        y++;
      }
    }
    if (cleared) {
      const gained = [0, 40, 100, 300, 1200][cleared] || 1200;
      setScore((s) => {
        scoreRef.current = s + gained;
        return scoreRef.current;
      });
      setLines((l) => {
        const total = l + cleared;
        g.dropInterval = Math.max(140, 600 - Math.floor(total / 2) * 40);
        return total;
      });
      setTip(pickRandom(ARCADE_TIPS));
    }
    // Next piece.
    const next = spawn();
    if (collide(board, next.shape, next.x, next.y)) {
      g.over = true;
      setOver(true);
      setBest(saveScore('tetris', scoreRef.current));
    } else {
      g.piece = next;
    }
  }, []);

  const step = useCallback(() => {
    const g = game.current;
    if (!g || g.over) return;
    const { board, piece } = g;
    if (!collide(board, piece.shape, piece.x, piece.y + 1)) piece.y += 1;
    else lock();
    draw();
  }, [draw, lock]);

  const start = useCallback(() => {
    game.current = { board: emptyBoard(), piece: spawn(), dropInterval: 600, acc: 0, over: false };
    scoreRef.current = 0;
    setScore(0);
    setLines(0);
    setOver(false);
    draw();
  }, [draw]);

  // Init + game loop.
  useEffect(() => {
    start();
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const g = game.current;
      if (g && !g.over) {
        g.acc += now - last;
        if (g.acc >= g.dropInterval) {
          g.acc = 0;
          step();
        }
      }
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      saveScore('tetris', scoreRef.current);
    };
  }, [start, step]);

  const move = useCallback(
    (dx) => {
      const g = game.current;
      if (!g || g.over) return;
      if (!collide(g.board, g.piece.shape, g.piece.x + dx, g.piece.y)) {
        g.piece.x += dx;
        draw();
      }
    },
    [draw]
  );

  const turn = useCallback(() => {
    const g = game.current;
    if (!g || g.over) return;
    const r = rotate(g.piece.shape);
    for (const k of [0, -1, 1, -2, 2]) {
      if (!collide(g.board, r, g.piece.x + k, g.piece.y)) {
        g.piece.shape = r;
        g.piece.x += k;
        draw();
        return;
      }
    }
  }, [draw]);

  const drop = useCallback(() => {
    const g = game.current;
    if (!g || g.over) return;
    while (!collide(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) g.piece.y += 1;
    step();
  }, [step]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
      else if (e.key === 'ArrowDown') step();
      else if (e.key === 'ArrowUp') turn();
      else if (e.key === ' ') drop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, step, turn, drop]);

  const Btn = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-white"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-6 text-center">
        <div>
          <div className={`text-xl font-black ${accent.text}`}>{score}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Score</div>
        </div>
        <div>
          <div className="text-xl font-black text-zinc-300">{lines}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Lines</div>
        </div>
        <div>
          <div className="text-xl font-black text-zinc-300">{best}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">Best</div>
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-xl border border-zinc-800" />
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 rounded-xl">
            <div className="text-lg font-bold">Game Over</div>
            <button onClick={start} className={`px-4 py-2 rounded-2xl ${accent.btn} text-white text-sm flex items-center gap-2`}>
              <RotateCcw size={15} /> Play again
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[36px] max-w-[200px] text-center text-[11px] text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5">
        💡 {tip}
      </div>

      <div className="flex gap-2 w-[200px]">
        <Btn onClick={() => move(-1)}><ChevronLeft size={18} /></Btn>
        <Btn onClick={turn}><RotateCw size={18} /></Btn>
        <Btn onClick={() => move(1)}><ChevronRight size={18} /></Btn>
        <Btn onClick={drop}><ChevronsDown size={18} /></Btn>
      </div>
      <p className="text-[10px] text-zinc-500 text-center">Arrow keys on desktop · buttons on phone</p>
    </div>
  );
};

export default TetrisGame;
