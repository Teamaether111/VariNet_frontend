import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { 
  Shield, 
  Droplet, 
  Flame, 
  AlertTriangle, 
  Ambulance as AmbulanceIcon, 
  Users, 
  Navigation, 
  Sparkles, 
  Building2,
  ExternalLink,
  MapPin,
  Compass,
  Layers,
  Thermometer
} from 'lucide-react';
import { Zone, Incident, Facility, RouteOption, MapLayerState, UserRole } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface GoogleGisMapProps {
  zones: Zone[];
  incidents: Incident[];
  facilities: Facility[];
  routes: RouteOption[];
  layers: MapLayerState;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectFacility?: (facility: Facility) => void;
  role?: UserRole;
  showPilgrimLocation?: boolean;
  apiKey: string;
  onError?: (errorInfo: { message: string; domain: string }) => void;
}

// Pandharpur Geocoordinates
export const PANDHARPUR_CENTER = { lat: 17.6775, lng: 75.3279 };

// Mapping Zones to Geographic Polygons in Pandharpur
export const ZONE_GEO_BOUNDS: Record<string, { center: { lat: number; lng: number }; coords: Array<{ lat: number; lng: number }> }> = {
  'zone-1': { // Sector A: Chandrabhaga Ghats
    center: { lat: 17.6738, lng: 75.3188 },
    coords: [
      { lat: 17.6765, lng: 75.3160 },
      { lat: 17.6768, lng: 75.3212 },
      { lat: 17.6710, lng: 75.3215 },
      { lat: 17.6708, lng: 75.3162 },
    ],
  },
  'zone-2': { // Sector B: Vitthal Mandir Sanctum
    center: { lat: 17.6762, lng: 75.3242 },
    coords: [
      { lat: 17.6782, lng: 75.3225 },
      { lat: 17.6782, lng: 75.3262 },
      { lat: 17.6742, lng: 75.3262 },
      { lat: 17.6742, lng: 75.3225 },
    ],
  },
  'zone-3': { // Sector C: Palkhi Marg
    center: { lat: 17.6798, lng: 75.3295 },
    coords: [
      { lat: 17.6825, lng: 75.3270 },
      { lat: 17.6825, lng: 75.3325 },
      { lat: 17.6770, lng: 75.3325 },
      { lat: 17.6770, lng: 75.3270 },
    ],
  },
  'zone-4': { // Sector D: Gopalpur Base Camp
    center: { lat: 17.6695, lng: 75.3390 },
    coords: [
      { lat: 17.6720, lng: 75.3360 },
      { lat: 17.6720, lng: 75.3425 },
      { lat: 17.6670, lng: 75.3425 },
      { lat: 17.6670, lng: 75.3360 },
    ],
  },
  'zone-5': { // Sector E: Station Depot
    center: { lat: 17.6865, lng: 75.3340 },
    coords: [
      { lat: 17.6890, lng: 75.3310 },
      { lat: 17.6890, lng: 75.3370 },
      { lat: 17.6840, lng: 75.3370 },
      { lat: 17.6840, lng: 75.3310 },
    ],
  },
};

// Facility Geo mapping
const FACILITY_GEO_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'fac-1': { lat: 17.6755, lng: 75.3232 },
  'fac-2': { lat: 17.6728, lng: 75.3195 },
  'fac-3': { lat: 17.6765, lng: 75.3255 },
  'fac-4': { lat: 17.6742, lng: 75.3205 },
  'fac-5': { lat: 17.6778, lng: 75.3282 },
  'fac-6': { lat: 17.6792, lng: 75.3292 },
  'fac-7': { lat: 17.6732, lng: 75.3178 },
  'fac-8': { lat: 17.6705, lng: 75.3382 },
};

// Route Polylines
const ROUTE_PALKHI_MARG_GEO = [
  { lat: 17.6865, lng: 75.3340 },
  { lat: 17.6820, lng: 75.3305 },
  { lat: 17.6795, lng: 75.3295 },
  { lat: 17.6762, lng: 75.3242 },
  { lat: 17.6738, lng: 75.3188 },
];

