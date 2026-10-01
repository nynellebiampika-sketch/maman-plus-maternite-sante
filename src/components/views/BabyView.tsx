import React, { useState } from 'react';
import { Smile, Heart, ShieldCheck, Edit3, Plus, Check, Calendar, Activity } from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { BabyInfo } from '../../types';
import { PageWrapper } from './PageWrapper';

export const BabyView: React.FC = () => {
  const { babyInfo, updateBabyInfo } = useUserData();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form local state
  const [nickname, setNickname] = useState(babyInfo?.nickname || '');
  const [gender, setGender] = useState<BabyInfo['gender']>(babyInfo?.gender || 'Non précisé');
  const [firstKicksDate, setFirstKicksDate] = useState(babyInfo?.firstKicksDate || '');
  const [movementNotes, setMovementNotes] = useState(babyInfo?.movementNotes || '');
  const [notes, setNotes] = useState(babyInfo?.notes || '');

  const handleStartEdit = () => {
    setNickname(babyInfo?.nickname || '');
    setGender(babyInfo?.gender || 'Non précisé');
    setFirstKicksDate(babyInfo?.firstKicksDate || '');
    setMovementNotes(babyInfo?.movementNotes || '');
    setNotes(babyInfo?.notes || '');
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateBabyInfo({
      nickname: nickname.trim() || undefined,
      gender,
      firstKicksDate: firstKicksDate || undefined,
      movementNotes: movementNotes.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const hasAnyBabyData =
    babyInfo &&
    (babyInfo.nickname ||
      babyInfo.gender !== 'Non précisé' ||
      babyInfo.firstKicksDate ||
      babyInfo.movementNotes ||
      babyInfo.notes);

  return (
    <PageWrapper id="view-baby">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <Smile className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Espace Bébé</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Bébé
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Suivi des observations réelles, des mouvements perçus et des notes d’échographie de votre bébé.
          </p>
        </div>

        {hasAnyBabyData && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DDD5] text-[#3E3834] text-[13px] font-medium transition-all shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-[#69625A]" />
            <span>Modifier les informations</span>
          </button>
        )}
      </div>

      {/* Empty State when no real info has been recorded */}
      {!hasAnyBabyData && !isEditing && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF6F6] border border-[#F3E1E1] flex items-center justify-center text-[#9E2A2B] mx-auto mb-5 shadow-2xs">
            <Smile className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-2">
            Les informations de votre bébé apparaîtront ici.
          </h2>
          <p className="text-[14px] text-[#69625A] leading-relaxed mb-6 max-w-md mx-auto">
            MAMAN+ ne génère aucune fausse mesure (poids, taille, sexe fictif). Vous pouvez
            enregistrer ici en toute intimité son surnom, la date de ses premiers coups de pied et
            les observations médicales issues de vos vraies échographies.
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white font-medium text-[14px] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter les informations réelles de bébé</span>
          </button>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DF] shadow-xs space-y-6 max-w-3xl"
        >
          <div className="border-b border-[#F0ECE5] pb-4">
            <h2 className="font-serif text-xl font-bold text-[#1E1B18]">
              Renseigner les informations de bébé
            </h2>
            <p className="text-[13px] text-[#69625A]">
              Toutes les données restent strictement privées et rattachées à votre compte.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1.5">
                Prénom ou surnom affectif
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: P'tit bout, Charly, Lou..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1.5">
                Genre
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as BabyInfo['gender'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] transition-all"
              >
                <option value="Non précisé">Non précisé</option>
                <option value="Fille">Fille</option>
                <option value="Garçon">Garçon</option>
                <option value="Surprise">Surprise pour la naissance</option>
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1.5">
                Date des premiers mouvements perçus
              </label>
              <input
                type="date"
                value={firstKicksDate}
                onChange={(e) => setFirstKicksDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1.5">
                Notes sur l'activité fœtale (ressentis, rythmes, coups)
              </label>
              <textarea
                rows={2}
                value={movementNotes}
                onChange={(e) => setMovementNotes(e.target.value)}
                placeholder="Ex: Beaucoup de mouvements le soir après le dîner, réagit à la voix..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] transition-all resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1.5">
                Observations réelles d'échographie ou notes médicales
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Échographie T2 effectuée à la clinique Pasteur : placenta postérieur, vitalité active, profil harmonieux..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px] transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE5]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-[13px] text-[#69625A] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13px] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Real Baby Data Display */}
      {hasAnyBabyData && !isEditing && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Identity Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE6DF] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider">
                Identité
              </span>
              <div className="text-xl font-bold font-serif text-[#1E1B18]">
                {babyInfo?.nickname || 'Bébé'}
              </div>
              <div className="text-[13px] text-[#69625A]">
                Genre : <span className="font-semibold text-[#1E1B18]">{babyInfo?.gender || 'Non précisé'}</span>
              </div>
            </div>

            {/* First kicks */}
            <div className="bg-white rounded-2xl p-6 border border-[#EAE6DF] shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#9E2A2B]" />
                Premiers mouvements
              </span>
              <div className="text-[14px] font-semibold text-[#1E1B18]">
                {babyInfo?.firstKicksDate
                  ? new Date(babyInfo.firstKicksDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Date non renseignée'}
              </div>
              <p className="text-[12.5px] text-[#69625A] line-clamp-2">
                {babyInfo?.movementNotes || 'Aucune note sur les mouvements enregistrée.'}
              </p>
            </div>

            {/* Safety Reminder */}
            <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#EAE4DC] shadow-2xs flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-[#7A736B] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C5E24]" />
                Éthique médicale MAMAN+
              </span>
              <p className="text-[12px] text-[#69625A] leading-relaxed mt-2">
                Les biométries fœtales (périmètre crânien, fémur, poids estimé) ne sont jamais simulées.
                Elles proviennent uniquement de vos comptes-rendus d’échographie obstétricale.
              </p>
            </div>
          </div>

          {/* Echography & clinical notes card */}
          {babyInfo?.notes && (
            <div className="bg-white rounded-2xl p-6 border border-[#EAE6DF] shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1E1B18]">
                Observations & Notes médicales consignées
              </h3>
              <p className="text-[13.5px] text-[#3E3833] leading-relaxed whitespace-pre-wrap bg-[#FAF9F6] p-4 rounded-xl border border-[#EFECE5]">
                {babyInfo.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};
