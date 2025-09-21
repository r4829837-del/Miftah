import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  FileText, 
  Shield,
  RefreshCw
} from 'lucide-react';
import { databaseService } from '../services/databaseService';

interface DatabaseInfo {
  students: number;
  users: number;
  tests: number;
  testResults: number;
  lastBackup?: string;
  totalSize?: string;
}

const DatabaseManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getDatabaseInfo = async () => {
    try {
      setIsLoading(true);
      const stats = await databaseService.getDatabaseStats();
      
      const info: DatabaseInfo = {
        students: stats.students,
        users: stats.users,
        tests: stats.tests,
        testResults: stats.testResults,
        lastBackup: stats.lastBackup,
        totalSize: stats.totalSize
      };
      
      setDatabaseInfo(info);
      
    } catch (error) {
      console.error('Error getting database info:', error);
      showMessage('error', 'حدث خطأ أثناء جلب معلومات قاعدة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDatabaseToPicker = async () => {
    try {
      setIsExporting(true);
      await databaseService.downloadBackupToPicker();
      showMessage('success', 'تم تصدير قاعدة البيانات إلى الموقع الذي اخترته');
      await getDatabaseInfo();
    } catch (error) {
      console.error('Error exporting database with picker:', error);
      showMessage('error', 'حدث خطأ أثناء التصدير إلى الموقع المحدد');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        'تحذير: استيراد قاعدة البيانات سيستبدل جميع البيانات الحالية. هل أنت متأكد من المتابعة؟'
      );
      
      if (!confirmed) {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      await databaseService.uploadAndImportBackup(file);
      showMessage('success', 'تم استيراد قاعدة البيانات بنجاح');
      await getDatabaseInfo();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing database:', error);
      showMessage('error', 'حدث خطأ أثناء استيراد قاعدة البيانات');
    } finally {
      setIsImporting(false);
    }
  };



  React.useEffect(() => {
    getDatabaseInfo();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">إدارة قاعدة البيانات</h2>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' :
          message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' :
          'bg-blue-100 text-blue-700 border border-blue-400'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {message.type === 'info' && <Info className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Database Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">معلومات قاعدة البيانات</h3>
          <button
            onClick={getDatabaseInfo}
            disabled={isLoading}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
        
        {databaseInfo ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{databaseInfo.students}</div>
                <div className="text-sm text-gray-600">الطلاب</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{databaseInfo.users}</div>
                <div className="text-sm text-gray-600">المستخدمين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{databaseInfo.tests}</div>
                <div className="text-sm text-gray-600">الاختبارات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{databaseInfo.testResults}</div>
                <div className="text-sm text-gray-600">نتائج الاختبارات</div>
              </div>
            </div>
            {databaseInfo.totalSize && (
              <div className="mt-4 text-center text-sm text-gray-600">
                الحجم الإجمالي: {databaseInfo.totalSize}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500">
            {isLoading ? 'جاري تحميل المعلومات...' : 'لا توجد معلومات متاحة'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Export Database */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">تصدير قاعدة البيانات</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            احفظ نسخة احتياطية من جميع البيانات المحلية
          </p>
          <button
            onClick={handleExportDatabaseToPicker}
            disabled={isExporting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            title="اختر مجلد الحفظ"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التصدير...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>تصدير</span>
              </>
            )}
          </button>
        </div>

        {/* Import Database */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold">استيراد قاعدة البيانات</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            استورد بيانات من ملف JSON محفوظ مسبقاً
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportDatabase}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري الاستيراد...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>استيراد</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-blue-800">معلومات الأمان</h4>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• جميع البيانات محفوظة محلياً على جهازك فقط</p>
          <p>• لا يتم إرسال أي بيانات إلى خوادم خارجية</p>
          <p>• احرص على عمل نسخ احتياطية منتظمة من قاعدة البيانات</p>
          <p>• يمكنك نقل قاعدة البيانات بين الأجهزة عبر ملفات JSON</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager; 