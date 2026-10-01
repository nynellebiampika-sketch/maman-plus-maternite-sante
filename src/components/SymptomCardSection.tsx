import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Moon,
  MoonStar,
  Flame,
  Sun,
  Save,
  AlignLeft,
  Check,
} from 'lucide-react';
import { BackPainIcon, NauseaIcon, HeavyLegsIcon } from './Icons';
import { SymptomIntensity, SymptomIconType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface SymptomCategoryConfig {
  id: string;
  name: string;
  iconType: SymptomIconType;
  defaultLabel: string;
}

const SYMPTOM_CATEGORIES: SymptomCategoryConfig[] = [
  { id: 'fatigue', name: 'Fatigue', iconType: 'fatigue', defaultLabel: 'Non évalué' },
  { id: 'nausees', name: 'Nausées', iconType: 'nausee', defaultLabel: 'Non évalué' },
  { id: 'maux-de-dos', name: 'Maux de dos', iconType: 'dos', defaultLabel: 'Non évalué' },
  { id: 'sommeil', name: 'Sommeil', iconType: 'sommeil', defaultLabel: 'Non évalué' },
  { id: 'brulures', name: 'Brûlures', iconType: 'brulures', defaultLabel: 'Non évalué' },
  { id: 'jambes-lourdes', name: 'Jambes lourdes', iconType: 'jambes', defaultLabel: 'Non évalué' },
  { id: 'vitalite', name: 'Vitalité', iconType: 'vitalite', defaultLabel: 'Non évalué' },
];

export const SymptomCardSection: React.FC = () => {
  const { currentUser } = useAuth();
  const { symptomLogs, addSymptomLog } = useUserData();

  const [selectedSymptomId, setSelectedSymptomId] = useState<string>('maux-de-dos');
  const [currentIntensity, setCurrentIntensity] = useState<SymptomIntensity>('Modérée');
  const [intensityVal, setIntensityVal] = useState<number>(2);
  const [midwifeNote, setMidwifeNote] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSectionLoaded, setIsSectionLoaded] = useState<boolean>(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsSectionLoaded(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Get current formatted time
  const formattedTime = useMemo(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Find latest log today for each symptom
  const latestLogsMap = useMemo(() => {
    const map = new Map<string, { state: string; intensity: SymptomIntensity }>();
    symptomLogs.forEach((log) => {
      if (!map.has(log.symptomId)) {
        map.set(log.symptomId, { state: log.stateLabel, intensity: log.intensity });
      }
    });
    return map;
  }, [symptomLogs]);

  const activeCategory =
    SYMPTOM_CATEGORIES.find((c) => c.id === selectedSymptomId) || SYMPTOM_CATEGORIES[2];

  const handleSelectSymptom = (id: string) => {
    setSelectedSymptomId(id);
    const existing = latestLogsMap.get(id);
    if (existing) {
      setCurrentIntensity(existing.intensity);
      setIntensityVal(
        existing.intensity === 'Légère' ? 1 : existing.intensity === 'Modérée' ? 2 : 3
      );
    }
  };

  const handleIntensityChange = (val: number) => {
    const map: Record<number, SymptomIntensity> = {
      1: 'Légère',
      2: 'Modérée',
      3: 'Intense',
    };
    const newIntensity = map[val] || 'Modérée';
    setIntensityVal(val);
    setCurrentIntensity(newIntensity);
  };

  const handleSave = async () => {
    let stateLabel: string = currentIntensity;
    if (activeCategory.id === 'maux-de-dos') {
      stateLabel = intensityVal === 1 ? 'Léger' : intensityVal === 2 ? 'Modéré' : 'Intense';
    } else if (activeCategory.id === 'sommeil') {
      stateLabel = intensityVal === 1 ? 'Reposant' : intensityVal === 2 ? 'Perturbé' : 'Insomnie';
    } else if (activeCategory.id === 'vitalite') {
      stateLabel = intensityVal === 1 ? 'Basse' : intensityVal === 2 ? 'Normale' : 'Active';
    } else if (activeCategory.id === 'nausees') {
      stateLabel = intensityVal === 1 ? 'Absente' : intensityVal === 2 ? 'Légère' : 'Forte';
    }

    await addSymptomLog({
      symptomId: activeCategory.id,
      symptomName: activeCategory.name,
      intensity: currentIntensity,
      intensityVal,
      stateLabel,
      note: midwifeNote.trim(),
    });

    setSavedSuccess(true);
    setMidwifeNote('');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const renderIcon = (iconType: SymptomIconType, isSelected: boolean) => {
    switch (iconType) {
      case 'fatigue':
        return <Moon className="w-5 h-5 text-[#8C3A3A] stroke-[1.8]" />;
      case 'nausee':
        return <NauseaIcon className="w-5 h-5 text-[#2D6A4F]" />;
      case 'dos':
        return (
          <BackPainIcon
            className={`w-5 h-5 ${isSelected ? 'text-[#9E2A2B]' : 'text-[#8C3A3A]'}`}
          />
        );
      case 'sommeil':
        return <MoonStar className="w-5 h-5 text-[#2D6A4F] stroke-[1.8]" />;
      case 'brulures':
        return <Flame className="w-5 h-5 text-[#A8422B] stroke-[1.8]" />;
      case 'jambes':
        return <HeavyLegsIcon className="w-5 h-5 text-[#5A524C]" />;
      case 'vitalite':
        return <Sun className="w-5 h-5 text-[#2D6A4F] stroke-[1.8]" />;
      default:
        return null;
    }
  };

  const greetingName = currentUser?.firstName?.trim();

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#9E2A2B] uppercase">
            POINT MÉTÉO INTÉRIEURE
          </span>
          <h2 className="font-serif text-[20px] sm:text-[23px] lg:text-[24px] text-[#1E1B18] font-normal tracking-tight mt-0.5">
            {greetingName
              ? `Comment vous sentez-vous en ce moment, ${greetingName} ?`
              : 'Comment vous sentez-vous en ce moment ?'}
          </h2>
        </div>

        {/* Time Badge */}
        <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F3EF] border border-[#E8E4DC] text-[#635C55] text-[12px] font-medium shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#7A736B]" />
          <span>Aujourd'hui, {formattedTime}</span>
        </div>
      </div>

      {/* 7 Symptom Cards Responsive Grid (2 cols mobile, 4 cols tablet, 7 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 mb-5">
        {SYMPTOM_CATEGORIES.map((cat, index) => {
          const isSelected = cat.id === selectedSymptomId;
          const recorded = latestLogsMap.get(cat.id);
          const displayLabel = recorded ? recorded.state : 'Non évalué';
          const hasRecordedToday = !!recorded;

          return (
            <button
              key={cat.id}
              type="button"
              id={`symptom-card-${cat.id}`}
              onClick={() => handleSelectSymptom(cat.id)}
              style={{ transitionDelay: `${index * 55}ms` }}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer text-center group h-[104px] border transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:scale-[0.98] ${
                isSectionLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2.5 scale-[0.98]'
              } ${
                isSelected
                  ? 'bg-[#FDF0F0] border-[#F8C8CB] shadow-xs ring-1 ring-[#9E2A2B]/20'
                  : 'bg-[#F8F7F4] border-transparent hover:bg-[#F2EFEB] hover:border-[#E8E4DD]'
              }`}
            >
              {/* Selected Red Dot Indicator */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#9E2A2B] animate-pulse transition-opacity duration-200" />
              )}

              {/* Icon Container with subtle scale on hover */}
              <div className="mb-2 flex items-center justify-center transform-gpu transition-transform duration-200 ease-out group-hover:scale-110">
                {renderIcon(cat.iconType, isSelected)}
              </div>

              {/* Title */}
              <span className="text-[13px] font-semibold text-[#25221F] leading-snug transition-colors duration-200">
                {cat.name}
              </span>

              {/* State Label */}
              <span
                className={`text-[11px] mt-0.5 leading-tight truncate max-w-[95%] transition-colors duration-200 ${
                  isSelected
                    ? 'text-[#9E2A2B] font-semibold'
                    : hasRecordedToday
                    ? 'text-[#1E7441] font-medium'
                    : 'text-[#9C948D]'
                }`}
              >
                {displayLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lower Gray Panel: Intensity Slider + Midwife Note */}
      <div className="bg-[#F8F7F4] rounded-2xl p-4 lg:p-5 border border-[#EFECE5]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          {/* Left: Intensity Controls (5 cols) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[13px] font-semibold text-[#262320]">
                Intensité ressentie :{' '}
                <span className="text-[#9E2A2B] font-semibold">{activeCategory.name}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#9E2A2B] text-white text-[11px] font-medium shadow-xs">
                {currentIntensity}
              </span>
            </div>

            {/* Range Slider */}
            <div className="relative pt-1 pb-1">
              <div className="relative h-1.5 w-full bg-[#E5E0D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9E2A2B] transition-all duration-200"
                  style={{
                    width:
                      intensityVal === 1 ? '15%' : intensityVal === 2 ? '50%' : '88%',
                  }}
                />
              </div>

              {/* Custom Thumb handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#9E2A2B] border-2 border-white shadow-md pointer-events-none transition-all duration-200"
                style={{
                  left: intensityVal === 1 ? '15%' : intensityVal === 2 ? '50%' : '88%',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Range input */}
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                id="intensity-range-slider"
                value={intensityVal}
                onChange={(e) => handleIntensityChange(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                aria-label={`Intensité de ${activeCategory.name}`}
              />
            </div>

            {/* Labels under slider */}
            <div className="flex justify-between text-[11.5px] text-[#7A736B] font-medium mt-2 px-0.5">
              <button
                type="button"
                onClick={() => handleIntensityChange(1)}
                className={`hover:text-[#9E2A2B] transition-colors cursor-pointer ${
                  intensityVal === 1 ? 'text-[#9E2A2B] font-semibold' : ''
                }`}
              >
                Légère
              </button>
              <button
                type="button"
                onClick={() => handleIntensityChange(2)}
                className={`hover:text-[#9E2A2B] transition-colors cursor-pointer ${
                  intensityVal === 2 ? 'text-[#9E2A2B] font-semibold' : ''
                }`}
              >
                Modérée
              </button>
              <button
                type="button"
                onClick={() => handleIntensityChange(3)}
                className={`hover:text-[#9E2A2B] transition-colors cursor-pointer ${
                  intensityVal === 3 ? 'text-[#9E2A2B] font-semibold' : ''
                }`}
              >
                Intense
              </button>
            </div>
          </div>

          {/* Right: Midwife Note & Save Button (7 cols) */}
          <div className="lg:col-span-7">
            <label
              htmlFor="midwife-note-input"
              className="block text-[13px] font-medium text-[#2C2825] mb-2"
            >
              Remarque pour la sage-femme (optionnel)
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <div className="relative flex items-center flex-1 bg-white rounded-xl border border-[#E0DBD2] px-3.5 py-2.5 shadow-xs focus-within:border-[#9E2A2B]/60 transition-all">
                <AlignLeft className="w-4 h-4 text-[#9E968F] mr-2.5 shrink-0" />
                <input
                  type="text"
                  id="midwife-note-input"
                  value={midwifeNote}
                  onChange={(e) => setMidwifeNote(e.target.value)}
                  placeholder="Ex: Tiraillement après 20 min de marche, soulagé allongée.."
                  className="w-full bg-transparent text-[12.5px] text-[#2C2825] placeholder-[#968F87] focus:outline-none"
                />
              </div>

              {/* Save Button */}
              <button
                type="button"
                id="save-tracking-btn"
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#8B2324] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(158,42,43,0.3)] text-white font-medium text-[13px] shadow-[0_2px_4px_rgba(158,42,43,0.2)] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[42px]"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Enregistré !</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Enregistrer dans mon suivi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
