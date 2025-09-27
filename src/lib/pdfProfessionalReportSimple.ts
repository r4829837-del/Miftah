import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fonction pour créer un rapport PDF complet et modulaire
export const createProfessionalReport = async (data: any) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Générer chaque page séparément
    const pages: string[] = [];
    pages.push(generatePage1(data));
    pages.push(generatePage2(data));

    // Pages cartes matières: paginer par groupes de 12 cartes
    const totalSubjects = Array.isArray(data?.subjects) ? data.subjects.length : 0;
    const cardsPerPage = 12;
    const numCardPages = Math.ceil(totalSubjects / cardsPerPage) || 1;
    for (let p = 0; p < numCardPages; p++) {
      pages.push(generateSubjectCardsPage(data, p, cardsPerPage));
    }

    // Page résumé complet
    pages.push(generatePageSummary(data));
    // Page recommandations finales + signatures
    pages.push(generatePageRecommendations(data));

    // Supprimer systématiquement la 4ème page si elle existe (index 3)
    if (pages.length >= 4) {
      pages.splice(3, 1);
    }
    
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
          <p style="font-size: 14px; margin: 0 0 10px 0;">
            تم إعداد هذا التقرير من قبل:
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <p style="font-size: 14px; margin: 0;"><strong>مستشار التوجيه النهائي:</strong> __________________________</p>
            <p style="font-size: 14px; margin: 0;"><strong>التوقيع:</strong> __________________________</p>
            <p style="font-size: 14px; margin: 0;"><strong>التاريخ:</strong> __________________________</p>
            
          </div>
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
          <h2 style="color: #92400e; font-size: 22px; margin: 0 0 15px 0;">💭 تعليقات مستشار التوجيه النهائي</h2>
        <div style="background: white; padding: 16px; border-radius: 8px; margin: 15px 0; border: 1px dashed #fbbf24;">
          <div style="color:#6b7280; font-size: 12px; margin-bottom: 8px;">مساحة مخصصة للكتابة اليدوية</div>
          <div style="height: 160px; background-image: repeating-linear-gradient(transparent, transparent 22px, #e5e7eb 23px); border-radius: 6px;"></div>
        </div>
      </div>
    </div>
  `;
};

// Page cartes matières: générique avec pagination
function generateSubjectCardsPage(data: any, pageIndex: number, cardsPerPage: number) {
  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
      <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 30px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">
        ${pageIndex === 0 ? '📚 بطاقات تحليل المواد' : '📚 بطاقات تحليل المواد (تكملة)'}
      </h1>
      
      <div style="background: #f8fafc; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 16px 0; text-align:center;">شبكة بطاقات المواد</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
          ${(() => {
            const subjects = (data.subjects || []).slice().sort((a: any, b: any) => (parseFloat(b?.average) || 0) - (parseFloat(a?.average) || 0));
            const start = pageIndex * cardsPerPage;
            const end = start + cardsPerPage;
            const cards = subjects.slice(start, end).map((subject: any, idx: number) => {
              const avg = parseFloat(subject?.average) || 0;
              let evalText = '—';
              if (avg >= 17) evalText = 'ممتاز جداً';
              else if (avg >= 16) evalText = 'ممتاز';
              else if (avg >= 14) evalText = 'جيد جداً';
              else if (avg >= 12) evalText = 'جيد';
              else if (avg >= 10) evalText = 'مقبول';
              else evalText = 'ضعيف';
              let recText = '—';
              if (avg >= 16) recText = 'الاستمرار على نفس الوتيرة وتعزيز التميز';
              else if (avg >= 14) recText = 'الحفاظ على الأداء مع تحديات إضافية';
              else if (avg >= 12) recText = 'تعزيز المراجعة المنتظمة وتحسين نقاط الضعف';
              else if (avg >= 10) recText = 'وضع خطة دعم لرفع المعدل فوق 12';
              else recText = 'تدخل فوري ودروس دعم مركزة';

              // Couleur d'en-tête selon la moyenne
              const headerColor = avg >= 16 ? '#16a34a' : avg >= 14 ? '#2563eb' : avg >= 12 ? '#f59e0b' : avg >= 10 ? '#ea580c' : '#dc2626';
              const headerBg = avg >= 16 ? 'linear-gradient(135deg, #bbf7d0, #86efac)' : avg >= 14 ? 'linear-gradient(135deg, #bfdbfe, #93c5fd)' : avg >= 12 ? 'linear-gradient(135deg, #fde68a, #fbbf24)' : avg >= 10 ? 'linear-gradient(135deg, #fed7aa, #fdba74)' : 'linear-gradient(135deg, #fecaca, #fca5a5)';
              return `
              <div style="background:#ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow:hidden;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:${headerBg};">
                  <div style="font-weight:bold; color:${headerColor}; font-size:16px;">${avg.toFixed(2)}</div>
                  <div style="font-size:12px; color:#0f172a; background:#ffffff; border:1px solid #e5e7eb; padding:2px 6px; border-radius:999px;">${start + idx + 1}#</div>
                </div>
                <div style="padding:10px;">
                  <div style="color:#0f172a; font-weight:bold; font-size:15px; margin-bottom:8px;">${subject?.name || '—'}</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:8px; min-height:56px;">
                      <div style="color:#64748b; font-size:12px; margin-bottom:4px;">التقييم</div>
                      <div style="color:#111827; font-size:12px;">${evalText}</div>
                    </div>
                    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:8px; min-height:56px;">
                      <div style="color:#64748b; font-size:12px; margin-bottom:4px;">التوصية</div>
                      <div style="color:#111827; font-size:12px;">${recText}</div>
                    </div>
                  </div>
                </div>
              </div>
  `;
            }).join('');
            return cards || '';
          })()}
        </div>
      </div>
    </div>
  `;
}

