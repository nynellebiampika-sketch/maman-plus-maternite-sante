import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  Printer,
  ExternalLink,
  FileText,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileCheck,
} from 'lucide-react';
import { BrandEmblem } from './BrandLogo';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker initialization error', e);
}

export interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  blobUrl: string | null;
  fileName: string;
  isLoading?: boolean;
  onDownload?: () => void;
  totalPages?: number;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  blobUrl,
  fileName,
  isLoading = false,
  onDownload,
  totalPages: propTotalPages,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(propTotalPages || 1);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  // Load PDF Document when blobUrl changes
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!isOpen || !blobUrl) {
        pdfDocRef.current = null;
        return;
      }

      setIsRendering(true);
      setRenderError(null);

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: blobUrl,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setIsRendering(false);
      } catch (err: any) {
        console.error('Error loading PDF with PDF.js:', err);
        if (!isCancelled) {
          setRenderError(err?.message || 'Erreur de rendu du PDF');
          setIsRendering(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, blobUrl]);

  // Render all pages onto canvas elements
  const renderAllPages = useCallback(async () => {
    const pdfDoc = pdfDocRef.current;
    const container = canvasContainerRef.current;
    if (!pdfDoc || !container) return;

    container.innerHTML = '';
    const scale = (zoomLevel / 100) * 1.5; // High resolution rendering multiplier

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Page Card wrapper
        const pageWrapper = document.createElement('div');
        pageWrapper.className =
          'relative bg-white shadow-xl rounded-lg border border-[#E0DBD2] overflow-hidden mb-8 transition-shadow';
        pageWrapper.style.width = `${viewport.width / 1.5}px`;
        pageWrapper.style.maxWidth = '100%';

        const canvas = document.createElement('canvas');
        canvas.className = 'w-full h-auto block';
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
        }

        // Page badge indicator
        const badge = document.createElement('div');
        badge.className =
          'absolute bottom-3 right-4 px-2.5 py-0.5 rounded-md bg-[#1E1B18]/70 text-white text-[11px] font-medium backdrop-blur-xs shadow-xs pointer-events-none select-none';
        badge.textContent = `Page ${pageNum} / ${pdfDoc.numPages}`;

        pageWrapper.appendChild(canvas);
        pageWrapper.appendChild(badge);
        container.appendChild(pageWrapper);
      } catch (err) {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, [zoomLevel]);

  // Trigger render when document or zoom changes
  useEffect(() => {
    if (pdfDocRef.current && !isRendering) {
      renderAllPages();
    }
  }, [renderAllPages, isRendering]);

  // Reset zoom and states when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (blobUrl) {
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
        return;
      }
    }
    window.print();
  };

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  const handleDownloadDirect = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'MAMAN_PLUS_Document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 160));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 60));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <div
      id="pdf-preview-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="pdf-preview-modal-container"
        className="relative w-full max-w-5xl h-[94vh] max-h-[950px] bg-[#2E2B28] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#4A453F] flex flex-col overflow-hidden animate-scale-up"
      >
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-[#FAF8F5] border-b border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E2D9] p-1 shadow-2xs shrink-0 flex items-center justify-center">
              <BrandEmblem size={28} className="rounded-lg shadow-2xs" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-[15px] sm:text-[17px] text-[#1E1B18] truncate">
                  {title}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEECEC] border border-[#FCD4D4] text-[#9E2A2B] text-[10px] font-bold uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 text-[#9E2A2B]" />
                  A4 Officiel
                </span>
              </div>
              <p className="text-[11.5px] text-[#69625A] truncate">
                {subtitle || `Document médical certifié • ${totalPages} ${totalPages > 1 ? 'pages' : 'page'} • MAMAN+`}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white border border-[#E0DBD2] rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                id="pdf-preview-zoom-out"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 60}
                className="p-1.5 rounded-lg text-[#69625A] hover:text-[#1E1B18] hover:bg-[#F4EFEB] disabled:opacity-40 transition cursor-pointer"
                title="Zoom arrière (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="pdf-preview-zoom-reset"
                onClick={handleResetZoom}
                className="px-2 py-1 text-[11px] font-bold text-[#4A453F] hover:bg-[#F4EFEB] rounded-md transition cursor-pointer"
                title="Réinitialiser le zoom (100%)"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                id="pdf-preview-zoom-in"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 160}
                className="p-1.5 rounded-lg text-[#69625A] hover:text-[#1E1B18] hover:bg-[#F4EFEB] disabled:opacity-40 transition cursor-pointer"
                title="Zoom avant (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print button */}
            <button
              type="button"
              id="pdf-preview-print-btn"
              onClick={handlePrint}
              disabled={isLoading || !blobUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E0DBD2] text-[#3E3834] text-[12px] font-semibold transition shadow-2xs cursor-pointer disabled:opacity-40"
              title="Imprimer le document"
            >
              <Printer className="w-3.5 h-3.5 text-[#69625A]" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            {/* Open in new tab */}
            <button
              type="button"
              id="pdf-preview-newtab-btn"
              onClick={handleOpenNewTab}
              disabled={isLoading || !blobUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E0DBD2] text-[#3E3834] text-[12px] font-semibold transition shadow-2xs cursor-pointer disabled:opacity-40"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#69625A]" />
              <span className="hidden md:inline">Ouvrir</span>
            </button>

            {/* Download Primary button */}
            <button
              type="button"
              id="pdf-preview-download-btn"
              onClick={handleDownloadDirect}
              disabled={isLoading || !blobUrl}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-[12.5px] font-bold transition shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              id="pdf-preview-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-[#69625A] hover:text-[#1E1B18] hover:bg-[#EAE6DF] transition cursor-pointer ml-0.5"
              title="Fermer la prévisualisation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (CANVAS DOCUMENT VIEWER) */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-[#23201D] p-3 sm:p-6 overflow-y-auto overflow-x-auto flex flex-col items-center justify-start scrollbar-thin scrollbar-thumb-[#4A453F] scrollbar-track-[#1E1B18]"
        >
          {isLoading || isRendering ? (
            <div className="my-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#9E2A2B]/20 border border-[#9E2A2B]/40 flex items-center justify-center text-[#E08A8B] animate-pulse">
                  <FileText className="w-7 h-7 text-[#E08A8B]" />
                </div>
                <RefreshCw className="w-5 h-5 text-white animate-spin absolute -top-1 -right-1" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-white">
                  Préparation du document haute fidélité...
                </h4>
                <p className="text-xs text-[#A89F91] max-w-sm">
                  Génération des pages A4 avec logo officiel MAMAN+, en-têtes et éléments cliniques certifiés.
                </p>
              </div>
            </div>
          ) : renderError ? (
            <div className="my-auto flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-lg max-w-md">
              <FileText className="w-10 h-10 text-[#9E2A2B]" />
              <h4 className="font-bold text-sm text-[#1E1B18]">Prévisualisation prête</h4>
              <p className="text-xs text-[#69625A]">
                Le document PDF est prêt à être téléchargé ou ouvert directement dans votre navigateur.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleDownloadDirect}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le PDF
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E0DBD2] text-[#3E3834] text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ouvrir
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={canvasContainerRef}
              className="w-full flex flex-col items-center transition-all duration-150 ease-out"
            />
          )}
        </div>

        {/* MODAL FOOTER BAR */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FAF8F5] border-t border-[#EAE6DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#69625A]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11.5px]">
              Document officiel A4 généré par MAMAN+ avec emblème haute définition, cadre médical et pied de page certifié.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E0DBD2] bg-white hover:bg-[#FAF8F5] text-[#4A453F] font-semibold text-[12px] transition cursor-pointer"
            >
              Fermer l'aperçu
            </button>
            <button
              type="button"
              onClick={handleDownloadDirect}
              disabled={isLoading || !blobUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white font-bold text-[12px] transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger le PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

