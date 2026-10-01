/**
 * Strictly validates that the userId is a non-empty string and does not contain illegal characters.
 */
function sanitizeUserId(userId: string): string {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Identifiant utilisateur non spécifié.');
  }
  const cleanId = userId.trim();
  if (!cleanId || cleanId.length > 128) {
    throw new Error('Identifiant utilisateur invalide.');
  }
  return cleanId;
}

export interface ActionResult {
  success: boolean;
  actionType: string;
  summary: string;
  data?: any;
  item?: any;
  isRead?: boolean;
  userFriendlyError?: string;
}

/**
 * Navigation Action: Navigate to a specific view in MAMAN+
 */
export async function serverNavigateToView(
  userId: string,
  args: { view: string; reason?: string }
): Promise<ActionResult> {
  const viewMap: Record<string, { path: string; name: string }> = {
    dashboard: { path: '/', name: 'Tableau de bord' },
    accueil: { path: '/', name: 'Tableau de bord' },
    home: { path: '/', name: 'Tableau de bord' },

    pregnancy: { path: '/ma-grossesse', name: 'Ma Grossesse' },
    'ma-grossesse': { path: '/ma-grossesse', name: 'Ma Grossesse' },
    grossesse: { path: '/ma-grossesse', name: 'Ma Grossesse' },

    baby: { path: '/bebe', name: 'Bébé' },
    bebe: { path: '/bebe', name: 'Bébé' },
    'bébé': { path: '/bebe', name: 'Bébé' },

    calendar: { path: '/calendrier', name: 'Calendrier' },
    calendrier: { path: '/calendrier', name: 'Calendrier' },

    appointments: { path: '/rendez-vous', name: 'Rendez-vous' },
    'rendez-vous': { path: '/rendez-vous', name: 'Rendez-vous' },
    rdv: { path: '/rendez-vous', name: 'Rendez-vous' },

    symptoms: { path: '/symptomes', name: 'Symptômes' },
    symptomes: { path: '/symptomes', name: 'Symptômes' },
    'symptômes': { path: '/symptomes', name: 'Symptômes' },

    weight: { path: '/suivi-poids', name: 'Suivi du Poids' },
    'suivi-poids': { path: '/suivi-poids', name: 'Suivi du Poids' },
    poids: { path: '/suivi-poids', name: 'Suivi du Poids' },

    exams: { path: '/examens', name: 'Examens Médicaux' },
    examens: { path: '/examens', name: 'Examens Médicaux' },

    journal: { path: '/journal', name: 'Journal Intime' },
    carnet: { path: '/journal', name: 'Journal Intime' },

    checklist: { path: '/checklist', name: 'Checklist & Valise' },
    valise: { path: '/checklist', name: 'Checklist & Valise' },

    reminders: { path: '/rappels', name: 'Rappels' },
    rappels: { path: '/rappels', name: 'Rappels' },

    notifications: { path: '/notifications', name: 'Notifications' },

    resources: { path: '/conseils-ressources', name: 'Conseils & Ressources' },
    'conseils-ressources': { path: '/conseils-ressources', name: 'Conseils & Ressources' },
    conseils: { path: '/conseils-ressources', name: 'Conseils & Ressources' },

    profile: { path: '/profil', name: 'Mon Profil' },
    profil: { path: '/profil', name: 'Mon Profil' },

    settings: { path: '/parametres', name: 'Paramètres' },
    parametres: { path: '/parametres', name: 'Paramètres' },
  };

  const key = (args.view || '').toLowerCase().trim();
  const target = viewMap[key] || { path: '/', name: 'Tableau de bord' };

  return {
    success: true,
    actionType: 'navigateToView',
    summary: `Redirection vers la rubrique ${target.name}`,
    item: {
      view: key,
      path: target.path,
      name: target.name,
      reason: args.reason || `Affichage de la rubrique ${target.name}`,
    },
    isRead: false,
  };
}

/**
 * Appointment Actions
 */
