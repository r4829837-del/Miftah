import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Brain, Briefcase, Lightbulb, UserCircle2, Users, Sparkles, PlusCircle, PlayCircle, X, Save, Settings } from 'lucide-react';
import NewTest from './tests/NewTest';
import TakeTest from './tests/TakeTest';
import TestQuestions from './tests/TestQuestions';
import { getStudents, Student, submitTestResult } from '../lib/storage';

const testTypes = [
  {
    id: 'cognitive',
    title: 'القدرات الفكرية',
    description: 'اختبار لقياس القدرات المعرفية',
    icon: Brain,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'personality',
    title: 'الشخصية',
    description: 'اختبار لتحليل وفهم السمات الشخصية',
    icon: UserCircle2,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    id: 'professional',
    title: 'الميول المهنية',
    description: 'اختبار لتحديد الميول المهنية',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'emotional',
    title: 'الذكاء العاطفي',
    description: 'اختبار لقياس الذكاء العاطفي',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'creative',
    title: 'التفكير الإبداعي',
    description: 'اختبار لقياس مهارات التفكير الإبداعي',
    icon: Sparkles,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'social',
    title: 'المهارات الاجتماعية',
    description: 'اختبار لتقييم المهارات الاجتماعية',
    icon: Users,
    color: 'bg-red-100 text-red-600'
  }
];

function TestList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('types');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [testScore, setTestScore] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const loadedStudents = await getStudents();
    setStudents(loadedStudents);
  };

  const handleSaveResult = async () => {
    if (!selectedTest || !selectedStudent) return;

    try {
      setIsSubmitting(true);
      await submitTestResult(
        selectedTest,
        selectedStudent,
        [],
        testScore
      );
      setShowResultModal(false);
      setSelectedTest('');
      setSelectedStudent('');
      setTestScore(0);
      setNotes('');
    } catch (error) {
      console.error('Error saving test result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal d'enregistrement de résultat */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">تسجيل نتيجة اختبار جديدة</h3>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التلميذ
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر تلميذاً</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الاختبار
                  </label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر نوع الاختبار</option>
                    {testTypes.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    النتيجة (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={testScore}
                    onChange={(e) => setTestScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="أدخل ملاحظات حول أداء التلميذ في الاختبار"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveResult}
                  disabled={!selectedStudent || !selectedTest || isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>حفظ النتيجة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الإختبارات</h2>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('new')}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>إنشاء اختبار جديد</span>
        </button>
        <button
          onClick={() => setShowResultModal(true)}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <PlayCircle className="w-5 h-5" />
          <span>تسجيل نتيجة اختبار</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('types')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'types'
                  ? 'border-b-2 border-green-700 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              أنواع الاختبارات
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'results'
                  ? 'border-b-2 border-green-700 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              نتائج الاختبارات
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'types' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testTypes.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${test.color}`}>
                      <test.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold">{test.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{test.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`take/${test.id}`)}
                      className="flex-1 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>تقديم اختبار</span>
                    </button>
                    <button
                      onClick={() => navigate(`questions/${test.id}`)}
                      className="flex-1 border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings className="w-5 h-5" />
                      <span>إعداد الأسئلة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لا توجد نتائج اختبارات حتى الآن
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestManagement() {
  return (
    <div>
      <Routes>
        <Route index element={<TestList />} />
        <Route path="new" element={<NewTest />} />
        <Route path="take/:testId" element={<TakeTest />} />
        <Route path="questions/:testId" element={<TestQuestions />} />
      </Routes>
    </div>
  );
}