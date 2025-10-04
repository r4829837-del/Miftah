import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  X, 
  Trash2, 
  Target,
  Activity,
  UserPlus,
  Save,
  Upload,
  ArrowRight
} from 'lucide-react';
import { getSettings, type AppSettings } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import { useCycleStorage } from '../hooks/useCycleStorage';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import WorkingPDFGenerator from './WorkingPDFGenerator';
import MultiSelectTextarea from './MultiSelectTextarea';

// Helper: safely parse JSON (handles BOM and whitespace)
const safeParseJSON = (text: string): any | null => {
  try {
    // Remove BOM if present and trim whitespace/newlines
    const cleaned = text.replace(/^\uFEFF/, '').trim();
    if (!cleaned) return null;
    return JSON.parse(cleaned);
  } catch (_) {
    return null;
  }
};

// Générer les années scolaires (de l'année actuelle + 5 ans)
const generateAcademicYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 6; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    years.push(`${endYear}/${startYear}`);
  }
  // Add the specific year 2025/2024
  if (!years.includes('2025/2024')) {
    years.push('2025/2024');
  }
  // Sort years in ascending order (oldest to newest)
  return years.sort((a, b) => a.localeCompare(b));
};

const academicYears = generateAcademicYears();

const semesters = [
  'الفصل الأول',
  'الفصل الثاني',
  'الفصل الثالث'
];

// Predefined choices for الموضوع column (cycle-specific)
const getMawdooOptions = (cycle: string) => {
  if (cycle === 'ثانوي') {
    return [
      'تسهيل اندماج الطلاب في المحيط المدرسي الجديد',
      'تعريف الطالب بأهمية السنة الأولى ثانوي في نموه المعرفي',
      'التحضير لعملية التوجيه نحو التعليم العالي',
      'أهمية السنة الثالثة ثانوي في تحديد مسارهم الدراسي',
      'توعية الطلاب حول أهمية الدراسة والمستقبل',
      'تعريف الطلاب بالشعب والتخصصات المتاحة في التعليم العالي',
      'مساعدة الطلاب في اختيار المسار المناسب للجامعة',
      'تطوير المهارات الدراسية والتنظيمية',
      'تعزيز الثقة بالنفس والتحفيز الدراسي',
      'إرشاد الطلاب حول طرق المراجعة والتحضير للبكالوريا',
      'تعريف الطلاب بنظام التقييم والامتحانات',
      'توعية الطلاب حول أهمية المشاركة في الأنشطة المدرسية',
      'مساعدة الطلاب في حل المشاكل الدراسية',
      'تطوير مهارات التواصل والتفاعل الاجتماعي',
      'إرشاد الطلاب حول التخطيط للمستقبل المهني والجامعي'
    ];
  } else {
    return [
      'تسهيل اندماج التلاميذ في المحيط المدرسي الجديد',
      'تعريف التلميذ بأهمية السنة الثانية متوسط في نموه المعرفي',
      'التحضير لعملية التوجيه نحو ما بعد الإجبارية',
      'أهمية السنة الرابعة متوسط في تحديد مسارهم الدراسي',
      'توعية التلاميذ حول أهمية الدراسة والمستقبل',
      'تعريف التلاميذ بالشعب والتخصصات المتاحة',
      'مساعدة التلاميذ في اختيار المسار المناسب',
      'تطوير المهارات الدراسية والتنظيمية',
      'تعزيز الثقة بالنفس والتحفيز الدراسي',
      'إرشاد التلاميذ حول طرق المراجعة والتحضير للامتحانات',
      'تعريف التلاميذ بنظام التقييم والامتحانات',
      'توعية التلاميذ حول أهمية المشاركة في الأنشطة المدرسية',
      'مساعدة التلاميذ في حل المشاكل الدراسية',
      'تطوير مهارات التواصل والتفاعل الاجتماعي',
      'إرشاد التلاميذ حول التخطيط للمستقبل المهني'
    ];
  }
};

// Predefined choices for الأهداف column (cycle-specific)
const getAhdafOptions = (cycle: string) => {
  if (cycle === 'ثانوي') {
    return [
      'تحقيق كفاية الاندماج والتكيف مع الثانوي الجديد',
      'فهم أهمية السنة الأولى للسنوات القادمة',
      'فهم أهمية السنة الثالثة في عملية التوجيه',
      'تحديد تصورات الطلاب حول مشروعهم الدراسي والمهني',
      'رفع مستوى الوعي بأهمية التعليم',
      'مساعدة الطلاب في اتخاذ قرارات مدروسة',
      'تطوير قدرات الطلاب على التخطيط للمستقبل',
      'تحسين الأداء الدراسي والتحصيل العلمي',
      'بناء شخصية متوازنة ومستقلة',
      'إعداد الطلاب للامتحانات والاختبارات',
      'تطوير مهارات التفكير النقدي والإبداعي',
      'تعزيز روح العمل الجماعي والتعاون',
      'تحسين مهارات حل المشاكل',
      'تطوير الوعي بالمسؤولية الاجتماعية',
      'بناء الثقة بالنفس وتقدير الذات'
    ];
  } else {
    return [
      'تحقيق كفاية الاندماج والتكيف مع المتوسط الجديد',
      'فهم أهمية السنة الثانية للسنوات القادمة',
      'فهم أهمية السنة الثالثة في عملية التوجيه',
      'تحديد تصورات التلاميذ حول مشروعهم الدراسي والمهني',
      'رفع مستوى الوعي بأهمية التعليم',
      'مساعدة التلاميذ في اتخاذ قرارات مدروسة',
      'تطوير قدرات التلاميذ على التخطيط للمستقبل',
      'تحسين الأداء الدراسي والتحصيل العلمي',
      'بناء شخصية متوازنة ومستقلة',
      'إعداد التلاميذ للامتحانات والاختبارات',
      'تطوير مهارات التفكير النقدي والإبداعي',
      'تعزيز روح العمل الجماعي والتعاون',
      'تحسين مهارات حل المشاكل',
      'تطوير الوعي بالمسؤولية الاجتماعية',
      'بناء الثقة بالنفس وتقدير الذات'
    ];
  }
};

// Predefined choices for نسبة التغطية column
const nisbaTatwiyaOptions = [
  '%100',
  '%90',
  '%80',
  '%70',
  '%60',
  '%50',
  '%40',
  '%30',
  '%20',
  '%10',
  'مكتملة',
  'جزئية',
  'غير مكتملة',
  'قيد التنفيذ',
  'مؤجلة'
];

// Predefined choices for الملاحظة column
const malahazaOptions = [
  'مدة: ساعة واحدة',
  'مدة: ساعتان',
  'مدة: نصف ساعة',
  'خلال مجلس الاقسام و مقابلات فردية',
  'من خلال مقابلات مع بعض الأولياء المهتمين',
  'خلال مجلس الاقسام',
  'مقابلات فردية',
  'حصص جماعية',
  'حصص فردية',
  'ندوات إعلامية',
  'أيام دراسية',
  'ورشات عمل',
  'تكوين مستمر',
  'متابعة دورية',
  'تقييم مستمر'
];

// Additional predefined choices for various table columns
const generalMawdooOptions = [
  'توعية الأساتذة بأهمية دورهم في عملية التوجيه',
  'توعية الأساتذة على أهمية دورهم في التقويم',
  'تحسيس الاساتذة بدور مستشار التوجيه',
  'تدعيم العلاقة بين المؤسسة و الاسرة',
  'لهذف رفع مستوى التحصيل الدراسي',
  'تساؤلات حول طرق المراجعة و تنظيم الوقت',
  'متابعة الحالات المحالة من طرف الأساتذة',
  'طلب المساعدة بالدعم خاصة',
  'تحليل النتائج الفصلية',
  'تحليل نتائج تلاميذ جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم',
  'تنشيط مجلس قسم 4م بعرض مقارنة الماضي الدراسي',
  'تنشيط مجلس الأقسام بعرض مقارنة الماضي الدراسي',
  'تشجيع التلاميذ الإيجابي نحو التعلم',
  'إكتشاف المواد المفضلة لدى التلاميذ',
  'اهم مصادر المعلومات للتلميذ'
];
const getGeneralAhdafOptions = (cycle: string) => {
  const commonOptions = [
    'توعيتهم على أهمية دورهم في هذه المرحلة',
    'تحسيس الاساتذة بدور مستشار التوجيه',
    'لهذف رفع مستوى التحصيل الدراسي',
    'تقديم حصص فردية وجماعية',
    'التكفل والتابعة',
    'التكفل والمتابعة',
    'تنشيط مجلس الأقسام بعرض مقارنة الماضي الدراسي',
    'نسبة إهتمام الأولياء'
  ];

  if (cycle === 'ثانوي') {
    return [
      ...commonOptions,
      'تحليل نتائج الطلاب جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم',
      'تنشيط مجلس قسم 3ث بعرض مقارنة الماضي الدراسي',
      'تشجيع الطلاب الإيجابي نحو التعلم',
      'إكتشاف المواد المفضلة لدى الطلاب',
      'اهم مصادر المعلومات للطالب',
      'المهن المفضلة للطلاب',
      'توقعات التوجيه الاولية لهؤلاء الطلاب'
    ];
  } else {
    return [
      ...commonOptions,
      'تحليل نتائج التلاميذ جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم',
      'تنشيط مجلس قسم 4م بعرض مقارنة الماضي الدراسي',
      'تشجيع التلاميذ الإيجابي نحو التعلم',
      'إكتشاف المواد المفضلة لدى التلاميذ',
      'اهم مصادر المعلومات للتلميذ',
      'المهن المفضلة للتلاميذ',
      'توقعات التوجيه الاولية لهؤلاء التلاميذ'
    ];
  }
};

// Options pour la section الدراسات والبحوث والتحقيقات
const getStudiesTopicsOptions = (cycle: string) => {
  const commonTopics = [
    'دراسة حول الصعوبات التعليمية',
    'بحث في التوجهات المهنية',
    'تحقيق حول الدافعية الدراسية',
    'دراسة حول التفاعل الاجتماعي',
    'بحث في المهارات المكتسبة',
    'تحقيق حول الطموحات المستقبلية',
    'دراسة حول الصعوبات النفسية',
    'بحث في القدرات الإبداعية'
  ];

  if (cycle === 'ثانوي') {
    return [
      ...commonTopics,
      'دراسة حول اختيار التخصصات الجامعية',
      'بحث في استعدادات الطلاب للبكالوريا',
      'تحقيق حول التوجه نحو التعليم العالي',
      'دراسة حول المهن المفضلة للطلاب',
      'بحث في مصادر المعلومات للطلاب'
    ];
  } else {
    return [
      ...commonTopics,
      'دراسة حول اختيار الشعبة في الثانوي',
      'بحث في استعدادات التلاميذ للتعليم المتوسط',
      'تحقيق حول التوجه نحو التعليم الثانوي',
      'دراسة حول المهن المفضلة للتلاميذ',
      'بحث في مصادر المعلومات للتلاميذ'
    ];
  }
};

const getStudiesObjectivesOptions = (cycle: string) => {
  const commonObjectives = [
    'تحسين الأداء الدراسي',
    'تطوير المهارات الشخصية',
    'تعزيز الدافعية للتعلم',
    'تحسين التوجه المهني',
    'تطوير القدرات الإبداعية',
    'تعزيز التفاعل الاجتماعي',
    'تحسين مهارات حل المشاكل',
    'تطوير مهارات التواصل'
  ];

  if (cycle === 'ثانوي') {
    return [
      ...commonObjectives,
      'توجيه الطلاب نحو التخصصات المناسبة',
      'تحضير الطلاب للبكالوريا',
      'تطوير مهارات البحث العلمي',
      'تعزيز الاستعداد للتعليم العالي',
      'تحسين اختيار المسار المهني'
    ];
  } else {
    return [
      ...commonObjectives,
      'توجيه التلاميذ نحو الشعبة المناسبة',
      'تحضير التلاميذ للتعليم المتوسط',
      'تطوير مهارات التفكير النقدي',
      'تعزيز الاستعداد للتعليم الثانوي',
      'تحسين اختيار المسار الدراسي'
    ];
  }
};

const getStudiesDatesOptions = () => [
  'يناير 2024',
  'فبراير 2024',
  'مارس 2024',
  'أبريل 2024',
  'ماي 2024',
  'جوان 2024',
  'سبتمبر 2024',
  'أكتوبر 2024',
  'نوفمبر 2024',
  'ديسمبر 2024',
  'الفصل الأول 2023/2024',
  'الفصل الثاني 2023/2024',
  'الفصل الثالث 2023/2024',
  'طوال السنة 2023/2024',
  'مؤجل',
  'قيد التنفيذ'
];

const generalNisbaOptions = [
  '%100',
  '%90',
  '%80',
  '%70',
  '%60',
  '%50',
  '%40',
  '%30',
  '%20',
  '%10',
  'مكتملة',
  'جزئية',
  'غير مكتملة',
  'قيد التنفيذ',
  'مؤجلة',
  '-'
];

// Options pour عمود "الأهداف" في جدول "التغطية الإعلامية"
const getCoverageObjectivesOptions = (cycle: string) => {
  // Adapter le libellé selon الدورة: "الطلاب" (ثانوي) vs "التلاميذ" (متوسط)
  const commonObjectives = cycle === 'ثانوي'
    ? [
        'توعية الطلاب بأهمية المواظبة والانضباط الدراسي',
        'تعزيز الدافعية للتحصيل وتحسين الاتجاه نحو الدراسة',
        'تحسين مهارات المراجعة وتنظيم الوقت',
        'تصحيح المفاهيم المتعلقة بالتوجيه المدرسي والمهني',
        'التعريف بقواعد التقويم والانتقال والإنقاذ',
        'تنمية مهارات التواصل واحترام قواعد القسم',
        'معالجة الصعوبات الدراسية الشائعة وطرق تجاوزها',
        'عرض نتائج التقويم التشخيصي وتحديد نقاط القوة والضعف',
      ]
    : [
        'توعية التلاميذ بأهمية المواظبة والانضباط الدراسي',
        'تعزيز الدافعية للتحصيل وتحسين الاتجاه نحو الدراسة',
        'تحسين مهارات المراجعة وتنظيم الوقت',
        'تصحيح المفاهيم المتعلقة بالتوجيه المدرسي والمهني',
        'التعريف بقواعد التقويم والانتقال والإنقاذ',
        'تنمية مهارات التواصل واحترام قواعد القسم',
        'معالجة الصعوبات الدراسية الشائعة وطرق تجاوزها',
        'عرض نتائج التقويم التشخيصي وتحديد نقاط القوة والضعف',
      ];

  if (cycle === 'ثانوي') {
    return [
      ...commonObjectives,
      'التعريف بالشعب والتخصصات ومسارات ما بعد البكالوريا',
      'التحضير للاختبارات والفروض والبكالوريا تدريجيا',
      'مرافقة اختيار المسار والتخصص المناسب لكل طالب',
    ];
  }

  return [
    ...commonObjectives,
    'التعريف بالشعب المتاحة في التعليم الثانوي وشروط القبول',
    'التحضير للاختبارات الفصلية وتحسين عادات الدراسة',
    'تنمية الوعي المهني الأولي وبناء مشروع شخصي مبكر',
  ];
};
// Options pour عمود "الأهداف" في جدول "التغطية الإعلامية للأولياء"
const getParentCoverageObjectivesOptions = (cycle: string) => {
  const commonObjectives = [
    'أهمية السنة الرابعة متوسط في تحديد المسار الدراسي والمهني للتلميذ',
    'التعريف بأهمية امتحان شهادة التعليم المتوسط والتحضير لها',
    'التعريف بجدول معاملات المواد للسنة الرابعة متوسط',
    'التعريف بحساب بعض المعدلات',
    'إعطائهم منهجية وطريقة عمل تساعدهم للتحضير للشهادة',
    'التوضيح مدى تداخل مشروع التلميذ وملمحه الدراسي في الرغبة'
  ];

  if (cycle === 'ثانوي') {
    return [
      'أهمية المرحلة الثانوية في تحديد المسار الدراسي والمهني للطلاب',
      'التعريف بأهمية امتحان البكالوريا والتحضير لها',
      'التعريف بجدول معاملات المواد للمرحلة الثانوية',
      'التعريف بحساب المعدلات والترتيب',
      'إعطائهم منهجية وطريقة عمل تساعدهم للتحضير للبكالوريا',
      'التوضيح مدى تداخل مشروع الطالب وملمحه الدراسي في الرغبة',
      'التعريف بالشعب والتخصصات المتاحة في التعليم العالي',
      'مرافقة اختيار المسار والتخصص المناسب لكل طالب',
      'التعريف بآفاق التكوين المهني والتعليم العالي'
    ];
  }

  return commonObjectives;
};

const generalMalahazaOptions = [
  'خلال مجلس الاقسام و مقابلات فردية',
  'من خلال مقابلات مع بعض الأولياء المهتمين',
  'خلال مجلس الاقسام',
  'مقابلات فردية',
  'حصص جماعية',
  'حصص فردية',
  'ندوات إعلامية',
  'أيام دراسية',
  'ورشات عمل',
  'تكوين مستمر',
  'متابعة دورية',
  'تقييم مستمر',
  '/',
  'مدة: ساعة واحدة',
  'مدة: ساعتان'
];

// Predefined choices for reception table - differentiated by cycle
const getReceptionTalabatOptions = (cycle: string) => {
  const commonOptions = [
    'متابعة الحالات المحالة من طرف الأساتذة',
    'طلب المساعدة بالدعم خاصة',
    'مشاكل دراسية',
    'صعوبات في التعلم',
    'متابعة النتائج',
    'استشارة تربوية',
    'دعم نفسي'
  ];

  if (cycle === 'ثانوي') {
    return [
      ...commonOptions,
      'تساؤلات حول طرق المراجعة و تنظيم الوقت',
      'استفسارات حول التوجيه',
      'توجيه مهني',
      'معلومات عن الشعب',
      'مساعدة في الاختيار',
      'توجيه أكاديمي',
      'معلومات عن الجامعات',
      'مساعدة في التخطيط',
      'استفسارات حول البكالوريا',
      'توجيه نحو التخصصات الجامعية',
      'معلومات عن المعاهد العليا'
    ];
  } else {
    return [
      ...commonOptions,
      'تساؤلات حول طرق المراجعة و تنظيم الوقت',
      'استفسارات حول التوجيه',
      'معلومات عن الشعب',
      'مساعدة في الاختيار',
      'استفسارات حول شهادة التعليم المتوسط',
      'توجيه نحو التعليم الثانوي',
      'معلومات عن التخصصات المتاحة'
    ];
  }
};
const getReceptionTakfulOptions = (cycle: string) => {
  const commonOptions = [
    'التكفل والتابعة',
    'التكفل والمتابعة',
    'مقابلات فردية',
    'حصص إرشادية',
    'ورشات عمل',
    'ندوات توعوية',
    'متابعة دورية',
    'دعم مستمر',
    'توجيه مباشر',
    'استشارة متخصصة',
    'برامج تأهيلية',
    'تدريب مهارات',
    'تطوير قدرات',
    'دعم أكاديمي'
  ];

  if (cycle === 'ثانوي') {
    return [
      ...commonOptions,
      'تقديم حصص فردية وجماعية',
      'إعداد للبكالوريا',
      'توجيه نحو التخصصات الجامعية',
      'دعم في اختيار التخصص',
      'إرشاد أكاديمي متخصص'
    ];
  } else {
    return [
      ...commonOptions,
      'تقديم حصص فردية وجماعية',
      'إعداد لشهادة التعليم المتوسط',
      'توجيه نحو التعليم الثانوي',
      'دعم في اختيار الشعبة',
      'إرشاد تربوي متخصص'
    ];
  }
};

// Predefined choices for survey table
const getSurveyAfwajOptions = (cycle: string) => {
  const commonOptions = [
    '02 أقسام',
    '01 قسم',
    '03 أقسام',
    '04 أقسام',
    '05 أقسام',
    '06 أقسام',
    '07 أقسام',
    '08 أقسام',
    '09 أقسام',
    '10 أقسام',
    'أكثر من 10 أقسام',
    'جميع الأقسام',
    'أقسام مختارة',
    'عينة ممثلة'
  ];

  if (cycle === 'ثانوي') {
    return [
      ...commonOptions,
      'طلاب متطوعين'
    ];
  } else {
    return [
      ...commonOptions,
      'تلاميذ متطوعين'
    ];
  }
};

const surveyFatratOptions = [
  'شهر نوفمبر',
  'شهر أكتوبر',
  'شهر ديسمبر',
  'شهر يناير',
  'شهر فبراير',
  'شهر مارس',
  'شهر أبريل',
  'شهر ماي',
  'شهر جوان',
  'الفصل الأول',
  'الفصل الثاني',
  'الفصل الثالث',
  'طوال السنة',
  'فترات متقطعة',
  'حسب الحاجة'
];
const getSurveyIstintajatOptions = (cycle: string) => {
  const commonOptions = [
    'مستوى التحصيل الدراسي',
    'المهارات المكتسبة',
    'التوجهات المهنية',
    'الصعوبات التعليمية',
    'الحاجات التدريبية',
    'الطموحات المستقبلية',
    'مستوى الدافعية',
    'التفاعل الاجتماعي',
    'القدرات الإبداعية'
  ];

  if (cycle === 'ثانوي') {
    return [
      'تشجيع الطلاب الإيجابي نحو التعلم',
      'إكتشاف المواد المفضلة لدى الطلاب',
      'اهم مصادر المعلومات للطالب',
      'المهن المفضلة للطلاب',
      'نسبة إهتمام الأولياء',
      'توقعات التوجيه الاولية لهؤلاء الطلاب',
      ...commonOptions
    ];
  } else {
    return [
      'تشجيع التلاميذ الإيجابي نحو التعلم',
      'إكتشاف المواد المفضلة لدى التلاميذ',
      'اهم مصادر المعلومات للتلميذ',
      'المهن المفضلة للتلاميذ',
      'نسبة إهتمام الأولياء',
      'توقعات التوجيه الاولية لهؤلاء التلاميذ',
      ...commonOptions
    ];
  }
};

