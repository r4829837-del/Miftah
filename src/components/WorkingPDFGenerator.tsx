import React from 'react';
import jsPDF from 'jspdf';
import { ensureArabicFont } from '../lib/pdfArabic';

interface WorkingPDFGeneratorProps {
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

const WorkingPDFGenerator: React.FC<WorkingPDFGeneratorProps> = ({ reportData }) => {
  const generatePDF = async () => {
    try {
      if (!reportData || !reportData.title) {
        throw new Error('Données du rapport manquantes');
      }

      // Créer un nouveau document PDF
      const pdf = new jsPDF();
      
      // Configurer la police arabe
      await ensureArabicFont(pdf);
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

      // Fonction pour dessiner un graphique en barres
      const drawBarChart = (x: number, y: number, width: number, height: number, data: number[], labels: string[], title: string) => {
        // Titre du graphique
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        addText(title, x + width/2, y - 5, { align: 'center' });
        
        // Dessiner le cadre
        pdf.rect(x, y, width, height);
        
        if (data.length === 0) return;
        
        const maxValue = Math.max(...data);
        const barWidth = width / data.length * 0.8;
        const barSpacing = width / data.length * 0.2;
        
        data.forEach((value, index) => {
          const barHeight = (value / maxValue) * (height - 20);
          const barX = x + index * (barWidth + barSpacing) + barSpacing/2;
          const barY = y + height - barHeight - 10;
          
          // Couleurs différentes pour chaque barre
          const colors = [
            [34, 197, 94],   // Vert
            [59, 130, 246],  // Bleu
            [245, 158, 11],  // Orange
            [239, 68, 68],   // Rouge
            [139, 92, 246],  // Violet
            [236, 72, 153],  // Rose
          ];
          const color = colors[index % colors.length];
          
          // Dessiner la barre
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.rect(barX, barY, barWidth, barHeight, 'F');
          
          // Ajouter la valeur
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          addText(value.toString(), barX + barWidth/2, barY - 2, { align: 'center' });
          
          // Ajouter le label
          addText(labels[index], barX + barWidth/2, y + height - 5, { align: 'center' });
        });
      };

      // En-tête
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      addText(reportData.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Ligne de séparation
      addLine(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Informations de base
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

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

      // Graphique de répartition des étudiants
      if (yPosition + 80 > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      const studentData = [reportData.totals.excellent, reportData.totals.good, reportData.totals.average, reportData.totals.weak];
      const studentLabels = ['ممتاز', 'جيد', 'متوسط', 'ضعيف'];
      drawBarChart(margin, yPosition, pageWidth - 2 * margin, 80, studentData, studentLabels, 'توزيع الطلاب حسب المستوى');
      yPosition += 100;

      // Graphique des matières
      if (reportData.subjects && reportData.subjects.length > 0) {
        if (yPosition + 80 > pdf.internal.pageSize.getHeight() - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        const subjectData = reportData.subjects.map(s => s.average);
        const subjectLabels = reportData.subjects.map(s => s.name.length > 8 ? s.name.substring(0, 8) + '...' : s.name);
        drawBarChart(margin, yPosition, pageWidth - 2 * margin, 80, subjectData, subjectLabels, 'معدلات المواد');
        yPosition += 100;
      }

      // Graphique des meilleurs étudiants
      if (reportData.topPerformers && reportData.topPerformers.length > 0) {
        if (yPosition + 80 > pdf.internal.pageSize.getHeight() - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        const topPerformersData = reportData.topPerformers.slice(0, 8).map(s => s.average);
        const topPerformersLabels = reportData.topPerformers.slice(0, 8).map(s => s.studentName.length > 6 ? s.studentName.substring(0, 6) + '...' : s.studentName);
        drawBarChart(margin, yPosition, pageWidth - 2 * margin, 80, topPerformersData, topPerformersLabels, 'أفضل الطلاب');
        yPosition += 100;
      }

      // Tableau des matières
      if (reportData.subjects && reportData.subjects.length > 0) {
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFont('helvetica', 'bold');
        addText('تحليل مفصل للمواد:', margin, yPosition);
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
        reportData.subjects.forEach(subject => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }

          const trend = subject.trend === 'up' ? 'صاعد' : subject.trend === 'down' ? 'نازل' : 'مستقر';

          addText(subject.name, margin, yPosition);
          addText(subject.average.toFixed(2), margin + 60, yPosition);
          addText(trend, margin + 100, yPosition);
          yPosition += 8;
        });

        yPosition += 15;
      }

      // Meilleurs étudiants
      if (reportData.topPerformers && reportData.topPerformers.length > 0) {
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

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
      تحميل PDF مع الرسوم البيانية
    </button>
  );
};

export default WorkingPDFGenerator;