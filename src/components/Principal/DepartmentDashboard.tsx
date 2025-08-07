import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  BookOpen, 
  Award, 
  BarChart3,
  ArrowLeft,
  Building,
  Calendar,
  TrendingUp,
  Eye,
  Download,
  Search,
  Filter,
  X,
  DollarSign,
  CreditCard,
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AttendanceData {
  id: string;
  name: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  isDefaulter: boolean;
}

interface AttendanceStats {
  totalStudents: number;
  averageAttendance: number;
  totalDefaulters: number;
  excellentAttendance: number;
  goodAttendance: number;
  poorAttendance: number;
  attendanceDistribution: {
    excellent: number;
    good: number;
    poor: number;
  };
}

interface DepartmentData {
  students: any[];
  faculty: any[];
  achievements: any[];
  attendance: {
    data: AttendanceData[];
    stats: AttendanceStats;
  };
  fees: {
    totalStudents: number;
    totalFeesAmount: number;
    totalPaidAmount: number;
    totalDueAmount: number;
    paidStudents: number;
    pendingStudents: number;
    overdueStudents: number;
    partialStudents: number;
    paymentRate: number;
    departmentFees: {
      [key: string]: {
        totalFees: number;
        paidAmount: number;
        dueAmount: number;
        paidStudents: number;
        pendingStudents: number;
        overdueStudents: number;
        partialStudents: number;
      };
    };
  };
  stats: {
    totalStudents: number;
    totalFaculty: number;
    averageAttendance: number;
    averageMarks: number;
    pendingFees: number;
    achievements: number;
  };
}

interface DepartmentDashboardProps {
  department: string;
  onBackToDepartments: () => void;
}

