import { Router } from 'express';
import * as c from './teachers.controller.js';

const router = Router();

// --- Teachers API (Basic) ---
/**
 * @swagger
 * /api/admin/teachers:
 *   post:
 *     summary: Add a new teacher
 *     tags: [School Admin - Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher added successfully
 */
router.post('/api/admin/teachers', c.postAdminTeachers);

/**
 * @swagger
 * /api/admin/teachers:
 *   get:
 *     summary: List all teachers for a school
 *     tags: [School Admin - Teachers]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of teachers
 */
router.get('/api/admin/teachers', c.getAdminTeachers);

// Update a teacher document (admin edit).
router.patch('/api/admin/teachers/:id', c.patchAdminTeachersById);

// A teacher's weekly schedule (derived from timetables) + the sections they're class-teacher of.
router.get('/api/admin/teachers/:id/schedule', c.getAdminTeachersByIdSchedule);

// List diary entries (filter by teacherId and/or date/className). Newest first.
router.get('/api/admin/teacher-diary', c.getAdminTeacherdiary);

// Create a diary entry (admin filling on behalf, or via teacher app later).
router.post('/api/admin/teacher-diary', c.postAdminTeacherdiary);

// Delete a diary entry.
router.delete('/api/admin/teacher-diary/:id', c.deleteAdminTeacherdiaryById);

export default router;
