import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { activePack } from '../../packs/index.js';

const DEFAULT_PLAYER = { xp: 0, hz: 100, tasks: [] };

// Seed a player slot for every player the active pack defines, so the session
// shape follows the pack (not a hard-coded Derrick/Graysen).
const seedSession = () => {
  const base = { logs: ['Dojo initialized. Hermes uplink established.'] };
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
      .channel('dojo-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'dojo_sessions' 
      }, (payload) => {
        if (payload.new) setSession(payload.new);
      })
      .subscribe();

    const load = async () => {
      const { data } = await supabase
        .from('dojo_sessions')
        .select('*')
        .eq('id', 'main')
        .single();

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
      await supabase
        .from('dojo_sessions')
        .upsert({ id: 'main', ...newSession });
    }
  };

  return { session, updateSession, loading };
}
