import mongoose from 'mongoose';

// A staff/sub-user under a school with module-level access.
// The school's own login (School document) acts as the "Owner" with full access
// and is NOT stored here.
const StaffUserSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, default: 'Custom' }, // e.g. Accountant, ClassTeacher, Receptionist, Custom
    // Module-level access: list of sidebar module keys this user can open.
    allowedModules: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    isPasswordChanged: { type: Boolean, default: false }
}, { timestamps: true });

export const StaffUser = mongoose.models.StaffUser || mongoose.model('StaffUser', StaffUserSchema);
export default StaffUser;
