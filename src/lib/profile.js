// Profile auth client. All calls go through locked-down SECURITY DEFINER RPCs
// (passwords are bcrypt-hashed in the DB and never returned). We keep a small
// session {username, token} in localStorage so a profile resumes on reload and
// follows the user across devices when they sign in.

import { supabase } from './supabase';

const SKEY = 'dojo.session';

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SKEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(s) {
  localStorage.setItem(SKEY, JSON.stringify({ username: s.username, token: s.token }));
  if (s.displayName) localStorage.setItem('dojo.displayName', s.displayName);
}

export function clearSession() {
  localStorage.removeItem(SKEY);
}

async function rpc(fn, args) {
  if (!supabase) return { error: 'No connection to the dojo.' };
  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { error: error.message };
  return data || { error: 'No response.' };
}

export const signUp = (username, password, display, color) =>
  rpc('dojo_signup', { p_username: username, p_password: password, p_display: display, p_color: color });
export const login = (username, password) => rpc('dojo_login', { p_username: username, p_password: password });
export const resume = (username, token) => rpc('dojo_resume', { p_username: username, p_token: token });
export const saveData = (username, token, data) =>
  rpc('dojo_save', { p_username: username, p_token: token, p_data: data });
export const reset = (username, code, newPassword) =>
  rpc('dojo_reset', { p_username: username, p_code: code, p_new_password: newPassword });
export const deletePack = (id, username, token) =>
  rpc('dojo_delete_pack', { p_id: id, p_username: username, p_token: token });
export const leaderboard = () => rpc('dojo_leaderboard', {});
export const publicProfile = (username) => rpc('dojo_public_profile', { p_username: username });
export const giftRoc = (from, token, to, roc) =>
  rpc('dojo_gift_roc', { p_from: from, p_token: token, p_to: to, p_roc: roc });

// Kick off Stripe checkout for Pro; returns { url } to redirect to (or {error}).
export async function startProCheckout(username) {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return await res.json();
  } catch {
    return { error: 'Could not reach checkout.' };
  }
}
