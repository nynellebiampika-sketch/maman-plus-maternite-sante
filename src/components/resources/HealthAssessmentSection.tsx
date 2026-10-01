import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  MapPin,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ASSESSMENT_QUESTIONS, evaluateAssessment } from '../../data/assessmentQuestions';
import { AssessmentResultData } from '../../types';

interface HealthAssessmentSectionProps {
  onNavigateToFacilities?: () => void;
  onNavigateToAdviceCategory?: (category: string) => void;
}

export const HealthAssessmentSection: React.FC<HealthAssessmentSectionProps> = ({
  onNavigateToFacilities,
  onNavigateToAdviceCategory,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResultData | null>(null);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate assessment
      const res = evaluateAssessment(answers);
      setResult(res);
      setIsEvaluated(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsEvaluated(false);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* MEDICAL DISCLAIMER BANNER (MANDATORY) */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-amber-900 leading-relaxed space-y-1">
          <p className="font-bold text-amber-950">Avertissement médical d\'orientation</p>
          <p>
            Ce questionnaire interactif est un outil d\'information et de repérage des signes cliniques.
            Il ne pose <strong>aucun diagnostic médical</strong> et ne remplace jamais l\'avis d\'une
            sage-femme ou d\'un médecin. En cas de doute, d\'angoisse ou de saignements, contactez le 15
            ou votre maternité.
          </p>
        </div>
      </div>

      {!isEvaluated ? (
        /* QUESTIONNAIRE FLOW */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          {/* Progress header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-rose-600">
                <Stethoscope className="w-4 h-4" />
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </span>
              <span>{progressPercent}% complété</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-rose-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question content */}
          <div className="space-y-2 pt-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 font-serif leading-snug">
              {currentQuestion.question}
            </h3>
            {currentQuestion.subtitle && (
              <p className="text-slate-500 text-xs md:text-sm">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Options list */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              const isEmergencyOption = option.isEmergency;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelectOption(option.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/50 shadow-sm ring-1 ring-rose-500'
                      : isEmergencyOption
                      ? 'border-slate-200 hover:border-rose-300 hover:bg-slate-50/80'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900 block">
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span className="text-xs text-slate-500 block">
                        {option.sublabel}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs md:text-sm font-semibold disabled:opacity-40 hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              {currentQuestionIndex === totalQuestions - 1 ? (
                <>
                  Voir les résultats
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* RESULT VIEW */
        result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Result Main Card */}
            <div className={`bg-white rounded-2xl border ${result.badgeBorder} p-6 md:p-8 shadow-sm space-y-6`}>
              {/* Level Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${result.badgeBg} ${result.badgeText}`}
                    >
                      Niveau : {result.level}
                    </span>
                    {result.level === 'Urgence' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 animate-pulse">
                        <ShieldAlert className="w-4 h-4" />
                        Alerte immédiate
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-serif pt-1">
                    {result.title}
                  </h3>
                </div>

                {/* Direct Emergency Call Button if level is Urgence or Consultation rapide */}
                {result.emergencyPhoneToCall && (
                  <a
                    href={`tel:${result.emergencyPhoneToCall}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-600 text-white text-sm font-bold shadow-md hover:bg-rose-700 transition-all active:scale-95 shrink-0"
                  >
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    Appeler le {result.emergencyPhoneToCall} (SAMU)
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                {result.description}
              </p>

              {/* Recommended Actions Checklist */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  Conduite à tenir recommandée
                </h4>
                <ul className="space-y-2">
                  {result.actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigation Action Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {onNavigateToFacilities && (
                  <button
                    onClick={onNavigateToFacilities}
                    className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <span className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Carte interactive
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        Trouver une maternité ou urgences proches
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                {onNavigateToAdviceCategory && result.recommendedAdviceCategory && (
                  <button
                    onClick={() => onNavigateToAdviceCategory(result.recommendedAdviceCategory!)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <span className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Conseils associés
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        Lire les fiches « {result.recommendedAdviceCategory} »
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>

              {/* Restart button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recommencer une nouvelle évaluation
                </button>
              </div>
            </div>
          </motion.div>
        )
      )}
    </div>
  );
};
