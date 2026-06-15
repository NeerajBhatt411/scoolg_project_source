import { Router } from 'express';
import { School } from '../../models/School.js';
import { ClassModel } from '../../models/Class.js';
import { Student } from '../../models/Student.js';
import { Attendance } from '../../models/Attendance.js';

const router = Router();

/**
 * @swagger
 * /api/admin/attendance:
 *   post:
 *     summary: Save or update daily attendance
 *     tags: [Admin - Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *               classId:
 *                 type: string
 *               sectionId:
 *                 type: string
 *               date:
 *                 type: string
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Attendance saved successfully
 */
router.post('/api/admin/attendance', async (req, res) => {
    try {
        const { schoolId, classId, sectionId, date, records } = req.body;

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const attendance = await Attendance.findOneAndUpdate(
            { sectionId, date },
            {
                schoolId: school._id,
                classId,
                sectionId,
                date,
                records,
                markedBy: "Admin"
            },
            { upsert: true, new: true }
        );

        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: "Failed to save attendance", details: err.message });
    }
});

/**
 * @swagger
 * /api/admin/attendance:
 *   get:
 *     summary: Fetch attendance for a specific date
 *     tags: [School Admin - Attendance]
 *     parameters:
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance record
 */
router.get('/api/admin/attendance', async (req, res) => {
    try {
        const { sectionId, date } = req.query;
        if (!sectionId || !date) return res.status(400).json({ error: "sectionId and date are required" });

        const attendance = await Attendance.findOne({ sectionId, date });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch attendance" });
    }
});

/**
 * @swagger
 * /api/admin/student-attendance/{studentId}:
 *   get:
 *     summary: Fetch attendance history for a specific student
 *     tags: [School Admin - Attendance]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student's attendance history
 */
router.get('/api/admin/student-attendance/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ error: "Student not found" });

        // Find all attendance records where this student is present
        const attendanceRecords = await Attendance.find({
            "records.studentId": student._id
        }).sort({ date: -1 });

        // Map to return only this student's status for each day
        const result = attendanceRecords.map(record => ({
            date: record.date,
            status: record.records.find(r => r.studentId.toString() === student._id.toString())?.status
        }));

        res.json(result);
    } catch (err) {
        console.error("Fetch student attendance error:", err);
        res.status(500).json({ error: "Failed to fetch student attendance" });
    }
});

/**
 * @swagger
 * /api/admin/attendance/analytics:
 *   get:
 *     summary: Aggregated attendance % trend (daily/weekly/monthly/yearly) + class-wise
 *     tags: [School Admin - Attendance]
 */
router.get('/api/admin/attendance/analytics', async (req, res) => {
    try {
        const { schoolId, range = 'monthly', classId } = req.query;
        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let cutoff;
        if (range === 'daily') { cutoff = new Date(now); cutoff.setDate(now.getDate() - 13); }
        else if (range === 'weekly') { cutoff = new Date(now); cutoff.setDate(now.getDate() - 7 * 8); }
        else if (range === 'yearly') { cutoff = new Date(now.getFullYear() - 4, 0, 1); }
        else { cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1); }

        const query = { schoolId: school._id, date: { $gte: ymd(cutoff) } };
        if (classId) query.classId = classId;
        const docs = await Attendance.find(query).lean();

        const classes = await ClassModel.find({ schoolId: school._id }).lean();
        const classNameById = {};
        classes.forEach((c) => { classNameById[String(c._id)] = c.className; });

        const keyAndLabel = (dateStr) => {
            const d = new Date(dateStr + 'T00:00:00');
            if (range === 'daily') return { key: dateStr, label: `${d.getDate()} ${MONTHS[d.getMonth()]}`, sort: dateStr };
            if (range === 'weekly') {
                const day = (d.getDay() + 6) % 7; // 0 = Monday
                const ws = new Date(d); ws.setDate(d.getDate() - day);
                const k = ymd(ws);
                return { key: k, label: `${ws.getDate()} ${MONTHS[ws.getMonth()]}`, sort: k };
            }
            if (range === 'yearly') return { key: String(d.getFullYear()), label: String(d.getFullYear()), sort: String(d.getFullYear()) };
            const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
            return { key: k, label: MONTHS[d.getMonth()], sort: k };
        };

        const periods = {};
        const byClass = {};
        for (const doc of docs) {
            let present = 0, denom = 0;
            for (const r of doc.records || []) {
                if (r.status === 'H') continue; // exclude holidays
                denom++;
                if (r.status === 'P' || r.status === 'L') present++;
            }
            if (denom === 0) continue;
            const { key, label, sort } = keyAndLabel(doc.date);
            if (!periods[key]) periods[key] = { label, sort, present: 0, denom: 0 };
            periods[key].present += present; periods[key].denom += denom;

            const cid = String(doc.classId);
            if (!byClass[cid]) byClass[cid] = { present: 0, denom: 0 };
            byClass[cid].present += present; byClass[cid].denom += denom;
        }

        const trend = Object.values(periods)
            .sort((a, b) => (a.sort < b.sort ? -1 : 1))
            .map((p) => ({ label: p.label, pct: Math.round((p.present / p.denom) * 100) }));

        const byClassArr = Object.entries(byClass)
            .map(([cid, v]) => ({ className: classNameById[cid] || 'Class', pct: Math.round((v.present / v.denom) * 100) }))
            .sort((a, b) => b.pct - a.pct);

        const totals = Object.values(periods).reduce((acc, p) => ({ present: acc.present + p.present, denom: acc.denom + p.denom }), { present: 0, denom: 0 });
        const avg = totals.denom ? Math.round((totals.present / totals.denom) * 100) : 0;

        res.json({ range, avg, trend, byClass: byClassArr, recordDays: docs.length });
    } catch (err) {
        console.error("Attendance analytics error:", err);
        res.status(500).json({ error: "Failed to compute attendance analytics", details: err.message });
    }
});

export default router;
