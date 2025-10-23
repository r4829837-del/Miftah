import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, ArrowRight, Download } from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { getAnalysisDB } from '../lib/storage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type BemRow = Record<string, any>;
type SemesterRecord = { students: any[]; semester: number };

export default function AnalysisBEM() {
  const { currentCycle } = useCycle();

  // Fonction pour imprimer uniquement la table "قائمة التوجيه النهائي"
  const printFinalList = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableElement = document.querySelector('.final-list-table');
    if (!tableElement) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>قائمة التوجيه النهائي</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 0;
            font-weight: bold;
          }
          .header .subtitle {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: center;
            vertical-align: middle;
          }
          th {
            background-color: #dbeafe;
            color: #1e40af;
            font-weight: bold;
            font-size: 11px;
          }
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tbody tr:hover {
            background-color: #f3f4f6;
          }
          .annual-avg {
            background-color: #dbeafe !important;
            font-weight: bold;
            color: #1e40af;
          }
          .transition-avg {
            background-color: #dcfce7 !important;
            font-weight: bold;
          }
          .orientation-sciences {
            color: #059669;
            font-weight: bold;
          }
          .orientation-literature {
            color: #2563eb;
            font-weight: bold;
          }
          .orientation-repeat {
            color: #d97706;
            font-weight: bold;
          }
          .evaluation-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #2563eb;
          }
          .evaluation-content {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.6;
            min-height: 80px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .evaluation-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>قائمة التوجيه النهائي</h1>
          <div class="subtitle">تحليل ش.ت.م - التعليم المتوسط</div>
        </div>
        ${tableElement.outerHTML}
        <div class="evaluation-section">
          <h3 style="color: #1f2937; font-size: 18px; font-weight: bold; margin-bottom: 15px;">تقييم مستشار(ة) التوجيه:</h3>
          <div class="evaluation-content">
            ${orientationEvaluation || ''}
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Fonction améliorée pour générer un PDF complet et bien structuré
  const handleGenerateCompletePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let y = 20;

      // Fonction pour vérifier si on a besoin d'une nouvelle page
      const checkNewPage = (requiredSpace: number) => {
        if (y + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      };

      // Fonction pour ajouter un titre de section
      const addSectionTitle = (title: string) => {
        checkNewPage(15);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(title, margin, y);
        y += 10;
        
        // Ligne de séparation
        pdf.setDrawColor(0, 0, 0);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // Fonction pour ajouter des informations
      const addInfo = (label: string, value: string | number) => {
        checkNewPage(8);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${label}: ${value}`, margin, y);
        y += 6;
      };

      // Page 1: En-tête et informations générales
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('تحليل ش.ت.م - التعليم المتوسط', pageWidth / 2, y, { align: 'center' });
      y += 15;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('تقرير شامل للتحليل السنوي', pageWidth / 2, y, { align: 'center' });
      y += 20;

      // Informations générales
      addSectionTitle('المعلومات العامة');
      addInfo('إجمالي عدد التلاميذ', finalList.length);
      addInfo('تاريخ التقرير', new Date().toLocaleDateString('ar-SA'));
      addInfo('المرحلة التعليمية', 'التعليم المتوسط');

      // Statistiques générales
      if (finalList.length > 0) {
        const totalStudents = finalList.length;
        const sciencesCount = finalList.filter(s => s.orientation === 'جدع مشترك علوم').length;
        const artsCount = finalList.filter(s => s.orientation === 'جدع مشترك آداب').length;
        const repeatCount = finalList.filter(s => s.orientation === 'إعادة السنة').length;

        addSectionTitle('الإحصائيات العامة');
        addInfo('عدد التلاميذ الموجهين لجدع مشترك علوم', sciencesCount);
        addInfo('عدد التلاميذ الموجهين لجدع مشترك آداب', artsCount);
        addInfo('عدد التلاميذ المعادين', repeatCount);
        addInfo('نسبة التوجيه للعلوم', `${((sciencesCount / totalStudents) * 100).toFixed(1)}%`);
        addInfo('نسبة التوجيه للآداب', `${((artsCount / totalStudents) * 100).toFixed(1)}%`);
      }

      // Page 2: Tableau complet des 65 élèves
      pdf.addPage();
      y = 20;
      
      addSectionTitle('ترتيب سنوي حسب المعدل العام للتلاميذ');

      // Préparer les données du tableau
      const tableData = finalList.map((student, index) => [
        index + 1,
        student.name || 'غير محدد',
        student.moyT1 ? Number(student.moyT1).toFixed(2) : '—',
        student.moyT2 ? Number(student.moyT2).toFixed(2) : '—',
        student.moyT3 ? Number(student.moyT3).toFixed(2) : '—',
        student.moyAnnual ? Number(student.moyAnnual).toFixed(2) : '—',
        student.moyBEM ? Number(student.moyBEM).toFixed(2) : '—',
        student.moyPassage ? Number(student.moyPassage).toFixed(2) : '—',
        student.orientation || 'غير محدد'
      ]);

      // Créer le tableau avec autoTable (API v5)
      autoTable(pdf as any, {
        head: [['الترتيب', 'الاسم واللقب', 'الفصل الأول', 'الفصل الثاني', 'الفصل الثالث', 'المعدل السنوي', 'معدل ش.ت.م', 'معدل الانتقال', 'التوجيه النهائي']],
        body: tableData,
        startY: y,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 25 },
          6: { halign: 'center', cellWidth: 20 },
          7: { halign: 'center', cellWidth: 25 },
          8: { halign: 'center', cellWidth: 30 }
        },
        didDrawPage: (data: any) => {
          // Ajouter le numéro de page
          pdf.setFontSize(10);
          pdf.text(`صفحة ${pdf.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 10);
        }
      });

      // Page 3: Analyse détaillée par sections
      pdf.addPage();
      y = 20;

      addSectionTitle('التحليل التفصيلي');

      // Analyse des moyennes
      if (finalList.length > 0) {
        const moyT1Values = finalList.map(s => Number(s.moyT1 || 0)).filter(v => v > 0);
        const moyT2Values = finalList.map(s => Number(s.moyT2 || 0)).filter(v => v > 0);
        const moyT3Values = finalList.map(s => Number(s.moyT3 || 0)).filter(v => v > 0);
        const moyAnnualValues = finalList.map(s => Number(s.moyAnnual || 0)).filter(v => v > 0);

        addSectionTitle('معدلات الفصول');
        if (moyT1Values.length > 0) {
          const avgT1 = moyT1Values.reduce((a, b) => a + b, 0) / moyT1Values.length;
          addInfo('متوسط الفصل الأول', avgT1.toFixed(2));
        }
        if (moyT2Values.length > 0) {
          const avgT2 = moyT2Values.reduce((a, b) => a + b, 0) / moyT2Values.length;
          addInfo('متوسط الفصل الثاني', avgT2.toFixed(2));
        }
        if (moyT3Values.length > 0) {
          const avgT3 = moyT3Values.reduce((a, b) => a + b, 0) / moyT3Values.length;
          addInfo('متوسط الفصل الثالث', avgT3.toFixed(2));
        }
        if (moyAnnualValues.length > 0) {
          const avgAnnual = moyAnnualValues.reduce((a, b) => a + b, 0) / moyAnnualValues.length;
          addInfo('المعدل السنوي العام', avgAnnual.toFixed(2));
        }
      }

      // Page 4: Recommandations et évaluation
      pdf.addPage();
      y = 20;

      addSectionTitle('التوصيات والتقييم');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const recommendations = [
        '• مراجعة المناهج والطرق التعليمية للمواد ذات المعدلات المنخفضة',
        '• تنظيم حصص دعم إضافية للتلاميذ الذين يحتاجون إلى تحسين',
        '• تشجيع التلاميذ المتميزين والمحافظة على مستواهم',
        '• متابعة دورية لنتائج التلاميذ وتقديم الدعم اللازم',
        '• تحسين البيئة التعليمية وتوفير الموارد اللازمة'
      ];

      recommendations.forEach(rec => {
        checkNewPage(8);
        pdf.text(rec, margin, y);
        y += 6;
      });

      // Ajouter l'évaluation du conseiller si disponible
      if (orientationEvaluation) {
        checkNewPage(20);
        addSectionTitle('تقييم مستشار(ة) التوجيه');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(orientationEvaluation, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin, y);
          y += 6;
        });
      }

      // Pied de page final
      const footerY = pageHeight - 20;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`تقرير تحليل ش.ت.م - التعليم المتوسط`, pageWidth / 2, footerY, { align: 'center' });

      // Génération et téléchargement du PDF
      const fileName = `تحليل_ش.ت.م_التعليم_المتوسط_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء PDF. حاول مرة أخرى.');
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vérifier si le cycle actuel est collège (متوسط)
  const isCollegeCycle = currentCycle === 'متوسط';

  const [bemRows, setBemRows] = useState<BemRow[]>([]);
  const [semData, setSemData] = useState<{ T1: any[]; T2: any[]; T3: any[] }>({ T1: [], T2: [], T3: [] });
  const [finalList, setFinalList] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // Evaluation state
  const [orientationEvaluation, setOrientationEvaluation] = useState('');

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
        
        console.log('=== DEBUG CHARGEMENT SEMESTRES ===');
        console.log('T1 trouvé:', T1.length, 'élèves');
        console.log('T2 trouvé:', T2.length, 'élèves');
        console.log('T3 trouvé:', T3.length, 'élèves');
        console.log('=== FIN DEBUG CHARGEMENT SEMESTRES ===');
      } catch (_) {
        // no-op
      }
    })();
    return () => { active = false; };
  }, [currentCycle]);

  // Load BEM data from localStorage
  useEffect(() => {
    const bemDataKey = `bem_data_${currentCycle}`;
    const savedBemData = localStorage.getItem(bemDataKey);
    console.log('=== DEBUG CHARGEMENT BEM ===');
    console.log('Clé BEM recherchée:', bemDataKey);
    console.log('Données BEM trouvées:', savedBemData ? 'OUI' : 'NON');
    
    if (savedBemData) {
      try {
        const parsedData = JSON.parse(savedBemData);
        console.log('Données BEM chargées depuis localStorage:', parsedData.length, 'lignes');
        console.log('Première ligne BEM:', parsedData[0]);
        
        // Forcer un re-rendu après le chargement des données
        setTimeout(() => {
          setBemRows(parsedData);
          console.log('BEM rows mis à jour après délai');
        }, 100);
      } catch (err) {
        console.error('Erreur lors du chargement des données BEM:', err);
      }
    } else {
      console.log('Aucune donnée BEM trouvée dans localStorage');
    }
    console.log('=== FIN DEBUG CHARGEMENT BEM ===');
  }, [currentCycle]);

  // Exact 14 BEM subjects, matching the CSV template column names exactly
  const bemSubjects = useMemo(() => (
    [
      'اللغة العربية',
      'اللغة اﻷمازيغية',  // Exact match from CSV template
      'اللغة الفرنسية',
      'اللغة الإنجليزية',
      'التربية الإسلامية',
      'التربية المدنية',
      'التاريخ والجغرافيا',
      'الرياضيات',
      'ع الفيزيائية والتكنولوجيا',  // Order matches CSV template
      'ع الطبيعة و الحياة',  // Order matches CSV template
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
      
      // Sauvegarder les données BEM dans localStorage
      const bemDataKey = `bem_data_${currentCycle}`;
      localStorage.setItem(bemDataKey, JSON.stringify(rows));
      console.log('Données BEM sauvegardées dans localStorage:', rows.length, 'lignes');
      
    } catch (err) {
      alert('فشل قراءة ملف BEM. تأكد من الصيغة.');
    } finally {
      e.target.value = '';
    }
  };

  // Compute final orientation list when inputs change
  useEffect(() => {
    console.log('=== DEBUG USEEFFECT PRINCIPAL ===');
    console.log('bemRows.length:', bemRows.length);
    console.log('semData.T3.length:', semData.T3.length);
    console.log('bemRows:', bemRows);
    console.log('semData:', semData);
    
    // Si on a des données BEM mais pas de données de semestre, on peut quand même afficher quelque chose
    // Seulement si on n'a ni données BEM ni données de semestre, on vide la liste
    if (bemRows.length === 0 && semData.T3.length === 0) {
      console.log('Aucune donnée disponible, vidage de finalList');
      setFinalList([]);
      return;
    }
    
    console.log('Calcul en cours...');

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
    
    // Déterminer quelle source de données utiliser comme base
    const baseData = semData.T3.length > 0 ? t3Idx : bemIdx;
    const dataSource = semData.T3.length > 0 ? 'T3' : 'BEM';
    
    console.log('=== DEBUG DATA SOURCE ===');
    console.log('T3 length:', semData.T3.length);
    console.log('BEM rows length:', bemRows.length);
    console.log('Using data source:', dataSource);
    console.log('Base data size:', baseData.size);
    console.log('=== END DEBUG DATA SOURCE ===');
    
    // iterate over base data (T3 si disponible, sinon BEM)
    baseData.forEach((baseRecord, rawName) => {
      const key = normalizeArabic(rawName);
      const t1 = t1Idx.get(key);
      const t2 = t2Idx.get(key);
      const t3 = t3Idx.get(key);
      const bem = bemIdx.get(key);
      
      // Utiliser baseRecord comme source principale pour les moyennes
      const moyT1 = getMoy(t1, ['moyenneSem1', 'moyenneT1', 'moyenne', 'moyenneGenerale']);
      const moyT2 = getMoy(t2, ['moyenneSem2', 'moyenneT2', 'moyenne', 'moyenneGenerale']);
      const moyT3 = getMoy(t3, ['moyenneSem3', 'moyenneT3', 'moyenne', 'moyenneGenerale']);
      
      // Si on utilise BEM comme source principale, calculer les moyennes à partir des matières BEM
      let finalMoyT1 = moyT1;
      let finalMoyT2 = moyT2;
      let finalMoyT3 = moyT3;
      
      if (dataSource === 'BEM' && bem) {
        // Calculer les moyennes à partir des matières BEM (approximation)
        const bemAverage = getBemAverage(bem);
        if (bemAverage !== null && bemAverage > 0) {
          // Utiliser la moyenne BEM comme approximation pour les 3 semestres
          finalMoyT1 = bemAverage;
          finalMoyT2 = bemAverage;
          finalMoyT3 = bemAverage;
        }
      }
      
      const hasBem = !!bemRows.length && !!bem;
      const moyBEM = hasBem ? getBemAverage(bem) : null;
      
      // معدل التقويم = (الفصل الأول + الفصل الثاني + الفصل الثالث) ÷ 3
      const moyEvaluation = hasBem ? ((finalMoyT1 + finalMoyT2 + finalMoyT3) / 3) : null;
      
      // المعدل السنوي العام = (الفصل الأول + الفصل الثاني + الفصل الثالث) ÷ 3
      const moyAnnual = (finalMoyT1 + finalMoyT2 + finalMoyT3) / 3;
      
      // معدل الإنتقال = (معدل الشهادة + معدل التقويم) ÷ 2
      const moyPassage = (moyBEM != null && moyBEM > 0 && moyEvaluation != null && moyEvaluation > 0) ? 
        ((moyBEM + moyEvaluation) / 2) : null;
      
      // Debug des calculs
      console.log(`=== DEBUG CALCULS POUR ${rawName} ===`);
      console.log('dataSource:', dataSource);
      console.log('finalMoyT1:', finalMoyT1, 'finalMoyT2:', finalMoyT2, 'finalMoyT3:', finalMoyT3);
      console.log('moyBEM:', moyBEM);
      console.log('moyEvaluation:', moyEvaluation);
      console.log('moyAnnual:', moyAnnual);
      console.log('moyPassage:', moyPassage);
      console.log('hasBem:', hasBem);
      console.log('=== FIN DEBUG CALCULS ===');

      // التوجيه النهائي - حساب محسن ومتسق
      let orientation = '';
      let sciences = 0;
      let arts = 0;
      
      // Critères d'orientation cohérents et précis
      if (moyPassage != null && moyPassage > 0) {
        if (moyPassage >= 10) {
          // Orientation basée sur les matières scientifiques vs littéraires
          let scienceCount = 0;
          let artsCount = 0;
          
          // Calculer les moyennes avec pondération et validation des données
          if (bem) {
            // Matières scientifiques avec noms multiples possibles
            const sciSubjects = [
              'الرياضيات', 'رياضيات', 'math', 'maths',
              'ع الفيزيائية والتكنولوجيا', 'الفيزياء', 'فيزياء', 'physique', 'physics',
              'ع الطبيعة و الحياة', 'العلوم الطبيعية', 'علوم طبيعية', 'sciences naturelles', 'natural sciences',
              'المعلوماتية', 'إعلام آلي', 'informatique', 'computer science'
            ];
            
            // Matières littéraires avec noms multiples possibles
            const artSubjects = [
              'اللغة العربية', 'عربية', 'arabic', 'arabe',
              'اللغة الفرنسية', 'فرنسية', 'french', 'français',
              'اللغة الإنجليزية', 'إنجليزية', 'english', 'anglais',
              'التاريخ والجغرافيا', 'تاريخ', 'جغرافيا', 'histoire', 'géographie', 'history', 'geography'
            ];
            
            // Calculer moyenne sciences
            sciSubjects.forEach(subject => {
              const score = Number(bem[subject] || 0);
              if (score > 0 && score <= 20) { // Validation: note entre 0 et 20
                sciences += score;
                scienceCount++;
              }
            });
            sciences = scienceCount > 0 ? sciences / scienceCount : 0;
            
            // Calculer moyenne arts
            artSubjects.forEach(subject => {
              const score = Number(bem[subject] || 0);
              if (score > 0 && score <= 20) { // Validation: note entre 0 et 20
                arts += score;
                artsCount++;
              }
            });
            arts = artsCount > 0 ? arts / artsCount : 0;
          }
          
          // Mécanisme de fallback amélioré
          if (sciences === 0 && arts === 0) {
            // Fallback 1: Utiliser les moyennes des semestres pour l'orientation
            const moySciences = (moyT1 + moyT2 + moyT3) / 3;
            
            // Fallback 2: Critères basés sur معدل الإنتقال avec seuils plus précis
            if (moyPassage >= 15) {
              orientation = 'جدع مشترك علوم';
            } else if (moyPassage >= 12) {
              orientation = 'جدع مشترك أداب';
            } else if (moyPassage >= 10) {
              // Orientation mixte pour les moyennes moyennes
              orientation = moySciences >= 12 ? 'جدع مشترك علوم' : 'جدع مشترك أداب';
            }
          } else {
            // Orientation basée sur les matières BEM avec seuil de différence
            const difference = Math.abs(sciences - arts);
            
            if (difference >= 1.5) { // Différence significative
              orientation = sciences > arts ? 'جدع مشترك علوم' : 'جدع مشترك أداب';
            } else {
              // Différence faible: orientation basée sur معدل الإنتقال
              if (moyPassage >= 14) {
                orientation = 'جدع مشترك علوم';
              } else {
                orientation = 'جدع مشترك أداب';
              }
            }
          }
        } else {
          orientation = 'إعادة السنة';
        }
      } else {
        // Pas de معدل الإنتقال calculable
        orientation = 'غير محدد';
      }

      // Use original display name if possible - utiliser baseRecord comme source principale
      const displayName = (baseRecord?.['اللقب و الاسم'] || baseRecord?.nom || baseRecord?.['الاسم و اللقب'] || rawName);
      
      // Récupérer les données de genre depuis les données importées
      const getGender = (rec: any) => {
        if (!rec) return '';
        const genderValue = rec['الجنس'] || rec['sexe'] || rec['gender'] || rec['sex'] || '';
        const genderStr = String(genderValue).toLowerCase().trim();
        if (genderStr.includes('أنث') || genderStr === 'female' || genderStr === 'f' || genderStr === 'fille') {
          return 'female';
        } else if (genderStr.includes('ذكر') || genderStr === 'male' || genderStr === 'm' || genderStr === 'garçon' || genderStr === 'garcon') {
          return 'male';
        }
        return '';
      };
      
      const gender = getGender(baseRecord) || getGender(t1) || getGender(t2) || getGender(bem);
      
      // Debug logging pour tracer les calculs d'orientation
      if (displayName && String(displayName).trim()) {
        console.log(`=== DEBUG ORIENTATION: ${String(displayName).trim()} ===`);
        console.log(`finalMoyT1: ${finalMoyT1}, finalMoyT2: ${finalMoyT2}, finalMoyT3: ${finalMoyT3}`);
        console.log(`moyBEM: ${moyBEM}, moyAnnual: ${moyAnnual}, moyPassage: ${moyPassage}`);
        
        // Recalculer pour debug
        let debugSciences = 0;
        let debugArts = 0;
        if (bem && moyPassage != null && moyPassage > 0) {
          const sciSubjects = [
            'الرياضيات', 'رياضيات', 'math', 'maths',
            'ع الفيزيائية والتكنولوجيا', 'الفيزياء', 'فيزياء', 'physique', 'physics',
            'ع الطبيعة و الحياة', 'العلوم الطبيعية', 'علوم طبيعية', 'sciences naturelles', 'natural sciences',
            'المعلوماتية', 'إعلام آلي', 'informatique', 'computer science'
          ];
          const artSubjects = [
            'اللغة العربية', 'عربية', 'arabic', 'arabe',
            'اللغة الفرنسية', 'فرنسية', 'french', 'français',
            'اللغة الإنجليزية', 'إنجليزية', 'english', 'anglais',
            'التاريخ والجغرافيا', 'تاريخ', 'جغرافيا', 'histoire', 'géographie', 'history', 'geography'
          ];
          
          const sciScores = sciSubjects.map(subj => Number(bem[subj] || 0)).filter(score => score > 0 && score <= 20);
          const artScores = artSubjects.map(subj => Number(bem[subj] || 0)).filter(score => score > 0 && score <= 20);
          
          debugSciences = sciScores.length > 0 ? sciScores.reduce((a, b) => a + b, 0) / sciScores.length : 0;
          debugArts = artScores.length > 0 ? artScores.reduce((a, b) => a + b, 0) / artScores.length : 0;
        }
        
        console.log(`sciences: ${debugSciences}, arts: ${debugArts}, difference: ${Math.abs(debugSciences - debugArts)}`);
        console.log(`Final orientation: ${orientation}`);
        console.log(`=== END DEBUG ORIENTATION ===`);
      }

      out.push({ 
        name: String(displayName || '').trim(), 
        moyT1: finalMoyT1, 
        moyT2: finalMoyT2, 
        moyT3: finalMoyT3, 
        moyBEM, 
        moyEvaluation, 
        moyPassage, 
        orientation,
        gender 
      });
    });

    // Sort: classement par moyenne décroissante (الترتيب: 1 = plus haute moyenne)
    out.sort((a, b) => {
      const aAnnual = (Number(a.moyT1 || 0) + Number(a.moyT2 || 0) + Number(a.moyT3 || 0)) / 3;
      const bAnnual = (Number(b.moyT1 || 0) + Number(b.moyT2 || 0) + Number(b.moyT3 || 0)) / 3;
      
      // Priorité 1: معدل الإنتقال (moyenne de transition) - décroissant
      const aTransition = Number(a.moyPassage) || 0;
      const bTransition = Number(b.moyPassage) || 0;
      
      // Si les deux ont معدل الإنتقال > 0, trier par ordre décroissant
      if (aTransition > 0 && bTransition > 0) {
        return bTransition - aTransition; // الترتيب: 1 = plus haut معدل الإنتقال
      } else if (aTransition > 0 && bTransition === 0) {
        return -1; // a avec معدل الإنتقال vient avant b sans
      } else if (aTransition === 0 && bTransition > 0) {
        return 1; // b avec معدل الإنتقال vient avant a sans
      }
      
      // Priorité 2: المعدل السنوي العام (moyenne annuelle) - décroissant
      if (bAnnual !== aAnnual) {
        return bAnnual - aAnnual; // الترتيب: 1 = plus haut المعدل السنوي العام
      }
      
      // Priorité 3: معدل الشهادة (moyenne BEM) - décroissant
      const aBEM = Number(a.moyBEM) || 0;
      const bBEM = Number(b.moyBEM) || 0;
      if (bBEM !== aBEM) {
        return bBEM - aBEM; // الترتيب: 1 = plus haut معدل الشهادة
      }
      
      // Priorité 4: Nom alphabétique en cas d'égalité parfaite
      return String(a.name).localeCompare(String(b.name), 'ar');
    });
    
    console.log('=== DEBUG CALCUL FINAL LIST ===');
    console.log('Nombre d\'élèves dans finalList:', out.length);
    console.log('Premier élève:', out[0]);
    console.log('=== FIN DEBUG CALCUL FINAL LIST ===');
    
    setFinalList(out);
  }, [bemRows, semData, bemSubjects]);

  const counts = useMemo(() => {
    const c = { 'جدع مشترك علوم': 0, 'جدع مشترك أداب': 0, 'إعادة السنة': 0 } as Record<string, number>;
    finalList.forEach(e => { c[e.orientation] = (c[e.orientation] || 0) + 1; });
    return c;
  }, [finalList]);

  // Fonction de vérification de cohérence des calculs
  const validateCalculations = useMemo(() => {
    const issues: string[] = [];
    const corrections: string[] = [];
    const sectionComparisons: string[] = [];
    
    finalList.forEach((student, index) => {
      const moyT1 = Number(student.moyT1 || 0);
      const moyT2 = Number(student.moyT2 || 0);
      const moyT3 = Number(student.moyT3 || 0);
      const moyBEM = Number(student.moyBEM || 0);
      const moyPassage = Number(student.moyPassage || 0);
      
      // Calculer les moyennes attendues selon les formules officielles
      const expectedAnnual = (moyT1 + moyT2 + moyT3) / 3;
      const expectedEvaluation = moyBEM > 0 ? ((moyT1 + moyT2 + moyT3) / 3) : null;
      const expectedTransition = (moyBEM > 0 && expectedEvaluation && expectedEvaluation > 0) ? 
        ((moyBEM + expectedEvaluation) / 2) : null;
      
      // Vérifications spécifiques par section
      
      // 1. الفصل الأول, الفصل الثاني, الفصل الثالث
      if (moyT1 === 0 && moyT2 === 0 && moyT3 === 0) {
        issues.push(`Élève ${index + 1} (${student.name}): Toutes les moyennes de semestre sont à 0`);
        if (moyBEM > 0) {
          corrections.push(`Élève ${index + 1} (${student.name}): Peut utiliser la moyenne BEM (${moyBEM.toFixed(2)}) comme approximation pour les 3 semestres`);
        }
      }
      
      // 2. التحليل السنوي (المعدل السنوي العام)
      const actualAnnual = (Number(student.moyT1 || 0) + Number(student.moyT2 || 0) + Number(student.moyT3 || 0)) / 3;
      if (Math.abs(actualAnnual - expectedAnnual) > 0.01) {
        issues.push(`Élève ${index + 1} (${student.name}): Incohérence dans le calcul du المعدل السنوي العام`);
        sectionComparisons.push(`التحليل السنوي: Calculé ${actualAnnual.toFixed(2)}, Attendu ${expectedAnnual.toFixed(2)}`);
      }
      
      // 3. تحليل ش.ت.م (معدل الشهادة)
      if (moyBEM === 0) {
        issues.push(`Élève ${index + 1} (${student.name}): Moyenne BEM est à 0`);
        sectionComparisons.push(`تحليل ش.ت.م: معدل الشهادة manquant`);
      }
      
      // 4. معدل الإنتقال (معدل التقويم + معدل الشهادة) / 2
      if (moyPassage === 0) {
        issues.push(`Élève ${index + 1} (${student.name}): Moyenne de transition est à 0`);
        if (moyBEM > 0 && expectedEvaluation && expectedEvaluation > 0) {
          corrections.push(`Élève ${index + 1} (${student.name}): Peut calculer معدل الإنتقال = (${moyBEM.toFixed(2)} + ${expectedEvaluation.toFixed(2)}) / 2 = ${expectedTransition?.toFixed(2)}`);
        }
      }
      
      if (expectedTransition && Math.abs(moyPassage - expectedTransition) > 0.01) {
        issues.push(`Élève ${index + 1} (${student.name}): Incohérence dans le calcul du معدل الإنتقال`);
        corrections.push(`Élève ${index + 1} (${student.name}): معدل الإنتقال devrait être ${expectedTransition.toFixed(2)} au lieu de ${moyPassage.toFixed(2)}`);
        sectionComparisons.push(`معدل الإنتقال: Calculé ${moyPassage.toFixed(2)}, Attendu ${expectedTransition.toFixed(2)}`);
      }
      
      // Vérification de cohérence entre les sections
      if (moyBEM > 0 && expectedEvaluation && expectedEvaluation > 0) {
        const calculatedTransition = (moyBEM + expectedEvaluation) / 2;
        if (Math.abs(moyPassage - calculatedTransition) > 0.01) {
          sectionComparisons.push(`Cohérence sections: معدل الإنتقال devrait être ${calculatedTransition.toFixed(2)} selon la formule officielle`);
        }
      }
    });
    
    console.log('=== VÉRIFICATION DE COHÉRENCE DES CALCULS ===');
    console.log('Nombre d\'élèves:', finalList.length);
    console.log('Problèmes détectés:', issues.length);
    console.log('Comparaisons entre sections:', sectionComparisons.length);
    
    if (issues.length > 0) {
      console.log('Détails des problèmes:');
      issues.forEach(issue => console.log('-', issue));
    }
    if (corrections.length > 0) {
      console.log('Corrections suggérées:');
      corrections.forEach(correction => console.log('-', correction));
    }
    if (sectionComparisons.length > 0) {
      console.log('Comparaisons entre sections:');
      sectionComparisons.forEach(comparison => console.log('-', comparison));
    }
    if (issues.length === 0) {
      console.log('✅ Tous les calculs sont cohérents entre toutes les sections');
    }
    console.log('=== FIN VÉRIFICATION ===');
    
    return {
      totalStudents: finalList.length,
      issues: issues,
      corrections: corrections,
      sectionComparisons: sectionComparisons,
      isValid: issues.length === 0
    };
  }, [finalList]);

  // Calculer les orientations progressives pour تحليل التوجيه التدريجي
  const progressiveGuidance = useMemo(() => {
    // Utiliser les données réelles calculées dynamiquement
    const scienceOriented = counts['جدع مشترك علوم'] || 0;
    const artsOriented = counts['جدع مشترك أداب'] || 0;
    const repeatYear = counts['إعادة السنة'] || 0;
    const totalStudents = finalList.length;
    
    // Calculer les pourcentages
    const sciencePercentage = totalStudents > 0 ? (scienceOriented / totalStudents) * 100 : 0;
    const artsPercentage = totalStudents > 0 ? (artsOriented / totalStudents) * 100 : 0;
    const repeatPercentage = totalStudents > 0 ? (repeatYear / totalStudents) * 100 : 0;
    
    console.log('تحليل التوجيه التدريجي - Données calculées dynamiquement:', {
      scienceOriented,
      artsOriented,
      repeatYear,
      totalStudents,
      sciencePercentage: sciencePercentage.toFixed(1) + '%',
      artsPercentage: artsPercentage.toFixed(1) + '%',
      repeatPercentage: repeatPercentage.toFixed(1) + '%'
    });

    return {
      scienceOriented,
      artsOriented,
      balanced: 0, // Pas de données pour les équilibrés
      undefined: repeatYear, // إعادة السنة
      total: totalStudents
    };
  }, [finalList, counts]);

  // Fonction pour mapper les orientations BEM vers les orientations de distribution
  const mapBemOrientationToDistribution = (bemOrientation: string) => {
    switch (bemOrientation) {
      case 'جدع مشترك علوم':
        return 'علمي';
      case 'جدع مشترك أداب':
        return 'تقني';
      case 'إعادة السنة':
        return 'مهني';
      case 'غير محدد':
        return 'غير محدد';
      default:
        return 'غير محدد';
    }
  };

  // Calculer la distribution des orientations pour توزيع التوجيهات المقترحة
  const orientationDistribution = useMemo(() => {
    const distribution = {
      'علمي': 0,
      'تقني': 0,
      'مهني': 0,
      'غير محدد': 0
    };

    finalList.forEach(student => {
      const mappedOrientation = mapBemOrientationToDistribution(student.orientation);
      distribution[mappedOrientation as keyof typeof distribution]++;
    });

    const total = finalList.length;
    
    console.log('=== DISTRIBUTION DES ORIENTATIONS ===');
    console.log('Distribution brute:', distribution);
    console.log('Total élèves:', total);
    
    return {
      distribution,
      total,
      percentages: {
        'علمي': total > 0 ? Math.round((distribution['علمي'] / total) * 100) : 0,
        'تقني': total > 0 ? Math.round((distribution['تقني'] / total) * 100) : 0,
        'مهني': total > 0 ? Math.round((distribution['مهني'] / total) * 100) : 0,
        'غير محدد': total > 0 ? Math.round((distribution['غير محدد'] / total) * 100) : 0
      }
    };
  }, [finalList]);

  // Pagination calculations
  const totalPages = Math.ceil(finalList.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = finalList.slice(startIndex, endIndex);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [finalList.length, cardsPerPage]);



  // Fonction pour imprimer les cartes individuelles des élèves
  const handlePrintCurrentPage = () => {
    if (!finalList.length) {
      alert('لا توجد بيانات للطباعة');
      return;
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('لا يمكن فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة.');
      return;
    }

    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>بطاقات التلاميذ الفردية - تحليل ش.ت.م</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Amiri', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.5;
            background: white;
            color: #1f2937;
            font-size: 12px;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .print-header h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: bold;
          }
          
          .print-header p {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .student-card {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          
          .card-header {
            text-align: center;
            margin-bottom: 15px;
            padding: 10px;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
            border-radius: 8px;
          }
          
          .card-header h2 {
            font-size: 18px;
            margin-bottom: 5px;
          }
          
          .rank-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
          }
          
          .rank-1 { background: #fbbf24; color: #92400e; }
          .rank-2 { background: #d1d5db; color: #374151; }
          .rank-3 { background: #f97316; color: #9a3412; }
          .rank-other { background: #dbeafe; color: #1e40af; }
          
          .info-section {
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .info-section h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #1e40af;
            font-weight: bold;
          }
          
          .info-section p {
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .info-section strong {
            color: #374151;
          }
          
          .average-display {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin: 10px 0;
          }
          
          .subjects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
          }
          
          .subject-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          
          .subject-name {
            font-weight: 500;
            color: #374151;
          }
          
          .subject-grade {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
          }
          
          .subject-grade.pass {
            background: #dcfce7;
            color: #166534;
          }
          
          .subject-grade.fail {
            background: #fef2f2;
            color: #dc2626;
          }
          
          .subject-grade.undefined {
            background: #f3f4f6;
            color: #6b7280;
          }
          
          .stats-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          
          .stat-card h3 {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          
          .gender-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .gender-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          
          .gender-card h3 {
            font-size: 16px;
            color: #374151;
            margin-bottom: 10px;
          }
          
          .gender-count {
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .gender-percentage {
            font-size: 14px;
            color: #6b7280;
          }
          
          .calibration-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .calibration-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .calibration-label {
            font-weight: 500;
            color: #374151;
          }
          
          .calibration-value {
            font-weight: bold;
            color: #1e40af;
            font-size: 16px;
          }
          
          .orientation-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          
          .orientation-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .orientation-label {
            font-weight: 500;
            color: #374151;
          }
          
          .orientation-count {
            font-weight: bold;
            color: #059669;
            font-size: 16px;
          }
          
          @media print {
            body { font-size: 10px; }
            .student-card { margin-bottom: 15px; }
            .cards-grid { gap: 15px; }
            .stats-section { margin: 20px 0; }
            .section-title { font-size: 16px; }
            .stat-number { font-size: 18px; }
            .gender-count { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>بطاقات التلاميذ الفردية - تحليل ش.ت.م</h1>
          <p>تحليل شهادة التعليم المتوسط - ${new Date().toLocaleDateString('ar-DZ')}</p>
        </div>
        
        <div class="cards-grid">
          ${finalList.map((student, idx) => {
            const globalIndex = idx;
            const annualAvg = (Number(student.moyT1 || 0) + Number(student.moyT2 || 0) + Number(student.moyT3 || 0)) / 3;
            const certificationAvg = Number(student.moyBEM) || null;
            const transitionAvg = Number(student.moyPassage) || null;
            
            // Trouver les données BEM pour cet élève
            const bemData = bemRows.find(row => {
              const rowName = (row['اللقب و الاسم'] || row['الاسم و اللقب'] || row.nom || '').toString().trim();
              const studentName = student.name || '';
              
              if (rowName === studentName) return true;
              
              const normalizeName = (name: string) => {
                return name
                  .replace(/[\u0617-\u061A\u064B-\u0652]/g, '')
                  .replace(/[أإآ]/g, 'ا')
                  .replace(/ة/g, 'ه')
                  .replace(/ى/g, 'ي')
                  .replace(/\s+/g, '')
                  .trim();
              };
              
              return normalizeName(rowName) === normalizeName(studentName);
            });
            
            return `
              <div class="student-card">
                <div class="card-header">
                  <h2>${student.name || `تلميذ ${globalIndex + 1}`}</h2>
                  <div class="rank-badge rank-${globalIndex === 0 ? '1' : globalIndex === 1 ? '2' : globalIndex === 2 ? '3' : 'other'}">
                    الترتيب: ${globalIndex + 1}
                    ${globalIndex === 0 ? ' 🥇' : globalIndex === 1 ? ' 🥈' : globalIndex === 2 ? ' 🥉' : ''}
                  </div>
                </div>
                
                <div class="info-section">
                  <h3>المعدل السنوي العام</h3>
                  <div class="average-display">${annualAvg.toFixed(2)}</div>
                  <p><strong>الفصل الأول:</strong> ${Number(student.moyT1 || 0).toFixed(2)}</p>
                  <p><strong>الفصل الثاني:</strong> ${Number(student.moyT2 || 0).toFixed(2)}</p>
                  <p><strong>الفصل الثالث:</strong> ${Number(student.moyT3 || 0).toFixed(2)}</p>
                </div>
                
                <div class="info-section">
                  <h3>معدل الشهادة (ش.ت.م)</h3>
                  <div class="average-display">${certificationAvg ? certificationAvg.toFixed(2) : 'غير محدد'}</div>
                </div>
                
                <div class="info-section">
                  <h3>معدل الإنتقال</h3>
                  <div class="average-display">${transitionAvg ? transitionAvg.toFixed(2) : 'غير محدد'}</div>
                  <p style="font-size: 12px; color: #6b7280;">(معدل الشهادة + معدل التقويم) ÷ 2</p>
                </div>
                
                <div class="info-section">
                  <h3>التوجيه النهائي</h3>
                  <p style="font-size: 16px; font-weight: bold; color: #059669;">${student.orientation || 'غير محدد'}</p>
                </div>
                
              </div>
            `;
          }).join('')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handlePrintStudentCards = () => {
    if (!finalList.length) {
      alert('لا توجد بيانات للطباعة');
      return;
    }

    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>بطاقات التلاميذ الفردية</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Amiri', Arial, sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.5;
            background: white;
            color: #1f2937;
            font-size: 11px;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .print-header h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: bold;
          }
          
          .print-header p {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .print-buttons {
            margin-top: 15px;
          }
          
          .print-buttons button {
            background: #059669;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            margin-left: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
          }
          
          .print-buttons button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .print-buttons button.close-btn {
            background: #dc2626;
          }
          
          .student-card {
            page-break-inside: avoid;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
          }
          
          .student-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          }
          
          .card-header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            position: relative;
          }
          
          .card-header::after {
            content: '';
            position: absolute;
            bottom: -8px;
            right: 20px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #1d4ed8;
          }
          
          .card-header h2 {
            font-size: 20px;
            margin-bottom: 5px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          
          .card-header p {
            font-size: 13px;
            margin: 0;
            opacity: 0.9;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-section {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-right: 4px solid #3b82f6;
            position: relative;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          
          .info-section.green {
            border-right-color: #059669;
            background: #f0fdf4;
          }
          
          .info-section.red {
            border-right-color: #dc2626;
            background: #fef2f2;
          }
          
          .info-section.purple {
            border-right-color: #7c3aed;
            background: #faf5ff;
          }
          
          .info-section h3 {
            font-size: 16px;
            margin: 0 0 12px 0;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-section h3::before {
            content: '';
            width: 4px;
            height: 20px;
            border-radius: 2px;
            background: currentColor;
          }
          
          .info-section h3.blue {
            color: #3b82f6;
          }
          
          .info-section h3.green {
            color: #059669;
          }
          
          .info-section h3.red {
            color: #dc2626;
          }
          
          .info-section h3.purple {
            color: #7c3aed;
          }
          
          .info-section p {
            margin: 6px 0;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }
          
          .info-section p:last-child {
            border-bottom: none;
          }
          
          .info-section p strong {
            color: #374151;
            font-weight: 600;
          }
          
          .info-section p.highlight {
            color: #059669;
            font-weight: bold;
            background: #ecfdf5;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #d1fae5;
          }
          
          .info-section p.highlight-red {
            color: #dc2626;
            font-weight: bold;
            background: #fef2f2;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #fecaca;
          }
          
          .subjects-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
            margin-top: 10px;
          }
          
          .subject-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
          }
          
          .subject-item:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .subject-item .subject-name {
            font-weight: 600;
            color: #374151;
            flex: 1;
          }
          
          .subject-item .subject-grade {
            font-weight: bold;
            font-size: 13px;
            padding: 4px 8px;
            border-radius: 4px;
            min-width: 40px;
            text-align: center;
          }
          
          .subject-item .subject-grade.pass {
            color: #059669;
            background: #ecfdf5;
            border: 1px solid #d1fae5;
          }
          
          .subject-item .subject-grade.fail {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
          }
          
          .card-footer {
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 8px;
            text-align: center;
            border-top: 3px solid #3b82f6;
            position: relative;
          }
          
          .card-footer::before {
            content: '';
            position: absolute;
            top: -3px;
            right: 50%;
            transform: translateX(50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid #3b82f6;
          }
          
          .card-footer p {
            color: #64748b;
            font-size: 12px;
            margin: 0;
            font-weight: 500;
          }
          
          .student-number {
            position: absolute;
            top: 15px;
            left: 15px;
            background: #3b82f6;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          @media print {
            body {
              margin: 0;
              padding: 15px;
              font-size: 10px;
            }
            
            .print-header {
              margin-bottom: 20px;
              padding: 15px;
            }
            
            .print-header h1 {
              font-size: 20px;
            }
            
            .print-buttons {
              display: none !important;
            }
            
            .student-card {
              page-break-inside: avoid;
              margin-bottom: 20px;
              padding: 15px;
              box-shadow: none;
              border: 1px solid #d1d5db;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            
            .subjects-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .info-section {
              padding: 12px;
            }
            
            .info-section h3 {
              font-size: 14px;
            }
            
            .info-section p {
              font-size: 11px;
            }
            
            .subject-item {
              padding: 6px 10px;
              font-size: 10px;
            }
            
            .card-header h2 {
              font-size: 18px;
            }
            
            .student-number {
              width: 25px;
              height: 25px;
              font-size: 12px;
            }
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <!-- En-tête général -->
        <div class="print-header">
          <h1>بطاقات التلاميذ الفردية - تحليل ش.ت.م</h1>
          <p>التعليم المتوسط - ${new Date().toLocaleDateString('ar-DZ')} - إجمالي التلاميذ: ${finalList.length}</p>
          <div class="print-buttons">
            <button onclick="window.print()">🖨️ طباعة</button>
            <button onclick="window.close()" class="close-btn">❌ إغلاق</button>
          </div>
        </div>
        
        ${finalList.map((student, index) => {
          const annualAvg = (Number(student.moyT1 || 0) + Number(student.moyT2 || 0) + Number(student.moyT3 || 0)) / 3;
          const bemAvg = Number(student.moyBEM || 0);
          const transitionAvg = (annualAvg + bemAvg) / 2;
          
          // Debug: vérifier si bemRows contient des données
          if (index === 0) {
            console.log('=== DEBUG BEM ROWS ===');
            console.log('Nombre de lignes BEM:', bemRows.length);
            console.log('Première ligne BEM:', bemRows[0]);
            console.log('=== FIN DEBUG BEM ROWS ===');
          }
          
          // Trouver les données BEM pour cet élève avec une correspondance plus flexible
          console.log(`Recherche BEM pour élève: "${student.name}"`);
          const bemData = bemRows.find(row => {
            const rowName = (row['اللقب و الاسم'] || row['الاسم و اللقب'] || row.nom || '').toString().trim();
            const studentName = student.name || '';
            
            // Correspondance exacte
            if (rowName === studentName) return true;
            
            // Correspondance après normalisation
            const normalizeName = (name: string) => {
              return name
                .replace(/[\u0617-\u061A\u064B-\u0652]/g, '') // remove diacritics
                .replace(/[أإآ]/g, 'ا')
                .replace(/ة/g, 'ه')
                .replace(/ى/g, 'ي')
                .replace(/\s+/g, '') // remove all spaces
                .trim();
            };
            
            return normalizeName(rowName) === normalizeName(studentName);
          });
          
          console.log(`Résultat recherche BEM pour "${student.name}":`, bemData ? 'TROUVÉ' : 'NON TROUVÉ');
          
          // Debug: afficher les informations de correspondance
          if (!bemData && bemRows.length > 0) {
            console.log('Élève non trouvé dans BEM:', {
              studentName: student.name,
              availableNames: bemRows.slice(0, 3).map(r => r['اللقب و الاسم'] || r['الاسم و اللقب'] || r.nom)
            });
          }
          
          // Debug: afficher les clés disponibles pour tous les élèves
          if (bemData) {
            console.log('=== DEBUG BEM DATA ===');
            console.log('Clés disponibles dans BEM pour le premier élève:', Object.keys(bemData));
            console.log('Matières recherchées:', bemSubjects);
            console.log('Données complètes BEM:', bemData);
            
            // Afficher toutes les clés qui contiennent des matières
            const allKeys = Object.keys(bemData);
            const subjectKeys = allKeys.filter(key => 
              key.includes('اللغة') || 
              key.includes('التربية') || 
              key.includes('التاريخ') || 
              key.includes('الرياضيات') || 
              key.includes('الطبيعة') || 
              key.includes('الفيزيائية') || 
              key.includes('المعلوماتية') || 
              key.includes('التشكيلية') || 
              key.includes('الموسيقية') || 
              key.includes('البدنية')
            );
            console.log('Clés de matières trouvées:', subjectKeys);
            
            // Tester la recherche pour chaque matière
            bemSubjects.forEach(subject => {
              const value = bemData[subject];
              console.log(`Recherche "${subject}":`, value);
            });
            console.log('=== FIN DEBUG ===');
          }
          
          return `
            <div class="student-card">
              <!-- Numéro de l'élève -->
              <div class="student-number">${index + 1}</div>
              
              <!-- En-tête de la carte -->
              <div class="card-header">
                <h2>بطاقة التلميذ الفردية</h2>
                <p>${new Date().toLocaleDateString('ar-DZ')}</p>
              </div>
              
              <!-- Informations de base -->
              <div class="info-grid">
                <div class="info-section">
                  <h3 class="blue">معلومات التلميذ</h3>
                  <p><strong>الاسم:</strong> <span>${student.name || `تلميذ ${index + 1}`}</span></p>
                  <p><strong>الجنس:</strong> <span>${student.gender === 'male' ? 'ذكر' : student.gender === 'female' ? 'أنثى' : 'غير محدد'}</span></p>
                  <p><strong>الترتيب:</strong> <span>${index + 1}</span></p>
                </div>
                
                <div class="info-section green">
                  <h3 class="green">المعدلات السنوية</h3>
                  <p><strong>معدل الفصل الأول:</strong> <span>${student.moyT1 ? Number(student.moyT1).toFixed(1) : 'غير محدد'}</span></p>
                  <p><strong>معدل الفصل الثاني:</strong> <span>${student.moyT2 ? Number(student.moyT2).toFixed(1) : 'غير محدد'}</span></p>
                  <p><strong>معدل الفصل الثالث:</strong> <span>${student.moyT3 ? Number(student.moyT3).toFixed(1) : 'غير محدد'}</span></p>
                  <p class="highlight"><strong>المعدل السنوي:</strong> <span>${annualAvg.toFixed(1)}</span></p>
                </div>
              </div>
              
              <!-- Résultats BEM -->
              <div class="info-section red">
                <h3 class="red">نتائج شهادة التعليم المتوسط</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <p><strong>معدل ش.ت.م:</strong> <span>${student.moyBEM ? Number(student.moyBEM).toFixed(1) : 'غير محدد'}</span></p>
                  <p><strong>معدل التقويم:</strong> <span>${student.moyEvaluation ? Number(student.moyEvaluation).toFixed(1) : 'غير محدد'}</span></p>
                  <p class="highlight-red"><strong>معدل الإنتقال:</strong> <span>${transitionAvg.toFixed(1)}</span></p>
                  <p class="highlight-red"><strong>التوجيه النهائي:</strong> <span>${student.orientation || 'غير محدد'}</span></p>
                </div>
              </div>
              
              <!-- Détails des matières BEM -->
              <div class="info-section purple">
                <h3 class="purple">تفاصيل المواد (14 مادة)</h3>
                <div class="subjects-grid">
                  ${bemSubjects.map(subject => {
                    let note = 0;
                    let displayNote = 'غير محدد';
                    
                    if (bemData) {
                      // Recherche directe avec le nom exact de la matière
                      const value = bemData[subject];
                      console.log(`Recherche matière "${subject}": valeur =`, value);
                      
                      if (value !== undefined && value !== null && value !== '') {
                        note = Number(value);
                        if (!isNaN(note) && note > 0) {
                          displayNote = note.toFixed(1);
                          console.log(`Note trouvée pour "${subject}": ${displayNote}`);
                        }
                      }
                      
                      // Si pas trouvé, essayer quelques variantes communes
                      if (displayNote === 'غير محدد') {
                        const variants = [
                          subject.replace(/[أإآ]/g, 'ا'),
                          subject.replace(/ة/g, 'ه'),
                          subject.replace(/ى/g, 'ي')
                        ];
                        
                        for (const variant of variants) {
                          const variantValue = bemData[variant];
                          console.log(`Test variante "${variant}": valeur =`, variantValue);
                          if (variantValue !== undefined && variantValue !== null && variantValue !== '') {
                            note = Number(variantValue);
                            if (!isNaN(note) && note > 0) {
                              displayNote = note.toFixed(1);
                              console.log(`Note trouvée via variante "${variant}": ${displayNote}`);
                              break;
                            }
                          }
                        }
                      }
                    } else {
                      console.log('Pas de données BEM pour cet élève');
                    }
                    
                    const isPass = note >= 10;
                    return `
                      <div class="subject-item">
                        <span class="subject-name">${subject}</span>
                        <span class="subject-grade ${isPass ? 'pass' : 'fail'}">${displayNote}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
              
              <!-- Pied de la carte -->
              <div class="card-footer">
                <p><strong>تم إنشاء هذه البطاقة في:</strong> ${new Date().toLocaleString('ar-DZ')}</p>
              </div>
            </div>
          `;
        }).join('')}
      </body>
      </html>
    `;

    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé
      printWindow.onload = () => {
        // Ne pas fermer automatiquement la fenêtre
        // L'utilisateur peut imprimer et fermer manuellement
        console.log('Fenêtre d\'impression prête');
      };
      
      // Focus sur la fenêtre d'impression
      printWindow.focus();
    } else {
      alert('لا يمكن فتح نافذة الطباعة. تأكد من السماح للنوافذ المنبثقة.');
    }
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
      {/* En-tête avec flèche de retour */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          title="Retour à la لوحة القيادة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800">تحليل ش.ت.م - التعليم المتوسط</h1>
      </div>

      {/* Header to keep tabs at same vertical position */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">تحليل ش.ت.م - التعليم المتوسط</h1>
          </div>
          <div className="no-print header-controls flex items-center gap-4">
            <button 
              onClick={handleUploadClick}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium shadow-md transition-all duration-200 hover:shadow-lg text-sm"
            >
              <Upload className="w-4 h-4" />
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
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium shadow-md transition-all duration-200 hover:shadow-lg text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              تحميل قالب BEM
            </button>
            
            
            {finalList.length > 0 && (
              <button
                onClick={handlePrintCurrentPage}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 flex items-center gap-2 font-medium shadow-md transition-all duration-200 hover:shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                طباعة
              </button>
            )}
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
                    await analysisDb.iterate((_: any, key: string) => {
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
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 font-medium shadow-md transition-all duration-200 hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              تفريغ
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      </div>
      

      {/* Tabs: keep visible across analysis pages */}
      <div className="no-print tabs mt-2 mb-4 flex flex-wrap gap-2">
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
        <div className="no-print banner bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-900">
          <div className="font-semibold mb-2">⚠️ لم يتم استيراد ملف BEM بعد</div>
          <div className="text-sm">
            <p>• يجب رفع ملف BEM يحتوي على عمود "معدل ش.ت.م"</p>
              <p>• "معدل التقويم" = (الفصل الأول + الفصل الثاني + الفصل الثالث) ÷ 3</p>
              <p>• "معدل الإنتقال" = (معدل ش.ت.م + معدل التقويم) ÷ 2</p>
            <p>• "التوجيه النهائي": جدع مشترك علوم أو جدع مشترك أداب</p>
            <p>• التوجيه يعتمد على أداء التلميذ في المواد العلمية مقابل الأدبية</p>
          </div>
        </div>
      )}


      {/* تحليل التوجيه التدريجي - Only show when BEM file is imported */}
      {bemRows.length > 0 && finalList.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">📊 تحليل التوجيه التدريجي</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">{progressiveGuidance.scienceOriented}</div>
              <div className="text-lg font-semibold text-green-800 mb-1">جدع مشترك علوم</div>
              <div className="text-sm text-green-600">
                {progressiveGuidance.total > 0 ? 
                  ((progressiveGuidance.scienceOriented / progressiveGuidance.total) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">{progressiveGuidance.artsOriented}</div>
              <div className="text-lg font-semibold text-blue-800 mb-1">جدع مشترك أداب</div>
              <div className="text-sm text-blue-600">
                {progressiveGuidance.total > 0 ? 
                  ((progressiveGuidance.artsOriented / progressiveGuidance.total) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-amber-700 mb-2">{progressiveGuidance.undefined}</div>
              <div className="text-lg font-semibold text-amber-800 mb-1">إعادة السنة</div>
              <div className="text-sm text-amber-600">
                {progressiveGuidance.total > 0 ? 
                  ((progressiveGuidance.undefined / progressiveGuidance.total) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </div>
            </div>
          </div>

          {/* Explication des critères */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">📋 تحليل التوجيه التدريجي - التعليم المتوسط</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>جدع مشترك علوم (13 تلميذ):</strong> التلاميذ الموجهون نحو الشعبة العلمية</p>
              <p>• <strong>جدع مشترك أداب (43 تلميذ):</strong> التلاميذ الموجهون نحو الشعبة الأدبية</p>
              <p>• <strong>إعادة السنة:</strong> التلاميذ الذين يحتاجون إلى إعادة السنة لتحسين الأداء</p>
              <p>• <strong>إجمالي التلاميذ:</strong> {progressiveGuidance.total} تلميذ</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards - Only show when BEM file is imported */}
      {bemRows.length > 0 && (
      <div className="space-y-4">
        
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
      </div>
      )}

      {/* Individual Student Cards with Pagination - Only show when BEM file is imported */}
      {bemRows.length > 0 && finalList.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-800">📋 بطاقات التلاميذ الفردية</h3>
            </div>
            
            {/* Page size selector */}
            <div className="no-print flex items-center gap-2">
              <label className="text-sm text-gray-600">عدد البطاقات في الصفحة:</label>
              <select 
                value={cardsPerPage} 
                onChange={(e) => setCardsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="student-cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentCards.map((student, idx) => {
              const globalIndex = startIndex + idx;
              const annualAvg = (Number(student.moyT1 || 0) + Number(student.moyT2 || 0) + Number(student.moyT3 || 0)) / 3;
              const certificationAvg = Number(student.moyBEM) || null; // معدل الشهادة = Moyenne des 14 matières BEM
              const transitionAvg = Number(student.moyPassage) || null; // معدل الإنتقال
              
              return (
                <div key={`card-${student.name}-${globalIndex}`} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 shadow-md">
                  <div className="text-center mb-5">
                    <div className="text-xl font-bold text-gray-800 mb-2">{student.name}</div>
                    <div className={`text-sm font-bold px-4 py-2 rounded-full shadow-sm ${
                      globalIndex === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' : // الترتيب: 1 (or)
                      globalIndex === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300' : // الترتيب: 2 (argent)
                      globalIndex === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300' : // الترتيب: 3 (bronze)
                      'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' // Autres rangs
                    }`}>
                      الترتيب: {globalIndex + 1}
                      {globalIndex === 0 && ' 🥇'}
                      {globalIndex === 1 && ' 🥈'}
                      {globalIndex === 2 && ' 🥉'}
                    </div>
                  </div>
                  
                  {/* المعدل السنوي العام */}
                  <div className="mb-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-3">المعدل السنوي العام</div>
                      <div className="text-3xl font-bold text-blue-600 mb-4">{annualAvg.toFixed(2)}</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
                          <span className="text-sm font-medium text-blue-800">الفصل الأول</span>
                          <span className="text-lg font-bold text-blue-600">{Number(student.moyT1 || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded-md border-l-4 border-green-400">
                          <span className="text-sm font-medium text-green-800">الفصل الثاني</span>
                          <span className="text-lg font-bold text-green-600">{Number(student.moyT2 || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md border-l-4 border-purple-400">
                          <span className="text-sm font-medium text-purple-800">الفصل الثالث</span>
                          <span className="text-lg font-bold text-purple-600">{Number(student.moyT3 || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* معدل الشهادة (BEM) */}
                  <div className="mb-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-3">معدل الشهادة (ش.ت.م)</div>
                      <div className="text-3xl font-bold text-green-600">
                        {certificationAvg && certificationAvg > 0 ? certificationAvg.toFixed(2) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* معدل الإنتقال */}
                  <div className="mb-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-3">معدل الإنتقال</div>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {transitionAvg && transitionAvg > 0 ? transitionAvg.toFixed(2) : '—'}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
                        {transitionAvg && transitionAvg > 0 ? 
                          `(معدل الشهادة + معدل التقويم) ÷ 2` : 
                          'يتطلب معدل الشهادة ومعدل التقويم'
                        }
                      </div>
                    </div>
                  </div>

                  {/* التوجيه النهائي */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-3">التوجيه النهائي</div>
                      <div className={`text-xl font-bold p-3 rounded-lg ${
                        student.orientation === 'جدع مشترك علوم' ? 'text-green-700 bg-green-50 border border-green-200' :
                        student.orientation === 'جدع مشترك أداب' ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                        student.orientation === 'إعادة السنة' ? 'text-red-700 bg-red-50 border border-red-200' : 
                        'text-gray-700 bg-gray-50 border border-gray-200'
                      }`}>
                        {student.orientation || 'غير محدد'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="no-print pagination-controls flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                عرض {startIndex + 1} إلى {Math.min(endIndex, finalList.length)} من {finalList.length} تلميذ
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  الأولى
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  السابق
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  التالي
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  الأخيرة
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Panel - Only show when BEM file is imported */}
      {bemRows.length > 0 && finalList.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 التحقق من صحة الحسابات</h3>
          <div className={`p-4 rounded-lg border-l-4 ${validateCalculations.isValid ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg font-bold ${validateCalculations.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validateCalculations.isValid ? '✅ جميع الحسابات صحيحة' : '❌ تم اكتشاف مشاكل في الحسابات'}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              عدد التلاميذ: {validateCalculations.totalStudents}
            </div>
            {validateCalculations.issues.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold text-red-600 mb-2">المشاكل المكتشفة:</div>
                <ul className="text-sm text-red-600 space-y-1">
                  {validateCalculations.issues.slice(0, 5).map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                  {validateCalculations.issues.length > 5 && (
                    <li className="text-gray-500">... و {validateCalculations.issues.length - 5} مشكلة أخرى</li>
                  )}
                </ul>
              </div>
            )}
            {validateCalculations.corrections.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold text-blue-600 mb-2">التصحيحات المقترحة:</div>
                <ul className="text-sm text-blue-600 space-y-1">
                  {validateCalculations.corrections.slice(0, 3).map((correction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">💡</span>
                      <span>{correction}</span>
                    </li>
                  ))}
                  {validateCalculations.corrections.length > 3 && (
                    <li className="text-gray-500">... و {validateCalculations.corrections.length - 3} تصحيح آخر</li>
                  )}
                </ul>
              </div>
            )}
            {validateCalculations.sectionComparisons.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold text-purple-600 mb-2">مقارنة بين الأقسام:</div>
                <ul className="text-sm text-purple-600 space-y-1">
                  {validateCalculations.sectionComparisons.slice(0, 3).map((comparison, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">🔄</span>
                      <span>{comparison}</span>
                    </li>
                  ))}
                  {validateCalculations.sectionComparisons.length > 3 && (
                    <li className="text-gray-500">... و {validateCalculations.sectionComparisons.length - 3} مقارنة أخرى</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* توزيع التوجيهات المقترحة - Only show when BEM file is imported */}
      {bemRows.length > 0 && finalList.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 توزيع التوجيهات المقترحة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{orientationDistribution.distribution['علمي']}</div>
              <div className="text-sm font-semibold text-blue-800 mb-1">علمي</div>
              <div className="text-xs text-blue-600">{orientationDistribution.percentages['علمي']}%</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{orientationDistribution.distribution['تقني']}</div>
              <div className="text-sm font-semibold text-green-800 mb-1">تقني</div>
              <div className="text-xs text-green-600">{orientationDistribution.percentages['تقني']}%</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{orientationDistribution.distribution['مهني']}</div>
              <div className="text-sm font-semibold text-orange-800 mb-1">مهني</div>
              <div className="text-xs text-orange-600">{orientationDistribution.percentages['مهني']}%</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600 mb-1">{orientationDistribution.distribution['غير محدد']}</div>
              <div className="text-sm font-semibold text-gray-800 mb-1">غير محدد</div>
              <div className="text-xs text-gray-600">{orientationDistribution.percentages['غير محدد']}%</div>
            </div>
          </div>
        </div>
      )}

      {/* General Statistics - Only show when BEM file is imported */}
      {bemRows.length > 0 && finalList.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">📊 الإحصائيات العامة</h3>
          
          {/* Basic Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* المسجلين */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">{finalList.length}</div>
              <div className="text-lg font-semibold text-blue-800 mb-1">المسجلين</div>
              <div className="text-sm text-blue-600">إجمالي التلاميذ المسجلين</div>
            </div>

            {/* الناجحين */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">
                {finalList.filter(student => {
                  const transitionAvg = student.moyPassage;
                  return transitionAvg != null && transitionAvg >= 10;
                }).length}
              </div>
              <div className="text-lg font-semibold text-green-800 mb-1">الناجحين</div>
              <div className="text-sm text-green-600">التلاميذ الناجحون</div>
            </div>

            {/* الراسبون */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-700 mb-2">
                {finalList.filter(student => {
                  const transitionAvg = student.moyPassage;
                  return transitionAvg != null && transitionAvg < 10;
                }).length}
              </div>
              <div className="text-lg font-semibold text-red-800 mb-1">الراسبون</div>
              <div className="text-sm text-red-600">التلاميذ الراسبون</div>
            </div>

            {/* إعادة السنة */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-orange-700 mb-2">
                {finalList.filter(student => {
                  const transitionAvg = student.moyPassage;
                  const birthDate = student.birthDate || student.dateNaissance;
                  
                  // Logique de redoublement : moyenne < 10 ET âge approprié pour redoubler
                  if (transitionAvg == null || transitionAvg >= 10) return false;
                  
                  // Si on a une date de naissance, vérifier l'âge
                  if (birthDate) {
                    const birthYear = new Date(birthDate).getFullYear();
                    const currentYear = new Date().getFullYear();
                    const age = currentYear - birthYear;
                    
                    // Considérer comme redoublant si âge entre 15-18 ans (âge typique pour 4ème moyenne)
                    return age >= 15 && age <= 18;
                  }
                  
                  // Si pas de date de naissance, considérer tous les échecs comme redoublants
                  return true;
                }).length}
              </div>
              <div className="text-lg font-semibold text-orange-800 mb-1">إعادة السنة</div>
              <div className="text-sm text-orange-600">التلاميذ الذين يعيدون السنة</div>
            </div>
          </div>

          {/* Statistics by Gender */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">📈 الإحصائيات حسب الجنس</h4>
            {(() => {
              // Calculer les statistiques une seule fois
              const boys = finalList.filter(student => {
                const gender = (student.gender || student.sexe || student.sex || '').toString().toLowerCase();
                return gender === 'male' || gender === 'ذكر' || gender === 'm' || gender === 'garçon' || gender === 'garcon';
              });
              
              const girls = finalList.filter(student => {
                const gender = (student.gender || student.sexe || student.sex || '').toString().toLowerCase();
                return gender === 'female' || gender === 'أنثى' || gender === 'f' || gender === 'fille' || gender.includes('أنث');
              });
              
              const boysSuccessful = boys.filter(student => {
                const transitionAvg = student.moyPassage;
                return transitionAvg != null && transitionAvg >= 10;
              });
              
              const boysFailed = boys.filter(student => {
                const transitionAvg = student.moyPassage;
                return transitionAvg != null && transitionAvg < 10;
              });
              
              const girlsSuccessful = girls.filter(student => {
                const transitionAvg = student.moyPassage;
                return transitionAvg != null && transitionAvg >= 10;
              });
              
              const girlsFailed = girls.filter(student => {
                const transitionAvg = student.moyPassage;
                return transitionAvg != null && transitionAvg < 10;
              });
              
              // Ajouter les redoublants par sexe
              const boysRedoublants = boys.filter(student => {
                const transitionAvg = student.moyPassage;
                const birthDate = student.birthDate || student.dateNaissance;
                
                if (transitionAvg == null || transitionAvg >= 10) return false;
                
                if (birthDate) {
                  const birthYear = new Date(birthDate).getFullYear();
                  const currentYear = new Date().getFullYear();
                  const age = currentYear - birthYear;
                  return age >= 15 && age <= 18;
                }
                
                return true;
              });
              
              const girlsRedoublants = girls.filter(student => {
                const transitionAvg = student.moyPassage;
                const birthDate = student.birthDate || student.dateNaissance;
                
                if (transitionAvg == null || transitionAvg >= 10) return false;
                
                if (birthDate) {
                  const birthYear = new Date(birthDate).getFullYear();
                  const currentYear = new Date().getFullYear();
                  const age = currentYear - birthYear;
                  return age >= 15 && age <= 18;
                }
                
                return true;
              });
              
              const boysPercentage = finalList.length > 0 ? ((boys.length / finalList.length) * 100).toFixed(2) : '0.00';
              const boysSuccessPercentage = finalList.length > 0 ? ((boysSuccessful.length / finalList.length) * 100).toFixed(2) : '0.00';
              const boysFailPercentage = finalList.length > 0 ? ((boysFailed.length / finalList.length) * 100).toFixed(2) : '0.00';
              const boysRedoublePercentage = finalList.length > 0 ? ((boysRedoublants.length / finalList.length) * 100).toFixed(2) : '0.00';
              
              const girlsPercentage = finalList.length > 0 ? ((girls.length / finalList.length) * 100).toFixed(2) : '0.00';
              const girlsSuccessPercentage = finalList.length > 0 ? ((girlsSuccessful.length / finalList.length) * 100).toFixed(2) : '0.00';
              const girlsFailPercentage = finalList.length > 0 ? ((girlsFailed.length / finalList.length) * 100).toFixed(2) : '0.00';
              const girlsRedoublePercentage = finalList.length > 0 ? ((girlsRedoublants.length / finalList.length) * 100).toFixed(2) : '0.00';
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Garçons */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-blue-800 mb-4 text-center">الذكور</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">الذكور المسجلون :</span>
                        <span className="font-bold text-blue-800">
                          {boys.length} ({boysPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">الذكور الناجحون :</span>
                        <span className="font-bold text-green-800">
                          {boysSuccessful.length} ({boysSuccessPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">الذكور الراسبون :</span>
                        <span className="font-bold text-red-800">
                          {boysFailed.length} ({boysFailPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">الذكور الذين يعيدون السنة :</span>
                        <span className="font-bold text-orange-800">
                          {boysRedoublants.length} ({boysRedoublePercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Filles */}
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-pink-800 mb-4 text-center">الإناث</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-pink-600">الإناث المسجلات :</span>
                        <span className="font-bold text-pink-800">
                          {girls.length} ({girlsPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">الإناث الناجحات :</span>
                        <span className="font-bold text-green-800">
                          {girlsSuccessful.length} ({girlsSuccessPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">الإناث الراسبات :</span>
                        <span className="font-bold text-red-800">
                          {girlsFailed.length} ({girlsFailPercentage}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-600">الإناث اللواتي يعيدن السنة :</span>
                        <span className="font-bold text-orange-800">
                          {girlsRedoublants.length} ({girlsRedoublePercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Statistical Calibration */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">📐 المعايرة الإحصائية</h4>
            {(() => {
              const allNotes = finalList.flatMap(student => [
                Number(student.moyT1 || 0),
                Number(student.moyT2 || 0),
                Number(student.moyT3 || 0),
                Number(student.moyBEM || 0)
              ]).filter(note => note > 0);
              
              if (allNotes.length === 0) {
                return (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <div>لا توجد بيانات للتحليل الإحصائي</div>
                  </div>
                );
              }
              
              const mean = allNotes.reduce((sum, note) => sum + note, 0) / allNotes.length;
              const variance = allNotes.reduce((sum, note) => sum + Math.pow(note - mean, 2), 0) / allNotes.length;
              const standardDeviation = Math.sqrt(variance);
              const harmonyRatio = (standardDeviation / mean) * 100;
              
              // Déterminer la catégorie
              let categoryColor = '';
              let categoryDescription = '';
              
              if (harmonyRatio <= 10) {
                categoryColor = 'text-green-700 bg-green-100';
                categoryDescription = 'فئة ممتازة - انسجام عالي';
              } else if (harmonyRatio <= 20) {
                categoryColor = 'text-blue-700 bg-blue-100';
                categoryDescription = 'فئة جيدة - انسجام نسبي';
              } else if (harmonyRatio <= 30) {
                categoryColor = 'text-yellow-700 bg-yellow-100';
                categoryDescription = 'فئة ضعيفة - تشتت متوسط';
              } else {
                categoryColor = 'text-red-700 bg-red-100';
                categoryDescription = 'فئة ضعيفة جداً - تشتت و اختلاف';
              }
              
              return (
                <div className="space-y-6">
                  {/* Statistiques principales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">المتوسط الحسابي</div>
                      <div className="text-xs text-gray-500 mb-2">المتوسط العام للدرجات</div>
                      <div className="text-2xl font-bold text-gray-800">{mean.toFixed(2)}</div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">الانحراف المعياري</div>
                      <div className="text-xs text-gray-500 mb-2">مقياس التشتت</div>
                      <div className="text-2xl font-bold text-gray-800">{standardDeviation.toFixed(2)}</div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">نسبة الانسجام</div>
                      <div className="text-xs text-gray-500 mb-2">(الانحراف_المعياري / المتوسط_الحسابي) × 100</div>
                      <div className="text-2xl font-bold text-gray-800">{harmonyRatio.toFixed(2)}%</div>
                    </div>
                  </div>
                  
                  {/* Classification */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-gray-700 mb-4">🎯 تصنيف الأداء</h5>
                    <div className="text-center">
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${categoryColor}`}>
                        {categoryDescription}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        نسبة الانسجام: {harmonyRatio.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Exemples de référence */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h6 className="text-sm font-semibold text-blue-800 mb-3">📚 أمثلة مرجعية</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-green-700">مثال: مادة العربية</div>
                        <div className="text-gray-600">المتوسط: 12.95 | الانحراف: 2.04</div>
                        <div className="text-green-600 font-medium">الانسجام: 15.72% (انسجام نسبي)</div>
                      </div>
                      <div className="bg-white rounded p-3">
                        <div className="font-semibold text-red-700">مثال: مادة الفرنسية</div>
                        <div className="text-gray-600">المتوسط: 9.46 | الانحراف: 3.22</div>
                        <div className="text-red-600 font-medium">الانسجام: 34.00% (تشتت و اختلاف)</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Table - Only show when BEM file is imported */}
      {bemRows.length > 0 && (
      <div className="bg-white rounded-lg shadow-sm border p-6 overflow-x-auto">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">قائمة التوجيه النهائي</h3>
          <button
            onClick={printFinalList}
            className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
            title="طباعة القائمة"
          >
            طباعة
          </button>
        </div>
        <table className="w-full border-collapse border border-gray-300 final-list-table">
          <thead>
            <tr className="bg-blue-50 border-b-2 border-blue-200">
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الترتيب</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">
                <div>اللقب</div>
                <div>و الاسم</div>
              </th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الفصل الأول</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الفصل الثاني</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">الفصل الثالث</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">المعدل السنوي العام</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">معدل ش.ت.م</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">معدل التقويم</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">معدل الإنتقال</th>
              <th className="border border-gray-300 p-3 text-center font-bold text-blue-800 bg-blue-100">التوجيه النهائي</th>
            </tr>
          </thead>
          <tbody>
            {finalList.length > 0 ? (
              finalList.map((e, idx) => {
                const annualAvg = (Number(e.moyT1 || 0) + Number(e.moyT2 || 0) + Number(e.moyT3 || 0)) / 3;
                const bemAvg = Number(e.moyBEM || 0);
                // معدل الإنتقال = (معدل الشهادة + معدل التقويم) ÷ 2
                const evaluationAvg = (Number(e.moyT1 || 0) + Number(e.moyT2 || 0) + Number(e.moyT3 || 0)) / 3;
                const transitionAvg = (bemAvg + evaluationAvg) / 2;
                return (
                  <tr key={e.name + idx} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="border border-gray-300 p-3 text-center font-medium">{idx + 1}</td>
                    <td className="border border-gray-300 p-3 text-center font-medium">{e.name}</td>
                    <td className="border border-gray-300 p-3 text-center">{Number(e.moyT1 || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{Number(e.moyT2 || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{Number(e.moyT3 || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold text-blue-700 bg-blue-50 annual-avg">{annualAvg.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{e.moyBEM == null ? '—' : Number(e.moyBEM || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold text-purple-700 bg-purple-50 evaluation-avg">{evaluationAvg.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold bg-green-50 transition-avg">{transitionAvg.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      {e.orientation ? (
                        <span className={
                          e.orientation === 'جدع مشترك علوم' ? 'text-green-700 font-bold orientation-sciences' :
                          e.orientation === 'جدع مشترك أداب' ? 'text-sky-700 font-bold orientation-literature' :
                          e.orientation === 'إعادة السنة' ? 'text-amber-700 font-bold orientation-repeat' : 'text-gray-700'
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
                <td colSpan={10} className="border border-gray-300 p-8 text-center text-gray-500 bg-gray-50">
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
        
        {/* Evaluation section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">تقييم مستشار(ة) التوجيه:</h4>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="أدخل تقييمك هنا..."
            style={{ minHeight: '100px' }}
            value={orientationEvaluation}
            onChange={(e) => setOrientationEvaluation(e.target.value)}
          />
        </div>
      </div>
      )}

      {/* Requirements info - only show when no BEM data */}
      {bemRows.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-800">
            <div className="font-semibold mb-2">📋 متطلبات التحليل</div>
            <div className="text-sm space-y-1">
              <p>• رفع ملف BEM يحتوي على عمود "معدل ش.ت.م"</p>
              <p>• استيراد ملفات الفصول 1 و 2 و 3 لنفس الدورة</p>
              <p>• التأكد من تطابق أسماء التلاميذ في جميع الملفات</p>
              <p>• "معدل الإنتقال" = (معدل ش.ت.م + معدل التقويم) ÷ 2</p>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}



