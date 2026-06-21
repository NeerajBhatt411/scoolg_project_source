import { Router } from 'express';
import { getPublicSchool, syncVercelDomains } from './publicSite.controller.js';

const router = Router();

/**
 * @swagger
 * /api/public/school/{slug}:
 *   get:
 *     summary: Public school website data by subdomain slug
 *     tags: [Public - Website]
 */
router.get('/api/public/school/:slug', getPublicSchool);

// One-time backfill for existing schools (key-protected). e.g.
// GET /api/public/sync-vercel-domains?key=YOUR_VERCEL_SYNC_KEY
router.get('/api/public/sync-vercel-domains', syncVercelDomains);

export default router;
