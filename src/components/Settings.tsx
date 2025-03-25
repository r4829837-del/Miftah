import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Lock, User, School, GraduationCap, Users, ToggleLeft, ToggleRight, Calendar, Clock, Save, Check, Download, Upload, AlertTriangle } from 'lucide-react';
import { getSettings, updateSettings, type AppSettings, exportDatabase, importDatabase } from '../lib/storage';

const timezones = [
  { id: 'Africa/Tunis', label: 'توقيت تونس (GMT+1)' },
  { id: 'Africa/Algiers', label: 'توقيت الجزائر (GMT+1)' },
  { id: 'Africa/Casablanca', label: 'توقيت المغرب (GMT+1)' },
  { id: 'Africa/Cairo', label: 'توقيت القاهرة (GMT+2)' },
  { id: 'Asia/Riyadh', label: 'توقيت الرياض (GMT+3)' }
];

const settingsSections = [
  {
    id: 'general',
    title: 'الإعدادات العامة',
    icon: SettingsIcon,
    settings: [
      { id: 'language', label: 'اللغة', value: 'العربية' },
      { id: 'timezone', label: 'المنطقة الزمنية', type: 'timezone' }
    ]
  },
  {
    id: 'notifications',
    title: 'الإشعارات',
    icon: Bell,
    settings: [
      { id: 'email', label: 'إشعارات البريد الإلكتروني', value: 'مفعلة' },
      { id: 'app', label: 'إشعارات التطبيق', value: 'مفعلة' }
    ]
  },
  {
    id: 'security',
    title: 'الأمان',
    icon: Lock,
    settings: [
      { id: 'password', label: 'تغيير كلمة المرور', type: 'password' },
      { id: 'twoFactorEnabled', label: 'المصادقة الثنائية', type: 'toggle' }
    ]
  },
  {
    id: 'profile',
    title: 'الملف الشخصي',
    icon: User,
    settings: [
      { id: 'counselorName', label: <span><strong>مستشار(ة) التوجيه:</strong></span>, type: 'input' },
      { id: 'email', label: 'البريد الإلكتروني', value: 'تعديل' }
    ]
  },
  {
    id: 'school',
    title: 'إعدادات المتوسطة',
    icon: School,
    settings: [
      { id: 'schoolName', label: <span><strong>المتوسطة:</strong></span>, type: 'input' },
      { id: 'address', label: 'العنوان', value: 'تعديل' }
    ]
  }
];

const defaultSettings: AppSettings = {
  schoolName: '',
  counselorName: '',
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
    levels: true,
    groups: true,
    semesters: true
  }
};

