import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  GraduationCap, 
  Cog, 
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  Users,
  User,
  Building,
  Calendar,
  Layers
} from 'lucide-react';
import { getSettings, updateSettings, type AppSettings, forceUpdateTimezone, getDefaultSettingsForCycle } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';

const timezones = [
  { id: 'Africa/Algiers', label: 'توقيت الجزائر (GMT+1)' },
  { id: 'Africa/Tunis', label: 'توقيت تونس (GMT+1)' },
  { id: 'Africa/Casablanca', label: 'توقيت المغرب (GMT+1)' },
  { id: 'Africa/Cairo', label: 'توقيت القاهرة (GMT+2)' },
  { id: 'Asia/Riyadh', label: 'توقيت الرياض (GMT+3)' }
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

// Interface pour les sections de paramètres
interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  settings: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'toggle' | 'password' | 'timezone' | 'cycleConfig' | 'levels' | 'groups' | 'semesters';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

function Settings() {
  const { getCycleConfig, updateCycleConfig, getAvailableCycles, currentCycle } = useCycle();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('institutions');
  
  const [editingCycle, setEditingCycle] = useState<string | null>(null);
  const [cycleConfigs, setCycleConfigs] = useState<Record<string, any>>({});
  const [newItem, setNewItem] = useState<Record<string, string>>({});

  // Sections de paramètres complètes avec couleurs améliorées
  const settingsSections: SettingsSection[] = [
    {
      id: 'institutions',
      title: 'المؤسسات التعليمية',
      description: 'إعدادات المؤسسات والمستشارين',
      icon: Building,
      color: 'blue',
      settings: [
        { 
          id: 'institutions', 
          label: 'إعدادات المؤسسات', 
          type: 'cycleConfig'
        }
      ]
    },
    {
      id: 'levels',
      title: 'المستويات والصفوف',
      description: 'تكوين المستويات لكل مرحلة',
      icon: Layers,
      color: 'green',
      settings: [
        { 
          id: 'levels', 
          label: 'إدارة المستويات', 
          type: 'levels'
        }
      ]
    },
    {
      id: 'groups',
      title: 'الأقسام والمجموعات',
      description: 'تكوين الأقسام والمجموعات',
      icon: Users,
      color: 'purple',
      settings: [
        { 
          id: 'groups', 
          label: 'إدارة الأقسام', 
          type: 'groups'
        }
      ]
    },
    {
      id: 'semesters',
      title: 'الفصول الدراسية',
      description: 'تكوين الفصول والمواعيد',
      icon: Calendar,
      color: 'orange',
      settings: [
        { 
          id: 'semesters', 
          label: 'إدارة الفصول', 
          type: 'semesters'
        }
      ]
    },
    {
      id: 'system',
      title: 'إعدادات النظام',
      description: 'التوقيت والإعدادات العامة',
      icon: Cog,
      color: 'gray',
      settings: [
        { 
          id: 'timezone', 
          label: 'المنطقة الزمنية', 
          type: 'timezone',
          options: timezones.map(tz => ({ value: tz.id, label: tz.label }))
        }
      ]
    }
  ];

  // Couleurs et styles pour chaque section
  const getSectionStyles = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        accent: 'bg-blue-500',
        hover: 'hover:from-blue-100 hover:to-blue-200'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        icon: 'text-green-600',
        accent: 'bg-green-500',
        hover: 'hover:from-green-100 hover:to-green-200'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        accent: 'bg-purple-500',
        hover: 'hover:from-purple-100 hover:to-purple-200'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        accent: 'bg-orange-500',
        hover: 'hover:from-orange-100 hover:to-orange-200'
      },
      gray: {
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        accent: 'bg-gray-500',
        hover: 'hover:from-gray-100 hover:to-gray-200'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  useEffect(() => {
    loadSettings();
    loadCycleConfigs();
  }, []);

  useEffect(() => {
    loadSettings();
  }, [currentCycle]);

  useEffect(() => {
    loadCycleConfigs();
  }, []);

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
      console.log('Chargement des configurations depuis le stockage...');
      const configs: Record<string, any> = {};
      
      // Charger les paramètres pour chaque cycle depuis le stockage
      const متوسطSettings = await getSettings('متوسط');
      const ثانويSettings = await getSettings('ثانوي');
      
      console.log('Paramètres chargés:', {
        متوسط: { schoolName: متوسطSettings?.schoolName, counselorName: متوسطSettings?.counselorName },
        ثانوي: { schoolName: ثانويSettings?.schoolName, counselorName: ثانويSettings?.counselorName }
      });
      
      // Configuration pour le cycle متوسط
      configs['متوسط'] = {
        name: 'متوسط',
        title: 'التعليم المتوسط',
        schoolName: متوسطSettings?.schoolName || 'المتوسطة',
        counselorName: متوسطSettings?.counselorName || 'مستشار(ة) التوجيه',
        levels: متوسطSettings?.levels || ['الأولى متوسط', 'الثانية متوسط', 'الثالثة متوسط', 'الرابعة متوسط'],
        academicYear: متوسطSettings?.academicYear || '2024-2025',
        maxStudentsPerClass: متوسطSettings?.maxStudentsPerClass || 30,
        gradingScale: متوسطSettings?.gradingScale || { min: 0, max: 20, passingGrade: 10 },
        subjects: متوسطSettings?.subjects || ['اللغة العربية', 'الرياضيات', 'العلوم الطبيعية', 'التاريخ والجغرافيا', 'التربية الإسلامية', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التربية البدنية'],
        semesters: متوسطSettings?.semesters || ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
        groups: متوسطSettings?.groups || ['أ', 'ب', 'ج', 'د'],
        features: متوسطSettings?.features || { enableReports: true, enableTests: true, enableGoals: true, enableNews: true, enableSchedule: true, enableAnalysis: true },
        appearance: متوسطSettings?.appearance || { primaryColor: '#3B82F6', secondaryColor: '#1E40AF' }
      };
      
      // Configuration pour le cycle ثانوي
      configs['ثانوي'] = {
        name: 'ثانوي',
        title: 'التعليم الثانوي',
        schoolName: ثانويSettings?.schoolName || 'الثانوية',
        counselorName: ثانويSettings?.counselorName || 'مستشار(ة) التوجيه',
        levels: ثانويSettings?.levels || ['الأولى ثانوي', 'الثانية ثانوي', 'الثالثة ثانوي'],
        academicYear: ثانويSettings?.academicYear || '2024-2025',
        maxStudentsPerClass: ثانويSettings?.maxStudentsPerClass || 25,
        gradingScale: ثانويSettings?.gradingScale || { min: 0, max: 20, passingGrade: 10 },
        subjects: ثانويSettings?.subjects || ['اللغة العربية', 'الرياضيات', 'العلوم الطبيعية', 'الفيزياء', 'الكيمياء', 'علوم الحياة والأرض', 'التاريخ والجغرافيا', 'التربية الإسلامية', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'الفلسفة', 'التربية البدنية'],
        semesters: ثانويSettings?.semesters || ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'],
        groups: ثانويSettings?.groups || ['أ', 'ب', 'ج'],
        features: ثانويSettings?.features || { enableReports: true, enableTests: true, enableGoals: true, enableNews: true, enableSchedule: true, enableAnalysis: true },
        appearance: ثانويSettings?.appearance || { primaryColor: '#8B5CF6', secondaryColor: '#6D28D9' }
      };
      
      setCycleConfigs(configs);
      
      console.log('Configurations chargées avec succès:', {
        متوسط: { schoolName: configs['متوسط']?.schoolName, counselorName: configs['متوسط']?.counselorName },
        ثانوي: { schoolName: configs['ثانوي']?.schoolName, counselorName: configs['ثانوي']?.counselorName }
      });
    } catch (error) {
      console.error('Error loading cycle configs:', error);
      // En cas d'erreur, utiliser des configurations par défaut
      setCycleConfigs({
        'متوسط': {
          name: 'متوسط',
          title: 'التعليم المتوسط',
          schoolName: 'المتوسطة',
          counselorName: 'مستشار(ة) التوجيه'
        },
        'ثانوي': {
          name: 'ثانوي',
          title: 'التعليم الثانوي',
          schoolName: 'الثانوية',
          counselorName: 'مستشار(ة) التوجيه'
        }
      });
    }
  };

  const handleSettingChange = async (key: keyof AppSettings, value: string | boolean | string[]) => {
    try {
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
      
      // Déclencher un événement personnalisé pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000); // Afficher plus longtemps
  };

  const handleCycleConfigUpdate = async (cycleName: string, updates: any) => {
    try {
      console.log(`Sauvegarde des paramètres pour le cycle: ${cycleName}`, updates);
      
      // Sauvegarder directement dans le stockage pour le cycle spécifique
      const savedSettings = await updateSettings(updates, cycleName);
      console.log('Paramètres sauvegardés avec succès:', savedSettings);
      
      // Mettre à jour la configuration locale
      setCycleConfigs(prev => ({
        ...prev,
        [cycleName]: { ...prev[cycleName], ...updates }
      }));
      
      // Mettre à jour le contexte des cycles aussi
      await updateCycleConfig(cycleName as 'متوسط' | 'ثانوي', updates);
      
      // Recharger les configurations pour s'assurer de la persistance
      setTimeout(async () => {
        await loadCycleConfigs();
      }, 500);
      
      showSaveSuccess();
    } catch (error) {
      console.error('Error updating cycle config:', error);
      // En cas d'erreur, recharger les configurations
      loadCycleConfigs();
    }
  };

  // Fonction pour réinitialiser un cycle spécifique
  const resetCycleConfig = async (cycleName: string) => {
    try {
      // Réinitialiser les paramètres du cycle dans le stockage
      const defaultSettings = getDefaultSettingsForCycle(cycleName);
      await updateSettings(defaultSettings, cycleName);
      
      // Recharger les configurations
      await loadCycleConfigs();
      
      showSaveSuccess();
    } catch (error) {
      console.error('Error resetting cycle config:', error);
    }
  };

  const handleAddItem = async (type: 'levels' | 'groups' | 'semesters', cycleName: string, item: string) => {
    if (item.trim()) {
      const currentItems = cycleConfigs[cycleName]?.[type] || [];
      const updatedItems = [...currentItems, item.trim()];
      await handleCycleConfigUpdate(cycleName, { [type]: updatedItems });
      setNewItem({ ...newItem, [`${cycleName}_${type}`]: '' });
    }
  };

  const handleRemoveItem = async (type: 'levels' | 'groups' | 'semesters', cycleName: string, itemToRemove: string) => {
    const currentItems = cycleConfigs[cycleName]?.[type] || [];
    const updatedItems = currentItems.filter((item: string) => item !== itemToRemove);
    await handleCycleConfigUpdate(cycleName, { [type]: updatedItems });
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

  const renderSettingInput = (setting: SettingItem) => {

    switch (setting.type) {
      case 'timezone':
        return (
          <div className="flex items-center gap-3">
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timezones.map(tz => (
                <option key={tz.id} value={tz.id}>{tz.label}</option>
              ))}
            </select>
            {settings.timezone === 'Africa/Tunis' && (
              <button
                onClick={handleForceUpdateTimezone}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                تحديث إلى الجزائر
              </button>
            )}
          </div>
        );

      case 'cycleConfig':
        return (
          <div className="space-y-6">
            {/* En-tête de la section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">إعدادات المؤسسات التعليمية</h3>
                  <p className="text-sm text-gray-600">قم بتكوين إعدادات المؤسسات والمستشارين لكل مرحلة تعليمية</p>
                </div>
                <button
                  onClick={loadCycleConfigs}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  title="إعادة تحميل الإعدادات"
                >
                  🔄 إعادة تحميل
                </button>
              </div>
              <div className="bg-green-100 border border-green-300 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">
                    كل مرحلة تعليمية لها إعداداتها المستقلة تماماً - التغييرات محفوظة تلقائياً
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration pour chaque cycle */}
            {(() => {
              const cycles = [
                { key: 'متوسط', title: 'التعليم المتوسط', icon: 'BookOpen', color: 'blue', schoolType: 'المتوسطة' },
                { key: 'ثانوي', title: 'التعليم الثانوي', icon: 'GraduationCap', color: 'purple', schoolType: 'الثانوية' }
              ];

              return cycles.map((cycleInfo) => {
                const config = cycleConfigs[cycleInfo.key];
                const IconComponent = cycleInfo.icon === 'BookOpen' ? BookOpen : GraduationCap;
                const isEditing = editingCycle === cycleInfo.key;
                const colorClasses = {
                  blue: 'text-blue-500 bg-blue-50 border-blue-200',
                  purple: 'text-purple-500 bg-purple-50 border-purple-200'
                };

                return (
                  <div key={cycleInfo.key} className={`border-2 rounded-lg p-4 ${colorClasses[cycleInfo.color as keyof typeof colorClasses]}`}>
                    {/* En-tête du cycle */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${cycleInfo.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                          <IconComponent className={`w-6 h-6 ${cycleInfo.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{cycleInfo.title}</h4>
                          <p className="text-xs text-gray-600">إعدادات {cycleInfo.schoolType}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">إعدادات مستقلة</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingCycle(isEditing ? null : cycleInfo.key)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                          isEditing 
                            ? 'bg-gray-500 text-white hover:bg-gray-600' 
                            : cycleInfo.color === 'blue' 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        {isEditing ? 'إلغاء التعديل' : 'تعديل الإعدادات'}
                      </button>
                    </div>

                    {/* Contenu du cycle */}
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Nom de l'établissement */}
                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              اسم {cycleInfo.schoolType} *
                            </label>
                            <input
                              type="text"
                              value={config?.schoolName || ''}
                              onChange={(e) => setCycleConfigs(prev => ({
                                ...prev,
                                [cycleInfo.key]: { ...prev[cycleInfo.key], schoolName: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder={`أدخل اسم ${cycleInfo.schoolType}`}
                              dir="rtl"
                            />
                          </div>

                          {/* Nom du conseiller */}
                          <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700">
                              مستشار(ة) التوجيه *
                            </label>
                            <input
                              type="text"
                              value={config?.counselorName || ''}
                              onChange={(e) => setCycleConfigs(prev => ({
                                ...prev,
                                [cycleInfo.key]: { ...prev[cycleInfo.key], counselorName: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="أدخل اسم المستشار"
                              dir="rtl"
                            />
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleCycleConfigUpdate(cycleInfo.key, config)}
                            className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                              cycleInfo.color === 'blue' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            حفظ التغييرات
                          </button>
                          <button
                            onClick={() => setEditingCycle(null)}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => resetCycleConfig(cycleInfo.key)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                            title="إعادة تعيين إعدادات هذا المستوى"
                          >
                            إعادة تعيين
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Affichage des informations */}
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-1">اسم {cycleInfo.schoolType}</h5>
                              <p className="text-lg font-bold text-gray-800">
                                {config?.schoolName || 'غير محدد'}
                              </p>
                            </div>
                            <div className={`p-2 rounded-full ${cycleInfo.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                              <Building className={`w-5 h-5 ${cycleInfo.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-1">مستشار(ة) التوجيه</h5>
                              <p className="text-lg font-bold text-gray-800">
                                {config?.counselorName || 'غير محدد'}
                              </p>
                            </div>
                            <div className={`p-2 rounded-full ${cycleInfo.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                              <User className={`w-5 h-5 ${cycleInfo.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        );

      case 'levels':
        return (
          <div className="space-y-6">
            {getAvailableCycles().map((cycle) => {
              const config = cycleConfigs[cycle.name];
              const IconComponent = cycle.icon === 'BookOpen' ? BookOpen : GraduationCap;
              
              return (
                <div key={cycle.name} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-6 h-6 ${cycle.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`} />
                    <h4 className="text-lg font-bold text-gray-800">{cycle.title}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {(config?.levels || []).map((level: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <span className="flex-1 font-medium">{level}</span>
                        <button
                          onClick={() => handleRemoveItem('levels', cycle.name, level)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="أضف مستوى جديد"
                        value={newItem[`${cycle.name}_levels`] || ''}
                        onChange={(e) => setNewItem({ ...newItem, [`${cycle.name}_levels`]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem('levels', cycle.name, newItem[`${cycle.name}_levels`] || '');
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddItem('levels', cycle.name, newItem[`${cycle.name}_levels`] || '')}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'groups':
        return (
          <div className="space-y-6">
            {getAvailableCycles().map((cycle) => {
              const config = cycleConfigs[cycle.name];
              const IconComponent = cycle.icon === 'BookOpen' ? BookOpen : GraduationCap;
              
              return (
                <div key={cycle.name} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-6 h-6 ${cycle.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`} />
                    <h4 className="text-lg font-bold text-gray-800">{cycle.title}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {(config?.groups || []).map((group: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <span className="flex-1 font-medium">{group}</span>
                        <button
                          onClick={() => handleRemoveItem('groups', cycle.name, group)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="أضف قسم جديد"
                        value={newItem[`${cycle.name}_groups`] || ''}
                        onChange={(e) => setNewItem({ ...newItem, [`${cycle.name}_groups`]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem('groups', cycle.name, newItem[`${cycle.name}_groups`] || '');
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddItem('groups', cycle.name, newItem[`${cycle.name}_groups`] || '')}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'semesters':
        return (
          <div className="space-y-6">
            {getAvailableCycles().map((cycle) => {
              const config = cycleConfigs[cycle.name];
              const IconComponent = cycle.icon === 'BookOpen' ? BookOpen : GraduationCap;
              
              return (
                <div key={cycle.name} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <IconComponent className={`w-6 h-6 ${cycle.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`} />
                    <h4 className="text-lg font-bold text-gray-800">{cycle.title}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {(config?.semesters || []).map((semester: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                        <span className="flex-1 font-medium">{semester}</span>
                        <button
                          onClick={() => handleRemoveItem('semesters', cycle.name, semester)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="أضف فصل جديد"
                        value={newItem[`${cycle.name}_semesters`] || ''}
                        onChange={(e) => setNewItem({ ...newItem, [`${cycle.name}_semesters`]: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem('semesters', cycle.name, newItem[`${cycle.name}_semesters`] || '');
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddItem('semesters', cycle.name, newItem[`${cycle.name}_semesters`] || '')}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return <span className="text-gray-500">نوع غير مدعوم</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">الإعدادات الشاملة</h1>
                <p className="text-blue-100 text-sm">
                  إدارة كاملة لإعدادات النظام والمؤسسات التعليمية
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>نظام متكامل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>إعدادات ذكية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                <span>واجهة حديثة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
            <div className="p-2 bg-green-500 rounded-full">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-green-800 font-bold text-base">تم حفظ الإعدادات بنجاح</span>
              <p className="text-green-600 text-xs mt-1">تم تطبيق التغييرات على النظام</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">الأقسام</h3>
              </div>
              <nav className="space-y-3">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  const styles = getSectionStyles(section.color);
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right transition-all duration-200 hover:scale-102 ${
                        isActive
                          ? `${styles.bg} ${styles.border} border-2 shadow-md`
                          : 'text-gray-600 hover:bg-white/70 hover:text-gray-800 hover:shadow-sm'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${isActive ? styles.accent + ' bg-opacity-20' : 'bg-gray-100'}`}>
                        <IconComponent className={`w-4 h-4 ${isActive ? styles.icon : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${isActive ? 'text-gray-800' : 'text-gray-700'}`}>{section.title}</div>
                        <div className={`text-xs ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>{section.description}</div>
                      </div>
                      {isActive && (
                        <div className={`w-1.5 h-1.5 rounded-full ${styles.accent}`}></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {settingsSections.map((section) => {
              if (activeSection !== section.id) return null;
              
              const IconComponent = section.icon;
              const styles = getSectionStyles(section.color);
              
              return (
                <div key={section.id} className={`${styles.bg} ${styles.border} rounded-xl shadow-lg border-2 transition-all duration-300`}>
                  {/* Section Header */}
                  <div className={`p-6 border-b-2 ${styles.border} rounded-t-xl`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-xl ${styles.accent} bg-opacity-10 shadow-md`}>
                        <IconComponent className={`w-6 h-6 ${styles.icon}`} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">{section.title}</h2>
                        <p className="text-sm text-gray-600 font-medium">{section.description}</p>
                      </div>
                    </div>
                    
                    {/* Indicateur de statut */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${styles.accent} animate-pulse`}></div>
                      <span className="text-xs text-gray-600 font-semibold">قسم نشط</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  </div>

                  {/* Section Content */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {section.settings.map((setting) => (
                        <div key={setting.id} className="py-4">
                          <div className="mb-4">
                            <label className="block text-lg font-bold text-gray-800 mb-2">
                              {setting.label}
                              {setting.required && <span className="text-red-500 mr-2">*</span>}
                            </label>
                            {setting.placeholder && (
                              <div className="bg-white/60 rounded-lg p-3 border border-white/50">
                                <p className="text-xs text-gray-600 font-medium">{setting.placeholder}</p>
                              </div>
                            )}
                          </div>
                          <div className="bg-white/80 rounded-xl p-4 border border-white/50 shadow-md">
                            {renderSettingInput(setting)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;