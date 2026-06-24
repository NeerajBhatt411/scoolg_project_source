import jwt from 'jsonwebtoken';
import { DeviceToken } from '../../../models/DeviceToken.js';
import { Notification } from '../../../models/Notification.js';
import { pushEnabled, sendToTokens } from '../../utils/push.js';

// Resolve the signed-in recipient from the JWT (never trust role/userId from the
// request body/query — that allowed reading anyone's notifications). Returns null
// when there is no valid token.
const recipientFromToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    let decoded;
    try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'scoolg_secret_99');
    } catch (e) {
        return null;
    }
    let role;
    if (decoded.role === 'student') role = 'student';
    else if (decoded.type === 'teacher') role = 'teacher';
    else if (decoded.type === 'staff') role = 'staff';
    else role = 'owner';
    return { role, userId: String(decoded.id), schoolId: decoded.schoolId ? String(decoded.schoolId) : undefined };
};

// Diagnostic: is the Firebase service account configured (can we send)?
export const status = async (req, res) => {
    res.json({ pushEnabled: pushEnabled() });
};

// Send a one-off test push to a given device token (used by the in-app
// "Send test notification" button to verify the whole pipeline).
export const sendTest = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "token required" });
        const result = await sendToTokens([token], {
            title: '🔔 Scoolg test',
            body: 'Your notifications are working!',
            data: { link: '/' },
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to send test", details: err.message });
    }
};

// Save (or refresh) an FCM token for a signed-in user/device.
export const registerToken = async (req, res) => {
    try {
        const me = recipientFromToken(req);
        if (!me) return res.status(401).json({ error: "Authentication required" });
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "token is required" });
        const doc = await DeviceToken.findOneAndUpdate(
            { token },
            { schoolId: me.schoolId, role: me.role, userId: me.userId, token },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ ok: true, id: doc._id });
    } catch (err) {
        console.error("registerToken error:", err);
        res.status(500).json({ error: "Failed to register token" });
    }
};

// Remove a token (on logout / permission revoked).
export const unregisterToken = async (req, res) => {
    try {
        const me = recipientFromToken(req);
        if (!me) return res.status(401).json({ error: "Authentication required" });
        const token = req.body?.token || req.query?.token;
        if (!token) return res.status(400).json({ error: "token required" });
        await DeviceToken.deleteOne({ token, role: me.role, userId: me.userId });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to unregister token" });
    }
};

// In-app notification history for a user.
export const listMine = async (req, res) => {
    try {
        const me = recipientFromToken(req);
        if (!me) return res.status(401).json({ error: "Authentication required" });
        const q = { toRole: me.role, toId: me.userId };
        const items = await Notification.find(q).sort({ createdAt: -1 }).limit(50).lean();
        const unread = items.filter(n => !n.read).length;
        res.json({ items, unread });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markRead = async (req, res) => {
    try {
        const me = recipientFromToken(req);
        if (!me) return res.status(401).json({ error: "Authentication required" });
        const r = await Notification.updateOne({ _id: req.params.id, toRole: me.role, toId: me.userId }, { read: true });
        res.json({ ok: r.matchedCount > 0 });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark read" });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const me = recipientFromToken(req);
        if (!me) return res.status(401).json({ error: "Authentication required" });
        await Notification.updateMany({ toRole: me.role, toId: me.userId, read: false }, { read: true });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark all read" });
    }
};
