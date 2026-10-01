import { GoogleGenAI, Type } from '@google/genai';
import { executeServerAction, ActionResult } from './actions';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
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

// Action tools definitions for Gemini Flash-Lite Function Calling
export const actionTools = [
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
            weightId: { type: Type.STRING, description: 'Identifiant de la pesée' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['weightId', 'confirmed'],
        },
      },

      // --- JOURNAL INTIME (Personal Journal) ---
      {
        name: 'addJournalEntry',
        description: "Ajoute une nouvelle note ou souvenir dans le journal intime de grossesse.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Titre de la note de journal' },
            content: { type: Type.STRING, description: 'Contenu complet ou pensée' },
            mood: { type: Type.STRING, description: 'Humeur (ex: Heureuse, Émue, Fatiguée, Impatiente, Sereine)' },
            date: { type: Type.STRING, description: 'Date au format YYYY-MM-DD (défaut: aujourd’hui)' },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'getJournalEntries',
        description: "Récupère les notes du journal intime de grossesse de l'utilisatrice.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateJournalEntry',
        description: "Modifie une note existante du journal intime.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            entryId: { type: Type.STRING, description: 'Identifiant de la note de journal' },
            title: { type: Type.STRING, description: 'Nouveau titre' },
            content: { type: Type.STRING, description: 'Nouveau contenu' },
            mood: { type: Type.STRING, description: 'Nouvelle humeur' },
          },
          required: ['entryId'],
        },
      },
      {
        name: 'deleteJournalEntry',
        description: "Supprime une entrée du journal intime. Requiert confirmation explicite.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            entryId: { type: Type.STRING, description: 'Identifiant de la note à supprimer' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['entryId', 'confirmed'],
        },
      },

      // --- CHECKLIST & VALISE DE MATERNITÉ ---
      {
        name: 'getChecklist',
        description: "Récupère les éléments de la checklist et de la valise de maternité avec leur statut (fait ou à faire).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Catégorie facultative (ex: "Valise Maman", "Valise Bébé", "Salle d\'accouchement", "Administratif")' },
          },
        },
      },
      {
        name: 'createChecklistItem',
        description: "Ajoute un nouvel élément à la valise de maternité ou checklist.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Nom de l\'article ou de la tâche à accomplir' },
            category: { type: Type.STRING, description: 'Catégorie ("Valise Maman", "Valise Bébé", "Salle d\'accouchement", "Administratif")' },
          },
          required: ['title'],
        },
      },
      {
        name: 'addChecklistItem',
        description: "Alias pour createChecklistItem. Ajoute un élément à la valise ou checklist.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Nom de l\'article' },
            category: { type: Type.STRING, description: 'Catégorie' },
          },
          required: ['title'],
        },
      },
      {
        name: 'updateChecklistItem',
        description: "Coche, décoche ou modifie un élément de la valise ou checklist.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            itemId: { type: Type.STRING, description: 'Identifiant de l\'article ou titre approximatif' },
            completed: { type: Type.BOOLEAN, description: 'true pour cocher comme fait, false pour décocher' },
            title: { type: Type.STRING, description: 'Nouveau nom si modification' },
          },
          required: ['completed'],
        },
      },
      {
        name: 'deleteChecklistItem',
        description: "Supprime un élément de la checklist. Requiert confirmation explicite.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            itemId: { type: Type.STRING, description: 'Identifiant de l\'article' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit valoir true' },
          },
          required: ['itemId', 'confirmed'],
        },
      },

      // --- EXAMENS MÉDICAUX (Medical Exams) ---
      {
        name: 'getExams',
        description: "Récupère la liste des examens médicaux recommandés et leur état (réalisé ou à venir).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'addExam',
        description: "Enregistre un examen médical réalisé ou planifié (échographie, prise de sang, test glycémie, prélèvement vaginal...).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Nom de l\'examen' },
            date: { type: Type.STRING, description: 'Date de l\'examen au format YYYY-MM-DD' },
            result: { type: Type.STRING, description: 'Résultat ou conclusion (ex: Normal, À surveiller)' },
            notes: { type: Type.STRING, description: 'Remarques ou détails' },
          },
          required: ['title'],
        },
      },
      {
        name: 'deleteExam',
        description: "Supprime un examen médical enregistré. Requiert confirmation explicite.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            examId: { type: Type.STRING, description: 'Identifiant de l\'examen' },
            confirmed: { type: Type.BOOLEAN, description: 'Doit être true' },
          },
          required: ['examId', 'confirmed'],
        },
      },

      // --- DONNÉES DE GROSSESSE & BÉBÉ ---
      {
        name: 'getPregnancyInfo',
        description: "Récupère les informations complètes sur la grossesse actuelle : SA, trimestre, date du terme (DPA), poids et taille estimés du bébé.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'getBabyInfo',
        description: "Récupère les informations enregistrées sur le bébé (prénom, sexe, date des premiers mouvements foetaux).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateBabyInfo',
        description: "Met à jour le prénom, surnom, sexe du bébé ou la date des premiers mouvements.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            babyName: { type: Type.STRING, description: 'Prénom ou surnom du bébé' },
            babyGender: { type: Type.STRING, description: 'Sexe : "Fille", "Garçon", "Surprise" ou "Non précisé"' },
            firstKicksDate: { type: Type.STRING, description: 'Date des premiers mouvements ressentis (YYYY-MM-DD)' },
          },
        },
      },
      {
        name: 'getUserProfile',
        description: "Récupère le profil de la maman (nom, prénom, date d'accouchement, taille, poids initial).",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'updateProfile',
        description: "Met à jour les informations du profil de la maman (prénom, nom, date de terme DPA, taille, poids initial).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Prénom' },
            lastName: { type: Type.STRING, description: 'Nom de famille' },
            dueDate: { type: Type.STRING, description: 'Date présumée d\'accouchement (YYYY-MM-DD)' },
            heightCm: { type: Type.NUMBER, description: 'Taille en centimètres' },
            startingWeightKg: { type: Type.NUMBER, description: 'Poids avant grossesse en kg' },
          },
        },
      },

      // --- NOTIFICATIONS ---
      {
        name: 'getNotifications',
        description: "Récupère les alertes et notifications de santé programmées pour la maman.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },

      // --- NAVIGATION DANS L'APPLICATION ---
      {
        name: 'navigateToView',
        description:
          "Ouvre directement une rubrique ou un écran de l'application MAMAN+ pour l'utilisatrice (ex: 'calendar', 'symptoms', 'weight', 'appointments', 'baby', 'pregnancy', 'checklist', 'journal', 'reminders', 'resources', 'profile', 'settings', 'dashboard').",
        parameters: {
          type: Type.OBJECT,
          properties: {
            view: {
              type: Type.STRING,
              description:
                "Identifiant de la rubrique : 'dashboard', 'pregnancy', 'baby', 'calendar', 'appointments', 'symptoms', 'weight', 'exams', 'journal', 'checklist', 'reminders', 'notifications', 'resources', 'profile', 'settings'",
            },
            reason: { type: Type.STRING, description: "Brève explication de la navigation (facultatif)" },
          },
          required: ['view'],
        },
      },
    ],
  },
];

