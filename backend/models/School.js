import mongoose from 'mongoose';

const SchoolSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password for admin login
    isPasswordChanged: { type: Boolean, default: false }, // Force change on first login
    status: { type: String, default: "PENDING" },
    currentStep: { type: Number, default: 1 },
    formData: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model('School', SchoolSchema);
