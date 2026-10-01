import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Check, ListChecks, Filter } from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { ChecklistItem } from '../../types';
import { PageWrapper } from './PageWrapper';

export const ChecklistView: React.FC = () => {
  const { checklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useUserData();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistItem['category']>('Valise Maternité');

  const categories: ChecklistItem['category'][] = [
    'Valise Maternité',
    'Administratif',
    'Chambre & Équipement',
    'Santé & Suivi',
    'Autre',
  ];

  const filteredItems = checklist.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addChecklistItem({
      title: newTitle.trim(),
      category: newCategory,
    });
    setNewTitle('');
  };

  // Pre-seed authentic essential maternity items ONLY if requested by the user
  const handleSeedEssentials = async () => {
    const essentials: { title: string; category: ChecklistItem['category'] }[] = [
      { title: 'Dossier médical d’obstétrique & carte de groupe sanguin', category: 'Administratif' },
      { title: 'Livret de famille ou reconnaissance anticipée', category: 'Administratif' },
      { title: 'Carte Vitale et attestation de mutuelle', category: 'Administratif' },
      { title: '3 bodys et 3 pyjamas en coton (taille naissance / 1 mois)', category: 'Valise Maternité' },
      { title: 'Bonnets en coton doux et chaussons pour bébé', category: 'Valise Maternité' },
      { title: 'Tenues confortables d’allaitement ou séjour pour maman', category: 'Valise Maternité' },
      { title: 'Trousse de toilette & brumisateur d’eau thermale', category: 'Valise Maternité' },
      { title: 'Lit ou berceau cododo certifié et matelas ferme', category: 'Chambre & Équipement' },
      { title: 'Siège auto (cosy groupe 0+) homologué pour la sortie', category: 'Chambre & Équipement' },
      { title: 'Consultation avec l’anesthésiste validée', category: 'Santé & Suivi' },
    ];

    for (const item of essentials) {
      await addChecklistItem(item);
    }
  };

  return (
    <PageWrapper id="view-checklist">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Organisation Maternité</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Checklist & Préparatifs
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Anticipez sereinement votre départ pour la maternité, vos démarches et l'arrivée de bébé.
          </p>
        </div>

        {checklist.length === 0 && (
          <button
            type="button"
            onClick={handleSeedEssentials}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DDD5] text-[#3E3834] text-[13px] font-medium transition-all shadow-2xs cursor-pointer"
          >
            <ListChecks className="w-4 h-4 text-[#8C5E24]" />
            <span>Charger les essentiels recommandés</span>
          </button>
        )}
      </div>

      {/* Progress Bar Banner */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[#1E1B18]">
              {completedCount} sur {totalCount} tâches terminées
            </span>
            <span className="font-bold text-[#9E2A2B]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#EFECE6] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1E653A] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EAE6DF]">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-[#1E1B18] text-white shadow-xs'
              : 'text-[#69625A] hover:bg-[#EFECE6]'
          }`}
        >
          Toutes ({totalCount})
        </button>
        {categories.map((cat) => {
          const count = checklist.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#1E1B18] text-white shadow-xs'
                  : 'text-[#69625A] hover:bg-[#EFECE6]'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Add Task Input Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs flex flex-col sm:flex-row gap-3 items-center"
      >
        <input
          type="text"
          required
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Ajouter une tâche (ex: Acheter le liniment oléo-calcaire)..."
          className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
        />

        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as ChecklistItem['category'])}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          Ajouter
        </button>
      </form>

      {/* Task List / Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-xl mx-auto my-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex items-center justify-center text-[#8C847D] mx-auto mb-4">
            <CheckSquare className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-2">
            Votre checklist est vide.
          </h2>
          <p className="text-[14px] text-[#69625A] leading-relaxed mb-6">
            Ajoutez vos propres préparatifs personnalisés ou chargez les indispensables de la valise
            de maternité recommandés par les sages-femmes.
          </p>
          <button
            type="button"
            onClick={handleSeedEssentials}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white font-medium text-[13.5px] shadow-xs transition-all cursor-pointer"
          >
            <ListChecks className="w-4 h-4" />
            <span>Charger les essentiels recommandés</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 bg-white ${
                item.completed
                  ? 'border-[#EAE6DF] bg-[#FAF8F5]/60 opacity-75'
                  : 'border-[#E2DDD5] shadow-2xs hover:border-[#D0C8BD]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    item.completed
                      ? 'bg-[#1E653A] border-[#1E653A] text-white shadow-2xs'
                      : 'border-[#CCC5BB] hover:border-[#9E2A2B] bg-white'
                  }`}
                  aria-label={item.completed ? 'Marquer non fait' : 'Marquer fait'}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13.5px] leading-snug transition-all ${
                      item.completed
                        ? 'line-through text-[#8C847D]'
                        : 'font-medium text-[#1E1B18]'
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-[11px] font-semibold text-[#8C847D] uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteChecklistItem(item.id)}
                className="p-1.5 rounded-lg text-[#8C847D] hover:text-[#9E2A2B] hover:bg-[#FEECEC] transition-colors cursor-pointer"
                title="Supprimer la tâche"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
