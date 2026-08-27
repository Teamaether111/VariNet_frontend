import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Ambulance, 
  AlertTriangle, 
  Route, 
  MapPin, 
  Activity,
  Sparkles,
  Filter,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  CloudSun
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import { DecisionCard } from '../../components/common/DecisionCard';
import { GisMap } from '../../components/map/GisMap';
import { GisQuickFilterBar } from '../../components/map/GisQuickFilterBar';
import { MapLayerControl } from '../../components/map/MapLayerControl';
import { WeatherCard } from '../../components/common/WeatherCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { IncidentCard } from '../../components/common/IncidentCard';
import { ExpandableActionBar, ActionBarItem } from '../../components/common/ExpandableActionBar';
import { IncidentManagementModal } from './IncidentManagementModal';
import { Incident, MapLayerState } from '../../types';

export const PoliceDashboard: React.FC = () => {
  const {
    zones,
    selectedZone,
    selectedZoneId,
    setSelectedZoneId,
    activeRecommendation,
    approveRecommendation,
    rejectRecommendation,
    incidents,
    facilities,
    routes,
    acknowledgeIncident,
    assignIncidentUnits,
    resolveIncident,
    divertRouteManually,
  } = useOperations();
  const { t } = useLanguage();

  const [mapLayers, setMapLayers] = useState<MapLayerState>({
    routes: true,
    alternateRoutes: true,
    roads: true,
    medicalCamps: true,
    policeBooths: true,
    toilets: false,
    waterPoints: true,
    shelters: true,
    parking: false,
    crowdHeatmap: true,
    incidents: true,
    volunteers: true,
    policeUnits: true,
    ambulances: true,
    traffic: true,
    weatherOverlay: true,
    riskZones: true,
    predictedCongestion: true,
    safeRoutes: true,
    recommendedInterventions: true,
  });

  const [triageIncident, setTriageIncident] = useState<Incident | null>(null);
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | 'CRITICAL' | 'NEW' | 'IN_PROGRESS'>('ALL');

  const toggleLayer = (key: keyof MapLayerState) => {
    setMapLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Aggregate numbers
  const totalCrowd = zones.reduce((acc, z) => acc + z.crowdCount, 0);
  const totalPolice = zones.reduce((acc, z) => acc + z.activeUnits.police, 0);
  const totalVolunteers = zones.reduce((acc, z) => acc + z.activeUnits.volunteers, 0);
  const totalAmbulances = zones.reduce((acc, z) => acc + z.activeUnits.ambulances, 0);
  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  const filteredIncidents = incidents.filter(inc => {
    if (incidentFilter === 'CRITICAL') return inc.priority === 'CRITICAL';
    if (incidentFilter === 'NEW') return inc.status === 'NEW';
    if (incidentFilter === 'IN_PROGRESS') return inc.status === 'IN_PROGRESS' || inc.status === 'ACKNOWLEDGED';
    return true;
  });

  // Police / Command Expandable Action Bar Categories
  const policeActionBarItems: ActionBarItem[] = [
    {
      id: 'crowd-density',
      title: t('actionBar.crowdDensityHeatmaps', 'Crowd Density & Active Operational Zone'),
      icon: <Users className="w-4 h-4" />,
      badge: `${(totalCrowd / 1000).toFixed(0)}k Pax`,
      badgeColor: 'bg-orange-100 text-orange-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold flex-wrap gap-2">
            <span>Live Sector Crowd Distribution & Active Zone Telemetry</span>
            <span className="font-mono text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
              Total Ground Crowd: {totalCrowd.toLocaleString()} Pilgrims
            </span>
          </div>

          {/* Sector Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {zones.map(z => (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZoneId(z.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedZoneId === z.id ? 'bg-orange-50 border-[#F27D26] ring-2 ring-[#F27D26]/30' : 'bg-[#F9F8F6] border-[#E5E5E5] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-black text-[#1A2B47] truncate">{z.code}</span>
                  <RiskBadge level={z.riskLevel} />
                </div>
                <div className="text-base font-black text-[#1A2B47] font-mono">{z.crowdCount.toLocaleString()}</div>
                <div className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{z.name}</div>
              </button>
            ))}
          </div>

          {/* Selected Zone Deep Dive */}
          {selectedZone && (
            <div className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#E5E5E5] gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#F27D26]">
                    {t('temple.activeZone', 'Active Sector Telemetry')}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-[#1A2B47] mt-0.5">
                    {selectedZone.code} — {selectedZone.name}
                  </h4>
                </div>
                <RiskBadge level={selectedZone.riskLevel} score={selectedZone.riskScore} size="lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 bg-white p-4 rounded-xl border border-[#E5E5E5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-bold">{t('police.density', 'Crowd Density')}</span>
                    <span className="font-mono font-black text-[#1A2B47]">
                      {selectedZone.crowdDensity} persons/m²
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        selectedZone.crowdDensity > 4.0 ? 'bg-red-600' :
                        selectedZone.crowdDensity > 2.5 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((selectedZone.crowdDensity / 6) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase font-bold">{t('temple.holdingArea', 'Current Crowd')}</div>
                    <div className="font-black text-[#1A2B47] font-mono text-lg mt-0.5">
                      {selectedZone.crowdCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-gray-500 uppercase font-bold">{t('temple.mandapCapacity', 'Safe Cap')}</div>
                    <div className="font-bold text-gray-700 font-mono text-lg mt-0.5">
                      {selectedZone.maxSafeCapacity.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase font-bold">Field Units</div>
                    <div className="text-xs font-bold text-gray-800 mt-1">
                      {selectedZone.activeUnits.police} Police • {selectedZone.activeUnits.volunteers} Vol • {selectedZone.activeUnits.ambulances} Amb
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    Active Patrol
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'active-interventions',
      title: t('actionBar.activeInterventionsDiversions', 'Active Interventions & AI Next Best Action'),
      icon: <Sparkles className="w-4 h-4" />,
      badge: activeRecommendation ? 'Action Required' : 'Nominal',
      badgeColor: activeRecommendation ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900',
      content: (
        <div className="space-y-4">
          <DecisionCard
            recommendation={activeRecommendation}
            onApprove={approveRecommendation}
            onReject={rejectRecommendation}
          />
        </div>
      ),
    },
    {
      id: 'incident-triage',
      title: t('actionBar.incidentTriageFieldUnits', 'Incident Triage & Field Units'),
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: `${activeIncidentsCount} Active`,
      badgeColor: activeIncidentsCount > 0 ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-gray-800',
      content: (
        <div className="space-y-4">
          {/* Field Units Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase">{t('map.policeUnits', 'Police Units')}</div>
                <div className="text-2xl font-black text-blue-900 font-mono mt-0.5">{totalPolice}</div>
              </div>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase">{t('volunteer.activeVolunteers', 'Volunteers')}</div>
                <div className="text-2xl font-black text-[#F27D26] font-mono mt-0.5">{totalVolunteers}</div>
              </div>
              <Users className="w-5 h-5 text-[#F27D26]" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase">{t('map.ambulances', 'Ambulances')}</div>
                <div className="text-2xl font-black text-red-700 font-mono mt-0.5">{totalAmbulances}</div>
              </div>
              <Ambulance className="w-5 h-5 text-red-600" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-bold uppercase">{t('police.activeIncidents', 'Active Alerts')}</div>
                <div className="text-2xl font-black text-[#1A2B47] font-mono mt-0.5">{activeIncidentsCount}</div>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <h4 className="text-base font-black text-[#1A2B47] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>{t('police.incidentTriage', 'Live Ground Incident Feed & Triage')}</span>
            </h4>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 bg-[#F9F8F6] p-1.5 rounded-xl border border-[#E5E5E5] text-xs">
              <button
                id="filter-incidents-all"
                onClick={() => setIncidentFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  incidentFilter === 'ALL' ? 'bg-[#1A2B47] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{t('police.filterAll', 'All')}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">{incidents.length}</span>
              </button>
              <button
                id="filter-incidents-critical"
                onClick={() => setIncidentFilter('CRITICAL')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  incidentFilter === 'CRITICAL' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-600 hover:bg-red-50'
                }`}
              >
                <span>{t('police.filterCritical', 'Critical')}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">{incidents.filter(i => i.priority === 'CRITICAL').length}</span>
              </button>
              <button
                id="filter-incidents-new"
                onClick={() => setIncidentFilter('NEW')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  incidentFilter === 'NEW' ? 'bg-[#F27D26] text-white shadow-xs' : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                <span>{t('common.active', 'Unassigned')}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">{incidents.filter(i => i.status === 'NEW').length}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncidents.map(inc => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onAcknowledge={acknowledgeIncident}
                onAssign={() => setTriageIncident(inc)}
                onResolve={resolveIncident}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'alternate-corridors',
      title: t('actionBar.alternateCorridors', 'Alternate Corridors & Road Network'),
      icon: <Route className="w-4 h-4" />,
      badge: `${routes.filter(r => r.status === 'RECOMMENDED_SAFE').length} Safe`,
      badgeColor: 'bg-emerald-100 text-emerald-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Pilgrim Movement Arteries, Flow Speeds & Manual Diversion Controls</span>
            <span>{routes.length} Active Corridors</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
            {routes.map(r => (
              <div
                key={r.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all min-w-0 ${
                  r.status === 'BLOCKED'
                    ? 'bg-red-50 border-red-200 text-red-950 shadow-xs'
                    : r.status === 'RECOMMENDED_SAFE'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs'
                    : 'bg-slate-50 border-[#E5E5E5] text-slate-800'
                }`}
                style={{ minWidth: 'fit-content' }}
              >
                <div className="flex items-center justify-between gap-2 min-w-0 whitespace-nowrap">
                  <span className="font-black text-sm text-[#1A2B47] min-w-0 whitespace-nowrap" title={r.code}>{r.code}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-black shrink-0 whitespace-nowrap ${
                    r.status === 'RECOMMENDED_SAFE' ? 'bg-emerald-200 text-emerald-900' :
                    r.status === 'BLOCKED' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {r.status === 'RECOMMENDED_SAFE' ? t('pilgrim.recommendedBadge', 'Safe') : r.status === 'BLOCKED' ? t('common.critical', 'Blocked') : t('common.active', 'Open')}
                  </span>
                </div>
                <div className="text-sm font-black text-[#1A2B47] leading-snug">
                  {r.name}
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 pt-3 border-t border-black/5 gap-3 whitespace-nowrap min-w-0 flex-wrap sm:flex-nowrap">
                  <span className="font-mono font-bold whitespace-nowrap shrink-0">~{r.estimatedTimeMin} {t('pilgrim.minutes', 'min')}</span>
                  <button
                    id={`btn-divert-${r.id}`}
                    onClick={() => divertRouteManually(r.id, !r.activeDiverted)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-orange-50 active:scale-95 duration-150 text-[#F27D26] font-bold border border-orange-200 hover:border-orange-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap overflow-visible"
                    style={{ width: 'max-content', minWidth: 'max-content', flexShrink: 0, whiteSpace: 'nowrap', textOverflow: 'clip' }}
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap overflow-visible inline-block" style={{ whiteSpace: 'nowrap', textOverflow: 'clip' }}>
                      {r.activeDiverted ? t('decision.approved', 'Intervention Approved') : t('decision.approve', 'Approve & Execute')}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'zone-microclimate',
      title: t('weather.title', 'Zone Microclimate Radar & Forecast'),
      icon: <CloudSun className="w-4 h-4" />,
      badge: selectedZone ? `${selectedZone.weather.temp}°C` : 'Telemetry',
      badgeColor: 'bg-amber-100 text-amber-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Microclimate Sensors, Heat Index, Humidity & 60-Min AI Predictive Outlook</span>
            {selectedZone && (
              <span className="font-mono text-[#F27D26] font-bold">{selectedZone.code} — {selectedZone.name}</span>
            )}
          </div>

          {selectedZone && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <WeatherCard
                  weather={selectedZone.weather}
                  zoneCode={selectedZone.code}
                  zoneName={selectedZone.name}
                />
              </div>

              {/* 60-Min Predictive Insight Card */}
              <div className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>{t('decision.timeline', '60-Min Predictive Forecast')}</span>
                  </div>
                  <h4 className="text-base font-black text-[#1A2B47] mt-2">
                    {selectedZone.name} Microclimate Projection
                  </h4>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {selectedZone.predictedIssue}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 font-bold">
                  Heat index expected to rise during peak procession hours. ORS misting stations recommended along corridor.
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'interactive-gis-map',
      title: t('actionBar.interactiveGisMap', 'Interactive GIS Map'),
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Live Tactical',
      badgeColor: 'bg-blue-100 text-blue-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-base sm:text-lg font-black text-[#1A2B47]">
                {t('police.gisMap', 'Interactive GIS Operations Map')}
              </h4>
              <p className="text-xs text-gray-500 font-medium">Real-time GPS layers, tactical overlay toggles, and incident pinning</p>
            </div>
            
            <MapLayerControl layers={mapLayers} onToggleLayer={toggleLayer} />
          </div>

          {/* Standardized Uniform GIS Quick-Filter Bar */}
          <GisQuickFilterBar
            layers={mapLayers}
            onToggleLayer={toggleLayer}
          />

          <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden bg-white p-2">
            <GisMap
              zones={zones}
              incidents={incidents}
              facilities={facilities}
              routes={routes}
              layers={mapLayers}
              selectedZoneId={selectedZoneId}
              onSelectZone={(id) => setSelectedZoneId(id)}
              onSelectIncident={(inc) => setTriageIncident(inc)}
              onToggleLayer={toggleLayer}
              onSetLayers={setMapLayers}
              role="police"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="police-command-dashboard" className="space-y-6">
      
      {/* 1. TOP HEADER & POLICE COMMAND BAR */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[#F27D26] text-xs font-black tracking-wider uppercase border border-orange-200">
            {t('police.title', 'Police & Emergency Command')}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2B47] leading-tight mt-3">
          {t('auth.welcome', 'VARI-Net Tactical Command & Control')}
        </h2>
      </div>

      {/* REUSABLE EXPANDABLE ACTION BAR AT TOP OF MAIN CONTENT */}
      <ExpandableActionBar
        id="police-action-bar"
        items={policeActionBarItems}
      />

      {/* Incident Dispatch Modal */}
      <IncidentManagementModal
        incident={triageIncident}
        isOpen={!!triageIncident}
        onClose={() => setTriageIncident(null)}
        onAssignUnits={assignIncidentUnits}
        onResolve={resolveIncident}
      />
    </div>
  );
};