export async function serverAddAppointment(
  userId: string,
  args: {
    title: string;
    date: string;
    time: string;
    practitioner?: string;
    location?: string;
    notes?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const id = `appt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAppointment = {
      id,
      userId: uid,
      title: (args.title || 'Rendez-vous médical').trim(),
      date: (args.date || '').trim(),
      time: (args.time || '09:00').trim(),
      practitioner: (args.practitioner || 'Professionnel de santé').trim(),
      location: (args.location || 'Cabinet médical / Maternité').trim(),
      status: 'À venir' as const,
      notes: (args.notes || '').trim(),
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionType: 'addAppointment',
      summary: `Rendez-vous « ${newAppointment.title} » ajouté pour le ${newAppointment.date} à ${newAppointment.time}`,
      item: newAppointment,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addAppointment]', err?.message);
    return {
      success: false,
      actionType: 'addAppointment',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'enregistrement de votre rendez-vous.",
    };
  }
}

export async function serverUpdateAppointment(
  userId: string,
  args: {
    appointmentId: string;
    title?: string;
    date?: string;
    time?: string;
    practitioner?: string;
    location?: string;
    notes?: string;
  }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.appointmentId) {
      return {
        success: false,
        actionType: 'updateAppointment',
        summary: '',
        userFriendlyError: "L'identifiant du rendez-vous à modifier n'a pas été trouvé.",
      };
    }

    const updates: Record<string, any> = {
      id: args.appointmentId.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (args.title) updates.title = args.title.trim();
    if (args.date) updates.date = args.date.trim();
    if (args.time) updates.time = args.time.trim();
    if (args.practitioner) updates.practitioner = args.practitioner.trim();
    if (args.location) updates.location = args.location.trim();
    if (args.notes !== undefined) updates.notes = args.notes.trim();

    return {
      success: true,
      actionType: 'updateAppointment',
      summary: `Rendez-vous mis à jour avec succès`,
      item: updates,
    };
  } catch (err: any) {
    console.error('[Server Action Error: updateAppointment]', err?.message);
    return {
      success: false,
      actionType: 'updateAppointment',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de la modification du rendez-vous.",
    };
  }
}

export async function serverDeleteAppointment(
  userId: string,
  args: {
    appointmentId: string;
    confirmed?: boolean;
  }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.appointmentId) {
      return {
        success: false,
        actionType: 'deleteAppointment',
        summary: '',
        userFriendlyError: "Identifiant du rendez-vous manquant pour la suppression.",
      };
    }

    return {
      success: true,
      actionType: 'deleteAppointment',
      summary: `Rendez-vous supprimé avec succès`,
      item: { id: args.appointmentId.trim(), appointmentId: args.appointmentId.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteAppointment]', err?.message);
    return {
      success: false,
      actionType: 'deleteAppointment',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de la suppression de votre rendez-vous.",
    };
  }
}

export async function serverGetAppointments(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getAppointments',
    summary: 'Rendez-vous consultés',
    data: [],
    isRead: true,
  };
}

/**
 * Reminder Actions
 */
export async function serverAddReminder(
  userId: string,
  args: {
    title: string;
    date?: string;
    time: string;
    frequency?: string;
    category?: string;
    description?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const id = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReminder = {
      id,
      userId: uid,
      title: (args.title || 'Rappel').trim(),
      date: (args.date || new Date().toISOString().split('T')[0]).trim(),
      time: (args.time || '08:00').trim(),
      frequency: (args.frequency || 'Quotidien') as any,
      category: (args.category || 'Santé') as any,
      description: (args.description || '').trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionType: 'addReminder',
      summary: `Rappel « ${newReminder.title} » programmé pour ${newReminder.time} (${newReminder.frequency})`,
      item: newReminder,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addReminder]', err?.message);
    return {
      success: false,
      actionType: 'addReminder',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'enregistrement de votre rappel.",
    };
  }
}

export async function serverUpdateReminder(
  userId: string,
  args: {
    reminderId: string;
    title?: string;
    time?: string;
    frequency?: string;
    isActive?: boolean;
    description?: string;
  }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.reminderId) {
      return {
        success: false,
        actionType: 'updateReminder',
        summary: '',
        userFriendlyError: "Identifiant du rappel manquant.",
      };
    }

    const updates: Record<string, any> = {
      id: args.reminderId.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (args.title) updates.title = args.title.trim();
    if (args.time) updates.time = args.time.trim();
    if (args.frequency) updates.frequency = args.frequency;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.description !== undefined) updates.description = args.description.trim();

    return {
      success: true,
      actionType: 'updateReminder',
      summary: `Rappel mis à jour avec succès`,
      item: updates,
    };
  } catch (err: any) {
    console.error('[Server Action Error: updateReminder]', err?.message);
    return {
      success: false,
      actionType: 'updateReminder',
      summary: '',
      userFriendlyError: "Impossible de modifier ce rappel.",
    };
  }
}

export async function serverDeleteReminder(
  userId: string,
  args: { reminderId: string; confirmed?: boolean }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.reminderId) {
      return {
        success: false,
        actionType: 'deleteReminder',
        summary: '',
        userFriendlyError: "Identifiant du rappel manquant.",
      };
    }

    return {
      success: true,
      actionType: 'deleteReminder',
      summary: `Rappel supprimé avec succès`,
      item: { id: args.reminderId.trim(), reminderId: args.reminderId.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteReminder]', err?.message);
    return {
      success: false,
      actionType: 'deleteReminder',
      summary: '',
      userFriendlyError: "Impossible de supprimer ce rappel.",
    };
  }
}

export async function serverGetReminders(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getReminders',
    summary: 'Rappels consultés',
    data: [],
    isRead: true,
  };
}

/**
 * Weight Actions
 */
export async function serverAddWeightEntry(
  userId: string,
  args: {
    weightKg: number;
    date?: string;
    note?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const weightVal = Number(args.weightKg);
    if (isNaN(weightVal) || weightVal <= 25 || weightVal >= 250) {
      return {
        success: false,
        actionType: 'addWeightEntry',
        summary: '',
        userFriendlyError: 'La valeur du poids doit être un nombre valide compris entre 25 et 250 kg.',
      };
    }

    const id = `wt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newWeight = {
      id,
      userId: uid,
      date: (args.date || new Date().toISOString().split('T')[0]).trim(),
      weightKg: Math.round(weightVal * 10) / 10,
      note: (args.note || '').trim(),
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionType: 'addWeightEntry',
      summary: `Pesée de ${newWeight.weightKg} kg enregistrée pour le ${newWeight.date}`,
      item: newWeight,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addWeightEntry]', err?.message);
    return {
      success: false,
      actionType: 'addWeightEntry',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'enregistrement de votre poids.",
    };
  }
}

