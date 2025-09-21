import React from 'react';
import jsPDF from 'jspdf';
import { ensureArabicFont } from '../lib/pdfArabic';

interface SimplePDFGeneratorProps {
  reportData: {
    title: string;
    school: string;
    level: string;
    semester: string;
    average: number;
    totals: {
      totalStudents: number;
      excellent: number;
      good: number;
      average: number;
      weak: number;
    };
    subjects: Array<{
      name: string;
      average: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    topPerformers: Array<{
      studentName: string;
      average: number;
    }>;
    reportDate: string;
  };
}

const SimplePDFGenerator: React.FC<SimplePDFGeneratorProps> = ({ reportData }) => {
  const generatePDF = async () => {
    try {
      // Vérifier que les données sont valides
      if (!reportData || !reportData.title) {
        throw new Error('Données du rapport manquantes');
      }
      
      // Créer un nouveau document PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurer la police arabe
      await ensureArabicFont(pdf);
      
      // Configuration de base pour le texte arabe
      pdf.setFont('Amiri');
      pdf.setFontSize(12);
      
      // Configuration de base
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;
      
      // Fonction pour ajouter du texte
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        pdf.text(text, x, y, options);
      };
      
      // Fonction pour ajouter une ligne
      const addLine = (x1: number, y1: number, x2: number, y2: number) => {
        pdf.line(x1, y1, x2, y2);
      };
      
      // En-tête
      pdf.setFontSize(20);
      pdf.setFont('Amiri', 'bold');
      addText(reportData.title || 'تقرير المدرسة', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Ajouter un texte de test pour s'assurer que le PDF fonctionne
      pdf.setFontSize(12);
      pdf.setFont('Amiri', 'normal');
      addText('Test PDF Generation - Test إنشاء ملف PDF', margin, yPosition);
      yPosition += 10;
      
      // Ligne de séparation
      addLine(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Informations de base
      pdf.setFontSize(12);
      pdf.setFont('Amiri', 'normal');
      
      const infoData = [
        `المؤسسة: ${reportData.school || 'غير محدد'}`,
        `المستوى: ${reportData.level || 'غير محدد'}`,
        `الفصل: ${reportData.semester || 'غير محدد'}`,
        `تاريخ التقرير: ${reportData.reportDate || 'غير محدد'}`
      ];
      
      infoData.forEach(info => {
        addText(info, margin, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Statistiques générales
      pdf.setFont('helvetica', 'bold');
      addText('الإحصائيات العامة:', margin, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      const stats = [
        `المعدل العام: ${reportData.average.toFixed(2)}`,
        `إجمالي الطلاب: ${reportData.totals.totalStudents}`,
        `الطلاب الممتازون: ${reportData.totals.excellent}`,
        `الطلاب الجيدون: ${reportData.totals.good}`,
        `الطلاب المتوسطون: ${reportData.totals.average}`,
        `الطلاب الضعفاء: ${reportData.totals.weak}`
      ];
      
      stats.forEach(stat => {
        addText(stat, margin, yPosition);
        yPosition += 8;
      });
      
      yPosition += 15;
      
      // Tableau des matières
      if (reportData.subjects && reportData.subjects.length > 0) {
        pdf.setFont('helvetica', 'bold');
        addText('تحليل المواد:', margin, yPosition);
        yPosition += 10;
        
        // En-têtes du tableau
        pdf.setFontSize(10);
        addText('المادة', margin, yPosition);
        addText('المعدل', margin + 60, yPosition);
        addText('الاتجاه', margin + 100, yPosition);
        yPosition += 8;
        
        // Ligne de séparation
        addLine(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        
        // Données des matières
        pdf.setFont('helvetica', 'normal');
        (reportData.subjects || []).forEach(subject => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          const trend = subject.trend === 'up' ? 'صاعد' : subject.trend === 'down' ? 'نازل' : 'مستقر';
          
          addText(subject.name || 'غير محدد', margin, yPosition);
          addText((subject.average || 0).toFixed(2), margin + 60, yPosition);
          addText(trend, margin + 100, yPosition);
          yPosition += 8;
        });
        
        yPosition += 15;
      }
      
      // Meilleurs étudiants
      if (reportData.topPerformers && reportData.topPerformers.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        addText('أفضل الطلاب:', margin, yPosition);
        yPosition += 10;
        
        // En-têtes du tableau
        pdf.setFontSize(10);
        addText('الترتيب', margin, yPosition);
        addText('اسم الطالب', margin + 30, yPosition);
        addText('المعدل', margin + 100, yPosition);
        yPosition += 8;
        
        // Ligne de séparation
        addLine(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        
        // Données des étudiants
        pdf.setFont('helvetica', 'normal');
        reportData.topPerformers.slice(0, 10).forEach((student, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          addText((index + 1).toString(), margin, yPosition);
          addText(student.studentName, margin + 30, yPosition);
          addText(student.average.toFixed(2), margin + 100, yPosition);
          yPosition += 8;
        });
      }
      
      // Pied de page
      const footerY = pdf.internal.pageSize.getHeight() - 20;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      addText(`تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-SA')}`, pageWidth / 2, footerY, { align: 'center' });
      
      // Sauvegarder le PDF
      const fileName = `تقرير_تحليل_النتائج_${reportData.semester}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(`حدث خطأ أثناء إنشاء ملف PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      تحميل PDF
    </button>
  );
};

export default SimplePDFGenerator;