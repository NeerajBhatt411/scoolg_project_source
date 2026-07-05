import mongoose from 'mongoose';

// A notice sent FROM the Scoolg super-admin TO schools — either the whole
// platform (audience 'ALL') or one specific school (audience 'SCHOOL' +
// schoolId). Shown as an inbox in each school's admin panel. Distinct from the
// school's OWN outgoing notices and from the app Notification model.
const BroadcastSchema = new mongoose.Schema({
    audience: { type: String, enum: ['ALL', 'SCHOOL'], default: 'ALL', index: true },
    schoolId: { type: String, default: '', index: true },   // School.id when audience === 'SCHOOL'
    schoolName: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['info', 'update', 'warning', 'maintenance'], default: 'info' },
    pinned: { type: Boolean, default: false },
    createdByName: { type: String, default: 'Scoolg Team' },
    readBy: { type: [String], default: [] },   // School.id values that have opened it
}, { timestamps: true });

BroadcastSchema.index({ audience: 1, schoolId: 1, createdAt: -1 });

export const Broadcast = mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
export default Broadcast;
