import {
  User,
  SymptomLog,
  WeightEntry,
  Appointment,
  NotificationItem,
  BabyInfo,
  MedicalExam,
  JournalEntry,
  ChecklistItem,
  ReminderItem,
  Prescription,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'maman_plus_users',
  SESSION: 'maman_plus_session',
  REMEMBER: 'maman_plus_remember',
  SYMPTOMS_PREFIX: 'maman_plus_symptoms_',
  WEIGHTS_PREFIX: 'maman_plus_weights_',
  APPOINTMENTS_PREFIX: 'maman_plus_appointments_',
  NOTIFICATIONS_PREFIX: 'maman_plus_notifications_',
  BABY_PREFIX: 'maman_plus_baby_',
  EXAMS_PREFIX: 'maman_plus_exams_',
  JOURNAL_PREFIX: 'maman_plus_journal_',
  CHECKLIST_PREFIX: 'maman_plus_checklist_',
  REMINDERS_PREFIX: 'maman_plus_reminders_',
  PRESCRIPTIONS_PREFIX: 'maman_plus_prescriptions_',
  SAVED_ADVICE_PREFIX: 'maman_plus_saved_advice_',
  SAVED_VIDEOS_PREFIX: 'maman_plus_saved_videos_',
};

export interface StoredUserAccount {
  user: User;
  passwordHash: string; // Base64 encoded password for local integrity check
}

// User Accounts CRUD
export const getUserAccounts = (): StoredUserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserAccounts = (accounts: StoredUserAccount[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(accounts));
};

export const findAccountByEmail = (email: string): StoredUserAccount | undefined => {
  const accounts = getUserAccounts();
  return accounts.find((a) => a.user.email.toLowerCase() === email.trim().toLowerCase());
};

// Simple reversible obfuscation for client-side password verification
export const hashPassword = (password: string): string => {
  return btoa(unescape(encodeURIComponent(password)));
};

// Session Management
export const getActiveSession = (): User | null => {
  try {
    // Check localStorage first (remember me)
    const local = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (local) return JSON.parse(local);

    // Check sessionStorage
    const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (session) return JSON.parse(session);

    return null;
  } catch {
    return null;
  }
};

export const saveActiveSession = (user: User, rememberMe: boolean) => {
  const str = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEYS.SESSION, str);
    localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, str);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }
};

export const clearActiveSession = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
};

// Helper: Calculate Gestational Week (SA) and Trimester from DDR or DPA
export interface GestationalStatus {
  weeksSA: number;
  daysSA: number;
  trimester: 1 | 2 | 3;
  badgeLabel: string;
}

export const calculateGestationalStatus = (
  lmpDate?: string,
  dueDate?: string
): GestationalStatus | null => {
  const today = new Date();
  let lmp: Date | null = null;

  if (lmpDate) {
    lmp = new Date(lmpDate);
  } else if (dueDate) {
    // Due date is typically 41 SA in France (287 days after LMP)
    const due = new Date(dueDate);
    lmp = new Date(due.getTime() - 287 * 24 * 60 * 60 * 1000);
  }

  if (!lmp || isNaN(lmp.getTime())) {
    return null;
  }

  const diffTime = today.getTime() - lmp.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const weeksSA = Math.floor(diffDays / 7);
  const daysSA = diffDays % 7;

  let trimester: 1 | 2 | 3 = 1;
  if (weeksSA >= 28) {
    trimester = 3;
  } else if (weeksSA >= 14) {
    trimester = 2;
  }

  return {
    weeksSA,
    daysSA,
    trimester,
    badgeLabel: `${weeksSA}E SEMAINE D'AMÉNORRHÉE (T${trimester})`,
  };
};

// Initials Helper
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  const f = firstName ? firstName.trim().charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.trim().charAt(0).toUpperCase() : '';
  if (f && l) return `${f}${l}`;
  if (f) return f;
  if (l) return l;
  return 'M+';
};

// Dynamic Data Store for User
export const getUserSymptoms = (userId: string): SymptomLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYMPTOMS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserSymptoms = (userId: string, logs: SymptomLog[]) => {
  localStorage.setItem(STORAGE_KEYS.SYMPTOMS_PREFIX + userId, JSON.stringify(logs));
};

export const getUserWeights = (userId: string): WeightEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHTS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserWeights = (userId: string, entries: WeightEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.WEIGHTS_PREFIX + userId, JSON.stringify(entries));
};

export const getUserAppointments = (userId: string): Appointment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserAppointments = (userId: string, apps: Appointment[]) => {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS_PREFIX + userId, JSON.stringify(apps));
};

export const getUserNotifications = (userId: string): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserNotifications = (userId: string, notifs: NotificationItem[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_PREFIX + userId, JSON.stringify(notifs));
};

// Baby Information
export const getUserBabyInfo = (userId: string): BabyInfo | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BABY_PREFIX + userId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUserBabyInfo = (userId: string, info: BabyInfo | null) => {
  if (!info) {
    localStorage.removeItem(STORAGE_KEYS.BABY_PREFIX + userId);
  } else {
    localStorage.setItem(STORAGE_KEYS.BABY_PREFIX + userId, JSON.stringify(info));
  }
};

// Medical Examinations
export const getUserExams = (userId: string): MedicalExam[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserExams = (userId: string, exams: MedicalExam[]) => {
  localStorage.setItem(STORAGE_KEYS.EXAMS_PREFIX + userId, JSON.stringify(exams));
};

// Journal Entries
export const getUserJournalEntries = (userId: string): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOURNAL_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserJournalEntries = (userId: string, entries: JournalEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.JOURNAL_PREFIX + userId, JSON.stringify(entries));
};

// Checklist Items
export const getUserChecklist = (userId: string): ChecklistItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserChecklist = (userId: string, items: ChecklistItem[]) => {
  localStorage.setItem(STORAGE_KEYS.CHECKLIST_PREFIX + userId, JSON.stringify(items));
};

// Reminders
export const getUserReminders = (userId: string): ReminderItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserReminders = (userId: string, reminders: ReminderItem[]) => {
  localStorage.setItem(STORAGE_KEYS.REMINDERS_PREFIX + userId, JSON.stringify(reminders));
};

// Saved Advice & Videos (Favorites)
export const getUserSavedAdvice = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ADVICE_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserSavedAdvice = (userId: string, ids: string[]) => {
  localStorage.setItem(STORAGE_KEYS.SAVED_ADVICE_PREFIX + userId, JSON.stringify(ids));
};

export const getUserSavedVideos = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_VIDEOS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserSavedVideos = (userId: string, ids: string[]) => {
  localStorage.setItem(STORAGE_KEYS.SAVED_VIDEOS_PREFIX + userId, JSON.stringify(ids));
 };

// Prescriptions Médicales
export const getUserPrescriptions = (userId: string): Prescription[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveUserPrescriptions = (userId: string, prescriptions: Prescription[]) => {
  localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS_PREFIX + userId, JSON.stringify(prescriptions));
};


