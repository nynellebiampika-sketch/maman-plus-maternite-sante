import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Scale,
  Heart,
  Calendar,
  CheckCircle2,
  Activity,
  Smile,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  CalendarCheck,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateGestationalStatus } from '../services/storage';

interface PregnancyEvolutionSectionProps {
  onNavigate?: (path: string) => void;
  className?: string;
}

// Biometric fetal reference chart by Gestational Week (SA) according to WHO / French obstetrical standards
const FETAL_GROWTH_LANDMARKS: Record<
  number,
  { sizeCm: number; weightG: number; landmark: string; highlight: string }
> = {
  8: { sizeCm: 1.6, weightG: 1, landmark: 'Framboise', highlight: 'Formation des membres et battements cardiaques' },
  12: { sizeCm: 6, weightG: 14, landmark: 'Prune', highlight: 'Fin du T1, réflexes primaires en éveil' },
  16: { sizeCm: 12, weightG: 100, landmark: 'Avocat', highlight: 'Bébé perçoit les sons et déglutit' },
  20: { sizeCm: 25, weightG: 300, landmark: 'Banane', highlight: 'Mi-parcours, premiers mouvements ressentis' },
  24: { sizeCm: 30, weightG: 600, landmark: 'Épi de maïs', highlight: 'Les sens s’affinent, cycle veille/sommeil' },
  28: { sizeCm: 36, weightG: 1000, landmark: 'Aubergine', highlight: 'Entrée dans le T3, ouverture des paupières' },
  32: { sizeCm: 42, weightG: 1700, landmark: 'Courge butternut', highlight: 'Prise de poids rapide, maturation pulmonaire' },
  36: { sizeCm: 47, weightG: 2600, landmark: 'Papaye', highlight: 'Bébé descend dans le bassin maternel' },
  40: { sizeCm: 50, weightG: 3400, landmark: 'Pastèque', highlight: 'Prêt pour la rencontre et l’accouchement' },
};

function getFetalLandmark(weekSA: number) {
  const keys = Object.keys(FETAL_GROWTH_LANDMARKS)
    .map(Number)
    .sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (weekSA >= k) closest = k;
  }
  return FETAL_GROWTH_LANDMARKS[closest];
}

