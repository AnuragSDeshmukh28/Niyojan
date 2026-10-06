import React from 'react';
import { AppointmentRequest } from '../../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { WorkflowStepper } from './WorkflowStepper';
import { X, Calendar, Clock, User, ShieldCheck, UserCheck, Paperclip, Activity, Tag, FileText } from 'lucide-react';

interface AppointmentLifecycleModalProps {
  appointment: AppointmentRequest | null;
  onClose: () => void;
}

export const AppointmentLifecycleModal: React.FC<AppointmentLifecycleModalProps> = ({
  appointment,
  onClose,
}) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-extrabold text-xs text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-400/30">
                {appointment.id}
              </span>
              <PriorityBadge priority={appointment.priority} />
              <StatusBadge status={appointment.status} />
            </div>
            <h2 className="text-lg font-black text-white mt-2 leading-snug">{appointment.subject}</h2>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-teal-400" /> Category: <strong className="text-white">{appointment.category}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Workflow Stepper */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" /> Live Lifecycle Approval Chain
            </h3>
            <WorkflowStepper status={appointment.status} />
          </div>

          {/* Grid: Requester & Timing Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Applicant Profile Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" /> Applicant Details
              </div>
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={appointment.requestedBy.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900">{appointment.requestedBy.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{appointment.requestedBy.role} Persona</p>
                  <p className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">
                    ID: {appointment.requestedBy.identifier || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timing & Target Officer Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-teal-600" /> Schedule & Target Desk
              </div>
              <div className="text-xs space-y-1.5 text-slate-600 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Executive:</span>
                  <span className="font-bold text-slate-900">{appointment.targetPersona} Desk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Preferred Date & Time:</span>
                  <span className="font-semibold text-slate-800">{appointment.preferredDate} ({appointment.preferredTime})</span>
                </div>
                {appointment.scheduledSlot && (
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 flex items-center justify-between font-bold text-[11px]">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-purple-600" /> Confirmed Slot:</span>
                    <span>{appointment.scheduledSlot}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Description Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" /> Purpose & Request Description
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
              {appointment.description || 'No detailed statement provided.'}
            </p>
            {appointment.attachmentName && (
              <div className="pt-2 flex items-center gap-2 text-xs text-blue-700 font-semibold">
                <Paperclip className="w-4 h-4 text-blue-500" />
                <span>Attachment: {appointment.attachmentName} ({appointment.attachmentSize})</span>
              </div>
            )}
          </div>

          {/* Administrative Remarks */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Administrative Audit Endorsements
            </h3>

            {/* Mediator Remarks */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-amber-600" /> Mediator Verification Desk Remarks
              </div>
              <p className="text-xs text-slate-700 italic pl-6">
                "{appointment.mediatorRemarks || 'Verification pending or awaiting mediator desk triage.'}"
              </p>
            </div>

            {/* Principal Remarks */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600" /> Principal Executive Decision Notes
              </div>
              <p className="text-xs text-slate-700 italic pl-6">
                "{appointment.principalRemarks || 'Awaiting final Principal Executive decision and sign-off.'}"
              </p>
            </div>
          </div>

          {/* Detailed Audit History Timeline */}
          {appointment.history && appointment.history.length > 0 && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Audit Log Trail
              </h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-700">
                {appointment.history.map((h, i) => (
                  <div key={h.id || i} className="relative text-xs space-y-0.5">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold text-white">{h.actor} ({h.role})</span>
                      <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                    </div>
                    <p className="text-blue-300 font-semibold text-[11px]">{h.action}</p>
                    {h.comment && <p className="text-slate-400 text-[11px] italic">"{h.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow transition-all"
          >
            Close Lifecycle View
          </button>
        </div>

      </div>
    </div>
  );
};
