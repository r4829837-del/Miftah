import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, Plus, X, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
}

const mockGoals = [
  {
    id: '1',
    title: 'تحسين نسبة النجاح',
    description: 'رفع نسبة النجاح في الامتحانات بنسبة 15%',
    progress: 75,
    deadline: '2024-06-30'
  },
  {
    id: '2',
    title: 'تطوير المهارات اللغوية',
    description: 'تحسين مستوى اللغة العربية لدى التلاميذ',
    progress: 60,
    deadline: '2024-05-15'
  }
];

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    progress: 0,
    deadline: ''
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.deadline) {
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      progress: newGoal.progress || 0,
      deadline: newGoal.deadline
    };

    if (selectedGoal) {
      setGoals(goals.map(g => g.id === selectedGoal.id ? goal : g));
    } else {
      setGoals([...goals, goal]);
    }

    setShowAddModal(false);
    setSelectedGoal(null);
    setNewGoal({
      title: '',
      description: '',
      progress: 0,
      deadline: ''
    });
  };

  const handleDeleteGoal = () => {
    if (selectedGoal) {
      setGoals(goals.filter(goal => goal.id !== selectedGoal.id));
      setShowDeleteModal(false);
      setSelectedGoal(null);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setNewGoal(goal);
    setShowAddModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy/MM/dd');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">الأهداف</h1>

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {selectedGoal ? 'تعديل الهدف' : 'إضافة هدف جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedGoal(null);
                  setNewGoal({
                    title: '',
                    description: '',
                    progress: 0,
                    deadline: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان الهدف <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نسبة التقدم (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newGoal.progress || 0}
                  onChange={(e) => setNewGoal({ ...newGoal, progress: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الإنجاز <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newGoal.deadline || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedGoal(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>{selectedGoal ? 'حفظ التغييرات' : 'إضافة الهدف'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد حذف الهدف</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا الهدف؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedGoal(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteGoal}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">قائمة الأهداف</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة هدف</span>
          </button>
        </div>
        
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {goal.progress >= 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-blue-500" />
                  )}
                  <h3 className="text-xl font-bold">{goal.title}</h3>
                </div>
                <span className="text-sm text-gray-500">
                  تاريخ الإنجاز: {formatDate(goal.deadline)}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{goal.description}</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      التقدم
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {goal.progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${goal.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEditGoal(goal)}
                  className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50"
                >
                  تعديل
                </button>
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-500 hover:text-red-600 px-3 py-1 rounded-lg hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}