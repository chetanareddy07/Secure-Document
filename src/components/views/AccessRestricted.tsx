import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIGS } from '../../data/mockUsers';
import { ShieldAlert, Lock } from 'lucide-react';

export const AccessRestricted: React.FC = () => {
  const { user, logout } = useAuth();
  const roleCfg = user ? ROLE_CONFIGS[user.prefix] : null;

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border-red-500/40 text-center space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
            SECURITY POLICY RESTRICTION
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">Access Control Denied</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Your current logged in ID <code className="text-[#118AB2] font-bold">{user?.id}</code> ({roleCfg?.title}) does not hold clearance to access this specialized workstation.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#073B4C] border border-slate-800 text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Attempted Resource:</span> <span className="text-slate-200">Restricted Workstation</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Required Clearance:</span> <span className="text-[#7CD5C7]">Target Role ID</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Audit Status:</span> <span className="text-red-400 font-bold">LOGGED & REPORTED</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-[#118AB2] hover:bg-[#073B4C] text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#7CD5C7]" /> Logout Session to Switch Officer ID
          </button>
        </div>

      </div>
    </div>
  );
};
