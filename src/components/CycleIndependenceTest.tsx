import React, { useState, useEffect } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { useCycleStorage } from '../hooks/useCycleStorage';
import { clearAllCycleData } from '../lib/storage';

interface TestData {
  testValue: string;
  timestamp: string;
  cycle: string;
}

const CycleIndependenceTest: React.FC = () => {
  const { currentCycle, switchCycleWithConfirmation } = useCycle();
  const { getStorage, setStorage } = useCycleStorage();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [collegeData, setCollegeData] = useState<TestData | null>(null);
  const [highSchoolData, setHighSchoolData] = useState<TestData | null>(null);

  useEffect(() => {
    loadTestData();
  }, [currentCycle]);

  const loadTestData = () => {
    const data = getStorage('testData');
    setTestData(data);
    
    // Charger les données des deux cycles pour comparaison
    const collegeData = getStorage('testData', 'متوسط');
    const highSchoolData = getStorage('testData', 'ثانوي');
    setCollegeData(collegeData);
    setHighSchoolData(highSchoolData);
  };

  const createTestData = () => {
    const newData: TestData = {
      testValue: `Test data for ${currentCycle} cycle`,
      timestamp: new Date().toISOString(),
      cycle: currentCycle
    };
    
    setStorage('testData', newData);
    loadTestData();
  };

  const clearCurrentCycleData = async () => {
    if (confirm(`هل أنت متأكد من حذف جميع بيانات دورة ${currentCycle}؟`)) {
      await clearAllCycleData(currentCycle);
      loadTestData();
      alert(`تم حذف جميع بيانات دورة ${currentCycle} بنجاح`);
    }
  };

  const switchCycle = async () => {
    const targetCycle = currentCycle === 'متوسط' ? 'ثانوي' : 'متوسط';
    const confirmed = await switchCycleWithConfirmation(targetCycle);
    if (confirmed) {
      loadTestData();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        اختبار استقلالية الدورات التعليمية
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cycle Status */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            الحالة الحالية
          </h3>
          <p className="text-blue-700">
            <strong>الدورة الحالية:</strong> {currentCycle}
          </p>
          <p className="text-blue-700">
            <strong>البيانات المحفوظة:</strong> {testData ? 'موجودة' : 'غير موجودة'}
          </p>
          {testData && (
            <div className="mt-2 text-sm text-blue-600">
              <p>القيمة: {testData.testValue}</p>
              <p>الوقت: {new Date(testData.timestamp).toLocaleString('ar-SA')}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            الإجراءات
          </h3>
          <div className="space-y-2">
            <button
              onClick={createTestData}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              إنشاء بيانات اختبار للدورة الحالية
            </button>
            <button
              onClick={switchCycle}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              تبديل إلى {currentCycle === 'متوسط' ? 'ثانوي' : 'متوسط'}
            </button>
            <button
              onClick={clearCurrentCycleData}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              حذف بيانات الدورة الحالية
            </button>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          مقارنة البيانات بين الدورات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-gray-700">دورة المتوسط</h4>
            {collegeData ? (
              <div className="text-sm text-gray-600">
                <p>القيمة: {collegeData.testValue}</p>
                <p>الوقت: {new Date(collegeData.timestamp).toLocaleString('ar-SA')}</p>
              </div>
            ) : (
              <p className="text-gray-500">لا توجد بيانات</p>
            )}
          </div>
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-gray-700">دورة الثانوي</h4>
            {highSchoolData ? (
              <div className="text-sm text-gray-600">
                <p>القيمة: {highSchoolData.testValue}</p>
                <p>الوقت: {new Date(highSchoolData.timestamp).toLocaleString('ar-SA')}</p>
              </div>
            ) : (
              <p className="text-gray-500">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          تعليمات الاختبار
        </h3>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• أنشئ بيانات اختبار للدورة الحالية</li>
          <li>• بدّل إلى الدورة الأخرى وتأكد من عدم وجود البيانات</li>
          <li>• أنشئ بيانات مختلفة للدورة الثانية</li>
          <li>• بدّل بين الدورات وتأكد من استقلالية البيانات</li>
          <li>• اختبر حذف بيانات دورة واحدة دون تأثر الأخرى</li>
        </ul>
      </div>
    </div>
  );
};

export default CycleIndependenceTest;