import jwt from 'jsonwebtoken';
import { School } from '../../../models/School.js';
import { Student } from '../../../models/Student.js';
import { FeeStructure } from '../../../models/FeeStructure.js';
import { FeeInvoice } from '../../../models/FeeInvoice.js';
import { FeePayment } from '../../../models/FeePayment.js';
import { FeeDiscount } from '../../../models/FeeDiscount.js';
import { notify } from '../../utils/push.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Admin side: the JWT (owner or staff) carries the STRING School.id; resolve it
// to the full School doc (whose _id is the ObjectId all fee rows are keyed by).
// Trust ONLY the authenticated token — never a client-supplied schoolId (that
// would be a cross-tenant selector).
const resolveSchool = async (req) => {
    const sid = req.user?.id || req.user?.schoolId;
    if (!sid) return null;
    return School.findOne({ id: sid });
};

// Parent/student side: verify the Bearer token inline (no shared middleware).
const studentFromAuth = async (req) => {
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');
    return Student.findById(decoded.id).select('schoolId firstName lastName class section studentAppId rollNumber').lean();
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// A payable amount: finite, positive, within a sane ceiling. Returns null if bad.
const validAmount = (a) => { const n = Number(a); return Number.isFinite(n) && n > 0 && n <= 10000000 ? n : null; };
// Only accept http(s) URLs for the payment screenshot (blocks javascript:/data: XSS).
const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u.trim()) ? u.trim() : '');

// Alert the school office (owner + staff share userId = school.id string).
const notifyOffice = async (school, title, body, data = {}) => {
    try {
        const base = { schoolId: String(school._id), title, body, type: 'fee', data };
        await notify({ ...base, toRole: 'owner', recipients: [{ userId: school.id }] });
        await notify({ ...base, toRole: 'staff', recipients: [{ userId: school.id }] });
    } catch (e) { console.error('[fees] office notify failed:', e.message); }
};

// Alert a parent (parent uses the student app -> role 'student').
const notifyParent = async (school, studentId, title, body, data = {}) => {
    try {
        await notify({ schoolId: String(school._id), toRole: 'student', recipients: [{ userId: String(studentId) }], title, body, type: 'fee', data });
    } catch (e) { console.error('[fees] parent notify failed:', e.message); }
};

// =====================  ADMIN — Settings (UPI / bank / QR)  =====================
export const getFeesSettings = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        res.json(school.paymentConfig || {});
    } catch (err) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
};

export const putFeesSettings = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { upiId, payeeName, bankName, accountNumber, ifsc, qrImageUrl, instructions, methods } = req.body || {};
        school.paymentConfig = {
            upiId: upiId ?? school.paymentConfig?.upiId ?? '',
            payeeName: payeeName ?? school.paymentConfig?.payeeName ?? '',
            bankName: bankName ?? school.paymentConfig?.bankName ?? '',
            accountNumber: accountNumber ?? school.paymentConfig?.accountNumber ?? '',
            ifsc: ifsc ?? school.paymentConfig?.ifsc ?? '',
            qrImageUrl: qrImageUrl ?? school.paymentConfig?.qrImageUrl ?? '',
            instructions: instructions ?? school.paymentConfig?.instructions ?? '',
            methods: Array.isArray(methods) ? methods : (school.paymentConfig?.methods || ['UPI', 'BANK', 'CASH']),
        };
        await school.save();
        res.json({ message: 'Payment details saved', paymentConfig: school.paymentConfig });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
};

// =====================  ADMIN — Fee structure (per-class heads)  =====================
export const getFeeStructure = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const rows = await FeeStructure.find({ schoolId: school._id }).sort({ className: 1, createdAt: 1 }).lean();
        res.json(rows.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load fee structure' });
    }
};

