// ---------------------------------------------------------------------------
// PACK REGISTRY
//
// Every learnable system the dojo can load lives here. To add one:
//   1. Create packs/<your-pack>.js (copy frequency-dojo.js as a template)
//   2. import it below and add it to PACKS
//   3. Set VITE_DOJO_PACK=<your-pack> to make it the active one (optional;
//      defaults to 'frequency-dojo')
//
// Both the front-end (src/*) and the serverless AI proxy (api/chat.js) read
// from here, so the teaching content and the AI prompts stay in one place.
// ---------------------------------------------------------------------------

import frequencyDojo from './frequency-dojo.js';

export const PACKS = {
  [frequencyDojo.id]: frequencyDojo,
};

export const DEFAULT_PACK_ID = 'frequency-dojo';

// Resolve a pack by id, falling back to the default. Safe to call with
// anything (including undefined or an unknown id from a request body).
export function getPack(id) {
  return PACKS[id] || PACKS[DEFAULT_PACK_ID];
}

// The active pack for this build. The front-end bundles VITE_DOJO_PACK at
// build time; the server has no such var, so it falls back to the default and
// otherwise trusts the `pack` id sent on each request.
const ACTIVE_ID =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DOJO_PACK) ||
  DEFAULT_PACK_ID;

export const activePack = getPack(ACTIVE_ID);
