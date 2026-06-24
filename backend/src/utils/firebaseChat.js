import 'dotenv/config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/*
 * Firestore-backed chat helpers — no firebase-admin dependency (keeps the
 * Netlify function light). Reuses the same service account as push.js
 * (env FIREBASE_SERVICE_ACCOUNT, full JSON string):
 *   - mintCustomToken()  -> a Firebase custom token so the apps can sign in and
 *                           READ their own chat (security rules scope by claims)
 *   - addChatMessage()   -> write a message + bump the conversation doc via the
 *                           Firestore REST API (only the backend writes)
 *   - markChatRead()     -> reset a side's unread counter
 * Everything no-ops gracefully until FIREBASE_SERVICE_ACCOUNT is set.
 */
let sa = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
} catch (e) {
    console.error('⚠️ FIREBASE_SERVICE_ACCOUNT invalid JSON — chat (Firestore) disabled.', e.message);
    sa = null;
}

export const chatEnabled = () => !!sa;

const DOCS = () => `projects/${sa.project_id}/databases/(default)/documents`;

// --- Firebase custom token (for the client SDK signInWithCustomToken) ---
export const mintCustomToken = (uid, claims = {}) => {
    if (!sa) throw new Error('chat disabled');
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({
        iss: sa.client_email,
        sub: sa.client_email,
        aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
        iat: now,
        exp: now + 3600,
        uid: String(uid),
        claims,
    }, sa.private_key, { algorithm: 'RS256' });
};

// --- OAuth access token scoped for Firestore (datastore) ---
let cachedToken = null;
let cachedExp = 0;
const getAccessToken = async () => {
    if (cachedToken && Date.now() < cachedExp - 60_000) return cachedToken;
    const now = Math.floor(Date.now() / 1000);
    const assertion = jwt.sign({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/datastore',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    }, sa.private_key, { algorithm: 'RS256' });

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    });
    const json = await res.json();
    if (!json.access_token) throw new Error('Firestore token exchange failed: ' + JSON.stringify(json));
    cachedToken = json.access_token;
    cachedExp = Date.now() + (json.expires_in || 3600) * 1000;
    return cachedToken;
};

// JS value -> Firestore REST Value
const fsVal = (v) => {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    return { stringValue: String(v) };
};
const fsFields = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fsVal(v)]));

const commit = async (writes) => {
    if (!sa) return { disabled: true };
    const token = await getAccessToken();
    const res = await fetch(`https://firestore.googleapis.com/v1/${DOCS()}:commit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ writes }),
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error('Firestore commit failed: ' + res.status + ' ' + txt.slice(0, 300));
    }
    return res.json();
};

/**
 * Append a message to a student's group chat + update the conversation doc.
 * Only the backend (service account) writes — clients are read-only.
 * @param {object} opts
 *   schoolId, studentId      (Mongo _id strings)
 *   studentName, classSection (for the school-side conversation list)
 *   from: 'parent'|'admin'|'teacher', senderName, senderId, text
 *   bump: 'parent'|'school'  (which side's unread counter to increment)
 */
export const sendChatMessage = async (opts) => {
    if (!sa) { console.warn('[chat] Firestore disabled (no FIREBASE_SERVICE_ACCOUNT)'); return { disabled: true }; }
    const sid = String(opts.studentId);
    const msgId = crypto.randomUUID();
    const unreadField = opts.bump === 'parent' ? 'parentUnread' : 'schoolUnread';
    const text = String(opts.text || '').trim();
    const writes = [
        {
            update: {
                name: `${DOCS()}/chats/${sid}/messages/${msgId}`,
                fields: fsFields({ from: opts.from, senderName: opts.senderName || '', senderId: opts.senderId ? String(opts.senderId) : null, text }),
            },
            updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
        },
        {
            update: {
                name: `${DOCS()}/chats/${sid}`,
                fields: fsFields({ schoolId: String(opts.schoolId), studentId: sid, studentName: opts.studentName || '', classSection: opts.classSection || '', lastText: text, lastFrom: opts.from, lastSenderName: opts.senderName || '' }),
            },
            updateMask: { fieldPaths: ['schoolId', 'studentId', 'studentName', 'classSection', 'lastText', 'lastFrom', 'lastSenderName'] },
            updateTransforms: [
                { fieldPath: 'lastAt', setToServerValue: 'REQUEST_TIME' },
                { fieldPath: unreadField, increment: { integerValue: '1' } },
            ],
        },
    ];
    await commit(writes);
    return { id: msgId };
};

/** Reset a side's unread counter to 0. side = 'parent' | 'school'. */
export const markChatRead = async ({ studentId, side }) => {
    if (!sa) return { disabled: true };
    const sid = String(studentId);
    const field = side === 'parent' ? 'parentUnread' : 'schoolUnread';
    await commit([
        {
            update: { name: `${DOCS()}/chats/${sid}`, fields: { [field]: { integerValue: '0' } } },
            updateMask: { fieldPaths: [field] },
        },
    ]);
    return { ok: true };
};

export default { chatEnabled, mintCustomToken, sendChatMessage, markChatRead };
