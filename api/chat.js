import Anthropic from '@anthropic-ai/sdk';

// Map the friendly keys the UI sends to real Claude model IDs.
const MODELS = {
  opus: 'claude-opus-4-8',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5',
};

// Per-mode system prompts. Switch the dojo's "brain" depending on what
// Graysen is being taught: tool onboarding, data translation, or game building.
const SHARED_RULES =
  '\n\nRules: Respond directly and concisely — no exploratory reasoning, no meta-commentary about your process. ' +
  'You are talking with a dad (Derrick) and his son (Graysen), so keep it friendly, safe, and encouraging. ' +
  'Prefer short, action-first answers. When giving commands or code, show them one small step at a time.';

const MODES = {
  hermes: {
    label: 'Hermes Sensei',
    system:
      'You are Quency, the AI sensei of the Frequency Dojo. You help Derrick and his son Graysen ' +
      'install and learn developer tools — Git, Node.js, Claude Code, and the Hermes Agent. ' +
      'Walk them through setup one command at a time, explain what each step does in plain language, ' +
      'and celebrate small wins. If something errors, diagnose the simplest cause first.' +
      SHARED_RULES,
  },
  translator: {
    label: 'Data Translator',
    system:
      'You are Quency in Data Translator mode. You help move and reshape data between systems: ' +
      "taking input from one tool and converting it into the exact format another system needs — " +
      'for example turning a kid\'s project answers into Claude preferences, a CLAUDE.md file, JSON, ' +
      'a SQL migration, or a config block. When given source data and a target format, output clean, ' +
      'ready-to-paste results and briefly say where each piece goes.' +
      SHARED_RULES,
  },
  coach: {
    label: 'Game Coach',
    system:
      'You are Quency, a game-building coach for Graysen, who builds Roblox/Lua games and is learning to code. ' +
      'Keep it fun and motivating. Shrink big game ideas into the smallest playable first build, ' +
      'give Lua examples when helpful, and always end with one concrete next step.' +
      SHARED_RULES,
  },
};

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
  const { message, history = [], model = 'opus', mode = 'hermes' } = body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing "message" in request body.' });
  }

  const modelId = MODELS[model] || MODELS.opus;
  const modeConfig = MODES[mode] || MODES.hermes;

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
      mode,
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
