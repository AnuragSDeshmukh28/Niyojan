import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Bell, Shield, ChevronDown, Menu, UserCheck, LogOut, Settings, HelpCircle, Layers } from 'lucide-react';
import { NotificationDrawer } from '../ui/NotificationDrawer';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onNavigatePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, onNavigatePage }) => {
  const { currentUser, currentRole, notifications, setIsSearchOpen, logout } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Sidebar Trigger & Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigatePage('landing')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center text-white font-black shadow-md group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-slate-900 tracking-tight">Niyojan</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                    SaaS Enterprise
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Digital Approval & Institutional Workflow Platform
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-400 text-xs rounded-xl border border-slate-200/60 transition-colors shadow-inner"
            >
              <span className="flex items-center gap-2 text-slate-500">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Search requests, documents, users, or audit logs...</span>
              </span>
              <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-500 shadow-xs">
                ⌘K / Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right: Actions, Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile / Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/20"
                  />
                  <div className="hidden sm:block text-xs">
                    <p className="font-bold text-slate-800 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-blue-600 font-semibold capitalize mt-0.5 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> {currentRole} Persona
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigatePage('profile');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigatePage('landing');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" /> Public Portal & Features
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await logout();
                        onNavigatePage('login');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> Sign Out / Exit Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigatePage('login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
