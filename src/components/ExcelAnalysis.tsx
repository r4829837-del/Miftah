import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { extractStudents } from '../utils/excelReader';
import { analyseCollege } from '../utils/collegeAnalyse';
import { useCycle } from '../contexts/CycleContext';

interface ExcelAnalysisProps {
  onAnalysisComplete?: (report: any) => void;
}

const ExcelAnalysis: React.FC<ExcelAnalysisProps> = ({ onAnalysisComplete }) => {
  const { currentCycle } = useCycle();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Extract students from Excel file
      const students = await extractStudents(file);
      
      if (students.length === 0) {
        throw new Error('لم يتم العثور على بيانات صالحة في الملف');
      }

      // Analyze the data
      const report = analyseCollege(students);
      setAnalysisReport(report);
      setSuccess(`تم تحليل ${students.length} تلميذ بنجاح`);
      
      // Call callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(report);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الملف');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = (level: string) => {
    // Import the function dynamically to avoid SSR issues
    import('../utils/excelReader').then(({ downloadExcelTemplate }) => {
      downloadExcelTemplate(level);
    });
  };

  const downloadCustomTemplate = () => {
    // Import the custom template function dynamically
    import('../utils/customTemplate').then(({ downloadCustomTemplate }) => {
      downloadCustomTemplate();
    });
  };

  const levels = [
    { id: '1AF', label: 'السنة الأولى متوسط' },
    { id: '2AF', label: 'السنة الثانية متوسط' },
    { id: '3AF', label: 'السنة الثالثة متوسط' },
    { id: '4AF', label: 'السنة الرابعة متوسط' },
    { id: '5AF', label: 'السنة الأولى ثانوي' },
    { id: 'BEM', label: 'شهادة التعليم المتوسط' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">تحليل نتائج Excel</h2>
      </div>

      {/* Template Download Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">تحميل قوالب Excel</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => downloadTemplate(level.id)}
              className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-right"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{level.label}</span>
            </button>
          ))}
        </div>
        
        {/* Template personnalisé basé sur votre structure */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-md font-semibold text-blue-800 mb-2">قالب مخصص</h4>
          <p className="text-sm text-blue-700 mb-3">
            قالب مبني على هيكل البيانات الخاص بك مع دعم الحساب التلقائي للمعدلات
          </p>
          <button
            onClick={downloadCustomTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تحميل القالب المخصص</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          القوالب مُنسقة باللغة العربية من اليمين إلى اليسار
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">رفع ملف Excel للتحليل</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            انقر لرفع ملف Excel أو اسحب الملف هنا
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Upload className="w-4 h-4" />
            {isLoading ? 'جاري المعالجة...' : 'اختيار ملف'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

          {/* Analysis Results */}
          {analysisReport && (
            <div className="mt-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">نتائج التحليل</h3>
              
              {/* Basic Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisReport.totalEleves}</div>
                  <div className="text-sm text-blue-700">إجمالي {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisReport.moyenneGenerale}</div>
                  <div className="text-sm text-green-700">المعدل العام</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysisReport.tauxReussite}%</div>
                  <div className="text-sm text-purple-700">معدل النجاح</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysisReport.tauxRedoublement}%</div>
                  <div className="text-sm text-orange-700">معدل الإعادة</div>
                </div>
              </div>

              {/* Advanced Statistics */}
              {analysisReport.analyseGenerale && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">التحليل الإحصائي المتقدم</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">الانحراف المعياري</div>
                      <div className="text-lg font-bold">{analysisReport.analyseGenerale.ecartTypeGlobal}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">معامل التباين</div>
                      <div className="text-lg font-bold">{analysisReport.analyseGenerale.coefficientVariationGlobal}%</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-600">توزيع الدرجات</div>
                      <div className="text-xs space-y-1">
                        <div>أقل من 8: {analysisReport.analyseGenerale.distributionGenerale.moins8}</div>
                        <div>8-10: {analysisReport.analyseGenerale.distributionGenerale.entre8et10}</div>
                        <div>10+: {analysisReport.analyseGenerale.distributionGenerale.plus10}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Classification Qualitative */}
              {analysisReport.analyseGenerale?.classificationQualitativeGenerale && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-3">التصنيف النوعي</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-sm text-gray-600">إمتياز (≥18)</div>
                      <div className="text-lg font-bold text-green-600">{analysisReport.analyseGenerale.classificationQualitativeGenerale.eminence}</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-sm text-gray-600">تهنئة (15-18)</div>
                      <div className="text-lg font-bold text-blue-600">{analysisReport.analyseGenerale.classificationQualitativeGenerale.felicitation}</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-sm text-gray-600">تشجيع (14-15)</div>
                      <div className="text-lg font-bold text-purple-600">{analysisReport.analyseGenerale.classificationQualitativeGenerale.encouragement}</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-sm text-gray-600">لوحة شرف (12-14)</div>
                      <div className="text-lg font-bold text-orange-600">{analysisReport.analyseGenerale.classificationQualitativeGenerale.tableauHonneur}</div>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <div className="text-sm text-gray-600">{'ملاحظة (<12)'}</div>
                      <div className="text-lg font-bold text-red-600">{analysisReport.analyseGenerale.classificationQualitativeGenerale.observation}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Class Ranking */}
              {analysisReport.classementClasses && analysisReport.classementClasses.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">ترتيب الأقسام</h4>
                  <div className="space-y-2">
                    {analysisReport.classementClasses.map((classe: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                            {classe.rang}
                          </div>
                          <span className="font-medium">{classe.nom}</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">{classe.moyenne}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Analysis */}
              {analysisReport.matieres && analysisReport.matieres.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">تحليل المواد</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white">
                          <th className="p-2 text-right">المادة</th>
                          <th className="p-2 text-center">المعدل</th>
                          <th className="p-2 text-center">معدل النجاح</th>
                          <th className="p-2 text-center">الانحراف المعياري</th>
                          <th className="p-2 text-center">معامل التباين</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisReport.matieres.slice(0, 5).map((matiere: any, index: number) => (
                          <tr key={index} className="bg-white border-t">
                            <td className="p-2 font-medium">{matiere.nom}</td>
                            <td className="p-2 text-center">{matiere.moyenne}</td>
                            <td className="p-2 text-center">{matiere.tauxReussite}%</td>
                            <td className="p-2 text-center">{matiere.ecartType}</td>
                            <td className="p-2 text-center">{matiere.coefficientVariation}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysisReport.recommandations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">التوصيات</h4>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    {analysisReport.recommandations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
    </div>
  );
};

export default ExcelAnalysis;