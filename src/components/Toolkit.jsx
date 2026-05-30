import React, { useState } from 'react';
import { Swords, Plus, X, Copy, Check } from 'lucide-react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const accent = themeFor(activePack.brand.accent);

// Your portable "moves" — commands, snippets, and secrets you save once and
// carry into every room (like a technique you learned in one discipline and
// reuse in another). Stored on your profile, so it follows you anywhere.
const Toolkit = ({ value = [], onChange }) => {
  const [items, setItems] = useState(value);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(null);

  const commit = (next) => {
    setItems(next);
    onChange(next);
  };
  const add = () => {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    commit([...items, { id: `${Date.now()}`, title: t.slice(0, 60), body: b.slice(0, 1000) }].slice(0, 50));
    setTitle('');
    setBody('');
  };
  const remove = (id) => commit(items.filter((i) => i.id !== id));
  const copy = (i) => {
    navigator.clipboard?.writeText(i.body).then(() => {
      setCopied(i.id);
      setTimeout(() => setCopied(null), 1200);
    });
  };

  return (
    <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
      <div>
        <h3 className="font-display tracking-wide text-lg flex items-center gap-2">
          <Swords size={18} className={accent.text} /> My Toolkit
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Save your moves — commands, snippets, secrets. They carry into every room, and Quency knows them.
        </p>
      </div>

      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Move name (e.g. Start a Git repo)"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none"
        />
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="The command / snippet / secret…"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none min-h-[44px] font-mono"
          />
          <button onClick={add} className={`px-3 rounded-xl ${accent.btn} text-white flex items-center self-stretch`}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="text-xs text-zinc-600">No moves saved yet.</div>}
        {items.map((i) => (
          <div key={i.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="text-sm font-semibold text-zinc-200 truncate">{i.title}</div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => copy(i)} className={`text-xs flex items-center gap-1 ${accent.text} hover:opacity-80`}>
                  {copied === i.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button onClick={() => remove(i.id)} className="text-zinc-500 hover:text-rose-400" aria-label="Remove">
                  <X size={14} />
                </button>
              </div>
            </div>
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono">{i.body}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolkit;
