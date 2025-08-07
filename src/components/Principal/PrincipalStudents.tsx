import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';
import { 
  Users, 
  GraduationCap, 
  Eye,
  Search,
  Filter,
  Building,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  department: string;
  email: string;
  phone?: string;
}

interface StudentStats {
  totalStudents: number;
  departments: number;
  averageAttendance: number;
  averageMarks: number;
  feePending: number;
  departmentBreakdown: { department: string; count: number }[];
  courseBreakdown: { course: string; count: number }[];
  yearBreakdown: { year: number; count: number }[];
}

const PrincipalStudents: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<DepartmentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    departments: 0,
    averageAttendance: 0,
    averageMarks: 0,
    feePending: 0,
    departmentBreakdown: [],
    courseBreakdown: [],
    yearBreakdown: []
  });

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch all users and filter by role student
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const studentsData: DepartmentStudent[] = [];
        const departmentStats: { [key: string]: number } = {};
        const courseStats: { [key: string]: number } = {};
        const yearStats: { [key: number]: number } = {};
        let totalAttendance = 0;
        let totalMarks = 0;
        let feePendingCount = 0;
        let studentCount = 0;
        
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          // Check if user is a student
          if (userData.role === 'student') {
            const student: DepartmentStudent = {
              id: userSnapshot.key!,
              name: userData.name || '',
              rollNo: userData.rollNo || '',
              course: userData.course || '',
              year: userData.year || 1,
              attendance: userData.attendance || 0,
              averageMarks: userData.averageMarks || 0,
              feeStatus: userData.feeStatus || 'pending',
              lastUpdated: userData.updatedAt || userData.createdAt || new Date().toISOString(),
              department: userData.department || 'Unknown',
              email: userData.email || '',
              phone: userData.phone || ''
            };
            
            studentsData.push(student);
            
            // Calculate stats
            const dept = student.department;
            departmentStats[dept] = (departmentStats[dept] || 0) + 1;
            
            const course = student.course;
            courseStats[course] = (courseStats[course] || 0) + 1;
            
            const year = student.year;
            yearStats[year] = (yearStats[year] || 0) + 1;
            
            totalAttendance += student.attendance;
            totalMarks += student.averageMarks;
            if (student.feeStatus === 'pending' || student.feeStatus === 'overdue') {
              feePendingCount++;
            }
            studentCount++;
          }
        });
        
        setStudents(studentsData);
        
        // Calculate department breakdown
        const departmentBreakdown = Object.entries(departmentStats)
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count);
        
        // Calculate course breakdown
        const courseBreakdown = Object.entries(courseStats)
          .map(([course, count]) => ({ course, count }))
          .sort((a, b) => b.count - a.count);
        
        // Calculate year breakdown
        const yearBreakdown = Object.entries(yearStats)
          .map(([year, count]) => ({ year: parseInt(year), count }))
          .sort((a, b) => a.year - b.year);
        
        setStats({
          totalStudents: studentCount,
          departments: departmentBreakdown.length,
          averageAttendance: studentCount > 0 ? Math.round(totalAttendance / studentCount) : 0,
          averageMarks: studentCount > 0 ? Math.round(totalMarks / studentCount) : 0,
          feePending: feePendingCount,
          departmentBreakdown,
          courseBreakdown,
          yearBreakdown
        });
        
        console.log('📚 PrincipalStudents: Students found:', studentsData.length, 'across all departments');
        console.log('📊 PrincipalStudents: Department breakdown:', departmentBreakdown);
      } else {
        setStudents([]);
        console.log('📚 PrincipalStudents: No users found');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getFeeStatusColor = (status: string) => {
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || student.year.toString() === filterYear;
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    
    return matchesSearch && matchesYear && matchesCourse && matchesDepartment;
  });

  const getUniqueDepartments = () => {
    const departments = new Set(students.map(s => s.department));
    return Array.from(departments).sort();
  };

  const getUniqueCourses = () => {
    const courses = new Set(students.map(s => s.course));
    return Array.from(courses).sort();
  };

  const getUniqueYears = () => {
    const years = new Set(students.map(s => s.year));
    return Array.from(years).sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Principal Students Dashboard</h1>
            <p className="text-gray-600">View and manage students across all departments</p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">{stats.totalStudents}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Marks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageMarks}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fee Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.feePending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Student Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.departmentBreakdown.map((dept, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{dept.department}</p>
                  <p className="text-sm text-gray-600">{dept.count} students</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{dept.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year.toString()}>Year {year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {getUniqueCourses().map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Students ({filteredStudents.length})
          </h3>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course & Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.rollNo}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{student.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.course}</div>
                      <div className="text-sm text-gray-500">Year {student.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.averageMarks}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFeeStatusColor(student.feeStatus)}`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Course-wise Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.courseBreakdown.map((course, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{course.course}</p>
                  <p className="text-sm text-gray-600">{course.count} students</p>
                </div>
                <div className="text-2xl font-bold text-green-600">{course.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Year Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Year-wise Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.yearBreakdown.map((year, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Year {year.year}</p>
                  <p className="text-sm text-gray-600">{year.count} students</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">{year.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalStudents; 