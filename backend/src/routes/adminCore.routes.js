import { Router } from 'express';
import { School } from '../../models/School.js';
import { ClassModel } from '../../models/Class.js';
import { Teacher } from '../../models/Teacher.js';
import { Student } from '../../models/Student.js';

const router = Router();

// Get/Update Profile (Protected logic can be added later)
router.get('/api/admin/profile/:id', async (req, res) => {
    const school = await School.findOne({ id: req.params.id });
    if (!school) return res.status(404).json({ error: "School not found" });
    res.json({
        ...school.formData,
        email: school.email,
        status: school.status,
        isPasswordChanged: school.isPasswordChanged
    });
});

router.patch('/api/admin/profile/:id', async (req, res) => {
    try {
        const school = await School.findOne({ id: req.params.id });
        if (!school) return res.status(404).json({ error: "School not found" });

        // Never let system/identity fields leak into the editable formData blob.
        const { email, status, isPasswordChanged, _id, campusCode, id, ...editable } = req.body || {};
        school.formData = { ...(school.formData || {}), ...editable };
        school.markModified('formData'); // Mixed type needs an explicit dirty flag to persist
        await school.save();
        res.json({ message: "Profile updated successfully!", data: school.formData });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: "Update failed", details: err.message });
    }
});

// --- Dashboard Stats ---
router.get('/api/admin/dashboard/stats', async (req, res) => {
    try {
        const { schoolId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const [students, teachers, classes] = await Promise.all([
            Student.countDocuments({ schoolId: school._id }),
            Teacher.countDocuments({ schoolId: school._id }),
            ClassModel.countDocuments({ schoolId: school._id })
        ]);

        res.json({ students, teachers, classes });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

export default router;
