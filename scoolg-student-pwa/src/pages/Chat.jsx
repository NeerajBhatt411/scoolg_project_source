import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, MessagesSquare, ChevronDown, X } from 'lucide-react';

const Avatar = ({ c, size }) => (
  c?.avatar
    ? <img src={c.avatar} alt="" className={`${size} rounded-full object-cover bg-slate-100 shrink-0`} />
    : <div className={`${size} rounded-full flex items-center justify-center font-black shrink-0 ${c?.type === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>{(c?.name || '?').charAt(0)}</div>
);

const Chat = () => {
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);          // current conversation contact (defaults to School Admin)
  const [showMembers, setShowMembers] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const loadContacts = async (pickDefault = false) => {
    try {
      const r = await api.get('/student/chat/contacts');
      const cs = Array.isArray(r.data?.contacts) ? r.data.contacts : [];
      setContacts(cs);
      if (pickDefault) setActive((prev) => prev || cs.find((c) => c.type === 'admin') || cs[0] || null);
    } catch (e) { /* ignore */ }
  };

  const loadThread = async (c) => {
    if (!c) return;
    try {
      const params = c.type === 'teacher' ? { party: 'teacher', teacherId: c.id } : { party: 'admin' };
      const r = await api.get('/student/messages', { params });
      setMessages(Array.isArray(r.data?.messages) ? r.data.messages : []);
    } catch (e) { setMessages([]); }
  };

  // First load: get contacts + default to School Admin.
  useEffect(() => {
    (async () => { await loadContacts(true); setLoading(false); })();
    const t = setInterval(() => loadContacts(false), 15000);
    return () => clearInterval(t);
  }, []);

  // Thread for the active contact + poll.
  useEffect(() => {
    if (!active) return;
    loadThread(active);
    const t = setInterval(() => loadThread(active), 8000);
    return () => clearInterval(t);
  }, [active?.type, active?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const pick = (c) => { setShowMembers(false); if (c.id !== active?.id) { setMessages([]); setActive(c); } setContacts((cs) => cs.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x))); };

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

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-5">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative" style={{ height: '74vh' }}>

        {/* Header — tap to see members (WhatsApp style) */}
        <button onClick={() => setShowMembers(true)} className="px-3 py-3 border-b border-slate-100 flex items-center gap-2.5 shrink-0 hover:bg-slate-50 transition-colors text-left">
          <Avatar c={active} size="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-900 text-sm truncate">{active?.name || 'School'}</p>
            <p className="text-[11px] text-slate-400 font-semibold">{active?.role || ''} · tap to see members</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f8fafc]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <MessagesSquare className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-slate-500 font-semibold text-sm">Say hi to {active?.name || 'your school'}</p>
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

        {/* Input */}
        <form onSubmit={send} className="p-2.5 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-[14px] outline-none focus:ring-2 focus:ring-blue-500/40" />
          <button type="submit" disabled={!text.trim() || sending} className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform"><Send className="h-5 w-5" /></button>
        </form>

        {/* Members sheet */}
        {showMembers && (
          <div className="absolute inset-0 z-20 flex flex-col" onClick={() => setShowMembers(false)}>
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" />
            <div className="mt-auto bg-white rounded-t-[24px] shadow-2xl relative max-h-[80%] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="font-black text-slate-900">Members</h3>
                <button onClick={() => setShowMembers(false)} className="text-slate-400"><X className="h-5 w-5" /></button>
              </div>
              <div className="overflow-y-auto divide-y divide-slate-50">
                {contacts.map((c) => (
                  <button key={c.id} onClick={() => pick(c)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 ${active?.id === c.id ? 'bg-blue-50/60' : ''}`}>
                    <Avatar c={c} size="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-[15px] truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{c.role}</p>
                    </div>
                    {c.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-black rounded-full px-2 py-0.5 shrink-0">{c.unread}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
