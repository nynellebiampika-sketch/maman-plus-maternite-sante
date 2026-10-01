import React, { memo, useState } from 'react';
import { Heart, Activity, TrendingUp, Calendar, BookOpen, Download, Stethoscope, Eye } from 'lucide-react';
import { ScrollReveal } from '../ScrollAnimation';
import { SymptomCardSection } from '../SymptomCardSection';
import { RadarCard } from '../RadarCard';
import { HistoryCard } from '../HistoryCard';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { calculateGestationalStatus } from '../../services/storage';
import { generatePregnancyReportPdf, buildPregnancyReportDoc } from '../../services/pdfGenerator';
import { PdfPreviewModal } from '../PdfPreviewModal';

interface DashboardHomeViewProps {
  onNavigate: (path: string) => void;
}

/**
 * DashboardHomeView component memoized with React.memo to prevent
 * redundant re-renders of all telemetry and cards during navigation.
 */
export const DashboardHomeView: React.FC<DashboardHomeViewProps> = memo(({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    isLoading: isDataLoading,
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

  // Calculate real gestational status from profile
  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  const patientFullName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.displayName ||
    'Patiente MAMAN+';

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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Title & Navigation Row */}
      <ScrollReveal direction="down" durationMs={500}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
          {/* Left: Gestational Badge, Main Title & Subtitle */}
          <div className="space-y-1.5 max-w-2xl">
            {gestational ? (
              <div
                id="gestational-week-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7F0DF] border border-[#C5EAD0] text-[#1E653A] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs transition-all duration-200"
              >
                <Heart className="w-3 h-3 text-[#1E653A] stroke-[2.2]" />
                <span>{gestational.badgeLabel}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('/profil')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-medium hover:bg-[#F6EEDF] hover:-translate-y-[0.5px] transition-all cursor-pointer"
              >
                <Heart className="w-3 h-3 text-[#8C5E24]" />
                <span>Renseigner ma date de terme ou DDR</span>
              </button>
            )}

            {/* H1 Main Title */}
            <h1 className="font-serif text-[26px] sm:text-[30px] lg:text-[34px] font-bold text-[#1E1B18] tracking-tight leading-tight">
              Santé & Bien-être de Maman
            </h1>

            {/* Subtitle */}
            <p className="text-[13px] sm:text-[14.5px] text-[#69625A] font-normal leading-relaxed">
              Écoutez votre corps, suivez vos constantes vitales et préparez sereinement chaque
              étape clinique de votre maternité.
            </p>
          </div>

          {/* Right: Segmented Capsule Navigation leading directly to dedicated routes */}
          <div
            id="top-segmented-nav"
            className="self-start lg:self-end flex items-center bg-[#ECE8E1]/80 p-1 rounded-full border border-[#E0DBD2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-x-auto max-w-full"
          >
            <button
              type="button"
              id="tab-symptomes"
              onClick={() => onNavigate('/symptomes')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-medium text-[#4A453F] hover:text-[#1E1B18] hover:bg-white/60 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              <span>Symptômes du Jour</span>
            </button>

            <button
              type="button"
              id="tab-poids-imc"
              onClick={() => onNavigate('/suivi-poids')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-medium text-[#4A453F] hover:text-[#1E1B18] hover:bg-white/60 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <div className="w-4 h-4 rounded-xs border border-current flex items-center justify-center p-0.5">
                <TrendingUp className="w-3 h-3" />
              </div>
              <span>Courbe de Poids & IMC</span>
            </button>

            <button
              type="button"
              id="tab-calendrier"
              onClick={() => onNavigate('/calendrier')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-medium text-[#4A453F] hover:text-[#1E1B18] hover:bg-white/60 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendrier Médical</span>
            </button>

            <button
              type="button"
              id="tab-conseils-ressources"
              onClick={() => onNavigate('/conseils-ressources')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-medium text-[#4A453F] hover:text-[#1E1B18] hover:bg-white/60 transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Conseils & Ressources</span>
            </button>

            <button
              type="button"
              id="tab-synthese-suivi"
              onClick={() => onNavigate('/synthese-suivi')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-medium text-[#9E2A2B] bg-white/70 hover:bg-white transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98] shadow-2xs"
            >
              <Stethoscope className="w-4 h-4 text-[#9E2A2B]" />
              <span>Synthèse du suivi</span>
            </button>
          </div>
        </div>

        {/* Quick Report Download Banner */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEECEC] border border-[#FCD4D4] flex items-center justify-center text-[#9E2A2B]">
              <Download className="w-5 h-5 text-[#9E2A2B]" />
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-[#1E1B18]">Rapport médical de grossesse en PDF</h3>
              <p className="text-[12px] text-[#69625A]">
                Synthèse complète de vos constantes, symptômes, examens, ordonnances et historique clinique.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="dashboard-preview-report-btn"
              onClick={handleOpenPdfPreview}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF5EC] hover:bg-[#F3EFE9] border border-[#EEDDC6] text-[#8C5E24] text-[12.5px] sm:text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 text-[#8C5E24]" />
              <span>Aperçu PDF</span>
            </button>

            <button
              type="button"
              id="dashboard-download-report-btn"
              onClick={handleOpenPdfPreview}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[12.5px] sm:text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger mon rapport'}</span>
            </button>

            <button
              type="button"
              id="dashboard-view-summary-btn"
              onClick={() => onNavigate('/synthese-suivi')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#E0DBD2] text-[#4A453F] text-[12.5px] font-medium transition-all cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Consulter la synthèse</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Skeleton or Content */}
      {isDataLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-white rounded-2xl border border-[#EAE6DF]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white rounded-2xl border border-[#EAE6DF]" />
            <div className="h-80 bg-white rounded-2xl border border-[#EAE6DF]" />
          </div>
        </div>
      ) : (
        <>
          {/* Big Card: POINT MÉTÉO INTÉRIEURE */}
          <ScrollReveal direction="up" durationMs={550} delayMs={50}>
            <section aria-label="Point Météo Intérieure">
              <SymptomCardSection />
            </section>
          </ScrollReveal>

          {/* Bottom Row: Two Big Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 pt-1">
            {/* Left: Radar des ressentis */}
            <ScrollReveal direction="up" durationMs={550} delayMs={100}>
              <section aria-label="Radar des ressentis">
                <RadarCard />
              </section>
            </ScrollReveal>

            {/* Right: Historique récent (7 jours) */}
            <ScrollReveal direction="up" durationMs={550} delayMs={180}>
              <section aria-label="Historique récent">
                <HistoryCard />
              </section>
            </ScrollReveal>
          </div>
        </>
      )}

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
    </div>
  );
});
