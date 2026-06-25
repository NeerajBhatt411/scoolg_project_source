import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

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

// One app instance for the whole tab (Firestore + Auth + Messaging share it).
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const chatAuth = getAuth(app);

/**
 * Sign in to Firebase with a custom token from our backend so Firestore security
 * rules can scope chat reads to the right school / student.
 * @param {() => Promise<{token:string}>} fetchToken
 */
let signingIn = null;
export async function ensureChatAuth(fetchToken) {
  if (chatAuth.currentUser) return chatAuth.currentUser;
  if (signingIn) return signingIn;
  signingIn = (async () => {
    const data = await fetchToken();
    if (!data?.token) throw new Error('No chat token');
    await signInWithCustomToken(chatAuth, data.token);
    return chatAuth.currentUser;
  })();
  try { return await signingIn; }
  finally { signingIn = null; }
}

let messaging = null;

// Request permission, get the FCM token, hand it to onToken() for backend
// registration, and forward foreground messages via a 'push-message' event.
export async function initPush({ role, userId, schoolId, onToken }) {
  try {
    if (!VAPID_KEY) { console.warn('[push] VAPID key not set yet'); return; }
    if (!(await isSupported())) { console.warn('[push] not supported on this browser'); return; }
    if (typeof Notification === 'undefined') return;

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
      // App is OPEN (foreground): FCM won't auto-show anything. Surface a single
      // system notification ourselves — unless the user is already on the chat
      // screen (they see it live there).
      try {
        const d = payload.data || {};
        const onChat = typeof location !== 'undefined' && location.pathname.startsWith('/chat');
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && !onChat) {
          navigator.serviceWorker.getRegistration('/firebase-push/').then((reg) => {
            reg && reg.showNotification(d.title || 'Scoolg', {
              body: d.body || '', icon: '/scoolg-logo.png', badge: '/scoolg-logo.png',
              tag: d.link || 'scoolg', renotify: true, data: d,
            });
          }).catch(() => {});
        }
      } catch (e) { /* ignore */ }
    });

    return token;
  } catch (e) {
    console.warn('[push] init failed', e);
  }
}
