import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIGS } from '../../data/mockUsers';
import type { WorkspaceTab, RolePrefix } from '../../types/auth';
import { 
  PlusCircle, 
  Search, 
  Network, 
  Microscope, 
  Scale, 
  History,
  ShieldCheck,
  Fingerprint,
  ChevronRight,
  Shield
} from 'lucide-react';

interface TabItem {
  id: WorkspaceTab;
  label: string;
  rolePrefix: RolePrefix;
  icon: React.ElementType;
}

const ALL_TABS: TabItem[] = [
  // PO Tabs (Police Officer Only)
  { id: 'police_case_upload', label: 'Upload Case File Details', rolePrefix: 'PO', icon: PlusCircle },
  { id: 'police_integrity', label: 'Evidence Integrity Check', rolePrefix: 'PO', icon: Fingerprint },
  { id: 'police_audit_trail', label: 'Cryptographic Audit History', rolePrefix: 'PO', icon: History },

  // FO Tabs (Forensic Officer Only)
  { id: 'forensic_lab_upload', label: 'Upload Forensic Report', rolePrefix: 'FO', icon: Microscope },
  { id: 'forensic_integrity', label: 'Evidence Integrity Check', rolePrefix: 'FO', icon: Fingerprint },

  // IN Tabs (Investigator Only)
  { id: 'investigator_case_search', label: 'Entity & Case Search', rolePrefix: 'IN', icon: Search },
  { id: 'investigator_integrity', label: 'Evidence Integrity Check', rolePrefix: 'IN', icon: Fingerprint },
  { id: 'investigator_graph', label: 'Evidence Relational Graph', rolePrefix: 'IN', icon: Network },

  // LW Tabs (Lawyer / Prosecutor Only - Read Only)
  { id: 'lawyer_read_vault', label: 'Read-Only Case Disclosure Vault', rolePrefix: 'LW', icon: Scale },
  { id: 'lawyer_integrity', label: 'Evidence Integrity Check', rolePrefix: 'LW', icon: Fingerprint },
  { id: 'lawyer_audit_trail', label: 'Cryptographic Audit History', rolePrefix: 'LW', icon: History }
];

export const Sidebar: React.FC = () => {
  const { user, activeTab, setActiveTab } = useAuth();

  if (!user) return null;

  const currentRoleCfg = ROLE_CONFIGS[user.prefix];
  const roleAccessibleTabs = ALL_TABS.filter(t => t.rolePrefix === user.prefix);

  return (
    <aside 
      className="w-full md:w-72 lg:w-80 shrink-0 rounded-3xl p-5 border border-[#7CD5C7]/40 bg-white flex flex-col justify-between h-auto md:h-[calc(100vh-6rem)] md:sticky top-20 shadow-sm space-y-6"
    >
      
      <div className="space-y-6">
        
        {/* Active Officer Workspace Header Card */}
        <div className="p-4 rounded-2xl bg-[#F2F2ED] border border-[#7CD5C7]/60 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#118AB2] text-white border border-[#118AB2]">
              {user.prefix} WORKSPACE
            </span>
            <Shield className="w-4 h-4 text-[#118AB2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#073B4C] leading-snug">{currentRoleCfg.title}</h3>
            <p className="text-[11px] font-mono mt-0.5 text-slate-500">{user.station}</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="space-y-2">
          <div className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#118AB2]">
            Navigation Menu
          </div>
          {roleAccessibleTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border shadow-2xs ${
                  isSelected
                    ? 'bg-[#118AB2] text-white border-[#118AB2] shadow-sm'
                    : 'bg-[#F2F2ED] text-[#073B4C] border-[#7CD5C7]/50 hover:bg-[#7CD5C7]/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div 
                    className={`p-2 rounded-xl transition-colors shrink-0 ${
                      isSelected ? 'bg-[#073B4C] text-[#7CD5C7]' : 'bg-white text-[#118AB2]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="font-bold text-left leading-tight text-xs">{tab.label}</span>
                </div>
                {isSelected && (
                  <ChevronRight className="w-4 h-4 text-[#7CD5C7] shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* System Status Security Badge */}
      <div className="pt-3.5 border-t border-[#7CD5C7]/30 flex items-center justify-between text-[10px] font-mono">
        <span className="flex items-center gap-1.5 font-bold text-[#073B4C]">
          <ShieldCheck className="w-4 h-4 text-[#118AB2]" /> Security Seal Active
        </span>
        <span className="text-[10px] font-semibold text-[#118AB2]">v2.4</span>
      </div>

    </aside>
  );
};
