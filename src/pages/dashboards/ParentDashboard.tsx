import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AppointmentLifecycleModal } from '../../components/ui/AppointmentLifecycleModal';
import { Users, Calendar, FileText, PlusCircle, CheckCircle2, MessageSquare, GraduationCap, Activity } from 'lucide-react';
import { AppointmentRequest, DocumentApproval } from '../../types';

interface ParentDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDocument: (doc: DocumentApproval) => void;
  onOpenCreateAppointment: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onNavigate,
  onSelectDocument,
  onOpenCreateAppointment,
}) => {
  const { appointments, documents, currentUser } = useApp();
  const [selectedChild, setSelectedChild] = useState('Aarav Sharma (2022ECE018)');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);

  const parentAppointments = appointments.filter(
    (a) => a.requestedBy.role === 'parent' || a.category === 'Parent-Teacher Meeting'
  );
  const childDocuments = documents.filter((d) => d.docCategory === 'Medical Leave' || d.docCategory === 'Fee Waiver Application');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <span>Parent Portal & Direct Institutional Communications</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Parent Dashboard: {currentUser?.name}</h1>
          <p className="text-xs text-teal-100 mt-1">
            Schedule meetings with the Principal, review child document applications, and track institutional permissions.
          </p>
        </div>

        <button
          onClick={onOpenCreateAppointment}
          className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Schedule Meeting with Principal
        </button>
      </div>

      {/* Child Profile Selector */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Currently Selected Child Profile</p>
            <h3 className="text-sm font-bold text-slate-900">Aarav Sharma (B.Tech Electronics & Comm. Year 3)</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Roll No: <strong>2022ECE018</strong></span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">Good Academic Standing (8.7 CGPA)</span>
        </div>
      </div>

      {/* Parent Appointment Requests */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" /> Parent-Principal Meeting Requests
          </h3>
        </div>

        <div className="space-y-3">
          {parentAppointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-teal-600">{apt.id}</span>
                  <h4 className="text-sm font-bold text-slate-800">{apt.subject}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={apt.status} />
                  <button
                    onClick={() => setSelectedAppointment(apt)}
                    className="px-3 py-1 bg-slate-900 hover:bg-teal-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-400" /> Track Lifecycle
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600">{apt.description}</p>

              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>Requested Slot: <strong>{apt.preferredDate} at {apt.preferredTime}</strong></span>
                {apt.scheduledSlot && (
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-bold">
                    Confirmed Slot: {apt.scheduledSlot}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Child Document Approvals */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" /> Child Leave & Medical Certificate Submissions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {childDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800">{doc.docTitle}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Submitted: {doc.submittedDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={doc.status} size="sm" />
                <button
                  onClick={() => onSelectDocument(doc)}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Lifecycle Tracking Modal */}
      <AppointmentLifecycleModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};

