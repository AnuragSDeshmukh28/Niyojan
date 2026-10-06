import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertTriangle, Info, Check } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications & Alerts Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status updates from Mediator Desk & Principal Office</p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl text-xs flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              !item.read ? 'bg-blue-50/50 border-blue-200 shadow-xs' : 'bg-white border-slate-200'
            }`}
          >
            <div className="mt-1">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
