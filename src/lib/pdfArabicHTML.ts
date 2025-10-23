import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

// Fonction pour créer un PDF avec du contenu HTML converti en image
export const createHTMLBasedPDF = async (htmlContent: string, _title: string = 'تقرير') => {
  try {
    // Créer un élément temporaire pour le contenu HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '297mm'; // A4 landscape width for better table display
    tempDiv.style.minHeight = '210mm'; // A4 height
    tempDiv.style.fontFamily = 'Amiri, Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.textAlign = 'right';
    tempDiv.style.padding = '15px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';
    tempDiv.style.overflow = 'visible';
    
    document.body.appendChild(tempDiv);
    
    // Attendre que les polices se chargent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convertir en canvas avec des options plus robustes
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5, // Réduire l'échelle pour éviter les problèmes de mémoire
      useCORS: true,
      allowTaint: false, // Changer à false pour éviter les problèmes de sécurité
      backgroundColor: '#ffffff',
      logging: false, // Désactiver les logs pour éviter les erreurs
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });
    
    // Vérifier que le canvas est valide
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas invalide généré');
    }
    
    // Nettoyer l'élément temporaire
    document.body.removeChild(tempDiv);
    
    // Créer le PDF en mode paysage pour un meilleur affichage du tableau
    const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' pour landscape
    
    // Vérifier que le canvas peut être converti en data URL
    let imgData;
    try {
      imgData = canvas.toDataURL('image/png', 0.95); // Réduire la qualité pour éviter les erreurs
      if (!imgData || imgData === 'data:,') {
        throw new Error('Impossible de convertir le canvas en image');
      }
    } catch (error) {
      console.error('Erreur lors de la conversion canvas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error('Erreur lors de la génération de l\'image: ' + errorMessage);
    }
    
    // Calculer les dimensions pour ajuster l'image au PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Ajuster le ratio pour que l'image s'adapte bien à la page
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    // Centrer l'image sur la page
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;
    
    // Ajouter l'image au PDF
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    
    return pdf;
    
  } catch (error) {
    console.error('Erreur lors de la création du PDF HTML:', error);
    throw error;
  }
};

// Fonction alternative pour créer un PDF sans html2canvas (plus fiable)
export const createDirectPDF = (htmlContent: string, title: string = 'تقرير') => {
  try {
    // Créer le PDF en mode paysage
    const pdf = new jsPDF('l', 'mm', 'a4');
    
    // Ajouter le titre
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246); // Couleur bleue
    pdf.text(title, 20, 20);
    
    // Ajouter la date
    pdf.setFontSize(12);
    pdf.setTextColor(100, 116, 139); // Couleur grise
    pdf.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-DZ')}`, 20, 30);
    
    // Ajouter une ligne de séparation
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, 277, 35);
    
    // Ajouter le contenu HTML comme texte (version simplifiée)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Diviser le texte en lignes
    const lines = pdf.splitTextToSize(textContent, 250); // Largeur de 250mm
    
    // Ajouter le contenu
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(lines, 20, 45);
    
    return pdf;
    
  } catch (error) {
    console.error('Erreur lors de la création du PDF direct:', error);
    throw error;
  }
};

// Fonction spécialisée pour créer des cartes d'élèves individuelles
export const createStudentCardsPDF = (students: any[], bemSubjects: string[], bemRows: any[]) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4'); // Mode portrait pour les cartes individuelles
    let currentY = 20;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    students.forEach((student, index) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = 20;
      }
      
      // En-tête de la carte
      pdf.setFillColor(59, 130, 246);
      pdf.rect(15, currentY, pageWidth - 30, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('بطاقة التلميذ الفردية', pageWidth / 2, currentY + 10, { align: 'center' });
      
      currentY += 25;
      
      // Informations de base
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('معلومات التلميذ:', 20, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`الاسم: ${student.name || `تلميذ ${index + 1}`}`, 20, currentY);
      currentY += 6;
      pdf.text(`الجنس: ${student.gender === 'male' ? 'ذكر' : student.gender === 'female' ? 'أنثى' : 'غير محدد'}`, 20, currentY);
      currentY += 6;
      pdf.text(`الترتيب: ${index + 1}`, 20, currentY);
      currentY += 10;
      
      // Moyennes
      pdf.setFont('helvetica', 'bold');
      pdf.text('المعدلات:', 20, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      const annualAvg = (Number(student.moyT1 || 0) + Number(student.moyT2 || 0) + Number(student.moyT3 || 0)) / 3;
      pdf.text(`معدل الفصل الأول: ${student.moyT1 ? Number(student.moyT1).toFixed(1) : 'غير محدد'}`, 20, currentY);
      currentY += 6;
      pdf.text(`معدل الفصل الثاني: ${student.moyT2 ? Number(student.moyT2).toFixed(1) : 'غير محدد'}`, 20, currentY);
      currentY += 6;
      pdf.text(`معدل الفصل الثالث: ${student.moyT3 ? Number(student.moyT3).toFixed(1) : 'غير محدد'}`, 20, currentY);
      currentY += 6;
      pdf.text(`المعدل السنوي: ${annualAvg.toFixed(1)}`, 20, currentY);
      currentY += 10;
      
      // Résultats BEM
      pdf.setFont('helvetica', 'bold');
      pdf.text('نتائج ش.ت.م:', 20, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      const bemAvg = Number(student.moyBEM || 0);
      const transitionAvg = (annualAvg + bemAvg) / 2;
      pdf.text(`معدل ش.ت.م: ${student.moyBEM ? Number(student.moyBEM).toFixed(1) : 'غير محدد'}`, 20, currentY);
      currentY += 6;
      pdf.text(`معدل التقويم: ${student.moyEvaluation ? Number(student.moyEvaluation).toFixed(1) : 'غير محدد'}`, 20, currentY);
      currentY += 6;
      pdf.text(`معدل الإنتقال: ${transitionAvg.toFixed(1)}`, 20, currentY);
      currentY += 6;
      pdf.text(`التوجيه النهائي: ${student.orientation || 'غير محدد'}`, 20, currentY);
      currentY += 10;
      
      // Détails des matières (sur deux colonnes)
      pdf.setFont('helvetica', 'bold');
      pdf.text('تفاصيل المواد:', 20, currentY);
      currentY += 8;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      // Trouver les données BEM pour cet élève
      const bemData = bemRows.find(row => {
        const name = (row['اللقب و الاسم'] || row['الاسم و اللقب'] || row.nom || '').toString().trim();
        return name === student.name;
      });
      
      // Afficher les matières sur deux colonnes
      const subjectsPerColumn = Math.ceil(bemSubjects.length / 2);
      for (let i = 0; i < bemSubjects.length; i++) {
        const subject = bemSubjects[i];
        const note = bemData ? Number(bemData[subject] || 0) : 0;
        const x = i < subjectsPerColumn ? 20 : pageWidth / 2 + 10;
        const y = currentY + (i % subjectsPerColumn) * 5;
        
        pdf.text(`${subject}: ${note > 0 ? note.toFixed(1) : 'غير محدد'}`, x, y);
      }
      
      currentY += subjectsPerColumn * 5 + 15;
      
      // Ligne de séparation entre les cartes
      if (index < students.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(20, currentY, pageWidth - 20, currentY);
        currentY += 10;
      }
    });
    
    return pdf;
    
  } catch (error) {
    console.error('Erreur lors de la création du PDF des cartes:', error);
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
      
      
    </div>
  `;
};