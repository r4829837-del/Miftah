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
  UserPlus,
  Upload
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
    title: 'تقرير تحليل النتائج',
    description: 'متابعة تحليل النتائج التربوية',
    icon: Target,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'activities',
    title: 'تقرير النشاطات',
    description: 'تقرير عن النشاطات المدرسية والتربوية',
    icon: Activity,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    id: 'annual',
    title: 'التقرير السنوي',
    description: 'التقرير السنوي لنشاطات مستشار التوجيه والإرشاد المدرسي والمهني',
    icon: FileText,
    color: 'bg-yellow-100 text-yellow-600'
  }
];

interface CoverageRow {
  group: string;
  studentCount: number;
  date: string;
  coverage: number;
  resultsAnalysis: string;
}

interface ParentCoverageRow {
  group: string;
  parentCount: number;
  date: string;
  coverage: number;
  topics: string;
}

interface AnnualReportData {
  wilaya: string;
  center: string;
  school: string;
  counselor: string;
  academicYear: string;
  activities: string;
  conclusions: string;
  recommendations: string;
}

interface VocationalInstitution {
  id: string;
  name: string;
  localTraining: boolean;
  regionalTraining: boolean;
  nationalTraining: boolean;
  requiredLevel: string;
}

interface CounselorData {
  id: string;
  number: string;
  counselorName: string;
  schoolName: string;
  totalStudents: string;
  firstYearStudents: string;
  firstYearGroups: string;
  secondYearStudents: string;
  secondYearGroups: string;
  thirdYearStudents: string;
  thirdYearGroups: string;
  fourthYearStudents: string;
  fourthYearGroups: string;
}

interface CoordinationData {
  id: string;
  number: string;
  coordinationType: string;
  coordinationSubject: string;
  date: string;
  notes: string;
}

interface AwarenessProgramData {
  id: string;
  number: string;
  targetLevel: string;
  plannedActivity: string;
  completionDate: string;
  notes: string;
}

interface StudentInfoData {
  id: string;
  level: string;
  registeredStudents: string;
  followUp: string;
  interventions: string;
  objective: string;
  beneficiaryPercentage: string;
}

interface TestData {
  id: string;
  testName: string;
  testDate: string;
  studentCount: string;
  results: string;
  notes: string;
}

interface MeetingData {
  id: string;
  meetingType: string;
  participants: string;
  date: string;
  duration: string;
  topics: string;
  conclusions: string;
}

interface MiddleSchoolResultsData {
  id: string;
  studentName: string;
  arabic: string;
  french: string;
  math: string;
  science: string;
  history: string;
  geography: string;
  islamic: string;
  total: string;
  average: string;
  result: string;
}

interface InformationalDocumentsData {
  id: string;
  documentType: string;
  targetLevel: string;
  distributionDate: string;
  quantity: string;
  notes: string;
}

interface ParentAttendanceData {
  id: string;
  level: string;
  registeredStudents: string;
  individualMeetings: string;
  groupMeetings: string;
  total: string;
  attendancePercentage: string;
  notes: string;
}

interface NationalWeekData {
  id: string;
  activityName: string;
  targetLevel: string;
  date: string;
  participants: string;
  duration: string;
  objectives: string;
  results: string;
}

interface HighSchoolAdmissionData {
  id: string;
  studentName: string;
  middleSchoolAverage: string;
  desiredBranch: string;
  finalBranch: string;
  admissionDate: string;
  notes: string;
}

interface HighSchoolAdmissionYearData {
  id: string;
  academicYear: string;
  fourthYearCount: string;
  admittedCount: string;
  percentage: string;
  highestAverage: string;
  highestStudent: string;
  lowestAverage: string;
  lowestStudent: string;
}

interface HighSchoolOrientationData {
  id: string;
  studentName: string;
  middleSchoolResults: string;
  orientationTest: string;
  counselorRecommendation: string;
  finalOrientation: string;
  notes: string;
}

interface GenderOrientationData {
  id: string;
  gender: string;
  desiredBranch: string;
  finalOrientation: string;
  studentCount: string;
  percentage: string;
  notes: string;
}

interface ExamCenterData {
  id: string;
  centerName: string;
  address: string;
  capacity: string;
  examType: string;
  date: string;
  notes: string;
}

interface PsychologicalActivitiesData {
  id: string;
  activityType: string;
  targetGroup: string;
  date: string;
  duration: string;
  objectives: string;
  results: string;
  notes: string;
}

interface AdmittedRow {
  id: string;
  schoolName: string;
  examTotal: string;
  examFemales: string;
  successTotal: string;
  successPercentage: string;
  successFemales: string;
  successFemalesPercentage: string;
  grade10to11Count: string;
  grade10to11Percentage: string;
  grade12to13Count: string;
  grade12to13Percentage: string;
  grade14to15Count: string;
  grade14to15Percentage: string;
  grade16PlusCount: string;
  grade16PlusPercentage: string;
}

interface StudentResultsRow {
  id: string;
  schoolName: string;
  examTotal: string;
  examFemales: string;
  successTotal: string;
  successPercentage: string;
  successFemales: string;
  successFemalesPercentage: string;
  grade10to11Count: string;
  grade10to11Percentage: string;
  grade12to13Count: string;
  grade12to13Percentage: string;
  grade14to15Count: string;
  grade14to15Percentage: string;
  grade16PlusCount: string;
  grade16PlusPercentage: string;
}

interface GenderOrientationYear4Row {
  id: string;
  trackLabel: string; // مثل: ج.م. آداب
  fDesired: string;
  fFinal: string;
  mDesired: string;
  mFinal: string;
  tDesired: string;
  tFinal: string;
  fDesiredPct: string;
  fFinalPct: string;
  mDesiredPct: string;
  mFinalPct: string;
  tDesiredPct: string;
  tFinalPct: string;
}

interface ExamPsychSupportRow {
  id: string;
  number: string;
  caseType: string;
  count: string;
  stream: string;
  subject: string;
  care: string;
  notes: string;
}

interface OrientationSummaryRow {
  id: string;
  label: string; // المسلك أو النهاية
  commonArts: string;
  sciencesTech: string;
  total: string;
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

  // CSS pour masquer les éléments d'édition dans le PDF
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [showPreview, setShowPreview] = useState(false);
  const [showParentPreview, setShowParentPreview] = useState(false);
  const [showAnnualPreview, setShowAnnualPreview] = useState(false);
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

  const [annualReportData, setAnnualReportData] = useState<AnnualReportData>({
    wilaya: '',
    center: '',
    school: '',
    counselor: '',
    academicYear: academicYears[0],
    activities: '',
    conclusions: '',
    recommendations: ''
  });

  // État pour les institutions de formation professionnelle
  const [vocationalInstitutions, setVocationalInstitutions] = useState<VocationalInstitution[]>([]);

  // États pour la deuxième page remplissable
  const [secondPageData, setSecondPageData] = useState({
    schoolAddress: 'متوسطة حسن بن خير الدين تجديت مستغانم',
    phoneNumber: '045397175',
    faxNumber: '045397175',
    email: 'cem.hbenkhiredine@gmail.com',
    counselorName: 'بوسحبة محمد الامين',
    schoolName: 'حسن بن خير الدين',
    totalStudents: '264',
    firstYearStudents: '87',
    firstYearGroups: '03',
    secondYearStudents: '70',
    secondYearGroups: '03',
    thirdYearStudents: '54',
    thirdYearGroups: '02',
    fourthYearStudents: '53',
    fourthYearGroups: '02',
    // Données pour le tableau des résultats
    examTotal: '53',
    examFemales: '26',
    admittedTotal: '34',
    admittedPercentage: '64.15',
    admittedFemales: '16',
    admittedFemalesPercentage: '47.05',
    // Données pour le tableau des réussites
    successTotal: '25',
    successPercentage: '47.17',
    successFemales: '11',
    successFemalesPercentage: '20.75',
    // Nouveaux champs pour le tableau des résultats détaillés
    grade10to11Count: '17',
    grade10to11Percentage: '32.07',
    grade12to13Count: '08',
    grade12to13Percentage: '15.09',
    grade14to15Count: '00',
    grade14to15Percentage: '00.00',
    grade16PlusCount: '00',
    grade16PlusPercentage: '00.00'
  });

  // État pour les conseillers
  const [counselors, setCounselors] = useState<CounselorData[]>([
    {
      id: '1',
      number: '01',
      counselorName: 'بوسحبة محمد الامين',
      schoolName: 'حسن بن خير الدين',
      totalStudents: '264',
      firstYearStudents: '87',
      firstYearGroups: '03',
      secondYearStudents: '70',
      secondYearGroups: '03',
      thirdYearStudents: '54',
      thirdYearGroups: '02',
      fourthYearStudents: '53',
      fourthYearGroups: '02'
    }
  ]);

  // État pour la coordination avec les départements
  const [coordinationData, setCoordinationData] = useState<CoordinationData[]>([
    {
      id: '1',
      number: '01',
      coordinationType: '',
      coordinationSubject: '',
      date: '',
      notes: ''
    }
  ]);

  // État pour le programme d'information
  const [awarenessProgramData, setAwarenessProgramData] = useState<AwarenessProgramData[]>([
    {
      id: '1',
      number: '01',
      targetLevel: '',
      plannedActivity: '',
      completionDate: '',
      notes: ''
    }
  ]);