export const PregnancyEvolutionSection: React.FC<PregnancyEvolutionSectionProps> = ({
  onNavigate,
  className = '',
}) => {
  const { currentUser } = useAuth();
  const {
    weightEntries,
    symptomLogs,
    appointments,
    exams,
    babyInfo,
  } = useUserData();

  // Active chart tab (or view all in a clear modern layout)
  const [activeTab, setActiveTab] = useState<'all' | 'weight' | 'gestational' | 'symptoms' | 'exams' | 'baby'>('all');
  const [hoveredWeightPoint, setHoveredWeightPoint] = useState<{
    x: number;
    y: number;
    date: string;
    weightKg: number;
    week?: number;
  } | null>(null);

  // 1. Gestational calculations
  const gestational = useMemo(() => {
    return calculateGestationalStatus(
      currentUser?.lastMenstrualPeriodDate,
      currentUser?.dueDate
    );
  }, [currentUser?.lastMenstrualPeriodDate, currentUser?.dueDate]);

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    if (!currentUser?.dueDate) return null;
    const due = new Date(currentUser.dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [currentUser?.dueDate]);

  // Gestational percentage (out of 41 SA)
  const gestationalPercentage = useMemo(() => {
    if (!gestational) return 0;
    const pct = Math.min(100, Math.max(0, Math.round((gestational.weeksSA / 41) * 100)));
    return pct;
  }, [gestational]);

  // 2. Weight sorting & calculations
  const sortedWeights = useMemo(() => {
    return [...weightEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [weightEntries]);

  const latestWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weightKg : null;
  const initialWeight = currentUser?.prePregnancyWeightKg || (sortedWeights.length > 0 ? sortedWeights[0].weightKg : null);
  const totalWeightGain =
    latestWeight && initialWeight ? Math.round((latestWeight - initialWeight) * 10) / 10 : null;

  // SVG Chart points calculation for weight curve
  const weightChartData = useMemo(() => {
    if (sortedWeights.length < 2) return null;

    const weights = sortedWeights.map((e) => e.weightKg);
    const minW = Math.floor(Math.min(...weights) - 1);
    const maxW = Math.ceil(Math.max(...weights) + 1);
    const rangeW = maxW - minW || 1;

    const width = 680;
    const height = 240;
    const padLeft = 46;
    const padRight = 30;
    const padTop = 26;
    const padBottom = 34;

    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const points = sortedWeights.map((entry, index) => {
      const x = padLeft + (index / (sortedWeights.length - 1)) * plotWidth;
      const y = padTop + plotHeight - ((entry.weightKg - minW) / rangeW) * plotHeight;
      return {
        x,
        y,
        weightKg: entry.weightKg,
        date: entry.date,
        week: entry.gestationalWeek,
      };
    });

    const linePath = points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // Closed path for gradient area under curve
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`;

    return {
      points,
      linePath,
      areaPath,
      width,
      height,
      minW,
      maxW,
      padLeft,
      padTop,
      plotWidth,
      plotHeight,
    };
  }, [sortedWeights]);

  // 3. Appointments sorting & next appointment
  const nextAppointment = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = appointments
      .filter((a) => (a.status === 'À venir' || a.status === 'Confirmé') && a.date >= todayStr)
      .sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime());

    if (upcoming.length > 0) return upcoming[0];
    // Fallback: latest upcoming without date condition
    const generalUpcoming = appointments.filter((a) => a.status === 'À venir' || a.status === 'Confirmé');
    return generalUpcoming[0] || null;
  }, [appointments]);

  // 4. Exams statistics
  const examsCompletedCount = useMemo(() => {
    return exams.filter((e) => e.status === 'Effectué').length;
  }, [exams]);

  const examsPendingCount = useMemo(() => {
    return exams.filter((e) => e.status === 'En attente' || e.status === 'En attente de résultats').length;
  }, [exams]);

  // 5. Symptoms analysis
  const symptomStats = useMemo(() => {
    if (symptomLogs.length === 0) return null;

    const total = symptomLogs.length;
    const intense = symptomLogs.filter((s) => s.intensity === 'Intense').length;
    const moderee = symptomLogs.filter((s) => s.intensity === 'Modérée').length;
    const legere = symptomLogs.filter((s) => s.intensity === 'Légère').length;

    // Count by symptom name
    const countMap: Record<string, number> = {};
    symptomLogs.forEach((s) => {
      countMap[s.symptomName] = (countMap[s.symptomName] || 0) + 1;
    });

    const topSymptoms = Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      total,
      intense,
      moderee,
      legere,
      pctIntense: Math.round((intense / total) * 100),
      pctModeree: Math.round((moderee / total) * 100),
      pctLegere: Math.round((legere / total) * 100),
      topSymptoms,
    };
  }, [symptomLogs]);

  // 6. Baby landmarks
  const fetalInfo = useMemo(() => {
    if (!gestational) return null;
    return getFetalLandmark(gestational.weeksSA);
  }, [gestational]);

  const hasBabyData = Boolean(
    babyInfo &&
      (babyInfo.nickname ||
        babyInfo.gender !== 'Non précisé' ||
        babyInfo.firstKicksDate ||
        babyInfo.movementNotes ||
        babyInfo.notes)
  );

  return (
    <section
      id="pregnancy-evolution-section"
      aria-label="Évolution de ma grossesse"
      className={`space-y-6 ${className}`}
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11.5px] font-semibold uppercase tracking-wider mb-2 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Rapports Graphiques & Suivi Réel</span>
          </div>
          <h2 className="font-serif text-[24px] sm:text-[28px] font-bold text-[#1E1B18] tracking-tight">
            Évolution de ma grossesse
          </h2>
          <p className="text-[13.5px] sm:text-[14px] text-[#69625A] max-w-2xl">
            Visualisation graphique animée et consolidée à partir de vos données cliniques réelles
            (poids, semaines d'aménorrhée, ressentis, examens et repères fœtaux).
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center p-1 bg-[#F5F2EB] rounded-2xl border border-[#E8E2D8] self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white text-[#1E1B18] shadow-2xs'
                : 'text-[#69625A] hover:text-[#1E1B18]'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weight')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'weight'
                ? 'bg-white text-[#1E1B18] shadow-2xs'
                : 'text-[#69625A] hover:text-[#1E1B18]'
            }`}
          >
            Poids ({sortedWeights.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gestational')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gestational'
                ? 'bg-white text-[#1E1B18] shadow-2xs'
                : 'text-[#69625A] hover:text-[#1E1B18]'
            }`}
          >
            Terme (SA)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('symptoms')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'symptoms'
                ? 'bg-white text-[#1E1B18] shadow-2xs'
                : 'text-[#69625A] hover:text-[#1E1B18]'
            }`}
          >
            Symptômes ({symptomLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exams'
                ? 'bg-white text-[#1E1B18] shadow-2xs'
                : 'text-[#69625A] hover:text-[#1E1B18]'
            }`}
          >
            Examens & RDV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('baby')}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'baby'
                ? 'bg-white text-[#1E1B18] shadow-2xs'
                : 'text-[#69625A] hover:text-[#1E1B18]'
            }`}
          >
            Bébé
          </button>
        </div>
      </div>

      {/* 4 MANDATORY STAT CARDS WITH GENTLE ENTRANCE ANIMATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Semaine actuelle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs hover:border-[#D8D1C5] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#69625A]">
              Semaine actuelle
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E7F8ED] text-[#1E653A] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="font-serif text-[24px] sm:text-[26px] font-bold text-[#1E1B18] tracking-tight">
              {gestational ? `${gestational.weeksSA} SA` : 'Non définie'}
            </div>
            <p className="text-[12px] text-[#7A736B] mt-0.5">
              {gestational
                ? `Trimestre ${gestational.trimester} • +${gestational.daysSA} jours`
                : 'Renseigner DDR ou DPA'}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F5F2EB] flex items-center justify-between text-[11.5px]">
            <span className="text-[#8C847D]">
              {daysRemaining !== null ? `${daysRemaining} j jusqu'au terme` : 'DPA requise'}
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/profil')}
                className="text-[#9E2A2B] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>{gestational ? 'Détails' : 'Configurer'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Card 2: Poids actuel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs hover:border-[#D8D1C5] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#69625A]">
              Poids actuel
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#8C5E24] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="font-serif text-[24px] sm:text-[26px] font-bold text-[#1E1B18] tracking-tight">
              {latestWeight ? `${latestWeight} kg` : 'Aucune pesée'}
            </div>
            <p className="text-[12px] text-[#7A736B] mt-0.5">
              {totalWeightGain !== null ? (
                <span className={Number(totalWeightGain) >= 0 ? 'text-[#1E653A] font-semibold' : 'text-[#1E1B18]'}>
                  {Number(totalWeightGain) >= 0 ? `+${totalWeightGain}` : totalWeightGain} kg depuis le début
                </span>
              ) : initialWeight ? (
                `Poids initial : ${initialWeight} kg`
              ) : (
                'Pas de poids de référence'
              )}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F5F2EB] flex items-center justify-between text-[11.5px]">
            <span className="text-[#8C847D]">
              {sortedWeights.length > 0 ? `${sortedWeights.length} pesée(s)` : '0 enregistrement'}
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/suivi-poids')}
                className="text-[#9E2A2B] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>{sortedWeights.length > 0 ? 'Suivi' : 'Ajouter'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Card 3: Prochain rendez-vous */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs hover:border-[#D8D1C5] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#69625A]">
              Prochain rendez-vous
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div>
            {nextAppointment ? (
              <>
                <div className="font-serif text-[18px] sm:text-[20px] font-bold text-[#1E1B18] tracking-tight truncate" title={nextAppointment.title}>
                  {nextAppointment.title}
                </div>
                <p className="text-[12px] text-[#7A736B] mt-0.5 truncate">
                  {new Date(nextAppointment.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  {nextAppointment.time ? `à ${nextAppointment.time}` : ''}{' '}
                  {nextAppointment.practitioner ? `• ${nextAppointment.practitioner}` : ''}
                </p>
              </>
            ) : (
              <>
                <div className="font-serif text-[20px] font-bold text-[#8C847D] tracking-tight">
                  Aucun planifié
                </div>
                <p className="text-[12px] text-[#7A736B] mt-0.5">
                  Aucun rendez-vous à venir
                </p>
              </>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F5F2EB] flex items-center justify-between text-[11.5px]">
            <span className="text-[#8C847D]">
              {appointments.length} rdv au total
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/rendez-vous')}
                className="text-[#9E2A2B] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>{nextAppointment ? 'Consulter' : 'Planifier'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Card 4: Examens réalisés */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs hover:border-[#D8D1C5] transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#69625A]">
              Examens réalisés
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#1E653A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="font-serif text-[24px] sm:text-[26px] font-bold text-[#1E1B18] tracking-tight">
              {examsCompletedCount}{' '}
              <span className="text-[16px] font-normal text-[#7A736B]">/ {exams.length}</span>
            </div>
            <p className="text-[12px] text-[#7A736B] mt-0.5">
              {examsPendingCount > 0
                ? `${examsPendingCount} examen(s) en attente`
                : exams.length > 0
                ? 'Tous les bilans sont à jour'
                : 'Aucun examen saisi'}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F5F2EB] flex items-center justify-between text-[11.5px]">
            <span className="text-[#8C847D]">
              {exams.length > 0 ? `${Math.round((examsCompletedCount / exams.length) * 100)}% effectués` : '0 bilan'}
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/examens')}
                className="text-[#9E2A2B] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Gérer</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* DETAILED CHARTS ACCORDING TO USER'S REAL DATA */}
      <div className="space-y-6">
        {/* ROW 1: EVOLUTION DU POIDS & EVOLUTION DE LA GROSSESSE (SA) */}
        {(activeTab === 'all' || activeTab === 'weight' || activeTab === 'gestational') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 1: Évolution du poids au fil des semaines */}
            {(activeTab === 'all' || activeTab === 'weight') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#8C5E24] flex items-center justify-center">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-[#1E1B18]">
                        Évolution du poids au fil des semaines
                      </h3>
                      <p className="text-[12px] text-[#69625A]">
                        Courbe dynamique basée sur vos relevés réels
                      </p>
                    </div>
                  </div>

                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('/suivi-poids')}
                      className="text-[12.5px] font-semibold text-[#9E2A2B] hover:underline cursor-pointer"
                    >
                      Ajouter une pesée
                    </button>
                  )}
                </div>

                {/* Real Data Chart or Elegant Empty State */}
                {weightChartData ? (
                  <div className="space-y-3">
                    {/* SVG Graphic Area */}
                    <div className="relative w-full bg-[#FAF8F5] rounded-2xl p-2 sm:p-3 border border-[#F0ECE5] overflow-hidden">
                      <svg
                        viewBox={`0 0 ${weightChartData.width} ${weightChartData.height}`}
                        className="w-full h-auto max-h-[260px] overflow-visible"
                      >
                        <defs>
                          <linearGradient id="weight-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9E2A2B" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#9E2A2B" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 0.33, 0.66, 1].map((ratio, i) => {
                          const y =
                            weightChartData.padTop +
                            ratio * weightChartData.plotHeight;
                          const val = Math.round(
                            weightChartData.maxW -
                              ratio * (weightChartData.maxW - weightChartData.minW)
                          );
                          return (
                            <g key={i}>
                              <line
                                x1={weightChartData.padLeft}
                                y1={y}
                                x2={weightChartData.width - 20}
                                y2={y}
                                stroke="#EAE6DF"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                              />
                              <text
                                x={weightChartData.padLeft - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="#8C847D"
                                fontSize="10"
                                fontFamily="sans-serif"
                              >
                                {val} kg
                              </text>
                            </g>
                          );
                        })}

                        {/* Starting pre-pregnancy weight guideline if exists */}
                        {currentUser?.prePregnancyWeightKg && (
                          <g>
                            <line
                              x1={weightChartData.padLeft}
                              y1={
                                weightChartData.padTop +
                                weightChartData.plotHeight -
                                ((currentUser.prePregnancyWeightKg - weightChartData.minW) /
                                  (weightChartData.maxW - weightChartData.minW || 1)) *
                                  weightChartData.plotHeight
                              }
                              x2={weightChartData.width - 20}
                              y2={
                                weightChartData.padTop +
                                weightChartData.plotHeight -
                                ((currentUser.prePregnancyWeightKg - weightChartData.minW) /
                                  (weightChartData.maxW - weightChartData.minW || 1)) *
                                  weightChartData.plotHeight
                              }
                              stroke="#8C5E24"
                              strokeWidth="1.2"
                              strokeDasharray="2 2"
                            />
                          </g>
                        )}

                        {/* Shaded Area under curve with gentle animation */}
                        <motion.path
                          d={weightChartData.areaPath}
                          fill="url(#weight-gradient)"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6 }}
                        />

                        {/* Animated Curve Line */}
                        <motion.path
                          d={weightChartData.linePath}
                          fill="none"
                          stroke="#9E2A2B"
                          strokeWidth="2.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />

                        {/* Interactive Data points */}
                        {weightChartData.points.map((pt, idx) => {
                          const isHovered =
                            hoveredWeightPoint &&
                            hoveredWeightPoint.date === pt.date &&
                            hoveredWeightPoint.weightKg === pt.weightKg;
                          return (
                            <g
                              key={idx}
                              className="cursor-pointer transition-transform"
                              onMouseEnter={() => setHoveredWeightPoint(pt)}
                              onMouseLeave={() => setHoveredWeightPoint(null)}
                            >
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 6 : 4}
                                fill="#FFFFFF"
                                stroke="#9E2A2B"
                                strokeWidth={isHovered ? 3 : 2}
                              />
                              {/* Always show latest point value */}
                              {idx === weightChartData.points.length - 1 && !isHovered && (
                                <text
                                  x={pt.x}
                                  y={pt.y - 10}
                                  textAnchor="middle"
                                  fill="#9E2A2B"
                                  fontSize="11"
                                  fontWeight="bold"
                                >
                                  {pt.weightKg} kg
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* X-axis date labels */}
                        {weightChartData.points.map((pt, idx) => {
                          // Show first, middle and last label to avoid clutter
                          const total = weightChartData.points.length;
                          const show =
                            idx === 0 ||
                            idx === total - 1 ||
                            (total > 4 && idx === Math.floor(total / 2));
                          if (!show) return null;

                          return (
                            <text
                              key={idx}
                              x={pt.x}
                              y={weightChartData.height - 10}
                              textAnchor="middle"
                              fill="#69625A"
                              fontSize="10"
                            >
                              {new Date(pt.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </text>
                          );
                        })}
                      </svg>

                      {/* Tooltip Overlay */}
                      {hoveredWeightPoint && (
                        <div
                          className="absolute pointer-events-none bg-[#1E1B18] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-md -translate-x-1/2 -translate-y-full mb-2 z-10 whitespace-nowrap"
                          style={{
                            left: `${(hoveredWeightPoint.x / weightChartData.width) * 100}%`,
                            top: `${(hoveredWeightPoint.y / weightChartData.height) * 100}%`,
                          }}
                        >
                          <span className="font-bold">{hoveredWeightPoint.weightKg} kg</span>
                          <span className="text-white/70 block text-[10px]">
                            {new Date(hoveredWeightPoint.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                            {hoveredWeightPoint.week ? ` • ${hoveredWeightPoint.week} SA` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Chart summary metrics */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] px-1">
                      <div className="flex items-center gap-3 text-[#69625A]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#9E2A2B]" />
                          Pesées enregistrées : <strong>{sortedWeights.length}</strong>
                        </span>
                        {currentUser?.prePregnancyWeightKg && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-0.5 bg-[#8C5E24]" />
                            Poids de départ : {currentUser.prePregnancyWeightKg} kg
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-[#1E653A]">
                        {totalWeightGain !== null
                          ? `${Number(totalWeightGain) >= 0 ? '+' : ''}${totalWeightGain} kg au total`
                          : ''}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Elegant Empty State for Weight */
                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DCD6CC] text-center space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#8C5E24] flex items-center justify-center mx-auto shadow-2xs">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h4 className="font-bold text-[14px] text-[#1E1B18]">
                        Pas encore assez de pesées enregistrées
                      </h4>
                      <p className="text-[12.5px] text-[#69625A] mt-1 leading-relaxed">
                        {sortedWeights.length === 1
                          ? 'Une seule pesée enregistrée (actuellement ' + sortedWeights[0].weightKg + ' kg). Ajoutez une deuxième pesée pour tracer votre courbe.'
                          : 'Consignez au moins 2 pesées régulières pour tracer votre courbe pondérale clinique.'}
                      </p>
                    </div>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('/suivi-poids')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enregistrer une pesée</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* CHART 2: Évolution de la grossesse / Semaines d'aménorrhée */}
            {(activeTab === 'all' || activeTab === 'gestational') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E7F8ED] text-[#1E653A] flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-[#1E1B18]">
                        Évolution de la grossesse & Terme (SA)
                      </h3>
                      <p className="text-[12px] text-[#69625A]">
                        Jauge d'aménorrhée et repères trimestriels
                      </p>
                    </div>
                  </div>

                  {gestational && (
                    <span className="px-2.5 py-1 rounded-full bg-[#E7F8ED] text-[#1E653A] border border-[#C5EAD0] text-[11.5px] font-bold">
                      {gestational.weeksSA} SA + {gestational.daysSA} j
                    </span>
                  )}
                </div>

                {/* Gestational Visualization or Empty State */}
                {gestational ? (
                  <div className="space-y-4">
                    {/* Visual Progress Gauge */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="font-semibold text-[#1E1B18]">
                          Progression globale : {gestationalPercentage}% du terme
                        </span>
                        <span className="text-[#8C5E24] font-bold">
                          Trimestre {gestational.trimester} sur 3
                        </span>
                      </div>

                      {/* Main Gestational Track Bar */}
                      <div className="relative h-4 w-full bg-[#EBE5DB] rounded-full overflow-hidden p-0.5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#8C5E24] via-[#9E2A2B] to-[#1E653A]"
                          initial={{ width: 0 }}
                          animate={{ width: `${gestationalPercentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>

                      {/* 3 Trimesters demarcation labels */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center font-medium">
                        <div
                          className={`p-2 rounded-xl border transition-all ${
                            gestational.trimester === 1
                              ? 'bg-white border-[#8C5E24] text-[#8C5E24] font-bold shadow-2xs'
                              : 'bg-white/60 border-[#EAE6DF] text-[#7A736B]'
                          }`}
                        >
                          <span>T1 : 1 à 13 SA</span>
                          <span className="block text-[10px] font-normal opacity-80">Embryogenèse</span>
                        </div>
                        <div
                          className={`p-2 rounded-xl border transition-all ${
                            gestational.trimester === 2
                              ? 'bg-white border-[#9E2A2B] text-[#9E2A2B] font-bold shadow-2xs'
                              : 'bg-white/60 border-[#EAE6DF] text-[#7A736B]'
                          }`}
                        >
                          <span>T2 : 14 à 27 SA</span>
                          <span className="block text-[10px] font-normal opacity-80">Mouvements & Éveil</span>
                        </div>
                        <div
                          className={`p-2 rounded-xl border transition-all ${
                            gestational.trimester === 3
                              ? 'bg-white border-[#1E653A] text-[#1E653A] font-bold shadow-2xs'
                              : 'bg-white/60 border-[#EAE6DF] text-[#7A736B]'
                          }`}
                        >
                          <span>T3 : 28 à 41 SA</span>
                          <span className="block text-[10px] font-normal opacity-80">Maturation & Rencontre</span>
                        </div>
                      </div>
                    </div>

                    {/* Milestone Cards Row */}
                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5]">
                        <span className="text-[#8C847D] block text-[11px] uppercase font-semibold">
                          Date présumée (DPA)
                        </span>
                        <span className="font-bold text-[#1E1B18] mt-0.5 block">
                          {currentUser?.dueDate
                            ? new Date(currentUser.dueDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Non renseignée'}
                        </span>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0ECE5]">
                        <span className="text-[#8C847D] block text-[11px] uppercase font-semibold">
                          Compte à rebours
                        </span>
                        <span className="font-bold text-[#1E653A] mt-0.5 block">
                          {daysRemaining !== null ? `${daysRemaining} jours restants` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Elegant Empty State for Gestational age */
                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DCD6CC] text-center space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#9E2A2B] flex items-center justify-center mx-auto shadow-2xs">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h4 className="font-bold text-[14px] text-[#1E1B18]">
                        Date de terme ou DDR non configurée
                      </h4>
                      <p className="text-[12.5px] text-[#69625A] mt-1 leading-relaxed">
                        Indiquez votre date des dernières règles ou votre date présumée d'accouchement dans votre profil pour activer le décompte en semaines d'aménorrhée.
                      </p>
                    </div>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('/profil')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1B18] hover:bg-[#332E2A] text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Renseigner mes dates</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ROW 2: HISTORIQUE DES SYMPTÔMES & RENDEZ-VOUS / EXAMENS */}
        {(activeTab === 'all' || activeTab === 'symptoms' || activeTab === 'exams') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 3: Historique des symptômes */}
            {(activeTab === 'all' || activeTab === 'symptoms') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-[#1E1B18]">
                        Historique des symptômes
                      </h3>
                      <p className="text-[12px] text-[#69625A]">
                        Répartition par intensité et observations réelles
                      </p>
                    </div>
                  </div>

                  {symptomStats && (
                    <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C5E24] border border-[#EEDDC6]">
                      {symptomStats.total} saisie(s)
                    </span>
                  )}
                </div>

                {symptomStats ? (
                  <div className="space-y-4">
                    {/* Intensity Distribution Multi-Bar */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2.5">
                      <div className="flex items-center justify-between text-[12px] font-semibold text-[#1E1B18]">
                        <span>Répartition des intensités</span>
                        <span className="text-[#69625A] text-[11px] font-normal">
                          {symptomStats.total} symptômes enregistrés
                        </span>
                      </div>

                      {/* Horizontal stacked segmented bar */}
                      <div className="h-3.5 w-full bg-[#EAE6DF] rounded-full overflow-hidden flex">
                        {symptomStats.legere > 0 && (
                          <div
                            style={{ width: `${symptomStats.pctLegere}%` }}
                            className="h-full bg-[#1E653A] transition-all"
                            title={`Légère : ${symptomStats.legere} (${symptomStats.pctLegere}%)`}
                          />
                        )}
                        {symptomStats.moderee > 0 && (
                          <div
                            style={{ width: `${symptomStats.pctModeree}%` }}
                            className="h-full bg-[#8C5E24] transition-all"
                            title={`Modérée : ${symptomStats.moderee} (${symptomStats.pctModeree}%)`}
                          />
                        )}
                        {symptomStats.intense > 0 && (
                          <div
                            style={{ width: `${symptomStats.pctIntense}%` }}
                            className="h-full bg-[#9E2A2B] transition-all"
                            title={`Intense : ${symptomStats.intense} (${symptomStats.pctIntense}%)`}
                          />
                        )}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="flex items-center gap-1.5 text-[#1E653A] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#1E653A]" />
                          Légère ({symptomStats.legere})
                        </span>
                        <span className="flex items-center gap-1.5 text-[#8C5E24] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#8C5E24]" />
                          Modérée ({symptomStats.moderee})
                        </span>
                        <span className="flex items-center gap-1.5 text-[#9E2A2B] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#9E2A2B]" />
                          Intense ({symptomStats.intense})
                        </span>
                      </div>
                    </div>

                    {/* Top Symptoms List */}
                    <div className="space-y-2">
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#8C847D] block">
                        Symptômes les plus fréquents :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {symptomStats.topSymptoms.map((sym, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white border border-[#EAE6DF] flex items-center justify-between text-[12px]"
                          >
                            <span className="font-semibold text-[#1E1B18] truncate pr-2">
                              {sym.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-[#FAF5EC] text-[#8C5E24] font-bold text-[11px] shrink-0">
                              {sym.count}x
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Elegant Empty State for Symptoms */
                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DCD6CC] text-center space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#9E2A2B] flex items-center justify-center mx-auto shadow-2xs">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h4 className="font-bold text-[14px] text-[#1E1B18]">
                        Aucun symptôme consigné
                      </h4>
                      <p className="text-[12.5px] text-[#69625A] mt-1 leading-relaxed">
                        Vos enregistrements réguliers permettront d'analyser vos ressentis et de préparer vos échanges cliniques.
                      </p>
                    </div>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('/symptomes')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Consigner un symptôme</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* CHART 4: Rendez-vous et examens */}
            {(activeTab === 'all' || activeTab === 'exams') && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#1E653A] flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[17px] sm:text-[18px] font-bold text-[#1E1B18]">
                        Rendez-vous & Examens
                      </h3>
                      <p className="text-[12px] text-[#69625A]">
                        Suivi du calendrier médical et des bilans
                      </p>
                    </div>
                  </div>

                  <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#E7F8ED] text-[#1E653A] border border-[#C5EAD0]">
                    {appointments.length + exams.length} actes
                  </span>
                </div>

                {appointments.length > 0 || exams.length > 0 ? (
                  <div className="space-y-4">
                    {/* Double progress gauges */}
                    <div className="space-y-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
                      {/* Examens Progress */}
                      <div>
                        <div className="flex items-center justify-between text-[12px] mb-1">
                          <span className="font-semibold text-[#1E1B18] flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#1E653A]" />
                            Examens réalisés
                          </span>
                          <span className="text-[#1E653A] font-bold">
                            {examsCompletedCount} / {exams.length || 0}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#EAE6DF] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#1E653A] rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: exams.length > 0 ? `${(examsCompletedCount / exams.length) * 100}%` : '0%',
                            }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>

                      {/* Appointments Timeline breakdown */}
                      <div className="pt-2 border-t border-[#F0ECE5]">
                        <div className="flex items-center justify-between text-[12px] mb-1">
                          <span className="font-semibold text-[#1E1B18] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#9E2A2B]" />
                            Consultations planifiées
                          </span>
                          <span className="text-[#9E2A2B] font-bold">
                            {appointments.filter((a) => a.status === 'À venir' || a.status === 'Confirmé').length} à venir
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#EAE6DF] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#9E2A2B] rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width:
                                appointments.length > 0
                                  ? `${
                                      (appointments.filter((a) => a.status === 'Passé').length /
                                        appointments.length) *
                                      100
                                    }%`
                                  : '0%',
                            }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Next upcoming items summary list */}
                    <div className="space-y-2">
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#8C847D] block">
                        Prochaines échéances cliniques :
                      </span>

                      <div className="space-y-2">
                        {nextAppointment && (
                          <div className="p-3 rounded-xl bg-white border border-[#EAE6DF] flex items-center justify-between text-[12.5px]">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-2 h-2 rounded-full bg-[#9E2A2B] shrink-0" />
                              <div className="truncate">
                                <strong className="text-[#1E1B18] block truncate">{nextAppointment.title}</strong>
                                <span className="text-[#7A736B] text-[11.5px]">
                                  {nextAppointment.date} {nextAppointment.time ? `à ${nextAppointment.time}` : ''}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#FEECEC] text-[#9E2A2B] shrink-0">
                              RDV
                            </span>
                          </div>
                        )}

                        {exams.find((e) => e.status !== 'Effectué') && (
                          <div className="p-3 rounded-xl bg-white border border-[#EAE6DF] flex items-center justify-between text-[12.5px]">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-2 h-2 rounded-full bg-[#8C5E24] shrink-0" />
                              <div className="truncate">
                                <strong className="text-[#1E1B18] block truncate">
                                  {exams.find((e) => e.status !== 'Effectué')?.title}
                                </strong>
                                <span className="text-[#7A736B] text-[11.5px]">
                                  {exams.find((e) => e.status !== 'Effectué')?.status}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#FAF5EC] text-[#8C5E24] shrink-0">
                              Bilan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Elegant Empty State for Appointments & Exams */
                  <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DCD6CC] text-center space-y-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#1E653A] flex items-center justify-center mx-auto shadow-2xs">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h4 className="font-bold text-[14px] text-[#1E1B18]">
                        Aucun rendez-vous ni examen saisi
                      </h4>
                      <p className="text-[12.5px] text-[#69625A] mt-1 leading-relaxed">
                        Planifiez vos consultations obstétricales et vos bilans pour garder la maîtrise de votre parcours.
                      </p>
                    </div>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('/rendez-vous')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1B18] hover:bg-[#332E2A] text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Planifier un rendez-vous</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ROW 3: ÉVOLUTION DES DONNÉES DU BÉBÉ LORSQU'ELLES EXISTENT */}
        {(activeTab === 'all' || activeTab === 'baby') && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F2EB] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF8EE] border border-[#FEEBD0] text-[#8C5E24] flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#1E1B18]">
                      Évolution des données du bébé
                    </h3>
                    {babyInfo?.nickname && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C5E24] border border-[#EEDDC6] text-[11.5px] font-bold">
                        {babyInfo.nickname}
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-[#69625A]">
                    Repères biométriques et éveil fœtal correspondant à votre terme
                  </p>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('/bebe')}
                  className="text-[12.5px] font-semibold text-[#9E2A2B] hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Ouvrir l'Espace Bébé
                </button>
              )}
            </div>

            {/* When data exists (gestational or user baby entries) */}
            {gestational || hasBabyData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Milestone 1: Taille & Poids estimé */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C847D] block">
                    Biométrie estimée ({gestational ? `${gestational.weeksSA} SA` : 'Terme standard'})
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-[22px] font-bold text-[#1E1B18]">
                      {fetalInfo ? `~${fetalInfo.sizeCm} cm` : '—'}
                    </span>
                    <span className="text-[14px] text-[#69625A]">
                      {fetalInfo ? `• ~${fetalInfo.weightG} g` : ''}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#69625A]">
                    {fetalInfo ? (
                      <>
                        Repère de taille : <strong>{fetalInfo.landmark}</strong>
                      </>
                    ) : (
                      'Données standards selon le terme gestationnel.'
                    )}
                  </p>
                </div>

                {/* Milestone 2: Premiers coups de pied / Mouvements */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C847D] block">
                    Mouvements & Coups de pied
                  </span>
                  <div className="font-serif text-[18px] font-bold text-[#1E1B18]">
                    {babyInfo?.firstKicksDate ? (
                      new Date(babyInfo.firstKicksDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })
                    ) : (
                      <span className="text-[#8C847D] font-sans text-[14px] font-normal italic">
                        Date non renseignée
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#69625A] truncate" title={babyInfo?.movementNotes || 'Généralement perceptibles entre la 18e et la 22e SA.'}>
                    {babyInfo?.movementNotes || 'Généralement perceptibles entre la 18e et la 22e SA.'}
                  </p>
                </div>

                {/* Milestone 3: Éveil & Développement actuel */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C847D] block">
                    Éveil & Maturation
                  </span>
                  <div className="font-bold text-[14px] text-[#1E653A]">
                    {fetalInfo?.highlight || 'Développement harmonieux'}
                  </div>
                  <p className="text-[12px] text-[#69625A]">
                    {babyInfo?.gender && babyInfo.gender !== 'Non précisé'
                      ? `Genre : ${babyInfo.gender}`
                      : 'Suivi bienveillant de la croissance in utero.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Elegant Empty State for Baby */
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DCD6CC] text-center space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#8C5E24] flex items-center justify-center mx-auto shadow-2xs">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h4 className="font-bold text-[14px] text-[#1E1B18]">
                    Aucune donnée bébé renseignée
                  </h4>
                  <p className="text-[12.5px] text-[#69625A] mt-1 leading-relaxed">
                    Notez le surnom de bébé, la date de ses premiers coups de pied ou configurez votre terme pour afficher ses repères biométriques.
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/bebe')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C5E24] hover:bg-[#734D1C] text-white text-[12.5px] font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>Compléter l'Espace Bébé</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};
