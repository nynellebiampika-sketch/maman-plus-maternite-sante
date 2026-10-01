import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, RegisterInput } from '../contexts/AuthContext';
import { BrandEmblem } from './BrandLogo';

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

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
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

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

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
      const res = await login(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Adresse e-mail ou mot de passe incorrect.');
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setErrorMessage(err?.message ? `Erreur de connexion : ${err.message}` : 'Erreur inattendue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await register({
        ...registerData,
        email: registerData.email || email,
        password: registerData.password || password,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Impossible de créer votre compte.');
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setErrorMessage(err?.message ? `Erreur : ${err.message}` : 'Erreur lors de la création.');
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
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between text-[#2C2825] font-sans antialiased selection:bg-[#9E2A2B]/15 selection:text-[#9E2A2B]">
      {/* Minimal Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <BrandEmblem size={38} className="group-hover:scale-105 transition-transform" />
          <div className="flex items-center">
            <span className="font-serif font-bold text-lg text-[#1E1B18] tracking-tight">MAMAN</span>
            <span className="text-[#9E2A2B] font-bold text-lg ml-0.5">+</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs sm:text-sm font-medium text-[#6B635B] hover:text-[#1E1B18] px-3 py-1.5 rounded-lg hover:bg-[#EFECE6] transition-all cursor-pointer"
            >
              ← Accueil
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-xl text-[#6B635B] hover:text-[#1E1B18] hover:bg-[#EFECE6] transition-all cursor-pointer"
            title="Besoin d'aide ?"
            aria-label="Besoin d'aide ?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container - Compact & Mobile-First */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md bg-white sm:border sm:border-[#EAE5DC] sm:rounded-3xl sm:shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header titles */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FAF0F0] border border-[#F2D7DE] text-[#9E2A2B] mb-1 shadow-2xs">
              <BrandEmblem size={26} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
              {mode === 'login'
                ? 'Bienvenue sur MAMAN+'
                : mode === 'register'
                ? 'Créer votre compte'
                : 'Mot de passe oublié'}
            </h1>
            <p className="text-xs sm:text-sm text-[#736A61]">
              {mode === 'login'
                ? 'Connectez-vous à votre espace personnel.'
                : mode === 'register'
                ? 'Renseignez vos repères pour commencer.'
                : 'Recevez les instructions de réinitialisation.'}
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#FAD2D2] text-[#9E2A2B] text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#4A433D]" htmlFor="email">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E958C]" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Votre adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-[#1E1B18] text-sm focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#4A433D]" htmlFor="password">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-medium text-[#9E2A2B] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E958C]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-[#1E1B18] text-sm focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Afficher ou masquer le mot de passe"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E958C] hover:text-[#1E1B18] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#4A433D]">Prénom</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre prénom"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-xs focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-[#4A433D]">Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-xs focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#4A433D]">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={registerData.email}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, email: e.target.value });
                    setEmail(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-xs focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#4A433D]">Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    setPassword(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-xs focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#4A433D]">Date de début de grossesse (DDR ou Terme)</label>
                <input
                  type="date"
                  required
                  value={registerData.lastMenstrualPeriodDate}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, lastMenstrualPeriodDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-xs focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white text-[#1E1B18]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <span>Création du carnet...</span>
                ) : (
                  <>
                    <span>Créer mon compte MAMAN+</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="w-full text-center text-xs text-[#6B635B] hover:text-[#1E1B18] pt-1 cursor-pointer"
              >
                Déjà un compte ? Se connecter
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-xs space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#2D6A4F]" />
                  <p className="font-semibold">Instructions envoyées</p>
                  <p>Si un compte est associé à cette adresse, vous recevrez un e-mail de réinitialisation.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotSent(false);
                      setErrorMessage(null);
                    }}
                    className="mt-2 inline-block text-xs font-bold text-[#2D6A4F] underline cursor-pointer"
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    Entrez votre adresse e-mail pour recevoir les instructions de réinitialisation de votre mot de passe.
                  </p>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#4A433D]">Adresse e-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="Votre adresse e-mail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-sm focus:outline-hidden focus:border-[#9E2A2B] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer les instructions'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="w-full text-center text-xs text-[#6B635B] hover:text-[#1E1B18] cursor-pointer"
                  >
                    ← Retour à la connexion
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Switch to Register footer for login mode */}
          {mode === 'login' && (
            <div className="pt-4 border-t border-[#F2ECE4] text-center">
              <span className="text-xs text-[#736A61]">Vous n'avez pas encore de compte ? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-[#9E2A2B] hover:underline cursor-pointer ml-1"
              >
                Créer un compte
              </button>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-[11px] text-center text-[#9E958C] leading-relaxed pt-2">
            Vos informations sont protégées et utilisées uniquement pour votre espace MAMAN+.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-[#8C847D] border-t border-[#EFECE6] bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <span>© {new Date().getFullYear()} MAMAN+</span>
          <span className="hidden sm:inline">•</span>
          <span>Confidentialité</span>
          <span className="hidden sm:inline">•</span>
          <span>Conditions d'utilisation</span>
        </div>
      </footer>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#EAE5DC]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1E1B18]">Besoin d'aide ?</h3>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded-full hover:bg-[#F5F2EB] text-[#736A61]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#6B635B] leading-relaxed">
              Si vous rencontrez des difficultés pour vous connecter à votre carnet MAMAN+, vérifiez que votre adresse e-mail et votre mot de passe sont corrects. Vous pouvez également réinitialiser votre mot de passe en cliquant sur "Mot de passe oublié ?".
            </p>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
