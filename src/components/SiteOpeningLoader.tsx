import React, { useState, useEffect } from 'react';
import { BrandEmblem } from './BrandLogo';

interface SiteOpeningLoaderProps {
  onComplete: () => void;
}

export const SiteOpeningLoader: React.FC<SiteOpeningLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Phase 1 (0s -> 1s): Logo fade in
    const timer1 = setTimeout(() => {
      setPhase(2);
    }, 1000);

    // Phase 2 (1s -> 2.5s): Text & Slogan fade in
    const timer2 = setTimeout(() => {
      setPhase(3);
    }, 2500);

    // Progress bar animation from 2.5s to 4s (1.5s duration)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // increments over ~1.5s
      });
    }, 30);

    // Complete at 4 seconds (4000ms)
    const timerComplete = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 600); // 600ms fade out transition
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timerComplete);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFDFC] text-[#171717] transition-opacity duration-600 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-md px-6 text-center space-y-6">
        {/* Phase 1: Official Logo */}
        <div
          className={`transition-all duration-1000 transform ${
            phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="relative flex items-center justify-center p-4">
            <div className="absolute w-24 h-24 rounded-full bg-[#E85D86]/10 blur-xl animate-pulse" />
            <div className="flex items-center gap-3 relative z-10 select-none">
              <BrandEmblem size={64} />
              <div className="flex flex-col items-start leading-tight">
                <div className="flex items-center">
                  <span className="font-serif font-bold text-3xl sm:text-4xl text-[#171717] tracking-tight">
                    MAMAN
                  </span>
                  <span className="text-[#E85D86] font-bold text-3xl sm:text-4xl ml-1">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2: Maternité & Santé + Slogan */}
        <div
          className={`transition-all duration-1000 space-y-2 transform ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <h2 className="font-serif text-lg sm:text-xl font-medium text-[#4A443E] tracking-wide">
            Maternité & Santé
          </h2>
          <div className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#E85D86] uppercase pt-1">
            SUIVI • SOIN • BIEN-ÊTRE
          </div>
        </div>

        {/* Phase 3: Elegant Progress Bar */}
        <div
          className={`w-48 sm:w-64 pt-6 transition-all duration-700 transform ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="w-full h-1.5 bg-[#F0EAE1] rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
            <div
              className="h-full bg-gradient-to-r from-[#C92535] to-[#E85D86] rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(232,93,134,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
