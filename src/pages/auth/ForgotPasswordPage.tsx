import React, { useState } from 'react';
import { Layers, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 cursor-pointer mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-lg">
            <Layers className="w-6 h-6" />
          </div>
          <span className="text-xl font-black text-white">Niyojan</span>
        </div>
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <p className="mt-1 text-xs text-slate-400">We will send a reset authorization link to your institutional email</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          {!sent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Registered Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@institution.edu.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Send Reset Link <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Check Your Inbox</h3>
              <p className="text-xs text-slate-400">
                A password reset token has been sent to <strong className="text-slate-200">{email}</strong>.
              </p>
              <button
                onClick={() => onNavigate('reset-password')}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs"
              >
                Proceed to Enter Reset Code
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered password?{' '}
            <button onClick={() => onNavigate('login')} className="text-blue-400 font-bold hover:underline">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
