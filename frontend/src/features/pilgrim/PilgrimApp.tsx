import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  AlertOctagon, 
  Route as RouteIcon, 
  Droplet, 
  PhoneCall, 
  Check, 
  ArrowRight,
  Filter,
  HeartPulse,
  Shield,
  Tent,
  Coffee,
  Navigation,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CloudSun
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { GisMap } from '../../components/map/GisMap';
import { GisQuickFilterBar } from '../../components/map/GisQuickFilterBar';
import { FacilityCard } from '../../components/common/FacilityCard';
import { SosModal } from './SosModal';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import { ExpandableActionBar, ActionBarItem } from '../../components/common/ExpandableActionBar';
import { MapLayerState } from '../../types';
import { Logo } from '../../components/common/Logo';
import { useLanguage } from '../../context/LanguageContext';

interface CheckpointInfo {
  id: string;
  nameKey: string;
  defaultName: string;
  locationKey: string;
  defaultLocation: string;
  waitTimeMin: number;
  status: 'SHORT' | 'MODERATE' | 'LONG';
  colorClass: string;
  badgeClass: string;
}

const CHECKPOINTS: CheckpointInfo[] = [
  {
    id: 'cp-jejuri',
    nameKey: 'pilgrim.checkpoints',
    defaultName: 'Jejuri Gate (Outer Corridor)',
    locationKey: 'temple.activeZone',
    defaultLocation: 'Outer North Entry',
    waitTimeMin: 12,
    status: 'SHORT',
    colorClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'cp-lonand',
    nameKey: 'pilgrim.safeCorridor',
    defaultName: 'Lonand Entry (Sector C Junction)',
    locationKey: 'pilgrim.youAreAt',
    defaultLocation: 'Shivaji Chowk Diverter',
    waitTimeMin: 32,
    status: 'MODERATE',
    colorClass: 'text-amber-700',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    id: 'cp-wakhri',
    nameKey: 'pilgrim.recommendedRoutes',
    defaultName: 'Wakhri Checkpoint (Station Link)',
    locationKey: 'pilgrim.safeCorridor',
    defaultLocation: 'Railway & Bus Depot Approach',
    waitTimeMin: 42,
    status: 'MODERATE',
    colorClass: 'text-amber-700',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    id: 'cp-mandir',
    nameKey: 'temple.templeCrowd',
    defaultName: 'Temple Darshan Mahadwar Gate',
    locationKey: 'temple.darshanQ',
    defaultLocation: 'Namdev Payatha Queue Line',
    waitTimeMin: 68,
    status: 'LONG',
    colorClass: 'text-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
  },
];

