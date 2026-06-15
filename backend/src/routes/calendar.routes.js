import { Router } from 'express';
import { School } from '../../models/School.js';
import { CalendarEvent } from '../../models/CalendarEvent.js';

const router = Router();

// List events for a school (optionally filtered by year).
router.get('/api/admin/calendar', async (req, res) => {
    try {
        const { schoolId, year } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const query = { schoolId: school._id };
        if (year) query.year = Number(year);
        const events = await CalendarEvent.find(query).sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch calendar events" });
    }
});

// Upcoming events from today onward (for the dashboard's Scheduled Events).
router.get('/api/admin/calendar/upcoming', async (req, res) => {
    try {
        const { schoolId, limit } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const today = new Date().toISOString().split('T')[0];
        const events = await CalendarEvent.find({ schoolId: school._id, date: { $gte: today } })
            .sort({ date: 1 })
            .limit(Number(limit) || 6);
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch upcoming events" });
    }
});

// Create an event. Scheduling an event also schedules its school-calendar notice.
router.post('/api/admin/calendar', async (req, res) => {
    try {
        const { schoolId, title, category, date, description } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });
        if (!date) return res.status(400).json({ error: "Date is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const d = new Date(date + 'T00:00:00');
        const event = new CalendarEvent({
            schoolId: school._id,
            title: title.trim(),
            category: category || 'Event',
            date,
            year: d.getFullYear(),
            month: d.getMonth(),
            description: description || '',
            noticeType: 'school-calendar',
        });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: "Failed to create event", details: err.message });
    }
});

// Update an event.
router.put('/api/admin/calendar/:id', async (req, res) => {
    try {
        const { title, category, date, description } = req.body;
        const update = {};
        if (title !== undefined) update.title = title.trim();
        if (category !== undefined) update.category = category;
        if (description !== undefined) update.description = description;
        if (date) {
            const d = new Date(date + 'T00:00:00');
            update.date = date;
            update.year = d.getFullYear();
            update.month = d.getMonth();
        }
        const event = await CalendarEvent.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Failed to update event" });
    }
});

// Delete an event.
router.delete('/api/admin/calendar/:id', async (req, res) => {
    try {
        const deleted = await CalendarEvent.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Event not found" });
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete event" });
    }
});

export default router;
