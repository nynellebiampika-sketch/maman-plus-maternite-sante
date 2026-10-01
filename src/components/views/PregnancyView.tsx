import React, { useState } from 'react';
import { Heart, Calendar, AlertCircle, ArrowRight, ShieldCheck, Clock, Download, Sparkles, Pill, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { calculateGestationalStatus } from '../../services/storage';
import { generatePregnancyReportPdf } from '../../services/pdfGenerator';
import { PageWrapper } from './PageWrapper';

interface PregnancyViewProps {
  onOpenProfile: () => void;
  onNavigate: (route: string) => void;
}

export const PregnancyView: React.FC<PregnancyViewProps> = ({ onOpenProfile, onNavigate }) => {
  const { currentUser } = useAuth();
  const userData = useUserData();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadReport = async () => {
    setIsGenerating(true);
    try {
      await generatePregnancyReportPdf({
        currentUser,
        symptomLogs: userData.symptomLogs,
        weightEntries: userData.weightEntries,
        appointments: userData.appointments,
        exams: userData.exams,
        prescriptions: userData.prescriptions,
        babyInfo: userData.babyInfo,
        journalEntries: userData.journalEntries,
        reminders: userData.reminders,
        checklist: userData.checklist,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  // If no gestational info configured
  if (!gestational) {
    return (
      <PageWrapper id="view-pregnancy">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF4ED] border border-[#EFE3D3] flex items-center justify-center text-[#8C5E24] mx-auto mb-5 shadow-2xs">
            <Heart className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight mb-3">
            Votre suivi de grossesse n'est pas encore configuré.
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#69625A] leading-relaxed mb-6 max-w-lg mx-auto">
            Renseignez la date de vos dernières règles (DDR) ou votre date présumée d'accouchement
            (DPA) pour calculer automatiquement vos semaines d'aménorrhée, votre trimestre et vos
            jalons cliniques.
          </p>
          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white font-medium text-[14px] shadow-sm transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Configurer mon suivi</span>
          </button>
        </div>
      </PageWrapper>
    );
  }

  // Calculate real progression
  const totalWeeks = 41;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gestational.weeksSA / totalWeeks) * 100)));

  // Calculate days remaining if dueDate is present
  let daysRemaining: number | null = null;
  if (currentUser?.dueDate) {
    const due = new Date(currentUser.dueDate).getTime();
    const now = new Date().getTime();
    daysRemaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
  }

  // Real trimester clinical recommendations
  const trimesterInfo = {
    1: {
      name: 'Premier Trimestre (1 à 13 SA)',
      subtitle: 'Période essentielle d’organogenèse et adaptation maternelle',
      keyMilestones: [
        'Échographie du premier trimestre (11 - 13 SA + 6 j) et mesure de la clarté nucale',
        'Bilan sanguin complet et dépistage de la trisomie 21',
        'Déclaration officielle de grossesse avant la fin du 3ème mois',
      ],
      bodyAdvice: 'Privilégiez le repos, hydratez-vous par petites gorgées en cas de nausées et continuez la supplémentation en folates.',
    },
    2: {
      name: 'Deuxième Trimestre (14 à 27 SA)',
      subtitle: 'Trimestre de plénitude, perception des mouvements et morphologie',
      keyMilestones: [
        'Échographie morphologique détaillée (22 - 24 SA)',
        'Dépistage du diabète gestationnel (test HGPO 75g de glucose vers 24-28 SA si facteurs)',
        'Consultations mensuelles de suivi obstétrical et surveillance de la tension',
      ],
      bodyAdvice: 'Moment idéal pour débuter les séances de préparation à la naissance et surveiller votre prise de poids avec bienveillance.',
    },
    3: {
      name: 'Troisième Trimestre (28 à 41 SA)',
      subtitle: 'Croissance fœtale active et préparation concrète à l’accouchement',
      keyMilestones: [
        'Échographie du 3ème trimestre (32 - 34 SA) pour surveiller la croissance et la position',
        'Consultation obligatoire avec le médecin anesthésiste (vers 36-37 SA)',
        'Prélèvement vaginal de dépistage du Streptocoque B',
        'Préparation de la valise de maternité et du projet de naissance',
      ],
      bodyAdvice: 'Surveillez activement les mouvements quotidiens de bébé et reposez vos jambes en position surélevée.',
    },
  }[gestational.trimester];

  return (
    <PageWrapper id="view-pregnancy">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7F0DF] border border-[#C5EAD0] text-[#1E653A] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <Heart className="w-3.5 h-3.5 text-[#1E653A]" />
            <span>{gestational.badgeLabel}</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Ma Grossesse
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Suivi clinique chronologique et repères obstétricaux calculés sur vos dates réelles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="download-pregnancy-report-header-btn"
            onClick={handleDownloadReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13px] font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-rose-200" />
            <span>{isGenerating ? 'Génération du PDF...' : 'Télécharger mon rapport (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DDD5] text-[#3E3834] text-[13px] font-medium transition-all shadow-2xs cursor-pointer"
          >
            Modifier mes dates (DDR / DPA)
          </button>
        </div>
      </div>

      {/* Progress & Countdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Avancement */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[#69625A] text-[13px]">
            <span className="font-medium">Progression du terme</span>
            <span className="font-bold text-[#9E2A2B]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden">
            <div
              className="bg-[#9E2A2B] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[12px] text-[#7A736B]">
            Semaine {gestational.weeksSA} SA achevée + {gestational.daysSA} jours sur 41 SA.
          </p>
        </div>

        {/* Card 2: Dates Clés */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C857E]">
            Repères de calendrier
          </span>
          <div className="text-[14px] text-[#2C2825] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69625A]">Terme théorique (DPA) :</span>
              <span className="font-semibold text-[#1E1B18]">
                {currentUser?.dueDate
                  ? new Date(currentUser.dueDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Non spécifié'}
              </span>
            </div>
            {currentUser?.lastMenstrualPeriodDate && (
              <div className="flex justify-between text-[12.5px]">
                <span className="text-[#69625A]">Dernières règles (DDR) :</span>
                <span>{new Date(currentUser.lastMenstrualPeriodDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Décompte */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C857E]">
            Décompte jusqu'au terme
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              {daysRemaining !== null ? daysRemaining : '—'}
            </span>
            <span className="text-[13px] text-[#69625A]">jours restants estimés</span>
          </div>
          <span className="text-[11.5px] text-[#8C847D] mt-1">
            Chaque jour compte pour la maturation fœtale.
          </span>
        </div>
      </div>

      {/* Trimester Details */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#F0ECE5] pb-4">
          <div>
            <div className="inline-block text-[11px] font-bold text-[#9E2A2B] bg-[#FEECEC] px-2.5 py-0.5 rounded-full mb-1">
              Trimestre {gestational.trimester}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18]">
              {trimesterInfo.name}
            </h2>
            <p className="text-[13.5px] text-[#69625A] mt-0.5">{trimesterInfo.subtitle}</p>
          </div>
        </div>

        {/* Milestones list */}
        <div className="space-y-3">
          <h3 className="text-[13px] font-semibold text-[#3C3630] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E653A]" />
            <span>Étapes médicales clés de ce trimestre :</span>
          </h3>
          <ul className="space-y-2.5">
            {trimesterInfo.keyMilestones.map((milestone, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EFECE5] text-[13.5px] text-[#3A3530]"
              >
                <div className="w-5 h-5 rounded-full bg-[#EAE4DC] flex items-center justify-center text-[11px] font-bold text-[#5A534B] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span>{milestone}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical advice banner */}
        <div className="p-4 rounded-xl bg-[#F4F8F5] border border-[#D7EBDC] flex items-start gap-3 text-[#1B4332]">
          <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed">
            <span className="font-semibold block mb-0.5">Conseil d’écoute corporelle</span>
            <span>{trimesterInfo.bodyAdvice}</span>
          </div>
        </div>
      </div>

      {/* Navigation shortcuts to sub-sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => onNavigate('/synthese-suivi')}
          className="p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#DCD6CC] hover:-translate-y-[1px] text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider block mb-1">
            Dossier Médecin
          </span>
          <span className="text-[13.5px] font-bold text-[#1E1B18] group-hover:text-[#9E2A2B] flex items-center justify-between">
            Synthèse du suivi
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/mon-ordonnance')}
          className="p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#DCD6CC] hover:-translate-y-[1px] text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider block mb-1">
            Ordonnances & PDF
          </span>
          <span className="text-[13.5px] font-bold text-[#1E1B18] group-hover:text-[#9E2A2B] flex items-center justify-between">
            Mon ordonnance
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/examens')}
          className="p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#DCD6CC] hover:-translate-y-[1px] text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider block mb-1">
            Examens médicaux
          </span>
          <span className="text-[13.5px] font-bold text-[#1E1B18] group-hover:text-[#9E2A2B] flex items-center justify-between">
            Consulter mes bilans
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/suivi-poids')}
          className="p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#DCD6CC] hover:-translate-y-[1px] text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider block mb-1">
            Courbe de poids
          </span>
          <span className="text-[13.5px] font-bold text-[#1E1B18] group-hover:text-[#9E2A2B] flex items-center justify-between">
            Enregistrer ma pesée
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/rendez-vous')}
          className="p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#DCD6CC] hover:-translate-y-[1px] text-left transition-all group cursor-pointer shadow-2xs"
        >
          <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider block mb-1">
            Agenda
          </span>
          <span className="text-[13.5px] font-bold text-[#1E1B18] group-hover:text-[#9E2A2B] flex items-center justify-between">
            Voir mes rendez-vous
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </PageWrapper>
  );
};
