import React, { useState, useEffect } from 'react';
import { MamanLoader } from './MamanLoader';

interface SiteOpeningLoaderProps {
  onComplete: () => void;
}

export const SiteOpeningLoader: React.FC<SiteOpeningLoaderProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Complete at 4 seconds (4000ms)
    const timerComplete = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 600); // 600ms fade out transition
    }, 4000);

    return () => {
      clearTimeout(timerComplete);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFDFC] transition-opacity duration-600 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <MamanLoader subtitle="Maternité & Santé — Votre parcours personnalisé" />
    </div>
  );
};
