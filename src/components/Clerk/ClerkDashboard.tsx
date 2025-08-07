import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get, set, push, onValue } from 'firebase/database';
import {
  FileText,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  MapPin,
  Bell,
  Package,
  Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';
import ClerkMaintenanceManagement from './ClerkMaintenanceManagement';

interface DocumentRequest {
  id: string;
  title: string;
  type: 'certificate' | 'letter' | 'report' | 'form' | 'other';
  requestedBy: string;
  requestedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'forwarded_to_registrar' | 'forwarded_to_principal' | 'approved_by_principal' | 'rejected_by_clerk' | 'rejected_by_registrar' | 'rejected_by_principal' | 'completed' | 'rejected';
  dueDate: string;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  subject: string;
  remarks?: string;
  department?: string;
}

interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  leaveType: 'sick' | 'personal' | 'emergency' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'event' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'staff' | 'specific';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
}

const ClerkDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Set up real-time listener for document requests
    const requestsRef = ref(getDatabase(), 'documentRequests');
    const unsubscribe = onValue(requestsRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const realDocumentRequests: DocumentRequest[] = [];
        snapshot.forEach((userSnapshot: any) => {
          const userRequests = userSnapshot.val();
          Object.entries(userRequests).forEach(([requestId, requestData]: [string, any]) => {
            realDocumentRequests.push({
              id: requestId,
              title: `${requestData.type} - ${requestData.studentName}`,
              type: 'certificate',
              requestedBy: requestData.studentName,
              requestedAt: new Date(requestData.createdAt).toISOString(),
              priority: 'medium',
              status: requestData.status || 'pending',
              dueDate: new Date(requestData.createdAt + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              assignedTo: 'Clerk',
              notes: requestData.purpose || ''
            });
          });
        });
        
        console.log('🔄 ClerkDashboard: Real-time update -', realDocumentRequests.length, 'requests');
        setDocumentRequests(realDocumentRequests);
      } else {
        setDocumentRequests([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Set active tab based on current URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/documents')) {
      setActiveTab('documents');
    } else if (path.includes('/attendance')) {
      setActiveTab('attendance');
    } else if (path.includes('/leaves')) {
      setActiveTab('leaves');
    } else if (path.includes('/notices')) {
      setActiveTab('notices');
    } else if (path.includes('/maintenance')) {
      setActiveTab('maintenance');
    } else if (path.includes('/reports')) {
      setActiveTab('reports');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      console.log('🔍 ClerkDashboard: Fetching real document requests from Firebase...');
      
      // Fetch real document requests from Firebase
      const requestsRef = ref(getDatabase(), 'documentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const realDocumentRequests: DocumentRequest[] = [];
        snapshot.forEach((userSnapshot) => {
          const userRequests = userSnapshot.val();
          Object.entries(userRequests).forEach(([requestId, requestData]: [string, any]) => {
            realDocumentRequests.push({
              id: requestId,
              title: `${requestData.type} - ${requestData.studentName}`,
              type: 'certificate',
              requestedBy: requestData.studentName,
              requestedAt: new Date(requestData.createdAt).toISOString(),
              priority: 'medium',
              status: requestData.status || 'pending',
              dueDate: new Date(requestData.createdAt + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              assignedTo: 'Clerk',
              notes: requestData.purpose || ''
            });
          });
        });
        
        console.log('✅ ClerkDashboard: Fetched', realDocumentRequests.length, 'real document requests');
        setDocumentRequests(realDocumentRequests);
      } else {
        console.log('⚠️ ClerkDashboard: No document requests found in Firebase');
        setDocumentRequests([]);
      }

      // Fetch real attendance data organized by department
      console.log('🔍 ClerkDashboard: Fetching real attendance data from Firebase...');
      
      // First, fetch all students to get department information
      const usersRef = ref(getDatabase(), 'users');
      const usersSnapshot = await get(usersRef);
      
      let allAttendanceRecords: AttendanceRecord[] = [];
      
      if (usersSnapshot.exists()) {
        const studentsByDepartment: { [key: string]: any[] } = {};
        const attendanceByDepartment: { [key: string]: AttendanceRecord[] } = {};
        
        // Group students by department
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData.role === 'student' && userData.department) {
            const department = userData.department;
            if (!studentsByDepartment[department]) {
              studentsByDepartment[department] = [];
            }
            studentsByDepartment[department].push({
              uid: userSnapshot.key,
              ...userData
            });
          }
        });
        
        console.log('📊 ClerkDashboard: Students grouped by department:', studentsByDepartment);
        
        // Fetch attendance data for each department
        for (const [department, students] of Object.entries(studentsByDepartment)) {
          attendanceByDepartment[department] = [];
          
          for (const student of students) {
            try {
              // Fetch attendance for this student
              const attendanceRef = ref(getDatabase(), `attendance/${student.institutionalId || student.uid}`);
              const attendanceSnapshot = await get(attendanceRef);
              
              if (attendanceSnapshot.exists()) {
                const attendanceData = attendanceSnapshot.val();
                
                // Convert attendance data to our format
                Object.entries(attendanceData).forEach(([date, data]: [string, any]) => {
                  attendanceByDepartment[department].push({
                    id: `${student.uid}_${date}`,
                    studentId: student.institutionalId || student.uid,
                    studentName: student.name || student.fullName || 'Unknown',
                    date: date,
                    status: data.status || 'present',
                    subject: data.subject || 'General',
                    remarks: data.remarks || '',
                    department: department
                  });
                });
              }
            } catch (error) {
              console.error(`❌ ClerkDashboard: Error fetching attendance for student ${student.uid}:`, error);
            }
          }
        }
        
        console.log('📊 ClerkDashboard: Attendance data by department:', attendanceByDepartment);
        
        // Flatten all attendance records for display
        Object.values(attendanceByDepartment).forEach(records => {
          allAttendanceRecords.push(...records);
        });
      } else {
        console.log('⚠️ ClerkDashboard: No users found in Firebase');
      }

      const mockLeaveRequests: LeaveRequest[] = [
        {
          id: 'leave-1',
          studentId: 'ST001',
          studentName: 'John Doe',
          leaveType: 'sick',
          startDate: '2024-01-22',
          endDate: '2024-01-24',
          reason: 'Medical appointment',
          status: 'pending',
          requestedAt: '2024-01-20T10:00:00Z'
        }
      ];

      const mockNotices: Notice[] = [
        {
          id: 'notice-1',
          title: 'Holiday Notice - Republic Day',
          content: 'College will remain closed on 26th January 2024 for Republic Day celebration.',
          type: 'general',
          priority: 'high',
          targetAudience: 'all',
          status: 'published',
          createdAt: '2024-01-20T08:00:00Z',
          publishedAt: '2024-01-20T08:00:00Z',
          expiresAt: '2024-01-27T23:59:59Z'
        }
      ];

      setAttendanceRecords(allAttendanceRecords);
      setLeaveRequests(mockLeaveRequests);
      setNotices(mockNotices);
      setLoading(false);
    } catch (error) {
      console.error('❌ ClerkDashboard: Error fetching data:', error);
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleDocumentUpdate = async (documentId: string, status: string, notes?: string) => {
    try {
      // Find the document to get the user ID
      const document = documentRequests.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Document not found');
        return;
      }

      // Update the document status in Firebase
      const requestsRef = ref(getDatabase(), 'documentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        let userId = '';
        let requestId = '';
        
        // Find the user ID and request ID
        snapshot.forEach((userSnapshot) => {
          const userRequests = userSnapshot.val();
          Object.entries(userRequests).forEach(([reqId, requestData]: [string, any]) => {
            if (reqId === documentId) {
              userId = userSnapshot.key!;
              requestId = reqId;
            }
          });
        });

        if (userId && requestId) {
          const requestRef = ref(getDatabase(), `documentRequests/${userId}/${requestId}`);
          
          let newStatus = status;
          if (status === 'in_progress') {
            newStatus = 'forwarded_to_registrar';
          }
          
          await set(requestRef, {
            ...snapshot.val()[userId][requestId],
            status: newStatus,
            clerkComment: notes || 'Forwarded to Registrar for review',
            clerkApprovedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          toast.success('Document status updated successfully');
          
          // Refresh the data
          fetchData();
        } else {
          toast.error('Could not find document in database');
        }
      }
    } catch (error) {
      console.error('❌ Error updating document:', error);
      toast.error('Failed to update document status');
    }
  };

  const handleLeaveRequestUpdate = async (leaveId: string, status: string, approvedBy?: string) => {
    try {
      setLeaveRequests(prev => prev.map(leave => 
        leave.id === leaveId 
          ? { 
              ...leave, 
              status: status as any,
              approvedBy: approvedBy || leave.approvedBy,
              approvedAt: status === 'approved' ? new Date().toISOString() : leave.approvedAt
            }
          : leave
      ));
      toast.success('Leave request status updated successfully');
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Failed to update leave request status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'forwarded_to_registrar': return 'bg-purple-100 text-purple-800';
      case 'forwarded_to_principal': return 'bg-indigo-100 text-indigo-800';
      case 'approved_by_principal': return 'bg-green-100 text-green-800';
      case 'rejected_by_clerk': return 'bg-red-100 text-red-800';
      case 'rejected_by_registrar': return 'bg-red-100 text-red-800';
      case 'rejected_by_principal': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certificate': return 'bg-blue-100 text-blue-800';
      case 'letter': return 'bg-purple-100 text-purple-800';
      case 'report': return 'bg-indigo-100 text-indigo-800';
      case 'form': return 'bg-pink-100 text-pink-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingDocuments = documentRequests.filter(d => d.status === 'pending').length;
  const inProgressDocuments = documentRequests.filter(d => d.status === 'in_progress').length;
  const forwardedToRegistrar = documentRequests.filter(d => d.status === 'forwarded_to_registrar').length;
  const forwardedToPrincipal = documentRequests.filter(d => d.status === 'forwarded_to_principal').length;
  const approvedByPrincipal = documentRequests.filter(d => d.status === 'approved_by_principal').length;
  const completedDocuments = documentRequests.filter(d => d.status === 'completed').length;
  const rejectedDocuments = documentRequests.filter(d => d.status.includes('rejected')).length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clerk Dashboard</h1>
          <p className="text-gray-600">Manage documents, attendance, leave requests, and administrative tasks</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{inProgressDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leave Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingLeaves}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'documents', label: 'Document Processing', icon: FileText },
              { id: 'attendance', label: 'Attendance', icon: Users },
              { id: 'leaves', label: 'Leave Requests', icon: Calendar },
              { id: 'notices', label: 'Notices & Circulars', icon: Bell },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowDocumentForm(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-green-600 mr-2" />
              <p className="font-medium text-green-800">New Document Request</p>
            </button>
            <button
              onClick={() => setShowNoticeForm(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Bell className="h-6 w-6 text-blue-600 mr-2" />
              <p className="font-medium text-blue-800">Publish Notice</p>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
              <p className="font-medium text-purple-800">Generate Report</p>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              
              {/* Recent Document Requests */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Recent Document Requests</h4>
                <div className="space-y-3">
                  {documentRequests.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-600">Requested by: {doc.requestedBy}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Leave Requests */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Recent Leave Requests</h4>
                <div className="space-y-3">
                  {leaveRequests.slice(0, 2).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{leave.studentName}</p>
                        <p className="text-sm text-gray-600">{leave.leaveType} - {leave.startDate} to {leave.endDate}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Notices */}
              <div>
                <h4 className="text-md font-medium mb-3">Recent Notices</h4>
                <div className="space-y-3">
                  {notices.slice(0, 2).map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{notice.title}</p>
                        <p className="text-sm text-gray-600">{notice.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6">
              {/* Header with Stats */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Document Processing Center</h3>
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 mr-3" />
                      <div>
                        <p className="text-sm opacity-90">Pending Review</p>
                        <p className="text-2xl font-bold">{documentRequests.filter(d => d.status === 'pending').length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 mr-3" />
                      <div>
                        <p className="text-sm opacity-90">In Progress</p>
                        <p className="text-2xl font-bold">{documentRequests.filter(d => d.status === 'in_progress').length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 mr-3" />
                      <div>
                        <p className="text-sm opacity-90">Completed Today</p>
                        <p className="text-2xl font-bold">{documentRequests.filter(d => d.status === 'completed' && new Date(d.completedAt || '').toDateString() === new Date().toDateString()).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 mr-3" />
                      <div>
                        <p className="text-sm opacity-90">Total Requests</p>
                        <p className="text-2xl font-bold">{documentRequests.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by student name, document type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="forwarded_to_registrar">Forwarded to Registrar</option>
                    <option value="forwarded_to_principal">Forwarded to Principal</option>
                    <option value="approved_by_principal">Approved by Principal</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Types</option>
                    <option value="Bonafide">Bonafide Certificate</option>
                    <option value="Transfer">Transfer Certificate</option>
                    <option value="Character">Character Certificate</option>
                    <option value="Migration">Migration Certificate</option>
                    <option value="Other">Other Documents</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Document Requests List */}
              <div className="space-y-4">
                {documentRequests
                  .filter(doc => 
                    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     doc.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (filterStatus === 'all' || doc.status === filterStatus)
                  )
                  .map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FileText className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-lg text-gray-900">{doc.title}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600"><span className="font-medium">Student:</span> {doc.requestedBy}</p>
                              <p className="text-gray-600"><span className="font-medium">Type:</span> {doc.type}</p>
                              <p className="text-gray-600"><span className="font-medium">Requested:</span> {new Date(doc.requestedAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600"><span className="font-medium">Due Date:</span> {doc.dueDate}</p>
                              <p className="text-gray-600"><span className="font-medium">Priority:</span> 
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(doc.priority)}`}>
                                  {doc.priority}
                                </span>
                              </p>
                              {doc.completedAt && (
                                <p className="text-gray-600"><span className="font-medium">Completed:</span> {new Date(doc.completedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status.replace('_', ' ')}
                          </span>
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {doc.status === 'pending' && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleDocumentUpdate(doc.id, 'forwarded_to_registrar', 'Forwarded to Registrar for review')}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Forward to Registrar
                              </button>
                              <button
                                onClick={() => handleDocumentUpdate(doc.id, 'rejected', 'Rejected by Clerk')}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </button>
                            </div>
                            <div className="flex space-x-2">
                              <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add Note
                              </button>
                              <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {doc.status === 'in_progress' && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleDocumentUpdate(doc.id, 'forwarded_to_registrar', 'Forwarded to Registrar for final approval')}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete & Forward
                              </button>
                              <button
                                onClick={() => handleDocumentUpdate(doc.id, 'rejected', 'Rejected during processing')}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </button>
                            </div>
                            <div className="flex space-x-2">
                              <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                <Clock className="h-4 w-4 mr-2" />
                                Mark In Progress
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status History */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Status History:</span> 
                          Pending → {doc.status === 'in_progress' ? 'In Progress' : 
                                   doc.status === 'forwarded_to_registrar' ? 'Forwarded to Registrar' : 
                                   doc.status === 'forwarded_to_principal' ? 'Forwarded to Principal' : 
                                   doc.status === 'approved_by_principal' ? 'Approved by Principal' : 
                                   doc.status === 'rejected_by_clerk' ? 'Rejected by Clerk' :
                                   doc.status === 'rejected_by_registrar' ? 'Rejected by Registrar' :
                                   doc.status === 'rejected_by_principal' ? 'Rejected by Principal' :
                                   doc.status === 'rejected' ? 'Rejected' : 
                                   doc.status === 'completed' ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Empty State */}
              {documentRequests.filter(doc => 
                (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 doc.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filterStatus === 'all' || doc.status === filterStatus)
              ).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Department-wise Attendance Management</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

                             {/* Department Statistics */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                 {(() => {
                   const departments = Array.from(new Set(attendanceRecords.map(record => record.department).filter(Boolean)));
                  const stats = departments.map(dept => {
                    const deptRecords = attendanceRecords.filter(record => record.department === dept);
                    const present = deptRecords.filter(record => record.status === 'present').length;
                    const absent = deptRecords.filter(record => record.status === 'absent').length;
                    const total = deptRecords.length;
                    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
                    
                    return { dept, present, absent, total, attendanceRate };
                  });
                  
                  return stats.map(stat => (
                    <div key={stat.dept} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.dept}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.attendanceRate}%</p>
                          <p className="text-xs text-gray-500">{stat.present} present, {stat.absent} absent</p>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

                             {/* Department-wise Attendance Records */}
               <div className="space-y-6">
                 {(() => {
                   const departments = Array.from(new Set(attendanceRecords.map(record => record.department).filter(Boolean)));
                  
                  return departments.map(department => {
                    const departmentRecords = attendanceRecords
                      .filter(record => record.department === department)
                  .filter(record => 
                    record.studentName.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                    
                    if (departmentRecords.length === 0) return null;
                    
                    return (
                      <div key={department} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900">{department} Department</h4>
                          <p className="text-sm text-gray-600">
                            {departmentRecords.length} attendance records
                          </p>
                        </div>
                        <div className="p-6">
                          <div className="space-y-4">
                            {departmentRecords.map((record) => (
                              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                                    <h5 className="font-medium text-lg">{record.studentName}</h5>
                                    <p className="text-gray-600">Student ID: {record.studentId}</p>
                          <p className="text-gray-600">Subject: {record.subject}</p>
                          <p className="text-sm text-gray-500">Date: {record.date}</p>
                        </div>
                                  <div className="flex flex-col items-end space-y-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {department}
                                    </span>
                                  </div>
                      </div>
                      {record.remarks && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">Remarks:</span> {record.remarks}
                                  </p>
                      )}
                    </div>
                  ))}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Leave Requests</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {leaveRequests
                  .filter(leave => 
                    leave.studentName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((leave) => (
                    <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{leave.studentName}</h4>
                          <p className="text-gray-600">Type: {leave.leaveType}</p>
                          <p className="text-gray-600">Period: {leave.startDate} to {leave.endDate}</p>
                          <p className="text-gray-600">Reason: {leave.reason}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(leave.leaveType)}`}>
                            {leave.leaveType}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Requested: {new Date(leave.requestedAt).toLocaleDateString()}</span>
                        {leave.approvedAt && (
                          <span>Approved: {new Date(leave.approvedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      {leave.status === 'pending' && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => handleLeaveRequestUpdate(leave.id, 'approved', 'Clerk')}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveRequestUpdate(leave.id, 'rejected', 'Clerk')}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Notices & Circulars</h3>
                <button
                  onClick={() => setShowNoticeForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Notice
                </button>
              </div>

              <div className="space-y-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{notice.title}</h4>
                        <p className="text-gray-600">{notice.content}</p>
                        <p className="text-sm text-gray-500 mt-1">Target: {notice.targetAudience}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notice.status)}`}>
                          {notice.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                          {notice.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notice.type)}`}>
                          {notice.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Created: {new Date(notice.createdAt).toLocaleDateString()}</span>
                      {notice.expiresAt && (
                        <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <ClerkMaintenanceManagement />
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Reports & Analytics</h3>
                <div className="flex space-x-2">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">Document Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Documents:</span>
                      <span className="font-semibold">{documentRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-yellow-600">{pendingDocuments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <span className="font-semibold text-blue-600">{inProgressDocuments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-semibold text-green-600">{completedDocuments}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">Leave Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Requests:</span>
                      <span className="font-semibold">{leaveRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-yellow-600">{pendingLeaves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-semibold text-green-600">{leaveRequests.filter(l => l.status === 'approved').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-semibold text-red-600">{leaveRequests.filter(l => l.status === 'rejected').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Latest Document Request</p>
                      <p className="text-gray-600">
                        {documentRequests.length > 0 ? documentRequests[0].title : 'No requests'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Latest Leave Request</p>
                      <p className="text-gray-600">
                        {leaveRequests.length > 0 ? leaveRequests[0].studentName : 'No requests'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClerkDashboard; 