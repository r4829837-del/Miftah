import React, { useState, useEffect } from 'react';
import { addStudent, getSettings, type AppSettings } from '../lib/storage';
import { useNavigate } from 'react-router-dom';

export default function StudentForm() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>({
    schoolName: '',
    counselorName: '',
    levels: [],
    groups: [],
    semesters: []
  });
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    level: '',
    address: '',
    group: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    familyStatus: '',
    healthStatus: '',
    specialNeeds: '',
    notes: '',
    isRepeating: false,
    socialStatus: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await getSettings();
    setSettings(loadedSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent(formData);
      navigate('/students');
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">إضافة تلميذ جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Champs obligatoires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم التعريف <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اللقب <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستوى <span className="text-red-500">*</span>
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">اختر المستوى</option>
              {settings.levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفوج <span className="text-red-500">*</span>
            </label>
            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">اختر الفوج</option>
              {settings.groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الجنس <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              معيد <span className="text-red-500">*</span>
            </label>
            <select
              name="isRepeating"
              value={formData.isRepeating.toString()}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                isRepeating: e.target.value === 'true'
              }))}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="false">لا</option>
              <option value="true">نعم</option>
            </select>
          </div>
        </div>

        {/* Champs optionnels */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">معلومات إضافية (اختياري)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم ولي الأمر
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة الاجتماعية
              </label>
              <textarea
                name="socialStatus"
                value={formData.socialStatus || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="وصف الحالة الاجتماعية للتلميذ"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            إضافة التلميذ
          </button>
        </div>
      </form>
    </div>
  );
}