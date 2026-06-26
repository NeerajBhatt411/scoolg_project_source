import { School } from '../../../models/School.js';
import { Timetable } from '../../../models/Timetable.js';

export const getAdminTimetable = async (req, res) => {
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
};

export const getAdminTimetables = async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });
        const timetables = await Timetable.find({ schoolId: school._id }).sort({ className: 1, sectionName: 1 });
        res.json(timetables);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const postAdminTimetable = async (req, res) => {
    try {
        const { schoolId, className, sectionName, schedule } = req.body;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        // --- Teacher clash check: a teacher can't be assigned to two different
        // class-sections at the same day + period. Compare against the school's
        // OTHER sections (the section being saved is excluded, so re-saving it
        // never clashes with its own previous schedule). Empty teacherId skipped.
        const others = await Timetable.find({
            schoolId: school._id,
            $or: [{ className: { $ne: className } }, { sectionName: { $ne: sectionName } }],
        }).lean();
        const booked = new Map(); // "day|period" -> { teacherId: "Class - Sec" }
        for (const tt of others) {
            for (const day of tt.schedule || []) {
                for (const p of day.periods || []) {
                    if (!p.teacherId) continue;
                    const key = `${day.dayOfWeek}|${p.periodNumber}`;
                    if (!booked.has(key)) booked.set(key, {});
                    booked.get(key)[String(p.teacherId)] = `${tt.className} - ${tt.sectionName}`;
                }
            }
        }
        const clashes = [];
        for (const day of schedule || []) {
            for (const p of day.periods || []) {
                if (!p.teacherId) continue;
                const at = booked.get(`${day.dayOfWeek}|${p.periodNumber}`);
                if (at && at[String(p.teacherId)]) {
                    clashes.push({ teacherId: String(p.teacherId), day: day.dayOfWeek, period: p.periodNumber, busyIn: at[String(p.teacherId)] });
                }
            }
        }
        if (clashes.length) {
            return res.status(409).json({
                error: "Teacher clash: a teacher is already assigned to another class at the same time.",
                clashes,
            });
        }

        const updatedTimetable = await Timetable.findOneAndUpdate(
            { schoolId: school._id, className, sectionName },
            { schedule },
            { new: true, upsert: true }
        );

        res.json(updatedTimetable);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
