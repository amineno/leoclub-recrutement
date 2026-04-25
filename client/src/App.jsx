import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RecruitmentForm from './pages/RecruitmentForm';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Phase2Form from './pages/Phase2Form';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'glass dark:!bg-slate-900/80 dark:!text-white !rounded-2xl !border-white/20 !shadow-2xl',
            style: {
              backdropFilter: 'blur(12px)',
            }
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<RecruitmentForm />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/continue" element={<Phase2Form />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
