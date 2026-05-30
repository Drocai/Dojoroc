import React, { useState } from 'react';
import { Award, Check, Plus, Pencil, Sparkles } from 'lucide-react';
import RocAvatar from './RocAvatar';
import { BESTIARY, SPECIES, STARTER_KEYS, RARITIES, PERSONAS, makeRoc, rocBelt, unlockedAbilities } from '../lib/rocs';
import { themeFor } from '../lib/theme';

// Your stable of Rocs: see them, pick the active one (travels with you + powers
// chat), rename, switch personality, and adopt a free starter.
const Companions = ({ rocs = {}, activeRocId, onSetActive, onRename, onSetPersona, onAdopt }) => {
  const list = Object.values(rocs);
  const active = rocs[activeRocId];
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(active?.name || '');
  const owned = new Set(list.map((r) => r.species));

  const theme = themeFor(active?.color || 'emerald');

  return (
    <div className="space-y-5">
      {active && (
        <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className={`w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${theme.text}`}>
              <RocAvatar roc={active} size={84} />
            </div>
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1 text-sm outline-none flex-1" />
                  <button onClick={() => { onRename(active.id, name.trim() || active.name); setEditing(false); }} className={`px-3 rounded-xl ${theme.btn} text-white text-sm`}>Save</button>
                </div>
              ) : (
                <div className="font-display text-xl flex items-center gap-2">{active.name}
                  <button onClick={() => { setName(active.name); setEditing(true); }} className="text-zinc-500 hover:text-white"><Pencil size={13} /></button>
                </div>
              )}
              <div className="text-xs text-zinc-500">{SPECIES[active.species]?.name} · {SPECIES[active.species]?.title}</div>
              <div className={`text-sm font-semibold mt-1 flex items-center gap-1.5 ${theme.text}`}><Award size={14} /> {rocBelt(active).name} · {active.xp} XP</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Personality</div>
            <div className="flex flex-wrap gap-1.5">
              {(active.personas || []).map((pk) => (
                <button key={pk} onClick={() => onSetPersona(active.id, pk)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border ${active.persona === pk ? `${theme.solid} text-white border-transparent` : 'bg-white/5 border-zinc-700 text-zinc-300'}`}>
                  {PERSONAS[pk]?.emoji} {PERSONAS[pk]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Abilities</div>
            <div className="flex flex-wrap gap-1.5">
              {unlockedAbilities(active).map((a) => (
                <span key={a.key} className="text-xs px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-700 text-zinc-300" title={a.desc}><Sparkles size={10} className="inline -mt-0.5" /> {a.label}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="text-sm font-semibold mb-3">Your Rocs</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {list.map((r) => {
            const t = themeFor(r.color);
            return (
              <button key={r.id} onClick={() => onSetActive(r.id)} className={`rounded-2xl p-3 border text-center ${r.id === activeRocId ? `${t.border} bg-white/5` : 'border-zinc-800 hover:border-zinc-600'}`}>
                <div className="flex justify-center"><RocAvatar roc={r} size={56} /></div>
                <div className="text-xs font-semibold truncate mt-1">{r.name}</div>
                <div className={`text-[10px] ${t.text}`}>{rocBelt(r).name}</div>
                {r.id === activeRocId && <div className={`text-[9px] mt-0.5 flex items-center justify-center gap-0.5 ${t.text}`}><Check size={9} /> Active</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="text-sm font-semibold mb-1">Adopt a Roc</div>
        <p className="text-xs text-zinc-500 mb-3">Free starters. More species unlock as you train and rank up.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BESTIARY.map((sp) => {
            const startable = STARTER_KEYS.includes(sp.key);
            const have = owned.has(sp.key);
            const t = themeFor(sp.color);
            return (
              <div key={sp.key} className={`rounded-2xl p-3 border text-center ${have ? 'border-zinc-700' : 'border-zinc-800'} ${!startable && !have ? 'opacity-45' : ''}`}>
                <div className="flex justify-center"><RocAvatar roc={{ species: sp.key, color: sp.color }} size={48} /></div>
                <div className="text-[11px] font-semibold truncate mt-1">{sp.name}</div>
                <div className={`text-[9px] ${t.text}`}>{RARITIES[sp.rarity]?.label}</div>
                {have ? <div className="text-[9px] text-zinc-600 mt-1">Owned</div>
                  : startable ? <button onClick={() => onAdopt(makeRoc(sp.key))} className={`mt-1 text-[10px] px-2 py-1 rounded-lg ${t.btn} text-white flex items-center gap-1 mx-auto`}><Plus size={10} /> Adopt</button>
                  : <div className="text-[9px] text-zinc-600 mt-1">Locked</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Companions;
