import { School } from '../../../models/School.js';
import { Section } from '../../../models/Section.js';
import { Timetable } from '../../../models/Timetable.js';
import { Homework } from '../../../models/Homework.js';
import { notifyClassStudents } from '../../utils/push.js';

export const postAdminHomework = async (req, res) => {
    try {
        const {
            schoolId, className, sectionName, subject, title, description,
            dueDate, attachments, createdByRole, createdById, createdByName
        } = req.body;

        if (!schoolId) return res.status(400).json({ error: "schoolId is required" });
        if (!className) return res.status(400).json({ error: "Class is required" });
        if (!title || !title.trim()) return res.status(400).json({ error: "Title is required" });
        if (!dueDate) return res.status(400).json({ error: "Due date is required" });

        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        // Auto-resolve the subject teacher from the timetable (class+section+subject).
        let resolvedName = createdByName;
        let resolvedId = createdById;
        if (createdByRole !== 'teacher' && subject) {
            const q = { schoolId: school._id, className };
            if (sectionName && sectionName !== 'All') q.sectionName = sectionName;
            const tts = await Timetable.find(q);
            const subLower = subject.trim().toLowerCase();
            outer: for (const tt of tts) {
                for (const day of tt.schedule || []) {
                    for (const p of day.periods || []) {
                        if (p.subject && p.subject.trim().toLowerCase() === subLower && p.teacherName) {
                            resolvedName = p.teacherName;
                            resolvedId = p.teacherId;
                            break outer;
                        }
                    }
                }
            }
        }

        const homework = await Homework.create({
            schoolId: school._id,
            className,
            sectionName: sectionName || 'All',
            subject: subject?.trim() || '',
            title: title.trim(),
            description: description?.trim() || '',
            dueDate: dueDate ? new Date(dueDate) : undefined,
            attachments: Array.isArray(attachments) ? attachments : [],
            createdByRole: createdByRole === 'teacher' ? 'teacher' : 'admin',
            createdById: resolvedId || undefined,
            createdByName: resolvedName || 'School Admin'
        });

        // 🔔 notify the class's students
        try {
            await notifyClassStudents({
                schoolObjId: school._id,
                className,
                sectionName: homework.sectionName,
                title: `📚 New homework${subject ? ' · ' + subject : ''}`,
                body: `${homework.title} — Class ${className}${homework.sectionName && homework.sectionName !== 'All' ? '-' + homework.sectionName : ''}`,
                data: { link: '/homework' },
            });
        } catch (e) { console.error('[homework] push failed:', e.message); }

        res.status(201).json(homework);
    } catch (err) {
        console.error("Create homework error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getAdminHomework = async (req, res) => {
    try {
        const { schoolId, className, sectionName } = req.query;
        const school = await School.findOne({ id: schoolId });
        if (!school) return res.status(404).json({ error: "School not found" });

        const filter = { schoolId: school._id, status: 'Active' };
        if (className) filter.className = className;
        if (sectionName) {
            // Section-specific homework + anything assigned to "All" sections of that class
            filter.$or = [{ sectionName }, { sectionName: 'All' }];
        }

        const homework = await Homework.find(filter).sort({ createdAt: -1 });
        res.json(homework);
    } catch (err) {
        console.error("List homework error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const patchAdminHomeworkById = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['className', 'sectionName', 'subject', 'title', 'description', 'dueDate', 'attachments', 'status'];
        const update = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) update[key] = req.body[key];
        }
        if (update.dueDate) update.dueDate = new Date(update.dueDate);
        if (update.title !== undefined && !String(update.title).trim()) {
            return res.status(400).json({ error: "Title cannot be empty" });
        }

        const homework = await Homework.findByIdAndUpdate(id, update, { new: true });
        if (!homework) return res.status(404).json({ error: "Homework not found" });
        res.json(homework);
    } catch (err) {
        console.error("Update homework error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteAdminHomeworkById = async (req, res) => {
    try {
        const homework = await Homework.findByIdAndDelete(req.params.id);
        if (!homework) return res.status(404).json({ error: "Homework not found" });
        res.json({ message: "Homework deleted", id: req.params.id });
    } catch (err) {
        console.error("Delete homework error:", err);
        res.status(500).json({ error: err.message });
    }
};
