import mongoose from 'mongoose';

// A daily teaching-diary entry: what a teacher taught in a class/section/subject
// on a given date. Visible to the admin (record) and to the teacher.
const TeacherDiarySchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    className: { type: String, required: true },
    sectionName: { type: String, default: 'All' },
    subject: { type: String, default: '' },
    note: { type: String, required: true }, // one-liner: what was taught
    createdByRole: { type: String, enum: ['admin', 'teacher'], default: 'admin' },
    locked: { type: Boolean, default: false }, // once locked by teacher, can't be edited/deleted
}, { timestamps: true });

TeacherDiarySchema.index({ schoolId: 1, teacherId: 1, date: -1 });

export const TeacherDiary = mongoose.models.TeacherDiary || mongoose.model('TeacherDiary', TeacherDiarySchema);
export default TeacherDiary;
