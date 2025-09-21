import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  BookOpen, 
  GraduationCap,
  Plus,
  X,
  Palette,
  Users,
  Calendar,
  Book,
  BarChart3,
  Bell,
  Clock,
  Target
} from 'lucide-react';
import { useCycle } from '../contexts/CycleContext';
import { CycleType, CycleConfig } from '../contexts/CycleContext';

interface CycleConfigurationProps {
  onClose: () => void;
}

const CycleConfiguration: React.FC<CycleConfigurationProps> = ({ onClose }) => {
  const { 
    currentCycle, 
    getCycleConfig, 
    updateCycleConfig, 
    getAvailableCycles 
  } = useCycle();
  
  const [selectedCycle, setSelectedCycle] = useState<CycleType>(currentCycle);
  const [config, setConfig] = useState<CycleConfig>(getCycleConfig(currentCycle));
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(getCycleConfig(selectedCycle));
    setErrors({});
  }, [selectedCycle, getCycleConfig]);

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.schoolName?.trim()) {
      newErrors.schoolName = 'اسم المدرسة مطلوب';
    }

    if (!config.levels || config.levels.length === 0) {
      newErrors.levels = 'يجب تحديد مستوى واحد على الأقل';
    }

    if (!config.academicYear?.trim()) {
      newErrors.academicYear = 'السنة الدراسية مطلوبة';
    }

    if (config.maxStudentsPerClass && config.maxStudentsPerClass < 1) {
      newErrors.maxStudentsPerClass = 'عدد الطلاب يجب أن يكون أكبر من 0';
    }

    if (config.gradingScale) {
      if (config.gradingScale.min >= config.gradingScale.max) {
        newErrors.gradingScale = 'الحد الأدنى يجب أن يكون أقل من الحد الأقصى';
      }
      if (config.gradingScale.passingGrade < config.gradingScale.min || 
          config.gradingScale.passingGrade > config.gradingScale.max) {
        newErrors.passingGrade = 'درجة النجاح يجب أن تكون ضمن النطاق المحدد';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateConfig()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateCycleConfig(selectedCycle, config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving cycle config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConfig(getCycleConfig(selectedCycle));
    setErrors({});
  };

  const addItem = (field: 'levels' | 'subjects' | 'semesters' | 'groups', value: string) => {
    if (value.trim()) {
      setConfig(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeItem = (field: 'levels' | 'subjects' | 'semesters' | 'groups', index: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateFeature = (feature: keyof NonNullable<CycleConfig['features']>, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const updateGradingScale = (field: keyof NonNullable<CycleConfig['gradingScale']>, value: number) => {
    setConfig(prev => ({
      ...prev,
      gradingScale: {
        ...prev.gradingScale!,
        [field]: value
      }
    }));
  };

  const updateAppearance = (field: keyof NonNullable<CycleConfig['appearance']>, value: string) => {
    setConfig(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
  };

  const cycles = getAvailableCycles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">تكوين الدورات التعليمية</h2>
                <p className="text-blue-100">إعدادات مستقلة لكل دورة تعليمية</p>
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

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Cycle Selection */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اختر الدورة</h3>
            <div className="space-y-2">
              {cycles.map((cycle) => (
                <button
                  key={cycle.name}
                  onClick={() => setSelectedCycle(cycle.name as CycleType)}
                  className={`w-full p-3 rounded-lg text-right transition-all ${
                    selectedCycle === cycle.name
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {cycle.name === 'متوسط' ? (
                      <BookOpen className="w-5 h-5" />
                    ) : (
                      <GraduationCap className="w-5 h-5" />
                    )}
                    <div>
                      <div className="font-medium">{cycle.title}</div>
                      <div className="text-sm text-gray-500">{cycle.schoolName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {saveSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <Check className="w-5 h-5 mr-2" />
                تم حفظ الإعدادات بنجاح
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Book className="w-5 h-5 mr-2" />
                  المعلومات الأساسية
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المدرسة *
                    </label>
                    <input
                      type="text"
                      value={config.schoolName || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, schoolName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.schoolName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أدخل اسم المدرسة"
                    />
                    {errors.schoolName && (
                      <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السنة الدراسية *
                    </label>
                    <input
                      type="text"
                      value={config.academicYear || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, academicYear: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.academicYear ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="مثال: 2024-2025"
                    />
                    {errors.academicYear && (
                      <p className="text-red-500 text-sm mt-1">{errors.academicYear}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحد الأقصى للطلاب في الفصل
                    </label>
                    <input
                      type="number"
                      value={config.maxStudentsPerClass || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxStudentsPerClass: parseInt(e.target.value) || undefined }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.maxStudentsPerClass ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="30"
                      min="1"
                    />
                    {errors.maxStudentsPerClass && (
                      <p className="text-red-500 text-sm mt-1">{errors.maxStudentsPerClass}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Grading Scale */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  نظام التقييم
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحد الأدنى
                      </label>
                      <input
                        type="number"
                        value={config.gradingScale?.min || ''}
                        onChange={(e) => updateGradingScale('min', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحد الأقصى
                      </label>
                      <input
                        type="number"
                        value={config.gradingScale?.max || ''}
                        onChange={(e) => updateGradingScale('max', parseInt(e.target.value) || 20)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      درجة النجاح
                    </label>
                    <input
                      type="number"
                      value={config.gradingScale?.passingGrade || ''}
                      onChange={(e) => updateGradingScale('passingGrade', parseInt(e.target.value) || 10)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.passingGrade ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10"
                    />
                    {errors.passingGrade && (
                      <p className="text-red-500 text-sm mt-1">{errors.passingGrade}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Levels Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  المستويات الدراسية *
                </h3>
                
                <div className="space-y-3">
                  {config.levels?.map((level, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={level}
                        onChange={(e) => {
                          const newLevels = [...(config.levels || [])];
                          newLevels[index] = e.target.value;
                          setConfig(prev => ({ ...prev, levels: newLevels }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => removeItem('levels', index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="أضف مستوى جديد"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addItem('levels', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addItem('levels', input.value);
                        input.value = '';
                      }}
                      className="text-blue-500 hover:text-blue-700 p-1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {errors.levels && (
                    <p className="text-red-500 text-sm">{errors.levels}</p>
                  )}
                </div>
              </div>

              {/* Features Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  الميزات المتاحة
                </h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'enableReports', label: 'التقارير', icon: BarChart3 },
                    { key: 'enableTests', label: 'الاختبارات', icon: Book },
                    { key: 'enableGoals', label: 'الأهداف', icon: Target },
                    { key: 'enableNews', label: 'الأخبار', icon: Bell },
                    { key: 'enableSchedule', label: 'الجدولة', icon: Calendar },
                    { key: 'enableAnalysis', label: 'التحليل', icon: BarChart3 }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.features?.[key as keyof NonNullable<CycleConfig['features']>] || false}
                          onChange={(e) => updateFeature(key as keyof NonNullable<CycleConfig['features']>, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                إعادة تعيين
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    حفظ الإعدادات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleConfiguration;