import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserDataProvider, useUserData } from './contexts/UserDataContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { WeightBmiModal } from './components/WeightBmiModal';
import { CalendarModal } from './components/CalendarModal';
import { ProfileModal } from './components/ProfileModal';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { ScrollProgressBar } from './components/ScrollAnimation';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { SeoHead } from './components/SeoHead';
import { AnalyticsConsentBanner } from './components/AnalyticsConsentBanner';
import { initAnalytics } from './services/analytics';
import { BrandEmblem } from './components/BrandLogo';
import { LogIn } from 'lucide-react';

// Modular Page Views
import { DashboardHomeView } from './components/views/DashboardHomeView';
import { NotificationsView } from './components/views/NotificationsView';
import { PregnancyView } from './components/views/PregnancyView';
import { BabyView } from './components/views/BabyView';
import { CalendarView } from './components/views/CalendarView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { SymptomsView } from './components/views/SymptomsView';
import { WeightView } from './components/views/WeightView';
import { ExamsView } from './components/views/ExamsView';
import { PrescriptionsView } from './components/views/PrescriptionsView';
import { MedicalSummaryView } from './components/views/MedicalSummaryView';
import { JournalView } from './components/views/JournalView';
import { ChecklistView } from './components/views/ChecklistView';
import { RemindersView } from './components/views/RemindersView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { ResourcesView } from './components/views/ResourcesView';

// Route definitions mapping to Sidebar items
const pathToItemMap: Record<string, string> = {
  '/': 'Tableau de bord',
  '/dashboard': 'Tableau de bord',
  '/accueil': 'Tableau de bord',
  '/presentation': 'Tableau de bord',
  '/ma-grossesse': 'Ma Grossesse',
  '/bebe': 'Bébé',
  '/calendrier': 'Calendrier',
  '/rendez-vous': 'Rendez-vous',
  '/symptomes': 'Symptômes',
  '/suivi-poids': 'Suivi du Poids',
  '/examens': 'Examens',
  '/mon-ordonnance': 'Mon ordonnance',
  '/ordonnance': 'Mon ordonnance',
  '/ordonnances': 'Mon ordonnance',
  '/synthese-suivi': 'Synthèse du suivi',
  '/synthese-medecin': 'Synthèse du suivi',
  '/synthese': 'Synthèse du suivi',
  '/journal': 'Journal',
  '/checklist': 'Checklist',
  '/rappels': 'Rappels',
  '/notifications': 'Notifications',
  '/conseils-ressources': 'Conseils & Ressources',
  '/ressources': 'Conseils & Ressources',
  '/profil': 'Mon Profil',
  '/parametres': 'Paramètres',
  '/guide': 'Paramètres',
  '/guide-utilisation': 'Paramètres',
  '/parametres/guide': 'Paramètres',
};

const itemToPathMap: Record<string, string> = {
  'Tableau de bord': '/',
  'Conseils & Ressources': '/conseils-ressources',
  'Ma Grossesse': '/ma-grossesse',
  'Bébé': '/bebe',
  'Calendrier': '/calendrier',
  'Rendez-vous': '/rendez-vous',
  'Symptômes': '/symptomes',
  'Suivi du Poids': '/suivi-poids',
  'Examens': '/examens',
  'Mon ordonnance': '/mon-ordonnance',
  'Synthèse du suivi': '/synthese-suivi',
  'Journal': '/journal',
  'Checklist': '/checklist',
  'Rappels': '/rappels',
  'Notifications': '/notifications',
  'Mon Profil': '/profil',
  'Paramètres': '/parametres',
};

