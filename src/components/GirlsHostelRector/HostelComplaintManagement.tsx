import React, { useState, useEffect } from 'react';
import { ref, get, update, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Clock, FileText, Users, Filter, Search } from 'lucide-react';

interface HostelComplaint {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  department: string;
  course: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  roomNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'forwarded_to_registrar';
  currentLevel: string;
  submittedAt: string;
  workflow: {
    hostel_rector: {
      status: string;
      timestamp: string;
      comments?: string;
    };
    registrar: {
      status: string;
      timestamp: string | null;
    };
  };
}

const HostelComplaintManagement: React.FC = () => {
  console.log("🚀 HostelComplaintManagement component mounted");
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<HostelComplaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<HostelComplaint | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionComments, setActionComments] = useState('');

  useEffect(() => {
    console.log("🔄 useEffect triggered - calling fetchComplaints");
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    console.log("🔍 Starting fetchComplaints function");
    try {
      setLoading(true);
      console.log("📊 Setting loading to true");
      
      // Test database access first
      const testRef = ref(database, 'users');
      console.log("🧪 Testing database access with users node");
      
      onValue(testRef, (testSnapshot) => {
        console.log("🧪 Test snapshot exists:", testSnapshot.exists());
        console.log("🧪 Test snapshot has data:", testSnapshot.val() ? "Yes" : "No");
      }, (error) => {
        console.error("🧪 Test database access failed:", error);
      });
      
      const complaintsRef = ref(database, 'hostelComplaints');
      console.log("🔗 Created complaints ref:", complaintsRef);
      
      onValue(complaintsRef, (snapshot) => {
        console.log("📡 onValue callback triggered");
        console.log("📊 Snapshot exists:", snapshot.exists());
        console.log("📊 Snapshot val:", snapshot.val());
        
        if (snapshot.exists()) {
          const allComplaints: HostelComplaint[] = [];
          
          snapshot.forEach((studentSnapshot) => {
            console.log("👤 Student snapshot key:", studentSnapshot.key);
            console.log("👤 Student complaints:", studentSnapshot.val());
            studentSnapshot.forEach((complaintSnapshot) => {
              const complaintData = complaintSnapshot.val();
              console.log("📝 Individual complaint:", complaintData);
              allComplaints.push({
                id: complaintSnapshot.key!,
                ...complaintData
              });
            });
          });
          
          console.log("📋 All complaints processed:", allComplaints);
          setComplaints(allComplaints.sort((a, b) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          ));
        } else {
          console.log("❌ No complaints found in database");
        }
      }, (error) => {
        console.error("❌ onValue error:", error);
      });
    } catch (error) {
      console.error('❌ Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
      console.log("✅ Loading set to false");
    }
  };

  const handleAction = async (complaintId: string, action: 'approve' | 'reject' | 'forward_to_registrar', comments?: string) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      if (!complaint) return;

      const updateData: Partial<HostelComplaint> = {
        status: action === 'forward_to_registrar' ? 'forwarded_to_registrar' : (action === 'approve' ? 'approved' : 'rejected'),
        currentLevel: action === 'forward_to_registrar' ? 'registrar' : 'hostel_rector',
        workflow: {
          ...complaint.workflow,
          hostel_rector: {
            status: action,
            timestamp: new Date().toISOString(),
            comments: comments || ''
          }
        }
      };

      if (action === 'forward_to_registrar') {
        updateData.workflow!.registrar = {
          status: 'pending',
          timestamp: new Date().toISOString()
        };
      }

      const complaintRef = ref(database, `hostelComplaints/${complaint.studentId}/${complaintId}`);
      await update(complaintRef, updateData);
      
      toast.success(`Complaint ${action === 'forward_to_registrar' ? 'forwarded to registrar' : action} successfully`);
      setShowDetails(false);
      setSelectedComplaint(null);
      setActionComments('');
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast.error('Failed to update complaint');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'forwarded_to_registrar':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    approved: complaints.filter(c => c.status === 'approved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
    forwarded: complaints.filter(c => c.status === 'forwarded_to_registrar').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
                             <h1 className="text-3xl font-bold text-gray-800 mb-2">Hostel Complaint Management</h1>
               <p className="text-gray-600">Review and manage student hostel complaints - Approve, Reject, or Forward to Registrar</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-green-600">Approved</p>
                  <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm text-red-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-blue-600">Forwarded</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.forwarded}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                                 <option value="all">All Status</option>
                 <option value="pending">Pending Review</option>
                 <option value="approved">Approved</option>
                 <option value="rejected">Rejected</option>
                 <option value="forwarded_to_registrar">Forwarded to Registrar</option>
              </select>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Complaints ({filteredComplaints.length})</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading complaints...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No complaints found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800">{complaint.studentName}</h4>
                          <p className="text-sm text-gray-600">
                            {complaint.studentRollNo} • {complaint.department} • {complaint.course}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-semibold">{complaint.category.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-semibold">{complaint.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Room</p>
                        <p className="font-semibold">{complaint.roomNumber || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Description:</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{complaint.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Submitted: {new Date(complaint.submittedAt).toLocaleDateString()}
                      </div>
                      
                                             {(complaint.status === 'pending' || complaint.currentLevel === 'hostel_rector') && (
                         <div className="flex space-x-2">
                           <button
                             onClick={() => {
                               setSelectedComplaint(complaint);
                               setShowDetails(true);
                             }}
                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                           >
                             Review
                           </button>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {showDetails && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Review Complaint</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedComplaint(null);
                  setActionComments('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-semibold">{selectedComplaint.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roll No</p>
                  <p className="font-semibold">{selectedComplaint.studentRollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">{selectedComplaint.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold">{selectedComplaint.course}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-semibold">{selectedComplaint.subject}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedComplaint.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your comments..."
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => handleAction(selectedComplaint.id, 'approve', actionComments)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(selectedComplaint.id, 'reject', actionComments)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedComplaint.id, 'forward_to_registrar', actionComments)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Forward to Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelComplaintManagement; 