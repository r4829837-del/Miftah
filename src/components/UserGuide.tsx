import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  UserSquare2, 
  CalendarRange, 
  FileSpreadsheet, 
  Target, 
  FileText, 
  Settings, 
  Brain,
  Archive,
  Upload,
  Download,
  ChevronRight,
  ChevronLeft,
  Home,
  Search,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';

const UserGuide: React.FC = () => {
  const { currentCycle } = useCycle();
  const [activeSection, setActiveSection] = useState('introduction');

  // Open section from URL hash or query (?section=...)
  React.useEffect(() => {
    const applyFromLocation = () => {
      const hash = window.location.hash?.replace('#', '');
      const params = new URLSearchParams(window.location.search);
      const querySection = params.get('section');
      const desired = (hash || querySection) as string | null;
      if (desired && ['introduction','students','groups','reports','tests','recommendations','analysis','backup','settings'].includes(desired)) {
        setActiveSection(desired);
      }
    };
    applyFromLocation();
    window.addEventListener('hashchange', applyFromLocation);
    return () => window.removeEventListener('hashchange', applyFromLocation);
  }, []);

  const sections = [
    {
      id: 'introduction',
      title: 'مقدمة',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">مرحباً بك في تطبيق مفتاح - مساعد مستشار التوجيه</h3>
            <p className="text-blue-700 leading-relaxed">
              تطبيق مستشار التوجيه هو نظام شامل لإدارة نشاطات مستشار التوجيه والإرشاد المدرسي والمهني. 
              يوفر التطبيق جميع الأدوات اللازمة لإدارة {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}، المجموعات، التقارير، الاختبارات، والتوصيات.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-green-800 mb-2">المميزات الرئيسية</h4>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>• إدارة شاملة ل{currentCycle === 'ثانوي' ? 'لطلاب' : 'لتلاميذ'} والمجموعات</li>
                <li>• إنشاء التقارير المختلفة</li>
                <li>• إدارة الاختبارات والتقييمات</li>
                <li>• نظام التوصيات الذكي</li>
                <li>• تحليل النتائج والإحصائيات</li>
                <li>• النسخ الاحتياطية الآمنة</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-bold text-purple-800 mb-2">كيفية الاستخدام</h4>
              <ul className="text-purple-700 space-y-1 text-sm">
                <li>• استخدم شريط البحث للوصول السريع</li>
                <li>• انقر على أي قسم للدخول إليه</li>
                <li>• استخدم الأزرار الملونة للعمليات المختلفة</li>
                <li>• احفظ عملك بانتظام</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'students',
      title: currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-800 mb-4">{currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ'}</h3>
            <p className="text-red-700 mb-4">
              قسم {currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ'} يتيح لك إضافة وتعديل وحذف بيانات {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} في المدرسة.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                {currentCycle === 'ثانوي' ? 'إضافة طالب جديد' : 'إضافة تلميذ جديد'}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>انقر على "{currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ'}" من الصفحة الرئيسية</li>
                <li>اضغط على زر "{currentCycle === 'ثانوي' ? 'إضافة طالب جديد' : 'إضافة تلميذ جديد'}"</li>
                <li>املأ جميع البيانات المطلوبة</li>
                <li>اضغط على "حفظ" لحفظ البيانات</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                تعديل بيانات تلميذ
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>ابحث عن التلميذ في القائمة</li>
                <li>انقر على زر "تعديل" بجانب اسم التلميذ</li>
                <li>عدّل البيانات المطلوبة</li>
                <li>اضغط على "حفظ التغييرات"</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                حذف تلميذ
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>ابحث عن التلميذ في القائمة</li>
                <li>انقر على زر "حذف" بجانب اسم التلميذ</li>
                <li>تأكد من الحذف في النافذة المنبثقة</li>
                <li>سيتم حذف التلميذ نهائياً</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'groups',
      title: 'إدارة الأقسام',
      icon: UserSquare2,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">إدارة الأقسام</h3>
            <p className="text-green-700 mb-4">
              قسم إدارة الأقسام يتيح لك تنظيم {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} في مجموعات وأقسام مختلفة.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إنشاء قسم جديد</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>انقر على "إدارة الأقسام" من الصفحة الرئيسية</li>
                <li>اضغط على "إضافة قسم جديد"</li>
                <li>أدخل اسم القسم والوصف</li>
                <li>اختر {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} الذين ينتمون لهذا القسم</li>
                <li>احفظ القسم الجديد</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">{currentCycle === 'ثانوي' ? 'إدارة الطلاب في الأقسام' : 'إدارة التلاميذ في الأقسام'}</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>اختر القسم المطلوب من القائمة</li>
                <li>اضغط على "{currentCycle === 'ثانوي' ? 'إدارة الطلاب' : 'إدارة التلاميذ'}"</li>
                <li>أضف أو احذف {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} من القسم</li>
                <li>احفظ التغييرات</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'التقارير',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-indigo-800 mb-4">إدارة التقارير</h3>
            <p className="text-indigo-700 mb-4">
              قسم التقارير يتيح لك إنشاء وإدارة جميع أنواع التقارير المطلوبة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">أنواع التقارير</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• تقرير عملية الإعلام</li>
                <li>• تقرير عملية إعلام الأولياء</li>
                <li>• تقرير السلوك والانضباط</li>
                <li>• تقرير تحليل النتائج</li>
                <li>• تقرير النشاطات</li>
                <li>• التقرير السنوي</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إنشاء تقرير</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                <li>اختر نوع التقرير المطلوب</li>
                <li>املأ البيانات المطلوبة</li>
                <li>راجع التقرير قبل الطباعة</li>
                <li>احفظ أو اطبع التقرير</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">ملاحظة مهمة</h4>
            <p className="text-yellow-700 text-sm">
              بعض التقارير (التقرير السنوي، تقرير السلوك والانضباط) قيد التطوير حالياً 
              وستكون متاحة قريباً.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tests',
      title: 'الاختبارات',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">إدارة الاختبارات</h3>
            <p className="text-blue-700 mb-4">
              قسم الاختبارات يتيح لك إنشاء وإدارة الاختبارات والتقييمات للتلاميذ.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إنشاء اختبار جديد</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>انقر على "إدارة الاختبارات" من الصفحة الرئيسية</li>
                <li>اضغط على "اختبار جديد"</li>
                <li>أدخل عنوان الاختبار والوصف</li>
                <li>أضف الأسئلة والإجابات</li>
                <li>حدد وقت الاختبار</li>
                <li>احفظ الاختبار</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إدارة النتائج</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>اختر الاختبار المطلوب</li>
                <li>اضغط على "عرض النتائج"</li>
                <li>راجع درجات {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}</li>
                <li>احفظ أو اطبع النتائج</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'recommendations',
      title: 'التوصيات',
      icon: FileSpreadsheet,
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-800 mb-4">نظام التوصيات</h3>
            <p className="text-orange-700 mb-4">
              قسم التوصيات يتيح لك إنشاء وإدارة التوصيات الموجهة للتلاميذ.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إنشاء توصية جديدة</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>انقر على "التوصيات" من الصفحة الرئيسية</li>
                <li>اضغط على "توصية جديدة"</li>
                <li>اختر التلميذ المستهدف</li>
                <li>اكتب نص التوصية</li>
                <li>حدد نوع التوصية</li>
                <li>احفظ التوصية</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إدارة التوصيات</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>عرض جميع التوصيات</li>
                <li>تصفية التوصيات حسب النوع</li>
                <li>تعديل أو حذف التوصيات</li>
                <li>طباعة التوصيات</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      title: 'تحليل النتائج',
      icon: Target,
      content: (
        <div className="space-y-6" dir="rtl">
          {/* خيارات الاستيراد */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">خيارات الاستيراد</h3>
            <p className="text-blue-700 mb-4">
              يمكنك استيراد جميع المستويات أو اختيار مستوى واحد فقط قبل رفع الملف
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">جميع المستويات</h4>
                <p className="text-sm text-gray-600 mb-2">ملف: College_Tous_Levels_Trimestre1.xlsx</p>
                <p className="text-sm text-gray-700">ملف يحتوي على أوراق عمل لكل المستويات</p>
              </div>
              
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">مستوى محدد</h4>
                <p className="text-sm text-gray-600 mb-2">ملف: 1AM_Trimestre1.xlsx</p>
                <p className="text-sm text-gray-700">يظهر تحليل خاص بالمستوى والترم المختار فقط</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>تنبيه:</strong> يرجى رفع الملف الأصلي الصادر عن منصة الرقمنة التابعة لوزارة التربية الوطنية فقط
              </p>
            </div>
          </div>

          {/* معالجة الأعمدة */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">معالجة الأعمدة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-green-700 mb-2">الأعمدة الإجبارية</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• الرقم</li>
                  <li>• اللقب و الاسم</li>
                  <li>• الجنس</li>
                  <li>• الإعادة</li>
                  <li>• معدل الفصل  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-green-700 mb-2">أعمدة المواد</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• اللغة العربية</li>
                  <li>• الرياضيات</li>
                  <li>• العلوم الطبيعية</li>
                  <li>• التربية الإسلامية</li>
                  <li>• والمزيد...</li>
                </ul>
              </div>
            </div>
          </div>

          {/* مستويات المتوسط  */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-4">مستويات المتوسط  </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">س1م</div>
                <div className="text-sm text-gray-600">السنة الأولى متوسط</div>
              </div>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">س2م</div>
                <div className="text-sm text-gray-600">السنة الثانية متوسط</div>
              </div>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800"> س3م</div>
                <div className="text-sm text-gray-600">السنة الثالثة متوسط</div>
              </div>
              <div className="bg-white border border-purple-200 rounded p-3 text-center">
                <div className="font-bold text-purple-800">4AM</div>
                <div className="text-sm text-gray-600">السنة الرابعة متوسط</div>
              </div>
            </div>
          </div>

          {/* تحليل التوجيه التدريجي */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-800 mb-4">تحليل التوجيه التدريجي</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-orange-200 rounded p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">12.9</div>
                <div className="text-sm text-gray-600">معدل العلمي</div>
              </div>
              <div className="bg-white border border-orange-200 rounded p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">13.1</div>
                <div className="text-sm text-gray-600">معدل الأدبي</div>
              </div>
              <div className="bg-white border border-orange-200 rounded p-4 text-center">
                <div className="text-lg font-bold text-green-600">توجيه أدبي</div>
                <div className="text-sm text-gray-600">الاقتراح العام</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                الأدبي أعلى بـ 0.2 نقطة → توجيه مبدئي نحو الآداب
              </p>
            </div>
          </div>

          {/* تحليل المعدل العام للمادة */}
          <div className="bg-[#2c3e50]/10 border border-[#2c3e50]/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-[#2c3e50] mb-4">تحليل المعدل العام للمادة</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-[#2c3e50]/30 rounded p-3 text-center">
                <div className="font-bold text-[#2c3e50]">11.75</div>
                <div className="text-sm text-gray-600">العربية</div>
              </div>
              <div className="bg-white border border-[#2c3e50]/30 rounded p-3 text-center">
                <div className="font-bold text-[#2c3e50]">10.75</div>
                <div className="text-sm text-gray-600">الرياضيات</div>
              </div>
              <div className="bg-white border border-[#2c3e50]/30 rounded p-3 text-center">
                <div className="font-bold text-[#2c3e50]">13.25</div>
                <div className="text-sm text-gray-600">العلوم الطبيعية</div>
              </div>
              <div className="bg-white border border-[#2c3e50]/30 rounded p-3 text-center">
                <div className="font-bold text-[#2c3e50]">14.7</div>
                <div className="text-sm text-gray-600">التربية الإسلامية</div>
              </div>
            </div>
          </div>

          {/* تحليل حسب الجنس */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-pink-800 mb-4">تحليل حسب الجنس</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-pink-200 rounded p-4">
                <h4 className="font-bold text-pink-700 mb-2">الذكور</h4>
                <div className="space-y-1 text-sm">
                  <div>العدد: 34</div>
                  <div>المعدل العام: 12.9</div>
                  <div>نسبة النجاح: 82%</div>
                </div>
              </div>
              
              <div className="bg-white border border-pink-200 rounded p-4">
                <h4 className="font-bold text-pink-700 mb-2">الإناث</h4>
                <div className="space-y-1 text-sm">
                  <div>العدد: 31</div>
                  <div>المعدل العام: 13.6</div>
                  <div>نسبة النجاح: 87%</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                الإناث تتفوق بـ 0.7 نقطة ونسبة نجاح أعلى بـ 5 نقاط مئوية
              </p>
            </div>
          </div>

          {/* تحليل الفئات الخمسة */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-teal-800 mb-4">تحليل الفئات الخمسة</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white border border-teal-200 rounded p-3 text-center">
                <div className="text-lg font-bold text-red-600">13</div>
                <div className="text-sm text-gray-600">الفئة الضعيفة</div>
                <div className="text-xs text-gray-500">20%</div>
              </div>
              <div className="bg-white border border-teal-200 rounded p-3 text-center">
                <div className="text-lg font-bold text-orange-600">13</div>
                <div className="text-sm text-gray-600">فوق الضعيفة</div>
                <div className="text-xs text-gray-500">20%</div>
              </div>
              <div className="bg-white border border-teal-200 rounded p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">13</div>
                <div className="text-sm text-gray-600">المتوسطة</div>
                <div className="text-xs text-gray-500">20%</div>
              </div>
              <div className="bg-white border border-teal-200 rounded p-3 text-center">
                <div className="text-lg font-bold text-blue-600">13</div>
                <div className="text-sm text-gray-600">فوق المتوسطة</div>
                <div className="text-xs text-gray-500">20%</div>
              </div>
              <div className="bg-white border border-teal-200 rounded p-3 text-center">
                <div className="text-lg font-bold text-green-600">13</div>
                <div className="text-sm text-gray-600">الفئة الجيدة</div>
                <div className="text-xs text-gray-500">20%</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                توزيع متساوٍ تقريباً على كل الفئات
              </p>
            </div>
          </div>

          {/* النتائج النهائية */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">النتائج النهائية</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-right">المادة</th>
                    <th className="border border-gray-300 p-2 text-center">المعدل</th>
                    <th className="border border-gray-300 p-2 text-center">النجاح</th>
                    <th className="border border-gray-300 p-2 text-center">الانحراف</th>
                    <th className="border border-gray-300 p-2 text-center">الإنسجام</th>
                    <th className="border border-gray-300 p-2 text-right">ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">العربية</td>
                    <td className="border border-gray-300 p-2 text-center">11.75</td>
                    <td className="border border-gray-300 p-2 text-center">75%</td>
                    <td className="border border-gray-300 p-2 text-center">2.63</td>
                    <td className="border border-gray-300 p-2 text-center">22.4%</td>
                    <td className="border border-gray-300 p-2">مقبول</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">الرياضيات</td>
                    <td className="border border-gray-300 p-2 text-center">10.75</td>
                    <td className="border border-gray-300 p-2 text-center">50%</td>
                    <td className="border border-gray-300 p-2 text-center">2.36</td>
                    <td className="border border-gray-300 p-2 text-center">22.0%</td>
                    <td className="border border-gray-300 p-2">يحتاج دعم</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">العلوم</td>
                    <td className="border border-gray-300 p-2 text-center">13.25</td>
                    <td className="border border-gray-300 p-2 text-center">100%</td>
                    <td className="border border-gray-300 p-2 text-center">2.63</td>
                    <td className="border border-gray-300 p-2 text-center">19.8%</td>
                    <td className="border border-gray-300 p-2">جيد ومستقر</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* الرسوم المقترحة */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-800 mb-4">الرسوم المقترحة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-cyan-700 mb-2">أنواع الرسوم</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• مخطط شريطي لمعدل كل مادة</li>
                  <li>• منحنى توزيع الدرجات (كل مادة)</li>
                  <li>• مخطط دائري لنسب النجاح</li>
                  <li>• مخطط مزدوج ذكور/إناث</li>
                  <li>• مخطط مكدس للفئات الخمسة</li>
                </ul>
              </div>
              
              <div className="bg-white border border-cyan-200 rounded p-4">
                <h4 className="font-bold text-cyan-700 mb-2">ملاحظة</h4>
                <p className="text-sm text-gray-700">
                  كل رسم يأتي مع تعليق جاهز يشرحه للمستخدم العادي
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'backup',
      title: 'النسخ الاحتياطية',
      icon: Archive,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">النسخ الاحتياطية</h3>
            <p className="text-green-700 mb-4">
              نظام النسخ الاحتياطية يحافظ على جميع بياناتك آمنة ويمكن استعادتها في أي وقت.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                إنشاء نسخة احتياطية
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>انقر على "حفظ نسخة احتياطية" في الصفحة الرئيسية</li>
                <li>أدخل اسم للنسخة الاحتياطية</li>
                <li>اضغط على "حفظ و تحميل"</li>
                <li>سيتم تحميل ملف JSON على جهازك</li>
                <li>احفظ الملف في مكان آمن</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                استعادة نسخة احتياطية
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>انقر على "استيراد نسخة احتياطية"</li>
                <li>اختر ملف النسخة الاحتياطية</li>
                <li>تأكد من الاستعادة</li>
                <li>سيتم استعادة جميع البيانات</li>
                <li>أعد تحميل الصفحة</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-bold text-yellow-800 mb-2">نصائح مهمة</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• احفظ نسخة احتياطية بانتظام</li>
                <li>• احفظ الملفات في مكان آمن</li>
                <li>• تأكد من صحة الملف قبل الاستعادة</li>
                <li>• النسخ الاحتياطية تحتوي على جميع بيانات التطبيق</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">الإعدادات</h3>
            <p className="text-gray-700 mb-4">
              قسم الإعدادات يتيح لك تخصيص التطبيق حسب احتياجاتك.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إعدادات المدرسة</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• اسم المتوسطة</li>
                <li>• عنوان المتوسطة</li>
                <li>• اسم الثانوية</li>
                <li>• عنوان الثانوية</li>
                <li>• معلومات الاتصال</li>
                <li>• الشعار</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إعدادات المستخدم</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• اسم المستشار</li>
                <li>• تخصص المستشار</li>
                <li>• معلومات الاتصال</li>
                <li>• كلمة المرور</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">إعدادات النظام</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• اللغة</li>
                <li>• التوقيت</li>
                <li>• تنسيق التاريخ</li>
                <li>• إعدادات الطباعة</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find(section => section.id === activeSection);
  const currentIndex = sections.findIndex(section => section.id === activeSection);

  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">نظام تفتاح</h1>
                <p className="text-gray-600">دليل شامل لاستخدام نظام تفتاح</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === sections.length - 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">فهرس المحتويات</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              {currentSection && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <currentSection.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentSection.title}</h2>
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    {currentSection.content}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} من {sections.length}
            </span>
          </div>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === sections.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;