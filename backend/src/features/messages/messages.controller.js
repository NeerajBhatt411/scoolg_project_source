import { School } from '../../../models/School.js';
import { Message } from '../../../models/Message.js';
import { Student } from '../../../models/Student.js';
import { DeviceToken } from '../../../models/DeviceToken.js';
import { sendToTokens } from '../../utils/push.js';

const resolveSchool = (req) => {
    const schoolId = req.query.schoolId || req.body?.schoolId;
    if (!schoolId) return null;
    return School.findOne({ id: schoolId });
};

// GET /api/admin/messages?schoolId=...  -> one row per parent conversation
export const getAdminConversations = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: "School not found" });

        const msgs = await Message.find({ schoolId: school._id }).sort({ createdAt: -1 }).lean();
        const byStudent = new Map();
        for (const m of msgs) {
            const key = String(m.studentId);
            if (!byStudent.has(key)) {
                byStudent.set(key, { studentId: key, lastMessage: m.text, lastFrom: m.from, lastAt: m.createdAt, unread: 0 });
            }
            if (m.from === 'parent' && !m.readByAdmin) byStudent.get(key).unread++;
        }
        const convos = [...byStudent.values()];

        const students = await Student.find({ _id: { $in: convos.map(c => c.studentId) } })
            .select('firstName lastName class section studentAppId').lean();
        const sMap = {};
        students.forEach(s => { sMap[String(s._id)] = s; });
        convos.forEach(c => {
            const s = sMap[c.studentId];
            c.studentName = s ? [s.firstName, s.lastName].filter(Boolean).join(' ') : 'Student';
            c.classSection = s ? `${s.class || ''}${s.section ? ' - ' + s.section : ''}` : '';
            c.studentAppId = s?.studentAppId || '';
        });

        res.json({ conversations: convos });
    } catch (err) {
        res.status(500).json({ error: "Failed to load conversations" });
    }
};

// GET /api/admin/messages/:studentId?schoolId=...  -> full thread (marks parent msgs read)
export const getAdminThread = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        const { studentId } = req.params;
        const messages = await Message.find({ schoolId: school._id, studentId }).sort({ createdAt: 1 }).lean();
        await Message.updateMany({ schoolId: school._id, studentId, from: 'parent', readByAdmin: false }, { readByAdmin: true });
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: "Failed to load messages" });
    }
};

// POST /api/admin/messages/:studentId  { schoolId, text }  -> admin reply (pushes to parent)
export const postAdminMessage = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        const { studentId } = req.params;
        const text = (req.body?.text || '').trim();
        if (!text) return res.status(400).json({ error: "Message text required" });

        const msg = await Message.create({
            schoolId: school._id,
            studentId,
            from: 'admin',
            text,
            readByAdmin: true,
        });

        // Best-effort push to the parent's devices.
        try {
            const toks = await DeviceToken.find({ role: 'student', userId: String(studentId) }).select('token').lean();
            if (toks.length) {
                sendToTokens(toks.map(t => t.token), {
                    title: `💬 Message from ${school.formData?.schoolName || 'your school'}`,
                    body: text.slice(0, 80),
                    data: { link: '/chat' },
                });
            }
        } catch (e) { /* push is best-effort */ }

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ error: "Failed to send message" });
    }
};
