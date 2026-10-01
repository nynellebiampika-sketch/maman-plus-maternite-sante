import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, LogOut, User as UserIcon, CheckCheck } from 'lucide-react';
import { BrandEmblem } from './BrandLogo';

import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { getUserInitials, calculateGestationalStatus } from '../services/storage';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenAssistant?: () => void;
  onNavigate?: (path: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenProfile,
  onOpenAssistant,
  onNavigate,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { currentUser, logout } = useAuth();
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useUserData();

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = getUserInitials(currentUser?.firstName, currentUser?.lastName);
  const gestational = calculateGestationalStatus(
    currentUser?.lastMenstrualPeriodDate,
    currentUser?.dueDate
  );

  return (
    <header
      className={`h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b sticky top-0 z-30 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-[#F8F7F4]/95 backdrop-blur-md border-[#E3DDD4] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
          : 'bg-[#F8F7F4]/90 backdrop-blur-xs border-[#EFECE6]/70 shadow-none'
      }`}
    >
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 rounded-xl text-[#5E5750] hover:bg-[#EFECE6] lg:hidden focus:outline-none transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand emblem */}
        <div className="lg:hidden shrink-0">
          <BrandEmblem size={32} />
        </div>

        {/* Large white rounded search input */}
        <div
          onClick={onOpenSearch}
          className="relative flex items-center w-full max-w-[370px] h-[42px] bg-white rounded-full px-3.5 border border-[#E8E4DD] shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer group hover:border-[#D6D0C5] transition-all"
        >
          <Search className="w-4 h-4 text-[#9C948D] shrink-0 mr-2.5 group-hover:text-[#69625A] transition-colors" />
          <input
            type="text"
            id="main-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            placeholder="Rechercher dans MAMAN+..."
            className="w-full bg-transparent text-[13px] text-[#2C2825] placeholder-[#9E968F] focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-mono font-medium text-[#7C746D] bg-[#F5F2EC] rounded-md border border-[#E2DDD5] ml-1.5 shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Status Pill, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 lg:gap-4">
        {/* Connected Sync Badge */}
        <div
          id="connection-badge"
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D8F3DC] border border-[#C5EBD0] text-[#1B4332] text-[12px] font-medium shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Connecté • Sync</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            id="notification-bell-btn"
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              setShowProfileDropdown(false);
            }}
            className="relative p-2 rounded-full text-[#47413B] hover:bg-[#EFECE6] transition-colors focus:outline-none cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-[19px] h-[19px]" />
            {/* Display red badge ONLY when real unread count > 0 */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-[#9E2A2B] text-white text-[10px] font-bold rounded-full border-2 border-[#F8F7F4] shadow-xs animate-in zoom-in-50 duration-150">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#EAE6DF] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0ECE5] px-1">
                <span className="text-xs font-semibold text-[#2C2825] uppercase tracking-wider">
                  Notifications médicales
                </span>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] text-[#9E2A2B] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Tout marquer comme lu</span>
                  </button>
                )}
              </div>

              {/* Dynamic Notification List or Empty State */}
              {notifications.length === 0 ? (
                <div className="py-6 px-4 text-center space-y-1">
                  <p className="text-[13px] font-medium text-[#2C2825]">Aucune notification</p>
                  <p className="text-[11.5px] text-[#857E77] leading-relaxed">
                    Vos rappels cliniques, alertes de rendez-vous et messages apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-[12.5px] max-h-72 overflow-y-auto pr-0.5">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.data?.path && onNavigate) {
                          onNavigate(n.data.path);
                          setShowNotificationsDropdown(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        n.read
                          ? 'bg-[#FDFBF7] border-[#F2EEE8] text-[#554E47]'
                          : 'bg-[#FEECEC]/50 border-[#FAD7D7] text-[#1E1B18]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[12.5px]">{n.title}</p>
                        <span className="text-[10.5px] text-[#8C847D]">{n.date}</span>
                      </div>
                      <p className="text-[11.5px] text-[#69625A] mt-0.5 leading-snug">{n.message || n.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* View all notifications footer */}
              <div className="pt-2.5 mt-2 border-t border-[#F0ECE5] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotificationsDropdown(false);
                    if (onNavigate) onNavigate('/notifications');
                  }}
                  className="text-xs font-semibold text-[#9E2A2B] hover:text-[#852324] hover:underline cursor-pointer"
                >
                  Ouvrir le centre de notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            id="user-profile-menu-btn"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationsDropdown(false);
            }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#EFECE6] transition-colors focus:outline-none cursor-pointer"
          >
            {/* Real Avatar: Photo or Monogram derived from user initials */}
            {currentUser?.photoUrl ? (
              <div className="w-[34px] h-[34px] rounded-full overflow-hidden border border-[#E0DBD2] shadow-xs shrink-0">
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.firstName || 'Profil'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-[34px] h-[34px] rounded-full bg-[#9E2A2B] text-white flex items-center justify-center font-serif font-bold text-[13px] tracking-tight shadow-xs shrink-0">
                {initials}
              </div>
            )}

            <span className="hidden sm:inline-block font-medium text-[13.5px] text-[#2C2825] max-w-[120px] truncate">
              {currentUser?.firstName || 'Mon Profil'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#857E77] ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE6DF] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2.5 border-b border-[#F0ECE5]">
                <p className="font-semibold text-[13.5px] text-[#24211E] truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-[11px] text-[#7F7871] truncate">{currentUser?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#E6F4EA] text-[#1E653A]">
                    {gestational ? `${gestational.weeksSA} SA (Trimestre ${gestational.trimester})` : 'Dossier maternité actif'}
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    if (onNavigate) {
                      onNavigate('/profil');
                    } else {
                      onOpenProfile?.();
                    }
                  }}
                  className="w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-xl text-[12.5px] text-[#3D3732] hover:bg-[#F7F5F1] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#7A736B]" />
                  <span>Mon Profil & Repères de terme</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onNavigate?.('/parametres');
                  }}
                  className="w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-xl text-[12.5px] text-[#3D3732] hover:bg-[#F7F5F1] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#7A736B] opacity-0" />
                  <span>Paramètres de compte</span>
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                    onNavigate?.('/login');
                  }}
                  className="w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-xl text-[12.5px] text-[#9E2A2B] hover:bg-[#FDF0F0] font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
