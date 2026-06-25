/* Firebase Cloud Messaging service worker (background notifications).
   Uses the compat CDN build so it runs standalone in the SW context. */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDsw3LNqIDfQNemOr0A-w0sUHu7dGkgQ8o",
  authDomain: "scoolg-c17c7.firebaseapp.com",
  projectId: "scoolg-c17c7",
  storageBucket: "scoolg-c17c7.firebasestorage.app",
  messagingSenderId: "1051686115406",
  appId: "1:1051686115406:web:f36e13444e94c601364b1f",
});

const messaging = firebase.messaging();

// Backend sends DATA-ONLY messages, so we show exactly ONE notification here
// (a 'notification' payload would also be auto-shown by the browser -> duplicates).
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const n = payload.notification || {};
  self.registration.showNotification(d.title || n.title || 'Scoolg', {
    body: d.body || n.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: d.link || 'scoolg',   // collapse repeats for the same screen
    renotify: true,
    data: d,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then((wins) => {
    for (const w of wins) { if ('focus' in w) return w.focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
