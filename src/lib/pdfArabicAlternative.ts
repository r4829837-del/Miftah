import jsPDF from 'jspdf';

// Fonction alternative pour gérer les polices arabes
export const createArabicPDF = () => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Configuration de base pour le texte arabe
  pdf.setFont('helvetica');
  
  // Activer RTL si disponible
  // @ts-expect-error setR2L exists on jspdf instance
  if (typeof (pdf as any).setR2L === 'function') {
    (pdf as any).setR2L(true);
  }
  
  return pdf;
};

// Fonction pour ajouter du texte arabe avec gestion des caractères
export const addArabicTextSafe = (pdf: jsPDF, text: string, x: number, y: number, options: any = {}) => {
  try {
    // Essayer d'utiliser la police par défaut avec RTL
    pdf.setFont('helvetica', options.fontStyle || 'normal');
    pdf.text(text, x, y, options);
  } catch (error) {
    console.warn('Erreur lors de l\'ajout du texte arabe:', error);
    // Fallback: utiliser du texte ASCII
    const fallbackText = text.replace(/[\u0600-\u06FF]/g, '?');
    pdf.text(fallbackText, x, y, options);
  }
};

// Fonction pour créer un PDF de test simple
export const createTestArabicPDF = async () => {
  const pdf = createArabicPDF();
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;
  
  // Titre
  pdf.setFontSize(20);
  addArabicTextSafe(pdf, 'Test PDF Arabic', pageWidth / 2, y, { align: 'center' });
  y += 20;
  
  // Test avec différents textes
  const testTexts = [
    'Test 1: هذا نص تجريبي',
    'Test 2: إنشاء تقرير PDF',
    'Test 3: تحليل النتائج',
    'Test 4: التعليم الثانوي',
    'Test 5: المعلومات العامة'
  ];
  
  pdf.setFontSize(12);
  testTexts.forEach((text, index) => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    
    addArabicTextSafe(pdf, text, margin, y);
    y += 10;
  });
  
  return pdf;
};