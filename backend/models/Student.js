import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    // --- 1. Multi-Tenant Reference (Very Important) ---
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },

    // --- 2. App Login Credentials ---
    studentAppId: { type: String, required: true, unique: true }, // e.g., STU-DPS-1002
    password: { type: String, required: true }, // Auto-generated initially
    isPasswordChanged: { type: Boolean, default: false },

    // --- 3. Academic Details ---
    admissionNumber: { type: String }, // Optional. If user doesn't provide, backend will generate it.
    rollNumber: { type: String }, // Optional
    class: { type: String, required: true },
    section: { type: String, required: true },
    academicYear: { type: String, default: "2023-2024" },
    dateOfAdmission: { type: Date, default: Date.now }, // Added: Crucial for schools

    // --- 4. Personal Info ---
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }, // Compulsory
    bloodGroup: { type: String }, // Optional
    aadhaarNumber: { type: String }, // Optional
    religionOrCategory: { type: String }, // Added: Good to have optional field
    profileImageUrl: { type: String, default: "" }, 

    // --- 5. Parent Details ---
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    primaryContact: { type: String, required: true }, // Used for SMS/App
    parentEmail: { type: String }, // Optional

    // --- 6. Address Info ---
    currentAddress: { type: String, required: true },
    permanentAddress: { type: String },

    // --- 7. Status ---
    status: { type: String, enum: ['Active', 'Inactive', 'Transferred'], default: 'Active' }

}, { timestamps: true });

// Pre-save hook to ensure admissionNumber exists
StudentSchema.pre('save', function(next) {
    if (!this.admissionNumber) {
        // If admission number is empty, generate a fallback one using timestamp or UUID-like logic.
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        this.admissionNumber = `ADM-${new Date().getFullYear()}-${randomPart}`;
    }
    next();
});

export default mongoose.model('Student', StudentSchema);
