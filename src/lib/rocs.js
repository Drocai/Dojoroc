// ---------------------------------------------------------------------------
// ROCS — the trainable LLM companion characters.
//
// A gym (pack/room) is a KNOWLEDGE container; a Roc is the character you train
// inside it. Each Roc carries its own memory, toolkit, personality, belt (XP),
// abilities, and wardrobe — so different Rocs trained in different gyms end up
// with different "data". Rocs live on profile.data.rocs; the active one travels
// with you and powers the chat. Belts reuse the shared rank ladder.
// ---------------------------------------------------------------------------
import { rankFor, beltIndex } from './rank';

export const RARITIES = {
  common: { label: 'Common', color: 'zinc' },
  uncommon: { label: 'Uncommon', color: 'emerald' },
  rare: { label: 'Rare', color: 'blue' },
  epic: { label: 'Epic', color: 'purple' },
  legendary: { label: 'Legendary', color: 'amber' },
};

// The Bestiary — species drawn from the Spout Roc roster. `feature` drives the
// procedural SVG look until real sprites drop in (sprite: url, optional).
export const BESTIARY = [
  { key: 'zen-pebble', name: 'Zen Pebble', title: 'The Calm', rarity: 'common', color: 'cyan', feature: 'topknot', persona: 'calm-sensei', blurb: 'Patient and steady. Learns deeply, never rushes.' },
  { key: 'makiwara-rock', name: 'Makiwara Rock', title: 'The Grinder', rarity: 'common', color: 'amber', feature: 'band', persona: 'strict-master', blurb: 'Reps over everything. Drills until it sticks.' },
  { key: 'nunchuck-rocks', name: 'Nunchuck Rocks', title: 'The Quick', rarity: 'uncommon', color: 'emerald', feature: 'nunchuck', persona: 'hype-coach', blurb: 'Fast and playful. Loves quizzes and combos.' },
  { key: 'bo-staffali', name: 'Bo Staffali', title: 'The Disciplined', rarity: 'uncommon', color: 'blue', feature: 'staff', persona: 'calm-sensei', blurb: 'Balanced and precise. Great for step-by-step.' },
  { key: 'smash-boulder', name: 'Smash Boulder', title: 'The Mighty', rarity: 'rare', color: 'rose', feature: 'horns', persona: 'hype-coach', blurb: 'Big energy. Powers through hard challenges.' },
  { key: 'sumo-bava', name: 'Sumo Bava', title: 'The Immovable', rarity: 'rare', color: 'amber', feature: 'belt2', persona: 'strict-master', blurb: 'Grounded and tough. Holds knowledge firm.' },
  { key: 'ninja-obsidian', name: 'Ninja Obsidian', title: 'The Shadow', rarity: 'epic', color: 'purple', feature: 'mask', persona: 'trickster', blurb: 'Sharp and clever. Finds the elegant shortcut.' },
  { key: 'guardian-gargoyle', name: 'Guardian Gargoyle', title: 'The Protector', rarity: 'epic', color: 'blue', feature: 'wings', persona: 'strict-master', blurb: 'Loyal and wise. Guards everything you teach it.' },
  { key: 'pa-geode', name: 'Pa Geode', title: 'The Bright', rarity: 'rare', color: 'purple', feature: 'crystal', persona: 'curious', blurb: 'Curious and crystalline. Sparks new ideas.' },
  { key: 'sensei-stone', name: 'Sensei Stone', title: 'The Master', rarity: 'legendary', color: 'emerald', feature: 'beard', persona: 'calm-sensei', blurb: 'The grandmaster. Carries the deepest wisdom.' },
];

export const SPECIES = Object.fromEntries(BESTIARY.map((s) => [s.key, s]));
// Free starters anyone can adopt now; the rest unlock via play later.
export const STARTER_KEYS = ['zen-pebble', 'makiwara-rock', 'nunchuck-rocks', 'bo-staffali'];

// Personalities — toggleable voices injected into the chat system prompt.
export const PERSONAS = {
  'calm-sensei': { label: 'Calm Sensei', emoji: '🧘', note: 'patient, grounded', prompt: 'Speak calmly and patiently, like a wise sensei. One small step at a time, warm and encouraging.' },
  'hype-coach': { label: 'Hype Coach', emoji: '🔥', note: 'high energy', prompt: 'Be high-energy and hyped, like a pumped-up coach. Short punchy lines, celebrate every win loudly.' },
  'trickster': { label: 'Trickster', emoji: '🥷', note: 'playful, clever', prompt: 'Be playful and clever, a bit mischievous. Use fun analogies and the occasional joke while still teaching.' },
  'strict-master': { label: 'Strict Master', emoji: '🥋', note: 'tough, focused', prompt: 'Be a disciplined, no-nonsense master. Direct and focused, high standards, but fair and supportive.' },
  'curious': { label: 'Curious Explorer', emoji: '🔭', note: 'wondering', prompt: 'Be curious and wondering. Ask great questions and explore ideas together with genuine excitement.' },
};

// Abilities unlock by belt tier (see rank BELTS). Belt-gated game-y powers.
export const ABILITIES = [
  { key: 'explain', label: 'Explain Simply', desc: 'Re-explain anything like you are 10.', belt: 0 },
  { key: 'quiz', label: 'Quiz Me', desc: 'Fire a quick quiz on the topic.', belt: 1 },
  { key: 'hint', label: 'Nudge', desc: 'Get a hint without the full answer.', belt: 2 },
  { key: 'challenge', label: 'Challenge', desc: 'Set a tougher practice task.', belt: 4 },
  { key: 'distill', label: 'Imprint', desc: 'Save what you learned to memory.', belt: 6 },
];

