import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, MessagesSquare, ChevronRight, X, Users } from 'lucide-react';

const Avatar = ({ src, name, size = 'h-10 w-10', tone = 'blue' }) => (
  src
    ? <img src={src} alt="" className={`${size} rounded-full object-cover bg-slate-100 shrink-0`} />
    : <div className={`${size} rounded-full flex items-center justify-center font-black shrink-0 ${tone === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>{(name || '?').charAt(0).toUpperCase()}</div>
);

// Consistent colour for a teacher's name label.
const nameTone = (m) => (m.from === 'admin' ? 'text-violet-600' : 'text-blue-600');
const senderLabel = (m) => m.senderName || (m.from === 'admin' ? 'School Office' : m.from === 'teacher' ? 'Teacher' : '');

const Chat = () => {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const loadMembers = async () => {
    try {
      const r = await api.get('/student/chat/contacts');
      setGroup(r.data?.group || null);
      setMembers(Array.isArray(r.data?.contacts) ? r.data.contacts : []);
    } catch (e) { /* ignore */ }
  };

  const loadThread = async () => {
    try {
      const r = await api.get('/student/messages');
      setMessages(Array.isArray(r.data?.messages) ? r.data.messages : []);
    } catch (e) { setMessages([]); }
  };

  useEffect(() => {
    (async () => { await Promise.all([loadMembers(), loadThread()]); setLoading(false); })();
    const t1 = setInterval(loadThread, 8000);
    const t2 = setInterval(loadMembers, 30000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true); setText('');
    setMessages((m) => [...m, { _id: 'tmp-' + Date.now(), from: 'parent', text: t, createdAt: new Date().toISOString() }]);
    try { await api.post('/student/messages', { text: t }); loadThread(); }
    catch (e) { /* keep optimistic */ }
    finally { setSending(false); }
  };

  const fmtTime = (d) => { try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
      <div className="bg-white rounded-[26px] border border-slate-100 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden relative" style={{ height: 'calc(100vh - 200px)', minHeight: '460px' }}>

        {/* Group header — tap to see members (display only) */}
        <button onClick={() => setShowMembers(true)} className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 shrink-0 hover:bg-slate-50/80 transition-colors text-left bg-white">
          <Avatar src={group?.logo} name={group?.name} size="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-900 text-[15px] truncate">{group?.name || 'School'}</p>
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Users className="h-3 w-3" /> {group?.memberCount || members.length} members · tap to view
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f6f8fb]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3"><MessagesSquare className="h-7 w-7 text-blue-400" /></div>
              <p className="text-slate-700 font-bold text-sm">Message your school</p>
              <p className="text-slate-400 text-xs mt-1">The office &amp; your teachers will see it here.</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const mine = m.from === 'parent';
              const prev = messages[i - 1];
              const showName = !mine && (!prev || prev.from !== m.from || prev.senderName !== m.senderName);
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-900 border border-slate-100 rounded-bl-md'}`}>
                    {showName && <p className={`text-[11px] font-extrabold mb-0.5 ${nameTone(m)}`}>{senderLabel(m)}</p>}
                    <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{m.text}</p>
                    <span className={`block text-[10px] mt-1 text-right ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{fmtTime(m.createdAt)}</span>
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

        {/* Members sheet — DISPLAY ONLY (no 1-on-1 chat) */}
        {showMembers && (
          <div className="absolute inset-0 z-20 flex flex-col" onClick={() => setShowMembers(false)}>
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" />
            <div className="mt-auto bg-white rounded-t-[24px] shadow-2xl relative max-h-[82%] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">Group members</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">{members.length} members</p>
                </div>
                <button onClick={() => setShowMembers(false)} className="text-slate-400 h-8 w-8 grid place-items-center rounded-full hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="overflow-y-auto divide-y divide-slate-50">
                {members.map((c) => (
                  <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                    <Avatar src={c.avatar} name={c.name} size="h-11 w-11" tone={c.type === 'admin' ? 'admin' : 'blue'} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-[15px] truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{c.role}</p>
                    </div>
                    {c.type === 'admin' && <span className="text-[10px] font-black text-violet-600 bg-violet-50 rounded-full px-2 py-0.5 shrink-0">ADMIN</span>}
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 text-center text-[11px] text-slate-400 font-medium border-t border-slate-50 shrink-0">
                Everyone here can see messages in this group.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
