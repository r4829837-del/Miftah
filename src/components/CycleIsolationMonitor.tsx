import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Shield, Trash2, RefreshCw } from 'lucide-react';
import { useCycleIsolation } from '../hooks/useCycleIsolation';

interface CycleIsolationMonitorProps {
  showDetails?: boolean;
  className?: string;
}

const CycleIsolationMonitor: React.FC<CycleIsolationMonitorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { 
    currentCycle, 
    isolationStatus, 
    checkIsolation, 
    clearCurrentCycleData,
    isIsolated 
  } = useCycleIsolation();
  
  const [isClearing, setIsClearing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setLastCheck(now);
  }, [isolationStatus]);

  const handleClearData = async () => {
    const confirmMessage = `هل أنت متأكد من حذف جميع بيانات المرحلة ${currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة'}؟\n\nسيتم حذف:\n• جميع الطلاب\n• جميع الاختبارات\n• جميع النتائج\n• جميع التقارير\n• جميع الإحصائيات\n\nهذا الإجراء لا يمكن التراجع عنه.`;
    
    if (window.confirm(confirmMessage)) {
      setIsClearing(true);
      try {
        await clearCurrentCycleData();
        alert(`تم حذف جميع بيانات المرحلة ${currentCycle === 'ثانوي' ? 'الثانوية' : 'المتوسطة'} بنجاح`);
      } catch (error) {
        alert('حدث خطأ أثناء الحذف');
        console.error('Erreur lors du nettoyage:', error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const getStatusColor = () => {
    if (!isolationStatus) return 'text-gray-500';
    return isolationStatus.isValid ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (!isolationStatus) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return isolationStatus.isValid ? 
      <CheckCircle className="w-4 h-4" /> : 
      <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isolationStatus) return 'جاري الفحص...';
    return isolationStatus.isValid ? 
      'البيانات معزولة بشكل صحيح' : 
      'تم اكتشاف مشاكل في العزل';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        <div className="text-xs text-gray-500">
          {currentCycle === 'ثانوي' ? 'ثانوي' : 'متوسط'}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            مراقب عزل البيانات
          </h3>
        </div>
        <button
          onClick={checkIsolation}
          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">فحص</span>
        </button>
      </div>

      {/* Statut principal */}
      <div className="mb-4">
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          المرحلة الحالية: {currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}
        </div>
        {lastCheck && (
          <div className="text-xs text-gray-500 mt-1">
            آخر فحص: {lastCheck.toLocaleTimeString('ar-SA')}
          </div>
        )}
      </div>

      {/* Détails des violations */}
      {isolationStatus && !isolationStatus.isValid && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 mb-2">مشاكل مكتشفة:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {isolationStatus.violations.map((violation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{violation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommandations */}
      {isolationStatus && isolationStatus.recommendations.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">التوصيات:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {isolationStatus.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleClearData}
          disabled={isClearing}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">
            {isClearing ? 'جاري الحذف...' : 'حذف بيانات المرحلة'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CycleIsolationMonitor;