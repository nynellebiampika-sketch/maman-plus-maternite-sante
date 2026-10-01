import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  User,
  SymptomLog,
  WeightEntry,
  Appointment,
  MedicalExam,
  Prescription,
  BabyInfo,
  JournalEntry,
  ReminderItem,
  ChecklistItem,
} from '../types';
import { calculateGestationalStatus } from './storage';
import { USER_GUIDE_FEATURES, UserGuideFeature } from '../data/userGuideData';

// Official MAMAN+ Color Palette
const COLORS = {
  primary: [158, 42, 43] as [number, number, number], // #9E2A2B Bordeaux
  primaryDark: [133, 35, 36] as [number, number, number], // #852324
  primaryLight: [254, 236, 236] as [number, number, number], // #FEECEC
  secondary: [30, 101, 58] as [number, number, number], // #1E653A Green
  secondaryLight: [231, 248, 237] as [number, number, number], // #E7F8ED
  textDark: [30, 27, 24] as [number, number, number], // #1E1B18
  textMuted: [105, 98, 90] as [number, number, number], // #69625A
  textLight: [140, 132, 125] as [number, number, number], // #8C847D
  bgWarm: [248, 247, 244] as [number, number, number], // #F8F7F4
  border: [234, 230, 223] as [number, number, number], // #EAE6DF
  white: [255, 255, 255] as [number, number, number],
  amber: [140, 94, 36] as [number, number, number], // #8C5E24
  amberLight: [250, 245, 236] as [number, number, number],
};

let cachedLogoBase64: string | null = null;

/**
 * Loads the official MAMAN+ logo (the mother with belly emblem) and returns a clean base64 data URL.
 */
export async function getLogoBase64(): Promise<string | null> {
  if (cachedLogoBase64) return cachedLogoBase64;

  const candidateUrls = [
    '/maman_emblem.jpg',
    '/maman_plus_emblem_1788433996563.jpg',
    '/maman_logo.jpg',
    '/maman_plus_logo_1788433972254.jpg',
    '/pregnant_mother_illustration.jpg',
  ];

  for (const url of candidateUrls) {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const size = Math.max(img.naturalWidth || 120, img.naturalHeight || 120);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Fill clean white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);

            // Draw image centered
            const imgW = img.naturalWidth || size;
            const imgH = img.naturalHeight || size;
            const drawX = (size - imgW) / 2;
            const drawY = (size - imgH) / 2;
            ctx.drawImage(img, drawX, drawY, imgW, imgH);

            const base64 = canvas.toDataURL('image/jpeg', 0.95);
            resolve(base64);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error(`Failed to load logo from ${url}`));
        img.src = url;
      });

      if (dataUrl && dataUrl.startsWith('data:image')) {
        cachedLogoBase64 = dataUrl;
        return dataUrl;
      }
    } catch {
      // Continue to next candidate image
    }
  }

  return null;
}

/**
 * Adds the official MAMAN+ header on a page, including the real logo image.
 */
function drawHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  logoBase64?: string | null
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top accent banner
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Brand Real Logo / Emblem
  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 8, 16, 16, 3, 3, 'F');
      doc.addImage(logoBase64, 'JPEG', 14, 8, 16, 16);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, 8, 16, 16, 3, 3, 'D');
    } catch {
      // Fallback
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(14, 10, 12, 12, 2.5, 2.5, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('M+', 16, 18);
    }
  } else {
    // Vector emblem fallback
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(14, 10, 12, 12, 2.5, 2.5, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('M+', 16, 18);
  }

  doc.setTextColor(...COLORS.textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MAMAN', 34, 19);

  doc.setTextColor(...COLORS.primary);
  doc.text('+', 60, 19);

  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Maternité & Santé', 34, 24);

  // Document Title & Subtitle on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text(title, pageWidth - 14, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(subtitle, pageWidth - 14, 23, { align: 'right' });

  // Thin separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);
}

/**
 * Adds the official MAMAN+ footer on all pages.
 */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, generatedDate: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.primary);
  doc.text('MAMAN+', 14, pageHeight - 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(` • Maternité & Santé • Document Médical Confidentiel A4 • Édité le ${generatedDate}`, 28, pageHeight - 8.5);

  doc.text(
    `Page ${pageNum} / ${totalPages}`,
    pageWidth - 14,
    pageHeight - 8.5,
    { align: 'right' }
  );
}

export interface PregnancyReportData {
  currentUser: User | null;
  symptomLogs: SymptomLog[];
  weightEntries: WeightEntry[];
  appointments: Appointment[];
  exams: MedicalExam[];
  prescriptions: Prescription[];
  babyInfo: BabyInfo | null;
  journalEntries: JournalEntry[];
  reminders: ReminderItem[];
  checklist: ChecklistItem[];
}

/**
 * Builds the full Pregnancy Medical Report jsPDF document and returns doc, fileName, and blobUrl.
 */
