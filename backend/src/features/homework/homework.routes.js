import { Router } from 'express';
import * as c from './homework.controller.js';

const router = Router();

// --- Homework API ---
/**
 * @swagger
 * /api/admin/homework:
 *   post:
 *     summary: Create a homework/assignment for a class/section
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Homework created
 */
router.post('/api/admin/homework', c.postAdminHomework);

/**
 * @swagger
 * /api/admin/homework:
 *   get:
 *     summary: List homework for a school (filter by class/section)
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema: { type: string }
 *       - in: query
 *         name: className
 *         schema: { type: string }
 *       - in: query
 *         name: sectionName
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of homework
 */
router.get('/api/admin/homework', c.getAdminHomework);

/**
 * @swagger
 * /api/admin/homework/{id}:
 *   patch:
 *     summary: Update a homework entry
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated homework
 */
router.patch('/api/admin/homework/:id', c.patchAdminHomeworkById);

/**
 * @swagger
 * /api/admin/homework/{id}:
 *   delete:
 *     summary: Delete a homework entry
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Homework deleted
 */
router.delete('/api/admin/homework/:id', c.deleteAdminHomeworkById);

export default router;
