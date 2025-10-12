import * as XLSX from 'xlsx';

/**
 * Version simplifiée du template pour test
 */
export function downloadSimpleTemplate(): void {
  try {
    console.log('Création du template simplifié...');
    
    // Données simples
    const data = [
      ['التوجيه النهائي', 'معدل الانتقال', 'معدل التقويم', 'معدل ش.ت.م', 'معدل الفصل 3', 'معدل الفصل 2', 'معدل الفصل 1', 'الإعادة', 'الجنس', 'اللقب و الاسم', 'الرقم'],
      ['', '', '', '', '18', '', '', 'لا', 'ذكر', 'بلحسن عبد الرزاق', 1],
      ['', '', '', '', '18', '', '', 'لا', 'أنثى', 'طعام خلود', 2]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    
    // Appliquer le formatage RTL basique
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            alignment: { horizontal: 'right', vertical: 'center' },
            font: { name: 'Arial Unicode MS', sz: 12, bold: row === 0 }
          };
        }
      }
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج_الطلاب');
    
    console.log('Template créé, génération du fichier...');
    XLSX.writeFile(workbook, 'template_BEM_simple.xlsx');
    console.log('Téléchargement terminé');
    
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur: ' + error);
  }
}