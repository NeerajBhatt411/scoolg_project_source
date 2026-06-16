import { Router } from 'express';
import * as c from './attendance.controller.js';

const router = Router();

/**
 * @swagger
 * /api/admin/attendance:
 *   post:
 *     summary: Save or update daily attendance
 *     tags: [Admin - Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               date:
 *                 type: string
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Attendance saved successfully
 */
router.post('/api/admin/attendance', c.postAdminAttendance);

/**
 * @swagger
 * /api/admin/attendance:
 *   get:
 *     summary: Fetch attendance for a specific date
 *     tags: [School Admin - Attendance]
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record
 */
router.get('/api/admin/attendance', c.getAdminAttendance);

/**
 * @swagger
 * /api/admin/student-attendance/{studentId}:
 *   get:
 *     summary: Fetch attendance history for a specific student
 *     tags: [School Admin - Attendance]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student's attendance history
 */
router.get('/api/admin/student-attendance/:studentId', c.getAdminStudentattendanceByStudentId);

/**
 * @swagger
 * /api/admin/attendance/analytics:
 *   get:
 *     summary: Aggregated attendance % trend (daily/weekly/monthly/yearly) + class-wise
 *     tags: [School Admin - Attendance]
 */
router.get('/api/admin/attendance/analytics', c.getAdminAttendanceAnalytics);

export default router;
