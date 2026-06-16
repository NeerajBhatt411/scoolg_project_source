import { Router } from 'express';
import * as c from './timetable.controller.js';

const router = Router();

// --- Timetable API ---
/**
 * @swagger
 * /api/admin/timetable:
 *   get:
 *     summary: Fetch timetable for a class/section
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *       - in: query
 *         name: className
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectionName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timetable object
 */
router.get('/api/admin/timetable', c.getAdminTimetable);

// All timetables for a school (for the full class-wise/section-wise report export).
router.get('/api/admin/timetables', c.getAdminTimetables);

/**
 * @swagger
 * /api/admin/timetable:
 *   post:
 *     summary: Save or update class timetable
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Timetable saved
 */
router.post('/api/admin/timetable', c.postAdminTimetable);

export default router;
