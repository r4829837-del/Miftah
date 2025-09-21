import React from 'react';
import { Brain, TrendingUp, Target, Lightbulb, Users, Award } from 'lucide-react';

interface CognitiveTestResultsProps {
  score: number;
  analysis: string;
  strengths: string[];
  recommendations: string[];
  onClose: () => void;
}

export default function CognitiveTestResults({ 
  score, 
  analysis, 
  strengths, 
  recommendations, 
  onClose 
}: CognitiveTestResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'يحتاج تحسين';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">نتائج اختبار القدرات الفكرية</h2>
                <p className="text-blue-100">تحليل شامل لقدراتك العقلية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
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
                <Award className="w-6 h-6 text-green-600" />
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">التوصيات للتطوير</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">نصائح إضافية</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">للتحسين المستمر</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ممارسة الألعاب الذهنية يومياً</li>
                  <li>• قراءة الكتب في مجالات متنوعة</li>
                  <li>• حل الألغاز والمسائل الرياضية</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">للتطوير المهني</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• اختيار التخصصات المناسبة لقدراتك</li>
                  <li>• المشاركة في المشاريع الإبداعية</li>
                  <li>• تطوير مهارات التفكير النقدي</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              إغلاق النتائج
            </button>
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              طباعة النتائج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}