import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, School, GraduationCap, Save, Check, Database, Cog, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import { getSettings, updateSettings, type AppSettings, forceUpdateTimezone } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import DatabaseManager from './DatabaseManager';

const timezones = [
  { id: 'Africa/Algiers', label: 'توقيت الجزائر (GMT+1)' },
  { id: 'Africa/Tunis', label: 'توقيت تونس (GMT+1)' },
  { id: 'Africa/Casablanca', label: 'توقيت المغرب (GMT+1)' },
  { id: 'Africa/Cairo', label: 'توقيت القاهرة (GMT+2)' },
  { id: 'Asia/Riyadh', label: 'توقيت الرياض (GMT+3)' }
];

// Fonction pour obtenir les sections de paramètres selon le cycle - Version simplifiée
const getSettingsSections = (currentCycle: string, getCycleConfig: any) => [
  {
    id: 'profile',
    title: 'الملف الشخصي',
    icon: User,
    settings: [
      { id: 'counselorName', label: <span><strong>مستشار(ة) التوجيه:</strong></span>, type: 'input' }
    ]
  },
  {
    id: 'school',
    title: `إعدادات ${getCycleConfig(currentCycle).schoolName}`,
    icon: currentCycle === 'ثانوي' ? GraduationCap : School,
    settings: [
      { 
        id: 'schoolName', 
        label: <span><strong>{getCycleConfig(currentCycle).schoolName}:</strong></span>, 
        type: 'input' 
      }
    ]
  },
  {
    id: 'cycles',
    title: 'تكوين الدورات التعليمية',
    icon: Cog,
    settings: [
      { id: 'cycleConfig', label: 'إعدادات الدورات', type: 'cycleConfig' },
      { id: 'cycleBackup', label: 'النسخ الاحتياطية', type: 'cycleBackup' }
    ]
  }
];

const defaultSettings: AppSettings = {
  schoolName: '',
  counselorName: '',
  highSchoolName: '',
  highSchoolAddress: '',
  levels: [],
  groups: [],
  semesters: [],
  timezone: 'Africa/Tunis',
  enabledSections: {
    general: true,
    notifications: true,
    security: true,
    profile: true,
    school: true,
    highschool: true,
    levels: true,
    groups: true,
    semesters: true
  }
};

