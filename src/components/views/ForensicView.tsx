import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Microscope, ShieldCheck, Upload } from 'lucide-react';
import { ForensicReportList } from './ForensicReportList';

export const ForensicView: React.FC = () => {
  const { user, activeCaseId, activeCase, uploadFileToActiveCase } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleForensicUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const fileName = selectedFile.name;

    const success = await uploadFileToActiveCase(selectedFile, fileName, 'FORENSIC_LAB', reportDescription);
    if (success) {
      setUploadSuccess(`Forensic Analysis Report "${fileName}" successfully uploaded to Case ${activeCaseId}! SHA-256 seal bound.`);
      setSelectedFile(null);
      setReportDescription('');
      setTimeout(() => setUploadSuccess(null), 6000);
    }
  };

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#7CD5C7]/30 bg-gradient-to-r from-[#073B4C] via-[#118AB2] to-[#073B4C] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#7CD5C7]/20 text-[#7CD5C7] border border-[#7CD5C7]/30">
              FO PORTAL • ID: {user?.id}
            </span>
            <span className="text-xs font-mono text-[#7CD5C7] font-bold">CASE NO: {activeCaseId}</span>
          </div>
          <h1 className="text-2xl font-black tracking-wide">{activeCase?.title || `Case ${activeCaseId}`}</h1>
          <p className="text-xs text-[#F2F2ED]/90 mt-1">Upload the completed forensic laboratory report for assigned case {activeCaseId}.</p>
        </div>

        <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 text-right font-mono">
          <div className="text-[9px] text-[#7CD5C7] uppercase">Clearance</div>
          <div className="text-xs font-bold text-white">FO LAB UPLOAD AUTHORIZED</div>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-[#7CD5C7]/20 border border-[#7CD5C7] text-[#073B4C] flex items-center gap-3 shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-[#118AB2] shrink-0" />
          <span className="text-xs font-medium">{uploadSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Working Forensic File Upload */}
        <div className="lg:col-span-12 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#7CD5C7]/30 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-base font-bold text-[#073B4C] flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-[#118AB2]" /> Upload Forensic Report ({activeCaseId})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Attach laboratory evidence reports to active case file {activeCaseId}</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
                FO UPLOAD ACCESS
              </span>
            </div>

            <form onSubmit={handleForensicUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#073B4C] uppercase tracking-wider mb-1">
                  Active Case Number
                </label>
                <input
                  type="text"
                  value={activeCaseId || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2ED] border border-slate-200 text-[#073B4C] font-mono text-xs font-bold opacity-90"
                />
              </div>

              {/* REAL FILE CHOOSER INPUT */}
              <div>
                <label className="block text-xs font-bold text-[#073B4C] uppercase tracking-wider mb-1">
                  Select Lab Analysis Report File
                </label>
                <div 
                  className="p-3.5 rounded-2xl border-2 border-dashed transition-all"
                  style={{ backgroundColor: '#F2F2ED', borderColor: '#7CD5C7' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label 
                      className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all hover:brightness-110 active:scale-95"
                      style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}
                    >
                      <Upload className="w-4 h-4" /> Choose File
                      <input
                        type="file"
                        required
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs font-mono font-bold text-[#073B4C] truncate">
                      {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#073B4C] uppercase tracking-wider mb-1">
                  Forensic Findings & Case Summary
                </label>
                <textarea
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Enter detailed laboratory analysis findings..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#118AB2]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#118AB2] hover:bg-[#073B4C] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Seal & Anchor Forensic Report
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Existing Reports List */}
      <ForensicReportList />
    </div>
  );
};
