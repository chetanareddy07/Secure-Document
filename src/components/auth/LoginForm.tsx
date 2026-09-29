import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { OfficerRole, RolePrefix } from '../../types/auth';
import { ROLE_CONFIGS } from '../../data/mockUsers';
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

interface LoginFormProps {
  initialMode?: 'LOGIN' | 'REGISTER';
  onNavigate?: (page: 'home' | 'login' | 'register' | 'dashboard') => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  initialMode = 'LOGIN', 
  onNavigate,
  onSuccess 
}) => {
  const { login, registerOfficer } = useAuth();
  
  // Active Form Mode: 'LOGIN' or 'REGISTER'
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Login Form States
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState<OfficerRole>('POLICE_OFFICER');
  const regDept = 'Crime Operations';
  const regStation = 'Central Precinct No. 4';

  // Auto-detect prefix
  const prefixMatch = officerId.trim().match(/^(PO|IN|FO|LW)/i);
  const detectedPrefix = prefixMatch ? (prefixMatch[0].toUpperCase() as keyof typeof ROLE_CONFIGS) : null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!officerId.trim() || !password.trim()) {
      setError('Please enter your Officer ID and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(officerId, password);
      if (res.status === 'NEW_OFFICER_REGISTRATION_REQUIRED') {
        setRegId(officerId.toUpperCase());
        setRegPass(password);
        setMode('REGISTER');
        setNotice(res.message || 'Officer ID not registered. Create your officer account below.');
        setError('');
      } else if (res.status === 'SUCCESS') {
        if (onSuccess) onSuccess();
        if (onNavigate) onNavigate('dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!regName.trim() || !regId.trim() || !regPass.trim()) {
      setError('Please complete all required fields for officer registration.');
      return;
    }

    const rolePrefixMap: Record<OfficerRole, RolePrefix> = {
      POLICE_OFFICER: 'PO',
      INVESTIGATOR: 'IN',
      FORENSIC_OFFICER: 'FO',
      LAWYER: 'LW'
    };

    const prefix = rolePrefixMap[regRole] || 'PO';

    setIsSubmitting(true);
    try {
      const res = await registerOfficer({
        id: regId.toUpperCase(),
        password: regPass,
        name: regName,
        rankTitle: ROLE_CONFIGS[prefix]?.title || 'Officer',
        role: regRole,
        department: regDept,
        station: regStation
      });

      if (res && res.success) {
        if (onSuccess) onSuccess();
        if (onNavigate) onNavigate('dashboard');
      } else {
        setError(res?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating officer account.');
    } finally {
      setIsSubmitting(false);
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
          
          {/* Left Corner: Brand Logo / Name SI-PALMS (Clicking returns to Home) */}
          <button 
            type="button"
            onClick={() => onNavigate ? onNavigate('home') : null}
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
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(''); setNotice(''); if (onNavigate) onNavigate('login'); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                mode === 'LOGIN' ? 'shadow-md font-black' : 'opacity-80'
              }`}
              style={{ 
                backgroundColor: mode === 'LOGIN' ? '#118AB2' : 'transparent',
                color: mode === 'LOGIN' ? '#F2F2ED' : '#118AB2', 
                border: '1px solid #118AB2' 
              }}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(''); setNotice(''); if (onNavigate) onNavigate('register'); }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                mode === 'REGISTER' ? 'shadow-md font-black' : 'opacity-80'
              }`}
              style={{ 
                backgroundColor: mode === 'REGISTER' ? '#118AB2' : 'transparent',
                color: mode === 'REGISTER' ? '#F2F2ED' : '#118AB2', 
                border: '1px solid #118AB2' 
              }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Center Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background ambient glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-20"
          style={{ backgroundColor: '#7CD5C7' }}
        />

        {/* Form Card Container */}
        <div 
          className="w-full max-w-md rounded-3xl p-8 border shadow-xl space-y-6 relative z-10 backdrop-blur-md"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#7CD5C7'
          }}
        >
          
          {/* Header Badge */}
          <div className="text-center space-y-3">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md border"
              style={{ backgroundColor: '#118AB2', borderColor: '#7CD5C7', color: '#F2F2ED' }}
            >
              <Shield className="w-9 h-9" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-2xl font-black tracking-wider" style={{ color: '#118AB2' }}>
                  {mode === 'LOGIN' ? 'OFFICER LOGIN' : 'OFFICER REGISTRATION'}
                </h1>
              </div>
              <p className="text-xs font-mono opacity-80" style={{ color: '#073B4C' }}>SI-PALMS Authentication & Clearance Vault</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div 
            className="flex items-center p-1 rounded-2xl border"
            style={{ backgroundColor: '#F2F2ED', borderColor: '#7CD5C7' }}
          >
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(''); setNotice(''); }}
              className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'LOGIN'
                  ? 'shadow-md border'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: mode === 'LOGIN' ? '#118AB2' : 'transparent',
                color: mode === 'LOGIN' ? '#F2F2ED' : '#073B4C',
                borderColor: mode === 'LOGIN' ? '#118AB2' : 'transparent'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(''); setNotice(''); }}
              className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === 'REGISTER'
                  ? 'shadow-md border'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: mode === 'REGISTER' ? '#118AB2' : 'transparent',
                color: mode === 'REGISTER' ? '#F2F2ED' : '#073B4C',
                borderColor: mode === 'REGISTER' ? '#118AB2' : 'transparent'
              }}
            >
              Register Account
            </button>
          </div>

          {notice && (
            <div 
              className="p-3.5 rounded-xl border flex items-center gap-2 text-xs font-mono"
              style={{ backgroundColor: '#F2F2ED', borderColor: '#118AB2', color: '#118AB2' }}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-center gap-2 text-xs text-rose-900 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider font-mono" style={{ color: '#073B4C' }}>
                  Officer ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. PO-1042, IN-8805, FO-4091, LW-9120"
                    className="w-full px-4 py-3 rounded-xl font-mono text-xs focus:outline-none transition-all border"
                    style={{ 
                      backgroundColor: '#F2F2ED', 
                      color: '#073B4C', 
                      borderColor: '#118AB2' 
                    }}
                    required
                  />
                  {detectedPrefix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span 
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                        style={{ backgroundColor: '#118AB2', color: '#F2F2ED', borderColor: '#118AB2' }}
                      >
                        {detectedPrefix}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider font-mono" style={{ color: '#073B4C' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter officer password..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl text-xs focus:outline-none transition-all border font-mono"
                    style={{ 
                      backgroundColor: '#F2F2ED', 
                      color: '#073B4C', 
                      borderColor: '#118AB2' 
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 cursor-pointer"
                    style={{ color: '#073B4C' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold font-mono text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ 
                  backgroundColor: '#118AB2', 
                  color: '#F2F2ED', 
                  border: '1px solid #118AB2' 
                }}
              >
                <span>{isSubmitting ? 'Authenticating Session...' : 'Authenticate Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 font-mono" style={{ color: '#073B4C' }}>Officer Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Inspector Ramesh Shah"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border font-mono"
                  style={{ backgroundColor: '#F2F2ED', color: '#073B4C', borderColor: '#118AB2' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 font-mono" style={{ color: '#073B4C' }}>Officer ID (PO-, IN-, FO-, LW-)</label>
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder="e.g. PO-9901, IN-4020, FO-5011, LW-2010"
                  className="w-full px-3.5 py-2.5 rounded-xl font-mono text-xs border"
                  style={{ backgroundColor: '#F2F2ED', color: '#073B4C', borderColor: '#118AB2' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 font-mono" style={{ color: '#073B4C' }}>Password</label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Set officer password..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border font-mono"
                  style={{ backgroundColor: '#F2F2ED', color: '#073B4C', borderColor: '#118AB2' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 font-mono" style={{ color: '#073B4C' }}>Officer Role Clearance</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as OfficerRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border font-mono"
                  style={{ backgroundColor: '#F2F2ED', color: '#073B4C', borderColor: '#118AB2' }}
                >
                  <option value="POLICE_OFFICER">Police Officer (PO) - Case Details Upload</option>
                  <option value="FORENSIC_OFFICER">Forensic Officer (FO) - Lab Report Upload</option>
                  <option value="INVESTIGATOR">Investigator (IN) - Open & View Evidence</option>
                  <option value="LAWYER">Lawyer / Prosecutor (LW) - Read-Only Court Vault</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold font-mono text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ 
                  backgroundColor: '#118AB2', 
                  color: '#F2F2ED', 
                  border: '1px solid #118AB2' 
                }}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Log In'}</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
