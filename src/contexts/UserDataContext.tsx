import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SymptomLog,
  WeightEntry,
  Appointment,
  NotificationItem,
  SymptomIntensity,
  BabyInfo,
  MedicalExam,
  JournalEntry,
  ChecklistItem,
  ReminderItem,
  Prescription,
} from '../types';
import { useAuth } from './AuthContext';
import { isFirebaseConfigured, db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  getSymptomsFromFirestore,
  addSymptomToFirestore,
  updateSymptomInFirestore,
  deleteSymptomFromFirestore,
  getWeightsFromFirestore,
  addWeightToFirestore,
  updateWeightInFirestore,
  deleteWeightFromFirestore,
  getAppointmentsFromFirestore,
  saveAppointmentToFirestore,
  deleteAppointmentFromFirestore,
  getBabyInfoFromFirestore,
  saveBabyInfoToFirestore,
  deleteBabyInfoFromFirestore,
  getExamsFromFirestore,
  saveExamToFirestore,
  deleteExamFromFirestore,
  getJournalFromFirestore,
  saveJournalToFirestore,
  deleteJournalFromFirestore,
  getChecklistFromFirestore,
  saveChecklistItemToFirestore,
  deleteChecklistItemFromFirestore,
  getRemindersFromFirestore,
  saveReminderToFirestore,
  deleteReminderFromFirestore,
  getSavedAdviceFromFirestore,
  saveSavedAdviceToFirestore,
  getSavedVideosFromFirestore,
  saveSavedVideosToFirestore,
  getNotificationsFromFirestore,
  saveNotificationToFirestore,
  saveNotificationsToFirestore,
  deleteNotificationFromFirestore,
  markNotificationAsReadInFirestore,
  markAllNotificationsAsReadInFirestore,
  getPrescriptionsFromFirestore,
  savePrescriptionToFirestore,
  deletePrescriptionFromFirestore,
} from '../services/firestoreService';
import {
  scheduleAppointmentNotification,
  scheduleCustomReminderNotification,
  setupForegroundMessageListener,
} from '../services/notificationService';
import {
  getUserSymptoms,
  saveUserSymptoms,
  getUserWeights,
  saveUserWeights,
  getUserAppointments,
  saveUserAppointments,
  getUserNotifications,
  saveUserNotifications,
  getUserBabyInfo,
  saveUserBabyInfo,
  getUserExams,
  saveUserExams,
  getUserJournalEntries,
  saveUserJournalEntries,
  getUserChecklist,
  saveUserChecklist,
  getUserReminders,
  saveUserReminders,
  getUserPrescriptions,
  saveUserPrescriptions,
  getUserSavedAdvice,
  saveUserSavedAdvice,
  getUserSavedVideos,
  saveUserSavedVideos,
  calculateGestationalStatus,
} from '../services/storage';

