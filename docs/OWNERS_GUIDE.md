# 🛠️ Owner's Operating Guide

Everything you need to run, show, and extend the Spout Roc Dojo.

**Live:** https://dojoroc-dojoroc.vercel.app
**Repo:** drocai/Dojoroc (branch `claude/project-status-overview-lnIRi`, deployed via Vercel)

---

## The docs in this folder
- **PROJECT_OVERVIEW.md** — what it is + full feature blueprint + tech architecture.
- **GETTING_STARTED.md** — how a player uses it (hand this to Graysen).
- **SHARE.md** — copy/paste messages to send people.
- **STRIPE_SETUP.md** — turn on paid "Pro" tier (optional).
- **roc-sprite-checklist.html** — give to an artist to make custom Roc art.

## How it's hosted
- Pushing to the repo auto-deploys to Vercel (production = `main`).
- Database is Supabase; AI is Claude via the `ANTHROPIC_API_KEY` env var in Vercel.
- The site already works on a fresh deploy — keys for AI are set.

## Common things you'll want to do

### Reset someone's password
If a player loses both password and recovery code, run this in Supabase SQL
(replace the username): it clears them so they can sign up fresh, or set a new hash.
Easiest: just have them make a new profile. (Their old one stays untouched.)

### Add custom Roc art
1. Open `docs/roc-sprite-checklist.html` in a browser — it lists every Roc + the exact
   filename to use.
2. Export transparent square PNGs named e.g. `zen-pebble.png`.
3. Drop them in `src/assets/rocs/`. They swap in automatically — no code changes.

### Add a new gym (subject)
Copy any `packs/*Data.js` file, change the subject/missions/sensei/arcade, and add it to
`BUILTIN_PACKS` in `packs/index.js`. It appears on the Dojo Map automatically. (Or let
users build gyms in-app via the Rooms → New Room button.)

### Turn on paid Pro
Follow `STRIPE_SETUP.md` (3 steps: create a Stripe price, add env vars, register the
webhook). Pro gates legendary Rocs + exclusive wardrobe; off by default.

## What's free vs. what costs you
- Hosting (Vercel) and database (Supabase) have generous free tiers.
- The only metered cost is **Claude API usage** (the AI chats) — billed to your Anthropic
  key. Light family use is very cheap; the app defaults to fast/cheap models where it can.

## Safety
- Every AI room has a kid-safe rules suffix appended server-side.
- Passwords are bcrypt-hashed; all DB writes go through locked-down RPCs; row-level
  security is on. No admin keys are exposed to the browser.

## Quick troubleshooting
- **AI says "missing key"** → set `ANTHROPIC_API_KEY` in Vercel and redeploy.
- **Chat/leaderboard offline** → Supabase env vars; defaults are baked in and public-safe.
- **Stripe button says "not configured"** → expected until you add Stripe env vars.