export const postFeeStructure = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { id, className, label, category, amount, frequency, academicYear } = req.body || {};
        if (!className || amount == null) return res.status(400).json({ error: 'Class and amount are required' });
        const doc = {
            schoolId: school._id, className, label: label || 'Tuition Fee', category: category || 'Tuition',
            amount: Number(amount), frequency: frequency || 'Monthly', academicYear: academicYear || '',
        };
        let row;
        if (id) row = await FeeStructure.findOneAndUpdate({ _id: id, schoolId: school._id }, doc, { new: true });
        else row = await FeeStructure.create(doc);
        res.status(id ? 200 : 201).json({ message: 'Saved', structure: row });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save fee structure' });
    }
};

export const deleteFeeStructure = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        await FeeStructure.deleteOne({ _id: req.params.id, schoolId: school._id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
};

// =====================  ADMIN — Generate / create dues  =====================
// Universal creator: recurring (per class) OR one-off custom fee (Exam, Arrears).
// body: { className:'ALL'|<name>  OR  studentIds:[], title, category, amount, period, dueDate, academicYear }
export const postGenerateInvoices = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { className, section, studentIds, title, category, amount, months, period, dueDate, academicYear } = req.body || {};
        if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
        const amt = validAmount(amount);
        if (amt == null) return res.status(400).json({ error: 'Enter a valid amount' });

        // Resolve target students (by explicit ids, or class + optional section).
        let students;
        if (Array.isArray(studentIds) && studentIds.length) {
            students = await Student.find({ _id: { $in: studentIds }, schoolId: school._id, status: 'Active' })
                .select('firstName lastName class section studentAppId rollNumber').lean();
        } else {
            const q = { schoolId: school._id, status: 'Active' };
            if (className && className !== 'ALL') q.class = className;
            if (section && section !== 'All') q.section = section;
            students = await Student.find(q).select('firstName lastName class section studentAppId rollNumber').lean();
        }
        if (!students.length) return res.status(400).json({ error: 'No active students match this selection' });

        // One "item" per period. If months are given (e.g. yearly = 12, quarterly = 3),
        // create a due per student per month; else a single due with the plain title.
        const monthList = (Array.isArray(months) ? months.filter(Boolean) : []).slice(0, 24);
        const base = title.trim().slice(0, 200);
        const items = monthList.length
            ? monthList.map((m) => ({ title: `${base} · ${String(m).slice(0, 40)}`, period: String(m).slice(0, 40) }))
            : [{ title: base, period: String(period || '').slice(0, 40) }];

        // Guard against an accidental mega-generate (e.g. all classes × 12 months).
        if (items.length * students.length > 20000) {
            return res.status(400).json({ error: 'Too many dues at once — narrow the class/section or the months.' });
        }

        // Dedup: skip (student, title) pairs that already exist.
        const titles = items.map((i) => i.title);
        const existing = await FeeInvoice.find({ schoolId: school._id, studentId: { $in: students.map((s) => s._id) }, title: { $in: titles } })
            .select('studentId title').lean();
        const seen = new Set(existing.map((e) => `${e.studentId}|${e.title}`));
        const by = req.user?.role === 'Owner' ? 'Admin' : (req.user?.role || 'Admin');

        const toCreate = [];
        for (const it of items) {
            for (const s of students) {
                if (seen.has(`${s._id}|${it.title}`)) continue;
                toCreate.push({
                    schoolId: school._id, studentId: s._id,
                    studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(), studentAppId: s.studentAppId || '',
                    className: s.class, section: s.section, rollNumber: s.rollNumber || '',
                    title: it.title, category: category || 'Tuition', period: it.period,
                    amount: amt, dueDate: dueDate || null, academicYear: academicYear || '',
                    status: 'PENDING', createdByName: by,
                });
            }
        }

        if (toCreate.length) await FeeInvoice.insertMany(toCreate);

        // Notify each student once.
        const uniq = [...new Set(toCreate.map((t) => String(t.studentId)))];
        if (uniq.length) {
            try {
                await notify({ schoolId: String(school._id), toRole: 'student', recipients: uniq.map((id) => ({ userId: id })),
                    title: '💳 New fee added', body: `${base} — ${money(amt)} is now due.`, type: 'fee', data: { link: '/fees' } });
            } catch (e) { console.error('[fees] due notify failed:', e.message); }
        }

        const skipped = (items.length * students.length) - toCreate.length;
        res.json({ message: `${toCreate.length} due(s) created`, created: toCreate.length, skipped });
    } catch (err) {
        console.error('generate error:', err);
        res.status(500).json({ error: 'Failed to create dues' });
    }
};

