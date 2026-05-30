import React from 'react';
import { Target, Check, Gift } from 'lucide-react';
import { themeFor } from '../lib/theme';
import { todaysQuests, questProgress, isComplete, isClaimed, claimable } from '../lib/quests';

// Daily Quests card: 3 rotating goals with progress bars; claim XP when done.
// Shown on the Missions view so it's the first thing that nudges the daily loop.
const DailyQuests = ({ quests, accent = 'emerald', onClaim }) => {
  const theme = themeFor(accent);
  const list = todaysQuests();
  const doneCount = list.filter((q) => isClaimed(quests, q)).length;

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><Target size={16} className={theme.text} /> Daily Quests</div>
        <div className="text-xs font-mono text-zinc-500">{doneCount}/{list.length} claimed</div>
      </div>
      <div className="space-y-2.5">
        {list.map((q) => {
          const prog = questProgress(quests, q);
          const pct = Math.round((prog / q.goal) * 100);
          const done = isComplete(quests, q);
          const claimed = isClaimed(quests, q);
          const canClaim = claimable(quests, q);
          return (
            <div key={q.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm text-zinc-200">{q.label}</span>
                {claimed ? (
                  <span className={`text-[11px] flex items-center gap-1 ${theme.text}`}><Check size={12} /> +{q.xp}</span>
                ) : canClaim ? (
                  <button onClick={() => onClaim(q)} className={`text-[11px] px-2.5 py-1 rounded-lg ${theme.btn} text-white font-semibold flex items-center gap-1 animate-pulse`}>
                    <Gift size={11} /> Claim +{q.xp}
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-500">{prog}/{q.goal} · {q.xp} XP</span>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className={`h-full ${done ? theme.solid : 'bg-zinc-600'} transition-all duration-300`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuests;
