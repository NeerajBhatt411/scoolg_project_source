import mongoose from 'mongoose';

// A single payable due for one student for one period/head. Created by the
// school (bulk-generated from a FeeStructure, or a one-off custom fee like
// "Exam Fee"/"Arrears"). Its status walks PENDING -> SUBMITTED -> PAID (or
// REJECTED back to PENDING, or WAIVED).
const FeeInvoiceSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    // Denormalized for fast admin-side rendering without a join.
    studentName: { type: String, default: '' },
    studentAppId: { type: String, default: '' },
    className: { type: String, default: '' },
    section: { type: String, default: '' },
    rollNumber: { type: String, default: '' },

    title: { type: String, required: true },          // e.g. "April 2026 · Tuition", "Exam Fee — Term 1"
    category: { type: String, default: 'Tuition' },   // Tuition | Exam | Transport | Admission | Other | Arrears
    period: { type: String, default: '' },            // e.g. "2026-04" or "Term 1" (for dedup/grouping)
    amount: { type: Number, required: true, min: 0 },
    balanceAmount: { type: Number, default: function() { return this.amount; } },
    dueDate: { type: Date },
    academicYear: { type: String, default: '' },

    status: { type: String, enum: ['PENDING', 'SUBMITTED', 'PAID', 'PARTIALLY_PAID', 'REJECTED', 'WAIVED'], default: 'PENDING', index: true },
    paidAmount: { type: Number, default: 0 },
    paidVia: { type: String, default: '' },           // UPI | BANK | CASH | OTHER (on the verified payment)
    paidAt: { type: Date },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeePayment' },
    receiptNo: { type: String, default: '', index: true },
    voidReason: { type: String, default: '' },
    voidedBy: { type: String, default: '' },

    createdByName: { type: String, default: '' },
}, { timestamps: true });

FeeInvoiceSchema.index({ schoolId: 1, className: 1, section: 1, status: 1 });
FeeInvoiceSchema.index({ schoolId: 1, studentId: 1, title: 1 });   // dedup helper

export const FeeInvoice = mongoose.models.FeeInvoice || mongoose.model('FeeInvoice', FeeInvoiceSchema);
export default FeeInvoice;
