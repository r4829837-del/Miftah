import React from 'react';
import { Users, TrendingUp, Star, Lightbulb, X, Heart, Handshake, Globe, Crown } from 'lucide-react';

interface SocialTestResultsProps {
  score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
  onClose: () => void;
}

export default function SocialTestResults({ 
  score, 
  analysis, 
  strengths, 
  recommendations, 
  onClose 
}: SocialTestResultsProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'متميز اجتماعياً';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'يحتاج تطوير';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Users className="w-8 h-8 text-green-600" />;
    if (score >= 60) return <Users className="w-8 h-8 text-yellow-600" />;
    return <Users className="w-8 h-8 text-red-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">نتائج اختبار المهارات الاجتماعية</h2>
                <p className="text-green-100">تحليل شامل لقدراتك الاجتماعية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Section */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getScoreIcon(score)}
              </div>
              <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                {score}%
              </div>
              <div className="text-xl font-semibold text-gray-700 mb-4">
                {getScoreLevel(score)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    score >= 80 ? 'bg-green-500' : 
                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">التحليل الشخصي</h3>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              {analysis}
            </p>
          </div>

          {/* Strengths Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">نقاط القوة</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">التوصيات للتطوير</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Skills Tips */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">نصائح لتعزيز المهارات الاجتماعية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">التعاطف والاستماع</h4>
                    <ul className="text-sm text-green-600 space-y-1">
                      <li>• استمع باهتمام للآخرين</li>
                      <li>• حاول فهم مشاعرهم</li>
                      <li>• اظهر الاهتمام بما يقولونه</li>
                      <li>• قدم الدعم عند الحاجة</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Handshake className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">التعاون والعمل الجماعي</h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• شارك في الأنشطة الجماعية</li>
                      <li>• ساعد الآخرين في مشاريعهم</li>
                      <li>• اقدر آراء وأفكار الآخرين</li>
                      <li>• اطلب المساعدة عند الحاجة</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">التكيف والانفتاح</h4>
                    <ul className="text-sm text-purple-600 space-y-1">
                      <li>• تقبل الاختلافات الثقافية</li>
                      <li>• تعلم من تجارب الآخرين</li>
                      <li>• كن منفتحاً على الأفكار الجديدة</li>
                      <li>• تكيف مع المواقف المختلفة</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Crown className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-700 mb-2">القيادة والتواصل</h4>
                    <ul className="text-sm text-yellow-600 space-y-1">
                      <li>• طور مهارات التحدث أمام الجمهور</li>
                      <li>• تعلم حل الخلافات بطرق سلمية</li>
                      <li>• كن لبقاً في تعاملك</li>
                      <li>• شجع الآخرين على التعاون</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Activities Suggestions */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-indigo-800 mb-4">أنشطة مقترحة لتطوير المهارات الاجتماعية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-indigo-100">
                <h4 className="font-semibold text-indigo-700 mb-2">الأنشطة التطوعية</h4>
                <p className="text-sm text-indigo-600">المشاركة في الأعمال التطوعية تساعد على تطوير التعاطف والعمل الجماعي</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-indigo-100">
                <h4 className="font-semibold text-indigo-700 mb-2">النوادي والجمعيات</h4>
                <p className="text-sm text-indigo-600">الانضمام للنوادي يساعد على بناء شبكة علاقات اجتماعية قوية</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-indigo-100">
                <h4 className="font-semibold text-indigo-700 mb-2">ورش العمل</h4>
                <p className="text-sm text-indigo-600">المشاركة في ورش العمل الجماعية يحسن مهارات التواصل والتعاون</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}