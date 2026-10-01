import React, { useState, useMemo, useEffect } from 'react';
import { X, TrendingUp, Scale, Plus, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { calculateGestationalStatus } from '../services/storage';
import { AnimatedCounter } from './AnimatedCounter';

interface WeightBmiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeightBmiModal: React.FC<WeightBmiModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { weightEntries, addWeightEntry } = useUserData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNote, setNewNote] = useState('');
  const [heightInput, setHeightInput] = useState(
    currentUser?.heightCm ? String(currentUser.heightCm) : '165'
  );
  const [isChartRendered, setIsChartRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsChartRendered(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsChartRendered(false);
    }
  }, [isOpen]);

  const gestational = useMemo(() => {
    return calculateGestationalStatus(
      currentUser?.lastMenstrualPeriodDate,
      currentUser?.dueDate
    );
  }, [currentUser]);

  // Calculations from real data
  const latestEntry = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;
  const initialWeight = currentUser?.prePregnancyWeightKg || (weightEntries[0]?.weightKg ?? null);

  const weightDelta = useMemo(() => {
    if (!latestEntry || initialWeight == null) return null;
    const diff = latestEntry.weightKg - initialWeight;
    return diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`;
  }, [latestEntry, initialWeight]);

  const realBmi = useMemo(() => {
    if (!latestEntry || !currentUser?.heightCm || currentUser.heightCm <= 0) return null;
    const heightM = currentUser.heightCm / 100;
    return (latestEntry.weightKg / (heightM * heightM)).toFixed(1);
  }, [latestEntry, currentUser?.heightCm]);

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(newWeight.replace(',', '.'));
    if (!parsedWeight || parsedWeight <= 30 || parsedWeight > 250) return;

    // If user provided height, save to profile
    if (!currentUser?.heightCm && heightInput) {
      await updateProfile({ heightCm: Number(heightInput) });
    }

    await addWeightEntry({
      date: newDate,
      weightKg: parsedWeight,
      note: newNote.trim() || undefined,
    });

    setNewWeight('');
    setNewNote('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAE6DF] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FBF9F6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEECEC] border border-[#FCD5D5] flex items-center justify-center text-[#9E2A2B]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#231F1D]">
                Courbe de Poids & Suivi IMC
              </h3>
              <p className="text-xs text-[#7A736B]">
                {gestational ? gestational.badgeLabel : 'Suivi pondéral personnalisé'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A736B] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Metric cards or Empty state indicator */}
          {latestEntry ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#EFECE5]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A837C]">
                  Poids Actuel
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#1E1B18]">
                    <AnimatedCounter value={latestEntry.weightKg} decimals={1} duration={650} />
                  </span>
                  <span className="text-sm font-medium text-[#7A736B]">kg</span>
                </div>
                {weightDelta && (
                  <span className="text-[11px] text-[#1E7441] font-medium mt-1 inline-block">
                    {weightDelta} depuis le départ
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#EFECE5]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A837C]">
                  IMC Gestationnel
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#1E1B18]">
                    {realBmi ? (
                      <AnimatedCounter value={parseFloat(realBmi)} decimals={1} duration={650} />
                    ) : (
                      '--.-'
                    )}
                  </span>
                  <span className="text-sm font-medium text-[#7A736B]">kg/m²</span>
                </div>
                <span className="text-[11px] text-[#1E7441] font-medium mt-1 inline-block">
                  {realBmi ? 'Calculé selon votre taille' : 'Renseigner la taille dans le profil'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#EFECE5]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A837C]">
                  Prise Cible
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#1E1B18]">11 - 16</span>
                  <span className="text-sm font-medium text-[#7A736B]">kg</span>
                </div>
                <span className="text-[11px] text-[#8A837C] font-medium mt-1 inline-block">
                  Recommandation standard
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] text-center space-y-2">
              <Scale className="w-8 h-8 text-[#9E2A2B] mx-auto opacity-80" />
              <h4 className="font-serif text-base font-semibold text-[#25221F]">
                Aucune mesure enregistrée
              </h4>
              <p className="text-[12.5px] text-[#7A736B] max-w-md mx-auto">
                Renseignez votre première pesée pour calculer votre IMC gestationnel et tracer votre courbe personnalisée.
              </p>
            </div>
          )}

          {/* Graphical Representation (Only when data exists) */}
          {weightEntries.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DF]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#2B2724] uppercase tracking-wider">
                  Progression de vos pesées
                </span>
                <span className="text-xs font-medium text-[#1E7441] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Suivi régulier
                </span>
              </div>

              {/* Dynamic SVG Chart from real user entries */}
              <div className="h-40 w-full flex items-end">
                {(() => {
                  const points = weightEntries.map((entry, idx) => {
                    const total = weightEntries.length;
                    const x = total === 1 ? 250 : 30 + (idx / (total - 1)) * 440;
                    const minW = Math.min(...weightEntries.map((e) => e.weightKg)) - 2;
                    const maxW = Math.max(...weightEntries.map((e) => e.weightKg)) + 2;
                    const range = Math.max(1, maxW - minW);
                    const y = 120 - ((entry.weightKg - minW) / range) * 80;
                    return { entry, x, y };
                  });
                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                  return (
                    <svg className="w-full h-full" viewBox="0 0 500 140">
                      {/* Reference guide band */}
                      <path
                        d="M 20 120 Q 250 90 480 35 L 480 75 Q 250 115 20 135 Z"
                        fill="#EBF8EE"
                        opacity="0.6"
                      />
                      {/* Progressive drawn stroke path */}
                      {points.length > 1 && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#9E2A2B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            strokeDasharray: 600,
                            strokeDashoffset: isChartRendered ? 0 : 600,
                            transition: 'stroke-dashoffset 850ms cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                        />
                      )}
                      {/* Animated points */}
                      {points.map((pt, idx) => (
                        <g
                          key={pt.entry.id}
                          style={{
                            transitionDelay: `${idx * 90}ms`,
                            transitionDuration: '400ms',
                          }}
                          className={`transform-gpu transition-all ease-out ${
                            isChartRendered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                          }`}
                        >
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="5"
                            fill="#9E2A2B"
                            stroke="#FFF"
                            strokeWidth="2"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 8}
                            textAnchor="middle"
                            className="text-[10px] font-semibold fill-[#9E2A2B]"
                          >
                            {pt.entry.weightKg} kg
                          </text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </div>

              <div className="flex justify-between text-[11px] text-[#8C847D] mt-2 border-t border-[#EAE6DF] pt-2">
                <span>Première pesée</span>
                <span className="font-semibold text-[#9E2A2B]">
                  Dernière : {latestEntry?.weightKg} kg ({latestEntry?.date})
                </span>
                <span>Prochaine pesée</span>
              </div>
            </div>
          )}

          {/* Add Weight Form toggle */}
          {showAddForm ? (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DF] space-y-3">
              <h4 className="font-semibold text-[13.5px] text-[#231F1D]">Ajouter une pesée</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">Poids (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 64.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>
              </div>

              {!currentUser?.heightCm && (
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">
                    Votre taille (cm) pour le calcul de l'IMC
                  </label>
                  <input
                    type="number"
                    placeholder="165"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[12px] text-[#554E47] mb-1">Remarque (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Pesée du matin à jeun"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-[12.5px] text-[#7A736B]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#9E2A2B] hover:bg-[#8B2324] hover:-translate-y-[1px] hover:shadow-md text-white text-[12.5px] font-medium shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Enregistrer la pesée
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#E2DDD5] text-[#9E2A2B] hover:bg-[#FDF0F0] hover:-translate-y-[0.5px] active:scale-[0.99] font-medium text-[13px] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une nouvelle pesée</span>
            </button>
          )}

          <div className="flex items-center gap-2 p-3 bg-[#FDF5EB] rounded-xl text-[12px] text-[#8C5E24] border border-[#F3DFCA]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              La pesée prénatale doit être réalisée de préférence le matin, à jeun, sur la même balance.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
