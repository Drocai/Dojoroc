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
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const s = P.loadSession();
      if (s?.username && s?.token) {
        const r = await P.resume(s.username, s.token);
        if (r && !r.error) {
          setProfile(r);
          P.saveSession({ username: r.username, token: r.token, displayName: r.display_name });
        }
      }
      setReady(true);
    })();
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

  // Update profile.data (function or object) and persist, debounced.
  const updateData = useCallback((updater) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const data = typeof updater === 'function' ? updater(prev.data || {}) : updater;
      const next = { ...prev, data };
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        P.saveData(next.username, next.token, next.data);
      }, 600);
      return next;
    });
  }, []);

  return { profile, ready, signUp, login, reset, logout, updateData, pendingRecovery, clearRecovery: () => setPendingRecovery(null) };
}
