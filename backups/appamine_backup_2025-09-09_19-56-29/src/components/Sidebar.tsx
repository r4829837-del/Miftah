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
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSettings, type AppSettings } from '../lib/storage';

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة القيادة', path: '/' },
  { icon: Users, label: 'إدارة التلاميذ', path: '/students' },
  { icon: UserSquare2, label: 'إدارة الأقسام', path: '/groups' },
  { icon: CalendarRange, label: 'الجدول الزمني للمقابلات', path: '/schedule' },
  { icon: Brain, label: 'إدارة الإختبارات', path: '/tests' },
  { icon: FileSpreadsheet, label: 'التوصيات', path: '/recommendations' },
  { icon: Target, label: 'تحليل النتائج', path: '/goals' },
  { icon: FileText, label: 'إدارة التقارير', path: '/reports' },
  { icon: Settings, label: 'الإعدادات', path: '/settings' }
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    schoolName: 'المدرسة',
    counselorName: 'أمين بوسحبة'
  });

  useEffect(() => {
    loadSettings();
  }, []);

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
        <div className="text-base mb-2">
          <span className="underline">المتوسطة</span>: {settings.schoolName}
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
        {menuItems.map((item, index) => (
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
        <div className="flex-1"></div>
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