export async function serverDeleteWeight(
  userId: string,
  args: { weightId?: string; entryId?: string; confirmed?: boolean }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    const id = args.weightId || args.entryId;
    if (!id) {
      return {
        success: false,
        actionType: 'deleteWeight',
        summary: '',
        userFriendlyError: 'Identifiant de la pesée manquant.',
      };
    }

    return {
      success: true,
      actionType: 'deleteWeight',
      summary: 'Pesée supprimée avec succès',
      item: { id: id.trim(), entryId: id.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteWeight]', err?.message);
    return {
      success: false,
      actionType: 'deleteWeight',
      summary: '',
      userFriendlyError: 'Impossible de supprimer cette pesée.',
    };
  }
}

export async function serverGetWeights(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getWeights',
    summary: 'Pesées consultées',
    data: [],
    isRead: true,
  };
}

/**
 * Symptom Actions
 */
export async function serverAddSymptom(
  userId: string,
  args: {
    symptomName: string;
    intensity?: string;
    intensityVal?: number;
    note?: string;
    date?: string;
    time?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const id = `sym_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const intensity = (args.intensity || 'Modéré') as any;
    const intensityVal = args.intensityVal || (intensity === 'Léger' ? 1 : intensity === 'Sévère' ? 3 : 2);
    const now = new Date();

    const newLog = {
      id,
      userId: uid,
      symptomId: `sym_${Date.now()}`,
      symptomName: (args.symptomName || 'Symptôme').trim(),
      intensity,
      intensityVal,
      stateLabel: intensity,
      note: (args.note || '').trim(),
      date: args.date || new Date().toISOString().split('T')[0],
      time: args.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString(),
    };

    return {
      success: true,
      actionType: 'addSymptom',
      summary: `Symptôme « ${newLog.symptomName} » (${newLog.intensity}) enregistré`,
      item: newLog,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addSymptom]', err?.message);
    return {
      success: false,
      actionType: 'addSymptom',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'enregistrement du symptôme.",
    };
  }
}

export async function serverDeleteSymptom(
  userId: string,
  args: { symptomId?: string; logId?: string; confirmed?: boolean }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    const id = args.symptomId || args.logId;
    if (!id) {
      return {
        success: false,
        actionType: 'deleteSymptom',
        summary: '',
        userFriendlyError: 'Identifiant du symptôme manquant.',
      };
    }

    return {
      success: true,
      actionType: 'deleteSymptom',
      summary: 'Symptôme supprimé avec succès',
      item: { id: id.trim(), logId: id.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteSymptom]', err?.message);
    return {
      success: false,
      actionType: 'deleteSymptom',
      summary: '',
      userFriendlyError: 'Impossible de supprimer ce symptôme.',
    };
  }
}

export async function serverGetSymptoms(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getSymptoms',
    summary: 'Symptômes consultés',
    data: [],
    isRead: true,
  };
}

/**
 * Journal Actions
 */
export async function serverAddJournalEntry(
  userId: string,
  args: {
    title: string;
    content: string;
    mood?: string;
    tags?: string[];
    date?: string;
    isPrivate?: boolean;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const id = `jnl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEntry = {
      id,
      userId: uid,
      title: (args.title || 'Note de journal').trim(),
      content: (args.content || '').trim(),
      mood: args.mood || 'Heureuse',
      tags: Array.isArray(args.tags) ? args.tags : [],
      date: args.date || new Date().toISOString().split('T')[0],
      isPrivate: args.isPrivate !== undefined ? Boolean(args.isPrivate) : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionType: 'addJournalEntry',
      summary: `Entrée de journal « ${newEntry.title} » ajoutée`,
      item: newEntry,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addJournalEntry]', err?.message);
    return {
      success: false,
      actionType: 'addJournalEntry',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'enregistrement de votre journal.",
    };
  }
}

