import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Calendar, FileText, ShieldAlert, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, appointments, documents, auditLogs } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const queryLower = searchQuery.toLowerCase();

  const matchingAppointments = searchQuery
    ? appointments.filter(
        (a) =>
          a.subject.toLowerCase().includes(queryLower) ||
          a.id.toLowerCase().includes(queryLower) ||
          a.requestedBy.name.toLowerCase().includes(queryLower) ||
          a.category.toLowerCase().includes(queryLower)
      )
    : [];

  const matchingDocuments = searchQuery
    ? documents.filter(
        (d) =>
          d.docTitle.toLowerCase().includes(queryLower) ||
          d.id.toLowerCase().includes(queryLower) ||
          d.submittedBy.name.toLowerCase().includes(queryLower) ||
          d.docCategory.toLowerCase().includes(queryLower)
      )
    : [];

  const matchingLogs = searchQuery
    ? auditLogs.filter(
        (l) =>
          l.details.toLowerCase().includes(queryLower) ||
          l.actorName.toLowerCase().includes(queryLower)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search appointments, documents, roll numbers, audit logs... (e.g. 'Fee', 'NOC', 'Rohan')"
            className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-5">
          {!searchQuery ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Type anything to search across institutional requests, documents, and system audit logs.
              <div className="mt-3 flex justify-center gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-mono">APT-2026</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-mono">Bonafide</span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-mono">Rohan Verma</span>
              </div>
            </div>
          ) : (
            <>
              {/* Appointments */}
              {matchingAppointments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Appointments ({matchingAppointments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-600">{apt.id}</span>
                            <span className="text-xs font-semibold text-slate-800 line-clamp-1">{apt.subject}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            By {apt.requestedBy.name} • {apt.category}
                          </p>
                        </div>
                        <StatusBadge status={apt.status} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {matchingDocuments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> Documents ({matchingDocuments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2.5 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-teal-600">{doc.id}</span>
                            <span className="text-xs font-semibold text-slate-800">{doc.docTitle}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Submitted by {doc.submittedBy.name} ({doc.submittedBy.identifier})
                          </p>
                        </div>
                        <StatusBadge status={doc.status} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Logs */}
              {matchingLogs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" /> Audit Logs ({matchingLogs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingLogs.map((log) => (
                      <div key={log.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{log.actorName} ({log.actorRole})</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-slate-700 font-medium mt-1">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingAppointments.length === 0 && matchingDocuments.length === 0 && matchingLogs.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No matching records found for "{searchQuery}".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd> to close</span>
          <span>Niyojan Enterprise Search v2.4</span>
        </div>
      </div>
    </div>
  );
};
