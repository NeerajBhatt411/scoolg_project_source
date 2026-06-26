import { Router } from 'express';
import * as c from './students.controller.js';

const router = Router();

/**
 * @swagger
 * /api/admin/students:
 *   post:
 *     summary: Add a new student
 *     tags: [Admin - Students]
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
 *               class:
 *                 type: string
 *               section:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student added successfully
 */
router.post('/api/admin/students', c.postAdminStudents);

/**
 * @swagger
 * /api/admin/students/bulk:
 *   post:
 *     summary: Bulk add students
 *     tags: [Admin - Students]
 */
router.post('/api/admin/students/bulk', c.postAdminStudentsBulk);

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Search/List students with filters
 *     tags: [School Admin - Students]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *       - in: query
 *         name: className
 *       - in: query
 *         name: sectionName
 *     responses:
 *       200:
 *         description: Array of students
 */
router.get('/api/admin/students', c.getAdminStudents);

/**
 * @swagger
 * /api/admin/students/{id}:
 *   put:
 *     summary: Update a student's profile or status
 *     tags: [School Admin - Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated student
 */
router.put('/api/admin/students/:id', c.putAdminStudentsById);

/**
 * @swagger
 * /api/admin/students/{id}/reset-password:
 *   post:
 *     summary: Admin resets a student's password to a fresh temporary one
 *     tags: [School Admin - Students]
 */
router.post('/api/admin/students/:id/reset-password', c.postAdminStudentsResetPassword);

// Re-send the current login credentials to the parent's email.
router.post('/api/admin/students/:id/resend-credentials', c.postAdminStudentsResendCredentials);

export default router;
