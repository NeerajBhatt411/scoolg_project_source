import mongoose from 'mongoose';

// An FCM web-push token belonging to one signed-in user on one device.
const DeviceTokenSchema = new mongoose.Schema({
    schoolId: { type: String, index: true },          // School.id (string)
    role: { type: String, enum: ['owner', 'staff', 'teacher', 'student'], required: true },
    userId: { type: String, index: true },            // owner/staff/teacher/student id (as the app knows it)
    token: { type: String, required: true, unique: true },
}, { timestamps: true });

// Notification fan-out matches recipients by role + userId.
DeviceTokenSchema.index({ role: 1, userId: 1 });

export const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', DeviceTokenSchema);
export default DeviceToken;
