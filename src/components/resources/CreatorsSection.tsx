import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Youtube,
  Instagram,
  UserCheck,
  Stethoscope,
  Video,
} from 'lucide-react';
import { REAL_CREATORS_DATABASE } from '../../data/creatorsDatabase';
import { HealthProfessionalCreator } from '../../types';

interface CreatorAvatarProps {
  name: string;
  avatarUrl: string;
}

const CreatorAvatar: React.FC<CreatorAvatarProps> = ({ name, avatarUrl }) => {
  const [imageError, setImageError] = useState(false);

  // Derive readable initials for the healthcare professional or institution
  const initials = useMemo(() => {
    return name
      .replace(/^(Dr|Docteur|Les|La)\s+/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }, [name]);

  if (imageError || !avatarUrl) {
    return (
      <div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 border-2 border-rose-200/80 shadow-sm shrink-0 flex flex-col items-center justify-center text-rose-700 font-bold select-none"
        title={name}
      >
        <span className="text-base tracking-tight font-serif">{initials || 'M+'}</span>
        <Stethoscope className="w-3 h-3 text-rose-400 mt-0.5" />
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      onError={() => setImageError(true)}
      referrerPolicy="no-referrer"
      loading="lazy"
      className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-100 shadow-sm shrink-0 bg-slate-100"
    />
  );
};

export const CreatorsSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Toutes');

  const filteredCreators = useMemo(() => {
    let list = REAL_CREATORS_DATABASE;

    if (selectedPlatform !== 'Toutes') {
      list = list.filter((c) => c.platforms.includes(selectedPlatform as any));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.specialty.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.contentType.toLowerCase().includes(q)
      );
    }

    return list;
  }, [searchQuery, selectedPlatform]);

  return (
    <div className="space-y-6">
      {/* 1. SEARCH & PLATFORM FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un professionnel ou une institution (ex: Anna Roy, Dr Bagot, sage-femme...)"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['Toutes', 'YouTube', 'Instagram', 'TikTok'].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPlatform === platform
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {platform === 'Toutes' ? 'Toutes plateformes' : platform}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            {filteredCreators.length} professionnel(s) et chaînes vérifiés
          </span>
          <span className="text-slate-400">Liens directs sécurisés</span>
        </div>
      </div>

      {/* 2. CREATORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCreators.map((creator) => (
          <motion.div
            key={creator.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              {/* Creator Top Profile */}
              <div className="flex items-start gap-4">
                <CreatorAvatar name={creator.name} avatarUrl={creator.avatarUrl} />

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {creator.name}
                    </h4>
                    {creator.verified && (
                      <span
                        title="Profil vérifié MAMAN+"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white" />
                        Vérifié
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-rose-600">
                    {creator.specialty}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {creator.bio}
              </p>

              {/* Content Type tag box */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Thématiques abordées :
                </span>
                <p className="leading-snug text-slate-600">{creator.contentType}</p>
              </div>
            </div>

            {/* Social Platform Links (Safe external links) */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Plateformes officielles :</span>

              <div className="flex items-center gap-2">
                {creator.platformLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    {link.platform === 'YouTube' && <Youtube className="w-3.5 h-3.5 text-red-600" />}
                    {link.platform === 'Instagram' && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                    {link.platform === 'TikTok' && <Video className="w-3.5 h-3.5 text-slate-900" />}
                    <span>{link.platform}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
