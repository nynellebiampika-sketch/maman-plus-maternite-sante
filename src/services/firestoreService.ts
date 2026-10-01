import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  User,
  SymptomLog,
  WeightEntry,
  Appointment,
  BabyInfo,
  MedicalExam,
  JournalEntry,
  ChecklistItem,
  ReminderItem,
  NotificationItem,
  FcmTokenRecord,
  AiConversation,
  Prescription,
} from '../types';

/**
 * Resolves the authenticated user ID.
 * When a user is signed in to Firebase Auth, Firestore security rules strictly require
 * request.auth.uid == userId for documents under /users/{userId}.
 * Resolving to auth.currentUser.uid guarantees that even if a legacy or temporary
 * local ID was passed, the operation targets the authentic UID and avoids permission errors.
 */
function resolveUserId(userId?: string | null): string {
  if (auth?.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  return userId?.trim() || '';
}

/**
 * Deeply sanitizes an object or array to remove any `undefined` values,
 * which are rejected by the Firestore JS SDK with 'Unsupported field value: undefined'.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean as T;
}

/**
 * Real Firestore user profile persistence
 */
export async function saveUserProfileToFirestore(user: User): Promise<void> {
  if (!db) return;
  const targetId = resolveUserId(user.id);
  if (!targetId) return;

  const path = `users/${targetId}`;
  try {
    const userRef = doc(db, 'users', targetId);
    await setDoc(
      userRef,
      sanitizeForFirestore({
        ...user,
        id: targetId,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getUserProfileFromFirestore(userId: string): Promise<User | null> {
  if (!db) return null;
  const targetId = resolveUserId(userId);
  if (!targetId) return null;

  const path = `users/${targetId}`;
  try {
    const userRef = doc(db, 'users', targetId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { ...(snap.data() as User), id: targetId };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// -------------------------------------------------------------
// Symptoms
// -------------------------------------------------------------
export async function getSymptomsFromFirestore(userId: string): Promise<SymptomLog[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/symptoms`;
  try {
    const colRef = collection(db, 'users', uid, 'symptoms');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SymptomLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addSymptomToFirestore(userId: string, log: SymptomLog): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/symptoms/${log.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'symptoms', log.id), sanitizeForFirestore(log));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateSymptomInFirestore(
  userId: string,
  logId: string,
  updates: Partial<SymptomLog>
): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/symptoms/${logId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'symptoms', logId), sanitizeForFirestore(updates), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteSymptomFromFirestore(userId: string, logId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/symptoms/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'symptoms', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Weights
// -------------------------------------------------------------
export async function getWeightsFromFirestore(userId: string): Promise<WeightEntry[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/weights`;
  try {
    const colRef = collection(db, 'users', uid, 'weights');
    const q = query(colRef, orderBy('date', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WeightEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addWeightToFirestore(userId: string, entry: WeightEntry): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/weights/${entry.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'weights', entry.id), sanitizeForFirestore(entry));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateWeightInFirestore(
  userId: string,
  entryId: string,
  updates: Partial<WeightEntry>
): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/weights/${entryId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'weights', entryId), sanitizeForFirestore(updates), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteWeightFromFirestore(userId: string, entryId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/weights/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'weights', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Appointments
// -------------------------------------------------------------
export async function getAppointmentsFromFirestore(userId: string): Promise<Appointment[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/appointments`;
  try {
    const colRef = collection(db, 'users', uid, 'appointments');
    const q = query(colRef, orderBy('date', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Appointment);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveAppointmentToFirestore(userId: string, appt: Appointment): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/appointments/${appt.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'appointments', appt.id), sanitizeForFirestore(appt), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteAppointmentFromFirestore(userId: string, apptId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/appointments/${apptId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'appointments', apptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Baby Info
// -------------------------------------------------------------
export async function getBabyInfoFromFirestore(userId: string): Promise<BabyInfo | null> {
  if (!db) return null;
  const uid = resolveUserId(userId);
  if (!uid) return null;

  const path = `users/${uid}/settings/babyInfo`;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'babyInfo');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as BabyInfo;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveBabyInfoToFirestore(userId: string, babyInfo: BabyInfo): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/settings/babyInfo`;
  try {
    await setDoc(doc(db, 'users', uid, 'settings', 'babyInfo'), sanitizeForFirestore(babyInfo), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteBabyInfoFromFirestore(userId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/settings/babyInfo`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'settings', 'babyInfo'));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Medical Exams
// -------------------------------------------------------------
export async function getExamsFromFirestore(userId: string): Promise<MedicalExam[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/exams`;
  try {
    const colRef = collection(db, 'users', uid, 'exams');
    const q = query(colRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MedicalExam);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveExamToFirestore(userId: string, exam: MedicalExam): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/exams/${exam.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'exams', exam.id), sanitizeForFirestore(exam), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteExamFromFirestore(userId: string, examId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/exams/${examId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'exams', examId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Journal Entries
// -------------------------------------------------------------
export async function getJournalFromFirestore(userId: string): Promise<JournalEntry[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/journal`;
  try {
    const colRef = collection(db, 'users', uid, 'journal');
    const q = query(colRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as JournalEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveJournalToFirestore(userId: string, entry: JournalEntry): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/journal/${entry.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'journal', entry.id), sanitizeForFirestore(entry), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteJournalFromFirestore(userId: string, entryId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/journal/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'journal', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Checklist
// -------------------------------------------------------------
export async function getChecklistFromFirestore(userId: string): Promise<ChecklistItem[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/checklist`;
  try {
    const colRef = collection(db, 'users', uid, 'checklist');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as ChecklistItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveChecklistItemToFirestore(userId: string, item: ChecklistItem): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/checklist/${item.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'checklist', item.id), sanitizeForFirestore(item), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteChecklistItemFromFirestore(userId: string, itemId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/checklist/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'checklist', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Reminders
// -------------------------------------------------------------
export async function getRemindersFromFirestore(userId: string): Promise<ReminderItem[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/reminders`;
  try {
    const colRef = collection(db, 'users', uid, 'reminders');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as ReminderItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveReminderToFirestore(userId: string, reminder: ReminderItem): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/reminders/${reminder.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'reminders', reminder.id), sanitizeForFirestore(reminder), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteReminderFromFirestore(userId: string, reminderId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/reminders/${reminderId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'reminders', reminderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Saved Advice & Videos
// -------------------------------------------------------------
export async function getSavedAdviceFromFirestore(userId: string): Promise<string[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/settings/savedAdvice`;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'savedAdvice');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().ids || [];
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveSavedAdviceToFirestore(userId: string, ids: string[]): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/settings/savedAdvice`;
  try {
    await setDoc(doc(db, 'users', uid, 'settings', 'savedAdvice'), sanitizeForFirestore({ ids }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getSavedVideosFromFirestore(userId: string): Promise<string[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/settings/savedVideos`;
  try {
    const ref = doc(db, 'users', uid, 'settings', 'savedVideos');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().ids || [];
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveSavedVideosToFirestore(userId: string, ids: string[]): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/settings/savedVideos`;
  try {
    await setDoc(doc(db, 'users', uid, 'settings', 'savedVideos'), sanitizeForFirestore({ ids }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Notifications (users/{uid}/notifications/{notificationId})
// -------------------------------------------------------------
export async function getNotificationsFromFirestore(userId: string): Promise<NotificationItem[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/notifications`;
  try {
    const colRef = collection(db, 'users', uid, 'notifications');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: uid,
          title: data.title || '',
          body: data.body || data.message || '',
          message: data.body || data.message || '',
          date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Aujourd\'hui'),
          read: Boolean(data.read),
          type: data.type || 'general',
          scheduledAt: data.scheduledAt,
          data: data.data || {},
          createdAt: data.createdAt || new Date().toISOString(),
        } as NotificationItem;
      });
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Graceful fallback & migration: check legacy settings/notifications document
    const legacyPath = `users/${uid}/settings/notifications`;
    const legacyRef = doc(db, 'users', uid, 'settings', 'notifications');
    const legacySnap = await getDoc(legacyRef);
    if (legacySnap.exists()) {
      const legacyItems: NotificationItem[] = legacySnap.data().items || [];
      // Migrate asynchronously in background
      Promise.all(legacyItems.map((item) => saveNotificationToFirestore(uid, item))).catch(() => {});
      return legacyItems;
    }

    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveNotificationToFirestore(userId: string, item: NotificationItem): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/notifications/${item.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'notifications', item.id);
    const payload = sanitizeForFirestore({
      title: item.title,
      body: item.body || item.message,
      message: item.message || item.body || '',
      type: item.type || 'general',
      read: Boolean(item.read),
      date: item.date || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      createdAt: item.createdAt || new Date().toISOString(),
      scheduledAt: item.scheduledAt || null,
      data: item.data || {},
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function saveNotificationsToFirestore(userId: string, items: NotificationItem[]): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  // Save each notification in users/{uid}/notifications/{id}
  for (const item of items) {
    await saveNotificationToFirestore(uid, item);
  }
}

export async function deleteNotificationFromFirestore(userId: string, notificationId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/notifications/${notificationId}`;
  try {
    const docRef = doc(db, 'users', uid, 'notifications', notificationId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function markNotificationAsReadInFirestore(userId: string, notificationId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/notifications/${notificationId}`;
  try {
    const docRef = doc(db, 'users', uid, 'notifications', notificationId);
    await setDoc(docRef, { read: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function markAllNotificationsAsReadInFirestore(userId: string, notificationIds: string[]): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  for (const id of notificationIds) {
    await markNotificationAsReadInFirestore(uid, id);
  }
}

// -------------------------------------------------------------
// FCM Push Tokens (users/{uid}/fcm_tokens/{tokenId})
// -------------------------------------------------------------
export async function saveFcmTokenToFirestore(userId: string, tokenRecord: FcmTokenRecord): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/fcm_tokens/${tokenRecord.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'fcm_tokens', tokenRecord.id);
    await setDoc(docRef, sanitizeForFirestore({
      ...tokenRecord,
      userId: uid,
      updatedAt: new Date().toISOString(),
    }), { merge: true });

    // Also update parent user record with last active token
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, sanitizeForFirestore({
      lastFcmToken: tokenRecord.token,
      fcmUpdatedAt: new Date().toISOString(),
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getFcmTokensFromFirestore(userId: string): Promise<FcmTokenRecord[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/fcm_tokens`;
  try {
    const colRef = collection(db, 'users', uid, 'fcm_tokens');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => d.data() as FcmTokenRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// -------------------------------------------------------------
// AI Conversations (users/{uid}/ai_conversations/{conversationId})
// -------------------------------------------------------------
export async function getAiConversationsFromFirestore(userId: string): Promise<AiConversation[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/ai_conversations`;
  try {
    const colRef = collection(db, 'users', uid, 'ai_conversations');
    const snap = await getDocs(colRef);
    const conversations = snap.docs.map((d) => d.data() as AiConversation);
    return conversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveAiConversationToFirestore(userId: string, conversation: AiConversation): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const convWithUid: AiConversation = {
    ...conversation,
    userId: uid,
    updatedAt: conversation.updatedAt || Date.now(),
  };

  const path = `users/${uid}/ai_conversations/${conversation.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'ai_conversations', conversation.id), sanitizeForFirestore(convWithUid), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteAiConversationFromFirestore(userId: string, conversationId: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/ai_conversations/${conversationId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'ai_conversations', conversationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function renameAiConversationInFirestore(userId: string, conversationId: string, newTitle: string): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/ai_conversations/${conversationId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'ai_conversations', conversationId), {
      title: newTitle.trim(),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Prescriptions Médicales
// -------------------------------------------------------------
export async function getPrescriptionsFromFirestore(
  userId: string
): Promise<Prescription[]> {
  if (!db) return [];
  const uid = resolveUserId(userId);
  if (!uid) return [];

  const path = `users/${uid}/prescriptions`;
  try {
    const colRef = collection(db, 'users', uid, 'prescriptions');
    const q = query(colRef, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Prescription);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function savePrescriptionToFirestore(
  userId: string,
  prescription: Prescription
): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/prescriptions/${prescription.id}`;
  try {
    await setDoc(
      doc(db, 'users', uid, 'prescriptions', prescription.id),
      sanitizeForFirestore(prescription),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deletePrescriptionFromFirestore(
  userId: string,
  prescriptionId: string
): Promise<void> {
  if (!db) return;
  const uid = resolveUserId(userId);
  if (!uid) return;

  const path = `users/${uid}/prescriptions/${prescriptionId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'prescriptions', prescriptionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}


