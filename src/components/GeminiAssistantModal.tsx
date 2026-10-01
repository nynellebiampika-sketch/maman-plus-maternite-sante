import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Trash2,
  Copy,
  Check,
  Calendar,
  Bell,
  Scale,
  CheckSquare,
  BookOpen,
  Plus,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Maximize2,
  Minimize2,
  X,
  MoreHorizontal,
  Edit2,
  Square,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  Activity,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { BrandEmblem } from './BrandLogo';
import {
  getAiConversationsFromFirestore,
  saveAiConversationToFirestore,
  deleteAiConversationFromFirestore,
  renameAiConversationInFirestore,
} from '../services/firestoreService';
import { AiChatMessage, AiConversation } from '../types';

export interface GeminiAssistantModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const INITIAL_WELCOME_MESSAGE: AiChatMessage = {
  id: 'welcome-app-guide',
  role: 'assistant',
  content: `Bonjour ! Je suis votre **Assistant MAMAN+**, propulsé par **Google Gemini 2.5 Flash-Lite**. 🌸

Mon rôle est **strictement centré sur le fonctionnement, les fonctionnalités et l'utilisation de votre application MAMAN+** :
- 💡 **Explication des outils** : comment utiliser chaque écran (*Tableau de bord, Agenda, Rappels, Suivi du poids & IMC, Journal, Checklist, Examens, Profil...*)
- 📅 **Gestion de vos rendez-vous** : *« Ajoute mon rendez-vous sage-femme demain à 10h »*
- ⏰ **Configuration de vos rappels** : *« Rappelle-moi de prendre mes vitamines tous les matins à 8h »*
- ⚖️ **Enregistrement de votre poids** : *« Enregistre mon poids : 64.5 kg »*
- 📝 **Ajout à votre journal intime** : *« Ajoute une note : Bébé a bougé pour la première fois ! »*
- ✅ **Gestion de votre checklist** : *« Ajoute les bodies 1 mois à ma valise maternité »*

*Note : Conformément à ma mission, je réponds exclusivement aux questions relatives à l'application MAMAN+ et à son utilisation afin de vous garantir des réponses précises et fiables.*

Comment puis-je vous accompagner dans votre application aujourd'hui ?`,
  timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_PROMPTS = [
  {
    title: 'Rendez-vous médical',
    prompt: 'Ajoute mon rendez-vous sage-femme demain à 10h',
    icon: Calendar,
  },
  {
    title: 'Rappel quotidien',
    prompt: 'Rappelle-moi de prendre mes vitamines tous les matins à 8h',
    icon: Bell,
  },
  {
    title: 'Suivi du poids',
    prompt: 'Comment fonctionne le suivi du poids et de l’IMC dans MAMAN+ ?',
    icon: Scale,
  },
  {
    title: 'Valise maternité',
    prompt: 'Ajoute les indispensables recommandés à ma valise maternité',
    icon: CheckSquare,
  },
];

function formatSessionDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return "Aujourd'hui";
  }
  if (diffDays <= 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
    return 'Hier';
  }
  if (diffDays < 7) {
    return `Il y a ${diffDays} j`;
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function generateCleanTitle(prompt: string): string {
  if (!prompt || !prompt.trim()) return 'Nouvelle conversation';

  const clean = prompt
    .replace(/^([«"']\s*)+/, '')
    .replace(/(\s*[»"'])+$/, '')
    .trim();

  const lower = clean.toLowerCase();

  // 1. Precise domain pattern matching for maternal care & MAMAN+ tools
  if (lower.includes('rendez-vous') || lower.includes('rdv')) {
    if (lower.includes('sage-femme')) return 'Rendez-vous sage-femme';
    if (lower.includes('échographie') || lower.includes('echo')) return 'Échographie de suivi';
    if (lower.includes('gynécologue') || lower.includes('gyneco')) return 'Rendez-vous gynécologue';
    if (lower.includes('pédiatre')) return 'Rendez-vous pédiatre';
    if (lower.includes('anesthésiste') || lower.includes('anesthesie')) return 'Consultation anesthésie';
    return 'Rendez-vous médical';
  }

  if (lower.includes('rappel') || lower.includes('rappelle-moi') || lower.includes('rappeler')) {
    if (lower.includes('vitamine') || lower.includes('acide folique') || lower.includes('fer')) {
      return 'Rappel prise vitamines';
    }
    if (lower.includes('médicament') || lower.includes('traitement')) return 'Rappel traitement médical';
    if (lower.includes('eau') || lower.includes('hydrat')) return 'Rappel hydratation';
    return 'Rappel quotidien';
  }

  if (lower.includes('poids') || lower.includes('kg') || lower.includes('pesée') || lower.includes('imc')) {
    return 'Suivi du poids & IMC';
  }

  if (lower.includes('valise') || lower.includes('maternité')) {
    return 'Valise de maternité';
  }

  if (
    lower.includes('symptôme') ||
    lower.includes('nausée') ||
    lower.includes('fatigue') ||
    lower.includes('douleur') ||
    lower.includes('contraction')
  ) {
    return 'Suivi des symptômes';
  }

  if (lower.includes('journal') || lower.includes('note') || lower.includes('bébé a bougé')) {
    return 'Note pour le journal';
  }

  if (lower.includes('checklist') || lower.includes('liste')) {
    return 'Gestion de la checklist';
  }

  if (
    lower.includes('examen') ||
    lower.includes('prise de sang') ||
    lower.includes('analyse') ||
    lower.includes('glycémie')
  ) {
    return 'Examens médicaux';
  }

  if (lower.includes('bébé') || lower.includes('taille') || lower.includes('mouvement')) {
    return 'Développement de bébé';
  }

  if (
    lower.includes('semaine') ||
    lower.includes('terme') ||
    lower.includes('dpa') ||
    lower.includes('grossesse')
  ) {
    return 'Suivi de la grossesse';
  }

  // 2. Intelligent fallback with courteous prefix removal
  const firstSentence = clean.split(/[\n.?!]/)[0].trim();
  const stripped = firstSentence
    .replace(
      /^(bonjour|bonsoir|salut|coucou|dis-moi|peux-tu|peux tu|est-ce que tu peux|est-ce que|s'il te plaît|s'il vous plaît|stp|svp|merci de|ajoute|enregistre|crée)\s*,?\s*/i,
      ''
    )
    .trim();

  const candidate = stripped || firstSentence;
  if (candidate.length <= 32) {
    return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }

  const words = candidate.split(/\s+/);
  let result = '';
  for (const w of words) {
    if ((result + ' ' + w).trim().length > 28) break;
    result = (result + ' ' + w).trim();
  }

  const finalTitle = (result || candidate.slice(0, 26)).trim() + '...';
  return finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);
}

export function GeminiAssistantModal({
  isOpen: controlledIsOpen,
  onClose,
  onOpen,
}: GeminiAssistantModalProps = {}) {
  const { currentUser } = useAuth();
  const {
    pregnancyProfile,
    babyInfo,
    appointments,
    reminders,
    checklist,
    weightEntries,
    symptomLogs,
    exams,
    journalEntries,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addReminder,
    updateReminder,
    deleteReminder,
    addWeightEntry,
    deleteWeightEntry,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addExam,
    deleteExam,
    addSymptomLog,
    deleteSymptomLog,
    updateBabyInfo,
    refreshData,
  } = useUserData();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  // Active user UID
  const currentUid = currentUser?.id || currentUser?.uid || '';

  // Firestore-synced conversations state
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Chat interaction state
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Action menus state: "⋯" dropdown, rename modal, delete confirm modal
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [conversationToDelete, setConversationToDelete] = useState<AiConversation | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle open/close
  const handleSetOpen = (open: boolean) => {
    setInternalIsOpen(open);
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Custom open event listener
  useEffect(() => {
    const handleCustomOpen = () => {
      handleSetOpen(true);
    };
    window.addEventListener('open-maman-assistant', handleCustomOpen);
    return () => window.removeEventListener('open-maman-assistant', handleCustomOpen);
  }, []);

  // -------------------------------------------------------------
  // Load conversations from Firestore on startup
  // -------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    async function loadConversations() {
      if (!currentUid) {
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        const firestoreList = await getAiConversationsFromFirestore(currentUid);
        if (isCancelled) return;

        if (firestoreList && firestoreList.length > 0) {
          setConversations(firestoreList);
          setActiveConversationId(firestoreList[0].id);
        } else {
          // Initialize first conversation cleanly without saving until the user writes their first message
          const initialConv: AiConversation = {
            id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: currentUid,
            title: 'Nouvelle conversation',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setConversations([initialConv]);
          setActiveConversationId(initialConv.id);
        }
      } catch (err) {
        console.warn('Error loading conversations from Firestore:', err);
        // Fallback local initial state
        const fallbackConv: AiConversation = {
          id: `conv_${Date.now()}`,
          userId: currentUid,
          title: 'Nouvelle conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setConversations([fallbackConv]);
        setActiveConversationId(fallbackConv.id);
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    }

    loadConversations();

    return () => {
      isCancelled = true;
    };
  }, [currentUid]);

  // Active conversation object
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0] || {
      id: 'default',
      userId: currentUid,
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

  const messages = activeConversation.messages || [];

  // Auto-scroll on new message or typing
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus textarea when modal opens or active conversation changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeConversationId]);

  // -------------------------------------------------------------
  // Create New Conversation (Fluid, ChatGPT-like)
  // -------------------------------------------------------------
  const handleNewConversation = () => {
    if (!currentUid) return;

    // Immediately create a new independent empty conversation
    const newConv: AiConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUid,
      title: 'Nouvelle conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    // Prepend to conversations list: previous conversations are kept intact in "Conversations récentes"
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setInputMessage('');
    setMobileHistoryOpen(false);
    setMenuOpenId(null);

    // Auto-focus the input textarea immediately
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // -------------------------------------------------------------
  // Delete Conversation
  // -------------------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!conversationToDelete || !currentUid) return;
    const targetId = conversationToDelete.id;

    // Immediately remove from UI
    const updated = conversations.filter((c) => c.id !== targetId);
    setConversations(updated);
    setConversationToDelete(null);
    setMenuOpenId(null);

    // If active was deleted, switch to another or create a clean one
    if (activeConversationId === targetId) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        const fresh: AiConversation = {
          id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: currentUid,
          title: 'Nouvelle conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setConversations([fresh]);
        setActiveConversationId(fresh.id);
      }
    }

    // Persist real deletion in Firestore
    try {
      await deleteAiConversationFromFirestore(currentUid, targetId);
    } catch (err) {
      console.error('Error deleting conversation from Firestore:', err);
    }
  };

  // -------------------------------------------------------------
  // Rename Conversation
  // -------------------------------------------------------------
  const startRenaming = (session: AiConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(session.id);
    setEditingTitleText(session.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = async (sessionId: string) => {
    const trimmed = editingTitleText.trim() || 'Conversation';
    setConversations((prev) =>
      prev.map((c) => (c.id === sessionId ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    );
    setEditingTitleId(null);

    if (currentUid) {
      try {
        await renameAiConversationInFirestore(currentUid, sessionId, trimmed);
      } catch (err) {
        console.warn('Error renaming conversation in Firestore:', err);
      }
    }
  };

  // -------------------------------------------------------------
  // Stop Generation
  // -------------------------------------------------------------
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // -------------------------------------------------------------
  // Copy message text
  // -------------------------------------------------------------
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // Send Message & Real-time streaming/Gemini API call with Auto-Retry
  // -------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string, isRetry = false) => {
    let content = (textToSend || inputMessage).trim();
    if (isLoading) return;

    if (!currentUid) {
      const authNoticeMsg: AiChatMessage = {
        id: `msg_${Date.now()}_auth`,
        role: 'assistant',
        content:
          "Pour dialoguer avec l'Assistant MAMAN+ et synchroniser vos données en toute sécurité, veuillez vous connecter à votre compte.",
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isError: true,
        errorCode: 'AUTH_REQUIRED',
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messages: [...c.messages, authNoticeMsg] }
            : c
        )
      );
      return;
    }

    let targetMessages: AiChatMessage[] = [];
    let updatedActiveSession: AiConversation;

    if (isRetry) {
      // Clean previous error messages from the current conversation
      const nonErrorMessages = messages.filter((m) => !m.isError);
      const lastUser = [...nonErrorMessages].reverse().find((m) => m.role === 'user');
      if (!lastUser) return;
      content = lastUser.content;
      targetMessages = nonErrorMessages;
      updatedActiveSession = {
        ...activeConversation,
        updatedAt: Date.now(),
        messages: targetMessages,
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === updatedActiveSession.id ? updatedActiveSession : c))
      );
    } else {
      if (!content) return;
      const userMsg: AiChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      targetMessages = [...messages.filter((m) => !m.isError), userMsg];

      // Compute title on first user message
      const isFirstUserMessage = messages.filter((m) => m.role === 'user').length === 0;
      const sessionTitle =
        isFirstUserMessage || activeConversation.title === 'Nouvelle conversation'
          ? generateCleanTitle(content)
          : activeConversation.title;

      updatedActiveSession = {
        ...activeConversation,
        title: sessionTitle,
        updatedAt: Date.now(),
        messages: targetMessages,
      };

      // Update state immediately: prioritize active conversation at top of history
      setConversations((prev) => {
        const rest = prev.filter((c) => c.id !== updatedActiveSession.id);
        return [updatedActiveSession, ...rest];
      });
      setActiveConversationId(updatedActiveSession.id);

      // Persist conversation and first message automatically to Firestore
      saveAiConversationToFirestore(currentUid, updatedActiveSession).catch(console.warn);
      setInputMessage('');
    }

    setIsLoading(true);
    setRetryCount(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build authorized user context summary
      const summaryParts: string[] = [];
      if (appointments && appointments.length > 0) {
        summaryParts.push(
          'Rendez-vous programmés :\n' +
            appointments
              .slice(0, 8)
              .map(
                (a) =>
                  `- [id: ${a.id}] ${a.title} le ${a.date} à ${a.time} (${a.practitioner || 'Praticien non spécifié'}, lieu: ${a.location || 'Cabinet'})`
              )
              .join('\n')
        );
      }
      if (reminders && reminders.length > 0) {
        summaryParts.push(
          'Rappels configurés :\n' +
            reminders
              .slice(0, 8)
              .map(
                (r) =>
                  `- [id: ${r.id}] ${r.title} à ${r.time} (${r.frequency}, ${r.isActive ? 'actif' : 'désactivé'})`
              )
              .join('\n')
        );
      }
      if (checklist && checklist.length > 0) {
        summaryParts.push(
          'Checklist :\n' +
            checklist
              .slice(0, 10)
              .map(
                (c) =>
                  `- [id: ${c.id}] ${c.title} (${c.category}, ${c.completed ? 'FAIT ✓' : 'À faire'})`
              )
              .join('\n')
        );
      }
      if (weightEntries && weightEntries.length > 0) {
        summaryParts.push(
          `Dernier poids enregistré : ${weightEntries[0].weightKg} kg (le ${weightEntries[0].date})`
        );
      }
      if (symptomLogs && symptomLogs.length > 0) {
        summaryParts.push(
          'Derniers symptômes enregistrés :\n' +
            symptomLogs
              .slice(0, 5)
              .map(
                (s) =>
                  `- [id: ${s.id}] ${s.symptomName} (intensité: ${s.intensity}${s.note ? ', note: ' + s.note : ''})`
              )
              .join('\n')
        );
      }
      if (exams && exams.length > 0) {
        summaryParts.push(
          'Examens médicaux :\n' +
            exams
              .slice(0, 5)
              .map(
                (e) =>
                  `- [id: ${e.id}] ${e.title} (${e.date}, statut: ${e.status || 'À venir'})`
              )
              .join('\n')
        );
      }
      if (journalEntries && journalEntries.length > 0) {
        summaryParts.push(
          'Dernières notes du journal :\n' +
            journalEntries
              .slice(0, 3)
              .map(
                (j) =>
                  `- [id: ${j.id}] ${j.title} (${j.date}) : ${j.content.slice(0, 60)}...`
              )
              .join('\n')
        );
      }
      if (babyInfo?.nickname) {
        summaryParts.push(
          `Bébé : ${babyInfo.nickname} (${babyInfo.gender || 'sexe non précisé'})`
        );
      }

      const userContext = {
        userId: currentUid,
        name:
          currentUser?.firstName ||
          currentUser?.displayName ||
          pregnancyProfile?.motherName ||
          undefined,
        pregnancyWeek: pregnancyProfile?.currentWeek || undefined,
        dueDate: currentUser?.dueDate || pregnancyProfile?.dueDate || undefined,
        babyName: babyInfo?.nickname || undefined,
        today: new Date().toISOString().split('T')[0],
        existingSummary: summaryParts.length > 0 ? summaryParts.join('\n\n') : undefined,
      };

      const apiMessages = targetMessages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      let responseData: any = null;
      let lastFetchError: any = null;
      const maxRetries = 2;

      // Intelligent Auto-Retry Loop (up to 2 automatic retries for transient errors)
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (abortController.signal.aborted) break;

        try {
          if (attempt > 0) {
            setRetryCount(attempt);
            // Exponential backoff
            await new Promise((r) => setTimeout(r, attempt * 1200));
            if (abortController.signal.aborted) break;
          }

          console.log(`[Assistant IA] Envoi requête POST /api/chat (tentative ${attempt + 1}/${maxRetries + 1})`);
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortController.signal,
            body: JSON.stringify({
              message: content,
              conversationId: updatedActiveSession.id,
              uid: currentUid,
              messages: apiMessages,
              userContext,
            }),
          });

          let data: any = null;
          try {
            data = await response.json();
          } catch (jsonErr) {
            const rawText = await response.text().catch(() => '');
            data = {
              success: false,
              httpStatus: response.status,
              error: `Erreur HTTP ${response.status} reçue du serveur.`,
              diagnostic: response.status === 404
                ? "L'endpoint /api/chat est introuvable sur ce serveur (404 Not Found)."
                : `Le serveur a retourné un statut ${response.status} : ${rawText.slice(0, 150)}`,
              code: response.status === 404 ? 'NOT_FOUND' : `HTTP_${response.status}`,
            };
          }

          if (!response.ok) {
            console.error(`[Assistant IA] Erreur HTTP ${response.status} sur /api/chat:`, data);
            if (!data.httpStatus) data.httpStatus = response.status;
            if (!data.code) {
              if (response.status === 401) data.code = 'UNAUTHENTICATED';
              else if (response.status === 403) data.code = 'PERMISSION_DENIED';
              else if (response.status === 404) data.code = 'NOT_FOUND';
              else if (response.status === 405) data.code = 'METHOD_NOT_ALLOWED';
              else if (response.status === 429) data.code = 'RATE_LIMIT_EXCEEDED';
              else if (response.status === 503 || response.status === 502) data.code = 'SERVICE_UNAVAILABLE';
              else if (response.status === 504 || response.status === 408) data.code = 'TIMEOUT';
              else data.code = `HTTP_${response.status}`;
            }
          }

          // Determine if error is transient and retryable
          const isTransient =
            !data.success &&
            (response.status === 429 ||
              response.status === 503 ||
              response.status === 504 ||
              data.code === 'TIMEOUT' ||
              data.code === 'RATE_LIMIT_EXCEEDED' ||
              data.code === 'SERVICE_UNAVAILABLE');

          if (isTransient && attempt < maxRetries) {
            console.warn(`[Assistant IA] Tentative automatique ${attempt + 1}/${maxRetries} (${data.code})`);
            continue;
          }

          responseData = data;
          break;
        } catch (fetchErr: any) {
          if (fetchErr.name === 'AbortError') {
            throw fetchErr;
          }
          console.error('[Assistant IA] Erreur réseau lors de l’appel à /api/chat:', fetchErr);
          lastFetchError = fetchErr;
          if (attempt < maxRetries) {
            console.warn(`[Assistant IA] Échec réseau tentative ${attempt + 1}/${maxRetries}`);
            continue;
          }
        }
      }

      setRetryCount(0);

      if (responseData && responseData.success && responseData.message) {
        if (responseData.executedAction && responseData.executedAction.success) {
          const act = responseData.executedAction;
          try {
            if (act.actionType === 'addAppointment' && act.item) {
              await addAppointment(act.item);
            } else if (act.actionType === 'updateAppointment' && act.item) {
              await updateAppointment(act.item.id, act.item);
            } else if (act.actionType === 'deleteAppointment' && act.item) {
              await deleteAppointment(act.item.id || act.item.appointmentId);
            } else if (act.actionType === 'addReminder' && act.item) {
              await addReminder(act.item);
            } else if (act.actionType === 'updateReminder' && act.item) {
              await updateReminder(act.item.id, act.item);
            } else if (act.actionType === 'deleteReminder' && act.item) {
              await deleteReminder(act.item.id || act.item.reminderId);
            } else if ((act.actionType === 'addWeightEntry' || act.actionType === 'addWeight') && act.item) {
              await addWeightEntry({
                date: act.item.date,
                weightKg: Number(act.item.weightKg),
                note: act.item.note,
              });
            } else if (act.actionType === 'deleteWeight' && act.item) {
              await deleteWeightEntry(act.item.id || act.item.weightId || act.item.entryId);
            } else if ((act.actionType === 'addChecklistItem' || act.actionType === 'createChecklistItem') && act.item) {
              await addChecklistItem({
                title: act.item.title,
                category: act.item.category || 'Maman',
                dueDate: act.item.dueDate,
              });
            } else if (act.actionType === 'updateChecklistItem' && act.item) {
              await updateChecklistItem(act.item.id, act.item);
            } else if (act.actionType === 'deleteChecklistItem' && act.item) {
              await deleteChecklistItem(act.item.id || act.item.itemId);
            } else if (act.actionType === 'addJournalEntry' && act.item) {
              await addJournalEntry(act.item);
            } else if (act.actionType === 'updateJournalEntry' && act.item) {
              await updateJournalEntry(act.item.id, act.item);
            } else if (act.actionType === 'deleteJournalEntry' && act.item) {
              await deleteJournalEntry(act.item.id || act.item.entryId);
            } else if (act.actionType === 'addExam' && act.item) {
              await addExam(act.item);
            } else if (act.actionType === 'deleteExam' && act.item) {
              await deleteExam(act.item.id || act.item.examId);
            } else if (act.actionType === 'addSymptom' && act.item) {
              await addSymptomLog({
                symptomId: act.item.symptomId || `sym_${Date.now()}`,
                symptomName: act.item.symptomName || 'Symptôme',
                intensity: act.item.intensity || 'Modéré',
                intensityVal: act.item.intensityVal || 2,
                stateLabel: act.item.stateLabel || act.item.intensity || 'Modéré',
                note: act.item.note || '',
              });
            } else if (act.actionType === 'deleteSymptom' && act.item) {
              await deleteSymptomLog(act.item.id || act.item.symptomId || act.item.logId);
            } else if (act.actionType === 'updateBabyInfo' && act.item) {
              await updateBabyInfo(act.item);
            } else if (
              act.actionType === 'navigateToView' &&
              act.item?.path
            ) {
              window.dispatchEvent(
                new CustomEvent('maman-navigate', {
                  detail: { path: act.item.path },
                })
              );
            }
          } catch (actErr) {
            console.error('[Assistant Action Client Execution Error]', actErr);
          }

          try {
            refreshData();
          } catch (refreshErr) {
            console.warn('refreshData error:', refreshErr);
          }
        }

        const assistantMsg: AiChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: responseData.message,
          timestamp: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          executedAction: responseData.executedAction,
        };

        const finalSession: AiConversation = {
          ...updatedActiveSession,
          updatedAt: Date.now(),
          messages: [...targetMessages, assistantMsg],
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === updatedActiveSession.id ? finalSession : c))
        );

        saveAiConversationToFirestore(currentUid, finalSession).catch(console.warn);
      } else {
        const errorContent = responseData?.error ||
          (lastFetchError
            ? `Impossible de joindre l'endpoint /api/chat : ${lastFetchError?.message || 'Connexion réseau ou serveur inaccessible'}.`
            : "Une difficulté est survenue lors de la communication avec l'assistant.");

        const errorMsg: AiChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: errorContent,
          timestamp: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isError: true,
          errorCode: responseData?.code || (lastFetchError ? 'FAILED_TO_FETCH' : 'SERVER_ERROR'),
          errorDiagnostic: responseData?.diagnostic || (lastFetchError ? "Problème d'accès à l'endpoint /api/chat (Failed to fetch)." : undefined),
          httpStatus: responseData?.httpStatus,
          rawError: responseData?.rawError,
        };

        const sessionWithError: AiConversation = {
          ...updatedActiveSession,
          updatedAt: Date.now(),
          messages: [...targetMessages, errorMsg],
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === updatedActiveSession.id ? sessionWithError : c))
        );
        // Note: Failed error states are deliberately NOT persisted to Firestore to protect history
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily stopped generation
        const stoppedMsg: AiChatMessage = {
          id: `msg_${Date.now()}_stopped`,
          role: 'assistant',
          content: '*(Génération interrompue par l’utilisatrice)*',
          timestamp: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        const sessionStopped: AiConversation = {
          ...updatedActiveSession,
          updatedAt: Date.now(),
          messages: [...targetMessages, stoppedMsg],
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === updatedActiveSession.id ? sessionStopped : c))
        );
        saveAiConversationToFirestore(currentUid, sessionStopped).catch(console.warn);
      } else {
        console.error('Chat error:', err);
        const networkErrorMsg: AiChatMessage = {
          id: `msg_${Date.now()}_net_error`,
          role: 'assistant',
          content: `Échec de communication avec l'endpoint /api/chat (${err?.message || 'Erreur réseau'}). Vos données restent préservées.`,
          timestamp: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isError: true,
          errorCode: 'FAILED_TO_FETCH',
          errorDiagnostic: "L'application n'a pas pu joindre le serveur API (/api/chat).",
        };

        const sessionWithNetErr: AiConversation = {
          ...updatedActiveSession,
          updatedAt: Date.now(),
          messages: [...targetMessages, networkErrorMsg],
        };

        setConversations((prev) =>
          prev.map((c) => (c.id === updatedActiveSession.id ? sessionWithNetErr : c))
        );
      }
    } finally {
      setIsLoading(false);
      setRetryCount(0);
      abortControllerRef.current = null;
    }
  };

  // -------------------------------------------------------------
  // Manual Retry for a specific failed message
  // -------------------------------------------------------------
  const handleRetryMessage = (errorMsgId: string) => {
    if (isLoading) return;
    handleSendMessage(undefined, true);
  };

  // Helper to render action icons
  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'addAppointment':
      case 'updateAppointment':
      case 'deleteAppointment':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'addReminder':
      case 'updateReminder':
      case 'deleteReminder':
        return <Bell className="w-4 h-4 text-emerald-600" />;
      case 'addWeight':
        return <Scale className="w-4 h-4 text-emerald-600" />;
      case 'addJournalEntry':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'addChecklistItem':
      case 'updateChecklistItem':
      case 'deleteChecklistItem':
        return <CheckSquare className="w-4 h-4 text-emerald-600" />;
      case 'addExam':
      case 'deleteExam':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'navigateToView':
        return <ChevronRight className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-emerald-600" />;
    }
  };

  // Formatted markdown text renderer
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-[13.5px] sm:text-[14px]">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
          const lineContent = isBullet ? line.trim().substring(2) : line;

          const parts = lineContent.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-[#1E1B18]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-[#4A443F]">
                  {part.slice(1, -1)}
                </em>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code
                  key={pIdx}
                  className="px-1.5 py-0.5 rounded bg-black/5 text-[#9E2A2B] font-mono text-xs"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B] mt-2 shrink-0" />
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedLine}</p>;
        })}
      </div>
    );
  };

  const isEmptyConversation = messages.length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-3 md:p-5 lg:p-6 animate-in fade-in duration-200">
      <div
        id="gemini-assistant-window"
        className={`bg-[#FAF8F5] flex flex-row overflow-hidden transition-all duration-300 shadow-2xl border border-[#E8E2D9] ${
          isFullscreen
            ? 'fixed inset-0 w-screen h-screen rounded-none'
            : 'w-full h-full sm:max-w-5xl md:max-w-6xl lg:max-w-7xl sm:h-[92vh] sm:max-h-[920px] rounded-none sm:rounded-3xl'
        }`}
      >
        {/* ========================================================= */}
        {/* 1. DEDICATED CONVERSATION SIDEBAR (ChatGPT-style)         */}
        {/* ========================================================= */}
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col shrink-0 bg-[#F4EFEB] border-r border-[#E5DFD6] transition-all duration-300 ease-in-out ${
            isHistoryOpen ? 'w-64 lg:w-72' : 'w-0 overflow-hidden border-r-0'
          }`}
        >
          {/* Top: New Conversation Button */}
          <div className="p-3 border-b border-[#E5DFD6]">
            <button
              type="button"
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-[13px] font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
              title="Nouvelle conversation"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2.5 py-1 text-[10.5px] font-semibold text-[#8C847D] uppercase tracking-wider">
              Conversations récentes
            </div>

            {isInitialLoading ? (
              <div className="p-4 text-center text-xs text-[#8C847D] space-y-2">
                <div className="w-5 h-5 border-2 border-[#9E2A2B]/20 border-t-[#9E2A2B] rounded-full animate-spin mx-auto" />
                <p>Chargement de l'historique...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8C847D]">
                Aucune conversation enregistrée.
              </div>
            ) : (
              conversations.map((session) => {
                const isActive = session.id === activeConversation.id;
                const isEditing = editingTitleId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (!isEditing) {
                        setActiveConversationId(session.id);
                        setMenuOpenId(null);
                      }
                    }}
                    className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[12.5px] cursor-pointer transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-[#2A2421] font-semibold shadow-2xs border border-[#E5DFD6]'
                        : 'text-[#5E5750] hover:bg-white/60 hover:text-[#2A2421]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#9E2A2B]' : 'text-[#8C847D]'
                        }`}
                      />

                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(session.id);
                              if (e.key === 'Escape') setEditingTitleId(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-0.5 text-xs bg-white border border-[#9E2A2B] rounded text-[#2A2421] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(session.id)}
                            className="p-1 hover:bg-emerald-50 text-emerald-600 rounded"
                            title="Enregistrer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(null)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                            title="Annuler"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col min-w-0 flex-1 leading-tight">
                          <span className="truncate">{session.title}</span>
                          <span className="text-[10px] text-[#9A938A] font-normal mt-0.5">
                            {formatSessionDate(session.updatedAt || session.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Menu « ⋯ » */}
                    {!isEditing && (
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === session.id ? null : session.id);
                          }}
                          className={`p-1 rounded-md transition-opacity ${
                            isActive || menuOpenId === session.id
                              ? 'opacity-100 text-[#7A736B] hover:bg-[#EAE4DC]'
                              : 'opacity-0 group-hover:opacity-100 text-[#8C847D] hover:bg-[#EAE4DC]'
                          }`}
                          title="Options de la conversation"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {menuOpenId === session.id && (
                          <div
                            ref={menuRef}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-[#E5DFD6] py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-[12px]"
                          >
                            <button
                              type="button"
                              onClick={(e) => startRenaming(session, e)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[#3E3834] hover:bg-[#FAF8F5] text-left"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#7A736B]" />
                              <span>Renommer</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConversationToDelete(session);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-left font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer: Authenticated sync status */}
          <div className="p-3 border-t border-[#E5DFD6] bg-[#EFE9E0]/50 flex items-center justify-between text-[11px] text-[#7A736B]">
            <span className="truncate">Historique Firestore sécurisé</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Synchronisé" />
          </div>
        </aside>

        {/* Mobile History Drawer Overlay */}
        {mobileHistoryOpen && (
          <div className="fixed inset-0 z-60 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileHistoryOpen(false)}
            />
            <div className="relative w-4/5 max-w-xs bg-[#F4EFEB] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="p-3.5 border-b border-[#E5DFD6] flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#2A2421]">Conversations</span>
                <button
                  type="button"
                  onClick={() => setMobileHistoryOpen(false)}
                  className="p-1 rounded-lg text-[#7A736B] hover:bg-[#EAE4DC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 border-b border-[#E5DFD6]">
                <button
                  type="button"
                  onClick={handleNewConversation}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#9E2A2B] text-white text-[13px] font-semibold shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle conversation</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveConversationId(session.id);
                      setMobileHistoryOpen(false);
                    }}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[13px] ${
                      session.id === activeConversation.id
                        ? 'bg-white text-[#2A2421] font-semibold border border-[#E5DFD6]'
                        : 'text-[#5E5750] hover:bg-white/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1 leading-tight">
                        <span className="truncate">{session.title}</span>
                        <span className="text-[10px] text-[#9A938A] mt-0.5">
                          {formatSessionDate(session.updatedAt || session.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationToDelete(session);
                        setMobileHistoryOpen(false);
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. MAIN DISCUSSION AREA                                   */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E8E2D9] bg-white/80 backdrop-blur-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Desktop sidebar toggle button */}
              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="hidden md:flex p-1.5 rounded-lg text-[#69625A] hover:text-[#1E1B18] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
                title={isHistoryOpen ? 'Masquer la barre latérale' : 'Afficher la barre latérale'}
              >
                {isHistoryOpen ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeft className="w-5 h-5" />
                )}
              </button>

              {/* Mobile history toggle */}
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(true)}
                className="flex md:hidden p-1.5 rounded-lg text-[#69625A] hover:bg-[#F2EFEB] transition-colors"
                title="Afficher les conversations"
              >
                <PanelLeft className="w-5 h-5" />
              </button>

              {/* Title & Brand */}
              <div className="flex items-center gap-2 min-w-0">
                <BrandEmblem size={28} />
                <div className="flex flex-col min-w-0">
                  <h2 className="font-serif font-bold text-[14.5px] text-[#2A2421] truncate leading-tight">
                    {activeConversation.title}
                  </h2>
                  <span className="text-[11px] text-[#7A736B] leading-none truncate">
                    Assistant IA MAMAN+
                  </span>
                </div>
              </div>
            </div>

            {/* Header controls: New Conversation, Fullscreen & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleNewConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F4] hover:bg-[#F3EBE6] text-[#9E2A2B] border border-[#E8DCD5] text-xs font-semibold transition-colors cursor-pointer mr-1 active:scale-98"
                title="Créer une nouvelle conversation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nouvelle conversation</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden sm:flex p-2 rounded-xl text-[#7A736B] hover:text-[#2A2421] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
                title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSetOpen(false)}
                className="p-2 rounded-xl text-[#7A736B] hover:text-[#2A2421] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
                title="Fermer l'assistant"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
            {isEmptyConversation ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-6 px-4 animate-in fade-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#9E2A2B] mb-3.5 shadow-2xs">
                  <BrandEmblem size={38} />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#2A2421] tracking-tight">
                  Comment puis-je vous accompagner aujourd'hui ?
                </h3>
                <p className="text-xs sm:text-sm text-[#7A736B] mt-2 max-w-md mx-auto leading-relaxed">
                  Je suis votre <strong>Assistant MAMAN+</strong>. Écrivez votre premier message ci-dessous ou choisissez une action rapide pour débuter.
                </p>

                {/* Suggested prompts grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 text-left w-full">
                  {SUGGESTED_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(item.prompt)}
                        className="p-3.5 rounded-2xl bg-white hover:bg-[#FAF6F4] border border-[#E8E2D9] hover:border-[#DAC5BC] text-[#3E3834] transition-all duration-200 text-left shadow-2xs group cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] mb-1">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.title}</span>
                        </div>
                        <p className="text-[12.5px] text-[#69625A] group-hover:text-[#2A2421] line-clamp-2">
                          « {item.prompt} »
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Feature tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-[11px] text-[#8C847D]">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9]">📅 Agenda & RDV</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9]">⏰ Rappels quotidiens</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9]">⚖️ Poids & IMC</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9]">📝 Journal intime</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9]">✅ Valise maternité</span>
                </div>
              </div>
            ) : (
              /* Conversation Messages */
              <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 ${
                      isAssistant ? 'items-start' : 'items-end justify-end'
                    }`}
                  >
                    {/* Assistant Avatar */}
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <BrandEmblem size={20} />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 sm:px-5 py-3 text-[13.5px] sm:text-[14px] leading-relaxed transition-all max-w-[92%] sm:max-w-[85%] ${
                        isAssistant
                          ? msg.isError
                            ? 'bg-rose-50 border border-rose-200 text-[#2A2421]'
                            : 'bg-white border border-[#E8E2D9] text-[#2A2421] shadow-2xs'
                          : 'bg-[#2A2421] text-white'
                      }`}
                    >
                      {isAssistant ? (
                        <div>
                          {renderFormattedText(msg.content)}

                          {/* Executed Action Confirmation Banner */}
                          {msg.executedAction?.success && (
                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2.5 text-xs text-emerald-950 shadow-2xs">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                                  {getActionIcon(msg.executedAction.actionType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold block text-[10.5px] uppercase tracking-wider text-emerald-700">
                                    {msg.executedAction.actionType === 'navigateToView'
                                      ? 'Navigation MAMAN+'
                                      : 'Action enregistrée dans MAMAN+'}
                                  </span>
                                  <span className="text-emerald-900 font-medium text-xs truncate block mt-0.5">
                                    {msg.executedAction.summary}
                                  </span>
                                </div>
                              </div>
                              {msg.executedAction.actionType === 'navigateToView' && msg.executedAction.item?.path && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    window.dispatchEvent(
                                      new CustomEvent('maman-navigate', {
                                        detail: { path: msg.executedAction?.item?.path },
                                      })
                                    );
                                  }}
                                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                                  title="Accéder directement à cette rubrique"
                                >
                                  <span>Ouvrir</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Diagnostic block if available */}
                          {msg.isError && msg.errorDiagnostic && (
                            <div className="mt-2 p-2 rounded-lg bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900 leading-relaxed font-sans">
                              <span className="font-semibold">Diagnostic :</span> {msg.errorDiagnostic}
                            </div>
                          )}

                          {/* Message Footer: retry button if error, or timestamp & copy */}
                          {msg.isError ? (
                            <div className="mt-3 pt-2.5 border-t border-rose-200 flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {msg.errorCode === 'API_KEY_MISSING'
                                    ? 'Clé GEMINI_API_KEY absente'
                                    : msg.errorCode === 'UNAUTHENTICATED'
                                    ? 'Authentification refusée (401)'
                                    : msg.errorCode === 'PERMISSION_DENIED'
                                    ? 'Accès refusé API (403)'
                                    : msg.errorCode === 'NOT_FOUND'
                                    ? 'Endpoint introuvable (404)'
                                    : msg.errorCode === 'METHOD_NOT_ALLOWED'
                                    ? 'Méthode non autorisée (405)'
                                    : msg.errorCode === 'RATE_LIMIT_EXCEEDED' || msg.errorCode === 'QUOTA_EXCEEDED'
                                    ? 'Quota dépassé (429)'
                                    : msg.errorCode === 'TIMEOUT'
                                    ? 'Délai d’attente dépassé (504)'
                                    : msg.errorCode === 'SERVICE_UNAVAILABLE'
                                    ? 'Service indisponible (503)'
                                    : msg.errorCode === 'FAILED_TO_FETCH' || msg.errorCode === 'NETWORK_ERROR'
                                    ? 'Connexion au serveur impossible'
                                    : msg.httpStatus
                                    ? `Erreur HTTP ${msg.httpStatus}`
                                    : 'Erreur de traitement'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRetryMessage(msg.id)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                                title="Relancer cette requête"
                              >
                                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                <span>Réessayer</span>
                              </button>
                            </div>
                          ) : (
                            <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-[#8C847D]">
                              <span>{msg.timestamp}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
                                title="Copier le texte"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600 font-medium">Copié</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copier</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className="mt-1 text-right text-[10px] text-white/70">
                            {msg.timestamp}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Real-time Loading typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E2D9] flex items-center justify-center shrink-0 shadow-2xs">
                    <BrandEmblem size={20} />
                  </div>
                  <div className="bg-white border border-[#E8E2D9] rounded-2xl px-4 py-3 text-xs text-[#69625A] flex items-center gap-2.5 shadow-2xs">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#9E2A2B] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-[#9E2A2B] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-[#9E2A2B] animate-bounce" />
                    </div>
                    <span className="font-medium text-[13px]">
                      {retryCount > 0 ? `Nouvelle tentative (${retryCount}/2)…` : "L'assistant réfléchit…"}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

          {/* Input Box Footer (ChatGPT-style) */}
          <div className="p-3 sm:p-4 border-t border-[#E8E2D9] bg-white/90 backdrop-blur-xs">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end bg-[#FAF8F5] border border-[#DED7CE] focus-within:border-[#9E2A2B] rounded-2xl p-2 shadow-2xs transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Posez votre question sur MAMAN+ ou demandez une action..."
                  className="flex-1 bg-transparent border-none text-[13.5px] sm:text-[14px] text-[#2A2421] placeholder-[#9A938A] resize-none focus:outline-none px-3 py-1.5 max-h-32 leading-relaxed"
                />

                {/* Send / Stop Button */}
                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="p-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white transition-all shrink-0 cursor-pointer shadow-2xs"
                    title="Arrêter la génération"
                    aria-label="Arrêter la génération"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className={`p-2 rounded-xl transition-all shrink-0 ${
                      inputMessage.trim()
                        ? 'bg-[#9E2A2B] text-white hover:bg-[#852324] cursor-pointer shadow-2xs'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }`}
                    title="Envoyer le message"
                    aria-label="Envoyer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-center mt-2 text-[11px] text-[#8C847D]">
                Assistant MAMAN+ • Réponses dédiées au fonctionnement de votre application
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CONFIRMATION MODAL BEFORE DELETION                      */}
      {/* ========================================================= */}
      {conversationToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-[#EAE4DC] shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#2A2421]">
                  Supprimer cette conversation ?
                </h4>
                <p className="text-xs text-[#69625A] mt-1 leading-relaxed">
                  Cette action supprimera définitivement tous les messages de « {conversationToDelete.title} » de votre historique Firestore sécurisé. Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F2EFEB]">
              <button
                type="button"
                onClick={() => setConversationToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#F4EFEB] hover:bg-[#EAE4DC] text-[#3E3834] text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