interface UserDataContextType {
  symptomLogs: SymptomLog[];
  weightEntries: WeightEntry[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  babyInfo: BabyInfo | null;
  exams: MedicalExam[];
  journalEntries: JournalEntry[];
  checklist: ChecklistItem[];
  reminders: ReminderItem[];
  prescriptions: Prescription[];
  isLoading: boolean;
  addSymptomLog: (data: {
    symptomId: string;
    symptomName: string;
    intensity: SymptomIntensity;
    intensityVal: number;
    stateLabel: string;
    note: string;
  }) => Promise<void>;
  updateSymptomLog: (id: string, data: Partial<SymptomLog>) => Promise<void>;
  deleteSymptomLog: (id: string) => Promise<void>;
  addWeightEntry: (data: { date: string; weightKg: number; note?: string }) => Promise<void>;
  updateWeightEntry: (id: string, data: Partial<WeightEntry>) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  addAppointment: (data: Omit<Appointment, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateBabyInfo: (data: Partial<BabyInfo>) => Promise<void>;
  resetBabyInfo: () => Promise<void>;
  addExam: (data: Omit<MedicalExam, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateExam: (id: string, data: Partial<MedicalExam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addJournalEntry: (data: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  addChecklistItem: (data: { title: string; category: ChecklistItem['category']; dueDate?: string }) => Promise<void>;
  updateChecklistItem: (id: string, data: Partial<ChecklistItem>) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
  addReminder: (data: Omit<ReminderItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateReminder: (id: string, data: Partial<ReminderItem>) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addPrescription: (data: Omit<Prescription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrescription: (id: string, data: Partial<Prescription>) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  savedAdviceIds: string[];
  savedVideoIds: string[];
  toggleSaveAdvice: (adviceId: string) => Promise<void>;
  toggleSaveVideo: (videoId: string) => Promise<void>;
  isAdviceSaved: (adviceId: string) => boolean;
  isVideoSaved: (videoId: string) => boolean;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  exportHistoryCsv: () => void;
  exportAllUserDataJson: () => void;
  refreshData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [babyInfo, setBabyInfo] = useState<BabyInfo | null>(null);
  const [exams, setExams] = useState<MedicalExam[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [savedAdviceIds, setSavedAdviceIds] = useState<string[]>([]);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserData = useCallback(async () => {
    if (!currentUser) {
      setSymptomLogs([]);
      setWeightEntries([]);
      setAppointments([]);
      setNotifications([]);
      setBabyInfo(null);
      setExams([]);
      setJournalEntries([]);
      setChecklist([]);
      setReminders([]);
      setSavedAdviceIds([]);
      setSavedVideoIds([]);
      setPrescriptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 1. If Firebase is active, try loading from Firestore first
    if (isFirebaseConfigured && db) {
      try {
        const [
          fbSymptoms,
          fbWeights,
          fbAppointments,
          fbBabyInfo,
          fbExams,
          fbJournal,
          fbChecklist,
          fbReminders,
          fbSavedAdvice,
          fbSavedVideos,
          fbNotifications,
          fbPrescriptions,
        ] = await Promise.all([
          getSymptomsFromFirestore(currentUser.id),
          getWeightsFromFirestore(currentUser.id),
          getAppointmentsFromFirestore(currentUser.id),
          getBabyInfoFromFirestore(currentUser.id),
          getExamsFromFirestore(currentUser.id),
          getJournalFromFirestore(currentUser.id),
          getChecklistFromFirestore(currentUser.id),
          getRemindersFromFirestore(currentUser.id),
          getSavedAdviceFromFirestore(currentUser.id),
          getSavedVideosFromFirestore(currentUser.id),
          getNotificationsFromFirestore(currentUser.id),
          getPrescriptionsFromFirestore(currentUser.id),
        ]);

        // Firestore is the PRIMARY source of truth
        setSymptomLogs(fbSymptoms);
        setWeightEntries(fbWeights);
        setAppointments(fbAppointments);
        setBabyInfo(fbBabyInfo);
        setExams(fbExams);
        setJournalEntries(fbJournal);
        setChecklist(fbChecklist);
        setReminders(fbReminders);
        setSavedAdviceIds(fbSavedAdvice);
        setSavedVideoIds(fbSavedVideos);
        setNotifications(fbNotifications);
        setPrescriptions(fbPrescriptions);

        // Keep local cache in sync for offline resilience only
        saveUserSymptoms(currentUser.id, fbSymptoms);
        saveUserWeights(currentUser.id, fbWeights);
        saveUserAppointments(currentUser.id, fbAppointments);
        if (fbBabyInfo) saveUserBabyInfo(currentUser.id, fbBabyInfo);
        saveUserExams(currentUser.id, fbExams);
        saveUserJournalEntries(currentUser.id, fbJournal);
        saveUserChecklist(currentUser.id, fbChecklist);
        saveUserReminders(currentUser.id, fbReminders);
        saveUserSavedAdvice(currentUser.id, fbSavedAdvice);
        saveUserSavedVideos(currentUser.id, fbSavedVideos);
        saveUserNotifications(currentUser.id, fbNotifications);
        saveUserPrescriptions(currentUser.id, fbPrescriptions);

        setIsLoading(false);
        return;
      } catch (err) {
        console.warn('[UserData] Firestore unreachable, using local offline cache:', err);
      }
    }

    // 2. Offline cache fallback only when Firestore is unavailable
    try {
      setSymptomLogs(getUserSymptoms(currentUser.id));
      setWeightEntries(getUserWeights(currentUser.id));
      setAppointments(getUserAppointments(currentUser.id));
      setNotifications(getUserNotifications(currentUser.id));
      setBabyInfo(getUserBabyInfo(currentUser.id));
      setExams(getUserExams(currentUser.id));
      setJournalEntries(getUserJournalEntries(currentUser.id));
      setChecklist(getUserChecklist(currentUser.id));
      setReminders(getUserReminders(currentUser.id));
      setSavedAdviceIds(getUserSavedAdvice(currentUser.id));
      setSavedVideoIds(getUserSavedVideos(currentUser.id));
      setPrescriptions(getUserPrescriptions(currentUser.id));
    } catch {
      // Empty defaults
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Real-time Firestore synchronization for notifications subcollection (users/{uid}/notifications)
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !currentUser?.id) return;

    try {
      const notifsCol = collection(db, 'users', currentUser.id, 'notifications');
      const unsubscribe = onSnapshot(
        notifsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const items: NotificationItem[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                userId: currentUser.id,
                title: data.title || '',
                body: data.body || data.message || '',
                message: data.body || data.message || '',
                date:
                  data.date ||
                  (data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : "Aujourd'hui"),
                read: Boolean(data.read),
                type: data.type || 'general',
                scheduledAt: data.scheduledAt,
                data: data.data || {},
                createdAt: data.createdAt || new Date().toISOString(),
              } as NotificationItem;
            });

            // Sort descending by date
            items.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(items);
            saveUserNotifications(currentUser.id, items);
          }
        },
        (error) => {
          console.warn('[UserData] Firestore notifications onSnapshot warning:', error.message);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[UserData] Could not attach notifications onSnapshot listener:', err);
    }
  }, [currentUser?.id]);

  // Listen for incoming live notifications (Push, FCM foreground, or system events)
  useEffect(() => {
    const handleLiveNotification = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      if (customEvent.detail && customEvent.detail.title) {
        const item = customEvent.detail;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === item.id)) return prev;
          return [item, ...prev];
        });
      }
    };

    window.addEventListener('maman-new-notification', handleLiveNotification);
    setupForegroundMessageListener();

    return () => {
      window.removeEventListener('maman-new-notification', handleLiveNotification);
    };
  }, []);

  const addSymptomLog = async (data: {
    symptomId: string;
    symptomName: string;
    intensity: SymptomIntensity;
    intensityVal: number;
    stateLabel: string;
    note: string;
  }) => {
    if (!currentUser) return;

    const now = new Date();
    const dateStr = "Aujourd'hui";
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const gestStatus = calculateGestationalStatus(
      currentUser.lastMenstrualPeriodDate,
      currentUser.dueDate
    );
    const dayLabel = gestStatus ? `Semaine ${gestStatus.weeksSA} SA` : undefined;

    const newLog: SymptomLog = {
      id: `sym_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      symptomId: data.symptomId,
      symptomName: data.symptomName,
      intensity: data.intensity,
      intensityVal: data.intensityVal,
      stateLabel: data.stateLabel,
      note: data.note,
      date: dateStr,
      time: timeStr,
      dayLabel,
      createdAt: now.toISOString(),
    };

    // Save directly to Firestore as primary source
    if (isFirebaseConfigured && db) {
      try {
        await addSymptomToFirestore(currentUser.id, newLog);
      } catch (err) {
        console.error('[Firestore] Error saving symptom:', err);
      }
    }

    const updated = [newLog, ...symptomLogs];
    setSymptomLogs(updated);
    saveUserSymptoms(currentUser.id, updated);
  };

  const deleteSymptomLog = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteSymptomFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting symptom:', err);
      }
    }

    const updated = symptomLogs.filter((s) => s.id !== id);
    setSymptomLogs(updated);
    saveUserSymptoms(currentUser.id, updated);
  };

  const addWeightEntry = async (data: { date: string; weightKg: number; note?: string }) => {
    if (!currentUser) return;

    let bmi: number | undefined;
    if (currentUser.heightCm && currentUser.heightCm > 0) {
      const heightM = currentUser.heightCm / 100;
      bmi = parseFloat((data.weightKg / (heightM * heightM)).toFixed(1));
    }

    const gestStatus = calculateGestationalStatus(
      currentUser.lastMenstrualPeriodDate,
      currentUser.dueDate
    );

    const newEntry: WeightEntry = {
      id: `w_${Date.now()}`,
      userId: currentUser.id,
      date: data.date,
      weightKg: data.weightKg,
      gestationalWeek: gestStatus ? gestStatus.weeksSA : undefined,
      bmi,
      note: data.note,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await addWeightToFirestore(currentUser.id, newEntry);
      } catch (err) {
        console.error('[Firestore] Error saving weight entry:', err);
      }
    }

    const updated = [...weightEntries, newEntry].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setWeightEntries(updated);
    saveUserWeights(currentUser.id, updated);
  };

  const deleteWeightEntry = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteWeightFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting weight entry:', err);
      }
    }

    const updated = weightEntries.filter((w) => w.id !== id);
    setWeightEntries(updated);
    saveUserWeights(currentUser.id, updated);
  };

  const addAppointment = async (data: Omit<Appointment, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;

    const newApp: Appointment = {
      ...data,
      id: `app_${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveAppointmentToFirestore(currentUser.id, newApp);
      } catch (err) {
        console.error('[Firestore] Error saving appointment:', err);
      }
    }

    // Schedule real server-side push notification
    scheduleAppointmentNotification(currentUser.id, newApp).catch((e) =>
      console.warn('[Push] Error scheduling appointment reminder:', e)
    );

    const updated = [newApp, ...appointments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setAppointments(updated);
    saveUserAppointments(currentUser.id, updated);
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    if (!currentUser) return;
    const found = appointments.find((a) => a.id === id);
    if (!found) return;
    const updatedItem = { ...found, ...data };

    if (isFirebaseConfigured && db) {
      try {
        await saveAppointmentToFirestore(currentUser.id, updatedItem);
      } catch (err) {
        console.error('[Firestore] Error updating appointment:', err);
      }
    }

    const updated = appointments.map((a) => (a.id === id ? updatedItem : a));
    setAppointments(updated);
    saveUserAppointments(currentUser.id, updated);
  };

  const deleteAppointment = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteAppointmentFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting appointment:', err);
      }
    }

    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    saveUserAppointments(currentUser.id, updated);
  };

