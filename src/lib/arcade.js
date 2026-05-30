// Arcade content + score storage. The mini-games are "learning" games: the
// questions and tips come from the ACTIVE pack, so the arcade automatically
// teaches whatever subject is loaded. Packs can provide `arcade: { tips, quiz }`;
// anything they omit falls back to these generic defaults.

import { activePack } from '../../packs/index.js';

const DEFAULT_TIPS = [
  'Small working builds beat big broken ones — ship the tiny version first.',
  'When code breaks, read the error out loud. It usually tells you the fix.',
  'Commit often. A commit is a save point you can always come back to.',
  'Name things for what they do, not how they do it.',
  'Stuck? Change one thing at a time so you know what fixed it.',
];

const DEFAULT_QUIZ = [
  { q: 'What does a "save point" for your code get called?', answers: ['A commit', 'A cookie', 'A crash'], correct: 0 },
  { q: 'Which is the SMARTEST move when a feature is too big?', answers: ['Build the tiny version first', 'Build it all at once', 'Give up'], correct: 0 },
  { q: 'An error message is usually…', answers: ['A clue to the fix', 'Always your fault', 'Safe to ignore'], correct: 0 },
  { q: 'Good variable names describe…', answers: ['What the thing is', 'The weather', 'Random letters'], correct: 0 },
];

const fromPack = activePack.arcade || {};

export const ARCADE_TIPS = fromPack.tips && fromPack.tips.length ? fromPack.tips : DEFAULT_TIPS;
export const ARCADE_QUIZ = fromPack.quiz && fromPack.quiz.length ? fromPack.quiz : DEFAULT_QUIZ;

// Build the tip + quiz pool for a focus mission. Mission-specific content
// (pack.arcade.byMission[id]) is mixed with the general pool so the arcade
// leans into what you're working on right now but still varies.
export function poolFor(missionId) {
  const m = (fromPack.byMission || {})[missionId];
  if (!m) return { tips: ARCADE_TIPS, quiz: ARCADE_QUIZ };
  return {
    tips: [...(m.tips || []), ...ARCADE_TIPS],
    quiz: [...(m.quiz || []), ...ARCADE_QUIZ],
  };
}

export const GAMES = [
  { key: 'clicker', label: 'Focus Forge', tag: 'Clicker', desc: 'Tap to charge the core. Flashcards between combos.' },
  { key: 'shooter', label: 'Quiz Blaster', tag: 'Shooter', desc: 'Shoot the right answer before it lands.' },
  { key: 'tetris', label: 'Block Stack', tag: 'Tetris', desc: 'Clear lines. Learn a tip on every clear.' },
];

// --- High scores (per device) ---------------------------------------------
const KEY = 'dojo.arcade.scores';

export function getScores() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

// Save `score` for `game` if it beats the stored best. Returns the best score.
export function saveScore(game, score) {
  const scores = getScores();
  const best = Math.max(scores[game] || 0, Math.round(score) || 0);
  scores[game] = best;
  try {
    localStorage.setItem(KEY, JSON.stringify(scores));
  } catch {
    /* ignore storage failures */
  }
  return best;
}

export const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
