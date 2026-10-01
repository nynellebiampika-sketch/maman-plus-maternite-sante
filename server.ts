import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';
import { executeServerAction, ActionResult } from './src/server/actions';
import {
  VAPID_PUBLIC_KEY,
  verifyFirebaseUser,
  registerUserSubscription,
  sendPushToUser,
  schedulePushNotification,
  startBackgroundPushScheduler,
} from './src/server/notifications';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY non configurée');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Action tools definitions for Gemini 2.5 Flash-Lite Function Calling
const actionTools = [
  {
    functionDeclarations: [
      // --- RAPPELS (Reminders) ---
      {
        name: 'createReminder',
        description:
          "Ajoute un nouveau rappel dans l'application (prise de vitamines, fer, hydratation, exercices, rendez-vous). Utiliser UNIQUEMENT sur demande explicite de l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Titre du rappel (ex: Prendre mes vitamines, Boire de l’eau)' },
            date: { type: Type.STRING, description: 'Date au format YYYY-MM-DD (facultatif, défaut: aujourd’hui)' },
            time: { type: Type.STRING, description: 'Heure au format HH:MM (ex: 08:00, 14:30)' },
            frequency: { type: Type.STRING, description: 'Fréquence : "Une fois", "Quotidien", "Hebdomadaire" ou "Mensuel"' },
            description: { type: Type.STRING, description: 'Description complémentaire facultative' },
          },
          required: ['title', 'time'],
        },
      },
      {
        name: 'addReminder',
        description: "Alias pour createReminder. Ajoute un nouveau rappel dans l'application.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Titre du rappel' },
            date: { type: Type.STRING, description: 'Date au format YYYY-MM-DD (facultatif, défaut: aujourd’hui)' },
            time: { type: Type.STRING, description: 'Heure au format HH:MM' },
            frequency: { type: Type.STRING, description: 'Fréquence' },
            description: { type: Type.STRING, description: 'Description' },
          },
          required: ['title', 'time'],
        },
      },
      {
        name: 'getReminders',
        description: "Récupère la liste réelle de tous les rappels enregistrés dans l'application pour l'utilisatrice connectée.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateReminder',
        description: 'Modifie un rappel existant ou son statut actif. Utiliser UNIQUEMENT sur demande explicite.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            reminderId: { type: Type.STRING, description: 'Identifiant du rappel' },
            title: { type: Type.STRING, description: 'Nouveau titre' },
            date: { type: Type.STRING, description: 'Nouvelle date au format YYYY-MM-DD' },
            time: { type: Type.STRING, description: 'Nouvelle heure au format HH:MM' },
            frequency: { type: Type.STRING, description: 'Fréquence' },
            description: { type: Type.STRING, description: 'Nouvelle description' },
            isActive: { type: Type.BOOLEAN, description: 'Activer (true) ou désactiver (false) le rappel' },
          },
          required: ['reminderId'],
        },
      },
      {
        name: 'deleteReminder',
        description:
          "Supprime un rappel. ATTENTION STRICTE : Ne DOIT être appelé QUE si l'utilisatrice a expressément confirmé la suppression lors d'un échange préalable.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            reminderId: { type: Type.STRING, description: 'Identifiant du rappel à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: "Doit valoir true si l'utilisatrice a expressément confirmé." },
          },
          required: ['reminderId', 'confirmed'],
        },
      },

      // --- RENDEZ-VOUS (Appointments) ---
      {
        name: 'createAppointment',
        description:
          "Ajoute un nouveau rendez-vous médical dans le calendrier (consultation prénatale, échographie, gynécologue, sage-femme, anesthésiste).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Titre ou objet du rendez-vous (ex: Consultation 6e mois, Échographie T2, RDV Sage-femme)' },
            date: { type: Type.STRING, description: 'Date du rendez-vous au format YYYY-MM-DD' },
            time: { type: Type.STRING, description: 'Heure au format HH:MM (ex: 10:00, 14:30)' },
            practitioner: { type: Type.STRING, description: 'Nom du praticien ou médecin (ex: Dr Martin, Sage-femme Dupont)' },
            location: { type: Type.STRING, description: 'Lieu du rendez-vous (ex: Cabinet médical, Maternité)' },
            notes: { type: Type.STRING, description: 'Notes complémentaires facultatives' },
          },
          required: ['title', 'date', 'time'],
        },
      },
      {
        name: 'addAppointment',
        description: "Alias pour createAppointment. Ajoute un nouveau rendez-vous médical dans le calendrier.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Titre ou objet du rendez-vous' },
            date: { type: Type.STRING, description: 'Date du rendez-vous au format YYYY-MM-DD' },
            time: { type: Type.STRING, description: 'Heure au format HH:MM' },
            practitioner: { type: Type.STRING, description: 'Praticien' },
            location: { type: Type.STRING, description: 'Lieu' },
            notes: { type: Type.STRING, description: 'Notes complémentaires' },
          },
          required: ['title', 'date', 'time'],
        },
      },
      {
        name: 'getAppointments',
        description: "Récupère la liste réelle des rendez-vous médicaux enregistrés dans le calendrier de l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateAppointment',
        description: 'Modifie un rendez-vous médical existant dans le calendrier. Utiliser UNIQUEMENT sur demande explicite.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            appointmentId: { type: Type.STRING, description: 'Identifiant du rendez-vous à modifier' },
            title: { type: Type.STRING, description: 'Nouveau titre' },
            date: { type: Type.STRING, description: 'Nouvelle date au format YYYY-MM-DD' },
            time: { type: Type.STRING, description: 'Nouvelle heure au format HH:MM' },
            practitioner: { type: Type.STRING, description: 'Nouveau praticien' },
            location: { type: Type.STRING, description: 'Nouveau lieu' },
            notes: { type: Type.STRING, description: 'Nouvelles notes' },
          },
          required: ['appointmentId'],
        },
      },
      {
        name: 'deleteAppointment',
        description:
          "Supprime un rendez-vous du calendrier. ATTENTION STRICTE : Demande toujours confirmation d'abord. confirmed doit être true.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            appointmentId: { type: Type.STRING, description: 'Identifiant du rendez-vous à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: "Doit valoir true si l'utilisatrice a expressément confirmé." },
          },
          required: ['appointmentId', 'confirmed'],
        },
      },

      // --- SYMPTÔMES (Symptoms) ---
      {
        name: 'addSymptom',
        description: "Enregistre un symptôme ressenti par la maman (nausées, reflux, fatigue, contractions, tiraillements, maux de dos, jambes lourdes...).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            symptomName: { type: Type.STRING, description: 'Nom du symptôme (ex: Nausées matinales, Reflux gastrique, Fatigue intense)' },
            intensity: { type: Type.STRING, description: 'Intensité : "Léger", "Modéré" ou "Sévère"' },
            note: { type: Type.STRING, description: 'Note ou commentaire sur les circonstances ou le ressenti' },
            date: { type: Type.STRING, description: 'Date de survenue (YYYY-MM-DD ou "Aujourd\'hui")' },
            time: { type: Type.STRING, description: 'Heure de survenue (HH:MM)' },
          },
          required: ['symptomName'],
        },
      },
      {
        name: 'getSymptoms',
        description: "Récupère l'historique réel des symptômes enregistrés par l'utilisatrice dans l'application.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'deleteSymptom',
        description: "Supprime un symptôme enregistré. Requiert confirmation explicite.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            symptomId: { type: Type.STRING, description: 'Identifiant du symptôme à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['symptomId', 'confirmed'],
        },
      },

      // --- SUIVI DU POIDS (Weight Tracking) ---
      {
        name: 'addWeight',
        description: "Enregistre une nouvelle pesée dans le suivi du poids de grossesse.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            weightKg: { type: Type.NUMBER, description: 'Poids en kilogrammes (ex: 64.5)' },
            date: { type: Type.STRING, description: 'Date de la pesée au format YYYY-MM-DD (défaut: aujourd’hui)' },
            note: { type: Type.STRING, description: 'Note ou commentaire facultatif' },
          },
          required: ['weightKg'],
        },
      },
      {
        name: 'addWeightEntry',
        description: "Alias pour addWeight. Enregistre une nouvelle pesée.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            weightKg: { type: Type.NUMBER, description: 'Poids en kilogrammes' },
            date: { type: Type.STRING, description: 'Date au format YYYY-MM-DD' },
            note: { type: Type.STRING, description: 'Note facultative' },
          },
          required: ['weightKg'],
        },
      },
      {
        name: 'getWeights',
        description: "Récupère l'historique réel des pesées enregistrées par l'utilisatrice avec les dates et notes.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'deleteWeight',
        description: "Supprime une pesée enregistrée. Requiert confirmation explicite.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            weightId: { type: Type.STRING, description: 'Identifiant de la pesée à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['weightId', 'confirmed'],
        },
      },

      // --- JOURNAL INTIME (Journal) ---
      {
        name: 'addJournalEntry',
        description: 'Ajoute une note, anecdote ou réflexion au journal intime de grossesse.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Titre de la note de journal' },
            content: { type: Type.STRING, description: 'Texte ou récit de la note' },
            mood: { type: Type.STRING, description: 'Humeur : "Heureuse", "Sereine", "Fatiguée", "Émue", "Anxieuse" ou "En forme"' },
            date: { type: Type.STRING, description: 'Date au format YYYY-MM-DD' },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'getJournalEntries',
        description: "Récupère les entrées réelles enregistrées dans le journal intime de grossesse.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateJournalEntry',
        description: 'Modifie une note existante du journal de bord.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            entryId: { type: Type.STRING, description: 'Identifiant de la note' },
            title: { type: Type.STRING, description: 'Nouveau titre' },
            content: { type: Type.STRING, description: 'Nouveau contenu' },
            mood: { type: Type.STRING, description: 'Nouvelle humeur' },
          },
          required: ['entryId'],
        },
      },
      {
        name: 'deleteJournalEntry',
        description: 'Supprime une note du journal. Demande TOUJOURS confirmation avant de supprimer.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            entryId: { type: Type.STRING, description: 'Identifiant de la note à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['entryId', 'confirmed'],
        },
      },

      // --- CHECKLIST & VALISE MATERNITÉ ---
      {
        name: 'createChecklistItem',
        description: 'Ajoute un élément dans la checklist (Valise Maternité, Administratif, Chambre & Équipement, Santé & Suivi, Autre).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Nom de l’élément (ex: Brassière de laine, Déclaration CAF)' },
            category: {
              type: Type.STRING,
              description: 'Catégorie : "Valise Maternité", "Administratif", "Chambre & Équipement", "Santé & Suivi" ou "Autre"',
            },
            dueDate: { type: Type.STRING, description: 'Date d’échéance éventuelle (YYYY-MM-DD)' },
          },
          required: ['title', 'category'],
        },
      },
      {
        name: 'addChecklistItem',
        description: 'Alias pour createChecklistItem. Ajoute un élément dans la checklist.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Nom de l’élément' },
            category: { type: Type.STRING, description: 'Catégorie' },
            dueDate: { type: Type.STRING, description: 'Date d’échéance' },
          },
          required: ['title', 'category'],
        },
      },
      {
        name: 'getChecklist',
        description: "Récupère la liste réelle des éléments de la checklist avec leur statut accompli ou à faire.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateChecklistItem',
        description:
          "Modifie un élément de la checklist ou le coche comme fait (ex: « Coche la checklist Préparer la valise »). Peut être ciblé soit par itemId, soit directement par son titre ou mot-clé (ex: title: 'Préparer la valise').",
        parameters: {
          type: Type.OBJECT,
          properties: {
            itemId: { type: Type.STRING, description: 'Identifiant ou référence de l’élément' },
            title: { type: Type.STRING, description: 'Titre ou mot-clé de l’élément à cocher / modifier (ex: Préparer la valise)' },
            completed: { type: Type.BOOLEAN, description: 'true si coché / accompli, false sinon' },
            category: { type: Type.STRING, description: 'Nouvelle catégorie' },
            dueDate: { type: Type.STRING, description: 'Nouvelle date limite' },
          },
        },
      },
      {
        name: 'deleteChecklistItem',
        description: 'Supprime un élément de la checklist. Demande confirmation explicite.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            itemId: { type: Type.STRING, description: 'Identifiant de l’élément à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['itemId', 'confirmed'],
        },
      },

      // --- INFORMATIONS DE GROSSESSE, BÉBÉ & PROFIL ---
      {
        name: 'getPregnancyInfo',
        description:
          "Récupère les informations calculées sur la grossesse : semaine d'aménorrhée (SA), jours, trimestre, date du terme (DPA), compte à rebours de jours restants, taille et poids de départ.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'getBabyInfo',
        description: 'Récupère les informations enregistrées sur le bébé (prénom/surnom, sexe, date des premiers mouvements).',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateBabyInfo',
        description: 'Met à jour les informations du bébé (surnom/prénom, sexe, date des premiers mouvements, notes).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            nickname: { type: Type.STRING, description: 'Prénom ou surnom du bébé' },
            gender: { type: Type.STRING, description: 'Sexe : "Fille", "Garçon", "Surprise" ou "Non précisé"' },
            firstKicksDate: { type: Type.STRING, description: 'Date des premiers mouvements ressentis (YYYY-MM-DD)' },
            movementNotes: { type: Type.STRING, description: 'Notes sur les mouvements' },
            notes: { type: Type.STRING, description: 'Notes ou observations' },
          },
        },
      },
      {
        name: 'getUserProfile',
        description: 'Récupère les informations personnelles du profil de la maman (prénom, nom, DPA, DDR, taille, poids initial).',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateProfile',
        description:
          'Met à jour les informations du profil de la maman (prénom, nom, date présumée d’accouchement DPA, date des dernières règles DDR, taille en cm, poids avant grossesse).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            firstName: { type: Type.STRING, description: 'Prénom' },
            lastName: { type: Type.STRING, description: 'Nom de famille' },
            dueDate: { type: Type.STRING, description: 'Date présumée d’accouchement DPA (YYYY-MM-DD)' },
            lastMenstrualPeriodDate: { type: Type.STRING, description: 'Date des dernières règles DDR (YYYY-MM-DD)' },
            heightCm: { type: Type.NUMBER, description: 'Taille en cm' },
            prePregnancyWeightKg: { type: Type.NUMBER, description: 'Poids avant grossesse en kg' },
          },
        },
      },

      // --- EXAMENS MÉDICAUX ---
      {
        name: 'getExams',
        description: "Récupère la liste des examens médicaux de grossesse enregistrés (échographies, bilans sanguins, HGPO, prélèvements...).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'addExam',
        description: "Enregistre un examen médical dans le suivi.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Nom de l’examen (ex: Dépistage Diabète Gestationnel, Sérologie toxoplasmose)' },
            type: { type: Type.STRING, description: 'Type d’examen' },
            date: { type: Type.STRING, description: 'Date au format YYYY-MM-DD' },
            location: { type: Type.STRING, description: 'Lieu ou laboratoire' },
            resultNotes: { type: Type.STRING, description: 'Résultats ou notes' },
            status: { type: Type.STRING, description: 'Statut : "Planifié", "Réalisé", "En attente résultats"' },
          },
          required: ['title'],
        },
      },
      {
        name: 'deleteExam',
        description: "Supprime un examen médical. Demande confirmation explicite.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            examId: { type: Type.STRING, description: 'Identifiant de l’examen à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit valoir true' },
          },
          required: ['examId', 'confirmed'],
        },
      },

      // --- CONSEILS & VIDÉOS SAUVEGARDÉS ---
      {
        name: 'getSavedAdvice',
        description: "Récupère les identifiants des fiches conseils mises en favoris par l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'saveAdvice',
        description: "Ajoute une fiche conseil aux favoris de l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            adviceId: { type: Type.STRING, description: 'Identifiant du conseil à sauvegarder' },
          },
          required: ['adviceId'],
        },
      },
      {
        name: 'getSavedVideos',
        description: "Récupère les identifiants des vidéos mises en favoris par l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'saveVideo',
        description: "Ajoute une vidéo aux favoris de l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            videoId: { type: Type.STRING, description: 'Identifiant de la vidéo à sauvegarder' },
          },
          required: ['videoId'],
        },
      },

      // --- NOTIFICATIONS ---
      {
        name: 'getNotifications',
        description: "Récupère les notifications récentes reçues par l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },

      // --- NAVIGATION DANS LES RUBRIQUES DE L'APPLICATION ---
      {
        name: 'navigateToView',
        description:
          "Permet d'ouvrir et de naviguer vers n'importe quelle rubrique de l'application MAMAN+ (ex: « Ouvre mes rendez-vous », « Va dans mon suivi de grossesse », « Ouvre ma valise », « Va dans mon journal », « Reviens à l'accueil »).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            view: {
              type: Type.STRING,
              description:
                'Identifiant de la rubrique : "dashboard" (Tableau de bord / Accueil), "pregnancy" (Ma Grossesse), "baby" (Bébé), "calendar" (Calendrier), "appointments" (Rendez-vous), "symptoms" (Symptômes), "weight" (Suivi du poids), "exams" (Examens médicaux), "journal" (Journal intime), "checklist" (Checklist / Valise), "reminders" (Rappels), "notifications" (Notifications), "resources" (Conseils & Ressources), "profile" (Mon Profil), "subscription" (Abonnement & Paiement), "settings" (Paramètres)',
            },
            reason: {
              type: Type.STRING,
              description: 'Courte confirmation pour l’utilisatrice',
            },
          },
          required: ['view'],
        },
      },
    ],
  },
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // Health check routes for container lifecycle and Cloud Run
  app.get(['/api/health', '/health'], (req: Request, res: Response) => {
    res.json({ status: 'ok', port: PORT, env: process.env.NODE_ENV || 'development' });
  });

  // Direct Server Action Execution Route (for secure backend mutations)
  app.post('/api/action/execute', async (req: Request, res: Response) => {
    try {
      const { userId, functionName, functionArgs } = req.body;
      if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
          success: false,
          error: "Vous devez être connectée pour effectuer cette action.",
        });
      }
      if (!functionName || typeof functionName !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Nom d'action non spécifié.",
        });
      }

      const result = await executeServerAction(userId, functionName, functionArgs || {});
      return res.json(result);
    } catch (err: any) {
      console.error('Server error executing action:', err);
      return res.status(500).json({
        success: false,
        error: "Une difficulté est survenue lors de l'enregistrement de l'action.",
      });
    }
  });

  // API Route: Google Gemini Flash-Lite Chat with Tool Execution
  app.post('/api/chat', async (req: Request, res: Response) => {
    let conversationId: string | undefined;
    try {
      const { message, messages, conversationId: convId, uid, userContext } = req.body || {};
      conversationId = convId;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          success: false,
          error: "La clé API de l'assistant n'est pas configurée côté serveur.",
          code: 'API_KEY_MISSING',
          conversationId,
        });
      }

      // Parse messages from either format: array of messages or single message string
      let rawMessages: Array<{ role: string; content: string }> = [];
      if (Array.isArray(messages) && messages.length > 0) {
        rawMessages = messages;
      } else if (typeof message === 'string' && message.trim()) {
        rawMessages = [{ role: 'user', content: message.trim() }];
      }

      const cleanMessages = rawMessages.filter(
        (m) => m && m.content && String(m.content).trim().length > 0
      );

      if (cleanMessages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Aucun message valide reçu. Veuillez formuler votre demande.',
          code: 'INVALID_REQUEST',
          conversationId,
        });
      }

      const ai = getGeminiClient();
      const currentUid = uid
        ? String(uid).trim()
        : (userContext?.userId ? String(userContext.userId).trim() : '');

      // Construct system instruction strictly focused on MAMAN+ application & features
      let systemInstruction = `Tu es l'assistant officiel de l'application MAMAN+, propulsé par Google Gemini.
MAMAN+ est une application web mobile dédiée au suivi de la grossesse, de la santé périnatale et de la maternité.

RÈGLE D'OR PRIMORDIALE : PÉRIMÈTRE STRICTEMENT RESTREINT À L'APPLICATION MAMAN+
1. Tu es STRICTEMENT ET EXCLUSIVEMENT centré sur le fonctionnement, les fonctionnalités et l'utilisation de l'application MAMAN+.
2. Si l'utilisatrice pose une question qui NE CONCERNE PAS directement l'application MAMAN+ ou son utilisation (par exemple : questions de culture générale, actualités, météo, politique, sport, recettes de cuisine générales, code informatique, devoirs scolaires, conseils de voyage, blagues, ou questions médicales générales/diagnostics/prescriptions hors du cadre des fonctionnalités de l'application MAMAN+) :
   -> TU DOIS REFUSER POLIMENT ET CLAIREMENT DE RÉPONDRE.
   -> Indique explicitement que tu ne peux pas répondre à ce type de question car ta mission est exclusivement dédiée au fonctionnement, aux fonctionnalités et à l'utilisation de l'application MAMAN+.
   -> Invite-la ensuite à te poser une question sur l'application ou à te demander une action dans ses outils.
   -> Modèle de réponse en cas de question hors sujet :
   « Je ne peux pas répondre à cette question car mon rôle est strictement centré sur le fonctionnement, les fonctionnalités et l'utilisation de l'application MAMAN+. Je suis à votre disposition pour vous expliquer comment utiliser chaque outil (votre Agenda, vos Rappels, votre Suivi du poids, votre Journal, votre Checklist, votre profil...) ou pour enregistrer des données dans votre espace à votre demande. Comment puis-je vous aider concernant l'application MAMAN+ ? »
3. Exception d'urgence médicale : Si l'utilisatrice décrit une urgence vitale ou obstétricale (saignements anormaux, douleurs intenses, contractions précoces, fièvre élevée > 38°C, baisse brutale des mouvements de bébé, perte des eaux), rappelle-lui qu'en tant qu'assistant de l'application tu ne peux pas délivrer de diagnostic médical et indique-lui d'appeler immédiatement la maternité, le SAMU (15) ou les urgences (112).

CONNAISSANCE EXHAUSTIVE ET FIABLE DE L'APPLICATION MAMAN+ :
Donne des réponses claires, précises et fiables concernant UNIQUEMENT MAMAN+ et ses fonctionnalités :

1. Tableau de bord (Route : /) :
   - Synthèse de la grossesse : semaines d'aménorrhée (SA), trimestre actuel et compte à rebours précis avant le terme (DPA).
   - Radar biométrique & indicateurs de santé (tension, sommeil, hydratation, humeur, mouvements de bébé).
   - Prochains rendez-vous imminents et rappels programmés du jour.
   - Accès rapides (enregistrer une pesée, ajouter une note, nouveau rendez-vous).

2. Ma Grossesse (Route : /ma-grossesse) :
   - Suivi semaine par semaine (de 1 à 41 SA).
   - Comparaison de la taille et du poids estimé de bébé avec un fruit ou un légume.
   - Informations sur le développement foetal et les changements physiologiques de la maman.

3. Bébé (Route : /bebe) :
   - Fiche d'information de bébé : prénom ou surnom, sexe (Fille, Garçon, Surprise, Non précisé).
   - Enregistrement de la date des premiers mouvements ressentis ("premiers coups de pied").
   - Compteur et journal de bord des mouvements foetaux.

4. Calendrier & Rendez-vous (Routes : /calendrier et /rendez-vous) :
   - Calendrier mensuel interactif et liste chronologique des rendez-vous.
   - Types de consultations : suivi prénatal mensuel, les 3 échographies de référence (T1 ~12 SA, T2 morphologique ~22 SA, T3 ~32 SA), consultation obligatoire d'anesthésie (8e mois), séances de préparation à la naissance avec la sage-femme, bilans biologiques.
   - Détails gérés : Titre, Date, Heure, Praticien, Lieu et Notes.
   - Actions directes possibles : programmation, modification et suppression de rendez-vous.

5. Rappels (Route : /rappels) :
   - Gestionnaire d'alarmes personnalisées pour la santé de la maman : prise d'acide folique, compléments de fer, vitamines prénatales, hydratation quotidienne (1.5L à 2L d'eau), exercices de relaxation ou de renforcement du plancher pelvien.
   - Fréquences : Une fois, Quotidien, Hebdomadaire, Mensuel.
   - Possibilité d'activer ou désactiver un rappel d'un clic.

6. Suivi du Poids & IMC (Route : /suivi-poids) :
   - Enregistrement régulier des pesées (poids en kg, date, notes).
   - Calcul automatique de l'IMC initial avant grossesse selon la taille et le poids initial renseignés dans le profil.
   - Courbe personnalisée de gain pondéral recommandé selon les normes de santé (HAS / IOM) :
     * IMC < 18.5 (Insuffisance pondérale) : gain recommandé entre 12.5 et 18 kg
     * IMC 18.5 - 24.9 (Corpulence normale) : gain recommandé entre 11.5 et 16 kg
     * IMC 25 - 29.9 (Surpoids) : gain recommandé entre 7 et 11.5 kg
     * IMC ≥ 30 (Obésité) : gain recommandé entre 5 et 9 kg
   - Graphique interactif de l'évolution par trimestre et calcul du gain total.

7. Symptômes (Route : /symptomes) :
   - Journal quotidien des symptômes : nausées, reflux gastriques, fatigue, contractions, tiraillements ligamentaires, sommeil, maux de dos, jambes lourdes, humeur.
   - Évaluation de l'intensité (Léger, Modéré, Sévère) pour faciliter le dialogue avec le médecin ou la sage-femme.

8. Examens recommandés (Route : /examens) :
   - Calendrier et guide explicatif des examens médicaux de grossesse : dépistage trisomie 21, sérologies mensuelles toxoplasmose/rubéole, dépistage glycémie/diabète gestationnel (HGPO), prélèvement vaginal streptocoque B, consultation anesthésie.

9. Journal intime (Route : /journal) :
   - Journal de bord personnel de la maternité : noter souvenirs, émotions, anecdotes et pensées.
   - Ajout, modification, relecture et suppression des entrées.

10. Checklist & Valise de maternité (Route : /checklist) :
    - Listes de contrôle réparties par catégories :
      * Valise de la maman (tenues confortables, chemises d'allaitement, protections maternité, trousse de toilette).
      * Valise de bébé (bodies taille naissance/1 mois, pyjamas chauds, bonnets, brassières en laine, gigoteuse).
      * Salle de naissance (dossier médical complet, carte vitale, brumisateur, première tenue de bébé).
      * Démarches administratives (déclaration de grossesse CAF & Sécurité Sociale avant 14 SA, inscription en maternité, reconnaissance anticipée, mode de garde).
    - Cocher/décocher, ajouter des éléments personnalisés et supprimer.

11. Conseils & Ressources (Route : /conseils-ressources) :
    - Fiches conseils et recommandations officielles intégrées dans l'application.

12. Mon Profil (Route : /profil) :
    - Données personnelles : Prénom, Nom, DPA (Date Présumée d'Accouchement), DDR (Date des Dernières Règles), Taille (cm), Poids avant grossesse (kg).
    - Calcul automatique de l'âge gestationnel en semaines d'aménorrhée (SA) et jours.

13. Paramètres (Route : /parametres) :
    - Préférences, notifications, export complet des données personnelles (format JSON ou rapport d'impression) et déconnexion.

14. Recherche globale (raccourci Ctrl+K ou icône loupe) :
    - Accès instantané à n'importe quel rendez-vous, ressource ou page de l'application.

CAPACITÉ D'ACTION DIRECTE DANS L'APPLICATION :
Tu es un VÉRITABLE AGENT ACTIONNABLE intégré à l'application MAMAN+.
Tu disposes d'outils sécurisés te permettant de NAVIGUER, CONSULTER et AGIR DIRECTEMENT dans l'application pour l'utilisatrice connectée :

- Navigation instantanée : navigateToView (Tableau de bord, Ma grossesse, Bébé, Calendrier, Rendez-vous, Symptômes, Suivi du poids, Examens, Journal, Checklist, Rappels, Notifications, Conseils & Ressources, Profil, Abonnement & Paiement)
- Rappels : getReminders, createReminder, addReminder, updateReminder, deleteReminder
- Rendez-vous : getAppointments, createAppointment, addAppointment, updateAppointment, deleteAppointment
- Symptômes : getSymptoms, addSymptom, deleteSymptom
- Suivi du poids : getWeights, addWeight, addWeightEntry, deleteWeight
- Journal intime : getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry
- Checklist & Valise : getChecklist, createChecklistItem, addChecklistItem, updateChecklistItem, deleteChecklistItem
- Grossesse, Bébé & Profil : getPregnancyInfo, getBabyInfo, updateBabyInfo, getUserProfile, updateProfile
- Examens médicaux : getExams, addExam, deleteExam
- Conseils & Vidéos : getSavedAdvice, saveAdvice, getSavedVideos, saveVideo
- Notifications : getNotifications

DIRECTIVES STRICTES D'ACTIONNABILITÉ (COMPRENDRE → CONSULTER / AGIR → VÉRIFIER → CONFIRMER) :

1. NAVIGUER VERS LES RUBRIQUES SUR DEMANDE :
   Lorsque l'utilisatrice demande d'ouvrir une page ou d'aller dans une rubrique :
   - « Ouvre mes rendez-vous » -> Appelle immédiatement navigateToView({ view: "appointments" }) et confirme que la page est ouverte.
   - « Va dans mon suivi de grossesse » -> Appelle immédiatement navigateToView({ view: "pregnancy" }).
   - « Ouvre ma valise / ma checklist » -> Appelle immédiatement navigateToView({ view: "checklist" }).
   - « Ouvre mon journal » -> Appelle immédiatement navigateToView({ view: "journal" }).
   - « Va dans le suivi du poids » -> Appelle immédiatement navigateToView({ view: "weight" }).
   - « Ouvre les symptômes » -> Appelle immédiatement navigateToView({ view: "symptoms" }).
   - « Ouvre le calendrier » -> Appelle immédiatement navigateToView({ view: "calendar" }).
   - « Va dans Bébé » -> Appelle immédiatement navigateToView({ view: "baby" }).
   - « Ouvre mon profil » -> Appelle immédiatement navigateToView({ view: "profile" }).
   - « Ouvre les examens » -> Appelle immédiatement navigateToView({ view: "exams" }).
   - « Va dans les conseils et ressources » -> Appelle immédiatement navigateToView({ view: "resources" }).
   - « Ouvre mes notifications » -> Appelle immédiatement navigateToView({ view: "notifications" }).
   - « Reviens au tableau de bord / accueil » -> Appelle immédiatement navigateToView({ view: "dashboard" }).

2. CONSULTER LES VRAIES DONNÉES :
   Dès que l'utilisatrice pose une question relative à ses données ou à son suivi :
   - « Montre-moi mes prochains rendez-vous » -> Appelle immédiatement getAppointments() et réponds avec ses vrais rendez-vous.
   - « Combien je pesais la dernière fois ? » -> Appelle immédiatement getWeights() et réponds avec la dernière pesée enregistrée.
   - « Quels sont mes rappels ? » -> Appelle immédiatement getReminders().
   - « Quels symptômes ai-je notés récemment ? » -> Appelle immédiatement getSymptoms().
   - « Où en est ma checklist / ma valise ? » -> Appelle immédiatement getChecklist().
   - « À quelle semaine de grossesse suis-je ? / Quelle est ma DPA ? » -> Appelle immédiatement getPregnancyInfo().
   - « Quels sont mes examens médicaux ? » -> Appelle immédiatement getExams().
   Ne devine jamais des données : utilise toujours l'outil de consultation approprié.
   NOTE : MAMAN+ est une application 100% GRATUITE. Il n'y a aucun abonnement payant ni tarif.

3. AGIR SUR DEMANDE EXPLICITE :
   - « Ajoute un rendez-vous demain à 10h avec ma sage-femme » -> Appelle createAppointment({ title: "Rendez-vous sage-femme", date: "...", time: "10:00", practitioner: "Sage-femme" }).
   - « Ajoute 65 kg aujourd’hui » -> Appelle addWeight({ weightKg: 65, date: "..." }).
   - « Ajoute une note dans mon journal : Bébé bouge beaucoup ce matin » -> Appelle addJournalEntry({ title: "Mouvements de bébé", content: "Bébé bouge beaucoup ce matin" }).
   - « Coche la checklist “Préparer la valise” » -> Appelle updateChecklistItem({ title: "Préparer la valise", completed: true }).
   - « Rappelle-moi de prendre mes vitamines à 8h » -> Appelle createReminder({ title: "Prendre mes vitamines", time: "08:00", frequency: "Quotidien" }).
   - Le système exécute l'écriture dans Firestore et te renvoie le résultat.
   - Si succès : Confirme chaleureusement uniquement après confirmation de réussite (« C’est fait 💗 J’ai ajouté le rappel “Prendre mes vitamines” à 08:00, tous les jours. »).
   - Si échec : Ne JAMAIS dire « c’est fait ». Dis clairement : « Je n’ai pas réussi à enregistrer cette information. Je peux réessayer si tu le souhaites. »

4. SÉCURITÉ & RESTRICTIONS STRICTES :
   - L'utilisatrice connectée a accès UNIQUEMENT à ses propres données.
   - Tu ne dois JAMAIS accepter d'UID fourni dans la conversation.
   - L'IA ne doit JAMAIS pouvoir :
     * modifier son abonnement elle-même ;
     * modifier un paiement ou s'attribuer Premium/VIP ;
     * contourner les règles de sécurité.
   - Si l'utilisatrice demande de changer d'abonnement ou de payer : guide-la poliment vers la rubrique Abonnement & Paiement via navigateToView({ view: "subscription" }).

5. CONFIRMATION OBLIGATOIRE POUR LES ACTIONS SENSIBLES (SUPPRESSIONS) :
   - Pour toute suppression (deleteAppointment, deleteReminder, deleteJournalEntry, deleteChecklistItem, deleteWeight, deleteSymptom, deleteExam) :
   - Ne JAMAIS supprimer immédiatement sans accord explicite préalable.
   - Demande d'abord confirmation poliment : « Veux-tu vraiment que je supprime cet élément ? Merci de confirmer pour que je procède. »
   - N'appelle la fonction de suppression QUE si l'utilisatrice a expressément répondu Oui, « Je confirme » ou équivalent, en fournissant confirmed: true.

6. INTERDICTION STRICTE DE SIMULATION :
   Ne JAMAIS simuler une action. Ne prétends JAMAIS avoir enregistré, modifié ou supprimé quoi que ce soit si l'écriture n'a pas réellement réussi dans Firestore.

7. DATE DU JOUR : La date locale du jour est le ${userContext?.today || new Date().toISOString().split('T')[0]}.`;

      if (userContext) {
        systemInstruction += `\n\nContexte de l'utilisatrice actuellement connectée :`;
        if (userContext.name) systemInstruction += `\n- Prénom : ${userContext.name}`;
        if (userContext.pregnancyWeek)
          systemInstruction += `\n- Semaine d'aménorrhée (SA) : ${userContext.pregnancyWeek} SA`;
        if (userContext.dueDate)
          systemInstruction += `\n- Date présumée du terme : ${userContext.dueDate}`;
        if (userContext.babyName)
          systemInstruction += `\n- Prénom/surnom du bébé : ${userContext.babyName}`;
        if (userContext.existingSummary)
          systemInstruction += `\n- Données actuelles enregistrées (pour référence et modifications) :\n${userContext.existingSummary}`;
      }

      const lastUserMsg = cleanMessages[cleanMessages.length - 1];
      const previousMessages = cleanMessages.slice(0, cleanMessages.length - 1);

      // Map roles: 'user' -> 'user', 'assistant' -> 'model'
      const history = previousMessages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Ensure first message is 'user' if history exists
      while (history.length > 0 && history[0].role !== 'user') {
        history.shift();
      }

      // Candidate models: Google Flash-Lite models with automatic fallback
      const candidateModels = [
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
      ];

      let replyText = '';
      let usedModel = candidateModels[0];
      let executedAction: ActionResult | null = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const chat = ai.chats.create({
            model: modelName,
            history,
            config: {
              systemInstruction,
              tools: actionTools,
              temperature: 0.2,
            },
          });

          // Server-side call with a 22s safety timeout per model attempt
          const sendPromise = chat.sendMessage({
            message: lastUserMsg.content,
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT: Gemini request timed out')), 22000)
          );

          let currentResponse = await Promise.race([sendPromise, timeoutPromise]);
          let loopCount = 0;
          const maxTurns = 5;

          // Agentic Function Calling loop: allows read-then-act, multi-tool executions, and clean confirmations
          while (
            currentResponse.functionCalls &&
            currentResponse.functionCalls.length > 0 &&
            loopCount < maxTurns
          ) {
            loopCount++;
            const callResponses: any[] = [];

            for (const call of currentResponse.functionCalls) {
              if (!currentUid) {
                callResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: {
                      success: false,
                      error:
                        "Vous devez être connectée à votre compte pour que je puisse accéder à vos données personnelles ou enregistrer une action.",
                    },
                  },
                });
                continue;
              }

              // Execute the secure server action
              const actionResult = await executeServerAction(currentUid, call.name, call.args || {});
              if (!actionResult.isRead && actionResult.success) {
                executedAction = actionResult;
              }

              callResponses.push({
                functionResponse: {
                  name: call.name,
                  response: actionResult.data !== undefined
                    ? { success: actionResult.success, data: actionResult.data, summary: actionResult.summary }
                    : {
                        success: actionResult.success,
                        message: actionResult.summary,
                        error: actionResult.userFriendlyError,
                      },
                },
              });
            }

            // Feed the action execution result back to Gemini so it completes its response
            const nextPromise = chat.sendMessage({
              message: callResponses,
            });
            const nextTimeout = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('TIMEOUT: Gemini tool execution timed out')), 22000)
            );
            currentResponse = await Promise.race([nextPromise, nextTimeout]);
          }

          if (currentResponse.text) {
            replyText = currentResponse.text;
            usedModel = modelName;
            break;
          } else if (executedAction) {
            replyText = executedAction.summary;
            usedModel = modelName;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} fallback attempt:`, err?.message);
          lastError = err;
        }
      }

      if (!replyText) {
        throw lastError || new Error('Aucune réponse générée par Google Gemini.');
      }

      return res.json({
        success: true,
        message: replyText,
        conversationId,
        model: usedModel,
        executedAction,
      });
    } catch (err: any) {
      console.error('Server error calling Gemini:', err);
      const errMsg = String(err?.message || '');

      let statusCode = 500;
      let userFriendlyError = "Une difficulté est survenue lors de la communication avec l'assistant. Veuillez réessayer dans quelques instants.";
      let errorCode = 'SERVER_ERROR';

      if (!process.env.GEMINI_API_KEY) {
        statusCode = 503;
        userFriendlyError = "La clé API de l'assistant n'est pas configurée côté serveur.";
        errorCode = 'API_KEY_MISSING';
      } else if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.toLowerCase().includes('quota')) {
        statusCode = 429;
        userFriendlyError = "L'assistant est momentanément très sollicité. Veuillez patienter quelques instants avant de réessayer.";
        errorCode = 'QUOTA_EXCEEDED';
      } else if (errMsg.includes('TIMEOUT') || errMsg.includes('ETIMEDOUT') || errMsg.includes('AbortError') || errMsg.toLowerCase().includes('deadline')) {
        statusCode = 504;
        userFriendlyError = "Le délai d'attente de la réponse a expiré. Veuillez vérifier votre connexion et réessayer.";
        errorCode = 'TIMEOUT';
      } else if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE')) {
        statusCode = 503;
        userFriendlyError = "L'assistant est temporairement indisponible. Réessayez dans quelques instants.";
        errorCode = 'SERVICE_UNAVAILABLE';
      } else if (errMsg.includes('NOT_FOUND') || errMsg.includes('404')) {
        statusCode = 502;
        userFriendlyError = "Le modèle d'intelligence artificielle est momentanément indisponible.";
        errorCode = 'MODEL_UNAVAILABLE';
      } else if (errMsg.toLowerCase().includes('network') || errMsg.includes('fetch failed') || errMsg.includes('ECONNREFUSED') || errMsg.includes('ENOTFOUND')) {
        statusCode = 502;
        userFriendlyError = "La connexion avec l'assistant a été interrompue. Veuillez vérifier votre connexion.";
        errorCode = 'NETWORK_ERROR';
      }

      return res.status(statusCode).json({
        success: false,
        error: userFriendlyError,
        code: errorCode,
        conversationId,
      });
    }
  });

  // Health and config status route
  app.get('/api/chat/status', (req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: 'ok',
      configured: hasKey,
      model: 'Google Gemini Flash-Lite (gemini-flash-lite-latest)',
      provider: 'Google Gemini API',
      actionsSupported: true,
    });
  });

  // -------------------------------------------------------------
  // Firebase Cloud Messaging & Web Push Notification Routes
  // -------------------------------------------------------------

  // 1. Get Public VAPID Key
  app.get('/api/notifications/vapid-public-key', (req: Request, res: Response) => {
    return res.json({
      publicKey: VAPID_PUBLIC_KEY,
    });
  });

  // 2. Register / Subscribe Device Token
  app.post('/api/notifications/subscribe', async (req: Request, res: Response) => {
    try {
      const authUser = await verifyFirebaseUser(req);
      const targetUserId = authUser.uid || req.body.userId;
      if (!targetUserId) {
        return res.status(401).json({ success: false, error: 'Non authentifié' });
      }

      const { subscription, token, platform } = req.body;
      if (!subscription) {
        return res.status(400).json({ success: false, error: 'PushSubscription requise' });
      }

      const record = registerUserSubscription(targetUserId, subscription, token, platform);
      return res.json({
        success: true,
        message: 'Abonnement push enregistré',
        subscriptionId: record.id,
      });
    } catch (err: any) {
      console.error('[Server Push] Subscribe error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erreur d’enregistrement push.' });
    }
  });

  // 3. Send Push Notification (Strictly authorized to own user or system)
  app.post('/api/notifications/send', async (req: Request, res: Response) => {
    try {
      const authUser = await verifyFirebaseUser(req);
      const targetUserId = authUser.uid || req.body.userId;
      if (!targetUserId) {
        return res.status(401).json({ success: false, error: 'Non authentifié' });
      }

      // Security check: an authenticated user can only send to their own UID
      if (authUser.uid && req.body.userId && req.body.userId !== authUser.uid) {
        return res.status(403).json({ success: false, error: 'Accès interdit : vous ne pouvez notifier que votre propre compte.' });
      }

      const { title, body, type, data, url, subscription, token, platform } = req.body;
      if (!title || !body) {
        return res.status(400).json({ success: false, error: 'Titre et message obligatoires.' });
      }

      // If subscription object is provided directly with send request, register it immediately
      if (subscription && typeof subscription === 'object' && subscription.endpoint) {
        registerUserSubscription(targetUserId, subscription, token, platform || 'desktop');
      }

      const result = await sendPushToUser(targetUserId, {
        title,
        body,
        type: type || 'clinical',
        data: data || {},
        url: url || data?.path || '/notifications',
      });

      return res.json({
        success: result.success,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        errors: result.errors,
        message:
          result.sentCount > 0
            ? 'Notification envoyée avec succès.'
            : 'Aucun appareil actif actuellement abonné pour cet utilisateur.',
      });
    } catch (err: any) {
      console.error('[Server Push] Send error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erreur lors de l’envoi de la notification.' });
    }
  });

  // 4. Schedule Future Push Notification (Appointments, Reminders)
  app.post('/api/notifications/schedule', async (req: Request, res: Response) => {
    try {
      const authUser = await verifyFirebaseUser(req);
      const targetUserId = authUser.uid || req.body.userId;
      if (!targetUserId) {
        return res.status(401).json({ success: false, error: 'Non authentifié' });
      }

      if (authUser.uid && req.body.userId && req.body.userId !== authUser.uid) {
        return res.status(403).json({ success: false, error: 'Accès interdit.' });
      }

      const { title, body, scheduledAt, type, data } = req.body;
      if (!title || !body || !scheduledAt) {
        return res.status(400).json({ success: false, error: 'Champs obligatoires manquants (title, body, scheduledAt).' });
      }

      const scheduledItem = schedulePushNotification(targetUserId, {
        title,
        body,
        scheduledAt,
        type: type || 'reminder',
        data: data || {},
      });

      return res.json({
        success: true,
        message: 'Rappel programmé avec succès sur le serveur.',
        scheduledId: scheduledItem.id,
        scheduledAt: scheduledItem.scheduledAt,
      });
    } catch (err: any) {
      console.error('[Server Push] Schedule error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Erreur programmation rappel.' });
    }
  });

  // Start background push notification scheduler
  startBackgroundPushScheduler();

  // Helper to determine accurate public origin
  const getPublicBaseUrl = (req: Request): string => {
    if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    return `${proto}://${req.headers.host}`;
  };

  // SEO: Dynamic Robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = getPublicBaseUrl(req);
    const robots = `User-agent: *
Allow: /
Allow: /conseils-ressources
Allow: /ressources
Allow: /guide
Allow: /guide-utilisation
Allow: /login

Disallow: /dashboard
Disallow: /profil
Disallow: /profile
Disallow: /parametres
Disallow: /settings
Disallow: /admin
Disallow: /symptomes
Disallow: /suivi-poids
Disallow: /examens
Disallow: /mon-ordonnance
Disallow: /ordonnance
Disallow: /synthese-suivi
Disallow: /journal
Disallow: /checklist
Disallow: /rappels
Disallow: /notifications
Disallow: /ma-grossesse
Disallow: /bebe
Disallow: /calendrier
Disallow: /rendez-vous

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
  });

  // SEO: Dynamic Sitemap.xml
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = getPublicBaseUrl(req);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/conseils-ressources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/guide</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Vite middleware setup (development) vs Static serving (production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur MAMAN+ démarré sur le port ${PORT}`);
    console.log(`Assistant Gemini 2.5 Flash-Lite (Free Tier) actif avec support des actions sur /api/chat`);
  });
}

startServer().catch((err) => {
  console.error('Erreur lors du démarrage du serveur:', err);
});

