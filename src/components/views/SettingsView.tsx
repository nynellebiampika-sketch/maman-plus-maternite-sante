import React, { useState, useEffect } from 'react';
import {
  Settings,
  Download,
  Trash2,
  Lock,
  Bell,
  LogOut,
  Check,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PageWrapper } from './PageWrapper';
import { UserGuideSection } from '../UserGuideSection';
import { buildUserGuideDoc } from '../../services/pdfGenerator';
import { PdfPreviewModal } from '../PdfPreviewModal';

interface SettingsViewProps {
  initialTab?: 'general' | 'guide';
  onNavigate?: (path: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialTab = 'general',
  onNavigate,
}) => {
  const { currentUser, logout, changePassword } = useAuth();
  const { exportAllUserDataJson, exportHistoryCsv } = useUserData();

  const [activeTab, setActiveTab] = useState<'general' | 'guide'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // PDF Preview State for Guide in Settings
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    blobUrl: string;
    fileName: string;
    totalPages: number;
  } | null>(null);

  const handleOpenPdfGuide = async () => {
    try {
      setIsGeneratingPdf(true);
      const res = await buildUserGuideDoc(currentUser);
      setPdfPreviewData({
        blobUrl: res.blobUrl,
        fileName: res.fileName,
        totalPages: res.totalPages,
      });
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Erreur lors de la génération du Guide PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notificationsSound, setNotificationsSound] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);

    if (success) {
      setPasswordMsg({ type: 'success', text: 'Votre mot de passe a été modifié avec succès.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'Le mot de passe actuel est incorrect.' });
    }
  };

  const handleClearTestData = () => {
    if (
      window.confirm(
        'Attention : Êtes-vous certaine de vouloir réinitialiser vos données de suivi locales ? Cette action est irréversible.'
      )
    ) {
      if (currentUser) {
        localStorage.removeItem(`maman_symptoms_${currentUser.id}`);
        localStorage.removeItem(`maman_weights_${currentUser.id}`);
        localStorage.removeItem(`maman_appointments_${currentUser.id}`);
        localStorage.removeItem(`maman_baby_${currentUser.id}`);
        localStorage.removeItem(`maman_exams_${currentUser.id}`);
        localStorage.removeItem(`maman_journal_${currentUser.id}`);
        localStorage.removeItem(`maman_checklist_${currentUser.id}`);
        localStorage.removeItem(`maman_reminders_${currentUser.id}`);
        window.location.reload();
      }
    }
  };

  return (
    <PageWrapper id="view-settings">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <Settings className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Configuration & Confidentialité</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Paramètres
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Gérez vos exports de santé, la sécurité de votre compte et consultez le guide d'utilisation de MAMAN+.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            id="tab-settings-general"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[#1E1B18] text-white shadow-xs'
                : 'text-[#69625A] hover:text-[#1E1B18] hover:bg-[#FAF8F5]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres généraux</span>
          </button>

          <button
            type="button"
            id="tab-settings-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#9E2A2B] text-white shadow-xs'
                : 'text-[#69625A] hover:text-[#9E2A2B] hover:bg-[#FAF8F5]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Guide d’utilisation</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'guide' ? 'bg-white/20 text-white' : 'bg-[#FAF5EC] text-[#8C5E24]'
              }`}
            >
              17
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'guide' ? (
        <UserGuideSection onNavigate={onNavigate} />
      ) : (
        <div className="space-y-6 max-w-4xl">
          {/* Featured Section: Guide d'utilisation Banner in Settings */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF9] to-[#F7F3EB] rounded-3xl p-6 sm:p-7 border border-[#ECD9BD] shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C5E24] text-[11.5px] font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>SECTION OFFICIELLE</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#1E1B18]">
                  📖 Guide d’utilisation complet
                </h2>
                <p className="text-[13.5px] text-[#5A524A] leading-relaxed">
                  Découvrez simplement comment utiliser les 17 fonctionnalités de MAMAN+ : tableau de bord,
                  symptômes, poids, examens, ordonnance, checklist, journal et bien plus.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  id="settings-open-guide-btn"
                  onClick={() => setActiveTab('guide')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E1B18] hover:bg-[#332E2A] text-white text-[13px] font-medium shadow-2xs transition-all cursor-pointer"
                >
                  <span>Explorer le guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  id="settings-download-guide-btn"
                  disabled={isGeneratingPdf}
                  onClick={handleOpenPdfGuide}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white text-[13px] font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 Télécharger le guide PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Data & Medical Export */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4">
            <div className="border-b border-[#F0ECE5] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Download className="w-5 h-5 text-[#9E2A2B]" />
                <span>Exportation de vos données de santé</span>
              </h2>
              <p className="text-[13px] text-[#69625A]">
                Conformément à la confidentialité médicale, vous restez la seule propriétaire de vos données.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={exportAllUserDataJson}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] hover:border-[#DCD6CC] text-left transition-all group cursor-pointer"
              >
                <span className="font-bold text-[14px] text-[#1E1B18] group-hover:text-[#9E2A2B] block mb-1">
                  Dossier complet (JSON)
                </span>
                <p className="text-[12px] text-[#69625A]">
                  Sauvegarde exhaustive : profil, symptômes, courbe de poids, rendez-vous, examens,
                  journal et checklist.
                </p>
              </button>

              <button
                type="button"
                onClick={exportHistoryCsv}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] hover:border-[#DCD6CC] text-left transition-all group cursor-pointer"
              >
                <span className="font-bold text-[14px] text-[#1E1B18] group-hover:text-[#9E2A2B] block mb-1">
                  Tableau des symptômes (CSV)
                </span>
                <p className="text-[12px] text-[#69625A]">
                  Format tableur compatible Excel pour partager vos relevés avec votre équipe médicale.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Notifications & Reminders */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4">
            <div className="border-b border-[#F0ECE5] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#8C5E24]" />
                <span>Préférences de rappels</span>
              </h2>
            </div>

            <div className="divide-y divide-[#F5F2EC]">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[14px] text-[#1E1B18]">Alertes sonores</p>
                  <p className="text-[12px] text-[#69625A]">
                    Bip discret lors de la réception d'une notification
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsSound(!notificationsSound)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notificationsSound ? 'bg-[#1E653A]' : 'bg-[#D6D0C5]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationsSound ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[14px] text-[#1E1B18]">Rappel quotidien de bien-être</p>
                  <p className="text-[12px] text-[#69625A]">
                    Invitation douce à consigner votre météo intérieure
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyReminder(!dailyReminder)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    dailyReminder ? 'bg-[#1E653A]' : 'bg-[#D6D0C5]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      dailyReminder ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Security & Password */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4">
            <div className="border-b border-[#F0ECE5] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#3C3630]" />
                <span>Sécurité du compte</span>
              </h2>
              <p className="text-[13px] text-[#69625A]">
                Modifiez votre mot de passe pour protéger vos données de santé.
              </p>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-[13px] flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-[#E7F6EC] text-[#1B6A3B]'
                    : 'bg-[#FEECEC] text-[#9E2A2B]'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
              <div>
                <label className="block text-[12px] font-semibold text-[#4A443E] mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#4A443E] mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#4A443E] mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2 rounded-xl bg-[#1E1B18] hover:bg-[#332E2A] text-white text-[13px] font-medium shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>

          {/* Section 4: Maintenance & Logout */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-4">
            <div className="border-b border-[#F0ECE5] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#1E1B18]">
                Session & Maintenance
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <p className="font-medium text-[14px] text-[#1E1B18]">Déconnexion de l'application</p>
                <p className="text-[12px] text-[#69625A]">
                  Fermez votre session sécurisée sur cet appareil
                </p>
              </div>
              <button
                type="button"
                id="settings-logout-btn"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FEECEC] hover:bg-[#FCD8D8] text-[#9E2A2B] font-medium text-[13px] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#F5F2EC]">
              <div>
                <p className="font-medium text-[14px] text-[#9E2A2B]">Réinitialisation des données</p>
                <p className="text-[12px] text-[#69625A]">
                  Supprime les symptômes, pesées et rendez-vous enregistrés en cache local
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearTestData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#F0ECE5] text-[#8C847D] hover:text-[#9E2A2B] hover:bg-[#FAF8F5] text-[12.5px] font-medium transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Réinitialiser les données locales</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
            const a = document.createElement('a');
            a.href = pdfPreviewData.blobUrl;
            a.download = pdfPreviewData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        />
      )}
    </PageWrapper>
  );
};