export async function buildPregnancyReportDoc(
  data: PregnancyReportData
): Promise<{ doc: jsPDF; fileName: string; blobUrl: string; totalPages: number }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const {
    currentUser,
    symptomLogs,
    weightEntries,
    appointments,
    exams,
    prescriptions,
    babyInfo,
    journalEntries,
    reminders,
    checklist,
  } = data;

  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  const now = new Date();
  const generatedDateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const patientFullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Patiente MAMAN+';
  const patientEmail = currentUser?.email || 'Non renseigné';

  // Sort chronological data
  const sortedSymptoms = [...symptomLogs].sort(
    (a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime()
  );
  const sortedWeights = [...weightEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime()
  );
  const sortedExams = [...exams].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const activePrescriptions = prescriptions.filter((p) => p.status === 'Active');

  // Weight statistics
  const startingWeight = currentUser?.prePregnancyWeightKg;
  const latestWeight = sortedWeights[0]?.weightKg;
  const weightGain = startingWeight && latestWeight ? (latestWeight - startingWeight).toFixed(1) : null;

  // Load real MAMAN+ logo
  const logoBase64 = await getLogoBase64();

  // Header (Page 1)
  drawHeader(
    doc,
    'DOSSIER MÉDICAL DE SUIVI',
    'Synthèse de grossesse & Éléments cliniques',
    logoBase64
  );

  let cursorY = 34;

  // 1. PATIENT & PREGNANCY PROFILE CARD
  doc.setFillColor(...COLORS.bgWarm);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(14, cursorY, 182, 34, 3, 3, 'FD');

  // Patient block left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Patiente : ${patientFullName}`, 19, cursorY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Email : ${patientEmail}`, 19, cursorY + 14);

  if (currentUser?.heightCm) {
    doc.text(`Taille : ${currentUser.heightCm} cm`, 19, cursorY + 20);
  }
  if (startingWeight) {
    doc.text(`Poids de départ : ${startingWeight} kg`, 19, cursorY + (currentUser?.heightCm ? 26 : 20));
  }

  // Pregnancy block right
  const colRightX = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.primaryDark);

  if (gestational) {
    doc.text(`Terme actuel : ${gestational.weeksSA} SA + ${gestational.daysSA} j (Trimestre ${gestational.trimester})`, colRightX, cursorY + 8);
  } else {
    doc.text(`Terme : Non configuré`, colRightX, cursorY + 8);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);

  if (currentUser?.dueDate) {
    const dueFormatted = new Date(currentUser.dueDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Date présumée d'accouchement (DPA) : ${dueFormatted}`, colRightX, cursorY + 14);
  }
  if (currentUser?.lastMenstrualPeriodDate) {
    const ddrFormatted = new Date(currentUser.lastMenstrualPeriodDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Date des dernières règles (DDR) : ${ddrFormatted}`, colRightX, cursorY + 20);
  }

  if (weightGain !== null) {
    const gainPrefix = Number(weightGain) >= 0 ? '+' : '';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(Number(weightGain) > 16 ? COLORS.amber : COLORS.secondary));
    doc.text(`Évolution pondérale totale : ${gainPrefix}${weightGain} kg`, colRightX, cursorY + 26);
  }

  cursorY += 40;

  // 2. SECTION : SYNTHÈSE DU SUIVI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);
  doc.text('1. SYNTHÈSE GLOBALE DU SUIVI', 14, cursorY);

  cursorY += 3;

  const synthesisItems = [
    [
      'Évolution pondérale',
      startingWeight && latestWeight
        ? `Poids initial ${startingWeight} kg -> Actuel ${latestWeight} kg (${Number(weightGain) >= 0 ? '+' : ''}${weightGain} kg)`
        : sortedWeights.length > 0
        ? `Dernière pesée : ${sortedWeights[0].weightKg} kg le ${sortedWeights[0].date}`
        : 'Aucune pesée enregistrée',
    ],
    [
      'Symptômes consignés',
      sortedSymptoms.length > 0
        ? `${sortedSymptoms.length} observation(s) enregistrée(s). Principaux : ${Array.from(
            new Set(sortedSymptoms.slice(0, 5).map((s) => s.symptomName))
          ).join(', ')}.`
        : 'Aucun symptôme particulier consigné',
    ],
    [
      'Rendez-vous médicaux',
      sortedAppointments.length > 0
        ? `${sortedAppointments.length} consultation(s) enregistrée(s). Prochain : ${
            sortedAppointments.find((a) => a.status === 'À venir' || a.status === 'Confirmé')
              ? `${sortedAppointments.find((a) => a.status === 'À venir' || a.status === 'Confirmé')?.title} (${sortedAppointments.find((a) => a.status === 'À venir' || a.status === 'Confirmé')?.date})`
              : 'Aucun rendez-vous à venir'
          }`
        : 'Aucun rendez-vous consigné',
    ],
    [
      'Examens et bilans',
      sortedExams.length > 0
        ? `${sortedExams.filter((e) => e.status === 'Effectué').length} examen(s) effectué(s), ${
            sortedExams.filter((e) => e.status !== 'Effectué').length
          } en attente ou à planifier.`
        : 'Aucun examen consigné',
    ],
    [
      'Prescriptions en cours',
      activePrescriptions.length > 0
        ? `${activePrescriptions.length} ordonnance(s) active(s) délivrée(s) par un professionnel.`
        : 'Aucune ordonnance active enregistrée',
    ],
  ];

  autoTable(doc, {
    startY: cursorY,
    head: [['Domaine', 'Constat & Évolution enregistrée']],
    body: synthesisItems,
    theme: 'plain',
    headStyles: {
      fillColor: COLORS.primaryLight,
      textColor: COLORS.primaryDark,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.textDark,
      lineColor: COLORS.border,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', textColor: COLORS.primaryDark },
      1: { cellWidth: 137 },
    },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 8;

  // 3. SECTION : POINTS À DISCUTER AVEC LE PROFESSIONNEL DE SANTÉ
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);
  doc.text('2. POINTS À DISCUTER AVEC LE PROFESSIONNEL DE SANTÉ', 14, cursorY);

  cursorY += 4;

  // Identify salient points
  const intenseSymptoms = sortedSymptoms.filter(
    (s) => s.intensity === 'Intense' || s.intensity === 'Modérée'
  );
  const pendingExams = sortedExams.filter(
    (e) => e.status === 'En attente de résultats' || e.status === 'En attente' || e.status === 'À planifier'
  );
  const upcomingAppointments = sortedAppointments.filter(
    (a) => a.status === 'À venir' || a.status === 'Confirmé'
  );

  const discussionPoints: string[] = [];

  if (intenseSymptoms.length > 0) {
    const symptomNames = Array.from(new Set(intenseSymptoms.map((s) => s.symptomName))).slice(0, 4);
    discussionPoints.push(
      `Symptômes signalés d'intensité modérée à intense : ${symptomNames.join(', ')} (consulter l'historique détaillé ci-après).`
    );
  }

  if (weightGain !== null && (Number(weightGain) > 15 || Number(weightGain) < 0)) {
    discussionPoints.push(
      `Variation pondérale à examiner : évolution de ${Number(weightGain) >= 0 ? '+' : ''}${weightGain} kg par rapport au poids initial.`
    );
  }

  if (pendingExams.length > 0) {
    discussionPoints.push(
      `Examens ou bilans à vérifier : ${pendingExams.map((e) => e.title).join(', ')}.`
    );
  }

  if (upcomingAppointments.length > 0) {
    discussionPoints.push(
      `Prochaine(s) consultation(s) prévue(s) : ${upcomingAppointments
        .slice(0, 2)
        .map((a) => `${a.title} le ${a.date} avec ${a.practitioner || 'le praticien'}`)
        .join(' ; ')}.`
    );
  }

  if (discussionPoints.length === 0) {
    discussionPoints.push(
      'Aucune anomalie ou alerte majeure signalée dans les saisies récentes. Poursuivre le suivi de routine et la supplémentation prescrite.'
    );
  }

  // Draw points box
  doc.setFillColor(...COLORS.primaryLight);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.3);

  const boxHeight = 12 + discussionPoints.length * 6 + 14;
  doc.roundedRect(14, cursorY, 182, boxHeight, 2.5, 2.5, 'FD');

  let ptY = cursorY + 7;
  discussionPoints.forEach((pt) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    const wrapped = doc.splitTextToSize(`•  ${pt}`, 174);
    doc.text(wrapped, 18, ptY);
    ptY += wrapped.length * 4.5;
  });

  // Mandatory Medical Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text(
    'Avis médical : Ce rapport constitue un résumé des données enregistrées dans MAMAN+. Il ne remplace pas l’avis, le diagnostic ou la prescription d’un professionnel de santé.',
    18,
    cursorY + boxHeight - 4,
    { maxWidth: 174 }
  );

  cursorY += boxHeight + 8;

  // 4. SECTION : SYMPTÔMES ENREGISTRÉS
  if (sortedSymptoms.length > 0) {
    // Check if we need a new page
    if (cursorY > 230) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Symptômes & Évolution', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('3. OBSERVATIONS ET SYMPTÔMES ENREGISTRÉS', 14, cursorY);
    cursorY += 3;

    const symptomRows = sortedSymptoms.slice(0, 10).map((s) => [
      s.date + (s.time ? ` à ${s.time}` : ''),
      s.symptomName,
      s.intensity,
      s.note || s.stateLabel || '—',
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Date / Heure', 'Symptôme', 'Intensité', 'Notes & Ressenti']],
      body: symptomRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLORS.textDark,
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35, fontStyle: 'bold' },
        2: { cellWidth: 25 },
        3: { cellWidth: 87 },
      },
      margin: { left: 14, right: 14 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 4. SECTION : ÉVOLUTION DU POIDS (Si disponible)
  if (sortedWeights.length > 0) {
    if (cursorY > 230) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Poids & Constantes', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('4. HISTORIQUE DES PESÉES & ÉVOLUTION DU POIDS', 14, cursorY);
    cursorY += 3;

    const weightRows = sortedWeights.slice(0, 8).map((w) => [
      w.date,
      `${w.weightKg} kg`,
      w.gestationalWeek ? `${w.gestationalWeek} SA` : '—',
      startingWeight ? `${(w.weightKg - startingWeight >= 0 ? '+' : '')}${(w.weightKg - startingWeight).toFixed(1)} kg` : '—',
      w.note || '—',
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Date', 'Poids', 'Terme (SA)', 'Évolution totale', 'Observations']],
      body: weightRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLORS.textDark,
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 26, fontStyle: 'bold' },
        2: { cellWidth: 28 },
        3: { cellWidth: 32 },
        4: { cellWidth: 68 },
      },
      margin: { left: 14, right: 14 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. SECTION : RENDEZ-VOUS & CONSULTATIONS MÉDICALES
  if (sortedAppointments.length > 0) {
    if (cursorY > 230) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Consultations', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('5. AGENDA & CONSULTATIONS MÉDICALES', 14, cursorY);
    cursorY += 3;

    const aptRows = sortedAppointments.slice(0, 8).map((a) => [
      a.date + (a.time ? ` (${a.time})` : ''),
      a.title,
      a.practitioner || '—',
      a.location || '—',
      a.status,
      a.notes || '—',
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Date / Heure', 'Motif / Consultation', 'Praticien', 'Lieu', 'Statut', 'Notes']],
      body: aptRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLORS.textDark,
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 38, fontStyle: 'bold' },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 22 },
        5: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 6. SECTION : EXAMENS ET RÉSULTATS MÉDICAUX
  if (sortedExams.length > 0) {
    if (cursorY > 230) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Examens & Résultats', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('6. EXAMENS MÉDICAUX & RÉSULTATS ENREGISTRÉS', 14, cursorY);
    cursorY += 3;

    const examRows = sortedExams.slice(0, 8).map((e) => [
      e.date,
      e.type,
      e.title,
      e.practitioner || e.facility || '—',
      e.status,
      e.results || e.resultOrRemarks || '—',
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Date', 'Type', 'Intitulé', 'Praticien / Lieu', 'Statut', 'Résultats / Remarques']],
      body: examRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primaryDark,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLORS.textDark,
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 26 },
        2: { cellWidth: 35, fontStyle: 'bold' },
        3: { cellWidth: 35 },
        4: { cellWidth: 22 },
        5: { cellWidth: 42 },
      },
      margin: { left: 14, right: 14 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 7. SECTION : TRAITEMENTS & ORDONNANCES ENREGISTRÉES
  if (prescriptions.length > 0) {
    if (cursorY > 230) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Ordonnances & Traitements', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('7. ORDONNANCES ET PRESCRIPTIONS VALIDÉES', 14, cursorY);
    cursorY += 3;

    const rxRows: string[][] = [];
    prescriptions.forEach((rx) => {
      rx.medications.forEach((med) => {
        rxRows.push([
          rx.date,
          rx.practitioner + (rx.facility ? ` (${rx.facility})` : ''),
          med.name,
          `${med.dosage} • ${med.duration}`,
          med.instructions || rx.generalInstructions || '—',
        ]);
      });
    });

    autoTable(doc, {
      startY: cursorY,
      head: [['Date', 'Prescripteur', 'Médicament / Traitement', 'Posologie & Durée', 'Instructions']],
      body: rxRows,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLORS.textDark,
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 38 },
        2: { cellWidth: 42, fontStyle: 'bold' },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 8. SECTION : INFORMATIONS BÉBÉ & JOURNAL DE BORD (Si disponibles)
  if (babyInfo || journalEntries.length > 0) {
    if (cursorY > 235) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Bébé & Journal', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('8. INFORMATIONS BÉBÉ & NOTES DU JOURNAL', 14, cursorY);
    cursorY += 4;

    if (babyInfo) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.textDark);
      const babyDetails = [
        babyInfo.nickname ? `Surnom : ${babyInfo.nickname}` : null,
        babyInfo.gender ? `Genre : ${babyInfo.gender}` : null,
        babyInfo.firstKicksDate ? `Premiers mouvements ressentis le : ${babyInfo.firstKicksDate}` : null,
        babyInfo.movementNotes ? `Activité fœtale : ${babyInfo.movementNotes}` : null,
      ]
        .filter(Boolean)
        .join('  •  ');

      if (babyDetails) {
        doc.text(babyDetails, 14, cursorY);
        cursorY += 6;
      }
    }

    if (journalEntries.length > 0) {
      const recentJournal = journalEntries.slice(0, 3);
      recentJournal.forEach((entry) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.primaryDark);
        doc.text(`[${entry.date}] ${entry.title}${entry.mood ? ` (Humeur : ${entry.mood})` : ''}`, 14, cursorY);
        cursorY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.textDark);
        const wrappedContent = doc.splitTextToSize(entry.content, 182);
        doc.text(wrappedContent, 14, cursorY);
        cursorY += wrappedContent.length * 3.8 + 2;
      });
    }
  }

  // 9. SECTION : CHECKLIST & RAPPELS (Si présents)
  if (checklist.length > 0 || reminders.length > 0) {
    if (cursorY > 240) {
      doc.addPage();
      drawHeader(doc, 'DOSSIER MÉDICAL DE SUIVI', 'Préparations & Rappels', logoBase64);
      cursorY = 34;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.primary);
    doc.text('9. PRÉPARATIONS MATERNITÉ & RAPPELS', 14, cursorY);
    cursorY += 4;

    if (checklist.length > 0) {
      const completedCount = checklist.filter((c) => c.completed).length;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        `Checklist maternité : ${completedCount}/${checklist.length} tâche(s) complétée(s).`,
        14,
        cursorY
      );
      cursorY += 5;
    }

    if (reminders.length > 0) {
      const activeReminders = reminders.filter((r) => r.isActive);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.textDark);
      doc.text(
        `Rappels actifs : ${activeReminders.map((r) => `${r.title} (${r.time})`).join(', ')}`,
        14,
        cursorY
      );
      cursorY += 5;
    }
  }

  // Apply footer on ALL pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, generatedDateStr);
  }

  const fileName = `MAMAN_PLUS_Rapport_Grossesse_${patientFullName.replace(/\s+/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    doc,
    fileName,
    blobUrl,
    totalPages,
  };
}

/**
 * Generates and downloads the full Pregnancy Medical Report PDF.
 */
export async function generatePregnancyReportPdf(data: PregnancyReportData): Promise<string> {
  const { doc, fileName } = await buildPregnancyReportDoc(data);
  doc.save(fileName);
  return fileName;
}

/**
 * Builds the official Prescription jsPDF document and returns doc, fileName, and blobUrl.
 */
export async function buildPrescriptionDoc(
  prescription: Prescription,
  currentUser: User | null
): Promise<{ doc: jsPDF; fileName: string; blobUrl: string; totalPages: number }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const patientFullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Patiente MAMAN+';

  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  // Load real MAMAN+ logo
  const logoBase64 = await getLogoBase64();

  // Top Accent Bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Brand Header with Real Logo / Emblem
  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(16, 9, 17, 17, 3, 3, 'F');
      doc.addImage(logoBase64, 'JPEG', 16, 9, 17, 17);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.4);
      doc.roundedRect(16, 9, 17, 17, 3, 3, 'D');
    } catch {
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(16, 12, 13, 13, 2.5, 2.5, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('M+', 18, 21);
    }
  } else {
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(16, 12, 13, 13, 2.5, 2.5, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('M+', 18, 21);
  }

  doc.setTextColor(...COLORS.textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MAMAN', 37, 21);

  doc.setTextColor(...COLORS.primary);
  doc.text('+', 65, 21);

  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Maternité & Santé', 37, 26.5);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text('ORDONNANCE', pageWidth - 16, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Réf : ${prescription.id.toUpperCase()}`, pageWidth - 16, 27.5, { align: 'right' });

  // Divider
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.6);
  doc.line(16, 33, pageWidth - 16, 33);

  let cursorY = 40;

  // 1. PRACTITIONER & FACILITY BLOCK (Left)
  doc.setFillColor(...COLORS.bgWarm);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(16, cursorY, 86, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('MÉDECIN / PROFESSIONNEL :', 21, cursorY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textDark);
  doc.text(prescription.practitioner, 21, cursorY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  if (prescription.practitionerRole) {
    doc.text(prescription.practitionerRole, 21, cursorY + 21);
  }
  if (prescription.facility) {
    doc.text(prescription.facility, 21, cursorY + 27);
  }

  // 2. PATIENT BLOCK (Right)
  doc.setFillColor(...COLORS.bgWarm);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(108, cursorY, 86, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('PATIENTE :', 113, cursorY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textDark);
  doc.text(patientFullName, 113, cursorY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Date d'émission : ${prescription.date}`, 113, cursorY + 21);

  if (gestational) {
    doc.text(`Terme de grossesse : ${gestational.weeksSA} SA (${gestational.trimester}e trimestre)`, 113, cursorY + 27);
  }

  cursorY += 45;

  // 3. PRESCRIPTION SECTION HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text('PRESCRIPTION :', 16, cursorY);

  cursorY += 4;

  // Medications Table
  const medRows = prescription.medications.map((med, index) => [
    `${index + 1}`,
    med.name,
    med.dosage,
    med.duration,
    med.instructions || '—',
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['N°', 'Médicament / Traitement', 'Posologie', 'Durée', 'Instructions de prise']],
    body: medRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: COLORS.textDark,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 44 },
    },
    margin: { left: 16, right: 16 },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 10;

  // 4. GENERAL INSTRUCTIONS (if any)
  if (prescription.generalInstructions) {
    doc.setFillColor(...COLORS.primaryLight);
    doc.setDrawColor(...COLORS.primary);
    doc.roundedRect(16, cursorY, 178, 20, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.primaryDark);
    doc.text('Instructions complémentaires du praticien :', 21, cursorY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.textDark);
    doc.text(prescription.generalInstructions, 21, cursorY + 14, { maxWidth: 168 });

    cursorY += 28;
  }

  // 5. SIGNATURE & STAMP BOX (Cadre officiel du praticien)
  const sigBoxY = Math.max(cursorY + 5, pageHeight - 82);
  doc.setFillColor(...COLORS.bgWarm);
  doc.setDrawColor(...COLORS.primaryDark);
  doc.setLineWidth(0.6);
  doc.roundedRect(105, sigBoxY, 89, 42, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.primary);
  doc.text('CADRE RÉSERVÉ AU PRATICIEN', 110, sigBoxY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Fait à ${prescription.facility || 'Cabinet médical'}, le ${prescription.date}`, 110, sigBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Dr. ${prescription.practitioner.replace(/^Dr\.?\s*/i, '')}`, 110, sigBoxY + 17.5);

  if (prescription.practitionerRole) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(prescription.practitionerRole, 110, sigBoxY + 22);
  }

  // Stamp / Signature placeholder box
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(110, sigBoxY + 25, 79, 13.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Signature & Cachet professionnel du prescripteur', 149.5, sigBoxY + 33, { align: 'center' });

  // Mandatory footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(
    'Document A4 officiel généré à partir des informations enregistrées dans MAMAN+.',
    16,
    pageHeight - 20
  );

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    'MAMAN+ ne modifie ni n’invente aucun médicament. Seules les indications délivrées par votre praticien font foi.',
    16,
    pageHeight - 15
  );

  // Apply standard A4 footer on ALL pages
  const totalPages = doc.getNumberOfPages();
  const dateFormatted = new Date().toLocaleDateString('fr-FR');
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, dateFormatted);
  }

  const fileName = `MAMAN_PLUS_Ordonnance_${prescription.practitioner.replace(/\s+/g, '_')}_${prescription.date}.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    doc,
    fileName,
    blobUrl,
    totalPages,
  };
}

/**
 * Generates and downloads an official Prescription PDF.
 */
export async function generatePrescriptionPdf(
  prescription: Prescription,
  currentUser: User | null
): Promise<string> {
  const { doc, fileName } = await buildPrescriptionDoc(prescription, currentUser);
  doc.save(fileName);
  return fileName;
}

/**
 * Builds the complete MAMAN+ User Guide (Guide d'utilisation) as a multi-page A4 document.
 */
export async function buildUserGuideDoc(
  currentUser: User | null
): Promise<{ doc: jsPDF; fileName: string; blobUrl: string; totalPages: number }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const contentWidth = pageWidth - 28; // 182mm (margins: 14mm left & right)

  const logoBase64 = await getLogoBase64();
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  const patientName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.email ||
    'Chère Future Maman';

  // ==========================================
  // PAGE 1: LUXURY OFFICIAL COVER
  // ==========================================

  // Top elegant burgundy band
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 12, 'F');

  // Secondary gold fine line
  doc.setFillColor(...COLORS.amber);
  doc.rect(0, 12, pageWidth, 1.2, 'F');

  // Background subtle warm tone for cover
  doc.setFillColor(...COLORS.bgWarm);
  doc.rect(14, 20, contentWidth, pageHeight - 34, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.6);
  doc.roundedRect(14, 20, contentWidth, pageHeight - 34, 4, 4, 'D');

  // Official Logo / Emblem centered
  const logoY = 32;
  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth / 2 - 14, logoY, 28, 28, 4, 4, 'F');
      doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 14, logoY, 28, 28);
      doc.setDrawColor(...COLORS.amber);
      doc.setLineWidth(0.8);
      doc.roundedRect(pageWidth / 2 - 14, logoY, 28, 28, 4, 4, 'D');
    } catch {
      // Fallback
    }
  }

  // App Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.textDark);
  doc.text('MAMAN', pageWidth / 2 - 4, logoY + 38, { align: 'right' });
  doc.setTextColor(...COLORS.primary);
  doc.text('+', pageWidth / 2 + 1, logoY + 38, { align: 'left' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.amber);
  doc.text('MATERNITÉ & SANTÉ • SUIVI CLINIQUE BIENVEILLANT', pageWidth / 2, logoY + 44, {
    align: 'center',
  });

  // Main Guide Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text('GUIDE OFFICIEL D’UTILISATION', pageWidth / 2, logoY + 56, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(
    'Manuel complet pas à pas pour accompagner votre grossesse en toute sérénité',
    pageWidth / 2,
    logoY + 63,
    { align: 'center' }
  );

  // Badge pill
  doc.setFillColor(...COLORS.primaryLight);
  doc.roundedRect(pageWidth / 2 - 48, logoY + 70, 96, 7.5, 3.5, 3.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.primary);
  doc.text(
    '17 MODULES EXPLICITÉS • FORMAT A4 IMPRIMABLE • CONSEILS SAGES-FEMMES',
    pageWidth / 2,
    logoY + 75,
    { align: 'center' }
  );

  // Beneficiary Card Box
  const cardY = logoY + 84;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(24, cardY, contentWidth - 20, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.amber);
  doc.text('EXEMPLAIRE PERSONNEL DE SUIVI', 30, cardY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textDark);
  doc.text(patientName, 30, cardY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  const termText = gestational ? `Terme actuel : ${gestational.weeksSA} SA` : 'Grossesse en cours';
  doc.text(`${termText}  •  Édition officielle générée le ${dateFormatted}`, 30, cardY + 20);

  // Table of Contents (Sommaire) Box
  const tocY = cardY + 31;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(24, tocY, contentWidth - 20, 84, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('SOMMAIRE DU GUIDE PRATIQUE', 30, tocY + 8);

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.4);
  doc.line(30, tocY + 11, pageWidth - 30, tocY + 11);

  const tocSections = [
    {
      part: 'PARTIE I • PILOTAGE & ÉVOLUTION QUOTIDIENNE',
      items: 'Tableau de bord (01) • Ma grossesse (02) • Bébé (03) • Calendrier (04)',
    },
    {
      part: 'PARTIE II • SANTÉ CLINIQUE & SUIVI MÉDICAL',
      items: 'Rendez-vous (05) • Symptômes (06) • Poids (07) • Examens (08) • Mon ordonnance (12)',
    },
    {
      part: 'PARTIE III • ORGANISATION & BIEN-ÊTRE PERSONNEL',
      items: 'Journal intime (09) • Checklist maternité (10) • Rappels (11) • Notifications (13)',
    },
    {
      part: 'PARTIE IV • OUTILS AVANCÉS, IA & CONFIGURATION',
      items: 'Rapport de suivi PDF (14) • Assistant IA (15) • Profil médical (16) • Paramètres (17)',
    },
  ];

  let currentTocY = tocY + 18;
  tocSections.forEach((sec, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.primaryDark);
    doc.text(sec.part, 30, currentTocY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(sec.items, 30, currentTocY + 4.5);

    currentTocY += 16;
  });

  // Bottom Medical Notice Box on Cover
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    'MAMAN+ est un outil de soutien et d’organisation médicale. Il ne remplace en aucun cas l’avis de votre médecin ou sage-femme.',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' }
  );

  // ==========================================
  // PAGES 2+: DETAILED FEATURES (17 MODULES)
  // ==========================================

  // Group features into logical sections
  const sections = [
    {
      title: 'PARTIE I • PILOTAGE & ÉVOLUTION QUOTIDIENNE',
      subtitle: 'Comprendre et vivre chaque jour de votre grossesse pas à pas',
      featureIds: ['dashboard', 'pregnancy', 'baby', 'calendar'],
    },
    {
      title: 'PARTIE II • SANTÉ CLINIQUE & SUIVI MÉDICAL',
      subtitle: 'Mesures, biométrie, examens biologiques et ordonnances',
      featureIds: ['appointments', 'symptoms', 'weight', 'exams', 'prescriptions'],
    },
    {
      title: 'PARTIE III • ORGANISATION & BIEN-ÊTRE PERSONNEL',
      subtitle: 'Mémoire émotionnelle, préparatifs de la valise et rappels de santé',
      featureIds: ['journal', 'checklist', 'reminders', 'notifications'],
    },
    {
      title: 'PARTIE IV • OUTILS AVANCÉS, IA & CONFIGURATION',
      subtitle: 'Dossier clinique A4, intelligence artificielle et gestion sécurisée',
      featureIds: ['report', 'assistant', 'profile', 'settings'],
    },
  ];

  let currentY = 36;

  function ensurePageSpace(neededHeight: number, sectionTitle?: string, sectionSubtitle?: string) {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      drawHeader(
        doc,
        'GUIDE D’UTILISATION',
        sectionSubtitle || 'MAMAN+ • Maternité & Santé',
        logoBase64
      );
      currentY = 36;
      if (sectionTitle) {
        drawSectionTitle(sectionTitle, sectionSubtitle || '');
      }
    }
  }

  function drawSectionTitle(title: string, subtitle: string) {
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(14, currentY, contentWidth, 11, 2, 2, 'F');
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, currentY, contentWidth, 11, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.primary);
    doc.text(title, 18, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(subtitle, 18, currentY + 9.2);

    currentY += 15;
  }

  // Iterate over sections
  for (const section of sections) {
    doc.addPage();
    drawHeader(doc, 'GUIDE D’UTILISATION', section.subtitle, logoBase64);
    currentY = 34;

    drawSectionTitle(section.title, section.subtitle);

    const featuresInSection = USER_GUIDE_FEATURES.filter((f) =>
      section.featureIds.includes(f.id)
    );

    for (const feat of featuresInSection) {
      // Calculate height needed for this feature block
      const purposeLines = doc.splitTextToSize(feat.purpose, contentWidth - 12);
      const howToUseLines = doc.splitTextToSize(feat.howToUse, contentWidth - 12);
      const viewEditLines = doc.splitTextToSize(feat.viewAndEdit, contentWidth - 12);
      const proTipLines = doc.splitTextToSize(feat.proTip, contentWidth - 18);

      const estimatedHeight =
        14 + // header
        purposeLines.length * 3.5 +
        7 + // purpose
        howToUseLines.length * 3.5 +
        7 + // howToUse
        feat.recordableInfo.length * 3.8 +
        6 + // recordable
        viewEditLines.length * 3.5 +
        6 + // viewEdit
        feat.keyActions.length * 3.8 +
        6 + // keyActions
        proTipLines.length * 3.5 +
        12; // proTip box + margin

      ensurePageSpace(estimatedHeight, section.title, section.subtitle);

      const startY = currentY;

      // Card Header Banner
      doc.setFillColor(...COLORS.bgWarm);
      doc.roundedRect(14, startY, contentWidth, 10, 2, 2, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.4);
      doc.roundedRect(14, startY, contentWidth, 10, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.primaryDark);
      const numFormatted = feat.number < 10 ? `0${feat.number}` : `${feat.number}`;
      doc.text(`${numFormatted}.  ${feat.name}`, 18, startY + 6.5);

      // Pill badge on right
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 56, startY + 2, 40, 6, 2, 2, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(pageWidth - 56, startY + 2, 40, 6, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.amber);
      doc.text(feat.badge.toUpperCase(), pageWidth - 36, startY + 6, { align: 'center' });

      currentY += 13;

      // 1. À quoi elle sert
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('• À quoi elle sert :', 16, currentY);
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textDark);
      doc.text(purposeLines, 16, currentY);
      currentY += purposeLines.length * 3.5 + 2;

      // 2. Comment l'utiliser
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('• Comment l’utiliser :', 16, currentY);
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textDark);
      doc.text(howToUseLines, 16, currentY);
      currentY += howToUseLines.length * 3.5 + 2;

      // 3. Informations enregistrables
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('• Ce que vous pouvez enregistrer :', 16, currentY);
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textDark);
      for (const info of feat.recordableInfo) {
        doc.text(`- ${info}`, 18, currentY);
        currentY += 3.5;
      }
      currentY += 1.5;

      // 4. Consulter & modifier
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('• Consulter et modifier ses données :', 16, currentY);
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textDark);
      doc.text(viewEditLines, 16, currentY);
      currentY += viewEditLines.length * 3.5 + 2;

      // 5. Actions importantes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.primary);
      doc.text('• Actions importantes disponibles :', 16, currentY);
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textDark);
      for (const act of feat.keyActions) {
        doc.text(`✔  ${act}`, 18, currentY);
        currentY += 3.5;
      }
      currentY += 1.5;

      // 6. Conseil pratique / Sage-femme Box
      const tipBoxHeight = proTipLines.length * 3.5 + 6;
      doc.setFillColor(...COLORS.amberLight);
      doc.roundedRect(16, currentY, contentWidth - 4, tipBoxHeight, 2, 2, 'F');
      doc.setDrawColor(...COLORS.amber);
      doc.setLineWidth(0.3);
      doc.roundedRect(16, currentY, contentWidth - 4, tipBoxHeight, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.amber);
      doc.text('Conseil Sage-Femme :', 20, currentY + 4.5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textDark);
      doc.text(proTipLines, 20, currentY + 8);

      currentY += tipBoxHeight + 6;

      // Outer bounding box for feature
      const blockTotalHeight = currentY - startY;
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, startY, contentWidth, blockTotalHeight, 2.5, 2.5, 'D');

      currentY += 4;
    }
  }

  // ==========================================
  // APPLY FOOTER ON ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      drawFooter(doc, i, totalPages, dateFormatted);
    } else {
      // Cover page footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`Page 1 / ${totalPages}`, pageWidth - 14, pageHeight - 8.5, { align: 'right' });
      doc.text(
        'MAMAN+ • Guide Officiel d’Utilisation • Édition Certifiée 2026',
        14,
        pageHeight - 8.5
      );
    }
  }

  const fileName = `MAMAN_PLUS_Guide_Utilisation_Officiel_${now.getFullYear()}.pdf`;
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    doc,
    fileName,
    blobUrl,
    totalPages,
  };
}

/**
 * Generates and triggers download of the official MAMAN+ User Guide PDF.
 */
export async function generateUserGuidePdf(currentUser: User | null): Promise<string> {
  const { doc, fileName } = await buildUserGuideDoc(currentUser);
  doc.save(fileName);
  return fileName;
}

