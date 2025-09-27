import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCycle } from '../contexts/CycleContext';
import { getStudents, getAnalysisDB } from '../lib/storage';
import { BarChart3, RefreshCw } from 'lucide-react';

const Tabs: React.FC = () => {
  const location = useLocation();
  const { currentCycle } = useCycle();
  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="mt-4 mb-6 flex flex-wrap gap-2" dir="rtl">
      <Link to="/analysis" className={`px-3 py-1.5 rounded ${isActive('/analysis') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الأول</Link>
      <Link to="/analysis/sem2" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem2') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثاني</Link>
      <Link to="/analysis/sem3" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem3') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثالث</Link>
      <Link to="/analysis/compare" className={`px-3 py-1.5 rounded ${isActive('/analysis/compare') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>التحليل السنوي</Link>
      {currentCycle === 'متوسط' && (
        <Link to="/analysis/bem" className={`px-3 py-1.5 rounded ${isActive('/analysis/bem') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>تحليل  ش.ت.م</Link>
      )}
    </div>
  );
};

export default function AnalysisResultsCompare() {
  const { currentCycle } = useCycle();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sem1Students, setSem1Students] = useState<any[]>([]);
  const [sem2Students, setSem2Students] = useState<any[]>([]);
  const [sem3Students, setSem3Students] = useState<any[]>([]);
  const [annualPage, setAnnualPage] = useState<number>(1);
  const [annualPageSize] = useState<number>(10);

  // Vérifier si le cycle actuel est collège (متوسط)
  const isCollegeCycle = currentCycle === 'متوسط';

  const handleReset = async () => {
    const ok = window.confirm('هل تريد تهيئة بيانات التحليل السنوي لهذه المرحلة؟ سيتم حذف بيانات الفصول المحفوظة لهذه المرحلة فقط.');
    if (!ok) return;
    try {
      const db = getAnalysisDB(currentCycle);
      await db.clear();
      for (const sem of [1,2,3]) {
        try { localStorage.removeItem(`analysis_cache_${currentCycle}_sem${sem}`); } catch (_) {}
      }
      setSem1Students([]);
      setSem2Students([]);
      setSem3Students([]);
    } catch (e) {
      console.error('Failed to reset annual analysis data', e);
      alert('تعذر تهيئة البيانات. حاول مرة أخرى.');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Load each semester's persisted dataset separately
        const db = getAnalysisDB(currentCycle);
        let s1: any[] = [];
        let s2: any[] = [];
        let s3: any[] = [];
        await db.iterate((value: any) => {
          if (value && Array.isArray(value.students) && Number.isFinite(Number(value.semester))) {
            if (value.semester === 1) s1 = value.students;
            if (value.semester === 2) s2 = value.students;
            if (value.semester === 3) s3 = value.students;
          }
        });
        // Set state
        if (mounted) {
          setSem1Students(Array.isArray(s1) ? s1 : []);
          setSem2Students(Array.isArray(s2) ? s2 : []);
          setSem3Students(Array.isArray(s3) ? s3 : []);
        }
        // No persisted datasets at all: fallback to generic students for visibility
        if (mounted && s1.length === 0 && s2.length === 0 && s3.length === 0) {
          const data = await getStudents(currentCycle);
          setSem1Students(Array.isArray(data) ? data : []);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentCycle]);

  const metrics = useMemo(() => {
    const parseNum = (v: any): number | null => {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return typeof n === 'number' && isFinite(n) ? n : null;
    };

    // Extract per-semester average from the specific semester dataset shape
    const getValueFromRecord = (s: any, sem: 1 | 2 | 3): number | null => {
      const direct = parseNum(s[`moyenneSem${sem}`]);
      if (direct != null) return direct;
      const generic = parseNum(s.moyenne);
      if (generic != null) return generic;
      const alt = parseNum(s.moyenneGenerale);
      if (alt != null) return alt;
      return null;
    };

    const computeForSem = (sem: 1 | 2 | 3) => {
      let grades: number[] = [];
      const arr = sem === 1 ? sem1Students : sem === 2 ? sem2Students : sem3Students;
      (arr || []).forEach(s => {
        const v = getValueFromRecord(s, sem);
        if (v != null) grades.push(v);
      });
      // Fallback to cache if no grades loaded via DB
      if (grades.length === 0) {
        try {
          const cacheKey = `analysis_cache_${currentCycle}_sem${sem}`;
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) grades = arr.filter((n: any) => typeof n === 'number' && isFinite(n));
          }
        } catch (_) {}
      }
      const present = grades.length;
      const mean = present ? (grades.reduce((a, b) => a + b, 0) / present) : null;
      const success = present ? ((grades.filter(g => g >= 10).length / present) * 100) : null;
      const std = present && mean != null ? (
        Math.sqrt(grades.reduce((acc, g) => acc + Math.pow(g - mean, 2), 0) / present)
      ) : null;
      return { present, mean, success, std };
    };

    const s1 = computeForSem(1);
    const s2 = computeForSem(2);
    const s3 = computeForSem(3);

    // Annual per-student: average across semesters, but ONLY for students present in ALL available semesters
    const availableSems = [1,2,3].filter(sem => (computeForSem(sem as 1|2|3).present ?? 0) > 0) as (1|2|3)[];
    const annualGrades: number[] = [];
    if (availableSems.length >= 2) {
      // Match students by normalized name across semester datasets
      const norm = (v: any) => String(v || '').replace(/[\u0617-\u061A\u064B-\u0652]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, '').trim();
      const toMap = (arr: any[]) => {
        const m = new Map<string, any>();
        (arr || []).forEach(s => {
          const name = s['اللقب و الاسم'] || s.nom || s.name;
          if (name) m.set(norm(name), s);
        });
        return m;
      };
      const maps: Record<1|2|3, Map<string, any>> = {
        1: toMap(sem1Students),
        2: toMap(sem2Students),
        3: toMap(sem3Students)
      };
      const keys = new Set<string>();
      availableSems.forEach(sem => { maps[sem].forEach((_, k) => keys.add(k)); });
      keys.forEach(k => {
        const vals = availableSems.map(sem => getValueFromRecord(maps[sem].get(k), sem));
        if (vals.every(v => v != null)) {
          const nums = vals as number[];
          annualGrades.push(nums.reduce((a, b) => a + b, 0) / nums.length);
        }
      });
    }
    const annualPresent = annualGrades.length;
    const availableSemesters = availableSems.length;
    // If only one semester is available, annual metrics should be hidden (null)
    const annualMean = (annualPresent && availableSemesters >= 2) ? (annualGrades.reduce((a, b) => a + b, 0) / annualPresent) : null;
    const annualSuccess = (annualPresent && availableSemesters >= 2) ? ((annualGrades.filter(g => g >= 10).length / annualPresent) * 100) : null;
    const annualStd = (annualPresent && annualMean != null && availableSemesters >= 2) ? (
      Math.sqrt(annualGrades.reduce((acc, g) => acc + Math.pow(g - annualMean, 2), 0) / annualPresent)
    ) : null;

    // Simple annual evaluation label
    const evaluationLabel = (() => {
      if (availableSemesters < 2) return 'لا توجد بيانات كافية لحساب تقييم نهاية السنة (يتطلب فصلين على الأقل)';
      if (annualMean == null) return 'لا توجد بيانات كافية';
      if (annualMean >= 18) return 'أداء ممتاز في نهاية السنة';
      if (annualMean >= 14) return 'أداء جيد جداً في نهاية السنة';
      if (annualMean >= 12) return 'أداء جيد في نهاية السنة';
      if (annualMean >= 10) return 'أداء مقبول في نهاية السنة';
      return 'أداء ضعيف في نهاية السنة';
    })();

    return { s1, s2, s3, annual: { present: annualPresent, mean: annualMean, success: annualSuccess, std: annualStd, label: evaluationLabel } };
  }, [currentCycle, sem1Students, sem2Students, sem3Students]);

  // Annual derived analysis: per-student annual moyenne and per-subject stats (overall and by gender)
  const annualDetails = useMemo(() => {
    const norm = (v: any) => String(v || '')
      .replace(/[\u0617-\u061A\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, '')
      .trim();

    const toMap = (arr: any[]) => {
      const m = new Map<string, any>();
      (arr || []).forEach(s => {
        const name = s['اللقب و الاسم'] || s.nom || s.name;
        if (name) m.set(norm(name), s);
      });
      return m;
    };

    const maps: Record<1|2|3, Map<string, any>> = {
      1: toMap(sem1Students),
      2: toMap(sem2Students),
      3: toMap(sem3Students)
    };

    const allKeys = new Set<string>();
    (Object.values(maps) as Map<string, any>[]).forEach(mp => mp.forEach((_, k) => allKeys.add(k)));

    const parseNum = (v: any): number | null => {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return typeof n === 'number' && isFinite(n) ? n : null;
    };

    const getSemMoy = (rec: any, sem: 1|2|3): number | null => {
      if (!rec) return null;
      return parseNum(rec[`moyenneSem${sem}`]) ?? parseNum(rec.moyenne) ?? parseNum(rec.moyenneGenerale);
    };

    // Subject definitions with Arabic short labels used in imports
    const subjectDefs: { key: string; variants: string[]; label: string }[] = [
      { key: 'arabe', variants: ['اللغة العربية','عربية','arabe'], label: 'اللغة العربية' },
      { key: 'amazigh', variants: ['اللغة اﻷمازيغية','أمازيغية','amazigh'], label: 'اللغة اﻷمازيغية' },
      { key: 'francais', variants: ['اللغة الفرنسية','فرنسية','francais'], label: 'اللغة الفرنسية' },
      { key: 'anglais', variants: ['اللغة الإنجليزية','إنجليزية','anglais'], label: 'اللغة الإنجليزية' },
      { key: 'islamique', variants: ['التربية الإسلامية','إسلامية','islamique'], label: 'التربية الإسلامية' },
      { key: 'civique', variants: ['التربية المدنية','مدنية','civique'], label: 'التربية المدنية' },
      { key: 'histGeo', variants: ['التاريخ و الجغرافيا','التاريخ والجغرافيا','تاريخ','جغرافيا','histGeo'], label: 'التاريخ و الجغرافيا' },
      { key: 'math', variants: ['الرياضيات','رياضيات','math'], label: 'الرياضيات' },
      { key: 'physique', variants: ['ع الفيزيائية والتكنولوجيا','العلوم الفيزيائية و التكنولوجيا','فيزياء','physique'], label: 'ع الفيزيائية والتكنولوجيا' },
      { key: 'svt', variants: ['ع الطبيعة و الحياة','العلوم الطبيعية و الحياة','طبيعة','svt'], label: 'ع الطبيعة و الحياة' },
      { key: 'informatique', variants: ['المعلوماتية','إعلامية','إعلام آلي','informatique'], label: 'المعلوماتية' },
      { key: 'arts', variants: ['التربية التشكيلية','تشكيلية','arts'], label: 'التربية التشكيلية' },
      { key: 'musique', variants: ['التربية الموسيقية','موسيقية','musique'], label: 'التربية الموسيقية' },
      { key: 'sport', variants: ['ت البدنية و الرياضية','التربية البدنية و الرياضية','رياضة','sport'], label: 'التربية البدنية و الرياضية' }
    ];

    const findSubjectVal = (rec: any, variants: string[]): number | null => {
      if (!rec) return null;
      // Check matieres map
      if (rec.matieres && typeof rec.matieres === 'object') {
        for (const v of variants) {
          const val = rec.matieres[v];
          const num = parseNum(val);
          if (num != null) return num;
        }
      }
      // Check direct fields
      for (const v of variants) {
        const val = rec[v];
        const num = parseNum(val);
        if (num != null) return num;
      }
      return null;
    };

    // Per-student annual moyenne and per-subject annual values
    type PerStudent = { name: string; gender: string; annualAvg: number };
    const perStudent: PerStudent[] = [];

    const maleSubjectVals: Record<string, number[]> = {};
    const femaleSubjectVals: Record<string, number[]> = {};
    const allSubjectVals: Record<string, number[]> = {};

    const getGender = (rec: any): string => {
      const g = rec?.sexe || rec?.gender;
      if (g === 'male' || g === 'ذكر') return 'ذكر';
      if (g === 'female' || g === 'أنثى') return 'أنثى';
      return 'غير محدد';
    };

    allKeys.forEach(k => {
      const r1 = maps[1].get(k); const r2 = maps[2].get(k); const r3 = maps[3].get(k);
      const vals = [getSemMoy(r1,1), getSemMoy(r2,2), getSemMoy(r3,3)].filter((v): v is number => v != null);
      if (vals.length >= 1) {
        const annualAvg = vals.reduce((a,b)=>a+b,0) / vals.length;
        const displayName = (r3?.['اللقب و الاسم'] || r2?.['اللقب و الاسم'] || r1?.['اللقب و الاسم'] || r3?.nom || r2?.nom || r1?.nom || '');
        const g = getGender(r3 || r2 || r1);
        perStudent.push({ name: String(displayName).trim(), gender: g, annualAvg: Math.round(annualAvg*100)/100 });
      }

      // Per-subject annual (average across available semesters for this student)
      subjectDefs.forEach(sd => {
        const sVals: number[] = [];
        const v1 = findSubjectVal(r1, sd.variants); if (v1 != null) sVals.push(v1);
        const v2 = findSubjectVal(r2, sd.variants); if (v2 != null) sVals.push(v2);
        const v3 = findSubjectVal(r3, sd.variants); if (v3 != null) sVals.push(v3);
        if (sVals.length) {
          const avg = sVals.reduce((a,b)=>a+b,0) / sVals.length;
          (allSubjectVals[sd.label] ||= []).push(avg);
          const gender = getGender(r3 || r2 || r1);
          if (gender === 'ذكر') (maleSubjectVals[sd.label] ||= []).push(avg);
          else if (gender === 'أنثى') (femaleSubjectVals[sd.label] ||= []).push(avg);
        }
      });
    });

    const toStats = (arr: number[]) => {
      const n = arr.length; if (!n) return { present: 0, mean: null as number|null, std: null as number|null, success: null as number|null };
      const mean = arr.reduce((a,b)=>a+b,0)/n;
      const variance = arr.reduce((acc,x)=>acc+Math.pow(x-mean,2),0)/n;
      const std = Math.sqrt(variance);
      const success = (arr.filter(v=>v>=10).length / n) * 100;
      return { present:n, mean, std, success };
    };

    const subjectStats = subjectDefs.map(sd => {
      const overall = toStats(allSubjectVals[sd.label] || []);
      const male = toStats(maleSubjectVals[sd.label] || []);
      const female = toStats(femaleSubjectVals[sd.label] || []);
      return { label: sd.label, overall, male, female };
    });

    // Sort per-student by annualAvg desc
    perStudent.sort((a,b)=>b.annualAvg - a.annualAvg);

    return { perStudent, subjectStats };
  }, [sem1Students, sem2Students, sem3Students]);

  // Prepare annual per-student list: cap to first 65 students
  const annualMax = 65;
  const annualList = useMemo(() => annualDetails.perStudent.slice(0, annualMax), [annualDetails.perStudent]);
  // Pagination for annual per-student table
  const totalAnnual = annualList.length;
  const totalAnnualPages = Math.max(1, Math.ceil(totalAnnual / annualPageSize));
  useEffect(() => {
    // Reset or clamp page when data changes
    if (annualPage > totalAnnualPages) setAnnualPage(1);
  }, [totalAnnualPages]);
  const currentAnnualPageItems = useMemo(() => {
    const startIndex = (annualPage - 1) * annualPageSize;
    const endIndex = startIndex + annualPageSize;
    return annualList.slice(startIndex, endIndex);
  }, [annualList, annualPage, annualPageSize]);
  const annualVisiblePages = useMemo(() => {
    const maxVisible = 7;
    if (totalAnnualPages <= maxVisible) {
      return Array.from({ length: totalAnnualPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, annualPage - half);
    let end = start + maxVisible - 1;
    if (end > totalAnnualPages) {
      end = totalAnnualPages;
      start = end - maxVisible + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [annualPage, totalAnnualPages]);

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtitle ? <div className="text-xs text-gray-500 mt-1">{subtitle}</div> : null}
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">التحليل السنوي - {currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}</h1>
            <p className="text-blue-100">تحليل إجمالي لأداء الفصول الثلاثة وتقييم نهاية السنة</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-red-50 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200 hover:shadow">
              <RefreshCw className="w-4 h-4" />
              تهيئة البيانات
            </button>
            <BarChart3 className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>
      <Tabs />

      {/* Vérifier si c'est le cycle collège */}
      {!isCollegeCycle ? (
        <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-700">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">التحليل السنوي غير متوفر</h2>
          <p className="text-lg text-gray-600 mb-6">
            التحليل السنوي متوفر فقط لمرحلة التعليم المتوسط (المتوسط)
          </p>
          <p className="text-sm text-gray-500">
            للوصول إلى التحليل السنوي، يرجى التبديل إلى دورة التعليم المتوسط من إعدادات النظام
          </p>
        </div>
      ) : (
        <>
      {isLoading ? (
        <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-600">جاري تحميل البيانات...</div>
      ) : (
        <>
          {/* Always show cards and table structure */}
          <>
          {/* Available semesters indicator */}
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-700 mb-2 font-semibold">الفصول المتوفرة:</div>
            <div className="flex flex-wrap gap-2">
              {(metrics.s1.present ?? 0) > 0 && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">الفصل الأول</span>
              )}
              {(metrics.s2.present ?? 0) > 0 && (
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">الفصل الثاني</span>
              )}
              {(metrics.s3.present ?? 0) > 0 && (
                <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 border border-orange-200">الفصل الثالث</span>
              )}
              {(metrics.s1.present ?? 0) === 0 && (metrics.s2.present ?? 0) === 0 && (metrics.s3.present ?? 0) === 0 && (
                <span className="text-sm text-gray-500">لا توجد بيانات للفصول بعد</span>
              )}
            </div>
          </div>

          {/* Semester summaries + annual mean */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* الفصل الأول - Couleur bleue améliorée */}
            <div className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-2 border-blue-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-blue-900">الفصل الأول</h3>
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">ف1</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">المعدل العام</div>
                  <div className="text-lg font-bold text-blue-900">{metrics.s1.mean != null ? metrics.s1.mean.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">نسبة النجاح</div>
                  <div className="text-lg font-bold text-blue-900">{metrics.s1.success != null ? (Math.round(metrics.s1.success * 10) / 10).toFixed(1) + '%' : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">المنحرف المعياري</div>
                  <div className="text-lg font-bold text-blue-900">{metrics.s1.std != null ? metrics.s1.std.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-blue-600 font-medium mb-1">عدد التلاميذ</div>
                  <div className="text-lg font-bold text-blue-900">{metrics.s1.present ?? '—'}</div>
                </div>
              </div>
            </div>
            
            {/* الفصل الثاني - Couleur verte améliorée */}
            <div className="relative bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-2 border-green-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-green-900">الفصل الثاني</h3>
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">ف2</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">المعدل العام</div>
                  <div className="text-lg font-bold text-green-900">{metrics.s2.mean != null ? metrics.s2.mean.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">نسبة النجاح</div>
                  <div className="text-lg font-bold text-green-900">{metrics.s2.success != null ? (Math.round(metrics.s2.success * 10) / 10).toFixed(1) + '%' : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">المنحرف المعياري</div>
                  <div className="text-lg font-bold text-green-900">{metrics.s2.std != null ? metrics.s2.std.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-medium mb-1">عدد التلاميذ</div>
                  <div className="text-lg font-bold text-green-900">{metrics.s2.present ?? '—'}</div>
                </div>
              </div>
            </div>
            
            {/* الفصل الثالث - Couleur orange améliorée */}
            <div className="relative bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-2 border-orange-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-orange-900">الفصل الثالث</h3>
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">ف3</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                  <div className="text-xs text-orange-600 font-medium mb-1">المعدل العام</div>
                  <div className="text-lg font-bold text-orange-900">{metrics.s3.mean != null ? metrics.s3.mean.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                  <div className="text-xs text-orange-600 font-medium mb-1">نسبة النجاح</div>
                  <div className="text-lg font-bold text-orange-900">{metrics.s3.success != null ? (Math.round(metrics.s3.success * 10) / 10).toFixed(1) + '%' : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                  <div className="text-xs text-orange-600 font-medium mb-1">المنحرف المعياري</div>
                  <div className="text-lg font-bold text-orange-900">{metrics.s3.std != null ? metrics.s3.std.toFixed(2) : '—'}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-orange-200">
                  <div className="text-xs text-orange-600 font-medium mb-1">عدد التلاميذ</div>
                  <div className="text-lg font-bold text-orange-900">{metrics.s3.present ?? '—'}</div>
                </div>
              </div>
            </div>
            
            {/* المعدل السنوي العام - Couleur violette améliorée */}
            <div className="relative bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-2 border-purple-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900">المعدل السنوي العام</h3>
                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">سنوي</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                <div className="text-xs text-purple-600 font-medium mb-2">المعدل السنوي</div>
                <div className="text-2xl font-bold text-purple-900">{metrics.annual.mean != null ? metrics.annual.mean.toFixed(2) : '—'}</div>
                <div className="text-xs text-purple-600 mt-2">متوسط جميع الفصول</div>
              </div>
            </div>
          </div>

          {/* Annual evaluation (requires all three semesters) */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">تقييم الأداء لنهاية السنة</h3>
            {(((metrics.s1.present ?? 0) > 0) && ((metrics.s2.present ?? 0) > 0) && ((metrics.s3.present ?? 0) > 0) && metrics.annual.mean != null) ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <StatCard title="المعدل السنوي" value={metrics.annual.mean != null ? metrics.annual.mean.toFixed(2) : '—'} />
                  <StatCard title="نسبة النجاح السنوية" value={metrics.s1.success != null ? (Math.round(metrics.s1.success * 10) / 10).toFixed(1) + '%' : '—'} />
                  <StatCard title="الانحراف المعياري السنوي" value={metrics.annual.std != null ? metrics.annual.std.toFixed(2) : '—'} />
                  <StatCard title="عدد التلاميذ المحتسبين" value={metrics.annual.present ?? '—'} />
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-800 font-medium">
                  {metrics.annual.label}
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 font-medium">
                لا يمكن عرض تقييم نهاية السنة حتى يتم استيراد الفصول الثلاثة
              </div>
            )}
          </div>

          {/* Detailed annual summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-slate-800 flex items-center">
                <span className="text-4xl mr-4">📊</span>
                ملخص مفصل للتحليل السنوي
              </h3>
              <div className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold">
                تقرير شامل
              </div>
            </div>

            {/* Semester Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4">
                <h4 className="text-xl font-bold text-center">مؤشرات الأداء الفصلي</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-right font-semibold text-slate-700 border-b border-slate-200">الفصل</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 border-b border-slate-200">المعدل العام</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 border-b border-slate-200">نسبة النجاح</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 border-b border-slate-200">الانحراف المعياري</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 border-b border-slate-200">عدد الحضور</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-700 border-b border-slate-200">التقييم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Semester 1 */}
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center">
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">ف1</div>
                          <span className="font-medium text-slate-700">الفصل الأول</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-lg font-bold text-blue-700">
                          {metrics.s1.mean != null ? metrics.s1.mean.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-lg font-bold text-green-700">
                          {metrics.s1.success != null ? (Math.round(metrics.s1.success * 10) / 10).toFixed(1) + '%' : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-sm text-slate-600">
                          {metrics.s1.std != null ? metrics.s1.std.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-sm text-slate-600">
                          {metrics.s1.present ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        {(() => {
                          const mean = metrics.s1.mean;
                          if (mean == null) return <span className="text-gray-400">—</span>;
                          const level = mean >= 18 ? 'ممتاز' : mean >= 14 ? 'جيد جداً' : mean >= 12 ? 'جيد' : mean >= 10 ? 'مقبول' : 'ضعيف';
                          const color = mean >= 18 ? 'text-green-600' : mean >= 14 ? 'text-blue-600' : mean >= 12 ? 'text-yellow-600' : mean >= 10 ? 'text-orange-600' : 'text-red-600';
                          return <span className={`text-sm font-semibold ${color}`}>{level}</span>;
                        })()}
                      </td>
                    </tr>

                    {/* Semester 2 */}
                    <tr className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 border-b border-slate-100">
                        <div className="flex items-center">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">ف2</div>
                          <span className="font-medium text-slate-700">الفصل الثاني</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-lg font-bold text-green-700">
                          {metrics.s2.mean != null ? metrics.s2.mean.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-lg font-bold text-green-700">
                          {metrics.s2.success != null ? (Math.round(metrics.s2.success * 10) / 10).toFixed(1) + '%' : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-sm text-slate-600">
                          {metrics.s2.std != null ? metrics.s2.std.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        <span className="text-sm text-slate-600">
                          {metrics.s2.present ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-slate-100">
                        {(() => {
                          const mean = metrics.s2.mean;
                          if (mean == null) return <span className="text-gray-400">—</span>;
                          const level = mean >= 18 ? 'ممتاز' : mean >= 14 ? 'جيد جداً' : mean >= 12 ? 'جيد' : mean >= 10 ? 'مقبول' : 'ضعيف';
                          const color = mean >= 18 ? 'text-green-600' : mean >= 14 ? 'text-blue-600' : mean >= 12 ? 'text-yellow-600' : mean >= 10 ? 'text-orange-600' : 'text-red-600';
                          return <span className={`text-sm font-semibold ${color}`}>{level}</span>;
                        })()}
                      </td>
                    </tr>

                    {/* Semester 3 */}
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">ف3</div>
                          <span className="font-medium text-slate-700">الفصل الثالث</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-orange-700">
                          {metrics.s3.mean != null ? metrics.s3.mean.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-green-700">
                          {metrics.s3.success != null ? (Math.round(metrics.s3.success * 10) / 10).toFixed(1) + '%' : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">
                          {metrics.s3.std != null ? metrics.s3.std.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">
                          {metrics.s3.present ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const mean = metrics.s3.mean;
                          if (mean == null) return <span className="text-gray-400">—</span>;
                          const level = mean >= 18 ? 'ممتاز' : mean >= 14 ? 'جيد جداً' : mean >= 12 ? 'جيد' : mean >= 10 ? 'مقبول' : 'ضعيف';
                          const color = mean >= 18 ? 'text-green-600' : mean >= 14 ? 'text-blue-600' : mean >= 12 ? 'text-yellow-600' : mean >= 10 ? 'text-orange-600' : 'text-red-600';
                          return <span className={`text-sm font-semibold ${color}`}>{level}</span>;
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annual Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Annual Average */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-500 text-white p-3 rounded-full">
                    <span className="text-xl">📈</span>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">المعدل السنوي</span>
                </div>
                <div className="text-2xl font-bold text-indigo-800 mb-1">
                  {metrics.annual.mean != null ? metrics.annual.mean.toFixed(2) : '—'}
                </div>
                <div className="text-sm text-indigo-600 font-medium">
                  {metrics.annual.label}
                </div>
              </div>

              {/* Annual Success Rate */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-500 text-white p-3 rounded-full">
                    <span className="text-xl">✅</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">نسبة النجاح</span>
                </div>
                <div className="text-2xl font-bold text-emerald-800 mb-1">
                  {metrics.annual.success != null ? (Math.round(metrics.annual.success * 10) / 10).toFixed(1) + '%' : '—'}
                </div>
                <div className="text-sm text-emerald-600 font-medium">
                  معدل النجاح السنوي
                </div>
              </div>

              {/* Best Semester */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-500 text-white p-3 rounded-full">
                    <span className="text-xl">🏆</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600">أفضل فصل</span>
                </div>
                <div className="text-lg font-bold text-amber-800 mb-1">
                  {(() => {
                    const arr: { name: string; mean: number | null }[] = [
                      { name: 'الفصل الأول', mean: metrics.s1.mean ?? null },
                      { name: 'الفصل الثاني', mean: metrics.s2.mean ?? null },
                      { name: 'الفصل الثالث', mean: metrics.s3.mean ?? null }
                    ];
                    const filtered = arr.filter(x => x.mean != null) as { name: string; mean: number }[];
                    if (filtered.length === 0) return '—';
                    const best = filtered.sort((a,b) => b.mean - a.mean)[0];
                    return best.name;
                  })()}
                </div>
                <div className="text-sm text-amber-600 font-medium">
                  {(() => {
                    const arr: { name: string; mean: number | null }[] = [
                      { name: 'الفصل الأول', mean: metrics.s1.mean ?? null },
                      { name: 'الفصل الثاني', mean: metrics.s2.mean ?? null },
                      { name: 'الفصل الثالث', mean: metrics.s3.mean ?? null }
                    ];
                    const filtered = arr.filter(x => x.mean != null) as { name: string; mean: number }[];
                    if (filtered.length === 0) return '—';
                    const best = filtered.sort((a,b) => b.mean - a.mean)[0];
                    return `(${best.mean.toFixed(2)})`;
                  })()}
                </div>
              </div>

              {/* Annual Standard Deviation */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 text-white p-3 rounded-full">
                    <span className="text-xl">📊</span>
                  </div>
                  <span className="text-sm font-medium text-purple-600">الانحراف المعياري</span>
                </div>
                <div className="text-2xl font-bold text-purple-800 mb-1">
                  {metrics.annual.std != null ? metrics.annual.std.toFixed(2) : '—'}
                </div>
                <div className="text-sm text-purple-600 font-medium">
                  توزيع الدرجات
                </div>
              </div>
            </div>

            {/* Gender Performance Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">👥</span>
                تحليل الأداء حسب الجنس
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Male Students */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-500 text-white p-3 rounded-full">
                      <span className="text-xl">👨</span>
                    </div>
                    <span className="text-lg font-bold text-blue-800">الذكور</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">العدد الإجمالي:</span>
                      <span className="font-bold text-blue-800">
                        {annualDetails.perStudent.filter(s => s.gender === 'ذكر').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">نسبة النجاح:</span>
                      <span className="font-bold text-green-700">
                        {(() => {
                          const maleStudents = annualDetails.perStudent.filter(s => s.gender === 'ذكر');
                          if (maleStudents.length === 0) return '—';
                          const successful = maleStudents.filter(s => s.annualAvg >= 10).length;
                          const successRate = Math.round((successful / maleStudents.length) * 100 * 10) / 10;
                          return `${successRate}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">نسبة الرسوب:</span>
                      <span className="font-bold text-red-700">
                        {(() => {
                          const maleStudents = annualDetails.perStudent.filter(s => s.gender === 'ذكر');
                          if (maleStudents.length === 0) return '—';
                          const failed = maleStudents.filter(s => s.annualAvg < 10).length;
                          const failureRate = Math.round((failed / maleStudents.length) * 100 * 10) / 10;
                          return `${failureRate}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600">المعدل العام:</span>
                      <span className="font-bold text-blue-800">
                        {(() => {
                          const maleStudents = annualDetails.perStudent.filter(s => s.gender === 'ذكر');
                          if (maleStudents.length === 0) return '—';
                          const avg = maleStudents.reduce((sum, s) => sum + s.annualAvg, 0) / maleStudents.length;
                          return avg.toFixed(2);
                        })()}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-200 rounded-lg">
                      <div className="text-sm text-blue-700 font-medium mb-1">أحسن معدل:</div>
                      <div className="font-bold text-blue-800">
                        {(() => {
                          const maleStudents = annualDetails.perStudent.filter(s => s.gender === 'ذكر');
                          if (maleStudents.length === 0) return '—';
                          const best = maleStudents.sort((a, b) => b.annualAvg - a.annualAvg)[0];
                          return `${best.name} (${best.annualAvg.toFixed(2)})`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Female Students */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-pink-500 text-white p-3 rounded-full">
                      <span className="text-xl">👩</span>
                    </div>
                    <span className="text-lg font-bold text-pink-800">الإناث</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-pink-600">العدد الإجمالي:</span>
                      <span className="font-bold text-pink-800">
                        {annualDetails.perStudent.filter(s => s.gender === 'أنثى').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-pink-600">نسبة النجاح:</span>
                      <span className="font-bold text-green-700">
                        {(() => {
                          const femaleStudents = annualDetails.perStudent.filter(s => s.gender === 'أنثى');
                          if (femaleStudents.length === 0) return '—';
                          const successful = femaleStudents.filter(s => s.annualAvg >= 10).length;
                          const successRate = Math.round((successful / femaleStudents.length) * 100 * 10) / 10;
                          return `${successRate}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-pink-600">نسبة الرسوب:</span>
                      <span className="font-bold text-red-700">
                        {(() => {
                          const femaleStudents = annualDetails.perStudent.filter(s => s.gender === 'أنثى');
                          if (femaleStudents.length === 0) return '—';
                          const failed = femaleStudents.filter(s => s.annualAvg < 10).length;
                          const failureRate = Math.round((failed / femaleStudents.length) * 100 * 10) / 10;
                          return `${failureRate}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-pink-600">المعدل العام:</span>
                      <span className="font-bold text-pink-800">
                        {(() => {
                          const femaleStudents = annualDetails.perStudent.filter(s => s.gender === 'أنثى');
                          if (femaleStudents.length === 0) return '—';
                          const avg = femaleStudents.reduce((sum, s) => sum + s.annualAvg, 0) / femaleStudents.length;
                          return avg.toFixed(2);
                        })()}
                      </span>
                    </div>
                    <div className="mt-4 p-3 bg-pink-200 rounded-lg">
                      <div className="text-sm text-pink-700 font-medium mb-1">أحسن معدل:</div>
                      <div className="font-bold text-pink-800">
                        {(() => {
                          const femaleStudents = annualDetails.perStudent.filter(s => s.gender === 'أنثى');
                          if (femaleStudents.length === 0) return '—';
                          const best = femaleStudents.sort((a, b) => b.annualAvg - a.annualAvg)[0];
                          return `${best.name} (${best.annualAvg.toFixed(2)})`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="text-2xl mr-3">📈</span>
                تحليل التطور الفصلي
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">التطور من ف1 إلى ف2</span>
                    <div className="flex items-center">
                      {(() => {
                        const a = metrics.s1.mean; const b = metrics.s2.mean;
                        if (a == null || b == null) return <span className="text-gray-400">—</span>;
                        const d = Math.round((b - a) * 100) / 100;
                        const isPositive = d > 0;
                        const isNegative = d < 0;
                        return (
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                              {isPositive ? `+${d}` : d}
                            </span>
                            <span className={`ml-2 text-sm ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                              {isPositive ? 'تحسن' : isNegative ? 'تراجع' : 'استقرار'}
                            </span>
                            <span className={`ml-2 text-lg ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500'}`}>
                              {isPositive ? '↗️' : isNegative ? '↘️' : '➡️'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">التطور من ف2 إلى ف3</span>
                    <div className="flex items-center">
                      {(() => {
                        const a = metrics.s2.mean; const b = metrics.s3.mean;
                        if (a == null || b == null) return <span className="text-gray-400">—</span>;
                        const d = Math.round((b - a) * 100) / 100;
                        const isPositive = d > 0;
                        const isNegative = d < 0;
                        return (
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                              {isPositive ? `+${d}` : d}
                            </span>
                            <span className={`ml-2 text-sm ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                              {isPositive ? 'تحسن' : isNegative ? 'تراجع' : 'استقرار'}
                            </span>
                            <span className={`ml-2 text-lg ${isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500'}`}>
                              {isPositive ? '↗️' : isNegative ? '↘️' : '➡️'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h5 className="font-bold text-blue-800 mb-4 text-center">ملاحظات التحليل</h5>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>يتم حساب المعدل السنوي بناءً على متوسط الفصول الثلاثة</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>نسبة النجاح تحسب للتلاميذ الحاصلين على معدل 10/20 فما فوق</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>الانحراف المعياري يوضح مدى تجانس النتائج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Annual per-subject stats (overall and by gender) */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">تحليل سنوي حسب المواد والجنس</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-center">المادة</th>
                    <th className="border border-gray-300 p-2 text-center">المعدل العام</th>
                    <th className="border border-gray-300 p-2 text-center">نسبة النجاح</th>
                    <th className="border border-gray-300 p-2 text-center">الانحراف المعياري</th>
                    <th className="border border-gray-300 p-2 text-center">معدل الذكور</th>
                    <th className="border border-gray-300 p-2 text-center">معدل الإناث</th>
                  </tr>
                </thead>
                <tbody>
                  {annualDetails.subjectStats.length > 0 ? (
                    annualDetails.subjectStats.map((s) => (
                      <tr key={s.label} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-center">{s.label}</td>
                        <td className="border border-gray-300 p-2 text-center">{s.overall.mean != null ? s.overall.mean.toFixed(2) : '—'}</td>
                        <td className="border border-gray-300 p-2 text-center">{s.overall.success != null ? (Math.round(s.overall.success * 10) / 10).toFixed(1) + '%' : '—'}</td>
                        <td className="border border-gray-300 p-2 text-center">{s.overall.std != null ? s.overall.std.toFixed(2) : '—'}</td>
                        <td className="border border-gray-300 p-2 text-center">{s.male.mean != null ? s.male.mean.toFixed(2) : '—'}</td>
                        <td className="border border-gray-300 p-2 text-center">{s.female.mean != null ? s.female.mean.toFixed(2) : '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="border border-gray-300 p-8 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="text-4xl mb-2">📊</div>
                          <div className="font-semibold text-gray-600">لا توجد بيانات للعرض</div>
                          <div className="text-sm text-gray-500">
                            قم باستيراد بيانات الفصول لرؤية تحليل المواد
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Annual per-student ranking */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">ترتيب سنوي حسب المعدل العام للتلاميذ</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-center">#</th>
                    <th className="border border-gray-300 p-2 text-center">اللقب و الاسم</th>
                    <th className="border border-gray-300 p-2 text-center">الجنس</th>
                    <th className="border border-gray-300 p-2 text-center">المعدل السنوي</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAnnualPageItems.length > 0 ? (
                    currentAnnualPageItems.map((st, idx) => {
                      const globalIndex = (annualPage - 1) * annualPageSize + idx;
                      return (
                      <tr key={st.name + idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-center">{globalIndex + 1}</td>
                        <td className="border border-gray-300 p-2 text-center">{st.name || '—'}</td>
                        <td className="border border-gray-300 p-2 text-center">{st.gender}</td>
                        <td className="border border-gray-300 p-2 text-center">{st.annualAvg.toFixed(2)}</td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 p-8 text-center text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="text-4xl mb-2">👥</div>
                          <div className="font-semibold text-gray-600">لا توجد بيانات للعرض</div>
                          <div className="text-sm text-gray-500">
                            قم باستيراد بيانات الفصول لرؤية ترتيب التلاميذ
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-3" dir="rtl">
                <div className="text-xs text-gray-500">
                  عرض {Math.min((annualPage - 1) * annualPageSize + 1, totalAnnual)} - {Math.min(annualPage * annualPageSize, totalAnnual)} من إجمالي {totalAnnual} تلميذًا
                </div>
                <nav className="flex items-center gap-1 justify-center select-none">
                  <button
                    className={`h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium ${annualPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50'}`}
                    onClick={() => setAnnualPage(1)}
                    disabled={annualPage === 1}
                  >الأول</button>
                  <button
                    className={`h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium ${annualPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50'}`}
                    onClick={() => setAnnualPage(p => Math.max(1, p - 1))}
                    disabled={annualPage === 1}
                  >السابق</button>
                  {annualVisiblePages.map((p) => (
                    <button
                      key={p}
                      className={`h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium ${p === annualPage ? 'text-white bg-blue-600 border-blue-600' : 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600'} focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                      onClick={() => setAnnualPage(p)}
                    >{p}</button>
                  ))}
                  <button
                    className={`h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium ${annualPage >= totalAnnualPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50'}`}
                    onClick={() => setAnnualPage(p => Math.min(totalAnnualPages, p + 1))}
                    disabled={annualPage >= totalAnnualPages}
                  >التالي</button>
                  <button
                    className={`h-9 min-w-[36px] px-3 rounded-md border text-sm font-medium ${annualPage >= totalAnnualPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-100 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50'}`}
                    onClick={() => setAnnualPage(totalAnnualPages)}
                    disabled={annualPage >= totalAnnualPages}
                  >الأخير</button>
                </nav>
              </div>
            </div>
          </div>
          </>
        </>
      )}
        </>
      )}
    </div>
  );
}

