import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Search, Pencil, Trash2, Eye, ArrowRight, Save, Upload, AlertCircle, AlertTriangle, CheckSquare, Square } from 'lucide-react';
import * as XLSX from 'xlsx';
import StudentForm from './StudentForm';
import { getStudents, Student, deleteStudent, getSettings, AppSettings, getStudent, updateStudent, formatDate, addStudent, getStudentsDB } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';

// Helper function to check if a grade value is valid and not empty
const hasValidGrade = (grade: any): boolean => {
  if (grade === undefined || grade === null || grade === '') {
    return false;
  }
  const numGrade = parseFloat(grade);
  return !isNaN(numGrade) && numGrade > 0;
};

// Helper function to format date as YYYY/MM/DD
const formatBirthDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Handle Excel serial date format (e.g., "40025/01/01" or just "40025")
  const excelSerialMatch = dateString.match(/^(\d+)(?:\/01\/01)?$/);
  if (excelSerialMatch) {
    const serialNumber = parseInt(excelSerialMatch[1]);
    if (serialNumber > 25569) { // Excel date serial number (days since 1900-01-01)
      // Convert Excel serial date to JavaScript Date
      const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
      const date = new Date(excelEpoch.getTime() + (serialNumber - 2) * 24 * 60 * 60 * 1000);
      
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      }
    }
  }
  
  // Handle different input formats
  if (dateString.includes('/')) {
    // Check if it's a valid date format
    const date = new Date(dateString);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
      return dateString;
    }
  } else if (dateString.includes('-')) {
    // Convert from YYYY-MM-DD to YYYY/MM/DD
    return dateString.replace(/-/g, '/');
  } else {
    // Try to parse as Date and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Format as YYYY/MM/DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  }
  
  return dateString; // Return original if no valid format found
};

function ViewStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCycle } = useCycle();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (id) {
      loadStudent(id);
    }
  }, [id]);

  const loadStudent = async (studentId: string) => {
    const loadedStudent = await getStudent(studentId);
    setStudent(loadedStudent);
  };

  if (!student) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/students')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">
          معلومات {currentCycle === 'ثانوي' ? 'الطالب' : 'التلميذ'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
          <h3 className="text-lg font-semibold mb-4">المعلومات الشخصية</h3>
          <div className="space-y-3">
            <p><strong>رقم التعريف:</strong> {student.studentId}</p>
            <p><strong>الاسم:</strong> {student.firstName}</p>
            <p><strong>اللقب:</strong> {student.lastName}</p>
            <p><strong>تاريخ الميلاد:</strong> {formatDate(student.birthDate)}</p>
            <p><strong>الجنس:</strong> {student.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
            <p><strong>العنوان:</strong> {student.address}</p>
          </div>
          </div>

          <div>
          <h3 className="text-lg font-semibold mb-4">المعلومات الدراسية</h3>
          <div className="space-y-3">
            <p><strong>المستوى:</strong> {student.level}</p>
            <p><strong>الفوج:</strong> {student.group}</p>
            <p><strong>معيد:</strong> {student.isRepeating ? 'نعم' : 'لا'}</p>
            {student.lastTestDate && (
              <>
                <p><strong>آخر اختبار:</strong> {formatDate(student.lastTestDate)}</p>
                <p><strong>النتيجة:</strong> {student.lastTestScore}%</p>
              </>
            )}
          </div>
          </div>

          <div>
          <h3 className="text-lg font-semibold mb-4">معلومات الولي</h3>
          <div className="space-y-3">
            <p><strong>اسم الولي:</strong> {student.parentName}</p>
            <p><strong>الهاتف:</strong> {student.parentPhone}</p>
            <p><strong>البريد الإلكتروني:</strong> {student.parentEmail}</p>
          </div>
        </div>

          <div>
          <h3 className="text-lg font-semibold mb-4">الحالة الصحية</h3>
          <div className="space-y-3">
            <p><strong>الحالة الصحية:</strong> {student.healthStatus || 'لا توجد معلومات'}</p>
            <p><strong>احتياجات خاصة:</strong> {student.specialNeeds || 'لا توجد'}</p>
          </div>
          </div>

          <div>
          <h3 className="text-lg font-semibold mb-4">الحالة الاجتماعية</h3>
          <div className="space-y-3">
            <p><strong>الحالة الاجتماعية:</strong> {student.socialStatus || 'لا توجد معلومات'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => navigate(`/students/edit/${student.id}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          تعديل
        </button>
        </div>
    </div>
  );
}

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCycle } = useCycle();
  const [student, setStudent] = useState<Student | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    schoolName: '',
    counselorName: '',
    highSchoolName: '',
    highSchoolAddress: '',
    levels: [],
    groups: [],
    semesters: [],
    timezone: 'Africa/Tunis',
    enabledSections: {
      general: true,
      notifications: true,
      security: true,
      profile: true,
      school: true,
      highschool: true,
      levels: true,
      groups: true,
      semesters: true
    }
  });

  useEffect(() => {
    if (id) {
      loadStudent(id);
      loadSettings();
    }
  }, [id]);

  const loadStudent = async (studentId: string) => {
    const loadedStudent = await getStudent(studentId);
    setStudent(loadedStudent);
  };

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (student && id) {
    try {
        await updateStudent(id, student);
      navigate('/students');
    } catch (error) {
      console.error('Error updating student:', error);
      }
    }
  };

  if (!student) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/students')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">
          تعديل معلومات {currentCycle === 'ثانوي' ? 'الطالب' : 'التلميذ'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم التعريف
            </label>
            <input
              type="text"
              value={student.studentId}
              onChange={(e) => setStudent({ ...student, studentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم
            </label>
            <input
              type="text"
              value={student.firstName}
              onChange={(e) => setStudent({ ...student, firstName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اللقب
            </label>
            <input
              type="text"
              value={student.lastName}
              onChange={(e) => setStudent({ ...student, lastName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستوى
            </label>
            <select
              value={student.level}
              onChange={(e) => setStudent({ ...student, level: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">اختر المستوى</option>
              {settings.levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفوج
            </label>
            <select
              value={student.group}
              onChange={(e) => setStudent({ ...student, group: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">اختر الفوج</option>
              {settings.groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              معيد
            </label>
            <select
              value={student.isRepeating.toString()}
              onChange={(e) => setStudent({ ...student, isRepeating: e.target.value === 'true' })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="false">لا</option>
              <option value="true">نعم</option>
            </select>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">معلومات إضافية (اختياري)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الميلاد
              </label>
            <input
              type="date"
              value={student.birthDate}
              onChange={(e) => setStudent({ ...student, birthDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
            <input
              type="text"
              value={student.address}
              onChange={(e) => setStudent({ ...student, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم ولي الأمر
              </label>
              <input
                type="text"
                value={student.parentName}
                onChange={(e) => setStudent({ ...student, parentName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={student.parentPhone}
                onChange={(e) => setStudent({ ...student, parentPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                dir="ltr"
              />
        </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
            <input
                type="email"
                value={student.parentEmail}
                onChange={(e) => setStudent({ ...student, parentEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة الصحية
              </label>
              <textarea
                value={student.healthStatus}
                onChange={(e) => setStudent({ ...student, healthStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                احتياجات خاصة
          </label>
              <textarea
                value={student.specialNeeds}
                onChange={(e) => setStudent({ ...student, specialNeeds: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة الاجتماعية
              </label>
          <textarea
                value={student.socialStatus || ''}
                onChange={(e) => setStudent({ ...student, socialStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="وصف الحالة الاجتماعية للتلميذ"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
                حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}

function StudentList() {
  const { currentCycle, getCycleTitle, getCycleLevels } = useCycle();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings>({
    schoolName: '',
    counselorName: '',
    highSchoolName: '',
    highSchoolAddress: '',
    levels: [],
    groups: [],
    semesters: [],
    timezone: 'Africa/Tunis',
    enabledSections: {
      general: true,
      notifications: true,
      security: true,
      profile: true,
      school: true,
      highschool: true,
      levels: true,
      groups: true,
      semesters: true
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
    loadSettings();
  }, []);

  // Recharger les étudiants quand le cycle change
  useEffect(() => {
    loadStudents();
  }, [currentCycle]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const loadedStudents = await getStudents(currentCycle);
      setStudents(loadedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  };

  const handleDeleteSelectedStudents = async () => {
    try {
      setIsLoading(true);
      for (const studentId of selectedStudents) {
        await deleteStudent(studentId);
      }
      setSelectedStudents(new Set());
      await loadStudents();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting selected students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(student => student.id)));
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التلميذ؟')) {
      await deleteStudent(id);
      loadStudents();
    }
  };


  const handleClearGrades = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الدرجات؟ هذا سيبقي التلاميذ ولكن سيمسح جميع الدرجات.')) {
      try {
        setIsLoading(true);
        const updatedStudents = students.map(student => ({
          ...student,
          semester1Grade: undefined,
          semester2Grade: undefined,
          semester3Grade: undefined
        }));
        
        const studentsDb = getStudentsDB(currentCycle);
        await Promise.all(updatedStudents.map(student => 
          studentsDb.setItem(student.id, student)
        ));
        
        setStudents(updatedStudents);
        alert('تم حذف جميع الدرجات بنجاح');
      } catch (error) {
        console.error('Error clearing grades:', error);
        alert('حدث خطأ أثناء حذف الدرجات');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا سيمسح جميع التلاميذ والدرجات في هذا المستوى.')) {
      try {
        setIsLoading(true);
        const studentsDb = getStudentsDB(currentCycle);
        await studentsDb.clear();
        setStudents([]);
        setSelectedStudents(new Set());
        alert('تم حذف جميع البيانات بنجاح');
      } catch (error) {
        console.error('Error clearing all data:', error);
        alert('حدث خطأ أثناء حذف البيانات');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Debug: Log available columns
      if (jsonData.length > 0) {
        console.log('Colonnes disponibles dans le fichier:', Object.keys(jsonData[0] as object));
      }

      // Validate and transform the data
      const importedStudents = await Promise.all(jsonData.map(async (row: any) => {
        // Helper function to get value from either Arabic column names
        const getValue = (key: string) => {
          return row[key]?.toString() || '';
        };

        // Parse the full name to extract first and last name
        const fullName = getValue('اللقب و الاسم');
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Map the student data according to the new template format
        const studentData = {
          studentId: getValue('الرقم'),
          firstName: firstName,
          lastName: lastName,
          level: getCycleLevels()[0] || 'متوسط', // Use first available level from current cycle
          group: settings.groups[0] || '01', // Use first available group
          gender: getValue('الجنس') === 'أنثى' ? 'female' : 'male',
          isRepeating: getValue('الإعادة') === 'نعم',
          birthDate: formatBirthDate(getValue('تاريخ الميلاد')),
          address: '',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          familyStatus: '',
          healthStatus: '',
          specialNeeds: '',
          notes: '',
          socialStatus: '',
          semester1Grade: getValue('معدل الفصل 1') && getValue('معدل الفصل 1').trim() !== '' ? parseFloat(getValue('معدل الفصل 1')) : undefined,
          semester2Grade: getValue('معدل الفصل 2') && getValue('معدل الفصل 2').trim() !== '' ? parseFloat(getValue('معدل الفصل 2')) : undefined,
          semester3Grade: getValue('معدل الفصل 3') && getValue('معدل الفصل 3').trim() !== '' ? parseFloat(getValue('معدل الفصل 3')) : undefined
        };

        // Validate required fields
        const missingFields = [];
        if (!studentData.studentId) missingFields.push('الرقم');
        if (!studentData.firstName) missingFields.push('اللقب و الاسم');
        
        if (missingFields.length > 0) {
          throw new Error(`بيانات غير مكتملة للطالب ${studentData.studentId || 'غير معروف'}. الحقول المفقودة: ${missingFields.join(', ')}`);
        }

        // Add the student to the database
        return await addStudent(studentData, currentCycle);
      }));

      setStudents(prev => [...prev, ...importedStudents]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert(`تم استيراد ${importedStudents.length} تلميذ بنجاح`);
    } catch (error) {
      console.error('Error importing students:', error);
      setImportError(error instanceof Error ? error.message : 'حدث خطأ أثناء استيراد البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStudentsList = () => {
    if (filteredStudents.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const studentsData = filteredStudents.map((student, index) => {
      const data: any = {
        'الرقم': index + 1,
        'اللقب و الاسم': `${student.lastName} ${student.firstName}`.trim(),
        'تاريخ الميلاد': formatBirthDate(student.birthDate),
        'الجنس': student.gender === 'male' ? 'ذكر' : 'أنثى',
        'الإعادة': student.isRepeating ? 'نعم' : 'لا'
      };
      
      // Only include semester grades if they have valid values
      if (hasValidGrade((student as any).semester1Grade)) {
        data['معدل الفصل 1'] = (student as any).semester1Grade;
      }
      if (hasValidGrade((student as any).semester2Grade)) {
        data['معدل الفصل 2'] = (student as any).semester2Grade;
      }
      if (hasValidGrade((student as any).semester3Grade)) {
        data['معدل الفصل 3'] = (student as any).semester3Grade;
      }
      
      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(studentsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `قائمة_التلاميذ_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = !selectedLevel || student.level === selectedLevel;
    const matchesGroup = !selectedGroup || student.group === selectedGroup;

    return matchesSearch && matchesLevel && matchesGroup;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">
                تأكيد حذف {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} المحددين
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف {selectedStudents.size} {currentCycle === 'ثانوي' ? 'طالب' : 'تلميذ'}؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteSelectedStudents}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>تأكيد الحذف</span>
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {currentCycle === 'ثانوي' ? 'قائمة الطلاب' : 'قائمة التلاميذ'} - {getCycleTitle()}
        </h2>
        <div className="flex gap-2">
            <input
            type="file"
              ref={fileInputRef}
            onChange={handleFileImport}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isLoading
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {isLoading ? (
                <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>جاري الاستيراد...</span>
                </>
              ) : (
                <>
                <Upload className="w-4 h-4" />
                <span>جلب قائمة {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}</span>
                </>
              )}
            </button>
          <button
            onClick={handleSaveStudentsList}
            disabled={filteredStudents.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              filteredStudents.length === 0
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>حفظ</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={selectedStudents.size === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              selectedStudents.size === 0
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف ({selectedStudents.size})</span>
          </button>
          <button
            onClick={handleClearGrades}
            disabled={students.length === 0 || isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              students.length === 0 || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح الدرجات</span>
          </button>
          <button
            onClick={handleClearAllData}
            disabled={students.length === 0 || isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              students.length === 0 || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>تفريغ القائمة</span>
          </button>
          <button
            onClick={() => navigate('new')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة {currentCycle === 'ثانوي' ? 'طالب' : 'تلميذ'}</span>
          </button>
          </div>
        </div>

        {importError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{importError}</span>
            </div>
          </div>
        )}

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="البحث عن تلميذ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-2 border rounded-lg"
                dir="rtl"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border rounded-lg px-4 py-2 min-w-[200px]"
          >
            <option value="">جميع المستويات</option>
            {getCycleLevels().map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="border rounded-lg px-4 py-2 min-w-[200px]"
          >
            <option value="">جميع الأقسام</option>
            {settings.groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-right w-12">
                <button
                  onClick={toggleAllStudents}
                  className="hover:text-blue-600 transition-colors"
                >
                  {selectedStudents.size === filteredStudents.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-2 py-2 text-right w-16">الرقم</th>
              <th className="px-2 py-2 text-right w-32">اللقب و الاسم</th>
              <th className="px-2 py-2 text-right w-24">تاريخ الميلاد</th>
              <th className="px-2 py-2 text-right w-16">الجنس</th>
              <th className="px-2 py-2 text-right w-16">الإعادة</th>
              <th className="px-2 py-2 text-right w-20 whitespace-nowrap">معدل الفصل 1</th>
              <th className="px-2 py-2 text-right w-20 whitespace-nowrap">معدل الفصل 2</th>
              <th className="px-2 py-2 text-right w-20 whitespace-nowrap">معدل الفصل 3</th>
              <th className="px-2 py-2 text-right w-24">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={student.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-2">
                  <button
                    onClick={() => toggleStudentSelection(student.id)}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {selectedStudents.has(student.id) ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-2 py-2 text-center">{index + 1}</td>
                <td className="px-2 py-2 truncate" title={`${student.lastName} ${student.firstName}`.trim()}>
                  {`${student.lastName} ${student.firstName}`.trim()}
                </td>
                <td className="px-2 py-2 text-center">{formatBirthDate(student.birthDate)}</td>
                <td className="px-2 py-2 text-center">{student.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                <td className="px-2 py-2 text-center">{student.isRepeating ? 'نعم' : 'لا'}</td>
                <td className="px-2 py-2 text-center">
                  {hasValidGrade((student as any).semester1Grade) ? (student as any).semester1Grade : ''}
                </td>
                <td className="px-2 py-2 text-center">
                  {hasValidGrade((student as any).semester2Grade) ? (student as any).semester2Grade : ''}
                </td>
                <td className="px-2 py-2 text-center">
                  {hasValidGrade((student as any).semester3Grade) ? (student as any).semester3Grade : ''}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`view/${student.id}`)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="عرض"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`edit/${student.id}`)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentManagement() {
  const { getCycleTitle, currentCycle } = useCycle();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ'} - {getCycleTitle()}
      </h1>
      <Routes>
        <Route index element={<StudentList />} />
        <Route path="new" element={<StudentForm />} />
        <Route path="view/:id" element={<ViewStudent />} />
        <Route path="edit/:id" element={<EditStudent />} />
      </Routes>
    </div>
  );
}

export default StudentManagement;