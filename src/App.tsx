import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import StudentManagement from './components/StudentManagement';
import GroupManagement from './components/GroupManagement';
import Schedule from './components/Schedule';
import Recommendations from './components/Recommendations';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Settings from './components/Settings';
import TestManagement from './components/TestManagement';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students/*" element={<StudentManagement />} />
          <Route path="/groups" element={<GroupManagement />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tests/*" element={<TestManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;