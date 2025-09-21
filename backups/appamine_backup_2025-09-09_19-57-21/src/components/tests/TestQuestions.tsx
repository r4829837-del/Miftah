import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Plus, Save, Trash2, AlertTriangle, Brain, X, CheckCircle2 } from 'lucide-react';
import { Test, Question, getTest, updateTest } from '../../lib/storage';

export default function TestQuestions() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (testId) {
      loadTest(testId);
    }
  }, [testId]);

  const loadTest = async (id: string) => {
    try {
      const loadedTest = await getTest(id);
      if (loadedTest) {
        setTest(loadedTest);
        setQuestions(loadedTest.questions || []);
      }
    } catch (error) {
      console.error('Error loading test:', error);
      navigate('/tests');
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: '',
        type: 'multiple_choice',
        options: ['', ''],
        correctAnswer: ''
      }
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options!.push('');
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuestion = () => {
    if (selectedQuestionIndex !== null) {
      const updatedQuestions = questions.filter((_, index) => index !== selectedQuestionIndex);
      setQuestions(updatedQuestions);
      setShowDeleteModal(false);
      setSelectedQuestionIndex(null);
    }
  };

  const handleSave = async () => {
    if (!test || !testId) return;

    try {
      setIsLoading(true);
      await updateTest(testId, {
        ...test,
        questions
      });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!test) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-600">جاري تحميل الاختبار...</h2>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-down">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ الأسئلة بنجاح</span>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد حذف السؤال</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا السؤال؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteQuestion}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                تأكيد الحذف
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
        <div>
          <h2 className="text-2xl font-bold">{test.title}</h2>
          <p className="text-gray-600 mt-1">{test.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                  placeholder="أدخل نص السؤال"
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                />
                <select
                  value={question.type}
                  onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="multiple_choice">اختيار متعدد</option>
                  <option value="true_false">صح/خطأ</option>
                  <option value="text">إجابة نصية</option>
                </select>
              </div>
              <button
                onClick={() => handleDeleteQuestion(questionIndex)}
                className="text-red-500 hover:text-red-600 p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {question.type === 'multiple_choice' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">الخيارات:</label>
                  <button
                    onClick={() => handleAddOption(questionIndex)}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة خيار</span>
                  </button>
                </div>
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      placeholder={`الخيار ${optionIndex + 1}`}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                      className="text-red-500 hover:text-red-600 p-2"
                      disabled={question.options!.length <= 2}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الإجابة الصحيحة:
                  </label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">اختر الإجابة الصحيحة</option>
                    {question.options?.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {question.type === 'true_false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الإجابة الصحيحة:
                </label>
                <select
                  value={question.correctAnswer.toString()}
                  onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value === 'true')}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">اختر الإجابة الصحيحة</option>
                  <option value="true">صح</option>
                  <option value="false">خطأ</option>
                </select>
              </div>
            )}

            {question.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نموذج الإجابة (اختياري):
                </label>
                <input
                  type="text"
                  value={question.correctAnswer.toString()}
                  onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                  placeholder="أدخل نموذج الإجابة"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between items-center">
          <button
            onClick={handleAddQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة سؤال</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading || questions.length === 0}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>حفظ الأسئلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}