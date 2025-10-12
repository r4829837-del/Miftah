import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';

function MethodGuide() {
  const navigate = useNavigate();
  const [pdfError, setPdfError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleBackToDashboard = () => navigate('/');

  const handlePdfLoad = () => {
    setIsLoading(false);
    setPdfError(false);
  };

  const handlePdfError = () => {
    setIsLoading(false);
    setPdfError(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/dalil.pdf';
    link.download = 'الدليل_المنهجي.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    window.open('/dalil.pdf', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة إلى لوحة التحكم</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">الدليل المنهجي</h1>
            <p className="text-gray-600 text-lg">دليل شامل للمنهج الدراسي والإجراءات التربوية</p>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-96 bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">جاري تحميل الدليل المنهجي...</p>
              </div>
            </div>
          )}

          {pdfError && (
            <div className="flex items-center justify-center h-96 bg-red-50">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-800 mb-2">خطأ في تحميل الملف</h3>
                <p className="text-red-600 mb-4">تعذر تحميل الدليل المنهجي. يرجى المحاولة مرة أخرى.</p>
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setPdfError(false);
                    // Force reload the iframe
                    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = iframe.src;
                    }
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}

          <div className="w-full border-0">
            <iframe
              id="pdf-iframe"
              title="الدليل المنهجي"
              src="/dalil.pdf"
              className="w-full h-[80vh] border-0"
              onLoad={handlePdfLoad}
              onError={handlePdfError}
              style={{ display: isLoading || pdfError ? 'none' : 'block' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>تحميل الدليل</span>
              </button>
              
              <button
                onClick={handleOpenNewTab}
                className="flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span>فتح في صفحة جديدة</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
              <FileText className="w-5 h-5" />
              <span className="text-sm">PDF - دليل منهجي شامل</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">معلومات عن الدليل المنهجي</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">المحتوى:</h4>
              <ul className="space-y-1 text-sm">
                <li>• المناهج الدراسية لكل المستويات</li>
                <li>• الإجراءات التربوية والإدارية</li>
                <li>• دليل المدرسين والطلاب</li>
                <li>• الأنظمة والقوانين المدرسية</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">الاستخدام:</h4>
              <ul className="space-y-1 text-sm">
                <li>• يمكن تصفحه مباشرة في الصفحة</li>
                <li>• تحميل للاستخدام دون اتصال</li>
                <li>• فتح في نافذة منفصلة للطباعة</li>
                <li>• متوافق مع جميع الأجهزة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MethodGuide;

