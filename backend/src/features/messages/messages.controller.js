import { School } from '../../../models/School.js';
import { Message } from '../../../models/Message.js';
import { Student } from '../../../models/Student.js';
import { DeviceToken } from '../../../models/DeviceToken.js';
import { sendToTokens } from '../../utils/push.js';
import { mintCustomToken, sendChatMessage, markChatRead } from '../../utils/firebaseChat.js';

const resolveSchool = (req) => {
    // Prefer the authenticated token (adminGuard sets req.user); fall back to the
    // schoolId the panel sends.
    const fromToken = req.user?.type === 'staff' ? req.user?.schoolId : req.user?.id;
    const schoolId = fromToken || req.query.schoolId || req.body?.schoolId;
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
            if (m.from === 'parent' && !m.readBySchool) byStudent.get(key).unread++;
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
        // Whole group thread for this student (parent + admin + all teachers).
        const filter = { schoolId: school._id, studentId };
        const messages = await Message.find(filter).sort({ createdAt: 1 }).lean();
        await Message.updateMany({ ...filter, from: 'parent', readBySchool: false }, { readBySchool: true });
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: "Failed to load messages" });
    }
};

// POST /api/admin/messages/:studentId  { text }  -> admin reply (writes Firestore + pushes to parent)
export const postAdminMessage = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        const { studentId } = req.params;
        const text = (req.body?.text || '').trim();
        if (!text) return res.status(400).json({ error: "Message text required" });

        const student = await Student.findById(studentId).select('firstName lastName class section').lean();
        const studentName = student ? [student.firstName, student.lastName].filter(Boolean).join(' ') : '';
        const classSection = student ? `${student.class || ''}${student.section ? ' - ' + student.section : ''}` : '';

        await sendChatMessage({
            schoolId: String(school._id),
            studentId: String(studentId),
            studentName, classSection,
            from: 'admin',
            senderName: 'School Office',
            text,
            bump: 'parent',
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

        res.status(201).json({ ok: true });
    } catch (err) {
        console.error('[admin chat] send failed:', err.message);
        res.status(500).json({ error: "Failed to send message" });
    }
};

// Firebase custom token so the admin panel can read this school's chats in realtime.
export const getAdminFirebaseToken = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        const token = mintCustomToken(`a_${school._id}`, { role: 'admin', schoolId: String(school._id) });
        res.json({ token, schoolId: String(school._id) });
    } catch (err) {
        res.status(500).json({ error: "Failed to mint token" });
    }
};

// Admin opened a thread -> clear the school-side unread.
export const postAdminMessageRead = async (req, res) => {
    try {
        const school = await resolveSchool(req);
        if (!school) return res.status(404).json({ error: "School not found" });
        await markChatRead({ studentId: String(req.params.studentId), side: 'school' });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
};
