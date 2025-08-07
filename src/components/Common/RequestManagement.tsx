import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RequestManager, { Request, RequestComment, RequestStats } from '../../utils/requestManager';
import { HIERARCHY_CONFIG, getRoleLevel } from '../../types/hierarchy';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Forward, 
  MessageSquare,
  AlertTriangle,
  FileText,
  Wrench,
  BookOpen,
  Package,
  Users,
  Settings
} from 'lucide-react';

import { 
  REQUEST_TYPE_HIERARCHIES, 
  getRequestTypeHierarchy, 
  getRequestTypesForRole,
  getCategoriesForRole 
} from '../../types/hierarchy';

interface RequestManagementProps {
  mode?: 'create' | 'view' | 'approve' | 'all';
  onRequestCreated?: (requestId: string) => void;
}

const RequestManagement: React.FC<RequestManagementProps> = ({ 
  mode = 'view', 
  onRequestCreated 
}) => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState<Array<{uid: string, name: string, role: string, department?: string}>>([]);
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: ''
  });

  const requestManager = RequestManager.getInstance();

  useEffect(() => {
    if (currentUser) {
      loadRequests();
      loadStats();
      if (mode === 'create') {
        loadAvailableRecipients();
      }
    }
  }, [currentUser, mode]);

  const loadRequests = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      let requestsData: Request[] = [];
      
      switch (mode) {
        case 'all':
          requestsData = await requestManager.getAllRequests(currentUser.role);
          break;
        case 'approve':
          requestsData = await requestManager.getIncomingRequests(currentUser.uid, currentUser.role);
          break;
        default:
          const incoming = await requestManager.getIncomingRequests(currentUser.uid, currentUser.role);
          const outgoing = await requestManager.getOutgoingRequests(currentUser.uid);
          requestsData = [...incoming, ...outgoing];
      }
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!currentUser) return;
    
    try {
      const statsData = await requestManager.getRequestStats(currentUser.uid, currentUser.role);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAvailableRecipients = async () => {
    if (!currentUser) return;
    
    try {
      const recipients = await requestManager.getAvailableRecipients(currentUser.role);
      setAvailableRecipients(recipients);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const handleCreateRequest = async (formData: {
    toUserId: string;
    toUserRole: string;
    requestType: Request['requestType'];
    subject: string;
    description: string;
    priority: Request['priority'];
  }) => {
    if (!currentUser) return;
    
    try {
      const recipient = availableRecipients.find(r => r.uid === formData.toUserId);
      
      const requestId = await requestManager.createRequest({
        fromUserId: currentUser.uid,
        fromUserName: currentUser.name,
        fromUserRole: currentUser.role,
        toUserId: formData.toUserId,
        toUserName: recipient?.name || '',
        toUserRole: formData.toUserRole,
        requestType: formData.requestType,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        department: currentUser.department
      });
      
      toast.success('Request created successfully');
      setShowCreateForm(false);
      loadRequests();
      loadStats();
      
      if (onRequestCreated) {
        onRequestCreated(requestId);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    }
  };

  const handleApproveRequest = async (requestId: string, action: 'approve' | 'reject', comment?: string) => {
    if (!currentUser) return;
    
    try {
      await requestManager.approveRequest(
        requestId,
        currentUser.uid,
        currentUser.name,
        currentUser.role,
        action,
        comment
      );
      
      toast.success(`Request ${action}ed successfully`);
      loadRequests();
      loadStats();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleAddComment = async (requestId: string, comment: string) => {
    if (!currentUser) return;
    
    try {
      await requestManager.addComment(requestId, {
        userId: currentUser.uid,
        userName: currentUser.name,
        userRole: currentUser.role,
        comment,
        timestamp: new Date().toISOString(),
        isInternal: false
      });
      
      toast.success('Comment added successfully');
      loadRequests();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'forwarded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
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

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <FileText className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'complaint': return <AlertTriangle className="w-4 h-4" />;
      case 'inventory': return <Package className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter.status !== 'all' && request.status !== filter.status) return false;
    if (filter.type !== 'all' && request.requestType !== filter.type) return false;
    if (filter.priority !== 'all' && request.priority !== filter.priority) return false;
    if (filter.search && !request.subject.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  if (!currentUser) {
    return <div className="text-center py-8">Please log in to access request management.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request Management</h2>
          <p className="text-gray-600">Manage requests and approvals based on hierarchy</p>
        </div>
        
        {mode !== 'create' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Forward className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Forwarded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.forwarded}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search requests..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="forwarded">Forwarded</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="certificate">Certificate</option>
            <option value="maintenance">Maintenance</option>
            <option value="academic">Academic</option>
            <option value="complaint">Complaint</option>
            <option value="inventory">Inventory</option>
            <option value="general">General</option>
          </select>
          
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <CreateRequestForm
          availableRecipients={availableRecipients}
          onSubmit={handleCreateRequest}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getRequestTypeIcon(request.requestType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {request.subject}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.requestType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.fromUserName}
                      <div className="text-xs text-gray-500">{request.fromUserRole}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.toUserName}
                      <div className="text-xs text-gray-500">{request.toUserRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          currentUser={currentUser}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApproveRequest}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

// Create Request Form Component
interface CreateRequestFormProps {
  availableRecipients: Array<{uid: string, name: string, role: string, department?: string}>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ availableRecipients, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<{
    recipientId: string;
    recipientRole: string;
    requestType: Request['requestType'];
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }>({
    recipientId: '',
    recipientRole: '',
    requestType: 'general' as Request['requestType'],
    subject: '',
    description: '',
    priority: 'medium',
    category: 'General'
  });

  // Get available request types for current user's role
  const availableRequestTypes = getRequestTypesForRole(currentUser?.role || '');
  const availableCategories = getCategoriesForRole(currentUser?.role || '');

  // Get request types by category
  const getRequestTypesByCategory = (category: string) => {
    return REQUEST_TYPE_HIERARCHIES
      .filter(h => h.category === category)
      .map(h => h.requestType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientId || !formData.subject || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Request</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send To *
            </label>
            <select
              value={formData.recipientId}
              onChange={(e) => {
                const recipient = availableRecipients.find(r => r.uid === e.target.value);
                setFormData({
                  ...formData,
                  recipientId: e.target.value,
                  recipientRole: recipient?.role || ''
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select recipient</option>
              {availableRecipients.map((recipient) => (
                <option key={recipient.uid} value={recipient.uid}>
                  {recipient.name} ({recipient.role})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                const category = e.target.value;
                setFormData({ 
                  ...formData, 
                  category,
                  requestType: getRequestTypesByCategory(category)[0] as Request['requestType'] || 'general'
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Type *
            </label>
            <select
              value={formData.requestType}
              onChange={(e) => setFormData({ ...formData, requestType: e.target.value as Request['requestType'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {getRequestTypesByCategory(formData.category).map((requestType) => {
                const hierarchy = getRequestTypeHierarchy(requestType);
                return (
                  <option key={requestType} value={requestType}>
                    {requestType.replace(/_/g, ' ').toUpperCase()} - {hierarchy?.description || ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Request
          </button>
        </div>
      </form>
    </div>
  );
};

// Request Detail Modal Component
interface RequestDetailModalProps {
  request: Request;
  currentUser: any;
  onClose: () => void;
  onApprove: (requestId: string, action: 'approve' | 'reject', comment?: string) => void;
  onAddComment: (requestId: string, comment: string) => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ 
  request, 
  currentUser, 
  onClose, 
  onApprove, 
  onAddComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [approvalComment, setApprovalComment] = useState('');

  const canApprove = request.toUserId === currentUser.uid && request.status === 'pending';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{request.subject}</h3>
              <p className="text-sm text-gray-500">Request #{request.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Request Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">From:</span>
                  <p className="text-sm text-gray-900">{request.fromUserName} ({request.fromUserRole})</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">To:</span>
                  <p className="text-sm text-gray-900">{request.toUserName} ({request.toUserRole})</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <p className="text-sm text-gray-900">{request.requestType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Priority:</span>
                  <p className="text-sm text-gray-900">{request.priority}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-sm text-gray-900">{request.status}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <p className="text-sm text-gray-900">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-700">{request.description}</p>
            </div>
          </div>
          
          {/* Comments */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {request.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                      <p className="text-xs text-gray-500">{comment.userRole}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{comment.comment}</p>
                </div>
              ))}
            </div>
            
            {/* Add Comment */}
            <div className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  if (newComment.trim()) {
                    onAddComment(request.id, newComment);
                    setNewComment('');
                  }
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>
          
          {/* Approval Actions */}
          {canApprove && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Approve/Reject Request</h4>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Add approval/rejection comment (optional)..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => onApprove(request.id, 'approve', approvalComment)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => onApprove(request.id, 'reject', approvalComment)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestManagement; 