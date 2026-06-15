import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { School } from '../../models/School.js';
import { ClassModel } from '../../models/Class.js';
import { Section } from '../../models/Section.js';
import { Timetable } from '../../models/Timetable.js';
import { Teacher } from '../../models/Teacher.js';
import { Student } from '../../models/Student.js';
import { Attendance } from '../../models/Attendance.js';
import { Homework } from '../../models/Homework.js';
import { CalendarEvent } from '../../models/CalendarEvent.js';
import { TeacherDiary } from '../../models/TeacherDiary.js';
import { teacherFromToken } from '../utils/teacherAuth.js';

const router = Router();

// --- Teacher Diary (teacher app) ---
router.get('/api/teacher/diary', async (req, res) => {
    try {
        const teacher = await teacherFromToken(req);
        const entries = await TeacherDiary.find({ teacherId: teacher._id }).sort({ date: -1, createdAt: -1 }).limit(200);
        res.json(entries);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.post('/api/teacher/diary', async (req, res) => {
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
});

// Teacher locks own entry — after this it can't be edited/deleted.
router.post('/api/teacher/diary/:id/lock', async (req, res) => {
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
});

// Teacher deletes own entry — only if not locked.
router.delete('/api/teacher/diary/:id', async (req, res) => {
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
});

/**
 * @swagger
 * /api/teacher/login:
 *   post:
 *     summary: Teacher login (Teacher ID + Password)
 *     tags: [Teacher App]
 */
router.post('/api/teacher/login', async (req, res) => {
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
});

/**
 * @swagger
 * /api/teacher/me:
 *   get:
 *     summary: Logged-in teacher profile + school branding
 *     tags: [Teacher App]
 */
router.get('/api/teacher/me', async (req, res) => {
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
router.get('/api/teacher/timetable', async (req, res) => {
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
router.get('/api/teacher/my-classes', async (req, res) => {
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
router.get('/api/teacher/students', async (req, res) => {
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
 * /api/teacher/events:
 *   get:
 *     summary: Upcoming school-calendar events for the teacher's school
 *     tags: [Teacher App]
 */
router.get('/api/teacher/events', async (req, res) => {
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
router.get('/api/teacher/attendance', async (req, res) => {
    try {
        await teacherFromToken(req);
        const { sectionId, date } = req.query;
        const attendance = await Attendance.findOne({ sectionId, date });
        res.json(attendance || { records: [] });
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.post('/api/teacher/attendance', async (req, res) => {
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
router.get('/api/teacher/homework', async (req, res) => {
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

router.post('/api/teacher/homework', async (req, res) => {
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
router.post('/api/teacher/change-password', async (req, res) => {
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

export default router;