// Main App Dashboard inner component
function MainDashboard() {
  const { currentUser, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { isLoading: isDataLoading } = useUserData();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register'>('login');

  // Synchronized browser routing
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  const navigate = useCallback((path: string) => {
    setCurrentPath((prev) => {
      if (path === prev) return prev;
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return path;
    });
  }, []);

  // Initialize GA4 if previously consented
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    const handleMamanNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>;
      if (customEvent.detail?.path) {
        navigate(customEvent.detail.path);
      }
    };
    const handleSwMessage = (e: MessageEvent) => {
      if (e.data?.type === 'MAMAN_NOTIFICATION_CLICK') {
        const targetPath = e.data.path || e.data.url;
        if (targetPath) {
          console.log('[App] Notification click received from SW, navigating to:', targetPath);
          navigate(targetPath);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('maman-navigate', handleMamanNavigate);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('maman-navigate', handleMamanNavigate);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [navigate]);

  // Determine active sidebar item from current route
  const activeSidebarItem = pathToItemMap[currentPath] || 'Tableau de bord';

  useEffect(() => {
    if (currentPath === '/assistant-ia' || currentPath === '/assistant') {
      setIsAssistantOpen(true);
    }
    // Redirect any lingering payment/subscription URL directly to home
    if (
      currentPath === '/abonnement' ||
      currentPath === '/paiement' ||
      currentPath === '/paiements' ||
      currentPath === '/admin/paiements' ||
      currentPath === '/admin-paiements'
    ) {
      navigate('/');
    }
  }, [currentPath, navigate]);

  const handleSelectSidebarItem = (item: string) => {
    if (item === 'Déconnexion') {
      logout();
      navigate('/login');
      return;
    }
    if (item === 'Assistant IA') {
      setIsAssistantOpen(true);
      return;
    }
    const targetPath = itemToPathMap[item] || '/';
    navigate(targetPath);
  };

  // If user navigated to /login in URL or is not authenticated
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center p-6 text-[#2C2825]">
        <SeoHead currentPath={currentPath} isAuthenticated={false} />
        <div className="w-10 h-10 border-3 border-[#9E2A2B]/20 border-t-[#9E2A2B] rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg font-medium text-[#1E1B18]">Chargement de votre espace MAMAN+...</p>
      </div>
    );
  }

  // Route checks for unauthenticated public visitors
  const isLandingRoute =
    currentPath === '/' ||
    currentPath === '/accueil' ||
    currentPath === '/presentation';

  const isPublicResourceRoute =
    currentPath === '/conseils-ressources' ||
    currentPath === '/ressources' ||
    currentPath === '/guide' ||
    currentPath === '/guide-utilisation';

  if (!isAuthenticated) {
    // 1. Landing Page (Default Public Portal for visitors)
    if (isLandingRoute) {
      return (
        <>
          <SeoHead currentPath={currentPath} isAuthenticated={false} />
          <AnalyticsConsentBanner />
          <LandingPage
            onNavigateToLogin={(initialMode) => {
              if (initialMode) setLoginInitialMode(initialMode);
              navigate('/login');
            }}
            onNavigateToResources={() => navigate('/conseils-ressources')}
            onNavigateToGuide={() => navigate('/guide')}
          />
        </>
      );
    }

    // 2. Public resource and guide routes
    if (isPublicResourceRoute) {
      return (
        <div className="min-h-screen bg-[#F8F7F4] text-[#2C2825] flex flex-col antialiased">
          <SeoHead currentPath={currentPath} isAuthenticated={false} />
          <AnalyticsConsentBanner />

          {/* Public Header */}
          <header className="h-[72px] px-4 sm:px-8 bg-white border-b border-[#EFECE6] flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <BrandEmblem size={36} />
              <div className="flex flex-col leading-tight">
                <div className="flex items-center">
                  <span className="font-serif font-bold text-[18px] text-[#2A2421]">MAMAN</span>
                  <span className="text-[#9E2A2B] font-bold text-[18px] ml-0.5">+</span>
                </div>
                <span className="text-[11px] text-[#7A736B] font-medium">Portail Conseils & Ressources</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[#5C554E] hover:text-[#1E1B18] text-[13px] font-medium transition-colors cursor-pointer"
              >
                <span>Accueil</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginInitialMode('login');
                  navigate('/login');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Mon Carnet MAMAN+</span>
              </button>
            </div>
          </header>

          {/* Public Content Body */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1480px] w-full mx-auto space-y-6">
            {currentPath === '/guide' || currentPath === '/guide-utilisation' ? (
              <SettingsView initialTab="guide" onNavigate={navigate} />
            ) : (
              <ResourcesView />
            )}
          </main>
        </div>
      );
    }

    // 3. Login page (for /login or when an unauthenticated visitor tries to reach a protected screen)
    return (
      <>
        <SeoHead currentPath={currentPath} isAuthenticated={false} />
        <AnalyticsConsentBanner />
        <LoginPage
          initialMode={loginInitialMode}
          onNavigateHome={() => navigate('/')}
          onSuccess={() => {
            navigate('/');
          }}
        />
      </>
    );
  }

  // Render the current view according to the active route
  const renderCurrentView = () => {
    switch (currentPath) {
      case '/ma-grossesse':
        return <PregnancyView onOpenProfile={() => navigate('/profil')} onNavigate={navigate} />;
      case '/bebe':
        return <BabyView />;
      case '/calendrier':
        return <CalendarView />;
      case '/rendez-vous':
        return <AppointmentsView />;
      case '/symptomes':
        return <SymptomsView />;
      case '/suivi-poids':
        return <WeightView />;
      case '/examens':
        return <ExamsView />;
      case '/mon-ordonnance':
      case '/ordonnance':
      case '/ordonnances':
        return <PrescriptionsView />;
      case '/synthese-suivi':
      case '/synthese-medecin':
      case '/synthese':
        return <MedicalSummaryView onNavigate={navigate} />;
      case '/journal':
        return <JournalView />;
      case '/checklist':
        return <ChecklistView />;
      case '/rappels':
        return <RemindersView />;
      case '/notifications':
        return <NotificationsView onNavigate={navigate} />;
      case '/conseils-ressources':
      case '/ressources':
        return <ResourcesView />;
      case '/profil':
        return <ProfileView />;
      case '/parametres':
        return <SettingsView onNavigate={navigate} />;
      case '/guide':
      case '/guide-utilisation':
      case '/parametres/guide':
        return <SettingsView initialTab="guide" onNavigate={navigate} />;
      case '/':
      case '/dashboard':
      case '/accueil':
      case '/presentation':
      default:
        return <DashboardHomeView onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2C2825] flex flex-col antialiased overflow-x-hidden relative">
      {/* Dynamic SEO Metadata, Canonical & JSON-LD */}
      <SeoHead currentPath={currentPath} isAuthenticated={isAuthenticated} />

      {/* Analytics Cookie Consent Banner */}
      <AnalyticsConsentBanner />

      {/* Scroll Reading Progress Bar at the top of the viewport */}
      <ScrollProgressBar />

      {/* Push Notification Polite Authorization Banner */}
      <NotificationPermissionBanner />

      {/* Sidebar navigation */}
      <Sidebar
        activeItem={activeSidebarItem}
        onSelectItem={handleSelectSidebarItem}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenProfile={() => navigate('/profil')}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Page Area */}
      <div className="lg:pl-[240px] flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => navigate('/profil')}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onNavigate={navigate}
        />

        {/* Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1480px] w-full mx-auto space-y-5 sm:space-y-6">
          {renderCurrentView()}
        </main>
      </div>

      {/* Interactive Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAction={handleSelectSidebarItem}
      />
      <WeightBmiModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      {/* Floating AI Assistant Google Gemini 2.5 Flash-Lite */}
      <GeminiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          if (currentPath === '/assistant-ia' || currentPath === '/assistant') {
            navigate('/');
          }
        }}
        onOpen={() => setIsAssistantOpen(true)}
      />
    </div>
  );
}

// App Root wrapping with providers (100% free app without subscription wrapper)
export default function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <MainDashboard />
      </UserDataProvider>
    </AuthProvider>
  );
}
