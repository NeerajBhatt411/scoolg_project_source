import { Router } from 'express';
import * as c from './contact.controller.js';

const router = Router();

// Public website forms (no auth) — "Contact Us" and "Book a Demo".
router.post('/api/contact', c.postContact);
router.post('/api/demo', c.postBookDemo);

// Per-school public website enquiry (emails that school's contact email).
router.post('/api/school-enquiry', c.postSchoolEnquiry);

export default router;
