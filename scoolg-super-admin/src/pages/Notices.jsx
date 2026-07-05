import React, { useState, useEffect } from 'react';
import { saFetch } from '../lib/api';

const TYPE_STYLES = {
    info: { chip: 'bg-blue-100 text-blue-600', icon: 'info' },
    update: { chip: 'bg-violet-100 text-violet-600', icon: 'campaign' },
    warning: { chip: 'bg-amber-100 text-amber-600', icon: 'warning' },
    maintenance: { chip: 'bg-slate-200 text-slate-600', icon: 'build' },
};
const TYPES = ['info', 'update', 'warning', 'maintenance'];

const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

const Notices = () => {
    const [notices, setNotices] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({ audience: 'ALL', schoolId: '', title: '', body: '', type: 'info', pinned: false });

    const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [nRes, sRes] = await Promise.all([saFetch('/superadmin/notices'), saFetch('/superadmin/schools')]);
            setNotices(await nRes.json());
            const sc = await sRes.json();
            setSchools((Array.isArray(sc) ? sc : []).filter((s) => s.status !== 'PENDING'));
        } catch (e) { console.error('Failed to load notices', e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchAll(); }, []);

    const send = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.body.trim()) return flash('Title and message required');
        if (form.audience === 'SCHOOL' && !form.schoolId) return flash('Select a school');
        setBusy(true);
        try {
            const res = await saFetch('/superadmin/notices', { method: 'POST', body: JSON.stringify(form) });
            if (res.ok) {
                setForm({ audience: 'ALL', schoolId: '', title: '', body: '', type: 'info', pinned: false });
                flash('Notice sent');
                fetchAll();
            } else {
                const d = await res.json().catch(() => ({}));
                flash(d.error || 'Failed to send');
            }
        } catch (e) { console.error(e); } finally { setBusy(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try {
            const res = await saFetch(`/superadmin/notices/${id}`, { method: 'DELETE' });
            if (res.ok) { flash('Deleted'); fetchAll(); }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-full">
            <div>
                <h2 className="text-2xl font-extrabold text-on-surface">Notices</h2>
                <p className="text-sm text-on-surface-variant font-medium mt-1">Broadcast announcements to all schools or a specific one.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Compose */}
                <form onSubmit={send} className="lg:col-span-2 bg-surface-container-lowest rounded-xl premium-shadow p-5 space-y-4 h-fit">
                    <h3 className="font-extrabold text-on-surface">Send a notice</h3>

                    <div className="flex gap-2">
                        {[['ALL', 'All schools'], ['SCHOOL', 'Specific school']].map(([v, label]) => (
                            <button type="button" key={v} onClick={() => setForm((f) => ({ ...f, audience: v }))}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${form.audience === v ? 'bg-primary text-white' : 'bg-surface-container-low text-text-muted hover:bg-surface-container'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {form.audience === 'SCHOOL' && (
                        <div>
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">School</label>
                            <select value={form.schoolId} onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
                                className="mt-1.5 w-full rounded-xl border border-outline-variant/60 bg-surface-container/40 px-3 h-11 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <option value="">Select a school…</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>{s.formData?.schoolName || s.email} {s.campusCode ? `(${s.campusCode})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Title</label>
                        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Scheduled maintenance"
                            className="mt-1.5 w-full rounded-xl border border-outline-variant/60 bg-surface-container/40 px-3 h-11 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>

                    <div>
                        <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Message</label>
                        <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={4} placeholder="Write the announcement…"
                            className="mt-1.5 w-full resize-none rounded-xl border border-outline-variant/60 bg-surface-container/40 px-3 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Type</label>
                            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                                className="mt-1.5 w-full rounded-xl border border-outline-variant/60 bg-surface-container/40 px-3 h-11 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 capitalize">
                                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 mt-6 cursor-pointer select-none">
                            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} className="w-4 h-4 accent-[#004ac6]" />
                            <span className="text-sm font-bold text-on-surface">Pin</span>
                        </label>
                    </div>

                    <button type="submit" disabled={busy} className="w-full primary-gradient text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                        <span className="material-symbols-outlined text-[20px]">send</span> {busy ? 'Sending…' : 'Send notice'}
                    </button>
                </form>

                {/* Sent list */}
                <div className="lg:col-span-3 space-y-3">
                    {loading ? (
                        <div className="bg-surface-container-lowest rounded-xl premium-shadow p-8 text-center text-on-surface-variant">Loading…</div>
                    ) : notices.length === 0 ? (
                        <div className="bg-surface-container-lowest rounded-xl premium-shadow p-12 text-center text-on-surface-variant">No notices sent yet.</div>
                    ) : notices.map((n) => {
                        const ts = TYPE_STYLES[n.type] || TYPE_STYLES.info;
                        return (
                            <div key={n.id} className="bg-surface-container-lowest rounded-xl premium-shadow p-5">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center ${ts.chip}`}>
                                        <span className="material-symbols-outlined text-[20px]">{ts.icon}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-extrabold text-on-surface">{n.title}</h4>
                                            {n.pinned && <span className="material-symbols-outlined text-[16px] text-amber-500">push_pin</span>}
                                        </div>
                                        <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-wrap leading-relaxed">{n.body}</p>
                                        <div className="flex items-center gap-3 mt-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex-wrap">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">{n.audience === 'ALL' ? 'groups' : 'business'}</span> {n.recipient}</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">visibility</span> {n.reads} read</span>
                                            <span>{fmtDate(n.createdAt)}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => remove(n.id)} className="w-9 h-9 grid place-items-center rounded-lg text-red-500 hover:bg-red-50 shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-[200] bg-on-surface text-white text-sm font-bold px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">{toast}</div>
            )}
        </div>
    );
};

export default Notices;