const surveyAsalibOptions = [
  'النقاش والتحليل',
  'واستنتاج المؤشرات',
  'مقابلات فردية',
  'استبيانات مكتوبة',
  'ملاحظة مباشرة',
  'اختبارات تقييمية',
  'ورشات عمل',
  'ندوات جماعية',
  'تحليل النتائج',
  'متابعة دورية',
  'تقييم مستمر',
  'دعم تربوي',
  'توجيه مباشر',
  'برامج تأهيلية',
  'تدريب مهارات'
];
// Composant pour les cellules de tableau qui s'adaptent automatiquement
const AutoResizeTextarea = ({ placeholder, className = "", defaultValue = "", ...props }: {
  placeholder: string;
  className?: string;
  defaultValue?: string;
  [key: string]: any;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Réinitialiser la hauteur
      textarea.style.height = 'auto';
      // Calculer la nouvelle hauteur basée sur le contenu
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const textarea = e.target;
    // Réinitialiser la hauteur
    textarea.style.height = 'auto';
    // Calculer la nouvelle hauteur basée sur le contenu
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full border-none outline-none bg-transparent resize-none overflow-hidden ${className}`}
      style={{ minHeight: '40px' }}
      {...props}
    />
  );
};

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  content: any;
}

const reportTypes = (currentCycle: string) => [
  {
    id: 'info',
    title: 'تقرير عملية الإعلام',
    description: currentCycle === 'ثانوي' ? 'تقرير شامل عن عملية الإعلام والتوجيه للطلاب' : 'تقرير شامل عن عملية الإعلام والتوجيه للتلاميذ',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'parent_info',
    title: 'تقرير عملية إعلام الأولياء',
    description: 'تقرير عن جلسات الإعلام والتوجيه للأولياء',
    icon: UserPlus,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'activities',
    title: 'تقرير النشاطات',
    description: 'تقرير عن النشاطات المدرسية والتربوية',
    icon: Activity,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    id: 'annual',
    title: 'التقرير السنوي',
    description: 'فتح نسخة PDF ثابتة للتقرير السنوي',
    icon: FileText,
    color: 'bg-green-100 text-green-600'
  }
];

// Algerian wilayas (Arabic)
const wilayaOptions = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
  'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
  'سكرية', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر',
  'ورقلة', 'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي',
  'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان',
  'تيميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس', 'عين صالح', 'عين قزام', 'تقرت', 'جانت', 'المغير', 'المنيعة'
];

interface CoverageRow {
  group: string;
  studentCount: number;
  date: string;
  coverage: number;
  resultsAnalysis: string;
}

interface ParentCoverageRow {
  group: string;
  parentCount: number;
  date: string;
  coverage: number;
  topics: string;
  studentCount: number;
}

// interface AnnualReportData removed (annual report deleted)

interface VocationalInstitution {
  id: string;
  name: string;
  localTraining: boolean;
  regionalTraining: boolean;
  nationalTraining: boolean;
  requiredLevel: string;
}
interface CounselorData {
  id: string;
  number: string;
  counselorName: string;
  schoolName: string;
  totalStudents: string;
  firstYearStudents: string;
  firstYearGroups: string;
  secondYearStudents: string;
  secondYearGroups: string;
  thirdYearStudents: string;
  thirdYearGroups: string;
  fourthYearStudents: string;
  fourthYearGroups: string;
}

interface CoordinationData {
  id: string;
  number: string;
  coordinationType: string;
  coordinationSubject: string;
  date: string;
  notes: string;
}

interface AwarenessProgramData {
  id: string;
  number: string;
  targetLevel: string;
  plannedActivity: string;
  completionDate: string;
  notes: string;
}

interface StudentInfoData {
  id: string;
  level: string;
  registeredStudents: string;
  followUp: string;
  interventions: string;
  objective: string;
  beneficiaryPercentage: string;
}

// Removed unused demo interfaces (TestData, MeetingData, MiddleSchoolResultsData)

interface InformationalDocumentsData {
  id: string;
  documentType: string;
  targetLevel: string;
  distributionDate: string;
  quantity: string;
  notes: string;
}

interface ParentAttendanceData {
  id: string;
  level: string;
  registeredStudents: string;
  individualMeetings: string;
  groupMeetings: string;
  total: string;
  attendancePercentage: string;
  notes: string;
}

interface NationalWeekData {
  id: string;
  activityName: string;
  targetLevel: string;
  date: string;
  participants: string;
  duration: string;
  objectives: string;
  results: string;
}

interface HighSchoolAdmissionYearData {
  id: string;
  academicYear: string;
  fourthYearCount: string;
  admittedCount: string;
  percentage: string;
  highestAverage: string;
  highestStudent: string;
  lowestAverage: string;
  lowestStudent: string;
}

interface PsychologicalActivitiesData {
  id: string;
  activityType: string;
  targetGroup: string;
  date: string;
  duration: string;
  objectives: string;
  results: string;
  notes: string;
}

interface AdmittedRow {
  id: string;
  schoolName: string;
  examTotal: string;
  examFemales: string;
  successTotal: string;
  successPercentage: string;
  successFemales: string;
  successFemalesPercentage: string;
  grade10to11Count: string;
  grade10to11Percentage: string;
  grade12to13Count: string;
  grade12to13Percentage: string;
  grade14to15Count: string;
  grade14to15Percentage: string;
  grade16PlusCount: string;
  grade16PlusPercentage: string;
}

interface StudentResultsRow {
  id: string;
  schoolName: string;
  examTotal: string;
  examFemales: string;
  successTotal: string;
  successPercentage: string;
  successFemales: string;
  successFemalesPercentage: string;
  grade10to11Count: string;
  grade10to11Percentage: string;
  grade12to13Count: string;
  grade12to13Percentage: string;
  grade14to15Count: string;
  grade14to15Percentage: string;
  grade16PlusCount: string;
  grade16PlusPercentage: string;
}

// Removed unused interface: GenderOrientationYear4Row
interface ExamPsychSupportRow {
  id: string;
  number: string;
  caseType: string;
  count: string;
  stream: string;
  subject: string;
  care: string;
  notes: string;
}
interface OrientationSummaryRow {
  id: string;
  label: string; // المسلك أو النهاية
  commonArts: string;
  sciencesTech: string;
  total: string;
}
export default function Reports() {
  const navigate = useNavigate();
  const { currentCycle, getCycleTitle, getCycleLevels, getCycleConfig } = useCycle();
  const { getStorage, setStorage } = useCycleStorage();
  // Build default groups dynamically per cycle:
  // - متوسط: 4 levels (1-4)
  // - ثانوي: 3 levels (1-3)
  const defaultGroups = React.useMemo(() => {
    const levels = currentCycle === 'ثانوي' ? [1, 2, 3] : [1, 2, 3, 4];
    const groups: string[] = [];
    for (const level of levels) {
      for (let num = 1; num <= 4; num++) {
        groups.push(`${level}/${num}`);
      }
    }
    return groups;
  }, [currentCycle]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [manualSchoolName, setManualSchoolName] = useState('');
  const [manualCounselorName, setManualCounselorName] = useState('');
  const [studentInfoLevels, setStudentInfoLevels] = useState({
    level1: currentCycle === 'متوسط' ? 'الأولى متوسط' : 'الأولى ثانوي',
    level2: currentCycle === 'متوسط' ? 'الثانية متوسط' : 'الثانية ثانوي', 
    level3: currentCycle === 'متوسط' ? 'الثالثة متوسط' : 'الثالثة ثانوي',
    level4: currentCycle === 'متوسط' ? 'الرابعة متوسط' : ''
  });
  const [teacherInfoLevels, setTeacherInfoLevels] = useState({
    level1: '4م',
    level2: '1 و 2 و 3م'
  });
  const [resultsAnalysisLevels, setResultsAnalysisLevels] = useState({
    level1: '1 و 2 و 3 و 4'
  });
  const [councilParticipationLevels, setCouncilParticipationLevels] = useState({
    level1: 'الرابعة متوسط',
    level2: '1و2و3م'
  });
  const [mawdooOptions, setMawdooOptions] = useState(getMawdooOptions(currentCycle));
  // Fallback no-op states to avoid references after removing annual report
  const [showAnnualPreview, setShowAnnualPreview] = useState(false); // kept for compatibility, modal disabled
  const [annualReportData, setAnnualReportData] = useState<any>({ wilaya: '', center: '', school: '', counselor: '', academicYear: '' });


  // Mettre à jour les niveaux quand le cycle change
  useEffect(() => {
    const isSecondary = currentCycle === 'ثانوي';
    
    setStudentInfoLevels({
      level1: isSecondary ? 'الأولى ثانوي' : 'الأولى متوسط',
      level2: isSecondary ? 'الثانية ثانوي' : 'الثانية متوسط', 
      level3: isSecondary ? 'الثالثة ثانوي' : 'الثالثة متوسط',
      level4: isSecondary ? '' : 'الرابعة متوسط'
    });
    
    setTeacherInfoLevels({
      level1: isSecondary ? '3ث' : '4م',
      level2: isSecondary ? '1 و 2 ثانوي' : '1 و 2 و 3م'
    });
    
    setResultsAnalysisLevels({
      level1: isSecondary ? '1 و 2 و 3 ثانوي' : '1 و 2 و 3 و 4م'
    });
    
    setCouncilParticipationLevels({
      level1: isSecondary ? 'الثالثة ثانوي' : 'الرابعة متوسط',
      level2: isSecondary ? '1 و 2 ثانوي' : '1و2و3م'
    });
    
    // Mettre à jour les options de matières
    setMawdooOptions(getMawdooOptions(currentCycle));
  }, [currentCycle]);

  // Charger les paramètres au début
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        // Fournir des paramètres par défaut en cas d'erreur
        setSettings({
          schoolName: 'اسم المدرسة',
          counselorName: 'اسم المستشار',
          highSchoolName: 'الثانوية',
          highSchoolAddress: '',
          groups: [],
          levels: [],
          semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
          timezone: 'Africa/Algiers',
          enabledSections: {
            general: true,
            notifications: true,
            security: true,
            profile: true,
            school: true,
            highschool: true,
            levels: true,
            groups: true,
            semesters: true
          }
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    loadSettings();
  }, [currentCycle]); // Recharger quand le cycle change

  // Initialiser les données du rapport avec les paramètres configurés
  useEffect(() => {
    if (settings && !isLoadingSettings) {
      setReportData(prev => ({
        ...prev,
        school: prev.school || settings.schoolName || '',
        counselor: prev.counselor || settings.counselorName || ''
      }));
    }
  }, [settings, isLoadingSettings]);

  // Écouter les changements de paramètres
  useEffect(() => {
    const handleStorageChange = () => {
      const loadSettings = async () => {
        try {
          const loadedSettings = await getSettings();
          setSettings(loadedSettings);
        } catch (error) {
          console.error('Erreur lors du rechargement des paramètres:', error);
        // Fournir des paramètres par défaut en cas d'erreur
        setSettings({
          schoolName: 'اسم المدرسة',
          counselorName: 'اسم المستشار',
          highSchoolName: 'الثانوية',
          highSchoolAddress: '',
          groups: [],
          levels: [],
          semesters: ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
          timezone: 'Africa/Algiers',
          enabledSections: {
            general: true,
            notifications: true,
            security: true,
            profile: true,
            school: true,
            highschool: true,
            levels: true,
            groups: true,
            semesters: true
          }
        });
        }
      };
      loadSettings();
    };

    // Écouter les changements dans localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les changements dans la même fenêtre (pour les mises à jour locales)
    const interval = setInterval(() => {
      const currentSettings = getStorage('appSettings');
      if (currentSettings) {
        try {
          setSettings(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(currentSettings)) {
              return currentSettings;
            }
            return prev;
          });
        } catch (error) {
          console.error('Erreur lors du parsing des paramètres:', error);
        }
      }
    }, 1000); // Vérifier toutes les secondes

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  // CSS pour masquer les éléments d'édition dans le PDF
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [showPreview, setShowPreview] = useState(false);
  const [showParentPreview, setShowParentPreview] = useState(false);
  // Removed: annual preview state
  const [showObjectivesPreview, setShowObjectivesPreview] = useState(false);
  const [showActivitiesPreview, setShowActivitiesPreview] = useState(false);
  // Removed unused states (modal & selection) to satisfy linter
  const [reports, setReports] = useState<Report[]>([]);
  // وحدة الاختيار بين الأفواج والأقسام
  const [reportUnitMode, setReportUnitMode] = useState<'groups' | 'classes'>('groups');
  const [parentUnitMode, setParentUnitMode] = useState<'groups' | 'classes'>('groups');
  // Removed unused variables: classSections, objectivesTemplates

  // États pour la section "تقديم مقاطعات تدخل المستشار"
  const [interventionData, setInterventionData] = useState<{
    متوسط: { [key: string]: { male: number; female: number; total: number } };
    ثانوي: { [key: string]: { male: number; female: number; total: number } };
    totals: {
      متوسط: { male: number; female: number; total: number };
      ثانوي: { male: number; female: number; total: number };
    };
  }>({
    // Données pour le cycle moyen - tous à zéro
    متوسط: {
      'الأولى متوسط': { male: 0, female: 0, total: 0 },
      'الثانية متوسط': { male: 0, female: 0, total: 0 },
      'الثالثة متوسط': { male: 0, female: 0, total: 0 },
      'الرابعة متوسط': { male: 0, female: 0, total: 0 }
    },
    // Données pour le cycle secondaire - tous à zéro
    ثانوي: {
      'الأولى ثانوي': { male: 0, female: 0, total: 0 },
      'الثانية ثانوي': { male: 0, female: 0, total: 0 },
      'الثالثة ثانوي': { male: 0, female: 0, total: 0 }
    },
    totals: {
      متوسط: { male: 0, female: 0, total: 0 },
      ثانوي: { male: 0, female: 0, total: 0 }
    }
  });

  // Removed unused helpers getLevelsForCycle, getTitleForCycle

  // Fonction pour réinitialiser les compteurs (global ou par cycle)
  const resetInterventionData = (cycleName?: 'متوسط' | 'ثانوي') => {
    setInterventionData(prev => {
      // Réinitialiser tout
      if (!cycleName) {
        const copyAll = { ...prev } as typeof prev;
        (['متوسط', 'ثانوي'] as const).forEach(cn => {
          Object.keys(copyAll[cn]).forEach(levelKey => {
            copyAll[cn][levelKey] = { male: 0, female: 0, total: 0 };
          });
          copyAll.totals[cn] = { male: 0, female: 0, total: 0 };
        });
        return copyAll;
      }
      // Réinitialiser uniquement le cycle demandé avec les clés réellement présentes
      const copy = { ...prev } as typeof prev;
      Object.keys(copy[cycleName]).forEach(levelKey => {
        copy[cycleName][levelKey] = { male: 0, female: 0, total: 0 };
      });
      copy.totals[cycleName] = { male: 0, female: 0, total: 0 };
      return copy;
    });
  };

  // Fonction pour mettre à jour les données d'intervention (indépendante par cycle)
  const updateInterventionData = (cycleName: 'متوسط' | 'ثانوي', level: string, field: 'male' | 'female', value: number) => {
    console.log('Updating intervention data:', level, field, value);
    setInterventionData(prev => {
      const newData = { ...prev };
      
      // Mettre à jour le niveau du cycle ciblé
      newData[cycleName][level] = {
        ...newData[cycleName][level],
        [field]: value
      };
      
      // Recalculer le total pour ce niveau
      newData[cycleName][level].total = newData[cycleName][level].male + newData[cycleName][level].female;
      
      // Recalculer le total du cycle ciblé uniquement
      let totalMale = 0;
      let totalFemale = 0;
      Object.values(newData[cycleName]).forEach(levelData => {
        totalMale += levelData.male;
        totalFemale += levelData.female;
      });
      newData.totals[cycleName].male = totalMale;
      newData.totals[cycleName].female = totalFemale;
      newData.totals[cycleName].total = totalMale + totalFemale;
      
      console.log('New data after calculation:', newData);
      return newData;
    });
  };

  useEffect(() => {
    try {
      const raw = getStorage('reports');
      if (raw) setReports(raw);
    } catch (_) { /* ignore */ }
  }, []);

  // Mettre à jour les niveaux quand le cycle change
  useEffect(() => {
    setStudentInfoLevels({
      level1: currentCycle === 'متوسط' ? 'الأولى متوسط' : 'الأولى ثانوي',
      level2: currentCycle === 'متوسط' ? 'الثانية متوسط' : 'الثانية ثانوي', 
      level3: currentCycle === 'متوسط' ? 'الثالثة متوسط' : 'الثالثة ثانوي',
      level4: currentCycle === 'متوسط' ? 'الرابعة متوسط' : ''
    });
  }, [currentCycle]);

  // Mettre à jour les données de rapport quand le cycle change
  useEffect(() => {
    const defaultLevel = currentCycle === 'متوسط' ? 'الأولى متوسط' : 'الأولى ثانوي';
    setReportData(prev => ({
      ...prev,
      level: defaultLevel
    }));
    setParentReportData(prev => ({
      ...prev,
      level: defaultLevel
    }));
  }, [currentCycle]);

  // Charger les données d'intervention depuis localStorage
  useEffect(() => {
    try {
      const savedData = getStorage('interventionData');
      if (savedData) {
        setInterventionData(savedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'intervention:', error);
    }
  }, []);

  // Sauvegarder les données d'intervention dans localStorage
  useEffect(() => {
    setStorage('interventionData', interventionData);
  }, [interventionData]);

  // Recalculer les totaux au chargement initial (pour chaque cycle)
  useEffect(() => {
    setInterventionData(prev => {
      const newData = { ...prev };
      (['متوسط', 'ثانوي'] as const).forEach(cycleName => {
        // Recalculer le total pour chaque niveau du cycle
        Object.keys(newData[cycleName]).forEach(level => {
          newData[cycleName][level].total = newData[cycleName][level].male + newData[cycleName][level].female;
        });
        // Recalculer les totaux du cycle
        let totalMale = 0;
        let totalFemale = 0;
        Object.values(newData[cycleName]).forEach(levelData => {
          totalMale += levelData.male;
          totalFemale += levelData.female;
        });
        newData.totals[cycleName].male = totalMale;
        newData.totals[cycleName].female = totalFemale;
        newData.totals[cycleName].total = totalMale + totalFemale;
      });
      return newData;
    });
  }, []);
  const [reportData, setReportData] = useState({
    school: '',
    counselor: '',
    academicYear: academicYears[0],
    level: currentCycle === 'متوسط' ? 'الأولى متوسط' : 'الأولى ثانوي',
    semester: 'الفصل الأول',
    groupCount: 4,
    totalStudents: 0,
    subject: '',
    coverageRows: [] as CoverageRow[],
    observations: '',
    conclusions: '',
    wilaya: ''
  });

  const [parentReportData, setParentReportData] = useState({
    school: '',
    counselor: '',
    academicYear: academicYears[0],
    level: currentCycle === 'متوسط' ? 'الأولى متوسط' : 'الأولى ثانوي',
    semester: 'الفصل الأول',
    groupCount: 4,
    totalParents: 0,
    subject: '',
    coverageRows: [] as ParentCoverageRow[],
    observations: '',
    conclusions: '',
    wilaya: ''
  });

  // Removed: annual report data state

  // État pour les institutions de formation professionnelle
  const [vocationalInstitutions, setVocationalInstitutions] = useState<VocationalInstitution[]>([]);
  // États pour la deuxième page remplissable
  const [secondPageData, setSecondPageData] = useState({
    schoolAddress: currentCycle === 'ثانوي' ? 'ثانوية حسن بن خير الدين تجديت مستغانم' : 'متوسطة حسن بن خير الدين تجديت مستغانم',
    phoneNumber: '045397175',
    faxNumber: '045397175',
    email: 'cem.hbenkhiredine@gmail.com',
    counselorName: 'بوسحبة محمد الامين',
    schoolName: 'حسن بن خير الدين',
    totalStudents: '264',
    firstYearStudents: '87',
    firstYearGroups: '03',
    secondYearStudents: '70',
    secondYearGroups: '03',
    thirdYearStudents: '54',
    thirdYearGroups: '02',
    fourthYearStudents: '53',
    fourthYearGroups: '02',
    // Données pour le tableau des résultats
    examTotal: '53',
    examFemales: '26',
    admittedTotal: '34',
    admittedPercentage: '64.15',
    admittedFemales: '16',
    admittedFemalesPercentage: '47.05',
    // Données pour le tableau des réussites
    successTotal: '25',
    successPercentage: '47.17',
    successFemales: '11',
    successFemalesPercentage: '20.75',
    // Nouveaux champs pour le tableau des résultats détaillés
    grade10to11Count: '17',
    grade10to11Percentage: '32.07',
    grade12to13Count: '08',
    grade12to13Percentage: '15.09',
    grade14to15Count: '00',
    grade14to15Percentage: '00.00',
    grade16PlusCount: '00',
    grade16PlusPercentage: '00.00'
  });

  // État pour les conseillers
  const [counselors, setCounselors] = useState<CounselorData[]>([
    {
      id: '1',
      number: '01',
      counselorName: 'بوسحبة محمد الامين',
      schoolName: 'حسن بن خير الدين',
      totalStudents: '264',
      firstYearStudents: '87',
      firstYearGroups: '03',
      secondYearStudents: '70',
      secondYearGroups: '03',
      thirdYearStudents: '54',
      thirdYearGroups: '02',
      fourthYearStudents: '53',
      fourthYearGroups: '02'
    }
  ]);
  // État pour la coordination avec les départements
  const [coordinationData, setCoordinationData] = useState<CoordinationData[]>([
    {
      id: '1',
      number: '01',
      coordinationType: '',
      coordinationSubject: '',
      date: '',
      notes: ''
    }
  ]);

  // État pour le programme d'information
  const [awarenessProgramData, setAwarenessProgramData] = useState<AwarenessProgramData[]>([
    {
      id: '1',
      number: '01',
      targetLevel: '',
      plannedActivity: '',
      completionDate: '',
      notes: ''
    }
  ]);

  // État pour l'information des élèves
  const [studentInfoData, setStudentInfoData] = useState<StudentInfoData[]>([
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      followUp: 'المتابعة و المرافقة للتلاميذ',
      interventions: '',
      objective: '',
      beneficiaryPercentage: ''
    }
  ]);

  // États pour les tests (commentés car non utilisés actuellement)
  // const [testData, setTestData] = useState<TestData[]>([]);
  // const [meetingData, setMeetingData] = useState<MeetingData[]>([]);
  // const [middleSchoolResultsData, setMiddleSchoolResultsData] = useState<MiddleSchoolResultsData[]>([]);
  // États pour l'admission en première année secondaire
  const [highSchoolAdmissionYearData, setHighSchoolAdmissionYearData] = useState<HighSchoolAdmissionYearData[]>([
    {
      id: '1',
      academicYear: '2023-2022',
      fourthYearCount: '49',
      admittedCount: '30',
      percentage: '61.22',
      highestAverage: '17.47',
      highestStudent: 'بودرباس سنابيس',
      lowestAverage: '9.51',
      lowestStudent: 'حمادي نغم'
    },
    {
      id: '2',
      academicYear: '2024-2023',
      fourthYearCount: '53',
      admittedCount: '34',
      percentage: '64.15',
      highestAverage: '13.92',
      highestStudent: 'زواق عبد النور',
      lowestAverage: '10.01',
      lowestStudent: 'بعضير صادق'
    }
  ]);
  // États pour les documents d'information
  const [informationalDocumentsData, setInformationalDocumentsData] = useState<InformationalDocumentsData[]>([
    {
      id: '1',
      documentType: '',
      targetLevel: '',
      distributionDate: '',
      quantity: '',
      notes: ''
    }
  ]);

  // État pour la présence des parents
  const [parentAttendanceData, setParentAttendanceData] = useState<ParentAttendanceData[]>([
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      individualMeetings: '',
      groupMeetings: '',
      total: '',
      attendancePercentage: '',
      notes: ''
    }
  ]);
  // État pour la semaine nationale d'information
  const [nationalWeekData, setNationalWeekData] = useState<NationalWeekData[]>([
    {
      id: '1',
      activityName: '',
      targetLevel: '',
      date: '',
      participants: '',
      duration: '',
      objectives: '',
      results: ''
    }
  ]);

  // État pour les activités psychologiques
  const [psychologicalActivitiesData, setPsychologicalActivitiesData] = useState<PsychologicalActivitiesData[]>([
    {
      id: '1',
      activityType: '',
      targetGroup: '',
      date: '',
      duration: '',
      objectives: '',
      results: '',
      notes: ''
    }
  ]);
  useEffect(() => {
    loadSettings();
    // Charger les institutions de formation professionnelle
    const savedInstitutions = loadVocationalInstitutions();
    if (savedInstitutions.length > 0) {
      setVocationalInstitutions(savedInstitutions);
    } else {
      // Données par défaut si aucune donnée sauvegardée
      const defaultInstitutions: VocationalInstitution[] = [
        {
          id: '1',
          name: 'مركز التكوين المهني و التمهين عطاوي بن شاعة مستغانم',
          localTraining: true,
          regionalTraining: false,
          nationalTraining: false,
          requiredLevel: 'الرابعة متوسط'
        },
        {
          id: '2',
          name: 'مركز التكوين المهني و التمهين كريشين بن دهيبة مستغانم',
          localTraining: true,
          regionalTraining: false,
          nationalTraining: false,
          requiredLevel: 'نهاية الطور الابتدائي + الرابعة متوسط'
        }
      ];
      setVocationalInstitutions(defaultInstitutions);
      saveVocationalInstitutions(defaultInstitutions);
    }
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
    const cycleConfig = getCycleConfig(currentCycle);
    setReportData(prev => ({
      ...prev,
      school: cycleConfig.schoolName,
      counselor: loadedSettings.counselorName
    }));
    setParentReportData(prev => ({
      ...prev,
      school: cycleConfig.schoolName,
      counselor: loadedSettings.counselorName
    }));
    // removed: annual report state update
  };

  useEffect(() => {
    const newRows: CoverageRow[] = [];
    for (let i = 0; i < reportData.groupCount; i++) {
      const existingRow = reportData.coverageRows[i];
      newRows.push(existingRow || {
        group: defaultGroups[i] || '',
        studentCount: 0,
        date: '',
        coverage: 0,
        resultsAnalysis: ''
      });
    }
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows,
      totalStudents: newRows.reduce((sum, row) => sum + (row.studentCount || 0), 0)
    }));
  }, [reportData.groupCount]);

  useEffect(() => {
    const newRows: ParentCoverageRow[] = [];
    for (let i = 0; i < parentReportData.groupCount; i++) {
      const existingRow = parentReportData.coverageRows[i];
      newRows.push(existingRow || {
        group: defaultGroups[i] || '',
        parentCount: 0,
        date: '',
        coverage: 0,
        topics: ''
      });
    }
    setParentReportData(prev => ({
      ...prev,
      coverageRows: newRows,
      totalParents: newRows.reduce((sum, row) => sum + (row.parentCount || 0), 0)
    }));
  }, [parentReportData.groupCount]);

  // Fonction pour formater la date au format AAAA-MM-DD
  const formatDateToISO = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  };

  // Fonction pour gérer la saisie de date avec masque
  const handleDateChange = (index: number, value: string) => {
    // Si c'est une date valide, on la formate
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      handleCoverageRowChange(index, 'date', value);
    } else if (value) {
      // Sinon on stocke la valeur telle quelle
      handleCoverageRowChange(index, 'date', value);
    } else {
      handleCoverageRowChange(index, 'date', '');
    }
  };

  // Fonction pour remplir automatiquement avec la date du jour
  const fillWithTodayDate = (index: number) => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0]; // Format AAAA-MM-DD
    handleCoverageRowChange(index, 'date', todayISO);
  };

  // Fonction pour gérer la saisie de date avec masque pour les parents
  const handleParentDateChange = (index: number, value: string) => {
    // Si c'est une date valide, on la formate
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      handleParentCoverageRowChange(index, 'date', value);
    } else if (value) {
      // Sinon on stocke la valeur telle quelle
      handleParentCoverageRowChange(index, 'date', value);
    } else {
      handleParentCoverageRowChange(index, 'date', '');
    }
  };

  // Fonction pour remplir automatiquement avec la date du jour pour les parents
  const fillWithTodayParentDate = (index: number) => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0]; // Format AAAA-MM-DD
    handleParentCoverageRowChange(index, 'date', todayISO);
  };
  const handleCoverageRowChange = (index: number, field: keyof CoverageRow, value: any) => {
    const newRows = [...reportData.coverageRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));

    if (field === 'studentCount') {
      const total = newRows.reduce((sum, row) => sum + (row.studentCount || 0), 0);
      setReportData(prev => ({
        ...prev,
        totalStudents: total
      }));
    }
  };

  const handleParentCoverageRowChange = (index: number, field: keyof ParentCoverageRow, value: any) => {
    const newRows = [...parentReportData.coverageRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setParentReportData(prev => ({
      ...prev,
      coverageRows: newRows
    }));

    if (field === 'parentCount') {
      const total = newRows.reduce((sum, row) => sum + (row.parentCount || 0), 0);
      setParentReportData(prev => ({
        ...prev,
        totalParents: total
      }));
    }
  };

  // إضافة/حذف أسطر التغطية الإعلامية (التلاميذ)
  const addCoverageRow = () => {
    const nextIndex = reportData.coverageRows.length;
    const newRow: CoverageRow = {
      group: defaultGroups[nextIndex] || '',
      studentCount: 0,
      date: '',
      coverage: 0,
      resultsAnalysis: ''
    };
    const newRows = [...reportData.coverageRows, newRow];
    const newTotal = newRows.reduce((sum, r) => sum + (r.studentCount || 0), 0);
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows,
      groupCount: newRows.length,
      totalStudents: newTotal
    }));
  };
  const removeCoverageRow = (index: number) => {
    const newRows = reportData.coverageRows.filter((_, i) => i !== index);
    const newTotal = newRows.reduce((sum, r) => sum + (r.studentCount || 0), 0);
    setReportData(prev => ({
      ...prev,
      coverageRows: newRows,
      groupCount: Math.max(0, newRows.length),
      totalStudents: newTotal
    }));
  };

  // إضافة/حذف أسطر التغطية الإعلامية للأولياء
  const addParentCoverageRow = () => {
    const nextIndex = parentReportData.coverageRows.length;
    const newRow: ParentCoverageRow = {
      group: defaultGroups[nextIndex] || '',
      parentCount: 0,
      date: '',
      coverage: 0,
      topics: '',
      studentCount: 0
    };
    const newRows = [...parentReportData.coverageRows, newRow];
    const newTotal = newRows.reduce((sum, r) => sum + (r.parentCount || 0), 0);
    setParentReportData(prev => ({
      ...prev,
      coverageRows: newRows,
      groupCount: newRows.length,
      totalParents: newTotal
    }));
  };

  const removeParentCoverageRow = (index: number) => {
    const newRows = parentReportData.coverageRows.filter((_, i) => i !== index);
    const newTotal = newRows.reduce((sum, r) => sum + (r.parentCount || 0), 0);
    setParentReportData(prev => ({
      ...prev,
      coverageRows: newRows,
      groupCount: Math.max(0, newRows.length),
      totalParents: newTotal
    }));
  };

  const handleSecondPageDataChange = (field: string, value: string) => {
    setSecondPageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonctions pour gérer les institutions de formation professionnelle
  const saveVocationalInstitutions = (institutions: VocationalInstitution[]) => {
    setStorage('vocationalInstitutions', institutions);
  };
  const loadVocationalInstitutions = (): VocationalInstitution[] => {
    const saved = getStorage('vocationalInstitutions');
    if (saved) {
      try {
        return saved;
      } catch {
        return [];
      }
    }
    return [];
  };
  // Données d'exemple pour le remplissage automatique
  const getDefaultVocationalInstitutions = (): VocationalInstitution[] => [
    {
      id: '1',
      name: 'مركز التكوين المهني و التمهين عطاوي بن شاعة مستغانم',
      localTraining: true,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: 'الرابعة متوسط'
    },
    {
      id: '2',
      name: 'مركز التكوين المهني و التمهين كريشين بن دهيبة مستغانم',
      localTraining: true,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: 'نهاية الطور الابتدائي + الرابعة متوسط'
    },
    {
      id: '3',
      name: 'مركز التكوين المهني و التمهين سيدي علي مستغانم',
      localTraining: true,
      regionalTraining: true,
      nationalTraining: false,
      requiredLevel: 'الثالثة متوسط'
    },
    {
      id: '4',
      name: 'مركز التكوين المهني و التمهين عين تادلس مستغانم',
      localTraining: true,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: 'الرابعة متوسط'
    },
    {
      id: '5',
      name: 'مركز التكوين المهني و التمهين بوقيراط مستغانم',
      localTraining: true,
      regionalTraining: true,
      nationalTraining: true,
      requiredLevel: 'نهاية الطور الابتدائي'
    }
  ];

  const fillTableAutomatically = () => {
    const defaultInstitutions = getDefaultVocationalInstitutions();
    setVocationalInstitutions(defaultInstitutions);
    saveVocationalInstitutions(defaultInstitutions);
  };

  const clearTable = () => {
    setVocationalInstitutions([]);
    saveVocationalInstitutions([]);
  };
  const generateRandomInstitutions = () => {
    const wilayas = ['مستغانم', 'وهران', 'الجزائر', 'قسنطينة', 'عنابة'];
    const types = ['مركز التكوين المهني و التمهين', 'معهد التكوين المهني', 'مركز التكوين المهني'];
    const locations = ['عطاوي بن شاعة', 'كريشين بن دهيبة', 'سيدي علي', 'عين تادلس', 'بوقيراط', 'حاسي ماماش', 'سيدي لخضر', 'مازونة'];
    const levels = ['الرابعة متوسط', 'الثالثة متوسط', 'نهاية الطور الابتدائي', 'نهاية الطور الابتدائي + الرابعة متوسط'];
    
    const randomInstitutions: VocationalInstitution[] = [];
    
    for (let i = 0; i < 8; i++) {
      const wilaya = wilayas[Math.floor(Math.random() * wilayas.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
    const levelPick = levels[Math.floor(Math.random() * levels.length)];
      
      randomInstitutions.push({
        id: Date.now().toString() + i,
        name: `${type} ${location} ${wilaya}`,
        localTraining: Math.random() > 0.3,
        regionalTraining: Math.random() > 0.6,
        nationalTraining: Math.random() > 0.8,
        requiredLevel: levelPick
      });
    }
    
    setVocationalInstitutions(randomInstitutions);
    saveVocationalInstitutions(randomInstitutions);
  };
  const exportInstitutions = () => {
    const dataStr = JSON.stringify(vocationalInstitutions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vocational_institutions.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  const importInstitutions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) ?? '';
        const importedInstitutions = safeParseJSON(content);
        if (Array.isArray(importedInstitutions)) {
          setVocationalInstitutions(importedInstitutions);
          saveVocationalInstitutions(importedInstitutions);
        } else {
          alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
        }
      };
      reader.readAsText(file);
    }
  };

  const addVocationalInstitution = () => {
    const newInstitution: VocationalInstitution = {
      id: Date.now().toString(),
      name: '',
      localTraining: false,
      regionalTraining: false,
      nationalTraining: false,
      requiredLevel: ''
    };
    const updatedInstitutions = [...vocationalInstitutions, newInstitution];
    setVocationalInstitutions(updatedInstitutions);
    saveVocationalInstitutions(updatedInstitutions);
  };

  const removeVocationalInstitution = (id: string) => {
    const updatedInstitutions = vocationalInstitutions.filter(inst => inst.id !== id);
    setVocationalInstitutions(updatedInstitutions);
    saveVocationalInstitutions(updatedInstitutions);
  };
  const updateVocationalInstitution = (id: string, field: keyof VocationalInstitution, value: any) => {
    const updatedInstitutions = vocationalInstitutions.map(inst => 
      inst.id === id ? { ...inst, [field]: value } : inst
    );
    setVocationalInstitutions(updatedInstitutions);
    saveVocationalInstitutions(updatedInstitutions);
  };
  const handleGeneratePDF = async (type: 'student' | 'parent' | 'annual' | 'activities' | 'objectives') => {
    const contentId =
      type === 'student'
        ? 'report-preview'
        : type === 'parent'
        ? 'parent-report-preview'
      : type === 'activities'
        ? 'activities-report-preview'
      : type === 'annual'
        ? 'annual-report-preview'
        : 'objectives-report-preview';
    const content = document.getElementById(contentId);
    if (!content) return;

    try {
      // For all types, render the visible preview (including objectives) to PDF via html2canvas
      // Ensure web fonts are fully loaded before rendering to canvas
      try {
        const fonts = (document as any).fonts;
        if (fonts?.ready) {
          await fonts.ready;
        }
      } catch (_) {}

      const margin = 10; // 10mm margin on all sides for proper A4 formatting
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const options = {
          scale: 2,
          useCORS: true,
          logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        onclone: (clonedDoc: Document) => {
          const clonedRoot = clonedDoc.getElementById(contentId);
          if (!clonedRoot) return;
          
          // Masquer tous les éléments avec la classe no-print
          clonedRoot.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
          
          clonedRoot.querySelectorAll('input').forEach((el) => {
            const input = el as HTMLInputElement;
            const span = clonedDoc.createElement('span');
            const isInTableCell = !!input.closest('td, th');
            span.textContent = input.value || input.placeholder || '';
            span.style.fontSize = getComputedStyle(input).fontSize;
            if (isInTableCell) {
              span.style.display = 'block';
              span.style.textAlign = 'center';
              span.style.width = '100%';
              span.style.padding = '0.25rem';
            } else {
              span.style.display = 'inline-block';
              span.style.textAlign = 'right';
              span.style.padding = '0 4px';
            }
            el.parentNode?.replaceChild(span, el);
          });
          clonedRoot.querySelectorAll('select').forEach((el) => {
            const select = el as HTMLSelectElement;
            const span = clonedDoc.createElement('span');
            const isInTableCell = !!select.closest('td, th');
            span.textContent = select.selectedOptions[0]?.text || select.value || '';
            span.style.fontSize = getComputedStyle(select).fontSize;
            if (isInTableCell) {
              span.style.display = 'block';
              span.style.textAlign = 'center';
              span.style.width = '100%';
              span.style.padding = '0.25rem';
            } else {
              span.style.display = 'inline-block';
              span.style.textAlign = 'right';
              span.style.padding = '0 4px';
            }
            el.parentNode?.replaceChild(span, el);
          });
          clonedRoot.querySelectorAll('textarea').forEach((el) => {
            const textarea = el as HTMLTextAreaElement;
            const div = clonedDoc.createElement('span');
            const isInTableCell = !!textarea.closest('td, th');
            div.textContent = textarea.value || '';
            div.style.fontSize = getComputedStyle(textarea).fontSize;
            if (isInTableCell) {
              div.style.whiteSpace = 'pre-wrap';
              div.style.display = 'block';
              div.style.textAlign = 'center';
              div.style.width = '100%';
              div.style.padding = '0.25rem';
            } else {
              div.style.whiteSpace = 'pre-wrap';
              div.style.display = 'inline-block';
              div.style.textAlign = 'right';
              div.style.padding = '0 4px';
            }
            el.parentNode?.replaceChild(div, el);
          });
          clonedRoot.querySelectorAll('table').forEach((tbl) => {
            (tbl as HTMLElement).style.tableLayout = 'fixed';
            (tbl as HTMLElement).style.borderCollapse = 'collapse';
          });
          // Normalize report page size in the cloned DOM to avoid extra padding/border shrinking in PDF
          clonedRoot.querySelectorAll('.report-page').forEach((el) => {
            const page = el as HTMLElement;
            page.style.padding = '0mm';
            // Conserver la bordure existante dans le PDF
            page.style.width = '210mm';
            page.style.minHeight = '297mm';
            page.style.boxSizing = 'border-box';
          });

          // Force correct static label for school to avoid being replaced by value in PDF
          const schoolLabel = clonedRoot.querySelector('.report-school-label') as HTMLElement | null;
          if (schoolLabel) {
            schoolLabel.textContent = (currentCycle === 'ثانوي') ? 'ثانوية :' : 'متوسطة :';
          }
          
          // Ajouter une petite séparation entre les titres colorés et leurs traits
          clonedRoot.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
            const title = el as HTMLElement;
            const currentPaddingBottom = parseInt(getComputedStyle(title).paddingBottom) || 0;
            title.style.paddingBottom = `${currentPaddingBottom + 3}px`;
          });
          
          // Ajouter un espacement spécifique pour tous les titres en couleur rouge
          clonedRoot.querySelectorAll('*').forEach((el) => {
            const element = el as HTMLElement;
            const computedStyle = getComputedStyle(element);
            const color = computedStyle.color;
            const textContent = element.textContent ? element.textContent.trim() : '';
            
            // Vérifier si l'élément a une couleur rouge (différentes nuances de rouge)
            const isRed = color.includes('rgb(220, 38, 38)') || // red-600
                         color.includes('rgb(239, 68, 68)') || // red-500
                         color.includes('rgb(185, 28, 28)') || // red-700
                         color.includes('rgb(153, 27, 27)') || // red-800
                         color.includes('rgb(127, 29, 29)') || // red-900
                         color.includes('rgb(248, 113, 113)') || // red-400
                         color.includes('rgb(252, 165, 165)') || // red-300
                         color.includes('rgb(254, 202, 202)') || // red-200
                         color.includes('rgb(254, 226, 226)') || // red-100
                         color.includes('#dc2626') || // red-600 hex
                         color.includes('#ef4444') || // red-500 hex
                         color.includes('#b91c1c') || // red-700 hex
                         color.includes('#991b1b') || // red-800 hex
                         color.includes('#7f1d1d') || // red-900 hex
                         color.includes('#f87171') || // red-400 hex
                         color.includes('#fca5a5') || // red-300 hex
                         color.includes('#fecaca') || // red-200 hex
                         color.includes('#fee2e2'); // red-100 hex
            
            if (isRed && textContent) {
              const currentPaddingBottom = parseInt(computedStyle.paddingBottom) || 0;
              
              // Réduire l'espacement pour les titres avec numérotation (comme "1- متابعة التلاميذ:")
              if (textContent.match(/^\d+[-.]\s/)) {
                element.style.setProperty('padding-bottom', '0px', 'important');
                element.style.setProperty('margin-bottom', '0px', 'important');
                element.style.setProperty('line-height', '1.2', 'important');
                element.style.setProperty('margin-top', '-20px', 'important');
              } else {
                // Espacement normal pour les autres titres rouges
                element.style.paddingBottom = `${currentPaddingBottom + 5}px`;
              }
              
              // Correction spécifique pour "متوسطة" et son champ de saisie
              if (textContent.includes('متوسطة') || textContent.includes('ثانوية')) {
                element.style.setProperty('margin-bottom', '2px', 'important');
                element.style.setProperty('padding-bottom', '2px', 'important');
                element.style.setProperty('line-height', '1.1', 'important');
                element.style.setProperty('margin-right', '8px', 'important');
              }
              
              // Correction pour les éléments suivants (champs de saisie)
              const nextElement = element.nextElementSibling as HTMLElement;
              if (nextElement && (textContent.includes('متوسطة') || textContent.includes('ثانوية'))) {
                nextElement.style.setProperty('margin-top', '-5px', 'important');
                nextElement.style.setProperty('margin-left', '8px', 'important');
              }
            }
          });
          
          
        },
      } as Parameters<typeof html2canvas>[1];
      // Collect pages in DOM order and remove blank ones
      const allPageElements = Array.from(content.querySelectorAll('.report-page')) as HTMLElement[];
      const pageElements = allPageElements.filter((el) => {
        const textLen = (el.textContent || '').replace(/\s+/g, '').length;
        const hasMedia = el.querySelector('img, svg, canvas') !== null;
        const hasTables = el.querySelector('table') !== null;
        return textLen > 0 || hasMedia || hasTables;
      });
      if (pageElements.length > 0) {
        for (let idx = 0; idx < pageElements.length; idx++) {
          const pageEl = pageElements[idx] as HTMLElement;
          const canvas = await html2canvas(pageEl, options);
          const pageMargin = 5; // smaller margin for page containers
          const availableWidth = pdfWidth - 2 * pageMargin;
          const availableHeight = pdfHeight - 2 * pageMargin;
          let imgWidth = availableWidth;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;
          if (imgHeight > availableHeight) {
            imgHeight = availableHeight;
            imgWidth = (canvas.width * imgHeight) / canvas.height;
          }
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          if (idx > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', pageMargin, pageMargin, imgWidth, imgHeight);
        }
      } else {
        // Fallback: capture the entire content and split into equal slices
        const canvas = await html2canvas(content, options);
        const availableHeight = pdfHeight - 2 * margin;
        const imgWidth = pdfWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pagesNeeded = Math.ceil(imgHeight / availableHeight);

        for (let i = 0; i < pagesNeeded; i++) {
          if (i > 0) pdf.addPage();
          const sourceY = (i * canvas.height) / pagesNeeded;
          const sourceHeight = canvas.height / pagesNeeded;
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const pageImgData = tempCanvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, availableHeight);
          }
        }
      }
      let data: any = {};
      let title: string = '';
      let typeName: string = '';
      let fileName: string = 'report.pdf';
      
      if (type === 'student') {
        data = { ...reportData, cycle: currentCycle };
        title = `تقرير ${data.level} - ${data.semester}`;
        typeName = 'تقرير عملية الإعلام';
        fileName = 'تقرير_التوجيه.pdf';
      } else if (type === 'parent') {
        data = { ...parentReportData, cycle: currentCycle };
        title = `تقرير ${data.level} - ${data.semester}`;
        typeName = 'تقرير عملية إعلام الأولياء';
        fileName = 'تقرير_إعلام_الأولياء.pdf';
      } else if (type === 'activities') {
        data = { cycle: currentCycle };
        title = '';
        typeName = 'تقرير النشاطات';
        fileName = 'تقرير_النشاطات.pdf';
      } else if (type === 'objectives') {
        // Try to attach minimal meta for saving to registry
        try {
          const existingReports = (getStorage('reports') || []) as any[];
          const latest = existingReports.filter(r => r?.type === 'تقرير تحليل النتائج').slice(-1)[0];
          const c = latest?.content || {};
          data = { ...c, cycle: currentCycle };
          title = latest?.title || 'تقرير تحليل النتائج';
        } catch (_) {
          data = { cycle: currentCycle };
        }
        typeName = 'تقرير تحليل النتائج';
        fileName = 'تقرير_تحليل_النتائج.pdf';
      } else if (type === 'annual') {
        data = { ...annualReportData, cycle: currentCycle };
        title = `التقرير السنوي - ${annualReportData?.academicYear || ''}`.trim();
        typeName = 'التقرير السنوي';
        fileName = 'التقرير_السنوي.pdf';
      }

      const newReport: Report = {
        id: Date.now().toString(),
        title: title || '',
        date: new Date().toLocaleDateString('ar-SA'),
        type: typeName || '',
        content: data
      };

      setReports(prev => {
        const updated = [...prev, newReport];
        setStorage('reports', updated);
        return updated;
      });

      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };


  const getTotalStudentCount = () => {
    return reportData.coverageRows.reduce((sum, row) => sum + (row.studentCount || 0), 0);
  };

  const getTotalParentCount = () => {
    return parentReportData.coverageRows.reduce((sum, row) => sum + (row.parentCount || 0), 0);
  };

  const calculateTotalCoverage = (type: 'student' | 'parent') => {
    if (type === 'student') {
      const totalStudents = getTotalStudentCount();
      if (totalStudents === 0) return 0;
      
      const coveredStudents = reportData.coverageRows.reduce((sum, row) => {
        return sum + (row.studentCount * (row.coverage / 100));
      }, 0);
      
      return Math.round((coveredStudents / totalStudents) * 100);
    } else {
      const totalParents = getTotalParentCount();
      if (totalParents === 0) return 0;
      
      const coveredParents = parentReportData.coverageRows.reduce((sum, row) => {
        return sum + (row.parentCount * (row.coverage / 100));
      }, 0);
      
      return Math.round((coveredParents / totalParents) * 100);
    }
  };

  const handleReportTypeClick = (type: string) => {
    if (type === 'info') {
      setShowPreview(true);
    } else if (type === 'parent_info') {
      setShowParentPreview(true);
    } else if (type === 'objectives') {
      setShowObjectivesPreview(true);
    } else if (type === 'activities') {
      setShowActivitiesPreview(true);
    } else if (type === 'annual') {
      // Open HTML preview for annual report (captured via html2canvas)
      setShowAnnualPreview(true);
    }
  };


  // Fonctions de gestion des conseillers
  const addCounselor = () => {
    const newNumber = (counselors.length + 1).toString().padStart(2, '0');
    const newCounselor: CounselorData = {
      id: Date.now().toString(),
      number: newNumber,
      counselorName: '',
      schoolName: '',
      totalStudents: '0',
      firstYearStudents: '0',
      firstYearGroups: '0',
      secondYearStudents: '0',
      secondYearGroups: '0',
      thirdYearStudents: '0',
      thirdYearGroups: '0',
      fourthYearStudents: '0',
      fourthYearGroups: '0'
    };
    setCounselors(prev => [...prev, newCounselor]);
  };

  const removeCounselor = (id: string) => {
    setCounselors(prev => {
      const filtered = prev.filter(counselor => counselor.id !== id);
      // Renuméroter les conseillers restants
      return filtered.map((counselor, index) => ({
        ...counselor,
        number: (index + 1).toString().padStart(2, '0')
      }));
    });
  };

  const updateCounselor = (id: string, field: keyof CounselorData, value: string) => {
    setCounselors(prev => prev.map(counselor => 
      counselor.id === id ? { ...counselor, [field]: value } : counselor
    ));
  };
  const clearCounselorsTable = () => {
    setCounselors([{
      id: '1',
      number: '01',
      counselorName: '',
      schoolName: '',
      totalStudents: '0',
      firstYearStudents: '0',
      firstYearGroups: '0',
      secondYearStudents: '0',
      secondYearGroups: '0',
      thirdYearStudents: '0',
      thirdYearGroups: '0',
      fourthYearStudents: '0',
      fourthYearGroups: '0'
    }]);
  };
  const exportCounselorsData = () => {
    const dataStr = JSON.stringify(counselors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'counselors_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  const importCounselorsData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) ?? '';
        const importedData = safeParseJSON(content);
        if (Array.isArray(importedData)) {
          setCounselors(importedData);
        } else {
          alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
        }
      };
      reader.readAsText(file);
    }
  };
  // Fonctions génériques pour tous les tableaux
  const createGenericFunctions = <T extends { id: string; number?: string }>(
    data: T[],
    setData: React.Dispatch<React.SetStateAction<T[]>>,
    defaultItem: T
  ) => {
    const addItem = () => {
      const newNumber = data.length > 0 && data[0].number 
        ? (data.length + 1).toString().padStart(2, '0')
        : undefined;
      
      const newItem = {
        ...defaultItem,
        id: Date.now().toString(),
        ...(newNumber && { number: newNumber })
      };
      setData(prev => [...prev, newItem]);
    };

    const removeItem = (id: string) => {
      setData(prev => {
        const filtered = prev.filter(item => item.id !== id);
        // Renuméroter si nécessaire
        if (filtered.length > 0 && filtered[0].number) {
          return filtered.map((item, index) => ({
            ...item,
            number: (index + 1).toString().padStart(2, '0')
          }));
        }
        return filtered;
      });
    };

    const updateItem = (id: string, field: keyof T, value: any) => {
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ));
    };

    const clearTable = () => {
      setData([defaultItem]);
    };

    const exportData = (filename: string) => {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = (e.target?.result as string) ?? '';
          const importedData = safeParseJSON(content);
          if (Array.isArray(importedData)) {
            setData(importedData);
          } else {
            alert('خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
          }
        };
        reader.readAsText(file);
      }
    };

    return { addItem, removeItem, updateItem, clearTable, exportData, importData };
  };

  // Création des fonctions pour chaque tableau
  const coordinationFunctions = createGenericFunctions(
    coordinationData,
    setCoordinationData,
    {
      id: '1',
      number: '01',
      coordinationType: '',
      coordinationSubject: '',
      date: '',
      notes: ''
    }
  );
  const awarenessProgramFunctions = createGenericFunctions(
    awarenessProgramData,
    setAwarenessProgramData,
    {
      id: '1',
      number: '01',
      targetLevel: '',
      plannedActivity: '',
      completionDate: '',
      notes: ''
    }
  );

  const studentInfoFunctions = createGenericFunctions(
    studentInfoData,
    setStudentInfoData,
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      followUp: 'المتابعة و المرافقة للتلاميذ',
      interventions: '',
      objective: '',
      beneficiaryPercentage: ''
    }
  );

  const informationalDocumentsFunctions = createGenericFunctions(
    informationalDocumentsData,
    setInformationalDocumentsData,
    {
      id: '1',
      documentType: '',
      targetLevel: '',
      distributionDate: '',
      quantity: '',
      notes: ''
    }
  );

  const parentAttendanceFunctions = createGenericFunctions(
    parentAttendanceData,
    setParentAttendanceData,
    {
      id: '1',
      level: 'جميع المستويات',
      registeredStudents: secondPageData.totalStudents,
      individualMeetings: '',
      groupMeetings: '',
      total: '',
      attendancePercentage: '',
      notes: ''
    }
  );

  const nationalWeekFunctions = createGenericFunctions(
    nationalWeekData,
    setNationalWeekData,
    {
      id: '1',
      activityName: '',
      targetLevel: '',
      date: '',
      participants: '',
      duration: '',
      objectives: '',
      results: ''
    }
  );

  const highSchoolAdmissionYearFunctions = createGenericFunctions(
    highSchoolAdmissionYearData,
    setHighSchoolAdmissionYearData,
    {
      id: '1',
      academicYear: '2023-2022',
      fourthYearCount: '49',
      admittedCount: '30',
      percentage: '61.22',
      highestAverage: '17.47',
      highestStudent: 'بودرباس سنابيس',
      lowestAverage: '9.51',
      lowestStudent: 'حمادي نغم'
    }
  );
  // جدول "النتائج العامة" بنفس نموذج "قطاع تدخل المستشارين"
  const [admittedRows, setAdmittedRows] = useState<AdmittedRow[]>([{
    id: '1',
    schoolName: 'م. حسن بن خير الدين',
    examTotal: secondPageData.examTotal,
    examFemales: secondPageData.examFemales,
    successTotal: secondPageData.successTotal,
    successPercentage: secondPageData.successPercentage,
    successFemales: secondPageData.successFemales,
    successFemalesPercentage: secondPageData.successFemalesPercentage,
    grade10to11Count: secondPageData.grade10to11Count,
    grade10to11Percentage: secondPageData.grade10to11Percentage,
    grade12to13Count: secondPageData.grade12to13Count,
    grade12to13Percentage: secondPageData.grade12to13Percentage,
    grade14to15Count: secondPageData.grade14to15Count,
    grade14to15Percentage: secondPageData.grade14to15Percentage,
    grade16PlusCount: secondPageData.grade16PlusCount,
    grade16PlusPercentage: secondPageData.grade16PlusPercentage
  }]);
  const admittedFunctions = createGenericFunctions(
    admittedRows,
    setAdmittedRows,
    {
      id: '1',
      schoolName: '',
      examTotal: '',
      examFemales: '',
      successTotal: '',
      successPercentage: '',
      successFemales: '',
      successFemalesPercentage: '',
      grade10to11Count: '',
      grade10to11Percentage: '',
      grade12to13Count: '',
      grade12to13Percentage: '',
      grade14to15Count: '',
      grade14to15Percentage: '',
      grade16PlusCount: '',
      grade16PlusPercentage: ''
    }
  );

  // Création des fonctions pour tous les nouveaux tableaux
  const psychologicalActivitiesFunctions = createGenericFunctions(
    psychologicalActivitiesData,
    setPsychologicalActivitiesData,
    {
      id: '1',
      activityType: '',
      targetGroup: '',
      date: '',
      duration: '',
      objectives: '',
      results: '',
      notes: ''
    }
  );

  // جدول 2-3 نتائج التلاميذ في امتحان شهادة التعليم المتوسط
  const [studentResultsRows, setStudentResultsRows] = useState<StudentResultsRow[]>([{
    id: '1',
    schoolName: 'م. حسن بن خير الدين',
    examTotal: secondPageData.examTotal,
    examFemales: secondPageData.examFemales,
    successTotal: secondPageData.successTotal,
    successPercentage: secondPageData.successPercentage,
    successFemales: secondPageData.successFemales,
    successFemalesPercentage: secondPageData.successFemalesPercentage,
    grade10to11Count: secondPageData.grade10to11Count,
    grade10to11Percentage: secondPageData.grade10to11Percentage,
    grade12to13Count: secondPageData.grade12to13Count,
    grade12to13Percentage: secondPageData.grade12to13Percentage,
    grade14to15Count: secondPageData.grade14to15Count,
    grade14to15Percentage: secondPageData.grade14to15Percentage,
    grade16PlusCount: secondPageData.grade16PlusCount,
    grade16PlusPercentage: secondPageData.grade16PlusPercentage
  }]);
  const studentResultsFunctions = createGenericFunctions(
    studentResultsRows,
    setStudentResultsRows,
    {
      id: '1',
      schoolName: '',
      examTotal: '',
      examFemales: '',
      successTotal: '',
      successPercentage: '',
      successFemales: '',
      successFemalesPercentage: '',
      grade10to11Count: '',
      grade10to11Percentage: '',
      grade12to13Count: '',
      grade12to13Percentage: '',
      grade14to15Count: '',
      grade14to15Percentage: '',
      grade16PlusCount: '',
      grade16PlusPercentage: ''
    }
  );

  // جدول الرغبة والتوجيه النهائي حسب الجنس - السنة الرابعة متوسط
  // Removed unused: genderOrientationYear4Rows and related functions

  // الكفل النفسي مركز إجراء الامتحانات الرسمية
  const [examPsychSupportRows, setExamPsychSupportRows] = useState<ExamPsychSupportRow[]>([{
    id: '1', number: '01', caseType: '', count: '', stream: '', subject: '', care: '', notes: '/'
  }]);
  const examPsychSupportFunctions = createGenericFunctions(
    examPsychSupportRows,
    setExamPsychSupportRows,
    { id: '1', number: '01', caseType: '', count: '', stream: '', subject: '', care: '', notes: '/' }
  );

  // 1- التوجيه نحو السنة الأولى ثانوي: التوجيه المسبق و التوجيه النهائي
  const [orientationSummaryRows, setOrientationSummaryRows] = useState<OrientationSummaryRow[]>([
    { id: '1', label: 'المسلك', commonArts: '', sciencesTech: '', total: '100' },
    { id: '2', label: 'النهاية', commonArts: '', sciencesTech: '', total: '100' }
  ]);
  const orientationSummaryFunctions = createGenericFunctions(
    orientationSummaryRows,
    setOrientationSummaryRows,
    { id: '1', label: '', commonArts: '', sciencesTech: '', total: '' }
  );
  // Afficher un indicateur de chargement si les paramètres ne sont pas encore chargés
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Vérifier que les paramètres sont chargés avant de rendre les rapports
  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Student Report Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div id="report-preview" className="bg-white p-6 rounded-lg space-y-6 text-lg" dir="rtl">
              <div className="text-center font-bold text-2xl mb-8">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>

              <div className="text-center font-bold text-lg mb-4">
                وزارة التربية الوطنية
              </div>

              <div className="flex justify-between mb-2 text-lg">
                <div className="font-bold flex items-center gap-2">
                  <span>مديرية التربية لولاية</span>
                  <select
                    value={reportData.wilaya || ''}
                    onChange={(e) => setReportData(prev => ({ ...prev, wilaya: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-1 min-w-[160px] text-center text-lg bg-transparent"
                    dir="rtl"
                  >
                    <option value="">اختر الولاية</option>
                    {wilayaOptions.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="font-bold">مركز التوجيه و الإرشاد المدرسي و المهني</div>
              </div>

              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="underline font-semibold report-school-label">{currentCycle === 'ثانوي' ? 'ثانوية' : 'متوسطة'}</span>
                    <span>:</span>
                    <input
                      type="text"
                      value={reportData.school || settings?.schoolName || ''}
                      onChange={(e) => setReportData(prev => ({ ...prev, school: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-0 min-w-[220px] text-center text-lg bg-transparent report-school-field"
                      dir="rtl"
                      placeholder="اسم المدرسة"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="underline font-semibold">السنة الدراسية</span>
                    <span>:</span>
                    <select
                      value={reportData.academicYear}
                      onChange={(e) => setReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-0 w-32 text-center text-lg bg-transparent"
                      dir="rtl"
                    >
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="underline ml-2 font-semibold">مستشار التوجيه</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={reportData.counselor || getCycleConfig(currentCycle).counselorName || settings?.counselorName || ''}
                    onChange={(e) => setReportData(prev => ({ ...prev, counselor: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[220px] text-center text-lg bg-transparent"
                    dir="rtl"
                    placeholder="اسم المستشار"
                  />
                </div>
              </div>

              <div className="text-center my-4">
                <div className="text-2xl font-bold underline mb-1">تقرير عملية الإعلام</div>
                <div className="text-xl">
                  <select
                    value={reportData.semester}
                    onChange={(e) => setReportData(prev => ({ ...prev, semester: e.target.value }))}
                    className="bg-transparent border-none outline-none text-center text-xl"
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>({semester})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">المستوى</span>
                  <span className="mx-2">:</span>
                  <div className="relative inline-block text-center">
                    <select
                      value={reportData.level}
                      onChange={(e) => setReportData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-64 bg-transparent text-gray-900 px-2 py-1 text-xl text-center focus:outline-none focus:ring-0"
                      dir="rtl"
                    >
                      {getCycleLevels().map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold underline mb-2 text-lg">التعداد الإجمالي في المستوى:</div>
                    <div className="no-print text-sm flex items-center gap-3">
                      <span className="font-semibold">الوحدة:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit-mode-student"
                          checked={reportUnitMode === 'groups'}
                          onChange={() => setReportUnitMode('groups')}
                        />
                        <span>الأفواج</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit-mode-student"
                          checked={reportUnitMode === 'classes'}
                          onChange={() => setReportUnitMode('classes')}
                        />
                        <span>الأقسام</span>
                      </label>
                    </div>
                  </div>
                  <div className="no-print flex justify-end gap-2 mb-2"></div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <tbody>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">{reportUnitMode === 'groups' ? 'عدد الأفواج' : 'عدد الأقسام'}</td>
                        <td className="border-2 border-gray-700 p-2 w-28">
                          <input
                            type="number"
                            min="1"
                            max="16"
                            value={reportData.groupCount}
                            onChange={(e) => setReportData(prev => ({ 
                              ...prev, 
                              groupCount: Math.max(1, Math.min(parseInt(e.target.value) || 1, 16))
                            }))}
                            className="w-full text-center outline-none text-lg"
                            dir="rtl"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">{currentCycle === 'ثانوي' ? 'عدد الطلاب' : 'عدد التلاميذ'}</td>
                        <td className="border-2 border-gray-700 p-2 text-center" dir="rtl">
                          {reportData.totalStudents}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">الموضوع</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={reportData.subject}
                    onChange={(e) => setReportData(prev => ({ ...prev, subject: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[300px] text-center text-lg text-right"
                    dir="rtl"
                    placeholder="أدخل موضوع التقرير"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold underline mb-2 text-lg">التغطية الإعلامية:</div>
                    <div className="no-print text-sm flex items-center gap-3">
                      <span className="font-semibold">الوحدة:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit-mode-coverage-student"
                          checked={reportUnitMode === 'groups'}
                          onChange={() => setReportUnitMode('groups')}
                        />
                        <span>الأفواج</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit-mode-coverage-student"
                          checked={reportUnitMode === 'classes'}
                          onChange={() => setReportUnitMode('classes')}
                        />
                        <span>الأقسام</span>
                      </label>
                    </div>
                  </div>
                  <div className="no-print flex justify-end gap-2 mb-2">
                    <button
                      type="button"
                      onClick={addCoverageRow}
                      className="px-2 py-0.5 text-sm bg-green-500 text-white rounded"
                    >
                      إضافة سطر
                    </button>
                  </div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-2 border-gray-700 p-2 text-center">{reportUnitMode === 'groups' ? 'الأفواج' : 'الأقسام'}</th>
                        <th className="border-2 border-gray-700 p-2 text-center">{currentCycle === 'ثانوي' ? 'تعداد الطلاب' : 'تعداد التلاميذ'}</th>
                        <th className="border-2 border-gray-700 p-2 text-center">تاريخ التدخل</th>
                        <th className="border-2 border-gray-700 p-2 text-center">نسبة التغطية</th>
                        <th className="border-2 border-gray-700 p-2 text-center">الأهداف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.coverageRows.map((row, index) => (
                        <tr key={index}>
                          <td className="border-2 border-gray-700 p-2 text-center">
                            <select
                              value={row.group}
                              onChange={(e) => handleCoverageRowChange(index, 'group', e.target.value)}
                              className="w-full text-center outline-none text-lg"
                              style={{ textAlign: 'center' }}
                            >
                              <option value="">{reportUnitMode === 'groups' ? 'اختر الفوج' : 'اختر القسم'}</option>
                              {(currentCycle === 'ثانوي' ? defaultGroups.filter(u => !u.startsWith('4/')) : defaultGroups).map(unit => {
                                const label = reportUnitMode === 'classes' ? unit.replace('/', 'م') : unit;
                                return (
                                  <option key={unit} value={unit}>{label}</option>
                                );
                              })}
                            </select>
                          </td>
                          <td className="border-2 border-gray-700 p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={row.studentCount}
                              onChange={(e) => handleCoverageRowChange(index, 'studentCount', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none text-lg"
                              style={{ textAlign: 'center' }}
                              list="student-count-options"
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2 text-center">
                            <div className="flex items-center gap-1 w-full" dir="rtl">
                              <input
                                type="text"
                                value={formatDateToISO(row.date)}
                                onChange={(e) => handleDateChange(index, e.target.value)}
                                className="flex-1 text-center outline-none text-lg"
                                style={{ textAlign: 'center' }}
                                placeholder="AAAA-MM-DD"
                                maxLength={10}
                                onKeyDown={(e) => {
                                  // Permettre seulement les chiffres et les tirets
                                  if (!/[0-9-]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onInput={(e) => {
                                  let value = e.currentTarget.value.replace(/\D/g, '');
                                  if (value.length >= 4) {
                                    value = value.substring(0, 4) + '-' + value.substring(4);
                                  }
                                  if (value.length >= 7) {
                                    value = value.substring(0, 7) + '-' + value.substring(7, 9);
                                  }
                                  e.currentTarget.value = value;
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => fillWithTodayDate(index)}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors no-print ml-auto"
                                title="Remplir avec la date du jour"
                              >
                                اليوم
                              </button>
                            </div>
                          </td>
                          <td className="border-2 border-gray-700 p-2 text-center">
                            <input
                              type="text"
                              value={`%${Math.max(0, Math.min(100, Number.isFinite(row.coverage) ? row.coverage : 0))}`}
                              onChange={(e) => {
                                const digits = (e.target.value || '').replace(/[^0-9]/g, '');
                                const parsed = Math.max(0, Math.min(100, parseInt(digits || '0', 10)));
                                handleCoverageRowChange(index, 'coverage', parsed);
                              }}
                              className="w-full text-center outline-none text-lg"
                              style={{ textAlign: 'center' }}
                              list="coverage-percentage-options"
                              inputMode="numeric"
                              dir="rtl"
                            />
                          </td>
                          <td className="border-r-2 border-l-2 border-gray-700 p-2 text-center">
                            <MultiSelectTextarea
                              className="w-full outline-none text-base leading-tight p-1"
                              placeholder="اكتب أو اختر الأهداف"
                              defaultValue={row.resultsAnalysis || ''}
                              options={getCoverageObjectivesOptions(currentCycle)}
                              onValueChange={(val) => handleCoverageRowChange(index, 'resultsAnalysis', val)}
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2 text-center no-print">
                            <button
                              type="button"
                              onClick={() => removeCoverageRow(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td className="border-2 border-gray-700 p-2 text-center">
                          <div className="text-center w-full">مج</div>
                        </td>
                        <td className="border-2 border-gray-700 p-2 text-center">
                          <div className="text-center w-full">{getTotalStudentCount()}</div>
                        </td>
                        <td className="border-2 border-gray-700 p-2 text-center">
                          <div className="text-center w-full">-</div>
                        </td>
                        <td className="border-2 border-gray-700 p-2 text-center">
                          <div className="text-center w-full">{calculateTotalCoverage('student')}%</div>
                        </td>
                        <td className="border-r-2 border-l-2 border-gray-700 p-2 text-center">
                          <div className="text-center w-full">-</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {/* Suggestions lists for inputs (no-print so they're not captured visually) */}
                  <datalist id="student-count-options">
                    <option value="5" />
                    <option value="10" />
                    <option value="15" />
                    <option value="20" />
                    <option value="25" />
                    <option value="30" />
                    <option value="35" />
                    <option value="40" />
                  </datalist>
                  <datalist id="coverage-percentage-options">
                    <option value="0%" />
                    <option value="10%" />
                    <option value="30%" />
                    <option value="45%" />
                    <option value="50%" />
                    <option value="75%" />
                    <option value="80%" />
                    <option value="90%" />
                    <option value="100%" />
                  </datalist>
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">الملاحظات المستخلصة:</div>
                  <textarea
                    value={reportData.conclusions}
                    onChange={(e) => setReportData(prev => ({ ...prev, conclusions: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-700 rounded-lg text-lg text-right"
                    rows={4}
                    dir="rtl"
                    placeholder="أدخل الملاحظات المستخلصة من عملية الإعلام"
                  />
                </div>
                <div className="flex justify-between mt-8">
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">مستشار التوجيه و الإرشاد م.م</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">{currentCycle === 'ثانوي' ? 'مدير الثانوية' : 'مدير المتوسطة'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleGeneratePDF('student')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كـ PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Parent Report Preview Modal */}
      {showParentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowParentPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div id="parent-report-preview" className="bg-white p-6 rounded-lg space-y-6 text-lg" dir="rtl">
              <div className="text-center font-bold text-2xl mb-8">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>

              <div className="text-center font-bold text-lg mb-4">
                وزارة التربية الوطنية
              </div>

              <div className="flex justify-between mb-2 text-lg">
                <div className="font-bold flex items-center gap-2">
                  <span>مديرية التربية لولاية</span>
                  <select
                    value={parentReportData.wilaya || reportData.wilaya || ''}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, wilaya: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-1 min-w-[160px] text-center text-lg bg-transparent"
                    dir="rtl"
                  >
                    <option value="">اختر الولاية</option>
                    {wilayaOptions.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div className="font-bold">مركز التوجيه و الإرشاد المدرسي و المهني</div>
              </div>

              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="underline ml-2 font-semibold">{currentCycle === 'ثانوي' ? 'ثانوية' : 'متوسطة'}</span>
                    <span className="mx-2">:</span>
                    <input
                      type="text"
                      value={parentReportData.school || settings?.schoolName || ''}
                      onChange={(e) => setParentReportData(prev => ({ ...prev, school: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[220px] text-center text-lg bg-transparent"
                      dir="rtl"
                      placeholder="اسم المدرسة"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="underline ml-2 font-semibold">السنة الدراسية</span>
                    <span className="mx-2">:</span>
                    <select
                      value={parentReportData.academicYear}
                      onChange={(e) => setParentReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 w-32 text-center text-lg bg-transparent"
                      dir="rtl"
                    >
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="underline ml-2 font-semibold">مستشار التوجيه</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={parentReportData.counselor || settings?.counselorName || ''}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, counselor: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[220px] text-center text-lg bg-transparent"
                    dir="rtl"
                    placeholder="اسم المستشار"
                  />
                </div>
              </div>

              <div className="text-center my-4">
                <div className="text-2xl font-bold underline mb-1">تقرير عملية إعلام الأولياء</div>
                <div className="text-xl">
                  <select
                    value={parentReportData.semester}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, semester: e.target.value }))}
                    className="bg-transparent border-none outline-none text-center text-xl"
                  >
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>({semester})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">المستوى</span>
                  <span className="mx-2">:</span>
                  <div className="relative inline-block min-w-[150px] text-center">
                    <select
                      value={parentReportData.level}
                      onChange={(e) => setParentReportData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full border-b border-gray-300 focus:border-blue-500 outline-none px-2 py-1 bg-transparent appearance-none text-lg text-center"
                      dir="rtl"
                    >
                      {getCycleLevels().map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
        <div className="font-bold underline mb-2 text-lg">التعداد الإجمالي في المستوى:</div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <tbody>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">{parentUnitMode === 'groups' ? 'عدد الأفواج' : 'عدد الأقسام'}</td>
                        <td className="border-2 border-gray-700 p-2 w-28">
                          <input
                            type="number"
                            min="1"
                            max="16"
                            value={parentReportData.groupCount}
                            onChange={(e) => setParentReportData(prev => ({ 
                              ...prev, 
                              groupCount: Math.max(1, Math.min(parseInt(e.target.value) || 1, 16))
                            }))}
                            className="w-full text-center outline-none text-lg"
                            dir="rtl"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border-2 border-gray-700 p-2 font-bold text-center">{currentCycle === 'ثانوي' ? 'عدد الطلاب' : 'عدد التلاميذ'}</td>
                        <td className="border-2 border-gray-700 p-2 text-center" dir="rtl">
                          {parentReportData.totalParents}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-center">
                  <span className="underline font-bold ml-2 text-lg">الموضوع</span>
                  <span className="mx-2">:</span>
                  <input
                    type="text"
                    value={parentReportData.subject}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, subject: e.target.value }))}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 min-w-[300px] text-center text-lg text-right"
                    dir="rtl"
                    placeholder="أدخل موضوع التقرير"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
        <div className="font-bold underline mb-2 text-lg">التغطية الإعلامية:</div>
                    <div className="no-print text-sm flex items-center gap-3">
                      <span className="font-semibold">الوحدة:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit-mode-coverage-parent"
                          checked={parentUnitMode === 'groups'}
                          onChange={() => setParentUnitMode('groups')}
                        />
                        <span>الأفواج</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="unit-mode-coverage-parent"
                          checked={parentUnitMode === 'classes'}
                          onChange={() => setParentUnitMode('classes')}
                        />
                        <span>الأقسام</span>
                      </label>
                    </div>
                  </div>
                  <div className="no-print flex justify-end gap-2 mb-2">
                    <button
                      type="button"
                      onClick={addParentCoverageRow}
                      className="px-2 py-0.5 text-sm bg-green-500 text-white rounded"
                    >
                      إضافة سطر
                    </button>
                  </div>
                  <table className="w-full border-collapse border-2 border-gray-700 text-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border-2 border-gray-700 p-2 text-center">{parentUnitMode === 'groups' ? 'الأفواج' : 'الأقسام'}</th>
                        <th className="border-2 border-gray-700 p-2 text-center">
                          {currentCycle === 'ثانوي' ? 'عدد الطلاب' : 'عدد التلاميذ'}
                        </th>
                        <th className="border-2 border-gray-700 p-2 text-center">تاريخ التدخل</th>
                        <th className="border-2 border-gray-700 p-2 text-center">نسبة التغطية</th>
                        <th className="border-2 border-gray-700 p-2 text-center">الأهداف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentReportData.coverageRows.map((row, index) => (
                        <tr key={index}>
                          <td className="border-2 border-gray-700 p-2 no-print">
                            {parentUnitMode === 'groups' ? (
                              <select
                                value={row.group}
                                onChange={(e) => handleParentCoverageRowChange(index, 'group', e.target.value)}
                                className="w-full text-center outline-none text-lg"
                                dir="rtl"
                              >
                                <option value="">اختر الفوج</option>
                                {defaultGroups.map(unit => (
                                  <option key={unit} value={unit}>{unit}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="number"
                                min="1"
                                value={Number.isFinite(parseInt(String(row.group))) ? parseInt(String(row.group)) : ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const parsed = val === '' ? '' : Math.max(1, parseInt(val) || 1);
                                  handleParentCoverageRowChange(index, 'group', parsed as any);
                                }}
                                className="w-full text-center outline-none text-lg"
                                dir="rtl"
                                placeholder="رقم القسم"
                              />
                            )}
                          </td>
                          <td className="border-2 border-gray-700 p-2 no-print">
                            <input
                              type="number"
                              min="0"
                              value={row.studentCount || 0}
                              onChange={(e) => handleParentCoverageRowChange(index, 'studentCount', parseInt(e.target.value) || 0)}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <div className="flex items-center gap-1 w-full" dir="rtl">
                              <input
                                type="text"
                                value={formatDateToISO(row.date)}
                                onChange={(e) => handleParentDateChange(index, e.target.value)}
                                className="flex-1 text-center outline-none text-lg"
                                style={{ textAlign: 'center' }}
                                placeholder="AAAA-MM-DD"
                                maxLength={10}
                                onKeyDown={(e) => {
                                  // Permettre seulement les chiffres et les tirets
                                  if (!/[0-9-]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onInput={(e) => {
                                  let value = e.currentTarget.value.replace(/\D/g, '');
                                  if (value.length >= 4) {
                                    value = value.substring(0, 4) + '-' + value.substring(4);
                                  }
                                  if (value.length >= 7) {
                                    value = value.substring(0, 7) + '-' + value.substring(7, 9);
                                  }
                                  e.currentTarget.value = value;
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => fillWithTodayParentDate(index)}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors no-print ml-auto"
                                title="Remplir avec la date du jour"
                              >
                                اليوم
                              </button>
                            </div>
                          </td>
                          <td className="border-2 border-gray-700 p-2">
                            <input
                              type="text"
                              value={`%${Math.max(0, Math.min(100, Number.isFinite(row.coverage) ? row.coverage : 0))}`}
                              onChange={(e) => {
                                const digits = (e.target.value || '').replace(/[^0-9]/g, '');
                                const parsed = Math.max(0, Math.min(100, parseInt(digits || '0', 10)));
                                handleParentCoverageRowChange(index, 'coverage', parsed);
                              }}
                              className="w-full text-center outline-none text-lg"
                              dir="rtl"
                              inputMode="numeric"
                              list="coverage-percentage-options"
                              style={{ textAlign: 'center' }}
                            />
                          </td>
                          <td className="border-r-2 border-l-2 border-gray-700 p-2 text-center">
                            <MultiSelectTextarea
                              className="w-full outline-none text-base leading-tight p-1"
                              placeholder="اكتب أو اختر الأهداف"
                              defaultValue={row.topics || ''}
                              options={getParentCoverageObjectivesOptions(currentCycle)}
                              onValueChange={(val) => handleParentCoverageRowChange(index, 'topics', val)}
                            />
                          </td>
                          <td className="border-2 border-gray-700 p-2 no-print">
                            <button
                              type="button"
                              onClick={() => removeParentCoverageRow(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td className="border-2 border-gray-700 p-2 text-center no-print">مج</td>
                        <td className="border-2 border-gray-700 p-2 text-center no-print">{parentReportData.coverageRows.reduce((sum, row) => sum + (row.studentCount || 0), 0)}</td>
                        <td className="border-2 border-gray-700 p-2 text-center">-</td>
                        <td className="border-2 border-gray-700 p-2 text-center">{calculateTotalCoverage('parent')}%</td>
                        <td className="border-r-2 border-l-2 border-gray-700 p-2 text-center">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="font-bold underline mb-2 text-lg">الملاحظات المستخلصة:</div>
                  <textarea
                    value={parentReportData.conclusions}
                    onChange={(e) => setParentReportData(prev => ({ ...prev, conclusions: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-700 rounded-lg text-lg text-right"
                    rows={4}
                    dir="rtl"
                    placeholder="أدخل الملاحظات المستخلصة من لقاءات الأولياء"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">مستشار التوجيه و الإرشاد م.م</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold underline mb-8 text-lg">{currentCycle === 'ثانوي' ? 'مدير الثانوية' : 'مدير المتوسطة'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowParentPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleGeneratePDF('parent')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>حفظ كـ PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Annual Report Preview Modal */}
      {showAnnualPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowAnnualPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div id="annual-report-preview" className="space-y-8" dir="rtl">
              {/* First Page: redesigned cover */}
              <div className="report-page bg-white" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', border: '10px solid #1d4ed8', position: 'relative', padding: '12mm', boxSizing: 'border-box' }}>
                {/* Top headings */}
                <div className="text-center" style={{ marginTop: '6mm' }}>
                  <div className="text-2xl font-bold mb-3">الجمهورية الجزائرية الديمقراطية الشعبية</div>
                  <div className="text-xl font-bold">وزارة التربية الوطنية</div>
                </div>

                {/* Right-aligned info with dotted lines */}
                <div className="mt-10" style={{ direction: 'rtl' }}>
                  <div className="flex justify-end mb-3 items-baseline gap-2">
                    <span className="text-lg">مديرية التربية لولاية :</span>
                    <input type="text" value={annualReportData.wilaya}
                           onChange={(e) => setAnnualReportData({ ...annualReportData, wilaya: e.target.value })}
                           className="bg-transparent outline-none text-right text-lg" style={{ borderBottom: '2px dotted #555', minWidth: '60mm' }} dir="rtl" placeholder="................" />
                  </div>
                  <div className="flex justify-end mb-3 items-baseline gap-2">
                    <span className="text-lg">مركز التوجيه المدرسي والمهني :</span>
                    <input type="text" value={annualReportData.center}
                           onChange={(e) => setAnnualReportData({ ...annualReportData, center: e.target.value })}
                           className="bg-transparent outline-none text-right text-lg" style={{ borderBottom: '2px dotted #555', minWidth: '60mm' }} dir="rtl" placeholder="................" />
                  </div>
                  <div className="flex justify-end mb-3 items-baseline gap-2">
                    <span className="text-lg">{currentCycle === 'ثانوي' ? 'ثانوية :' : 'متوسطة :'}</span>
                    <input type="text" value={annualReportData.school}
                           onChange={(e) => setAnnualReportData({ ...annualReportData, school: e.target.value })}
                           className="bg-transparent outline-none text-right text-lg" style={{ borderBottom: '2px dotted #555', minWidth: '60mm' }} dir="rtl" placeholder="................" />
                  </div>
                  <div className="flex justify-end mb-3 items-baseline gap-2">
                    <span className="text-lg">مستشار التوجيه والإرشاد :</span>
                    <input type="text" value={annualReportData.counselor}
                           onChange={(e) => setAnnualReportData({ ...annualReportData, counselor: e.target.value })}
                           className="bg-transparent outline-none text-right text-lg" style={{ borderBottom: '2px dotted #555', minWidth: '60mm' }} dir="rtl" placeholder="................" />
                  </div>
                </div>

                {/* Big centered title */}
                <div className="text-center" style={{ marginTop: '40mm', marginBottom: '20mm' }}>
                  <div className="font-bold" style={{ fontSize: '24pt', marginBottom: '6mm' }}>التقرير السنوي لنشاطات مستشار</div>
                  <div className="font-bold" style={{ fontSize: '24pt' }}>التوجيه والإرشاد المدرسي والمهني</div>
                </div>

                {/* Academic year bottom line */}
                <div className="text-center" style={{ position: 'absolute', bottom: '12mm', left: 0, right: 0 }}>
                  <span className="text-lg font-semibold ml-2">الموسم الدراسي :</span>
                  <select value={annualReportData.academicYear}
                          onChange={(e) => setAnnualReportData({ ...annualReportData, academicYear: e.target.value })}
                          className="bg-transparent outline-none text-lg" style={{ borderBottom: '2px dotted #555' }} dir="rtl">
                    {academicYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
               {/* Second Page - Statistical Report */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '3mm' }}>

                 {/* Page Content */}
                 <div className="space-y-6" dir="rtl">
                   {/* Institution Definition Section */}
                   <div className="mb-6">
                     <h3 className="text-xl font-bold mb-4 text-right">1 - تعريف بالمؤسسة :</h3>
                     <div className="space-y-3 text-right">
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">عنوان المؤسسة :</span>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={secondPageData.schoolAddress}
                             onChange={(e) => handleSecondPageDataChange('schoolAddress', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none"
                           />
                         </div>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">رقم الهاتف :</span>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={secondPageData.phoneNumber}
                             onChange={(e) => handleSecondPageDataChange('phoneNumber', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none"
                           />
                         </div>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">رقم الفاكس :</span>
                         <div className="flex-1">
                           <input
                             type="text"
                             value={secondPageData.faxNumber}
                             onChange={(e) => handleSecondPageDataChange('faxNumber', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none"
                           />
                         </div>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="font-semibold">البريد الالكتروني :</span>
                         <div className="flex-1 min-w-80">
                           <input
                             type="text"
                             value={secondPageData.email}
                             onChange={(e) => handleSecondPageDataChange('email', e.target.value)}
                             className="text-lg px-2 py-1 text-right focus:outline-none w-full min-w-80"
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                   {/* Counselors' Intervention Sector */}
                   <div className="mb-6">
                     <h3 className="text-xl font-bold mb-4 text-right">2 - قطاع تدخل المستشارين:</h3>
                     
                     {/* Boutons de contrôle pour la gestion des conseillers */}
                     <div className="mb-4 flex justify-end gap-2 no-print">
                       <button
                         onClick={addCounselor}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                         title="إضافة مستشار جديد"
                       >
                         <Plus className="w-4 h-4" />
                         إضافة مؤسسة
                       </button>
                       <button
                         onClick={exportCounselorsData}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                         title="تصدير البيانات إلى ملف JSON"
                       >
                         <Download className="w-4 h-4" />
                         تصدير
                       </button>
                       <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                         <Upload className="w-4 h-4" />
                         استيراد
                         <input
                           type="file"
                           accept=".json"
                           onChange={importCounselorsData}
                           className="hidden"
                         />
                       </label>
                       <button
                         onClick={clearCounselorsTable}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                         title="مسح جميع البيانات من الجدول"
                       >
                         <X className="w-4 h-4" />
                         مسح الجدول
                       </button>
                     </div>
                     
                    {/* Student Distribution Table */}
                    <div className="mb-6">
                      <div className="overflow-x-visible" style={{ overflowX: 'visible' }}>
                        <table className="w-full table-fixed border-collapse border border-gray-400 text-sm" style={{ tableLayout: 'fixed' }}>
                           <thead>
                             <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words">الرقم</th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words" style={{ width: '10%' }}>اسم و لقب المستشار</th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words" style={{ width: '10%' }}>المتوسطة</th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words">المجموع العام للتلاميذ</th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الأولى<br/>متوسط</span></th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الثانية<br/>متوسط</span></th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الثالثة<br/>متوسط</span></th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words" colSpan={2}><span style={{lineHeight:'1.2', display:'inline-block'}}>الرابعة<br/>متوسط</span></th>
                              <th className="border border-gray-400 p-2 text-center whitespace-normal break-words no-print" style={{ width: '10%' }}>إجراءات</th>
                             </tr>
                             <tr className="bg-gray-50">
                              <th className="border border-gray-400 p-2 text-center" style={{ width: '10%' }}></th>
                              <th className="border border-gray-400 p-2 text-center" style={{ width: '10%' }}></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">{currentCycle === 'ثانوي' ? 'ع/ الطلاب' : 'ع/ التلاميذ'}</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">ع/ الأفواج</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">{currentCycle === 'ثانوي' ? 'ع/ الطلاب' : 'ع/ التلاميذ'}</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">ع/ الأفواج</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">{currentCycle === 'ثانوي' ? 'ع/ الطلاب' : 'ع/ التلاميذ'}</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">ع/ الأفواج</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">{currentCycle === 'ثانوي' ? 'ع/ الطلاب' : 'ع/ التلاميذ'}</span></th>
                               <th className="border border-gray-400 text-center vertical-header-cell whitespace-normal break-words"><span className="vertical-header-label">ع/ الأفواج</span></th>
                             </tr>
                           </thead>
                           <tbody>
                             {counselors.map((counselor) => (
                               <tr key={counselor.id}>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.number}
                                     onChange={(e) => updateCounselor(counselor.id, 'number', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words align-top" style={{ width: '10%' }}>
                                  <textarea
                                    value={counselor.counselorName}
                                    onChange={(e) => updateCounselor(counselor.id, 'counselorName', e.target.value)}
                                    rows={3}
                                    dir="rtl"
                                    className="w-full text-center border-none outline-none bg-transparent text-sm leading-snug whitespace-pre-wrap break-words resize-none"
                                    placeholder="اسم و لقب المستشار"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words align-top" style={{ width: '10%' }}>
                                  <textarea
                                    value={counselor.schoolName}
                                    onChange={(e) => updateCounselor(counselor.id, 'schoolName', e.target.value)}
                                    rows={3}
                                    dir="rtl"
                                    className="w-full text-center border-none outline-none bg-transparent text-sm leading-snug whitespace-pre-wrap break-words resize-none"
                                    placeholder="أدخل اسم المؤسسة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.totalStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'totalStudents', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.firstYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'firstYearStudents', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.firstYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'firstYearGroups', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.secondYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'secondYearStudents', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.secondYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'secondYearGroups', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.thirdYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'thirdYearStudents', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                <td className="border border-gray-400 p-2 text-center whitespace-normal break-words">
                                   <input
                                     type="text"
                                     value={counselor.thirdYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'thirdYearGroups', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-sm"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.fourthYearStudents}
                                     onChange={(e) => updateCounselor(counselor.id, 'fourthYearStudents', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center">
                                   <input
                                     type="text"
                                     value={counselor.fourthYearGroups}
                                     onChange={(e) => updateCounselor(counselor.id, 'fourthYearGroups', e.target.value)}
                                     className="w-full text-center border-none outline-none bg-transparent"
                                   />
                                 </td>
                                 <td className="border border-gray-400 p-3 text-center no-print" style={{ width: '10%' }}>
                                   <button
                                     onClick={() => removeCounselor(counselor.id)}
                                     className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                     title="حذف هذا المستشار"
                                   >
                                     <Trash2 className="w-3 h-3" />
                                     حذف
                                   </button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     </div>
                   </div>
                   {/* Admission and Orientation Results Section */}
                   <div className="mb-6">
                     <h3 className="text-lg font-bold mb-4 text-right">3- حصيلة أعمال مجالس القبول و التوجيه في السنة الأولى ثانوي للسنة الدراسية 2022-2023 :</h3>
                     <h4 className="text-lg font-bold mb-3 text-right">1-3 - النتائج العامة للتلاميذ المقبولين في السنة الأولى ثانوي:</h4>
                     
                     {/* Admitted Students Table */}
                     <div className="mb-4 flex justify-end gap-2 no-print">
                       <button
                         onClick={admittedFunctions.addItem}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                         title="إضافة مؤسسة"
                       >
                         <Plus className="w-4 h-4" />
                         إضافة مؤسسة
                       </button>
                       <button
                         onClick={() => { const dataStr = JSON.stringify(admittedRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'admitted_rows.json'; link.click(); URL.revokeObjectURL(url); }}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                         title="تصدير"
                       >
                         <Download className="w-4 h-4" />
                         تصدير
                       </button>
                       <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                         <Upload className="w-4 h-4" />
                         استيراد
                         <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setAdmittedRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                       </label>
                       <button
                         onClick={admittedFunctions.clearTable}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                         title="مسح الجدول"
                       >
                         <X className="w-4 h-4" />
                         مسح الجدول
                       </button>
                     </div>
                     <div className="overflow-x-auto mb-6">
                       <table className="w-full border-collapse border border-gray-400 text-sm annual-table-2">
                         <thead>
                           <tr className="bg-gray-100">
                             <th className="border border-gray-400 p-2 text-center" style={{ width: '10%' }}>المتوسطة</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>الحاضرون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={4}>{currentCycle === 'ثانوي' ? 'الطلاب المقبولين في السنة الأولى ثانوي' : 'التلاميذ المقبولين في السنة الأولى ثانوي'}</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={8}>{currentCycle === 'ثانوي' ? 'توزيع الطلاب المقبولين حسب فئات المعدلات (معدلات القبول)' : 'توزيع التلاميذ المقبولين حسب فئات المعدلات (معدلات القبول)'}</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center" style={{ width: '10%' }}></th>
                             <th className="border border-gray-400 p-2 text-center">مج</th>
                             <th className="border border-gray-400 p-2 text-center">إناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>مجموع المقبولين</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>من بينهم الإناث</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>16 و أكثر</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>15,99-14</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>13,99-12</th>
                             <th className="border border-gray-400 p-2 text-center" colSpan={2}>11,99-10.00</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center"></th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">العدد</th>
                             <th className="border border-gray-400 p-2 text-center">النسبة</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                             <th className="border border-gray-400 p-2 text-center">ع</th>
                             <th className="border border-gray-400 p-2 text-center">%</th>
                           </tr>
                         </thead>
                         <tbody>
                           <tr>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle" style={{ width: '15%' }} rowSpan={3}>
                               <textarea
                                 className="w-full text-center border-none outline-none bg-transparent text-xs resize-none"
                                 rows={3}
                                 defaultValue="م. حسن بن خير الدين"
                                 style={{ minHeight: '60px', lineHeight: '1.2', width: '100%' }}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="text"
                                 value={secondPageData.examTotal}
                                 onChange={(e) => handleSecondPageDataChange('examTotal', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue="53"
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="text"
                                 value={secondPageData.examFemales}
                                 onChange={(e) => handleSecondPageDataChange('examFemales', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue="26"
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="text"
                                 value={secondPageData.successTotal}
                                 onChange={(e) => handleSecondPageDataChange('successTotal', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue="34"
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="text"
                                 value={secondPageData.successPercentage}
                                 onChange={(e) => handleSecondPageDataChange('successPercentage', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue="64.15"
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="text"
                                 value={secondPageData.successFemales}
                                 onChange={(e) => handleSecondPageDataChange('successFemales', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue="16"
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="text"
                                 value={secondPageData.successFemalesPercentage}
                                 onChange={(e) => handleSecondPageDataChange('successFemalesPercentage', e.target.value)}
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue="47.05"
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={0}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={0}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={0}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={0}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={8}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={15.09}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={26}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 dir="ltr"
                                 className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                 defaultValue={49.05}
                               />
                             </td>
                           </tr>
                         </tbody>
                       </table>
                     </div>
                   </div>
                   {/* Student Results Section */}
                   <div className="mb-6">
                        <h4 className="text-lg font-bold mb-3 text-right">{currentCycle === 'ثانوي' ? '2-3- نتائج الطلاب في امتحان شهادة التعليم المتوسط:' : '2-3- نتائج التلاميذ في امتحان شهادة التعليم المتوسط:'}</h4>
                     
                     {/* Successful Students Table */}
                     <div className="mb-4 flex justify-end gap-2 no-print">
                       <button onClick={studentResultsFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة مؤسسة">
                         <Plus className="w-4 h-4" /> إضافة مؤسسة
                       </button>
                       <button onClick={() => { const dataStr = JSON.stringify(studentResultsRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'student_results_rows.json'; link.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                         <Download className="w-4 h-4" /> تصدير
                       </button>
                       <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                         <Upload className="w-4 h-4" /> استيراد
                         <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setStudentResultsRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                       </label>
                       <button onClick={studentResultsFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                         <X className="w-4 h-4" /> مسح الجدول
                       </button>
                     </div>
                     <div className="overflow-x-visible" style={{ overflowX: 'visible' }}>
                       <table className="w-full table-fixed border-collapse border border-gray-400 text-xs" style={{ tableLayout: 'fixed' }}>
                         <thead>
                           <tr className="bg-gray-100">
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" style={{ width: '15%' }}>{currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة'}</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2} style={{ width: '16%' }}>الحاضرون في شهادة التعليم المتوسط</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={4} style={{ width: '24%' }}>{currentCycle === 'ثانوي' ? 'الطلاب الناجحون في شهادة التعليم المتوسط' : 'التلاميذ الناجحون في شهادة التعليم المتوسط'}</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={8} style={{ width: '48%' }}>توزيع المعدلات العامة للتلاميذ في شهادة التعليم المتوسط</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-1 text-center" style={{ width: '12%' }}></th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">مجموع</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">الإناث</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2}>مجموع المقبولين</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2}>من بينهم الإناث</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2}>11.99-10.00</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2}>13,99-12</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2}>15,99-14</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words" colSpan={2}>16 و أكثر</th>
                           </tr>
                           <tr className="bg-gray-50">
                             <th className="border border-gray-400 p-1 text-center" style={{ width: '12%' }}></th>
                             <th className="border border-gray-400 p-1 text-center"></th>
                             <th className="border border-gray-400 p-1 text-center"></th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">العدد</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">النسبة</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">العدد</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">النسبة</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">العدد</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">النسبة</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">العدد</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">النسبة</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">العدد</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">النسبة</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">العدد</th>
                             <th className="border border-gray-400 p-1 text-center whitespace-normal break-words">النسبة</th>
                           </tr>
                         </thead>
                         <tbody>
                           {studentResultsRows.map((row)=> (
                             <tr key={row.id}>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words" style={{ width: '12%' }}>
                                 <input type="text" value={row.schoolName} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'schoolName',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" />
                               </td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.examTotal} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'examTotal',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.examFemales} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'examFemales',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.successTotal} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successTotal',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.successPercentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successPercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.successFemales} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successFemales',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.successFemalesPercentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'successFemalesPercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade10to11Count} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade10to11Count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade10to11Percentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade10to11Percentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade12to13Count} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade12to13Count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade12to13Percentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade12to13Percentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade14to15Count} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade14to15Count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade14to15Percentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade14to15Percentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade16PlusCount} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade16PlusCount',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle whitespace-normal break-words"><input type="text" value={row.grade16PlusPercentage} onChange={(e)=>studentResultsFunctions.updateItem(row.id,'grade16PlusPercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent text-xs" /></td>
                               <td className="border border-gray-400 p-2 text-center no-print">
                                 <button onClick={()=>studentResultsFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                   <Trash2 className="w-3 h-3" /> حذف
                                 </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>


                
                  </div>
                </div>
                {/* Third Page - Media and Information Section */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-6" dir="rtl">
                    {/* Page Title */}
                    <div className="mb-4 text-right">
                      <h3 className="text-xl font-bold mb-2">1- في مجال الإعلام</h3>
                      <p className="text-sm text-gray-600">الوسائل التي اعتمد عليها مستشار التوجيه والإرشاد المدرسي والمهني في هذا النشاط</p>
                    </div>

                    {/* Media Assets Section */}
                    <div>
                      <h4 className="text-lg font-bold mb-3 text-right">أ- السندات الإعلامية المنجزة</h4>
                      
                      {/* Boutons de contrôle pour les documents d'information */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={informationalDocumentsFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة سند إعلامي جديد"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة سند
                        </button>
                        <button
                          onClick={() => informationalDocumentsFunctions.exportData('informational_documents_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={informationalDocumentsFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={informationalDocumentsFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-visible">
                        <table className="w-full border-collapse border border-gray-400 text-base" style={{ tableLayout: 'auto', minWidth: '100%' }}>
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-3 text-center" style={{ width: '18%', minWidth: '150px' }}>السندات الإعلامية (نوعها)</th>
                              <th className="border border-gray-400 p-3 text-center" style={{ width: '25%', minWidth: '200px' }}>الموضوع</th>
                              <th className="border border-gray-400 p-3 text-center" style={{ width: '15%', minWidth: '120px' }}>الفئة المستهدفة</th>
                              <th className="border border-gray-400 p-3 text-center" style={{ width: '22%', minWidth: '180px' }}>الهيئة المنجزة لها</th>
                              <th className="border border-gray-400 p-3 text-center" style={{ width: '12%', minWidth: '100px' }}>تاريخ الإنجاز</th>
                              <th className="border border-gray-400 p-3 text-center no-print" style={{ width: '8%', minWidth: '80px' }}>إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {informationalDocumentsData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell', width: '18%', minWidth: '150px' }}>
                                  <div className="relative h-full flex items-center justify-center">
                                    <textarea
                                    value={item.documentType}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'documentType', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent text-sm resize-none pr-6"
                                      style={{ 
                                        minHeight: '60px', 
                                        lineHeight: '1.4',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                      rows={3}
                                      placeholder="اكتب أو اختر نوع السند"
                                    />
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const currentValue = item.documentType || '';
                                          const newValue = currentValue ? `${currentValue}\n${e.target.value}` : e.target.value;
                                          informationalDocumentsFunctions.updateItem(item.id, 'documentType', newValue);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="absolute top-0 right-0 w-4 h-full border-none outline-none bg-transparent text-xs opacity-0 cursor-pointer"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <option value="">اختر</option>
                                      <option value="ملصقات">ملصقات</option>
                                      <option value="كتيبات">كتيبات</option>
                                      <option value="مطويات">مطويات</option>
                                      <option value="دليل التكوينات">دليل التكوينات</option>
                                      <option value="وثائق حول">وثائق حول</option>
                                      <option value="وثائق حول التسجيلات في الجامعة">وثائق حول التسجيلات في الجامعة</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell', width: '25%', minWidth: '200px' }}>
                                  <div className="relative h-full flex items-center justify-center">
                                    <textarea
                                    value={item.targetLevel}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'targetLevel', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent text-sm resize-none pr-6"
                                      style={{ 
                                        minHeight: '60px', 
                                        lineHeight: '1.4',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                      rows={3}
                                      placeholder="اكتب أو اختر الموضوع"
                                    />
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const currentValue = item.targetLevel || '';
                                          const newValue = currentValue ? `${currentValue}\n${e.target.value}` : e.target.value;
                                          informationalDocumentsFunctions.updateItem(item.id, 'targetLevel', newValue);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="absolute top-0 right-0 w-4 h-full border-none outline-none bg-transparent text-xs opacity-0 cursor-pointer"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <option value="">اختر</option>
                                      <option value="التحسيس بأهمية الرياضيات">التحسيس بأهمية الرياضيات</option>
                                      <option value="التحسيس بمخاطر المخدرات">التحسيس بمخاطر المخدرات</option>
                                      <option value="التحسيس بمخاطر مشروب اميلا">التحسيس بمخاطر مشروب اميلا</option>
                                      <option value="القبول و التوجيه فى السنة اولى ثانوي">القبول و التوجيه فى السنة اولى ثانوي</option>
                                      <option value="اهمية الرياضيات فى الحياة">اهمية الرياضيات فى الحياة</option>
                                      <option value="كيف استعد لامتحان ش ت م">كيف استعد لامتحان ش ت م</option>
                                      <option value="معا من اجل مستقبل زاهر">معا من اجل مستقبل زاهر</option>
                                      <option value="حدد هدفك لبناء مشروعك المستقبلى">حدد هدفك لبناء مشروعك المستقبلى</option>
                                      <option value="كيف نستعد لامتحان شهادة التعليم المتوسط">كيف نستعد لامتحان شهادة التعليم المتوسط</option>
                                      <option value="حقق نجاحك">حقق نجاحك</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell', width: '15%', minWidth: '120px' }}>
                                  <div className="relative h-full flex items-center justify-center">
                                    <textarea
                                    value={item.quantity}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'quantity', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent text-sm resize-none pr-6"
                                      style={{ 
                                        minHeight: '60px', 
                                        lineHeight: '1.4',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                      rows={3}
                                      placeholder="اكتب أو اختر الفئة المستهدفة"
                                    />
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const currentValue = item.quantity || '';
                                          const newValue = currentValue ? `${currentValue}\n${e.target.value}` : e.target.value;
                                          informationalDocumentsFunctions.updateItem(item.id, 'quantity', newValue);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="absolute top-0 right-0 w-4 h-full border-none outline-none bg-transparent text-xs opacity-0 cursor-pointer"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <option value="">اختر</option>
                                      <option value="جميع المستويات">جميع المستويات</option>
                                      <option value="السنة الرابعة متوسط">السنة الرابعة متوسط</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell', width: '22%', minWidth: '180px' }}>
                                  <div className="relative h-full flex items-center justify-center">
                                    <textarea
                                    value={item.notes}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'notes', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent text-sm resize-none pr-6"
                                      style={{ 
                                        minHeight: '60px', 
                                        lineHeight: '1.4',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                      rows={3}
                                      placeholder="اكتب أو اختر الهيئة المنجزة"
                                    />
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const currentValue = item.notes || '';
                                          const newValue = currentValue ? `${currentValue}\n${e.target.value}` : e.target.value;
                                          informationalDocumentsFunctions.updateItem(item.id, 'notes', newValue);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="absolute top-0 right-0 w-4 h-full border-none outline-none bg-transparent text-xs opacity-0 cursor-pointer"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <option value="">اختر</option>
                                      <option value="مركز التوجيه المدرسى و المهنى لولاية مستغانم">مركز التوجيه المدرسى و المهنى لولاية مستغانم</option>
                                      <option value="مديرية التربية لولاية مستغانم">مديرية التربية لولاية مستغانم</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell', width: '12%', minWidth: '100px' }}>
                                  <div className="relative h-full flex items-center justify-center">
                                    <textarea
                                    value={item.distributionDate}
                                    onChange={(e) => informationalDocumentsFunctions.updateItem(item.id, 'distributionDate', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent text-sm resize-none pr-6"
                                      style={{ 
                                        minHeight: '60px', 
                                        lineHeight: '1.4',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                      rows={3}
                                      placeholder="اكتب أو اختر تاريخ الإنجاز"
                                    />
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const currentValue = item.distributionDate || '';
                                          const newValue = currentValue ? `${currentValue}\n${e.target.value}` : e.target.value;
                                          informationalDocumentsFunctions.updateItem(item.id, 'distributionDate', newValue);
                                          e.target.value = '';
                                        }
                                      }}
                                      className="absolute top-0 right-0 w-4 h-full border-none outline-none bg-transparent text-xs opacity-0 cursor-pointer"
                                      style={{ fontSize: '10px' }}
                                    >
                                      <option value="">اختر</option>
                                      <option value="يناير">يناير</option>
                                      <option value="فبراير">فبراير</option>
                                      <option value="مارس">مارس</option>
                                      <option value="أبريل">أبريل</option>
                                      <option value="مايو">مايو</option>
                                      <option value="يونيو">يونيو</option>
                                      <option value="يوليو">يوليو</option>
                                      <option value="أغسطس">أغسطس</option>
                                      <option value="سبتمبر">سبتمبر</option>
                                      <option value="أكتوبر">أكتوبر</option>
                                      <option value="نوفمبر">نوفمبر</option>
                                      <option value="ديسمبر">ديسمبر</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center no-print" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell', width: '8%', minWidth: '80px' }}>
                                  <button
                                    onClick={() => informationalDocumentsFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذا السند"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-4">
                      <h4 className="text-lg font-bold mb-2 text-right">ملاحظات</h4>
                      <AutoResizeTextarea className="w-full border border-gray-300 rounded p-2 text-right" placeholder="ملاحظات إضافية حول نشاطات الإعلام" />
                    </div>
                  </div>
                </div>

                {/* Fourth Page - Blank Page (intentionally empty for custom content) */}
                <div
                  className="report-page bg-white p-6 rounded-lg"
                  style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}
                >
                  <div className="w-full h-full" dir="rtl">
                    {/* هذه الصفحة فارغة عمداً لإضافة محتوى لاحقاً */}
                  </div>
                </div>
                {/* Fifth Page - Other Means, Vocational Info, Coordination */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* B. Other Means */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">ب - وسائل أخرى :</h3>
                      <AutoResizeTextarea className="w-full border border-gray-300 rounded p-2 text-right" placeholder=".......................................................... / .......................................................... / .........................................................." />
                    </div>

                    {/* 2. Vocational Information */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">2- الإعلام المهني :</h3>
                      <h4 className="text-lg font-bold mb-3 text-right">مؤسسات التعليم و التكوين المهنيين بالولاية :</h4>
                      
                      {/* Contrôles pour ajouter/supprimer des institutions */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={fillTableAutomatically}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          title="ملء الجدول تلقائياً ببيانات افتراضية"
                        >
                          <FileText className="w-4 h-4" />
                          ملء تلقائي
                        </button>
                        <button
                          onClick={generateRandomInstitutions}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          title="إنشاء بيانات عشوائية متنوعة"
                        >
                          <Target className="w-4 h-4" />
                          بيانات عشوائية
                        </button>
                        <button
                          onClick={exportInstitutions}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={importInstitutions}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                        <button
                          onClick={addVocationalInstitution}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة مؤسسة جديدة"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة مؤسسة
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">المؤسسة</th>
                              <th className="border border-gray-400 p-2 text-center">تكوين محلي</th>
                              <th className="border border-gray-400 p-2 text-center">تكوين جهوي</th>
                              <th className="border border-gray-400 p-2 text-center">تكوين وطني</th>
                              <th className="border border-gray-400 p-2 text-center">المستوى المطلوب</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vocationalInstitutions.map((institution, _index) => (
                              <tr key={institution.id}>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={institution.name}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'name', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                    placeholder="اسم المؤسسة"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="checkbox"
                                    checked={institution.localTraining}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'localTraining', e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="checkbox"
                                    checked={institution.regionalTraining}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'regionalTraining', e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="checkbox"
                                    checked={institution.nationalTraining}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'nationalTraining', e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center">
                                  <input
                                    type="text"
                                    value={institution.requiredLevel}
                                    onChange={(e) => updateVocationalInstitution(institution.id, 'requiredLevel', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent text-xs py-0"
                                    placeholder="المستوى المطلوب"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => removeVocationalInstitution(institution.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Coordination with Departments */}
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-right">3- التنسيق مع مصالح التعليم و التكوين المهنيين :</h3>

                      {/* A. Correspondence */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold mb-2 text-right">أ- مراسلة</h4>
                        
                        {/* Boutons de contrôle pour la coordination */}
                        <div className="mb-4 flex justify-end gap-2 no-print">
                          <button
                            onClick={coordinationFunctions.addItem}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            title="إضافة مراسلة جديدة"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة مراسلة
                          </button>
                          <button
                            onClick={() => coordinationFunctions.exportData('coordination_data.json')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            title="تصدير البيانات إلى ملف JSON"
                          >
                            <Download className="w-4 h-4" />
                            تصدير
                          </button>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                            <Upload className="w-4 h-4" />
                            استيراد
                            <input
                              type="file"
                              accept=".json"
                              onChange={coordinationFunctions.importData}
                              className="hidden"
                            />
                          </label>
                          <button
                            onClick={coordinationFunctions.clearTable}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            title="مسح جميع البيانات من الجدول"
                          >
                            <X className="w-4 h-4" />
                            مسح الجدول
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-400 text-base">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-2 text-center w-20">الرقم</th>
                                <th className="border border-gray-400 p-2 text-center">نوع التنسيق</th>
                                <th className="border border-gray-400 p-2 text-center">موضوع التنسيق</th>
                                <th className="border border-gray-400 p-2 text-center w-36">التاريخ</th>
                                <th className="border border-gray-400 p-2 text-center">ملاحظات</th>
                                <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {coordinationData.map((item) => (
                                <tr key={item.id}>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.number}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'number', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.coordinationType}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'coordinationType', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="نوع التنسيق"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.coordinationSubject}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'coordinationSubject', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="موضوع التنسيق"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.date}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'date', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="التاريخ"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.notes}
                                      onChange={(e) => coordinationFunctions.updateItem(item.id, 'notes', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="ملاحظات"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center no-print">
                                    <button
                                      onClick={() => coordinationFunctions.removeItem(item.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                      title="حذف هذه المراسلة"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {/* B. Joint Awareness Program */}
                      <div className="mb-6">
                        <h4 className="text-lg font-bold mb-2 text-right">ب- البرنامج الإعلامي التحسيسي المشترك :</h4>
                        
                        {/* Boutons de contrôle pour le programme d'information */}
                        <div className="mb-4 flex justify-end gap-2 no-print">
                          <button
                            onClick={awarenessProgramFunctions.addItem}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            title="إضافة نشاط جديد"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة نشاط
                          </button>
                          <button
                            onClick={() => awarenessProgramFunctions.exportData('awareness_program_data.json')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            title="تصدير البيانات إلى ملف JSON"
                          >
                            <Download className="w-4 h-4" />
                            تصدير
                          </button>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                            <Upload className="w-4 h-4" />
                            استيراد
                            <input
                              type="file"
                              accept=".json"
                              onChange={awarenessProgramFunctions.importData}
                              className="hidden"
                            />
                          </label>
                          <button
                            onClick={awarenessProgramFunctions.clearTable}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                            title="مسح جميع البيانات من الجدول"
                          >
                            <X className="w-4 h-4" />
                            مسح الجدول
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-400 text-base">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-2 text-center w-20">الرقم</th>
                                <th className="border border-gray-400 p-2 text-center">المستوى المستهدف</th>
                                <th className="border border-gray-400 p-2 text-center">النشاط المبرمج</th>
                                <th className="border border-gray-400 p-2 text-center w-36">تاريخ الإنجاز</th>
                                <th className="border border-gray-400 p-2 text-center">الملاحظات</th>
                                <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {awarenessProgramData.map((item) => (
                                <tr key={item.id}>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.number}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'number', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.targetLevel}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'targetLevel', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="المستوى المستهدف"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.plannedActivity}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'plannedActivity', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="النشاط المبرمج"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.completionDate}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'completionDate', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="تاريخ الإنجاز"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                    <input
                                      type="text"
                                      value={item.notes}
                                      onChange={(e) => awarenessProgramFunctions.updateItem(item.id, 'notes', e.target.value)}
                                      className="w-full text-center border-none outline-none bg-transparent"
                                      placeholder="الملاحظات"
                                    />
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center no-print">
                                    <button
                                      onClick={() => awarenessProgramFunctions.removeItem(item.id)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                      title="حذف هذا النشاط"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      حذف
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* C. Answers */}
                      <div>
                        <h4 className="text-lg font-bold mb-2 text-right">ج- الإجابات :</h4>
                        <AutoResizeTextarea className="w-full border border-gray-300 rounded p-2 text-right" placeholder="........................................................................................................................" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Fifth Page - Difficulties, Proposals, Student & Parents Info */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* D. Difficulties */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">د- الصعوبات :</h3>
                      <AutoResizeTextarea className="w-full border border-gray-300 rounded p-2 text-right" placeholder={currentCycle === 'ثانوي' ? 'مثال: توقيت فتح التسجيلات و غلقها لا يتماشى مع أوقات الطلاب ...' : 'مثال: توقيت فتح التسجيلات و غلقها لا يتماشى مع أوقات التلاميذ ...'} />
                    </div>

                    {/* E. Proposals and Comments */}
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-right">هـ - الاقتراحات و التعليق :</h3>
                      <AutoResizeTextarea className="w-full border border-gray-300 rounded p-2 text-right" placeholder="مثال: التنسيق بين وزارة التربية و التكوين المهني و وضع رزنامة تتماشى مع فتح الدورات ..." />
                    </div>

                    {/* 4. Students Information */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">{currentCycle === 'ثانوي' ? '4- إعلام الطلاب :' : '4- إعلام التلاميذ :'}</h3>
                      <p className="mb-3 text-right">{currentCycle === 'ثانوي' ? 'متوسط تكفل المستشار بالطلاب هو :' : 'متوسط تكفل المستشار بالتلاميذ هو :'}</p>
                      
                      {/* Boutons de contrôle pour l'information des élèves */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={studentInfoFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة مستوى جديد"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة مستوى
                        </button>
                        <button
                          onClick={() => studentInfoFunctions.exportData('student_info_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={studentInfoFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={studentInfoFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">المستوى</th>
                              <th className="border border-gray-400 p-2 text-center">{currentCycle === 'ثانوي' ? 'عدد الطلاب المسجلين' : 'عدد التلاميذ المسجلين'}</th>
                              <th className="border border-gray-400 p-2 text-center">الدخل و المتابعة للتلاميذ</th>
                              <th className="border border-gray-400 p-2 text-center">عدد التدخلات</th>
                              <th className="border border-gray-400 p-2 text-center">الهدف</th>
                              <th className="border border-gray-400 p-2 text-center">نسبة المستفيدين</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentInfoData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.level}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'level', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المستوى"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.registeredStudents}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'registeredStudents', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder={currentCycle === 'ثانوي' ? 'عدد الطلاب' : 'عدد التلاميذ'}
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.followUp}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'followUp', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المتابعة"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.interventions}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'interventions', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="عدد التدخلات"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.objective}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'objective', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الهدف"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.beneficiaryPercentage}
                                    onChange={(e) => studentInfoFunctions.updateItem(item.id, 'beneficiaryPercentage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="نسبة المستفيدين"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => studentInfoFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذا المستوى"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* 5. Parents Information */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">{currentCycle === 'ثانوي' ? '5- إعلام أولياء الطلاب :' : '5- إعلام أولياء التلاميذ :'}</h3>
                      <p className="mb-3 text-right">{currentCycle === 'ثانوي' ? 'نسبة حضور و استجابة الأولياء مقارنة بعدد الطلاب المسجلين :' : 'نسبة حضور و استجابة الأولياء مقارنة بعدد التلاميذ المسجلين :'}</p>
                      <div className="mb-3 flex justify-end gap-2 no-print">
                        <button
                          onClick={parentAttendanceFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة سطر"
                        >
                          <Plus className="w-4 h-4" /> إضافة سطر
                        </button>
                        <button
                          onClick={() => parentAttendanceFunctions.exportData('parent_attendance_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات"
                        >
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={parentAttendanceFunctions.importData} className="hidden" />
                        </label>
                        <button
                          onClick={parentAttendanceFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح الجدول"
                        >
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">المستوى</th>
                              <th className="border border-gray-400 p-2 text-center">{currentCycle === 'ثانوي' ? 'عدد الطلاب المسجلين' : 'عدد التلاميذ المسجلين'}</th>
                              <th className="border border-gray-400 p-2 text-center" colSpan={2}>عدد اللقاءات مع الأولياء</th>
                              <th className="border border-gray-400 p-2 text-center">المجموع</th>
                              <th className="border border-gray-400 p-2 text-center">نسبة حضور الأولياء</th>
                              <th className="border border-gray-400 p-2 text-center">الملاحظات</th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center">الفردية</th>
                              <th className="border border-gray-400 p-2 text-center">الجماعية</th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                              <th className="border border-gray-400 p-2 text-center"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {parentAttendanceData.map((row) => (
                              <tr key={row.id}>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input type="text" value={row.level} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'level',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input type="text" value={row.registeredStudents} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'registeredStudents',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input type="text" value={row.individualMeetings} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'individualMeetings',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input type="text" value={row.groupMeetings} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'groupMeetings',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input type="text" value={row.total} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'total',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input type="text" value={row.attendancePercentage} onChange={(e)=>parentAttendanceFunctions.updateItem(row.id,'attendancePercentage',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button onClick={()=>parentAttendanceFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                    <Trash2 className="w-3 h-3" /> حذف
                                  </button>
                                </td>
                            </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p className="mb-2 text-right">{currentCycle === 'ثانوي' ? 'أنواع الوثائق الإعلامية التي وزعت على أولياء الطلاب في المؤسسة :' : 'أنواع الوثائق الإعلامية التي وزعت على أولياء التلاميذ في المؤسسة :'}</p>
                      <div className="mb-3 flex justify-end gap-2 no-print">
                        <button
                          onClick={informationalDocumentsFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة وثيقة"
                        >
                          <Plus className="w-4 h-4" /> إضافة وثيقة
                        </button>
                        <button
                          onClick={() => informationalDocumentsFunctions.exportData('informational_documents_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات"
                        >
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={informationalDocumentsFunctions.importData} className="hidden" />
                        </label>
                        <button
                          onClick={informationalDocumentsFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح الجدول"
                        >
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center">عنوان الوثيقة</th>
                              <th className="border border-gray-400 p-2 text-center">المستوى</th>
                              <th className="border border-gray-400 p-2 text-center">عدد النسخ</th>
                              <th className="border border-gray-400 p-2 text-center">{currentCycle === 'ثانوي' ? '% من عدد الطلاب' : '% من عدد التلاميذ'}</th>
                            </tr>
                          </thead>
                          <tbody>
                             {informationalDocumentsData.map((row) => (
                               <tr key={row.id}>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                   <input type="text" value={row.documentType} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'documentType',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="عنوان الوثيقة" />
                                 </td>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                   <input type="text" value={row.targetLevel} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'targetLevel',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="المستوى" />
                                 </td>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                   <input type="text" value={row.quantity} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'quantity',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="عدد النسخ" />
                                 </td>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                   <input type="text" value={row.notes} onChange={(e)=>informationalDocumentsFunctions.updateItem(row.id,'notes',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="%" />
                                 </td>
                                 <td className="border border-gray-400 p-2 text-center no-print">
                                   <button onClick={()=>informationalDocumentsFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                     <Trash2 className="w-3 h-3" /> حذف
                                   </button>
                                 </td>
                            </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sixth Page - National Media Week and Documentation Cell */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* 6. National Media Week */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">6- الأسبوع الوطني للإعلام :</h3>
                      
                      {/* Boutons de contrôle pour la semaine nationale d'information */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={nationalWeekFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة نشاط جديد"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة نشاط
                        </button>
                        <button
                          onClick={() => nationalWeekFunctions.exportData('national_week_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={nationalWeekFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={nationalWeekFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-1/2">الوسائل المعتمدة</th>
                              <th className="border border-gray-400 p-2 text-center w-1/2">المحاور المعالجة</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nationalWeekData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.activityName}
                                    onChange={(e) => nationalWeekFunctions.updateItem(item.id, 'activityName', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="الوسائل المعتمدة"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.targetLevel}
                                    onChange={(e) => nationalWeekFunctions.updateItem(item.id, 'targetLevel', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المحاور المعالجة"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => nationalWeekFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذا النشاط"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-2 text-right">
                        <p className="font-bold">- الأثر الذي خلفته هذه النشاطات :</p>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">{currentCycle === 'ثانوي' ? 'أ- عند الطلاب المتمدرسين :' : 'أ- عند التلاميذ المتمدرسين :'}</span>
                          <AutoResizeTextarea className="flex-1 border border-gray-300 rounded p-2 text-right" placeholder="تحديد المسار الدراسي من خلال التعرف و أخذ صورة عن المسارات المستقبلية لتحديد المشروع الشخصي" />
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">ب- عند الجمهور الواسع :</span>
                          <AutoResizeTextarea className="flex-1 border border-gray-300 rounded p-2 text-right" placeholder="تمكين الجمهور من التعرف على مختلف المسارات الدراسية و النوافذ الجامعية و اعلامهم بكل جديد عن سوق العمل ..." />
                        </div>
                      </div>
                    </div>

                    {/* 7. Documentation and Media Cell */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-3 text-right">7- خلية التوثيق و الإعلام :</h3>
                        <div className="text-center border border-gray-300 rounded p-3 w-full">في {getCycleConfig(currentCycle).schoolName}</div>
                    </div>
                  </div>
                </div>
                {/* Seventh Page - Guidance Field */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* Title */}
                    <div className="text-center my-8">
                      <h2 className="text-3xl font-bold">في مجال التوجيه</h2>
                    </div>

                    {/* 1. Acceptance into 1st year secondary */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">1- القبول في السنة الأولى ثانوي :</h3>
                      
                      {/* Boutons de contrôle pour l'admission en première année secondaire */}
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button
                          onClick={highSchoolAdmissionYearFunctions.addItem}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title="إضافة سنة دراسية جديدة"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة سنة
                        </button>
                        <button
                          onClick={() => highSchoolAdmissionYearFunctions.exportData('high_school_admission_year_data.json')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          title="تصدير البيانات إلى ملف JSON"
                        >
                          <Download className="w-4 h-4" />
                          تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" />
                          استيراد
                          <input
                            type="file"
                            accept=".json"
                            onChange={highSchoolAdmissionYearFunctions.importData}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={highSchoolAdmissionYearFunctions.clearTable}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          title="مسح جميع البيانات من الجدول"
                        >
                          <X className="w-4 h-4" />
                          مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>السنة الدراسية</th>
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>في السنة الرابعة متوسط</th>
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>المقبولون في السنة الأولى ثانوي</th>
                              <th className="border border-gray-400 p-2 text-center" rowSpan={2}>النسبة</th>
                              <th className="border border-gray-400 p-2 text-center" colSpan={2}>أعلى معدل القبول</th>
                              <th className="border border-gray-400 p-2 text-center" colSpan={2}>أدنى معدل القبول</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-400 p-2 text-center">المعدل</th>
                              <th className="border border-gray-400 p-2 text-center">التلميذ</th>
                              <th className="border border-gray-400 p-2 text-center">المعدل</th>
                              <th className="border border-gray-400 p-2 text-center">التلميذ</th>
                              <th className="border border-gray-400 p-2 text-center no-print"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {highSchoolAdmissionYearData.map((item) => (
                              <tr key={item.id}>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.academicYear}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'academicYear', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="السنة الدراسية"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.fourthYearCount}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'fourthYearCount', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="في السنة الرابعة متوسط"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.admittedCount}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'admittedCount', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="المقبولون في السنة الأولى ثانوي"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.percentage}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'percentage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="النسبة"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.highestAverage}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'highestAverage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="أعلى معدل"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.highestStudent}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'highestStudent', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="التلميذ"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.lowestAverage}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'lowestAverage', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="أدنى معدل"
                                  />
                                </td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}>
                                  <input
                                    type="text"
                                    value={item.lowestStudent}
                                    onChange={(e) => highSchoolAdmissionYearFunctions.updateItem(item.id, 'lowestStudent', e.target.value)}
                                    className="w-full text-center border-none outline-none bg-transparent"
                                    placeholder="التلميذ"
                                  />
                                </td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button
                                    onClick={() => highSchoolAdmissionYearFunctions.removeItem(item.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                                    title="حذف هذه السنة الدراسية"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* 2. Preliminary and Final Orientation */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-right">2- التوجيه المسبق و التوجيه النهائي :</h3>
                      <h4 className="text-lg font-bold mb-2 text-right">1- التوجيه نحو السنة الأولى ثانوي :</h4>
                      <div className="mb-3 flex justify-end gap-2 no-print">
                        <button onClick={orientationSummaryFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة سطر">
                          <Plus className="w-4 h-4" /> إضافة سطر
                        </button>
                        <button onClick={() => { const dataStr = JSON.stringify(orientationSummaryRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'orientation_summary.json'; link.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setOrientationSummaryRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                        </label>
                        <button onClick={orientationSummaryFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-40">التوجيه</th>
                              <th className="border border-gray-400 p-2 text-center">مشترك - آداب</th>
                              <th className="border border-gray-400 p-2 text-center">ج.م. علوم و تكنولوجيا</th>
                              <th className="border border-gray-400 p-2 text-center w-20">المجموع</th>
                               <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                             {orientationSummaryRows.map((row)=>(
                               <tr key={row.id}>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.label} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'label',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.commonArts} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'commonArts',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.sciencesTech} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'sciencesTech',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.total} onChange={(e)=>orientationSummaryFunctions.updateItem(row.id,'total',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                 <td className="border border-gray-400 p-2 text-center no-print">
                                   <button onClick={()=>orientationSummaryFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                     <Trash2 className="w-3 h-3" /> حذف
                                   </button>
                                 </td>
                            </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Eighth Page - Orientation Statistics */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-6" dir="rtl">
                    <div className="text-center my-4">
                      <h3 className="text-2xl font-bold">3- إحصائيات حول عملية التوجيه للسنة الدراسية 2022–2023</h3>
                    </div>

                    <h4 className="text-lg font-bold text-right">- الرغبة و التوجيه النهائي حسب الجنس :</h4>
                    <p className="text-right text-sm text-gray-700">- السنة الرابعة متوسط</p>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400 text-base">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-2 text-center" rowSpan={2}>التوجيه</th>
                            <th className="border border-gray-400 p-2 text-center" rowSpan={2}>معطيات</th>
                            <th className="border border-gray-400 p-2 text-center" colSpan={2}>إناث</th>
                            <th className="border border-gray-400 p-2 text-center" colSpan={2}>ذكور</th>
                            <th className="border border-gray-400 p-2 text-center" colSpan={2}>المجموع</th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-400 p-2 text-center">الرغبة</th>
                            <th className="border border-gray-400 p-2 text-center">توجيه نهائي</th>
                            <th className="border border-gray-400 p-2 text-center">الرغبة</th>
                            <th className="border border-gray-400 p-2 text-center">توجيه نهائي</th>
                            <th className="border border-gray-400 p-2 text-center">الرغبة</th>
                            <th className="border border-gray-400 p-2 text-center">توجيه نهائي</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row group: ج.م. آداب */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>ج.م. آداب</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">عدد</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="9" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="9" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="3" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="3" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="12" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="12" /></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">النسبة</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="34.71" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="26.47" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="11.11" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="11.11" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="35.29" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="35.29" /></td>
                          </tr>

                          {/* Row group: ج.م. علوم و تكنولوجيا */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>ج.م. علوم و تكنولوجيا</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">عدد</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="7" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="7" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="15" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="15" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="22" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="22" /></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">النسبة</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="26.92" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="20.58" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="55.55" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="55.55" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="64.71" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="64.71" /></td>
                          </tr>

                          {/* Row group: الإعادة */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>الإعادة</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">عدد</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="6" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="6" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="9" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="9" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="15" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="15" /></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">النسبة</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="23.07" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="23.07" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="33.33" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="33.33" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="28.30" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="28.30" /></td>
                          </tr>

                          {/* Row group: تعليم مهني */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>تعليم مهني</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">عدد</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">النسبة</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">00</td>
                          </tr>

                          {/* Row group: تكوين مهني */}
                          <tr>
                            <td className="border border-gray-400 p-2 text-center" rowSpan={2}>تكوين مهني</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">عدد</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="02" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="02" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="02" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="02" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">04</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">04</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">النسبة</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="7.69" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="7.69" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="7.40" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle"><AutoResizeTextarea className="text-center" placeholder="7.40" /></td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">7.54</td>
                            <td className="border border-gray-400 px-1 py-1 text-center align-middle">7.54</td>
                          </tr>

                          {/* Totals row */}
                          <tr className="bg-yellow-100">
                            <td className="border border-gray-400 p-2 text-center font-bold" colSpan={2}>جميع الإعداد</td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><AutoResizeTextarea className="text-center" placeholder="26" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><AutoResizeTextarea className="text-center" placeholder="26" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><AutoResizeTextarea className="text-center" placeholder="27" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold"><AutoResizeTextarea className="text-center" placeholder="27" /></td>
                            <td className="border border-gray-400 p-2 text-center font-bold">53</td>
                            <td className="border border-gray-400 p-2 text-center font-bold">53</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="text-right text-base mt-8">
                      <span className="font-semibold">الكفل النفسي مركز إجراء الامتحانات الرسمية :</span>
                    </div>
                  </div>
                </div>
                {/* Ninth Page - Evaluation Field */}
                <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                  <div className="space-y-8" dir="rtl">
                    {/* Psychological Support Table */}
                    <div>
                      <div className="mb-4 flex justify-end gap-2 no-print">
                        <button onClick={examPsychSupportFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة سطر">
                          <Plus className="w-4 h-4" /> إضافة سطر
                        </button>
                        <button onClick={() => { const dataStr = JSON.stringify(examPsychSupportRows, null, 2); const dataBlob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = 'exam_psych_support.json'; link.click(); URL.revokeObjectURL(url); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                          <Download className="w-4 h-4" /> تصدير
                        </button>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> استيراد
                          <input type="file" accept=".json" onChange={(e)=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ try{ const content=ev.target?.result as string; const imported=JSON.parse(content); if(Array.isArray(imported)){ setExamPsychSupportRows(imported); } }catch{ alert('خطأ في قراءة الملف.'); } }; reader.readAsText(file); }} className="hidden" />
                        </label>
                        <button onClick={examPsychSupportFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                          <X className="w-4 h-4" /> مسح الجدول
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400 text-base">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-400 p-2 text-center w-16">الرقم</th>
                              <th className="border border-gray-400 p-2 text-center">نوع الحالة أو الاضطراب</th>
                              <th className="border border-gray-400 p-2 text-center w-16">العدد</th>
                              <th className="border border-gray-400 p-2 text-center">الشعبة</th>
                              <th className="border border-gray-400 p-2 text-center">اختبار المادة</th>
                              <th className="border border-gray-400 p-2 text-center">محتوى التدخل النفسي أو التكفل النفسي</th>
                              <th className="border border-gray-400 p-2 text-center">ملاحظات عامة</th>
                              <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examPsychSupportRows.map((row)=> (
                              <tr key={row.id}>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.number} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'number',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.caseType} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'caseType',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.count} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'count',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.stream} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'stream',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.subject} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'subject',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.care} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'care',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 px-2 py-4 text-center align-middle" style={{ minHeight: '80px', verticalAlign: 'middle', display: 'table-cell' }}><input type="text" value={row.notes} onChange={(e)=>examPsychSupportFunctions.updateItem(row.id,'notes',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" /></td>
                                <td className="border border-gray-400 p-2 text-center no-print">
                                  <button onClick={()=>examPsychSupportFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                    <Trash2 className="w-3 h-3" /> حذف
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Evaluation Field Title */}
                    <div className="text-center my-6">
                      <h2 className="text-3xl font-bold">في مجال التقويم</h2>
                    </div>

                    {/* 1. Analytical studies */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-right">1. الدراسات التحليلية للنتائج الدراسية :</h3>
                      <div className="ml-4 space-y-2 text-right">
                        <h4 className="text-lg font-bold">1.1 الدراسات المنجزة خلال هذه السنة :</h4>
                        <ul className="list-disc pr-6 space-y-1">
                          <li>تحليل نتائج شهادة التعليم المتوسط دورة جوان 2024 و مقاربتها بالتقويم المستمر</li>
                        </ul>
                        <h4 className="text-lg font-bold">2.1 تحليل النتائج الفصلية و نتائج الانتقال من مستوى تعليمي إلى آخر :</h4>
                        <ul className="list-disc pr-6 space-y-1">
                          <li>تحليل نتائج الفصول الدراسية الثلاث للسنة الدراسية 2023/2024</li>
                        </ul>
                        <h4 className="text-lg font-bold">3.1 عمليات أخرى متعلقة بالتقويم :</h4>
                        <ul className="list-disc pr-6 space-y-1">
                          <li>{currentCycle === 'ثانوي' ? 'حصيلة نتائج الطلاب للتعليم الثانوي للفصول الثلاث' : 'حصيلة نتائج التلاميذ للتعليم المتوسط للفصول الثلاث'}</li>
                          <li>{currentCycle === 'ثانوي' ? 'تحليل نتائج الطلاب المتمدرسين و الموجهين للسنة الدراسية الجارية 2023/2024' : 'تحليل نتائج التلاميذ المتمدرسين و الموجهين للسنة الدراسية الجارية 2023/2024'}</li>
                          <li>متابعة نتائج تلاميذ السنة الرابعة متوسط 2023/2024</li>
                        </ul>
                      </div>
                    </div>

                    {/* 4. Meetings / Seminars */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-right">4.1 اللقاءات - الندوات - الأيام الدراسية :</h3>
                      <p className="text-right">ندوة بثانوية زروقي إبن الدين بمستغانم حول المعالجة البيداغوجية لتلاميذ السنة الأولى متوسط للسنة الدراسية 2023/2024</p>
                    </div>
                  </div>
                </div>

                {/* Fifth Page - Training, Mediation and Guidance Activities */}
                <div
                  className="report-page bg-white p-6 rounded-lg"
                  style={{
                    minHeight: '297mm',
                    width: '210mm',
                    margin: '0 auto',
                    position: 'relative',
                    padding: '5mm',
                  }}
                >
                  <div className="space-y-6" dir="rtl">
                    {/* Page Title */}
                    <div className="mb-4 text-right">
                      <h3 className="text-xl font-bold mb-2">5 - أنشطة التكوين والوساطة والمتابعة النفسية</h3>
                      <p className="text-sm text-gray-600">
                        يسجل في هذا الجدول أهم الأيام التكوينية، الندوات، أعمال الوساطة والمتابعة النفسية المنجزة خلال السنة.
                      </p>
                    </div>

                    {/* Activities Table */}
                    <div className="mb-3 flex justify-end gap-2 no-print">
                      <button onClick={psychologicalActivitiesFunctions.addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" title="إضافة نشاط">
                        <Plus className="w-4 h-4" /> إضافة نشاط
                      </button>
                      <button onClick={() => psychologicalActivitiesFunctions.exportData('psychological_activities.json')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm" title="تصدير">
                        <Download className="w-4 h-4" /> تصدير
                      </button>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm cursor-pointer">
                        <Upload className="w-4 h-4" /> استيراد
                        <input type="file" accept=".json" onChange={psychologicalActivitiesFunctions.importData} className="hidden" />
                      </label>
                      <button onClick={psychologicalActivitiesFunctions.clearTable} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm" title="مسح الجدول">
                        <X className="w-4 h-4" /> مسح الجدول
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400 text-base">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-2 text-center">النشاط</th>
                            <th className="border border-gray-400 p-2 text-center">المكان/المؤسسة</th>
                            <th className="border border-gray-400 p-2 text-center">المشرف</th>
                            <th className="border border-gray-400 p-2 text-center w-36">التاريخ</th>
                            <th className="border border-gray-400 p-2 text-center">ملاحظات</th>
                            <th className="border border-gray-400 p-2 text-center no-print">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {psychologicalActivitiesData.map((row) => (
                            <tr key={row.id}>
                              <td className="border border-gray-400 px-1 py-1 text-center align-middle"><input type="text" value={row.activityType} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'activityType',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="مثال: يوم تكويني حول الوساطة/التوجيه ..." /></td>
                              <td className="border border-gray-400 px-1 py-1 text-center align-middle"><input type="text" value={row.targetGroup} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'targetGroup',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="اسم المؤسسة/المكان" /></td>
                              <td className="border border-gray-400 px-1 py-1 text-center align-middle"><input type="text" value={row.objectives} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'objectives',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="المديرية/المركز/المؤطر" /></td>
                              <td className="border border-gray-400 px-1 py-1 text-center align-middle"><input type="text" value={row.date} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'date',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="YYYY/MM/DD" /></td>
                              <td className="border border-gray-400 px-1 py-1 text-center align-middle"><input type="text" value={row.notes} onChange={(e)=>psychologicalActivitiesFunctions.updateItem(row.id,'notes',e.target.value)} className="w-full text-center border-none outline-none bg-transparent" placeholder="/" /></td>
                              <td className="border border-gray-400 p-2 text-center no-print">
                                <button onClick={()=>psychologicalActivitiesFunctions.removeItem(row.id)} className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs" title="حذف">
                                  <Trash2 className="w-3 h-3" /> حذف
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                      <h4 className="text-lg font-bold mb-2 text-right">ملاحظات إضافية</h4>
                      <textarea
                        className="w-full border border-gray-300 rounded p-2 text-right"
                        rows={4}
                        placeholder="تفاصيل أخرى حول الأنشطة، نسب المشاركة، أثر العمليات، ..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
               <button
                 onClick={() => setShowAnnualPreview(false)}
                 className="px-4 py-2 text-gray-600 hover:text-gray-800"
               >
                 إلغاء
               </button>
               <button
                onClick={() => {}}
                 className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
               >
                 <Save className="w-5 h-5" />
                 <span>حفظ كـ PDF</span>
               </button>
             </div>
           </div>
         </div>
       )}
       {/* Objectives (تحليل النتائج) Report Picker Modal */}
       {showObjectivesPreview && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto" dir="rtl">
             <div className="flex justify-between items-center mb-6">
               <button onClick={() => setShowObjectivesPreview(false)} className="text-gray-500 hover:text-gray-700">
                 <X className="w-6 h-6" />
               </button>
               <div className="text-xl font-bold">تقرير تحليل النتائج - نماذج محفوظة</div>
             </div>
             <div className="space-y-4">
               {reports.filter(r => r.type === 'تقرير تحليل النتائج').length === 0 && (
                 <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                   <div className="text-lg font-medium mb-2">لا توجد نماذج محفوظة بعد</div>
                   <div className="text-sm">قم بإنشاء تقرير في قسم "تحليل النتائج" أولاً</div>
                 </div>
               )}
               
              {/* Organiser les rapports par trimestre */}
              {(() => {
                 const analysisReports = reports.filter(r => r.type === 'تقرير تحليل النتائج');
                 const reportsBySemester = {
                   'الفصل الأول': analysisReports.filter(r => r.content?.semester === 'الفصل الأول'),
                   'الفصل الثاني': analysisReports.filter(r => r.content?.semester === 'الفصل الثاني'),
                   'الفصل الثالث': analysisReports.filter(r => r.content?.semester === 'الفصل الثالث'),
                   'النتائج السنوية': analysisReports.filter(r => r.content?.semester === 'النتائج السنوية')
                 };
                 
                return (
                  <>
                    {Object.entries(reportsBySemester).map(([semester, semesterReports]) => {
                   if (semesterReports.length === 0) return null;
                   
                   return (
                     <div key={semester} className="border rounded-lg">
                       <div className="bg-blue-50 px-4 py-3 border-b">
                         <h3 className="font-semibold text-blue-800 text-lg">{semester}</h3>
                         <p className="text-sm text-blue-600">{semesterReports.length} تقرير محفوظ</p>
                       </div>
                       <div className="divide-y">
                        {semesterReports.map((r) => (
                           <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                             <div className="text-right flex-1">
                               <div className="font-semibold text-gray-900">{r.title}</div>
                               <div className="text-sm text-gray-600 mt-1">
                                 المستوى: {r.content?.level || 'غير محدد'} | 
                                 التاريخ: {r.date}
                               </div>
                               {r.content?.totals && (
                                 <div className="text-xs text-gray-500 mt-1">
                                   إجمالي الطلاب: {r.content.totals.totalStudents} | 
                                   المعدل العام: {r.content.average?.toFixed(2) || 'غير محدد'}
                                 </div>
                               )}
                   </div>
                   <div className="flex gap-2">
                               <button
                                 onClick={() => {
                                   // Ouvrir une nouvelle fenêtre avec les graphiques
                                   const win = window.open('', '_blank', 'width=1200,height=800');
                                   if (!win) return;
                                   
                                   const c: any = (r as any).content || {};
                                   const html = `<!doctype html><html lang="ar" dir="rtl"><head>
                                     <meta charset="utf-8" />
                                     <meta name="viewport" content="width=device-width,initial-scale=1" />
                                     <title>${r.title} - الرسوم البيانية</title>
                                     <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                     <style>
                                       body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Tahoma,Arial,sans-serif;padding:20px;color:#111827;background:#f8fafc}
                                       .container{max-width:1200px;margin:0 auto;background:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);padding:24px}
                                       h1{margin:0 0 20px;font-size:28px;color:#1e40af;text-align:center;border-bottom:3px solid #3b82f6;padding-bottom:10px}
                                       .chart-container{background:white;padding:20px;border-radius:8px;margin:20px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
                                       .chart-title{text-align:center;margin-bottom:15px;font-size:18px;font-weight:bold;color:#1e40af}
                                       .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin:20px 0}
                                       .stat-card{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:15px;border-radius:8px;text-align:center}
                                       .stat-number{font-size:24px;font-weight:bold;margin-bottom:5px}
                                       .stat-label{font-size:12px;opacity:0.9}
                                     </style>
                                   </head><body>
                                     <div class="container">
                                       <h1>${r.title} - الرسوم البيانية</h1>
                                       
                                       <div class="stats-grid">
                                         <div class="stat-card">
                                           <div class="stat-number">${c.average?.toFixed(2) || 'غير محدد'}</div>
                                           <div class="stat-label">المعدل العام</div>
                                         </div>
                                         <div class="stat-card">
                                           <div class="stat-number">${c.totals?.totalStudents || 0}</div>
                                           <div class="stat-label">إجمالي الطلاب</div>
                                         </div>
                                         <div class="stat-card" style="background:linear-gradient(135deg,#10b981,#059669)">
                                           <div class="stat-number">${c.totals?.excellent || 0}</div>
                                           <div class="stat-label">ممتاز</div>
                                         </div>
                                         <div class="stat-card" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">
                                           <div class="stat-number">${c.totals?.good || 0}</div>
                                           <div class="stat-label">جيد</div>
                                         </div>
                                         <div class="stat-card" style="background:linear-gradient(135deg,#f59e0b,#d97706)">
                                           <div class="stat-number">${c.totals?.average || 0}</div>
                                           <div class="stat-label">متوسط</div>
                                         </div>
                                         <div class="stat-card" style="background:linear-gradient(135deg,#ef4444,#dc2626)">
                                           <div class="stat-number">${c.totals?.weak || 0}</div>
                                           <div class="stat-label">ضعيف</div>
                                         </div>
                                       </div>
                                       
                                       <div class="chart-container">
                                         <div class="chart-title">توزيع الطلاب حسب المستوى</div>
                                         <canvas id="studentChart" width="400" height="200"></canvas>
                                       </div>
                                       
                                       <div class="chart-container">
                                         <div class="chart-title">معدلات المواد</div>
                                         <canvas id="subjectsChart" width="400" height="200"></canvas>
                                       </div>
                                       
                                       <div class="chart-container">
                                         <div class="chart-title">أفضل الطلاب</div>
                                         <canvas id="topPerformersChart" width="400" height="200"></canvas>
                                       </div>
                                     </div>
                                     <script>
                                       // Graphique de répartition des étudiants
                                       const studentCtx = document.getElementById('studentChart').getContext('2d');
                                       new Chart(studentCtx, {
                                         type: 'bar',
                                         data: {
                                           labels: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'],
                                           datasets: [{
                                             label: 'عدد الطلاب',
                                             data: [${c.totals?.excellent || 0}, ${c.totals?.good || 0}, ${c.totals?.average || 0}, ${c.totals?.weak || 0}],
                                             backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                                             borderColor: ['rgba(34, 197, 94, 1)', 'rgba(59, 130, 246, 1)', 'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)'],
                                             borderWidth: 2
                                           }]
                                         },
                                         options: {
                                           responsive: true,
                                           plugins: {
                                             legend: { display: false }
                                           },
                                           scales: {
                                             y: { beginAtZero: true }
                                           }
                                         }
                                       });
                                       
                                       // Graphique des matières
                                       const subjectsCtx = document.getElementById('subjectsChart').getContext('2d');
                                       const subjectsData = ${JSON.stringify(c.subjects || [])};
                                       new Chart(subjectsCtx, {
                                         type: 'line',
                                         data: {
                                           labels: subjectsData.map(s => s.name),
                                           datasets: [{
                                             label: 'معدل المادة',
                                             data: subjectsData.map(s => s.average),
                                             borderColor: 'rgba(59, 130, 246, 1)',
                                             backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                             borderWidth: 3,
                                             fill: true,
                                             tension: 0.4
                                           }]
                                         },
                                         options: {
                                           responsive: true,
                                           plugins: {
                                             legend: { display: false }
                                           },
                                           scales: {
                                             y: { beginAtZero: true }
                                           }
                                         }
                                       });
                                       // Graphique des meilleurs étudiants
                                       const topPerformersCtx = document.getElementById('topPerformersChart').getContext('2d');
                                       const topPerformersData = ${JSON.stringify(c.topPerformers || [])};
                                       new Chart(topPerformersCtx, {
                                         type: 'bar',
                                         data: {
                                           labels: topPerformersData.slice(0, 10).map(s => s.studentName),
                                           datasets: [{
                                             label: 'المعدل',
                                             data: topPerformersData.slice(0, 10).map(s => s.average),
                                             backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                             borderColor: 'rgba(16, 185, 129, 1)',
                                             borderWidth: 2
                                           }]
                                         },
                                         options: {
                                           responsive: true,
                                           plugins: {
                                             legend: { display: false }
                                           },
                                           scales: {
                                             y: { beginAtZero: true }
                                           }
                                         }
                                       });
                                     </script>
                                   </body></html>`;
                                   win.document.write(html);
                                   win.document.close();
                                   win.focus();
                                 }}
                                 className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                               >
                                 الرسوم البيانية
                               </button>
                     <button
                       onClick={() => {
                         try {
                                     const win = window.open('', '_blank', 'width=1200,height=800');
                           if (!win) return;
                           const c: any = (r as any).content || {};
                                     const html = `<!doctype html><html lang="ar" dir="rtl"><head>
                                       <meta charset="utf-8" />
                                       <meta name="viewport" content="width=device-width,initial-scale=1" />
                             <title>${r.title}</title>
                                       <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                             <style>
                                         body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Tahoma,Arial,sans-serif;padding:16px;color:#111827;background:#f8fafc}
                                         .container{max-width:1200px;margin:0 auto;background:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);padding:24px}
                                         h1{margin:0 0 20px;font-size:28px;color:#1e40af;text-align:center;border-bottom:3px solid #3b82f6;padding-bottom:10px}
                                         .header-info{background:#f1f5f9;padding:16px;border-radius:8px;margin-bottom:24px}
                                         .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}
                                         .info-item{background:white;padding:12px;border-radius:6px;border:1px solid #e2e8f0;text-align:center}
                                         .info-label{font-size:14px;color:#64748b;margin-bottom:4px}
                                         .info-value{font-size:18px;font-weight:bold;color:#1e40af}
                                         .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:20px 0}
                                         .stat-card{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:16px;border-radius:8px;text-align:center}
                                         .stat-card.excellent{background:linear-gradient(135deg,#10b981,#059669)}
                                         .stat-card.good{background:linear-gradient(135deg,#3b82f6,#1d4ed8)}
                                         .stat-card.average{background:linear-gradient(135deg,#f59e0b,#d97706)}
                                         .stat-card.weak{background:linear-gradient(135deg,#ef4444,#dc2626)}
                                         .stat-number{font-size:24px;font-weight:bold;margin-bottom:4px}
                                         .stat-label{font-size:12px;opacity:0.9}
                                         .section{margin:24px 0;padding:20px;border:1px solid #e2e8f0;border-radius:8px;background:#fafafa}
                                         .section h2{color:#1e40af;margin-bottom:16px;font-size:20px;border-bottom:2px solid #3b82f6;padding-bottom:8px}
                                         table{width:100%;border-collapse:collapse;margin-top:12px;background:white;border-radius:6px;overflow:hidden}
                                         th,td{border:1px solid #e2e8f0;padding:12px;text-align:right}
                                         thead{background:#f1f5f9}
                                         th{font-weight:600;color:#374151}
                                         tbody tr:hover{background:#f8fafc}
                                         .chart-container{background:white;padding:20px;border-radius:8px;margin:16px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
                                         .trend-up{color:#10b981;font-weight:bold}
                                         .trend-down{color:#ef4444;font-weight:bold}
                                         .trend-stable{color:#6b7280;font-weight:bold}
                                         @media print{body{padding:0;background:white}.container{box-shadow:none;border-radius:0}}
                             </style>
                           </head><body>
                                       <div class="container">
                             <h1>${r.title}</h1>
                                         
                                         <div class="header-info">
                                           <div class="info-grid">
                                             <div class="info-item">
                                               <div class="info-label">المؤسسة</div>
                                               <div class="info-value">${c.school || 'غير محدد'}</div>
                                             </div>
                                             <div class="info-item">
                                               <div class="info-label">المستوى</div>
                                               <div class="info-value">${c.level || 'غير محدد'}</div>
                                             </div>
                                             <div class="info-item">
                                               <div class="info-label">الفصل</div>
                                               <div class="info-value">${c.semester || 'غير محدد'}</div>
                                             </div>
                                             <div class="info-item">
                                               <div class="info-label">تاريخ التقرير</div>
                                               <div class="info-value">${c.reportDate || r.date}</div>
                                             </div>
                                           </div>
                                         </div>
                                         
                                         <div class="stats-grid">
                                           <div class="stat-card">
                                             <div class="stat-number">${c.average?.toFixed(2) || 'غير محدد'}</div>
                                             <div class="stat-label">المعدل العام</div>
                                           </div>
                                           <div class="stat-card">
                                             <div class="stat-number">${c.totals?.totalStudents || 0}</div>
                                             <div class="stat-label">إجمالي الطلاب</div>
                                           </div>
                                           <div class="stat-card excellent">
                                             <div class="stat-number">${c.totals?.excellent || 0}</div>
                                             <div class="stat-label">ممتاز</div>
                                           </div>
                                           <div class="stat-card good">
                                             <div class="stat-number">${c.totals?.good || 0}</div>
                                             <div class="stat-label">جيد</div>
                                           </div>
                                           <div class="stat-card average">
                                             <div class="stat-number">${c.totals?.average || 0}</div>
                                             <div class="stat-label">متوسط</div>
                                           </div>
                                           <div class="stat-card weak">
                                             <div class="stat-number">${c.totals?.weak || 0}</div>
                                             <div class="stat-label">ضعيف</div>
                                           </div>
                                         </div>
                                         
                                         ${c.subjects && c.subjects.length > 0 ? `
                                           <div class="section">
                                             <h2>تحليل المواد</h2>
                                             <table>
                                               <thead>
                                                 <tr>
                                                   <th>المادة</th>
                                                   <th>المعدل</th>
                                                   <th>الاتجاه</th>
                                                   <th>التقييم</th>
                                                 </tr>
                                               </thead>
                                               <tbody>
                                                 ${c.subjects.map((s: any) => {
                                                   let evaluation = '';
                                                   if (s.average >= 16) evaluation = 'ممتاز';
                                                   else if (s.average >= 14) evaluation = 'جيد جداً';
                                                   else if (s.average >= 12) evaluation = 'جيد';
                                                   else if (s.average >= 10) evaluation = 'مقبول';
                                                   else evaluation = 'ضعيف';
                                                   
                                                   return `
                                                     <tr>
                                                       <td>${s.name}</td>
                                                       <td>${s.average?.toFixed(2) || 'غير محدد'}</td>
                                                       <td class="${s.trend === 'up' ? 'trend-up' : s.trend === 'down' ? 'trend-down' : 'trend-stable'}">
                                                         ${s.trend === 'up' ? '↗️ صاعد' : s.trend === 'down' ? '↘️ نازل' : '➡️ مستقر'}
                                                       </td>
                                                       <td>${evaluation}</td>
                                                     </tr>
                                                   `;
                                                 }).join('')}
                                               </tbody>
                                             </table>
                                           </div>
                                         ` : ''}
                                         ${c.topPerformers && c.topPerformers.length > 0 ? `
                                           <div class="section">
                                             <h2>أفضل الطلاب</h2>
                                             <table>
                                               <thead>
                                                 <tr>
                                                   <th>الترتيب</th>
                                                   <th>اسم الطالب</th>
                                                   <th>المعدل</th>
                                                 </tr>
                                               </thead>
                                               <tbody>
                                                 ${c.topPerformers.map((tp: any, index: number) => `
                                                   <tr>
                                                     <td>${index + 1}</td>
                                                     <td>${tp.studentName}</td>
                                                     <td>${tp.average?.toFixed(2) || 'غير محدد'}</td>
                                                   </tr>
                                                 `).join('')}
                                               </tbody>
                                             </table>
                                           </div>
                                         ` : ''}
                                       </div>
                           </body></html>`;
                           win.document.write(html);
                           win.document.close();
                           win.focus();
                                     setTimeout(() => { win.print(); win.close(); }, 350);
                                   } catch (e) {
                                     console.error('Print failed', e);
                                     alert('فشل في طباعة التقرير');
                                   }
                                 }}
                                 className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                               >
                                 طباعة
                               </button>
                               <WorkingPDFGenerator />
                               <button
                                 onClick={() => {
                                   if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
                                     const updatedReports = reports.filter(report => report.id !== r.id);
                                     setReports(updatedReports);
                                     setStorage('reports', updatedReports);
                                   }
                                 }}
                                 className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                               >
                                 حذف
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                    })}
                  </>
                );
              })()}
            </div>
           </div>
         </div>
       )}
       {/* Activities Report Modal - Complete 8-page structure */}
        {showActivitiesPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto" dir="rtl">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setShowActivitiesPreview(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div id="activities-report-preview" className="space-y-8" dir="rtl">
               {/* Page 1: Cover Page */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                   {/* Header Information */}
                   <div className="text-center font-bold text-2xl mb-16">
                     <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
                     <div className="w-48 h-0.5 bg-gray-400 mx-auto mt-4"></div>
                   </div>

                   <div className="text-center font-bold text-lg mb-4">
                     وزارة التربية الوطنية
                   </div>

                  <div className="flex justify-between mb-2 text-lg">
                    <div className="font-bold flex items-center gap-2">
                      <span>مديرية التربية لولاية</span>
                      <select
                        value={reportData.wilaya || ''}
                        onChange={(e) => setReportData(prev => ({ ...prev, wilaya: e.target.value }))}
                        className="border-b border-gray-300 focus:border-blue-500 outline-none px-1 min-w-[160px] text-center text-lg bg-transparent"
                        dir="rtl"
                      >
                        <option value="">اختر الولاية</option>
                        {wilayaOptions.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                     <div className="font-bold">مركز التوجيه و الإرشاد المدرسي و المهني</div>
                   </div>

                   <div className="text-lg">
                     <div className="flex justify-between mb-4">
                       <div className="flex items-center">
                         <span className="ml-2 font-semibold pb-2">المؤسسة</span>
                         <span className="mx-2">:</span>
                         <input
                           type="text"
                           className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 w-64 text-center text-lg bg-transparent"
                           placeholder={currentCycle === 'ثانوي' ? 'ثانوية حسن بن خير الدين تجديت' : 'متوسطة حسن بن خير الدين تجديت'}
                           value={manualSchoolName}
                           onChange={(e) => setManualSchoolName(e.target.value)}
                           dir="rtl"
                         />
                       </div>
                     </div>

                     <div className="flex items-center">
                       <span className="ml-2 font-semibold pb-2">مستشار التوجيه</span>
                       <span className="mx-2">:</span>
                       <input
                         type="text"
                         className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 w-48 text-center text-lg bg-transparent"
                         placeholder="بوسحبة محمد الامين"
                         value={manualCounselorName}
                         onChange={(e) => setManualCounselorName(e.target.value)}
                         dir="rtl"
                       />
                     </div>
                   </div>

                   {/* Main Title */}
                   <div className="flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                     {/* Title Text */}
                     <div className="text-center mb-8">
                       <div className="text-4xl font-bold text-gray-800 mb-0">
                         التقرير الفصلي لنشاطات
                       </div>
                       <div className="text-3xl font-bold text-gray-800">
                         مستشار التوجيه والإرشاد المدرسي
                       </div>
                     </div>
                     
                     {/* Semester Selector */}
                     <div className="text-2xl">
                       <select className="bg-transparent border-none outline-none text-center text-2xl font-bold text-gray-700">
                         <option>الفصل الأول</option>
                         <option>الفصل الثاني</option>
                         <option>الفصل الثالث</option>
                       </select>
                     </div>
                   </div>

                   {/* Footer: Academic Year Selector (RTL) */}
                   <div className="text-center mt-32" dir="rtl">
                     <div className="inline-flex items-center gap-3 text-lg font-bold pb-2 mb-8">
                       <span>السنة الدراسية:</span>
                       <select
                         value={reportData.academicYear}
                         onChange={(e) => setReportData(prev => ({ ...prev, academicYear: e.target.value }))}
                         className="border-b border-gray-300 focus:border-blue-500 outline-none px-2 bg-transparent text-center"
                         dir="rtl"
                       >
                         {academicYears.map((year) => (
                           <option key={year} value={year}>{year}</option>
                         ))}
                       </select>
                     </div>
                     
                     {/* Signature */}
                     <div className="mt-12">
                        <div className="font-bold text-lg">{currentCycle === 'ثانوي' ? 'مدير الثانوية' : 'مدير المتوسطة'}</div>
                     </div>
                   </div>
                 </div>
               </div>
               {/* Page 2: Student Statistics */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                   <div className="space-y-2 -mt-1">
                     <div className="flex justify-between items-center">
                       <h3 className="text-lg font-bold text-red-600 inline-block pb-1">
                         <span className="border-b border-red-600">تقديم مقاطعات تدخل المستشار:</span>
                         <div className="mt-2">
                           <h4 className="text-base font-bold text-blue-600 inline-block pb-1">
                             <span className="border-b border-blue-600">{getCycleTitle()}:</span>
                           </h4>
                         </div>
                       </h3>
                      <button
                        onClick={() => resetInterventionData(currentCycle as 'متوسط' | 'ثانوي')}
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="إعادة تعيين جميع القيم إلى الصفر"
                      >
                        إعادة تعيين
                      </button>
                     </div>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-sm">
                       <thead>
                         <tr className="bg-gray-100">
                          {getCycleLevels().map((lvl, index) => (
                            <th key={index} className="border border-gray-400 p-2 text-center text-sm font-bold" colSpan={3}>{lvl}</th>
                           ))}
                           <th className="border border-gray-400 p-2 text-center text-sm font-bold" colSpan={3}>مجموع {getCycleTitle()}</th>
                         </tr>
                        <tr className="bg-gray-50 h-10">
                          {getCycleLevels().map((_level, index) => (
                             <React.Fragment key={index}>
                               <th className="border border-gray-400 px-1 py-1 text-center text-sm font-semibold leading-tight align-middle">ذكور</th>
                               <th className="border border-gray-400 px-1 py-1 text-center text-sm font-semibold leading-tight align-middle">إناث</th>
                               <th className="border border-gray-400 px-1 py-1 text-center text-sm font-semibold leading-tight align-middle">مجموع</th>
                             </React.Fragment>
                           ))}
                           <th className="border border-gray-400 px-1 py-1 text-center text-sm font-semibold leading-tight align-middle">ذكور</th>
                           <th className="border border-gray-400 px-1 py-1 text-center text-sm font-semibold leading-tight align-middle">إناث</th>
                           <th className="border border-gray-400 px-1 py-1 text-center text-sm font-semibold leading-tight align-middle">مجموع</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           {/* Niveaux du cycle actuel */}
                           {getCycleLevels().map((level, index) => (
                             <React.Fragment key={index}>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                                 <input 
                                   type="number" 
                                   inputMode="numeric" 
                                   dir="ltr" 
                                   className="w-full text-center border-none outline-none bg-transparent text-xs py-0" 
                                   placeholder="0" 
                                  value={interventionData[currentCycle]?.[level]?.male ?? 0}
                                  onChange={(e) => updateInterventionData(currentCycle as 'متوسط' | 'ثانوي', level, 'male', parseInt(e.target.value) || 0)}
                                 />
                               </td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                                 <input 
                                   type="number" 
                                   inputMode="numeric" 
                                   dir="ltr" 
                                   className="w-full text-center border-none outline-none bg-transparent text-xs py-0" 
                                   placeholder="0" 
                                  value={interventionData[currentCycle]?.[level]?.female ?? 0}
                                  onChange={(e) => updateInterventionData(currentCycle as 'متوسط' | 'ثانوي', level, 'female', parseInt(e.target.value) || 0)}
                                 />
                               </td>
                               <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                                 <input 
                                   type="number" 
                                   inputMode="numeric" 
                                   dir="ltr" 
                                   className="w-full text-center border-none outline-none bg-transparent text-sm font-bold bg-gray-50 py-0" 
                                   placeholder="0" 
                                   value={interventionData[currentCycle]?.[level]?.total ?? 0}
                                   readOnly
                                 />
                               </td>
                             </React.Fragment>
                           ))}
                           
                           {/* Grand total */}
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <input 
                               type="number" 
                               inputMode="numeric" 
                               dir="ltr" 
                               className="w-full text-center border-none outline-none bg-transparent text-sm font-bold bg-blue-50 py-0" 
                               placeholder="0" 
                              value={interventionData.totals?.[currentCycle as 'متوسط' | 'ثانوي']?.male ?? 0}
                               readOnly
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <input 
                               type="number" 
                               inputMode="numeric" 
                               dir="ltr" 
                               className="w-full text-center border-none outline-none bg-transparent text-sm font-bold bg-blue-50 py-0" 
                               placeholder="0" 
                              value={interventionData.totals?.[currentCycle as 'متوسط' | 'ثانوي']?.female ?? 0}
                               readOnly
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <input 
                               type="number" 
                               inputMode="numeric" 
                               dir="ltr" 
                               className="w-full text-center border-none outline-none bg-transparent text-sm font-bold bg-blue-50 py-0" 
                               placeholder="0" 
                              value={interventionData.totals?.[currentCycle as 'متوسط' | 'ثانوي']?.total ?? 0}
                               readOnly
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>

               {/* Page 3: Student Information */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                   <div className="space-y-2">
                     <h3 className="text-lg font-bold text-red-600 inline-block pb-1">
                       <span className="border-b border-red-600">أ- الإعلام المدرسي :</span>
                       <div className="mt-2">
                         <h4 className="text-base font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">{currentCycle === 'ثانوي' ? '1 - إعلام الطلاب :' : '1 - إعلام التلاميذ :'}</h4>
                       </div>
                     </h3>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">المستوى</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الموضوع</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الأهداف</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">نسبة التغطية</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الملاحظة</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={studentInfoLevels.level1}
                               onChange={(e) => setStudentInfoLevels(prev => ({ ...prev, level1: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="الأولى ثانوي">الأولى ثانوي</option>
                                   <option value="الثانية ثانوي">الثانية ثانوي</option>
                                   <option value="الثالثة ثانوي">الثالثة ثانوي</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="الأولى متوسط">الأولى متوسط</option>
                                   <option value="الثانية متوسط">الثانية متوسط</option>
                                   <option value="الثالثة متوسط">الثالثة متوسط</option>
                                   <option value="الرابعة متوسط">الرابعة متوسط</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تسهيل اندماج الطلاب في المحيط المدرسي الجديد' : 'تسهيل اندماج التلاميذ في المحيط المدرسي الجديد'}
                               options={mawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="تحقيق كفاية الاندماج والتكيف مع المتوسط الجديد"
                               options={getAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%100"
                               defaultValue="%100"
                               options={nisbaTatwiyaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="مدة: ساعة واحدة"
                               defaultValue="مدة: ساعة واحدة"
                               options={malahazaOptions}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={studentInfoLevels.level2}
                               onChange={(e) => setStudentInfoLevels(prev => ({ ...prev, level2: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="الأولى ثانوي">الأولى ثانوي</option>
                                   <option value="الثانية ثانوي">الثانية ثانوي</option>
                                   <option value="الثالثة ثانوي">الثالثة ثانوي</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="الأولى متوسط">الأولى متوسط</option>
                                   <option value="الثانية متوسط">الثانية متوسط</option>
                                   <option value="الثالثة متوسط">الثالثة متوسط</option>
                                   <option value="الرابعة متوسط">الرابعة متوسط</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تعريف الطالب بأهمية السنة الأولى ثانوي في نموه المعرفي' : 'تعريف التلميذ بأهمية السنة الثانية متوسط في نموه المعرفي'}
                               options={mawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="فهم أهمية السنة الثانية للسنوات القادمة"
                               options={getAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%100"
                               defaultValue="%100"
                               options={nisbaTatwiyaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="مدة: ساعة واحدة"
                               defaultValue="مدة: ساعة واحدة"
                               options={malahazaOptions}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={studentInfoLevels.level3}
                               onChange={(e) => setStudentInfoLevels(prev => ({ ...prev, level3: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="الأولى ثانوي">الأولى ثانوي</option>
                                   <option value="الثانية ثانوي">الثانية ثانوي</option>
                                   <option value="الثالثة ثانوي">الثالثة ثانوي</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="الأولى متوسط">الأولى متوسط</option>
                                   <option value="الثانية متوسط">الثانية متوسط</option>
                                   <option value="الثالثة متوسط">الثالثة متوسط</option>
                                   <option value="الرابعة متوسط">الرابعة متوسط</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'أهمية السنة الثالثة ثانوي في تحديد مسارهم الدراسي' : 'التحضير لعملية التوجيه نحو ما بعد الإجبارية'}
                               options={mawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="فهم أهمية السنة الثالثة في عملية التوجيه"
                               options={getAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%100"
                               defaultValue="%100"
                               options={nisbaTatwiyaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="مدة: ساعة واحدة"
                               defaultValue="مدة: ساعة واحدة"
                               options={malahazaOptions}
                             />
                           </td>
                         </tr>
                         {currentCycle !== 'ثانوي' && (
                           <tr>
                             <td className="border border-gray-400 p-2 text-center align-middle">
                               <select
                                 value={studentInfoLevels.level4}
                                 onChange={(e) => setStudentInfoLevels(prev => ({ ...prev, level4: e.target.value }))}
                                 className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                                 dir="rtl"
                               >
                                 <option value="الأولى متوسط">الأولى متوسط</option>
                                 <option value="الثانية متوسط">الثانية متوسط</option>
                                 <option value="الثالثة متوسط">الثالثة متوسط</option>
                                 <option value="الرابعة متوسط">الرابعة متوسط</option>
                               </select>
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <MultiSelectTextarea 
                                 className="text-center text-lg" 
                                 placeholder="أهمية السنة الرابعة متوسط في تحديد مسارهم الدراسي"
                                 options={mawdooOptions}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <MultiSelectTextarea 
                                 className="text-center text-lg" 
                                 placeholder="تحديد تصورات التلاميذ حول مشروعهم الدراسي والمهني"
                                 options={getAhdafOptions(currentCycle)}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <MultiSelectTextarea 
                                 className="text-center text-lg font-semibold" 
                                 placeholder="%100"
                                 defaultValue="%100"
                                 options={nisbaTatwiyaOptions}
                               />
                             </td>
                             <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                               <MultiSelectTextarea 
                                 className="text-center text-lg" 
                                 placeholder="مدة: ساعة واحدة"
                                 defaultValue="مدة: ساعة واحدة"
                                 options={malahazaOptions}
                               />
                             </td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
               {/* Page 4: Teacher Information */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">2- إعلام الأساتذة:</h3>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">المستوى</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الموضوع</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الأهداف</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">نسبة التغطية</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الملاحظة</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={teacherInfoLevels.level1}
                               onChange={(e) => setTeacherInfoLevels(prev => ({ ...prev, level1: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="3ث">3ث</option>
                                   <option value="1 و 2 ثانوي">1 و 2 ثانوي</option>
                                   <option value="1ث">1ث</option>
                                   <option value="2ث">2ث</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="4م">4م</option>
                                   <option value="1 و 2 و 3م">1 و 2 و 3م</option>
                                   <option value="1م">1م</option>
                                   <option value="2م">2م</option>
                                   <option value="3م">3م</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="توعية الأساتذة بأهمية دورهم في عملية التوجيه"
                               defaultValue="توعية الأساتذة بأهمية دورهم في عملية التوجيه"
                               options={generalMawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="توعيتهم على أهمية دورهم في هذه المرحلة"
                               defaultValue="توعيتهم على أهمية دورهم في هذه المرحلة"
                               options={getGeneralAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%70"
                               defaultValue="%70"
                               options={generalNisbaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="خلال مجلس الاقسام و مقابلات فردية"
                               defaultValue="خلال مجلس الاقسام و مقابلات فردية"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={teacherInfoLevels.level2}
                               onChange={(e) => setTeacherInfoLevels(prev => ({ ...prev, level2: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="3ث">3ث</option>
                                   <option value="1 و 2 ثانوي">1 و 2 ثانوي</option>
                                   <option value="1ث">1ث</option>
                                   <option value="2ث">2ث</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="4م">4م</option>
                                   <option value="1 و 2 و 3م">1 و 2 و 3م</option>
                                   <option value="1م">1م</option>
                                   <option value="2م">2م</option>
                                   <option value="3م">3م</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="توعية الأساتذة على أهمية دورهم في التقويم"
                               defaultValue="توعية الأساتذة على أهمية دورهم في التقويم"
                               options={generalMawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="تحسيس الاساتذة بدور مستشار التوجيه"
                               defaultValue="تحسيس الاساتذة بدور مستشار التوجيه"
                               options={getGeneralAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="-"
                               defaultValue="-"
                               options={generalNisbaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="خلال مجلس الاقسام و مقابلات فردية"
                               defaultValue="خلال مجلس الاقسام و مقابلات فردية"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">3 - إعلام الأولياء:</h3>
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">المستوى</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الموضوع</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الأهداف</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">نسبة التغطية</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الملاحظة</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 p-4 text-center text-lg font-semibold">كل المستويات</td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="تدعيم العلاقة بين المؤسسة و الاسرة"
                               defaultValue="تدعيم العلاقة بين المؤسسة و الاسرة"
                               options={generalMawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="لهذف رفع مستوى التحصيل الدراسي"
                               defaultValue="لهذف رفع مستوى التحصيل الدراسي"
                               options={getGeneralAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%60"
                               defaultValue="%60"
                               options={generalNisbaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="من خلال مقابلات مع بعض الأولياء المهتمين"
                               defaultValue="من خلال مقابلات مع بعض الأولياء المهتمين"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
               {/* Page 5: Information Receptions */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">4 - الإستقبالات الإعلامية:</h3>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الفئات</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">نوع الطلبات</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">كيفية التكفل بهم</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">ملاحظات</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 p-4 text-center text-lg font-semibold">{currentCycle === 'ثانوي' ? 'طلاب' : 'تلاميذ'}</td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تساؤلات حول طرق المراجعة و تنظيم الوقت' : 'تساؤلات حول طرق المراجعة و تنظيم الوقت'}
                               defaultValue={currentCycle === 'ثانوي' ? 'تساؤلات حول طرق المراجعة و تنظيم الوقت' : 'تساؤلات حول طرق المراجعة و تنظيم الوقت'}
                               options={getReceptionTalabatOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="تقديم حصص فردية وجماعية"
                               defaultValue="تقديم حصص فردية وجماعية"
                               options={getReceptionTakfulOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="/"
                               defaultValue="/"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 p-4 text-center text-lg font-semibold">أساتذة</td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="متابعة الحالات المحالة من طرف الأساتذة"
                               defaultValue="متابعة الحالات المحالة من طرف الأساتذة"
                               options={getReceptionTalabatOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="التكفل والتابعة"
                               defaultValue="التكفل والتابعة"
                               options={getReceptionTakfulOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="/"
                               defaultValue="/"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 p-4 text-center text-lg font-semibold">أولياء</td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="طلب المساعدة بالدعم خاصة"
                               defaultValue="طلب المساعدة بالدعم خاصة"
                               options={getReceptionTalabatOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="التكفل والمتابعة"
                               defaultValue="التكفل والمتابعة"
                               options={getReceptionTakfulOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="/"
                               defaultValue="/"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>

                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">5 - البطاقات الإعلامية الموجهة الى المستويات:</h3>
                   
                   <textarea
                     className="w-full border border-gray-300 rounded-lg p-4 text-right text-lg"
                     rows={6}
                     placeholder={currentCycle === 'ثانوي' ? '• معاملات المواد خاصة بطلاب الثالثة ثانوي.\n• التوجيه المدرسي و مختلف التخصصات.\n• مطوية حقق نجاحك في الثالثة ثانوي والتي تتضمن (تعريف المستوى، امتحان شهادة البكالوريا، الجذوع المشتركة و إعادة التوجيه، مواقيت ومعاملات المواد و التقويم البيداغوجي، نصائح وإرشادات).' : '• معاملات المواد خاصة بتلاميذ الرابعة متوسط.\n• التوجيه المدرسي و مختلف التخصصات.\n• مطوية حقق نجاحك في الرابعة متوسط والتي تتضمن (تعريف المستوى، امتحان شهادة التعليم المتوسط، الجذوع المشتركة شعبة الفنون وجسور إعادة التوجيه في السنة الثانية ثانوى، مواقيت ومعاملات المواد و التقويم البيداغوجي، نصائح وإرشادات).'}
                     defaultValue={currentCycle === 'ثانوي' ? '• معاملات المواد خاصة بطلاب الثالثة ثانوي.\n• التوجيه المدرسي و مختلف التخصصات.\n• مطوية حقق نجاحك في الثالثة ثانوي والتي تتضمن (تعريف المستوى، امتحان شهادة البكالوريا، الجذوع المشتركة و إعادة التوجيه، مواقيت ومعاملات المواد و التقويم البيداغوجي، نصائح وإرشادات).' : '• معاملات المواد خاصة بتلاميذ الرابعة متوسط.\n• التوجيه المدرسي و مختلف التخصصات.\n• مطوية حقق نجاحك في الرابعة متوسط والتي تتضمن (تعريف المستوى، امتحان شهادة التعليم المتوسط، الجذوع المشتركة شعبة الفنون وجسور إعادة التوجيه في السنة الثانية ثانوى، مواقيت ومعاملات المواد و التقويم البيداغوجي، نصائح وإرشادات).'}
                   />
                 </div>
               </div>
               {/* Page 6: Guidance and Follow-up */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                   <div className="space-y-2">
                     <h3 className="text-lg font-bold text-red-600 pb-1">
                       <span className="border-b border-red-600">ب- التوجيه:</span>
                     </h3>
                     
                     <h4 className="text-lg font-bold text-blue-600 pb-6 mr-8">
                        <span className="border-b border-blue-600">{currentCycle === 'ثانوي' ? '1- متابعة الطلاب:' : '1- متابعة التلاميذ:'}</span>
                     </h4>
                   </div>
                   
                   <div className="bg-gray-50 p-6 rounded-lg">
                     <AutoResizeTextarea 
                       className="w-full text-base bg-transparent border-none outline-none resize-none overflow-hidden" 
                        placeholder={currentCycle === 'ثانوي' ? '• متابعة الطلاب 1 و 2 و 3 ثانوي\n• القيام بحصص إعلامية\n• مقابلات فردية وجماعية' : '• متابعة التلاميذ 1 و 2 و 3 و 4 متوسط\n• القيام بحصص إعلامية\n• مقابلات فردية وجماعية'}
                        defaultValue={currentCycle === 'ثانوي' ? '• متابعة الطلاب 1 و 2 و 3 ثانوي\n• القيام بحصص إعلامية\n• مقابلات فردية وجماعية' : '• متابعة التلاميذ 1 و 2 و 3 و 4 متوسط\n• القيام بحصص إعلامية\n• مقابلات فردية وجماعية'}
                     />
                   </div>

                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">2 - تحليل النتائج:</h3>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">المستوى</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الموضوع</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الأهداف</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">نسبة التغطية</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الملاحظة</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={resultsAnalysisLevels.level1}
                               onChange={(e) => setResultsAnalysisLevels(prev => ({ ...prev, level1: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="1 و 2 و 3 ثانوي">1 و 2 و 3 ثانوي</option>
                                   <option value="1ث">1ث</option>
                                   <option value="2ث">2ث</option>
                                   <option value="3ث">3ث</option>
                                   <option value="1 و 2ث">1 و 2ث</option>
                                   <option value="2 و 3ث">2 و 3ث</option>
                                   <option value="1 و 3ث">1 و 3ث</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                   <option value="المستويات الضعيفة">المستويات الضعيفة</option>
                                   <option value="المستويات المتفوقة">المستويات المتفوقة</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="1 و 2 و 3 و 4">1 و 2 و 3 و 4</option>
                                   <option value="1م">1م</option>
                                   <option value="2م">2م</option>
                                   <option value="3م">3م</option>
                                   <option value="4م">4م</option>
                                   <option value="1 و 2م">1 و 2م</option>
                                   <option value="3 و 4م">3 و 4م</option>
                                   <option value="1 و 3م">1 و 3م</option>
                                   <option value="2 و 4م">2 و 4م</option>
                                   <option value="1 و 4م">1 و 4م</option>
                                   <option value="2 و 3م">2 و 3م</option>
                                   <option value="1 و 2 و 3م">1 و 2 و 3م</option>
                                   <option value="2 و 3 و 4م">2 و 3 و 4م</option>
                                   <option value="1 و 3 و 4م">1 و 3 و 4م</option>
                                   <option value="1 و 2 و 4م">1 و 2 و 4م</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                   <option value="المستويات الضعيفة">المستويات الضعيفة</option>
                                   <option value="المستويات المتفوقة">المستويات المتفوقة</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="تحليل النتائج الفصلية"
                               defaultValue="تحليل النتائج الفصلية"
                               options={generalMawdooOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تحليل نتائج الطلاب جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم' : 'تحليل نتائج التلاميذ جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم'}
                               defaultValue={currentCycle === 'ثانوي' ? 'تحليل نتائج الطلاب جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم' : 'تحليل نتائج التلاميذ جميع المستويات بهدف الوقوف عند بعض جوانب من أجل التقويم'}
                               options={getGeneralAhdafOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%100"
                               defaultValue="%100"
                               options={generalNisbaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="/"
                               defaultValue="/"
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>

                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">3 - المشاركة في مجالس الأقسام للفصل الأول:</h3>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">المستوى</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">نسبة التغطية</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الملاحظة</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={councilParticipationLevels.level1}
                               onChange={(e) => setCouncilParticipationLevels(prev => ({ ...prev, level1: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="الثالثة ثانوي">الثالثة ثانوي</option>
                                   <option value="الأولى ثانوي">الأولى ثانوي</option>
                                   <option value="الثانية ثانوي">الثانية ثانوي</option>
                                   <option value="1 و 2 ثانوي">1 و 2 ثانوي</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="الرابعة متوسط">الرابعة متوسط</option>
                                   <option value="الأولى متوسط">الأولى متوسط</option>
                                   <option value="الثانية متوسط">الثانية متوسط</option>
                                   <option value="الثالثة متوسط">الثالثة متوسط</option>
                                   <option value="1و2و3م">1و2و3م</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%100"
                               defaultValue="%100"
                               options={generalNisbaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تنشيط مجلس قسم 3ث بعرض مقارنة الماضي الدراسي' : 'تنشيط مجلس قسم 4م بعرض مقارنة الماضي الدراسي'}
                               defaultValue={currentCycle === 'ثانوي' ? 'تنشيط مجلس قسم 3ث بعرض مقارنة الماضي الدراسي' : 'تنشيط مجلس قسم 4م بعرض مقارنة الماضي الدراسي'}
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 p-2 text-center align-middle">
                             <select
                               value={councilParticipationLevels.level2}
                               onChange={(e) => setCouncilParticipationLevels(prev => ({ ...prev, level2: e.target.value }))}
                               className="text-center text-lg font-semibold bg-transparent border-none outline-none w-full"
                               dir="rtl"
                             >
                               {currentCycle === 'ثانوي' ? (
                                 <>
                                   <option value="الثالثة ثانوي">الثالثة ثانوي</option>
                                   <option value="الأولى ثانوي">الأولى ثانوي</option>
                                   <option value="الثانية ثانوي">الثانية ثانوي</option>
                                   <option value="1 و 2 ثانوي">1 و 2 ثانوي</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               ) : (
                                 <>
                                   <option value="الرابعة متوسط">الرابعة متوسط</option>
                                   <option value="الأولى متوسط">الأولى متوسط</option>
                                   <option value="الثانية متوسط">الثانية متوسط</option>
                                   <option value="الثالثة متوسط">الثالثة متوسط</option>
                                   <option value="1و2و3م">1و2و3م</option>
                                   <option value="جميع المستويات">جميع المستويات</option>
                                 </>
                               )}
                             </select>
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="%100"
                               defaultValue="%100"
                               options={generalNisbaOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تنشيط مجلس الأقسام بعرض مقارنة الماضي الدراسي' : 'تنشيط مجلس الأقسام بعرض مقارنة الماضي الدراسي'}
                               defaultValue={currentCycle === 'ثانوي' ? 'تنشيط مجلس الأقسام بعرض مقارنة الماضي الدراسي' : 'تنشيط مجلس الأقسام بعرض مقارنة الماضي الدراسي'}
                               options={generalMalahazaOptions}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>
                 </div>
               </div>
               {/* Page 7: Interests and Inclinations Survey */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">4- إستبيان الميول والإهتمامات:</h3>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">عدد الأفواج</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الفترة</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الإستنتاجات</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">أساليب المعالجة</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="02 أقسام"
                               defaultValue="02 أقسام"
                               options={getSurveyAfwajOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg font-semibold" 
                               placeholder="شهر نوفمبر"
                               defaultValue="شهر نوفمبر"
                               options={surveyFatratOptions}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-base" 
                               placeholder={currentCycle === 'ثانوي' ? '• تشجيع الطلاب الإيجابي نحو التعلم\n• إكتشاف المواد المفضلة لدى الطلاب\n• اهم مصادر المعلومات للطالب\n• المهن المفضلة للطلاب\n• نسبة إهتمام الأولياء\n• توقعات التوجيه الاولية لهؤلاء الطلاب' : '• تشجيع التلاميذ الإيجابي نحو التعلم\n• إكتشاف المواد المفضلة لدى التلاميذ\n• اهم مصادر المعلومات للتلميذ\n• المهن المفضلة للتلاميذ\n• نسبة إهتمام الأولياء\n• توقعات التوجيه الاولية لهؤلاء التلاميذ'}
                               defaultValue={currentCycle === 'ثانوي' ? '• تشجيع الطلاب الإيجابي نحو التعلم\n• إكتشاف المواد المفضلة لدى الطلاب\n• اهم مصادر المعلومات للطالب\n• المهن المفضلة للطلاب\n• نسبة إهتمام الأولياء\n• توقعات التوجيه الاولية لهؤلاء الطلاب' : '• تشجيع التلاميذ الإيجابي نحو التعلم\n• إكتشاف المواد المفضلة لدى التلاميذ\n• اهم مصادر المعلومات للتلميذ\n• المهن المفضلة للتلاميذ\n• نسبة إهتمام الأولياء\n• توقعات التوجيه الاولية لهؤلاء التلاميذ'}
                               options={getSurveyIstintajatOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-base" 
                               placeholder="• النقاش والتحليل&#10;• واستنتاج المؤشرات"
                               defaultValue="• النقاش والتحليل&#10;• واستنتاج المؤشرات"
                               options={surveyAsalibOptions}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>

                     <h3 className="text-lg font-bold text-blue-600 inline-block border-b border-blue-600 pb-1">5 اللقاءات - الندوات - الأيام الدراسية :</h3>
                   
                   <textarea
                     className="w-full border border-gray-300 rounded-lg p-4 text-right text-lg"
                     rows={6}
                       placeholder={currentCycle === 'ثانوي' ? 'ندوة بثانوية زروقي إبن الدين بمستغانم حول المعالجة البيداغوجية لطلاب السنة الأولى ثانوي للسنة الدراسية 2023/2024' : 'ندوة بثانوية زروقي إبن الدين بمستغانم حول المعالجة البيداغوجية لتلاميذ السنة الأولى متوسط للسنة الدراسية 2023/2024'}
                       defaultValue={currentCycle === 'ثانوي' ? 'ندوة بثانوية زروقي إبن الدين بمستغانم حول المعالجة البيداغوجية لطلاب السنة الأولى ثانوي للسنة الدراسية 2023/2024' : 'ندوة بثانوية زروقي إبن الدين بمستغانم حول المعالجة البيداغوجية لتلاميذ السنة الأولى متوسط للسنة الدراسية 2023/2024'}
                     />
                 </div>
               </div>

               {/* Page 8: Studies and Research */}
               <div className="report-page bg-white p-6 rounded-lg" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', position: 'relative', padding: '5mm' }}>
                 <div className="space-y-6" dir="rtl">
                     <h3 className="text-lg font-bold text-red-600 inline-block pb-1"><span className="border-b border-red-600">ت- الدراسات والبحوث والتحقيقات:</span></h3>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full border-collapse border border-gray-400 text-base">
                       <thead>
                         <tr className="bg-gray-100">
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">المواضيع</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">الأهداف</th>
                           <th className="border border-gray-400 p-4 text-center text-lg font-bold">تاريخ الإنجاز</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'دراسة حول اختيار التخصصات الجامعية' : 'دراسة حول اختيار الشعبة في الثانوي'}
                               defaultValue={currentCycle === 'ثانوي' ? 'دراسة حول اختيار التخصصات الجامعية' : 'دراسة حول اختيار الشعبة في الثانوي'}
                               options={getStudiesTopicsOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'توجيه الطلاب نحو التخصصات المناسبة' : 'توجيه التلاميذ نحو الشعبة المناسبة'}
                               defaultValue={currentCycle === 'ثانوي' ? 'توجيه الطلاب نحو التخصصات المناسبة' : 'توجيه التلاميذ نحو الشعبة المناسبة'}
                               options={getStudiesObjectivesOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="يناير 2024"
                               defaultValue="يناير 2024"
                               options={getStudiesDatesOptions()}
                             />
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'بحث في استعدادات الطلاب للبكالوريا' : 'بحث في استعدادات التلاميذ للتعليم المتوسط'}
                               defaultValue={currentCycle === 'ثانوي' ? 'بحث في استعدادات الطلاب للبكالوريا' : 'بحث في استعدادات التلاميذ للتعليم المتوسط'}
                               options={getStudiesTopicsOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder={currentCycle === 'ثانوي' ? 'تحضير الطلاب للبكالوريا' : 'تحضير التلاميذ للتعليم المتوسط'}
                               defaultValue={currentCycle === 'ثانوي' ? 'تحضير الطلاب للبكالوريا' : 'تحضير التلاميذ للتعليم المتوسط'}
                               options={getStudiesObjectivesOptions(currentCycle)}
                             />
                           </td>
                           <td className="border border-gray-400 px-1 py-1 text-center align-middle">
                             <MultiSelectTextarea 
                               className="text-center text-lg" 
                               placeholder="فبراير 2024"
                               defaultValue="فبراير 2024"
                               options={getStudiesDatesOptions()}
                             />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div>

                   <div className="space-y-4">
                     <h4 className="text-lg font-bold">نشاطات أخرى منجزة:</h4>
                     <textarea
                       className="w-full border border-gray-300 rounded-lg p-4 text-right text-lg"
                       rows={6}
                       placeholder="أيام تكوينية بثانوية ادريس السنوسى يومى 22-23 نوفمبر 2022 تمحور موضوع العملية حول مشروع مركز التوجيه (تفعيل دور مستشار التوجيه داخل المؤسسة التربوية)"
                     />
                   </div>

                   {/* Signatures at the bottom of page 8 */}
                   <div className="flex justify-between items-end pt-16 mt-8">
                     <div className="text-center">
                       <div className="text-sm text-gray-600 mb-4">حرر ب........</div>
                      <div className="font-bold">{currentCycle === 'ثانوي' ? 'مدير الثانوية' : 'مدير المتوسطة'}</div>
                     </div>
                     <div className="text-center">
                       <div className="font-bold">مستشار التوجيه والإرشاد المدرسي</div>
                     </div>
                   </div>
                 </div>
               </div>

             </div>

             <div className="flex justify-end gap-4 mt-6">
               <button
                 onClick={() => setShowActivitiesPreview(false)}
                 className="px-4 py-2 text-gray-600 hover:text-gray-800"
               >
                 إلغاء
               </button>
               <button
                 onClick={() => handleGeneratePDF('activities')}
                 className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
               >
                 <Save className="w-5 h-5" />
                 <span>حفظ كـ PDF</span>
               </button>
             </div>
           </div>
         </div>
       )}

       {/* En-tête avec flèche de retour */}
       <div className="flex items-center gap-4 mb-8">
         <button
           onClick={() => navigate('/')}
           className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
           title="Retour à la لوحة القيادة"
         >
           <ArrowRight className="w-5 h-5" />
         </button>
         
         <h1 className="text-3xl font-bold text-gray-800">إدارة التقارير</h1>
       </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes(currentCycle).map((type) => (
          <div key={type.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${type.color}`}>
                <type.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">{type.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{type.description}</p>
            <button
              onClick={() => handleReportTypeClick(type.id)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>إنشاء التقرير</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}