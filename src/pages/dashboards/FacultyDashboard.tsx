import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Calendar, FileText, UserCheck, PlusCircle, CheckCircle2, Award, Clock } from 'lucide-react';
import { DocumentApproval } from '../../types';

interface FacultyDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDocument: (doc: DocumentApproval) => void;
  onOpenCreateAppointment: () => void;
  onOpenUploadDocument: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onNavigate,
  onSelectDocument,
  onOpenCreateAppointment,
  onOpenUploadDocument,
}) => {
  const { appointments, documents, currentUser } = useApp();

  const facultyAppointments = appointments.filter(
    (a) => a.requestedBy.role === 'faculty' || a.category === 'Research Project'
  );
  const facultyDocs = documents.filter((d) => d.docCategory === 'Faculty Clearance');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Faculty Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <span>Faculty & Academic Leadership Portal</span> • <span>{currentUser.department}</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Faculty Workspace: {currentUser.name}</h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Submit DST/AICTE research grant approvals, endorse student academic applications, and manage departmental meeting requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateAppointment}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Principal Meeting Request
          </button>
          <button
            onClick={onOpenUploadDocument}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-300" /> Submit Grant Paper
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Research Grant Requests</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">3 Submitted</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Student Endorsements Pending</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">4 Requiring Sign</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Principal Approved Grants</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">12 Approved (2026)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Departmental & Grant Requests */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" /> Research & Departmental Submissions
        </h3>

        <div className="space-y-3">
          {facultyAppointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600">{apt.id}</span>
                <StatusBadge status={apt.status} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">{apt.subject}</h4>
              <p className="text-xs text-slate-600">{apt.description}</p>
              {apt.attachmentName && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-mono">
                  <FileText className="w-3.5 h-3.5" /> Attachment: {apt.attachmentName} ({apt.attachmentSize})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
