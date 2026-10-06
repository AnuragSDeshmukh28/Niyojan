import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Shield, Lock, Phone, Building, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex items-center gap-4">
        <img src={currentUser.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/20" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{currentUser.name}</h1>
          <p className="text-xs text-blue-600 font-bold capitalize mt-0.5">{currentRole} Persona Context</p>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Personal & Institutional Profile Information</h3>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Department / Identifier</label>
              <input
                type="text"
                disabled
                value={currentUser.department || currentUser.identifier || 'Institutional Account'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
