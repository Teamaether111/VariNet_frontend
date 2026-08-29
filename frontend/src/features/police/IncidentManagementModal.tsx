import React, { useState } from 'react';
import { Incident } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Shield, Ambulance, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface IncidentManagementModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignUnits: (id: string, units: string[]) => void;
  onResolve: (id: string) => void;
}

export const IncidentManagementModal: React.FC<IncidentManagementModalProps> = ({
  incident,
  isOpen,
  onClose,
  onAssignUnits,
  onResolve,
}) => {
  const { t } = useLanguage();
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  if (!incident) return null;

  const availableUnits = [
    { id: 'QRT-1', name: 'Quick Response Team Alpha (Sector C)', icon: Shield, type: 'police' },
    { id: 'AMB-04', name: 'Advanced Life Support Ambulance #4', icon: Ambulance, type: 'medical' },
    { id: 'VOL-HYDRATE', name: 'Volunteer Hydration Squad (10 personnel)', icon: Users, type: 'volunteer' },
    { id: 'TRAFFIC-B', name: 'Sector B Traffic Police Barricade Unit', icon: Shield, type: 'police' },
    { id: 'NDRF-ICU', name: 'NDRF Disaster Field Medical Team', icon: Ambulance, type: 'medical' },
  ];

  const toggleUnit = (name: string) => {
    setSelectedUnits(prev =>
      prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]
    );
  };

  const handleDispatch = () => {
    if (selectedUnits.length > 0) {
      onAssignUnits(incident.id, selectedUnits);
      setSelectedUnits([]);
      onClose();
    }
  };

  const handleResolveAndClose = () => {
    onResolve(incident.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('incident.title', 'Incident Triage')}: #${incident.id}`}
      subtitle={`${incident.zoneName} • ${incident.timestamp}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Incident Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              incident.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
            }`}>
              {incident.priority === 'CRITICAL' ? t('common.critical', 'CRITICAL') : t('common.high', 'HIGH')} {t('common.priority', 'PRIORITY')}
            </span>
            <span className="text-xs font-bold text-slate-800">{incident.title}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{incident.description}</p>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            📍 {t('report.groundLocation', 'Location')}: {incident.locationDetails}
          </div>
        </div>

        {/* Current Assigned */}
        {incident.assignedTo && (
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-950 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="font-bold">{t('incident.assigned', 'Currently Dispatched')}: </span>
              {incident.assignedTo}
            </div>
          </div>
        )}

        {/* Unit Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {t('incident.assign', 'Select Rapid Response Units to Dispatch')}
          </label>
          <div className="space-y-2">
            {availableUnits.map(unit => {
              const isSelected = selectedUnits.includes(unit.name);
              const Icon = unit.icon;
              return (
                <button
                  key={unit.id}
                  onClick={() => toggleUnit(unit.name)}
                  className={`min-h-[48px] w-full flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all cursor-pointer active:scale-95 duration-150 ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold">{unit.name}</span>
                  </div>
                  <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300'
                  }`}>
                    {isSelected && '✓'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls (Min 48px touch targets, >=16px gaps, active feedback) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={handleResolveAndClose}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold active:scale-95 duration-150 transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('incident.resolve', 'Mark Resolved & Close')}</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 duration-150 transition-all cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleDispatch}
              disabled={selectedUnits.length === 0}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#1A2B47] hover:bg-[#243b61] disabled:opacity-40 text-white text-xs font-bold active:scale-95 duration-150 transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>{t('incident.assign', 'Dispatch')} {selectedUnits.length > 0 ? `(${selectedUnits.length})` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
