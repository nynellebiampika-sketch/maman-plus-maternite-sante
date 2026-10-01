import React, { useState, useEffect, useMemo } from 'react';
import { VideoOff } from 'lucide-react';
import { getThumbnailCandidates } from '../../utils/youtubeThumbnails';

interface YouTubeThumbnailProps {
  videoId?: string;
  initialThumbnailUrl?: string;
  alt: string;
  className?: string;
}

export const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({
  videoId,
  initialThumbnailUrl,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const candidates = useMemo(() => {
    return getThumbnailCandidates(initialThumbnailUrl, videoId);
  }, [initialThumbnailUrl, videoId]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hasAllFailed, setHasAllFailed] = useState<boolean>(false);

  // Reset when source changes
  useEffect(() => {
    setCurrentIndex(0);
    setHasAllFailed(false);
  }, [initialThumbnailUrl, videoId]);

  const handleError = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasAllFailed(true);
    }
  };

  if (hasAllFailed || candidates.length === 0) {
    return (
      <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-4 text-center select-none">
        <VideoOff className="w-8 h-8 text-slate-500 mb-1.5" />
        <span className="text-[11px] font-medium text-slate-400">
          Miniature indisponible
        </span>
      </div>
    );
  }

  return (
    <img
      src={candidates[currentIndex]}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
};
