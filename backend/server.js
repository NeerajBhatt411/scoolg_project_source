import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { School } from './models/School.js';
import { ClassModel } from './models/Class.js';
import { Section } from './models/Section.js';
import { Subject } from './models/Subject.js';
import { Timetable } from './models/Timetable.js';
import { Teacher } from './models/Teacher.js';
import { Student } from './models/Student.js';
import { Attendance } from './models/Attendance.js';
import { Homework } from './models/Homework.js';
import { StaffUser } from './models/StaffUser.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// --- Cloudinary config (reuses env keys already used for school logos) ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5001;

// --- CRITICAL: Manual CORS & Preflight Handling for Netlify ---
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(cors());
app.use(express.json());
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Scoolg API Documentation',
            version: '1.0.0',
            description: 'Full API documentation for Scoolg School Management System (Super Admin, School Admin, Student & Teacher apps)',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
        tags: [
            { name: 'Student App', description: 'APIs for Student/Parent Mobile App' },
            { name: 'Auth', description: 'Authentication & Session Management' },
            { name: 'Academic', description: 'Timetable, Attendance, Results' },
            { name: 'Admin', description: 'School Administration & Controls' },
        ],
    },
    apis: ['./server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Standard Swagger UI at /docs (Netlify Compatible with CDN)
const swaggerUiOptions = {
    explorer: true,
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
    ]
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));


// --- MongoDB Connection (Serverless-Safe) ---
let cachedDbPromise = null;

const connectToDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }

    if (!cachedDbPromise) {
        cachedDbPromise = mongoose.connect(process.env.MONGODB_URI)
            .then((connection) => {
                console.log("✅ MongoDB Connected Successfully to Atlas!");
                return connection;
            })
            .catch((err) => {
                cachedDbPromise = null;
                console.error("❌ MongoDB Connection Error:", err);
                throw err;
            });
    }

    return cachedDbPromise;
};

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

