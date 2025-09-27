// Nouveau système d'analyse basé sur l'exemple fourni
// Calculs complets pour tous les indicateurs du rapport

export interface Student {
  id: number;
  nom: string;
  sexe: "ذكر" | "أنثى";
  repeater: boolean;
  classe: string;
  niveau: string;
  notes: {
    عربية: number;
    أمازيغية: number;
    فرنسية: number;
    إنجليزية: number;
    إسلامية: number;
    مدنية: number;
    تاريخ: number;
    رياضيات: number;
    طبيعة: number;
    فيزياء: number;
    إعلامية: number;
    تشكيلية: number;
    موسيقية: number;
    رياضة: number;
  };
}

export interface SubjectAnalysis {
  name: string;
  present: number;
  mean: number;
  stdDev: number;
  note: string;
  successRate: number;
  successCount: number;
  categories: {
    "10 ≤": { count: number; percentage: number };
    "من 8 إلى 9.99": { count: number; percentage: number };
    "أقل من 08": { count: number; percentage: number };
  };
  cohesion: {
    percentage: number;
    note: string;
  };
  quintiles: {
    "الفئة الضعيفة": { count: number; percentage: number };
    "الفئة القريبة من المتوسط": { count: number; percentage: number };
    "الفئة المتوسطة": { count: number; percentage: number };
    "الفئة الحسنة": { count: number; percentage: number };
    "الفئة الجيدة": { count: number; percentage: number };
  };
  distribution: {
    "0 - 8.99": { count: number; percentage: number };
    "9 - 9.99": { count: number; percentage: number };
    "10 - 11.99": { count: number; percentage: number };
    "12 - 13.99": { count: number; percentage: number };
    "14 - 15.99": { count: number; percentage: number };
    "16 - 17.99": { count: number; percentage: number };
    "18 - 20": { count: number; percentage: number };
  };
  hasNotes: boolean; // Indicateur pour savoir si la matière a des notes
}

export interface GenderAnalysis {
  male: SubjectAnalysis[];
  female: SubjectAnalysis[];
}

export interface RepeatAnalysis {
  repeaters: SubjectAnalysis[];
  nonRepeaters: SubjectAnalysis[];
}

export interface StudentOrientation {
  id: number;
  nom: string;
  sciences: number;
  arts: number;
  orientation: string;
  classe: string;
  niveau: string;
}

export interface ClassRanking {
  classe: string;
  mean: number;
  rank: number;
}

export interface QualitativeIndicators {
  امتياز: { count: number; percentage: number };
  تهنئة: { count: number; percentage: number };
  تشجيع: { count: number; percentage: number };
  لوحة_شرف: { count: number; percentage: number };
  ملاحظة: { count: number; percentage: number };
}

export interface DistributionStats {
  gender: {
    male: { count: number; percentage: number };
    female: { count: number; percentage: number };
    total: { count: number; percentage: number };
  };
  repeat: {
    repeaters: { count: number; percentage: number };
    nonRepeaters: { count: number; percentage: number };
    total: { count: number; percentage: number };
  };
  orientation: {
    sciences: { count: number; percentage: number };
    arts: { count: number; percentage: number };
    total: { count: number; percentage: number };
  };
  orientationByGender: {
    male: {
      sciences: { count: number; percentage: number };
      arts: { count: number; percentage: number };
      total: { count: number; percentage: number };
    };
    female: {
      sciences: { count: number; percentage: number };
      arts: { count: number; percentage: number };
      total: { count: number; percentage: number };
    };
  };
}

export interface CompleteAnalysis {
  students: StudentOrientation[];
  subjects: SubjectAnalysis[];
  genderAnalysis: GenderAnalysis;
  repeatAnalysis: RepeatAnalysis;
  classRanking: ClassRanking[];
  qualitativeIndicators: QualitativeIndicators;
  distribution: DistributionStats;
  meta: {
    totalStudents: number;
    semester: string;
    level: string;
  };
}

