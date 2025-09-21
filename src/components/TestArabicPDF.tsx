import React from 'react';
import jsPDF from 'jspdf';
import { ensureArabicFont, addArabicText } from '../lib/pdfArabic';
import { createTestArabicPDF } from '../lib/pdfArabicAlternative';
import { createHTMLBasedPDF, createArabicHTMLContent } from '../lib/pdfArabicHTML';
import { createProfessionalReport } from '../lib/pdfProfessionalReportSimple';

const TestArabicPDF: React.FC = () => {
  const generateTestPDF = async () => {
    try {
      console.log('Début de la génération du PDF de test...');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // Charger la police arabe
      await ensureArabicFont(pdf);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      
      // Titre principal
      pdf.setFontSize(20);
      addArabicText(pdf, 'تقرير اختبار النص العربي', pageWidth / 2, y, { align: 'center', fontStyle: 'bold' });
      y += 20;
      
      // Test de différents textes arabes
      const testTexts = [
        'هذا نص تجريبي باللغة العربية',
        'إنشاء تقرير PDF',
        'تحليل النتائج - التعليم الثانوي',
        'المعلومات العامة',
        'الإحصائيات العامة',
        'أفضل الطلاب',
        'المؤسسة: مدرسة تجريبية',
        'المستوى: الثالثة ثانوي',
        'الفصل: الأول',
        'تاريخ التقرير: 2024-01-15'
      ];
      
      pdf.setFontSize(12);
      testTexts.forEach((text, index) => {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }
        
        addArabicText(pdf, text, margin, y);
        y += 10;
      });
      
      // Pied de page
      y = pdf.internal.pageSize.getHeight() - 20;
      pdf.setFontSize(10);
      addArabicText(pdf, `تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-SA')}`, pageWidth / 2, y, { align: 'center' });
      
      // Sauvegarder le PDF
      const fileName = `test_arabic_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF de test généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF de test:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const generateAlternativePDF = async () => {
    try {
      console.log('Génération du PDF alternatif...');
      const pdf = await createTestArabicPDF();
      
      // Sauvegarder le PDF
      const fileName = `test_arabic_alternative_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF alternatif généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF alternatif:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const generateHTMLBasedPDF = async () => {
    try {
      console.log('Génération du PDF basé sur HTML...');
      
      // Données de test enrichies
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
          { name: 'يوسف علي', average: '17.2', mention: 'تهنئة' }
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
      
      const htmlContent = createArabicHTMLContent(testData);
      const pdf = await createHTMLBasedPDF(htmlContent, 'تقرير اختبار');
      
      // Sauvegarder le PDF
      const fileName = `test_arabic_html_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF HTML généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF HTML:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const generateProfessionalReport = async () => {
    try {
      console.log('Génération du rapport professionnel de 5 pages...');
      
      // Données de test complètes pour le rapport professionnel
      const professionalData = {
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
      
      const pdf = await createProfessionalReport(professionalData);
      
      // Sauvegarder le PDF
      const fileName = `rapport_professionnel_5_pages_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Rapport professionnel de 5 pages généré avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport professionnel:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test de génération PDF avec texte arabe</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={generateTestPDF}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test avec police Amiri
          </button>
          <button
            onClick={generateAlternativePDF}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Test alternatif
          </button>
          <button
            onClick={generateHTMLBasedPDF}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Test HTML (Recommandé)
          </button>
          <button
            onClick={generateProfessionalReport}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            🎯 Rapport Professionnel 5 Pages
          </button>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Instructions de test :</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>🎯 Rapport Professionnel 5 Pages</strong> : <span style="color: #dc2626; font-weight: bold;">NOUVEAU!</span> Rapport complet de 5 pages avec graphiques, commentaires détaillés, et analyse professionnelle digne d'un conseiller d'orientation.</li>
          <li><strong>Test HTML (Recommandé)</strong> : Utilise html2canvas pour convertir le HTML en image, puis l'intégrer dans le PDF. Cette méthode devrait résoudre le problème d'encodage.</li>
          <li><strong>Test avec police Amiri</strong> : Utilise jsPDF avec la police Amiri téléchargée (peut encore avoir des problèmes d'encodage)</li>
          <li><strong>Test alternatif</strong> : Utilise jsPDF avec une approche de fallback</li>
          <li>Ouvrez la console du navigateur (F12) pour voir les logs de débogage</li>
          <li>Vérifiez que le texte arabe s'affiche correctement dans le PDF généré</li>
        </ol>
        
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h4 className="font-bold text-red-800 mb-2">🎯 Rapport Professionnel 5 Pages - Caractéristiques :</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            <li><strong>Page 1:</strong> Page de couverture professionnelle avec informations générales</li>
            <li><strong>Page 2:</strong> Analyse générale et statistiques avec graphiques et commentaires</li>
            <li><strong>Page 3:</strong> التقديرات والمنح + ترتيب الأقسام avec évaluations détaillées</li>
            <li><strong>Page 4:</strong> أفضل الطلاب + تحليل المواد avec recommandations</li>
            <li><strong>Page 5:</strong> التوصيات النهائية والخطة المستقبلية avec plan d'action</li>
            <li><strong>Design:</strong> Couleurs professionnelles, icônes, gradients, tableaux stylés</li>
            <li><strong>Contenu:</strong> Commentaires détaillés, recommandations, évaluations, plans d'action</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestArabicPDF;