import type { UserProfile, CaseRecord, UploadedCaseFile, CaseFileCategory, SecurityLog } from '../types/auth';

const TOKEN_KEY = 'sipalms_jwt_token_v3';

export interface AuditLogRecord {
  id: number;
  user_id: string;
  action: 'Upload' | 'View' | 'Version creation' | 'Signing' | 'Verification';
  document_id?: string | null;
  case_id?: string | null;
  timestamp: string;
}

export interface BlockchainVerificationResult {
  isValid: boolean;
  docId: string;
  caseId: string;
  fileName?: string;
  currentHash: string;
  onChainHash: string;
  uploadedBy: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  signerAddress: string;
  contractAddress: string;
  gasUsed?: number;
  verificationMessage: string;
}

export interface BlockchainLedgerRecord {
  txHash: string;
  blockNumber: number;
  blockHash: string;
  caseId: string;
  docId: string;
  sha256Hash: string;
  uploadedBy: string;
  timestamp: string;
  gasUsed: number;
  status: string;
  signerAddress: string;
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getFileUrlWithToken(url?: string): string | undefined {
  if (!url) return url;
  if (url.startsWith('data:')) return url;
  const token = getAuthToken();
  if (!token) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    let errMsg = 'API Request Failed';
    if (typeof data.detail === 'string') {
      errMsg = data.detail;
    } else if (data.detail && typeof data.detail === 'object' && data.detail.message) {
      errMsg = data.detail.message;
    } else if (data.message) {
      errMsg = data.message;
    }
    throw new Error(errMsg);
  }

  return data as T;
}

