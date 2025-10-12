// collegeAnalyse.ts - College Analysis with RTL Support
interface Eleve {
  numero: number;
  nom: string;
  sexe: 'ذكر' | 'أنثى';
  redoublement: boolean;
  classe: string;
  matieres: {
    [key: string]: number;
  };
  moyenne: number;
}

interface MatiereStats {
  nom: string;
  moyenne: number;
  tauxReussite: number;
  meilleurNote: number;
  pireNote: number;
  ecartType: number;
  coefficientVariation: number; // CV = (écart-type / moyenne) × 100
  distributionNotes: {
    moins8: number;
    entre8et10: number;
    plus10: number;
  };
  analyseParSexe: {
    garcons: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
    filles: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
  };
  analyseParRedoublement: {
    redoublants: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
    nonRedoublants: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
  };
  hasNotes: boolean; // Indicateur pour savoir si la matière a des notes
}

interface ClasseStats {
  nom: string;
  nombreEleves: number;
  moyenneGenerale: number;
  tauxReussite: number;
  tauxRedoublement: number;
  coefficientVariation: number;
  ecartType: number;
  distributionNotes: {
    moins8: number;
    entre8et10: number;
    plus10: number;
  };
  analyseParSexe: {
    garcons: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
    filles: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
  };
  analyseParRedoublement: {
    redoublants: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
    nonRedoublants: {
      moyenne: number;
      tauxReussite: number;
      nombre: number;
    };
  };
  classificationQualitative: {
    eminence: number; // ≥ 18
    felicitation: number; // 15-17.99
    encouragement: number; // 14-14.99
    tableauHonneur: number; // 12-13.99
    observation: number; // < 12
  };
  percentiles: {
    p20: number;
    p40: number;
    p60: number;
    p80: number;
    p100: number;
  };
}

interface GlobalReport {
  niveau: string;
  totalEleves: number;
  moyenneGenerale: number;
  tauxReussite: number;
  tauxRedoublement: number;
  repartitionSexe: {
    garcons: number;
    filles: number;
  };
  matieres: MatiereStats[];
  classes: ClasseStats[];
  elevesEnDifficulte: Eleve[];
  elevesExcellents: Eleve[];
  recommandations: string[];
  analyseGenerale: {
    coefficientVariationGlobal: number;
    ecartTypeGlobal: number;
    distributionGenerale: {
      moins8: number;
      entre8et10: number;
      plus10: number;
    };
    classificationQualitativeGenerale: {
      eminence: number;
      felicitation: number;
      encouragement: number;
      tableauHonneur: number;
      observation: number;
    };
    percentilesGeneraux: {
      p20: number;
      p40: number;
      p60: number;
      p80: number;
      p100: number;
    };
  };
  classementClasses: {
    nom: string;
    moyenne: number;
    rang: number;
  }[];
}

// Fonctions utilitaires pour les calculs statistiques
function calculerPercentiles(notes: number[]): { p20: number; p40: number; p60: number; p80: number; p100: number } {
  const sortedNotes = [...notes].sort((a, b) => a - b);
  const n = sortedNotes.length;
  
  const getPercentile = (p: number) => {
    const index = (p / 100) * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) return sortedNotes[lower];
    return sortedNotes[lower] * (1 - weight) + sortedNotes[upper] * weight;
  };
  
  return {
    p20: getPercentile(20),
    p40: getPercentile(40),
    p60: getPercentile(60),
    p80: getPercentile(80),
    p100: getPercentile(100)
  };
}

function calculerDistributionNotes(notes: number[]) {
  return {
    moins8: notes.filter(n => n < 8).length,
    entre8et10: notes.filter(n => n >= 8 && n < 10).length,
    plus10: notes.filter(n => n >= 10).length
  };
}

function calculerClassificationQualitative(notes: number[]) {
  return {
    eminence: notes.filter(n => n >= 18).length,
    felicitation: notes.filter(n => n >= 15 && n < 18).length,
    encouragement: notes.filter(n => n >= 14 && n < 15).length,
    tableauHonneur: notes.filter(n => n >= 12 && n < 14).length,
    observation: notes.filter(n => n < 12).length
  };
}

function analyserParSexe(eleves: Eleve[], matiere?: string) {
  const garcons = eleves.filter(e => e.sexe === 'ذكر');
  const filles = eleves.filter(e => e.sexe === 'أنثى');
  
  const analyserGroupe = (groupe: Eleve[]) => {
    const notes = matiere ? groupe.map(e => e.matieres[matiere] || 0).filter(n => n > 0) : groupe.map(e => e.moyenne);
    const moyenne = notes.length > 0 ? notes.reduce((sum, n) => sum + n, 0) / notes.length : 0;
    const tauxReussite = notes.length > 0 ? (notes.filter(n => n >= 10).length / notes.length) * 100 : 0;
    
    return {
      moyenne: Math.round(moyenne * 100) / 100,
      tauxReussite: Math.round(tauxReussite * 100) / 100,
      nombre: groupe.length
    };
  };
  
  return {
    garcons: analyserGroupe(garcons),
    filles: analyserGroupe(filles)
  };
}

