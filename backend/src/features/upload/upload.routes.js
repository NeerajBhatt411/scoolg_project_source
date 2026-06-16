import { Router } from 'express';
import * as c from './upload.controller.js';

const router = Router();

// --- File Upload API (base64 -> Cloudinary) ---
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a base64 file to Cloudinary and get back a URL
 *     tags: [Utility]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, description: "data:<mime>;base64,... string" }
 *               folder: { type: string }
 *               schoolName: { type: string }
 *     responses:
 *       200:
 *         description: Upload success, returns { url }
 */
router.post('/api/upload', c.postUpload);

export default router;
