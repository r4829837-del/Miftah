import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  CalendarRange,
  FileSpreadsheet,
  Target,
  FileText,
  Settings,
  LogOut,
  Brain,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCycle } from '../contexts/CycleContext';
import { getSettings, type AppSettings } from '../lib/storage';
import { SyncIndicator } from './SyncIndicator';
import { UserInfo } from './UserInfo';

const getMenuItems = (currentCycle: string) => [
  { icon: LayoutDashboard, label: 'لوحة القيادة', path: '/' },
  { icon: Users, label: currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ', path: '/students' },
  { icon: UserSquare2, label: 'إدارة الأقسام', path: '/groups' },
  { icon: CalendarRange, label: 'الجدول الزمني للمقابلات', path: '/schedule' },
  { icon: Brain, label: 'إدارة الإختبارات', path: '/tests' },
  { icon: FileSpreadsheet, label: 'التوصيات', path: '/recommendations' },
  { icon: Target, label: 'تحليل النتائج', path: '/analysis' },
  { icon: FileText, label: 'إدارة التقارير', path: '/reports' },
  { icon: Settings, label: 'الإعدادات', path: '/settings' }
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { 
    currentCycle, 
    toggleCycle, 
    switchCycleWithConfirmation,
    getCycleTitle, 
    getCycleConfig, 
    getAvailableCycles 
  } = useCycle();
  const [settings, setSettings] = useState<AppSettings>({
    schoolName: 'المدرسة',
    counselorName: 'أمين بوسحبة'
  });

  useEffect(() => {
    loadSettings();
  }, [currentCycle]); // Recharger les paramètres quand le cycle change

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="mb-8">
        {/* Sélecteur de cycle dynamique */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">اختر المرحلة التعليمية:</div>
          <div className="flex bg-gray-800 rounded-lg p-1">
            {getAvailableCycles().map((cycleConfig) => {
              const IconComponent = cycleConfig.icon === 'BookOpen' ? BookOpen : GraduationCap;
              const isActive = currentCycle === cycleConfig.name;
              const colorClass = cycleConfig.color === 'blue' ? 'bg-blue-600' : 'bg-purple-600';
              
              const handleCycleClick = async () => {
                if (currentCycle !== cycleConfig.name) {
                  await switchCycleWithConfirmation(cycleConfig.name as 'متوسط' | 'ثانوي');
                }
              };
              
              return (
                <button
                  key={cycleConfig.name}
                  onClick={handleCycleClick}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? `${colorClass} text-white`
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {cycleConfig.name}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="text-base mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getCycleConfig(currentCycle).color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
            <span className="underline font-semibold">{getCycleTitle()}</span>
            <span className="text-gray-300">:</span>
            <span className="text-gray-300 font-medium">
              {getCycleConfig(currentCycle).schoolName}
            </span>
          </div>
        </div>
        <div className="text-base text-gray-300 flex items-center gap-2">
          <span className="underline">مستشار(ة) التوجيه</span>:
          <div className="flex items-center gap-2">
            <strong>{settings.counselorName}</strong>
            {user && (
              <span className="status-indicator inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
      <nav className="flex flex-col flex-1">
        {getMenuItems(currentCycle).map((item, index) => (
          <div
            key={index}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            role="button"
            tabIndex={0}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </div>
        ))}
        
        {/* Informations utilisateur */}
        <div className="px-4 py-2">
          <UserInfo />
        </div>
        
        <div className="flex-1"></div>
        
        {/* Indicateur de synchronisation */}
        <div className="px-4 py-2 border-t border-gray-700">
          <SyncIndicator />
        </div>
        
        <div
          className="menu-item text-red-300 hover:text-red-400 hover:bg-red-900/20 mt-4"
          onClick={handleLogout}
          role="button"
          tabIndex={0}
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;