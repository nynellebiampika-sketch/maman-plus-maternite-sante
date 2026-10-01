import React, { useState } from 'react';
import { Activity, Trash2, Calendar, Clock, Filter, Download } from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { SymptomCardSection } from '../SymptomCardSection';
import { RadarCard } from '../RadarCard';
import { PageWrapper } from './PageWrapper';

export const SymptomsView: React.FC = () => {
  const { symptomLogs, deleteSymptomLog, exportHistoryCsv } = useUserData();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const uniqueSymptoms = Array.from(new Set(symptomLogs.map((s) => s.symptomName)));

  const filteredLogs = symptomLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    return log.symptomName === selectedFilter;
  });

  return (
    <PageWrapper id="view-symptoms">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <Activity className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Météo Intérieure</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Symptômes & Signaux corporels
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Enregistrez vos ressentis quotidiens pour faciliter vos échanges avec votre sage-femme ou médecin.
          </p>
        </div>

        {symptomLogs.length > 0 && (
          <button
            type="button"
            onClick={exportHistoryCsv}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DDD5] text-[#3E3834] text-[13px] font-medium transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#69625A]" />
            <span>Exporter en CSV</span>
          </button>
        )}
      </div>

      {/* Symptom Logger Card */}
      <SymptomCardSection />

      {/* Analytics: Radar & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RadarCard />
        </div>

        {/* Quick summary card */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider">
              Statistiques d'écoute
            </span>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline border-b border-[#F0ECE5] pb-2">
                <span className="text-[13.5px] text-[#69625A]">Total des observations :</span>
                <span className="font-serif text-2xl font-bold text-[#1E1B18]">
                  {symptomLogs.length}
                </span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#F0ECE5] pb-2">
                <span className="text-[13.5px] text-[#69625A]">Types de ressentis notés :</span>
                <span className="font-semibold text-[15px] text-[#1E1B18]">
                  {uniqueSymptoms.length}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-[#7C746D] leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFECE5]">
            💡 En cas de saignements, céphalées persistantes, fièvre supérieure à 38°C ou diminution
            nette des mouvements de bébé, contactez sans attendre votre maternité de référence.
          </p>
        </div>
      </div>

      {/* Detailed History Table / List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE5] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1E1B18]">
              Historique complet des ressentis
            </h2>
            <p className="text-[13px] text-[#69625A]">
              Toutes vos saisies horodatées et classées par intensité.
            </p>
          </div>

          {uniqueSymptoms.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#8C847D]" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] text-[12.5px] text-[#3E3834] focus:outline-none focus:border-[#9E2A2B]"
              >
                <option value="all">Tous les symptômes</option>
                {uniqueSymptoms.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-[#7C746D] space-y-2">
            <Activity className="w-8 h-8 text-[#CCC5BB] mx-auto" />
            <p className="text-[14px]">Aucun enregistrement de symptôme pour le moment.</p>
            <p className="text-[12.5px] text-[#9C948D]">
              Utilisez le sélecteur ci-dessus pour consigner votre premier état.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[14.5px] text-[#1E1B18]">{log.symptomName}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EFECE5] text-[#554E46]">
                      {log.stateLabel}
                    </span>
                    {log.dayLabel && (
                      <span className="text-[11px] font-medium text-[#8C857E] bg-white px-2 py-0.5 rounded-md border border-[#E6E1D8]">
                        {log.dayLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[12px] text-[#7A736B]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {log.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {log.time}
                    </span>
                    <span>Intensité : {log.intensityVal}/5</span>
                  </div>

                  {log.note && (
                    <p className="text-[12.5px] text-[#5A534B] italic pt-1">"{log.note}"</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => deleteSymptomLog(log.id)}
                  className="self-end sm:self-center p-2 rounded-xl text-[#8C847D] hover:text-[#9E2A2B] hover:bg-[#FEECEC] transition-colors cursor-pointer"
                  title="Supprimer cet enregistrement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
