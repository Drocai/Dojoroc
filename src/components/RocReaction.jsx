import React, { useEffect, useRef, useState } from 'react';
import RocAvatar from './RocAvatar';
import { PERSONAS, SPECIES } from '../lib/rocs';

// Lines the Roc pops up with, flavored by its personality, when something good
// happens. Kept short and punchy.
const LINES = {
  mission: {
    'calm-sensei': ['Well done. One step closer.', 'Good. We grow.', 'Steady progress.'],
    'hype-coach': ["LET'S GO! 🔥", 'CRUSHED IT!', 'That’s what I’m talking about!'],
    'trickster': ['Too easy 😏', 'Nicely played.', 'Sneaky-smart move.'],
    'strict-master': ['Acceptable. Continue.', 'Good form.', 'Discipline pays.'],
    'curious': ['Ooh, nice! What’s next?', 'Fascinating progress!', 'I learned that too!'],
  },
  arcade: {
    'calm-sensei': ['Sharp mind.', 'Focus rewarded.', '+XP, calmly earned.'],
    'hype-coach': ['HIGH SCORE ENERGY! ⚡', 'Combo king!', 'You’re on fire!'],
    'trickster': ['Style points 😎', 'Flashy. I like it.', 'Show-off (respect).'],
    'strict-master': ['Reflexes: improving.', 'Earned.', 'Train harder.'],
    'curious': ['Whoa, fun! Again?', 'Points + brain food!', 'Neat trick!'],
  },
  levelup: {
    'calm-sensei': ['A new belt. Honor it.'],
    'hype-coach': ['BELT UP!! 🥋🔥'],
    'trickster': ['Leveled up, naturally.'],
    'strict-master': ['Rank earned. Bow.'],
    'curious': ['New belt! New powers?!'],
  },
};

const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Floating companion in the bottom-center: pops in with a line + wobble when
// `event` changes ({ kind, n }), then auto-hides. n forces re-fire on repeats.
const RocReaction = ({ roc, event }) => {
  const [show, setShow] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (!roc || !event?.kind) return;
    const persona = roc.persona || SPECIES[roc.species]?.persona || 'calm-sensei';
    const bank = LINES[event.kind]?.[persona] || LINES[event.kind]?.['calm-sensei'] || [];
    if (!bank.length) return;
    setShow({ text: pick(bank) });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(null), 2600);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.kind, event?.n]);

  if (!show || !roc) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[65] flex flex-col items-center pointer-events-none belt-up">
      <div className="bg-zinc-900/95 border border-white/20 rounded-2xl px-3.5 py-2 text-sm text-zinc-100 shadow-xl shadow-black/50 max-w-[80vw] text-center">
        {show.text}
      </div>
      <div className="-mt-1 w-10 overflow-hidden h-2.5"><div className="w-3 h-3 bg-zinc-900 border-r border-b border-white/20 rotate-45 mx-auto -mt-1.5" /></div>
      <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
        <RocAvatar roc={roc} size={56} poke />
      </div>
    </div>
  );
};

export default RocReaction;
