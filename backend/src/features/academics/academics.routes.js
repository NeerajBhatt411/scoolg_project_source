import { Router } from 'express';
import * as c from './academics.controller.js';

const router = Router();

// --- Classes API ---
/**
 * @swagger
 * /api/admin/classes:
 *   post:
 *     summary: Create a new academic class
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               className:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created
 */
router.post('/api/admin/classes', c.postAdminClasses);

/**
 * @swagger
 * /api/admin/classes:
 *   get:
 *     summary: List all classes for a school
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of classes
 */
router.get('/api/admin/classes', c.getAdminClasses);

// --- Sections API ---
/**
 * @swagger
 * /api/admin/sections:
 *   post:
 *     summary: Create a new section in a class
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *               sectionName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created
 */
router.post('/api/admin/sections', c.postAdminSections);

/**
 * @swagger
 * /api/admin/sections:
 *   get:
 *     summary: List all sections for a specific class
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of sections
 */
router.get('/api/admin/sections', c.getAdminSections);

// Delete a section.
router.delete('/api/admin/sections/:id', c.deleteAdminSectionsById);

// Update a section (assign class teacher / rename).
router.patch('/api/admin/sections/:id', c.patchAdminSectionsById);

// Update a class (subjects / name / order).
router.patch('/api/admin/classes/:id', c.patchAdminClassesById);

// Rename a class (cascades the new name to students/timetables/homework/diaries).
router.patch('/api/admin/classes/:id/rename', c.patchAdminClassesByIdRename);

// --- Subjects API ---
router.post('/api/admin/subjects', c.postAdminSubjects);

router.get('/api/admin/subjects', c.getAdminSubjects);

export default router;
