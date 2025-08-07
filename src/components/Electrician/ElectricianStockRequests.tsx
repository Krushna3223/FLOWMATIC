import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, push, get, update } from 'firebase/database';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StockRequest {
  id: string;
  title: string;
  item?: string; // For backward compatibility
  quantity: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  requestedBy: string;
  notes: string;
  status: 'pending' | 'in_progress' | 'forwarded' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: string[];
  history: Array<{
    action: string;
    by: string;
    timestamp: string;
    notes?: string;
  }>;
  type: 'electrician_stock';
}

interface NewStockRequest {
  item: string;
  quantity: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  requestedBy: string;
  notes: string;
}

const ElectricianStockRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
  }, []);

  const fetchStockRequests = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: StockRequest[] = [];
        snapshot.forEach((childSnapshot) => {
          const request = childSnapshot.val();
          if (request.createdBy === currentUser?.uid && request.type === 'electrician_stock') {
            requests.push({
              id: childSnapshot.key!,
              ...request
            });
          }
        });
        setStockRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching stock requests:', error);
      toast.error('Failed to fetch stock requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequest = async () => {
    if (!newRequest.item || !newRequest.description || !newRequest.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      
      const newStockRequest = {
        title: newRequest.item,
        description: newRequest.description,
        quantity: newRequest.quantity,
        priority: newRequest.priority,
        notes: newRequest.notes,
        status: 'pending',
        createdBy: currentUser?.uid,
        createdByName: currentUser?.name,
        createdAt: new Date().toISOString(),
        currentApproverRole: 'asst_store',
        approvalFlow: ['electrician', 'asst_store', 'registrar'],
        history: [{
          action: 'created',
          by: currentUser?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          notes: 'Stock request created'
        }],
        type: 'electrician_stock'
      };

      await push(requestsRef, newStockRequest);
      
      toast.success('Stock request submitted successfully');
      setShowNewRequest(false);
      setNewRequest({
        item: '',
        quantity: '',
        priority: 'medium',
        description: '',
        requestedBy: '',
        notes: ''
      });
      
      // Refresh the list
      fetchStockRequests();
    } catch (error) {
      console.error('Error submitting stock request:', error);
      toast.error('Failed to submit stock request');
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const db = getDatabase();
      const requestRef = ref(db, `equipmentRequests/${requestId}`);
      
      await update(requestRef, {
        status: newStatus,
        [`history/${Date.now()}`]: {
          action: 'status_updated',
          by: currentUser?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          notes: `Status updated to ${newStatus}`
        }
      });
      
      toast.success('Request status updated');
      fetchStockRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'forwarded': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  const filteredRequests = stockRequests.filter(request => {
    const matchesSearch = (request.title || request.item || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Electrician Stock Requests</h1>
        <p className="text-gray-600">Request electrical supplies and equipment for maintenance work</p>
      </div>

      {/* Header with stats and new request button */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Stock Requests</h2>
            <p className="text-gray-600">Total: {stockRequests.length} requests</p>
          </div>
          <button
            onClick={() => setShowNewRequest(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Stock Request
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
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
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="forwarded">Forwarded</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title || request.item}</div>
                      <div className="text-sm text-gray-500">{request.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        // Show request details
                        console.log('Request details:', request);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new stock request.'
              }
            </p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">New Stock Request</h3>
              <button
                onClick={() => setShowNewRequest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newRequest.item}
                    onChange={(e) => setNewRequest({ ...newRequest, item: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5 units, 2 boxes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested By
                  </label>
                  <input
                    type="text"
                    value={newRequest.requestedBy}
                    onChange={(e) => setNewRequest({ ...newRequest, requestedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the item and why it's needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information or specifications"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewRequest(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRequest}
                disabled={!newRequest.item || !newRequest.description || !newRequest.quantity}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricianStockRequests; 