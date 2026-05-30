// UI-facing menu for the Quency chat, derived from the active pack. The real
// model IDs and full system prompts live in the pack (packs/*.js) and are used
// server-side in /api/chat.js — this just exposes the labels the dropdowns need.

import { activePack } from '../../packs/index.js';

export const ACTIVE_PACK_ID = activePack.id;

export const MODEL_OPTIONS = activePack.modelOptions.map(({ key, label, note }) => ({ key, label, note }));

export const MODE_OPTIONS = activePack.modes.map(({ key, label, note }) => ({ key, label, note }));

// Where the front-end sends chat requests. Same-origin /api/chat by default
// (the Vercel serverless function); override with VITE_AI_PROXY_URL if needed.
export const CHAT_ENDPOINT = import.meta.env.VITE_AI_PROXY_URL
  ? `${import.meta.env.VITE_AI_PROXY_URL.replace(/\/$/, '')}/chat`
  : '/api/chat';
