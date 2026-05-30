// Belt ranks from total XP earned across every room — the spine of a learner's
// growing portfolio. Carries with the profile, not the room.

const BELTS = [
  { min: 0, name: 'White Belt' },
  { min: 300, name: 'Yellow Belt' },
  { min: 700, name: 'Orange Belt' },
  { min: 1200, name: 'Green Belt' },
  { min: 2000, name: 'Blue Belt' },
  { min: 3000, name: 'Purple Belt' },
  { min: 4500, name: 'Brown Belt' },
  { min: 6500, name: 'Black Belt' },
  { min: 9000, name: 'Sensei' },
];

export { BELTS };

// Zero-based belt tier for an XP total (used to gate Roc abilities/cosmetics).
export function beltIndex(xp = 0) {
  let i = 0;
  for (let n = 0; n < BELTS.length; n++) if (xp >= BELTS[n].min) i = n;
  return i;
}

export function rankFor(xp = 0) {
  let cur = BELTS[0];
  let next = null;
  for (let i = 0; i < BELTS.length; i++) {
    if (xp >= BELTS[i].min) {
      cur = BELTS[i];
      next = BELTS[i + 1] || null;
    }
  }
  const span = next ? next.min - cur.min : 1;
  const pct = next ? Math.min(100, Math.round(((xp - cur.min) / span) * 100)) : 100;
  return { name: cur.name, next: next?.name || null, pct, toNext: next ? next.min - xp : 0 };
}
