import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, Activity, Scale, ChevronRight, User } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');
  const { symptomLogs, appointments } = useUserData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Real search results from user's actual data
  const realItems = [
    // Standard app actions
    { category: 'Section', title: 'Conseils & Ressources (1000+ conseils, vidéos, évaluation)', icon: Activity, action: 'Conseils & Ressources' },
    { category: 'Section', title: 'Symptômes du Jour', icon: Activity, action: 'Symptômes' },
    { category: 'Section', title: 'Courbe de Poids & IMC', icon: Scale, action: 'Suivi du Poids' },
    { category: 'Section', title: 'Calendrier Médical', icon: Calendar, action: 'Calendrier' },
    { category: 'Profil', title: 'Mon Profil & Semaine de grossesse', icon: User, action: 'Mon Profil' },

    // Real symptom logs
    ...symptomLogs.map((log) => ({
      category: 'Symptôme enregistré',
      title: `${log.symptomName} (${log.stateLabel}) - ${log.date}`,
      icon: Activity,
      action: 'Symptômes',
    })),

    // Real appointments
    ...appointments.map((app) => ({
      category: 'Rendez-vous',
      title: `${app.title} - ${app.date} à ${app.time}`,
      icon: Calendar,
      action: 'Calendrier',
    })),
  ];

  const filtered = realItems.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#EFECE5]">
          <Search className="w-5 h-5 text-[#9C948D] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans votre dossier MAMAN+..."
            className="w-full text-[14px] text-[#24211E] placeholder-[#9E968F] focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#857E77] hover:bg-[#F4F1EA] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#9C948D]">
            {query ? 'Résultats correspondants' : 'Suggestions rapides'}
          </p>
          <div className="space-y-1 mt-1">
            {filtered.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#8C847D]">
                Aucun élément trouvé pour "{query}"
              </p>
            ) : (
              filtered.slice(0, 8).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectAction?.(item.action);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8F6F2] hover:translate-x-0.5 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F2EB] flex items-center justify-center text-[#7E776F] group-hover:text-[#9E2A2B] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#2C2825] line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#8C847D]">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B5AEA5] group-hover:text-[#9E2A2B] transition-colors shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-[#FAF8F5] px-4 py-2.5 border-t border-[#EFECE5] flex items-center justify-between text-[11.5px] text-[#8C847D]">
          <span>Appuyez sur <kbd className="font-mono bg-white px-1 py-0.5 border rounded">Échap</kbd> pour fermer</span>
          <span>Dossier Maternité Sécurisé</span>
        </div>
      </div>
    </div>
  );
};
