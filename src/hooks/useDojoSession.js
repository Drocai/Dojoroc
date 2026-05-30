import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { activePack } from '../../packs/index.js';

const DEFAULT_PLAYER = { xp: 0, bonusXp: 0, hz: 100, tasks: [] };

// Each room keeps its own progress in its own dojo_sessions row. The built-in
// starter stays on the original 'main' row so existing progress is preserved.
const SESSION_ID = activePack.id === 'frequency-dojo' ? 'main' : `pack:${activePack.id}`;

// Seed a player slot for every player the active room defines.
const seedSession = () => {
  const boot = activePack.lore?.boot || 'Dojo initialized.';
  const base = { logs: [boot], scores: {} };
  for (const p of activePack.players) base[p.key] = { ...DEFAULT_PLAYER };
  return base;
};

export function useDojoSession() {
  const [session, setSession] = useState(seedSession);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const channel = supabase
      .channel(`dojo-${SESSION_ID}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dojo_sessions', filter: `id=eq.${SESSION_ID}` },
        (payload) => {
          if (payload.new && payload.new.id === SESSION_ID) setSession(payload.new);
        }
      )
      .subscribe();

    const load = async () => {
      const { data } = await supabase.from('dojo_sessions').select('*').eq('id', SESSION_ID).maybeSingle();
      if (data) setSession(data);
      setLoading(false);
    };

    load();
    return () => supabase.removeChannel(channel);
  }, []);

  const updateSession = async (updates) => {
    const newSession = { ...session, ...updates };
    setSession(newSession);

    if (supabase) {
      await supabase.from('dojo_sessions').upsert({ id: SESSION_ID, ...newSession });
    }
  };

  return { session, updateSession, loading };
}
