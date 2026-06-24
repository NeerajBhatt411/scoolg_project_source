import { Router } from 'express';
import * as c from './messages.controller.js';

const router = Router();

// Admin side of the parent <-> school chat. Mounted under /api/admin so the
// admin auth guard applies.
router.get('/api/admin/firebase-token', c.getAdminFirebaseToken);
router.get('/api/admin/messages', c.getAdminConversations);
router.get('/api/admin/messages/:studentId', c.getAdminThread);
router.post('/api/admin/messages/:studentId', c.postAdminMessage);
router.post('/api/admin/messages/:studentId/read', c.postAdminMessageRead);

export default router;
