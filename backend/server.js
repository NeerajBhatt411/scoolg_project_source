import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
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
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    TMP_OTPS[email] = otp;

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
    res.json({ message: "OTP sent", schoolId: school.id, currentStep: school.currentStep, formData: school.formData });
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

    const school = await School.findOne({ id });
    if (!school) return res.status(404).json({ error: "Profile not found" });

    school.formData = { ...school.formData, ...formData };
    school.currentStep = currentStep || school.currentStep;
    if (currentStep === 8) school.status = "COMPLETED";

    await school.save();
    res.json({ message: "Saved!", data: school });
});

app.get('/api/onboarding/:id', async (req, res) => {
    const { id } = req.params;
    const school = await School.findOne({ id });
    if (!school) return res.status(404).json({ error: "Not found" });
    res.json(school.formData);
});

app.listen(PORT, () => console.log(`🚀 LOCAL Scoolg Backend running on http://localhost:${PORT}`));
