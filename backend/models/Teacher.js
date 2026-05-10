import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    teacherAppId: { type: String, required: true, unique: true }, // e.g., TCH101
    password: { type: String, required: true },
    isPasswordChanged: { type: Boolean, default: false },
    fullName: { type: String, required: true }, // Changed from firstName, lastName based on old UI
    gender: { type: String },
    dateOfBirth: { type: Date },
    email: { type: String },
    phone: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    highestQualification: { type: String },
    specialization: { type: String },
    experienceYears: { type: Number },
    dateOfJoining: { type: Date },
    residentialAddress: { type: String },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Subjects they can teach
    status: { type: String, enum: ['Active', 'Inactive', 'Left'], default: 'Active' }
}, { timestamps: true });

export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
export default Teacher;
