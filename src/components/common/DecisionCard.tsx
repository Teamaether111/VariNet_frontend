import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Ambulance, 
  Route, 
  Droplet, 
  Clock, 
  ChevronRight, 
  XCircle 
} from 'lucide-react';
import { AIRecommendation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ImpactMetricsChart } from './ImpactMetricsChart';

interface DecisionCardProps {
  recommendation: AIRecommendation;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving?: boolean;
  className?: string;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  recommendation,
  onApprove,
  onReject,
  isApproving = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const isApproved = recommendation.status === 'APPROVED' || recommendation.status === 'COMPLETED';

  return (
    <div
      id="next-best-action-card"
      className={`relative rounded-3xl p-6 sm:p-8 bg-white border ${
        isApproved ? 'border-emerald-300 shadow-md shadow-emerald-50' : 'border-[#E5E5E5] shadow-md'
      } transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Bento Header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-black tracking-wider uppercase border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('decision.approved', 'AI Action Executed & Enforced')}</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[#E65100] text-xs sm:text-sm font-black tracking-wider uppercase border border-orange-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E65100]" />
                <span>{t('decision.title', 'AI Next Best Action')}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono bg-[#F8F9FA] border border-[#E5E5E5] px-3.5 py-1.5 rounded-full text-gray-600 font-bold">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{recommendation.timestamp}</span>
          </div>
        </div>

        {/* Primary Action Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#1A365D] leading-tight mb-5 tracking-tight">
          {recommendation.recommendedAction}
        </h2>

        {/* Bento Stats Grid: Target Zone, Confidence, Impact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-[#F8F9FA] border border-[#E5E5E5] p-4 sm:p-5 rounded-2xl">
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              {t('temple.activeZone', 'Target Zone')}
            </p>
            <p className="text-lg sm:text-xl font-black text-[#1A365D] mt-1">
              {recommendation.targetZone}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              Est. {recommendation.estimatedResolutionMinutes} {t('pilgrim.minutes', 'mins')}
            </p>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E5E5] p-4 sm:p-5 rounded-2xl">
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              {t('decision.confidence', 'AI Confidence')}
            </p>
            <p className="text-3xl sm:text-4xl font-black text-[#1A365D] mt-1 font-mono tracking-tight">
              {recommendation.confidence}%
            </p>
            <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Ground Model
            </p>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E5E5] p-4 sm:p-5 rounded-2xl">
            <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              {t('incident.resolve', 'Est. Harm Prevented')}
            </p>
            <p className="text-lg sm:text-xl font-black text-[#1A365D] mt-1">
              {recommendation.preventedIncidentEstimate}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              {recommendation.expectedImpact}
            </p>
          </div>
        </div>

        {/* Impact Metrics: Recharts Density Reduction Visualization */}
        <div className="mb-5">
          <ImpactMetricsChart isApproved={isApproved} theme="light" />
        </div>

        {/* Coordinated Resource Dispatch Line */}
        {recommendation.suggestedResources && (
          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[#E5E5E5] flex items-center justify-between flex-wrap gap-3 text-sm text-gray-700 mb-5">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-[#1A365D]" />
              <span className="font-bold text-[#1A365D]">{t('pilgrim.safeCorridor', 'Bypass 2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E65100]" />
              <span className="font-bold text-[#1A365D]">+18 {t('volunteer.title', 'Volunteers')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-[#1A365D]">2 {t('map.ambulances', 'ALS Ambulances')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-sky-600" />
              <span className="font-bold text-[#1A365D]">3 {t('pilgrim.waterPoints', 'ORS Tankers')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Human-In-The-Loop Action CTA */}
      <div className="pt-2">
        {isApproved ? (
          <div 
            className="w-full bg-emerald-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-center justify-center gap-2.5 text-emerald-950 text-sm sm:text-base font-bold whitespace-nowrap overflow-visible"
            style={{ whiteSpace: 'nowrap', textOverflow: 'clip' }}
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap overflow-visible" style={{ whiteSpace: 'nowrap', textOverflow: 'clip' }}>
              {t('decision.approved', 'Intervention Approved')} ({recommendation.approvedAt || 'Active'})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <button
              id="reject-action-btn"
              onClick={() => onReject(recommendation.id)}
              className="min-h-[52px] px-6 py-4 bg-[#F8F9FA] hover:bg-gray-100 active:scale-95 duration-150 border border-[#E5E5E5] text-gray-700 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap overflow-visible"
              style={{ width: 'max-content', minWidth: 'max-content', flexShrink: 0, whiteSpace: 'nowrap', textOverflow: 'clip' }}
            >
              <XCircle className="w-5 h-5 text-gray-500 shrink-0" />
              <span className="whitespace-nowrap overflow-visible" style={{ whiteSpace: 'nowrap', textOverflow: 'clip' }}>{t('decision.dismiss', 'Decline')}</span>
            </button>
            <button
              id="approve-action-btn"
              onClick={() => onApprove(recommendation.id)}
              disabled={isApproving}
              className="flex-1 min-h-[52px] bg-[#1A365D] hover:bg-[#132845] active:scale-95 duration-150 text-white font-black py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all uppercase tracking-widest text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 whitespace-nowrap overflow-visible"
              style={{ minWidth: 'max-content', flexShrink: 0, whiteSpace: 'nowrap', textOverflow: 'clip' }}
            >
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap overflow-visible" style={{ whiteSpace: 'nowrap', textOverflow: 'clip' }}>{t('decision.approve', 'Approve & Execute')}</span>
              <ChevronRight className="w-6 h-6 shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
