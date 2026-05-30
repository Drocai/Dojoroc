import React, { useEffect, useState } from 'react';
import { Trophy, Award, Loader2 } from 'lucide-react';
import { leaderboard } from '../../lib/profile';
import { rankFor } from '../../lib/rank';
import { themeFor } from '../../lib/theme';

// The dojo ladder — every learner ranked by total XP across all their rooms.
// Safe public fields only (no private data leaves the database functions).
const Leaderboard = ({ meUsername, onPick }) => {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    leaderboard().then((r) => setRows(Array.isArray(r) ? r : []));
  }, []);

  if (rows === null) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 text-xs py-3">
        <Loader2 className="animate-spin" size={14} /> Loading the ladder…
      </div>
    );
  }
  if (rows.length === 0) return null;

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Trophy size={16} className="text-amber-400" /> Dojo Ladder
      </div>
      <div className="space-y-1.5">
        {rows.map((r, i) => {
          const theme = themeFor(r.color);
          const rank = rankFor(r.total_xp || 0);
          const mine = r.username === meUsername;
          return (
            <button
              key={r.username}
              onClick={() => onPick?.(r.username)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition-colors ${
                mine ? 'bg-white/10 border border-white/15' : 'hover:bg-white/5'
              }`}
            >
              <span className="w-6 text-center font-mono text-xs text-zinc-500">{i + 1}</span>
              <span className={`w-7 h-7 rounded-xl ${theme.solid} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                {(r.display_name || r.username).slice(0, 1).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="text-sm text-zinc-200 truncate block">{r.display_name}</span>
                <span className={`text-[10px] flex items-center gap-1 ${theme.text}`}><Award size={9} /> {rank.name}</span>
              </span>
              <span className="text-right">
                <span className="font-mono text-sm text-zinc-200">{r.total_xp || 0}</span>
                <span className="text-[10px] text-zinc-500 block">XP · {r.rooms_count || 0} rooms</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
