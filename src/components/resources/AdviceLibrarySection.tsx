import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Filter,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { AdviceCategory, AdviceImportance, AdviceItem, AdviceTrimester } from '../../types';
import {
  ADVICE_CATEGORIES,
  ADVICE_IMPORTANCES,
  ADVICE_TRIMESTERS,
  ALL_ADVICE_DATABASE,
  getAdviceOfTheDay,
} from '../../data/adviceDatabase';
import { useUserData } from '../../contexts/UserDataContext';

interface AdviceLibrarySectionProps {
  initialCategory?: AdviceCategory;
  initialQuery?: string;
}

export const AdviceLibrarySection: React.FC<AdviceLibrarySectionProps> = ({
  initialCategory,
  initialQuery = '',
}) => {
  const { savedAdviceIds, toggleSaveAdvice, isAdviceSaved } = useUserData();

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<AdviceCategory | 'Toutes'>(
    initialCategory || 'Toutes'
  );
  const [selectedTrimester, setSelectedTrimester] = useState<AdviceTrimester>('Tous');
  const [selectedImportance, setSelectedImportance] = useState<AdviceImportance | 'Toutes'>('Toutes');
  const [activeAdviceModal, setActiveAdviceModal] = useState<AdviceItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination for smooth rendering of 1 000+ items
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 24;

  const adviceOfTheDay = useMemo(() => getAdviceOfTheDay(), []);

  // Filtered advice
  const filteredAdvice = useMemo(() => {
    let list = ALL_ADVICE_DATABASE;

    if (selectedCategory !== 'Toutes') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (selectedTrimester !== 'Tous') {
      list = list.filter((item) => item.trimester === selectedTrimester || item.trimester === 'Tous');
    }

    if (selectedImportance !== 'Toutes') {
      list = list.filter((item) => item.importance === selectedImportance);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, selectedTrimester, selectedImportance, searchQuery]);

  const totalPages = Math.ceil(filteredAdvice.length / ITEMS_PER_PAGE) || 1;
  const paginatedAdvice = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAdvice.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAdvice, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleShare = (item: AdviceItem) => {
    if (navigator.share) {
      navigator.share({
        title: `MAMAN+ : ${item.title}`,
        text: `${item.title} - ${item.summary}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${item.title}\n${item.summary}\nSource: ${item.source}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. CONSEIL DU JOUR */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white p-6 md:p-8 shadow-sm"
      >
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-rose-100">
              <BookOpen className="w-3.5 h-3.5 text-amber-200" />
              Conseil du jour
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white font-serif">
              {adviceOfTheDay.title}
            </h3>
            <p className="text-rose-100 text-sm md:text-base leading-relaxed line-clamp-2">
              {adviceOfTheDay.summary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-rose-200 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-200" />
                {adviceOfTheDay.source}
              </span>
              <span>•</span>
              <span className="bg-white/15 px-2 py-0.5 rounded text-rose-100">
                {adviceOfTheDay.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveAdviceModal(adviceOfTheDay)}
              className="px-5 py-2.5 rounded-xl bg-white text-rose-700 font-semibold text-sm hover:bg-rose-50 transition-colors shadow-sm active:scale-95"
            >
              Lire le conseil
            </button>
            <button
              onClick={() => toggleSaveAdvice(adviceOfTheDay.id)}
              aria-label="Enregistrer le conseil du jour"
              className={`p-2.5 rounded-xl transition-colors backdrop-blur-md border ${
                isAdviceSaved(adviceOfTheDay.id)
                  ? 'bg-white text-rose-600 border-white'
                  : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
              }`}
            >
              {isAdviceSaved(adviceOfTheDay.id) ? (
                <BookmarkCheck className="w-5 h-5 fill-current" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. BARRE DE RECHERCHE INTELLIGENTE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher parmi les 1 000+ conseils (ex: mal de dos, toxoplasmose, fer, nausées...)"
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Trimestre Filter */}
            <select
              value={selectedTrimester}
              onChange={(e) => {
                setSelectedTrimester(e.target.value as AdviceTrimester);
                setCurrentPage(1);
              }}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              {ADVICE_TRIMESTERS.map((t) => (
                <option key={t} value={t}>
                  {t === 'Tous' ? 'Tous trimestres' : t}
                </option>
              ))}
            </select>

            {/* Importance Filter */}
            <select
              value={selectedImportance}
              onChange={(e) => {
                setSelectedImportance(e.target.value as AdviceImportance | 'Toutes');
                setCurrentPage(1);
              }}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="Toutes">Toutes importances</option>
              {ADVICE_IMPORTANCES.map((imp) => (
                <option key={imp} value={imp}>
                  {imp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => {
                setSelectedCategory('Toutes');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'Toutes'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Toutes les catégories ({ALL_ADVICE_DATABASE.length})
            </button>
            {ADVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Counter results */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {filteredAdvice.length} conseil{filteredAdvice.length > 1 ? 's' : ''} trouvé
            {filteredAdvice.length > 1 ? 's' : ''}
          </span>
          {(selectedCategory !== 'Toutes' ||
            selectedTrimester !== 'Tous' ||
            selectedImportance !== 'Toutes' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('Toutes');
                setSelectedTrimester('Tous');
                setSelectedImportance('Toutes');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-rose-600 font-medium hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* 3. GRILLE DES CONSEILS */}
      {paginatedAdvice.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800">Aucun conseil ne correspond à votre recherche</h4>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Essayez d\'ajuster vos filtres ou de chercher un autre mot-clé (ex : dos, nausée, sommeil, alimentation).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedAdvice.map((advice) => {
            const isSaved = isAdviceSaved(advice.id);
            const isAlert = advice.importance === 'Alerte clinique';

            return (
              <motion.article
                key={advice.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col justify-between bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${
                  isAlert
                    ? 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                    : 'border-slate-200/90 hover:border-rose-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Tags & Importance */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                        isAlert
                          ? 'bg-rose-100 text-rose-700'
                          : advice.importance === 'Essentiel'
                          ? 'bg-amber-100 text-amber-800'
                          : advice.importance === 'Recommandé'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {advice.importance}
                    </span>

                    <button
                      onClick={() => toggleSaveAdvice(advice.id)}
                      aria-label="Enregistrer ce conseil"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {advice.category} • {advice.trimester}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug font-serif">
                      {advice.title}
                    </h4>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {advice.content}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                    {advice.source}
                  </span>

                  <button
                    onClick={() => setActiveAdviceModal(advice)}
                    className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Détails
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Précédent
          </button>

          <span className="text-xs text-slate-500 font-medium px-2">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Suivant
          </button>
        </div>
      )}

      {/* 5. MODAL DE LECTURE DU CONSEIL ENRICHI */}
      <AnimatePresence>
        {activeAdviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveAdviceModal(null)}
                className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                {/* Header Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      activeAdviceModal.importance === 'Alerte clinique'
                        ? 'bg-rose-100 text-rose-700'
                        : activeAdviceModal.importance === 'Essentiel'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activeAdviceModal.importance}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
                    {activeAdviceModal.category}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">
                    {activeAdviceModal.trimester}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-serif leading-tight">
                  {activeAdviceModal.title}
                </h3>

                {/* Content */}
                <div className="prose prose-slate max-w-none text-slate-700 text-sm md:text-base leading-relaxed">
                  <p>{activeAdviceModal.content}</p>
                </div>

                {/* Practical Tips */}
                {activeAdviceModal.practicalTips && activeAdviceModal.practicalTips.length > 0 && (
                  <div className="rounded-xl bg-rose-50/60 border border-rose-100 p-4 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-rose-600" />
                      Conseils pratiques au quotidien
                    </h5>
                    <ul className="space-y-1.5 text-xs md:text-sm text-slate-700">
                      {activeAdviceModal.practicalTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* When to consult alert */}
                {activeAdviceModal.whenToConsult && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Quand consulter un professionnel ?
                    </div>
                    <p className="text-xs md:text-sm text-amber-900 leading-relaxed">
                      {activeAdviceModal.whenToConsult}
                    </p>
                  </div>
                )}

                {/* Source & Clinical validation */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Source : {activeAdviceModal.source}</span>
                  </div>
                  <span className="text-slate-400">Dernière mise à jour : {activeAdviceModal.lastUpdated}</span>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleShare(activeAdviceModal)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedId === activeAdviceModal.id ? 'Copié !' : 'Partager'}
                  </button>

                  <button
                    onClick={() => toggleSaveAdvice(activeAdviceModal.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isAdviceSaved(activeAdviceModal.id)
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                    }`}
                  >
                    {isAdviceSaved(activeAdviceModal.id) ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 fill-current" />
                        Enregistré dans mes favoris
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        Enregistrer ce conseil
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
