import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBanner } from './components/layout/RoleSwitcherBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';
import { DocumentPreviewModal } from './components/ui/DocumentPreviewModal';
import { CreateAppointmentModal } from './components/ui/CreateAppointmentModal';
import { UploadDocumentModal } from './components/ui/UploadDocumentModal';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerificationPage } from './pages/public/VerificationPage';

// Dashboards
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { ParentDashboard } from './pages/dashboards/ParentDashboard';
import { FacultyDashboard } from './pages/dashboards/FacultyDashboard';
import { MediatorDashboard } from './pages/dashboards/MediatorDashboard';
import { PrincipalDashboard } from './pages/dashboards/PrincipalDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

// Modules
import { AppointmentsPage } from './pages/modules/AppointmentsPage';
import { DocumentsPage } from './pages/modules/DocumentsPage';
import { NotificationsPage } from './pages/modules/NotificationsPage';
import { ReportsPage } from './pages/modules/ReportsPage';
import { ProfilePage } from './pages/modules/ProfilePage';
import { DocumentApproval, UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, currentRole, setCurrentRole, verifyDocumentByMediator, approveDocumentByPrincipal } = useApp();

  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [selectedDocument, setSelectedDocument] = useState<DocumentApproval | null>(null);
  const [isCreateAptOpen, setIsCreateAptOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const vId = path.split('/verify/')[1];
      if (vId) {
        setVerificationId(vId);
        setCurrentPage('verify');
      }
    }
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'create-appointment') {
      setIsCreateAptOpen(true);
      return;
    }
    if (page === 'upload-document') {
      setIsUploadDocOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRoleDemo = async (role: UserRole) => {
    await setCurrentRole(role);
    setCurrentPage('dashboard');
  };

  if (currentPage === 'verify' && verificationId) {
    return (
      <VerificationPage
        verificationId={verificationId}
        onNavigateHome={() => {
          setVerificationId(null);
          setCurrentPage('landing');
        }}
      />
    );
  }

  // Render Public or Auth pages without sidebar
  if (currentPage === 'landing') {
    return (
      <>
        <RoleSwitcherBanner />
        <LandingPage onNavigate={handleNavigate} onSelectRoleDemo={handleSelectRoleDemo} />
        <GlobalSearchModal />
      </>
    );
  }

  if (currentPage === 'login' || (!currentUser && ['dashboard', 'appointments', 'documents', 'notifications', 'reports', 'profile', 'admin-users', 'admin-audit'].includes(currentPage))) {
    return (
      <>
        <RoleSwitcherBanner />
        <LoginPage onNavigate={handleNavigate} />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        <RoleSwitcherBanner />
        <RegisterPage onNavigate={handleNavigate} />
      </>
    );
  }

  if (currentPage === 'forgot-password') {
    return (
      <>
        <RoleSwitcherBanner />
        <ForgotPasswordPage onNavigate={handleNavigate} />
      </>
    );
  }

  if (currentPage === 'reset-password') {
    return (
      <>
        <RoleSwitcherBanner />
        <ResetPasswordPage onNavigate={handleNavigate} />
      </>
    );
  }

  // Dashboard Shell Render
  const renderDashboardView = () => {
    switch (currentRole) {
      case 'student':
        return (
          <StudentDashboard
            onNavigate={handleNavigate}
            onSelectDocument={setSelectedDocument}
            onOpenCreateAppointment={() => setIsCreateAptOpen(true)}
            onOpenUploadDocument={() => setIsUploadDocOpen(true)}
          />
        );
      case 'parent':
        return (
          <ParentDashboard
            onNavigate={handleNavigate}
            onSelectDocument={setSelectedDocument}
            onOpenCreateAppointment={() => setIsCreateAptOpen(true)}
          />
        );
      case 'faculty':
        return (
          <FacultyDashboard
            onNavigate={handleNavigate}
            onSelectDocument={setSelectedDocument}
            onOpenCreateAppointment={() => setIsCreateAptOpen(true)}
            onOpenUploadDocument={() => setIsUploadDocOpen(true)}
          />
        );
      case 'mediator':
        return (
          <MediatorDashboard
            onNavigate={handleNavigate}
            onSelectDocument={setSelectedDocument}
          />
        );
      case 'principal':
        return (
          <PrincipalDashboard
            onNavigate={handleNavigate}
            onSelectDocument={setSelectedDocument}
          />
        );
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <PrincipalDashboard onNavigate={handleNavigate} onSelectDocument={setSelectedDocument} />;
    }
  };

  const renderActiveMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboardView();
      case 'appointments':
        return <AppointmentsPage onOpenCreateModal={() => setIsCreateAptOpen(true)} />;
      case 'documents':
        return (
          <DocumentsPage
            onOpenUploadModal={() => setIsUploadDocOpen(true)}
            onSelectDocument={setSelectedDocument}
          />
        );
      case 'notifications':
        return <NotificationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin-users':
      case 'admin-audit':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return renderDashboardView();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Interactive Persona Demo Switcher Top Bar */}
      <RoleSwitcherBanner />

      {/* Main Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onNavigatePage={handleNavigate}
      />

      {/* App Workspace Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveMainContent()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <DocumentPreviewModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        userRole={currentRole}
        onVerifyByMediator={verifyDocumentByMediator}
        onApproveByPrincipal={approveDocumentByPrincipal}
      />
      <CreateAppointmentModal
        isOpen={isCreateAptOpen}
        onClose={() => setIsCreateAptOpen(false)}
      />
      <UploadDocumentModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
