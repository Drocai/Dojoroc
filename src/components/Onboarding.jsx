import React, { useState } from 'react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';
import { Zap, Trophy, MessageSquare, LayoutGrid, Gamepad2, ArrowRight, Sparkles } from 'lucide-react';

const accent = themeFor(activePack.brand.accent);
const { sensei, brand, lore } = activePack;

const TOUR = [
  { icon: Trophy, title: 'Missions', body: 'Clear real tasks to earn XP, level up your belt, and power your Dojo Core.' },
  { icon: MessageSquare, title: `${sensei.name} AI`, body: 'Your AI sensei. Switch models + teaching modes and ask anything — anytime, on your own.' },
  { icon: LayoutGrid, title: 'Rooms', body: `Each room is a teacher. Enter one, or have ${sensei.name} build a brand-new one for anything you want to learn.` },
  { icon: Gamepad2, title: 'Arcade', body: 'Waiting on something? Pop a learn-while-you-play game over your screen.' },
];

// One-time post-signup tour. The name now comes from the profile.
const Onboarding = ({ name, onDone }) => {
  const [step, setStep] = useState(0); // 0 = welcome, 1 = tour

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="dojo-fx" aria-hidden="true" />
      <div className="hud relative w-[min(95vw,460px)] bg-zinc-900/80 border border-white/15 rounded-3xl p-7 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-5">
          <Zap className={accent.text} />
          <div className="font-display tracking-wide dojo-glow">{brand.title}</div>
        </div>

        {step === 0 ? (
          <div className="space-y-4">
            <div className={`text-xs uppercase tracking-[2px] ${accent.textSoft}`}>{sensei.title}</div>
            <h2 className="font-display text-xl">Welcome{name ? `, ${name}` : ''}.</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              I'm <span className={accent.text}>{sensei.name}</span>, your sensei. {lore.canon}
            </p>
            <p className="text-sm text-zinc-400">You learn by doing — clear missions, train with me, and build new rooms for anything you want to master. Here's the quick tour.</p>
            <button onClick={() => setStep(1)} className={`w-full mt-1 px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-medium flex items-center justify-center gap-2`}>
              Show me <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-xl">Here's your dojo.</h2>
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
            <button onClick={onDone} className={`w-full px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-medium flex items-center justify-center gap-2`}>
              <Sparkles size={16} /> Enter the Dojo
            </button>
          </div>
        )}

        <div className="flex justify-center gap-1.5 mt-5">
          {[0, 1].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? `w-5 ${accent.solid}` : 'w-1.5 bg-zinc-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
