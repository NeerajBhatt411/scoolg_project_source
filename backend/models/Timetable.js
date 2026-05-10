import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    dayOfWeek: { 
        type: String, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    periods: [{
        startTime: { type: String, required: true }, // e.g., "08:00 AM"
        endTime: { type: String, required: true },   // e.g., "08:45 AM"
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
    }]
}, { timestamps: true });

export default mongoose.model('Timetable', TimetableSchema);
