import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Loader2, ArrowRight } from 'lucide-react';
import { themeFor } from '../lib/theme';
import { activePack } from '../../packs/index.js';
import { CHAT_ENDPOINT } from '../lib/quency';

const { sensei } = activePack;
const accent = themeFor(activePack.brand.accent);

// Scripted tour steps — each can jump the app to a view via `go`.
const STEPS = [
  { title: `Hi, I'm ${sensei.name}! 👋`, body: `Welcome to the dojo. I'll show you around in a few taps — or ask me anything anytime. Ready?`, cta: 'Show me around' },
  { title: 'Meet your Roc 🪨', body: `In the Rocs tab you've got your own companion — a little Roc you train, dress up, and level up. Tap it to make it wobble! It travels everywhere with you.`, cta: 'Cool, next', go: 'rocs' },
  { title: 'Clear Missions & Quests 🥋', body: `On the Missions tab, check off tasks and finish daily quests to earn XP and rank up your belt. Come back daily for streak bonuses!`, cta: 'Got it', go: 'missions' },
  { title: 'Talk to me anytime 💬', body: `In my AI tab you can ask me anything. Tap powers like "Quiz Me," and hit "Remember this" so I learn about you.`, cta: 'Nice', go: 'quency' },
  { title: 'Explore the Gyms 🌍', body: `Tap "Rooms" up top to see the Dojo Map. Walk your Roc into Space, Math, Art, or Music — each has its own fun game. That's it — go have fun!`, cta: 'Let\'s go!' },
];

// Quency Guide — greets new players, runs a short scripted tour that navigates
// the app, and doubles as a live "what do I do?" helper. Auto-opens once.
const QuencyGuide = ({ onNavigate, onOpenHub, displayName, ready = true }) => {
  const seenKey = 'dojo.guideSeen';
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('tour'); // 'tour' | 'ask'
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);

  // Auto-open once, but only after the welcome splash is done (ready).
  useEffect(() => {
    if (!ready) return;
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(seenKey)) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [ready]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [msgs, busy]);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(seenKey, '1'); } catch { /* ignore */ }
  };

  const advance = () => {
    const s = STEPS[step];
    if (s.go) onNavigate?.(s.go);
    if (step >= STEPS.length - 1) { onOpenHub?.(); return dismiss(); }
    setStep(step + 1);
  };

  const ask = async (q) => {
    const question = (q || input).trim();
    if (!question || busy) return;
    setMsgs((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          model: 'haiku',
          system:
            `You are ${sensei.name}, the friendly guide inside the Spout Roc Dojo app. Answer in 1-3 short sentences, warm and kid-friendly. ` +
            `Help the user navigate. The app has these tabs at the top: Missions (tasks + daily quests + XP), ` +
            `${sensei.name} AI (chat with powers), Rocs (your companion you train/dress/spar/gift), Handoff Kit, and Profile (belt, gallery, share). ` +
            `Up top, "Rooms" opens the Dojo Map of gyms (Space, Math, Art, Music, Code) — walk your Roc in to train. ` +
            `Bottom corners: a game controller (arcade) and a chat bubble. Tell them exactly which tab/button to tap.`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMsgs((m) => [...m, { role: 'q', text: data.reply || "Tap the tabs up top — Missions, Rocs, and my AI tab are the main ones!" }]);
    } catch {
      setMsgs((m) => [...m, { role: 'q', text: 'Try the tabs up top — Missions, Rocs, and my AI tab!' }]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label={`Ask ${sensei.name}`}
        className={`fixed bottom-5 right-20 z-50 w-14 h-14 rounded-full ${accent.btn} text-white shadow-lg shadow-black/40 flex items-center justify-center transition-transform active:scale-95`}
        title={`Ask ${sensei.name} where to go`}
      >
        <Sparkles size={22} />
      </button>
    );
  }

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[58] flex items-end sm:items-center justify-center p-4 bg-black/50" onClick={dismiss}>
      <div className="hud relative w-[min(96vw,400px)] bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-zinc-800">
          <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${accent.avatar}`}><Sparkles className={accent.text} size={18} /></div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{sensei.name}</div>
            <div className={`text-[10px] -mt-0.5 ${accent.textSoft}`}>Your guide</div>
          </div>
          <button onClick={dismiss} className="text-zinc-500 hover:text-white p-1" aria-label="Close"><X size={18} /></button>
        </div>

        {mode === 'tour' ? (
          <div className="p-5">
            <div className="font-display text-lg mb-1">{s.title}</div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">{displayName && step === 0 ? s.body.replace('Welcome', `Welcome, ${displayName}`) : s.body}</p>
            <button onClick={advance} className={`w-full px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-medium flex items-center justify-center gap-2`}>
              {s.cta} <ArrowRight size={16} />
            </button>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? `w-5 ${accent.solid}` : 'w-1.5 bg-zinc-700'}`} />)}
              </div>
              <button onClick={() => { setMode('ask'); if (!msgs.length) ask('What can I do here?'); }} className="text-[11px] text-zinc-400 hover:text-white">Ask me instead →</button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div ref={logRef} className="h-56 overflow-y-auto space-y-2.5 mb-3 px-1">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${m.role === 'user' ? `${accent.solid} text-white` : 'bg-zinc-800 text-zinc-200'}`}>{m.text}</div>
                </div>
              ))}
              {busy && <div className={`${accent.text} text-xs`}>{sensei.name} is typing…</div>}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['Where do I start?', 'How do I level up my Roc?', 'Take me to a gym'].map((q) => (
                <button key={q} onClick={() => ask(q)} className="text-[11px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-zinc-700 text-zinc-300">{q}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder={`Ask ${sensei.name}…`} className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm outline-none" />
              <button onClick={() => ask()} disabled={busy} className={`px-4 rounded-2xl ${accent.btn} text-white disabled:opacity-50 flex items-center`}>{busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuencyGuide;
