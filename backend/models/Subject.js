import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    subjectName: { type: String, required: true }, // e.g., "Mathematics", "Science"
    subjectCode: { type: String }, // Optional, e.g., "MATH101"
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export default Subject;
