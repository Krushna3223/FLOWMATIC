import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase/config';
import { ref, get, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Activity,
  Eye,
  Check,
  X,
  Download,
  User,
  BarChart3,
  FileCheck,
  GraduationCap,
  Calendar,
  Plus,
  AlertTriangle,
  Award,
  BookOpen,
  Building,
  DollarSign,
  CreditCard,
  Receipt
} from 'lucide-react';
import ViewAchievements from '../components/Admin/ViewAchievements';
import { debugAndFixAllAchievements, testNewAchievementSubmission } from '../utils/testAchievements';

interface CertificateRequest {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  type: string;
  purpose: string;
  status: string;
  academicYear: string;
  branch: string;
  course: string;
  rollNo: string;
  year: string;
  dob: string;
  refNo: string;
  createdAt: number;
  adminComment?: string;
  principalComment?: string;
}

interface Student {
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  year: string;
  department?: string;
  email: string;
  phone?: string;
}

interface FeesData {
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
}

const PrincipalDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [feesData, setFeesData] = useState<FeesData>({
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
  });
  
  // Quick Actions state
  const [showPendingApprovalsModal, setShowPendingApprovalsModal] = useState(false);
  const [showStudentRecordsModal, setShowStudentRecordsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showViewStudentRecords, setShowViewStudentRecords] = useState(false);
  const [showViewPendingApprovals, setShowViewPendingApprovals] = useState(false);
  const [showGenerateReports, setShowGenerateReports] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [studentFees, setStudentFees] = useState<any>(null);

  // Fetch certificate requests and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch certificate requests
        const requestsRef = ref(database, 'documentRequests');
        const snapshot = await get(requestsRef);

        if (snapshot.exists()) {
          const requests: CertificateRequest[] = [];
          
          snapshot.forEach((userSnapshot) => {
            userSnapshot.forEach((requestSnapshot) => {
              const request = {
                id: requestSnapshot.key!,
                userId: userSnapshot.key!,
                ...requestSnapshot.val()
              };
              requests.push(request);
            });
          });
          
          // Only show requests forwarded by registrar
          const principalRequests = requests.filter(req => req.status === 'forwarded_to_principal');
          setCertificateRequests(principalRequests);
          
          // Calculate today's approvals and rejections
          const today = new Date().toDateString();
          const todayApproved = requests.filter(req => 
            (req.status === 'approved' || req.status === 'approved_by_principal') && 
            new Date(req.createdAt).toDateString() === today
          ).length;
          const todayRejected = requests.filter(req => 
            (req.status === 'rejected' || req.status === 'rejected_by_principal') && 
            new Date(req.createdAt).toDateString() === today
          ).length;
          
          setApprovedToday(todayApproved);
          setRejectedToday(todayRejected);
        } else {
          setCertificateRequests([]);
          setApprovedToday(0);
          setRejectedToday(0);
        }

        // Fetch total students and fees data from users database
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          let studentCount = 0;
          const allStudents: any[] = [];
          
          usersSnapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            // Only count users with role 'student'
            if (userData && userData.role === 'student') {
              studentCount++;
              allStudents.push({
                id: userSnapshot.key,
                ...userData
              });
            }
          });
          
          setTotalStudents(studentCount);
          setStudents(allStudents);
          console.log('👥 PrincipalDashboard: Total students found:', studentCount);

          // Fetch fees data
          const feesDataResult = await fetchFeesData(allStudents);
          setFeesData(feesDataResult);
        } else {
          setTotalStudents(0);
          setStudents([]);
          setFeesData({
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
          });
        }

        // Fetch achievements data
        const achievementsRef = ref(database, 'achievements');
        const achievementsSnapshot = await get(achievementsRef);
        
        if (achievementsSnapshot.exists()) {
          const achievementsData: any[] = [];
          achievementsSnapshot.forEach((achievementSnapshot) => {
            const achievementData = achievementSnapshot.val();
            achievementsData.push({
              id: achievementSnapshot.key!,
              ...achievementData
            });
          });
          setAchievements(achievementsData);
          console.log('🏆 PrincipalDashboard: Achievements found:', achievementsData.length);
        } else {
          setAchievements([]);
          console.log('🏆 PrincipalDashboard: No achievements found');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        
        // Check if it's a permission error
        if (error.message && error.message.includes('Permission denied')) {
          toast.error('Permission denied. Please check your access rights.');
        } else {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchFeesData = async (students: any[]): Promise<FeesData> => {
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

  // Handle approve/reject
  const handleRequestAction = async (requestId: string, userId: string, action: 'approve' | 'reject', comment: string = '') => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${requestId}`);
      const newStatus = action === 'approve' ? 'approved_by_principal' : 'rejected_by_principal';
      await update(requestRef, {
        status: newStatus,
        principalComment: comment,
        updatedAt: new Date().toISOString()
      });
      setCertificateRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  // Quick Actions Functions
  const handleReviewPendingApprovals = () => {
    setShowPendingApprovalsModal(true);
  };

  const handleViewStudentRecords = async () => {
    try {
      setLoading(true);
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const studentList: Student[] = [];
        snapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData && userData.role === 'student') {
            studentList.push({
              studentId: userSnapshot.key!,
              studentName: userData.name || userData.studentName || 'Unknown',
              rollNumber: userData.rollNo || 'N/A',
              course: userData.course || 'N/A',
              year: userData.year || 'N/A',
              department: userData.department || 'N/A',
              email: userData.email || 'N/A',
              phone: userData.phone || 'N/A'
            });
          }
        });
        setStudents(studentList);
        setShowStudentRecordsModal(true);
      } else {
        setStudents([]);
        setShowStudentRecordsModal(true);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student records');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReports = () => {
    setShowReportsModal(true);
  };

  const handleViewStudentDetails = async (student: Student) => {
    try {
      console.log('🔍 PrincipalDashboard: Loading details for student:', student);
      setSelectedStudent(student);
      
      // Initialize empty arrays/objects
      setStudentAttendance([]);
      setStudentMarks([]);
      setStudentFees(null);
      
      // Fetch student attendance
      try {
        console.log('📅 PrincipalDashboard: Fetching attendance for roll number:', student.rollNumber);
        const attendanceRef = ref(database, 'attendance');
        const attendanceSnapshot = await get(attendanceRef);
        const attendanceData: any[] = [];
        
        if (attendanceSnapshot.exists()) {
          console.log('📅 PrincipalDashboard: Attendance data found:', attendanceSnapshot.val());
          attendanceSnapshot.forEach((dateSnapshot) => {
            const dateData = dateSnapshot.val();
            console.log(`📅 PrincipalDashboard: Checking date ${dateSnapshot.key}:`, dateData);
            if (dateData && dateData[student.rollNumber]) {
              attendanceData.push({
                date: dateSnapshot.key,
                ...dateData[student.rollNumber]
              });
            }
          });
          console.log('📅 PrincipalDashboard: Processed attendance data:', attendanceData);
        } else {
          console.log('📅 PrincipalDashboard: No attendance data found');
        }
        setStudentAttendance(attendanceData);
      } catch (attendanceError) {
        console.error('❌ PrincipalDashboard: Error fetching attendance:', attendanceError);
        setStudentAttendance([]);
      }

      // Fetch student marks
      try {
        console.log('📊 PrincipalDashboard: Fetching marks for roll number:', student.rollNumber);
        const marksRef = ref(database, 'marksheets');
        const marksSnapshot = await get(marksRef);
        const marksData: any[] = [];
        
        if (marksSnapshot.exists()) {
          console.log('📊 PrincipalDashboard: Marks data found:', marksSnapshot.val());
          marksSnapshot.forEach((subjectSnapshot) => {
            const subjectData = subjectSnapshot.val();
            console.log(`📊 PrincipalDashboard: Checking subject ${subjectSnapshot.key}:`, subjectData);
            if (subjectData && subjectData[student.rollNumber]) {
              marksData.push({
                subject: subjectSnapshot.key,
                ...subjectData[student.rollNumber]
              });
            }
          });
          console.log('📊 PrincipalDashboard: Processed marks data:', marksData);
        } else {
          console.log('📊 PrincipalDashboard: No marks data found');
        }
        setStudentMarks(marksData);
      } catch (marksError) {
        console.error('❌ PrincipalDashboard: Error fetching marks:', marksError);
        setStudentMarks([]);
      }

      // Fetch student fees
      try {
        console.log('💰 PrincipalDashboard: Fetching fees for roll number:', student.rollNumber);
        const feesRef = ref(database, `fees/${student.rollNumber}`);
        const feesSnapshot = await get(feesRef);
        if (feesSnapshot.exists()) {
          const feesData = feesSnapshot.val();
          console.log('💰 PrincipalDashboard: Fees data found:', feesData);
          setStudentFees(feesData);
        } else {
          console.log('💰 PrincipalDashboard: No fees data found for roll number:', student.rollNumber);
          setStudentFees(null);
        }
      } catch (feesError) {
        console.error('❌ PrincipalDashboard: Error fetching fees:', feesError);
        setStudentFees(null);
      }

      console.log('✅ PrincipalDashboard: Successfully loaded student details');
      setShowStudentDetailsModal(true);
    } catch (error: any) {
      console.error('❌ PrincipalDashboard: Error in handleViewStudentDetails:', error);
      
      // Check if it's a permission error
      if (error.message && error.message.includes('Permission denied')) {
        toast.error('Access denied. Please contact administrator for student data access.');
      } else {
        toast.error('Failed to load student details. Please try again.');
      }
      
      // Still show the modal with basic student info even if other data fails
      setShowStudentDetailsModal(true);
    }
  };

  const generateStudentReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('STUDENT RECORDS REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    students.forEach((student, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(`Student ${index + 1}: ${student.studentName}`, 15, y);
      y += 5;
      doc.text(`Roll No: ${student.rollNumber} | Course: ${student.course} | Year: ${student.year}`, 15, y);
      y += 5;
      doc.text(`Email: ${student.email}`, 15, y);
      y += 10;
    });
    
    doc.save(`student_records_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Student records report generated successfully!');
  };

  const generateCertificateReport = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('CERTIFICATE REQUESTS REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
    doc.setFontSize(10);
    
    let y = 45;
    certificateRequests.forEach((request, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(`Request ${index + 1}: ${request.studentName}`, 15, y);
      y += 5;
      doc.text(`Type: ${request.type} | Status: ${request.status}`, 15, y);
      y += 5;
      doc.text(`Purpose: ${request.purpose}`, 15, y);
      y += 5;
      doc.text(`Date: ${new Date(request.createdAt).toLocaleDateString('en-IN')}`, 15, y);
      y += 10;
    });
    
    doc.save(`certificate_requests_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Certificate requests report generated successfully!');
  };

  // Real data for dashboard statistics
  const stats = [
    {
      title: 'Pending Approvals',
      value: certificateRequests.length.toString(),
      change: certificateRequests.length > 0 ? `+${certificateRequests.length}` : '0',
      changeType: certificateRequests.length > 0 ? 'positive' : 'neutral',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Approved Today',
      value: approvedToday.toString(),
      change: approvedToday > 0 ? `+${approvedToday}` : '0',
      changeType: approvedToday > 0 ? 'positive' : 'neutral',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Rejected Today',
      value: rejectedToday.toString(),
      change: rejectedToday > 0 ? `+${rejectedToday}` : '0',
      changeType: rejectedToday > 0 ? 'negative' : 'neutral',
      icon: XCircle,
      color: 'bg-red-500'
    },
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      change: totalStudents > 0 ? `+${totalStudents}` : '0',
      changeType: totalStudents > 0 ? 'positive' : 'neutral',
      icon: Users,
      color: 'bg-blue-500'
    }
  ];

  // Fees statistics
  const feesStats = [
    {
      title: 'Total Fees',
      value: `₹${feesData.totalFeesAmount.toLocaleString()}`,
      change: feesData.totalFeesAmount > 0 ? `₹${feesData.totalFeesAmount.toLocaleString()}` : '₹0',
      changeType: feesData.totalFeesAmount > 0 ? 'positive' : 'neutral',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      title: 'Paid Amount',
      value: `₹${feesData.totalPaidAmount.toLocaleString()}`,
      change: feesData.totalPaidAmount > 0 ? `₹${feesData.totalPaidAmount.toLocaleString()}` : '₹0',
      changeType: feesData.totalPaidAmount > 0 ? 'positive' : 'neutral',
      icon: CreditCard,
      color: 'bg-green-500'
    },
    {
      title: 'Due Amount',
      value: `₹${feesData.totalDueAmount.toLocaleString()}`,
      change: feesData.totalDueAmount > 0 ? `₹${feesData.totalDueAmount.toLocaleString()}` : '₹0',
      changeType: feesData.totalDueAmount > 0 ? 'negative' : 'neutral',
      icon: Receipt,
      color: 'bg-red-500'
    },
    {
      title: 'Payment Rate',
      value: `${feesData.paymentRate}%`,
      change: feesData.paymentRate > 0 ? `${feesData.paymentRate}%` : '0%',
      changeType: feesData.paymentRate > 50 ? 'positive' : feesData.paymentRate > 25 ? 'neutral' : 'negative',
      icon: TrendingUp,
      color: 'bg-yellow-500'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Achievement summary stats
  const achievementStats = {
    total: achievements.length,
    approved: achievements.filter((a: any) => a.status === 'approved').length,
    rejected: achievements.filter((a: any) => a.status === 'rejected').length,
    byCategory: {
      academic: achievements.filter((a: any) => a.category === 'academic').length,
      sports: achievements.filter((a: any) => a.category === 'sports').length,
      cultural: achievements.filter((a: any) => a.category === 'cultural').length,
      technical: achievements.filter((a: any) => a.category === 'technical').length,
      other: achievements.filter((a: any) => a.category === 'other').length
    }
  };

  // Removed tabs - only overview will be shown

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className={`h-4 w-4 ${
                stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className={`ml-1 text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="ml-1 text-sm text-gray-500">from yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fees Statistics Cards */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fees Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feesStats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Fees Status Breakdown */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Payment Status Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{feesData.paidStudents}</div>
              <div className="text-sm text-green-600">Fully Paid</div>
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mt-2" />
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{feesData.partialStudents}</div>
              <div className="text-sm text-blue-600">Partially Paid</div>
              <Clock className="h-6 w-6 text-blue-600 mx-auto mt-2" />
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{feesData.pendingStudents}</div>
              <div className="text-sm text-yellow-600">Pending</div>
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mt-2" />
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{feesData.overdueStudents}</div>
              <div className="text-sm text-red-600">Overdue</div>
              <X className="h-6 w-6 text-red-600 mx-auto mt-2" />
            </div>
          </div>
        </div>

        {/* Department-wise Fees */}
        {Object.keys(feesData.departmentFees).length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Department-wise Fees</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(feesData.departmentFees).map(([deptName, deptFees]: [string, any]) => {
                    const deptPaymentRate = deptFees.paidStudents + deptFees.partialStudents > 0 ? 
                      Math.round(((deptFees.paidStudents + deptFees.partialStudents) / (deptFees.paidStudents + deptFees.partialStudents + deptFees.pendingStudents + deptFees.overdueStudents)) * 100) : 0;
                    return (
                      <tr key={deptName} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deptName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{deptFees.totalFees.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">₹{deptFees.paidAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{deptFees.dueAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            deptPaymentRate >= 80 ? 'bg-green-100 text-green-800' :
                            deptPaymentRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {deptPaymentRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Requests Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Certificate Requests for Final Approval</h2>
          <p className="text-sm text-gray-600 mt-1">
            {certificateRequests.length} requests waiting for your final approval
          </p>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : certificateRequests.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No certificate requests pending final approval</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {certificateRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.type}
                      </span>
                      <h3 className="text-sm font-medium text-gray-900">
                        {request.studentName}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Admin Approved
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Purpose: {request.purpose} | Course: {request.course} | Branch: {request.branch}
                    </p>
                    {request.adminComment && (
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Admin Comment:</strong> {request.adminComment}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Requested on: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRequestAction(request.id, request.userId, 'approve')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, request.userId, 'reject')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowViewStudentRecords(true)}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-medium">View Student Records</span>
          </button>
          <button 
            onClick={() => setShowViewPendingApprovals(true)}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileCheck className="h-5 w-5 text-green-600" />
            <span className="font-medium">Review Pending Approvals</span>
          </button>
          <button 
            onClick={() => setShowGenerateReports(true)}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Generate Reports</span>
          </button>
          <button 
            onClick={() => window.location.href = '/principal/departments'}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">View Department Fees</span>
          </button>
          <button 
            onClick={() => setShowAchievements(true)}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Award className="h-5 w-5 text-orange-600" />
            <span className="font-medium">View Student Achievements</span>
          </button>
          <button 
            onClick={debugAndFixAllAchievements}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium">Debug & Fix All Achievements</span>
          </button>
          <button 
            onClick={testNewAchievementSubmission}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Award className="h-5 w-5 text-green-600" />
            <span className="font-medium">Test New Achievement</span>
          </button>


        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Certificates approved</span>
            <span className="text-sm font-medium text-green-600">{approvedToday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Certificates rejected</span>
            <span className="text-sm font-medium text-red-600">{rejectedToday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending review</span>
            <span className="text-sm font-medium text-yellow-600">{certificateRequests.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total students</span>
            <span className="text-sm font-medium text-gray-900">{totalStudents}</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total fees collected</span>
              <span className="text-sm font-medium text-emerald-600">₹{feesData.totalPaidAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fees due</span>
              <span className="text-sm font-medium text-red-600">₹{feesData.totalDueAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment rate</span>
              <span className="text-sm font-medium text-blue-600">{feesData.paymentRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Modal */}
      {showPendingApprovalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Pending Certificate Approvals</h2>
              <button
                onClick={() => setShowPendingApprovalsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {certificateRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending certificate requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {certificateRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {request.type}
                          </span>
                          <h3 className="text-sm font-medium text-gray-900">
                            {request.studentName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Purpose: {request.purpose}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Course: {request.course} | Branch: {request.branch}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRequestAction(request.id, request.userId, 'approve')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, request.userId, 'reject')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Records Modal */}
      {showStudentRecordsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Student Records</h2>
              <button
                onClick={() => setShowStudentRecordsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading student records...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No student records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.studentId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewStudentDetails(student)}
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
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Student Details - {selectedStudent?.studentName}</h2>
              <button
                onClick={() => setShowStudentDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedStudent?.studentName}</p>
                  <p><span className="font-medium">Roll No:</span> {selectedStudent?.rollNumber}</p>
                  <p><span className="font-medium">Email:</span> {selectedStudent?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedStudent?.phone || 'N/A'}</p>
                  <p><span className="font-medium">Course:</span> {selectedStudent?.course}</p>
                  <p><span className="font-medium">Year:</span> {selectedStudent?.year}</p>
                  <p><span className="font-medium">Department:</span> {selectedStudent?.department}</p>
                </div>
              </div>

              {/* Fee Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Fee Information</h3>
                {studentFees ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Fees:</span> ₹{studentFees.total || studentFees.totalFees || 0}</p>
                    <p><span className="font-medium">Paid Amount:</span> ₹{studentFees.paid || studentFees.paidAmount || 0}</p>
                    <p><span className="font-medium">Due Amount:</span> ₹{studentFees.due || studentFees.dueAmount || 0}</p>
                    <p><span className="font-medium">Last Payment:</span> {studentFees.lastPaymentDate ? new Date(studentFees.lastPaymentDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No fee information available</p>
                )}
              </div>

              {/* Attendance Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Attendance</h3>
                {studentAttendance.length > 0 ? (
                  <div className="space-y-2">
                    {studentAttendance.slice(0, 5).map((attendance, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{attendance.date}</span>
                        <span className="text-green-600">{attendance.mode || 'Present'}</span>
                      </div>
                    ))}
                    {studentAttendance.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing last 5 records. Total: {studentAttendance.length} records
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No attendance records available</p>
                )}
              </div>

              {/* Marks Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Marks Information</h3>
                {studentMarks.length > 0 ? (
                  <div className="space-y-2">
                    {studentMarks.map((mark, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{mark.subject}</span>
                        <span className="text-blue-600">{mark.marks || mark.score || mark.grade || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No marks records available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Generate Reports</h2>
              <button
                onClick={() => setShowReportsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={generateStudentReport}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Student Records Report
              </button>
              
              <button
                onClick={generateCertificateReport}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Certificate Requests Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Firebase</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Available
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Admin System</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* View Achievements Modal */}
      <ViewAchievements 
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard; 