  // État pour l'information des élèves
  const [studentInfoData, setStudentInfoData] = useState<StudentInfoData[]>([
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      followUp: 'المتابعة و المرافقة للتلاميذ',
      interventions: '',
      objective: '',
      beneficiaryPercentage: ''
    }
  ]);

  // État pour les tests
  const [testData, setTestData] = useState<TestData[]>([
    {
      id: '1',
      testName: '',
      testDate: '',
      studentCount: '',
      results: '',
      notes: ''
    }
  ]);

  // État pour les réunions
  const [meetingData, setMeetingData] = useState<MeetingData[]>([
    {
      id: '1',
      meetingType: '',
      participants: '',
      date: '',
      duration: '',
      topics: '',
      conclusions: ''
    }
  ]);

  // État pour les résultats du brevet
  const [middleSchoolResultsData, setMiddleSchoolResultsData] = useState<MiddleSchoolResultsData[]>([
    {
      id: '1',
      studentName: '',
      arabic: '',
      french: '',
      math: '',
      science: '',
      history: '',
      geography: '',
      islamic: '',
      total: '',
      average: '',
      result: ''
    }
  ]);

  // État pour les documents d'information
  const [informationalDocumentsData, setInformationalDocumentsData] = useState<InformationalDocumentsData[]>([
    {
      id: '1',
      documentType: '',
      targetLevel: '',
      distributionDate: '',
      quantity: '',
      notes: ''
    }
  ]);

  // État pour la présence des parents
  const [parentAttendanceData, setParentAttendanceData] = useState<ParentAttendanceData[]>([
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      individualMeetings: '',
      groupMeetings: '',
      total: '',
      attendancePercentage: '',
      notes: ''
    }
  ]);

  // État pour la semaine nationale d'information
  const [nationalWeekData, setNationalWeekData] = useState<NationalWeekData[]>([
    {
      id: '1',
      activityName: '',
      targetLevel: '',
      date: '',
      participants: '',
      duration: '',
      objectives: '',
      results: ''
    }
  ]);

  // État pour l'admission en première année secondaire
  const [highSchoolAdmissionData, setHighSchoolAdmissionData] = useState<HighSchoolAdmissionData[]>([
    {
      id: '1',
      studentName: '',
      middleSchoolAverage: '',
      desiredBranch: '',
      finalBranch: '',
      admissionDate: '',
      notes: ''
    }
  ]);

  // État pour l'admission en première année secondaire (par année)
  const [highSchoolAdmissionYearData, setHighSchoolAdmissionYearData] = useState<HighSchoolAdmissionYearData[]>([
    {
      id: '1',
      academicYear: '2023-2022',
      fourthYearCount: '49',
      admittedCount: '30',
      percentage: '61.22',
      highestAverage: '17.47',
      highestStudent: 'بودرباس سنابيس',
      lowestAverage: '9.51',
      lowestStudent: 'حمادي نغم'
    },
    {
      id: '2',
      academicYear: '2024-2023',
      fourthYearCount: '53',
      admittedCount: '34',
      percentage: '64.15',
      highestAverage: '13.92',
      highestStudent: 'زواق عبد النور',
      lowestAverage: '10.01',
      lowestStudent: 'بعضير صادق'
    }
  ]);

  // État pour l'orientation vers la première année secondaire
  const [highSchoolOrientationData, setHighSchoolOrientationData] = useState<HighSchoolOrientationData[]>([
    {
      id: '1',
      studentName: '',
      middleSchoolResults: '',
      orientationTest: '',
      counselorRecommendation: '',
      finalOrientation: '',
      notes: ''
    }
  ]);

  // État pour l'orientation selon le genre
  const [genderOrientationData, setGenderOrientationData] = useState<GenderOrientationData[]>([
    {
      id: '1',
      gender: 'ذكور',
      desiredBranch: '',
      finalOrientation: '',
      studentCount: '',
      percentage: '',
      notes: ''
    },
    {
      id: '2',
      gender: 'إناث',
      desiredBranch: '',
      finalOrientation: '',
      studentCount: '',
      percentage: '',
      notes: ''
    }
  ]);

  // État pour les centres d'examen
  const [examCenterData, setExamCenterData] = useState<ExamCenterData[]>([
    {
      id: '1',
      centerName: '',
      address: '',
      capacity: '',
      examType: '',
      date: '',
      notes: ''
    }
  ]);

  // État pour les activités psychologiques
  const [psychologicalActivitiesData, setPsychologicalActivitiesData] = useState<PsychologicalActivitiesData[]>([
    {
      id: '1',
      activityType: '',
      targetGroup: '',
      date: '',
      duration: '',
      objectives: '',
      results: '',
      notes: ''
    }
  ]);

  useEffect(() => {
    loadSettings();
    // Charger les institutions de formation professionnelle
    const savedInstitutions = loadVocationalInstitutions();
    if (savedInstitutions.length > 0) {
      setVocationalInstitutions(savedInstitutions);
    } else {
      // Données par défaut si aucune donnée sauvegardée
      const defaultInstitutions: VocationalInstitution[] = [
        {
          id: '1',
          name: 'مركز التكوين المهني و التمهين عطاوي بن شاعة مستغانم',
          localTraining: true,
          regionalTraining: false,
          nationalTraining: false,
          requiredLevel: 'السنة الرابعة متوسط'
        },
        {
          id: '2',
          name: 'مركز التكوين المهني و التمهين كريشين بن دهيبة مستغانم',
          localTraining: true,
          regionalTraining: false,
          nationalTraining: false,
          requiredLevel: 'نهاية الطور الابتدائي + السنة الرابعة متوسط'
        }
      ];
      setVocationalInstitutions(defaultInstitutions);
      saveVocationalInstitutions(defaultInstitutions);
    }
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
    setAnnualReportData(prev => ({
      ...prev,
      school: '',
      counselor: ''
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
        resultsAnalysis: ''
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

  const handleSecondPageDataChange = (field: string, value: string) => {
    setSecondPageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonctions pour gérer les institutions de formation professionnelle
  const saveVocationalInstitutions = (institutions: VocationalInstitution[]) => {
    localStorage.setItem('vocationalInstitutions', JSON.stringify(institutions));
  };

  const loadVocationalInstitutions = (): VocationalInstitution[] => {
    const saved = localStorage.getItem('vocationalInstitutions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  };

  // Données d'exemple pour le remplissage automatique
  const getDefaultVocationalInstitutions = (): VocationalInstitution[] => [
    {
      id: '1',
      name: 'مركز التكوين المهني و التمهين عطاوي بن شاعة مستغانم',
      localTraining: true,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: 'السنة الرابعة متوسط'
    },
    {
      id: '2',
      name: 'مركز التكوين المهني و التمهين كريشين بن دهيبة مستغانم',
      localTraining: true,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: 'نهاية الطور الابتدائي + السنة الرابعة متوسط'
    },
    {
      id: '3',
      name: 'مركز التكوين المهني و التمهين سيدي علي مستغانم',
      localTraining: true,
      regionalTraining: true,
      nationalTraining: false,
      requiredLevel: 'السنة الثالثة متوسط'
    },
    {
      id: '4',
      name: 'مركز التكوين المهني و التمهين عين تادلس مستغانم',
      localTraining: true,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: 'السنة الرابعة متوسط'
    },
    {
      id: '5',
      name: 'مركز التكوين المهني و التمهين بوقيراط مستغانم',
      localTraining: true,
      regionalTraining: true,
      nationalTraining: true,
      requiredLevel: 'نهاية الطور الابتدائي'
    }
  ];

  const fillTableAutomatically = () => {
    const defaultInstitutions = getDefaultVocationalInstitutions();
    setVocationalInstitutions(defaultInstitutions);
    saveVocationalInstitutions(defaultInstitutions);
  };

  const clearTable = () => {
    setVocationalInstitutions([]);
    saveVocationalInstitutions([]);
  };

  const generateRandomInstitutions = () => {
    const wilayas = ['مستغانم', 'وهران', 'الجزائر', 'قسنطينة', 'عنابة'];
    const types = ['مركز التكوين المهني و التمهين', 'معهد التكوين المهني', 'مركز التكوين المهني'];
    const locations = ['عطاوي بن شاعة', 'كريشين بن دهيبة', 'سيدي علي', 'عين تادلس', 'بوقيراط', 'حاسي ماماش', 'سيدي لخضر', 'مازونة'];
    const levels = ['السنة الرابعة متوسط', 'السنة الثالثة متوسط', 'نهاية الطور الابتدائي', 'نهاية الطور الابتدائي + السنة الرابعة متوسط'];
    
    const randomInstitutions: VocationalInstitution[] = [];
    
    for (let i = 0; i < 8; i++) {
      const wilaya = wilayas[Math.floor(Math.random() * wilayas.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      
      randomInstitutions.push({
        id: Date.now().toString() + i,
        name: `${type} ${location} ${wilaya}`,
        localTraining: Math.random() > 0.3,
        regionalTraining: Math.random() > 0.6,
        nationalTraining: Math.random() > 0.8,
        requiredLevel: level
      });
    }
    
    setVocationalInstitutions(randomInstitutions);
    saveVocationalInstitutions(randomInstitutions);
  };

  const exportInstitutions = () => {
    const dataStr = JSON.stringify(vocationalInstitutions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vocational_institutions.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importInstitutions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedInstitutions = JSON.parse(content);
          if (Array.isArray(importedInstitutions)) {
            setVocationalInstitutions(importedInstitutions);
            saveVocationalInstitutions(importedInstitutions);
          }
        } catch (error) {
          alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
        }
      };
      reader.readAsText(file);
    }
  };

  const addVocationalInstitution = () => {
    const newInstitution: VocationalInstitution = {
      id: Date.now().toString(),
      name: '',
      localTraining: false,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: ''
    };
    const updatedInstitutions = [...vocationalInstitutions, newInstitution];
    setVocationalInstitutions(updatedInstitutions);
    saveVocationalInstitutions(updatedInstitutions);
  };

  const removeVocationalInstitution = (id: string) => {
    const updatedInstitutions = vocationalInstitutions.filter(inst => inst.id !== id);
    setVocationalInstitutions(updatedInstitutions);
    saveVocationalInstitutions(updatedInstitutions);
  };

  const updateVocationalInstitution = (id: string, field: keyof VocationalInstitution, value: any) => {
    const updatedInstitutions = vocationalInstitutions.map(inst => 
      inst.id === id ? { ...inst, [field]: value } : inst
    );
    setVocationalInstitutions(updatedInstitutions);
    saveVocationalInstitutions(updatedInstitutions);
  };

  const handleGeneratePDF = async (type: 'student' | 'parent' | 'annual') => {
    const contentId = type === 'student' ? 'report-preview' : type === 'parent' ? 'parent-report-preview' : 'annual-report-preview';
    const content = document.getElementById(contentId);
    if (!content) return;

    try {
      // Ensure web fonts are fully loaded before rendering to canvas
      try {
        const fonts = (document as any).fonts;
        if (fonts?.ready) {
          await fonts.ready;
        }
      } catch (_) {}

      const margin = 10; // 10mm margin on all sides for proper A4 formatting
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const options = {
          scale: 2,
          useCORS: true,
          logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        onclone: (clonedDoc: Document) => {
          const clonedRoot = clonedDoc.getElementById(contentId);
          if (!clonedRoot) return;
          
          // Masquer tous les éléments avec la classe no-print
          clonedRoot.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          
          clonedRoot.querySelectorAll('input').forEach((el) => {
            const input = el as HTMLInputElement;
            const span = clonedDoc.createElement('span');
            const isInTableCell = !!input.closest('td, th');
            span.textContent = input.value || input.placeholder || '';
            span.style.fontSize = getComputedStyle(input).fontSize;
            if (isInTableCell) {
              span.style.display = 'block';
              span.style.textAlign = 'center';
              span.style.width = '100%';
              span.style.padding = '0.25rem';
            } else {
              span.style.display = 'inline-block';
              span.style.textAlign = 'right';
              span.style.padding = '0 4px';
            }
            el.parentNode?.replaceChild(span, el);
          });
          clonedRoot.querySelectorAll('select').forEach((el) => {
            const select = el as HTMLSelectElement;
            const span = clonedDoc.createElement('span');
            const isInTableCell = !!select.closest('td, th');
            span.textContent = select.selectedOptions[0]?.text || select.value || '';
            span.style.fontSize = getComputedStyle(select).fontSize;
            if (isInTableCell) {
              span.style.display = 'block';
              span.style.textAlign = 'center';
              span.style.width = '100%';
              span.style.padding = '0.25rem';
            } else {
              span.style.display = 'inline-block';
              span.style.textAlign = 'right';
              span.style.padding = '0 4px';
            }
            el.parentNode?.replaceChild(span, el);
          });
          clonedRoot.querySelectorAll('textarea').forEach((el) => {
            const textarea = el as HTMLTextAreaElement;
            const div = clonedDoc.createElement('span');
            const isInTableCell = !!textarea.closest('td, th');
            div.textContent = textarea.value || '';
            div.style.fontSize = getComputedStyle(textarea).fontSize;
            if (isInTableCell) {
              div.style.whiteSpace = 'pre-wrap';
              div.style.display = 'block';
              div.style.textAlign = 'center';
              div.style.width = '100%';
              div.style.padding = '0.25rem';
            } else {
              div.style.whiteSpace = 'pre-wrap';
              div.style.display = 'inline-block';
              div.style.textAlign = 'right';
              div.style.padding = '0 4px';
            }
            el.parentNode?.replaceChild(div, el);
          });
          clonedRoot.querySelectorAll('table').forEach((tbl) => {
            (tbl as HTMLElement).style.tableLayout = 'fixed';
            (tbl as HTMLElement).style.borderCollapse = 'collapse';
          });
          // Normalize report page size in the cloned DOM to avoid extra padding/border shrinking in PDF
          clonedRoot.querySelectorAll('.report-page').forEach((el) => {
            const page = el as HTMLElement;
            page.style.padding = '0mm';
            // Conserver la bordure existante dans le PDF
            page.style.width = '210mm';
            page.style.minHeight = '297mm';
            page.style.boxSizing = 'border-box';
          });
        },
      } as Parameters<typeof html2canvas>[1];

      const pageElements = Array.from(content.querySelectorAll('.report-page'));
      if (pageElements.length > 0) {
        for (let idx = 0; idx < pageElements.length; idx++) {
          const pageEl = pageElements[idx] as HTMLElement;
          const canvas = await html2canvas(pageEl, options);
          const pageMargin = 5; // smaller margin for page containers
          const availableWidth = pdfWidth - 2 * pageMargin;
          const availableHeight = pdfHeight - 2 * pageMargin;
          let imgWidth = availableWidth;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;
          if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = (canvas.width * imgHeight) / canvas.height;
          }
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          if (idx > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', pageMargin, pageMargin, imgWidth, imgHeight);
        }
      } else {
        // Fallback: capture the entire content and split into equal slices
        const canvas = await html2canvas(content, options);
        const availableHeight = pdfHeight - 2 * margin;
        const imgWidth = pdfWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pagesNeeded = Math.ceil(imgHeight / availableHeight);

        for (let i = 0; i < pagesNeeded; i++) {
          if (i > 0) pdf.addPage();
          const sourceY = (i * canvas.height) / pagesNeeded;
          const sourceHeight = canvas.height / pagesNeeded;
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const pageImgData = tempCanvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, availableHeight);
          }
        }
      }

      let data, title, typeName, fileName;
      
      if (type === 'student') {
        data = reportData;
        title = `تقرير ${data.level} - ${data.semester}`;
        typeName = 'تقرير عملية الإعلام';
        fileName = 'تقرير_التوجيه.pdf';
      } else if (type === 'parent') {
        data = parentReportData;
        title = `تقرير ${data.level} - ${data.semester}`;
        typeName = 'تقرير عملية إعلام الأولياء';
        fileName = 'تقرير_إعلام_الأولياء.pdf';
      } else {
        data = annualReportData;
        title = `التقرير السنوي - ${data.academicYear}`;
        typeName = 'التقرير السنوي';
        fileName = 'التقرير_السنوي.pdf';
      }

      const newReport: Report = {
        id: Date.now().toString(),
        title: title,
        date: new Date().toLocaleDateString('ar-SA'),
        type: typeName,
        content: data
      };

      setReports(prev => {
        const updated = [...prev, newReport];
        localStorage.setItem('reports', JSON.stringify(updated));
        return updated;
      });

      pdf.save(fileName);
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
    } else if (type === 'annual') {
      setShowAnnualPreview(true);
    }
  };

  // Fonction de validation des données
  const validateData = () => {
    const successTotal = parseInt(secondPageData.successTotal) || 0;
    const grade10to11Count = parseInt(secondPageData.grade10to11Count) || 0;
    const grade12to13Count = parseInt(secondPageData.grade12to13Count) || 0;
    const grade14to15Count = parseInt(secondPageData.grade14to15Count) || 0;
    const grade16PlusCount = parseInt(secondPageData.grade16PlusCount) || 0;
    
    const totalGrades = grade10to11Count + grade12to13Count + grade14to15Count + grade16PlusCount;
    
    return {
      isValid: totalGrades === successTotal,
      totalGrades,
      difference: successTotal - totalGrades
    };
  };

  // Fonctions de gestion des conseillers
  const addCounselor = () => {
    const newNumber = (counselors.length + 1).toString().padStart(2, '0');
    const newCounselor: CounselorData = {
      id: Date.now().toString(),
      number: newNumber,
      counselorName: '',
      schoolName: '',
      totalStudents: '0',
      firstYearStudents: '0',
      firstYearGroups: '0',
      secondYearStudents: '0',
      secondYearGroups: '0',
      thirdYearStudents: '0',
      thirdYearGroups: '0',
      fourthYearStudents: '0',
      fourthYearGroups: '0'
    };
    setCounselors(prev => [...prev, newCounselor]);
  };

  const removeCounselor = (id: string) => {
    setCounselors(prev => {
      const filtered = prev.filter(counselor => counselor.id !== id);
      // Renuméroter les conseillers restants
      return filtered.map((counselor, index) => ({
        ...counselor,
        number: (index + 1).toString().padStart(2, '0')
      }));
    });
  };

  const updateCounselor = (id: string, field: keyof CounselorData, value: string) => {
    setCounselors(prev => prev.map(counselor => 
      counselor.id === id ? { ...counselor, [field]: value } : counselor
    ));
  };

  const clearCounselorsTable = () => {
    setCounselors([{
      id: '1',
      number: '01',
      counselorName: '',
      schoolName: '',
      totalStudents: '0',
      firstYearStudents: '0',
      firstYearGroups: '0',
      secondYearStudents: '0',
      secondYearGroups: '0',
      thirdYearStudents: '0',
      thirdYearGroups: '0',
      fourthYearStudents: '0',
      fourthYearGroups: '0'
    }]);
  };

  const exportCounselorsData = () => {
    const dataStr = JSON.stringify(counselors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'counselors_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCounselorsData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          if (Array.isArray(importedData)) {
            setCounselors(importedData);
          }
        } catch (error) {
          alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Fonctions génériques pour tous les tableaux
  const createGenericFunctions = <T extends { id: string; number?: string }>(
    data: T[],
    setData: React.Dispatch<React.SetStateAction<T[]>>,
    defaultItem: T
  ) => {
    const addItem = () => {
      const newNumber = data.length > 0 && data[0].number 
        ? (data.length + 1).toString().padStart(2, '0')
        : undefined;
      
      const newItem = {
        ...defaultItem,
        id: Date.now().toString(),
        ...(newNumber && { number: newNumber })
      };
      setData(prev => [...prev, newItem]);
    };

    const removeItem = (id: string) => {
      setData(prev => {
        const filtered = prev.filter(item => item.id !== id);
        // Renuméroter si nécessaire
        if (filtered.length > 0 && filtered[0].number) {
          return filtered.map((item, index) => ({
            ...item,
            number: (index + 1).toString().padStart(2, '0')
          }));
        }
        return filtered;
      });
    };

    const updateItem = (id: string, field: keyof T, value: any) => {
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    };

    const clearTable = () => {
      setData([defaultItem]);
    };

    const exportData = (filename: string) => {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importedData = JSON.parse(content);
            if (Array.isArray(importedData)) {
              setData(importedData);
            }
          } catch (error) {
            alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
          }
        };
        reader.readAsText(file);
      }
    };

    return { addItem, removeItem, updateItem, clearTable, exportData, importData };
  };

  // Création des fonctions pour chaque tableau
  const coordinationFunctions = createGenericFunctions(
    coordinationData,
    setCoordinationData,
    {
      id: '1',
      number: '01',
      coordinationType: '',
      coordinationSubject: '',
      date: '',
      notes: ''
    }
  );

  const awarenessProgramFunctions = createGenericFunctions(
    awarenessProgramData,
    setAwarenessProgramData,
    {
      id: '1',
      number: '01',
      targetLevel: '',
      plannedActivity: '',
      completionDate: '',
      notes: ''
    }
  );

  const studentInfoFunctions = createGenericFunctions(
    studentInfoData,
    setStudentInfoData,
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      followUp: 'المتابعة و المرافقة للتلاميذ',
      interventions: '',
      objective: '',
      beneficiaryPercentage: ''
    }
  );

  const testFunctions = createGenericFunctions(
    testData,
    setTestData,
    {
      id: '1',
      testName: '',
      testDate: '',
      studentCount: '',
      results: '',
      notes: ''
    }
  );

  const meetingFunctions = createGenericFunctions(
    meetingData,
    setMeetingData,
    {
      id: '1',
      meetingType: '',
      participants: '',
      date: '',
      duration: '',
      topics: '',
      conclusions: ''
    }
  );

  // Création des fonctions pour tous les nouveaux tableaux
  const middleSchoolResultsFunctions = createGenericFunctions(
    middleSchoolResultsData,
    setMiddleSchoolResultsData,
    {
      id: '1',
      studentName: '',
      arabic: '',
      french: '',
      math: '',
      science: '',
      history: '',
      geography: '',
      islamic: '',
      total: '',
      average: '',
      result: ''
    }
  );

  const informationalDocumentsFunctions = createGenericFunctions(
    informationalDocumentsData,
    setInformationalDocumentsData,
    {
      id: '1',
      documentType: '',
      targetLevel: '',
      distributionDate: '',
      quantity: '',
      notes: ''
    }
  );

  const parentAttendanceFunctions = createGenericFunctions(
    parentAttendanceData,
    setParentAttendanceData,
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      individualMeetings: '',
      groupMeetings: '',
      total: '',
      attendancePercentage: '',
      notes: ''
    }
  );

  const nationalWeekFunctions = createGenericFunctions(
    nationalWeekData,
    setNationalWeekData,
    {
      id: '1',
      activityName: '',
      targetLevel: '',
      date: '',
      participants: '',
      duration: '',
      objectives: '',
      results: ''
    }
  );

  const highSchoolAdmissionFunctions = createGenericFunctions(
    highSchoolAdmissionData,
    setHighSchoolAdmissionData,
    {
      id: '1',
      studentName: '',
      middleSchoolAverage: '',
      desiredBranch: '',
      finalBranch: '',
      admissionDate: '',
      notes: ''
    }
  );

  const highSchoolAdmissionYearFunctions = createGenericFunctions(
    highSchoolAdmissionYearData,
    setHighSchoolAdmissionYearData,
    {
      id: '1',
      academicYear: '2023-2022',
      fourthYearCount: '49',
      admittedCount: '30',
      percentage: '61.22',
      highestAverage: '17.47',
      highestStudent: 'بودرباس سنابيس',
      lowestAverage: '9.51',
      lowestStudent: 'حمادي نغم'
    }
  );

  // جدول "النتائج العامة" بنفس نموذج "قطاع تدخل المستشارين"
  const [admittedRows, setAdmittedRows] = useState<AdmittedRow[]>([{
    id: '1',
    schoolName: 'م. حسن بن خير الدين',
    examTotal: secondPageData.examTotal,
    examFemales: secondPageData.examFemales,
    successTotal: secondPageData.successTotal,
    successPercentage: secondPageData.successPercentage,
    successFemales: secondPageData.successFemales,
    successFemalesPercentage: secondPageData.successFemalesPercentage,
    grade10to11Count: secondPageData.grade10to11Count,
    grade10to11Percentage: secondPageData.grade10to11Percentage,
    grade12to13Count: secondPageData.grade12to13Count,
    grade12to13Percentage: secondPageData.grade12to13Percentage,
    grade14to15Count: secondPageData.grade14to15Count,
    grade14to15Percentage: secondPageData.grade14to15Percentage,
    grade16PlusCount: secondPageData.grade16PlusCount,
    grade16PlusPercentage: secondPageData.grade16PlusPercentage
  }]);
  const admittedFunctions = createGenericFunctions(
    admittedRows,
    setAdmittedRows,
    {
      id: '1',
      schoolName: '',
      examTotal: '',
      examFemales: '',
      successTotal: '',
      successPercentage: '',
      successFemales: '',
      successFemalesPercentage: '',
      grade10to11Count: '',
      grade10to11Percentage: '',
      grade12to13Count: '',
      grade12to13Percentage: '',
      grade14to15Count: '',
      grade14to15Percentage: '',
      grade16PlusCount: '',
      grade16PlusPercentage: ''
    }
  );

  const highSchoolOrientationFunctions = createGenericFunctions(
    highSchoolOrientationData,
    setHighSchoolOrientationData,
    {
      id: '1',
      studentName: '',
      middleSchoolResults: '',
      orientationTest: '',
      counselorRecommendation: '',
      finalOrientation: '',
      notes: ''
    }
  );

  const genderOrientationFunctions = createGenericFunctions(
    genderOrientationData,
    setGenderOrientationData,
    {
      id: '1',
      gender: 'ذكور',
      desiredBranch: '',
      finalOrientation: '',
      studentCount: '',
      percentage: '',
      notes: ''
    }
  );

  const examCenterFunctions = createGenericFunctions(
    examCenterData,
    setExamCenterData,
    {
      id: '1',
      centerName: '',
      address: '',
      capacity: '',
      examType: '',
      date: '',
      notes: ''
    }
  );

  const psychologicalActivitiesFunctions = createGenericFunctions(
    psychologicalActivitiesData,
    setPsychologicalActivitiesData,
    {
      id: '1',
      activityType: '',
      targetGroup: '',
      date: '',
      duration: '',
      objectives: '',
      results: '',
      notes: ''
    }
  );

  // جدول 2-3 نتائج التلاميذ في امتحان شهادة التعليم المتوسط
  const [studentResultsRows, setStudentResultsRows] = useState<StudentResultsRow[]>([{
    id: '1',
    schoolName: 'م. حسن بن خير الدين',
    examTotal: secondPageData.examTotal,
    examFemales: secondPageData.examFemales,
    successTotal: secondPageData.successTotal,
    successPercentage: secondPageData.successPercentage,
    successFemales: secondPageData.successFemales,
    successFemalesPercentage: secondPageData.successFemalesPercentage,
    grade10to11Count: secondPageData.grade10to11Count,
    grade10to11Percentage: secondPageData.grade10to11Percentage,
    grade12to13Count: secondPageData.grade12to13Count,
    grade12to13Percentage: secondPageData.grade12to13Percentage,
    grade14to15Count: secondPageData.grade14to15Count,
    grade14to15Percentage: secondPageData.grade14to15Percentage,
    grade16PlusCount: secondPageData.grade16PlusCount,
    grade16PlusPercentage: secondPageData.grade16PlusPercentage
  }]);
  const studentResultsFunctions = createGenericFunctions(
    studentResultsRows,
    setStudentResultsRows,
    {
      id: '1',
      schoolName: '',
      examTotal: '',
      examFemales: '',
      successTotal: '',
      successPercentage: '',
      successFemales: '',
      successFemalesPercentage: '',
      grade10to11Count: '',
      grade10to11Percentage: '',
      grade12to13Count: '',
      grade12to13Percentage: '',
      grade14to15Count: '',
      grade14to15Percentage: '',
      grade16PlusCount: '',
      grade16PlusPercentage: ''
    }
  );

  // جدول الرغبة والتوجيه النهائي حسب الجنس - السنة الرابعة متوسط
  const [genderOrientationYear4Rows, setGenderOrientationYear4Rows] = useState<GenderOrientationYear4Row[]>([
    {
      id: '1',
      trackLabel: 'ج.م. آداب',
      fDesired: '', fFinal: '', mDesired: '', mFinal: '', tDesired: '', tFinal: '',
      fDesiredPct: '', fFinalPct: '', mDesiredPct: '', mFinalPct: '', tDesiredPct: '', tFinalPct: ''
    }
  ]);
  const genderOrientationYear4Functions = createGenericFunctions(
    genderOrientationYear4Rows,
    setGenderOrientationYear4Rows,
    {
      id: '1',
      trackLabel: '',
      fDesired: '', fFinal: '', mDesired: '', mFinal: '', tDesired: '', tFinal: '',
      fDesiredPct: '', fFinalPct: '', mDesiredPct: '', mFinalPct: '', tDesiredPct: '', tFinalPct: ''
    }
  );

  // الكفل النفسي مركز إجراء الامتحانات الرسمية
  const [examPsychSupportRows, setExamPsychSupportRows] = useState<ExamPsychSupportRow[]>([{
    id: '1', number: '01', caseType: '', count: '', stream: '', subject: '', care: '', notes: '/'
  }]);
  const examPsychSupportFunctions = createGenericFunctions(
    examPsychSupportRows,
    setExamPsychSupportRows,
    { id: '1', number: '01', caseType: '', count: '', stream: '', subject: '', care: '', notes: '/' }
  );

  // 1- التوجيه نحو السنة الأولى ثانوي: التوجيه المسبق و التوجيه النهائي
  const [orientationSummaryRows, setOrientationSummaryRows] = useState<OrientationSummaryRow[]>([
    { id: '1', label: 'المسلك', commonArts: '', sciencesTech: '', total: '100' },
    { id: '2', label: 'النهاية', commonArts: '', sciencesTech: '', total: '100' }
  ]);
  const orientationSummaryFunctions = createGenericFunctions(
    orientationSummaryRows,
    setOrientationSummaryRows,
    { id: '1', label: '', commonArts: '', sciencesTech: '', total: '' }
  );

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
                        <th className="border-2 border-gray-700 p-2 text-center">تحليل النتائج</th>
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
                              value={row.resultsAnalysis}
                              onChange={(e) => handleCoverageRowChange(index, 'resultsAnalysis', e.target.value)}
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

       {/* Annual Report Preview Modal */}
       {showAnnualPreview && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <button
                 onClick={() => setShowAnnualPreview(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 <X className="w-6 h-6" />
               </button>
             </div>

             <div id="annual-report-preview" className="space-y-8">
                {/* First Page */}
                <div className="report-page bg-white p-8 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', border: '4px solid #3b82f6', borderRadius: '8px', position: 'relative', padding: '5mm' }}>
                 {/* Corner decorations */}
                 <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400 to-yellow-400 rounded-br-lg"></div>
                 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400 to-yellow-400 rounded-bl-lg"></div>
                 <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-400 to-yellow-400 rounded-tr-lg"></div>
                 <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-green-400 to-yellow-400 rounded-tl-lg"></div>

                 {/* Header Section */}
                 <div className="text-center mb-8">
                   <h1 className="text-2xl font-bold mb-4 text-center">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
                   <h2 className="text-xl font-bold mb-6 text-center">وزارة التربية الوطنية</h2>
                 </div>

                 {/* Details Section */}
                 <div className="space-y-4 mb-8 text-justify">
                   <div className="flex items-center gap-4">
                     <span className="font-semibold">مديرية التربية لولاية:</span>
                     <input
                       type="text"
                       value={annualReportData.wilaya}
                       onChange={(e) => setAnnualReportData(prev => ({ ...prev, wilaya: e.target.value }))}
                       className="text-right outline-none bg-transparent text-lg min-w-[100px]"
                       dir="rtl"
                       placeholder="أدخل اسم الولاية"
                     />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="font-semibold">مركز التوجيه المدرسي والمهني :</span>
                     <input
                       type="text"
                       value={annualReportData.center}
                       onChange={(e) => setAnnualReportData(prev => ({ ...prev, center: e.target.value }))}
                       className="text-right outline-none bg-transparent text-lg min-w-[100px]"
                       dir="rtl"
                       placeholder="أدخل اسم المركز"
                     />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="font-semibold">متوسطة :</span>
                     <input
                       type="text"
                       value={annualReportData.school}
                       onChange={(e) => setAnnualReportData(prev => ({ ...prev, school: e.target.value }))}
                       className="text-right outline-none bg-transparent text-lg min-w-[100px]"
                       dir="rtl"
                       placeholder="أدخل اسم المتوسطة"
                     />
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="font-semibold">مستشار التوجيه والارشاد :</span>
                     <input
                       type="text"
                       value={annualReportData.counselor}
                       onChange={(e) => setAnnualReportData(prev => ({ ...prev, counselor: e.target.value }))}
                       className="text-right outline-none bg-transparent text-lg min-w-[100px]"
                       dir="rtl"
                       placeholder="أدخل اسم المستشار"
                     />
                   </div>
                 </div>

                 {/* Main Title Section */}
                 <div className="text-center mb-8" style={{ marginTop: '200px', marginBottom: '100px' }}>
                   <h3 className="text-5xl font-bold mb-2 text-center">التقرير السنوي لنشاطات مستشار</h3>
                   <h4 className="text-4xl font-bold text-center">التوجيه والإرشاد المدرسي والمهني</h4>
                 </div>

                 {/* Footer Section */}
                 <div className="text-center" style={{ marginTop: '50px' }}>
                   <div className="flex justify-center items-center space-x-4 text-justify">
                     <span className="font-semibold">الموسم الدراسي :</span>
                     <select
                       value={annualReportData.academicYear}
                       onChange={(e) => setAnnualReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                       className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 text-center text-lg bg-transparent"
                       dir="rtl"
                     >
                       {academicYears.map(year => (
                         <option key={year} value={year}>{year}</option>
                       ))}
                     </select>
                   </div>
                 </div>
               </div>

               {/* Second Page - Statistical Report */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '3mm' }}>

                 {/* Page Content */}
                 <div className="space-y-6" dir="rtl">
                   {/* Institution Definition Section */}
                   <div className="mb-6">
                     <h3 className="text-xl font-bold mb-4 text-right">1 - تعريف بالمؤسسة :</h3>
                     <div className="space-y-3 text-right">
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">عنوان المؤسسة :</span>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={secondPageData.schoolAddress}
                             onChange={(e) => handleSecondPageDataChange('schoolAddress', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none"
                           />
                         </div>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">رقم الهاتف :</span>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={secondPageData.phoneNumber}
                             onChange={(e) => handleSecondPageDataChange('phoneNumber', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none"
                           />
                         </div>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">رقم الفاكس :</span>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={secondPageData.faxNumber}
                             onChange={(e) => handleSecondPageDataChange('faxNumber', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none"
                           />
                         </div>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">البريد الالكتروني :</span>
                         <div className="flex-1 min-w-80">
                           <input
                             type="text"
                             value={secondPageData.email}
                             onChange={(e) => handleSecondPageDataChange('email', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none w-full min-w-80"
                           />
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Counselors' Intervention Sector */}
                   <div className="mb-6">
                     <h3 className="text-xl font-bold mb-4 text-right">2 - قطاع تدخل المستشارين:</h3>
                     
                     {/* Boutons de contrôle pour la gestion des conseillers */}
                     <div className="mb-4 flex justify-end gap-2 no-print">
                       <button
                         onClick={addCounselor}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                         title="إضافة مستشار جديد"
                       >
                         <Plus className="w-4 h-4" />
                         إضافة مؤسسة
                       </button>
                       <button
                         onClick={exportCounselorsData}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                         title="تصدير البيانات إلى ملف JSON"
                       >
                         <Download className="w-4 h-4" />
                         تصدير
                       </button>
                       <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                         <Upload className="w-4 h-4" />
                         استيراد
                         <input
                           type="file"
                           accept=".json"
                           onChange={importCounselorsData}
                           className="hidden"
                         />
                       </label>
                       <button
                         onClick={clearCounselorsTable}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                         title="مسح جميع البيانات من الجدول"
                       >
                         <X className="w-4 h-4" />
                         مسح الجدول
                       </button>
                     </div>
                     
                     {/* Student Distribution Table */}
                     <div className="mb-6">
                       <div className="overflow-x-auto">
                         <table className="w-full border-collapse border border-gray-400 text-base">
                           <thead>
                             <tr className="bg-gray-100">
                               <th className="border border-gray-400 p-3 text-center">الرقم</th>
                               <th className="border border-gray-400 p-3 text-center">اسم و لقب المستشار</th>
                               <th className="border border-gray-400 p-3 text-center">المتوسطة</th>
                               <th className="border border-gray-400 p-3 text-center">المجموع العام للتلاميذ</th>
                               <th className="border border-gray-400 p-3 text-center" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الأولى<br/>متوسط</span></th>
                               <th className="border border-gray-400 p-3 text-center" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الثانية<br/>متوسط</span></th>
                               <th className="border border-gray-400 p-3 text-center" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الثالثة<br/>متوسط</span></th>
                               <th className="border border-gray-400 p-3 text-center" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الرابعة<br/>متوسط</span></th>
                               <th className="border border-gray-400 p-3 text-center no-print">إجراءات</th>
                             </tr>
                             <tr className="bg-gray-50">
                               <th className="border border-gray-400 p-2 text-center"></th>
                               <th className="border border-gray-400 p-2 text-center"></th>
                               <th className="border border-gray-400 p-2 text-center"></th>
                               <th className="border border-gray-400 p-2 text-center"></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ التلاميذ</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ الأفواج</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ التلاميذ</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ الأفواج</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ التلاميذ</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ الأفواج</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ التلاميذ</span></th>
                                <th className="border border-gray-400 text-center vertical-header-cell"><span className="vertical-header-label">ع/ الأفواج</span></th>
                             </tr>
                           </thead>
                           <tbody>
                             {counselors.map((counselor) => (
                               <tr key={counselor.id}>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.number}
                                     onChange={(e) => updateCounselor(counselor.id, 'number', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.counselorName}
                                     onChange={(e) => updateCounselor(counselor.id, 'counselorName', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                     placeholder="اسم المستشار"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.schoolName}
                                     onChange={(e) => updateCounselor(counselor.id, 'schoolName', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                     placeholder="أدخل اسم المؤسسة"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.totalStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'totalStudents', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.firstYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'firstYearStudents', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.firstYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'firstYearGroups', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.secondYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'secondYearStudents', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.secondYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'secondYearGroups', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.thirdYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'thirdYearStudents', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.thirdYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'thirdYearGroups', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.fourthYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'fourthYearStudents', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.fourthYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'fourthYearGroups', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center no-print">
                                   <button
                                     onClick={() => removeCounselor(counselor.id)}
                                     className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                     title="حذف هذا المستشار"
                                   >
                                     <Trash2 className="w-3 h-3" />
                                     حذف
                                   </button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     </div>
                   </div>

                   {/* Admission and Orientation Results Section */}
                   <div className="mb-6">
                     <h3 className="text-lg font-bold mb-4 text-right">3- حصيلة أعمال مجالس القبول و التوجيه في السنة الأولى ثانوي للسنة الدراسية 2022-2023 :</h3>
                     <h4 className="text-lg font-bold mb-3 text-right">1-3 - النتائج العامة للتلاميذ المقبولين في السنة الأولى ثانوي:</h4>
                     
                     {/* Admitted Students Table */}
                     <div className="mb-4 flex justify-end gap-2 no-print">
                       <button
                         onClick={admittedFunctions.addItem}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                         title="إضافة مؤسسة"
                       >
                         <Plus className="w-4 h-4" />
                         إضافة مؤسسة
                       </button>
                       <button
                         onClick={() => { const dataStr = JSON.stringify(admittedRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'admitted_rows.json'; link.click(); URL.revokeObjectURL(url); }}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                         title="تصدير"
                       >
                         <Download className="w-4 h-4" />
                         تصدير
                       </button>
                       <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                         <Upload className="w-4 h-4" />
                         استيراد
                         <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setAdmittedRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                       </label>
                       <button
                         onClick={admittedFunctions.clearTable}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                         title="مسح الجدول"
                       >
                         <X className="w-4 h-4" />
                         مسح الجدول
                       </button>
                     </div>
                     <div className="overflow-x-auto mb-6">
                       <table className="w-full border-collapse border border-gray-400 text-sm annual-table-2">
                         <thead>
                           <tr className="bg-gray-100">
                             <th className="border border-gray-400 p-2 text-center">المتوسطة</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>الحاضرون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={4}>التلاميذ المقبولين في السنة الأولى ثانوي</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={8}>توزيع التلاميذ المقبولين حسب فئات المعدلات (معدلات القبول)</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">مج</th>
                             <th className="border border-gray-400 p-2 text-center">إناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>مجموع المقبولين</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>من بينهم الإناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>11,99-10.00</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>13,99-12</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>15,99-14</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>16 و أكثر</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                           </tr>
                         </thead>
                         <tbody>
                           <tr>
                             <td className="border border-gray-400 p-2 text-center">م. حسن بن خير الدين</td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value={secondPageData.examTotal}
                                 onChange={(e) => handleSecondPageDataChange('examTotal', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value={secondPageData.examFemales}
                                 onChange={(e) => handleSecondPageDataChange('examFemales', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value={secondPageData.successTotal}
                                 onChange={(e) => handleSecondPageDataChange('successTotal', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value={secondPageData.successPercentage}
                                 onChange={(e) => handleSecondPageDataChange('successPercentage', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value={secondPageData.successFemales}
                                 onChange={(e) => handleSecondPageDataChange('successFemales', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value={secondPageData.successFemalesPercentage}
                                 onChange={(e) => handleSecondPageDataChange('successFemalesPercentage', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="17"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="32.07"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="08"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="15.09"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="00"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="00"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="00"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                             <td className="border border-gray-400 p-2 text-center">
                               <input
                                 type="text"
                                 value="00"
                                 className="w-full text-center border-none outline-none bg-transparent text-sm"
                                 readOnly
                               />
                             </td>
                           </tr>
                         </tbody>
                       </table>
                     </div>
                   </div>

                   {/* Student Results Section */}
                   <div className="mb-6">
                     <h4 className="text-lg font-bold mb-3 text-right">2-3- نتائج التلاميذ في امتحان شهادة التعليم المتوسط:</h4>
                     
                     {/* Successful Students Table */}
                     <div className="mb-4 flex justify-end gap-2 no-print">
                       <button onClick={studentResultsFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة مؤسسة">
                         <Plus className="w-4 h-4" /> إضافة مؤسسة
                       </button>
                       <button onClick={() => { const dataStr = JSON.stringify(studentResultsRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'student_results_rows.json'; link.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                         <Download className="w-4 h-4" /> تصدير
                       </button>
                       <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                         <Upload className="w-4 h-4" /> استيراد
                         <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setStudentResultsRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                       </label>
                       <button onClick={studentResultsFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                         <X className="w-4 h-4" /> مسح الجدول
                       </button>
                     </div>
                     <div className="overflow-x-auto">
                       <table className="w-full border-collapse border border-gray-400 text-sm">
                         <thead>
                           <tr className="bg-gray-100">
                             <th className="border border-gray-400 p-2 text-center">المتوسطة</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>الحاضرون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={4}>التلاميذ الناجحون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={8}>توزيع المعدلات العامة للتلاميذ في شهادة التعليم المتوسط</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">مجموع</th>
                             <th className="border border-gray-400 p-2 text-center">الإناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>مجموع المقبولين</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>من بينهم الإناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>11.99-10.00</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>13,99-12</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>15,99-14</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>16 و أكثر</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                           </tr>
                         </thead>
                         <tbody>
                           {studentResultsRows.map((row)=> (
                             <tr key={row.id}>
                               <td className="border border-gray-400 p-2 text-center">
                                 <input type="text" value={row.schoolName} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'schoolName',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" />
                               </td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.examTotal} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'examTotal',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.examFemales} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'examFemales',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.successTotal} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successTotal',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.successPercentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successPercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.successFemales} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successFemales',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.successFemalesPercentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successFemalesPercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade10to11Count} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade10to11Count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade10to11Percentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade10to11Percentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade12to13Count} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade12to13Count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade12to13Percentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade12to13Percentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade14to15Count} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade14to15Count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade14to15Percentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade14to15Percentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade16PlusCount} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade16PlusCount',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.grade16PlusPercentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade16PlusPercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-sm" /></td>
                               <td className="border border-gray-400 p-2 text-center no-print">
                                 <button onClick={()=>studentResultsFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                   <Trash2 className="w-3 h-3" /> حذف
                                 </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>

                   {/* 2-3 نتائج التلاميذ في امتحان شهادة التعليم المتوسط */}
                   <div className="mb-6">
                     <h4 className="text-lg font-bold mb-3 text-right">2-3- نتائج التلاميذ في امتحان شهادة التعليم المتوسط:</h4>
                     
                     {/* Successful Students Table */}
                     <div className="overflow-x-auto">
                       <table className="w-full border-collapse border border-gray-400 text-sm">
                         <thead>
                           <tr className="bg-gray-100">
                             <th className="border border-gray-400 p-2 text-center">المتوسطة</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>الحاضرون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={4}>التلاميذ الناجحون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={8}>توزيع المعدلات العامة للتلاميذ في شهادة التعليم المتوسط</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">مجموع</th>
                             <th className="border border-gray-400 p-2 text-center">الإناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>مجموع المقبولين</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>من بينهم الإناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>11.99-10.00</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>13,99-12</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>15,99-14</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>16 و أكثر</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                           </tr>
                         </thead>
                         <tbody>
                           <tr>
                             <td className="border border-gray-400 p-2 text-center">م. حسن بن خير الدين</td>
                             <td className="border border-gray-400 p-2 text-center">53</td>
                             <td className="border border-gray-400 p-2 text-center">26</td>
                             <td className="border border-gray-400 p-2 text-center">25</td>
                             <td className="border border-gray-400 p-2 text-center">47.17</td>
                             <td className="border border-gray-400 p-2 text-center">11</td>
                             <td className="border border-gray-400 p-2 text-center">20.75</td>
                             <td className="border border-gray-400 p-2 text-center">17</td>
                             <td className="border border-gray-400 p-2 text-center">32.07</td>
                             <td className="border border-gray-400 p-2 text-center">08</td>
                             <td className="border border-gray-400 p-2 text-center">15.09</td>
                             <td className="border border-gray-400 p-2 text-center">00</td>
                             <td className="border border-gray-400 p-2 text-center">00</td>
                             <td className="border border-gray-400 p-2 text-center">00</td>
                             <td className="border border-gray-400 p-2 text-center">00</td>
                           </tr>
                         </tbody>
                       </table>
                     </div>
                   </div>

                
                  </div>
                </div>

                {/* Third Page - Media and Information Section */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-6" dir="rtl">
                    {/* Page Title */}
                    <div className="mb-4 text-right">
                      <h3 className="text-xl font-bold mb-2">1- في مجال الإعلام</h3>
                      <p className="text-sm text-gray-600">الوسائل التي اعتمد عليها مستشار التوجيه والإرشاد المدرسي والمهني في هذا النشاط</p>
                    </div>

                    {/* Media Assets Section */}
                    <div>
                      <h4 className="text-lg font-bold mb-3 text-right">أ- السندات الإعلامية المنجزة</h4>
                      
                      {/* Boutons de contrôle pour les documents d'information */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={informationalDocumentsFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة سند إعلامي جديد"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة سند
                        </button>
                        <button
                          onClick={() => informationalDocumentsFunctions.exportData('informational_documents_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={informationalDocumentsFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={informationalDocumentsFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-36">السندات الإعلامية (نوعها)</th>
                              <th className="border border-gray-400 p-2 text-center">الموضوع</th>
                              <th className="border border-gray-400 p-2 text-center">الفئة المستهدفة</th>
                              <th className="border border-gray-400 p-2 text-center">الهيئة المنجزة لها</th>
                              <th className="border border-gray-400 p-2 text-center w-28">تاريخ الإنجاز</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {informationalDocumentsData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.documentType}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'documentType', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="نوع السند"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.targetLevel}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'targetLevel', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الموضوع"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.quantity}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'quantity', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الفئة المستهدفة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.notes}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'notes', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الهيئة المنجزة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.distributionDate}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'distributionDate', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="تاريخ الإنجاز"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => informationalDocumentsFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذا السند"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-4">
                      <h4 className="text-lg font-bold mb-2 text-right">ملاحظات</h4>
                      <textarea className="w-full border border-gray-300 rounded p-2 text-right" rows={4} placeholder="ملاحظات إضافية حول نشاطات الإعلام"></textarea>
                    </div>
                  </div>
                </div>

                {/* Fourth Page - Blank Page (intentionally empty for custom content) */}
                <div
                  className="report-page bg-white p-6 rounded-lg"
                  style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}
                >
                  <div className="w-full h-full" dir="rtl">
                    {/* هذه الصفحة فارغة عمداً لإضافة محتوى لاحقاً */}
                  </div>
                </div>

                {/* Fifth Page - Other Means, Vocational Info, Coordination */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* B. Other Means */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">ب - وسائل أخرى :</h3>
                      <textarea className="w-full border border-gray-300 rounded p-2 text-right" rows={3} placeholder=".......................................................... / .......................................................... / .........................................................."></textarea>
                    </div>

                    {/* 2. Vocational Information */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">2- الإعلام المهني :</h3>
                      <h4 className="text-lg font-bold mb-3 text-right">مؤسسات التعليم و التكوين المهنيين بالولاية :</h4>
                      
                      {/* Contrôles pour ajouter/supprimer des institutions */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={fillTableAutomatically}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          title="ملء الجدول تلقائياً ببيانات افتراضية"
                        >
                          <FileText className="w-4 h-4" />
                          ملء تلقائي
                        </button>
                        <button
                          onClick={generateRandomInstitutions}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          title="إنشاء بيانات عشوائية متنوعة"
                        >
                          <Target className="w-4 h-4" />
                          بيانات عشوائية
                        </button>
                        <button
                          onClick={exportInstitutions}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={importInstitutions}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                        <button
                          onClick={addVocationalInstitution}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة مؤسسة جديدة"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة مؤسسة
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">المؤسسة</th>
                              <th className="border border-gray-400 p-2 text-center">تكوين محلي</th>
                              <th className="border border-gray-400 p-2 text-center">تكوين جهوي</th>
                              <th className="border border-gray-400 p-2 text-center">تكوين وطني</th>
                              <th className="border border-gray-400 p-2 text-center">المستوى المطلوب</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vocationalInstitutions.map((institution, index) => (
                              <tr key={institution.id}>
                                <td className="border border-gray-400 p-2">
                                  <input
                                    type="text"
                                    value={institution.name}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'name', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                    placeholder="اسم المؤسسة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={institution.localTraining}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'localTraining', e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={institution.regionalTraining}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'regionalTraining', e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={institution.nationalTraining}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'nationalTraining', e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2">
                                  <input
                                    type="text"
                                    value={institution.requiredLevel}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'requiredLevel', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                    placeholder="المستوى المطلوب"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => removeVocationalInstitution(institution.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Coordination with Departments */}
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-right">3- التنسيق مع مصالح التعليم و التكوين المهنيين :</h3>

                      {/* A. Correspondence */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold mb-2 text-right">أ- مراسلة</h4>
                        
                        {/* Boutons de contrôle pour la coordination */}
                        <div className="mb-4 flex justify-end gap-2 no-print">
                          <button
                            onClick={coordinationFunctions.addItem}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            title="إضافة مراسلة جديدة"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة مراسلة
                          </button>
                          <button
                            onClick={() => coordinationFunctions.exportData('coordination_data.json')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            title="تصدير البيانات إلى ملف JSON"
                          >
                            <Download className="w-4 h-4" />
                            تصدير
                          </button>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                            <Upload className="w-4 h-4" />
                            استيراد
                            <input
                              type="file"
                              accept=".json"
                              onChange={coordinationFunctions.importData}
                              className="hidden"
                            />
                          </label>
                          <button
                            onClick={coordinationFunctions.clearTable}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            title="مسح جميع البيانات من الجدول"
                          >
                            <X className="w-4 h-4" />
                            مسح الجدول
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-400 text-base">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-2 text-center w-20">الرقم</th>
                                <th className="border border-gray-400 p-2 text-center">نوع التنسيق</th>
                                <th className="border border-gray-400 p-2 text-center">موضوع التنسيق</th>
                                <th className="border border-gray-400 p-2 text-center w-36">التاريخ</th>
                                <th className="border border-gray-400 p-2 text-center">ملاحظات</th>
                                <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {coordinationData.map((item) => (
                                <tr key={item.id}>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.number}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'number', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.coordinationType}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'coordinationType', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="نوع التنسيق"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.coordinationSubject}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'coordinationSubject', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="موضوع التنسيق"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.date}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'date', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="التاريخ"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.notes}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'notes', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="ملاحظات"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center no-print">
                                    <button
                                      onClick={() => coordinationFunctions.removeItem(item.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                      title="حذف هذه المراسلة"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* B. Joint Awareness Program */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold mb-2 text-right">ب- البرنامج الإعلامي التحسيسي المشترك :</h4>
                        
                        {/* Boutons de contrôle pour le programme d'information */}
                        <div className="mb-4 flex justify-end gap-2 no-print">
                          <button
                            onClick={awarenessProgramFunctions.addItem}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            title="إضافة نشاط جديد"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة نشاط
                          </button>
                          <button
                            onClick={() => awarenessProgramFunctions.exportData('awareness_program_data.json')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            title="تصدير البيانات إلى ملف JSON"
                          >
                            <Download className="w-4 h-4" />
                            تصدير
                          </button>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                            <Upload className="w-4 h-4" />
                            استيراد
                            <input
                              type="file"
                              accept=".json"
                              onChange={awarenessProgramFunctions.importData}
                              className="hidden"
                            />
                          </label>
                          <button
                            onClick={awarenessProgramFunctions.clearTable}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            title="مسح جميع البيانات من الجدول"
                          >
                            <X className="w-4 h-4" />
                            مسح الجدول
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-400 text-base">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-2 text-center w-20">الرقم</th>
                                <th className="border border-gray-400 p-2 text-center">المستوى المستهدف</th>
                                <th className="border border-gray-400 p-2 text-center">النشاط المبرمج</th>
                                <th className="border border-gray-400 p-2 text-center w-36">تاريخ الإنجاز</th>
                                <th className="border border-gray-400 p-2 text-center">الملاحظات</th>
                                <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {awarenessProgramData.map((item) => (
                                <tr key={item.id}>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.number}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'number', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.targetLevel}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'targetLevel', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="المستوى المستهدف"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.plannedActivity}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'plannedActivity', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="النشاط المبرمج"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.completionDate}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'completionDate', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="تاريخ الإنجاز"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <input
                                      type="text"
                                      value={item.notes}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'notes', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="الملاحظات"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center no-print">
                                    <button
                                      onClick={() => awarenessProgramFunctions.removeItem(item.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                      title="حذف هذا النشاط"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* C. Answers */}
                      <div>
                        <h4 className="text-lg font-bold mb-2 text-right">ج- الإجابات :</h4>
                        <textarea className="w-full border border-gray-300 rounded p-2 text-right" rows={3} placeholder="........................................................................................................................"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fifth Page - Difficulties, Proposals, Student & Parents Info */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* D. Difficulties */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">د- الصعوبات :</h3>
                      <textarea className="w-full border border-gray-300 rounded p-2 text-right" rows={3} placeholder="مثال: توقيت فتح التسجيلات و غلقها لا يتماشى مع أوقات التلاميذ ..."></textarea>
                    </div>

                    {/* E. Proposals and Comments */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">هـ - الاقتراحات و التعليق :</h3>
                      <textarea className="w-full border border-gray-300 rounded p-2 text-right" rows={3} placeholder="مثال: التنسيق بين وزارة التربية و التكوين المهني و وضع رزنامة تتماشى مع فتح الدورات ..."></textarea>
                    </div>

                    {/* 4. Students Information */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">4- إعلام التلاميذ :</h3>
                      <p className="mb-3 text-right">متوسط تكفل المستشار بالتلاميذ هو :</p>
                      
                      {/* Boutons de contrôle pour l'information des élèves */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={studentInfoFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة مستوى جديد"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة مستوى
                        </button>
                        <button
                          onClick={() => studentInfoFunctions.exportData('student_info_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={studentInfoFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={studentInfoFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">المستوى</th>
                              <th className="border border-gray-400 p-2 text-center">عدد التلاميذ المسجلين</th>
                              <th className="border border-gray-400 p-2 text-center">الدخل و المتابعة للتلاميذ</th>
                              <th className="border border-gray-400 p-2 text-center">عدد التدخلات</th>
                              <th className="border border-gray-400 p-2 text-center">الهدف</th>
                              <th className="border border-gray-400 p-2 text-center">نسبة المستفيدين</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentInfoData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.level}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'level', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المستوى"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.registeredStudents}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'registeredStudents', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="عدد التلاميذ"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.followUp}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'followUp', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المتابعة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.interventions}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'interventions', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="عدد التدخلات"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.objective}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'objective', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الهدف"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.beneficiaryPercentage}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'beneficiaryPercentage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="نسبة المستفيدين"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => studentInfoFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذا المستوى"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 5. Parents Information */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">5- إعلام أولياء التلاميذ :</h3>
                      <p className="mb-3 text-right">نسبة حضور و استجابة الأولياء مقارنة بعدد التلاميذ المسجلين :</p>
                      <div className="mb-3 flex justify-end gap-2 no-print">
                        <button
                          onClick={parentAttendanceFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة سطر"
                        >
                          <Plus className="w-4 h-4" /> إضافة سطر
                        </button>
                        <button
                          onClick={() => parentAttendanceFunctions.exportData('parent_attendance_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات"
                        >
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={parentAttendanceFunctions.importData} className="hidden" />
                        </label>
                        <button
                          onClick={parentAttendanceFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح الجدول"
                        >
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">المستوى</th>
                              <th className="border border-gray-400 p-2 text-center">عدد التلاميذ المسجلين</th>
                              <th className="border border-gray-400 p-2 text-center" colSpan={2}>عدد اللقاءات مع الأولياء</th>
                              <th className="border border-gray-400 p-2 text-center">المجموع</th>
                              <th className="border border-gray-400 p-2 text-center">نسبة حضور الأولياء</th>
                              <th className="border border-gray-400 p-2 text-center">الملاحظات</th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center">الفردية</th>
                              <th className="border border-gray-400 p-2 text-center">الجماعية</th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {parentAttendanceData.map((row) => (
                              <tr key={row.id}>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input type="text" value={row.level} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'level',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input type="text" value={row.registeredStudents} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'registeredStudents',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input type="text" value={row.individualMeetings} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'individualMeetings',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input type="text" value={row.groupMeetings} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'groupMeetings',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input type="text" value={row.total} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'total',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input type="text" value={row.attendancePercentage} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'attendancePercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button onClick={()=>parentAttendanceFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                    <Trash2 className="w-3 h-3" /> حذف
                                  </button>
                                </td>
                            </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p className="mb-2 text-right">أنواع الوثائق الإعلامية التي وزعت على أولياء التلاميذ في المؤسسة :</p>
                      <div className="mb-3 flex justify-end gap-2 no-print">
                        <button
                          onClick={informationalDocumentsFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة وثيقة"
                        >
                          <Plus className="w-4 h-4" /> إضافة وثيقة
                        </button>
                        <button
                          onClick={() => informationalDocumentsFunctions.exportData('informational_documents_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات"
                        >
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={informationalDocumentsFunctions.importData} className="hidden" />
                        </label>
                        <button
                          onClick={informationalDocumentsFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح الجدول"
                        >
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">عنوان الوثيقة</th>
                              <th className="border border-gray-400 p-2 text-center">المستوى</th>
                              <th className="border border-gray-400 p-2 text-center">عدد النسخ</th>
                              <th className="border border-gray-400 p-2 text-center">% من عدد التلاميذ</th>
                            </tr>
                          </thead>
                          <tbody>
                             {informationalDocumentsData.map((row) => (
                               <tr key={row.id}>
                                 <td className="border border-gray-400 p-2 text-center">
                                   <input type="text" value={row.documentType} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'documentType',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="عنوان الوثيقة" />
                                 </td>
                                 <td className="border border-gray-400 p-2 text-center">
                                   <input type="text" value={row.targetLevel} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'targetLevel',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="المستوى" />
                                 </td>
                                 <td className="border border-gray-400 p-2 text-center">
                                   <input type="text" value={row.quantity} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'quantity',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="عدد النسخ" />
                                 </td>
                                 <td className="border border-gray-400 p-2 text-center">
                                   <input type="text" value={row.notes} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'notes',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="%" />
                                 </td>
                                 <td className="border border-gray-400 p-2 text-center no-print">
                                   <button onClick={()=>informationalDocumentsFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                     <Trash2 className="w-3 h-3" /> حذف
                                   </button>
                                 </td>
                            </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sixth Page - National Media Week and Documentation Cell */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* 6. National Media Week */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">6- الأسبوع الوطني للإعلام :</h3>
                      
                      {/* Boutons de contrôle pour la semaine nationale d'information */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={nationalWeekFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة نشاط جديد"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة نشاط
                        </button>
                        <button
                          onClick={() => nationalWeekFunctions.exportData('national_week_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={nationalWeekFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={nationalWeekFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-1/2">الوسائل المعتمدة</th>
                              <th className="border border-gray-400 p-2 text-center w-1/2">المحاور المعالجة</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nationalWeekData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.activityName}
                                    onChange={(e) => nationalWeekFunctions.updateItem(item.id, 'activityName', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الوسائل المعتمدة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.targetLevel}
                                    onChange={(e) => nationalWeekFunctions.updateItem(item.id, 'targetLevel', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المحاور المعالجة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => nationalWeekFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذا النشاط"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-2 text-right">
                        <p className="font-bold">- الأثر الذي خلفته هذه النشاطات :</p>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">أ- عند التلاميذ المتمدرسين :</span>
                          <textarea className="flex-1 border border-gray-300 rounded p-2 text-right" rows={2} placeholder="تحديد المسار الدراسي من خلال التعرف و أخذ صورة عن المسارات المستقبلية لتحديد المشروع الشخصي"></textarea>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">ب- عند الجمهور الواسع :</span>
                          <textarea className="flex-1 border border-gray-300 rounded p-2 text-right" rows={2} placeholder="تمكين الجمهور من التعرف على مختلف المسارات الدراسية و النوافذ الجامعية و اعلامهم بكل جديد عن سوق العمل ..."></textarea>
                        </div>
                      </div>
                    </div>

                    {/* 7. Documentation and Media Cell */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-3 text-right">7- خلية التوثيق و الإعلام :</h3>
                      <div className="text-center border border-gray-300 rounded p-3 w-full">في المتوسطة</div>
                    </div>
                  </div>
                </div>

                {/* Seventh Page - Guidance Field */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* Title */}
                    <div className="text-center my-8">
                      <h2 className="text-3xl font-bold">في مجال التوجيه</h2>
                    </div>

                    {/* 1. Acceptance into 1st year secondary */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">1- القبول في السنة الأولى ثانوي :</h3>
                      
                      {/* Boutons de contrôle pour l'admission en première année secondaire */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={highSchoolAdmissionYearFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة سنة دراسية جديدة"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة سنة
                        </button>
                        <button
                          onClick={() => highSchoolAdmissionYearFunctions.exportData('high_school_admission_year_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={highSchoolAdmissionYearFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={highSchoolAdmissionYearFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>السنة الدراسية</th>
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>في السنة الرابعة متوسط</th>
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>المقبولون في السنة الأولى ثانوي</th>
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>النسبة</th>
                              <th className="border border-gray-400 p-2 text-center" colSpan={2}>أعلى معدل القبول</th>
                              <th className="border border-gray-400 p-2 text-center" colSpan={2}>أدنى معدل القبول</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-400 p-2 text-center">المعدل</th>
                              <th className="border border-gray-400 p-2 text-center">التلميذ</th>
                              <th className="border border-gray-400 p-2 text-center">المعدل</th>
                              <th className="border border-gray-400 p-2 text-center">التلميذ</th>
                              <th className="border border-gray-400 p-2 text-center no-print"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {highSchoolAdmissionYearData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.academicYear}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'academicYear', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="السنة الدراسية"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.fourthYearCount}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'fourthYearCount', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="في السنة الرابعة متوسط"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.admittedCount}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'admittedCount', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المقبولون في السنة الأولى ثانوي"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.percentage}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'percentage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="النسبة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.highestAverage}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'highestAverage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="أعلى معدل"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.highestStudent}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'highestStudent', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="التلميذ"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.lowestAverage}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'lowestAverage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="أدنى معدل"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={item.lowestStudent}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'lowestStudent', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="التلميذ"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => highSchoolAdmissionYearFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذه السنة الدراسية"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Preliminary and Final Orientation */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">2- التوجيه المسبق و التوجيه النهائي :</h3>
                      <h4 className="text-lg font-bold mb-2 text-right">1- التوجيه نحو السنة الأولى ثانوي :</h4>
                      <div className="mb-3 flex justify-end gap-2 no-print">
                        <button onClick={orientationSummaryFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة سطر">
                          <Plus className="w-4 h-4" /> إضافة سطر
                        </button>
                        <button onClick={() => { const dataStr = JSON.stringify(orientationSummaryRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'orientation_summary.json'; link.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setOrientationSummaryRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                        </label>
                        <button onClick={orientationSummaryFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-40">التوجيه</th>
                              <th className="border border-gray-400 p-2 text-center">مشترك - آداب</th>
                              <th className="border border-gray-400 p-2 text-center">ج.م. علوم و تكنولوجيا</th>
                              <th className="border border-gray-400 p-2 text-center w-20">المجموع</th>
                               <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                             {orientationSummaryRows.map((row)=>(
                               <tr key={row.id}>
                                 <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.label} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'label',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.commonArts} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'commonArts',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.sciencesTech} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'sciencesTech',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.total} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'total',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 p-2 text-center no-print">
                                   <button onClick={()=>orientationSummaryFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                     <Trash2 className="w-3 h-3" /> حذف
                                   </button>
                                 </td>
                            </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eighth Page - Orientation Statistics */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-6" dir="rtl">
                    <div className="text-center my-4">
                      <h3 className="text-2xl font-bold">3- إحصائيات حول عملية التوجيه للسنة الدراسية 2022–2023</h3>
                    </div>

                    <h4 className="text-lg font-bold text-right">- الرغبة و التوجيه النهائي حسب الجنس :</h4>
                    <p className="text-right text-sm text-gray-700">- السنة الرابعة متوسط</p>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400 text-base">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-2 text-center" rowSpan={2}>التوجيه</th>
                            <th className="border border-gray-400 p-2 text-center" rowSpan={2}>معطيات</th>
                            <th className="border border-gray-400 p-2 text-center" colSpan={2}>إناث</th>
                            <th className="border border-gray-400 p-2 text-center" colSpan={2}>ذكور</th>
                            <th className="border border-gray-400 p-2 text-center" colSpan={2}>المجموع</th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-400 p-2 text-center">الرغبة</th>
                            <th className="border border-gray-400 p-2 text-center">توجيه نهائي</th>
                            <th className="border border-gray-400 p-2 text-center">الرغبة</th>
                            <th className="border border-gray-400 p-2 text-center">توجيه نهائي</th>
                            <th className="border border-gray-400 p-2 text-center">الرغبة</th>
                            <th className="border border-gray-400 p-2 text-center">توجيه نهائي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row group: ج.م. آداب */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>ج.م. آداب</td>
                            <td className="border border-gray-400 p-2 text-center">عدد</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="9" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="9" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="3" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="3" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="12" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="12" /></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 p-2 text-center">النسبة</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="34.71" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="26.47" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="11.11" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="11.11" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="35.29" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="35.29" /></td>
                          </tr>

                          {/* Row group: ج.م. علوم و تكنولوجيا */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>ج.م. علوم و تكنولوجيا</td>
                            <td className="border border-gray-400 p-2 text-center">عدد</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="7" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="7" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="15" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="15" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="22" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="22" /></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 p-2 text-center">النسبة</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="26.92" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="20.58" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="55.55" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="55.55" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="64.71" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="64.71" /></td>
                          </tr>

                          {/* Row group: الإعادة */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>الإعادة</td>
                            <td className="border border-gray-400 p-2 text-center">عدد</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="6" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="6" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="9" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="9" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="15" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="15" /></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 p-2 text-center">النسبة</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="23.07" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="23.07" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="33.33" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="33.33" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="28.30" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="28.30" /></td>
                          </tr>

                          {/* Row group: تعليم مهني */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>تعليم مهني</td>
                            <td className="border border-gray-400 p-2 text-center">عدد</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 p-2 text-center">النسبة</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                            <td className="border border-gray-400 p-2 text-center">00</td>
                          </tr>

                          {/* Row group: تكوين مهني */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>تكوين مهني</td>
                            <td className="border border-gray-400 p-2 text-center">عدد</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="02" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="02" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="02" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="02" /></td>
                            <td className="border border-gray-400 p-2 text-center">04</td>
                            <td className="border border-gray-400 p-2 text-center">04</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 p-2 text-center">النسبة</td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="7.69" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="7.69" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="7.40" /></td>
                            <td className="border border-gray-400 p-2 text-center"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="7.40" /></td>
                            <td className="border border-gray-400 p-2 text-center">7.54</td>
                            <td className="border border-gray-400 p-2 text-center">7.54</td>
                          </tr>

                          {/* Totals row */}
                          <tr className="bg-yellow-100">
                            <td className="border border-gray-400 p-2 text-center font-bold" colSpan={2}>جميع الإعداد</td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="26" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="26" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="27" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><input type="text" className="w-full text-center border-none outline-none bg-transparent" placeholder="27" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold">53</td>
                            <td className="border border-gray-400 p-2 text-center font-bold">53</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="text-right text-base mt-8">
                      <span className="font-semibold">الكفل النفسي مركز إجراء الامتحانات الرسمية :</span>
                    </div>
                  </div>
                </div>

                {/* Ninth Page - Evaluation Field */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* Psychological Support Table */}
                    <div>
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button onClick={examPsychSupportFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة سطر">
                          <Plus className="w-4 h-4" /> إضافة سطر
                        </button>
                        <button onClick={() => { const dataStr = JSON.stringify(examPsychSupportRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'exam_psych_support.json'; link.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setExamPsychSupportRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                        </label>
                        <button onClick={examPsychSupportFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-16">الرقم</th>
                              <th className="border border-gray-400 p-2 text-center">نوع الحالة أو الاضطراب</th>
                              <th className="border border-gray-400 p-2 text-center w-16">العدد</th>
                              <th className="border border-gray-400 p-2 text-center">الشعبة</th>
                              <th className="border border-gray-400 p-2 text-center">اختبار المادة</th>
                              <th className="border border-gray-400 p-2 text-center">محتوى التدخل النفسي أو التكفل النفسي</th>
                              <th className="border border-gray-400 p-2 text-center">ملاحظات عامة</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examPsychSupportRows.map((row)=> (
                              <tr key={row.id}>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.number} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'number',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.caseType} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'caseType',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.count} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.stream} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'stream',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.subject} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'subject',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.care} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'care',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.notes} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'notes',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button onClick={()=>examPsychSupportFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                    <Trash2 className="w-3 h-3" /> حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Evaluation Field Title */}
                    <div className="text-center my-6">
                      <h2 className="text-3xl font-bold">في مجال التقويم</h2>
                    </div>

                    {/* 1. Analytical studies */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-right">1. الدراسات التحليلية للنتائج الدراسية :</h3>
                      <div className="ml-4 space-y-2 text-right">
                        <h4 className="text-lg font-bold">1.1 الدراسات المنجزة خلال هذه السنة :</h4>
                        <ul className="list-disc pr-6 space-y-1">
                          <li>تحليل نتائج شهادة التعليم المتوسط دورة جوان 2024 و مقاربتها بالتقويم المستمر</li>
                        </ul>
                        <h4 className="text-lg font-bold">2.1 تحليل النتائج الفصلية و نتائج الانتقال من مستوى تعليمي إلى آخر :</h4>
                        <ul className="list-disc pr-6 space-y-1">
                          <li>تحليل نتائج الفصول الدراسية الثلاث للسنة الدراسية 2023/2024</li>
                        </ul>
                        <h4 className="text-lg font-bold">3.1 عمليات أخرى متعلقة بالتقويم :</h4>
                        <ul className="list-disc pr-6 space-y-1">
                          <li>حصيلة نتائج التلاميذ للتعليم المتوسط للفصول الثلاث</li>
                          <li>تحليل نتائج التلاميذ المتمدرسين و الموجهين للسنة الدراسية الجارية 2023/2024</li>
                          <li>متابعة نتائج تلاميذ السنة الرابعة متوسط 2023/2024</li>
                        </ul>
                      </div>
                    </div>

                    {/* 4. Meetings / Seminars */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-right">4.1 اللقاءات - الندوات - الأيام الدراسية :</h3>
                      <p className="text-right">ندوة بثانوية زروقي إبن الدين بمستغانم حول المعالجة البيداغوجية لتلاميذ السنة الأولى متوسط للسنة الدراسية 2023/2024</p>
                    </div>
                  </div>
                </div>

                {/* Fifth Page - Training, Mediation and Guidance Activities */}
                <div
                  className="report-page bg-white p-6 rounded-lg"
                  style={{
                    minHeight: '297mm',
                    width: '210mm',
                    margin: '0 auto',
                    position: 'relative',
                    padding: '5mm',
                  }}
                >
                  <div className="space-y-6" dir="rtl">
                    {/* Page Title */}
                    <div className="mb-4 text-right">
                      <h3 className="text-xl font-bold mb-2">5 - أنشطة التكوين والوساطة والمتابعة النفسية</h3>
                      <p className="text-sm text-gray-600">
                        يسجل في هذا الجدول أهم الأيام التكوينية، الندوات، أعمال الوساطة والمتابعة النفسية المنجزة خلال السنة.
                      </p>
                    </div>

                    {/* Activities Table */}
                    <div className="mb-3 flex justify-end gap-2 no-print">
                      <button onClick={psychologicalActivitiesFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة نشاط">
                        <Plus className="w-4 h-4" /> إضافة نشاط
                      </button>
                      <button onClick={() => psychologicalActivitiesFunctions.exportData('psychological_activities.json')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                        <Download className="w-4 h-4" /> تصدير
                      </button>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                        <Upload className="w-4 h-4" /> استيراد
                        <input type="file" accept=".json" onChange={psychologicalActivitiesFunctions.importData} className="hidden" />
                      </label>
                      <button onClick={psychologicalActivitiesFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                        <X className="w-4 h-4" /> مسح الجدول
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400 text-base">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-2 text-center">النشاط</th>
                            <th className="border border-gray-400 p-2 text-center">المكان/المؤسسة</th>
                            <th className="border border-gray-400 p-2 text-center">المشرف</th>
                            <th className="border border-gray-400 p-2 text-center w-36">التاريخ</th>
                            <th className="border border-gray-400 p-2 text-center">ملاحظات</th>
                            <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {psychologicalActivitiesData.map((row) => (
                            <tr key={row.id}>
                              <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.activityType} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'activityType',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="مثال: يوم تكويني حول الوساطة/التوجيه ..." /></td>
                              <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.targetGroup} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'targetGroup',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="اسم المؤسسة/المكان" /></td>
                              <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.objectives} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'objectives',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="المديرية/المركز/المؤطر" /></td>
                              <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.date} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'date',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="YYYY/MM/DD" /></td>
                              <td className="border border-gray-400 p-2 text-center"><input type="text" value={row.notes} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'notes',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="/" /></td>
                              <td className="border border-gray-400 p-2 text-center no-print">
                                <button onClick={()=>psychologicalActivitiesFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                  <Trash2 className="w-3 h-3" /> حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                      <h4 className="text-lg font-bold mb-2 text-right">ملاحظات إضافية</h4>
                      <textarea
                        className="w-full border border-gray-300 rounded p-2 text-right"
                        rows={4}
                        placeholder="تفاصيل أخرى حول الأنشطة، نسب المشاركة، أثر العمليات، ..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
               <button
                 onClick={() => setShowAnnualPreview(false)}
                 className="px-4 py-2 text-gray-600 hover:text-gray-800"
               >
                 إلغاء
               </button>
               <button
                 onClick={() => handleGeneratePDF('annual')}
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
