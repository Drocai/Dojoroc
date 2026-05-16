import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_PLAYER = { xp: 0, hz: 100, tasks: [] };

export function useDojoSession() {
  const [session, setSession] = useState({
    derrick: DEFAULT_PLAYER,
    graysen: DEFAULT_PLAYER,
    logs: ["Dojo initialized. Hermes uplink established."]
  });
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
