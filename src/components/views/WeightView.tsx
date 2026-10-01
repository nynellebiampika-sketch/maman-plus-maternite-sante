import React, { useState, useMemo } from 'react';
import { Scale, Plus, TrendingUp, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageWrapper } from './PageWrapper';

export const WeightView: React.FC = () => {
  const { weightEntries, addWeightEntry, deleteWeightEntry } = useUserData();
  const { currentUser } = useAuth();

  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!val || val <= 30 || val >= 250) return;

    setIsSubmitting(true);
    await addWeightEntry({
      date: dateInput,
      weightKg: Math.round(val * 10) / 10,
      note: noteInput.trim() || undefined,
    });
    setWeightInput('');
    setNoteInput('');
    setIsSubmitting(false);
  };

  // Calculations
  const sortedEntries = useMemo(() => {
    return [...weightEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [weightEntries]);

  const latestWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weightKg : null;
  const initialWeight = currentUser?.prePregnancyWeightKg || (sortedEntries.length > 0 ? sortedEntries[0].weightKg : null);
  const totalGain = latestWeight && initialWeight ? Math.round((latestWeight - initialWeight) * 10) / 10 : null;

  // Real BMI calculation if height is available
  let calculatedBmi: number | null = null;
  if (latestWeight && currentUser?.heightCm && currentUser.heightCm > 0) {
    const heightM = currentUser.heightCm / 100;
    calculatedBmi = parseFloat((latestWeight / (heightM * heightM)).toFixed(1));
  }

  // SVG Chart points calculation
  const chartData = useMemo(() => {
    if (sortedEntries.length < 2) return null;

    const weights = sortedEntries.map((e) => e.weightKg);
    const minW = Math.floor(Math.min(...weights) - 1);
    const maxW = Math.ceil(Math.max(...weights) + 1);
    const rangeW = maxW - minW || 1;

    const width = 600;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;

    const points = sortedEntries.map((entry, index) => {
      const x = paddingX + (index / (sortedEntries.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((entry.weightKg - minW) / rangeW) * (height - paddingY * 2);
      return { x, y, weightKg: entry.weightKg, date: entry.date };
    });

    const pathD = points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    return { points, pathD, width, height, minW, maxW };
  }, [sortedEntries]);

  return (
    <PageWrapper id="view-weight">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <Scale className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Biométrie Maternelle</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Suivi du Poids
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Enregistrez régulièrement vos pesées pour visualiser votre courbe clinique sans jugement.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Dernier poids */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider">
            Poids actuel
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              {latestWeight !== null ? `${latestWeight} kg` : '—'}
            </span>
          </div>
          <p className="text-[12px] text-[#7A736B]">
            {sortedEntries.length > 0
              ? `Relevé le ${new Date(sortedEntries[sortedEntries.length - 1].date).toLocaleDateString('fr-FR')}`
              : 'Aucune pesée renseignée'}
          </p>
        </div>

        {/* Card 2: Évolution */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider">
            Évolution constatée
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span
              className={`font-serif text-3xl sm:text-4xl font-bold ${
                totalGain !== null && totalGain > 0 ? 'text-[#9E2A2B]' : 'text-[#1E1B18]'
              }`}
            >
              {totalGain !== null ? `${totalGain > 0 ? '+' : ''}${totalGain} kg` : '—'}
            </span>
          </div>
          <p className="text-[12px] text-[#7A736B]">
            {currentUser?.prePregnancyWeightKg
              ? `Depuis votre poids initial de ${currentUser.prePregnancyWeightKg} kg`
              : 'Poids avant grossesse non renseigné dans le profil'}
          </p>
        </div>

        {/* Card 3: IMC */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider">
            Indice de Masse Corporelle (IMC)
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              {calculatedBmi !== null ? calculatedBmi : '—'}
            </span>
            {calculatedBmi && <span className="text-[13px] text-[#69625A]">kg/m²</span>}
          </div>
          <p className="text-[12px] text-[#7A736B]">
            {currentUser?.heightCm
              ? `Calculé avec votre taille de ${currentUser.heightCm} cm`
              : 'Renseignez votre taille dans Mon Profil pour afficher l’IMC'}
          </p>
        </div>
      </div>

      {/* Form: Add New Weight Measurement */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4"
      >
        <h2 className="font-serif text-lg font-bold text-[#1E1B18] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#9E2A2B]" />
          <span>Enregistrer une nouvelle pesée</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#4A443E] mb-1">
              Poids (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              required
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Ex: 64.5"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[14px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#4A443E] mb-1">
              Date du relevé *
            </label>
            <input
              type="date"
              required
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#4A443E] mb-1">
              Note (facultatif)
            </label>
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ex: Pesée à jeun le matin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !weightInput}
            className="px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Ajout...' : 'Ajouter la pesée'}
          </button>
        </div>
      </form>

      {/* SVG Interactive Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1E1B18]">
          Courbe d'évolution pondérale
        </h2>

        {chartData ? (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-auto max-h-[260px]"
            >
              {/* Grid lines */}
              <line
                x1="30"
                y1="30"
                x2={chartData.width - 30}
                y2="30"
                stroke="#F0ECE5"
                strokeDasharray="4 4"
              />
              <line
                x1="30"
                y1="110"
                x2={chartData.width - 30}
                y2="110"
                stroke="#F0ECE5"
                strokeDasharray="4 4"
              />
              <line
                x1="30"
                y1="190"
                x2={chartData.width - 30}
                y2="190"
                stroke="#F0ECE5"
                strokeDasharray="4 4"
              />

              {/* Min and max labels */}
              <text x="5" y="35" fontSize="11" fill="#8C857E">
                {chartData.maxW} kg
              </text>
              <text x="5" y="195" fontSize="11" fill="#8C857E">
                {chartData.minW} kg
              </text>

              {/* Curved line with smooth CSS strokeDasharray transition */}
              <path
                d={chartData.pathD}
                fill="none"
                stroke="#9E2A2B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#9E2A2B"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#1E1B18"
                  >
                    {pt.weightKg}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="py-12 text-center text-[#7C746D] space-y-2">
            <TrendingUp className="w-8 h-8 text-[#CCC5BB] mx-auto" />
            <p className="text-[14px]">
              {sortedEntries.length === 0
                ? 'Aucune mesure enregistrée.'
                : 'Ajoutez au moins deux pesées pour générer votre courbe graphique.'}
            </p>
          </div>
        )}
      </div>

      {/* History Table */}
      {sortedEntries.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1E1B18]">
            Historique des pesées ({sortedEntries.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#F0ECE5] text-[#8C847D] uppercase text-[11px] font-semibold">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Poids (kg)</th>
                  <th className="pb-3">Semaine SA</th>
                  <th className="pb-3">Remarques</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EC]">
                {sortedEntries.slice().reverse().map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 pl-2 font-medium text-[#1E1B18]">
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 font-bold text-[#9E2A2B]">{entry.weightKg} kg</td>
                    <td className="py-3 text-[#69625A]">
                      {entry.gestationalWeek ? `${entry.gestationalWeek} SA` : '—'}
                    </td>
                    <td className="py-3 text-[#69625A] italic">{entry.note || '—'}</td>
                    <td className="py-3 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => deleteWeightEntry(entry.id)}
                        className="p-1.5 rounded-lg text-[#8C847D] hover:text-[#9E2A2B] hover:bg-[#FEECEC] cursor-pointer"
                        title="Supprimer la pesée"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