// Page 4 supprimée

// Page recommandations finales
const generatePageRecommendations = (data: any) => {
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
        <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; text-align: right;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; color: #ffffff;">
              <p style="font-size: 14px; margin: 0;"><strong>مستشار التوجيه النهائي:</strong> __________________________</p>
            <p style="font-size: 14px; margin: 0;"><strong>التوقيع:</strong> __________________________</p>
            <p style="font-size: 14px; margin: 0;"><strong>التاريخ:</strong> __________________________</p>
            
          </div>
        </div>
      </div>
    </div>
  `;
};

// Page résumé complet: تحليل شامل للأداء
const generatePageSummary = (data: any) => {
  const subjects: Array<{ name: string; average: number }> = Array.isArray(data?.subjects)
    ? (data.subjects as Array<any>)
        .map((s: any) => ({ name: s?.name || '—', average: Number.parseFloat(s?.average) || 0 }))
        .sort((a: { name: string; average: number }, b: { name: string; average: number }) => b.average - a.average)
    : [];

  const top3 = subjects.slice(0, 3);
  const bottom3 = subjects.slice(-3).reverse();

  const evalFor = (avg: number) => {
    if (avg >= 17) return 'ممتاز جداً';
    if (avg >= 16) return 'ممتاز';
    if (avg >= 14) return 'جيد جداً';
    if (avg >= 12) return 'جيد';
    if (avg >= 10) return 'مقبول';
    return 'ضعيف';
  };
  const recFor = (avg: number) => {
    if (avg >= 16) return 'الاستمرار وتعزيز التميز';
    if (avg >= 14) return 'المحافظة مع تحديات إضافية';
    if (avg >= 12) return 'مراجعة منظمة وتحسين النقاط الضعيفة';
    if (avg >= 10) return 'خطة دعم لرفع المعدل فوق 12';
    return 'تدخل فوري ودروس دعم مركزة';
  };

  const rowsHtml = subjects
    .map((s, i) => `
      <tr style="background: ${i % 2 === 0 ? '#f8fafc' : 'white'};">
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold;">${i + 1}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold;">${s.name}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #065f46; font-weight: bold;">${s.average.toFixed(2)}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${evalFor(s.average)}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${recFor(s.average)}</td>
      </tr>
    `)
    .join('');

  const card = (title: string, item?: { name: string; average: number }) => `
    <div style="background:#ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px;">
      <div style="color:#111827; font-size:14px; margin-bottom:6px;">${title}</div>
      ${item
        ? `<div style=\"display:flex; justify-content:space-between; align-items:center;\">
            <div style=\"font-weight:bold; color:#111827;\">${item.name}</div>
            <div style=\"font-weight:bold; color:#065f46;\">${item.average.toFixed(2)}</div>
           </div>
           <div style=\"margin-top:6px; color:#374151; font-size:12px;\">
             التقييم: ${evalFor(item.average)} — التوصية: ${recFor(item.average)}
           </div>`
        : '<div style="color:#6b7280;">—</div>'}
    </div>
  `;

  return `
    <div style="font-family: 'Amiri', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; background: white; min-height: 100vh;">
      <h1 style="color: #1e40af; font-size: 28px; margin: 0 0 20px 0; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 12px;">
        تحليل شامل للأداء - تحليل المعدل العام للمادة
      </h1>

      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 12px 0 20px 0;">
        ${card('أفضل مادة', top3[0])}
        ${card('الثانية', top3[1])}
        ${card('الثالثة', top3[2])}
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 0 0 20px 0;">
        ${card('أضعف مادة', bottom3[0])}
        ${card('قبل الأخيرة', bottom3[1])}
        ${card('الثالثة قبل الأخيرة', bottom3[2])}
      </div>

      <div style="background:#ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px;">
        <h2 style="color:#111827; font-size:18px; margin: 0 0 10px 0;">جدول تفصيلي لكل المواد</h2>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse: collapse; font-size: 16px;">
            <thead>
              <tr style="background:#eef2ff; color:#1e3a8a;">
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">الترتيب</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">المادة</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">المعدل العام</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">التقييم</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align:center;">التوصية</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#6b7280;">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};