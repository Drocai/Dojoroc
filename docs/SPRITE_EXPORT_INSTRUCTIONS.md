# 🎨 Sprite Export Instructions (paste this to your art tool / artist)

## Paste-ready instruction

> Export each character as its **own separate file** — one Roc per image, **not** a
> sheet. Each must be a **square PNG with a fully transparent background** (no
> backdrop, no frame, no label text), **512×512 px**, with the character **centered**
> and a small even margin. Keep a **consistent baseline/scale** across all of them so
> they line up. Use a **bold outline, readable at small size** (they appear as small as
> 32px on a leaderboard). **Name each file exactly** as listed below (all lowercase,
> hyphens, `.png`). Deliver the 10 character files; the rest are optional extras.

## Required files — 10 Rocs (name them EXACTLY)

| Filename            | Character        |
|---------------------|------------------|
| `zen-pebble.png`        | Zen Pebble (calm, topknot) |
| `makiwara-rock.png`     | Makiwara Rock (headband) |
| `nunchuck-rocks.png`    | Nunchuck Rocks |
| `bo-staffali.png`       | Bo Staffali (staff) |
| `smash-boulder.png`     | Smash Boulder (big, horns) |
| `sumo-bava.png`         | Sumo Bava |
| `ninja-obsidian.png`    | Ninja Obsidian (mask) |
| `guardian-gargoyle.png` | Guardian Gargoyle (wings) |
| `pa-geode.png`          | Pa Geode (crystal) |
| `sensei-stone.png`      | Sensei Stone (beard, legendary) |

## Specs recap
- **Format:** PNG, transparent background
- **Size:** 512×512 px, square
- **Content:** one character, centered, small margin, bold outline
- **Consistency:** same baseline + scale across all files
- **Naming:** exactly as above (lowercase, hyphens)

## Optional extras (nice-to-have, same specs)
- Belt-tint or evolution variants are NOT needed — the app tints belts and adds the
  evolution aura automatically. Just the base character is enough.
- If you want custom evolution art later, name them e.g. `sensei-stone-stage2.png`
  and tell me — I'll wire stage swapping.

## What happens next
Drop the finished PNGs into **`src/assets/rocs/`** in the repo (or send them to me).
They swap in automatically — no code changes — and inherit all the idle/cheer/poke
animations. You can deliver them one at a time; any Roc without a file keeps its
built-in art.
