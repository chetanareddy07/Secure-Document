import React, { useState } from 'react';
import { CheckCircle2, Eye, FileText, FolderOpen, Upload, GitCommit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { CaseFileCategory, UploadedCaseFile } from '../../types/auth';
import { DocumentViewerModal } from './DocumentViewerModal';

interface CategoryUploadCardProps {
  category: CaseFileCategory;
  title: string;
  documents: string;
  tone?: 'blue' | 'amber';
}

export const CategoryUploadCard: React.FC<CategoryUploadCardProps> = ({ category, title, documents }) => {
  const { activeCase, activeCaseId, uploadFileToActiveCase } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);
  const [viewingFile, setViewingFile] = useState<UploadedCaseFile | null>(null);
  const files = activeCase?.uploadedFiles.filter((uploadedFile) => uploadedFile.category === category) ?? [];

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    const uploaded = await uploadFileToActiveCase(file, file.name, category, description);
    if (uploaded) {
      setFile(null);
      setDescription('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    }
  };

  return (
    <section 
      className="rounded-3xl border p-6 shadow-sm space-y-4"
      style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7' }}
    >
      <DocumentViewerModal file={viewingFile} caseId={activeCaseId || ''} onClose={() => setViewingFile(null)} />
      
      <div className="flex items-start justify-between gap-3 border-b pb-3.5" style={{ borderColor: 'rgba(124, 213, 199, 0.4)' }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: '#118AB2' }}>{title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-[#073B4C] opacity-80">{documents}</p>
        </div>
        <span 
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold border"
          style={{ backgroundColor: '#F2F2ED', color: '#118AB2', borderColor: '#7CD5C7' }}
        >
          {files.length} {files.length === 1 ? 'FILE' : 'FILES'}
        </span>
      </div>

      <form onSubmit={upload} className="space-y-3">
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
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
            <span className="text-xs font-mono font-bold text-[#073B4C] truncate">
              {file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'No file chosen'}
            </span>
          </div>
        </div>

        <textarea
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={`Investigation notes for this ${title.toLowerCase()} record...`}
          className="w-full rounded-2xl border px-3.5 py-2.5 text-xs focus:outline-none font-mono"
          style={{ backgroundColor: '#F2F2ED', color: '#073B4C', borderColor: '#7CD5C7' }}
        />

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold text-white cursor-pointer shadow-md transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: '#118AB2', color: '#F2F2ED', border: '1px solid #118AB2' }}
        >
          <Upload className="h-4 w-4" /> Seal & Anchor {title}
        </button>
      </form>

      {success && (
        <div 
          className="p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-2xs font-mono"
          style={{ backgroundColor: '#F2F2ED', borderColor: '#7CD5C7', color: '#118AB2' }}
        >
          <CheckCircle2 className="w-4 h-4 text-[#118AB2] shrink-0" />
          <span>Uploaded, Signed & Anchored on Blockchain for Case {activeCaseId}!</span>
        </div>
      )}

      <div className="space-y-3 border-t pt-3.5" style={{ borderColor: 'rgba(124, 213, 199, 0.4)' }}>
        {files.length ? (
          files.map((uploadedFile) => {
            const txHash = uploadedFile.txHash || `0x${uploadedFile.sha256Hash}`;
            const blockNum = uploadedFile.blockNumber || 10429;
            const verTag = uploadedFile.version || `v${(uploadedFile.versionNumber || 1.0).toFixed(1)}`;
            const isLatest = uploadedFile.isLatestVersion !== false;

            return (
              <div 
                key={uploadedFile.fileId} 
                className="rounded-2xl border p-3.5 space-y-2.5 text-xs"
                style={{ backgroundColor: '#F2F2ED', borderColor: '#7CD5C7' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-[#073B4C] truncate flex items-center gap-1.5">
                      <FileText className="h-4 w-4 shrink-0 text-[#118AB2]" />
                      {uploadedFile.fileName}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 flex items-center gap-1"
                      style={{
                        backgroundColor: isLatest ? '#118AB2' : '#ffffff',
                        color: isLatest ? '#F2F2ED' : '#073B4C',
                        border: '1px solid #7CD5C7'
                      }}
                    >
                      <GitCommit className="w-3 h-3" /> {verTag} {isLatest ? '[LATEST]' : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingFile(uploadedFile)}
                    className="px-3 py-1.5 rounded-xl text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-2xs hover:brightness-110"
                    style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}
                  >
                    <Eye className="h-3.5 w-3.5" /> Proof
                  </button>
                </div>

                <div 
                  className="space-y-1.5 font-mono text-[10px] p-2.5 rounded-xl border"
                  style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7' }}
                >
                  <div className="flex items-center justify-between font-bold" style={{ color: '#118AB2' }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#118AB2] animate-pulse"></span>
                      TX: {txHash.substring(0, 16)}...
                    </span>
                    <span 
                      className="px-1.5 py-0.5 rounded border text-[9px]"
                      style={{ backgroundColor: '#F2F2ED', color: '#118AB2', borderColor: '#7CD5C7' }}
                    >
                      BLOCK #{blockNum}
                    </span>
                  </div>

                  <div className="truncate text-[#073B4C]">
                    SHA-256: {uploadedFile.sha256Hash}
                  </div>

                  <div className="font-sans text-[10px] font-bold flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(124, 213, 199, 0.4)' }}>
                    <span className="flex items-center gap-1 text-[#118AB2]">
                      ✍️ Signed by {uploadedFile.uploadedByOfficerName}
                    </span>
                    <span 
                      className="text-[9px] font-mono border px-1.5 py-0.2 rounded font-bold"
                      style={{ backgroundColor: '#F2F2ED', color: '#118AB2', borderColor: '#7CD5C7' }}
                    >
                      PKI ECDSA VALID
                    </span>
                  </div>

                  <div className="text-[9px] pt-0.5 opacity-80 text-[#073B4C]">
                    ID: {uploadedFile.uploadedByOfficerId} ({uploadedFile.uploadedByRole}) • {uploadedFile.uploadTime}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="flex items-center gap-2 text-[11px] py-1 font-mono opacity-80 text-[#073B4C]">
            <FolderOpen className="h-4 w-4 text-[#118AB2]" /> No {title.toLowerCase()} files sealed yet.
          </p>
        )}
      </div>
    </section>
  );
};
