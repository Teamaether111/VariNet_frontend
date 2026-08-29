import React from 'react';
import { CloudSun, Droplets, Thermometer, Wind, AlertTriangle } from 'lucide-react';
import { ZoneWeather } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherCardProps {
  weather: ZoneWeather;
  zoneCode?: string;
  zoneName?: string;
  compact?: boolean;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  zoneCode,
  zoneName,
  compact = false,
  className = '',
}) => {
  const { t } = useLanguage();

  const getHeatRiskColor = (risk: ZoneWeather['heatRisk']) => {
    switch (risk) {
      case 'Extreme':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  if (compact) {
    return (
      <div
        id="compact-weather-pill"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-slate-700 ${className}`}
      >
        <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-semibold text-slate-900">{weather.temp}°C</span>
        <span className="text-slate-400">|</span>
        <span className="flex items-center gap-1 text-slate-600">
          <Droplets className="w-3 h-3 text-sky-500" />
          {weather.humidity}%
        </span>
        <span className="text-slate-400">|</span>
        <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold border ${getHeatRiskColor(weather.heatRisk)}`}>
          {weather.heatRisk} {t('weather.heatRisk', 'Heat')}
        </span>
      </div>
    );
  }

  return (
    <div
      id="weather-card"
      className={`bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-50 text-[#F27D26]">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {t('weather.title', 'Microclimate Radar')}
            </h4>
            <p className="text-sm font-bold text-[#1A2B47] truncate max-w-[200px]">
              {zoneCode ? `${zoneCode} Microclimate` : zoneName || 'Zone Weather'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getHeatRiskColor(weather.heatRisk)}`}>
          {(weather.heatRisk === 'High' || weather.heatRisk === 'Extreme') && (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          <span>{weather.heatRisk} {t('weather.heatRisk', 'Heat')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#F9F8F6] rounded-xl p-3 flex flex-col items-start border border-[#E5E5E5]">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>{t('weather.temp', 'Temp')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-[#1A2B47] font-mono">{weather.temp}°C</span>
          </div>
          <span className="text-[10px] text-gray-400">{weather.feelsLike}° feels</span>
        </div>

        <div className="bg-[#F9F8F6] rounded-xl p-3 flex flex-col items-start border border-[#E5E5E5]">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('weather.humidity', 'Humidity')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-[#1A2B47] font-mono">{weather.humidity}%</span>
          </div>
          <span className="text-[10px] text-gray-400">relative</span>
        </div>

        <div className="bg-[#F9F8F6] rounded-xl p-3 flex flex-col items-start border border-[#E5E5E5]">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-gray-500" />
            <span>{t('weather.wind', 'Wind')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-[#1A2B47] font-mono">{weather.windSpeed}</span>
          </div>
          <span className="text-[10px] text-gray-400">km/h</span>
        </div>
      </div>

      {weather.heatRisk === 'High' || weather.heatRisk === 'Extreme' ? (
        <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
            <span>{t('weather.dehydration', 'Dehydration Advisory')}</span>
          </div>
          <span className="text-[10px] font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-md">
            ORS Stalls Active
          </span>
        </div>
      ) : null}
    </div>
  );
};
