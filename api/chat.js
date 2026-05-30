import Anthropic from '@anthropic-ai/sdk';
import { getPack, STANDARD_MODELS } from '../packs/index.js';

// Models come from the standard set. The system prompt comes from the active
// room: for user-created rooms (which live in Supabase, not on the server) the
// client sends the selected mode's `system` text; for built-in rooms we can
// resolve it from the pack id. Either way a safety suffix is appended so every
// room — including ones Quency generated — stays kid-safe and on-task.

const MODEL_MAP = Object.fromEntries(STANDARD_MODELS.map((m) => [m.key, m.id]));

const SAFETY_SUFFIX =
  '\n\n[Operating rules: You are tutoring inside a family learning app used by a parent and their child. ' +
  'Keep every response age-appropriate, safe, kind, and focused on learning the room\'s subject. ' +
  'Never produce unsafe, explicit, or harmful content. If asked to, refuse briefly and redirect to learning.]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'The Quency proxy is missing ANTHROPIC_API_KEY. Add it in the Vercel project settings (Environment Variables) and redeploy.',
    });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const { message, history = [], model = 'opus', mode, pack: packId, system: clientSystem } = body;
  const maxTokens = Math.min(4000, Math.max(256, Number(body.maxTokens) || 1500));

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" in request body.' });
  }

  // Prefer a client-supplied system prompt (user-created rooms); otherwise fall
  // back to a built-in room's mode. Always cap + add the safety suffix.
  let systemText;
  if (typeof clientSystem === 'string' && clientSystem.trim()) {
    // Room persona (up to ~6k) + the learner's personal memory block — give it
    // enough headroom that memory is never silently truncated.
    systemText = clientSystem.slice(0, 12000) + SAFETY_SUFFIX;
  } else {
    const pack = getPack(packId);
    const modeConfig = pack.modes.find((m) => m.key === mode) || pack.modes[0];
    systemText = modeConfig.system + SAFETY_SUFFIX;
  }

  const modelId = MODEL_MAP[model] || MODEL_MAP.opus;

  const priorTurns = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  // The Anthropic API requires the first message to be from the user.
  while (priorTurns.length && priorTurns[0].role === 'assistant') priorTurns.shift();

  const messages = [...priorTurns, { role: 'user', content: message.slice(0, 8000) }];

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: maxTokens,
      thinking: { type: 'disabled' },
      system: [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral' } }],
      messages,
    });

    const reply = (response.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return res.status(200).json({ reply: reply || "I didn't catch that — try asking again.", model: response.model });
  } catch (err) {
    const status = err?.status || 500;
    const detail = err?.message || 'Unknown error talking to Claude.';
    return res.status(status).json({ error: `Quency had trouble: ${detail}` });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
