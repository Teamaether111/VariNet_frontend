import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface ConfidenceMeterProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md';
  label?: string;
  showIcon?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  size = 'md',
  label = 'AI Confidence',
  showIcon = true,
}) => {
  const getTone = (val: number) => {
    if (val >= 90) return { bar: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50' };
    if (val >= 75) return { bar: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50' };
    return { bar: 'bg-orange-500', text: 'text-orange-800', bg: 'bg-orange-50' };
  };

  const tone = getTone(score);

  return (
    <div id="confidence-meter-container" className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium flex items-center gap-1">
          {showIcon && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
          {label}
        </span>
        <span className={`font-mono font-bold ${tone.text}`}>{score}%</span>
      </div>
      <div className={`w-full ${size === 'sm' ? 'h-1.5' : 'h-2'} bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${tone.bar} transition-all duration-500 rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
