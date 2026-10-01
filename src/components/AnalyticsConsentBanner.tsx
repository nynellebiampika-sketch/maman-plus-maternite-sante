import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import {
  hasAnalyticsId,
  getStoredConsent,
  setAnalyticsConsent,
} from '../services/analytics';

export const AnalyticsConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only display if a real Measurement ID is configured and consent hasn't been set yet
    if (hasAnalyticsId() && getStoredConsent() === null) {
      // Slight delay so it doesn't jump aggressively on initial load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setIsVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Consentement de mesure d'audience"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-40 bg-white/95 backdrop-blur-md border border-[#EAE6DF] rounded-2xl p-4 sm:p-5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#9E2A2B] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="space-y-1.5 flex-1 text-left">
          <h4 className="font-serif text-[14px] font-bold text-[#1E1B18] leading-tight">
            Confidentialité & Mesure d'Audience
          </h4>
          <p className="text-[12px] text-[#69625A] leading-relaxed">
            MAMAN+ utilise des analyses anonymisées pour améliorer l'ergonomie. Vos données médicales,
            symptômes et informations personnelles ne sont <strong>jamais transmises</strong>.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              id="btn-analytics-accept"
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-xl bg-[#9E2A2B] hover:bg-[#852223] text-white text-[12px] font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Accepter
            </button>
            <button
              type="button"
              id="btn-analytics-decline"
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE2] text-[#4A453F] border border-[#E0DBD2] text-[12px] font-medium transition-all cursor-pointer"
            >
              Refuser
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDecline}
          className="p-1 rounded-lg text-[#9C948D] hover:text-[#1E1B18] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          aria-label="Fermer sans accepter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
