import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { AppointmentLifecycleModal } from '../../components/ui/AppointmentLifecycleModal';
import { AppointmentRequest } from '../../types';
import { Calendar, PlusCircle, Eye, Activity } from 'lucide-react';

interface AppointmentsPageProps {
  onOpenCreateModal: () => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onOpenCreateModal }) => {
  const { appointments } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === 'ALL') return true;
    return apt.status === filterStatus;
  });

  const columns: Column<AppointmentRequest>[] = [
    {
      header: 'Request ID & Subject',
      cell: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-600 text-xs">{item.id}</span>
            <PriorityBadge priority={item.priority} />
          </div>
          <p className="font-bold text-slate-800 text-xs mt-0.5">{item.subject}</p>
          <p className="text-[11px] text-slate-500">Category: {item.category}</p>
        </div>
      ),
    },
    {
      header: 'Requested By',
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
      header: 'Date & Time',
      cell: (item) => (
        <div className="text-xs text-slate-700">
          <p className="font-semibold">{item.preferredDate}</p>
          <p className="text-[10px] text-slate-500">{item.preferredTime}</p>
          {item.scheduledSlot && (
            <span className="text-[10px] text-purple-700 font-bold block mt-0.5">Slot: {item.scheduledSlot}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Approval Status',
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Lifecycle Tracking',
      cell: (item) => (
        <button
          onClick={() => setSelectedAppointment(item)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl text-[11px] transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Activity className="w-3.5 h-3.5 text-blue-400" /> Track Lifecycle
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Institutional Appointments Module
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry & live lifecycle workflow for student, parent, and faculty applications
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Book New Appointment
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'PENDING_MEDIATOR', label: 'Pending Mediator' },
          { key: 'FORWARDED_TO_PRINCIPAL', label: 'Forwarded to Principal' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'RESCHEDULED', label: 'Rescheduled' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterStatus === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredAppointments}
        columns={columns}
        searchPlaceholder="Filter appointments by Subject, ID, Name or Category..."
      />

      {/* Lifecycle Tracking Modal */}
      <AppointmentLifecycleModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};

