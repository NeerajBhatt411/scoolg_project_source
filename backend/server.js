import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// --- Database & Config ---
let schools = [];
const TMP_OTPS = {}; // Stores OTPs in memory for verification

// --- Nodemailer Setup ---
// Note: Use your GMAIL_USER and GMAIL_PASS (App Password) from .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || "your-email@gmail.com",
        pass: process.env.GMAIL_PASS || "your-app-password"
    }
});

const saveToLocal = () => {
    try {
        fs.writeFileSync('./schools_db.json', JSON.stringify(schools, null, 2));
    } catch (err) { console.error("Error saving DB:", err); }
};

// --- Endpoints ---

// 1. Send OTP & Create Draft (Step 1)
app.post('/api/onboarding/start', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    TMP_OTPS[email] = otp;

    try {
        await transporter.sendMail({
            from: `"Scoolg Support" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Scoolg School Verification Code",
            text: `Welcome to Scoolg! Your 6-digit verification code is: ${otp}. This code is valid for 10 minutes.`
        });
        console.log(`✅ OTP Sent to ${email}: ${otp}`);
    } catch (err) {
        console.error("❌ Email failed:", err.message);
        // Fallback: If SMTP fails during development, we'll still allow the log to see it
    }

    let school = schools.find(s => s.email === email);
    if (!school) {
        school = {
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
        };
        schools.push(school);
        saveToLocal();
    }

    res.json({ message: "OTP sent successfully", schoolId: school.id, currentStep: school.currentStep, formData: school.formData });
});

// 2. Verify OTP
app.post('/api/onboarding/verify', (req, res) => {
    const { email, otp } = req.body;
    if (TMP_OTPS[email] === otp) {
        delete TMP_OTPS[email]; // Clear OTP after use
        res.json({ message: "Verified successfully!" });
    } else {
        res.status(401).json({ error: "Invalid OTP. Please try again." });
    }
});

// 3. Update Draft (Step-by-Step)
app.patch('/api/onboarding/update/:id', (req, res) => {
    const { id } = req.params;
    const { formData, currentStep } = req.body;
    const index = schools.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "School profile not found" });

    schools[index].formData = { ...schools[index].formData, ...formData };
    schools[index].currentStep = currentStep || schools[index].currentStep;
    if (currentStep === 8) schools[index].status = "COMPLETED";
    
    saveToLocal();
    res.json({ message: "Saved successfully", data: schools[index] });
});

// 4. Get Profile (For Template)
app.get('/api/onboarding/:id', (req, res) => {
    const { id } = req.params;
    const school = schools.find(s => s.id === id);
    if (!school) return res.status(404).json({ error: "Profile not found" });
    res.json(school.formData);
});

if (fs.existsSync('./schools_db.json')) schools = JSON.parse(fs.readFileSync('./schools_db.json'));
app.listen(PORT, () => console.log(`🚀 Scoolg Backend running on http://localhost:${PORT}`));
