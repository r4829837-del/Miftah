/**
 * Excel Template Manager with RTL Support
 * Handles preformatted Excel templates and RTL adaptation
 */

import * as XLSX from 'xlsx';

export interface ExcelTemplateConfig {
  semester: string;
  level: string;
  subjects: string[];
  students?: any[];
}

export interface ExcelImportResult {
  success: boolean;
  data: any[];
  message: string;
  adapted: boolean;
}

/**
 * Create a preformatted Excel template with RTL orientation
 */
export const createPreformattedTemplate = (config: ExcelTemplateConfig): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();
  
  // Create the main analysis sheet
  const analysisSheet = createAnalysisSheet(config);
  XLSX.utils.book_append_sheet(workbook, analysisSheet, 'تحليل النتائج');
  
  // Create students data sheet
  const studentsSheet = createStudentsSheet(config);
  XLSX.utils.book_append_sheet(workbook, studentsSheet, 'بيانات الطلاب');
  
  // Create grades data sheet
  const gradesSheet = createGradesSheet(config);
  XLSX.utils.book_append_sheet(workbook, gradesSheet, 'الدرجات');
  
  return workbook;
};

/**
 * Create the main analysis sheet with RTL formatting
 */
const createAnalysisSheet = (config: ExcelTemplateConfig): XLSX.WorkSheet => {
  const data = [
    // Header section
    ['تحليل نتائج الفصل الأول', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['المستوى:', config.level, 'الفصل:', config.semester, 'التاريخ:', new Date().toLocaleDateString('ar-SA'), '', ''],
    ['', '', '', '', '', '', '', ''],
    
    // Students distribution section
    ['توزيع التلاميذ حسب الجنس', '', '', '', '', '', '', ''],
    ['', 'المجموع', '', 'الإناث', '', 'الذكور', '', ''],
    ['', 'النسبة', 'العدد', 'النسبة', 'العدد', 'النسبة', 'العدد', ''],
    ['', '100.00%', '0', '0.00%', '0', '0.00%', '0', ''],
    ['', '', '', '', '', '', '', ''],
    
    // Subjects analysis section
    ['تحليل نتائج الفصل الأول', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['المادة', 'الحاضرون', 'معدل القسم', 'الإنحراف المعياري', 'ملاحظة', '', '', ''],
  ];

  // Add subjects rows
  config.subjects.forEach(subject => {
    data.push([subject, '0', '0.00', '0.00', 'لم تدرس', '', '', '']);
  });

  // Add overall average row
  data.push(['المعدل', '0', '0.00', '0.00', 'لم تدرس', '', '', '']);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply RTL formatting
  applyRTLFormatting(worksheet, data.length, 8);
  
  return worksheet;
};

/**
 * Create students data sheet
 */
const createStudentsSheet = (config: ExcelTemplateConfig): XLSX.WorkSheet => {
  const headers = [
    'الرقم',
    'اللقب و الاسم',
    'تاريخ الميلاد',
    'الجنس',
    'الإعادة',
    'معدل الفصل 1',
    'معدل الفصل 2',
    'معدل الفصل 3'
  ];

  const sampleData = [
    [1, 'محمد أحمد', '2010/05/06', 'ذكر', 'لا', '15.50', '', ''],
    [2, 'علي فاطمة', '2010/03/22', 'أنثى', 'لا', '14.75', '', '']
  ];

  const data = [headers, ...sampleData];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply RTL formatting
  applyRTLFormatting(worksheet, data.length, headers.length);
  
  return worksheet;
};

/**
 * Create grades data sheet
 */
const createGradesSheet = (config: ExcelTemplateConfig): XLSX.WorkSheet => {
  const headers = ['رقم الطالب', 'الفصل', 'المادة', 'الدرجة'];
  const data = [headers];

  // Add sample grades for each subject
  config.subjects.forEach(subject => {
    data.push(['001', config.semester, subject, '0.00']);
    data.push(['002', config.semester, subject, '0.00']);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply RTL formatting
  applyRTLFormatting(worksheet, data.length, headers.length);
  
  return worksheet;
};

/**
 * Apply RTL formatting to worksheet
 */
export const applyRTLFormatting = (worksheet: XLSX.WorkSheet, rowCount: number, colCount: number) => {
  // Set RTL direction for all cells
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Set RTL alignment and reading order
      worksheet[cellAddress].s = {
        ...worksheet[cellAddress].s,
        alignment: {
          horizontal: 'right',
          vertical: 'middle',
          textRotation: 0,
          wrapText: true,
          readingOrder: 2, // RTL reading order
          indent: 0
        }
      };
    }
  }

  // Set column widths (optimized for Arabic text)
  const colWidths = [
    { wch: 12 },  // معدل الفصل 3
    { wch: 12 },  // معدل الفصل 2
    { wch: 12 },  // معدل الفصل 1
    { wch: 10 },  // الإعادة
    { wch: 10 },  // الجنس
    { wch: 15 },  // تاريخ الميلاد
    { wch: 12 },  // القسم
    { wch: 25 },  // اللقب و الاسم
    { wch: 8 }    // الرقم
  ];
  worksheet['!cols'] = colWidths;

  // Set row heights
  const rowHeights = Array(rowCount).fill(25);
  worksheet['!rows'] = rowHeights.map(h => ({ hpt: h }));

  // Set sheet properties for RTL
  worksheet['!sheet'] = {
    ...worksheet['!sheet'],
    '!sheetFormatPr': {
      baseColWidth: 10,
      defaultRowHeight: 25
    }
  };
};

/**
 * Adapt imported Excel file to RTL orientation
 */
export const adaptExcelToRTL = (workbook: XLSX.WorkBook): XLSX.WorkBook => {
  const adaptedWorkbook = XLSX.utils.book_new();
  
  workbook.SheetNames.forEach(sheetName => {
    const originalSheet = workbook.Sheets[sheetName];
    const adaptedSheet = adaptSheetToRTL(originalSheet);
    XLSX.utils.book_append_sheet(adaptedWorkbook, adaptedSheet, sheetName);
  });
  
  return adaptedWorkbook;
};

/**
 * Adapt a single sheet to RTL orientation
 */
const adaptSheetToRTL = (worksheet: XLSX.WorkSheet): XLSX.WorkSheet => {
  if (!worksheet['!ref']) return worksheet;
  
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const adaptedWorksheet = { ...worksheet };
  
  // Apply RTL formatting to all cells
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!adaptedWorksheet[cellAddress]) continue;
      
      // Set RTL alignment
      adaptedWorksheet[cellAddress].s = {
        ...adaptedWorksheet[cellAddress].s,
        alignment: {
          horizontal: 'right',
          vertical: 'middle',
          textRotation: 0,
          wrapText: true
        }
      };
    }
  }
  
  return adaptedWorksheet;
};

/**
 * Import and process Excel file with RTL adaptation
 */
export const importExcelWithRTLAdaptation = async (file: File): Promise<ExcelImportResult> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    
    // Adapt to RTL if needed
    const adaptedWorkbook = adaptExcelToRTL(workbook);
    
    // Process the adapted workbook
    const result = processAdaptedWorkbook(adaptedWorkbook);
    
    return {
      success: true,
      data: result.data,
      message: `تم استيراد ${result.data.length} سجل بنجاح مع التكيف RTL`,
      adapted: true
    };
    
  } catch (error) {
    return {
      success: false,
      data: [],
      message: `خطأ في استيراد الملف: ${(error as Error).message}`,
      adapted: false
    };
  }
};

/**
 * Process adapted workbook and extract data
 */
const processAdaptedWorkbook = (workbook: XLSX.WorkBook): { data: any[] } => {
  const data: any[] = [];
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Process each sheet based on its name
    if (sheetName.includes('طلاب') || sheetName.includes('بيانات')) {
      // Process students data
      const studentsData = processStudentsData(jsonData);
      data.push(...studentsData);
    } else if (sheetName.includes('درجات') || sheetName.includes('الدرجات')) {
      // Process grades data
      const gradesData = processGradesData(jsonData);
      data.push(...gradesData);
    }
  });
  
  return { data };
};

/**
 * Process students data from Excel
 */
const processStudentsData = (jsonData: any[][]): any[] => {
  if (jsonData.length < 2) return [];
  
  const headers = jsonData[0];
  const dataRows = jsonData.slice(1);
  
  const headerMap: { [key: string]: string } = {
    'الرقم': 'studentId',
    'اللقب و الاسم': 'fullName',
    'تاريخ الميلاد': 'birthDate',
    'الجنس': 'gender',
    'الإعادة': 'isRepeating',
    'معدل الفصل 1': 'semester1Grade',
    'معدل الفصل 2': 'semester2Grade',
    'معدل الفصل 3': 'semester3Grade'
  };
  
  return dataRows
    .filter(row => row.length > 0 && row[0])
    .map(row => {
      const student: any = {};
      headers.forEach((header, index) => {
        const mappedKey = headerMap[header];
        if (mappedKey && row[index] !== undefined) {
          student[mappedKey] = row[index];
        }
      });
      
      // Parse full name to extract first and last name
      if (student.fullName) {
        const nameParts = student.fullName.trim().split(/\s+/);
        student.firstName = nameParts[0] || '';
        student.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Convert grades to numbers
      if (student.semester1Grade !== undefined) {
        student.semester1Grade = parseFloat(student.semester1Grade) || 0;
      }
      if (student.semester2Grade !== undefined) {
        student.semester2Grade = parseFloat(student.semester2Grade) || 0;
      }
      if (student.semester3Grade !== undefined) {
        student.semester3Grade = parseFloat(student.semester3Grade) || 0;
      }
      
      // Convert gender
      if (student.gender === 'ذكر') {
        student.gender = 'male';
      } else if (student.gender === 'أنثى') {
        student.gender = 'female';
      }
      
      // Convert repeating status
      if (student.isRepeating === 'نعم') {
        student.isRepeating = true;
      } else if (student.isRepeating === 'لا') {
        student.isRepeating = false;
      }
      
      return student;
    })
    .filter(student => student.studentId && student.firstName && student.lastName);
};

/**
 * Process grades data from Excel
 */
const processGradesData = (jsonData: any[][]): any[] => {
  if (jsonData.length < 2) return [];
  
  const headers = jsonData[0];
  const dataRows = jsonData.slice(1);
  
  const headerMap: { [key: string]: string } = {
    'رقم الطالب': 'studentId',
    'الرقم': 'studentId',
    'الفصل': 'semester',
    'المادة': 'subject',
    'الدرجة': 'score',
    'النتيجة': 'score'
  };
  
  return dataRows
    .filter(row => row.length > 0 && row[0])
    .map(row => {
      const grade: any = {};
      headers.forEach((header, index) => {
        const mappedKey = headerMap[header];
        if (mappedKey && row[index] !== undefined) {
          grade[mappedKey] = row[index];
        }
      });
      
      // Convert score to number
      if (grade.score !== undefined) {
        const score = typeof grade.score === 'string' ? parseFloat(grade.score) : grade.score;
        if (!isNaN(score)) {
          grade.score = score;
        }
      }
      
      return grade;
    })
    .filter(grade => grade.studentId && grade.subject && grade.score !== undefined);
};

/**
 * Download preformatted template
 */
export const downloadPreformattedTemplate = (config: ExcelTemplateConfig, filename: string) => {
  const workbook = createPreformattedTemplate(config);
  XLSX.writeFile(workbook, filename);
};