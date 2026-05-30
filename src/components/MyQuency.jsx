import React, { useState } from 'react';
import { Brain, Plus, X, Target, Lightbulb } from 'lucide-react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const accent = themeFor(activePack.brand.accent);
const sensei = activePack.sensei;

// Editor for your portable Quency memory. Everything here is saved to your
// profile and follows you into every room — it's the assistant you're training.
const MyQuency = ({ value = {}, onChange }) => {
  const [about, setAbout] = useState(value.about || '');
  const [goals, setGoals] = useState(value.goals || []);
  const [facts, setFacts] = useState(value.facts || []);
  const [goalInput, setGoalInput] = useState('');
  const [factInput, setFactInput] = useState('');

  const save = (next) =>
    onChange({ about: next.about ?? about, goals: next.goals ?? goals, facts: next.facts ?? facts });

  const addGoal = () => {
    const g = goalInput.trim();
    if (!g) return;
    const next = [...goals, g].slice(0, 12);
    setGoals(next);
    setGoalInput('');
    save({ goals: next });
  };
  const addFact = () => {
    const f = factInput.trim();
    if (!f) return;
    const next = [...facts, f].slice(0, 20);
    setFacts(next);
    setFactInput('');
    save({ facts: next });
  };
  const removeGoal = (i) => {
    const next = goals.filter((_, x) => x !== i);
    setGoals(next);
    save({ goals: next });
  };
  const removeFact = (i) => {
    const next = facts.filter((_, x) => x !== i);
    setFacts(next);
    save({ facts: next });
  };

  const Chip = ({ text, onRemove }) => (
    <span className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-700 rounded-full pl-3 pr-1.5 py-1 text-xs text-zinc-200">
      {text}
      <button onClick={onRemove} className="text-zinc-500 hover:text-rose-400 p-0.5" aria-label="Remove">
        <X size={12} />
      </button>
    </span>
  );

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5">
      <div>
        <h3 className="font-display tracking-wide text-lg flex items-center gap-2">
          <Brain size={18} className={accent.text} /> My {sensei.name}
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          What you put here, {sensei.name} remembers — in every room, on every device. This is the assistant you're
          training.
        </p>
      </div>

      <div>
        <label className="text-xs text-zinc-400">About me (how I like to learn)</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          onBlur={() => save({ about })}
          placeholder="e.g. I'm 10, I build Roblox games, I like quick steps and examples, and I get bored by long explanations."
          className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none min-h-[70px]"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 flex items-center gap-1.5"><Target size={13} className={accent.text} /> My goals</label>
        <div className="flex gap-2 mt-1">
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="Add a goal…"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none"
          />
          <button onClick={addGoal} className={`px-3 rounded-xl ${accent.btn} text-white flex items-center`}>
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {goals.length === 0 && <span className="text-xs text-zinc-600">No goals yet.</span>}
          {goals.map((g, i) => (
            <Chip key={i} text={g} onRemove={() => removeGoal(i)} />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 flex items-center gap-1.5"><Lightbulb size={13} className="text-amber-400" /> Things {sensei.name} should remember</label>
        <div className="flex gap-2 mt-1">
          <input
            value={factInput}
            onChange={(e) => setFactInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFact()}
            placeholder="Teach a fact about you…"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none"
          />
          <button onClick={addFact} className={`px-3 rounded-xl ${accent.btn} text-white flex items-center`}>
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {facts.length === 0 && <span className="text-xs text-zinc-600">Nothing yet.</span>}
          {facts.map((f, i) => (
            <Chip key={i} text={f} onRemove={() => removeFact(i)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyQuency;
