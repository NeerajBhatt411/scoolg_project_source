import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { School } from '../../../models/School.js';
import { ClassModel } from '../../../models/Class.js';
import { Section } from '../../../models/Section.js';
import { Timetable } from '../../../models/Timetable.js';
import { Teacher } from '../../../models/Teacher.js';
import { Student } from '../../../models/Student.js';
import { Attendance } from '../../../models/Attendance.js';
import { Homework } from '../../../models/Homework.js';
import { CalendarEvent } from '../../../models/CalendarEvent.js';
import { TeacherDiary } from '../../../models/TeacherDiary.js';
import { Message } from '../../../models/Message.js';
import { DeviceToken } from '../../../models/DeviceToken.js';
import { notifyClassStudents, notify, sendToTokens } from '../../utils/push.js';
import { teacherFromToken } from '../../utils/teacherAuth.js';
import { mintCustomToken, sendChatMessage, markChatRead } from '../../utils/firebaseChat.js';
import { sendResetOtpEmail, maskEmail } from '../../utils/email.js';

export const getTeacherDiary = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const entries = await TeacherDiary.find({ teacherId: teacher._id }).sort({ date: -1, createdAt: -1 }).limit(200);
        res.json(entries);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const postTeacherDiary = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { date, className, sectionName, subject, note } = req.body;
        if (!date || !className || !note?.trim()) {
            return res.status(400).json({ error: "Date, class and note are required" });
        }
        const entry = new TeacherDiary({
            schoolId: teacher.schoolId, teacherId: teacher._id, date, className,
            sectionName: sectionName || 'All', subject: subject || '', note: note.trim(),
            createdByRole: 'teacher',
        });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const postTeacherDiaryByIdLock = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const entry = await TeacherDiary.findById(req.params.id);
        if (!entry || entry.teacherId.toString() !== teacher._id.toString()) {
            return res.status(404).json({ error: "Entry not found" });
        }
        entry.locked = true;
        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const deleteTeacherDiaryById = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const entry = await TeacherDiary.findById(req.params.id);
        if (!entry || entry.teacherId.toString() !== teacher._id.toString()) {
            return res.status(404).json({ error: "Entry not found" });
        }
        if (entry.locked) return res.status(400).json({ error: "Locked entries can't be deleted" });
        await entry.deleteOne();
        res.json({ message: "Entry deleted" });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const postTeacherLogin = async (req, res) => {
    try {
        let { teacherAppId, password } = req.body;
        if (!teacherAppId || !password) return res.status(400).json({ error: "Teacher ID & Password required" });
        teacherAppId = String(teacherAppId).trim();

        // Allow login by Teacher ID (case-insensitive, e.g. GAJT01) or email.
        const teacher = await Teacher.findOne({
            $or: [{ teacherAppId: teacherAppId.toUpperCase() }, { email: teacherAppId.toLowerCase() }]
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
            { expiresIn: '30d' }
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
};

export const getTeacherMe = async (req, res) => {
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
};

export const getTeacherTimetable = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const tid = teacher._id.toString();
        // Only the timetables this teacher actually appears in (not the whole school's).
        const timetables = await Timetable.find({ schoolId: teacher.schoolId, 'schedule.periods.teacherId': teacher._id }).lean();

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
};

export const getTeacherMyclasses = async (req, res) => {
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
        const timetables = await Timetable.find({ schoolId: teacher.schoolId, 'schedule.periods.teacherId': teacher._id }).lean();
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
};

export const getTeacherStudents = async (req, res) => {
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
};

export const getTeacherEvents = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const today = new Date().toISOString().split('T')[0];
        const events = await CalendarEvent.find({ schoolId: teacher.schoolId, date: { $gte: today } })
            .sort({ date: 1 })
            .limit(Number(req.query.limit) || 6);
        res.json(events);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const getTeacherAttendance = async (req, res) => {
    try {
        await teacherFromToken(req);
        const { sectionId, date } = req.query;
        const attendance = await Attendance.findOne({ sectionId, date });
        res.json(attendance || { records: [] });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const postTeacherAttendance = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { classId, sectionId, date, records } = req.body;
        if (!sectionId || !date) return res.status(400).json({ error: "Section and date required" });

        const attendance = await Attendance.findOneAndUpdate(
            { sectionId, date },
            { schoolId: teacher.schoolId, classId, sectionId, date, records, markedBy: teacher._id },
            { new: true, upsert: true }
        );

        // 🔔 notify students marked absent
        try {
            const absent = (records || []).filter(r => r.status === 'A').map(r => ({ userId: r.studentId }));
            if (absent.length) await notify({ schoolId: String(teacher.schoolId), toRole: 'student', recipients: absent, title: '🟠 Marked absent today', body: `You were marked absent on ${date}.`, type: 'attendance', data: { link: '/attendance' } });
        } catch (e) { console.error('[teacher attendance] push failed:', e.message); }

        res.json(attendance);
    } catch (err) {
        console.error("Teacher attendance error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getTeacherHomework = async (req, res) => {
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
};

export const postTeacherHomework = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { className, sectionName, subject, title, description, dueDate, attachments } = req.body;
        if (!className) return res.status(400).json({ error: "Class is required" });
        if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
        if (!dueDate) return res.status(400).json({ error: "Due date is required" });

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

        // 🔔 notify the class's students
        try {
            await notifyClassStudents({
                schoolObjId: teacher.schoolId,
                className,
                sectionName: homework.sectionName,
                title: `📚 New homework${subject ? ' · ' + subject : ''}`,
                body: `${homework.title} — Class ${className}${homework.sectionName && homework.sectionName !== 'All' ? '-' + homework.sectionName : ''}`,
                data: { link: '/homework' },
            });
        } catch (e) { console.error('[teacher homework] push failed:', e.message); }

        res.status(201).json(homework);
    } catch (err) {
        console.error("Teacher homework error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const postTeacherChangepassword = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: "Password too short" });
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(newPassword, salt);
        teacher.isPasswordChanged = true;
        teacher.tempPassword = undefined; // admin can no longer see it once changed
        await teacher.save();
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Forgot password — teacher enters their Teacher ID or email; a 6-digit code is
// emailed to the teacher's email on file. Generic response to avoid leaking ids.
export const postTeacherForgotpassword = async (req, res) => {
    try {
        const { teacherAppId } = req.body;
        if (!teacherAppId) return res.status(400).json({ error: "Teacher ID or email is required" });
        const id = String(teacherAppId).trim();
        const teacher = await Teacher.findOne({
            $or: [{ teacherAppId: id.toUpperCase() }, { email: id.toLowerCase() }]
        });
        const generic = { message: "If an account matches, a reset code has been sent to its email." };
        if (!teacher) return res.json(generic);
        if (teacher.status && teacher.status !== 'Active') return res.json(generic);
        if (!teacher.email) {
            return res.status(200).json({ needsAdmin: true, message: "No email is on file for this account. Please ask your school admin to reset your password." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        teacher.resetOtp = otp;
        teacher.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await teacher.save();

        try {
            await sendResetOtpEmail({ to: teacher.email, otp, appName: 'Scoolg Teacher App' });
            console.log(`✅ Teacher reset OTP sent for ${teacher.teacherAppId}`);
        } catch (mailErr) {
            console.error("❌ Teacher reset email failed:", mailErr.message);
            return res.status(500).json({ error: "Could not send reset email. Please try again later." });
        }
        return res.json({ ...generic, sentTo: maskEmail(teacher.email) });
    } catch (err) {
        console.error("Teacher forgot password error:", err);
        return res.status(500).json({ error: "Could not process request" });
    }
};

// Reset password using the emailed OTP.
export const postTeacherResetpassword = async (req, res) => {
    try {
        let { teacherAppId, otp, newPassword } = req.body;
        if (!teacherAppId || !otp || !newPassword) {
            return res.status(400).json({ error: "Teacher ID, code and new password are required" });
        }
        if (newPassword.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
        const id = String(teacherAppId).trim();
        const teacher = await Teacher.findOne({
            $or: [{ teacherAppId: id.toUpperCase() }, { email: id.toLowerCase() }]
        });
        otp = String(otp).trim();
        if (!teacher || !teacher.resetOtp) return res.status(400).json({ error: "Invalid or expired reset code" });
        if (teacher.resetOtp !== otp) return res.status(400).json({ error: "Invalid reset code" });
        if (!teacher.resetOtpExpires || teacher.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
        }

        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(newPassword, salt);
        teacher.isPasswordChanged = true;
        teacher.tempPassword = undefined; // admin can no longer see it once changed
        teacher.resetOtp = undefined;
        teacher.resetOtpExpires = undefined;
        await teacher.save();
        return res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        console.error("Teacher reset password error:", err);
        return res.status(500).json({ error: "Could not reset password" });
    }
};

// --- Teacher <-> Parent GROUP chat ---
// Every teacher is a member of every student's group, so a teacher sees all of
// the school's parent groups that have messages and posts into the shared thread.
export const getTeacherChats = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const msgs = await Message.find({ schoolId: teacher.schoolId }).sort({ createdAt: -1 }).lean();
        const byStudent = new Map();
        for (const m of msgs) {
            const key = String(m.studentId);
            if (!byStudent.has(key)) byStudent.set(key, { studentId: key, lastMessage: m.text, lastFrom: m.from, lastSenderName: m.senderName || '', lastAt: m.createdAt, unread: 0 });
            if (m.from === 'parent' && !m.readBySchool) byStudent.get(key).unread++;
        }
        const convos = [...byStudent.values()];
        const students = await Student.find({ _id: { $in: convos.map(c => c.studentId) } }).select('firstName lastName class section profileImageUrl').lean();
        const sMap = {}; students.forEach(s => { sMap[String(s._id)] = s; });
        convos.forEach(c => {
            const s = sMap[c.studentId];
            c.studentName = s ? [s.firstName, s.lastName].filter(Boolean).join(' ') : 'Student';
            c.classSection = s ? `${s.class || ''}${s.section ? ' - ' + s.section : ''}` : '';
            c.avatar = s?.profileImageUrl || '';
        });
        res.json({ conversations: convos });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const getTeacherChatThread = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { studentId } = req.params;
        const filter = { schoolId: teacher.schoolId, studentId };
        const messages = await Message.find(filter).sort({ createdAt: 1 }).lean();
        await Message.updateMany({ ...filter, from: 'parent', readBySchool: false }, { readBySchool: true });
        res.json({ messages, me: String(teacher._id) });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

export const postTeacherChatMessage = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const { studentId } = req.params;
        const text = (req.body?.text || '').trim();
        if (!text) return res.status(400).json({ error: "Message text required" });

        const student = await Student.findById(studentId).select('firstName lastName class section schoolId').lean();
        const studentName = student ? [student.firstName, student.lastName].filter(Boolean).join(' ') : '';
        const classSection = student ? `${student.class || ''}${student.section ? ' - ' + student.section : ''}` : '';

        await sendChatMessage({
            schoolId: String(teacher.schoolId),
            studentId: String(studentId),
            studentName, classSection,
            from: 'teacher',
            senderName: teacher.fullName || 'Teacher',
            senderId: teacher._id,
            text,
            bump: 'parent',
        });

        try {
            const toks = await DeviceToken.find({ role: 'student', userId: String(studentId) }).select('token').lean();
            if (toks.length) sendToTokens(toks.map(t => t.token), { title: `💬 ${teacher.fullName || 'Your teacher'}`, body: text.slice(0, 80), data: { link: '/chat' } });
        } catch (e) { /* best-effort */ }
        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('[teacher chat] send failed:', err.message);
        res.status(500).json({ error: "Failed to send message" });
    }
};

// Firebase custom token so the teacher app can read the school's chats in realtime.
export const getTeacherFirebaseToken = async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const token = mintCustomToken(`t_${teacher._id}`, {
            role: 'teacher',
            schoolId: String(teacher.schoolId),
            teacherId: String(teacher._id),
        });
        res.json({ token, teacherId: String(teacher._id), schoolId: String(teacher.schoolId), name: teacher.fullName || 'Teacher' });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Teacher opened a thread -> clear the school-side unread.
export const postTeacherChatRead = async (req, res) => {
    try {
        await teacherFromToken(req);
        await markChatRead({ studentId: String(req.params.studentId), side: 'school' });
        res.json({ ok: true });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};
