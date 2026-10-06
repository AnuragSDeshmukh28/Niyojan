import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Layers, ArrowRight, User, Mail, Lock, Building, CreditCard, AlertCircle } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, login, error, setError, isLoading } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      full_name: name,
      email: email,
      password: password,
      role: role,
      identifier: identifier || undefined,
      child_roll_no: role === 'parent' ? identifier : undefined
    };
    const success = await register(payload);
    if (success) {
      const loggedIn = await login(email, password);
      if (loggedIn) {
        onNavigate('dashboard');
      } else {
        onNavigate('login');
      }
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
        <h2 className="text-2xl font-bold">Create Your Institutional Account</h2>
        <p className="mt-1 text-xs text-slate-400">Select your role and complete registration</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Persona Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'parent', 'faculty'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                      role === r
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Verma"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rohan.v@institution.edu.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {role === 'student' ? 'Roll No / Registration ID' : role === 'faculty' ? 'Faculty Employee ID' : 'Student Roll No (Child)'}
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'student' ? '2023CSE042' : 'EMP-FAC-804'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? "Creating Account..." : "Complete Registration"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <button onClick={() => onNavigate('login')} className="text-blue-400 font-bold hover:underline">
              Sign In Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
