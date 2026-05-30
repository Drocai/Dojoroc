import React, { useState } from 'react';
import { activePack } from '../../packs/index.js';
import { themeFor } from '../lib/theme';
import { LogIn, UserPlus, Loader2, KeyRound } from 'lucide-react';

const accent = themeFor(activePack.brand.accent);
const COLORS = ['emerald', 'purple', 'blue', 'amber', 'rose', 'cyan'];

// Sign in or create a profile. A profile carries your XP, rank, scores and
// everything you learn across every room — and follows you to any device.
const AuthScreen = ({ onSignUp, onLogin, onReset }) => {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ username: '', password: '', display: '', color: 'emerald', code: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.username.trim() &&
    form.password &&
    (mode !== 'signup' || form.display.trim()) &&
    (mode !== 'reset' || form.code.trim());

  const submit = async () => {
    if (!canSubmit) return;
    setError('');
    setBusy(true);
    const r =
      mode === 'signup'
        ? await onSignUp(form.username, form.password, form.display, form.color)
        : mode === 'reset'
        ? await onReset(form.username, form.code, form.password)
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
      <div className="hud relative w-[min(95vw,420px)] bg-zinc-900/80 border border-white/15 rounded-3xl p-7 shadow-2xl shadow-black/60">
        <div className="text-center mb-5">
          <div className="text-5xl mb-2" aria-hidden="true">🪨</div>
          <div className="font-display text-2xl tracking-wide dojo-glow">SPOUT ROC DOJO</div>
          <p className="text-sm text-zinc-400 mt-2">
            {mode === 'signup' ? 'Train your own AI companion. Pick a name and dive in — your Roc levels up with you, on any device.'
              : mode === 'reset' ? 'Enter your username and recovery code to set a new password.'
              : 'Welcome back. Log in to your dojo.'}
          </p>
        </div>

        {mode === 'reset' ? (
          <div className="mb-5 text-sm font-semibold flex items-center gap-1.5"><KeyRound size={15} className={accent.text} /> Reset your password</div>
        ) : (
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
        )}

        <div className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs text-zinc-400">Display name</label>
              <input
                value={form.display}
                onChange={(e) => set('display', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Your name"
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-zinc-400">Username</label>
            <input
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoCapitalize="none"
              autoComplete="username"
              placeholder="letters & numbers"
              className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </div>
          {mode === 'reset' && (
            <div>
              <label className="text-xs text-zinc-400">Recovery code</label>
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="the code you saved at signup"
                className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm outline-none font-mono"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-zinc-400">{mode === 'reset' ? 'New password' : 'Password'}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
          disabled={busy || !canSubmit}
          className={`w-full mt-5 px-4 py-3 rounded-2xl ${accent.btn} text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : mode === 'signup' ? <UserPlus size={16} /> : mode === 'reset' ? <KeyRound size={16} /> : <LogIn size={16} />}
          {mode === 'signup' ? 'Enter the Dojo' : mode === 'reset' ? 'Reset password' : 'Log in'}
        </button>

        <div className="text-center mt-3">
          {mode === 'reset' ? (
            <button onClick={() => { setMode('login'); setError(''); }} className="text-xs text-zinc-400 hover:text-white">
              ← Back to log in
            </button>
          ) : (
            <button onClick={() => { setMode('reset'); setError(''); }} className="text-xs text-zinc-400 hover:text-white">
              Forgot your password?
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-500 mt-3 text-center">
          Your password is encrypted and never shared. This is your private dojo profile.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
