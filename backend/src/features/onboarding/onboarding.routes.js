import { Router } from 'express';
import * as c from './onboarding.controller.js';

const router = Router();

/**
 * @swagger
 * /api/onboarding/start:
 *   post:
 *     summary: Start school onboarding with OTP
 *     tags: [Public - Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email
 */
router.post('/api/onboarding/start', c.postOnboardingStart);

/**
 * @swagger
 * /api/onboarding/verify:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Public - Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verified successfully
 */
router.post('/api/onboarding/verify', c.postOnboardingVerify);

router.patch('/api/onboarding/update/:id', c.patchOnboardingUpdateById);

router.get('/api/onboarding/:id', c.getOnboardingById);

export default router;
