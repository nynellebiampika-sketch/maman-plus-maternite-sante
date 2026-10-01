import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  ShieldAlert,
  Globe,
  Heart,
  Navigation,
} from 'lucide-react';
import { HealthFacility } from '../../types';
import { formatDistance, getDirectionsUrl } from '../../services/geolocationService';

interface HealthFacilityCardProps {
  facility: HealthFacility;
  isSelected?: boolean;
  onSelect?: (facility: HealthFacility) => void;
}

export const HealthFacilityCard: React.FC<HealthFacilityCardProps> = ({
  facility,
  isSelected = false,
  onSelect,
}) => {
  const directionsUrl = getDirectionsUrl(facility.name, facility.address, facility.city);

  return (
    <div
      onClick={() => onSelect?.(facility)}
      className={`p-4 sm:p-5 rounded-2xl border transition-all text-left bg-white relative ${
        isSelected
          ? 'border-[#9E2A2B] ring-2 ring-[#9E2A2B]/20 shadow-sm'
          : 'border-[#EAE6DF] hover:border-[#D6D0C5] shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                facility.type === 'Maternité'
                  ? 'bg-[#FEECEC] text-[#9E2A2B]'
                  : facility.type === 'Hôpital'
                  ? 'bg-sky-50 text-sky-800'
                  : facility.type === 'Pharmacie'
                  ? 'bg-emerald-50 text-emerald-800'
                  : facility.type === 'Urgences'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {facility.type}
            </span>

            {facility.distance !== undefined && (
              <span className="text-xs font-semibold text-[#8C5E24] bg-[#FAF5EC] px-2 py-0.5 rounded">
                À env. {formatDistance(facility.distance)}
              </span>
            )}

            {facility.hasMaternity && facility.type !== 'Maternité' && (
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] font-semibold flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                Maternité
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-bold text-[#1E1B18] leading-snug">
            {facility.name}
          </h3>

          {(facility.address || facility.city) && (
            <p className="text-xs text-[#69625A] flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#9C948D] shrink-0" />
              <span>
                {[facility.address, facility.city, facility.region].filter(Boolean).join(', ')}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Horaires si réellement disponibles */}
      {facility.hours && (
        <p className="text-[12px] text-[#554E47] mt-2.5 flex items-center gap-1.5 bg-[#FAF8F5] p-2 rounded-xl border border-[#F0ECE5]">
          <Clock className="w-3.5 h-3.5 text-[#857E77] shrink-0" />
          <span>{facility.hours}</span>
        </p>
      )}

      {/* Notes réelles si disponibles */}
      {facility.notes && (
        <p className="text-[12px] text-[#69625A] mt-2 leading-relaxed">
          {facility.notes}
        </p>
      )}

      {/* Boutons d'action réels (min-h 44px pour touch friendly) */}
      <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-3 border-t border-[#F5F2EC]">
        {facility.phone && (
          <a
            href={`tel:${facility.phone.replace(/\s+/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#E0DBD2] text-[#2C2825] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#69625A]" />
            <span>Appeler : {facility.phone}</span>
          </a>
        )}

        {facility.emergencyPhone && (
          <a
            href={`tel:${facility.emergencyPhone.replace(/\s+/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FEECEC] text-[#9E2A2B] hover:bg-[#FCD8D8] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#9E2A2B]" />
            <span>Urgences</span>
          </a>
        )}

        {facility.website && (
          <a
            href={facility.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="min-h-[44px] min-w-[44px] p-2 rounded-xl border border-[#E0DBD2] text-[#69625A] hover:text-[#1E1B18] hover:bg-[#FAF8F5] flex items-center justify-center transition-colors"
            title="Site web officiel"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#852324] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ml-auto cursor-pointer"
          title="Consulter l'itinéraire"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Itinéraire</span>
        </a>
      </div>
    </div>
  );
};
