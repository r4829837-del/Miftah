import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Brain, Briefcase, Lightbulb, UserCircle2, Users, Sparkles, PlusCircle, PlayCircle, X, Save, Settings } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import NewTest from './tests/NewTest';
import TakeTest from './tests/TakeTest';
import TestQuestions from './tests/TestQuestions';

import { getStudents, Student, submitTestResult, getSettings, updateSettings, AppSettings } from '../lib/storage';

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
  }, []);

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
      schoolType: 'المتوسطة'
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
              <div class="info-value">${personalInfo.schoolType || 'المتوسطة'}</div>
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
            <p>💡 نصيحة: خذ وقتك في التفكير في هذا القرار، فهو مهم لمستقبلك الدراسي والمهني</p>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
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
                          <select
                            value={personalInfo.schoolType || 'المتوسطة'}
                            onChange={e => handlePersonalInfoChange('schoolType', e.target.value)}
                            className="w-full border-b-2 border-blue-300 px-2 py-1 focus:border-blue-500 focus:outline-none text-sm bg-white"
                          >
                            <option value="المتوسطة">المتوسطة</option>
                            <option value="الثانوية">الثانوية</option>
                          </select>
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
                          <select
                            value={personalInfo.schoolType || 'المتوسطة'}
                            onChange={e => handlePersonalInfoChange('schoolType', e.target.value)}
                            className="w-full border-b-2 border-purple-300 px-2 py-1 focus:border-purple-500 focus:outline-none text-sm bg-white"
                          >
                            <option value="المتوسطة">المتوسطة</option>
                            <option value="الثانوية">الثانوية</option>
                          </select>
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
                          <div className="text-lg font-bold text-purple-700">{personalInfo.schoolType || 'المتوسطة'}</div>
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


      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة الإختبارات</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowResultModal(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-3 shadow-lg"
          >
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">تسجيل نتيجة اختبار</span>
          </button>
          <button
            onClick={() => navigate('new')}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-3 shadow-lg"
          >
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">إنشاء اختبار جديد</span>
          </button>
        </div>
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

              {/* Inclination card inside types */}
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">الميول نحو المواد</h3>
                </div>
                <p className="text-gray-600 mb-6">تحديد الميل الدراسي وفتح صفحة التقييم التفصيلية</p>
                                 <div className="space-y-3">
                   <button
                     onClick={() => setShowInclinationModal(true)}
                     className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-medium shadow-lg"
                   >
                     <Lightbulb className="w-7 h-7" />
                     <span>الميول نحو المواد</span>
                   </button>
                 </div>
              </div>
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