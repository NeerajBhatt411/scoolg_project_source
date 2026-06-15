import { Router } from 'express';
import { School } from '../../models/School.js';
import { ClassModel } from '../../models/Class.js';
import { Section } from '../../models/Section.js';
import { Subject } from '../../models/Subject.js';

const router = Router();

// --- Classes API ---
/**
 * @swagger
 * /api/admin/classes:
 *   post:
 *     summary: Create a new academic class
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               className:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created
 */
router.post('/api/admin/classes', async (req, res) => {
    try {
        const { schoolId, className, order, subjects } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const newClass = new ClassModel({
            schoolId: school._id,
            className,
            order,
            subjects: subjects || []
        });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        res.status(500).json({ error: "Failed to create class", details: err.message });
    }
});

/**
 * @swagger
 * /api/admin/classes:
 *   get:
 *     summary: List all classes for a school
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of classes
 */
router.get('/api/admin/classes', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const classes = await ClassModel.find({ schoolId: school._id }).sort({ order: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// --- Sections API ---
/**
 * @swagger
 * /api/admin/sections:
 *   post:
 *     summary: Create a new section in a class
 *     tags: [School Admin - Academic]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *               sectionName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created
 */
router.post('/api/admin/sections', async (req, res) => {
    try {
        const { schoolId, classId, sectionName, maxCapacity } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const newSection = new Section({ schoolId: school._id, classId, sectionName, maxCapacity });
        await newSection.save();
        res.status(201).json(newSection);
    } catch (err) {
        res.status(500).json({ error: "Failed to create section" });
    }
});

/**
 * @swagger
 * /api/admin/sections:
 *   get:
 *     summary: List all sections for a specific class
 *     tags: [School Admin - Academic]
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of sections
 */
router.get('/api/admin/sections', async (req, res) => {
    try {
        const { classId, schoolId } = req.query;
        let query = {};

        if (classId) {
            query.classId = classId;
        } else if (schoolId) {
            const school = await School.findOne({ id: schoolId });
            if (!school) return res.status(404).json({ error: "School not found" });
            query.schoolId = school._id;
        } else {
            return res.status(400).json({ error: "classId or schoolId is required" });
        }

        const sections = await Section.find(query).populate('classTeacherId');
        res.json(sections);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sections", details: err.message });
    }
});

// Delete a section.
router.delete('/api/admin/sections/:id', async (req, res) => {
    try {
        const deleted = await Section.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Section not found" });
        res.json({ message: "Section deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete section" });
    }
});

// Update a section (assign class teacher / rename).
router.patch('/api/admin/sections/:id', async (req, res) => {
    try {
        const update = {};
        if (req.body.sectionName !== undefined) update.sectionName = req.body.sectionName;
        if (req.body.classTeacherId !== undefined) update.classTeacherId = req.body.classTeacherId || null;
        if (req.body.maxCapacity !== undefined) update.maxCapacity = req.body.maxCapacity;
        const section = await Section.findByIdAndUpdate(req.params.id, update, { new: true }).populate('classTeacherId');
        if (!section) return res.status(404).json({ error: "Section not found" });
        res.json(section);
    } catch (err) {
        res.status(500).json({ error: "Failed to update section", details: err.message });
    }
});

// Update a class (subjects / name / order).
router.patch('/api/admin/classes/:id', async (req, res) => {
    try {
        const update = {};
        if (req.body.subjects !== undefined) update.subjects = req.body.subjects;
        if (req.body.className !== undefined) update.className = req.body.className;
        if (req.body.order !== undefined) update.order = req.body.order;
        const cls = await ClassModel.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!cls) return res.status(404).json({ error: "Class not found" });
        res.json(cls);
    } catch (err) {
        res.status(500).json({ error: "Failed to update class", details: err.message });
    }
});

// --- Subjects API ---
router.post('/api/admin/subjects', async (req, res) => {
    try {
        const { schoolId, subjectName, subjectCode } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const newSubject = new Subject({ schoolId: school._id, subjectName, subjectCode });
        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(500).json({ error: "Failed to create subject" });
    }
});

router.get('/api/admin/subjects', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const subjects = await Subject.find({ schoolId: school._id });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

export default router;
