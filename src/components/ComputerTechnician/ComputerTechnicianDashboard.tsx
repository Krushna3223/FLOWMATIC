import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Monitor, Wifi, AlertTriangle, FileText, Package, Plus, Search, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ITComplaint {
  id: string;
  title: string;
  description: string;
  category: 'hardware' | 'software' | 'network' | 'printer' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  location: string;
}

interface ComputerEquipmentRequest {
  id: string;
  title: string;
  description: string;
  category: 'computer' | 'laptop' | 'printer' | 'scanner' | 'network' | 'software' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
}

const ComputerTechnicianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState<ITComplaint[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<ComputerEquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEquipmentRequest, setShowEquipmentRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchEquipmentRequests();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const mockComplaints: ITComplaint[] = [
        {
          id: 'comp-1',
          title: 'Computer not starting',
          description: 'Desktop in Lab 3 not booting up, shows blue screen',
          category: 'hardware',
          priority: 'high',
          status: 'in_progress',
          reportedBy: 'Dr. Smith',
          reportedAt: '2024-01-20T09:30:00Z',
          location: 'Computer Lab 3'
        },
        {
          id: 'comp-2',
          title: 'Printer not working',
          description: 'Network printer in Admin office showing offline',
          category: 'printer',
          priority: 'medium',
          status: 'open',
          reportedBy: 'Office Admin',
          reportedAt: '2024-01-20T10:15:00Z',
          location: 'Admin Office'
        }
      ];

      setComplaints(mockComplaints);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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

  // Equipment Request for scalable, multi-institute ERP
  const fetchEquipmentRequests = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: ComputerEquipmentRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          // Only show requests created by this computer technician
          if (request.createdBy === currentUser?.uid && request.type === 'computer') {
            requests.push({
              id: child.key!,
              title: request.title,
              description: request.description,
              category: request.category,
              priority: request.priority,
              status: request.status,
              requestedBy: request.createdByName,
              requestedAt: request.createdAt,
              approvedBy: request.approvedBy,
              approvedAt: request.approvedAt,
              estimatedCost: request.estimatedCost
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

  const handleEquipmentRequest = async (title: string, description: string, category: string, priority: string) => {
    try {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;
      const instituteId = (currentUser as any)?.instituteId || 'default_institute';
      const newRequestRef = push(ref(db, 'equipmentRequests'));
      const newRequest = {
        id: newRequestRef.key,
        instituteId,
        type: 'computer',
        title,
        description,
        category,
        priority,
        status: 'pending',
        createdBy: currentUser?.uid || user?.uid || 'unknown',
        createdByName: currentUser?.name || user?.displayName || 'Computer Technician',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'asst_store',
        approvalFlow: ['computer_technician', 'asst_store', 'registrar'],
        history: [
          {
            action: 'created',
            by: currentUser?.uid || user?.uid || 'unknown',
            at: new Date().toISOString(),
            role: 'computer_technician',
          }
        ]
      };
      await set(newRequestRef, newRequest);
      toast.success('Computer equipment request submitted successfully');
      setShowEquipmentRequest(false);
      // Refresh the requests list after submitting
      await fetchEquipmentRequests();
    } catch (error) {
      toast.error('Failed to submit computer equipment request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const openComplaints = complaints.filter(c => c.status === 'open').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Computer Technician Dashboard</h1>
          <p className="text-gray-600">Manage IT support, network issues, and computer lab setup</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Complaints</p>
                <p className="text-2xl font-semibold text-gray-900">{openComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{inProgressComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{resolvedComplaints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'complaints', label: 'IT Complaints', icon: AlertTriangle },
              { id: 'network', label: 'Network Issues', icon: Wifi },
              { id: 'requests', label: 'Equipment Requests', icon: Package },
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

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent IT Complaints</h3>
              <div className="space-y-4">
                {complaints.slice(0, 3).map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{complaint.title}</h4>
                        <p className="text-gray-600">{complaint.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Location: {complaint.location}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Reported by: {complaint.reportedBy}</span>
                      <span>{new Date(complaint.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">IT Complaints</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{complaint.title}</h4>
                        <p className="text-gray-600">{complaint.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Location: {complaint.location}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Reported by: {complaint.reportedBy}</span>
                      <span>{new Date(complaint.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Network Issues</h3>
              <p className="text-gray-600">Network issues management will be implemented here.</p>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Computer Equipment Requests</h3>
                <button 
                  onClick={() => setShowEquipmentRequest(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </button>
              </div>

              <div className="space-y-4">
                {equipmentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No equipment requests found</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first equipment request</p>
                  </div>
                ) : (
                  equipmentRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{request.title}</h4>
                          <p className="text-gray-600">{request.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Category: {request.category}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'approved' ? 'bg-green-100 text-green-600' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            request.status === 'ordered' ? 'bg-blue-100 text-blue-600' :
                            request.status === 'received' ? 'bg-purple-100 text-purple-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {request.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Requested by: {request.requestedBy}</span>
                        <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Request Modal */}
      {showEquipmentRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Computer Equipment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEquipmentRequest(
                formData.get('title') as string,
                formData.get('description') as string,
                formData.get('category') as string,
                formData.get('priority') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Title</label>
                  <input name="title" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="computer">Computer</option>
                    <option value="laptop">Laptop</option>
                    <option value="printer">Printer</option>
                    <option value="scanner">Scanner</option>
                    <option value="network">Network Equipment</option>
                    <option value="software">Software</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select name="priority" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Submit Request
                  </button>
                  <button type="button" onClick={() => setShowEquipmentRequest(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerTechnicianDashboard; 