// Extra personalities a Roc unlocks as its belt climbs (beyond its innate one).
export const PERSONA_UNLOCKS = ['hype-coach', 'trickster', 'calm-sensei', 'strict-master', 'curious'];

// Personalities available to a Roc now: its innate one + ones unlocked by tier.
export function availablePersonas(roc) {
  const set = new Set(roc?.personas || []);
  const sp = SPECIES[roc?.species];
  if (sp) set.add(sp.persona);
  const tier = rocTier(roc);
  PERSONA_UNLOCKS.slice(0, Math.min(PERSONA_UNLOCKS.length, Math.floor(tier / 2))).forEach((p) => set.add(p));
  return [...set];
}

// One-tap ability → prompt template the Roc runs. 'imprint' is handled inline.
export const ABILITY_PROMPTS = {
  explain: 'Re-explain the last thing simply, like I am 10, with a quick example.',
  quiz: 'Quiz me with 3 short questions on what we are learning. Ask them one at a time and wait for my answer.',
  hint: 'Give me a small hint to move forward — not the full answer.',
  challenge: 'Set me a slightly harder practice challenge on this topic, with clear success criteria.',
};

// Wardrobe — cosmetic layers RocAvatar can draw, unlocked by belt tier. Owned
// automatically once the tier is reached; equip is stored on roc.wardrobe.
export const WARDROBE = [
  { key: 'headband', label: 'Headband', belt: 0, slot: 'head' },
  { key: 'shades', label: 'Shades', belt: 1, slot: 'face' },
  { key: 'scarf', label: 'Scarf', belt: 2, slot: 'neck' },
  { key: 'cape', label: 'Cape', belt: 3, slot: 'back' },
  { key: 'halo', label: 'Halo', belt: 5, slot: 'head' },
  { key: 'crown', label: 'Crown', belt: 7, slot: 'head' },
];

export const ownedCosmetics = (roc) => WARDROBE.filter((w) => rocTier(roc) >= w.belt);

let _seq = 0;
const newId = () => `roc_${Date.now().toString(36)}${(_seq++).toString(36)}`;

export function makeRoc(speciesKey, name, color) {
  const sp = SPECIES[speciesKey] || BESTIARY[0];
  return {
    id: newId(),
    species: sp.key,
    name: name || sp.name,
    color: color || sp.color,
    xp: 0,
    persona: sp.persona,
    personas: [sp.persona],
    memory: { about: '', goals: [], facts: [] },
    toolkit: [],
    wardrobe: { equipped: [], owned: [] },
    trained: {},
    createdAt: Date.now(),
  };
}

export const rocBelt = (roc) => rankFor(roc?.xp || 0);
export const rocTier = (roc) => beltIndex(roc?.xp || 0);
export const unlockedAbilities = (roc) => ABILITIES.filter((a) => rocTier(roc) >= a.belt);

// Persona + per-Roc memory block prepended to the chat system prompt.
export function buildRocPrompt(roc, { roomName, roomSubject } = {}) {
  if (!roc) return '';
  const p = PERSONAS[roc.persona];
  const goals = (roc.memory?.goals || []).filter(Boolean);
  const facts = (roc.memory?.facts || []).filter(Boolean);
  const moves = (roc.toolkit || []).filter((t) => t && t.title);
  const L = [`\n\n[You are ${roc.name}, a ${SPECIES[roc.species]?.name || 'Roc'} — a companion the student is training. ${rocBelt(roc).name}.]`];
  if (p) L.push(`Personality: ${p.prompt}`);
  if (roomName || roomSubject) L.push(`Training gym: ${roomName || ''}${roomSubject ? ` — ${roomSubject}` : ''}.`);
  if (roc.memory?.about) L.push(`About the student: ${roc.memory.about}`);
  if (goals.length) L.push(`Their goals:\n- ${goals.join('\n- ')}`);
  if (facts.length) L.push(`Remember about them:\n- ${facts.join('\n- ')}`);
  if (moves.length) L.push(`Moves in your toolkit:\n- ${moves.map((m) => `${m.title}: ${String(m.body || '').slice(0, 120)}`).join('\n- ')}`);
  L.push('Stay in character, keep continuity across sessions, and teach this gym\'s subject in your own voice.');
  let out = L.join('\n');
  while (out.length > 3400 && L.length > 3) { L.splice(L.length - 2, 1); out = L.join('\n'); }
  return out;
}

// Migration: ensure a roster exists. Re-homes legacy account memory/toolkit into
// a starter Roc. Returns possibly-new data + whether it changed.
export function ensureRocs(data = {}) {
  if (data.rocs && data.activeRocId && data.rocs[data.activeRocId]) return { data, changed: false };
  const roc = makeRoc('zen-pebble');
  if (data.quency) roc.memory = { about: data.quency.about || '', goals: data.quency.goals || [], facts: data.quency.facts || [] };
  if (Array.isArray(data.techniques)) roc.toolkit = data.techniques;
  roc.xp = Object.values(data.rooms || {}).reduce((s, r) => s + (r.xp || 0) + (r.bonusXp || 0), 0);
  roc.trained = Object.fromEntries(Object.keys(data.rooms || {}).map((k) => [k, { xp: (data.rooms[k].xp || 0) + (data.rooms[k].bonusXp || 0) }]));
  return { data: { ...data, rocs: { [roc.id]: roc }, activeRocId: roc.id }, changed: true };
}
