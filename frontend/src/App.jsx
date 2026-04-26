import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LoadingPage } from './components/common/UI';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import SubmitComplaint from './pages/public/SubmitComplaint';
import TrackComplaint from './pages/public/TrackComplaint';

// Citizen Pages
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';

// Nagar Palika Pages
import NPDashboard from './pages/nagarpalika/NPDashboard';
import NPMapView from './pages/nagarpalika/NPMapView';
import NPReportsList from './pages/nagarpalika/NPReportsList';
import NPReportDetail from './pages/nagarpalika/NPReportDetail';
import NPWorkers from './pages/nagarpalika/NPWorkers';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminExport from './pages/admin/AdminExport';

// Route Guards
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'nagarpalika') return <Navigate to="/np/dashboard" replace />;
    if (user.role === 'worker') return <Navigate to="/np/reports" replace />;
    return <Navigate to="/my-complaints" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/report" element={<SubmitComplaint />} />
      <Route path="/track/:id" element={<TrackComplaint />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Citizen */}
      <Route path="/my-complaints" element={<ProtectedRoute roles={['citizen']}><MyComplaints /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ProtectedRoute roles={['citizen']}><ComplaintDetail /></ProtectedRoute>} />

      {/* Nagar Palika */}
      <Route path="/np/dashboard" element={<ProtectedRoute roles={['nagarpalika', 'admin']}><NPDashboard /></ProtectedRoute>} />
      <Route path="/np/map" element={<ProtectedRoute roles={['nagarpalika', 'admin', 'worker']}><NPMapView /></ProtectedRoute>} />
      <Route path="/np/reports" element={<ProtectedRoute roles={['nagarpalika', 'admin', 'worker']}><NPReportsList /></ProtectedRoute>} />
      <Route path="/np/reports/:id" element={<ProtectedRoute roles={['nagarpalika', 'admin', 'worker']}><NPReportDetail /></ProtectedRoute>} />
      <Route path="/np/workers" element={<ProtectedRoute roles={['nagarpalika', 'admin']}><NPWorkers /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AdminAuditLogs /></ProtectedRoute>} />
      <Route path="/admin/export" element={<ProtectedRoute roles={['admin']}><AdminExport /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 14 },
                success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
              }}
            />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  );
}
