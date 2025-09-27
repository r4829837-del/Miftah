import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X, CheckCircle, RefreshCw } from 'lucide-react';
import { useCycleIsolation } from '../hooks/useCycleIsolation';

interface IsolationAlertProps {
  onDismiss?: () => void;
}

const IsolationAlert: React.FC<IsolationAlertProps> = ({ onDismiss }) => {
  const { isolationStatus, checkIsolation, isIsolated } = useCycleIsolation();
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isolationStatus && !isolationStatus.isValid) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isolationStatus]);

  const handleCheck = async () => {
    setIsChecking(true);
    await checkIsolation();
    setIsChecking(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || isIsolated) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">
                مشكلة في عزل البيانات
              </h3>
            </div>
            
            <p className="text-sm text-red-700 mb-3">
              تم اكتشاف مشاكل في عزل البيانات بين الدورات التعليمية. 
              قد يكون هناك خلط بين بيانات المتوسط والثانوي.
            </p>

            {isolationStatus && isolationStatus.violations.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-red-800 mb-1">المشاكل المكتشفة:</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {isolationStatus.violations.slice(0, 3).map((violation, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{violation}</span>
                    </li>
                  ))}
                  {isolationStatus.violations.length > 3 && (
                    <li className="text-red-500 text-xs">
                      و {isolationStatus.violations.length - 3} مشكلة أخرى...
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCheck}
                disabled={isChecking}
                className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors text-sm"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'فحص...' : 'فحص العزل'}</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <X className="w-3 h-3" />
                <span>إخفاء</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IsolationAlert;