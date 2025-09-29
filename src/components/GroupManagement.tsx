import React, { useState, useEffect } from 'react';
import { PlusCircle, Users, GraduationCap, Search, Filter, Pencil, Trash2, AlertTriangle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { getSettings, type AppSettings, getStudents, type Student } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  students: Student[];
}

export default function GroupManagement() {
  const { currentCycle } = useCycle();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    level: ''
  });
  const [settings, setSettings] = useState<AppSettings>({
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
      highschool: true,
      levels: true,
      groups: true,
      semesters: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, [currentCycle]); // Recharger quand le cycle change

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    const students = await getStudents();

    // Create groups with students
    const newGroups: Group[] = loadedSettings.groups.map((groupName, index) => {
      const groupStudents = students.filter(student => student.group === groupName);
      const studentsByLevel = new Map<string, number>();
      
      groupStudents.forEach(student => {
        const count = studentsByLevel.get(student.level) || 0;
        studentsByLevel.set(student.level, count + 1);
      });

      // Find the predominant level
      let maxLevel = '';
      let maxCount = 0;
      studentsByLevel.forEach((count, level) => {
        if (count > maxCount) {
          maxCount = count;
          maxLevel = level;
        }
      });

      return {
        id: (index + 1).toString(),
        name: groupName,
        level: maxLevel || loadedSettings.levels[0],
        studentCount: groupStudents.length,
        students: groupStudents
      };
    });

    setGroups(newGroups);
    setSettings(loadedSettings);
  };

  const handleAddGroup = () => {
    if (!newGroupData.name || !newGroupData.level) return;

    const newGroup: Group = {
      id: (groups.length + 1).toString(),
      name: newGroupData.name,
      level: newGroupData.level,
      studentCount: 0,
      students: []
    };

    setGroups([...groups, newGroup]);
    setShowNewGroupModal(false);
    setNewGroupData({ name: '', level: '' });
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    
    const updatedGroups = groups.filter(group => group.id !== selectedGroup.id);
    setGroups(updatedGroups);
    setShowDeleteModal(false);
    setSelectedGroup(null);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setNewGroupData({
      name: group.name,
      level: group.level
    });
    setShowNewGroupModal(true);
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedLevel || group.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {selectedGroup ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم القسم
                </label>
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسم القسم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المستوى
                </label>
                <select
                  value={newGroupData.level}
                  onChange={(e) => setNewGroupData({ ...newGroupData, level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر المستوى</option>
                  {settings.levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewGroupModal(false);
                  setSelectedGroup(null);
                  setNewGroupData({ name: '', level: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {selectedGroup ? 'حفظ التغييرات' : 'إضافة القسم'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد حذف القسم</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف القسم {selectedGroup.name}؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedGroup(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec flèche de retour */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            title="Retour à la لوحة القيادة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">إدارة الأقسام</h1>
        </div>
        
        <button
          onClick={() => setShowNewGroupModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold">قائمة الأقسام</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث عن قسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full pr-12 pl-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع المستويات</option>
                  {settings.levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border rounded-lg hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleGroupExpansion(group.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{group.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{group.level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{group.studentCount} تلميذ</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                        className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {expandedGroups.has(group.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedGroups.has(group.id) && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">{currentCycle === 'ثانوي' ? 'قائمة الطلاب:' : 'قائمة التلاميذ:'}</h4>
                      {group.students.length > 0 ? (
                        <div className="space-y-2">
                          {group.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <div className="font-medium">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.level}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.studentId}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          {currentCycle === 'ثانوي' ? 'لا يوجد طلاب في هذا القسم' : 'لا يوجد تلاميذ في هذا القسم'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">لا توجد أقسام مطابقة للبحث</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}