export const api = {
  async login(officerId: string, pass: string) {
    const res = await apiFetch<{
      status: 'SUCCESS' | 'NEW_OFFICER_REGISTRATION_REQUIRED' | 'INVALID_PASSWORD';
      message?: string;
      token?: string;
      user?: UserProfile;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ officerId, password: pass })
    });

    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async register(newOfficer: Omit<UserProfile, 'prefix' | 'badgeNumber' | 'clearance' | 'assignedCaseIds'>) {
    const res = await apiFetch<{
      status: string;
      token?: string;
      user?: UserProfile;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(newOfficer)
    });

    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async getMe() {
    return apiFetch<{ user: UserProfile }>('/api/auth/me');
  },

  async getCases() {
    return apiFetch<Record<string, CaseRecord>>('/api/cases');
  },

  async openCase(caseNumber: string) {
    return apiFetch<{ success: boolean; message?: string; case?: CaseRecord }>(`/api/cases/${encodeURIComponent(caseNumber)}/open`, {
      method: 'POST'
    });
  },

  async addCase(caseNumber: string) {
    return apiFetch<{ success: boolean; message?: string; case?: CaseRecord }>('/api/cases/add', {
      method: 'POST',
      body: JSON.stringify({ caseNumber })
    });
  },

  async relinquishCase(caseId: string) {
    return apiFetch<{ success: boolean; message?: string }>(`/api/cases/${encodeURIComponent(caseId)}/relinquish`, {
      method: 'POST'
    });
  },

  async sendCaseToForensic(caseId: string) {
    return apiFetch<{ success: boolean; message?: string; case?: CaseRecord }>(`/api/cases/${encodeURIComponent(caseId)}/send-to-forensic`, {
      method: 'POST'
    });
  },

  async uploadFile(
    caseId: string,
    file: File | null,
    fallbackFileName: string,
    category: CaseFileCategory,
    description: string,
    digitalSignature?: string,
    signerPublicKey?: string,
    parentFileId?: string,
    changeSummary?: string,
    isMajorVersion?: boolean
  ) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('fallbackFileName', fallbackFileName);
    formData.append('category', category);
    formData.append('description', description);
    if (digitalSignature) formData.append('digitalSignature', digitalSignature);
    if (signerPublicKey) formData.append('signerPublicKey', signerPublicKey);
    if (parentFileId) formData.append('parentFileId', parentFileId);
    if (changeSummary) formData.append('changeSummary', changeSummary);
    if (isMajorVersion !== undefined) formData.append('isMajorVersion', String(isMajorVersion));

    return apiFetch<{ success: boolean; message?: string; file?: UploadedCaseFile }>(`/api/cases/${encodeURIComponent(caseId)}/files`, {
      method: 'POST',
      body: formData
    });
  },

  async getSecurityLogs() {
    return apiFetch<SecurityLog[]>('/api/logs');
  },

  async getAuditLogs() {
    return apiFetch<AuditLogRecord[]>('/api/logs/audit-logs');
  },

  async recordAuditLog(action: AuditLogRecord['action'], document_id?: string, case_id?: string) {
    return apiFetch<{ success: boolean }>('/api/logs/audit-logs', {
      method: 'POST',
      body: JSON.stringify({ action, document_id, case_id })
    });
  },

  async verifyOnBlockchain(fileId: string) {
    return apiFetch<{ success: boolean; verification: BlockchainVerificationResult }>(`/api/blockchain/verify/${encodeURIComponent(fileId)}`);
  },

  async simulateTamper(fileId: string) {
    return apiFetch<{ success: boolean; message: string }>(`/api/blockchain/demo-tamper/${encodeURIComponent(fileId)}`, { method: 'POST' });
  },

  async restoreDemoFile(fileId: string) {
    return apiFetch<{ success: boolean; message: string }>(`/api/blockchain/demo-restore/${encodeURIComponent(fileId)}`, { method: 'POST' });
  },

  async getBlockchainLedger() {
    return apiFetch<{ success: boolean; blockHeight: number; contractAddress: string; ledger: BlockchainLedgerRecord[] }>('/api/blockchain/ledger');
  },

  async getBlockchainStats() {
    return apiFetch<{ success: boolean; stats: any }>('/api/blockchain/stats');
  },

  async getAllPersons() {
    return apiFetch<{ success: boolean; count: number; persons: PersonRecord[] }>('/api/persons/all');
  },

  async searchPersons(query: string) {
    try {
      return await apiFetch<{ success: boolean; query: string; count: number; results: PersonRecord[] }>(`/api/persons/search?q=${encodeURIComponent(query)}`);
    } catch (err) {
      // Offline fallback search
      const q = query.trim();
      const normalizeText = (text: string): string => {
        if (!text) return '';
        const cleaned = text.replace(/[\-_/\\.,:;()\[\]{}"' `!?+@#$^&*~|=]/g, ' ');
        return cleaned.split(/\s+/).filter(Boolean).join(' ').toLowerCase();
      };

      const isTextMatching = (searchQuery: string, targetText: string): boolean => {
        if (!searchQuery || !searchQuery.trim()) return true;
        const normQuery = normalizeText(searchQuery);
        const normTarget = normalizeText(targetText);
        if (!normQuery || !normTarget) return false;
        if (normTarget.includes(normQuery)) return true;
        const queryWords = normQuery.split(' ');
        return queryWords.every(w => normTarget.includes(w));
      };

      const savedCasesRaw = localStorage.getItem('sipalms_cases_v3');
      const savedUsersRaw = localStorage.getItem('sipalms_users_v3');

      const localCases: Record<string, any> = savedCasesRaw ? JSON.parse(savedCasesRaw) : {};
      const localUsers: Record<string, any> = savedUsersRaw ? JSON.parse(savedUsersRaw) : {};

      const results: PersonRecord[] = [];

      // 1. Official Registered Personnel
      Object.values(localUsers).forEach((u: any) => {
        const userName = u.name || u.id;
        const userSearchable = `${u.id} ${userName} ${u.rankTitle || ''} ${u.role || ''} ${u.badgeNumber || ''} ${u.department || ''} ${u.station || ''}`;

        const userCases: PersonCaseInvolvement[] = [];
        Object.values(localCases).forEach((c: any) => {
          const isOfficerInCase = (u.assignedCaseIds || []).includes(c.caseId) || (c.assignedOfficerIds || []).includes(u.id) || c.assignedLawyerId === u.id;
          const userFiles = (c.uploadedFiles || []).filter((f: any) => f.uploadedByOfficerId === u.id);
          const caseSearchable = `${c.caseId} ${c.title} ${c.incidentLocation} ${c.status} ${(c.uploadedFiles || []).map((f: any) => `${f.fileName} ${f.description} ${f.category} ${f.fileId} ${f.uploadedByOfficerName}`).join(' ')}`;

          if (isOfficerInCase || userFiles.length > 0) {
            if (!q || isTextMatching(q, userSearchable) || isTextMatching(q, caseSearchable)) {
              const matchingFiles = (c.uploadedFiles || []).filter((f: any) => {
                const fText = `${f.fileName} ${f.description} ${f.category} ${f.fileId} ${f.uploadedByOfficerName}`;
                return !q || isTextMatching(q, fText) || f.uploadedByOfficerId === u.id;
              });

              userCases.push({
                caseId: c.caseId,
                title: c.title,
                incidentLocation: c.incidentLocation,
                status: c.status,
                roleInCase: 'Assigned case personnel',
                matchReason: 'Personnel profile or associated case files match search criteria.',
                matchingFiles: matchingFiles.map((f: any) => ({
                  fileId: f.fileId,
                  fileName: f.fileName,
                  category: f.category,
                  uploadTime: f.uploadTime,
                  description: f.description
                }))
              });
            }
          }
        });

        if (isTextMatching(q, userSearchable) || userCases.length > 0) {
          results.push({
            id: u.id,
            name: userName,
            rankTitle: u.rankTitle || u.role || 'Personnel',
            role: u.role || '',
            prefix: u.prefix || '',
            category: 'Official Personnel',
            department: u.department || '',
            station: u.station || '',
            badgeNumber: u.badgeNumber || '',
            clearance: u.clearance || '',
            totalCasesInvolved: userCases.length,
            cases: userCases
          });
        }
      });

      // 2. Mentioned Subject / Person Entity Record (e.g. Dharambir Singh)
      if (q) {
        const entityCasesMap: Record<string, PersonCaseInvolvement> = {};
        Object.values(localCases).forEach((c: any) => {
          const caseMatches = isTextMatching(q, `${c.caseId} ${c.title} ${c.incidentLocation}`);
          const matchingFiles = (c.uploadedFiles || []).filter((f: any) => {
            const blob = `${f.fileName} ${f.description} ${f.category} ${f.fileId} ${f.uploadedByOfficerName} ${f.uploadedByOfficerId} ${c.caseId} ${c.title}`;
            return isTextMatching(q, blob);
          });

          if (caseMatches || matchingFiles.length > 0) {
            entityCasesMap[c.caseId] = {
              caseId: c.caseId,
              title: c.title,
              incidentLocation: c.incidentLocation,
              status: c.status,
              roleInCase: 'Subject / Person Mentioned in Case Evidence',
              matchReason: 'Search query matches entity mentioned in case record or file metadata.',
              matchingFiles: matchingFiles.map((f: any) => ({
                fileId: f.fileId,
                fileName: f.fileName,
                category: f.category,
                uploadTime: f.uploadTime,
                description: f.description
              }))
            };
          }
        });

        const entityCases = Object.values(entityCasesMap);
        const hasOfficerMatch = results.some(r => isTextMatching(q, r.name));
        if (entityCases.length > 0 && !hasOfficerMatch) {
          results.unshift({
            id: `ENT-${Math.abs(q.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(16).toUpperCase()}`,
            name: q.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            rankTitle: 'Subject / Mentioned Entity in Case Evidence',
            role: 'CASE_ENTITY',
            prefix: 'ENT',
            category: 'Official Personnel',
            department: 'Cross-Case Evidence Mapping',
            station: 'Case Evidence Vault',
            badgeNumber: 'ENT-REF-KEY',
            clearance: 'Level 1 - Case Details',
            totalCasesInvolved: entityCases.length,
            cases: entityCases
          });
        }

        // 3. Document References List
        const docCasesMap: Record<string, PersonCaseInvolvement> = {};
        Object.values(localCases).forEach((c: any) => {
          const cFiles = (c.uploadedFiles || []).filter((f: any) => {
            const blob = `${f.fileName} ${f.description} ${f.category} ${f.fileId} ${f.uploadedByOfficerName} ${f.uploadedByOfficerId} ${c.caseId} ${c.title}`;
            return isTextMatching(q, blob);
          });

          if (cFiles.length > 0) {
            docCasesMap[c.caseId] = {
              caseId: c.caseId,
              title: c.title,
              incidentLocation: c.incidentLocation,
              status: c.status,
              roleInCase: 'Matching evidence record',
              matchReason: 'Search query matches file name, category, description, or file ID.',
              matchingFiles: cFiles.map((f: any) => ({
                fileId: f.fileId,
                fileName: f.fileName,
                category: f.category,
                uploadTime: f.uploadTime,
                description: f.description
              }))
            };
          }
        });

        const docCases = Object.values(docCasesMap);
        if (docCases.length > 0) {
          results.push({
            id: 'MATCH-LOCAL-DOCS',
            name: `Files matching “${query.trim()}”`,
            rankTitle: 'Case evidence search result',
            role: 'DOCUMENT_MATCH',
            prefix: 'DOC',
            category: 'Document references',
            department: 'Authorized case records',
            station: '',
            badgeNumber: '',
            clearance: '',
            totalCasesInvolved: docCases.length,
            cases: docCases
          });
        }
      }

      return {
        success: true,
        query,
        count: results.length,
        results
      };
    }
  }
};

export interface PersonCaseInvolvement {
  caseId: string;
  title: string;
  incidentLocation: string;
  status: string;
  roleInCase: string;
  matchReason?: string;
  matchingFiles?: Array<{
    fileId: string;
    fileName: string;
    category: string;
    uploadTime: string;
    description: string;
  }>;
}

export interface PersonRecord {
  id: string;
  name: string;
  rankTitle: string;
  role: string;
  prefix: string;
  category: string;
  department: string;
  station: string;
  badgeNumber: string;
  clearance: string;
  totalCasesInvolved: number;
  cases: PersonCaseInvolvement[];
}
