import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

// --- Inline School Model (For Netlify stability) ---
const SchoolSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
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
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        cachedDb = db;
        console.log("✅ MongoDB Connected");
        return db;
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// --- Health Check & Debug ---
router.get('/health', (req, res) => res.json({ status: "Scoolg Backend Online! ✨", timestamp: new Date() }));
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

// --- API Endpoints ---

router.post('/onboarding/start', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    try {
        await connectToDB();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
        } catch (err) { 
            console.error("❌ Email failed:", err.message);
            return res.status(500).json({ error: "Email delivery failed. Check your Gmail App Password and 2-Step Verification.", details: err.message });
        }

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
    } catch (err) {
        res.status(500).json({ error: "Server Error", details: err.message });
    }
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
    try {
        await connectToDB();
        const school = await School.findOne({ id });
        if (!school) return res.status(404).json({ error: "Profile not found" });

        school.formData = { ...school.formData, ...formData };
        school.currentStep = currentStep || school.currentStep;
        if (currentStep === 8) school.status = "COMPLETED";
        
        await school.save();
        res.json({ message: "Saved!", data: school });
    } catch (err) {
        res.status(500).json({ error: "Save failed", details: err.message });
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

// App Config for Netlify - Root mounting for flexibility
app.use('/', router);
app.use('/api', router); // Legacy support
app.use('/.netlify/functions/api', router); // Direct function call support

export const handler = serverless(app);
