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
  Play,
} from 'lucide-react';
import { BrandLogo, BrandEmblem } from './BrandLogo';

interface LandingPageProps {
  onNavigateToLogin: (initialMode?: 'login' | 'register') => void;
  onNavigateToResources: () => void;
  onNavigateToGuide: () => void;
  initialSection?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToResources,
  onNavigateToGuide,
  initialSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (initialSection) {
      const timer = setTimeout(() => {
        scrollToSection(initialSection);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
    <div className="min-h-screen bg-[#FFFDFC] text-[#171717] font-sans antialiased selection:bg-[#E85D86]/20 selection:text-[#9E2A2B]">
      {/* ------------------------------------------------------------------ */}
      {/* 1. NAVBAR EXACTEMENT COMME SUR L'IMAGE 2                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 bg-[#FFFDFC]/95 backdrop-blur-md border-b border-[#F0EAE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => scrollToSection('accueil')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <BrandEmblem size={48} />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center">
                <span className="font-serif font-bold text-[22px] text-[#171717] tracking-tight">
                  MAMAN
                </span>
                <span className="text-[#E85D86] font-bold text-[22px] ml-0.5">+</span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7A736B]">
                Maternité & Santé
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#E85D86]">
                SUIVI • SOIN • BIEN-ÊTRE
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-[#595048]">
            <button
              type="button"
              onClick={() => scrollToSection('accueil')}
              className="text-[#E85D86] font-semibold transition-colors cursor-pointer"
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('maternite')}
              className="hover:text-[#E85D86] transition-colors cursor-pointer"
            >
              Maternité
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('soins')}
              className="hover:text-[#E85D86] transition-colors cursor-pointer"
            >
              Nos soins
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('specialites')}
              className="hover:text-[#E85D86] transition-colors cursor-pointer"
            >
              Spécialités
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('medecins')}
              className="hover:text-[#E85D86] transition-colors cursor-pointer"
            >
              Médecins
            </button>
            <button
              type="button"
              onClick={onNavigateToResources}
              className="hover:text-[#E85D86] transition-colors cursor-pointer"
            >
              À propos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="hover:text-[#E85D86] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right CTA Button (Bordeaux 3D capsule button) */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="btn-primary text-[13.5px] cursor-pointer"
            >
              <span>Accéder à votre espace</span>
              <span className="inner-button">
                <Calendar className="w-4 h-4 text-white icon" />
              </span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToLogin('login')}
              className="px-3 py-1.5 rounded-full bg-[#E85D86] text-white text-xs font-semibold"
            >
              Espace
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="p-2 rounded-xl border border-[#E5DFD5] bg-white text-[#171717]"
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
                className="text-left py-2 text-[#E85D86] font-semibold"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('maternite')}
                className="text-left py-2 hover:text-[#E85D86]"
              >
                Maternité
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('soins')}
                className="text-left py-2 hover:text-[#E85D86]"
              >
                Nos soins
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('specialites')}
                className="text-left py-2 hover:text-[#E85D86]"
              >
                Spécialités
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('medecins')}
                className="text-left py-2 hover:text-[#E85D86]"
              >
                Médecins
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToResources();
                }}
                className="text-left py-2 hover:text-[#E85D86]"
              >
                À propos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="text-left py-2 hover:text-[#E85D86]"
              >
                Contact
              </button>
            </div>
            <div className="pt-3 border-t border-[#EFECE6]">
              <button
                type="button"
                onClick={() => onNavigateToLogin('login')}
                className="w-full py-3 rounded-full bg-[#E85D86] text-white font-semibold text-sm text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>Accéder à votre espace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO SECTION EXACTEMENT COMME SUR L'IMAGE 2                      */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="accueil"
        className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-linear-to-b from-[#FFFDFC] via-[#FDF7F4] to-[#FAF0EE]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative">
              {/* Breadcrumb label */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E85D86] bg-[#FDF0F3] px-3.5 py-1.5 rounded-full border border-[#FADCD9]">
                <span>MAMAN+</span>
                <span>›</span>
                <span>MATERNITÉ & SANTÉ</span>
              </div>

              {/* Main Headline with exact static word "attention." and pink wavy underline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] font-bold text-[#171717] tracking-tight leading-[1.12]">
                Une maternité accompagnée avec{' '}
                <span className="text-[#E85D86] italic inline-block underline decoration-wavy decoration-[#E85D86]/60 underline-offset-8">
                  attention.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#595048] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Nous plaçons la femme et son bébé au cœur d'un accompagnement médical attentif, humain et personnalisé.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#E85D86] hover:bg-[#d44d73] text-white font-semibold text-[15px] transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-3"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <span>Accéder à votre espace</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('maternite')}
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-[#FAF7F2] text-[#171717] border border-[#E5DFD5] font-semibold text-[15px] transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-2"
                >
                  <span>Explorer MAMAN+</span>
                  <ChevronRight className="w-4 h-4 text-[#E85D86]" />
                </button>
              </div>

              {/* Handwritten Note Below CTAs */}
              <div className="pt-3 flex items-center justify-center lg:justify-start gap-2 text-sm text-[#E85D86] italic font-serif">
                <span>Parce que chaque maman mérite le meilleur</span>
                <Heart className="w-4 h-4 fill-[#E85D86] text-[#E85D86]" />
              </div>
            </div>

            {/* Right Column: Hero Visual exactly like image 2 */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-[36px] overflow-hidden bg-linear-to-b from-[#FADCD9] via-[#F5C2BC] to-[#F1B8B3] p-3 shadow-2xl border border-white">
                <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] bg-white shadow-inner">
                  <img
                    src="/african_pregnant_mother_photo.jpg"
                    alt="Maman africaine avec son nouveau-né MAMAN+"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating decorative elements */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#E85D86] shadow-sm flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-[#E85D86] text-[#E85D86]" />
                    <span>Soin d'amour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. SECTION "UNE PLATEFORME PENSÉE POUR VOUS"                        */}
      {/* ------------------------------------------------------------------ */}
      <section id="soins" className="py-20 sm:py-28 bg-white border-y border-[#EDE6DD] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left intro & 4 cards */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-widest text-[#E85D86] uppercase">
                  POUR VOTRE BIEN-ÊTRE
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#171717] tracking-tight">
                  Une plateforme pensée pour vous
                </h2>
                <p className="text-base text-[#595048] leading-relaxed">
                  MAMAN+ est une application intelligente qui vous accompagne à chaque étape de votre parcours de maternité et de santé, grâce à la puissance de l'IA. Simple, sécurisée et bienveillante, elle vous guide, vous informe et vous soutient au quotidien.
                </p>
              </div>

              {/* 4 Cards Grid */}
              <div id="specialites" className="grid grid-cols-1 sm:grid-cols-2 gap-5 scroll-mt-24">
                {/* Card 1 */}
                <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#E85D86]/40 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0F3] text-[#E85D86] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#171717]">Suivi personnalisé</h3>
                  <p className="text-xs sm:text-sm text-[#595048] leading-relaxed">
                    Un parcours adapté à vos besoins et à chaque étape de votre vie.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#E85D86]/40 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0F3] text-[#E85D86] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#171717]">Intelligence artificielle</h3>
                  <p className="text-xs sm:text-sm text-[#595048] leading-relaxed">
                    Des conseils et des alertes personnalisés pour une meilleure prévention.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#E85D86]/40 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0F3] text-[#E85D86] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#171717]">Sécurité & confidentialité</h3>
                  <p className="text-xs sm:text-sm text-[#595048] leading-relaxed">
                    Vos données sont protégées avec les plus hauts standards de sécurité.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] hover:border-[#E85D86]/40 hover:shadow-md transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0F3] text-[#E85D86] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#171717]">Accessibilité</h3>
                  <p className="text-xs sm:text-sm text-[#595048] leading-relaxed">
                    Disponible à tout moment, sur tous vos appareils.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Phone Mockup from image 2 */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              <div className="relative w-full max-w-sm rounded-[40px] bg-linear-to-b from-[#FADCD9] via-[#F7D2CE] to-[#F1B8B3] p-4 shadow-xl border border-white">
                <div className="bg-white rounded-[32px] p-6 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
                    <div className="flex items-center gap-2">
                      <BrandEmblem size={28} />
                      <span className="font-serif font-bold text-sm text-[#171717]">MAMAN+</span>
                    </div>
                    <span className="text-[10px] bg-[#FDF0F3] text-[#E85D86] px-2.5 py-1 rounded-full font-semibold">En ligne</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-[#7A736B]">Bonjour,</div>
                    <div className="font-serif font-bold text-base text-[#171717]">Prenons soin de vous</div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('login')}
                      className="w-full p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#FDF0F3] border border-[#EAE3D9] hover:border-[#E85D86]/30 flex items-center justify-between text-xs font-semibold text-[#171717] transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Activity className="w-4 h-4 text-[#E85D86]" />
                        <span>Mon suivi de grossesse</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A69F96]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateToLogin('login')}
                      className="w-full p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#FDF0F3] border border-[#EAE3D9] hover:border-[#E85D86]/30 flex items-center justify-between text-xs font-semibold text-[#171717] transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#E85D86]" />
                        <span>Mes rendez-vous</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A69F96]" />
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToResources}
                      className="w-full p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#FDF0F3] border border-[#EAE3D9] hover:border-[#E85D86]/30 flex items-center justify-between text-xs font-semibold text-[#171717] transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-[#E85D86]" />
                        <span>Mes conseils & santé</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#A69F96]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Handwritten Note near Phone */}
              <div className="mt-4 text-center font-serif text-sm text-[#E85D86] italic">
                Votre santé et celle de votre bébé à portée de main ♥
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. SECTION MATERNITÉ EXACTEMENT COMME SUR L'IMAGE 2                 */}
      {/* ------------------------------------------------------------------ */}
      <section id="maternite" className="py-20 sm:py-28 bg-[#F8F5EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Text */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold tracking-widest text-[#E85D86] uppercase">
                MATERNITÉ
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#171717] leading-tight">
                Chaque étape de votre grossesse mérite une attention particulière.
              </h2>
              <p className="text-base sm:text-lg text-[#595048] leading-relaxed">
                Suivi, conseils, écoute et bienveillance : nous vous accompagnons du premier jour jusqu'à après la naissance.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="px-7 py-4 rounded-full bg-[#E85D86] hover:bg-[#d44d73] text-white font-semibold text-[15px] transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Découvrir nos soins</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Right Photos (Main photo + 3 stacked thumbnail cards like image 2) */}
            <div className="lg:col-span-6 relative flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-7/12 rounded-[32px] overflow-hidden shadow-xl aspect-[4/5] bg-white border border-[#EAE3D9]">
                <img
                  src="/african_pregnant_mother_photo.jpg"
                  alt="Maman africaine enceinte MAMAN+"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full sm:w-5/12 flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-white border border-[#EAE3D9]">
                  <img
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400"
                    alt="Sourire maman"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-white border border-[#EAE3D9]">
                  <img
                    src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=400"
                    alt="Mains tendres"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-white border border-[#EAE3D9]">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400"
                    alt="Bébé et maman"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. SECTION "PLUS QU'UNE APPLICATION" EXACTEMENT COMME SUR L'IMAGE 2 */}
      {/* ------------------------------------------------------------------ */}
      <section id="medecins" className="py-20 sm:py-28 bg-white border-y border-[#EDE6DD] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Mother photo with handwritten quote */}
            <div className="lg:col-span-6 relative flex flex-col items-center">
              <div className="w-full max-w-md rounded-[36px] overflow-hidden shadow-xl aspect-[4/3] bg-white border border-[#EAE3D9]">
                <img
                  src="/african_pregnant_mother_photo.jpg"
                  alt="Maman épanouie MAMAN+"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-6 font-serif text-lg text-[#E85D86] italic text-center max-w-sm">
                « Une application au service de toutes les mamans » ❤️
              </div>
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#171717] leading-tight">
                Plus qu'une application, un soutien au quotidien.
              </h2>
              <p className="text-base sm:text-lg text-[#595048] leading-relaxed">
                MAMAN+ vous offre un accompagnement intelligent, pour une maternité plus sereine, une meilleure santé et un avenir plus sûr pour vous et votre enfant.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin('login')}
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#E85D86] hover:bg-[#d44d73] text-white font-semibold text-[15px] transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <span>Accéder à votre espace</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToResources}
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-[#FAF7F2] text-[#171717] border border-[#E5DFD5] font-semibold text-[15px] transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-2.5"
                >
                  <span className="w-7 h-7 rounded-full bg-[#FDF0F3] text-[#E85D86] flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 fill-[#E85D86]" />
                  </span>
                  <span>Voir les conseils & vidéos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. FAQ SECTION                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 sm:py-24 bg-[#F8F5EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#E85D86] uppercase">
              — FAQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717]">
              Questions Fréquentes
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#EAE3D9] bg-white overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#171717] text-[15px] cursor-pointer hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#E85D86] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-[#595048] leading-relaxed border-t border-[#F0EAE1] pt-3">
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
      {/* 7. FOOTER EXACTEMENT COMME SUR L'IMAGE 2                          */}
      {/* ------------------------------------------------------------------ */}
      <footer id="contact" className="bg-[#171717] text-[#D8D2C7] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-4">
            {/* Col 1: Logo & Tagline */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <BrandEmblem size={44} />
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center">
                    <span className="font-serif font-bold text-2xl text-white">MAMAN</span>
                    <span className="text-[#E85D86] font-bold text-2xl ml-0.5">+</span>
                  </div>
                  <span className="text-[10px] text-[#A69F96]">Maternité & Santé</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#E85D86]">SUIVI • SOIN • BIEN-ÊTRE</span>
                </div>
              </div>
              <p className="text-xs text-[#A69F96] leading-relaxed">
                Parce que chaque maman mérite le meilleur pour elle et son enfant.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Navigation</div>
              <ul className="space-y-2 text-xs text-[#A69F96]">
                <li><button onClick={() => scrollToSection('accueil')} className="hover:text-white cursor-pointer">Accueil</button></li>
                <li><button onClick={() => scrollToSection('maternite')} className="hover:text-white cursor-pointer">Maternité</button></li>
                <li><button onClick={() => scrollToSection('soins')} className="hover:text-white cursor-pointer">Nos soins</button></li>
                <li><button onClick={() => scrollToSection('specialites')} className="hover:text-white cursor-pointer">Spécialités</button></li>
                <li><button onClick={() => scrollToSection('medecins')} className="hover:text-white cursor-pointer">Médecins</button></li>
                <li><button onClick={onNavigateToResources} className="hover:text-white cursor-pointer">À propos</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white cursor-pointer">Contact</button></li>
              </ul>
            </div>

            {/* Col 3: Liens utiles */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Liens utiles</div>
              <ul className="space-y-2 text-xs text-[#A69F96]">
                <li><button onClick={onNavigateToGuide} className="hover:text-white cursor-pointer">FAQ</button></li>
                <li><button onClick={onNavigateToGuide} className="hover:text-white cursor-pointer">Conditions d'utilisation</button></li>
                <li><button onClick={onNavigateToGuide} className="hover:text-white cursor-pointer">Politique de confidentialité</button></li>
                <li><button onClick={onNavigateToGuide} className="hover:text-white cursor-pointer">Mentions légales</button></li>
              </ul>
            </div>

            {/* Col 4: Contact & Suivez-nous */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs uppercase font-bold tracking-wider text-white">Contact</div>
              <div className="space-y-2 text-xs text-[#A69F96] leading-relaxed">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#E85D86]" /> +237 6XX XX XX XX</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#E85D86]" /> contact@mamanplus.cm</p>
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#E85D86]" /> Yaoundé, Cameroun</p>
              </div>
              <div className="pt-3 space-y-2">
                <div className="text-xs uppercase font-bold tracking-wider text-white">Suivez-nous</div>
                <div className="flex items-center gap-3 text-[#A69F96]">
                  <span className="w-8 h-8 rounded-full bg-[#26221F] flex items-center justify-center hover:text-white cursor-pointer">f</span>
                  <span className="w-8 h-8 rounded-full bg-[#26221F] flex items-center justify-center hover:text-white cursor-pointer">in</span>
                  <span className="w-8 h-8 rounded-full bg-[#26221F] flex items-center justify-center hover:text-white cursor-pointer">𝕏</span>
                  <span className="w-8 h-8 rounded-full bg-[#26221F] flex items-center justify-center hover:text-white cursor-pointer">▶</span>
                </div>
                <div className="pt-2 font-serif text-xs text-[#E85D86] italic">
                  « Ensemble pour une maternité plus sereine » ❤️
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-[#332E2A] text-center text-xs text-[#8A827A]">
            <p>© {new Date().getFullYear()} MAMAN+ Maternité & Santé. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