function Settings() {
  const { getCycleConfig, updateCycleConfig, getAvailableCycles, currentCycle } = useCycle();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);
  const [editingCycle, setEditingCycle] = useState<string | null>(null);
  const [cycleConfigs, setCycleConfigs] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
    loadCycleConfigs();
  }, []);

  // Recharger les paramètres quand le cycle change
  useEffect(() => {
    loadSettings();
  }, [currentCycle]);

  // Recharger les configurations des cycles quand elles changent
  useEffect(() => {
    loadCycleConfigs();
  }, [getCycleConfig]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings(currentCycle);
      setSettings({
        ...defaultSettings,
        ...loadedSettings,
        enabledSections: {
          ...defaultSettings.enabledSections,
          ...(loadedSettings.enabledSections || {})
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCycleConfigs = async () => {
    try {
      const configs: Record<string, any> = {};
      getAvailableCycles().forEach(cycle => {
        configs[cycle.name] = getCycleConfig(cycle.name as 'متوسط' | 'ثانوي');
      });
      setCycleConfigs(configs);
    } catch (error) {
      console.error('Error loading cycle configs:', error);
    }
  };

  const handleSettingChange = async (key: keyof AppSettings, value: string | boolean) => {
    const updatedSettings = await updateSettings({ [key]: value }, currentCycle);
    setSettings(prev => ({
      ...prev,
      ...updatedSettings,
      enabledSections: {
        ...prev.enabledSections,
        ...(updatedSettings.enabledSections || {})
      }
    }));
    setIsEditing({ ...isEditing, [key]: false });
    showSaveSuccess();
  };

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    await handleSettingChange('password', newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsEditing({ ...isEditing, password: false });
    showSaveSuccess();
  };

  const handleTwoFactorToggle = async () => {
    await handleSettingChange('twoFactorEnabled', !settings.twoFactorEnabled);
    showSaveSuccess();
  };

  const handleSectionToggle = async (sectionId: keyof AppSettings['enabledSections']) => {
    const updatedEnabledSections = {
      ...settings.enabledSections,
      [sectionId]: !settings.enabledSections[sectionId]
    };
    const updatedSettings = await updateSettings({ enabledSections: updatedEnabledSections });
    setSettings(prev => ({
      ...prev,
      ...updatedSettings,
      enabledSections: {
        ...prev.enabledSections,
        ...(updatedSettings.enabledSections || {})
      }
    }));
    showSaveSuccess();
  };



  const handleCycleConfigChange = async (cycleName: string, field: string, value: string) => {
    try {
      await updateCycleConfig(cycleName as 'متوسط' | 'ثانوي', { [field]: value });
      setCycleConfigs(prev => ({
        ...prev,
        [cycleName]: { ...prev[cycleName], [field]: value }
      }));
      // Recharger les configurations pour s'assurer que les changements sont persistés
      await loadCycleConfigs();
      showSaveSuccess();
    } catch (error) {
      console.error('Error updating cycle config:', error);
    }
  };

  const handleAddCycleLevel = async (cycleName: string, level: string) => {
    if (level.trim()) {
      const currentLevels = cycleConfigs[cycleName]?.levels || [];
      const updatedLevels = [...currentLevels, level.trim()];
      await updateCycleConfig(cycleName as 'متوسط' | 'ثانوي', { levels: updatedLevels });
      setCycleConfigs(prev => ({
        ...prev,
        [cycleName]: { ...prev[cycleName], levels: updatedLevels }
      }));
    }
  };

  const handleRemoveCycleLevel = async (cycleName: string, levelToRemove: string) => {
    const currentLevels = cycleConfigs[cycleName]?.levels || [];
    const updatedLevels = currentLevels.filter((level: string) => level !== levelToRemove);
    await updateCycleConfig(cycleName as 'متوسط' | 'ثانوي', { levels: updatedLevels });
    setCycleConfigs(prev => ({
      ...prev,
      [cycleName]: { ...prev[cycleName], levels: updatedLevels }
    }));
  };


  const handleForceUpdateTimezone = async () => {
    try {
      await forceUpdateTimezone();
      await loadSettings();
      showSaveSuccess();
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  };

  const renderSettingContent = (setting: any) => {
    switch (setting.type) {
      case 'timezone':
        return (
          <div className="flex items-center gap-2">
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              {timezones.map(tz => (
                <option key={tz.id} value={tz.id}>{tz.label}</option>
              ))}
            </select>
            {settings.timezone === 'Africa/Tunis' && (
              <button
                onClick={handleForceUpdateTimezone}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                تحديث إلى الجزائر
              </button>
            )}
          </div>
        );

      case 'password':
        return isEditing[setting.id] ? (
          <div className="space-y-2">
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="px-2 py-1 border rounded ml-2"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تأكيد كلمة المرور"
                className="px-2 py-1 border rounded"
              />
            </div>
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="text-green-500 hover:text-green-600 px-2 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing({ ...isEditing, [setting.id]: false });
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="text-red-500 hover:text-red-600 px-2"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing({ ...isEditing, [setting.id]: true })}
            className="text-blue-500 hover:text-blue-600"
          >
            تعديل
          </button>
        );
      
      case 'toggle':
        return (
          <button
            onClick={handleTwoFactorToggle}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
          >
            {settings.twoFactorEnabled ? (
              <>
                <span>مفعلة</span>
                <ToggleRight className="w-6 h-6" />
              </>
            ) : (
              <>
                <span>غير مفعلة</span>
                <ToggleLeft className="w-6 h-6" />
              </>
            )}
          </button>
        );

      case 'input':
        return isEditing[setting.id] ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={String(settings[setting.id as keyof AppSettings] || '')}
              onChange={(e) => setSettings({ ...settings, [setting.id]: e.target.value })}
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={() => handleSettingChange(setting.id as keyof AppSettings, String(settings[setting.id as keyof AppSettings] || ''))}
              className="text-green-500 hover:text-green-600 px-2 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              <span>حفظ</span>
            </button>
            <button
              onClick={() => setIsEditing({ ...isEditing, [setting.id]: false })}
              className="text-red-500 hover:text-red-600 px-2"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing({ ...isEditing, [setting.id]: true })}
            className="text-blue-500 hover:text-blue-600"
          >
            {String(settings[setting.id as keyof AppSettings] || 'تعديل')}
          </button>
        );

      case 'cycleConfig':
        return (
          <div className="text-gray-500 text-sm">
            تكوين الدورات (قيد التطوير)
          </div>
        );

      case 'cycleBackup':
        return (
          <div className="text-gray-500 text-sm">
            النسخ الاحتياطية (قيد التطوير)
          </div>
        );

      default:
        return (
          <button className="text-blue-500 hover:text-blue-600">
            {setting.value}
          </button>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-down">
          <Check className="w-5 h-5" />
          <span>تم حفظ الإعدادات بنجاح</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
          <p className="text-sm text-gray-600 mt-1">
            إعدادات خاصة بدورة {currentCycle === 'ثانوي' ? 'التعليم الثانوي' : 'التعليم المتوسط'}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDatabaseManager(!showDatabaseManager)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Database className="w-5 h-5" />
            <span>{showDatabaseManager ? 'إخفاء' : 'إدارة قاعدة البيانات'}</span>
          </button>
        </div>
      </div>


      {/* Database Manager Section */}
      {showDatabaseManager && (
        <div className="mb-6">
          <DatabaseManager />
        </div>
      )}

      <div className="space-y-6">
        {/* Original settings sections */}
        {getSettingsSections(currentCycle, getCycleConfig).map((section) => (
          <div key={section.id} className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${settings.enabledSections[section.id as keyof AppSettings['enabledSections']] ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <section.icon className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              <button
                onClick={() => handleSectionToggle(section.id as keyof AppSettings['enabledSections'])}
                className="text-gray-600 hover:text-gray-800"
              >
                {settings.enabledSections[section.id as keyof AppSettings['enabledSections']] ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
            
            {settings.enabledSections[section.id as keyof AppSettings['enabledSections']] && (
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-700">{setting.label}</span>
                    {renderSettingContent(setting)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Cycle Configuration Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">إعدادات المراحل التعليمية</h2>
            </div>
            <div className="text-sm text-gray-600">
              كل دورة لها إعداداتها المستقلة
            </div>
          </div>
          
          <div className="space-y-6">
            {getAvailableCycles().map((cycle) => {
              const config = cycleConfigs[cycle.name];
              const IconComponent = cycle.icon === 'BookOpen' ? BookOpen : GraduationCap;
              const isEditing = editingCycle === cycle.name;
              
              return (
                <div key={cycle.name} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-6 h-6 ${cycle.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`} />
                      <h3 className="text-xl font-semibold">{cycle.title}</h3>
                    </div>
                    <button
                      onClick={() => setEditingCycle(isEditing ? null : cycle.name)}
                      className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded"
                    >
                      {isEditing ? 'إلغاء' : 'تعديل'}
                    </button>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* School Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم المؤسسة:
                        </label>
                        <input
                          type="text"
                          value={config?.schoolName || ''}
                          onChange={(e) => setCycleConfigs(prev => ({
                            ...prev,
                            [cycle.name]: { ...prev[cycle.name], schoolName: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      
                      {/* Counselor Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          مستشار(ة) التوجيه:
                        </label>
                        <input
                          type="text"
                          value={config?.counselorName || ''}
                          onChange={(e) => setCycleConfigs(prev => ({
                            ...prev,
                            [cycle.name]: { ...prev[cycle.name], counselorName: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      
                      {/* Levels Management */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          المستويات:
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="أدخل المستوى الجديد"
                            className="flex-1 px-3 py-2 border rounded-lg"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCycleLevel(cycle.name, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              handleAddCycleLevel(cycle.name, input.value);
                              input.value = '';
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            إضافة
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(config?.levels || []).map((level: string) => (
                            <div
                              key={level}
                              className="flex items-center justify-between bg-white p-2 rounded border"
                            >
                              <span className="text-sm">{level}</span>
                              <button
                                onClick={() => handleRemoveCycleLevel(cycle.name, level)}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                حذف
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleCycleConfigChange(cycle.name, 'schoolName', config?.schoolName || '');
                            handleCycleConfigChange(cycle.name, 'counselorName', config?.counselorName || '');
                            setEditingCycle(null);
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          حفظ التغييرات
                        </button>
                        <button
                          onClick={() => setEditingCycle(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">اسم المؤسسة:</span>
                        <span className="font-medium">{config?.schoolName || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">مستشار(ة) التوجيه:</span>
                        <span className="font-medium">{config?.counselorName || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">عدد المستويات:</span>
                        <span className="font-medium">{config?.levels?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المستويات:</span>
                        <div className="flex flex-wrap gap-1">
                          {(config?.levels || []).slice(0, 3).map((level: string) => (
                            <span key={level} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {level}
                            </span>
                          ))}
                          {(config?.levels || []).length > 3 && (
                            <span className="text-gray-500 text-xs">+{(config?.levels || []).length - 3} أخرى</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Database Manager Modal */}
      {showDatabaseManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">إدارة قاعدة البيانات</h2>
              <button
                onClick={() => setShowDatabaseManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <DatabaseManager />
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;