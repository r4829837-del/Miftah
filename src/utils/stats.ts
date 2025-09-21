export interface Eleve {
  numero: number;
  nom: string;
  sexe: 'ذكر' | 'أنثى';
  redoublement: boolean;
  classe: string;
  matieres: { [key: string]: number };
  moyenne: number;
}

type SubjectKey =
  | 'arabe' | 'amazigh' | 'francais' | 'anglais' | 'islamique' | 'civique' | 'histGeo'
  | 'math' | 'svt' | 'physique' | 'informatique' | 'arts' | 'musique' | 'sport' | 'moyenneSem1';

const SUBJECTS: SubjectKey[] = [
  'arabe','amazigh','francais','anglais','islamique','civique','histGeo',
  'math','svt','physique','informatique','arts','musique','sport','moyenneSem1'
];

// Map Arabic subject labels used in extractStudents() to our SubjectKey
const AR_TO_KEY: Record<string, SubjectKey> = {
  'عربية': 'arabe',
  'أمازيغية': 'amazigh',
  'فرنسية': 'francais',
  'إنجليزية': 'anglais',
  'إسلامية': 'islamique',
  'مدنية': 'civique',
  'تاريخ': 'histGeo',
  'رياضيات': 'math',
  'طبيعة': 'svt',
  'فيزياء': 'physique',
  'إعلامية': 'informatique',
  'تشكيلية': 'arts',
  'موسيقية': 'musique',
  'رياضة': 'sport'
};

function round2(v: number): number { return Number.isFinite(v) ? Math.round(v * 100) / 100 : NaN; }
function round1(v: number): number { return Number.isFinite(v) ? Math.round(v * 10) / 10 : NaN; }

function stdPopulation(values: number[]): number {
  const n = values.length;
  if (n === 0) return NaN;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, x) => acc + (x - mean) * (x - mean), 0) / n;
  return Math.sqrt(variance);
}

function computeBins(values: number[]) {
  const n = values.length;
  const pct = (c: number) => (n > 0 ? round1((c / n) * 100) : 0);
  const inRange = (lo: number, hi: number) => values.filter(v => v >= lo && v <= hi).length;
  const tranches = {
    '0-8.99': { count: inRange(0, 8.99), percent: pct(inRange(0, 8.99)) },
    '9-9.99': { count: inRange(9, 9.99), percent: pct(inRange(9, 9.99)) },
    '10-11.99': { count: inRange(10, 11.99), percent: pct(inRange(10, 11.99)) },
    '12-13.99': { count: inRange(12, 13.99), percent: pct(inRange(12, 13.99)) },
    '14-15.99': { count: inRange(14, 15.99), percent: pct(inRange(14, 15.99)) },
    '16-17.99': { count: inRange(16, 17.99), percent: pct(inRange(16, 17.99)) },
    '18-20': { count: inRange(18, 20), percent: pct(inRange(18, 20)) }
  } as const;
  const groupes = {
    'G1(0-8.99)': { count: tranches['0-8.99'].count, percent: tranches['0-8.99'].percent },
    'G2(9-9.99)': { count: tranches['9-9.99'].count, percent: tranches['9-9.99'].percent },
    'G3(10-11.99)': { count: tranches['10-11.99'].count, percent: tranches['10-11.99'].percent },
    'G4(12-13.99)': { count: tranches['12-13.99'].count, percent: tranches['12-13.99'].percent },
    'G5(≥14)': { count: tranches['14-15.99'].count + tranches['16-17.99'].count + tranches['18-20'].count, percent: round1(((tranches['14-15.99'].count + tranches['16-17.99'].count + tranches['18-20'].count) / (n || 1)) * 100) }
  } as const;
  return { tranches, groupes };
}

function computeSubjectStats(valuesAll: (number | null | undefined)[]) {
  const values = valuesAll.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
  const present = values.length;
  const mean = present ? round2(values.reduce((a, b) => a + b, 0) / present) : NaN;
  const std = present ? round2(stdPopulation(values)) : NaN;
  const cv = present && mean ? round1((std / mean) * 100) : NaN;
  const min = present ? round2(Math.min(...values)) : NaN;
  const max = present ? round2(Math.max(...values)) : NaN;
  const nb_ge10 = values.filter(v => v >= 10).length;
  const nb_8_9 = values.filter(v => v >= 8 && v < 10).length;
  const nb_lt8 = values.filter(v => v < 8).length;
  const pc_ge10 = present ? round1((nb_ge10 / present) * 100) : 0;
  const pc_8_9 = present ? round1((nb_8_9 / present) * 100) : 0;
  const pc_lt8 = present ? round1((nb_lt8 / present) * 100) : 0;
  const { tranches, groupes } = computeBins(values);
  return { present, mean, std, cv, min, max, nb_ge10, pc_ge10, nb_8_9, pc_8_9, nb_lt8, pc_lt8, tranches, groupes };
}

function mapStudentToRow(eleve: Eleve) {
  const row: Record<SubjectKey, number | null> = {
    arabe: null, amazigh: null, francais: null, anglais: null, islamique: null, civique: null, histGeo: null,
    math: null, svt: null, physique: null, informatique: null, arts: null, musique: null, sport: null, moyenneSem1: null
  };
  Object.entries(eleve.matieres || {}).forEach(([k, v]) => {
    const key = AR_TO_KEY[k];
    if (key) row[key] = typeof v === 'number' ? v : Number(v);
  });
  row.moyenneSem1 = typeof eleve.moyenne === 'number' ? eleve.moyenne : Number(eleve.moyenne);
  return row;
}

