import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Building2, Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

const API = 'https://scoolg-backend.netlify.app/api';
const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function BookDemoModal({ open, onClose }) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 60);

    const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
    const [form, setForm] = useState({ name: '', email: '', phone: '', school: '', date: '', time: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const close = () => {
        setForm({ name: '', email: '', phone: '', school: '', date: '', time: '', notes: '' });
        setView({ y: today.getFullYear(), m: today.getMonth() });
        setError(''); setDone(false); setLoading(false);
        onClose();
    };

    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const firstDow = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday-first
    const atFirstMonth = view.y === today.getFullYear() && view.m === today.getMonth();
    const atLastMonth = view.y === maxDate.getFullYear() && view.m === maxDate.getMonth();

    const isSelectable = (d) => {
        const dt = new Date(view.y, view.m, d); dt.setHours(0, 0, 0, 0);
        return dt >= today && dt <= maxDate && dt.getDay() !== 0; // no past, within 60 days, skip Sundays
    };
    const stepMonth = (delta) => setView((v) => {
        const nm = new Date(v.y, v.m + delta, 1);
        return { y: nm.getFullYear(), m: nm.getMonth() };
    });

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) return setError('Please enter your name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email.');
        if (!form.phone.trim()) return setError('Please enter your phone number.');
        if (!form.date) return setError('Please pick a date.');
        if (!form.time) return setError('Please pick a time slot.');
        setLoading(true);
        try {
            const res = await fetch(`${API}/demo`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Something went wrong.');
            setDone(true);
        } catch (err) {
            setError(err.message || 'Could not send. Please try again.');
        } finally { setLoading(false); }
    };

    const inputCls = 'w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:focus:bg-slate-800';

    const prettyPicked = form.date
        ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
        : '';

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={close}
                    className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 14 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[520px] my-4 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-7 sm:p-8">

                        <button onClick={close} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            {done ? <CheckCircle2 className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                        </div>

                        {done ? (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Demo request sent! 🎉</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-2">
                                    Thanks! We've received your preferred slot:
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm mb-6">
                                    <Calendar className="h-4 w-4" /> {prettyPicked} <span className="opacity-50">·</span> <Clock className="h-4 w-4" /> {form.time}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">A confirmation has been emailed to you, and our team will reach out shortly.</p>
                                <button onClick={close} className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all active:scale-[0.98]">Done</button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Book a demo</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-5">Pick a date &amp; time — we'll confirm by email.</p>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 dark:bg-red-950/40 dark:border-red-900/50">
                                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="relative">
                                            <User className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input className={inputCls} placeholder="Your name" value={form.name} onChange={set('name')} />
                                        </div>
                                        <div className="relative">
                                            <Phone className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input className={inputCls} placeholder="Phone" value={form.phone} onChange={set('phone')} />
                                        </div>
                                        <div className="relative">
                                            <Mail className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} />
                                        </div>
                                        <div className="relative">
                                            <Building2 className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            <input className={inputCls} placeholder="School (optional)" value={form.school} onChange={set('school')} />
                                        </div>
                                    </div>

                                    {/* Calendar */}
                                    <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{MONTHS[view.m]} {view.y}</span>
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => stepMonth(-1)} disabled={atFirstMonth}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => stepMonth(1)} disabled={atLastMonth}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {WEEK.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                                                const val = ymd(view.y, view.m, d);
                                                const ok = isSelectable(d);
                                                const selected = form.date === val;
                                                return (
                                                    <button key={d} type="button" disabled={!ok}
                                                        onClick={() => setForm((f) => ({ ...f, date: val }))}
                                                        className={`h-9 rounded-lg text-sm font-semibold transition-all
                                                            ${selected ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                                : ok ? 'text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary'
                                                                    : 'text-gray-300 dark:text-slate-700 cursor-not-allowed'}`}>
                                                        {d}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Time slots */}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" /> Pick a time {prettyPicked && <span className="text-primary normal-case font-semibold">· {prettyPicked}</span>}
                                        </p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {TIME_SLOTS.map((t) => (
                                                <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, time: t }))}
                                                    className={`h-10 rounded-xl text-xs font-bold transition-all border
                                                        ${form.time === t ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                        rows={2} placeholder="Anything you'd like us to know? (optional)" value={form.notes} onChange={set('notes')} />

                                    <button disabled={loading} type="submit"
                                        className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60">
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Request demo'}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
