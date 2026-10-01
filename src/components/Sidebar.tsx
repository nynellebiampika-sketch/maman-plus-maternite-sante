import React from 'react';
import {
  LayoutGrid,
  Smile,
  Calendar,
  CalendarCheck,
  Activity,
  Scale,
  FileText,
  BookOpen,
  ListChecks,
  Clock,
  User,
  Settings,
  LogOut,
  X,
  MessageSquare,
  Bell,
  Pill,
  Stethoscope,
} from 'lucide-react';
import { PregnantIcon } from './Icons';
import { BrandEmblem } from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { getUserInitials } from '../services/storage';

interface SidebarProps {
  activeItem?: string;
  onSelectItem?: (item: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenProfile?: () => void;
  onOpenAssistant?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'Tableau de bord',
  onSelectItem,
  isOpenMobile = false,
  onCloseMobile,
  onOpenProfile,
  onOpenAssistant,
}) => {
  const { currentUser, logout } = useAuth();
  const { pregnancyProfile, notifications } = useUserData();

  const unreadNotificationsCount = notifications?.filter((n) => !n.read).length || 0;

  const fullName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    currentUser?.displayName ||
    'Maman MAMAN+';
  const initials = getUserInitials(currentUser?.firstName, currentUser?.lastName);
  const gestationalSubtitle = pregnancyProfile?.currentWeek
    ? `Semaine ${pregnancyProfile.currentWeek} SA`
    : 'Espace Maman';

  const medicalNavItems = [
    { id: 'Tableau de bord', label: 'Tableau de bord', icon: LayoutGrid },
    { id: 'Assistant IA', label: 'Assistant IA', icon: MessageSquare },
    { id: 'Conseils & Ressources', label: 'Conseils & Ressources', icon: BookOpen },
    { id: 'Ma Grossesse', label: 'Ma Grossesse', icon: PregnantIcon },
    { id: 'Bébé', label: 'Bébé', icon: Smile },
    { id: 'Calendrier', label: 'Calendrier', icon: Calendar },
    { id: 'Rendez-vous', label: 'Rendez-vous', icon: CalendarCheck },
    { id: 'Symptômes', label: 'Symptômes', icon: Activity },
    { id: 'Suivi du Poids', label: 'Suivi du Poids', icon: Scale },
    { id: 'Examens', label: 'Examens', icon: FileText },
    { id: 'Mon ordonnance', label: 'Mon ordonnance', icon: Pill },
    { id: 'Synthèse du suivi', label: 'Synthèse du suivi', icon: Stethoscope },
    { id: 'Journal', label: 'Journal', icon: BookOpen },
    { id: 'Checklist', label: 'Checklist', icon: ListChecks },
    { id: 'Rappels', label: 'Rappels', icon: Clock },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'Assistant IA') {
      onOpenAssistant?.();
    }
    onSelectItem?.(id);
    if (isOpenMobile) {
      onCloseMobile?.();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar: 100dvh with independently scrollable navigation */}
      <aside
        className={`fixed top-0 left-0 z-50 w-[240px] h-[100dvh] max-h-[100dvh] bg-white border-r border-[#EFECE6] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand (Fixed, shrink-0) */}
        <div className="p-4 pt-4 pb-3.5 border-b border-[#F5F2EC] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <BrandEmblem size={40} />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center">
                <span className="font-serif font-bold text-[16px] text-[#2A2421] tracking-tight">MAMAN</span>
                <span className="text-[#9E2A2B] font-bold text-[16px] ml-0.5">+</span>
              </div>
              <span className="text-[10.5px] text-[#7A736B] font-medium tracking-tight">Maternité & Santé</span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 -mr-1 rounded-lg text-[#8C847D] hover:bg-[#F2EFEB] lg:hidden cursor-pointer"
            aria-label="Fermer la navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Block in Sidebar (Fixed, shrink-0) */}
        <div className="p-3 pb-2 border-b border-[#F5F2EC] shrink-0 bg-white">
          <div
            onClick={() => {
              onOpenProfile?.();
              if (isOpenMobile) {
                onCloseMobile?.();
              }
            }}
            className="w-full group flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F0E8] border border-[#EFECE6] hover:border-[#E5DFD6] text-left transition-all duration-200 cursor-pointer shadow-2xs"
            role="button"
            tabIndex={0}
            title="Consulter mon profil MAMAN+"
            aria-label={`Profil de ${fullName}`}
          >
            {/* Avatar: Photo or Monogram initials */}
            {currentUser?.photoUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E0DBD2] shadow-2xs shrink-0">
                <img
                  src={currentUser.photoUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#9E2A2B] text-white flex items-center justify-center font-serif font-bold text-[12px] tracking-tight shadow-2xs shrink-0">
                {initials}
              </div>
            )}

            {/* Name & Subtitle */}
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <span className="font-serif font-bold text-[13px] text-[#2A2421] group-hover:text-[#9E2A2B] transition-colors truncate">
                {fullName}
              </span>
              <span className="text-[10.5px] text-[#7A736B] font-medium tracking-tight truncate mt-0.5">
                {gestationalSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area (Scrolls independently of content & viewport) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-3 pb-3">
          <h2 className="px-3 text-[11px] font-semibold text-[#9C948D] uppercase tracking-wider mb-2">
            PARCOURS MÉDICAL
          </h2>

          <nav className="space-y-0.5" aria-label="Parcours Médical">
            {medicalNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 ease-out text-left cursor-pointer group ${
                    isActive
                      ? 'bg-[#FBF6F6] text-[#9E2A2B] font-semibold shadow-2xs'
                      : 'text-[#3E3834] hover:bg-[#F8F6F2] hover:text-[#1E1B18]'
                  }`}
                >
                  <IconComponent
                    className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ease-out ${
                      isActive ? 'text-[#9E2A2B]' : 'text-[#69625A] group-hover:text-[#4A443F]'
                    }`}
                  />
                  <span className="truncate transition-colors duration-200">{item.label}</span>
                  {item.id === 'Notifications' && unreadNotificationsCount > 0 && (
                    <span className="ml-auto mr-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#9E2A2B] text-white shadow-2xs">
                      {unreadNotificationsCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="ml-auto flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B] animate-in fade-in zoom-in-75 duration-200" />
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation (Fixed at bottom, shrink-0) */}
        <div className="p-3 border-t border-[#EFECE6] bg-white space-y-0.5 shrink-0">
          <button
            type="button"
            id="nav-mon-profil"
            onClick={() => handleNavClick('Mon Profil')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all text-left cursor-pointer group ${
              activeItem === 'Mon Profil'
                ? 'bg-[#FBF6F6] text-[#9E2A2B] font-semibold shadow-2xs'
                : 'text-[#3E3834] hover:bg-[#F8F6F2] hover:text-[#1E1B18]'
            }`}
          >
            <User
              className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                activeItem === 'Mon Profil' ? 'text-[#9E2A2B]' : 'text-[#69625A] group-hover:text-[#4A443F]'
              }`}
            />
            <span className="truncate">Mon Profil</span>
            {activeItem === 'Mon Profil' && (
              <span className="ml-auto flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B]" />
              </span>
            )}
          </button>

          <button
            type="button"
            id="nav-parametres"
            onClick={() => handleNavClick('Paramètres')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all text-left cursor-pointer group ${
              activeItem === 'Paramètres'
                ? 'bg-[#FBF6F6] text-[#9E2A2B] font-semibold shadow-2xs'
                : 'text-[#3E3834] hover:bg-[#F8F6F2] hover:text-[#1E1B18]'
            }`}
          >
            <Settings
              className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                activeItem === 'Paramètres' ? 'text-[#9E2A2B]' : 'text-[#69625A] group-hover:text-[#4A443F]'
              }`}
            />
            <span className="truncate">Paramètres</span>
            {activeItem === 'Paramètres' && (
              <span className="ml-auto flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B]" />
              </span>
            )}
          </button>

          <button
            type="button"
            id="nav-deconnexion"
            onClick={() => handleNavClick('Déconnexion')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#9E2A2B] hover:bg-[#FDF0F0] transition-all text-left cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px] text-[#9E2A2B]" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};
