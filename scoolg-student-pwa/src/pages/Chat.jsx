import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Send, MessagesSquare } from 'lucide-react';

const Chat = () => {
  const { school } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const load = async () => {
    try {
      const r = await api.get('/student/messages');
      setMessages(Array.isArray(r.data?.messages) ? r.data.messages : []);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // poll for the school's replies
    return () => clearInterval(t);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText('');
    const optimistic = { _id: 'tmp-' + Date.now(), from: 'parent', text: t, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try {
      await api.post('/student/messages', { text: t });
      load();
    } catch (e) { /* keep the optimistic bubble */ }
    finally { setSending(false); }
  };

  const fmtTime = (d) => { try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-5">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ height: '72vh' }}>
        {/* header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessagesSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-black text-slate-900 leading-tight truncate">{school?.name || 'School'}</h2>
            <p className="text-[11px] font-semibold text-slate-400">Chat with your school</p>
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f8fafc]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <MessagesSquare className="h-7 w-7" />
              </div>
              <p className="text-slate-600 font-bold">Start a conversation</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Send a message to your school — they'll reply here.</p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.from === 'parent';
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-900 border border-slate-100 rounded-bl-md'}`}>
                    <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{m.text}</p>
                    <span className={`block text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{fmtTime(m.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* input */}
        <form onSubmit={send} className="p-2.5 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button type="submit" disabled={!text.trim() || sending} className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
