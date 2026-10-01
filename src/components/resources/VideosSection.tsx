import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Play,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  Clock,
  UserCheck,
  Youtube,
  ExternalLink,
  ChevronRight,
  Share2,
} from 'lucide-react';
import {
  VideoCreatorType,
  VideoDurationCategory,
  VideoResource,
  VideoSubject,
  VideoTrimester,
} from '../../types';
import {
  REAL_YOUTUBE_VIDEOS,
  VIDEO_CREATOR_TYPES,
  VIDEO_DURATIONS,
  VIDEO_SUBJECTS,
  VIDEO_TRIMESTERS,
  filterVideosByQuery,
  searchLiveYouTubeVideos,
} from '../../data/videosDatabase';
import { YouTubeThumbnail } from './YouTubeThumbnail';
import { useUserData } from '../../contexts/UserDataContext';

export const VideosSection: React.FC = () => {
  const { isVideoSaved, toggleSaveVideo } = useUserData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrimester, setSelectedTrimester] = useState<VideoTrimester>('Tous');
  const [selectedSubject, setSelectedSubject] = useState<VideoSubject | 'Tous'>('Tous');
  const [selectedDuration, setSelectedDuration] = useState<VideoDurationCategory | 'Toutes'>('Toutes');
  const [selectedCreatorType, setSelectedCreatorType] = useState<VideoCreatorType | 'Tous'>('Tous');
  const [activeVideoModal, setActiveVideoModal] = useState<VideoResource | null>(null);

  // Live YouTube search state
  const [isLiveSearching, setIsLiveSearching] = useState<boolean>(false);
  const [liveSearchResults, setLiveSearchResults] = useState<VideoResource[] | null>(null);

  // Filter local curated database
  const filteredVideos = useMemo(() => {
    let list = liveSearchResults || REAL_YOUTUBE_VIDEOS;

    if (selectedTrimester !== 'Tous') {
      list = list.filter((v) => v.trimester === selectedTrimester || v.trimester === 'Tous');
    }

    if (selectedSubject !== 'Tous') {
      list = list.filter((v) => v.subject === selectedSubject);
    }

    if (selectedDuration !== 'Toutes') {
      list = list.filter((v) => v.durationCategory === selectedDuration);
    }

    if (selectedCreatorType !== 'Tous') {
      list = list.filter((v) => v.creatorType === selectedCreatorType);
    }

    if (searchQuery.trim() && !liveSearchResults) {
      list = filterVideosByQuery(list, searchQuery);
    }

    return list;
  }, [
    liveSearchResults,
    selectedTrimester,
    selectedSubject,
    selectedDuration,
    selectedCreatorType,
    searchQuery,
  ]);

  const handleLiveSearchTrigger = async () => {
    if (!searchQuery.trim()) {
      setLiveSearchResults(null);
      return;
    }

    setIsLiveSearching(true);
    try {
      const results = await searchLiveYouTubeVideos(searchQuery);
      setLiveSearchResults(results);
    } finally {
      setIsLiveSearching(false);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setLiveSearchResults(null);
    setSelectedTrimester('Tous');
    setSelectedSubject('Tous');
    setSelectedDuration('Toutes');
    setSelectedCreatorType('Tous');
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLiveSearchTrigger();
              }}
              placeholder="Rechercher une vidéo réelle (ex: péridurale, nausées, alimentation, contractions...)"
              className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLiveSearchResults(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleLiveSearchTrigger}
                disabled={isLiveSearching}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                {isLiveSearching ? 'Recherche...' : 'Filtrer'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Trimestre Filter */}
            <select
              value={selectedTrimester}
              onChange={(e) => setSelectedTrimester(e.target.value as VideoTrimester)}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              {VIDEO_TRIMESTERS.map((t) => (
                <option key={t} value={t}>
                  {t === 'Tous' ? 'Tous trimestres' : t}
                </option>
              ))}
            </select>

            {/* Sujet Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as VideoSubject | 'Tous')}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="Tous">Tous les sujets</option>
              {VIDEO_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Durée Filter */}
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value as VideoDurationCategory | 'Toutes')}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="Toutes">Toutes durées</option>
              {VIDEO_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Type créateur */}
            <select
              value={selectedCreatorType}
              onChange={(e) => setSelectedCreatorType(e.target.value as VideoCreatorType | 'Tous')}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-medium focus:outline-none focus:border-rose-500"
            >
              <option value="Tous">Tous profils</option>
              {VIDEO_CREATOR_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick subject pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedSubject('Tous')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedSubject === 'Tous'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Tous les sujets
          </button>
          {VIDEO_SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === s
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-red-600" />
            {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} vérifiée
            {filteredVideos.length > 1 ? 's' : ''} (chaînes officielles et professionnels de santé)
          </span>

          {(selectedTrimester !== 'Tous' ||
            selectedSubject !== 'Tous' ||
            selectedDuration !== 'Toutes' ||
            selectedCreatorType !== 'Tous' ||
            searchQuery) && (
            <button onClick={handleResetSearch} className="text-rose-600 font-medium hover:underline">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* 2. VIDEO GRID */}
      {isLiveSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between animate-pulse"
            >
              <div className="relative aspect-video bg-slate-200" />
              <div className="p-4 md:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-14 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Youtube className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800">Aucune vidéo ne correspond à vos filtres</h4>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Modifiez vos critères ou lancez une recherche par terme (ex: sommeil, périnée, allaitement).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isSaved = isVideoSaved(video.id);

            return (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-rose-200 transition-all group"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <YouTubeThumbnail
                    videoId={video.youtubeId}
                    initialThumbnailUrl={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => setActiveVideoModal(video)}
                    aria-label={`Lire la vidéo ${video.title}`}
                    className="absolute inset-0 flex items-center justify-center group/btn cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 group-hover/btn:bg-rose-600 transition-transform">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </button>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>

                  {/* Subject Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-semibold">
                    {video.subject}
                  </div>

                  {/* Bookmark quick button */}
                  <button
                    onClick={() => toggleSaveVideo(video.id)}
                    aria-label="Enregistrer la vidéo"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-rose-600 transition-colors"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-rose-300 fill-current" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-rose-600 uppercase tracking-wider">
                        {video.trimester}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                        {video.creatorType}
                      </span>
                    </div>

                    <h4
                      onClick={() => setActiveVideoModal(video)}
                      className="text-sm md:text-base font-bold text-slate-900 line-clamp-2 hover:text-rose-600 cursor-pointer transition-colors leading-snug"
                    >
                      {video.title}
                    </h4>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  {/* Channel & Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{video.channelTitle}</span>
                    </div>

                    <button
                      onClick={() => setActiveVideoModal(video)}
                      className="text-rose-600 font-semibold hover:text-rose-700 text-xs flex items-center gap-1"
                    >
                      Regarder
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. VIDEO MODAL PLAYER */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 pr-6 truncate">
                  <Youtube className="w-5 h-5 text-red-600 shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">
                    {activeVideoModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* YouTube Iframe Player */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Modal Body Info */}
              <div className="p-5 md:p-6 space-y-4 max-h-60 overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{activeVideoModal.channelTitle}</span>
                    <span>•</span>
                    <span className="text-slate-500">{activeVideoModal.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveVideo(activeVideoModal.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isVideoSaved(activeVideoModal.id)
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isVideoSaved(activeVideoModal.id) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 fill-current text-rose-600" />
                          Enregistré
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Enregistrer
                        </>
                      )}
                    </button>

                    <a
                      href={`https://www.youtube.com/watch?v=${activeVideoModal.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ouvrir sur YouTube
                    </a>
                  </div>
                </div>

                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  {activeVideoModal.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
