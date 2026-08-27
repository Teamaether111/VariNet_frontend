import React, { useState } from 'react';
import { 
  Bell, 
  Radio, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  Trash2, 
  Filter,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { useOperations, NotificationItem } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationCategory = 'ALL' | 'CRITICAL' | 'OPERATIONS' | 'PUBLIC';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, dismissNotification } = useOperations();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('ALL');

  if (!isOpen) return null;

  // Filter notifications based on category
  const filteredNotifications = notifications.filter(notif => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'CRITICAL') {
      return notif.type === 'ALERT' || notif.type === 'WARNING';
    }
    if (activeCategory === 'OPERATIONS') {
      return notif.roleTarget === 'police' || notif.roleTarget === 'volunteer' || notif.title.includes('Task') || notif.title.includes('Unit') || notif.title.includes('Action');
    }
    if (activeCategory === 'PUBLIC') {
      return notif.roleTarget === 'pilgrim' || notif.roleTarget === 'ALL' || notif.title.includes('VARI-Net') || notif.title.includes('SOS');
    }
    return true;
  });

  const clearAllNotifications = () => {
    notifications.forEach(n => dismissNotification(n.id));
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ALERT':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container (Right side panel that doesn't obscure the center screen) */}
      <aside 
        id="notification-drawer-panel"
        aria-label="Command Notification Center"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E5E5E5] z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#1A2B47] text-white border-b border-[#243b61] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F27D26] text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                <span>{t('notif.title', 'Command Alert Stream')}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/20 text-white">
                  {notifications.length}
                </span>
              </h3>
              <p className="text-[11px] text-white/70">Real-time multi-agency ground telemetry</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 duration-150 text-white transition-all cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="p-3 bg-[#F9F8F6] border-b border-[#E5E5E5] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-[#F27D26]" />
              Filter Alerts
            </span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('notif.clearAll', 'Clear All')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold transition-all text-center truncate cursor-pointer active:scale-95 duration-150 ${
                activeCategory === 'ALL'
                  ? 'bg-[#1A2B47] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {t('notif.all', 'All')} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('CRITICAL')}
              className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold transition-all text-center truncate cursor-pointer active:scale-95 duration-150 ${
                activeCategory === 'CRITICAL'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🚨 {t('notif.critical', 'Critical')}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('OPERATIONS')}
              className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold transition-all text-center truncate cursor-pointer active:scale-95 duration-150 ${
                activeCategory === 'OPERATIONS'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🛡️ {t('notif.ops', 'Ops')}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('PUBLIC')}
              className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold transition-all text-center truncate cursor-pointer active:scale-95 duration-150 ${
                activeCategory === 'PUBLIC'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🚶 {t('notif.public', 'Public')}
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <CheckCheck className="w-6 h-6" />
              </div>
              <div className="max-w-xs">
                <p className="font-bold text-xs text-gray-600">
                  {t('notif.empty', 'No active alerts in this category.')}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ground security and crowd telemetry are operating normally.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isAlert = notif.type === 'ALERT';
              const isWarning = notif.type === 'WARNING';
              const isSuccess = notif.type === 'SUCCESS';

              return (
                <div
                  key={notif.id}
                  id={`drawer-notif-${notif.id}`}
                  className={`p-3.5 rounded-2xl border transition-all text-xs relative group ${
                    isAlert
                      ? 'bg-red-50/80 border-red-200 text-red-950 hover:bg-red-50'
                      : isWarning
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-50'
                      : isSuccess
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:bg-emerald-50'
                      : 'bg-white border-[#E5E5E5] text-[#1A2B47] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {getIconForType(notif.type)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-xs leading-tight">
                            {notif.title}
                          </h4>
                          {notif.roleTarget && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold bg-black/10 text-gray-700">
                              {notif.roleTarget}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                          {notif.message}
                        </p>

                        <div className="text-[10px] text-gray-400 font-mono">
                          {notif.timestamp}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => dismissNotification(notif.id)}
                      className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-black/5 active:scale-95 duration-150 transition-all cursor-pointer shrink-0"
                      title={t('notif.dismiss', 'Dismiss')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-[#E5E5E5] flex items-center justify-between text-xs text-gray-500">
          <span className="text-[11px] font-mono">Solapur Wari EOC Stream</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-5 py-2.5 bg-[#1A2B47] hover:bg-[#243b61] active:scale-95 duration-150 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {t('settings.close', 'Close')}
          </button>
        </div>
      </aside>
    </div>
  );
};
