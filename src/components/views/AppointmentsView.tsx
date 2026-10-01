import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
  Edit3,
  X,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { Appointment } from '../../types';
import { PageWrapper } from './PageWrapper';

export const AppointmentsView: React.FC = () => {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useUserData();

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:30');
  const [practitioner, setPractitioner] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Appointment['status']>('Confirmé');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((app) => {
    if (activeFilter === 'upcoming') {
      return app.date >= todayStr;
    }
    if (activeFilter === 'past') {
      return app.date < todayStr;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('09:30');
    setPractitioner('');
    setLocation('');
    setNotes('');
    setStatus('Confirmé');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app: Appointment) => {
    setEditingId(app.id);
    setTitle(app.title);
    setDate(app.date);
    setTime(app.time);
    setPractitioner(app.practitioner);
    setLocation(app.location);
    setNotes(app.notes || '');
    setStatus(app.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (editingId) {
      await updateAppointment(editingId, {
        title: title.trim(),
        date,
        time,
        practitioner: practitioner.trim() || 'Praticien non spécifié',
        location: location.trim() || 'Lieu non spécifié',
        notes: notes.trim() || undefined,
        status,
      });
    } else {
      await addAppointment({
        title: title.trim(),
        date,
        time,
        practitioner: practitioner.trim() || 'Praticien non spécifié',
        location: location.trim() || 'Lieu non spécifié',
        notes: notes.trim() || undefined,
        status,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <PageWrapper id="view-appointments">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE9] border border-[#E5DFD7] text-[#695D50] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <CalendarClock className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Consultations & Échographies</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Rendez-vous
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Suivi personnalisé de vos consultations médicales, sages-femmes et examens hospitaliers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Programmer un rendez-vous</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#1E1B18] text-white shadow-xs'
              : 'text-[#69625A] hover:bg-[#EFECE6]'
          }`}
        >
          Tous ({appointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
            activeFilter === 'upcoming'
              ? 'bg-[#1E1B18] text-white shadow-xs'
              : 'text-[#69625A] hover:bg-[#EFECE6]'
          }`}
        >
          À venir ({appointments.filter((a) => a.date >= todayStr).length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('past')}
          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
            activeFilter === 'past'
              ? 'bg-[#1E1B18] text-white shadow-xs'
              : 'text-[#69625A] hover:bg-[#EFECE6]'
          }`}
        >
          Passés ({appointments.filter((a) => a.date < todayStr).length})
        </button>
      </div>

      {/* Appointment List / Empty State */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE6DF] shadow-xs text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] flex items-center justify-center text-[#8C847D] mx-auto mb-4">
            <CalendarClock className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18] tracking-tight mb-2">
            Aucun rendez-vous {activeFilter === 'upcoming' ? 'à venir' : activeFilter === 'past' ? 'passé' : 'enregistré'}.
          </h2>
          <p className="text-[14px] text-[#69625A] leading-relaxed mb-6">
            Ajoutez vos consultations obligatoires, échographies trimestrielles ou séances de
            préparation pour recevoir des rappels au bon moment.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] text-white font-medium text-[13.5px] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier rendez-vous</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((app) => {
            const isPast = app.date < todayStr;
            return (
              <div
                key={app.id}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-xs space-y-3 ${
                  isPast ? 'border-[#EAE6DF] opacity-80' : 'border-[#E2DDD5] hover:border-[#D0C8BD]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 ${
                        isPast
                          ? 'bg-[#EAE6DF] text-[#69625A]'
                          : 'bg-[#FEECEC] text-[#9E2A2B]'
                      }`}
                    >
                      {app.status}
                    </span>
                    <h3 className="font-bold text-[16px] text-[#1E1B18] leading-tight">
                      {app.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(app)}
                      className="p-1.5 rounded-lg text-[#69625A] hover:bg-[#FAF8F5] cursor-pointer"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAppointment(app.id)}
                      className="p-1.5 rounded-lg text-[#9E2A2B] hover:bg-[#FEECEC] cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[13px] text-[#554F49] pt-1 border-t border-[#F5F2EC]">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-[#8C847D] shrink-0" />
                    <span className="font-medium">
                      {new Date(app.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#8C847D] shrink-0" />
                    <span>{app.time}</span>
                  </div>
                  {app.practitioner && (
                    <div className="flex items-center gap-2 col-span-2">
                      <User className="w-4 h-4 text-[#8C847D] shrink-0" />
                      <span>{app.practitioner}</span>
                    </div>
                  )}
                  {app.location && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-[#8C847D] shrink-0" />
                      <span>{app.location}</span>
                    </div>
                  )}
                </div>

                {app.notes && (
                  <p className="text-[12px] text-[#69625A] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFECE5]">
                    {app.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAE6DF] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
                {editingId ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous médical'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C847D] hover:bg-[#F2EFEB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Motif / Intitulé *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Consultation 5e mois avec la sage-femme"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13.5px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Médecin / Sage-femme
                  </label>
                  <input
                    type="text"
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    placeholder="Ex: Dr. Martin"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Statut
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  >
                    <option value="Confirmé">Confirmé</option>
                    <option value="À venir">À venir</option>
                    <option value="Passé">Passé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Lieu / Cabinet
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Maternité Saint-Vincent ou Cabinet libéral"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Consignes médicales / Documents à apporter
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Apporter les derniers résultats d'analyse et carte de groupe sanguin"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0ECE5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-[#69625A] hover:bg-[#F2EFEB] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] text-white text-[13px] font-medium shadow-xs transition-all cursor-pointer"
                >
                  {editingId ? 'Mettre à jour' : 'Enregistrer le rendez-vous'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
