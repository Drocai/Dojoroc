import React from 'react';
import { DoorOpen, Check, MapPin, Lock } from 'lucide-react';
import { activePack, enterPackData } from '../../../packs/index.js';
import { themeFor } from '../../lib/theme';
import { gymBelt } from '../../lib/rocs';
import RocAvatar from '../RocAvatar';

const BRAND_EMOJI = { Zap: '⚡', Flame: '🔥', Rocket: '🚀', Gamepad2: '🎮', Music: '🎵', BookOpen: '📚', Brain: '🧠', Sparkles: '✨' };

// The Dojo Map — every gym as a "territory" node on a path. Your active Roc
// stands on the gym you're currently in; tap any node to walk there. Each node
// shows how much that Roc has trained in that gym (its specialty there).
const DojoMap = ({ rooms, profile, roc }) => {
  const here = activePack.id;
  const trained = roc?.trained || {};

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold flex items-center gap-2"><MapPin size={16} className="text-emerald-400" /> Dojo Map</div>
        {roc && <div className="text-xs text-zinc-500">Traveling with <span className="text-zinc-300">{roc.name}</span></div>}
      </div>
      <p className="text-xs text-zinc-500 mb-4">Each gym is a territory of knowledge. Walk your Roc in to train it there.</p>

      <div className="relative">
        {/* the path line */}
        <div className="absolute left-0 right-0 top-[44px] h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        <div className="relative flex gap-4 overflow-x-auto pb-2">
          {rooms.map((room) => {
            const d = room.data || {};
            const accent = d.brand?.accent || 'emerald';
            const t = themeFor(accent);
            const isHere = room.id === here;
            const gymXp = trained[room.id]?.xp || 0;
            const emoji = BRAND_EMOJI[d.brand?.icon] || '🥋';
            return (
              <div key={room.id} className="flex flex-col items-center flex-shrink-0 w-28">
                {/* node */}
                <button
                  onClick={() => !isHere && enterPackData(d)}
                  className={`relative w-[88px] h-[88px] rounded-3xl border-2 flex items-center justify-center text-3xl transition-all ${
                    isHere ? `${t.border} bg-white/5 scale-105` : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950'
                  }`}
                  title={isHere ? "You're here" : `Walk to ${d.brand?.title || room.name}`}
                >
                  {emoji}
                  {isHere && roc && (
                    <span className="absolute -bottom-3 -right-2 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <RocAvatar roc={roc} size={30} idle />
                    </span>
                  )}
                  {isHere && <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-full ${t.solid} text-white`}>Here</span>}
                </button>
                <div className="text-[11px] font-semibold text-center mt-3 truncate w-full">{d.brand?.title || room.name}</div>
                {gymXp > 0 ? (
                  <div className="text-[9px] text-center">
                    <span className={t.text}>{gymBelt(roc, room.id).name}</span>
                    <span className="text-zinc-600"> · {gymXp} XP</span>
                  </div>
                ) : (
                  <div className="text-[9px] text-zinc-600">unexplored</div>
                )}
                {!isHere ? (
                  <button onClick={() => enterPackData(d)} className={`mt-1 text-[9px] px-2 py-0.5 rounded-lg ${t.btn} text-white flex items-center gap-0.5`}>
                    <DoorOpen size={9} /> Enter
                  </button>
                ) : (
                  <span className={`mt-1 text-[9px] flex items-center gap-0.5 ${t.text}`}><Check size={9} /> Training</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DojoMap;
