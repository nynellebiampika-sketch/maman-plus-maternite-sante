import React, { useState, useEffect } from 'react';
import { SiteOpeningLoader } from './SiteOpeningLoader';
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
  Phone,
  Mail,
  MapPin,
  Star,
  User,
  Search,
  Filter,
} from 'lucide-react';
import { BrandLogo, BrandEmblem } from './BrandLogo';

interface LandingPageProps {
  onNavigateToLogin: (initialMode?: 'login' | 'register') => void;
  onNavigateToResources: () => void;
  onNavigateToGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToResources,
  onNavigateToGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const rotatingWords = [
    "Attention",
    "Bien-être",
    "Maternité",
    "Santé",
    "Prévention",
    "Grossesse",
    "Bébé",
    "Écoute",
    "Accompagnement",
    "Douceur",
    "Équilibre",
    "Nutrition",
    "Épanouissement",
    "Sérénité",
    "Conseils",
    "Protection",
    "Parentalité",
    "Confiance",
    "Vitalité",
    "Harmonie"
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isWordAnimating, setIsWordAnimating] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIsWordAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsWordAnimating(false);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, [rotatingWords.length]);

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
      a: 'MAMAN+ utilise la technologie PWA (Progressive Web App). Vous pouvez l’installer directement depuis votre navigateur sans avoir besoin de passer par un magasin d’applications lourd : cliquez simplement sur le bouton d’installation de votre navigateur.',
    },
    {
      q: 'MAMAN+ remplace-t-elle le suivi par un médecin ou une sage-femme ?',
      a: 'Non. MAMAN+ est un outil d’accompagnement, de suivi personnel et de prévention. Il ne remplace en aucun cas les consultations médicales, les échographies et les bilans biologiques réalisés par des soignants qualifiés.',
    },
    {
      q: 'Puis-je exporter un résumé de ma grossesse pour mon soignant ?',
      a: 'Oui ! MAMAN+ intègre une fonctionnalité de "Synthèse Médicale". En un seul clic, vous pouvez générer et télécharger un document PDF clair et structuré récapitulant vos repères clés, vos examens et vos symptômes.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C2825] font-sans antialiased selection:bg-[#9E2A2B]/15 selection:text-[#9E2A2B]">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER EXACTEMENT COMME SUR L'IMAGE                                */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F0EAE1] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => scrollToSection('accueil')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <BrandEmblem size={46} />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center">
                <span className="font-serif font-bold text-xl sm:text-[22px] text-[#1E1B18] tracking-tight">
                  MAMAN
                </span>
                <span className="text-[#9E2A2B] font-bold text-xl sm:text-[22px] ml-0.5">+</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7A736B]">
                Maternité & Santé
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-[#595048]">
            <button
              type="button"
              onClick={() => scrollToSection('accueil')}
              className="text-[#9E2A2B] font-semibold transition-colors cursor-pointer"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('maternite')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Maternité
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('soins')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Nos soins
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('specialites')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Spécialités
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('medecins')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Médecins
            </button>
            <button
              type="button"
              onClick={onNavigateToResources}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              À propos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="hover:text-[#9E2A2B] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="px-6 py-2.5 rounded-full bg-[#9E2A2B] hover:bg-[#852223] text-white text-[13.5px] font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Accéder à votre espace</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="px-3.5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold"
            >
              Espace
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="p-2 rounded-xl border border-[#E5DFD5] bg-white text-[#2C2825]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE5DC] bg-white px-5 py-6 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-3 text-[15px] font-medium text-[#4A433D]">
              <button
                type="button"
                onClick={() => scrollToSection('accueil')}
                className="text-left py-2 text-[#9E2A2B] font-semibold"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('maternite')}
                className="text-left py-2 hover:text-[#9E2A2B]"
              >
                Maternité
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('soins')}
                className="text-left py-2 hover:text-[#9E2A2B]"
              >
                Nos soins
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('specialites')}
                className="text-left py-2 hover:text-[#9E2A2B]"
              >
                Spécialités
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('medecins')}
                className="text-left py-2 hover:text-[#9E2A2B]"
              >
                Médecins
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToResources();
                }}
                className="text-left py-2 hover:text-[#9E2A2B]"
              >
                Conseils & Ressources
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="text-left py-2 hover:text-[#9E2A2B]"
              >
                Contact
              </button>
            </div>
            <div className="pt-3 border-t border-[#EFECE6]">
              <button
                type="button"
                onClick={() => onNavigateToLogin('login')}
                className="w-full py-3 rounded-xl bg-[#9E2A2B] text-white font-semibold text-sm text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>Accéder à votre espace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SECTION PIXEL PERFECT SUR L'IMAGE                          */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="accueil"
        className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-linear-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFEB]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Breadcrumb tag */}
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#9E2A2B]">
                <span>MAMAN+</span>
                <span>›</span>
                <span>MATERNITÉ & SANTÉ</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] font-bold text-[#1E1B18] tracking-tight leading-[1.12]">
                Une maternité accompagnée avec{' '}
                <span className="text-[#9E2A2B] italic inline-block">
                  <span
                    className={`inline-block transition-all duration-300 transform ${
                      isWordAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                  >
                    {rotatingWords[currentWordIndex]}.
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#665D54] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Nous plaçons la femme et son bébé au cœur d'un accompagnement médical attentif, humain
                et personnalisé.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#9E2A2B] hover:bg-[#852223] text-white font-semibold text-[15px] transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Accéder à votre espace</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('maternite')}
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-[#FAF7F5] border border-[#DDD5CB] text-[#3D352E] font-medium text-[15px] transition-all cursor-pointer shadow-2xs"
                >
                  Explorer MAMAN+ ›
                </button>
              </div>

              {/* Subtle Medical Assurance Note */}
              <div className="pt-6 flex items-center justify-center lg:justify-start gap-2 text-xs text-[#7A736B] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#E85D86]" />
                <span>Plateforme d'accompagnement médical et de suivi maternel dédiée.</span>
              </div>
            </div>

            {/* Right Column: Hero Visual from Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-[36px] overflow-hidden bg-linear-to-b from-[#FADCD9] to-[#F3C5C0] p-3 shadow-xl border border-white/80">
                <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] bg-white">
                  <img
                    src="/maman_hero_mother_baby.jpg"
                    alt="Mère et nouveau-né MAMAN+"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating badge top right */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#9E2A2B] shadow-sm flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-[#9E2A2B] text-[#9E2A2B]" />
                    <span>Soin attentif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. POURQUOI NOUS CHOISIR ?                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="soins" className="py-16 sm:py-24 bg-white border-y border-[#EDE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#9E2A2B] uppercase">
              — POURQUOI NOUS CHOISIR ?
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Un accompagnement pensé autour de vous
            </h2>
            <p className="text-base text-[#6E645B] leading-relaxed">
              Une prise en charge globale, humaine et moderne, pour chaque étape de votre vie.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF0F0] text-[#9E2A2B] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Suivi personnalisé</h3>
                <p className="mt-2.5 text-sm text-[#6B635B] leading-relaxed">
                  Un parcours de soins adapté à vos besoins, à chaque étape de votre vie.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-[#9E2A2B]">
                <span>Découvrir</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Équipe médicale spécialisée</h3>
                <p className="mt-2.5 text-sm text-[#6B635B] leading-relaxed">
                  Des experts à votre écoute, passionnés pour la santé de la femme et de l'enfant.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-[#2D6A4F]">
                <span>Notre équipe</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF0F0] text-[#C43859] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Diagnostic et soins</h3>
                <p className="mt-2.5 text-sm text-[#6B635B] leading-relaxed">
                  Des équipements modernes pour des diagnostics fiables et des soins de qualité.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-[#C43859]">
                <span>En savoir plus</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#9E2A2B]/30 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EBF5FB] text-[#1D70B8] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Rendez-vous simplifié</h3>
                <p className="mt-2.5 text-sm text-[#6B635B] leading-relaxed">
                  Prenez rendez-vous en ligne ou par téléphone, en quelques clics seulement.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-[#1D70B8]">
                <span>Prendre RDV</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. MATERNITÉ & PARCOURS DE GROSSESSE                                */}
      {/* ------------------------------------------------------------------ */}
      <section id="maternite" className="py-16 sm:py-24 bg-[#F8F5EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#9E2A2B] uppercase">
              — MATERNITÉ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Chaque étape de votre grossesse mérite une attention particulière
            </h2>
            <p className="text-base text-[#6E645B] leading-relaxed">
              De la première échographie au premier rendez-vous avec votre bébé, nous vous accompagnons
              avec expertise, écoute et bienveillance.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Image & Bullet points */}
            <div className="lg:col-span-7 space-y-8">
              <div className="relative rounded-[32px] overflow-hidden shadow-lg aspect-[16/10] bg-white border border-[#EAE3D9]">
                <img
                  src="/pregnant_mother_illustration.jpg"
                  alt="Maternité MAMAN+"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#EFE9DF]">
                  <CheckCircle2 className="w-5 h-5 text-[#9E2A2B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#1E1B18]">Suivi prénatal</h4>
                    <p className="text-xs text-[#6B635B] mt-0.5">Des consultations régulières et un suivi complet.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#EFE9DF]">
                  <CheckCircle2 className="w-5 h-5 text-[#9E2A2B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#1E1B18]">Échographie</h4>
                    <p className="text-xs text-[#6B635B] mt-0.5">Une imagerie médicale de précision pour suivre son évolution.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#EFE9DF]">
                  <CheckCircle2 className="w-5 h-5 text-[#9E2A2B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#1E1B18]">Conseils nutritionnels</h4>
                    <p className="text-xs text-[#6B635B] mt-0.5">Une alimentation adaptée pour vous et votre bébé.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#EFE9DF]">
                  <CheckCircle2 className="w-5 h-5 text-[#9E2A2B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#1E1B18]">Préparation à l'accouchement</h4>
                    <p className="text-xs text-[#6B635B] mt-0.5">Des ateliers et un accompagnement personnalisé.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Votre parcours de grossesse */}
            <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-[32px] border border-[#EAE3D9] shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-xl text-[#1E1B18] pb-4 border-b border-[#F0EAE1]">
                Votre parcours de grossesse
              </h3>

              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E1D7]">
                <div className="relative pl-10 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#9E2A2B] border-4 border-white shadow-xs" />
                  <div className="text-xs font-bold text-[#9E2A2B]">1er trimestre • Sem. 1 – 12</div>
                  <div className="text-sm font-bold text-[#1E1B18]">Formation des organes, premiers signes.</div>
                </div>

                <div className="relative pl-10 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#9E2A2B] border-4 border-white shadow-xs" />
                  <div className="text-xs font-bold text-[#9E2A2B]">2e trimestre • Sem. 13 – 26</div>
                  <div className="text-sm font-bold text-[#1E1B18]">Croissance du bébé, échographies.</div>
                </div>

                <div className="relative pl-10 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#9E2A2B] border-4 border-white shadow-xs" />
                  <div className="text-xs font-bold text-[#9E2A2B]">3e trimestre • Sem. 27 – 40</div>
                  <div className="text-sm font-bold text-[#1E1B18]">Préparation à la naissance.</div>
                </div>

                <div className="relative pl-10 space-y-1">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#C43859] border-4 border-white shadow-xs" />
                  <div className="text-xs font-bold text-[#C43859]">Accouchement • Sem. 40+</div>
                  <div className="text-sm font-bold text-[#1E1B18]">Une nouvelle étape commence.</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="w-full py-3.5 rounded-2xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Accéder à votre espace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. NOS SPÉCIALITÉS                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section id="specialites" className="py-16 sm:py-24 bg-white border-y border-[#EDE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#9E2A2B] uppercase">
              — NOS SPÉCIALITÉS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Des soins experts dans tous les domaines de votre santé
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Gynécologie', desc: 'Prévention, suivi et traitement des pathologies gynécologiques.' },
              { title: 'Obstétrique', desc: 'Suivi de grossesse et accouchement sécurisé.' },
              { title: 'Pédiatrie', desc: 'La santé de votre enfant de la naissance à l’adolescence.' },
              { title: 'Échographie', desc: 'Imagerie médicale de haute précision.' },
              { title: 'Nutrition', desc: 'Conseils alimentaires pour une meilleure santé.' },
              { title: 'Cardiologie', desc: 'Prévention et suivi des maladies cardiovasculaires.' },
              { title: 'Médecine générale', desc: 'Soins courants et suivi global de votre santé.' },
              { title: 'Santé de la femme', desc: 'Bien-être, prévention et suivi à chaque étape de votre vie.' },
            ].map((spec, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#9E2A2B]/40 hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DFD5] text-[#9E2A2B] flex items-center justify-center font-bold">
                  ✦
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">{spec.title}</h3>
                <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. MAMAN+, VOTRE BIEN-ÊTRE AU QUOTIDIEN                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-24 bg-[#F8F5EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-[32px] overflow-hidden shadow-lg border border-[#EAE3D9] bg-white aspect-[4/3] max-w-lg mx-auto lg:mx-0">
                <img
                  src="/maman_mother_baby.jpg"
                  alt="Maman et bébé MAMAN+"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="text-xs font-bold tracking-widest text-[#9E2A2B] uppercase">
                — BIEN-ÊTRE & ACCOMPAGNEMENT
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18] tracking-tight">
                Maman+, votre bien-être au quotidien
              </h2>
              <p className="text-base sm:text-lg text-[#665D54] leading-relaxed">
                Maman+ vous accompagne à chaque étape de votre parcours de maternité avec des informations fiables, des conseils pratiques et un espace pensé pour votre santé, votre bien-être et celui de votre bébé.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="px-7 py-3.5 rounded-full bg-[#9E2A2B] hover:bg-[#852223] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Découvrir l'espace MAMAN+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. SUIVI DE GROSSESSE INTERACTIF SUR LA LANDING                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-24 bg-white border-y border-[#EDE6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#9E2A2B] uppercase">
              — SUIVI DE GROSSESSE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Votre grossesse, pas à pas
            </h2>
            <p className="text-base text-[#6E645B]">Un suivi digital pour rester informée et sereine.</p>
          </div>

          <div className="mt-14 p-6 sm:p-10 rounded-[36px] bg-linear-to-br from-[#FAF7F2] to-[#F3EDE2] border border-[#EAE3D9] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Week 24 Card */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#EAE3D9] shadow-xs text-center space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full border-8 border-[#FAF0F0] flex flex-col items-center justify-center bg-[#FFF9F9]">
                <span className="text-[10px] uppercase font-bold text-[#8C847D]">Semaine</span>
                <span className="font-serif text-3xl font-bold text-[#9E2A2B]">24</span>
                <span className="text-[10px] text-[#8C847D]">sur 40</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#1E1B18]">Bébé grandit bien</div>
                <p className="text-xs text-[#6B635B]">Accédez à votre tableau de bord pour suivre les battements et repères.</p>
              </div>
            </div>

            {/* Calendar & Next steps */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EAE3D9] space-y-1">
                  <div className="text-[11px] font-bold text-[#9E2A2B]">Prochaine consultation</div>
                  <div className="text-sm font-bold text-[#1E1B18]">12 avril 2025</div>
                  <div className="text-[11px] text-[#7A736B]">Consultation prénatale</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EAE3D9] space-y-1">
                  <div className="text-[11px] font-bold text-[#9E2A2B]">Prochains examens</div>
                  <div className="text-sm font-bold text-[#1E1B18]">Échographie T2</div>
                  <div className="text-[11px] text-[#7A736B]">Bilan biologique</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EAE3D9] space-y-1">
                  <div className="text-[11px] font-bold text-[#9E2A2B]">Conseil du jour</div>
                  <div className="text-sm font-bold text-[#1E1B18]">Aliments riches en fer</div>
                  <div className="text-[11px] text-[#7A736B]">Privilégiez les légumes verts</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE3D9]">
                <div className="text-center sm:text-left">
                  <div className="font-serif font-bold text-lg text-[#1E1B18]">Prendre soin de soi, c'est aussi prendre soin de son bébé.</div>
                  <div className="text-xs text-[#7A736B] mt-0.5">Retrouvez toutes vos données dans votre espace sécurisé.</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="px-6 py-3 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Accéder à votre espace
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. FAQ                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-20 bg-[#F8F5EE] border-y border-[#EDE6DD]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#9E2A2B] uppercase">
              — FAQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1B18]">
              Questions Fréquentes
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#EAE3D9] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#1E1B18] text-[15px] cursor-pointer hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#9E2A2B] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-[#6B635B] leading-relaxed border-t border-[#F0EAE1] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. FOOTER EXACTEMENT COMME SUR L'IMAGE                             */}
      {/* ------------------------------------------------------------------ */}
      <footer id="contact" className="bg-[#1E1B18] text-[#D8D2C7] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top callout banner */}
          <div className="p-8 sm:p-10 rounded-[36px] bg-linear-to-br from-[#FADCD9] to-[#F1B8B3] text-[#1E1B18] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif font-bold text-2xl sm:text-3xl">
                Votre santé. Votre grossesse. Votre sérénité.
              </h3>
              <p className="text-sm text-[#594B46] max-w-xl">
                Bénéficiez d'un accompagnement personnalisé et prenez rendez-vous simplement avec notre équipe.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="px-7 py-3.5 rounded-full bg-[#9E2A2B] hover:bg-[#852223] text-white font-semibold text-sm transition-all shadow-md shrink-0 cursor-pointer"
            >
              Prendre rendez-vous
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-4">
            {/* Col 1: Logo & Tagline */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <BrandEmblem size={42} />
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center">
                    <span className="font-serif font-bold text-2xl text-white">MAMAN</span>
                    <span className="text-[#C43859] font-bold text-2xl ml-0.5">+</span>
                  </div>
                  <span className="text-[10px] text-[#A69F96]">Maternité & Santé</span>
                </div>
              </div>
              <p className="text-xs text-[#A69F96] leading-relaxed">
                Parce que chaque femme mérite le meilleur pour elle et son enfant.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Navigation</div>
              <ul className="space-y-2 text-xs text-[#A69F96]">
                <li><button onClick={() => scrollToSection('accueil')} className="hover:text-white">Accueil</button></li>
                <li><button onClick={() => scrollToSection('maternite')} className="hover:text-white">Maternité</button></li>
                <li><button onClick={() => scrollToSection('specialites')} className="hover:text-white">Spécialités</button></li>
                <li><button onClick={() => scrollToSection('medecins')} className="hover:text-white">Médecins</button></li>
                <li><button onClick={onNavigateToResources} className="hover:text-white">À propos</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white">Contact</button></li>
              </ul>
            </div>

            {/* Col 3: Spécialités */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Spécialités</div>
              <ul className="space-y-2 text-xs text-[#A69F96]">
                <li>Gynécologie</li>
                <li>Obstétrique</li>
                <li>Pédiatrie</li>
                <li>Échographie</li>
                <li>Nutrition</li>
                <li>Santé de la femme</li>
              </ul>
            </div>

            {/* Col 4: Contact & Horaires */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Contact & Horaires</div>
              <div className="space-y-2 text-xs text-[#A69F96] leading-relaxed">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#9E2A2B]" /> +242 06 032 0760</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#9E2A2B]" /> contact@mamanplus.cd</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#9E2A2B]" /> Avenue du marché, Marché Masengo</p>
                <div className="pt-2 border-t border-[#332E2A] space-y-1">
                  <p className="font-semibold text-white">Horaires :</p>
                  <p>Lun - Ven : 7h00 - 18h00</p>
                  <p>Sam : 7h00 - 14h00</p>
                  <p>Dim : 8h00 - 12h00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-[#332E2A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A827A]">
            <p>© {new Date().getFullYear()} MAMAN+. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <button onClick={onNavigateToGuide} className="hover:text-white">Politique de confidentialité</button>
              <span>•</span>
              <button onClick={onNavigateToGuide} className="hover:text-white">Mentions légales</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
