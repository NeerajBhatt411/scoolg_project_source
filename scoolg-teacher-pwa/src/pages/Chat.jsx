import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import TopHeader from '@/components/TopHeader';
import { Send, MessagesSquare, ChevronLeft } from 'lucide-react';

const senderLabel = (m) => m.senderName || (m.from === 'admin' ? 'School Office' : m.from === 'parent' ? 'Parent' : 'Teacher');
const nameTone = (m) => (m.from === 'admin' ? 'text-violet-600' : m.from === 'parent' ? 'text-emerald-600' : 'text-blue-600');

const Chat = () => {
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null); // {studentId, studentName, classSection}
  const [messages, setMessages] = useState([]);
  const [me, setMe] = useState(null); // this teacher's id, to right-align own msgs
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const endRef = useRef(null);

  const loadConvos = async () => {
    try {
      const r = await api.get('/teacher/chats');
      setConvos(Array.isArray(r.data?.conversations) ? r.data.conversations : []);
    } catch (e) { /* ignore */ }
    finally { setLoadingList(false); }
  };

  const loadThread = async (sid) => {
    if (!sid) return;
    try {
      const r = await api.get(`/teacher/chats/${sid}`);
      setMessages(Array.isArray(r.data?.messages) ? r.data.messages : []);
      if (r.data?.me) setMe(String(r.data.me));
    } catch (e) { setMessages([]); }
    finally { setLoadingThread(false); }
  };

  useEffect(() => { loadConvos(); const t = setInterval(loadConvos, 15000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!active) return;
    setLoadingThread(true);
    loadThread(active.studentId);
    const t = setInterval(() => loadThread(active.studentId), 8000);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const open = (c) => { setMessages([]); setActive(c); setConvos((cs) => cs.map((x) => (x.studentId === c.studentId ? { ...x, unread: 0 } : x))); };

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending || !active) return;
    setSending(true); setText('');
    setMessages((m) => [...m, { _id: 'tmp-' + Date.now(), from: 'teacher', text: t, createdAt: new Date().toISOString() }]);
    try { await api.post(`/teacher/chats/${active.studentId}`, { text: t }); loadThread(active.studentId); }
    catch (e) { /* keep optimistic */ }
    finally { setSending(false); }
  };

  const fmtTime = (d) => { try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      <TopHeader title="Chat" />
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4">
        {!active ? (
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {loadingList ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
            ) : convos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No parent messages yet.</div>
            ) : (
              convos.map((c) => (
                <button key={c.studentId} onClick={() => open(c)} className="w-full text-left px-4 py-3.5 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                  <div className="h-11 w-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">{(c.studentName || '?').charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900 text-[15px] truncate">{c.studentName}</p>
                      {c.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-black rounded-full px-2 py-0.5 shrink-0">{c.unread}</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.lastFrom !== 'parent' && c.lastSenderName ? c.lastSenderName + ': ' : ''}{c.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ height: '72vh' }}>
            <div className="px-3 py-3 border-b border-slate-100 flex items-center gap-2.5 shrink-0">
              <button onClick={() => setActive(null)} className="text-slate-500 p-1"><ChevronLeft className="h-5 w-5" /></button>
              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">{(active.studentName || '?').charAt(0)}</div>
              <div className="min-w-0">
                <p className="font-black text-slate-900 text-sm truncate">{active.studentName}</p>
                <p className="text-[11px] text-slate-400">{active.classSection ? active.classSection + ' • ' : ''}Parent group</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#f8fafc]">
              {loadingThread && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading…</div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessagesSquare className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No messages yet</p>
                </div>
              ) : (
                messages.map((m, i) => {
                  const mine = m.from === 'teacher' && me && String(m.senderId) === me;
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
            <form onSubmit={send} className="p-2.5 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a reply…" className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-[14px] outline-none focus:ring-2 focus:ring-blue-500/40" />
              <button type="submit" disabled={!text.trim() || sending} className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform"><Send className="h-5 w-5" /></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
