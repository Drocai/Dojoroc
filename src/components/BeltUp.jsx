import React, { useEffect, useRef, useState } from 'react';
import { Award, X } from 'lucide-react';

// Celebratory toast that fires when the learner's belt changes. Cross-room total
// XP only ever climbs, so any change to the belt name is a promotion worth a
// moment of fanfare.
const BeltUp = ({ rankName, accent }) => {
  const prev = useRef(rankName);
  const [show, setShow] = useState(null);

  useEffect(() => {
    if (prev.current && rankName && rankName !== prev.current) {
      setShow(rankName);
      const t = setTimeout(() => setShow(null), 5200);
      prev.current = rankName;
      return () => clearTimeout(t);
    }
    prev.current = rankName;
  }, [rankName]);

  if (!show) return null;

  return (
    <div role="status" aria-live="polite" className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] belt-up">
      <div className="hud bg-zinc-900/95 border border-white/20 rounded-2xl shadow-2xl shadow-black/60 px-5 py-3 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl ${accent.solid} flex items-center justify-center text-white belt-up-badge`}>
          <Award size={20} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[2px] text-zinc-400">Belt promotion</div>
          <div className={`font-display text-lg leading-tight ${accent.text}`}>{show}</div>
        </div>
        <button onClick={() => setShow(null)} className="text-zinc-500 hover:text-white p-1 ml-1" aria-label="Dismiss">
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default BeltUp;
