import { Router } from 'express';
import { getPublicSchool } from './publicSite.controller.js';

const router = Router();

/**
 * @swagger
 * /api/public/school/{slug}:
 *   get:
 *     summary: Public school website data by subdomain slug
 *     tags: [Public - Website]
 */
router.get('/api/public/school/:slug', getPublicSchool);

export default router;
