import { Router } from 'express';
import * as c from './notifications.controller.js';

const router = Router();

// Diagnostic — confirms whether the backend can send push (env configured).
router.get('/api/notifications/status', c.status);

/**
 * @swagger
 * /api/notifications/token:
 *   post:
 *     summary: Register/refresh an FCM device token for a user
 *     tags: [Notifications]
 *   delete:
 *     summary: Remove an FCM device token (logout)
 *     tags: [Notifications]
 */
router.post('/api/notifications/token', c.registerToken);
router.delete('/api/notifications/token', c.unregisterToken);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: In-app notification history for a user
 *     tags: [Notifications]
 */
router.get('/api/notifications', c.listMine);
router.patch('/api/notifications/:id/read', c.markRead);
router.post('/api/notifications/read-all', c.markAllRead);

export default router;
