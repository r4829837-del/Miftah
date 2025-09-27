import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { markDataChanged } from './sync';

// Types and Interfaces
type GradesChangeReason = 'add_or_update' | 'bulk_upsert' | 'delete' | 'import' | 'clear';
interface GradesChangedEvent {
  reason: GradesChangeReason;
  timestamp: string;
  meta?: Record<string, unknown>;
}

// Lightweight pub/sub for grade changes (for UI live updates)
const gradeChangeListeners = new Set<(evt: GradesChangedEvent) => void>();
const emitGradesChanged = (evt: GradesChangedEvent) => {
  gradeChangeListeners.forEach(listener => {
    try { listener(evt); } catch (_) { /* no-op */ }
  });
};
export const onGradesChanged = (listener: (evt: GradesChangedEvent) => void) => {
  gradeChangeListeners.add(listener);
  return () => gradeChangeListeners.delete(listener);
};
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher';
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  level: string;
  group: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  familyStatus: string;
  healthStatus: string;
  specialNeeds: string;
  notes: string;
  isRepeating: boolean;
  createdAt: string;
  updatedAt: string;
  socialStatus?: string;
  lastTestDate?: string;
  lastTestScore?: number;
}

export interface AppSettings {
  schoolName: string;
  counselorName: string;
  highSchoolName: string;
  highSchoolAddress: string;
  levels: string[];
  groups: string[];
  semesters: string[];
  timezone: string;
  enabledSections: {
    general: boolean;
    notifications: boolean;
    security: boolean;
    profile: boolean;
    school: true;
    highschool: boolean;
    levels: boolean;
    groups: boolean;
    semesters: boolean;
  };
  password?: string;
  twoFactorEnabled?: boolean;
  // Preferred general stream for subject inclination section in tests management
  // 'science' = جدع مشترك علوم و تكنولوجيا, 'arts' = جدع مشترك أداب
  subjectTrack?: 'science' | 'arts';
}

export interface Test {
  id: string;
  title: string;
  type: string;
  description: string;
  duration: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | boolean;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  answers: Answer[];
  score: number;
  completedAt: string;
}

// Grades for school semesters (الفصل الأول/الثاني/الثالث)
export interface GradeRecord {
  id: string;
  studentId: string;
  semester: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث';
  subject: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  answer: string | boolean;
  isCorrect: boolean;
}

// Constants
const DEFAULT_LEVELS = [
  'السنة الأولى متوسط',
  'السنة الثانية متوسط',
  'السنة الثالثة متوسط',
  'السنة الرابعة متوسط',
  'السنة الأولى ثانوي',
  'السنة الثانية ثانوي',
  'السنة الثالثة ثانوي'
];

const DEFAULT_GROUPS = [
  'الفوج 1',
  'الفوج 2',
  'الفوج 3',
  'الفوج 4',
  'الفوج 5',
  'الفوج 6'
];

const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'المتوسطة',
  counselorName: 'مستشار(ة) التوجيه',
  highSchoolName: 'الثانوية',
  highSchoolAddress: '',
  levels: DEFAULT_LEVELS,
  groups: DEFAULT_GROUPS,
  semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
  timezone: 'Africa/Algiers',
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
};

// Get default settings for specific cycle
const getDefaultSettingsForCycle = (cycle: string): AppSettings => {
  const isSecondary = cycle === 'ثانوي';
  return {
    schoolName: isSecondary ? 'الثانوية' : 'المتوسطة',
    counselorName: 'مستشار(ة) التوجيه',
    highSchoolName: 'الثانوية',
    highSchoolAddress: '',
    levels: isSecondary ? [
      'السنة الأولى ثانوي',
      'السنة الثانية ثانوي',
      'السنة الثالثة ثانوي'
    ] : [
      'السنة الأولى متوسط',
      'السنة الثانية متوسط',
      'السنة الثالثة متوسط',
      'السنة الرابعة متوسط'
    ],
    groups: DEFAULT_GROUPS,
    semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
    timezone: 'Africa/Algiers',
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
  };
};

// Database Instances - Cycle-specific storage with user isolation
const createCycleDB = (storeName: string) => {
  return {
    getInstance: (cycle: string, userId?: string) => {
      const userPrefix = userId ? `_${userId}` : '';
      return localforage.createInstance({
        name: `schoolManagement${userPrefix}_${cycle}`,
        storeName: storeName
      });
    }
  };
};

const studentsDB = createCycleDB('students');
const usersDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'users'
});
const settingsDB = createCycleDB('settings');
const testsDB = createCycleDB('tests');
const testResultsDB = createCycleDB('testResults');
const gradesDB = createCycleDB('grades');

// Additional cycle-specific databases for complete independence
const reportsDB = createCycleDB('reports');
const goalsDB = createCycleDB('goals');
const newsDB = createCycleDB('news');
const interventionDB = createCycleDB('intervention');
const counselorDB = createCycleDB('counselor');
const scheduleDB = createCycleDB('schedule');
const analysisDB = createCycleDB('analysis');
const recommendationsDB = createCycleDB('recommendations');

// Helper Functions
export const formatDate = (date: string | Date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy/MM/dd', { locale: ar });
};

// Helper function to get current user ID for data isolation
export const getCurrentUserId = (): string | null => {
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Get current cycle from localStorage
export const getCurrentCycle = (): string => {
  const savedCycle = localStorage.getItem('currentCycle');
  return savedCycle || 'متوسط';
};

// Helper function to get database instance with user isolation
const getDBInstance = (db: any, cycle?: string) => {
  const currentCycle = cycle || getCurrentCycle();
  const userId = getCurrentUserId();
  return db.getInstance(currentCycle, userId);
};

// Cycle-specific database getters with user isolation
export const getStudentsDB = (cycle?: string) => getDBInstance(studentsDB, cycle);
export const getSettingsDB = (cycle?: string) => getDBInstance(settingsDB, cycle);
export const getTestsDB = (cycle?: string) => getDBInstance(testsDB, cycle);
export const getTestResultsDB = (cycle?: string) => getDBInstance(testResultsDB, cycle);
export const getGradesDB = (cycle?: string) => getDBInstance(gradesDB, cycle);

// Additional cycle-specific database getters for complete independence with user isolation
export const getReportsDB = (cycle?: string) => getDBInstance(reportsDB, cycle);
export const getGoalsDB = (cycle?: string) => getDBInstance(goalsDB, cycle);
export const getNewsDB = (cycle?: string) => getDBInstance(newsDB, cycle);
export const getInterventionDB = (cycle?: string) => getDBInstance(interventionDB, cycle);
export const getCounselorDB = (cycle?: string) => getDBInstance(counselorDB, cycle);
export const getScheduleDB = (cycle?: string) => getDBInstance(scheduleDB, cycle);
export const getAnalysisDB = (cycle?: string) => getDBInstance(analysisDB, cycle);
export const getRecommendationsDB = (cycle?: string) => getDBInstance(recommendationsDB, cycle);

// Function to clear all student data for all cycles
export const clearAllStudentData = async () => {
  try {
    // Clear students for both cycles
    const collegeStudentsDb = studentsDB.getInstance('متوسط');
    const highSchoolStudentsDb = studentsDB.getInstance('ثانوي');
    
    await Promise.all([
      collegeStudentsDb.clear(),
      highSchoolStudentsDb.clear()
    ]);
    
    console.log('All student data cleared for both cycles');
  } catch (error) {
    console.error('Error clearing student data:', error);
  }
};

// Cycle-specific localStorage utilities
export const getCycleLocalStorageKey = (key: string, cycle?: string): string => {
  const currentCycle = cycle || getCurrentCycle();
  return `${key}_${currentCycle}`;
};

export const setCycleLocalStorage = (key: string, value: any, cycle?: string): void => {
  const cycleKey = getCycleLocalStorageKey(key, cycle);
  localStorage.setItem(cycleKey, JSON.stringify(value));
};

export const getCycleLocalStorage = (key: string, cycle?: string): any => {
  const cycleKey = getCycleLocalStorageKey(key, cycle);
  const value = localStorage.getItem(cycleKey);
  return value ? JSON.parse(value) : null;
};

export const removeCycleLocalStorage = (key: string, cycle?: string): void => {
  const cycleKey = getCycleLocalStorageKey(key, cycle);
  localStorage.removeItem(cycleKey);
};

// Function to clear all cycle-specific data
export const clearAllCycleData = async (cycle: string) => {
  try {
    const cycleDatabases = [
      studentsDB.getInstance(cycle),
      settingsDB.getInstance(cycle),
      testsDB.getInstance(cycle),
      testResultsDB.getInstance(cycle),
      gradesDB.getInstance(cycle),
      reportsDB.getInstance(cycle),
      goalsDB.getInstance(cycle),
      newsDB.getInstance(cycle),
      interventionDB.getInstance(cycle),
      counselorDB.getInstance(cycle),
      scheduleDB.getInstance(cycle),
      analysisDB.getInstance(cycle),
      recommendationsDB.getInstance(cycle)
    ];
    
    await Promise.all(cycleDatabases.map(db => db.clear()));
    
    // Clear cycle-specific localStorage keys
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.endsWith(`_${cycle}`)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log(`All data cleared for cycle: ${cycle}`);
  } catch (error) {
    console.error(`Error clearing data for cycle ${cycle}:`, error);
  }
};

// User Functions
export const createUser = async (email: string, password: string, role: 'admin' | 'teacher') => {
  const user: User = {
    id: uuidv4(),
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  await usersDB.setItem(user.id, user);
  return user;
};

export const authenticateUser = async (email: string, password: string) => {
  let foundUser: User | null = null;
  await usersDB.iterate((user: User) => {
    if (user.email === email && user.password === password) {
      foundUser = user;
      return;
    }
  });
  return foundUser;
};

// Student Functions
export const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>, cycle?: string) => {
  const student: Student = {
    ...studentData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const db = getStudentsDB(cycle);
  await db.setItem(student.id, student);
  markDataChanged(); // Marquer les changements pour la synchronisation
  return student;
};

export const getStudents = async (cycle?: string): Promise<Student[]> => {
  const students: Student[] = [];
  const currentCycle = cycle || getCurrentCycle();
  const db = getStudentsDB(currentCycle);
  await db.iterate((value: Student) => {
    students.push(value);
  });
  return students;
};

export const getStudent = async (id: string): Promise<Student | null> => {
  const db = getStudentsDB();
  return db.getItem(id);
};

export const updateStudent = async (id: string, data: Partial<Student>) => {
  const db = getStudentsDB();
  const student = await db.getItem<Student>(id);
  if (!student) throw new Error('Student not found');
  
  const updatedStudent: Student = {
    ...student,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await db.setItem(id, updatedStudent);
  markDataChanged(); // Marquer les changements pour la synchronisation
  return updatedStudent;
};

export const deleteStudent = async (id: string) => {
  const db = getStudentsDB();
  await db.removeItem(id);
  markDataChanged(); // Marquer les changements pour la synchronisation
};

// Settings Functions - Completely independent per cycle
export const getSettings = async (cycle?: string): Promise<AppSettings> => {
  const currentCycle = cycle || getCurrentCycle();
  const cycleKey = `appSettings_${currentCycle}`;
  
  // First try to get settings from localStorage for current cycle
  const localSettings = localStorage.getItem(cycleKey);
  if (localSettings) {
    const settings = JSON.parse(localSettings);
    return settings;
  }

  // If not in localStorage, try to get from IndexedDB for current cycle
  const db = getSettingsDB(currentCycle);
  const settings = await db.getItem<AppSettings>('settings');
  if (settings) {
    // Save to localStorage for future use
    localStorage.setItem(cycleKey, JSON.stringify(settings));
    return settings;
  }

  // If no settings found anywhere, use defaults for current cycle
  const defaultSettings = getDefaultSettingsForCycle(currentCycle);
  localStorage.setItem(cycleKey, JSON.stringify(defaultSettings));
  await db.setItem('settings', defaultSettings);
  return defaultSettings;
};

export const updateSettings = async (settings: Partial<AppSettings>, cycle?: string) => {
  // Get current settings for the specified cycle
  const currentSettings = await getSettings(cycle);
  
  // Merge with new settings
  const updatedSettings = { ...currentSettings, ...settings };
  
  // Save to both localStorage and IndexedDB for current cycle
  const currentCycle = cycle || getCurrentCycle();
  const cycleKey = `appSettings_${currentCycle}`;
  localStorage.setItem(cycleKey, JSON.stringify(updatedSettings));
  
  const db = getSettingsDB(currentCycle);
  await db.setItem('settings', updatedSettings);
  
  return updatedSettings;
};

// Force update levels to include high school levels
export const forceUpdateLevels = async () => {
  const currentSettings = await getSettings();
  const highSchoolLevels = ['السنة الأولى ثانوي', 'السنة الثانية ثانوي', 'السنة الثالثة ثانوي'];
  
  // Add high school levels if they don't exist
  const updatedLevels = [...currentSettings.levels];
  highSchoolLevels.forEach(level => {
    if (!updatedLevels.includes(level)) {
      updatedLevels.push(level);
    }
  });
  
  // Update settings with new levels
  const updatedSettings = { ...currentSettings, levels: updatedLevels };
  const currentCycle = getCurrentCycle();
  const cycleKey = `appSettings_${currentCycle}`;
  localStorage.setItem(cycleKey, JSON.stringify(updatedSettings));
  
  const db = getSettingsDB();
  await db.setItem('settings', updatedSettings);
  
  return updatedSettings;
};

// Test Functions
export const createTest = async (testData: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>) => {
  const test: Test = {
    ...testData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const db = getTestsDB();
  await db.setItem(test.id, test);
  return test;
};

export const getTest = async (id: string): Promise<Test | null> => {
  const defaultTest: Test = {
    id,
    title: 'اختبار جديد',
    type: id,
    description: 'وصف الاختبار',
    duration: 30,
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const db = getTestsDB();
  const test = await db.getItem<Test>(id);
  return test || defaultTest;
};

export const getTests = async (): Promise<Test[]> => {
  const tests: Test[] = [];
  const db = getTestsDB();
  await db.iterate((value: Test) => {
    tests.push(value);
  });
  return tests;
};

export const updateTest = async (id: string, data: Partial<Test>) => {
  const test = await getTest(id);
  if (!test) throw new Error('Test not found');
  
  const updatedTest: Test = {
    ...test,
    ...data,
    updatedAt: new Date().toISOString()
  };
  const db = getTestsDB();
  await db.setItem(id, updatedTest);
  return updatedTest;
};

export const deleteTest = async (id: string) => {
  const db = getTestsDB();
  await db.removeItem(id);
};

// Test Results Functions
export const submitTestResult = async (
  testId: string,
  studentId: string,
  answers: Answer[],
  score: number
) => {
  const result: TestResult = {
    id: uuidv4(),
    testId,
    studentId,
    answers,
    score,
    completedAt: new Date().toISOString()
  };
  const db = getTestResultsDB();
  await db.setItem(result.id, result);
  return result;
};

export const getTestResults = async (studentId?: string): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  const db = getTestResultsDB();
  await db.iterate((value: TestResult) => {
    if (!studentId || value.studentId === studentId) {
      results.push(value);
    }
  });
  return results;
};

export const getTestResult = async (id: string): Promise<TestResult | null> => {
  const db = getTestResultsDB();
  return db.getItem(id);
};

// Bulk student upsert for spreadsheet imports
export interface ImportedStudentRow {
  studentId: string;
  firstName: string;
  lastName: string;
  level: string;
  group: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export const upsertStudentByStudentId = async (row: ImportedStudentRow): Promise<Student> => {
  const db = getStudentsDB();
  let existing: Student | null = null;
  await db.iterate((value: Student) => {
    if (value.studentId === row.studentId) {
      existing = { ...value };
      return;
    }
  });

  const nowIso = new Date().toISOString();
  if (existing) {
    const base = existing as Student;
    const updated: Student = {
      ...base,
      firstName: row.firstName ?? base.firstName,
      lastName: row.lastName ?? base.lastName,
      level: row.level ?? base.level,
      group: row.group ?? base.group,
      birthDate: row.birthDate ?? base.birthDate,
      gender: row.gender ?? base.gender,
      address: row.address ?? base.address,
      parentName: row.parentName ?? base.parentName,
      parentPhone: row.parentPhone ?? base.parentPhone,
      parentEmail: row.parentEmail ?? base.parentEmail,
      updatedAt: nowIso
    };
    await db.setItem(updated.id, updated);
    return updated;
  }

  const created: Student = {
    id: uuidv4(),
    studentId: row.studentId,
    firstName: row.firstName,
    lastName: row.lastName,
    birthDate: row.birthDate || nowIso.substring(0, 10),
    gender: row.gender || '',
    level: row.level,
    group: row.group,
    address: row.address || '',
    parentName: row.parentName || '',
    parentPhone: row.parentPhone || '',
    parentEmail: row.parentEmail || '',
    familyStatus: '',
    healthStatus: '',
    specialNeeds: '',
    notes: '',
    isRepeating: false,
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await db.setItem(created.id, created);
  return created;
};

export const bulkUpsertStudents = async (rows: ImportedStudentRow[]) => {
  for (const row of rows) {
    if (!row || !row.studentId || !row.firstName || !row.lastName || !row.level || !row.group) continue;
    await upsertStudentByStudentId(row);
  }
};

// Grades functions
export interface ImportedGradeRow {
  studentId: string;
  semester: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث';
  subject: string;
  score: number | string; // Excel may provide string values
}

export const addOrUpdateGrade = async (row: ImportedGradeRow): Promise<GradeRecord> => {
  // Coerce score to a valid number (0..20) with Arabic digits support
  const toWesternDigits = (s: string) => s
    .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0));
  const rawScore = typeof row.score === 'string' ? parseFloat(toWesternDigits(row.score).replace(',', '.')) : row.score;
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(20, rawScore as number)) : NaN;
  if (Number.isNaN(score)) {
    throw new Error(`Invalid score for student ${row.studentId} / subject ${row.subject}: ${row.score}`);
  }

  const subject = (row.subject || '').trim();
  let existingKey: string | null = null;
  let existingValue: GradeRecord | null = null;
  const db = getGradesDB();
  await db.iterate((value: GradeRecord, key: string) => {
    if (value.studentId === row.studentId && value.semester === row.semester && value.subject === subject) {
      existingKey = key;
      existingValue = { ...value };
      return;
    }
  });
  const nowIso = new Date().toISOString();
  if (existingKey && existingValue) {
    const base = existingValue as GradeRecord;
    const updated: GradeRecord = { ...base, score, updatedAt: nowIso };
    await db.setItem(existingKey, updated);
    emitGradesChanged({ reason: 'add_or_update', timestamp: nowIso, meta: { studentId: row.studentId, subject, semester: row.semester } });
    return updated;
  }
  const created: GradeRecord = {
    id: uuidv4(),
    studentId: row.studentId,
    semester: row.semester,
    subject,
    score,
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await db.setItem(created.id, created);
  emitGradesChanged({ reason: 'add_or_update', timestamp: nowIso, meta: { studentId: row.studentId, subject, semester: row.semester } });
  return created;
};

export const bulkUpsertGrades = async (rows: ImportedGradeRow[]) => {
  for (const row of rows) {
    if (!row || !row.studentId || !row.semester || !row.subject || row.score === undefined || row.score === null) continue;
    try {
    await addOrUpdateGrade(row);
    } catch (e) {
      // Skip invalid rows but log for diagnostics
      console.warn('Skipping invalid grade row:', row, e);
    }
  }
  emitGradesChanged({ reason: 'bulk_upsert', timestamp: new Date().toISOString(), meta: { count: rows.length } });
};

export const getGradesByStudentAndSemester = async (studentId: string, semester: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث'): Promise<GradeRecord[]> => {
  const result: GradeRecord[] = [];
  const db = getGradesDB();
  await db.iterate((value: GradeRecord) => {
    if (value.studentId === studentId && value.semester === semester) {
      result.push(value);
    }
  });
  return result;
};

// Get all grades for a specific semester
export const getGradesBySemester = async (semester: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث'): Promise<GradeRecord[]> => {
  const result: GradeRecord[] = [];
  const db = getGradesDB();
  await db.iterate((value: GradeRecord) => {
    if (value.semester === semester) {
      result.push(value);
    }
  });
  return result;
};

// Delete grades for a set of students in a semester
export const deleteGradesBySemesterAndStudents = async (
  semester: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث',
  studentIds: Set<string>
) => {
  const toDelete: string[] = [];
  const db = getGradesDB();
  await db.iterate((value: GradeRecord, key: string) => {
    if (value.semester === semester && studentIds.has(value.studentId)) {
      toDelete.push(key);
    }
  });
  for (const key of toDelete) {
    await db.removeItem(key);
  }
  emitGradesChanged({ reason: 'delete', timestamp: new Date().toISOString(), meta: { semester, deleted: toDelete.length } });
};

// Get semester analysis data
export const getSemesterAnalysis = async (semester: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث' | 'النتائج السنوية', level?: string): Promise<{
  semester: string;
  average: number;
  totalStudents: number;
  successStudents: number;
  excellentStudents: number;
  goodStudents: number;
  averageStudents: number;
  weakStudents: number;
  subjects: {
    name: string;
    average: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  topPerformers: {
    studentName: string;
    average: number;
  }[];
}> => {
  // Get all students, filtered by level if specified
  let students = await getStudents();
  if (level && level !== 'جميع المستويات') {
    students = students.filter(student => student.level === level);
  }
  
  if (semester === 'النتائج السنوية') {
    // For annual results, combine all three semesters
    const allGrades: GradeRecord[] = [];
    for (const sem of ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'] as const) {
      const grades = await getGradesBySemester(sem);
      allGrades.push(...grades);
    }
    return calculateAnalysisData(students, allGrades, semester);
  } else {
    // For specific semester
    const grades = await getGradesBySemester(semester);
    const current = calculateAnalysisData(students, grades, semester);

    // Compute subject trends vs previous semester if exists
    const previousSemester = semester === 'الفصل الثاني' ? 'الفصل الأول' : (semester === 'الفصل الثالث' ? 'الفصل الثاني' : null);
    if (previousSemester) {
      const prevGrades = await getGradesBySemester(previousSemester as 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الثالث');
      const prev = calculateAnalysisData(students, prevGrades, previousSemester);
      const prevSubjectAvg = new Map(prev.subjects.map(s => [s.name, s.average]));
      const subjectsWithTrend = current.subjects.map(s => {
        const prevAvg = prevSubjectAvg.get(s.name);
        if (typeof prevAvg !== 'number') return { ...s, trend: 'stable' as const };
        const diff = s.average - prevAvg;
        const epsilon = 0.05; // small threshold to avoid noise
        const trend: 'up' | 'down' | 'stable' = diff > epsilon ? 'up' : (diff < -epsilon ? 'down' : 'stable');
        return { ...s, trend };
      });
      return { ...current, subjects: subjectsWithTrend };
    }

    return current;
  }
};

// Helper function to calculate analysis data
const calculateAnalysisData = (students: Student[], grades: GradeRecord[], semester: string) => {
  // Filter grades to only include students from the selected level
  const studentIds = new Set(students.map(s => s.studentId));
  const filteredGrades = grades.filter(grade => studentIds.has(grade.studentId));
  
  // Group grades by student
  const studentGrades = new Map<string, GradeRecord[]>();
  filteredGrades.forEach(grade => {
    if (!studentGrades.has(grade.studentId)) {
      studentGrades.set(grade.studentId, []);
    }
    studentGrades.get(grade.studentId)!.push(grade);
  });

  // Calculate student averages
  const studentAverages = new Map<string, number>();
  studentGrades.forEach((gradeList, studentId) => {
    // Prefer provided average if present
const providedAvg = gradeList.find(g => g.subject === 'معدل الفصل  ');
    if (providedAvg && Number.isFinite(providedAvg.score)) {
      studentAverages.set(studentId, providedAvg.score);
      return;
    }
    // Else compute from non-zero subject scores
    const validScores = gradeList
  .filter(g => g.subject !== 'معدل الفصل  ')
      .map(g => g.score)
      .filter(s => Number.isFinite(s) && s > 0);
    const average = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
    studentAverages.set(studentId, average);
  });

  // Calculate overall statistics (only students with at least one grade)
  const averages = Array.from(studentAverages.values());
  const overallAverage = averages.length > 0 ? averages.reduce((sum, avg) => sum + avg, 0) / averages.length : 0;
  
  const successCount = averages.filter(avg => avg >= 10).length; // النجاح من 10/20
  const excellentCount = averages.filter(avg => avg >= 16).length;
  const goodCount = averages.filter(avg => avg >= 14 && avg < 16).length;
  const averageCount = averages.filter(avg => avg >= 12 && avg < 14).length;
  const weakCount = averages.filter(avg => avg < 12).length;

  // Calculate subject averages
  const subjectGrades = new Map<string, number[]>();
  filteredGrades.forEach(grade => {
    if (!subjectGrades.has(grade.subject)) {
      subjectGrades.set(grade.subject, []);
    }
if (grade.subject !== 'معدل الفصل  ' && Number.isFinite(grade.score) && grade.score > 0) {
      subjectGrades.get(grade.subject)!.push(grade.score);
    }
  });

  const subjects = Array.from(subjectGrades.entries()).map(([subject, scores]) => ({
    name: subject,
    average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    trend: 'stable' as const // For now, we'll keep it stable
  }));

  // Get top performers (ignore NaN and ensure descending order)
  const topPerformers = Array.from(studentAverages.entries())
    .map(([studentId, average]) => {
      const student = students.find(s => s.studentId === studentId);
      return {
        studentName: student ? `${student.firstName} ${student.lastName}` : 'طالب غير معروف',
        average
      };
    })
    .filter(s => Number.isFinite(s.average))
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  return {
    semester,
    average: Math.round(overallAverage * 10) / 10,
    totalStudents: studentAverages.size,
    successStudents: successCount,
    excellentStudents: excellentCount,
    goodStudents: goodCount,
    averageStudents: averageCount,
    weakStudents: weakCount,
    subjects,
    topPerformers
  };
};

// Database Export/Import Functions - Cycle-specific
export const exportDatabase = async (cycle?: string) => {
  const currentCycle = cycle || getCurrentCycle();
  const data = {
    cycle: currentCycle,
    students: [] as Student[],
    users: [] as User[],
    settings: null as AppSettings | null,
    tests: [] as Test[],
    testResults: [] as TestResult[],
    grades: [] as GradeRecord[],
    reports: [] as any[],
    goals: [] as any[],
    news: [] as any[],
    intervention: [] as any[],
    counselor: [] as any[],
    schedule: [] as any[],
    analysis: [] as any[],
    recommendations: [] as any[]
  };

  const studentsDb = getStudentsDB(currentCycle);
  await studentsDb.iterate((value: unknown) => {
    data.students.push(value as Student);
  });

  // Users are shared across cycles
  await usersDB.iterate((value: unknown) => {
    data.users.push(value as User);
  });

  const settingsDb = getSettingsDB(currentCycle);
  data.settings = await settingsDb.getItem('settings');

  const testsDb = getTestsDB(currentCycle);
  await testsDb.iterate((value: unknown) => {
    data.tests.push(value as Test);
  });

  const testResultsDb = getTestResultsDB(currentCycle);
  await testResultsDb.iterate((value: unknown) => {
    data.testResults.push(value as TestResult);
  });

  const gradesDb = getGradesDB(currentCycle);
  await gradesDb.iterate((value: unknown) => {
    data.grades.push(value as GradeRecord);
  });

  // Export additional cycle-specific data
  const reportsDb = getReportsDB(currentCycle);
  await reportsDb.iterate((value: unknown) => {
    data.reports.push(value);
  });

  const goalsDb = getGoalsDB(currentCycle);
  await goalsDb.iterate((value: unknown) => {
    data.goals.push(value);
  });

  const newsDb = getNewsDB(currentCycle);
  await newsDb.iterate((value: unknown) => {
    data.news.push(value);
  });

  const interventionDb = getInterventionDB(currentCycle);
  await interventionDb.iterate((value: unknown) => {
    data.intervention.push(value);
  });

  const counselorDb = getCounselorDB(currentCycle);
  await counselorDb.iterate((value: unknown) => {
    data.counselor.push(value);
  });

  const scheduleDb = getScheduleDB(currentCycle);
  await scheduleDb.iterate((value: unknown) => {
    data.schedule.push(value);
  });

  const analysisDb = getAnalysisDB(currentCycle);
  await analysisDb.iterate((value: unknown) => {
    data.analysis.push(value);
  });

  const recommendationsDb = getRecommendationsDB(currentCycle);
  await recommendationsDb.iterate((value: unknown) => {
    data.recommendations.push(value);
  });

  return data;
};

export const importDatabase = async (data: any, cycle?: string) => {
  try {
    const currentCycle = cycle || data.cycle || getCurrentCycle();
    
    await Promise.all([
      getStudentsDB(currentCycle).clear(),
      getSettingsDB(currentCycle).clear(),
      getTestsDB(currentCycle).clear(),
      getTestResultsDB(currentCycle).clear(),
      getGradesDB(currentCycle).clear(),
      getReportsDB(currentCycle).clear(),
      getGoalsDB(currentCycle).clear(),
      getNewsDB(currentCycle).clear(),
      getInterventionDB(currentCycle).clear(),
      getCounselorDB(currentCycle).clear(),
      getScheduleDB(currentCycle).clear(),
      getAnalysisDB(currentCycle).clear(),
      getRecommendationsDB(currentCycle).clear()
    ]);

    // Only clear users if this is a full import (not cycle-specific)
    if (!cycle && !data.cycle) {
      await usersDB.clear();
    }

    if (Array.isArray(data.students)) {
      const studentsDb = getStudentsDB(currentCycle);
      await Promise.all(data.students.map((student: Student) => 
        studentsDb.setItem(student.id, student)
      ));
    }

    if (Array.isArray(data.users) && (!cycle && !data.cycle)) {
      await Promise.all(data.users.map((user: User) => 
        usersDB.setItem(user.id, user)
      ));
    }

    if (data.settings) {
      const settingsDb = getSettingsDB(currentCycle);
      await settingsDb.setItem('settings', data.settings);
      // Also update localStorage for current cycle
      const cycleKey = `appSettings_${currentCycle}`;
      localStorage.setItem(cycleKey, JSON.stringify(data.settings));
    }

    if (Array.isArray(data.tests)) {
      const testsDb = getTestsDB(currentCycle);
      await Promise.all(data.tests.map((test: Test) => 
        testsDb.setItem(test.id, test)
      ));
    }

    if (Array.isArray(data.testResults)) {
      const testResultsDb = getTestResultsDB(currentCycle);
      await Promise.all(data.testResults.map((result: TestResult) => 
        testResultsDb.setItem(result.id, result)
      ));
    }

    if (Array.isArray(data.grades)) {
      const gradesDb = getGradesDB(currentCycle);
      await Promise.all(data.grades.map((g: GradeRecord) => 
        gradesDb.setItem(g.id, g)
      ));
    }

    // Import additional cycle-specific data
    if (Array.isArray(data.reports)) {
      const reportsDb = getReportsDB(currentCycle);
      await Promise.all(data.reports.map((report: any) => 
        reportsDb.setItem(report.id || uuidv4(), report)
      ));
      // Sync to localStorage mirror for immediate UI availability
      setCycleLocalStorage('reports', data.reports, currentCycle);
    }

    if (Array.isArray(data.goals)) {
      const goalsDb = getGoalsDB(currentCycle);
      await Promise.all(data.goals.map((goal: any) => 
        goalsDb.setItem(goal.id || uuidv4(), goal)
      ));
      setCycleLocalStorage('goalsData', data.goals, currentCycle);
    }

    if (Array.isArray(data.news)) {
      const newsDb = getNewsDB(currentCycle);
      await Promise.all(data.news.map((news: any) => 
        newsDb.setItem(news.id || uuidv4(), news)
      ));
      setCycleLocalStorage('newsData', data.news, currentCycle);
    }

    if (Array.isArray(data.intervention)) {
      const interventionDb = getInterventionDB(currentCycle);
      await Promise.all(data.intervention.map((intervention: any) => 
        interventionDb.setItem(intervention.id || uuidv4(), intervention)
      ));
      setCycleLocalStorage('interventionData', data.intervention, currentCycle);
    }

    if (Array.isArray(data.counselor)) {
      const counselorDb = getCounselorDB(currentCycle);
      await Promise.all(data.counselor.map((counselor: any) => 
        counselorDb.setItem(counselor.id || uuidv4(), counselor)
      ));
      setCycleLocalStorage('counselorData', data.counselor, currentCycle);
    }

    if (Array.isArray(data.schedule)) {
      const scheduleDb = getScheduleDB(currentCycle);
      await Promise.all(data.schedule.map((schedule: any) => 
        scheduleDb.setItem(schedule.id || uuidv4(), schedule)
      ));
      setCycleLocalStorage('scheduleData', data.schedule, currentCycle);
    }

    if (Array.isArray(data.analysis)) {
      const analysisDb = getAnalysisDB(currentCycle);
      await Promise.all(data.analysis.map((analysis: any) => 
        analysisDb.setItem(analysis.id || uuidv4(), analysis)
      ));
      setCycleLocalStorage('analysisData', data.analysis, currentCycle);
    }

    if (Array.isArray(data.recommendations)) {
      const recommendationsDb = getRecommendationsDB(currentCycle);
      await Promise.all(data.recommendations.map((recommendation: any) => 
        recommendationsDb.setItem(recommendation.id || uuidv4(), recommendation)
      ));
      setCycleLocalStorage('recommendations', data.recommendations, currentCycle);
    }

    emitGradesChanged({ reason: 'import', timestamp: new Date().toISOString(), meta: { counts: { students: data.students?.length, grades: data.grades?.length }, cycle: currentCycle } });
    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    throw error;
  }
};

// Full-application export/import (both cycles + shared users)
export const exportFullApplication = async () => {
  const college = await exportDatabase('متوسط');
  const secondary = await exportDatabase('ثانوي');
  const users: User[] = [];
  await usersDB.iterate((value: unknown) => {
    users.push(value as User);
  });
  return {
    cycles: {
      'متوسط': college,
      'ثانوي': secondary
    },
    users
  };
};

export const importFullApplication = async (payload: any) => {
  // Write users first (shared)
  if (Array.isArray(payload?.users)) {
    await usersDB.clear();
    await Promise.all(payload.users.map((user: User) => usersDB.setItem(user.id, user)));
  }

  // Import both cycles if present
  if (payload?.cycles?.['متوسط']) {
    await importDatabase(payload.cycles['متوسط'], 'متوسط');
  }
  if (payload?.cycles?.['ثانوي']) {
    await importDatabase(payload.cycles['ثانوي'], 'ثانوي');
  }
  return true;
};

// Force update timezone to Algeria if it's still Tunisia
export const forceUpdateTimezone = async () => {
  try {
    const settings = await getSettings();
    if (settings.timezone === 'Africa/Tunis') {
      const updatedSettings = { ...settings, timezone: 'Africa/Algiers' };
      await updateSettings(updatedSettings);
      console.log('Timezone updated to Algeria');
    }
  } catch (error) {
    console.error('Error updating timezone:', error);
  }
};

// Initialize default data
(async () => {
  try {
    // Check and create first user
    let foundFirstUser = null;
    await usersDB.iterate((user: User) => {
      if (user.email === 'harounsolution@gmail.com') {
        foundFirstUser = user;
        return;
      }
    });

    if (!foundFirstUser) {
      await createUser('harounsolution@gmail.com', '00000', 'admin');
    }

    // Check and create second user
    let foundSecondUser = null;
    await usersDB.iterate((user: User) => {
      if (user.email === 'bvbsowmosta@gmail.com') {
        foundSecondUser = user;
        return;
      }
    });

    if (!foundSecondUser) {
      await createUser('bvbsowmosta@gmail.com', '00000', 'admin');
    }

    // Check for settings in localStorage first
    const localSettings = localStorage.getItem('appSettings');
    if (!localSettings) {
      // If not in localStorage, check IndexedDB
      const settingsDb = getSettingsDB();
      const currentSettings = await settingsDb.getItem<AppSettings>('settings');
      if (!currentSettings) {
        // If no settings found anywhere, initialize with defaults
        await settingsDb.setItem('settings', DEFAULT_SETTINGS);
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
      } else {
        // If found in IndexedDB, sync to localStorage
        localStorage.setItem('appSettings', JSON.stringify(currentSettings));
      }
    } else {
      // Force update timezone if it's still Tunisia
      await forceUpdateTimezone();
    }

    // No default students - they will be imported via Excel files
    // Each cycle (collège/secondaire) will have its own independent student data
    // Note: We don't clear existing data here to preserve imported students
  } catch (error) {
    console.error('Error initializing data:', error);
  }
})();