import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFBF7]/95 backdrop-blur-md select-none">
      <style>{`
        @keyframes mamanHeartbeat {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.18);
          }
          30% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.12);
          }
          60% {
            transform: scale(1);
          }
        }

        @keyframes mamanSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .maman-loader-heart {
          animation: mamanHeartbeat 1.1s ease-in-out infinite;
        }

        .maman-loader-ring {
          animation: mamanSpin 3s linear infinite;
        }
      `}</style>

      {/* Loader Container */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Outer Rotating Ring (Pale Pink #F8DCE5 and accent #E85D86) */}
        <div className="absolute inset-0 rounded-full border-2 border-[#F8DCE5] border-t-[#E85D86] maman-loader-ring" />

        {/* Soft Glow Background */}
        <div className="absolute w-12 h-12 rounded-full bg-[#E85D86]/15 blur-md" />

        {/* Central Beating Heart */}
        <div className="relative flex items-center justify-center w-12 h-12 maman-loader-heart">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 fill-[#E85D86] drop-shadow-[0_0_12px_rgba(232,93,134,0.4)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      {/* Brand & Loading Text */}
      <div className="mt-6 flex flex-col items-center space-y-1.5">
        <div className="flex items-center">
          <span className="font-serif font-bold text-xl tracking-tight text-[#1E1B18]">
            MAMAN
          </span>
          <span className="text-[#C92535] font-bold text-xl ml-0.5">+</span>
        </div>
        <p className="text-xs font-medium text-[#7A736B] tracking-wide">
          Chargement de votre espace...
        </p>
      </div>
    </div>
  );
};
