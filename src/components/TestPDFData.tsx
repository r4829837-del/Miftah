import React from 'react';
import { createProfessionalReport } from '../lib/pdfProfessionalReportSimple';

const TestPDFData: React.FC = () => {
  const generateTestPDF = async () => {
    try {
      console.log('Génération du PDF de test avec données...');
      
      // Données de test complètes
      const testData = {
        cycle: 'ثانوي',
        level: 'الثالثة ثانوي',
        semester: 'الفصل الأول',
        recordsCount: 56,
        average: '15.21',
        successRate: '78.5',
        standardDeviation: '3.2',
        totalStudents: 56,
        maleStudents: 32,
        femaleStudents: 24,
        attendanceRate: '92.5',
        absenceRate: '7.5',
        
        // التقديرات والمنح
        mentions: [
          { name: 'تميز', count: 5, percent: 8.93, threshold: '≥18' },
          { name: 'تهنئة', count: 12, percent: 21.43, threshold: '15-17.99' },
          { name: 'تشجيع', count: 15, percent: 26.79, threshold: '14-14.99' },
          { name: 'لوحة الشرف', count: 18, percent: 32.14, threshold: '12-13.99' },
          { name: 'بحاجة إلى تحسين', count: 6, percent: 10.71, threshold: '<12' }
        ],
        
        // ترتيب الأقسام
        classRanking: [
          { name: 'القسم 1', average: '16.5', successRate: '85.2', studentCount: 28 },
          { name: 'القسم 2', average: '15.8', successRate: '82.1', studentCount: 28 },
          { name: 'القسم 3', average: '14.2', successRate: '75.0', studentCount: 28 }
        ],
        
        // أفضل الطلاب
        topStudents: [
          { name: 'أحمد محمد', average: '18.5', mention: 'تميز' },
          { name: 'فاطمة علي', average: '18.2', mention: 'تميز' },
          { name: 'محمد حسن', average: '17.8', mention: 'تهنئة' },
          { name: 'عائشة أحمد', average: '17.5', mention: 'تهنئة' },
          { name: 'يوسف علي', average: '17.2', mention: 'تهنئة' },
          { name: 'مريم عبدالله', average: '16.8', mention: 'تهنئة' },
          { name: 'علي أحمد', average: '16.5', mention: 'تشجيع' },
          { name: 'فاطمة محمد', average: '16.2', mention: 'تشجيع' },
          { name: 'يوسف أحمد', average: '15.9', mention: 'تشجيع' },
          { name: 'نور الدين', average: '15.6', mention: 'تشجيع' }
        ],
        
        // تحليل المواد
        subjects: [
          { name: 'اللغة العربية', average: '15.8', successRate: '82.1', standardDeviation: '2.8', studentCount: 56 },
          { name: 'اللغة الفرنسية', average: '14.2', successRate: '75.0', standardDeviation: '3.1', studentCount: 56 },
          { name: 'اللغة الإنجليزية', average: '13.9', successRate: '71.4', standardDeviation: '3.4', studentCount: 56 },
          { name: 'الرياضيات', average: '16.1', successRate: '85.7', standardDeviation: '2.9', studentCount: 56 },
          { name: 'العلوم الطبيعية', average: '15.5', successRate: '80.4', standardDeviation: '3.0', studentCount: 56 },
          { name: 'العلوم الفيزيائية', average: '14.8', successRate: '76.8', standardDeviation: '3.2', studentCount: 56 },
          { name: 'التربية الإسلامية', average: '16.8', successRate: '89.3', standardDeviation: '2.5', studentCount: 56 },
          { name: 'التاريخ والجغرافيا', average: '15.2', successRate: '78.6', standardDeviation: '2.9', studentCount: 56 }
        ]
      };
      
      console.log('Données de test:', testData);
      
      const pdf = await createProfessionalReport(testData);
      
      // Sauvegarder le PDF
      const fileName = `test_rapport_professionnel_5_pages_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test PDF avec données complètes</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={generateTestPDF}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            🎯 Générer PDF de Test (5 Pages)
          </button>
        </div>
      </div>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2 text-blue-800">📊 Données de test incluses :</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li><strong>التقديرات والمنح:</strong> 5 types de mentions avec pourcentages</li>
          <li><strong>ترتيب الأقسام:</strong> 3 classes avec moyennes et taux de réussite</li>
          <li><strong>أفضل الطلاب:</strong> Top 10 étudiants avec moyennes et mentions</li>
          <li><strong>تحليل المواد:</strong> 8 matières avec statistiques détaillées</li>
          <li><strong>Tableaux agrandis:</strong> Police 16px, padding 18px, bordures 2px</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPDFData;