import mongoose from 'mongoose';

// GROUP chat: one room per student. Members = the parent + the School Office (admin)
// + every teacher. Everyone posts into the SAME thread (keyed by studentId); the
// member list is display-only (no 1-on-1). `from` says which side sent it and
// `senderName` is who to show on the school side ("School Office" / a teacher's name).
const MessageSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    from: { type: String, enum: ['parent', 'admin', 'teacher'], required: true },
    senderName: { type: String, default: '' }, // shown to the parent for school-side msgs
    senderId: { type: mongoose.Schema.Types.ObjectId, default: null }, // teacher's _id when from==='teacher'
    text: { type: String, required: true, trim: true },
    readByParent: { type: Boolean, default: false },
    readBySchool: { type: Boolean, default: false }, // read by anyone on the school side
    // legacy (older docs) — kept so existing data still reads
    party: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    readByAdmin: { type: Boolean },
}, { timestamps: true });

MessageSchema.index({ schoolId: 1, studentId: 1, createdAt: 1 }); // the group thread
MessageSchema.index({ schoolId: 1, createdAt: -1 }); // school-wide conversation list

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
