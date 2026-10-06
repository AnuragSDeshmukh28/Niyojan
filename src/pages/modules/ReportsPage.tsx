import React from 'react';
import { BarChart3, Download, TrendingUp, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DEPARTMENT_ANALYTICS } from '../../data/mockData';

export const ReportsPage: React.FC = () => {
  const handleExportCSV = () => {
    alert('Exporting Institutional Workflow Analytics Report (CSV)...');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" /> Administrative Workflow & Institutional Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data insights, resolution speed analysis, and department performance reports
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-purple-400" /> Export Full Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Average Turnaround Speed</p>
          <p className="text-3xl font-black text-purple-700 mt-1">4.2 Hours</p>
          <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> 75% faster than physical office paper flow
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Paperless Operations Savings</p>
          <p className="text-3xl font-black text-teal-600 mt-1">100% Digital</p>
          <p className="text-xs text-slate-500 mt-2">Zero printed paper queue slips</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500">Total Monthly Approvals</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">427 Signed</p>
          <p className="text-xs text-slate-500 mt-2">August 2026 Governance Cycle</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Department Performance Breakdown</h3>
        <div className="space-y-4">
          {DEPARTMENT_ANALYTICS.map((dept, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{dept.name}</span>
                <span className="text-purple-600">{dept.approvedCount} / {dept.totalRequests} Approved ({dept.avgResponseHours}h avg)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full"
                  style={{ width: `${(dept.approvedCount / dept.totalRequests) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
