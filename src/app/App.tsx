import React from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import DashboardOverviewModule from './components/admin/DashboardOverview';
import UserManagementModule from './components/admin/UserManagement';
import QuestionsModule from './components/admin/QuestionsModule';
import JobsModule from './components/admin/JobsModule';
import SettingsModule from './components/admin/SettingsModule';

// // Protected Route Component
// const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
//   const { isAuthenticated , loading} = useAuth();
//   if (loading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
//       </div>
//     );
//   }
//   if (!isAuthenticated && !loading) {
//     return <Navigate to="/login" replace />;
//   }
//   return <>{children}</>;
// };

// Admin Protected Route
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user,loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function AppContent() {
  const { logout } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard onLogout={logout} />
          </AdminRoute>
        }
      >
        {/* 👇 These render INSIDE <Outlet /> */}
        <Route index element={<DashboardOverviewModule />} />
        <Route path="users" element={<UserManagementModule />} />
        <Route path="questions" element={<QuestionsModule />} />
        <Route path="jobs" element={<JobsModule />} />
        <Route path="settings" element={<SettingsModule />} />
      </Route>

      {/* Protected User Routes */}
      
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <ToastContainer />
        <AppContent />
    </AuthProvider>
    </BrowserRouter>
  );
}
