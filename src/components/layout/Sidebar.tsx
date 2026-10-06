import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  FileCheck,
  PlusCircle,
  FileText,
  Bell,
  User,
  Users,
  Shield,
  BarChart3,
  Clock,
  CheckSquare,
  Sparkles,
  ChevronRight,
  Sliders,
  LifeBuoy,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SidebarMenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  highlight?: boolean;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentRole, appointments, documents } = useApp();

  const pendingMediatorCount = appointments.filter((a) => a.status === 'PENDING_MEDIATOR').length;
  const pendingPrincipalCount = appointments.filter((a) => a.status === 'FORWARDED_TO_PRINCIPAL').length;
  const pendingDocCount = documents.filter((d) => d.status === 'PENDING_VERIFICATION').length;

  const getRoleMenu = (): SidebarMenuItem[] => {
    switch (currentRole) {
      case 'student':
        return [
          { key: 'dashboard', label: 'Student Overview', icon: LayoutDashboard },
          { key: 'appointments', label: 'My Appointments', icon: Calendar },
          { key: 'create-appointment', label: 'Book Appointment', icon: PlusCircle, highlight: true },
          { key: 'documents', label: 'My Documents', icon: FileCheck },
          { key: 'upload-document', label: 'Upload Document', icon: FileText },
          { key: 'notifications', label: 'Notification Hub', icon: Bell },
          { key: 'profile', label: 'My Profile', icon: User },
        ];

      case 'parent':
        return [
          { key: 'dashboard', label: 'Parent Workspace', icon: LayoutDashboard },
          { key: 'appointments', label: 'Child Appointments', icon: Calendar },
          { key: 'create-appointment', label: 'Request Principal Visit', icon: PlusCircle, highlight: true },
          { key: 'documents', label: 'Child Document Status', icon: FileCheck },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'profile', label: 'Parent Profile', icon: User },
        ];

      case 'faculty':
        return [
          { key: 'dashboard', label: 'Faculty Portal', icon: LayoutDashboard },
          { key: 'appointments', label: 'Department Meetings', icon: Calendar },
          { key: 'documents', label: 'Research & Clearances', icon: FileCheck },
          { key: 'upload-document', label: 'Submit Grant/Leave', icon: PlusCircle },
          { key: 'reports', label: 'Department Stats', icon: BarChart3 },
          { key: 'profile', label: 'Faculty Profile', icon: User },
        ];

      case 'mediator':
        return [
          { key: 'dashboard', label: 'Mediator Triage Center', icon: LayoutDashboard, badge: pendingMediatorCount },
          { key: 'appointments', label: 'Request Review Desk', icon: Clock, badge: pendingMediatorCount },
          { key: 'documents', label: 'Document Verification', icon: CheckSquare, badge: pendingDocCount },
          { key: 'reports', label: 'Queue Analytics', icon: BarChart3 },
          { key: 'profile', label: 'Office Profile', icon: User },
        ];

      case 'principal':
        return [
          { key: 'dashboard', label: 'Executive Command Desk', icon: LayoutDashboard, badge: pendingPrincipalCount },
          { key: 'appointments', label: 'Approval Management', icon: Calendar, badge: pendingPrincipalCount },
          { key: 'documents', label: 'Document Seal Center', icon: FileCheck },
          { key: 'reports', label: 'Institutional Analytics', icon: BarChart3 },
          { key: 'profile', label: 'Principal Profile', icon: User },
        ];

      case 'admin':
        return [
          { key: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { key: 'admin-users', label: 'User Directory', icon: Users },
          { key: 'admin-audit', label: 'System Audit Logs', icon: Shield },
          { key: 'reports', label: 'System Reports', icon: BarChart3 },
          { key: 'profile', label: 'Admin Settings', icon: Sliders },
        ];

      default:
        return [];
    }
  };

  const menuItems = getRoleMenu();

  const handleItemClick = (key: string) => {
    onNavigate(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Role Badge Indicator */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="p-3 bg-gradient-to-r from-blue-900/50 to-teal-900/40 border border-blue-800/50 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400 block">
                Active Perspective
              </span>
              <p className="text-xs font-bold text-white capitalize">{currentRole} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            Main Navigation
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                    : item.highlight
                    ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isActive ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
              Public & Help
            </p>
            <button
              onClick={() => handleItemClick('landing')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70"
            >
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-4 h-4 text-teal-400" />
                <span>Public Landing Page</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Institutional System Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-400">Niyojan v2.4</span>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] border border-emerald-500/20">
              Online
            </span>
          </div>
          <p className="mt-1 text-[10px]">Connected to Central Institutional Directory</p>
        </div>
      </aside>
    </>
  );
};
