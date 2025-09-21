import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ensureArabicFont } from '../lib/pdfArabic';

interface PDFGeneratorProps {
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
  onGenerate: () => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ reportData, onGenerate }) => {
  const generatePDF = async () => {
    try {
      // Vérifier que les données sont valides
      if (!reportData || !reportData.title) {
        throw new Error('Données du rapport manquantes');
      }
      
      onGenerate();
      
      // Créer un nouveau document PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Configurer la police arabe
      await ensureArabicFont(pdf);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configuration des couleurs
      const primaryColor = [59, 130, 246]; // Bleu
      const successColor = [34, 197, 94]; // Vert
      const warningColor = [245, 158, 11]; // Orange
      const dangerColor = [239, 68, 68]; // Rouge
      
      // En-tête du document
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      // Titre principal
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('Amiri', 'bold');
      pdf.text(reportData.title, pageWidth / 2, 20, { align: 'center' });
      
      // Informations de base
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('Amiri', 'normal');
      
      let yPosition = 50;
      
      // Informations de l'établissement
      pdf.setFont('Amiri', 'bold');
      pdf.text('معلومات التقرير:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('Amiri', 'normal');
      pdf.text(`المؤسسة: ${reportData.school}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`المستوى: ${reportData.level}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`الفصل: ${reportData.semester}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`تاريخ التقرير: ${reportData.reportDate}`, 20, yPosition);
      yPosition += 15;
      
      // Statistiques générales
      pdf.setFont('helvetica', 'bold');
      pdf.text('الإحصائيات العامة:', 20, yPosition);
      yPosition += 10;
      
      // Tableau des statistiques
      const statsData = [
        ['المؤشر', 'القيمة'],
        ['المعدل العام', reportData.average.toFixed(2)],
        ['إجمالي الطلاب', reportData.totals.totalStudents.toString()],
        ['الطلاب الممتازون', reportData.totals.excellent.toString()],
        ['الطلاب الجيدون', reportData.totals.good.toString()],
        ['الطلاب المتوسطون', reportData.totals.average.toString()],
        ['الطلاب الضعفاء', reportData.totals.weak.toString()],
      ];
      
      // Dessiner le tableau
      const tableTop = yPosition;
      const colWidths = [60, 40];
      const rowHeight = 8;
      
      statsData.forEach((row, rowIndex) => {
        let xPosition = 20;
        
        row.forEach((cell, colIndex) => {
          if (rowIndex === 0) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(xPosition, tableTop + (rowIndex * rowHeight), colWidths[colIndex], rowHeight, 'F');
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(xPosition, tableTop + (rowIndex * rowHeight), colWidths[colIndex], rowHeight, 'F');
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
          }
          
          pdf.text(cell, xPosition + 2, tableTop + (rowIndex * rowHeight) + 5);
          xPosition += colWidths[colIndex];
        });
      });
      
      // Dessiner les bordures du tableau
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      for (let i = 0; i <= statsData.length; i++) {
        const y = tableTop + (i * rowHeight);
        pdf.line(20, y, 20 + colWidths[0] + colWidths[1], y);
      }
      for (let i = 0; i <= 2; i++) {
        const x = 20 + (i * colWidths[0]);
        pdf.line(x, tableTop, x, tableTop + (statsData.length * rowHeight));
      }
      
      yPosition = tableTop + (statsData.length * rowHeight) + 15;
      
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Tableau des matières
      pdf.setFont('helvetica', 'bold');
      pdf.text('تحليل المواد:', 20, yPosition);
      yPosition += 10;
      
      const subjectsData = [
        ['المادة', 'المعدل', 'الاتجاه', 'التقييم'],
        ...reportData.subjects.map(subject => {
          let evaluation = '';
          if (subject.average >= 16) evaluation = 'ممتاز';
          else if (subject.average >= 14) evaluation = 'جيد جداً';
          else if (subject.average >= 12) evaluation = 'جيد';
          else if (subject.average >= 10) evaluation = 'مقبول';
          else evaluation = 'ضعيف';
          
          const trend = subject.trend === 'up' ? 'صاعد' : subject.trend === 'down' ? 'نازل' : 'مستقر';
          
          return [subject.name, subject.average.toFixed(2), trend, evaluation];
        })
      ];
      
      const subjectsTableTop = yPosition;
      const subjectsColWidths = [50, 30, 30, 30];
      
      subjectsData.forEach((row, rowIndex) => {
        let xPosition = 20;
        
        row.forEach((cell, colIndex) => {
          if (rowIndex === 0) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(xPosition, subjectsTableTop + (rowIndex * rowHeight), subjectsColWidths[colIndex], rowHeight, 'F');
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(xPosition, subjectsTableTop + (rowIndex * rowHeight), subjectsColWidths[colIndex], rowHeight, 'F');
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
          }
          
          pdf.text(cell, xPosition + 2, subjectsTableTop + (rowIndex * rowHeight) + 5);
          xPosition += subjectsColWidths[colIndex];
        });
      });
      
      // Dessiner les bordures du tableau des matières
      for (let i = 0; i <= subjectsData.length; i++) {
        const y = subjectsTableTop + (i * rowHeight);
        pdf.line(20, y, 20 + subjectsColWidths.reduce((a, b) => a + b, 0), y);
      }
      for (let i = 0; i <= subjectsColWidths.length; i++) {
        const x = 20 + subjectsColWidths.slice(0, i).reduce((a, b) => a + b, 0);
        pdf.line(x, subjectsTableTop, x, subjectsTableTop + (subjectsData.length * rowHeight));
      }
      
      yPosition = subjectsTableTop + (subjectsData.length * rowHeight) + 15;
      
      // Vérifier si on a besoin d'une nouvelle page pour les meilleurs étudiants
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Tableau des meilleurs étudiants
      if (reportData.topPerformers.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('أفضل الطلاب:', 20, yPosition);
        yPosition += 10;
        
        const topPerformersData = [
          ['الترتيب', 'اسم الطالب', 'المعدل'],
          ...reportData.topPerformers.slice(0, 10).map((student, index) => [
            (index + 1).toString(),
            student.studentName,
            student.average.toFixed(2)
          ])
        ];
        
        const topPerformersTableTop = yPosition;
        const topPerformersColWidths = [30, 80, 30];
        
        topPerformersData.forEach((row, rowIndex) => {
          let xPosition = 20;
          
          row.forEach((cell, colIndex) => {
            if (rowIndex === 0) {
              pdf.setFillColor(240, 240, 240);
              pdf.rect(xPosition, topPerformersTableTop + (rowIndex * rowHeight), topPerformersColWidths[colIndex], rowHeight, 'F');
              pdf.setTextColor(0, 0, 0);
              pdf.setFont('helvetica', 'bold');
            } else {
              pdf.setFillColor(255, 255, 255);
              pdf.rect(xPosition, topPerformersTableTop + (rowIndex * rowHeight), topPerformersColWidths[colIndex], rowHeight, 'F');
              pdf.setTextColor(0, 0, 0);
              pdf.setFont('helvetica', 'normal');
            }
            
            pdf.text(cell, xPosition + 2, topPerformersTableTop + (rowIndex * rowHeight) + 5);
            xPosition += topPerformersColWidths[colIndex];
          });
        });
        
        // Dessiner les bordures du tableau des meilleurs étudiants
        for (let i = 0; i <= topPerformersData.length; i++) {
          const y = topPerformersTableTop + (i * rowHeight);
          pdf.line(20, y, 20 + topPerformersColWidths.reduce((a, b) => a + b, 0), y);
        }
        for (let i = 0; i <= topPerformersColWidths.length; i++) {
          const x = 20 + topPerformersColWidths.slice(0, i).reduce((a, b) => a + b, 0);
          pdf.line(x, topPerformersTableTop, x, topPerformersTableTop + (topPerformersData.length * rowHeight));
        }
      }
      
      // Pied de page
      const footerY = pageHeight - 20;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-SA')}`, pageWidth / 2, footerY, { align: 'center' });
      
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

export default PDFGenerator;