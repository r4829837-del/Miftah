import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fonction pour créer un PDF avec du contenu HTML converti en image
export const createHTMLBasedPDF = async (htmlContent: string, title: string = 'تقرير') => {
  try {
    // Créer un élément temporaire pour le contenu HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.fontFamily = 'Amiri, Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.textAlign = 'right';
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';
    
    document.body.appendChild(tempDiv);
    
    // Attendre que les polices se chargent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convertir en canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Nettoyer l'élément temporaire
    document.body.removeChild(tempDiv);
    
    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Calculer les dimensions pour ajuster l'image au PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    // Ajouter l'image au PDF
    pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
    
    return pdf;
    
  } catch (error) {
    console.error('Erreur lors de la création du PDF HTML:', error);
    throw error;
  }
};

// Fonction pour créer un contenu HTML avec du texte arabe
export const createArabicHTMLContent = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;">
      <!-- En-tête principal -->
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
        <h1 style="font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">
          تقرير تحليل النتائج الشامل
        </h1>
        <p style="font-size: 16px; margin: 0; opacity: 0.9;">
          ${data.cycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}
        </p>
      </div>
      
      <!-- المعلومات العامة -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #3b82f6;">
        <h2 style="color: #3b82f6; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">
          📊 المعلومات العامة
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <p style="margin: 8px 0;"><strong>المستوى المحدد:</strong> ${data.level || 'جميع المستويات'}</p>
          <p style="margin: 8px 0;"><strong>الفصل الدراسي:</strong> ${data.semester || 'الفصل الأول'}</p>
          <p style="margin: 8px 0;"><strong>عدد السجلات المستوردة:</strong> ${data.recordsCount || 0}</p>
          <p style="margin: 8px 0;"><strong>تاريخ إنشاء التقرير:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <p style="margin: 8px 0; color: #64748b;"><strong>نوع التحليل:</strong> تحليل شامل للنتائج والإحصائيات التربوية</p>
      </div>
      
      <!-- الإحصائيات العامة -->
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #0ea5e9;">
        <h2 style="color: #0ea5e9; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">
          📈 الإحصائيات العامة
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <p style="margin: 8px 0;"><strong>المعدل العام للفصل:</strong> <span style="color: #059669; font-weight: bold;">${data.average || 'غير محدد'}</span></p>
          <p style="margin: 8px 0;"><strong>نسبة النجاح العامة (≥10):</strong> <span style="color: #059669; font-weight: bold;">${data.successRate || 'غير محدد'}%</span></p>
          <p style="margin: 8px 0;"><strong>الانحراف المعياري:</strong> ${data.standardDeviation || 'غير محدد'}</p>
          <p style="margin: 8px 0;"><strong>إجمالي عدد الطلاب:</strong> <span style="color: #dc2626; font-weight: bold;">${data.totalStudents || 0}</span></p>
          <p style="margin: 8px 0;"><strong>عدد الطلاب الذكور:</strong> ${data.maleStudents || 0}</p>
          <p style="margin: 8px 0;"><strong>عدد الطالبات الإناث:</strong> ${data.femaleStudents || 0}</p>
        </div>
      </div>
      
      <!-- التقديرات والمنح -->
      ${data.mentions ? `
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #f59e0b;">
        <h2 style="color: #f59e0b; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">
          🏆 التقديرات والمنح
        </h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #fbbf24; color: white;">
                <th style="padding: 12px; border: 1px solid #d97706; text-align: center;">نوع التقدير</th>
                <th style="padding: 12px; border: 1px solid #d97706; text-align: center;">العدد</th>
                <th style="padding: 12px; border: 1px solid #d97706; text-align: center;">النسبة</th>
                <th style="padding: 12px; border: 1px solid #d97706; text-align: center;">المعدل المطلوب</th>
              </tr>
            </thead>
            <tbody>
              ${data.mentions.map((mention: any) => `
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #d97706; text-align: center; font-weight: bold;">${mention.name}</td>
                  <td style="padding: 10px; border: 1px solid #d97706; text-align: center;">${mention.count}</td>
                  <td style="padding: 10px; border: 1px solid #d97706; text-align: center; color: #059669; font-weight: bold;">${mention.percent}%</td>
                  <td style="padding: 10px; border: 1px solid #d97706; text-align: center;">${mention.threshold}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
      
      <!-- ترتيب الأقسام -->
      ${data.classRanking ? `
      <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #8b5cf6;">
        <h2 style="color: #8b5cf6; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">
          🏅 ترتيب الأقسام
        </h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #a855f7; color: white;">
                <th style="padding: 12px; border: 1px solid #7c3aed; text-align: center;">الترتيب</th>
                <th style="padding: 12px; border: 1px solid #7c3aed; text-align: center;">اسم القسم</th>
                <th style="padding: 12px; border: 1px solid #7c3aed; text-align: center;">المعدل</th>
                <th style="padding: 12px; border: 1px solid #7c3aed; text-align: center;">نسبة النجاح</th>
                <th style="padding: 12px; border: 1px solid #7c3aed; text-align: center;">عدد الطلاب</th>
              </tr>
            </thead>
            <tbody>
              ${data.classRanking.map((cls: any, index: number) => `
                <tr style="background: ${index < 3 ? '#fef3c7' : 'white'};">
                  <td style="padding: 10px; border: 1px solid #7c3aed; text-align: center; font-weight: bold; color: ${index < 3 ? '#f59e0b' : 'black'};">${index + 1}</td>
                  <td style="padding: 10px; border: 1px solid #7c3aed; text-align: center; font-weight: bold;">${cls.name}</td>
                  <td style="padding: 10px; border: 1px solid #7c3aed; text-align: center; color: #059669; font-weight: bold;">${cls.average}</td>
                  <td style="padding: 10px; border: 1px solid #7c3aed; text-align: center; color: #059669; font-weight: bold;">${cls.successRate}%</td>
                  <td style="padding: 10px; border: 1px solid #7c3aed; text-align: center;">${cls.studentCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
      
      <!-- أفضل الطلاب -->
      <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #10b981;">
        <h2 style="color: #10b981; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">
          🥇 أفضل الطلاب
        </h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #34d399; color: white;">
                <th style="padding: 12px; border: 1px solid #059669; text-align: center;">الترتيب</th>
                <th style="padding: 12px; border: 1px solid #059669; text-align: center;">اسم الطالب</th>
                <th style="padding: 12px; border: 1px solid #059669; text-align: center;">المعدل</th>
                <th style="padding: 12px; border: 1px solid #059669; text-align: center;">التقدير</th>
              </tr>
            </thead>
            <tbody>
              ${data.topStudents ? data.topStudents.map((student: any, index: number) => `
                <tr style="background: ${index < 3 ? '#fef3c7' : 'white'};">
                  <td style="padding: 10px; border: 1px solid #059669; text-align: center; font-weight: bold; color: ${index < 3 ? '#f59e0b' : 'black'};">${index + 1}</td>
                  <td style="padding: 10px; border: 1px solid #059669; text-align: center; font-weight: bold;">${student.name || 'غير محدد'}</td>
                  <td style="padding: 10px; border: 1px solid #059669; text-align: center; color: #059669; font-weight: bold;">${student.average || 0}</td>
                  <td style="padding: 10px; border: 1px solid #059669; text-align: center; font-weight: bold;">${student.mention || 'غير محدد'}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- تحليل المواد -->
      ${data.subjects ? `
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid #ef4444;">
        <h2 style="color: #ef4444; font-size: 20px; margin: 0 0 15px 0; font-weight: bold;">
          📚 تحليل المواد
        </h2>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #f87171; color: white;">
                <th style="padding: 12px; border: 1px solid #dc2626; text-align: center;">المادة</th>
                <th style="padding: 12px; border: 1px solid #dc2626; text-align: center;">المعدل</th>
                <th style="padding: 12px; border: 1px solid #dc2626; text-align: center;">نسبة النجاح</th>
                <th style="padding: 12px; border: 1px solid #dc2626; text-align: center;">الانحراف المعياري</th>
                <th style="padding: 12px; border: 1px solid #dc2626; text-align: center;">عدد الطلاب</th>
              </tr>
            </thead>
            <tbody>
              ${data.subjects.map((subject: any) => `
                <tr style="background: white;">
                  <td style="padding: 10px; border: 1px solid #dc2626; text-align: center; font-weight: bold;">${subject.name}</td>
                  <td style="padding: 10px; border: 1px solid #dc2626; text-align: center; color: #059669; font-weight: bold;">${subject.average}</td>
                  <td style="padding: 10px; border: 1px solid #dc2626; text-align: center; color: #059669; font-weight: bold;">${subject.successRate}%</td>
                  <td style="padding: 10px; border: 1px solid #dc2626; text-align: center;">${subject.standardDeviation}</td>
                  <td style="padding: 10px; border: 1px solid #dc2626; text-align: center;">${subject.studentCount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}
      
      <!-- Pied de page -->
      <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; border-top: 3px solid #3b82f6;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          <strong>تم إنشاء هذا التقرير في:</strong> ${new Date().toLocaleString('ar-SA')}
        </p>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">
      
        </p>
      </div>
    </div>
  `;
};