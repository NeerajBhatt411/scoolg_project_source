import { School } from '../../../models/School.js';
import { SupportTicket } from '../../../models/SupportTicket.js';
import { Broadcast } from '../../../models/Broadcast.js';

// The admin panel's JWT carries the School's STRING id as `id` (owner) or
// `schoolId` (staff). Resolve it the same way messages.controller does, with a
// query/body fallback for safety.
const resolveSchoolId = (req) => {
    const fromToken = req.user?.type === 'staff' ? req.user?.schoolId : req.user?.id;
    return fromToken || req.query.schoolId || req.body?.schoolId || null;
};

// --- Support: a school raises a ticket that lands in the super-admin panel. ---
export const postSupportTicket = async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req);
        if (!schoolId) return res.status(400).json({ error: "Could not identify your school" });

        const { subject, message, category, priority, raisedByName } = req.body || {};
        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({ error: "Subject and message are required" });
        }

        const school = await School.findOne({ id: schoolId }).lean();
        const ticket = await SupportTicket.create({
            schoolId,
            schoolName: school?.formData?.schoolName || '',
            schoolEmail: school?.email || '',
            campusCode: school?.campusCode || '',
            raisedByName: raisedByName?.trim() || school?.formData?.schoolName || '',
            subject: subject.trim(),
            message: message.trim(),
            category: category || 'General',
            priority: priority || 'Normal',
            status: 'OPEN',
            lastActivityAt: new Date(),
        });

        res.status(201).json({ message: "Ticket submitted", ticket });
    } catch (err) {
        console.error("postSupportTicket error:", err);
        res.status(500).json({ error: "Failed to submit ticket" });
    }
};

export const getSupportTickets = async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req);
        if (!schoolId) return res.status(400).json({ error: "Could not identify your school" });

        const tickets = await SupportTicket.find({ schoolId })
            .sort({ lastActivityAt: -1, createdAt: -1 })
            .lean();
        res.json(tickets);
    } catch (err) {
        console.error("getSupportTickets error:", err);
        res.status(500).json({ error: "Failed to load tickets" });
    }
};

export const getSupportTicketById = async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req);
        const ticket = await SupportTicket.findById(req.params.id).lean();
        if (!ticket || ticket.schoolId !== schoolId) return res.status(404).json({ error: "Ticket not found" });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: "Failed to load ticket" });
    }
};

export const postSupportTicketReply = async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req);
        const { text, authorName } = req.body || {};
        if (!text?.trim()) return res.status(400).json({ error: "Message is required" });

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket || ticket.schoolId !== schoolId) return res.status(404).json({ error: "Ticket not found" });

        ticket.replies.push({ from: 'school', authorName: authorName?.trim() || ticket.raisedByName, text: text.trim() });
        // A school reply re-opens a resolved/closed ticket for attention.
        if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') ticket.status = 'IN_PROGRESS';
        ticket.lastActivityAt = new Date();
        await ticket.save();

        res.json({ message: "Reply sent", ticket });
    } catch (err) {
        res.status(500).json({ error: "Failed to send reply" });
    }
};

// --- Notices from Scoolg: the school's inbox of super-admin broadcasts. ---
export const getScoolgNotices = async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req);
        if (!schoolId) return res.status(400).json({ error: "Could not identify your school" });

        const notices = await Broadcast.find({
            $or: [{ audience: 'ALL' }, { audience: 'SCHOOL', schoolId }],
        }).sort({ pinned: -1, createdAt: -1 }).lean();

        res.json(notices.map((n) => ({
            ...n,
            read: Array.isArray(n.readBy) && n.readBy.includes(schoolId),
            readBy: undefined,
        })));
    } catch (err) {
        console.error("getScoolgNotices error:", err);
        res.status(500).json({ error: "Failed to load notices" });
    }
};

export const postScoolgNoticeRead = async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req);
        if (!schoolId) return res.status(400).json({ error: "Could not identify your school" });
        await Broadcast.updateOne({ _id: req.params.id }, { $addToSet: { readBy: schoolId } });
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update" });
    }
};
