import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Check,
  AlertCircle,
  Heart,
  BookOpen,
  Calendar,
  Bell,
  ShieldCheck,
  UserPlus,
  HeartHandshake,
  HelpCircle,
  Globe,
  ChevronDown,
  X,
  Phone,
} from 'lucide-react';
import { useAuth, RegisterInput } from '../contexts/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
  onNavigateHome?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateHome,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dueDate: '',
    lastMenstrualPeriodDate: '',
    heightCm: 165,
    prePregnancyWeightKg: 60,
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // UI modals & dropdowns
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('Français');

  // UI status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsPageLoaded(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Demander la permission native sur le clic direct utilisateur si encore par défaut
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch {}
    }

    try {
      const res = await login(loginEmail, loginPassword, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Adresse e-mail ou mot de passe incorrect.');
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message
          ? `Erreur de connexion : ${err.message}`
          : 'Erreur inattendue lors de la connexion.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Demander la permission native sur le clic direct utilisateur si encore par défaut
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch {}
    }

    try {
      const res = await register(registerData);
      if (!res.success) {
        setErrorMessage(res.error || 'Impossible de créer votre compte.');
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message
          ? `Erreur d'inscription : ${err.message}`
          : 'Erreur inattendue lors de la création du compte.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!forgotEmail) {
      setErrorMessage('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col justify-between text-[#2C2825] selection:bg-[#C43859]/15 selection:text-[#C43859]">
      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between">
        {/* Left: Brand Logo with Home navigation */}
        <div
          onClick={onNavigateHome}
          className={`flex items-center gap-3 select-none ${
            onNavigateHome ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
          }`}
          title={onNavigateHome ? "Retourner à l'accueil MAMAN+" : undefined}
        >
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-[#F2D7DE] bg-white shadow-xs shrink-0">
            <img
              src="/maman_emblem.jpg"
              alt="Logo MAMAN+"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to illustration if emblem path differs
                (e.target as HTMLImageElement).src = '/pregnant_mother_illustration.jpg';
              }}
            />
            {/* Small red plus emblem badge in corner */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#C43859] rounded-full flex items-center justify-center text-white text-[11px] font-black leading-none shadow-xs">
              +
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center">
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#1E1B18] tracking-tight">
                MAMAN
              </span>
              <span className="text-[#C43859] font-bold text-xl sm:text-2xl ml-0.5">+</span>
            </div>
            <span className="text-[12px] sm:text-[13px] font-medium text-[#1E1B18] tracking-tight -mt-0.5">
              Maternité & Santé
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[#8A827A] tracking-[0.16em] uppercase mt-0.5">
              — SUIVI • SOIN • BIEN-ÊTRE —
            </span>
          </div>
        </div>

        {/* Right: Help, Back to Landing & Language Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E5DFD5] bg-white hover:bg-[#FAF8F5] text-[#2C2825] text-[12.5px] sm:text-[13px] font-medium shadow-2xs transition-all cursor-pointer"
            >
              <span>← Accueil</span>
            </button>
          )}

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border border-[#E5DFD5] bg-white hover:bg-[#FAF8F5] text-[#2C2825] text-[12.5px] sm:text-[13px] font-medium shadow-2xs transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#78716A]" />
            <span>Besoin d'aide ?</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border border-[#E5DFD5] bg-white hover:bg-[#FAF8F5] text-[#2C2825] text-[12.5px] sm:text-[13px] font-medium shadow-2xs transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#78716A]" />
              <span>{currentLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#78716A]" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#EFE8DF] rounded-2xl shadow-lg py-1.5 z-50 text-[13px]">
                {['Français', 'English', 'Español', 'Lingála'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setCurrentLang(lang);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-[#FAF7F5] transition-colors flex items-center justify-between ${
                      currentLang === lang ? 'text-[#C43859] font-semibold' : 'text-[#2C2825]'
                    }`}
                  >
                    <span>{lang}</span>
                    {currentLang === lang && <Check className="w-3.5 h-3.5 text-[#C43859]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* LEFT COLUMN: Presentation & Visual Banner */}
        <div
          className={`lg:col-span-6 space-y-7 transition-all duration-500 ease-out ${
            isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Main Titles */}
          <div className="space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#1E1B18] leading-[1.14] tracking-tight">
              Votre maternité,
              <br />
              accompagnée
              <br />
              <span className="text-[#C43859]">à chaque étape</span>
            </h1>

            <p className="text-[14.5px] sm:text-[15.5px] text-[#69625A] leading-relaxed max-w-lg">
              MAMAN+ vous aide à suivre votre grossesse, prendre soin de votre santé et préparer sereinement l'arrivée de bébé.
            </p>
          </div>

          {/* Center Illustration of Pregnant Mother */}
          <div className="relative max-w-[380px] sm:max-w-[420px] mx-auto lg:mx-0">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(196,56,89,0.08)] border border-[#FADCE2]/60 bg-gradient-to-b from-[#FDF5F6] via-[#FAF7F5] to-white">
              <img
                src="/pregnant_mother_illustration.jpg"
                alt="Maternité épanouie MAMAN+"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/maman_emblem.jpg';
                }}
              />
            </div>
          </div>

          {/* Bottom Card: "Tout ce dont vous avez besoin" */}
          <div className="bg-white/90 border border-[#EFE8DF] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-lg">
            <h3 className="font-bold text-[15px] text-[#1E1B18] text-center mb-5">
              Tout ce dont vous avez besoin
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Feature 1: Suivi personnalisé */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FDF2F4] border border-[#FADCE2] flex items-center justify-center shrink-0 text-[#C43859]">
                  <Heart className="w-4 h-4 fill-[#C43859]/15" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-[#1E1B18]">Suivi personnalisé</h4>
                  <p className="text-[11.5px] text-[#69625A] leading-snug mt-0.5">
                    Suivez votre grossesse jour après jour.
                  </p>
                </div>
              </div>

              {/* Feature 2: Conseils & contenus */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FDF2F4] border border-[#FADCE2] flex items-center justify-center shrink-0 text-[#C43859]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-[#1E1B18]">Conseils & contenus</h4>
                  <p className="text-[11.5px] text-[#69625A] leading-snug mt-0.5">
                    Des conseils fiables et des contenus adaptés.
                  </p>
                </div>
              </div>

              {/* Feature 3: Rendez-vous */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FDF2F4] border border-[#FADCE2] flex items-center justify-center shrink-0 text-[#C43859]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-[#1E1B18]">Rendez-vous</h4>
                  <p className="text-[11.5px] text-[#69625A] leading-snug mt-0.5">
                    Gérez vos rendez-vous médicaux facilement.
                  </p>
                </div>
              </div>

              {/* Feature 4: Rappels intelligents */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FDF2F4] border border-[#FADCE2] flex items-center justify-center shrink-0 text-[#C43859]">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-[#1E1B18]">Rappels intelligents</h4>
                  <p className="text-[11.5px] text-[#69625A] leading-snug mt-0.5">
                    Ne manquez aucun moment important.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentic Login Card matching screenshot */}
        <div
          className={`lg:col-span-6 flex flex-col items-center lg:items-end transition-all duration-500 delay-100 ease-out ${
            isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Main White Card with rounded corners and subtle shadow */}
          <div className="w-full max-w-[460px] bg-white rounded-[32px] border border-[#EFE8DF] shadow-[0_12px_45px_rgba(0,0,0,0.06)] p-7 sm:p-9">
            {/* Top Pink Padlock Emblem */}
            <div className="w-16 h-16 rounded-full bg-[#FDF2F4] border border-[#FADCE2] flex items-center justify-center mx-auto mb-3.5 shadow-2xs relative">
              <div className="relative">
                <Lock className="w-6 h-6 text-[#C43859] stroke-[2.2]" />
                <Heart className="w-2.5 h-2.5 text-[#C43859] fill-[#C43859] absolute -top-1 -right-1" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="font-serif text-2xl sm:text-[28px] font-bold text-[#1E1B18] text-center tracking-tight">
              {mode === 'login' && 'Connexion'}
              {mode === 'register' && 'Créer un compte'}
              {mode === 'forgot' && 'Mot de passe oublié'}
            </h2>

            <p className="text-[13.5px] text-[#69625A] text-center mt-1">
              {mode === 'login' && 'Accédez à votre espace personnel'}
              {mode === 'register' && 'Rejoignez MAMAN+ et démarrez votre suivi'}
              {mode === 'forgot' && 'Recevez un lien de réinitialisation sécurisé'}
            </p>

            {/* Small pink horizontal bar accent */}
            <div className="w-12 h-1 bg-[#C43859] rounded-full mx-auto mt-2.5 mb-6 opacity-85" />

            {/* Error Message Banner */}
            {errorMessage && (
              <div
                id="auth-error-banner"
                className="mb-5 p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#FAD7D7] flex items-start gap-2.5 text-[#C43859] text-[13px] animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C43859]" />
                <span className="font-medium leading-snug break-words">{errorMessage}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[13px] font-medium text-[#2C2825] mb-1.5"
                  >
                    Adresse e-mail
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-[#9E968F]" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Entrez votre adresse e-mail"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#FAF8F6] border border-[#E5DFD5] rounded-2xl text-[13.5px] text-[#2C2825] placeholder-[#9E968F] focus:outline-none focus:border-[#C43859] focus:bg-white focus:ring-2 focus:ring-[#C43859]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[13px] font-medium text-[#2C2825] mb-1.5"
                  >
                    Mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#9E968F]" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                      className="w-full pl-10 pr-10 py-3 bg-[#FAF8F6] border border-[#E5DFD5] rounded-2xl text-[13.5px] text-[#2C2825] placeholder-[#9E968F] focus:outline-none focus:border-[#C43859] focus:bg-white focus:ring-2 focus:ring-[#C43859]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1 text-[#9E968F] hover:text-[#5E5750] focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="remember-me-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#D6D0C5] text-[#C43859] accent-[#C43859] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[13px] text-[#554E47]">Se souvenir de moi</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setMode('forgot');
                    }}
                    className="text-[13px] font-medium text-[#C43859] hover:text-[#A02844] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Large Crimson Submit Button */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#C43859] hover:bg-[#B32D4C] text-white font-medium text-[15px] shadow-[0_4px_16px_rgba(196,56,89,0.3)] hover:shadow-[0_6px_22px_rgba(196,56,89,0.38)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Centered Heart Line Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="w-full border-t border-[#EFE8DF]" />
                  <div className="absolute px-3 bg-white text-[#C43859]">
                    <Heart className="w-4 h-4 fill-none stroke-[2]" />
                  </div>
                </div>

                {/* Security Reassurance Callout Box */}
                <div className="rounded-2xl bg-[#FDF5F6] border border-[#F8E1E5] p-4 flex items-center gap-3.5 text-left">
                  <div className="w-11 h-11 rounded-full bg-[#C43859] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13.5px] text-[#1E1B18]">
                      Vos données sont protégées
                    </h4>
                    <p className="text-[12px] text-[#69625A] leading-relaxed mt-0.5">
                      Nous utilisons un cryptage avancé pour garantir la sécurité et la confidentialité de vos informations.
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* 2. REGISTRATION FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, firstName: e.target.value })
                      }
                      placeholder="Votre prénom"
                      className="w-full px-3 py-2 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#C43859]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.lastName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, lastName: e.target.value })
                      }
                      placeholder="Votre nom"
                      className="w-full px-3 py-2 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#C43859]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
                    Adresse e-mail *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-[#9E968F]" />
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                      placeholder="Entrez votre adresse e-mail"
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#C43859]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-medium text-[#2C2825] mb-1">
                    Mot de passe * (min. 6 caractères)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-[#9E968F]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      placeholder="Créez un mot de passe"
                      className="w-full pl-9 pr-9 py-2 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[13px] text-[#2C2825] focus:outline-none focus:border-[#C43859]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-[#9E968F]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Optional pregnancy config */}
                <div className="pt-2 border-t border-[#F0ECE5]">
                  <div className="flex items-center gap-1.5 mb-2 text-[#C43859] text-[11.5px] font-semibold uppercase tracking-wider">
                    <Heart className="w-3 h-3 fill-[#C43859]/20" />
                    <span>Suivi de grossesse (Optionnel)</span>
                  </div>

                  <div className="space-y-2 text-[12px]">
                    <div>
                      <label className="block text-[#554E47] mb-1">
                        Date des dernières règles (DDR) ou Terme
                      </label>
                      <input
                        type="date"
                        value={registerData.lastMenstrualPeriodDate}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            lastMenstrualPeriodDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[#554E47] mb-1">Taille (cm)</label>
                        <input
                          type="number"
                          placeholder="165"
                          value={registerData.heightCm || ''}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              heightCm: Number(e.target.value) || undefined,
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[#554E47] mb-1">Poids initial (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="60.0"
                          value={registerData.prePregnancyWeightKg || ''}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              prePregnancyWeightKg: Number(e.target.value) || undefined,
                            })
                          }
                          className="w-full px-3 py-1.5 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[12.5px] text-[#2C2825] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={isSubmitting}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#C43859] hover:bg-[#B32D4C] text-white font-medium text-[14px] shadow-[0_4px_14px_rgba(196,56,89,0.3)] transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-3 text-center">
                  <p className="text-[13px] text-[#69625A]">
                    Vous avez déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setMode('login');
                      }}
                      className="font-semibold text-[#C43859] hover:underline ml-1 cursor-pointer"
                    >
                      Se connecter
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 3. FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                {forgotSent ? (
                  <div className="p-4 rounded-2xl bg-[#EBF8EE] border border-[#C5E3CE] text-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-[#1E7441] text-white flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-[14px] text-[#1E7441]">Instructions envoyées</h3>
                    <p className="text-[12.5px] text-[#2C6E49]">
                      Si un compte correspond à <strong>{forgotEmail}</strong>, vous recevrez un lien de réinitialisation.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        setMode('login');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#1E7441] text-white text-[12.5px] font-medium cursor-pointer"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="block text-[13px] font-medium text-[#2C2825] mb-1.5"
                      >
                        Adresse e-mail du compte
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 w-4 h-4 text-[#9E968F]" />
                        <input
                          id="forgot-email"
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Entrez votre adresse e-mail"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F6] border border-[#E5DFD5] rounded-xl text-[13.5px] text-[#2C2825] focus:outline-none focus:border-[#C43859]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#C43859] hover:bg-[#B32D4C] text-white font-medium text-[14px] shadow-sm transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Envoyer le lien de réinitialisation</span>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[13px] font-medium text-[#7A736B] hover:text-[#2C2825] cursor-pointer"
                      >
                        Annuler et revenir à la connexion
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Under-Card Action: Switch to Register if in login mode */}
          {mode === 'login' && (
            <div className="w-full max-w-[460px] text-center mt-5">
              <p className="text-[14px] text-[#69625A] mb-3">
                Vous n'avez pas encore de compte ?
              </p>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setMode('register');
                }}
                className="w-full py-3 px-6 rounded-2xl border border-[#C43859] bg-white hover:bg-[#FDF5F6] text-[#C43859] font-medium text-[14.5px] flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer un compte</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Reassurance Ribbon matching screenshot */}
      <section className="w-full bg-[#FDF2F4] border-t border-[#F8DFE4] py-6 px-4 sm:px-8 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Item 1: 100% Sécurisé */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FADCE2]/70 border border-[#F5CED6] text-[#C43859] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-[13.5px] text-[#1E1B18]">100% Sécurisé</h4>
              <p className="text-[12px] text-[#69625A]">Vos données sont protégées et confidentielles.</p>
            </div>
          </div>

          {/* Item 2: Confidentialité garantie */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FADCE2]/70 border border-[#F5CED6] text-[#C43859] flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-[13.5px] text-[#1E1B18]">Confidentialité garantie</h4>
              <p className="text-[12px] text-[#69625A]">Nous respectons votre vie privée.</p>
            </div>
          </div>

          {/* Item 3: Pour vous et bébé */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FADCE2]/70 border border-[#F5CED6] text-[#C43859] flex items-center justify-center shrink-0 shadow-2xs">
              <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-[13.5px] text-[#1E1B18]">Pour vous et bébé</h4>
              <p className="text-[12px] text-[#69625A]">Parce que chaque étape compte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-[12px] text-[#78716A] bg-[#FAF7F5]">
        © 2026 MAMAN+ – Tous droits réservés <span className="text-[#C43859]">💗</span>
      </footer>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#EFE8DF] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FDF2F4] text-[#C43859] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Besoin d'aide ?</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-full text-[#78716A] hover:bg-[#FAF7F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[13px] text-[#69625A] leading-relaxed">
              MAMAN+ est à votre écoute pour vous accompagner durant toute votre grossesse.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-[#FAF8F6] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#C43859]" />
                  <div>
                    <p className="font-bold text-[13px] text-[#1E1B18]">Urgences Médicales</p>
                    <p className="text-[11.5px] text-[#69625A]">Disponible 24h/24 & 7j/7</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#C43859] px-3 py-1 rounded-full bg-white border border-[#FADCE2]">
                  15 / 112
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F6] border border-[#E5DFD5] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#C43859]" />
                  <div>
                    <p className="font-bold text-[13px] text-[#1E1B18]">Support MAMAN+</p>
                    <p className="text-[11.5px] text-[#69625A]">Assistance compte et données</p>
                  </div>
                </div>
                <span className="text-[12px] font-medium text-[#1E1B18]">contact@mamanplus.app</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#C43859] text-white text-[13.5px] font-medium cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

