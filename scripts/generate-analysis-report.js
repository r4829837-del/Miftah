import XLSX from 'xlsx';

// Données d'exemple basées sur l'exemple fourni
const studentData = [
  { id: 1, name: "بلحسن عبد الرزاق", sciences: 18.77, literature: 17.80, orientation: "جذع مشترك علوم وتكنولوجيا", section: "01", level: "رابعة متوسط" },
  { id: 2, name: "طعام خلود", sciences: 18.75, literature: 17.34, orientation: "جذع مشترك علوم وتكنولوجيا", section: "01", level: "رابعة متوسط" },
  { id: 3, name: "بن موسى رحاب", sciences: 17.94, literature: 17.83, orientation: "جذع مشترك علوم وتكنولوجيا", section: "01", level: "رابعة متوسط" },
  { id: 4, name: "عبد الوهاب أحمد الصادق", sciences: 15.92, literature: 15.53, orientation: "جذع مشترك علوم وتكنولوجيا", section: "01", level: "رابعة متوسط" },
  { id: 5, name: "بلقاسم محمد رؤوف", sciences: 13.63, literature: 15.76, orientation: "جذع مشترك آداب", section: "01", level: "رابعة متوسط" },
  { id: 6, name: "حاج علال محمد الأمين", sciences: 13.99, literature: 14.55, orientation: "جذع مشترك آداب", section: "01", level: "رابعة متوسط" },
  { id: 7, name: "قرجيج مروان", sciences: 14.76, literature: 14.15, orientation: "جذع مشترك علوم وتكنولوجيا", section: "01", level: "رابعة متوسط" },
  { id: 8, name: "طبيب سارة صمود", sciences: 14.86, literature: 14.50, orientation: "جذع مشترك علوم وتكنولوجيا", section: "01", level: "رابعة متوسط" },
  { id: 9, name: "بن عودة سرين عين الحياة", sciences: 13.55, literature: 15.56, orientation: "جذع مشترك آداب", section: "01", level: "رابعة متوسط" },
  { id: 10, name: "مكي زكريا", sciences: 12.62, literature: 15.34, orientation: "جذع مشترك آداب", section: "01", level: "رابعة متوسط" }
];

// Données des matières avec leurs statistiques
const subjectStats = [
  { subject: "اللغة العربية", present: 65, mean: 12.11, stdDev: 2.29, note: "أداء جيد وثابت" },
  { subject: "اللغة الأمازيغية", present: 0, mean: 0.00, stdDev: 0.00, note: "لم تدرس" },
  { subject: "اللغة الفرنسية", present: 65, mean: 11.72, stdDev: 3.06, note: "أداء جيد لكنه متنوع" },
  { subject: "اللغة الإنجليزية", present: 65, mean: 10.75, stdDev: 3.64, note: "أداء جيد لكنه متنوع" },
  { subject: "التربية الإسلامية", present: 65, mean: 14.35, stdDev: 2.81, note: "أداء جيد وثابت" },
  { subject: "التربية المدنية", present: 65, mean: 12.10, stdDev: 3.68, note: "أداء جيد لكنه متنوع" },
  { subject: "التاريخ والجغرافيا", present: 65, mean: 13.46, stdDev: 3.70, note: "أداء جيد لكنه متنوع" },
  { subject: "الرياضيات", present: 65, mean: 9.91, stdDev: 3.48, note: "أداء ضعيف وغير مستقر" },
  { subject: "العلوم الطبيعية والحياة", present: 65, mean: 12.09, stdDev: 3.56, note: "أداء جيد لكنه متنوع" },
  { subject: "العلوم الفزيائية", present: 65, mean: 11.84, stdDev: 4.14, note: "أداء جيد لكنه متنوع" },
  { subject: "الإعلام الآلي", present: 65, mean: 17.23, stdDev: 2.26, note: "أداء ممتاز" },
  { subject: "التربية التشكيلية", present: 65, mean: 18.00, stdDev: 0.00, note: "أداء ممتاز" },
  { subject: "التربية الموسيقية", present: 0, mean: 0.00, stdDev: 0.00, note: "لم تدرس" },
  { subject: "التربية البدنية", present: 65, mean: 18.06, stdDev: 0.24, note: "أداء ممتاز" },
  { subject: "المعدل", present: 65, mean: 12.56, stdDev: 2.35, note: "أداء جيد وثابت" }
];

// Fonction pour calculer les statistiques par catégorie
function calculateCategoryStats(subject, notes) {
  const total = notes.length;
  const excellent = notes.filter(n => n >= 10).length;
  const good = notes.filter(n => n >= 8 && n < 10).length;
  const weak = notes.filter(n => n < 8).length;
  
  return {
    excellent: { count: excellent, percentage: ((excellent / total) * 100).toFixed(2) },
    good: { count: good, percentage: ((good / total) * 100).toFixed(2) },
    weak: { count: weak, percentage: ((weak / total) * 100).toFixed(2) }
  };
}