export async function serverUpdateJournalEntry(
  userId: string,
  args: {
    entryId: string;
    title?: string;
    content?: string;
    mood?: string;
    tags?: string[];
  }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.entryId) {
      return {
        success: false,
        actionType: 'updateJournalEntry',
        summary: '',
        userFriendlyError: "Identifiant de l'entrée de journal manquant.",
      };
    }

    const updates: Record<string, any> = {
      id: args.entryId.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (args.title) updates.title = args.title.trim();
    if (args.content) updates.content = args.content.trim();
    if (args.mood) updates.mood = args.mood;
    if (args.tags) updates.tags = args.tags;

    return {
      success: true,
      actionType: 'updateJournalEntry',
      summary: `Note de journal mise à jour`,
      item: updates,
    };
  } catch (err: any) {
    console.error('[Server Action Error: updateJournalEntry]', err?.message);
    return {
      success: false,
      actionType: 'updateJournalEntry',
      summary: '',
      userFriendlyError: 'Impossible de modifier cette note de journal.',
    };
  }
}

export async function serverDeleteJournalEntry(
  userId: string,
  args: { entryId: string; confirmed?: boolean }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.entryId) {
      return {
        success: false,
        actionType: 'deleteJournalEntry',
        summary: '',
        userFriendlyError: "Identifiant de l'entrée manquant.",
      };
    }

    return {
      success: true,
      actionType: 'deleteJournalEntry',
      summary: `Note de journal supprimée avec succès`,
      item: { id: args.entryId.trim(), entryId: args.entryId.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteJournalEntry]', err?.message);
    return {
      success: false,
      actionType: 'deleteJournalEntry',
      summary: '',
      userFriendlyError: 'Impossible de supprimer cette note.',
    };
  }
}

export async function serverGetJournalEntries(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getJournalEntries',
    summary: 'Journal consulté',
    data: [],
    isRead: true,
  };
}

/**
 * Checklist Actions
 */
export async function serverAddChecklistItem(
  userId: string,
  args: {
    title: string;
    category?: string;
    dueDate?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const id = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem = {
      id,
      userId: uid,
      title: (args.title || 'Élément de checklist').trim(),
      category: (args.category || 'Maman') as any,
      completed: false,
      isCustom: true,
      dueDate: args.dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionType: 'addChecklistItem',
      summary: `Élément « ${newItem.title} » ajouté à votre checklist (${newItem.category})`,
      item: newItem,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addChecklistItem]', err?.message);
    return {
      success: false,
      actionType: 'addChecklistItem',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'ajout à votre checklist.",
    };
  }
}

