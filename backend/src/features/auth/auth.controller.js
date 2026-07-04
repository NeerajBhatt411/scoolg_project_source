import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { School } from '../../../models/School.js';
import { StaffUser } from '../../../models/StaffUser.js';
import { transporter, renderEmail } from '../../utils/email.js';
import { findAdminAccountByEmail } from '../../utils/adminAuth.js';

export const postAdminLogin = async (req, res) => {
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
                { expiresIn: '30d' }
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
            { expiresIn: '30d' }
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
};

export const postAdminChangepassword = async (req, res) => {
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
};

export const postAdminForgotpassword = async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    email = email.toLowerCase().trim();

    const genericOk = { message: "If an account exists for this email, a reset code has been sent." };

    try {
        const { account, kind } = await findAdminAccountByEmail(email);
        if (!account) return res.json(genericOk); // don't reveal non-existence

        if (kind === 'staff' && account.status !== 'Active') {
            // Inactive staff shouldn't be able to reset into a frozen account.
            return res.json(genericOk);
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        account.resetOtp = otp;
        account.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await account.save();

        try {
            await transporter.sendMail({
                from: `"Scoolg" <${process.env.GMAIL_USER}>`,
                to: email,
                subject: `${otp} is your Scoolg password reset code`,
                text: `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
                html: renderEmail({
                    heading: 'Reset your password',
                    preheader: `Your Scoolg password reset code is ${otp}`,
                    intro: "We received a request to reset your Scoolg admin password. Enter the code below to set a new password.",
                    code: otp,
                    codeCaption: 'This code expires in 10 minutes.',
                    note: "If you didn't request a password reset, you can safely ignore this email — your password stays unchanged.",
                })
            });
            console.log(`✅ Reset OTP sent to ${email}: ${otp}`);
        } catch (mailErr) {
            console.error("❌ Reset email failed:", mailErr.message);
            return res.status(500).json({ error: "Could not send reset email. Please try again later." });
        }

        return res.json(genericOk);
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ error: "Could not process request" });
    }
};

export const postAdminResetpassword = async (req, res) => {
    let { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP and new password are required" });
    }
    email = email.toLowerCase().trim();
    otp = String(otp).trim();
    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        const { account } = await findAdminAccountByEmail(email);
        if (!account || !account.resetOtp) {
            return res.status(400).json({ error: "Invalid or expired reset code" });
        }
        if (account.resetOtp !== otp) {
            return res.status(400).json({ error: "Invalid reset code" });
        }
        if (!account.resetOtpExpires || account.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
        }

        const salt = await bcrypt.genSalt(10);
        account.password = await bcrypt.hash(newPassword, salt);
        account.isPasswordChanged = true;
        account.resetOtp = undefined;
        account.resetOtpExpires = undefined;
        await account.save();

        return res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ error: "Could not reset password" });
    }
};