// Fonctions utilitaires
function calculateMean(notes: number[]): number {
  if (notes.length === 0) return 0;
  return notes.reduce((a, b) => a + b, 0) / notes.length;
}

function calculateStdDev(notes: number[]): number {
  if (notes.length === 0) return 0;
  const mean = calculateMean(notes);
  const variance = notes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / notes.length;
  return Math.sqrt(variance);
}

function calculateCV(mean: number, stdDev: number): number {
  if (mean === 0) return 0;
  return (stdDev / mean) * 100;
}

function getCohesionNote(cv: number): string {
  if (isNaN(cv) || !isFinite(cv)) return "لم تدرس";
  if (cv < 15) return "هناك إنسجام تام";
  if (cv < 20) return "هناك إنسجام نسبي";
  if (cv < 25) return "هناك إنسجام نسبي";
  return "هناك تشتت واختلاف";
}

function getPerformanceNote(mean: number, cv: number): string {
  if (mean === 0) return "لم تدرس";
  if (mean >= 17) return "أداء ممتاز";
  if (mean >= 15) return "أداء جيد وثابت";
  if (mean >= 12) return "أداء جيد لكنه متنوع";
  if (mean >= 10) return "أداء مقبول";
  return "أداء ضعيف وغير مستقر";
}

function getCategoryNote(successRate: number): string {
  if (successRate >= 80) return "مقبول";
  if (successRate >= 60) return "مقبول";
  return "للمعالجة";
}

function calculateQuintiles(notes: number[]): any {
  if (notes.length === 0) {
    return {
      "الفئة الضعيفة": { count: 0, percentage: 0 },
      "الفئة القريبة من المتوسط": { count: 0, percentage: 0 },
      "الفئة المتوسطة": { count: 0, percentage: 0 },
      "الفئة الحسنة": { count: 0, percentage: 0 },
      "الفئة الجيدة": { count: 0, percentage: 0 }
    };
  }

  const sorted = [...notes].sort((a, b) => a - b);
  const n = sorted.length;
  
  const q1 = sorted[Math.floor(n * 0.2)];
  const q2 = sorted[Math.floor(n * 0.4)];
  const q3 = sorted[Math.floor(n * 0.6)];
  const q4 = sorted[Math.floor(n * 0.8)];

  return {
    "الفئة الضعيفة": {
      count: notes.filter(n => n < q1).length,
      percentage: (notes.filter(n => n < q1).length / n) * 100
    },
    "الفئة القريبة من المتوسط": {
      count: notes.filter(n => n >= q1 && n < q2).length,
      percentage: (notes.filter(n => n >= q1 && n < q2).length / n) * 100
    },
    "الفئة المتوسطة": {
      count: notes.filter(n => n >= q2 && n < q3).length,
      percentage: (notes.filter(n => n >= q2 && n < q3).length / n) * 100
    },
    "الفئة الحسنة": {
      count: notes.filter(n => n >= q3 && n < q4).length,
      percentage: (notes.filter(n => n >= q3 && n < q4).length / n) * 100
    },
    "الفئة الجيدة": {
      count: notes.filter(n => n >= q4).length,
      percentage: (notes.filter(n => n >= q4).length / n) * 100
    }
  };
}

