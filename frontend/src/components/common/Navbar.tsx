import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Compass, 
  Building2, 
  Bell, 
  Volume2, 
  VolumeX, 
  Radio, 
  Clock, 
  MapPin,
  Lock,
  Globe,
  Languages,
  Settings,
  Sparkles
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../features/auth/authContext';
import { useLanguage, SupportedLanguage } from '../../context/LanguageContext';
import { UserProfile } from '../../features/auth/components/UserProfile';
import { UserRole } from '../../features/auth/types';
import { ROLE_CONFIG } from '../../features/auth/authService';
import { Logo } from './Logo';
import { OfflineIndicator } from './OfflineIndicator';
import { NotificationDrawer } from './NotificationDrawer';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC = () => {
  const {
    notifications,
    audioAlertEnabled,
    setAudioAlertEnabled,
  } = useOperations();

  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  const toggleLanguage = () => {
    setLanguage(language === 'mr' ? 'en' : 'mr');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1A2B47] text-white border-b border-[#243b61] shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Left: Logo & Platform Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Logo size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight uppercase text-white leading-none">
                    VARI-Net <span className="font-light opacity-70">Command</span>
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40 uppercase tracking-wider">
                    {t('app.location', 'Pandharpur Wari')}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Role Status Pill (Authenticated Context) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs">
              <span className="text-white/60 font-medium text-[11px]">{t('nav.activeStation', 'Active Station')}:</span>
              {user ? (
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{ROLE_CONFIG[user.role]?.name || user.role}</span>
                </span>
              ) : (
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{t('nav.unauthenticated', 'Pilgrim Public Access')}</span>
                </span>
              )}
            </div>

            {/* Right Tools: Language Toggle, Weather Chip, Audio Siren, Notifications, Settings, UserProfile */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Simple Language Toggle: English <-> Marathi */}
              <div 
                id="header-language-toggle-container"
                className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/15 min-h-[48px] shadow-sm shrink-0 whitespace-nowrap"
                title={`Switch Language: English / मराठी (Current: ${language === 'mr' ? 'मराठी' : 'English'})`}
              >
                <button
                  type="button"
                  id="lang-toggle-en"
                  onClick={() => setLanguage('en')}
                  className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 duration-150 shrink-0 whitespace-nowrap select-none ${
                    language === 'en'
                      ? 'bg-[#F27D26] text-white shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                  aria-pressed={language === 'en'}
                  aria-label="Switch to English"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">English</span>
                </button>

                <button
                  type="button"
                  id="lang-toggle-mr"
                  onClick={() => setLanguage('mr')}
                  className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 duration-150 shrink-0 whitespace-nowrap select-none ${
                    language === 'mr'
                      ? 'bg-[#F27D26] text-white shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                  aria-pressed={language === 'mr'}
                  aria-label="मराठी मध्ये बदला"
                >
                  <Languages className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">मराठी</span>
                </button>
              </div>

              {/* Quick 1-Click Toggle for Compact Screens */}
              <button
                type="button"
                id="header-lang-quick-toggle-btn"
                onClick={toggleLanguage}
                className="hidden min-h-[48px] px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold items-center gap-1.5 active:scale-95 duration-150 cursor-pointer"
                title="Toggle English / मराठी"
              >
                <Languages className="w-4 h-4 text-[#F27D26]" />
                <span>{language === 'mr' ? 'EN' : 'मराठी'}</span>
              </button>

              {/* Network / Offline Indicator */}
              <div className="hidden lg:block">
                <OfflineIndicator compact={true} />
              </div>

              {/* Audio Alert Toggle (48x48px touch target) */}
              <button
                type="button"
                id="nav-audio-toggle-btn"
                onClick={() => setAudioAlertEnabled(!audioAlertEnabled)}
                className={`min-h-[48px] min-w-[48px] p-3 rounded-2xl border transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95 duration-150 ${
                  audioAlertEnabled
                    ? 'bg-[#F27D26]/25 border-[#F27D26]/50 text-[#F27D26] hover:bg-[#F27D26]/35 shadow-sm'
                    : 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20'
                }`}
                title={audioAlertEnabled ? t('nav.soundOn', 'Alert sirens enabled') : t('nav.soundOff', 'Alert sirens muted')}
              >
                {audioAlertEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* 2. Notification Bell Icon with Dynamic Unread Counter Badge (48x48px touch target) */}
              <button
                type="button"
                id="nav-notification-bell-btn"
                onClick={() => setShowNotificationDrawer(true)}
                className="relative min-h-[48px] min-w-[48px] p-3 rounded-2xl border border-white/15 text-white/90 hover:bg-white/15 transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95 duration-150"
                title={t('nav.notifications', 'Command Alerts & Notifications')}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span 
                    id="nav-notification-badge-counter"
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F27D26] text-white text-[11px] font-black flex items-center justify-center animate-pulse shadow-md border-2 border-[#1A2B47]"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* 4. Settings Gear Icon (48x48px touch target) */}
              <button
                type="button"
                id="nav-settings-gear-btn"
                onClick={() => setShowSettingsModal(true)}
                className="min-h-[48px] min-w-[48px] p-3 rounded-2xl border border-white/15 text-white/90 hover:bg-white/15 transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95 duration-150"
                title={t('nav.settings', 'Universal Profile & Settings')}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* User Profile Component / Quick Switch */}
              <UserProfile onOpenSettings={() => setShowSettingsModal(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer (Categorized, non-obscuring alert drawer) */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />

      {/* Universal Profile & Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
};
