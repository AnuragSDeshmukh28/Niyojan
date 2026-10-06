import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityLevel } from '../../types';
import { X, Calendar, Clock, AlertCircle, Paperclip, Send } from 'lucide-react';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({ isOpen, onClose }) => {
  const { createAppointment, currentUser, currentRole } = useApp();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Academic Inquiry');
  const [targetPersona, setTargetPersona] = useState<'Principal' | 'Faculty Head' | 'Administrative Director'>('Principal');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-08-17');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [attachmentName, setAttachmentName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    createAppointment({
      subject,
      category,
      description,
      requestedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentRole,
        email: currentUser.email,
        identifier: currentUser.identifier || currentUser.childRollNo,
        avatar: currentUser.avatar,
      },
      targetPersona,
      preferredDate,
      preferredTime,
      priority,
      attachmentName: attachmentName ? attachmentName : undefined,
      attachmentSize: attachmentName ? '1.8 MB' : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">New Administrative Appointment Request</h3>
              <p className="text-[11px] text-slate-500">Submitted directly to Mediator Desk for verification & routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject / Purpose of Meeting *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Request for Special Attendance Waiver for National Research Symposium"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Academic Inquiry">Academic Inquiry</option>
                <option value="Fee Concession">Fee Concession / Hardship</option>
                <option value="Parent-Teacher Meeting">Parent-Teacher Meeting</option>
                <option value="Leave Authorization">Leave Authorization</option>
                <option value="Research Project">Research Project Grant</option>
                <option value="Administrative Escalation">Administrative Escalation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Authority</label>
              <select
                value={targetPersona}
                onChange={(e) => setTargetPersona(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Principal">Principal Executive Office</option>
                <option value="Faculty Head">Department Head (HOD)</option>
                <option value="Administrative Director">Administrative Director</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                <option value="03:30 PM">03:30 PM - 04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Explanation & Context *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete background details, relevant roll numbers, course codes, or rationale for the meeting..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Supporting Document Attachment (Optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="e.g. application_signed_hod.pdf"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
              <button
                type="button"
                onClick={() => setAttachmentName('endorsed_proof_document.pdf')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1"
              >
                <Paperclip className="w-3.5 h-3.5" /> Attach Sample
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-[11px] text-blue-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Workflow Note:</strong> Once submitted, your appointment request will first be reviewed by the <strong>Mediator Desk</strong> (Office Staff) for document verification before reaching the <strong>Principal</strong>.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
