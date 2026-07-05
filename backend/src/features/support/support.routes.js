import { Router } from 'express';
import * as c from './support.controller.js';

const router = Router();

// School-facing (behind adminGuard). These prefixes are intentionally NOT in
// adminGuard's MODULE_BY_PREFIX, so any authenticated owner/staff can reach them
// (support + platform notices shouldn't require a per-module permission).

// Support tickets raised by the school -> super-admin panel.
router.post('/api/admin/support-tickets', c.postSupportTicket);
router.get('/api/admin/support-tickets', c.getSupportTickets);
router.get('/api/admin/support-tickets/:id', c.getSupportTicketById);
router.post('/api/admin/support-tickets/:id/reply', c.postSupportTicketReply);

// Inbox of notices broadcast by the Scoolg super-admin.
router.get('/api/admin/scoolg-notices', c.getScoolgNotices);
router.post('/api/admin/scoolg-notices/:id/read', c.postScoolgNoticeRead);

export default router;
