import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  Users, 
  Coffee,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import { GisMap } from '../../components/map/GisMap';
import { GisQuickFilterBar } from '../../components/map/GisQuickFilterBar';
import { ExpandableActionBar, ActionBarItem } from '../../components/common/ExpandableActionBar';
import { MapLayerState } from '../../types';

export const TempleDashboard: React.FC = () => {
  const {
    zones,
    templeStatus,
    facilities,
    routes,
  } = useOperations();
  const { t } = useLanguage();

  const templeZone = zones.find(z => z.id === 'sector-b') || zones[1];

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
    crowdHeatmap: true,
    incidents: true,
    volunteers: true,
    policeUnits: true,
    ambulances: false,
    traffic: false,
    weatherOverlay: true,
    riskZones: true,
    predictedCongestion: false,
    safeRoutes: true,
    recommendedInterventions: false,
  });

  // Temple Authority Expandable Action Bar Categories
  const templeActionBarItems: ActionBarItem[] = [
    {
      id: 'queue-controls',
      title: t('actionBar.queueControls', 'Queue Management Controls'),
      icon: <Building2 className="w-4 h-4" />,
      badge: '4 Mandaps',
      badgeColor: 'bg-orange-100 text-orange-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1A2B47] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#F27D26]" />
                <span>{t('temple.mandapHeader', 'Holding Mandap Flow & Queue Control')}</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Real-time enclosure capacity monitoring and gate flow modulation
              </p>
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-mono font-bold bg-[#F9F8F6] px-3 py-1.5 rounded-xl border border-[#E5E5E5]">
              {t('facility.capacity', 'Capacity')}: 33,500
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {templeStatus.holdingEnclosures.map(enc => {
              const occupancyPct = Math.round((enc.currentOccupancy / enc.maxCapacity) * 100);
              const isCritical = occupancyPct >= 95;

              return (
                <div
                  key={enc.name}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isCritical ? 'bg-red-50/80 border-red-300' : 'bg-[#F9F8F6] border-[#E5E5E5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-[#1A2B47] truncate">{enc.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 whitespace-nowrap ${
                      isCritical ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {enc.status === 'CRITICAL' ? t('common.critical', 'CRITICAL') : enc.status === 'FULL' ? t('temple.pauseGate', 'FULL') : t('common.active', 'ACTIVE')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-gray-600">{enc.currentOccupancy.toLocaleString()} / {enc.maxCapacity.toLocaleString()}</span>
                      <span className="font-black text-[#1A2B47]">{occupancyPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          occupancyPct > 90 ? 'bg-red-600' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: 'darshan-queue',
      title: t('actionBar.darshanQueue', 'Darshan Queue'),
      icon: <Clock className="w-4 h-4" />,
      badge: '3h 30m Wait',
      badgeColor: 'bg-amber-100 text-amber-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Darshan Line Metrics, Flow Velocity & Maha-Prasad Operations</span>
            <span className="font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Throughput: 4,400/hr
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>{t('temple.darshanQueue', 'Darshan Queue')}</span>
                <Clock className="w-4 h-4 text-[#F27D26]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A2B47] font-mono tracking-tight">
                3h 30m
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Namdev Payatha Queue</div>
            </div>

            <div className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>{t('temple.throughput', 'Throughput')}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
                4,400 / hr
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">Pacing nominal</div>
            </div>

            <div className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>{t('temple.holdingArea', 'Holding Crowd')}</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A2B47] font-mono tracking-tight">
                18,500
              </div>
              <div className="text-[11px] text-blue-700 font-bold mt-1">Across 4 enclosures</div>
            </div>

            <div className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                <span>{t('facility.prasadCamp', 'Maha-Prasad')}</span>
                <Coffee className="w-4 h-4 text-[#F27D26]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A2B47] font-mono tracking-tight">
                142,500
              </div>
              <div className="text-[11px] text-orange-700 font-bold mt-1">Meals served today</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'interactive-gis-map',
      title: t('actionBar.interactiveGisMap', 'Interactive GIS Map'),
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Live GIS',
      badgeColor: 'bg-blue-100 text-blue-900',
      content: (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Temple Perimeter & Inner Sanctum GIS Telemetry</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              All Mahadwar Gates Active
            </span>
          </div>

          {/* Standardized Uniform GIS Quick-Filter Bar */}
          <GisQuickFilterBar
            layers={mapLayers}
            onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
          />

          <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden bg-white p-2">
            <GisMap
              zones={zones}
              incidents={[]}
              facilities={facilities}
              routes={routes}
              layers={mapLayers}
              selectedZoneId={templeZone.id}
              onSelectZone={() => {}}
              onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
              onSetLayers={setMapLayers}
              role="temple-authority"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="temple-authority-dashboard" className="space-y-6">
      
      {/* 1. TOP HEADER STATUS */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[#F27D26] text-xs font-black tracking-wider uppercase border border-orange-200">
            {t('temple.samiti', 'Shri Vitthal-Rukmini Mandir Samiti')}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2B47] leading-tight mt-3">
          {t('temple.title', 'Temple Sanctum & Darshan Queue Operations')}
        </h2>
      </div>

      {/* REUSABLE EXPANDABLE ACTION BAR AT TOP OF MAIN CONTENT */}
      <ExpandableActionBar
        id="temple-action-bar"
        items={templeActionBarItems}
      />
    </div>
  );
};
