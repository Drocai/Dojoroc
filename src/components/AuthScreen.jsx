import React, { useState } from 'react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';
import { Zap, LogIn, UserPlus, Loader2 } from 'lucide-react';

const accent = themeFor(activePack.brand.accent);
const { brand, sensei, lore } = activePack;
const COLORS = ['emerald', 'purple', 'blue', 'amber', 'rose', 'cyan'];

// Sign in or create a profile. A profile carries your XP, rank, scores and
// everything you learn across every room — and follows you to any device.
const AuthScreen = ({ onSignUp, onLogin }) => {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ username: '', password: '', display: '', color: 'emerald' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    setBusy(true);
    const r =
      mode === 'signup'
        ? await onSignUp(form.username, form.password, form.display, form.color)
        : await onLogin(form.username, form.password);
    if (r?.error) {
      setError(r.error);
      setBusy(false);
    }
    // On success the app swaps to the dojo; no need to unset busy.
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0f] overflow-auto">
      <div className="dojo-fx" aria-hidden="true" />
      <div className="hud relative w-[min(95vw,440px)] bg-zinc-900/80 border border-white/15 rounded-3xl p-7 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 mb-1">
          <Zap className={accent.text} />
          <div className="font-display tracking-wide dojo-glow">{brand.title}</div>
        </div>
        <p className="text-sm text-zinc-400 mb-5">
          {lore.canon} Sign in to {sensei.name} and your progress, rank, and everything you learn follows you —
          on any device.
        </p>

        <div className="flex gap-1.5 mb-5 bg-zinc-950 border border-zinc-800 rounded-2xl p-1">
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? `${accent.solid} text-white` : 'text-zinc-400'
            }`}
          >
            <UserPlus size={15} /> Create profile
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${
              mode === 'login' ? `${accent.solid} text-white` : 'text-zinc-400'
            }`}
          >
            <LogIn size={15} /> Log in
          </button>
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs text-zinc-400">Display name</label>
              <input
                value={form.display}
                onChange={(e) => set('display', e.target.value)}
                placeholder="Graysen"
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-zinc-400">Username</label>
            <input
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              autoCapitalize="none"
              placeholder="letters & numbers"
              className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="4+ characters"
              className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="text-xs text-zinc-400">Your color</label>
              <div className="flex gap-2 mt-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set('color', c)}
                    aria-label={c}
                    className={`w-8 h-8 rounded-full ${themeFor(c).solid} ${
                      form.color === c ? 'ring-2 ring-white' : 'opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-400 mt-3">{error}</p>}

        <button
          onClick={submit}
          disabled={busy}
          className={`w-full mt-5 px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : mode === 'signup' ? <UserPlus size={16} /> : <LogIn size={16} />}
          {mode === 'signup' ? 'Create my profile' : 'Log in'}
        </button>

        <p className="text-[11px] text-zinc-500 mt-4 text-center">
          Your password is encrypted and never shared. This is your private dojo profile.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
