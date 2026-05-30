// Builds the "personal memory" block that gets prepended to Quency's system
// prompt, so your Quency remembers who you are, what you're learning, and the
// facts you've taught it — across every room and device. This travels with the
// profile (profile.data.quency), which is the heart of "training your own
// Quency that comes with you."

export function buildMemoryBlock({ displayName, quency = {}, roomName, roomSubject } = {}) {
  const goals = (quency.goals || []).filter(Boolean);
  const facts = (quency.facts || []).filter(Boolean);
  const lines = ['\n\n[Who you are helping — your persistent memory of this student]'];
  if (displayName) lines.push(`Name: ${displayName}. Greet them by name and stay personal.`);
  if (roomName || roomSubject) lines.push(`Current room: ${roomName || ''}${roomSubject ? ` — ${roomSubject}` : ''}.`);
  if (quency.about) lines.push(`About them: ${quency.about}`);
  if (goals.length) lines.push(`Their learning goals:\n- ${goals.join('\n- ')}`);
  if (facts.length) lines.push(`Things to remember about them:\n- ${facts.join('\n- ')}`);
  lines.push('Use this to tailor help and keep continuity across sessions, as if you remember them.');
  return lines.join('\n').slice(0, 1600);
}
