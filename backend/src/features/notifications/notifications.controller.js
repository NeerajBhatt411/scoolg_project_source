import { DeviceToken } from '../../../models/DeviceToken.js';
import { Notification } from '../../../models/Notification.js';
import { pushEnabled, sendToTokens } from '../../utils/push.js';

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
        const { schoolId, role, userId, token } = req.body;
        if (!role || !token) return res.status(400).json({ error: "role and token are required" });
        const doc = await DeviceToken.findOneAndUpdate(
            { token },
            { schoolId, role, userId: userId ? String(userId) : undefined, token },
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
        const token = req.body?.token || req.query?.token;
        if (!token) return res.status(400).json({ error: "token required" });
        await DeviceToken.deleteOne({ token });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to unregister token" });
    }
};

// In-app notification history for a user.
export const listMine = async (req, res) => {
    try {
        const { schoolId, role, userId } = req.query;
        if (!role) return res.status(400).json({ error: "role required" });
        const q = { toRole: role };
        if (schoolId) q.schoolId = schoolId;
        if (userId) q.toId = String(userId);
        const items = await Notification.find(q).sort({ createdAt: -1 }).limit(50).lean();
        const unread = items.filter(n => !n.read).length;
        res.json({ items, unread });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markRead = async (req, res) => {
    try {
        await Notification.updateOne({ _id: req.params.id }, { read: true });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark read" });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const { schoolId, role, userId } = req.body;
        const q = { toRole: role, read: false };
        if (schoolId) q.schoolId = schoolId;
        if (userId) q.toId = String(userId);
        await Notification.updateMany(q, { read: true });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to mark all read" });
    }
};
