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
