import mongoose from 'mongoose';

// A parent's payment submission against one due — the audit record. Parent pays
// via the school's UPI/bank and uploads a screenshot (SUBMITTED); the school
// Verifies (-> invoice PAID) or Rejects. A cash payment recorded by the school
// is created here directly as VERIFIED (method CASH).
const FeePaymentSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    studentName: { type: String, default: '' },
    studentAppId: { type: String, default: '' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeInvoice', required: true, index: true },
    invoiceTitle: { type: String, default: '' },

    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['UPI', 'BANK', 'CASH', 'OTHER'], default: 'UPI' },
    referenceNo: { type: String, default: '' },       // UTR / txn id (optional)
    screenshotUrl: { type: String, default: '' },      // uploaded proof (via /api/upload)
    note: { type: String, default: '' },

    status: { type: String, enum: ['SUBMITTED', 'VERIFIED', 'REJECTED'], default: 'SUBMITTED', index: true },
    verifiedByName: { type: String, default: '' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
}, { timestamps: true });

FeePaymentSchema.index({ schoolId: 1, status: 1, createdAt: -1 });

export const FeePayment = mongoose.models.FeePayment || mongoose.model('FeePayment', FeePaymentSchema);
export default FeePayment;
