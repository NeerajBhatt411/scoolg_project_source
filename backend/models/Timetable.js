import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    className: { type: String, required: true }, // e.g. "5"
    sectionName: { type: String, required: true }, // e.g. "A"
    schedule: [{
        dayOfWeek: { 
            type: String, 
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            required: true
        },
        periods: [{
            periodNumber: { type: Number, required: true }, // 1, 2, 3...
            startTime: { type: String }, // e.g., "08:00 AM"
            endTime: { type: String },   // e.g., "08:40 AM"
            subject: { type: String },
            teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
            teacherName: { type: String } // Storing for fast rendering
        }]
    }]
}, { timestamps: true });

export const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
export default Timetable;
