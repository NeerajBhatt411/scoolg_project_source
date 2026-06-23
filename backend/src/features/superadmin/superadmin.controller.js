import bcrypt from 'bcryptjs';
import { School } from '../../../models/School.js';
import { Student } from '../../../models/Student.js';
import { transporter, esc, renderEmail } from '../../utils/email.js';

export const getSuperadminDashboard = async (req, res) => {
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
};

export const getSuperadminSchools = async (req, res) => {
    try {
        // Never expose secrets (password hash, OTP codes) to the client.
        const schools = await School.find()
            .select('-password -otp -otpExpires -resetOtp -resetOtpExpires')
            .sort({ createdAt: -1 })
            .lean();
        res.json(schools);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch schools" });
    }
};

export const postSuperadminSchoolsByIdApprove = async (req, res) => {
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
                from: `"Scoolg" <${process.env.GMAIL_USER}>`,
                to: school.email,
                subject: "🎉 Your Scoolg account is approved",
                text: `Congratulations! Your school has been approved. Your Campus Code is: ${school.campusCode}. Log in to your admin panel to get started.`,
                html: renderEmail({
                    heading: 'Your account is approved 🎉',
                    preheader: `Welcome aboard! Your campus code is ${school.campusCode}`,
                    intro: `Congratulations! <b>${esc(school.formData?.schoolName || 'Your school')}</b> has been approved on Scoolg. Here is your campus code — keep it handy for app logins.`,
                    code: school.campusCode,
                    codeCaption: 'Your campus code',
                    note: "Sign in to your admin panel to set up classes, teachers and students.",
                })
            });
        } catch (err) {
            console.error("Warning: Could not send approval email", err.message);
        }

        res.json({ message: "School approved successfully", school });
    } catch (err) {
        res.status(500).json({ error: "Failed to approve school" });
    }
};

export const patchSuperadminSchoolsByIdStatus = async (req, res) => {
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
};

export const deleteSuperadminSchoolsById = async (req, res) => {
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
};
