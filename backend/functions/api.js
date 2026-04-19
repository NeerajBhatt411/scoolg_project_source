import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const router = express.Router();

app.use(cors());
// Increase Express body limit for base64 images
app.use(express.json({ limit: '15mb' }));

// --- Inline School Model (For Netlify stability) ---
const SchoolSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    otp: { type: String },
    password: { type: String }, // Auto-generated password
    isPasswordChanged: { type: Boolean, default: false }, // For first-time login
    status: { type: String, default: "PENDING" },
    currentStep: { type: Number, default: 1 },
    formData: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Check if model already exists to prevent re-declaration errors in serverless
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);

// --- Persistent Connection Helper ---
let cachedDb = null;
const connectToDB = async () => {
    if (cachedDb) return cachedDb;
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        cachedDb = db;
        console.log("✅ MongoDB Connected");
        return db;
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
    }
};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// (limit already set above)

// --- Health Check ---
router.get('/health', (req, res) => res.json({ status: "Scoolg Backend Online! ✨", timestamp: new Date() }));

// --- API Router ---
router.post('/upload', async (req, res) => {
    try {
        const { file, folder, schoolName } = req.body;
        if (!file) return res.status(400).json({ error: "No file provided" });

        const uploadPath = `Scoolg/${schoolName || 'General'}/${folder || 'Other'}`;
        console.log(`📸 Uploading to: ${uploadPath}`);

        const uploadResponse = await cloudinary.uploader.upload(file, {
            folder: uploadPath,
            resource_type: "auto"
        });

        res.json({ url: uploadResponse.secure_url });
    } catch (err) {
        console.error("❌ Upload failed:", err.message);
        res.status(500).json({ error: "Image upload failed", details: err.message });
    }
});
router.get('/debug', (req, res) => {
    res.json({
        STATUS: "Backend Debug Info 🔍",
        MONGO_READY: !!process.env.MONGODB_URI,
        EMAIL_READY: !!process.env.GMAIL_USER,
        PASS_READY: !!process.env.GMAIL_PASS,
        NODE_ENV: process.env.NODE_ENV || 'not set'
    });
});
router.get('/test', (req, res) => res.json({ message: "Test Successful! 🚀" }));
router.get('/db-test', async (req, res) => {
    try {
        await connectToDB();
        res.json({ message: "MongoDB Atlas Connected Successfully! 📊", status: "ok" });
    } catch (err) {
        res.status(500).json({ error: "Database Connection Failed! ❌", details: err.message });
    }
});

// --- API Endpoints ---

