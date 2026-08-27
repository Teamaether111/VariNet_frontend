import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Globe, 
  Vibrate, 
  RefreshCw, 
  Shield, 
  Users, 
  Footprints, 
  Landmark, 
  Check, 
  Radio, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../features/auth/authContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { ROLE_CONFIG } from '../../features/auth/authService';
import { UserRole } from '../../features/auth/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [hapticVibrationEnabled, setHapticVibrationEnabled] = useState<boolean>(true);
  const [autoSyncCacheEnabled, setAutoSyncCacheEnabled] = useState<boolean>(true);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  if (!isOpen) return null;

  // Active user details or guest pilgrim fallback
  const activeUser = user || {
    id: 'WARKARI-PUBLIC',
    name: 'Warkari Pilgrim (Citizen)',
    role: 'pilgrim' as UserRole,
  };

  const roleConfig = ROLE_CONFIG[activeUser.role] || ROLE_CONFIG.pilgrim;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'police':
        return Shield;
      case 'volunteer':
        return Users;
      case 'pilgrim':
        return Footprints;
      case 'temple-authority':
        return Landmark;
      default:
        return Footprints;
    }
  };

  const RoleIcon = getRoleIcon(activeUser.role);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  const handleSaveAll = () => {
    triggerSaveFeedback();
    setTimeout(() => onClose(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card (Clean Light Theme) */}
      <div 
        id="universal-settings-modal"
        className="relative bg-[#F9F8F6] text-[#1A2B47] w-full max-w-xl rounded-3xl border border-[#E5E5E5] shadow-2xl overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#1A2B47] text-white border-b border-[#243b61] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F27D26] text-white flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{t('settings.title', 'Universal Profile & Settings')}</span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 duration-150 text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* SECTION 1: User Profile Identity Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                {t('settings.profileTitle', 'Active User Profile')}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                {t('settings.status', 'Live Operational Session')}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              {/* Role-Specific Icon Avatar Container */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#1A2B47] to-[#243b61] text-[#F27D26] flex items-center justify-center shadow-lg border-2 border-[#1A2B47] shrink-0">
                <RoleIcon className="w-10 h-10 shrink-0 text-[#F27D26]" />
              </div>

              {/* Identity Details */}
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-[#1A2B47] truncate leading-tight">
                  {activeUser.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-[#1A2B47] text-white">
                    {activeUser.id}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm font-extrabold text-[#F27D26]">
                    {roleConfig.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Essential Minimal Settings */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-xs">
            <div className="divide-y divide-[#E5E5E5]">
              
              {/* Essential Item 1: Language Override */}
              <div className="py-3 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="font-bold text-[#1A2B47] flex items-center gap-2.5 text-sm whitespace-nowrap">
                  <Globe className="w-4 h-4 text-[#F27D26] shrink-0" />
                  <span>{t('settings.languageOverride', 'Language Override')}</span>
                </div>
                <div className="flex items-center bg-[#F9F8F6] p-1 rounded-xl border border-[#E5E5E5] text-xs font-bold shrink-0">
                  <button
                    type="button"
                    id="lang-btn-mr"
                    onClick={() => handleLanguageChange('mr')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      language === 'mr' ? 'bg-[#1A2B47] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    मराठी
                  </button>
                  <button
                    type="button"
                    id="lang-btn-hi"
                    onClick={() => handleLanguageChange('hi')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      language === 'hi' ? 'bg-[#1A2B47] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    type="button"
                    id="lang-btn-en"
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      language === 'en' ? 'bg-[#1A2B47] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Essential Item 2: Haptic Vibration Warnings */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="font-bold text-[#1A2B47] flex items-center gap-2.5 text-sm whitespace-nowrap">
                  <Vibrate className="w-4 h-4 text-[#F27D26] shrink-0" />
                  <span>{t('settings.vibration', 'Haptic Vibration Warnings')}</span>
                </div>
                <button
                  type="button"
                  id="toggle-haptic-vibration"
                  onClick={() => {
                    setHapticVibrationEnabled(!hapticVibrationEnabled);
                    if (!hapticVibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate([100, 50, 100]);
                    }
                    triggerSaveFeedback();
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    hapticVibrationEnabled ? 'bg-[#F27D26]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      hapticVibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Essential Item 3: Offline Cache Auto-Sync */}
              <div className="py-3 flex items-center justify-between gap-4">
                <div className="font-bold text-[#1A2B47] flex items-center gap-2.5 text-sm whitespace-nowrap">
                  <RefreshCw className="w-4 h-4 text-[#F27D26] shrink-0" />
                  <span>{t('settings.offlineSync', 'Offline Cache Auto-Sync')}</span>
                </div>
                <button
                  type="button"
                  id="toggle-offline-sync"
                  onClick={() => {
                    setAutoSyncCacheEnabled(!autoSyncCacheEnabled);
                    triggerSaveFeedback();
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    autoSyncCacheEnabled ? 'bg-[#F27D26]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      autoSyncCacheEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5E5E5] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {saveToast ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Preferences updated successfully!
              </span>
            ) : (
              <span className="font-mono text-[11px]">VARI-Net Engine v2.6 • Pandharpur Wari</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition-all cursor-pointer active:scale-95 duration-150"
            >
              {t('settings.close', 'Close')}
            </button>
            <button
              type="button"
              id="settings-save-btn"
              onClick={handleSaveAll}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1A2B47] hover:bg-[#243b61] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 duration-150"
            >
              <Check className="w-4 h-4 text-[#F27D26]" />
              <span>{t('settings.save', 'Save Preferences')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
