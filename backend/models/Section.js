import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionName: { type: String, required: true }, // e.g., "A", "B", "C"
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, // Optional for now
    maxCapacity: { type: Number, default: 40 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema);
export default Section;
