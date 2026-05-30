import mongoose from 'mongoose';

const HomeworkSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    className: { type: String, required: true }, // e.g. "10"
    sectionName: { type: String, required: true, default: 'All' }, // e.g. "A" or "All" for every section
    subject: { type: String }, // e.g. "Math"
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    attachments: [{
        url: { type: String, required: true },
        fileName: { type: String },
        type: { type: String } // e.g. "image", "pdf"
    }],
    // Who created it. Teacher-ready: today only 'admin' is wired, teacher app comes later.
    createdByRole: { type: String, enum: ['admin', 'teacher'], default: 'admin' },
    createdById: { type: mongoose.Schema.Types.ObjectId },
    createdByName: { type: String, default: '' }, // Stored for fast rendering
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true });

HomeworkSchema.index({ schoolId: 1, className: 1, sectionName: 1, status: 1 });

export const Homework = mongoose.models.Homework || mongoose.model('Homework', HomeworkSchema);
export default Homework;