// =====================  ADMIN — Invoices list / edit  =====================
export const getInvoices = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { className, section, status, period, studentId } = req.query;
        const q = { schoolId: school._id };
        if (className && className !== 'ALL') q.className = className;
        if (section && section !== 'All') q.section = section;
        if (status && status !== 'ALL') q.status = status;
        if (period) q.period = period;
        if (studentId) q.studentId = studentId;
        const rows = await FeeInvoice.find(q).sort({ createdAt: -1 }).limit(1000).lean();
        res.json(rows.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load invoices' });
    }
};

export const patchInvoice = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { title, amount, dueDate, status } = req.body || {};
        const upd = {};
        if (title != null) upd.title = String(title).slice(0, 200);
        if (amount != null) { const a = validAmount(amount); if (a == null) return res.status(400).json({ error: 'Enter a valid amount' }); upd.amount = a; }
        if (dueDate !== undefined) upd.dueDate = dueDate || null;
        // Paying is done ONLY through the payment flow (so paidAmount/records stay
        // consistent) — here the admin may re-open or waive, not mark PAID.
        if (status && ['PENDING', 'WAIVED'].includes(status)) upd.status = status;
        const row = await FeeInvoice.findOneAndUpdate({ _id: req.params.id, schoolId: school._id }, upd, { new: true });
        if (!row) return res.status(404).json({ error: 'Invoice not found' });
        res.json({ message: 'Updated', invoice: row });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update' });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        await FeeInvoice.deleteOne({ _id: req.params.id, schoolId: school._id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
};

// Record an offline / cash payment against a due (school-side).
export const postInvoiceMarkPaid = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const invoice = await FeeInvoice.findOne({ _id: req.params.id, schoolId: school._id });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        if (invoice.status === 'PAID') return res.status(400).json({ error: 'This due is already paid' });
        if (invoice.status === 'WAIVED') return res.status(400).json({ error: 'This due is waived' });
        const { method = 'CASH', note = '', referenceNo = '' } = req.body || {};

        // If the parent already submitted a payment for this due, reconcile THAT
        // record (don't leave it dangling in the verify queue and don't double-count).
        let payment = await FeePayment.findOne({ invoiceId: invoice._id, status: 'SUBMITTED' });
        if (payment) {
            payment.status = 'VERIFIED'; payment.verifiedByName = req.user?.role || 'Admin'; payment.verifiedAt = new Date();
            await payment.save();
        } else {
            payment = await FeePayment.create({
                schoolId: school._id, studentId: invoice.studentId, studentName: invoice.studentName,
                studentAppId: invoice.studentAppId, invoiceId: invoice._id, invoiceTitle: invoice.title,
                amount: invoice.amount, method, referenceNo, note, status: 'VERIFIED',
                verifiedByName: req.user?.role || 'Admin', verifiedAt: new Date(),
            });
        }
        invoice.status = 'PAID'; invoice.paidAmount = invoice.amount; invoice.paidVia = payment.method || method;
        invoice.paidAt = new Date(); invoice.paymentId = payment._id;
        await invoice.save();

        await notifyParent(school, invoice.studentId, '✅ Fee marked paid', `${invoice.title} — ${money(invoice.amount)} recorded as paid.`, { link: '/fees' });
        res.json({ message: 'Marked paid', invoice });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark paid' });
    }
};

// Distinct periods present (drives the Dues month/period filter).
export const getPeriods = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const periods = (await FeeInvoice.distinct('period', { schoolId: school._id })).filter(Boolean).sort();
        res.json(periods);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load periods' });
    }
};