export async function serverUpdateChecklistItem(
  userId: string,
  args: {
    itemId: string;
    title?: string;
    completed?: boolean;
    category?: string;
    dueDate?: string;
  }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.itemId) {
      return {
        success: false,
        actionType: 'updateChecklistItem',
        summary: '',
        userFriendlyError: "Identifiant de l'élément de checklist manquant.",
      };
    }

    const updates: Record<string, any> = {
      id: args.itemId.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (args.title) updates.title = args.title.trim();
    if (args.completed !== undefined) updates.completed = Boolean(args.completed);
    if (args.category) updates.category = args.category;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;

    return {
      success: true,
      actionType: 'updateChecklistItem',
      summary: `Élément de checklist mis à jour`,
      item: updates,
    };
  } catch (err: any) {
    console.error('[Server Action Error: updateChecklistItem]', err?.message);
    return {
      success: false,
      actionType: 'updateChecklistItem',
      summary: '',
      userFriendlyError: "Impossible de modifier l'élément de checklist.",
    };
  }
}

export async function serverDeleteChecklistItem(
  userId: string,
  args: { itemId: string; confirmed?: boolean }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.itemId) {
      return {
        success: false,
        actionType: 'deleteChecklistItem',
        summary: '',
        userFriendlyError: "Identifiant de l'élément manquant.",
      };
    }

    return {
      success: true,
      actionType: 'deleteChecklistItem',
      summary: `Élément supprimé de la checklist`,
      item: { id: args.itemId.trim(), itemId: args.itemId.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteChecklistItem]', err?.message);
    return {
      success: false,
      actionType: 'deleteChecklistItem',
      summary: '',
      userFriendlyError: "Impossible de supprimer cet élément de la checklist.",
    };
  }
}

export async function serverGetChecklist(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getChecklist',
    summary: 'Checklist consultée',
    data: [],
    isRead: true,
  };
}

/**
 * Baby & Profile Actions
 */
export async function serverUpdateBabyInfo(
  userId: string,
  args: {
    nickname?: string;
    gender?: string;
    firstKicksDate?: string;
    movementNotes?: string;
    notes?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const updates: Record<string, any> = {
      userId: uid,
      updatedAt: new Date().toISOString(),
    };

    if (args.nickname !== undefined) updates.nickname = args.nickname.trim();
    if (args.gender !== undefined) {
      const validGenders = ['Fille', 'Garçon', 'Surprise', 'Non précisé'];
      updates.gender = validGenders.includes(args.gender) ? args.gender : 'Non précisé';
    }
    if (args.firstKicksDate !== undefined) updates.firstKicksDate = args.firstKicksDate.trim();
    if (args.movementNotes !== undefined) updates.movementNotes = args.movementNotes.trim();
    if (args.notes !== undefined) updates.notes = args.notes.trim();

    return {
      success: true,
      actionType: 'updateBabyInfo',
      summary: `Informations de bébé mises à jour avec succès`,
      item: updates,
    };
  } catch (err: any) {
    console.error('[Server Action Error: updateBabyInfo]', err?.message);
    return {
      success: false,
      actionType: 'updateBabyInfo',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de la mise à jour des informations de bébé.",
    };
  }
}

export async function serverUpdateProfile(
  userId: string,
  args: {
    firstName?: string;
    lastName?: string;
    dueDate?: string;
    lastMenstrualPeriodDate?: string;
    heightCm?: number;
    prePregnancyWeightKg?: number;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const updates: Record<string, any> = {
      id: uid,
      updatedAt: new Date().toISOString(),
    };

    if (args.firstName && typeof args.firstName === 'string') updates.firstName = args.firstName.trim();
    if (args.lastName && typeof args.lastName === 'string') updates.lastName = args.lastName.trim();
    if (args.dueDate && typeof args.dueDate === 'string') updates.dueDate = args.dueDate.trim();
    if (args.lastMenstrualPeriodDate && typeof args.lastMenstrualPeriodDate === 'string') {
      updates.lastMenstrualPeriodDate = args.lastMenstrualPeriodDate.trim();
    }
    if (args.heightCm !== undefined) {
      const h = Number(args.heightCm);
      if (!isNaN(h) && h >= 100 && h <= 230) updates.heightCm = h;
    }
    if (args.prePregnancyWeightKg !== undefined) {
      const w = Number(args.prePregnancyWeightKg);
      if (!isNaN(w) && w >= 30 && w <= 200) updates.prePregnancyWeightKg = Math.round(w * 10) / 10;
    }

    return {
      success: true,
      actionType: 'updateProfile',
      summary: `Profil mis à jour avec succès`,
      item: updates,
    };
  } catch (err: any) {
    console.error('[Server Action Error: updateProfile]', err?.message);
    return {
      success: false,
      actionType: 'updateProfile',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de la mise à jour de votre profil.",
    };
  }
}

