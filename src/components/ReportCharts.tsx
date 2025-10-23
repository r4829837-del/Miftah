import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ReportChartsProps {
  data: {
    average: number;
    totals: {
      totalStudents: number;
      excellent: number;
      good: number;
      average: number;
      weak: number;
    };
    subjects: Array<{
      name: string;
      average: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    topPerformers: Array<{
      studentName: string;
      average: number;
    }>;
  };
}

const ReportCharts: React.FC<ReportChartsProps> = ({ data }) => {
  // Graphique en barres pour la répartition des étudiants
  const studentDistributionData = {
    labels: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'],
    datasets: [
      {
        label: `عدد ${currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}`,
        data: [data.totals.excellent, data.totals.good, data.totals.average, data.totals.weak],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Vert pour ممتاز
          'rgba(59, 130, 246, 0.8)',  // Bleu pour جيد
          'rgba(245, 158, 11, 0.8)',  // Orange pour متوسط
          'rgba(239, 68, 68, 0.8)',   // Rouge pour ضعيف
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Graphique en secteurs pour la répartition des étudiants
  const studentDistributionDoughnut = {
    labels: ['ممتاز', 'جيد', 'متوسط', 'ضعيف'],
    datasets: [
      {
        data: [data.totals.excellent, data.totals.good, data.totals.average, data.totals.weak],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Graphique linéaire pour les matières
  const subjectsData = {
    labels: data.subjects.map(subject => subject.name),
    datasets: [
      {
        label: 'معدل المادة',
        data: data.subjects.map(subject => subject.average),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Graphique en barres pour les meilleurs étudiants
  const topPerformersData = {
    labels: data.topPerformers.slice(0, 10).map(student => student.studentName),
    datasets: [
      {
        label: 'المعدل',
        data: data.topPerformers.slice(0, 10).map(student => student.average),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Arial, sans-serif',
            size: 12,
          },
        },
      },
      title: {
        display: true,
        font: {
          family: 'Arial, sans-serif',
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Arial, sans-serif',
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{data.average.toFixed(2)}</div>
          <div className="text-sm opacity-90">المعدل العام</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{data.totals.totalStudents}</div>
          <div className="text-sm opacity-90">إجمالي {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{data.subjects.length}</div>
          <div className="text-sm opacity-90">عدد المواد</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">
            {((data.totals.excellent / data.totals.totalStudents) * 100).toFixed(1)}%
          </div>
          <div className="text-sm opacity-90">نسبة الممتازين</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition des étudiants - Barres */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">توزيع {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} حسب المستوى</h3>
          <div className="h-80">
            <Bar data={studentDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Répartition des étudiants - Secteurs */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">توزيع {currentCycle === 'ثانوي' ? 'الطلاب' : 'التلاميذ'} (نسب مئوية)</h3>
          <div className="h-80">
            <Doughnut data={studentDistributionDoughnut} options={doughnutOptions} />
          </div>
        </div>

        {/* Graphique des matières */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">معدلات المواد</h3>
          <div className="h-80">
            <Line data={subjectsData} options={chartOptions} />
          </div>
        </div>

        {/* Meilleurs étudiants */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">أفضل 10 طلاب</h3>
          <div className="h-80">
            <Bar data={topPerformersData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Tableau détaillé des matières */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-center">تحليل مفصل للمواد</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-right">المادة</th>
                <th className="border border-gray-300 px-4 py-2 text-right">المعدل</th>
                <th className="border border-gray-300 px-4 py-2 text-right">الاتجاه</th>
                <th className="border border-gray-300 px-4 py-2 text-right">التقييم</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((subject, index) => {
                let evaluation = '';
                let evaluationColor = '';
                
                if (subject.average >= 16) {
                  evaluation = 'ممتاز';
                  evaluationColor = 'text-green-600';
                } else if (subject.average >= 14) {
                  evaluation = 'جيد جداً';
                  evaluationColor = 'text-blue-600';
                } else if (subject.average >= 12) {
                  evaluation = 'جيد';
                  evaluationColor = 'text-yellow-600';
                } else if (subject.average >= 10) {
                  evaluation = 'مقبول';
                  evaluationColor = 'text-orange-600';
                } else {
                  evaluation = 'ضعيف';
                  evaluationColor = 'text-red-600';
                }

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {subject.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {subject.average.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        subject.trend === 'up' 
                          ? 'bg-green-100 text-green-800' 
                          : subject.trend === 'down' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subject.trend === 'up' ? '↗️ صاعد' : subject.trend === 'down' ? '↘️ نازل' : '➡️ مستقر'}
                      </span>
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 text-right font-medium ${evaluationColor}`}>
                      {evaluation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportCharts;