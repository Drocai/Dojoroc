import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const QuencyChat = () => {
  const [messages, setMessages] = useState([
    { role: 'quency', text: "Hello Sensei. I'm Quency. How can I help with Hermes setup today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL;

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    if (!PROXY_URL) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'system', text: "AI proxy not configured. Add VITE_AI_PROXY_URL to enable Quency." }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch(`${PROXY_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'quency', text: data.reply || "Sorry, I had trouble responding." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'quency', text: "Connection issue. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[520px] overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/50">
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <MessageSquare className="text-emerald-400" size={18} />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Quency</div>
          <div className="text-[10px] text-emerald-400/70 -mt-0.5">AI SENSEI</div>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] px-4 py-3 rounded-3xl text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-emerald-400 text-xs">Quency is thinking...</div>}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about Hermes setup..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-3 text-sm outline-none"
          />
          <button onClick={sendMessage} className="px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuencyChat;
