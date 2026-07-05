import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import MenuButton from '../components/MenuButton';
import ProfileButton from '../components/ProfileButton';
import Dropdown from '../components/Dropdown';

const UPLOAD_URL = `${ADMIN_API_BASE.replace('/admin', '')}/upload`;
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const CATEGORIES = ['Tuition', 'Exam', 'Transport', 'Admission', 'Arrears', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = [{ k: 'Q1', sub: 'Apr–Jun' }, { k: 'Q2', sub: 'Jul–Sep' }, { k: 'Q3', sub: 'Oct–Dec' }, { k: 'Q4', sub: 'Jan–Mar' }];
const HALVES = [{ k: 'H1', sub: 'Apr–Sep' }, { k: 'H2', sub: 'Oct–Mar' }];
const FREQS = [
    { k: 'once', label: 'One-time', hint: 'Charged once (Exam, Admission)' },
    { k: 'monthly', label: 'Monthly', hint: 'A due each month you pick' },
    { k: 'quarterly', label: 'Quarterly', hint: 'One due per quarter' },
    { k: 'half', label: 'Half-yearly', hint: 'One due per half' },
    { k: 'yearly', label: 'Yearly', hint: 'One due for the year' },
];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
// Only ever treat an http(s) URL as a real screenshot link (blocks javascript:/data: URIs).
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : '');

const INV_PILL = {
    PENDING: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    WAIVED: 'bg-slate-100 text-slate-500',
};
const INV_LABEL = { PENDING: 'Pending', SUBMITTED: 'Under review', PAID: 'Paid', REJECTED: 'Rejected', WAIVED: 'Waived' };

const TABS = [
    { k: 'collections', label: 'Collections', icon: 'insights' },
    { k: 'dues', label: 'Dues', icon: 'receipt_long' },
    { k: 'settings', label: 'Payment Settings', icon: 'qr_code_2' },
];

