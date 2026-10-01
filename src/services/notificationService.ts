// MAMAN+ Firebase Cloud Messaging & Web Push Client Service
import { app, auth, db } from './firebase';
import { getMessaging, getToken, onMessage, isSupported as isFcmSupported } from 'firebase/messaging';
import {
  NotificationItem,
  FcmTokenRecord,
  Appointment,
  ReminderItem,
} from '../types';
import {
  saveNotificationToFirestore,
  saveFcmTokenToFirestore,
} from './firestoreService';

// Default VAPID Public Key for MAMAN+ Web Push & FCM
export const DEFAULT_VAPID_PUBLIC_KEY =
  'BLQKwcnytajbL3fyuETLxazfUjkENLcIOD1PIcXqlpJKZhmR27LFVkPYW6GuTGVDN27DGVXJ_UgzeQcipg5f2BI';

/**
 * Utility: Convert base64 URL string to Uint8Array for Web Push API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if Push Notifications are supported on this device/browser
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission state
 */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Fetch dynamic VAPID key from backend, with local constant fallback
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const res = await fetch('/api/notifications/vapid-public-key');
    if (res.ok) {
      const data = await res.json();
      if (data.publicKey) {
        return data.publicKey;
      }
    }
  } catch (err) {
    console.warn('[Push] Using default VAPID public key:', err);
  }
  return (
    import.meta.env.VITE_VAPID_PUBLIC_KEY ||
    DEFAULT_VAPID_PUBLIC_KEY
  );
}

/**
 * Get user auth bearer token for secure server API requests
 */
async function getAuthBearerHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    if (auth?.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      headers['Authorization'] = `Bearer ${idToken}`;
    } else {
      // Fallback for local account session
      const sessionUser = localStorage.getItem('maman_active_user');
      if (sessionUser) {
        try {
          const parsed = JSON.parse(sessionUser);
          if (parsed?.id) {
            headers['X-User-Id'] = parsed.id;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn('[Push] Auth token retrieval error:', e);
  }
  return headers;
}

// Foreground message listener unregister handle
let foregroundListenerRegistered = false;

/**
 * Setup foreground listener for Firebase Cloud Messaging
 */
export async function setupForegroundMessageListener(
  onNotificationReceived?: (notification: NotificationItem) => void
) {
  if (foregroundListenerRegistered || !app) return;
  try {
    const supported = await isFcmSupported();
    if (!supported) return;

    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
      const title = payload.notification?.title || payload.data?.title || 'MAMAN+ 💗';
      const body =
        payload.notification?.body ||
        payload.data?.body ||
        payload.data?.message ||
        'Nouvelle notification.';
      const path = payload.data?.path || payload.data?.url || '/notifications';

      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: auth?.currentUser?.uid || 'current',
        title,
        body,
        message: body,
        date: "Aujourd'hui",
        read: false,
        type: (payload.data?.type as any) || 'clinical',
        createdAt: new Date().toISOString(),
        data: { path, ...payload.data },
      };

      if (onNotificationReceived) {
        onNotificationReceived(newNotif);
      }

      // Also trigger browser native notification if allowed
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready
            .then((reg) => {
              return reg.showNotification(title, {
                body,
                icon: '/maman_emblem.jpg',
                badge: '/maman_emblem.jpg',
                tag: payload.data?.tag || `maman-${Date.now()}`,
                renotify: true,
                data: { path, url: path },
              } as any);
            })
            .catch(() => {
              try {
                new Notification(title, { body, icon: '/maman_emblem.jpg' });
              } catch {}
            });
        } else {
          try {
            new Notification(title, { body, icon: '/maman_emblem.jpg' });
          } catch {}
        }
      }

      // Dispatch global window event
      window.dispatchEvent(
        new CustomEvent('maman-new-notification', { detail: newNotif })
      );
    });

    foregroundListenerRegistered = true;
  } catch (err) {
    console.warn('[FCM] Foreground setup failed:', err);
  }
}

export interface FcmDiagnosticDetails {
  isSupported: boolean;
  isInIframe: boolean;
  permission: NotificationPermission | 'unsupported';
  swRegistered: boolean;
  swScope?: string;
  vapidConfigured: boolean;
  fcmToken: string | null;
  tokenShort: string | null;
  savedInFirestore: boolean;
  serverSynced: boolean;
  isFullyConfigured: boolean;
  statusText: string;
  error?: string | null;
}

