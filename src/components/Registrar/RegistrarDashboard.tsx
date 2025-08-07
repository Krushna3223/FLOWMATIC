import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get, set, push, query, orderByChild, equalTo, onValue, update } from 'firebase/database';
import { 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Plus,
  Edit,
  Trash2,
  Package,
  Wrench
} from 'lucide-react';
import toast from 'react-hot-toast';
import RegistrarMaintenanceRequests from './RegistrarMaintenanceRequests';

interface StudentAcademicHistory {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  year: string;
  semester: string;
  subjects: string[];
  grades: Record<string, string>;
  attendance: number;
  createdAt: string;
}

interface DocumentVerification {
  id: string;
  documentType: 'admission' | 'transfer' | 'bonafide' | 'tc' | 'noc' | 'other';
  studentId: string;
  studentName: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

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

interface Communication {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

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

interface EquipmentRequest {
  id: string;
  instituteId: string;
  type: 'workshop' | 'lab' | 'computer';
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'forwarded';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: string[];
  history: Array<{
    action: string;
    by: string;
    at: string;
    role: string;
  }>;
}

const RegistrarDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  console.log('RegistrarDashboard loaded - User:', currentUser?.role, 'Path:', location.pathname);
  const [students, setStudents] = useState<any[]>([]);
  const [academicHistory, setAcademicHistory] = useState<StudentAcademicHistory[]>([]);
  const [documents, setDocuments] = useState<DocumentVerification[]>([]);
  const [statistics, setStatistics] = useState<SemesterStatistics[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');

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
              assignedTo: 'Registrar',
              notes: requestData.purpose || ''
            });
          });
        });
        
        console.log('🔄 RegistrarDashboard: Real-time update -', realDocumentRequests.length, 'requests');
        setDocumentRequests(realDocumentRequests);
      } else {
        setDocumentRequests([]);
      }
    });

    // Set up real-time listener for equipment requests
    const equipmentRequestsRef = ref(getDatabase(), 'equipmentRequests');
    const equipmentUnsubscribe = onValue(equipmentRequestsRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const realEquipmentRequests: EquipmentRequest[] = [];
        snapshot.forEach((child: any) => {
          const request = child.val();
          // Only show requests that need registrar approval
          if (request.currentApproverRole === 'registrar' && request.status === 'forwarded') {
            realEquipmentRequests.push({
              id: child.key!,
              ...request
            });
          }
        });
        setEquipmentRequests(realEquipmentRequests);
      } else {
        setEquipmentRequests([]);
      }
    });

    return () => {
      unsubscribe();
      equipmentUnsubscribe();
    };
  }, []);

  // Create academic history when students are loaded
  useEffect(() => {
    if (students.length > 0) {
      const createAcademicHistory = (studentsList: any[]) => {
        return studentsList.map((student, index) => ({
          id: `academic-${student.id || index}`,
          studentId: student.id,
          studentName: student.name || student.studentName || `Student ${index + 1}`,
          rollNumber: student.rollNumber || student.rollNo || `R${String(index + 1).padStart(3, '0')}`,
          course: student.course || 'Computer Science',
          year: student.year || '2024',
          semester: `${Math.floor((index % 6) + 1)}th Semester`,
          subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
          grades: {
            'Mathematics': ['A', 'B+', 'A-', 'B'][index % 4],
            'Physics': ['B+', 'A', 'B', 'A-'][index % 4],
            'Chemistry': ['A-', 'B+', 'A', 'B+'][index % 4],
            'English': ['B', 'A-', 'B+', 'A'][index % 4]
          },
          attendance: 75 + (index * 2),
          createdAt: new Date().toISOString()
        }));
      };
      
      const academicHistoryData = createAcademicHistory(students);
      setAcademicHistory(academicHistoryData);
      console.log('✅ Created academic history for', students.length, 'students');
    }
  }, [students]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const database = getDatabase();
      
      console.log('📊 Fetching real data for Registrar Dashboard');
      
      // Debug: Check what's available in the database
      try {
        const debugRef = ref(database);
        const debugSnapshot = await get(debugRef);
        if (debugSnapshot.exists()) {
          const allData = debugSnapshot.val();
          if (allData.students) {
            console.log('🎓 Students in database:', Object.keys(allData.students));
          }
        }
      } catch (debugError) {
        console.log('❌ Debug error:', debugError);
      }
      
      // Fetch student data from users collection
      try {
        console.log('🔍 Fetching students from users collection...');
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const allUsers = usersSnapshot.val();
          console.log('👥 All users in database:', Object.keys(allUsers));
          
          // Filter users with role 'student'
          const studentUsers = Object.entries(allUsers)
            .filter(([id, user]: [string, any]) => {
              console.log(`🔍 Checking user ${id}:`, user.role);
              return user.role === 'student';
            })
            .map(([id, user]: [string, any]) => ({
              id,
              name: user.name || user.fullName || user.studentName || `Student ${id}`,
              rollNumber: user.rollNumber || user.rollNo || user.institutionalId || `R${id}`,
              course: user.course || user.department || 'Computer Science',
              year: user.year || '2024',
              email: user.email || '',
              phone: user.phone || user.phoneNumber || ''
            }));
          
          if (studentUsers.length > 0) {
            console.log('✅ Fetched real students from /users:', studentUsers);
            setStudents(studentUsers);
          } else {
            console.log('⚠️ No students found in /users, using mock data');
            // Fallback to mock data
            const mockStudents = [
              { id: 'ST001', name: 'John Doe', rollNumber: 'R001', course: 'Computer Science', year: '2024', email: 'john@example.com', phone: '1234567890' },
              { id: 'ST002', name: 'Jane Smith', rollNumber: 'R002', course: 'Electrical Engineering', year: '2024', email: 'jane@example.com', phone: '1234567891' },
              { id: 'ST003', name: 'Mike Johnson', rollNumber: 'R003', course: 'Mechanical Engineering', year: '2024', email: 'mike@example.com', phone: '1234567892' },
              { id: 'ST004', name: 'Sarah Wilson', rollNumber: 'R004', course: 'Civil Engineering', year: '2024', email: 'sarah@example.com', phone: '1234567893' },
              { id: 'ST005', name: 'David Brown', rollNumber: 'R005', course: 'Computer Science', year: '2024', email: 'david@example.com', phone: '1234567894' }
            ];
            setStudents(mockStudents);
          }
        } else {
          console.log('⚠️ No users found in database, using mock data');
          // Fallback to mock data
          const mockStudents = [
            { id: 'ST001', name: 'John Doe', rollNumber: 'R001', course: 'Computer Science', year: '2024', email: 'john@example.com', phone: '1234567890' },
            { id: 'ST002', name: 'Jane Smith', rollNumber: 'R002', course: 'Electrical Engineering', year: '2024', email: 'jane@example.com', phone: '1234567891' },
            { id: 'ST003', name: 'Mike Johnson', rollNumber: 'R003', course: 'Mechanical Engineering', year: '2024', email: 'mike@example.com', phone: '1234567892' },
            { id: 'ST004', name: 'Sarah Wilson', rollNumber: 'R004', course: 'Civil Engineering', year: '2024', email: 'sarah@example.com', phone: '1234567893' },
            { id: 'ST005', name: 'David Brown', rollNumber: 'R005', course: 'Computer Science', year: '2024', email: 'david@example.com', phone: '1234567894' }
          ];
          setStudents(mockStudents);
        }
      } catch (error) {
        console.error('❌ Error fetching students from users:', error);
        // Use mock data as fallback
        const mockStudents = [
          { id: 'ST001', name: 'John Doe', rollNumber: 'R001', course: 'Computer Science', year: '2024', email: 'john@example.com', phone: '1234567890' },
          { id: 'ST002', name: 'Jane Smith', rollNumber: 'R002', course: 'Electrical Engineering', year: '2024', email: 'jane@example.com', phone: '1234567891' },
          { id: 'ST003', name: 'Mike Johnson', rollNumber: 'R003', course: 'Mechanical Engineering', year: '2024', email: 'mike@example.com', phone: '1234567892' },
          { id: 'ST004', name: 'Sarah Wilson', rollNumber: 'R004', course: 'Civil Engineering', year: '2024', email: 'sarah@example.com', phone: '1234567893' },
          { id: 'ST005', name: 'David Brown', rollNumber: 'R005', course: 'Computer Science', year: '2024', email: 'david@example.com', phone: '1234567894' }
        ];
        setStudents(mockStudents);
      }

      // Mock documents for verification
      const mockDocuments: DocumentVerification[] = [
        {
          id: 'DOC001',
          documentType: 'admission',
          studentId: 'ST001',
          studentName: 'John Doe',
          documentUrl: 'https://example.com/doc1.pdf',
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'DOC002',
          documentType: 'transfer',
          studentId: 'ST002',
          studentName: 'Jane Smith',
          documentUrl: 'https://example.com/doc2.pdf',
          status: 'verified',
          verifiedBy: 'Registrar',
          verifiedAt: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-14T09:20:00Z'
        },
        {
          id: 'DOC003',
          documentType: 'bonafide',
          studentId: 'ST003',
          studentName: 'Mike Johnson',
          documentUrl: 'https://example.com/doc3.pdf',
          status: 'rejected',
          verifiedBy: 'Registrar',
          verifiedAt: '2024-01-13T11:15:00Z',
          notes: 'Incomplete information provided',
          createdAt: '2024-01-13T08:30:00Z'
        }
      ];
      setDocuments(mockDocuments);

      // Mock statistics
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
        }
      ];
      setStatistics(mockStatistics);

      // Mock communications
      const mockCommunications: Communication[] = [
        {
          id: 'COMM001',
          recipient: 'All Students',
          subject: 'Important Notice: Semester Exam Schedule',
          message: 'Dear students, please note that the semester examinations will begin from next week.',
          status: 'sent',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'COMM002',
          recipient: 'Computer Science Department',
          subject: 'Faculty Meeting Reminder',
          message: 'There will be a faculty meeting tomorrow at 2 PM in the conference room.',
          status: 'delivered',
          createdAt: '2024-01-14T15:45:00Z'
        }
      ];
      setCommunications(mockCommunications);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
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
          
          await set(requestRef, {
            ...snapshot.val()[userId][requestId],
            status: status,
            registrarComment: notes || 'Processed by Registrar',
            registrarApprovedAt: new Date().toISOString(),
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

  // Fetch equipment requests for approval
  const fetchEquipmentRequests = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: EquipmentRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          // Only show requests that need registrar approval
          if (request.currentApproverRole === 'registrar' && request.status === 'forwarded') {
            requests.push({
              id: child.key!,
              ...request
            });
          }
        });
        setEquipmentRequests(requests);
      } else {
        setEquipmentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching equipment requests:', error);
      toast.error('Failed to fetch equipment requests');
    }
  };

  // Handle equipment request approval/rejection
  const handleEquipmentRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const db = getDatabase();
      const requestRef = ref(db, `equipmentRequests/${requestId}`);
      const request = equipmentRequests.find(r => r.id === requestId);
      
      if (!request) return;

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const updateData = {
        status: newStatus,
        currentApproverRole: 'registrar',
        history: [
          ...request.history,
          {
            action: action === 'approve' ? 'approved' : 'rejected',
            by: currentUser?.uid || 'unknown',
            at: new Date().toISOString(),
            role: 'registrar'
          }
        ]
      };

      await update(requestRef, updateData);
      
      toast.success(`Equipment request ${action}d successfully`);
      await fetchEquipmentRequests();
    } catch (error) {
      console.error('Error updating equipment request:', error);
      toast.error(`Failed to ${action} equipment request`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registrar Dashboard</h1>
              <p className="text-gray-600">Manage academic records, documents, and institutional processes</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{currentUser?.name || 'Registrar'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {currentUser?.name?.charAt(0) || 'R'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'documents', name: 'Document Requests', icon: '📋' },
              { id: 'maintenance', name: 'Maintenance Requests', icon: '🔧' },
              { id: 'equipment', name: 'Equipment Requests', icon: '🔧' },
              { id: 'students', name: 'Students', icon: '👥' },
              { id: 'statistics', name: 'Statistics', icon: '📈' },
              { id: 'communication', name: 'Communication', icon: '💬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600">Overview of student records, documents, and academic statistics</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.filter(doc => doc.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Verified Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.filter(doc => doc.status === 'verified' && 
                        new Date(doc.verifiedAt || '').toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Semesters</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('students')}
                  className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100"
                >
                  <p className="font-medium text-blue-800">View Student Records</p>
                  <p className="text-sm text-blue-600">Manage student information</p>
                </button>
                
                <button 
                  onClick={() => setActiveTab('documents')}
                  className="w-full text-left p-3 bg-yellow-50 rounded border border-yellow-200 hover:bg-yellow-100"
                >
                  <p className="font-medium text-yellow-800">Document Requests</p>
                  <p className="text-sm text-yellow-600">Review pending documents</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="w-full text-left p-3 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100"
                >
                  <p className="font-medium text-orange-800">Maintenance Requests</p>
                  <p className="text-sm text-orange-600">Final approval for maintenance</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('statistics')}
                  className="w-full text-left p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100"
                >
                  <p className="font-medium text-green-800">View Statistics</p>
                  <p className="text-sm text-green-600">Academic performance data</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Requests Processing</h2>
              <p className="text-gray-600">Review and process document requests from students</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
                <div className="flex items-center">
                  <Package className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-sm opacity-90">Forwarded from Clerk</p>
                    <p className="text-2xl font-bold">{documentRequests.filter(d => d.status === 'forwarded_to_registrar').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-4">
                <div className="flex items-center">
                  <Send className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-sm opacity-90">Forwarded to Principal</p>
                    <p className="text-2xl font-bold">{documentRequests.filter(d => d.status === 'forwarded_to_principal').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-sm opacity-90">Approved by Principal</p>
                    <p className="text-2xl font-bold">{documentRequests.filter(d => d.status === 'approved_by_principal').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 mr-3" />
                  <div>
                    <p className="text-sm opacity-90">Rejected</p>
                    <p className="text-2xl font-bold">{documentRequests.filter(d => d.status.includes('rejected')).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Requests List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="space-y-4">
                  {documentRequests
                    .filter(doc => 
                      (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       doc.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())) &&
                      (filterStatus === 'all' || doc.status === filterStatus)
                    )
                    .map((doc) => (
                      <div key={doc.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
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
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                              {doc.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {doc.status === 'forwarded_to_registrar' && (
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleDocumentUpdate(doc.id, 'forwarded_to_principal', 'Forwarded to Principal for final approval')}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Forward to Principal
                              </button>
                              <button
                                onClick={() => handleDocumentUpdate(doc.id, 'rejected_by_registrar', 'Rejected by Registrar')}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Empty State */}
                  {documentRequests.filter(doc => 
                    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     doc.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (filterStatus === 'all' || doc.status === filterStatus)
                  ).length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No document requests found</h3>
                      <p className="text-gray-500">No documents have been forwarded from the Clerk for review.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Maintenance Request Final Approval</h2>
              <p className="text-gray-600">Review and finalize maintenance requests approved by technicians</p>
            </div>
            <RegistrarMaintenanceRequests />
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Management</h2>
              <p className="text-gray-600">View and manage student records</p>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.slice(0, 10).map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.course}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Academic Statistics</h2>
              <p className="text-gray-600">View detailed academic performance and attendance data</p>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statistics.map((stat) => (
                        <tr key={stat.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.semester}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.totalStudents}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.passedStudents}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.failedStudents}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Equipment Request Approvals</h2>
              <p className="text-gray-600">Review and approve equipment requests from various departments</p>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Pending Equipment Requests</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => fetchEquipmentRequests()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {equipmentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No pending equipment requests</p>
                      <p className="text-sm text-gray-500 mt-2">All requests have been processed</p>
                    </div>
                  ) : (
                    equipmentRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-lg">{request.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.type === 'workshop' ? 'bg-blue-100 text-blue-600' :
                                request.type === 'lab' ? 'bg-green-100 text-green-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {request.type}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{request.description}</p>
                            <p className="text-sm text-gray-500">Category: {request.category}</p>
                            <p className="text-sm text-gray-500">Requested by: {request.createdByName}</p>
                            <p className="text-sm text-gray-500">Date: {new Date(request.createdAt).toLocaleDateString()}</p>
                            
                            {/* Approval History */}
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Approval History:</p>
                              <div className="space-y-1">
                                {request.history.map((entry, index) => (
                                  <div key={index} className="text-xs text-gray-600">
                                    <span className="font-medium">{entry.role}:</span> {entry.action} on {new Date(entry.at).toLocaleDateString()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleEquipmentRequestAction(request.id, 'approve')}
                            className="px-4 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleEquipmentRequestAction(request.id, 'reject')}
                            className="px-4 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Communication Management</h2>
              <p className="text-gray-600">Send and manage communications to students and staff</p>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {communications.map((comm) => (
                        <tr key={comm.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comm.recipient}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              comm.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {comm.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrarDashboard; 