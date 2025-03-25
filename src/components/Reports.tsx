import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Plus, 
  Save, 
  X, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Users,
  Target,
  Activity,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { getSettings, type AppSettings } from '../lib/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Générer les années scolaires (de l'année actuelle + 5 ans)
const generateAcademicYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 6; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    years.push(`${endYear}/${startYear}`);
  }
  // Add the specific year 2025/2024
  if (!years.includes('2025/2024')) {
    years.push('2025/2024');
  }
  // Sort years in ascending order
  return years.sort((a, b) => a.localeCompare(b));
};

const academicYears = generateAcademicYears();

const semesters = [
  'الفصل الأول',
  'الفصل الثاني',
  'الفصل الثالث'
];

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  content: any;
}

const reportTypes = [
  {
    id: 'info',
    title: 'تقرير عملية الإعلام',
    description: 'تقرير شامل عن عملية الإعلام والتوجيه للتلاميذ',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'parent_info',
    title: 'تقرير عملية إعلام الأولياء',
    description: 'تقرير عن جلسات الإعلام والتوجيه للأولياء',
    icon: UserPlus,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'academic',
    title: 'تقرير النتائج الدراسية',
    description: 'تحليل وتقييم النتائج الدراسية للتلاميذ',
    icon: GraduationCap,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'behavior',
    title: 'تقرير السلوك والانضباط',
    description: 'متابعة سلوك وانضباط التلاميذ',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'attendance',
    title: 'تقرير الحضور والغياب',
    description: 'متابعة حضور وغياب التلاميذ',
    icon: Users,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'objectives',
    title: 'تقرير الأهداف التربوية',
    description: 'متابعة تحقيق الأهداف التربوية',
    icon: Target,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'activities',
    title: 'تقرير النشاطات',
    description: 'تقرير عن النشاطات المدرسية والتربوية',
    icon: Activity,
    color: 'bg-indigo-100 text-indigo-600'
  }
];

interface CoverageRow {
  group: string;
  studentCount: number;
  date: string;
  coverage: number;
  objectives: string;
}

interface ParentCoverageRow {
  group: string;
  parentCount: number;
  date: string;
  coverage: number;
  topics: string;
}

const defaultGroups = [
  '1/1', '1/2', '1/3', '1/4',
  '2/1', '2/2', '2/3', '2/4',
  '3/1', '3/2', '3/3', '3/4',
  '4/1', '4/2', '4/3', '4/4'
];