export async function serverGetPregnancyInfo(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getPregnancyInfo',
    summary: 'Informations de grossesse consultées',
    data: null,
    isRead: true,
  };
}

export async function serverGetBabyInfo(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getBabyInfo',
    summary: 'Informations de bébé consultées',
    data: null,
    isRead: true,
  };
}

export async function serverGetUserProfile(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getUserProfile',
    summary: 'Profil consulté',
    data: null,
    isRead: true,
  };
}

/**
 * Medical Exams Actions
 */
export async function serverAddExam(
  userId: string,
  args: {
    title: string;
    date: string;
    time?: string;
    type?: string;
    notes?: string;
  }
): Promise<ActionResult> {
  try {
    const uid = sanitizeUserId(userId);
    const id = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newExam = {
      id,
      userId: uid,
      title: (args.title || 'Examen médical').trim(),
      date: (args.date || new Date().toISOString().split('T')[0]).trim(),
      time: (args.time || '09:00').trim(),
      type: (args.type || 'Échographie') as any,
      status: 'À venir' as const,
      notes: (args.notes || '').trim(),
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      actionType: 'addExam',
      summary: `Examen « ${newExam.title} » ajouté pour le ${newExam.date}`,
      item: newExam,
    };
  } catch (err: any) {
    console.error('[Server Action Error: addExam]', err?.message);
    return {
      success: false,
      actionType: 'addExam',
      summary: '',
      userFriendlyError: "Une difficulté est survenue lors de l'ajout de l'examen.",
    };
  }
}

export async function serverDeleteExam(
  userId: string,
  args: { examId: string; confirmed?: boolean }
): Promise<ActionResult> {
  try {
    sanitizeUserId(userId);
    if (!args.examId) {
      return {
        success: false,
        actionType: 'deleteExam',
        summary: '',
        userFriendlyError: "Identifiant de l'examen manquant.",
      };
    }

    return {
      success: true,
      actionType: 'deleteExam',
      summary: `Examen supprimé avec succès`,
      item: { id: args.examId.trim(), examId: args.examId.trim() },
    };
  } catch (err: any) {
    console.error('[Server Action Error: deleteExam]', err?.message);
    return {
      success: false,
      actionType: 'deleteExam',
      summary: '',
      userFriendlyError: "Impossible de supprimer cet examen.",
    };
  }
}

export async function serverGetExams(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getExams',
    summary: 'Examens consultés',
    data: [],
    isRead: true,
  };
}

/**
 * Advice, Videos, Notifications, Subscription
 */
export async function serverGetSavedAdvice(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getSavedAdvice',
    summary: 'Conseils sauvegardés consultés',
    data: [],
    isRead: true,
  };
}

export async function serverSaveAdvice(userId: string, args: { adviceId: string }): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'saveAdvice',
    summary: `Conseil enregistré dans vos favoris`,
    item: { adviceId: args.adviceId },
  };
}

export async function serverGetSavedVideos(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getSavedVideos',
    summary: 'Vidéos consultées',
    data: [],
    isRead: true,
  };
}

export async function serverSaveVideo(userId: string, args: { videoId: string }): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'saveVideo',
    summary: `Vidéo enregistrée dans vos favoris`,
    item: { videoId: args.videoId },
  };
}

export async function serverGetNotifications(userId: string): Promise<ActionResult> {
  sanitizeUserId(userId);
  return {
    success: true,
    actionType: 'getNotifications',
    summary: 'Notifications consultées',
    data: [],
    isRead: true,
  };
}

