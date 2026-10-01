import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  BookOpen,
  Youtube,
  Trash2,
  ChevronRight,
  Play,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useUserData } from '../../contexts/UserDataContext';
import { ALL_ADVICE_DATABASE } from '../../data/adviceDatabase';
import { REAL_YOUTUBE_VIDEOS } from '../../data/videosDatabase';
import { YouTubeThumbnail } from './YouTubeThumbnail';
import { AdviceItem, VideoResource } from '../../types';

interface SavedResourcesSectionProps {
  onSelectAdvice?: (item: AdviceItem) => void;
  onSelectVideo?: (video: VideoResource) => void;
  onNavigateToAdvice?: () => void;
  onNavigateToVideos?: () => void;
}

export const SavedResourcesSection: React.FC<SavedResourcesSectionProps> = ({
  onSelectAdvice,
  onSelectVideo,
  onNavigateToAdvice,
  onNavigateToVideos,
}) => {
  const { savedAdviceIds, savedVideoIds, toggleSaveAdvice, toggleSaveVideo } = useUserData();
  const [activeTab, setActiveTab] = useState<'advice' | 'videos'>('advice');

  // Look up saved advice items
  const savedAdviceList = useMemo(() => {
    return ALL_ADVICE_DATABASE.filter((item) => savedAdviceIds.includes(item.id));
  }, [savedAdviceIds]);

  // Look up saved video items
  const savedVideoList = useMemo(() => {
    return REAL_YOUTUBE_VIDEOS.filter((video) => savedVideoIds.includes(video.id));
  }, [savedVideoIds]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('advice')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'advice'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Conseils enregistrés ({savedAdviceList.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Youtube className="w-4 h-4" />
          Vidéos favorites ({savedVideoList.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'advice' ? (
        savedAdviceList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-semibold text-slate-800">Aucun conseil enregistré</h4>
            <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto">
              Cliquez sur l\'icône de signet pour enregistrer les conseils qui vous intéressent et les
              consulter hors ligne à tout moment.
            </p>
            {onNavigateToAdvice && (
              <button
                onClick={onNavigateToAdvice}
                className="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
              >
                Explorer la bibliothèque de conseils
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedAdviceList.map((advice) => (
              <motion.div
                key={advice.id}
                layout
                className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {advice.category}
                    </span>
                    <button
                      onClick={() => toggleSaveAdvice(advice.id)}
                      title="Retirer des favoris"
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug font-serif">
                    {advice.title}
                  </h4>

                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                    {advice.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] truncate max-w-[150px]">
                    {advice.source}
                  </span>
                  {onSelectAdvice && (
                    <button
                      onClick={() => onSelectAdvice(advice)}
                      className="font-semibold text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      Lire
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : savedVideoList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Youtube className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-semibold text-slate-800">Aucune vidéo enregistrée</h4>
          <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto">
            Conservez vos vidéos préférées pour préparer l\'accouchement, le sommeil ou l\'allaitement.
          </p>
          {onNavigateToVideos && (
            <button
              onClick={onNavigateToVideos}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
            >
              Explorer les vidéos
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVideoList.map((video) => (
            <motion.div
              key={video.id}
              layout
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <YouTubeThumbnail
                  videoId={video.youtubeId}
                  initialThumbnailUrl={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => onSelectVideo && onSelectVideo(video)}
                  aria-label="Lire la vidéo"
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </div>
                </button>
                <button
                  onClick={() => toggleSaveVideo(video.id)}
                  title="Retirer des favoris"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[10px] font-semibold text-rose-600 uppercase">
                  {video.subject} • {video.duration}
                </span>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {video.title}
                </h4>
                <p className="text-xs text-slate-500 truncate">{video.channelTitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