export async function handleChatRequest(req: any, res: any) {
  let conversationId: string | undefined;
  try {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    console.log(`[Server] POST /api/chat received. GEMINI_API_KEY present: ${hasKey}`);

    let parsedBody = req.body;
    if (typeof parsedBody === 'string') {
      try {
        parsedBody = JSON.parse(parsedBody);
      } catch (e) {
        parsedBody = {};
      }
    }
    const { message, messages, conversationId: convId, uid, userContext } = parsedBody || {};
    conversationId = convId;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Server] /api/chat error: GEMINI_API_KEY missing in server environment.');
      return res.status(503).json({
        success: false,
        error: "GEMINI_API_KEY absente",
        diagnostic: "La variable d'environnement GEMINI_API_KEY est manquante côté serveur.",
        code: 'API_KEY_MISSING',
        httpStatus: 503,
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
        diagnostic: 'Requête invalide : le contenu du message est vide ou manquant.',
        code: 'INVALID_REQUEST',
        httpStatus: 400,
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
3. Exception d'urgence médicale : Si l'utilisatrice décrit une urgence vitale ou obstétricale (saignements anormaux, douleurs intenses, contractions précoces, fièvre élevée > 38°C, baisse brutale des mouvements de bébé, perte des eaux), rappelle-lui qu'en tant qu'assistant de l'application tu ne peux pas délivrer de diagnostic médical et indique-lui d'appeler immédiatement la maternité, le SAMU (15) ou les urgences (112).

CONNAISSANCE EXHAUSTIVE ET FIABLE DE L'APPLICATION MAMAN+ :
Donne des réponses claires, précises et fiables concernant UNIQUEMENT MAMAN+ et ses fonctionnalités :
1. Tableau de bord (Route : /) : synthèse de la grossesse, compte à rebours, radar biométrique, rendez-vous du jour.
2. Ma Grossesse (Route : /ma-grossesse) : suivi semaine par semaine (1 à 41 SA), taille du bébé comparée à un fruit.
3. Bébé (Route : /bebe) : prénom, sexe, journal des mouvements foetaux.
4. Calendrier & Rendez-vous (Routes : /calendrier et /rendez-vous) : calendrier interactif et liste chronologique.
5. Rappels (Route : /rappels) : vitamines, fer, hydratation, exercices.
6. Suivi du Poids & IMC (Route : /suivi-poids) : courbe de poids personnalisée par trimestre.
7. Symptômes (Route : /symptomes) : nausées, reflux, fatigue, intensité.
8. Examens recommandés (Route : /examens) : calendrier des bilans et échographies.
9. Journal intime (Route : /journal) : souvenirs, anecdotes et pensées.
10. Checklist & Valise (Route : /checklist) : valise maman, bébé, salle de naissance, démarches.
11. Conseils & Ressources (Route : /conseils-ressources) : fiches de santé officielles.
12. Mon Profil (Route : /profil) : DPA, DDR, taille, poids initial.
13. Paramètres (Route : /parametres) : export des données, déconnexion.

DIRECTIVES D'ACTIONNABILITÉ :
Tu peux naviguer, consulter et enregistrer des données pour l'utilisatrice :
- navigateToView
- getReminders, createReminder, updateReminder, deleteReminder
- getAppointments, createAppointment, updateAppointment, deleteAppointment
- getSymptoms, addSymptom, deleteSymptom
- getWeights, addWeight, deleteWeight
- getJournalEntries, addJournalEntry, deleteJournalEntry
- getChecklist, createChecklistItem, updateChecklistItem, deleteChecklistItem
- getPregnancyInfo, getBabyInfo, updateBabyInfo, getUserProfile, updateProfile
- getExams, addExam, deleteExam

Toute suppression exige confirmation explicite préalable (confirmed: true).
La date du jour est le ${userContext?.today || new Date().toISOString().split('T')[0]}.`;

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
        systemInstruction += `\n- Données actuelles enregistrées :\n${userContext.existingSummary}`;
    }

    const lastUserMsg = cleanMessages[cleanMessages.length - 1];
    const previousMessages = cleanMessages.slice(0, cleanMessages.length - 1);

    const history = previousMessages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    while (history.length > 0 && history[0].role !== 'user') {
      history.shift();
    }

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
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

        const sendPromise = chat.sendMessage({
          message: lastUserMsg.content,
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT: Gemini request timed out after 22s')), 22000)
        );

        let currentResponse = await Promise.race([sendPromise, timeoutPromise]);
        let loopCount = 0;
        const maxTurns = 5;

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
        console.warn(`Model ${modelName} call attempt failed:`, err?.status || '', err?.message?.slice(0, 120));
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
    const errStatus = Number(err?.status || err?.statusCode || 0);

    let httpStatus = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let diagnostic = 'Erreur interne du serveur lors du traitement de la requête.';
    let userFriendlyError = 'Une difficulté temporaire est survenue lors de l’échange avec l’assistant.';

    if (errStatus === 401 || errMsg.includes('401') || errMsg.includes('UNAUTHENTICATED') || errMsg.includes('API_KEY_INVALID')) {
      httpStatus = 401;
      code = 'UNAUTHENTICATED';
      diagnostic = 'Authentification Gemini échouée : clé API non valide ou non autorisée.';
      userFriendlyError = 'Authentification API non valide. Veuillez vérifier la clé API Gemini configurée.';
    } else if (errStatus === 403 || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
      httpStatus = 403;
      code = 'PERMISSION_DENIED';
      diagnostic = 'Accès refusé par l’API Google Gemini : permissions insuffisantes ou modèle non activé.';
      userFriendlyError = 'Accès refusé au modèle Gemini. Vérifiez les permissions de votre compte.';
    } else if (errStatus === 404 || errMsg.includes('404') || errMsg.includes('NOT_FOUND')) {
      httpStatus = 404;
      code = 'MODEL_NOT_FOUND';
      diagnostic = 'Le modèle Gemini demandé est introuvable ou indisponible.';
      userFriendlyError = 'Le modèle d’intelligence artificielle demandé n’est pas disponible.';
    } else if (errStatus === 408 || errStatus === 504 || errMsg.includes('TIMEOUT') || errMsg.includes('timed out')) {
      httpStatus = 504;
      code = 'TIMEOUT';
      diagnostic = 'Délai d’attente dépassé (timeout) lors de la communication avec Google Gemini.';
      userFriendlyError = 'Le service d’assistance a mis trop de temps à répondre. Veuillez réessayer.';
    } else if (errStatus === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      httpStatus = 429;
      code = 'RATE_LIMIT_EXCEEDED';
      diagnostic = 'Quota Google Gemini dépassé ou limitation de fréquence (Rate Limit).';
      userFriendlyError = 'Le service d’assistance est temporairement saturé (quota dépassé). Veuillez patienter quelques instants.';
    } else if (errStatus === 502 || errStatus === 503 || errMsg.includes('502') || errMsg.includes('503') || errMsg.includes('UNAVAILABLE')) {
      httpStatus = 503;
      code = 'SERVICE_UNAVAILABLE';
      diagnostic = 'Le service Google Gemini est temporairement indisponible.';
      userFriendlyError = 'Le service Google Gemini est temporairement indisponible. Veuillez réessayer dans quelques instants.';
    }

    // Strip any sensitive strings like raw keys if they appear in error
    const sanitizedErrorMsg = errMsg
      .replace(/[A-Za-z0-9_-]{30,}/g, '[REDACTED]')
      .slice(0, 300);

    return res.status(httpStatus).json({
      success: false,
      error: userFriendlyError,
      diagnostic,
      code,
      httpStatus,
      rawError: sanitizedErrorMsg,
      conversationId,
    });
  }
}
