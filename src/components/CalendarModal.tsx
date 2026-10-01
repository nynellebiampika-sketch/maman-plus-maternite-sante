import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Plus, Trash2, CalendarCheck } from 'lucide-react';
import { useUserData } from '../contexts/UserDataContext';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const { appointments, addAppointment, deleteAppointment } = useUserData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [practitioner, setPractitioner] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    await addAppointment({
      title: title.trim(),
      date,
      time,
      practitioner: practitioner.trim() || 'Sage-femme / Praticien',
      location: location.trim() || 'Cabinet médical',
      status: 'Confirmé',
    });

    setTitle('');
    setDate('');
    setPractitioner('');
    setLocation('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EAE6DF] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0ECE5] flex items-center justify-between bg-[#FBF9F6] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEECEC] border border-[#FCD5D5] flex items-center justify-center text-[#9E2A2B]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#231F1D]">
                Calendrier Médical Prénatal
              </h3>
              <p className="text-xs text-[#7A736B]">
                Échéances et rendez-vous du suivi de grossesse
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A736B] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Appointment list or empty state */}
          {appointments.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-2 bg-[#FAF8F5] rounded-2xl border border-[#EFECE5]">
              <CalendarCheck className="w-8 h-8 text-[#9E2A2B] mx-auto opacity-80" />
              <h4 className="font-serif text-base font-semibold text-[#25221F]">
                Aucun rendez-vous enregistré
              </h4>
              <p className="text-[12.5px] text-[#7A736B] max-w-sm mx-auto">
                Ajoutez vos prochaines consultations prénatales et échographies programmées pour ne rien oublier.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#EFECE5] hover:border-[#E2DDD3] hover:bg-white hover:-translate-y-[0.5px] hover:shadow-2xs transition-all duration-200 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[11px] font-bold text-[#9E2A2B] bg-[#FEECEC] px-2.5 py-0.5 rounded-full">
                      {ev.date} à {ev.time}
                    </span>
                    <h4 className="font-medium text-[13.5px] text-[#24211E]">
                      {ev.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6E6760]">
                      <User className="w-3.5 h-3.5" />
                      <span>{ev.practitioner}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#8C847D]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ev.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[11px] font-semibold text-[#1E7441] bg-[#D8F3DC] px-2.5 py-1 rounded-full shrink-0">
                      {ev.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteAppointment(ev.id)}
                      className="text-[#9E968F] hover:text-[#9E2A2B] p-1 transition-colors cursor-pointer"
                      title="Supprimer ce rendez-vous"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add appointment form toggle */}
          {showAddForm ? (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DF] space-y-3">
              <h4 className="font-semibold text-[13.5px] text-[#231F1D]">Nouveau rendez-vous</h4>

              <div>
                <label className="block text-[12px] text-[#554E47] mb-1">Intitulé du rendez-vous *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Échographie T2, Consultation 6e mois..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">Heure</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#9E2A2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">Praticien / Spécialiste</label>
                  <input
                    type="text"
                    placeholder="Ex: Sophie Bernard (Sage-femme)"
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#554E47] mb-1">Lieu / Maternité</label>
                  <input
                    type="text"
                    placeholder="Ex: Clinique Raspail"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0DBD2] rounded-xl text-[13px] text-[#2C2825] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-[12.5px] text-[#7A736B]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#9E2A2B] hover:bg-[#8B2324] hover:-translate-y-[1px] hover:shadow-md text-white text-[12.5px] font-medium shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Ajouter le rendez-vous
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#E2DDD5] text-[#9E2A2B] hover:bg-[#FDF0F0] hover:-translate-y-[0.5px] active:scale-[0.99] font-medium text-[13px] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Programmer un rendez-vous</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
