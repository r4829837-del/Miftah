import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types and Interfaces
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
    levels: boolean;
    groups: boolean;
    semesters: boolean;
  };
  password?: string;
  twoFactorEnabled?: boolean;
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
  'السنة الرابعة متوسط'
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
  levels: DEFAULT_LEVELS,
  groups: DEFAULT_GROUPS,
  semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
  timezone: 'Africa/Tunis',
  enabledSections: {
    general: true,
    notifications: true,
    security: true,
    profile: true,
    school: true,
    levels: true,
    groups: true,
    semesters: true
  }
};

// Database Instances
const studentsDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'students'
});

const usersDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'users'
});

const settingsDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'settings'
});

const testsDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'tests'
});

const testResultsDB = localforage.createInstance({
  name: 'schoolManagement',
  storeName: 'testResults'
});

// Helper Functions
export const formatDate = (date: string | Date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy/MM/dd', { locale: ar });
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
export const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
  const student: Student = {
    ...studentData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await studentsDB.setItem(student.id, student);
  return student;
};

export const getStudents = async (): Promise<Student[]> => {
  const students: Student[] = [];
  await studentsDB.iterate((value: Student) => {
    students.push(value);
  });
  return students;
};

export const getStudent = async (id: string): Promise<Student | null> => {
  return studentsDB.getItem(id);
};

export const updateStudent = async (id: string, data: Partial<Student>) => {
  const student = await studentsDB.getItem<Student>(id);
  if (!student) throw new Error('Student not found');
  
  const updatedStudent: Student = {
    ...student,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await studentsDB.setItem(id, updatedStudent);
  return updatedStudent;
};

export const deleteStudent = async (id: string) => {
  await studentsDB.removeItem(id);
};

// Settings Functions
export const getSettings = async (): Promise<AppSettings> => {
  // First try to get settings from localStorage
  const localSettings = localStorage.getItem('appSettings');
  if (localSettings) {
    return JSON.parse(localSettings);
  }

  // If not in localStorage, try to get from IndexedDB
  const settings = await settingsDB.getItem<AppSettings>('settings');
  if (settings) {
    // Save to localStorage for future use
    localStorage.setItem('appSettings', JSON.stringify(settings));
    return settings;
  }

  // If no settings found anywhere, use defaults
  localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
  await settingsDB.setItem('settings', DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

export const updateSettings = async (settings: Partial<AppSettings>) => {
  // Get current settings
  const currentSettings = await getSettings();
  
  // Merge with new settings
  const updatedSettings = { ...currentSettings, ...settings };
  
  // Save to both localStorage and IndexedDB
  localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  await settingsDB.setItem('settings', updatedSettings);
  
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
  await testsDB.setItem(test.id, test);
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

  const test = await testsDB.getItem<Test>(id);
  return test || defaultTest;
};

export const getTests = async (): Promise<Test[]> => {
  const tests: Test[] = [];
  await testsDB.iterate((value: Test) => {
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
  await testsDB.setItem(id, updatedTest);
  return updatedTest;
};

export const deleteTest = async (id: string) => {
  await testsDB.removeItem(id);
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
  await testResultsDB.setItem(result.id, result);
  return result;
};

export const getTestResults = async (studentId?: string): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  await testResultsDB.iterate((value: TestResult) => {
    if (!studentId || value.studentId === studentId) {
      results.push(value);
    }
  });
  return results;
};

export const getTestResult = async (id: string): Promise<TestResult | null> => {
  return testResultsDB.getItem(id);
};

// Database Export/Import Functions
export const exportDatabase = async () => {
  const data = {
    students: [] as Student[],
    users: [] as User[],
    settings: null as AppSettings | null,
    tests: [] as Test[],
    testResults: [] as TestResult[]
  };

  await studentsDB.iterate((value) => {
    data.students.push(value);
  });

  await usersDB.iterate((value) => {
    data.users.push(value);
  });

  data.settings = await settingsDB.getItem('settings');

  await testsDB.iterate((value) => {
    data.tests.push(value);
  });

  await testResultsDB.iterate((value) => {
    data.testResults.push(value);
  });

  return data;
};

export const importDatabase = async (data: any) => {
  try {
    await Promise.all([
      studentsDB.clear(),
      usersDB.clear(),
      settingsDB.clear(),
      testsDB.clear(),
      testResultsDB.clear()
    ]);

    if (Array.isArray(data.students)) {
      await Promise.all(data.students.map(student => 
        studentsDB.setItem(student.id, student)
      ));
    }

    if (Array.isArray(data.users)) {
      await Promise.all(data.users.map(user => 
        usersDB.setItem(user.id, user)
      ));
    }

    if (data.settings) {
      await settingsDB.setItem('settings', data.settings);
      // Also update localStorage
      localStorage.setItem('appSettings', JSON.stringify(data.settings));
    }

    if (Array.isArray(data.tests)) {
      await Promise.all(data.tests.map(test => 
        testsDB.setItem(test.id, test)
      ));
    }

    if (Array.isArray(data.testResults)) {
      await Promise.all(data.testResults.map(result => 
        testResultsDB.setItem(result.id, result)
      ));
    }

    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    throw error;
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
      const currentSettings = await settingsDB.getItem<AppSettings>('settings');
      if (!currentSettings) {
        // If no settings found anywhere, initialize with defaults
        await settingsDB.setItem('settings', DEFAULT_SETTINGS);
        localStorage.setItem('appSettings', JSON.stringify(DEFAULT_SETTINGS));
      } else {
        // If found in IndexedDB, sync to localStorage
        localStorage.setItem('appSettings', JSON.stringify(currentSettings));
      }
    }

    const existingStudents = await getStudents();
    if (existingStudents.length === 0) {
      const exampleStudents: Student[] = [
        {
          id: uuidv4(),
          studentId: '2024001',
          firstName: 'أحمد',
          lastName: 'بن علي',
          birthDate: '2010-05-15',
          gender: 'male',
          level: 'السنة الأولى متوسط',
          group: 'الفوج 1',
          address: 'شارع الحبيب بورقيبة، تونس',
          parentName: 'علي بن محمد',
          parentPhone: '21612345678',
          parentEmail: 'ali.benmohamed@email.com',
          familyStatus: '',
          healthStatus: '',
          specialNeeds: '',
          notes: '',
          isRepeating: false,
          createdAt: '2024-01-15T08:00:00.000Z',
          updatedAt: '2024-01-15T08:00:00.000Z'
        },
        {
          id: uuidv4(),
          studentId: '2024002',
          firstName: 'فاطمة',
          lastName: 'العيادي',
          birthDate: '2009-08-22',
          gender: 'female',
          level: 'السنة الثانية متوسط',
          group: 'الفوج 2',
          address: 'نهج فلسطين، صفاقس',
          parentName: 'سمير العيادي',
          parentPhone: '21698765432',
          parentEmail: 'samir.ayadi@email.com',
          familyStatus: '',
          healthStatus: '',
          specialNeeds: '',
          notes: '',
          isRepeating: false,
          createdAt: '2024-01-16T09:15:00.000Z',
          updatedAt: '2024-01-16T09:15:00.000Z'
        },
        {
          id: uuidv4(),
          studentId: '2024003',
          firstName: 'محمد',
          lastName: 'التريكي',
          birthDate: '2008-11-30',
          gender: 'male',
          level: 'السنة الثالثة متوسط',
          group: 'الفوج 1',
          address: 'شارع الجمهورية، سوسة',
          parentName: 'كمال التريكي',
          parentPhone: '21655443322',
          parentEmail: 'kamel.triki@email.com',
          familyStatus: '',
          healthStatus: '',
          specialNeeds: '',
          notes: '',
          isRepeating: true,
          createdAt: '2024-01-17T10:30:00.000Z',
          updatedAt: '2024-01-17T10:30:00.000Z'
        }
      ];

      await Promise.all(exampleStudents.map(student => 
        studentsDB.setItem(student.id, student)
      ));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
})();