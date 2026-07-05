import React, { useState, useEffect } from 'react';
import { saFetch } from '../lib/api';

const STATUS_STYLES = {
    OPEN: 'bg-orange-100 text-orange-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-600',
    RESOLVED: 'bg-green-100 text-green-600',
    CLOSED: 'bg-slate-100 text-slate-500',
};
const STATUS_LABEL = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

const Support = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [active, setActive] = useState(null);      // open ticket detail
    const [reply, setReply] = useState('');
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState('');

    const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

    const fetchRows = async (status = filter) => {
        try {
            setLoading(true);
            const res = await saFetch(`/superadmin/support${status && status !== 'ALL' ? `?status=${status}` : ''}`);
            setRows(await res.json());
        } catch (e) {
            console.error('Failed to fetch tickets', e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchRows(filter); /* eslint-disable-next-line */ }, [filter]);

    const openTicket = async (id) => {
        try {
            const res = await saFetch(`/superadmin/support/${id}`);
            setActive(await res.json());
            setReply('');
        } catch (e) { console.error(e); }
    };

    const sendReply = async () => {
        if (!reply.trim() || !active) return;
        setBusy(true);
        try {
            const res = await saFetch(`/superadmin/support/${active.id || active._id}/reply`, { method: 'POST', body: JSON.stringify({ text: reply.trim() }) });
            if (res.ok) {
                const { ticket } = await res.json();
                setActive({ ...ticket, id: ticket._id });
                setReply('');
                flash('Reply sent');
                fetchRows(filter);
            }
        } catch (e) { console.error(e); } finally { setBusy(false); }
    };

    const setStatus = async (status) => {
        if (!active) return;
        setBusy(true);
        try {
            const res = await saFetch(`/superadmin/support/${active.id || active._id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
            if (res.ok) {
                const { ticket } = await res.json();
                setActive({ ...ticket, id: ticket._id });
                flash(`Marked ${STATUS_LABEL[status]}`);
                fetchRows(filter);
            }
        } catch (e) { console.error(e); } finally { setBusy(false); }
    };

    const thread = active ? [{ from: 'school', authorName: active.raisedByName, text: active.message, createdAt: active.createdAt }, ...(active.replies || [])] : [];

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-on-surface">Support Tickets</h2>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">Queries raised by schools — reply and resolve.</p>
                </div>
                <button onClick={() => fetchRows(filter)} className="bg-surface-container-high hover:bg-surface-container text-on-surface font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">refresh</span> Refresh
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {FILTERS.map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${filter === f ? 'bg-primary text-white' : 'bg-surface-container-low text-text-muted hover:bg-surface-container'}`}>
                        {f === 'ALL' ? 'All' : STATUS_LABEL[f]}
                    </button>
                ))}
            </div>

            <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] uppercase font-bold text-on-surface-variant tracking-widest bg-surface-container-low/50">
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">School</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container/50">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-on-surface-variant">Loading…</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-on-surface-variant">No tickets yet.</td></tr>
                            ) : rows.map((r) => (
                                <tr key={r.id} onClick={() => openTicket(r.id)} className="hover:bg-surface-container-low/40 transition-colors cursor-pointer">
                                    <td className="px-6 py-5 font-bold text-[0.875rem] text-on-surface max-w-[240px] truncate">{r.subject}</td>
                                    <td className="px-6 py-5 text-on-surface-variant text-[0.875rem]">
                                        <div className="font-semibold text-on-surface">{r.schoolName || '—'}</div>
                                        <div className="text-xs text-on-surface-variant uppercase">{r.campusCode || ''}</div>
                                    </td>
                                    <td className="px-6 py-5 text-on-surface-variant text-[0.875rem]">{r.category}</td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[0.8rem] font-bold ${['High', 'Urgent'].includes(r.priority) ? 'text-red-600' : 'text-on-surface-variant'}`}>{r.priority}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[0.8rem] font-bold px-3 py-1 rounded-full w-fit inline-block ${STATUS_STYLES[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right text-on-surface-variant text-[0.8rem]">{fmtDate(r.lastActivityAt || r.updatedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail drawer */}
            {active && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActive(null)} />
                    <div className="relative z-10 w-full max-w-lg h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-5 border-b border-surface-container flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="text-lg font-extrabold text-on-surface truncate">{active.subject}</h3>
                                <p className="text-sm text-on-surface-variant font-medium truncate">{active.schoolName} · {active.category} · {active.priority}</p>
                            </div>
                            <button onClick={() => setActive(null)} className="w-9 h-9 grid place-items-center rounded-lg hover:bg-surface-container text-on-surface-variant shrink-0">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-surface-container">
                            {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                                <button key={s} disabled={busy || active.status === s} onClick={() => setStatus(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${active.status === s ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
                                    Mark {STATUS_LABEL[s]}
                                </button>
                            ))}
                            <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[active.status]}`}>{STATUS_LABEL[active.status]}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {thread.map((m, i) => (
                                <div key={i} className={`flex ${m.from === 'superadmin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.from === 'superadmin' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface'}`}>
                                        <p className="text-[11px] font-bold opacity-70 mb-1">{m.from === 'superadmin' ? 'Scoolg Team' : (m.authorName || 'School')} · {fmtDate(m.createdAt)}</p>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-surface-container">
                            <div className="flex items-end gap-2">
                                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Write a reply…"
                                    className="flex-1 resize-none rounded-xl border border-outline-variant/60 bg-surface-container/40 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                                <button onClick={sendReply} disabled={busy || !reply.trim()}
                                    className="primary-gradient text-white font-bold h-12 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-6 right-6 z-[200] bg-on-surface text-white text-sm font-bold px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">{toast}</div>
            )}
        </div>
    );
};

export default Support;
