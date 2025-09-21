import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ensureArabicFont } from '../lib/pdfArabic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface PDFWithChartsProps {
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

const PDFWithCharts: React.FC<PDFWithChartsProps> = ({ reportData }) => {
  const chartsRef = useRef<HTMLDivElement>(null);

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

      // En-tête
      pdf.setFontSize(20);
      pdf.setFont('Amiri', 'bold');
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

      // Ajouter les graphiques si le conteneur existe
      if (chartsRef.current) {
        try {
          // Capturer les graphiques
          const canvas = await html2canvas(chartsRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Vérifier si on a besoin d'une nouvelle page
          if (yPosition + imgHeight > pdf.internal.pageSize.getHeight() - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          // Ajouter les graphiques au PDF
          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.warn('Erreur lors de la capture des graphiques:', error);
          // Continuer sans les graphiques
        }
      }

      // Tableau des matières
      if (reportData.subjects && reportData.subjects.length > 0) {
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

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

  // Préparer les données pour les graphiques
  const studentDistributionData = {
    labels: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'],
    datasets: [
      {
        label: 'عدد الطلاب',
        data: [reportData.totals.excellent, reportData.totals.good, reportData.totals.average, reportData.totals.weak],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const subjectsData = {
    labels: reportData.subjects.map(subject => subject.name),
    datasets: [
      {
        label: 'معدل المادة',
        data: reportData.subjects.map(subject => subject.average),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const topPerformersData = {
    labels: reportData.topPerformers.slice(0, 10).map(student => student.studentName),
    datasets: [
      {
        label: 'المعدل',
        data: reportData.topPerformers.slice(0, 10).map(student => student.average),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Arial, sans-serif',
            size: 12,
          },
        },
      },
      title: {
        display: true,
        font: {
          family: 'Arial, sans-serif',
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div>
      {/* Graphiques cachés pour la capture */}
      <div ref={chartsRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: 'white', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e40af' }}>الرسوم البيانية</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ height: '300px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>توزيع الطلاب حسب المستوى</h3>
            <Bar data={studentDistributionData} options={chartOptions} />
          </div>
          
          <div style={{ height: '300px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>معدلات المواد</h3>
            <Line data={subjectsData} options={chartOptions} />
          </div>
        </div>
        
        <div style={{ height: '300px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>أفضل 10 طلاب</h3>
          <Bar data={topPerformersData} options={chartOptions} />
        </div>
      </div>

      {/* Bouton pour générer le PDF */}
      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        تحميل PDF مع الرسوم البيانية
      </button>
    </div>
  );
};

export default PDFWithCharts;