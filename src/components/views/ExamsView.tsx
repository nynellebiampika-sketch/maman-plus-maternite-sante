import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  User,
  Trash2,
  Edit3,
  X,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  RotateCcw,
  Sparkles,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { MedicalExam } from '../../types';
import { PageWrapper } from './PageWrapper';

type SortOption = 'date_desc' | 'date_asc' | 'type_asc' | 'title_asc';
type StatusFilter = 'all' | 'Effectué' | 'En attente' | 'À planifier';
type TypeFilter = 'all' | 'Échographie' | 'Prise de sang' | "Analyse d'urine" | 'Dépistage diabète' | 'Consultation anesthésie' | 'Autre';

export const ExamsView: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam } = useUserData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TypeFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [type, setType] = useState<MedicalExam['type']>('Échographie');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [practitioner, setPractitioner] = useState('');
  const [facility, setFacility] = useState('');
  const [results, setResults] = useState('');
  const [status, setStatus] = useState<MedicalExam['status']>('Effectué');

  // Counts by type for filter badges
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: exams.length,
      'Échographie': 0,
      'Prise de sang': 0,
      'Analyse d\'urine': 0,
      'Dépistage diabète': 0,
      'Consultation anesthésie': 0,
      'Autre': 0,
    };

    exams.forEach((exam) => {
      if (counts[exam.type] !== undefined) {
        counts[exam.type]++;
      } else {
        counts['Autre']++;
      }
    });

    return counts;
  }, [exams]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: exams.length,
      'Effectué': 0,
      'En attente': 0,
      'À planifier': 0,
    };

    exams.forEach((exam) => {
      if (exam.status === 'Effectué') counts['Effectué']++;
      else if (exam.status === 'En attente' || exam.status === 'En attente de résultats') counts['En attente']++;
      else if (exam.status === 'À planifier' || exam.status === 'À venir') counts['À planifier']++;
    });

    return counts;
  }, [exams]);

  // Filter and Sort Logic
  const filteredAndSortedExams = useMemo(() => {
    return exams
      .filter((exam) => {
        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = exam.title?.toLowerCase().includes(q);
          const matchType = exam.type?.toLowerCase().includes(q);
          const matchPractitioner = exam.practitioner?.toLowerCase().includes(q) || exam.practitionerOrFacility?.toLowerCase().includes(q);
          const matchFacility = exam.facility?.toLowerCase().includes(q);
          const matchResults = exam.results?.toLowerCase().includes(q) || exam.resultOrRemarks?.toLowerCase().includes(q);
          const matchDate = exam.date?.toLowerCase().includes(q);

          if (!matchTitle && !matchType && !matchPractitioner && !matchFacility && !matchResults && !matchDate) {
            return false;
          }
        }

        // Type Filter
        if (selectedType !== 'all') {
          if (selectedType === 'Autre') {
            const standardTypes = [
              'Échographie',
              'Prise de sang',
              'Analyse d\'urine',
              'Dépistage diabète',
              'Consultation anesthésie',
            ];
            if (standardTypes.includes(exam.type)) {
              return false;
            }
          } else if (exam.type !== selectedType) {
            return false;
          }
        }

        // Status Filter
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'Effectué' && exam.status !== 'Effectué') {
            return false;
          }
          if (selectedStatus === 'En attente' && exam.status !== 'En attente' && exam.status !== 'En attente de résultats') {
            return false;
          }
          if (selectedStatus === 'À planifier' && exam.status !== 'À planifier' && exam.status !== 'À venir') {
            return false;
          }
        }

        // Date Range Filter
        if (startDate && exam.date < startDate) {
          return false;
        }
        if (endDate && exam.date > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'date_desc':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'date_asc':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'type_asc':
            return (a.type || '').localeCompare(b.type || '', 'fr');
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '', 'fr');
          default:
            return 0;
        }
      });
  }, [exams, searchQuery, selectedType, selectedStatus, sortOption, startDate, endDate]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedType !== 'all' ||
    selectedStatus !== 'all' ||
    startDate ||
    endDate
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSortOption('date_desc');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setType('Échographie');
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setPractitioner('');
    setFacility('');
    setResults('');
    setStatus('Effectué');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: MedicalExam) => {
    setEditingId(exam.id);
    setType(exam.type);
    setTitle(exam.title);
    setDate(exam.date);
    setPractitioner(exam.practitioner || exam.practitionerOrFacility || '');
    setFacility(exam.facility || '');
    setResults(exam.results || exam.resultOrRemarks || '');
    setStatus(exam.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (editingId) {
      await updateExam(editingId, {
        type,
        title: title.trim(),
        date,
        practitioner: practitioner.trim() || undefined,
        facility: facility.trim() || undefined,
        results: results.trim() || undefined,
        status,
      });
    } else {
      await addExam({
        type,
        title: title.trim(),
        date,
        practitioner: practitioner.trim() || undefined,
        facility: facility.trim() || undefined,
        results: results.trim() || undefined,
        status,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <PageWrapper id="view-exams">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <FileText className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Dossier Médical</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Examens & Bilans
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Archivage, recherche et suivi chronologique de vos échographies, prises de sang, analyses d'urine et consultations.
          </p>
        </div>

        <button
          type="button"
          id="btn-add-exam"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white text-[13.5px] font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un examen</span>
        </button>
      </div>

      {/* SEARCH, FILTER & SORT TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE6DF] shadow-xs space-y-4">
        {/* Row 1: Search input and Sort dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C847D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-exam-input"
              type="text"
              placeholder="Rechercher par titre, médecin, laboratoire, résultat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-[#FAF8F5] hover:bg-[#F5F2EB] focus:bg-white rounded-xl border border-[#DCD6CC] focus:border-[#9E2A2B] text-[13.5px] text-[#1E1B18] placeholder:text-[#8C847D] outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                id="clear-search-exam-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C847D] hover:text-[#1E1B18] rounded-md transition-colors"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] rounded-xl border border-[#DCD6CC] text-[13px] text-[#554F49]">
              <ArrowUpDown className="w-4 h-4 text-[#9E2A2B] shrink-0" />
              <span className="text-[12px] font-medium text-[#8C847D] hidden sm:inline">Trier par :</span>
              <select
                id="sort-exams-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent font-semibold text-[#1E1B18] outline-none cursor-pointer text-[13px]"
              >
                <option value="date_desc">Date (Plus récent d'abord)</option>
                <option value="date_asc">Date (Plus ancien d'abord)</option>
                <option value="type_asc">Type d'examen (A → Z)</option>
                <option value="title_asc">Intitulé (A → Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Category Pills for Exam Type */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-[#8C847D] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#9E2A2B]" />
              Filtrer par type d'examen
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                id="reset-all-filters-btn"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[11.5px] text-[#9E2A2B] font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser les filtres
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'Tous les types', count: typeCounts['all'] },
              { id: 'Échographie', label: 'Échographies', count: typeCounts['Échographie'] },
              { id: 'Prise de sang', label: 'Prises de sang', count: typeCounts['Prise de sang'] },
              { id: 'Analyse d\'urine', label: 'Analyses d\'urine', count: typeCounts['Analyse d\'urine'] },
              { id: 'Dépistage diabète', label: 'Dépistage diabète (HGPO)', count: typeCounts['Dépistage diabète'] },
              { id: 'Consultation anesthésie', label: 'Anesthésie', count: typeCounts['Consultation anesthésie'] },
              { id: 'Autre', label: 'Autres', count: typeCounts['Autre'] },
            ].map((tab) => {
              const isSelected = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`filter-type-${tab.id.replace(/[^a-zA-Z0-9]/g, '_')}`}
                  onClick={() => setSelectedType(tab.id as TypeFilter)}
                  className={`px-3 py-1.5 rounded-xl text-[12.5px] font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#9E2A2B] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF8F5] text-[#554F49] hover:bg-[#F2EFEB] hover:text-[#1E1B18] border border-[#EAE6DF]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#EAE6DF] text-[#69625A]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Secondary filters - Status & Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F5F2EB] text-[12.5px]">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C847D] font-medium mr-1">Statut :</span>
            {[
              { id: 'all', label: 'Tous', count: statusCounts['all'] },
              { id: 'Effectué', label: 'Effectués', count: statusCounts['Effectué'] },
              { id: 'En attente', label: 'En attente', count: statusCounts['En attente'] },
              { id: 'À planifier', label: 'À planifier', count: statusCounts['À planifier'] },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                id={`filter-status-${st.id.replace(/[^a-zA-Z0-9]/g, '_')}`}
                onClick={() => setSelectedStatus(st.id as StatusFilter)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[12px] font-medium ${
                  selectedStatus === st.id
                    ? 'bg-[#FAF5EC] text-[#8C5E24] border border-[#EEDDC6] font-bold'
                    : 'text-[#69625A] hover:bg-[#FAF8F5]'
                }`}
              >
                {st.label} ({st.count})
              </button>
            ))}
          </div>

          {/* Date range pickers */}
          <div className="flex items-center gap-2">
            <span className="text-[#8C847D] font-medium">Période :</span>
            <input
              type="date"
              id="filter-date-start"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-[#FAF8F5] border border-[#DCD6CC] rounded-lg text-[11.5px] text-[#1E1B18] outline-none"
              title="Date de début"
            />
            <span className="text-[#8C847D]">à</span>
            <input
              type="date"
              id="filter-date-end"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-[#FAF8F5] border border-[#DCD6CC] rounded-lg text-[11.5px] text-[#1E1B18] outline-none"
              title="Date de fin"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[#9E2A2B] hover:underline text-[11px] font-medium"
              >
                Effacer dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-[13px] text-[#69625A]">
        <div>
          <span>
            Affichage de <strong>{filteredAndSortedExams.length}</strong> examen(s) sur {exams.length} au total
          </span>
          {hasActiveFilters && (
            <span className="ml-2 text-[11.5px] px-2 py-0.5 rounded-md bg-[#FAF5EC] text-[#8C5E24] font-medium">
              Filtres actifs
            </span>
          )}
        </div>
      </div>

      {/* Exam Cards / Empty state */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex items-center justify-center text-[#8C847D] mx-auto mb-4">
            <FileText className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-2">
            Aucun examen enregistré.
          </h2>
          <p className="text-[14px] text-[#69625A] leading-relaxed mb-6">
            Consignez ici les conclusions de vos 3 échographies obligatoires, vos bilans sanguins
            (toxoplasmose, rubéole, NFS) ou votre consultation anesthésie.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white font-medium text-[13.5px] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier examen</span>
          </button>
        </div>
      ) : filteredAndSortedExams.length === 0 ? (
        /* Empty state after search/filter */
        <div
          id="no-filtered-exams-banner"
          className="bg-white rounded-3xl p-8 sm:p-10 border border-[#EAE6DF] shadow-xs text-center max-w-lg mx-auto my-6 space-y-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
            Aucun examen ne correspond à votre recherche
          </h3>
          <p className="text-[13.5px] text-[#69625A]">
            Aucun examen médical ne correspond aux critères de recherche ou aux filtres sélectionnés.
          </p>
          <div className="pt-2">
            <button
              type="button"
              id="reset-filter-empty-btn"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13px] font-semibold transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser tous les filtres
            </button>
          </div>
        </div>
      ) : (
        /* List of Exam Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedExams.map((exam) => (
            <div
              key={exam.id}
              id={`exam-card-${exam.id}`}
              className="p-5 rounded-2xl border border-[#E2DDD5] bg-white shadow-xs space-y-3 hover:border-[#D0C8BD] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C5E24] border border-[#EEDDC6]">
                        {exam.type}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          exam.status === 'Effectué'
                            ? 'bg-[#E7F6EC] text-[#1B6A3B] border border-[#C5EAD0]'
                            : exam.status === 'En attente' || exam.status === 'En attente de résultats'
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            : 'bg-[#F3EFE9] text-[#695D50] border border-[#E5DFD6]'
                        }`}
                      >
                        {exam.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-[16px] text-[#1E1B18] leading-snug">{exam.title}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      id={`edit-exam-${exam.id}`}
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1.5 rounded-lg text-[#69625A] hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                      title="Modifier cet examen"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      id={`delete-exam-${exam.id}`}
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûre de vouloir supprimer l'examen « ${exam.title} » ?`)) {
                          deleteExam(exam.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#9E2A2B] hover:bg-[#FEECEC] cursor-pointer transition-colors"
                      title="Supprimer cet examen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-[12.5px] text-[#554F49]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                    <span>
                      Date :{' '}
                      <strong className="text-[#1E1B18]">
                        {new Date(exam.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>
                  {(exam.practitioner || exam.practitionerOrFacility) && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#8C847D] shrink-0" />
                      <span>{exam.practitioner || exam.practitionerOrFacility}</span>
                    </div>
                  )}
                  {exam.facility && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#8C847D] shrink-0" />
                      <span className="text-[#69625A]">{exam.facility}</span>
                    </div>
                  )}
                </div>

                {(exam.results || exam.resultOrRemarks) && (
                  <div className="text-[12.5px] text-[#3E3834] bg-[#FAF8F5] p-3 rounded-xl border border-[#EFECE5] leading-relaxed">
                    <span className="font-semibold block text-[11px] text-[#7A736B] uppercase mb-0.5">
                      Conclusions / Résultats :
                    </span>
                    {exam.results || exam.resultOrRemarks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAE6DF] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
                {editingId ? 'Modifier l’examen' : 'Enregistrer un examen médical'}
              </h3>
              <button
                type="button"
                id="close-exam-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C847D] hover:bg-[#F2EFEB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Type d'examen *
                  </label>
                  <select
                    id="exam-form-type-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as MedicalExam['type'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  >
                    <option value="Échographie">Échographie</option>
                    <option value="Prise de sang">Prise de sang / Bilan sanguin</option>
                    <option value="Analyse d'urine">Analyse d'urine (ECBU/Protéinurie)</option>
                    <option value="Dépistage diabète">Dépistage diabète (HGPO)</option>
                    <option value="Consultation anesthésie">Consultation anesthésie</option>
                    <option value="Autre">Autre examen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Statut *
                  </label>
                  <select
                    id="exam-form-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MedicalExam['status'])}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  >
                    <option value="Effectué">Effectué</option>
                    <option value="En attente">En attente de résultats</option>
                    <option value="À planifier">À planifier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Intitulé de l'examen *
                </label>
                <input
                  id="exam-form-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Échographie morphologique du 2e trimestre"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Date *
                  </label>
                  <input
                    id="exam-form-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Praticien
                  </label>
                  <input
                    id="exam-form-practitioner-input"
                    type="text"
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    placeholder="Ex: Dr. Échographiste"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Établissement / Laboratoire
                </label>
                <input
                  id="exam-form-facility-input"
                  type="text"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="Ex: Centre d'Imagerie de la Femme"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Résultats / Conclusions cliniques
                </label>
                <textarea
                  id="exam-form-results-textarea"
                  rows={3}
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  placeholder="Ex: Vitalité normale, biométries au 50e percentile, liquide amniotique normal..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE5]">
                <button
                  type="button"
                  id="cancel-exam-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-[#69625A] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  id="submit-exam-form-btn"
                  className="px-5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13px] font-medium shadow-xs transition-all cursor-pointer"
                >
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
