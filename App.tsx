import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/auth-context';
import LandingPage from './pages/LandingPage';
import PortfolioBuilder from './pages/PortfolioBuilder';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/auth/login/page';
import SignupPage from './pages/auth/signup/page';
import AuthCallbackPage from './pages/auth/callback/page';
import SetNewPasswordPage from './pages/auth/reset-password/new/page';
import VerifyResetTokenPage from './pages/auth/reset-password/verify/page';
import Plans from './pages/Plans';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SettingsPage from './pages/SettingsPage';
import DomainsPage from './pages/DomainsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MonetaryPolicy from './pages/MonetaryPolicy';
import { ThemeProvider } from './context/theme-context';
import { Loader } from 'lucide-react';
import Templates from './pages/Templates';
import MainLayout from './components/MainLayout';
import SessionExpiredModal from './components/SessionExpiredModal';
import TemplatePreview from './pages/TemplatePreview';
import MeshPage from './pages/app/MeshPage';
import FeedPage from './pages/app/FeedPage';
import NetworkPage from './pages/app/NetworkPage';
import PostPage from './pages/app/PostPage';
import UserSocialDashboard from './pages/app/UserSocialDashboard';
import { HelmetProvider } from 'react-helmet-async';
import { socketService } from './services/socketService';
import { notificationService } from './services/notificationService';

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSessionExpired, setIsSessionExpired] = React.useState(false);

  React.useEffect(() => {
    const handleSessionExpired = () => setIsSessionExpired(true);
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      socketService.connect(token || undefined);
      
      // Initialize Push Notifications
      notificationService.requestPermissionAndGetToken();
      notificationService.listenForMessages();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  const handleGetStarted = (initialData?: { type: string; value: string; templateId?: string }) => {
    navigate("/builder", { state: { initialData } });
  };

  return (
    <HelmetProvider>
    <ThemeProvider>
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onClose={() => setIsSessionExpired(false)}
      />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout hideFooter><LandingPage onGetStarted={handleGetStarted} /></MainLayout>} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactUs /></MainLayout>} />
        <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
        <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
        <Route path="/monetary-policy" element={<MainLayout><MonetaryPolicy /></MainLayout>} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/reset-password/new" element={<SetNewPasswordPage />} />
        <Route path="/auth/reset-password/verify" element={<VerifyResetTokenPage />} />
        <Route
          path="/portfolio/:id/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                onNew={() => handleGetStarted()}
                onEdit={(portfolio) => handleGetStarted({ type: 'edit', value: portfolio.id || '' })}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/dashboard/domains"
          element={
            <ProtectedRoute>
              <DomainsPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio/:id/template-preview"
          element={
            <ProtectedRoute>
              <TemplatePreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <PortfolioBuilder />
          }
        />
        <Route path="/plans" element={<Plans />} />
        <Route path="/app/mesh" element={<MeshPage />} />
        <Route path="/app/feed" element={<FeedPage />} />
        <Route path="/app/network" element={<Navigate to="/app/mesh" replace />} />
        <Route path="/app/feed/post/:slug" element={<PostPage />} />
        <Route path="/app/feed/reddit/:slug" element={<PostPage />} />
        <Route
          path="/app/social"
          element={
            <ProtectedRoute>
              <UserSocialDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
