import React, { useState } from 'react';
import { User, Mail, Calendar, Ruler, Scale, Check, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserInitials, calculateGestationalStatus } from '../../services/storage';
import { PageWrapper } from './PageWrapper';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '');
  const [lastMenstrualPeriodDate, setLastMenstrualPeriodDate] = useState(
    currentUser?.lastMenstrualPeriodDate || ''
  );
  const [dueDate, setDueDate] = useState(currentUser?.dueDate || '');
  const [heightCm, setHeightCm] = useState(currentUser?.heightCm ? String(currentUser.heightCm) : '');
  const [prePregnancyWeightKg, setPrePregnancyWeightKg] = useState(
    currentUser?.prePregnancyWeightKg ? String(currentUser.prePregnancyWeightKg) : ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const initials = getUserInitials(firstName, lastName);
  const gestational = calculateGestationalStatus(lastMenstrualPeriodDate, dueDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate || undefined,
      lastMenstrualPeriodDate: lastMenstrualPeriodDate || undefined,
      dueDate: dueDate || undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      prePregnancyWeightKg: prePregnancyWeightKg ? parseFloat(prePregnancyWeightKg) : undefined,
    });

    setIsSaving(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3500);
  };

  return (
    <PageWrapper id="view-profile">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <User className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Identité & Dossier</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Mon Profil
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Gérez vos repères cliniques personnels et les informations de votre compte médical.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DF] shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-[#FAF6F6] border-2 border-[#9E2A2B]/20 flex items-center justify-center text-2xl font-bold font-serif text-[#9E2A2B] shadow-inner">
            {initials}
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-[#1E1B18]">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p className="text-[13px] text-[#69625A] flex items-center justify-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-[#8C847D]" />
              {currentUser?.email}
            </p>
          </div>

          {gestational ? (
            <div className="w-full bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFECE5] text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1E653A] uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5" />
                <span>Terme en cours</span>
              </div>
              <p className="font-bold text-[14px] text-[#1E1B18]">{gestational.badgeLabel}</p>
              <p className="text-[12px] text-[#7A736B]">Trimestre {gestational.trimester}</p>
            </div>
          ) : (
            <p className="text-[12px] text-[#8C847D] italic">
              Terme obstétrical non encore calculé (DDR ou DPA requise).
            </p>
          )}

          <div className="w-full pt-3 border-t border-[#F0ECE5] text-left text-[12px] text-[#7A736B] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#1E653A] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Données chiffrées & privées</span>
            </div>
            <p className="leading-relaxed">
              Vos constantes médicales ne sont ni partagées ni transmises à des tiers.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Editable Medical & Account Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DF] shadow-xs space-y-6">
          <div className="border-b border-[#F0ECE5] pb-3 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
              Informations médicales & personnelles
            </h3>
            {successMsg && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#1E653A] bg-[#E7F6EC] px-3 py-1 rounded-full animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Modifications enregistrées !
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
              />
            </div>

            <div className="pt-2 border-t border-[#F0ECE5]">
              <h4 className="text-[13px] font-bold text-[#1E1B18] uppercase tracking-wider mb-3">
                Dates de référence obstétricale
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Date des Dernières Règles (DDR)
                  </label>
                  <input
                    type="date"
                    value={lastMenstrualPeriodDate}
                    onChange={(e) => setLastMenstrualPeriodDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                  />
                  <span className="text-[11px] text-[#8C847D] mt-1 block">
                    Utilisée pour le calcul en SA (semaines d'aménorrhée).
                  </span>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Date Prévue d'Accouchement (DPA)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                  />
                  <span className="text-[11px] text-[#8C847D] mt-1 block">
                    Fixée lors de votre échographie du 1er trimestre.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0ECE5]">
              <h4 className="text-[13px] font-bold text-[#1E1B18] uppercase tracking-wider mb-3">
                Biométrie maternelle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Taille (en cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="220"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="Ex: 168"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Poids avant grossesse (en kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="200"
                    value={prePregnancyWeightKg}
                    onChange={(e) => setPrePregnancyWeightKg(e.target.value)}
                    placeholder="Ex: 58.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};
