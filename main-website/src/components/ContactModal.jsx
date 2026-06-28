import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MessageSquare, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';

const API = 'https://scoolg-backend.netlify.app/api';

export default function ContactModal({ open, onClose }) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const close = () => {
        setForm({ name: '', email: '', phone: '', message: '' });
        setError(''); setDone(false); setLoading(false);
        onClose();
    };

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) return setError('Please enter your name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email.');
        if (!form.message.trim()) return setError('Please write your message.');
        setLoading(true);
        try {
            const res = await fetch(`${API}/contact`, {
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

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={close}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 14 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[460px] bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl p-7 sm:p-8">

                        <button onClick={close} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            {done ? <CheckCircle2 className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                        </div>

                        {done ? (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Message sent! 🎉</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-6">
                                    Thanks for reaching out — our team will get back to you shortly.
                                </p>
                                <button onClick={close} className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all active:scale-[0.98]">Done</button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact us</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-5">Have a question? Send us a message and we'll reply by email.</p>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 dark:bg-red-950/40 dark:border-red-900/50">
                                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-3.5">
                                    <div className="relative">
                                        <User className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input className={inputCls} placeholder="Your name" value={form.name} onChange={set('name')} />
                                    </div>
                                    <div className="relative">
                                        <Mail className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input className={inputCls} type="email" placeholder="Email address" value={form.email} onChange={set('email')} />
                                    </div>
                                    <div className="relative">
                                        <Phone className="h-[18px] w-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input className={inputCls} placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} />
                                    </div>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                                        rows={4} placeholder="How can we help you?" value={form.message} onChange={set('message')} />
                                    <button disabled={loading} type="submit"
                                        className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60">
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send message <Send className="h-4 w-4" /></>}
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
