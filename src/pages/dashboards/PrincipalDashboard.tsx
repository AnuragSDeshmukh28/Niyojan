import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { WorkflowStepper } from '../../components/ui/WorkflowStepper';
import { AppointmentLifecycleModal } from '../../components/ui/AppointmentLifecycleModal';
import { AppointmentRequest, DocumentApproval, DepartmentMetric } from '../../types';
import {
  Crown,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  FileCheck,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  Paperclip,
  BarChart3,
  Sliders,
  Activity,
} from 'lucide-react';
import { DEPARTMENT_ANALYTICS } from '../../data/mockData';

interface PrincipalDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDocument: (doc: DocumentApproval) => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ onNavigate, onSelectDocument }) => {
  const {
    appointments,
    documents,
    approveAppointmentByPrincipal,
    rejectAppointment,
    rescheduleAppointment,
    approveDocumentByPrincipal,
  } = useApp();

  const [activeDeckTab, setActiveDeckTab] = useState<'appointments' | 'documents' | 'analytics'>('appointments');
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [trackingAppointment, setTrackingAppointment] = useState<AppointmentRequest | null>(null);
  const [slotDate, setSlotDate] = useState('2026-08-16');
  const [slotTime, setSlotTime] = useState('11:30 AM');
  const [principalNotes, setPrincipalNotes] = useState('');

  const forwardedAppointments = appointments.filter((a) => a.status === 'FORWARDED_TO_PRINCIPAL');
  const verifiedDocs = documents.filter((d) => d.status === 'VERIFIED_BY_MEDIATOR');

  const approvedTodayCount = appointments.filter((a) => a.status === 'APPROVED').length;
  const approvedDocsCount = documents.filter((d) => d.status === 'APPROVED_BY_PRINCIPAL').length;

  const handleApproveAppointment = (id: string) => {
    approveAppointmentByPrincipal(
      id,
      `${slotDate} at ${slotTime}`,
      principalNotes || 'Approved for executive meeting. Scheduled slot confirmed.'
    );
    setSelectedAptId(null);
    setPrincipalNotes('');
  };

  const handleRejectAppointment = (id: string) => {
    rejectAppointment(id, principalNotes || 'Executive request declined by Principal Office.');
    setSelectedAptId(null);
    setPrincipalNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Principal Executive Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-purple-800/40">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4 text-amber-400" /> Office of the Principal & Director
          </div>
          <h1 className="text-2xl font-black mt-1">Executive Command Center</h1>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            Streamlined counter-signatures, one-click appointment slotting, and real-time institutional approval governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-purple-950/80 border border-purple-500/30 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Approval Rate</span>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">94.8%</p>
          </div>
        </div>
      </div>

      {/* KPI Overview Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Executive Appointments</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{forwardedAppointments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Documents Awaiting Counter-Sign</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{verifiedDocs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Appointments Approved Today</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedTodayCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Digital Seals Issued</p>
            <p className="text-2xl font-extrabold text-teal-600 mt-1">{approvedDocsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Approval Deck & Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveDeckTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeDeckTab === 'appointments'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Crown className="w-4 h-4" /> Pending Appointments Deck ({forwardedAppointments.length})
        </button>

        <button
          onClick={() => setActiveDeckTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeDeckTab === 'documents'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Document Counter-Sign Desk ({verifiedDocs.length})
        </button>

        <button
          onClick={() => setActiveDeckTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeDeckTab === 'analytics'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Institutional Analytics
        </button>
      </div>

      {/* Appointment Approval Deck Content */}
      {activeDeckTab === 'appointments' && (
        <div className="space-y-4">
          {forwardedAppointments.map((apt) => (
            <div
              key={apt.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-purple-700 text-sm">{apt.id}</span>
                  <PriorityBadge priority={apt.priority} />
                  <span className="text-xs font-bold text-slate-700">{apt.category}</span>
                </div>
                <StatusBadge status={apt.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900">{apt.subject}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{apt.description}</p>

                  {/* Mediator Endorsement Note */}
                  {apt.mediatorRemarks && (
                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 mt-2">
                      <span className="font-bold">Mediator Triage Note: </span>
                      <span>{apt.mediatorRemarks}</span>
                    </div>
                  )}

                  {apt.attachmentName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" /> Attached Proof: {apt.attachmentName} ({apt.attachmentSize})
                    </div>
                  )}
                </div>

                {/* Applicant Profile */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicant</span>
                  <div className="flex items-center gap-3">
                    <img src={apt.requestedBy.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/20" />
                    <div>
                      <p className="font-bold text-slate-900">{apt.requestedBy.name}</p>
                      <p className="text-[10px] text-slate-500">{apt.requestedBy.identifier || apt.requestedBy.role}</p>
                      <p className="text-[10px] text-purple-600 font-semibold">{apt.requestedBy.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar / Slot Selector */}
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
                  <span className="font-bold text-purple-900">Schedule Meeting Slot:</span>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 font-medium"
                  />
                  <input
                    type="text"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-28 px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleRejectAppointment(apt.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                  >
                    Decline
                  </button>

                  <button
                    onClick={() => handleApproveAppointment(apt.id)}
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Confirm Slot
                  </button>
                </div>
              </div>
            </div>
          ))}

          {forwardedAppointments.length === 0 && (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              All executive appointment requests have been processed. Principal desk is up to date!
            </div>
          )}
        </div>
      )}

      {/* Document Counter-Sign Desk */}
      {activeDeckTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifiedDocs.map((doc) => (
            <div key={doc.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-600">{doc.id}</span>
                  <h4 className="text-sm font-bold text-slate-800">{doc.docTitle}</h4>
                </div>
                <StatusBadge status={doc.status} size="sm" />
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
                <p>Applicant: <strong>{doc.submittedBy.name}</strong> ({doc.submittedBy.identifier})</p>
                <p>Mediator Verification Note: <em className="text-amber-800">"{doc.mediatorNote}"</em></p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => onSelectDocument(doc)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  View Document
                </button>
                <button
                  onClick={() => approveDocumentByPrincipal(doc.id, 'Counter-signed by Principal. Official Digital Seal attached.')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Counter-Sign Document
                </button>
              </div>
            </div>
          ))}

          {verifiedDocs.length === 0 && (
            <div className="col-span-2 py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No verified documents waiting for Principal signature.
            </div>
          )}
        </div>
      )}

      {/* Analytics Visual Dashboard */}
      {activeDeckTab === 'analytics' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Institutional Turnaround & Department Efficiency</h3>
              <p className="text-xs text-slate-500">Average resolution metrics across all academic departments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEPARTMENT_ANALYTICS.map((dept, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{dept.name}</span>
                  <span className="text-purple-600">{dept.approvedCount} / {dept.totalRequests} Approved</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${(dept.approvedCount / dept.totalRequests) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Turnaround speed: <strong>{dept.avgResponseHours} Hours Avg</strong></span>
                  <span className="font-semibold text-emerald-600">
                    {Math.round((dept.approvedCount / dept.totalRequests) * 100)}% Pass Rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Lifecycle Modal */}
      <AppointmentLifecycleModal
        appointment={trackingAppointment}
        onClose={() => setTrackingAppointment(null)}
      />
    </div>
  );
};
