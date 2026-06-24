import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';

const Messages = () => {
  const { schoolId } = useAdmin();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const loadConversations = async () => {
    if (!schoolId) return;
    try {
      const r = await axios.get(`${ADMIN_API_BASE}/messages?schoolId=${schoolId}`);
      setConversations(Array.isArray(r.data?.conversations) ? r.data.conversations : []);
    } catch (e) { /* ignore */ }
    finally { setLoadingList(false); }
  };

  const loadThread = async (studentId) => {
    if (!schoolId || !studentId) return;
    try {
      const r = await axios.get(`${ADMIN_API_BASE}/messages/${studentId}?schoolId=${schoolId}`);
      setThread(Array.isArray(r.data?.messages) ? r.data.messages : []);
    } catch (e) { setThread([]); }
    finally { setLoadingThread(false); }
  };

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, 12000);
    return () => clearInterval(t);
  }, [schoolId]);

  useEffect(() => {
    if (!selected) return;
    setLoadingThread(true);
    loadThread(selected);
    const t = setInterval(() => loadThread(selected), 8000);
    return () => clearInterval(t);
  }, [selected, schoolId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread]);

  const send = async (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending || !selected) return;
    setSending(true);
    setText('');
    setThread((m) => [...m, { _id: 'tmp-' + Date.now(), from: 'admin', text: t, createdAt: new Date().toISOString() }]);
    try {
      await axios.post(`${ADMIN_API_BASE}/messages/${selected}`, { schoolId, text: t });
      loadThread(selected);
      loadConversations();
    } catch (e) { /* keep optimistic */ }
    finally { setSending(false); }
  };

  const selectedConv = conversations.find((c) => c.studentId === selected);
  const fmtTime = (d) => { try { return new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex" style={{ height: 'calc(100vh - 130px)' }}>
        {/* Conversation list */}
        <aside className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-100 shrink-0`}>
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-black text-slate-900 text-lg">Messages</h2>
            <p className="text-xs text-slate-400 font-semibold">Parent conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="p-6 text-center text-slate-400 text-sm">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No messages yet. Parents can start a chat from the app.</div>
            ) : (
              conversations.map((c) => (
                <button key={c.studentId} onClick={() => setSelected(c.studentId)} className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-center gap-3 transition-colors ${selected === c.studentId ? 'bg-blue-50/60' : ''}`}>
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black shrink-0">{(c.studentName || 'S').charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-slate-900 truncate">{c.studentName}</p>
                      {c.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-black rounded-full px-1.5 py-0.5 shrink-0">{c.unread}</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.lastFrom === 'admin' ? 'You: ' : ''}{c.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className={`${selected ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a conversation to reply</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <button onClick={() => setSelected(null)} className="md:hidden text-slate-500 flex items-center"><span className="material-symbols-outlined">arrow_back</span></button>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 truncate">{selectedConv?.studentName || 'Parent'}</p>
                  <p className="text-xs text-slate-400 truncate">{selectedConv?.classSection}{selectedConv?.studentAppId ? ' • ' + selectedConv.studentAppId : ''}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50">
                {loadingThread && thread.length === 0 ? (
                  <div className="text-center text-slate-400 text-sm">Loading…</div>
                ) : (
                  thread.map((m) => {
                    const mine = m.from === 'admin';
                    return (
                      <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${mine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-900 border border-slate-100 rounded-bl-md'}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                          <span className={`block text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-slate-400'}`}>{fmtTime(m.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="p-2.5 border-t border-slate-100 flex items-center gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a reply…" className="flex-1 h-11 rounded-full bg-slate-100 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/40" />
                <button type="submit" disabled={!text.trim() || sending} className="h-11 px-5 rounded-full bg-blue-600 text-white font-bold text-sm disabled:opacity-40 active:scale-95 transition-transform">Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Messages;
