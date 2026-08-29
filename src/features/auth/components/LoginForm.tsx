import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Compass, 
  Building2, 
  Lock, 
  User as UserIcon, 
  BadgeCheck, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../authContext';
import { UserRole } from '../types';
import { authService, ROLE_CONFIG } from '../authService';
import { useLanguage } from '../../../context/LanguageContext';

export const LoginForm: React.FC = () => {
  const { login, error: authError, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('police');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const roleOptions: Array<{
    id: UserRole;
    label: string;
    icon: any;
    desc: string;
    isPublic?: boolean;
  }> = [
    {
      id: 'police',
      label: t('role.police', 'Police Command'),
      icon: Shield,
      desc: t('role.police.desc', 'Incident triage & dispatch command'),
    },
    {
      id: 'volunteer',
      label: t('role.volunteer', 'Volunteer Field Ops'),
      icon: Users,
      desc: t('role.volunteer.desc', 'Crowd assistance & field missions'),
    },
    {
      id: 'pilgrim',
      label: t('role.pilgrim', 'Pilgrim App'),
      icon: Compass,
      desc: t('role.pilgrim.desc', 'Live safe routes & SOS beacon (No Login)'),
      isPublic: true,
    },
    {
      id: 'temple-authority',
      label: t('role.temple', 'Temple Authority'),
      icon: Building2,
      desc: t('role.temple.desc', 'Sanctum queue & holding mandaps'),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // If Pilgrim role is selected, instant direct access bypasses credentials
    if (selectedRole === 'pilgrim') {
      navigate('/pilgrim', { replace: true });
      return;
    }

    if (!name.trim()) {
      setLocalError('Please enter your Full Name.');
      return;
    }
    if (!userId.trim()) {
      setLocalError('Please enter your User ID or Badge Number.');
      return;
    }
    if (!pin.trim()) {
      setLocalError('Please enter your Password or Security PIN.');
      return;
    }
    if (pin.trim().length < 3) {
      setLocalError('Password or PIN must be at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({
        name: name.trim(),
        userId: userId.trim(),
        pin: pin.trim(),
        role: selectedRole,
      });

      const destination = authService.getRolePath(user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setLocalError(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLocalError(null);
    clearError();

    // If user clicks directly on Pilgrim, offer instant 1-click jump or switch
    if (role === 'pilgrim') {
      navigate('/pilgrim', { replace: true });
    }
  };

  const handleDirectPilgrimAccess = () => {
    navigate('/pilgrim', { replace: true });
  };

  const displayError = localError || authError;

  return (
    <form
      id="varinet-login-form"
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      {/* Direct Pilgrim Bypass Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs text-emerald-950 truncate">
              {t('common.instantPilgrimAccess', 'Direct Pilgrim Access (No Login Required)')}
            </div>
            <p className="text-[11px] text-emerald-800 truncate">
              {t('role.pilgrim.desc', 'View live routes, shaded corridors, water points & SOS')}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="direct-pilgrim-btn"
          onClick={handleDirectPilgrimAccess}
          className="min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shrink-0 transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 duration-150 whitespace-nowrap"
        >
          <span>Open Pilgrim App</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Role Selector Bento Grid */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2B47] whitespace-nowrap">
          1. Select Your Operational Role
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
          {roleOptions.map(({ id, label, icon: Icon, desc, isPublic }) => {
            const isSelected = selectedRole === id;
            return (
              <button
                type="button"
                key={id}
                id={`role-select-${id}`}
                onClick={() => handleRoleSelect(id)}
                className={`min-h-[56px] p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-95 duration-150 w-full min-w-0 sm:min-w-fit ${
                  isSelected
                    ? 'bg-white border-[#F27D26] ring-2 ring-[#F27D26]/20 shadow-md shadow-[#F27D26]/10'
                    : 'bg-white/80 border-[#E5E5E5] hover:border-[#1A2B47]/30 hover:bg-white text-gray-700'
                }`}
                style={{ minWidth: 'fit-content' }}
              >
                <div className="flex items-center justify-between mb-2.5 gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#F27D26] text-white shadow-sm'
                        : isPublic
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  {isPublic ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 whitespace-nowrap">
                      Public
                    </span>
                  ) : isSelected ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F27D26] animate-pulse shrink-0" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-[#1A2B47] leading-tight whitespace-nowrap" style={{ whiteSpace: 'nowrap' }}>
                    {label}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Fields Container (For Operational Roles: Police, Volunteer, Temple) */}
      {selectedRole !== 'pilgrim' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A2B47] whitespace-nowrap">
              2. Enter Identity Credentials
            </label>
            <span className="text-[10px] text-gray-400 font-mono shrink-0 whitespace-nowrap">
              {ROLE_CONFIG[selectedRole].name} Gateway
            </span>
          </div>

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-name"
              className="block text-xs font-bold text-gray-700 whitespace-nowrap"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="login-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="e.g. Inspector Deshmukh / Ramesh Shinde"
                className="min-h-[48px] w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1A2B47] placeholder-gray-400 focus:outline-none focus:border-[#F27D26] focus:ring-2 focus:ring-[#F27D26]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* User ID Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-userid"
              className="block text-xs font-bold text-gray-700 whitespace-nowrap"
            >
              User ID / Badge Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <input
                id="login-userid"
                name="userId"
                type="text"
                required
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder={`e.g. ${ROLE_CONFIG[selectedRole].defaultPrefix}-1024`}
                className="min-h-[48px] w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1A2B47] placeholder-gray-400 focus:outline-none focus:border-[#F27D26] focus:ring-2 focus:ring-[#F27D26]/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password / PIN Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-pin"
              className="block text-xs font-bold text-gray-700 whitespace-nowrap"
            >
              Password / PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-pin"
                name="pin"
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Enter password or 4-digit PIN"
                className="min-h-[48px] w-full pl-10 pr-12 py-3 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-[#1A2B47] placeholder-gray-400 focus:outline-none focus:border-[#F27D26] focus:ring-2 focus:ring-[#F27D26]/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="min-h-[48px] min-w-[48px] absolute inset-y-0 right-0 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {displayError && (
        <div
          id="login-error-banner"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-shake"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-bold">Login Error: </span>
            <span>{displayError}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        id="login-submit-btn"
        type="submit"
        disabled={isSubmitting}
        className="min-h-[48px] w-full py-3.5 px-4 rounded-xl bg-[#1A2B47] hover:bg-[#243b61] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-lg active:scale-95 duration-150 whitespace-nowrap"
        style={{ whiteSpace: 'nowrap' }}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
            <span className="whitespace-nowrap">Authenticating Identity...</span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">{selectedRole === 'pilgrim' ? 'Direct Entry to Pilgrim Dashboard' : `Sign In to ${ROLE_CONFIG[selectedRole].name}`}</span>
            <ArrowRight className="w-4 h-4 text-[#F27D26] shrink-0" />
          </>
        )}
      </button>
    </form>
  );
};
