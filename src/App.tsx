import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CycleProvider, useCycle } from './contexts/CycleContext';
import { useAnalytics } from './hooks/useAnalytics';
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
import ErrorBoundary from './components/ErrorBoundary';
import Settings from './components/Settings';
import TestManagement from './components/TestManagement';
import MethodGuide from './components/MethodGuide';
import UserGuide from './components/UserGuide';
import TestArabicPDF from './components/TestArabicPDF';
import TestPDFData from './components/TestPDFData';
import CycleIndependenceTest from './components/CycleIndependenceTest';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import IsolationAlert from './components/IsolationAlert';
 
import AnalysisBEM from './components/AnalysisBEM';

function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    const { currentCycle, getCycleTitle, getCycleConfig } = useCycle();
    const currentConfig = getCycleConfig(currentCycle);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { trackAction } = useAnalytics();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleRequestLogout = () => {
      setShowLogoutModal(true);
    };

    const handleCancelLogout = () => {
      if (isProcessing) return;
      setShowLogoutModal(false);
    };

    const proceedLogout = async () => {
      try {
        trackAction('logout');
        await logout();
        navigate('/login');
      } catch (e) {
        console.error('Logout error:', e);
      } finally {
        setIsProcessing(false);
        setShowLogoutModal(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar onToggle={setIsSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

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
                  onClick={handleRequestLogout}
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

        {showLogoutModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" role="document">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-semibold">تأكيد تسجيل الخروج</h2>
              </div>
              <p className="text-gray-700 mb-6">هل أنت متأكد أنك تريد تسجيل الخروج؟</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  disabled={isProcessing}
                >
                  إلغاء
                </button>
                <button
                  onClick={proceedLogout}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  disabled={isProcessing}
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
          {/* Alerte d'isolation des cycles */}
          <IsolationAlert />
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students/*" element={<StudentManagement />} />
            <Route path="/groups" element={<GroupManagement />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analysis" element={<AnalysisResults />} />
            <Route path="/analysis/bem" element={<AnalysisBEM />} />
            <Route path="/analysis/sem2" element={<AnalysisResultsSem2 />} />
            <Route path="/analysis/sem3" element={<AnalysisResultsSem3 />} />
            <Route path="/analysis/compare" element={<AnalysisResultsCompare />} />
            <Route path="/reports/*" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/tests/*" element={<TestManagement />} />
            <Route path="/method-guide" element={<MethodGuide />} />
            <Route path="/user-guide" element={<UserGuide />} />
            <Route path="/test-pdf" element={<TestArabicPDF />} />
            <Route path="/test-pdf-data" element={<TestPDFData />} />
            <Route path="/cycle-test" element={<CycleIndependenceTest />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
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

export default function RootApp() {
  return (
    <AuthProvider>
      <CycleProvider>
        <App />
      </CycleProvider>
    </AuthProvider>
  );
}