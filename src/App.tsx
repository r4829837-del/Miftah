import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CycleProvider, useCycle } from './contexts/CycleContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import StudentManagement from './components/StudentManagement';
import GroupManagement from './components/GroupManagement';
import Schedule from './components/Schedule';
import Recommendations from './components/Recommendations';
import Goals from './components/Goals';
import AnalysisResults from './components/AnalysisResults';
import AnalysisResultsSem2 from './components/AnalysisResultsSem2';
import AnalysisResultsSem3 from './components/AnalysisResultsSem3';
import AnalysisResultsCompare from './components/AnalysisResultsCompare';
import Reports from './components/Reports';
import Settings from './components/Settings';
import TestManagement from './components/TestManagement';
import MethodGuide from './components/MethodGuide';
import UserGuide from './components/UserGuide';
import TestArabicPDF from './components/TestArabicPDF';
import TestPDFData from './components/TestPDFData';
import CycleIndependenceTest from './components/CycleIndependenceTest';
import { databaseService } from './services/databaseService';

function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    const { currentCycle, getCycleTitle, getCycleConfig } = useCycle();
    const currentConfig = getCycleConfig(currentCycle);
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    
    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        <main className="main-content">
          {/* En-tête avec indicateur du cycle */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-800">
                {getCycleTitle()}
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentConfig.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                  <span className="text-gray-600">المرحلة الحالية:</span>
                  <span className={`font-semibold ${currentConfig.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {currentCycle}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className="text-gray-500">
                  {currentConfig.schoolName}
                </span>
                
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  title="تسجيل الخروج"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error in AppLayout:', error);
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">خطأ في تحميل التطبيق</h2>
          <p>حدث خطأ أثناء تحميل التطبيق. يرجى إعادة تحميل الصفحة.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}

function App() {
  try {
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
          <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students/*" element={<StudentManagement />} />
            <Route path="/groups" element={<GroupManagement />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analysis" element={<AnalysisResults />} />
            <Route path="/analysis/sem2" element={<AnalysisResultsSem2 />} />
            <Route path="/analysis/sem3" element={<AnalysisResultsSem3 />} />
            <Route path="/analysis/compare" element={<AnalysisResultsCompare />} />
            <Route path="/reports/*" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/tests/*" element={<TestManagement />} />
            <Route path="/method-guide" element={<MethodGuide />} />
            <Route path="/user-guide" element={<UserGuide />} />
            <Route path="/test-pdf" element={<TestArabicPDF />} />
            <Route path="/test-pdf-data" element={<TestPDFData />} />
            <Route path="/cycle-test" element={<CycleIndependenceTest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    );
  } catch (error) {
    console.error('Error in App:', error);
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">خطأ في التطبيق الرئيسي</h2>
          <p>حدث خطأ أثناء تحميل التطبيق. يرجى إعادة تحميل الصفحة.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}

function AppWrapper() {
  try {
    useEffect(() => {
      try {
        // Enable auto-backup every 30 minutes by default
        databaseService.setAutoBackup(true);
      } catch (e) {
        console.error('Failed to enable auto-backup', e);
      }
    }, []);

    return (
      <AuthProvider>
        <CycleProvider>
          <App />
        </CycleProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('Error in AppWrapper:', error);
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">خطأ في تحميل التطبيق</h2>
          <p>حدث خطأ أثناء تحميل التطبيق. يرجى إعادة تحميل الصفحة.</p>
          <p className="text-sm mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}

export default AppWrapper;