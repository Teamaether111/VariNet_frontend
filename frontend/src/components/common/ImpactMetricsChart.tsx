import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ImpactMetricsChartProps {
  isApproved?: boolean;
  className?: string;
  theme?: 'dark-card' | 'light';
}

interface SectorImpactData {
  name: string;
  shortName: string;
  preDiversion: number; // persons/m²
  postDiversion: number; // persons/m²
  reductionPct: number;
}

interface TimelineImpactData {
  time: string;
  withoutAI: number;
  withAIDiversion: number;
}

const SECTOR_DATA: SectorImpactData[] = [
  {
    name: 'Sector C (Palkhi Marg)',
    shortName: 'Sector C',
    preDiversion: 4.8,
    postDiversion: 2.7,
    reductionPct: 44,
  },
  {
    name: 'Shivaji Chowk Junction',
    shortName: 'Shivaji Chowk',
    preDiversion: 4.9,
    postDiversion: 2.6,
    reductionPct: 47,
  },
  {
    name: 'Sector B (Temple Quad)',
    shortName: 'Sector B',
    preDiversion: 3.6,
    postDiversion: 2.8,
    reductionPct: 22,
  },
  {
    name: 'Bypass 2 (Absorber Route)',
    shortName: 'Bypass 2 Corridor',
    preDiversion: 1.4,
    postDiversion: 2.2,
    reductionPct: -57, // Absorbs flow safely
  },
];

const TIMELINE_DATA: TimelineImpactData[] = [
  { time: 'T+0 (Now)', withoutAI: 4.8, withAIDiversion: 4.8 },
  { time: 'T+10 min', withoutAI: 5.1, withAIDiversion: 4.1 },
  { time: 'T+20 min', withoutAI: 5.4, withAIDiversion: 3.2 },
  { time: 'T+30 min', withoutAI: 5.7, withAIDiversion: 2.7 },
  { time: 'T+45 min', withoutAI: 6.0, withAIDiversion: 2.5 },
];

