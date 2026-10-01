import React, { useState } from 'react';
import { BookOpen, Plus, Calendar, Trash2, Edit3, X, Heart, Smile } from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { JournalEntry } from '../../types';
import { PageWrapper } from './PageWrapper';

export const JournalView: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useUserData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Sereine');

  const moods = ['Sereine', 'Émue', 'Heureuse', 'Fatiguée', 'Impatiente', 'Anxieuse', 'En forme'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setMood('Sereine');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setDate(entry.date);
    setContent(entry.content);
    setMood(entry.mood || 'Sereine');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingId) {
      await updateJournalEntry(editingId, {
        title: title.trim(),
        date,
        content: content.trim(),
        mood,
      });
    } else {
      await addJournalEntry({
        title: title.trim(),
        date,
        content: content.trim(),
        mood,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <PageWrapper id="view-journal">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Journal Intime</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Journal de Grossesse
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Vos pensées, doutes, souvenirs précieux et émotions consignés en toute intimité.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Écrire une page</span>
        </button>
      </div>

      {/* Entry Cards / Empty State */}
      {journalEntries.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex items-center justify-center text-[#8C847D] mx-auto mb-4">
            <BookOpen className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-2">
            Votre journal est vide.
          </h2>
          <p className="text-[14px] text-[#69625A] leading-relaxed mb-6">
            Prenez quelques minutes pour poser vos ressentis du jour, vos premières émotions à
            l'annonce ou une lettre à votre futur enfant.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white font-medium text-[13.5px] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Commencer mon journal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {journalEntries.map((entry) => (
            <article
              key={entry.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-3 hover:border-[#DCD6CC] transition-all group"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#F0ECE5] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.mood && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C5E24] border border-[#EEDDC6]">
                        {entry.mood}
                      </span>
                    )}
                    {entry.gestationalWeek && (
                      <span className="text-[11px] font-medium text-[#7C746D] bg-[#F5F2EC] px-2 py-0.5 rounded-md">
                        Semaine {entry.gestationalWeek} SA
                      </span>
                    )}
                    <span className="text-[12px] text-[#8C847D] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1E1B18] pt-1">
                    {entry.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded-lg text-[#69625A] hover:bg-[#FAF8F5] cursor-pointer"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="p-1.5 rounded-lg text-[#9E2A2B] hover:bg-[#FEECEC] cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-[14px] text-[#3A342E] leading-relaxed whitespace-pre-wrap font-sans">
                {entry.content}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAE6DF] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
                {editingId ? 'Modifier la page' : 'Nouvelle page du journal'}
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
                  Titre de la page *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Première fois que ton père a senti ton coup de pied"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Humeur / État d'esprit
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  >
                    {moods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Vos pensées & ressentis *
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez librement vos pensées du jour..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] leading-relaxed resize-none"
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
                  {editingId ? 'Mettre à jour' : 'Conserver dans mon journal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
