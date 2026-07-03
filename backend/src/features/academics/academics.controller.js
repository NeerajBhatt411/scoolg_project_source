import { School } from '../../../models/School.js';
import { ClassModel } from '../../../models/Class.js';
import { Section } from '../../../models/Section.js';
import { Subject } from '../../../models/Subject.js';
import { Student } from '../../../models/Student.js';
import { Timetable } from '../../../models/Timetable.js';
import { Homework } from '../../../models/Homework.js';
import { TeacherDiary } from '../../../models/TeacherDiary.js';

// Delete a class + its sections and timetables. Students of the class are left
// intact (admin reassigns them); we report how many remain.
export const deleteAdminClassesById = async (req, res) => {
    try {
        const cls = await ClassModel.findById(req.params.id);
        if (!cls) return res.status(404).json({ error: "Class not found" });
        const sid = cls.schoolId;
        const name = cls.className;
        const [secs, tts] = await Promise.all([
            Section.deleteMany({ classId: cls._id }),
            Timetable.deleteMany({ schoolId: sid, className: name }),
        ]);
        await cls.deleteOne();
        const remainingStudents = await Student.countDocuments({ schoolId: sid, class: name });
        res.json({
            message: "Class deleted",
            deleted: { sections: secs.deletedCount, timetables: tts.deletedCount },
            remainingStudents,
        });
    } catch (err) {
        console.error("Delete class error:", err);
        res.status(500).json({ error: "Failed to delete class" });
    }
};

// Rename a class AND cascade the new name to every denormalized reference
// (students, timetables, homework, teacher diaries all store the class name as a
// string). Sections/attendance reference classId so they need no change.
export const patchAdminClassesByIdRename = async (req, res) => {
    try {
        const newName = String(req.body.className || '').trim();
        if (!newName) return res.status(400).json({ error: "Class name is required" });
        const cls = await ClassModel.findById(req.params.id);
        if (!cls) return res.status(404).json({ error: "Class not found" });
        const oldName = cls.className;
        if (oldName === newName) return res.json({ class: cls, updated: {} });

        const dup = await ClassModel.findOne({ schoolId: cls.schoolId, className: newName, _id: { $ne: cls._id } });
        if (dup) return res.status(409).json({ error: "A class with this name already exists" });

        cls.className = newName;
        await cls.save();

        const sid = cls.schoolId;
        const [students, timetables, homeworks, diaries] = await Promise.all([
            Student.updateMany({ schoolId: sid, class: oldName }, { $set: { class: newName } }),
            Timetable.updateMany({ schoolId: sid, className: oldName }, { $set: { className: newName } }),
            Homework.updateMany({ schoolId: sid, className: oldName }, { $set: { className: newName } }),
            TeacherDiary.updateMany({ schoolId: sid, className: oldName }, { $set: { className: newName } }),
        ]);
        res.json({
            class: cls,
            updated: {
                students: students.modifiedCount,
                timetables: timetables.modifiedCount,
                homeworks: homeworks.modifiedCount,
                diaries: diaries.modifiedCount,
            }
        });
    } catch (err) {
        console.error("Rename class error:", err);
        res.status(500).json({ error: "Failed to rename class" });
    }
};

export const postAdminClasses = async (req, res) => {
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
};

export const getAdminClasses = async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const classes = await ClassModel.find({ schoolId: school._id }).sort({ order: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
};

export const postAdminSections = async (req, res) => {
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
};

export const getAdminSections = async (req, res) => {
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
};

export const deleteAdminSectionsById = async (req, res) => {
    try {
        const deleted = await Section.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Section not found" });
        res.json({ message: "Section deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete section" });
    }
};

export const patchAdminSectionsById = async (req, res) => {
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
};

export const patchAdminClassesById = async (req, res) => {
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
};

export const postAdminSubjects = async (req, res) => {
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
};

export const getAdminSubjects = async (req, res) => {
    try {
        const { schoolId } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const subjects = await Subject.find({ schoolId: school._id });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
};
