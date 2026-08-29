import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { 
  HeartPulse, 
  ShieldAlert, 
  UserX, 
  AlertOctagon, 
  MapPin, 
  Send, 
  PhoneCall,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSos: (sosType: string, details?: string) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  onTriggerSos,
}) => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>('Medical');
  const [notes, setNotes] = useState('');
  const [isSent, setIsSent] = useState(false);

  const sosCategories = [
    {
      id: 'Medical',
      title: t('sos.medical', 'Medical Emergency / Dehydration'),
      desc: t('sos.medicalDesc', 'Heat stroke, chest pain, fainting, injury, IV saline required'),
      icon: HeartPulse,
      color: 'bg-rose-500 text-white',
      border: 'border-rose-300',
    },
    {
      id: 'Police',
      title: t('sos.police', 'Police Assistance / Crowd Crush'),
      desc: t('sos.policeDesc', 'Severe blockage, physical distress, theft, crowd surge pressure'),
      icon: ShieldAlert,
      color: 'bg-blue-600 text-white',
      border: 'border-blue-300',
    },
    {
      id: 'Lost Person',
      title: t('sos.lostPerson', 'Lost Person / Child Separated'),
      desc: t('sos.lostPersonDesc', 'Family member lost in crowd, broadcast PA announcement'),
      icon: UserX,
      color: 'bg-amber-600 text-white',
      border: 'border-amber-300',
    },
    {
      id: 'Other Emergency',
      title: t('sos.other', 'Other Critical Emergency'),
      desc: t('sos.otherDesc', 'Immediate NDRF / volunteer intervention needed'),
      icon: AlertOctagon,
      color: 'bg-slate-800 text-white',
      border: 'border-slate-300',
    },
  ];

  const handleSend = () => {
    onTriggerSos(selectedType, notes || undefined);
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🚨 ${t('sos.title', 'Emergency SOS Helpdesk')}`}
      subtitle={t('sos.subtitle', 'Immediate 1-Tap Signal Transmitted to Nearest Command & Medical Units')}
      maxWidth="md"
    >
      {isSent ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t('sos.dispatchedTitle', 'Emergency Distress Signal Dispatched!')}
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            {t('sos.dispatchedDesc', 'Your live GPS coordinates (17.6745° N, 75.3211° E) and distress beacon have been routed to Quick Response Team 4 and NDRF Ambulance #04. Stay where you are.')}
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-mono text-amber-900 max-w-xs mx-auto">
            📞 {t('sos.helpline', 'Direct Helpline')}: 112 / 108
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* GPS Location banner */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>GPS: Sector C (Palkhi Marg, Pillar 14)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Accuracy ~3m</span>
          </div>

          {/* SOS Category Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('sos.selectType', 'Select Emergency Assistance Type')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sosCategories.map((cat) => {
                const isSelected = selectedType === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedType(cat.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/40 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-snug truncate">
                        {cat.title}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1 line-clamp-1">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('sos.additionalDetails', 'Additional Details (Optional)')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('sos.placeholder', 'e.g. Elderly person unconscious, wearing white kurta...')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Submit Distress Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              id="send-sos-signal-btn"
              onClick={handleSend}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t('sos.sendSignal', 'SEND SOS DISPATCH SIGNAL')}</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
