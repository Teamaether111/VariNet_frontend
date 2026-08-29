import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Users, 
  Footprints, 
  Landmark, 
  ChevronDown,
  Settings,
  Radio
} from 'lucide-react';
import { useAuth } from '../authContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ROLE_CONFIG } from '../authService';
import { UserRole } from '../types';

interface UserProfileProps {
  onOpenSettings?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onOpenSettings }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayUser = user || {
    id: 'WARKARI',
    name: 'Warkari Pilgrim',
    role: 'pilgrim' as UserRole,
  };

  const roleConfig = ROLE_CONFIG[displayUser.role] || ROLE_CONFIG.pilgrim;

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
        return UserIcon;
    }
  };

  const RoleIcon = getRoleIcon(displayUser.role);

  const handleLogout = async () => {
    setIsOpen(false);
    if (user) {
      await logout();
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button in Navbar (48px min height, tactile feedback) */}
      <button
        type="button"
        id="user-profile-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3.5 py-2 min-h-[48px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-left cursor-pointer group shrink-0 active:scale-95 duration-150 shadow-xs"
      >
        {/* Role Specific Icon (Min 24x24px icon in branded Navy Blue / Orange container) */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F27D26] to-[#d96615] text-white flex items-center justify-center shadow-md border border-white/30">
            <RoleIcon className="w-6 h-6 shrink-0" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1A2B47]" />
        </div>

        {/* User Details (Desktop) */}
        <div className="hidden md:block">
          <div className="text-sm font-black text-white leading-tight flex items-center gap-1">
            <span className="truncate max-w-[130px]">{displayUser.name}</span>
          </div>
          <div className="text-xs text-white/80 font-mono flex items-center gap-1.5 mt-0.5">
            <span className="text-orange-300 font-bold">{displayUser.id}</span>
            <span className="text-white/50">•</span>
            <span className="truncate max-w-[90px] font-semibold text-white/90">{roleConfig.name}</span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Profile Dropdown Popover */}
      {isOpen && (
        <div
          id="user-profile-dropdown"
          className="absolute right-0 top-14 z-50 w-80 bg-white rounded-3xl border border-[#E5E5E5] shadow-2xl p-5 text-[#1A2B47] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header with Role Symbol Icon & Details */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#E5E5E5]">
            <div className="w-12 h-12 rounded-2xl bg-[#1A2B47] text-[#F27D26] flex items-center justify-center shadow-md border border-[#243b61] shrink-0">
              <RoleIcon className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-base text-[#1A2B47] truncate leading-tight">
                {displayUser.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#1A2B47]/10 text-[#1A2B47] font-mono">
                  {displayUser.id}
                </span>
                <span className="text-xs text-gray-500 font-medium">{roleConfig.name}</span>
              </div>
            </div>
          </div>

          {/* Role Badge & Details Bento Block */}
          <div className="my-4 p-3.5 rounded-2xl bg-[#F9F8F6] border border-[#E5E5E5] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">
                {t('settings.role', 'Assigned Role')}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
                {user ? t('settings.status', 'Active Session') : t('nav.unauthenticated', 'Public Access')}
              </span>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="p-2 rounded-xl bg-[#1A2B47] text-[#F27D26] shrink-0">
                <RoleIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-[#1A2B47] truncate">
                  {roleConfig.name}
                </div>
                <div className="text-xs text-gray-500 font-medium truncate">
                  {roleConfig.description}
                </div>
              </div>
            </div>
          </div>

          {/* Settings and Logout Actions (48px touch targets, >=16px gaps) */}
          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-3">
            {onOpenSettings && (
              <button
                type="button"
                id="profile-open-settings-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 duration-150"
              >
                <Settings className="w-4 h-4 text-[#F27D26]" />
                <span>{t('nav.settings', 'Preferences & Languages')}</span>
              </button>
            )}

            <button
              type="button"
              id="auth-logout-btn"
              onClick={handleLogout}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer border border-red-200 active:scale-95 duration-150"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>{user ? t('nav.logout', 'Logout & End Session') : t('nav.switchRole', 'Sign in as Officer')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
