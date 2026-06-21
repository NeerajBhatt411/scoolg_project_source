import bcrypt from 'bcryptjs';
import { School } from '../../../models/School.js';
import { transporter, renderEmail } from '../../utils/email.js';
import { slugify } from '../../utils/slug.js';
import { registerSchoolDomain } from '../../utils/vercel.js';

// OTP is persisted on the School document (otp + otpExpires) — required because
// the backend runs on stateless serverless functions where in-memory state does
// not survive between requests.
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const postOnboardingStart = async (req, res) => {
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
                from: `"Scoolg" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: `${otp} is your Scoolg verification code`,
                text: `Welcome to Scoolg! Your 6-digit verification code is: ${otp}. It expires in 10 minutes.`,
                html: renderEmail({
                    heading: 'Verify your email',
                    preheader: `Your Scoolg verification code is ${otp}`,
                    intro: "Welcome to Scoolg! Use the code below to verify your email and continue setting up your school.",
                    code: otp,
                    codeCaption: 'This code expires in 10 minutes.',
                    note: "If you didn't start a Scoolg sign-up, you can safely ignore this email.",
                })
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
                otpExpires: Date.now() + OTP_TTL_MS,
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
            school.otpExpires = Date.now() + OTP_TTL_MS;
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
};

export const postOnboardingVerify = async (req, res) => {
    let { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required." });
    email = email.toLowerCase().trim();
    try {
        const school = await School.findOne({ email });
        if (!school || !school.otp || String(school.otp) !== String(otp).trim()) {
            return res.status(401).json({ error: "Invalid OTP." });
        }
        if (school.otpExpires && Date.now() > school.otpExpires) {
            return res.status(401).json({ error: "OTP expired. Please resend the code." });
        }
        // One-time use: consume the OTP on success.
        school.otp = null;
        school.otpExpires = null;
        await school.save();
        return res.json({ message: "Verified!" });
    } catch (err) {
        return res.status(500).json({ error: "Server Error", details: err.message });
    }
};

export const patchOnboardingUpdateById = async (req, res) => {
    const { id } = req.params;
    const { formData, currentStep } = req.body;

    try {
        const school = await School.findOne({ id });
        if (!school) return res.status(404).json({ error: "Profile not found" });

        school.formData = { ...school.formData, ...formData };
        if (currentStep) school.currentStep = currentStep;

        // Auto-generate a unique public-website slug from the school name (once).
        if (!school.slug && school.formData?.schoolName) {
            const base = slugify(school.formData.schoolName);
            if (base) {
                let candidate = base, n = 1;
                while (await School.findOne({ slug: candidate, id: { $ne: school.id } })) {
                    candidate = `${base}-${++n}`;
                }
                school.slug = candidate;
            }
        }

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

        // On final completion, auto-register the public website subdomain on
        // Vercel (e.g. gajera.scoolg.com). Never throws — onboarding is unaffected.
        let website = null;
        if (currentStep === 8 && school.slug) {
            await registerSchoolDomain(school.slug);
            website = `${school.slug}.${process.env.SITE_ROOT_DOMAIN || 'scoolg.com'}`;
        }

        res.json({
            message: "Saved!",
            data: school,
            password: generatedPassword,
            website
        });
    } catch (err) {
        console.error("❌ Update error:", err);
        res.status(500).json({ error: "Update failed" });
    }
};

export const getOnboardingById = async (req, res) => {
    const { id } = req.params;
    const school = await School.findOne({ id });
    if (!school) return res.status(404).json({ error: "Not found" });
    res.json(school.formData);
};
