import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Download,
  Search,
  ExternalLink,
  Eye,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FileCheck,
  Stethoscope,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { USER_GUIDE_FEATURES, USER_GUIDE_CATEGORIES, UserGuideFeature } from '../data/userGuideData';
import { useAuth } from '../contexts/AuthContext';
import { buildUserGuideDoc, generateUserGuidePdf } from '../services/pdfGenerator';
import { PdfPreviewModal } from './PdfPreviewModal';

interface UserGuideSectionProps {
  onNavigate?: (path: string) => void;
  compactMode?: boolean;
}

export const UserGuideSection: React.FC<UserGuideSectionProps> = ({
  onNavigate,
  compactMode = false,
}) => {
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);

  // PDF Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    blobUrl: string;
    fileName: string;
    totalPages: number;
  } | null>(null);

  // Filtered features
  const filteredFeatures = useMemo(() => {
    return USER_GUIDE_FEATURES.filter((feat) => {
      const matchesCategory =
        selectedCategory === 'all' || feat.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        feat.name.toLowerCase().includes(query) ||
        feat.summary.toLowerCase().includes(query) ||
        feat.purpose.toLowerCase().includes(query) ||
        feat.badge.toLowerCase().includes(query) ||
        feat.categoryLabel.toLowerCase().includes(query) ||
        feat.recordableInfo.some((info) => info.toLowerCase().includes(query)) ||
        feat.keyActions.some((act) => act.toLowerCase().includes(query))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Open interactive PDF Preview
  const handleOpenPdfPreview = async () => {
    try {
      setIsGeneratingPdf(true);
      const result = await buildUserGuideDoc(currentUser);
      setPdfPreviewData({
        blobUrl: result.blobUrl,
        fileName: result.fileName,
        totalPages: result.totalPages,
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Erreur lors de la génération du Guide PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Direct PDF Download fallback
  const handleDirectDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateUserGuidePdf(currentUser);
    } catch (err) {
      console.error('Erreur lors du téléchargement direct du Guide PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleFeatureNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.dispatchEvent(
        new CustomEvent('maman-navigate', { detail: { path: route } })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Presentation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#9E2A2B] via-[#852324] to-[#671A1B] text-white p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-[#8C5E24]/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[12px] font-medium tracking-wide">
              <BookOpen className="w-3.5 h-3.5 text-[#FEECEC]" />
              <span>Guide d’utilisation officiel de MAMAN+</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Toutes vos fonctionnalités expliquées simplement
            </h2>

            <p className="text-white/85 text-[14px] sm:text-[14.5px] leading-relaxed">
              Découvrez le rôle de chaque espace, comment consigner vos données de santé,
              modifier vos constantes et exploiter les outils d'accompagnement de votre grossesse.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px] text-white/75">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC]" />
                17 modules détaillés
              </span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC]" />
                Conseils sages-femmes
              </span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#86EFAC]" />
                Format A4 imprimable
              </span>
            </div>
          </div>

          {/* Primary Call to Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              id="download-user-guide-btn"
              disabled={isGeneratingPdf}
              onClick={handleOpenPdfPreview}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#9E2A2B] hover:bg-[#FAF8F5] font-semibold text-[14px] shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98 disabled:opacity-60"
            >
              <Download className="w-4 h-4 text-[#9E2A2B]" />
              <span>
                {isGeneratingPdf ? 'Préparation du PDF...' : '📥 Télécharger le guide PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDirectDownload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-[12px] font-medium transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Téléchargement direct immédiat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Search & Category Chips */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE6DF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C847D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une fonctionnalité (poids, ordonnance, IA...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] text-[#1E1B18] placeholder:text-[#8C847D]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#8C847D] hover:text-[#1E1B18] px-1.5 py-0.5 rounded bg-[#EAE6DF]"
              >
                Effacer
              </button>
            )}
          </div>

          <div className="text-[12.5px] text-[#69625A] flex items-center gap-2 self-end sm:self-center">
            <Layers className="w-4 h-4 text-[#9E2A2B]" />
            <span>
              <strong>{filteredFeatures.length}</strong> sur {USER_GUIDE_FEATURES.length} fonctionnalités
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {USER_GUIDE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E1B18] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] hover:bg-[#F0ECE5] text-[#4A443E] border border-[#EAE6DF]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Cards Grid */}
      {filteredFeatures.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE6DF] space-y-3">
          <HelpCircle className="w-10 h-10 text-[#8C847D] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#1E1B18]">
            Aucune fonctionnalité ne correspond à votre recherche
          </h3>
          <p className="text-[13px] text-[#69625A] max-w-md mx-auto">
            Essayez avec d'autres mots-clés comme « poids », « bébé », « ordonnance », « calendrier » ou réinitialisez les filtres.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F0ECE5] text-[#9E2A2B] text-[13px] font-medium border border-[#EAE6DF] cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredFeatures.map((feat) => {
            const isExpanded = expandedFeatureId === feat.id;

            return (
              <div
                key={feat.id}
                id={`guide-feature-${feat.id}`}
                className="bg-white rounded-3xl border border-[#EAE6DF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6 sm:p-7 space-y-5">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                        {feat.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#8C5E24] tracking-wider uppercase">
                            Module {feat.number < 10 ? `0${feat.number}` : feat.number}
                          </span>
                          <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#69625A] border border-[#EAE6DF] font-medium">
                            {feat.categoryLabel}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
                          {feat.name}
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#FEECEC] text-[#9E2A2B] text-[11px] font-semibold tracking-wide shrink-0">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-[13.5px] text-[#4A443E] font-medium italic border-l-2 border-[#9E2A2B] pl-3 py-0.5">
                    « {feat.summary} »
                  </p>

                  {/* Section 1: À quoi elle sert */}
                  <div className="space-y-1.5">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#9E2A2B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>À quoi elle sert</span>
                    </h4>
                    <p className="text-[13px] text-[#4A443E] leading-relaxed">
                      {feat.purpose}
                    </p>
                  </div>

                  {/* Section 2: Comment l'utiliser */}
                  <div className="space-y-1.5">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1E653A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Comment l’utiliser</span>
                    </h4>
                    <p className="text-[13px] text-[#4A443E] leading-relaxed">
                      {feat.howToUse}
                    </p>
                  </div>

                  {/* Section 3: Informations enregistrables */}
                  <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#F0ECE5]">
                    <h4 className="text-[12px] font-bold text-[#1E1B18]">
                      📝 Informations que vous pouvez enregistrer :
                    </h4>
                    <ul className="space-y-1 pt-0.5">
                      {feat.recordableInfo.map((info, idx) => (
                        <li
                          key={idx}
                          className="text-[12.5px] text-[#5A524A] flex items-start gap-2"
                        >
                          <span className="text-[#9E2A2B] font-bold">•</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 4: Consulter et modifier */}
                  <div className="space-y-1">
                    <h4 className="text-[12px] font-bold text-[#1E1B18]">
                      🔍 Consulter et modifier vos données :
                    </h4>
                    <p className="text-[12.5px] text-[#69625A] leading-relaxed">
                      {feat.viewAndEdit}
                    </p>
                  </div>

                  {/* Section 5: Actions importantes */}
                  <div className="space-y-1.5">
                    <h4 className="text-[12px] font-bold text-[#1E1B18]">
                      ⚡ Actions importantes disponibles :
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {feat.keyActions.map((act, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#332E2A] border border-[#EAE6DF] font-medium"
                        >
                          <span className="text-[#1E653A]">✔</span>
                          <span>{act}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section 6: Conseil Sage-Femme */}
                  <div className="bg-[#FAF5EC] border border-[#ECD9BD] rounded-2xl p-3.5 flex items-start gap-2.5">
                    <Stethoscope className="w-4 h-4 text-[#8C5E24] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E24]">
                        Conseil Sage-Femme MAMAN+
                      </p>
                      <p className="text-[12.5px] text-[#5A4325] italic leading-relaxed">
                        {feat.proTip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Action button to test / open the feature */}
                <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EAE6DF] flex items-center justify-between">
                  <span className="text-[12px] text-[#8C847D]">
                    Route : <code className="font-mono text-[11px] text-[#69625A]">{feat.route}</code>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleFeatureNavigate(feat.route)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0ECE5] text-[#9E2A2B] text-[12.5px] font-semibold border border-[#DCD6CC] shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Accéder au module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Floating/Fixed CTA to Download PDF */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-lg font-bold text-[#1E1B18]">
            Besoin d’emporter ce guide complet avec vous ?
          </h3>
          <p className="text-[13px] text-[#69625A]">
            Générez un dossier A4 élégant avec couverture, sommaire et toutes les 17 rubriques imprimables.
          </p>
        </div>

        <button
          type="button"
          disabled={isGeneratingPdf}
          onClick={handleOpenPdfPreview}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#9E2A2B] hover:bg-[#852324] text-white font-medium text-[13.5px] shadow-sm transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>{isGeneratingPdf ? 'Génération...' : '📥 Télécharger le guide PDF'}</span>
        </button>
      </div>

      {/* PDF Canvas Preview Modal */}
      {pdfPreviewData && (
        <PdfPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Guide d'utilisation officiel MAMAN+"
          subtitle="Manuel complet d'accompagnement de grossesse • Format A4"
          blobUrl={pdfPreviewData.blobUrl}
          fileName={pdfPreviewData.fileName}
          totalPages={pdfPreviewData.totalPages}
          onDownload={() => {
            // Native download from the blob
            const a = document.createElement('a');
            a.href = pdfPreviewData.blobUrl;
            a.download = pdfPreviewData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        />
      )}
    </div>
  );
};
