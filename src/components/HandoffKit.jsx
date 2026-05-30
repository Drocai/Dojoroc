import React, { useState } from 'react';
import { Copy, Sparkles, Download, Send } from 'lucide-react';
import { CHAT_ENDPOINT } from '../lib/quency';
import { supabase } from '../lib/supabase';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';

const { handoff, modes } = activePack;
const accent = themeFor(activePack.brand.accent);
// The Data-Translator-style mode (used to polish answers); fall back to the
// last mode or the first if none is named that.
const translatorMode = (modes.find((m) => m.key === 'translator') || modes[modes.length - 1] || modes[0]).key;

const HandoffKit = () => {
  const [answers, setAnswers] = useState({ studentName: handoff.studentDefault });
  const [sheet, setSheet] = useState('');
  const [status, setStatus] = useState('');
  const [polishing, setPolishing] = useState(false);

  const set = (id, value) => setAnswers((a) => ({ ...a, [id]: value }));

  const generate = () => {
    setSheet(handoff.generateSheet(answers));
    setStatus('Sheet generated below. Copy each block into Claude.');
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => setStatus('Copied to clipboard ✓'));
  };

  const download = () => {
    const text = sheet || handoff.generateSheet(answers);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePack.id}-handoff-sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Uses Quency's Data Translator mode to polish the rough answers into a
  // clean preferences block — the same proxy that powers the chat.
  const aiPolish = async () => {
    setPolishing(true);
    setStatus(`Asking ${activePack.sensei.name} to polish the preferences block...`);
    const message = handoff.aiPolishPrompt(answers);
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model: 'sonnet', mode: translatorMode, pack: activePack.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      const base = sheet || handoff.generateSheet(answers);
      setSheet(`${base}\n\n============================================================\nAI-POLISHED PREFERENCES (review before use)\n============================================================\n${data.reply}\n`);
      setStatus('AI-polished block added to the bottom of the sheet.');
    } catch (err) {
      setStatus(`AI Polish needs the deployed proxy: ${err.message}`);
    } finally {
      setPolishing(false);
    }
  };

  const submit = async () => {
    if (!supabase) {
      setStatus('Supabase not configured — cannot submit.');
      return;
    }
    setStatus('Submitting packet to Supabase...');
    const { error } = await supabase.from('graysen_handoff_packets').insert({
      recipient_name: answers.studentName || handoff.studentDefault,
      source: 'dojo_app',
      packet: { ...answers, pack: activePack.id, generatedAt: new Date().toISOString() },
    });
    setStatus(error ? `Submit failed: ${error.message}` : `Packet submitted to ${activePack.players[0].chatName} ✓`);
  };

  const blocks = handoff.buildBlocks(answers);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-1">Handoff Kit</h2>
        <p className="text-sm text-zinc-400 mb-5">
          {handoff.studentDefault} answers once. The dojo translates it into Claude preferences, project instructions,
          and a CLAUDE.md — ready to paste, or send straight to {activePack.players[0].chatName}.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-400">Name</label>
            <input
              value={answers.studentName || ''}
              onChange={(e) => set('studentName', e.target.value)}
              className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        {handoff.questionGroups.map((group) => (
          <fieldset key={group.title} className="mt-5 border border-zinc-800 rounded-2xl p-4">
            <legend className={`px-2 text-xs font-mono uppercase tracking-wide ${accent.textSoft}`}>
              {group.title}
            </legend>
            <div className="space-y-3">
              {group.items.map(([id, label, hint]) => (
                <div key={id}>
                  <label className="text-sm font-medium">{label}</label>
                  {hint && <p className="text-[11px] text-zinc-500 mb-1">{hint}</p>}
                  <textarea
                    value={answers[id] || ''}
                    onChange={(e) => set(id, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none min-h-[56px]"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex flex-wrap gap-2 mt-5">
          <button onClick={generate} className={`px-4 py-2 rounded-2xl ${accent.btn} text-sm font-medium`}>
            Generate Sheet
          </button>
          <button onClick={aiPolish} disabled={polishing} className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-medium flex items-center gap-1.5">
            <Sparkles size={15} /> AI Polish
          </button>
          <button onClick={download} className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-sm flex items-center gap-1.5">
            <Download size={15} /> Download
          </button>
          <button onClick={submit} className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-sm flex items-center gap-1.5">
            <Send size={15} /> Send to {activePack.players[0].chatName}
          </button>
        </div>
        {status && <p className={`text-xs ${accent.textSoft} mt-3`}>{status}</p>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {blocks.map((b) => (
          <div key={b.key} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="font-semibold tracking-tight">{b.title}</h3>
              <button onClick={() => copy(b.body)} className={`${accent.text} hover:opacity-80 text-xs flex items-center gap-1`}>
                <Copy size={13} /> Copy
              </button>
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wide text-zinc-500 mb-2">→ {b.where}</div>
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-56 overflow-auto">
              {b.body}
            </pre>
          </div>
        ))}
      </div>

      {sheet && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold tracking-tight">Full Setup Sheet</h3>
            <button onClick={() => copy(sheet)} className={`${accent.text} hover:opacity-80 text-xs flex items-center gap-1`}>
              <Copy size={13} /> Copy All
            </button>
          </div>
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap bg-zinc-950 border border-zinc-800 rounded-xl p-4 max-h-96 overflow-auto">
            {sheet}
          </pre>
        </div>
      )}
    </div>
  );
};

export default HandoffKit;
