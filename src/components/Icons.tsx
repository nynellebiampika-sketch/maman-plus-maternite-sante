import React from 'react';

// MAMAN+ App Logo with stylized mother silhouette
export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-[#FEECEC] border border-[#FBD3D6] p-1.5 ${className}`}>
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="16" cy="7.5" r="3.5" fill="#9E2A2B" />
      <path
        d="M11 15C11 13 13 11.5 16 11.5C19 11.5 21 13 21 15C21 17.5 19.5 20.5 19.5 23C19.5 25.5 17.8 27.5 16 27.5C14.2 27.5 12.5 25.5 12.5 23C12.5 20.5 11 17.5 11 15Z"
        fill="#9E2A2B"
        fillOpacity="0.85"
      />
      <path
        d="M16 17C14.5 17 13.5 18.2 13.5 19.8C13.5 21.8 16 23.5 16 23.5C16 23.5 18.5 21.8 18.5 19.8C18.5 18.2 17.5 17 16 17Z"
        fill="#FFFFFF"
      />
    </svg>
  </div>
);

// Pregnant woman icon for sidebar "Ma Grossesse"
export const PregnantIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="4" r="2.2" />
    <path d="M10 8h3c1.657 0 3 1.343 3 3v2.5a4 4 0 0 1-4 4h-2" />
    <path d="M10 8v12" />
    <path d="M13.5 11.5a3.5 3.5 0 0 1 3.5 3.5v0a3.5 3.5 0 0 1-3.5 3.5" />
  </svg>
);

// Maux de dos icon: Person silhouette with hands on lower back
export const BackPainIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Head */}
    <circle cx="12" cy="3.5" r="2" />
    {/* Torso and arms */}
    <path d="M9 7.5C8.44772 7.5 8 7.94772 8 8.5V13C8 13.5523 8.44772 14 9 14C9.55228 14 10 13.5523 10 13V10H14V13C14 13.5523 14.4477 14 15 14C15.5523 14 16 13.5523 16 13V8.5C16 7.94772 15.5523 7.5 15 7.5H9Z" />
    {/* Body core */}
    <rect x="10.25" y="8" width="3.5" height="7" rx="0.5" />
    {/* Legs */}
    <path d="M10.25 15.5V21.5C10.25 21.7761 10.4739 22 10.75 22H11.5C11.7761 22 12 21.7761 12 21.5V16.5H12V21.5C12 21.7761 12.2239 22 12.5 22H13.25C13.5261 22 13.75 21.7761 13.75 21.5V15.5H10.25Z" />
  </svg>
);

// Nausea Face Icon with green accents and wavy mouth
export const NauseaIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    {/* Closed dizzy eyes */}
    <path d="M8.5 9L9.5 10L10.5 9" />
    <path d="M13.5 9L14.5 10L15.5 9" />
    {/* Wavy mouth */}
    <path d="M8.5 15.5C9.5 14.5 10.5 14.5 11.5 15.5C12.5 16.5 13.5 16.5 15.5 15" />
    {/* Bubble / dizzy cheek drops */}
    <circle cx="7" cy="8" r="0.8" fill="currentColor" />
    <circle cx="17" cy="8" r="0.8" fill="currentColor" />
  </svg>
);

// Heavy legs icon: Seated leg/foot silhouette
export const HeavyLegsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Thigh to knee, calf down to ankle and foot */}
    <path d="M6 7H11C12.6569 7 14 8.34315 14 10V16C14 17.6569 15.3431 19 17 19H19" />
    {/* Parallel second leg */}
    <path d="M3 11H7C8.6569 11 10 12.3431 10 14V19C10 20.1046 10.8954 21 12 21H14" opacity="0.6" />
  </svg>
);

