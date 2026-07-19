import mongoose from 'mongoose';

// Student-wise discount defined per fee category (e.g. ₹200 off on Tuition Fee, ₹100 off on Transport).
// Applied dynamically on invoice generation or collection.
const FeeDiscountSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    category: { type: String, default: 'Tuition' }, // Tuition | Exam | Transport | Admission | Other | Arrears
    discountAmount: { type: Number, required: true, min: 0 },
    academicYear: { type: String, default: '' },
    active: { type: Boolean, default: true },
}, { timestamps: true });

FeeDiscountSchema.index({ schoolId: 1, studentId: 1, active: 1 });

export const FeeDiscount = mongoose.models.FeeDiscount || mongoose.model('FeeDiscount', FeeDiscountSchema);
export default FeeDiscount;
