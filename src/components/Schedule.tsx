import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarRange, Plus, X, Save, AlertTriangle, ArrowRight, Printer } from 'lucide-react';
import { getStudents, Student, getSettings, AppSettings, getScheduleSessions, upsertScheduleSession, deleteScheduleSession as storageDeleteScheduleSession, getCycleLocalStorage, setCycleLocalStorage, formatDate } from '../lib/storage';
import { useCycle } from '../contexts/CycleContext';
import { useNavigate } from 'react-router-dom';
import { startOfWeek, addWeeks, addDays } from 'date-fns';

const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const timeSlots = ['08:00', '09:30', '11:00', '13:30', '15:00'];

//

interface Session {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  sessionType: 'individual' | 'group';
  level: string;
  group: string;
  // For individual
  studentId?: string;
  // For group sessions targeting multiple students or cohorts
  targetType?: 'students' | 'class' | 'group';
  studentIds?: string[];
  // ISO date
  date?: string;
  // Optional manual fields
  manualLastName?: string; // اللقب
  manualFirstName?: string; // الاسم
  manualLevel?: string; // المستوى
  manualSection?: string; // القسم
}

export default function Schedule() {
  const { getCycleLevels } = useCycle();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string; dateISO?: string } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [newSession, setNewSession] = useState<Omit<Session, 'id'>>({
    day: '',
    time: '',
    title: '',
    description: '',
    sessionType: 'group',
    level: '',
    group: '',
    targetType: 'group',
    studentIds: [],
    date: '',
    manualLastName: '',
    manualFirstName: '',
    manualLevel: '',
    manualSection: ''
  });

  // Week navigation (current week + next 3 weeks)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const baseWeekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []); // Sunday as first day
  const currentWeekStart = useMemo(() => addWeeks(baseWeekStart, weekOffset), [baseWeekStart, weekOffset]);
  const weekDates = useMemo(() => weekDays.map((_, idx) => addDays(currentWeekStart, idx)), [currentWeekStart]);

  // Track an explicitly picked header date so the DatePicker displays the chosen day
  const [pickedHeaderDate, setPickedHeaderDate] = useState<Date | null>(null);

  const formatISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  const handleHeaderDateChange = (value: string) => {
    if (!value) return;
    const picked = new Date(value);
    const pickedWeekStart = startOfWeek(picked, { weekStartsOn: 0 });
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const rawOffset = Math.floor((pickedWeekStart.getTime() - baseWeekStart.getTime()) / msPerWeek);
    setWeekOffset(rawOffset);
  };

  const handleHeaderDateChangeDate = (picked: Date | null) => {
    if (!picked) return;
    const pickedWeekStart = startOfWeek(picked, { weekStartsOn: 0 });
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const rawOffset = Math.floor((pickedWeekStart.getTime() - baseWeekStart.getTime()) / msPerWeek);
    setWeekOffset(rawOffset);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sauvegarder automatiquement les sessions dans le stockage local quand elles changent
  // Les sessions sont maintenant sauvegardées directement via upsertScheduleSession

  const loadData = async () => {
    try {
      const [loadedStudents, loadedSettings, loadedSessions] = await Promise.all([
        getStudents(),
        getSettings(),
        getScheduleSessions()
      ]);
      setStudents(loadedStudents);
      setSettings(loadedSettings);
      
      console.log('Sessions chargées depuis la base de données:', loadedSessions);
      
      // Utiliser directement les sessions chargées (qui utilisent maintenant localStorage)
      if (loadedSessions && loadedSessions.length > 0) {
        setSessions(loadedSessions as Session[]);
        console.log('Sessions chargées depuis localStorage via getScheduleSessions');
      } else {
        setSessions([]);
        console.log('Aucune session trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setSessions([]);
    }
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
    // Reset select-all when filter changes
    setAllSelected(false);
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
        targetType: 'group',
        studentIds: [],
        date: selectedTimeSlot.dateISO || '',
        manualLastName: '',
        manualFirstName: '',
        manualLevel: '',
        manualSection: ''
      });
      setShowAddModal(true);
    }
  };

  const handleSaveSession = async () => {
    console.log('Sauvegarde de session:', newSession);
    console.log('Date de la session:', newSession.date);
    
    try {
      if (selectedSession) {
        // Edit existing session
        const updated: Session = { ...selectedSession, ...newSession } as Session;
        console.log('Mise à jour de session:', updated);
        await upsertScheduleSession(updated);
        const next = sessions.map(session => session.id === updated.id ? updated : session);
        setSessions(next);
      } else {
        // Add new session
        const created: Session = {
          id: Math.random().toString(36).substr(2, 9),
          ...newSession
        } as Session;
        console.log('Nouvelle session créée:', created);
        await upsertScheduleSession(created);
        const next = [...sessions, created];
        setSessions(next);
        console.log('Sessions après ajout:', next);
      }
      
      console.log('Session sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du rendez-vous. Veuillez réessayer.');
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
      targetType: 'group',
      studentIds: [],
      date: '',
      manualLastName: '',
      manualFirstName: '',
      manualLevel: '',
      manualSection: ''
    });
  };

  const handleDeleteSession = async () => {
    if (selectedSession) {
      await storageDeleteScheduleSession(selectedSession.id);
      const next = sessions.filter(session => session.id !== selectedSession.id);
      setSessions(next);
      setCycleLocalStorage('scheduleData', next);
      setShowDeleteModal(false);
      setSelectedSession(null);
    }
  };

  const getSessionForSlot = (day: string, time: string, dateISOForDay: string) => {
    // Prefer strict date match if session has a date
    const match = sessions.find(session => {
      if (session.day !== day || session.time !== time) return false;
      if (session.date && session.date.length >= 10) {
        const matches = session.date.slice(0, 10) === dateISOForDay;
        console.log(`Vérification session ${session.title}: date=${session.date.slice(0, 10)}, dateISOForDay=${dateISOForDay}, match=${matches}`);
        return matches;
      }
      // For sessions without a specific date, show them in the current week only
      const legacyMatch = weekOffset === 0;
      console.log(`Session legacy ${session.title}: weekOffset=${weekOffset}, match=${legacyMatch}`);
      return legacyMatch;
    });
    console.log(`getSessionForSlot(${day}, ${time}, ${dateISOForDay}):`, match);
    return match;
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : '';
  };
  
  const toggleStudentSelection = (id: string) => {
    const current = newSession.studentIds || [];
    const exists = current.includes(id);
    const updated = exists ? current.filter(sid => sid !== id) : [...current, id];
    setNewSession({ ...newSession, studentIds: updated });
    setAllSelected(updated.length > 0 && updated.length === filteredStudents.length);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setNewSession({ ...newSession, studentIds: [] });
      setAllSelected(false);
    } else {
      const allIds = filteredStudents.map(s => s.id);
      setNewSession({ ...newSession, studentIds: allIds });
      setAllSelected(allIds.length > 0);
    }
  };

  const handlePrint = () => {
    // Créer le contenu HTML du tableau manuellement
    const weekDates = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));
    
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="border: 1px solid #d1d5db; padding: 12px 8px; text-align: center; font-size: 14px; font-weight: 600; color: #374151;">الوقت</th>
            ${weekDays.map((day, idx) => `
              <th style="border: 1px solid #d1d5db; padding: 12px 8px; text-align: center; font-size: 14px; font-weight: 600; color: #374151;">
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <span>${day}</span>
                  <span style="font-size: 12px; color: #6b7280; margin-top: 4px;">${formatDate(weekDates[idx])}</span>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${timeSlots.map(time => `
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 12px 8px; text-align: center; font-size: 14px; font-weight: 600; background-color: #f9fafb; color: #374151;">${time}</td>
              ${weekDays.map((day, idx) => {
                const dateISO = formatISODate(weekDates[idx]);
                const session = getSessionForSlot(day, time, dateISO);
                return `
                  <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; min-height: 80px; vertical-align: top;">
                    ${session ? `
                      <div style="font-size: 11px; line-height: 1.3; text-align: center;">
                        <div style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${session.title}</div>
                        ${session.manualFirstName && session.manualLastName ? `
                          <div style="color: #6b7280; font-size: 10px;">${session.manualFirstName} ${session.manualLastName}</div>
                        ` : ''}
                        ${session.level ? `
                          <div style="color: #6b7280; font-size: 10px;">${session.level}</div>
                        ` : ''}
                      </div>
                    ` : `
                      <div style="color: #9ca3af; font-size: 18px; display: flex; align-items: center; justify-content: center; height: 60px;">+</div>
                    `}
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>الجدول الزمني للمقابلات</title>
              <meta charset="UTF-8">
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  direction: rtl; 
                  margin: 20px;
                  color: #333;
                  background: white;
                }
                .print-header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .print-header h1 {
                  font-size: 28px;
                  margin: 0 0 10px 0;
                  color: #1f2937;
                }
                .print-header p {
                  margin: 5px 0;
                  color: #6b7280;
                  font-size: 16px;
                }
                @media print {
                  body { margin: 0; }
                  .print-header { page-break-after: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="print-header">
                <h1>الجدول الزمني للمقابلات</h1>
                <p>الأسبوع: ${formatDate(currentWeekStart)} - ${formatDate(addDays(currentWeekStart, 4))}</p>
              </div>
              ${tableHTML}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      } else {
        alert('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les popups ne sont pas bloqués.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression: ' + error.message);
    }
  };

  return (
    <div className="relative">
      {/* En-tête avec flèche de retour */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            title="Retour à la لوحة القيادة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">الجدول الزمني للمقابلات</h1>
        </div>
        <div className="flex items-center gap-3 text-blue-600">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="طباعة الجدول"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
          <button
            onClick={() => {
              setPickedHeaderDate(null);
              setWeekOffset(prev => prev - 1);
            }}
            className="px-2 py-1 rounded border hover:bg-blue-50"
            title="الأسبوع السابق"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5" />
            <div dir="rtl">
              <DatePicker
                selected={pickedHeaderDate ?? currentWeekStart}
                onChange={(d) => { setPickedHeaderDate(d); handleHeaderDateChangeDate(d); }}
                dateFormat="yyyy-MM-dd"
                calendarStartDay={0}
                shouldCloseOnSelect
                popperPlacement="bottom-end"
                className="px-3 py-1.5 border rounded-md text-gray-700 text-right"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setPickedHeaderDate(null);
              setWeekOffset(prev => prev + 1);
            }}
            className="px-2 py-1 rounded border hover:bg-blue-50"
            title="الأسبوع التالي"
          >
            ›
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        
        <div className="overflow-x-auto">
          <table id="schedule-table" className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-center w-24">الوقت</th>
                {weekDays.map((day, idx) => (
                  <th key={day} className="border border-gray-200 px-4 py-2 text-center align-middle">
                    <div className="flex flex-col items-center">
                      <span>{day}</span>
                      <span className="text-xs text-gray-500">{formatDate(formatISODate(weekDates[idx]))}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-t">
                  <td className="border border-gray-200 px-4 py-2 text-center font-semibold">{time}</td>
                  {weekDays.map((day, idx) => {
                    const dateISO = formatISODate(weekDates[idx]);
                    const session = getSessionForSlot(day, time, dateISO);
                    return (
                      <td key={`${time}-${day}`} className="border border-gray-200 px-2 py-2 align-middle">
                        <div
                          onClick={() => {
                            setSelectedTimeSlot({ day, time, dateISO });
                            if (session) {
                              setSelectedSession(session);
                              setNewSession(session);
                              setShowAddModal(true);
                            } else {
                              handleAddSession();
                            }
                          }}
                          className={`h-24 rounded-lg p-2 cursor-pointer transition-colors relative group ${
                            session ? 'bg-blue-50 hover:bg-blue-100 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-gray-50'
                          }`}
                        >
                          {session ? (
                            <>
                              <div className="h-full flex flex-col gap-1 items-center justify-center text-center">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="font-semibold text-base truncate text-gray-800 max-w-[85%]">{session.title}</div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${session.sessionType === 'individual' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {session.sessionType === 'individual' ? 'فردية' : 'جماعية'}
                                </span>
                              </div>
                              {session.date && (
                                <div className="text-xs text-gray-500">{formatDate(session.date)}</div>
                              )}
                              <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-gray-600">
                                {session.sessionType === 'individual' ? (
                                  <span className="px-2 py-0.5 bg-gray-100 rounded-full">{
                                    session.manualFirstName || session.manualLastName
                                      ? `${session.manualFirstName || ''} ${session.manualLastName || ''}`.trim()
                                      : getStudentName(session.studentId || '')
                                  }</span>
                                ) : (
                                  <>
                                    {session.targetType === 'class' && (
                                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{session.manualLevel || session.level} • الفصل بالكامل</span>
                                    )}
                                    {session.targetType === 'group' && (
                                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{session.manualLevel || session.level} • القسم {session.manualSection || session.group}</span>
                                    )}
                                    {session.targetType === 'students' && (
                                      <>
                                        {(session.manualLevel || session.level) && (
                                          <span className="px-2 py-0.5 bg-gray-100 rounded-full">{session.manualLevel || session.level}{(session.manualSection || session.group) ? ` • ${session.manualSection || session.group}` : ''}</span>
                                        )}
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{session.studentIds?.length || 0} تلميذ(ة)</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            </>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                              <Plus className="w-6 h-6" />
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-4 md:mx-6 max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Manual name entry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اللقب
                </label>
                <input
                  type="text"
                  value={newSession.manualLastName || ''}
                  onChange={(e) => setNewSession({ ...newSession, manualLastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="أدخل اللقب"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  value={newSession.manualFirstName || ''}
                  onChange={(e) => setNewSession({ ...newSession, manualFirstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="أدخل الاسم"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  التاريخ
                </label>
                <div dir="rtl">
                  <DatePicker
                    selected={newSession.date ? new Date(newSession.date) : null}
                    onChange={(d) => setNewSession({ ...newSession, date: d ? formatISODate(d as Date) : '' })}
                    dateFormat="yyyy-MM-dd"
                    calendarStartDay={0}
                    shouldCloseOnSelect
                    className="w-full px-3 py-2 border rounded-lg text-right"
                  />
                </div>
              </div>

                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المقابلة
                </label>
                <select
                  value={newSession.sessionType}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    sessionType: e.target.value as 'individual' | 'group',
                    studentId: undefined, // Reset student selection when changing type
                    studentIds: [],
                    targetType: e.target.value === 'group' ? (newSession.targetType || 'group') : undefined
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="group">مقابلة جماعية</option>
                  <option value="individual">مقابلة فردية</option>
                </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المستوى
                </label>
                <div>
                <select
                  value={newSession.level}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    level: e.target.value,
                    group: '', // Reset group when changing level
                    studentId: undefined, // Reset student selection when changing level
                    studentIds: []
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">اختر المستوى</option>
                  {getCycleLevels().map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفوج
                </label>
                <div>
                <select
                  value={newSession.group}
                  onChange={(e) => setNewSession({ 
                    ...newSession, 
                    group: e.target.value,
                    studentId: undefined, // Reset student selection when changing group
                    studentIds: []
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                    disabled={!newSession.level}
                >
                  <option value="">اختر الفوج</option>
                  {settings?.groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                </div>
              </div>
              </div>

              



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