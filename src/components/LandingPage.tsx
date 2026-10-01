import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Activity,
  Scale,
  FileText,
  ListChecks,
  BookOpen,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Download,
  X,
  Menu,
  LogIn,
  Baby,
  Stethoscope,
  Clock,
  Share2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Award,
  Check,
} from 'lucide-react';
import { BrandEmblem } from './BrandLogo';

interface LandingPageProps {
  onNavigateToLogin: (initialMode?: 'login' | 'register') => void;
  onNavigateToResources: () => void;
  onNavigateToGuide: () => void;
}

// Interactive Pregnancy Preview Data for landing page demonstration
const PREVIEW_WEEKS = [
  {
    week: 12,
    trimester: '1er Trimestre',
    fruit: 'Une prune',
    size: '6.5 cm',
    weight: '18 g',
    heartbeat: '160 bpm',
    headline: 'Bébé commence à bouger doucement ses petits bras',
    babyDetails:
      'Tous les organes vitaux sont formés. Les ongles commencent à pousser et le réflexe de succion apparaît.',
    mamanTips:
      "Les nausées du premier trimestre commencent souvent à s'atténuer. C'est la période de la première échographie officielle (T1).",
    exam: '1ère échographie morphologique (T1) + Dépistage prénatal',
  },
  {
    week: 20,
    trimester: '2e Trimestre',
    fruit: 'Une mangue mûre',
    size: '25 cm',
    weight: '330 g',
    heartbeat: '150 bpm',
    headline: 'Vous commencez à ressentir les premiers mouvements !',
    babyDetails:
      'Bébé dort, se réveille, s’étire et entend les bruits du corps de sa maman ainsi que sa voix.',
    mamanTips:
      "Le ventre s'arrondit nettement. Pensez à bien vous hydrater et à marcher quotidiennement pour stimuler la circulation.",
    exam: '2ème échographie morphologique détaillée (T2)',
  },
  {
    week: 28,
    trimester: '3e Trimestre',
    fruit: 'Une grosse aubergine',
    size: '37 cm',
    weight: '1.1 kg',
    heartbeat: '140 bpm',
    headline: 'Bébé ouvre les yeux et réagit à la lumière',
    babyDetails:
      'Ses poumons poursuivent leur maturation et son cerveau développe des milliards de connexions neuronales.',
    mamanTips:
      "La fatigue peut réapparaître. Surveillez votre tension artérielle et évitez de porter des charges lourdes.",
    exam: 'Bilan sanguin du 6e mois & Consultation prénatale (CPN 3)',
  },
  {
    week: 36,
    trimester: '3e Trimestre',
    fruit: 'Une papaye généreuse',
    size: '47 cm',
    weight: '2.7 kg',
    heartbeat: '135 bpm',
    headline: 'Presque prêt pour la grande rencontre !',
    babyDetails:
      'Bébé a généralement la tête en bas. Il stocke de la graisse sous la peau pour réguler sa température à la naissance.',
    mamanTips:
      "C'est le moment idéal pour finaliser votre valise de maternité et vérifier les coordonnées de votre sage-femme ou maternité.",
    exam: 'Consultation anesthésie + 8ème mois & Préparation de la valise',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToResources,
  onNavigateToGuide,
}) => {
  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scrolled state for sticky header shadow & blur
  const [isScrolled, setIsScrolled] = useState(false);

  // Interactive Pregnancy Slider selection
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1); // default to week 20
  const activePreview = PREVIEW_WEEKS[selectedWeekIndex];

  // FAQ open items state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // PWA beforeinstallprompt installation banner
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // PWA Install Detection
  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem('maman_pwa_banner_dismissed') === 'true';
    if (isDismissed) return;

    // Detect if already installed / standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS Safari
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    if (isIos && isSafari && !isStandalone) {
      setIsIosPrompt(true);
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => setShowInstallBanner(false), 3000);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('maman_pwa_banner_dismissed', 'true');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "L'application MAMAN+ est-elle totalement gratuite ?",
      a: "Oui, MAMAN+ est 100% gratuite pour toutes les futures mamans. Il n'y a aucun abonnement, aucun paiement caché et aucune formule payante. Toutes les fonctionnalités de suivi de grossesse, de calendrier, de carnet et de synthèse médicale sont accessibles sans frais.",
    },
    {
      q: 'Comment mes données personnelles et médicales sont-elles protégées ?',
      a: 'La confidentialité de votre santé est notre priorité absolue. Vos données de grossesse (poids, rendez-vous, symptômes, ordonnances) sont chiffrées et protégées par des règles d’accès strictes. Aucune donnée n’est vendue, partagée à des tiers ou utilisée à des fins publicitaires.',
    },
    {
      q: 'Comment installer MAMAN+ sur mon téléphone ou mon ordinateur ?',
      a: 'MAMAN+ utilise la technologie PWA (Progressive Web App). Vous pouvez l’installer directement depuis votre navigateur sans avoir besoin de passer par un magasin d’applications lourd : cliquez simplement sur le bouton "Installer l\'application" en haut de page, ou utilisez l\'option "Ajouter à l\'écran d\'accueil" dans le menu de votre navigateur.',
    },
    {
      q: 'MAMAN+ remplace-t-elle le suivi par un médecin ou une sage-femme ?',
      a: 'Non. MAMAN+ est un outil d’accompagnement, de suivi personnel et de prévention. Il ne remplace en aucun cas les consultations médicales, les échographies et les bilans biologiques réalisés par des soignants qualifiés. Cependant, MAMAN+ vous aide à ne rien oublier et à préparer vos rendez-vous.',
    },
    {
      q: 'Puis-je exporter un résumé de ma grossesse pour mon soignant ?',
      a: 'Oui ! MAMAN+ intègre une fonctionnalité de "Synthèse Médicale". En un seul clic, vous pouvez générer et télécharger un document PDF clair et structuré récapitulant vos repères clés, vos examens, vos antécédents et vos symptômes récents, prêt à être remis à votre médecin ou sage-femme.',
    },
    {
      q: 'Puis-je utiliser MAMAN+ même si je n’ai pas toujours une bonne connexion Internet ?',
      a: 'Oui. Grâce à son architecture PWA et à sa mise en cache locale, l’application reste accessible et fluide même en cas de réseau intermittent, vous permettant de consulter vos repères et de noter vos informations hors-ligne.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2C2825] flex flex-col font-sans selection:bg-[#9E2A2B]/15 selection:text-[#9E2A2B] antialiased">
      {/* ------------------------------------------------------------- */}
      {/* PWA INSTALLATION INVITATION BANNER (DISCREET & DISMISSIBLE)   */}
      {/* ------------------------------------------------------------- */}
      {showInstallBanner && (
        <div className="bg-[#1E1B18] text-white px-4 py-3 border-b border-[#332E2A] text-xs sm:text-sm sticky top-0 z-50 transition-all shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-lg bg-[#9E2A2B] flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-semibold text-white">Installez l'application MAMAN+ : </span>
                <span className="text-[#D8D2C7]">
                  {isIosPrompt
                    ? 'Dans Safari, touchez "Partager" puis "Sur l\'écran d\'accueil" pour un accès instantané.'
                    : 'Installez MAMAN+ sur votre téléphone ou ordinateur pour retrouver votre espace plus facilement.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-lg bg-[#9E2A2B] hover:bg-[#852223] text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installSuccess ? 'Installé !' : "Installer l'application"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDismissInstall}
                aria-label="Fermer l'invitation d'installation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A69F96] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OFFICIAL HEADER                                              */}
      {/* ------------------------------------------------------------- */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#EAE5DC] shadow-xs py-3'
            : 'bg-white border-b border-[#EFECE6] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand with Real MAMAN+ Emblem */}
          <div
            onClick={() => scrollToSection('accueil')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <BrandEmblem size={42} />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#2A2421] tracking-tight">
                  MAMAN
                </span>
                <span className="text-[#9E2A2B] font-bold text-xl sm:text-2xl ml-0.5">+</span>
              </div>
              <span className="text-[11px] sm:text-[12px] font-medium text-[#7A736B] tracking-tight -mt-0.5">
                Maternité & Bien-être
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#5C554E]">
            <button
              type="button"
              onClick={() => scrollToSection('accueil')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('fonctionnalites')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Fonctionnalités
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pourquoi')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Pourquoi MAMAN+
            </button>
            <button
              type="button"
              onClick={onNavigateToResources}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Ressources</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#9E2A2B]/10 text-[#9E2A2B] font-semibold">
                Libre accès
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Auth CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="px-4 py-2 rounded-xl text-[13.5px] font-medium text-[#4A433D] hover:text-[#1E1B18] hover:bg-[#F2ECE4]/60 transition-all cursor-pointer"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => onNavigateToLogin('register')}
              className="px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-[13.5px] font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 group"
            >
              <span>Accéder à mon espace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="px-3 py-1.5 rounded-lg bg-[#9E2A2B] text-white text-xs font-semibold cursor-pointer"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Ouvrir le menu mobile"
              className="p-2 rounded-xl border border-[#E5DFD5] bg-white text-[#2C2825] hover:bg-[#FAF7F5] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#EAE5DC] bg-white px-5 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3 text-[15px] font-medium text-[#4A433D]">
              <button
                type="button"
                onClick={() => scrollToSection('accueil')}
                className="text-left py-2 hover:text-[#9E2A2B] transition-colors"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('fonctionnalites')}
                className="text-left py-2 hover:text-[#9E2A2B] transition-colors"
              >
                Fonctionnalités
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pourquoi')}
                className="text-left py-2 hover:text-[#9E2A2B] transition-colors"
              >
                Pourquoi MAMAN+
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToResources();
                }}
                className="text-left py-2 hover:text-[#9E2A2B] transition-colors flex items-center justify-between"
              >
                <span>Conseils & Ressources</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#9E2A2B]/10 text-[#9E2A2B]">
                  Public
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToGuide();
                }}
                className="text-left py-2 hover:text-[#9E2A2B] transition-colors"
              >
                Guide d'utilisation
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="text-left py-2 hover:text-[#9E2A2B] transition-colors"
              >
                Questions Fréquentes (FAQ)
              </button>
            </div>

            <div className="pt-3 border-t border-[#EFECE6] flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateToLogin('login')}
                className="w-full py-2.5 rounded-xl border border-[#DCD5CB] text-[#2C2825] font-medium text-sm text-center"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => onNavigateToLogin('register')}
                className="w-full py-3 rounded-xl bg-[#9E2A2B] text-white font-semibold text-sm text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>Créer mon carnet gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section
        id="accueil"
        className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-linear-to-b from-[#FFFDF9] via-[#FAF7F5] to-[#F5F2EB]"
      >
        {/* Soft background decor shapes */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#F7EBEB]/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 text-[#9E2A2B] text-xs sm:text-[13px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>L'application officielle de maternité & santé bienveillante</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-bold text-[#1E1B18] tracking-tight leading-[1.15]">
                Votre suivi de grossesse{' '}
                <span className="text-[#9E2A2B] italic underline decoration-[#9E2A2B]/30 decoration-wavy underline-offset-4">
                  complet
                </span>
                , rassurant et 100% gratuit
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#61584F] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                MAMAN+ accompagne chaque future maman pas à pas : développement de bébé semaine après
                semaine, calendrier des rendez-vous prénataux, surveillance des symptômes, courbe de
                poids et synthèse médicale exportable pour votre soignant.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('register')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#9E2A2B] hover:bg-[#852223] text-white font-semibold text-[15px] transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Accéder à mon espace MAMAN+</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('fonctionnalites')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FAF7F5] border border-[#DDD6CC] text-[#3B342E] font-medium text-[15px] transition-all cursor-pointer shadow-2xs hover:border-[#9E2A2B]/40"
                >
                  Découvrir les fonctionnalités
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#EBE6DE] shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span className="text-[12px] font-semibold text-[#3C3631]">100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#EBE6DE] shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span className="text-[12px] font-semibold text-[#3C3631]">Données Chiffrées</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#EBE6DE] shadow-2xs">
                  <Stethoscope className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span className="text-[12px] font-semibold text-[#3C3631]">Repères Cliniques</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-[#EBE6DE] shadow-2xs">
                  <Smartphone className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span className="text-[12px] font-semibold text-[#3C3631]">Installable PWA</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive App Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-xl border border-[#EDE8E1] overflow-hidden">
                {/* Header of preview card */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF0F0] border border-[#F2D7DE] flex items-center justify-center">
                      <Baby className="w-5 h-5 text-[#9E2A2B]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#1E1B18]">Aperçu de Votre Carnet</div>
                      <div className="text-[11px] text-[#78716A]">Semaine {activePreview.week} de grossesse</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-[11px] font-semibold">
                    {activePreview.trimester}
                  </span>
                </div>

                {/* Week selector buttons */}
                <div className="py-3 flex items-center justify-between gap-1.5 overflow-x-auto">
                  {PREVIEW_WEEKS.map((item, idx) => (
                    <button
                      key={item.week}
                      type="button"
                      onClick={() => setSelectedWeekIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        selectedWeekIndex === idx
                          ? 'bg-[#9E2A2B] text-white shadow-xs'
                          : 'bg-[#F5F2EB] text-[#635B54] hover:bg-[#EAE4D9]'
                      }`}
                    >
                      S{item.week}
                    </button>
                  ))}
                </div>

                {/* Main Card Content */}
                <div className="space-y-4 pt-2">
                  {/* Baby fruit comparison box */}
                  <div className="p-4 rounded-2xl bg-linear-to-br from-[#FFF5F6] to-[#FDF8F6] border border-[#F5D8DD]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C3A47]">
                        Taille estimée de bébé
                      </span>
                      <span className="text-[12px] font-bold text-[#9E2A2B]">{activePreview.fruit}</span>
                    </div>
                    <div className="mt-2 text-[14px] font-bold text-[#1E1B18]">{activePreview.headline}</div>
                    <p className="mt-1 text-[12px] text-[#594F48] leading-relaxed">
                      {activePreview.babyDetails}
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-[#F2D7DE]/70 text-center">
                      <div className="p-1.5 rounded-lg bg-white/70">
                        <div className="text-[10px] text-[#8C847D]">Taille</div>
                        <div className="text-[12px] font-bold text-[#1E1B18]">{activePreview.size}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/70">
                        <div className="text-[10px] text-[#8C847D]">Poids</div>
                        <div className="text-[12px] font-bold text-[#1E1B18]">{activePreview.weight}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/70">
                        <div className="text-[10px] text-[#8C847D]">Rythme</div>
                        <div className="text-[12px] font-bold text-[#9E2A2B]">{activePreview.heartbeat}</div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Exam Notice */}
                  <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E9E4DB] flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#9E2A2B] mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <span className="font-semibold text-[#1E1B18]">Étape clinique recommandée : </span>
                      <span className="text-[#594F48]">{activePreview.exam}</span>
                    </div>
                  </div>

                  {/* CTA button on preview card */}
                  <button
                    type="button"
                    onClick={() => onNavigateToLogin('register')}
                    className="w-full py-2.5 rounded-xl bg-[#1E1B18] hover:bg-[#332E2A] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Suivre ma propre grossesse sur MAMAN+</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Floating badge bottom right */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-[#9E2A2B]/10 -z-10 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. POURQUOI CHOISIR MAMAN+ (LES 4 PILIERS)                   */}
      {/* ------------------------------------------------------------- */}
      <section id="pourquoi" className="py-16 sm:py-20 bg-white border-y border-[#EDE8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-[#9E2A2B] uppercase">
              Pourquoi choisir MAMAN+ ?
            </h2>
            <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1B18]">
              Une application pensée par et pour les futures mamans
            </p>
            <p className="text-base text-[#696159] leading-relaxed">
              Nous savons à quel point la grossesse est une aventure extraordinaire qui suscite
              d'innombrables questions. MAMAN+ rassemble dans une interface douce et bienveillante tout
              ce dont vous avez besoin pour vivre ces 9 mois avec clarté et sérénité.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#FBF9F6] border border-[#EFE9DF] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FAF0F0] text-[#9E2A2B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Repères Cliniques & OMS</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Suivi obstétrical rigoureux respectant le calendrier des Consultations Prénatales (CPN),
                les examens biologiques et les échographies recommandées.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#FBF9F6] border border-[#EFE9DF] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">100% Gratuit & Sans Pub</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Aucun coût, aucune mauvaise surprise, aucune publicité intrusive. MAMAN+ est un service
                de santé numérique entièrement libre et accessible à toutes.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#FBF9F6] border border-[#EFE9DF] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#EBF5FB] text-[#1D70B8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Synthèse Médicale PDF</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Exportez en un clic un document récapitulatif complet de votre parcours pour votre
                gynécologue, sage-femme ou pour votre valise de maternité.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#FBF9F6] border border-[#EFE9DF] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] text-[#B7791F] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1B18]">Bien-être & Intimité</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Journal intime, photos des échographies, checklists personnalisées et repérage des
                signes qui nécessitent un avis médical rapide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. TOUTES LES FONCTIONNALITÉS COMPLÈTES                      */}
      {/* ------------------------------------------------------------- */}
      <section id="fonctionnalites" className="py-16 sm:py-24 bg-[#F8F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-[#9E2A2B] uppercase">
              Fonctionnalités indispensables
            </h2>
            <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1B18]">
              Tout votre carnet de maternité réuni au même endroit
            </p>
            <p className="text-base text-[#696159] leading-relaxed">
              Fini les carnets papier égarés ou les dates de rendez-vous oubliées. MAMAN+ regroupe
              toutes les facettes essentielles de votre grossesse.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FAF0F0] text-[#9E2A2B] flex items-center justify-center mb-4">
                <Baby className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Suivi de Bébé Semaine par Semaine</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Découvrez la taille, le poids, le développement des sens et les étapes clés de votre bébé
                avec des repères imagés et stimulants.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#EBF5FB] text-[#1D70B8] flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Calendrier & Rendez-vous Prénataux</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Planifiez vos consultations prénatales, échographies et prises de sang avec rappels pour
                ne manquer aucune échéance médicale.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FAF0F0] text-[#C43859] flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Surveillance des Symptômes & Alertes</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Notez vos sensations quotidiennes (nausées, fatigue, contractions) et identifiez les
                signaux nécessitant une consultation sans tarder.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Courbe de Poids & Repères d'IMC</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Suivez votre prise de poids semaine après semaine par rapport aux couloirs de santé
                recommandés selon votre IMC pré-grossesse.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Ordonnances & Traitements</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Enregistrez vos prescriptions (fer, acide folique, vitamines prénatales), leur posologie
                et gardez un historique propre de vos traitements.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FFF8E7] text-[#B7791F] flex items-center justify-center mb-4">
                <ListChecks className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Valise Maternité & Checklists</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Préparez sereinement les affaires de bébé, de maman et les documents administratifs grâce
                à une liste prête à cocher complète.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FAF0F0] text-[#9E2A2B] flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Journal Intime & Souvenirs</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Immortalisez vos émotions, vos anecdotes, le choix des prénoms et vos questions à poser
                lors de votre prochaine visite médicale.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-4">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Export Synthèse Médicale PDF</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Téléchargez un rapport officiel synthétisant vos constantes, échographies et antécédents
                médicaux pour votre praticien hospitalier.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DA] shadow-xs hover:border-[#9E2A2B]/40 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#EBF5FB] text-[#1D70B8] flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1E1B18]">Conseils Validés & Guide Pratique</h3>
              <p className="mt-2 text-sm text-[#665E56] leading-relaxed">
                Accédez à plus de 1000 fiches validées sur la nutrition, le sommeil, les petits maux et
                la préparation à l’allaitement.
              </p>
            </div>
          </div>

          {/* Action to create account */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => onNavigateToLogin('register')}
              className="px-8 py-3.5 rounded-2xl bg-[#9E2A2B] hover:bg-[#852223] text-white font-semibold text-[15px] transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Accéder à toutes les fonctionnalités</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. COMMENT ÇA MARCHE ? (4 ÉTAPES CLAIRES)                     */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#EDE8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-[#9E2A2B] uppercase">
              Simplicité d'utilisation
            </h2>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              Comment commencer avec MAMAN+ ?
            </p>
            <p className="text-sm sm:text-base text-[#696159]">
              Commencez à suivre votre grossesse en moins de deux minutes.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#9E2A2B] text-white font-serif font-bold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                1
              </div>
              <h3 className="font-bold text-[#1E1B18] text-base">Créez votre profil</h3>
              <p className="text-sm text-[#665E56] leading-relaxed">
                Renseignez simplement la date de vos dernières règles ou la date prévue d’accouchement
                (DPA).
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#9E2A2B] text-white font-serif font-bold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                2
              </div>
              <h3 className="font-bold text-[#1E1B18] text-base">Découvrez votre carnet</h3>
              <p className="text-sm text-[#665E56] leading-relaxed">
                Votre tableau de bord personnalisé s'adapte instantanément à votre semaine de grossesse.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#9E2A2B] text-white font-serif font-bold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                3
              </div>
              <h3 className="font-bold text-[#1E1B18] text-base">Notez au fur et à mesure</h3>
              <p className="text-sm text-[#665E56] leading-relaxed">
                Enregistrez vos rendez-vous, vos sensations, votre poids et consultez les conseils
                adaptés.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#9E2A2B] text-white font-serif font-bold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                4
              </div>
              <h3 className="font-bold text-[#1E1B18] text-base">Partagez avec vos soignants</h3>
              <p className="text-sm text-[#665E56] leading-relaxed">
                Téléchargez votre synthèse PDF avant chaque consultation prénatale ou pour la
                maternité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. RESSOURCES EN LIBRE ACCÈS (AVEC LIEN DIRECT)               */}
      {/* ------------------------------------------------------------- */}
      <section id="ressources" className="py-16 sm:py-20 bg-[#FAF7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E8E2D8]">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-[#9E2A2B] uppercase">
                Conseils & Guides Pratiques
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1B18]">
                Ressources vérifiées en libre accès
              </h2>
              <p className="text-sm sm:text-base text-[#696159]">
                Consultez nos articles et fiches santé sans inscription obligatoire pour vous informer
                à tout moment.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToResources}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl border border-[#9E2A2B] text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Voir toute la bibliothèque</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Article Card 1 */}
            <div
              onClick={onNavigateToResources}
              className="p-6 rounded-2xl bg-white border border-[#EAE4DA] hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-xs font-semibold">
                  Alimentation & Santé
                </span>
                <h3 className="mt-3 font-serif font-bold text-lg text-[#1E1B18]">
                  Bien s’alimenter pendant la grossesse : les repères essentiels
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#665E56] leading-relaxed">
                  Quels aliments privilégier pour faire le plein de fer, d’acide folique et de calcium ?
                  Ceux à éviter pour écarter tout risque bactérien.
                </p>
              </div>
              <div className="pt-3 border-t border-[#F0EAE1] flex items-center text-xs font-semibold text-[#9E2A2B]">
                <span>Lire la fiche pratique</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Article Card 2 */}
            <div
              onClick={onNavigateToResources}
              className="p-6 rounded-2xl bg-white border border-[#EAE4DA] hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#FAF0F0] text-[#9E2A2B] text-xs font-semibold">
                  Prévention Médicale
                </span>
                <h3 className="mt-3 font-serif font-bold text-lg text-[#1E1B18]">
                  Quels sont les signaux d’alerte qui imposent une consultation ?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#665E56] leading-relaxed">
                  Fièvre, saignements, maux de tête violents ou diminution des mouvements de bébé : les
                  signes cliniques à ne jamais négliger.
                </p>
              </div>
              <div className="pt-3 border-t border-[#F0EAE1] flex items-center text-xs font-semibold text-[#9E2A2B]">
                <span>Lire la fiche pratique</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Article Card 3 */}
            <div
              onClick={onNavigateToGuide}
              className="p-6 rounded-2xl bg-white border border-[#EAE4DA] hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="px-2.5 py-1 rounded-full bg-[#EBF5FB] text-[#1D70B8] text-xs font-semibold">
                  Préparation & Valise
                </span>
                <h3 className="mt-3 font-serif font-bold text-lg text-[#1E1B18]">
                  Guide complet : comment bien préparer le départ pour la maternité ?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#665E56] leading-relaxed">
                  La checklist complète pour bébé et maman, les pièces administratives à conserver et
                  le plan de transport vers la clinique.
                </p>
              </div>
              <div className="pt-3 border-t border-[#F0EAE1] flex items-center text-xs font-semibold text-[#9E2A2B]">
                <span>Consulter le guide</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. FOIRE AUX QUESTIONS (FAQ)                                  */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-y border-[#EDE8E1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-[#9E2A2B] uppercase">
              Questions Fréquentes
            </h2>
            <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E1B18]">
              Tout ce que vous voulez savoir sur MAMAN+
            </p>
            <p className="text-sm sm:text-base text-[#696159]">
              Des réponses claires et transparentes à vos interrogations.
            </p>
          </div>

          <div className="mt-12 space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#EAE4DA] bg-[#FBF9F6] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#1E1B18] text-[15px] sm:text-base cursor-pointer hover:bg-[#F6F2EC] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#9E2A2B] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm sm:text-[14.5px] text-[#5C554E] leading-relaxed border-t border-[#EFE8DF] pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. BANNIÈRE D'APPEL À L'ACTION FINALE (CTA)                    */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24 bg-linear-to-br from-[#9E2A2B] via-[#852223] to-[#68191A] text-white relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-[#F2A7B5]" />
            <span>Votre maternité mérite le meilleur accompagnement</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Prête à vivre une grossesse sereine et organisée ?
          </h2>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Rejoignez dès aujourd'hui les futures mamans qui font confiance à MAMAN+ pour suivre
            l'évolution de bébé, leurs rendez-vous et leur santé.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => onNavigateToLogin('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#9E2A2B] hover:bg-[#FAF7F5] font-bold text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Accéder à mon espace MAMAN+</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#9E2A2B]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-base transition-all cursor-pointer"
            >
              J'ai déjà un compte
            </button>
          </div>

          <div className="pt-2 text-xs text-white/70 flex items-center justify-center gap-4 flex-wrap">
            <span>✓ Inscription gratuite en 1 minute</span>
            <span>✓ Aucune carte bancaire demandée</span>
            <span>✓ Données confidentielles</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FOOTER OFFICIEL                                            */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[#1E1B18] text-[#D8D2C7] pt-14 pb-10 border-t border-[#332E2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3 select-none">
                <BrandEmblem size={44} />
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center">
                    <span className="font-serif font-bold text-2xl text-white tracking-tight">
                      MAMAN
                    </span>
                    <span className="text-[#C43859] font-bold text-2xl ml-0.5">+</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#A69F96]">
                    Maternité & Santé Bienveillante
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#A69F96] leading-relaxed max-w-sm">
                MAMAN+ est une application dédiée au suivi de grossesse, au bien-être de la future
                maman et à la préparation de l'arrivée de bébé.
              </p>

              <div className="pt-1 flex items-center gap-2 text-xs text-[#8A827A]">
                <span>Suivi • Soin • Bien-être</span>
                <span>•</span>
                <span>100% Gratuit</span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Navigation</div>
              <ul className="space-y-2 text-xs sm:text-sm text-[#A69F96]">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('accueil')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('fonctionnalites')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Toutes les fonctionnalités
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('pourquoi')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Pourquoi MAMAN+ ?
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onNavigateToResources}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Conseils & Ressources
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onNavigateToGuide}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Guide d'utilisation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Questions Fréquentes (FAQ)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Medical Notice & Security */}
            <div className="md:col-span-4 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">
                Déontologie & Santé
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#A69F96] leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-white font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E6A15C]" />
                  <span>Avertissement médical</span>
                </div>
                <p>
                  MAMAN+ est un carnet personnel et éducatif. Les contenus et repères ne constituent
                  en aucun cas un avis médical ou un diagnostic. En cas d'urgence ou d'inquiétude,
                  consultez immédiatement une sage-femme, un médecin ou rendez-vous à la maternité la
                  plus proche.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-[#332E2A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A827A]">
            <p>© {new Date().getFullYear()} MAMAN+. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigateToLogin('login')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Espace Connexion
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={onNavigateToResources}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Portail Public
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
