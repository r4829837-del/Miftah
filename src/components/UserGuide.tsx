import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const UserGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  // Apply section from URL hash on mount and hash changes
  useEffect(() => {
    const applyFromLocation = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveSection(hash);
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
            <h2 className="text-2xl font-bold text-blue-800 mb-4">دليل تطبيق الصيغ الحسابية في التحاليل</h2>
            <p className="text-blue-700 mb-4">
              أعد هذا الدليل في إطار نظام "مفتاح" لدعم تحليل مستشار (ة) التوجيه - الإصدار 2025
            </p>
            <p className="text-blue-700">
              هذا الدليل يهدف إلى تسهيل فهم التحليل السنوي و تحليل ش.ت.م ودعم العمل الإحصائي لمستشار (ة) التوجيه.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'general-average',
      title: '1. حساب المعدل العام',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">✓</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة المتوسط العام لجميع التلاميذ لتقييم مستوى الصف.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              المعدل العام = مجموع الدرجات ÷ عدد التلاميذ
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: درجات 5 تلاميذ: 12، 15، 14، 11، 16</h4>
            <div className="space-y-2 text-gray-700">
              <p>1. مجموع الدرجات = 12 + 15 + 14 + 11 + 16 = 68</p>
              <p>2. المعدل = 68 ÷ 5 = 13.6</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> جمعنا درجات التلاميذ ثم قسمنا على العدد الكلي 5 لنحصل على المعدل العام 13.6.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'standard-deviation',
      title: '2. حساب الانحراف المعياري',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة تشتت درجات التلاميذ حول المتوسط.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              الانحراف المعياري = √((Σ(الدرجة - المعدل)² ÷ عدد التلاميذ))
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: درجات 5 تلاميذ: 12، 15، 14، 11، 16. المعدل = 13.6</h4>
            <div className="space-y-2 text-gray-700">
              <p>1. (12 - 13.6)² = (-1.6)² = 2.56</p>
              <p>2. (15 - 13.6)² = (1.4)² = 1.96</p>
              <p>3. (14 - 13.6)² = (0.4)² = 0.16</p>
              <p>4. (11 - 13.6)² = (-2.6)² = 6.76</p>
              <p>5. (16 - 13.6)² = (2.4)² = 5.76</p>
              <p className="font-bold">6. مجموع الفروقات = 17.2</p>
              <p className="font-bold">7. 17.2 ÷ 5 = 3.44</p>
              <p className="font-bold">8. الجذر التربيعي لـ 3.44 ≈ 1.85</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> حسبنا فرق كل درجة عن المتوسط مربعناه، جمعناه، قسمناه على عدد التلاميذ ثم أخذنا الجذر التربيعي لتحصل على الانحراف المعياري 1.85.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'success-rate-by-gender',
      title: '3. حساب نسبة النجاح حسب الجنس',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: مقارنة نسب النجاح بين الإناث والذكور لتقييم الأداء حسب الجنس.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة النجاح = (عدد الناجحين ÷ العدد الكلي) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 18 ناجح من أصل 24 تلميذ (10 إناث و 14 ذكور)</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold">1. الإناث: 9 ÷ 10 × 100 = 90%</p>
              <p className="font-bold">2. الذكور: 9 ÷ 14 × 100 ≈ 64.3%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد الناجحين لكل جنس على العدد الكلي تم ضربنا في 100 لنحصل على النسبة المئوية.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'gender-difference',
      title: '4. حساب الفارق بين الجنسين في النجاح',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: تقييم الاختلاف في الأداء بين الذكور والإناث.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              الفارق = نسبة نجاح الإناث - نسبة نجاح الذكور
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: الإناث 90% ، الذكور 64.3%</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">الفارق = 90% - 64.3% = 25.7%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> طرحنا نسبة نجاح الذكور من نسبة نجاح الإنات لنرى الفارق بين الجنسين في النجاح.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'repeaters-analysis',
      title: '5. تحليل نتائج المعيدين',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: تحديد نسبة التلاميذ الذين أعيدوا لتقييم الأداء السنوي.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة المعيدين = (عدد المعيدين ÷ العدد الكلي) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 5 تلاميذ أعيدوا من 50 تلميذ</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">5 ÷ 50 × 100 = 10%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد المعيدين على العدد الكلي تم ضربنا في 100 لتحصل على نسبة المعيدين 10%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'non-repeaters-analysis',
      title: '6. تحليل نتائج غير المعيدين',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة التلاميذ الناجحين من دون إعادة السنة.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة الناجحين = 100 - نسبة المعيدين
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: نسبة المعيدين 10%</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">نسبة الناجحين = 100% - 10% = 90%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> خصمنا نسبة المعيدين من 100 للحصول على نسبة الناجحين 90%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'transition-rate',
      title: '7. حساب نسبة الانتقال',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة التلاميذ الذين انتقلوا للسنة الأعلى.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة الانتقال = (عدد الناجحين ÷ العدد الكلي) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 45 تلميذ نجحوا من 50</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">45 ÷ 50 × 100 = 90%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد الناجحين على العدد الكلي تم ضربنا في 100 لنحصل على نسبة الانتقال 90%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'failure-rate',
      title: '8. حساب نسبة الرسوب',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة التلاميذ الراسبين.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة الرسوب = 100 - نسبة النجاح
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: نسبة النجاح 90%</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">نسبة الرسوب = 100% - 90% = 10%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> خصمنا نسبة النجاح من 100 للحصول على نسبة الرسوب 10%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'absence-rate',
      title: '9. حساب نسبة الغياب',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة أيام الغياب للتلاميذ.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة الغياب = (عدد أيام الغياب ÷ عدد أيام الدروس) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 15 يوم غياب من 200 يوم درس</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">15 ÷ 200 × 100 = 7.5%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد أيام الغياب على مجموع أيام الدروس تم ضربنا في 100 لتحصل على 7.5%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'subject-average',
      title: '10. حساب المتوسط في مادة معينة',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة متوسط التلاميذ في مادة محددة.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              المتوسط = مجموع درجات المادة ÷ عدد التلاميذ
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: درجات مادة الرياضيات: 12، 14، 15، 13، 16</h4>
            <div className="space-y-2 text-gray-700">
              <p>1. مجموع الدرجات = 12+14+15+13+16 = 70</p>
              <p className="font-bold">2. المتوسط = 70 ÷ 5 = 14</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> جمعنا درجات المادة تم قسمنا على عدد التلاميذ لتحصل على المتوسط 14.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'highest-lowest-average',
      title: '11. حساب أعلى وأدنى معدل',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة أفضل وأسوأ أداء بين التلاميذ.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              أعلى معدل = أكبر درجة، أدنى معدل = أصغر درجة
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: الدرجات: 12، 14، 15، 13، 16</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold">1. أعلى = 16</p>
              <p className="font-bold">2. أدنى = 12</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> اخترنا أكبر وأصغر درجة لمعرفة أعلى وأدنى معدل.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'progress-rate',
      title: '12. حساب نسبة التقدم بين الدورتين',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة مدى تحسن الأداء بين دورتي الدراسة.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة التقدم = ((المعدل الثاني - المعدل الأول) ÷ المعدل الأول) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: المعدل الأول 12، المعدل الثاني 14</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">1. (14-12) ÷ 12 × 100 = 16.67%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> حسبنا الفرق بين المعدل الثاني والأول، قسمناه على الأول تم ضربناه في 100 للحصول على نسبة التقدم.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'excellent-students',
      title: '13. حساب نسبة المتفوقين',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة التلاميذ الذين تفوقوا (≥ 16).</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة المتفوقين = (عدد المتفوقين ÷ العدد الكلي) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 4 متفوقين من 20 تلميذ</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">4 ÷ 20 × 100 = 20%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد المتفوقين على العدد الكلي تم ضربنا في 100 لتحصل على 20%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'average-students',
      title: '14. حساب نسبة التلاميذ في المتوسط',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة التلاميذ الذين حصلوا على معدل 10-15.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة المتوسط = (عدد التلاميذ 10-15 ÷ العدد الكلي) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 8 تلاميذ من 20 ضمن المتوسط</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">8 ÷ 20 × 100 = 40%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد التلاميذ ضمن المتوسط على العدد الكلي تم ضربنا في 100 لنحصل على 40%.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'below-average-students',
      title: '15. حساب نسبة التلاميذ دون المتوسط',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">🎯</div>
            <p className="text-blue-700 font-semibold">الهدف: معرفة نسبة التلاميذ الذين حصلوا على معدل أقل من 10.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800">
              نسبة دون المتوسط = (عدد التلاميذ &lt; 10 ÷ العدد الكلي) × 100
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: 4 تلاميذ من 20 دون المتوسط</h4>
            <div className="space-y-2 text-gray-700">
              <p className="font-bold text-lg">4 ÷ 20 × 100 = 20%</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> قسمنا عدد التلاميذ دون المتوسط على العدد الكلي تم ضربنا في 100 لتحصل على 20%.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-700 text-sm">
              <span className="font-bold">ملاحظة:</span> جميع الصيغ الحسابية أعلاه تدعم تحليل النتائج السنوية وتحليلات شهادة التعليم المتوسط.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'orientation-calculation',
      title: '16. حساب معدل التقويم ومعدل الانتقال والتوجيه',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3">✓</div>
            <p className="text-blue-700 font-semibold">الهدف: حساب معدل التقويم ومعدل الانتقال لتحديد التوجيه النهائي.</p>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 text-center">
            <p className="text-xl font-bold text-blue-800 mb-4">
              معدل التقويم = (الفصل الأول + الفصل الثاني + الفصل الثالث) ÷ 3
            </p>
            <p className="text-xl font-bold text-blue-800 mb-4">
              معدل الانتقال = (معدل ش.ت.م + معدل التقويم) ÷ 2
            </p>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">مثال: درجات الفصول الثلاثة: 12، 14، 16</h4>
            <div className="space-y-2 text-gray-700">
              <p>1. معدل التقويم = (12 + 14 + 16) ÷ 3 = 42 ÷ 3 = 14</p>
              <p>2. معدل ش.ت.م = 13.5 (مثال)</p>
              <p className="font-bold">3. معدل الانتقال = (13.5 + 14) ÷ 2 = 27.5 ÷ 2 = 13.75</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-bold text-green-800 mb-3">التوجيه النهائي:</h4>
            <div className="space-y-3 text-green-700">
              <div className="bg-white rounded-lg p-4 border border-green-300">
                <p className="font-bold text-lg">• جدع مشترك علوم</p>
                <p className="text-sm">يتم التوجيه إليه عند تفوق التلميذ في المواد العلمية (الرياضيات، العلوم الفيزيائية، العلوم الطبيعية)</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-300">
                <p className="font-bold text-lg">• جدع مشترك آداب</p>
                <p className="text-sm">يتم التوجيه إليه عند تفوق التلميذ في المواد الأدبية (اللغة العربية، التاريخ والجغرافيا، الفلسفة)</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">
              <span className="font-bold">الشرح:</span> التوجيه يعتمد على أداء التلميذ في المواد العلمية مقابل الأدبية. يتم مقارنة معدلات المواد العلمية والأدبية لتحديد المسار الأنسب للتلميذ.
            </p>
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
                <h1 className="text-3xl font-bold text-gray-900">دليل الحساب</h1>
                <p className="text-gray-600">دليل شامل لتطبيق الصيغ الحسابية في التحاليل</p>
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