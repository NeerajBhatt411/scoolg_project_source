import mongoose from 'mongoose';

// Chat between a parent (uses the student app, keyed by studentId) and the school.
// The school side is either the ADMIN office (party='admin') or a specific TEACHER
// (party='teacher' + teacherId). A conversation = (studentId, party, teacherId).
const MessageSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    party: { type: String, enum: ['admin', 'teacher'], default: 'admin' }, // who the parent is talking to
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null }, // set when party === 'teacher'
    from: { type: String, enum: ['parent', 'admin', 'teacher'], required: true },
    text: { type: String, required: true, trim: true },
    readByParent: { type: Boolean, default: false },
    readBySchool: { type: Boolean, default: false }, // read by the admin/teacher on the other side
    // legacy (older docs) — kept so existing data still reads
    readByAdmin: { type: Boolean },
}, { timestamps: true });

MessageSchema.index({ schoolId: 1, studentId: 1, party: 1, teacherId: 1, createdAt: 1 });
MessageSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 }); // a teacher's conversation list

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
