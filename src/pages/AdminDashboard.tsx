import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, update, push, set } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { createTestCertificateRequest } from '../utils/adminTools';
import { 
  Users, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Activity,
  Eye,
  Check,
  X,
  UserPlus,
  FileCheck,
  DollarSign as DollarSignIcon,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar
} from 'lucide-react';

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

interface NewStudent {
  name: string;
  email: string;
  rollNo: string;
  course: string;
  year: string;
  department: string;
  division: string;
  phone: string;
  totalFees: number;
  dueAmount: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalFeeCollections, setTotalFeeCollections] = useState(0);
  const [pendingFeeReminders, setPendingFeeReminders] = useState(0);
  const [pendingStudentUpdates, setPendingStudentUpdates] = useState(0);
  
  // Quick Actions state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showProcessRequestModal, setShowProcessRequestModal] = useState(false);
  const [showUpdateFeesModal, setShowUpdateFeesModal] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: '',
    email: '',
    rollNo: '',
    course: 'B-Tech',
    year: '1st Year',
    department: 'CSE',
    division: 'A',
    phone: '',
    totalFees: 0,
    dueAmount: 0
  });
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [selectedStudentForFees, setSelectedStudentForFees] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [feeUpdateData, setFeeUpdateData] = useState({
    totalFees: 0,
    paidAmount: 0,
    dueAmount: 0
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch certificate requests
        await fetchRequests();
        
        // Fetch total students
        await fetchTotalStudents();
        
        // Fetch fee collections
        await fetchFeeCollections();
        
        // Fetch pending tasks
        await fetchPendingTasks();
        
      } catch (error) {
        console.error('❌ AdminDashboard: Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch certificate requests
  const fetchRequests = async () => {
    try {
      console.log('🔍 AdminDashboard: Fetching certificate requests...');
      const requestsRef = ref(database, 'documentRequests');
      console.log('📍 AdminDashboard: Database path:', 'documentRequests');
      
      const snapshot = await get(requestsRef);
      console.log('📊 AdminDashboard: Raw data from Firebase:', snapshot.val());
      console.log('📊 AdminDashboard: Snapshot exists:', snapshot.exists());
      console.log('📊 AdminDashboard: Snapshot key:', snapshot.key);
      
      if (snapshot.exists()) {
        const requests: CertificateRequest[] = [];
        let count = 0;
        
        snapshot.forEach((userSnapshot) => {
          console.log(`📋 AdminDashboard: Processing user ${userSnapshot.key}:`, userSnapshot.val());
          
          // Each user has multiple requests, so we need to iterate through them
          userSnapshot.forEach((requestSnapshot) => {
            count++;
            console.log(`📋 AdminDashboard: Processing request ${count}:`, requestSnapshot.key, requestSnapshot.val());
            
            const request = {
              id: requestSnapshot.key!,
              userId: userSnapshot.key!,
              ...requestSnapshot.val()
            };
            requests.push(request);
          });
        });
        
        console.log('📋 AdminDashboard: Total requests found:', requests.length);
        console.log('📋 AdminDashboard: All requests:', requests);
        
        // Filter for pending requests (your student portal uses "pending")
        const pendingRequests = requests.filter(req => {
          console.log(`🔍 AdminDashboard: Checking request ${req.id} status:`, req.status);
          return req.status === 'pending';
        });
        
        console.log('⏳ AdminDashboard: Pending requests count:', pendingRequests.length);
        console.log('⏳ AdminDashboard: Pending requests:', pendingRequests);
        
        setCertificateRequests(pendingRequests);
      } else {
        console.log('❌ AdminDashboard: No certificate requests found in database');
        console.log('❌ AdminDashboard: Snapshot.val() is:', snapshot.val());
        setCertificateRequests([]);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching requests:', error);
      toast.error('Failed to load requests');
      setCertificateRequests([]);
    }
  };

  // Fetch total students
  const fetchTotalStudents = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        let studentCount = 0;
        snapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData && userData.role === 'student') {
            studentCount++;
          }
        });
        setTotalStudents(studentCount);
        console.log('👥 AdminDashboard: Total students found:', studentCount);
      } else {
        setTotalStudents(0);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching total students:', error);
      setTotalStudents(0);
    }
  };

  // Fetch fee collections
  const fetchFeeCollections = async () => {
    try {
      const feesRef = ref(database, 'fees');
      const snapshot = await get(feesRef);
      
      if (snapshot.exists()) {
        let totalCollections = 0;
        snapshot.forEach((feeSnapshot) => {
          const feeData = feeSnapshot.val();
          if (feeData && feeData.paid) {
            totalCollections += parseFloat(feeData.paid) || 0;
          }
        });
        setTotalFeeCollections(totalCollections);
        console.log('💰 AdminDashboard: Total fee collections:', totalCollections);
      } else {
        setTotalFeeCollections(0);
      }
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching fee collections:', error);
      setTotalFeeCollections(0);
    }
  };

  // Fetch pending tasks
  const fetchPendingTasks = async () => {
    try {
      // Count students with overdue fees (due amount > 0)
      const feesRef = ref(database, 'fees');
      const snapshot = await get(feesRef);
      
      if (snapshot.exists()) {
        let overdueCount = 0;
        snapshot.forEach((feeSnapshot) => {
          const feeData = feeSnapshot.val();
          if (feeData && feeData.due && parseFloat(feeData.due) > 0) {
            overdueCount++;
          }
        });
        setPendingFeeReminders(overdueCount);
        console.log('⏰ AdminDashboard: Pending fee reminders:', overdueCount);
      } else {
        setPendingFeeReminders(0);
      }

      // For now, set a default value for student updates
      // This could be enhanced to track actual pending updates
      setPendingStudentUpdates(3);
      
    } catch (error) {
      console.error('❌ AdminDashboard: Error fetching pending tasks:', error);
      setPendingFeeReminders(0);
      setPendingStudentUpdates(0);
    }
  };

  // Handle approve/reject
  const handleRequestAction = async (requestId: string, userId: string, action: 'approve' | 'reject', comment: string = '') => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${requestId}`);
      const newStatus = action === 'approve' ? 'approved_by_admin' : 'rejected';
      
      await update(requestRef, {
        status: newStatus,
        adminComment: comment,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setCertificateRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );

      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  // Mock data for dashboard statistics
  const stats = [
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Certificate Requests',
      value: certificateRequests.length.toString(),
      change: '+5%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Approvals',
      value: certificateRequests.length.toString(),
      change: '-8%',
      changeType: 'negative',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Fee Collections',
      value: `₹${totalFeeCollections.toLocaleString()}`,
      change: '+18%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  // Refresh all dashboard data
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      await fetchRequests();
      await fetchTotalStudents();
      await fetchFeeCollections();
      await fetchPendingTasks();
      toast.success('Dashboard refreshed successfully!');
    } catch (error) {
      console.error('❌ AdminDashboard: Error refreshing dashboard:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions Functions
  const handleAddNewStudent = () => {
    setShowAddStudentModal(true);
  };

  const handleProcessCertificateRequest = () => {
    setShowProcessRequestModal(true);
  };

  const handleManageEvents = () => {
    // Navigate to event management
    window.location.href = '/admin/events';
  };

  const handleUpdateFeeRecords = async () => {
    try {
      setLoading(true);
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const studentList: any[] = [];
        snapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData && userData.role === 'student') {
            studentList.push({
              studentId: userSnapshot.key,
              name: userData.name || userData.studentName || 'Unknown',
              rollNo: userData.rollNo || 'N/A',
              course: userData.course || 'N/A',
              year: userData.year || 'N/A',
              email: userData.email || 'N/A'
            });
          }
        });
        setStudents(studentList);
        setShowUpdateFeesModal(true);
      } else {
        setStudents([]);
        setShowUpdateFeesModal(true);
      }
    } catch (error) {
      console.error('Error fetching students for fee update:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a new user entry
      const usersRef = ref(database, 'users');
      const newUserRef = push(usersRef);
      
      const userData = {
        name: newStudent.name,
        email: newStudent.email,
        rollNo: newStudent.rollNo,
        course: newStudent.course,
        year: newStudent.year,
        department: newStudent.department,
        division: newStudent.division,
        phone: newStudent.phone,
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newUserRef, userData);

      // Create fee entry
      const feesRef = ref(database, `fees/${newStudent.rollNo}`);
      const feeData = {
        total: newStudent.totalFees,
        paid: 0,
        due: newStudent.dueAmount,
        lastPaymentDate: null
      };

      await set(feesRef, feeData);

      toast.success('Student added successfully!');
      setShowAddStudentModal(false);
      setNewStudent({
        name: '',
        email: '',
        rollNo: '',
        course: 'B-Tech',
        year: '1st Year',
        department: 'CSE',
        division: 'A',
        phone: '',
        totalFees: 0,
        dueAmount: 0
      });
      
      // Refresh dashboard data
      await refreshDashboard();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const handleFeeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForFees) return;

    try {
      const feesRef = ref(database, `fees/${selectedStudentForFees.rollNo}`);
      await update(feesRef, {
        total: feeUpdateData.totalFees,
        paid: feeUpdateData.paidAmount,
        due: feeUpdateData.dueAmount,
        lastPaymentDate: new Date().toISOString()
      });

      toast.success('Fee records updated successfully!');
      setShowUpdateFeesModal(false);
      setSelectedStudentForFees(null);
      setFeeUpdateData({ totalFees: 0, paidAmount: 0, dueAmount: 0 });
      
      // Refresh dashboard data
      await refreshDashboard();
    } catch (error) {
      console.error('Error updating fee records:', error);
      toast.error('Failed to update fee records');
    }
  };

  const handleSelectStudentForFees = async (student: any) => {
    try {
      setSelectedStudentForFees(student);
      
      // Fetch current fee data
      const feesRef = ref(database, `fees/${student.rollNo}`);
      const feesSnapshot = await get(feesRef);
      
      if (feesSnapshot.exists()) {
        const feeData = feesSnapshot.val();
        setFeeUpdateData({
          totalFees: feeData.total || feeData.totalFees || 0,
          paidAmount: feeData.paid || feeData.paidAmount || 0,
          dueAmount: feeData.due || feeData.dueAmount || 0
        });
      } else {
        setFeeUpdateData({ totalFees: 0, paidAmount: 0, dueAmount: 0 });
      }
    } catch (error) {
      console.error('Error fetching student fee data:', error);
      toast.error('Failed to load student fee data');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

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
              <span className="ml-1 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Requests Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Pending Certificate Requests</h2>
            <p className="text-sm text-gray-600 mt-1">
              {certificateRequests.length} requests waiting for your approval
            </p>
          </div>
          <button
            onClick={refreshDashboard}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            🔄 Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : certificateRequests.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending certificate requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {certificateRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {request.type}
                      </span>
                      <h3 className="text-sm font-medium text-gray-900">
                        {request.studentName}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Purpose: {request.purpose} | Course: {request.course} | Branch: {request.branch}
                    </p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleAddNewStudent}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Student
            </button>
            <button 
              onClick={handleProcessCertificateRequest}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Process Certificate Request
            </button>
            <button 
              onClick={handleUpdateFeeRecords}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center"
            >
              <DollarSignIcon className="h-4 w-4 mr-2" />
              Update Fee Records
            </button>
            <button 
              onClick={handleManageEvents}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Manage Events
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Certificate approvals</span>
              <span className="text-sm font-medium text-gray-900">{certificateRequests.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fee reminders</span>
              <span className="text-sm font-medium text-gray-900">{pendingFeeReminders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Student updates</span>
              <span className="text-sm font-medium text-gray-900">{pendingStudentUpdates}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
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
          </div>
        </div>
      </div>

      {/* Add New Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({...newStudent, rollNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter roll number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="B-Tech">B-Tech</option>
                    <option value="M-Tech">M-Tech</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={newStudent.year}
                    onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI and DS">AI and DS</option>
                    <option value="Electronics and Communication">Electronics and Communication</option>
                    <option value="ECE">ECE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electronics Engg (VLSI)">Electronics Engg (VLSI)</option>
                    <option value="Electrical Engg">Electrical Engg</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <select
                    value={newStudent.division}
                    onChange={(e) => setNewStudent({...newStudent, division: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees (₹)</label>
                  <input
                    type="number"
                    required
                    value={newStudent.totalFees}
                    onChange={(e) => setNewStudent({...newStudent, totalFees: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter total fees"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newStudent.dueAmount}
                    onChange={(e) => setNewStudent({...newStudent, dueAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter due amount"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Certificate Request Modal */}
      {showProcessRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Process Certificate Requests</h2>
              <button
                onClick={() => setShowProcessRequestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {certificateRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending certificate requests to process</p>
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

      {/* Update Fee Records Modal */}
      {showUpdateFeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Update Fee Records</h2>
              <button
                onClick={() => setShowUpdateFeesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student List */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Select Student</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <button
                        key={student.studentId}
                        onClick={() => handleSelectStudentForFees(student)}
                        className={`w-full text-left p-3 border rounded-lg transition-colors ${
                          selectedStudentForFees?.studentId === student.studentId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">Roll No: {student.rollNo}</div>
                        <div className="text-sm text-gray-600">{student.course} - {student.year}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee Update Form */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Update Fee Information</h3>
                  {selectedStudentForFees ? (
                    <form onSubmit={handleFeeUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="font-medium">{selectedStudentForFees.name}</div>
                          <div className="text-sm text-gray-600">Roll No: {selectedStudentForFees.rollNo}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees (₹)</label>
                        <input
                          type="number"
                          required
                          value={feeUpdateData.totalFees}
                          onChange={(e) => setFeeUpdateData({...feeUpdateData, totalFees: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={feeUpdateData.paidAmount}
                          onChange={(e) => setFeeUpdateData({...feeUpdateData, paidAmount: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={feeUpdateData.dueAmount}
                          onChange={(e) => setFeeUpdateData({...feeUpdateData, dueAmount: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Update Fees
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSignIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a student to update their fee records</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 