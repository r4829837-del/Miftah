import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatbotLogin from './components/ChatbotLogin';
import StudentManagement from './components/StudentManagement';
import GroupManagement from './components/GroupManagement';
import Schedule from './components/Schedule';
import Recommendations from './components/Recommendations';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Settings from './components/Settings';
import TestManagement from './components/TestManagement';
import MethodGuide from './components/MethodGuide';

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
          <Route path="/login" element={<ChatbotLogin />} />
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
          <Route path="/method-guide" element={<MethodGuide />} />
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