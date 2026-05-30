// Daily Quests — a small rotating set of goals that refresh each day, pulling
// the player through the core loops (clear missions, win spars, train, switch
// gyms). Progress lives on profile.data.quests = { day, items:{id:count}, claimed:[] }.
// Pure + date-local so it's testable and SSR-safe.

const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// The full pool. Each daily set picks a few. `event` matches the action bus.
export const QUEST_POOL = [
  { id: 'clear2', label: 'Clear 2 missions', event: 'mission', goal: 2, xp: 60 },
  { id: 'clear1', label: 'Clear a mission', event: 'mission', goal: 1, xp: 30 },
  { id: 'spar1', label: 'Win a sparring match', event: 'spar', goal: 1, xp: 50 },
  { id: 'spar2', label: 'Win 2 spars', event: 'spar', goal: 2, xp: 90 },
  { id: 'arcade1', label: 'Score in the arcade', event: 'arcade', goal: 1, xp: 30 },
  { id: 'arcade3', label: 'Play 3 arcade rounds', event: 'arcade', goal: 3, xp: 70 },
];

// Deterministic daily pick (3 quests) seeded by the date, so everyone on the
// same day sees a stable set that rotates day to day.
function dailyPick(day) {
  let seed = 0;
  for (let i = 0; i < day.length; i++) seed = (seed * 31 + day.charCodeAt(i)) >>> 0;
  const pool = [...QUEST_POOL];
  const out = [];
  for (let n = 0; n < 3 && pool.length; n++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    out.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return out;
}

// Today's quest list (definitions only — progress comes from state).
export const todaysQuests = () => dailyPick(dayKey());

// Ensure quest state is for today; resets at the day boundary.
export function freshQuests(q = {}) {
  const day = dayKey();
  if (q.day === day) return q;
  return { day, items: {}, claimed: [] };
}

// Record progress for an event kind; returns new state (or same if no quest
// uses that event today).
export function recordQuest(q, eventKind, amount = 1) {
  const state = freshQuests(q);
  const active = todaysQuests().filter((x) => x.event === eventKind);
  if (!active.length) return state;
  const items = { ...state.items };
  active.forEach((x) => { items[x.id] = Math.min(x.goal, (items[x.id] || 0) + amount); });
  return { ...state, items };
}

export const questProgress = (q, quest) => Math.min(quest.goal, (q?.items?.[quest.id] || 0));
export const isComplete = (q, quest) => questProgress(q, quest) >= quest.goal;
export const isClaimed = (q, quest) => (q?.claimed || []).includes(quest.id);
export const claimable = (q, quest) => isComplete(q, quest) && !isClaimed(q, quest);

// Mark a quest claimed (caller awards the XP). Returns new state.
export function claimQuest(q, questId) {
  const state = freshQuests(q);
  if (state.claimed.includes(questId)) return state;
  return { ...state, claimed: [...state.claimed, questId] };
}

export { dayKey };
