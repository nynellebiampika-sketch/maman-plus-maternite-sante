import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Filter,
  MapPin,
  Crosshair,
  RefreshCw,
  AlertCircle,
  Phone,
  Navigation,
} from 'lucide-react';
import { HealthFacility, HealthFacilityType } from '../../types';
import { REAL_HEALTH_FACILITIES } from '../../data/healthFacilitiesDatabase';
import { HealthFacilityCard } from './HealthFacilityCard';
import {
  Coordinates,
  calculateDistanceKm,
  requestUserLocation,
} from '../../services/geolocationService';

const AVAILABLE_TYPES: ('Tous' | HealthFacilityType)[] = [
  'Tous',
  'Maternité',
  'Hôpital',
  'Clinique',
  'Centre de santé',
  'Urgences',
];

const QUICK_CITIES = [
  'Tous',
  'Paris',
  'Lyon',
  'Marseille',
  'Bordeaux',
  'Toulouse',
  'Nantes',
  'Lille',
  'Strasbourg',
  'Nice',
];

export const HealthFacilitiesSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'Tous' | HealthFacilityType>('Tous');
  const [selectedCity, setSelectedCity] = useState<string>('Tous');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleRequestLocation = async () => {
    setIsLocating(true);
    setGeoError(null);
    const res = await requestUserLocation();
    setIsLocating(false);
    if (res.status === 'granted' && res.coords) {
      setUserLocation(res.coords);
    } else if (res.error) {
      setGeoError(res.error);
    }
  };

  // Filter facilities based on real verified database
  const filteredFacilities = useMemo(() => {
    let list: HealthFacility[] = REAL_HEALTH_FACILITIES;

    // Filter by type
    if (selectedType !== 'Tous') {
      list = list.filter((fac) => fac.type === selectedType);
    }

    // Filter by city
    if (selectedCity !== 'Tous') {
      list = list.filter(
        (fac) =>
          fac.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
          (fac.region && fac.region.toLowerCase().includes(selectedCity.toLowerCase()))
      );
    }

    // Filter by text search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (fac) =>
          fac.name.toLowerCase().includes(q) ||
          fac.city.toLowerCase().includes(q) ||
          (fac.address && fac.address.toLowerCase().includes(q)) ||
          (fac.region && fac.region.toLowerCase().includes(q)) ||
          (fac.notes && fac.notes.toLowerCase().includes(q))
      );
    }

    // Calculate real distance if user provided location
    if (userLocation) {
      list = list.map((fac) => ({
        ...fac,
        distance: calculateDistanceKm(userLocation.lat, userLocation.lng, fac.lat, fac.lng),
      }));
      list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }

    return list;
  }, [searchQuery, selectedType, selectedCity, userLocation]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EC] border border-[#EEDDC6] text-[#8C5E24] text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider shadow-2xs mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#8C5E24]" />
              <span>Annuaire Médical & Maternités</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18] tracking-tight">
              Trouver un établissement de santé
            </h2>
            <p className="text-[13.5px] text-[#69625A] mt-1">
              Recherchez un centre hospitalier, une maternité ou une clinique de référence.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRequestLocation}
            disabled={isLocating}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#E0DBD2] text-[#2C2825] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs disabled:opacity-60"
          >
            <Crosshair className={`w-4 h-4 text-[#9E2A2B] ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Localisation en cours...' : 'Autour de moi'}</span>
          </button>
        </div>

        {geoError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Search input (Touch friendly min-h 44px) */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C948D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom d'établissement, ville ou quartier (ex: Port-Royal, Paris, Lyon...)"
            className="w-full min-h-[46px] pl-11 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E0DBD2] rounded-xl text-[#1E1B18] placeholder-[#9E968F] text-[13.5px] focus:bg-white focus:outline-none focus:border-[#9E2A2B] transition-all"
          />
        </div>

        {/* Quick city filter tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-[#8C847D] font-medium mr-1">Villes :</span>
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-[#1E1B18] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#554E47] border border-[#EFECE6]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-[#F5F2EC]">
          {AVAILABLE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-[#9E2A2B] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#554E47] border border-[#EFECE6]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities List or Empty State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#8C847D] px-1">
          <span>
            {filteredFacilities.length} établissement(s) disponible(s)
          </span>
          {userLocation && (
            <span className="text-[#9E2A2B] font-bold">Triés par proximité</span>
          )}
        </div>

        {filteredFacilities.length === 0 ? (
          /* Elegant empty state as specifically requested */
          <div className="bg-white rounded-3xl border border-[#EAE6DF] p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#EFECE6] text-[#8C847D] flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7 text-[#9C948D]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-[#1E1B18]">
                Aucun établissement disponible pour le moment.
              </h3>
              <p className="text-xs sm:text-sm text-[#69625A] leading-relaxed">
                Aucun établissement ne correspond à vos critères de recherche. Essayez de réinitialiser vos filtres ou de chercher une autre ville.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('Tous');
                setSelectedCity('Tous');
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1E1B18] text-white text-xs font-semibold hover:bg-[#332E2A] transition-all cursor-pointer shadow-2xs"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFacilities.map((facility) => (
              <HealthFacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </div>

      {/* Medical Emergency Notice */}
      <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 sm:p-5 text-xs text-[#69625A] leading-relaxed space-y-1.5">
        <p className="font-bold text-[#1E1B18] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-[#9E2A2B]" />
          <span>Informations et urgences médicales</span>
        </p>
        <p>
          En cas d'urgence obstétricale (saignements anormaux, douleurs intenses, fièvre, diminution des mouvements de bébé, perte des eaux), contactez sans attendre votre maternité ou composez le <strong>15 (SAMU)</strong> ou le <strong>112 (Numéro européen)</strong>.
        </p>
      </div>
    </div>
  );
};

// Backward compatibility alias for any existing imports
export const HealthFacilitiesMapSection = HealthFacilitiesSection;
