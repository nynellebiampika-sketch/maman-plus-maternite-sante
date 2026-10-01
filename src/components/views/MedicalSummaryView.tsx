import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Heart,
  Scale,
  Activity,
  User,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Pill,
  Smile,
  BookOpen,
  ArrowRight,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { calculateGestationalStatus } from '../../services/storage';
import { generatePregnancyReportPdf, buildPregnancyReportDoc } from '../../services/pdfGenerator';
import { PageWrapper } from './PageWrapper';
import { PdfPreviewModal } from '../PdfPreviewModal';
import { Eye } from 'lucide-react';

interface MedicalSummaryViewProps {
  onNavigate?: (route: string) => void;
}

export const MedicalSummaryView: React.FC<MedicalSummaryViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    symptomLogs,
    weightEntries,
    appointments,
    exams,
    prescriptions,
    babyInfo,
    journalEntries,
    reminders,
    checklist,
  } = useUserData();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('MAMAN_PLUS_Rapport_Grossesse.pdf');
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);

  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  const patientFullName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.displayName ||
    'Patiente MAMAN+';

  // Chronological sorting
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

  // Weight stats
  const startingWeight = currentUser?.prePregnancyWeightKg;
  const latestWeight = sortedWeights[0]?.weightKg;
  const totalWeightGain =
    startingWeight && latestWeight ? (latestWeight - startingWeight).toFixed(1) : null;

  // Points to discuss with practitioner
  const intenseSymptoms = sortedSymptoms.filter(
    (s) => s.intensity === 'Intense' || s.intensity === 'Modérée'
  );
  const pendingExams = sortedExams.filter(
    (e) => e.status === 'En attente' || e.status === 'En attente de résultats' || e.status === 'À planifier'
  );
  const upcomingAppointments = sortedAppointments.filter(
    (a) => a.status === 'À venir' || a.status === 'Confirmé'
  );

  const handleOpenPdfPreview = async () => {
    setIsGeneratingPdf(true);
    setIsPreviewModalOpen(true);
    try {
      const { fileName, blobUrl, totalPages } = await buildPregnancyReportDoc({
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
      });
      setPdfBlobUrl(blobUrl);
      setPdfFileName(fileName);
      setPdfTotalPages(totalPages);
    } catch (err) {
      console.error('Erreur lors de la génération du rapport PDF :', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await generatePregnancyReportPdf({
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
      });
    } catch (err) {
      console.error('Erreur lors de la génération du rapport PDF :', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    handleOpenPdfPreview();
  };

  return (
    <PageWrapper id="view-medical-summary">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Dossier Médical</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Synthèse du suivi
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Vue clinique consolidée pour préparer vos consultations avec votre sage-femme ou médecin gynécologue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="preview-medical-summary-pdf-btn"
            onClick={handleOpenPdfPreview}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF5EC] hover:bg-[#F3EFE9] border border-[#EEDDC6] text-[#8C5E24] text-[13.5px] font-semibold shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#8C5E24]" />
            <span>Aperçu du rapport</span>
          </button>

          <button
            type="button"
            id="download-medical-summary-pdf-btn"
            onClick={handleOpenPdfPreview}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13.5px] font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Génération du PDF...' : 'Télécharger mon rapport (PDF)'}</span>
          </button>

          <button
            type="button"
            id="print-medical-summary-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DDD5] text-[#3E3834] text-[13px] font-medium transition-all shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#69625A]" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </div>

      {/* MANDATORY LEGAL MEDICAL DISCLAIMER BANNER */}
      <div
        id="medical-summary-disclaimer"
        className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EC] border border-[#EEDDC6] flex items-start gap-3.5 text-[#6D4412]"
      >
        <ShieldAlert className="w-5 h-5 text-[#8C5E24] shrink-0 mt-0.5" />
        <div className="text-[13px] sm:text-[13.5px] leading-relaxed">
          <span className="font-bold block text-[#5A380E] mb-0.5">
            Avertissement légal et déontologique
          </span>
          <p>
            Ce document résume les informations enregistrées dans MAMAN+. Il ne remplace pas l’avis d’un professionnel de santé.
          </p>
        </div>
      </div>

      {/* PATIENT & GESTATIONAL IDENTITY CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F5F2EC] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEECEC] border border-[#FCD4D4] flex items-center justify-center text-[#9E2A2B] font-serif font-bold text-lg">
              {currentUser?.firstName?.charAt(0) || 'M'}
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#1E1B18]">{patientFullName}</h2>
              <p className="text-[12.5px] text-[#69625A]">{currentUser?.email || 'Patiente MAMAN+'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {gestational ? (
              <div className="px-3 py-1.5 rounded-full bg-[#E7F8ED] border border-[#C5EAD0] text-[#1E653A] text-[12px] font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#1E653A]" />
                <span>{gestational.badgeLabel}</span>
              </div>
            ) : (
              <span className="text-[12px] text-[#8C847D] italic">Terme non configuré</span>
            )}

            {currentUser?.dueDate && (
              <div className="px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-[#4A443E] text-[12px] font-medium">
                DPA :{' '}
                <strong>
                  {new Date(currentUser.dueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px]">
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5]">
            <span className="text-[#8C847D] block text-[11px] uppercase font-semibold">Dernières règles (DDR)</span>
            <span className="font-bold text-[#1E1B18] mt-0.5 block">
              {currentUser?.lastMenstrualPeriodDate
                ? new Date(currentUser.lastMenstrualPeriodDate).toLocaleDateString('fr-FR')
                : 'Non renseigné'}
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5]">
            <span className="text-[#8C847D] block text-[11px] uppercase font-semibold">Poids de départ</span>
            <span className="font-bold text-[#1E1B18] mt-0.5 block">
              {startingWeight ? `${startingWeight} kg` : 'Non renseigné'}
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5]">
            <span className="text-[#8C847D] block text-[11px] uppercase font-semibold">Poids actuel</span>
            <span className="font-bold text-[#1E1B18] mt-0.5 block">
              {latestWeight ? `${latestWeight} kg` : 'Aucune pesée'}
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5]">
            <span className="text-[#8C847D] block text-[11px] uppercase font-semibold">Variation pondérale</span>
            <span
              className={`font-bold mt-0.5 block ${
                totalWeightGain && Number(totalWeightGain) > 0
                  ? 'text-[#1E653A]'
                  : 'text-[#1E1B18]'
              }`}
            >
              {totalWeightGain !== null
                ? `${Number(totalWeightGain) >= 0 ? '+' : ''}${totalWeightGain} kg`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION : ÉLÉMENTS À DISCUTER AVEC LE PROFESSIONNEL */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-[16px] text-[#1E1B18]">
              Éléments à aborder lors de la consultation
            </h2>
            <p className="text-[12px] text-[#69625A]">
              Synthèse neutre des saisies récentes pour faciliter le dialogue avec votre praticien.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {intenseSymptoms.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-start gap-2.5 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#9E2A2B] mt-1.5 shrink-0" />
              <div>
                <strong className="text-[#1E1B18]">Symptômes signalés d'intensité modérée à intense : </strong>
                <span className="text-[#4A443E]">
                  {Array.from(new Set(intenseSymptoms.map((s) => s.symptomName))).join(', ')} (consulter les détails ci-après).
                </span>
              </div>
            </div>
          )}

          {pendingExams.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-start gap-2.5 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#8C5E24] mt-1.5 shrink-0" />
              <div>
                <strong className="text-[#1E1B18]">Examens ou bilans en attente : </strong>
                <span className="text-[#4A443E]">
                  {pendingExams.map((e) => e.title).join(', ')}.
                </span>
              </div>
            </div>
          )}

          {upcomingAppointments.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-start gap-2.5 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#1E653A] mt-1.5 shrink-0" />
              <div>
                <strong className="text-[#1E1B18]">Prochain rendez-vous prévu : </strong>
                <span className="text-[#4A443E]">
                  {upcomingAppointments[0].title} le{' '}
                  {new Date(upcomingAppointments[0].date).toLocaleDateString('fr-FR')}{' '}
                  {upcomingAppointments[0].time && `à ${upcomingAppointments[0].time}`}
                  {upcomingAppointments[0].practitioner && ` avec ${upcomingAppointments[0].practitioner}`}
                </span>
              </div>
            </div>
          )}

          {intenseSymptoms.length === 0 && pendingExams.length === 0 && (
            <div className="p-3.5 rounded-xl bg-[#E7F8ED] border border-[#C5EAD0] text-[#1E653A] text-[13px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Aucune alerte spécifique ou symptôme intense enregistré sur les derniers jours. Poursuivre le suivi habituel.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMNS: WEIGHT AND SYMPTOMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card: Évolution du poids */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#9E2A2B]" />
              <h2 className="font-bold text-[15px] text-[#1E1B18]">Évolution du poids</h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/suivi-poids')}
                className="text-[12px] text-[#9E2A2B] font-semibold hover:underline"
              >
                Gérer mes pesées
              </button>
            )}
          </div>

          {sortedWeights.length === 0 ? (
            <p className="text-[13px] text-[#8C847D] italic py-2">
              Aucune pesée enregistrée pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-[#F0ECE5] text-[#8C847D]">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Poids (kg)</th>
                    <th className="pb-2 font-semibold">Semaine</th>
                    <th className="pb-2 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F7F4]">
                  {sortedWeights.slice(0, 5).map((w) => (
                    <tr key={w.id} className="text-[#2C2825]">
                      <td className="py-2.5 font-medium">
                        {new Date(w.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-2.5 font-bold text-[#1E1B18]">{w.weightKg} kg</td>
                      <td className="py-2.5 text-[#69625A]">
                        {w.gestationalWeek ? `${w.gestationalWeek} SA` : '—'}
                      </td>
                      <td className="py-2.5 text-[#69625A] max-w-[120px] truncate">
                        {w.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card: Symptômes consignés */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#9E2A2B]" />
              <h2 className="font-bold text-[15px] text-[#1E1B18]">Derniers symptômes consignés</h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/symptomes')}
                className="text-[12px] text-[#9E2A2B] font-semibold hover:underline"
              >
                Voir l'historique
              </button>
            )}
          </div>

          {sortedSymptoms.length === 0 ? (
            <p className="text-[13px] text-[#8C847D] italic py-2">
              Aucun symptôme consigné pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-[#F0ECE5] text-[#8C847D]">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Symptôme</th>
                    <th className="pb-2 font-semibold">Intensité</th>
                    <th className="pb-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F7F4]">
                  {sortedSymptoms.slice(0, 5).map((s) => (
                    <tr key={s.id} className="text-[#2C2825]">
                      <td className="py-2.5 font-medium">{s.date}</td>
                      <td className="py-2.5 font-bold text-[#1E1B18]">{s.symptomName}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            s.intensity === 'Intense'
                              ? 'bg-[#FEECEC] text-[#9E2A2B]'
                              : s.intensity === 'Modérée'
                              ? 'bg-[#FAF5EC] text-[#8C5E24]'
                              : 'bg-[#E7F8ED] text-[#1E653A]'
                          }`}
                        >
                          {s.intensity}
                        </span>
                      </td>
                      <td className="py-2.5 text-[#69625A] max-w-[120px] truncate">
                        {s.note || s.stateLabel || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMNS: EXAMS AND PRESCRIPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card: Examens & Bilans */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9E2A2B]" />
              <h2 className="font-bold text-[15px] text-[#1E1B18]">Examens médicaux & Résultats</h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/examens')}
                className="text-[12px] text-[#9E2A2B] font-semibold hover:underline"
              >
                Tous les examens
              </button>
            )}
          </div>

          {sortedExams.length === 0 ? (
            <p className="text-[13px] text-[#8C847D] italic py-2">
              Aucun examen ou bilan médical enregistré.
            </p>
          ) : (
            <div className="space-y-2.5">
              {sortedExams.slice(0, 4).map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5] text-[12.5px] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#1E1B18]">{exam.title}</span>
                    <span
                      className={`text-[10.5px] px-2 py-0.5 rounded-full font-semibold ${
                        exam.status === 'Effectué'
                          ? 'bg-[#E7F8ED] text-[#1E653A]'
                          : 'bg-[#FAF5EC] text-[#8C5E24]'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#69625A] text-[11.5px]">
                    <span>
                      {new Date(exam.date).toLocaleDateString('fr-FR')} • {exam.type}
                    </span>
                    <span>{exam.practitioner || exam.facility || ''}</span>
                  </div>
                  {(exam.results || exam.resultOrRemarks) && (
                    <p className="text-[#3E3834] bg-white p-2 rounded-lg border border-[#EAE6DF] mt-1 text-[12px] line-clamp-2">
                      {exam.results || exam.resultOrRemarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card: Ordonnances & Prescriptions */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#9E2A2B]" />
              <h2 className="font-bold text-[15px] text-[#1E1B18]">Ordonnances & Traitements</h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/mon-ordonnance')}
                className="text-[12px] text-[#9E2A2B] font-semibold hover:underline"
              >
                Gérer les ordonnances
              </button>
            )}
          </div>

          {prescriptions.length === 0 ? (
            <p className="text-[13px] text-[#8C847D] italic py-2">
              Aucune ordonnance enregistrée.
            </p>
          ) : (
            <div className="space-y-2.5">
              {prescriptions.slice(0, 3).map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5] text-[12.5px] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#1E1B18]">Dr. {rx.practitioner}</span>
                    <span className="text-[11px] text-[#8C847D]">
                      {new Date(rx.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {rx.medications.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-baseline justify-between text-[12px] text-[#3E3834]"
                      >
                        <span className="font-semibold">{med.name}</span>
                        <span className="text-[#69625A]">
                          {med.dosage} ({med.duration})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* APPOINTMENTS & BABY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rendez-vous */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#9E2A2B]" />
              <h2 className="font-bold text-[15px] text-[#1E1B18]">Consultations & Rendez-vous</h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/rendez-vous')}
                className="text-[12px] text-[#9E2A2B] font-semibold hover:underline"
              >
                Agenda complet
              </button>
            )}
          </div>

          {sortedAppointments.length === 0 ? (
            <p className="text-[13px] text-[#8C847D] italic py-2">
              Aucun rendez-vous médical enregistré.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedAppointments.slice(0, 4).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5] text-[12.5px]"
                >
                  <div>
                    <span className="font-bold text-[#1E1B18] block">{apt.title}</span>
                    <span className="text-[#69625A] text-[11.5px]">
                      {apt.practitioner ? `Avec ${apt.practitioner}` : ''}
                      {apt.location ? ` • ${apt.location}` : ''}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-[#1E1B18] block">
                      {new Date(apt.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-[11px] text-[#8C847D]">{apt.time || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bébé & Notes de bord */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#9E2A2B]" />
              <h2 className="font-bold text-[15px] text-[#1E1B18]">Bébé & Journal de bord</h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/bebe')}
                className="text-[12px] text-[#9E2A2B] font-semibold hover:underline"
              >
                Espace Bébé
              </button>
            )}
          </div>

          {babyInfo ? (
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5] text-[12.5px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1E1B18]">
                  {babyInfo.nickname ? `Surnom : ${babyInfo.nickname}` : 'Bébé'}
                </span>
                {babyInfo.gender && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#EAE6DF] text-[#69625A]">
                    {babyInfo.gender}
                  </span>
                )}
              </div>
              {babyInfo.firstKicksDate && (
                <p className="text-[#69625A] text-[12px]">
                  Premiers mouvements : {babyInfo.firstKicksDate}
                </p>
              )}
              {babyInfo.movementNotes && (
                <p className="text-[#3E3834] text-[12px] italic pt-1">
                  « {babyInfo.movementNotes} »
                </p>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-[#8C847D] italic py-1">
              Informations du bébé non renseignées.
            </p>
          )}

          {journalEntries.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider block">
                Dernière note de journal :
              </span>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5] text-[12.5px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1E1B18]">{journalEntries[0].title}</span>
                  <span className="text-[11px] text-[#8C847D]">{journalEntries[0].date}</span>
                </div>
                <p className="text-[#554F49] text-[12px] line-clamp-2">
                  {journalEntries[0].content}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF PREVIEW MODAL */}
      <PdfPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Dossier Médical de Suivi de Grossesse"
        subtitle={`Synthèse clinique A4 • ${patientFullName} • ${gestational ? `${gestational.weeksSA} SA` : 'Grossesse'}`}
        blobUrl={pdfBlobUrl}
        fileName={pdfFileName}
        totalPages={pdfTotalPages}
        isLoading={isGeneratingPdf}
        onDownload={handleDownloadPdf}
      />
    </PageWrapper>
  );
};
