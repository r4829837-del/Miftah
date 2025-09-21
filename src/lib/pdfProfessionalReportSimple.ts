import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fonction pour créer un rapport professionnel de 5 pages
export const createProfessionalReport = async (data: any) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Générer chaque page séparément
    const pages = [
      generatePage1(data),
      generatePage2(data),
      generatePage3(data),
      generatePage4(data),
      generatePage5(data)
    ];
    
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Créer un élément temporaire pour chaque page
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pages[i];
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm';
      tempDiv.style.fontFamily = 'Amiri, Arial, sans-serif';
      tempDiv.style.fontSize = '16px'; // Augmenté pour meilleure lisibilité
      tempDiv.style.lineHeight = '1.8';
      tempDiv.style.direction = 'rtl';
      tempDiv.style.textAlign = 'right';
      tempDiv.style.padding = '30px'; // Augmenté pour plus d'espace
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.minHeight = '297mm'; // A4 height
      tempDiv.style.boxSizing = 'border-box';
      
      document.body.appendChild(tempDiv);
      
      // Attendre que les polices se chargent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convertir en canvas (optimisé pour réduire la taille)
      const canvas = await html2canvas(tempDiv, {
        scale: 1, // Réduit pour diminuer la taille du PDF
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        height: tempDiv.scrollHeight,
        width: tempDiv.scrollWidth,
        logging: false,
        removeContainer: true
      });
      
      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv);
      
      // Ajouter l'image au PDF (optimisé pour réduire la taille)
      const imgData = canvas.toDataURL('image/jpeg', 0.7); // JPEG avec compression pour réduire la taille
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Centrer l'image sur la page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    }
    
    return pdf;
    
  } catch (error) {
    console.error('Erreur lors de la création du rapport professionnel:', error);
    throw error;
  }
};

// Page 1: Page de couverture
const generatePage1 = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; color: black; border: 2px solid black;">
      <div style="text-align: center;">
        <h1 style="font-size: 36px; margin: 0 0 20px 0; font-weight: bold;">
          📊 تقرير تحليل النتائج الشامل
        </h1>
        <h2 style="font-size: 24px; margin: 0 0 30px 0;">
          ${data.cycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}
        </h2>
        <div style="background: #f5f5f5; padding: 30px; border: 1px solid black; margin: 20px 0;">
          <h3 style="font-size: 20px; margin: 0 0 20px 0;">معلومات التقرير</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: right;">
            <p style="margin: 10px 0; font-size: 16px;"><strong>المستوى:</strong> ${data.level || 'جميع المستويات'}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>الفصل:</strong> ${data.semester || 'الفصل الأول'}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>عدد الطلاب:</strong> ${data.totalStudents || 0}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>المعدل العام:</strong> ${data.average || 'غير محدد'}</p>
          </div>
        </div>
        <div style="margin-top: 40px; padding: 20px; background: #f5f5f5; border: 1px solid black;">
          <p style="font-size: 14px; margin: 0;">
            تم إعداد هذا التقرير من قبل مستشار التوجيه المدرسي
          </p>
          <p style="font-size: 12px; margin: 5px 0 0 0;">
            ${new Date().toLocaleDateString('ar-SA')} - نظام Appamine
          </p>
        </div>
      </div>
    </div>
  `;
};

// Page 2: Analyse générale
const generatePage2 = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
      <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
        📈 التحليل العام والإحصائيات
      </h1>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #059669; font-size: 22px; margin: 0 0 20px 0;">📊 الإحصائيات العامة</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">المعدل العام</h3>
            <p style="font-size: 32px; margin: 0; font-weight: bold;">${data.average || 'غير محدد'}</p>
          </div>
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">نسبة النجاح</h3>
            <p style="font-size: 32px; margin: 0; font-weight: bold;">${data.successRate || 'غير محدد'}%</p>
          </div>
        </div>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #dc2626; font-size: 22px; margin: 0 0 20px 0;">🔍 التحليل التفصيلي</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 10px 0; font-size: 16px;"><strong>إجمالي عدد الطلاب:</strong> <span style="color: #dc2626; font-weight: bold;">${data.totalStudents || 0}</span></p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>الطلاب الذكور:</strong> ${data.maleStudents || 0}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>الطالبات الإناث:</strong> ${data.femaleStudents || 0}</p>
          </div>
          <div>
            <p style="margin: 10px 0; font-size: 16px;"><strong>الانحراف المعياري:</strong> ${data.standardDeviation || 'غير محدد'}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>نسبة الحضور:</strong> ${data.attendanceRate || 'غير محدد'}%</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>معدل الغياب:</strong> ${data.absenceRate || 'غير محدد'}%</p>
          </div>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef3c7, #fbbf24); padding: 25px; border-radius: 12px; border-right: 5px solid #f59e0b;">
        <h2 style="color: #92400e; font-size: 22px; margin: 0 0 15px 0;">💭 تعليقات مستشار التوجيه</h2>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
            <strong>التحليل العام:</strong> تشير النتائج إلى ${data.average >= 15 ? 'مستوى جيد' : data.average >= 12 ? 'مستوى متوسط' : 'مستوى يحتاج إلى تحسين'} في الأداء الأكاديمي. 
            ${data.successRate >= 80 ? 'نسبة النجاح مرتفعة' : data.successRate >= 60 ? 'نسبة النجاح متوسطة' : 'نسبة النجاح منخفضة'} مما يتطلب 
            ${data.successRate >= 80 ? 'الاستمرار في نفس النهج' : 'وضع خطط تحسينية'}.
          </p>
        </div>
      </div>
    </div>
  `;
};

