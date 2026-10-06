import React, { useState } from 'react';
import { Layers, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [code, setCode] = useState('8841-2026');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 cursor-pointer mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-lg">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-xl font-black text-white">Niyojan</span>
        </div>
        <h2 className="text-2xl font-bold">Set New Password</h2>
        <p className="mt-1 text-xs text-slate-400">Enter authorization code and create a new secure password</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          {!success ? (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reset Security Token Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Update Password <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Password Updated Successfully</h3>
              <p className="text-xs text-slate-400">You can now sign in with your new credentials.</p>
              <button
                onClick={() => onNavigate('login')}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
