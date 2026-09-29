import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  LogOut, 
  FolderKanban, 
  Search, 
  UserCheck, 
  ChevronDown, 
  LayoutDashboard
} from 'lucide-react';
import { PersonCaseSearchModal } from '../views/PersonCaseSearchModal';

interface AppHeaderProps {
  onNavigate?: (page: 'home' | 'login' | 'register' | 'dashboard') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onNavigate }) => {
  const { user, activeCaseId, setActiveCaseId, openAssignedCase, logout } = useAuth();
  const [showPersonSearch, setShowPersonSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPersonSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) return null;

  return (
    <>
      <PersonCaseSearchModal 
        isOpen={showPersonSearch} 
        onClose={() => setShowPersonSearch(false)} 
      />

      <header className="sticky top-0 z-30 px-4 md:px-8 py-3 bg-white border-b border-[#7CD5C7]/40 shadow-xs text-[#073B4C]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Platform Identifier (Clicking returns to Home) */}
          <button 
            type="button"
            onClick={() => onNavigate ? onNavigate('home') : null}
            className="flex items-center gap-3 shrink-0 cursor-pointer text-left transition-transform active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#F2F2ED] border border-[#7CD5C7] text-[#118AB2] shadow-xs shrink-0 group-hover:scale-105 transition-all">
              <Shield className="w-5 h-5 text-[#118AB2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[#073B4C] group-hover:text-[#118AB2] transition-colors">SI-PALMS</span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30 uppercase">
                  SECURE VAULT
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Evidence Management & Chain of Custody</p>
            </div>
          </button>

          {/* Center Navigation & Active Case Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            
            {/* Global Search Button */}
            <button
              onClick={() => setShowPersonSearch(true)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#F2F2ED] hover:bg-[#7CD5C7]/20 text-[#073B4C] border border-[#7CD5C7]/60 transition-all cursor-pointer shadow-2xs"
              title="Search entities, subjects, officer IDs or cases"
            >
              <Search className="w-4 h-4 text-[#118AB2]" />
              <span>Entity & Case Search</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#118AB2] text-white border border-[#118AB2] ml-1">⌘K</kbd>
            </button>

            {/* Active Case Selector */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#F2F2ED] border border-[#7CD5C7]/60 shadow-2xs">
              <FolderKanban className="w-4 h-4 text-[#118AB2] shrink-0" />
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-mono font-bold uppercase text-[#118AB2]">ACTIVE CASE:</span>
                
                {user.prefix !== 'FO' && user.assignedCaseIds.length > 0 ? (
                  <div className="relative flex items-center">
                    <select
                      value={activeCaseId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          openAssignedCase(e.target.value);
                        } else {
                          setActiveCaseId('');
                        }
                      }}
                      className="text-xs font-bold font-mono pl-3 pr-7 py-1 rounded-xl bg-white text-[#073B4C] border border-[#7CD5C7]/60 cursor-pointer focus:outline-none focus:border-[#118AB2] appearance-none shadow-2xs"
                    >
                      <option value="" className="text-slate-400 font-normal">Select Case...</option>
                      {user.assignedCaseIds.map(cId => (
                        <option key={cId} value={cId} className="bg-white text-[#073B4C] font-bold">{cId}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#118AB2] absolute right-2 pointer-events-none" />
                  </div>
                ) : (
                  <span className="font-bold font-mono tracking-wide text-[#073B4C] bg-white px-2.5 py-1 rounded-xl border border-[#7CD5C7]/50">
                    {activeCaseId || 'None'}
                  </span>
                )}

                {activeCaseId && (
                  <button
                    onClick={() => setActiveCaseId('')}
                    className="ml-1 text-xs px-3 py-1 rounded-xl bg-[#118AB2] hover:bg-[#073B4C] text-white border border-[#118AB2] cursor-pointer transition-all font-bold flex items-center gap-1.5 shadow-2xs"
                    title="Return to case selection dashboard"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Authenticated Officer Badge & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-[#F2F2ED] border border-[#7CD5C7]/60 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#118AB2] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-right leading-tight">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-bold text-[#073B4C]">{user.name}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#118AB2] text-white">
                    {user.id}
                  </span>
                </div>
                <div className="text-[10px] font-mono mt-0.5 text-slate-500">
                  {user.rankTitle} • <span className="font-bold text-[#073B4C]">{user.station}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold bg-[#F2F2ED] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[#073B4C] border border-[#7CD5C7]/60 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Logout session"
            >
              <LogOut className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>
    </>
  );
};
