import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  Download, 
  RefreshCw,
  School,
  Calendar,
  Activity,
  Eye,
  UserCheck,
  Globe
} from 'lucide-react';
import { analyticsService, AnalyticsData, DailyStats } from '../services/analyticsService';
import NetScolaireAnalytics from './NetScolaireAnalytics';

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'app' | 'website'>('app');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await analyticsService.exportAnalyticsData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appamine_analytics_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const getFilteredDailyStats = () => {
    if (!analyticsData) return [];
    
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    return analyticsData.dailyStats.slice(0, days);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}د`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}س ${mins}د`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-DZ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>جاري تحميل الإحصائيات...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات متاحة</h3>
        <p className="text-gray-600">لم يتم تسجيل أي نشاط بعد</p>
      </div>
    );
  }

  const filteredStats = getFilteredDailyStats();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة الإحصائيات</h1>
          <p className="text-gray-600">إحصائيات استخدام التطبيق وموقع نت سكولير</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Onglets */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'app' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              التطبيق
            </button>
            <button
              onClick={() => setActiveTab('website')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'website' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              نت سكولير
            </button>
          </div>
          
          {activeTab === 'app' && (
            <>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">آخر 7 أيام</option>
                <option value="30d">آخر 30 يوم</option>
                <option value="90d">آخر 90 يوم</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'app' ? (
        <>
          {/* Cartes de statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الجلسات</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">متوسط مدة الجلسة</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analyticsData.averageSessionTime)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الوقت</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analyticsData.totalSessionTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution par type d'établissement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">التوزيع حسب نوع المؤسسة</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <School className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700">ثانوي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.schoolTypeDistribution.lyce}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsData.schoolTypeDistribution.lyce}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <School className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-gray-700">متوسط</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${analyticsData.schoolTypeDistribution.cem}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsData.schoolTypeDistribution.cem}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أكثر المستخدمين نشاطاً</h3>
          <div className="space-y-3">
            {analyticsData.topUsers.slice(0, 5).map((user, index) => (
              <div key={user.email} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700 mr-2 truncate max-w-32">
                    {user.email}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {user.sessions} جلسة
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques quotidiennes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإحصائيات اليومية</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تسجيلات الدخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مستخدمون فريدون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  متوسط مدة الجلسة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ثانوي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  متوسط
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStats.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.totalLogins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.uniqueUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(day.averageSessionTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.schoolTypeStats.lyce.logins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.schoolTypeStats.cem.logins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          {/* Informations de mise à jour */}
          <div className="text-center text-sm text-gray-500">
            آخر تحديث: {formatDate(analyticsData.lastUpdated)}
          </div>
        </>
      ) : (
        <NetScolaireAnalytics />
      )}
    </div>
  );
};

export default AnalyticsDashboard;