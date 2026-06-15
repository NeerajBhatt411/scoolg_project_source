import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { School } from '../../models/School.js';
import { Timetable } from '../../models/Timetable.js';
import { Student } from '../../models/Student.js';
import { Attendance } from '../../models/Attendance.js';
import { Homework } from '../../models/Homework.js';
import { CalendarEvent } from '../../models/CalendarEvent.js';

const router = Router();

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
router.get('/api/student/verify-campus/:code', async (req, res) => {
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
router.post('/api/student/login', async (req, res) => {
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
router.post('/api/auth/refresh', async (req, res) => {
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
router.get('/api/student/me', async (req, res) => {
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
router.get('/api/student/timetable', async (req, res) => {
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
router.get('/api/student/homework', async (req, res) => {
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
router.get('/api/student/attendance', async (req, res) => {
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

/**
 * @swagger
 * /api/student/calendar:
 *   get:
 *     summary: Get Calendar Events
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/api/student/calendar', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'scoolg_secret_99');

        const student = await Student.findById(decoded.id);
        if (!student) return res.status(404).json({ error: "Student not found" });

        const events = await CalendarEvent.find({ schoolId: student.schoolId }).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

export default router;
