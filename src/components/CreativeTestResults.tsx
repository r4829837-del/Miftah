import React from 'react';
import { Brain, TrendingUp, Star, Lightbulb, X } from 'lucide-react';

interface CreativeTestResultsProps {
  score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
  onClose: () => void;
}

export default function CreativeTestResults({ 
  score, 
  analysis, 
  strengths, 
  recommendations, 
  onClose 
}: CreativeTestResultsProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'مبدع جداً';
    if (score >= 80) return 'مبدع';
    if (score >= 70) return 'إبداعي جيد';
    if (score >= 60) return 'إبداعي مقبول';
    return 'يحتاج تطوير إبداعي';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 border-b rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">نتائج اختبار التفكير الإبداعي</h2>
                <p className="text-purple-100">تحليل شامل لقدراتك الإبداعية</p>
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

        <div className="p-4 overflow-auto max-h-[calc(95vh-100px)]">
          <div className="space-y-6">
          {/* Score Section */}
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6">
            <div className="text-center">
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">نقاط القوة</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">التوصيات للتطوير</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Tips */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-800 mb-4">نصائح لتعزيز الإبداع</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700">ممارسات يومية</h4>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• خصص وقتاً للتفكير الحر يومياً</li>
                  <li>• اقرأ في مجالات متنوعة</li>
                  <li>• مارس الكتابة الإبداعية</li>
                  <li>• استمع للموسيقى المتنوعة</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700">أنشطة إبداعية</h4>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• الرسم والتلوين</li>
                  <li>• العزف على آلة موسيقية</li>
                  <li>• ممارسة الرياضة الإبداعية</li>
                  <li>• المشاركة في ورش إبداعية</li>
                </ul>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}