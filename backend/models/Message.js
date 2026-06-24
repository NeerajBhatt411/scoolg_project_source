import mongoose from 'mongoose';

// One chat thread per student (the parent uses the student app). Each message is
// either from the parent or the school admin.
const MessageSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    from: { type: String, enum: ['parent', 'admin'], required: true },
    text: { type: String, required: true, trim: true },
    readByAdmin: { type: Boolean, default: false },
    readByParent: { type: Boolean, default: false },
}, { timestamps: true });

// Thread fetch (per student, chronological) and admin conversation lists.
MessageSchema.index({ schoolId: 1, studentId: 1, createdAt: 1 });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
