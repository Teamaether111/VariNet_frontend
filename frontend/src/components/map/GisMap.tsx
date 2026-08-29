import React, { useState } from 'react';
import { 
  Layers,
  Check,
  X,
  EyeOff
} from 'lucide-react';
import { Zone, Incident, Facility, RouteOption, MapLayerState, UserRole } from '../../types';
import { GoogleGisMap } from './GoogleGisMap';

interface GisMapProps {
  zones: Zone[];
  incidents: Incident[];
  facilities: Facility[];
  routes: RouteOption[];
  layers: MapLayerState;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectFacility?: (facility: Facility) => void;
  onToggleLayer?: (key: keyof MapLayerState) => void;
  onSetLayers?: (updater: (prev: MapLayerState) => MapLayerState) => void;
  role?: UserRole;
  showPilgrimLocation?: boolean;
  showFloatingLayerControl?: boolean;
  className?: string;
}

export const GisMap: React.FC<GisMapProps> = ({
  zones,
  incidents,
  facilities,
  routes,
  layers,
  selectedZoneId,
  onSelectZone,
  onSelectIncident,
  onSelectFacility,
  onToggleLayer,
  onSetLayers,
  role = 'police',
  showPilgrimLocation = false,
  showFloatingLayerControl = true,
  className = '',
}) => {
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  const handleToggle = (key: keyof MapLayerState) => {
    if (onToggleLayer) {
      onToggleLayer(key);
    } else if (onSetLayers) {
      onSetLayers(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  // Quick preset toggles
  const handlePresetRoutesOnly = () => {
    if (onSetLayers) {
      onSetLayers(prev => ({
        ...prev,
        routes: true,
        safeRoutes: true,
        roads: true,
        waterPoints: false,
        medicalCamps: false,
        toilets: false,
        policeBooths: false,
        shelters: false,
      }));
    } else if (onToggleLayer) {
      if (!layers.routes) onToggleLayer('routes');
      if (!layers.safeRoutes) onToggleLayer('safeRoutes');
      if (layers.waterPoints) onToggleLayer('waterPoints');
      if (layers.medicalCamps) onToggleLayer('medicalCamps');
      if (layers.toilets) onToggleLayer('toilets');
      if (layers.policeBooths) onToggleLayer('policeBooths');
      if (layers.shelters) onToggleLayer('shelters');
    }
  };

  const handlePresetFacilitiesOnly = () => {
    if (onSetLayers) {
      onSetLayers(prev => ({
        ...prev,
        routes: false,
        safeRoutes: false,
        waterPoints: true,
        medicalCamps: true,
        toilets: true,
        policeBooths: true,
        shelters: true,
      }));
    } else if (onToggleLayer) {
      if (layers.routes) onToggleLayer('routes');
      if (layers.safeRoutes) onToggleLayer('safeRoutes');
      if (!layers.waterPoints) onToggleLayer('waterPoints');
      if (!layers.medicalCamps) onToggleLayer('medicalCamps');
      if (!layers.toilets) onToggleLayer('toilets');
      if (!layers.policeBooths) onToggleLayer('policeBooths');
      if (!layers.shelters) onToggleLayer('shelters');
    }
  };

  const handlePresetAllOverlays = () => {
    if (onSetLayers) {
      onSetLayers(prev => ({
        ...prev,
        routes: true,
        safeRoutes: true,
        roads: true,
        waterPoints: true,
        medicalCamps: true,
        toilets: true,
        policeBooths: true,
        shelters: true,
        riskZones: true,
      }));
    } else if (onToggleLayer) {
      if (!layers.routes) onToggleLayer('routes');
      if (!layers.safeRoutes) onToggleLayer('safeRoutes');
      if (!layers.waterPoints) onToggleLayer('waterPoints');
      if (!layers.medicalCamps) onToggleLayer('medicalCamps');
      if (!layers.toilets) onToggleLayer('toilets');
      if (!layers.policeBooths) onToggleLayer('policeBooths');
      if (!layers.shelters) onToggleLayer('shelters');
    }
  };

  // Count active layers for badge
  const activeRoutesCount = (layers.routes ? 1 : 0) + (layers.safeRoutes ? 1 : 0) + (layers.roads ? 1 : 0);
  const activeFacilitiesCount = (layers.waterPoints ? 1 : 0) + (layers.medicalCamps ? 1 : 0) + (layers.toilets ? 1 : 0) + (layers.policeBooths ? 1 : 0) + (layers.shelters ? 1 : 0);
  const totalActiveOverlays = activeRoutesCount + activeFacilitiesCount;

  return (
    <div
      id="gis-map-container"
      className={`relative w-full h-[450px] md:h-[580px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner select-none ${className}`}
    >
      {/* Map Header Status Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 flex-wrap pointer-events-auto">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider">
            Google Maps
          </span>
        </div>
      </div>

      {/* Floating Layer Control Button & Panel */}
      {showFloatingLayerControl && (
        <div className="absolute top-3 right-3 z-30">
          <button
            id="floating-map-layer-btn"
            type="button"
            onClick={() => setIsLayerControlOpen(!isLayerControlOpen)}
            className={`min-h-[48px] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl backdrop-blur-md cursor-pointer border active:scale-95 duration-150 ${
              isLayerControlOpen
                ? 'bg-[#F27D26] text-white border-[#F27D26] shadow-orange-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:border-slate-500'
            }`}
            title="Toggle Route Overlays and Facility Markers"
          >
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Map Layers</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold">
              {totalActiveOverlays}
            </span>
          </button>

          {/* Floating Dropdown Overlay Panel */}
          {isLayerControlOpen && (
            <div
              id="floating-layer-dropdown-panel"
              className="absolute right-0 top-10 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-700 shadow-2xl p-3.5 text-xs max-h-[460px] overflow-y-auto space-y-3 z-40 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/80">
                <div className="flex items-center gap-1.5 font-bold text-slate-100 uppercase tracking-wider text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>Map Overlays & Markers</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLayerControlOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Segmented Switch */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Quick Filter</div>
                <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={handlePresetRoutesOnly}
                    className={`py-1 px-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      activeRoutesCount > 0 && activeFacilitiesCount === 0
                        ? 'bg-[#F27D26] text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    🛣️ Routes
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetFacilitiesOnly}
                    className={`py-1 px-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      activeFacilitiesCount > 0 && activeRoutesCount === 0
                        ? 'bg-[#F27D26] text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    💧 Facilities
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetAllOverlays}
                    className={`py-1 px-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer truncate ${
                      activeRoutesCount > 0 && activeFacilitiesCount > 0
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    🌟 Show All
                  </button>
                </div>
              </div>

              {/* 1. ROUTE OVERLAYS */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/50">
                  <span className="flex items-center gap-1.5">
                    <span>🛣️</span>
                    <span>Route Overlays</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">{activeRoutesCount}/3</span>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleToggle('routes')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.routes
                        ? 'bg-emerald-900/30 border-emerald-700/60 text-emerald-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">🚶</span>
                      <span className="truncate">Walking Spine Routes</span>
                    </span>
                    {layers.routes ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('safeRoutes')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.safeRoutes
                        ? 'bg-emerald-900/40 border-emerald-500/70 text-emerald-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">✨</span>
                      <span className="truncate">AI Safe Corridor (Bypass 2)</span>
                    </span>
                    {layers.safeRoutes ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('roads')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.roads
                        ? 'bg-slate-800 border-slate-600 text-slate-200 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">🗺️</span>
                      <span className="truncate">Arterial Road Network</span>
                    </span>
                    {layers.roads ? (
                      <Check className="w-3.5 h-3.5 text-slate-300 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* 2. FACILITY & SERVICE MARKERS */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950/40 px-2 py-1 rounded-lg border border-sky-800/50">
                  <span className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Facility Markers</span>
                  </span>
                  <span className="text-[10px] font-mono text-sky-300 font-bold">{activeFacilitiesCount}/5</span>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggle('waterPoints')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.waterPoints
                        ? 'bg-sky-900/30 border-sky-700/60 text-sky-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">💧</span>
                      <span className="truncate">Drinking Water Points</span>
                    </span>
                    {layers.waterPoints ? (
                      <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('medicalCamps')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.medicalCamps
                        ? 'bg-rose-900/30 border-rose-700/60 text-rose-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">➕</span>
                      <span className="truncate">Medical & ICU Camps</span>
                    </span>
                    {layers.medicalCamps ? (
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('policeBooths')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.policeBooths
                        ? 'bg-blue-900/30 border-blue-700/60 text-blue-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">🛡️</span>
                      <span className="truncate">Police & Security Posts</span>
                    </span>
                    {layers.policeBooths ? (
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('shelters')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.shelters
                        ? 'bg-orange-900/30 border-orange-700/60 text-orange-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">🍽️</span>
                      <span className="truncate">Food & Prasadalaya Camps</span>
                    </span>
                    {layers.shelters ? (
                      <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('toilets')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      layers.toilets
                        ? 'bg-teal-900/30 border-teal-700/60 text-teal-100 font-medium'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">🚻</span>
                      <span className="truncate">Sanitation & Toilets</span>
                    </span>
                    {layers.toilets ? (
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 font-bold" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3. SAFETY ZONES */}
              <div className="pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleToggle('riskZones')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                    layers.riskZones
                      ? 'bg-orange-950/40 border-orange-700/50 text-orange-200 font-medium'
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-sm">🛡️</span>
                    <span className="truncate">Safety & Crowd Risk Zones</span>
                  </span>
                  {layers.riskZones ? (
                    <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 font-bold" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend pill */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300 shadow-lg pointer-events-auto">
        <span className="text-slate-400 font-semibold uppercase text-[10px]">Risk:</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Med</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Critical</span>
      </div>

      {/* Permanent Sole Google Maps Component */}
      <GoogleGisMap
        zones={zones}
        incidents={incidents}
        facilities={facilities}
        routes={routes}
        layers={layers}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
        onSelectIncident={onSelectIncident}
        onSelectFacility={onSelectFacility}
        role={role}
        showPilgrimLocation={showPilgrimLocation}
        apiKey={googleMapsApiKey}
      />
    </div>
  );
};
