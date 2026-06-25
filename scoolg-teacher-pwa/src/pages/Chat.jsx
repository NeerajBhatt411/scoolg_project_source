import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import TopHeader from '@/components/TopHeader';
import { db, ensureChatAuth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Send, MessagesSquare, ChevronLeft } from 'lucide-react';

const senderLabel = (m) => m.senderName || (m.from === 'admin' ? 'School Office' : m.from === 'parent' ? 'Parent' : 'Teacher');
const nameTone = (m) => (m.from === 'admin' ? 'text-violet-600' : m.from === 'parent' ? 'text-emerald-600' : 'text-blue-600');
const toDate = (v) => { try { return v?.toDate ? v.toDate() : (v ? new Date(v) : null); } catch { return null; } };
const typerName = (t) => (t.role === 'parent' ? 'Parent' : (t.name || (t.role === 'admin' ? 'School Office' : 'Teacher')));

const TypingDots = () => (
  <span className="inline-flex gap-1 items-center">
    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
  </span>
);

const Chat = () => {
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [serverMsgs, setServerMsgs] = useState([]);
  const [pending, setPending] = useState([]);
  const [typers, setTypers] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const endRef = useRef(null);
  const meRef = useRef({ uid: null, id: null, name: '', schoolId: '' });
  const typingDocRef = useRef(null);
  const pingRef = useRef(0);
  const stopTimerRef = useRef(null);

  // Sign in + listen to all of this school's parent chats (realtime).
  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      try {
        const r = await api.get('/teacher/firebase-token');
        const u = await ensureChatAuth(async () => r.data);
        meRef.current = { uid: u?.uid, id: String(r.data?.teacherId || ''), name: r.data?.name || 'Teacher', schoolId: String(r.data?.schoolId || '') };
        if (cancelled || !r.data?.schoolId) { setLoadingList(false); return; }
        const q = query(collection(db, 'chats'), where('schoolId', '==', String(r.data.schoolId)));
        unsub = onSnapshot(q, (snap) => {
          const arr = snap.docs.map((d) => ({ studentId: d.id, ...d.data() }))
            .sort((a, b) => (toDate(b.lastAt)?.getTime() || 0) - (toDate(a.lastAt)?.getTime() || 0));
          setConvos(arr);
          setLoadingList(false);
        }, () => setLoadingList(false));
      } catch (e) { setLoadingList(false); }
    })();
    return () => { cancelled = true; unsub(); };
  }, []);

  const stopTyping = () => {
    const d = typingDocRef.current; if (!d) return;
    clearTimeout(stopTimerRef.current);
    setDoc(d, { name: meRef.current.name, role: 'teacher', schoolId: meRef.current.schoolId, typing: false, at: serverTimestamp() }).catch(() => {});
  };
  const signalTyping = () => {
    const d = typingDocRef.current; if (!d) return;
    const now = Date.now();
    if (now - pingRef.current > 1500) {
      pingRef.current = now;
      setDoc(d, { name: meRef.current.name, role: 'teacher', schoolId: meRef.current.schoolId, typing: true, at: serverTimestamp() }).catch(() => {});
    }
    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(stopTyping, 3000);
  };

  // Listen to the open thread + typing.
  useEffect(() => {
    if (!active) return;
    setLoadingThread(true); setServerMsgs([]); setPending([]); setTypers([]);
    const sid = String(active.studentId);
    typingDocRef.current = meRef.current.uid ? doc(db, 'chats', sid, 'typing', meRef.current.uid) : null;

    const q = query(collection(db, 'chats', sid, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setServerMsgs(arr);
      setPending((p) => p.filter((pm) => !arr.some((s) => s.from === 'teacher' && s.text === pm.text)));
      setLoadingThread(false);
    }, () => setLoadingThread(false));

    const unsubT = onSnapshot(collection(db, 'chats', sid, 'typing'), (snap) => {
      const now = Date.now();
      setTypers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.id !== meRef.current.uid && t.typing && t.at?.toMillis && (now - t.at.toMillis() < 8000)));
    }, () => {});

    api.post(`/teacher/chats/${sid}/read`).catch(() => {});
    return () => { unsub(); unsubT(); stopTyping(); };
  }, [active?.studentId]);

  const messages = [...serverMsgs, ...pending];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [serverMsgs.length, pending.length, typers.length]);

  const open = (c) => { setActive(c); };
  const onChange = (e) => { const v = e.target.value; setText(v); if (v.trim()) signalTyping(); else stopTyping(); };

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending || !active) return;
    setSending(true); setText(''); stopTyping();
    setPending((p) => [...p, { id: 'tmp-' + Date.now(), from: 'teacher', senderId: meRef.current.id, text: t, createdAt: new Date().toISOString() }]);
    try { await api.post(`/teacher/chats/${active.studentId}`, { text: t }); }
    catch (e) { /* listener reconciles */ }
    finally { setSending(false); }
  };

  const fmtTime = (d) => { const dt = toDate(d); try { return dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''; } catch { return ''; } };

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
                      <p className="font-bold text-slate-900 text-[15px] truncate">{c.studentName || 'Student'}{c.classSection ? <span className="text-slate-400 font-medium text-xs"> · {c.classSection}</span> : null}</p>
                      {c.schoolUnread > 0 && <span className="bg-blue-600 text-white text-[10px] font-black rounded-full px-2 py-0.5 shrink-0">{c.schoolUnread}</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.lastFrom && c.lastFrom !== 'parent' && c.lastSenderName ? c.lastSenderName + ': ' : ''}{c.lastText}</p>
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
                <p className="font-black text-slate-900 text-sm truncate">{active.studentName || 'Student'}</p>
                {typers.length ? (
                  <p className="text-[11px] text-blue-500 font-semibold flex items-center gap-1.5">{typers.length > 1 ? 'Several typing' : typerName(typers[0]) + ' is typing'}<TypingDots /></p>
                ) : (
                  <p className="text-[11px] text-slate-400">{active.classSection ? active.classSection + ' • ' : ''}Parent group</p>
                )}
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
                  const mine = m.from === 'teacher' && meRef.current.id && String(m.senderId) === meRef.current.id;
                  const prev = messages[i - 1];
                  const showName = !mine && (!prev || prev.from !== m.from || prev.senderName !== m.senderName);
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-900 border border-slate-100 rounded-bl-md'}`}>
                        {showName && <p className={`text-[11px] font-extrabold mb-0.5 ${nameTone(m)}`}>{senderLabel(m)}</p>}
                        <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{m.text}</p>
                        <span className={`block text-[10px] mt-1 text-right ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{fmtTime(m.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              {typers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">{typers.length > 1 ? 'Several people' : typerName(typers[0])}</span>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="p-2.5 border-t border-slate-100 flex items-center gap-2 shrink-0 bg-white">
              <input value={text} onChange={onChange} onBlur={stopTyping} placeholder="Type a reply…" className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-[14px] outline-none focus:ring-2 focus:ring-blue-500/40" />
              <button type="submit" disabled={!text.trim() || sending} className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform"><Send className="h-5 w-5" /></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
