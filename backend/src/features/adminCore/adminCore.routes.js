import { Router } from 'express';
import * as c from './adminCore.controller.js';

const router = Router();

// Get/Update Profile (Protected logic can be added later)
router.get('/api/admin/profile/:id', c.getAdminProfileById);

router.patch('/api/admin/profile/:id', c.patchAdminProfileById);

// --- Dashboard Stats ---
router.get('/api/admin/dashboard/stats', c.getAdminDashboardStats);

export default router;
