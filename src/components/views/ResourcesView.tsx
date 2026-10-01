import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Youtube,
  Stethoscope,
  MapPin,
  Users,
  Bookmark,
  Search,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { AdviceLibrarySection } from '../resources/AdviceLibrarySection';
import { VideosSection } from '../resources/VideosSection';
import { HealthAssessmentSection } from '../resources/HealthAssessmentSection';
import { HealthFacilitiesSection } from '../resources/HealthFacilitiesSection';
import { CreatorsSection } from '../resources/CreatorsSection';
import { SavedResourcesSection } from '../resources/SavedResourcesSection';
import { useUserData } from '../../contexts/UserDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateGestationalStatus } from '../../services/storage';
import { AdviceCategory, AdviceItem, VideoResource } from '../../types';

export type ResourcesTab = 'advice' | 'videos' | 'assessment' | 'facilities' | 'creators' | 'saved';

export const ResourcesView: React.FC = () => {
  const { currentUser } = useAuth();
  const { symptomLogs, savedAdviceIds, savedVideoIds } = useUserData();

  const [activeTab, setActiveTab] = useState<ResourcesTab>('advice');
  const [selectedCategory, setSelectedCategory] = useState<AdviceCategory | undefined>(undefined);
  const [searchProblemQuery, setSearchProblemQuery] = useState<string>('');

  const gestationalStatus = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  // Extract recent user symptoms for personalized suggestions
  const recentSymptoms = symptomLogs.slice(0, 3);

  const tabs: { id: ResourcesTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'advice', label: 'Conseils écrits', icon: BookOpen },
    { id: 'videos', label: 'Vidéos', icon: Youtube },
    { id: 'assessment', label: 'Évaluation santé', icon: Stethoscope },
    { id: 'facilities', label: 'Établissements proches', icon: MapPin },
    { id: 'creators', label: 'Professionnels & Experts', icon: Users },
    { id: 'saved', label: `Favoris (${savedAdviceIds.length + savedVideoIds.length})`, icon: Bookmark },
  ];

  const handleNavigateToCategory = (cat: string) => {
    setSelectedCategory(cat as AdviceCategory);
    setActiveTab('advice');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            Accompagnement Médical & Prénatal Certifié
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif tracking-tight">
            Conseils & Ressources
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1 max-w-2xl leading-relaxed">
            Un espace clinique central réunissant plus de 1 000 recommandations validées, des vidéos
            officielles, l\'orientation interactive et la localisation des maternités de recours.
          </p>
        </div>

        {/* Gestational Badge */}
        {gestationalStatus && (
          <div className="flex items-center gap-3 bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm shrink-0">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              {gestationalStatus.weeksSA} SA
            </div>
            <div className="text-left">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Votre stade
              </span>
              <span className="text-xs font-bold text-slate-800">
                Trimestre {gestationalStatus.trimester}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. RECHERCHE RAPIDE PAR PROBLÈME & RECOMMANDATIONS PERSONNALISÉES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recherche par problème */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-rose-200 text-xs font-semibold">
              <Search className="w-3.5 h-3.5" />
              Recherche intelligente par problème
            </div>
            <h3 className="text-lg md:text-xl font-bold font-serif">
              Un désagrément ou une question précise ?
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Tapez directement votre symptôme pour afficher immédiatement les conseils et vidéos correspondants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Suggestions fréquentes :</span>
            {[
              { label: 'Nausées', query: 'nausée' },
              { label: 'Mal de dos', query: 'mal de dos' },
              { label: 'Brûlures d\'estomac', query: 'reflux' },
              { label: 'Sommeil difficile', query: 'sommeil' },
              { label: 'Contractions', query: 'contractions' },
              { label: 'Toxoplasmose', query: 'toxoplasmose' },
            ].map((sugg) => (
              <button
                key={sugg.label}
                onClick={() => {
                  setSearchProblemQuery(sugg.query);
                  setActiveTab('advice');
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-rose-600 hover:text-white text-xs font-medium text-slate-200 transition-colors"
              >
                {sugg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Évaluation Rapide Callout */}
        <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-rose-600" />
              Évaluation clinique
            </div>
            <h4 className="text-base font-bold text-slate-900 font-serif">
              Un symptôme inhabituel ?
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Répondez à 10 questions médicales précises pour situer votre niveau d\'orientation (surveillance, avis, consultation ou urgence).
            </p>
          </div>

          <button
            onClick={() => setActiveTab('assessment')}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Faire l\'évaluation santé
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/90 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. ACTIVE SECTION CONTENT */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === 'advice' && (
          <AdviceLibrarySection
            initialCategory={selectedCategory}
            initialQuery={searchProblemQuery}
          />
        )}

        {activeTab === 'videos' && <VideosSection />}

        {activeTab === 'assessment' && (
          <HealthAssessmentSection
            onNavigateToFacilities={() => setActiveTab('facilities')}
            onNavigateToAdviceCategory={handleNavigateToCategory}
          />
        )}

        {activeTab === 'facilities' && <HealthFacilitiesSection />}

        {activeTab === 'creators' && <CreatorsSection />}

        {activeTab === 'saved' && (
          <SavedResourcesSection
            onNavigateToAdvice={() => setActiveTab('advice')}
            onNavigateToVideos={() => setActiveTab('videos')}
          />
        )}
      </motion.div>

      {/* 5. MANDATORY MEDICAL DISCLAIMER POLICY FOOTER */}
      <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-5 md:p-6 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-800">
            Charte médicale et politique de déontologie MAMAN+
          </p>
          <p>
            Les contenus publiés dans ce module sont issus des recommandations officielles de la Haute
            Autorité de Santé (HAS), de l\'Organisation Mondiale de la Santé (OMS), du Collège National
            des Gynécologues et Obstétriciens Français (CNGOF) et de l\'Assurance Maladie. Ils sont
            destinés à enrichir votre information et ne remplacent en aucun cas un diagnostic ou une
            prise en charge médicale personnalisée. En cas d\'urgence vitale ou obstétricale, composez le
            15 ou le 112 sans attendre.
          </p>
        </div>
      </div>
    </div>
  );
};