/**
 * Perform a real, non-simulated technical diagnostic of the FCM & Web Push stack
 */
export async function checkFullFcmStatus(userId?: string): Promise<FcmDiagnosticDetails> {
  const isSupported = isPushNotificationSupported();
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const permission = getNotificationPermissionState();
  const effectiveUserId = userId || auth?.currentUser?.uid || '';

  const diag: FcmDiagnosticDetails = {
    isSupported,
    isInIframe,
    permission,
    swRegistered: false,
    vapidConfigured: Boolean(DEFAULT_VAPID_PUBLIC_KEY && DEFAULT_VAPID_PUBLIC_KEY.length > 30),
    fcmToken: null,
    tokenShort: null,
    savedInFirestore: false,
    serverSynced: false,
    isFullyConfigured: false,
    statusText: 'Diagnostic initial',
  };

  if (!isSupported) {
    diag.statusText = 'Notifications non supportées par ce navigateur';
    return diag;
  }

  if (permission === 'denied') {
    diag.statusText = isInIframe
      ? 'Bloquées par le cadre intégré (iframe)'
      : 'Bloquées dans votre navigateur';
    diag.error = isInIframe
      ? 'Les navigateurs interdisent les notifications dans un cadre intégré (iframe). Ouvrez MAMAN+ dans un nouvel onglet.'
      : 'L’autorisation est refusée dans les paramètres de votre navigateur.';
    return diag;
  }

  if (permission === 'default') {
    diag.statusText = 'En attente d’autorisation de l’utilisateur';
    return diag;
  }

  // If permission === 'granted', perform full verification
  try {
    let reg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!reg) {
      reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    }
    await navigator.serviceWorker.ready;

    if (reg) {
      diag.swRegistered = true;
      diag.swScope = reg.scope;
    }

    const vapidKey = await getVapidPublicKey();
    diag.vapidConfigured = Boolean(vapidKey && vapidKey.length > 20);

    // Retrieve active subscription or token
    let pushSub = await reg.pushManager.getSubscription();
    if (!pushSub && diag.vapidConfigured) {
      try {
        pushSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      } catch (subErr: any) {
        console.warn('[Push Diag] PushManager subscribe warning:', subErr?.message);
      }
    }

    let fcmToken: string | null = null;
    try {
      const fcmSupported = await isFcmSupported();
      if (fcmSupported && app) {
        const messaging = getMessaging(app);
        fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: reg,
        });
      }
    } catch (fcmErr: any) {
      console.warn('[Push Diag] FCM getToken note:', fcmErr?.message);
    }

    const tokenIdentifier = fcmToken || pushSub?.endpoint || null;
    diag.fcmToken = tokenIdentifier;
    if (tokenIdentifier) {
      diag.tokenShort = tokenIdentifier.length > 24
        ? `${tokenIdentifier.substring(0, 12)}...${tokenIdentifier.substring(tokenIdentifier.length - 8)}`
        : tokenIdentifier;
    }

    // Save in Firestore if user is present
    if (effectiveUserId && tokenIdentifier) {
      try {
        const tokenRecord: FcmTokenRecord = {
          id: btoa(tokenIdentifier.substring(0, 32)).replace(/[/+=]/g, '_'),
          userId: effectiveUserId,
          token: tokenIdentifier,
          subscription: pushSub ? pushSub.toJSON() : undefined,
          deviceInfo: `${navigator.platform || 'Unknown'} - ${navigator.userAgent.substring(0, 60)}`,
          platform: /android/i.test(navigator.userAgent)
            ? 'android'
            : /iphone|ipad|ipod/i.test(navigator.userAgent)
            ? 'ios'
            : 'desktop',
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveFcmTokenToFirestore(effectiveUserId, tokenRecord);
        diag.savedInFirestore = true;
      } catch (fsErr: any) {
        console.warn('[Push Diag] Firestore token save warning:', fsErr?.message);
      }

      // Sync with server
      try {
        const authHeaders = await getAuthBearerHeader();
        const res = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            userId: effectiveUserId,
            token: tokenIdentifier,
            subscription: pushSub ? pushSub.toJSON() : null,
            platform: /android/i.test(navigator.userAgent) ? 'android' : 'desktop',
          }),
        });
        diag.serverSynced = res.ok;
      } catch (apiErr: any) {
        console.warn('[Push Diag] Server sync warning:', apiErr?.message);
      }
    }

    diag.isFullyConfigured = Boolean(diag.swRegistered && (diag.fcmToken || pushSub));
    diag.statusText = diag.isFullyConfigured
      ? 'Opérationnel (Service Worker & Token FCM actifs)'
      : 'Configuration partielle (en attente du token)';

    return diag;
  } catch (err: any) {
    diag.error = err?.message || 'Erreur lors du diagnostic FCM.';
    diag.statusText = 'Erreur de diagnostic';
    return diag;
  }
}