const StatCard = ({ label, value, tone }) => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-5 sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-2xl sm:text-3xl font-black tracking-tight mt-2 ${tone || 'text-slate-900'}`}>{value}</p>
    </div>
);

const Fees = () => {
    const { classes, getSections } = useAdmin();
    const { toast } = useToast();
    const schoolId = localStorage.getItem('scoolg_school_id') || '';
    const schoolName = localStorage.getItem('scoolg_school_name') || 'School';
    const CUR_YEAR = new Date().getFullYear();

    const [tab, setTab] = useState('collections');
    const [summary, setSummary] = useState(null);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [settings, setSettings] = useState({ upiId: '', payeeName: '', bankName: '', accountNumber: '', ifsc: '', qrImageUrl: '', instructions: '', methods: ['UPI', 'BANK', 'CASH'] });
    const [loading, setLoading] = useState(true);

    const [fClass, setFClass] = useState('ALL');
    const [fSection, setFSection] = useState('All');
    const [fStatus, setFStatus] = useState('ALL');
    const [fPeriod, setFPeriod] = useState('All');
    const [periods, setPeriods] = useState([]);
    const [duesSections, setDuesSections] = useState([]);
    const [modalSections, setModalSections] = useState([]);
    const [bulking, setBulking] = useState(false);

    const [feeModal, setFeeModal] = useState(null);
    const [proof, setProof] = useState(null);
    const [savingCfg, setSavingCfg] = useState(false);
    const [uploadingQr, setUploadingQr] = useState(false);
    const [creating, setCreating] = useState(false);

    const api = (p) => `${ADMIN_API_BASE}/fees${p}`;

    const loadSectionsFor = useCallback((className, setter) => {
        const cls = classes.find((c) => c.className === className);
        if (!cls || !className || className === 'ALL') { setter([]); return; }
        getSections(cls._id).then((d) => setter(Array.isArray(d) ? d : [])).catch(() => setter([]));
    }, [classes, getSections]);

    const loadCollections = useCallback(async () => {
        try {
            const [s, p] = await Promise.all([
                axios.get(api(`/summary?schoolId=${schoolId}`)),
                axios.get(api(`/payments?schoolId=${schoolId}&status=SUBMITTED`)),
            ]);
            setSummary(s.data); setPayments(Array.isArray(p.data) ? p.data : []);
        } catch { /* ignore */ } finally { setLoading(false); }
    }, [schoolId]);

    const loadInvoices = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ schoolId });
            if (fClass !== 'ALL') params.append('className', fClass);
            if (fSection !== 'All') params.append('section', fSection);
            if (fStatus !== 'ALL') params.append('status', fStatus);
            if (fPeriod !== 'All') params.append('period', fPeriod);
            const r = await axios.get(api(`/invoices?${params.toString()}`));
            setInvoices(Array.isArray(r.data) ? r.data : []);
        } catch { setInvoices([]); } finally { setLoading(false); }
    }, [schoolId, fClass, fSection, fStatus, fPeriod]);

    const loadPeriods = useCallback(async () => {
        try { const r = await axios.get(api(`/periods?schoolId=${schoolId}`)); setPeriods(Array.isArray(r.data) ? r.data : []); }
        catch { setPeriods([]); }
    }, [schoolId]);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try { const r = await axios.get(api(`/settings?schoolId=${schoolId}`)); setSettings((s) => ({ ...s, ...(r.data || {}) })); }
        catch { /* ignore */ } finally { setLoading(false); }
    }, [schoolId]);

    useEffect(() => {
        if (tab === 'collections') loadCollections();
        else if (tab === 'dues') { loadInvoices(); loadPeriods(); }
        else if (tab === 'settings') loadSettings();
    }, [tab, loadCollections, loadInvoices, loadPeriods, loadSettings]);

    useEffect(() => { loadSectionsFor(fClass, setDuesSections); setFSection('All'); }, [fClass, loadSectionsFor]);
    useEffect(() => { if (feeModal) loadSectionsFor(feeModal.target, setModalSections); }, [feeModal?.target, loadSectionsFor]); // eslint-disable-line

    // ---- actions ----
    const openFee = (init) => setFeeModal({ target: 'ALL', section: 'All', freq: 'monthly', title: '', category: 'Tuition', amount: '', dueDate: '', picks: [], year: CUR_YEAR, ...init });
    const togglePick = (k) => setFeeModal((f) => ({ ...f, picks: f.picks.includes(k) ? f.picks.filter((x) => x !== k) : [...f.picks, k] }));

    const verifyPayment = async (id) => {
        try { await axios.post(api(`/payments/${id}/verify`)); toast.success('Payment verified'); setProof(null); loadCollections(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };
    const rejectPayment = async (id) => {
        const reason = window.prompt('Reason for rejection (optional):') ?? '';
        try { await axios.post(api(`/payments/${id}/reject`), { reason }); toast.success('Payment rejected'); setProof(null); loadCollections(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };
    const markCash = async (inv) => {
        if (!window.confirm(`Mark ${money(inv.amount)} for ${inv.studentName} as paid (cash)?`)) return;
        try { await axios.post(api(`/invoices/${inv.id}/mark-paid`), { method: 'CASH' }); toast.success('Marked paid'); loadInvoices(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };
    const waiveInvoice = async (inv) => {
        if (!window.confirm(`Waive this due for ${inv.studentName}?`)) return;
        try { await axios.patch(api(`/invoices/${inv.id}`), { status: 'WAIVED' }); toast.success('Waived'); loadInvoices(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };
    const deleteInvoice = async (inv) => {
        if (!window.confirm('Delete this due?')) return;
        try { await axios.delete(api(`/invoices/${inv.id}`)); toast.success('Deleted'); loadInvoices(); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    };

    // Describe the current Dues filter for the bulk confirm dialogs.
    const filterDesc = () => {
        const bits = [];
        bits.push(fClass === 'ALL' ? 'all classes' : fClass + (fSection !== 'All' ? `-${fSection}` : ''));
        if (fStatus !== 'ALL') bits.push(INV_LABEL[fStatus]?.toLowerCase());
        if (fPeriod !== 'All') bits.push(fPeriod);
        return bits.join(' · ');
    };
    const bulkAction = async (action) => {
        const label = action === 'delete' ? 'DELETE' : 'mark PAID (cash)';
        if (!window.confirm(`This will ${label} every due in the current view (${filterDesc()}). This can't be undone. Continue?`)) return;
        setBulking(true);
        try {
            const r = await axios.post(api('/bulk'), { schoolId, action, className: fClass, section: fSection, status: fStatus, period: fPeriod });
            toast.success(r.data.message || 'Done'); loadInvoices();
        } catch (e) { toast.error(e.response?.data?.error || 'Bulk action failed'); } finally { setBulking(false); }
    };

    const submitFee = async () => {
        if (!feeModal.title.trim() || !feeModal.amount) { toast.warning('Fee name and amount are required'); return; }
        let months = [];
        const y = feeModal.year;
        if (['monthly', 'quarterly', 'half'].includes(feeModal.freq)) {
            if (!feeModal.picks.length) { toast.warning('Pick at least one period below'); return; }
            months = feeModal.picks.map((p) => `${p} ${y}`);
        } else if (feeModal.freq === 'yearly') {
            months = [`${y}`];
        } // 'once' -> single due, no period
        setCreating(true);
        try {
            const r = await axios.post(api('/generate'), {
                schoolId, className: feeModal.target, section: feeModal.section,
                title: feeModal.title.trim(), category: feeModal.category, amount: Number(feeModal.amount),
                months, dueDate: feeModal.dueDate || null,
            });
            toast.success(r.data.message || 'Dues created'); setFeeModal(null);
            if (tab === 'dues') loadInvoices(); else setTab('dues');
        } catch (e) { toast.error(e.response?.data?.error || 'Failed'); } finally { setCreating(false); }
    };

    const saveSettings = async () => {
        setSavingCfg(true);
        try { await axios.put(api('/settings'), { schoolId, ...settings }); toast.success('Payment details saved'); }
        catch (e) { toast.error(e.response?.data?.error || 'Failed to save'); } finally { setSavingCfg(false); }
    };
    const uploadQr = async (file) => {
        if (!file) return;
        setUploadingQr(true);
        try {
            const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
            const r = await axios.post(UPLOAD_URL, { file: base64, folder: 'Fees', schoolName });
            setSettings((s) => ({ ...s, qrImageUrl: r.data.url }));
            toast.success('QR uploaded');
        } catch { toast.error('Upload failed'); } finally { setUploadingQr(false); }
    };

    const classOptions = [{ value: 'ALL', label: 'All classes' }, ...classes.map((c) => ({ value: c.className, label: c.className }))];
    const duesSectionOpts = [{ value: 'All', label: 'All sections' }, ...duesSections.map((s) => ({ value: s.sectionName, label: s.sectionName }))];
    const modalSectionOpts = [{ value: 'All', label: 'All sections' }, ...modalSections.map((s) => ({ value: s.sectionName, label: s.sectionName }))];

    const CreateBtn = ({ className = '' }) => (
        <button onClick={() => openFee({ target: fClass, section: fSection })}
            className={`bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 ${className}`}>
            <span className="material-symbols-outlined text-[18px]">add</span> Create Fee
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            <header className="h-16 md:h-[80px] sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2 min-w-0">
                    <MenuButton />
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">Fees</h2>
                </div>
                <ProfileButton size={42} />
            </header>

            <div className="px-4 md:px-8 pt-5">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {TABS.map((t) => (
                        <button key={t.k} onClick={() => setTab(t.k)}
                            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === t.k ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
                            <span className="material-symbols-outlined text-[19px]">{t.icon}</span>{t.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-4 md:px-8 pt-6 space-y-6">
                {/* ============ COLLECTIONS ============ */}
                {tab === 'collections' && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <StatCard label="Collected" value={money(summary?.totalCollected)} tone="text-emerald-600" />
                            <StatCard label="Pending" value={money(summary?.totalPending)} tone="text-amber-600" />
                            <StatCard label="This month" value={money(summary?.thisMonthCollected)} tone="text-blue-600" />
                            <StatCard label="To verify" value={summary?.pendingVerification ?? 0} tone="text-slate-900" />
                        </div>

                        <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                                <span className="w-2 h-6 bg-blue-600 rounded-full" />
                                <h3 className="font-black text-slate-900 tracking-tight">Payments to verify</h3>
                                <span className="ml-auto text-xs font-black text-slate-400">{payments.length}</span>
                            </div>
                            {payments.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">All caught up — nothing to verify</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {payments.map((p) => (
                                        <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                                            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center font-black text-sm shrink-0">{(p.studentName || '?')[0]}</div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-slate-900 text-[15px] truncate">{p.studentName}</p>
                                                <p className="text-xs text-slate-400 font-bold truncate">{p.invoiceTitle} · {p.method} {p.referenceNo ? `· ${p.referenceNo}` : ''}</p>
                                            </div>
                                            <p className="font-black text-slate-900 shrink-0">{money(p.amount)}</p>
                                            <button onClick={() => setProof(p)} className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-colors">Review</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {summary?.byClass?.length > 0 && (
                            <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                                <h3 className="font-black text-slate-900 tracking-tight mb-4">Class-wise collection</h3>
                                <div className="space-y-3">
                                    {summary.byClass.slice(0, 15).map((c) => {
                                        const pct = c.invoiced ? Math.round((c.collected / c.invoiced) * 100) : 0;
                                        return (
                                            <button key={c.className} onClick={() => { setFClass(c.className); setFStatus('PENDING'); setTab('dues'); }} className="w-full text-left group">
                                                <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-700 group-hover:text-blue-600">{c.className}</span><span className="text-slate-400">{money(c.pending)} pending · {pct}% collected</span></div>
                                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold mt-4">Tap a class to see who's pending (section-wise).</p>
                            </section>
                        )}

                        {/* Fees the school has set up */}
                        <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h3 className="font-black text-slate-900 tracking-tight">Fees you've set</h3>
                                <CreateBtn />
                            </div>
                            {!summary?.byFee || summary.byFee.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 text-sm font-bold">No fees created yet — tap "Create Fee" to add one.</div>
                            ) : (
                                <div className="space-y-2">
                                    {summary.byFee.map((f) => (
                                        <div key={f.title} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 grid place-items-center shrink-0"><span className="material-symbols-outlined text-[20px]">payments</span></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-slate-900 text-sm truncate">{f.title}</p>
                                                <p className="text-xs text-slate-400 font-bold">{f.count} due(s)</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-slate-900 text-sm">{money(f.total)}</p>
                                                <p className="text-[11px] text-emerald-600 font-bold">{money(f.collected)} collected</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* ============ DUES ============ */}
                {tab === 'dues' && (
                    <>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="w-32"><Dropdown value={fClass} onChange={setFClass} options={classOptions} buttonClassName="h-11" /></div>
                            <div className="w-32"><Dropdown value={fSection} onChange={setFSection} options={duesSectionOpts} buttonClassName="h-11" /></div>
                            <div className="w-32"><Dropdown value={fStatus} onChange={setFStatus} options={[{ value: 'ALL', label: 'All status' }, { value: 'PENDING', label: 'Pending' }, { value: 'SUBMITTED', label: 'Under review' }, { value: 'PAID', label: 'Paid' }, { value: 'WAIVED', label: 'Waived' }]} buttonClassName="h-11" /></div>
                            <div className="w-36"><Dropdown value={fPeriod} onChange={setFPeriod} options={[{ value: 'All', label: 'All months' }, ...periods.map((p) => ({ value: p, label: p }))]} buttonClassName="h-11" /></div>
                            <CreateBtn className="ml-auto" />
                        </div>

                        {/* Bulk actions on the current view */}
                        {invoices.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{invoices.length} due(s) shown</span>
                                <button disabled={bulking} onClick={() => bulkAction('markPaid')} className="ml-auto px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px]">done_all</span> Mark all paid
                                </button>
                                <button disabled={bulking} onClick={() => bulkAction('delete')} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-black hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px]">delete_sweep</span> Delete all
                                </button>
                            </div>
                        )}

                        <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                            {loading ? (
                                <div className="py-20 text-center"><div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>
                            ) : invoices.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <span className="material-symbols-outlined text-5xl text-slate-200">receipt_long</span>
                                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No dues here yet</p>
                                    <div className="flex justify-center"><CreateBtn /></div>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {invoices.map((inv) => (
                                        <div key={inv.id} className="px-4 sm:px-6 py-4 flex items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-black text-slate-900 text-[15px] truncate">{inv.studentName} <span className="text-slate-300 font-bold">·</span> <span className="text-slate-500 font-bold text-sm">{inv.className}{inv.section ? `-${inv.section}` : ''}</span></p>
                                                <p className="text-xs text-slate-400 font-bold truncate">{inv.title} · due {fmtDate(inv.dueDate)}</p>
                                            </div>
                                            <p className="font-black text-slate-900 shrink-0 text-sm">{money(inv.amount)}</p>
                                            <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${INV_PILL[inv.status]}`}>{INV_LABEL[inv.status]}</span>
                                            {(inv.status === 'PENDING' || inv.status === 'REJECTED') && (
                                                <div className="shrink-0 flex items-center gap-1">
                                                    <button title="Mark cash paid" onClick={() => markCash(inv)} className="w-8 h-8 grid place-items-center rounded-lg text-emerald-600 hover:bg-emerald-50"><span className="material-symbols-outlined text-[19px]">payments</span></button>
                                                    <button title="Waive" onClick={() => waiveInvoice(inv)} className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><span className="material-symbols-outlined text-[19px]">block</span></button>
                                                    <button title="Delete" onClick={() => deleteInvoice(inv)} className="w-8 h-8 grid place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><span className="material-symbols-outlined text-[19px]">delete</span></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* ============ SETTINGS ============ */}
                {tab === 'settings' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-4">
                            <h3 className="font-black text-slate-900 tracking-tight">Payee details</h3>
                            {[['upiId', 'UPI ID', 'name@bank'], ['payeeName', 'Payee name', 'Account holder'], ['bankName', 'Bank name', 'HDFC Bank'], ['accountNumber', 'Account number', ''], ['ifsc', 'IFSC code', '']].map(([k, label, ph]) => (
                                <div key={k}>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
                                    <input value={settings[k] || ''} onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.value }))} placeholder={ph}
                                        className="mt-1.5 w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10" />
                                </div>
                            ))}
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Instructions to parents</label>
                                <textarea value={settings.instructions || ''} onChange={(e) => setSettings((s) => ({ ...s, instructions: e.target.value }))} rows={2} placeholder="e.g. Pay before the 10th of every month"
                                    className="mt-1.5 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 resize-none" />
                            </div>
                            <button onClick={saveSettings} disabled={savingCfg} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60">
                                {savingCfg ? 'Saving…' : 'Save details'}
                            </button>
                        </div>

                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-4">
                            <h3 className="font-black text-slate-900 tracking-tight">UPI QR code</h3>
                            <p className="text-xs text-slate-400 font-bold">Upload your UPI QR — parents scan it to pay.</p>
                            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center gap-4">
                                {settings.qrImageUrl ? (
                                    <img src={settings.qrImageUrl} alt="UPI QR" className="w-44 h-44 object-contain rounded-2xl bg-white" />
                                ) : (
                                    <div className="w-44 h-44 rounded-2xl bg-slate-50 grid place-items-center text-slate-300"><span className="material-symbols-outlined text-6xl">qr_code_2</span></div>
                                )}
                                <label className="cursor-pointer px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                                    {uploadingQr ? 'Uploading…' : settings.qrImageUrl ? 'Replace QR' : 'Upload QR'}
                                    <input type="file" accept="image/*" hidden onChange={(e) => uploadQr(e.target.files?.[0])} />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ===== Create Fee modal (the single fee-creation flow) ===== */}
            {feeModal && (
                <Modal onClose={() => setFeeModal(null)} title="Create a fee">
                    <div className="space-y-5">
                        {/* Who */}
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2">1 · Who pays</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Class"><Dropdown value={feeModal.target} onChange={(v) => setFeeModal((f) => ({ ...f, target: v, section: 'All' }))} options={classOptions} buttonClassName="h-12 bg-slate-50" /></Field>
                                <Field label="Section"><Dropdown value={feeModal.section} onChange={(v) => setFeeModal((f) => ({ ...f, section: v }))} options={modalSectionOpts} buttonClassName="h-12 bg-slate-50" /></Field>
                            </div>
                        </div>

                        {/* What */}
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2">2 · Fee details</p>
                            <div className="space-y-3">
                                <Field label="Fee name"><input value={feeModal.title} onChange={(e) => setFeeModal((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Tuition Fee, Exam Fee, Arrears" className="modal-in" /></Field>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Category"><Dropdown value={feeModal.category} onChange={(v) => setFeeModal((f) => ({ ...f, category: v }))} options={CATEGORIES} buttonClassName="h-12 bg-slate-50" /></Field>
                                    <Field label="Amount (₹)"><input type="number" value={feeModal.amount} onChange={(e) => setFeeModal((f) => ({ ...f, amount: e.target.value }))} placeholder="1200" className="modal-in" /></Field>
                                </div>
                            </div>
                        </div>

                        {/* When */}
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2">3 · How often</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {FREQS.map((fr) => (
                                    <button type="button" key={fr.k} onClick={() => setFeeModal((f) => ({ ...f, freq: fr.k, picks: [] }))}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border-2 ${feeModal.freq === fr.k ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'}`}>
                                        {fr.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold mb-3">{FREQS.find((f) => f.k === feeModal.freq)?.hint}</p>

                            {feeModal.freq !== 'once' && (
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Year</span>
                                        <input type="number" value={feeModal.year} onChange={(e) => setFeeModal((f) => ({ ...f, year: e.target.value }))} className="w-24 h-8 bg-white border border-slate-200 rounded-lg px-2 font-bold text-xs text-slate-900 outline-none" />
                                        {feeModal.freq === 'monthly' && (
                                            <>
                                                <button type="button" onClick={() => setFeeModal((f) => ({ ...f, picks: [...MONTHS] }))} className="ml-auto px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 text-[11px] font-black">All 12</button>
                                                <button type="button" onClick={() => setFeeModal((f) => ({ ...f, picks: [] }))} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-500 text-[11px] font-black">Clear</button>
                                            </>
                                        )}
                                    </div>

                                    {feeModal.freq === 'monthly' && (
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {MONTHS.map((m) => (
                                                <button type="button" key={m} onClick={() => togglePick(m)}
                                                    className={`h-9 rounded-lg text-xs font-black transition-colors ${feeModal.picks.includes(m) ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>{m}</button>
                                            ))}
                                        </div>
                                    )}
                                    {(feeModal.freq === 'quarterly' ? QUARTERS : feeModal.freq === 'half' ? HALVES : []).length > 0 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {(feeModal.freq === 'quarterly' ? QUARTERS : HALVES).map((p) => (
                                                <button type="button" key={p.k} onClick={() => togglePick(p.k)}
                                                    className={`p-2.5 rounded-xl text-left transition-colors ${feeModal.picks.includes(p.k) ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                                                    <span className="font-black text-sm">{p.k}</span> <span className={`text-[10px] font-bold ${feeModal.picks.includes(p.k) ? 'text-white/70' : 'text-slate-400'}`}>{p.sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {feeModal.freq === 'yearly' && (
                                        <p className="text-sm font-bold text-slate-600">One due for the whole year <span className="text-blue-600 font-black">{feeModal.year}</span>.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <Field label="Due date (optional)"><input type="date" value={feeModal.dueDate} onChange={(e) => setFeeModal((f) => ({ ...f, dueDate: e.target.value }))} className="modal-in" /></Field>

                        <button onClick={submitFee} disabled={creating} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 uppercase tracking-widest text-xs disabled:opacity-60">
                            {creating ? 'Creating…' : 'Create dues'}
                        </button>
                        <p className="text-[11px] text-slate-400 font-bold text-center">Creates one due per active student in the selection.</p>
                    </div>
                </Modal>
            )}

            {/* ===== Review payment modal ===== */}
            {proof && (
                <Modal onClose={() => setProof(null)} title="Review payment">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="font-black text-slate-900 text-lg">{proof.studentName}</p><p className="text-xs text-slate-400 font-bold">{proof.invoiceTitle}</p></div>
                            <p className="font-black text-2xl text-slate-900">{money(proof.amount)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">{proof.method}</span>
                            {proof.referenceNo && <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">Ref: {proof.referenceNo}</span>}
                        </div>
                        {safeUrl(proof.screenshotUrl) ? (
                            <a href={safeUrl(proof.screenshotUrl)} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden border border-slate-100">
                                <img src={safeUrl(proof.screenshotUrl)} alt="Payment proof" className="w-full max-h-80 object-contain bg-slate-50" />
                            </a>
                        ) : (
                            <div className="py-8 text-center text-slate-400 text-sm font-bold bg-slate-50 rounded-2xl">No screenshot attached</div>
                        )}
                        {proof.note && <p className="text-sm text-slate-500 font-semibold bg-slate-50 rounded-2xl px-4 py-3">{proof.note}</p>}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => rejectPayment(proof.id)} className="py-4 rounded-2xl bg-white border-2 border-rose-100 text-rose-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50">Reject</button>
                            <button onClick={() => verifyPayment(proof.id)} className="py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-700">Verify &amp; mark paid</button>
                        </div>
                    </div>
                </Modal>
            )}

            <style>{`.modal-in{width:100%;height:3rem;background:#f8fafc;border:1px solid #f1f5f9;border-radius:1rem;padding:0 1rem;font-weight:700;font-size:.875rem;color:#0f172a;outline:none}.modal-in:focus{box-shadow:0 0 0 4px rgba(37,99,235,.1)}`}</style>
        </div>
    );
};

const Field = ({ label, children }) => (
    <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label><div className="mt-1.5">{children}</div></div>
);

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative z-10 bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 grid place-items-center text-slate-400 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

export default Fees;
