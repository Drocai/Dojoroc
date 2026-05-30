import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Wand2, DoorOpen } from 'lucide-react';
import { CHAT_ENDPOINT } from '../../lib/quency';
import { validatePack, makePackId, enterPackData } from '../../../packs/index.js';
import { supabase } from '../../lib/supabase';

// The "head sensei" room builder. You give a short brief; Quency generates a
// full room (a new teacher) as JSON; you preview it and save it to the dojo.

// Lean schema on purpose: the client fills safe defaults for anything omitted,
// so the model can stay small and fast (and inside the function time limit).
const ARCHITECT_SYSTEM = `You are the Dojo Architect — you design kid-friendly learning "rooms".
Return ONLY one minified JSON object, nothing else (no prose, no code fences). Keep strings short.
Schema:
{"name":str,"subject":str,
"brand":{"title":UPPERCASE,"icon":one of ["Zap","Flame","Rocket","Gamepad2","Music","BookOpen","Brain","Sparkles"],"accent":one of ["emerald","purple","blue","amber","rose","cyan"],"coreLabel":str,"coreUnit":short},
"players":[{"key":slug,"label":mentorName,"chatName":mentorName,"color":accent,"role":"mentor"},{"key":slug,"label":studentName,"chatName":studentName,"color":accent,"role":"student"}],
"sensei":{"name":str,"title":"AI SENSEI","greeting":str,"placeholder":str},
"lore":{"tagline":str,"boot":str,"emptyActivity":str,"levelUpTemplate":"uses {name} {lvl}","arcadeXpTemplate":"uses {name} {xp}"},
"missions":[3 of {"id":slug,"title":str,"desc":short,"xp":100-250}],
"modes":[2 of {"key":slug,"label":str,"note":short,"system":a kid-safe teaching-persona prompt for this subject}],
"arcade":{"tips":[6 short fact strings],"quiz":[5 of {"q":str,"answers":[3 short strings],"correct":0-2}]},
"handoff":{"studentDefault":studentName,"aiPolishTemplate":"short instruction using {name}","questionGroups":[1 of {"title":str,"items":[[id,label,hint],[id,label,hint]]}],"blocks":[1 of {"key":slug,"title":str,"where":str,"bodyTemplate":"text using {name}"}]}}
Age-appropriate, specifically about the requested subject. ONLY the JSON object.`;

const RoomBuilder = ({ accent, onClose }) => {
  const [form, setForm] = useState({ subject: '', student: '', mentor: 'Dad', level: '', firstWin: '', vibe: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null); // validated data pack
  const [raw, setRaw] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const parsePack = (text) => {
    let t = String(text).trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const a = t.indexOf('{');
    const b = t.lastIndexOf('}');
    if (a !== -1 && b !== -1) t = t.slice(a, b + 1);
    return JSON.parse(t);
  };

  const generate = async () => {
    if (!form.subject.trim()) {
      setStatus('Tell Quency what you want to learn or build first.');
      return;
    }
    setBusy(true);
    setDraft(null);
    setStatus('Quency is designing the room…');
    const brief =
      `Design a learning room.\n` +
      `Subject / what we want to build or learn: ${form.subject}\n` +
      `Mentor name: ${form.mentor || 'Dad'}\n` +
      `Student name: ${form.student || 'Student'}\n` +
      `Current level: ${form.level || 'beginner'}\n` +
      `First tiny win to aim for: ${form.firstWin || 'a small first success'}\n` +
      `Vibe/theme: ${form.vibe || 'fun and encouraging'}`;
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: brief, model: 'sonnet', system: ARCHITECT_SYSTEM, maxTokens: 2600 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setRaw(data.reply || '');
      const parsed = parsePack(data.reply);
      const pack = validatePack({ ...parsed, id: makePackId(parsed.name || form.subject) });
      setDraft(pack);
      setStatus('Room ready — preview it below, then save.');
    } catch (err) {
      setStatus(`Quency had trouble building that: ${err.message}. Try again or tweak the brief.`);
    } finally {
      setBusy(false);
    }
  };

  const saveAndEnter = async () => {
    if (!draft) return;
    setBusy(true);
    setStatus('Saving the room to the dojo…');
    if (supabase) {
      const { error } = await supabase
        .from('dojo_packs')
        .insert({ id: draft.id, name: draft.name, subject: draft.subject, data: draft, owner: form.mentor || null });
      if (error) {
        setStatus(`Couldn't save: ${error.message}`);
        setBusy(false);
        return;
      }
    }
    enterPackData(draft); // caches + reloads into the new room
  };

  const Field = ({ label, k, placeholder }) => (
    <div>
      <label className="text-xs text-zinc-400">{label}</label>
      <input
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none"
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white flex items-center gap-1.5">
        <ArrowLeft size={15} /> Back to rooms
      </button>

      <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="font-display text-xl tracking-wide mb-1 flex items-center gap-2">
          <Wand2 className={accent.text} size={20} /> New Room
        </h2>
        <p className="text-sm text-zinc-400 mb-5">
          Tell Quency what you want to learn or build. He'll forge a new teacher — missions, an AI sensei, arcade quizzes,
          all of it — that you can enter and keep upgrading.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400">What do you want to learn or build?</label>
            <textarea
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder="e.g. Make my own Roblox tower-defense game / Learn Python / Master multiplication"
              className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none min-h-[64px]"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Mentor name" k="mentor" placeholder="Dad" />
            <Field label="Student name" k="student" placeholder="Graysen" />
            <Field label="Current level" k="level" placeholder="total beginner" />
            <Field label="First tiny win" k="firstWin" placeholder="spawn one enemy" />
          </div>
          <Field label="Vibe / theme (optional)" k="vibe" placeholder="cyberpunk, space, ninja…" />
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={generate}
            disabled={busy}
            className={`px-4 py-2 rounded-2xl ${accent.btn} disabled:opacity-50 text-sm font-medium flex items-center gap-1.5 text-white`}
          >
            <Sparkles size={15} /> {busy ? 'Working…' : 'Generate with Quency'}
          </button>
          {draft && (
            <button
              onClick={saveAndEnter}
              disabled={busy}
              className="px-4 py-2 rounded-2xl bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50 text-sm font-semibold flex items-center gap-1.5"
            >
              <DoorOpen size={15} /> Save &amp; Enter Room
            </button>
          )}
        </div>
        {status && <p className={`text-xs ${accent.textSoft} mt-3`}>{status}</p>}
      </div>

      {draft && (
        <div className="hud bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display tracking-wide text-lg">{draft.brand.title}</h3>
            <span className="text-[11px] font-mono text-zinc-500">{draft.subject}</span>
          </div>
          <p className="text-sm text-zinc-300 italic">"{draft.sensei.greeting}"</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Missions</div>
              <ul className="space-y-1 text-zinc-300">
                {draft.missions.map((m) => (
                  <li key={m.id} className="flex justify-between gap-2">
                    <span className="truncate">{m.title}</span>
                    <span className={`font-mono ${accent.text}`}>+{m.xp}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Quency modes</div>
              <ul className="space-y-1 text-zinc-300">
                {draft.modes.map((m) => (
                  <li key={m.key} className="truncate">• {m.label} <span className="text-zinc-500">— {m.note}</span></li>
                ))}
              </ul>
            </div>
          </div>
          {draft.arcade.quiz[0] && (
            <div className="text-xs text-zinc-400">
              Sample arcade question: <span className="text-zinc-200">{draft.arcade.quiz[0].q}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomBuilder;
