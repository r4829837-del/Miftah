import { getCurrentCycle, getCycleLocalStorage, setCycleLocalStorage } from '../lib/storage';

/**
 * Script de migration pour assurer la transition vers l'indépendance totale des cycles
 */

export interface MigrationResult {
  success: boolean;
  message: string;
  migratedData?: any;
  errors?: string[];
}

/**
 * Migrer les données existantes vers le système par cycle
 */
export const migrateToCycleIndependence = async (): Promise<MigrationResult> => {
  const errors: string[] = [];
  const migratedData: any = {};

  try {
    // 1. Migrer les données des étudiants
    await migrateStudentsData(migratedData, errors);
    
    // 2. Migrer les paramètres
    await migrateSettingsData(migratedData, errors);
    
    // 3. Migrer les données des composants
    await migrateComponentData(migratedData, errors);
    
    // 4. Nettoyer les anciennes données globales
    await cleanupGlobalData(errors);

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? 'تمت الهجرة بنجاح إلى نظام استقلالية الدورات'
        : `تمت الهجرة مع ${errors.length} تحذيرات`,
      migratedData,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      message: 'فشل في الهجرة',
      errors: [error instanceof Error ? error.message : 'خطأ غير معروف']
    };
  }
};

/**
 * Migrer les données des étudiants
 */
const migrateStudentsData = async (migratedData: any, errors: string[]) => {
  try {
    // Vérifier s'il y a des données d'étudiants dans localStorage global
    const globalStudents = localStorage.getItem('students');
    if (globalStudents) {
      const students = JSON.parse(globalStudents);
      
      // Séparer les étudiants par cycle basé sur leur niveau
      const collegeStudents = students.filter((student: any) => 
        student.level && student.level.includes('متوسط')
      );
      const highSchoolStudents = students.filter((student: any) => 
        student.level && student.level.includes('ثانوي')
      );

      // Sauvegarder dans les cycles respectifs
      if (collegeStudents.length > 0) {
        setCycleLocalStorage('students', collegeStudents, 'متوسط');
        migratedData.collegeStudents = collegeStudents.length;
      }
      
      if (highSchoolStudents.length > 0) {
        setCycleLocalStorage('students', highSchoolStudents, 'ثانوي');
        migratedData.highSchoolStudents = highSchoolStudents.length;
      }

      // Supprimer les données globales
      localStorage.removeItem('students');
    }
  } catch (error) {
    errors.push(`خطأ في هجرة بيانات الطلاب: ${error}`);
  }
};

/**
 * Migrer les paramètres
 */
const migrateSettingsData = async (migratedData: any, errors: string[]) => {
  try {
    const globalSettings = localStorage.getItem('appSettings');
    if (globalSettings) {
      const settings = JSON.parse(globalSettings);
      
      // Créer des paramètres séparés pour chaque cycle
      const collegeSettings = {
        ...settings,
        schoolName: settings.schoolName || 'المتوسطة',
        levels: settings.levels?.filter((level: string) => level.includes('متوسط')) || [
          'الأولى متوسط',
          'الثانية متوسط', 
          'الثالثة متوسط',
          'الرابعة متوسط'
        ]
      };
      
      const highSchoolSettings = {
        ...settings,
        schoolName: settings.highSchoolName || 'الثانوية',
        levels: settings.levels?.filter((level: string) => level.includes('ثانوي')) || [
          'الأولى ثانوي',
          'الثانية ثانوي',
          'الثالثة ثانوي'
        ]
      };

      setCycleLocalStorage('appSettings', collegeSettings, 'متوسط');
      setCycleLocalStorage('appSettings', highSchoolSettings, 'ثانوي');
      
      migratedData.settingsMigrated = true;
      
      // Supprimer les paramètres globaux
      localStorage.removeItem('appSettings');
    }
  } catch (error) {
    errors.push(`خطأ في هجرة الإعدادات: ${error}`);
  }
};

/**
 * Migrer les données des composants
 */
const migrateComponentData = async (migratedData: any, errors: string[]) => {
  const componentKeys = [
    'reports',
    'interventionData', 
    'counselorData',
    'testResults',
    'goalsData',
    'scheduleData',
    'analysisData',
    'recommendations',
    'newsData',
    'lastNewsCheck',
    'vocationalInstitutions'
  ];

  for (const key of componentKeys) {
    try {
      const globalData = localStorage.getItem(key);
      if (globalData) {
        const data = JSON.parse(globalData);
        
        // Pour les données qui peuvent être partagées entre cycles
        if (key === 'vocationalInstitutions' || key === 'newsData' || key === 'lastNewsCheck') {
          setCycleLocalStorage(key, data, 'متوسط');
          setCycleLocalStorage(key, data, 'ثانوي');
        } else {
          // Pour les autres données, les attribuer au cycle actuel
          const currentCycle = getCurrentCycle();
          setCycleLocalStorage(key, data, currentCycle);
        }
        
        migratedData[key] = true;
        localStorage.removeItem(key);
      }
    } catch (error) {
      errors.push(`خطأ في هجرة ${key}: ${error}`);
    }
  }
};

/**
 * Nettoyer les données globales
 */
const cleanupGlobalData = async (errors: string[]) => {
  try {
    // Supprimer les clés globales qui ne sont plus nécessaires
    const globalKeys = [
      'students',
      'appSettings', 
      'reports',
      'interventionData',
      'counselorData',
      'testResults',
      'goalsData',
      'scheduleData',
      'analysisData',
      'recommendations'
    ];

    globalKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

  } catch (error) {
    errors.push(`خطأ في تنظيف البيانات: ${error}`);
  }
};

/**
 * Vérifier si la migration est nécessaire
 */
export const isMigrationNeeded = (): boolean => {
  // Vérifier s'il y a des données globales qui nécessitent une migration
  const globalKeys = [
    'students',
    'appSettings',
    'reports',
    'interventionData',
    'counselorData',
    'testResults',
    'goalsData',
    'scheduleData',
    'analysisData',
    'recommendations'
  ];

  return globalKeys.some(key => localStorage.getItem(key) !== null);
};

/**
 * Obtenir un résumé des données à migrer
 */
export const getMigrationSummary = (): { [key: string]: number } => {
  const summary: { [key: string]: number } = {};
  
  const globalKeys = [
    'students',
    'appSettings',
    'reports',
    'interventionData',
    'counselorData',
    'testResults',
    'goalsData',
    'scheduleData',
    'analysisData',
    'recommendations'
  ];

  globalKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          summary[key] = parsed.length;
        } else if (typeof parsed === 'object') {
          summary[key] = Object.keys(parsed).length;
        } else {
          summary[key] = 1;
        }
      } catch {
        summary[key] = 1;
      }
    }
  });

  return summary;
};