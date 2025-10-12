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
  Clock, 
  Shield,
  RefreshCw,
  Trash2,
  Settings,
  History,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { databaseService } from '../services/databaseService';
import * as XLSX from 'xlsx';
import { bulkUpsertStudents, bulkUpsertGrades, type ImportedStudentRow, type ImportedGradeRow } from '../lib/storage';

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
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showAutoBackups, setShowAutoBackups] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [availableAutoBackups, setAvailableAutoBackups] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importStudentsRef = useRef<HTMLInputElement>(null);
  const importGradesRef = useRef<HTMLInputElement>(null);

  // Download template functions
  const downloadTemplate = (filename: string, contentType: string) => {
    const link = document.createElement('a');
    link.href = `/templates/${filename}`;
    link.download = filename;
    link.click();
  };

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
      
      // Get auto-backup status
      setAutoBackupEnabled(databaseService.isAutoBackupEnabled());
      setAvailableAutoBackups(databaseService.getAvailableAutoBackups());
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

  // Import Students (profiling) from CSV/Excel/JSON
  const handleImportStudents = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      const rows: ImportedStudentRow[] = await parseTabularFile<ImportedStudentRow>(file);
      await bulkUpsertStudents(rows);
      showMessage('success', 'تم استيراد قائمة التلاميذ بنجاح');
      await getDatabaseInfo();
    } catch (error) {
      console.error('Error importing students:', error);
      showMessage('error', 'فشل استيراد قائمة التلاميذ. تأكد من تنسيق الملف');
    } finally {
      setIsImporting(false);
      if (importStudentsRef.current) importStudentsRef.current.value = '';
    }
  };

  // Import Grades for semesters and subjects
  const handleImportGrades = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      const rows: ImportedGradeRow[] = await parseTabularFile<ImportedGradeRow>(file);
      await bulkUpsertGrades(rows);
      showMessage('success', 'تم استيراد قائمة الأعداد بنجاح');
      await getDatabaseInfo();
    } catch (error) {
      console.error('Error importing grades:', error);
      showMessage('error', 'فشل استيراد قائمة الأعداد. تأكد من تنسيق الملف');
    } finally {
      setIsImporting(false);
      if (importGradesRef.current) importGradesRef.current.value = '';
    }
  };

  // Generic parser for CSV/XLSX/JSON
  const parseTabularFile = async <T,>(file: File): Promise<T[]> => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      return Array.isArray(data) ? data as T[] : [];
    }
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    return json as T[];
  };

  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      'تحذير: هذا الإجراء سيحذف جميع البيانات من قاعدة البيانات المحلية. هل أنت متأكد من المتابعة؟'
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      
      // Import localforage and storage functions
      const localforage = await import('localforage');
      
      // Create database instances
      const studentsDB = localforage.default.createInstance({
        name: 'schoolManagement',
        storeName: 'students'
      });
      
      const usersDB = localforage.default.createInstance({
        name: 'schoolManagement',
        storeName: 'users'
      });
      
      const settingsDB = localforage.default.createInstance({
        name: 'schoolManagement',
        storeName: 'settings'
      });
      
      const testsDB = localforage.default.createInstance({
        name: 'schoolManagement',
        storeName: 'tests'
      });
      
      const testResultsDB = localforage.default.createInstance({
        name: 'schoolManagement',
        storeName: 'testResults'
      });
      
      // Clear all databases
      const clearPromises = [
        studentsDB.clear(),
        usersDB.clear(),
        settingsDB.clear(),
        testsDB.clear(),
        testResultsDB.clear()
      ];

      await Promise.all(clearPromises);
      
      // Clear localStorage
      localStorage.removeItem('appSettings');
      localStorage.removeItem('autoBackupEnabled');
      localStorage.removeItem('lastBackupInfo');
      
      // Clear auto-backup keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('autoBackup_') || key.startsWith('initialBackup') || key.startsWith('preImportBackup')) {
          localStorage.removeItem(key);
        }
      });
      
      // Verify that databases are actually cleared
      const verifyPromises = [
        studentsDB.keys().then(keys => keys.length),
        usersDB.keys().then(keys => keys.length),
        settingsDB.keys().then(keys => keys.length),
        testsDB.keys().then(keys => keys.length),
        testResultsDB.keys().then(keys => keys.length)
      ];
      
      const results = await Promise.all(verifyPromises);
      const totalItems = results.reduce((sum, count) => sum + count, 0);
      
      if (totalItems > 0) {
        throw new Error('Some data could not be cleared');
      }
      
      showMessage('success', 'تم مسح قاعدة البيانات بنجاح');
      setDatabaseInfo(null);
      
      // Reload the page to reinitialize default data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error clearing database:', error);
      showMessage('error', 'حدث خطأ أثناء مسح قاعدة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoBackup = () => {
    const newState = !autoBackupEnabled;
    setAutoBackupEnabled(newState);
    databaseService.setAutoBackup(newState);
    showMessage('success', `تم ${newState ? 'تفعيل' : 'إلغاء'} النسخ الاحتياطي التلقائي`);
  };

  const handleRestoreFromAutoBackup = async (date: string) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من استعادة قاعدة البيانات من النسخة الاحتياطية بتاريخ ${date}؟`
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await databaseService.restoreFromAutoBackup(date);
      showMessage('success', 'تم استعادة قاعدة البيانات بنجاح');
      await getDatabaseInfo();
    } catch (error) {
      console.error('Error restoring from auto-backup:', error);
      showMessage('error', 'حدث خطأ أثناء استعادة قاعدة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getDatabaseInfo();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">إدارة قاعدة البيانات المحلية</h2>
      </div>

      {/* Import Students and Grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold">استيراد قائمة التلاميذ</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            يدعم CSV / Excel / JSON. الأعمدة المطلوبة: studentId, firstName, lastName, level, group. أعمدة اختيارية: birthDate, gender, address, parentName, parentPhone, parentEmail
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => downloadTemplate('students_template.csv', 'text/csv')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>تحميل قالب CSV</span>
            </button>
            <button
              onClick={() => downloadTemplate('README_import.md', 'text/markdown')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>دليل الاستخدام</span>
            </button>
          </div>
          <input
            type="file"
            ref={importStudentsRef}
            onChange={handleImportStudents}
            accept=".csv,.xlsx,.xls,.json"
            className="hidden"
          />
          <button
            onClick={() => importStudentsRef.current?.click()}
            disabled={isImporting}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري الاستيراد...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>استيراد التلاميذ</span>
              </>
            )}
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold">استيراد الأعداد (الفصول)</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            يدعم CSV / Excel / JSON. الأعمدة المطلوبة: studentId, semester (الفصل الأول/الثاني/الثالث), subject, score
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => downloadTemplate('grades_template.csv', 'text/csv')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>تحميل قالب CSV</span>
            </button>
            <button
              onClick={() => downloadTemplate('README_import.md', 'text/markdown')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              <span>دليل الاستخدام</span>
            </button>
          </div>
          <input
            type="file"
            ref={importGradesRef}
            onChange={handleImportGrades}
            accept=".csv,.xlsx,.xls,.json"
            className="hidden"
          />
          <button
            onClick={() => importGradesRef.current?.click()}
            disabled={isImporting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري الاستيراد...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>استيراد الأعداد</span>
              </>
            )}
          </button>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Export Database */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">تصدير قاعدة البيانات</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            احفظ نسخة احتياطية من جميع البيانات المحلية
          </p>
          <div className="grid grid-cols-1 gap-2">
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

        {/* Clear Database */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold">مسح قاعدة البيانات</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            احذف جميع البيانات المحلية (تحذير: لا يمكن التراجع)
          </p>
          <button
            onClick={handleClearDatabase}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح</span>
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

      {/* Advanced Settings */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-700">الإعدادات المتقدمة</h4>
          </div>
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="text-blue-500 hover:text-blue-600"
          >
            {showAdvancedSettings ? 'إخفاء' : 'عرض'}
          </button>
        </div>
        
        {showAdvancedSettings && (
          <div className="space-y-4">
            {/* Auto Backup Settings */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium">النسخ الاحتياطي التلقائي</h5>
                <p className="text-sm text-gray-600">إنشاء نسخ احتياطية تلقائية كل 30 دقيقة</p>
              </div>
              <button
                onClick={handleToggleAutoBackup}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
              >
                {autoBackupEnabled ? (
                  <>
                    <span>مفعل</span>
                    <ToggleRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>غير مفعل</span>
                    <ToggleLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Auto Backups History */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium">النسخ الاحتياطية التلقائية</h5>
                <p className="text-sm text-gray-600">عرض واستعادة النسخ الاحتياطية التلقائية</p>
              </div>
              <button
                onClick={() => setShowAutoBackups(!showAutoBackups)}
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <History className="w-4 h-4" />
                <span>{showAutoBackups ? 'إخفاء' : 'عرض'}</span>
              </button>
            </div>

            {showAutoBackups && availableAutoBackups.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h6 className="font-medium mb-3">النسخ الاحتياطية المتاحة:</h6>
                <div className="space-y-2">
                  {availableAutoBackups.map((date) => (
                    <div key={date} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{date}</span>
                      <button
                        onClick={() => handleRestoreFromAutoBackup(date)}
                        disabled={isLoading}
                        className="text-green-500 hover:text-green-600 text-sm px-2 py-1 rounded border border-green-300 hover:bg-green-50"
                      >
                        استعادة
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAutoBackups && availableAutoBackups.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">لا توجد نسخ احتياطية تلقائية متاحة</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-gray-500" />
          <h4 className="font-semibold text-gray-700">تعليمات الاستخدام</h4>
        </div>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>للعمل اليومي:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mr-4">
            <li>قم بتصدير قاعدة البيانات في نهاية كل يوم عمل</li>
            <li>احفظ الملف في مجلد آمن على جهازك</li>
            <li>عند بدء العمل، استورد قاعدة البيانات المحفوظة</li>
            <li>أنجز مهامك اليومية</li>
            <li>قم بتصدير قاعدة البيانات مرة أخرى قبل الخروج</li>
          </ol>
          <p className="mt-4"><strong>ميزات الأمان:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>تفعيل النسخ الاحتياطي التلقائي للحماية من فقدان البيانات</li>
            <li>التحقق من سلامة الملفات قبل الاستيراد</li>
            <li>إنشاء نسخ احتياطية قبل كل عملية استيراد</li>
            <li>تشفير البيانات محلياً على جهازك</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager; 