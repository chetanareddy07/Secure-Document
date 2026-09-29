import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UploadedCaseFile } from '../../types/auth';
import { DocumentViewerModal } from './DocumentViewerModal';
import { Network, AlertCircle, FileText, Folder, Eye } from 'lucide-react';

export const InvestigatorView: React.FC = () => {
  const { user, activeCaseId, activeCase } = useAuth();
  const [viewingFile, setViewingFile] = useState<UploadedCaseFile | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Modal Document Reader */}
      <DocumentViewerModal
        file={viewingFile}
        caseId={activeCaseId || 'CASE-102'}
        onClose={() => setViewingFile(null)}
      />

      {/* Banner */}
      <div className="white-panel rounded-2xl p-6 border border-[#7CD5C7]/30 bg-gradient-to-r from-[#073B4C] via-[#118AB2] to-[#073B4C] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#7CD5C7]/20 text-[#7CD5C7] border border-[#7CD5C7]/30">
              IN PORTAL • ID: {user?.id}
            </span>
            <span className="text-xs font-mono text-[#7CD5C7] font-bold">CASE NO: {activeCaseId}</span>
          </div>
          <h1 className="text-2xl font-black tracking-wide">{activeCase?.title || `Case ${activeCaseId}`}</h1>
          <p className="text-sm text-[#F2F2ED]/90">Open & inspect uploaded evidence files and custody graphs for assigned case {activeCaseId}.</p>
        </div>

        <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-right font-mono">
          <div className="text-[10px] text-[#7CD5C7] uppercase">Clearance</div>
          <div className="text-xs font-bold text-white">IN CASE INTELLIGENCE</div>
        </div>
      </div>

      {/* Main Grid */}
      {activeCase ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: All Uploaded Files for Active Case with Open Document Action */}
          <div className="lg:col-span-7 space-y-4">
            <div className="white-panel rounded-2xl p-6 border border-[#7CD5C7]/30 shadow-sm space-y-4 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono text-[#118AB2] font-bold">{activeCase.caseId}</span>
                  <h2 className="text-lg font-bold text-[#073B4C]">{activeCase.title}</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#F2F2ED] text-[#073B4C] border border-[#7CD5C7]/30">
                  {activeCase.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#073B4C] uppercase tracking-wider flex items-center gap-2">
                  <Folder className="w-4 h-4 text-[#118AB2]" /> Case Files ({activeCase.uploadedFiles.length})
                </h3>

                {activeCase.uploadedFiles.length > 0 ? (
                  activeCase.uploadedFiles.map((file) => (
                    <div key={file.fileId} className="p-4 rounded-xl bg-[#F2F2ED]/50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#118AB2]" /> {file.fileName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300">
                            {file.category}
                          </span>
                          <button
                            onClick={() => setViewingFile(file)}
                            className="px-2.5 py-1 rounded-lg bg-[#118AB2] hover:bg-[#073B4C] text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Open File
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed bg-white p-2.5 rounded border border-slate-200 font-mono">
                        {file.description}
                      </p>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                        <span>Uploaded by: <strong className="text-[#073B4C]">{file.uploadedByOfficerName} ({file.uploadedByOfficerId})</strong></span>
                        <span className="font-mono">{file.uploadTime}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-xl bg-[#F2F2ED]/50 border border-slate-200 text-xs text-slate-500 text-center space-y-1">
                    <Folder className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                    <div className="font-bold text-[#073B4C]">No documents uploaded yet for Case {activeCaseId}</div>
                    <p className="text-[11px]">When a Police Officer or Forensic Officer uploads a case document, it will appear here for inspection.</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Case Timeline & Link Tree */}
          <div className="lg:col-span-5 space-y-4">
            <div className="white-panel rounded-2xl p-5 border border-[#7CD5C7]/30 shadow-sm space-y-4 bg-white">
              <h2 className="text-sm font-bold text-[#073B4C] flex items-center gap-2 border-b border-slate-200 pb-2">
                <Network className="w-4 h-4 text-[#118AB2]" /> Evidence Link Graph ({activeCaseId})
              </h2>

              <div className="p-4 rounded-xl bg-[#073B4C] text-white text-xs space-y-3 font-mono">
                <div className="text-[#7CD5C7] font-bold">CASE FILE: {activeCaseId}</div>
                
                {activeCase.uploadedFiles.length > 0 ? (
                  activeCase.uploadedFiles.map((f, i) => (
                    <div key={i} className="pl-3 border-l-2 border-[#7CD5C7]/40 space-y-1">
                      <div className="text-[#7CD5C7] text-[11px]">├─ {f.fileName}</div>
                      <div className="text-slate-300 text-[10px]">│  By: {f.uploadedByOfficerName} ({f.uploadedByOfficerId})</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-[11px] italic">No active evidence links yet.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="white-panel rounded-2xl p-12 text-center space-y-4 border border-[#7CD5C7]/30 bg-white">
          <AlertCircle className="w-12 h-12 text-[#118AB2] mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-[#073B4C]">No Case Record Found for "{activeCaseId}"</h2>
        </div>
      )}

    </div>
  );
};
