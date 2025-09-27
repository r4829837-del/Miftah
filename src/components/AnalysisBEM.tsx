import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { getAnalysisDB } from '../lib/storage';

type BemRow = Record<string, any>;
type SemesterRecord = { students: any[]; semester: number };

export default function AnalysisBEM() {
  const { currentCycle } = useCycle();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vérifier si le cycle actuel est collège (متوسط)
  const isCollegeCycle = currentCycle === 'متوسط';

  const [bemRows, setBemRows] = useState<BemRow[]>([]);
  const [semData, setSemData] = useState<{ T1: any[]; T2: any[]; T3: any[] }>({ T1: [], T2: [], T3: [] });
  const [finalList, setFinalList] = useState<any[]>([]);

  // Load last saved analysis datasets for متوسط: sem1/2/3
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = getAnalysisDB(currentCycle);
        const found: SemesterRecord[] = [];
        await db.iterate((value: any) => {
          if (value && Array.isArray(value.students) && Number.isFinite(Number(value.semester))) {
            found.push({ students: value.students, semester: Number(value.semester) });
          }
        });
        if (!active) return;
        const T1 = found.find(r => r.semester === 1)?.students || [];
        const T2 = found.find(r => r.semester === 2)?.students || [];
        const T3 = found.find(r => r.semester === 3)?.students || [];
        setSemData({ T1, T2, T3 });
      } catch (_) {
        // no-op
      }
    })();
    return () => { active = false; };
  }, [currentCycle]);

  // Exact 14 BEM subjects, as requested (strict list)
  const bemSubjects = useMemo(() => (
    [
      'اللغة العربية',
      'اللغة اﻷمازيغية',
      'اللغة الفرنسية',
      'اللغة الإنجليزية',
      'التربية الإسلامية',
      'التربية المدنية',
      'التاريخ والجغرافيا',
      'الرياضيات',
      'ع الطبيعة و الحياة',
      'ع الفيزيائية والتكنولوجيا',
      'المعلوماتية',
      'التربية التشكيلية',
      'التربية الموسيقية',
      'ت البدنية و الرياضية'
    ]
  ), []);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as BemRow[];
      
      // Validation: vérifier que la colonne "معدل ش.ت.م" est présente
      if (rows.length > 0) {
        const firstRow = rows[0];
        const hasBemAverageColumn = Object.keys(firstRow).some(key => 
          key.includes('معدل ش.ت.م') || key.includes('معدل') && key.includes('ش.ت.م')
        );
        
        if (!hasBemAverageColumn) {
          alert('تحذير: لم يتم العثور على عمود "معدل ش.ت.م" في الملف. سيتم حساب المعدل تلقائياً من المواد الـ14.');
        }
      }
      
      setBemRows(rows);
    } catch (err) {
      alert('فشل قراءة ملف BEM. تأكد من الصيغة.');
    } finally {
      e.target.value = '';
    }
  };

  // Compute final orientation list when inputs change
  useEffect(() => {
    // Require at least T3 cohort to display the table
    if (semData.T3.length === 0) {
      setFinalList([]);
      return;
    }

    const normalizeArabic = (s: string): string => {
      return String(s || '')
        .replace(/[\u0617-\u061A\u064B-\u0652]/g, '') // remove diacritics
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/\s+/g, '') // remove all spaces for matching
        .trim();
    };

    const indexByName = (arr: any[], nameKeyCandidates: string[]): Map<string, any> => {
      const map = new Map<string, any>();
      arr.forEach((r: any) => {
        const keys = nameKeyCandidates;
        let name = '';
        for (const k of keys) {
          const v = r?.[k];
          if (v) { name = String(v).trim(); break; }
        }
        if (!name && (r.nom || r.name)) name = String(r.nom || r.name).trim();
        if (name) map.set(normalizeArabic(name), r);
      });
      return map;
    };

    const t1Idx = indexByName(semData.T1, ['اللقب و الاسم', 'nom']);
    const t2Idx = indexByName(semData.T2, ['اللقب و الاسم', 'nom']);
    const t3Idx = indexByName(semData.T3, ['اللقب و الاسم', 'nom']);
    const bemIdx = indexByName(bemRows, ['اللقب و الاسم', 'الاسم و اللقب', 'nom']);

    const getMoy = (rec: any, keys: string[]) => {
      for (const k of keys) {
        const v = rec?.[k];
        if (v != null && !Number.isNaN(Number(v))) return Number(v);
      }
      return 0;
    };

    const getBemAverage = (rec: any) => {
      if (!rec || typeof rec !== 'object') return null;
      
      // First priority: use the imported "معدل ش.ت.م" column from template
      const importedBemAverage = getMoy(rec, ['معدل ش.ت.م', 'moyenneBEM', 'moyenne_bem']);
      if (importedBemAverage > 0) {
        return importedBemAverage;
      }
      
      // Fallback: calculate from 14 subjects if template column is missing
      const rowMap = new Map<string, any>();
      Object.entries(rec).forEach(([k, v]) => {
        rowMap.set(normalizeArabic(k), v);
      });
      
      const sum = bemSubjects.reduce((acc, key) => {
        const raw = rec?.[key];
        let val = raw;
        if (val == null) {
          const nk = normalizeArabic(key);
          val = rowMap.get(nk);
        }
        const num = Number(String(val ?? '').toString().replace(',', '.'));
        return acc + (Number.isFinite(num) ? num : 0);
      }, 0);
      
      return sum / 14;
    };

    const out: any[] = [];
    // iterate over T3 as base cohort (الأقرب للتوجيه)
    t3Idx.forEach((t3, rawName) => {
      const key = normalizeArabic(rawName);
      const t1 = t1Idx.get(key);
      const t2 = t2Idx.get(key);
      const bem = bemIdx.get(key);
      const moyT1 = getMoy(t1, ['moyenneSem1', 'moyenneT1', 'moyenne', 'moyenneGenerale']);
      const moyT2 = getMoy(t2, ['moyenneSem2', 'moyenneT2', 'moyenne', 'moyenneGenerale']);
      const moyT3 = getMoy(t3, ['moyenneSem3', 'moyenneT3', 'moyenne', 'moyenneGenerale']);
      const hasBem = !!bemRows.length && !!bem;
      const moyBEM = hasBem ? getBemAverage(bem) : null;
      
      // معدل الإنتقال ne peut être calculé que si معدل ش.ت.م est disponible
      const moyPassage = (moyBEM != null && moyBEM > 0) ? 
        ((moyT1 + moyT2 + moyT3 + moyBEM) / 4) : null;

      // التوجيه النهائي ne peut être calculé que si معدل الإنتقال est disponible
      let orientation = '';
      if (moyPassage != null && moyPassage > 0) {
        if (moyPassage >= 10) {
          // Orientation basée sur les matières scientifiques vs littéraires
          let sciences = 0;
          let arts = 0;
          
          if (bem) {
            // Calculer la moyenne des matières scientifiques
            const sciSubjects = ['الرياضيات', 'ع الفيزيائية والتكنولوجيا', 'ع الطبيعة و الحياة', 'المعلوماتية'];
            const sciScores = sciSubjects.map(subj => Number(bem[subj] || 0)).filter(score => score > 0);
            sciences = sciScores.length > 0 ? sciScores.reduce((a, b) => a + b, 0) / sciScores.length : 0;
            
            // Calculer la moyenne des matières littéraires
            const artSubjects = ['اللغة العربية', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التاريخ والجغرافيا'];
            const artScores = artSubjects.map(subj => Number(bem[subj] || 0)).filter(score => score > 0);
            arts = artScores.length > 0 ? artScores.reduce((a, b) => a + b, 0) / artScores.length : 0;
          }
          
          // Si les données BEM ne sont pas disponibles, utiliser les moyennes des semestres
          if (sciences === 0 && arts === 0) {
            // Fallback: orientation basée sur معدل الإنتقال
            if (moyPassage >= 14) {
              orientation = 'جدع مشترك علوم';
            } else {
              orientation = 'جدع مشترك أداب';
            }
          } else {
            // Orientation basée sur les matières BEM
            if (sciences > arts) {
              orientation = 'جدع مشترك علوم';
            } else {
              orientation = 'جدع مشترك أداب';
            }
          }
        } else {
          orientation = 'إعادة السنة';
        }
      }

      // Use original display name if possible
      const displayName = (t3?.['اللقب و الاسم'] || t3?.nom || rawName);
      out.push({ name: String(displayName || '').trim(), moyT1, moyT2, moyT3, moyBEM, moyPassage, orientation });
    });

    // Sort: primary = معدل الإنتقال desc when available; fallback = المعدل السنوي العام desc
    out.sort((a, b) => {
      const aAnnual = (Number(a.moyT1 || 0) + Number(a.moyT2 || 0) + Number(a.moyT3 || 0)) / 3;
      const bAnnual = (Number(b.moyT1 || 0) + Number(b.moyT2 || 0) + Number(b.moyT3 || 0)) / 3;
      const av = (typeof a.moyPassage === 'number') ? a.moyPassage : aAnnual;
      const bv = (typeof b.moyPassage === 'number') ? b.moyPassage : bAnnual;
      if (bv !== av) return bv - av;
      return String(a.name).localeCompare(String(b.name), 'ar');
    });
    setFinalList(out);
  }, [bemRows, semData, bemSubjects]);

  const counts = useMemo(() => {
    const c = { 'جدع مشترك علوم': 0, 'جدع مشترك أداب': 0, 'إعادة السنة': 0 } as Record<string, number>;
    finalList.forEach(e => { c[e.orientation] = (c[e.orientation] || 0) + 1; });
    return c;
  }, [finalList]);

  const handleExportExcel = () => {
    if (!finalList.length) return;
    const rows = finalList.map(e => {
      const annualAvg = (Number(e.moyT1 || 0) + Number(e.moyT2 || 0) + Number(e.moyT3 || 0)) / 3;
      return {
        'الإسم': e.name,
        'معدل الفصل 1': Number(e.moyT1 || 0).toFixed(2),
        'معدل الفصل 2': Number(e.moyT2 || 0).toFixed(2),
        'معدل الفصل 3': Number(e.moyT3 || 0).toFixed(2),
        'المعدل السنوي العام': annualAvg.toFixed(2),
        'معدل ش.ت.م': e.moyBEM == null ? '' : Number(e.moyBEM || 0).toFixed(2),
        'معدل الإنتقال': e.moyPassage == null ? '' : Number(e.moyPassage || 0).toFixed(2),
        'التوجيه النهائي': e.orientation || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التوجيه_النهائي');
    XLSX.writeFile(wb, 'التوجيه_النهائي_BEM.xlsx');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Vérifier si c'est le cycle collège */}
      {!isCollegeCycle ? (
        <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-700">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">تحليل ش.ت.م غير متوفر</h2>
          <p className="text-lg text-gray-600 mb-6">
            تحليل شهادة التعليم المتوسط (ش.ت.م) متوفر فقط لمرحلة التعليم المتوسط (المتوسط)
          </p>
          <p className="text-sm text-gray-500">
            للوصول إلى تحليل ش.ت.م، يرجى التبديل إلى دورة التعليم المتوسط من إعدادات النظام
          </p>
        </div>
      ) : (
        <>
      {/* Header to keep tabs at same vertical position */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">تحليل ش.ت.م - التعليم المتوسط</h1>
            <p className="text-blue-100">تحليل نتائج شهادة التعليم المتوسط وإحصاءات التوجيه</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleUploadClick}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <Upload className="w-5 h-5" />
              رفع ملف BEM
            </button>
            <button
              onClick={() => {
                // Utiliser directement la version ultra-simple qui fonctionne
                import('../utils/ultraSimpleTemplate').then(({ downloadUltraSimpleTemplate }) => {
                  downloadUltraSimpleTemplate();
                }).catch((error) => {
                  console.error('Erreur avec le template ultra-simple:', error);
                  alert('Erreur lors du téléchargement du template: ' + error);
                });
              }}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <FileSpreadsheet className="w-5 h-5" />
              تحميل قالب BEM
            </button>
            
            <button
              onClick={async () => {
                const confirmMessage = `هل تريد تفريغ جميع بيانات تحليل ش.ت.م؟\n\nسيتم حذف:\n• جميع بيانات BEM المحفوظة\n• جميع الإحصائيات\n• جميع نتائج التوجيه\n\nهذا الإجراء لا يمكن التراجع عنه.`;
                
                if (window.confirm(confirmMessage)) {
                  try {
                    // Nettoyer les données BEM spécifiques
                    const bemDataKey = `bem_data_${currentCycle}`;
                    localStorage.removeItem(bemDataKey);
                    
                    // Nettoyer les données d'analyse BEM
                    const analysisDb = getAnalysisDB(currentCycle);
                    await analysisDb.iterate((value: any, key: string) => {
                      if (key.includes('bem') || key.includes('BEM')) {
                        analysisDb.removeItem(key);
                      }
                    });
                    
                    // Réinitialiser l'état local
                    setBemRows([]);
                    setSemData({ T1: [], T2: [], T3: [] });
                    setFinalList([]);
                    
                    alert('تم تفريغ بيانات تحليل ش.ت.م بنجاح');
                  } catch (error) {
                    console.error('Erreur lors du nettoyage BEM:', error);
                    alert('حدث خطأ أثناء التفريغ');
                  }
                }
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 flex items-center gap-2 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              تفريغ
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      </div>

      {/* Tabs: keep visible across analysis pages */}
      <div className="mt-2 mb-4 flex flex-wrap gap-2">
        <Link to="/analysis" className={`px-3 py-1.5 rounded ${isActive('/analysis') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الأول</Link>
        <Link to="/analysis/sem2" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem2') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثاني</Link>
        <Link to="/analysis/sem3" className={`px-3 py-1.5 rounded ${isActive('/analysis/sem3') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>الفصل الثالث</Link>
        <Link to="/analysis/compare" className={`px-3 py-1.5 rounded ${isActive('/analysis/compare') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>التحليل السنوي</Link>
        {currentCycle === 'متوسط' && (
          <Link to="/analysis/bem" className={`px-3 py-1.5 rounded ${isActive('/analysis/bem') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>تحليل  ش.ت.م</Link>
        )}
      </div>
      

      {/* Banner: BEM not imported yet */}
      {bemRows.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-900">
          <div className="font-semibold mb-2">⚠️ لم يتم استيراد ملف BEM بعد</div>
          <div className="text-sm">
            <p>• يجب رفع ملف BEM يحتوي على عمود "معدل ش.ت.م"</p>
            <p>• "معدل الإنتقال" = (الفصل الأول + الفصل الثاني + الفصل الثالث + معدل ش.ت.م) ÷ 4</p>
            <p>• "التوجيه النهائي": جدع مشترك علوم أو جدع مشترك أداب</p>
            <p>• التوجيه يعتمد على أداء التلميذ في المواد العلمية مقابل الأدبية</p>
          </div>
        </div>
      )}


      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">إجمالي التلاميذ</div>
          <div className="text-2xl font-bold text-gray-800">{finalList.length || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">جدع مشترك علوم</div>
          <div className="text-2xl font-bold text-green-700">{counts['جدع مشترك علوم'] || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">جدع مشترك أداب</div>
          <div className="text-2xl font-bold text-sky-700">{counts['جدع مشترك أداب'] || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm text-gray-500 mb-1">إعادة السنة</div>
          <div className="text-2xl font-bold text-amber-700">{counts['إعادة السنة'] || 0}</div>
        </div>
      </div>

      {/* Table - Always show header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">قائمة التوجيه النهائي</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-50 border-b-2 border-blue-200">
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الترتيب</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">اللقب و الاسم</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الفصل الأول</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الفصل الثاني</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الفصل الثالث</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">المعدل السنوي العام</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">معدل ش.ت.م</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">معدل الإنتقال</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">التوجيه النهائي</th>
            </tr>
          </thead>
          <tbody>
            {finalList.length > 0 ? (
              finalList.map((e, idx) => {
                const annualAvg = (Number(e.moyT1 || 0) + Number(e.moyT2 || 0) + Number(e.moyT3 || 0)) / 3;
                return (
                  <tr key={e.name + idx} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="border border-gray-300 p-3 text-center font-medium">{idx + 1}</td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{e.name}</td>
                    <td className="border border-gray-300 p-3 text-center">{Number(e.moyT1 || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{Number(e.moyT2 || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{Number(e.moyT3 || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold text-blue-700 bg-blue-50">{annualAvg.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{e.moyBEM == null ? '—' : Number(e.moyBEM || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold bg-green-50">{e.moyPassage == null ? '—' : Number(e.moyPassage || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      {e.orientation ? (
                        <span className={
                          e.orientation === 'جدع مشترك علوم' ? 'text-green-700 font-bold' :
                          e.orientation === 'جدع مشترك أداب' ? 'text-sky-700 font-bold' :
                          e.orientation === 'إعادة السنة' ? 'text-amber-700 font-bold' : 'text-gray-700'
                        }>
                          {e.orientation}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="border border-gray-300 p-8 text-center text-gray-500 bg-gray-50">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="font-semibold text-gray-600">لا توجد بيانات للعرض</div>
                    <div className="text-sm text-gray-500">
                      قم برفع ملف BEM واستيراد بيانات الفصول لرؤية النتائج
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Requirements info - only show when no data */}
      {finalList.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-800">
            <div className="font-semibold mb-2">📋 متطلبات التحليل</div>
            <div className="text-sm space-y-1">
              <p>• رفع ملف BEM يحتوي على عمود "معدل ش.ت.م"</p>
              <p>• استيراد ملفات الفصول 1 و 2 و 3 لنفس الدورة</p>
              <p>• التأكد من تطابق أسماء التلاميذ في جميع الملفات</p>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}



