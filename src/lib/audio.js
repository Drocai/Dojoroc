// Tiny Web Audio engine for the Sound Dojo — no libraries, no assets. Plays
// notes and drum-ish sounds via oscillators/noise so the music gym actually
// makes sound. Lazily creates one shared AudioContext on first user gesture.

let ctx = null;
const ac = () => {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

// Note name → frequency (Hz). A pentatonic-friendly set that always sounds nice.
export const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
};
export const SCALE = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

// Pluck a single tone with a soft attack/decay envelope.
export function playNote(freq, { dur = 0.35, type = 'triangle', gain = 0.25 } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = typeof freq === 'string' ? NOTES[freq] || 440 : freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// Percussion via filtered noise bursts (kick/snare/hat).
export function playDrum(kind) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  if (kind === 'kick') {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g).connect(c.destination);
    osc.start(t); osc.stop(t + 0.2);
    return;
  }
  // noise buffer for snare/hat
  const len = Math.floor(c.sampleRate * 0.2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = kind === 'hat' ? 'highpass' : 'bandpass';
  filt.frequency.value = kind === 'hat' ? 8000 : 1800;
  const g = c.createGain();
  const dur = kind === 'hat' ? 0.05 : 0.15;
  g.gain.setValueAtTime(kind === 'hat' ? 0.3 : 0.45, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt).connect(g).connect(c.destination);
  src.start(t); src.stop(t + dur + 0.02);
}

export const DRUMS = ['kick', 'snare', 'hat'];