// Bulk delete / mark-paid over the CURRENTLY FILTERED set (class/section/status/period).
export const postBulkInvoices = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { action, className, section, status, period } = req.body || {};
        const q = { schoolId: school._id };
        if (className && className !== 'ALL') q.className = className;
        if (section && section !== 'All') q.section = section;
        if (status && status !== 'ALL') q.status = status;
        if (period && period !== 'All') q.period = period;

        if (action === 'delete') {
            // Never bulk-delete PAID dues — that would wipe the financial/receipt
            // record. Paid dues can only be removed one-by-one, deliberately.
            const ids = (await FeeInvoice.find({ ...q, status: { $ne: 'PAID' } }).select('_id').lean()).map((i) => i._id);
            if (!ids.length) return res.json({ message: 'Nothing to delete (paid dues are protected)', count: 0 });
            await FeePayment.deleteMany({ invoiceId: { $in: ids }, status: { $ne: 'VERIFIED' } });
            const r = await FeeInvoice.deleteMany({ _id: { $in: ids } });
            return res.json({ message: `${r.deletedCount} due(s) deleted`, count: r.deletedCount });
        }

        if (action === 'markPaid') {
            // Only un-submitted dues become cash-paid in bulk. SUBMITTED ones have a
            // parent payment awaiting review — those go through Verify, not bulk cash.
            const payable = await FeeInvoice.find({ ...q, status: { $in: ['PENDING', 'REJECTED'] } }).lean();
            if (!payable.length) return res.json({ message: 'Nothing to mark paid', count: 0 });
            const by = req.user?.role || 'Admin';
            await FeePayment.insertMany(payable.map((i) => ({
                schoolId: school._id, studentId: i.studentId, studentName: i.studentName, studentAppId: i.studentAppId,
                invoiceId: i._id, invoiceTitle: i.title, amount: i.amount, method: 'CASH', status: 'VERIFIED',
                verifiedByName: by, verifiedAt: new Date(),
            })));
            await FeeInvoice.bulkWrite(payable.map((i) => ({
                updateOne: { filter: { _id: i._id }, update: { status: 'PAID', paidVia: 'CASH', paidAmount: i.amount, paidAt: new Date() } },
            })));
            return res.json({ message: `${payable.length} due(s) marked paid`, count: payable.length });
        }

        res.status(400).json({ error: 'Unknown action' });
    } catch (err) {
        console.error('bulk error:', err);
        res.status(500).json({ error: 'Bulk action failed' });
    }
};

// =====================  ADMIN — Payments (verify / reject)  =====================
export const getPayments = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const q = { schoolId: school._id };
        if (req.query.status && req.query.status !== 'ALL') q.status = req.query.status;
        const rows = await FeePayment.find(q).sort({ createdAt: -1 }).limit(500).lean();
        res.json(rows.map((r) => ({ ...r, id: r._id })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load payments' });
    }
};

export const postPaymentVerify = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const payment = await FeePayment.findOne({ _id: req.params.id, schoolId: school._id });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if (payment.status !== 'SUBMITTED') return res.status(400).json({ error: `Payment already ${payment.status.toLowerCase()}` });

        const invoice = await FeeInvoice.findById(payment.invoiceId);
        // Guard against double-collecting: if the due is already settled by another
        // payment, close THIS one out without re-marking / re-counting.
        if (invoice && invoice.status === 'PAID' && String(invoice.paymentId) !== String(payment._id)) {
            payment.status = 'VERIFIED'; payment.verifiedByName = req.user?.role || 'Admin'; payment.verifiedAt = new Date();
            await payment.save();
            return res.json({ message: 'This due was already paid; payment closed', payment });
        }

        payment.status = 'VERIFIED'; payment.verifiedByName = req.user?.role || 'Admin'; payment.verifiedAt = new Date();
        await payment.save();

        if (invoice) {
            invoice.status = 'PAID'; invoice.paidAmount = invoice.amount; invoice.paidVia = payment.method;
            invoice.paidAt = new Date(); invoice.paymentId = payment._id;
            await invoice.save();
        }
        await notifyParent(school, payment.studentId, '✅ Payment verified', `Your payment of ${money(payment.amount)} for ${payment.invoiceTitle} is verified.`, { link: '/fees' });
        res.json({ message: 'Payment verified', payment });
    } catch (err) {
        res.status(500).json({ error: 'Failed to verify' });
    }
};

