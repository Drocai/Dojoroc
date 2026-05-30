// UI-facing labels for the Quency chat. The actual model IDs and system
// prompts live server-side in /api/chat.js — this is just the menu.

export const MODEL_OPTIONS = [
  { key: 'opus', label: 'Opus 4.8', note: 'Smartest' },
  { key: 'sonnet', label: 'Sonnet 4.6', note: 'Balanced' },
  { key: 'haiku', label: 'Haiku 4.5', note: 'Fastest' },
];

export const MODE_OPTIONS = [
  { key: 'hermes', label: 'Hermes Sensei', note: 'Tool & Claude Code setup' },
  { key: 'translator', label: 'Data Translator', note: 'Convert data between systems' },
  { key: 'coach', label: 'Game Coach', note: 'Roblox / Lua game building' },
];

// Where the front-end sends chat requests. Same-origin /api/chat by default
// (the Vercel serverless function); override with VITE_AI_PROXY_URL if needed.
export const CHAT_ENDPOINT = import.meta.env.VITE_AI_PROXY_URL
  ? `${import.meta.env.VITE_AI_PROXY_URL.replace(/\/$/, '')}/chat`
  : '/api/chat';
