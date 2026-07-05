import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import MenuButton from '../components/MenuButton';

const TYPE_UI = {
    info: { icon: 'info', ring: 'bg-blue-50 text-blue-600', label: 'Info' },
    update: { icon: 'campaign', ring: 'bg-violet-50 text-violet-600', label: 'Update' },
    warning: { icon: 'warning', ring: 'bg-amber-50 text-amber-600', label: 'Important' },
    maintenance: { icon: 'build', ring: 'bg-slate-100 text-slate-600', label: 'Maintenance' },
};
const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

const ScoolgNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/scoolg-notices`);
            const list = Array.isArray(res.data) ? res.data : [];
            setNotices(list);
            // Mark any unread ones as read (viewing the inbox = seen), then tell
            // the sidebar to clear its "From Scoolg" unread badge immediately.
            const unread = list.filter((n) => !n.read);
            unread.forEach((n) => {
                axios.post(`${ADMIN_API_BASE}/scoolg-notices/${n._id}/read`).catch(() => {});
            });
            if (unread.length) window.dispatchEvent(new CustomEvent('scoolg-notices-read'));
        } catch (e) {
            setNotices([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchNotices(); }, []);

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-4 sm:p-10 space-y-10">
            <header className="max-w-full flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MenuButton />
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">From Scoolg</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm tracking-tight uppercase opacity-60">Announcements from the Scoolg team</p>
                </div>
            </header>

            <div className="max-w-3xl space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div></div>
                ) : notices.length === 0 ? (
                    <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-5">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-slate-200">mark_email_read</span>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">No announcements yet</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">You'll see updates from Scoolg here.</p>
                        </div>
                    </div>
                ) : notices.map((n) => {
                    const ui = TYPE_UI[n.type] || TYPE_UI.info;
                    return (
                        <div key={n._id} className={`bg-white p-7 rounded-[32px] border shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all ${n.pinned ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-100'}`}>
                            <div className="flex items-start gap-5">
                                <div className={`w-14 h-14 shrink-0 rounded-[20px] flex items-center justify-center ${ui.ring}`}>
                                    <span className="material-symbols-outlined text-2xl">{ui.icon}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{n.title}</h3>
                                        {n.pinned && <span className="material-symbols-outlined text-[18px] text-blue-500">push_pin</span>}
                                        {!n.read && <span className="text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded-full">New</span>}
                                    </div>
                                    <p className="text-slate-600 text-sm font-semibold mt-2 whitespace-pre-wrap leading-relaxed">{n.body}</p>
                                    <div className="flex items-center gap-3 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified</span> Scoolg Team</span>
                                        <span>•</span>
                                        <span>{ui.label}</span>
                                        <span>•</span>
                                        <span>{fmtDate(n.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScoolgNotices;