// Page 3: التقديرات والمنح + ترتيب الأقسام
const generatePage3 = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
      <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
        🏆 التقديرات والمنح + ترتيب الأقسام
      </h1>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #f59e0b; font-size: 22px; margin: 0 0 20px 0;">🏆 التقديرات والمنح</h2>
        <div style="overflow-x: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 18px; min-width: 600px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white;">
                <th style="padding: 20px; border: 2px solid #d97706; text-align: center; font-size: 18px; font-weight: bold;">نوع التقدير</th>
                <th style="padding: 20px; border: 2px solid #d97706; text-align: center; font-size: 18px; font-weight: bold;">العدد</th>
                <th style="padding: 20px; border: 2px solid #d97706; text-align: center; font-size: 18px; font-weight: bold;">النسبة</th>
                <th style="padding: 20px; border: 2px solid #d97706; text-align: center; font-size: 18px; font-weight: bold;">المعدل المطلوب</th>
              </tr>
            </thead>
            <tbody>
              ${data.mentions ? data.mentions.map((mention: any, index: number) => `
                <tr style="background: ${index % 2 === 0 ? '#fef3c7' : 'white'};">
                  <td style="padding: 18px; border: 2px solid #d97706; text-align: center; font-weight: bold; font-size: 16px;">${mention.name}</td>
                  <td style="padding: 18px; border: 2px solid #d97706; text-align: center; font-size: 16px; font-weight: bold;">${mention.count}</td>
                  <td style="padding: 18px; border: 2px solid #d97706; text-align: center; color: #059669; font-weight: bold; font-size: 16px;">${mention.percent}%</td>
                  <td style="padding: 18px; border: 2px solid #d97706; text-align: center; font-size: 16px; font-weight: bold;">${mention.threshold}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b; font-size: 18px;">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #8b5cf6; font-size: 22px; margin: 0 0 20px 0;">🏅 ترتيب الأقسام</h2>
        <div style="overflow-x: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 18px; min-width: 700px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #a855f7, #8b5cf6); color: white;">
                <th style="padding: 20px; border: 2px solid #7c3aed; text-align: center; font-size: 18px; font-weight: bold;">الترتيب</th>
                <th style="padding: 20px; border: 2px solid #7c3aed; text-align: center; font-size: 18px; font-weight: bold;">اسم القسم</th>
                <th style="padding: 20px; border: 2px solid #7c3aed; text-align: center; font-size: 18px; font-weight: bold;">المعدل</th>
                <th style="padding: 20px; border: 2px solid #7c3aed; text-align: center; font-size: 18px; font-weight: bold;">نسبة النجاح</th>
                <th style="padding: 20px; border: 2px solid #7c3aed; text-align: center; font-size: 18px; font-weight: bold;">عدد الطلاب</th>
              </tr>
            </thead>
            <tbody>
              ${data.classRanking ? data.classRanking.map((cls: any, index: number) => `
                <tr style="background: ${index < 3 ? '#fef3c7' : index % 2 === 0 ? '#f3e8ff' : 'white'};">
                  <td style="padding: 18px; border: 2px solid #7c3aed; text-align: center; font-weight: bold; color: ${index < 3 ? '#f59e0b' : 'black'}; font-size: 16px;">${index + 1}</td>
                  <td style="padding: 18px; border: 2px solid #7c3aed; text-align: center; font-weight: bold; font-size: 16px;">${cls.name}</td>
                  <td style="padding: 18px; border: 2px solid #7c3aed; text-align: center; color: #059669; font-weight: bold; font-size: 16px;">${cls.average}</td>
                  <td style="padding: 18px; border: 2px solid #7c3aed; text-align: center; color: #059669; font-weight: bold; font-size: 16px;">${cls.successRate}%</td>
                  <td style="padding: 18px; border: 2px solid #7c3aed; text-align: center; font-size: 16px; font-weight: bold;">${cls.studentCount}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #64748b; font-size: 18px;">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

// Page 4: أفضل الطلاب + تحليل المواد
const generatePage4 = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
      <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
        🥇 أفضل الطلاب + تحليل المواد
      </h1>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #10b981; font-size: 22px; margin: 0 0 20px 0;">🥇 أفضل الطلاب</h2>
        <div style="overflow-x: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 18px; min-width: 600px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #34d399, #10b981); color: white;">
                <th style="padding: 20px; border: 2px solid #059669; text-align: center; font-size: 18px; font-weight: bold;">الترتيب</th>
                <th style="padding: 20px; border: 2px solid #059669; text-align: center; font-size: 18px; font-weight: bold;">اسم الطالب</th>
                <th style="padding: 20px; border: 2px solid #059669; text-align: center; font-size: 18px; font-weight: bold;">المعدل</th>
                <th style="padding: 20px; border: 2px solid #059669; text-align: center; font-size: 18px; font-weight: bold;">التقدير</th>
              </tr>
            </thead>
            <tbody>
              ${data.topStudents ? data.topStudents.map((student: any, index: number) => `
                <tr style="background: ${index < 3 ? '#fef3c7' : index % 2 === 0 ? '#ecfdf5' : 'white'};">
                  <td style="padding: 18px; border: 2px solid #059669; text-align: center; font-weight: bold; color: ${index < 3 ? '#f59e0b' : 'black'}; font-size: 16px;">${index + 1}</td>
                  <td style="padding: 18px; border: 2px solid #059669; text-align: center; font-weight: bold; font-size: 16px;">${student.name || 'غير محدد'}</td>
                  <td style="padding: 18px; border: 2px solid #059669; text-align: center; color: #059669; font-weight: bold; font-size: 16px;">${student.average || 0}</td>
                  <td style="padding: 18px; border: 2px solid #059669; text-align: center; font-weight: bold; font-size: 16px;">${student.mention || 'غير محدد'}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b; font-size: 18px;">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #ef4444; font-size: 22px; margin: 0 0 20px 0;">📚 تحليل المواد</h2>
        <div style="overflow-x: auto; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 18px; min-width: 700px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #f87171, #ef4444); color: white;">
                <th style="padding: 20px; border: 2px solid #dc2626; text-align: center; font-size: 18px; font-weight: bold;">المادة</th>
                <th style="padding: 20px; border: 2px solid #dc2626; text-align: center; font-size: 18px; font-weight: bold;">المعدل</th>
                <th style="padding: 20px; border: 2px solid #dc2626; text-align: center; font-size: 18px; font-weight: bold;">نسبة النجاح</th>
                <th style="padding: 20px; border: 2px solid #dc2626; text-align: center; font-size: 18px; font-weight: bold;">الانحراف المعياري</th>
              </tr>
            </thead>
            <tbody>
              ${data.subjects ? data.subjects.map((subject: any, index: number) => `
                <tr style="background: ${index % 2 === 0 ? '#fef2f2' : 'white'};">
                  <td style="padding: 18px; border: 2px solid #dc2626; text-align: center; font-weight: bold; font-size: 16px;">${subject.name}</td>
                  <td style="padding: 18px; border: 2px solid #dc2626; text-align: center; color: #059669; font-weight: bold; font-size: 16px;">${subject.average}</td>
                  <td style="padding: 18px; border: 2px solid #dc2626; text-align: center; color: #059669; font-weight: bold; font-size: 16px;">${subject.successRate}%</td>
                  <td style="padding: 18px; border: 2px solid #dc2626; text-align: center; font-size: 16px; font-weight: bold;">${subject.standardDeviation}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #64748b; font-size: 18px;">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

// Page 5: التوصيات النهائية
const generatePage5 = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
      <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
        🎯 التوصيات النهائية والخطة المستقبلية
      </h1>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #059669; font-size: 22px; margin: 0 0 20px 0;">🎯 التوصيات العامة</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-right: 4px solid #10b981;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">✅ نقاط القوة</h3>
            <ul style="margin: 0; padding-right: 20px; color: #374151;">
              <li style="margin: 8px 0;">${data.average >= 15 ? 'معدل عام جيد' : 'تحسن في الأداء'}</li>
              <li style="margin: 8px 0;">${data.successRate >= 80 ? 'نسبة نجاح مرتفعة' : 'استقرار في النتائج'}</li>
              <li style="margin: 8px 0;">تنوع في التقديرات</li>
              <li style="margin: 8px 0;">مشاركة فعالة للطلاب</li>
            </ul>
          </div>
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-right: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">⚠️ نقاط التحسين</h3>
            <ul style="margin: 0; padding-right: 20px; color: #374151;">
              <li style="margin: 8px 0;">${data.average < 12 ? 'تحسين المعدل العام' : 'تطوير المهارات'}</li>
              <li style="margin: 8px 0;">${data.successRate < 60 ? 'رفع نسبة النجاح' : 'تحسين الجودة'}</li>
              <li style="margin: 8px 0;">تقليل الفروق بين الأقسام</li>
              <li style="margin: 8px 0;">دعم الطلاب الضعاف</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #3b82f6; font-size: 22px; margin: 0 0 20px 0;">📋 الخطة المستقبلية</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h3 style="color: #1d4ed8; margin: 0 0 15px 0; font-size: 18px;">🎯 الأهداف قصيرة المدى</h3>
            <ul style="margin: 0; padding-right: 20px; color: #374151;">
              <li style="margin: 8px 0;">تحسين المعدل العام بنسبة 10%</li>
              <li style="margin: 8px 0;">رفع نسبة النجاح إلى 85%</li>
              <li style="margin: 8px 0;">تطبيق برامج الدعم للطلاب الضعاف</li>
              <li style="margin: 8px 0;">تنظيم ورش عمل للمعلمين</li>
            </ul>
          </div>
          <div>
            <h3 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 18px;">🚀 الأهداف طويلة المدى</h3>
            <ul style="margin: 0; padding-right: 20px; color: #374151;">
              <li style="margin: 8px 0;">تحقيق معدل عام 16+</li>
              <li style="margin: 8px 0;">نسبة نجاح 95%+</li>
              <li style="margin: 8px 0;">تطوير نظام تقييم شامل</li>
              <li style="margin: 8px 0;">إنشاء قاعدة بيانات للطلاب</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px; border-radius: 15px; text-align: center;">
        <h2 style="font-size: 24px; margin: 0 0 20px 0;">🎓 التوصيات النهائية</h2>
        <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 12px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0; line-height: 1.8;">
            بناءً على التحليل الشامل للنتائج، يُوصى بالتركيز على 
            <strong>${data.average >= 15 ? 'الاستمرار في التميز' : 'تحسين الأداء العام'}</strong> 
            و${data.successRate >= 80 ? 'الحفاظ على نسبة النجاح المرتفعة' : 'رفع نسبة النجاح'} 
            من خلال تطبيق البرامج التطويرية المناسبة.
          </p>
        </div>
        <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
          <p style="font-size: 14px; margin: 0; opacity: 0.9;">
            تم إعداد هذا التقرير بواسطة مستشار التوجيه المدرسي
          </p>
          <p style="font-size: 12px; margin: 5px 0 0 0; opacity: 0.7;">
            ${new Date().toLocaleString('ar-SA')} - نظام Appamine للتوجيه المدرسي
          </p>
        </div>
      </div>
    </div>
  `;
};