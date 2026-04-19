import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import School from './models/School.js';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection (Local & Global) ---
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ MongoDB Connected Successfully to Atlas!"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

const TMP_OTPS = {};

// --- Health Check & Test ---
app.get('/api/health', (req, res) => res.json({ status: "Scoolg Local Backend Online! ✨" }));
app.get('/api/test', (req, res) => res.json({ message: "Local Test Success! 🚀" }));

// --- API Endpoints ---

app.post('/api/onboarding/start', async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    email = email.toLowerCase().trim();

    try {
        const school = await School.findOne({ email });

        // CASE 1: Already fully onboarded
        if (school && school.status === "COMPLETED") {
            return res.status(409).json({ 
                error: "Account already exists for this email.", 
                type: "ALREADY_ONBOARDED" 
            });
        }

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

app.post('/api/onboarding/verify', (req, res) => {
    const { email, otp } = req.body;
    if (TMP_OTPS[email] === otp) {
        delete TMP_OTPS[email];
        res.json({ message: "Verified!" });
    } else { res.status(401).json({ error: "Invalid OTP." }); }
});

app.patch('/api/onboarding/update/:id', async (req, res) => {
    const { id } = req.params;
    const { formData, currentStep } = req.body;

    try {
        const school = await School.findOne({ id });
        if (!school) return res.status(404).json({ error: "Profile not found" });

        school.formData = { ...school.formData, ...formData };
        if (currentStep) school.currentStep = currentStep;

        let generatedPassword = null;
        if (currentStep === 8 && school.status !== "COMPLETED") {
            school.status = "COMPLETED";
            // Generate a random 8-char password
            // Branded Password generation (e.g. SCOOLG-XY12AB)
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            generatedPassword = `SCOOLG-${randomSuffix}`;
            const salt = await bcrypt.genSalt(10);
            school.password = await bcrypt.hash(generatedPassword, salt);
            school.isPasswordChanged = false; // Reset to false for new passwords

            // Generate unique Campus Code (No dashes, e.g. GAJ1561)
            const schoolNamePrefix = school.formData?.schoolName 
                ? school.formData.schoolName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SCH') 
                : 'SCH';
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            school.campusCode = `${schoolNamePrefix}${randomCode}`;
        }

        await school.save();
        res.json({ 
            message: "Saved!", 
            data: school,
            password: generatedPassword 
        });
    } catch (err) {
        console.error("❌ Update error:", err);
        res.status(500).json({ error: "Update failed" });
    }
});

// --- Admin Panel Endpoints ---

// Login
app.post('/api/admin/login', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("🔥 Login Request Received:", req.body);
    
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email & Password required" });

    email = email.toLowerCase().trim(); // Normalize email for search

    try {
        console.log(`🔍 Searching for school with email: ${email}`);
        
        // Search in both top-level email and formData email
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

        console.log(`✅ School record located: ${school.id} (${school.formData.schoolName})`);
        
        // Final password match check
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, school.password);
            if (!isMatch) {
                // Secondary check for plain text legacy/manual passwords
                isMatch = (password === school.password);
                if (isMatch) console.log("⚠️ Plain text match detected");
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
app.post('/api/admin/change-password', async (req, res) => {
    const { schoolId, newPassword } = req.body;
    try {
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

// Get/Update Profile (Protected logic can be added later)
app.get('/api/admin/profile/:id', async (req, res) => {
    const school = await School.findOne({ id: req.params.id });
    if (!school) return res.status(404).json({ error: "School not found" });
    res.json(school.formData);
});

app.patch('/api/admin/profile/:id', async (req, res) => {
    try {
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });

        school.formData = { ...school.formData, ...req.body };
        await school.save();
        res.json({ message: "Profile updated successfully!", data: school.formData });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

app.get('/api/onboarding/:id', async (req, res) => {
    const { id } = req.params;
    const school = await School.findOne({ id });
    if (!school) return res.status(404).json({ error: "Not found" });
    res.json(school.formData);
});

// --- Students API ---

// Import Student model at top, but since we are modifying here we will just dynamically import or we should have imported it.
// I will add the import at the top of the file in another call, here I'll use it assuming it's imported.
import Student from './models/Student.js';

app.post('/api/admin/students', async (req, res) => {
    try {
        const { schoolId } = req.body; // In real app, get from JWT token middleware
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        // Generate App ID and Password
        const count = await Student.countDocuments({ schoolId: school._id });
        const studentAppId = `STU-${school.campusCode || 'SCH'}-${count + 1001}`;
        
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const plainPassword = `PASS-${randomSuffix}`;
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
                password: plainPassword // Send back once so admin can print/save it
            }
        });
    } catch (err) {
        console.error("❌ Add student error:", err);
        res.status(500).json({ error: "Failed to add student", details: err.message });
    }
});

app.get('/api/admin/students', async (req, res) => {
    try {
        const { schoolId } = req.query; // Real app: from JWT
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const students = await Student.find({ schoolId: school._id }).sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});


app.listen(PORT, () => console.log(`🚀 LOCAL Scoolg Backend running on http://localhost:${PORT}`));
