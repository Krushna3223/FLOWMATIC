import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, update } from 'firebase/database';
import { 
  BookOpen, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Send,
  Plus,
  Edit,
  Trash2,
  Book,
  Library,
  MessageSquare,
  BarChart3,
  FileText,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LibraryResourceRequest {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  priority: 'low' | 'medium' | 'high';
  additionalDetails?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: Array<{
    role: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string | null;
    comment?: string;
  }>;
  history: Array<{
    action: string;
    by: string;
    role: string;
    timestamp: string;
    comment?: string;
  }>;
}

interface LibraryTimingRequest {
  id: string;
  title: string;
  description: string;
  requestedTiming: {
    startTime: string;
    endTime: string;
    days: string[];
    startDate: string;
    endDate: string;
  };
  reason: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: Array<{
    role: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string | null;
    comment?: string;
  }>;
  history: Array<{
    action: string;
    by: string;
    role: string;
    timestamp: string;
    comment?: string;
  }>;
}

type LibraryRequest = LibraryResourceRequest | LibraryTimingRequest;

const RegistrarLibraryApproval: React.FC = () => {
  const { currentUser } = useAuth();
  const db = getDatabase();
  
  const [requests, setRequests] = useState<LibraryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LibraryRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Fetch both resource requests and timing requests
      const [resourceSnapshot, timingSnapshot] = await Promise.all([
        get(ref(db, 'libraryResourceRequests')),
        get(ref(db, 'libraryTimingRequests'))
      ]);

      const allRequests: LibraryRequest[] = [];

      // Process resource requests
      if (resourceSnapshot.exists()) {
        resourceSnapshot.forEach((childSnapshot) => {
          const request = childSnapshot.val();
          // Show requests that are pending Registrar approval or were created by Registrar
          if (request.currentApproverRole === 'registrar' || request.createdBy === currentUser?.uid) {
            allRequests.push({
              id: childSnapshot.key!,
              ...request
            });
          }
        });
      }

      // Process timing requests
      if (timingSnapshot.exists()) {
        timingSnapshot.forEach((childSnapshot) => {
          const request = childSnapshot.val();
          // Show requests that are pending Registrar approval or were created by Registrar
          if (request.currentApproverRole === 'registrar' || request.createdBy === currentUser?.uid) {
            allRequests.push({
              id: childSnapshot.key!,
              ...request
            });
          }
        });
      }

      setRequests(allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, comment?: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const updatedApprovalFlow = request.approvalFlow.map(step => {
        if (step.role === 'registrar') {
          return { ...step, status: 'approved', timestamp: new Date().toISOString(), comment };
        }
        return step;
      });

      const updatedHistory = [
        ...request.history,
        {
          action: 'Request Approved',
          by: (currentUser as any)?.displayName || 'Registrar',
          role: 'registrar',
          timestamp: new Date().toISOString(),
          comment: comment || 'Request approved by Registrar'
        }
      ];

      // Determine if this is a resource request or timing request
      const isResourceRequest = 'resourceType' in request;
      const databasePath = isResourceRequest ? 'libraryResourceRequests' : 'libraryTimingRequests';

      const updates: any = {};
      
      if (isResourceRequest) {
        // For resource requests, Registrar is the final approver
        updates[`${databasePath}/${requestId}/status`] = 'approved';
        updates[`${databasePath}/${requestId}/currentApproverRole`] = 'completed';
      } else {
        // For timing requests, forward to Principal for final approval
        updates[`${databasePath}/${requestId}/status`] = 'pending';
        updates[`${databasePath}/${requestId}/currentApproverRole`] = 'principal';
      }
      
      updates[`${databasePath}/${requestId}/approvalFlow`] = updatedApprovalFlow;
      updates[`${databasePath}/${requestId}/history`] = updatedHistory;

      await update(ref(db), updates);
      
      const successMessage = isResourceRequest 
        ? 'Request approved successfully' 
        : 'Request forwarded to Principal for final approval';
      toast.success(successMessage);
      fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string, comment?: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const updatedApprovalFlow = request.approvalFlow.map(step => {
        if (step.role === 'registrar') {
          return { ...step, status: 'rejected', timestamp: new Date().toISOString(), comment };
        }
        return step;
      });

      const updatedHistory = [
        ...request.history,
        {
          action: 'Request Rejected',
          by: (currentUser as any)?.displayName || 'Registrar',
          role: 'registrar',
          timestamp: new Date().toISOString(),
          comment: comment || 'Request rejected by Registrar'
        }
      ];

      // Determine if this is a resource request or timing request
      const isResourceRequest = 'resourceType' in request;
      const databasePath = isResourceRequest ? 'libraryResourceRequests' : 'libraryTimingRequests';

      const updates: any = {};
      updates[`${databasePath}/${requestId}/status`] = 'rejected';
      updates[`${databasePath}/${requestId}/currentApproverRole`] = 'completed';
      updates[`${databasePath}/${requestId}/approvalFlow`] = updatedApprovalFlow;
      updates[`${databasePath}/${requestId}/history`] = updatedHistory;

      await update(ref(db), updates);
      
      toast.success('Request rejected successfully');
      fetchRequests();
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesTab = activeTab === 'all' || request.status === activeTab;
    
    // Handle filter for both resource and timing requests
    let matchesFilter = true;
    if (filter !== 'all') {
      if ('resourceType' in request) {
        // This is a resource request
        matchesFilter = request.resourceType === filter;
      } else if (filter === 'timing') {
        // This is a timing request and we're filtering for timing
        matchesFilter = true;
      } else {
        // This is a timing request but we're filtering for resource types
        matchesFilter = false;
      }
    }
    
    const matchesSearch = searchQuery === '' || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.createdByName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Library Request Approval
          </h1>
          <p className="text-gray-600">
            Review and approve library resource requests from students and timing requests from Assistant Librarians
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="book">Book</option>
                <option value="journal">Journal</option>
                <option value="magazine">Magazine</option>
                <option value="reference">Reference Material</option>
                <option value="digital">Digital Resource</option>
                <option value="equipment">Library Equipment</option>
                <option value="other">Other</option>
                <option value="timing">Timing Request</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or requester..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {request.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {request.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium capitalize">
                          {'resourceType' in request ? request.resourceType : 'Timing Request'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <p className={`font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Requester:</span>
                        <p className="font-medium">{request.createdByName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && request.currentApproverRole === 'registrar' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                {'additionalDetails' in request && request.additionalDetails && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Details:</h4>
                    <p className="text-sm text-gray-600">{request.additionalDetails}</p>
                  </div>
                )}

                {/* Timing Details for Timing Requests */}
                {'requestedTiming' in request && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Timing Details:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Start Time:</span>
                        <p className="font-medium">{request.requestedTiming.startTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">End Time:</span>
                        <p className="font-medium">{request.requestedTiming.endTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Days:</span>
                        <p className="font-medium">{request.requestedTiming.days.join(', ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{request.requestedTiming.startDate} to {request.requestedTiming.endDate}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-gray-500">Reason:</span>
                      <p className="font-medium text-sm mt-1">{request.reason}</p>
                    </div>
                  </div>
                )}

                {/* Approval Flow */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Approval Progress:</h4>
                  <div className="flex items-center space-x-4">
                    {request.approvalFlow.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          step.status === 'approved' 
                            ? 'bg-green-500 text-white' 
                            : step.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : step.status === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✗' : index + 1}
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">{step.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{step.status}</p>
                        </div>
                        {index < request.approvalFlow.length - 1 && (
                          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* History */}
                {request.history && request.history.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity:</h4>
                    <div className="space-y-2">
                      {request.history.slice(-3).map((entry, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          <span className="font-medium">{entry.action}</span> by {entry.by} ({entry.role}) - {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Approval Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Request: {selectedRequest.title}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a comment for your decision..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const comment = (document.getElementById('comment') as HTMLTextAreaElement)?.value;
                      handleApprove(selectedRequest.id, comment);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const comment = (document.getElementById('comment') as HTMLTextAreaElement)?.value;
                      handleReject(selectedRequest.id, comment);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrarLibraryApproval; 