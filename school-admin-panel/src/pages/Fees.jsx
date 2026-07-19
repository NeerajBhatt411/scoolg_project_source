import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import MenuButton from '../components/MenuButton';
import ProfileButton from '../components/ProfileButton';
import Dropdown from '../components/Dropdown';
import FeeReceiptPrint from '../components/FeeReceiptPrint';

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
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : '');

const INV_PILL = {
    PENDING: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    PARTIALLY_PAID: 'bg-indigo-100 text-indigo-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    WAIVED: 'bg-slate-100 text-slate-500',
};
const INV_LABEL = { 
    PENDING: 'Pending', 
    SUBMITTED: 'Under review', 
    PAID: 'Paid', 
    PARTIALLY_PAID: 'Partial',
    REJECTED: 'Rejected', 
    WAIVED: 'Waived' 
};

const TABS = [
    { k: 'collections', label: 'Collections', icon: 'insights' },
    { k: 'deposit', label: 'Fee Deposit / Ledger', icon: 'payments' },
    { k: 'dues', label: 'Dues', icon: 'receipt_long' },
    { k: 'slabs', label: 'Fee Slabs', icon: 'settings_accessibility' },
    { k: 'discounts', label: 'Discounts', icon: 'percent' },
    { k: 'settings', label: 'Payment Settings', icon: 'qr_code_2' },
];

