import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Brain, Plus, Check, Loader2 } from 'lucide-react';
import { MODEL_OPTIONS, MODE_OPTIONS, CHAT_ENDPOINT } from '../lib/quency';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';
import { ABILITY_PROMPTS, PERSONAS, availablePersonas } from '../lib/rocs';
import RocAvatar from './RocAvatar';

const { sensei, modes, modelOptions } = activePack;
const accent = themeFor(activePack.brand.accent);

// One-tap conversation starters, drawn from the active room's missions/subject.
const STARTERS = [
  ...(activePack.missions || []).slice(0, 2).map((m) => `Help me start: ${m.title}`),
  `Quiz me on ${activePack.subject || 'this room'}`,
].filter(Boolean).slice(0, 3);

const QuencyChat = ({ memory = '', displayName, onRemember, roc, abilities = [], onSetPersona }) => {
  const who = roc?.name || sensei.name;
  const greeting = displayName ? `Welcome back, ${displayName}. ${sensei.greeting}` : sensei.greeting;
  const [messages, setMessages] = useState([{ role: 'quency', text: greeting }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('dojo.model');
    return modelOptions.some((m) => m.key === saved) ? saved : modelOptions[0].key;
  });
  const [mode, setMode] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem(`dojo.mode.${activePack.id}`);
    return modes.some((m) => m.key === saved) ? saved : modes[0].key;
  });
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
      const kept = Array.isArray(facts) ? facts.filter((f) => typeof f === 'string' && f.trim()).slice(0, 3) : [];
      kept.forEach((f) => onRemember(f.slice(0, 200)));
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: kept.length
            ? `Saved ${kept.length} thing${kept.length > 1 ? 's' : ''} to your ${sensei.name}'s memory: ${kept.join('; ')}`
            : `Nothing new to remember from this chat yet — keep going!`,
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'system', text: "Couldn't distill that chat — try again." }]);
    } finally {
      setDistilling(false);
    }
  };

  // Belt-gated ability buttons: 'imprint' distills memory, the rest fire a
  // templated prompt the Roc answers in character.
  const runAbility = (key) => {
    if (isTyping) return;
    if (key === 'distill') return distill();
    const t = ABILITY_PROMPTS[key];
    if (t) sendMessage(t);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const sendMessage = async (override) => {
    const trimmed = (typeof override === 'string' ? override : input).trim();
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
        <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center overflow-hidden ${accent.avatar}`}>
          {roc ? <RocAvatar roc={roc} size={34} idle={!isTyping} poke={isTyping} /> : <MessageSquare className={accent.text} size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold tracking-tight truncate">{who}</div>
          {roc && onSetPersona ? (
            <select
              value={roc.persona}
              onChange={(e) => onSetPersona(roc.id, e.target.value)}
              aria-label="Personality"
              className={`bg-transparent text-[10px] -mt-0.5 outline-none ${accent.textSoft}`}
            >
              {availablePersonas(roc).map((pk) => (
                <option key={pk} value={pk} className="bg-zinc-900 text-zinc-200">{PERSONAS[pk]?.emoji} {PERSONAS[pk]?.label}</option>
              ))}
            </select>
          ) : (
            <div className={`text-[10px] -mt-0.5 ${accent.textSoft}`}>{sensei.title}</div>
          )}
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
          onChange={(e) => { setModel(e.target.value); try { localStorage.setItem('dojo.model', e.target.value); } catch { /* ignore */ } }}
          aria-label="Model"
          className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none text-zinc-200"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.key} value={m.key}>{`${m.label} · ${m.note}`}</option>
          ))}
        </select>
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value); try { localStorage.setItem(`dojo.mode.${activePack.id}`, e.target.value); } catch { /* ignore */ } }}
          aria-label="Teaching mode"
          className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none text-zinc-200"
        >
          {MODE_OPTIONS.map((m) => (
            <option key={m.key} value={m.key}>{`${m.label} · ${m.note}`}</option>
          ))}
        </select>
      </div>

      {abilities.length > 0 && (
        <div className="px-4 py-2 border-b border-zinc-800 flex flex-wrap gap-1.5 bg-zinc-950/20">
          {abilities.map((a) => (
            <button
              key={a.key}
              onClick={() => runAbility(a.key === 'distill' ? 'distill' : a.key)}
              disabled={isTyping}
              title={a.desc}
              className={`text-[11px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-zinc-700 ${accent.text} disabled:opacity-40`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div ref={chatContainerRef} aria-live="polite" className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950/30">
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
        {isTyping && <div className={`${accent.text} text-xs`}>{who} is thinking...</div>}
      </div>

      <div className="p-4 border-t border-zinc-800">
        {messages.length <= 1 && !isTyping && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-[11px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-zinc-700 text-zinc-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder={sensei.placeholder}
            aria-label={`Message ${sensei.name}`}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none resize-none max-h-32 leading-relaxed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isTyping}
            aria-label="Send message"
            className={`px-5 py-3 rounded-2xl ${accent.btn} disabled:opacity-50 flex items-center justify-center`}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-[10px] text-zinc-600 mt-1.5 hidden sm:block">Enter to send · Shift+Enter for a new line</div>
      </div>
    </div>
  );
};

export default QuencyChat;
