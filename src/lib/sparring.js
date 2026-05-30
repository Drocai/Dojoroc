// Roc Sparring — a light, fun turn-based duel between your active Roc and an
// opponent Roc. Deterministic-ish: power comes from belt tier + a stamina pool
// + small luck, nudged by personality. Pure functions so it's easy to test and
// has no UI/network deps. Winning earns the Roc XP (awarded by the caller).
import { rocTier, SPECIES, PERSONAS, makeRoc, BESTIARY } from './rocs';

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];

// Each Roc starts with HP scaled by belt; moves do tier-based damage + variance.
export function initBout(you, foe) {
  // Higher HP-to-damage ratio → longer bouts (6-10 turns), so the first-strike
  // edge fades and the foe's tier genuinely matters.
  const hp = (r) => 70 + rocTier(r) * 16;
  return {
    you: { roc: you, hp: hp(you), max: hp(you) },
    foe: { roc: foe, hp: hp(foe), max: hp(foe) },
    log: [`${you.name} faces ${foe.name}!`],
    turn: 'you',
    over: false,
    winner: null,
  };
}

// Move set — flavored, with different damage/variance profiles.
export const MOVES = [
  { key: 'strike', label: 'Strike', base: 9, var: 5, note: 'reliable' },
  { key: 'focus', label: 'Focus Blow', base: 14, var: 9, note: 'big but swingy' },
  { key: 'guard', label: 'Guard & Jab', base: 5, var: 3, heal: 6, note: 'chip + recover' },
];

const taunt = (roc, kind) => {
  const p = roc.persona || SPECIES[roc.species]?.persona;
  const L = {
    hit: { 'hype-coach': 'BOOM! 🔥', trickster: 'Too slow 😏', 'calm-sensei': 'Precise.', 'strict-master': 'Again.', curious: 'Ooh, direct hit!' },
    crit: { 'hype-coach': 'MEGA HIT!! ⚡', trickster: 'Style points 😎', 'calm-sensei': 'Center mass.', 'strict-master': 'Decisive.', curious: 'Whoa, huge!' },
    win: { 'hype-coach': 'CHAMPION! 🏆', trickster: 'Naturally.', 'calm-sensei': 'Balance wins.', 'strict-master': 'Bow.', curious: 'We did it!' },
  };
  return (L[kind] || {})[p] || (kind === 'win' ? 'Victory!' : 'Hit!');
};

// Apply one attack from attacker→defender. Returns { dmg, crit, heal, text }.
function attack(attacker, move) {
  const tier = rocTier(attacker.roc);
  const crit = rnd(100) < 12 + tier * 2;
  let dmg = move.base + tier * 2 + rnd(move.var + 1);
  if (crit) dmg = Math.round(dmg * 1.6);
  return { dmg, crit, heal: move.heal || 0 };
}

// Player picks a move; we resolve their turn then the foe's auto-turn.
export function playTurn(state, moveKey) {
  if (state.over) return state;
  const s = structuredCloneSafe(state);
  const move = MOVES.find((m) => m.key === moveKey) || MOVES[0];

  // Your attack.
  const a = attack(s.you, move);
  s.foe.hp = Math.max(0, s.foe.hp - a.dmg);
  if (a.heal) s.you.hp = Math.min(s.you.max, s.you.hp + a.heal);
  s.log.push(`${s.you.roc.name} used ${move.label} — ${a.dmg} dmg${a.crit ? ' (CRIT! ' + taunt(s.you.roc, 'crit') + ')' : ` · ${taunt(s.you.roc, 'hit')}`}${a.heal ? `, +${a.heal} HP` : ''}.`);
  if (s.foe.hp <= 0) return finish(s, 'you');

  // Foe auto-attack (favors Focus Blow when ahead, Guard when low).
  const foeMove = s.foe.hp < s.foe.max * 0.35 ? MOVES[2] : pick(MOVES);
  const b = attack(s.foe, foeMove);
  s.foe.hp = Math.min(s.foe.max, s.foe.hp + (foeMove.heal || 0));
  s.you.hp = Math.max(0, s.you.hp - b.dmg);
  s.log.push(`${s.foe.roc.name} used ${foeMove.label} — ${b.dmg} dmg.`);
  if (s.you.hp <= 0) return finish(s, 'foe');

  return s;
}

function finish(s, winner) {
  s.over = true;
  s.winner = winner;
  const champ = winner === 'you' ? s.you.roc : s.foe.roc;
  s.log.push(`🏁 ${champ.name} wins! ${taunt(champ, 'win')}`);
  return s;
}

// XP reward for a win, scaled by the foe's tier (tougher foe → more XP).
export const boutReward = (foe) => 30 + rocTier(foe) * 15;

// Build a themed opponent at roughly a target belt tier.
export function makeOpponent(targetTier = 0) {
  const sp = pick(BESTIARY);
  const foe = makeRoc(sp.key);
  foe.name = `${sp.title.replace('The ', '')} ${sp.name.split(' ')[0]}`;
  // Seed XP so the foe sits near the target tier.
  const xpForTier = [0, 300, 700, 1200, 2000, 3000, 4500, 6500, 9000];
  foe.xp = xpForTier[Math.min(targetTier, xpForTier.length - 1)] + rnd(150);
  return foe;
}

// structuredClone exists in modern runtimes; fall back for safety.
function structuredCloneSafe(o) {
  try { return structuredClone(o); } catch { return JSON.parse(JSON.stringify(o)); }
}