export const postPaymentReject = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { reason } = req.body || {};
        const payment = await FeePayment.findOne({ _id: req.params.id, schoolId: school._id });
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if (payment.status !== 'SUBMITTED') return res.status(400).json({ error: `Payment already ${payment.status.toLowerCase()}` });

        payment.status = 'REJECTED'; payment.rejectionReason = reason || ''; payment.verifiedByName = req.user?.role || 'Admin'; payment.verifiedAt = new Date();
        await payment.save();

        // Re-open the invoice so the parent can pay again.
        const invoice = await FeeInvoice.findById(payment.invoiceId);
        if (invoice && invoice.status === 'SUBMITTED') { invoice.status = 'PENDING'; await invoice.save(); }

        await notifyParent(school, payment.studentId, '⚠️ Payment needs attention', `Your payment for ${payment.invoiceTitle} was not accepted${reason ? `: ${reason}` : ''}. Please re-submit.`, { link: '/fees' });
        res.json({ message: 'Payment rejected', payment });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject' });
    }
};

// =====================  ADMIN — Collections summary  =====================
export const getSummary = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const sid = school._id;
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

        const [invoices, paidAgg, monthAgg, pendingVerify] = await Promise.all([
            FeeInvoice.find({ schoolId: sid }).select('amount status paidAmount className title').lean(),
            FeeInvoice.aggregate([{ $match: { schoolId: sid, status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
            FeePayment.aggregate([{ $match: { schoolId: sid, status: 'VERIFIED', verifiedAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            FeePayment.countDocuments({ schoolId: sid, status: 'SUBMITTED' }),
        ]);

        const active = invoices.filter((i) => i.status !== 'WAIVED');
        const totalInvoiced = active.reduce((a, i) => a + (i.amount || 0), 0);
        const totalCollected = paidAgg[0]?.total || 0;
        const totalPending = active.filter((i) => i.status === 'PENDING' || i.status === 'SUBMITTED').reduce((a, i) => a + (i.amount || 0), 0);

        // Class-wise pending + fee-head-wise ("the fees the school has set").
        const byClassMap = {};
        const byFeeMap = {};
        for (const i of active) {
            const k = i.className || '—';
            byClassMap[k] = byClassMap[k] || { className: k, invoiced: 0, collected: 0, pending: 0 };
            byClassMap[k].invoiced += i.amount || 0;
            if (i.status === 'PAID') byClassMap[k].collected += i.paidAmount || 0;
            else if (i.status === 'PENDING' || i.status === 'SUBMITTED') byClassMap[k].pending += i.amount || 0;

            // Group monthly dues under their base fee name ("Tuition · Apr 2026" -> "Tuition").
            const ft = (i.title || 'Fee').split(' · ')[0];
            byFeeMap[ft] = byFeeMap[ft] || { title: ft, count: 0, total: 0, collected: 0 };
            byFeeMap[ft].count += 1;
            byFeeMap[ft].total += i.amount || 0;
            if (i.status === 'PAID') byFeeMap[ft].collected += i.paidAmount || 0;
        }

        res.json({
            totalInvoiced, totalCollected, totalPending,
            thisMonthCollected: monthAgg[0]?.total || 0,
            pendingVerification: pendingVerify,
            invoiceCount: active.length,
            paidCount: active.filter((i) => i.status === 'PAID').length,
            byClass: Object.values(byClassMap).sort((a, b) => b.pending - a.pending),
            byFee: Object.values(byFeeMap).sort((a, b) => b.total - a.total),
        });
    } catch (err) {
        console.error('summary error:', err);
        res.status(500).json({ error: 'Failed to load summary' });
    }
};

// =====================  PARENT / STUDENT  =====================
export const getStudentFees = async (req, res) => {
    let student;
    try { student = await studentFromAuth(req); }
    catch { return res.status(401).json({ error: 'Session expired. Please log in again.' }); }
    if (!student) return res.status(404).json({ error: 'Student not found' });
    try {
        const [invoices, school] = await Promise.all([
            FeeInvoice.find({ schoolId: student.schoolId, studentId: student._id }).sort({ createdAt: -1 }).lean(),
            School.findById(student.schoolId).select('paymentConfig formData').lean(),
        ]);

        const active = invoices.filter((i) => i.status !== 'WAIVED');
        const totalDue = active.reduce((a, i) => a + (i.amount || 0), 0);
        const paid = active.filter((i) => i.status === 'PAID').reduce((a, i) => a + (i.paidAmount || i.amount || 0), 0);
        const pending = active.filter((i) => i.status === 'PENDING' || i.status === 'SUBMITTED' || i.status === 'REJECTED').reduce((a, i) => a + (i.amount || 0), 0);

        res.json({
            summary: { totalDue, paid, pending },
            invoices: invoices.map((i) => ({ ...i, id: i._id })),
            paymentConfig: school?.paymentConfig || {},
            student: { name: `${student.firstName || ''} ${student.lastName || ''}`.trim(), class: student.class, section: student.section, appId: student.studentAppId },
        });
    } catch (err) {
        console.error('student fees error:', err);
        res.status(500).json({ error: 'Failed to load fees' });
    }
};

const ALLOWED_METHODS = ['UPI', 'BANK', 'CASH', 'OTHER'];

export const postStudentFeePay = async (req, res) => {
    let student;
    try { student = await studentFromAuth(req); }
    catch { return res.status(401).json({ error: 'Session expired. Please log in again.' }); }
    if (!student) return res.status(404).json({ error: 'Student not found' });
    try {
        const { invoiceId, method, referenceNo, screenshotUrl, note } = req.body || {};
        if (!invoiceId) return res.status(400).json({ error: 'Invoice is required' });

        const invoice = await FeeInvoice.findOne({ _id: invoiceId, studentId: student._id });
        if (!invoice) return res.status(404).json({ error: 'Due not found' });
        if (invoice.status === 'PAID') return res.status(400).json({ error: 'This due is already paid' });
        if (invoice.status === 'SUBMITTED') return res.status(400).json({ error: 'A payment for this due is already under review' });

        const payment = await FeePayment.create({
            schoolId: student.schoolId, studentId: student._id,
            studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(), studentAppId: student.studentAppId,
            invoiceId: invoice._id, invoiceTitle: invoice.title,
            // The amount owed is fixed by the invoice — never trust a client amount.
            amount: invoice.amount,
            method: ALLOWED_METHODS.includes(method) ? method : 'UPI',
            referenceNo: String(referenceNo || '').slice(0, 80),
            screenshotUrl: safeUrl(screenshotUrl),
            note: String(note || '').slice(0, 500), status: 'SUBMITTED',
        });
        invoice.status = 'SUBMITTED';
        await invoice.save();

        const school = await School.findById(student.schoolId).select('id _id');
        if (school) await notifyOffice(school, '💰 New fee payment to verify', `${payment.studentName} (${invoice.className}) submitted ${money(payment.amount)} for ${invoice.title}.`, { link: '/fees' });

        res.status(201).json({ message: 'Payment submitted for verification', payment });
    } catch (err) {
        console.error('student pay error:', err);
        res.status(500).json({ error: 'Failed to submit payment' });
    }
};

// =====================  DISCOUNTS  =====================
export const getDiscounts = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const discounts = await FeeDiscount.find({ schoolId: school._id }).lean();
        const studentIds = discounts.map((d) => d.studentId);
        const students = await Student.find({ _id: { $in: studentIds } }).select('firstName lastName class section studentAppId').lean();
        const studentMap = {};
        for (const s of students) {
            studentMap[s._id] = s;
        }
        const result = discounts.map((d) => {
            const s = studentMap[d.studentId] || {};
            return {
                ...d,
                id: d._id,
                studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
                studentAppId: s.studentAppId || '',
                class: s.class || '',
                section: s.section || '',
            };
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load discounts' });
    }
};

export const postDiscount = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { id, studentId, category, discountAmount, academicYear } = req.body || {};
        if (!studentId || !category || discountAmount == null) {
            return res.status(400).json({ error: 'Student, category and discount amount are required' });
        }
        const doc = {
            schoolId: school._id,
            studentId,
            category,
            discountAmount: Number(discountAmount),
            academicYear: academicYear || '',
            active: true,
        };
        let row;
        if (id) {
            row = await FeeDiscount.findOneAndUpdate({ _id: id, schoolId: school._id }, doc, { new: true });
        } else {
            const existing = await FeeDiscount.findOne({ schoolId: school._id, studentId, category, active: true });
            if (existing) {
                row = await FeeDiscount.findOneAndUpdate({ _id: existing._id }, doc, { new: true });
            } else {
                row = await FeeDiscount.create(doc);
            }
        }
        res.status(id ? 200 : 201).json({ message: 'Discount saved', discount: row });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save discount' });
    }
};

export const deleteDiscount = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        await FeeDiscount.deleteOne({ _id: req.params.id, schoolId: school._id });
        res.json({ message: 'Discount deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete discount' });
    }
};

// =====================  SINGLE STUDENT LEDGER & DEPOSIT  =====================

export const getStudentLedger = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const studentId = req.params.studentId;
        const student = await Student.findOne({ _id: studentId, schoolId: school._id }).lean();
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const [invoices, discounts, payments] = await Promise.all([
            FeeInvoice.find({ schoolId: school._id, studentId }).sort({ dueDate: 1, createdAt: 1 }).lean(),
            FeeDiscount.find({ schoolId: school._id, studentId, active: true }).lean(),
            FeePayment.find({ schoolId: school._id, studentId }).sort({ createdAt: -1 }).lean(),
        ]);

        res.json({
            student: {
                id: student._id,
                name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
                class: student.class,
                section: student.section,
                rollNumber: student.rollNumber || '',
                studentAppId: student.studentAppId || '',
                admissionNumber: student.admissionNumber || '',
                fatherName: student.fatherName || '',
                primaryContact: student.primaryContact || '',
            },
            invoices: invoices.map((i) => ({ ...i, id: i._id })),
            discounts: discounts.map((d) => ({ ...d, id: d._id })),
            payments: payments.map((p) => ({ ...p, id: p._id })),
        });
    } catch (err) {
        console.error('ledger error:', err);
        res.status(500).json({ error: 'Failed to load ledger' });
    }
};

