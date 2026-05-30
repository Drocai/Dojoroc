import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { MODEL_OPTIONS, MODE_OPTIONS, CHAT_ENDPOINT } from '../lib/quency';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const { sensei, modes, modelOptions } = activePack;
const accent = themeFor(activePack.brand.accent);

const QuencyChat = () => {
  const [messages, setMessages] = useState([{ role: 'quency', text: sensei.greeting }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState(modelOptions[0].key);
  const [mode, setMode] = useState(modes[0].key);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Build API history from prior turns (before adding the new one).
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'quency')
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history, model, mode, pack: activePack.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'system', text: data.error || `Error ${res.status}` }]);
      } else {
        setMessages((prev) => [...prev, { role: 'quency', text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'system', text: 'Connection issue. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[560px] overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/50">
        <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${accent.avatar}`}>
          <MessageSquare className={accent.text} size={18} />
        </div>
        <div className="flex-1">
          <div className="font-semibold tracking-tight">{sensei.name}</div>
          <div className={`text-[10px] -mt-0.5 ${accent.textSoft}`}>{sensei.title}</div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap gap-2 bg-zinc-950/30">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none text-zinc-200"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.key} value={m.key}>{`${m.label} · ${m.note}`}</option>
          ))}
        </select>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none text-zinc-200"
        >
          {MODE_OPTIONS.map((m) => (
            <option key={m.key} value={m.key}>{`${m.label} · ${m.note}`}</option>
          ))}
        </select>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] px-4 py-3 rounded-3xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? `${accent.solid} text-white`
                  : msg.role === 'system'
                  ? 'bg-amber-900/30 text-amber-200 border border-amber-800/50'
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <div className={`${accent.text} text-xs`}>{sensei.name} is thinking...</div>}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={sensei.placeholder}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={isTyping}
            className={`px-5 rounded-2xl ${accent.btn} disabled:opacity-50 flex items-center justify-center`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuencyChat;
