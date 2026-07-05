import React, { useState, useEffect } from 'react';
import { Wallet, IndianRupee, CheckCircle2, Clock, Upload, Copy, X, Receipt, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../utils/api';
import { getCached, peekCache } from '../utils/cache';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

const STATUS = {
    PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    SUBMITTED: { label: 'Under review', cls: 'bg-blue-100 text-blue-700', icon: ShieldCheck },
    PAID: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    REJECTED: { label: 'Re-pay needed', cls: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
    WAIVED: { label: 'Waived', cls: 'bg-slate-100 text-slate-500', icon: CheckCircle2 },
};

const CACHE_KEY = 'student:fees';

const Fees = () => {
    const [data, setData] = useState(() => peekCache(CACHE_KEY) || null);
    const [loading, setLoading] = useState(() => !peekCache(CACHE_KEY));
    const [paySheet, setPaySheet] = useState(null);      // invoice being paid
    const [receipt, setReceipt] = useState(null);        // paid invoice to show receipt
    const [pf, setPf] = useState({ method: 'UPI', referenceNo: '', screenshotUrl: '', uploading: false, submitting: false });
    const [copied, setCopied] = useState('');

    const loadFees = () =>
        getCached(CACHE_KEY, () => api.get('/student/fees').then((r) => r.data))
            .then((d) => setData(d)).catch(() => { }).finally(() => setLoading(false));

    useEffect(() => { let alive = true; loadFees().then(() => { if (!alive) setData((x) => x); }); return () => { alive = false; }; }, []);

    const cfg = data?.paymentConfig || {};
    const invoices = data?.invoices || [];
    const summary = data?.summary || { totalDue: 0, paid: 0, pending: 0 };

    const copy = (text, tag) => { try { navigator.clipboard.writeText(text); setCopied(tag); setTimeout(() => setCopied(''), 1500); } catch { } };

    const openPay = (inv) => { setPf({ method: (cfg.methods?.[0] || 'UPI'), referenceNo: '', screenshotUrl: '', uploading: false, submitting: false }); setPaySheet(inv); };

    const uploadProof = async (file) => {
        if (!file) return;
        setPf((p) => ({ ...p, uploading: true }));
        try {
            const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
            const r = await api.post('/upload', { file: base64, folder: 'Fees' });
            setPf((p) => ({ ...p, screenshotUrl: r.data.url, uploading: false }));
        } catch { setPf((p) => ({ ...p, uploading: false })); }
    };

    const submitPay = async () => {
        if (!paySheet) return;
        setPf((p) => ({ ...p, submitting: true }));
        try {
            await api.post('/student/fees/pay', {
                invoiceId: paySheet.id, amount: paySheet.amount, method: pf.method,
                referenceNo: pf.referenceNo, screenshotUrl: pf.screenshotUrl,
            });
            setPaySheet(null);
            await loadFees();
        } catch { /* keep sheet open on failure */ }
        finally { setPf((p) => ({ ...p, submitting: false })); }
    };

    return (
        <div className="min-h-full bg-[#f8fafc] pb-28">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Fees &amp; Dues</h2>
                    <p className="text-sm text-slate-500 font-medium">Pay your school fees and track receipts.</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    {[['Total', summary.totalDue, 'text-slate-900'], ['Paid', summary.paid, 'text-emerald-600'], ['Pending', summary.pending, 'text-amber-600']].map(([l, v, tone]) => (
                        <div key={l} className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{l}</p>
                            <p className={`text-lg sm:text-xl font-black tracking-tight mt-1 ${tone}`}>{loading ? '—' : money(v)}</p>
                        </div>
                    ))}
                </div>

                {/* Dues */}
                {loading ? (
                    <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 bg-white rounded-[28px] border border-slate-100 animate-pulse" />)}</div>
                ) : invoices.length === 0 ? (
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-5"><CheckCircle2 size={38} strokeWidth={2} /></div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">No dues</h3>
                        <p className="text-slate-500 font-medium text-sm">You have no pending fees right now.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invoices.map((inv) => {
                            const st = STATUS[inv.status] || STATUS.PENDING;
                            const Icon = st.icon;
                            const payable = inv.status === 'PENDING' || inv.status === 'REJECTED';
                            return (
                                <div key={inv.id} className="bg-white rounded-[28px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Wallet size={22} /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-slate-900 text-[15px] truncate">{inv.title}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-0.5">{inv.dueDate ? `Due ${fmtDate(inv.dueDate)}` : inv.category}</p>
                                        </div>
                                        <p className="font-black text-slate-900 shrink-0">{money(inv.amount)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${st.cls}`}><Icon size={13} />{st.label}</span>
                                        <div className="ml-auto flex items-center gap-2">
                                            {inv.status === 'PAID' && (
                                                <button onClick={() => setReceipt(inv)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 transition-colors flex items-center gap-1.5"><Receipt size={14} /> Receipt</button>
                                            )}
                                            {payable && (
                                                <button onClick={() => openPay(inv)} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Pay Now</button>
                                            )}
                                        </div>
                                    </div>
                                    {inv.status === 'SUBMITTED' && <p className="text-[11px] text-blue-600 font-bold mt-2">Waiting for the school to verify your payment.</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===== Pay sheet ===== */}
            {paySheet && (
                <Sheet onClose={() => setPaySheet(null)}>
                    <div className="text-center mb-5">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Amount to pay</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">{money(paySheet.amount)}</p>
                        <p className="text-sm text-slate-500 font-bold mt-1">{paySheet.title}</p>
                    </div>

                    {/* QR + UPI */}
                    {(cfg.qrImageUrl || cfg.upiId) && (
                        <div className="bg-slate-50 rounded-[28px] p-6 flex flex-col items-center gap-4 mb-4">
                            {cfg.qrImageUrl && <img src={cfg.qrImageUrl} alt="Scan to pay" className="w-48 h-48 object-contain rounded-2xl bg-white p-2 shadow-sm" />}
                            {cfg.upiId && (
                                <button onClick={() => copy(cfg.upiId, 'upi')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 font-black text-slate-800 text-sm">
                                    {cfg.upiId} <Copy size={14} className="text-blue-600" /> {copied === 'upi' && <span className="text-emerald-600 text-xs">copied</span>}
                                </button>
                            )}
                            <p className="text-xs text-slate-400 font-bold text-center">Scan the QR or pay to the UPI ID in any UPI app.</p>
                        </div>
                    )}

                    {/* Bank */}
                    {cfg.accountNumber && (
                        <div className="bg-slate-50 rounded-[24px] p-5 mb-4 space-y-2">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Bank transfer</p>
                            {[['Name', cfg.payeeName], ['Bank', cfg.bankName], ['A/C', cfg.accountNumber], ['IFSC', cfg.ifsc]].filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center text-sm"><span className="text-slate-400 font-bold">{k}</span><button onClick={() => copy(v, k)} className="font-black text-slate-800 flex items-center gap-1.5">{v} <Copy size={12} className="text-blue-600" /></button></div>
                            ))}
                        </div>
                    )}

                    {cfg.instructions && <p className="text-xs text-slate-500 font-semibold bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">{cfg.instructions}</p>}

                    {/* Upload proof */}
                    <div className="border-t border-slate-100 pt-5 space-y-3">
                        <p className="text-sm font-black text-slate-900">Paid already? Upload the screenshot</p>
                        {pf.screenshotUrl ? (
                            <div className="relative">
                                <img src={pf.screenshotUrl} alt="proof" className="w-full max-h-52 object-contain rounded-2xl border border-slate-100 bg-slate-50" />
                                <button onClick={() => setPf((p) => ({ ...p, screenshotUrl: '' }))} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/70 text-white grid place-items-center"><X size={16} /></button>
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-2 py-5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors">
                                <Upload size={18} /> {pf.uploading ? 'Uploading…' : 'Choose screenshot'}
                                <input type="file" accept="image/*" hidden onChange={(e) => uploadProof(e.target.files?.[0])} />
                            </label>
                        )}
                        <input value={pf.referenceNo} onChange={(e) => setPf((p) => ({ ...p, referenceNo: e.target.value }))} placeholder="Reference / UTR no. (optional)"
                            className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10" />
                        <button onClick={submitPay} disabled={pf.submitting || pf.uploading}
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60">
                            {pf.submitting ? 'Submitting…' : 'Submit for verification'}
                        </button>
                        <p className="text-[11px] text-slate-400 font-bold text-center">The school will verify and mark it paid.</p>
                    </div>
                </Sheet>
            )}

            {/* ===== Receipt ===== */}
            {receipt && (
                <Sheet onClose={() => setReceipt(null)}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full grid place-items-center mx-auto mb-3"><CheckCircle2 size={34} /></div>
                        <h3 className="text-xl font-black text-slate-900">Payment Receipt</h3>
                        <p className="text-xs text-slate-400 font-bold">{data?.student?.name} · {data?.student?.class}{data?.student?.section ? `-${data.student.section}` : ''}</p>
                    </div>
                    <div className="bg-slate-50 rounded-[24px] p-5 mt-5 space-y-3">
                        {[['Fee', receipt.title], ['Amount', money(receipt.amount)], ['Paid via', receipt.paidVia || '—'], ['Date', fmtDate(receipt.paidAt) || '—']].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm"><span className="text-slate-400 font-bold">{k}</span><span className="font-black text-slate-800">{v}</span></div>
                        ))}
                        <div className="border-t border-slate-200 pt-3 flex items-center gap-2 text-emerald-600 font-black text-sm justify-center"><ShieldCheck size={16} /> Verified &amp; Paid</div>
                    </div>
                    <button onClick={() => setReceipt(null)} className="w-full mt-5 bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Done</button>
                </Sheet>
            )}
        </div>
    );
};

// Bottom sheet on mobile / centered card on desktop.
const Sheet = ({ children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[90vh] overflow-y-auto p-6 pb-8">
            <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
            {children}
        </div>
    </div>
);

export default Fees;
