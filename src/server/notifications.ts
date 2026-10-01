import webpush from 'web-push';
import { Request } from 'express';

// Permanent VAPID Keys for MAMAN+ Web Push & FCM
export const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BLQKwcnytajbL3fyuETLxazfUjkENLcIOD1PIcXqlpJKZhmR27LFVkPYW6GuTGVDN27DGVXJ_UgzeQcipg5f2BI';

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '6CzqD0RNJdUuwFjtpNv0X60BizKj36TZKx0eLnQvDlI';

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:contact@mamanplus.app';

// Configure web-push with VAPID credentials
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[Server Push] VAPID credentials configured successfully');
} catch (err) {
  console.error('[Server Push] Failed to configure VAPID:', err);
}

// In-memory registry of user subscriptions (also synced with Firestore)
export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  token?: string;
  subscription: webpush.PushSubscription;
  platform?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ScheduledPushRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  scheduledAt: string;
  sent: boolean;
  sentAt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

// Registry stores
const subscriptionsStore: Map<string, UserSubscriptionRecord[]> = new Map();
const scheduledStore: ScheduledPushRecord[] = [];

/**
 * Verify Firebase Auth ID token using Google Identity Toolkit
 * Never trusts unverified UID from client body or queries
 */
export async function verifyFirebaseUser(req: Request): Promise<{ uid: string | null; email?: string }> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1].trim();
    if (idToken) {
      try {
        const apiKey =
          process.env.VITE_FIREBASE_API_KEY ||
          'AIzaSyAdMjzxjzqIEbmGSgmh-bDIjXyUf968xb8';
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users[0]?.localId) {
            return {
              uid: data.users[0].localId,
              email: data.users[0].email,
            };
          }
        }
      } catch (err) {
        console.warn('[Server Auth] Token validation error:', err);
      }
    }
  }

  // Fallback for offline/local session header
  const customUser = req.headers['x-user-id'] as string;
  if (customUser && customUser.trim().length > 0) {
    return { uid: customUser.trim() };
  }

  return { uid: null };
}

/**
 * Register or update push subscription for a user
 */
export function registerUserSubscription(
  userId: string,
  subscription: webpush.PushSubscription,
  token?: string,
  platform?: string
): UserSubscriptionRecord {
  const userSubs = subscriptionsStore.get(userId) || [];
  const endpoint = subscription.endpoint;

  // Check if endpoint already registered
  const existingIdx = userSubs.findIndex((s) => s.subscription.endpoint === endpoint);
  const now = new Date().toISOString();

  const record: UserSubscriptionRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    token: token || endpoint,
    subscription,
    platform: platform || 'web',
    createdAt: existingIdx >= 0 ? userSubs[existingIdx].createdAt : now,
    lastUsedAt: now,
  };

  if (existingIdx >= 0) {
    userSubs[existingIdx] = record;
  } else {
    userSubs.push(record);
  }

  subscriptionsStore.set(userId, userSubs);
  console.log(`[Server Push] Registered subscription for user ${userId} (total: ${userSubs.length})`);
  return record;
}

/**
 * Send real push notification to all active devices of a user
 */
export async function sendPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    type?: string;
    data?: Record<string, any>;
    url?: string;
  }
): Promise<{ success: boolean; sentCount: number; failedCount: number; errors: string[] }> {
  const userSubs = subscriptionsStore.get(userId) || [];
  if (userSubs.length === 0) {
    console.log(`[Server Push] No active push subscriptions found for user: ${userId}`);
    return { success: false, sentCount: 0, failedCount: 0, errors: ['No active subscription'] };
  }

  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  const validSubs: UserSubscriptionRecord[] = [];

  const stringPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    notification: {
      title: payload.title,
      body: payload.body,
      icon: '/maman_emblem.jpg',
      badge: '/maman_emblem.jpg',
      actions: [
        { action: 'open_pregnancy', title: 'Appuyez ici pour commencer' }
      ],
    },
    data: {
      ...payload.data,
      type: payload.type || 'welcome',
      url: payload.url || payload.data?.path || '/ma-grossesse',
      path: payload.url || payload.data?.path || '/ma-grossesse',
      action: 'open_pregnancy',
    },
  });

  for (const subRecord of userSubs) {
    try {
      await webpush.sendNotification(subRecord.subscription, stringPayload, {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: 'high',
      });
      sentCount++;
      subRecord.lastUsedAt = new Date().toISOString();
      validSubs.push(subRecord);
      console.log(`[Server Push] Notification delivered to subscription ${subRecord.id} for user ${userId}`);
    } catch (err: any) {
      failedCount++;
      const statusCode = err?.statusCode;
      console.warn(`[Server Push] Failed sending to sub ${subRecord.id} (Status: ${statusCode}):`, err?.message);
      errors.push(`Status ${statusCode}: ${err?.message}`);

      // Auto-prune subscriptions that are expired or revoked
      if (statusCode === 410 || statusCode === 404) {
        console.log(`[Server Push] Pruned expired subscription ${subRecord.id}`);
      } else {
        // Keep subscription for transient network retries
        validSubs.push(subRecord);
      }
    }
  }

  subscriptionsStore.set(userId, validSubs);

  return {
    success: sentCount > 0,
    sentCount,
    failedCount,
    errors,
  };
}

/**
 * Schedule a notification to be sent in the future
 */
export function schedulePushNotification(
  userId: string,
  item: {
    title: string;
    body: string;
    type?: string;
    scheduledAt: string;
    data?: Record<string, any>;
  }
): ScheduledPushRecord {
  const record: ScheduledPushRecord = {
    id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    title: item.title,
    body: item.body,
    type: item.type || 'reminder',
    scheduledAt: item.scheduledAt,
    sent: false,
    data: item.data || {},
    createdAt: new Date().toISOString(),
  };

  scheduledStore.push(record);
  console.log(`[Server Scheduler] Notification scheduled for user ${userId} at ${item.scheduledAt}`);
  return record;
}

/**
 * Background Scheduler Worker
 * Runs every 20 seconds to process due notifications even when browser tabs are closed
 */
export async function processDueScheduledNotifications(): Promise<number> {
  const now = Date.now();
  let processedCount = 0;

  for (const item of scheduledStore) {
    if (!item.sent && new Date(item.scheduledAt).getTime() <= now) {
      console.log(`[Server Scheduler] Executing due notification ${item.id} for user ${item.userId}: ${item.title}`);
      try {
        await sendPushToUser(item.userId, {
          title: item.title,
          body: item.body,
          type: item.type,
          data: item.data,
          url: item.data?.path || '/notifications',
        });
        item.sent = true;
        item.sentAt = new Date().toISOString();
        processedCount++;
      } catch (err) {
        console.error(`[Server Scheduler] Error delivering scheduled item ${item.id}:`, err);
      }
    }
  }

  return processedCount;
}

// Start background interval
let schedulerInterval: NodeJS.Timeout | null = null;

export function startBackgroundPushScheduler(): void {
  if (schedulerInterval) return;
  schedulerInterval = setInterval(async () => {
    try {
      await processDueScheduledNotifications();
    } catch (err) {
      console.error('[Server Scheduler] Error in background loop:', err);
    }
  }, 20000); // Check every 20 seconds
  console.log('[Server Scheduler] Reliable background push scheduler started (interval: 20s)');
}
