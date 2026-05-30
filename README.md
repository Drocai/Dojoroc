# Frequency Dojo v2

A gamified, real-time co-op dashboard that teaches Graysen to build games and use
developer tools — built for Derrick & Graysen.

## Screens
- **Missions** — co-op task tracking (Derrick + Graysen) with the reactive Dojo Core visual
- **Quency AI** — a real Claude-powered chat with **model switching** (Opus 4.8 / Sonnet 4.6 /
  Haiku 4.5) and **mode switching**: Hermes Sensei (tool setup), Data Translator (convert data
  between systems), and Game Coach (Roblox/Lua)
- **Dad ↔ Graysen** — live Supabase chat room so they can talk while building
- **Handoff Kit** — turns a kid's plain answers into Claude preferences, project instructions,
  and a CLAUDE.md, with optional AI Polish and one-click submit to Dad
- **Docked chat** — a floating chat available on *every* screen, so whoever is in the shared
  project room can talk while they work without leaving what they're doing

## Packs — swappable learnable systems

The dojo is a reusable engine. Everything it teaches — the branding, the players, the missions,
Quency's modes **and the AI prompts behind them**, and the Handoff questionnaire — lives in a
single **pack** file under [`packs/`](packs/). The app shell never hard-codes the subject.

To create a new learnable system (e.g. a game you're building together):

1. Copy [`packs/frequency-dojo.js`](packs/frequency-dojo.js) to `packs/<your-pack>.js` and edit
   the content (brand, players, missions, Quency modes/prompts, handoff questions).
2. Register it in [`packs/index.js`](packs/index.js) (`import` it and add it to `PACKS`).
3. Set `VITE_DOJO_PACK=<your-pack>` to make it the active one (defaults to `frequency-dojo`).

Both the front-end and the serverless AI proxy (`/api/chat`) read from the same pack, so the
teaching content and the model/prompt config stay in one place. Color re-skinning is driven by
each player's `color` and the pack's `brand.accent` (see [`src/lib/theme.js`](src/lib/theme.js)).

## Tech Stack
- React + Vite + Tailwind CSS
- Supabase (Postgres + Realtime) — `dojo_sessions`, `chat_messages`, `graysen_handoff_packets`
- Anthropic Claude via a Vercel serverless proxy (`/api/chat`)
- lucide-react

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app works with no config thanks to built-in public Supabase defaults. Quency chat
requires the serverless proxy + an API key (see below).

## Quency AI proxy

`/api/chat.js` is a Vercel serverless function that calls the Anthropic Messages API.
It keeps the API key server-side, supports model + per-mode system prompts, multi-turn
history, and prompt caching on the system prompt.

To enable Quency: add **`ANTHROPIC_API_KEY`** in the Vercel project's
Environment Variables (never commit it). Locally, `vercel dev` runs the function;
plain `vite dev` serves the UI but the chat will report the proxy is unavailable.

## Deployment on Vercel

Auto-deploys on every push to `main`.

Environment variables:
- `ANTHROPIC_API_KEY` — **required** for Quency chat (server-side, secret)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — optional (public defaults shipped)
- `VITE_AI_PROXY_URL` — optional (defaults to same-origin `/api`)
