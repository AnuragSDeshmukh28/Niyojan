import React from 'react';
import { AppointmentStatus, DocumentStatus, PriorityLevel } from '../../types';
import { Clock, CheckCircle2, XCircle, ArrowRightCircle, Calendar, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: AppointmentStatus | DocumentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  switch (status) {
    case 'PENDING_MEDIATOR':
    case 'PENDING_VERIFICATION':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Pending Mediator</span>
        </span>
      );

    case 'FORWARDED_TO_PRINCIPAL':
    case 'VERIFIED_BY_MEDIATOR':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}>
          <ArrowRightCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Forwarded to Principal</span>
        </span>
      );

    case 'APPROVED':
    case 'APPROVED_BY_PRINCIPAL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved</span>
        </span>
      );

    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejected</span>
        </span>
      );

    case 'RESCHEDULED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses[size]}`}>
          <Calendar className="w-3.5 h-3.5 text-purple-600" />
          <span>Slot Rescheduled</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>Completed</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles = {
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200 font-semibold',
    Urgent: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${styles[priority]}`}>
      {priority} Priority
    </span>
  );
};
