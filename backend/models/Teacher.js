import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherAppId: { type: String, required: true, unique: true }, // e.g., TCH-DPS-1001
    password: { type: String, required: true },
    isPasswordChanged: { type: Boolean, default: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Subjects they can teach
    status: { type: String, enum: ['Active', 'Inactive', 'Left'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Teacher', TeacherSchema);
