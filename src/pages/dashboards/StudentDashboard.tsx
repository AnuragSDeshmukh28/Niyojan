import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { WorkflowStepper } from '../../components/ui/WorkflowStepper';
import { AppointmentLifecycleModal } from '../../components/ui/AppointmentLifecycleModal';
import { Calendar, FileText, Clock, CheckCircle2, PlusCircle, ArrowUpRight, UploadCloud, Eye, Activity } from 'lucide-react';
import { AppointmentRequest, DocumentApproval } from '../../types';

interface StudentDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDocument: (doc: DocumentApproval) => void;
  onOpenCreateAppointment: () => void;
  onOpenUploadDocument: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onSelectDocument,
  onOpenCreateAppointment,
  onOpenUploadDocument,
}) => {
  const { appointments, documents, currentUser } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);

  const myAppointments = appointments.filter(
    (a) => a.requestedBy.id === currentUser?.id || a.requestedBy.role === 'student'
  );
  const myDocuments = documents.filter(
    (d) => d.submittedBy.id === currentUser?.id || d.submittedBy.role === 'student'
  );

  const pendingCount = myAppointments.filter(
    (a) => a.status === 'PENDING_MEDIATOR' || a.status === 'FORWARDED_TO_PRINCIPAL'
  ).length;
  const approvedCount = myAppointments.filter((a) => a.status === 'APPROVED').length;
  const upcomingCount = myAppointments.filter((a) => a.status === 'APPROVED' && a.scheduledSlot).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-blue-800 to-teal-700 text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <span>Student Administrative Workspace</span> • <span>Roll No: {currentUser.identifier || '2023CSE042'}</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Welcome back, {currentUser.name}!</h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Track your appointment applications, check Mediator desk progress, and download principal-signed certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateAppointment}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" /> Book Appointment
          </button>
          <button
            onClick={onOpenUploadDocument}
            className="px-4 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-white border border-teal-300/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-teal-300" /> Upload Document
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Applications</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{myAppointments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Under Review (Mediator)</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Approved & Signed</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Upcoming Meetings</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{upcomingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Featured Tracking Card */}
      {myAppointments.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Request Lifecycle</span>
              <h3 className="text-sm font-extrabold text-slate-900">{myAppointments[0].subject}</h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={myAppointments[0].status} />
              <button
                onClick={() => setSelectedAppointment(myAppointments[0])}
                className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-blue-400" /> Full Audit Trail
              </button>
            </div>
          </div>

          <WorkflowStepper status={myAppointments[0].status} />

          {myAppointments[0].mediatorRemarks && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-700">Mediator Remarks: </span>
              <span className="text-slate-600">{myAppointments[0].mediatorRemarks}</span>
            </div>
          )}
        </div>
      )}

      {/* Grid: My Appointments & My Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Appointments Table Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Recent Appointments
              </h3>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600">{apt.id}</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{apt.subject}</h4>
                    </div>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Date: <strong>{apt.preferredDate}</strong></span>
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Activity className="w-3 h-3" /> Track Progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Documents Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Verified Documents
              </h3>
              <button
                onClick={() => onNavigate('documents')}
                className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1"
              >
                Document Center <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-teal-200 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{doc.docTitle}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {doc.docCategory} • Submitted {doc.submittedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} size="sm" />
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="p-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 rounded-lg text-slate-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Lifecycle Modal */}
      <AppointmentLifecycleModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};