const StatCard = ({ label, value, tone }) => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-5 sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-2xl sm:text-3xl font-black tracking-tight mt-2 ${tone || 'text-slate-900'}`}>{value}</p>
    </div>
);

const Fees = () => {
    const { classes, students, getSections } = useAdmin();
    const { toast } = useToast();
    const schoolId = localStorage.getItem('scoolg_school_id') || '';
    const schoolName = localStorage.getItem('scoolg_school_name') || 'School';
    const CUR_YEAR = new Date().getFullYear();

    const location = useLocation();
    const navigate = useNavigate();

    const [tab, setTab] = useState('collections');

    // Parse initial tab from search params on mount or when location changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const t = params.get('tab');
        if (t && TABS.some(tabObj => tabObj.k === t)) {
            setTab(t);
        }
    }, [location.search]);
    const [summary, setSummary] = useState(null);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [settings, setSettings] = useState({ upiId: '', payeeName: '', bankName: '', accountNumber: '', ifsc: '', qrImageUrl: '', instructions: '', methods: ['UPI', 'BANK', 'CASH'] });
    const [loading, setLoading] = useState(true);

    // Dues Filters
    const [fClass, setFClass] = useState('ALL');
    const [fSection, setFSection] = useState('All');
    const [fStatus, setFStatus] = useState('ALL');
    const [fPeriod, setFPeriod] = useState('All');
    const [periods, setPeriods] = useState([]);
    const [duesSections, setDuesSections] = useState([]);
    const [modalSections, setModalSections] = useState([]);
    const [bulking, setBulking] = useState(false);

    // Fee Modals & Structures
    const [feeModal, setFeeModal] = useState(null);
    const [proof, setProof] = useState(null);
    const [savingCfg, setSavingCfg] = useState(false);
    const [uploadingQr, setUploadingQr] = useState(false);
    const [creating, setCreating] = useState(false);

    // Fee Slabs (FeeStructure)
    const [slabs, setSlabs] = useState([]);
    const [slabModal, setSlabModal] = useState(null);

    // Discounts
    const [discountsList, setDiscountsList] = useState([]);
    const [discountModal, setDiscountModal] = useState(null);
    const [discSearchText, setDiscSearchText] = useState('');
    const [selectedDiscStudent, setSelectedDiscStudent] = useState(null);

    // Fee Deposit Ledger
    const [depSearchText, setDepSearchText] = useState('');
    const [selectedDepStudent, setSelectedDepStudent] = useState(null);
    const [ledger, setLedger] = useState(null);
    const [ledgerLoading, setLedgerLoading] = useState(false);
    const [paySel, setPaySel] = useState([]); // selected invoiceIds
    const [amountPaid, setAmountPaid] = useState('');
    const [payMethod, setPayMethod] = useState('CASH');
    const [payRef, setPayRef] = useState('');
    const [payNote, setPayNote] = useState('');
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [depositing, setDepositing] = useState(false);

    // Print Receipt States
    const [printPayment, setPrintPayment] = useState(null);
    const [printStudent, setPrintStudent] = useState(null);
    const [printInvoices, setPrintInvoices] = useState([]);

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

    const loadSlabs = useCallback(async () => {
        setLoading(true);
        try {
            const r = await axios.get(api('/structure'));
            setSlabs(Array.isArray(r.data) ? r.data : []);
        } catch { setSlabs([]); } finally { setLoading(false); }
    }, []);

    const loadDiscountsList = useCallback(async () => {
        setLoading(true);
        try {
            const r = await axios.get(api('/discounts'));
            setDiscountsList(Array.isArray(r.data) ? r.data : []);
        } catch { setDiscountsList([]); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (tab === 'collections') loadCollections();
        else if (tab === 'dues') { loadInvoices(); loadPeriods(); }
        else if (tab === 'slabs') loadSlabs();
        else if (tab === 'discounts') loadDiscountsList();
        else if (tab === 'settings') loadSettings();
    }, [tab, loadCollections, loadInvoices, loadPeriods, loadSlabs, loadDiscountsList, loadSettings]);

    useEffect(() => { loadSectionsFor(fClass, setDuesSections); setFSection('All'); }, [fClass, loadSectionsFor]);
    useEffect(() => { if (feeModal) loadSectionsFor(feeModal.target, setModalSections); }, [feeModal?.target, loadSectionsFor]); // eslint-disable-line

    // Actions
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

    // Void offline/verified payments with Cancellation Trail
    const voidPayment = async (pay) => {
        const reason = window.prompt('Enter reason for cancelling/voiding this payment receipt:');
        if (!reason || !reason.trim()) {
            if (reason !== null) toast.warning('Reason is required to void payment.');
            return;
        }
        try {
            await axios.post(api(`/payments/${pay._id}/void`), { reason });
            toast.success('Payment voided and invoices rolled back');
            if (selectedDepStudent) loadStudentLedger(selectedDepStudent._id);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Failed to void');
        }
    };

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
        }
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

    // Slabs functions
    const saveSlab = async () => {
        if (!slabModal.className || !slabModal.amount) { toast.warning('Class and amount are required'); return; }
        try {
            await axios.post(api('/structure'), slabModal);
            toast.success('Fee Slab Saved');
            setSlabModal(null);
            loadSlabs();
        } catch { toast.error('Failed to save Slab'); }
    };
    const deleteSlab = async (id) => {
        if (!window.confirm('Delete this Fee Slab?')) return;
        try {
            await axios.delete(api(`/structure/${id}`));
            toast.success('Slab Deleted');
            loadSlabs();
        } catch { toast.error('Failed to delete Slab'); }
    };

    // Discounts functions
    const saveDiscount = async () => {
        if (!selectedDiscStudent || !discountModal.category || !discountModal.discountAmount) {
            toast.warning('Please select a student, category and enter discount amount');
            return;
        }
        try {
            await axios.post(api('/discounts'), {
                ...discountModal,
                studentId: selectedDiscStudent._id,
            });
            toast.success('Discount Assigned');
            setDiscountModal(null);
            setSelectedDiscStudent(null);
            setDiscSearchText('');
            loadDiscountsList();
        } catch { toast.error('Failed to save discount'); }
    };
    const deleteDiscount = async (id) => {
        if (!window.confirm('Delete this student discount?')) return;
        try {
            await axios.delete(api(`/discounts/${id}`));
            toast.success('Discount Removed');
            loadDiscountsList();
        } catch { toast.error('Failed to delete discount'); }
    };

    // Ledger & Deposit functions
    const loadStudentLedger = async (studentId) => {
        setLedgerLoading(true);
        setPaySel([]);
        try {
            const r = await axios.get(api(`/student/${studentId}/ledger`));
            setLedger(r.data);
        } catch {
            setLedger(null);
            toast.error('Failed to load student ledger');
        } finally {
            setLedgerLoading(false);
        }
    };

    const toggleInvoiceSelect = (invId) => {
        setPaySel(prev => prev.includes(invId) ? prev.filter(id => id !== invId) : [...prev, invId]);
    };

    // Auto calculate calculations based on selected checkboxes and student discount ledger
    const getCalculatedFees = () => {
        if (!ledger || !paySel.length) return { subtotal: 0, discount: 0, net: 0, discountMap: {} };
        let subtotal = 0;
        let discount = 0;
        const discountMap = {};

        paySel.forEach(invId => {
            const inv = ledger.invoices.find(i => i._id === invId);
            if (!inv) return;
            subtotal += inv.balanceAmount;

            // Check if there is an active discount on this student profile for this category
            const discObj = ledger.discounts.find(d => d.category === inv.category);
            let discAmount = 0;
            if (discObj) {
                // discount cannot exceed outstanding invoice balance
                discAmount = Math.min(discObj.discountAmount, inv.balanceAmount);
                discount += discAmount;
            }
            discountMap[invId] = discAmount;
        });

        return { subtotal, discount, net: subtotal - discount, discountMap };
    };

    const feeCalcs = getCalculatedFees();

    // Default editable pay amount to Net Payable
    useEffect(() => {
        if (paySel.length) {
            setAmountPaid(String(feeCalcs.net));
        } else {
            setAmountPaid('');
        }
    }, [paySel, feeCalcs.net]);

    const submitDeposit = async () => {
        if (!selectedDepStudent || !paySel.length || !amountPaid) {
            toast.warning('Please select invoices and enter deposit amount.');
            return;
        }
        setDepositing(true);
        try {
            const r = await axios.post(api('/deposit'), {
                studentId: selectedDepStudent._id,
                invoiceIds: paySel,
                amountPaid: Number(amountPaid),
                method: payMethod,
                referenceNo: payRef,
                note: payNote,
                discountMap: feeCalcs.discountMap,
            });
            toast.success('Fees Deposited Successfully!');
            setPaySel([]);
            setAmountPaid('');
            setPayRef('');
            setPayNote('');

            // Open Receipt Print Screen immediately
            setPrintPayment(r.data.payment);
            setPrintInvoices(ledger.invoices);
            setPrintStudent({
                name: ledger.student.name,
                class: ledger.student.class,
                section: ledger.student.section,
                studentAppId: ledger.student.studentAppId,
                admissionNumber: ledger.student.admissionNumber,
                fatherName: ledger.student.fatherName,
            });

            // Reload ledger
            loadStudentLedger(selectedDepStudent._id);
        } catch (e) {
            toast.error(e.response?.data?.error || 'Deposit failed');
        } finally {
            setDepositing(false);
        }
    };

    const classOptions = [{ value: 'ALL', label: 'All classes' }, ...classes.map((c) => ({ value: c.className, label: c.className }))];
    const duesSectionOpts = [{ value: 'All', label: 'All sections' }, ...duesSections.map((s) => ({ value: s.sectionName, label: s.sectionName }))];
    const modalSectionOpts = [{ value: 'All', label: 'All sections' }, ...modalSections.map((s) => ({ value: s.sectionName, label: s.sectionName }))];

    // Filter local active student list for searches
    const filterStudentList = (text) => {
        if (!text.trim()) return [];
        return (students || []).filter(s => {
            const full = `${s.firstName} ${s.lastName} ${s.studentAppId} ${s.class}`.toLowerCase();
            return full.includes(text.toLowerCase());
        }).slice(0, 5);
    };

    const searchDepStudents = filterStudentList(depSearchText);
    const searchDiscStudents = filterStudentList(discSearchText);

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
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">Fees Dashboard</h2>
                </div>
                <ProfileButton size={42} />
            </header>

            <div className="px-4 md:px-8 pt-5">
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {TABS.map((t) => (
                        <button key={t.k} onClick={() => { setTab(t.k); navigate(`/fees?tab=${t.k}`, { replace: true }); }}
                            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === t.k ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
                            <span className="material-symbols-outlined text-[19px]">{t.icon}</span>{t.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="px-4 md:px-8 pt-6 space-y-6">
                {/* ============ COLLECTIONS TAB ============ */}
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
                            </section>
                        )}
                    </>
                )}

                {/* ============ FEE DEPOSIT & LEDGER TAB ============ */}
                {tab === 'deposit' && (
                    <div className="space-y-6">
                        {/* Student Search and Info Header */}
                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-4">
                            <h3 className="font-black text-slate-900 tracking-tight">Search Student for Fee Deposit</h3>
                            <div className="relative">
                                <input type="text" value={depSearchText} onChange={(e) => setDepSearchText(e.target.value)} placeholder="Type student name, class, Section or Admission No..."
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10" />
                                {searchDepStudents.length > 0 && (
                                    <div className="absolute top-14 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                                        {searchDepStudents.map((s) => (
                                            <button key={s._id} onClick={() => { setSelectedDepStudent(s); setDepSearchText(''); loadStudentLedger(s._id); }}
                                                className="w-full text-left px-5 py-3 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                                <span className="font-black text-slate-800 text-sm">{s.firstName} {s.lastName}</span>
                                                <span className="text-xs text-slate-400 font-bold">Class {s.class}-{s.section} · Roll {s.rollNumber || '—'}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedDepStudent && ledger && (
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Student Name</span>
                                        <span className="text-slate-800 font-bold text-sm">{ledger.student.name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Class & Section</span>
                                        <span className="text-slate-800 font-bold text-sm">{ledger.student.class} - {ledger.student.section}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Admission No.</span>
                                        <span className="text-slate-800 font-bold text-sm">{ledger.student.admissionNumber || ledger.student.studentAppId || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black uppercase text-slate-400">Father's Name</span>
                                        <span className="text-slate-800 font-bold text-sm">{ledger.student.fatherName || '—'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedDepStudent && (
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Ledger & Unpaid Invoices selection */}
                                <div className="lg:col-span-2 space-y-6">
                                    <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                                        <h4 className="font-black text-slate-900 tracking-tight mb-4">Dues & Ledger Sheet</h4>
                                        {ledgerLoading ? (
                                            <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>
                                        ) : !ledger || !ledger.invoices.length ? (
                                            <div className="py-12 text-center text-slate-400 font-bold">No invoices generated for this student.</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left text-slate-500">
                                                    <thead>
                                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                            <th className="py-3 px-2">Select</th>
                                                            <th className="py-3">Particulars</th>
                                                            <th className="py-3">Due Date</th>
                                                            <th className="py-3 text-right">Amount</th>
                                                            <th className="py-3 text-right">Balance</th>
                                                            <th className="py-3 text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {ledger.invoices.map((inv) => {
                                                            const isPaid = inv.status === 'PAID' || inv.status === 'WAIVED';
                                                            return (
                                                                <tr key={inv._id} className="hover:bg-slate-50/50">
                                                                    <td className="py-3 px-2">
                                                                        <input type="checkbox" disabled={isPaid} checked={paySel.includes(inv._id)} onChange={() => toggleInvoiceSelect(inv._id)}
                                                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-30 cursor-pointer" />
                                                                    </td>
                                                                    <td className="py-3 font-bold text-slate-800">{inv.title}</td>
                                                                    <td className="py-3 font-medium text-slate-400">{fmtDate(inv.dueDate)}</td>
                                                                    <td className="py-3 text-right font-bold text-slate-800">{money(inv.amount)}</td>
                                                                    <td className="py-3 text-right font-black text-rose-600">{money(inv.balanceAmount)}</td>
                                                                    <td className="py-3 text-center">
                                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${INV_PILL[inv.status]}`}>{INV_LABEL[inv.status]}</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </section>

                                    {/* Processed Payments history (Receipts) */}
                                    <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                                        <h4 className="font-black text-slate-900 tracking-tight mb-4">Paid Receipts History</h4>
                                        {!ledger || !ledger.payments.length ? (
                                            <div className="py-8 text-center text-slate-400 font-bold">No payments deposited yet.</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {ledger.payments.map((pay) => (
                                                    <div key={pay._id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-3 border border-slate-100">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-black text-slate-800 text-sm">{pay.referenceNo}</span>
                                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${pay.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                    {pay.status === 'REJECTED' ? 'Voided' : 'Paid'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 font-bold mt-1">{fmtDate(pay.verifiedAt || pay.createdAt)} · {pay.method}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-slate-900 text-sm">{money(pay.amount)}</p>
                                                            {pay.status !== 'REJECTED' ? (
                                                                <div className="flex items-center gap-1.5 mt-1 justify-end">
                                                                    <button onClick={() => { setPrintPayment(pay); setPrintInvoices(ledger.invoices); setPrintStudent({ name: ledger.student.name, class: ledger.student.class, section: ledger.student.section, studentAppId: ledger.student.studentAppId, admissionNumber: ledger.student.admissionNumber, fatherName: ledger.student.fatherName }); }}
                                                                        className="w-7 h-7 bg-white text-slate-500 hover:text-blue-600 rounded-lg flex items-center justify-center border border-slate-200" title="Print Receipt">
                                                                        <span className="material-symbols-outlined text-[17px]">print</span>
                                                                    </button>
                                                                    <button onClick={() => voidPayment(pay)}
                                                                        className="w-7 h-7 bg-white text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center border border-rose-100" title="Cancel/Void Payment">
                                                                        <span className="material-symbols-outlined text-[17px]">block</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[10px] text-rose-600 font-bold mt-1 truncate max-w-[120px]">{pay.rejectionReason}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* Fee Deposit Collection side-card */}
                                <div className="space-y-6">
                                    <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-5 sticky top-24">
                                        <h4 className="font-black text-slate-900 tracking-tight">Deposit Form</h4>

                                        {!paySel.length ? (
                                            <div className="py-10 text-center text-slate-400 font-bold text-xs">
                                                Select months/invoices from the ledger to collect fee.
                                            </div>
                                        ) : (
                                            <div className="space-y-4 text-xs font-semibold text-slate-600">
                                                {/* Calculations */}
                                                <div className="space-y-2 border-b border-slate-100 pb-3">
                                                    <div className="flex justify-between">
                                                        <span>Subtotal ({paySel.length} bills)</span>
                                                        <span className="text-slate-800 font-bold">{money(feeCalcs.subtotal)}</span>
                                                    </div>
                                                    {feeCalcs.discount > 0 && (
                                                        <div className="flex justify-between text-emerald-600">
                                                            <span>Applied Discounts</span>
                                                            <span>-{money(feeCalcs.discount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2">
                                                        <span>Net Payable</span>
                                                        <span className="text-base text-blue-600">{money(feeCalcs.net)}</span>
                                                    </div>
                                                </div>

                                                {/* Deposit inputs */}
                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Amount Received (₹)</label>
                                                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                                                        className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-sm text-slate-900 focus:outline-none" />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Payment Mode</label>
                                                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                                                        className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-3 font-bold text-sm text-slate-900 focus:outline-none">
                                                        <option value="CASH">Cash</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="BANK">Bank Transfer</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Ref / Txn No. (optional)</label>
                                                    <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="e.g. UPI txn id, Cheque No"
                                                        className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-sm text-slate-900 focus:outline-none" />
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Note / Remarks (optional)</label>
                                                    <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="e.g. Paid by father"
                                                        className="mt-1.5 w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-sm text-slate-900 focus:outline-none" />
                                                </div>

                                                <button onClick={submitDeposit} disabled={depositing || !amountPaid}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10">
                                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                                    {depositing ? 'Processing…' : 'Deposit Fees & Print'}
                                                </button>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ============ DUES TAB ============ */}
                {tab === 'dues' && (
                    <>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="w-32"><Dropdown value={fClass} onChange={setFClass} options={classOptions} buttonClassName="h-11" /></div>
                            <div className="w-32"><Dropdown value={fSection} onChange={setFSection} options={duesSectionOpts} buttonClassName="h-11" /></div>
                            <div className="w-32"><Dropdown value={fStatus} onChange={setFStatus} options={[{ value: 'ALL', label: 'All status' }, { value: 'PENDING', label: 'Pending' }, { value: 'SUBMITTED', label: 'Under review' }, { value: 'PAID', label: 'Paid' }, { value: 'PARTIALLY_PAID', label: 'Partial' }, { value: 'WAIVED', label: 'Waived' }]} buttonClassName="h-11" /></div>
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
                                            {(inv.status === 'PENDING' || inv.status === 'REJECTED' || inv.status === 'PARTIALLY_PAID') && (
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

                {/* ============ FEE SLABS TAB ============ */}
                {tab === 'slabs' && (
                    <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Fee Masters (Slabs)</h3>
                                <p className="text-xs text-slate-400 font-bold">Define standard monthly/yearly fee amounts per class.</p>
                            </div>
                            <button onClick={() => setSlabModal({ className: classes[0]?.className || '1', label: 'Tuition Fee', category: 'Tuition', amount: '', frequency: 'Monthly', academicYear: `${CUR_YEAR}-${CUR_YEAR + 1}` })}
                                className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[17px]">add</span> Add Fee Slab
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center"><div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>
                        ) : slabs.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">No fee slabs configured yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-500">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <th className="py-3">Class</th>
                                            <th className="py-3">Fee Label</th>
                                            <th className="py-3">Category</th>
                                            <th className="py-3">Frequency</th>
                                            <th className="py-3 text-right">Amount</th>
                                            <th className="py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {slabs.map((sl) => (
                                            <tr key={sl.id}>
                                                <td className="py-3.5 font-black text-slate-900">{sl.className}</td>
                                                <td className="py-3.5 font-bold text-slate-700">{sl.label}</td>
                                                <td className="py-3.5 font-semibold text-slate-500">{sl.category}</td>
                                                <td className="py-3.5 font-semibold text-slate-500">{sl.frequency}</td>
                                                <td className="py-3.5 text-right font-black text-slate-900">{money(sl.amount)}</td>
                                                <td className="py-3.5 text-center">
                                                    <button onClick={() => deleteSlab(sl.id)} className="w-8 h-8 grid place-items-center text-rose-500 hover:bg-rose-50 rounded-lg mx-auto">
                                                        <span className="material-symbols-outlined text-[19px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ============ DISCOUNTS TAB ============ */}
                {tab === 'discounts' && (
                    <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Student-wise Concessions (Discounts)</h3>
                                <p className="text-xs text-slate-400 font-bold">Manage sibling, staff, merit or custom fee discounts.</p>
                            </div>
                            <button onClick={() => setDiscountModal({ category: 'Tuition', discountAmount: '', academicYear: `${CUR_YEAR}-${CUR_YEAR + 1}` })}
                                className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[17px]">add</span> Assign Discount
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center"><div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>
                        ) : discountsList.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">No student discounts configured yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-500">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <th className="py-3">Student Name</th>
                                            <th className="py-3">Class</th>
                                            <th className="py-3">Fee Category</th>
                                            <th className="py-3 text-right">Discount Amt</th>
                                            <th className="py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {discountsList.map((ds) => (
                                            <tr key={ds.id}>
                                                <td className="py-3.5">
                                                    <p className="font-black text-slate-900">{ds.studentName}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{ds.studentAppId}</p>
                                                </td>
                                                <td className="py-3.5 font-bold text-slate-700">{ds.class}-{ds.section}</td>
                                                <td className="py-3.5 font-semibold text-slate-500">{ds.category}</td>
                                                <td className="py-3.5 text-right font-black text-emerald-600">{money(ds.discountAmount)}</td>
                                                <td className="py-3.5 text-center">
                                                    <button onClick={() => deleteDiscount(ds.id)} className="w-8 h-8 grid place-items-center text-rose-500 hover:bg-rose-50 rounded-lg mx-auto">
                                                        <span className="material-symbols-outlined text-[19px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ============ SETTINGS TAB ============ */}
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

            {/* ===== Create Fee Modal ===== */}
            {feeModal && (
                <Modal onClose={() => setFeeModal(null)} title="Create a fee">
                    <div className="space-y-5">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2">1 · Who pays</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Class"><Dropdown value={feeModal.target} onChange={(v) => setFeeModal((f) => ({ ...f, target: v, section: 'All' }))} options={classOptions} buttonClassName="h-12 bg-slate-50" /></Field>
                                <Field label="Section"><Dropdown value={feeModal.section} onChange={(v) => setFeeModal((f) => ({ ...f, section: v }))} options={modalSectionOpts} buttonClassName="h-12 bg-slate-50" /></Field>
                            </div>
                        </div>

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
                                </div>
                            )}
                        </div>

                        <Field label="Due date (optional)"><input type="date" value={feeModal.dueDate} onChange={(e) => setFeeModal((f) => ({ ...f, dueDate: e.target.value }))} className="modal-in" /></Field>

                        <button onClick={submitFee} disabled={creating} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 uppercase tracking-widest text-xs disabled:opacity-60">
                            {creating ? 'Creating…' : 'Create dues'}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ===== Add Slab Modal ===== */}
            {slabModal && (
                <Modal onClose={() => setSlabModal(null)} title="Add Fee Slab">
                    <div className="space-y-4">
                        <Field label="Class">
                            <Dropdown value={slabModal.className} onChange={(v) => setSlabModal(prev => ({ ...prev, className: v }))}
                                options={classes.map(c => ({ value: c.className, label: c.className }))} buttonClassName="h-12 bg-slate-50" />
                        </Field>
                        <Field label="Fee Label">
                            <input value={slabModal.label} onChange={(e) => setSlabModal(prev => ({ ...prev, label: e.target.value }))} placeholder="e.g. Tuition Fee" className="modal-in" />
                        </Field>
                        <Field label="Category">
                            <Dropdown value={slabModal.category} onChange={(v) => setSlabModal(prev => ({ ...prev, category: v }))} options={CATEGORIES} buttonClassName="h-12 bg-slate-50" />
                        </Field>
                        <Field label="Amount (₹)">
                            <input type="number" value={slabModal.amount} onChange={(e) => setSlabModal(prev => ({ ...prev, amount: Number(e.target.value) }))} placeholder="Amount" className="modal-in" />
                        </Field>
                        <Field label="Frequency">
                            <select value={slabModal.frequency} onChange={(e) => setSlabModal(prev => ({ ...prev, frequency: e.target.value }))}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-3 font-bold text-sm text-slate-900 focus:outline-none">
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Half-Yearly">Half-Yearly</option>
                                <option value="Yearly">Yearly</option>
                                <option value="One-Time">One-Time</option>
                            </select>
                        </Field>
                        <button onClick={saveSlab} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 uppercase tracking-widest text-xs">
                            Save Slab
                        </button>
                    </div>
                </Modal>
            )}

            {/* ===== Add Discount Modal ===== */}
            {discountModal && (
                <Modal onClose={() => { setDiscountModal(null); setSelectedDiscStudent(null); setDiscSearchText(''); }} title="Assign Concession / Discount">
                    <div className="space-y-4">
                        <Field label="Search Student">
                            <div className="relative">
                                <input type="text" value={discSearchText} onChange={(e) => setDiscSearchText(e.target.value)} placeholder="Type name or ID to search student..."
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-sm text-slate-900 focus:outline-none" />
                                {searchDiscStudents.length > 0 && (
                                    <div className="absolute top-13 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                        {searchDiscStudents.map((s) => (
                                            <button key={s._id} onClick={() => { setSelectedDiscStudent(s); setDiscSearchText(`${s.firstName} ${s.lastName} (${s.class}-${s.section})`); }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                                                <span className="font-black text-slate-800">{s.firstName} {s.lastName}</span>
                                                <span className="text-slate-400 font-bold">Class {s.class}-{s.section}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Field>
                        <Field label="Fee Category">
                            <Dropdown value={discountModal.category} onChange={(v) => setDiscountModal(prev => ({ ...prev, category: v }))} options={CATEGORIES} buttonClassName="h-12 bg-slate-50" />
                        </Field>
                        <Field label="Discount Amount (₹)">
                            <input type="number" value={discountModal.discountAmount} onChange={(e) => setDiscountModal(prev => ({ ...prev, discountAmount: Number(e.target.value) }))} placeholder="e.g. 200" className="modal-in" />
                        </Field>
                        <button onClick={saveDiscount} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 uppercase tracking-widest text-xs">
                            Assign Discount
                        </button>
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

            {/* ===== printable receipt render ===== */}
            {printPayment && (
                <FeeReceiptPrint payment={printPayment} invoices={printInvoices} student={printStudent} onClose={() => setPrintPayment(null)} />
            )}

            <style>{`.modal-in{width:100%;height:3rem;background:#f8fafc;border:1px solid #f1f5f9;border-radius:1rem;padding:0 1rem;font-weight:700;font-size:.875rem;color:#0f172a;outline:none}.modal-in:focus{box-shadow:0 0 0 4px rgba(37,99,235,.1)}`}</style>
        </div>
    );
};

const Field = ({ label, children }) => (
    <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label><div className="mt-1.5">{children}</div></div>
);

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <div className="relative z-10 bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 grid place-items-center text-slate-400 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
        </div>
    </div>
);

export default Fees;
