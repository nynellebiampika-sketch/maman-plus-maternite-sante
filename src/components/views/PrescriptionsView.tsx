import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Pill,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Prescription, PrescriptionMedication } from '../../types';
import {
  generatePrescriptionPdf,
  generatePregnancyReportPdf,
  buildPrescriptionDoc,
  buildPregnancyReportDoc,
} from '../../services/pdfGenerator';
import { calculateGestationalStatus } from '../../services/storage';
import { PdfPreviewModal } from '../PdfPreviewModal';

export const PrescriptionsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    prescriptions,
    addPrescription,
    updatePrescription,
    deletePrescription,
    symptomLogs,
    weightEntries,
    appointments,
    exams,
    babyInfo,
    journalEntries,
    reminders,
    checklist,
  } = useUserData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [previewPrescription, setPreviewPrescription] = useState<Prescription | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PDF Preview Modal State
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfModalBlobUrl, setPdfModalBlobUrl] = useState<string | null>(null);
  const [pdfModalTitle, setPdfModalTitle] = useState<string>('Document Médical');
  const [pdfModalSubtitle, setPdfModalSubtitle] = useState<string>('');
  const [pdfModalFileName, setPdfModalFileName] = useState<string>('Document.pdf');
  const [pdfModalTotalPages, setPdfModalTotalPages] = useState<number>(1);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  // Form State
  const [practitioner, setPractitioner] = useState('');
  const [practitionerRole, setPractitionerRole] = useState('Gynécologue-Obstétricien');
  const [facility, setFacility] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Active' | 'Terminée' | 'Archivée'>('Active');
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [medications, setMedications] = useState<PrescriptionMedication[]>([
    {
      id: 'med_1',
      name: '',
      dosage: '',
      duration: '',
      instructions: '',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setEditingPrescription(null);
    setPractitioner('');
    setPractitionerRole('Gynécologue-Obstétricien');
    setFacility('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Active');
    setGeneralInstructions('');
    setMedications([
      {
        id: `med_${Date.now()}`,
        name: '',
        dosage: '',
        duration: '',
        instructions: '',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (rx: Prescription) => {
    setEditingPrescription(rx);
    setPractitioner(rx.practitioner);
    setPractitionerRole(rx.practitionerRole || '');
    setFacility(rx.facility || '');
    setDate(rx.date);
    setStatus(rx.status);
    setGeneralInstructions(rx.generalInstructions || '');
    setMedications(
      rx.medications.length > 0
        ? [...rx.medications]
        : [
            {
              id: `med_${Date.now()}`,
              name: '',
              dosage: '',
              duration: '',
              instructions: '',
            },
          ]
    );
    setIsModalOpen(true);
  };

  const addMedicationRow = () => {
    setMedications([
      ...medications,
      {
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        name: '',
        dosage: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const updateMedicationRow = (index: number, field: keyof PrescriptionMedication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const removeMedicationRow = (index: number) => {
    if (medications.length <= 1) return;
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practitioner.trim()) {
      showToast('Veuillez renseigner le nom du professionnel de santé.');
      return;
    }

    const validMedications = medications.filter((m) => m.name.trim().length > 0);
    if (validMedications.length === 0) {
      showToast('Veuillez ajouter au moins un médicament avec son dosage.');
      return;
    }

    try {
      if (editingPrescription) {
        await updatePrescription(editingPrescription.id, {
          practitioner: practitioner.trim(),
          practitionerRole: practitionerRole.trim(),
          facility: facility.trim(),
          date,
          status,
          generalInstructions: generalInstructions.trim(),
          medications: validMedications,
        });
        showToast('Ordonnance mise à jour avec succès.');
      } else {
        await addPrescription({
          practitioner: practitioner.trim(),
          practitionerRole: practitionerRole.trim(),
          facility: facility.trim(),
          date,
          status,
          generalInstructions: generalInstructions.trim(),
          medications: validMedications,
        });
        showToast('Nouvelle ordonnance enregistrée avec succès.');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûre de vouloir supprimer cette ordonnance ?')) {
      await deletePrescription(id);
      showToast('Ordonnance supprimée.');
      if (previewPrescription?.id === id) {
        setPreviewPrescription(null);
      }
    }
  };

  const handleOpenPrescriptionPdfPreview = async (rx: Prescription) => {
    setIsPdfLoading(true);
    setPdfModalTitle(`Ordonnance Médicale - Dr. ${rx.practitioner.replace(/^Dr\.?\s*/i, '')}`);
    setPdfModalSubtitle(`Document A4 Officiel • Délivré le ${rx.date} • ${rx.facility || 'Cabinet Médical'}`);
    setIsPdfPreviewOpen(true);
    try {
      const { fileName, blobUrl, totalPages } = await buildPrescriptionDoc(rx, currentUser);
      setPdfModalBlobUrl(blobUrl);
      setPdfModalFileName(fileName);
      setPdfModalTotalPages(totalPages);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la préparation de l’aperçu.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleOpenFullReportPreview = async () => {
    setIsPdfLoading(true);
    setPdfModalTitle('Dossier Médical de Suivi de Grossesse');
    setPdfModalSubtitle(`Synthèse clinique A4 • ${[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Patiente'} • MAMAN+`);
    setIsPdfPreviewOpen(true);
    try {
      const { fileName, blobUrl, totalPages } = await buildPregnancyReportDoc({
        currentUser,
        symptomLogs,
        weightEntries,
        appointments,
        exams,
        prescriptions,
        babyInfo,
        journalEntries,
        reminders,
        checklist,
      });
      setPdfModalBlobUrl(blobUrl);
      setPdfModalFileName(fileName);
      setPdfModalTotalPages(totalPages);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la préparation du rapport.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleDownloadPrescriptionPdf = async (rx: Prescription) => {
    handleOpenPrescriptionPdfPreview(rx);
  };

  const handlePrintPrescription = (rx: Prescription) => {
    handleOpenPrescriptionPdfPreview(rx);
  };

  const handleSharePrescription = async (rx: Prescription) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ordonnance MAMAN+ - ${rx.practitioner}`,
          text: `Ordonnance médicale du ${rx.date} par ${rx.practitioner}. Contient ${rx.medications.length} médicament(s).`,
          url: window.location.href,
        });
      } catch {
        // Share dismissed
      }
    } else {
      handleOpenPrescriptionPdfPreview(rx);
    }
  };

  const handleDownloadFullReport = async () => {
    handleOpenFullReportPreview();
  };

  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="rx-toast-msg"
          className="fixed top-6 right-6 z-50 bg-[#1E1B18] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#3E3935] text-sm animate-fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE6DF] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEECEC] text-[#9E2A2B] text-xs font-semibold uppercase tracking-wider mb-2">
            <Pill className="w-3.5 h-3.5" />
            Espace Médical Sécurisé
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B18]">Mon ordonnance</h1>
          <p className="text-sm text-[#69625A] mt-1 max-w-2xl">
            Consultez, téléchargez et conservez vos ordonnances médicales en toute sécurité.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="download-pregnancy-report-btn"
            onClick={handleDownloadFullReport}
            disabled={isGeneratingReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F7F4] hover:bg-[#EAE6DF] text-[#1E1B18] border border-[#D5CFE1] font-semibold text-sm transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#9E2A2B]" />
            {isGeneratingReport ? 'Génération...' : 'Télécharger mon rapport de grossesse (PDF)'}
          </button>

          <button
            id="add-prescription-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white font-semibold text-sm transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ordonnance
          </button>
        </div>
      </div>

      {/* Medical Safety Disclaimer Banner */}
      <div
        id="medical-safety-banner"
        className="bg-[#F8F7F4] border border-[#EAE6DF] rounded-2xl p-4 sm:p-5 flex items-start gap-4"
      >
        <div className="w-9 h-9 rounded-xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <h2 className="font-semibold text-[#1E1B18] text-sm">Engagement de sécurité médicale</h2>
          <p className="text-[#69625A] text-xs sm:text-sm mt-0.5 leading-relaxed">
            MAMAN+ ne prescrit, n'invente et ne modifie aucun traitement. Cette section permet
            d'archiver fidèlement les ordonnances prescrites et validées par votre médecin ou sage-femme.
          </p>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-[#1E1B18] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9E2A2B]" />
            Mes ordonnances enregistrées ({prescriptions.length})
          </h2>
        </div>

        {prescriptions.length === 0 ? (
          <div
            id="no-prescriptions-card"
            className="bg-white rounded-2xl p-10 border border-[#EAE6DF] text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FEECEC] text-[#9E2A2B] mx-auto flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1E1B18]">Aucune ordonnance enregistrée</h3>
            <p className="text-sm text-[#69625A] max-w-md mx-auto mt-1 mb-6">
              Vous n'avez pas encore consigné d'ordonnance. Ajoutez les prescriptions délivrées par
              votre praticien pour générer vos PDF et les avoir toujours à portée de main.
            </p>
            <button
              id="empty-add-prescription-btn"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white font-semibold text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter ma première ordonnance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                id={`prescription-card-${rx.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DF] hover:border-[#D5CFE1] transition shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-[#F8F7F4]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E1B18] text-base leading-tight">
                          {rx.practitioner}
                        </h3>
                        <p className="text-xs text-[#69625A] mt-0.5 flex items-center gap-1">
                          {rx.practitionerRole && <span>{rx.practitionerRole}</span>}
                          {rx.facility && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Building className="w-3 h-3 text-[#8C847D]" />
                                {rx.facility}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                        rx.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rx.status === 'Terminée'
                          ? 'bg-gray-100 text-gray-700 border border-gray-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>

                  {/* Prescription Date */}
                  <div className="flex items-center gap-2 text-xs text-[#69625A] mb-4">
                    <Calendar className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>
                      Délivrée le{' '}
                      <strong className="text-[#1E1B18]">
                        {new Date(rx.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>

                  {/* Medications List */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-[#8C847D] uppercase tracking-wider">
                      Médicaments prescrits ({rx.medications.length})
                    </p>
                    <div className="space-y-2">
                      {rx.medications.map((med, idx) => (
                        <div
                          key={med.id || idx}
                          className="bg-[#F8F7F4] rounded-xl p-3 border border-[#EAE6DF] text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[#1E1B18] flex items-center gap-1.5 text-sm">
                              <Pill className="w-3.5 h-3.5 text-[#9E2A2B]" />
                              {med.name}
                            </span>
                            {med.duration && (
                              <span className="text-[#8C847D] font-medium bg-white px-2 py-0.5 rounded-md border border-[#EAE6DF]">
                                {med.duration}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[#69625A]">
                            <strong>Posologie :</strong> {med.dosage}
                          </div>
                          {med.instructions && (
                            <div className="mt-0.5 text-[#8C847D] italic">
                              « {med.instructions} »
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Instructions if any */}
                  {rx.generalInstructions && (
                    <div className="bg-[#FEECEC]/50 rounded-xl p-3 border border-[#FEECEC] text-xs text-[#69625A] mb-4">
                      <strong className="text-[#9E2A2B] block mb-0.5">Instructions :</strong>
                      {rx.generalInstructions}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 mt-2 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`edit-rx-${rx.id}`}
                      onClick={() => openEditModal(rx)}
                      className="p-2 text-[#69625A] hover:text-[#1E1B18] hover:bg-[#F8F7F4] rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-rx-${rx.id}`}
                      onClick={() => handleDelete(rx.id)}
                      className="p-2 text-[#69625A] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`consult-rx-${rx.id}`}
                      onClick={() => setPreviewPrescription(rx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EAE6DF] hover:bg-[#FAF8F5] text-[#1E1B18] text-xs font-semibold transition cursor-pointer"
                      title="Consulter l'ordonnance"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#69625A]" />
                      Consulter
                    </button>

                    <button
                      id={`download-pdf-rx-${rx.id}`}
                      onClick={() => handleDownloadPrescriptionPdf(rx)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9E2A2B] hover:bg-[#852324] text-white text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                      title="Télécharger PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Télécharger PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK PREVIEW MODAL */}
      {previewPrescription && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            id="prescription-preview-modal"
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#EAE6DF] animate-fade-in relative"
          >
            <button
              id="close-preview-modal"
              onClick={() => setPreviewPrescription(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Document Style */}
            <div className="border-b border-[#EAE6DF] pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#9E2A2B] text-white font-bold flex items-center justify-center text-xs">
                    M+
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1E1B18]">MAMAN+</h3>
                    <p className="text-[10px] text-[#8C847D]">Maternité & Santé</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#9E2A2B] tracking-wider uppercase">
                    ORDONNANCE
                  </span>
                  <p className="text-[11px] text-[#8C847D]">Réf : {previewPrescription.id.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Practitioner & Patient Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              <div className="bg-[#F8F7F4] p-3.5 rounded-xl border border-[#EAE6DF]">
                <span className="font-bold text-[#9E2A2B] block mb-1">MÉDECIN / PRATICIEN</span>
                <p className="font-bold text-[#1E1B18] text-sm">{previewPrescription.practitioner}</p>
                <p className="text-[#69625A]">{previewPrescription.practitionerRole}</p>
                {previewPrescription.facility && (
                  <p className="text-[#8C847D] mt-0.5">{previewPrescription.facility}</p>
                )}
              </div>

              <div className="bg-[#F8F7F4] p-3.5 rounded-xl border border-[#EAE6DF]">
                <span className="font-bold text-[#9E2A2B] block mb-1">PATIENTE</span>
                <p className="font-bold text-[#1E1B18] text-sm">
                  {[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Patiente'}
                </p>
                <p className="text-[#69625A]">Date : {previewPrescription.date}</p>
                {gestational && (
                  <p className="text-[#8C847D] mt-0.5">{gestational.weeksSA} SA (Trimestre {gestational.trimester})</p>
                )}
              </div>
            </div>

            {/* Medications Table */}
            <div className="mb-6">
              <h4 className="font-bold text-sm text-[#1E1B18] mb-3">PRESCRIPTION MÉDICALE</h4>
              <div className="space-y-3">
                {previewPrescription.medications.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] shadow-xs text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#1E1B18]">
                        {idx + 1}. {m.name}
                      </span>
                      {m.duration && (
                        <span className="px-2 py-0.5 rounded bg-[#F8F7F4] text-[#69625A] font-medium border border-[#EAE6DF]">
                          {m.duration}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[#69625A]">
                      <strong>Posologie :</strong> {m.dosage}
                    </p>
                    {m.instructions && (
                      <p className="mt-1 text-[#8C847D] italic">« {m.instructions} »</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* General Instructions */}
            {previewPrescription.generalInstructions && (
              <div className="bg-[#FEECEC] p-3.5 rounded-xl border border-[#FEECEC] text-xs text-[#69625A] mb-5">
                <strong className="text-[#9E2A2B] block mb-0.5">Instructions complémentaires :</strong>
                {previewPrescription.generalInstructions}
              </div>
            )}

            {/* Practitioner Stamp & Signature Box Preview */}
            <div className="mb-6 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E0DBD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#9E2A2B] uppercase tracking-wider text-[11px] block">
                  Cadre Réservé au Praticien
                </span>
                <p className="text-[#1E1B18] font-semibold">
                  Fait à {previewPrescription.facility || 'Cabinet médical'}, le {previewPrescription.date}
                </p>
                <p className="text-[#69625A]">
                  Dr. {previewPrescription.practitioner.replace(/^Dr\.?\s*/i, '')} {previewPrescription.practitionerRole ? `• ${previewPrescription.practitionerRole}` : ''}
                </p>
              </div>

              <div className="w-full sm:w-48 h-16 rounded-xl border border-dashed border-[#C5BFB5] bg-white flex flex-col items-center justify-center p-2 text-center text-[#8C847D]">
                <span className="text-[10px] italic">Zone de Signature & Cachet</span>
                <span className="text-[9px] text-[#A69F96]">Format officiel A4</span>
              </div>
            </div>

            {/* Notice */}
            <div className="text-[11px] text-[#8C847D] italic text-center mb-6">
              Document officiel A4 généré fidèlement à partir des données médicales enregistrées dans MAMAN+.
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#EAE6DF]">
              <button
                id="share-preview-btn"
                onClick={() => handleSharePrescription(previewPrescription)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EAE6DF] hover:bg-[#F8F7F4] text-[#1E1B18] text-xs font-semibold transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#69625A]" />
                Partager
              </button>
              <button
                id="download-preview-pdf-btn"
                onClick={() => handleDownloadPrescriptionPdf(previewPrescription)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-xs font-semibold transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Télécharger en PDF (Format A4)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRESCRIPTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            id="prescription-edit-modal"
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#EAE6DF] animate-fade-in relative"
          >
            <button
              id="close-edit-modal-btn"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FEECEC] text-[#9E2A2B] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1E1B18]">
                  {editingPrescription ? 'Modifier l’ordonnance' : 'Ajouter une ordonnance'}
                </h3>
                <p className="text-xs text-[#69625A]">
                  Renseignez fidèlement les informations délivrées par le professionnel de santé.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-5">
              {/* Row 1: Practitioner & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1.5">
                    Professionnel prescripteur *
                  </label>
                  <input
                    id="rx-practitioner-input"
                    type="text"
                    required
                    placeholder="Ex: Dr. Sarah Martin"
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] focus:border-[#9E2A2B] focus:ring-1 focus:ring-[#9E2A2B] text-sm text-[#1E1B18] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1.5">
                    Spécialité / Fonction
                  </label>
                  <input
                    id="rx-role-input"
                    type="text"
                    placeholder="Ex: Gynécologue, Sage-femme..."
                    value={practitionerRole}
                    onChange={(e) => setPractitionerRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] focus:border-[#9E2A2B] focus:ring-1 focus:ring-[#9E2A2B] text-sm text-[#1E1B18] outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Facility & Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1.5">
                    Établissement / Cabinet
                  </label>
                  <input
                    id="rx-facility-input"
                    type="text"
                    placeholder="Ex: Maternité Port-Royal"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] focus:border-[#9E2A2B] focus:ring-1 focus:ring-[#9E2A2B] text-sm text-[#1E1B18] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1.5">
                    Date de délivrance
                  </label>
                  <input
                    id="rx-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] focus:border-[#9E2A2B] focus:ring-1 focus:ring-[#9E2A2B] text-sm text-[#1E1B18] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1.5">
                    Statut du traitement
                  </label>
                  <select
                    id="rx-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] focus:border-[#9E2A2B] focus:ring-1 focus:ring-[#9E2A2B] text-sm text-[#1E1B18] outline-none bg-white"
                  >
                    <option value="Active">Active (En cours)</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Archivée">Archivée</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Medications List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
                    Médicaments prescrits *
                  </label>
                  <button
                    type="button"
                    id="add-med-row-btn"
                    onClick={addMedicationRow}
                    className="inline-flex items-center gap-1.5 text-xs text-[#9E2A2B] font-semibold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un médicament
                  </button>
                </div>

                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div
                      key={med.id || index}
                      className="p-4 rounded-2xl bg-[#F8F7F4] border border-[#EAE6DF] space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#9E2A2B]">Médicament #{index + 1}</span>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicationRow(index)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Nom du médicament (ex: Acide Folique 0.4mg)"
                            value={med.name}
                            onChange={(e) => updateMedicationRow(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DF] focus:border-[#9E2A2B] text-xs text-[#1E1B18] outline-none"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Posologie (ex: 1 comprimé par jour au petit-déjeuner)"
                            value={med.dosage}
                            onChange={(e) => updateMedicationRow(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DF] focus:border-[#9E2A2B] text-xs text-[#1E1B18] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Durée (ex: Tout le 1er trimestre)"
                            value={med.duration}
                            onChange={(e) => updateMedicationRow(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DF] focus:border-[#9E2A2B] text-xs text-[#1E1B18] outline-none"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Instructions de prise (ex: Prendre avec un grand verre d'eau)"
                            value={med.instructions}
                            onChange={(e) => updateMedicationRow(index, 'instructions', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE6DF] focus:border-[#9E2A2B] text-xs text-[#1E1B18] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1.5">
                  Consignes générales ou remarques du praticien
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Bilan sanguin à réaliser avant le prochain rendez-vous..."
                  value={generalInstructions}
                  onChange={(e) => setGeneralInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6DF] focus:border-[#9E2A2B] focus:ring-1 focus:ring-[#9E2A2B] text-xs text-[#1E1B18] outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE6DF]">
                <button
                  type="button"
                  id="cancel-rx-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#EAE6DF] hover:bg-[#F8F7F4] text-xs font-semibold text-[#69625A] transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  id="save-rx-submit-btn"
                  className="px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-xs font-semibold transition shadow-sm"
                >
                  {editingPrescription ? 'Mettre à jour' : 'Enregistrer l’ordonnance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        title={pdfModalTitle}
        subtitle={pdfModalSubtitle}
        blobUrl={pdfModalBlobUrl}
        fileName={pdfModalFileName}
        totalPages={pdfModalTotalPages}
        isLoading={isPdfLoading}
      />
    </div>
  );
};
