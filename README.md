# Frequency Dojo v2

A gamified, real-time co-op dashboard for onboarding to **Hermes Agent** — built for Derrick & Graysen.

## Features
- Co-op mission tracking (Derrick + Graysen)
- Reactive Dojo Core visual (Canvas)
- Quency AI co-pilot (via secure proxy)
- Supabase realtime sync
- Clean modular React architecture

## Tech Stack
- React + Vite
- Tailwind CSS
- Supabase (Database + Realtime)
- Lucide-react

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase Setup

1. Create a Supabase project
2. Run the SQL schema (provided separately)
3. Add your Project URL and anon key to `.env.local`

## Deployment on Vercel

This repository is configured for automatic deployments.

1. Connect the repo on Vercel
2. Add these environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_AI_PROXY_URL` (optional)

Vercel will automatically deploy on every push to `main`.