function analyserParRedoublement(eleves: Eleve[], matiere?: string) {
  const redoublants = eleves.filter(e => e.redoublement);
  const nonRedoublants = eleves.filter(e => !e.redoublement);
  
  const analyserGroupe = (groupe: Eleve[]) => {
    const notes = matiere ? groupe.map(e => e.matieres[matiere] || 0).filter(n => n > 0) : groupe.map(e => e.moyenne);
    const moyenne = notes.length > 0 ? notes.reduce((sum, n) => sum + n, 0) / notes.length : 0;
    const tauxReussite = notes.length > 0 ? (notes.filter(n => n >= 10).length / notes.length) * 100 : 0;
    
    return {
      moyenne: Math.round(moyenne * 100) / 100,
      tauxReussite: Math.round(tauxReussite * 100) / 100,
      nombre: groupe.length
    };
  };
  
  return {
    redoublants: analyserGroupe(redoublants),
    nonRedoublants: analyserGroupe(nonRedoublants)
  };
}

export function analyseCollege(eleves: Eleve[]): GlobalReport {
  if (eleves.length === 0) {
    return {
      niveau: 'Inconnu',
      totalEleves: 0,
      moyenneGenerale: 0,
      tauxReussite: 0,
      tauxRedoublement: 0,
      repartitionSexe: { garcons: 0, filles: 0 },
      matieres: [],
      classes: [],
      elevesEnDifficulte: [],
      elevesExcellents: [],
      recommandations: []
    };
  }

  // Calculate basic statistics
  const totalEleves = eleves.length;
  const moyenneGenerale = eleves.reduce((sum, e) => sum + e.moyenne, 0) / totalEleves;
  const tauxReussite = (eleves.filter(e => e.moyenne >= 10).length / totalEleves) * 100;
  const tauxRedoublement = (eleves.filter(e => e.redoublement).length / totalEleves) * 100;
  
  // Gender distribution
  const repartitionSexe = {
    garcons: eleves.filter(e => e.sexe === 'ذكر').length,
    filles: eleves.filter(e => e.sexe === 'أنثى').length
  };

  // Subject analysis
  const allSubjects = new Set<string>();
  eleves.forEach(e => {
    Object.keys(e.matieres).forEach(matiere => allSubjects.add(matiere));
  });

  const matieres: MatiereStats[] = Array.from(allSubjects)
    .map(matiere => {
      const notes = eleves.map(e => e.matieres[matiere] || 0).filter(n => n > 0);
      const moyenne = notes.length > 0 ? notes.reduce((sum, n) => sum + n, 0) / notes.length : 0;
      const tauxReussite = (notes.filter(n => n >= 10).length / notes.length) * 100;
      const meilleurNote = notes.length > 0 ? Math.max(...notes) : 0;
      const pireNote = notes.length > 0 ? Math.min(...notes) : 0;
      const ecartType = notes.length > 0 ? Math.sqrt(notes.reduce((sum, n) => sum + Math.pow(n - moyenne, 2), 0) / notes.length) : 0;
      const coefficientVariation = moyenne > 0 ? (ecartType / moyenne) * 100 : 0;

      return {
        nom: matiere,
        moyenne: Math.round(moyenne * 100) / 100,
        tauxReussite: Math.round(tauxReussite * 100) / 100,
        meilleurNote,
        pireNote,
        ecartType: Math.round(ecartType * 100) / 100,
        coefficientVariation: Math.round(coefficientVariation * 100) / 100,
        distributionNotes: calculerDistributionNotes(notes),
        analyseParSexe: analyserParSexe(eleves, matiere),
        analyseParRedoublement: analyserParRedoublement(eleves, matiere),
        hasNotes: notes.length > 0 // Ajouter un indicateur pour savoir si la matière a des notes
      };
    })
    .filter(matiere => matiere.hasNotes); // Filtrer seulement les matières avec des notes

  // Class analysis
  const classesMap = new Map<string, Eleve[]>();
  eleves.forEach(e => {
    if (!classesMap.has(e.classe)) {
      classesMap.set(e.classe, []);
    }
    classesMap.get(e.classe)!.push(e);
  });

  const classes: ClasseStats[] = Array.from(classesMap.entries()).map(([nom, elevesClasse]) => {
    const notes = elevesClasse.map(e => e.moyenne);
    const moyenneGenerale = elevesClasse.reduce((sum, e) => sum + e.moyenne, 0) / elevesClasse.length;
    const tauxReussite = (elevesClasse.filter(e => e.moyenne >= 10).length / elevesClasse.length) * 100;
    const tauxRedoublement = (elevesClasse.filter(e => e.redoublement).length / elevesClasse.length) * 100;
    const ecartType = Math.sqrt(notes.reduce((sum, n) => sum + Math.pow(n - moyenneGenerale, 2), 0) / notes.length);
    const coefficientVariation = moyenneGenerale > 0 ? (ecartType / moyenneGenerale) * 100 : 0;

    return {
      nom,
      nombreEleves: elevesClasse.length,
      moyenneGenerale: Math.round(moyenneGenerale * 100) / 100,
      tauxReussite: Math.round(tauxReussite * 100) / 100,
      tauxRedoublement: Math.round(tauxRedoublement * 100) / 100,
      coefficientVariation: Math.round(coefficientVariation * 100) / 100,
      ecartType: Math.round(ecartType * 100) / 100,
      distributionNotes: calculerDistributionNotes(notes),
      analyseParSexe: analyserParSexe(elevesClasse),
      analyseParRedoublement: analyserParRedoublement(elevesClasse),
      classificationQualitative: calculerClassificationQualitative(notes),
      percentiles: calculerPercentiles(notes)
    };
  });

  // Students in difficulty (moyenne < 10)
  const elevesEnDifficulte = eleves
    .filter(e => e.moyenne < 10)
    .sort((a, b) => a.moyenne - b.moyenne);

  // Excellent students (moyenne >= 16)
  const elevesExcellents = eleves
    .filter(e => e.moyenne >= 16)
    .sort((a, b) => b.moyenne - a.moyenne);

  // Generate recommendations in Arabic
  const recommandations: string[] = [];
  
  if (tauxReussite < 70) {
    recommandations.push('تحسين معدل النجاح يتطلب تدابير إضافية للدعم التربوي');
  }
  
  if (tauxRedoublement > 20) {
    recommandations.push('معدل الإعادة مرتفع، ينصح بمراجعة استراتيجيات التدريس');
  }
  
  const matiereFaible = matieres.find(m => m.tauxReussite < 60);
  if (matiereFaible) {
    recommandations.push(`مادة ${matiereFaible.nom} تحتاج إلى دعم خاص (معدل النجاح: ${matiereFaible.tauxReussite}%)`);
  }
  
  if (elevesEnDifficulte.length > totalEleves * 0.3) {
    recommandations.push('عدد كبير من التلاميذ في صعوبة، ينصح ببرامج دعم مكثفة');
  }

  // Additional RTL-specific recommendations
  if (repartitionSexe.filles > repartitionSexe.garcons * 1.5) {
    recommandations.push('يُنصح بمراجعة استراتيجيات التدريس لضمان المساواة بين الجنسين');
  }

  const classeFaible = classes.find(c => c.moyenneGenerale < 8);
  if (classeFaible) {
    recommandations.push(`قسم ${classeFaible.nom} يحتاج إلى دعم خاص (المعدل: ${classeFaible.moyenneGenerale})`);
  }

  // Analyse générale
  const toutesNotes = eleves.map(e => e.moyenne);
  const ecartTypeGlobal = Math.sqrt(toutesNotes.reduce((sum, n) => sum + Math.pow(n - moyenneGenerale, 2), 0) / toutesNotes.length);
  const coefficientVariationGlobal = moyenneGenerale > 0 ? (ecartTypeGlobal / moyenneGenerale) * 100 : 0;

  // Classement des classes
  const classementClasses = classes
    .sort((a, b) => b.moyenneGenerale - a.moyenneGenerale)
    .map((classe, index) => ({
      nom: classe.nom,
      moyenne: classe.moyenneGenerale,
      rang: index + 1
    }));

  return {
    niveau: '4AF', // This should be detected from the Excel file
    totalEleves,
    moyenneGenerale: Math.round(moyenneGenerale * 100) / 100,
    tauxReussite: Math.round(tauxReussite * 100) / 100,
    tauxRedoublement: Math.round(tauxRedoublement * 100) / 100,
    repartitionSexe,
    matieres: matieres.sort((a, b) => b.moyenne - a.moyenne),
    classes: classes.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale),
    elevesEnDifficulte,
    elevesExcellents,
    recommandations,
    analyseGenerale: {
      coefficientVariationGlobal: Math.round(coefficientVariationGlobal * 100) / 100,
      ecartTypeGlobal: Math.round(ecartTypeGlobal * 100) / 100,
      distributionGenerale: calculerDistributionNotes(toutesNotes),
      classificationQualitativeGenerale: calculerClassificationQualitative(toutesNotes),
      percentilesGeneraux: calculerPercentiles(toutesNotes)
    },
    classementClasses
  };
}