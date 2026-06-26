import { School } from '../../../models/School.js';
import { ClassModel } from '../../../models/Class.js';
import { Teacher } from '../../../models/Teacher.js';
import { Student } from '../../../models/Student.js';

export const getAdminProfileById = async (req, res) => {
    const school = await School.findOne({ id: req.params.id });
    if (!school) return res.status(404).json({ error: "School not found" });
    res.json({
        ...school.formData,
        email: school.email,
        status: school.status,
        isPasswordChanged: school.isPasswordChanged
    });
};

export const patchAdminProfileById = async (req, res) => {
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
};

export const getAdminDashboardStats = async (req, res) => {
    try {
        const { schoolId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const [students, teachers, classes, male, female] = await Promise.all([
            Student.countDocuments({ schoolId: school._id }),
            Teacher.countDocuments({ schoolId: school._id }),
            ClassModel.countDocuments({ schoolId: school._id }),
            Student.countDocuments({ schoolId: school._id, gender: { $regex: /^male$/i } }),
            Student.countDocuments({ schoolId: school._id, gender: { $regex: /^female$/i } })
        ]);

        res.json({ students, teachers, classes, male, female });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};
