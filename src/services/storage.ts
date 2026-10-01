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

export const DEMO_USER_ID = 'usr_demo_sophie_dubois';
export const DEMO_PASSWORD = 'demo123456';

export const DEMO_USER: User = {
  id: DEMO_USER_ID,
  email: 'demo@mamanplus.fr',
  firstName: 'Sophie',
  lastName: 'Dubois',
  dueDate: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 SA (dans 12 semaines)
  lastMenstrualPeriodDate: new Date(Date.now() - 196 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  heightCm: 168,
  prePregnancyWeightKg: 62,
  createdAt: '2026-01-15T09:00:00.000Z',
};

// Seed demo account with realistic medical and personal follow-up data
export const seedDemoAccount = () => {
  // Ensure user account is in users list
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  const accounts: StoredUserAccount[] = raw ? JSON.parse(raw) : [];
  const existingIdx = accounts.findIndex((a) => a.user.email.toLowerCase() === DEMO_USER.email.toLowerCase());
  const demoAccount: StoredUserAccount = {
    user: DEMO_USER,
    passwordHash: hashPassword(DEMO_PASSWORD),
  };
  if (existingIdx >= 0) {
    accounts[existingIdx] = demoAccount;
  } else {
    accounts.unshift(demoAccount);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(accounts));

  // Seed Symptoms
  if (!localStorage.getItem(STORAGE_KEYS.SYMPTOMS_PREFIX + DEMO_USER_ID)) {
    const initialSymptoms: SymptomLog[] = [
      {
        id: 'sym_demo_1',
        userId: DEMO_USER_ID,
        symptomId: 'nausea',
        symptomName: 'Nausées matinales',
        intensity: 'Légère',
        intensityVal: 2,
        stateLabel: 'Légères nausées au réveil',
        note: 'Améliorées après un verre d’eau tiède et une biscotte.',
        date: "Aujourd'hui",
        time: '08:15',
        dayLabel: 'Semaine 28 SA',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'sym_demo_2',
        userId: DEMO_USER_ID,
        symptomId: 'fatigue',
        symptomName: 'Fatigue passagère',
        intensity: 'Modérée',
        intensityVal: 3,
        stateLabel: 'Baisse d’énergie l’après-midi',
        note: 'Une sieste de 20 minutes a bien aidé.',
        date: 'Hier',
        time: '14:30',
        dayLabel: 'Semaine 28 SA',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'sym_demo_3',
        userId: DEMO_USER_ID,
        symptomId: 'movement',
        symptomName: 'Mouvements de bébé actifs',
        intensity: 'Légère',
        intensityVal: 1,
        stateLabel: 'Petits coups réguliers',
        note: 'Bébé bouge particulièrement le soir après le dîner.',
        date: 'Il y a 3 jours',
        time: '21:00',
        dayLabel: 'Semaine 28 SA',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SYMPTOMS_PREFIX + DEMO_USER_ID, JSON.stringify(initialSymptoms));
  }

  // Seed Weights
  if (!localStorage.getItem(STORAGE_KEYS.WEIGHTS_PREFIX + DEMO_USER_ID)) {
    const initialWeights: WeightEntry[] = [
      {
        id: 'w_demo_1',
        userId: DEMO_USER_ID,
        date: new Date().toISOString().split('T')[0],
        weightKg: 69.4,
        gestationalWeek: 28,
        bmi: 24.6,
        note: 'Prise de poids harmonieuse et constante.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'w_demo_2',
        userId: DEMO_USER_ID,
        date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
        weightKg: 67.8,
        gestationalWeek: 24,
        bmi: 24.0,
        note: 'Consultation 6e mois.',
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
      },
      {
        id: 'w_demo_3',
        userId: DEMO_USER_ID,
        date: new Date(Date.now() - 56 * 86400000).toISOString().split('T')[0],
        weightKg: 66.2,
        gestationalWeek: 20,
        bmi: 23.5,
        note: 'Échographie T2.',
        createdAt: new Date(Date.now() - 56 * 86400000).toISOString(),
      },
      {
        id: 'w_demo_4',
        userId: DEMO_USER_ID,
        date: new Date(Date.now() - 84 * 86400000).toISOString().split('T')[0],
        weightKg: 64.5,
        gestationalWeek: 16,
        bmi: 22.9,
        note: 'Début du 2e trimestre.',
        createdAt: new Date(Date.now() - 84 * 86400000).toISOString(),
      },
      {
        id: 'w_demo_5',
        userId: DEMO_USER_ID,
        date: new Date(Date.now() - 112 * 86400000).toISOString().split('T')[0],
        weightKg: 63.2,
        gestationalWeek: 12,
        bmi: 22.4,
        note: 'Échographie T1.',
        createdAt: new Date(Date.now() - 112 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.WEIGHTS_PREFIX + DEMO_USER_ID, JSON.stringify(initialWeights));
  }

  // Seed Appointments
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS_PREFIX + DEMO_USER_ID)) {
    const initialAppointments: Appointment[] = [
      {
        id: 'app_demo_1',
        userId: DEMO_USER_ID,
        title: 'Échographie du 3ème trimestre (T3)',
        practitioner: 'Dr. Aminata Kante (Gynécologue-Obstétricienne)',
        date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        time: '10:30',
        location: 'Centre Médical Mère-Enfant — Salle 2',
        notes: 'Vérification de la croissance, du liquide amniotique et de la position de bébé.',
        status: 'À venir',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'app_demo_2',
        userId: DEMO_USER_ID,
        title: 'Consultation prénatale du 7ème mois',
        practitioner: 'Claire Dupont (Sage-femme)',
        date: new Date(Date.now() + 17 * 86400000).toISOString().split('T')[0],
        time: '14:00',
        location: 'Cabinet Médical MAMAN+',
        notes: 'Examen clinique de routine et préparation du projet de naissance.',
        status: 'À venir',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'app_demo_3',
        userId: DEMO_USER_ID,
        title: 'Consultation d’anesthésie prénatale',
        practitioner: 'Dr. Patrick Morel (Anesthésiste-Réanimateur)',
        date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
        time: '11:15',
        location: 'Maternité Centrale — Bâtiment B',
        notes: 'Bilan d’évaluation pour la péridurale.',
        status: 'À venir',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS_PREFIX + DEMO_USER_ID, JSON.stringify(initialAppointments));
  }

  // Seed Baby Info
  if (!localStorage.getItem(STORAGE_KEYS.BABY_PREFIX + DEMO_USER_ID)) {
    const initialBabyInfo: BabyInfo = {
      id: 'baby_demo_1',
      userId: DEMO_USER_ID,
      nickname: 'Petite Bulle',
      gender: 'Fille',
      movementNotes: 'Bébé active et en excellente vitalité. Mouvements très nets.',
      notes: 'Poids estimé: 1.250 kg (50e percentile). Rythme cardiaque: 144 bpm.',
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.BABY_PREFIX + DEMO_USER_ID, JSON.stringify(initialBabyInfo));
  }

  // Seed Medical Exams
  if (!localStorage.getItem(STORAGE_KEYS.EXAMS_PREFIX + DEMO_USER_ID)) {
    const initialExams: MedicalExam[] = [
      {
        id: 'exam_demo_1',
        userId: DEMO_USER_ID,
        title: 'Échographie Morphologique T2 (22 SA)',
        type: 'Échographie obstétricale',
        date: new Date(Date.now() - 42 * 86400000).toISOString().split('T')[0],
        practitioner: 'Dr. Aminata Kante',
        facility: 'Centre d’Imagerie Médicale',
        results: 'Examen complet normal. Morphologie fœtale sans anomalie.',
        resultOrRemarks: 'Croissance harmonieuse, placenta postérieur haut situé.',
        status: 'Effectué',
        createdAt: new Date(Date.now() - 42 * 86400000).toISOString(),
      },
      {
        id: 'exam_demo_2',
        userId: DEMO_USER_ID,
        title: 'Dépistage Diabète Gestationnel (HGPO 75g)',
        type: 'Biologie sanguine',
        date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0],
        practitioner: 'Laboratoire de Biologie Médicale',
        facility: 'Laboratoire Central',
        results: 'Glycémies à jeun, 1h et 2h strictement normales.',
        resultOrRemarks: 'Absence de diabète gestationnel.',
        status: 'Effectué',
        createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.EXAMS_PREFIX + DEMO_USER_ID, JSON.stringify(initialExams));
  }

  // Seed Checklist
  if (!localStorage.getItem(STORAGE_KEYS.CHECKLIST_PREFIX + DEMO_USER_ID)) {
    const initialChecklist: ChecklistItem[] = [
      {
        id: 'chk_demo_1',
        userId: DEMO_USER_ID,
        title: 'Déclaration de grossesse à la CPAM et CAF',
        category: 'Administratif',
        completed: true,
        dueDate: 'Avant 14 SA',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chk_demo_2',
        userId: DEMO_USER_ID,
        title: 'Inscription à la maternité de mon choix',
        category: 'Administratif',
        completed: true,
        dueDate: 'Avant 20 SA',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chk_demo_3',
        userId: DEMO_USER_ID,
        title: 'Préparer la valise de maternité (affaires de maman et bébé)',
        category: 'Valise Maternité',
        completed: false,
        dueDate: 'Semaine 34 SA',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'chk_demo_4',
        userId: DEMO_USER_ID,
        title: 'Acheter le siège auto premier âge (Groupe 0+ homologué)',
        category: 'Chambre & Équipement',
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_PREFIX + DEMO_USER_ID, JSON.stringify(initialChecklist));
  }

  // Seed Reminders
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS_PREFIX + DEMO_USER_ID)) {
    const initialReminders: ReminderItem[] = [
      {
        id: 'rem_demo_1',
        userId: DEMO_USER_ID,
        title: 'Prendre mes vitamines prénatales & Fer',
        description: 'À prendre au cours du petit-déjeuner avec un jus d’orange.',
        frequency: 'Quotidien',
        date: new Date().toISOString().split('T')[0],
        time: '08:30',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rem_demo_2',
        userId: DEMO_USER_ID,
        title: 'Boire un grand verre d’eau (Objectif 1.5L)',
        description: 'Hydratation essentielle pour le volume de liquide amniotique.',
        frequency: 'Quotidien',
        date: new Date().toISOString().split('T')[0],
        time: '15:00',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.REMINDERS_PREFIX + DEMO_USER_ID, JSON.stringify(initialReminders));
  }

  // Seed Prescriptions
  if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS_PREFIX + DEMO_USER_ID)) {
    const initialPrescriptions: Prescription[] = [
      {
        id: 'rx_demo_1',
        userId: DEMO_USER_ID,
        date: new Date().toISOString().split('T')[0],
        practitioner: 'Dr. Aminata Kante',
        practitionerRole: 'Gynécologue-Obstétricienne',
        facility: 'Clinique Mère-Enfant',
        status: 'Active',
        notes: 'Prévention de l’anémie physiologique de fin de grossesse.',
        validatedByProfessional: true,
        medications: [
          {
            id: 'med_demo_1',
            name: 'Tardyferon B9',
            dosage: '50mg / 0.35mg',
            duration: '3 mois',
            instructions: '1 comprimé par jour le matin au petit-déjeuner avec un verre d’eau.',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS_PREFIX + DEMO_USER_ID, JSON.stringify(initialPrescriptions));
  }

  // Seed Journal
  if (!localStorage.getItem(STORAGE_KEYS.JOURNAL_PREFIX + DEMO_USER_ID)) {
    const initialJournal: JournalEntry[] = [
      {
        id: 'jnl_demo_1',
        userId: DEMO_USER_ID,
        date: new Date().toISOString().split('T')[0],
        title: 'Bébé réagit aux voix et à la musique',
        content: 'Aujourd’hui, nous avons écouté une douce berceuse avec le futur papa. Dès les premières notes, bébé a réagi par des petits mouvements rythmés. C’est un moment magique qui nous rapproche encore plus.',
        mood: 'Heureuse',
        gestationalWeek: 28,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.JOURNAL_PREFIX + DEMO_USER_ID, JSON.stringify(initialJournal));
  }
};

// User Accounts CRUD
export const getUserAccounts = (): StoredUserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    const accounts: StoredUserAccount[] = raw ? JSON.parse(raw) : [];
    // Always ensure demo account exists in accounts list
    if (!accounts.some((a) => a.user.email.toLowerCase() === DEMO_USER.email.toLowerCase())) {
      accounts.unshift({
        user: DEMO_USER,
        passwordHash: hashPassword(DEMO_PASSWORD),
      });
    }
    return accounts;
  } catch {
    return [
      {
        user: DEMO_USER,
        passwordHash: hashPassword(DEMO_PASSWORD),
      },
    ];
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


