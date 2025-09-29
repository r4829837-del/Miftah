import React, { useState, useEffect } from 'react';
import { Lightbulb, Users, Plus, Save, Trash2, Edit2, X, AlertTriangle, CheckCircle2, UserCircle, UsersIcon, Search, ArrowRight } from 'lucide-react';
import { getStudents, Student, getSettings, AppSettings } from '../lib/storage';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'behavioral' | 'social' | 'health';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string;
  createdAt: string;
  mode: 'group' | 'individual';
  // Pour le mode groupe
  group?: string;
  // Pour le mode individuel
  studentIds?: string[];
}

const recommendationTypes = [
  { id: 'academic', label: 'أكاديمي', color: 'bg-blue-100 text-blue-600' },
  { id: 'behavioral', label: 'سلوكي', color: 'bg-purple-100 text-purple-600' },
  { id: 'social', label: 'اجتماعي', color: 'bg-green-100 text-green-600' },
  { id: 'health', label: 'صحي', color: 'bg-red-100 text-red-600' }
];

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-orange-500',
  low: 'text-green-500'
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600'
};

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'تحسين مستوى القراءة',
    description: 'تنظيم جلسات قراءة إضافية للتلاميذ الذين يحتاجون إلى دعم',
    type: 'academic',
    priority: 'high',
    status: 'in_progress',
    deadline: '2024-06-30',
    createdAt: new Date().toISOString(),
    mode: 'group',
    group: 'الفوج 1'
  },
  {
    id: '2',
    title: 'متابعة فردية في الرياضيات',
    description: 'جلسات دعم فردية في مادة الرياضيات',
    type: 'academic',
    priority: 'medium',
    status: 'pending',
    deadline: '2024-07-15',
    createdAt: new Date().toISOString(),
    mode: 'individual',
    studentIds: ['1', '2']
  }
];