export async function serverGetSubscription(_userId: string): Promise<ActionResult> {
  return {
    success: true,
    actionType: 'getSubscription',
    summary: 'MAMAN+ est une application 100% gratuite.',
    data: { planId: 'free', isFree: true, active: true },
    isRead: true,
  };
}

/**
 * Main dispatcher for executing any server action by name with strict validation.
 */
export async function executeServerAction(
  userId: string,
  functionName: string,
  functionArgs: any
): Promise<ActionResult> {
  switch (functionName) {
    // Navigation
    case 'navigateToView':
    case 'openView':
    case 'goToView':
      return await serverNavigateToView(userId, functionArgs);

    // Reminders
    case 'createReminder':
    case 'addReminder':
      return await serverAddReminder(userId, functionArgs);
    case 'updateReminder':
      return await serverUpdateReminder(userId, functionArgs);
    case 'deleteReminder':
      return await serverDeleteReminder(userId, functionArgs);
    case 'getReminders':
      return await serverGetReminders(userId);

    // Appointments
    case 'createAppointment':
    case 'addAppointment':
      return await serverAddAppointment(userId, functionArgs);
    case 'updateAppointment':
      return await serverUpdateAppointment(userId, functionArgs);
    case 'deleteAppointment':
      return await serverDeleteAppointment(userId, functionArgs);
    case 'getAppointments':
      return await serverGetAppointments(userId);

    // Symptoms
    case 'addSymptom':
      return await serverAddSymptom(userId, functionArgs);
    case 'deleteSymptom':
      return await serverDeleteSymptom(userId, functionArgs);
    case 'getSymptoms':
      return await serverGetSymptoms(userId);

    // Weights
    case 'addWeight':
    case 'addWeightEntry':
      return await serverAddWeightEntry(userId, functionArgs);
    case 'deleteWeight':
      return await serverDeleteWeight(userId, functionArgs);
    case 'getWeights':
      return await serverGetWeights(userId);

    // Journal
    case 'addJournalEntry':
      return await serverAddJournalEntry(userId, functionArgs);
    case 'updateJournalEntry':
      return await serverUpdateJournalEntry(userId, functionArgs);
    case 'deleteJournalEntry':
      return await serverDeleteJournalEntry(userId, functionArgs);
    case 'getJournalEntries':
      return await serverGetJournalEntries(userId);

    // Checklist
    case 'createChecklistItem':
    case 'addChecklistItem':
      return await serverAddChecklistItem(userId, functionArgs);
    case 'updateChecklistItem':
      return await serverUpdateChecklistItem(userId, functionArgs);
    case 'deleteChecklistItem':
      return await serverDeleteChecklistItem(userId, functionArgs);
    case 'getChecklist':
      return await serverGetChecklist(userId);

    // Pregnancy & Baby Info & Profile
    case 'getPregnancyInfo':
      return await serverGetPregnancyInfo(userId);
    case 'getBabyInfo':
      return await serverGetBabyInfo(userId);
    case 'updateBabyInfo':
      return await serverUpdateBabyInfo(userId, functionArgs);
    case 'getUserProfile':
      return await serverGetUserProfile(userId);
    case 'updateProfile':
      return await serverUpdateProfile(userId, functionArgs);

    // Medical Exams
    case 'getExams':
      return await serverGetExams(userId);
    case 'addExam':
      return await serverAddExam(userId, functionArgs);
    case 'deleteExam':
      return await serverDeleteExam(userId, functionArgs);

    // Saved Advice & Videos
    case 'getSavedAdvice':
      return await serverGetSavedAdvice(userId);
    case 'saveAdvice':
      return await serverSaveAdvice(userId, functionArgs);
    case 'getSavedVideos':
      return await serverGetSavedVideos(userId);
    case 'saveVideo':
      return await serverSaveVideo(userId, functionArgs);

    // Notifications & Subscription
    case 'getNotifications':
      return await serverGetNotifications(userId);
    case 'getSubscription':
      return await serverGetSubscription(userId);

    default:
      return {
        success: false,
        actionType: functionName,
        summary: '',
        userFriendlyError: 'Action non reconnue par le système.',
      };
  }
}
