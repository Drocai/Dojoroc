import React, { useEffect, useState } from 'react';
import { Plus, DoorOpen, X, Loader2, Check, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BUILTIN_PACKS, activePack, enterPackData } from '../../../packs/index.js';
import { deletePack } from '../../lib/profile';
import { themeFor } from '../../lib/theme';
import RoomBuilder from './RoomBuilder';
import Leaderboard from './Leaderboard';

const accent = themeFor(activePack.brand.accent);

// The big dojo: every room (teacher) you can walk into. Built-in starter +
// every room the community has forged (saved to Supabase). Enter one, build a
// new one, or remove rooms you made.
const Hub = ({ onClose, profile }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? rooms
    : rooms.filter((r) =>
        [r.data?.brand?.title, r.name, r.subject, r.data?.sensei?.name, r.owner]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(q))
      );

  const load = async () => {
    const builtins = BUILTIN_PACKS.map((d) => ({ id: d.id, name: d.name, subject: d.subject, data: d, builtin: true, owner: null }));
    if (!supabase) {
      setRooms(builtins);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('dojo_packs')
      .select('id,name,subject,data,owner,created_at')
      .order('created_at', { ascending: false });
    setRooms([...builtins, ...(data || []).map((r) => ({ ...r, builtin: false }))]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeRoom = async (room) => {
    if (!profile || room.owner !== profile.username) return;
    const r = await deletePack(room.id, profile.username, profile.token);
    if (r && !r.error) setRooms((prev) => prev.filter((x) => x.id !== room.id));
  };

  if (building) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative">
        <RoomBuilder accent={accent} profile={profile} onClose={() => setBuilding(false)} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-wide dojo-glow">THE DOJO</h2>
          <p className="text-sm text-zinc-400 mt-1">Every room is a teacher. Walk into one, or train a new one.</p>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800" aria-label="Close hub">
          <X size={18} />
        </button>
      </div>

      <Leaderboard meUsername={profile?.username} onPick={(u) => { window.location.href = `/?u=${encodeURIComponent(u)}`; }} />

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400 text-sm py-12 justify-center">
          <Loader2 className="animate-spin" size={16} /> Loading rooms…
        </div>
      ) : (
        <>
        {rooms.length > 4 && (
          <div className="relative mb-5 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms by name, subject, sensei…"
              aria-label="Search rooms"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-zinc-600"
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            onClick={() => setBuilding(true)}
            className={`hud rounded-3xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 p-6 min-h-[170px] flex flex-col items-center justify-center gap-3 text-zinc-300 transition-colors`}
          >
            <div className={`w-12 h-12 rounded-2xl ${accent.solid} flex items-center justify-center text-white`}>
              <Plus size={24} />
            </div>
            <div className="font-semibold">New Room</div>
            <div className="text-xs text-zinc-500 text-center">Have Quency build a new teacher</div>
          </button>

          {filtered.map((room) => {
            const current = room.id === activePack.id;
            const missions = room.data?.missions?.length || 0;
            const sensei = room.data?.sensei?.name || 'Quency';
            const mine = profile && room.owner === profile.username;
            const by = room.builtin ? 'Starter room' : room.owner ? `forged by ${mine ? 'you' : room.owner}` : 'community room';
            return (
              <div key={room.id} className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[180px] flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display tracking-wide truncate">{room.data?.brand?.title || room.name}</h3>
                  {mine && <span className={`text-[9px] uppercase tracking-wide ${accent.text} border border-current rounded px-1.5 py-0.5`}>Yours</span>}
                </div>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{room.subject}</p>
                <div className="text-[11px] text-zinc-500 font-mono mt-3 flex gap-3 flex-wrap">
                  <span>{missions} missions</span>
                  <span>sensei: {sensei}</span>
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">{by}</div>
                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                  {current ? (
                    <div className={`text-sm flex items-center gap-1.5 ${accent.text}`}>
                      <Check size={15} /> You're in this room
                    </div>
                  ) : (
                    <button
                      onClick={() => enterPackData(room.data)}
                      className={`px-4 py-2 rounded-2xl ${accent.btn} text-white text-sm font-medium flex items-center gap-1.5`}
                    >
                      <DoorOpen size={15} /> Enter
                    </button>
                  )}
                  {mine && (
                    <button onClick={() => removeRoom(room)} className="text-zinc-500 hover:text-rose-400 p-2" aria-label="Delete room">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {q && filtered.length === 0 && (
          <div className="text-sm text-zinc-500 py-10 text-center">
            No rooms match “{query}”. Try a different search, or forge a new one.
          </div>
        )}
        </>
      )}
    </main>
  );
};

export default Hub;
