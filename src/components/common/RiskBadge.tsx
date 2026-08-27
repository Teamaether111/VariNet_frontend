import React from 'react';
import { RiskLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showPulse = true,
  className = '',
}) => {
  const { t } = useLanguage();

  const getColors = () => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          pulse: 'bg-emerald-400',
          label: t('risk.low', 'LOW RISK'),
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          pulse: 'bg-amber-400',
          label: t('risk.medium', 'MEDIUM RISK'),
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-orange-950 border-orange-300',
          dot: 'bg-orange-600',
          pulse: 'bg-orange-500',
          label: t('risk.high', 'HIGH RISK'),
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-950 border-rose-300',
          dot: 'bg-rose-600',
          pulse: 'bg-rose-500',
          label: t('risk.critical', 'CRITICAL'),
        };
    }
  };

  const colors = getColors();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wide',
  };

  return (
    <span
      id={`risk-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs shrink-0 whitespace-nowrap select-none ${colors.bg} ${sizeClasses[size]} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {showPulse && (level === 'HIGH' || level === 'CRITICAL') && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.pulse}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.dot}`} />
      </span>
      <span className="whitespace-nowrap">{colors.label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[11px] ml-0.5 whitespace-nowrap">({score}/100)</span>
      )}
    </span>
  );
};
