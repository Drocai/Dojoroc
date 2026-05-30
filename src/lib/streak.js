// Daily training streak. Pure, timezone-local date math so it stays testable
// and SSR-safe. Carried on the profile (data.streak) so it follows the learner.
const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// Given the stored streak, return the streak after a visit "today".
// - same day  -> unchanged
// - yesterday -> +1
// - older/none -> reset to 1
export function bumpStreak(streak = {}) {
  const today = dayKey();
  if (streak.last === today) return streak;
  const yesterday = dayKey(new Date(Date.now() - 864e5));
  const count = streak.last === yesterday ? (streak.count || 0) + 1 : 1;
  return { count, best: Math.max(streak.best || 0, count), last: today };
}

// Quest-reward multiplier from the current streak: +10% per day, capped at 2x.
// (1 day → 1.0x, 2 → 1.1x, … 11+ → 2.0x.) Keeps showing up paying off.
export function streakMultiplier(streak = {}) {
  return Math.min(2, 1 + Math.max(0, (streak.count || 0) - 1) * 0.1);
}

// Label for the bonus, e.g. "+30%" (empty on day 1 / no bonus).
export function streakBonusLabel(streak = {}) {
  const pct = Math.round((streakMultiplier(streak) - 1) * 100);
  return pct > 0 ? `+${pct}%` : '';
}
