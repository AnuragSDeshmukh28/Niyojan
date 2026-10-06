import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Layers, ArrowRight, Lock, Mail, Shield, User, Users, GraduationCap, Building2, Crown, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, setCurrentRole, error, setError, isLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(email, password);
    if (success) {
      onNavigate('dashboard');
    }
  };

  const handleRoleQuickLogin = async (role: UserRole) => {
    setError(null);
    await setCurrentRole(role);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 cursor-pointer mb-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-xl group-hover:scale-105 transition-transform">
            <Layers className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Niyojan</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">Sign in to your Institutional Account</h2>
        <p className="mt-1 text-xs text-slate-400">Enter your credentials or choose a quick persona demo below</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Institutional Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-blue-400 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? "Signing In..." : "Sign In to Portal"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Persona Selector */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ Instant One-Click Role Presets (Real Backend Authentication)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRoleQuickLogin('student')}
                className="p-2 bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" /> Student
              </button>
              <button
                onClick={() => handleRoleQuickLogin('parent')}
                className="p-2 bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-teal-400 shrink-0" /> Parent
              </button>
              <button
                onClick={() => handleRoleQuickLogin('faculty')}
                className="p-2 bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <User className="w-4 h-4 text-emerald-400 shrink-0" /> Faculty
              </button>
              <button
                onClick={() => handleRoleQuickLogin('mediator')}
                className="p-2 bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-medium flex items-center gap-2 transition-colors text-left"
              >
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" /> Mediator Desk
              </button>
              <button
                onClick={() => handleRoleQuickLogin('principal')}
                className="p-2 bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-medium flex items-center gap-2 transition-colors text-left col-span-2 bg-purple-950/40 border-purple-800/60"
              >
                <Crown className="w-4 h-4 text-purple-400 shrink-0" /> Principal Executive Desk (Recommended)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an institutional account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-400 font-bold hover:underline"
            >
              Register Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
