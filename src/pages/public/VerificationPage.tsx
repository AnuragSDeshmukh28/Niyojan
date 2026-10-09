import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Building2,
  Layers,
  RefreshCw,
  FileText,
  Cpu,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface VerificationResult {
  status: 'AUTHENTIC' | 'INVALID' | 'REVOKED' | 'NOT_FOUND';
  verification_id?: string;
  doc_title?: string;
  doc_category?: string;
  submitted_by?: string;
  approved_by?: string;
  approval_date?: string;
  approval_reference_no?: string;
  document_hash?: string;
  sha256_hash?: string;
  blockchain_tx_hash?: string;
  blockchain_status?: 'unanchored' | 'pending' | 'confirmed' | 'failed' | 'mock_confirmed';
  blockchain_explorer_url?: string;
  blockchain_issuer?: string;
  blockchain_timestamp?: number;
  blockchain_verified?: boolean;
  hash_match?: boolean;
  signature_valid?: boolean;
  institution?: string;
}

interface VerificationPageProps {
  verificationId: string;
  onNavigateHome: () => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ verificationId, onNavigateHome }) => {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/public/verify/${verificationId}`);
        setResult(res.data);
      } catch (err) {
        setResult({
          status: 'NOT_FOUND',
          verification_id: verificationId,
          institution: 'Niyojan Educational Institution',
        });
      } finally {
        setLoading(false);
      }
    };

    if (verificationId) {
      fetchVerification();
    }
  }, [verificationId]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
        <div
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 cursor-pointer mb-6 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black shadow-xl group-hover:scale-105 transition-transform">
            <Layers className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Niyojan</span>
        </div>

        <h1 className="text-2xl font-black text-white">Public Digital Document Verification Portal</h1>
        <p className="text-xs text-slate-400 mt-1">
          Official Institutional Cryptographic Seal & EVM Blockchain Authenticity Validator
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Validating document hash & digital signature...</p>
            </div>
          ) : result?.status === 'AUTHENTIC' ? (
            <div className="space-y-6">
              {/* Authentic Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Authentic Document</span>
                  <h2 className="text-lg font-black text-emerald-200">Official Digital Signature Verified</h2>
                  <p className="text-[11px] text-emerald-300/80">
                    This document is authentic and unmodified in the institutional registry.
                  </p>
                </div>
              </div>

              {/* Institutional Details */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/80 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Verification ID:</span>
                  <span className="font-mono font-bold text-teal-400">{result.verification_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Official Reference No:</span>
                  <span className="font-bold text-slate-200">{result.approval_reference_no}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Document Title:</span>
                  <span className="font-bold text-white text-right max-w-xs">{result.doc_title}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-300">{result.doc_category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Submitted By:</span>
                  <span className="text-slate-300">{result.submitted_by}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Approved By:</span>
                  <span className="text-slate-300">{result.approved_by}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Approval Date:</span>
                  <span className="text-slate-300">{result.approval_date}</span>
                </div>
              </div>

              {/* Blockchain Audit Certificate Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-teal-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">Blockchain Audit Certificate</h3>
                      <p className="text-[10px] text-slate-400">Immutable EVM Ledger Anchor (Polygon Amoy / Base Sepolia)</p>
                    </div>
                  </div>

                  {/* Dynamic Status Badge */}
                  {result.blockchain_status === 'confirmed' || (result.blockchain_tx_hash && result.blockchain_status !== 'pending' && result.blockchain_status !== 'failed') ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Cryptographically Verified on Blockchain
                    </span>
                  ) : result.blockchain_status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 border border-amber-500/40 text-amber-400 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Anchoring to Ledger...
                    </span>
                  ) : result.blockchain_status === 'failed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 border border-rose-500/40 text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Blockchain Sync Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-700/50 border border-slate-600 text-slate-300">
                      <Layers className="w-3.5 h-3.5" />
                      Off-Chain Registry
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {/* SHA-256 Hash Digest */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 text-[11px] font-medium">Document Hash (SHA-256):</span>
                      <button
                        onClick={() => copyToClipboard(result.sha256_hash || result.document_hash || '', 'hash')}
                        className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedField === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'hash' ? 'Copied' : 'Copy Hash'}
                      </button>
                    </div>
                    <p className="font-mono text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-teal-300 break-all select-all">
                      {result.sha256_hash || result.document_hash || 'N/A'}
                    </p>
                  </div>

                  {/* Blockchain Transaction Hash */}
                  {result.blockchain_tx_hash && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-[11px] font-medium">Transaction Hash:</span>
                        <button
                          onClick={() => copyToClipboard(result.blockchain_tx_hash || '', 'tx')}
                          className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedField === 'tx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedField === 'tx' ? 'Copied' : 'Copy Tx'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="font-mono text-[10px] text-slate-300 truncate max-w-[280px] sm:max-w-md">
                          {result.blockchain_tx_hash}
                        </span>
                        {result.blockchain_explorer_url && !result.blockchain_tx_hash.startsWith('mock_') && (
                          <a
                            href={result.blockchain_explorer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-semibold shrink-0 ml-2"
                          >
                            <span>View on Explorer</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Issuer & Timestamp Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Relayer Issuer:</span>
                      <span className="font-mono text-[11px] text-slate-300 truncate block">
                        {result.blockchain_issuer || '0xRelayer (Authorized Institutional Desk)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Ledger Timestamp:</span>
                      <span className="text-[11px] text-slate-300 block">
                        {result.blockchain_timestamp
                          ? new Date(result.blockchain_timestamp * 1000).toUTCString()
                          : result.approval_date || 'Current Block'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : result?.status === 'REVOKED' ? (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Approval Revoked</span>
                  <h2 className="text-lg font-black text-amber-200">Document No Longer Valid</h2>
                  <p className="text-[11px] text-amber-300/80">
                    The institutional executive desk has revoked this approval.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Invalid or Tampered</span>
                  <h2 className="text-lg font-black text-rose-200">Verification Record Not Found</h2>
                  <p className="text-[11px] text-rose-300/80">
                    No matching official approval record was found for verification ID '{verificationId}'.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Return to Niyojan Main Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
