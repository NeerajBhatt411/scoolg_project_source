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
        const raw = String(studentAppId).trim();
        let student = await Student.findOne({ studentAppId: raw.toUpperCase() });
        if (!student) {
            const esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            student = await Student.findOne({ studentAppId: { $regex: `^${esc}$`, $options: 'i' } });
        }
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
    return Student.findById(decoded.id).select('schoolId firstName lastName class section').lean();
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
        const text = (req.body?.text || '').trim();
        if (!text) return res.status(400).json({ error: "Message text required" });

        const name = [student.firstName, student.lastName].filter(Boolean).join(' ');
        const msg = await Message.create({
            schoolId: student.schoolId,
            studentId: student._id,
            from: 'parent',
            senderName: name,
            text,
            readByParent: true,
        });

        res.status(201).json(msg);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
};
