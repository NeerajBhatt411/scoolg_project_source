import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDsw3LNqIDfQNemOr0A-w0sUHu7dGkgQ8o",
  authDomain: "scoolg-c17c7.firebaseapp.com",
  projectId: "scoolg-c17c7",
  storageBucket: "scoolg-c17c7.firebasestorage.app",
  messagingSenderId: "1051686115406",
  appId: "1:1051686115406:web:f36e13444e94c601364b1f",
  measurementId: "G-Q3KHCTDZ2X",
};

// Web Push (VAPID) public key — paste from Firebase → Cloud Messaging →
// "Web Push certificates". Until set, push registration safely no-ops.
const VAPID_KEY = 'BHIFUjnRPRiE_uFjz-Q7AaExJBZckgYhu2Tqv0ssDzcr5oVY8P4fhVd7rEO0ej6j6PSQmxFAd9SAEoKmy4lcxTs';

let app = null;
let messaging = null;

// Request permission, get the FCM token, hand it to onToken() for backend
// registration, and forward foreground messages via a 'push-message' event.
export async function initPush({ role, userId, schoolId, onToken }) {
  try {
    if (!VAPID_KEY) { console.warn('[push] VAPID key not set yet'); return; }
    if (!(await isSupported())) { console.warn('[push] not supported on this browser'); return; }
    if (typeof Notification === 'undefined') return;

    app = app || initializeApp(firebaseConfig);
    messaging = messaging || getMessaging(app);

    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { console.warn('[push] permission:', perm); return; }

    // Register the FCM service worker on its OWN scope so it never clobbers
    // the PWA service worker.
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/firebase-push/' });

    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (token && onToken) { try { await onToken(token); } catch (e) { console.warn('[push] register token failed', e); } }

    onMessage(messaging, (payload) => {
      window.dispatchEvent(new CustomEvent('push-message', { detail: payload }));
    });

    return token;
  } catch (e) {
    console.warn('[push] init failed', e);
  }
}
