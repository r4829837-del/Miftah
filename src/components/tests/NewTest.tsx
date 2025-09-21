import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Save, AlertTriangle, Download } from 'lucide-react';
import { createTest } from '../../lib/storage';
import { getQuestionsByType } from '../../data/testQuestions';

export default function NewTest() {
  const navigate = useNavigate();
  const [testData, setTestData] = useState({
    title: '',
    type: 'cognitive',
    description: '',
    duration: 30,
    questions: []
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usePredefinedQuestions, setUsePredefinedQuestions] = useState(false);

  const handleLoadPredefinedQuestions = () => {
    const questions = getQuestionsByType(testData.type);
    setTestData(prev => ({
      ...prev,
      questions: questions
    }));
    setUsePredefinedQuestions(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testData.title || !testData.description) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const newTest = await createTest(testData);
      navigate(`/tests/questions/${newTest.id}`);
    } catch (error) {
      console.error('Error creating test:', error);
      setErrorMessage('حدث خطأ أثناء إنشاء الاختبار');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">خطأ</h3>
            </div>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/tests')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">إنشاء اختبار جديد</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عنوان الاختبار <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={testData.title}
            onChange={(e) => setTestData({ ...testData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل عنوان الاختبار"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع الاختبار <span className="text-red-500">*</span>
          </label>
          <select
            value={testData.type}
            onChange={(e) => setTestData({ ...testData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="cognitive">القدرات الفكرية</option>
            <option value="personality">الشخصية</option>
            <option value="professional">الميول المهنية</option>
            <option value="emotional">الذكاء العاطفي</option>
            <option value="creative">التفكير الإبداعي</option>
            <option value="social">المهارات الاجتماعية</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            وصف الاختبار <span className="text-red-500">*</span>
          </label>
          <textarea
            value={testData.description}
            onChange={(e) => setTestData({ ...testData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="أدخل وصفاً للاختبار"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            مدة الاختبار (بالدقائق) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={testData.duration}
            onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            required
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-800">الأسئلة الجاهزة</h3>
            <button
              type="button"
              onClick={handleLoadPredefinedQuestions}
              disabled={usePredefinedQuestions}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{usePredefinedQuestions ? 'تم تحميل الأسئلة' : 'تحميل الأسئلة الجاهزة'}</span>
            </button>
          </div>
          <p className="text-sm text-blue-700">
            يمكنك تحميل مجموعة من الأسئلة الجاهزة والمصممة خصيصاً لنوع الاختبار المحدد. 
            يمكنك تعديل هذه الأسئلة لاحقاً حسب احتياجاتك.
          </p>
          {usePredefinedQuestions && (
            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ تم تحميل {testData.questions.length} سؤال جاهز للاختبار
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/tests')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>إنشاء الاختبار</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}