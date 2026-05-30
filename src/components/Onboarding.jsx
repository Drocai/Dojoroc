import React, { useState } from 'react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';
import { Zap, Trophy, MessageSquare, LayoutGrid, Gamepad2, ArrowRight, Sparkles } from 'lucide-react';

const accent = themeFor(activePack.brand.accent);
const { sensei, brand, lore } = activePack;

export const DISPLAY_NAME_KEY = 'dojo.displayName';
const ONBOARDED_KEY = 'dojo.onboarded';

const TOUR = [
  { icon: Trophy, title: 'Missions', body: 'Clear real tasks to earn XP and power up your Dojo Core.' },
  { icon: MessageSquare, title: `${sensei.name} AI`, body: 'Your AI sensei. Switch models + teaching modes and ask anything.' },
  { icon: LayoutGrid, title: 'Rooms', body: `Each room is a teacher. Enter one, or have ${sensei.name} build a new one for anything you want to learn.` },
  { icon: Gamepad2, title: 'Arcade', body: 'Stuck waiting? Pop a learn-while-you-play game over your screen.' },
];

// First-run welcome from the master sensei. Explains the dojo and grabs a name
// so things feel personal. (Full user accounts come next — this is the bridge.)
const Onboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const finish = () => {
    const clean = name.trim().slice(0, 30);
    if (clean) localStorage.setItem(DISPLAY_NAME_KEY, clean);
    localStorage.setItem(ONBOARDED_KEY, '1');
    onDone(clean);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="dojo-fx" aria-hidden="true" />
      <div className="hud relative w-[min(95vw,460px)] bg-zinc-900/80 border border-white/15 rounded-3xl p-7 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-5">
          <Zap className={accent.text} />
          <div className="font-display tracking-wide dojo-glow">{brand.title}</div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className={`text-xs uppercase tracking-[2px] ${accent.textSoft}`}>{sensei.title}</div>
            <h2 className="font-display text-xl">Welcome to the Dojo.</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              I'm <span className={accent.text}>{sensei.name}</span>, your sensei. {lore.canon}
            </p>
            <p className="text-sm text-zinc-400">In here, you learn by doing — clear missions, train with me, and build new rooms for anything you want to master.</p>
            <button onClick={() => setStep(1)} className={`w-full mt-2 px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-medium flex items-center justify-center gap-2`}>
              Let's go <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl">What should I call you?</h2>
            <p className="text-sm text-zinc-400">This becomes your name in chat and on your stats. You'll get a full profile that carries your progress soon.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
              placeholder="e.g. Logan"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="px-4 py-3 rounded-2xl bg-white/5 text-zinc-300 text-sm">Back</button>
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className={`flex-1 px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2`}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl">Here's your dojo{name.trim() ? `, ${name.trim()}` : ''}.</h2>
            <div className="space-y-2.5">
              {TOUR.map((t) => (
                <div key={t.title} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  <t.icon size={18} className={`${accent.text} mt-0.5 flex-shrink-0`} />
                  <div>
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-xs text-zinc-400">{t.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={finish} className={`w-full px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-medium flex items-center justify-center gap-2`}>
              <Sparkles size={16} /> Enter the Dojo
            </button>
          </div>
        )}

        <div className="flex justify-center gap-1.5 mt-5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? `w-5 ${accent.solid}` : 'w-1.5 bg-zinc-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
