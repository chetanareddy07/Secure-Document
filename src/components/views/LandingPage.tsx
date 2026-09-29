import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Scale, 
  FileCheck, 
  Microscope, 
  LogIn, 
  UserPlus, 
  LayoutDashboard,
  Database
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'home' | 'login' | 'register' | 'dashboard') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleBegin = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      onNavigate('login');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans selection:bg-[#7CD5C7] selection:text-[#073B4C]"
      style={{ backgroundColor: '#F2F2ED', color: '#073B4C' }}
    >
      {/* Top Navigation Bar */}
      <nav 
        className="sticky top-0 z-50 border-b backdrop-blur-md px-6 py-4 transition-all shadow-sm"
        style={{ 
          backgroundColor: 'rgba(242, 242, 237, 0.95)', 
          borderColor: 'rgba(17, 138, 178, 0.25)' 
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Corner: Name SI-PALMS (Click returns to Home) */}
          <button 
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group text-left transition-transform active:scale-95"
          >
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}
            >
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider block leading-none" style={{ color: '#118AB2' }}>
                SI-PALMS
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold opacity-80" style={{ color: '#073B4C' }}>
                Secure Vault Portal
              </span>
            </div>
          </button>

          {/* Top Right Navbar: Login and Register buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div 
                  className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold"
                  style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7', color: '#073B4C' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#118AB2' }}></span>
                  <span>{user.name} ({user.id})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-md transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: '#118AB2', color: '#F2F2ED', border: '1px solid #118AB2' }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all hover:bg-[#118AB2]/10 active:scale-95"
                  style={{ color: '#118AB2', border: '1px solid #118AB2' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-md transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: '#118AB2', color: '#F2F2ED', border: '1px solid #118AB2' }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-6xl mx-auto w-full text-center relative z-10 space-y-10">
        
        {/* Background ambient glow accent */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30"
          style={{ backgroundColor: '#7CD5C7' }}
        />

        {/* Center Content: Title & Subtitle */}
        <div className="space-y-6 max-w-4xl mx-auto">
          
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold uppercase tracking-widest shadow-sm"
            style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7', color: '#118AB2' }}
          >
            <Lock className="w-3.5 h-3.5" style={{ color: '#118AB2' }} />
            <span>Cryptographic Chain-of-Custody & Evidence Vault</span>
          </div>

          <h1 
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none drop-shadow-sm"
            style={{ color: '#118AB2' }}
          >
            SI-PALMS
          </h1>

          <p 
            className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide max-w-3xl mx-auto font-mono leading-relaxed"
            style={{ color: '#073B4C' }}
          >
            (SECURE information portal for automated legal management system)
          </p>

          <p className="text-sm sm:text-base max-w-2xl mx-auto opacity-90 leading-relaxed font-sans" style={{ color: '#073B4C' }}>
            Multi-agency automated evidence lifecycle platform providing real-time forensic dispatch, blockchain proof seals, PKI ECDSA verification, and cross-case entity mapping.
          </p>
        </div>

        {/* Center Primary Button: Begin */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleBegin}
            className="px-12 py-5 rounded-2xl text-xl font-black font-mono flex items-center justify-center gap-3 cursor-pointer shadow-2xl transition-all hover:scale-105 active:scale-95 group mx-auto"
            style={{ 
              backgroundColor: '#118AB2', 
              color: '#F2F2ED', 
              border: '2px solid #118AB2',
              boxShadow: '0 20px 40px -15px rgba(17, 138, 178, 0.4)' 
            }}
          >
            <span>Begin</span>
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </button>
          
          <p className="text-xs font-mono opacity-80 mt-3" style={{ color: '#073B4C' }}>
            {user ? `Logged in as ${user.name} • Click Begin to open your dashboard` : 'Click Begin to log in and access authorized case files'}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-12 text-left">
          
          <div 
            className="p-6 rounded-3xl border transition-all hover:scale-105 shadow-md space-y-3"
            style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}>
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono" style={{ color: '#118AB2' }}>Police Case Intake</h3>
            <p className="text-xs opacity-90 leading-relaxed" style={{ color: '#073B4C' }}>
              Categorized FIR uploads, seizure panchnama sealing, and police precinct registration.
            </p>
          </div>

          <div 
            className="p-6 rounded-3xl border transition-all hover:scale-105 shadow-md space-y-3"
            style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}>
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono" style={{ color: '#118AB2' }}>Blockchain Seals</h3>
            <p className="text-xs opacity-90 leading-relaxed" style={{ color: '#073B4C' }}>
              SHA-256 digital hash fingerprinting anchored to immutable ledger blocks for court admissibility.
            </p>
          </div>

          <div 
            className="p-6 rounded-3xl border transition-all hover:scale-105 shadow-md space-y-3"
            style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}>
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono" style={{ color: '#118AB2' }}>Forensic Review</h3>
            <p className="text-xs opacity-90 leading-relaxed" style={{ color: '#073B4C' }}>
              Direct police-to-lab dispatch workflow for ballistics, digital evidence, and chemical lab reports.
            </p>
          </div>

          <div 
            className="p-6 rounded-3xl border transition-all hover:scale-105 shadow-md space-y-3"
            style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#118AB2', color: '#F2F2ED' }}>
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono" style={{ color: '#118AB2' }}>Judiciary Vault</h3>
            <p className="text-xs opacity-90 leading-relaxed" style={{ color: '#073B4C' }}>
              Read-only prosecutor and court vault with audit trail history logs and version control timeline.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer 
        className="border-t py-6 px-6 text-center text-xs font-mono shadow-inner"
        style={{ backgroundColor: '#ffffff', borderColor: '#7CD5C7', color: '#073B4C' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: '#118AB2' }} />
            <span className="font-bold">SI-PALMS System Architecture v2.0</span>
          </div>
          <p className="opacity-80">SECURE Information Portal for Automated Legal Management System</p>
        </div>
      </footer>
    </div>
  );
};