export function computeForGroupTS(eleves: Eleve[], groupName: string) {
  const rows = eleves.map(mapStudentToRow);
  const subjects: Record<string, any> = {};
  SUBJECTS.forEach(subj => {
    const col = rows.map(r => (r[subj] == null ? null : Number(r[subj])));
    subjects[subj] = computeSubjectStats(col);
  });
  return { group: groupName, subjects };
}

function appreciation(mean: number | undefined | null): string {
  const v = typeof mean === 'number' ? mean : NaN;
  if (Number.isNaN(v)) return '';
  if (v >= 16) return 'Excellent';
  if (v >= 14) return 'Très bien';
  if (v >= 12) return 'Bien';
  if (v >= 10) return 'Assez bien';
  return 'Insuffisant';
}

function byClass(eleves: Eleve[]) {
  const groups: Record<string, Eleve[]> = {};
  eleves.forEach(e => {
    const key = (e.classe || '').toString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  const result: Record<string, any> = {};
  const classMeans: { classe: string; mean: number }[] = [];
  Object.entries(groups).forEach(([classe, list]) => {
    const rows = list.map(mapStudentToRow);
    const means: Record<string, number> = {} as any;
    SUBJECTS.forEach(subj => {
      const vals = rows.map(r => (r[subj] == null ? NaN : Number(r[subj]))).filter(v => !Number.isNaN(v));
      const m = vals.length ? round2(vals.reduce((a, b) => a + b, 0) / vals.length) : NaN;
      means[subj] = m;
    });
    result[classe] = {
      means,
      rank: 0,
      degree: 0,
      appreciation: appreciation(means['moyenneSem1'])
    };
    classMeans.push({ classe, mean: typeof means['moyenneSem1'] === 'number' ? means['moyenneSem1'] : NaN });
  });
  // Ranking by moyenneSem1 desc
  const sorted = classMeans.slice().sort((a, b) => (isNaN(b.mean) ? -1 : (isNaN(a.mean) ? 1 : b.mean - a.mean)));
  sorted.forEach((item, index) => {
    const rank = index + 1;
    const degree = Math.max(10, Math.min(100, 100 - (rank - 1) * 10));
    if (result[item.classe]) {
      result[item.classe].rank = rank;
      result[item.classe].degree = degree;
    }
  });
  return result;
}

function studentsAggregates(eleves: Eleve[]) {
  const total = eleves.length;
  const maleCount = eleves.filter(e => e.sexe === 'ذكر').length;
  const femaleCount = eleves.filter(e => e.sexe === 'أنثى').length;
  const repeatCount = eleves.filter(e => e.redoublement).length;
  const noRepeatCount = total - repeatCount;
  const pct = (c: number) => (total > 0 ? round1((c / total) * 100) : 0);
  return {
    sex: {
      male: { count: maleCount, percent: pct(maleCount) },
      female: { count: femaleCount, percent: pct(femaleCount) },
      total: { count: total, percent: pct(total) }
    },
    repeat: {
      repeat: { count: repeatCount, percent: pct(repeatCount) },
      no_repeat: { count: noRepeatCount, percent: pct(noRepeatCount) },
      total: { count: total, percent: pct(total) }
    },
    branch: {
      st: { count: 0, percent: 0 },
      letters: { count: 0, percent: 0 },
      total: { count: total, percent: pct(total) }
    },
    by_sex: {
      male: { repeat: { count: 0, percent: 0 }, no_repeat: { count: 0, percent: 0 }, st: { count: 0, percent: 0 }, letters: { count: 0, percent: 0 } },
      female: { repeat: { count: 0, percent: 0 }, no_repeat: { count: 0, percent: 0 }, st: { count: 0, percent: 0 }, letters: { count: 0, percent: 0 } }
    }
  };
}

function mentions(eleves: Eleve[]) {
  const s = eleves.map(e => e.moyenne).filter(v => typeof v === 'number' && !Number.isNaN(v));
  const n = s.length;
  const pct = (c: number) => (n > 0 ? round1((c / n) * 100) : 0);
  const excellence = s.filter(v => v >= 18 && v <= 20).length;
  const felicitations = s.filter(v => v >= 15 && v <= 17.99).length;
  const encouragements = s.filter(v => v >= 14 && v <= 14.99).length;
  const tableau_honneur = s.filter(v => v >= 12 && v <= 13.99).length;
  const observation = s.filter(v => v < 12).length;
  return {
    excellence: { count: excellence, percent: pct(excellence) },
    felicitations: { count: felicitations, percent: pct(felicitations) },
    encouragements: { count: encouragements, percent: pct(encouragements) },
    tableau_honneur: { count: tableau_honneur, percent: pct(tableau_honneur) },
    observation: { count: observation, percent: pct(observation) }
  };
}

export function buildFinalJsonTS(eleves: Eleve[]) {
  const overall = computeForGroupTS(eleves, 'overall');
  const male = computeForGroupTS(eleves.filter(e => e.sexe === 'ذكر'), 'male');
  const female = computeForGroupTS(eleves.filter(e => e.sexe === 'أنثى'), 'female');
  const repeat = computeForGroupTS(eleves.filter(e => e.redoublement), 'repeat');
  const no_repeat = computeForGroupTS(eleves.filter(e => !e.redoublement), 'no_repeat');
  const by_class = byClass(eleves);
  const students = studentsAggregates(eleves);
  const m = mentions(eleves);
  return { overall, male, female, repeat, no_repeat, by_class, students, mentions: m };
}

