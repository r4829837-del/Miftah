import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCycle } from '../contexts/CycleContext';
import { getStudents, getAnalysisDB } from '../lib/storage';
import { BarChart3, RefreshCw } from 'lucide-react';

const Tabs: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="mt-4 mb-6 flex flex-wrap gap-2" dir="rtl">
      <Link to="/analysis" className={`px-3 py-1.5 rounded ${isActive('/analysis') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الأول</Link>
      <Link to="/analysis/sem2" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem2') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثاني</Link>
      <Link to="/analysis/sem3" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem3') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثالث</Link>
      <Link to="/analysis/compare" className={`px-3 py-1.5 rounded ${isActive('/analysis/compare') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>التحليل السنوي</Link>
    </div>
  );
};

export default function AnalysisResultsCompare() {
  const { currentCycle } = useCycle();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<any[]>([]);

  const handleReset = async () => {
    const ok = window.confirm('هل تريد تهيئة بيانات التحليل السنوي لهذه المرحلة؟ سيتم حذف بيانات الفصول المحفوظة لهذه المرحلة فقط.');
    if (!ok) return;
    try {
      const db = getAnalysisDB(currentCycle);
      await db.clear();
      for (const sem of [1,2,3]) {
        try { localStorage.removeItem(`analysis_cache_${currentCycle}_sem${sem}`); } catch (_) {}
      }
      setStudents([]);
    } catch (e) {
      console.error('Failed to reset annual analysis data', e);
      alert('تعذر تهيئة البيانات. حاول مرة أخرى.');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getStudents(currentCycle);
        if (mounted && data && data.length) {
          setStudents(data);
        } else {
          // Fallback: load last persisted analysis dataset for each semester and merge students
          try {
            const db = getAnalysisDB(currentCycle);
            const merged: any[] = [];
            const seen = new Set<string>();
            for (const sem of [1,2,3] as const) {
              await db.iterate((value: any) => {
                if (value && value.semester === sem && Array.isArray(value.students)) {
                  for (const s of value.students) {
                    const key = (s.studentId || s.numero || s.nom || JSON.stringify(s));
                    if (!seen.has(key)) { seen.add(key); merged.push(s); }
                  }
                }
              });
            }
            if (mounted) setStudents(merged);
          } catch (_) {}
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

    const getSemValue = (s: any, sem: 1 | 2 | 3): number | null => {
      const a = parseNum(s[`moyenneSem${sem}`]);
      if (a != null) return a;
      const b = parseNum(s[`semester${sem}Grade`]);
      if (b != null) return b;
      // Some datasets may store generic moyenne per semester labels
      const altKeys = ['moyenneS' + sem, 'moyenne_sem_' + sem];
      for (const k of altKeys) {
        const v = parseNum(s[k]);
        if (v != null) return v;
      }
      return null;
    };

    const computeForSem = (sem: 1 | 2 | 3) => {
      let grades: number[] = [];
      students.forEach(s => {
        const v = getSemValue(s, sem);
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

    // Annual per-student: average of available semester grades
    const annualGrades: number[] = [];
    students.forEach(s => {
      const vals = [getSemValue(s, 1), getSemValue(s, 2), getSemValue(s, 3)].filter((v): v is number => v != null);
      if (vals.length) {
        annualGrades.push(vals.reduce((a, b) => a + b, 0) / vals.length);
      }
    });
    const annualPresent = annualGrades.length;
    const annualMean = annualPresent ? (annualGrades.reduce((a, b) => a + b, 0) / annualPresent) : null;
    const annualSuccess = annualPresent ? ((annualGrades.filter(g => g >= 10).length / annualPresent) * 100) : null;
    const annualStd = annualPresent && annualMean != null ? (
      Math.sqrt(annualGrades.reduce((acc, g) => acc + Math.pow(g - annualMean, 2), 0) / annualPresent)
    ) : null;

    // Simple annual evaluation label
    const evaluationLabel = (() => {
      if (annualMean == null) return 'لا توجد بيانات كافية';
      if (annualMean >= 18) return 'أداء ممتاز في نهاية السنة';
      if (annualMean >= 14) return 'أداء جيد جداً في نهاية السنة';
      if (annualMean >= 12) return 'أداء جيد في نهاية السنة';
      if (annualMean >= 10) return 'أداء مقبول في نهاية السنة';
      return 'أداء ضعيف في نهاية السنة';
    })();

    return { s1, s2, s3, annual: { present: annualPresent, mean: annualMean, success: annualSuccess, std: annualStd, label: evaluationLabel } };
  }, [students]);

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

      {isLoading ? (
        <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-600">جاري تحميل البيانات...</div>
      ) : (
        <>
          {/* Available semesters indicator */}
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-700 mb-2 font-semibold">الفصول المتوفرة:</div>
            <div className="flex flex-wrap gap-2">
              {(metrics.s1.present ?? 0) > 0 && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">الفصل الأول</span>
              )}
              {(metrics.s2.present ?? 0) > 0 && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">الفصل الثاني</span>
              )}
              {(metrics.s3.present ?? 0) > 0 && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">الفصل الثالث</span>
              )}
              {(metrics.s1.present ?? 0) === 0 && (metrics.s2.present ?? 0) === 0 && (metrics.s3.present ?? 0) === 0 && (
                <span className="text-sm text-gray-500">لا توجد بيانات للفصول بعد</span>
              )}
            </div>
          </div>

          {/* Semester summaries */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">الفصل الأول</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard title="المعدل العام" value={metrics.s1.mean != null ? metrics.s1.mean.toFixed(2) : '—'} />
                <StatCard title="نسبة النجاح" value={metrics.s1.success != null ? metrics.s1.success.toFixed(2) + '%' : '—'} />
                <StatCard title="المنحرف المعياري" value={metrics.s1.std != null ? metrics.s1.std.toFixed(2) : '—'} />
                <StatCard title="عدد التلاميذ" value={metrics.s1.present ?? '—'} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">الفصل الثاني</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard title="المعدل العام" value={metrics.s2.mean != null ? metrics.s2.mean.toFixed(2) : '—'} />
                <StatCard title="نسبة النجاح" value={metrics.s2.success != null ? metrics.s2.success.toFixed(2) + '%' : '—'} />
                <StatCard title="المنحرف المعياري" value={metrics.s2.std != null ? metrics.s2.std.toFixed(2) : '—'} />
                <StatCard title="عدد التلاميذ" value={metrics.s2.present ?? '—'} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">الفصل الثالث</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard title="المعدل العام" value={metrics.s3.mean != null ? metrics.s3.mean.toFixed(2) : '—'} />
                <StatCard title="نسبة النجاح" value={metrics.s3.success != null ? metrics.s3.success.toFixed(2) + '%' : '—'} />
                <StatCard title="المنحرف المعياري" value={metrics.s3.std != null ? metrics.s3.std.toFixed(2) : '—'} />
                <StatCard title="عدد التلاميذ" value={metrics.s3.present ?? '—'} />
              </div>
            </div>
          </div>

          {/* Annual evaluation */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">تقييم الأداء لنهاية السنة</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <StatCard title="المعدل السنوي" value={metrics.annual.mean != null ? metrics.annual.mean.toFixed(2) : '—'} />
              <StatCard title="نسبة النجاح السنوية" value={metrics.annual.success != null ? metrics.annual.success.toFixed(2) + '%' : '—'} />
              <StatCard title="الانحراف المعياري السنوي" value={metrics.annual.std != null ? metrics.annual.std.toFixed(2) : '—'} />
              <StatCard title="عدد التلاميذ المحتسبين" value={metrics.annual.present ?? '—'} />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-800 font-medium">
              {metrics.annual.label}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

