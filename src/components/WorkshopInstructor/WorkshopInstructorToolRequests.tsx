import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { 
  Search,
  Download,
  Eye,
  XCircle,
  Plus,
  Package,
  FileText,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EquipmentRequest {
  id: string;
  instituteId: string;
  type: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  quantity: number;
  estimatedCost: number;
  reason: string;
  status: string;
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

const WorkshopInstructorToolRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchEquipmentRequests();
  }, []);

  const fetchEquipmentRequests = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      
      const snapshot = await get(requestsRef);
      const data = snapshot.val();
      if (data) {
        const requests = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter(request => 
          request.createdBy === currentUser?.uid && 
          request.type === 'workshop'
        );
        setEquipmentRequests(requests);
      } else {
        setEquipmentRequests([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment requests:', error);
      toast.error('Failed to fetch requests');
      setLoading(false);
    }
  };

  const handleEquipmentRequest = async (title: string, description: string, category: string, priority: string, quantity: string, estimatedCost: string, reason: string) => {
    try {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;
      const instituteId = (currentUser as any)?.instituteId || 'default_institute';
      
      const newRequestRef = push(ref(db, 'equipmentRequests'));
      const newRequest = {
        id: newRequestRef.key,
        instituteId,
        type: 'workshop',
        title,
        description,
        category,
        priority,
        quantity: parseInt(quantity) || 1,
        estimatedCost: parseFloat(estimatedCost) || 0,
        reason,
        status: 'pending',
        createdBy: currentUser?.uid || user?.uid || 'unknown',
        createdByName: currentUser?.name || user?.displayName || 'Workshop Instructor',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'asst_store',
        approvalFlow: ['workshop_instructor', 'asst_store', 'registrar'],
        history: [
          {
            action: 'created',
            by: currentUser?.uid || user?.uid || 'unknown',
            at: new Date().toISOString(),
            role: 'workshop_instructor',
          }
        ]
      };
      
      await set(newRequestRef, newRequest);
      toast.success('Equipment request submitted successfully');
      setShowNewRequest(false);
      
      // Refresh the requests list
      fetchEquipmentRequests();
    } catch (error) {
      console.error('Error submitting equipment request:', error);
      toast.error('Failed to submit equipment request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'forwarded': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequests = equipmentRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tool & Equipment Requests</h1>
            <p className="text-gray-600">Manage and track all your equipment requests</p>

          </div>
        </div>
      </div>

      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Request Management</h2>
            <p className="text-blue-100">Submit and track your equipment requests</p>
          </div>
          <button 
            onClick={() => setShowNewRequest(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>New Request</span>
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{equipmentRequests.length}</div>
            <div className="text-sm text-blue-100">Total Requests</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{equipmentRequests.filter(r => r.status === 'pending').length}</div>
            <div className="text-sm text-blue-100">Pending</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{equipmentRequests.filter(r => r.status === 'approved').length}</div>
            <div className="text-sm text-blue-100">Approved</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{equipmentRequests.filter(r => r.status === 'rejected').length}</div>
            <div className="text-sm text-blue-100">Rejected</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="forwarded">Forwarded</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              <option value="tool">Tool</option>
              <option value="part">Part</option>
              <option value="equipment">Equipment</option>
              <option value="safety">Safety Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600 mb-6">Start by creating your first equipment request</p>
            <button 
              onClick={() => setShowNewRequest(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create First Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Request</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{request.description.substring(0, 60)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {request.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      ₹{request.estimatedCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto max-h-[95vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">New Equipment Request</h3>
                    <p className="text-blue-100">Fill out the form below to submit your request</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNewRequest(false)}
                  className="text-white hover:text-blue-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEquipmentRequest(
                formData.get('title') as string,
                formData.get('description') as string,
                formData.get('category') as string,
                formData.get('priority') as string,
                formData.get('quantity') as string,
                formData.get('estimatedCost') as string,
                formData.get('reason') as string
              );
            }}>
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Row 1: Title and Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Request Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="title" 
                      type="text" 
                      required
                      placeholder="Enter request title"
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="category" 
                      required
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    >
                      <option value="">Select category</option>
                      <option value="tool">Tool</option>
                      <option value="part">Part</option>
                      <option value="equipment">Equipment</option>
                      <option value="safety">Safety Equipment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                {/* Row 2: Priority and Quantity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Priority Level <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="priority" 
                      required
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="quantity" 
                      type="number" 
                      min="1"
                      required
                      placeholder="Enter quantity"
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    />
                  </div>
                </div>
                
                {/* Row 3: Estimated Cost and Reason */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Estimated Cost (₹) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="estimatedCost" 
                      type="number" 
                      min="0"
                      step="0.01"
                      required
                      placeholder="Enter estimated cost"
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Reason for Request <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="reason" 
                      type="text" 
                      required
                      placeholder="Briefly explain why you need this equipment"
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                    />
                  </div>
                </div>
                
                {/* Row 4: Description (Full Width) */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="description" 
                    rows={5} 
                    required
                    placeholder="Provide a detailed description of the item(s) needed, specifications, and any special requirements..."
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg resize-none"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex space-x-6 p-8 pt-0 border-t-2 border-gray-200 bg-gray-50">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Submit Request
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowNewRequest(false)} 
                  className="flex-1 bg-gray-300 text-gray-700 py-4 px-8 rounded-xl hover:bg-gray-400 transition-colors font-semibold text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopInstructorToolRequests; 