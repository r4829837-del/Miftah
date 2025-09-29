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
  Brain,
  GraduationCap,
  BookOpen,
  Video,
  ChevronRight,
  ChevronLeft
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

interface SidebarProps {
  onToggle?: (isCollapsed: boolean) => void;
}

function Sidebar({ onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    console.log(`Sidebar: Cycle changé vers ${currentCycle}`);
    loadSettings();
  }, [currentCycle]); // Recharger les paramètres quand le cycle change

  // Écouter les changements de paramètres dans localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const cycleKey = `appSettings_${currentCycle}`;
      if (e.key === cycleKey) {
        console.log(`Sidebar: Changement détecté pour le cycle ${currentCycle}`);
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Écouter aussi les changements de paramètres dans la même fenêtre
    const handleCustomSettingsChange = () => {
      console.log('Sidebar: Changement de paramètres détecté');
      loadSettings();
    };

    window.addEventListener('settingsUpdated', handleCustomSettingsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleCustomSettingsChange);
    };
  }, [currentCycle]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings(currentCycle);
      console.log(`Sidebar: Chargement des paramètres pour le cycle ${currentCycle}:`, {
        schoolName: loadedSettings?.schoolName,
        counselorName: loadedSettings?.counselorName
      });
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres dans la sidebar:', error);
    }
  };

  // No local logout action; logout button moved to top header

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle?.(newCollapsedState);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton de toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-10 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        title={isCollapsed ? 'Développer la sidebar' : 'Rétracter la sidebar'}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className={`mb-8 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
              {settings.schoolName || 'غير محدد'}
            </span>
          </div>
        </div>
        <div className="text-base text-gray-300 flex items-center gap-2">
          <span className="underline">مستشار(ة) التوجيه</span>:
          <div className="flex items-center gap-2">
            <strong>{settings.counselorName || 'غير محدد'}</strong>
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
            className={`menu-item ${location.pathname === item.path ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => navigate(item.path)}
            role="button"
            tabIndex={0}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5" />
            {!isCollapsed && <span>{item.label}</span>}
          </div>
        ))}
        
        {/* Informations utilisateur */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <UserInfo />
          </div>
        )}
        
        <div className="flex-1"></div>
        
        {/* Indicateur de synchronisation */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-gray-700">
            <SyncIndicator />
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;