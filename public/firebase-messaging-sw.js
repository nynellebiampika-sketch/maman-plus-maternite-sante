// MAMAN+ Firebase Cloud Messaging & Web Push Service Worker
// Compatible with Chrome, Edge, Safari (iOS 16.4+ / macOS) and Android devices

// Import Firebase compat scripts for background messaging
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Initialize Firebase within the Service Worker using existing project configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAdMjzxjzqIEbmGSgmh-bDIjXyUf968xb8',
  authDomain: 'maman-62544.firebaseapp.com',
  projectId: 'maman-62544',
  storageBucket: 'maman-62544.firebasestorage.app',
  messagingSenderId: '44712893491',
  appId: '1:44712893491:web:4fa978ec1a78b95e751746',
};

if (firebase && !firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('[SW] Firebase initialize error:', err);
  }
}

let messaging = null;
try {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
  }
} catch (e) {
  console.warn('[SW] Firebase messaging unsupported in this worker context:', e);
}

// Background handler for Firebase Cloud Messaging
if (messaging) {
  messaging.onBackgroundMessage(function (payload) {
    console.log('[SW] Firebase onBackgroundMessage received:', payload);
    const title = payload.notification?.title || payload.data?.title || 'Bienvenue sur MAMAN+ 💗';
    const body =
      payload.notification?.body ||
      payload.data?.body ||
      payload.data?.message ||
      'Découvrez votre espace de suivi et prenez soin de vous et de votre bébé.';
    const targetUrl = payload.data?.url || payload.data?.path || '/ma-grossesse';

    const notificationOptions = {
      body: body,
      icon: payload.notification?.icon || '/maman_emblem.jpg',
      badge: '/maman_emblem.jpg',
      tag: payload.data?.tag || `maman-notif-${Date.now()}`,
      renotify: true,
      requireInteraction: false,
      actions: [
        { action: 'open_pregnancy', title: 'Appuyez ici pour commencer' }
      ],
      data: {
        url: targetUrl,
        path: payload.data?.path || targetUrl,
        id: payload.data?.id,
        type: payload.data?.type || 'welcome',
      },
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(title, notificationOptions).then(function () {
      console.log('NOTIFICATION DISPLAYED');
    });
  });
}

// Standard W3C Push Event Handler (Direct Web Push / VAPID fallback & primary phone/desktop reception)
self.addEventListener('push', function (event) {
  console.log('[SW] Standard push event received');
  let title = 'Bienvenue sur MAMAN+ 💗';
  let body = 'Découvrez votre espace de suivi et prenez soin de vous et de votre bébé.';
  let dataPayload = { url: '/ma-grossesse', path: '/ma-grossesse' };

  if (event.data) {
    try {
      const parsed = event.data.json();
      console.log('[SW] Parsed push JSON:', parsed);
      title = parsed.title || parsed.notification?.title || title;
      body = parsed.body || parsed.notification?.body || parsed.message || body;
      dataPayload = parsed.data || parsed;
      if (!dataPayload.url && parsed.url) {
        dataPayload.url = parsed.url;
      }
      if (!dataPayload.path && parsed.path) {
        dataPayload.path = parsed.path;
      }
    } catch (e) {
      const text = event.data.text();
      if (text) {
        body = text;
      }
    }
  }

  const targetUrl = dataPayload.url || dataPayload.path || '/ma-grossesse';

  const options = {
    body: body,
    icon: '/maman_emblem.jpg',
    badge: '/maman_emblem.jpg',
    tag: dataPayload.tag || `maman-push-${Date.now()}`,
    renotify: true,
    actions: [
      { action: 'open_pregnancy', title: 'Appuyez ici pour commencer' }
    ],
    data: {
      ...dataPayload,
      url: targetUrl,
      path: targetUrl,
    },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(function () {
      console.log('NOTIFICATION DISPLAYED');
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        clientList.forEach(function (client) {
          if (client.postMessage) {
            client.postMessage({
              type: 'MAMAN_NOTIFICATION_DISPLAYED',
              title: title,
              tag: options.tag,
            });
          }
        });
      });
    })
  );
});

// Notification Click Handler: Opens or focuses MAMAN+ and navigates to /ma-grossesse
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const rawUrl = event.notification.data?.url || event.notification.data?.path || '/ma-grossesse';
  const targetUrl = new URL(rawUrl, self.location.origin).href;
  console.log('[SW] Notification clicked, target URL:', targetUrl);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If a tab is already open, focus it and post a navigation message
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          client.focus();
          if ('postMessage' in client) {
            client.postMessage({
              type: 'MAMAN_NOTIFICATION_CLICK',
              path: rawUrl,
              url: targetUrl,
              data: event.notification.data,
            });
          }
          return;
        }
      }
      // If no window is currently open, open a new window with the destination URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Service worker install & activate lifecycle
self.addEventListener('install', function (event) {
  console.log('[SW] MAMAN+ Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  console.log('[SW] MAMAN+ Service Worker activated');
  event.waitUntil(self.clients.claim());
});
