import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
  Eye,
  X,
  Building,
  GraduationCap,
  DollarSign,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReportData {
  totalStudents: number;
  totalFaculty: number;
  averageAttendance: number;
  averageMarks: number;
  pendingFees: number;
  completedAssignments: number;
  institutePerformance: {
    academic: number;
    attendance: number;
    fees: number;
    achievements: number;
  };
  monthlyStats: {
    month: string;
    students: number;
    attendance: number;
    marks: number;
  }[];
  departmentStats: {
    department: string;
    students: number;
    faculty: number;
    attendance: number;
    marks: number;
  }[];
}

const PrincipalReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    totalFaculty: 0,
    averageAttendance: 0,
    averageMarks: 0,
    pendingFees: 0,
    completedAssignments: 0,
    institutePerformance: {
      academic: 0,
      attendance: 0,
      fees: 0,
      achievements: 0
    },
    monthlyStats: [],
    departmentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');
  
  // Modal states for Performance section
  const [showStudentPerformanceModal, setShowStudentPerformanceModal] = useState(false);
  const [showFacultyPerformanceModal, setShowFacultyPerformanceModal] = useState(false);
  const [showAcademicProgressModal, setShowAcademicProgressModal] = useState(false);
  
  // Modal states for Quick Actions
  const [showAttendanceReportModal, setShowAttendanceReportModal] = useState(false);
  const [showAcademicReportModal, setShowAcademicReportModal] = useState(false);
  const [showFinancialReportModal, setShowFinancialReportModal] = useState(false);
  const [showExportDataModal, setShowExportDataModal] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      console.log('🏢 PrincipalReports: Fetching institute-wide data');
      console.log('👤 PrincipalReports: Current user:', currentUser);

      // Fetch all users data
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        console.log('📋 PrincipalReports: All users data:', usersData);
        
        let totalStudents = 0;
        let totalFaculty = 0;
        let totalAttendance = 0;
        let totalMarks = 0;
        let pendingFees = 0;
        const departmentStats: { [key: string]: any } = {};
        
        // Process all users
        Object.keys(usersData).forEach((userId) => {
          const userData = usersData[userId];
          
          if (userData.role === 'student') {
            totalStudents++;
            totalAttendance += userData.attendance || 0;
            totalMarks += userData.averageMarks || 0;
            if (userData.feeStatus === 'pending' || userData.feeStatus === 'overdue') {
              pendingFees++;
            }
            
            // Department stats for students
            const dept = userData.department || 'Unknown';
            if (!departmentStats[dept]) {
              departmentStats[dept] = {
                students: 0,
                faculty: 0,
                attendance: 0,
                marks: 0
              };
            }
            departmentStats[dept].students++;
            departmentStats[dept].attendance += userData.attendance || 0;
            departmentStats[dept].marks += userData.averageMarks || 0;
          } else if (userData.role === 'teacher') {
            totalFaculty++;
            
            // Department stats for faculty
            const dept = userData.department || 'Unknown';
            if (!departmentStats[dept]) {
              departmentStats[dept] = {
                students: 0,
                faculty: 0,
                attendance: 0,
                marks: 0
              };
            }
            departmentStats[dept].faculty++;
          }
        });

        // Calculate averages
        const averageAttendance = totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0;
        const averageMarks = totalStudents > 0 ? Math.round(totalMarks / totalStudents) : 0;

        // Convert department stats to array
        const departmentStatsArray = Object.entries(departmentStats)
          .map(([department, stats]) => ({
            department,
            students: stats.students,
            faculty: stats.faculty,
            attendance: stats.students > 0 ? Math.round(stats.attendance / stats.students) : 0,
            marks: stats.students > 0 ? Math.round(stats.marks / stats.students) : 0
          }))
          .sort((a, b) => b.students - a.students);

        // Generate monthly stats (mock data for now)
        const monthlyStats = [
          { month: 'Jan', students: totalStudents, attendance: averageAttendance, marks: averageMarks },
          { month: 'Feb', students: totalStudents, attendance: averageAttendance + 2, marks: averageMarks + 1 },
          { month: 'Mar', students: totalStudents, attendance: averageAttendance + 1, marks: averageMarks + 2 },
          { month: 'Apr', students: totalStudents, attendance: averageAttendance + 3, marks: averageMarks + 1 },
          { month: 'May', students: totalStudents, attendance: averageAttendance + 2, marks: averageMarks + 3 },
          { month: 'Jun', students: totalStudents, attendance: averageAttendance + 1, marks: averageMarks + 2 }
        ];

        // Calculate institute performance
        const institutePerformance = {
          academic: averageMarks,
          attendance: averageAttendance,
          fees: totalStudents > 0 ? Math.round(((totalStudents - pendingFees) / totalStudents) * 100) : 0,
          achievements: 85 // Mock data
        };

        setReportData({
          totalStudents,
          totalFaculty,
          averageAttendance,
          averageMarks,
          pendingFees,
          completedAssignments: 156, // Mock data
          institutePerformance,
          monthlyStats,
          departmentStats: departmentStatsArray
        });

        console.log('📊 PrincipalReports: Institute data calculated');
        console.log('👥 PrincipalReports: Total students:', totalStudents);
        console.log('👨‍🏫 PrincipalReports: Total faculty:', totalFaculty);
        console.log('📈 PrincipalReports: Average attendance:', averageAttendance);
        console.log('📊 PrincipalReports: Average marks:', averageMarks);
        console.log('💰 PrincipalReports: Pending fees:', pendingFees);
        console.log('🏢 PrincipalReports: Department stats:', departmentStatsArray);
      } else {
        console.log('📋 PrincipalReports: No users found');
        setReportData({
          totalStudents: 0,
          totalFaculty: 0,
          averageAttendance: 0,
          averageMarks: 0,
          pendingFees: 0,
          completedAssignments: 0,
          institutePerformance: { academic: 0, attendance: 0, fees: 0, achievements: 0 },
          monthlyStats: [],
          departmentStats: []
        });
      }
    } catch (error) {
      console.error('❌ PrincipalReports: Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBgColor = (value: number) => {
    if (value >= 90) return 'bg-green-100';
    if (value >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const downloadStudentPerformanceReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('STUDENT PERFORMANCE REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Institute Overview:', 15, y);
    y += 10;
    doc.text(`Total Students: ${reportData.totalStudents}`, 20, y);
    y += 5;
    doc.text(`Average Attendance: ${reportData.averageAttendance}%`, 20, y);
    y += 5;
    doc.text(`Average Marks: ${reportData.averageMarks}%`, 20, y);
    y += 5;
    doc.text(`Pending Fees: ${reportData.pendingFees}`, 20, y);
    y += 10;
    
    doc.text('Department-wise Performance:', 15, y);
    y += 10;
    
    reportData.departmentStats.forEach((dept, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${dept.department}:`, 20, y);
      y += 5;
      doc.text(`  Students: ${dept.students} | Faculty: ${dept.faculty}`, 25, y);
      y += 5;
      doc.text(`  Attendance: ${dept.attendance}% | Marks: ${dept.marks}%`, 25, y);
      y += 10;
    });
    
    doc.save(`student_performance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Student performance report generated successfully!');
  };

  const downloadFacultyPerformanceReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('FACULTY PERFORMANCE REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Institute Overview:', 15, y);
    y += 10;
    doc.text(`Total Faculty: ${reportData.totalFaculty}`, 20, y);
    y += 10;
    
    doc.text('Department-wise Faculty Distribution:', 15, y);
    y += 10;
    
    reportData.departmentStats.forEach((dept, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${dept.department}: ${dept.faculty} faculty members`, 20, y);
      y += 10;
    });
    
    doc.save(`faculty_performance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Faculty performance report generated successfully!');
  };

  const downloadFinancialReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('FINANCIAL REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Fee Collection Overview:', 15, y);
    y += 10;
    doc.text(`Total Students: ${reportData.totalStudents}`, 20, y);
    y += 5;
    doc.text(`Pending Fees: ${reportData.pendingFees}`, 20, y);
    y += 5;
    doc.text(`Collection Rate: ${reportData.institutePerformance.fees}%`, 20, y);
    y += 10;
    
    doc.text('Department-wise Fee Status:', 15, y);
    y += 10;
    
    reportData.departmentStats.forEach((dept, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${dept.department}: ${dept.students} students`, 20, y);
      y += 10;
    });
    
    doc.save(`financial_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Financial report generated successfully!');
  };

  const downloadAttendanceReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('ATTENDANCE REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Institute Overview:', 15, y);
    y += 10;
    doc.text(`Average Attendance: ${reportData.averageAttendance}%`, 20, y);
    y += 10;
    
    doc.text('Department-wise Attendance:', 15, y);
    y += 10;
    
    reportData.departmentStats.forEach((dept, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${dept.department}: ${dept.attendance}%`, 20, y);
      y += 10;
    });
    
    doc.save(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Attendance report generated successfully!');
  };

  const downloadAchievementReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('ACHIEVEMENT REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Institute Overview:', 15, y);
    y += 10;
    doc.text(`Achievement Rate: ${reportData.institutePerformance.achievements}%`, 20, y);
    y += 10;
    
    doc.text('This report shows student achievements across all departments.', 15, y);
    y += 10;
    doc.text('Achievement data is collected from various sources including:', 15, y);
    y += 5;
    doc.text('• Academic competitions', 20, y);
    y += 5;
    doc.text('• Sports events', 20, y);
    y += 5;
    doc.text('• Cultural activities', 20, y);
    y += 5;
    doc.text('• Technical projects', 20, y);
    
    doc.save(`achievement_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Achievement report generated successfully!');
  };

  const downloadDepartmentSummary = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('DEPARTMENT SUMMARY REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Department-wise Summary:', 15, y);
    y += 10;
    
    reportData.departmentStats.forEach((dept, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${dept.department}:`, 20, y);
      y += 5;
      doc.text(`  Students: ${dept.students}`, 25, y);
      y += 5;
      doc.text(`  Faculty: ${dept.faculty}`, 25, y);
      y += 5;
      doc.text(`  Attendance: ${dept.attendance}%`, 25, y);
      y += 5;
      doc.text(`  Marks: ${dept.marks}%`, 25, y);
      y += 10;
    });
    
    doc.save(`department_summary_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Department summary report generated successfully!');
  };

  const downloadAcademicReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('ACADEMIC PERFORMANCE REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Institute Overview:', 15, y);
    y += 10;
    doc.text(`Average Marks: ${reportData.averageMarks}%`, 20, y);
    y += 10;
    
    doc.text('Department-wise Academic Performance:', 15, y);
    y += 10;
    
    reportData.departmentStats.forEach((dept, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${dept.department}: ${dept.marks}%`, 20, y);
      y += 10;
    });
    
    doc.save(`academic_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Academic report generated successfully!');
  };

  const exportToExcel = () => {
    // Mock Excel export
    toast.success('Excel export feature coming soon');
  };

  const exportToCSV = () => {
    const csvContent = [
      'Department,Students,Faculty,Attendance,Marks',
      ...reportData.departmentStats.map(dept => 
        `${dept.department},${dept.students},${dept.faculty},${dept.attendance},${dept.marks}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `principal_reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported to CSV successfully!');
  };

  const exportToPDF = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('PRINCIPAL REPORTS SUMMARY', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    doc.text('Institute Overview:', 15, y);
    y += 10;
    doc.text(`Total Students: ${reportData.totalStudents}`, 20, y);
    y += 5;
    doc.text(`Total Faculty: ${reportData.totalFaculty}`, 20, y);
    y += 5;
    doc.text(`Average Attendance: ${reportData.averageAttendance}%`, 20, y);
    y += 5;
    doc.text(`Average Marks: ${reportData.averageMarks}%`, 20, y);
    y += 5;
    doc.text(`Pending Fees: ${reportData.pendingFees}`, 20, y);
    
    doc.save(`principal_reports_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF report generated successfully!');
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
            <h1 className="text-2xl font-bold text-gray-900">Principal Reports Dashboard</h1>
            <p className="text-gray-600">Comprehensive reports across all departments</p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">Institute Reports</span>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalFaculty}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.averageAttendance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Marks</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.averageMarks}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Institute Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Institute Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Academic</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(reportData.institutePerformance.academic)}`}>
                  {reportData.institutePerformance.academic}%
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getPerformanceBgColor(reportData.institutePerformance.academic)}`}>
                <BookOpen className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(reportData.institutePerformance.attendance)}`}>
                  {reportData.institutePerformance.attendance}%
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getPerformanceBgColor(reportData.institutePerformance.attendance)}`}>
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fee Collection</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(reportData.institutePerformance.fees)}`}>
                  {reportData.institutePerformance.fees}%
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getPerformanceBgColor(reportData.institutePerformance.fees)}`}>
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(reportData.institutePerformance.achievements)}`}>
                  {reportData.institutePerformance.achievements}%
                </p>
              </div>
              <div className={`p-2 rounded-lg ${getPerformanceBgColor(reportData.institutePerformance.achievements)}`}>
                <Award className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.departmentStats.map((dept, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.students}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.faculty}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPerformanceColor(dept.attendance)}`}>
                      {dept.attendance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPerformanceColor(dept.marks)}`}>
                      {dept.marks}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={downloadStudentPerformanceReport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Student Performance</span>
          </button>
          
          <button
            onClick={downloadFacultyPerformanceReport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-green-600" />
            <span className="font-medium">Faculty Performance</span>
          </button>
          
          <button
            onClick={downloadFinancialReport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Financial Report</span>
          </button>
          
          <button
            onClick={downloadAttendanceReport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Attendance Report</span>
          </button>
          
          <button
            onClick={downloadAchievementReport}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Award className="h-5 w-5 text-red-600" />
            <span className="font-medium">Achievement Report</span>
          </button>
          
          <button
            onClick={downloadDepartmentSummary}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Department Summary</span>
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrincipalReports; 