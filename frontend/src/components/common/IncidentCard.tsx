import React from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  Users, 
  Mic, 
  Camera 
} from 'lucide-react';
import { Incident } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

interface IncidentCardProps {
  incident: Incident;
  onAcknowledge?: (id: string) => void;
  onAssign?: (id: string) => void;
  onResolve?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onAcknowledge,
  onAssign,
  onResolve,
  showActions = true,
  className = '',
}) => {
  const { t } = useLanguage();
  const isCritical = incident.priority === 'CRITICAL';

  return (
    <div
      id={`incident-card-${incident.id}`}
      className={`bg-white rounded-2xl border ${
        isCritical ? 'border-red-300 shadow-sm shadow-red-100' : 'border-[#E5E5E5] shadow-xs'
      } p-5 space-y-3.5 transition-all hover:border-gray-400 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isCritical ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-[#F27D26] border border-orange-200'
          }`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-gray-500 font-bold">
                #{incident.id}
              </span>
              <StatusBadge priority={incident.priority} size="sm" />
              <StatusBadge status={incident.status} size="sm" />
            </div>
            <h4 className="text-sm font-bold text-[#1A2B47] mt-1 leading-snug">
              {incident.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Location & Metadata */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
          <span className="truncate">{incident.locationDetails}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate justify-end">
          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{incident.timestamp}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{incident.reportedBy}</span>
        </div>
        {incident.assignedTo && (
          <div className="flex items-center gap-1.5 truncate justify-end text-blue-700 font-medium">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{incident.assignedTo}</span>
          </div>
        )}
      </div>

      {/* Media tags if present */}
      {(incident.evidenceUrl || incident.audioNote) && (
        <div className="flex items-center gap-2 pt-1">
          {incident.evidenceUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-medium text-gray-700">
              <Camera className="w-3 h-3 text-gray-500" /> {t('incident.photo', 'Photo attached')}
            </span>
          )}
          {incident.audioNote && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 text-[10px] font-medium text-sky-800 border border-sky-200">
              <Mic className="w-3 h-3 text-sky-600" /> {incident.audioNote}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons for Command/Police (Minimum 44px touch targets, >=16px gaps) */}
      {showActions && incident.status !== 'RESOLVED' && (
        <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-end gap-3 flex-wrap">
          {incident.status === 'NEW' && onAcknowledge && (
            <button
              id={`btn-ack-incident-${incident.id}`}
              onClick={() => onAcknowledge(incident.id)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 duration-150 border border-orange-200 text-orange-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap w-fit"
              style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
            >
              <CheckCircle className="w-4 h-4 text-[#F27D26] shrink-0" />
              <span className="whitespace-nowrap">{t('incident.acknowledge', 'Acknowledge')}</span>
            </button>
          )}
          {onAssign && (
            <button
              id={`btn-assign-incident-${incident.id}`}
              onClick={() => onAssign(incident.id)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1A2B47] hover:bg-[#243b61] active:scale-95 duration-150 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap w-fit"
              style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t('incident.assign', 'Assign Units')}</span>
            </button>
          )}
          {onResolve && (
            <button
              id={`btn-resolve-incident-${incident.id}`}
              onClick={() => onResolve(incident.id)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 duration-150 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap w-fit"
              style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">{t('incident.resolve', 'Close & Resolve')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
