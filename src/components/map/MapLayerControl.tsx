import React, { useState } from 'react';
import { Layers, Check, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { MapLayerState } from '../../types';

interface MapLayerControlProps {
  layers: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState) => void;
  onToggleCategory?: (category: 'static' | 'dynamic' | 'ai') => void;
  className?: string;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  layers,
  onToggleLayer,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const staticLayerKeys: Array<{ key: keyof MapLayerState; label: string; icon: string }> = [
    { key: 'routes', label: 'Palkhi Spine Routes', icon: '🛣️' },
    { key: 'alternateRoutes', label: 'Alternate Corridors', icon: '🔀' },
    { key: 'waterPoints', label: 'Drinking Water Points', icon: '💧' },
    { key: 'medicalCamps', label: 'Medical & ICU Camps', icon: '➕' },
    { key: 'policeBooths', label: 'Police & Security Posts', icon: '🛡️' },
    { key: 'shelters', label: 'Food & Prasadalaya Camps', icon: '🍽️' },
    { key: 'toilets', label: 'Sanitation & Restrooms', icon: '🚻' },
    { key: 'parking', label: 'Depot & Parking Hubs', icon: '🅿️' },
  ];

  const dynamicLayerKeys: Array<{ key: keyof MapLayerState; label: string; icon: string }> = [
    { key: 'crowdHeatmap', label: 'Live Crowd Density', icon: '👥' },
    { key: 'incidents', label: 'Active Incidents', icon: '🚨' },
    { key: 'volunteers', label: 'Volunteer Personnel', icon: '🦺' },
    { key: 'policeUnits', label: 'Police Patrols', icon: '🚓' },
    { key: 'ambulances', label: 'Ambulance Units', icon: '🚑' },
    { key: 'weatherOverlay', label: 'Microclimate Weather', icon: '☀️' },
  ];

  const aiLayerKeys: Array<{ key: keyof MapLayerState; label: string; icon: string }> = [
    { key: 'riskZones', label: 'AI Risk Level Polygons', icon: '🛡️' },
    { key: 'safeRoutes', label: 'AI Recommended Safe Route', icon: '✨' },
    { key: 'predictedCongestion', label: 'Predicted Congestion (Next 1hr)', icon: '📈' },
    { key: 'recommendedInterventions', label: 'Intervention Target Zones', icon: '🎯' },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        id="map-layer-control-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[48px] flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#1A2B47] rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 duration-150 text-xs font-bold transition-all cursor-pointer"
      >
        <Layers className="w-4 h-4 text-[#F27D26]" />
        <span>GIS Layers</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {isOpen && (
        <div
          id="map-layer-dropdown-panel"
          className="absolute right-0 top-11 z-50 w-72 bg-white text-[#1A2B47] rounded-2xl border border-[#E5E5E5] shadow-2xl p-3 text-xs max-h-96 overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] mb-2">
            <span className="font-bold text-[#1A2B47] uppercase tracking-wider text-[11px]">Map Layer Visibility</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-[11px]"
            >
              Close
            </button>
          </div>

          {/* AI Layers */}
          <div className="mb-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#F27D26] bg-orange-50 px-2 py-1 rounded-lg mb-1.5 flex items-center justify-between border border-orange-200">
              <span>AI Decision Layers</span>
              <span className="text-[9px] bg-[#F27D26]/20 px-1 rounded font-bold">Priority</span>
            </div>
            <div className="space-y-1">
              {aiLayerKeys.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    layers[key] ? 'bg-orange-50 text-orange-950 font-medium' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </span>
                  {layers[key] ? <Check className="w-3.5 h-3.5 text-[#F27D26] shrink-0 font-bold" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Layers */}
          <div className="mb-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-1 rounded-lg mb-1.5 border border-sky-200">
              Dynamic Telemetry
            </div>
            <div className="space-y-1">
              {dynamicLayerKeys.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    layers[key] ? 'bg-sky-50 text-sky-950 font-medium' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </span>
                  {layers[key] ? <Check className="w-3.5 h-3.5 text-sky-700 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Static Infrastructure Layers */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-700 bg-gray-100 px-2 py-1 rounded-lg mb-1.5">
              Infrastructure & Facilities
            </div>
            <div className="space-y-1">
              {staticLayerKeys.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => onToggleLayer(key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    layers[key] ? 'bg-gray-100 text-[#1A2B47] font-medium' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </span>
                  {layers[key] ? <Check className="w-3.5 h-3.5 text-gray-700 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
