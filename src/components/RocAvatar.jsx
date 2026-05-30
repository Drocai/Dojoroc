import React from 'react';
import { hexFor } from '../lib/theme';
import { SPECIES } from '../lib/rocs';

// Procedural SVG Roc — a little training rock with belt-colored band + per-
// species features. Hybrid: if the species has a `sprite` URL we render that
// instead, so your pixel art drops in per-character with no rework.
const RocAvatar = ({ roc, size = 96, beltColor }) => {
  const sp = SPECIES[roc?.species] || {};
  if (sp.sprite) return <img src={sp.sprite} width={size} height={size} alt={roc?.name || sp.name} style={{ imageRendering: 'pixelated' }} />;

  const c = hexFor(roc?.color || sp.color || 'emerald');
  const belt = hexFor(beltColor || roc?.color || 'amber');
  const f = sp.feature;
  const eye = '#0a0a0f';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={roc?.name || 'Roc'}>
      <defs>
        <radialGradient id={`g${roc?.id || 'x'}`} cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.deep} />
        </radialGradient>
      </defs>
      {f === 'wings' && <><path d="M18 50 Q2 40 8 64 Q16 60 24 62 Z" fill={c.deep} /><path d="M82 50 Q98 40 92 64 Q84 60 76 62 Z" fill={c.deep} /></>}
      {/* rock body */}
      <path d="M28 30 Q24 18 38 16 Q50 8 64 16 Q78 18 74 32 Q84 44 76 60 Q78 78 58 82 Q44 88 34 80 Q20 74 24 56 Q18 44 28 30 Z" fill={`url(#g${roc?.id || 'x'})`} stroke={c.dark} strokeWidth="2" />
      {/* eyes */}
      <ellipse cx="42" cy="46" rx="5.5" ry="6.5" fill="#fff" /><circle cx="43" cy="47" r="3" fill={eye} />
      <ellipse cx="60" cy="46" rx="5.5" ry="6.5" fill="#fff" /><circle cx="61" cy="47" r="3" fill={eye} />
      {/* belt band across */}
      <rect x="24" y="62" width="52" height="8" rx="2" fill={belt.base} stroke={belt.dark} strokeWidth="1.2" />
      <rect x="46" y="60" width="9" height="14" rx="1.5" fill={belt.base} stroke={belt.dark} strokeWidth="1.2" />
      {/* species features */}
      {f === 'topknot' && <circle cx="51" cy="12" r="6" fill={c.deep} />}
      {f === 'band' && <rect x="30" y="26" width="40" height="6" rx="3" fill={belt.base} />}
      {f === 'horns' && <><path d="M30 22 L24 10 L36 20 Z" fill={c.dark} /><path d="M70 22 L76 10 L64 20 Z" fill={c.dark} /></>}
      {f === 'mask' && <rect x="34" y="40" width="34" height="12" rx="3" fill="#0a0a0f" opacity="0.85" />}
      {f === 'crystal' && <path d="M51 6 L57 16 L51 22 L45 16 Z" fill={c.base} stroke={c.dark} />}
      {f === 'beard' && <path d="M36 70 Q50 92 66 70 Q58 80 50 80 Q42 80 36 70 Z" fill="#e5e7eb" opacity="0.85" />}
      {f === 'staff' && <rect x="80" y="20" width="4" height="60" rx="2" fill={c.dark} transform="rotate(12 82 50)" />}
      {f === 'nunchuck' && <><circle cx="84" cy="40" r="4" fill={c.dark} /><circle cx="88" cy="54" r="4" fill={c.dark} /></>}
    </svg>
  );
};

export default RocAvatar;
