import React, { useRef, useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet,
  Download,
  Upload,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { ensureArabicFont, addArabicText } from '../lib/pdfArabic';
// Removed unused: createHTMLBasedPDF, createArabicHTMLContent
import { createProfessionalReport } from '../lib/pdfProfessionalReportSimple';
import { extractStudents } from '../utils/excelReader';
import { buildFinalJsonTS } from '../utils/stats';
import { getAnalysisDB } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import { useCycleStorage } from '../hooks/useCycleStorage';

const AnalysisResults: React.FC = () => {
  const { currentCycle } = useCycle();
  const { getStorage, setStorage } = useCycleStorage();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Déterminer الفصل الحالي selon المسار
  const semesterIndex = location.pathname.endsWith('/sem2') ? 2 : (location.pathname.endsWith('/sem3') ? 3 : 1);
  const semesterLabel = semesterIndex === 1 ? 'الفصل الأول' : (semesterIndex === 2 ? 'الفصل الثاني' : 'الفصل الثالث');
  const moyenneKey = `moyenneSem${semesterIndex}` as const;
  const isHighSchool = (currentCycle as any) === 'ثانوي';

  // Fonction pour détecter l'orientation automatiquement
  const detectOrientation = (student: any) => {
    if (!student) return 'غير محدد';
    
    // Use BEM criteria: prioritize general average from student data
    let generalAverage = 0;
    
    // 1) Try to get general average from student.moyenne first
    if (student.moyenne && !isNaN(parseFloat(student.moyenne))) {
      generalAverage = parseFloat(student.moyenne);
    } else if (student.moyenneGenerale && !isNaN(parseFloat(student.moyenneGenerale))) {
      generalAverage = parseFloat(student.moyenneGenerale);
    } else if (student.moyenneSem1 && !isNaN(parseFloat(student.moyenneSem1))) {
      generalAverage = parseFloat(student.moyenneSem1);
    } else {
      // 2) Calculate from individual subjects if available
      const sources = [student.notes, student.matieres, student];
      const foundGrades: number[] = [];
      sources.forEach(source => {
        if (source && typeof source === 'object') {
          Object.values(source).forEach((val: any) => {
            if (typeof val === 'string' && !isNaN(parseFloat(val)) && parseFloat(val) > 0) {
              foundGrades.push(parseFloat(val));
            }
          });
        }
      });
      if (foundGrades.length > 0) {
        generalAverage = foundGrades.reduce((a, b) => a + b, 0) / foundGrades.length;
      }
    }
    
    // Apply orientation criteria based on cycle
    if (isHighSchool) {
      // Criteria for high school cycle (ثانوي)
      if (generalAverage >= 18) {
        return 'جامعي';
      } else if (generalAverage >= 16) {
        return 'تقني سامي';
      } else if (generalAverage >= 14) {
        return 'مهني';
      } else if (generalAverage >= 10) {
        return 'تدريب مهني';
      } else if (generalAverage > 0) {
        return 'إعادة السنة';
      }
    } else {
      // Criteria for college cycle (متوسط) - BEM orientation
      if (generalAverage >= 16) {
        return 'ثانوي علمي';
      } else if (generalAverage >= 14) {
        return 'ثانوي تقني';
      } else if (generalAverage >= 10) {
        return 'ثانوي مهني';
      } else if (generalAverage > 0) {
        return 'إعادة السنة';
      }
    }
    
    return 'غير محدد';
  };
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [hasAllLevels, setHasAllLevels] = useState<boolean>(false);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('moyenneSem1');
  const [textReport, setTextReport] = useState<string>('');
  
  // Pagination states for guidance analysis
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [selectedGuidance, setSelectedGuidance] = useState<string>('all');

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Auto-load last persisted analysis dataset for this cycle/semester (after restore)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Only load if nothing in memory yet
        if (students.length > 0 || stats) return;
        const db = getAnalysisDB(currentCycle);
        let latest: any | null = null;
        await db.iterate((value: any) => {
          if (value && value.semester === semesterIndex && Array.isArray(value.students)) {
            if (!latest || (value.createdAt && latest.createdAt && new Date(value.createdAt) > new Date(latest.createdAt))) {
              latest = value;
            }
          }
        });
        if (active && latest) {
          setStudents(latest.students || []);
          setStats({ stats: latest.stats });
        }
      } catch (_) {
        // no-op
      }
    })();
    return () => { active = false; };
  }, [currentCycle, semesterIndex]);

  // Transform imported students data for guidance analysis
  const transformStudentsForGuidance = () => {
    if (!students || students.length === 0) {
      return [];
    }

    return students.map((student, index) => {
      // Define science subjects with multiple variants
      const scienceSubjects = [
        'الرياضيات', 'رياضيات', 'math', 'Math', 'Mathématiques',
        'العلوم الطبيعية و الحياة', 'العلوم الطبيعية', 'علوم طبيعية', 'svt', 'SVT', 'Sciences naturelles',
        'العلوم الفيزيائية و التكنولوجيا', 'العلوم الفيزيائية', 'علوم فيزيائية', 'physique', 'Physique', 'Sciences physiques',
        'المعلوماتية', 'إعلام آلي', 'informatique', 'Informatique'
      ];
      
      // Define arts subjects with multiple variants
      const artsSubjects = [
        'اللغة العربية', 'عربية', 'arabic', 'Arabic', 'Arabe',
        'اللغة الفرنسية', 'فرنسية', 'french', 'French', 'Français',
        'اللغة الإنجليزية', 'إنجليزية', 'english', 'English', 'Anglais',
        'التاريخ و الجغرافيا', 'تاريخ', 'جغرافيا', 'histoire', 'geographie', 'Histoire', 'Géographie',
        'التربية الإسلامية', 'تربية إسلامية', 'islamic', 'Islamic'
      ];
      
      // Helper function to extract grades from various data sources
      const extractGrades = (subjects: string[]) => {
        let grades: number[] = [];
        
        // Method 1: Check student.notes object (if it's an object)
        if (student.notes && typeof student.notes === 'object') {
          grades = subjects
            .map(subject => student.notes[subject])
            .filter(grade => grade !== undefined && grade !== null && grade !== '' && !isNaN(parseFloat(grade)))
            .map(grade => parseFloat(grade));
        }
        
        // Method 2: Check direct properties on student object
        if (grades.length === 0) {
          grades = subjects
            .map(subject => student[subject])
            .filter(grade => grade !== undefined && grade !== null && grade !== '' && !isNaN(parseFloat(grade)))
            .map(grade => parseFloat(grade));
        }
        
        // Method 3: Check student.matieres object (if it exists)
        if (grades.length === 0 && student.matieres && typeof student.matieres === 'object') {
          grades = subjects
            .map(subject => student.matieres[subject])
            .filter(grade => grade !== undefined && grade !== null && grade !== '' && !isNaN(parseFloat(grade)))
            .map(grade => parseFloat(grade));
        }
        
        // Method 4: Search through all properties for matching subject names
        if (grades.length === 0) {
          const allKeys = Object.keys(student);
          subjects.forEach(subject => {
            const matchingKey = allKeys.find(key => 
              key.toLowerCase().includes(subject.toLowerCase()) || 
              subject.toLowerCase().includes(key.toLowerCase())
            );
            if (matchingKey && student[matchingKey] && !isNaN(parseFloat(student[matchingKey]))) {
              grades.push(parseFloat(student[matchingKey]));
            }
          });
        }
        
        return grades;
      };
      
      // Get science average
      const scienceGrades = extractGrades(scienceSubjects);
      const scienceAverage = scienceGrades.length > 0 
        ? scienceGrades.reduce((sum, grade) => sum + grade, 0) / scienceGrades.length 
        : 0;
      
      // Get arts average
      const artsGrades = extractGrades(artsSubjects);
      const artsAverage = artsGrades.length > 0 
        ? artsGrades.reduce((sum, grade) => sum + grade, 0) / artsGrades.length 
        : 0;
      
      // Determine guidance with improved logic
      let guidance = '';
      let guidanceAdvice = '';
      let performance = '';
      
      // Debug logging
      console.log(`Student ${index + 1}: Science=${scienceAverage}, Arts=${artsAverage}, ScienceGrades=${scienceGrades.length}, ArtsGrades=${artsGrades.length}`);
      
      if (scienceAverage > 0 && artsAverage > 0) {
        const difference = Math.abs(scienceAverage - artsAverage);
        
        if (scienceAverage > artsAverage) {
          guidance = 'ميل نحو العلوم';
          if (difference > 2) {
            guidanceAdvice = 'توجه واضح للعلوم';
            performance = scienceAverage >= 14 ? 'ممتاز في العلوم' : scienceAverage >= 12 ? 'جيد في العلوم' : 'يحتاج تحسين';
          } else {
            guidanceAdvice = 'ميل طفيف للعلوم';
            performance = 'متوازن';
          }
        } else if (artsAverage > scienceAverage) {
          guidance = 'ميل نحو الآداب';
          if (difference > 2) {
            guidanceAdvice = 'توجه واضح للآداب';
            performance = artsAverage >= 14 ? 'ممتاز في الآداب' : artsAverage >= 12 ? 'جيد في الآداب' : 'يحتاج تحسين';
          } else {
            guidanceAdvice = 'ميل طفيف للآداب';
            performance = 'متوازن';
          }
        } else {
          // Equal averages
          guidance = 'متوازن';
          guidanceAdvice = 'أداء متوازن في كلا المجالين';
          performance = 'متوازن';
        }
      } else if (scienceAverage > 0 && artsAverage === 0) {
        // Only science grades available
        guidance = 'ميل نحو العلوم';
        guidanceAdvice = 'بيانات متاحة للعلوم فقط';
        performance = scienceAverage >= 14 ? 'ممتاز في العلوم' : scienceAverage >= 12 ? 'جيد في العلوم' : 'يحتاج تحسين';
      } else if (artsAverage > 0 && scienceAverage === 0) {
        // Only arts grades available
        guidance = 'ميل نحو الآداب';
        guidanceAdvice = 'بيانات متاحة للآداب فقط';
        performance = artsAverage >= 14 ? 'ممتاز في الآداب' : artsAverage >= 12 ? 'جيد في الآداب' : 'يحتاج تحسين';
      } else {
        // No grades available
        guidance = 'غير محدد';
        guidanceAdvice = 'يحتاج مزيد من التقييم - لا توجد بيانات كافية';
        performance = 'غير متاح';
      }
      
      // Get section/class number
      const section = student.classe || student.group || student.section || student.class || student.groupe || 'غير محدد';
      
      // Get level
      const level = student.niveau || student.level || student.classe || 'رابعة متوسط';
      
      // Get name
      const name = student.name || student.lastName || student.nom || student.nom_famille || '';
      const firstName = student.firstName || student.prenom || '';
      const fullName = `${name} ${firstName}`.trim() || `طالب ${index + 1}`;
      
      // Calculate overall performance with improved logic
      let overallAverage = 0;
      let overallStatus = '';
      
      if (scienceAverage > 0 && artsAverage > 0) {
        overallAverage = (scienceAverage + artsAverage) / 2;
      } else if (scienceAverage > 0) {
        overallAverage = scienceAverage;
      } else if (artsAverage > 0) {
        overallAverage = artsAverage;
      } else {
        // Try to get overall average from student data
        const possibleAverages = [
          student.moyenne, student.moyenneSem1, student.moyenneSem2, 
          student.moyenneGenerale, student.average, student.totalAverage
        ];
        
        for (const avg of possibleAverages) {
          if (avg && !isNaN(parseFloat(avg)) && parseFloat(avg) > 0) {
            overallAverage = parseFloat(avg);
            break;
          }
        }
      }
      
      // Determine overall status
      if (overallAverage >= 16) {
        overallStatus = 'متفوق';
      } else if (overallAverage >= 14) {
        overallStatus = 'جيد جداً';
      } else if (overallAverage >= 12) {
        overallStatus = 'جيد';
      } else if (overallAverage >= 10) {
        overallStatus = 'مقبول';
      } else if (overallAverage > 0) {
        overallStatus = 'يحتاج دعم';
      } else {
        overallStatus = 'غير محدد';
      }
      
      return {
        id: index + 1,
        name: fullName,
        science: scienceAverage > 0 ? Math.round(scienceAverage * 100) / 100 : 0,
        arts: artsAverage > 0 ? Math.round(artsAverage * 100) / 100 : 0,
        guidance,
        guidanceAdvice,
        performance,
        overallStatus,
        section: section,
        level: level
      };
    });
  };

  const guidanceStudents = transformStudentsForGuidance()
  
  // Force recalculation of guidance indicators
  const recalculateGuidanceIndicators = () => {
    console.log('=== RECALCULATING GUIDANCE INDICATORS ===');
    console.log('Total students:', students.length);
    console.log('Guidance students:', guidanceStudents.length);
    
    const scienceCount = guidanceStudents.filter(s => s.guidance === 'ميل نحو العلوم').length;
    const artsCount = guidanceStudents.filter(s => s.guidance === 'ميل نحو الآداب').length;
    const balancedCount = guidanceStudents.filter(s => s.guidance === 'متوازن').length;
    const undefinedCount = guidanceStudents.filter(s => s.guidance === 'غير محدد').length;
    const excellentCount = guidanceStudents.filter(s => s.overallStatus === 'متفوق').length;
    
    console.log('Science-oriented students:', scienceCount);
    console.log('Arts-oriented students:', artsCount);
    console.log('Balanced students:', balancedCount);
    console.log('Undefined orientation:', undefinedCount);
    console.log('Excellent students:', excellentCount);
    
    return {
      scienceCount,
      artsCount,
      balancedCount,
      undefinedCount,
      excellentCount,
      total: guidanceStudents.length
    };
  };
  
  // Calculate indicators
  const indicators = recalculateGuidanceIndicators();
  

  // Get actual students data for pagination
  const actualStudents = students.filter((s: any) => Number.isFinite(Number(s?.moyenne)));
  
  // Filter logic (for guidance analysis)
  // Note: filteredStudents was unused in UI; keep for future filters or remove if not needed
  const _filteredStudents = guidanceStudents.filter(student => {
    if (selectedGuidance === 'all') return true;
    return student.guidance === selectedGuidance;
  });

  // Pagination logic - use actual students count
  const totalPages = actualStudents.length > 0 ? Math.ceil(actualStudents.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Ensure current page doesn't exceed total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Filter handler
  const handleGuidanceFilter = (guidance: string) => {
    setSelectedGuidance(guidance);
    setCurrentPage(1); // Reset to first page when filtering
  };


  // Human-readable analysis functions
  const getGradeComment = (grade: number, subject: string): string => {
    if (grade >= 18) return `ممتاز في ${subject}! أداء رائع يستحق التقدير.`;
    if (grade >= 16) return `جيد جداً في ${subject}. مستوى عالي من الفهم والإتقان.`;
    if (grade >= 14) return `جيد في ${subject}. أداء مقبول مع إمكانية التحسن.`;
    if (grade >= 10) return `مقبول في ${subject}. يحتاج إلى مزيد من الجهد والتركيز.`;
    return `ضعيف في ${subject}. يتطلب دعم إضافي ومتابعة مكثفة.`;
  };

  const getGradeRecommendation = (grade: number, subject: string): string => {
    if (grade >= 16) return `استمر في نفس المستوى! يمكنك مساعدة زملائك في هذه المادة.`;
    if (grade >= 14) return `حافظ على هذا المستوى وحاول الوصول إلى 16+ في الفصل القادم.`;
    if (grade >= 10) return `ركز أكثر على ${subject}، ادرس يومياً واطلب المساعدة من المعلم.`;
    return `يحتاج دعم فوري في ${subject}. جلسات إضافية مع المعلم ضرورية.`;
  };

  const getPerformanceIcon = (grade: number): string => {
    if (grade >= 18) return '🌟';
    if (grade >= 16) return '⭐';
    if (grade >= 14) return '👍';
    if (grade >= 10) return '⚠️';
    return '🚨';
  };

  const getOverallAnalysis = (studentData: any): string => {
    if (!studentData || !studentData.matieres) return '';
    
    const grades = Object.values(studentData.matieres).filter((g: any) => typeof g === 'number' && g > 0) as number[];
    if (grades.length === 0) return '';
    
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const excellentCount = grades.filter(g => g >= 16).length;
    const weakCount = grades.filter(g => g < 10).length;
    
    if (average >= 16) {
      return `طالب متفوق! معدل ${average.toFixed(1)} مع ${excellentCount} مادة ممتازة. أداء متميز يستحق التقدير.`;
    } else if (average >= 14) {
      return `طالب جيد! معدل ${average.toFixed(1)}. أداء مقبول مع إمكانية التحسن في بعض المواد.`;
    } else if (average >= 10) {
      return `طالب مقبول! معدل ${average.toFixed(1)}. يحتاج دعم في ${weakCount} مادة لتحسين الأداء.`;
    } else {
      return `طالب يحتاج دعم! معدل ${average.toFixed(1)}. ${weakCount} مادة تحتاج متابعة فورية.`;
    }
  };


  // Reset current page when students data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [students]);
  
  const mapAppreciationToArabic = (val?: string) => {
    switch (val) {
      case 'Excellent': return 'ممتاز';
      case 'Très bien': return 'جيد جداً';
      case 'Bien': return 'جيد';
      case 'Assez bien': return 'مقبول';
      case 'Insuffisant': return 'ضعيف';
      default: return val || '';
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic levels based on current cycle
  const getLevels = () => {
    if (currentCycle === 'ثانوي') {
      return [
        { id: '1AS', label: 'السنة الأولى ثانوي' },
        { id: '2AS', label: 'السنة الثانية ثانوي' },
        { id: '3AS', label: 'السنة الثالثة ثانوي' },
        { id: 'all', label: 'جميع المستويات' }
      ];
    } else {
      return [
        { id: '1AM', label: 'السنة الأولى متوسط' },
        { id: '2AM', label: 'السنة الثانية متوسط' },
        { id: '3AM', label: 'السنة الثالثة متوسط' },
        { id: '4AM', label: 'السنة الرابعة متوسط' },
        { id: 'all', label: 'جميع المستويات' }
      ];
    }
  };

  const levels = getLevels();

  // Function to detect if all levels are present in the imported data
  const detectAllLevels = (studentsData: any[]) => {
    if (!studentsData || studentsData.length === 0) return false;
    
    const presentLevels = new Set();
    studentsData.forEach(student => {
      // Check multiple possible class properties
      const classFields = [student.classe, student.niveau, student.level, student.class];
      
      classFields.forEach(field => {
        if (field) {
          const classe = field.toString().toUpperCase();
          console.log('Checking class field:', classe);
          
          // More flexible detection patterns
          if (classe.includes('1') && (classe.includes('م') || classe.includes('M') || classe.includes('AM'))) {
            presentLevels.add('1AM');
          }
          if (classe.includes('2') && (classe.includes('م') || classe.includes('M') || classe.includes('AM'))) {
            presentLevels.add('2AM');
          }
          if (classe.includes('3') && (classe.includes('م') || classe.includes('M') || classe.includes('AM'))) {
            presentLevels.add('3AM');
          }
          if (classe.includes('4') && (classe.includes('م') || classe.includes('M') || classe.includes('AM'))) {
            presentLevels.add('4AM');
          }
          
          // Direct pattern matching
          if (classe === '1AM' || classe === '1م' || classe === '1M') presentLevels.add('1AM');
          if (classe === '2AM' || classe === '2م' || classe === '2M') presentLevels.add('2AM');
          if (classe === '3AM' || classe === '3م' || classe === '3M') presentLevels.add('3AM');
          if (classe === '4AM' || classe === '4م' || classe === '4M') presentLevels.add('4AM');
        }
      });
    });
    
    console.log('Detected levels:', Array.from(presentLevels));
    
    // Check if all 4 levels are present for متوسط cycle
    if (currentCycle === 'متوسط') {
      const allPresent = presentLevels.has('1AM') && presentLevels.has('2AM') && 
                        presentLevels.has('3AM') && presentLevels.has('4AM');
      console.log('All levels present:', allPresent);
      return allPresent;
    }
    
    return false;
  };

  // Reset filters and in-memory data when cycle or semester changes to avoid cross-cycle bleed
  useEffect(() => {
    setSelectedLevel('all');
    setStudents([]);
    setStats(null);
  }, [currentCycle, semesterIndex]);


  const handleUploadClick = () => fileInputRef.current?.click();

  // Handle student click to open modal
  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Clear current cycle/semester analysis data
  const handleClearAnalysis = async () => {
    try {
      const ok = window.confirm('سيتم تفريغ بيانات تحليل النتائج لهذا الفصل وهذه المرحلة فقط. هل تريد المتابعة؟');
      if (!ok) return;
      const db = getAnalysisDB(currentCycle);
      // Remove only current semester records
      const toDelete: string[] = [];
      await db.iterate((value: any, key: string) => {
        if (value && value.semester === semesterIndex) {
          toDelete.push(key);
        }
      });
      for (const key of toDelete) {
        await db.removeItem(key);
      }
      try { localStorage.removeItem(`analysis_cache_${currentCycle}_sem${semesterIndex}`); } catch (_) {}
      setStudents([]);
      setStats(null);
      alert('تم التفريغ بنجاح');
    } catch (e) {
      console.error('Failed to clear analysis data', e);
      alert('تعذر التفريغ. حاول مرة أخرى.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await extractStudents(file);
      setStudents(data);
      const computed = buildFinalJsonTS(data as any);
      setStats({ stats: computed });

      // Persist full analysis dataset per cycle and semester
      try {
        const db = getAnalysisDB(currentCycle);
        const record = {
          id: `analysis_${currentCycle}_sem${semesterIndex}`,
          cycle: currentCycle,
          semester: semesterIndex,
          createdAt: new Date().toISOString(),
          students: data,
          stats: computed
        };
        await db.setItem(record.id, record);
      } catch (err) {
        console.warn('Failed to persist analysis data', err);
      }
      
      // Detect if all levels are present
      const allLevelsPresent = detectAllLevels(data);
      setHasAllLevels(allLevelsPresent);

      // Persist simple cache of imported semester grades for annual analysis fallback
      try {
        const grades = Array.isArray(data) ? (data as any[])
          .map(s => typeof s?.moyenne === 'number' ? s.moyenne : (typeof s?.moyenne === 'string' ? parseFloat(s.moyenne) : null))
          .filter((v): v is number => v != null && isFinite(v)) : [];
        const cacheKey = `analysis_cache_${currentCycle}_sem${semesterIndex}`;
        localStorage.setItem(cacheKey, JSON.stringify(grades));
      } catch (_) {}
      
      alert(`تم استيراد ${data.length} تلميذاً وحساب الإحصائيات بنجاح`);
    } catch (err) {
      alert(`فشل استيراد الملف: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`);
    } finally {
      e.target.value = '';
    }
  };

  const getSubjects = (): string[] => {
    if (currentCycle === 'ثانوي') {
      return [
        'اللغة العربية',
        'اللغة الفرنسية', 
        'اللغة الإنجليزية',
        'الرياضيات',
        'العلوم الطبيعية و الحياة',
        'العلوم الفيزيائية و التكنولوجيا',
        'المعلوماتية',
        'التربية الإسلامية',
        'التربية المدنية',
        'التاريخ و الجغرافيا',
        'الفلسفة',
        'التربية البدنية و الرياضية'
      ];
    } else {
      return [
        'اللغة العربية',
        'اللغة الفرنسية',
        'اللغة الإنجليزية',
        'الرياضيات',
        'العلوم الطبيعية و الحياة',
        'العلوم الفيزيائية و التكنولوجيا',
        'المعلوماتية',
        'التربية الإسلامية',
        'التربية المدنية',
        'التاريخ و الجغرافيا',
        'التربية التشكيلية',
        'التربية الموسيقية',
        'التربية البدنية و الرياضية'
      ];
    }
  };


  const handleCreatePdf = async () => {
    try {
      // Fonction pour déterminer التقدير
      const getMention = (average: number) => {
        if (average >= 18) return 'تميز';
        if (average >= 15) return 'تهنئة';
        if (average >= 14) return 'تشجيع';
        if (average >= 12) return 'لوحة الشرف';
        return 'بحاجة إلى تحسين';
      };
      
      // Utiliser la nouvelle approche HTML pour éviter les problèmes d'encodage
      const overallSubjects: any = stats?.stats?.overall?.subjects as any;
      const overallForKey = overallSubjects ? overallSubjects[moyenneKey] : undefined;
      const reportData = {
        cycle: currentCycle,
        level: selectedLevel === 'all' ? 'جميع المستويات' : selectedLevel,
        semester: semesterLabel,
        recordsCount: students.length,
        average: typeof overallForKey?.mean === 'number' ? overallForKey.mean : Number.parseFloat(overallForKey?.mean) || 0,
        successRate: typeof overallForKey?.pc_ge10 === 'number' ? overallForKey.pc_ge10 : Number.parseFloat(overallForKey?.pc_ge10) || 0,
        standardDeviation: typeof overallForKey?.std === 'number' ? overallForKey.std : Number.parseFloat(overallForKey?.std) || 0,
        totalStudents: students.length,
        maleStudents: students.filter(s => s.sexe === 'ذكر').length,
        femaleStudents: students.filter(s => s.sexe === 'أنثى').length,
        
        // التقديرات والمنح
        mentions: stats?.stats?.mentions ? [
          { name: 'تميز', count: stats.stats.mentions.excellence?.count || 0, percent: Number.parseFloat(stats.stats.mentions.excellence?.percent) || 0, threshold: '≥18' },
          { name: 'تهنئة', count: stats.stats.mentions.felicitations?.count || 0, percent: Number.parseFloat(stats.stats.mentions.felicitations?.percent) || 0, threshold: '15-17.99' },
          { name: 'تشجيع', count: stats.stats.mentions.encouragements?.count || 0, percent: Number.parseFloat(stats.stats.mentions.encouragements?.percent) || 0, threshold: '14-14.99' },
          { name: 'لوحة الشرف', count: stats.stats.mentions.tableau_honneur?.count || 0, percent: Number.parseFloat(stats.stats.mentions.tableau_honneur?.percent) || 0, threshold: '12-13.99' },
          { name: 'بحاجة إلى تحسين', count: stats.stats.mentions.observation?.count || 0, percent: Number.parseFloat(stats.stats.mentions.observation?.percent) || 0, threshold: '<12' }
        ] : null,
        
        // ترتيب الأقسام
        classRanking: stats?.stats?.by_class ? Object.entries(stats.stats.by_class as any)
          .sort((a: any, b: any) => ((b[1]?.means as any)?.[moyenneKey] || 0) - ((a[1]?.means as any)?.[moyenneKey] || 0))
          .map(([cls, data]: any, index) => ({
            name: `القسم ${cls}`,
            average: ((data?.means as any)?.[moyenneKey])?.toFixed(2) || '—',
            successRate: data?.pc_ge10?.toFixed(2) || '—',
            studentCount: data?.count || '—'
          })) : null,
        
        // أفضل الطلاب
        topStudents: students
          .sort((a, b) => ((b as any)[moyenneKey] || 0) - ((a as any)[moyenneKey] || 0))
          .slice(0, 10)
      .map((student) => ({
        name: (student as any).name || (student as any).nom || 'غير محدد',
            average: ((student as any)[moyenneKey])?.toFixed(2) || '0',
            mention: getMention(((student as any)[moyenneKey]) || 0)
          })),
        
        // تحليل المواد
        subjects: stats?.stats?.overall?.subjects ? [
          { name: 'اللغة العربية', average: Number.parseFloat(stats.stats.overall.subjects.arabe?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.arabe?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.arabe?.std) || 0, studentCount: stats.stats.overall.subjects.arabe?.present || 0 },
          { name: 'اللغة الفرنسية', average: Number.parseFloat(stats.stats.overall.subjects.francais?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.francais?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.francais?.std) || 0, studentCount: stats.stats.overall.subjects.francais?.present || 0 },
          { name: 'اللغة الإنجليزية', average: Number.parseFloat(stats.stats.overall.subjects.anglais?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.anglais?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.anglais?.std) || 0, studentCount: stats.stats.overall.subjects.anglais?.present || 0 },
          { name: 'الرياضيات', average: Number.parseFloat(stats.stats.overall.subjects.math?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.math?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.math?.std) || 0, studentCount: stats.stats.overall.subjects.math?.present || 0 },
          { name: 'العلوم الطبيعية', average: Number.parseFloat(stats.stats.overall.subjects.svt?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.svt?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.svt?.std) || 0, studentCount: stats.stats.overall.subjects.svt?.present || 0 },
          { name: 'العلوم الفيزيائية', average: Number.parseFloat(stats.stats.overall.subjects.physique?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.physique?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.physique?.std) || 0, studentCount: stats.stats.overall.subjects.physique?.present || 0 },
          { name: 'التربية الإسلامية', average: Number.parseFloat(stats.stats.overall.subjects.islamique?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.islamique?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.islamique?.std) || 0, studentCount: stats.stats.overall.subjects.islamique?.present || 0 },
          { name: 'التاريخ والجغرافيا', average: Number.parseFloat(stats.stats.overall.subjects.histGeo?.mean) || 0, successRate: Number.parseFloat(stats.stats.overall.subjects.histGeo?.pc_ge10) || 0, standardDeviation: Number.parseFloat(stats.stats.overall.subjects.histGeo?.std) || 0, studentCount: stats.stats.overall.subjects.histGeo?.present || 0 }
        ] : null
      };
      
      // Utiliser le rapport professionnel de 5 pages
      const pdf = await createProfessionalReport(reportData);
      
      // Sauvegarder le PDF
      const fileName = `تقرير_تحليل_النتائج_الشامل_5_صفحات_${selectedLevel}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      // Save a copy in Reports: تقرير تحليل النتائج
      try {
        const existingReports = (getStorage('reports') || []) as any[];
        const newReport = {
          id: Date.now().toString(),
          title: `تقرير تحليل النتائج - ${semesterLabel} - ${selectedLevel === 'all' ? 'جميع المستويات' : selectedLevel}`,
          date: new Date().toLocaleDateString('ar-SA'),
          type: 'تقرير تحليل النتائج',
          content: reportData
        };
        setStorage('reports', [...existingReports, newReport]);
      } catch (e) {
        console.error('Failed to store analysis report copy:', e);
      }
      
      return;
    } catch (error) {
      console.error('Erreur avec la méthode HTML, fallback vers jsPDF:', error);
    }
    
    // Fallback vers l'ancienne méthode si la nouvelle échoue
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    await ensureArabicFont(pdf);
    const pageWidth = Number(pdf.internal.pageSize.getWidth());
    const pageHeight = Number(pdf.internal.pageSize.getHeight());
    const margin = 20;
    let y = 20;

    // Fonction pour vérifier si on a besoin d'une nouvelle page
    const checkNewPage = (requiredSpace: number = 10) => {
      if (y + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Fonction pour ajouter une ligne de séparation
    const addSeparator = () => {
      pdf.setDrawColor(0, 0, 0); // Noir pour réduire la taille
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;
    };

    // Fonction pour ajouter un titre de section
    const addSectionTitle = (title: string, fontSize: number = 14) => {
      checkNewPage(15);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(0, 0, 0); // Noir pour réduire la taille
      addArabicText(pdf, title, margin, y, { fontStyle: 'bold' });
      y += 8;
      addSeparator();
    };

    // Fonction pour ajouter des informations avec label
    const addInfo = (label: string, value: string | number, isBold: boolean = false) => {
      checkNewPage(8);
      pdf.setFontSize(11);
      addArabicText(pdf, `${label}: ${value}`, margin, y, { fontStyle: isBold ? 'bold' : 'normal' });
      y += 6;
    };

    // En-tête principal simplifié (sans couleurs pour réduire la taille)
    pdf.setDrawColor(0, 0, 0); // Bordure noire simple
    try {
      pdf.rect(0, 0, pageWidth, 35);
    } catch (_) {
      pdf.rect(0, 0, pageWidth, 35);
    }
    
    pdf.setTextColor(0, 0, 0); // Texte noir
    pdf.setFontSize(20);
    addArabicText(pdf, 'تقرير تحليل النتائج الشامل', pageWidth / 2, 15, { align: 'center', fontStyle: 'bold' });
    
    pdf.setFontSize(12);
    addArabicText(pdf, `${currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}`, pageWidth / 2, 25, { align: 'center' });
    
    y = 45;

    // Informations générales
    addSectionTitle('المعلومات العامة', 16);
    addInfo('المستوى المحدد', selectedLevel === 'all' ? 'جميع المستويات' : selectedLevel);
    addInfo('الفصل الدراسي', semesterLabel);
    addInfo('عدد السجلات المستوردة', students.length);
    addInfo('تاريخ إنشاء التقرير', new Date().toLocaleDateString('ar-SA'));
    addInfo('نوع التحليل', 'تحليل شامل للنتائج والإحصائيات التربوية');
    // Statistiques générales
    addSectionTitle('الإحصائيات العامة');
    if ((stats?.stats?.overall?.subjects as any)?.[moyenneKey]?.mean != null) {
      addInfo('المعدل العام للفصل', ((stats.stats.overall.subjects as any)[moyenneKey].mean).toFixed(2), true);
    }
    if ((stats?.stats?.overall?.subjects as any)?.[moyenneKey]?.pc_ge10 != null) {
      addInfo('نسبة النجاح العامة (≥10)', `${(stats.stats.overall.subjects as any)[moyenneKey].pc_ge10}%`, true);
    }
    if ((stats?.stats?.overall?.subjects as any)?.[moyenneKey]?.std != null) {
      addInfo('الانحراف المعياري', ((stats.stats.overall.subjects as any)[moyenneKey].std).toFixed(2));
    }
    if (stats?.stats?.students?.sex?.total?.count != null) {
      addInfo(`إجمالي عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}`, stats.stats.students.sex.total.count);
    }
    if (stats?.stats?.students?.sex?.male?.count != null) {
      addInfo(`عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} الذكور`, stats.stats.students.sex.male.count);
    }
    if (stats?.stats?.students?.sex?.female?.count != null) {
      addInfo(`عدد ${currentCycle === 'ثانوي' ? 'الطالبات' : 'التلميذات'} الإناث`, stats.stats.students.sex.female.count);
    }

    // Mentions et التقديرات
    if (stats?.stats?.mentions) {
      addSectionTitle('التقديرات والمنح');
      const m = stats.stats.mentions;
      
      // Tableau des mentions
      checkNewPage(40);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      
      // En-têtes du tableau
      pdf.text('نوع التقدير', margin, y);
      pdf.text('العدد', margin + 60, y);
      pdf.text('النسبة', margin + 90, y);
      pdf.text('المعدل المطلوب', margin + 120, y);
      y += 8;
      
      // Ligne de séparation
      pdf.setDrawColor(0, 0, 0); // Noir pour réduire la taille
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;
      
      // Données du tableau
      pdf.setFont('helvetica', 'normal');
      const mentionsData = [
        { name: 'تميز', count: m.excellence?.count ?? 0, percent: m.excellence?.percent ?? 0, threshold: '≥18' },
        { name: 'تهنئة', count: m.felicitations?.count ?? 0, percent: m.felicitations?.percent ?? 0, threshold: '15-17.99' },
        { name: 'تشجيع', count: m.encouragements?.count ?? 0, percent: m.encouragements?.percent ?? 0, threshold: '14-14.99' },
        { name: 'لوحة الشرف', count: m.tableau_honneur?.count ?? 0, percent: m.tableau_honneur?.percent ?? 0, threshold: '12-13.99' },
        { name: 'بحاجة إلى تحسين', count: m.observation?.count ?? 0, percent: m.observation?.percent ?? 0, threshold: '<12' }
      ];
      
      mentionsData.forEach(mention => {
        checkNewPage(8);
        pdf.text(mention.name, margin, y);
        pdf.text(mention.count.toString(), margin + 60, y);
        pdf.text(`${mention.percent}%`, margin + 90, y);
        pdf.text(mention.threshold, margin + 120, y);
        y += 6;
      });
    }

    // Class ranking
    if (stats?.stats?.by_class) {
      addSectionTitle('ترتيب الأقسام');
      const entries = Object.entries(stats.stats.by_class as any).sort((a: any, b: any) => (b[1]?.means?.moyenneSem1 || 0) - (a[1]?.means?.moyenneSem1 || 0));
      
      // Tableau du classement
      checkNewPage(30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      
      // En-têtes du tableau
      pdf.text('الترتيب', margin, y);
      pdf.text('اسم القسم', margin + 25, y);
      pdf.text('المعدل', margin + 70, y);
      pdf.text('نسبة النجاح', margin + 100, y);
      pdf.text(`عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}`, margin + 130, y);
      y += 8;
      
      // Ligne de séparation
      pdf.setDrawColor(0, 0, 0); // Noir pour réduire la taille
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;
      
      // Données du tableau
      pdf.setFont('helvetica', 'normal');
      entries.forEach(([cls, data]: any, idx) => {
        checkNewPage(8);
        pdf.text((idx + 1).toString(), margin, y);
        pdf.text(`القسم ${cls}`, margin + 25, y);
        pdf.text((data?.means?.moyenneSem1 ?? '—').toString(), margin + 70, y);
        pdf.text(`${data?.pc_ge10 ?? '—'}%`, margin + 100, y);
        pdf.text((data?.count ?? '—').toString(), margin + 130, y);
        y += 6;
      });
    }

    // Subject detail pages (tranches + groupes)
    if (stats?.stats?.overall?.subjects) {
      const subjectsOrder: { key: string; label: string }[] = [
        { key: 'arabe', label: 'اللغة العربية' },
        { key: 'francais', label: 'اللغة الفرنسية' },
        { key: 'anglais', label: 'اللغة الإنجليزية' },
        { key: 'math', label: 'الرياضيات' },
        { key: 'svt', label: 'العلوم الطبيعية و الحياة' },
        { key: 'physique', label: 'العلوم الفيزيائية و التكنولوجيا' },
        { key: 'informatique', label: 'المعلوماتية' },
        { key: 'islamique', label: 'التربية الإسلامية' },
        { key: 'civique', label: 'التربية المدنية' },
        { key: 'histGeo', label: 'التاريخ و الجغرافيا' },
        { key: 'arts', label: 'التربية التشكيلية' },
        { key: 'musique', label: 'التربية الموسيقية' },
        { key: 'sport', label: 'التربية البدنية و الرياضية' },
        { key: 'moyenneSem1', label: 'معدل الفصل' }
      ];
      
      subjectsOrder.forEach(({ key, label }) => {
        const s: any = (stats as any)?.stats?.overall?.subjects?.[key];
        if (!s) return;
        
        pdf.addPage();
        let yy = 20;
        
        // En-tête de la matière (sans couleurs pour réduire la taille)
        pdf.setDrawColor(0, 0, 0); // Bordure noire simple
        pdf.rect(0, 0, pageWidth, 25);
        
        pdf.setTextColor(0, 0, 0); // Texte noir
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(`تحليل المادة: ${label}`, pageWidth / 2, 15, { align: 'center' });
        
        yy = 35;
        
        // Statistiques de base de la matière
        addInfo(`عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} الحاضرين`, s.present || 0);
        addInfo('المعدل العام', s.mean ? s.mean.toFixed(2) : '—');
        addInfo('الانحراف المعياري', s.std ? s.std.toFixed(2) : '—');
        addInfo('نسبة النجاح (≥10)', s.pc_ge10 ? `${s.pc_ge10}%` : '—');
        
        yy += 10;
        
        // Tranches bars
        if (s.tranches && Object.keys(s.tranches).length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text('توزيع الشرائح', margin, yy);
          yy += 8;
          
          const trEntries = Object.entries(s.tranches || {});
          const barLeft = margin; 
          const barMaxW = pageWidth - 2 * margin; 
          const barH = 6;
          
          trEntries.forEach(([name, v]: any) => {
            checkNewPage(15);
            const w = Math.max(1, Math.min(barMaxW, (barMaxW * (v.percent || 0)) / 100));
            
            // Barre de fond (sans couleurs pour réduire la taille)
            pdf.setDrawColor(0, 0, 0);
            pdf.rect(barLeft, yy, barMaxW, barH);
            
            // Barre de données (noir simple)
            pdf.setFillColor(0, 0, 0);
            pdf.rect(barLeft, yy, w, barH, 'F');
            
            // Texte
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`${name}: ${v.count} طالب (${v.percent}%)`, barLeft, yy - 2);
            yy += barH + 8;
          });
        }
        
        // Groupes bars
        if (s.groupes && Object.keys(s.groupes).length > 0) {
          yy += 5;
          pdf.setTextColor(0);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text('المجموعات النوعية', margin, yy);
          yy += 8;
          
          const grEntries = Object.entries(s.groupes || {});
          const barLeft = margin; 
          const barMaxW = pageWidth - 2 * margin; 
          const barH = 6;
          
          grEntries.forEach(([name, v]: any) => {
            checkNewPage(15);
            const w = Math.max(1, Math.min(barMaxW, (barMaxW * (v.percent || 0)) / 100));
            
            // Barre de fond (sans couleurs pour réduire la taille)
            pdf.setDrawColor(0, 0, 0);
            pdf.rect(barLeft, yy, barMaxW, barH);
            
            // Barre de données (noir simple)
            pdf.setFillColor(0, 0, 0);
            pdf.rect(barLeft, yy, w, barH, 'F');
            
            // Texte
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`${name}: ${v.count} طالب (${v.percent}%)`, barLeft, yy - 2);
            yy += barH + 8;
          });
        }
        
        pdf.setTextColor(0);
      });
    }

    // Page de conclusion
    pdf.addPage();
    y = 20;
    
    // En-tête de conclusion (sans couleurs pour réduire la taille)
    pdf.setDrawColor(0, 0, 0); // Bordure noire simple
    try {
      pdf.rect(0, 0, pageWidth, 25);
    } catch (_) {
      pdf.rect(0, 0, pageWidth, 25);
    }
    
    pdf.setTextColor(0, 0, 0); // Texte noir
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('الخلاصة والتوصيات', pageWidth / 2, 15, { align: 'center' });
    
    y = 35;
    
    // Résumé des points clés
    addSectionTitle('النقاط الرئيسية');
      addInfo(`إجمالي عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} المحللين`, students.length);
    if (stats?.stats?.overall?.subjects?.moyenneSem1?.mean != null) {
      addInfo('المعدل العام للفصل', stats.stats.overall.subjects.moyenneSem1.mean.toFixed(2));
    }
    if (stats?.stats?.overall?.subjects?.moyenneSem1?.pc_ge10 != null) {
      addInfo('نسبة النجاح العامة', `${stats.stats.overall.subjects.moyenneSem1.pc_ge10}%`);
    }
    
    // Recommandations générales
    addSectionTitle('التوصيات العامة');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    
    const recommendations = [
      '• مراجعة المناهج والطرق التعليمية للمواد ذات المعدلات المنخفضة',
      '• تنظيم حصص دعم إضافية للطلاب الذين يحتاجون إلى تحسين',
      '• تشجيع الطلاب المتميزين والمحافظة على مستواهم',
      '• متابعة دورية لنتائج الطلاب وتقديم الدعم اللازم',
      '• تحسين البيئة التعليمية وتوفير الموارد اللازمة'
    ];
    
    recommendations.forEach(rec => {
      checkNewPage(8);
      pdf.text(rec, margin, y);
      y += 6;
    });
    
    // Pied de page final
    const footerY = pageHeight - 20;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Noir pour réduire la taille
    pdf.text(`تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-SA')}`, pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`تقرير تحليل النتائج - ${currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}`, pageWidth / 2, footerY + 8, { align: 'center' });
    
    // Génération et téléchargement du PDF
    const fileName = `تقرير_تحليل_النتائج_${currentCycle === 'ثانوي' ? 'ثانوي' : 'متوسط'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    // Save a copy in Reports: تقرير تحليل النتائج (fallback)
    try {
      const existingReports = (getStorage('reports') || []) as any[];
      const newReport = {
        id: Date.now().toString(),
        title: `تقرير تحليل النتائج - ${semesterLabel} - ${selectedLevel === 'all' ? 'جميع المستويات' : selectedLevel}`,
        date: new Date().toLocaleDateString('ar-SA'),
        type: 'تقرير تحليل النتائج',
        content: {
          cycle: currentCycle,
          level: selectedLevel === 'all' ? 'جميع المستويات' : selectedLevel,
          semester: semesterLabel
        }
      };
      setStorage('reports', [...existingReports, newReport]);
    } catch (e) {
      console.error('Failed to store analysis report copy (fallback):', e);
    }
  };

  // Auto-sync to Reports: keep a template report for Analysis per cycle/semester/level
  useEffect(() => {
    try {
      // Build minimal normalized payload whenever stats or selection changes
      if (!stats) return;
      const levelNormalized = selectedLevel === 'all' ? 'جميع المستويات' : selectedLevel;
      const reportId = `analysis_${currentCycle}_${semesterIndex}_${levelNormalized}`;

      const overallSubjects: any = stats?.stats?.overall?.subjects as any;
      const overallForKey = overallSubjects ? overallSubjects[moyenneKey] : undefined;
      const normalized = {
        id: reportId,
        title: `تقرير تحليل النتائج - ${semesterLabel} - ${levelNormalized}`,
        date: new Date().toLocaleDateString('ar-SA'),
        type: 'تقرير تحليل النتائج',
        content: {
          cycle: currentCycle,
          level: levelNormalized,
          semester: semesterLabel,
          average: typeof overallForKey?.mean === 'number' ? overallForKey.mean : Number.parseFloat(overallForKey?.mean) || 0,
          successRate: typeof overallForKey?.pc_ge10 === 'number' ? overallForKey.pc_ge10 : Number.parseFloat(overallForKey?.pc_ge10) || 0,
          standardDeviation: typeof overallForKey?.std === 'number' ? overallForKey.std : Number.parseFloat(overallForKey?.std) || 0
        }
      };

      const existing = (getStorage('reports') || []) as any[];
      const idx = existing.findIndex(r => r.id === reportId);
      if (idx >= 0) {
        const updated = existing.slice();
        updated[idx] = { ...existing[idx], ...normalized };
        setStorage('reports', updated);
      } else {
        setStorage('reports', [...existing, normalized]);
      }
    } catch (e) {
      console.error('Failed to auto-sync analysis report:', e);
    }
  }, [stats, selectedLevel, semesterIndex, currentCycle, moyenneKey, semesterLabel, getStorage, setStorage]);

  const handleExportStatsJson = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const buildTextReport = () => {
    if (!stats?.stats) { setTextReport(''); return; }
    const s: any = stats.stats;
    const eff = s.students?.sex?.total?.count ?? '-';
    const mean = s.overall?.subjects?.moyenneSem1?.mean ?? '-';
    const success = s.overall?.subjects?.moyenneSem1?.pc_ge10 != null ? `${s.overall.subjects.moyenneSem1.pc_ge10}%` : '-';
    const s1 = s.overall?.subjects?.moyenneSem1?.mean;
    const s2 = s.overall?.subjects?.moyenneSem2?.mean;
    const s3 = s.overall?.subjects?.moyenneSem3?.mean;
    const trendLine = (() => {
      const pts = [s1, s2, s3].filter(v => typeof v === 'number') as number[];
      if (pts.length < 2) return 'التطور السنوي: لا تتوفر بيانات كافية للمقارنة.';
      const deltas: string[] = [];
      if (typeof s1 === 'number' && typeof s2 === 'number') {
        const d = Math.round((s2 - s1) * 10) / 10;
        deltas.push(`من الفصل الأول إلى الثاني: ${d > 0 ? `تحسن بـ +${d.toFixed(1)}` : d < 0 ? `تراجع بـ ${Math.abs(d).toFixed(1)}` : 'استقرار'}`);
      }
      if (typeof s2 === 'number' && typeof s3 === 'number') {
        const d = Math.round((s3 - s2) * 10) / 10;
        deltas.push(`من الفصل الثاني إلى الثالث: ${d > 0 ? `تحسن بـ +${d.toFixed(1)}` : d < 0 ? `تراجع بـ ${Math.abs(d).toFixed(1)}` : 'استقرار'}`);
      }
      return `التطور السنوي: ${deltas.join(' — ')}`;
    })();
    const bestClass = (() => {
      const entries = Object.entries(s.by_class || {});
      if (!entries.length) return '-';
      const sorted = entries.sort((a: any, b: any) => (b[1]?.means?.moyenneSem1 || 0) - (a[1]?.means?.moyenneSem1 || 0));
      const [cls, data]: any = sorted[0];
      return `${cls} (معدل ${data?.means?.moyenneSem1 ?? '-'})`;
    })();
    const mentions = s.mentions || {};
    const lines = [
      `ملخص الأداء الدراسي — عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}: ${eff}`,
      `المعدل العام: ${typeof mean === 'number' ? mean.toFixed(1) : mean} — نسبة النجاح (≥10): ${success}`,
      trendLine,
      `أفضل قسم: ${bestClass}`,
      `المنح: تميز ${mentions.excellence?.count ?? '—'} (${mentions.excellence?.percent ?? '—'}%), تهنئة ${mentions.felicitations?.count ?? '—'} (${mentions.felicitations?.percent ?? '—'}%), تشجيع ${mentions.encouragements?.count ?? '—'} (${mentions.encouragements?.percent ?? '—'}%), لوحة الشرف ${mentions.tableau_honneur?.count ?? '—'} (${mentions.tableau_honneur?.percent ?? '—'}%), ملاحظة ${mentions.observation?.count ?? '—'} (${mentions.observation?.percent ?? '—'}%)`
    ];
    setTextReport(lines.join('\n'));
  };

  const subjectLabelToKey: Record<string, string> = {
    'اللغة العربية': 'arabe',
    'اللغة الفرنسية': 'francais',
    'اللغة الإنجليزية': 'anglais',
    'الرياضيات': 'math',
    'العلوم الطبيعية و الحياة': 'svt',
    'العلوم الفيزيائية و التكنولوجيا': 'physique',
    'المعلوماتية': 'informatique',
    'التربية الإسلامية': 'islamique',
    'التربية المدنية': 'civique',
    'التاريخ و الجغرافيا': 'histGeo',
    'التربية التشكيلية': 'arts',
    'التربية الموسيقية': 'musique',
    'التربية البدنية و الرياضية': 'sport',
    'معدل الفصل 1': 'moyenneSem1',
    'معدل الفصل 2': 'moyenneSem2',
    'معدل الفصل 3': 'moyenneSem3'
  };

  const keyToSubjectLabel: Record<string, string> = Object.fromEntries(
    Object.entries(subjectLabelToKey).map(([label, key]) => [key, label])
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
          تحليل النتائج - {currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}
        </h1>
            <p className="text-blue-100">تحليل شامل لأداء {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} والإحصائيات التربوية</p>
            
            {/* Indicateur d'indépendance des cycles */}
            <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-semibold">بيانات مستقلة لكل مرحلة</span>
                <span className="text-blue-200">•</span>
                <span>المرحلة الحالية: {currentCycle === 'ثانوي' ? 'الثانوي' : 'المتوسط'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <button 
              onClick={handleUploadClick} 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              رفع ملف Excel
            </button>
          <button
            onClick={handleClearAnalysis}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center gap-2 font-semibold shadow transition-all duration-200"
            title="تفريغ بيانات التحليل لهذا الفصل"
          >
            تفريغ
          </button>
          
          {/* Bouton de gestion spécifique au cycle */}
          <button
            onClick={async () => {
              const confirmMessage = `هل تريد تفريغ جميع بيانات التحليل للمرحلة ${currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة'}؟\n\nسيتم حذف:\n• جميع بيانات الفصول\n• جميع الإحصائيات\n• جميع التقارير\n\nهذا الإجراء لا يمكن التراجع عنه.`;
              if (window.confirm(confirmMessage)) {
                try {
                  const db = getAnalysisDB(currentCycle);
                  await db.clear();
                  
                  // Nettoyer aussi les caches localStorage
                  for (const sem of [1, 2, 3]) {
                    localStorage.removeItem(`analysis_cache_${currentCycle}_sem${sem}`);
                  }
                  
                  setStudents([]);
                  setStats(null);
                  setHasAllLevels(false);
                  
                  alert(`تم تفريغ جميع بيانات المرحلة ${currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة'} بنجاح`);
                } catch (error) {
                  alert('حدث خطأ أثناء التفريغ');
                  console.error('Erreur lors du nettoyage:', error);
                }
              }
            }}
            className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 flex items-center gap-2 font-semibold shadow transition-all duration-200"
            title={`تفريغ جميع بيانات المرحلة ${currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            تفريغ المرحلة
          </button>
            <BarChart3 className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Information sur l'indépendance des cycles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">استقلالية البيانات بين المراحل</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>بيانات منفصلة:</strong> كل مرحلة تعليمية (متوسط/ثانوي) لها قاعدة بيانات مستقلة</p>
              <p>• <strong>تحليل مستقل:</strong> الإحصائيات والنتائج محفوظة بشكل منفصل لكل مرحلة</p>
              <p>• <strong>عدم التداخل:</strong> تغيير المرحلة لا يؤثر على بيانات المرحلة الأخرى</p>
              <p>• <strong>المرحلة الحالية:</strong> {currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 mb-6 flex flex-wrap gap-2" dir="rtl">
        <Link to="/analysis" className={`px-3 py-1.5 rounded ${isActive('/analysis') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الأول</Link>
        <Link to="/analysis/sem2" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem2') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثاني</Link>
        <Link to="/analysis/sem3" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem3') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثالث</Link>
        <Link to="/analysis/compare" className={`px-3 py-1.5 rounded ${isActive('/analysis/compare') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>التحليل السنوي</Link>
        <Link to="/analysis/bem" className={`px-3 py-1.5 rounded ${isActive('/analysis/bem') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>تحليل  ش.ت.م</Link>
      </div>

      {/* ملخص علوي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">العدد الإجمالي</div>
            <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {currentCycle === 'ثانوي' ? 'ثانوي' : 'متوسط'}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats?.stats ? (stats.stats.students?.sex?.total?.count ?? students.length) : students.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">نسبة النجاح العامة (≥ 10)</div>
            <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {currentCycle === 'ثانوي' ? 'ثانوي' : 'متوسط'}
            </div>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {stats?.stats?.overall?.subjects?.moyenneSem1?.pc_ge10 != null ? `${stats.stats.overall.subjects.moyenneSem1.pc_ge10}%` : '—'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">المعدل العام</div>
            <div className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
              {currentCycle === 'ثانوي' ? 'ثانوي' : 'متوسط'}
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {stats?.stats?.overall?.subjects?.moyenneSem1?.mean != null ? stats.stats.overall.subjects.moyenneSem1.mean : '—'}
          </div>
        </div>
      </div>

      {/* فحوصات التوافق - البيانات متوافقة */}
      {(() => {
        if (!stats?.stats?.overall?.subjects?.moyenneSem1) return null;
        const subj: any = stats.stats.overall.subjects.moyenneSem1;
        const present = Number(subj.present ?? NaN);
        const tr = subj.tranches || {};
        const gr = subj.groupes || {};
        const trCounts = Object.values(tr).map((v: any) => Number(v?.count ?? 0));
        const trPercs = Object.values(tr).map((v: any) => Number(v?.percent ?? 0));
        const grCounts = Object.values(gr).map((v: any) => Number(v?.count ?? 0));
        const grPercs = Object.values(gr).map((v: any) => Number(v?.percent ?? 0));
        const sum = (arr: number[]) => arr.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
        const approxEq = (a: number, b: number, tol = 1e-2) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
        const issues: string[] = [];
        const trCountSum = sum(trCounts);
        const trPercentSum = sum(trPercs);
        const grCountSum = sum(grCounts);
        const grPercentSum = sum(grPercs);
        if (Number.isFinite(present)) {
          if (!approxEq(trCountSum, present, 1)) issues.push(`مجموع عدد الشرائح (${trCountSum}) لا يساوي الحضور (${present}).`);
          if (!approxEq(grCountSum, present, 1)) issues.push(`مجموع عدد المجموعات (${grCountSum}) لا يساوي الحضور (${present}).`);
        }
        if (!approxEq(trPercentSum, 100, 0.6)) issues.push(`مجموع نسب الشرائح = ${trPercentSum.toFixed(2)}% (يفترض ≈ 100%).`);
        if (!approxEq(grPercentSum, 100, 0.6)) issues.push(`مجموع نسب المجموعات = ${grPercentSum.toFixed(2)}% (يفترض ≈ 100%).`);

        return (
          <div className={`rounded-lg border p-4 ${issues.length ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`font-semibold mb-1 ${issues.length ? 'text-red-700' : 'text-green-700'}`}>{issues.length ? 'تنبيهات التوافق' : 'البيانات متوافقة'}</div>
            {issues.length ? (
              <ul className="list-disc pr-5 text-sm text-red-700">
                {issues.map((msg, idx) => (<li key={idx}>{msg}</li>))}
              </ul>
            ) : (
              <div className="text-sm text-green-700">لا توجد مشاكل واضحة في المجاميع والنسب.</div>
            )}
          </div>
        );
      })()}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          فلاتر التحليل
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفصل الدراسي</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {semesterLabel}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المستوى الدراسي</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              تحديث التحليل
            </button>
          </div>
        </div>
      </div>

      {/* Tableau تحليل التوجيه التدريجي */}
      {actualStudents.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-orange-800 mb-4">جدول تحليل التوجيه التدريجي</h3>
          
          {/* Résumé des orientations */}
          {(() => {
            const orientations = students
              .filter((s: any) => Number.isFinite(Number(s?.moyenne)))
              .map((s: any) => detectOrientation(s));
            
            const orientationCounts = orientations.reduce((acc: any, orientation: string) => {
              acc[orientation] = (acc[orientation] || 0) + 1;
              return acc;
            }, {});
            
            const total = orientations.length;
            
            return (
              <div className="mb-6 p-4 bg-white rounded-lg border border-orange-200">
                <h4 className="text-lg font-bold text-orange-700 mb-3">توزيع التوجيهات المقترحة</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isHighSchool ? (
                    // High school cycle orientations
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{orientationCounts['جامعي'] || 0}</div>
                        <div className="text-sm text-gray-600">جامعي</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['جامعي'] || 0) / total) * 100) : 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{orientationCounts['تقني سامي'] || 0}</div>
                        <div className="text-sm text-gray-600">تقني سامي</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['تقني سامي'] || 0) / total) * 100) : 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{orientationCounts['مهني'] || 0}</div>
                        <div className="text-sm text-gray-600">مهني</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['مهني'] || 0) / total) * 100) : 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-500">{orientationCounts['غير محدد'] || 0}</div>
                        <div className="text-sm text-gray-600">غير محدد</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['غير محدد'] || 0) / total) * 100) : 0}%</div>
                      </div>
                    </>
                  ) : (
                    // College cycle orientations
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{orientationCounts['ثانوي علمي'] || 0}</div>
                        <div className="text-sm text-gray-600">ثانوي علمي</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['ثانوي علمي'] || 0) / total) * 100) : 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{orientationCounts['ثانوي تقني'] || 0}</div>
                        <div className="text-sm text-gray-600">ثانوي تقني</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['ثانوي تقني'] || 0) / total) * 100) : 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{orientationCounts['ثانوي مهني'] || 0}</div>
                        <div className="text-sm text-gray-600">ثانوي مهني</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['ثانوي مهني'] || 0) / total) * 100) : 0}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-500">{orientationCounts['غير محدد'] || 0}</div>
                        <div className="text-sm text-gray-600">غير محدد</div>
                        <div className="text-xs text-gray-500">{total > 0 ? Math.round(((orientationCounts['غير محدد'] || 0) / total) * 100) : 0}%</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mb-6">
              {/* Page info */}
              <div className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages} ({actualStudents.length} طالب)
              </div>
              
              {/* Pagination buttons */}
              <div className="flex justify-center items-center gap-2">
            <button 
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-500 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              الأول
            </button>
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-500 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              السابق
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else {
                // Smart pagination for more than 7 pages
                if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                currentPage === totalPages 
                  ? 'bg-gray-500 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              التالي
            </button>
            <button 
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm rounded transition-colors ${
                currentPage === totalPages 
                  ? 'bg-gray-500 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              الأخير
            </button>
            </div>
          </div>
          )}
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-center">الترتيب</th>
                  <th className="border border-gray-300 p-2 text-center">اللقب و الاسم</th>
                  <th className="border border-gray-300 p-2 text-center">الجنس</th>
                  <th className="border border-gray-300 p-2 text-center">الاعادة</th>
                  <th className="border border-gray-300 p-2 text-center">معدل الفصل</th>
                  <th className="border border-gray-300 p-2 text-center">الدرجة</th>
                  <th className="border border-gray-300 p-2 text-center">التقدير</th>
                  <th className="border border-gray-300 p-2 text-center">التوجيه المقترح (تقدير مؤقت)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Get the actual students data sorted by moyenne
                  const sortedStudents = students
                    .filter((s: any) => Number.isFinite(Number(s?.moyenne)))
                    .map((s: any) => {
                      // Debug: Log student data to understand structure
                      console.log('Student data:', {
                        nom: s?.nom,
                        isRepeating: s?.isRepeating,
                        repeater: s?.repeater,
                        redoublement: s?.redoublement,
                        allKeys: Object.keys(s || {})
                      });
                      
                      return { 
                        name: String(s?.nom || '').trim(), 
                        moyenne: Number(s[moyenneKey] || s.moyenne || 0),
                        numero: s.numero || 0,
                        gender: s.gender || s.sexe || 'غير محدد',
                        isRepeating: s.isRepeating || s.repeater || s.redoublement || false
                      };
                    })
                    .sort((a, b) => b.moyenne - a.moyenne);
                  
                  // Apply pagination to sorted students
                  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);
                  
                  return paginatedStudents.map((student, idx) => {
                    const globalIndex = startIndex + idx;
                    const rank = globalIndex + 1;
                    const avg = student.moyenne;
                    const degree = Math.max(10, Math.min(100, 100 - (rank - 1) * 2));
                    const appr = (() => {
                      const v = avg;
                      if (v >= 18) return 'Excellent';
                      if (v >= 16) return 'Très bien';
                      if (v >= 14) return 'Bien';
                      if (v >= 10) return 'Assez bien';
                      return 'Insuffisant';
                    })();
                    const prevAvg = globalIndex > 0 ? sortedStudents[globalIndex - 1]?.moyenne : undefined;
                    const dropAmountRaw = typeof prevAvg === 'number' ? (prevAvg - avg) : 0;
                    const dropAmount = Math.round(dropAmountRaw * 10) / 10;
                    const isDrop = dropAmount >= 1;
                    
                    return (
                      <tr 
                        key={`${student.name}-${rank}`}
                        onClick={() => handleStudentClick(student)}
                        className="cursor-pointer transition-colors hover:bg-orange-100"
                        title="انقر لعرض تحليل المعدل العام للمادة"
                      >
                        <td className="border border-gray-300 p-2 text-center">
                          {rank}
                        </td>
                        <td className="border border-gray-300 p-2 text-center font-medium">
                          {student.name || '—'}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {(() => {
                            const genderValue = student.gender;
                            if (genderValue === 'male' || genderValue === 'ذكر') {
                              return 'ذكر';
                            } else if (genderValue === 'female' || genderValue === 'أنثى') {
                              return 'أنثى';
                            } else {
                              return genderValue || 'غير محدد';
                            }
                          })()}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {(() => {
                            const isRepeating = student.isRepeating;
                            // Handle various possible values for redoublement
                            if (isRepeating === true || isRepeating === 'true' || isRepeating === 'نعم' || isRepeating === 'oui' || isRepeating === 'yes') {
                              return <span className="text-red-600 font-medium">نعم</span>;
                            } else if (isRepeating === false || isRepeating === 'false' || isRepeating === 'لا' || isRepeating === 'non' || isRepeating === 'no') {
                              return <span className="text-green-600 font-medium">لا</span>;
                            } else {
                              return <span className="text-gray-500">غير محدد</span>;
                            }
                          })()}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span>{avg.toFixed(2)}</span>
                            {(() => {
                              const color = (appr === 'Excellent' || appr === 'Très bien' || appr === 'Bien')
                                ? 'bg-green-500'
                                : (appr === 'Assez bien')
                                  ? 'bg-yellow-400'
                                  : 'bg-red-500';
                              const base = mapAppreciationToArabic(appr);
                              const title = isDrop ? `${base} — انخفاض بـ ${dropAmount.toFixed(1)}` : base;
                              return (
                                <span className="relative inline-flex" title={title}>
                                  <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${color} opacity-75`}></span>
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}></span>
                                </span>
                              );
                            })()}
                          </div>
                          {isDrop && (
                            <div className="mt-1 text-[10px] text-gray-500">
                              انخفاض بـ {dropAmount.toFixed(1)}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{degree}</td>
                        <td className="border border-gray-300 p-2 text-center">{mapAppreciationToArabic(appr)}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          {(() => {
                            // Debug simple et visible
    const studentName = (student as any).name || (student as any).nom || 'غير محدد';
                            console.log('Student data for orientation:', studentName, student);
                            
                            const orientation = detectOrientation(student);
                            console.log('Detected orientation:', orientation);
                            
                            const colorClass = orientation === 'علوم و تكنولوجيا' 
                              ? 'text-blue-600 font-bold' 
                              : orientation === 'أداب' 
                              ? 'text-green-600 font-bold' 
                              : orientation === 'إعادة السنة' 
                              ? 'text-red-600 font-bold' 
                              : 'text-gray-700';

                            return (
                              <span className={colorClass}>
                                {orientation}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* تحليل التوجيه التدريجي */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-orange-800 mb-4">تحليل التوجيه التدريجي</h3>
        
        {/* Filter Section */}
        {guidanceStudents.length > 0 ? (
          <div className="mb-6 p-4 bg-white border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm font-medium text-gray-700">عرض الطلاب حسب:</span>
                <button
                  onClick={() => {
                    console.log('Recalculating guidance indicators...');
                    // Force re-render by updating a state
                    setStudents([...students]);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="إعادة حساب المؤشرات"
                >
                  🔄 إعادة حساب
                </button>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleGuidanceFilter('all')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      selectedGuidance === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    جميع الطلاب ({guidanceStudents.length})
                  </button>
                  <button
                    onClick={() => handleGuidanceFilter('ميل نحو العلوم')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      selectedGuidance === 'ميل نحو العلوم'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ميالون للعلوم ({indicators.scienceCount})
                  </button>
                  <button
                    onClick={() => handleGuidanceFilter('ميل نحو الآداب')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      selectedGuidance === 'ميل نحو الآداب'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ميالون للآداب ({indicators.artsCount})
                  </button>
                  <button
                    onClick={() => handleGuidanceFilter('متوازن')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      selectedGuidance === 'متوازن'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    متوازنون ({indicators.balancedCount})
                  </button>
                  <button
                    onClick={() => handleGuidanceFilter('غير محدد')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      selectedGuidance === 'غير محدد'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    غير محدد ({indicators.undefinedCount})
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {actualStudents.length} طالب من أصل {actualStudents.length}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="text-yellow-600">⚠️</div>
              <span className="text-sm text-yellow-800">
                يرجى استيراد ملف Excel يحتوي على بيانات التلاميذ لرؤية تحليل التوجيه التدريجي
              </span>
            </div>
          </div>
        )}
        
        {/* Summary Section */}
        {guidanceStudents.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">ملخص سريع</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-blue-600">
                  {indicators.excellentCount}
                </div>
                <div className="text-sm text-gray-600">طلاب متفوقون</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-green-600">
                  {indicators.scienceCount}
                </div>
                <div className="text-sm text-gray-600">ميالون للعلوم</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-purple-600">
                  {indicators.artsCount}
                </div>
                <div className="text-sm text-gray-600">ميالون للآداب</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-orange-600">
                  {indicators.balancedCount}
                </div>
                <div className="text-sm text-gray-600">متوازنون</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-gray-600">
                  {indicators.undefinedCount}
                </div>
                <div className="text-sm text-gray-600">غير محدد</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-700">
              💡 <strong>نصيحة:</strong> الطلاب المتفوقون يمكنهم اختيار أي تخصص، بينما يحتاج الآخرون للتوجيه حسب ميولهم
            </div>
            <div className="mt-2 text-xs text-gray-600">
              إجمالي الطلاب: {indicators.total} | تم تحليل: {indicators.scienceCount + indicators.artsCount + indicators.balancedCount + indicators.undefinedCount}
            </div>
          </div>
        )}

      </div>

      {/* تحليل حسب الإعادة */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-amber-800 mb-4">تحليل حسب الإعادة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-amber-200 rounded p-4">
            <h4 className="font-bold text-amber-700 mb-2">غير المعيدين</h4>
            <div className="space-y-1 text-sm">
              <div>العدد: {stats?.stats ? (stats.stats.students?.repeat?.no_repeat?.count ?? '-') : '-'}</div>
              <div>
                المعدل: {stats?.stats ? (stats.stats.no_repeat?.subjects?.moyenneSem1?.mean ?? '-') : '-'}
              </div>
              <div>
                نسبة النجاح: {stats?.stats ? ((stats.stats.no_repeat?.subjects?.moyenneSem1?.pc_ge10 != null ? stats.stats.no_repeat.subjects.moyenneSem1.pc_ge10 + '%' : '-')) : '-'}
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-amber-200 rounded p-4">
            <h4 className="font-bold text-amber-700 mb-2">المعيدون</h4>
            <div className="space-y-1 text-sm">
              <div>العدد: {stats?.stats ? (stats.stats.students?.repeat?.repeat?.count ?? '-') : '-'}</div>
              <div>
                المعدل: {stats?.stats ? (stats.stats.repeat?.subjects?.moyenneSem1?.mean ?? '-') : '-'}
              </div>
              <div>
                نسبة النجاح: {stats?.stats ? ((stats.stats.repeat?.subjects?.moyenneSem1?.pc_ge10 != null ? stats.stats.repeat.subjects.moyenneSem1.pc_ge10 + '%' : '-')) : '-'}
              </div>
            </div>
          </div>
        </div>
        
        {stats?.stats && (
          <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded">
            <p className="text-sm text-amber-900">
              {(() => {
                const mNo = Number(stats.stats.no_repeat?.subjects?.moyenneSem1?.mean ?? NaN);
                const mRe = Number(stats.stats.repeat?.subjects?.moyenneSem1?.mean ?? NaN);
                if (!Number.isFinite(mNo) || !Number.isFinite(mRe)) return '—';
                const diff = Math.round((mNo - mRe) * 10) / 10;
                const pNo = Number(stats.stats.no_repeat?.subjects?.moyenneSem1?.pc_ge10 ?? NaN);
                const pRe = Number(stats.stats.repeat?.subjects?.moyenneSem1?.pc_ge10 ?? NaN);
                const pd = (Number.isFinite(pNo) && Number.isFinite(pRe)) ? Math.round((pNo - pRe) * 10) / 10 : null;
                return `غير المعيدين أعلى بمقدار ${diff} نقطة${pd != null ? ` ونسبة نجاح أعلى بـ ${pd} نقطة مئوية` : ''}`;
              })()}
            </p>
          </div>
        )}
      </div>




      {/* مستويات التعليم */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-800 mb-4">
          {currentCycle === 'ثانوي' ? 'مستويات الثانوي' : 'مستويات المتوسط'}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentCycle === 'ثانوي' ? (
            <>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">س1ث</div>
                <div className="text-sm text-gray-600">السنة الأولى ثانوي</div>
              </div>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">س2ث</div>
                <div className="text-sm text-gray-600">السنة الثانية ثانوي</div>
              </div>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">س3ث</div>
                <div className="text-sm text-gray-600">السنة الثالثة ثانوي</div>
              </div>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">—</div>
                <div className="text-sm text-gray-600">—</div>
              </div>
            </>
          ) : (
            <>
              {isHighSchool ? (
                <>
                  {/* س1ث */}
                  <div 
                    className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                      hasAllLevels 
                        ? (selectedLevel === '1AS' || selectedLevel === 'all' 
                            ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                            : 'bg-green-50 border border-green-300 hover:bg-green-100')
                        : (selectedLevel === '1AS' || selectedLevel === 'all'
                            ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                            : 'bg-white border border-purple-200 hover:bg-blue-50')
                    }`}
                    onClick={() => setSelectedLevel(selectedLevel === '1AS' ? 'all' : '1AS')}
                  >
                    <div className={`font-bold transition-colors duration-300 ${
                      hasAllLevels 
                        ? (selectedLevel === '1AS' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                        : (selectedLevel === '1AS' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                    }`}>س1ث</div>
                    <div className="text-sm text-gray-600">السنة الأولى ثانوي</div>
                    {(selectedLevel === '1AS' || selectedLevel === 'all') && (
                      <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                    )}
                  </div>

                  {/* س2ث */}
                  <div 
                    className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                      hasAllLevels 
                        ? (selectedLevel === '2AS' || selectedLevel === 'all' 
                            ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                            : 'bg-green-50 border border-green-300 hover:bg-green-100')
                        : (selectedLevel === '2AS' || selectedLevel === 'all'
                            ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                            : 'bg-white border border-purple-200 hover:bg-blue-50')
                    }`}
                    onClick={() => setSelectedLevel(selectedLevel === '2AS' ? 'all' : '2AS')}
                  >
                    <div className={`font-bold transition-colors duration-300 ${
                      hasAllLevels 
                        ? (selectedLevel === '2AS' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                        : (selectedLevel === '2AS' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                    }`}>س2ث</div>
                    <div className="text-sm text-gray-600">السنة الثانية ثانوي</div>
                    {(selectedLevel === '2AS' || selectedLevel === 'all') && (
                      <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                    )}
                  </div>

                  {/* س3ث */}
                  <div 
                    className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                      hasAllLevels 
                        ? (selectedLevel === '3AS' || selectedLevel === 'all' 
                            ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                            : 'bg-green-50 border border-green-300 hover:bg-green-100')
                        : (selectedLevel === '3AS' || selectedLevel === 'all'
                            ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                            : 'bg-white border border-purple-200 hover:bg-blue-50')
                    }`}
                    onClick={() => setSelectedLevel(selectedLevel === '3AS' ? 'all' : '3AS')}
                  >
                    <div className={`font-bold transition-colors duration-300 ${
                      hasAllLevels 
                        ? (selectedLevel === '3AS' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                        : (selectedLevel === '3AS' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                    }`}>س3ث</div>
                    <div className="text-sm text-gray-600">السنة الثالثة ثانوي</div>
                    {(selectedLevel === '3AS' || selectedLevel === 'all') && (
                      <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* س1م */}
              <div 
                className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                  hasAllLevels 
                    ? (selectedLevel === '1AM' || selectedLevel === 'all' 
                        ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                        : 'bg-green-50 border border-green-300 hover:bg-green-100')
                    : (selectedLevel === '1AM' || selectedLevel === 'all'
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                        : 'bg-white border border-purple-200 hover:bg-blue-50')
                }`}
                onClick={() => setSelectedLevel(selectedLevel === '1AM' ? 'all' : '1AM')}
              >
                <div className={`font-bold transition-colors duration-300 ${
                  hasAllLevels 
                    ? (selectedLevel === '1AM' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                    : (selectedLevel === '1AM' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                }`}>س1م</div>
                <div className="text-sm text-gray-600">السنة الأولى متوسط</div>
                {(selectedLevel === '1AM' || selectedLevel === 'all') && (
                  <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                )}
              </div>
              
              {/* س2م */}
              <div 
                className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                  hasAllLevels 
                    ? (selectedLevel === '2AM' || selectedLevel === 'all' 
                        ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                        : 'bg-green-50 border border-green-300 hover:bg-green-100')
                    : (selectedLevel === '2AM' || selectedLevel === 'all'
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                        : 'bg-white border border-purple-200 hover:bg-blue-50')
                }`}
                onClick={() => setSelectedLevel(selectedLevel === '2AM' ? 'all' : '2AM')}
              >
                <div className={`font-bold transition-colors duration-300 ${
                  hasAllLevels 
                    ? (selectedLevel === '2AM' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                    : (selectedLevel === '2AM' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                }`}>س2م</div>
                <div className="text-sm text-gray-600">السنة الثانية متوسط</div>
                {(selectedLevel === '2AM' || selectedLevel === 'all') && (
                  <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                )}
              </div>
              
              {/* س3م */}
              <div 
                className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                  hasAllLevels 
                    ? (selectedLevel === '3AM' || selectedLevel === 'all' 
                        ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                        : 'bg-green-50 border border-green-300 hover:bg-green-100')
                    : (selectedLevel === '3AM' || selectedLevel === 'all'
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                        : 'bg-white border border-purple-200 hover:bg-blue-50')
                }`}
                onClick={() => setSelectedLevel(selectedLevel === '3AM' ? 'all' : '3AM')}
              >
                <div className={`font-bold transition-colors duration-300 ${
                  hasAllLevels 
                    ? (selectedLevel === '3AM' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                    : (selectedLevel === '3AM' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                }`}>س3م</div>
                <div className="text-sm text-gray-600">السنة الثالثة متوسط</div>
                {(selectedLevel === '3AM' || selectedLevel === 'all') && (
                  <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                )}
              </div>
              
              {/* س4م */}
              <div 
                className={`rounded p-3 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                  hasAllLevels 
                    ? (selectedLevel === '4AM' || selectedLevel === 'all' 
                        ? 'bg-green-100 border-2 border-green-500 shadow-lg transform scale-105' 
                        : 'bg-green-50 border border-green-300 hover:bg-green-100')
                    : (selectedLevel === '4AM' || selectedLevel === 'all'
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-lg transform scale-105'
                        : 'bg-white border border-purple-200 hover:bg-blue-50')
                }`}
                onClick={() => setSelectedLevel(selectedLevel === '4AM' ? 'all' : '4AM')}
              >
                <div className={`font-bold transition-colors duration-300 ${
                  hasAllLevels 
                    ? (selectedLevel === '4AM' || selectedLevel === 'all' ? 'text-green-800' : 'text-green-700')
                    : (selectedLevel === '4AM' || selectedLevel === 'all' ? 'text-blue-800' : 'text-purple-800')
                }`}>س4م</div>
                <div className="text-sm text-gray-600">السنة الرابعة متوسط</div>
                {(selectedLevel === '4AM' || selectedLevel === 'all') && (
                  <div className="text-xs text-green-600 mt-1">✓ مختار</div>
                )}
              </div>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${hasAllLevels ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-sm font-medium ${hasAllLevels ? 'text-green-800' : 'text-yellow-800'}`}>
                {hasAllLevels 
                  ? 'تم اكتشاف جميع مستويات المتوسط في الملف المستورد' 
                  : 'تم اكتشاف بعض مستويات المتوسط فقط'
                }
              </span>
            </div>
            <button
              onClick={() => {
                console.log('Re-detecting levels...');
                const allLevelsPresent = detectAllLevels(students);
                setHasAllLevels(allLevelsPresent);
                console.log('Levels detection result:', allLevelsPresent);
              }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="إعادة فحص المستويات"
            >
              🔍 فحص المستويات
            </button>
          </div>
        </div>
      </div>



      {/* تحليل حسب الجنس */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-pink-800 mb-4">تحليل حسب الجنس</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-pink-200 rounded p-4">
            <h4 className="font-bold text-pink-700 mb-2">الذكور</h4>
            <div className="space-y-1 text-sm">
              <div>العدد: {stats?.stats ? (stats.stats.students?.sex?.male?.count ?? '-') : '-'}</div>
              <div>المعدل العام: {stats?.stats ? (stats.stats.male?.subjects?.moyenneSem1?.mean ?? '-') : '-'}</div>
              <div>نسبة النجاح: {stats?.stats ? ((stats.stats.male?.subjects?.moyenneSem1?.pc_ge10 != null ? stats.stats.male.subjects.moyenneSem1.pc_ge10 + '%' : '-')) : '-'}</div>
            </div>
          </div>
          
          <div className="bg-white border border-pink-200 rounded p-4">
            <h4 className="font-bold text-pink-700 mb-2">الإناث</h4>
            <div className="space-y-1 text-sm">
              <div>العدد: {stats?.stats ? (stats.stats.students?.sex?.female?.count ?? '-') : '-'}</div>
              <div>المعدل العام: {stats?.stats ? (stats.stats.female?.subjects?.moyenneSem1?.mean ?? '-') : '-'}</div>
              <div>نسبة النجاح: {stats?.stats ? ((stats.stats.female?.subjects?.moyenneSem1?.pc_ge10 != null ? stats.stats.female.subjects.moyenneSem1.pc_ge10 + '%' : '-')) : '-'}</div>
            </div>
          </div>
        </div>
        
        {stats?.stats && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              {(() => {
                const mm = Number(stats.stats.male?.subjects?.moyenneSem1?.mean ?? NaN);
                const mf = Number(stats.stats.female?.subjects?.moyenneSem1?.mean ?? NaN);
                if (!Number.isFinite(mm) || !Number.isFinite(mf)) return '—';
                const diff = Math.round((mf - mm) * 10) / 10;
                const pm = Number(stats.stats.male?.subjects?.moyenneSem1?.pc_ge10 ?? NaN);
                const pf = Number(stats.stats.female?.subjects?.moyenneSem1?.pc_ge10 ?? NaN);
                const pd = (Number.isFinite(pm) && Number.isFinite(pf)) ? Math.round((pf - pm) * 10) / 10 : null;
                return `الإناث تتفوق بـ ${diff} نقطة${pd != null ? ` ونسبة نجاح أعلى بـ ${pd} نقطة مئوية` : ''}`;
              })()}
            </p>
          </div>
        )}
      </div>


      {/* المنح (الفئات النوعية للمعدل) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">المنح حسب معدل الفصل</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(() => {
            const m = stats?.stats?.mentions;
            const items: { key: string; label: string; color: string }[] = [
              { key: 'excellence', label: 'تميز (≥ 18)', color: 'bg-emerald-600' },
              { key: 'felicitations', label: 'تهنئة (15-17.99)', color: 'bg-green-500' },
              { key: 'encouragements', label: 'تشجيع (14-14.99)', color: 'bg-blue-500' },
              { key: 'tableau_honneur', label: 'لوحة الشرف (12-13.99)', color: 'bg-indigo-500' },
              { key: 'observation', label: 'بحاجة إلى تحسين (< 12)', color: 'bg-rose-500' }
            ];
            return items.map(it => (
              <div key={it.key} className="bg-gray-50 border rounded p-3 text-center">
                <div className={`text-white text-sm inline-block px-2 py-0.5 rounded ${it.color}`}>{it.label}</div>
                <div className="text-2xl font-bold mt-2">{m?.[it.key]?.count ?? '—'}</div>
                <div className="text-sm text-gray-600">{m?.[it.key]?.percent != null ? `${m[it.key].percent}%` : '—'}</div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* تحليل الفئات الخمسة */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-teal-800 mb-4">تحليل الفئات الخمسة</h3>
        {(() => {
          const g = stats?.stats?.overall?.subjects?.moyenneSem1?.groupes;
          const mx = stats?.stats?.mentions?.excellence; // الممتازة من mentions (≥18)
          // Merge G1 and G2 into one weak category
          const g1Count = g?.['G1(0-8.99)']?.count ?? 0;
          const g2Count = g?.['G2(9-9.99)']?.count ?? 0;
          const g1Percent = g?.['G1(0-8.99)']?.percent ?? 0;
          const g2Percent = g?.['G2(9-9.99)']?.percent ?? 0;
          const mergedWeak = {
            count: g1Count + g2Count,
            percent: g1Percent + g2Percent
          };
          const items = g ? [
            { key: 'G1+G2', label: 'الفئة الضعيفة', color: 'text-red-600' },
            { key: 'G3(10-11.99)', label: 'الفئة المقبولة', color: 'text-amber-600' },
            { key: 'G4(12-13.99)', label: 'الفئة الجيدة', color: 'text-blue-600' },
            { key: 'G5(≥14)', label: 'الفئة الجيدة جداً', color: 'text-emerald-600' },
          ] : [];
          return (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {items.length ? items.map(it => (
                  <div key={it.key} className="bg-white border border-teal-200 rounded p-2 text-center">
                    <div className={`text-base font-bold ${it.color}`}>
                      {it.key === 'G1+G2' ? (mergedWeak.count || '—') : (g?.[it.key]?.count ?? '—')}
                    </div>
                    <div className="text-sm text-gray-600">{it.label}</div>
                    <div className="text-xs text-gray-500">
                      {it.key === 'G1+G2'
                        ? (mergedWeak.percent != null ? `${Number(mergedWeak.percent).toFixed(2)}%` : '—')
                        : (g?.[it.key]?.percent != null ? `${Number(g[it.key].percent).toFixed(2)}%` : '—')}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 md:col-span-5 text-center text-sm text-gray-600">—</div>
                )}
                {/* الممتازة */}
                {mx != null && (
                  <div className="bg-white border border-teal-200 rounded p-2 text-center md:col-span-1 col-span-2">
                    <div className="text-base font-bold text-violet-600">{mx?.count ?? '—'}</div>
                    <div className="text-sm text-gray-600">الفئة الممتازة (≥ 18)</div>
                    <div className="text-xs text-gray-500">{mx?.percent != null ? `${mx.percent}%` : '—'}</div>
                  </div>
                )}
              </div>
              {items.length ? (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    التوزيع محسوب من درجات معدل الفصل حسب حدود الفئات (0-9.99، 10-11.99، 12-13.99، ≥14) مع فئة إضافية للممتازة (≥18)
                  </p>
                </div>
              ) : null}
            </>
          );
        })()}
      </div>

      {/* نتائج الفصل حسب الفصل الحالي */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-indigo-800 mb-2">نتائج {semesterLabel}</h3>
          <p className="text-lg text-gray-700 mb-4">عرض شامل لنتائج {semesterLabel} الدراسي</p>
          <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        {/* مؤشرات رئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(() => {
            const s = (stats?.stats?.overall?.subjects as any)?.[moyenneKey];
            const mean = s?.mean ?? null;
            const success = s?.pc_ge10 ?? null;
            const present = s?.present ?? null;
            const max = s?.max ?? null;
            const min = s?.min ?? null;
            const std = s?.std ?? null;
            
            const getAppreciation = (value: number) => {
              if (value >= 18) return { text: 'ممتاز', color: 'text-green-600', bg: 'bg-green-100' };
              if (value >= 14) return { text: 'جيد جداً', color: 'text-blue-600', bg: 'bg-blue-100' };
              if (value >= 12) return { text: 'جيد', color: 'text-yellow-600', bg: 'bg-yellow-100' };
              if (value >= 10) return { text: 'مقبول', color: 'text-orange-600', bg: 'bg-orange-100' };
              return { text: 'ضعيف', color: 'text-red-600', bg: 'bg-red-100' };
            };

            const meanAppreciation = typeof mean === 'number' ? getAppreciation(mean) : null;
            const successAppreciation = typeof success === 'number' ? 
              (success >= 80 ? { text: 'ممتازة', color: 'text-green-600', bg: 'bg-green-100' } :
               success >= 60 ? { text: 'جيدة', color: 'text-blue-600', bg: 'bg-blue-100' } :
               { text: 'تحتاج تحسين', color: 'text-red-600', bg: 'bg-red-100' }) : null;

            return (
              <>
                {/* المعدل العام */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-indigo-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">📊</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${meanAppreciation?.bg} ${meanAppreciation?.color}`}>
                      {meanAppreciation?.text || '—'}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-indigo-800 mb-2">
                    {typeof mean === 'number' ? mean.toFixed(1) : '—'}
                  </div>
                  <div className="text-sm text-gray-600">المعدل العام</div>
                  <div className="text-xs text-gray-500 mt-1">معدل جميع المواد</div>
                </div>

                {/* نسبة النجاح */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">✅</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${successAppreciation?.bg} ${successAppreciation?.color}`}>
                      {successAppreciation?.text || '—'}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    {typeof success === 'number' ? `${success}%` : '—'}
                  </div>
                  <div className="text-sm text-gray-600">نسبة النجاح</div>
                  <div className="text-xs text-gray-500 mt-1">الطلاب الناجحون</div>
                </div>

                {/* عدد الطلاب */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">👥</div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                      الممتحنين
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mb-2">
                    {typeof present === 'number' ? present : '—'}
                  </div>
                  <div className="text-sm text-gray-600">عدد {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}</div>
                  <div className="text-xs text-gray-500 mt-1">إجمالي الممتحنين</div>
                </div>

                {/* الانحراف المعياري */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">📈</div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                      التشتت
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-800 mb-2">
                    {typeof std === 'number' ? std.toFixed(2) : '—'}
                  </div>
                  <div className="text-sm text-gray-600">الانحراف المعياري</div>
                  <div className="text-xs text-gray-500 mt-1">مقياس التشتت</div>
                </div>
              </>
            );
          })()}
        </div>

        {/* تفاصيل إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* أعلى وأقل معدل */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">🏆</span>
              أفضل وأضعف أداء
            </h4>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">أعلى معدل</span>
                  <span className="text-xl font-bold text-green-600">
                    {(() => {
                      const max = stats?.stats?.overall?.subjects?.[moyenneKey]?.max;
                      return typeof max === 'number' ? max.toFixed(1) : '—';
                    })()}
                  </span>
                </div>
                <div className="text-sm text-green-700 font-medium">
                  {(() => {
                    const max = stats?.stats?.overall?.subjects?.[moyenneKey]?.max;
                    if (typeof max !== 'number') return '—';
                    const topStudents = students.filter((s: any) => {
                      const grade = parseFloat(s[moyenneKey] || s.moyenne || 0);
                      return Math.abs(grade - max) < 0.01; // Tolérance de 0.01 pour plus de précision
                    });
                    if (topStudents.length === 0) return '—';
                    if (topStudents.length === 1) {
                      return `${topStudents[0].nom || topStudents[0].name || 'غير محدد'}`;
                    }
                    return `${topStudents.length} ${currentCycle === 'ثانوي' ? 'طالب' : 'تلميذ'}: ${topStudents.map((s: any) => `${s.nom || s.name || 'غير محدد'}`).join(', ')}`;
                  })()}
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">أقل معدل</span>
                  <span className="text-xl font-bold text-red-600">
                    {(() => {
                      const min = stats?.stats?.overall?.subjects?.[moyenneKey]?.min;
                      return typeof min === 'number' ? min.toFixed(1) : '—';
                    })()}
                  </span>
                </div>
                <div className="text-sm text-red-700 font-medium">
                  {(() => {
                    const min = stats?.stats?.overall?.subjects?.[moyenneKey]?.min;
                    if (typeof min !== 'number') return '—';
                    const bottomStudents = students.filter((s: any) => {
                      const grade = parseFloat(s[moyenneKey] || s.moyenne || 0);
                      return Math.abs(grade - min) < 0.01; // Tolérance de 0.01 pour plus de précision
                    });
                    if (bottomStudents.length === 0) return '—';
                    if (bottomStudents.length === 1) {
                      return `${bottomStudents[0].nom || bottomStudents[0].name || 'غير محدد'}`;
                    }
                    return `${bottomStudents.length} ${currentCycle === 'ثانوي' ? 'طالب' : 'تلميذ'}: ${bottomStudents.map((s: any) => `${s.nom || s.name || 'غير محدد'}`).join(', ')}`;
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* تحليل الأداء */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">📋</span>
              تحليل الأداء
            </h4>
            <div className="space-y-3">
              {(() => {
                const s = stats?.stats?.overall?.subjects?.moyenneSem1;
                const mean = s?.mean;
                const success = s?.pc_ge10 ?? 0;
                const present = s?.present ?? 0;
                
                if (typeof mean !== 'number') {
                  return <div className="text-gray-500 text-sm">لا توجد بيانات متاحة</div>;
                }
                
                const level = mean >= 18 ? 'ممتاز' : mean >= 14 ? 'جيد جداً' : mean >= 12 ? 'جيد' : mean >= 10 ? 'مقبول' : 'ضعيف';
                const successLevel = success >= 80 ? 'ممتازة' : success >= 60 ? 'جيدة' : 'تحتاج تحسين';
                
                return (
                  <>
                    <div className="text-sm text-gray-700">
                      <strong>المستوى العام:</strong> {level}
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>نسبة النجاح:</strong> {successLevel}
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>إجمالي الطلاب:</strong> {present} طالب
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>الطلاب الناجحون:</strong> {Math.round((success * present) / 100)} طالب
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        {/* ملخص نهائي */}
        <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-6 border border-indigo-200">
          <div className="text-center">
            <h4 className="text-xl font-bold text-indigo-800 mb-4 flex items-center justify-center">
              <span className="text-2xl mr-3">📊</span>
              ملخص شامل لـ {semesterLabel}
            </h4>
            {(() => {
              const s = (stats?.stats?.overall?.subjects as any)?.[moyenneKey];
              const mean = s?.mean;
              const success = s?.pc_ge10 ?? 0;
              const present = s?.present ?? 0;
              
              if (typeof mean !== 'number') {
                return (
                  <div className="text-gray-600 text-lg">
                    يرجى استيراد ملف Excel لعرض النتائج
                  </div>
                );
              }
              
              const level = mean >= 18 ? 'ممتاز' : mean >= 14 ? 'جيد جداً' : mean >= 12 ? 'جيد' : mean >= 10 ? 'مقبول' : 'ضعيف';
              const successLevel = success >= 80 ? 'ممتازة' : success >= 60 ? 'جيدة' : 'تحتاج تحسين';
              const successfulStudents = Math.round((success * present) / 100);
              
              return (
                <div className="text-lg text-gray-700 leading-relaxed">
                  <p className="mb-2">
                    <strong>الفصل الأول</strong> أظهر أداءً <span className="font-bold text-indigo-700">{level}</span> 
                    بمعدل عام <span className="font-bold text-blue-700">{mean.toFixed(2)}</span> 
                    ونسبة نجاح <span className="font-bold text-green-700">{success}%</span>
                  </p>
                  <p className="text-base text-gray-600">
                    من أصل <strong>{present}</strong> طالب، نجح <strong>{successfulStudents}</strong> طالب 
                    ({successLevel})
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* النتائج النهائية */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">النتائج النهائية</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-right">المادة</th>
                <th className="border border-gray-300 p-2 text-center">المعدل</th>
                <th className="border border-gray-300 p-2 text-center">النجاح</th>
                <th className="border border-gray-300 p-2 text-center">الانحراف</th>
                <th className="border border-gray-300 p-2 text-center">الإنسجام</th>
                <th className="border border-gray-300 p-2 text-right">ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {stats ? (
                Object.entries({
                  'اللغة العربية': 'arabe',
                  'اللغة الفرنسية': 'francais',
                  'اللغة الإنجليزية': 'anglais',
                  'الرياضيات': 'math',
                  'العلوم الطبيعية و الحياة': 'svt',
                  'العلوم الفيزيائية و التكنولوجيا': 'physique',
                  'المعلوماتية': 'informatique',
                  'التربية الإسلامية': 'islamique',
                  'التربية المدنية': 'civique',
                  'التاريخ و الجغرافيا': 'histGeo',
                  'التربية التشكيلية': 'arts',
                  'التربية الموسيقية': 'musique',
                  'التربية البدنية و الرياضية': 'sport',
                  'معدل الفصل': 'moyenneSem1'
                } as Record<string, string>).map(([label, key]) => {
                  const s = stats?.stats?.overall?.subjects?.[key];
                  if (!s) return null;
                  const note = s.mean ?? '-';
                  const success = s.pc_ge10 != null ? `${s.pc_ge10}%` : '-';
                  const std = s.std ?? '-';
                  const cv = s.cv != null ? `${s.cv}%` : '-';
                  const remarque = typeof note === 'number'
                    ? (note >= 18 ? 'ممتاز'
                      : note >= 14 ? 'جيد جدًا'
                      : note >= 12 ? 'جيد'
                      : note >= 10 ? 'مقبول'
                      : 'ضعيف')
                    : '';
                  const arrowInfo = typeof note === 'number'
                    ? (note >= 18 ? { icon: ArrowUp, color: 'text-emerald-600', title: 'ممتاز (≥ 18)' }
                      : note >= 14 ? { icon: ArrowUp, color: 'text-green-600', title: 'جيد جدًا (14–17.99)' }
                      : note >= 12 ? { icon: ArrowUpRight, color: 'text-blue-600', title: 'جيد (12–13.99)' }
                      : note >= 10 ? { icon: ArrowRight, color: 'text-orange-500', title: 'مقبول (10–11.99)' }
                      : { icon: ArrowDown, color: 'text-red-600', title: 'ضعيف (< 10)' })
                    : null;
                  return (
                    <tr key={key}>
                      <td className="border border-gray-300 p-2">{label}</td>
                      <td className="border border-gray-300 p-2 text-center">{note}</td>
                      <td className="border border-gray-300 p-2 text-center">{success}</td>
                      <td className="border border-gray-300 p-2 text-center">{std}</td>
                      <td className="border border-gray-300 p-2 text-center">{cv}</td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex items-center gap-2">
                          {arrowInfo ? (
                            <span title={arrowInfo.title}>
                              <arrowInfo.icon className={`${arrowInfo.color}`} size={16} />
                            </span>
                          ) : null}
                          <span>{remarque}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="border border-gray-300 p-2" colSpan={6}>يرجى رفع ملف Excel لعرض الإحصائيات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* الرسوم المقترحة */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4">الرسوم الإحصائية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-cyan-200 rounded p-4">
            <h4 className="font-bold text-cyan-700 mb-2">اختر المادة</h4>
            <select
              value={selectedSubjectKey}
              onChange={(e) => setSelectedSubjectKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {Object.keys(subjectLabelToKey).map(label => (
                <option key={label} value={subjectLabelToKey[label]}>{label}</option>
              ))}
            </select>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.stats ? `المادة: ${keyToSubjectLabel[selectedSubjectKey] || ''}` : '—'}
            </div>
          </div>

          <div className="bg-white border border-cyan-200 rounded p-4">
            <h4 className="font-bold text-cyan-700 mb-2">توزيع الشرائح</h4>
            <div className="space-y-2">
              {(() => {
                const s = stats?.stats?.overall?.subjects?.[selectedSubjectKey];
                const entries = s ? Object.entries(s.tranches || {}) : [];
                if (!entries.length) return <div className="text-sm text-gray-500">—</div>;
                const maxCount = Math.max(1, ...entries.map(([, v]: any) => v.count || 0));
                return entries.map(([name, v]: any) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{name}</span>
                      <span>{v.count} ({v.percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded">
                      <div className="h-2 bg-cyan-500 rounded" style={{ width: `${(100 * (v.count || 0)) / maxCount}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="bg-white border border-cyan-200 rounded p-4">
            <h4 className="font-bold text-cyan-700 mb-2">المجموعات النوعية</h4>
            <div className="space-y-2">
              {(() => {
                const s = stats?.stats?.overall?.subjects?.[selectedSubjectKey];
                const entries = s ? Object.entries(s.groupes || {}) : [];
                if (!entries.length) return <div className="text-sm text-gray-500">—</div>;
                const maxCount = Math.max(1, ...entries.map(([, v]: any) => v.count || 0));
                return entries.map(([name, v]: any) => {
                  const displayName = name.replace(/^G(\d)/, 'مج$1');
                  return (
                  <div key={name}>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{displayName}</span>
                      <span>{v.count} ({v.percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded">
                      <div className="h-2 bg-purple-500 rounded" style={{ width: `${(100 * (v.count || 0)) / maxCount}%` }} />
                    </div>
                  </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap gap-4 justify-center">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          <button onClick={handleCreatePdf} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            إنشاء تقرير PDF
          </button>
          <button onClick={handleExportStatsJson} disabled={!stats} className="bg-cyan-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 flex items-center gap-2">
            <Download className="w-5 h-5" />
            تصدير JSON الإحصائيات
          </button>
        </div>
      </div>

      {/* Mini rapport نصي */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">ملخص نصي سريع</h3>
          <div className="flex gap-2">
            <button onClick={buildTextReport} disabled={!stats} className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-blue-700">توليد الملخص</button>
            <button onClick={async () => { if (textReport) { try { await navigator.clipboard.writeText(textReport); } catch {} } }} disabled={!textReport} className="bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-md hover:bg-gray-800">نسخ الملخص</button>
          </div>
        </div>
        <textarea value={textReport} onChange={(e) => setTextReport(e.target.value)} className="w-full min-h-[120px] p-3 border rounded-md font-mono text-sm" placeholder="سيظهر الملخص هنا بعد توليده..." />
      </div>

      {/* Modal for Student Analysis */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#2c3e50] text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">تحليل المعدل العام للمادة</h2>
                  <p className="text-[#2c3e50]/80 text-lg">
                    {currentCycle === 'متوسط' 
                      ? 'تحليل شامل لأداء التلميذ في جميع المواد'
                      : 'تحليل شامل لأداء الطالب في جميع المواد'
                    }
                  </p>
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-white hover:text-gray-200 text-3xl font-bold bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 no-print">
              {/* Student Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedStudent.name?.charAt(0) || 'ط'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-1">{selectedStudent.name}</h3>
                      {selectedStudent.moyenne && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-700 font-medium">المعدل العام:</span>
                          <span className="text-lg font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                            {selectedStudent.moyenne.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Add print-specific styles before printing
                      const printStyles = document.createElement('style');
                      printStyles.textContent = `
                        @media print {
                          body * {
                            visibility: hidden;
                          }
                          .print-content, .print-content * {
                            visibility: visible;
                          }
                          .print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            direction: rtl;
                            font-family: 'Amiri', serif;
                            font-size: 12px;
                            line-height: 1.3;
                            max-height: 29.7cm;
                            overflow: hidden;
                          }
                          .print-header {
                            background: #2c3e50 !important;
                            color: white !important;
                            padding: 15px;
                            text-align: center;
                            margin-bottom: 15px;
                            border-radius: 5px;
                          }
                          .print-header h2 {
                            color: white !important;
                            font-size: 18px;
                            margin: 0 0 5px 0;
                          }
                          .print-header p {
                            color: rgba(255,255,255,0.9) !important;
                            font-size: 12px;
                            margin: 0;
                          }
                          .print-student-info {
                            background: #f8f9fa !important;
                            border: 1px solid #2c3e50 !important;
                            border-radius: 5px;
                            padding: 10px;
                            margin-bottom: 15px;
                            text-align: center;
                          }
                          .print-student-info h3 {
                            color: #2c3e50 !important;
                            font-size: 14px;
                            margin: 0 0 8px 0;
                          }
                          .print-student-info .grade {
                            background: #2c3e50 !important;
                            color: white !important;
                            padding: 5px 10px;
                            border-radius: 10px;
                            font-size: 12px;
                            font-weight: bold;
                            display: inline-block;
                          }
                          .print-subjects-grid {
                            display: grid !important;
                            grid-template-columns: repeat(4, 1fr) !important;
                            gap: 8px !important;
                            margin-bottom: 15px;
                            max-height: 15cm;
                            overflow: hidden;
                          }
                          .print-subject-card {
                            background: white !important;
                            border: 1px solid #2c3e50 !important;
                            border-radius: 5px;
                            padding: 8px;
                            text-align: center;
                            page-break-inside: avoid;
                            min-height: 120px;
                          }
                          .print-subject-grade {
                            font-size: 16px;
                            font-weight: bold;
                            color: #2c3e50 !important;
                            margin: 5px 0;
                          }
                          .print-subject-name {
                            font-size: 11px;
                            font-weight: bold;
                            color: #333 !important;
                            margin-bottom: 3px;
                          }
                          .print-subject-comment {
                            background: #f8f9fa !important;
                            border: 1px solid #dee2e6 !important;
                            border-radius: 3px;
                            padding: 5px;
                            margin-top: 5px;
                            font-size: 9px;
                            text-align: right;
                            line-height: 1.2;
                          }
                          .print-recommendations {
                            background: #f8f9fa !important;
                            border: 1px solid #2c3e50 !important;
                            border-radius: 5px;
                            padding: 10px;
                            margin-top: 15px;
                            page-break-inside: avoid;
                          }
                          .print-recommendations h4 {
                            color: #2c3e50 !important;
                            font-size: 14px;
                            margin: 0 0 8px 0;
                            text-align: center;
                          }
                          .print-recommendations ul {
                            margin: 0;
                            padding-right: 15px;
                            columns: 2;
                            column-gap: 20px;
                          }
                          .print-recommendations li {
                            color: #333 !important;
                            margin-bottom: 3px;
                            font-size: 10px;
                            break-inside: avoid;
                          }
                          .print-orientation {
                            background: #f8f9fa !important;
                            border: 1px solid #2c3e50 !important;
                            border-radius: 5px;
                            padding: 10px;
                            margin-bottom: 15px;
                            text-align: center;
                            page-break-inside: avoid;
                          }
                          .print-orientation h4 {
                            color: #2c3e50 !important;
                            font-size: 14px;
                            margin: 0 0 8px 0;
                            font-weight: bold;
                          }
                          .no-print {
                            display: none !important;
                          }
                          @page {
                            margin: 0.8cm;
                            size: A4;
                          }
                        }
                      `;
                      document.head.appendChild(printStyles);
                      
                      // Create print content
                      const printContent = document.createElement('div');
                      printContent.className = 'print-content';
                      printContent.innerHTML = `
                        <div class="print-header">
                          <h2>تحليل المعدل العام للمادة</h2>
                          <p>${currentCycle === 'متوسط' 
                            ? 'تحليل شامل لأداء التلميذ في جميع المواد'
                            : 'تحليل شامل لأداء الطالب في جميع المواد'
                          }</p>
                        </div>
                        
                        <div class="print-student-info">
                          <h3>معلومات ${currentCycle === 'متوسط' ? 'التلميذ' : 'الطالب'}</h3>
                          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
                            <div style="width: 30px; height: 30px; background: #2c3e50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                              ${selectedStudent.name?.charAt(0) || 'ط'}
                            </div>
                            <div>
                              <div style="font-size: 14px; font-weight: bold; color: #2c3e50; margin-bottom: 3px;">${selectedStudent.name}</div>
                              ${selectedStudent.moyenne ? `<div class="grade">المعدل العام: ${selectedStudent.moyenne.toFixed(2)}</div>` : ''}
                            </div>
                          </div>
                        </div>
                        
                        <div class="print-orientation" style="background: #f8f9fa; border: 1px solid #2c3e50; border-radius: 5px; padding: 10px; margin-bottom: 15px; text-align: center;">
                          <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">التوجيه المقترح (تقدير مؤقت)</h4>
                          <div style="font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 5px;">
                            ${(() => {
                              const studentData = students.find(s => s.nom === selectedStudent.name);
                              if (!studentData) return 'غير محدد';
                              return detectOrientation(studentData);
                            })()}
                          </div>
                          <div style="font-size: 10px; color: #666;">
                            ${(() => {
                              const studentData = students.find(s => s.nom === selectedStudent.name);
                              if (!studentData) return 'لا توجد بيانات كافية';
                              const orientation = detectOrientation(studentData);
                              if (orientation === 'جامعي') return 'تقدير مؤقت: يُنصح بالتوجه نحو التعليم الجامعي';
                              if (orientation === 'تقني سامي') return 'تقدير مؤقت: يُنصح بالتوجه نحو التعليم التقني السامي';
                              if (orientation === 'مهني') return 'تقدير مؤقت: يُنصح بالتوجه نحو التعليم المهني';
                              if (orientation === 'تدريب مهني') return 'تقدير مؤقت: يُنصح بالتوجه نحو التدريب المهني';
                              if (orientation === 'ثانوي علمي') return 'تقدير مؤقت: يُنصح بالتوجه نحو الثانوي العلمي';
                              if (orientation === 'ثانوي تقني') return 'تقدير مؤقت: يُنصح بالتوجه نحو الثانوي التقني';
                              if (orientation === 'ثانوي مهني') return 'تقدير مؤقت: يُنصح بالتوجه نحو الثانوي المهني';
                              if (orientation === 'إعادة السنة') return 'تقدير مؤقت: يُنصح بإعادة السنة لتحسين الأداء';
                              return 'يحتاج إلى مزيد من البيانات لتحديد التوجه المناسب';
                            })()}
                          </div>
                        </div>
                        
                        <div class="print-subjects-grid">
                          ${(() => {
                            const studentData = students.find(s => s.nom === selectedStudent.name);
                            if (!studentData) return '';
                            
                            // Debug: Afficher les données disponibles
                            console.log('Student data for print:', studentData);
                            
                            const cycleSubjects = getSubjects();
                            const subjects = cycleSubjects.map(subjectName => {
                              const subjectMappings: Record<string, { label: string; variants: string[] }> = {
                                'اللغة العربية': { label: 'العربية', variants: ['اللغة العربية', 'عربية', 'عربية', 'arabic', 'Arabic', 'Arabe'] },
                                'الرياضيات': { label: 'الرياضيات', variants: ['الرياضيات', 'رياضيات', 'رياضيات', 'math', 'Math', 'Mathématiques'] },
                                'العلوم الطبيعية و الحياة': { label: 'العلوم الطبيعية', variants: ['العلوم الطبيعية و الحياة', 'العلوم الطبيعية', 'علوم طبيعية', 'طبيعة', 'svt', 'SVT', 'Sciences naturelles'] },
                                'العلوم الفيزيائية و التكنولوجيا': { label: 'العلوم الفيزيائية', variants: ['العلوم الفيزيائية و التكنولوجيا', 'العلوم الفيزيائية', 'علوم فيزيائية', 'فيزياء', 'physique', 'Physique', 'Sciences physiques'] },
                                'اللغة الفرنسية': { label: 'الفرنسية', variants: ['اللغة الفرنسية', 'فرنسية', 'فرنسية', 'french', 'French', 'Français'] },
                                'اللغة الإنجليزية': { label: 'الإنجليزية', variants: ['اللغة الإنجليزية', 'إنجليزية', 'إنجليزية', 'english', 'English', 'Anglais'] },
                                'التاريخ و الجغرافيا': { label: 'التاريخ والجغرافيا', variants: ['التاريخ و الجغرافيا', 'تاريخ', 'تاريخ', 'جغرافيا', 'histoire', 'geographie', 'Histoire', 'Géographie'] },
                                'التربية الإسلامية': { label: 'التربية الإسلامية', variants: ['التربية الإسلامية', 'إسلامية', 'إسلامية', 'islamic', 'Islamic'] },
                                'المعلوماتية': { label: 'المعلوماتية', variants: ['المعلوماتية', 'إعلامية', 'إعلامية', 'informatique', 'Informatique'] },
                                'التربية المدنية': { label: 'التربية المدنية', variants: ['التربية المدنية', 'مدنية', 'مدنية', 'civique', 'Civique'] },
                                'التربية التشكيلية': { label: 'التربية التشكيلية', variants: ['التربية التشكيلية', 'تشكيلية', 'تشكيلية', 'arts', 'Arts'] },
                                'التربية الموسيقية': { label: 'التربية الموسيقية', variants: ['التربية الموسيقية', 'موسيقية', 'موسيقية', 'musique', 'Musique'] },
                                'التربية البدنية و الرياضية': { label: 'التربية البدنية', variants: ['التربية البدنية و الرياضية', 'رياضة', 'رياضة', 'sport', 'Sport'] },
                                'الفلسفة': { label: 'الفلسفة', variants: ['الفلسفة', 'فلسفة', 'فلسفة', 'philosophy', 'Philosophy'] }
                              };
                              
                              const mapping = subjectMappings[subjectName];
                              return {
                                key: subjectName,
                                label: mapping?.label || subjectName,
                                variants: mapping?.variants || [subjectName]
                              };
                            });

                            return subjects
                              .map((subject) => {
                                let grade: number | null = null;
                                let foundVariant = '';
                                
                                // Essayer différentes sources de données
                                if (studentData.notes && typeof studentData.notes === 'object') {
                                  for (const variant of subject.variants) {
                                    const foundGrade = studentData.notes[variant];
                                    if (foundGrade !== undefined && foundGrade !== null && foundGrade !== '') {
                                      const numGrade = parseFloat(foundGrade);
                                      if (!isNaN(numGrade) && numGrade > 0) {
                                        grade = numGrade;
                                        foundVariant = variant;
                                        break;
                                      }
                                    }
                                  }
                                }
                                
                                if (grade === null && studentData.matieres && typeof studentData.matieres === 'object') {
                                  for (const variant of subject.variants) {
                                    const foundGrade = studentData.matieres[variant];
                                    if (foundGrade !== undefined && foundGrade !== null && foundGrade !== '') {
                                      const numGrade = parseFloat(foundGrade);
                                      if (!isNaN(numGrade) && numGrade > 0) {
                                        grade = numGrade;
                                        foundVariant = variant;
                                        break;
                                      }
                                    }
                                  }
                                }
                                
                                if (grade === null) {
                                  for (const variant of subject.variants) {
                                    const foundGrade = studentData[variant];
                                    if (foundGrade !== undefined && foundGrade !== null && foundGrade !== '') {
                                      const numGrade = parseFloat(foundGrade);
                                      if (!isNaN(numGrade) && numGrade > 0) {
                                        grade = numGrade;
                                        foundVariant = variant;
                                        break;
                                      }
                                    }
                                  }
                                }
                                
                                // Si aucune note trouvée, afficher quand même la carte avec "--"
                                const displayValue = grade !== null ? Math.round(grade * 100) / 100 : '--';
                                
                                return `
                                  <div class="print-subject-card">
                                    <div class="print-subject-grade">${displayValue}</div>
                                    <div class="print-subject-name">${subject.label}</div>
                                    ${grade !== null ? `<div style="font-size: 8px; color: #666; margin-top: 2px;">${foundVariant}</div>` : ''}
                                  </div>
                                `;
                              })
                              .slice(0, 12) // Limiter à 12 matières maximum
                              .join('');
                          })()}
                        </div>
                        
                        <div class="print-recommendations">
                          <h4>نصائح وتوصيات عامة</h4>
                          <ul>
                            <li>خصص وقتاً يومياً للمراجعة</li>
                            <li>استخدم تقنيات الحفظ الفعال</li>
                            <li>حل تمارين إضافية</li>
                            <li>اطلب المساعدة من المعلمين</li>
                            <li>ضع خطة دراسية منظمة</li>
                            <li>راجع الدروس بانتظام</li>
                          </ul>
                        </div>
                      `;
                      
                      document.body.appendChild(printContent);
                      window.print();
                      
                      // Clean up
                      setTimeout(() => {
                        document.body.removeChild(printContent);
                        document.head.removeChild(printStyles);
                      }, 1000);
                    }}
                    className="text-sm bg-[#2c3e50] hover:bg-[#2c3e50]/80 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    🖨️ طباعة
                  </button>
                </div>
              </div>

              {/* Overall Analysis */}
              {(() => {
                const studentData = students.find(s => s.nom === selectedStudent.name);
                const analysis = getOverallAnalysis(studentData);
                return analysis ? (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-sm mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="text-3xl">📊</div>
                        <h4 className="text-xl font-bold text-green-800">تحليل شامل للأداء</h4>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-green-100">
                        <p className="text-base text-green-700 leading-relaxed text-center font-medium">
                          {analysis}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Orientation Suggestion */}
              {(() => {
                const studentData = students.find(s => s.nom === selectedStudent.name);
                if (!studentData) return null;
                
                const orientation = detectOrientation(studentData);
                const orientationColors = isHighSchool ? {
                  'جامعي': 'from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
                  'تقني سامي': 'from-green-50 to-emerald-50 border-green-200 text-green-800',
                  'مهني': 'from-purple-50 to-violet-50 border-purple-200 text-purple-800',
                  'تدريب مهني': 'from-orange-50 to-amber-50 border-orange-200 text-orange-800',
                  'إعادة السنة': 'from-red-50 to-orange-50 border-red-200 text-red-800',
                  'غير محدد': 'from-gray-50 to-slate-50 border-gray-200 text-gray-800'
                } : {
                  'ثانوي علمي': 'from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
                  'ثانوي تقني': 'from-green-50 to-emerald-50 border-green-200 text-green-800',
                  'ثانوي مهني': 'from-purple-50 to-violet-50 border-purple-200 text-purple-800',
                  'إعادة السنة': 'from-red-50 to-orange-50 border-red-200 text-red-800',
                  'غير محدد': 'from-gray-50 to-slate-50 border-gray-200 text-gray-800'
                };
                
                const orientationIcons = isHighSchool ? {
                  'جامعي': '🎓',
                  'تقني سامي': '🔧',
                  'مهني': '⚙️',
                  'تدريب مهني': '🛠️',
                  'إعادة السنة': '🔄',
                  'غير محدد': '❓'
                } : {
                  'ثانوي علمي': '🔬',
                  'ثانوي تقني': '⚙️',
                  'ثانوي مهني': '🔧',
                  'إعادة السنة': '🔄',
                  'غير محدد': '❓'
                };
                
                const colorClass = orientationColors[orientation as keyof typeof orientationColors] || orientationColors['غير محدد'];
                const icon = orientationIcons[orientation as keyof typeof orientationIcons] || orientationIcons['غير محدد'];
                
                return (
                  <div className={`bg-gradient-to-r ${colorClass} border rounded-xl p-6 mb-6 shadow-sm`}>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="text-3xl">{icon}</div>
                        <h4 className="text-xl font-bold">التوجيه المقترح (تقدير مؤقت)</h4>
                      </div>
                      <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-opacity-50">
                        <div className="text-2xl font-bold mb-2">{orientation}</div>
                        <div className="text-xs text-amber-600 font-medium mb-2 bg-amber-50 px-2 py-1 rounded">
                          ⚠️ تقدير مؤقت - التوجيه النهائي سيتم تحديده {isHighSchool ? 'في نهاية السنة الدراسية' : 'في قسم "تحليل ش.ت.م"'}
                        </div>
                        <div className="text-sm opacity-80">
                          {orientation === 'جامعي' && 'تقدير مؤقت: يُنصح بالتوجه نحو التعليم الجامعي'}
                          {orientation === 'تقني سامي' && 'تقدير مؤقت: يُنصح بالتوجه نحو التعليم التقني السامي'}
                          {orientation === 'مهني' && 'تقدير مؤقت: يُنصح بالتوجه نحو التعليم المهني'}
                          {orientation === 'تدريب مهني' && 'تقدير مؤقت: يُنصح بالتوجه نحو التدريب المهني'}
                          {orientation === 'ثانوي علمي' && 'تقدير مؤقت: يُنصح بالتوجه نحو الثانوي العلمي'}
                          {orientation === 'ثانوي تقني' && 'تقدير مؤقت: يُنصح بالتوجه نحو الثانوي التقني'}
                          {orientation === 'ثانوي مهني' && 'تقدير مؤقت: يُنصح بالتوجه نحو الثانوي المهني'}
                          {orientation === 'إعادة السنة' && 'تقدير مؤقت: يُنصح بإعادة السنة لتحسين الأداء'}
                          {orientation === 'غير محدد' && 'يحتاج إلى مزيد من البيانات لتحديد التوجه المناسب'}
                        </div>
                        {studentData.moyenne && (
                          <div className="mt-3 text-xs opacity-70">
                            بناءً على المعدل المؤقت: {studentData.moyenne.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Subject Analysis */}
              {students && students.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {(() => {
                    // Get subjects based on current cycle
                    const cycleSubjects = getSubjects();
                    
                    // Create subject mapping with variants for each cycle
                    const subjects = cycleSubjects.map(subjectName => {
                      const subjectMappings: Record<string, { label: string; variants: string[] }> = {
                        'اللغة العربية': { 
                          label: 'العربية', 
                          variants: ['اللغة العربية', 'عربية', 'عربية', 'arabic', 'Arabic', 'Arabe'] 
                        },
                        'الرياضيات': { 
                          label: 'الرياضيات', 
                          variants: ['الرياضيات', 'رياضيات', 'رياضيات', 'math', 'Math', 'Mathématiques'] 
                        },
                        'العلوم الطبيعية و الحياة': { 
                          label: 'العلوم الطبيعية', 
                          variants: ['العلوم الطبيعية و الحياة', 'العلوم الطبيعية', 'علوم طبيعية', 'طبيعة', 'svt', 'SVT', 'Sciences naturelles'] 
                        },
                        'العلوم الفيزيائية و التكنولوجيا': { 
                          label: 'العلوم الفيزيائية', 
                          variants: ['العلوم الفيزيائية و التكنولوجيا', 'العلوم الفيزيائية', 'علوم فيزيائية', 'فيزياء', 'physique', 'Physique', 'Sciences physiques'] 
                        },
                        'اللغة الفرنسية': { 
                          label: 'الفرنسية', 
                          variants: ['اللغة الفرنسية', 'فرنسية', 'فرنسية', 'french', 'French', 'Français'] 
                        },
                        'اللغة الإنجليزية': { 
                          label: 'الإنجليزية', 
                          variants: ['اللغة الإنجليزية', 'إنجليزية', 'إنجليزية', 'english', 'English', 'Anglais'] 
                        },
                        'التاريخ و الجغرافيا': { 
                          label: 'التاريخ والجغرافيا', 
                          variants: ['التاريخ و الجغرافيا', 'تاريخ', 'تاريخ', 'جغرافيا', 'histoire', 'geographie', 'Histoire', 'Géographie'] 
                        },
                        'التربية الإسلامية': { 
                          label: 'التربية الإسلامية', 
                          variants: ['التربية الإسلامية', 'إسلامية', 'إسلامية', 'islamic', 'Islamic'] 
                        },
                        'المعلوماتية': { 
                          label: 'المعلوماتية', 
                          variants: ['المعلوماتية', 'إعلامية', 'إعلامية', 'informatique', 'Informatique'] 
                        },
                        'التربية المدنية': { 
                          label: 'التربية المدنية', 
                          variants: ['التربية المدنية', 'مدنية', 'مدنية', 'civique', 'Civique'] 
                        },
                        'التربية التشكيلية': { 
                          label: 'التربية التشكيلية', 
                          variants: ['التربية التشكيلية', 'تشكيلية', 'تشكيلية', 'arts', 'Arts'] 
                        },
                        'التربية الموسيقية': { 
                          label: 'التربية الموسيقية', 
                          variants: ['التربية الموسيقية', 'موسيقية', 'موسيقية', 'musique', 'Musique'] 
                        },
                        'التربية البدنية و الرياضية': { 
                          label: 'التربية البدنية', 
                          variants: ['التربية البدنية و الرياضية', 'رياضة', 'رياضة', 'sport', 'Sport'] 
                        },
                        'الفلسفة': { 
                          label: 'الفلسفة', 
                          variants: ['الفلسفة', 'فلسفة', 'فلسفة', 'philosophy', 'Philosophy'] 
                        }
                      };
                      
                      const mapping = subjectMappings[subjectName];
                      return {
                        key: subjectName,
                        label: mapping?.label || subjectName,
                        variants: mapping?.variants || [subjectName]
                      };
                    });

                    return subjects
                      .map((subject, index) => {
                        let displayValue: string | number = '--';
                        let displayLabel = subject.label;
                        let displaySubtext = '';
                        let cardClass = 'bg-white border-indigo-200';
                        let textClass = 'text-indigo-600';

                        // Find the student in the original data
                        const studentData = students.find(s => s.nom === selectedStudent.name);
                        
                        if (studentData) {
                          let grade: number | null = null;
                          
                          // Try different ways to access grades
                          if (studentData.notes && typeof studentData.notes === 'object') {
                            const foundGrade = subject.variants
                              .map(variant => studentData.notes[variant])
                              .find(g => g !== undefined && g !== null && g !== '');
                            
                            if (foundGrade) {
                              const numGrade = parseFloat(foundGrade);
                              if (!isNaN(numGrade) && numGrade > 0) {
                                grade = numGrade;
                              }
                            }
                          } else if (studentData.matieres && typeof studentData.matieres === 'object') {
                            // Try the matieres object (from excelReader.ts)
                            const foundGrade = subject.variants
                              .map(variant => studentData.matieres[variant])
                              .find(g => g !== undefined && g !== null && g !== '');
                            
                            if (foundGrade) {
                              const numGrade = parseFloat(foundGrade);
                              if (!isNaN(numGrade) && numGrade > 0) {
                                grade = numGrade;
                              }
                            }
                          } else {
                            // Try direct properties
                            const foundGrade = subject.variants
                              .map(variant => studentData[variant])
                              .find(g => g !== undefined && g !== null && g !== '');
                            
                            if (foundGrade) {
                              const numGrade = parseFloat(foundGrade);
                              if (!isNaN(numGrade) && numGrade > 0) {
                                grade = numGrade;
                              }
                            }
                          }
                          
                          if (grade !== null) {
                            displayValue = Math.round(grade * 100) / 100;
                            displaySubtext = 'درجة الطالب';
                            
                            // Color coding based on grade
                            if (grade >= 16) {
                              cardClass = 'bg-green-50 border-green-300';
                              textClass = 'text-green-700';
                            } else if (grade >= 14) {
                              cardClass = 'bg-blue-50 border-blue-300';
                              textClass = 'text-blue-700';
                            } else if (grade >= 10) {
                              cardClass = 'bg-yellow-50 border-yellow-300';
                              textClass = 'text-yellow-700';
                            } else {
                              cardClass = 'bg-red-50 border-red-300';
                              textClass = 'text-red-700';
                            }
                          } else {
                            displaySubtext = 'لا توجد درجة';
                            cardClass = 'bg-gray-50 border-gray-300';
                            textClass = 'text-gray-500';
                          }
                        }

                        return {
                          subject,
                          index,
                          displayValue,
                          displayLabel,
                          displaySubtext,
                          cardClass,
                          textClass,
                          hasGrade: displayValue !== '--' && typeof displayValue === 'number' && displayValue > 0
                        };
                      })
                      .filter(item => item.hasGrade) // Filtrer seulement les matières avec des notes
                      .map((item, filteredIndex) => (
                        <div key={item.index} className={`${item.cardClass} border-2 rounded-xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:scale-105`}>
                          <div className="flex items-center justify-center gap-3 mb-3">
                            <div className={`font-bold text-2xl ${item.textClass}`}>
                              {item.displayValue}
                            </div>
                            {typeof item.displayValue === 'number' && item.displayValue > 0 && (
                              <span className="text-2xl">{getPerformanceIcon(item.displayValue)}</span>
                            )}
                          </div>
                          <div className={`text-base font-bold text-gray-800 mb-2 ${item.displayLabel === 'التربية البدنية' ? 'text-center' : ''}`}>{item.displayLabel}</div>
                          <div className="text-sm text-gray-600 mb-4 font-medium">{item.displaySubtext}</div>
                          
                          {typeof item.displayValue === 'number' && item.displayValue > 0 && (
                            <div className="space-y-3 text-right">
                              <div className="p-3 bg-white bg-opacity-80 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">💬</span>
                                  <div className="font-bold text-gray-800 text-sm">التقييم</div>
                                </div>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                  {getGradeComment(item.displayValue, item.displayLabel)}
                                </div>
                              </div>
                              <div className="p-3 bg-white bg-opacity-80 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">💡</span>
                                  <div className="font-bold text-gray-800 text-sm">التوصية</div>
                                </div>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                  {getGradeRecommendation(item.displayValue, item.displayLabel)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ));
                  })()}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="text-yellow-600">⚠️</div>
                    <span className="text-sm text-yellow-800">
                      يرجى استيراد ملف Excel يحتوي على بيانات التلاميذ لرؤية تحليل المعدل العام للمواد
                    </span>
                  </div>
                </div>
              )}

              {/* Conseils et توصيات عامة */}
              <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h4 className="text-2xl font-bold text-purple-800 mb-2">نصائح وتوصيات عامة</h4>
                      <p className="text-purple-600 text-lg">إرشادات لتحسين الأداء</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="text-center mb-6">
                        <div className="text-3xl mb-3">📚</div>
                        <h5 className="font-bold text-purple-800 text-xl mb-2">استراتيجيات الدراسة</h5>
                        <p className="text-purple-600 text-sm">نصائح لتحسين طريقة التعلم</p>
                      </div>
                      <ul className="text-purple-700 space-y-3 text-right">
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">خصص وقتاً يومياً للمراجعة</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">استخدم تقنيات الحفظ الفعال</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">حل تمارين إضافية في المواد الضعيفة</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">اطلب المساعدة من المعلمين</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="text-center mb-6">
                        <div className="text-3xl mb-3">🎯</div>
                        <h5 className="font-bold text-purple-800 text-xl mb-2">أهداف الفصل القادم</h5>
                        <p className="text-purple-600 text-sm">خطة للتطوير والتحسين</p>
                      </div>
                      <ul className="text-purple-700 space-y-3 text-right">
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">تحسين الأداء في المواد الضعيفة</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">الحفاظ على المستوى في المواد القوية</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">زيادة المعدل العام</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></span>
                          <span className="font-medium">تطوير مهارات التعلم الذاتي</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 no-print">
              <button
                onClick={handleModalClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;