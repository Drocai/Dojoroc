import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Realtime Dad <-> Graysen chat backed by the shared `chat_messages` table.
// Both people just need the same room code. Mirrors the HTML handoff-hub chat.
export function useRoomChat(roomCode) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!supabase || !roomCode) {
      setConnected(false);
      setMessages([]);
      return;
    }

    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_code', roomCode)
        .order('created_at', { ascending: true })
        .limit(200);
      if (active && data) setMessages(data);
    };
    load();

    const channel = supabase
      .channel(`room-${roomCode}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]
          );
        }
      )
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  const sendMessage = useCallback(
    async (sender, body) => {
      const text = (body || '').trim();
      if (!supabase || !roomCode || !text) return { error: 'Not connected' };
      const { error } = await supabase
        .from('chat_messages')
        .insert({ room_code: roomCode, sender: sender.slice(0, 40), body: text.slice(0, 2000) });
      return { error };
    },
    [roomCode]
  );

  return { messages, connected, sendMessage, enabled: !!supabase };
}
