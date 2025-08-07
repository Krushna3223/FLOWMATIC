import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Calendar,
  AlertTriangle,
  Settings,
  Package,
  User,
  MapPin,
  Zap,
  HardHat,
  Activity,
  FileText,
  DollarSign,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ToolRequest {
  id: string;
  title: string;
  description: string;
  category: 'testing' | 'measuring' | 'safety' | 'construction' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received' | 'closed';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
  quantity: number;
  reason: string;
  location: string;
  urgency: string;
  impact: string;
  supplier?: string;
  orderDate?: string;
  expectedDelivery?: string;
  receivedDate?: string;
}

interface ToolInventory {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available: number;
  location: string;
  lastUpdated: string;
  minStock: number;
  supplier: string;
  cost: number;
}

const LabAsstCivilToolRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([]);
  const [toolInventory, setToolInventory] = useState<ToolInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const requestsRef = ref(database, 'civil_lab_tool_requests');
      const inventoryRef = ref(database, 'civil_lab_tool_inventory');
      
      const [requestsSnapshot, inventorySnapshot] = await Promise.all([
        get(requestsRef),
        get(inventoryRef)
      ]);
      
      if (requestsSnapshot.exists()) {
        const requestsData = requestsSnapshot.val();
        const requestsArray = Object.entries(requestsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setToolRequests(requestsArray);
      } else {
        // Initialize with sample data
        const sampleRequests: ToolRequest[] = [
          {
            id: 'req-1',
            title: 'Digital Caliper Request',
            description: 'Need digital caliper for precise measurements in concrete testing',
            category: 'measuring',
            priority: 'high',
            status: 'approved',
            requestedBy: 'Lab Assistant',
            requestedAt: '2024-01-20T10:30:00Z',
            approvedBy: 'Lab Manager',
            approvedAt: '2024-01-21T14:00:00Z',
            estimatedCost: 2500,
            quantity: 2,
            reason: 'Current calipers showing wear and tear, affecting measurement accuracy',
            location: 'Civil Lab 1',
            urgency: 'Within 1 week',
            impact: 'Critical for ongoing research projects'
          },
          {
            id: 'req-2',
            title: 'Safety Equipment Replacement',
            description: 'Replace damaged safety goggles and helmets',
            category: 'safety',
            priority: 'urgent',
            status: 'ordered',
            requestedBy: 'Safety Officer',
            requestedAt: '2024-01-19T09:15:00Z',
            approvedBy: 'Lab Manager',
            approvedAt: '2024-01-19T16:30:00Z',
            estimatedCost: 5000,
            actualCost: 4800,
            quantity: 10,
            reason: 'Safety equipment damaged during recent incident',
            location: 'Civil Lab 2',
            urgency: 'Immediate',
            impact: 'Safety compliance requirement',
            supplier: 'Safety Equipment Co.',
            orderDate: '2024-01-20T11:00:00Z',
            expectedDelivery: '2024-01-25T00:00:00Z'
          },
          {
            id: 'req-3',
            title: 'Concrete Testing Molds',
            description: 'Additional concrete testing molds for increased capacity',
            category: 'testing',
            priority: 'medium',
            status: 'pending',
            requestedBy: 'Lab Technician',
            requestedAt: '2024-01-18T15:45:00Z',
            estimatedCost: 8000,
            quantity: 5,
            reason: 'Current molds insufficient for upcoming batch testing',
            location: 'Civil Lab 1',
            urgency: 'Within 2 weeks',
            impact: 'Will improve testing efficiency'
          }
        ];
        setToolRequests(sampleRequests);
      }

      if (inventorySnapshot.exists()) {
        const inventoryData = inventorySnapshot.val();
        const inventoryArray = Object.entries(inventoryData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setToolInventory(inventoryArray);
      } else {
        // Initialize with sample inventory data
        const sampleInventory: ToolInventory[] = [
          {
            id: 'inv-1',
            name: 'Digital Caliper',
            category: 'measuring',
            quantity: 5,
            available: 3,
            location: 'Civil Lab 1',
            lastUpdated: '2024-01-20T10:00:00Z',
            minStock: 2,
            supplier: 'Precision Tools Ltd.',
            cost: 2500
          },
          {
            id: 'inv-2',
            name: 'Safety Goggles',
            category: 'safety',
            quantity: 20,
            available: 15,
            location: 'Civil Lab 2',
            lastUpdated: '2024-01-19T16:00:00Z',
            minStock: 10,
            supplier: 'Safety Equipment Co.',
            cost: 500
          },
          {
            id: 'inv-3',
            name: 'Concrete Testing Molds',
            category: 'testing',
            quantity: 8,
            available: 6,
            location: 'Civil Lab 1',
            lastUpdated: '2024-01-18T14:30:00Z',
            minStock: 5,
            supplier: 'Construction Supplies Inc.',
            cost: 1500
          }
        ];
        setToolInventory(sampleInventory);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tool request data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const requestRef = ref(database, `civil_lab_tool_requests/${requestId}`);
      await set(requestRef, {
        ...toolRequests.find(r => r.id === requestId),
        status: newStatus,
        approvedAt: newStatus === 'approved' ? new Date().toISOString() : undefined
      });
      
      setToolRequests(toolRequests.map(r => 
        r.id === requestId 
          ? { ...r, status: newStatus as any, approvedAt: newStatus === 'approved' ? new Date().toISOString() : r.approvedAt }
          : r
      ));
      
      toast.success('Tool request status updated successfully');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'testing': return <Activity className="h-4 w-4" />;
      case 'measuring': return <Wrench className="h-4 w-4" />;
      case 'safety': return <Shield className="h-4 w-4" />;
      case 'construction': return <HardHat className="h-4 w-4" />;
      case 'other': return <Package className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const filteredRequests = toolRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Civil Lab Tool Requests</h1>
          <p className="text-gray-600">Manage tool requests, approvals, and inventory tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                     <div className="bg-white rounded-xl shadow-lg p-6">
             <div className="flex items-center">
               <Wrench className="h-8 w-8 text-blue-600" />
               <div className="ml-3">
                 <p className="text-sm text-gray-600">Total Requests</p>
                 <p className="text-2xl font-bold text-gray-900">{toolRequests.length}</p>
               </div>
             </div>
           </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {toolRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {toolRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Inventory Items</p>
                <p className="text-2xl font-bold text-gray-900">{toolInventory.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tool requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="ordered">Ordered</option>
              <option value="received">Received</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="testing">Testing</option>
              <option value="measuring">Measuring</option>
              <option value="safety">Safety</option>
              <option value="construction">Construction</option>
              <option value="other">Other</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </button>
          </div>
        </div>

        {/* Tool Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                    <p className="text-sm text-gray-600">{request.location}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    {getCategoryIcon(request.category)}
                    <span className="ml-2 text-gray-600 capitalize">{request.category}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{request.requestedBy}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Package className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Qty: {request.quantity}</span>
                  </div>
                  
                  {request.estimatedCost && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">₹{request.estimatedCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{request.description}</p>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setSelectedRequest(request)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tool Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedRequest.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedRequest.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedRequest.priority}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedRequest.status}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <p className="text-sm text-gray-900">{selectedRequest.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Requested By:</span>
                    <p className="text-sm text-gray-900">{selectedRequest.requestedBy}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Quantity:</span>
                    <p className="text-sm text-gray-900">{selectedRequest.quantity}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Reason:</span>
                  <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Urgency:</span>
                  <p className="text-sm text-gray-900">{selectedRequest.urgency}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Impact:</span>
                  <p className="text-sm text-gray-900">{selectedRequest.impact}</p>
                </div>
                
                {selectedRequest.estimatedCost && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Cost:</span>
                    <p className="text-sm text-gray-900">₹{selectedRequest.estimatedCost.toLocaleString()}</p>
                  </div>
                )}
                
                {selectedRequest.supplier && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Supplier:</span>
                    <p className="text-sm text-gray-900">{selectedRequest.supplier}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Handle edit functionality
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
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

export default LabAsstCivilToolRequest;