app.use('/api', async (req, res, next) => {
    if (req.path === '/health' || req.path === '/test') {
        return next();
    }

    try {
        await connectToDB();
        next();
    } catch (err) {
        console.error("❌ Request blocked: database unavailable", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// --- API Endpoints ---

/**
 * @swagger
 * /api/onboarding/start:
 *   post:
 *     summary: Start school onboarding with OTP
 *     tags: [Public - Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email
 */
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

/**
 * @swagger
 * /api/onboarding/verify:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Public - Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verified successfully
 */
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

/**
 * Auth + module-level access guard for all /api/admin/* routes.
 * Backward compatible: legacy owner tokens (no `type`) get full access,
 * so already-logged-in school admins keep working. Only staff users are
 * restricted to their `allowedModules`.
 */
const ADMIN_PUBLIC_PATHS = ['/login'];
// Map a request path (relative to /api/admin) to the module it belongs to.
const MODULE_BY_PREFIX = [
    ['/student-attendance', 'students'],
    ['/students', 'students'],
    ['/teachers', 'teachers'],
    ['/classes', 'classes'],
    ['/sections', 'classes'],
    ['/subjects', 'classes'],
    ['/timetable', 'timetable'],
    ['/homework', 'homework'],
    ['/attendance', 'attendance'],
    ['/staff', 'roles'],
    ['/exams', 'exams'],
    ['/notices', 'notices'],
];
// Paths every authenticated user may access regardless of modules
// (profile, dashboard, change-password, etc.).
const ADMIN_SHARED_PATHS = ['/profile', '/dashboard', '/change-password'];

const moduleForPath = (p) => {
    for (const [prefix, mod] of MODULE_BY_PREFIX) {
        if (p === prefix || p.startsWith(prefix + '/') || p.startsWith(prefix + '?')) return mod;
    }
    return null;
};

app.use('/api/admin', (req, res, next) => {
    // Normalize so this works whether or not Express strips the mount prefix.
    const p = req.path.replace(/^\/api\/admin/, '') || '/';

    if (ADMIN_PUBLIC_PATHS.includes(p)) return next();

    // Non-breaking by design: the school owner panel keeps working even if the
    // token is missing/expired (this is how it behaved before roles existed).
    // We ONLY hard-enforce module access for a valid STAFF token.
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    let decoded;
    try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'scoolg_secret_99');
    } catch (e) {
        return next(); // bad/expired token -> behave as before, don't block the panel
    }
    req.user = decoded;

    // Owner / legacy token => full access.
    if (decoded.type !== 'staff') return next();

    // Staff: enforce module access.
    if (ADMIN_SHARED_PATHS.some(sp => p.startsWith(sp))) return next();
    const mod = moduleForPath(p);
    if (mod && Array.isArray(decoded.allowedModules) && decoded.allowedModules.includes(mod)) return next();
    if (!mod) return next(); // unmapped utility route -> allow

    return res.status(403).json({ error: "You don't have access to this section" });
});

// Login
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: School Admin Login (Email/Password)
 *     tags: [Public - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
app.post('/api/admin/login', async (req, res) => {
    console.log("🔥 Login Request Received:", req.body);

    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email & Password required" });

    email = email.toLowerCase().trim(); // Normalize email for search

    try {
        console.log(`🔍 Searching for school with email: [${email}]`);

        // Search in both top-level email and formData email
        const school = await School.findOne({
            $or: [
                { email: email },
                { "formData.email": email }
            ]
        });

        if (!school) {
            // Not a school owner — maybe a staff/sub-user account.
            const staff = await StaffUser.findOne({ email });
            if (!staff) {
                console.log(`❌ No account found for email: [${email}]`);
                return res.status(401).json({ error: "No account found with this email" });
            }
            if (staff.status !== 'Active') {
                return res.status(403).json({ error: "Your account is inactive. Contact your school admin." });
            }
            let staffMatch = false;
            try { staffMatch = await bcrypt.compare(password, staff.password); }
            catch (e) { staffMatch = (password === staff.password); }
            if (!staffMatch) return res.status(401).json({ error: "Incorrect password" });

            const staffSchool = await School.findById(staff.schoolId);
            if (!staffSchool) return res.status(404).json({ error: "School not found" });

            const staffToken = jwt.sign(
                {
                    userId: staff._id,
                    id: staffSchool.id, // string school id, matches owner token shape
                    schoolId: staffSchool.id,
                    type: 'staff',
                    role: staff.role,
                    allowedModules: staff.allowedModules || []
                },
                process.env.JWT_SECRET || 'scoolg_secret_99',
                { expiresIn: '7d' }
            );

            return res.json({
                token: staffToken,
                schoolId: staffSchool.id,
                schoolName: staffSchool.formData?.schoolName,
                isPasswordChanged: staff.isPasswordChanged,
                status: staffSchool.status,
                userType: 'staff',
                role: staff.role,
                allowedModules: staff.allowedModules || []
            });
        }

        console.log(`✅ School record located: ${school.id} (${school.formData?.schoolName || 'Unnamed School'})`);

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
            { id: school.id, email: school.email, type: 'owner', role: 'Owner' },
            process.env.JWT_SECRET || 'scoolg_secret_99',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            schoolId: school.id,
            schoolName: school.formData.schoolName,
            isPasswordChanged: school.isPasswordChanged,
            status: school.status,
            userType: 'owner',
            role: 'Owner',
            allowedModules: 'ALL'
        });
    } catch (err) {
        console.error("❌ Authentication Server Error:", err);
        res.status(500).json({ error: "Internal Authentication Error" });
    }
});

// Change Password — identity comes from the TOKEN, not the body.
// This prevents a logged-in staff member from accidentally overwriting the
// school owner's password (the old code always changed School.password).
app.post('/api/admin/change-password', async (req, res) => {
    const { schoolId, newPassword } = req.body;
    try {
        if (!newPassword) return res.status(400).json({ error: "New password required" });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        // Staff user logged in -> change the STAFF password only.
        if (req.user?.type === 'staff' && req.user.userId) {
            const staff = await StaffUser.findById(req.user.userId);
            if (!staff) return res.status(404).json({ error: "Staff account not found" });
            staff.password = hashed;
            staff.isPasswordChanged = true;
            await staff.save();
            return res.json({ message: "Password updated successfully!" });
        }

        // Otherwise the school owner -> change School password.
        // Prefer the id from the token; fall back to body for legacy sessions.
        const ownerSchoolId = (req.user && req.user.type !== 'staff' && req.user.id) || schoolId;
        const school = await School.findOne({ id: ownerSchoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        school.password = hashed;
        school.isPasswordChanged = true;
        await school.save();
        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: "Password change failed" });
    }
});

// Get/Update Profile (Protected logic can be added later)
app.get('/api/admin/profile/:id', async (req, res) => {
    const school = await School.findOne({ id: req.params.id });
    if (!school) return res.status(404).json({ error: "School not found" });
    res.json({
        ...school.formData,
        email: school.email,
        status: school.status,
        isPasswordChanged: school.isPasswordChanged
    });
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

// --- Dashboard Stats ---
app.get('/api/admin/dashboard/stats', async (req, res) => {
    try {
        const { schoolId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const [students, teachers, classes] = await Promise.all([
            Student.countDocuments({ schoolId: school._id }),
            Teacher.countDocuments({ schoolId: school._id }),
            ClassModel.countDocuments({ schoolId: school._id })
        ]);

        res.json({ students, teachers, classes });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// --- Classes API ---
/**
 * @swagger
 * /api/admin/classes:
 *   post:
 *     summary: Create a new academic class
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               className:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created
 */
app.post('/api/admin/classes', async (req, res) => {
    try {
        const { schoolId, className, order, subjects } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const newClass = new ClassModel({
            schoolId: school._id,
            className,
            order,
            subjects: subjects || []
        });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        res.status(500).json({ error: "Failed to create class", details: err.message });
    }
});

/**
 * @swagger
 * /api/admin/classes:
 *   get:
 *     summary: List all classes for a school
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of classes
 */
app.get('/api/admin/classes', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const classes = await ClassModel.find({ schoolId: school._id }).sort({ order: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// --- Sections API ---
/**
 * @swagger
 * /api/admin/sections:
 *   post:
 *     summary: Create a new section in a class
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *               sectionName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created
 */
app.post('/api/admin/sections', async (req, res) => {
    try {
        const { schoolId, classId, sectionName, maxCapacity } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const newSection = new Section({ schoolId: school._id, classId, sectionName, maxCapacity });
        await newSection.save();
        res.status(201).json(newSection);
    } catch (err) {
        res.status(500).json({ error: "Failed to create section" });
    }
});

/**
 * @swagger
 * /api/admin/sections:
 *   get:
 *     summary: List all sections for a specific class
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of sections
 */
app.get('/api/admin/sections', async (req, res) => {
    try {
        const { classId, schoolId } = req.query;
        let query = {};

        if (classId) {
            query.classId = classId;
        } else if (schoolId) {
            const school = await School.findOne({ id: schoolId });
            if (!school) return res.status(404).json({ error: "School not found" });
            query.schoolId = school._id;
        } else {
            return res.status(400).json({ error: "classId or schoolId is required" });
        }

        const sections = await Section.find(query).populate('classTeacherId');
        res.json(sections);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sections", details: err.message });
    }
});

// --- Subjects API ---
app.post('/api/admin/subjects', async (req, res) => {
    try {
        const { schoolId, subjectName, subjectCode } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const newSubject = new Subject({ schoolId: school._id, subjectName, subjectCode });
        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(500).json({ error: "Failed to create subject" });
    }
});

app.get('/api/admin/subjects', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const subjects = await Subject.find({ schoolId: school._id });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

// --- Teachers API (Basic) ---
/**
 * @swagger
 * /api/admin/teachers:
 *   post:
 *     summary: Add a new teacher
 *     tags: [School Admin - Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher added successfully
 */
app.post('/api/admin/teachers', async (req, res) => {
    try {
        const { schoolId, fullName, gender, dateOfBirth, phone, email, highestQualification, specialization, experienceYears, dateOfJoining, residentialAddress, profileImageUrl } = req.body;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const normalizedFullName = fullName?.trim();
        const normalizedGender = gender?.trim();
        const normalizedPhone = String(phone || '').replace(/\D/g, '');
        const normalizedEmail = email?.trim().toLowerCase() || '';
        const normalizedQualification = highestQualification?.trim();
        const normalizedSpecialization = specialization?.trim();
        const normalizedAddress = residentialAddress?.trim();
        const normalizedProfileImageUrl = profileImageUrl?.trim() || '';
        const parsedDateOfBirth = new Date(dateOfBirth);
        const parsedDateOfJoining = new Date(dateOfJoining);
        const normalizedExperienceYears = Number(experienceYears);
        const allowedGenders = ['Male', 'Female', 'Other'];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const now = new Date();

        if (!normalizedFullName || normalizedFullName.length < 2) {
            return res.status(400).json({ error: "Full name is required" });
        }
        if (!allowedGenders.includes(normalizedGender)) {
            return res.status(400).json({ error: "Valid gender is required" });
        }
        if (Number.isNaN(parsedDateOfBirth.getTime())) {
            return res.status(400).json({ error: "Valid date of birth is required" });
        }
        if (parsedDateOfBirth > now) {
            return res.status(400).json({ error: "Date of birth cannot be in the future" });
        }

        let age = now.getFullYear() - parsedDateOfBirth.getFullYear();
        const ageMonthOffset = now.getMonth() - parsedDateOfBirth.getMonth();
        if (ageMonthOffset < 0 || (ageMonthOffset === 0 && now.getDate() < parsedDateOfBirth.getDate())) {
            age--;
        }
        if (age < 18) {
            return res.status(400).json({ error: "Teacher must be at least 18 years old" });
        }

        if (normalizedPhone.length !== 10) {
            return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
        }
        if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        if (!normalizedQualification) {
            return res.status(400).json({ error: "Highest qualification is required" });
        }
        if (!normalizedSpecialization) {
            return res.status(400).json({ error: "Specialization is required" });
        }
        if (!Number.isFinite(normalizedExperienceYears) || normalizedExperienceYears < 0) {
            return res.status(400).json({ error: "Experience must be a valid non-negative number" });
        }
        if (Number.isNaN(parsedDateOfJoining.getTime())) {
            return res.status(400).json({ error: "Valid date of joining is required" });
        }
        if (parsedDateOfJoining > now) {
            return res.status(400).json({ error: "Date of joining cannot be in the future" });
        }
        if (parsedDateOfJoining < parsedDateOfBirth) {
            return res.status(400).json({ error: "Date of joining cannot be before date of birth" });
        }
        if (!normalizedAddress || normalizedAddress.length < 5) {
            return res.status(400).json({ error: "Residential address is required" });
        }

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const existingPhone = await Teacher.findOne({ schoolId: school._id, phone: normalizedPhone });
        if (existingPhone) {
            return res.status(409).json({ error: "A teacher with this phone number already exists" });
        }

        if (normalizedEmail) {
            const existingEmail = await Teacher.findOne({ schoolId: school._id, email: normalizedEmail });
            if (existingEmail) {
                return res.status(409).json({ error: "A teacher with this email address already exists" });
            }
        }

        // Generate short Teacher App ID: TCH101
        const count = await Teacher.countDocuments({ schoolId: school._id });
        const teacherAppId = `TCH${count + 101}`;

        // Generate short Password: PASS-XYZ
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        const plainPassword = `PASS-${randomSuffix}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const newTeacher = new Teacher({
            schoolId: school._id,
            teacherAppId,
            password: hashedPassword,
            fullName: normalizedFullName,
            gender: normalizedGender,
            dateOfBirth: parsedDateOfBirth,
            email: normalizedEmail || undefined,
            phone: normalizedPhone,
            profileImageUrl: normalizedProfileImageUrl,
            highestQualification: normalizedQualification,
            specialization: normalizedSpecialization,
            experienceYears: normalizedExperienceYears,
            dateOfJoining: parsedDateOfJoining,
            residentialAddress: normalizedAddress
        });

        await newTeacher.save();

        res.status(201).json({
            message: "Teacher added successfully",
            teacher: newTeacher,
            appCredentials: {
                teacherAppId,
                password: plainPassword
            }
        });
    } catch (err) {
        console.error("Failed to add teacher:", err);
        res.status(500).json({ error: "Failed to create teacher" });
    }
});

/**
 * @swagger
 * /api/admin/teachers:
 *   get:
 *     summary: List all teachers for a school
 *     tags: [School Admin - Teachers]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of teachers
 */
app.get('/api/admin/teachers', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const teachers = await Teacher.find({ schoolId: school._id }).populate('subjects');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teachers" });
    }
});

// --- Students API ---


/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     summary: Add a new student
 *     tags: [Admin - Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               class:
 *                 type: string
 *               section:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student added successfully
 */
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

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Search/List students with filters
 *     tags: [School Admin - Students]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *       - in: query
 *         name: className
 *       - in: query
 *         name: sectionName
 *     responses:
 *       200:
 *         description: Array of students
 */
app.get('/api/admin/students', async (req, res) => {
    try {
        const { schoolId, className, sectionName } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        let query = { schoolId: school._id };
        if (className) query.class = className;
        if (sectionName) query.section = sectionName;

        const students = await Student.find(query).sort({ rollNumber: 1, firstName: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});


// --- Super Admin APIs ---

/**
 * @swagger
 * /api/superadmin/dashboard:
 *   get:
 *     summary: Get Super Admin dashboard stats
 *     tags: [Super Admin]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
app.get('/api/superadmin/dashboard', async (req, res) => {
    try {
        const totalSchools = await School.countDocuments({ status: { $ne: "PENDING" } });
        const pendingSchools = await School.countDocuments({ status: "PENDING" });
        const totalStudents = await Student.countDocuments();

        // Dummy revenue calculation for demo (assuming 15k per school)
        const revenue = totalSchools * 15000;

        res.json({
            schools: totalSchools,
            students: totalStudents,
            pending: pendingSchools,
            revenue: revenue
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

/**
 * @swagger
 * /api/superadmin/schools:
 *   get:
 *     summary: List all schools for Super Admin
 *     tags: [Super Admin]
 *     responses:
 *       200:
 *         description: List of schools
 */
app.get('/api/superadmin/schools', async (req, res) => {
    try {
        const schools = await School.find().sort({ createdAt: -1 });
        res.json(schools);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch schools" });
    }
});

/**
 * @swagger
 * /api/superadmin/schools/{id}/approve:
 *   post:
 *     summary: Approve a pending school registration
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School approved successfully
 */
app.post('/api/superadmin/schools/:id/approve', async (req, res) => {
    try {
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });

        school.status = "COMPLETED"; // Or ACTIVE

        // Ensure they have a campus code if not generated
        if (!school.campusCode) {
            const schoolNamePrefix = school.formData?.schoolName
                ? school.formData.schoolName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SCH')
                : 'SCH';
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            school.campusCode = `${schoolNamePrefix}${randomCode}`;
        }

        // Optionally generate a password if they don't have one
        if (!school.password) {
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const generatedPassword = `SCOOLG-${randomSuffix}`;
            const salt = await bcrypt.genSalt(10);
            school.password = await bcrypt.hash(generatedPassword, salt);
            school.isPasswordChanged = false;
        }

        await school.save();

        // Simulate sending email to school admin
        try {
            await transporter.sendMail({
                from: `"Scoolg Support" <${process.env.GMAIL_USER}>`,
                to: school.email,
                subject: "Your Scoolg Account is Approved!",
                text: `Congratulations! Your school has been approved. Your Campus Code is: ${school.campusCode}.`
            });
        } catch (err) {
            console.error("Warning: Could not send approval email", err.message);
        }

        res.json({ message: "School approved successfully", school });
    } catch (err) {
        res.status(500).json({ error: "Failed to approve school" });
    }
});

/**
 * @swagger
 * /api/superadmin/schools/{id}/status:
 *   patch:
 *     summary: Update school status (ACTIVE, SUSPENDED, etc.)
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
app.patch('/api/superadmin/schools/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });

        school.status = status;
        await school.save();

        res.json({ message: `School status updated to ${status}`, school });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

/**
 * @swagger
 * /api/superadmin/schools/{id}:
 *   delete:
 *     summary: Permanently delete a school and its data
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School deleted
 */
app.delete('/api/superadmin/schools/:id', async (req, res) => {
    try {
        const schoolId = req.params.id;
        const school = await School.findOne({ id: schoolId });

        if (!school) {
            return res.status(404).json({ error: "School not found" });
        }

        // Delete all students associated with the school
        await Student.deleteMany({ schoolId: school._id });

        // Delete the school itself
        await School.deleteOne({ id: schoolId });

        res.json({ message: "School and all associated data deleted successfully." });
    } catch (err) {
        console.error("❌ Delete error:", err);
        res.status(500).json({ error: "Failed to delete school" });
    }
});

// --- Timetable API ---
/**
 * @swagger
 * /api/admin/timetable:
 *   get:
 *     summary: Fetch timetable for a class/section
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *       - in: query
 *         name: className
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectionName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timetable object
 */
app.get('/api/admin/timetable', async (req, res) => {
    try {
        const { schoolId, className, sectionName } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const timetable = await Timetable.findOne({
            schoolId: school._id,
            className,
            sectionName
        });

        res.json(timetable || { message: "No timetable found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/admin/timetable:
 *   post:
 *     summary: Save or update class timetable
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Timetable saved
 */
app.post('/api/admin/timetable', async (req, res) => {
    try {
        const { schoolId, className, sectionName, schedule } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const updatedTimetable = await Timetable.findOneAndUpdate(
            { schoolId: school._id, className, sectionName },
            { schedule },
            { new: true, upsert: true }
        );

        res.json(updatedTimetable);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- File Upload API (base64 -> Cloudinary) ---
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a base64 file to Cloudinary and get back a URL
 *     tags: [Utility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, description: "data:<mime>;base64,... string" }
 *               folder: { type: string }
 *               schoolName: { type: string }
 *     responses:
 *       200:
 *         description: Upload success, returns { url }
 */
app.post('/api/upload', async (req, res) => {
    try {
        const { file, folder, schoolName } = req.body;
        if (!file) return res.status(400).json({ error: "No file provided" });

        const safeSchool = (schoolName || 'General').replace(/[^a-zA-Z0-9-_]/g, '_');
        const targetFolder = `scoolg/${safeSchool}/${folder || 'Uploads'}`;

        const result = await cloudinary.uploader.upload(file, {
            folder: targetFolder,
            resource_type: 'auto' // supports images + pdf + raw
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            type: result.resource_type,
            format: result.format
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: err.message || "Upload failed" });
    }
});


// --- Homework API ---
/**
 * @swagger
 * /api/admin/homework:
 *   post:
 *     summary: Create a homework/assignment for a class/section
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Homework created
 */
app.post('/api/admin/homework', async (req, res) => {
    try {
        const {
            schoolId, className, sectionName, subject, title, description,
            dueDate, attachments, createdByRole, createdById, createdByName
        } = req.body;

        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });
        if (!className) return res.status(400).json({ error: "Class is required" });
        if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const homework = await Homework.create({
            schoolId: school._id,
            className,
            sectionName: sectionName || 'All',
            subject: subject?.trim() || '',
            title: title.trim(),
            description: description?.trim() || '',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            attachments: Array.isArray(attachments) ? attachments : [],
            createdByRole: createdByRole === 'teacher' ? 'teacher' : 'admin',
            createdById: createdById || undefined,
            createdByName: createdByName || 'School Admin'
        });

        res.status(201).json(homework);
    } catch (err) {
        console.error("Create homework error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/admin/homework:
 *   get:
 *     summary: List homework for a school (filter by class/section)
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema: { type: string }
 *       - in: query
 *         name: className
 *         schema: { type: string }
 *       - in: query
 *         name: sectionName
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of homework
 */
app.get('/api/admin/homework', async (req, res) => {
    try {
        const { schoolId, className, sectionName } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const filter = { schoolId: school._id, status: 'Active' };
        if (className) filter.className = className;
        if (sectionName) {
            // Section-specific homework + anything assigned to "All" sections of that class
            filter.$or = [{ sectionName }, { sectionName: 'All' }];
        }

        const homework = await Homework.find(filter).sort({ createdAt: -1 });
        res.json(homework);
    } catch (err) {
        console.error("List homework error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/admin/homework/{id}:
 *   patch:
 *     summary: Update a homework entry
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated homework
 */
app.patch('/api/admin/homework/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['className', 'sectionName', 'subject', 'title', 'description', 'dueDate', 'attachments', 'status'];
        const update = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }
        if (update.dueDate) update.dueDate = new Date(update.dueDate);
        if (update.title !== undefined && !String(update.title).trim()) {
            return res.status(400).json({ error: "Title cannot be empty" });
        }

        const homework = await Homework.findByIdAndUpdate(id, update, { new: true });
        if (!homework) return res.status(404).json({ error: "Homework not found" });
        res.json(homework);
    } catch (err) {
        console.error("Update homework error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/admin/homework/{id}:
 *   delete:
 *     summary: Delete a homework entry
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Homework deleted
 */
app.delete('/api/admin/homework/:id', async (req, res) => {
    try {
        const homework = await Homework.findByIdAndDelete(req.params.id);
        if (!homework) return res.status(404).json({ error: "Homework not found" });
        res.json({ message: "Homework deleted", id: req.params.id });
    } catch (err) {
        console.error("Delete homework error:", err);
        res.status(500).json({ error: err.message });
    }
});


// --- Staff / Roles API (module: roles) ---
// Resolve the School document for the logged-in user (owner or staff).
const schoolFromReq = async (req) => {
    const sid = req.user?.schoolId || req.user?.id;
    if (!sid) return null;
    return School.findOne({ id: sid });
};

const genPassword = () => {
    // Readable temp password, e.g. "Scoolg@4821"
    const n = (Math.floor(Date.now() % 9000) + 1000);
    return `Scoolg@${n}`;
};

/**
 * @swagger
 * /api/admin/staff:
 *   post:
 *     summary: Create a staff/sub-user with module-level access
 *     tags: [School Admin - Roles]
 *   get:
 *     summary: List staff users for the school
 *     tags: [School Admin - Roles]
 */
app.post('/api/admin/staff', async (req, res) => {
    try {
        const { fullName, email, role, allowedModules } = req.body;
        if (!fullName?.trim()) return res.status(400).json({ error: "Full name is required" });
        if (!email?.trim()) return res.status(400).json({ error: "Email is required" });

        const school = await schoolFromReq(req);
        if (!school) return res.status(404).json({ error: "School not found" });

        const normalizedEmail = email.toLowerCase().trim();

        // Email must be unique across schools (login key) and not collide with an owner.
        const existingStaff = await StaffUser.findOne({ email: normalizedEmail });
        if (existingStaff) return res.status(409).json({ error: "A user with this email already exists" });
        const existingSchool = await School.findOne({ $or: [{ email: normalizedEmail }, { "formData.email": normalizedEmail }] });
        if (existingSchool) return res.status(409).json({ error: "This email is already used by a school account" });

        const plainPassword = genPassword();
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(plainPassword, salt);

        const staff = await StaffUser.create({
            schoolId: school._id,
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashed,
            role: role?.trim() || 'Custom',
            allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
            status: 'Active'
        });

        // Return the generated password ONCE so the admin can share it.
        res.status(201).json({
            staff: { ...staff.toObject(), password: undefined },
            credentials: { email: normalizedEmail, password: plainPassword }
        });
    } catch (err) {
        console.error("Create staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/staff', async (req, res) => {
    try {
        const school = await schoolFromReq(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        const staff = await StaffUser.find({ schoolId: school._id }).select('-password').sort({ createdAt: -1 });
        res.json(staff);
    } catch (err) {
        console.error("List staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/admin/staff/{id}:
 *   patch:
 *     summary: Update a staff user's role/modules/status
 *     tags: [School Admin - Roles]
 *   delete:
 *     summary: Delete a staff user
 *     tags: [School Admin - Roles]
 */
app.patch('/api/admin/staff/:id', async (req, res) => {
    try {
        const allowed = ['fullName', 'role', 'allowedModules', 'status'];
        const update = {};
        for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
        const staff = await StaffUser.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (err) {
        console.error("Update staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
    try {
        const staff = await StaffUser.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json({ message: "Staff removed", id: req.params.id });
    } catch (err) {
        console.error("Delete staff error:", err);
        res.status(500).json({ error: err.message });
    }
});


// --- Attendance API ---


/**
 * @swagger
 * /api/admin/attendance:
 *   post:
 *     summary: Save or update daily attendance
 *     tags: [Admin - Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               date:
 *                 type: string
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Attendance saved successfully
 */
app.post('/api/admin/attendance', async (req, res) => {
    try {
        const { schoolId, classId, sectionId, date, records } = req.body;

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const attendance = await Attendance.findOneAndUpdate(
            { sectionId, date },
            {
                schoolId: school._id,
                classId,
                sectionId,
                date,
                records,
                markedBy: "Admin"
            },
            { upsert: true, new: true }
        );

        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: "Failed to save attendance", details: err.message });
    }
});

/**
 * @swagger
 * /api/admin/attendance:
 *   get:
 *     summary: Fetch attendance for a specific date
 *     tags: [School Admin - Attendance]
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record
 */
app.get('/api/admin/attendance', async (req, res) => {
    try {
        const { sectionId, date } = req.query;
        if (!sectionId || !date) return res.status(400).json({ error: "sectionId and date are required" });

        const attendance = await Attendance.findOne({ sectionId, date });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch attendance" });
    }
});

/**
 * @swagger
 * /api/admin/student-attendance/{studentId}:
 *   get:
 *     summary: Fetch attendance history for a specific student
 *     tags: [School Admin - Attendance]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student's attendance history
 */
app.get('/api/admin/student-attendance/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Find all attendance records where this student is present
        const attendanceRecords = await Attendance.find({
            "records.studentId": student._id
        }).sort({ date: -1 });

        // Map to return only this student's status for each day
        const result = attendanceRecords.map(record => ({
            date: record.date,
            status: record.records.find(r => r.studentId.toString() === student._id.toString())?.status
        }));

        res.json(result);
    } catch (err) {
        console.error("Fetch student attendance error:", err);
        res.status(500).json({ error: "Failed to fetch student attendance" });
    }
});

// --- Student App Specific APIs ---


/**
 * @swagger
 * /api/student/verify-campus/{code}:
 *   get:
 *     summary: Verify school campus code
 *     tags: [Student App]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School branding info
 */
app.get('/api/student/verify-campus/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const school = await School.findOne({ campusCode: code.toUpperCase() });
        if (!school) return res.status(404).json({ error: "Invalid Campus Code" });

        res.json({
            schoolId: school.id,
            schoolName: school.formData.schoolName,
            logo: school.formData.logo || school.formData.schoolLogo
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/student/login:
 *   post:
 *     summary: Student Login
 *     description: Authenticates a student and returns session tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentAppId, password]
 *             properties:
 *               studentAppId:
 *                 type: string
 *                 example: "sch1001"
 *               password:
 *                 type: string
 *                 example: "15122005"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 studentId:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/student/login', async (req, res) => {
    try {
        let { studentAppId, password } = req.body;
        if (!studentAppId || !password) return res.status(400).json({ error: "ID & Password required" });
        
        studentAppId = studentAppId.toLowerCase().trim();
        const student = await Student.findOne({ studentAppId });
        if (!student) return res.status(401).json({ error: "Invalid ID or Password" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid ID or Password" });

        const accessToken = jwt.sign(
            { id: student._id, schoolId: student.schoolId, role: 'student' },
            process.env.JWT_SECRET || 'scoolg_secret_99',
            { expiresIn: '1d' } // Short lived
        );

        const refreshToken = jwt.sign(
            { id: student._id },
            process.env.JWT_REFRESH_SECRET || 'scoolg_refresh_secret_88',
            { expiresIn: '30d' } // Long lived
        );

        res.json({ accessToken, refreshToken, studentId: student._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 */
app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'scoolg_refresh_secret_88');
        const student = await Student.findById(decoded.id);
        
        if (!student) return res.status(401).json({ error: "Invalid session" });

        const newAccessToken = jwt.sign(
            { id: student._id, schoolId: student.schoolId, role: 'student' },
            process.env.JWT_SECRET || 'scoolg_secret_99',
            { expiresIn: '1d' }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ error: "Session expired. Please login again." });
    }
});

/**
 * @swagger
 * /api/student/me:
 *   get:
 *     summary: Get Student Profile
 *     tags: [Student App]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/student/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        const school = await School.findOne({ _id: student.schoolId });

        res.json({
            student,
            school: {
                name: school.formData.schoolName,
                logo: school.formData.logo || school.formData.schoolLogo
            }
        });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

/**
 * @swagger
 * /api/student/timetable:
 *   get:
 *     summary: Get Student Timetable
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/student/timetable', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        const timetable = await Timetable.findOne({
            schoolId: student.schoolId,
            className: student.class,
            sectionName: student.section
        });

        res.json(timetable || { message: "No timetable found" });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * @swagger
 * /api/student/homework:
 *   get:
 *     summary: Get homework for the logged-in student's class/section
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of homework
 */
app.get('/api/student/homework', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Homework for the student's exact section OR assigned to "All" sections of the class
        const homework = await Homework.find({
            schoolId: student.schoolId,
            className: student.class,
            status: 'Active',
            $or: [{ sectionName: student.section }, { sectionName: 'All' }]
        }).sort({ dueDate: 1, createdAt: -1 });

        res.json(homework);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * @swagger
 * /api/student/attendance:
 *   get:
 *     summary: Get Attendance History
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/student/attendance', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Find all attendance records for this school where this student is present in the records array
        const attendanceRecords = await Attendance.find({
            schoolId: student.schoolId,
            "records.studentId": student._id
        }).sort({ date: -1 });

        // Map to return only this student's status for each day
        const result = attendanceRecords.map(record => ({
            date: record.date,
            status: record.records.find(r => r.studentId.toString() === student._id.toString())?.status
        }));

        res.json(result);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// =====================================================================
// --- Teacher App APIs ---
// =====================================================================

// Verify a teacher's JWT and load the teacher document.
const teacherFromToken = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('No token');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'scoolg_secret_99');
    if (decoded.type !== 'teacher') throw new Error('Not a teacher token');
    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
};

/**
 * @swagger
 * /api/teacher/login:
 *   post:
 *     summary: Teacher login (Teacher ID + Password)
 *     tags: [Teacher App]
 */
app.post('/api/teacher/login', async (req, res) => {
    try {
        let { teacherAppId, password } = req.body;
        if (!teacherAppId || !password) return res.status(400).json({ error: "Teacher ID & Password required" });
        teacherAppId = String(teacherAppId).trim();

        // Allow login by Teacher ID or email.
        const teacher = await Teacher.findOne({
            $or: [{ teacherAppId }, { email: teacherAppId.toLowerCase() }]
        });
        if (!teacher) return res.status(401).json({ error: "No teacher account found with this ID" });
        if (teacher.status && teacher.status !== 'Active') {
            return res.status(403).json({ error: "Your account is inactive. Contact your school admin." });
        }

        let isMatch = false;
        try { isMatch = await bcrypt.compare(password, teacher.password); }
        catch (e) { isMatch = (password === teacher.password); }
        if (!isMatch) return res.status(401).json({ error: "Incorrect password" });

        const accessToken = jwt.sign(
            { id: teacher._id, type: 'teacher' },
            process.env.JWT_SECRET || 'scoolg_secret_99',
            { expiresIn: '7d' }
        );

        res.json({
            accessToken,
            teacherId: teacher._id,
            isPasswordChanged: teacher.isPasswordChanged
        });
    } catch (err) {
        console.error("Teacher login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

/**
 * @swagger
 * /api/teacher/me:
 *   get:
 *     summary: Logged-in teacher profile + school branding
 *     tags: [Teacher App]
 */
app.get('/api/teacher/me', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const school = await School.findById(teacher.schoolId);
        res.json({
            teacher,
            school: school ? {
                name: school.formData?.schoolName,
                logo: school.formData?.logo || school.formData?.schoolLogo
            } : null
        });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * @swagger
 * /api/teacher/timetable:
 *   get:
 *     summary: Weekly schedule of periods this teacher teaches
 *     tags: [Teacher App]
 */
app.get('/api/teacher/timetable', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const tid = teacher._id.toString();
        const timetables = await Timetable.find({ schoolId: teacher.schoolId });

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const byDay = {};
        days.forEach(d => { byDay[d] = []; });

        for (const tt of timetables) {
            for (const day of tt.schedule || []) {
                for (const p of day.periods || []) {
                    if (p.teacherId && p.teacherId.toString() === tid) {
                        byDay[day.dayOfWeek]?.push({
                            periodNumber: p.periodNumber,
                            startTime: p.startTime,
                            endTime: p.endTime,
                            subject: p.subject,
                            className: tt.className,
                            sectionName: tt.sectionName
                        });
                    }
                }
            }
        }
        // Sort each day's periods by period number.
        days.forEach(d => byDay[d].sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0)));

        res.json({ schedule: days.map(d => ({ dayOfWeek: d, periods: byDay[d] })) });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * @swagger
 * /api/teacher/my-classes:
 *   get:
 *     summary: Classes/sections this teacher handles (class-teacher of, or teaches)
 *     tags: [Teacher App]
 */
app.get('/api/teacher/my-classes', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const tid = teacher._id.toString();

        // Sections where this teacher is the class teacher.
        const ownSections = await Section.find({ schoolId: teacher.schoolId, classTeacherId: teacher._id });
        const classTeacherOf = new Set(ownSections.map(s => `${s._id}`));

        // Sections list for the school + their class info.
        const sections = await Section.find({ schoolId: teacher.schoolId });
        const classes = await ClassModel.find({ schoolId: teacher.schoolId });
        const classById = {};
        classes.forEach(c => { classById[c._id.toString()] = c; });

        // Classes/sections derived from the timetable (where the teacher has periods).
        const timetables = await Timetable.find({ schoolId: teacher.schoolId });
        const teaches = new Set();
        for (const tt of timetables) {
            for (const day of tt.schedule || []) {
                for (const p of day.periods || []) {
                    if (p.teacherId && p.teacherId.toString() === tid) {
                        teaches.add(`${tt.className}|${tt.sectionName}`);
                    }
                }
            }
        }

        const result = sections.map(s => {
            const cls = classById[s.classId?.toString()];
            const className = cls?.className || '';
            const key = `${className}|${s.sectionName}`;
            return {
                sectionId: s._id,
                classId: s.classId,
                className,
                sectionName: s.sectionName,
                subjects: cls?.subjects || [],
                isClassTeacher: classTeacherOf.has(`${s._id}`),
                teaches: teaches.has(key)
            };
        }).filter(c => c.isClassTeacher || c.teaches);

        res.json(result);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * @swagger
 * /api/teacher/students:
 *   get:
 *     summary: Students of a class/section (for attendance)
 *     tags: [Teacher App]
 */
app.get('/api/teacher/students', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { className, sectionName } = req.query;
        const students = await Student.find({
            schoolId: teacher.schoolId,
            class: className,
            section: sectionName
        }).select('firstName lastName rollNumber profileImageUrl class section');
        res.json(students);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * @swagger
 * /api/teacher/attendance:
 *   get:
 *     summary: Fetch saved attendance for a section/date
 *     tags: [Teacher App]
 *   post:
 *     summary: Save attendance for a section/date
 *     tags: [Teacher App]
 */
app.get('/api/teacher/attendance', async (req, res) => {
    try {
        await teacherFromToken(req);
        const { sectionId, date } = req.query;
        const attendance = await Attendance.findOne({ sectionId, date });
        res.json(attendance || { records: [] });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.post('/api/teacher/attendance', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { classId, sectionId, date, records } = req.body;
        if (!sectionId || !date) return res.status(400).json({ error: "Section and date required" });

        const attendance = await Attendance.findOneAndUpdate(
            { sectionId, date },
            { schoolId: teacher.schoolId, classId, sectionId, date, records, markedBy: teacher._id },
            { new: true, upsert: true }
        );
        res.json(attendance);
    } catch (err) {
        console.error("Teacher attendance error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/teacher/homework:
 *   get:
 *     summary: Homework created by this teacher
 *     tags: [Teacher App]
 *   post:
 *     summary: Assign homework to a class/section
 *     tags: [Teacher App]
 */
app.get('/api/teacher/homework', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const homework = await Homework.find({
            schoolId: teacher.schoolId,
            createdById: teacher._id
        }).sort({ createdAt: -1 });
        res.json(homework);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.post('/api/teacher/homework', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { className, sectionName, subject, title, description, dueDate, attachments } = req.body;
        if (!className) return res.status(400).json({ error: "Class is required" });
        if (!title?.trim()) return res.status(400).json({ error: "Title is required" });

        const homework = await Homework.create({
            schoolId: teacher.schoolId,
            className,
            sectionName: sectionName || 'All',
            subject: subject?.trim() || '',
            title: title.trim(),
            description: description?.trim() || '',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            attachments: Array.isArray(attachments) ? attachments : [],
            createdByRole: 'teacher',
            createdById: teacher._id,
            createdByName: teacher.fullName
        });
        res.status(201).json(homework);
    } catch (err) {
        console.error("Teacher homework error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/teacher/change-password:
 *   post:
 *     summary: Change the logged-in teacher's password
 *     tags: [Teacher App]
 */
app.post('/api/teacher/change-password', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: "Password too short" });
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(newPassword, salt);
        teacher.isPasswordChanged = true;
        await teacher.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});


if (!process.env.NETLIFY) {
    app.listen(PORT, () => console.log(`🚀 LOCAL Scoolg Backend running on http://localhost:${PORT}`));
}

export default app;
