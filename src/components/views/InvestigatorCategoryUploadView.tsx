import React, { useState } from 'react';
import { AlertCircle, Eye, FileText, FolderOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { CaseFileCategory, UploadedCaseFile } from '../../types/auth';
import { CategoryUploadCard } from './CategoryUploadCard';
import { DocumentViewerModal } from './DocumentViewerModal';

const CATEGORIES: Array<{ category: CaseFileCategory; title: string; documents: string }> = [
  { category: 'INVESTIGATION_REPORTS', title: 'Investigation Reports', documents: 'Investigation notes, case diary, progress reports' },
  { category: 'STATEMENTS', title: 'Statements', documents: 'Detailed witness statements, suspect statements, victim statements' },
  { category: 'EVIDENCE', title: 'Evidence', documents: 'Evidence inventory, seizure records, evidence photographs' },
  { category: 'DIGITAL_EVIDENCE', title: 'Digital Evidence', documents: 'Mobile extraction reports, computer data, CCTV footage, email/social-media evidence' },
  { category: 'CDR_ANALYSIS', title: 'CDR Analysis', documents: 'CDR files, call-pattern analysis, location/tower information' },
  { category: 'FINANCIAL_INVESTIGATION', title: 'Financial Investigation', documents: 'Bank statements, transaction analysis, money-flow records' },
  { category: 'SUSPECT_ANALYSIS', title: 'Suspect Analysis', documents: 'Suspect profiles, background information, association records' },
  { category: 'LOCATION_EVIDENCE', title: 'Location Evidence', documents: 'GPS/location data, tower dumps, location analysis' },
  { category: 'SURVEILLANCE', title: 'Surveillance', documents: 'Surveillance reports, photographs, videos, observation notes' },
  { category: 'INVESTIGATION_FINDINGS', title: 'Investigation Findings', documents: 'Evidence correlation reports, timelines, links between persons/events' },
  { category: 'COURT_SUBMISSION', title: 'Court Submission', documents: 'Charge sheet/final report, supporting documents, annexures' },
];

export const InvestigatorCategoryUploadView: React.FC = () => {
  const { user, activeCaseId, activeCase } = useAuth();
  const [viewingFile, setViewingFile] = useState<UploadedCaseFile | null>(null);

  if (!activeCase) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-[#7CD5C7]/30 shadow-sm">
        <AlertCircle className="w-12 h-12 text-[#118AB2] mx-auto opacity-70" />
        <h2 className="text-lg font-bold text-[#073B4C]">No Case Record Found for “{activeCaseId}”</h2>
      </div>
    );
  }

  const sharedFiles = activeCase.uploadedFiles.filter(
    (file) => file.uploadedByRole === 'POLICE_OFFICER' || file.uploadedByRole === 'FORENSIC_OFFICER'
  );

  return (
    <div className="space-y-6">
      <DocumentViewerModal file={viewingFile} caseId={activeCaseId || ''} onClose={() => setViewingFile(null)} />

      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#7CD5C7]/30 bg-gradient-to-r from-[#073B4C] via-[#118AB2] to-[#073B4C] text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#7CD5C7]/20 text-[#7CD5C7] border border-[#7CD5C7]/30">
            IN PORTAL • ID: {user?.id}
          </span>
          <span className="text-xs font-mono text-[#7CD5C7] font-bold">CASE NO: {activeCaseId}</span>
        </div>
        <h1 className="text-2xl font-black tracking-wide">{activeCase.title}</h1>
        <p className="text-xs text-[#F2F2ED]/90 mt-1">Investigator Workbench — Upload & Review Records across Analysis Categories</p>
      </div>

      {/* Shared Police & Forensic Records Card */}
      <section className="bg-white rounded-3xl border border-[#7CD5C7]/30 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="text-sm font-bold text-[#073B4C]">Police & Forensic Records</h2>
            <p className="mt-1 text-xs text-slate-500">Review case files uploaded by Police Officers and Forensic Officers for this case.</p>
          </div>
          <span className="rounded-full bg-[#F2F2ED] px-3 py-1 text-[10px] font-mono font-bold text-[#073B4C] border border-[#7CD5C7]/40">
            {sharedFiles.length} FILES
          </span>
        </div>

        {sharedFiles.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {sharedFiles.map((file) => (
              <div key={file.fileId} className="rounded-2xl border border-slate-200 bg-[#F2F2ED]/50 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-[#118AB2]" />
                    <span className="truncate">{file.fileName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingFile(file)}
                    className="px-3 py-1 rounded-xl bg-[#118AB2] hover:bg-[#073B4C] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  {file.category.replaceAll('_', ' ')} • Uploaded by <strong className="text-[#073B4C]">{file.uploadedByOfficerName}</strong>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2 py-2 text-xs text-slate-500 font-mono">
            <FolderOpen className="h-4 w-4 text-[#118AB2]" /> No Police Officer or Forensic Officer files uploaded yet.
          </p>
        )}
      </section>

      <div className="rounded-2xl border border-[#7CD5C7]/50 bg-[#7CD5C7]/10 p-4 text-xs text-[#073B4C] flex items-center gap-3 shadow-2xs">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#118AB2]" />
        <p>Each investigation category keeps its own uploaded files. Select <strong>View</strong> to open and inspect evidence records.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {CATEGORIES.map((item) => (
          <CategoryUploadCard key={item.category} {...item} tone="amber" />
        ))}
      </div>
    </div>
  );
};
