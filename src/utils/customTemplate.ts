import * as XLSX from 'xlsx';

/**
 * Créer un template personnalisé basé sur la structure fournie par l'utilisateur
 */
export function createCustomTemplate(): XLSX.WorkBook {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Headers basés sur votre template (ordre de droite à gauche)
    const headers = [
      'التوجيه النهائي',      // Colonne 1 (droite)
      'معدل الانتقال',        // Colonne 2
      'معدل التقويم',          // Colonne 3
      'معدل ش.ت.م',          // Colonne 4
      'معدل الفصل 3',        // Colonne 5
      'معدل الفصل 2',        // Colonne 6
      'معدل الفصل 1',        // Colonne 7
      'الإعادة',             // Colonne 8
      'الجنس',               // Colonne 9
      'اللقب و الاسم',        // Colonne 10
      'الرقم'                // Colonne 11 (gauche)
    ];

    // Données d'exemple basées sur votre template (ordre RTL)
    const sampleData = [
      ['', '', '', '', '18', '', '', 'لا', 'ذكر', 'بلحسن عبد الرزاق', 1],
      ['', '', '', '', '18', '', '', 'لا', 'أنثى', 'طعام خلود', 2]
    ];

    const data = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Appliquer le formatage RTL de manière sécurisée
    applyRTLFormatting(worksheet, data.length, headers.length);
    
    // Définir les largeurs de colonnes (ordre RTL)
    const colWidths = [
      { wch: 15 },  // التوجيه النهائي (colonne 1 - droite)
      { wch: 12 },  // معدل الانتقال (colonne 2)
      { wch: 12 },  // معدل التقويم (colonne 3)
      { wch: 12 },  // معدل ش.ت.م (colonne 4)
      { wch: 12 },  // معدل الفصل 3 (colonne 5)
      { wch: 12 },  // معدل الفصل 2 (colonne 6)
      { wch: 12 },  // معدل الفصل 1 (colonne 7)
      { wch: 10 },  // الإعادة (colonne 8)
      { wch: 10 },  // الجنس (colonne 9)
      { wch: 20 },  // اللقب و الاسم (colonne 10)
      { wch: 8 }    // الرقم (colonne 11 - gauche)
    ];
    worksheet['!cols'] = colWidths;
    
    // Nom de la feuille
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج_الطلاب');
    
    return workbook;
  } catch (error) {
    console.error('Erreur dans createCustomTemplate:', error);
    throw error;
  }
}

/**
 * Appliquer le formatage RTL au worksheet
 */
function applyRTLFormatting(worksheet: XLSX.WorkSheet, rowCount: number, colCount: number) {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
  
  // Appliquer le formatage RTL à toutes les cellules
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        ...worksheet[cellAddress].s,
        alignment: {
          horizontal: 'right',
          vertical: 'center',
          textRotation: 0,
          wrapText: true,
          indent: 0,
          readingOrder: 2 // RTL - lecture de droite à gauche
        },
        font: {
          name: 'Arial Unicode MS',
          sz: 12,
          bold: row === 0, // Bold pour les headers
          color: { rgb: '000000' }
        },
        fill: {
          fgColor: { rgb: row === 0 ? '00B050' : 'FFFFFF' } // Vert pour les headers
        },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  }
  
  // Configuration RTL pour la feuille entière
  worksheet['!direction'] = 'rtl';
  
  // Appliquer la direction RTL aux colonnes
  const totalCols = range.e.c - range.s.c + 1;
  
  // Initialiser !cols si nécessaire
  if (!worksheet['!cols']) {
    worksheet['!cols'] = [];
  }
  
  for (let i = 0; i < totalCols; i++) {
    if (!worksheet['!cols'][i]) {
      worksheet['!cols'][i] = {};
    }
    worksheet['!cols'][i].hidden = false;
  }
}

/**
 * Télécharger le template personnalisé
 */
export function downloadCustomTemplate(): void {
  try {
    console.log('Début de la création du template...');
    const template = createCustomTemplate();
    console.log('Template créé avec succès');
    
    const wbout = XLSX.write(template, { bookType: 'xlsx', type: 'array' });
    console.log('Fichier Excel généré');
    
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    console.log('URL créée:', url);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_BEM_personnalise.xlsx';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    console.log('Lien ajouté au DOM');
    
    link.click();
    console.log('Clic simulé');
    
    // Nettoyer après un délai
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Nettoyage effectué');
    }, 100);
    
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    alert('Erreur lors de la création du template: ' + error);
  }
}