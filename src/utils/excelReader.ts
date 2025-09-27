// excelReader.ts - RTL Arabic Support
interface Eleve {
  numero: number;
  nom: string;
  sexe: 'ذكر' | 'أنثى';
  redoublement: boolean;
  classe: string;
  matieres: {
    [key: string]: number;
  };
  moyenne: number;
}

interface ExcelData {
  numero: number;
  nom: string;
  sexe: string;
  redoublement: string;
  classe: string;
  arabe: number;
  amazigh: number;
  francais: number;
  anglais: number;
  islamique: number;
  civile: number;
  histoire: number;
  mathematiques: number;
  sciences: number;
  physique: number;
  informatique: number;
  arts: number;
  musique: number;
  sport: number;
  moyenne: number;
}

// Import XLSX for browser usage
import * as XLSX from 'xlsx';

function normalizeLevel(raw: string): '1AF' | '2AF' | '3AF' | '4AF' | '5AF' | 'BEM' | 'AF' | null {
  const v = (raw || '').toString().trim();
  if (!v) return null;
  const upper = v.toUpperCase();
  // Direct matches
  if (['1AF','2AF','3AF','4AF','5AF','BEM'].includes(upper)) return upper as any;
  if (['1AM','2AM','3AM','4AM'].includes(upper)) return (upper[0] + 'AF') as any;
  // Arabic short forms س1م ... س4م
  if (/^\s*س\s*1\s*م\s*$/.test(v)) return '1AF';
  if (/^\s*س\s*2\s*م\s*$/.test(v)) return '2AF';
  if (/^\s*س\s*3\s*م\s*$/.test(v)) return '3AF';
  if (/^\s*س\s*4\s*م\s*$/.test(v)) return '4AF';
  // Arabic long forms
  if (v.includes('الأولى') && v.includes('متوسط')) return '1AF';
  if (v.includes('الثانية') && v.includes('متوسط')) return '2AF';
  if (v.includes('الثالثة') && v.includes('متوسط')) return '3AF';
  if (v.includes('الرابعة') && v.includes('متوسط')) return '4AF';
  if (v.includes('شهادة التعليم المتوسط') || v.includes('BEM')) return 'BEM';
  return 'AF';
}

export async function extractStudents(file: File): Promise<Eleve[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Detect level (tolerant). If missing/invalid, default to AF (non-BEM schema)
        const detected = normalizeLevel(worksheet['B1']?.v);
        const level: any = detected || 'AF';
        
        // Convert sheet to array of rows with RTL support (no fixed range)
        const allRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: ''
        }) as any[];

        // Auto-detect header row index by looking for Arabic header keywords
        const headerKeywords = ['الجنس', 'الإعادة', 'اللقب', 'اللقب و الاسم', 'القسم', 'معدل'];
        let headerIndex = 0;
        for (let i = 0; i < Math.min(10, allRows.length); i++) {
          const rowStr = (allRows[i] || []).join(' ');
          if (headerKeywords.some(k => rowStr.includes(k))) { headerIndex = i; break; }
        }
        // Data rows begin after the detected header row
        const headerRow: any[] = allRows[headerIndex] || [];
        const jsonData: any[][] = allRows.slice(headerIndex + 1);
        
        // Build header name → index map with robust Arabic normalization
        const normalizeArabic = (s: string): string => {
          return String(s || '')
            .replace(/[\u0617-\u061A\u064B-\u0652]/g, '') // remove diacritics
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .replace(/\s+/g, ' ')
            .replace(/\s*و\s*/g, ' و ')
            .trim();
        };
        const headerTextRaw = headerRow.map(v => String(v || ''));
        const headerText = headerTextRaw.map(normalizeArabic);
        const findIdx = (cands: string[], fallback: number): number => {
          const normalizedCands = cands.map(normalizeArabic);
          for (const cand of normalizedCands) {
            let i = headerText.findIndex(h => h === cand);
            if (i >= 0) return i;
            // fallback to contains in case of extra notes in the header cell
            i = headerText.findIndex(h => h.includes(cand));
            if (i >= 0) return i;
          }
          return fallback;
        };

        const idxNumero = findIdx(['رقم','الرقم','numero'], 0);
        const idxNom = findIdx(['اللقب والاسم','اللقب و الاسم','الاسم و اللقب','الاسم واللقب','القب و الاسم','القب والاسم','nomPrenom'], 1);
        const idxSexe = findIdx(['الجنس','sexe'], 2);
        const idxRedouble = findIdx(['الإعادة','redouble'], 3);
        const idxClasse = findIdx(['القسم','القسم ','classe'], 4);

        const idxArabe = findIdx(['اللغة العربية','عربية'], 5);
        const idxAmazigh = findIdx(['اللغة اﻷمازيغية','اللغة الأمازيغية','أمازيغية'], 6);
        const idxFrancais = findIdx(['اللغة الفرنسية','فرنسية'], 7);
        const idxAnglais = findIdx(['اللغة الإنجليزية','إنجليزية'], 8);
        const idxIslamique = findIdx(['التربية الإسلامية','إسلامية'], 9);
        const idxCivique = findIdx(['التربية المدنية','مدنية'], 10);
        const idxHistGeo = findIdx(['التاريخ والجغرافيا','تاريخ','جغرافيا'], 11);
        const idxMath = findIdx(['الرياضيات','رياضيات'], 12);
        const idxSVT = findIdx(['ع الطبيعة و الحياة','العلوم الطبيعية و الحياة','طبيعة'], 13);
        const idxPhys = findIdx(['ع الفيزيائية والتكنولوجيا','العلوم الفيزيائية و التكنولوجيا','فيزياء'], 14);
        const idxInfo = findIdx(['المعلوماتية','إعلامية'], 15);
        const idxArts = findIdx(['التربية التشكيلية','تشكيلية'], 16);
        const idxMusique = findIdx(['التربية الموسيقية','موسيقية'], 17);
        const idxSport = findIdx(['ت البدنية و الرياضية','التربية البدنية و الرياضية','رياضة'], 18);

        // Helper: determine if a row is a valid student line (robust to column order)
        const isValidRow = (row: any[]): boolean => {
          const hasName = String(row[idxNom] || '').trim().length > 0;
          // Consider any numeric-looking value anywhere except the name/metadata columns
          const numericCells = (row || [])
            .map(v => parseFloat(String(v).toString().replace(',', '.')))
            .filter(v => Number.isFinite(v));
          const hasScores = numericCells.length > 0;
          return hasName && hasScores;
        };

        // Map to Eleve format with RTL text handling
        let seq = 1;
        const eleves: Eleve[] = jsonData
          .filter(row => Array.isArray(row) && isValidRow(row))
          .map((row) => {
            const matieres: { [key: string]: number } = {};
            
            // Map subjects based on level (RTL order)
            const num = (i: number) => {
              const v = row[i];
              const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
              return Number.isFinite(n) ? n : 0;
            };
            matieres['عربية'] = num(idxArabe);
            matieres['أمازيغية'] = num(idxAmazigh);
            matieres['فرنسية'] = num(idxFrancais);
            matieres['إنجليزية'] = num(idxAnglais);
            matieres['إسلامية'] = num(idxIslamique);
            matieres['مدنية'] = num(idxCivique);
            matieres['تاريخ'] = num(idxHistGeo);
            matieres['رياضيات'] = num(idxMath);
            matieres['طبيعة'] = num(idxSVT);
            matieres['فيزياء'] = num(idxPhys);
            matieres['إعلامية'] = num(idxInfo);
            matieres['تشكيلية'] = num(idxArts);
            matieres['موسيقية'] = num(idxMusique);
            matieres['رياضة'] = num(idxSport);
            
            const parsedNumero = parseInt(row[idxNumero]);
            const numero = Number.isFinite(parsedNumero) && parsedNumero > 0 ? parsedNumero : seq++;
            return {
              numero,
              nom: String(row[idxNom] || '').trim(),
              sexe: String(row[idxSexe] || '').trim() === 'أنثى' ? 'أنثى' : 'ذكر',
              redoublement: String(row[idxRedouble] || '').trim() === 'نعم',
              classe: String(row[idxClasse] || '').trim(),
              matieres,
              moyenne: (() => { const v = row[row.length - 1]; const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : 0; })()
            };
          });
        
        resolve(eleves);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to create Excel template with RTL formatting
