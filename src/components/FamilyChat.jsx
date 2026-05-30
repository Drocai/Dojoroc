import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useRoomChat } from '../hooks/useRoomChat';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const { players, brand, chat } = activePack;
const mentor = players[0];
const student = players[1] || players[0];
const accent = themeFor(brand.accent);

const FamilyChat = ({ currentUser }) => {
  const mePlayer = players.find((p) => p.key === currentUser) || mentor;
  const stored = typeof localStorage !== 'undefined' && localStorage.getItem('dojo.displayName');
  const me = stored || mePlayer.chatName;
  const mineTheme = themeFor(mePlayer.color);
  const [room, setRoom] = useState(chat.defaultRoom);
  const [joined, setJoined] = useState(chat.defaultRoom);
  const [input, setInput] = useState('');
  const { messages, connected, sendMessage, enabled } = useRoomChat(joined);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendMessage(me, text);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[560px] overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/50">
        <div>
          <div className="font-semibold tracking-tight">{mentor.chatName} ↔ {student.chatName} Chat</div>
          <div className={`text-[10px] -mt-0.5 ${accent.textSoft}`}>
            You are {me} · {connected ? 'LIVE' : enabled ? 'connecting…' : 'offline'}
          </div>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full ${connected ? accent.dot : 'bg-zinc-600'}`}
        />
      </div>

      <div className="px-4 py-3 border-b border-zinc-800 flex gap-2 bg-zinc-950/30">
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="room code"
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none"
        />
        <button
          onClick={() => setJoined(room.trim() || chat.defaultRoom)}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs"
        >
          Join Room
        </button>
      </div>

      <div ref={logRef} className="flex-1 p-5 overflow-y-auto space-y-3 bg-zinc-950/30">
        {messages.length === 0 && (
          <div className="text-zinc-500 text-sm text-center mt-8">
            No messages yet. Say "you on?" to start.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender === me;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-3xl text-sm ${
                  mine ? `${mineTheme.solid} text-white` : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                }`}
              >
                <div className="text-[10px] opacity-60 mb-0.5">{m.sender}</div>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Message as ${me}...`}
            disabled={!enabled}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!enabled}
            className={`px-5 rounded-2xl ${mineTheme.btn} disabled:opacity-50 flex items-center justify-center`}
          >
            <Send size={18} />
          </button>
        </div>
        {!enabled && (
          <p className="text-[11px] text-zinc-500 mt-2">Supabase not configured — chat is read-only.</p>
        )}
      </div>
    </div>
  );
};

export default FamilyChat;
