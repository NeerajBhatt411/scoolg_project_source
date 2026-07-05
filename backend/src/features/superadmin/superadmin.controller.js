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
import { SupportTicket } from '../../../models/SupportTicket.js';
import { FeeInvoice } from '../../../models/FeeInvoice.js';
import { FeePayment } from '../../../models/FeePayment.js';
import { FeeStructure } from '../../../models/FeeStructure.js';
import { Broadcast } from '../../../models/Broadcast.js';
import { SuperAdminConfig } from '../../../models/SuperAdminConfig.js';
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

        // Password source: a DB hash set from the Settings page takes precedence;
        // the SUPERADMIN_PASSWORD env is the bootstrap credential used until then.
        const cfg = await SuperAdminConfig.findOne({ key: 'default' }).lean();

        // Fail-closed: if neither a stored hash nor an env password exists, nobody gets in.
        if (!cfg?.passwordHash && !SA_PASSWORD) {
            console.error("No super-admin password configured (SUPERADMIN_PASSWORD unset, no stored hash) — login disabled.");
            return res.status(503).json({ error: "Super-admin login is not configured." });
        }

        const passwordOk = cfg?.passwordHash
            ? await bcrypt.compare(password, cfg.passwordHash)
            : password === SA_PASSWORD;

        if (email !== SA_EMAIL || !passwordOk) {
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
            FeeInvoice.deleteMany({ schoolId: sid }),
            FeePayment.deleteMany({ schoolId: sid }),
            FeeStructure.deleteMany({ schoolId: sid }),
        ]);

        // Delete the school itself
        await School.deleteOne({ id: schoolId });

        res.json({ message: "School and all associated data deleted successfully." });
    } catch (err) {
        console.error("❌ Delete error:", err);
        res.status(500).json({ error: "Failed to delete school" });
    }
};

// ---------------------------------------------------------------------------
// Support tickets — schools raise them from the admin panel; the super-admin
// triages, replies, and resolves them here.
// ---------------------------------------------------------------------------
export const getSuperadminSupport = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status && status !== 'ALL' ? { status } : {};
        const tickets = await SupportTicket.find(query)
            .sort({ lastActivityAt: -1, createdAt: -1 })
            .lean();
        res.json(tickets.map((t) => ({ ...t, id: t._id })));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
};

export const getSuperadminSupportById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id).lean();
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        res.json({ ...ticket, id: ticket._id });
    } catch (err) {
        res.status(500).json({ error: "Failed to load ticket" });
    }
};

export const postSuperadminSupportReply = async (req, res) => {
    try {
        const { text } = req.body || {};
        if (!text?.trim()) return res.status(400).json({ error: "Reply text is required" });

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        ticket.replies.push({ from: 'superadmin', authorName: 'Scoolg Team', text: text.trim() });
        if (ticket.status === 'OPEN') ticket.status = 'IN_PROGRESS';
        ticket.lastActivityAt = new Date();
        await ticket.save();

        res.json({ message: "Reply sent", ticket });
    } catch (err) {
        res.status(500).json({ error: "Failed to send reply" });
    }
};

export const patchSuperadminSupportStatus = async (req, res) => {
    try {
        const { status } = req.body || {};
        const allowed = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        ticket.status = status;
        ticket.lastActivityAt = new Date();
        await ticket.save();

        res.json({ message: `Ticket marked ${status}`, ticket });
    } catch (err) {
        res.status(500).json({ error: "Failed to update ticket" });
    }
};

// ---------------------------------------------------------------------------
// Notices — the super-admin broadcasts to all schools or one specific school;
// schools read them in their admin panel inbox.
// ---------------------------------------------------------------------------
export const getSuperadminNotices = async (req, res) => {
    try {
        const notices = await Broadcast.find()
            .sort({ pinned: -1, createdAt: -1 })
            .lean();
        res.json(notices.map((n) => ({
            ...n,
            id: n._id,
            recipient: n.audience === 'ALL' ? 'All schools' : (n.schoolName || n.schoolId || 'One school'),
            reads: Array.isArray(n.readBy) ? n.readBy.length : 0,
        })));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notices" });
    }
};

export const postSuperadminNotices = async (req, res) => {
    try {
        const { audience = 'ALL', schoolId, title, body, type = 'info', pinned = false } = req.body || {};
        if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: "Title and message are required" });

        let schoolName = '';
        let targetSchoolId = '';
        if (audience === 'SCHOOL') {
            if (!schoolId) return res.status(400).json({ error: "Select a school to notify" });
            const school = await School.findOne({ id: schoolId }).lean();
            if (!school) return res.status(404).json({ error: "School not found" });
            targetSchoolId = school.id;
            schoolName = school.formData?.schoolName || '';
        }

        const notice = await Broadcast.create({
            audience: audience === 'SCHOOL' ? 'SCHOOL' : 'ALL',
            schoolId: targetSchoolId,
            schoolName,
            title: title.trim(),
            body: body.trim(),
            type,
            pinned: !!pinned,
        });

        res.status(201).json({ message: "Notice sent", notice });
    } catch (err) {
        res.status(500).json({ error: "Failed to send notice" });
    }
};

export const deleteSuperadminNotices = async (req, res) => {
    try {
        const deleted = await Broadcast.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Notice not found" });
        res.json({ message: "Notice deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete notice" });
    }
};

// ---------------------------------------------------------------------------
// Settings — super-admin account + platform/system status, plus a persisted
// password change (stored hashed in SuperAdminConfig; env stays the fallback).
// ---------------------------------------------------------------------------
export const getSuperadminSettings = async (req, res) => {
    try {
        const cfg = await SuperAdminConfig.findOne({ key: 'default' }).lean();
        const [schools, students, teachers, pending] = await Promise.all([
            School.countDocuments({ status: { $ne: 'PENDING' } }),
            Student.countDocuments(),
            Teacher.countDocuments(),
            School.countDocuments({ status: 'PENDING' }),
        ]);
        res.json({
            email: req.superadmin?.email || String(process.env.SUPERADMIN_EMAIL || 'scoolg.dev@gmail.com'),
            role: 'Super Administrator',
            passwordSource: cfg?.passwordHash ? 'custom' : 'env',
            platform: { schools, students, teachers, pending },
            config: {
                database: true,
                email: !!process.env.GMAIL_USER,
                storage: !!(process.env.AWS_S3_BUCKET || process.env.S3_BUCKET),
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to load settings" });
    }
};

export const postSuperadminChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password are required" });
        if (String(newPassword).length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });

        const cfg = await SuperAdminConfig.findOne({ key: 'default' });
        const SA_PASSWORD = process.env.SUPERADMIN_PASSWORD;

        // Verify the current password against the stored hash, or the env bootstrap.
        const currentOk = cfg?.passwordHash
            ? await bcrypt.compare(currentPassword, cfg.passwordHash)
            : (SA_PASSWORD ? currentPassword === SA_PASSWORD : false);
        if (!currentOk) return res.status(401).json({ error: "Current password is incorrect" });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(String(newPassword), salt);
        await SuperAdminConfig.findOneAndUpdate(
            { key: 'default' },
            { key: 'default', passwordHash },
            { upsert: true, new: true }
        );

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update password" });
    }
};
