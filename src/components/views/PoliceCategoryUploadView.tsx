import React, { useState } from 'react';
import { Microscope, CheckCircle2, ArrowRight, AlertCircle, Files } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { CaseFileCategory } from '../../types/auth';
import { CategoryUploadCard } from './CategoryUploadCard';
import { ForensicReportList } from './ForensicReportList';

const CATEGORIES: Array<{ category: CaseFileCategory; title: string; documents: string }> = [
  { category: 'CASE_REGISTRATION', title: 'Case Registration', documents: 'FIR, complaint, case number, date/time of registration, police station details' },
  { category: 'VICTIM_DETAILS', title: 'Victim Details', documents: 'Victim statement, victim information, medical examination request' },
  { category: 'ACCUSED_DETAILS', title: 'Accused Details', documents: 'Accused information, arrest memo, interrogation records' },
  { category: 'WITNESSES', title: 'Witnesses', documents: 'Witness statements, witness details, contact information' },
  { category: 'CRIME_SCENE', title: 'Crime Scene', documents: 'Crime scene photographs, videos, scene inspection report, rough sketch' },
  { category: 'INITIAL_EVIDENCE', title: 'Initial Evidence', documents: 'Seizure mahazar/panchnama, property seizure records, evidence lists' },
  { category: 'COMMUNICATION_RECORDS', title: 'Communication Records', documents: 'CDR, SMS records, call logs, relevant communication records' },
  { category: 'FINANCIAL_RECORDS', title: 'Financial Records', documents: 'Bank transaction records, suspicious transaction reports, payment records' },
  { category: 'REPORTS', title: 'Reports', documents: 'Police investigation reports, preliminary reports, daily case diary entries' },
  { category: 'LEGAL_DOCUMENTS', title: 'Legal Documents', documents: 'Search warrant, arrest warrant, notices, court orders received' },
];

export const PoliceCategoryUploadView: React.FC = () => {
  const { user, activeCaseId, activeCase, sendCaseToForensic } = useAuth();
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSentToForensic = activeCase?.status === 'FORENSIC_REVIEW';

  const handleSendToForensic = async () => {
    if (!activeCaseId) return;
    setLoading(true);
    setDispatchError(null);
    setDispatchStatusMsg(null);

    const res = await sendCaseToForensic(activeCaseId);
    setLoading(false);

    if (res.success) {
      setDispatchStatusMsg(res.message || `Case ${activeCaseId} sent to Forensic Lab successfully!`);
    } else {
      setDispatchError(res.message || 'Failed to dispatch case to Forensic Lab.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-[#7CD5C7]/30 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>Case workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#118AB2] font-extrabold">{activeCaseId}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#073B4C]">{activeCase?.title || `Case ${activeCaseId}`}</h1>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Managing Officer: <span className="font-bold text-[#073B4C]">{user?.name}</span>
        </div>
      </div>

      {/* Forensic Dispatch Action Banner */}
      <div className={`rounded-3xl border p-6 transition-all shadow-sm ${
        isSentToForensic 
          ? 'bg-gradient-to-r from-[#7CD5C7]/20 via-[#F2F2ED] to-[#7CD5C7]/20 border-[#7CD5C7] text-[#073B4C]' 
          : 'bg-gradient-to-r from-[#F2F2ED] via-white to-[#F2F2ED] border-[#7CD5C7]/50 text-[#073B4C]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isSentToForensic ? 'bg-[#118AB2] text-white' : 'bg-[#073B4C] text-[#7CD5C7]'
            }`}>
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#073B4C]">Forensic Review & Dispatch</h3>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                  isSentToForensic 
                    ? 'bg-[#7CD5C7]/30 text-[#073B4C] border border-[#7CD5C7]/50' 
                    : 'bg-[#F2F2ED] text-[#073B4C] border border-[#7CD5C7]/40'
                }`}>
                  {activeCase?.status || 'OPEN_INVESTIGATION'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                {isSentToForensic
                  ? 'Case files are available to the forensic team for review.'
                  : 'Share this case with the forensic team for lab analysis and investigation review.'}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleSendToForensic}
              disabled={loading}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                isSentToForensic
                  ? 'bg-[#118AB2] hover:bg-[#073B4C] text-white'
                  : 'bg-[#118AB2] hover:bg-[#073B4C] text-white'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Dispatching Case...</span>
                </>
              ) : isSentToForensic ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#7CD5C7]" />
                  <span>Dispatched to Forensic Lab</span>
                </>
              ) : (
                <>
                  <span>Send Case to Forensic Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {dispatchStatusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-[#7CD5C7]/20 border border-[#7CD5C7] text-xs font-bold text-[#073B4C] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#118AB2]" />
            <span>{dispatchStatusMsg}</span>
          </div>
        )}

        {dispatchError && (
          <div className="mt-4 p-3 rounded-xl bg-red-100 border border-red-300 text-xs font-bold text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700" />
            <span>{dispatchError}</span>
          </div>
        )}
      </div>

      <ForensicReportList />

      {/* Category Upload Cards Grid */}
      <div className="flex items-center gap-2 border-b border-[#7CD5C7]/30 pb-2 pt-1 text-sm font-semibold text-[#073B4C]">
        <Files className="h-4 w-4 text-[#118AB2]" /> Case documents
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => (
          <CategoryUploadCard
            key={cat.category}
            category={cat.category}
            title={cat.title}
            documents={cat.documents}
            tone="blue"
          />
        ))}
      </div>
    </div>
  );
};
