import mongoose from 'mongoose';

// A delivered/stored notification — powers the in-app "Notifications" history
// (and is created alongside every push we send).
const NotificationSchema = new mongoose.Schema({
    schoolId: { type: String, index: true },
    toRole: { type: String, enum: ['owner', 'staff', 'teacher', 'student'] },
    toId: { type: String, index: true },     // recipient id; empty/"*" => broadcast within school+role
    title: { type: String, required: true },
    body: { type: String, default: '' },
    type: { type: String, default: 'general' }, // notice | homework | attendance | event | exam | general
    data: { type: Object, default: {} },        // extra payload (e.g. { route: '/homework' })
    read: { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ schoolId: 1, toRole: 1, toId: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
