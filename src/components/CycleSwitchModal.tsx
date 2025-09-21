import React from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

interface CycleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentCycleTitle: string;
  targetCycleTitle: string;
  currentCycleName: string;
  targetCycleName: string;
}

const CycleSwitchModal: React.FC<CycleSwitchModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentCycleTitle,
  targetCycleTitle,
  currentCycleName,
  targetCycleName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">تأكيد تغيير المرحلة</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            هل أنت متأكد من تغيير المرحلة التعليمية؟
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">المرحلة الحالية:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-blue-600">{currentCycleTitle}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="mx-2 text-gray-400">↓</div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">المرحلة المطلوبة:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-semibold text-purple-600">{targetCycleTitle}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                سيتم حفظ عملك الحالي تلقائياً قبل التغيير
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            تأكيد التغيير
          </button>
        </div>
      </div>
    </div>
  );
};

export default CycleSwitchModal;