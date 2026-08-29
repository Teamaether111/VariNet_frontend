import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { IncidentType } from '../../types';
import { 
  Camera, 
  Mic, 
  MapPin, 
  AlertTriangle, 
  Send, 
  Check, 
  Sparkles,
  Flame,
  Droplet,
  Users,
  HeartPulse
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: IncidentType;
    title: string;
    description: string;
    zoneId: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    locationDetails: string;
    photoUrl?: string;
    audioRecorded?: boolean;
  }) => void;
  defaultZoneId?: string;
}

export const QuickReportModal: React.FC<QuickReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultZoneId = 'sector-c',
}) => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<IncidentType>('HEAT_EXHAUSTION');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [description, setDescription] = useState('');
  const [locationDetails, setLocationDetails] = useState('Palkhi Marg, Pillar 14 near Shivaji Chowk');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  const incidentTypes: Array<{ type: IncidentType; label: string; icon: string; defaultPriority: 'HIGH' | 'CRITICAL' | 'MEDIUM' }> = [
    { type: 'HEAT_EXHAUSTION', label: t('report.heatExhaustion', 'Heat Exhaustion / Dehydration'), icon: '☀️', defaultPriority: 'HIGH' },
    { type: 'CROWD_BOTTLENECK', label: t('report.crowdBottleneck', 'Crowd Bottleneck / Stoppage'), icon: '👥', defaultPriority: 'HIGH' },
    { type: 'MEDICAL_EMERGENCY', label: t('report.medicalEmergency', 'Acute Medical Emergency'), icon: '🚑', defaultPriority: 'CRITICAL' },
    { type: 'WATER_SHORTAGE', label: t('report.waterShortage', 'Water Refill Empty'), icon: '💧', defaultPriority: 'MEDIUM' },
    { type: 'LOST_PERSON', label: t('report.lostPerson', 'Lost Pilgrim / Child Separated'), icon: '🔍', defaultPriority: 'MEDIUM' },
    { type: 'STAMPEDE_RISK', label: t('report.stampedeRisk', 'Crush / Surge Pressure'), icon: '⚠️', defaultPriority: 'CRITICAL' },
  ];

  const handleSelectType = (type: IncidentType, defPriority: 'HIGH' | 'CRITICAL' | 'MEDIUM') => {
    setSelectedType(type);
    setPriority(defPriority);
  };

  const handleRecordAudioToggle = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setTimeout(() => {
        setIsRecordingAudio(false);
        setHasAudio(true);
      }, 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = incidentTypes.find(t => t.type === selectedType);
    onSubmit({
      type: selectedType,
      title: `${typeObj?.label || 'Field Alert'}`,
      description: description || `Reported by volunteer at ${locationDetails}. Rapid assistance requested.`,
      zoneId: defaultZoneId,
      priority,
      locationDetails,
      photoUrl: hasPhoto ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60' : undefined,
      audioRecorded: hasAudio,
    });
    // Reset
    setDescription('');
    setHasPhoto(false);
    setHasAudio(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('report.title', 'Rapid Field Incident Report')}
      subtitle={t('report.subtitle', 'Fast 10-second triage for field volunteers')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. Incident Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. {t('report.selectType', 'Select Incident Type')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {incidentTypes.map(({ type, label, icon, defaultPriority }) => {
              const isSelected = selectedType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleSelectType(type, defaultPriority)}
                  className={`min-h-[48px] p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer active:scale-95 duration-150 ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base shrink-0">{icon}</span>
                  <span className="text-xs leading-snug">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Photo & Voice Media Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. {t('report.evidence', 'Ground Evidence (Photo / Voice Note)')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`min-h-[48px] p-3 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 duration-150 ${
                hasPhoto
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4 text-slate-600" />
              <span>{hasPhoto ? `✓ ${t('report.photoAttached', 'Photo Attached')}` : t('report.capturePhoto', 'Capture Photo')}</span>
            </button>

            <button
              type="button"
              onClick={handleRecordAudioToggle}
              className={`min-h-[48px] p-3 rounded-xl border text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 duration-150 ${
                isRecordingAudio
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse font-bold'
                  : hasAudio
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Mic className="w-4 h-4 text-slate-600" />
              <span>
                {isRecordingAudio ? t('report.recording', 'Recording Voice...') : hasAudio ? `✓ ${t('report.voiceNote', 'Voice Note')} (0:12)` : t('report.recordVoice', 'Record Voice')}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Location Details */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            3. {t('report.groundLocation', 'Ground Location')}
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-orange-600 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={locationDetails}
              onChange={e => setLocationDetails(e.target.value)}
              placeholder={t('report.locationPlaceholder', 'e.g. Shivaji Chowk, Pillar 14 near water tanker')}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* 4. Short Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            4. {t('report.shortDesc', 'Short Description')}
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('report.descPlaceholder', 'Brief situation: 3 senior citizens need oral rehydration salts, crowd stalling...')}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Action Buttons (Min 48px touch targets, >=16px gaps, active feedback) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 duration-150 transition-all cursor-pointer"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            className="min-h-[48px] flex items-center justify-center gap-2.5 px-6 py-2.5 bg-[#F27D26] hover:bg-[#d96614] text-white rounded-xl text-xs md:text-sm font-bold shadow-md shadow-orange-600/20 active:scale-95 duration-150 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t('report.submit', 'Transmit Incident Report')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
