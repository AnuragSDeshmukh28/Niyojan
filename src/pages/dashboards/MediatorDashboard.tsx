import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { AppointmentLifecycleModal } from '../../components/ui/AppointmentLifecycleModal';
import { AppointmentRequest, DocumentApproval } from '../../types';
import { Building2, ArrowRightCircle, CheckSquare, Clock, Filter, CheckCircle2, XCircle, AlertCircle, FileText, Activity } from 'lucide-react';

interface MediatorDashboardProps {
  onNavigate: (page: string) => void;
  onSelectDocument: (doc: DocumentApproval) => void;
}

export const MediatorDashboard: React.FC<MediatorDashboardProps> = ({ onNavigate, onSelectDocument }) => {
  const { appointments, documents, forwardAppointmentByMediator, rejectAppointment, verifyDocumentByMediator } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'documents'>('appointments');
  const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
  const [trackingAppointment, setTrackingAppointment] = useState<AppointmentRequest | null>(null);
  const [remarkText, setRemarkText] = useState('');

  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING_MEDIATOR');
  const pendingDocuments = documents.filter((d) => d.status === 'PENDING_VERIFICATION');

  const handleForward = (id: string) => {
    forwardAppointmentByMediator(id, remarkText || 'Identity & documents verified by Mediator Desk. Forwarded for Principal Approval.');
    setSelectedAptId(null);
    setRemarkText('');
  };

  const handleReject = (id: string) => {
    rejectAppointment(id, remarkText || 'Application incomplete or invalid documentation attached.');
    setSelectedAptId(null);
    setRemarkText('');
  };

  const appointmentColumns: Column<AppointmentRequest>[] = [
    {
      header: 'Request ID & Subject',
      cell: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-600 text-xs">{item.id}</span>
            <PriorityBadge priority={item.priority} />
          </div>
          <p className="font-bold text-slate-800 text-xs mt-0.5 line-clamp-1">{item.subject}</p>
          <p className="text-[11px] text-slate-500">Category: {item.category}</p>
        </div>
      ),
    },
    {
      header: 'Applicant Identity',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <img src={item.requestedBy.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="" className="w-7 h-7 rounded-full object-cover" />
          <div>
            <p className="font-bold text-slate-800 text-xs">{item.requestedBy.name}</p>
            <p className="text-[10px] text-slate-500">{item.requestedBy.identifier || item.requestedBy.role}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Requested Slot',
      cell: (item) => (
        <div className="text-xs text-slate-700 font-medium">
          <p>{item.preferredDate}</p>
          <p className="text-[10px] text-slate-500">{item.preferredTime}</p>
        </div>
      ),
    },
    {
      header: 'Triage & Lifecycle',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAptId(item.id);
              setRemarkText('Identity matched with registrar database. Document verified.');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" /> Triage
          </button>
          <button
            onClick={() => setTrackingAppointment(item)}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" /> Track
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mediator Header Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
            <span>Mediator Desk (Office Administrative Filter Layer)</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Request Review & Verification Center</h1>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            You are the gatekeeper. Verify incoming student/parent/faculty submissions before forwarding clean packets to the Principal Executive Office.
          </p>
        </div>

        <div className="px-4 py-3 bg-amber-950/80 border border-amber-500/30 rounded-xl text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Queue Processing Velocity</span>
          <p className="text-2xl font-black text-white mt-0.5">14 Mins Avg</p>
        </div>
      </div>

      {/* KPI Queue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Appointments for Triage</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingAppointments.length} Requests</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Documents to Verify</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{pendingDocuments.length} Documents</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Forwarded to Principal Today</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">18 Cleared</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ArrowRightCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Appointment Triage Queue ({pendingAppointments.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Document Verification Desk ({pendingDocuments.length})
        </button>
      </div>

      {/* Triage Modal Dialog if Selected */}
      {selectedAptId && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" /> Triage & Verification Inspector (ID: {selectedAptId})
            </h3>
            <button
              onClick={() => setSelectedAptId(null)}
              className="text-xs text-amber-700 font-bold hover:underline"
            >
              Cancel Triage
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1">
              Add Official Office Verification Remarks *
            </label>
            <textarea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              rows={2}
              placeholder="e.g. Student GPA verified (8.9). Endorsed by HOD ECE. Application packet verified clean for Principal."
              className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleReject(selectedAptId)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject Request
            </button>

            <button
              onClick={() => handleForward(selectedAptId)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <ArrowRightCircle className="w-4 h-4" /> Forward to Principal Executive Desk
            </button>
          </div>
        </div>
      )}

      {/* Main Queue Content */}
      {activeTab === 'appointments' ? (
        <DataTable
          data={pendingAppointments}
          columns={appointmentColumns}
          searchPlaceholder="Search pending mediator queue..."
          emptyTitle="No pending appointment applications"
          emptySubtitle="All incoming requests have been triaged and forwarded to Principal!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDocuments.map((doc) => (
            <div key={doc.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600">{doc.id}</span>
                  <h4 className="text-sm font-bold text-slate-800">{doc.docTitle}</h4>
                </div>
                <StatusBadge status={doc.status} size="sm" />
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg space-y-1">
                <p>Submitted By: <strong>{doc.submittedBy.name}</strong> ({doc.submittedBy.identifier})</p>
                <p>Category: <strong>{doc.docCategory}</strong> • {doc.fileSize}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => onSelectDocument(doc)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Inspect File
                </button>
                <button
                  onClick={() => verifyDocumentByMediator(doc.id, 'Identity & certificate validated by Mediator.')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Attach Mediator Seal
                </button>
              </div>
            </div>
          ))}

          {pendingDocuments.length === 0 && (
            <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No pending documents to verify.
            </div>
          )}
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
