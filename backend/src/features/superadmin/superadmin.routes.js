import { Router } from 'express';
import * as c from './superadmin.controller.js';

const router = Router();

// Public: super-admin login (issues the token every other route requires).
router.post('/api/superadmin/login', c.postSuperadminLogin);

/**
 * @swagger
 * /api/superadmin/dashboard:
 *   get:
 *     summary: Get Super Admin dashboard stats
 *     tags: [Super Admin]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/api/superadmin/dashboard', c.getSuperadminDashboard);

/**
 * @swagger
 * /api/superadmin/schools:
 *   get:
 *     summary: List all schools for Super Admin
 *     tags: [Super Admin]
 *     responses:
 *       200:
 *         description: List of schools
 */
router.get('/api/superadmin/schools', c.getSuperadminSchools);

// Full operational data for one school (students/teachers/classes/counts).
router.get('/api/superadmin/schools/:id/overview', c.getSuperadminSchoolByIdOverview);

/**
 * @swagger
 * /api/superadmin/schools/{id}/approve:
 *   post:
 *     summary: Approve a pending school registration
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School approved successfully
 */
router.post('/api/superadmin/schools/:id/approve', c.postSuperadminSchoolsByIdApprove);

/**
 * @swagger
 * /api/superadmin/schools/{id}/status:
 *   patch:
 *     summary: Update school status (ACTIVE, SUSPENDED, etc.)
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/api/superadmin/schools/:id/status', c.patchSuperadminSchoolsByIdStatus);

/**
 * @swagger
 * /api/superadmin/schools/{id}:
 *   delete:
 *     summary: Permanently delete a school and its data
 *     tags: [Super Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School deleted
 */
router.delete('/api/superadmin/schools/:id', c.deleteSuperadminSchoolsById);

export default router;
