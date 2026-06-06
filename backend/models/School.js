import mongoose from 'mongoose';

const SchoolSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    campusCode: { type: String, unique: true, sparse: true, index: true }, // Added for App login
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password for admin login
    isPasswordChanged: { type: Boolean, default: false }, // Force change on first login
    resetOtp: { type: String }, // Forgot-password: 6-digit reset code
    resetOtpExpires: { type: Number }, // Forgot-password: epoch-ms expiry
    status: { type: String, default: "PENDING" },
    currentStep: { type: Number, default: 1 },
    formData: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
export default School;
