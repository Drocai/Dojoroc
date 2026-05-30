// Builds the "personal memory" block that gets prepended to Quency's system
// prompt, so your Quency remembers who you are, what you're learning, and the
// facts you've taught it — across every room and device. This travels with the
// profile (profile.data.quency), which is the heart of "training your own
// Quency that comes with you."

export function buildMemoryBlock({ displayName, quency = {}, techniques = [], roomName, roomSubject } = {}) {
  const goals = (quency.goals || []).filter(Boolean);
  const facts = (quency.facts || []).filter(Boolean);
  const moves = (techniques || []).filter((t) => t && t.title);
  const lines = ['\n\n[Who you are helping — your persistent memory of this student]'];
  if (displayName) lines.push(`Name: ${displayName}. Greet them by name and stay personal.`);
  if (roomName || roomSubject) lines.push(`Current room: ${roomName || ''}${roomSubject ? ` — ${roomSubject}` : ''}.`);
  if (quency.about) lines.push(`About them: ${quency.about}`);
  if (goals.length) lines.push(`Their learning goals:\n- ${goals.join('\n- ')}`);
  if (facts.length) lines.push(`Things to remember about them:\n- ${facts.join('\n- ')}`);
  if (moves.length) lines.push(`Moves in their toolkit (reuse/reference these):\n- ${moves.map((m) => `${m.title}: ${String(m.body || '').slice(0, 120)}`).join('\n- ')}`);
  lines.push('Use this to tailor help and keep continuity across sessions, as if you remember them.');
  // Trim whole lines (never mid-fact) to stay within a sane budget.
  let out = lines.join('\n');
  while (out.length > 3200 && lines.length > 2) {
    lines.splice(lines.length - 2, 1); // drop the second-to-last detail line
    out = lines.join('\n');
  }
  return out;
}