function calculateDistribution(notes: number[]): any {
  if (notes.length === 0) {
    return {
      "0 - 8.99": { count: 0, percentage: 0 },
      "9 - 9.99": { count: 0, percentage: 0 },
      "10 - 11.99": { count: 0, percentage: 0 },
      "12 - 13.99": { count: 0, percentage: 0 },
      "14 - 15.99": { count: 0, percentage: 0 },
      "16 - 17.99": { count: 0, percentage: 0 },
      "18 - 20": { count: 0, percentage: 0 }
    };
  }

  const ranges = [
    { name: "0 - 8.99", min: 0, max: 8.99 },
    { name: "9 - 9.99", min: 9, max: 9.99 },
    { name: "10 - 11.99", min: 10, max: 11.99 },
    { name: "12 - 13.99", min: 12, max: 13.99 },
    { name: "14 - 15.99", min: 14, max: 15.99 },
    { name: "16 - 17.99", min: 16, max: 17.99 },
    { name: "18 - 20", min: 18, max: 20 }
  ];

  const result: any = {};
  ranges.forEach(range => {
    const count = notes.filter(n => n >= range.min && n <= range.max).length;
    result[range.name] = {
      count,
      percentage: (count / notes.length) * 100
    };
  });

  return result;
}

// Fonction principale d'analyse
export function calculateCompleteAnalysis(
  students: Student[],
  semester: string,
  level: string
): CompleteAnalysis {
  // 1. Calculer l'orientation pour chaque élève
  const studentsWithOrientation: StudentOrientation[] = students.map(student => {
    // Calculate general average using BEM criteria
    const generalAverage = student.moyenne || calculateMean(Object.values(student.notes).filter(v => typeof v === 'number' && v > 0));
    
  let orientation = "غير محدد";
  if (generalAverage >= 16) {
      orientation = "ثانوي علمي";
    } else if (generalAverage >= 14) {
      orientation = "ثانوي تقني";
    } else if (generalAverage >= 10) {
      orientation = "ثانوي مهني";
    } else if (generalAverage > 0) {
      orientation = "إعادة السنة";
    }
    
    const sciences = calculateMean([student.notes.طبيعة, student.notes.فيزياء, student.notes.رياضيات]);
    const arts = calculateMean([student.notes.عربية, student.notes.فرنسية, student.notes.تاريخ]);
    
    return {
      id: student.id,
      nom: student.nom,
      sciences,
      arts,
      orientation,
      classe: student.classe,
      niveau: student.niveau
    };
  });

  // 2. Analyser chaque matière
  const subjectNames = [
    "اللغة العربية", "اللغة الأمازيغية", "اللغة الفرنسية", "اللغة الإنجليزية",
    "التربية الإسلامية", "التربية المدنية", "التاريخ والجغرافيا", "الرياضيات",
    "العلوم الطبيعية والحياة", "العلوم الفزيائية", "الإعلام الآلي",
    "التربية التشكيلية", "التربية الموسيقية", "التربية البدنية"
  ];

  const subjectKeys = [
    "عربية", "أمازيغية", "فرنسية", "إنجليزية", "إسلامية", "مدنية",
    "تاريخ", "رياضيات", "طبيعة", "فيزياء", "إعلامية", "تشكيلية", "موسيقية", "رياضة"
  ];

  const subjects: SubjectAnalysis[] = subjectNames
    .map((name, index) => {
      const key = subjectKeys[index] as keyof Student['notes'];
      const notes = students.map(s => s.notes[key]).filter(n => n > 0);
      
      const present = notes.length;
      const mean = calculateMean(notes);
      const stdDev = calculateStdDev(notes);
      const cv = calculateCV(mean, stdDev);
      
      const successCount = notes.filter(n => n >= 10).length;
      const successRate = present > 0 ? (successCount / present) * 100 : 0;
      
      return {
        name,
        present,
        mean: mean || 0,
        stdDev: stdDev || 0,
        note: getPerformanceNote(mean, cv),
        successRate,
        successCount,
        categories: {
          "10 ≤": {
            count: successCount,
            percentage: successRate
          },
          "من 8 إلى 9.99": {
            count: notes.filter(n => n >= 8 && n < 10).length,
            percentage: present > 0 ? (notes.filter(n => n >= 8 && n < 10).length / present) * 100 : 0
          },
          "أقل من 08": {
            count: notes.filter(n => n < 8).length,
            percentage: present > 0 ? (notes.filter(n => n < 8).length / present) * 100 : 0
          }
        },
        cohesion: {
          percentage: cv || 0,
          note: getCohesionNote(cv)
        },
        quintiles: calculateQuintiles(notes),
        distribution: calculateDistribution(notes),
        hasNotes: present > 0 // Ajouter un indicateur pour savoir si la matière a des notes
      };
    })
    .filter(subject => subject.hasNotes); // Filtrer seulement les matières avec des notes

  // 3. Analyse par genre
  const maleStudents = students.filter(s => s.sexe === "ذكر");
  const femaleStudents = students.filter(s => s.sexe === "أنثى");

  const genderAnalysis: GenderAnalysis = {
    male: subjectNames.map((name, index) => {
      const key = subjectKeys[index] as keyof Student['notes'];
      const notes = maleStudents.map(s => s.notes[key]).filter(n => n > 0);
      return analyzeSubjectGroup(notes, name, maleStudents.length);
    }),
    female: subjectNames.map((name, index) => {
      const key = subjectKeys[index] as keyof Student['notes'];
      const notes = femaleStudents.map(s => s.notes[key]).filter(n => n > 0);
      return analyzeSubjectGroup(notes, name, femaleStudents.length);
    })
  };

  // 4. Analyse par redoublement
  const repeaters = students.filter(s => s.repeater);
  const nonRepeaters = students.filter(s => !s.repeater);

  const repeatAnalysis: RepeatAnalysis = {
    repeaters: subjectNames.map((name, index) => {
      const key = subjectKeys[index] as keyof Student['notes'];
      const notes = repeaters.map(s => s.notes[key]).filter(n => n > 0);
      return analyzeSubjectGroup(notes, name, repeaters.length);
    }),
    nonRepeaters: subjectNames.map((name, index) => {
      const key = subjectKeys[index] as keyof Student['notes'];
      const notes = nonRepeaters.map(s => s.notes[key]).filter(n => n > 0);
      return analyzeSubjectGroup(notes, name, nonRepeaters.length);
    })
  };

  // 5. Classement des classes
  const classGroups = students.reduce((acc, student) => {
    if (!acc[student.classe]) acc[student.classe] = [];
    acc[student.classe].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const classRanking: ClassRanking[] = Object.entries(classGroups).map(([classe, classStudents]) => {
    const allNotes = classStudents.flatMap(s => Object.values(s.notes)).filter(n => n > 0);
    const mean = calculateMean(allNotes);
    return { classe, mean, rank: 0 };
  }).sort((a, b) => b.mean - a.mean).map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  // 6. Indicateurs qualitatifs
  const allMeans = students.map(s => {
    const notes = Object.values(s.notes).filter(n => n > 0);
    return calculateMean(notes);
  });

  const qualitativeIndicators: QualitativeIndicators = {
    امتياز: { count: 0, percentage: 0 },
    تهنئة: { count: 0, percentage: 0 },
    تشجيع: { count: 0, percentage: 0 },
    لوحة_شرف: { count: 0, percentage: 0 },
    ملاحظة: { count: 0, percentage: 0 }
  };

  allMeans.forEach(mean => {
    if (mean >= 18) qualitativeIndicators.امتياز.count++;
    else if (mean >= 15) qualitativeIndicators.تهنئة.count++;
    else if (mean >= 14) qualitativeIndicators.تشجيع.count++;
    else if (mean >= 12) qualitativeIndicators.لوحة_شرف.count++;
    else qualitativeIndicators.ملاحظة.count++;
  });

  const total = students.length;
  Object.values(qualitativeIndicators).forEach(indicator => {
    indicator.percentage = (indicator.count / total) * 100;
  });

  // 7. Statistiques de distribution
  const distribution: DistributionStats = {
    gender: {
      male: { count: maleStudents.length, percentage: (maleStudents.length / total) * 100 },
      female: { count: femaleStudents.length, percentage: (femaleStudents.length / total) * 100 },
      total: { count: total, percentage: 100 }
    },
    repeat: {
      repeaters: { count: repeaters.length, percentage: (repeaters.length / total) * 100 },
      nonRepeaters: { count: nonRepeaters.length, percentage: (nonRepeaters.length / total) * 100 },
      total: { count: total, percentage: 100 }
    },
    orientation: {
      sciences: { count: 0, percentage: 0 },
      arts: { count: 0, percentage: 0 },
      total: { count: total, percentage: 100 }
    },
    orientationByGender: {
      male: { sciences: { count: 0, percentage: 0 }, arts: { count: 0, percentage: 0 }, total: { count: maleStudents.length, percentage: 0 } },
      female: { sciences: { count: 0, percentage: 0 }, arts: { count: 0, percentage: 0 }, total: { count: femaleStudents.length, percentage: 0 } }
    }
  };

  // Calculer les orientations
  studentsWithOrientation.forEach(student => {
    if (student.orientation.includes("علوم")) {
      distribution.orientation.sciences.count++;
      if (student.nom.includes("ذكر") || maleStudents.some(s => s.nom === student.nom)) {
        distribution.orientationByGender.male.sciences.count++;
      } else {
        distribution.orientationByGender.female.sciences.count++;
      }
    } else {
      distribution.orientation.arts.count++;
      if (student.nom.includes("ذكر") || maleStudents.some(s => s.nom === student.nom)) {
        distribution.orientationByGender.male.arts.count++;
      } else {
        distribution.orientationByGender.female.arts.count++;
      }
    }
  });

  // Calculer les pourcentages
  distribution.orientation.sciences.percentage = (distribution.orientation.sciences.count / total) * 100;
  distribution.orientation.arts.percentage = (distribution.orientation.arts.count / total) * 100;
  distribution.orientationByGender.male.sciences.percentage = (distribution.orientationByGender.male.sciences.count / maleStudents.length) * 100;
  distribution.orientationByGender.male.arts.percentage = (distribution.orientationByGender.male.arts.count / maleStudents.length) * 100;
  distribution.orientationByGender.female.sciences.percentage = (distribution.orientationByGender.female.sciences.count / femaleStudents.length) * 100;
  distribution.orientationByGender.female.arts.percentage = (distribution.orientationByGender.female.arts.count / femaleStudents.length) * 100;

  return {
    students: studentsWithOrientation,
    subjects,
    genderAnalysis,
    repeatAnalysis,
    classRanking,
    qualitativeIndicators,
    distribution,
    meta: {
      totalStudents: total,
      semester,
      level
    }
  };
}

// Fonction helper pour analyser un groupe de matières
function analyzeSubjectGroup(notes: number[], name: string, totalStudents: number): SubjectAnalysis {
  const present = notes.length;
  const mean = calculateMean(notes);
  const stdDev = calculateStdDev(notes);
  const cv = calculateCV(mean, stdDev);
  
  const successCount = notes.filter(n => n >= 10).length;
  const successRate = present > 0 ? (successCount / present) * 100 : 0;
  
  return {
    name,
    present,
    mean: mean || 0,
    stdDev: stdDev || 0,
    note: getPerformanceNote(mean, cv),
    successRate,
    successCount,
    categories: {
      "10 ≤": {
        count: successCount,
        percentage: successRate
      },
      "من 8 إلى 9.99": {
        count: notes.filter(n => n >= 8 && n < 10).length,
        percentage: present > 0 ? (notes.filter(n => n >= 8 && n < 10).length / present) * 100 : 0
      },
      "أقل من 08": {
        count: notes.filter(n => n < 8).length,
        percentage: present > 0 ? (notes.filter(n => n < 8).length / present) * 100 : 0
      }
    },
    cohesion: {
      percentage: cv || 0,
      note: getCohesionNote(cv)
    },
    quintiles: calculateQuintiles(notes),
    distribution: calculateDistribution(notes)
  };
}