export default function Reports() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showParentPreview, setShowParentPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportData, setReportData] = useState({
    school: '',
    counselor: '',
    academicYear: academicYears[0],
    level: 'السنة الأولى متوسط',
    semester: 'الفصل الأول',
    groupCount: 4,
    totalStudents: 0,
    subject: '',
    coverageRows: [] as CoverageRow[],
    observations: '',
    conclusions: ''
  });

  const [parentReportData, setParentReportData] = useState({
    school: '',
    counselor: '',
    academicYear: academicYears[0],
    level: 'السنة الأولى متوسط',
    semester: 'الفصل الأول',
    groupCount: 4,
    totalParents: 0,
    subject: '',
    coverageRows: [] as ParentCoverageRow[],
    observations: '',
    conclusions: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
    setReportData(prev => ({
      ...prev,
      school: loadedSettings.schoolName,
      counselor: loadedSettings.counselorName
    }));
    setParentReportData(prev => ({
      ...prev,
      school: loadedSettings.schoolName,
      counselor: loadedSettings.counselorName
    }));
  };

  useEffect(() => {
    const newRows: CoverageRow[] = [];
    for (let i = 0; i < reportData.groupCount; i++) {
      const existingRow = reportData.coverageRows[i];
      newRows.push(existingRow || {
        group: defaultGroups[i] || '',
        studentCount: 0,
        date: '',
        coverage: 0,
        objectives: ''
      });
    }
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));
  }, [reportData.groupCount]);

  useEffect(() => {
    const newRows: ParentCoverageRow[] = [];
    for (let i = 0; i < parentReportData.groupCount; i++) {
      const existingRow = parentReportData.coverageRows[i];
      newRows.push(existingRow || {
        group: defaultGroups[i] || '',
        parentCount: 0,
        date: '',
        coverage: 0,
        topics: ''
      });
    }
    setParentReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));
  }, [parentReportData.groupCount]);

  const handleCoverageRowChange = (index: number, field: keyof CoverageRow, value: any) => {
    const newRows = [...reportData.coverageRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));

    if (field === 'studentCount') {
      const total = newRows.reduce((sum, row) => sum + (row.studentCount || 0), 0);
      setReportData(prev => ({
        ...prev,
        totalStudents: total
      }));
    }
  };

  const handleParentCoverageRowChange = (index: number, field: keyof ParentCoverageRow, value: any) => {
    const newRows = [...parentReportData.coverageRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setParentReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));

    if (field === 'parentCount') {
      const total = newRows.reduce((sum, row) => sum + (row.parentCount || 0), 0);
      setParentReportData(prev => ({
        ...prev,
        totalParents: total
      }));
    }
  };

  const handleGeneratePDF = async (type: 'student' | 'parent') => {
    const contentId = type === 'student' ? 'report-preview' : 'parent-report-preview';
    const content = document.getElementById(contentId);
    if (!content) return;

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const data = type === 'student' ? reportData : parentReportData;
      const newReport: Report = {
        id: Date.now().toString(),
        title: `تقرير ${data.level} - ${data.semester}`,
        date: new Date().toLocaleDateString('ar-SA'),
        type: type === 'student' ? 'تقرير عملية الإعلام' : 'تقرير عملية إعلام الأولياء',
        content: data
      };

      setReports(prev => {
        const updated = [...prev, newReport];
        localStorage.setItem('reports', JSON.stringify(updated));
        return updated;
      });

      pdf.save(type === 'student' ? 'تقرير_التوجيه.pdf' : 'تقرير_إعلام_الأولياء.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const getTotalStudentCount = () => {
    return reportData.coverageRows.reduce((sum, row) => sum + (row.studentCount || 0), 0);
  };

  const getTotalParentCount = () => {
    return parentReportData.coverageRows.reduce((sum, row) => sum + (row.parentCount || 0), 0);
  };

  const calculateTotalCoverage = (type: 'student' | 'parent') => {
    if (type === 'student') {
      const totalStudents = getTotalStudentCount();
      if (totalStudents === 0) return 0;
      
      const coveredStudents = reportData.coverageRows.reduce((sum, row) => {
        return sum + (row.studentCount * (row.coverage / 100));
      }, 0);
      
      return Math.round((coveredStudents / totalStudents) * 100);
    } else {
      const totalParents = getTotalParentCount();
      if (totalParents === 0) return 0;
      
      const coveredParents = parentReportData.coverageRows.reduce((sum, row) => {
        return sum + (row.parentCount * (row.coverage / 100));
      }, 0);
      
      return Math.round((coveredParents / totalParents) * 100);
    }
  };

  const handleReportTypeClick = (type: string) => {
    if (type === 'info') {
      setShowPreview(true);
    } else if (type === 'parent_info') {
      setShowParentPreview(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Report Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div id="report-preview" className="bg-white p-4 rounded-lg space-y-2 text-lg">
              <div className="text-center font-bold text-2xl mb-8">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>

              <div className="flex justify-between mb-2 text-lg">
                <div className="font-bold">مديرية التربية لولاية مستغانم</div>
                <div className="font-bold">مركز التوجيه و الإرشاد المدرسي و المهني</div>
              </div>

              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="underline ml-2 font-semibold">متوسطة</span>
                    <span className="mx-2">:</span>
                    <span className="text-lg">{settings?.schoolName || ''}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="underline ml-2 font-semibold">السنة الدراسية</span>
                    <span className="mx-2">:</span>
                    <select
                      value={reportData.academicYear}
                      onChange={(e) => setReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 w-32 text-center text-lg bg-transparent"
                      dir="rtl"
                    >
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="underline ml-2 font-semibold">مستشار التوجيه</span>
                  <span className="mx-2">:</span>
                  <span className="text-lg">{settings?.counselorName || ''}</span>
                </div>
              </div>

              <div className="text-center my-4">
                <div className="text-2xl font-bold underline mb-1">تقرير عملية الإعلام</div>
                <div className="text-xl">
                  <select
                    value={reportData.semester}
                    onChange={(e) => setReportData(prev => ({ ...prev, semester: e.target.value }))}
                    className="bg-transparent border-none outline-none text-center text-xl"
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>({semester})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">المستوى</span>
                  <span className="mx-2">:</span>
                  <div className="relative inline-block min-w-[150px] text-center">
                    <select
                      value={reportData.level}
                      onChange={(e) => setReportData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full border-b border-gray-300 focus:border-blue-500 outline-none px-2 py-1 bg-transparent appearance-none text-lg text-center"
                      dir="rtl"
                    >
                      {settings?.levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">التعداد الإجمالي في المستوى:</div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <tbody>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">عدد الأفواج</td>
                        <td className="border-2 border-gray-700 p-2 w-28">
                          <input
                            type="number"
                            min="1"
                            max="16"
                            value={reportData.groupCount}
                            onChange={(e) => setReportData(prev => ({ 
                              ...prev, 
                              groupCount: Math.max(1, Math.min(parseInt(e.target.value) || 1, 16))
                            }))}
                            className="w-full text-center outline-none text-lg"
                            dir="rtl"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">عدد التلاميذ</td>
                        <td className="border-2 border-gray-700 p-2 text-center" dir="rtl">
                          {reportData.totalStudents}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">الموضوع</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={reportData.subject}
                    onChange={(e) => setReportData(prev => ({ ...prev, subject: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[300px] text-center text-lg text-right"
                    dir="rtl"
                    placeholder="أدخل موضوع التقرير"
                  />
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">التغطية الإعلامية:</div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-2 border-gray-700 p-2 text-center">الأفواج</th>
                        <th className="border-2 border-gray-700 p-2 text-center">تعداد التلاميذ</th>
                        <th className="border-2 border-gray-700 p-2 text-center">تاريخ التدخل</th>
                        <th className="border-2 border-gray-700 p-2 text-center">نسبة التغطية</th>
                        <th className="border-2 border-gray-700 p-2 text-center">الأهداف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.coverageRows.map((row, index) => (
                        <tr key={index}>
                          <td className="border-2 border-gray-700 p-2">
                            <select
                              value={row.group}
                              onChange={(e) => handleCoverageRowChange(index, 'group', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            >
                              <option value="">اختر الفوج</option>
                              {defaultGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                              ))}
                            </select>
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="number"
                              min="0"
                              value={row.studentCount}
                              onChange={(e) => handleCoverageRowChange(index, 'studentCount', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleCoverageRowChange(index, 'date', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.coverage}
                              onChange={(e) => handleCoverageRowChange(index, 'coverage', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                          <td className="border-r-2 border-l-2 border-gray-700 p-2">
                            <input
                              type="text"
                              value={row.objectives}
                              onChange={(e) => handleCoverageRowChange(index, 'objectives', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td className="border-2 border-gray-700 p-2 text-center">مج</td>
                        <td className="border-2 border-gray-700 p-2 text-center">{getTotalStudentCount()}</td>
                        <td className="border-2 border-gray-700 p-2 text-center">-</td>
                        <td className="border-2 border-gray-700 p-2 text-center">{calculateTotalCoverage('student')}%</td>
                        <td className="border-r-2 border-l-2 border-gray-700 p-2 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">الملاحظات المستخلصة:</div>
                  <textarea
                    value={reportData.conclusions}
                    onChange={(e) => setReportData(prev => ({ ...prev, conclusions: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-700 rounded-lg text-lg text-right"
                    rows={4}
                    dir="rtl"
                    placeholder="أدخل الملاحظات المستخلصة من عملية الإعلام"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">مستشار التوجيه و الإرشاد م.م</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">مدير المتوسطة</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleGeneratePDF('student')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كـ PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parent Report Preview Modal */}
      {showParentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowParentPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div id="parent-report-preview" className="bg-white p-4 rounded-lg space-y-2 text-lg">
              <div className="text-center font-bold text-2xl mb-8">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>

              <div className="flex justify-between mb-2 text-lg">
                <div className="font-bold">مديرية التربية لولاية مستغانم</div>
                <div className="font-bold">مركز التوجيه و الإرشاد المدرسي و المهني</div>
              </div>

              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="underline ml-2 font-semibold">متوسطة</span>
                    <span className="mx-2">:</span>
                    <span className="text-lg">{settings?.schoolName || ''}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="underline ml-2 font-semibold">السنة الدراسية</span>
                    <span className="mx-2">:</span>
                    <select
                      value={parentReportData.academicYear}
                      onChange={(e) => setParentReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 w-32 text-center text-lg bg-transparent"
                      dir="rtl"
                    >
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="underline ml-2 font-semibold">مستشار التوجيه</span>
                  <span className="mx-2">:</span>
                  <span className="text-lg">{settings?.counselorName || ''}</span>
                </div>
              </div>

              <div className="text-center my-4">
                <div className="text-2xl font-bold underline mb-1">تقرير عملية إعلام الأولياء</div>
                <div className="text-xl">
                  <select
                    value={parentReportData.semester}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, semester: e.target.value }))}
                    className="bg-transparent border-none outline-none text-center text-xl"
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>({semester})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">المستوى</span>
                  <span className="mx-2">:</span>
                  <div className="relative inline-block min-w-[150px] text-center">
                    <select
                      value={parentReportData.level}
                      onChange={(e) => setParentReportData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full border-b border-gray-300 focus:border-blue-500 outline-none px-2 py-1 bg-transparent appearance-none text-lg text-center"
                      dir="rtl"
                    >
                      {settings?.levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">التعداد الإجمالي للأولياء في المستوى:</div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <tbody>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">عدد الأفواج</td>
                        <td className="border-2 border-gray-700 p-2 w-28">
                          <input
                            type="number"
                            min="1"
                            max="16"
                            value={parentReportData.groupCount}
                            onChange={(e) => setParentReportData(prev => ({ 
                              ...prev, 
                              groupCount: Math.max(1, Math.min(parseInt(e.target.value) || 1, 16))
                            }))}
                            className="w-full text-center outline-none text-lg"
                            dir="rtl"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">عدد الأولياء</td>
                        <td className="border-2 border-gray-700 p-2 text-center" dir="rtl">
                          {parentReportData.totalParents}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">الموضوع</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={parentReportData.subject}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, subject: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[300px] text-center text-lg text-right"
                    dir="rtl"
                    placeholder="أدخل موضوع التقرير"
                  />
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">التغطية الإعلامية للأولياء:</div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-2 border-gray-700 p-2 text-center">الأفواج</th>
                        <th className="border-2 border-gray-700 p-2 text-center">عدد الأولياء</th>
                        <th className="border-2 border-gray-700 p-2 text-center">تاريخ اللقاء</th>
                        <th className="border-2 border-gray-700 p-2 text-center">نسبة الحضور</th>
                        <th className="border-2 border-gray-700 p-2 text-center">المواضيع المعالجة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentReportData.coverageRows.map((row, index) => (
                        <tr key={index}>
                          <td className="border-2 border-gray-700 p-2">
                            <select
                              value={row.group}
                              onChange={(e) => handleParentCoverageRowChange(index, 'group', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            >
                              <option value="">اختر الفوج</option>
                              {defaultGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                              ))}
                            </select>
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="number"
                              min="0"
                              value={row.parentCount}
                              onChange={(e) => handleParentCoverageRowChange(index, 'parentCount', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleParentCoverageRowChange(index, 'date', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.coverage}
                              onChange={(e) => handleParentCoverageRowChange(index, 'coverage', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                          <td className="border-r-2 border-l-2 border-gray-700 p-2">
                            <input
                              type="text"
                              value={row.topics}
                              onChange={(e) => handleParentCoverageRowChange(index, 'topics', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td className="border-2 border-gray-700 p-2 text-center">مج</td>
                        <td className="border-2 border-gray-700 p-2 text-center">{getTotalParentCount()}</td>
                        <td className="border-2 border-gray-700 p-2 text-center">-</td>
                        <td className="border-2 border-gray-700 p-2 text-center">{calculateTotalCoverage('parent')}%</td>
                        <td className="border-r-2 border-l-2 border-gray-700 p-2 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">الملاحظات المستخلصة:</div>
                  <textarea
                    value={parentReportData.conclusions}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, conclusions: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-700 rounded-lg text-lg text-right"
                    rows={4}
                    dir="rtl"
                    placeholder="أدخل الملاحظات المستخلصة من لقاءات الأولياء"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">مستشار التوجيه و الإرشاد م.م</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">مدير المتوسطة</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowParentPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleGeneratePDF('parent')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كـ PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">إدارة التقارير</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => (
          <div key={type.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${type.color}`}>
                <type.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">{type.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{type.description}</p>
            <button
              onClick={() => handleReportTypeClick(type.id)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>إنشاء التقرير</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}