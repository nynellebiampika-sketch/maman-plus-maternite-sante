import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { Appointment } from '../../types';
import { PageWrapper } from './PageWrapper';

export const CalendarView: React.FC = () => {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useUserData();

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Event form fields
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [eventTime, setEventTime] = useState('09:00');
  const [practitioner, setPractitioner] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Appointment['status']>('Confirmé');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Day of week: 0 = Sunday, 1 = Monday... convert to Monday = 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      hasEvents: boolean;
      eventsCount: number;
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evCount = appointments.filter((a) => a.date === dateStr).length;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        hasEvents: evCount > 0,
        eventsCount: evCount,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evCount = appointments.filter((a) => a.date === dateStr).length;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        hasEvents: evCount > 0,
        eventsCount: evCount,
      });
    }

    // Next month padding days to complete 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const evCount = appointments.filter((a) => a.date === dateStr).length;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        hasEvents: evCount > 0,
        eventsCount: evCount,
      });
    }

    return days;
  }, [currentDate, appointments]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return appointments.filter((a) => a.date === selectedDateStr);
  }, [appointments, selectedDateStr]);

  const handleOpenAddModal = (dateStr?: string) => {
    const targetDate = dateStr || selectedDateStr;
    setTitle('');
    setEventDate(targetDate);
    setEventTime('09:00');
    setPractitioner('');
    setLocation('');
    setNotes('');
    setStatus('Confirmé');
    setEditingEventId(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (ev: Appointment) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setEventDate(ev.date);
    setEventTime(ev.time);
    setPractitioner(ev.practitioner);
    setLocation(ev.location);
    setNotes(ev.notes || '');
    setStatus(ev.status);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    if (editingEventId) {
      await updateAppointment(editingEventId, {
        title: title.trim(),
        date: eventDate,
        time: eventTime,
        practitioner: practitioner.trim() || 'Praticien non spécifié',
        location: location.trim() || 'Lieu non spécifié',
        notes: notes.trim() || undefined,
        status,
      });
    } else {
      await addAppointment({
        title: title.trim(),
        date: eventDate,
        time: eventTime,
        practitioner: practitioner.trim() || 'Praticien non spécifié',
        location: location.trim() || 'Lieu non spécifié',
        notes: notes.trim() || undefined,
        status,
      });
    }

    setIsModalOpen(false);
    setEditingEventId(null);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <PageWrapper id="view-calendar">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-[#8C5E24]" />
            <span>Agenda Médical</span>
          </div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold text-[#1E1B18] tracking-tight">
            Calendrier
          </h1>
          <p className="text-[14px] text-[#69625A]">
            Planning réel de vos rendez-vous obstétricaux, échographies et séances de préparation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddModal(selectedDateStr)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#882425] hover:-translate-y-[1px] active:scale-[0.98] text-white text-[13.5px] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un événement</span>
        </button>
      </div>

      {/* Main Grid: Calendar on Left, Selected Day Events on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Interactive Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-7 border border-[#EAE6DF] shadow-xs space-y-5">
          {/* Month Navigator */}
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1.5 rounded-lg border border-[#E2DDD5] text-[12px] font-medium text-[#4A443E] hover:bg-[#FAF8F5] transition-colors cursor-pointer mr-1"
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-lg border border-[#E2DDD5] text-[#69625A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-lg border border-[#E2DDD5] text-[#69625A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                aria-label="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-[#8C847D] uppercase tracking-wider py-1 border-b border-[#F0ECE5]">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((d, index) => {
              const isSelected = d.dateStr === selectedDateStr;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedDateStr(d.dateStr)}
                  className={`min-h-[56px] sm:min-h-[64px] p-2 rounded-xl flex flex-col items-center justify-between border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#9E2A2B] bg-[#FDF5F5] ring-2 ring-[#9E2A2B]/20'
                      : d.isToday
                      ? 'border-[#C5EAD0] bg-[#F4FAF5]'
                      : d.isCurrentMonth
                      ? 'border-[#EFECE5] bg-[#FBF9F6] hover:bg-white hover:border-[#DED8CE]'
                      : 'border-transparent bg-transparent text-[#BDB5AB] hover:bg-[#F8F6F2]'
                  }`}
                >
                  <span
                    className={`text-[13px] font-medium leading-none ${
                      isSelected
                        ? 'font-bold text-[#9E2A2B]'
                        : d.isToday
                        ? 'font-bold text-[#1E653A]'
                        : d.isCurrentMonth
                        ? 'text-[#2C2825]'
                        : 'text-[#BBB2A8]'
                    }`}
                  >
                    {d.dayNumber}
                  </span>

                  {/* Dot indicators for real appointments */}
                  {d.hasEvents && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#9E2A2B]" />
                      {d.eventsCount > 1 && (
                        <span className="text-[10px] font-bold text-[#9E2A2B]">
                          {d.eventsCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Day Events Details */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-[#F0ECE5] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#8C857E] uppercase tracking-wider block">
                  Jour sélectionné
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1E1B18] capitalize">
                  {new Date(selectedDateStr).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddModal(selectedDateStr)}
                className="p-2 rounded-xl text-[#9E2A2B] hover:bg-[#FEECEC] transition-colors cursor-pointer"
                title="Ajouter un événement ce jour"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Event List */}
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-[#7C746D] space-y-2">
                <CalendarIcon className="w-8 h-8 text-[#CCC5BB] mx-auto" />
                <p className="text-[13.5px]">Aucun événement pour cette date.</p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="text-[12.5px] text-[#9E2A2B] font-semibold hover:underline cursor-pointer"
                >
                  + Planifier un rendez-vous
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFECE5] space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[10.5px] font-bold text-[#9E2A2B] bg-[#FEECEC] px-2 py-0.5 rounded-full mb-1">
                          {ev.status}
                        </span>
                        <h4 className="font-bold text-[14px] text-[#1E1B18] leading-snug">
                          {ev.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEditEvent(ev)}
                          className="p-1 rounded-lg text-[#69625A] hover:bg-white hover:text-[#1E1B18] cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAppointment(ev.id)}
                          className="p-1 rounded-lg text-[#9E2A2B] hover:bg-[#FEECEC] cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[12.5px] text-[#5A534B]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#8C847D] shrink-0" />
                        <span>{ev.time}</span>
                      </div>
                      {ev.practitioner && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#8C847D] shrink-0" />
                          <span>{ev.practitioner}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#8C847D] shrink-0" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                      {ev.notes && (
                        <p className="text-[11.5px] text-[#7C746D] bg-white p-2 rounded-lg border border-[#EAE5DC] mt-1.5 italic">
                          "{ev.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal / Dialog for Add / Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAE6DF] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1E1B18]">
                {editingEventId ? 'Modifier l’événement' : 'Nouvel événement'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8C847D] hover:bg-[#F2EFEB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Intitulé du rendez-vous *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Échographie morphologique T2"
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
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                    Professionnel de santé
                  </label>
                  <input
                    type="text"
                    value={practitioner}
                    onChange={(e) => setPractitioner(e.target.value)}
                    placeholder="Ex: Dr. Martin (Sage-femme)"
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
                  Lieu
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Cabinet Médical ou Maternité"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCD6CC] bg-[#FAF8F5] focus:bg-white focus:border-[#9E2A2B] focus:outline-none text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-[#4A443E] mb-1">
                  Remarques ou consignes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Venir la vessie pleine, apporter carte vitale..."
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
                  {editingEventId ? 'Enregistrer les modifications' : 'Ajouter au calendrier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
