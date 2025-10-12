import React from 'react';
import { X } from 'lucide-react';
import ReportCharts from './ReportCharts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: {
    title: string;
    average: number;
    totals: {
      totalStudents: number;
      excellent: number;
      good: number;
      average: number;
      weak: number;
    };
    subjects: Array<{
      name: string;
      average: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    topPerformers: Array<{
      studentName: string;
      average: number;
    }>;
  };
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{reportData.title} - الرسوم البيانية</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <ReportCharts data={reportData} />
        </div>
      </div>
    </div>
  );
};

export default ReportModal;