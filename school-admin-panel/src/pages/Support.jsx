import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useToast } from '../context/ToastContext';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';

// Map backend ticket status -> the pill label/colour shown to the school.
const STATUS_UI = {
    OPEN: { label: 'Pending', cls: 'bg-blue-600 text-white' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-500 text-white' },
    RESOLVED: { label: 'Resolved', cls: 'bg-emerald-500 text-white' },
    CLOSED: { label: 'Closed', cls: 'bg-slate-400 text-white' },
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const fmtTime = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

const Support = () => {
    const schoolName = localStorage.getItem('scoolg_school_name') || 'Your School';
    const { toast } = useToast();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [active, setActive] = useState(null);      // open ticket thread
    const [reply, setReply] = useState('');
    const [replying, setReplying] = useState(false);

    const [newTicket, setNewTicket] = useState({ subject: '', category: 'Technical Issue', description: '', priority: 'Medium' });

    const supportCategories = [
        { title: 'Technical Issue', desc: 'Bugs, glitches or login problems', icon: 'dvr' },
        { title: 'Feature Request', desc: 'Suggest new tools or improvements', icon: 'auto_awesome' },
        { title: 'Billing & Plans', desc: 'Invoices, renewals and payments', icon: 'payments' },
        { title: 'Training Request', desc: 'Book a demo or training session', icon: 'school' },
    ];

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/support-tickets`);
            setTickets(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchTickets(); }, []);

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
        setSubmitting(true);
        try {
            await axios.post(`${ADMIN_API_BASE}/support-tickets`, {
                subject: newTicket.subject.trim(),
                message: newTicket.description.trim(),
                category: newTicket.category,
                priority: newTicket.priority,
                raisedByName: schoolName,
            });
            setShowModal(false);
            setNewTicket({ subject: '', category: 'Technical Issue', description: '', priority: 'Medium' });
            toast.success('Complaint submitted successfully!');
            fetchTickets();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const openTicket = async (id) => {
        try {
            const res = await axios.get(`${ADMIN_API_BASE}/support-tickets/${id}`);
            setActive(res.data);
            setReply('');
        } catch (e) {
            toast.error('Could not open ticket');
        }
    };

    const sendReply = async () => {
        if (!reply.trim() || !active) return;
        setReplying(true);
        try {
            const res = await axios.post(`${ADMIN_API_BASE}/support-tickets/${active._id}/reply`, { text: reply.trim(), authorName: schoolName });
            setActive(res.data.ticket);
            setReply('');
            fetchTickets();
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const openWhatsApp = () => {
        window.open(`https://wa.me/919999999999?text=Hi Scoolg Support, I am from ${schoolName}. I need assistance.`, '_blank');
    };

    const thread = active ? [{ from: 'school', authorName: active.raisedByName, text: active.message, createdAt: active.createdAt }, ...(active.replies || [])] : [];

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-4 sm:p-10 space-y-12">
            {/* Header */}
            <header className="max-w-full flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MenuButton />
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">Support & Help</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm tracking-tight uppercase opacity-60">Helpdesk for {schoolName}</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded-[24px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95">
                    Raise a Complaint
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* Category quick actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {supportCategories.map((cat, i) => (
                            <button key={i} onClick={() => { setShowModal(true); setNewTicket({ ...newTicket, category: cat.title }); }}
                                className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.12)] transition-all duration-700 text-left flex items-start gap-6 active:scale-95">
                                <div className="w-16 h-16 shrink-0 bg-slate-50 text-slate-900 rounded-[24px] flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-500">
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{cat.title}</h3>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed opacity-70">{cat.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tickets */}
                    <div className="bg-white p-8 sm:p-12 rounded-[56px] border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.03)] min-h-[400px]">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4 mb-10">
                            <span className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>
                            Raised Concerns
                        </h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-slate-200">sentiment_satisfied</span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">No concerns raised yet</h4>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Your school systems are running smoothly.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket) => {
                                    const st = STATUS_UI[ticket.status] || STATUS_UI.OPEN;
                                    const unread = (ticket.replies || []).some((r) => r.from === 'superadmin');
                                    return (
                                        <button key={ticket._id} onClick={() => openTicket(ticket._id)}
                                            className="w-full flex items-center justify-between p-7 rounded-[36px] bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500 text-left">
                                            <div className="flex items-center gap-6 min-w-0">
                                                <div className="w-14 h-14 shrink-0 bg-white rounded-[20px] flex items-center justify-center border border-slate-100 shadow-sm relative">
                                                    <span className="material-symbols-outlined text-slate-400">forum</span>
                                                    {unread && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white"></span>}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-slate-900 text-[16px] tracking-tight truncate">{ticket.subject}</h4>
                                                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                                        <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">{ticket.category} • {fmtDate(ticket.createdAt)}</p>
                                                        <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-100">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'text-rose-600' : 'text-slate-400'}`}>{ticket.priority}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm ${st.cls}`}>{st.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Account manager */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 sm:p-10 rounded-[56px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 rounded-[44px] bg-slate-50 p-1.5 border-2 border-slate-100 shadow-lg overflow-hidden group">
                                <img src="https://ui-avatars.com/api/?name=Scoolg+Support&background=2563eb&color=fff" alt="Manager" className="w-full h-full object-cover rounded-[36px] group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        </div>
                        <div className="space-y-2 mb-10">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Scoolg Support</h4>
                            <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Primary Account Head</p>
                        </div>
                        <div className="w-full space-y-4">
                            <button onClick={openWhatsApp}
                                className="w-full bg-[#25D366] text-white font-black text-xs uppercase tracking-widest py-5 rounded-[28px] hover:shadow-[0_15px_30px_rgba(37,211,102,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95">
                                <span className="material-symbols-outlined text-2xl">chat</span> WhatsApp Us
                            </button>
                            <button onClick={() => setShowModal(true)}
                                className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-5 rounded-[28px] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-50">
                                <span className="material-symbols-outlined text-2xl">edit_note</span> New Complaint
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Raise Ticket Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-slate-50 p-10 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">New Complaint</h3>
                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Describe your concern below</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center active:scale-90">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitTicket} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                    <Dropdown value={newTicket.category} onChange={(v) => setNewTicket({ ...newTicket, category: v })}
                                        options={['Technical Issue', 'Feature Request', 'Billing & Plans', 'Training Request']} className="w-full" buttonClassName="py-5 bg-slate-50" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Priority</label>
                                    <Dropdown value={newTicket.priority} onChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                                        options={['Low', 'Medium', 'High', 'Urgent']} className="w-full" buttonClassName="py-5 bg-slate-50" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                                <input required type="text" placeholder="Brief title of the issue" value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-5 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:opacity-50" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Detailed Problem</label>
                                <textarea required rows="4" placeholder="Explain the problem in detail..." value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-5 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all resize-none placeholder:opacity-50"></textarea>
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full bg-blue-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-60">
                                {submitting ? 'Submitting…' : 'Submit Complaint'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Thread Modal */}
            {active && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActive(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300">
                        <div className="bg-slate-50 p-7 border-b border-slate-100 flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{active.subject}</h3>
                                <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-1">{active.category} • {(STATUS_UI[active.status] || STATUS_UI.OPEN).label}</p>
                            </div>
                            <button onClick={() => setActive(null)} className="w-11 h-11 shrink-0 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center active:scale-90">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFDFF]">
                            {thread.map((m, i) => (
                                <div key={i} className={`flex ${m.from === 'school' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[82%] rounded-[24px] px-5 py-3.5 ${m.from === 'school' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100 text-slate-900 shadow-sm'}`}>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${m.from === 'school' ? 'text-white/70' : 'text-blue-600'}`}>{m.from === 'school' ? 'You' : 'Scoolg Team'} • {fmtTime(m.createdAt)}</p>
                                        <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {active.status !== 'CLOSED' ? (
                            <div className="p-4 border-t border-slate-100 flex items-end gap-2">
                                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={1} placeholder="Reply to Scoolg…"
                                    className="flex-1 resize-none bg-slate-50 border border-slate-100 rounded-[20px] px-5 py-3.5 font-semibold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10" />
                                <button onClick={sendReply} disabled={replying || !reply.trim()}
                                    className="bg-blue-600 text-white h-12 w-12 shrink-0 rounded-[18px] flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-slate-100 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">This ticket is closed</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
