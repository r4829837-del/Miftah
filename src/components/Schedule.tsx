import React, { useState, useEffect } from 'react';
import { CalendarRange, Plus, X, Edit2, Save, AlertTriangle, Users, ArrowRight } from 'lucide-react';
import { getStudents, Student, getSettings, AppSettings } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import { useNavigate } from 'react-router-dom';

const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const timeSlots = ['08:00', '09:30', '11:00', '13:30', '15:00'];

interface Session {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  sessionType: 'individual' | 'group';
  level: string;
  group: string;
  studentId?: string;
}

export default function Schedule() {
  const { getCycleLevels } = useCycle();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [newSession, setNewSession] = useState<Omit<Session, 'id'>>({
    day: '',
    time: '',
    title: '',
    description: '',
    sessionType: 'group',
    level: '',
    group: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedStudents, loadedSettings] = await Promise.all([
      getStudents(),
      getSettings(),
    ]);
    setStudents(loadedStudents);
    setSettings(loadedSettings);
  };

  useEffect(() => {
    if (newSession.level && newSession.group) {
      const filtered = students.filter(
        student => 
          student.level === newSession.level &&
          student.group === newSession.group
      );
      setFilteredStudents(filtered);
    } else if (newSession.level) {
      const filtered = students.filter(
        student => student.level === newSession.level
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [newSession.level, newSession.group, students]);

  const handleAddSession = () => {
    if (selectedTimeSlot) {
      setNewSession({
        day: selectedTimeSlot.day,
        time: selectedTimeSlot.time,
        title: '',
        description: '',
        sessionType: 'group',
        level: '',
        group: '',
      });
      setShowAddModal(true);
    }
  };

  const handleSaveSession = () => {
    if (selectedSession) {
      // Edit existing session
      setSessions(sessions.map(session =>
        session.id === selectedSession.id
          ? { ...selectedSession, ...newSession }
          : session
      ));
    } else {
      // Add new session
      setSessions([...sessions, {
        id: Math.random().toString(36).substr(2, 9),
        ...newSession
      }]);
    }
    setShowAddModal(false);
    setSelectedSession(null);
    setNewSession({
      day: '',
      time: '',
      title: '',
      description: '',
      sessionType: 'group',
      level: '',
      group: '',
    });
  };

  const handleDeleteSession = () => {
    if (selectedSession) {
      setSessions(sessions.filter(session => session.id !== selectedSession.id));
      setShowDeleteModal(false);
      setSelectedSession(null);
    }
  };

  const getSessionForSlot = (day: string, time: string) => {
    return sessions.find(session => session.day === day && session.time === time);
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : '';
  };

  return (
    <div className="relative">
      {/* En-tête avec flèche de retour */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          title="Retour à la لوحة القيادة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800">الجدول الزمني للمقابلات</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">جدول المقابلات</h2>
          <div className="flex items-center gap-2 text-blue-500">
            <CalendarRange className="w-5 h-5" />
            <span>الأسبوع الحالي</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-center w-24">الوقت</th>
                {weekDays.map((day) => (
                  <th key={day} className="border border-gray-200 px-4 py-2 text-center">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-t">
                  <td className="border border-gray-200 px-4 py-2 text-center font-semibold">{time}</td>
                  {weekDays.map((day) => {
                    const session = getSessionForSlot(day, time);
                    return (
                      <td key={`${time}-${day}`} className="border border-gray-200 px-4 py-2">
                        <div
                          onClick={() => {
                            setSelectedTimeSlot({ day, time });
                            if (session) {
                              setSelectedSession(session);
                              setNewSession(session);
                              setShowAddModal(true);
                            } else {
                              handleAddSession();
                            }
                          }}
                          className={`h-16 rounded-lg p-2 cursor-pointer transition-colors ${
                            session ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          {session ? (
                            <div className="h-full flex flex-col">
                              <div className="font-semibold text-sm truncate">{session.title}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {session.sessionType === 'individual' 
                                  ? getStudentName(session.studentId || '')
                                  : `${session.level} - ${session.group}`
                                }
                              </div>
                              <div className="text-xs text-blue-500">
                                {session.sessionType === 'individual' ? 'جلسة فردية' : 'جلسة جماعية'}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                              <Plus className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedSession ? 'تعديل مقابلة' : 'إضافة مقابلة جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSession(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان المقابلة
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المقابلة
                </label>
                <select
                  value={newSession.sessionType}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    sessionType: e.target.value as 'individual' | 'group',
                    studentId: undefined // Reset student selection when changing type
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="group">مقابلة جماعية</option>
                  <option value="individual">مقابلة فردية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المستوى
                </label>
                <select
                  value={newSession.level}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    level: e.target.value,
                    group: '', // Reset group when changing level
                    studentId: undefined // Reset student selection when changing level
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">اختر المستوى</option>
                  {getCycleLevels().map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  القسم
                </label>
                <select
                  value={newSession.group}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    group: e.target.value,
                    studentId: undefined // Reset student selection when changing group
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!newSession.level} // Disable if no level is selected
                >
                  <option value="">اختر القسم</option>
                  {settings?.groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {newSession.sessionType === 'individual' && newSession.level && newSession.group && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التلميذ
                  </label>
                  <select
                    value={newSession.studentId}
                    onChange={(e) => setNewSession({ ...newSession, studentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">اختر التلميذ</option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {selectedSession && (
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 text-red-500 hover:text-red-600"
                >
                  حذف
                </button>
              )}
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSession}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">تأكيد حذف المقابلة</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذه المقابلة؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}