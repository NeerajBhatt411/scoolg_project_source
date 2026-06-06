import mongoose from 'mongoose';

// A single dated entry on the school calendar (holiday, function, sports day…).
// Every event also doubles as a "school-calendar" type notice that surfaces on
// the admin dashboard's Scheduled Events.
const CalendarEventSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    title: { type: String, required: true },
    // Holiday | Annual Function | Sports Day | Exam | Meeting | Event | Other
    category: { type: String, default: 'Event' },
    date: { type: String, required: true }, // 'YYYY-MM-DD' (stored as string to dodge TZ shifts)
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true }, // 0-11
    description: { type: String, default: '' },
    noticeType: { type: String, default: 'school-calendar' }, // scheduled as this notice type
    createdByName: { type: String, default: 'Admin' },
}, { timestamps: true });

CalendarEventSchema.index({ schoolId: 1, year: 1 });

export const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', CalendarEventSchema);
export default CalendarEvent;
