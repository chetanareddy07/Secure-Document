import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { LandingPage } from './components/views/LandingPage';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { PoliceCategoryUploadView } from './components/views/PoliceCategoryUploadView';
import { InvestigatorCategoryUploadView } from './components/views/InvestigatorCategoryUploadView';
import { ForensicView } from './components/views/ForensicView';
import { LawyerView } from './components/views/LawyerView';
import { AccessRestricted } from './components/views/AccessRestricted';
import { CaseSelection } from './components/views/CaseSelection';

import { AuditTrailView } from './components/views/AuditTrailView';
import { PersonCaseSearchView } from './components/views/PersonCaseSearchView';
import { IntegrityDashboard } from './components/views/IntegrityDashboard';

export type PageRoute = 'home' | 'login' | 'register' | 'dashboard';

const MainAppContent: React.FC = () => {
  const { user, activeCaseId, activeTab, canAccess } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');

  const handleNavigate = (page: PageRoute) => {
    setCurrentPage(page);
  };

  const renderActiveView = () => {
    if (!canAccess(activeTab)) {
      return <AccessRestricted />;
    }

    if (activeTab.endsWith('_integrity')) {
      return <IntegrityDashboard />;
    }

    if (activeTab === 'police_audit_trail') {
      return <AuditTrailView />;
    }

    if (activeTab === 'investigator_case_search') {
      return <PersonCaseSearchView />;
    }

    if (activeTab.startsWith('police_')) {
      return <PoliceCategoryUploadView />;
    }
    if (activeTab.startsWith('investigator_')) {
      return <InvestigatorCategoryUploadView />;
    }
    if (activeTab.startsWith('forensic_')) {
      return <ForensicView />;
    }
    if (activeTab.startsWith('lawyer_')) {
      return <LawyerView />;
    }

    return <PoliceCategoryUploadView />;
  };

  // Render Page Based on currentPage state
  if (currentPage === 'home') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'login' || currentPage === 'register') {
    if (user) {
      if (!activeCaseId) {
        return (
          <div className="min-h-screen flex flex-col">
            <AppHeader onNavigate={handleNavigate} />
            <CaseSelection />
          </div>
        );
      }
      return (
        <div className="min-h-screen flex flex-col">
          <AppHeader onNavigate={handleNavigate} />
          
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5">
            <Sidebar />
            
            <main className="flex-1 min-w-0">
              {renderActiveView()}
            </main>
          </div>
        </div>
      );
    }
    return (
      <LoginForm 
        initialMode={currentPage === 'register' ? 'REGISTER' : 'LOGIN'} 
        onNavigate={handleNavigate}
        onSuccess={() => setCurrentPage('dashboard')}
      />
    );
  }

  // Dashboard Route
  if (!user) {
    return (
      <LoginForm 
        initialMode="LOGIN" 
        onNavigate={handleNavigate}
        onSuccess={() => setCurrentPage('dashboard')}
      />
    );
  }

  if (!activeCaseId) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader onNavigate={handleNavigate} />
        <CaseSelection />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onNavigate={handleNavigate} />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5">
        <Sidebar />
        
        <main className="flex-1 min-w-0">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
