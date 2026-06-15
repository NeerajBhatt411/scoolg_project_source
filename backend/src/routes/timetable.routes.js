import { Router } from 'express';
import { School } from '../../models/School.js';
import { Timetable } from '../../models/Timetable.js';

const router = Router();

// --- Timetable API ---
/**
 * @swagger
 * /api/admin/timetable:
 *   get:
 *     summary: Fetch timetable for a class/section
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *       - in: query
 *         name: className
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectionName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timetable object
 */
router.get('/api/admin/timetable', async (req, res) => {
    try {
        const { schoolId, className, sectionName } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const timetable = await Timetable.findOne({
            schoolId: school._id,
            className,
            sectionName
        });

        res.json(timetable || { message: "No timetable found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// All timetables for a school (for the full class-wise/section-wise report export).
router.get('/api/admin/timetables', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });
        const timetables = await Timetable.find({ schoolId: school._id }).sort({ className: 1, sectionName: 1 });
        res.json(timetables);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/admin/timetable:
 *   post:
 *     summary: Save or update class timetable
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Timetable saved
 */
router.post('/api/admin/timetable', async (req, res) => {
    try {
        const { schoolId, className, sectionName, schedule } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const updatedTimetable = await Timetable.findOneAndUpdate(
            { schoolId: school._id, className, sectionName },
            { schedule },
            { new: true, upsert: true }
        );

        res.json(updatedTimetable);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
