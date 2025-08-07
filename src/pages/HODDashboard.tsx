import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase/config';
import { ref, get, set, push } from 'firebase/database';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  Calendar,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  X,
  Info,
  AlertCircle,
  Mail,
  Phone,
  Clock,
  Target,
  Activity,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  Star,
  Zap,
  Shield,
  Database,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ViewAchievements from '../components/Admin/ViewAchievements';

interface DepartmentStudent {
  id: string;
  name: string;
  rollNo: string;
  course: string;
  year: number;
  attendance: number;
  averageMarks: number;
  feeStatus: 'paid' | 'pending' | 'overdue';
  lastUpdated: string;
}

interface DepartmentFaculty {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: number;
  status: 'active' | 'inactive';
}

interface DepartmentStats {
  totalStudents: number;
  totalFaculty: number;
  averageAttendance: number;
  averageMarks: number;
  pendingFees: number;
  completedAssignments: number;
  pendingAchievements: number;
  totalAchievements: number;
  departmentPerformance: number;
  studentSatisfaction: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
  count?: number;
}

const HODDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<DepartmentStudent[]>([]);
  const [faculty, setFaculty] = useState<DepartmentFaculty[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({
    totalStudents: 0,
    totalFaculty: 0,
    averageAttendance: 0,
    averageMarks: 0,
    pendingFees: 0,
    completedAssignments: 0,
    pendingAchievements: 0,
    totalAchievements: 0,
    departmentPerformance: 0,
    studentSatisfaction: 0
  });
  const [completedAssignments, setCompletedAssignments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showFacultyDetailModal, setShowFacultyDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<DepartmentStudent | null>(null);
  const [selectedFacultyDetail, setSelectedFacultyDetail] = useState<DepartmentFaculty | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [departmentAlerts, setDepartmentAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data first
      const [studentsData, facultyData, achievementsData] = await Promise.all([
        fetchDepartmentStudents(),
        fetchDepartmentFaculty(),
        fetchAchievements()
      ]);
      
      // Calculate stats using the fetched data
      await calculateStats(studentsData, facultyData);
      
      // Fetch recent activities and alerts
      await fetchRecentActivities();
      await fetchDepartmentAlerts();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStudents = async () => {
    try {
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return [];
      }

      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const studentsData: DepartmentStudent[] = [];
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          if (userData.role === 'student' && userData.department === department) {
            studentsData.push({
              id: userSnapshot.key!,
              name: userData.name || '',
              rollNo: userData.rollNo || '',
              course: userData.course || '',
              year: userData.year || '',
              attendance: userData.attendance || 0,
              averageMarks: userData.averageMarks || 0,
              feeStatus: userData.feeStatus || 'pending',
              lastUpdated: userData.updatedAt || userData.createdAt || new Date().toISOString()
            });
          }
        });
        setStudents(studentsData);
        return studentsData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching department students:', error);
      return [];
    }
  };

  const fetchDepartmentFaculty = async () => {
    try {
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return [];
      }

      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const facultyData: DepartmentFaculty[] = [];
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          if (userData.role === 'teacher' && userData.department === department) {
            facultyData.push({
              id: userSnapshot.key!,
              name: userData.name || '',
              designation: userData.designation || 'Teacher',
              email: userData.email || '',
              phone: userData.phone || '',
              subjects: userData.subjects || [],
              experience: userData.experience || 0,
              status: userData.status || 'active'
            });
          }
        });
        setFaculty(facultyData);
        return facultyData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching department faculty:', error);
      return [];
    }
  };

  const calculateStats = async (studentsData: DepartmentStudent[], facultyData: DepartmentFaculty[]) => {
    try {
      const totalStudents = studentsData.length;
      const totalFaculty = facultyData.length;
      const averageAttendance = studentsData.length > 0 
        ? studentsData.reduce((sum, student) => sum + student.attendance, 0) / studentsData.length 
        : 0;
      const averageMarks = studentsData.length > 0 
        ? studentsData.reduce((sum, student) => sum + student.averageMarks, 0) / studentsData.length 
        : 0;
      const pendingFees = studentsData.filter(student => student.feeStatus === 'pending' || student.feeStatus === 'overdue').length;
      
      // Calculate department performance based on attendance and marks
      const departmentPerformance = Math.round((averageAttendance + averageMarks) / 2);
      
      // Calculate student satisfaction (mock data for now)
      const studentSatisfaction = Math.round(85 + Math.random() * 10);
      
      setStats({
        totalStudents,
        totalFaculty,
        averageAttendance: Math.round(averageAttendance),
        averageMarks: Math.round(averageMarks),
        pendingFees,
        completedAssignments: Math.floor(Math.random() * 50) + 100,
        pendingAchievements: achievements.filter(a => a.status === 'forwarded_to_hod').length,
        totalAchievements: achievements.length,
        departmentPerformance,
        studentSatisfaction
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const achievementsRef = ref(database, 'achievements');
      const achievementsSnapshot = await get(achievementsRef);

      if (achievementsSnapshot.exists()) {
        const achievementsData: any[] = [];
        achievementsSnapshot.forEach((userSnapshot) => {
          const userId = userSnapshot.key;
          userSnapshot.forEach((achievementSnapshot) => {
          const achievementData = achievementSnapshot.val();
          achievementsData.push({
            id: achievementSnapshot.key!,
            ...achievementData
            });
          });
        });
        setAchievements(achievementsData);
        return achievementsData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  };

  const fetchRecentActivities = async () => {
    // Mock recent activities - in real implementation, this would fetch from database
    const activities = [
      {
        id: '1',
        type: 'achievement',
        message: 'New achievement submitted by John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        icon: Award,
        color: 'text-blue-600'
      },
      {
        id: '2',
        type: 'attendance',
        message: 'Attendance report generated for this week',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        icon: Clock,
        color: 'text-green-600'
      },
      {
        id: '3',
        type: 'faculty',
        message: 'Faculty meeting scheduled for tomorrow',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        icon: Users,
        color: 'text-purple-600'
      }
    ];
    setRecentActivities(activities);
  };

  const fetchDepartmentAlerts = async () => {
    // Mock department alerts - in real implementation, this would fetch from database
    const alerts = [
      {
        id: '1',
        type: 'warning',
        message: 'Low attendance detected in Computer Science 3rd year',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        icon: AlertTriangle,
        color: 'text-yellow-600'
      },
      {
        id: '2',
        type: 'info',
        message: 'New faculty member joined the department',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        icon: Info,
        color: 'text-blue-600'
      }
    ];
    setDepartmentAlerts(alerts);
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Student Management',
      description: 'View and manage department students',
      icon: Users,
      color: 'bg-blue-500',
      href: '/hod/students',
      count: stats.totalStudents
    },
    {
      id: '2',
      title: 'Faculty Management',
      description: 'Manage department faculty members',
      icon: GraduationCap,
      color: 'bg-green-500',
      href: '/hod/faculty',
      count: stats.totalFaculty
    },
    {
      id: '3',
      title: 'Achievement Approval',
      description: 'Review and approve student achievements',
      icon: Award,
      color: 'bg-purple-500',
      href: '/hod/achievements',
      count: stats.pendingAchievements
    },
    {
      id: '4',
      title: 'Reports & Analytics',
      description: 'View detailed department reports',
      icon: BarChart3,
      color: 'bg-orange-500',
      href: '/hod/reports'
    },
    {
      id: '5',
      title: 'Attendance Management',
      description: 'Monitor student attendance',
      icon: Calendar,
      color: 'bg-red-500',
      href: '/hod/attendance'
    },
    {
      id: '6',
      title: 'Department Settings',
      description: 'Configure department settings',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/hod/settings'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewStudentDetails = (student: DepartmentStudent) => {
    setSelectedStudentDetail(student);
    setShowStudentDetailModal(true);
  };

  const handleViewFacultyDetails = (faculty: DepartmentFaculty) => {
    setSelectedFacultyDetail(faculty);
    setShowFacultyDetailModal(true);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
                HOD Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {currentUser?.name} • {currentUser?.department} Department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                Quick Action
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
                <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
                </div>
              </div>
            </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
                </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAchievements}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
                </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Department Performance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.departmentPerformance}%</p>
                </div>
                </div>
              </div>
            </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.id}
                  href={action.href}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-6 w-6" />
            </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      {action.count !== undefined && (
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {action.count} items
                        </p>
            )}
          </div>
                        </div>
                </a>
              );
            })}
            </div>
          </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance & Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Attendance</span>
                <span className={`font-semibold ${getAttendanceColor(stats.averageAttendance)}`}>
                  {stats.averageAttendance}%
                      </span>
                    </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.averageAttendance}%` }}
                ></div>
      </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Marks</span>
                <span className="font-semibold text-blue-600">{stats.averageMarks}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.averageMarks}%` }}
                ></div>
                </div>
                
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Student Satisfaction</span>
                <span className="font-semibold text-purple-600">{stats.studentSatisfaction}%</span>
                  </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${stats.studentSatisfaction}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
              </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                    </div>
                );
              })}
                    </div>
                  </div>
                </div>

        {/* Alerts and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Alerts</h3>
            <div className="space-y-4">
              {departmentAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg bg-white`}>
                      <Icon className={`h-4 w-4 ${alert.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                    </div>
                );
              })}
                  </div>
                </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.completedAssignments}</p>
                <p className="text-sm text-gray-600">Completed Assignments</p>
                    </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.totalAchievements}</p>
                <p className="text-sm text-gray-600">Total Achievements</p>
                    </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingFees}</p>
                <p className="text-sm text-gray-600">Pending Fees</p>
                    </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.totalFaculty}</p>
                <p className="text-sm text-gray-600">Active Faculty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Modals */}
      {showStudentDetailModal && selectedStudentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Student Details</h3>
                <button
                onClick={() => setShowStudentDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
                  <div className="space-y-3">
              <p><strong>Name:</strong> {selectedStudentDetail.name}</p>
              <p><strong>Roll No:</strong> {selectedStudentDetail.rollNo}</p>
              <p><strong>Course:</strong> {selectedStudentDetail.course}</p>
              <p><strong>Year:</strong> {selectedStudentDetail.year}</p>
              <p><strong>Attendance:</strong> {selectedStudentDetail.attendance}%</p>
              <p><strong>Average Marks:</strong> {selectedStudentDetail.averageMarks}%</p>
              <p><strong>Fee Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedStudentDetail.feeStatus)}`}>
                            {selectedStudentDetail.feeStatus}
                          </span>
              </p>
                        </div>
          </div>
        </div>
      )}

      {showFacultyDetailModal && selectedFacultyDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Faculty Details</h3>
                    <button
                      onClick={() => setShowFacultyDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                      <div className="space-y-3">
              <p><strong>Name:</strong> {selectedFacultyDetail.name}</p>
              <p><strong>Designation:</strong> {selectedFacultyDetail.designation}</p>
              <p><strong>Email:</strong> {selectedFacultyDetail.email}</p>
              <p><strong>Phone:</strong> {selectedFacultyDetail.phone}</p>
              <p><strong>Experience:</strong> {selectedFacultyDetail.experience} years</p>
              <p><strong>Subjects:</strong> {selectedFacultyDetail.subjects.join(', ')}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  selectedFacultyDetail.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedFacultyDetail.status}
                        </span>
              </p>
                      </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;