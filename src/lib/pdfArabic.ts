import jsPDF from 'jspdf';

let fontLoaded = false;

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
};

export const ensureArabicFont = async (pdf: jsPDF): Promise<void> => {
  if (fontLoaded) {
    // @ts-expect-error setR2L exists on jspdf instance
    if (typeof (pdf as any).setR2L === 'function') (pdf as any).setR2L(true);
    return;
  }
  
  try {
    console.log('Chargement de la police Amiri...');
    const res = await fetch('/fonts/Amiri-Regular.ttf');
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
    
    const buf = await res.arrayBuffer();
    console.log('Taille du fichier de police:', buf.byteLength, 'bytes');
    
    if (buf.byteLength === 0) {
      throw new Error('Le fichier de police est vide');
    }
    
    const b64 = arrayBufferToBase64(buf);
    console.log('Police convertie en base64, longueur:', b64.length);
    
    // Ajouter la police au VFS
    (pdf as any).addFileToVFS('Amiri-Regular.ttf', b64);
    
    // Enregistrer la police avec différents styles
    (pdf as any).addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    (pdf as any).addFont('Amiri-Regular.ttf', 'Amiri', 'bold');
    
    // Activer RTL
    // @ts-expect-error setR2L exists on jspdf instance
    if (typeof (pdf as any).setR2L === 'function') {
      (pdf as any).setR2L(true);
      console.log('RTL activé');
    }
    
    fontLoaded = true;
    console.log('Police Amiri chargée avec succès');
    
  } catch (error) {
    console.error('Erreur lors du chargement de la police Amiri:', error);
    // Fallback: essayer d'activer RTL même si la police a échoué
    // @ts-expect-error setR2L exists on jspdf instance
    if (typeof (pdf as any).setR2L === 'function') {
      (pdf as any).setR2L(true);
      console.log('RTL activé en mode fallback');
    }
  }
};

// Fonction utilitaire pour ajouter du texte arabe
export const addArabicText = (pdf: jsPDF, text: string, x: number, y: number, options: any = {}) => {
  // S'assurer que la police est chargée
  if (fontLoaded) {
    pdf.setFont('Amiri', options.fontStyle || 'normal');
  } else {
    // Fallback vers helvetica si la police arabe n'est pas disponible
    pdf.setFont('helvetica', options.fontStyle || 'normal');
  }
  
  pdf.text(text, x, y, options);
};

