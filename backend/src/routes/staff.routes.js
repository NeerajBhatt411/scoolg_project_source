import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { School } from '../../models/School.js';
import { StaffUser } from '../../models/StaffUser.js';
import { schoolFromReq, genPassword } from '../utils/adminAuth.js';

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
router.post('/api/admin/staff', async (req, res) => {
    try {
        const { fullName, email, role, allowedModules } = req.body;
        if (!fullName?.trim()) return res.status(400).json({ error: "Full name is required" });
        if (!email?.trim()) return res.status(400).json({ error: "Email is required" });

        const school = await schoolFromReq(req);
        if (!school) return res.status(404).json({ error: "School not found" });

        const normalizedEmail = email.toLowerCase().trim();

        // Email must be unique across schools (login key) and not collide with an owner.
        const existingStaff = await StaffUser.findOne({ email: normalizedEmail });
        if (existingStaff) return res.status(409).json({ error: "A user with this email already exists" });
        const existingSchool = await School.findOne({ $or: [{ email: normalizedEmail }, { "formData.email": normalizedEmail }] });
        if (existingSchool) return res.status(409).json({ error: "This email is already used by a school account" });

        const plainPassword = genPassword();
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(plainPassword, salt);

        const staff = await StaffUser.create({
            schoolId: school._id,
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashed,
            role: role?.trim() || 'Custom',
            allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
            status: 'Active'
        });

        // Return the generated password ONCE so the admin can share it.
        res.status(201).json({
            staff: { ...staff.toObject(), password: undefined },
            credentials: { email: normalizedEmail, password: plainPassword }
        });
    } catch (err) {
        console.error("Create staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/api/admin/staff', async (req, res) => {
    try {
        const school = await schoolFromReq(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        const staff = await StaffUser.find({ schoolId: school._id }).select('-password').sort({ createdAt: -1 });
        res.json(staff);
    } catch (err) {
        console.error("List staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

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
router.patch('/api/admin/staff/:id', async (req, res) => {
    try {
        const allowed = ['fullName', 'role', 'allowedModules', 'status'];
        const update = {};
        for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
        const staff = await StaffUser.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (err) {
        console.error("Update staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/api/admin/staff/:id', async (req, res) => {
    try {
        const staff = await StaffUser.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json({ message: "Staff removed", id: req.params.id });
    } catch (err) {
        console.error("Delete staff error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