const nextReceiptNo = async (schoolId) => {
    const lastPayment = await FeePayment.findOne({ schoolId, referenceNo: /^REC-/ })
        .sort({ createdAt: -1 })
        .select('referenceNo')
        .lean();
    let nextNum = 1;
    if (lastPayment && lastPayment.referenceNo) {
        const m = lastPayment.referenceNo.match(/REC-(\d+)/);
        if (m) {
            nextNum = parseInt(m[1], 10) + 1;
        }
    }
    return `REC-${String(nextNum).padStart(6, '0')}`;
};

export const postFeeDeposit = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { studentId, invoiceIds, amountPaid, method, referenceNo, note, discountMap } = req.body || {};
        if (!studentId || !Array.isArray(invoiceIds) || !invoiceIds.length || amountPaid == null) {
            return res.status(400).json({ error: 'Student, invoices and amount are required' });
        }

        const student = await Student.findOne({ _id: studentId, schoolId: school._id });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const invoices = await FeeInvoice.find({ _id: { $in: invoiceIds }, studentId, schoolId: school._id });
        if (!invoices.length) return res.status(404).json({ error: 'Invoices not found' });

        const receipt = await nextReceiptNo(school._id);
        const by = req.user?.role || 'Admin';

        // Create the FeePayment record representing this manual deposit session
        const payment = await FeePayment.create({
            schoolId: school._id,
            studentId,
            studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            studentAppId: student.studentAppId,
            invoiceId: invoices[0]._id,
            invoiceTitle: invoices.map((i) => i.title).join(', ').slice(0, 200),
            amount: Number(amountPaid),
            method: method || 'CASH',
            referenceNo: referenceNo || receipt,
            status: 'VERIFIED',
            verifiedByName: by,
            verifiedAt: new Date(),
            note: note || '',
        });

        let remainingPay = Number(amountPaid);

        for (const inv of invoices) {
            if (inv.status === 'PAID' || inv.status === 'WAIVED') continue;

            let discount = 0;
            if (discountMap && discountMap[inv._id]) {
                discount = Number(discountMap[inv._id]);
                discount = Math.min(discount, inv.balanceAmount);
            }

            const originalDue = inv.balanceAmount;
            const netDue = originalDue - discount;

            if (netDue <= 0) {
                inv.balanceAmount = 0;
                inv.paidAmount += originalDue;
                inv.status = 'PAID';
            } else if (remainingPay >= netDue) {
                remainingPay -= netDue;
                inv.balanceAmount = 0;
                inv.paidAmount += originalDue;
                inv.status = 'PAID';
            } else if (remainingPay > 0) {
                inv.balanceAmount = netDue - remainingPay;
                inv.paidAmount += (remainingPay + discount);
                inv.status = 'PARTIALLY_PAID';
                remainingPay = 0;
            } else if (discount > 0) {
                inv.balanceAmount = netDue;
                inv.paidAmount += discount;
                inv.status = 'PARTIALLY_PAID';
            }

            inv.paidVia = method || 'CASH';
            inv.paidAt = new Date();
            inv.paymentId = payment._id;
            inv.receiptNo = receipt;
            await inv.save();
        }

        await notifyParent(school, studentId, '✅ Fees deposited', `Received payment of ${money(amountPaid)}: receipt ${receipt}.`, { link: '/fees' });
        res.json({ message: 'Payment deposited successfully', receiptNo: receipt, payment });
    } catch (err) {
        console.error('deposit error:', err);
        res.status(500).json({ error: 'Failed to deposit fees' });
    }
};