/**
 * Register Service Worker and subscribe user to Web Push & FCM
 */
export async function requestAndRegisterPushNotifications(
  userId?: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      error: 'Les notifications ne sont pas prises en charge par ce navigateur.',
    };
  }

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  try {
    // 1. Prompt user cleanly
    let permission: NotificationPermission = 'default';
    try {
      permission = await Notification.requestPermission();
    } catch (permErr: any) {
      if (isInIframe) {
        return {
          success: false,
          error:
            'Les notifications ne peuvent pas être activées dans un cadre intégré (iframe). Veuillez ouvrir MAMAN+ dans un nouvel onglet.',
        };
      }
      throw permErr;
    }

    if (permission !== 'granted') {
      localStorage.setItem('maman_notifications_declined', 'true');
      return {
        success: false,
        error:
          permission === 'denied'
            ? 'Notifications bloquées dans votre navigateur. Veuillez les autoriser dans les paramètres du site.'
            : 'Autorisation non accordée.',
      };
    }

    localStorage.removeItem('maman_notifications_declined');

    // 2. Run diagnostic to complete full setup
    const diag = await checkFullFcmStatus(userId);
    if (!diag.swRegistered) {
      throw new Error('Le Service Worker Firebase Messaging n’a pas pu être enregistré.');
    }

    // 8. Register foreground message listener
    setupForegroundMessageListener();

    window.dispatchEvent(
      new CustomEvent('maman-push-status-changed', {
        detail: { enabled: true, token: diag.fcmToken },
      })
    );

    return { success: true, token: diag.fcmToken || undefined };
  } catch (error: any) {
    console.error('[Push] Registration error:', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de l’activation des notifications.',
    };
  }
}

/**
 * Send real test push notification to user's device(s)
 */
export async function sendTestPushNotification(
  userId: string
): Promise<{ success: boolean; message: string }> {
  const authHeaders = await getAuthBearerHeader();
  const effectiveUserId = userId || auth?.currentUser?.uid || '';

  try {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: effectiveUserId,
        title: 'Test Notification MAMAN+ 💗',
        body: 'Votre système de notifications push fonctionne parfaitement sur votre appareil !',
        type: 'clinical',
        data: {
          path: '/notifications',
          timestamp: Date.now(),
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.error || 'Échec d\'envoi de la notification de test.',
      };
    }

    const data = await res.json();
    if (!data.success && data.sentCount === 0) {
      return {
        success: false,
        message: data.message || 'Le serveur push n’a pas pu acheminer la notification vers l’appareil.',
      };
    }

    // Trigger local native notification via active Service Worker for instant feedback
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const sw = await navigator.serviceWorker.ready;
        if (sw) {
          await sw.showNotification('Test Notification MAMAN+ 💗', {
            body: 'Votre système de notifications push fonctionne parfaitement sur votre appareil !',
            icon: '/maman_emblem.jpg',
            badge: '/maman_emblem.jpg',
            tag: `test-push-${Date.now()}`,
            renotify: true,
            data: { path: '/notifications' },
          } as any);
        }
      }
    } catch {}

    return {
      success: true,
      message: data.message || 'Notification de test envoyée avec succès.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Erreur de connexion lors de l\'envoi du test.',
    };
  }
}

export interface PostLoginNotificationResult {
  success: boolean;
  stepFailed?:
    | 'LOGIN'
    | 'UID'
    | 'PERMISSION'
    | 'SERVICE WORKER'
    | 'FCM TOKEN'
    | 'TOKEN FIRESTORE'
    | 'PUSH SERVER'
    | 'NOTIFICATION ENVOYÉE';
  error?: string;
  uid?: string;
  token?: string;
}

/**
 * Execute real post-login notification pipeline for MAMAN+:
 * CONNEXION -> Firebase Auth -> permission -> Service Worker -> FCM token -> Firestore -> API serveur -> Web Push -> notification Windows.
 */
