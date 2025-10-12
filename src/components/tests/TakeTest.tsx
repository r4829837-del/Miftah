import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Timer, AlertTriangle, X, Users, Brain, CheckCircle2, AlertCircle, Filter, Search } from 'lucide-react';
import { getStudents, Student, submitTestResult, getTest, Test, getSettings, AppSettings } from '../../lib/storage';
import { useCycle } from '../../contexts/CycleContext';
import { evaluateCognitiveTest, evaluateCreativeTest, evaluateSocialTest } from '../../data/testQuestions';
import CognitiveTestResults from '../CognitiveTestResults';
import CreativeTestResults from '../CreativeTestResults';
import SocialTestResults from '../SocialTestResults';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentCycle, getCycleLevels } = useCycle();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [detailedResults, setDetailedResults] = useState<{
    score: number;
    analysis: string;
    strengths: string[];
    recommendations: string[];
  } | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudentSelectionModal, setShowStudentSelectionModal] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'individual' | 'group'>('individual');

  useEffect(() => {
    if (testId) {
      loadInitialData();
    }
  }, [testId]);

  const loadInitialData = async () => {
    try {
      const [loadedTest, loadedStudents, loadedSettings] = await Promise.all([
        getTest(testId!),
        getStudents(),
        getSettings()
      ]);

      setTest(loadedTest);
      setAllStudents(loadedStudents);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading initial data:', error);
      navigate('/tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelection = () => {
    let filteredStudents = allStudents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    }

    if (selectedLevel) {
      filteredStudents = filteredStudents.filter(student => student.level === selectedLevel);
    }

    if (selectedGroup) {
      filteredStudents = filteredStudents.filter(student => student.group === selectedGroup);
    }

    setSelectedStudents(filteredStudents);
    setShowStudentSelectionModal(false);
    setCurrentStudentIndex(0);
  };

  useEffect(() => {
    if (test && hasStarted) {
      setTimeLeft(test.duration * 60);
    }
  }, [test, hasStarted]);

  useEffect(() => {
    let timer: number;
    if (hasStarted && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, hasStarted]);

  const handleStartTest = () => {
    if (!test || !test.questions || test.questions.length === 0) {
      navigate('/tests');
      return;
    }
    setHasStarted(true);
  };

  const handleAnswer = (answer: string | boolean) => {
    if (test && test.questions[currentQuestionIndex]) {
      setAnswers(prev => ({
        ...prev,
        [test.questions[currentQuestionIndex].id]: answer
      }));
    }
  };

  const calculateScore = () => {
    if (!test) return { score: 0, detailedResults: null };

    // Use specialized evaluation functions for specific test types
    if (test.type === 'cognitive') {
      const stringAnswers = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, String(value)])
      );
      const results = evaluateCognitiveTest(stringAnswers);
      return { score: results.score, detailedResults: results };
    } else if (test.type === 'creative') {
      const stringAnswers = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, String(value)])
      );
      const results = evaluateCreativeTest(stringAnswers);
      return { score: results.score, detailedResults: results };
    } else if (test.type === 'social') {
      const stringAnswers = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, String(value)])
      );
      const results = evaluateSocialTest(stringAnswers);
      return { score: results.score, detailedResults: results };
    }

    // Default calculation for other test types
    let score = 0;
    let totalQuestions = test.questions.length;

    test.questions.forEach(question => {
      if (question.type === 'text') {
        if (answers[question.id] && (answers[question.id] as string).trim() !== '') {
          score++;
        }
      } else {
        if (answers[question.id] === question.correctAnswer) {
          score++;
        }
      }
    });

    return { score: Math.round((score / totalQuestions) * 100), detailedResults: null };
  };

  const handleSubmit = async () => {
    const { score, detailedResults } = calculateScore();
    setTestScore(score);
    setDetailedResults(detailedResults);

    if (testId && selectedStudents[currentStudentIndex]) {
      try {
        await submitTestResult(
          testId,
          selectedStudents[currentStudentIndex].id,
          Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
            isCorrect: answer === test?.questions.find(q => q.id === questionId)?.correctAnswer
          })),
          score
        );

        if (currentStudentIndex < selectedStudents.length - 1) {
          setCurrentStudentIndex(prev => prev + 1);
          setAnswers({});
          setCurrentQuestionIndex(0);
          setHasStarted(false);
          setShowConfirmEndModal(false);
        } else {
          setShowResultModal(true);
        }
      } catch (error) {
        console.error('Error submitting test result:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-600">جاري تحميل الاختبار...</h2>
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">عذراً</h2>
        <p className="text-gray-600 mb-6">لم يتم العثور على هذا الاختبار أو لا توجد أسئلة</p>
        <button
          onClick={() => navigate('/tests')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة إلى قائمة الاختبارات</span>
        </button>
      </div>
    );
  }

  if (showStudentSelectionModal) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/tests')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">{test.title}</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{currentCycle === 'ثانوي' ? 'اختيار الطلاب' : 'اختيار التلاميذ'}</h3>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSelectionMode('individual')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                selectionMode === 'individual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              اختيار فردي
            </button>
            <button
              onClick={() => setSelectionMode('group')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                selectionMode === 'group'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              اختيار حسب الفوج
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="البحث عن تلميذ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {selectionMode === 'group' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">جميع المستويات</option>
                    {getCycleLevels().map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">جميع الأفواج</option>
                    {settings?.groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectionMode === 'individual' && (
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {allStudents.map(student => (
                  <div
                    key={student.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedStudents.includes(student) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (selectedStudents.includes(student)) {
                        setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
                      } else {
                        setSelectedStudents(prev => [...prev, student]);
                      }
                    }}
                  >
                    <div className="font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.level} - {student.group}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/tests')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            إلغاء
          </button>
          <button
            onClick={handleStudentSelection}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={selectionMode === 'individual' && selectedStudents.length === 0}
          >
            متابعة
          </button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tests')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">{test.title}</h2>
              <p className="text-gray-600 mt-1">{test.description}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-b py-6 my-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 text-gray-600">
              <Timer className="w-5 h-5" />
              <span>المدة: {test.duration} دقيقة</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Brain className="w-5 h-5" />
              <span>عدد الأسئلة: {test.questions.length}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Users className="w-5 h-5" />
              <span>
                التلميذ: {selectedStudents[currentStudentIndex]?.firstName} {selectedStudents[currentStudentIndex]?.lastName}
                <span className="text-sm text-gray-500 mr-2">
                  ({currentStudentIndex + 1} من {selectedStudents.length})
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="text-center py-8">
          <h3 className="text-xl font-bold mb-4">هل أنت مستعد لبدء الاختبار؟</h3>
          <p className="text-gray-600 mb-6">
            يرجى التأكد من أنك في بيئة هادئة ومناسبة للتركيز
          </p>
          <button
            onClick={handleStartTest}
            className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <Brain className="w-5 h-5" />
            <span>بدء الاختبار</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {showConfirmEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-orange-500 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد إنهاء الاختبار</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إنهاء الاختبار؟ لا يمكنك العودة بعد هذه الخطوة.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmEndModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                تأكيد الإنهاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-green-500 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <h3 className="text-xl font-bold">اكتمل الاختبار</h3>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Users className="w-5 h-5" />
                <span>تم اختبار {selectedStudents.length} تلميذ</span>
              </div>
              <p className="text-gray-600">
                تم حفظ جميع النتائج بنجاح. يمكنك مراجعة النتائج التفصيلية في قسم التقارير.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/tests')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>العودة إلى القائمة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tests')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{test.title}</h2>
            {selectedStudents[currentStudentIndex] && (
              <div className="text-sm text-gray-600 mt-1">
                التلميذ: {selectedStudents[currentStudentIndex].firstName} {selectedStudents[currentStudentIndex].lastName}
                <span className="mx-2">•</span>
                {currentStudentIndex + 1} من {selectedStudents.length}
              </div>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 ${
          timeLeft < 300 ? 'text-red-500' : 'text-orange-500'
        }`}>
          <Timer className="w-5 h-5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            سؤال {currentQuestionIndex + 1} من {test.questions.length}
          </h3>
          <div className="text-sm text-gray-500">
            {Math.round(((currentQuestionIndex + 1) / test.questions.length) * 100)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-lg mb-4">{currentQuestion.text}</div>

        {currentQuestion.type === 'multiple_choice' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-right px-4 py-3 rounded-lg border transition-colors ${
                  answers[currentQuestion.id] === option
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'true_false' && (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                answers[currentQuestion.id] === true
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              صح
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                answers[currentQuestion.id] === false
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              خطأ
            </button>
          </div>
        )}

        {currentQuestion.type === 'text' && (
          <textarea
            value={answers[currentQuestion.id]?.toString() || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="اكتب إجابتك هنا..."
          />
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السابق
        </button>
        {currentQuestionIndex === test.questions.length - 1 ? (
          <button
            onClick={() => setShowConfirmEndModal(true)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            إنهاء الاختبار
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            التالي
          </button>
        )}
      </div>

      {timeLeft < 300 && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>تنبيه: بقي {Math.ceil(timeLeft / 60)} دقائق على نهاية الاختبار</span>
        </div>
      )}

      {/* Detailed Results Modals */}
      {showResultModal && detailedResults && test?.type === 'cognitive' && (
        <CognitiveTestResults
          score={detailedResults.score}
          analysis={detailedResults.analysis}
          strengths={detailedResults.strengths}
          recommendations={detailedResults.recommendations}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {showResultModal && detailedResults && test?.type === 'creative' && (
        <CreativeTestResults
          score={detailedResults.score}
          analysis={detailedResults.analysis}
          strengths={detailedResults.strengths}
          recommendations={detailedResults.recommendations}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {showResultModal && detailedResults && test?.type === 'social' && (
        <SocialTestResults
          score={detailedResults.score}
          analysis={detailedResults.analysis}
          strengths={detailedResults.strengths}
          recommendations={detailedResults.recommendations}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </div>
  );
}