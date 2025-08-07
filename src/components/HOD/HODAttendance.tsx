import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get, set, push, onValue } from 'firebase/database';
import { 
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  X,
  Plus,
  Edit,
  Trash2,
  FileText,
  PieChart,
  LineChart,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  course: string;
  year: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  subject: string;
  facultyName: string;
  remarks?: string;
  timestamp: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageAttendance: number;
  attendanceTrend: 'up' | 'down' | 'stable';
  lowAttendanceStudents: number;
  excellentAttendanceStudents: number;
}

interface SubjectAttendance {
  subject: string;
  totalClasses: number;
  averageAttendance: number;
  presentCount: number;
  absentCount: number;
}

const HODAttendance: React.FC = () => {
  const { currentUser } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    averageAttendance: 0,
    attendanceTrend: 'stable',
    lowAttendanceStudents: 0,
    excellentAttendanceStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectAttendance[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, filterSubject, filterYear]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return;
      }

      // Fetch students for the department
      await fetchDepartmentStudents();
      
      // Fetch attendance records
      await fetchAttendanceRecords();
      
      // Calculate statistics
      calculateAttendanceStats();
      
      // Calculate subject-wise statistics
      calculateSubjectStats();
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStudents = async () => {
    try {
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const studentsData: any[] = [];
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          if (userData.role === 'student' && userData.department === currentUser?.department) {
            studentsData.push({
              id: userSnapshot.key!,
              name: userData.name || '',
              rollNo: userData.rollNo || '',
              course: userData.course || '',
              year: userData.year || '',
              email: userData.email || '',
              phone: userData.phone || ''
            });
          }
        });
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching department students:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const attendanceRef = ref(database, 'attendance');
      const attendanceSnapshot = await get(attendanceRef);

      if (attendanceSnapshot.exists()) {
        const records: AttendanceRecord[] = [];
        attendanceSnapshot.forEach((dateSnapshot) => {
          const date = dateSnapshot.key;
          dateSnapshot.forEach((studentSnapshot) => {
            const studentId = studentSnapshot.key;
            const recordData = studentSnapshot.val();
            
            // Find student details
            const student = students.find(s => s.id === studentId);
            if (student) {
              records.push({
                id: `${date}_${studentId}`,
                studentId,
                studentName: student.name,
                rollNo: student.rollNo,
                course: student.course,
                year: student.year,
                date: date!,
                status: recordData.status || 'absent',
                subject: recordData.subject || 'General',
                facultyName: recordData.facultyName || 'Not specified',
                remarks: recordData.remarks,
                timestamp: recordData.timestamp || new Date().toISOString()
              });
            }
          });
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const calculateAttendanceStats = () => {
    const today = selectedDate;
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    const totalStudents = students.length;
    const presentToday = todayRecords.filter(record => record.status === 'present').length;
    const absentToday = todayRecords.filter(record => record.status === 'absent').length;
    const lateToday = todayRecords.filter(record => record.status === 'late').length;
    
    // Calculate average attendance for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = attendanceRecords.filter(record => 
      new Date(record.date) >= thirtyDaysAgo
    );
    
    const totalRecords = recentRecords.length;
    const presentRecords = recentRecords.filter(record => record.status === 'present').length;
    const averageAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
    
    // Calculate students with low attendance (< 75%)
    const studentAttendanceMap = new Map<string, { present: number; total: number }>();
    
    recentRecords.forEach(record => {
      const current = studentAttendanceMap.get(record.studentId) || { present: 0, total: 0 };
      current.total++;
      if (record.status === 'present') current.present++;
      studentAttendanceMap.set(record.studentId, current);
    });
    
    const lowAttendanceStudents = Array.from(studentAttendanceMap.values())
      .filter(({ present, total }) => total > 0 && (present / total) < 0.75).length;
    
    const excellentAttendanceStudents = Array.from(studentAttendanceMap.values())
      .filter(({ present, total }) => total > 0 && (present / total) >= 0.9).length;
    
    // Determine trend
    const previousWeekRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recordDate >= weekAgo && recordDate < thirtyDaysAgo;
    });
    
    const previousWeekPresent = previousWeekRecords.filter(record => record.status === 'present').length;
    const previousWeekTotal = previousWeekRecords.length;
    const previousWeekAvg = previousWeekTotal > 0 ? (previousWeekPresent / previousWeekTotal) * 100 : 0;
    
    let attendanceTrend: 'up' | 'down' | 'stable' = 'stable';
    if (averageAttendance > previousWeekAvg + 5) attendanceTrend = 'up';
    else if (averageAttendance < previousWeekAvg - 5) attendanceTrend = 'down';
    
    setStats({
      totalStudents,
      presentToday,
      absentToday,
      lateToday,
      averageAttendance,
      attendanceTrend,
      lowAttendanceStudents,
      excellentAttendanceStudents
    });
  };

  const calculateSubjectStats = () => {
    const subjectMap = new Map<string, { total: number; present: number; absent: number }>();
    
    attendanceRecords.forEach(record => {
      const current = subjectMap.get(record.subject) || { total: 0, present: 0, absent: 0 };
      current.total++;
      if (record.status === 'present') current.present++;
      else current.absent++;
      subjectMap.set(record.subject, current);
    });
    
    const subjectStats: SubjectAttendance[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      totalClasses: data.total,
      averageAttendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      presentCount: data.present,
      absentCount: data.absent
    }));
    
    setSubjectStats(subjectStats);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDate = record.date === selectedDate;
    const matchesSubject = filterSubject === 'all' || record.subject === filterSubject;
    const matchesYear = filterYear === 'all' || record.year.toString() === filterYear;
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesSubject && matchesYear && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half-day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'half-day':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddAttendance = async (formData: any) => {
    try {
      const attendanceRef = ref(database, `attendance/${selectedDate}/${formData.studentId}`);
      await set(attendanceRef, {
        status: formData.status,
        subject: formData.subject,
        facultyName: currentUser?.name || 'HOD',
        remarks: formData.remarks,
        timestamp: new Date().toISOString()
      });
      
      toast.success('Attendance record added successfully');
      setShowAddModal(false);
      fetchAttendanceData();
    } catch (error) {
      console.error('Error adding attendance record:', error);
      toast.error('Failed to add attendance record');
    }
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const exportAttendanceReport = () => {
    const csvContent = [
      ['Date', 'Student Name', 'Roll No', 'Course', 'Year', 'Status', 'Subject', 'Faculty', 'Remarks'],
      ...filteredRecords.map(record => [
        record.date,
        record.studentName,
        record.rollNo,
        record.course,
        record.year.toString(),
        record.status,
        record.subject,
        record.facultyName,
        record.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Attendance Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage student attendance for {currentUser?.department} Department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Record
              </button>
              <button
                onClick={exportAttendanceReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absentToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lateToday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Attendance (30 days)</span>
                <span className="font-semibold text-blue-600">{stats.averageAttendance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.averageAttendance}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Students with Low Attendance</span>
                <span className="font-semibold text-red-600">{stats.lowAttendanceStudents}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Excellent Attendance Students</span>
                <span className="font-semibold text-green-600">{stats.excellentAttendanceStudents}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trend:</span>
                {stats.attendanceTrend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                {stats.attendanceTrend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                {stats.attendanceTrend === 'stable' && <Activity className="h-4 w-4 text-gray-600" />}
                <span className={`text-sm font-medium ${
                  stats.attendanceTrend === 'up' ? 'text-green-600' :
                  stats.attendanceTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats.attendanceTrend === 'up' ? 'Improving' :
                   stats.attendanceTrend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
            <div className="space-y-3">
              {subjectStats.slice(0, 5).map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-xs text-gray-500">{subject.totalClasses} classes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">{subject.averageAttendance}%</p>
                    <p className="text-xs text-gray-500">{subject.presentCount}/{subject.totalClasses}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">Computer Science</option>
                <option value="English">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Attendance Records - {new Date(selectedDate).toLocaleDateString()}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course & Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        <div className="text-sm text-gray-500">Roll: {record.rollNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.course}</div>
                      <div className="text-sm text-gray-500">Year {record.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.facultyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No attendance records found for the selected criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Attendance Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddAttendance({
                studentId: formData.get('studentId') as string,
                status: formData.get('status') as string,
                subject: formData.get('subject') as string,
                remarks: formData.get('remarks') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    name="studentId"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.rollNo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half-day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    name="subject"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    name="remarks"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Optional remarks..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Attendance Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              <p><strong>Student:</strong> {selectedRecord.studentName}</p>
              <p><strong>Roll No:</strong> {selectedRecord.rollNo}</p>
              <p><strong>Course:</strong> {selectedRecord.course}</p>
              <p><strong>Year:</strong> {selectedRecord.year}</p>
              <p><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedRecord.status)}`}>
                  {selectedRecord.status}
                </span>
              </p>
              <p><strong>Subject:</strong> {selectedRecord.subject}</p>
              <p><strong>Faculty:</strong> {selectedRecord.facultyName}</p>
              <p><strong>Time:</strong> {new Date(selectedRecord.timestamp).toLocaleString()}</p>
              {selectedRecord.remarks && (
                <p><strong>Remarks:</strong> {selectedRecord.remarks}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODAttendance; 