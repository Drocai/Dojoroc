// Roc sprite integration — DROP-IN ART, NO CODE CHANGES.
//
// To replace a Roc's procedural SVG with your own pixel art:
//   1. Export a transparent PNG (square, e.g. 256×256).
//   2. Name it exactly the species key, e.g. `zen-pebble.png`.
//   3. Drop it in:  src/assets/rocs/
// That's it. The image below auto-discovers it and RocAvatar uses it instead of
// the SVG. Any species without a file keeps its themeable SVG (hybrid).
//
// Species keys: zen-pebble, makiwara-rock, nunchuck-rocks, bo-staffali,
// smash-boulder, sumo-bava, ninja-obsidian, guardian-gargoyle, pa-geode,
// sensei-stone.

// Vite eager-globs the folder at build time; missing folder/files = {}.
const modules = import.meta.glob('../assets/rocs/*.{png,webp,svg}', { eager: true, import: 'default' });

export const ROC_SPRITES = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => {
    const key = path.split('/').pop().replace(/\.(png|webp|svg)$/i, '');
    return [key, url];
  })
);

export const spriteFor = (speciesKey) => ROC_SPRITES[speciesKey] || null;
