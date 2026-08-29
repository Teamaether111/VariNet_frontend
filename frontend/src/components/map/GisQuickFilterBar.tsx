import React from 'react';
import { 
  Droplet, 
  HeartPulse, 
  Shield, 
  UtensilsCrossed, 
  Sparkles, 
  Footprints,
  Check
} from 'lucide-react';
import { MapLayerState } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface GisQuickFilterBarProps {
  layers: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState) => void;
  className?: string;
}

interface FilterItemConfig {
  key: keyof MapLayerState;
  labelKey: string;
  defaultLabel: string;
  symbol: string;
  icon: React.ReactNode;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  activeRing: string;
  activeBadge: string;
  iconColor: string;
}

export const GisQuickFilterBar: React.FC<GisQuickFilterBarProps> = ({
  layers,
  onToggleLayer,
  className = '',
}) => {
  const { t } = useLanguage();

  const filterConfigs: FilterItemConfig[] = [
    {
      key: 'waterPoints',
      labelKey: 'map.quickFilter.water',
      defaultLabel: 'Water Points',
      symbol: '💧',
      icon: <Droplet className="w-4 h-4" />,
      activeBg: 'bg-sky-50',
      activeBorder: 'border-sky-400',
      activeText: 'text-sky-950',
      activeRing: 'ring-2 ring-sky-400/40 shadow-xs',
      activeBadge: 'bg-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
    },
    {
      key: 'medicalCamps',
      labelKey: 'map.quickFilter.medical',
      defaultLabel: 'Medical Posts',
      symbol: '➕',
      icon: <HeartPulse className="w-4 h-4" />,
      activeBg: 'bg-rose-50',
      activeBorder: 'border-rose-400',
      activeText: 'text-rose-950',
      activeRing: 'ring-2 ring-rose-400/40 shadow-xs',
      activeBadge: 'bg-rose-200 text-rose-900',
      iconColor: 'text-rose-600',
    },
    {
      key: 'policeBooths',
      labelKey: 'map.quickFilter.police',
      defaultLabel: 'Police Posts',
      symbol: '🛡️',
      icon: <Shield className="w-4 h-4" />,
      activeBg: 'bg-blue-50',
      activeBorder: 'border-blue-400',
      activeText: 'text-blue-950',
      activeRing: 'ring-2 ring-blue-400/40 shadow-xs',
      activeBadge: 'bg-blue-200 text-blue-900',
      iconColor: 'text-blue-600',
    },
    {
      key: 'shelters',
      labelKey: 'map.quickFilter.food',
      defaultLabel: 'Food Camps',
      symbol: '🍽️',
      icon: <UtensilsCrossed className="w-4 h-4" />,
      activeBg: 'bg-amber-50',
      activeBorder: 'border-amber-400',
      activeText: 'text-amber-950',
      activeRing: 'ring-2 ring-amber-400/40 shadow-xs',
      activeBadge: 'bg-amber-200 text-amber-950',
      iconColor: 'text-amber-600',
    },
    {
      key: 'safeRoutes',
      labelKey: 'map.quickFilter.safeCorridor',
      defaultLabel: 'AI Safe Corridor',
      symbol: '✨',
      icon: <Sparkles className="w-4 h-4" />,
      activeBg: 'bg-emerald-50',
      activeBorder: 'border-emerald-500',
      activeText: 'text-emerald-950',
      activeRing: 'ring-2 ring-emerald-500/40 shadow-xs',
      activeBadge: 'bg-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
    },
    {
      key: 'routes',
      labelKey: 'map.quickFilter.walkingRoutes',
      defaultLabel: 'Walking Spine Routes',
      symbol: '🚶',
      icon: <Footprints className="w-4 h-4" />,
      activeBg: 'bg-purple-50',
      activeBorder: 'border-purple-400',
      activeText: 'text-purple-950',
      activeRing: 'ring-2 ring-purple-400/40 shadow-xs',
      activeBadge: 'bg-purple-200 text-purple-900',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div 
      id="gis-quick-filter-bar" 
      className={`w-full bg-white rounded-2xl border border-[#EAE6E1] p-3 shadow-2xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1A2B47]">
          <span>{t('map.quickFilter.title', 'GIS Quick-Filter')}</span>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          Tap to toggle map layers & markers
        </span>
      </div>

      {/* Horizontal Scrollable Filter Button Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterConfigs.map((cfg) => {
          const isActive = Boolean(layers[cfg.key]);

          return (
            <button
              key={cfg.key}
              id={`quick-filter-${cfg.key}`}
              type="button"
              onClick={() => onToggleLayer(cfg.key)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-2 shrink-0 transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-150 ${
                isActive
                  ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText} ${cfg.activeRing}`
                  : 'bg-[#F9F8F6] text-gray-600 border-[#E5E5E5] hover:bg-white hover:text-gray-900 hover:border-gray-300'
              }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {/* Category Symbol + Icon */}
              <span className="text-sm leading-none shrink-0" aria-hidden="true">
                {cfg.symbol}
              </span>
              <span className={`shrink-0 ${isActive ? cfg.iconColor : 'text-gray-400'}`}>
                {cfg.icon}
              </span>

              {/* Title Label */}
              <span className="whitespace-nowrap font-bold">
                {t(cfg.labelKey, cfg.defaultLabel)}
              </span>

              {/* Active Checkmark Pill */}
              <span 
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isActive ? cfg.activeBadge : 'bg-gray-200 text-transparent'
                }`}
              >
                {isActive ? <Check className="w-3 h-3 stroke-[3]" /> : '•'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
