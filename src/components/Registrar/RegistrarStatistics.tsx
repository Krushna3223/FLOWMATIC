import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, Download, TrendingUp, Users, GraduationCap, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface SemesterStatistics {
  id: string;
  semester: string;
  year: string;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  averageAttendance: number;
  totalFeesCollected: number;
  pendingFees: number;
  createdAt: string;
}

const RegistrarStatistics: React.FC = () => {
  const { currentUser } = useAuth();
  const [statistics, setStatistics] = useState<SemesterStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    // Mock data for statistics
    const mockStatistics: SemesterStatistics[] = [
      {
        id: 'STAT001',
        semester: '1st Semester',
        year: '2024',
        totalStudents: 150,
        passedStudents: 135,
        failedStudents: 15,
        averageAttendance: 85,
        totalFeesCollected: 450000,
        pendingFees: 25000,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'STAT002',
        semester: '2nd Semester',
        year: '2024',
        totalStudents: 145,
        passedStudents: 130,
        failedStudents: 15,
        averageAttendance: 82,
        totalFeesCollected: 435000,
        pendingFees: 30000,
        createdAt: '2024-01-14T15:45:00Z'
      },
      {
        id: 'STAT003',
        semester: '3rd Semester',
        year: '2024',
        totalStudents: 140,
        passedStudents: 125,
        failedStudents: 15,
        averageAttendance: 88,
        totalFeesCollected: 420000,
        pendingFees: 20000,
        createdAt: '2024-01-13T11:15:00Z'
      },
      {
        id: 'STAT004',
        semester: '4th Semester',
        year: '2024',
        totalStudents: 135,
        passedStudents: 120,
        failedStudents: 15,
        averageAttendance: 90,
        totalFeesCollected: 405000,
        pendingFees: 15000,
        createdAt: '2024-01-12T14:20:00Z'
      }
    ];

    setStatistics(mockStatistics);
    setLoading(false);
  };

  const handleExportReport = async (semesterId: string) => {
    try {
      const semester = statistics.find(stat => stat.id === semesterId);
      if (!semester) return;

      // Create report data
      const reportData = {
        semester: semester.semester,
        year: semester.year,
        statistics: semester,
        generatedBy: currentUser?.name || 'Registrar',
        generatedAt: new Date().toISOString()
      };

      // In a real application, you would generate a PDF or Excel file
      // For now, we'll just show a success message
      toast.success(`Report for ${semester.semester} ${semester.year} exported successfully`);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const calculateOverallStats = () => {
    if (statistics.length === 0) return null;

    const totalStudents = statistics.reduce((sum, stat) => sum + stat.totalStudents, 0);
    const totalPassed = statistics.reduce((sum, stat) => sum + stat.passedStudents, 0);
    const totalFailed = statistics.reduce((sum, stat) => sum + stat.failedStudents, 0);
    const avgAttendance = statistics.reduce((sum, stat) => sum + stat.averageAttendance, 0) / statistics.length;
    const totalFeesCollected = statistics.reduce((sum, stat) => sum + stat.totalFeesCollected, 0);
    const totalPendingFees = statistics.reduce((sum, stat) => sum + stat.pendingFees, 0);

    return {
      totalStudents,
      totalPassed,
      totalFailed,
      avgAttendance: Math.round(avgAttendance),
      totalFeesCollected,
      totalPendingFees
    };
  };

  const overallStats = calculateOverallStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Academic Statistics</h1>
        <p className="text-gray-600">View and analyze academic performance data</p>
      </div>

      {/* Overall Statistics Cards */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((overallStats.totalPassed / overallStats.totalStudents) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.avgAttendance}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fees Collected</p>
                <p className="text-2xl font-bold text-gray-900">₹{overallStats.totalFeesCollected.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="text-red-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-gray-900">₹{overallStats.totalPendingFees.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(((overallStats.totalFeesCollected - overallStats.totalPendingFees) / overallStats.totalFeesCollected) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Semester-wise Statistics */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Semester-wise Statistics</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fees Collected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{stat.semester}</div>
                      <div className="text-sm text-gray-500">{stat.year}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.totalStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-green-600 font-medium">{stat.passedStudents}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-red-600 font-medium">{stat.failedStudents}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.averageAttendance}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{stat.totalFeesCollected.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleExportReport(stat.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Download size={16} />
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800">
              Total Semesters: <span className="font-semibold">{statistics.length}</span>
            </p>
            <p className="text-sm text-blue-600">
              Latest data from {statistics[0]?.semester} {statistics[0]?.year}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarStatistics; 