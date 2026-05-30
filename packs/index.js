// ---------------------------------------------------------------------------
// ROOM ENGINE
//
// A "room" (pack) is pure data — the built-in starter, or one Quency generated
// and saved to Supabase. This module:
//   - resolves the ACTIVE room synchronously at load (from localStorage, so a
//     reload lands you back in the same room), falling back to the starter
//   - rehydrate()s a data room into the live object the app uses (turning
//     {placeholder} templates back into handoff builders + lore lines)
//   - validatePack()s anything (including AI output) into a safe, complete room
//   - enter*()s switch rooms (cache + reload)
//
// Server-safe: guards localStorage / import.meta so api/chat.js can import it.
// ---------------------------------------------------------------------------

import { makeHandoff } from '../src/lib/handoff.js';
import frequencyDojoData from './frequencyDojoData.js';
import cosmosLabData from './cosmosLabData.js';
import numberDojoData from './numberDojoData.js';
import artDojoData from './artDojoData.js';
import soundDojoData from './soundDojoData.js';

export const BUILTIN_PACKS = [frequencyDojoData, cosmosLabData, numberDojoData, artDojoData, soundDojoData];
export const DEFAULT_PACK_ID = 'frequency-dojo';
const ACTIVE_KEY = 'dojo.activePack';

// Models are fixed (real Claude IDs) — rooms never invent these.
export const STANDARD_MODELS = [
  { key: 'opus', label: 'Opus 4.8', note: 'Smartest', id: 'claude-opus-4-8' },
  { key: 'sonnet', label: 'Sonnet 4.6', note: 'Balanced', id: 'claude-sonnet-4-6' },
  { key: 'haiku', label: 'Haiku 4.5', note: 'Fastest', id: 'claude-haiku-4-5' },
];

const hasLocal = () => typeof localStorage !== 'undefined';

const fillTemplate = (str, vars) =>
  String(str || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));

export const slugify = (s) =>
  String(s || 'room')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'room';

export const makePackId = (name) => `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;

const arr = (v) => (Array.isArray(v) ? v : []);
const str = (v, d = '') => (typeof v === 'string' && v.trim() ? v : d);

// Turn anything (partial AI output, stored room) into a complete, safe room.
export function validatePack(raw = {}) {
  const name = str(raw.name, 'New Room');
  const subject = str(raw.subject, name);
  const accent = ['emerald', 'purple', 'blue', 'amber', 'rose', 'cyan'].includes(raw?.brand?.accent)
    ? raw.brand.accent
    : 'emerald';

  let players = arr(raw.players)
    .filter((p) => p && p.key)
    .map((p) => ({
      key: slugify(p.key),
      label: str(p.label, p.key),
      chatName: str(p.chatName, str(p.label, p.key)),
      color: ['emerald', 'purple', 'blue', 'amber', 'rose', 'cyan'].includes(p.color) ? p.color : 'emerald',
      role: str(p.role, 'student'),
    }));
  if (players.length < 2) {
    players = [
      { key: 'mentor', label: 'Mentor', chatName: 'Mentor', color: 'emerald', role: 'mentor' },
      { key: 'student', label: 'Student', chatName: 'Student', color: 'purple', role: 'student' },
    ];
  }

  const missions = arr(raw.missions)
    .map((m, i) => ({
      id: slugify(m?.id || `m${i + 1}`),
      title: str(m?.title, `Mission ${i + 1}`),
      desc: str(m?.desc, ''),
      link: str(m?.link, '') || undefined,
      cmd: str(m?.cmd, '') || undefined,
      xp: Number.isFinite(m?.xp) ? m.xp : 100,
    }))
    .slice(0, 12);
  if (!missions.length) {
    missions.push({ id: 'start', title: 'First Step', desc: `Begin learning ${subject}`, xp: 100 });
  }

  let modes = arr(raw.modes)
    .filter((m) => m && m.key && m.system)
    .map((m) => ({
      key: slugify(m.key),
      label: str(m.label, m.key),
      note: str(m.note, ''),
      system: String(m.system).slice(0, 6000),
    }))
    .slice(0, 6);
  if (!modes.length) {
    modes = [
      {
        key: 'sensei',
        label: 'Sensei',
        note: subject,
        system: `You are the AI sensei for a room about ${subject}. Teach a parent and their kid one small step at a time, friendly and encouraging, action-first, and celebrate small wins.`,
      },
    ];
  }

  const a = raw.arcade || {};
  const arcade = {
    tips: arr(a.tips).filter((t) => typeof t === 'string').slice(0, 30),
    quiz: arr(a.quiz)
      .filter((q) => q && typeof q.q === 'string' && arr(q.answers).length >= 2 && Number.isInteger(q.correct))
      .map((q) => ({ q: q.q, answers: q.answers.slice(0, 4).map(String), correct: Math.min(q.correct, q.answers.length - 1) }))
      .slice(0, 30),
    byMission: a.byMission && typeof a.byMission === 'object' ? a.byMission : {},
  };

  const h = raw.handoff || {};
  const studentDefault = str(h.studentDefault, players[1]?.label || 'Student');
  const handoff = {
    studentDefault,
    projectName: str(h.projectName, `${studentDefault} Lab`),
    sheetTitle: str(h.sheetTitle, `${name.toUpperCase()} — SETUP SHEET`),
    aiPolishTemplate: str(
      h.aiPolishTemplate,
      `Turn these answers into one clean, warm "Personal preferences" block (150-220 words) telling Claude how to help {name} learn ${subject}. Output only the block text.`
    ),
    questionGroups: arr(h.questionGroups).length
      ? h.questionGroups
      : [
          {
            title: 'About you',
            items: [
              ['goal', `What do you want to learn or build in ${subject}?`, 'Say it like you would to a friend.'],
              ['level', 'How much do you already know?', 'Total beginner, some, or pretty comfortable?'],
              ['helpStyle', 'Detailed steps or quick answers?', ''],
            ],
          },
        ],
    blocks: arr(h.blocks).length
      ? h.blocks.map((b, i) => ({
          key: slugify(b?.key || `block${i + 1}`),
          title: str(b?.title, `Block ${i + 1}`),
          where: str(b?.where, ''),
          bodyTemplate: str(b?.bodyTemplate, ''),
        }))
      : [
          {
            key: 'prefs',
            title: 'Claude Profile / Preferences',
            where: 'Settings → Personal preferences',
            bodyTemplate: `You are helping {name} learn ${subject}. Keep answers short, clear, and action-first. Prefer small working steps over long theory. Goal: {goal}. Current level: {level}.`,
          },
        ],
  };

  const l = raw.lore || {};
  const lore = {
    tagline: str(l.tagline, `Learn ${subject}. One step at a time.`),
    canon: str(l.canon, `A room in the Dojo for learning ${subject} together.`),
    boot: str(l.boot, 'Room online · sensei ready'),
    emptyActivity: str(l.emptyActivity, 'No activity yet. Clear a mission or play a round to begin.'),
    levelUpTemplate: str(l.levelUpTemplate, '⚡ {name} reached Level {lvl}.'),
    arcadeXpTemplate: str(l.arcadeXpTemplate, '🎮 {name} earned {xp} XP in the arcade.'),
  };

  return {
    id: str(raw.id, makePackId(name)),
    name,
    subject,
    builtin: !!raw.builtin,
    brand: {
      title: str(raw?.brand?.title, name.toUpperCase()),
      icon: str(raw?.brand?.icon, 'Brain'),
      accent,
      coreLabel: str(raw?.brand?.coreLabel, 'CORE'),
      coreUnit: str(raw?.brand?.coreUnit, 'HZ'),
    },
    players,
    sensei: {
      name: str(raw?.sensei?.name, 'Quency'),
      title: str(raw?.sensei?.title, 'AI SENSEI'),
      greeting: str(raw?.sensei?.greeting, `Welcome. I'm your sensei for ${subject}. Ask me anything.`),
      placeholder: str(raw?.sensei?.placeholder, 'Ask anything...'),
    },
    lore,
    missions,
    modes,
    chat: { defaultRoom: slugify(raw?.chat?.defaultRoom || `${slugify(name)}-room`) },
    arcade,
    handoff,
  };
}

// Data room -> live object the app consumes.
export function rehydrate(data) {
  const d = validatePack(data);
  const handoff = makeHandoff({
    studentDefault: d.handoff.studentDefault,
    projectName: d.handoff.projectName,
    sheetTitle: d.handoff.sheetTitle,
    questionGroups: d.handoff.questionGroups,
    blocks: (p, name) =>
      d.handoff.blocks.map((b) => ({
        key: b.key,
        title: b.title,
        where: fillTemplate(b.where, { name }),
        body: fillTemplate(b.bodyTemplate, { name, ...p }),
      })),
    aiPolishPrompt: (p, name) =>
      `${fillTemplate(d.handoff.aiPolishTemplate, { name })}\n\n` +
      Object.entries(p)
        .filter(([k]) => k !== 'studentName')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n'),
  });

  return {
    ...d,
    modelOptions: STANDARD_MODELS,
    lore: {
      ...d.lore,
      levelUp: (lvl, name) => fillTemplate(d.lore.levelUpTemplate, { lvl, name }),
      arcadeXp: (xp, name) => fillTemplate(d.lore.arcadeXpTemplate, { xp, name }),
    },
    handoff,
  };
}

// Look up a built-in room by id (used server-side as a fallback).
export function getPack(id) {
  const found = BUILTIN_PACKS.find((p) => p.id === id);
  return rehydrate(found || frequencyDojoData);
}

// Resolve the active room data synchronously (cached) so module-scope reads and
// reloads stay instant. Unknown/corrupt cache -> starter.
function resolveActiveData() {
  if (hasLocal()) {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* fall through to default */
    }
  }
  return frequencyDojoData;
}

export const activePack = rehydrate(resolveActiveData());

// Switch rooms: cache the chosen room's DATA and reload into it.
export function enterPackData(data) {
  if (hasLocal()) localStorage.setItem(ACTIVE_KEY, JSON.stringify(data));
  if (typeof location !== 'undefined') location.reload();
}

// Return to the built-in starter room.
export function enterBuiltin() {
  if (hasLocal()) localStorage.removeItem(ACTIVE_KEY);
  if (typeof location !== 'undefined') location.reload();
}
