import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Users, Lock, Server, Search, CheckCircle2, UserCheck, AlertTriangle, Key, Sliders } from 'lucide-react';
import { INITIAL_USERS } from '../../data/mockData';
import { UserRole } from '../../types';

export const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { auditLogs, setCurrentRole, currentRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState(Object.values(INITIAL_USERS));

  const handleToggleUserStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
    );
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-blue-400" /> IT Governance & Infrastructure Console
          </div>
          <h1 className="text-2xl font-black mt-1">System Administration & Audit Logs</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Manage user roles, inspect immutable activity audit logs, and configure security parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> System Health 100%
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Total Registered Users</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">2,480 Users</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Active Roles Configured</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">6 Personas</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Audit Logs Generated</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{auditLogs.length} Events</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Security Encryption</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">AES-256 Valid</p>
        </div>
      </div>

      {/* User Directory Management */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Institutional User Directory
            </h3>
            <p className="text-xs text-slate-500">Search users, modify role assignments, and manage access</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name or role..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3">User Details</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department / ID</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50">
                  <td className="p-3 flex items-center gap-2.5">
                    <img src={usr.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-slate-800">{usr.name}</p>
                      <p className="text-[10px] text-slate-400">{usr.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded capitalize text-[11px]">
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    {usr.department || usr.identifier || 'N/A'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        usr.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {usr.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(usr.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px]"
                    >
                      {usr.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setCurrentRole(usr.role)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px]"
                    >
                      Test Persona
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs Section */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" /> Immutable System Audit Trail
        </h3>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-purple-700">{log.id}</span>
                  <span className="font-bold text-slate-800">{log.actorName} ({log.actorRole})</span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.details}</p>
              </div>
              <div className="text-[11px] text-slate-400 font-mono sm:text-right">
                <p>{log.timestamp}</p>
                <p>IP: {log.ipAddress}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