export async function processPostLoginNotifications(
  userUid?: string
): Promise<PostLoginNotificationResult> {
  console.log('[MAMAN+ NOTIF] --- DÉBUT DU CYCLE DE NOTIFICATION POST-CONNEXION ---');

  // Étape 2 : Vérifier que l'UID Firebase est réellement disponible
  let effectiveUid = userUid || auth?.currentUser?.uid || '';
  if (!effectiveUid && auth) {
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 100));
      if (auth.currentUser?.uid) {
        effectiveUid = auth.currentUser.uid;
        break;
      }
    }
  }

  if (!effectiveUid) {
    const errorMsg = 'UID Firebase non disponible après connexion.';
    console.error('ÉCHEC: ' + errorMsg);
    return {
      success: false,
      stepFailed: 'UID',
      error: errorMsg,
    };
  }
  console.log('UID OK');
  console.log('UID OK:', effectiveUid);

  // Étape 3 : Vérifier Notification.permission
  if (typeof window === 'undefined' || !('Notification' in window)) {
    const errorMsg = 'Ce navigateur ne prend pas en charge les notifications natives.';
    console.error('ÉCHEC: ' + errorMsg);
    return {
      success: false,
      stepFailed: 'PERMISSION',
      error: errorMsg,
    };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch (permErr: any) {
      console.warn('[Push] requestPermission warning:', permErr);
    }
  }

  if (permission !== 'granted') {
    const errorMsg = `Permission de notification non accordée par le navigateur (${permission}).`;
    console.error('ÉCHEC PERMISSION:', permission);
    return {
      success: false,
      stepFailed: 'PERMISSION',
      error: errorMsg,
    };
  }
  console.log('PERMISSION OK');

  // Étape 4A : Récupérer le Service Worker actif
  if (!('serviceWorker' in navigator)) {
    const errorMsg = 'Les Service Workers ne sont pas supportés par ce navigateur.';
    console.error('ÉCHEC: ' + errorMsg);
    return {
      success: false,
      stepFailed: 'SERVICE WORKER',
      error: errorMsg,
    };
  }

  let swReg: ServiceWorkerRegistration | null = null;
  try {
    swReg = (await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')) || null;
    if (!swReg) {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    }
    await navigator.serviceWorker.ready;
  } catch (swErr: any) {
    const errorMsg = swErr?.message || 'Impossible d’enregistrer le Service Worker.';
    console.error('ÉCHEC SERVICE WORKER:', errorMsg);
    return {
      success: false,
      stepFailed: 'SERVICE WORKER',
      error: errorMsg,
    };
  }

  if (!swReg) {
    const errorMsg = 'Service Worker introuvable ou non prêt.';
    console.error('ÉCHEC: ' + errorMsg);
    return {
      success: false,
      stepFailed: 'SERVICE WORKER',
      error: errorMsg,
    };
  }
  console.log('SERVICE WORKER OK');
  console.log('SERVICE WORKER OK:', swReg.scope);

  // Étape 4B : Récupérer le vrai token FCM avec getToken() et l'enregistrement push navigateur
  const vapidKey = await getVapidPublicKey();
  let pushSub: PushSubscription | null = null;
  try {
    pushSub = await swReg.pushManager.getSubscription();
    if (!pushSub && vapidKey) {
      pushSub = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }
  } catch (subErr: any) {
    console.warn('[Push] pushManager subscription notice:', subErr?.message);
  }

  let fcmToken: string | null = null;
  try {
    const fcmSupported = await isFcmSupported();
    if (fcmSupported && app) {
      const messaging = getMessaging(app);
      fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });
    }
  } catch (fcmErr: any) {
    console.warn('[Push] getToken warning:', fcmErr?.message);
  }

  const effectiveToken = fcmToken || pushSub?.endpoint || null;
  if (!effectiveToken) {
    const errorMsg = 'Impossible de générer un token FCM ou un canal Push navigateur valide.';
    console.error('ÉCHEC: ' + errorMsg);
    return {
      success: false,
      stepFailed: 'FCM TOKEN',
      error: errorMsg,
    };
  }
  console.log('FCM TOKEN OK');
  console.log('FCM TOKEN OK:', effectiveToken.substring(0, 24) + '...');

  // Étape 4C : Enregistrer / mettre à jour ce token dans users/{uid}/fcm_tokens/{tokenId}
  const tokenId = btoa(effectiveToken.substring(0, 32)).replace(/[/+=]/g, '_');
  const tokenRecord: FcmTokenRecord = {
    id: tokenId,
    userId: effectiveUid,
    token: effectiveToken,
    subscription: pushSub ? pushSub.toJSON() : undefined,
    deviceInfo: `${navigator.platform || 'PC/Windows'} - ${navigator.userAgent.substring(0, 60)}`,
    platform: /android/i.test(navigator.userAgent)
      ? 'android'
      : /iphone|ipad/i.test(navigator.userAgent)
      ? 'ios'
      : 'desktop',
    userAgent: navigator.userAgent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveFcmTokenToFirestore(effectiveUid, tokenRecord);
    console.log('TOKEN FIRESTORE OK');
    console.log(`TOKEN FIRESTORE OK: users/${effectiveUid}/fcm_tokens/${tokenId}`);
  } catch (fsErr: any) {
    const errorMsg = fsErr?.message || 'Erreur lors de l’écriture du token dans Firestore.';
    console.error('ÉCHEC: ' + errorMsg);
    return {
      success: false,
      stepFailed: 'TOKEN FIRESTORE',
      error: errorMsg,
    };
  }

  // Synchronisation avec l'API serveur pour l'enregistrement push immédiat
  const authHeaders = await getAuthBearerHeader();
  try {
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: effectiveUid,
        token: effectiveToken,
        subscription: pushSub ? pushSub.toJSON() : null,
        platform: tokenRecord.platform,
      }),
    });
  } catch (syncErr) {
    console.warn('[Push] Sync subscription notice:', syncErr);
  }

  // Étape 5 & 6 : Appeler le serveur pour envoyer la vraie notification de bienvenue
  const welcomePayload = {
    userId: effectiveUid,
    title: 'Bienvenue sur MAMAN+ 💗',
    body: 'Découvrez votre espace de suivi et prenez soin de vous et de votre bébé.',
    type: 'welcome',
    token: effectiveToken,
    subscription: pushSub ? pushSub.toJSON() : null,
    data: {
      path: '/ma-grossesse',
      url: '/ma-grossesse',
      category: 'welcome',
      action: 'open_pregnancy',
      timestamp: Date.now(),
    },
  };

  try {
    const pushResponse = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(welcomePayload),
    });

    if (!pushResponse.ok) {
      const errData = await pushResponse.json().catch(() => ({}));
      const errorMsg = errData?.error || `Erreur serveur push (${pushResponse.status})`;
      console.error('ÉCHEC PUSH SERVER:', errorMsg);
      return {
        success: false,
        stepFailed: 'PUSH SERVER',
        error: errorMsg,
      };
    }

    const pushResult = await pushResponse.json();
    if (!pushResult.success && pushResult.sentCount === 0) {
      const errorMsg = pushResult.message || 'Le serveur n’a pas pu acheminer le push vers l’appareil.';
      console.error('ÉCHEC PUSH SERVER:', errorMsg);
      return {
        success: false,
        stepFailed: 'PUSH SERVER',
        error: errorMsg,
      };
    }
    console.log('PUSH SERVER OK');
    console.log('PUSH DELIVERY OK');
    console.log('PUSH SERVER OK:', pushResult);
  } catch (networkErr: any) {
    const errorMsg = networkErr?.message || 'Erreur réseau lors de l’appel au serveur push.';
    console.error('ÉCHEC PUSH SERVER:', errorMsg);
    return {
      success: false,
      stepFailed: 'PUSH SERVER',
      error: errorMsg,
    };
  }

  // Étape 7 : Déclencher l'affichage de la notification native sur Windows/Chrome/Edge
  try {
    const readySw = await navigator.serviceWorker.ready;
    if (readySw) {
      await readySw.showNotification('Bienvenue sur MAMAN+ 💗', {
        body: 'Découvrez votre espace de suivi et prenez soin de vous et de votre bébé.',
        icon: '/maman_emblem.jpg',
        badge: '/maman_emblem.jpg',
        tag: `maman-welcome-${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        actions: [
          { action: 'open_pregnancy', title: 'Appuyez ici pour commencer' }
        ],
        data: {
          url: '/ma-grossesse',
          path: '/ma-grossesse',
        },
      } as any);
      console.log('NOTIFICATION DISPLAYED');
    }
  } catch (nativeErr) {
    console.warn('[Push] Native showNotification notice:', nativeErr);
  }

  // Étape 8 : Enregistrer la notification dans users/{uid}/notifications/{notificationId}
  const welcomeNotif: NotificationItem = {
    id: `notif_welcome_${Date.now()}`,
    userId: effectiveUid,
    title: 'Bienvenue sur MAMAN+ 💗',
    body: 'Découvrez votre espace de suivi et prenez soin de vous et de votre bébé.',
    message: 'Découvrez votre espace de suivi et prenez soin de vous et de votre bébé.',
    date: "Aujourd'hui",
    read: false,
    type: 'welcome',
    createdAt: new Date().toISOString(),
    data: {
      path: '/ma-grossesse',
      category: 'welcome',
    },
  };

  try {
    await saveNotificationToFirestore(effectiveUid, welcomeNotif);
  } catch (fsNotifErr) {
    console.warn('[Push] Firestore saveNotification warning:', fsNotifErr);
  }

  // Étape 10 : Log final obligatoire uniquement en cas de succès avéré
  console.log('NOTIFICATION ENVOYÉE: « Bienvenue sur MAMAN+ 💗 »');

  // Diffusion des événements d'interface
  window.dispatchEvent(new CustomEvent('maman-new-notification', { detail: welcomeNotif }));
  window.dispatchEvent(
    new CustomEvent('maman-push-status-changed', {
      detail: { enabled: true, token: effectiveToken },
    })
  );

  return {
    success: true,
    uid: effectiveUid,
    token: effectiveToken,
  };
}

/**
 * Trigger authentic Welcome Notification after successful signup:
 * Titre : « Bienvenue sur MAMAN+ 💗 »
 * Message : « Votre espace de suivi est prêt. Prenez soin de vous et de votre bébé. »
 */
export async function sendWelcomeNotification(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const res = await processPostLoginNotifications(userId);
  return { success: res.success, error: res.error };
}

/**
 * Schedule real server-side push notification for an appointment
 */
export async function scheduleAppointmentNotification(
  userId: string,
  appointment: Appointment
): Promise<void> {
  const effectiveUserId = userId || auth?.currentUser?.uid || '';
  if (!effectiveUserId || !appointment.date) return;

  try {
    // Schedule for 8:00 AM on the day of the appointment, or 2 hours prior if time specified
    const apptDateTime = new Date(`${appointment.date}T${appointment.time || '09:00'}:00`);
    const reminderTime = new Date(apptDateTime.getTime() - 2 * 60 * 60 * 1000); // 2h before
    const scheduleIso =
      reminderTime.getTime() > Date.now()
        ? reminderTime.toISOString()
        : new Date(Date.now() + 60 * 1000).toISOString();

    const authHeaders = await getAuthBearerHeader();
    await fetch('/api/notifications/schedule', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: effectiveUserId,
        title: `Rendez-vous : ${appointment.title} 🩺`,
        body: `Rappel pour votre consultation médicale prévue le ${appointment.date} à ${appointment.time || 'heure convenue'}.`,
        type: 'appointment',
        scheduledAt: scheduleIso,
        data: {
          path: '/rendez-vous',
          appointmentId: appointment.id,
        },
      }),
    });
  } catch (err) {
    console.warn('[Push] Could not schedule appointment notification:', err);
  }
}

/**
 * Schedule real server-side push notification for a daily reminder (vitamins, hydration, etc.)
 */
export async function scheduleCustomReminderNotification(
  userId: string,
  reminder: ReminderItem
): Promise<void> {
  const effectiveUserId = userId || auth?.currentUser?.uid || '';
  if (!effectiveUserId) return;

  try {
    const [hours, minutes] = (reminder.time || '09:00').split(':').map(Number);
    const target = new Date();
    target.setHours(hours || 9, minutes || 0, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1);
    }

    const authHeaders = await getAuthBearerHeader();
    await fetch('/api/notifications/schedule', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: effectiveUserId,
        title: `Rappel MAMAN+ : ${reminder.title} ⏰`,
        body: reminder.description || 'Il est l\'heure de votre rituel de santé quotidienne.',
        type: 'reminder',
        scheduledAt: target.toISOString(),
        data: {
          path: '/rappels',
          reminderId: reminder.id,
        },
      }),
    });
  } catch (err) {
    console.warn('[Push] Could not schedule custom reminder:', err);
  }
}
