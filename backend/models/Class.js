import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    className: { type: String, required: true }, // e.g., "Nursery", "Class 1"
    subjects: [{ type: String }], // e.g., ["Math", "Science"]
    order: { type: Number, default: 0 }, // For sorting, e.g., 1 for Nursery, 2 for KG, 3 for Class 1
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Class', ClassSchema);
