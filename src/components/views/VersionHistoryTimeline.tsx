import React from 'react';
import type { UploadedCaseFile } from '../../types/auth';
import { GitCommit, ShieldCheck, Cpu, Clock, CheckCircle2 } from 'lucide-react';

interface VersionHistoryTimelineProps {
  currentFile: UploadedCaseFile;
  allCaseFiles: UploadedCaseFile[];
  onSelectVersion: (file: UploadedCaseFile) => void;
}

export const VersionHistoryTimeline: React.FC<VersionHistoryTimelineProps> = ({
  currentFile,
  allCaseFiles,
  onSelectVersion
}) => {
  // Find all files belonging to the same document lineage family
  const lineageRootId = currentFile.parentFileId || currentFile.fileId;

  const lineageFiles = allCaseFiles.filter(f => {
    if (f.fileId === currentFile.fileId) return true;
    if (f.parentFileId === currentFile.fileId) return true;
    if (f.fileId === currentFile.parentFileId) return true;
    if (currentFile.parentFileId && f.parentFileId === currentFile.parentFileId) return true;
    if (f.parentFileId === lineageRootId || f.fileId === lineageRootId) return true;
    // Fallback match on category & exact file name
    return f.category === currentFile.category && f.fileName === currentFile.fileName;
  });

  // Deduplicate by fileId
  const uniqueLineage = Array.from(new Map(lineageFiles.map(f => [f.fileId, f])).values());

  // Sort descending by version number (or upload time)
  uniqueLineage.sort((a, b) => (b.versionNumber || 1.0) - (a.versionNumber || 1.0));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-[#118AB2]" />
          <h3 className="text-sm font-bold text-[#073B4C]">Document Version Control & Lineage</h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 bg-[#F2F2ED] px-2.5 py-1 rounded-full border border-[#7CD5C7]/40">
          {uniqueLineage.length} {uniqueLineage.length === 1 ? 'REVISION' : 'REVISIONS'} TOTAL
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#118AB2] before:via-[#7CD5C7] before:to-slate-300">
        {uniqueLineage.map((verFile) => {
          const isSelected = verFile.fileId === currentFile.fileId;
          const isLatest = verFile.isLatestVersion || uniqueLineage[0].fileId === verFile.fileId;
          const verTag = verFile.version || `v${(verFile.versionNumber || 1.0).toFixed(1)}`;

          return (
            <div key={verFile.fileId} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-[23px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#118AB2] border-[#7CD5C7] ring-4 ring-[#118AB2]/20 text-white'
                    : isLatest
                    ? 'bg-[#7CD5C7] border-[#118AB2] text-[#073B4C]'
                    : 'bg-white border-slate-300 text-slate-400 group-hover:border-[#118AB2]'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : isLatest ? 'bg-[#073B4C]' : 'bg-slate-400'}`} />
              </div>

              {/* Version Card */}
              <div
                onClick={() => onSelectVersion(verFile)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F2F2ED] border-[#118AB2] shadow-sm ring-1 ring-[#118AB2]/20'
                    : 'bg-white border-slate-200 hover:border-[#118AB2] hover:shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                      isLatest ? 'bg-[#118AB2] text-white' : 'bg-[#073B4C] text-[#F2F2ED]'
                    }`}>
                      {verTag}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#7CD5C7]/20 text-[#073B4C] border border-[#7CD5C7]/50 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#118AB2]" /> LATEST VERSION
                      </span>
                    )}
                    {isSelected && !isLatest && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                        ACTIVE VIEW
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {verFile.uploadTime}
                  </span>
                </div>

                {/* Change Summary / Revision Note */}
                <div className="text-xs font-medium text-slate-800 bg-[#F2F2ED]/60 p-2.5 rounded-lg border border-[#7CD5C7]/30 mb-2">
                  <strong className="text-[10px] font-mono uppercase text-[#118AB2] block mb-0.5">REVISION SUMMARY:</strong>
                  {verFile.changeSummary || 'Initial document upload and cryptographic hash seal.'}
                </div>

                {/* Officer & Hashes Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 pt-1">
                  <div>
                    <span className="text-slate-400">Author:</span>{' '}
                    <strong className="text-[#073B4C]">{verFile.uploadedByOfficerName} ({verFile.uploadedByOfficerId})</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-[#118AB2] font-bold">SHA-256:</span>{' '}
                    <span className="text-slate-700">{verFile.sha256Hash.substring(0, 16)}...</span>
                  </div>
                </div>

                {/* Blockchain Proof Badge */}
                {verFile.txHash && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#073B4C] flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-[#118AB2]" />
                      Tx: {verFile.txHash.substring(0, 18)}...
                    </span>
                    <span className="text-[#118AB2] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#118AB2]" /> PKI SIGNED
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
