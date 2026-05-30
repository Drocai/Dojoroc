import React, { useState } from 'react';
import { ShieldCheck, Copy, Check } from 'lucide-react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const accent = themeFor(activePack.brand.accent);

// Shown once, right after signup: the recovery code that resets the password if
// it's ever forgotten. It is never shown again (only a hash is stored).
const RecoveryModal = ({ username, code, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="hud relative w-[min(95vw,420px)] bg-zinc-900/90 border border-white/15 rounded-3xl p-7 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className={accent.text} size={20} />
          <h2 className="font-display tracking-wide">Save your recovery code</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          This is the <span className="text-zinc-200">only</span> way to reset <span className={accent.text}>@{username}</span>'s
          password if it's forgotten. Write it down somewhere safe — you won't see it again.
        </p>
        <button
          onClick={copy}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-4 flex items-center justify-between gap-3 mb-4 hover:border-zinc-500"
        >
          <span className="font-mono text-lg tracking-[3px] text-white">{code}</span>
          <span className={`text-xs flex items-center gap-1 ${accent.text}`}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
        <button onClick={onClose} className={`w-full px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-semibold`}>
          I've saved it — enter the dojo
        </button>
      </div>
    </div>
  );
};

export default RecoveryModal;
