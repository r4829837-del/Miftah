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
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.direction = 'rtl';
      tempDiv.style.textAlign = 'right';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.minHeight = '297mm'; // A4 height
      
      document.body.appendChild(tempDiv);
      
      // Attendre que les polices se chargent
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convertir en canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: tempDiv.scrollHeight,
        width: tempDiv.scrollWidth
      });
      
      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv);
      
      // Ajouter l'image au PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Centrer l'image sur la page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    }
    
    return pdf;
    
  } catch (error) {
    console.error('Erreur lors de la création du rapport professionnel:', error);
    throw error;
  }
};

// Fonction pour générer le HTML professionnel
const generateProfessionalHTML = (data: any) => {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
      
      <!-- PAGE 1: PAGE DE COUVERTURE -->
      <div style="page-break-after: always; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; border-radius: 15px; padding: 40px; margin-bottom: 30px;">
        <div style="text-align: center;">
          <h1 style="font-size: 36px; margin: 0 0 20px 0; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
            📊 تقرير تحليل النتائج الشامل
          </h1>
          <h2 style="font-size: 24px; margin: 0 0 30px 0; opacity: 0.9;">
            ${data.cycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}
          </h2>
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin: 20px 0;">
            <h3 style="font-size: 20px; margin: 0 0 20px 0;">معلومات التقرير</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: right;">
              <p style="margin: 10px 0; font-size: 16px;"><strong>المستوى:</strong> ${data.level || 'جميع المستويات'}</p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>الفصل:</strong> ${data.semester || 'الفصل الأول'}</p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>عدد الطلاب:</strong> ${data.totalStudents || 0}</p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>المعدل العام:</strong> ${data.average || 'غير محدد'}</p>
            </div>
          </div>
          <div style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
            <p style="font-size: 14px; margin: 0; opacity: 0.8;">
              تم إعداد هذا التقرير من قبل مستشار التوجيه المدرسي
            </p>
            <p style="font-size: 12px; margin: 5px 0 0 0; opacity: 0.7;">
              ${new Date().toLocaleDateString('ar-SA')} - نظام Appamine
            </p>
          </div>
        </div>
      </div>
      
      <!-- PAGE 2: ANALYSE GÉNÉRALE ET STATISTIQUES -->
      <div style="page-break-after: always; min-height: 100vh; padding: 30px; background: #f8fafc; border-radius: 15px; margin-bottom: 30px;">
        <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
          📈 التحليل العام والإحصائيات
        </h1>
        
        <!-- Graphique des statistiques générales -->
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
        
        <!-- Analyse détaillée -->
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
        
        <!-- Commentaires du conseiller -->
        <div style="background: linear-gradient(135deg, #fef3c7, #fbbf24); padding: 25px; border-radius: 12px; border-right: 5px solid #f59e0b;">
          <h2 style="color: #92400e; font-size: 22px; margin: 0 0 15px 0;">💭 تعليقات مستشار التوجيه</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
              <strong>التحليل العام:</strong> تشير النتائج إلى ${data.average >= 15 ? 'مستوى جيد' : data.average >= 12 ? 'مستوى متوسط' : 'مستوى يحتاج إلى تحسين'} في الأداء الأكاديمي. 
              ${data.successRate >= 80 ? 'نسبة النجاح مرتفعة' : data.successRate >= 60 ? 'نسبة النجاح متوسطة' : 'نسبة النجاح منخفضة'} مما يتطلب 
              ${data.successRate >= 80 ? 'الاستمرار في نفس النهج' : 'وضع خطط تحسينية'}.
            </p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
              <strong>التوصيات:</strong> يُنصح بـ ${data.average >= 15 ? 'الاستمرار في البرامج التحفيزية' : 'وضع برامج دعم إضافية'} 
              و${data.maleStudents > data.femaleStudents ? 'مراعاة الفروق الفردية بين الجنسين' : 'التركيز على تحسين الأداء العام'}.
            </p>
          </div>
        </div>
      </div>
      
      <!-- PAGE 3: التقديرات والمنح + ترتيب الأقسام -->
      <div style="page-break-after: always; min-height: 100vh; padding: 30px; background: #f8fafc; border-radius: 15px; margin-bottom: 30px;">
        <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
          🏆 التقديرات والمنح + ترتيب الأقسام
        </h1>
        
        <!-- التقديرات والمنح -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #f59e0b; font-size: 22px; margin: 0 0 20px 0;">🏆 التقديرات والمنح</h2>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white;">
                  <th style="padding: 15px; border: 1px solid #d97706; text-align: center; font-size: 16px;">نوع التقدير</th>
                  <th style="padding: 15px; border: 1px solid #d97706; text-align: center; font-size: 16px;">العدد</th>
                  <th style="padding: 15px; border: 1px solid #d97706; text-align: center; font-size: 16px;">النسبة</th>
                  <th style="padding: 15px; border: 1px solid #d97706; text-align: center; font-size: 16px;">المعدل المطلوب</th>
                  <th style="padding: 15px; border: 1px solid #d97706; text-align: center; font-size: 16px;">التعليق</th>
                </tr>
              </thead>
              <tbody>
                ${data.mentions ? data.mentions.map((mention: any, index: number) => `
                  <tr style="background: ${index % 2 === 0 ? '#fef3c7' : 'white'};">
                    <td style="padding: 12px; border: 1px solid #d97706; text-align: center; font-weight: bold; font-size: 14px;">${mention.name}</td>
                    <td style="padding: 12px; border: 1px solid #d97706; text-align: center; font-size: 14px;">${mention.count}</td>
                    <td style="padding: 12px; border: 1px solid #d97706; text-align: center; color: #059669; font-weight: bold; font-size: 14px;">${mention.percent}%</td>
                    <td style="padding: 12px; border: 1px solid #d97706; text-align: center; font-size: 14px;">${mention.threshold}</td>
                    <td style="padding: 12px; border: 1px solid #d97706; text-align: center; font-size: 12px; color: #6b7280;">${getMentionComment(mention.name, mention.percent)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">لا توجد بيانات</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- ترتيب الأقسام -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #8b5cf6; font-size: 22px; margin: 0 0 20px 0;">🏅 ترتيب الأقسام</h2>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #a855f7, #8b5cf6); color: white;">
                  <th style="padding: 15px; border: 1px solid #7c3aed; text-align: center; font-size: 16px;">الترتيب</th>
                  <th style="padding: 15px; border: 1px solid #7c3aed; text-align: center; font-size: 16px;">اسم القسم</th>
                  <th style="padding: 15px; border: 1px solid #7c3aed; text-align: center; font-size: 16px;">المعدل</th>
                  <th style="padding: 15px; border: 1px solid #7c3aed; text-align: center; font-size: 16px;">نسبة النجاح</th>
                  <th style="padding: 15px; border: 1px solid #7c3aed; text-align: center; font-size: 16px;">عدد الطلاب</th>
                  <th style="padding: 15px; border: 1px solid #7c3aed; text-align: center; font-size: 16px;">التقييم</th>
                </tr>
              </thead>
              <tbody>
                ${data.classRanking ? data.classRanking.map((cls: any, index: number) => `
                  <tr style="background: ${index < 3 ? '#fef3c7' : index % 2 === 0 ? '#f3e8ff' : 'white'};">
                    <td style="padding: 12px; border: 1px solid #7c3aed; text-align: center; font-weight: bold; color: ${index < 3 ? '#f59e0b' : 'black'}; font-size: 14px;">${index + 1}</td>
                    <td style="padding: 12px; border: 1px solid #7c3aed; text-align: center; font-weight: bold; font-size: 14px;">${cls.name}</td>
                    <td style="padding: 12px; border: 1px solid #7c3aed; text-align: center; color: #059669; font-weight: bold; font-size: 14px;">${cls.average}</td>
                    <td style="padding: 12px; border: 1px solid #7c3aed; text-align: center; color: #059669; font-weight: bold; font-size: 14px;">${cls.successRate}%</td>
                    <td style="padding: 12px; border: 1px solid #7c3aed; text-align: center; font-size: 14px;">${cls.studentCount}</td>
                    <td style="padding: 12px; border: 1px solid #7c3aed; text-align: center; font-size: 12px; color: #6b7280;">${getClassEvaluation(cls.average, cls.successRate)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">لا توجد بيانات</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- تحليل الأقسام -->
        <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 25px; border-radius: 12px; border-right: 5px solid #8b5cf6;">
          <h2 style="color: #7c3aed; font-size: 22px; margin: 0 0 15px 0;">📊 تحليل أداء الأقسام</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
              <strong>التحليل:</strong> ${data.classRanking ? 
                `أفضل قسم هو ${data.classRanking[0]?.name} بمعدل ${data.classRanking[0]?.average}، 
                بينما يحتاج ${data.classRanking[data.classRanking.length - 1]?.name} إلى دعم إضافي.` : 
                'لا توجد بيانات كافية للتحليل'
              }
            </p>
          </div>
        </div>
      </div>
      
      <!-- PAGE 4: أفضل الطلاب + تحليل المواد -->
      <div style="page-break-after: always; min-height: 100vh; padding: 30px; background: #f8fafc; border-radius: 15px; margin-bottom: 30px;">
        <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
          🥇 أفضل الطلاب + تحليل المواد
        </h1>
        
        <!-- أفضل الطلاب -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; font-size: 22px; margin: 0 0 20px 0;">🥇 أفضل الطلاب</h2>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #34d399, #10b981); color: white;">
                  <th style="padding: 15px; border: 1px solid #059669; text-align: center; font-size: 16px;">الترتيب</th>
                  <th style="padding: 15px; border: 1px solid #059669; text-align: center; font-size: 16px;">اسم الطالب</th>
                  <th style="padding: 15px; border: 1px solid #059669; text-align: center; font-size: 16px;">المعدل</th>
                  <th style="padding: 15px; border: 1px solid #059669; text-align: center; font-size: 16px;">التقدير</th>
                  <th style="padding: 15px; border: 1px solid #059669; text-align: center; font-size: 16px;">التوصية</th>
                </tr>
              </thead>
              <tbody>
                ${data.topStudents ? data.topStudents.map((student: any, index: number) => `
                  <tr style="background: ${index < 3 ? '#fef3c7' : index % 2 === 0 ? '#ecfdf5' : 'white'};">
                    <td style="padding: 12px; border: 1px solid #059669; text-align: center; font-weight: bold; color: ${index < 3 ? '#f59e0b' : 'black'}; font-size: 14px;">${index + 1}</td>
                    <td style="padding: 12px; border: 1px solid #059669; text-align: center; font-weight: bold; font-size: 14px;">${student.name || 'غير محدد'}</td>
                    <td style="padding: 12px; border: 1px solid #059669; text-align: center; color: #059669; font-weight: bold; font-size: 14px;">${student.average || 0}</td>
                    <td style="padding: 12px; border: 1px solid #059669; text-align: center; font-weight: bold; font-size: 14px;">${student.mention || 'غير محدد'}</td>
                    <td style="padding: 12px; border: 1px solid #059669; text-align: center; font-size: 12px; color: #6b7280;">${getStudentRecommendation(student.average, student.mention)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">لا توجد بيانات</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- تحليل المواد -->
        <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #ef4444; font-size: 22px; margin: 0 0 20px 0;">📚 تحليل المواد</h2>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #f87171, #ef4444); color: white;">
                  <th style="padding: 15px; border: 1px solid #dc2626; text-align: center; font-size: 16px;">المادة</th>
                  <th style="padding: 15px; border: 1px solid #dc2626; text-align: center; font-size: 16px;">المعدل</th>
                  <th style="padding: 15px; border: 1px solid #dc2626; text-align: center; font-size: 16px;">نسبة النجاح</th>
                  <th style="padding: 15px; border: 1px solid #dc2626; text-align: center; font-size: 16px;">الانحراف المعياري</th>
                  <th style="padding: 15px; border: 1px solid #dc2626; text-align: center; font-size: 16px;">التقييم</th>
                </tr>
              </thead>
              <tbody>
                ${data.subjects ? data.subjects.map((subject: any, index: number) => `
                  <tr style="background: ${index % 2 === 0 ? '#fef2f2' : 'white'};">
                    <td style="padding: 12px; border: 1px solid #dc2626; text-align: center; font-weight: bold; font-size: 14px;">${subject.name}</td>
                    <td style="padding: 12px; border: 1px solid #dc2626; text-align: center; color: #059669; font-weight: bold; font-size: 14px;">${subject.average}</td>
                    <td style="padding: 12px; border: 1px solid #dc2626; text-align: center; color: #059669; font-weight: bold; font-size: 14px;">${subject.successRate}%</td>
                    <td style="padding: 12px; border: 1px solid #dc2626; text-align: center; font-size: 14px;">${subject.standardDeviation}</td>
                    <td style="padding: 12px; border: 1px solid #dc2626; text-align: center; font-size: 12px; color: #6b7280;">${getSubjectEvaluation(subject.average, subject.successRate)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">لا توجد بيانات</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- توصيات المواد -->
        <div style="background: linear-gradient(135deg, #fef2f2, #fecaca); padding: 25px; border-radius: 12px; border-right: 5px solid #ef4444;">
          <h2 style="color: #dc2626; font-size: 22px; margin: 0 0 15px 0;">💡 توصيات تحسين المواد</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
              <strong>المواد المتميزة:</strong> ${data.subjects ? data.subjects.filter(s => parseFloat(s.average) >= 16).map(s => s.name).join('، ') : 'لا توجد'} - يُنصح بالاستمرار في نفس النهج.
            </p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
              <strong>المواد المحتاجة للتحسين:</strong> ${data.subjects ? data.subjects.filter(s => parseFloat(s.average) < 12).map(s => s.name).join('، ') : 'لا توجد'} - تحتاج إلى برامج دعم إضافية.
            </p>
          </div>
        </div>
      </div>
      
      <!-- PAGE 5: التوصيات النهائية والخطة المستقبلية -->
      <div style="min-height: 100vh; padding: 30px; background: #f8fafc; border-radius: 15px;">
        <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
          🎯 التوصيات النهائية والخطة المستقبلية
        </h1>
        
        <!-- التوصيات العامة -->
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
        
        <!-- الخطة المستقبلية -->
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
        
        <!-- التوصيات النهائية -->
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
    </div>
  `;
};

// Fonctions utilitaires pour les commentaires
const getMentionComment = (mention: string, percent: number) => {
  switch(mention) {
    case 'تميز': return percent >= 10 ? 'نسبة ممتازة' : 'نسبة جيدة';
    case 'تهنئة': return percent >= 20 ? 'نسبة مرتفعة' : 'نسبة متوسطة';
    case 'تشجيع': return percent >= 25 ? 'نسبة مقبولة' : 'تحتاج تحسين';
    case 'لوحة الشرف': return percent >= 30 ? 'نسبة جيدة' : 'نسبة منخفضة';
    case 'بحاجة إلى تحسين': return percent <= 15 ? 'نسبة مقبولة' : 'نسبة مرتفعة';
    default: return 'تحتاج مراجعة';
  }
};

const getClassEvaluation = (average: string, successRate: string) => {
  const avg = parseFloat(average);
  const rate = parseFloat(successRate);
  if (avg >= 16 && rate >= 85) return 'ممتاز';
  if (avg >= 14 && rate >= 75) return 'جيد جداً';
  if (avg >= 12 && rate >= 65) return 'جيد';
  if (avg >= 10 && rate >= 50) return 'مقبول';
  return 'يحتاج تحسين';
};

const getStudentRecommendation = (average: string, mention: string) => {
  const avg = parseFloat(average);
  if (avg >= 18) return 'توجيه للتميز';
  if (avg >= 15) return 'تشجيع مستمر';
  if (avg >= 12) return 'دعم إضافي';
  return 'برنامج تحسين';
};

const getSubjectEvaluation = (average: string, successRate: string) => {
  const avg = parseFloat(average);
  const rate = parseFloat(successRate);
  if (avg >= 16 && rate >= 85) return 'ممتاز';
  if (avg >= 14 && rate >= 75) return 'جيد جداً';
  if (avg >= 12 && rate >= 65) return 'جيد';
  if (avg >= 10 && rate >= 50) return 'مقبول';
  return 'يحتاج تحسين';
};