export const ImpactMetricsChart: React.FC<ImpactMetricsChartProps> = ({
  isApproved = false,
  className = '',
  theme = 'light',
}) => {
  const [viewMode, setViewMode] = useState<'corridors' | 'timeline'>('corridors');

  const isDark = theme === 'dark-card';

  return (
    <div
      id="impact-metrics-chart-container"
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
        isDark
          ? 'bg-black/20 text-white border border-white/15'
          : 'bg-[#F8F9FA] text-[#1A365D] border border-[#E5E5E5] shadow-xs'
      } ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isDark ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-black text-[#1A365D] tracking-tight">
                Projected Crowd Density
              </h4>
              {isApproved ? (
                <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Active Relief
                </span>
              ) : (
                <span className="text-xs bg-orange-50 text-[#E65100] border border-orange-200 px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E65100]" />
                  AI MODEL PROJECTION
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-gray-200/80 p-1 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={() => setViewMode('corridors')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'corridors'
                ? 'bg-white text-[#1A365D] shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            By Key Corridors
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              viewMode === 'timeline'
                ? 'bg-white text-[#1A365D] shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30-Min Trend
          </button>
        </div>
      </div>

      {/* Quick summary prominent metric chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div
          className={`p-3.5 rounded-xl ${
            isDark ? 'bg-black/15 border border-white/10' : 'bg-white border border-[#E5E5E5] shadow-xs'
          }`}
        >
          <div className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
            Sector C Relief
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span>-44%</span>
            <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              (4.8 → 2.7 p/m²)
            </span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl ${
            isDark ? 'bg-black/15 border border-white/10' : 'bg-white border border-[#E5E5E5] shadow-xs'
          }`}
        >
          <div className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
            Shivaji Choke Point
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span>-47%</span>
            <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              (4.9 → 2.6 p/m²)
            </span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl ${
            isDark ? 'bg-black/15 border border-white/10' : 'bg-white border border-[#E5E5E5] shadow-xs'
          }`}
        >
          <div className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
            Safe Threshold
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span>&lt; 3.0 p/m²</span>
            <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              Restored
            </span>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl ${
            isDark ? 'bg-black/15 border border-white/10' : 'bg-white border border-[#E5E5E5] shadow-xs'
          }`}
        >
          <div className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
            Est. Harm Prevented
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#E65100] mt-1">
            28 Incidents
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'corridors' ? (
            <BarChart
              data={SECTOR_DATA}
              margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5'}
                vertical={false}
              />
              <XAxis
                dataKey="shortName"
                stroke={isDark ? 'rgba(255,255,255,0.85)' : '#475569'}
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}
              />
              <YAxis
                stroke={isDark ? 'rgba(255,255,255,0.85)' : '#475569'}
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={[0, 6]}
                ticks={[0, 1.5, 3.0, 4.5, 6.0]}
                unit=" p/m²"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SectorImpactData;
                    return (
                      <div className="bg-slate-900 text-white text-sm p-3.5 rounded-xl shadow-xl border border-slate-700 min-w-52">
                        <div className="font-black border-b border-slate-700 pb-1.5 mb-2 text-[#F27D26] text-base">
                          {data.name}
                        </div>
                        <div className="flex justify-between items-center py-1 text-rose-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]"></span>
                            <span>Without AI Diversion:</span>
                          </span>
                          <span className="font-mono font-black text-base">{data.preDiversion} p/m²</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span>Projected Post-Diversion:</span>
                          </span>
                          <span className="font-mono font-black text-base">{data.postDiversion} p/m²</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs font-black">
                          <span>Projected Effect:</span>
                          <span className={data.reductionPct > 0 ? 'text-emerald-400 text-sm' : 'text-cyan-300 text-sm'}>
                            {data.reductionPct > 0
                              ? `-${data.reductionPct}% Density Relief`
                              : `Safe Absorption (+${Math.abs(data.reductionPct)}%)`}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={34}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '13px',
                  fontWeight: 600,
                  paddingBottom: '8px',
                  color: isDark ? '#ffffff' : '#1A365D',
                }}
              />
              <ReferenceLine
                y={3.0}
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Safe Limit (3.0 p/m²)',
                  fill: isDark ? '#fef08a' : '#b45309',
                  fontSize: 12,
                  fontWeight: 700,
                  position: 'insideTopRight',
                }}
              />
              <Bar
                name="Pre-Diversion (Without AI Action)"
                dataKey="preDiversion"
                fill="#E65100"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                name="Projected Post-Diversion (With AI)"
                dataKey="postDiversion"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          ) : (
            <BarChart
              data={TIMELINE_DATA}
              margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5'}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke={isDark ? 'rgba(255,255,255,0.85)' : '#475569'}
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}
              />
              <YAxis
                stroke={isDark ? 'rgba(255,255,255,0.85)' : '#475569'}
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={[0, 7]}
                ticks={[0, 2.0, 4.0, 6.0]}
                unit=" p/m²"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-sm p-3.5 rounded-xl shadow-xl border border-slate-700 min-w-52">
                        <div className="font-black border-b border-slate-700 pb-1.5 mb-2 text-[#F27D26] text-base">
                          Sector C at {label}
                        </div>
                        <div className="flex justify-between items-center py-1 text-rose-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]"></span>
                            <span>Without AI Intervention:</span>
                          </span>
                          <span className="font-mono font-black text-base">
                            {payload.find((p: any) => p.dataKey === 'withoutAI')?.value} p/m²
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span>With Bypass 2 Diversion:</span>
                          </span>
                          <span className="font-mono font-black text-base">
                            {payload.find((p: any) => p.dataKey === 'withAIDiversion')?.value} p/m²
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={34}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '13px',
                  fontWeight: 600,
                  paddingBottom: '8px',
                  color: isDark ? '#ffffff' : '#1A365D',
                }}
              />
              <ReferenceLine
                y={3.0}
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Safe Limit (3.0 p/m²)',
                  fill: isDark ? '#fef08a' : '#b45309',
                  fontSize: 12,
                  fontWeight: 700,
                  position: 'insideTopRight',
                }}
              />
              <Bar
                name="Unmanaged Surge (Palkhi Main Road)"
                dataKey="withoutAI"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                name="Managed Flow with Bypass 2 Reroute"
                dataKey="withAIDiversion"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Safety Annotation Footer */}
      <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-gray-500 font-semibold flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Restores crowd pressure below stampede-risk threshold (3.0 persons/m²)</span>
        </div>
        <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          Peak Surge Mitigated
        </span>
      </div>
    </div>
  );
};