export default function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [newRecommendation, setNewRecommendation] = useState<Partial<Recommendation>>({
    type: 'academic',
    priority: 'medium',
    status: 'pending',
    mode: 'group'
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedStudents, loadedSettings] = await Promise.all([
      getStudents(),
      getSettings()
    ]);
    setStudents(loadedStudents);
    setSettings(loadedSettings);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
  };

  const handleAddRecommendation = () => {
    if (!newRecommendation.title || !newRecommendation.description) {
      return;
    }

    if (newRecommendation.mode === 'group' && !newRecommendation.group) {
      return;
    }

    if (newRecommendation.mode === 'individual' && (!selectedStudents.length)) {
      return;
    }

    const recommendation: Recommendation = {
      id: Date.now().toString(),
      title: newRecommendation.title!,
      description: newRecommendation.description!,
      type: newRecommendation.type as 'academic' | 'behavioral' | 'social' | 'health',
      priority: newRecommendation.priority as 'high' | 'medium' | 'low',
      status: newRecommendation.status as 'pending' | 'in_progress' | 'completed',
      deadline: newRecommendation.deadline,
      createdAt: new Date().toISOString(),
      mode: newRecommendation.mode as 'group' | 'individual',
      ...(newRecommendation.mode === 'group' 
        ? { group: newRecommendation.group }
        : { studentIds: selectedStudents }
      )
    };

    if (selectedRecommendation) {
      setRecommendations(prev =>
        prev.map(rec => (rec.id === selectedRecommendation.id ? recommendation : rec))
      );
    } else {
      setRecommendations(prev => [...prev, recommendation]);
    }

    setShowAddModal(false);
    setSelectedRecommendation(null);
    setNewRecommendation({
      type: 'academic',
      priority: 'medium',
      status: 'pending',
      mode: 'group'
    });
    setSelectedStudents([]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDeleteRecommendation = () => {
    if (selectedRecommendation) {
      setRecommendations(prev =>
        prev.filter(rec => rec.id !== selectedRecommendation.id)
      );
      setShowDeleteModal(false);
      setSelectedRecommendation(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleEditRecommendation = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setNewRecommendation(recommendation);
    if (recommendation.mode === 'individual' && recommendation.studentIds) {
      setSelectedStudents(recommendation.studentIds);
    }
    setShowAddModal(true);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getStudentNames = (studentIds: string[]) => {
    return students
      .filter(student => studentIds.includes(student.id))
      .map(student => `${student.firstName} ${student.lastName}`)
      .join('، ');
  };

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    const fullName = `${student.firstName} ${student.lastName}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesType = !selectedType || rec.type === selectedType;
    const matchesStatus = !selectedStatus || rec.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in-down">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ التغييرات بنجاح</span>
        </div>
      )}

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {selectedRecommendation ? 'تعديل التوصية' : 'إضافة توصية جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedRecommendation(null);
                  setNewRecommendation({
                    type: 'academic',
                    priority: 'medium',
                    status: 'pending',
                    mode: 'group'
                  });
                  setSelectedStudents([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع التوصية
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setNewRecommendation({ ...newRecommendation, mode: 'group' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                      newRecommendation.mode === 'group'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <UsersIcon className="w-5 h-5" />
                    <span>توصية جماعية</span>
                  </button>
                  <button
                    onClick={() => setNewRecommendation({ ...newRecommendation, mode: 'individual' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                      newRecommendation.mode === 'individual'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>توصية فردية</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان التوصية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRecommendation.title || ''}
                  onChange={(e) =>
                    setNewRecommendation({ ...newRecommendation, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newRecommendation.description || ''}
                  onChange={(e) =>
                    setNewRecommendation({ ...newRecommendation, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>

              {newRecommendation.mode === 'group' ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الفوج <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRecommendation.group || ''}
                    onChange={(e) =>
                      setNewRecommendation({ ...newRecommendation, group: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">اختر الفوج</option>
                    {settings?.groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التلاميذ <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="البحث عن تلميذ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedStudents.includes(student.id)
                              ? 'bg-blue-50 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.level} - {student.group}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النوع
                </label>
                <select
                  value={newRecommendation.type || 'academic'}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      type: e.target.value as any
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {recommendationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الأولوية
                </label>
                <select
                  value={newRecommendation.priority || 'medium'}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      priority: e.target.value as any
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="high">عالية</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  value={newRecommendation.status || 'pending'}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      status: e.target.value as any
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتملة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الإنجاز
                </label>
                <input
                  type="date"
                  value={newRecommendation.deadline || ''}
                  onChange={(e) =>
                    setNewRecommendation({
                      ...newRecommendation,
                      deadline: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedRecommendation(null);
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddRecommendation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>حفظ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد حذف التوصية</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذه التوصية؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRecommendation(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteRecommendation}
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
          
          <h1 className="text-3xl font-bold text-gray-800">التوصيات</h1>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة توصية</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">جميع الأنواع</option>
            {recommendationTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتملة</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.map((rec) => {
            const typeInfo = recommendationTypes.find(t => t.id === rec.type);
            return (
              <div
                key={rec.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeInfo?.color}`}>
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{rec.title}</h3>
                      <span className={`text-sm ${priorityColors[rec.priority]}`}>
                        {rec.priority === 'high' ? 'أولوية عالية' : rec.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRecommendation(rec)}
                      className="p-1 text-blue-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecommendation(rec);
                        setShowDeleteModal(true);
                      }}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{rec.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <span className={`px-3 py-1 rounded-full ${statusColors[rec.status]}`}>
                    {rec.status === 'pending'
                      ? 'قيد الانتظار'
                      : rec.status === 'in_progress'
                      ? 'قيد التنفيذ'
                      : 'مكتملة'}
                  </span>
                  <div className="flex items-center gap-1">
                    {rec.mode === 'group' ? (
                      <>
                        <UsersIcon className="w-4 h-4" />
                        <span>{rec.group}</span>
                      </>
                    ) : (
                      <>
                        <UserCircle className="w-4 h-4" />
                        <span>{rec.studentIds && getStudentNames(rec.studentIds)}</span>
                      </>
                    )}
                  </div>
                  {rec.deadline && (
                    <span className="text-gray-500">
                      تاريخ الإنجاز: {formatDate(rec.deadline)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">لا توجد توصيات مطابقة للتصفية</h3>
          </div>
        )}
      </div>
    </div>
  );
}