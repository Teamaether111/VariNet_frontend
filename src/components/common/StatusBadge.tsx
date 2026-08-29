import React from 'react';
import { IncidentStatus, IncidentPriority } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status?: IncidentStatus | 'ASSIGNED' | 'NAVIGATING' | 'IN_ACTION' | 'COMPLETED' | 'FLOWING' | 'RESTRICTED' | 'PAUSED';
  priority?: IncidentPriority;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  priority,
  size = 'md',
  className = '',
}) => {
  const { t } = useLanguage();

  const getBadgeStyle = () => {
    if (priority) {
      switch (priority) {
        case 'CRITICAL':
          return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
        case 'HIGH':
          return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
        case 'MEDIUM':
          return 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
        case 'LOW':
          return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
      }
    }

    if (status) {
      switch (status) {
        case 'NEW':
          return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-bold';
        case 'ACKNOWLEDGED':
          return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
        case 'IN_PROGRESS':
        case 'IN_ACTION':
        case 'NAVIGATING':
          return 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
        case 'RESOLVED':
        case 'COMPLETED':
        case 'FLOWING':
          return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
        case 'RESTRICTED':
        case 'PAUSED':
          return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getLabel = () => {
    if (priority) {
      switch (priority) {
        case 'CRITICAL':
          return `${t('common.critical', 'CRITICAL')} ${t('common.priority', 'PRIORITY')}`;
        case 'HIGH':
          return `${t('common.high', 'HIGH')} ${t('common.priority', 'PRIORITY')}`;
        case 'MEDIUM':
          return `${t('common.medium', 'MEDIUM')} ${t('common.priority', 'PRIORITY')}`;
        case 'LOW':
          return `${t('common.low', 'LOW')} ${t('common.priority', 'PRIORITY')}`;
      }
    }

    if (status) {
      switch (status) {
        case 'NEW':
          return t('common.active', 'NEW');
        case 'ACKNOWLEDGED':
          return t('incident.acknowledge', 'ACKNOWLEDGED');
        case 'IN_PROGRESS':
        case 'IN_ACTION':
          return t('common.inProgress', 'IN PROGRESS');
        case 'NAVIGATING':
          return t('volunteer.navigating', 'NAVIGATING');
        case 'ASSIGNED':
          return t('volunteer.assignedTasks', 'ASSIGNED');
        case 'RESOLVED':
        case 'COMPLETED':
          return t('common.resolved', 'RESOLVED');
        case 'FLOWING':
          return t('common.active', 'FLOWING');
        case 'RESTRICTED':
          return t('temple.pauseGate', 'RESTRICTED');
        case 'PAUSED':
          return t('common.critical', 'PAUSED');
        default:
          return status.replace('_', ' ');
      }
    }

    return '';
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide uppercase shrink-0 whitespace-nowrap select-none ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${getBadgeStyle()} ${className}`}
    >
      <span className="whitespace-nowrap">{getLabel()}</span>
    </span>
  );
};
