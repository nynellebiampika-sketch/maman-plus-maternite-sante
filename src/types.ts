export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  birthDate?: string;
  // Medical & pregnancy profile info
  lastMenstrualPeriodDate?: string; // DDR
  dueDate?: string; // DPA
  heightCm?: number; // Height in cm for BMI
  prePregnancyWeightKg?: number; // Starting weight
  createdAt: string;
}

export type SymptomIconType =
  | 'fatigue'
  | 'nausee'
  | 'dos'
  | 'sommeil'
  | 'brulures'
  | 'jambes'
  | 'vitalite';

export type SymptomIntensity = 'Légère' | 'Modérée' | 'Intense';

export interface SymptomItemConfig {
  id: string;
  name: string;
  iconType: SymptomIconType;
  defaultLabel: string;
}

export interface SymptomLog {
  id: string;
  userId: string;
  symptomId: string;
  symptomName: string;
  intensity: SymptomIntensity;
  intensityVal: number; // 1, 2, 3
  stateLabel: string;
  note: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  dayLabel?: string; // e.g. 'Semaine 24 SA'
  createdAt: string; // ISO timestamp
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  gestationalWeek?: number;
  bmi?: number;
  note?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD or readable
  time: string; // HH:mm
  practitioner: string;
  location: string;
  status: 'Confirmé' | 'À venir' | 'Passé';
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body?: string;
  message: string;
  date: string;
  read: boolean;
  type?: 'clinical' | 'appointment' | 'reminder' | 'advice' | 'welcome' | 'general';
  scheduledAt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export interface FcmTokenRecord {
  id: string;
  userId: string;
  token: string;
  subscription?: {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  } | Record<string, any>;
  deviceInfo?: string;
  platform?: 'android' | 'ios' | 'desktop' | 'web';
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'clinical' | 'appointment' | 'reminder' | 'advice' | 'welcome' | 'general';
  scheduledAt: string;
  sent: boolean;
  sentAt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export interface RadarAxis {
  axis: string;
  label: string;
  value: number; // 0 to 100
  score: string;
}

export interface BabyInfo {
  id: string;
  userId: string;
  nickname?: string;
  gender?: 'Fille' | 'Garçon' | 'Surprise' | 'Non précisé';
  firstKicksDate?: string;
  movementNotes?: string;
  notes?: string;
  updatedAt: string;
}

export interface MedicalExam {
  id: string;
  userId: string;
  title: string;
  type: string;
  date: string;
  practitioner?: string;
  facility?: string;
  results?: string;
  practitionerOrFacility?: string;
  resultOrRemarks?: string;
  documentName?: string;
  status: 'Effectué' | 'À venir' | 'En attente de résultats' | 'En attente' | 'À planifier';
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  mood?: 'Heureuse' | 'Sereine' | 'Fatiguée' | 'Émue' | 'Anxieuse' | 'En forme';
  gestationalWeek?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  userId: string;
  title: string;
  category: 'Valise Maternité' | 'Administratif' | 'Chambre & Équipement' | 'Santé & Suivi' | 'Autre';
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  frequency?: 'Une fois' | 'Quotidien' | 'Hebdomadaire' | 'Mensuel';
  isActive: boolean;
  createdAt: string;
}

// -----------------------------------------------------------
// TYPES POUR LE MODULE : CONSEILS & RESSOURCES DE GROSSESSE
// -----------------------------------------------------------

export type AdviceTrimester = 'Tous' | '1er trimestre' | '2e trimestre' | '3e trimestre' | 'Post-partum';

export type AdviceImportance = 'Essentiel' | 'Recommandé' | 'Confort' | 'Alerte clinique';

export type AdviceCategory =
  | 'Grossesse générale'
  | '1er trimestre'
  | '2e trimestre'
  | '3e trimestre'
  | 'Alimentation'
  | 'Hydratation'
  | 'Sommeil'
  | 'Nausées'
  | 'Digestion'
  | 'Mal de dos'
  | 'Activité physique'
  | 'Préparation à l\'accouchement'
  | 'Consultations prénatales'
  | 'Examens'
  | 'Santé émotionnelle'
  | 'Allaitement'
  | 'Préparation du bébé'
  | 'Post-partum'
  | 'Hygiène'
  | 'Sécurité'
  | 'Signes d\'alerte';

export interface AdviceItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AdviceCategory;
  trimester: AdviceTrimester;
  importance: AdviceImportance;
  source: string;
  lastUpdated: string;
  tags: string[];
  relatedSymptoms?: string[];
  practicalTips?: string[];
  whenToConsult?: string;
}

export type VideoTrimester = 'Tous' | '1er trimestre' | '2e trimestre' | '3e trimestre' | 'Après l\'accouchement';

export type VideoSubject =
  | 'Alimentation'
  | 'Symptômes'
  | 'Sommeil'
  | 'Douleurs'
  | 'Exercices'
  | 'Accouchement'
  | 'Allaitement'
  | 'Santé mentale'
  | 'Préparation bébé'
  | 'Consultations'
  | 'Hygiène'
  | 'Post-partum';

export type VideoDurationCategory = 'Moins de 5 min' | '5–15 min' | '15–30 min' | 'Plus de 30 min';

export type VideoCreatorType = 'Médecin' | 'Sage-femme' | 'Hôpital' | 'Professionnel de santé' | 'Éducateur' | 'Témoignage';

export interface VideoResource {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelUrl?: string;
  duration: string;
  durationCategory: VideoDurationCategory;
  thumbnailUrl: string;
  trimester: VideoTrimester;
  subject: VideoSubject;
  creatorType: VideoCreatorType;
  publishedAt?: string;
  source: string;
  relatedSymptoms?: string[];
  viewCount?: string;
}

export interface HealthProfessionalCreator {
  id: string;
  name: string;
  avatarUrl: string;
  platforms: ('YouTube' | 'TikTok' | 'Instagram')[];
  platformLinks: { platform: 'YouTube' | 'TikTok' | 'Instagram'; url: string; handle?: string }[];
  specialty: string;
  bio: string;
  contentType: string;
  verified: boolean;
  resourcesCount?: number;
}

export type HealthFacilityType =
  | 'Maternité'
  | 'Hôpital'
  | 'Clinique'
  | 'Centre de santé'
  | 'Urgences'
  | 'Pharmacie';

export interface HealthFacility {
  id: string;
  name: string;
  type: HealthFacilityType;
  lat: number;
  lng: number;
  address: string;
  city: string;
  region?: string;
  postcode?: string;
  phone?: string;
  emergencyPhone?: string;
  hours?: string;
  website?: string;
  hasMaternity: boolean;
  hasEmergency: boolean;
  notes?: string;
  source?: 'OpenStreetMap' | 'Base certifiée';
  osmId?: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: {
    label: string;
    sublabel?: string;
    value: string;
    score: number;
    isEmergency?: boolean;
  }[];
}

export type OrientationLevel = 'Surveillance' | 'Avis médical recommandé' | 'Consultation rapide' | 'Urgence';

export interface AssessmentResultData {
  level: OrientationLevel;
  title: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  actions: string[];
  recommendedAdviceCategory?: string;
  suggestedFacilityType?: string;
  emergencyPhoneToCall?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isError?: boolean;
  errorCode?: string | number;
  executedAction?: {
    actionType: string;
    summary: string;
    item?: any;
    success: boolean;
  };
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  messages: AiChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// -----------------------------------------------------------
// TYPES POUR LE MODULE : ORDONNANCES MÉDICALES (MAMAN+)
// -----------------------------------------------------------

export interface PrescriptionMedication {
  id: string;
  name: string; // e.g. "Acide Folique (Vitamine B9) 0.4mg"
  dosage: string; // e.g. "1 comprimé par jour le matin"
  duration: string; // e.g. "Pendant 3 mois"
  instructions?: string; // e.g. "Au cours du petit-déjeuner avec un verre d'eau"
}

export interface Prescription {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  practitioner: string; // e.g. "Dr. Sophie Martin"
  practitionerRole?: string; // e.g. "Gynécologue-Obstétricienne", "Sage-femme"
  facility?: string; // e.g. "Clinique Mère-Enfant / Hôpital Général"
  status: 'Active' | 'Terminée' | 'Renouvelée';
  medications: PrescriptionMedication[];
  generalInstructions?: string; // e.g. "Bilan biologique sanguin à renouveler à 28 SA"
  validatedByProfessional: boolean; // Mention que les informations ont été saisies ou validées par un professionnel
  notes?: string;
  createdAt: string;
  updatedAt: string;
}



