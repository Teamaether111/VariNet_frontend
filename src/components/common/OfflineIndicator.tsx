import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  SignalLow,
  ShieldCheck
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';

interface OfflineIndicatorProps {
  compact?: boolean;
  className?: string;
  showControls?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  compact = false,
  className = '',
  showControls = true,
}) => {
  const { networkStatus, setNetworkStatus, lastSyncedTime } = useOperations();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const isLowOrOffline = networkStatus === 'LOW' || networkStatus === 'OFFLINE';

  if (compact) {
    if (!isLowOrOffline && networkStatus === 'ONLINE') {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Online</span>
        </div>
      );
    }

    return (
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
          networkStatus === 'OFFLINE'
            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30'
            : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40 hover:bg-yellow-500/30'
        } ${className}`}
        title="Tap for cached map data details"
      >
        {networkStatus === 'OFFLINE' ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-300" />
        ) : (
          <SignalLow className="w-3.5 h-3.5 text-yellow-300" />
        )}
        <span>{networkStatus === 'OFFLINE' ? 'Offline (Cached Map)' : 'Low Network (Cached)'}</span>
      </div>
    );
  }

  // Full Header Banner for Pilgrim App
  return (
    <div 
      id="pilgrim-offline-indicator-banner"
      className={`rounded-2xl transition-all duration-300 overflow-hidden ${
        isLowOrOffline 
          ? 'bg-amber-50 border-2 border-amber-300 shadow-xs' 
          : 'bg-[#FAF8F5] border border-[#EAE6E1]'
      } ${className}`}
    >
      {/* Main Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            networkStatus === 'OFFLINE'
              ? 'bg-amber-200/80 text-amber-900'
              : networkStatus === 'LOW'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {networkStatus === 'OFFLINE' ? (
              <WifiOff className="w-5 h-5 text-amber-900" />
            ) : networkStatus === 'LOW' ? (
              <SignalLow className="w-5 h-5 text-amber-800" />
            ) : (
              <Wifi className="w-5 h-5 text-emerald-700" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-[#1A2B47]">
                {networkStatus === 'OFFLINE'
                  ? 'Offline Mode Active'
                  : networkStatus === 'LOW'
                  ? 'Low Network Connection'
                  : 'Network Connected'}
              </h4>
              {isLowOrOffline ? (
                <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Cached Map Active
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live Sync
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 font-medium leading-normal">
              {isLowOrOffline ? (
                <span>
                  You are viewing <strong>cached offline map data</strong>. All routes, water stalls, and emergency contacts remain fully available.
                </span>
              ) : (
                <span>Real-time GPS positioning and live crowd feeds are connected.</span>
              )}
            </p>
          </div>
        </div>

        {/* Action / Toggle Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Refresh cached local data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#F27D26]' : 'text-gray-500'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Cache'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Toggle details"
          >
            <span>{isExpanded ? 'Hide' : 'Details'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Friendly Offline Details & Simulation Switcher */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-2 border-t border-amber-200/80 bg-white/70 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-gray-500">Cached Data Status</div>
              <div className="text-xs font-black text-emerald-800 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Offline Ready</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Last synced: {lastSyncedTime}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-gray-500">Available Features</div>
              <div className="text-xs font-black text-[#1A2B47] mt-0.5">
                Full Walking Navigation
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Water, Medical & SOS work offline
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-gray-500">Emergency Offline Mode</div>
              <div className="text-xs font-black text-red-700 mt-0.5">
                Direct SMS / Tel: 112
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Direct phone helpline available
              </div>
            </div>
          </div>

          {/* Network Simulation Testing Bar */}
          {showControls && (
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                <Info className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Simulate Network Condition:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setNetworkStatus('ONLINE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    networkStatus === 'ONLINE'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🟢 Online (Full)
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkStatus('LOW')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    networkStatus === 'LOW'
                      ? 'bg-yellow-500 text-slate-950 font-black shadow-2xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🟡 Low Network
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkStatus('OFFLINE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    networkStatus === 'OFFLINE'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🟠 Offline (Simulate)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