export function createExcelTemplate(level: string, semester?: number): string {
  // Determine the semester average column based on the semester parameter
  const semesterAverage = semester ? `معدل الفصل ${semester}` : 'معدل الفصل 1';
  
  // Template structure based on the image requirements - all subjects included
  const headers = [
    semesterAverage, 'التربية البدنية والرياضية', 'التربية الموسيقية', 'التربية التشكيلية', 
    'المعلوماتية', 'العلوم الفيزيائية والتكنولوجيا', 'العلوم الطبيعية', 'الرياضيات', 
    'التاريخ والجغرافيا', 'التربية المدنية', 'التربية الإسلامية', 'اللغة الإنجليزية', 
    'اللغة الفرنسية', 'اللغة الأمازيغية', 'اللغة العربية', 'الإعادة', 'الجنس', 'الرقم', 'اللقب و الاسم'
  ];
  
  // Create workbook with RTL support
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'لا', 'ذكر', 1, 'محمد أحمد'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'لا', 'أنثى', 2, 'علي فاطمة'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'نعم', 'ذكر', 3, 'يوسف علي']
  ]);
  
  // Apply RTL formatting to the worksheet
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1');
  
  // Set RTL direction for all cells
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) continue;
      
      // Set RTL alignment for Arabic text
      ws[cellAddress].s = {
        ...ws[cellAddress].s,
        alignment: {
          horizontal: 'right',
          vertical: 'center',
          textRotation: 0,
          wrapText: true,
          indent: 0,
          readingOrder: 2 // RTL reading order
        },
        font: {
          name: 'Arial Unicode MS',
          sz: 12,
          bold: row === 1, // Bold for headers
          color: { rgb: '000000' }
        },
        fill: {
          fgColor: { rgb: row === 1 ? '00B050' : 'FFFFFF' } // Green for headers
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
  
  // Set column widths for better RTL display - adjusted for new structure with 19 columns
  const colWidths = [];
  for (let col = 0; col <= range.e.c; col++) {
    if (col === 18) { // Name column (اللقب و الاسم) - last column
      colWidths[col] = { wch: 20 };
    } else if (col === 17) { // Number column (الرقم)
      colWidths[col] = { wch: 8 };
    } else if (col === 16) { // Gender column (الجنس)
      colWidths[col] = { wch: 8 };
    } else if (col === 15) { // Repeat column (الإعادة)
      colWidths[col] = { wch: 10 };
    } else if (col === 0) { // Average column (معدل الفصل X)
      colWidths[col] = { wch: 12 };
    } else { // Subject columns
      colWidths[col] = { wch: 15 };
    }
  }
  ws['!cols'] = colWidths;
  
  // Set sheet name based on semester
  const sheetName = semester ? `نتائج_الفصل_${semester === 2 ? 'الثاني' : semester === 3 ? 'الثالث' : 'الأول'}` : 'نتائج_الفصل_الأول';
  wb.SheetNames[0] = sheetName;
  wb.Sheets[sheetName] = ws;
  
  // Convert to base64
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  return wbout;
}

// Function to download Excel template
export function downloadExcelTemplate(level: string, filename?: string, semester?: number): void {
  const template = createExcelTemplate(level, semester);
  const blob = new Blob([Uint8Array.from(atob(template), c => c.charCodeAt(0))], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `template_${level}_sem${semester || 1}_RTL.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}