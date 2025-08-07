import React, { useEffect, useState } from 'react';
import { Package, Plus, Calendar, User, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ToolRequest {
  id: string;
  title: string;
  description: string;
  category: 'tool' | 'part' | 'equipment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
  quantity: number;
  reason: string;
}

// Mock API
const fetchToolRequests = async (): Promise<ToolRequest[]> => [
  {
    id: '1',
    title: 'Multimeter Replacement',
    description: 'Digital multimeter for electrical testing and troubleshooting',
    category: 'equipment',
    priority: 'high',
    status: 'approved',
    requestedBy: 'John Electrician',
    requestedAt: '2024-06-01T09:00:00Z',
    approvedBy: 'Store Manager',
    approvedAt: '2024-06-01T14:30:00Z',
    estimatedCost: 150,
    quantity: 2,
    reason: 'Current multimeters are outdated and inaccurate'
  },
  {
    id: '2',
    title: 'Circuit Breaker Parts',
    description: '20A circuit breakers for panel replacement',
    category: 'part',
    priority: 'urgent',
    status: 'ordered',
    requestedBy: 'John Electrician',
    requestedAt: '2024-05-30T11:00:00Z',
    approvedBy: 'Store Manager',
    approvedAt: '2024-05-30T15:00:00Z',
    estimatedCost: 80,
    quantity: 10,
    reason: 'Emergency replacement needed for workshop panel'
  },
  {
    id: '3',
    title: 'Wire Strippers',
    description: 'Professional wire strippers for electrical work',
    category: 'tool',
    priority: 'medium',
    status: 'pending',
    requestedBy: 'John Electrician',
    requestedAt: '2024-05-29T16:00:00Z',
    quantity: 3,
    reason: 'Additional tools needed for new electrical projects'
  },
  {
    id: '4',
    title: 'LED Light Bulbs',
    description: 'Energy-efficient LED bulbs for campus lighting',
    category: 'part',
    priority: 'low',
    status: 'rejected',
    requestedBy: 'John Electrician',
    requestedAt: '2024-05-28T10:00:00Z',
    estimatedCost: 200,
    quantity: 50,
    reason: 'Request denied - budget constraints'
  }
];

const submitToolRequest = async (request: Omit<ToolRequest, 'id' | 'requestedAt' | 'status'>): Promise<boolean> => {
  // Mock API call
  console.log('Submitting tool request:', request);
  return true;
};

const ElectricianToolRequestForm: React.FC = () => {
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'tool' as const,
    priority: 'medium' as const,
    quantity: 1,
    reason: '',
    estimatedCost: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchToolRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error loading tool requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newRequest.title || !newRequest.description || !newRequest.reason) {
      return;
    }

    try {
      await submitToolRequest({
        ...newRequest,
        requestedBy: 'John Electrician'
      });
      const updatedRequests = await fetchToolRequests();
      setRequests(updatedRequests);
      setShowModal(false);
      setNewRequest({
        title: '',
        description: '',
        category: 'tool',
        priority: 'medium',
        quantity: 1,
        reason: '',
        estimatedCost: 0
      });
    } catch (error) {
      console.error('Error submitting tool request:', error);
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
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-purple-100 text-purple-800';
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tool':
        return 'bg-blue-100 text-blue-800';
      case 'part':
        return 'bg-green-100 text-green-800';
      case 'equipment':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tool & Equipment Requests</h1>
        <p className="text-gray-600">Request tools, parts, and equipment needed for electrical maintenance</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tool Request
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request History</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-800">{request.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.requestedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Qty: {request.quantity}
                      </div>
                      {request.estimatedCost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${request.estimatedCost}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <strong>Reason:</strong> {request.reason}
                    </div>
                    {request.approvedBy && (
                      <div className="mt-2 text-sm text-gray-500">
                        Approved by: {request.approvedBy} on {new Date(request.approvedAt!).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(request.category)}`}>
                      {request.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">New Tool Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the item needed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tool">Tool</option>
                    <option value="part">Part</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    value={newRequest.estimatedCost}
                    onChange={(e) => setNewRequest({ ...newRequest, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Request
                </label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this item is needed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newRequest.title || !newRequest.description || !newRequest.reason}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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

export default ElectricianToolRequestForm;