// Fonction pour calculer le coefficient de variation
function calculateCoefficientOfVariation(mean, stdDev) {
  if (mean === 0) return { cv: "NaN", note: "لم تدرس" };
  const cv = (stdDev / mean) * 100;
  let note = "";
  if (cv < 15) note = "هناك إنسجام تام";
  else if (cv < 20) note = "هناك إنسجام نسبي";
  else if (cv < 25) note = "هناك إنسجام نسبي";
  else note = "هناك تشتت واختلاف";
  
  return { cv: cv.toFixed(2), note };
}

// Créer le workbook
const wb = XLSX.utils.book_new();

// 1. Feuille des étudiants avec orientation
const studentSheet = XLSX.utils.json_to_sheet(studentData.map(s => ({
  "الرقم": s.id,
  "اللقب و الاسم": s.name,
  "علوم وتكنولوجيا": s.sciences,
  "آداب": s.literature,
  "التوجيه التدريجي": s.orientation,
  "القسم": s.section,
  "المستوى": s.level
})));

XLSX.utils.book_append_sheet(wb, studentSheet, "كيفية حساب التوجيه");

// 2. Feuille des statistiques par matière
const statsSheet = XLSX.utils.json_to_sheet(subjectStats.map(s => ({
  "المواد": s.subject,
  "الحاضرون": s.present,
  "معدل القسم": s.mean,
  "الإنحراف المعياري": s.stdDev,
  "ملاحظة": s.note
})));

XLSX.utils.book_append_sheet(wb, statsSheet, "التوجيه التجريبي");

// 3. Feuille des catégories de notes (simulées)
const categoryData = subjectStats.map(s => {
  const stats = calculateCategoryStats(s.subject, Array(65).fill(s.mean));
  return {
    "المادة": s.subject,
    "10 ≤": stats.excellent.count,
    "نسبة 10 ≤": stats.excellent.percentage + "%",
    "من 8 إلى 9,99": stats.good.count,
    "نسبة 8-9.99": stats.good.percentage + "%",
    "أقل من 08": stats.weak.count,
    "نسبة <8": stats.weak.percentage + "%",
    "ملاحظة": s.note.includes("ضعيف") ? "للمعالجة" : "مقبول"
  };
});

const categorySheet = XLSX.utils.json_to_sheet(categoryData);
XLSX.utils.book_append_sheet(wb, categorySheet, "تحليل حسب الفئات");

// 4. Feuille des taux de réussite
const successData = subjectStats.map(s => {
  const successCount = s.mean >= 10 ? 65 : Math.floor(65 * (s.mean / 20));
  const successRate = ((successCount / 65) * 100).toFixed(2);
  return {
    "المادة": s.subject,
    "عدد الناجحين": successCount,
    "نسبة النجاح": successRate + "%",
    "ملاحظة": s.note.includes("ضعيف") ? "للمعالجة" : "مقبول"
  };
});

const successSheet = XLSX.utils.json_to_sheet(successData);
XLSX.utils.book_append_sheet(wb, successSheet, "تحليل حسب النجاح");

// 5. Feuille du coefficient de variation
const cvData = subjectStats.map(s => {
  const cv = calculateCoefficientOfVariation(s.mean, s.stdDev);
  return {
    "المواد": s.subject,
    "نسبة الإنسجام": cv.cv + "%",
    "ملاحظة": cv.note
  };
});

const cvSheet = XLSX.utils.json_to_sheet(cvData);
XLSX.utils.book_append_sheet(wb, cvSheet, "نسبة الانسجام");

// 6. Feuille des indicateurs qualitatifs
const indicatorsData = [
  { "المؤشرات": "إمتياز", "العدد": 3, "النسبة": "4.62%" },
  { "المؤشرات": "تهنئة", "العدد": 5, "النسبة": "7.69%" },
  { "المؤشرات": "تشجيع", "العدد": 8, "النسبة": "12.31%" },
  { "المؤشرات": "لوحة شرف", "العدد": 22, "النسبة": "33.85%" },
  { "المؤشرات": "ملاحظة", "العدد": 27, "النسبة": "41.54%" },
  { "المؤشرات": "المجموع", "العدد": 65, "النسبة": "100.00%" }
];

const indicatorsSheet = XLSX.utils.json_to_sheet(indicatorsData);
XLSX.utils.book_append_sheet(wb, indicatorsSheet, "المؤشرات النوعية");

// Sauvegarder le fichier
XLSX.writeFile(wb, '../public/templates/تحليل_النتائج_الجديد.xlsx');
console.log('Fichier Excel généré avec succès!');