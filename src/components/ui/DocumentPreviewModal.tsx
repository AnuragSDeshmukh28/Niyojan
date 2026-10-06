import React from 'react';
import { DocumentApproval } from '../../types';
import { X, FileText, CheckCircle2, Download, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface DocumentPreviewModalProps {
  document: DocumentApproval | null;
  onClose: () => void;
  onApproveByPrincipal?: (id: string, note: string) => void;
  onVerifyByMediator?: (id: string, note: string) => void;
  userRole: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onApproveByPrincipal,
  onVerifyByMediator,
  userRole,
}) => {
  const [remarkInput, setRemarkInput] = React.useState('');

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">{document.docTitle}</h3>
                <StatusBadge status={document.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ref ID: <strong className="font-mono text-slate-700">{document.id}</strong> • Submitted on {document.submittedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-0.5">Submitted By</span>
              <div className="flex items-center gap-2 mt-1">
                <img src={document.submittedBy.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-800">{document.submittedBy.name}</p>
                  <p className="text-[10px] text-slate-500">{document.submittedBy.identifier}</p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-0.5">Document Category</span>
              <p className="font-semibold text-slate-800 mt-1">{document.docCategory}</p>
              <p className="text-[10px] text-slate-500">{document.fileType} ({document.fileSize})</p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block mb-0.5">Digital Stamp Status</span>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span>{document.digitalStampVerified ? 'Tamper-Proof Seal Attached' : 'Verification In Progress'}</span>
              </div>
              {document.approvalReferenceNo && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Ref: {document.approvalReferenceNo}
                </p>
              )}
            </div>
          </div>

          {/* Document Preview Canvas Mockup */}
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-900 text-white flex flex-col items-center justify-center min-h-[220px] shadow-inner group">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 mb-3 shadow-lg group-hover:scale-105 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold tracking-wide">{document.docTitle}</p>
            <p className="text-xs text-slate-400 mt-1">Official Institutional Document File ({document.fileSize})</p>

            {document.digitalStampVerified && (
              <div className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Digitally Signed & Validated by Niyojan Portal</span>
              </div>
            )}
          </div>

          {/* Verification Notes */}
          <div className="space-y-3 text-xs">
            {document.mediatorNote && (
              <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-lg">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Mediator Review Remark:
                </span>
                <p className="text-blue-800 mt-1 leading-relaxed">{document.mediatorNote}</p>
              </div>
            )}

            {document.principalNote && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Principal Decision Note:
                </span>
                <p className="text-emerald-800 mt-1 leading-relaxed">{document.principalNote}</p>
              </div>
            )}
          </div>

          {/* Executive Action Bar */}
          {userRole === 'mediator' && document.status === 'PENDING_VERIFICATION' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-amber-900">Mediator Office Triage Action</h4>
              <textarea
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Add mediator verification comments before forwarding to Principal..."
                className="w-full p-2.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                rows={2}
              />
              <button
                onClick={() => {
                  if (onVerifyByMediator) {
                    onVerifyByMediator(document.id, remarkInput || 'Verified credentials and document authenticity.');
                    onClose();
                  }
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
              >
                Verify & Attach Mediator Seal
              </button>
            </div>
          )}

          {userRole === 'principal' && document.status === 'VERIFIED_BY_MEDIATOR' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-900">Principal Executive Counter-Signature</h4>
              <textarea
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Add executive comments for final official endorsement..."
                className="w-full p-2.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                rows={2}
              />
              <button
                onClick={() => {
                  if (onApproveByPrincipal) {
                    onApproveByPrincipal(document.id, remarkInput || 'Approved and digitally signed by Principal Office.');
                    onClose();
                  }
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Digitally Sign & Counter-Approve Document
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => alert(`Simulating download of verified PDF: ${document.docTitle}`)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-subtle"
          >
            <Download className="w-4 h-4 text-blue-600" /> Download Document Copy
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