router.post('/onboarding/start', async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    email = email.toLowerCase().trim();

    try {
        await connectToDB();
        const school = await School.findOne({ email });

        // CASE 1: Already fully onboarded
        if (school && school.status === "COMPLETED") {
            return res.status(409).json({ 
                error: "Account already exists for this email.", 
                type: "ALREADY_ONBOARDED" 
            });
        }

        // Generate and send OTP for both new and pending accounts
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            await transporter.sendMail({
                from: `"Scoolg Support" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: "Your Scoolg Onboarding OTP",
                text: `Welcome! Your 6-digit verification code is: ${otp}.`
            });
            console.log(`✅ OTP Sent to ${email}: ${otp}`);
        } catch (err) {
            console.error("❌ Email failed:", err.message);
            return res.status(500).json({ error: "Email delivery failed.", details: err.message });
        }

        if (!school) {
            // CASE 2: New account
            const newSchool = new School({
                id: Date.now().toString(),
                email,
                otp: otp,
                currentStep: 1,
                formData: { email: email }
            });
            await newSchool.save();
            return res.json({ 
                message: "OTP sent", 
                schoolId: newSchool.id, 
                currentStep: 1, 
                formData: newSchool.formData,
                isNewAccount: true 
            });
        } else {
            // CASE 3: Resuming pending account
            school.otp = otp;
            await school.save();
            return res.json({ 
                message: "OTP sent to resume your session", 
                schoolId: school.id, 
                currentStep: school.currentStep, 
                formData: school.formData,
                isNewAccount: false 
            });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

router.post('/onboarding/verify', async (req, res) => {
    const { email, otp } = req.body;
    try {
        await connectToDB();
        const school = await School.findOne({ email });
        
        if (school && school.otp === otp) {
            // Success! Clear OTP
            school.otp = null;
            await school.save();
            res.json({ message: "Verified successfully!" });
        } else {
            res.status(401).json({ error: "Invalid OTP code. Please try again." });
        }
    } catch (err) {
        res.status(500).json({ error: "Verification Failed", details: err.message });
    }
});

router.patch('/onboarding/update/:id', async (req, res) => {
    const { id } = req.params;
    const { formData, currentStep } = req.body;
    try {
        await connectToDB();
        const school = await School.findOne({ id });
        if (!school) return res.status(404).json({ error: "Profile not found" });

        school.formData = { ...school.formData, ...formData };
        school.currentStep = currentStep || school.currentStep;
        
        // Generate password if completing onboarding (Step 8)
        if (currentStep === 8 && !school.password) {
            const randomCode = Math.random().toString(36).slice(-6).toUpperCase();
            school.password = `SCOOLG-${randomCode}`;
            school.status = "COMPLETED";
        }

        await school.save();
        res.json({ message: "Saved!", data: school, password: school.password });
    } catch (err) {
        res.status(500).json({ error: "Save failed", details: err.message });
    }
});

// --- Admin Panel Endpoints ---

// Login
router.post('/admin/login', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("🔥 Login Request Received:", req.body);
    
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email & Password required" });

    email = email.toLowerCase().trim();

    try {
        await connectToDB();
        console.log(`🔍 Searching for school with email: ${email}`);
        
        const school = await School.findOne({
            $or: [
                { email: email },
                { "formData.email": email }
            ]
        });
        
        if (!school) {
            console.log(`❌ No account found for email: ${email}`);
            return res.status(401).json({ error: "No account found with this email" });
        }

        console.log(`✅ School record located: ${school.id}`);
        
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, school.password);
            if (!isMatch) {
                isMatch = (password === school.password);
            }
        } catch (e) {
            isMatch = (password === school.password);
        }

        console.log(`🔑 Verification Result: ${isMatch ? "SUCCESS" : "FAILED"}`);

        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: school.id, email: school.email }, 
            process.env.JWT_SECRET || 'scoolg_secret_99', 
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            schoolId: school.id, 
            schoolName: school.formData.schoolName,
            isPasswordChanged: school.isPasswordChanged 
        });
    } catch (err) {
        console.error("❌ Authentication Server Error:", err);
        res.status(500).json({ error: "Internal Authentication Error" });
    }
});

// Change Password
router.post('/admin/change-password', async (req, res) => {
    const { schoolId, newPassword } = req.body;
    try {
        await connectToDB();
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const salt = await bcrypt.genSalt(10);
        school.password = await bcrypt.hash(newPassword, salt);
        school.isPasswordChanged = true;
        await school.save();

        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Password change failed" });
    }
});

// Get/Update Profile
router.get('/admin/profile/:id', async (req, res) => {
    try {
        await connectToDB();
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });
        res.json(school.formData);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

router.patch('/admin/profile/:id', async (req, res) => {
    try {
        await connectToDB();
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });

        school.formData = { ...school.formData, ...req.body };
        await school.save();
        res.json({ message: "Profile updated successfully!", data: school.formData });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

router.get('/onboarding/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await connectToDB();
        const school = await School.findOne({ id });
        if (!school) return res.status(404).json({ error: "Not found" });
        res.json(school.formData);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});


// --- Inline Student Model ---
const StudentSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentAppId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPasswordChanged: { type: Boolean, default: false },
    admissionNumber: { type: String },
    rollNumber: { type: String },
    class: { type: String, required: true },
    section: { type: String, required: true },
    academicYear: { type: String, default: "2023-2024" },
    dateOfAdmission: { type: Date, default: Date.now },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: { type: String },
    aadhaarNumber: { type: String },
    religionOrCategory: { type: String },
    profileImageUrl: { type: String, default: "" },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    primaryContact: { type: String, required: true },
    parentEmail: { type: String },
    currentAddress: { type: String, required: true },
    permanentAddress: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'Transferred'], default: 'Active' }
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

// --- Students API ---
router.post('/admin/students', async (req, res) => {
    try {
        await connectToDB();
        const { schoolId, dateOfBirth } = req.body;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const count = await Student.countDocuments({ schoolId: school._id });
        
        // Format ID like: gaj15611001
        const campusStr = (school.campusCode || 'sch').toLowerCase().replace(/[^a-z0-9]/g, '');
        const studentAppId = `${campusStr}${count + 1001}`;
        
        // Default password = DDMMYYYY
        let plainPassword = "password123"; // Fallback
        if (dateOfBirth) {
            try {
                const dob = new Date(dateOfBirth);
                const d = String(dob.getDate()).padStart(2, '0');
                const m = String(dob.getMonth() + 1).padStart(2, '0');
                const y = dob.getFullYear();
                if (!isNaN(y)) {
                    plainPassword = `${d}${m}${y}`;
                }
            } catch (e) {
                console.warn("Could not parse date of birth for password generation");
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const newStudent = new Student({
            ...req.body,
            schoolId: school._id,
            studentAppId,
            password: hashedPassword
        });

        await newStudent.save();

        res.status(201).json({
            message: "Student added successfully",
            student: newStudent,
            appCredentials: {
                studentAppId,
                password: plainPassword
            }
        });
    } catch (err) {
        console.error("❌ Add student error:", err);
        res.status(500).json({ error: "Failed to add student", details: err.message });
    }
});

router.get('/admin/students', async (req, res) => {
    try {
        await connectToDB();
        const { schoolId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const students = await Student.find({ schoolId: school._id }).sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});

// App Config for Netlify - Root mounting for flexibility
app.use('/', router);
app.use('/api', router); // Legacy support
app.use('/.netlify/functions/api', router); // Direct function call support

export const handler = serverless(app);
