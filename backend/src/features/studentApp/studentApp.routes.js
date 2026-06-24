import { Router } from 'express';
import * as c from './studentApp.controller.js';

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
router.get('/api/student/verify-campus/:code', c.getStudentVerifycampusByCode);

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
router.post('/api/student/login', c.postStudentLogin);

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
router.post('/api/auth/refresh', c.postAuthRefresh);

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
router.get('/api/student/me', c.getStudentMe);

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
router.get('/api/student/timetable', c.getStudentTimetable);

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
router.get('/api/student/homework', c.getStudentHomework);

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
router.get('/api/student/attendance', c.getStudentAttendance);

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
router.get('/api/student/calendar', c.getStudentCalendar);

// Parent <-> school chat
router.get('/api/student/chat/contacts', c.getStudentChatContacts);
router.get('/api/student/messages', c.getStudentMessages);
router.post('/api/student/messages', c.postStudentMessage);

export default router;
