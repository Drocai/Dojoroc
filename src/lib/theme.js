// Color themes for the dojo. A pack picks an `accent` (for branding + Quency)
// and a `color` per player. We keep the Tailwind class strings written out in
// full here — never built dynamically — so Tailwind's compiler always includes
// them. To support a new accent color, add an entry below.

export const THEMES = {
  emerald: {
    text: 'text-emerald-400',
    textSoft: 'text-emerald-400/70',
    border: 'border-emerald-400',
    btn: 'bg-emerald-600 hover:bg-emerald-500',
    solid: 'bg-emerald-600',
    avatar: 'bg-emerald-500/10 border-emerald-500/30',
    dot: 'bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400',
    gradFrom: 'from-emerald-500',
    gradTo: 'to-emerald-500',
  },
  purple: {
    text: 'text-purple-400',
    textSoft: 'text-purple-400/70',
    border: 'border-purple-400',
    btn: 'bg-purple-600 hover:bg-purple-500',
    solid: 'bg-purple-600',
    avatar: 'bg-purple-500/10 border-purple-500/30',
    dot: 'bg-purple-400 shadow-[0_0_10px] shadow-purple-400',
    gradFrom: 'from-purple-500',
    gradTo: 'to-purple-500',
  },
  blue: {
    text: 'text-blue-400',
    textSoft: 'text-blue-400/70',
    border: 'border-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-500',
    solid: 'bg-blue-600',
    avatar: 'bg-blue-500/10 border-blue-500/30',
    dot: 'bg-blue-400 shadow-[0_0_10px] shadow-blue-400',
    gradFrom: 'from-blue-500',
    gradTo: 'to-blue-500',
  },
  amber: {
    text: 'text-amber-400',
    textSoft: 'text-amber-400/70',
    border: 'border-amber-400',
    btn: 'bg-amber-600 hover:bg-amber-500',
    solid: 'bg-amber-600',
    avatar: 'bg-amber-500/10 border-amber-500/30',
    dot: 'bg-amber-400 shadow-[0_0_10px] shadow-amber-400',
    gradFrom: 'from-amber-500',
    gradTo: 'to-amber-500',
  },
  rose: {
    text: 'text-rose-400',
    textSoft: 'text-rose-400/70',
    border: 'border-rose-400',
    btn: 'bg-rose-600 hover:bg-rose-500',
    solid: 'bg-rose-600',
    avatar: 'bg-rose-500/10 border-rose-500/30',
    dot: 'bg-rose-400 shadow-[0_0_10px] shadow-rose-400',
    gradFrom: 'from-rose-500',
    gradTo: 'to-rose-500',
  },
  cyan: {
    text: 'text-cyan-400',
    textSoft: 'text-cyan-400/70',
    border: 'border-cyan-400',
    btn: 'bg-cyan-600 hover:bg-cyan-500',
    solid: 'bg-cyan-600',
    avatar: 'bg-cyan-500/10 border-cyan-500/30',
    dot: 'bg-cyan-400 shadow-[0_0_10px] shadow-cyan-400',
    gradFrom: 'from-cyan-500',
    gradTo: 'to-cyan-500',
  },
};

export const themeFor = (color) => THEMES[color] || THEMES.emerald;

// Raw hex/RGB per accent for the things Tailwind classes can't reach: the
// <canvas> core, and the CSS ambience (driven by the --dojo-rgb variable). The
// `rgb` triplet is space-separated for use in `rgb(var(--dojo-rgb) / alpha)`.
export const ACCENT_HEX = {
  emerald: { base: '#10b981', deep: '#059669', dark: '#052e16', rgb: '16 185 129' },
  purple: { base: '#a855f7', deep: '#7c3aed', dark: '#2e1065', rgb: '168 85 247' },
  blue: { base: '#3b82f6', deep: '#2563eb', dark: '#0c1f4d', rgb: '59 130 246' },
  amber: { base: '#f59e0b', deep: '#d97706', dark: '#3a2406', rgb: '245 158 11' },
  rose: { base: '#f43f5e', deep: '#e11d48', dark: '#4c0519', rgb: '244 63 94' },
  cyan: { base: '#22d3ee', deep: '#0891b2', dark: '#053345', rgb: '34 211 238' },
};

export const hexFor = (color) => ACCENT_HEX[color] || ACCENT_HEX.emerald;
