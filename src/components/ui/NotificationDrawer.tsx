import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, CheckCircle2, AlertTriangle, Info, Check } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Notifications Center</h3>
                <p className="text-[11px] text-slate-500">Real-time institutional alerts & workflow updates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Bar */}
          <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {notifications.filter((n) => !n.read).length} Unread
            </span>
            <button
              onClick={markAllNotificationsRead}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    !item.read
                      ? 'bg-blue-50/40 border-blue-200/80 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {!item.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {item.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      {item.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
