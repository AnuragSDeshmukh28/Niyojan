import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DocumentApproval } from '../../types';
import { FileText, PlusCircle, ShieldCheck, Download, Eye } from 'lucide-react';

interface DocumentsPageProps {
  onOpenUploadModal: () => void;
  onSelectDocument: (doc: DocumentApproval) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onOpenUploadModal, onSelectDocument }) => {
  const { documents } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredDocs = documents.filter((d) => {
    if (filterCategory === 'ALL') return true;
    return d.docCategory === filterCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" /> Digital Document Management & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official certificate applications with Mediator validation & Principal digital seals
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'ALL', label: 'All Documents' },
          { key: 'Bonafide Certificate', label: 'Bonafide Certificates' },
          { key: 'NOC', label: 'NOC Requests' },
          { key: 'Medical Leave', label: 'Medical Leave' },
          { key: 'Faculty Clearance', label: 'Faculty Clearances' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterCategory(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === tab.key
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <span className="text-[10px] font-mono font-bold text-teal-600">{doc.id}</span>
                <StatusBadge status={doc.status} size="sm" />
              </div>

              <h3 className="text-sm font-bold text-slate-800 mt-3 line-clamp-2">{doc.docTitle}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{doc.docCategory}</p>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <p>Applicant: <strong>{doc.submittedBy.name}</strong></p>
                <p>Submitted Date: {doc.submittedDate}</p>
                {doc.approvalReferenceNo && (
                  <p className="text-emerald-700 font-mono font-bold">Ref: {doc.approvalReferenceNo}</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onSelectDocument(doc)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Inspect File
              </button>

              <button
                onClick={() => alert(`Simulating download of PDF for ${doc.docTitle}`)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
