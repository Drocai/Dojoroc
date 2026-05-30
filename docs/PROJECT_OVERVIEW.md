# 🪨 The Spout Roc Dojo — Project Overview & Blueprint

**Live app:** https://dojoroc-dojoroc.vercel.app

A learning dojo where kids (and adults) train **Rocs** — collectible AI companion
characters — by exploring **gyms** (subjects). Each Roc is your own AI buddy that
remembers you, levels up belts, evolves, and travels with you everywhere. It turns
learning into a game you actually want to come back to.

---

## The Big Idea

- **Gyms = knowledge.** Each gym (dojo) is a subject: dev tools, space, math, art, music.
  A gym holds its missions, its AI sensei, its arcade, and its own hands-on tool.
- **Rocs = the companion you train.** A Roc is *yours*. It carries its own memory,
  toolkit, personality, belt rank, abilities, and wardrobe. Train different Rocs in
  different gyms and each becomes a different specialist.
- **You travel.** Walk your Roc across the Dojo Map between gyms, soaking up knowledge.
  Your belt, XP, and companion follow you on any device.

---

## What You Can Do

### 🥋 Train & Level Up
- **Missions** — clear real tasks to earn XP and raise your belt (White → … → Black → Sensei).
- **Daily Quests** — 3 rotating goals each day; keep a **streak** for up to **2× bonus XP**.
- **Arcade** — learn-while-you-wait mini-games (clicker, quiz blaster, block stack).

### 🤖 Your Roc Companion
- **Collect** 10 species (Zen Pebble, Ninja Obsidian, Sensei Stone, and more); rarer
  ones **unlock as you rank up**.
- **Personalities** — switch your Roc's voice (Calm Sensei, Hype Coach, Trickster,
  Strict Master, Curious); more unlock as it grows.
- **Abilities** — belt-gated chat powers: Explain Simply, Quiz Me, Nudge, Challenge, Imprint.
- **Wardrobe** — earn headbands, shades, capes, halos, crowns by ranking up.
- **Evolution** — your Roc visibly grows (Pebble → Disciple → Warrior → Master → Grandmaster).
- **Reactions** — it cheers, wobbles, and celebrates in its own personality when you win.
- **Gifting** — send a Roc to a friend by username; they keep all its training.

### 🧠 A Sensei That Remembers You
- Each gym has its own AI sensei (Quency, Nova, Axiom, Iris, Tempo) powered by Claude.
- Your Roc carries **personal memory** — name, goals, facts, and saved "moves" — into
  every chat, so help stays personal across sessions and devices.
- **Teach from chat / Remember this** save what matters straight into the Roc's brain.

### 🏯 The Gyms (and their hands-on tools)
| Gym | Subject | Sensei | Special Tool |
|-----|---------|--------|--------------|
| ⚡ Frequency Dojo | Dev tools + Roblox/Lua | Quency | Arcade |
| ✨ Cosmos Lab | Space & science | Nova | **Star Map** (trace constellations) |
| 🧮 Number Dojo | Math & logic | Axiom | **Math Sprint** (timed mental math) |
| 🎨 Art Dojo | Drawing & color | Iris | **Sketch Pad** (draw + save to gallery) |
| 🎵 Sound Dojo | Music & rhythm | Tempo | **Beat Lab** (make real beats) |

Anyone can also **build a brand-new gym** with AI — describe a subject and Quency
forges a full room (missions, sensei, arcade) you can enter and share.

### 🌍 Community
- **Dojo Ladder** — everyone ranked by XP; your **signature Roc** represents you.
- **Shareable portfolios** — a public page at `/?u=yourname` shows your belt, XP, and Roc.
- **Family chat** — a built-in room so a parent and kid can talk while they train.

### 📱 Anywhere
- Installable as an app (Add to Home Screen) — works like a native app, offline shell.
- Secure accounts with password + one-time recovery code; data syncs across devices.

---

## Technical Blueprint

- **Frontend:** React + Vite + Tailwind. Code-split (Hub, arcade games load on demand).
- **AI:** `/api/chat` serverless proxy → Claude (Opus / Sonnet / Haiku), with a kid-safe
  rules suffix on every room, prompt caching, and per-Roc memory injected into the prompt.
- **Data:** Supabase (Postgres). All auth + writes go through locked-down `SECURITY
  DEFINER` RPCs; passwords bcrypt-hashed; row-level security on. No service-role key in
  any function.
- **Gyms** are pure data (`packs/*Data.js`) — built-ins ship in code; community gyms live
  in Supabase and are validated/rehydrated by a single engine.
- **Rocs** live on the player's profile blob (`data.rocs`), so they travel with the account.
- **Payments (optional):** Stripe Checkout + signature-verified webhook grants Pro via a
  secret-gated RPC. Off until you add keys.
- **PWA:** manifest + icon + network-first service worker.

---

## Status: ✅ Live & Complete
Everything above is built, tested, and deployed. Free to use as-is. Optional next steps:
drop in custom sprite art (`src/assets/rocs/` — see `roc-sprite-checklist.html`) and flip
on Stripe (see `STRIPE_SETUP.md`).
