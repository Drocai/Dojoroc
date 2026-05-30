import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Users } from 'lucide-react';
import { useRoomChat } from '../hooks/useRoomChat';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

// Always-available chat. Floats on every screen so whoever is in the shared
// project room can talk while they work — no need to leave what you're doing.
// "Permission" is simply being in the same room: change the room code and you
// move to a different private conversation.

const ROOM_KEY = 'dojo.chat.room';

const DockedChat = ({ displayName }) => {
  const stored = typeof localStorage !== 'undefined' && localStorage.getItem('dojo.displayName');
  const me = displayName || stored || activePack.players[0].chatName;
  const accent = themeFor(activePack.brand.accent);

  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem(ROOM_KEY)) || activePack.chat.defaultRoom
  );
  const [draftRoom, setDraftRoom] = useState(room);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);

  const { messages, connected, sendMessage, enabled } = useRoomChat(room);
  const logRef = useRef(null);
  const seenRef = useRef(0);

  // Track unread messages while the panel is closed.
  useEffect(() => {
    if (open) {
      seenRef.current = messages.length;
      setUnread(0);
    } else if (messages.length > seenRef.current) {
      setUnread(messages.length - seenRef.current);
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && logRef.current) {
      logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, open]);

  const joinRoom = () => {
    const next = draftRoom.trim() || activePack.chat.defaultRoom;
    setRoom(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(ROOM_KEY, next);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !enabled) return;
    setInput('');
    await sendMessage(me, text);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full ${accent.btn} text-white shadow-lg shadow-black/40 flex items-center justify-center transition-transform active:scale-95`}
      >
        <MessageCircle size={24} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,380px)] h-[min(70vh,560px)] bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2 bg-zinc-950/60">
        <div className="flex items-center gap-2 min-w-0">
          <Users size={16} className={accent.text} />
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">Project Chat</div>
            <div className="text-[10px] text-zinc-400 -mt-0.5 truncate">
              You are {me} · {connected ? 'LIVE' : enabled ? 'connecting…' : 'offline'}
            </div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-zinc-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-zinc-800 flex gap-2 bg-zinc-950/30">
        <input
          value={draftRoom}
          onChange={(e) => setDraftRoom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          placeholder="room code"
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none min-w-0"
        />
        <button onClick={joinRoom} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs whitespace-nowrap">
          Join
        </button>
      </div>

      <div ref={logRef} className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-zinc-950/30">
        {messages.length === 0 && (
          <div className="text-zinc-500 text-xs text-center mt-6">
            You're in <span className="text-zinc-300">{room}</span>. Say hi to start.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender === me;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-sm ${
                  mine ? `${accent.solid} text-white` : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                }`}
              >
                <div className="text-[10px] opacity-60 mb-0.5">{m.sender}</div>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={enabled ? `Message as ${me}...` : 'Chat offline'}
            disabled={!enabled}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm outline-none disabled:opacity-50 min-w-0"
          />
          <button
            onClick={send}
            disabled={!enabled}
            className={`px-4 rounded-2xl ${accent.btn} disabled:opacity-50 flex items-center justify-center text-white`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DockedChat;
