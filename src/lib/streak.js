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
