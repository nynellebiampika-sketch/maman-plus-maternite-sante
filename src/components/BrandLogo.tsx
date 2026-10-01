import React, { useState, useEffect } from 'react';
import mamanLogoUrl from '../assets/images/maman_plus_logo_1788433972254.jpg';
import mamanEmblemUrl from '../assets/images/maman_plus_emblem_1788433996563.jpg';

interface BrandLogoProps {
  variant?: 'full' | 'emblem' | 'compact';
  className?: string;
  imageClassName?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  imageClassName = '',
  showTagline = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [emblemSrc, setEmblemSrc] = useState<string>(mamanEmblemUrl);
  const [logoSrc, setLogoSrc] = useState<string>(mamanLogoUrl);

  useEffect(() => {
    // Subtle initial entrance on mount
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleEmblemError = () => {
    if (emblemSrc !== '/maman_emblem.jpg') {
      setEmblemSrc('/maman_emblem.jpg');
    } else if (emblemSrc !== '/maman_plus_emblem_1788433996563.jpg') {
      setEmblemSrc('/maman_plus_emblem_1788433996563.jpg');
    }
  };

  const handleLogoError = () => {
    if (logoSrc !== '/maman_logo.jpg') {
      setLogoSrc('/maman_logo.jpg');
    } else if (logoSrc !== '/maman_plus_logo_1788433972254.jpg') {
      setLogoSrc('/maman_plus_logo_1788433972254.jpg');
    }
  };

  const entranceClass = `transition-all duration-500 ease-out transform-gpu ${
    mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'
  }`;

  if (variant === 'emblem') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-white border border-[#F2ECE4] shadow-xs shrink-0 ${entranceClass} ${className}`}>
        <img
          src={emblemSrc}
          onError={handleEmblemError}
          alt="MAMAN+ Maternité"
          className={`w-full h-full object-cover object-center ${imageClassName}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${entranceClass} ${className}`}>
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#F0EAE1] shadow-xs shrink-0 p-0.5">
          <img
            src={emblemSrc}
            onError={handleEmblemError}
            alt="MAMAN+"
            className="w-full h-full object-cover rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center">
            <span className="font-serif font-bold text-[17px] text-[#24201D] tracking-tight">
              MAMAN
            </span>
            <span className="text-[#9E2A2B] font-bold text-[17px] ml-0.5">+</span>
          </div>
          <span className="text-[10px] text-[#78716A] font-medium tracking-tight">
            Maternité & Santé
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Logo variant
  return (
    <div className={`flex flex-col items-center ${entranceClass} ${className}`}>
      <div className="relative max-w-full overflow-hidden rounded-2xl bg-white border border-[#EFEBE4] p-2 sm:p-3 shadow-xs">
        <img
          src={logoSrc}
          onError={handleLogoError}
          alt="MAMAN+ Maternité & Santé - Suivi, Soin, Bien-être"
          className={`w-auto max-h-24 sm:max-h-28 object-contain ${imageClassName}`}
          referrerPolicy="no-referrer"
        />
      </div>
      {showTagline && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#8C847D] tracking-widest uppercase font-medium">
          <span className="w-5 h-[1px] bg-[#D8D2C7]" />
          <span>SUIVI • SOIN • BIEN-ÊTRE</span>
          <span className="w-5 h-[1px] bg-[#D8D2C7]" />
        </div>
      )}
    </div>
  );
};

export const BrandEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [src, setSrc] = useState<string>(mamanEmblemUrl);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleError = () => {
    if (src !== '/maman_emblem.jpg') {
      setSrc('/maman_emblem.jpg');
    } else if (src !== '/maman_plus_emblem_1788433996563.jpg') {
      setSrc('/maman_plus_emblem_1788433996563.jpg');
    }
  };

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-xl overflow-hidden bg-white border border-[#F2ECE4] shadow-xs shrink-0 flex items-center justify-center p-0.5 transition-all duration-500 ease-out transform-gpu ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'
      } ${className}`}
    >
      <img
        src={src}
        onError={handleError}
        alt="MAMAN+ Emblème"
        className="w-full h-full object-cover rounded-lg"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
