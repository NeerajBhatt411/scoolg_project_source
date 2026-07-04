import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { School } from '../../../models/School.js';
import { Timetable } from '../../../models/Timetable.js';
import { Student } from '../../../models/Student.js';
import { Attendance } from '../../../models/Attendance.js';
import { Homework } from '../../../models/Homework.js';
import { CalendarEvent } from '../../../models/CalendarEvent.js';
import { Message } from '../../../models/Message.js';
import { Teacher } from '../../../models/Teacher.js';
import { DeviceToken } from '../../../models/DeviceToken.js';
import { sendToTokens } from '../../utils/push.js';
import { mintCustomToken, sendChatMessage, markChatRead } from '../../utils/firebaseChat.js';
import { sendResetOtpEmail, maskEmail } from '../../utils/email.js';

// Case-insensitive Student ID lookup (exact upper first, regex fallback for legacy ids).
const findStudentByAppId = async (raw) => {
    const id = String(raw || '').trim();
    let student = await Student.findOne({ studentAppId: id.toUpperCase() });
    if (!student) {
        const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        student = await Student.findOne({ studentAppId: { $regex: `^${esc}$`, $options: 'i' } });
    }
    return student;
};

export const getStudentVerifycampusByCode = async (req, res) => {
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
};

export const postStudentLogin = async (req, res) => {
    try {
        let { studentAppId, password } = req.body;
        if (!studentAppId || !password) return res.status(400).json({ error: "ID & Password required" });
        
        // Case-insensitive lookup: fast exact match for new (GAJ001) + numeric ids,
        // then a case-insensitive fallback so any legacy lowercase id still logs in.
        const student = await findStudentByAppId(studentAppId);
        if (!student) return res.status(401).json({ error: "Invalid ID or Password" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid ID or Password" });

        // Block students who have left the school (matches teacher-login behaviour).
        if (student.status && student.status !== 'Active') {
            return res.status(403).json({ error: "This account is inactive. Please contact your school." });
        }

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

        res.json({ accessToken, refreshToken, studentId: student._id, isPasswordChanged: student.isPasswordChanged });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Change the logged-in student's password (used by the forced first-login screen
// and the voluntary "change password" in Profile). Sets isPasswordChanged = true.
export const postStudentChangepassword = async (req, res) => {
    try {
        const token = (req.headers.authorization || '').split(' ')[1];
        if (!token) return res.status(401).json({ error: "No token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');
        const student = await Student.findById(decoded.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
        // If a current password is supplied (voluntary change), verify it.
        if (currentPassword) {
            const ok = await bcrypt.compare(currentPassword, student.password);
            if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        student.isPasswordChanged = true;
        student.tempPassword = undefined; // admin can no longer see it once changed
        await student.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Forgot password — student enters their Student ID; a 6-digit code is emailed to
// the parentEmail on file. Generic response so we don't reveal which ids exist.
export const postStudentForgotpassword = async (req, res) => {
    try {
        const { studentAppId } = req.body;
        if (!studentAppId) return res.status(400).json({ error: "Student ID is required" });

        const student = await findStudentByAppId(studentAppId);
        const generic = { message: "If this Student ID has a parent email on file, a reset code has been sent there." };
        if (!student) return res.json(generic);
        if (!student.parentEmail) {
            return res.status(200).json({ needsAdmin: true, message: "No parent email is on file for this account. Please ask your school admin to reset your password." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        student.resetOtp = otp;
        student.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await student.save();

        try {
            await sendResetOtpEmail({ to: student.parentEmail, otp, appName: 'Scoolg Student App' });
            console.log(`✅ Student reset OTP sent for ${student.studentAppId}`);
        } catch (mailErr) {
            console.error("❌ Student reset email failed:", mailErr.message);
            return res.status(500).json({ error: "Could not send reset email. Please try again later." });
        }
        return res.json({ ...generic, sentTo: maskEmail(student.parentEmail) });
    } catch (err) {
        console.error("Student forgot password error:", err);
        return res.status(500).json({ error: "Could not process request" });
    }
};

// Reset password using the emailed OTP.
export const postStudentResetpassword = async (req, res) => {
    try {
        let { studentAppId, otp, newPassword } = req.body;
        if (!studentAppId || !otp || !newPassword) {
            return res.status(400).json({ error: "Student ID, code and new password are required" });
        }
        if (newPassword.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });

        const student = await findStudentByAppId(studentAppId);
        otp = String(otp).trim();
        if (!student || !student.resetOtp) return res.status(400).json({ error: "Invalid or expired reset code" });
        if (student.resetOtp !== otp) return res.status(400).json({ error: "Invalid reset code" });
        if (!student.resetOtpExpires || student.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
        }

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        student.isPasswordChanged = true;
        student.tempPassword = undefined; // admin can no longer see it once changed
        student.resetOtp = undefined;
        student.resetOtpExpires = undefined;
        await student.save();
        return res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        console.error("Student reset password error:", err);
        return res.status(500).json({ error: "Could not reset password" });
    }
};

export const postAuthRefresh = async (req, res) => {
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
};

export const getStudentMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id).select('-password').lean();
        if (!student) return res.status(404).json({ error: "Student not found" });

        const school = await School.findOne({ _id: student.schoolId }).lean();

        res.json({
            student,
            school: school ? {
                name: school.formData?.schoolName,
                logo: school.formData?.logo || school.formData?.schoolLogo
            } : null
        });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export const getStudentTimetable = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id).select('schoolId class section').lean();
        if (!student) return res.status(404).json({ error: "Student not found" });

        const timetable = await Timetable.findOne({
            schoolId: student.schoolId,
            className: student.class,
            sectionName: student.section
        }).lean();

        res.json(timetable || { message: "No timetable found" });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const getStudentHomework = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id).select('schoolId class section').lean();
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Homework for the student's exact section OR assigned to "All" sections of the class
        const homework = await Homework.find({
            schoolId: student.schoolId,
            className: student.class,
            status: 'Active',
            $or: [{ sectionName: student.section }, { sectionName: 'All' }]
        }).sort({ dueDate: 1, createdAt: -1 }).lean();

        res.json(homework);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const getStudentAttendance = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id).select('schoolId').lean();
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Find all attendance records for this school where this student is present in the records array
        const attendanceRecords = await Attendance.find({
            schoolId: student.schoolId,
            "records.studentId": student._id
        }).sort({ date: -1 }).select('date records').lean();

        // Map to return only this student's status for each day
        const result = attendanceRecords.map(record => ({
            date: record.date,
            status: record.records.find(r => r.studentId.toString() === student._id.toString())?.status
        }));

        res.json(result);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const getStudentCalendar = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id).select('schoolId').lean();
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Current year onward only — avoids dragging the full multi-year history each call.
        const yearStart = `${new Date().getFullYear()}-01-01`;
        const events = await CalendarEvent.find({ schoolId: student.schoolId, date: { $gte: yearStart } }).sort({ date: 1 }).lean();
        res.json(events);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// --- Parent <-> School GROUP chat (the parent uses the student app) ---
// One group per student. The whole school side (admin + all teachers) and the
// parent share ONE thread keyed by studentId. The member list is display-only.
const studentFromAuth = async (req) => {
    const token = (req.headers.authorization || '').split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');
    return Student.findById(decoded.id).select('schoolId firstName lastName class section chatDisabled').lean();
};

// Members shown in the group (display only): the School Office + every teacher.
export const getStudentChatContacts = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: "Student not found" });
        const school = await School.findById(student.schoolId).select('formData').lean();
        const teachers = await Teacher.find({ schoolId: student.schoolId, status: { $ne: 'Left' } })
            .select('fullName profileImageUrl').lean();

        const unread = await Message.countDocuments({ studentId: student._id, from: { $ne: 'parent' }, readByParent: false });

        const schoolName = school?.formData?.schoolName || 'School';
        const contacts = [
            { type: 'admin', id: 'admin', name: `${schoolName} Office`, role: 'School Admin', avatar: school?.formData?.logo || school?.formData?.schoolLogo || '' },
            ...teachers.map(t => ({ type: 'teacher', id: String(t._id), name: t.fullName, role: 'Teacher', avatar: t.profileImageUrl || '' })),
        ];
        res.json({
            group: { name: schoolName, logo: school?.formData?.logo || school?.formData?.schoolLogo || '', memberCount: contacts.length },
            contacts,
            unread,
        });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// The whole group thread for this student.
export const getStudentMessages = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: "Student not found" });
        const filter = { studentId: student._id };
        const messages = await Message.find(filter).sort({ createdAt: 1 }).lean();
        await Message.updateMany({ ...filter, from: { $ne: 'parent' }, readByParent: false }, { readByParent: true });
        res.json({ messages });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const postStudentMessage = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: "Student not found" });
        if (student.chatDisabled) return res.status(403).json({ error: "Messaging has been turned off by the school.", chatDisabled: true });
        const text = (req.body?.text || '').trim();
        if (!text) return res.status(400).json({ error: "Message text required" });

        const name = [student.firstName, student.lastName].filter(Boolean).join(' ');
        const classSection = `${student.class || ''}${student.section ? ' - ' + student.section : ''}`;
        await sendChatMessage({
            schoolId: String(student.schoolId),
            studentId: String(student._id),
            studentName: name,
            classSection,
            from: 'parent',
            senderName: name,
            text,
            bump: 'school', // the school side gets a new-message badge
        });

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('[student chat] send failed:', err.message);
        res.status(500).json({ error: "Failed to send message" });
    }
};

// Mint a Firebase custom token so the parent app can sign in and READ its own
// group chat in realtime (security rules scope reads by these claims).
export const getStudentFirebaseToken = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: "Student not found" });
        const name = [student.firstName, student.lastName].filter(Boolean).join(' ');
        const token = mintCustomToken(`p_${student._id}`, {
            role: 'parent',
            schoolId: String(student.schoolId),
            studentId: String(student._id),
        });
        res.json({ token, studentId: String(student._id), schoolId: String(student.schoolId), name });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Parent opened the chat -> clear the parent's unread counter.
export const postStudentChatRead = async (req, res) => {
    try {
        const student = await studentFromAuth(req);
        if (!student) return res.status(404).json({ error: "Student not found" });
        await markChatRead({ studentId: String(student._id), side: 'parent' });
        res.json({ ok: true });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};
