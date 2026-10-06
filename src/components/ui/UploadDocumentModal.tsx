import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const { uploadDocument, isLoading } = useApp();

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Bonafide Certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;

    await uploadDocument({
      docTitle,
      docCategory,
      file: selectedFile || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Upload Institutional Document for Approval</h3>
              <p className="text-[11px] text-slate-500">Includes digital stamp & verification tracking</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Character & Conduct Certificate Request for Higher Studies"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Category</label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="Bonafide Certificate">Bonafide Certificate</option>
              <option value="Fee Waiver Application">Fee Waiver Application</option>
              <option value="Medical Leave Clearance">Medical Leave Clearance</option>
              <option value="NOC">No Objection Certificate (NOC)</option>
              <option value="Transcript Request">Academic Transcript Request</option>
              <option value="Faculty Clearance">Faculty Clearance & Research Grant</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select File (PDF / PNG / JPG up to 10MB)</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 text-center hover:bg-teal-50/30 hover:border-teal-300 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : 'Click to select document file'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF, PNG, JPG supported (Default PDF auto-generated if unselected)'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-[11px] text-teal-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              <strong>Digital Security:</strong> Submitted files receive a cryptographic hash and watermark during Mediator desk verification before Principal signing.
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
              disabled={isLoading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {isLoading ? "Uploading..." : "Submit Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
