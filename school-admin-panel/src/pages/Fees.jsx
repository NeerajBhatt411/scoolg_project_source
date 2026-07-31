import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
// Fee modes that need specific months chosen (Monthly applies to every month).
const MONTH_MODES = ['Quarterly', 'Half-Yearly', 'Yearly'];
// Minimum months that must be selected for each mode.
const MIN_MONTHS = { Yearly: 1, Quarterly: 3, 'Half-Yearly': 6 };
// Academic-year month order (India: session starts in April) for the months picker.
const SESSION_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const MONTH_NUM = { Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12, Jan: 1, Feb: 2, Mar: 3 };
// 'One-Time' is the backend enum value but is shown to users as 'Once'.
const modeLabel = (f) => (f === 'One-Time' ? 'Once' : f);
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
    { k: 'slabs', label: 'Fee Particulars', icon: 'settings_accessibility' },
    { k: 'amountslab', label: 'Fee Amount Slab', icon: 'currency_rupee' },
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
    const schoolLogo = localStorage.getItem('scoolg_school_logo') || '';
    const CUR_YEAR = new Date().getFullYear();

    const location = useLocation();

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

    // Fee Slabs (FeeStructure) — inline add/edit form (id === null => adding)
    const [slabs, setSlabs] = useState([]);
    // A fee particular = a fee TYPE (name + mode + optional transport flag + months).
    const blankSlab = () => ({ id: null, label: '', frequency: 'Monthly', transport: false, months: [] });
    const [slabForm, setSlabForm] = useState(blankSlab());
    const [savingSlab, setSavingSlab] = useState(false);
    // Fee Amount Slab: per-class amounts for each particular. null = form hidden.
    const [amountForm, setAmountForm] = useState(null);
    const [savingAmount, setSavingAmount] = useState(false);
    // Particular masters are stored as className='ALL'; per-class amount rows are the rest.
    const particulars = slabs.filter((s) => s.className === 'ALL');
    const amountRows = slabs.filter((s) => s.className !== 'ALL');
    const amountSlabClasses = [...new Set(amountRows.map((r) => r.className))]
        .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));

    // Discounts
    const [discountsList, setDiscountsList] = useState([]);
    const [discountModal, setDiscountModal] = useState(null);
    const [discSearchText, setDiscSearchText] = useState('');
    const [selectedDiscStudent, setSelectedDiscStudent] = useState(null);
    // Student Fee Discount tab: class -> section -> student -> per-particular discount.
    const [discClass, setDiscClass] = useState('');
    const [discSection, setDiscSection] = useState('');
    const [discStudentId, setDiscStudentId] = useState('');
    const [discAmounts, setDiscAmounts] = useState({});
    const [savingDisc, setSavingDisc] = useState(false);
    const discSections = [...new Set(students.filter((s) => s.class === discClass).map((s) => s.section).filter(Boolean))].sort();
    const discStudents = students.filter((s) => s.class === discClass && (!discSection || s.section === discSection));

    // Fee Deposit Ledger
    const [depSearchText, setDepSearchText] = useState('');
    const [selectedDepStudent, setSelectedDepStudent] = useState(null);
    // Fee Deposit selection (Admission No OR Class/Section/Student) + Fee Detail view.
    const [depAdmNo, setDepAdmNo] = useState('');
    const [depClass, setDepClass] = useState('');
    const [depSection, setDepSection] = useState('');
    const [depStudentIdSel, setDepStudentIdSel] = useState('');
    const [showFeeDetail, setShowFeeDetail] = useState(false);
    const depSections = [...new Set(students.filter((s) => s.class === depClass).map((s) => s.section).filter(Boolean))].sort();
    const depStudentsList = students.filter((s) => s.class === depClass && (!depSection || s.section === depSection));
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
        else if (tab === 'amountslab') loadSlabs();
        else if (tab === 'deposit') { loadSlabs(); loadDiscountsList(); }
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
        if (!slabForm.label || !slabForm.label.trim()) { toast.warning('Fee particular name is required'); return; }
        const usesMonths = MONTH_MODES.includes(slabForm.frequency);
        // Each mode needs a minimum number of months (Quarterly 3, Half-Yearly 6, Yearly 1).
        const needMonths = MIN_MONTHS[slabForm.frequency] || 0;
        if (usesMonths && slabForm.months.length < needMonths) {
            toast.warning(`Please select at least ${needMonths} month${needMonths > 1 ? 's' : ''} for ${slabForm.frequency} fees`);
            return;
        }
        setSavingSlab(true);
        try {
            // Map the UI-only fields onto the fields the live backend accepts:
            //  transport -> category, months -> academicYear, 'Once' -> 'One-Time'.
            const payload = {
                id: slabForm.id,
                className: 'ALL',
                label: slabForm.label.trim(),
                category: slabForm.transport ? 'Transport' : 'Tuition',
                amount: 0,
                frequency: slabForm.frequency === 'Once' ? 'One-Time' : slabForm.frequency,
                academicYear: usesMonths ? slabForm.months.join(',') : '',
            };
            await axios.post(api('/structure'), payload);
            toast.success(slabForm.id ? 'Fee Particular Updated' : 'Fee Particular Saved');
            setSlabForm(blankSlab());
            loadSlabs();
        } catch { toast.error('Failed to save fee particular'); }
        finally { setSavingSlab(false); }
    };
    const editSlab = (sl) => setSlabForm({
        id: sl.id,
        label: sl.label || '',
        frequency: sl.frequency === 'One-Time' ? 'Once' : (sl.frequency || 'Monthly'),
        transport: sl.category === 'Transport',
        months: (sl.academicYear || '').split(',').map((s) => s.trim()).filter(Boolean),
    });
    const toggleMonth = (m) => setSlabForm(prev => ({ ...prev, months: prev.months.includes(m) ? prev.months.filter((x) => x !== m) : [...prev.months, m] }));
    const cancelSlabEdit = () => setSlabForm(blankSlab());
    const deleteSlab = async (id) => {
        if (!window.confirm('Delete this Fee Slab?')) return;
        try {
            await axios.delete(api(`/structure/${id}`));
            toast.success('Slab Deleted');
            if (slabForm.id === id) setSlabForm(blankSlab());
            loadSlabs();
        } catch { toast.error('Failed to delete Slab'); }
    };
    // Wipe every configured fee slab (the "remove all existing fee data" action).
    const clearAllSlabs = async () => {
        if (!particulars.length) return;
        if (!window.confirm(`Delete ALL ${particulars.length} fee particulars? This cannot be undone.`)) return;
        try {
            await Promise.all(particulars.map((s) => axios.delete(api(`/structure/${s.id}`))));
            toast.success('All fee particulars deleted');
            setSlabForm(blankSlab());
            loadSlabs();
        } catch { toast.error('Failed to clear all'); loadSlabs(); }
    };

    // ---- Fee Amount Slab: assign an amount to each particular, per class ----
    const openAmountForm = () => setAmountForm({ className: '', feeCategory: 'Default', amounts: {} });
    const editAmountSlab = (className) => {
        const amounts = {};
        amountRows.filter((r) => r.className === className).forEach((r) => { amounts[r.label] = r.amount; });
        setAmountForm({ className, feeCategory: 'Default', amounts });
    };
    const setAmount = (label, val) => setAmountForm((f) => ({ ...f, amounts: { ...f.amounts, [label]: val } }));
    const saveAmountSlab = async () => {
        if (!amountForm.className) { toast.warning('Please select a class'); return; }
        // One FeeStructure row per particular for this class (upsert by id when it exists).
        const ops = [];
        for (const p of particulars) {
            const raw = amountForm.amounts[p.label];
            const amount = raw === '' || raw == null ? 0 : Number(raw);
            const existing = amountRows.find((r) => r.className === amountForm.className && r.label === p.label);
            if (amount > 0 || existing) {
                ops.push(axios.post(api('/structure'), {
                    id: existing?.id, className: amountForm.className, label: p.label,
                    category: p.category, amount, frequency: p.frequency, academicYear: p.academicYear || '',
                }));
            }
        }
        if (!ops.length) { toast.warning('Enter at least one amount'); return; }
        setSavingAmount(true);
        try {
            await Promise.all(ops);
            toast.success('Fee amount slab saved');
            setAmountForm(null);
            loadSlabs();
        } catch { toast.error('Failed to save amount slab'); }
        finally { setSavingAmount(false); }
    };
    const deleteAmountSlab = async (className) => {
        if (!window.confirm(`Delete fee amount slab for Class ${className}?`)) return;
        const rows = amountRows.filter((r) => r.className === className);
        try {
            await Promise.all(rows.map((r) => axios.delete(api(`/structure/${r.id}`))));
            toast.success('Amount slab deleted');
            loadSlabs();
        } catch { toast.error('Failed to delete'); }
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
    // Pick a student and pre-fill any discounts they already have (stored per label).
    const selectDiscStudent = (id) => {
        setDiscStudentId(id);
        const amounts = {};
        discountsList.filter((d) => String(d.studentId) === String(id)).forEach((d) => { amounts[d.category] = d.discountAmount; });
        setDiscAmounts(amounts);
    };
    const setDiscAmount = (label, val) => setDiscAmounts((a) => ({ ...a, [label]: val }));
    const saveDiscounts = async () => {
        if (!discStudentId) { toast.warning('Please select a student'); return; }
        // One FeeDiscount per particular (its label goes in the `category` field, upserted).
        const ops = [];
        for (const p of particulars) {
            const raw = discAmounts[p.label];
            const amt = raw === '' || raw == null ? 0 : Number(raw);
            const existing = discountsList.find((d) => String(d.studentId) === String(discStudentId) && d.category === p.label);
            if (amt > 0 || existing) {
                ops.push(axios.post(api('/discounts'), { id: existing?.id, studentId: discStudentId, category: p.label, discountAmount: amt, academicYear: '' }));
            }
        }
        if (!ops.length) { toast.warning('Enter at least one discount'); return; }
        setSavingDisc(true);
        try {
            await Promise.all(ops);
            toast.success('Discounts saved');
            loadDiscountsList();
        } catch { toast.error('Failed to save discounts'); }
        finally { setSavingDisc(false); }
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
    // Fee Deposit: resolve the student then show the month-wise Fee Detail.
    const proceedDeposit = () => {
        let student = null;
        if (depAdmNo.trim()) {
            const q = depAdmNo.trim().toLowerCase();
            student = students.find((s) => String(s.admissionNumber || '').toLowerCase() === q || String(s.studentAppId || '').toLowerCase() === q);
            if (!student) { toast.warning('No student found with that Admission No.'); return; }
        } else if (depStudentIdSel) {
            student = students.find((s) => s._id === depStudentIdSel);
        }
        if (!student) { toast.warning('Kindly select Class, Section, Student — OR Admission No.'); return; }
        setSelectedDepStudent(student);
        setShowFeeDetail(false);
    };
    const resetDeposit = () => {
        setDepAdmNo(''); setDepClass(''); setDepSection(''); setDepStudentIdSel('');
        setSelectedDepStudent(null); setShowFeeDetail(false); setLedger(null);
    };
    const openFeeDetail = () => setShowFeeDetail(true);
    const payMonth = () => toast.info('Working on it — coming soon!');
    // Build the whole-year, month-wise fee schedule from the slab amounts + discounts.
    const buildFeeSchedule = (student) => {
        if (!student) return [];
        const startYear = (new Date().getMonth() >= 3) ? CUR_YEAR : CUR_YEAR - 1;
        const discMap = {};
        discountsList.filter((d) => String(d.studentId) === String(student._id)).forEach((d) => { discMap[d.category] = d.discountAmount; });
        const amtMap = {};
        amountRows.filter((r) => r.className === student.class).forEach((r) => { amtMap[r.label] = r.amount; });
        return SESSION_MONTHS.map((m, i) => {
            const items = [];
            for (const p of particulars) {
                const amt = amtMap[p.label];
                if (amt == null || amt <= 0) continue;
                const applies = p.frequency === 'Monthly' ? true
                    : p.frequency === 'One-Time' ? (i === 0)
                    : (p.academicYear || '').split(',').map((x) => x.trim()).includes(m);
                if (!applies) continue;
                items.push({ label: p.label, amount: amt, discount: discMap[p.label] || 0 });
            }
            const total = items.reduce((s, it) => s + Math.max(0, it.amount - it.discount), 0);
            const mn = MONTH_NUM[m];
            const yr = mn >= 4 ? startYear : startYear + 1;
            return { month: m, dueDate: `01-${String(mn).padStart(2, '0')}-${yr}`, items, total };
        }).filter((row) => row.items.length > 0);
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
            <div className="print:hidden">
                <header className="h-16 md:h-[80px] sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2 min-w-0">
                        <MenuButton />
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">Fees Master</h2>
                    </div>
                    <ProfileButton size={42} />
                </header>

            </div>

            <main className="px-4 md:px-8 pt-6 space-y-6 print:hidden">
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
                        {/* Fee Deposit — student selection (hidden once Fee Detail opens) */}
                        {!showFeeDetail && (
                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-4">
                            <h3 className="font-black text-slate-900 tracking-tight">Fee Deposit</h3>
                            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_auto_1fr_1fr_1.6fr] gap-3 items-end">
                                <Field label="Admission No.">
                                    <input value={depAdmNo} onChange={(e) => setDepAdmNo(e.target.value)} placeholder="Enter Admission No."
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                                </Field>
                                <div className="hidden md:flex items-center justify-center h-12 text-xs font-black text-slate-400">OR</div>
                                <Field label="Class">
                                    <Dropdown value={depClass} onChange={(v) => { setDepClass(v); setDepSection(''); setDepStudentIdSel(''); }}
                                        options={classes.map((c) => ({ value: c.className, label: c.className }))} placeholder="Select" buttonClassName="h-12 bg-slate-50" />
                                </Field>
                                <Field label="Section">
                                    <Dropdown value={depSection} onChange={(v) => { setDepSection(v); setDepStudentIdSel(''); }}
                                        options={depSections.map((s) => ({ value: s, label: s }))} placeholder="Select" buttonClassName="h-12 bg-slate-50" />
                                </Field>
                                <Field label="Student">
                                    <Dropdown value={depStudentIdSel} onChange={(v) => setDepStudentIdSel(v)}
                                        options={depStudentsList.map((s) => ({ value: s._id, label: `${s.firstName} ${s.lastName}${s.fatherName ? ' / ' + s.fatherName : ''} (${s.rollNumber || '—'})` }))}
                                        placeholder="Select Student" buttonClassName="h-12 bg-slate-50" />
                                </Field>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={proceedDeposit} className="bg-blue-600 text-white font-black px-8 py-3 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">Proceed</button>
                                <button onClick={resetDeposit} className="bg-slate-200 text-slate-600 font-black px-8 py-3 rounded-2xl hover:bg-slate-300 transition-all uppercase tracking-widest text-xs">Reset</button>
                            </div>
                            {!selectedDepStudent && (
                                <p className="text-rose-500 font-bold text-sm">Kindly Select Class, Section, Student Name! OR Admission No.</p>
                            )}
                            {selectedDepStudent && (
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-600 flex-1 min-w-0">
                                        <div><span className="block text-[10px] font-black uppercase text-slate-400">Student Name</span><span className="text-slate-800 font-bold text-sm">{selectedDepStudent.firstName} {selectedDepStudent.lastName}</span></div>
                                        <div><span className="block text-[10px] font-black uppercase text-slate-400">Class &amp; Section</span><span className="text-slate-800 font-bold text-sm">{selectedDepStudent.class} - {selectedDepStudent.section}</span></div>
                                        <div><span className="block text-[10px] font-black uppercase text-slate-400">Adm No.</span><span className="text-slate-800 font-bold text-sm">{selectedDepStudent.admissionNumber || selectedDepStudent.studentAppId || '—'}</span></div>
                                        <div><span className="block text-[10px] font-black uppercase text-slate-400">Father's Name</span><span className="text-slate-800 font-bold text-sm">{selectedDepStudent.fatherName || '—'}</span></div>
                                    </div>
                                    <button onClick={openFeeDetail} className="bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs flex items-center gap-2 shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">receipt_long</span> Fee Detail
                                    </button>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Fee Detail — full page: student profile + month-wise fees */}
                        {selectedDepStudent && showFeeDetail && (
                            <div className="space-y-6">
                                <button onClick={() => setShowFeeDetail(false)} className="flex items-center gap-1.5 text-slate-700 font-black text-xs uppercase tracking-widest bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all">
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                                </button>
                                {/* Student profile — full width on top */}
                                <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 flex flex-wrap items-center gap-5">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 grid place-items-center overflow-hidden shrink-0">
                                        {selectedDepStudent.profileImageUrl ? <img src={selectedDepStudent.profileImageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-slate-400">{(selectedDepStudent.firstName || '?').charAt(0)}</span>}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-black text-slate-900 leading-tight">{selectedDepStudent.firstName} {selectedDepStudent.lastName}{selectedDepStudent.fatherName ? ` / ${selectedDepStudent.fatherName}` : ''}</p>
                                        <p className="text-xs font-bold text-slate-400">Category: Fee Cat: Default</p>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm sm:border-l border-slate-100 sm:pl-5">
                                        <div><span className="block text-[10px] uppercase font-black text-slate-400">Adm No.</span><span className="text-slate-900 font-black">{selectedDepStudent.admissionNumber || selectedDepStudent.studentAppId || '—'}</span></div>
                                        <div><span className="block text-[10px] uppercase font-black text-slate-400">Class</span><span className="text-slate-900 font-black">{selectedDepStudent.class} {selectedDepStudent.section}</span></div>
                                        <div><span className="block text-[10px] uppercase font-black text-slate-400">Roll No.</span><span className="text-slate-900 font-black">{selectedDepStudent.rollNumber || '—'}</span></div>
                                        <div><span className="block text-[10px] uppercase font-black text-slate-400">DOB</span><span className="text-slate-900 font-black">{selectedDepStudent.dateOfBirth ? fmtDate(selectedDepStudent.dateOfBirth) : '—'}</span></div>
                                        <div><span className="block text-[10px] uppercase font-black text-slate-400">Contact</span><span className="text-slate-900 font-black">{selectedDepStudent.primaryContact || '—'}</span></div>
                                    </div>
                                </div>
                                {/* Fee table — full width */}
                                <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                                        <h4 className="font-black text-slate-900 tracking-tight mb-4">Fee Due Details According to Slab</h4>
                                        {(() => {
                                            const rows = buildFeeSchedule(selectedDepStudent);
                                            if (!rows.length) return <div className="py-12 text-center text-slate-400 font-bold">No fee amounts set for Class {selectedDepStudent.class}. Configure them in Fee Amount Slab.</div>;
                                            return (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left border-collapse">
                                                        <thead>
                                                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50">
                                                                <th className="py-3 px-3 border border-slate-200">Due Date</th>
                                                                <th className="py-3 px-3 border border-slate-200">Fee Month</th>
                                                                <th className="py-3 px-3 border border-slate-200">Fee Particular</th>
                                                                <th className="py-3 px-3 border border-slate-200 text-right">Amount (₹)</th>
                                                                <th className="py-3 px-3 border border-slate-200 text-center">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rows.map((row) => (
                                                                <tr key={row.month} className="align-top">
                                                                    <td className="py-3 px-3 border border-slate-200 font-bold text-slate-800 whitespace-nowrap">{row.dueDate}</td>
                                                                    <td className="py-3 px-3 border border-slate-200 font-black text-slate-900">{row.month}</td>
                                                                    <td className="py-3 px-3 border border-slate-200">
                                                                        {row.items.map((it, k) => (
                                                                            <div key={k} className="text-slate-900 font-bold leading-relaxed">
                                                                                {it.label} <span className="text-emerald-700 font-black">₹{Number(it.amount).toFixed(2)}</span>
                                                                                {it.discount > 0 && <span className="text-rose-600 font-black"> - Dis ₹{it.discount}</span>}
                                                                            </div>
                                                                        ))}
                                                                    </td>
                                                                    <td className="py-3 px-3 border border-slate-200 text-right font-black text-slate-900 whitespace-nowrap">{money(row.total)}</td>
                                                                    <td className="py-3 px-3 border border-slate-200">
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <button onClick={payMonth} className="bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-all">Pay</button>
                                                                            <span className="text-rose-600 font-black text-[11px] uppercase tracking-widest">Due</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })()}
                                    </section>
                            </div>
                        )}

                        {false && selectedDepStudent && (
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
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* LEFT — Add / Edit form */}
                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-blue-600">{slabForm.id ? 'edit' : 'add_circle'}</span>
                                <h3 className="font-black text-slate-900 tracking-tight">{slabForm.id ? 'Edit Fee Particular' : 'Add Fee Particular'}</h3>
                            </div>
                            <p className="text-xs text-slate-400 font-bold mb-5">Create a fee type. Pick a mode and, for non-monthly fees, the months it applies.</p>
                            <div className="space-y-4">
                                <Field label="Fee Particular Name">
                                    <input value={slabForm.label} onChange={(e) => setSlabForm(prev => ({ ...prev, label: e.target.value }))}
                                        placeholder="Ex. Admission Fee, Exam Fee, Tuition Fee etc."
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                                </Field>
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input type="checkbox" checked={slabForm.transport} onChange={(e) => setSlabForm(prev => ({ ...prev, transport: e.target.checked }))}
                                        className="w-4 h-4 accent-blue-600" />
                                    <span className="text-sm font-bold text-slate-700">Select if Particular for Transport</span>
                                </label>
                                <Field label="Fee Mode">
                                    <select value={slabForm.frequency} onChange={(e) => setSlabForm(prev => ({ ...prev, frequency: e.target.value }))}
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-3 font-bold text-sm text-slate-900 focus:outline-none">
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Half-Yearly">Half-Yearly</option>
                                        <option value="Yearly">Yearly</option>
                                        <option value="Once">Once</option>
                                    </select>
                                </Field>
                                {MONTH_MODES.includes(slabForm.frequency) && (
                                    <Field label={`Select Months to Apply this Fees (min ${MIN_MONTHS[slabForm.frequency]})`}>
                                        <div className="flex flex-wrap gap-1.5">
                                            {SESSION_MONTHS.map((m) => {
                                                const on = slabForm.months.includes(m);
                                                return (
                                                    <button key={m} type="button" onClick={() => toggleMonth(m)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${on ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                        {m}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className={`text-[11px] font-bold mt-2 ${slabForm.months.length < MIN_MONTHS[slabForm.frequency] ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            {slabForm.months.length} of min {MIN_MONTHS[slabForm.frequency]} selected
                                        </p>
                                    </Field>
                                )}
                                <div className="flex gap-2 pt-1">
                                    <button onClick={saveSlab} disabled={savingSlab} className="flex-1 bg-blue-600 text-white font-black py-3.5 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {savingSlab ? (
                                            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                                        ) : (slabForm.id ? 'Update' : 'Submit')}
                                    </button>
                                    {slabForm.id && (
                                        <button onClick={cancelSlabEdit} className="px-5 bg-slate-100 text-slate-600 font-black py-3.5 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — list */}
                        <div className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight">Fee Particulars</h3>
                                    <p className="text-xs text-slate-400 font-bold">{particulars.length} configured</p>
                                </div>
                                {particulars.length > 0 && (
                                    <button onClick={clearAllSlabs} className="text-rose-600 bg-rose-50 hover:bg-rose-100 font-black text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px]">delete_sweep</span> Clear all
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="py-20 text-center"><div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>
                            ) : particulars.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 font-bold uppercase tracking-widest">No fee particulars yet.<br /><span className="text-[11px] normal-case tracking-normal">Add one using the form on the left.</span></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left text-slate-500">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                <th className="py-3 w-10">Sr.</th>
                                                <th className="py-3">Particular</th>
                                                <th className="py-3">Fee Mode</th>
                                                <th className="py-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {particulars.map((sl, i) => (
                                                <tr key={sl.id} className={slabForm.id === sl.id ? 'bg-blue-50/50' : ''}>
                                                    <td className="py-3.5 font-bold text-slate-400">{i + 1}</td>
                                                    <td className="py-3.5 font-black text-slate-900">
                                                        {sl.label}
                                                        {sl.category === 'Transport' && <span className="text-amber-600 font-bold"> [for Transport]</span>}
                                                        {sl.academicYear && <span className="text-blue-500 font-bold"> ({sl.academicYear.split(',').join(' ')})</span>}
                                                    </td>
                                                    <td className="py-3.5 font-semibold text-slate-500">{modeLabel(sl.frequency)}</td>
                                                    <td className="py-3.5">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={() => editSlab(sl)} title="Edit" className="w-8 h-8 grid place-items-center text-blue-600 hover:bg-blue-50 rounded-lg">
                                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>
                                                            <button onClick={() => deleteSlab(sl.id)} title="Delete" className="w-8 h-8 grid place-items-center text-rose-500 hover:bg-rose-50 rounded-lg">
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ============ FEE AMOUNT SLAB TAB ============ */}
                {tab === 'amountslab' && (
                    <section className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-6 space-y-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-black text-slate-900 tracking-tight">Fee Amount Slab</h3>
                                <p className="text-xs text-slate-400 font-bold">Set the amount of each fee particular for a class.</p>
                            </div>
                            {!amountForm && (
                                <button onClick={openAmountForm} disabled={particulars.length === 0}
                                    className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-[17px]">add</span> Add Fee Amount Slab
                                </button>
                            )}
                        </div>

                        {particulars.length === 0 && (
                            <div className="py-6 text-center text-amber-600 bg-amber-50 rounded-2xl font-bold text-sm">
                                Create Fee Particulars first — then set their amounts here.
                            </div>
                        )}

                        {/* Add / Edit form */}
                        {amountForm && (
                            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Fee Category">
                                        <select value={amountForm.feeCategory} onChange={(e) => setAmountForm((f) => ({ ...f, feeCategory: e.target.value }))}
                                            className="w-full h-12 bg-white border border-slate-100 rounded-2xl px-3 font-bold text-sm text-slate-900 focus:outline-none">
                                            <option value="Default">Default</option>
                                        </select>
                                    </Field>
                                    <Field label="Class *">
                                        <Dropdown value={amountForm.className} onChange={(v) => setAmountForm((f) => ({ ...f, className: v }))}
                                            options={classes.map((c) => ({ value: c.className, label: c.className }))} placeholder="Select class" buttonClassName="h-12 bg-white" />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {particulars.map((p) => (
                                        <div key={p.id} className="space-y-1">
                                            <label className="text-[11px] font-black text-slate-600 block truncate">
                                                {p.label} <span className="text-slate-400 font-bold">({modeLabel(p.frequency)})</span>
                                            </label>
                                            <input type="number" min="0" value={amountForm.amounts[p.label] ?? ''}
                                                onChange={(e) => setAmount(p.label, e.target.value)} placeholder="0"
                                                className="w-full h-11 bg-white border border-slate-100 rounded-xl px-3 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button onClick={saveAmountSlab} disabled={savingAmount}
                                        className="bg-blue-600 text-white font-black px-8 py-3 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {savingAmount ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>) : 'Submit'}
                                    </button>
                                    <button onClick={() => setAmountForm(null)} className="bg-slate-200 text-slate-600 font-black px-8 py-3 rounded-2xl hover:bg-slate-300 transition-all uppercase tracking-widest text-xs">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List of saved slabs, grouped by class */}
                        {loading ? (
                            <div className="py-20 text-center"><div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-blue-600 mx-auto" /></div>
                        ) : amountSlabClasses.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">No fee amount slabs yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-500">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                            <th className="py-3 w-10">Sr.</th>
                                            <th className="py-3">Fee Category</th>
                                            <th className="py-3">Class Name</th>
                                            <th className="py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {amountSlabClasses.map((cn, i) => (
                                            <tr key={cn} className={amountForm?.className === cn ? 'bg-blue-50/50' : ''}>
                                                <td className="py-3.5 font-bold text-slate-400">{i + 1}</td>
                                                <td className="py-3.5 font-bold text-slate-700">Default</td>
                                                <td className="py-3.5 font-black text-slate-900">{cn}</td>
                                                <td className="py-3.5">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => editAmountSlab(cn)} title="Edit" className="w-8 h-8 grid place-items-center text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button onClick={() => deleteAmountSlab(cn)} title="Delete" className="w-8 h-8 grid place-items-center text-rose-500 hover:bg-rose-50 rounded-lg">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
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
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight">Student Fee Discount</h3>
                            <p className="text-xs text-slate-400 font-bold">Pick a student, then set a discount against each fee.</p>
                        </div>

                        {/* Class / Section / Student selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Class">
                                <Dropdown value={discClass} onChange={(v) => { setDiscClass(v); setDiscSection(''); setDiscStudentId(''); setDiscAmounts({}); }}
                                    options={classes.map((c) => ({ value: c.className, label: c.className }))} placeholder="Select class" buttonClassName="h-12 bg-slate-50" />
                            </Field>
                            <Field label="Section">
                                <Dropdown value={discSection} onChange={(v) => { setDiscSection(v); setDiscStudentId(''); setDiscAmounts({}); }}
                                    options={discSections.map((s) => ({ value: s, label: s }))} placeholder="Select section" buttonClassName="h-12 bg-slate-50" />
                            </Field>
                            <Field label="Student">
                                <Dropdown value={discStudentId} onChange={selectDiscStudent}
                                    options={discStudents.map((s) => ({ value: s._id, label: `${s.firstName} ${s.lastName}${s.fatherName ? ' / ' + s.fatherName : ''} (${s.rollNumber || '—'})` }))}
                                    placeholder="Select student" buttonClassName="h-12 bg-slate-50" />
                            </Field>
                        </div>

                        {/* Per-fee discount rows */}
                        {!discStudentId ? (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">Select a class, section &amp; student to set discounts.</div>
                        ) : particulars.length === 0 ? (
                            <div className="py-6 text-center text-amber-600 bg-amber-50 rounded-2xl font-bold text-sm">Create Fee Particulars first.</div>
                        ) : (
                            <>
                                <div className="space-y-4 border-t border-slate-100 pt-5">
                                    {particulars.map((p) => {
                                        const amt = amountRows.find((r) => r.className === discClass && r.label === p.label)?.amount;
                                        return (
                                            <div key={p.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-end">
                                                <div>
                                                    <label className="text-sm font-black text-slate-800 block mb-1.5">
                                                        {p.label} <span className="text-slate-400 font-bold text-xs">({modeLabel(p.frequency)})</span>
                                                    </label>
                                                    <input readOnly value={amt != null ? Number(amt).toFixed(2) : ''} placeholder="—"
                                                        className="w-full h-12 bg-slate-100 border border-slate-200 rounded-xl px-4 font-bold text-sm text-slate-500 cursor-not-allowed" />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-slate-500 block mb-1.5">Discount</label>
                                                    <input type="number" min="0" value={discAmounts[p.label] ?? ''} onChange={(e) => setDiscAmount(p.label, e.target.value)} placeholder="0"
                                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button onClick={saveDiscounts} disabled={savingDisc}
                                    className="bg-blue-600 text-white font-black px-8 py-3 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {savingDisc ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>) : 'Submit'}
                                </button>
                            </>
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
                <FeeReceiptPrint payment={printPayment} invoices={printInvoices} student={printStudent} schoolName={schoolName} schoolLogo={schoolLogo} onClose={() => setPrintPayment(null)} />
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
