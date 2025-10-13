import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Brain, Briefcase, Lightbulb, UserCircle2, Users, Sparkles, PlusCircle, PlayCircle, X, Save, Settings, FileText, Heart, Calculator, RefreshCw, ArrowRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NewTest from './tests/NewTest';
import TakeTest from './tests/TakeTest';
import TestQuestions from './tests/TestQuestions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { getStudents, Student, submitTestResult, getSettings, updateSettings, AppSettings, createTest, getTestResults, TestResult } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import { getQuestionsByType, getTestTypeTitle, getTestDescription, creativeQuestions, socialQuestions, evaluateCreativeTest, evaluateSocialTest } from '../data/testQuestions';

const testTypes = [];

// Test Results Section Component
function TestResultsSection({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { currentCycle } = useCycle();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [testResults, selectedStudent, selectedTestType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [results, studentsData] = await Promise.all([
        getTestResults(),
        getStudents()
      ]);
      setTestResults(results);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = testResults;

    if (selectedStudent !== 'all') {
      filtered = filtered.filter(result => result.studentId === selectedStudent);
    }

    if (selectedTestType !== 'all') {
      filtered = filtered.filter(result => result.testId === selectedTestType);
    }

    setFilteredResults(filtered);
  };

  const getTestTypeTitle = (testId: string) => {
    const testTypeMap: { [key: string]: string } = {
      'cognitive_abilities': 'القدرات الفكرية',
      'professional_orientation': 'الميول المهنية',
      'emotional_intelligence': 'الذكاء العاطفي',
      'personality': 'الشخصية',
      'representational_styles': 'الأنماط التمثيلية',
      'creative_thinking': 'التفكير الإبداعي',
      'social_skills': 'المهارات الاجتماعية',
      'subject_inclination': 'الميول نحو المواد'
    };
    return testTypeMap[testId] || testId;
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'طالب غير معروف';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد';
    if (score >= 40) return 'متوسط';
    return 'ضعيف';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">نتائج الاختبارات</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة جميع نتائج الاختبارات المكتملة</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{filteredResults.length}</div>
            <div className="text-sm text-gray-500">نتيجة اختبار</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{currentCycle === 'ثانوي' ? 'الطالب' : 'التلميذ'}</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{currentCycle === 'ثانوي' ? 'جميع الطلاب' : 'جميع التلاميذ'}</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع الاختبار</label>
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الاختبارات</option>
              <option value="cognitive_abilities">القدرات الفكرية</option>
              <option value="professional_orientation">الميول المهنية</option>
              <option value="emotional_intelligence">الذكاء العاطفي</option>
              <option value="personality">الشخصية</option>
              <option value="representational_styles">الأنماط التمثيلية</option>
              <option value="creative_thinking">التفكير الإبداعي</option>
              <option value="social_skills">المهارات الاجتماعية</option>
              <option value="subject_inclination">الميول نحو المواد</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadData}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد نتائج اختبارات</h3>
            <p className="text-gray-600 text-sm mb-6">
              {selectedStudent !== 'all' || selectedTestType !== 'all' 
                ? 'لا توجد نتائج تطابق الفلاتر المحددة'
                : 'ابدأ بإنشاء اختبارات جديدة أو سجل نتائج الاختبارات المكتملة'
              }
            </p>
            <button
              onClick={() => setActiveTab('types')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto"
            >
              <Brain className="w-4 h-4" />
              <span>عرض أنواع الاختبارات</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result) => (
            <div key={result.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {getTestTypeTitle(result.testId)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {getStudentName(result.studentId)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(result.completedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {getScoreLevel(result.score)}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    result.score >= 80 ? 'bg-green-500' : 
                    result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{result.answers.length} سؤال</span>
                <span>مكتمل</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestList() {
  const { currentCycle, getCycleConfig } = useCycle();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('types');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [testScore, setTestScore] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showInclinationModal, setShowInclinationModal] = useState(false);
  const [scienceAnswers, setScienceAnswers] = useState<{[key: string]: number}>({});
  const [artsAnswers, setArtsAnswers] = useState<{[key: string]: number}>({});
  const [showResults, setShowResults] = useState(false);
  const [scienceScore, setScienceScore] = useState(0);
  const [artsScore, setArtsScore] = useState(0);
  const [recommendation, setRecommendation] = useState('');
  const [scienceQ2Subject, setScienceQ2Subject] = useState<string>('');
  const [artsQ2Subject, setArtsQ2Subject] = useState<string>('');
  const [scienceQ5Subject, setScienceQ5Subject] = useState<string>('');
  const [scienceQ9Subject, setScienceQ9Subject] = useState<string>('');
  const [artsQ5Subject, setArtsQ5Subject] = useState<string>('');
  const [artsQ9Subject, setArtsQ9Subject] = useState<string>('');

  // Representational styles (VAK) modal states
  const [showRepModal, setShowRepModal] = useState(false);
  const [repAnswers, setRepAnswers] = useState<Record<number, 'a' | 'b' | 'c' | undefined>>({});
  const [repTotals, setRepTotals] = useState<{ visual: number; auditory: number; kinesthetic: number }>({ visual: 0, auditory: 0, kinesthetic: 0 });
  const [repSelectedStudent, setRepSelectedStudent] = useState<string>('');
  const [repSaving, setRepSaving] = useState(false);
  const [repPersonalInfo, setRepPersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    wilaya: '',
    date: '',
    counselorName: '',
    academicYear: ''
  });
  // NEW: ranking per question (3/2/1 for A/B/C)
  
  // Creative thinking test modal states
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [creativeAnswers, setCreativeAnswers] = useState<Record<number, 'a' | 'b' | undefined>>({});
  const [creativeSelectedStudent, setCreativeSelectedStudent] = useState<string>('');
  const [creativeSaving, setCreativeSaving] = useState(false);
  const [creativePersonalInfo, setCreativePersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    date: ''
  });
  const [creativeResults, setCreativeResults] = useState<{
    score: number;
    analysis: string;
    strengths: string[];
    recommendations: string[];
  } | null>(null);

  // Social skills test modal states
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialAnswers, setSocialAnswers] = useState<Record<number, 'a' | 'b' | undefined>>({});
  const [socialSelectedStudent, setSocialSelectedStudent] = useState<string>('');
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialResults, setSocialResults] = useState<{
    score: number;
    analysis: string;
    strengths: string[];
    recommendations: string[];
  } | null>(null);
  const [socialPersonalInfo, setSocialPersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    date: ''
  });
  const [repRanks, setRepRanks] = useState<Record<number, { a: number; b: number; c: number }>>({});

  // Function to create test with predefined questions
  const handleCreateTestWithQuestions = async (testType: string) => {
    try {
      const questions = getQuestionsByType(testType);
      const testData = {
        title: getTestTypeTitle(testType),
        type: testType,
        description: getTestDescription(testType),
        duration: 30,
        questions: questions
      };
      
      const newTest = await createTest(testData);
      navigate(`/tests/questions/${newTest.id}`);
    } catch (error) {
      console.error('Error creating test with predefined questions:', error);
    }
  };

  // Personality test modal states
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<number, 'a' | 'b' | undefined>>({});
  const [personalitySelectedStudent, setPersonalitySelectedStudent] = useState<string>('');
  const [personalityPersonalInfo, setPersonalityPersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    date: ''
  });
  const [personalitySaving, setPersonalitySaving] = useState(false);
  const [personalityResults, setPersonalityResults] = useState<{
    extroversion: number;
    agreeableness: number;
    conscientiousness: number;
    neuroticism: number;
    openness: number;
    dominantTrait: string;
    description: string;
  } | null>(null);

  // Professional orientation test states
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [professionalAnswers, setProfessionalAnswers] = useState<Record<number, 'a' | 'b' | undefined>>({});
  // Reset helpers for tests
  const resetCreativeTest = () => {
    setCreativeAnswers({});
    setCreativeSelectedStudent('');
    setCreativePersonalInfo({ name: '', surname: '', section: '', schoolType: '', date: '' });
  };

  const resetSocialTest = () => {
    setSocialAnswers({});
    setSocialSelectedStudent('');
    setSocialPersonalInfo({ name: '', surname: '', section: '', schoolType: '', date: '' });
  };

  const resetProfessionalTest = () => {
    setProfessionalAnswers({});
    setProfessionalSelectedStudent('');
    setProfessionalPersonalInfo({ name: '', surname: '', section: '', schoolType: '', date: '' });
    setProfessionalResults(null);
  };

  const resetCognitiveTest = () => {
    setCognitiveAnswers({});
    setCognitiveSelectedStudent('');
    setCognitivePersonalInfo({ name: '', surname: '', section: '', schoolType: getCycleConfig(currentCycle).schoolName, date: '' });
    setCognitiveResults(null);
  };

  const resetEmotionalTest = () => {
    setEmotionalAnswers({});
    setEmotionalSelectedStudent('');
    setEmotionalPersonalInfo({ name: '', surname: '', section: '', schoolType: '', date: '' });
    setEmotionalResults(null as any);
  };
  const [professionalSelectedStudent, setProfessionalSelectedStudent] = useState<string>('');

  // Cognitive abilities test states
  const [showCognitiveModal, setShowCognitiveModal] = useState(false);
  const [cognitiveAnswers, setCognitiveAnswers] = useState<Record<number, 'a' | 'b' | undefined>>({});
  const [cognitiveSelectedStudent, setCognitiveSelectedStudent] = useState<string>('');
  const [cognitivePersonalInfo, setCognitivePersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    date: ''
  });
  const [cognitiveSaving, setCognitiveSaving] = useState(false);
  const [cognitiveResults, setCognitiveResults] = useState<{
    analytical: number;
    creative: number;
    social: number;
    leadership: number;
    detail: number;
    dominantProfile: string;
    description: string;
  } | null>(null);

  // Emotional intelligence test states
  const [showEmotionalModal, setShowEmotionalModal] = useState(false);
  const [emotionalAnswers, setEmotionalAnswers] = useState<Record<number, 'a' | 'b' | undefined>>({});
  const [emotionalSelectedStudent, setEmotionalSelectedStudent] = useState<string>('');
  const [emotionalPersonalInfo, setEmotionalPersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    date: ''
  });
  const [emotionalSaving, setEmotionalSaving] = useState(false);
  const [emotionalResults, setEmotionalResults] = useState<{
    selfAwareness: number;
    selfRegulation: number;
    empathy: number;
    socialSkills: number;
    motivation: number;
    dominantTrait: string;
    description: string;
  } | null>(null);
  const [professionalPersonalInfo, setProfessionalPersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
        schoolType: getCycleConfig(currentCycle).schoolName,
    date: ''
  });
  const [professionalSaving, setProfessionalSaving] = useState(false);
  const [professionalResults, setProfessionalResults] = useState<{
    leadership: number;
    teamwork: number;
    creativity: number;
    organization: number;
    communication: number;
    dominantOrientation: string;
    description: string;
  } | null>(null);

  // Personal information states
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    surname: '',
    section: '',
    highSchool: '',
    date: '',
    schoolType: 'المتوسطة'
  });
  
  // Text answer states for questions 12, 13, 14
  const [scienceTextAnswers, setScienceTextAnswers] = useState({
    q12: '',
    q13: '',
    q14: ''
  });
  
  const [artsTextAnswers, setArtsTextAnswers] = useState({
    q12: '',
    q13: '',
    q14: ''
  });
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(360); // 6 minutes = 360 seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Timer control functions
  const startTimer = () => {
    if (!isTimerRunning && timeLeft > 0) {
      setIsTimerRunning(true);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setTimeLeft(360); // Reset to 6 minutes
  };

  useEffect(() => {
    loadStudents();
  }, [currentCycle]); // Recharger quand le cycle change

  // Representational styles questions (VAK test)
  const repQuestions = [
    {
      q: "عند إعطائك قائمة للتذكر هل ؟",
      a: "تحتاج أن تراها وبعد ذلك تتخيلها في ذهنك",
      b: "تسمعها وبعد ذلك ترددها في ذهنك كما سمعتها",
      c: "تشعر بالراحة فقط عند تدوينها"
    },
    {
      q: "عند تركيزك ما الذي قد يشتتك أكثر ؟",
      a: "البيئة المحيطة غير المرتبة",
      b: "الإزعاج حتى الموسيقى الخفيفة الهادئة",
      c: "الشعور بعدم الراحة"
    },
    {
      q: "عندما تتحدث مع الآخرين يكون ذلك بسبب ؟",
      a: "شكلهم الجميل",
      b: "صوتهم المميز",
      c: "الشعور بالراحة عند التحدث معهم"
    },
    {
      q: "عند قراءتك لكتاب للإستمتاع هل تختاره لأنه ؟",
      a: "عبارة عن مشاهد تصويرية يمكنك تخيلها",
      b: "مصوغ بطريقة حوار محادثة حيث يمكنك سماعها",
      c: "الإندماج مع الشخصيات"
    },
    {
      q: "عند تفكيرك بشريك النشاط الذي تفضله هل تفضله لأنه ؟",
      a: "تعجبك الطريقة التي يبدو فيها",
      b: "تعجبك طريقة اهتمامه بما تقول",
      c: "السرعة التي يشعرك بها بالراحة في العمل"
    },
    {
      q: "إذا كنت تريد قضاء أمسية .. تفضل الذهاب إلى ؟",
      a: "حفلة أو أمسية شعرية",
      b: "حفلة كلاسيكية أو حفلة عامة",
      c: "عرض لجماعة أو شخص معين محبب إليك"
    },
    {
      q: "عندما تكون في متحف، سوق كبير مسقوف أو منزل فخم ؟",
      a: "تنظر إلى ما حولك",
      b: "تهتم بدرجة هدوء المكان",
      c: "تندمج مع الجو المحيط بك"
    },
    {
      q: "أي نوع من الأفلام تستمتع بها ؟",
      a: "مشاهد مثيرة / بطولية",
      b: "المشاهد الموسيقية أو الحوارية",
      c: "المشاهد المليئة بالمشاعر الحسية"
    },
    {
      q: "للإستمتاع تفضل ؟",
      a: "مشاهدة فيلم أو لقاء كروي",
      b: "حفلة موسيقية",
      c: "المسرح"
    },
    {
      q: "عند تفكيرك بغرفتك المفضلة .. فإنك تفضلها بسبب ؟",
      a: "شكلها",
      b: "هدوئها",
      c: "مريحة"
    }
  ];

  // Personality test questions (اختبار التوجه الشخصي)
  const professionalQuestions = [
    {
      q: "حدد العبارة التي تشبهك أكثر في العمل:",
      a: "أحب أن أكون في موقع قيادي ومركزي.",
      b: "أستطيع أن أعمل بانسجام مع مختلف الزملاء."
    },
    {
      q: "عند اتخاذ القرارات المهنية:",
      a: "أحب أن أناقش أفكاري مع الفريق قبل الحسم.",
      b: "أفضل أن نتخذ القرار بالإجماع."
    },
    {
      q: "في عملي:",
      a: "أعتمد على إحساسي وتجربتي لاختيار الأنسب.",
      b: "أكثر ما يزعجني هو غياب المبادرة."
    },
    {
      q: "بالنسبة للمهام:",
      a: "أحب أن يكون كل شيء مرتبًا وواضحًا.",
      b: "أفضل إنجاز المشروع من البداية للنهاية بدقة."
    },
    {
      q: "في بيئة العمل:",
      a: "أنا شخص متفائل بطبعي.",
      b: "تحت الضغط، أحافظ على هدوئي."
    },
    {
      q: "عند التعامل مع الآخرين:",
      a: "أهتم بتفاعلهم مع ما أقدمه.",
      b: "أشارك أفكاري معهم باستمرار."
    },
    {
      q: "في القرارات المهنية:",
      a: "أفضل أن تكون القرارات جماعية.",
      b: "أؤمن أن بعض القرارات الأفضل ليست دائمًا منطقية بحتة."
    },
    {
      q: "في عملي:",
      a: "أحب المشاريع المتغيرة والمتنوعة.",
      b: "أفضل الروتين والإجراءات الثابتة."
    },
    {
      q: "في بيئة العمل:",
      a: "أكتشف الأخطاء الصغيرة بسهولة.",
      b: "لا أنشغل كثيرًا بالقلق."
    },
    {
      q: "مع الفريق:",
      a: "كثيرًا ما أستطيع إقناعهم بما أريد.",
      b: "أحب التحدث والتواصل مع الجميع."
    },
    {
      q: "في الاجتماعات:",
      a: "أعدل طريقة كلامي حسب جمهوري.",
      b: "أشرك الآخرين في القرارات المهمة."
    },
    {
      q: "في عملي:",
      a: "أؤمن أن كل شخص يمكن أن يملك أفكارًا جيدة.",
      b: "أعتمد أكثر على إحساسي من الحقائق الجامدة."
    },
    {
      q: "في المهنة:",
      a: "أحب إشراك الآخرين في القرارات المهمة.",
      b: "أرى التغيير أمرًا إيجابيًا."
    },
    {
      q: "في طريقتي بالعمل:",
      a: "يقال إن لدي أسلوبًا إبداعيًا خاصًا.",
      b: "أكرر غالبًا نفس الإيماءات."
    },
    {
      q: "في إنجاز المهام:",
      a: "أحب تجربة أشياء جديدة.",
      b: "لا تفوتني أي تفاصيل."
    },
    {
      q: "في التنظيم:",
      a: "أنظم نفسي بطريقة منهجية.",
      b: "لا أقلق كثيرًا على التفاصيل."
    },
    {
      q: "في العمل:",
      a: "لدي عين ثاقبة للتفاصيل.",
      b: "لا أُظهر مشاكلي للآخرين."
    },
    {
      q: "في المشاريع:",
      a: "أستطيع توجيه الآخرين بسهولة.",
      b: "أحب الاستماع لآراء الفريق قبل القرار."
    },
    {
      q: "في العلاقات المهنية:",
      a: "أحاول ألا أسبب صدمة لزملائي.",
      b: "أعتمد كثيرًا على الحدس والشعور."
    },
    {
      q: "في بيئة العمل:",
      a: "أؤمن أن لكل شخص شيئًا مهمًا ليقدمه.",
      b: "لا أحب البقاء طويلًا في نفس المكان."
    },
    {
      q: "قبل اتخاذ القرار:",
      a: "أقارن رأيي بآراء الآخرين.",
      b: "أعمل غالبًا بنفس الطريقة المعتادة."
    },
    {
      q: "في عملي:",
      a: "كثيرًا ما يكون لدي حدس واضح.",
      b: "أركز على التفاصيل الدقيقة."
    },
    {
      q: "في الحياة المهنية:",
      a: "أهرب من الروتين.",
      b: "لا أعتبر الأمور خطيرة جدًا."
    },
    {
      q: "في إنجاز المهام:",
      a: "أفضل العمل وفق إرشادات واضحة.",
      b: "عندما تسوء الأمور، لا أُظهر ذلك."
    },
    {
      q: "في العمل الجماعي:",
      a: "يقال إني أمتلك روح القائد.",
      b: "أعتمد أولًا على مشاعري."
    },
    {
      q: "في التواصل:",
      a: "أزن كلماتي قبل التعبير.",
      b: "أحب التنقل بين مهام مختلفة."
    },
    {
      q: "بالنسبة للعمل:",
      a: "أريد أن أعرف كيف يرى الآخرون الأمور.",
      b: "لا أستطيع العمل في بيئة فوضوية."
    },
    {
      q: "في الفريق:",
      a: "أسأل زملائي باستمرار عن آرائهم.",
      b: "أنا مراقب جدًا."
    },
    {
      q: "في القرارات:",
      a: "أشعر غالبًا بأشياء دون تفسير منطقي.",
      b: "أجد دائمًا طريقة للنجاح."
    },
    {
      q: "في مساري المهني:",
      a: "أعتبر نفسي متعدد المهام.",
      b: "أعتمد على نفسي لتحمل المسؤولية."
    },
    {
      q: "في العمل:",
      a: "أوجه الآخرين بسهولة.",
      b: "أحب تغيير بيئتي كثيرًا."
    },
    {
      q: "في العلاقات:",
      a: "أكسب ثقة الآخرين بسهولة.",
      b: "التصنيف والتنظيم يصفّي ذهني."
    },
    {
      q: "في العمل:",
      a: "أشارك وأتبادل الأفكار مع الآخرين باستمرار.",
      b: "لا أتحمل العمل غير الدقيق."
    },
    {
      q: "قبل القرار:",
      a: "أحب الاطلاع على آراء مختلفة.",
      b: "لا أقلق كثيرًا."
    },
    {
      q: "في حل المشكلات:",
      a: "غالبًا أشعر أن لدي الحل حتى دون تفسير منطقي.",
      b: "أثق أكثر بالمقربين مني."
    },
    {
      q: "في المناصب:",
      a: "أشعر بالراحة في موقع القيادة.",
      b: "أحتاج دائمًا إلى ترتيب الأمور."
    },
    {
      q: "في التواصل:",
      a: "أجيد إقناع الآخرين بكلامي.",
      b: "ألاحظ تفاصيل لا يراها الآخرون."
    },
    {
      q: "في العلاقات المهنية:",
      a: "نادرًا ما أحكم على الآخرين.",
      b: "أتوقع أن أعيش مسارًا مهنيًا ناجحًا."
    },
    {
      q: "في القرارات:",
      a: "أتجنب اتخاذ القرارات بمفردي.",
      b: "أحتفظ بمساحتي الخاصة."
    },
    {
      q: "في الاجتماعات:",
      a: "عندما أتكلم، يتم الاستماع إلي.",
      b: "دائمًا أراجع عملي قبل تقديمه."
    },
    {
      q: "في العمل:",
      a: "أحرص أن أترك انطباعًا جيدًا.",
      b: "أؤمن بالحظ أحيانًا."
    },
    {
      q: "بالنسبة للآراء:",
      a: "أؤمن أن كل رأي يمكن الدفاع عنه.",
      b: "لا أحب كشف نفسي مباشرة."
    },
    {
      q: "في الفريق:",
      a: "أحب اتخاذ القرارات للمجموعة.",
      b: "أنظر للحياة المهنية بتفاؤل."
    },
    {
      q: "في العلاقات:",
      a: "أجعل نفسي موضع تقدير بسهولة.",
      b: "أتصرف بتواضع."
    },
    {
      q: "في العمل:",
      a: "أسعى للفت الانتباه.",
      b: "أحافظ على هدوئي دائمًا."
    }
  ];

  const personalityQuestions = [
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا أحب أن أكون مركز الاهتمام.",
      b: "أتوافق بشكل جيد مع الجميع تقريبًا."
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب مقارنة وجهة نظري مع وجهات نظر الآخرين.",
      b: "أحب أن أتخذ القرارات بالإجماع."
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عندما يتوجب علي اتخاذ قرار، أفضل الاعتماد على ما أشعر أنه الأفضل بالنسبة لي.",
      b: "لا يوجد شيء يزعجني أكثر من عدم التصرف."
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا أتأكد من أن كل شيء في مكانه.",
      b: "أنا أفعل الأشياء من الألف إلى الياء"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا متفائل.",
      b: "عندما أكون تحت الضغط، أحافظ على هدوئي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عندما أتحدث إلى شخص ما، أهتم بردود أفعاله.",
      b: "أنا غالبا ما أشارك أفكاري مع الآخرين."
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أفضل القرارات هي القرارات الجماعية.",
      b: "أعتقد أن أفضل القرارات ليست دائمًا هي القرارات الأكثر منطقية"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا أحب الأشياء المتحركة.",
      b: "لدي روتين عملي الصغير"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستطيع اكتشاف العيوب الصغيرة بسهولة.",
      b: "أنا لست من النوع الذي يشعر بالقلق"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "في كثير من الأحيان يفعل الآخرون ما أريد.",
      b: "أحب الدردشة مع الجميع"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أقوم بتكييف حديثي ليصل إلى الآخرين.",
      b: "غالبا ما أشرك الآخرين في اتخاذ القرارات المهمة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أعتقد أن أي شخص يمكن أن يكون لديه أفكار جيدة.",
      b: "عندما يتوجب علي اتخاذ قرار، فأنا أعتمد في قراري على ما أشعر به أكثر من اعتمادي على الحقائق"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا دائما أشرك الآخرين في القرارات المهمة.",
      b: "أرى التغيير كشيء جيد"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "يقال لي في كثير من الأحيان أنني فنان إلى حد ما في طريقتي في القيام بالأشياء.",
      b: "أنا غالبا ما أقوم بنفس الإيماءات"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب أن أفعل أشياء مختلفة.",
      b: "لا توجد تفاصيل تفلت مني"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا أنظم نفسي بطريقة منهجية.",
      b: "أنا لست من النوع الذي يقلق كثيرا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "لدي عين للتفاصيل.",
      b: "لا أسمح لمشاكلي بالظهور"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستطيع أن آخذ الآخرين إلى حيث أريد.",
      b: "قبل اتخاذ القرارات، أحب أن أسمع آراء الآخرين"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحاول ألا أسبب صدمة لمحاوري.",
      b: "أنا أعتمد كثيرًا على الحدس والشعور"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أعتقد أن كل شخص لديه شيء مثير للاهتمام ليقوله.",
      b: "لا أحب البقاء في نفس الأماكن لفترة طويلة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أقوم في كثير من الأحيان بمقارنة وجهة نظري مع وجهات نظر الآخرين قبل اتخاذ القرار.",
      b: "أنا أعمل بنفس الطريقة في أغلب الأحيان"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "غالبا ما يكون لدي حدس حول ما يجب القيام به أو عدم القيام به.",
      b: "أنا أهتم بالتفاصيل"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أهرب من الروتين.",
      b: "لا شيء جدي في النهاية"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عندما أعمل، أحب أن يكون لدي إرشادات.",
      b: "عندما لا تسير الأمور على ما يرام، لا أظهر أي شيء"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "يقال لي في كثير من الأحيان أنني أمتلك مزاج القائد.",
      b: "أنا أعتمد في المقام الأول على مشاعري"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عندما يتوجب علي أن أعبر عن نفسي، أزن كلماتي.",
      b: "أحب التبديل من نشاط إلى آخر في كثير من الأحيان"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "من المهم بالنسبة لي أن أعرف كيف يرى الآخرون العالم.",
      b: "لا أستطيع العمل في بيئة فوضوية أو صاخبة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أسأل الآخرين بانتظام عن آرائهم.",
      b: "أنا مراقب جداً"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أشعر في كثير من الأحيان بأشياء دون أن أكون قادرًا على تفسيرها حقًا.",
      b: "سأهبط دائمًا على قدمي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا رجل كل المهن.",
      b: "أعرف كيف أتحمل هذا الأمر بنفسي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا أخبر الآخرين بسهولة بما يجب عليهم فعله.",
      b: "أحب أن أغير بيئتي في كثير من الأحيان"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستطيع بسهولة كسب ثقة الآخرين.",
      b: "التصنيف يساعدني على تصفية ذهني"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أقوم بالتبادل والمشاركة مع الآخرين في كثير من الأحيان.",
      b: "لا أستطيع أن أتحمل العمل غير الدقيق"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب أن يكون لدي آراء تختلف عن آرائي قبل اتخاذ القرار.",
      b: "لا تقلق"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "في كثير من الأحيان، أشعر أن لدي الإجابة الصحيحة لمشكلة ما، حتى لو كان المنطق الكامن وراء ذلك يهرب مني.",
      b: "أنا أثق في الغالب بالأشخاص المقربين مني"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا مرتاح في منصب القائد.",
      b: "أحتاج إلى ترتيب الأمور"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أعرف كيف أغوي الآخرين بكلامى.",
      b: "أنتبه إلى التفاصيل التي لا يراها الآخرون"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "نادرا ما أحكم على الآخرين.",
      b: "أتوقع أن أعيش حياة جيدة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أتجنب اتخاذ القرارات بمفردي.",
      b: "لدي حديقتي السرية الصغيرة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عندما أتحدث، يتم الاستماع إلي!",
      b: "أقوم دائمًا بفحص عملي قبل إرساله"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أتأكد من أن الآخرين لديهم انطباع جيد عني.",
      b: "أنا أؤمن بنجمي المحظوظ"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أعتقد أن جميع الآراء يمكن الدفاع عنها.",
      b: "لا أحب أن أكشف عن نفسي مباشرة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب أن أتخذ القرارات للمجموعة.",
      b: "أرى الحياة من خلال نظارات وردية اللون"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا أتمكن بسهولة من جعل نفسي موضع تقدير.",
      b: "أنا متواضعة إلى حد ما"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أفعل كل شيء لأكون في مركز الاهتمام.",
      b: "أنا أحافظ على هدوئي"
    }
  ];

  // Cognitive abilities test questions (اختبار القدرات الفكرية)
  const cognitiveQuestions = [
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستمتع بحل الألغاز والتحديات العقلية",
      b: "أجد سهولة في التفاعل مع أشخاص مختلفين عني"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب مقارنة أفكاري بتحليلات الآخرين",
      b: "أفضل الوصول إلى نتيجة عبر نقاش جماعي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عند مواجهة مشكلة، أعتمد على قدرتي على التحليل المنطقي",
      b: "أكثر ما يزعجني هو التردد وعدم الحسم"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب تنظيم المعلومات بشكل مرتب ومنهجي",
      b: "أفضل إنجاز المهام خطوة بخطوة حتى النهاية"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنا متفائل بقدرتي على إيجاد حلول",
      b: "حتى في الظروف الصعبة، أحافظ على تركيزي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عند الحديث، أهتم بتحليل ردود فعل الآخرين",
      b: "غالبًا ما أشارك أفكاري وملاحظاتي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أؤمن أن التفكير الجماعي ينتج أفضل الحلول",
      b: "أعتقد أن أحيانًا الحدس يتفوق على المنطق"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستمتع بالأنشطة التي تحفّز الذهن",
      b: "أفضّل الروتين الذي يمنحني الاستقرار"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "لدي قدرة على ملاحظة التفاصيل الصغيرة",
      b: "لا أترك نفسي تنشغل بالقلق كثيرًا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "كثيرًا ما أتمكن من إقناع الآخرين بأفكاري",
      b: "أحب النقاش مع الجميع لاكتساب أفكار جديدة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أتكيف مع طريقة حديثي حسب مستوى الطرف الآخر",
      b: "غالبًا ما أستشير الآخرين قبل اتخاذ قرارات مهمة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أؤمن أن كل شخص يمكن أن يقدم فكرة جيدة",
      b: "أعتمد على إحساسي الداخلي أكثر من الحقائق أحيانًا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب إشراك الآخرين في القرارات الكبيرة",
      b: "أرى التغيير كفرصة لتطوير قدراتي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "يقال عني أنني أستخدم أساليب مبتكرة",
      b: "أعتمد أحيانًا على تكرار العادات نفسها"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستمتع بتجربة طرق جديدة لحل المشكلات",
      b: "لا تفوتني أي تفاصيل صغيرة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أنظم أفكاري بشكل منهجي",
      b: "أتعامل بهدوء دون قلق زائد"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أملك قدرة قوية على التركيز في التفاصيل",
      b: "لا أسمح لمشاكلي أن تظهر بسهولة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستطيع قيادة الآخرين نحو حل منطقي",
      b: "أحب سماع آراء متنوعة قبل اتخاذ القرار"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحاول دائمًا أن أجعل أفكاري واضحة للطرف الآخر",
      b: "أعتمد كثيرًا على الحدس والشعور"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أؤمن أن لدى الجميع شيئًا مهمًا ليضيفه",
      b: "لا أحب البقاء في نفس الروتين طويلًا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أقارن وجهة نظري بوجهات نظر الآخرين قبل القرار",
      b: "أعمل عادة وفق نفس النمط العقلي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "لدي غالبًا حدس يساعدني على اختيار الصحيح",
      b: "أهتم بمراجعة التفاصيل بدقة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أبحث عن التغيير والهروب من الروتين",
      b: "أرى أن لا شيء يستحق القلق المفرط"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أفضل وجود قواعد أو إرشادات لعملي",
      b: "حتى لو تعقدت الأمور، أبقى متماسكًا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "يقال إن لدي شخصية قيادية",
      b: "أتبنى مشاعري أساسًا في اتخاذ القرارات"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أختار كلماتي بعناية عند التعبير",
      b: "أحب التنقل بين مهام مختلفة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "يهمني أن أفهم كيف يرى الآخرون الأمور",
      b: "لا أستطيع التركيز في جو فوضوي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أطرح أسئلة لأفهم آراء الآخرين بوضوح",
      b: "ألاحظ أشياء قد لا ينتبه لها الآخرون"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أشعر أحيانًا بأفكار لا أستطيع تفسيرها منطقيًا",
      b: "أستطيع دائمًا إيجاد مخرج مهما كان الوضع"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أعتبر نفسي متعدد المهارات",
      b: "أفضل الاعتماد على نفسي عند الحاجة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أعطي التوجيهات للآخرين بسهولة",
      b: "أحب التغيير وتجربة بيئات جديدة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أكسب ثقة الناس بسرعة",
      b: "يساعدني التصنيف على تنظيم ذهني"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب تبادل الأفكار والخبرات باستمرار",
      b: "لا أتحمل الأخطاء غير الدقيقة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أبحث عن آراء مختلفة قبل اتخاذ القرار",
      b: "أفضل التفكير بهدوء دون قلق"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحيانًا أعرف الحل الصحيح دون تفسير منطقي",
      b: "أثق غالبًا بآراء المقربين مني"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أشعر بالراحة في موقع القيادة",
      b: "أحتاج إلى تنظيم الأمور من حولي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستطيع إقناع الآخرين بأسلوبي",
      b: "ألاحظ تفاصيل لا يراها الآخرون"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "نادرًا ما أحكم على الآخرين",
      b: "أتوقع مستقبلًا مليئًا بالفرص"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أفضل القرارات المشتركة أكثر من الفردية",
      b: "أحتفظ دائمًا بأفكاري الخاصة لنفسي"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "عندما أتحدث، أنجح بجذب الانتباه",
      b: "أراجع دائمًا عملي قبل تسليمه"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أهتم بانطباع الآخرين عني",
      b: "أؤمن بالحظ الجيد أحيانًا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أرى أن لكل رأي جانب يمكن الدفاع عنه",
      b: "لا أحب الكشف عن ذاتي مباشرة"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أستمتع باتخاذ القرارات الجماعية",
      b: "أرى الأمور من زاوية إيجابية دائمًا"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أجعل نفسي محل تقدير بسهولة",
      b: "أفضل التحلي بالتواضع"
    },
    {
      q: "حدد العبارة التي تشبهك إلى حد كبير:",
      a: "أحب أن أكون في دائرة التركيز",
      b: "أبقى هادئًا مهما كانت الظروف"
    }
  ];

  // Emotional intelligence test questions (اختبار الذكاء العاطفي)
  const emotionalQuestions = [
    {
      q: "أنا أدرك بسرعة عندما أكون غاضبًا أو متوترًا.",
      a: "أنا أدرك بسرعة عندما أكون غاضبًا أو متوترًا.",
      b: "غالبًا ما أتمكن من الحفاظ على هدوئي حتى في المواقف الصعبة."
    },
    {
      q: "أهتم بمشاعر الآخرين وأحاول فهمها.",
      a: "أهتم بمشاعر الآخرين وأحاول فهمها.",
      b: "أفضّل التركيز على المنطق أكثر من العاطفة."
    },
    {
      q: "ألاحظ بسهولة التغيرات في نبرة صوت الآخرين أو تعابير وجوههم.",
      a: "ألاحظ بسهولة التغيرات في نبرة صوت الآخرين أو تعابير وجوههم.",
      b: "أركز أكثر على ما يقال بالكلمات لا على المشاعر خلفها."
    },
    {
      q: "عندما أتعرض للضغط، أحتاج إلى بعض الوقت لأستعيد هدوئي.",
      a: "عندما أتعرض للضغط، أحتاج إلى بعض الوقت لأستعيد هدوئي.",
      b: "أستطيع أن أتصرف بفعالية حتى وأنا تحت الضغط."
    },
    {
      q: "أعتبر نفسي شخصًا متفائلًا غالبًا.",
      a: "أعتبر نفسي شخصًا متفائلًا غالبًا.",
      b: "أفضل التركيز على الحقائق كما هي بدلًا من التفاؤل الزائد."
    },
    {
      q: "عندما أتكلم، أحاول أن أوصل رسالتي بشكل يراعي مشاعر الآخرين.",
      a: "عندما أتكلم، أحاول أن أوصل رسالتي بشكل يراعي مشاعر الآخرين.",
      b: "أتكلم بشكل مباشر دون التفكير كثيرًا في مشاعر الآخرين."
    },
    {
      q: "أشعر بالارتياح عندما أساعد الآخرين على حل مشاكلهم.",
      a: "أشعر بالارتياح عندما أساعد الآخرين على حل مشاكلهم.",
      b: "أفضل أن يواجه الآخرون مشاكلهم بأنفسهم."
    },
    {
      q: "من السهل بالنسبة لي تكوين صداقات جديدة.",
      a: "من السهل بالنسبة لي تكوين صداقات جديدة.",
      b: "أفضل العلاقات القليلة والعميقة على العلاقات الكثيرة."
    },
    {
      q: "أتعلم من أخطائي العاطفية بسرعة.",
      a: "أتعلم من أخطائي العاطفية بسرعة.",
      b: "أحتاج إلى وقت طويل لأتعلم من تجاربي العاطفية."
    },
    {
      q: "عندما أواجه صعوبة، أبحث عن حلول بنفسي أولًا.",
      a: "عندما أواجه صعوبة، أبحث عن حلول بنفسي أولًا.",
      b: "أفضل مشاركة مشاعري مع الآخرين عند مواجهة الصعوبات."
    },
    {
      q: "أتعرف على نقاط قوتي العاطفية بسهولة.",
      a: "أتعرف على نقاط قوتي العاطفية بسهولة.",
      b: "أحيانًا أجد صعوبة في فهم ما أشعر به."
    },
    {
      q: "أستطيع التحكم في غضبي قبل أن يظهر للآخرين.",
      a: "أستطيع التحكم في غضبي قبل أن يظهر للآخرين.",
      b: "أحيانًا تنكشف انفعالاتي بسرعة."
    },
    {
      q: "أحب أن أستمع للآخرين أكثر من التحدث عن نفسي.",
      a: "أحب أن أستمع للآخرين أكثر من التحدث عن نفسي.",
      b: "أفضل أن أشارك مشاعري مع من حولي."
    },
    {
      q: "ألاحظ عندما يكون شخص ما حزينًا حتى لو لم يقل ذلك.",
      a: "ألاحظ عندما يكون شخص ما حزينًا حتى لو لم يقل ذلك.",
      b: "لا أميز بسهولة مشاعر الآخرين المخفية."
    },
    {
      q: "أستطيع وصف مشاعري بدقة.",
      a: "أستطيع وصف مشاعري بدقة.",
      b: "أحيانًا أجد صعوبة في التعبير عن مشاعري."
    },
    {
      q: "عندما أتعرض لموقف صعب، أهدأ وأفكر قبل أن أتصرف.",
      a: "عندما أتعرض لموقف صعب، أهدأ وأفكر قبل أن أتصرف.",
      b: "أحيانًا أتصرف بسرعة تحت تأثير الانفعال."
    },
    {
      q: "أؤمن أن كل إنسان يمر بمشاعر تستحق التفهم.",
      a: "أؤمن أن كل إنسان يمر بمشاعر تستحق التفهم.",
      b: "أركز أكثر على أفعاله من مشاعره."
    },
    {
      q: "أتمكن من تهدئة نفسي بسرعة بعد أي انفعال.",
      a: "أتمكن من تهدئة نفسي بسرعة بعد أي انفعال.",
      b: "أحتاج وقتًا طويلًا لأستعيد هدوئي."
    },
    {
      q: "أجد متعة في مساعدة الآخرين على الشعور بالتحسن.",
      a: "أجد متعة في مساعدة الآخرين على الشعور بالتحسن.",
      b: "أفضل ترك الآخرين يتعاملون مع مشاعرهم بأنفسهم."
    },
    {
      q: "أستطيع أن أبقى متفائلًا رغم الصعوبات.",
      a: "أستطيع أن أبقى متفائلًا رغم الصعوبات.",
      b: "أحيانًا أستسلم بسهولة أمام الإحباط."
    },
    {
      q: "ألاحظ نبرة صوت الآخرين لأفهم حالتهم النفسية.",
      a: "ألاحظ نبرة صوت الآخرين لأفهم حالتهم النفسية.",
      b: "أركز فقط على ما يقولونه بالكلمات."
    },
    {
      q: "أستطيع التفكير بهدوء حتى وأنا تحت ضغط.",
      a: "أستطيع التفكير بهدوء حتى وأنا تحت ضغط.",
      b: "الضغوط تؤثر في قدرتي على التركيز."
    },
    {
      q: "أحب الاستماع إلى مشاكل الآخرين.",
      a: "أحب الاستماع إلى مشاكل الآخرين.",
      b: "أفضل أن أركز على مشاكلي الخاصة."
    },
    {
      q: "أتحكم في ردود أفعالي حتى لا أندم لاحقًا.",
      a: "أتحكم في ردود أفعالي حتى لا أندم لاحقًا.",
      b: "أحيانًا أندفع برد فعل سريع."
    },
    {
      q: "أتعاطف بسهولة مع قصص وتجارب الآخرين.",
      a: "أتعاطف بسهولة مع قصص وتجارب الآخرين.",
      b: "أركز على تقديم حلول أكثر من مشاركة المشاعر."
    },
    {
      q: "أتمكن من كسب ثقة الآخرين بسرعة.",
      a: "أتمكن من كسب ثقة الآخرين بسرعة.",
      b: "أحتاج وقتًا طويلًا لبناء الثقة مع الناس."
    },
    {
      q: "أستطيع قراءة لغة الجسد بسهولة.",
      a: "أستطيع قراءة لغة الجسد بسهولة.",
      b: "أركز أكثر على الكلمات المنطوقة فقط."
    },
    {
      q: "أواجه المواقف الصعبة بإيجابية.",
      a: "أواجه المواقف الصعبة بإيجابية.",
      b: "أشعر أن الصعوبات تعيق تقدمي."
    },
    {
      q: "أقدر على وضع نفسي مكان الآخرين.",
      a: "أقدر على وضع نفسي مكان الآخرين.",
      b: "أجد صعوبة في رؤية الأمور من منظور الآخرين."
    },
    {
      q: "أتمكن من التحكم في أعصابي في النقاشات الحادة.",
      a: "أتمكن من التحكم في أعصابي في النقاشات الحادة.",
      b: "أحيانًا أفقد أعصابي بسرعة."
    },
    {
      q: "أحب تكوين صداقات جديدة باستمرار.",
      a: "أحب تكوين صداقات جديدة باستمرار.",
      b: "أتمسك بدائرة صغيرة من الأصدقاء."
    },
    {
      q: "أتعلم بسرعة من تجاربي العاطفية.",
      a: "أتعلم بسرعة من تجاربي العاطفية.",
      b: "أحتاج وقتًا طويلًا لاستيعاب دروسي العاطفية."
    },
    {
      q: "أشعر بالمسؤولية تجاه مشاعر الآخرين.",
      a: "أشعر بالمسؤولية تجاه مشاعر الآخرين.",
      b: "أعتبر أن كل شخص مسؤول عن مشاعره بنفسه."
    },
    {
      q: "أتمكن من تحفيز نفسي حتى في الظروف الصعبة.",
      a: "أتمكن من تحفيز نفسي حتى في الظروف الصعبة.",
      b: "أحتاج دعم الآخرين كي أستمر."
    },
    {
      q: "أحب مشاركة نجاحاتي مع الآخرين.",
      a: "أحب مشاركة نجاحاتي مع الآخرين.",
      b: "أفضل أن أحتفل بنجاحي بشكل شخصي."
    },
    {
      q: "أتعامل مع الفشل كفرصة للتعلم.",
      a: "أتعامل مع الفشل كفرصة للتعلم.",
      b: "أشعر بالإحباط بسرعة عند الفشل."
    },
    {
      q: "أستطيع الاستماع باهتمام دون مقاطعة.",
      a: "أستطيع الاستماع باهتمام دون مقاطعة.",
      b: "أحيانًا أقاطع الآخرين بحماسة."
    },
    {
      q: "أواجه النقد بروح رياضية.",
      a: "أواجه النقد بروح رياضية.",
      b: "أشعر بالانزعاج عند النقد."
    },
    {
      q: "أرى أن العلاقات الإنسانية أهم من الإنجازات.",
      a: "أرى أن العلاقات الإنسانية أهم من الإنجازات.",
      b: "أفضل التركيز على الأهداف أكثر من العلاقات."
    },
    {
      q: "أتمكن من ضبط نفسي أمام الاستفزاز.",
      a: "أتمكن من ضبط نفسي أمام الاستفزاز.",
      b: "أحيانًا أستجيب بسرعة للاستفزاز."
    },
    {
      q: "أؤمن أن المشاعر تقود قرارات مهمة.",
      a: "أؤمن أن المشاعر تقود قرارات مهمة.",
      b: "أؤمن أن المنطق وحده يكفي لاتخاذ القرارات."
    },
    {
      q: "أحب أن أكون داعمًا عاطفيًا لأصدقائي.",
      a: "أحب أن أكون داعمًا عاطفيًا لأصدقائي.",
      b: "أفضّل تقديم النصائح العملية أكثر من الدعم العاطفي."
    },
    {
      q: "أحتفظ بهدوئي حتى في الأزمات الكبرى.",
      a: "أحتفظ بهدوئي حتى في الأزمات الكبرى.",
      b: "أشعر بالتوتر بسرعة عند الأزمات."
    },
    {
      q: "أتمكن من رفع معنوياتي بنفسي.",
      a: "أتمكن من رفع معنوياتي بنفسي.",
      b: "أحتاج من يشجعني باستمرار."
    },
    {
      q: "أستطيع تكوين علاقات إيجابية بسهولة.",
      a: "أستطيع تكوين علاقات إيجابية بسهولة.",
      b: "أفضل العزلة في كثير من الأحيان."
    }
  ];

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto calculate results
            setIsTimerRunning(false);
            clearInterval(interval);
            calculateScores();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isTimerRunning, timeLeft]);

  // Reset timer when modal opens
  useEffect(() => {
    if (showInclinationModal && !showResults) {
      setTimeLeft(360);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }
  }, [showInclinationModal, showResults]);

  const loadStudents = async () => {
    const loadedStudents = await getStudents();
    setStudents(loadedStudents);
  };

  const handleScienceAnswer = (questionId: string, value: number) => {
    setScienceAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleArtsAnswer = (questionId: string, value: number) => {
    setArtsAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleScienceQ2Subject = (subject: string) => {
    setScienceQ2Subject(subject);
  };

  const handleArtsQ2Subject = (subject: string) => {
    setArtsQ2Subject(subject);
  };

  const handleScienceQ5Subject = (subject: string) => {
    setScienceQ5Subject(subject);
  };

  const handleScienceQ9Subject = (subject: string) => {
    setScienceQ9Subject(subject);
  };

  const handleArtsQ5Subject = (subject: string) => {
    setArtsQ5Subject(subject);
  };

  const handleArtsQ9Subject = (subject: string) => {
    setArtsQ9Subject(subject);
  };

  const handleRepPersonalInfoChange = (field: string, value: string) => {
    setRepPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Personality test handlers
  const handlePersonalityAnswer = (questionIndex: number, answer: 'a' | 'b') => {
    setPersonalityAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handlePersonalityPersonalInfoChange = (field: string, value: string) => {
    setPersonalityPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Professional orientation test handlers
  const handleProfessionalAnswer = (questionIndex: number, answer: 'a' | 'b') => {
    setProfessionalAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleProfessionalPersonalInfoChange = (field: string, value: string) => {
    setProfessionalPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Cognitive abilities test handlers
  const handleCognitiveAnswer = (questionIndex: number, answer: 'a' | 'b') => {
    setCognitiveAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleCognitivePersonalInfoChange = (field: string, value: string) => {
    setCognitivePersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Emotional intelligence test handlers
  const handleEmotionalAnswer = (questionIndex: number, answer: 'a' | 'b') => {
    setEmotionalAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleEmotionalPersonalInfoChange = (field: string, value: string) => {
    setEmotionalPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const calculatePersonalityResults = () => {
    // Big Five personality traits scoring
    let extroversion = 0;
    let agreeableness = 0;
    let conscientiousness = 0;
    let neuroticism = 0;
    let openness = 0;

    // Question mapping to traits (simplified Big Five model)
    const traitMapping = [
      { q: 0, a: 'extroversion', b: 'agreeableness' },
      { q: 1, a: 'agreeableness', b: 'agreeableness' },
      { q: 2, a: 'openness', b: 'conscientiousness' },
      { q: 3, a: 'conscientiousness', b: 'conscientiousness' },
      { q: 4, a: 'openness', b: 'neuroticism' },
      { q: 5, a: 'agreeableness', b: 'extroversion' },
      { q: 6, a: 'agreeableness', b: 'openness' },
      { q: 7, a: 'openness', b: 'conscientiousness' },
      { q: 8, a: 'conscientiousness', b: 'neuroticism' },
      { q: 9, a: 'extroversion', b: 'extroversion' },
      { q: 10, a: 'agreeableness', b: 'agreeableness' },
      { q: 11, a: 'agreeableness', b: 'openness' },
      { q: 12, a: 'agreeableness', b: 'openness' },
      { q: 13, a: 'openness', b: 'conscientiousness' },
      { q: 14, a: 'openness', b: 'conscientiousness' },
      { q: 15, a: 'conscientiousness', b: 'neuroticism' },
      { q: 16, a: 'conscientiousness', b: 'neuroticism' },
      { q: 17, a: 'extroversion', b: 'agreeableness' },
      { q: 18, a: 'agreeableness', b: 'openness' },
      { q: 19, a: 'agreeableness', b: 'openness' },
      { q: 20, a: 'agreeableness', b: 'conscientiousness' },
      { q: 21, a: 'openness', b: 'conscientiousness' },
      { q: 22, a: 'openness', b: 'neuroticism' },
      { q: 23, a: 'conscientiousness', b: 'neuroticism' },
      { q: 24, a: 'extroversion', b: 'openness' },
      { q: 25, a: 'agreeableness', b: 'openness' },
      { q: 26, a: 'agreeableness', b: 'conscientiousness' },
      { q: 27, a: 'agreeableness', b: 'conscientiousness' },
      { q: 28, a: 'openness', b: 'neuroticism' },
      { q: 29, a: 'openness', b: 'neuroticism' },
      { q: 30, a: 'extroversion', b: 'conscientiousness' },
      { q: 31, a: 'extroversion', b: 'openness' },
      { q: 32, a: 'agreeableness', b: 'conscientiousness' },
      { q: 33, a: 'agreeableness', b: 'conscientiousness' },
      { q: 34, a: 'agreeableness', b: 'neuroticism' },
      { q: 35, a: 'openness', b: 'agreeableness' },
      { q: 36, a: 'extroversion', b: 'conscientiousness' },
      { q: 37, a: 'extroversion', b: 'conscientiousness' },
      { q: 38, a: 'agreeableness', b: 'openness' },
      { q: 39, a: 'agreeableness', b: 'openness' },
      { q: 40, a: 'extroversion', b: 'conscientiousness' },
      { q: 41, a: 'extroversion', b: 'openness' },
      { q: 42, a: 'agreeableness', b: 'neuroticism' },
      { q: 43, a: 'extroversion', b: 'openness' },
      { q: 44, a: 'extroversion', b: 'neuroticism' }
    ];

    traitMapping.forEach(({ q, a, b }) => {
      const answer = personalityAnswers[q];
      if (answer === 'a') {
        switch (a) {
          case 'extroversion': extroversion++; break;
          case 'agreeableness': agreeableness++; break;
          case 'conscientiousness': conscientiousness++; break;
          case 'neuroticism': neuroticism++; break;
          case 'openness': openness++; break;
        }
      } else if (answer === 'b') {
        switch (b) {
          case 'extroversion': extroversion++; break;
          case 'agreeableness': agreeableness++; break;
          case 'conscientiousness': conscientiousness++; break;
          case 'neuroticism': neuroticism++; break;
          case 'openness': openness++; break;
        }
      }
    });

    // Convert to percentages
    const totalQuestions = 45;
    const extroversionPct = Math.round((extroversion / totalQuestions) * 100);
    const agreeablenessPct = Math.round((agreeableness / totalQuestions) * 100);
    const conscientiousnessPct = Math.round((conscientiousness / totalQuestions) * 100);
    const neuroticismPct = Math.round((neuroticism / totalQuestions) * 100);
    const opennessPct = Math.round((openness / totalQuestions) * 100);

    // Find dominant trait
    const traits = [
      { name: 'الانبساطية', value: extroversionPct, key: 'extroversion' },
      { name: 'الموافقة', value: agreeablenessPct, key: 'agreeableness' },
      { name: 'الضمير الحي', value: conscientiousnessPct, key: 'conscientiousness' },
      { name: 'العصابية', value: neuroticismPct, key: 'neuroticism' },
      { name: 'الانفتاح', value: opennessPct, key: 'openness' }
    ];

    const dominantTrait = traits.reduce((max, trait) => 
      trait.value > max.value ? trait : max
    );

    // Generate description based on dominant trait
    let description = '';
    switch (dominantTrait.key) {
      case 'extroversion':
        description = 'أنت شخص منبسط تحب التفاعل الاجتماعي وتشعر بالطاقة في وجود الآخرين. تفضل العمل في مجموعات وتستمتع بالأنشطة الاجتماعية.';
        break;
      case 'agreeableness':
        description = 'أنت شخص متعاون ومتفهم، تحب مساعدة الآخرين وتجنب الصراعات. لديك قدرة عالية على التعاطف والتفهم.';
        break;
      case 'conscientiousness':
        description = 'أنت شخص منظم ومسؤول، تحب التخطيط والتنظيم. تلتزم بالمواعيد وتحب إنجاز المهام بدقة.';
        break;
      case 'neuroticism':
        description = 'أنت شخص حساس للمشاعر والتوتر، قد تشعر بالقلق أحياناً ولكن هذا يجعلك أكثر وعياً بمشاعرك ومشاعر الآخرين.';
        break;
      case 'openness':
        description = 'أنت شخص مبدع ومحب للاستكشاف، تحب تجربة أشياء جديدة وتفكر بطريقة إبداعية. تستمتع بالفنون والثقافة.';
        break;
    }

    setPersonalityResults({
      extroversion: extroversionPct,
      agreeableness: agreeablenessPct,
      conscientiousness: conscientiousnessPct,
      neuroticism: neuroticismPct,
      openness: opennessPct,
      dominantTrait: dominantTrait.name,
      description
    });
  };

  const savePersonalityResult = async () => {
    if (!personalitySelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setPersonalitySaving(true);
      const answers = Object.entries(personalityAnswers).map(([idx, ans]) => ({
        questionId: `personality_${idx}`,
        answer: ans || '',
        isCorrect: false
      }));
      await submitTestResult(
        'personality_test',
        personalitySelectedStudent,
        answers as any,
        personalityResults ? Math.max(...Object.values(personalityResults).slice(0, 5) as number[]) : 0
      );
      alert('تم حفظ النتيجة بنجاح');
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setPersonalitySaving(false);
    }
  };

  const exportPersonalityPDF = async () => {
    if (!personalityResults) return;
    
    try {
      const student = students.find(s => s.id === personalitySelectedStudent);
      const studentName = student ? `${student.firstName} ${student.lastName}` : `${personalityPersonalInfo.name} ${personalityPersonalInfo.surname}`;
      
      // Create HTML content for PDF
      const htmlContent = `
        <div id="personality-pdf-content" style="
          font-family: 'Amiri', 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          padding: 15px;
          background: white;
          color: black;
          line-height: 1.5;
          width: 794px;
          min-height: 1123px;
        ">
          <!-- Header -->
          <div style="margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 15px;">
            <!-- National Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 18px; font-weight: bold; color: #000; text-decoration: underline; margin-bottom: 12px;">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 12px;">
                وزارة التربية الوطنية
              </div>
            </div>
            
            <!-- Main Header Content -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; direction: rtl;">
              <!-- Left Side: directorate -->
              <div style="text-align: right; direction: rtl; flex: 1;">
                <div style="font-size: 16px; font-weight: bold; color: #000; white-space: nowrap;">
                  مديرية التربية لولاية ${repPersonalInfo.wilaya || 'مستغانم'}
                </div>
                <div style="font-size: 14px; color: #000; margin-top: 4px; direction: rtl; text-align: right; white-space: nowrap;">
                  <span style="font-weight: bold;">نوع المؤسسة :</span>
                  <span style="text-decoration: underline;">${currentCycle === 'ثانوي' ? 'ثانوية' : 'متوسطة'}</span>
                </div>
                <div style="font-size: 14px; color: #000; margin-top: 6px; direction: rtl; text-align: right; white-space: nowrap;">
                  <span style="font-weight: bold;">مستشار التوجيه :</span> 
                  <span style="text-decoration: underline;">${personalityPersonalInfo.name || 'غير محدد'} ${personalityPersonalInfo.surname || ''}</span>
                </div>
              </div>
              
              <!-- Right Side: center name and details -->
              <div style="text-align: right; direction: rtl; flex: 1;">
                <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 10px; white-space: nowrap;">
                  مركز التوجيه و الإرشاد المدرسي و المهني
                </div>
              </div>
            </div>
            
            <!-- Report Title -->
            <div style="text-align: center; margin-top: 20px;">
              <h1 style="color: #2c5aa0; margin: 0; font-size: 20px; border: 2px solid #2c5aa0; padding: 10px; border-radius: 8px; background: #f0f9ff; display: flex; align-items: center; justify-content: center;">
                تقرير اختبار التوجه الشخصي
              </h1>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; border-bottom: 2px solid #2c5aa0; padding-bottom: 15px;">
            <h3 style="color: #2c5aa0; margin-bottom: 10px;">معلومات التلميذ</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1; margin-left: 20px;">
                <p><strong>الاسم واللقب:</strong> ${studentName}</p>
                <p><strong>المستوى:</strong> ${student?.level || personalityPersonalInfo.section || ''}</p>
                <p><strong>الفوج:</strong> ${student?.group || ''}</p>
              </div>
              <div style="flex: 1; margin-right: 20px;">
                <p><strong>نوع المؤسسة:</strong> ${currentCycle === 'ثانوي' ? 'ثانوية' : 'متوسطة'}</p>
                <p><strong>السنة الدراسية:</strong> ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</p>
                <p><strong>تاريخ الإجراء:</strong> ${personalityPersonalInfo.date || new Date().toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c5aa0; margin-bottom: 15px;">النتائج</h3>
            
            <!-- Bar Chart -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #374151; margin-bottom: 10px; text-align: center; font-size: 16px;">مخطط الأعمدة - السمات الشخصية</h4>
              <div style="display: flex; align-items: end; justify-content: center; height: 140px; border: 1px solid #e5e7eb; padding: 15px; background: #f9fafb;">
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 8px;">
                  <div style="width: 40px; background: linear-gradient(to top, #3b82f6, #60a5fa); height: ${(personalityResults.extroversion / 100) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #1e40af; font-size: 12px;">${personalityResults.extroversion}%</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #1e40af; font-size: 10px;">انبساطية</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 8px;">
                  <div style="width: 40px; background: linear-gradient(to top, #f59e0b, #fbbf24); height: ${(personalityResults.agreeableness / 100) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #d97706; font-size: 12px;">${personalityResults.agreeableness}%</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #d97706; font-size: 10px;">موافقة</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 8px;">
                  <div style="width: 40px; background: linear-gradient(to top, #10b981, #34d399); height: ${(personalityResults.conscientiousness / 100) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #059669; font-size: 12px;">${personalityResults.conscientiousness}%</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #059669; font-size: 10px;">ضمير</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 8px;">
                  <div style="width: 40px; background: linear-gradient(to top, #ef4444, #f87171); height: ${(personalityResults.neuroticism / 100) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #dc2626; font-size: 12px;">${personalityResults.neuroticism}%</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #dc2626; font-size: 10px;">عصابية</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 8px;">
                  <div style="width: 40px; background: linear-gradient(to top, #8b5cf6, #a78bfa); height: ${(personalityResults.openness / 100) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #7c3aed; font-size: 12px;">${personalityResults.openness}%</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #7c3aed; font-size: 10px;">انفتاح</div>
                </div>
              </div>
            </div>
            
            <!-- Results Cards -->
            <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
              <div style="text-align: center; padding: 15px; border: 2px solid #3b82f6; border-radius: 8px; background: linear-gradient(135deg, #eff6ff, #dbeafe); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">👥</div>
                <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">الانبساطية</h4>
                <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${personalityResults.extroversion}%</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 2px solid #f59e0b; border-radius: 8px; background: linear-gradient(135deg, #fffbeb, #fef3c7); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">🤝</div>
                <h4 style="color: #d97706; margin: 0 0 8px 0; font-size: 14px;">الموافقة</h4>
                <div style="font-size: 20px; font-weight: bold; color: #d97706;">${personalityResults.agreeableness}%</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 2px solid #10b981; border-radius: 8px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
                <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 14px;">الضمير الحي</h4>
                <div style="font-size: 20px; font-weight: bold; color: #059669;">${personalityResults.conscientiousness}%</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 2px solid #ef4444; border-radius: 8px; background: linear-gradient(135deg, #fef2f2, #fecaca); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">😰</div>
                <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 14px;">العصابية</h4>
                <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${personalityResults.neuroticism}%</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 2px solid #8b5cf6; border-radius: 8px; background: linear-gradient(135deg, #faf5ff, #e9d5ff); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">🎨</div>
                <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 14px;">الانفتاح</h4>
                <div style="font-size: 20px; font-weight: bold; color: #7c3aed;">${personalityResults.openness}%</div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 8px; border-right: 4px solid #2c5aa0;">
            <h3 style="color: #2c5aa0; margin-bottom: 10px; font-size: 16px;">🎯 الصفة المهيمنة</h3>
            <p style="font-size: 18px; font-weight: bold; color: #1f2937; text-align: center; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${personalityResults.dominantTrait}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <h3 style="color: #2c5aa0; margin-bottom: 10px; font-size: 16px;">💡 الوصف الشخصي</h3>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 8px; border-right: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 14px; line-height: 1.6; color: #92400e; margin: 0;">
                ${personalityResults.description}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: center;">
            <div style="font-size: 12px; color: #6b7280;">
              تم إنشاء هذا التقرير في ${new Date().toLocaleDateString('ar-SA')} - نظام إدارة التوجيه المدرسي
            </div>
          </div>
        </div>
      `;
      
      // Create temporary element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      document.body.appendChild(tempDiv);
      
      // Wait for fonts to load
      try {
        const fonts = (document as any).fonts;
        if (fonts?.ready) {
          await fonts.ready;
        }
      } catch (_) {}
      
      // Capture with html2canvas
      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123
      });
      
      // Remove temporary element
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Save PDF
      const fileName = `personality_test_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Show success message
      alert('تم إنشاء ملف PDF بنجاح!');
    } catch (error: unknown) {
      console.error('خطأ في إنشاء ملف PDF:', error);
      alert(`حدث خطأ أثناء إنشاء ملف PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  // Professional orientation test functions
  const calculateProfessionalResults = () => {
    // Professional orientation traits scoring
    let leadership = 0;
    let teamwork = 0;
    let creativity = 0;
    let organization = 0;
    let communication = 0;

    // Question mapping to professional traits
    const traitMapping = [
      { q: 0, a: 'leadership', b: 'teamwork' },
      { q: 1, a: 'teamwork', b: 'teamwork' },
      { q: 2, a: 'creativity', b: 'leadership' },
      { q: 3, a: 'organization', b: 'organization' },
      { q: 4, a: 'creativity', b: 'organization' },
      { q: 5, a: 'communication', b: 'communication' },
      { q: 6, a: 'teamwork', b: 'creativity' },
      { q: 7, a: 'creativity', b: 'organization' },
      { q: 8, a: 'organization', b: 'creativity' },
      { q: 9, a: 'leadership', b: 'communication' },
      { q: 10, a: 'communication', b: 'teamwork' },
      { q: 11, a: 'teamwork', b: 'creativity' },
      { q: 12, a: 'teamwork', b: 'creativity' },
      { q: 13, a: 'creativity', b: 'organization' },
      { q: 14, a: 'creativity', b: 'organization' },
      { q: 15, a: 'organization', b: 'creativity' },
      { q: 16, a: 'organization', b: 'creativity' },
      { q: 17, a: 'leadership', b: 'teamwork' },
      { q: 18, a: 'teamwork', b: 'creativity' },
      { q: 19, a: 'teamwork', b: 'creativity' },
      { q: 20, a: 'teamwork', b: 'organization' },
      { q: 21, a: 'creativity', b: 'organization' },
      { q: 22, a: 'creativity', b: 'organization' },
      { q: 23, a: 'creativity', b: 'organization' },
      { q: 24, a: 'organization', b: 'creativity' },
      { q: 25, a: 'leadership', b: 'creativity' },
      { q: 26, a: 'communication', b: 'creativity' },
      { q: 27, a: 'communication', b: 'organization' },
      { q: 28, a: 'teamwork', b: 'organization' },
      { q: 29, a: 'creativity', b: 'leadership' },
      { q: 30, a: 'creativity', b: 'leadership' },
      { q: 31, a: 'leadership', b: 'creativity' },
      { q: 32, a: 'communication', b: 'organization' },
      { q: 33, a: 'teamwork', b: 'organization' },
      { q: 34, a: 'teamwork', b: 'creativity' },
      { q: 35, a: 'creativity', b: 'teamwork' },
      { q: 36, a: 'leadership', b: 'organization' },
      { q: 37, a: 'communication', b: 'organization' },
      { q: 38, a: 'teamwork', b: 'creativity' },
      { q: 39, a: 'teamwork', b: 'creativity' },
      { q: 40, a: 'leadership', b: 'organization' },
      { q: 41, a: 'communication', b: 'creativity' },
      { q: 42, a: 'teamwork', b: 'creativity' },
      { q: 43, a: 'leadership', b: 'creativity' },
      { q: 44, a: 'communication', b: 'teamwork' },
      { q: 45, a: 'leadership', b: 'organization' }
    ];

    // Calculate scores
    Object.entries(professionalAnswers).forEach(([questionIndex, answer]) => {
      if (answer) {
        const mapping = traitMapping[parseInt(questionIndex)];
        if (mapping) {
          if (answer === 'a') {
            (mapping as any)[mapping.a]++;
          } else if (answer === 'b') {
            (mapping as any)[mapping.b]++;
          }
        }
      }
    });

    // Calculate percentages
    const totalQuestions = Object.keys(professionalAnswers).length;
    const leadershipPct = Math.round((leadership / totalQuestions) * 100);
    const teamworkPct = Math.round((teamwork / totalQuestions) * 100);
    const creativityPct = Math.round((creativity / totalQuestions) * 100);
    const organizationPct = Math.round((organization / totalQuestions) * 100);
    const communicationPct = Math.round((communication / totalQuestions) * 100);

    // Find dominant orientation
    const orientations = [
      { name: 'القيادة', value: leadershipPct },
      { name: 'العمل الجماعي', value: teamworkPct },
      { name: 'الإبداع', value: creativityPct },
      { name: 'التنظيم', value: organizationPct },
      { name: 'التواصل', value: communicationPct }
    ];

    const dominantOrientation = orientations.reduce((max, current) => 
      current.value > max.value ? current : max
    );

    // Generate description based on dominant orientation
    let description = '';
    switch (dominantOrientation.name) {
      case 'القيادة':
        description = 'أنت شخص قيادي بطبعك، تحب أن تكون في المقدمة وتتولى المسؤولية. لديك قدرة على توجيه الآخرين واتخاذ القرارات الصعبة.';
        break;
      case 'العمل الجماعي':
        description = 'أنت شخص تعاوني تحب العمل مع الفريق. تستمتع بالتفاعل مع الآخرين وتقدير وجهات النظر المختلفة.';
        break;
      case 'الإبداع':
        description = 'أنت شخص مبدع تحب التجديد والابتكار. تستمتع بالتفكير خارج الصندوق وإيجاد حلول إبداعية للمشاكل.';
        break;
      case 'التنظيم':
        description = 'أنت شخص منظم ودقيق، تحب النظام والترتيب. تتفوق في المهام التي تتطلب الدقة والانتباه للتفاصيل.';
        break;
      case 'التواصل':
        description = 'أنت شخص اجتماعي ومتواصل، تحب التفاعل مع الآخرين. لديك قدرة على التعبير عن أفكارك بوضوح.';
        break;
    }

    setProfessionalResults({
      leadership: leadershipPct,
      teamwork: teamworkPct,
      creativity: creativityPct,
      organization: organizationPct,
      communication: communicationPct,
      dominantOrientation: dominantOrientation.name,
      description
    });
  };

  const saveProfessionalResult = async () => {
    if (!professionalSelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setProfessionalSaving(true);
      const answers = Object.entries(professionalAnswers).map(([idx, ans]) => ({
        questionId: `professional_${idx}`,
        answer: ans || '',
        isCorrect: false
      }));

      const result = {
        testType: 'professional_orientation',
        studentId: professionalSelectedStudent,
        answers,
        score: professionalResults ? Math.max(...Object.values(professionalResults).slice(0, 5) as number[]) : 0,
        personalInfo: professionalPersonalInfo,
        results: professionalResults
      };

      await submitTestResult('professional_orientation', professionalSelectedStudent, answers, result.score);
      alert('تم حفظ النتيجة بنجاح!');
      setShowProfessionalModal(false);
      setProfessionalAnswers({});
      setProfessionalResults(null);
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setProfessionalSaving(false);
    }
  };

  // Cognitive abilities test functions
  const calculateCognitiveResults = () => {
    // Cognitive abilities traits scoring
    let analytical = 0;
    let creative = 0;
    let social = 0;
    let leadership = 0;
    let detail = 0;

    // Question mapping to cognitive traits
    const traitMapping = [
      { q: 0, a: 'analytical', b: 'social' },
      { q: 1, a: 'analytical', b: 'social' },
      { q: 2, a: 'analytical', b: 'leadership' },
      { q: 3, a: 'analytical', b: 'detail' },
      { q: 4, a: 'creative', b: 'leadership' },
      { q: 5, a: 'social', b: 'social' },
      { q: 6, a: 'social', b: 'creative' },
      { q: 7, a: 'analytical', b: 'detail' },
      { q: 8, a: 'detail', b: 'leadership' },
      { q: 9, a: 'leadership', b: 'social' },
      { q: 10, a: 'social', b: 'social' },
      { q: 11, a: 'social', b: 'creative' },
      { q: 12, a: 'social', b: 'creative' },
      { q: 13, a: 'creative', b: 'detail' },
      { q: 14, a: 'creative', b: 'detail' },
      { q: 15, a: 'analytical', b: 'leadership' },
      { q: 16, a: 'detail', b: 'leadership' },
      { q: 17, a: 'leadership', b: 'social' },
      { q: 18, a: 'social', b: 'creative' },
      { q: 19, a: 'social', b: 'creative' },
      { q: 20, a: 'analytical', b: 'detail' },
      { q: 21, a: 'creative', b: 'detail' },
      { q: 22, a: 'creative', b: 'leadership' },
      { q: 23, a: 'analytical', b: 'leadership' },
      { q: 24, a: 'leadership', b: 'creative' },
      { q: 25, a: 'social', b: 'creative' },
      { q: 26, a: 'social', b: 'detail' },
      { q: 27, a: 'social', b: 'detail' },
      { q: 28, a: 'creative', b: 'leadership' },
      { q: 29, a: 'creative', b: 'leadership' },
      { q: 30, a: 'leadership', b: 'creative' },
      { q: 31, a: 'leadership', b: 'creative' },
      { q: 32, a: 'social', b: 'analytical' },
      { q: 33, a: 'social', b: 'detail' },
      { q: 34, a: 'social', b: 'leadership' },
      { q: 35, a: 'creative', b: 'social' },
      { q: 36, a: 'leadership', b: 'analytical' },
      { q: 37, a: 'leadership', b: 'detail' },
      { q: 38, a: 'social', b: 'creative' },
      { q: 39, a: 'social', b: 'creative' },
      { q: 40, a: 'leadership', b: 'detail' },
      { q: 41, a: 'leadership', b: 'creative' },
      { q: 42, a: 'social', b: 'leadership' },
      { q: 43, a: 'social', b: 'creative' },
      { q: 44, a: 'leadership', b: 'leadership' }
    ];

    traitMapping.forEach(({ q, a, b }) => {
      const answer = cognitiveAnswers[q];
      if (answer === 'a') {
        switch (a) {
          case 'analytical': analytical++; break;
          case 'creative': creative++; break;
          case 'social': social++; break;
          case 'leadership': leadership++; break;
          case 'detail': detail++; break;
        }
      } else if (answer === 'b') {
        switch (b) {
          case 'analytical': analytical++; break;
          case 'creative': creative++; break;
          case 'social': social++; break;
          case 'leadership': leadership++; break;
          case 'detail': detail++; break;
        }
      }
    });

    // Convert to percentages
    const totalQuestions = 45;
    const analyticalPct = Math.round((analytical / totalQuestions) * 100);
    const creativePct = Math.round((creative / totalQuestions) * 100);
    const socialPct = Math.round((social / totalQuestions) * 100);
    const leadershipPct = Math.round((leadership / totalQuestions) * 100);
    const detailPct = Math.round((detail / totalQuestions) * 100);

    // Find dominant profile
    const profiles = [
      { name: 'التحليلي', value: analyticalPct, key: 'analytical' },
      { name: 'الإبداعي', value: creativePct, key: 'creative' },
      { name: 'الاجتماعي', value: socialPct, key: 'social' },
      { name: 'القيادي', value: leadershipPct, key: 'leadership' },
      { name: 'المنظم', value: detailPct, key: 'detail' }
    ];

    const dominantProfile = profiles.reduce((max, profile) => 
      profile.value > max.value ? profile : max
    );

    // Generate description based on dominant profile
    let description = '';
    switch (dominantProfile.key) {
      case 'analytical':
        description = 'أنت شخص تحليلي تحب حل المشاكل المعقدة والتفكير المنطقي. لديك قدرة عالية على تحليل المعلومات واتخاذ القرارات المدروسة.';
        break;
      case 'creative':
        description = 'أنت شخص مبدع تحب التفكير خارج الصندوق وتجربة حلول جديدة. لديك خيال واسع وقدرة على الابتكار والإبداع.';
        break;
      case 'social':
        description = 'أنت شخص اجتماعي تحب التفاعل مع الآخرين والعمل في مجموعات. لديك مهارات تواصل ممتازة وقدرة على فهم الآخرين.';
        break;
      case 'leadership':
        description = 'أنت شخص قيادي تحب قيادة الآخرين واتخاذ القرارات المهمة. لديك ثقة بالنفس وقدرة على الإقناع والتوجيه.';
        break;
      case 'detail':
        description = 'أنت شخص منظم تحب التفاصيل والدقة في العمل. لديك قدرة عالية على التركيز وإنجاز المهام بدقة متناهية.';
        break;
    }

    setCognitiveResults({
      analytical: analyticalPct,
      creative: creativePct,
      social: socialPct,
      leadership: leadershipPct,
      detail: detailPct,
      dominantProfile: dominantProfile.name,
      description
    });
  };

  const saveCognitiveResult = async () => {
    if (!cognitiveSelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setCognitiveSaving(true);
      const answers = Object.entries(cognitiveAnswers).map(([idx, ans]) => ({
        questionId: `cognitive_${idx}`,
        answer: ans || '',
        isCorrect: false
      }));

      const result = {
        testType: 'cognitive_abilities',
        studentId: cognitiveSelectedStudent,
        answers,
        score: cognitiveResults ? Math.max(...Object.values(cognitiveResults).slice(0, 5) as number[]) : 0,
        personalInfo: cognitivePersonalInfo,
        results: cognitiveResults
      };

      await submitTestResult('cognitive_abilities', cognitiveSelectedStudent, answers, result.score);
      alert('تم حفظ النتيجة بنجاح!');
      setShowCognitiveModal(false);
      setCognitiveAnswers({});
      setCognitiveResults(null);
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setCognitiveSaving(false);
    }
  };

  // Emotional intelligence test functions
  const calculateEmotionalResults = () => {
    // Emotional intelligence traits scoring
    let selfAwareness = 0;
    let selfRegulation = 0;
    let empathy = 0;
    let socialSkills = 0;
    let motivation = 0;

    // Question mapping to emotional intelligence traits
    const traitMapping = [
      { q: 0, a: 'selfAwareness', b: 'selfRegulation' },
      { q: 1, a: 'empathy', b: 'selfAwareness' },
      { q: 2, a: 'empathy', b: 'selfAwareness' },
      { q: 3, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 4, a: 'motivation', b: 'selfAwareness' },
      { q: 5, a: 'socialSkills', b: 'selfAwareness' },
      { q: 6, a: 'empathy', b: 'selfAwareness' },
      { q: 7, a: 'socialSkills', b: 'socialSkills' },
      { q: 8, a: 'selfAwareness', b: 'selfAwareness' },
      { q: 9, a: 'selfRegulation', b: 'socialSkills' },
      { q: 10, a: 'selfAwareness', b: 'selfAwareness' },
      { q: 11, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 12, a: 'socialSkills', b: 'socialSkills' },
      { q: 13, a: 'empathy', b: 'empathy' },
      { q: 14, a: 'selfAwareness', b: 'selfAwareness' },
      { q: 15, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 16, a: 'empathy', b: 'selfAwareness' },
      { q: 17, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 18, a: 'empathy', b: 'selfAwareness' },
      { q: 19, a: 'motivation', b: 'motivation' },
      { q: 20, a: 'empathy', b: 'selfAwareness' },
      { q: 21, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 22, a: 'empathy', b: 'selfAwareness' },
      { q: 23, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 24, a: 'empathy', b: 'socialSkills' },
      { q: 25, a: 'socialSkills', b: 'socialSkills' },
      { q: 26, a: 'empathy', b: 'selfAwareness' },
      { q: 27, a: 'motivation', b: 'motivation' },
      { q: 28, a: 'empathy', b: 'selfAwareness' },
      { q: 29, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 30, a: 'socialSkills', b: 'socialSkills' },
      { q: 31, a: 'selfAwareness', b: 'selfAwareness' },
      { q: 32, a: 'empathy', b: 'selfAwareness' },
      { q: 33, a: 'motivation', b: 'motivation' },
      { q: 34, a: 'socialSkills', b: 'socialSkills' },
      { q: 35, a: 'motivation', b: 'motivation' },
      { q: 36, a: 'socialSkills', b: 'socialSkills' },
      { q: 37, a: 'empathy', b: 'selfAwareness' },
      { q: 38, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 39, a: 'socialSkills', b: 'motivation' },
      { q: 40, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 41, a: 'selfAwareness', b: 'selfAwareness' },
      { q: 42, a: 'empathy', b: 'socialSkills' },
      { q: 43, a: 'selfRegulation', b: 'selfRegulation' },
      { q: 44, a: 'motivation', b: 'motivation' }
    ];

    traitMapping.forEach(({ q, a, b }) => {
      const answer = emotionalAnswers[q];
      if (answer === 'a') {
        switch (a) {
          case 'selfAwareness': selfAwareness++; break;
          case 'selfRegulation': selfRegulation++; break;
          case 'empathy': empathy++; break;
          case 'socialSkills': socialSkills++; break;
          case 'motivation': motivation++; break;
        }
      } else if (answer === 'b') {
        switch (b) {
          case 'selfAwareness': selfAwareness++; break;
          case 'selfRegulation': selfRegulation++; break;
          case 'empathy': empathy++; break;
          case 'socialSkills': socialSkills++; break;
          case 'motivation': motivation++; break;
        }
      }
    });

    // Convert to percentages
    const totalQuestions = 45;
    const selfAwarenessPct = Math.round((selfAwareness / totalQuestions) * 100);
    const selfRegulationPct = Math.round((selfRegulation / totalQuestions) * 100);
    const empathyPct = Math.round((empathy / totalQuestions) * 100);
    const socialSkillsPct = Math.round((socialSkills / totalQuestions) * 100);
    const motivationPct = Math.round((motivation / totalQuestions) * 100);

    // Find dominant trait
    const traits = [
      { name: 'الوعي الذاتي', value: selfAwarenessPct, key: 'selfAwareness' },
      { name: 'ضبط النفس', value: selfRegulationPct, key: 'selfRegulation' },
      { name: 'التعاطف', value: empathyPct, key: 'empathy' },
      { name: 'المهارات الاجتماعية', value: socialSkillsPct, key: 'socialSkills' },
      { name: 'التحفيز الذاتي', value: motivationPct, key: 'motivation' }
    ];

    const dominantTrait = traits.reduce((max, trait) => 
      trait.value > max.value ? trait : max
    );

    // Generate description based on dominant trait
    let description = '';
    switch (dominantTrait.key) {
      case 'selfAwareness':
        description = 'أنت شخص واعٍ بمشاعرك وقادر على فهم حالتك النفسية. لديك قدرة عالية على التعرف على مشاعرك وتأثيرها على سلوكك.';
        break;
      case 'selfRegulation':
        description = 'أنت شخص قادر على التحكم في مشاعرك وانفعالاتك. لديك قدرة ممتازة على إدارة التوتر والضغط النفسي.';
        break;
      case 'empathy':
        description = 'أنت شخص متعاطف قادر على فهم مشاعر الآخرين. لديك قدرة عالية على وضع نفسك مكان الآخرين وفهم مشاعرهم.';
        break;
      case 'socialSkills':
        description = 'أنت شخص يتمتع بمهارات اجتماعية ممتازة. لديك قدرة عالية على بناء العلاقات والتواصل الفعال مع الآخرين.';
        break;
      case 'motivation':
        description = 'أنت شخص محفز ذاتياً قادر على تحفيز نفسك والآخرين. لديك قدرة عالية على الحفاظ على الإيجابية والتحفيز.';
        break;
    }

    setEmotionalResults({
      selfAwareness: selfAwarenessPct,
      selfRegulation: selfRegulationPct,
      empathy: empathyPct,
      socialSkills: socialSkillsPct,
      motivation: motivationPct,
      dominantTrait: dominantTrait.name,
      description
    });
  };

  const saveEmotionalResult = async () => {
    if (!emotionalSelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setEmotionalSaving(true);
      const answers = Object.entries(emotionalAnswers).map(([idx, ans]) => ({
        questionId: `emotional_${idx}`,
        answer: ans || '',
        isCorrect: false
      }));

      const result = {
        testType: 'emotional_intelligence',
        studentId: emotionalSelectedStudent,
        answers,
        score: emotionalResults ? Math.max(...Object.values(emotionalResults).slice(0, 5) as number[]) : 0,
        personalInfo: emotionalPersonalInfo,
        results: emotionalResults
      };

      await submitTestResult('emotional_intelligence', emotionalSelectedStudent, answers, result.score);
      alert('تم حفظ النتيجة بنجاح!');
      setShowEmotionalModal(false);
      setEmotionalAnswers({});
      setEmotionalResults(null);
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setEmotionalSaving(false);
    }
  };

  // NEW: ensure default ranks (3,2,1) per question
  const ensureDefaultRanks = (idx: number) => {
    setRepRanks(prev => {
      if (prev[idx]) return prev;
      return { ...prev, [idx]: { a: 3, b: 2, c: 1 } };
    });
  };

  // NEW: update rank and keep uniqueness (swap values if duplicate)
  const updateRank = (idx: number, key: 'a' | 'b' | 'c', value: number) => {
    setRepRanks(prev => {
      const current = prev[idx] || { a: 3, b: 2, c: 1 };
      const otherKey = (['a', 'b', 'c'] as const).find(k => k !== key && (current as any)[k] === value);
      const next = { ...current, [key]: value } as { a: number; b: number; c: number };
      if (otherKey) {
        const prevVal = (current as any)[key];
        (next as any)[otherKey] = prevVal;
      }
      const nextRanks = { ...prev, [idx]: next } as Record<number, { a: number; b: number; c: number }>;
      // Recalculate totals immediately from nextRanks to avoid stale sums
      let visual = 0, auditory = 0, kinesthetic = 0;
      repQuestions.forEach((_, qIdx) => {
        const r = nextRanks[qIdx] || { a: 3, b: 2, c: 1 };
        visual += r.a;
        auditory += r.b;
        kinesthetic += r.c;
      });
      setRepTotals({ visual, auditory, kinesthetic });
      return nextRanks;
    });
  };

  const computeRepTotals = () => {
    let visual = 0, auditory = 0, kinesthetic = 0;
    // CHANGED: sum ranks instead of counting choices
    repQuestions.forEach((_, idx) => {
      const r = repRanks[idx] || { a: 3, b: 2, c: 1 };
      visual += r.a;
      auditory += r.b;
      kinesthetic += r.c;
    });
    setRepTotals({ visual, auditory, kinesthetic });
  };

  const getCurrentSum = () => {
    let sum = 0;
    repQuestions.forEach((_, idx) => {
      const r = repRanks[idx];
      if (r) sum += r.a + r.b + r.c;
    });
    return sum;
  };
  const isTotalValid = () => getCurrentSum() === 60;

  const getRepDominant = () => {
    if (repTotals.visual >= repTotals.auditory && repTotals.visual >= repTotals.kinesthetic) return 'النظام البصري';
    if (repTotals.auditory >= repTotals.visual && repTotals.auditory >= repTotals.kinesthetic) return 'النظام السمعي';
    return 'النظام الحسي';
  };

  const getRepAdvice = () => {
    const dom = getRepDominant();
    if (dom === 'النظام البصري') {
      return 'يفضل المحتوى المرئي: مخططات، خرائط ذهنية، ألوان، تنظيم بصري للملخصات.';
    }
    if (dom === 'النظام السمعي') {
      return 'يفضل الشرح الشفهي: المناقشات، التسجيلات الصوتية، القراءة بصوت مرتفع.';
    }
    return 'يفضل التعلم بالممارسة: تجارب، أمثلة عملية، كتابة باليد، بطاقات ملموسة.';
  };

  const exportRepCSV = () => {
    const student = students.find(s => s.id === repSelectedStudent);
    const headers = ['StudentId','FirstName','LastName','Level','Group','Visual_A','Auditory_B','Kinesthetic_C','Dominant'];
    const dominant = getRepDominant();
    const row = [
      student?.studentId || '',
      student?.firstName || '',
      student?.lastName || '',
      student?.level || '',
      student?.group || '',
      String(repTotals.visual),
      String(repTotals.auditory),
      String(repTotals.kinesthetic),
      dominant
    ];
    const csv = [headers.join(','), row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'representational_styles_result.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportRepPDF = async () => {
    try {
      console.log('Starting PDF export with HTML capture...');
      
      // Calculate totals if not already calculated
      if (repTotals.visual === 0 && repTotals.auditory === 0 && repTotals.kinesthetic === 0) {
        console.log('Calculating totals...');
        computeRepTotals();
      }
      
      const student = students.find(s => s.id === repSelectedStudent);
      const dominant = getRepDominant();
      const total = repTotals.visual + repTotals.auditory + repTotals.kinesthetic;
      const pct = (n: number) => (total > 0 ? ((n/total)*100).toFixed(1) : '0.0');
      const studentName = student ? `${student.firstName} ${student.lastName}` : `${repPersonalInfo.name} ${repPersonalInfo.surname}`;
      const counselorName = (repPersonalInfo as any).counselorName || settings?.counselorName || 'غير محدد';
      const schoolType = repPersonalInfo.schoolType || (currentCycle === 'ثانوي' ? 'ثانوية' : 'متوسطة');
      const procedureDate = repPersonalInfo.date || new Date().toISOString().split('T')[0];
      const academicYear = (repPersonalInfo as any).academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      
      // Create HTML content for PDF with charts
      const htmlContent = `
        <div id="rep-pdf-content" style="
          font-family: 'Amiri', 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          padding: 15px;
          background: white;
          color: black;
          line-height: 1.5;
          width: 794px;
          min-height: 1123px;
        ">
          <!-- Header -->
          <div style="margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 15px; position: relative;">
            <!-- Centered National Header (top) -->
            <div style="text-align: center;">
              <div style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 8px;">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 8px;">
                وزارة التربية الوطنية
              </div>
            </div>

            <!-- Row: Left = Center name, Right = Directorate block -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 16px; direction: ltr;">
              <!-- Left side (extreme left): Center name -->
              <div style="text-align: left;">
                <div style="font-size: 16px; font-weight: bold; color: #000; white-space: nowrap;">
                  مركز التوجيه و الإرشاد المدرسي و المهني
                </div>
                <div style="font-size: 14px; color: #000; margin-top: 4px; white-space: nowrap;">
                  السنة الدراسية: ${academicYear}
                </div>
              </div>
              <!-- Right side (extreme right): Directorate block -->
              <div style="text-align: right; direction: rtl;">
                <div style="font-size: 16px; font-weight: bold; color: #000; white-space: nowrap;">
                  مديرية التربية لولاية مستغانم
                </div>
                <div style="font-size: 14px; color: #000; margin-top: 4px; white-space: nowrap;">
                  <span style="font-weight: bold;">نوع المؤسسة :</span>
                  <span>${schoolType}</span>
                </div>
                <div style="font-size: 14px; color: #000; margin-top: 6px; white-space: nowrap;">
                  <span style="font-weight: bold;">مستشار التوجيه :</span>
                  <span>${counselorName}</span>
                </div>
              </div>
            </div>

            <!-- Report Title -->
            <div style="text-align: center; margin-top: 20px;">
              <h1 style="color: #2c5aa0; margin: 0; font-size: 20px; border: 2px solid #2c5aa0; padding: 10px; border-radius: 8px; background: #f0f9ff; display: flex; align-items: center; justify-content: center;">
                تقرير اختبار الأنماط التمثيلية
              </h1>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; border-bottom: 2px solid #2c5aa0; padding-bottom: 15px;">
            <h3 style="color: #2c5aa0; margin-bottom: 10px;">معلومات التلميذ</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1; margin-left: 20px;">
                <p><strong>الاسم واللقب:</strong> ${studentName}</p>
                <p><strong>المستوى:</strong> ${student?.level || repPersonalInfo.section || ''}</p>
                <p><strong>الفوج:</strong> ${student?.group || ''}</p>
              </div>
              <div style="flex: 1; margin-right: 20px;">
                <p><strong>تاريخ الإجراء:</strong> ${procedureDate}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c5aa0; margin-bottom: 15px;">النتائج</h3>
            
            <!-- Bar Chart -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #374151; margin-bottom: 10px; text-align: center; font-size: 16px;">مخطط الأعمدة - النتائج</h4>
              <div style="display: flex; align-items: end; justify-content: center; height: 140px; border: 1px solid #e5e7eb; padding: 15px; background: #f9fafb;">
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 15px;">
                  <div style="width: 50px; background: linear-gradient(to top, #3b82f6, #60a5fa); height: ${((repTotals.visual || 0) / Math.max(1, (repTotals.visual || 0), (repTotals.auditory || 0), (repTotals.kinesthetic || 0))) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #1e40af; font-size: 14px;">${repTotals.visual}</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #1e40af; font-size: 12px;">بصري (أ)</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 15px;">
                  <div style="width: 50px; background: linear-gradient(to top, #f59e0b, #fbbf24); height: ${((repTotals.auditory || 0) / Math.max(1, (repTotals.visual || 0), (repTotals.auditory || 0), (repTotals.kinesthetic || 0))) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #d97706; font-size: 14px;">${repTotals.auditory}</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #d97706; font-size: 12px;">سمعي (ب)</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 15px;">
                  <div style="width: 50px; background: linear-gradient(to top, #10b981, #34d399); height: ${((repTotals.kinesthetic || 0) / Math.max(1, (repTotals.visual || 0), (repTotals.auditory || 0), (repTotals.kinesthetic || 0))) * 100}px; border-radius: 4px 4px 0 0; position: relative;">
                    <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-weight: bold; color: #059669; font-size: 14px;">${repTotals.kinesthetic}</div>
                  </div>
                  <div style="margin-top: 8px; font-weight: bold; color: #059669; font-size: 12px;">حسي (ج)</div>
                </div>
              </div>
            </div>
            
            <!-- Pie Chart -->
            <div style="margin-bottom: 20px;">
              <h4 style="color: #374151; margin-bottom: 10px; text-align: center; font-size: 16px;">مخطط دائري - النسب المئوية</h4>
              <div style="display: flex; justify-content: center; align-items: center; height: 180px; border: 1px solid #e5e7eb; padding: 15px; background: #f9fafb;">
                <div style="position: relative; width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(
                  #3b82f6 0deg ${(((repTotals.visual || 0) / Math.max(1, total || 0)) * 360)}deg,
                  #f59e0b ${(((repTotals.visual || 0) / Math.max(1, total || 0)) * 360)}deg ${((((repTotals.visual || 0) + (repTotals.auditory || 0)) / Math.max(1, total || 0)) * 360)}deg,
                  #10b981 ${((((repTotals.visual || 0) + (repTotals.auditory || 0)) / Math.max(1, total || 0)) * 360)}deg 360deg
                );">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center;">
                      <div style="font-size: 14px; font-weight: bold; color: #374151;">المجموع</div>
                      <div style="font-size: 18px; font-weight: bold; color: #2c5aa0;">${total}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style="display: flex; justify-content: center; margin-top: 10px; gap: 20px;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 16px; height: 16px; background: #3b82f6; border-radius: 3px; margin-left: 6px;"></div>
                  <span style="color: #1e40af; font-weight: bold; font-size: 12px;">بصري ${pct(repTotals.visual)}%</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 16px; height: 16px; background: #f59e0b; border-radius: 3px; margin-left: 6px;"></div>
                  <span style="color: #d97706; font-weight: bold; font-size: 12px;">سمعي ${pct(repTotals.auditory)}%</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 16px; height: 16px; background: #10b981; border-radius: 3px; margin-left: 6px;"></div>
                  <span style="color: #059669; font-weight: bold; font-size: 12px;">حسي ${pct(repTotals.kinesthetic)}%</span>
                </div>
              </div>
            </div>
            
            <!-- Results Cards -->
            <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
              <div style="text-align: center; padding: 15px; border: 2px solid #3b82f6; border-radius: 8px; background: linear-gradient(135deg, #eff6ff, #dbeafe); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">👁️</div>
                <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">النظام البصري (أ)</h4>
                <div style="font-size: 20px; font-weight: bold; color: #1e40af;">${repTotals.visual}</div>
                <div style="color: #6b7280; font-size: 12px;">${pct(repTotals.visual)}%</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 2px solid #f59e0b; border-radius: 8px; background: linear-gradient(135deg, #fffbeb, #fef3c7); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">👂</div>
                <h4 style="color: #d97706; margin: 0 0 8px 0; font-size: 14px;">النظام السمعي (ب)</h4>
                <div style="font-size: 20px; font-weight: bold; color: #d97706;">${repTotals.auditory}</div>
                <div style="color: #6b7280; font-size: 12px;">${pct(repTotals.auditory)}%</div>
              </div>
              <div style="text-align: center; padding: 15px; border: 2px solid #10b981; border-radius: 8px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 32px; margin-bottom: 8px;">✋</div>
                <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 14px;">النظام الحسي (ج)</h4>
                <div style="font-size: 20px; font-weight: bold; color: #059669;">${repTotals.kinesthetic}</div>
                <div style="color: #6b7280; font-size: 12px;">${pct(repTotals.kinesthetic)}%</div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 8px; border-right: 4px solid #2c5aa0;">
            <h3 style="color: #2c5aa0; margin-bottom: 10px; font-size: 16px;">🎯 النمط المهيمن</h3>
            <p style="font-size: 18px; font-weight: bold; color: #1f2937; text-align: center; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${dominant}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <h3 style="color: #2c5aa0; margin-bottom: 10px; font-size: 16px;">💡 التوصية</h3>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 8px; border-right: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 14px; line-height: 1.6; color: #92400e; margin: 0;">
                ${getRepAdvice()}
              </p>
            </div>
          </div>

          <!-- Interpretation Section -->
          <div style="margin-bottom: 15px; padding: 15px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #2c5aa0; margin-bottom: 12px; font-size: 16px;">📊 تفسير النتائج</h3>
            <p style="font-size: 13px; color: #374151; margin-bottom: 10px;">
              تشير النتائج إلى تفضيل تمثيلي لدى التلميذ. كلما كانت النسبة أعلى، دلّ ذلك على اعتماد أكبر على ذلك النظام في التعلم.
            </p>
            <ul style="font-size: 13px; color: #111827; margin: 0; padding-right: 18px; list-style: square;">
              <li>بصري: يميل للتعلم عبر الصور، الرسوم، الخرائط الذهنية، والألوان.</li>
              <li>سمعي: يتعلم أفضل عبر الشرح الشفهي، النقاش، والتكرار الصوتي.</li>
              <li>حسي: يفضل التجربة، العمل اليدوي، والتمارين التطبيقية.</li>
            </ul>
          </div>

          <!-- Study Strategies Section -->
          <div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #ecfeff, #cffafe); border-radius: 8px; border-right: 4px solid #06b6d4;">
            <h3 style="color: #0e7490; margin-bottom: 12px; font-size: 16px;">🧭 استراتيجيات تعلم مقترحة حسب النمط</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
                <h4 style="margin:0 0 8px 0; color:#1e40af; font-size:14px;">بصري</h4>
                <ul style="margin:0; padding-right:18px; font-size:12px; color:#374151; list-style: square;">
                  <li>استخدم خرائط ذهنية ومخططات وجداول ملونة.</li>
                  <li>قسّم الدروس إلى بطاقات مراجعة مصوّرة.</li>
                  <li>اعتمد على الرسوم التوضيحية والإنفوجرافيك.</li>
                </ul>
              </div>
              <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
                <h4 style="margin:0 0 8px 0; color:#d97706; font-size:14px;">سمعي</h4>
                <ul style="margin:0; padding-right:18px; font-size:12px; color:#374151; list-style: square;">
                  <li>اقرأ بصوت مسموع وسجّل ملخصاتك الصوتية.</li>
                  <li>ناقش الدروس مع زملائك أو الأسرة.</li>
                  <li>استخدم الإيقاع والتكرار لتثبيت المعلومات.</li>
                </ul>
              </div>
              <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
                <h4 style="margin:0 0 8px 0; color:#059669; font-size:14px;">حسي</h4>
                <ul style="margin:0; padding-right:18px; font-size:12px; color:#374151; list-style: square;">
                  <li>حوّل المفاهيم إلى تطبيقات وتجارب صغيرة.</li>
                  <li>استعمل أدوات ومواد تعليمية ملموسة.</li>
                  <li>خذ فواصل قصيرة تتضمن حركة ونشاطاً.</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Methodology/Notes Section -->
          <div style="margin-bottom: 15px; padding: 12px; background:#f9fafb; border:1px dashed #cbd5e1; border-radius:8px;">
            <h4 style="margin:0 0 8px 0; color:#475569; font-size:14px;">ℹ️ ملاحظات منهجية</h4>
            <p style="margin:0; font-size:12px; color:#374151; line-height:1.6;">
              هذا الاختبار مؤشر إرشادي يساعد على فهم أسلوب التعلم المفضّل، ولا يُعدّ حكماً نهائياً على قدرات التلميذ. يُنصح بمراعاة الفروق الفردية والجمع بين أكثر من استراتيجية.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: center;">
            <div style="font-size: 12px; color: #6b7280;">
              تم إنشاء هذا التقرير في ${new Date().toLocaleDateString('ar-SA')} - نظام إدارة التوجيه المدرسي
            </div>
          </div>
        </div>
      `;
      
      // Create temporary element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      document.body.appendChild(tempDiv);
      
      // Wait for fonts to load
      try {
        const fonts = (document as any).fonts;
        if (fonts?.ready) {
          await fonts.ready;
        }
      } catch (_) {}
      
      // Capture with html2canvas
      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123
      });
      
      // Remove temporary element
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Save PDF
      const fileName = `representational_styles_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      // Show success message
      alert('تم إنشاء ملف PDF بنجاح!');
    } catch (error: unknown) {
      console.error('خطأ في إنشاء ملف PDF:', error);
      alert(`حدث خطأ أثناء إنشاء ملف PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  const saveRepResult = async () => {
    if (!repSelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setRepSaving(true);
      const totalAnswered = repTotals.visual + repTotals.auditory + repTotals.kinesthetic;
      const maxCount = Math.max(repTotals.visual, repTotals.auditory, repTotals.kinesthetic);
      const score = totalAnswered > 0 ? Math.round((maxCount / totalAnswered) * 100) : 0;
      const answers = Object.entries(repAnswers).map(([idx, ans]) => ({
        questionId: `rep_${idx}`,
        answer: ans || '',
        isCorrect: false
      }));
      await submitTestResult(
        'representational_styles',
        repSelectedStudent,
        answers as any,
        score
      );
      alert('تم حفظ النتيجة بنجاح');
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setRepSaving(false);
    }
  };

  // Creative thinking test functions
  const calculateCreativeResults = () => {
    // Convert answers to the format expected by evaluation function
    const answersForEvaluation = Object.fromEntries(
      Object.entries(creativeAnswers).map(([idx, ans]) => [
        `cre-${parseInt(idx) + 1}`,
        ans === 'a'
          ? (creativeQuestions[parseInt(idx)]?.options?.[0] || '')
          : (creativeQuestions[parseInt(idx)]?.options?.[1] || '')
      ])
    );

    const results = evaluateCreativeTest(answersForEvaluation);
    setCreativeResults(results);
  };
  const handleCreativeSubmit = async () => {
    if (!creativeSelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setCreativeSaving(true);
      
      // Convert answers to the format expected by evaluation function
      const answersForEvaluation = Object.fromEntries(
        Object.entries(creativeAnswers).map(([idx, ans]) => [
          `cre-${parseInt(idx) + 1}`,
          ans === 'a'
            ? (creativeQuestions[parseInt(idx)]?.options?.[0] || '')
            : (creativeQuestions[parseInt(idx)]?.options?.[1] || '')
        ])
      );
      
      // Evaluate the test
      const results = evaluateCreativeTest(answersForEvaluation);
      
      // Convert answers to the format expected by submitTestResult
      const answers = Object.entries(creativeAnswers).map(([idx, ans]) => ({
        questionId: `cre-${parseInt(idx) + 1}`,
        answer: ans || '',
        isCorrect: false
      }));
      
      await submitTestResult(
        'creative',
        creativeSelectedStudent,
        answers as any,
        results.score
      );
      
      alert('تم حفظ النتيجة بنجاح');
      setShowCreativeModal(false);
      setCreativeAnswers({});
      setCreativeSelectedStudent('');
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setCreativeSaving(false);
    }
  };

  // Social skills test functions
  const calculateSocialResults = () => {
    const answersForEvaluation = Object.fromEntries(
      Object.entries(socialAnswers).map(([idx, ans]) => [
        `soc-${parseInt(idx) + 1}`,
        ans === 'a'
          ? (socialQuestions[parseInt(idx)]?.options?.[0] || '')
          : (socialQuestions[parseInt(idx)]?.options?.[1] || '')
      ])
    );
    const results = evaluateSocialTest(answersForEvaluation);
    setSocialResults(results);
  };

  const handlePrint = () => {
    window.print();
  };
  const handleSocialSubmit = async () => {
    if (!socialSelectedStudent) {
      alert('اختر تلميذاً لحفظ النتيجة');
      return;
    }
    try {
      setSocialSaving(true);
      
      // Convert answers to the format expected by evaluation function
      const answersForEvaluation = Object.fromEntries(
        Object.entries(socialAnswers).map(([idx, ans]) => [
          `soc-${parseInt(idx) + 1}`,
          ans === 'a' ? socialQuestions[parseInt(idx)].options[0] : socialQuestions[parseInt(idx)].options[1]
        ])
      );
      
      // Evaluate the test
      const results = evaluateSocialTest(answersForEvaluation);
      
      // Convert answers to the format expected by submitTestResult
      const answers = Object.entries(socialAnswers).map(([idx, ans]) => ({
        questionId: `soc-${parseInt(idx) + 1}`,
        answer: ans || '',
        isCorrect: false
      }));
      
      await submitTestResult(
        'social',
        socialSelectedStudent,
        answers as any,
        results.score
      );
      
      alert('تم حفظ النتيجة بنجاح');
      setShowSocialModal(false);
      setSocialAnswers({});
      setSocialSelectedStudent('');
    } catch (e) {
      console.error(e);
      alert('تعذّر حفظ النتيجة');
    } finally {
      setSocialSaving(false);
    }
  };

  const printRepReport = () => {
    const student = students.find(s => s.id === repSelectedStudent);
    const total = repTotals.visual + repTotals.auditory + repTotals.kinesthetic;
    const dominant = (() => {
      if (repTotals.visual >= repTotals.auditory && repTotals.visual >= repTotals.kinesthetic) return 'النظام البصري';
      if (repTotals.auditory >= repTotals.visual && repTotals.auditory >= repTotals.kinesthetic) return 'النظام السمعي';
      return 'النظام الحسي';
    })();
    const win = window.open('', '_blank');
    if (!win) return;
    const pct = (n: number) => (total>0 ? ((n/total)*100).toFixed(1) : '0.0');
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/><title>تقرير النمط التمثيلي</title>
    <style>body{font-family:Arial,Segoe UI,Tahoma,sans-serif;margin:24px;color:#111}h1{color:#0f766e} .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px} .card{border:2px solid #d1d5db;border-radius:12px;padding:16px;text-align:center} .v{border-color:#93c5fd;background:#eff6ff}.a{border-color:#fcd34d;background:#fffbeb}.k{border-color:#86efac;background:#f0fdf4} .big{font-size:32px;font-weight:800} .muted{color:#6b7280}</style>
    </head><body>
    <h1>تقرير النمط التمثيلي (VAK)</h1>
    <div class="muted">التلميذ: ${student ? student.firstName + ' ' + student.lastName : (repPersonalInfo.name + ' ' + repPersonalInfo.surname || 'غير محدد')}</div>
    <div class="muted">المستوى: ${student?.level || repPersonalInfo.section || ''} • الفوج: ${student?.group || ''}</div>
                <div class="muted">نوع المؤسسة: ${repPersonalInfo.schoolType} • تاريخ الإجراء: ${repPersonalInfo.date || new Date().toISOString().split('T')[0]}</div>
    <hr/>
    <div class="grid">
      <div class="card v"><div>النظام البصري (أ)</div><div class="big">${repTotals.visual}</div><div>${pct(repTotals.visual)}%</div></div>
      <div class="card a"><div>النظام السمعي (ب)</div><div class="big">${repTotals.auditory}</div><div>${pct(repTotals.auditory)}%</div></div>
      <div class="card k"><div>النظام الحسي (ج)</div><div class="big">${repTotals.kinesthetic}</div><div>${pct(repTotals.kinesthetic)}%</div></div>
    </div>
    <h2>النمط المهيمن: ${dominant}</h2>
    <div class="muted">التوصية: ${getRepAdvice()}</div>
    <script>window.onload=function(){window.print();window.close();}</script>
    </body></html>`);
    win.document.close();
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Text answer handlers for questions 12, 13, 14
  const handleScienceTextAnswer = (questionId: string, value: string) => {
    setScienceTextAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleArtsTextAnswer = (questionId: string, value: string) => {
    setArtsTextAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateScores = () => {
    // Stop timer
    setIsTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    // Calculate Science & Technology score
    // Questions 1,2,3,4,6,7,8 are positive (inclination) - Questions 5,9,10,11 are negative (disinclination)
    // Question 2 is now scored with subject selection
    const sciencePositiveQuestions = ['q1', 'q2', 'q3', 'q4', 'q6', 'q7', 'q8'];
    const scienceNegativeQuestions = ['q5', 'q9', 'q10', 'q11'];
    
    let sciencePositiveScore = 0;
    let scienceNegativeScore = 0;
    
    sciencePositiveQuestions.forEach(q => {
      if (scienceAnswers[q] !== undefined) {
        sciencePositiveScore += scienceAnswers[q];
      }
    });
    
    scienceNegativeQuestions.forEach(q => {
      if (scienceAnswers[q] !== undefined) {
        // For negative questions, invert the score (3->0, 2->1, 1->2, 0->3)
        scienceNegativeScore += (3 - scienceAnswers[q]);
      }
    });
    
    const scienceTotal = sciencePositiveScore + scienceNegativeScore;
    const scienceMax = (sciencePositiveQuestions.length + scienceNegativeQuestions.length) * 3;
    const sciencePercentage = scienceMax > 0 ? (scienceTotal / scienceMax) * 100 : 0;
    
    // Calculate Arts score
    // Questions 1,2,3,4,6,7,8 are positive (inclination) - Questions 5,9,10,11 are negative (disinclination)
    const artsPositiveQuestions = ['q1', 'q2', 'q3', 'q4', 'q6', 'q7', 'q8'];
    const artsNegativeQuestions = ['q5', 'q9', 'q10', 'q11'];
    
    let artsPositiveScore = 0;
    let artsNegativeScore = 0;
    
    artsPositiveQuestions.forEach(q => {
      if (artsAnswers[q] !== undefined) {
        artsPositiveScore += artsAnswers[q];
      }
    });
    
    artsNegativeQuestions.forEach(q => {
      if (artsAnswers[q] !== undefined) {
        // For negative questions, invert the score (3->0, 2->1, 1->2, 0->3)
        artsNegativeScore += (3 - artsAnswers[q]);
      }
    });
    
    const artsTotal = artsPositiveScore + artsNegativeScore;
    const artsMax = (artsPositiveQuestions.length + artsNegativeQuestions.length) * 3;
    const artsPercentage = artsMax > 0 ? (artsTotal / artsMax) * 100 : 0;
    
    setScienceScore(sciencePercentage);
    setArtsScore(artsPercentage);
    
    // Determine recommendation
    if (sciencePercentage > artsPercentage + 10) {
      setRecommendation('علوم وتكنولوجيا');
    } else if (artsPercentage > sciencePercentage + 10) {
      setRecommendation('آداب');
    } else {
      setRecommendation('متوازن - يمكنك اختيار أي من المسارين');
    }
    
    setShowResults(true);
  };

  const resetTest = () => {
    setScienceAnswers({});
    setArtsAnswers({});
    setScienceQ2Subject('');
    setArtsQ2Subject('');
    setScienceQ5Subject('');
    setScienceQ9Subject('');
    setArtsQ5Subject('');
    setArtsQ9Subject('');
    
    // Reset personal information
    setPersonalInfo({
      name: '',
      surname: '',
      section: '',
      highSchool: '',
      date: '',
      schoolType: getCycleConfig(currentCycle).schoolName
    });
    
    // Reset text answers for questions 12, 13, 14
    setScienceTextAnswers({
      q12: '',
      q13: '',
      q14: ''
    });
    
    setArtsTextAnswers({
      q12: '',
      q13: '',
      q14: ''
    });
    
    setShowResults(false);
    setScienceScore(0);
    setArtsScore(0);
    setRecommendation('');
    
    // Reset timer
    resetTimer();
  };

          // Calculate total score for Science section
        const calculateScienceTotal = () => {
          // Include q2 since it's now scored with subject selection
          const total = Object.values(scienceAnswers).reduce((sum, score) => sum + score, 0);
          return total;
        };

  // Calculate total score for Arts section
  const calculateArtsTotal = () => {
    const total = Object.values(artsAnswers).reduce((sum, score) => sum + score, 0);
    return total;
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

  const printTestResults = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Create the print content
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>نتائج ميولك نحو المواد</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          
          body {
            font-family: 'Amiri', serif;
            direction: rtl;
            margin: 0;
            padding: 20px;
            background-color: white;
            color: #333;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #1e40af;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          
          .header .divider {
            width: 100px;
            height: 3px;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            margin: 0 auto;
            border-radius: 2px;
          }
          
          .student-info {
            background-color: #f8fafc;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .student-info h2 {
            color: #1e40af;
            font-size: 24px;
            text-align: center;
            margin: 0 0 20px 0;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            background-color: white;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          
          .info-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .info-value {
            font-size: 18px;
            color: #1e40af;
            font-weight: bold;
          }
          
          .date-item {
            grid-column: 1 / -1;
            background-color: #f0fdf4;
            border-color: #bbf7d0;
          }
          
          .date-item .info-value {
            color: #166534;
          }
          
          .results-section {
            margin-bottom: 30px;
          }
          
          .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .result-card {
            border: 2px solid;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }
          
          .science-card {
            border-color: #3b82f6;
            background-color: #eff6ff;
          }
          
          .arts-card {
            border-color: #8b5cf6;
            background-color: #faf5ff;
          }
          
          .result-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          .science-title {
            color: #1e40af;
          }
          
          .arts-title {
            color: #6d28d9;
          }
          
          .score {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 15px;
        }
          
          .science-score {
            color: #1e40af;
          }
          
          .arts-score {
            color: #6d28d9;
          }
          
          .progress-bar {
            width: 100%;
            height: 16px;
            background-color: #dbeafe;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
          }
          
          .progress-fill {
            height: 100%;
            border-radius: 8px;
            transition: width 0.3s ease;
          }
          
          .science-progress {
            background-color: #3b82f6;
          }
          
          .arts-progress {
            background-color: #8b5cf6;
          }
          
          .tendency {
            font-size: 14px;
            margin-bottom: 15px;
          }
          
          .science-tendency {
            color: #1e40af;
          }
          
          .arts-tendency {
            color: #6d28d9;
          }
          
          .subject-info {
            background-color: white;
            border: 1px solid;
            border-radius: 8px;
            padding: 12px;
            margin-top: 12px;
            font-size: 12px;
          }
          
          .science-subject {
            border-color: #3b82f6;
          }
          
          .arts-subject {
            border-color: #8b5cf6;
          }
          
          .subject-label {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .recommendation-section {
            background: linear-gradient(to right, #eff6ff, #faf5ff);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .recommendation-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e3748;
            margin-bottom: 10px;
          }
          
          .recommendation-divider {
            width: 100px;
            height: 2px;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            margin: 0 auto 20px auto;
            border-radius: 1px;
          }
          
          .recommendation-value {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #3b82f6;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .recommendation-description {
            font-size: 16px;
            color: #374151;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .recommendation-reasons {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dbeafe;
            margin-top: 20px;
            text-align: right;
          }
          
          .recommendation-reasons h6 {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .recommendation-reasons ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .recommendation-reasons li {
            color: #1e40af;
            margin-bottom: 8px;
            padding-right: 20px;
            position: relative;
          }
          
          .recommendation-reasons li:before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            right: 0;
          }
          
          .balanced-recommendation {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
          }
          
          .balanced-card {
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #dbeafe;
            text-align: right;
          }
          
          .balanced-card h6 {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .balanced-card ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .balanced-card li {
            color: #1e40af;
            margin-bottom: 5px;
            padding-right: 15px;
            position: relative;
            font-size: 12px;
          }
          
          .balanced-card li:before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            right: 0;
          }
          
          .advice {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            text-align: center;
          }
          
          .advice p {
            color: #92400e;
            font-weight: 600;
            font-size: 14px;
            margin: 0;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          
          @media print {
            body {
              padding: 0;
              margin: 20px;
            }
            
            .header, .student-info, .results-section, .recommendation-section {
              break-inside: avoid;
            }
            
            .results-grid {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>نتائج ميولك نحو المواد</h1>
          <div class="divider"></div>
        </div>
        
        <div class="student-info">
          <h2>معلومات الثلميذ</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">الاسم</div>
              <div class="info-value">${personalInfo.name || 'غير محدد'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">اللقب</div>
              <div class="info-value">${personalInfo.surname || 'غير محدد'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">القسم</div>
              <div class="info-value">${personalInfo.section || 'غير محدد'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">نوع المؤسسة :</div>
                <div class="info-value">${personalInfo.schoolType || getCycleConfig(currentCycle).schoolName}</div>
            </div>
            
            <div class="info-item date-item">
              <div class="info-label">تاريخ الإجراء</div>
              <div class="info-value">${personalInfo.date || 'غير محدد'}</div>
            </div>
          </div>
        </div>
        
        <div class="results-section">
          <div class="results-grid">
            <div class="result-card science-card">
              <div class="result-title science-title">علوم وتكنولوجيا</div>
              <div class="score science-score">${scienceScore.toFixed(1)}%</div>
              <div class="progress-bar">
                <div class="progress-fill science-progress" style="width: ${scienceScore}%"></div>
              </div>
              <div class="tendency science-tendency">
                ${scienceScore >= 80 ? 'ميل قوي جداً' :
                  scienceScore >= 60 ? 'ميل قوي' :
                  scienceScore >= 40 ? 'ميل متوسط' :
                  scienceScore >= 20 ? 'ميل ضعيف' : 'ميل ضعيف جداً'}
              </div>
              ${scienceQ2Subject ? `
                <div class="subject-info science-subject">
                  <div class="subject-label">المادة المفضلة:</div>
                  <div>${scienceQ2Subject}</div>
                </div>
              ` : ''}
              ${scienceQ5Subject ? `
                <div class="subject-info science-subject">
                  <div class="subject-label">المادة (عدم الارتياح):</div>
                  <div>${scienceQ5Subject}</div>
                </div>
              ` : ''}
              ${scienceQ9Subject ? `
                <div class="subject-info science-subject">
                  <div class="subject-label">المادة (عدم الرغبة):</div>
                  <div>${scienceQ9Subject}</div>
                </div>
              ` : ''}
            </div>
            
            <div class="result-card arts-card">
              <div class="result-title arts-title">آداب</div>
              <div class="score arts-score">${artsScore.toFixed(1)}%</div>
              <div class="progress-bar">
                <div class="progress-fill arts-progress" style="width: ${artsScore}%"></div>
              </div>
              <div class="tendency arts-tendency">
                ${artsScore >= 80 ? 'ميل قوي جداً' :
                  artsScore >= 60 ? 'ميل قوي' :
                  artsScore >= 40 ? 'ميل متوسط' :
                  artsScore >= 20 ? 'ميل ضعيف' : 'ميل ضعيف جداً'}
              </div>
              ${artsQ2Subject ? `
                <div class="subject-info arts-subject">
                  <div class="subject-label">المادة المفضلة:</div>
                  <div>${artsQ2Subject}</div>
                </div>
              ` : ''}
              ${artsQ5Subject ? `
                <div class="subject-info arts-subject">
                  <div class="subject-label">المادة (عدم الارتياح):</div>
                  <div>${artsQ5Subject}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="recommendation-section">
          <div class="recommendation-title">التوصية النهائية</div>
          <div class="recommendation-divider"></div>
          
          <div class="recommendation-value">${recommendation}</div>
          
          <div class="recommendation-description">
            ${recommendation === 'علوم وتكنولوجيا' ? `
              <div>
                <p>بناءً على إجاباتك، يبدو أن لديك ميل قوي نحو المواد العلمية والتكنولوجية</p>
                <div class="recommendation-reasons">
                  <h6>نوصي باختيار مسار علوم وتكنولوجيا للأسباب التالية:</h6>
                  <ul>
                    <li>لديك قدرات عالية في التفكير المنطقي والتحليل العلمي</li>
                    <li>تظهر اهتماماً كبيراً بالمواد العلمية والتكنولوجية</li>
                    <li>لديك مهارات في حل المشكلات بطريقة علمية</li>
                    <li>هذا المسار سيفتح لك آفاقاً واسعة في مجالات العلوم والهندسة والتكنولوجيا</li>
                  </ul>
                </div>
              </div>
            ` : recommendation === 'آداب' ? `
              <div>
                <p>بناءً على إجاباتك، يبدو أن لديك ميل قوي نحو المواد الأدبية والإنسانية</p>
                <div class="recommendation-reasons">
                  <h6>نوصي باختيار مسار آداب للأسباب التالية:</h6>
                  <ul>
                    <li>لديك قدرات عالية في الفهم والتحليل الأدبي</li>
                    <li>تظهر اهتماماً كبيراً بالمواد الإنسانية والاجتماعية</li>
                    <li>لديك مهارات في التعبير والكتابة والتحليل النقدي</li>
                    <li>هذا المسار سيفتح لك آفاقاً واسعة في مجالات الأدب والفلسفة والعلوم الإنسانية</li>
                  </ul>
                </div>
              </div>
            ` : `
              <div>
                <p>لديك ميول متوازنة نحو كلا المسارين</p>
                <div class="recommendation-reasons">
                  <h6>يمكنك اختيار أي منهما حسب تفضيلاتك الشخصية:</h6>
                  <div class="balanced-recommendation">
                    <div class="balanced-card">
                      <h6>مسار علوم وتكنولوجيا:</h6>
                      <ul>
                        <li>إذا كنت تفضل التفكير العلمي</li>
                        <li>إذا كنت مهتماً بالتكنولوجيا</li>
                        <li>إذا كنت تريد العمل في مجالات الهندسة والعلوم</li>
                      </ul>
                    </div>
                    <div class="balanced-card">
                      <h6>مسار آداب:</h6>
                      <ul>
                        <li>إذا كنت تفضل التحليل الأدبي</li>
                        <li>إذا كنت مهتماً بالعلوم الإنسانية</li>
                        <li>إذا كنت تريد العمل في مجالات الأدب والفلسفة</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            `}
          </div>
          
          <div class="advice">
            <p>💡 نصيحة: خذ وقتك في التفكير في هذا القرار، فهو مهم لمستقبلك الدراسي والمهني
          </div>
        </div>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير في ${new Date().toLocaleDateString('ar-SA')} - نظام إدارة الاختبارات</p>
        </div>
      </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Helper to validate a rank is unique 3/2/1
  const isValidRank = (r: { a: number; b: number; c: number } | undefined) => {
    if (!r) return false;
    const vals = [r.a, r.b, r.c];
    const uniq = new Set(vals).size === 3;
    const ordered = [...vals].sort((x,y)=>x-y).join(',') === '1,2,3';
    return uniq && ordered;
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

      {/* Modal: اختبر ميولك نحو المواد */}
      {showInclinationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden mx-4" dir="rtl">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-right flex-1 text-gray-800">اختبر ميولك نحو المواد</h3>
                <div className="flex items-center gap-3">
                  {/* Timer Controls and Display */}
                  {!showResults && (
                    <div className="flex items-center gap-3">
                      {/* Timer Display */}
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-red-300 shadow-md">
                        <div className="text-red-600 font-bold text-lg">
                          ⏰ {formatTime(timeLeft)}
                        </div>
                        {timeLeft <= 60 && (
                          <div className="text-red-500 text-sm font-semibold animate-pulse">
                            !وقت قليل
                          </div>
                        )}
                      </div>
                      
                      {/* Timer Control Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={startTimer}
                          disabled={isTimerRunning || timeLeft === 0}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          title="تشغيل المؤقت"
                        >
                          ▶️
                        </button>
                        <button
                          onClick={resetTimer}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm font-medium"
                          title="إعادة تعيين المؤقت إلى 6 دقائق"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={resetTest}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    تهيئة الاختبار
                  </button>
                  <button
                    onClick={() => setShowInclinationModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            
            {!showResults ? (
              <div className="p-6 overflow-auto max-h-[calc(95vh-100px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* علوم و تكنولوجيا */}
                  <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-blue-800 mb-2">استبيان الميول نحو المواد</h4>
                      <h5 className="text-lg font-semibold text-blue-700">(جدع مشترك علوم و تكنولوجيا)</h5>
                    </div>
                    
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200 mb-6">
                      <h6 className="font-semibold text-blue-800 mb-3">المعلومات الشخصية</h6>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">الاسم :</label>
                          <input
                            type="text"
                            value={personalInfo.name}
                            onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                            className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                            placeholder="أدخل الاسم"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">اللقب :</label>
                          <input
                            type="text"
                            value={personalInfo.surname}
                            onChange={(e) => handlePersonalInfoChange('surname', e.target.value)}
                            className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                            placeholder="أدخل اللقب"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">القسم :</label>
                          <input
                            type="text"
                            value={personalInfo.section}
                            onChange={(e) => handlePersonalInfoChange('section', e.target.value)}
                            className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                            placeholder="أدخل القسم"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">نوع المؤسسة :</label>
                          <input
                            type="text"
                            value={personalInfo.schoolType || ''}
                            onChange={(e) => handlePersonalInfoChange('schoolType', e.target.value)}
                            className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                            placeholder={getCycleConfig(currentCycle).schoolName}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-blue-700 mb-1">تاريخ الإجراء :</label>
                          <DatePicker
                            selected={personalInfo.date ? new Date(personalInfo.date) : null}
                            onChange={(date) => handlePersonalInfoChange('date', date ? date.toISOString().split('T')[0] : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholderText="aaaa/mm/jj"
                            dateFormat="yyyy/MM/dd"
                            locale="ar"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={15}
                            showMonthDropdown
                            dropdownMode="select"
                            isClearable
                            clearButtonTitle="مسح"
                            todayButton="اليوم"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Instructions - Science Section */}
                    <div className="bg-blue-100 rounded-lg p-4 border border-blue-200 mb-6">
                      <h6 className="font-semibold text-blue-800 mb-3">تعليمات اجراء الإستبيان</h6>
                      <div className="text-sm text-blue-700 space-y-2">
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-red-800 text-center">⏰ مدة اجراء الاستبيان: 6 دقائق فقط</p>
                          <p className="text-red-700 text-center text-xs">سيتم إنهاء الاختبار تلقائياً عند انتهاء الوقت</p>
                        </div>
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-green-800 text-center">🎛️ التحكم في المؤقت:</p>
                          <div className="text-green-700 text-xs space-y-1">
                            <p>• ▶️ تشغيل المؤقت (أخضر)</p>
                            <p>• 🔄 إعادة تعيين إلى 6 دقائق (أزرق)</p>
                          </div>
                        </div>
                        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-blue-800 text-center">✏️ إدخال المعلومات:</p>
                          <div className="text-blue-700 text-xs space-y-1">
                            <p>• يمكنك إدخال معلوماتك الشخصية في الحقول المخصصة</p>
                            <p>• الاسم، اللقب، القسم، نوع المؤسسة، اسم الثانوية، وتاريخ الإجراء</p>
                            <p>• الأسئلة 12، 13، 14: يمكنك كتابة إجاباتك النصية في الحقول المخصصة</p>
                          </div>
                        </div>
                        <p>النقاط : (3,2,1,0) التي نضعها في الخانات المخصصة للإجابة في العمود الخاص بها</p>
                        <p>تدل على درجة ميلك واهتمامك</p>
                        <p>تتوقف صحة نتائج الإستبيان على مدى صدق اجاباتك</p>
                        <p className="font-semibold">حظ سعيد</p>
                      </div>
                    </div>
                    
                    {/* Questions */}
                    <div className="space-y-4">
                      {/* Q1 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">1</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى أنت راض (ة) عن اختيارك وتوجيهك إلى هذا الجذع ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q1_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q1 === value}
                                    onChange={() => handleScienceAnswer('q1', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q2 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">2</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تفضل (ين) دراسة المواد المميزة لهذا الجذع ؟</h6>
                            <div className="mb-3 text-sm text-blue-700">
                              <p>اختر المادة المفضلة وحدد مستوى التفضيل:</p>
                            </div>
                            <div className="space-y-3">
                              {['الرياضيات', 'العلوم الفيزيائية', 'العلوم الطبيعية', 'اللغة العربية و أدابها'].map((subject) => (
                                <div key={subject} className="border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="q2_science_subject" 
                                        value={subject} 
                                        className="text-blue-600"
                                        checked={scienceQ2Subject === subject}
                                        onChange={() => handleScienceQ2Subject(subject)}
                                      />
                                      <span className="text-sm font-medium">{subject}</span>
                                    </label>
                                    {scienceQ2Subject === subject && (
                                      <div className="flex gap-2">
                                        {[3, 2, 1, 0].map((value) => (
                                          <label key={value} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                              type="radio" 
                                              name={`q2_science_score_${subject}`}
                                              value={value} 
                                              className="text-blue-600"
                                              checked={scienceAnswers.q2 === value}
                                              onChange={() => handleScienceAnswer('q2', value)}
                                            />
                                            <span className="text-xs">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q3 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">3</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تثير اهتمامك طرائق تدريس هذه المواد ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q3_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q3 === value}
                                    onChange={() => handleScienceAnswer('q3', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q4 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">4</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تعتبر (ين) البرنامج في هذه المواد يتناسب مع اهتماماتك وتطلعاتك ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q4_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q4 === value}
                                    onChange={() => handleScienceAnswer('q4', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q5 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">5</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تشعر (ين) بعدم الارتياح عند حضورك لحصة من حصص هذه المواد ؟</h6>
                            <div className="mb-3 text-sm text-blue-700">
                              <p>اختر المادة وحدد مستوى عدم الارتياح:</p>
                            </div>
                            <div className="space-y-3">
                              {['الرياضيات', 'العلوم الفيزيائية', 'العلوم الطبيعية', 'اللغة العربية و أدابها'].map((subject) => (
                                <div key={subject} className="border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="q5_science_subject" 
                                        value={subject} 
                                        className="text-blue-600"
                                        checked={scienceQ5Subject === subject}
                                        onChange={() => handleScienceQ5Subject(subject)}
                                      />
                                      <span className="text-sm font-medium">{subject}</span>
                                    </label>
                                    {scienceQ5Subject === subject && (
                                      <div className="flex gap-2">
                                        {[3, 2, 1, 0].map((value) => (
                                          <label key={value} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                              type="radio" 
                                              name={`q5_science_score_${subject}`}
                                              value={value} 
                                              className="text-blue-600"
                                              checked={scienceAnswers.q5 === value}
                                              onChange={() => handleScienceAnswer('q5', value)}
                                            />
                                            <span className="text-xs">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q6 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">6</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى ترغب (ين) في المطالعة والقراءة بشكل عام ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q6_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q6 === value}
                                    onChange={() => handleScienceAnswer('q6', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q7 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">7</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تستعين (ين) في دراستك بتكنولوجيات الإتصال والإعلام الآلي ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q7_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q7 === value}
                                    onChange={() => handleScienceAnswer('q7', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q8 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">8</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تمارس (ين) بعض النشاطات الثقافية اللاصفية كالمسرح والموسيقى والهوايات المختلفة...؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q8_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q8 === value}
                                    onChange={() => handleScienceAnswer('q8', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q9 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">9</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى لا ترغب (ين) في الحضور للحصص المبرمجة في هذه المواد ؟</h6>
                            <div className="mb-3 text-sm text-blue-700">
                              <p>اختر المادة وحدد مستوى عدم الرغبة:</p>
                            </div>
                            <div className="space-y-3">
                              {['الرياضيات', 'العلوم الفيزيائية', 'العلوم الطبيعية', 'اللغة العربية و أدابها'].map((subject) => (
                                <div key={subject} className="border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="q9_science_subject" 
                                        value={subject} 
                                        className="text-blue-600"
                                        checked={scienceQ9Subject === subject}
                                        onChange={() => handleScienceQ9Subject(subject)}
                                      />
                                      <span className="text-sm font-medium">{subject}</span>
                                    </label>
                                    {scienceQ9Subject === subject && (
                                      <div className="flex gap-2">
                                        {[3, 2, 1, 0].map((value) => (
                                          <label key={value} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                              type="radio" 
                                              name={`q9_science_score_${subject}`}
                                              value={value} 
                                              className="text-blue-600"
                                              checked={scienceAnswers.q9 === value}
                                              onChange={() => handleScienceAnswer('q9', value)}
                                            />
                                            <span className="text-xs">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q10 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">10</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تعتبر (ين) صعوبة البرنامج الدراسي المقرر في هذا الجذع معيقة لك في تحصيلك الدراسي ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q10_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q10 === value}
                                    onChange={() => handleScienceAnswer('q10', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q11 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">11</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إلى أي مدى تعتبر (ين) ضعف قدراتك المعرفية معيق لك في الدراسة في هذا الجذع ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q11_science" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={scienceAnswers.q11 === value}
                                    onChange={() => handleScienceAnswer('q11', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q12 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">12</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">إذا كانت هناك مواد أخرى في هذا الجذع لا تستطيع التحصيل فيها بشكل عادي وجيد ؟ أذكر (ي) ها</h6>
                            <textarea
                              value={scienceTextAnswers.q12}
                              onChange={(e) => handleScienceTextAnswer('q12', e.target.value)}
                              className="w-full border-2 border-blue-300 rounded p-2 h-20 resize-none focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="اكتب إجابتك هنا..."
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Q13 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">13</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">لماذا اخترت الدراسة في هذا الجذع ؟ وهل كان ذلك عن قناعة ورغبة واعية وحرة منك ؟</h6>
                            <textarea
                              value={scienceTextAnswers.q13}
                              onChange={(e) => handleScienceTextAnswer('q13', e.target.value)}
                              className="w-full border-2 border-blue-300 rounded p-2 h-20 resize-none focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="اكتب إجابتك هنا..."
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Q14 */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-yellow-400 text-blue-800 font-bold px-3 py-1 rounded text-sm">14</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-blue-800 mb-3">أي المهن او الوظائف التي تتطلع إليها ؟</h6>
                            <textarea
                              value={scienceTextAnswers.q14}
                              onChange={(e) => handleScienceTextAnswer('q14', e.target.value)}
                              className="w-full border-2 border-blue-300 rounded p-2 h-20 resize-none focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="اكتب إجابتك هنا..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Score */}
                    <div className="bg-white rounded-lg p-4 border border-blue-200 mt-6">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-800">المجموع</span>
                        <div className="bg-white border border-blue-300 px-3 py-1 rounded">{calculateScienceTotal()}</div>
                      </div>
                                             <div className="mt-3 text-sm text-blue-700">
                         <p>أسئلة الميل و التوافق (1,2,3,4,6,7,8)</p>
                         <p>أسئلة عدم الميل واللا توافق (9,10,11,5)</p>
                         <p>السؤال 2: اختيار المادة المفضلة مع تحديد مستوى التفضيل (محسوب في النتيجة)</p>
                         <p>السؤال 5: اختيار المادة مع تحديد مستوى عدم الارتياح (محسوب في النتيجة)</p>
                         <p>السؤال 9: اختيار المادة مع تحديد مستوى عدم الرغبة (محسوب في النتيجة)</p>
                       </div>
                    </div>
                  </div>
                  
                  {/* آداب */}
                  <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-purple-800 mb-2">استبيان الميول نحو المواد</h4>
                      <h5 className="text-lg font-semibold text-purple-700">(جدع مشترك آداب)</h5>
                    </div>
                    
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg p-4 border border-purple-200 mb-6">
                      <h6 className="font-semibold text-purple-800 mb-3">المعلومات الشخصية</h6>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">الاسم :</label>
                          <input
                            type="text"
                            value={personalInfo.name}
                            onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                            className="w-full border-b-2 border-purple-300 px-2 py-1 focus:border-purple-500 focus:outline-none text-sm"
                            placeholder="أدخل الاسم"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">اللقب :</label>
                          <input
                            type="text"
                            value={personalInfo.surname}
                            onChange={(e) => handlePersonalInfoChange('surname', e.target.value)}
                            className="w-full border-b-2 border-purple-300 px-2 py-1 focus:border-purple-500 focus:outline-none text-sm"
                            placeholder="أدخل اللقب"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">القسم :</label>
                          <input
                            type="text"
                            value={personalInfo.section}
                            onChange={(e) => handlePersonalInfoChange('section', e.target.value)}
                            className="w-full border-b-2 border-purple-300 px-2 py-1 focus:border-purple-500 focus:outline-none text-sm"
                            placeholder="أدخل القسم"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">نوع المؤسسة :</label>
                          <input
                            type="text"
                            value={personalInfo.schoolType || ''}
                            onChange={(e) => handlePersonalInfoChange('schoolType', e.target.value)}
                            className="w-full border-b-2 border-purple-300 px-2 py-1 focus:border-purple-500 focus:outline-none text-sm"
                            placeholder={getCycleConfig(currentCycle).schoolName}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-purple-700 mb-1">تاريخ الإجراء :</label>
                          <DatePicker
                            selected={personalInfo.date ? new Date(personalInfo.date) : null}
                            onChange={(date) => handlePersonalInfoChange('date', date ? date.toISOString().split('T')[0] : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholderText="aaaa/mm/jj"
                            dateFormat="yyyy/MM/dd"
                            locale="ar"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={15}
                            showMonthDropdown
                            dropdownMode="select"
                            isClearable
                            clearButtonTitle="مسح"
                            todayButton="اليوم"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Instructions - Arts Section */}
                    <div className="bg-purple-100 rounded-lg p-4 border border-purple-200 mb-6">
                      <h6 className="font-semibold text-purple-800 mb-3">تعليمات اجراء الإستبيان</h6>
                      <div className="text-sm text-purple-700 space-y-2">
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-red-800 text-center">⏰ مدة اجراء الاستبيان: 6 دقائق فقط</p>
                          <p className="text-red-700 text-center text-xs">سيتم إنهاء الاختبار تلقائياً عند انتهاء الوقت</p>
                        </div>
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-green-800 text-center">🎛️ التحكم في المؤقت:</p>
                          <div className="text-green-700 text-xs space-y-1">
                            <p>• ▶️ تشغيل المؤقت (أخضر)</p>
                            <p>• 🔄 إعادة تعيين إلى 6 دقائق (أزرق)</p>
                          </div>
                        </div>
                        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-3">
                          <p className="font-bold text-blue-800 text-center">✏️ إدخال المعلومات:</p>
                          <div className="text-blue-700 text-xs space-y-1">
                            <p>• يمكنك إدخال معلوماتك الشخصية في الحقول المخصصة</p>
                            <p>• الاسم، اللقب، القسم، نوع المؤسسة، اسم الثانوية، وتاريخ الإجراء</p>
                          </div>
                        </div>
                        <p>النقاط : (3,2,1,0) التي نضعها في الخانات المخصصة للإجابة في العمود الخاص بها</p>
                        <p>تدل على درجة ميلك واهتمامك</p>
                        <p>تتوقف صحة نتائج الإستبيان على مدى صدق اجاباتك</p>
                        <p className="font-semibold">حظ سعيد</p>
                      </div>
                    </div>
                    
                    {/* Questions */}
                    <div className="space-y-4">
                      {/* Q1 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">1</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى أنت راض (ة) عن اختيارك وتوجيهك إلى هذا الجذع ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q1_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q1 === value}
                                    onChange={() => handleArtsAnswer('q1', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q2 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">2</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تفضل (ين) دراسة المواد المميزة لهذا الجذع ؟</h6>
                            <div className="mb-3 text-sm text-purple-700">
                              <p>اختر المادة المفضلة وحدد مستوى التفضيل:</p>
                            </div>
                            <div className="space-y-3">
                              {['اللغة العربية وأدابها', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التاريخ والجغرافيا'].map((subject) => (
                                <div key={subject} className="border border-purple-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="q2_arts_subject" 
                                        value={subject} 
                                        className="text-purple-600"
                                        checked={artsQ2Subject === subject}
                                        onChange={() => handleArtsQ2Subject(subject)}
                                      />
                                      <span className="text-sm font-medium">{subject}</span>
                                    </label>
                                    {artsQ2Subject === subject && (
                                      <div className="flex gap-2">
                                        {[3, 2, 1, 0].map((value) => (
                                          <label key={value} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                              type="radio" 
                                              name={`q2_arts_score_${subject}`}
                                              value={value} 
                                              className="text-purple-600"
                                              checked={artsAnswers.q2 === value}
                                              onChange={() => handleArtsAnswer('q2', value)}
                                            />
                                            <span className="text-xs">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q3 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">3</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تثير اهتمامك طرائق تدريس هذه المواد ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q3_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q3 === value}
                                    onChange={() => handleArtsAnswer('q3', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q4 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">4</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تعتبر (ين) البرنامج في هذه المواد يتناسب مع اهتماماتك وتطلعاتك ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q4_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q4 === value}
                                    onChange={() => handleArtsAnswer('q4', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q5 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">5</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تشعر (ين) بعدم الارتياح عند حضورك لحصة من حصص هذه المواد ؟</h6>
                            <div className="mb-3 text-sm text-purple-700">
                              <p>اختر المادة وحدد مستوى عدم الارتياح:</p>
                            </div>
                            <div className="space-y-3">
                              {['اللغة العربية وأدابها', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التاريخ والجغرافيا'].map((subject) => (
                                <div key={subject} className="border border-purple-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="q5_arts_subject" 
                                        value={subject} 
                                        className="text-purple-600"
                                        checked={artsQ5Subject === subject}
                                        onChange={() => handleArtsQ5Subject(subject)}
                                      />
                                      <span className="text-sm font-medium">{subject}</span>
                                    </label>
                                    {artsQ5Subject === subject && (
                                      <div className="flex gap-2">
                                        {[3, 2, 1, 0].map((value) => (
                                          <label key={value} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                              type="radio" 
                                              name={`q5_arts_score_${subject}`}
                                              value={value} 
                                              className="text-purple-600"
                                              checked={artsAnswers.q5 === value}
                                              onChange={() => handleArtsAnswer('q5', value)}
                                            />
                                            <span className="text-xs">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q6 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">6</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى ترغب (ين) في المطالعة والقراءة بشكل عام ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q6_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q6 === value}
                                    onChange={() => handleArtsAnswer('q6', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q7 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">7</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تستعين (ين) في دراستك بتكنولوجيات الإتصال والإعلام الآلي ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q7_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q7 === value}
                                    onChange={() => handleArtsAnswer('q7', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q8 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">8</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تمارس (ين) بعض النشاطات الثقافية اللاصفية كالمسرح والموسيقى والهوايات المختلفة...؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q8_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q8 === value}
                                    onChange={() => handleArtsAnswer('q8', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q9 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">9</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى لا ترغب (ين) في الحضور للحصص المبرمجة في هذه المواد ؟</h6>
                            <div className="mb-3 text-sm text-purple-700">
                              <p>اختر المادة وحدد مستوى عدم الرغبة:</p>
                            </div>
                            <div className="space-y-3">
                              {['اللغة العربية وأدابها', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التاريخ والجغرافيا'].map((subject) => (
                                <div key={subject} className="border border-purple-200 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="q9_arts_subject" 
                                        value={subject} 
                                        className="text-purple-600"
                                        checked={artsQ9Subject === subject}
                                        onChange={() => handleArtsQ9Subject(subject)}
                                      />
                                      <span className="text-sm font-medium">{subject}</span>
                                    </label>
                                    {artsQ9Subject === subject && (
                                      <div className="flex gap-2">
                                        {[3, 2, 1, 0].map((value) => (
                                          <label key={value} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                              type="radio" 
                                              name={`q9_arts_score_${subject}`}
                                              value={value} 
                                              className="text-purple-600"
                                              checked={artsAnswers.q9 === value}
                                              onChange={() => handleArtsAnswer('q9', value)}
                                            />
                                            <span className="text-xs">{value}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q10 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">10</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تعتبر (ين) صعوبة البرنامج الدراسي المقرر في هذا الجذع معيقة لك في تحصيلك الدراسي ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q10_arts" 
                                    value={value} 
                                    className="text-purple-600"
                                    checked={artsAnswers.q10 === value}
                                    onChange={() => handleArtsAnswer('q10', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q11 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">11</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إلى أي مدى تعتبر (ين) ضعف قدراتك المعرفية معيق لك في الدراسة في هذا الجذع ؟</h6>
                            <div className="flex gap-4">
                              {[3, 2, 1, 0].map((value) => (
                                <label key={value} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="q11_arts" 
                                    value={value} 
                                    className="text-blue-600"
                                    checked={artsAnswers.q11 === value}
                                    onChange={() => handleArtsAnswer('q11', value)}
                                  />
                                  <span className="text-sm">{value}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Q12 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">12</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">إذا كانت هناك مواد أخرى في هذا الجذع لا تستطيع التحصيل فيها بشكل عادي وجيد ؟ أذكر (ي) ها</h6>
                            <textarea
                              value={artsTextAnswers.q12}
                              onChange={(e) => handleArtsTextAnswer('q12', e.target.value)}
                              className="w-full border-2 border-purple-300 rounded p-2 h-20 resize-none focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="اكتب إجابتك هنا..."
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Q13 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">13</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">لماذا اخترت الدراسة في هذا الجذع ؟ وهل كان ذلك عن قناعة ورغبة واعية وحرة منك ؟</h6>
                            <textarea
                              value={artsTextAnswers.q13}
                              onChange={(e) => handleArtsTextAnswer('q13', e.target.value)}
                              className="w-full border-2 border-purple-300 rounded p-2 h-20 resize-none focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="اكتب إجابتك هنا..."
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Q14 */}
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="bg-orange-400 text-purple-800 font-bold px-3 py-1 rounded text-sm">14</div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-purple-800 mb-3">أي المهن او الوظائف التي تتطلع إليها ؟</h6>
                            <textarea
                              value={artsTextAnswers.q14}
                              onChange={(e) => handleArtsTextAnswer('q14', e.target.value)}
                              className="w-full border-2 border-purple-300 rounded p-2 h-20 resize-none focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="اكتب إجابتك هنا..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Score */}
                    <div className="bg-white rounded-lg p-4 border border-purple-200 mt-6">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-purple-800">المجموع</span>
                        <div className="bg-white border border-purple-300 px-3 py-1 rounded">{calculateArtsTotal()}</div>
                      </div>
                                             <div className="mt-3 text-sm text-purple-700">
                         <p>أسئلة الميل و التوافق (1,2,3,4,6,7,8)</p>
                         <p>أسئلة عدم الميل واللا توافق (9,10,11,5)</p>
                         <p>السؤال 2: اختيار المادة المفضلة مع تحديد مستوى التفضيل (محسوب في النتيجة)</p>
                         <p>السؤال 5: اختيار المادة مع تحديد مستوى عدم الارتياح (محسوب في النتيجة)</p>
                         <p>السؤال 9: اختيار المادة مع تحديد مستوى عدم الرغبة (محسوب في النتيجة)</p>
                       </div>
                    </div>
                  </div>
                  
                </div>
                
                <div className="mt-8 text-center space-x-4">
                  <button 
                    onClick={resetTest}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors text-lg font-medium"
                  >
                    تهيئة/إعادة تعيين الاختبار
                  </button>
                  <button 
                    onClick={calculateScores}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 text-lg font-medium shadow-lg"
                  >
                    حساب النتائج والتوصية
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)]">
                <div className="text-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-800 mb-3">نتائج ميولك نحو المواد</h4>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-4"></div>
                  
                  {/* معلومات الثلميذ */}
                  <div className="bg-white rounded-lg p-6 border-2 border-blue-200 shadow-lg max-w-2xl mx-auto">
                    <h5 className="text-xl font-bold text-blue-800 mb-4 text-center">معلومات الثلميذ</h5>
                    
                    {/* Ligne 1: Nom et Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">الاسم</div>
                          <div className="text-lg font-bold text-blue-700">{personalInfo.name || 'غير محدد'}</div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">اللقب</div>
                          <div className="text-lg font-bold text-blue-700">{personalInfo.surname || 'غير محدد'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ligne 2: Section et Lycée */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">القسم</div>
                          <div className="text-lg font-bold text-purple-700">{personalInfo.section || 'غير محدد'}</div>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">نوع المؤسسة :</div>
                          <div className="text-lg font-bold text-purple-700">{personalInfo.schoolType || getCycleConfig(currentCycle).schoolName}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ligne 3: Date (pleine largeur) */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600 mb-2">تاريخ الإجراء</div>
                        <div className="text-lg font-bold text-green-700">{personalInfo.date || 'غير محدد'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* زر الطباعة */}
                  <div className="text-center mb-6">
                    <button
                      onClick={() => printTestResults()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg font-medium shadow-lg flex items-center gap-3 mx-auto"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      طباعة النتائج
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* علوم وتكنولوجيا */}
                  <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                    <h5 className="text-xl font-bold text-blue-800 mb-4 text-center">علوم وتكنولوجيا</h5>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{scienceScore.toFixed(1)}%</div>
                      <div className="w-full bg-blue-200 rounded-full h-4 mb-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${scienceScore}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-blue-700">
                        {scienceScore >= 80 ? 'ميل قوي جداً' :
                         scienceScore >= 60 ? 'ميل قوي' :
                         scienceScore >= 40 ? 'ميل متوسط' :
                         scienceScore >= 20 ? 'ميل ضعيف' : 'ميل ضعيف جداً'}
                      </div>
                      {scienceQ2Subject && (
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-800">المادة المفضلة:</div>
                          <div className="text-lg font-bold text-blue-600">{scienceQ2Subject}</div>
                        </div>
                      )}
                      {scienceQ5Subject && (
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-800">المادة (عدم الارتياح):</div>
                          <div className="text-lg font-bold text-blue-600">{scienceQ5Subject}</div>
                        </div>
                      )}
                      {scienceQ9Subject && (
                        <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                          <div className="text-sm font-medium text-blue-800">المادة (عدم الرغبة):</div>
                          <div className="text-lg font-bold text-blue-600">{scienceQ9Subject}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* آداب */}
                  <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                    <h5 className="text-xl font-bold text-purple-800 mb-4 text-center">آداب</h5>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">{artsScore.toFixed(1)}%</div>
                      <div className="w-full bg-purple-200 rounded-full h-4 mb-4">
                        <div className="bg-purple-600 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${artsScore}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-purple-700">
                        {artsScore >= 80 ? 'ميل قوي جداً' :
                         artsScore >= 60 ? 'ميل قوي' :
                         artsScore >= 40 ? 'ميل متوسط' :
                         artsScore >= 20 ? 'ميل ضعيف' : 'ميل ضعيف جداً'}
                      </div>
                      {artsQ2Subject && (
                        <div className="mt-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
                          <div className="text-sm font-medium text-purple-800">المادة المفضلة:</div>
                          <div className="text-lg font-bold text-purple-600">{artsQ2Subject}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 mb-6 shadow-lg">
                  <div className="text-center mb-4">
                    <h5 className="text-2xl font-bold text-gray-800 mb-2">التوصية النهائية</h5>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600 mb-3 p-3 bg-white rounded-lg shadow-md border-2 border-blue-200">
                      {recommendation}
                    </div>
                    
                    <div className="text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
                      {recommendation === 'علوم وتكنولوجيا' ? (
                        <div className="space-y-3">
                          <p className="text-lg font-semibold text-blue-800 mb-2">
                            بناءً على إجاباتك، يبدو أن لديك ميل قوي نحو المواد العلمية والتكنولوجية
                          </p>
                          <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                            <h6 className="font-bold text-blue-800 mb-2 text-base">نوصي باختيار مسار علوم وتكنولوجيا للأسباب التالية:</h6>
                            <ul className="text-right space-y-2 text-blue-700">
                              <li>• لديك قدرات عالية في التفكير المنطقي والتحليل العلمي</li>
                              <li>• تظهر اهتماماً كبيراً بالمواد العلمية والتكنولوجية</li>
                              <li>• لديك مهارات في حل المشكلات بطريقة علمية</li>
                              <li>• هذا المسار سيفتح لك آفاقاً واسعة في مجالات العلوم والهندسة والتكنولوجيا</li>
                            </ul>
                          </div>
                        </div>
                      ) : recommendation === 'آداب' ? (
                        <div className="space-y-3">
                          <p className="text-lg font-semibold text-purple-800 mb-2">
                            بناءً على إجاباتك، يبدو أن لديك ميل قوي نحو المواد الأدبية والإنسانية
                          </p>
                          <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
                            <h6 className="font-bold text-purple-800 mb-2 text-base">نوصي باختيار مسار آداب للأسباب التالية:</h6>
                            <ul className="text-right space-y-2 text-purple-700">
                              <li>• لديك قدرات عالية في الفهم والتحليل الأدبي</li>
                              <li>• تظهر اهتماماً كبيراً بالمواد الإنسانية والاجتماعية</li>
                              <li>• لديك مهارات في التعبير والكتابة والتحليل النقدي</li>
                              <li>• هذا المسار سيفتح لك آفاقاً واسعة في مجالات الأدب والفلسفة والعلوم الإنسانية</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-lg font-semibold text-gray-800 mb-2">
                            لديك ميول متوازنة نحو كلا المسارين
                          </p>
                          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                            <h6 className="font-bold text-gray-800 mb-2 text-base">يمكنك اختيار أي منهما حسب تفضيلاتك الشخصية:</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h6 className="font-bold text-blue-800 mb-2 block">مسار علوم وتكنولوجيا:</h6>
                                <ul className="text-blue-700 text-sm space-y-1">
                                  <li>• إذا كنت تفضل التفكير العلمي</li>
                                  <li>• إذا كنت مهتماً بالتكنولوجيا</li>
                                  <li>• إذا كنت تريد العمل في مجالات الهندسة والعلوم</li>
                                </ul>
                              </div>
                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h6 className="font-bold text-purple-800 mb-2 block">مسار آداب:</h6>
                                <ul className="text-purple-700 text-sm space-y-1">
                                  <li>• إذا كنت تفضل التحليل الأدبي</li>
                                  <li>• إذا كنت مهتماً بالعلوم الإنسانية</li>
                                  <li>• إذا كنت تريد العمل في مجالات الأدب والفلسفة</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-semibold text-sm">
                      💡 نصيحة: خذ وقتك في التفكير في هذا القرار، فهو مهم لمستقبلك الدراسي والمهني
                    </p>
                  </div>
                </div>
                
                <div className="text-center space-x-4">
                  <button 
                    onClick={resetTest}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    إعادة الاختبار
                  </button>
                  <button 
                    onClick={() => setShowInclinationModal(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* En-tête avec flèche de retour */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          title="Retour à la لوحة القيادة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800">إدارة الإختبارات</h1>
      </div>

      {/* Header Section with Enhanced Design */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">إدارة الإختبارات</h2>
              <p className="text-gray-600 text-sm">نظام شامل لإدارة وتقييم الاختبارات التعليمية</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowResultModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="bg-white bg-opacity-20 rounded-full p-1.5">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">تسجيل نتيجة اختبار</span>
            </button>
            <button
              onClick={() => navigate('new')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="bg-white bg-opacity-20 rounded-full p-1.5">
                <PlusCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm">إنشاء اختبار جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('types')}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                activeTab === 'types'
                  ? 'border-b-2 border-blue-600 text-blue-700 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>أنواع الاختبارات</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                activeTab === 'results'
                  ? 'border-b-2 border-blue-600 text-blue-700 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>نتائج الاختبارات</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'types' ? (
            <div className="space-y-6">
              {/* Main Test Types Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testTypes.map((test) => (
                  <div
                    key={test.id}
                    className="group bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${test.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <test.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{test.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{test.description}</p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`take/${test.id}`)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span className="font-semibold text-sm">تقديم اختبار</span>
                        </button>
                        <button
                          onClick={() => navigate(`questions/${test.id}`)}
                          className="flex-1 border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm hover:scale-105"
                        >
                          <Settings className="w-4 h-4" />
                          <span>إعداد الأسئلة</span>
                        </button>
                      </div>
                      <button
                        onClick={() => handleCreateTestWithQuestions(test.id)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">إنشاء اختبار بأسئلة جاهزة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Test Sections */}
              <div className="mt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">اختبارات متخصصة</h3>
                  <p className="text-gray-600 text-sm">اختبارات متقدمة لتقييم شامل للطلاب</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Inclination section */}
                  <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-yellow-700 transition-colors">الميول نحو المواد</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">تحديد الميل الدراسي وفتح صفحة التقييم التفصيلية</p>
                     <button
                       onClick={() => setShowInclinationModal(true)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Lightbulb className="w-5 h-5" />
                       <span>الميول نحو المواد</span>
                     </button>
                  </div>

                  {/* Representational styles section */}
                  <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-700 transition-colors">الأنماط التمثيلية</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">تحديد النمط التمثيلي المفضل (بصري / سمعي / حسي)</p>
                     <button
                       onClick={() => setShowRepModal(true)}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Sparkles className="w-5 h-5" />
                      <span>الأنماط التمثيلية</span>
                     </button>
                   </div>

                  {/* Creative thinking test section */}
                  <div className="group bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">التفكير الإبداعي</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">قياس مهارات التفكير الإبداعي والابتكار والمرونة الذهنية</p>
                     <button
                       onClick={() => setShowCreativeModal(true)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Sparkles className="w-5 h-5" />
                      <span>التفكير الإبداعي</span>
                     </button>
                   </div>

                  {/* Social skills test section */}
                  <div className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors">المهارات الاجتماعية</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">تقييم القدرة على التواصل والتعامل مع الآخرين وبناء العلاقات</p>
                     <button
                       onClick={() => setShowSocialModal(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Users className="w-5 h-5" />
                      <span className="text-xs">المهارات الاجتماعية</span>
                     </button>
                   </div>

                  {/* Personality test section */}
                  <div className="group bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">التوجه الشخصي</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">اختبار شامل لتحليل وفهم السمات الشخصية</p>
                     <button
                       onClick={() => setShowPersonalityModal(true)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <UserCircle2 className="w-5 h-5" />
                      <span>التوجه الشخصي</span>
                     </button>
                   </div>

                  {/* Professional orientation test section */}
                  <div className="group bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">الميول المهنية</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">تحديد الميول المهنية والمسار الوظيفي المناسب</p>
                     <button
                       onClick={() => setShowProfessionalModal(true)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-3 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Briefcase className="w-5 h-5" />
                      <span>الميول المهنية</span>
                     </button>
                   </div>

                  {/* Cognitive abilities test section */}
                  <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Brain className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">القدرات الفكرية</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">اختبار شامل لقياس القدرات العقلية والذكاء</p>
                     <button
                       onClick={() => setShowCognitiveModal(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Brain className="w-5 h-5" />
                      <span>القدرات الفكرية</span>
                     </button>
                   </div>

                  {/* Emotional intelligence test section */}
                  <div className="group bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6 hover:border-pink-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-pink-700 transition-colors">الذكاء العاطفي</h3>
                    </div>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">اختبار شامل لقياس الذكاء العاطفي والقدرة على إدارة المشاعر</p>
                     <button
                       onClick={() => setShowEmotionalModal(true)}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                     >
                      <Heart className="w-5 h-5" />
                      <span>الذكاء العاطفي</span>
                     </button>
                   </div>

                </div>
              </div>
            </div>
          ) : (
            <TestResultsSection setActiveTab={setActiveTab} />
          )}
        </div>

        {/* Modal: اختبار النماط التمثيلية */}
        {showRepModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="p-4 border-b bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-right flex-1 text-gray-800">الأنماط التمثيلية (بصري / سمعي / حسي)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowRepModal(false)} className="text-gray-500 hover:text-gray-700 p-2"><X className="w-6 h-6"/></button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg p-4 border border-teal-200 mb-6">
                    <h6 className="font-semibold text-teal-800 mb-3">المعلومات الشخصية</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-teal-700 mb-1">الاسم :</label>
                        <input
                          type="text"
                          value={repPersonalInfo.name}
                          onChange={(e) => handleRepPersonalInfoChange('name', e.target.value)}
                          className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="أدخل الاسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-teal-700 mb-1">اللقب :</label>
                        <input
                          type="text"
                          value={repPersonalInfo.surname}
                          onChange={(e) => handleRepPersonalInfoChange('surname', e.target.value)}
                          className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="أدخل اللقب"
                        />
                      </div>
                <div>
                  <label className="block text-sm font-medium text-teal-700 mb-1">الولاية :</label>
                  <input
                    type="text"
                    value={repPersonalInfo.wilaya || ''}
                    onChange={(e) => handleRepPersonalInfoChange('wilaya', e.target.value)}
                    className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                    placeholder="أدخل اسم الولاية"
                  />
                </div>
                      <div>
                        <label className="block text-sm font-medium text-teal-700 mb-1">القسم :</label>
                        <input
                          type="text"
                          value={repPersonalInfo.section}
                          onChange={(e) => handleRepPersonalInfoChange('section', e.target.value)}
                          className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="أدخل القسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-teal-700 mb-1">نوع المؤسسة :</label>
                        <input
                          type="text"
                          value={repPersonalInfo.schoolType || ''}
                          onChange={(e) => handleRepPersonalInfoChange('schoolType', e.target.value)}
                          className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                          placeholder={getCycleConfig(currentCycle).schoolName}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-teal-700 mb-1">مستشار(ة) التوجيه :</label>
                        <input
                          type="text"
                          value={(repPersonalInfo as any).counselorName || ''}
                          onChange={(e) => handleRepPersonalInfoChange('counselorName', e.target.value)}
                          className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="أدخل اسم مستشار التوجيه"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-teal-700 mb-1">السنة الدراسية :</label>
                        <input
                          type="text"
                          value={(repPersonalInfo as any).academicYear || ''}
                          onChange={(e) => handleRepPersonalInfoChange('academicYear', e.target.value)}
                          className="w-full border-b-2 border-teal-300 px-2 py-1 focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="مثال: 2025-2026"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-teal-700 mb-1">تاريخ الإجراء :</label>
                        <DatePicker
                          selected={repPersonalInfo.date ? new Date(repPersonalInfo.date) : null}
                          onChange={(date) => handleRepPersonalInfoChange('date', date ? date.toISOString().split('T')[0] : '')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholderText="aaaa/mm/jj"
                          dateFormat="yyyy/MM/dd"
                          locale="ar"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={15}
                          showMonthDropdown
                          dropdownMode="select"
                          isClearable
                          clearButtonTitle="مسح"
                          todayButton="اليوم"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="md:col-span-2"></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التلميذ</label>
                      <select value={repSelectedStudent} onChange={(e)=>setRepSelectedStudent(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">اختر تلميذاً (اختياري للحفظ)</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.level} - {s.group}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                    {repQuestions.map((it, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${isValidRank(repRanks[idx]) ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                      >
                        <div className="font-semibold mb-3">{idx+1}. {it.q}</div>
                        {/* NEW ranking selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(['a','b','c'] as const).map((key) => (
                            <div key={key} className="border rounded-md p-2">
                              <div className="text-sm font-semibold mb-1">{key==='a' ? 'أ' : key==='b' ? 'ب' : 'ج'} - {key==='a'? it.a : key==='b' ? it.b : it.c}</div>
                              <select
                                value={(repRanks[idx]?.[key] ?? (key==='a' ? 3 : key==='b' ? 2 : 1)) as any}
                                onChange={(e)=>{
                                  const n = parseInt(e.target.value, 10);
                                    updateRank(idx, key, n);
                                }}
                                className="w-20 h-9 px-1 py-1 border-2 rounded text-center text-base bg-white"
                                title="اختر 3 أو 2 أو 1"
                              >
                                <option value={3}>3</option>
                                <option value={2}>2</option>
                                <option value={1}>1</option>
                              </select>
                              <div className="text-xs text-gray-500 mt-1">أدخل 3 للجواب المفضل، 2 للذي يليه، 1 للأخير</div>
                            </div>
                          ))}
                        </div>
                        {!isValidRank(repRanks[idx]) && (
                          <div className="mt-2 text-sm text-red-600">الرجاء ترتيب الإجابات 3 ثم 2 ثم 1 دون تكرار نفس الرقم.</div>
                        )}
                      </div>
                    ))}
                  <div className="flex justify-end">
                    <div className="flex gap-2">
                      <button onClick={()=>{ computeRepTotals(); }} className="px-6 py-2 rounded-lg text-white bg-teal-600 hover:bg-teal-700">حساب النتائج</button>
                      <button onClick={exportRepPDF} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        حفظ كـ PDF
                      </button>
                    </div>
                  </div>
                  {(repTotals.visual+repTotals.auditory+repTotals.kinesthetic) > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="border-2 border-blue-300 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-blue-800 mb-2">النظام البصري (أ)</div>
                        <div className="text-3xl font-extrabold text-blue-900">{repTotals.visual}</div>
                      </div>
                      <div className="border-2 border-amber-300 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-amber-800 mb-2">النظام السمعي (ب)</div>
                        <div className="text-3xl font-extrabold text-amber-900">{repTotals.auditory}</div>
                      </div>
                      <div className="border-2 border-green-300 rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-green-800 mb-2">النظام الحسي (ج)</div>
                        <div className="text-3xl font-extrabold text-green-900">{repTotals.kinesthetic}</div>
                      </div>
                      <div className="md:col-span-3 border rounded-lg p-4 bg-gray-50">
                        <div className="font-bold mb-1">التوصية المختصرة:</div>
                        <div className="text-gray-700">{getRepAdvice()}</div>
                      </div>
                    </div>
                  )}
                  {/* Progress to 60 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-blue-800 mb-2">تعليمات الاختبار:</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• عندك عشرة 10 أسئلة لكل سؤال 3 أجوبة تصف أسلوبك المفضل</p>
                      <p>• المطلوب ترتيب الأجوبة تدريجياً:</p>
                      <p>• الجواب الذي تفضله أكثر تضع له 3 نقاط (من القائمة)</p>
                      <p>• الذي يليه 2 نقطتان</p>
                      <p>• آخر جواب تفضله تضع له نقطة واحدة 1</p>
                    </div>
                  </div>
                  
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">المجموع الحالي (أ + ب + ج)</div>
                      <div className={`text-sm ${isTotalValid() ? 'text-green-700' : 'text-red-700'}`}>{getCurrentSum()} / 60</div>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-3 ${isTotalValid() ? 'bg-teal-600' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, Math.round((getCurrentSum()/60)*100))}%` }}
                      />
                    </div>
                    {!isTotalValid() && (
                      <div className="mt-2 text-xs text-red-600">يجب أن يكون المجموع مساوياً لـ 60 قبل حساب النتائج.</div>
                    )}
                  </div>
                  {/* Instructions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm leading-7">
                    <div className="font-bold text-yellow-800 mb-2">اقرأ التعليمات والملاحظة قبل الشروع في تطبيق الاختبار</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div>عندك عشرة 10 أسئلة لكل سؤال 3 أجوبة تصف أسلوبك المفضل</div>
                        <div>المطلوب ترتيب الأجوبة تدريجياً:</div>
                        <div>الجواب الذي تفضله أكثر تضع له 3 نقاط (من القائمة) .. الذي يليه 2 نقطتان</div>
                        <div>وآخر جواب تفضله تضع له نقطة واحدة 1</div>
                      </div>
                      <div>
                        <div>النقاط التي حصلت عليها في الإجابة (أ) تشير إلى أنك ذو نظام بصري</div>
                        <div>والنقاط التي حصلت عليها في الإجابة (ب) تشير إلى أنك ذو نظام سمعي</div>
                        <div>والنقاط التي حصلت عليها في الإجابة (ج) تشير إلى أنك ذو نظام حسي</div>
                        <div className="font-semibold">تأكد أن مجموع أ + ب + ج = 60</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: التوجه الشخصي */}
        {showPersonalityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-right flex-1 text-gray-800">التوجه الشخصي</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowPersonalityModal(false)} className="text-gray-500 hover:text-gray-700 p-2"><X className="w-6 h-6"/></button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg p-4 border border-indigo-200 mb-6">
                    <h6 className="font-semibold text-indigo-800 mb-3">المعلومات الشخصية</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-1">الاسم :</label>
                        <input
                          type="text"
                          value={personalityPersonalInfo.name}
                          onChange={(e) => handlePersonalityPersonalInfoChange('name', e.target.value)}
                          className="w-full border-b-2 border-indigo-300 px-2 py-1 focus:border-indigo-500 focus:outline-none text-sm"
                          placeholder="أدخل الاسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-1">اللقب :</label>
                        <input
                          type="text"
                          value={personalityPersonalInfo.surname}
                          onChange={(e) => handlePersonalityPersonalInfoChange('surname', e.target.value)}
                          className="w-full border-b-2 border-indigo-300 px-2 py-1 focus:border-indigo-500 focus:outline-none text-sm"
                          placeholder="أدخل اللقب"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-1">القسم :</label>
                        <input
                          type="text"
                          value={personalityPersonalInfo.section}
                          onChange={(e) => handlePersonalityPersonalInfoChange('section', e.target.value)}
                          className="w-full border-b-2 border-indigo-300 px-2 py-1 focus:border-indigo-500 focus:outline-none text-sm"
                          placeholder="أدخل القسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-700 mb-1">نوع المؤسسة :</label>
                        <input
                          type="text"
                          value={personalityPersonalInfo.schoolType || ''}
                          onChange={(e) => handlePersonalityPersonalInfoChange('schoolType', e.target.value)}
                          className="w-full border-b-2 border-indigo-300 px-2 py-1 focus:border-indigo-500 focus:outline-none text-sm"
                          placeholder={getCycleConfig(currentCycle).schoolName}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-indigo-700 mb-1">تاريخ الإجراء :</label>
                        <DatePicker
                          selected={personalityPersonalInfo.date ? new Date(personalityPersonalInfo.date) : null}
                          onChange={(date) => handlePersonalityPersonalInfoChange('date', date ? date.toISOString().split('T')[0] : '')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholderText="aaaa/mm/jj"
                          dateFormat="yyyy/MM/dd"
                          locale="ar"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={15}
                          showMonthDropdown
                          dropdownMode="select"
                          isClearable
                          clearButtonTitle="مسح"
                          todayButton="اليوم"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="md:col-span-2"></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التلميذ</label>
                      <select value={personalitySelectedStudent} onChange={(e)=>setPersonalitySelectedStudent(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">اختر تلميذاً (اختياري للحفظ)</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.level} - {s.group}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm leading-7">
                    <div className="font-bold text-indigo-800 mb-2">تعليمات الاختبار</div>
                    <div className="text-indigo-700 space-y-2">
                      <p>هذا غالبًا ما يكون الجزء المفضل لدى كل من يُجري، مثلك، اختبارات الشخصية في المجلات أو مباشرةً عبر الإنترنت: الإجابة على أسئلة تُساعد في تحديد سمات شخصيتك.</p>
                      <p>هذا هو هدف اختبار الشخصية المجاني هذا: تمكينك من تحديد أذواقك وصفاتك وعيوبك بشكل أفضل... حان دورك!</p>
                      <p>ستصبح الأسئلة أكثر تحديدًا تدريجيًا، لتُقدم لك في النهاية اقتراحات متشابهة جدًا، وإن كانت مختلفة، وسيتعين عليك اختيار الخيار الأقرب إلى مشاعرك، لفهم نفسك قدر الإمكان.</p>
                    </div>
                  </div>

                  {/* Questions */}
                  {personalityQuestions.map((question, idx) => (
                    <div key={idx} className="border rounded-lg p-4 border-indigo-200 bg-indigo-50">
                      <div className="font-semibold mb-3 text-indigo-800">السؤال {idx + 1}</div>
                      <div className="font-semibold mb-3 text-gray-800">{question.q}</div>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
                          <input
                            type="radio"
                            name={`personality_${idx}`}
                            value="a"
                            checked={personalityAnswers[idx] === 'a'}
                            onChange={() => handlePersonalityAnswer(idx, 'a')}
                            className="mt-1 text-indigo-600"
                          />
                          <span className="text-sm">{question.a}</span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
                          <input
                            type="radio"
                            name={`personality_${idx}`}
                            value="b"
                            checked={personalityAnswers[idx] === 'b'}
                            onChange={() => handlePersonalityAnswer(idx, 'b')}
                            className="mt-1 text-indigo-600"
                          />
                          <span className="text-sm">{question.b}</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={calculatePersonalityResults} 
                      className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      حساب النتائج
                    </button>
                    <button 
                      onClick={savePersonalityResult}
                      disabled={personalitySaving}
                      className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {personalitySaving ? 'جاري الحفظ...' : 'حفظ النتيجة'}
                    </button>
                    {personalityResults && (
                      <button 
                        onClick={exportPersonalityPDF}
                        className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        حفظ كـ PDF
                      </button>
                    )}
                  </div>

                  {/* Results Display */}
                  {personalityResults && (
                    <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                      <h4 className="text-xl font-bold text-indigo-800 mb-4 text-center">نتائج اختبار الشخصية</h4>
                      
                      {/* Dominant Trait */}
                      <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-200">
                        <h5 className="text-lg font-bold text-indigo-700 mb-2">الصفة المهيمنة</h5>
                        <div className="text-2xl font-bold text-indigo-600 text-center mb-2">{personalityResults.dominantTrait}</div>
                        <p className="text-gray-700 text-center">{personalityResults.description}</p>
                      </div>

                      {/* All Traits */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 no-print">
                        <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الانبساطية</div>
                          <div className="text-xl font-bold text-indigo-600">{personalityResults.extroversion}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الموافقة</div>
                          <div className="text-xl font-bold text-indigo-600">{personalityResults.agreeableness}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الضمير الحي</div>
                          <div className="text-xl font-bold text-indigo-600">{personalityResults.conscientiousness}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">العصابية</div>
                          <div className="text-xl font-bold text-indigo-600">{personalityResults.neuroticism}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الانفتاح</div>
                          <div className="text-xl font-bold text-indigo-600">{personalityResults.openness}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: اختبار القدرات الفكرية */}
        {showCognitiveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-right flex-1 text-gray-800">اختبار القدرات الفكرية</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowCognitiveModal(false)} className="text-gray-500 hover:text-gray-700 p-2"><X className="w-6 h-6"/></button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200 mb-6">
                    <h6 className="font-semibold text-blue-800 mb-3">المعلومات الشخصية</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">الاسم :</label>
                        <input
                          type="text"
                          value={cognitivePersonalInfo.name}
                          onChange={(e) => handleCognitivePersonalInfoChange('name', e.target.value)}
                          className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                          placeholder="أدخل الاسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">اللقب :</label>
                        <input
                          type="text"
                          value={cognitivePersonalInfo.surname}
                          onChange={(e) => handleCognitivePersonalInfoChange('surname', e.target.value)}
                          className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                          placeholder="أدخل اللقب"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">القسم :</label>
                        <input
                          type="text"
                          value={cognitivePersonalInfo.section}
                          onChange={(e) => handleCognitivePersonalInfoChange('section', e.target.value)}
                          className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm"
                          placeholder="أدخل القسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">نوع المؤسسة :</label>
                        <select
                          value={cognitivePersonalInfo.schoolType || (currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة')}
                          onChange={e => handleCognitivePersonalInfoChange('schoolType', e.target.value)}
                          className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm bg-white"
                        >
                <option value={getCycleConfig(currentCycle).schoolName}>
                  {getCycleConfig(currentCycle).schoolName}
                          </option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-blue-700 mb-1">تاريخ الإجراء :</label>
                        <DatePicker
                          selected={cognitivePersonalInfo.date ? new Date(cognitivePersonalInfo.date) : null}
                          onChange={(date) => handleCognitivePersonalInfoChange('date', date ? date.toISOString().split('T')[0] : '')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholderText="aaaa/mm/jj"
                          dateFormat="yyyy/MM/dd"
                          locale="ar"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={15}
                          showMonthDropdown
                          dropdownMode="select"
                          isClearable
                          clearButtonTitle="مسح"
                          todayButton="اليوم"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div className="md:col-span-2"></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التلميذ</label>
                      <select value={cognitiveSelectedStudent} onChange={(e)=>setCognitiveSelectedStudent(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">اختر تلميذاً (اختياري للحفظ)</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.level} - {s.group}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm leading-7">
                    <div className="font-bold text-blue-800 mb-2">تعليمات الاختبار</div>
                    <div className="text-blue-700 space-y-2">
                      <p>هذا الاختبار يساعدك على التعرف بشكل أفضل على قدراتك العقلية: قوة الملاحظة، سرعة التفكير، القدرة على التحليل، الإبداع، المنطق، والذاكرة.</p>
                      <p>الهدف من هذا الاختبار هو تمكينك من فهم نقاط قوتك الذهنية والجوانب التي يمكنك تطويرها.</p>
                      <p>ستصبح الأسئلة أكثر تحديدًا تدريجيًا، وفي النهاية سيكون عليك اختيار الإجابة الأقرب إلى طريقة تفكيرك.</p>
                    </div>
                  </div>

                  {/* Questions */}
                  {cognitiveQuestions.map((question, idx) => (
                    <div key={idx} className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                      <div className="font-semibold mb-3 text-blue-800">السؤال {idx + 1}</div>
                      <div className="font-semibold mb-3 text-gray-800">{question.q}</div>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors">
                          <input
                            type="radio"
                            name={`cognitive_${idx}`}
                            value="a"
                            checked={cognitiveAnswers[idx] === 'a'}
                            onChange={() => handleCognitiveAnswer(idx, 'a')}
                            className="mt-1 text-blue-600"
                          />
                          <span className="text-sm">{question.a}</span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition-colors">
                          <input
                            type="radio"
                            name={`cognitive_${idx}`}
                            value="b"
                            checked={cognitiveAnswers[idx] === 'b'}
                            onChange={() => handleCognitiveAnswer(idx, 'b')}
                            className="mt-1 text-blue-600"
                          />
                          <span className="text-sm">{question.b}</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <button 
                      onClick={calculateCognitiveResults} 
                      disabled={Object.keys(cognitiveAnswers).length < 20}
                      className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      حساب النتائج والتوصية
                    </button>
                    <button 
                      onClick={resetCognitiveTest}
                      className="px-6 py-2 rounded-lg text-white bg-orange-600 hover:bg-orange-700"
                    >
                      تهيئة/إعادة تعيين الاختبار
                    </button>
                    <button 
                      onClick={saveCognitiveResult}
                      disabled={cognitiveSaving || Object.keys(cognitiveAnswers).length < 20}
                      className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cognitiveSaving ? 'جاري الحفظ...' : 'حفظ النتيجة'}
                    </button>
                  </div>

                  {/* Results Display */}
                  {cognitiveResults && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 print-area">
                      <h4 className="text-xl font-bold text-blue-800 mb-4 text-center">نتائج اختبار القدرات الفكرية</h4>
                      
                      {/* Dominant Profile */}
                      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                        <h5 className="text-lg font-bold text-blue-700 mb-2">الملف المهيمن</h5>
                        <div className="text-2xl font-bold text-blue-600 text-center mb-2">{cognitiveResults.dominantProfile}</div>
                        <p className="text-gray-700 text-center">{cognitiveResults.description}</p>
                      </div>

                      {/* All Profiles */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">التحليلي</div>
                          <div className="text-xl font-bold text-blue-600">{cognitiveResults.analytical}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الإبداعي</div>
                          <div className="text-xl font-bold text-blue-600">{cognitiveResults.creative}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الاجتماعي</div>
                          <div className="text-xl font-bold text-blue-600">{cognitiveResults.social}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">القيادي</div>
                          <div className="text-xl font-bold text-blue-600">{cognitiveResults.leadership}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">المنظم</div>
                          <div className="text-xl font-bold text-blue-600">{cognitiveResults.detail}%</div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end no-print">
                        <button
                          onClick={handlePrint}
                          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                        >
                          طباعة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: اختبار الميول المهنية */}
        {showProfessionalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-green-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-right flex-1 text-gray-800">اختبار الميول المهنية</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowProfessionalModal(false)} className="text-gray-500 hover:text-gray-700 p-2"><X className="w-6 h-6"/></button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg p-4 border border-emerald-200 mb-6">
                    <h6 className="font-semibold text-emerald-800 mb-3">المعلومات الشخصية</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                        <input
                          type="text"
                          value={professionalPersonalInfo.name}
                          onChange={(e) => handleProfessionalPersonalInfoChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اللقب</label>
                        <input
                          type="text"
                          value={professionalPersonalInfo.surname}
                          onChange={(e) => handleProfessionalPersonalInfoChange('surname', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                        <input
                          type="text"
                          value={professionalPersonalInfo.section}
                          onChange={(e) => handleProfessionalPersonalInfoChange('section', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع المدرسة</label>
                        <select
                          value={professionalPersonalInfo.schoolType}
                          onChange={(e) => handleProfessionalPersonalInfoChange('schoolType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="المتوسطة">المتوسطة</option>
                          <option value="الثانوية">الثانوية</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Student Selection */}
                  <div className="bg-white rounded-lg p-4 border border-emerald-200 mb-6">
                    <h6 className="font-semibold text-emerald-800 mb-3">اختيار التلميذ</h6>
                    <select
                      value={professionalSelectedStudent}
                      onChange={(e) => setProfessionalSelectedStudent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">اختر تلميذاً</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Test Instructions */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200 mb-6">
                    <h6 className="font-semibold text-emerald-800 mb-2">تعليمات الاختبار</h6>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      هذا الاختبار سيساعدك على التعرف أكثر على ميولك المهنية. اختر دائمًا الجواب الأقرب إلى شخصيتك في بيئة العمل. 
                      الأسئلة التالية ستساعدك على اكتشاف نوع المهنة أو بيئة العمل التي تناسبك أكثر.
                    </p>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {professionalQuestions.map((question, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-6 border border-emerald-200">
                        <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                          السؤال {idx + 1}
                        </h4>
                        <p className="text-gray-700 mb-4 text-base">{question.q}</p>
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`professional_question_${idx}`}
                              checked={professionalAnswers[idx] === 'a'}
                              onChange={() => handleProfessionalAnswer(idx, 'a')}
                              className="mt-1 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-gray-700">{question.a}</span>
                          </label>
                          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                            <input
                              type="radio"
                              name={`professional_question_${idx}`}
                              checked={professionalAnswers[idx] === 'b'}
                              onChange={() => handleProfessionalAnswer(idx, 'b')}
                              className="mt-1 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-gray-700">{question.b}</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6">
                    <button
                      onClick={calculateProfessionalResults}
                      disabled={Object.keys(professionalAnswers).length < 20}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calculator className="w-5 h-5" />
                      حساب النتائج والتوصية
                    </button>
                    <button
                      onClick={resetProfessionalTest}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      تهيئة/إعادة تعيين الاختبار
                    </button>
                    <button
                      onClick={saveProfessionalResult}
                      disabled={professionalSaving || !professionalSelectedStudent || Object.keys(professionalAnswers).length < 20}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-5 h-5" />
                      {professionalSaving ? 'جاري الحفظ...' : 'حفظ النتيجة'}
                    </button>
                  </div>

                  {/* Results Display */}
                  {professionalResults && (
                    <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-200 print-area">
                      <h3 className="text-2xl font-bold text-emerald-800 mb-6 text-center">نتائج اختبار الميول المهنية</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">القيادة</div>
                          <div className="text-xl font-bold text-emerald-600">{professionalResults.leadership}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">العمل الجماعي</div>
                          <div className="text-xl font-bold text-emerald-600">{professionalResults.teamwork}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">الإبداع</div>
                          <div className="text-xl font-bold text-emerald-600">{professionalResults.creativity}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">التنظيم</div>
                          <div className="text-xl font-bold text-emerald-600">{professionalResults.organization}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                          <div className="text-sm font-medium text-gray-600 mb-1">التواصل</div>
                          <div className="text-xl font-bold text-emerald-600">{professionalResults.communication}%</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-emerald-200 mb-4">
                        <h4 className="font-semibold text-emerald-800 mb-2">التوجه المهني المهيمن</h4>
                        <p className="text-lg font-bold text-gray-800 text-center">{professionalResults.dominantOrientation}</p>
                      </div>

                    <div className="bg-white rounded-lg p-4 border border-emerald-200">
                        <h4 className="font-semibold text-emerald-800 mb-2">الوصف المهني</h4>
                        <p className="text-gray-700 leading-relaxed">{professionalResults.description}</p>
                      </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handlePrint}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                      >
                        طباعة
                      </button>
                    </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: اختبار الذكاء العاطفي */}
        {showEmotionalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-right flex-1 text-gray-800">اختبار الذكاء العاطفي</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setShowEmotionalModal(false)} className="text-gray-500 hover:text-gray-700 p-2"><X className="w-6 h-6"/></button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg p-4 border border-pink-200 mb-6">
                    <h6 className="font-semibold text-pink-800 mb-3">المعلومات الشخصية</h6>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                        <input
                          type="text"
                          value={emotionalPersonalInfo.name}
                          onChange={(e) => handleEmotionalPersonalInfoChange('name', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="أدخل الاسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اللقب</label>
                        <input
                          type="text"
                          value={emotionalPersonalInfo.surname}
                          onChange={(e) => handleEmotionalPersonalInfoChange('surname', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="أدخل اللقب"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                        <input
                          type="text"
                          value={emotionalPersonalInfo.section}
                          onChange={(e) => handleEmotionalPersonalInfoChange('section', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="أدخل القسم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع المدرسة</label>
                        <select
                          value={emotionalPersonalInfo.schoolType}
                          onChange={(e) => handleEmotionalPersonalInfoChange('schoolType', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="المتوسطة">المتوسطة</option>
                          <option value="الثانوية">الثانوية</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                        <DatePicker
                          selected={emotionalPersonalInfo.date ? new Date(emotionalPersonalInfo.date) : null}
                          onChange={(date) => handleEmotionalPersonalInfoChange('date', date?.toISOString().split('T')[0] || '')}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholderText="اختر التاريخ"
                          dateFormat="yyyy-MM-dd"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student Selection */}
                  <div className="bg-white rounded-lg p-4 border border-pink-200 mb-6">
                    <h6 className="font-semibold text-pink-800 mb-3">اختيار التلميذ</h6>
                    <select
                      value={emotionalSelectedStudent}
                      onChange={(e) => setEmotionalSelectedStudent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">اختر تلميذاً</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - {student.group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-200 mb-6">
                    <h6 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      تعليمات الاختبار
                    </h6>
                    <p className="text-gray-700 leading-relaxed">
                      الغرض من هذا الاختبار هو مساعدتك على فهم قدرتك على التعامل مع مشاعرك ومشاعر الآخرين بشكل أفضل.
                      ستجد مجموعة من الأسئلة التي تقيس وعيك بنفسك، طريقة إدارتك لانفعالاتك، مستوى تعاطفك مع الآخرين،
                      مهاراتك الاجتماعية، بالإضافة إلى قدرتك على التحفيز الذاتي.
                      كل سؤال يتضمن عبارتين، اختر العبارة الأقرب إلى شخصيتك.
                    </p>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {emotionalQuestions.map((question, index) => (
                      <div key={index} className="bg-white rounded-lg p-6 border border-pink-200 hover:border-pink-300 transition-colors">
                        <h6 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                          <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-bold">
                            السؤال {index + 1}
                          </span>
                        </h6>
                        <p className="text-gray-800 mb-4 font-medium">{question.q}</p>
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name={`emotional_${index}`}
                              value="a"
                              checked={emotionalAnswers[index] === 'a'}
                              onChange={() => handleEmotionalAnswer(index, 'a')}
                              className="mt-1 text-pink-600 focus:ring-pink-500"
                            />
                            <span className="text-gray-700 group-hover:text-pink-700 transition-colors leading-relaxed">
                              {question.a}
                            </span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name={`emotional_${index}`}
                              value="b"
                              checked={emotionalAnswers[index] === 'b'}
                              onChange={() => handleEmotionalAnswer(index, 'b')}
                              className="mt-1 text-pink-600 focus:ring-pink-500"
                            />
                            <span className="text-gray-700 group-hover:text-pink-700 transition-colors leading-relaxed">
                              {question.b}
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 pt-6 border-t border-pink-200">
                  <button
                    onClick={calculateEmotionalResults}
                    disabled={Object.keys(emotionalAnswers).length < 20}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                      <Calculator className="w-5 h-5" />
                      حساب النتائج والتوصية
                    </button>
                    <button
                      onClick={resetEmotionalTest}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      تهيئة/إعادة تعيين الاختبار
                    </button>
                  <button
                    onClick={saveEmotionalResult}
                    disabled={emotionalSaving || !emotionalSelectedStudent || Object.keys(emotionalAnswers).length < 20}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                      {emotionalSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      حفظ النتيجة
                    </button>
                  </div>

                  {/* Results Display */}
                  {emotionalResults && (
                    <div className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-200 print-area">
                      <h6 className="font-bold text-pink-800 mb-4 text-xl flex items-center gap-2">
                        <Heart className="w-6 h-6" />
                        نتائج اختبار الذكاء العاطفي
                      </h6>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-lg p-4 border border-pink-200">
                          <h6 className="font-semibold text-pink-700 mb-3">توزيع النتائج</h6>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">الوعي الذاتي:</span>
                              <span className="font-bold text-pink-600">{emotionalResults.selfAwareness}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">ضبط النفس:</span>
                              <span className="font-bold text-pink-600">{emotionalResults.selfRegulation}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">التعاطف:</span>
                              <span className="font-bold text-pink-600">{emotionalResults.empathy}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">المهارات الاجتماعية:</span>
                              <span className="font-bold text-pink-600">{emotionalResults.socialSkills}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">التحفيز الذاتي:</span>
                              <span className="font-bold text-pink-600">{emotionalResults.motivation}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-pink-200">
                          <h6 className="font-semibold text-pink-700 mb-3">الخاصية المهيمنة</h6>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-pink-600 mb-2">
                              {emotionalResults.dominantTrait}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-pink-200">
                        <h6 className="font-semibold text-pink-700 mb-3">الوصف التفصيلي</h6>
                        <p className="text-gray-700 leading-relaxed">{emotionalResults.description}</p>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handlePrint}
                          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                        >
                          طباعة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Creative Thinking Test Modal */}
        {showCreativeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
      <h2 className="text-2xl font-bold">التفكير الإبداعي</h2>
                      <p className="text-purple-100">قياس مهارات التفكير الإبداعي والابتكار</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreativeModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)] space-y-4">
                {/* Personal Information */}
                <div className="bg-white rounded-lg p-4 border border-purple-200 mb-6">
                  <h6 className="font-semibold text-purple-800 mb-3">معلومات شخصية</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                      <input
                        type="text"
                        value={creativePersonalInfo.name}
                        onChange={(e) => setCreativePersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="أدخل الاسم"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اللقب</label>
                      <input
                        type="text"
                        value={creativePersonalInfo.surname}
                        onChange={(e) => setCreativePersonalInfo(prev => ({ ...prev, surname: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="أدخل اللقب"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                      <input
                        type="text"
                        value={creativePersonalInfo.section}
                        onChange={(e) => setCreativePersonalInfo(prev => ({ ...prev, section: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="أدخل القسم"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع المدرسة</label>
                      <select
                        value={creativePersonalInfo.schoolType}
                        onChange={(e) => setCreativePersonalInfo(prev => ({ ...prev, schoolType: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="الثانوية">الثانوية</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                      <DatePicker
                        selected={creativePersonalInfo.date ? new Date(creativePersonalInfo.date) : null}
                        onChange={(date) => setCreativePersonalInfo(prev => ({ ...prev, date: date?.toISOString().split('T')[0] || '' }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholderText="اختر التاريخ"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Selection */}
                <div className="bg-white rounded-lg p-4 border border-purple-200 mb-6">
                  <h6 className="font-semibold text-purple-800 mb-3">اختيار التلميذ</h6>
                  <select
                    value={creativeSelectedStudent}
                    onChange={(e) => setCreativeSelectedStudent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">اختر تلميذاً</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 mb-6">
                  <h6 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    تعليمات الاختبار
                  </h6>
                  <p className="text-gray-700 leading-relaxed">
                    الغرض من هذا الاختبار هو مساعدتك على التعرف على قدرتك على الإبداع والتفكير بطرق جديدة وغير تقليدية.
                    ستجد مجموعة من الأسئلة التي تقيس: الخيال، المرونة الذهنية، الأصالة، حب الاستكشاف، وحل المشكلات بطرق مبتكرة.
                    كل سؤال يحتوي على عبارتين، اختر العبارة الأقرب إلى شخصيتك.
                  </p>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {creativeQuestions.map((question, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-purple-200 hover:border-purple-300 transition-colors">
                      <h6 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                          السؤال {index + 1}
                        </span>
                      </h6>
                      <p className="text-gray-800 mb-4 font-medium">{question.text}</p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={`creative_${index}`}
                            value="a"
                            checked={creativeAnswers[index] === 'a'}
                            onChange={() => setCreativeAnswers(prev => ({ ...prev, [index]: 'a' }))}
                            className="mt-1 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700 group-hover:text-purple-700 transition-colors leading-relaxed">
                            {question.options?.[0] || ''}
                          </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={`creative_${index}`}
                            value="b"
                            checked={creativeAnswers[index] === 'b'}
                            onChange={() => setCreativeAnswers(prev => ({ ...prev, [index]: 'b' }))}
                            className="mt-1 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700 group-hover:text-purple-700 transition-colors leading-relaxed">
                            {question.options?.[1] || ''}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleCreativeSubmit}
                    disabled={creativeSaving || Object.keys(creativeAnswers).length < 20}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creativeSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>حفظ النتائج</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetCreativeTest}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-base font-semibold"
                  >
                    تهيئة/إعادة تعيين الاختبار
                  </button>
                  <button
                    onClick={calculateCreativeResults}
                    disabled={Object.keys(creativeAnswers).length < 20}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    حساب النتائج والتوصية
                  </button>
                </div>

                {/* Results Display */}
                {creativeResults && (
                  <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200 print-area">
      <h3 className="text-2xl font-bold text-purple-800 mb-6 text-center">نتائج التفكير الإبداعي</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-700 mb-3">التحليل الشخصي</h4>
                        <p className="text-gray-700 leading-relaxed">{creativeResults.analysis}</p>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-700 mb-3">الدرجة المئوية</h4>
                        <div className="text-center">
                          <div className="text-4xl font-extrabold text-purple-700 mb-2">{creativeResults.score}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="h-3 bg-purple-500 rounded-full" style={{ width: `${creativeResults.score}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-700 mb-3">نقاط القوة</h4>
                        <div className="space-y-2">
                          {creativeResults.strengths.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
                              <span className="w-2 h-2 bg-purple-500 rounded-full" />
                              <span className="text-gray-800">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-700 mb-3">التوصيات</h4>
                        <div className="space-y-2">
                          {creativeResults.recommendations.map((r, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-pink-50 rounded-md">
                              <span className="w-2 h-2 bg-pink-500 rounded-full" />
                              <span className="text-gray-800">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 no-print">
                      <button
                        onClick={handlePrint}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                      >
                        طباعة
                      </button>
                      <button
                        onClick={handleCreativeSubmit}
                        disabled={creativeSaving || !creativeSelectedStudent}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        حفظ النتيجة
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky footer removed */}
            </div>
          </div>
        )}

        {/* Social Skills Test Modal */}
        {showSocialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 border-b rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
      <h2 className="text-2xl font-bold">المهارات الاجتماعية</h2>
                      <p className="text-green-100">تقييم القدرة على التواصل والتعامل مع الآخرين</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSocialModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
                {/* Personal Information */}
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-6">
                  <h6 className="font-semibold text-green-800 mb-3">معلومات شخصية</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                      <input
                        type="text"
                        value={socialPersonalInfo.name}
                        onChange={(e) => setSocialPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="أدخل الاسم"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">اللقب</label>
                      <input
                        type="text"
                        value={socialPersonalInfo.surname}
                        onChange={(e) => setSocialPersonalInfo(prev => ({ ...prev, surname: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="أدخل اللقب"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                      <input
                        type="text"
                        value={socialPersonalInfo.section}
                        onChange={(e) => setSocialPersonalInfo(prev => ({ ...prev, section: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="أدخل القسم"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع المدرسة</label>
                      <select
                        value={socialPersonalInfo.schoolType}
                        onChange={(e) => setSocialPersonalInfo(prev => ({ ...prev, schoolType: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="المتوسطة">المتوسطة</option>
                        <option value="الثانوية">الثانوية</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                      <DatePicker
                        selected={socialPersonalInfo.date ? new Date(socialPersonalInfo.date) : null}
                        onChange={(date) => setSocialPersonalInfo(prev => ({ ...prev, date: date?.toISOString().split('T')[0] || '' }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholderText="اختر التاريخ"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>
                  </div>
                </div>

                {/* Student Selection */}
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-6">
                  <h6 className="font-semibold text-green-800 mb-3">اختيار التلميذ</h6>
                  <select
                    value={socialSelectedStudent}
                    onChange={(e) => setSocialSelectedStudent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">اختر تلميذاً</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instructions */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 mb-6">
                  <h6 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    تعليمات الاختبار
                  </h6>
                  <p className="text-gray-700 leading-relaxed">
                    هذا الاختبار يساعدك على التعرف على قدرتك في التعامل مع الآخرين وبناء علاقات اجتماعية إيجابية.
                    ستجد مجموعة من الأسئلة التي تقيس تواصلك، تعاونك، استماعك، ومرونتك في المواقف الاجتماعية المختلفة.
                    كل سؤال يتضمن عبارتين، اختر العبارة الأقرب إلى شخصيتك.
                  </p>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {socialQuestions.map((question, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-green-200 hover:border-green-300 transition-colors">
                      <h6 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                          السؤال {index + 1}
                        </span>
                      </h6>
                      <p className="text-gray-800 mb-4 font-medium">{question.text}</p>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={`social_${index}`}
                            value="a"
                            checked={socialAnswers[index] === 'a'}
                            onChange={() => setSocialAnswers(prev => ({ ...prev, [index]: 'a' }))}
                            className="mt-1 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700 group-hover:text-green-700 transition-colors leading-relaxed">
                            {question.options?.[0] || ''}
                          </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={`social_${index}`}
                            value="b"
                            checked={socialAnswers[index] === 'b'}
                            onChange={() => setSocialAnswers(prev => ({ ...prev, [index]: 'b' }))}
                            className="mt-1 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700 group-hover:text-green-700 transition-colors leading-relaxed">
                            {question.options?.[1] || ''}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleSocialSubmit}
                    disabled={socialSaving || Object.keys(socialAnswers).length < 20}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        <span>حفظ النتائج</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetSocialTest}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-base font-semibold"
                  >
                    تهيئة/إعادة تعيين الاختبار
                  </button>
                  <button
                    onClick={calculateSocialResults}
                    disabled={Object.keys(socialAnswers).length < 20}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    حساب النتائج والتوصية
                  </button>
                </div>

                {socialResults && (
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 print-area">
      <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">نتائج المهارات الاجتماعية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-700 mb-3">التحليل</h4>
                        <p className="text-gray-700 leading-relaxed">{socialResults.analysis}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-700 mb-3">الدرجة المئوية</h4>
                        <div className="text-center">
                          <div className="text-4xl font-extrabold text-green-700 mb-2">{socialResults.score}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="h-3 bg-green-500 rounded-full" style={{ width: `${socialResults.score}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-700 mb-3">نقاط القوة</h4>
                        <div className="space-y-2">
                          {socialResults.strengths.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                              <span className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-gray-800">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-green-700 mb-3">التوصيات</h4>
                        <div className="space-y-2">
                          {socialResults.recommendations.map((r, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-md">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                              <span className="text-gray-800">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2 no-print">
                      <button
                        onClick={handlePrint}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                      >
                        طباعة
                      </button>
                      <button
                        onClick={handleSocialSubmit}
                        disabled={socialSaving || !socialSelectedStudent}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        حفظ النتيجة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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