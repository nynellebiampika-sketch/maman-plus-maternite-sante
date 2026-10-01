import React, { useState } from 'react';
import { BellRing, Plus, Clock, Calendar, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { ReminderItem } from '../../types';
import { PageWrapper } from './PageWrapper';

export const RemindersView: React.FC = () => {
  const { reminders, addReminder, toggleReminder, deleteReminder } = useUserData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:30');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<ReminderItem['frequency']>('Quotidien');

  const handleOpenAdd = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('08:30');
    setDescription('');
    setFrequency('Quotidien');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;

    await addReminder({
      title: title.trim(),
      date,
      time,
      description: description.trim() || undefined,
      frequency,
      isActive: true,
    });

    setIsModalOpen(false);
  };

  return (
    <PageWrapper id="view-reminders">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <BellRing className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Alertes & Habitudes</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Rappels
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Configurez vos notifications pour les vitamines prénatales, l'hydratation et le repos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un rappel</span>
        </button>
      </div>

      {/* Reminder Cards / Empty State */}
      {reminders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex items-center justify-center text-[#8C847D] mx-auto mb-4">
            <BellRing className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-2">
            Aucun rappel configuré.
          </h2>
          <p className="text-[14px] text-[#69625A] leading-relaxed mb-6">
            Programmez des alarmes douces pour ne jamais oublier votre prise de fer, d’acide folique
            ou vos exercices de respiration.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white font-medium text-[13.5px] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer mon premier rappel</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between space-y-3 ${
                rem.isActive
                  ? 'border-[#E2DDD5] shadow-xs hover:border-[#D0C8BD]'
                  : 'border-[#EAE6DF] opacity-60 bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C5E24] border border-[#EEDDC6]">
                      {rem.frequency}
                    </span>
                    <span className="text-[12.5px] font-bold text-[#1E1B18] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8C847D]" />
                      {rem.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-[15px] text-[#1E1B18]">{rem.title}</h3>
                  {rem.description && (
                    <p className="text-[12.5px] text-[#69625A]">{rem.description}</p>
                  )}
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleReminder(rem.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    rem.isActive ? 'bg-[#1E653A]' : 'bg-[#D6D0C5]'
                  }`}
                  aria-label={rem.isActive ? 'Désactiver le rappel' : 'Activer le rappel'}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      rem.isActive ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE5] text-[12px] text-[#8C847D]">
                <span>Date de début : {new Date(rem.date).toLocaleDateString('fr-FR')}</span>
                <button
                  type="button"
                  onClick={() => deleteReminder(rem.id)}
                  className="p-1 rounded-lg text-[#8C847D] hover:text-[#9E2A2B] hover:bg-[#FEECEC] transition-colors cursor-pointer"
                  title="Supprimer le rappel"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAE6DF] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
                Nouveau rappel
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C847D] hover:bg-[#F2EFEB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Intitulé du rappel *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Prise de compléments vitaminiques (B9 & Fer)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Heure *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Fréquence
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ReminderItem['frequency'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  >
                    <option value="Quotidien">Quotidien (tous les jours)</option>
                    <option value="Hebdomadaire">Hebdomadaire</option>
                    <option value="Mensuel">Mensuel</option>
                    <option value="Une fois">Une seule fois</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Consigne ou note facultative
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: À prendre au milieu du petit déjeuner avec un grand verre d'eau"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-[#69625A] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13px] font-medium shadow-xs transition-all cursor-pointer"
                >
                  Créer le rappel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
