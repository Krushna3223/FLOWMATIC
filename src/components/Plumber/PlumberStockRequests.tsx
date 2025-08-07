import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Filter,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StockRequest {
  id: string;
  item: string;
  quantity: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'in_transit' | 'delivered';
  requestedBy: string;
  requestedAt: string;
  description: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
}

interface NewStockRequest {
  item: string;
  quantity: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  requestedBy: string;
  notes: string;
}

const PlumberStockRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState<NewStockRequest>({
    item: '',
    quantity: '',
    priority: 'medium',
    description: '',
    requestedBy: '',
    notes: ''
  });

  useEffect(() => {
    fetchStockRequests();
  }, [currentUser]);

  const fetchStockRequests = async () => {
    try {
      const { getDatabase, ref, get } = await import('firebase/database');
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: StockRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          // Only show requests created by this plumber with type 'plumbing_stock'
          if (request.createdBy === currentUser?.uid && request.type === 'plumbing_stock') {
            requests.push({
              id: child.key!,
              item: request.title,
              quantity: request.quantity || '',
              priority: request.priority,
              status: request.status,
              requestedBy: request.createdByName,
              requestedAt: request.createdAt,
              description: request.description,
              approvedBy: request.approvedBy,
              approvedAt: request.approvedAt,
              estimatedDelivery: request.estimatedDelivery,
              deliveredAt: request.deliveredAt,
              notes: request.notes
            });
          }
        });
        setRequests(requests);
      } else {
        setRequests([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock requests:', error);
      toast.error('Failed to fetch stock requests');
      setLoading(false);
    }
  };

  const handleAddRequest = async () => {
    try {
      if (!newRequest.item || !newRequest.quantity) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { getDatabase, ref, set, push } = await import('firebase/database');
      const { getAuth } = await import('firebase/auth');
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;
      const instituteId = (currentUser as any)?.instituteId || 'default_institute';
      const newRequestRef = push(ref(db, 'equipmentRequests'));
      
      const requestData = {
        id: newRequestRef.key,
        instituteId,
        type: 'plumbing_stock',
        title: newRequest.item,
        quantity: newRequest.quantity,
        description: newRequest.description,
        priority: newRequest.priority,
        status: 'pending',
        createdBy: currentUser?.uid || user?.uid || 'unknown',
        createdByName: currentUser?.name || user?.displayName || 'Plumber',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'asst_store',
        approvalFlow: ['plumber', 'asst_store', 'registrar'],
        notes: newRequest.notes,
        history: [
          {
            action: 'created',
            by: currentUser?.uid || user?.uid || 'unknown',
            at: new Date().toISOString(),
            role: 'plumber',
          }
        ]
      };

      await set(newRequestRef, requestData);
      toast.success('Stock request submitted successfully');
      setShowModal(false);
      setNewRequest({
        item: '',
        quantity: '',
        priority: 'medium',
        description: '',
        requestedBy: '',
        notes: ''
      });
      await fetchStockRequests();
    } catch (error) {
      console.error('Error submitting stock request:', error);
      toast.error('Failed to submit stock request');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { getDatabase, ref, update } = await import('firebase/database');
      const db = getDatabase();
      const requestRef = ref(db, `equipmentRequests/${id}`);
      await update(requestRef, { status });
      toast.success(`Request status updated to ${status.replace('_', ' ')}`);
      await fetchStockRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'approved':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'pending':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'rejected':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_transit':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage and track plumbing supplies and equipment requests
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredRequests.length} of {requests.length} requests
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Delivery
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.item}</div>
                      <div className="text-sm text-gray-500">{request.description}</div>
                      {request.notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          Note: {request.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{request.requestedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{request.requestedAt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.estimatedDelivery || 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Approve
                      </button>
                    )}
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'in_transit')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {request.status === 'in_transit' && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'delivered')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">New Stock Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                  <input
                    type="text"
            value={newRequest.item}
                    onChange={(e) => setNewRequest({ ...newRequest, item: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PVC Pipes (2 inch)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="text"
            value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 50 meters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
              value={newRequest.priority}
              onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                  <input
                    type="text"
                    value={newRequest.requestedBy}
                    onChange={(e) => setNewRequest({ ...newRequest, requestedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Plumber Team A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
            rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed description of the item needed..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or specifications..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRequest}
                  disabled={!newRequest.item || !newRequest.quantity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlumberStockRequests; 