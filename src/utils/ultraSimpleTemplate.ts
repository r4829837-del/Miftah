import * as XLSX from 'xlsx';

/**
 * Version ultra-simple du template BEM
 */
export function downloadUltraSimpleTemplate(): void {
  try {
    console.log('Création du template ultra-simple...');
    
    // Données minimales
    const data = [
      ['التوجيه النهائي', 'معدل الانتقال', 'معدل ش.ت.م', 'معدل الفصل 3', 'معدل الفصل 2', 'معدل الفصل 1', 'الإعادة', 'الجنس', 'اللقب و الاسم', 'الرقم'],
      ['', '', '', '18', '', '', 'لا', 'ذكر', 'بلحسن عبد الرزاق', 1],
      ['', '', '', '18', '', '', 'لا', 'أنثى', 'طعام خلود', 2]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Formatage RTL minimal
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:J3');
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            alignment: { 
              horizontal: 'right', 
              vertical: 'center',
              readingOrder: 2 // RTL
            },
            font: { 
              name: 'Arial Unicode MS', 
              sz: 12, 
              bold: row === 0 
            },
            fill: {
              fgColor: { rgb: row === 0 ? '00B050' : 'FFFFFF' }
            }
          };
        }
      }
    }
    
    // Largeurs de colonnes
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 8 }
    ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج_الطلاب');
    
    console.log('Template créé, téléchargement...');
    XLSX.writeFile(workbook, 'template_BEM_ultra_simple.xlsx');
    console.log('Téléchargement terminé avec succès');
    
  } catch (error) {
    console.error('Erreur dans ultra-simple:', error);
    alert('Erreur: ' + error);
  }
}