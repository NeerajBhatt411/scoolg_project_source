import jwt from 'jsonwebtoken';
import { School } from '../../../models/School.js';
import { Student } from '../../../models/Student.js';
import { FeeStructure } from '../../../models/FeeStructure.js';
import { FeeInvoice } from '../../../models/FeeInvoice.js';
import { FeePayment } from '../../../models/FeePayment.js';
import { notify } from '../../utils/push.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Admin side: the JWT (owner or staff) carries the STRING School.id; resolve it
// to the full School doc (whose _id is the ObjectId all fee rows are keyed by).
const resolveSchool = async (req) => {
    const sid = req.user?.id || req.user?.schoolId || req.query.schoolId || req.body?.schoolId;
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
        const { className, studentIds, title, category, amount, period, dueDate, academicYear } = req.body || {};
        if (!title?.trim() || amount == null) return res.status(400).json({ error: 'Title and amount are required' });

        // Resolve target students.
        let students;
        if (Array.isArray(studentIds) && studentIds.length) {
            students = await Student.find({ _id: { $in: studentIds }, schoolId: school._id, status: 'Active' })
                .select('firstName lastName class section studentAppId rollNumber').lean();
        } else {
            const q = { schoolId: school._id, status: 'Active' };
            if (className && className !== 'ALL') q.class = className;
            students = await Student.find(q).select('firstName lastName class section studentAppId rollNumber').lean();
        }
        if (!students.length) return res.status(400).json({ error: 'No active students match this selection' });

        // Dedup: skip students who already have this exact title.
        const existing = await FeeInvoice.find({ schoolId: school._id, studentId: { $in: students.map((s) => s._id) }, title: title.trim() })
            .select('studentId').lean();
        const already = new Set(existing.map((e) => String(e.studentId)));

        const toCreate = students.filter((s) => !already.has(String(s._id))).map((s) => ({
            schoolId: school._id, studentId: s._id,
            studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(), studentAppId: s.studentAppId || '',
            className: s.class, section: s.section, rollNumber: s.rollNumber || '',
            title: title.trim(), category: category || 'Tuition', period: period || '',
            amount: Number(amount), dueDate: dueDate || null, academicYear: academicYear || '',
            status: 'PENDING', createdByName: req.user?.role === 'Owner' ? 'Admin' : (req.user?.role || 'Admin'),
        }));

        if (toCreate.length) await FeeInvoice.insertMany(toCreate);

        // Notify the students who just got a new due.
        if (toCreate.length) {
            const recipients = toCreate.map((t) => ({ userId: t.studentId }));
            try {
                await notify({ schoolId: String(school._id), toRole: 'student', recipients,
                    title: '💳 New fee added', body: `${title.trim()} — ${money(amount)} is now due.`, type: 'fee', data: { link: '/fees' } });
            } catch (e) { console.error('[fees] due notify failed:', e.message); }
        }

        res.json({ message: `${toCreate.length} due(s) created`, created: toCreate.length, skipped: already.size });
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
        if (title != null) upd.title = title;
        if (amount != null) upd.amount = Number(amount);
        if (dueDate !== undefined) upd.dueDate = dueDate || null;
        if (status && ['PENDING', 'PAID', 'WAIVED'].includes(status)) upd.status = status;
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
        const { method = 'CASH', note = '', referenceNo = '' } = req.body || {};

        const payment = await FeePayment.create({
            schoolId: school._id, studentId: invoice.studentId, studentName: invoice.studentName,
            studentAppId: invoice.studentAppId, invoiceId: invoice._id, invoiceTitle: invoice.title,
            amount: invoice.amount, method, referenceNo, note, status: 'VERIFIED',
            verifiedByName: req.user?.role || 'Admin', verifiedAt: new Date(),
        });
        invoice.status = 'PAID'; invoice.paidAmount = invoice.amount; invoice.paidVia = method;
        invoice.paidAt = new Date(); invoice.paymentId = payment._id;
        await invoice.save();

        await notifyParent(school, invoice.studentId, '✅ Fee marked paid', `${invoice.title} — ${money(invoice.amount)} recorded as paid.`, { link: '/fees' });
        res.json({ message: 'Marked paid', invoice });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark paid' });
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
        if (payment.status === 'VERIFIED') return res.json({ message: 'Already verified', payment });

        payment.status = 'VERIFIED'; payment.verifiedByName = req.user?.role || 'Admin'; payment.verifiedAt = new Date();
        await payment.save();

        const invoice = await FeeInvoice.findById(payment.invoiceId);
        if (invoice) {
            invoice.status = 'PAID'; invoice.paidAmount = payment.amount; invoice.paidVia = payment.method;
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
            FeeInvoice.find({ schoolId: sid }).select('amount status paidAmount className').lean(),
            FeeInvoice.aggregate([{ $match: { schoolId: sid, status: 'PAID' } }, { $group: { _id: null, total: { $sum: '$paidAmount' } } }]),
            FeePayment.aggregate([{ $match: { schoolId: sid, status: 'VERIFIED', verifiedAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            FeePayment.countDocuments({ schoolId: sid, status: 'SUBMITTED' }),
        ]);

        const active = invoices.filter((i) => i.status !== 'WAIVED');
        const totalInvoiced = active.reduce((a, i) => a + (i.amount || 0), 0);
        const totalCollected = paidAgg[0]?.total || 0;
        const totalPending = active.filter((i) => i.status === 'PENDING' || i.status === 'SUBMITTED').reduce((a, i) => a + (i.amount || 0), 0);

        // Class-wise pending
        const byClassMap = {};
        for (const i of active) {
            const k = i.className || '—';
            byClassMap[k] = byClassMap[k] || { className: k, invoiced: 0, collected: 0, pending: 0 };
            byClassMap[k].invoiced += i.amount || 0;
            if (i.status === 'PAID') byClassMap[k].collected += i.paidAmount || 0;
            else if (i.status === 'PENDING' || i.status === 'SUBMITTED') byClassMap[k].pending += i.amount || 0;
        }

        res.json({
            totalInvoiced, totalCollected, totalPending,
            thisMonthCollected: monthAgg[0]?.total || 0,
            pendingVerification: pendingVerify,
            invoiceCount: active.length,
            paidCount: active.filter((i) => i.status === 'PAID').length,
            byClass: Object.values(byClassMap).sort((a, b) => b.pending - a.pending),
        });
    } catch (err) {
        console.error('summary error:', err);
        res.status(500).json({ error: 'Failed to load summary' });
    }
};

// =====================  PARENT / STUDENT  =====================
export const getStudentFees = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: 'Student not found' });

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
        res.status(401).json({ error: 'Unauthorized' });
    }
};

export const postStudentFeePay = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        const { invoiceId, amount, method, referenceNo, screenshotUrl, note } = req.body || {};
        if (!invoiceId) return res.status(400).json({ error: 'Invoice is required' });

        const invoice = await FeeInvoice.findOne({ _id: invoiceId, studentId: student._id });
        if (!invoice) return res.status(404).json({ error: 'Due not found' });
        if (invoice.status === 'PAID') return res.status(400).json({ error: 'This due is already paid' });

        const payment = await FeePayment.create({
            schoolId: student.schoolId, studentId: student._id,
            studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(), studentAppId: student.studentAppId,
            invoiceId: invoice._id, invoiceTitle: invoice.title,
            amount: Number(amount) || invoice.amount, method: method || 'UPI',
            referenceNo: referenceNo || '', screenshotUrl: screenshotUrl || '', note: note || '', status: 'SUBMITTED',
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
