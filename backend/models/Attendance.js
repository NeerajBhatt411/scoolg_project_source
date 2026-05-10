import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        status: { type: String, enum: ['P', 'A', 'L', 'H'], default: 'P' }
    }],
    markedBy: { type: String, default: "Admin" }
}, { timestamps: true });

// Ensure one attendance record per section per day
AttendanceSchema.index({ sectionId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
