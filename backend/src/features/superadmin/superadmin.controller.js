import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { School } from '../../../models/School.js';
import { Student } from '../../../models/Student.js';
import { Teacher } from '../../../models/Teacher.js';
import { ClassModel } from '../../../models/Class.js';
import { Section } from '../../../models/Section.js';
import { Attendance } from '../../../models/Attendance.js';
import { Homework } from '../../../models/Homework.js';
import { CalendarEvent } from '../../../models/CalendarEvent.js';
import { Subject } from '../../../models/Subject.js';
import { Timetable } from '../../../models/Timetable.js';
import { StaffUser } from '../../../models/StaffUser.js';
import { transporter, esc, renderEmail } from '../../utils/email.js';

// --- Super-admin login. A single platform-level account, credentials from env
// (SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD) — never hardcoded in source. Issues a
// JWT with type:'superadmin' which superAdminGuard requires for every route. ---
export const postSuperadminLogin = async (req, res) => {
    try {
        const email = String(req.body.email || '').toLowerCase().trim();
        const password = String(req.body.password || '');
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        const SA_EMAIL = String(process.env.SUPERADMIN_EMAIL || 'scoolg.dev@gmail.com').toLowerCase().trim();
        const SA_PASSWORD = process.env.SUPERADMIN_PASSWORD;

        // Fail-closed: if no password is configured on the server, nobody gets in.
        if (!SA_PASSWORD) {
            console.error("SUPERADMIN_PASSWORD is not set — super-admin login disabled.");
            return res.status(503).json({ error: "Super-admin login is not configured." });
        }
        if (email !== SA_EMAIL || password !== SA_PASSWORD) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { email, type: 'superadmin' },
            process.env.JWT_SECRET || 'scoolg_secret_99',
            { expiresIn: '30d' }
        );
        res.json({ token, email });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};

// Full per-school operational data for the super-admin drill-down ("see each
// school's own students/teachers/classes/attendance in one place").
export const getSuperadminSchoolByIdOverview = async (req, res) => {
    try {
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });
        const sid = school._id;
        const [students, teachers, classes, sections, attendances, homeworks, calendarEvents] = await Promise.all([
            Student.find({ schoolId: sid }).select('firstName lastName studentAppId class section rollNumber gender status profileImageUrl').sort({ class: 1, section: 1, rollNumber: 1 }).lean(),
            Teacher.find({ schoolId: sid }).select('fullName teacherAppId email phone status profileImageUrl').sort({ fullName: 1 }).lean(),
            ClassModel.find({ schoolId: sid }).select('className subjects').sort({ className: 1 }).lean(),
            Section.find({ schoolId: sid }).select('sectionName classId').lean(),
            Attendance.countDocuments({ schoolId: sid }),
            Homework.countDocuments({ schoolId: sid }),
            CalendarEvent.countDocuments({ schoolId: sid }),
        ]);
        res.json({
            school: { id: school.id, name: school.formData?.schoolName, email: school.email, campusCode: school.campusCode, status: school.status },
            counts: { students: students.length, teachers: teachers.length, classes: classes.length, sections: sections.length, attendances, homeworks, calendarEvents },
            students, teachers, classes,
        });
    } catch (err) {
        console.error("School overview error:", err);
        res.status(500).json({ error: "Failed to load school data" });
    }
};

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
        const sid = school._id;

        // Cascade: remove every collection that belongs to this school so no
        // orphaned records are left behind.
        await Promise.all([
            Student.deleteMany({ schoolId: sid }),
            Teacher.deleteMany({ schoolId: sid }),
            ClassModel.deleteMany({ schoolId: sid }),
            Section.deleteMany({ schoolId: sid }),
            Subject.deleteMany({ schoolId: sid }),
            Attendance.deleteMany({ schoolId: sid }),
            Homework.deleteMany({ schoolId: sid }),
            CalendarEvent.deleteMany({ schoolId: sid }),
            Timetable.deleteMany({ schoolId: sid }),
            StaffUser.deleteMany({ schoolId: sid }),
        ]);

        // Delete the school itself
        await School.deleteOne({ id: schoolId });

        res.json({ message: "School and all associated data deleted successfully." });
    } catch (err) {
        console.error("❌ Delete error:", err);
        res.status(500).json({ error: "Failed to delete school" });
    }
};