  // Baby info
  const updateBabyInfo = async (data: Partial<BabyInfo>) => {
    if (!currentUser) return;
    const current = babyInfo || {
      id: `baby_${currentUser.id}`,
      userId: currentUser.id,
      updatedAt: new Date().toISOString(),
    };
    const updated: BabyInfo = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveBabyInfoToFirestore(currentUser.id, updated);
      } catch (err) {
        console.error('[Firestore] Error updating baby info:', err);
      }
    }

    setBabyInfo(updated);
    saveUserBabyInfo(currentUser.id, updated);
  };

  // Exams
  const addExam = async (data: Omit<MedicalExam, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    const newExam: MedicalExam = {
      ...data,
      id: `exam_${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveExamToFirestore(currentUser.id, newExam);
      } catch (err) {
        console.error('[Firestore] Error saving medical exam:', err);
      }
    }

    const updated = [newExam, ...exams].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setExams(updated);
    saveUserExams(currentUser.id, updated);
  };

  const updateExam = async (id: string, data: Partial<MedicalExam>) => {
    if (!currentUser) return;
    const found = exams.find((e) => e.id === id);
    if (!found) return;
    const updatedExam = { ...found, ...data };

    if (isFirebaseConfigured && db) {
      try {
        await saveExamToFirestore(currentUser.id, updatedExam);
      } catch (err) {
        console.error('[Firestore] Error updating medical exam:', err);
      }
    }

    const updated = exams.map((e) => (e.id === id ? updatedExam : e));
    setExams(updated);
    saveUserExams(currentUser.id, updated);
  };

  const deleteExam = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteExamFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting medical exam:', err);
      }
    }

    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    saveUserExams(currentUser.id, updated);
  };

  // Journal
  const addJournalEntry = async (
    data: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const gestStatus = calculateGestationalStatus(
      currentUser.lastMenstrualPeriodDate,
      currentUser.dueDate
    );
    const newEntry: JournalEntry = {
      ...data,
      gestationalWeek: gestStatus ? gestStatus.weeksSA : undefined,
      id: `journal_${Date.now()}`,
      userId: currentUser.id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveJournalToFirestore(currentUser.id, newEntry);
      } catch (err) {
        console.error('[Firestore] Error saving journal entry:', err);
      }
    }

    const updated = [newEntry, ...journalEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setJournalEntries(updated);
    saveUserJournalEntries(currentUser.id, updated);
  };

  const updateJournalEntry = async (id: string, data: Partial<JournalEntry>) => {
    if (!currentUser) return;
    const found = journalEntries.find((j) => j.id === id);
    if (!found) return;
    const updatedEntry = { ...found, ...data, updatedAt: new Date().toISOString() };

    if (isFirebaseConfigured && db) {
      try {
        await saveJournalToFirestore(currentUser.id, updatedEntry);
      } catch (err) {
        console.error('[Firestore] Error updating journal entry:', err);
      }
    }

    const updated = journalEntries.map((j) => (j.id === id ? updatedEntry : j));
    setJournalEntries(updated);
    saveUserJournalEntries(currentUser.id, updated);
  };

  const deleteJournalEntry = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteJournalFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting journal entry:', err);
      }
    }

    const updated = journalEntries.filter((j) => j.id !== id);
    setJournalEntries(updated);
    saveUserJournalEntries(currentUser.id, updated);
  };

  // Checklist
  const addChecklistItem = async (data: {
    title: string;
    category: ChecklistItem['category'];
    dueDate?: string;
  }) => {
    if (!currentUser) return;
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      userId: currentUser.id,
      title: data.title,
      category: data.category,
      completed: false,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveChecklistItemToFirestore(currentUser.id, newItem);
      } catch (err) {
        console.error('[Firestore] Error saving checklist item:', err);
      }
    }

    const updated = [...checklist, newItem];
    setChecklist(updated);
    saveUserChecklist(currentUser.id, updated);
  };

  const toggleChecklistItem = async (id: string) => {
    if (!currentUser) return;
    const found = checklist.find((c) => c.id === id);
    if (!found) return;
    const updatedItem = { ...found, completed: !found.completed };

    if (isFirebaseConfigured && db) {
      try {
        await saveChecklistItemToFirestore(currentUser.id, updatedItem);
      } catch (err) {
        console.error('[Firestore] Error updating checklist item:', err);
      }
    }

    const updated = checklist.map((c) => (c.id === id ? updatedItem : c));
    setChecklist(updated);
    saveUserChecklist(currentUser.id, updated);
  };

  const deleteChecklistItem = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteChecklistItemFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting checklist item:', err);
      }
    }

    const updated = checklist.filter((c) => c.id !== id);
    setChecklist(updated);
    saveUserChecklist(currentUser.id, updated);
  };

  // Reminders
  const addReminder = async (data: Omit<ReminderItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    const newRem: ReminderItem = {
      ...data,
      id: `rem_${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveReminderToFirestore(currentUser.id, newRem);
      } catch (err) {
        console.error('[Firestore] Error saving reminder:', err);
      }
    }

    // Schedule real server-side push notification
    scheduleCustomReminderNotification(currentUser.id, newRem).catch((e) =>
      console.warn('[Push] Error scheduling custom reminder:', e)
    );

    const updated = [newRem, ...reminders].sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );
    setReminders(updated);
    saveUserReminders(currentUser.id, updated);
  };

  const toggleReminder = async (id: string) => {
    if (!currentUser) return;
    const found = reminders.find((r) => r.id === id);
    if (!found) return;
    const updatedRem = { ...found, isActive: !found.isActive };

    if (isFirebaseConfigured && db) {
      try {
        await saveReminderToFirestore(currentUser.id, updatedRem);
      } catch (err) {
        console.error('[Firestore] Error updating reminder:', err);
      }
    }

    const updated = reminders.map((r) => (r.id === id ? updatedRem : r));
    setReminders(updated);
    saveUserReminders(currentUser.id, updated);
  };

  const deleteReminder = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deleteReminderFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting reminder:', err);
      }
    }

    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveUserReminders(currentUser.id, updated);
  };

  const addPrescription = async (data: Omit<Prescription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const newPrescription: Prescription = {
      ...data,
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await savePrescriptionToFirestore(currentUser.id, newPrescription);
      } catch (err) {
        console.error('[Firestore] Error saving prescription:', err);
      }
    }

    const updated = [newPrescription, ...prescriptions];
    setPrescriptions(updated);
    saveUserPrescriptions(currentUser.id, updated);
  };

  const updatePrescription = async (id: string, data: Partial<Prescription>) => {
    if (!currentUser) return;
    const existing = prescriptions.find((p) => p.id === id);
    if (!existing) return;

    const updatedPrescription: Prescription = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await savePrescriptionToFirestore(currentUser.id, updatedPrescription);
      } catch (err) {
        console.error('[Firestore] Error updating prescription:', err);
      }
    }

    const updated = prescriptions.map((p) => (p.id === id ? updatedPrescription : p));
    setPrescriptions(updated);
    saveUserPrescriptions(currentUser.id, updated);
  };

  const deletePrescription = async (id: string) => {
    if (!currentUser) return;

    if (isFirebaseConfigured && db) {
      try {
        await deletePrescriptionFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting prescription:', err);
      }
    }

    const updated = prescriptions.filter((p) => p.id !== id);
    setPrescriptions(updated);
    saveUserPrescriptions(currentUser.id, updated);
  };

  const addNotification = async (data: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const newNotif: NotificationItem = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      createdAt: now,
      date: data.date || "Aujourd'hui",
      read: false,
    };

    if (isFirebaseConfigured && db) {
      try {
        await saveNotificationToFirestore(currentUser.id, newNotif);
      } catch (err) {
        console.error('[Firestore] Error saving notification:', err);
      }
    }

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveUserNotifications(currentUser.id, updated);
  };

  const markNotificationAsRead = async (id: string) => {
    if (!currentUser) return;
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));

    if (isFirebaseConfigured && db) {
      try {
        await markNotificationAsReadInFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error updating notifications:', err);
      }
    }

    setNotifications(updated);
    saveUserNotifications(currentUser.id, updated);
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    const updated = notifications.map((n) => ({ ...n, read: true }));

    if (isFirebaseConfigured && db && unreadIds.length > 0) {
      try {
        await markAllNotificationsAsReadInFirestore(currentUser.id, unreadIds);
      } catch (err) {
        console.error('[Firestore] Error updating all notifications:', err);
      }
    }

    setNotifications(updated);
    saveUserNotifications(currentUser.id, updated);
  };

  const deleteNotification = async (id: string) => {
    if (!currentUser) return;
    if (isFirebaseConfigured && db) {
      try {
        await deleteNotificationFromFirestore(currentUser.id, id);
      } catch (err) {
        console.error('[Firestore] Error deleting notification:', err);
      }
    }

    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveUserNotifications(currentUser.id, updated);
  };

  const clearAllNotifications = async () => {
    if (!currentUser) return;
    if (isFirebaseConfigured && db) {
      for (const n of notifications) {
        try {
          await deleteNotificationFromFirestore(currentUser.id, n.id);
        } catch {}
      }
    }

    setNotifications([]);
    saveUserNotifications(currentUser.id, []);
  };

  const exportHistoryCsv = () => {
    if (symptomLogs.length === 0) return;

    const csvContent =
      'Date,Heure,Semaine,Symptome,Intensite,Etat,Remarque\n' +
      symptomLogs
        .map(
          (l) =>
            `"${l.date}","${l.time}","${l.dayLabel || ''}","${l.symptomName}","${
              l.intensity
            }","${l.stateLabel}","${(l.note || '').replace(/"/g, '""')}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `maman_plus_suivi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllUserDataJson = () => {
    if (!currentUser) return;
    const fullBackup = {
      user: currentUser,
      symptoms: symptomLogs,
      weights: weightEntries,
      appointments,
      babyInfo,
      exams,
      journalEntries,
      checklist,
      reminders,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `maman_plus_donnees_${currentUser.firstName || 'export'}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSaveAdvice = async (adviceId: string) => {
    if (!currentUser) return;
    const exists = savedAdviceIds.includes(adviceId);
    const updated = exists ? savedAdviceIds.filter((id) => id !== adviceId) : [...savedAdviceIds, adviceId];

    if (isFirebaseConfigured && db) {
      try {
        await saveSavedAdviceToFirestore(currentUser.id, updated);
      } catch (err) {
        console.error('[Firestore] Error saving advice preference:', err);
      }
    }

    setSavedAdviceIds(updated);
    saveUserSavedAdvice(currentUser.id, updated);
  };

  const toggleSaveVideo = async (videoId: string) => {
    if (!currentUser) return;
    const exists = savedVideoIds.includes(videoId);
    const updated = exists ? savedVideoIds.filter((id) => id !== videoId) : [...savedVideoIds, videoId];

    if (isFirebaseConfigured && db) {
      try {
        await saveSavedVideosToFirestore(currentUser.id, updated);
      } catch (err) {
        console.error('[Firestore] Error saving video preference:', err);
      }
    }

    setSavedVideoIds(updated);
    saveUserSavedVideos(currentUser.id, updated);
  };

  const isAdviceSaved = (adviceId: string) => savedAdviceIds.includes(adviceId);
  const isVideoSaved = (videoId: string) => savedVideoIds.includes(videoId);

  return (
    <UserDataContext.Provider
      value={{
        symptomLogs,
        weightEntries,
        appointments,
        notifications,
        babyInfo,
        exams,
        journalEntries,
        checklist,
        reminders,
        prescriptions,
        savedAdviceIds,
        savedVideoIds,
        toggleSaveAdvice,
        toggleSaveVideo,
        isAdviceSaved,
        isVideoSaved,
        isLoading,
        addSymptomLog,
        deleteSymptomLog,
        addWeightEntry,
        deleteWeightEntry,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateBabyInfo,
        addExam,
        updateExam,
        deleteExam,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        addReminder,
        toggleReminder,
        deleteReminder,
        addPrescription,
        updatePrescription,
        deletePrescription,
        addNotification,
        deleteNotification,
        clearAllNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        exportHistoryCsv,
        exportAllUserDataJson,
        refreshData: loadUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
