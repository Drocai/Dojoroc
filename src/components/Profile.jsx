import React, { useState } from 'react';
import { Award, Flame, LogOut, DoorClosed, Share2, Check, MapPin } from 'lucide-react';
import { themeFor } from '../lib/theme';
import { GAMES } from '../lib/arcade';

// Turn a room id into a readable name when we don't have a stored one (legacy
// rooms): drop the random id suffix and title-case the slug.
const prettyRoom = (id) =>
  String(id)
    .replace(/-[a-z0-9]{5}$/, '')
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

// The portfolio card: who you are, your belt rank, total XP across every room
// you've trained in, and your game bests. This is what carries with the user.
const Profile = ({ profile, rank, crossTotal, rooms, scores, streak, currentRoomId, onLogout }) => {
  const theme = themeFor(profile.color);
  const roomEntries = Object.entries(rooms || {}).sort((a, b) => (b[1].xp || 0) + (b[1].bonusXp || 0) - (a[1].xp || 0) - (a[1].bonusXp || 0));
  const [shared, setShared] = useState(false);
  const days = streak?.count || 0;

  const share = () => {
    const url = `${window.location.origin}/?u=${encodeURIComponent(profile.username)}`;
    navigator.clipboard?.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-3xl ${theme.solid} flex items-center justify-center text-white text-2xl font-black`}>
            {(profile.display_name || profile.username).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display text-xl tracking-wide truncate">{profile.display_name}</div>
            <div className="text-xs text-zinc-500 font-mono">@{profile.username}</div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-sm font-semibold flex items-center gap-1.5 ${theme.text}`}>
                <Award size={15} /> {rank.name}
              </span>
              {days > 0 && (
                <span className="text-xs font-semibold flex items-center gap-1 text-amber-400" title={`Best streak: ${streak?.best || days} days`}>
                  <Flame size={13} /> {days}-day streak
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400">{rank.next ? `Next: ${rank.next}` : 'Max rank reached'}</span>
            <span className="font-mono text-zinc-400">{crossTotal} XP{rank.next ? ` · ${rank.toNext} to go` : ''}</span>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className={`h-full ${theme.solid} transition-all duration-500`} style={{ width: `${rank.pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 text-center">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3">
            <div className={`text-xl font-black ${theme.text}`}>{crossTotal}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">Total XP</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3">
            <div className="text-xl font-black text-zinc-200">{roomEntries.length}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">Rooms</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3">
            <div className="text-xl font-black text-amber-400">{Math.max(0, ...GAMES.map((g) => scores?.[g.key] || 0), 0)}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">Top Score</div>
          </div>
        </div>
      </div>

      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2"><DoorClosed size={15} className={theme.text} /> Rooms trained in</div>
        {roomEntries.length === 0 ? (
          <div className="text-xs text-zinc-500">No XP yet — clear a mission or play a round to start your record.</div>
        ) : (
          <div className="space-y-2">
            {roomEntries.map(([id, r]) => (
              <div key={id} className="flex items-center justify-between text-sm gap-2">
                <span className="text-zinc-300 truncate flex items-center gap-1.5">
                  {r.name || prettyRoom(id)}
                  {id === currentRoomId && <MapPin size={11} className={theme.text} title="You're here now" />}
                </span>
                <span className={`font-mono ${theme.text}`}>{(r.xp || 0) + (r.bonusXp || 0)} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Flame size={15} className="text-amber-400" /> Arcade bests (this room)</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {GAMES.map((g) => (
            <div key={g.key} className="bg-zinc-950 border border-zinc-800 rounded-2xl py-3">
              <div className="text-lg font-black text-zinc-200">{scores?.[g.key] || 0}</div>
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">{g.tag}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={share}
          className={`flex-1 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-sm text-zinc-200 flex items-center justify-center gap-2`}
        >
          {shared ? <Check size={15} className={theme.text} /> : <Share2 size={15} />} {shared ? 'Link copied!' : 'Share portfolio'}
        </button>
        <button
          onClick={onLogout}
          className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-rose-800 text-sm text-zinc-300 flex items-center justify-center gap-2"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </div>
  );
};

export default Profile;
