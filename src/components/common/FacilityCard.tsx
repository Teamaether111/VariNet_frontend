import React from 'react';
import { Droplet, HeartPulse, Shield, Compass, Navigation, Tent, Coffee, Landmark, Car } from 'lucide-react';
import { Facility } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FacilityCardProps {
  facility: Facility;
  onNavigate?: (facility: Facility) => void;
  className?: string;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onNavigate,
  className = '',
}) => {
  const { t } = useLanguage();

  const getFacilityInfo = () => {
    switch (facility.type) {
      case 'WATER':
        return { icon: <Droplet className="w-4 h-4 text-sky-600" />, bg: 'bg-sky-50 border-sky-200 text-sky-900', label: t('facility.waterStation', 'Drinking Water') };
      case 'MEDICAL':
        return { icon: <HeartPulse className="w-4 h-4 text-rose-600" />, bg: 'bg-rose-50 border-rose-200 text-rose-900', label: t('facility.medicalCamp', 'Medical & ICU') };
      case 'POLICE_BOOTH':
        return { icon: <Shield className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50 border-blue-200 text-blue-900', label: t('facility.policeBooth', 'Police & Help') };
      case 'TOILET':
        return { icon: <Compass className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200 text-emerald-900', label: t('facility.sanitation', 'Toilets & Sanitation') };
      case 'TEMPLE':
        return { icon: <Landmark className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50 border-amber-200 text-amber-900', label: t('temple.title', 'Temple / Darshan') };
      case 'PRASAD_CAMP':
        return { icon: <Coffee className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-50 border-orange-200 text-orange-900', label: t('facility.prasadCamp', 'Food / Prasadalaya') };
      case 'SHELTER':
        return { icon: <Tent className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50 border-amber-200 text-amber-900', label: t('facility.shelter', 'Rest Shelter') };
      case 'PARKING':
        return { icon: <Car className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50 border-purple-200 text-purple-900', label: t('facility.parking', 'Parking & Transit') };
      default:
        return { icon: <Compass className="w-4 h-4 text-slate-600" />, bg: 'bg-slate-50 border-slate-200 text-slate-900', label: 'Facility' };
    }
  };

  const info = getFacilityInfo();

  // Format distance
  const formatDistance = (meters?: number) => {
    if (!meters && meters !== 0) return '';
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Capacity color helpers
  const getCapacityColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-orange-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getCapacityStatusBadge = (pct: number, status: string) => {
    if (status === 'MAINTENANCE') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0 whitespace-nowrap">{t('common.maintenance', 'Maintenance')}</span>;
    }
    if (pct >= 90 || status === 'FULL') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 shrink-0 whitespace-nowrap">{t('common.critical', 'Critical / Full')}</span>;
    }
    if (pct >= 75) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 shrink-0 whitespace-nowrap">{t('common.high', 'High Crowd')}</span>;
    }
    if (pct >= 50 || status === 'BUSY') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0 whitespace-nowrap">{t('common.moderate', 'Moderate')}</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0 whitespace-nowrap">{t('common.active', 'Available')}</span>;
  };

  return (
    <div
      id={`facility-card-${facility.id}`}
      className={`bg-white rounded-2xl border border-[#E5E5E5] p-4 sm:p-5 shadow-xs hover:border-[#1A2B47]/30 hover:shadow-sm transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl border ${info.bg} shrink-0`}>
              {info.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {info.label}
                </span>
                {getCapacityStatusBadge(facility.capacityPct, facility.status)}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A2B47] leading-snug mt-0.5">
                {facility.name}
              </h4>
            </div>
          </div>

          {facility.distanceMeters !== undefined && (
            <span className="text-xs font-mono font-bold text-[#F27D26] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 shrink-0 shadow-2xs">
              {formatDistance(facility.distanceMeters)}
            </span>
          )}
        </div>

        {facility.description && (
          <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 font-medium">
            {facility.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] text-xs mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 uppercase font-bold">{t('facility.capacity', 'Capacity')}</span>
          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getCapacityColor(facility.capacityPct)}`}
              style={{ width: `${facility.capacityPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#1A2B47] font-bold">{facility.capacityPct}%</span>
        </div>

        {onNavigate && (
          <button
            id={`btn-nav-facility-${facility.id}`}
            onClick={() => onNavigate(facility)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-[#F27D26] hover:text-white active:scale-95 duration-150 flex items-center gap-1.5 text-xs font-bold text-[#F27D26] transition-all cursor-pointer border border-orange-200 hover:border-[#F27D26] shrink-0 whitespace-nowrap w-fit"
            style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
            title={t('facility.route', 'Get Route')}
          >
            <Navigation className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t('facility.route', 'Get Route')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
