import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { School } from '../../models/School.js';
import { Section } from '../../models/Section.js';
import { Timetable } from '../../models/Timetable.js';
import { Teacher } from '../../models/Teacher.js';
import { TeacherDiary } from '../../models/TeacherDiary.js';

const router = Router();

// --- Teachers API (Basic) ---
/**
 * @swagger
 * /api/admin/teachers:
 *   post:
 *     summary: Add a new teacher
 *     tags: [School Admin - Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher added successfully
 */
router.post('/api/admin/teachers', async (req, res) => {
    try {
        const { schoolId, fullName, gender, dateOfBirth, phone, email, highestQualification, specialization, experienceYears, dateOfJoining, residentialAddress, profileImageUrl } = req.body;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

        const normalizedFullName = fullName?.trim();
        const normalizedGender = gender?.trim();
        const normalizedPhone = String(phone || '').replace(/\D/g, '');
        const normalizedEmail = email?.trim().toLowerCase() || '';
        const normalizedQualification = highestQualification?.trim();
        const normalizedSpecialization = specialization?.trim();
        const normalizedAddress = residentialAddress?.trim();
        const normalizedProfileImageUrl = profileImageUrl?.trim() || '';
        const parsedDateOfBirth = new Date(dateOfBirth);
        const parsedDateOfJoining = new Date(dateOfJoining);
        const normalizedExperienceYears = Number(experienceYears);
        const allowedGenders = ['Male', 'Female', 'Other'];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const now = new Date();

        if (!normalizedFullName || normalizedFullName.length < 2) {
            return res.status(400).json({ error: "Full name is required" });
        }
        if (!allowedGenders.includes(normalizedGender)) {
            return res.status(400).json({ error: "Valid gender is required" });
        }
        if (Number.isNaN(parsedDateOfBirth.getTime())) {
            return res.status(400).json({ error: "Valid date of birth is required" });
        }
        if (parsedDateOfBirth > now) {
            return res.status(400).json({ error: "Date of birth cannot be in the future" });
        }

        let age = now.getFullYear() - parsedDateOfBirth.getFullYear();
        const ageMonthOffset = now.getMonth() - parsedDateOfBirth.getMonth();
        if (ageMonthOffset < 0 || (ageMonthOffset === 0 && now.getDate() < parsedDateOfBirth.getDate())) {
            age--;
        }
        if (age < 18) {
            return res.status(400).json({ error: "Teacher must be at least 18 years old" });
        }

        if (normalizedPhone.length !== 10) {
            return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
        }
        if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        if (!normalizedQualification) {
            return res.status(400).json({ error: "Highest qualification is required" });
        }
        if (!normalizedSpecialization) {
            return res.status(400).json({ error: "Specialization is required" });
        }
        if (!Number.isFinite(normalizedExperienceYears) || normalizedExperienceYears < 0) {
            return res.status(400).json({ error: "Experience must be a valid non-negative number" });
        }
        if (Number.isNaN(parsedDateOfJoining.getTime())) {
            return res.status(400).json({ error: "Valid date of joining is required" });
        }
        if (parsedDateOfJoining > now) {
            return res.status(400).json({ error: "Date of joining cannot be in the future" });
        }
        if (parsedDateOfJoining < parsedDateOfBirth) {
            return res.status(400).json({ error: "Date of joining cannot be before date of birth" });
        }
        if (!normalizedAddress || normalizedAddress.length < 5) {
            return res.status(400).json({ error: "Residential address is required" });
        }

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const existingPhone = await Teacher.findOne({ schoolId: school._id, phone: normalizedPhone });
        if (existingPhone) {
            return res.status(409).json({ error: "A teacher with this phone number already exists" });
        }

        if (normalizedEmail) {
            const existingEmail = await Teacher.findOne({ schoolId: school._id, email: normalizedEmail });
            if (existingEmail) {
                return res.status(409).json({ error: "A teacher with this email address already exists" });
            }
        }

        // Generate short Teacher App ID: TCH101
        const count = await Teacher.countDocuments({ schoolId: school._id });
        const teacherAppId = `TCH${count + 101}`;

        // Generate short Password: PASS-XYZ
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        const plainPassword = `PASS-${randomSuffix}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        const newTeacher = new Teacher({
            schoolId: school._id,
            teacherAppId,
            password: hashedPassword,
            fullName: normalizedFullName,
            gender: normalizedGender,
            dateOfBirth: parsedDateOfBirth,
            email: normalizedEmail || undefined,
            phone: normalizedPhone,
            profileImageUrl: normalizedProfileImageUrl,
            highestQualification: normalizedQualification,
            specialization: normalizedSpecialization,
            experienceYears: normalizedExperienceYears,
            dateOfJoining: parsedDateOfJoining,
            residentialAddress: normalizedAddress
        });

        await newTeacher.save();

        res.status(201).json({
            message: "Teacher added successfully",
            teacher: newTeacher,
            appCredentials: {
                teacherAppId,
                password: plainPassword
            }
        });
    } catch (err) {
        console.error("Failed to add teacher:", err);
        res.status(500).json({ error: "Failed to create teacher" });
    }
});

/**
 * @swagger
 * /api/admin/teachers:
 *   get:
 *     summary: List all teachers for a school
 *     tags: [School Admin - Teachers]
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of teachers
 */
router.get('/api/admin/teachers', async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const teachers = await Teacher.find({ schoolId: school._id }).populate('subjects');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teachers" });
    }
});

// Update a teacher document (admin edit).
router.patch('/api/admin/teachers/:id', async (req, res) => {
    try {
        const allowed = ['fullName', 'gender', 'email', 'phone', 'highestQualification',
            'specialization', 'experienceYears', 'residentialAddress', 'description',
            'status', 'profileImageUrl', 'dateOfBirth', 'dateOfJoining'];
        const update = {};
        for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, update, { new: true }).populate('subjects');
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: "Failed to update teacher", details: err.message });
    }
});

// A teacher's weekly schedule (derived from timetables) + the sections they're class-teacher of.
router.get('/api/admin/teachers/:id/schedule', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: "Teacher not found" });
        const tid = teacher._id.toString();

        const timetables = await Timetable.find({ schoolId: teacher.schoolId });
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const byDay = {};
        days.forEach(d => { byDay[d] = []; });
        for (const tt of timetables) {
            for (const day of tt.schedule || []) {
                for (const p of day.periods || []) {
                    if (p.teacherId && p.teacherId.toString() === tid) {
                        byDay[day.dayOfWeek]?.push({
                            periodNumber: p.periodNumber, startTime: p.startTime, endTime: p.endTime,
                            subject: p.subject, className: tt.className, sectionName: tt.sectionName
                        });
                    }
                }
            }
        }
        days.forEach(d => byDay[d].sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0)));

        const sections = await Section.find({ classTeacherId: teacher._id }).populate('classId');
        const classTeacherOf = sections.map(s => ({ className: s.classId?.className, sectionName: s.sectionName }));

        res.json({ schedule: days.map(d => ({ dayOfWeek: d, periods: byDay[d] })), classTeacherOf });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch teacher schedule", details: err.message });
    }
});

// List diary entries (filter by teacherId and/or date/className). Newest first.
router.get('/api/admin/teacher-diary', async (req, res) => {
    try {
        const { schoolId, teacherId, date, className } = req.query;
        const query = {};
        if (teacherId) query.teacherId = teacherId;
        if (date) query.date = date;
        if (className) query.className = className;
        if (!teacherId) {
            const school = await School.findOne({ id: schoolId });
            if (!school) return res.status(404).json({ error: "School not found" });
            query.schoolId = school._id;
        }
        const entries = await TeacherDiary.find(query)
            .populate('teacherId', 'fullName teacherAppId')
            .sort({ date: -1, createdAt: -1 }).limit(500);
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch diary", details: err.message });
    }
});

// Create a diary entry (admin filling on behalf, or via teacher app later).
router.post('/api/admin/teacher-diary', async (req, res) => {
    try {
        const { schoolId, teacherId, date, className, sectionName, subject, note, createdByRole } = req.body;
        if (!teacherId || !date || !className || !note?.trim()) {
            return res.status(400).json({ error: "teacherId, date, class and note are required" });
        }
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });
        const entry = new TeacherDiary({
            schoolId: school._id, teacherId, date, className,
            sectionName: sectionName || 'All', subject: subject || '',
            note: note.trim(), createdByRole: createdByRole || 'admin',
        });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: "Failed to add diary entry", details: err.message });
    }
});

// Delete a diary entry.
router.delete('/api/admin/teacher-diary/:id', async (req, res) => {
    try {
        const deleted = await TeacherDiary.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Entry not found" });
        res.json({ message: "Entry deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

export default router;
