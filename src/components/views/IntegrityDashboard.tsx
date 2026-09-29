import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Fingerprint, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, type BlockchainVerificationResult } from '../../services/api';

export const IntegrityDashboard: React.FC = () => {
  const { activeCase, activeCaseId } = useAuth();
  const [results, setResults] = useState<Record<string, BlockchainVerificationResult>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const files = activeCase?.uploadedFiles ?? [];

  const verify = async (fileId: string) => {
    setBusy(fileId); setMessage('');
    try {
      const response = await api.verifyOnBlockchain(fileId);
      setResults((current) => ({ ...current, [fileId]: response.verification }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Verification failed.');
    } finally { setBusy(null); }
  };

  const restoreDemo = async (fileId: string) => {
    setBusy(fileId); setMessage('');
    try {
      const response = await api.restoreDemoFile(fileId);
      setMessage(response.message);
      const verification = await api.verifyOnBlockchain(fileId);
      setResults((current) => ({ ...current, [fileId]: verification.verification }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Restore failed.');
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#7CD5C7]/30 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[#073B4C] flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-[#118AB2]" /> Evidence Integrity Check
          </h1>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
            {activeCaseId || 'No Case'}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Verify digital SHA-256 cryptographic fingerprints against anchored blockchain smart contract ledger records.
        </p>
      </div>

      <section className="rounded-3xl border border-[#7CD5C7]/30 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#073B4C]">
              <Shield className="h-4 w-4 text-[#118AB2]" /> Cryptographic Ledger Audit
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Inspect uploaded case files to ensure zero tampering and verify authenticity against immutable block hashes.
            </p>
          </div>
          <span className="rounded-full border border-[#7CD5C7]/40 bg-[#F2F2ED] px-3 py-1 text-[11px] font-mono font-bold text-[#073B4C]">
            SHA-256 · Ledger Anchor
          </span>
        </div>

        {message && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900 shadow-2xs">
            {message}
          </p>
        )}

        {files.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#F2F2ED]/50 border border-[#7CD5C7]/30 space-y-2">
            <Fingerprint className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-[#073B4C]">No uploaded files in this case workspace.</p>
            <p className="text-xs text-slate-600">Upload an evidence document under "Upload Case File Details" to verify its cryptographic ledger status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => {
              const result = results[file.fileId];
              const isTampered = result && !result.isValid;
              return (
                <div 
                  key={file.fileId} 
                  className={`rounded-2xl border p-4.5 space-y-3 transition-all ${
                    isTampered ? 'border-rose-300 bg-rose-50/80 shadow-sm' : 'border-[#7CD5C7]/30 bg-[#F2F2ED]/40 hover:bg-[#F2F2ED]/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">{file.fileName}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">
                        {file.fileId} · Sealed {file.uploadTime} · Category: <span className="font-bold text-[#073B4C]">{file.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div 
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                        isTampered 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : result 
                          ? 'bg-[#7CD5C7]/20 text-[#073B4C] border border-[#7CD5C7]/50' 
                          : 'bg-[#F2F2ED] text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isTampered ? (
                        <><ShieldAlert className="h-3.5 w-3.5" /> Integrity Mismatch</>
                      ) : result ? (
                        <><ShieldCheck className="h-3.5 w-3.5 text-[#118AB2]" /> Verified Ledger Integrity</>
                      ) : (
                        <>Not Verified</>
                      )}
                    </div>
                  </div>

                  {result && (
                    <div className={`rounded-xl border p-3.5 text-[11px] ${isTampered ? 'border-rose-200 bg-white text-rose-950' : 'border-[#7CD5C7]/40 bg-white text-[#073B4C]'}`}>
                      <p className="flex items-center gap-1.5 font-bold text-xs">
                        {isTampered ? <AlertTriangle className="h-4 w-4 text-rose-600" /> : <CheckCircle2 className="h-4 w-4 text-[#118AB2]" />}
                        {result.verificationMessage}
                      </p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2 font-mono text-[10px]">
                        <div className="break-all p-2 rounded-lg bg-[#F2F2ED] border border-[#7CD5C7]/30">
                          <b>Current File SHA-256:</b><br />
                          <span className="text-slate-700">{result.currentHash}</span>
                        </div>
                        <div className="break-all p-2 rounded-lg bg-[#F2F2ED] border border-[#7CD5C7]/30">
                          <b>Original Anchored SHA-256:</b><br />
                          <span className="text-slate-700">{result.onChainHash}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button 
                      type="button" 
                      disabled={busy === file.fileId} 
                      onClick={() => verify(file.fileId)} 
                      className="rounded-xl bg-[#118AB2] hover:bg-[#073B4C] px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      {busy === file.fileId ? 'Verifying on Ledger…' : 'Verify File Integrity'}
                    </button>
                    {isTampered && (
                      <button 
                        type="button" 
                        disabled={busy === file.fileId} 
                        onClick={() => restoreDemo(file.fileId)} 
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        Restore File
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
