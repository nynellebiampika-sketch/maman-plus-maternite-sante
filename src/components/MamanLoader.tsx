import React, { useState, useEffect } from 'react';
import { BrandEmblem } from './BrandLogo';

interface MamanLoaderProps {
  subtitle?: string;
}

export const MamanLoader: React.FC<MamanLoaderProps> = ({ subtitle = "Maternité & Santé" }) => {
  const letters = ['M', 'A', 'M', 'A', 'N', '+'];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000; // 4 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFDFC]/98 backdrop-blur-md select-none px-4">
      <style>{`
        @keyframes letterReveal {
          0%, 15%, 100% {
            opacity: 0.2;
            transform: translateY(0) scale(0.96);
            text-shadow: none;
          }
          40%, 60% {
            opacity: 1;
            transform: translateY(-6px) scale(1.08);
            text-shadow: 0 0 20px rgba(232, 93, 134, 0.6), 0 0 40px rgba(158, 42, 43, 0.3);
            color: #9E2A2B;
          }
        }

        @keyframes shimmerBeam {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        .maman-loader-letter {
          display: inline-block;
          animation: letterReveal 2s cubic-bezier(0.6, 0.8, 0.5, 1) infinite;
        }

        .shimmer-line {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(232, 93, 134, 0.25),
            transparent
          );
          animation: shimmerBeam 2.5s infinite linear;
        }

        @media (prefers-reduced-motion: reduce) {
          .maman-loader-letter {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .shimmer-line {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative flex flex-col items-center space-y-6 text-center max-w-sm w-full">
        {/* Glowing aura */}
        <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-[#E85D86]/10 via-[#9E2A2B]/10 to-[#F8DCE5]/20 blur-2xl pointer-events-none animate-pulse" />

        {/* Official Logo Emblem */}
        <div className="animate-bounce duration-1000">
          <BrandEmblem size={64} />
        </div>

        {/* Animated Word */}
        <div className="relative overflow-hidden py-2 px-6 rounded-3xl">
          <div className="shimmer-line pointer-events-none" />
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#171717] flex items-center justify-center gap-1 sm:gap-2">
            {letters.map((char, index) => (
              <span
                key={index}
                className={`maman-loader-letter ${char === '+' ? 'text-[#E85D86] ml-1' : ''}`}
                style={{
                  animationDelay: `${index * 0.18}s`,
                }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Subtitle & Slogan */}
        <div className="space-y-2">
          <p className="font-serif text-sm sm:text-base text-[#595048] tracking-wide font-medium">
            {subtitle}
          </p>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E85D86]">
            SUIVI • SOIN • BIEN-ÊTRE
          </div>
        </div>

        {/* Fine, rounded, transparent, pink progress bar */}
        <div className="w-full max-w-xs space-y-2 pt-4">
          <div className="w-full h-1.5 rounded-full bg-[#F5EFEB] overflow-hidden p-0.5 border border-[#EAE3D9]/60">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#E85D86] to-[#9E2A2B] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#8C847D] font-medium px-1">
            <span>Chargement de votre espace</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
