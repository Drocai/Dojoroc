import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Brain, Plus, Check, Loader2 } from 'lucide-react';
import { MODEL_OPTIONS, MODE_OPTIONS, CHAT_ENDPOINT } from '../lib/quency';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const { sensei, modes, modelOptions } = activePack;
const accent = themeFor(activePack.brand.accent);

const QuencyChat = ({ memory = '', displayName, onRemember }) => {
  const greeting = displayName ? `Welcome back, ${displayName}. ${sensei.greeting}` : sensei.greeting;
  const [messages, setMessages] = useState([{ role: 'quency', text: greeting }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState(modelOptions[0].key);
  const [mode, setMode] = useState(modes[0].key);
  const [remembered, setRemembered] = useState({});
  const [distilling, setDistilling] = useState(false);
  const chatContainerRef = useRef(null);

  const remember = (i, text) => {
    if (!onRemember || remembered[i]) return;
    onRemember(text.slice(0, 200));
    setRemembered((r) => ({ ...r, [i]: true }));
  };

  // Ask Quency to distill durable facts from the conversation into memory.
  const distill = async () => {
    if (!onRemember || distilling) return;
    const transcript = messages
      .filter((m) => m.role === 'user' || m.role === 'quency')
      .map((m) => `${m.role === 'user' ? 'Student' : sensei.name}: ${m.text}`)
      .join('\n')
      .slice(-4000);
    if (transcript.length < 20) return;
    setDistilling(true);
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `From this tutoring chat, extract up to 3 short, durable facts about the STUDENT worth remembering next time (their preferences, goals, or what they just learned). Reply ONLY as a JSON array of short strings.\n\n${transcript}`,
          model: 'haiku',
          system: 'You output only a compact JSON array of short plain strings. No prose.',
        }),
      });
      const data = await res.json().catch(() => ({}));
      let txt = String(data.reply || '').trim().replace(/^```(json)?/i, '').replace(/```$/, '');
      txt = txt.slice(txt.indexOf('['), txt.lastIndexOf(']') + 1);
      const facts = JSON.parse(txt);
      if (Array.isArray(facts)) facts.slice(0, 3).forEach((f) => typeof f === 'string' && onRemember(f.slice(0, 200)));
      setMessages((prev) => [...prev, { role: 'system', text: `Saved ${Math.min(3, facts.length)} thing(s) to your ${sensei.name}'s memory.` }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'system', text: "Couldn't distill that chat — try again." }]);
    } finally {
      setDistilling(false);
    }
  };

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
        body: JSON.stringify({
          message: trimmed,
          history,
          model,
          mode,
          pack: activePack.id,
          system: (modes.find((m) => m.key === mode) || modes[0]).system + memory,
        }),
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
        {onRemember && (
          <button
            onClick={distill}
            disabled={distilling}
            title="Save what you learned into Quency's memory"
            className={`text-[11px] px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 ${accent.text} flex items-center gap-1 disabled:opacity-50`}
          >
            {distilling ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />} Teach from chat
          </button>
        )}
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
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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
            {onRemember && msg.role === 'quency' && i > 0 && (
              <button
                onClick={() => remember(i, msg.text)}
                disabled={remembered[i]}
                className="mt-1 text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 disabled:text-emerald-400"
              >
                {remembered[i] ? <Check size={11} /> : <Plus size={11} />} {remembered[i] ? 'Remembered' : 'Remember this'}
              </button>
            )}
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
