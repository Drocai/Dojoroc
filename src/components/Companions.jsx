import React, { useState } from 'react';
import { Award, Check, Plus, Pencil, Sparkles, MapPin, Lock } from 'lucide-react';
import RocAvatar from './RocAvatar';
import { BESTIARY, SPECIES, RARITIES, PERSONAS, makeRoc, rocBelt, unlockedAbilities, availablePersonas, ownedCosmetics, rocMastery, collectionProgress, speciesUnlocked, SPECIES_UNLOCK } from '../lib/rocs';
import { BELTS } from '../lib/rank';
import { themeFor } from '../lib/theme';

// Your stable of Rocs: see them, pick the active one (travels with you + powers
// chat), rename, switch personality, and adopt a free starter.
const Companions = ({ rocs = {}, accountXp = 0, currentGym, activeRocId, onSetActive, onRename, onSetPersona, onAdopt, onEquip }) => {
  const list = Object.values(rocs);
  const active = rocs[activeRocId];
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(active?.name || '');
  const { owned: ownedCount, total, ownedSet: owned } = collectionProgress(rocs);

  const theme = themeFor(active?.color || 'emerald');
  const mastery = active ? rocMastery(active) : [];
  const [poke, setPoke] = useState(false);
  const pokeRoc = () => { setPoke(true); setTimeout(() => setPoke(false), 520); };

  return (
    <div className="space-y-5">
      {active && (
        <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <button onClick={pokeRoc} aria-label="Poke your Roc" className={`w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${theme.text}`}>
              <RocAvatar roc={active} size={84} idle={!poke} poke={poke} />
            </button>
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
              {availablePersonas(active).map((pk) => (
                <button key={pk} onClick={() => onSetPersona(active.id, pk)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border ${active.persona === pk ? `${theme.solid} text-white border-transparent` : 'bg-white/5 border-zinc-700 text-zinc-300'}`}>
                  {PERSONAS[pk]?.emoji} {PERSONAS[pk]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Wardrobe</div>
            <div className="flex flex-wrap gap-1.5">
              {ownedCosmetics(active).length === 0 && <span className="text-xs text-zinc-600">Rank up to unlock gear.</span>}
              {ownedCosmetics(active).map((w) => {
                const on = (active.wardrobe?.equipped || []).includes(w.key);
                return (
                  <button key={w.key} onClick={() => onEquip(active.id, w.key)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border ${on ? `${theme.solid} text-white border-transparent` : 'bg-white/5 border-zinc-700 text-zinc-300'}`}>
                    {on ? '✓ ' : ''}{w.label}
                  </button>
                );
              })}
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

          {mastery.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">Gym mastery (specialties)</div>
              <div className="space-y-1.5">
                {mastery.slice(0, 5).map((m) => (
                  <div key={m.gym} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-zinc-300 truncate flex items-center gap-1.5">
                      {m.name || m.gym}
                      {currentGym?.id === m.gym && <MapPin size={10} className={theme.text} />}
                    </span>
                    <span className={`font-mono ${theme.text}`}>{m.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold">Bestiary</div>
          <div className="text-xs font-mono text-zinc-500">{ownedCount}/{total} collected</div>
        </div>
        <p className="text-xs text-zinc-500 mb-3">Rarer Rocs unlock as your belt climbs across every gym. Train more to recruit them.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BESTIARY.map((sp) => {
            const have = owned.has(sp.key);
            const unlocked = speciesUnlocked(sp.key, accountXp);
            const t = themeFor(sp.color);
            const needBelt = BELTS[SPECIES_UNLOCK[sp.key] ?? 0]?.name;
            return (
              <div key={sp.key} className={`rounded-2xl p-3 border text-center ${have ? `${t.border}` : 'border-zinc-800'} ${!unlocked && !have ? 'opacity-50' : ''}`}>
                <div className="flex justify-center relative">
                  <div className={!unlocked && !have ? 'grayscale opacity-60' : ''}><RocAvatar roc={{ species: sp.key, color: sp.color }} size={48} /></div>
                  {!unlocked && !have && <Lock size={14} className="absolute top-0 right-2 text-zinc-500" />}
                </div>
                <div className="text-[11px] font-semibold truncate mt-1">{sp.name}</div>
                <div className={`text-[9px] ${t.text}`}>{RARITIES[sp.rarity]?.label}</div>
                {have ? <div className="text-[9px] text-zinc-600 mt-1 flex items-center justify-center gap-0.5"><Check size={9} /> Owned</div>
                  : unlocked ? <button onClick={() => onAdopt(makeRoc(sp.key))} className={`mt-1 text-[10px] px-2 py-1 rounded-lg ${t.btn} text-white flex items-center gap-1 mx-auto`}><Plus size={10} /> Recruit</button>
                  : <div className="text-[9px] text-zinc-600 mt-1">{needBelt}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Companions;
