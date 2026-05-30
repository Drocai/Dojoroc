import Anthropic from '@anthropic-ai/sdk';
import { getPack } from '../packs/index.js';

// Models + per-mode system prompts now come from the active pack so a new
// learnable system is purely a config change (packs/*.js) — no edits here.

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

  // Vercel parses JSON bodies automatically for the Node runtime.
  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const { message, history = [], model = 'opus', mode, pack: packId } = body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" in request body.' });
  }

  const pack = getPack(packId);

  // Build the friendly-key -> real-model-id map and the mode map from the pack.
  const modelMap = Object.fromEntries(pack.modelOptions.map((m) => [m.key, m.id]));
  const modeMap = Object.fromEntries(pack.modes.map((m) => [m.key, m]));
  const defaultMode = pack.modes[0];

  const modelId = modelMap[model] || pack.modelOptions[0].id;
  const modeConfig = modeMap[mode] || defaultMode;

  // Keep only valid prior turns, cap history so the request stays small/fast.
  const priorTurns = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  // The Anthropic API requires the first message to be from the user. The UI's
  // opening greeting is an assistant turn, so drop any leading assistant turns.
  while (priorTurns.length && priorTurns[0].role === 'assistant') priorTurns.shift();

  const messages = [...priorTurns, { role: 'user', content: message.slice(0, 8000) }];

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 1500,
      // Snappy chat: thinking off keeps responses fast and inside the function timeout.
      thinking: { type: 'disabled' },
      // System prompt as a cacheable block (prompt caching engages once the prompt is large enough).
      system: [{ type: 'text', text: modeConfig.system, cache_control: { type: 'ephemeral' } }],
      messages,
    });

    const reply = (response.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return res.status(200).json({
      reply: reply || "I didn't catch that — try asking again.",
      model: response.model,
      mode: modeConfig.key,
    });
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
