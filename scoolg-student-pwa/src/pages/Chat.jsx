import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, MessagesSquare, ChevronLeft } from 'lucide-react';

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null); // selected contact {type,id,name,role,avatar}
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const endRef = useRef(null);

  const loadContacts = async () => {
    try {
      const r = await api.get('/student/chat/contacts');
      setContacts(Array.isArray(r.data?.contacts) ? r.data.contacts : []);
    } catch (e) { /* ignore */ }
    finally { setLoadingContacts(false); }
  };

  const loadThread = async (c) => {
    if (!c) return;
    try {
      const params = c.type === 'teacher' ? { party: 'teacher', teacherId: c.id } : { party: 'admin' };
      const r = await api.get('/student/messages', { params });
      setMessages(Array.isArray(r.data?.messages) ? r.data.messages : []);
    } catch (e) { setMessages([]); }
    finally { setLoadingThread(false); }
  };

  useEffect(() => { loadContacts(); const t = setInterval(loadContacts, 15000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!active) return;
    setLoadingThread(true);
    loadThread(active);
    const t = setInterval(() => loadThread(active), 8000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openContact = (c) => { setMessages([]); setActive(c); setContacts((cs) => cs.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x))); };

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending || !active) return;
    setSending(true); setText('');
    setMessages((m) => [...m, { _id: 'tmp-' + Date.now(), from: 'parent', text: t, createdAt: new Date().toISOString() }]);
    try {
      const body = active.type === 'teacher' ? { party: 'teacher', teacherId: active.id, text: t } : { party: 'admin', text: t };
      await api.post('/student/messages', body);
      loadThread(active);
    } catch (e) { /* keep optimistic */ }
    finally { setSending(false); }
  };

  const fmtTime = (d) => { try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  const Avatar = ({ c, size }) => (
    c?.avatar
      ? <img src={c.avatar} alt="" className={`${size} rounded-full object-cover bg-slate-100 shrink-0`} />
      : <div className={`${size} rounded-full flex items-center justify-center font-black shrink-0 ${c?.type === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>{(c?.name || '?').charAt(0)}</div>
  );

  // Contacts list
  if (!active) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-24 p-3 sm:p-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-black text-slate-900 px-1 mb-3">Chat</h1>
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {loadingContacts ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No contacts available.</div>
            ) : (
              contacts.map((c) => (
                <button key={c.id} onClick={() => openContact(c)} className="w-full text-left px-4 py-3.5 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <Avatar c={c} size="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-[15px] truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{c.role}</p>
                  </div>
                  {c.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-black rounded-full px-2 py-0.5 shrink-0">{c.unread}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Thread
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-5">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ height: '74vh' }}>
        <div className="px-3 py-3 border-b border-slate-100 flex items-center gap-2.5 shrink-0">
          <button onClick={() => setActive(null)} className="text-slate-500 p-1"><ChevronLeft className="h-5 w-5" /></button>
          <Avatar c={active} size="h-9 w-9" />
          <div className="min-w-0">
            <p className="font-black text-slate-900 text-sm truncate">{active.name}</p>
            <p className="text-[11px] text-slate-400 font-semibold">{active.role}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f8fafc]">
          {loadingThread && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <MessagesSquare className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-slate-500 font-semibold text-sm">Say hi to {active.name}</p>
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
        <form onSubmit={send} className="p-2.5 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-[14px] outline-none focus:ring-2 focus:ring-blue-500/40" />
          <button type="submit" disabled={!text.trim() || sending} className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform"><Send className="h-5 w-5" /></button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