function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [newLevel, setNewLevel] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getSettings();
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

  const handleSettingChange = async (key: keyof AppSettings, value: string | boolean) => {
    const updatedSettings = await updateSettings({ [key]: value });
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

  const handleAddLevel = async () => {
    if (newLevel.trim()) {
      const updatedLevels = [...(settings.levels || []), newLevel.trim()];
      const updatedSettings = await updateSettings({ levels: updatedLevels });
      setSettings(prev => ({
        ...prev,
        ...updatedSettings,
        enabledSections: {
          ...prev.enabledSections,
          ...(updatedSettings.enabledSections || {})
        }
      }));
      setNewLevel('');
      showSaveSuccess();
    }
  };

  const handleRemoveLevel = async (levelToRemove: string) => {
    const updatedLevels = (settings.levels || []).filter(level => level !== levelToRemove);
    const updatedSettings = await updateSettings({ levels: updatedLevels });
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

  const handleAddGroup = async () => {
    if (newGroup.trim()) {
      const updatedGroups = [...(settings.groups || []), newGroup.trim()];
      const updatedSettings = await updateSettings({ groups: updatedGroups });
      setSettings(prev => ({
        ...prev,
        ...updatedSettings,
        enabledSections: {
          ...prev.enabledSections,
          ...(updatedSettings.enabledSections || {})
        }
      }));
      setNewGroup('');
      showSaveSuccess();
    }
  };

  const handleRemoveGroup = async (groupToRemove: string) => {
    const updatedGroups = (settings.groups || []).filter(group => group !== groupToRemove);
    const updatedSettings = await updateSettings({ groups: updatedGroups });
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

  const handleAddSemester = async () => {
    if (newSemester.trim()) {
      const updatedSemesters = [...(settings.semesters || []), newSemester.trim()];
      const updatedSettings = await updateSettings({ semesters: updatedSemesters });
      setSettings(prev => ({
        ...prev,
        ...updatedSettings,
        enabledSections: {
          ...prev.enabledSections,
          ...(updatedSettings.enabledSections || {})
        }
      }));
      setNewSemester('');
      showSaveSuccess();
    }
  };

  const handleRemoveSemester = async (semesterToRemove: string) => {
    const updatedSemesters = (settings.semesters || []).filter(semester => semester !== semesterToRemove);
    const updatedSettings = await updateSettings({ semesters: updatedSemesters });
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

  const handleExportDatabase = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school_database_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSaveSuccess();
    } catch (error) {
      console.error('Error exporting database:', error);
      setImportError('حدث خطأ أثناء تصدير قاعدة البيانات');
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          await importDatabase(data);
          await loadSettings();
          showSaveSuccess();
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error importing database:', error);
          setImportError('حدث خطأ أثناء استيراد قاعدة البيانات');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setImportError('حدث خطأ أثناء قراءة الملف');
    }
  };

  const renderSettingContent = (setting: any) => {
    switch (setting.type) {
      case 'timezone':
        return (
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {timezones.map(tz => (
              <option key={tz.id} value={tz.id}>{tz.label}</option>
            ))}
          </select>
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
              value={settings[setting.id as keyof AppSettings] || ''}
              onChange={(e) => setSettings({ ...settings, [setting.id]: e.target.value })}
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={() => handleSettingChange(setting.id as keyof AppSettings, settings[setting.id as keyof AppSettings])}
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
            {settings[setting.id as keyof AppSettings] || 'تعديل'}
          </button>
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
        <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportDatabase}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            <span>استيراد قاعدة البيانات</span>
          </button>
          <button
            onClick={handleExportDatabase}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>تصدير قاعدة البيانات</span>
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 ml-2" />
            <span>{importError}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Original settings sections */}
        {settingsSections.map((section) => (
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

        {/* Education Levels Section */}
        <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${settings.enabledSections.levels ? 'opacity-100' : 'opacity-50'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">المستويات</h2>
            </div>
            <button
              onClick={() => handleSectionToggle('levels')}
              className="text-gray-600 hover:text-gray-800"
            >
              {settings.enabledSections.levels ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {settings.enabledSections.levels && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  placeholder="أدخل المستوى الجديد"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddLevel}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>حفظ</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {(settings.levels || []).map((level) => (
                  <div
                    key={level}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span>{level}</span>
                    <button
                      onClick={() => handleRemoveLevel(level)}
                      className="text-red-500 hover:text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Groups Section */}
        <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${settings.enabledSections.groups ? 'opacity-100' : 'opacity-50'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">الأقسام</h2>
            </div>
            <button
              onClick={() => handleSectionToggle('groups')}
              className="text-gray-600 hover:text-gray-800"
            >
              {settings.enabledSections.groups ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {settings.enabledSections.groups && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  placeholder="أدخل القسم الجديد"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddGroup}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>حفظ</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {(settings.groups || []).map((group) => (
                  <div
                    key={group}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span>{group}</span>
                    <button
                      onClick={() => handleRemoveGroup(group)}
                      className="text-red-500 hover:text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Semesters Section */}
        <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity ${settings.enabledSections.semesters ? 'opacity-100' : 'opacity-50'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">الفصول</h2>
            </div>
            <button
              onClick={() => handleSectionToggle('semesters')}
              className="text-gray-600 hover:text-gray-800"
            >
              {settings.enabledSections.semesters ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {settings.enabledSections.semesters && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  placeholder="أدخل الفصل الجديد"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleAddSemester}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>حفظ</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {(settings.semesters || []).map((semester) => (
                  <div
                    key={semester}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span>{semester}</span>
                    <button
                      onClick={() => handleRemoveSemester(semester)}
                      className="text-red-500 hover:text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;