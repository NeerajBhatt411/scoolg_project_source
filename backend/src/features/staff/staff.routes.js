import { Router } from 'express';
import * as c from './staff.controller.js';

const router = Router();

/**
 * @swagger
 * /api/admin/staff:
 *   post:
 *     summary: Create a staff/sub-user with module-level access
 *     tags: [School Admin - Roles]
 *   get:
 *     summary: List staff users for the school
 *     tags: [School Admin - Roles]
 */
router.post('/api/admin/staff', c.postAdminStaff);

router.get('/api/admin/staff', c.getAdminStaff);

/**
 * @swagger
 * /api/admin/staff/{id}:
 *   patch:
 *     summary: Update a staff user's role/modules/status
 *     tags: [School Admin - Roles]
 *   delete:
 *     summary: Delete a staff user
 *     tags: [School Admin - Roles]
 */
router.patch('/api/admin/staff/:id', c.patchAdminStaffById);

router.delete('/api/admin/staff/:id', c.deleteAdminStaffById);

export default router;