export const PilgrimApp: React.FC = () => {
  const {
    zones,
    facilities,
    routes,
    templeStatus,
    triggerPilgrimSos,
  } = useOperations();
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string | null>('WATER');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  // Pilgrim is currently situated in Sector C
  const pilgrimZone = zones.find(z => z.id === 'sector-c') || zones[0];
  const isDiverted = routes.some(r => r.id === 'route-main' && (r.status === 'BLOCKED' || r.activeDiverted));

  // Selected route state - defaults to recommended safe route or bypass 2
  const defaultRouteId = routes.find(r => r.status === 'RECOMMENDED_SAFE')?.id || 'route-bypass-2';
  const [selectedRouteId, setSelectedRouteId] = useState<string>(defaultRouteId);

  // Sync route selection if route diversion is active
  useEffect(() => {
    if (isDiverted) {
      setSelectedRouteId('route-bypass-2');
    }
  }, [isDiverted]);

  // Active selected route object
  const activeSelectedRoute = routes.find(r => r.id === selectedRouteId) || routes.find(r => r.status === 'RECOMMENDED_SAFE') || routes[0];

  const formatWaitTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs} ${t('pilgrim.hours', 'hr')} ${mins > 0 ? `${mins} ${t('pilgrim.minutes', 'min')}` : ''}`.trim();
    }
    return `${mins} ${t('pilgrim.minutes', 'mins')}`;
  };

  const [mapLayers, setMapLayers] = useState<MapLayerState>({
    routes: true,
    alternateRoutes: true,
    roads: true,
    medicalCamps: true,
    policeBooths: true,
    toilets: true,
    waterPoints: true,
    shelters: true,
    parking: false,
    crowdHeatmap: false,
    incidents: false,
    volunteers: false,
    policeUnits: false,
    ambulances: false,
    traffic: false,
    weatherOverlay: false,
    riskZones: true,
    predictedCongestion: false,
    safeRoutes: true,
    recommendedInterventions: false,
  });

  // Major Service Category Chips Configuration
  const SERVICE_CATEGORIES = [
    { id: 'WATER', label: t('pilgrim.drinkingWater', 'Drinking Water Points'), icon: '💧' },
    { id: 'MEDICAL', label: t('pilgrim.medicalIcu', 'Medical & ICU Camps'), icon: '❤️' },
    { id: 'TOILET', label: t('pilgrim.toiletsSanitation', 'Toilets & Sanitation'), icon: '🚻' },
    { id: 'POLICE_BOOTH', label: t('pilgrim.policeHelp', 'Police / Help Centers'), icon: '👮' },
    { id: 'TEMPLE', label: t('pilgrim.templeDarshan', 'Temple / Darshan'), icon: '🛕' },
    { id: 'PRASAD_CAMP', label: t('pilgrim.foodPrasad', 'Food / Prasadalaya'), icon: '🍛' },
    { id: 'OTHER', label: t('pilgrim.otherServices', 'Other Important Services'), icon: '📍' },
  ];

  // Filter facilities based on selected category
  const filteredFacilities = useMemo(() => {
    if (!selectedCategory) return [];

    return facilities.filter(f => {
      if (selectedCategory === 'WATER') return f.type === 'WATER';
      if (selectedCategory === 'MEDICAL') return f.type === 'MEDICAL';
      if (selectedCategory === 'TOILET') return f.type === 'TOILET';
      if (selectedCategory === 'POLICE_BOOTH') return f.type === 'POLICE_BOOTH';
      if (selectedCategory === 'TEMPLE') return f.type === 'TEMPLE';
      if (selectedCategory === 'PRASAD_CAMP') return f.type === 'PRASAD_CAMP';
      if (selectedCategory === 'OTHER') {
        const coreTypes = ['WATER', 'MEDICAL', 'TOILET', 'POLICE_BOOTH', 'TEMPLE', 'PRASAD_CAMP'];
        return !coreTypes.includes(f.type);
      }
      return true;
    }).sort((a, b) => {
      const distA = a.distanceMeters ?? 99999;
      const distB = b.distanceMeters ?? 99999;
      if (distA !== distB) return distA - distB;
      if (a.capacityPct !== b.capacityPct) return a.capacityPct - b.capacityPct;
      const statusOrder: Record<string, number> = { OPEN: 1, BUSY: 2, FULL: 3, MAINTENANCE: 4 };
      return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
    });
  }, [facilities, selectedCategory]);

  const INITIAL_DISPLAY_LIMIT = 6;
  const displayedFacilities = isExpanded 
    ? filteredFacilities 
    : filteredFacilities.slice(0, INITIAL_DISPLAY_LIMIT);
  const hasMore = filteredFacilities.length > INITIAL_DISPLAY_LIMIT;

  const getCategoryCount = (catId: string) => {
    return facilities.filter(f => {
      if (catId === 'WATER') return f.type === 'WATER';
      if (catId === 'MEDICAL') return f.type === 'MEDICAL';
      if (catId === 'TOILET') return f.type === 'TOILET';
      if (catId === 'POLICE_BOOTH') return f.type === 'POLICE_BOOTH';
      if (catId === 'TEMPLE') return f.type === 'TEMPLE';
      if (catId === 'PRASAD_CAMP') return f.type === 'PRASAD_CAMP';
      if (catId === 'OTHER') {
        const coreTypes = ['WATER', 'MEDICAL', 'TOILET', 'POLICE_BOOTH', 'TEMPLE', 'PRASAD_CAMP'];
        return !coreTypes.includes(f.type);
      }
      return false;
    }).length;
  };

  // Pilgrim Expandable Action Bar Categories
  const pilgrimActionBarItems: ActionBarItem[] = [
    {
      id: 'safe-route',
      title: t('actionBar.safeRouteNav', 'Safe Route Navigation'),
      icon: <RouteIcon className="w-4 h-4" />,
      badge: activeSelectedRoute?.name || 'Safe Corridor',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      content: (
        <div className="space-y-4">
          {/* Active Recommended Corridor Card */}
          <div className="bg-emerald-50/80 rounded-2xl border-2 border-emerald-500 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black">
                  <span>🟢 {t('pilgrim.recommendedRoutes', 'Recommended Route')}</span>
                </div>
                <h4 className="text-lg font-black text-[#1A2B47]">
                  {activeSelectedRoute?.name || t('pilgrim.safeCorridor', 'Bhakti Marg (Bypass 2 Corridor)')}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-emerald-200 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('pilgrim.estimatedWalk', 'Walk Time')}</div>
                <div className="text-sm sm:text-base font-black text-emerald-700 mt-0.5">
                  ~{activeSelectedRoute?.estimatedTimeMin || 35} {t('pilgrim.minutes', 'mins')}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('pilgrim.distance', 'Distance')}</div>
                <div className="text-sm sm:text-base font-black text-[#1A2B47] mt-0.5">
                  3.1 km
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('pilgrim.waterPoints', 'Water Stalls')}</div>
                <div className="text-sm sm:text-base font-black text-sky-600 mt-0.5">
                  4 {t('facility.waterStation', 'Stalls')}
                </div>
              </div>
            </div>
          </div>

          {/* Alternate Routes Option List */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-black uppercase text-gray-500 tracking-wider">
              {t('pilgrim.alternateRoutes', 'Available Corridors to Vitthal Temple')}
            </h5>

            {routes.map(r => {
              const isSelected = selectedRouteId === r.id;
              const isSafe = r.status === 'RECOMMENDED_SAFE';
              const isBlocked = r.status === 'BLOCKED' || r.activeDiverted;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? isBlocked
                        ? 'bg-rose-50 border-rose-500'
                        : 'bg-emerald-50 border-emerald-500'
                      : 'bg-white border-[#EAE6E1] hover:border-emerald-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSafe ? 'bg-emerald-100 text-emerald-800' :
                        isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isSafe ? '🟢 Recommended' : isBlocked ? '🔴 High Density' : '🟡 Moderate'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">~{r.estimatedTimeMin} mins</span>
                    </div>
                    <div className="text-sm font-black text-[#1A2B47] mt-1 truncate">{r.name}</div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#1A2B47] text-white' : 'border border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'interactive-gis-map',
      title: t('actionBar.interactiveGisMap', 'Interactive GIS Map'),
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Live GPS',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Real-time GPS walking map with active safe corridor, water points, and medical camps</span>
            <span className="text-emerald-700 font-mono font-bold">📍 Sector C • You Are Here</span>
          </div>

          {/* Standardized Uniform GIS Quick-Filter Bar */}
          <GisQuickFilterBar
            layers={mapLayers}
            onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
          />

          <div className="rounded-2xl border border-[#EAE6E1] overflow-hidden bg-white p-2">
            <GisMap
              zones={zones}
              incidents={[]}
              facilities={facilities}
              routes={routes}
              layers={mapLayers}
              selectedZoneId="sector-c"
              onSelectZone={() => {}}
              onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
              onSetLayers={setMapLayers}
              showPilgrimLocation={true}
              showFloatingLayerControl={true}
              role="pilgrim"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'nearby-services',
      title: t('actionBar.nearbyServices', 'Nearby Services (Water / Toilets / Medical)'),
      icon: <Droplet className="w-4 h-4" />,
      badge: `${facilities.length} Points`,
      badgeColor: 'bg-blue-100 text-blue-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Tap category to view and filter essential pilgrim stations</span>
            {selectedCategory && (
              <span className="font-mono text-[#1A2B47]">{displayedFacilities.length} Stations Nearby</span>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SERVICE_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1A2B47] text-white border-[#1A2B47] shadow-xs'
                      : 'bg-white text-[#1A2B47] border-[#E5E5E5] hover:bg-orange-50/70'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Facilities Cards */}
          {selectedCategory && filteredFacilities.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedFacilities.map(fac => (
                  <FacilityCard 
                    key={fac.id} 
                    facility={fac} 
                    onNavigate={() => {}} 
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="min-h-[40px] px-5 py-2 bg-white hover:bg-gray-50 text-[#1A2B47] font-bold text-xs rounded-xl border border-[#EAE6E1] shadow-2xs flex items-center gap-2 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 text-[#F27D26]" />
                        <span>{t('pilgrim.showLess', 'Show Less')}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 text-[#F27D26]" />
                        <span>{t('pilgrim.viewMore', 'View More')} ({filteredFacilities.length - INITIAL_DISPLAY_LIMIT} more)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'sector-wait-times',
      title: t('actionBar.sectorWaitTimes', 'Waiting Time at Different Sectors & Darshan'),
      icon: <Clock className="w-4 h-4" />,
      badge: '4 Sectors',
      badgeColor: 'bg-amber-100 text-amber-900',
      content: (
        <div className="space-y-4">
          {/* Temple Main Queue Big Card */}
          <div className="bg-gradient-to-r from-orange-500 to-[#F27D26] text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
                <span>{t('temple.templeCrowd', 'Vitthal Temple Mahadwar')}</span>
              </div>
              <h4 className="text-lg font-black">
                {t('temple.darshanQ', 'Mukhadarshan Queue')}
              </h4>
            </div>

            <div className="bg-white/15 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center sm:text-right shrink-0 w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-white/80">{t('temple.darshanWait', 'Estimated Wait')}</div>
              <div className="text-xl font-black font-mono mt-0.5">
                {formatWaitTime(templeStatus.darshanWaitTimeMinutes)}
              </div>
            </div>
          </div>

          {/* Individual Checkpoint Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHECKPOINTS.map((cp) => (
              <div
                key={cp.id}
                className="bg-white rounded-xl border border-[#EAE6E1] p-3.5 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-black text-[#1A2B47] truncate">
                    {cp.defaultName}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{cp.defaultLocation}</div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${cp.badgeClass}`}>
                    {cp.status === 'SHORT' ? t('common.low', 'Short wait') : cp.status === 'MODERATE' ? t('common.moderate', 'Moderate wait') : t('common.high', 'Long wait')}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-lg font-black font-mono ${cp.colorClass}`}>
                    {cp.waitTimeMin} {t('pilgrim.minutes', 'min')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'weather-heat',
      title: t('weather.title', 'Weather & Heat Protection'),
      icon: <CloudSun className="w-4 h-4" />,
      badge: '34°C • High Heat',
      badgeColor: 'bg-amber-100 text-amber-900',
      content: (
        <div className="space-y-3">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">☀️</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1A2B47] font-mono">34°C</span>
                  <span className="text-xs text-gray-500 font-semibold">(Feels like 37°C)</span>
                </div>
                <p className="text-xs font-bold text-amber-900 mt-0.5">
                  {t('weather.dehydrationDesc', 'High heat — drink water regularly to stay healthy.')}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs px-3 py-1 bg-amber-200 text-amber-950 font-bold rounded-lg">
                Stay Hydrated
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'emergency-sos',
      title: t('actionBar.emergencySos', 'Emergency SOS & Helplines'),
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: '1-Tap SOS',
      badgeColor: 'bg-red-100 text-red-900',
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-black text-red-900 uppercase">Emergency Help & Immediate Response</span>
              <p className="text-xs text-red-800">Direct link to nearest police booth, ambulance, and medical responders.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSosModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              Trigger SOS Alert
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="min-h-[44px] py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('pilgrim.sos', 'TRIGGER 1-TAP SOS')}</span>
            </button>

            <a
              href="tel:112"
              className="min-h-[44px] py-2.5 px-4 bg-white hover:bg-gray-50 active:scale-95 text-[#1A2B47] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-[#EAE6E1]"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>{t('common.police112', 'Call 112 (Emergency Police)')}</span>
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="pilgrim-mobile-app" className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* 1. TOP HEADER & EMERGENCY SOS */}
      <header className="bg-white rounded-2xl border border-[#EAE6E1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Logo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-orange-100 text-[#F27D26] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {t('pilgrim.title', 'Pilgrim Safety Companion')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A2B47] mt-1 tracking-tight">
                {t('pilgrim.wariGuide', 'Pandharpur Wari Companion')}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-4 h-4 text-[#F27D26] shrink-0" />
                <span>{t('pilgrim.youAreAt', 'You are at')}: <strong className="text-[#1A2B47] font-bold">Sector C • Shivaji Chowk</strong></span>
              </p>
            </div>
          </div>

          {/* Quick SOS Trigger Button */}
          <button
            id="pilgrim-sos-trigger-btn"
            onClick={() => setIsSosModalOpen(true)}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0 duration-150"
          >
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            <span>{t('pilgrim.sos', 'EMERGENCY SOS')}</span>
          </button>
        </div>

        {/* Offline / Cached Map Indicator Banner */}
        <div className="pt-2 border-t border-gray-100">
          <OfflineIndicator />
        </div>
      </header>

      {/* REUSABLE EXPANDABLE ACTION BAR AT TOP OF MAIN CONTENT */}
      <ExpandableActionBar
        id="pilgrim-action-bar"
        items={pilgrimActionBarItems}
      />

      {/* SOS Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onTriggerSos={triggerPilgrimSos}
      />
    </div>
  );
};