const ROUTE_AI_SAFE_BYPASS_GEO = [
  { lat: 17.6865, lng: 75.3340 },
  { lat: 17.6835, lng: 75.3385 },
  { lat: 17.6765, lng: 75.3360 },
  { lat: 17.6725, lng: 75.3275 },
  { lat: 17.6738, lng: 75.3188 },
];

// Custom tactical Map Style
const TACTICAL_DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#182234' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#182234' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ea1be' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0369a1' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

// Inner map layer component
const GoogleMapOverlays: React.FC<{
  zones: Zone[];
  incidents: Incident[];
  facilities: Facility[];
  routes: RouteOption[];
  layers: MapLayerState;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectFacility?: (facility: Facility) => void;
  showPilgrimLocation?: boolean;
}> = ({
  zones,
  incidents,
  facilities,
  routes,
  layers,
  selectedZoneId,
  onSelectZone,
  onSelectIncident,
  onSelectFacility,
  showPilgrimLocation,
}) => {
  const map = useMap();
  const [selectedItem, setSelectedItem] = useState<{
    type: 'zone' | 'incident' | 'facility';
    data: any;
    position: { lat: number; lng: number };
  } | null>(null);

  // Helper colors
  const getRiskColors = (level: Zone['riskLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return { fill: '#ef4444', stroke: '#dc2626', fillOpacity: 0.38 };
      case 'HIGH':
        return { fill: '#f97316', stroke: '#ea580c', fillOpacity: 0.28 };
      case 'MEDIUM':
        return { fill: '#eab308', stroke: '#ca8a04', fillOpacity: 0.22 };
      case 'LOW':
      default:
        return { fill: '#22c55e', stroke: '#16a34a', fillOpacity: 0.16 };
    }
  };

  // Draw zone polygons & polylines using standard Google Maps JavaScript API geometry objects
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    const mapPolygons: google.maps.Polygon[] = [];
    const mapPolylines: google.maps.Polyline[] = [];

    // Render Risk Zones
    if (layers.riskZones) {
      zones.forEach((zone) => {
        const boundsData = ZONE_GEO_BOUNDS[zone.id];
        if (!boundsData) return;

        const isSelected = zone.id === selectedZoneId;
        const colors = getRiskColors(zone.riskLevel);

        const polygon = new google.maps.Polygon({
          paths: boundsData.coords,
          strokeColor: isSelected ? '#ffffff' : colors.stroke,
          strokeOpacity: 0.9,
          strokeWeight: isSelected ? 3.5 : 2,
          fillColor: colors.fill,
          fillOpacity: colors.fillOpacity,
          map: map,
          zIndex: isSelected ? 10 : 2,
        });

        polygon.addListener('click', () => {
          onSelectZone(zone.id);
          setSelectedItem({
            type: 'zone',
            data: zone,
            position: boundsData.center,
          });
        });

        mapPolygons.push(polygon);
      });
    }

    // Render Routes
    if (layers.routes) {
      // Main Palkhi Marg
      const palkhiRoute = new google.maps.Polyline({
        path: ROUTE_PALKHI_MARG_GEO,
        geodesic: true,
        strokeColor: routes[0]?.status === 'BLOCKED' ? '#ef4444' : '#f59e0b',
        strokeOpacity: 0.85,
        strokeWeight: 6,
        map: map,
        zIndex: 5,
      });
      mapPolylines.push(palkhiRoute);

      // AI Recommended Safe Bypass 2
      if (layers.safeRoutes) {
        const safeBypass = new google.maps.Polyline({
          path: ROUTE_AI_SAFE_BYPASS_GEO,
          geodesic: true,
          strokeColor: '#10b981',
          strokeOpacity: 0.95,
          strokeWeight: 7,
          map: map,
          zIndex: 6,
        });
        mapPolylines.push(safeBypass);
      }
    }

    return () => {
      mapPolygons.forEach((poly) => poly.setMap(null));
      mapPolylines.forEach((line) => line.setMap(null));
    };
  }, [map, zones, routes, layers.riskZones, layers.routes, layers.safeRoutes, selectedZoneId]);

  return (
    <>
      {/* FACILITY MARKERS */}
      {facilities.map((facility) => {
        // Filter by layer toggle
        if (facility.type === 'WATER' && !layers.waterPoints) return null;
        if (facility.type === 'MEDICAL' && !layers.medicalCamps) return null;
        if (facility.type === 'POLICE_BOOTH' && !layers.policeBooths) return null;
        if (facility.type === 'TOILET' && !layers.toilets) return null;
        if (facility.type === 'SHELTER' && !layers.shelters) return null;
        if (facility.type === 'PRASAD_CAMP' && !layers.shelters) return null;

        const pos = FACILITY_GEO_LOCATIONS[facility.id] || {
          lat: PANDHARPUR_CENTER.lat + (facility.coordinates.y - 325) * 0.00008,
          lng: PANDHARPUR_CENTER.lng + (facility.coordinates.x - 500) * 0.00008,
        };

        const getFacilityMarkerIcon = (type: Facility['type']) => {
          switch (type) {
            case 'WATER':
              return '💧';
            case 'MEDICAL':
              return '➕';
            case 'POLICE_BOOTH':
              return '🛡️';
            case 'TOILET':
              return '🚻';
            case 'PRASAD_CAMP':
              return '🍽️';
            case 'SHELTER':
              return '⛺';
            case 'TEMPLE':
              return '🛕';
            case 'PARKING':
              return '🅿️';
            default:
              return '📍';
          }
        };

        const getFacilityBadgeColor = (type: Facility['type']) => {
          switch (type) {
            case 'WATER':
              return 'bg-sky-950 border-sky-400 text-sky-300 shadow-sky-500/20';
            case 'MEDICAL':
              return 'bg-rose-950 border-rose-500 text-rose-300 shadow-rose-500/20';
            case 'POLICE_BOOTH':
              return 'bg-blue-950 border-blue-500 text-blue-300 shadow-blue-500/20';
            case 'TOILET':
              return 'bg-teal-950 border-teal-400 text-teal-300 shadow-teal-500/20';
            case 'PRASAD_CAMP':
              return 'bg-orange-950 border-orange-500 text-orange-300 shadow-orange-500/20';
            case 'SHELTER':
              return 'bg-amber-950 border-amber-400 text-amber-300 shadow-amber-500/20';
            case 'TEMPLE':
              return 'bg-amber-900 border-yellow-400 text-yellow-300 shadow-yellow-500/20';
            case 'PARKING':
              return 'bg-indigo-950 border-indigo-400 text-indigo-300 shadow-indigo-500/20';
            default:
              return 'bg-slate-900 border-slate-400 text-slate-200';
          }
        };

        return (
          <AdvancedMarker
            key={facility.id}
            position={pos}
            title={`${facility.name} (${facility.type})`}
            onClick={() => {
              if (onSelectFacility) onSelectFacility(facility);
              setSelectedItem({
                type: 'facility',
                data: facility,
                position: pos,
              });
            }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform hover:scale-125 cursor-pointer text-xs ${getFacilityBadgeColor(
                facility.type
              )}`}
            >
              {getFacilityMarkerIcon(facility.type)}
            </div>
          </AdvancedMarker>
        );
      })}

      {/* INCIDENT MARKERS */}
      {layers.incidents &&
        incidents
          .filter((inc) => inc.status !== 'RESOLVED')
          .map((incident) => {
            const zoneBounds = ZONE_GEO_BOUNDS[incident.zoneId];
            const pos = zoneBounds
              ? {
                  lat: zoneBounds.center.lat + (Math.random() - 0.5) * 0.002,
                  lng: zoneBounds.center.lng + (Math.random() - 0.5) * 0.002,
                }
              : {
                  lat: PANDHARPUR_CENTER.lat + (incident.coordinates.y - 325) * 0.00008,
                  lng: PANDHARPUR_CENTER.lng + (incident.coordinates.x - 500) * 0.00008,
                };

            return (
              <AdvancedMarker
                key={incident.id}
                position={pos}
                title={`[ALERT] ${incident.title}`}
                onClick={() => {
                  if (onSelectIncident) onSelectIncident(incident);
                  setSelectedItem({
                    type: 'incident',
                    data: incident,
                    position: pos,
                  });
                }}
              >
                <div className="relative flex items-center justify-center cursor-pointer group">
                  <span className="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping" />
                  <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-red-600/40 group-hover:scale-125 transition-transform">
                    ⚠️
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

      {/* DYNAMIC UNITS LAYER: Police, Volunteers, Ambulances */}
      {layers.policeUnits && (
        <>
          <AdvancedMarker
            position={{ lat: 17.6748, lng: 75.3210 }}
            title="Police QRT Unit #1"
          >
            <div className="w-7 h-7 rounded-full bg-blue-900 border-2 border-blue-400 text-white flex items-center justify-center text-xs shadow-lg">
              🚓
            </div>
          </AdvancedMarker>
          <AdvancedMarker
            position={{ lat: 17.6780, lng: 75.3268 }}
            title="Police Patrol Unit #4"
          >
            <div className="w-7 h-7 rounded-full bg-blue-900 border-2 border-blue-400 text-white flex items-center justify-center text-xs shadow-lg">
              🚓
            </div>
          </AdvancedMarker>
        </>
      )}

      {layers.volunteers && (
        <>
          <AdvancedMarker
            position={{ lat: 17.6728, lng: 75.3198 }}
            title="Seva Volunteer Station #12"
          >
            <div className="w-7 h-7 rounded-full bg-amber-800 border-2 border-amber-400 text-white flex items-center justify-center text-xs shadow-lg">
              🦺
            </div>
          </AdvancedMarker>
          <AdvancedMarker
            position={{ lat: 17.6765, lng: 75.3250 }}
            title="Seva Volunteer Station #18"
          >
            <div className="w-7 h-7 rounded-full bg-amber-800 border-2 border-amber-400 text-white flex items-center justify-center text-xs shadow-lg">
              🦺
            </div>
          </AdvancedMarker>
        </>
      )}

      {layers.ambulances && (
        <>
          <AdvancedMarker
            position={{ lat: 17.6715, lng: 75.3235 }}
            title="NDRF Emergency Ambulance #1"
          >
            <div className="w-7 h-7 rounded-full bg-rose-900 border-2 border-rose-400 text-white flex items-center justify-center text-xs shadow-lg animate-bounce">
              🚑
            </div>
          </AdvancedMarker>
          <AdvancedMarker
            position={{ lat: 17.6845, lng: 75.3320 }}
            title="108 Emergency Ambulance #3"
          >
            <div className="w-7 h-7 rounded-full bg-rose-900 border-2 border-rose-400 text-white flex items-center justify-center text-xs shadow-lg animate-bounce">
              🚑
            </div>
          </AdvancedMarker>
        </>
      )}

      {/* PILGRIM LIVE LOCATION BEACON */}
      {showPilgrimLocation && (
        <AdvancedMarker
          position={{ lat: 17.6775, lng: 75.3265 }}
          title="Your Live Pilgrim Location (Near Palkhi Marg)"
        >
          <div className="flex flex-col items-center cursor-pointer">
            <div className="px-2 py-0.5 rounded-full bg-blue-900/90 text-blue-200 border border-blue-400 text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
              📍 You Are Here
            </div>
            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 rounded-full bg-blue-500/50 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* INTERACTIVE INFO WINDOW */}
      {selectedItem && (
        <InfoWindow
          position={selectedItem.position}
          onCloseClick={() => setSelectedItem(null)}
        >
          <div className="p-2 text-[#1A2B47] max-w-xs space-y-2 text-xs">
            {selectedItem.type === 'zone' && (
              <>
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-200">
                  <div className="font-extrabold text-sm text-[#1A2B47]">
                    {selectedItem.data.code}: {selectedItem.data.name}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${
                    selectedItem.data.riskLevel === 'CRITICAL' ? 'bg-red-600' :
                    selectedItem.data.riskLevel === 'HIGH' ? 'bg-orange-500' :
                    selectedItem.data.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-600'
                  }`}>
                    {selectedItem.data.riskLevel}
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Crowd Count:</span>
                    <span className="font-bold text-[#1A2B47]">
                      {selectedItem.data.crowdCount.toLocaleString()} Warkaris
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Density:</span>
                    <span className="font-bold text-[#1A2B47]">
                      {selectedItem.data.crowdDensity} p/m²
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Temperature:</span>
                    <span className="font-bold text-amber-600">
                      {selectedItem.data.weather.temp}°C ({selectedItem.data.weather.heatRisk})
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 italic pt-1">
                    {selectedItem.data.description}
                  </div>
                </div>
              </>
            )}

            {selectedItem.type === 'facility' && (
              <>
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-200">
                  <div className="font-extrabold text-sm text-[#1A2B47]">
                    {selectedItem.data.name}
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                    {selectedItem.data.type}
                  </span>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedItem.data.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capacity / Load:</span>
                    <span className="font-bold text-[#1A2B47]">
                      {selectedItem.data.capacity || 'Optimal'}
                    </span>
                  </div>
                  {selectedItem.data.waitTime && (
                    <div className="flex items-center justify-between">
                      <span>Wait Time:</span>
                      <span className="font-bold text-orange-600">
                        {selectedItem.data.waitTime}
                      </span>
                    </div>
                  )}
                  {selectedItem.data.contact && (
                    <div className="text-[11px] text-gray-500 pt-1 font-mono">
                      📞 {selectedItem.data.contact}
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedItem.type === 'incident' && (
              <>
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-200">
                  <div className="font-extrabold text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{selectedItem.data.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-800">
                    {selectedItem.data.severity}
                  </span>
                </div>
                <p className="text-gray-700 leading-tight">
                  {selectedItem.data.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>Status: <strong className="text-orange-600">{selectedItem.data.status}</strong></span>
                  <span>Assigned: {selectedItem.data.assignedUnits?.length || 0} Units</span>
                </div>
              </>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const GoogleGisMap: React.FC<GoogleGisMapProps> = ({
  zones,
  incidents,
  facilities,
  routes,
  layers,
  selectedZoneId,
  onSelectZone,
  onSelectIncident,
  onSelectFacility,
  role,
  showPilgrimLocation,
  apiKey,
  onError,
}) => {
  useEffect(() => {
    // Intercept Google Maps Authentication / Referrer Error
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps authentication failed (RefererNotAllowedMapError). Gracefully falling back to interactive map.');
      if (onError) {
        onError({
          message: 'Google Maps API Referer restriction detected (RefererNotAllowedMapError).',
          domain: window.location.origin,
        });
      }
      if (typeof prevAuthFailure === 'function') {
        try {
          prevAuthFailure();
        } catch {
          // Ignore
        }
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      if (
        event.message?.includes('RefererNotAllowedMapError') ||
        event.message?.includes('Google Maps JavaScript API') ||
        (event.filename && event.filename.includes('maps.googleapis.com'))
      ) {
        if (onError) {
          onError({
            message: 'Google Maps API Referer restriction detected (RefererNotAllowedMapError).',
            domain: window.location.origin,
          });
        }
      }
    };

    window.addEventListener('error', handleWindowError);

    return () => {
      window.removeEventListener('error', handleWindowError);
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, [onError]);

  return (
    <APIProvider apiKey={apiKey} solutionChannel="GMP_mcp_codeassist_v1_aistudio">
      <div className="w-full h-full relative">
        <Map
          defaultCenter={PANDHARPUR_CENTER}
          defaultZoom={15}
          mapId="varinet_gis_pandharpur"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          styles={TACTICAL_DARK_MAP_STYLE}
          className="w-full h-full"
        >
          <GoogleMapOverlays
            zones={zones}
            incidents={incidents}
            facilities={facilities}
            routes={routes}
            layers={layers}
            selectedZoneId={selectedZoneId}
            onSelectZone={onSelectZone}
            onSelectIncident={onSelectIncident}
            onSelectFacility={onSelectFacility}
            showPilgrimLocation={showPilgrimLocation}
          />
        </Map>
      </div>
    </APIProvider>
  );
};
