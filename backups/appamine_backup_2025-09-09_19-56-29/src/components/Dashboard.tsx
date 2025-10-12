import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Search } from 'lucide-react';

import {
  Users,
  UserSquare2,
  CalendarRange,
  FileSpreadsheet,
  Target,
  FileText,
  Settings,
  Brain
} from 'lucide-react';

const dashboardCards = [
  { icon: Users, label: 'إدارة التلاميذ', color: 'bg-red-500', path: '/students' },
  { icon: UserSquare2, label: 'إدارة الأقسام', color: 'bg-green-500', path: '/groups' },
  { icon: CalendarRange, label: 'الجدول الزمني', color: 'bg-pink-500', path: '/schedule' },
  { icon: FileSpreadsheet, label: 'التوصيات', color: 'bg-orange-500', path: '/recommendations' },
  { icon: Target, label: 'تحليل النتائج', color: 'bg-purple-500', path: '/goals' },
  { icon: Brain, label: 'إدارة الإختبارات', color: 'bg-blue-500', path: '/tests' },
  { icon: FileText, label: 'إدارة التقارير', color: 'bg-indigo-500', path: '/reports' },
  { icon: Settings, label: 'الاعدادات', color: 'bg-gray-500', path: '/settings' }
];

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCards, setFilteredCards] = useState(dashboardCards);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredCards(dashboardCards);
    } else {
      const filtered = dashboardCards.filter(card =>
        card.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredCards.length > 0) {
      navigate(filteredCards[0].path);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">لوحة القيادة</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/method-guide')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>الدليل المنهجي</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="بحث..."
            className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
          />
          <button 
            onClick={() => filteredCards.length > 0 && navigate(filteredCards[0].path)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card, index) => (
          <div
            key={index}
            className="dashboard-card transform hover:scale-105 transition-transform duration-200"
            onClick={() => navigate(card.path)}
            role="button"
            tabIndex={0}
          >
            <div className={`${card.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
              <card.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">{card.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;