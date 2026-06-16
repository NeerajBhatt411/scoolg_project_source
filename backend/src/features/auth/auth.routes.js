import { Router } from 'express';
import * as c from './auth.controller.js';

const router = Router();

// Login
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: School Admin Login (Email/Password)
 *     tags: [Public - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/api/admin/login', c.postAdminLogin);

// Change Password — identity comes from the TOKEN, not the body.
// This prevents a logged-in staff member from accidentally overwriting the
// school owner's password (the old code always changed School.password).
router.post('/api/admin/change-password', c.postAdminChangepassword);

router.post('/api/admin/forgot-password', c.postAdminForgotpassword);

/**
 * Reset Password — verify the emailed code and set a new password.
 */
router.post('/api/admin/reset-password', c.postAdminResetpassword);

export default router;
