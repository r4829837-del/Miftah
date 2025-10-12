import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Calendar,
  FileText,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { exportDatabase, importDatabase } from '../lib/storage';

interface CycleBackupManagerProps {
  onClose: () => void;
}

interface BackupInfo {
  cycle: string;
  timestamp: string;
  size: string;
  studentsCount: number;
  testsCount: number;
  reportsCount: number;
}

const CycleBackupManager: React.FC<CycleBackupManagerProps> = ({ onClose }) => {
  const { currentCycle, getCycleConfig, getAvailableCycles } = useCycle();
  const [selectedCycle, setSelectedCycle] = useState(currentCycle);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    loadBackupInfo();
  }, [selectedCycle]);

  const loadBackupInfo = async () => {
    try {
      const data = await exportDatabase(selectedCycle);
      const size = new Blob([JSON.stringify(data)]).size;
      const sizeInMB = (size / (1024 * 1024)).toFixed(2);
      
      setBackupInfo({
        cycle: selectedCycle,
        timestamp: new Date().toISOString(),
        size: `${sizeInMB} MB`,
        studentsCount: data.students.length,
        testsCount: data.tests.length,
        reportsCount: data.reports.length
      });
    } catch (error) {
      console.error('Error loading backup info:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportDatabase(selectedCycle);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appamine_backup_${selectedCycle}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      await loadBackupInfo();
    } catch (error) {
      console.error('Error exporting database:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Vérifier que le fichier est compatible
      if (!data.cycle || !data.students || !data.settings) {
        throw new Error('ملف غير صالح أو غير متوافق');
      }

      // Demander confirmation si le cycle ne correspond pas
      if (data.cycle !== selectedCycle) {
        const confirmImport = window.confirm(
          `هذا الملف مخصص لدورة ${data.cycle}. هل تريد استيراده في دورة ${selectedCycle}؟`
        );
        if (!confirmImport) {
          setIsImporting(false);
          return;
        }
      }

      await importDatabase(data, selectedCycle);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      await loadBackupInfo();
    } catch (error) {
      console.error('Error importing database:', error);
      setImportError(error instanceof Error ? error.message : 'خطأ في استيراد البيانات');
    } finally {
      setIsImporting(false);
      if (fileInputRef) {
        fileInputRef.value = '';
      }
    }
  };

  const handleClearData = async () => {
    const confirmClear = window.confirm(
      `هل أنت متأكد من حذف جميع بيانات دورة ${selectedCycle}؟ هذا الإجراء لا يمكن التراجع عنه.`
    );
    
    if (confirmClear) {
      try {
        // Créer un objet vide pour effacer les données
        const emptyData = {
          cycle: selectedCycle,
          students: [],
          users: [],
          settings: null,
          tests: [],
          testResults: [],
          grades: [],
          reports: [],
          goals: [],
          news: [],
          intervention: [],
          counselor: [],
          schedule: [],
          analysis: [],
          recommendations: []
        };
        
        await importDatabase(emptyData, selectedCycle);
        await loadBackupInfo();
        alert('تم حذف جميع البيانات بنجاح');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('حدث خطأ أثناء حذف البيانات');
      }
    }
  };

  const cycles = getAvailableCycles();
  const currentCycleConfig = getCycleConfig(selectedCycle as 'متوسط' | 'ثانوي');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">إدارة النسخ الاحتياطية</h2>
                <p className="text-green-100">حفظ واستعادة البيانات حسب الدورة التعليمية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Cycle Selection */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اختر الدورة</h3>
            <div className="space-y-2">
              {cycles.map((cycle) => (
                <button
                  key={cycle.name}
                  onClick={() => setSelectedCycle(cycle.name as 'متوسط' | 'ثانوي')}
                  className={`w-full p-3 rounded-lg text-right transition-all ${
                    selectedCycle === cycle.name
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {cycle.name === 'متوسط' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                    <div>
                      <div className="font-medium">{cycle.title}</div>
                      <div className="text-sm text-gray-500">{cycle.schoolName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Success Messages */}
            {exportSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                تم تصدير البيانات بنجاح
              </div>
            )}

            {importSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                تم استيراد البيانات بنجاح
              </div>
            )}

            {importError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {importError}
              </div>
            )}

            {/* Current Cycle Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                معلومات الدورة الحالية: {currentCycleConfig.title}
              </h3>
              
              {backupInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{backupInfo.studentsCount}</div>
                    <div className="text-sm text-blue-800">الطلاب</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{backupInfo.testsCount}</div>
                    <div className="text-sm text-green-800">الاختبارات</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{backupInfo.reportsCount}</div>
                    <div className="text-sm text-purple-800">التقارير</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{backupInfo.size}</div>
                    <div className="text-sm text-orange-800">حجم البيانات</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">جاري تحميل المعلومات...</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  تصدير البيانات
                </h3>
                <p className="text-gray-600 mb-4">
                  قم بإنشاء نسخة احتياطية من جميع بيانات دورة {currentCycleConfig.title}
                </p>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      جاري التصدير...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      تصدير البيانات
                    </>
                  )}
                </button>
              </div>

              {/* Import Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  استيراد البيانات
                </h3>
                <p className="text-gray-600 mb-4">
                  استرجع البيانات من ملف نسخة احتياطية
                </p>
                <input
                  ref={setFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef?.click()}
                  disabled={isImporting}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      استيراد البيانات
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                منطقة الخطر
              </h3>
              <p className="text-red-600 mb-4">
                احذف جميع بيانات دورة {currentCycleConfig.title}. هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                حذف جميع البيانات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleBackupManager;