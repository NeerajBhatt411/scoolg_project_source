import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import School from '../models/School.js';

dotenv.config();

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

// --- Persistent Connection Helper (Important for Netlify) ---
let cachedDb = null;
const connectToDB = async () => {
    if (cachedDb) return cachedDb;
    const db = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = db;
    return db;
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// --- API Endpoints ---

router.post('/onboarding/start', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    await connectToDB();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // (Suggestion: Use a separate OTP collection or Redis for verification in real prod)
    global.TMP_OTPS = global.TMP_OTPS || {};
    global.TMP_OTPS[email] = otp;

    try {
        await transporter.sendMail({
            from: `"Scoolg Support" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Scoolg School Verification Code",
            text: `Welcome to Scoolg! Your 6-digit verification code is: ${otp}.`
        });
        console.log(`✅ OTP Sent to ${email}: ${otp}`);
    } catch (err) { console.error("❌ Email failed:", err.message); }

    let school = await School.findOne({ email });
    if (!school) {
        school = new School({
            id: Date.now().toString(),
            email,
            status: "PENDING",
            currentStep: 1,
            formData: {
                email: email, schoolName: "", phone: "", address: "", city: "", state: "", pincode: "",
                schoolStrength: "", establishedYear: "", schoolDescription: "",
                mission: "", vision: "",
                leadership: [{ name: '', role: '', message: '' }, { name: '', role: '', message: '' }, { name: '', role: '', message: '' }],
                facilities: [], fees: { primary: "", secondary: "", seniorSecondary: "" },
                socialMedia: { instagram: "", facebook: "" }, gallery: []
            }
        });
        await school.save();
    }
    res.json({ message: "OTP sent successfully", schoolId: school.id, currentStep: school.currentStep, formData: school.formData });
});

router.post('/onboarding/verify', (req, res) => {
    const { email, otp } = req.body;
    if (global.TMP_OTPS && global.TMP_OTPS[email] === otp) {
        delete global.TMP_OTPS[email];
        res.json({ message: "Verified successfully!" });
    } else { res.status(401).json({ error: "Invalid OTP." }); }
});

router.patch('/onboarding/update/:id', async (req, res) => {
    const { id } = req.params;
    const { formData, currentStep } = req.body;
    await connectToDB();

    const school = await School.findOne({ id });
    if (!school) return res.status(404).json({ error: "Profile not found" });

    school.formData = { ...school.formData, ...formData };
    school.currentStep = currentStep || school.currentStep;
    if (currentStep === 8) school.status = "COMPLETED";
    
    await school.save();
    res.json({ message: "Saved!", data: school });
});

router.get('/onboarding/:id', async (req, res) => {
    const { id } = req.params;
    await connectToDB();
    const school = await School.findOne({ id });
    if (!school) return res.status(404).json({ error: "Not found" });
    res.json(school.formData);
});

// App Config for Netlify
app.use('/.netlify/functions/api', router);

export const handler = serverless(app);
