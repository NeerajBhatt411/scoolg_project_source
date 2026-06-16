import { Router } from 'express';
import * as c from './calendar.controller.js';

const router = Router();

// List events for a school (optionally filtered by year).
router.get('/api/admin/calendar', c.getAdminCalendar);

// Upcoming events from today onward (for the dashboard's Scheduled Events).
router.get('/api/admin/calendar/upcoming', c.getAdminCalendarUpcoming);

// Create an event. Scheduling an event also schedules its school-calendar notice.
router.post('/api/admin/calendar', c.postAdminCalendar);

// Update an event.
router.put('/api/admin/calendar/:id', c.putAdminCalendarById);

// Delete an event.
router.delete('/api/admin/calendar/:id', c.deleteAdminCalendarById);

export default router;