const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  department,
  onBackToDepartments
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [departmentData, setDepartmentData] = useState<DepartmentData>({
    students: [],
    faculty: [],
    achievements: [],
    attendance: {
      data: [],
      stats: {
        totalStudents: 0,
        averageAttendance: 0,
        totalDefaulters: 0,
        excellentAttendance: 0,
        goodAttendance: 0,
        poorAttendance: 0,
        attendanceDistribution: {
          excellent: 0,
          good: 0,
          poor: 0
        }
      }
    },
    fees: {
      totalStudents: 0,
      totalFeesAmount: 0,
      totalPaidAmount: 0,
      totalDueAmount: 0,
      paidStudents: 0,
      pendingStudents: 0,
      overdueStudents: 0,
      partialStudents: 0,
      paymentRate: 0,
      departmentFees: {}
    },
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      averageAttendance: 0,
      averageMarks: 0,
      pendingFees: 0,
      achievements: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [selectedStudentFees, setSelectedStudentFees] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState<'all' | 'defaulters' | 'excellent' | 'good' | 'poor'>('all');

  useEffect(() => {
    fetchDepartmentData();
  }, [department]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      
      // Department mapping to handle different naming conventions
      const departmentMapping: { [key: string]: string[] } = {
        'cse': ['cse', 'CSE', 'Computer Science and Engineering'],
        'ai-ds': ['ai-ds', 'AI and DS', 'Artificial Intelligence and Data Science', 'ai-ds', 'AIDS'],
        'electronics-communication': ['electronics-communication', 'Electronics and Communication', 'EC'],
        'ece': ['ece', 'ECE', 'Electronics and Communication Engineering'],
        'mechanical': ['mechanical', 'Mechanical', 'Mechanical Engineering'],
        'electronics-vlsi': ['electronics-vlsi', 'Electronics Engg (VLSI)', 'Electronics Engineering (VLSI)', 'VLSI'],
        'electrical': ['electrical', 'Electrical', 'Electrical Engineering'],
        'civil': ['civil', 'Civil', 'Civil Engineering']
      };

      // Get the possible department names for the selected department
      const possibleDepartmentNames = departmentMapping[department] || [department];
      
      console.log(`🔍 DepartmentDashboard: Looking for department: ${department}`);
      console.log(`🔍 DepartmentDashboard: Possible names:`, possibleDepartmentNames);
      
      // Fetch all users and filter by department
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const students: any[] = [];
        const faculty: any[] = [];
        let totalAttendance = 0;
        let totalMarks = 0;
        let pendingFees = 0;
        let studentCount = 0;
        let facultyCount = 0;

        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          // Check if user's department matches any of the possible names
          const userDepartment = userData.department;
          const isInDepartment = possibleDepartmentNames.some(name => 
            userDepartment && userDepartment.toLowerCase() === name.toLowerCase()
          );
          
          if (isInDepartment) {
            console.log(`✅ DepartmentDashboard: Found user in ${department}:`, userData.name, 'Department:', userDepartment);
            
            if (userData.role === 'student') {
              students.push({
                id: userSnapshot.key,
                ...userData
              });
              totalAttendance += userData.attendance || 0;
              totalMarks += userData.averageMarks || 0;
              if (userData.feeStatus === 'pending' || userData.feeStatus === 'overdue') {
                pendingFees++;
              }
              studentCount++;
            } else if (userData.role === 'teacher') {
              faculty.push({
                id: userSnapshot.key,
                ...userData
              });
              facultyCount++;
            }
          }
        });

        // Fetch fees data for this department
        const feesData = await fetchFeesData(students, possibleDepartmentNames);

        // Fetch achievements for this department by matching student's department
        const achievementsRef = ref(database, 'achievements');
        const achievementsSnapshot = await get(achievementsRef);
        const achievements: any[] = [];

        console.log(`🔍 DepartmentDashboard: Fetching achievements for department: ${department}`);
        console.log(`🔍 DepartmentDashboard: Found ${students.length} students in this department`);
        console.log(`🔍 DepartmentDashboard: Student IDs:`, students.map(s => ({ id: s.id, name: s.name, dept: s.department })));

        if (achievementsSnapshot.exists()) {
          console.log(`🔍 DepartmentDashboard: Found ${achievementsSnapshot.size} total achievements in database`);
          
          achievementsSnapshot.forEach((achievementSnapshot) => {
            const achievementData = achievementSnapshot.val();
            console.log(`🔍 DepartmentDashboard: Achievement ID:`, achievementSnapshot.key);
            console.log(`🔍 DepartmentDashboard: Full achievement data:`, achievementData);
            console.log(`🔍 DepartmentDashboard: Checking achievement:`, achievementData?.title, 'Student ID:', achievementData?.studentId);
              
            // First, try to match by achievement's department field (for new achievements)
            if (achievementData.department) {
              const achievementDepartment = achievementData.department;
              const isAchievementInDepartment = possibleDepartmentNames.some(name => 
                achievementDepartment && achievementDepartment.toLowerCase() === name.toLowerCase()
              );
              
              if (isAchievementInDepartment) {
                console.log(`✅ DepartmentDashboard: Found achievement via direct department match:`, achievementData.title, 'Department:', achievementDepartment);
                achievements.push({
                  id: achievementSnapshot.key,
                  ...achievementData
                });
                return; // Skip student lookup since we found it via department
              }
            }
            
            // Fallback: Find the student who created this achievement (for old achievements)
            const studentId = achievementData.studentId;
            console.log(`🔍 DepartmentDashboard: Looking for student with ID:`, studentId);
            console.log(`🔍 DepartmentDashboard: Available student IDs:`, students.map(s => s.id));
            const student = students.find(s => s.id === studentId);
            
            if (student) {
              console.log(`✅ DepartmentDashboard: Found student for achievement:`, student.name, 'Department:', student.department);
              
              // Check if the student's department matches our department
              const studentDepartment = student.department;
              const isStudentInDepartment = possibleDepartmentNames.some(name => 
                studentDepartment && studentDepartment.toLowerCase() === name.toLowerCase()
              );
              
              console.log(`🔍 DepartmentDashboard: Student department "${studentDepartment}" matches department "${department}":`, isStudentInDepartment);
              
              if (isStudentInDepartment) {
                console.log(`✅ DepartmentDashboard: Found achievement in ${department}:`, achievementData.title, 'Student Department:', studentDepartment);
                achievements.push({
                  id: achievementSnapshot.key,
                  ...achievementData,
                  department: studentDepartment // Add department info to achievement
                });
              }
            } else {
              console.log(`❌ DepartmentDashboard: No student found for achievement:`, achievementData.title, 'Student ID:', studentId);
            }
          });
        } else {
          console.log(`❌ DepartmentDashboard: No achievements found in database`);
        }
        
        console.log(`📊 DepartmentDashboard: Final achievements count for ${department}:`, achievements.length);

        // Calculate attendance data
        const attendanceData: AttendanceData[] = students.map(student => {
          const attendance = student.attendance || 0;
          const totalDays = 180; // Assuming 180 working days
          const presentDays = Math.round((attendance / 100) * totalDays);
          const absentDays = totalDays - presentDays;
          const lateDays = Math.floor(absentDays * 0.1); // Assume 10% of absences are late
          const attendancePercentage = attendance;
          const isDefaulter = attendance < 75;

          return {
            id: student.id,
            name: student.name,
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            attendancePercentage,
            isDefaulter
          };
        });

        // Calculate attendance statistics
        const totalDefaulters = attendanceData.filter(student => student.isDefaulter).length;
        const excellentAttendance = attendanceData.filter(student => student.attendancePercentage >= 90).length;
        const goodAttendance = attendanceData.filter(student => student.attendancePercentage >= 75 && student.attendancePercentage < 90).length;
        const poorAttendance = attendanceData.filter(student => student.attendancePercentage < 75).length;

        const attendanceStats: AttendanceStats = {
          totalStudents: studentCount,
          averageAttendance: studentCount > 0 ? Math.round(totalAttendance / studentCount) : 0,
          totalDefaulters,
          excellentAttendance,
          goodAttendance,
          poorAttendance,
          attendanceDistribution: {
            excellent: studentCount > 0 ? Math.round((excellentAttendance / studentCount) * 100) : 0,
            good: studentCount > 0 ? Math.round((goodAttendance / studentCount) * 100) : 0,
            poor: studentCount > 0 ? Math.round((poorAttendance / studentCount) * 100) : 0
          }
        };

        setDepartmentData({
          students,
          faculty,
          achievements,
          attendance: {
            data: attendanceData,
            stats: attendanceStats
          },
          fees: feesData,
          stats: {
            totalStudents: studentCount,
            totalFaculty: facultyCount,
            averageAttendance: studentCount > 0 ? Math.round(totalAttendance / studentCount) : 0,
            averageMarks: studentCount > 0 ? Math.round(totalMarks / studentCount) : 0,
            pendingFees,
            achievements: achievements.length
          }
        });

        // Show warning if no data found
        if (studentCount === 0 && facultyCount === 0) {
          toast.error(`No data found for department: ${department}. Please check the department name in the database.`);
        }

        console.log(`📊 DepartmentDashboard: Loaded data for ${department}`);
        console.log(`👥 Students: ${studentCount}, Faculty: ${facultyCount}, Achievements: ${achievements.length}`);
        console.log(`💰 Fees Data:`, feesData);
        
        // Debug: Show all departments in database
        const allDepartments = new Set<string>();
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData.department) {
            allDepartments.add(userData.department);
          }
        });
        console.log(`🔍 DepartmentDashboard: All departments in database:`, Array.from(allDepartments));
        
        // Debug: Show all departments in achievements
        const allAchievementDepartments = new Set<string>();
        if (achievementsSnapshot.exists()) {
          achievementsSnapshot.forEach((achievementSnapshot) => {
            const achievementData = achievementSnapshot.val();
            if (achievementData.department) {
              allAchievementDepartments.add(achievementData.department);
            }
          });
        }
        console.log(`🔍 DepartmentDashboard: All departments in achievements:`, Array.from(allAchievementDepartments));
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesData = async (students: any[], possibleDepartmentNames: string[]) => {
    try {
      // Fetch fees from both 'fees' and 'finance/studentFees' paths
      const feesRef = ref(database, 'fees');
      const financeFeesRef = ref(database, 'finance/studentFees');
      
      const [feesSnapshot, financeFeesSnapshot] = await Promise.all([
        get(feesRef),
        get(financeFeesRef)
      ]);

      let totalFeesAmount = 0;
      let totalPaidAmount = 0;
      let totalDueAmount = 0;
      let paidStudents = 0;
      let pendingStudents = 0;
      let overdueStudents = 0;
      let partialStudents = 0;
      const departmentFees: { [key: string]: any } = {};

      // Process students and their fees
      students.forEach(student => {
        const studentRollNo = student.rollNo || student.rollNumber || student.studentId;
        let studentFees = null;

        // Try to get fees from 'fees' path first
        if (feesSnapshot.exists()) {
          const feeData = feesSnapshot.val();
          if (feeData[studentRollNo]) {
            studentFees = feeData[studentRollNo];
          }
        }

        // If not found, try from 'finance/studentFees' path
        if (!studentFees && financeFeesSnapshot.exists()) {
          const financeFeeData = financeFeesSnapshot.val();
          if (financeFeeData[studentRollNo]) {
            studentFees = financeFeeData[studentRollNo];
          }
        }

        if (studentFees) {
          const totalFees = studentFees.totalFees || studentFees.total || 0;
          const paidAmount = studentFees.paidAmount || 0;
          const dueAmount = studentFees.dueAmount || (totalFees - paidAmount);
          const feeStatus = studentFees.feeStatus || (dueAmount === 0 ? 'paid' : dueAmount === totalFees ? 'pending' : 'partial');

          totalFeesAmount += totalFees;
          totalPaidAmount += paidAmount;
          totalDueAmount += dueAmount;

          // Count students by fee status
          if (feeStatus === 'paid') {
            paidStudents++;
          } else if (feeStatus === 'pending') {
            pendingStudents++;
          } else if (feeStatus === 'overdue') {
            overdueStudents++;
          } else if (feeStatus === 'partial') {
            partialStudents++;
          }

          // Group by department
          const studentDept = student.department || 'Unknown';
          if (!departmentFees[studentDept]) {
            departmentFees[studentDept] = {
              totalFees: 0,
              paidAmount: 0,
              dueAmount: 0,
              paidStudents: 0,
              pendingStudents: 0,
              overdueStudents: 0,
              partialStudents: 0
            };
          }

          departmentFees[studentDept].totalFees += totalFees;
          departmentFees[studentDept].paidAmount += paidAmount;
          departmentFees[studentDept].dueAmount += dueAmount;

          if (feeStatus === 'paid') {
            departmentFees[studentDept].paidStudents++;
          } else if (feeStatus === 'pending') {
            departmentFees[studentDept].pendingStudents++;
          } else if (feeStatus === 'overdue') {
            departmentFees[studentDept].overdueStudents++;
          } else if (feeStatus === 'partial') {
            departmentFees[studentDept].partialStudents++;
          }
        } else {
          // Student has no fees record, count as pending
          pendingStudents++;
        }
      });

      const paymentRate = students.length > 0 ? (paidStudents / students.length) * 100 : 0;

      return {
        totalStudents: students.length,
        totalFeesAmount,
        totalPaidAmount,
        totalDueAmount,
        paidStudents,
        pendingStudents,
        overdueStudents,
        partialStudents,
        paymentRate: Math.round(paymentRate),
        departmentFees
      };
    } catch (error) {
      console.error('Error fetching fees data:', error);
      return {
        totalStudents: students.length,
        totalFeesAmount: 0,
        totalPaidAmount: 0,
        totalDueAmount: 0,
        paidStudents: 0,
        pendingStudents: 0,
        overdueStudents: 0,
        partialStudents: 0,
        paymentRate: 0,
        departmentFees: {}
      };
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'faculty', label: 'Faculty', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const getDepartmentName = (deptId: string) => {
    const departmentNames: { [key: string]: string } = {
      'cse': 'Computer Science and Engineering',
      'ai-ds': 'Artificial Intelligence and Data Science',
      'electronics-communication': 'Electronics and Communication',
      'ece': 'Electronics and Communication Engineering',
      'mechanical': 'Mechanical Engineering',
      'electronics-vlsi': 'Electronics Engineering (VLSI)',
      'electrical': 'Electrical Engineering',
      'civil': 'Civil Engineering'
    };
    return departmentNames[deptId] || deptId;
  };

  const handleAchievementClick = (achievement: any) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handleFeesClick = (deptFees: any) => {
    setSelectedStudentFees(deptFees);
    setShowFeesModal(true);
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    return 'Poor';
  };

  const downloadAttendanceReport = (format: 'pdf' | 'excel' | 'csv', reportType: 'all' | 'defaulters' | 'excellent' | 'good' | 'poor' = 'all') => {
    const { attendance } = departmentData;
    const { data, stats } = attendance;
    
    // Filter data based on report type
    let filteredData = data;
    let reportTitle = 'All Students';
    
    switch (reportType) {
      case 'defaulters':
        filteredData = data.filter(student => student.isDefaulter);
        reportTitle = 'Defaulters Only';
        break;
      case 'excellent':
        filteredData = data.filter(student => student.attendancePercentage >= 90);
        reportTitle = 'Excellent Attendance (≥90%)';
        break;
      case 'good':
        filteredData = data.filter(student => student.attendancePercentage >= 75 && student.attendancePercentage < 90);
        reportTitle = 'Good Attendance (75-89%)';
        break;
      case 'poor':
        filteredData = data.filter(student => student.attendancePercentage < 75);
        reportTitle = 'Poor Attendance (<75%)';
        break;
    }
    
    let content = '';
    let filename = `attendance_${reportType}_${department}_${new Date().toISOString().split('T')[0]}`;
    
         if (format === 'csv') {
       content = 'Student ID,Name,Total Days,Present Days,Absent Days,Late Days,Attendance %,Status\n';
       filteredData.forEach(student => {
         const studentName = student.name || 'Unknown';
         const status = getAttendanceLabel(student.attendancePercentage);
         // Escape commas in names and wrap in quotes if needed
         const escapedName = studentName.includes(',') ? `"${studentName}"` : studentName;
         content += `${student.id || 'N/A'},${escapedName},${student.totalDays || 0},${student.presentDays || 0},${student.absentDays || 0},${student.lateDays || 0},${student.attendancePercentage || 0}%,${status}\n`;
       });
      
      // Add BOM for better Excel compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
         } else if (format === 'excel') {
       // Create Excel-compatible CSV with proper formatting
       content = 'Student ID,Name,Total Days,Present Days,Absent Days,Late Days,Attendance %,Status\n';
       filteredData.forEach(student => {
         const studentName = student.name || 'Unknown';
         const status = getAttendanceLabel(student.attendancePercentage);
         // Escape commas in names and wrap in quotes if needed
         const escapedName = studentName.includes(',') ? `"${studentName}"` : studentName;
         content += `${student.id || 'N/A'},${escapedName},${student.totalDays || 0},${student.presentDays || 0},${student.absentDays || 0},${student.lateDays || 0},${student.attendancePercentage || 0}%,${status}\n`;
       });
      
      // Add BOM for better Excel compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Create a properly formatted text file that can be converted to PDF
      content = `ATTENDANCE REPORT - ${department.toUpperCase()}\n`;
      content += `==========================================\n\n`;
      content += `Report Type: ${reportTitle}\n`;
      content += `Generated on: ${new Date().toLocaleDateString()}\n`;
      content += `Generated at: ${new Date().toLocaleTimeString()}\n\n`;
      
      content += `SUMMARY STATISTICS:\n`;
      content += `==================\n`;
      content += `Total Students: ${stats.totalStudents}\n`;
      content += `Average Attendance: ${stats.averageAttendance}%\n`;
      content += `Defaulters: ${stats.totalDefaulters}\n`;
      content += `Excellent Attendance: ${stats.excellentAttendance}\n`;
      content += `Good Attendance: ${stats.goodAttendance}\n`;
      content += `Poor Attendance: ${stats.poorAttendance}\n\n`;
      
      content += `FILTERED DATA (${reportTitle}):\n`;
      content += `============================\n`;
      content += `Records in this report: ${filteredData.length}\n\n`;
      
      if (filteredData.length > 0) {
               content += `DETAILED STUDENT RECORDS:\n`;
       content += `========================\n`;
       content += `ID\t\tName\t\t\t\tAttendance %\tStatus\t\tPresent\tAbsent\tLate\n`;
       content += `--\t\t----\t\t\t\t------------\t------\t\t-------\t------\t----\n`;
        
                 filteredData.forEach(student => {
           const status = getAttendanceLabel(student.attendancePercentage);
           const studentName = student.name || 'Unknown';
           const paddedName = studentName.length > 20 ? studentName.substring(0, 17) + '...' : studentName.padEnd(20);
           const paddedStatus = status.padEnd(10);
           content += `${student.id}\t\t${paddedName}\t${student.attendancePercentage}%\t\t${paddedStatus}\t${student.presentDays}\t${student.absentDays}\t${student.lateDays}\n`;
         });
      } else {
        content += `No students found matching the selected criteria.\n`;
      }
      
      content += `\n\nREPORT END\n`;
      content += `==========\n`;
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    
    toast.success(`${reportTitle} report downloaded as ${format.toUpperCase()}`);
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
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToDepartments}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Departments</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getDepartmentName(department)}</h1>
              <p className="text-gray-600">Department Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">{department.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b rounded-lg">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{departmentData.stats.totalStudents}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{departmentData.stats.totalFaculty}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{departmentData.stats.averageAttendance}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-orange-500">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Achievements</p>
                    <p className="text-2xl font-bold text-gray-900">{departmentData.stats.achievements}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fees Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-emerald-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Fees</p>
                    <p className="text-2xl font-bold text-gray-900">₹{departmentData.fees.totalFeesAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-500">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{departmentData.fees.totalPaidAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-red-500">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Due Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{departmentData.fees.totalDueAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Payment Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{departmentData.fees.paymentRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fees Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fees Status Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{departmentData.fees.paidStudents}</div>
                  <div className="text-sm text-green-600">Fully Paid</div>
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mt-2" />
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{departmentData.fees.partialStudents}</div>
                  <div className="text-sm text-blue-600">Partially Paid</div>
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mt-2" />
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{departmentData.fees.pendingStudents}</div>
                  <div className="text-sm text-yellow-600">Pending</div>
                  <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mt-2" />
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{departmentData.fees.overdueStudents}</div>
                  <div className="text-sm text-red-600">Overdue</div>
                  <X className="h-6 w-6 text-red-600 mx-auto mt-2" />
                </div>
              </div>
            </div>

            {/* Attendance Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Status Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{departmentData.attendance.stats.excellentAttendance}</div>
                  <div className="text-sm text-green-600">Excellent (≥90%)</div>
                  <Award className="h-6 w-6 text-green-600 mx-auto mt-2" />
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{departmentData.attendance.stats.goodAttendance}</div>
                  <div className="text-sm text-yellow-600">Good (75-89%)</div>
                  <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mt-2" />
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{departmentData.attendance.stats.poorAttendance}</div>
                  <div className="text-sm text-red-600">Poor (&lt;75%)</div>
                  <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mt-2" />
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{departmentData.attendance.stats.totalDefaulters}</div>
                  <div className="text-sm text-orange-600">Defaulters</div>
                  <X className="h-6 w-6 text-orange-600 mx-auto mt-2" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">View Students</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Manage Faculty</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">View Achievements</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Generate Reports</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New student registration</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Achievement approved</span>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Faculty meeting scheduled</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Students ({departmentData.students.length})</h3>
            </div>
            <div className="p-6">
              {departmentData.students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students found in this department</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departmentData.students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.rollNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.course}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-green-600">{student.attendance || 0}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-blue-600 hover:text-blue-900">
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
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Faculty ({departmentData.faculty.length})</h3>
            </div>
            <div className="p-6">
              {departmentData.faculty.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No faculty found in this department</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {departmentData.faculty.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.designation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.experience || 0} years</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-blue-600 hover:text-blue-900">
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
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Achievements ({departmentData.achievements.length})</h3>
            </div>
            <div className="p-6">

              {!departmentData.achievements || departmentData.achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No achievements found in this department</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentData.achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          achievement.status === 'approved' ? 'bg-green-100 text-green-800' :
                          achievement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {achievement.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.studentName}</p>
                      <p className="text-xs text-gray-500">{achievement.category} • {achievement.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fees Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-lg font-semibold text-blue-900">Total Fees</h4>
                </div>
                <p className="text-3xl font-bold text-blue-700">₹{departmentData.fees.totalFeesAmount.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Total collected fees</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="text-lg font-semibold text-green-900">Paid Fees</h4>
                </div>
                <p className="text-3xl font-bold text-green-700">₹{departmentData.fees.totalPaidAmount.toLocaleString()}</p>
                <p className="text-sm text-green-600">Fees already paid</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center mb-2">
                  <Receipt className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="text-lg font-semibold text-red-900">Due Fees</h4>
                </div>
                <p className="text-3xl font-bold text-red-700">₹{departmentData.fees.totalDueAmount.toLocaleString()}</p>
                <p className="text-sm text-red-600">Fees yet to be paid</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <h4 className="text-lg font-semibold text-yellow-900">Payment Rate</h4>
                </div>
                <p className="text-3xl font-bold text-yellow-700">{departmentData.fees.paymentRate}%</p>
                <p className="text-sm text-yellow-600">Percentage of students who have paid</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Fees</h3>
              {Object.keys(departmentData.fees.departmentFees).length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No fees data available for this department.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fees</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                                               {Object.entries(departmentData.fees.departmentFees).map(([deptName, deptFees]: [string, any]) => (
                           <tr key={deptName} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deptName}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{deptFees.totalFees.toLocaleString()}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{deptFees.paidAmount.toLocaleString()}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{deptFees.dueAmount.toLocaleString()}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                               <button onClick={() => handleFeesClick(deptFees)}>
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
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Attendance Analytics</h3>
              <div className="flex items-center space-x-4">
                {/* Report Type Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Report Type:</label>
                  <select 
                    value={selectedReportType}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSelectedReportType(e.target.value as 'all' | 'defaulters' | 'excellent' | 'good' | 'poor')}
                  >
                    <option value="all">All Students</option>
                    <option value="defaulters">Defaulters Only</option>
                    <option value="excellent">Excellent (90%+)</option>
                    <option value="good">Good (75-89%)</option>
                    <option value="poor">Poor (under 75%)</option>
                  </select>
                </div>
                
                {/* Download Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => downloadAttendanceReport('pdf', selectedReportType)}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                  <button 
                    onClick={() => downloadAttendanceReport('excel', selectedReportType)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Excel</span>
                  </button>
                  <button 
                    onClick={() => downloadAttendanceReport('csv', selectedReportType)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{departmentData.attendance.stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                    <p className="text-2xl font-bold text-green-600">{departmentData.attendance.stats.averageAttendance}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-red-500">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Defaulters</p>
                    <p className="text-2xl font-bold text-red-600">{departmentData.attendance.stats.totalDefaulters}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-500">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Excellent</p>
                    <p className="text-2xl font-bold text-purple-600">{departmentData.attendance.stats.excellentAttendance}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Distribution */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Attendance Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{departmentData.attendance.stats.excellentAttendance}</div>
                  <div className="text-sm text-green-600">Excellent (≥90%)</div>
                  <div className="text-xs text-green-500">{departmentData.attendance.stats.attendanceDistribution.excellent}%</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{departmentData.attendance.stats.goodAttendance}</div>
                  <div className="text-sm text-yellow-600">Good (75-89%)</div>
                  <div className="text-xs text-yellow-500">{departmentData.attendance.stats.attendanceDistribution.good}%</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{departmentData.attendance.stats.poorAttendance}</div>
                  <div className="text-sm text-red-600">Poor (&lt;75%)</div>
                  <div className="text-xs text-red-500">{departmentData.attendance.stats.attendanceDistribution.poor}%</div>
                </div>
              </div>
            </div>

            {/* Detailed Attendance Table */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Student Attendance Details</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departmentData.attendance.data.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.totalDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{student.presentDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{student.absentDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{student.lateDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${getAttendanceColor(student.attendancePercentage)}`}>
                            {student.attendancePercentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                            student.attendancePercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getAttendanceLabel(student.attendancePercentage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Department Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Student Report</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-green-600" />
                <span className="font-medium">Faculty Report</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Achievement Report</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Performance Report</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-red-600" />
                <span className="font-medium">Attendance Report</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">Summary Report</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Details Modal */}
      {showAchievementModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Achievement Details</h2>
              <button
                onClick={() => setShowAchievementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedAchievement.title}</h3>
                <p className="text-sm text-gray-600">{selectedAchievement.studentName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{selectedAchievement.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-sm text-gray-900">{selectedAchievement.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-sm text-gray-900">{selectedAchievement.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAchievement.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedAchievement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedAchievement.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-sm text-gray-900">{selectedAchievement.date}</p>
                </div>
              </div>
              
              {selectedAchievement.photoUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>
                  <img 
                    src={selectedAchievement.photoUrl} 
                    alt="Achievement" 
                    className="w-full max-w-md rounded-lg"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', selectedAchievement.photoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', selectedAchievement.photoUrl);
                    }}
                  />
                </div>
              )}
              {!selectedAchievement.photoUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>
                  <p className="text-sm text-gray-500">No photo uploaded for this achievement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fees Details Modal */}
      {showFeesModal && selectedStudentFees && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Fees Details for {selectedStudentFees.studentName}</h2>
              <button
                onClick={() => setShowFeesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Roll No: {selectedStudentFees.rollNo}</h3>
                <p className="text-sm text-gray-600">Student ID: {selectedStudentFees.id}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Total Fees Due</p>
                <p className="text-2xl font-bold text-red-700">₹{selectedStudentFees.dueAmount.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-700">₹{selectedStudentFees.paidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Fees</p>
                  <p className="text-2xl font-bold text-blue-700">₹{selectedStudentFees.totalFees.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fee Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedStudentFees.feeStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedStudentFees.feeStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudentFees.feeStatus}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Payment Date</p>
                  <p className="text-sm text-gray-900">{selectedStudentFees.lastPaymentDate || 'N/A'}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
                {selectedStudentFees.paymentHistory && selectedStudentFees.paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                                                 {selectedStudentFees.paymentHistory.map((payment: any, index: number) => (
                           <tr key={index} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{payment.amount.toLocaleString()}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{payment.method}</td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                 payment.status === 'success' ? 'bg-green-100 text-green-800' :
                                 payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-red-100 text-red-800'
                               }`}>
                                 {payment.status}
                               </span>
                             </td>
                           </tr>
                         ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No payment history available for this student.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDashboard; 