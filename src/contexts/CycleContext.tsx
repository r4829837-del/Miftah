import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, updateSettings } from '../lib/storage';
import CycleSwitchModal from '../components/CycleSwitchModal';

export type CycleType = 'متوسط' | 'ثانوي';

interface CycleConfig {
  name: string;
  title: string;
  levels: string[];
  schoolName: string;
  counselorName: string;
  icon: string;
  color: string;
  // Nouveaux paramètres de configuration
  description?: string;
  academicYear?: string;
  maxStudentsPerClass?: number;
  gradingScale?: {
    min: number;
    max: number;
    passingGrade: number;
  };
  subjects?: string[];
  semesters?: string[];
  groups?: string[];
  features?: {
    enableReports: boolean;
    enableTests: boolean;
    enableGoals: boolean;
    enableNews: boolean;
    enableSchedule: boolean;
    enableAnalysis: boolean;
  };
  appearance?: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
}

interface CycleContextType {
  currentCycle: CycleType;
  setCurrentCycle: (cycle: CycleType) => void;
  toggleCycle: () => void;
  switchCycleWithConfirmation: (targetCycle: CycleType) => Promise<boolean>;
  getCycleTitle: () => string;
  getCycleLevels: () => string[];
  getCycleConfig: (cycle: CycleType) => CycleConfig;
  updateCycleConfig: (cycle: CycleType, config: Partial<CycleConfig>) => Promise<void>;
  getAvailableCycles: () => CycleConfig[];
  showSwitchModal: boolean;
  pendingCycle: CycleType | null;
  handleConfirmSwitch: () => void;
  handleCancelSwitch: () => void;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

interface CycleProviderProps {
  children: ReactNode;
}

export const CycleProvider: React.FC<CycleProviderProps> = ({ children }) => {
  const [currentCycle, setCurrentCycle] = useState<CycleType>('متوسط');
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingCycle, setPendingCycle] = useState<CycleType | null>(null);
  const [cycleConfigs, setCycleConfigs] = useState<Record<CycleType, CycleConfig>>({
    متوسط: {
      name: 'متوسط',
      title: 'التعليم المتوسط',
      description: 'نظام إدارة التعليم المتوسط',
      levels: [
        'الأولى متوسط',
        'الثانية متوسط',
        'الثالثة متوسط',
        'الرابعة متوسط'
      ],
      schoolName: 'المتوسطة',
      counselorName: 'مستشار(ة) التوجيه',
      icon: 'BookOpen',
      color: 'blue',
      academicYear: '2024-2025',
      maxStudentsPerClass: 30,
      gradingScale: {
        min: 0,
        max: 20,
        passingGrade: 10
      },
      subjects: [
        'اللغة العربية',
        'الرياضيات',
        'العلوم الطبيعية',
        'التاريخ والجغرافيا',
        'التربية الإسلامية',
        'اللغة الفرنسية',
        'اللغة الإنجليزية',
        'التربية البدنية'
      ],
      semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
      groups: ['أ', 'ب', 'ج', 'د'],
      features: {
        enableReports: true,
        enableTests: true,
        enableGoals: true,
        enableNews: true,
        enableSchedule: true,
        enableAnalysis: true
      },
      appearance: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF'
      }
    },
    ثانوي: {
      name: 'ثانوي',
      title: 'التعليم الثانوي',
      description: 'نظام إدارة التعليم الثانوي',
      levels: [
        'الأولى ثانوي',
        'الثانية ثانوي',
        'الثالثة ثانوي'
      ],
      schoolName: 'الثانوية',
      counselorName: 'مستشار(ة) التوجيه',
      icon: 'GraduationCap',
      color: 'purple',
      academicYear: '2024-2025',
      maxStudentsPerClass: 25,
      gradingScale: {
        min: 0,
        max: 20,
        passingGrade: 10
      },
      subjects: [
        'اللغة العربية',
        'الرياضيات',
        'العلوم الطبيعية',
        'الفيزياء',
        'الكيمياء',
        'علوم الحياة والأرض',
        'التاريخ والجغرافيا',
        'التربية الإسلامية',
        'اللغة الفرنسية',
        'اللغة الإنجليزية',
        'الفلسفة',
        'التربية البدنية'
      ],
      semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
      groups: ['أ', 'ب', 'ج'],
      features: {
        enableReports: true,
        enableTests: true,
        enableGoals: true,
        enableNews: true,
        enableSchedule: true,
        enableAnalysis: true
      },
      appearance: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#6D28D9'
      }
    }
  });

  // Charger le cycle depuis localStorage au démarrage
  useEffect(() => {
    const savedCycle = localStorage.getItem('currentCycle') as CycleType;
    if (savedCycle && (savedCycle === 'متوسط' || savedCycle === 'ثانوي')) {
      setCurrentCycle(savedCycle);
    }
  }, []);

  // Écouter les changements de cycle depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentCycle' && e.newValue) {
        const newCycle = e.newValue as CycleType;
        if (newCycle === 'متوسط' || newCycle === 'ثانوي') {
          console.log(`🔄 Cycle changé depuis un autre onglet: ${newCycle}`);
          setCurrentCycle(newCycle);
        }
      }
    };

    // Écouter les changements de localStorage depuis d'autres onglets
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les changements dans la même fenêtre (pour les mises à jour locales)
    const interval = setInterval(() => {
      const currentCycleFromStorage = localStorage.getItem('currentCycle') as CycleType;
      if (currentCycleFromStorage && currentCycleFromStorage !== currentCycle) {
        if (currentCycleFromStorage === 'متوسط' || currentCycleFromStorage === 'ثانوي') {
          console.log(`🔄 Cycle changé localement: ${currentCycleFromStorage}`);
          setCurrentCycle(currentCycleFromStorage);
        }
      }
    }, 1000); // Vérifier toutes les secondes

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentCycle]);

  // Charger les configurations des cycles depuis les paramètres
  useEffect(() => {
    loadCycleConfigs();
  }, []);

  // Recharger les configurations quand le cycle change
  useEffect(() => {
    loadCycleConfigs();
  }, [currentCycle]);

  // Sauvegarder le cycle dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('currentCycle', currentCycle);
  }, [currentCycle]);

  const loadCycleConfigs = async () => {
    try {
      // Charger les paramètres pour chaque cycle indépendamment
      const collegeSettings = await getSettings('متوسط');
      const highSchoolSettings = await getSettings('ثانوي');
      
      // Mettre à jour les configurations avec les paramètres sauvegardés pour chaque cycle
      setCycleConfigs(prev => ({
        متوسط: {
          ...prev.متوسط,
          schoolName: collegeSettings.schoolName || prev.متوسط.schoolName,
          counselorName: collegeSettings.counselorName || prev.متوسط.counselorName,
          levels: collegeSettings.levels || prev.متوسط.levels,
          academicYear: collegeSettings.academicYear || prev.متوسط.academicYear,
          maxStudentsPerClass: collegeSettings.maxStudentsPerClass || prev.متوسط.maxStudentsPerClass,
          gradingScale: collegeSettings.gradingScale || prev.متوسط.gradingScale,
          subjects: collegeSettings.subjects || prev.متوسط.subjects,
          semesters: collegeSettings.semesters || prev.متوسط.semesters,
          groups: collegeSettings.groups || prev.متوسط.groups,
          features: collegeSettings.features || prev.متوسط.features,
          appearance: collegeSettings.appearance || prev.متوسط.appearance
        },
        ثانوي: {
          ...prev.ثانوي,
          schoolName: highSchoolSettings.schoolName || prev.ثانوي.schoolName,
          counselorName: highSchoolSettings.counselorName || prev.ثانوي.counselorName,
          levels: highSchoolSettings.levels || prev.ثانوي.levels,
          academicYear: highSchoolSettings.academicYear || prev.ثانوي.academicYear,
          maxStudentsPerClass: highSchoolSettings.maxStudentsPerClass || prev.ثانوي.maxStudentsPerClass,
          gradingScale: highSchoolSettings.gradingScale || prev.ثانوي.gradingScale,
          subjects: highSchoolSettings.subjects || prev.ثانوي.subjects,
          semesters: highSchoolSettings.semesters || prev.ثانوي.semesters,
          groups: highSchoolSettings.groups || prev.ثانوي.groups,
          features: highSchoolSettings.features || prev.ثانوي.features,
          appearance: highSchoolSettings.appearance || prev.ثانوي.appearance
        }
      }));
    } catch (error) {
      console.error('Error loading cycle configs:', error);
      // En cas d'erreur, utiliser les configurations par défaut
      console.log('Using default cycle configurations due to error');
    }
  };

  const toggleCycle = () => {
    setCurrentCycle(prev => prev === 'متوسط' ? 'ثانوي' : 'متوسط');
  };

  const switchCycleWithConfirmation = async (targetCycle: CycleType): Promise<boolean> => {
    if (currentCycle === targetCycle) {
      return false; // Pas de changement nécessaire
    }

    // Créer une promesse qui sera résolue par la confirmation utilisateur
    return new Promise((resolve) => {
      setPendingCycle(targetCycle);
      setShowSwitchModal(true);
      
      // Stocker la fonction resolve pour l'utiliser dans les handlers du modal
      (window as any).__cycleSwitchResolve = resolve;
    });
  };

  const handleConfirmSwitch = () => {
    if (pendingCycle) {
      setCurrentCycle(pendingCycle);
      setShowSwitchModal(false);
      setPendingCycle(null);
      if ((window as any).__cycleSwitchResolve) {
        (window as any).__cycleSwitchResolve(true);
        delete (window as any).__cycleSwitchResolve;
      }
    }
  };

  const handleCancelSwitch = () => {
    setShowSwitchModal(false);
    setPendingCycle(null);
    if ((window as any).__cycleSwitchResolve) {
      (window as any).__cycleSwitchResolve(false);
      delete (window as any).__cycleSwitchResolve;
    }
  };

  const getCycleTitle = () => {
    return cycleConfigs[currentCycle].title;
  };

  const getCycleLevels = () => {
    return cycleConfigs[currentCycle].levels;
  };

  const getCycleConfig = (cycle: CycleType) => {
    return cycleConfigs[cycle];
  };

  const updateCycleConfig = async (cycle: CycleType, config: Partial<CycleConfig>) => {
    const updatedConfig = { ...cycleConfigs[cycle], ...config };
    setCycleConfigs(prev => ({ ...prev, [cycle]: updatedConfig }));

    // Sauvegarder dans les paramètres pour le cycle spécifique uniquement
    try {
      const settings = await getSettings(cycle);
      
      const updatedSettings = {
        ...settings,
        schoolName: config.schoolName || settings.schoolName,
        levels: config.levels || settings.levels,
        academicYear: config.academicYear || settings.academicYear,
        maxStudentsPerClass: config.maxStudentsPerClass || settings.maxStudentsPerClass,
        gradingScale: config.gradingScale || settings.gradingScale,
        subjects: config.subjects || settings.subjects,
        semesters: config.semesters || settings.semesters,
        groups: config.groups || settings.groups,
        features: config.features || settings.features,
        appearance: config.appearance || settings.appearance
      };
      
      await updateSettings(updatedSettings, cycle);
      
      // Recharger les configurations pour le cycle spécifique
      await loadCycleConfigs();
    } catch (error) {
      console.error('Error updating cycle config:', error);
    }
  };

  const getAvailableCycles = () => {
    return Object.values(cycleConfigs);
  };


  const value: CycleContextType = {
    currentCycle,
    setCurrentCycle,
    toggleCycle,
    switchCycleWithConfirmation,
    getCycleTitle,
    getCycleLevels,
    getCycleConfig,
    updateCycleConfig,
    getAvailableCycles,
    showSwitchModal,
    pendingCycle,
    handleConfirmSwitch,
    handleCancelSwitch
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
      <CycleSwitchModal
        isOpen={showSwitchModal}
        onClose={handleCancelSwitch}
        onConfirm={handleConfirmSwitch}
        currentCycleTitle={cycleConfigs[currentCycle]?.title || ''}
        targetCycleTitle={pendingCycle ? cycleConfigs[pendingCycle]?.title || '' : ''}
        currentCycleName={currentCycle}
        targetCycleName={pendingCycle || ''}
      />
    </CycleContext.Provider>
  );
};

export const useCycle = (): CycleContextType => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
};