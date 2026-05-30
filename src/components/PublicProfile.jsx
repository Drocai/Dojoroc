import React, { useEffect, useState } from 'react';
import { Award, DoorOpen, Loader2, Swords, BookOpen } from 'lucide-react';
import { publicProfile } from '../lib/profile';
import { rankFor } from '../lib/rank';
import { themeFor } from '../lib/theme';
import { activePack } from '../../packs/index.js';

// A shareable, public portfolio page (no login needed) — a learner's landing
// page showing their belt, total XP, and rooms trained. Reached via /?u=<name>.
const PublicProfile = ({ username }) => {
  const [p, setP] = useState(undefined);

  useEffect(() => {
    publicProfile(username).then(setP);
  }, [username]);

  const accent = themeFor(activePack.brand.accent);

  if (p === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-zinc-300 gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading portfolio…
      </div>
    );
  }

  if (!p || p.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-zinc-300 gap-4 p-6 text-center">
        <div className="dojo-fx" aria-hidden="true" />
        <div>No learner found here.</div>
        <a href="/" className={`px-4 py-2 rounded-2xl ${accent.btn} text-white text-sm`}>Enter the Dojo</a>
      </div>
    );
  }

  const theme = themeFor(p.color);
  const rank = rankFor(p.total_xp || 0);
  const since = p.created_at ? new Date(p.created_at).toLocaleDateString() : '';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative flex items-center justify-center p-4">
      <div className="dojo-fx" aria-hidden="true" />
      <div className="hud relative w-[min(95vw,460px)] bg-zinc-900/80 border border-white/15 rounded-3xl p-8 shadow-2xl shadow-black/60">
        <div className="text-[10px] uppercase tracking-[2px] text-zinc-500 mb-4 font-mono">{activePack.brand.title} · Portfolio</div>
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-3xl ${theme.solid} flex items-center justify-center text-white text-3xl font-black`}>
            {(p.display_name || p.username).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl tracking-wide truncate">{p.display_name}</div>
            <div className="text-xs text-zinc-500 font-mono">@{p.username}</div>
            <div className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${theme.text}`}>
              <Award size={15} /> {rank.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl py-4 text-center">
            <div className={`text-2xl font-black ${theme.text}`}>{p.total_xp || 0}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 flex items-center justify-center gap-1"><Swords size={11} /> Total XP</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl py-4 text-center">
            <div className="text-2xl font-black text-zinc-200">{p.rooms_count || 0}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 flex items-center justify-center gap-1"><BookOpen size={11} /> Rooms trained</div>
          </div>
        </div>

        {since && <div className="text-[11px] text-zinc-600 text-center mt-4">Training in the dojo since {since}</div>}

        <a href="/" className={`w-full mt-6 px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-semibold flex items-center justify-center gap-2`}>
          <DoorOpen size={16} /> Enter the Dojo
        </a>
      </div>
    </div>
  );
};

export default PublicProfile;
