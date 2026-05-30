import { useState, useEffect, useRef, useCallback } from 'react';
import * as P from '../lib/profile';

// Current signed-in profile + auth actions. profile.data is the portable blob
// that carries progress/scores/portfolio across rooms and devices. Saves are
// debounced so frequent updates (task toggles, arcade rounds) batch into one
// write.
export function useAuth() {
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [pendingRecovery, setPendingRecovery] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    (async () => {
      const s = P.loadSession();
      if (s?.username && s?.token) {
        const r = await P.resume(s.username, s.token);
        if (r && !r.error) {
          setProfile(r);
          P.saveSession({ username: r.username, token: r.token, displayName: r.display_name });
        } else {
          P.clearSession(); // stale/invalid token — don't keep retrying it
        }
      }
      setReady(true);
    })();
  }, []);

  // If the tab is backgrounded or closed with a debounced save still pending,
  // flush it immediately so progress is never lost.
  useEffect(() => {
    const flush = () => {
      if (!pendingRef.current) return;
      clearTimeout(saveTimer.current);
      const { username, token, data } = pendingRef.current;
      pendingRef.current = null;
      P.saveData(username, token, data);
      setSaving(false);
    };
    const onVisibility = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  const adopt = (r) => {
    setProfile(r);
    P.saveSession({ username: r.username, token: r.token, displayName: r.display_name });
  };

  const signUp = async (u, p, d, c) => {
    const r = await P.signUp(u, p, d, c);
    if (r && !r.error) {
      if (r.recovery_code) setPendingRecovery({ username: r.username, code: r.recovery_code });
      adopt(r);
    }
    return r;
  };
  const login = async (u, p) => {
    const r = await P.login(u, p);
    if (r && !r.error) adopt(r);
    return r;
  };
  const reset = async (u, code, p) => {
    const r = await P.reset(u, code, p);
    if (r && !r.error) adopt(r);
    return r;
  };
  const logout = () => {
    P.clearSession();
    setProfile(null);
  };

  // Re-pull the profile from the server (e.g. after a Pro purchase grants it).
  const refresh = useCallback(async () => {
    const s = P.loadSession();
    if (!s?.username || !s?.token) return;
    const r = await P.resume(s.username, s.token);
    if (r && !r.error) setProfile(r);
  }, []);

  // Update profile.data (function or object) and persist, debounced. Skips the
  // write entirely when the updater returns the same data (a no-op).
  const updateData = useCallback((updater) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const data = typeof updater === 'function' ? updater(prev.data || {}) : updater;
      if (data === prev.data) return prev; // no change — don't save
      const next = { ...prev, data };
      pendingRef.current = { username: next.username, token: next.token, data };
      clearTimeout(saveTimer.current);
      setSaving(true);
      saveTimer.current = setTimeout(async () => {
        await P.saveData(next.username, next.token, data);
        pendingRef.current = null;
        setSaving(false);
      }, 600);
      return next;
    });
  }, []);

  return { profile, ready, saving, signUp, login, reset, logout, refresh, updateData, pendingRecovery, clearRecovery: () => setPendingRecovery(null) };
}
