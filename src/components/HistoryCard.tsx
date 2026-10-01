import React, { useState } from 'react';
import { Download, CheckCircle2, ChevronRight, FileSpreadsheet, History } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';
import { AnimatedCounter } from './AnimatedCounter';

export const HistoryCard: React.FC = () => {
  const { symptomLogs, exportHistoryCsv } = useUserData();
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const handleExport = () => {
    if (symptomLogs.length === 0) return;
    exportHistoryCsv();
    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[380px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-serif text-[17px] font-semibold text-[#1E1B18] tracking-tight">
            Historique récent (7 jours)
          </h3>
          <p className="text-[12px] text-[#7A736B] mt-0.5">
            Synchronisé automatiquement avec le dossier médical
          </p>
        </div>

        {/* Tout exporter button (disabled if no logs) */}
        {symptomLogs.length > 0 && (
          <button
            type="button"
            id="export-history-btn"
            onClick={handleExport}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9E2A2B] hover:text-[#7D1E20] hover:underline active:scale-95 transition-all cursor-pointer shrink-0 mt-0.5"
          >
            <span>{exportedSuccess ? 'Fichier exporté !' : 'Tout exporter'}</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* History List or Elegant Empty State */}
      <div className="flex-1 flex flex-col justify-center">
        {symptomLogs.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-2.5 my-auto">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex items-center justify-center mx-auto text-[#9E2A2B]">
              <History className="w-5 h-5 text-[#9E2A2B]" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h4 className="font-serif text-[15px] font-semibold text-[#25221F]">
                Aucun historique enregistré
              </h4>
              <p className="text-[12px] text-[#7A736B] leading-relaxed">
                Votre historique apparaîtra ici après l'enregistrement de vos premières données dans le Point Météo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
            {symptomLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#FBF9F6] border border-[#EFEBE3] hover:border-[#E2DDD3] hover:bg-white hover:-translate-y-[0.5px] hover:shadow-2xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                {/* Left info: Date, tags, note */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#25221F]">
                      {log.date}
                    </span>
                    <span className="text-[11px] text-[#8C847D]">• {log.time}</span>
                    {log.dayLabel && (
                      <span className="text-[11px] text-[#7A736B] bg-[#EFEBE4] px-2 py-0.5 rounded-md font-medium">
                        {log.dayLabel}
                      </span>
                    )}

                    {/* Badge for recorded symptom */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium ${
                        log.intensity === 'Modérée' || log.symptomName.includes('dos')
                          ? 'bg-[#FEECEC] text-[#9E2A2B] border border-[#FAD7D7]'
                          : 'bg-[#F2EFE9] text-[#554E47]'
                      }`}
                    >
                      {log.symptomName} : {log.stateLabel}
                    </span>
                  </div>

                  {/* Optional user note */}
                  {log.note && (
                    <p className="text-[11.5px] text-[#69625B] line-clamp-1 italic">
                      "{log.note}"
                    </p>
                  )}
                </div>

                {/* Right: Sync check indicator */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#1E7441] font-medium shrink-0 self-end sm:self-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7441]" />
                  <span>Dossier à jour</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer reassurance */}
      <div className="pt-2.5 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] text-[#857E77] mt-2">
        <div className="flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#7A736B]" />
          <span>Accès direct réservé à la sage-femme référente</span>
        </div>
        <span className="text-[#3D3732] font-medium flex items-center gap-0.5">
          <AnimatedCounter value={symptomLogs.length} duration={500} /> entrée{symptomLogs.length > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
