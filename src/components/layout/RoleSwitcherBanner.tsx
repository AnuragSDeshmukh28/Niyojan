import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, User, Users, GraduationCap, Building2, Crown, Sparkles } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { currentRole, setCurrentRole } = useApp();

  const roles: { key: UserRole; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'student', label: 'Student', icon: GraduationCap, color: 'hover:bg-blue-600' },
    { key: 'parent', label: 'Parent', icon: Users, color: 'hover:bg-teal-600' },
    { key: 'faculty', label: 'Faculty', icon: User, color: 'hover:bg-emerald-600' },
    { key: 'mediator', label: 'Mediator Desk', icon: Building2, color: 'hover:bg-amber-600' },
    { key: 'principal', label: 'Principal', icon: Crown, color: 'hover:bg-purple-600' },
    { key: 'admin', label: 'System Admin', icon: Shield, color: 'hover:bg-slate-700' },
  ];

  return (
    <div className="bg-slate-950 text-white px-4 py-2 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-md">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interactive Persona Demo Switcher:
        </span>
      </div>

      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setCurrentRole(r.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
