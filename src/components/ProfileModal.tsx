import React, { useState } from 'react';
import { X, User, Heart, Scale, Calendar, Check, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserInitials, calculateGestationalStatus } from '../services/storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email] = useState(currentUser?.email || '');
  const [lastMenstrualPeriodDate, setLastMenstrualPeriodDate] = useState(
    currentUser?.lastMenstrualPeriodDate || ''
  );
  const [dueDate, setDueDate] = useState(currentUser?.dueDate || '');
  const [heightCm, setHeightCm] = useState<string>(
    currentUser?.heightCm ? String(currentUser.heightCm) : ''
  );
  const [prePregnancyWeightKg, setPrePregnancyWeightKg] = useState<string>(
    currentUser?.prePregnancyWeightKg ? String(currentUser.prePregnancyWeightKg) : ''
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !currentUser) return null;

  const initials = getUserInitials(firstName, lastName);
  const gestational = calculateGestationalStatus(lastMenstrualPeriodDate, dueDate);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      lastMenstrualPeriodDate: lastMenstrualPeriodDate || undefined,
      dueDate: dueDate || undefined,
      heightCm: heightCm ? Number(heightCm) : undefined,
      prePregnancyWeightKg: prePregnancyWeightKg ? Number(prePregnancyWeightKg) : undefined,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EAE6DF] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FBF9F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#9E2A2B] text-white flex items-center justify-center font-serif font-bold text-sm tracking-tight shadow-xs">
              {initials}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#231F1D]">
                Mon Profil Maternité
              </h3>
              <p className="text-xs text-[#7A736B]">
                Données cliniques & identité du dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A736B] hover:bg-[#EFECE6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
                Prénom
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
                Nom
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
              Adresse e-mail (Identifiant)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 bg-[#F2EFEB] border border-[#E0DBD2] rounded-xl text-[13px] text-[#78716A] cursor-not-allowed"
            />
          </div>

          {/* Pregnancy Dates & Live Calculation */}
          <div className="pt-2 border-t border-[#F0ECE5]">
            <div className="flex items-center gap-1.5 mb-2 text-[#9E2A2B] text-[12px] font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5" />
              <span>Calendrier de grossesse</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-[#554E47] mb-1">
                  Date des dernières règles (DDR)
                </label>
                <input
                  type="date"
                  value={lastMenstrualPeriodDate}
                  onChange={(e) => setLastMenstrualPeriodDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#554E47] mb-1">
                  Ou Date prévue de terme (DPA)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                />
              </div>
            </div>

            {/* Live calculation banner */}
            <div className="mt-2.5 p-3 rounded-xl bg-[#F4F9F5] border border-[#D5EAD9] flex items-center justify-between text-[12px]">
              <span className="text-[#1E653A] font-medium">
                {gestational
                  ? `Stade calculé : ${gestational.weeksSA} SA (${gestational.daysSA} j) • Trimestre ${gestational.trimester}`
                  : 'Renseignez votre DDR ou DPA pour calculer votre semaine de grossesse.'}
              </span>
            </div>
          </div>

          {/* Morphometry for BMI */}
          <div className="pt-2 border-t border-[#F0ECE5]">
            <div className="flex items-center gap-1.5 mb-2 text-[#5E5750] text-[12px] font-semibold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Morphologie & Constantes</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] text-[#554E47] mb-1">Taille (cm)</label>
                <input
                  type="number"
                  placeholder="Ex: 168"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[#554E47] mb-1">
                  Poids avant grossesse (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 62.5"
                  value={prePregnancyWeightKg}
                  onChange={(e) => setPrePregnancyWeightKg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0ECE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#7A736B] hover:text-[#2C2825]"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#8B2324] hover:-translate-y-[1px] hover:shadow-md active:scale-[0.98] text-white text-[13px] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profil mis à jour !</span>
                </>
              ) : isSaving ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
