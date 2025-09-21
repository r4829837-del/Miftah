import XLSX from 'xlsx';

try {
  const wb = XLSX.readFile('../public/templates/تحليل النتائج الفصل الأول 2024-2025-رابعة متوسط 01.xltx');
  console.log('Feuilles disponibles:', wb.SheetNames);
  
  wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, {header:1});
    console.log(`\n=== ${name} ===`);
    console.log('Premières lignes:');
    data.slice(0, 15).forEach((row, index) => {
      console.log(`Ligne ${index + 1}:`, row);
    });
  });
} catch (error) {
  console.error('Erreur lors de la lecture du fichier:', error.message);
}