import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Archive, Upload, Save, X } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { useCycleStorage } from '../hooks/useCycleStorage';

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

const getDashboardCards = (currentCycle: string) => [
  { icon: Users, label: currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ', color: 'bg-red-500', path: '/students' },
  { icon: UserSquare2, label: 'إدارة الأقسام', color: 'bg-green-500', path: '/groups' },
  { icon: CalendarRange, label: 'الجدول الزمني', color: 'bg-pink-500', path: '/schedule' },
  { icon: FileSpreadsheet, label: 'التوصيات', color: 'bg-orange-500', path: '/recommendations' },
  { icon: Target, label: 'تحليل النتائج', color: 'bg-purple-500', path: '/analysis' },
  { icon: Brain, label: 'إدارة الإختبارات', color: 'bg-blue-500', path: '/tests' },
  { icon: FileText, label: 'إدارة التقارير', color: 'bg-indigo-500', path: '/reports' },
  { icon: Settings, label: 'الاعدادات', color: 'bg-gray-500', path: '/settings' }
];

function Dashboard() {
  const navigate = useNavigate();
  const { currentCycle } = useCycle();
  const { getStorage, setStorage } = useCycleStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCards, setFilteredCards] = useState(getDashboardCards(currentCycle));
  
  // États pour la gestion des sauvegardes
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupName, setBackupName] = useState('');

  // Mettre à jour les cartes quand le cycle change
  React.useEffect(() => {
    setFilteredCards(getDashboardCards(currentCycle));
  }, [currentCycle]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    const dashboardCards = getDashboardCards(currentCycle);
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

  // Fonction de sauvegarde complète de l'application
  const saveCompleteApplication = () => {
    if (!backupName.trim()) {
      alert('يرجى إدخال اسم للنسخة الاحتياطية');
      return;
    }

    try {
      // Collecter toutes les données de l'application depuis localStorage
      const allApplicationData = {
        // Métadonnées de la sauvegarde
        backupInfo: {
          id: Date.now().toString(),
          name: backupName,
          date: new Date().toLocaleString('ar-DZ'),
          version: '1.0',
          type: 'complete_application_backup'
        },
        
        // Toutes les données stockées par cycle
        students: getStorage('students') || [],
        groups: getStorage('groups') || [],
        tests: getStorage('tests') || [],
        recommendations: getStorage('recommendations') || [],
        analysisData: getStorage('analysisData') || [],
        settings: getStorage('appSettings') || {},
        auth: getStorage('auth') || {},
        reports: getStorage('reports') || [],
        interventionData: getStorage('interventionData') || {},
        counselorData: getStorage('counselorData') || [],
        testResults: getStorage('testResults') || [],
        goalsData: getStorage('goalsData') || [],
        scheduleData: getStorage('scheduleData') || []
      };

      // Créer et télécharger le fichier
      const dataStr = JSON.stringify(allApplicationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Miftah_Backup_${backupName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setBackupName('');
      setShowBackupModal(false);
      alert('تم تحميل النسخة الاحتياطية الكاملة للتطبيق بنجاح');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde complète:', error);
      alert('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    }
  };

  // Fonction de restauration complète de l'application
  const restoreCompleteApplication = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Vérifier si c'est un fichier de sauvegarde complète valide
        if (importedData.backupInfo && importedData.backupInfo.type === 'complete_application_backup') {
          if (confirm('هل تريد استعادة النسخة الاحتياطية الكاملة للتطبيق؟ سيتم استبدال جميع البيانات الحالية.')) {
            
            // Restaurer toutes les données par cycle
            if (importedData.students) setStorage('students', importedData.students);
            if (importedData.groups) setStorage('groups', importedData.groups);
            if (importedData.tests) setStorage('tests', importedData.tests);
            if (importedData.recommendations) setStorage('recommendations', importedData.recommendations);
            if (importedData.analysisData) setStorage('analysisData', importedData.analysisData);
            if (importedData.settings) setStorage('appSettings', importedData.settings);
            if (importedData.auth) setStorage('auth', importedData.auth);
            if (importedData.reports) setStorage('reports', importedData.reports);
            if (importedData.interventionData) setStorage('interventionData', importedData.interventionData);
            if (importedData.counselorData) setStorage('counselorData', importedData.counselorData);
            if (importedData.testResults) setStorage('testResults', importedData.testResults);
            if (importedData.goalsData) setStorage('goalsData', importedData.goalsData);
            if (importedData.scheduleData) setStorage('scheduleData', importedData.scheduleData);
            
            alert('تم استعادة النسخة الاحتياطية الكاملة للتطبيق بنجاح. يرجى إعادة تحميل الصفحة.');
            
            // Recharger la page pour appliquer tous les changements
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } else {
          alert('ملف غير صالح. يرجى اختيار ملف نسخة احتياطية كاملة للتطبيق.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('خطأ في قراءة الملف. يرجى التأكد من أن الملف صحيح.');
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input
    event.target.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">لوحة القيادة</h1>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBackupModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <Archive className="w-4 h-4" />
              <span>حفظ نسخة احتياطية</span>
            </button>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>استيراد نسخة احتياطية</span>
              <input
                type="file"
                accept=".json"
                onChange={restoreCompleteApplication}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/user-guide')}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              <span>الدليل المستخدم</span>
            </button>
            <button
              onClick={() => navigate('/method-guide')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>الدليل المنهجي</span>
            </button>
          </div>
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

      {/* Modal de création de sauvegarde complète */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">حفظ نسخة احتياطية كاملة</h3>
              <button
                onClick={() => setShowBackupModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Archive className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">نسخة احتياطية شاملة</h4>
                    <p className="text-sm text-blue-700">
                      سيتم حفظ جميع بيانات التطبيق: إدارة التلاميذ، إدارة الأقسام، التقارير، الجدول الزمني للمقابلات، الاختبارات، التوصيات، تحليل النتائج، و الإعدادات
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم النسخة الاحتياطية
              </label>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: نسخة ديسمبر 2024"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveCompleteApplication}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ و تحميل</span>
              </button>
              <button
                onClick={() => setShowBackupModal(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;