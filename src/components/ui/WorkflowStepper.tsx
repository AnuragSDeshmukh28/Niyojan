import React from 'react';
import { AppointmentStatus, DocumentStatus } from '../../types';
import { FileText, UserCheck, ShieldCheck, CalendarCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface WorkflowStepperProps {
  status: AppointmentStatus | DocumentStatus;
  compact?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ status, compact = false }) => {
  const steps = [
    { key: 'submission', title: 'Request Submission', subtitle: 'Step 1', icon: FileText, desc: 'Applicant files request online' },
    { key: 'mediator', title: 'Mediator Audit Desk', subtitle: 'Step 2', icon: UserCheck, desc: 'Staff checks credentials & records' },
    { key: 'principal', title: 'Principal Executive Review', subtitle: 'Step 3', icon: ShieldCheck, desc: 'Executive decision & approval' },
    { key: 'scheduled', title: 'Slot Booking / Stamp', subtitle: 'Step 4', icon: CalendarCheck, desc: 'Meeting slot assigned or stamp applied' },
    { key: 'completed', title: 'Completion & Archival', subtitle: 'Step 5', icon: CheckCircle2, desc: 'Request finalized & logged' },
  ];

  const getActiveStep = () => {
    switch (status) {
      case 'PENDING_MEDIATOR':
      case 'PENDING_VERIFICATION':
        return 1;
      case 'FORWARDED_TO_PRINCIPAL':
      case 'VERIFIED_BY_MEDIATOR':
        return 2;
      case 'APPROVED':
      case 'APPROVED_BY_PRINCIPAL':
      case 'RESCHEDULED':
        return 3;
      case 'COMPLETED':
        return 4;
      case 'REJECTED':
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveStep();
  const isRejected = status === 'REJECTED';

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className={`h-2.5 w-2.5 rounded-full ring-2 ${
          isRejected 
            ? 'bg-rose-500 ring-rose-200 animate-pulse' 
            : activeIndex === 4 
            ? 'bg-emerald-500 ring-emerald-200' 
            : 'bg-blue-600 ring-blue-200 animate-pulse'
        }`} />
        <span className="text-slate-800 font-bold">
          {isRejected ? 'Rejected by Administration' : steps[activeIndex]?.title || 'Submitted'}
        </span>
      </div>
    );
  }

  const progressPercent = isRejected ? 100 : Math.min(100, Math.max(0, (activeIndex / (steps.length - 1)) * 100));

  return (
    <div className="w-full py-3 bg-slate-900/5 p-4 rounded-2xl border border-slate-200/70 shadow-inner space-y-4">
      {/* Top Header Summary */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
            Approval Lifecycle Workflow
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Progress:</span>
          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
            isRejected 
              ? 'bg-rose-100 text-rose-700' 
              : activeIndex === 4 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isRejected ? 'TERMINATED' : `${Math.round(progressPercent)}%`}
          </span>
        </div>
      </div>

      {/* Main Stepper Visual Bar */}
      <div className="relative pt-2 pb-1">
        {/* Background Line */}
        <div className="absolute left-6 right-6 top-7 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0" />
        
        {/* Filled Progress Line */}
        <div
          className={`absolute left-6 top-7 -translate-y-1/2 h-1.5 rounded-full transition-all duration-700 z-0 ${
            isRejected
              ? 'bg-gradient-to-r from-amber-500 to-rose-600'
              : 'bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500'
          }`}
          style={{ width: `calc(${progressPercent}% * (1 - 48px / 100%) + 24px)` }}
        />

        {/* Nodes Grid */}
        <div className="relative z-10 flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeIndex && !isRejected;
            const isCurrent = idx === activeIndex && !isRejected;
            const isTargetRejected = isRejected && idx === Math.abs(activeIndex);

            return (
              <div key={step.key} className="flex flex-col items-center group cursor-default">
                {/* Circle Icon Container */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300 shadow-md ${
                    isTargetRejected
                      ? 'bg-rose-600 text-white ring-4 ring-rose-200 scale-110 shadow-rose-300/50'
                      : isCurrent
                      ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white ring-4 ring-blue-200 scale-110 shadow-blue-400/40 animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-100 shadow-emerald-200'
                      : 'bg-white text-slate-400 border-2 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Labels Below */}
                <div className="mt-3 text-center max-w-[100px] sm:max-w-[120px]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    {step.subtitle}
                  </span>
                  <p className={`text-xs font-bold leading-tight mt-0.5 ${
                    isCurrent 
                      ? 'text-blue-700' 
                      : isDone 
                      ? 'text-emerald-700' 
                      : isTargetRejected 
                      ? 'text-rose-600' 
                      : 'text-slate-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 hidden md:block leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner message for terminated / active status */}
      {isRejected ? (
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Workflow Terminated: This request was rejected by the administration desk.</span>
        </div>
      ) : activeIndex === 4 ? (
        <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Workflow Completed: All approvals and digital signatures have been finalized and logged in audit records.</span>
        </div>
      ) : null}
    </div>
  );
};

