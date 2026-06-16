import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { DeviceToken } from '../../models/DeviceToken.js';
import { Notification } from '../../models/Notification.js';
import { Student } from '../../models/Student.js';

/*
 * FCM web push via the HTTP v1 REST API — no firebase-admin dependency
 * (keeps the Netlify function light + bundling-safe). Uses the service
 * account in env `FIREBASE_SERVICE_ACCOUNT` (the full JSON, as a string).
 * Everything no-ops gracefully until that env var is set, so the app keeps
 * working before Firebase is wired.
 */
let serviceAccount = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    }
} catch (e) {
    console.error('⚠️ FIREBASE_SERVICE_ACCOUNT is not valid JSON — push disabled.', e.message);
    serviceAccount = null;
}

export const pushEnabled = () => !!serviceAccount;

// --- cached OAuth access token for the FCM v1 API ---
let cachedToken = null;
let cachedExp = 0;

const getAccessToken = async () => {
    if (cachedToken && Date.now() < cachedExp - 60_000) return cachedToken;
    const now = Math.floor(Date.now() / 1000);
    const assertion = jwt.sign({
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    }, serviceAccount.private_key, { algorithm: 'RS256' });

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion,
        }),
    });
    const json = await res.json();
    if (!json.access_token) throw new Error('FCM token exchange failed: ' + JSON.stringify(json));
    cachedToken = json.access_token;
    cachedExp = Date.now() + (json.expires_in || 3600) * 1000;
    return cachedToken;
};

const sendOne = async (accessToken, token, payload) => {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: {
                token,
                notification: { title: payload.title, body: payload.body },
                data: Object.fromEntries(Object.entries(payload.data || {}).map(([k, v]) => [k, String(v)])),
                webpush: { fcmOptions: { link: payload.link || '/' } },
            },
        }),
    });
    return res;
};

/**
 * Send a push to a list of FCM tokens. Prunes tokens FCM reports as invalid.
 * @returns {{sent:number, failed:number, disabled?:boolean}}
 */
export const sendToTokens = async (tokens, payload) => {
    const list = [...new Set((tokens || []).filter(Boolean))];
    if (!pushEnabled()) { console.warn('[push] disabled (no FIREBASE_SERVICE_ACCOUNT)'); return { sent: 0, failed: 0, disabled: true }; }
    if (list.length === 0) return { sent: 0, failed: 0 };

    let accessToken;
    try { accessToken = await getAccessToken(); }
    catch (e) { console.error('[push] auth failed:', e.message); return { sent: 0, failed: list.length }; }

    let sent = 0, failed = 0; const dead = [];
    await Promise.all(list.map(async (token) => {
        try {
            const res = await sendOne(accessToken, token, payload);
            if (res.ok) { sent++; }
            else {
                failed++;
                if (res.status === 404 || res.status === 400) dead.push(token); // unregistered / invalid
            }
        } catch (e) { failed++; }
    }));
    if (dead.length) { try { await DeviceToken.deleteMany({ token: { $in: dead } }); } catch (e) { /* ignore */ } }
    return { sent, failed };
};

/**
 * High-level helper used by feature controllers: store a Notification record
 * for each recipient + push to all their devices.
 * @param {object} o { schoolId, toRole, recipients:[{userId}], title, body, type, data, link }
 */
export const notify = async ({ schoolId, toRole, recipients = [], title, body = '', type = 'general', data = {}, link }) => {
    if (!recipients.length) return { sent: 0, failed: 0 };
    // store history
    try {
        await Notification.insertMany(recipients.map(r => ({ schoolId, toRole, toId: String(r.userId), title, body, type, data })));
    } catch (e) { console.error('[notify] log failed:', e.message); }
    // collect tokens — match on role + userId (globally-unique _id), so a
    // schoolId-format mismatch can never cause a missed delivery.
    const ids = recipients.map(r => String(r.userId));
    const docs = await DeviceToken.find({ role: toRole, userId: { $in: ids } }).select('token').lean();
    return sendToTokens(docs.map(d => d.token), { title, body, data, link });
};

/**
 * Convenience: notify every student of a class (and section, or 'All' sections).
 * @param {object} o { schoolObjId, className, sectionName, title, body, type, data }
 */
export const notifyClassStudents = async ({ schoolObjId, className, sectionName, title, body = '', type = 'homework', data = {} }) => {
    const q = { schoolId: schoolObjId, class: className };
    if (sectionName && sectionName !== 'All') q.section = sectionName;
    const students = await Student.find(q).select('_id').lean();
    if (!students.length) return { sent: 0, failed: 0 };
    return notify({ schoolId: String(schoolObjId), toRole: 'student', recipients: students.map(s => ({ userId: s._id })), title, body, type, data });
};

/** Notify EVERY student of a school (e.g. a calendar event / school-wide notice). */
export const notifySchoolStudents = async ({ schoolObjId, title, body = '', type = 'general', data = {} }) => {
    const students = await Student.find({ schoolId: schoolObjId }).select('_id').lean();
    if (!students.length) return { sent: 0, failed: 0 };
    return notify({ schoolId: String(schoolObjId), toRole: 'student', recipients: students.map(s => ({ userId: s._id })), title, body, type, data });
};

export default { sendToTokens, notify, notifyClassStudents, notifySchoolStudents, pushEnabled };
