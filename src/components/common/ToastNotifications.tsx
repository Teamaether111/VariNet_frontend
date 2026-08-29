import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  X, 
  ArrowRight,
  Volume2
} from 'lucide-react';
import { NotificationItem, useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';

export interface ToastAlert extends NotificationItem {
  autoHideMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export const ToastNotifications: React.FC = () => {
  const { notifications, dismissNotification } = useOperations();
  const { t } = useLanguage();
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);
  const [lastSeenId, setLastSeenId] = useState<string>('');

  // Watch for new high-priority or alert notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const newest = notifications[0];
      if (newest && newest.id !== lastSeenId) {
        setLastSeenId(newest.id);
        // If it's an ALERT, WARNING, or SUCCESS, trigger a visible screen toast
        if (newest.type === 'ALERT' || newest.type === 'WARNING' || newest.type === 'SUCCESS') {
          const autoHideMs = newest.type === 'ALERT' ? 9000 : 6000;
          const toastItem: ToastAlert = {
            ...newest,
            autoHideMs,
          };
          setActiveToasts(prev => {
            const filtered = prev.filter(t => t.id !== toastItem.id);
            return [toastItem, ...filtered.slice(0, 2)];
          });

          // Auto remove after duration
          const timer = setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== toastItem.id));
          }, autoHideMs);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [notifications, lastSeenId]);

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  if (activeToasts.length === 0) return null;

  return (
    <aside
      id="varinet-toast-container"
      aria-label="High Priority Alerts"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {activeToasts.map((toast) => {
        const isCritical = toast.type === 'ALERT';
        const isWarning = toast.type === 'WARNING';
        const isSuccess = toast.type === 'SUCCESS';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            role="alert"
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border transition-all duration-300 transform translate-y-0 backdrop-blur-md animate-in slide-in-from-top-4 ${
              isCritical
                ? 'bg-red-900/95 text-white border-red-500 shadow-red-950/40 ring-2 ring-red-500/50'
                : isWarning
                ? 'bg-amber-900/95 text-white border-amber-500 shadow-amber-950/40'
                : isSuccess
                ? 'bg-emerald-900/95 text-white border-emerald-500 shadow-emerald-950/40'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-xl shrink-0 ${
                isCritical
                  ? 'bg-red-500 text-white animate-pulse'
                  : isWarning
                  ? 'bg-amber-500 text-white'
                  : isSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-white'
              }`}>
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {isCritical ? '🚨 ' + t('common.critical', 'Critical Alert') : isWarning ? '⚠️ ' + t('common.high', 'Priority Warning') : '✅ ' + t('notif.toast', 'Live Action')}
                  </span>
                  <span className="text-[10px] text-white/70 font-mono">
                    {toast.timestamp}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">
                  {toast.title}
                </h4>

                <p className="text-xs text-white/85 mt-0.5 leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  removeToast(toast.id);
                  dismissNotification(toast.id);
                }}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