export const postVoidPayment = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: 'School not found' });
        const { reason } = req.body || {};
        if (!reason?.trim()) return res.status(400).json({ error: 'Cancellation reason is required' });

        const payment = await FeePayment.findOne({ _id: req.params.id, schoolId: school._id });
        if (!payment) return res.status(404).json({ error: 'Payment record not found' });
        if (payment.status === 'REJECTED') return res.status(400).json({ error: 'Payment is already rejected/voided' });

        const by = req.user?.role || 'Admin';
        const invoices = await FeeInvoice.find({ schoolId: school._id, paymentId: payment._id });

        for (const inv of invoices) {
            inv.balanceAmount = inv.amount;
            inv.paidAmount = 0;
            inv.status = 'PENDING';
            inv.paidVia = '';
            inv.paidAt = null;
            inv.paymentId = null;
            inv.receiptNo = '';
            inv.voidReason = reason;
            inv.voidedBy = by;
            await inv.save();
        }

        payment.status = 'REJECTED';
        payment.rejectionReason = `VOIDED: ${reason}`;
        payment.verifiedByName = by;
        payment.verifiedAt = new Date();
        await payment.save();

        await notifyParent(school, payment.studentId, '⚠️ Fee payment cancelled', `Payment of ${money(payment.amount)} was voided: ${reason}`, { link: '/fees' });
        res.json({ message: 'Payment voided and invoices rolled back', payment });
    } catch (err) {
        console.error('void error:', err);
        res.status(500).json({ error: 'Failed to void payment' });
    }
};

