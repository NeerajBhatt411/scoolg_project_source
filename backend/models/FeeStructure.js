import mongoose from 'mongoose';

// A recurring fee "head" a school defines per class (e.g. Tuition ₹1200/Monthly,
// Transport ₹500/Monthly). Multiple heads per class are allowed. Used to
// bulk-generate FeeInvoices for a period. Frequency is the school's choice.
const FeeStructureSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    className: { type: String, required: true },
    label: { type: String, default: 'Tuition Fee' },
    category: { type: String, default: 'Tuition' },
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'One-Time'], default: 'Monthly' },
    academicYear: { type: String, default: '' },
    active: { type: Boolean, default: true },
}, { timestamps: true });

FeeStructureSchema.index({ schoolId: 1, className: 1, active: 1 });

export const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema);
export default FeeStructure;
