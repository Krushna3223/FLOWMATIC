import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { 
  Zap, 
  AlertTriangle, 
  Wrench, 
  FileText, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Package,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import ElectricianMaintenanceRequests from './ElectricianMaintenanceRequests';

interface MaintenanceComplaint {
  id: string;
  title: string;
  description: string;
  location: string;
  reportedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  category: 'electrical' | 'lighting' | 'power' | 'equipment' | 'other';
  createdAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  notes?: string;
}

interface MaintenanceAlert {
  id: string;
  title: string;
  description: string;
  type: 'scheduled' | 'emergency' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

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
}

interface MaintenanceReport {
  id: string;
  month: string;
  year: string;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  totalAlerts: number;
  completedAlerts: number;
  totalRequests: number;
  approvedRequests: number;
  totalCost: number;
  createdAt: string;
}

const ElectricianDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState<MaintenanceComplaint[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([]);
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showToolRequest, setShowToolRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for maintenance complaints
      const mockComplaints: MaintenanceComplaint[] = [
        {
          id: 'comp-1',
          title: 'Power Outage in Lab 3',
          description: 'Complete power failure in Computer Lab 3, affecting 20 computers',
          location: 'Computer Lab 3',
          reportedBy: 'Lab Assistant',
          priority: 'urgent',
          status: 'in_progress',
          category: 'power',
          createdAt: '2024-01-20'
        },
        {
          id: 'comp-2',
          title: 'Flickering Lights in Corridor',
          description: 'Lights flickering in main corridor near admin block',
          location: 'Main Corridor',
          reportedBy: 'Security Guard',
          priority: 'medium',
          status: 'pending',
          category: 'lighting',
          createdAt: '2024-01-19'
        },
        {
          id: 'comp-3',
          title: 'AC Unit Not Working',
          description: 'Air conditioning unit in staff room not cooling properly',
          location: 'Staff Room',
          reportedBy: 'Admin Staff',
          priority: 'high',
          status: 'resolved',
          category: 'equipment',
          createdAt: '2024-01-18',
          resolvedAt: '2024-01-19'
        }
      ];
      setComplaints(mockComplaints);

      // Mock maintenance alerts
      const mockAlerts: MaintenanceAlert[] = [
        {
          id: 'alert-1',
          title: 'Scheduled Transformer Maintenance',
          description: 'Monthly transformer maintenance due this week',
          type: 'scheduled',
          priority: 'medium',
          location: 'Electrical Room',
          dueDate: '2024-01-25',
          status: 'pending',
          createdAt: '2024-01-15'
        },
        {
          id: 'alert-2',
          title: 'Emergency Circuit Breaker Issue',
          description: 'Circuit breaker showing warning signs, immediate attention required',
          type: 'emergency',
          priority: 'critical',
          location: 'Main Switchboard',
          dueDate: '2024-01-21',
          status: 'in_progress',
          createdAt: '2024-01-20'
        }
      ];
      setAlerts(mockAlerts);

      // Mock tool requests
      const mockToolRequests: ToolRequest[] = [
        {
          id: 'tr-1',
          title: 'New Multimeter',
          description: 'Need new digital multimeter for accurate voltage measurements',
          category: 'tool',
          priority: 'medium',
          status: 'pending',
          requestedBy: 'John Electrician',
          requestedAt: '2024-01-18'
        },
        {
          id: 'tr-2',
          title: 'Circuit Breaker Parts',
          description: 'Replacement parts for main circuit breaker',
          category: 'part',
          priority: 'high',
          status: 'approved',
          requestedBy: 'John Electrician',
          requestedAt: '2024-01-15',
          approvedBy: 'Store Keeper',
          approvedAt: '2024-01-16'
        }
      ];
      setToolRequests(mockToolRequests);

      // Mock maintenance reports
      const mockReports: MaintenanceReport[] = [
        {
          id: 'report-1',
          month: 'January',
          year: '2024',
          totalComplaints: 15,
          resolvedComplaints: 12,
          pendingComplaints: 3,
          totalAlerts: 8,
          completedAlerts: 6,
          totalRequests: 5,
          approvedRequests: 4,
          totalCost: 25000,
          createdAt: '2024-01-31'
        }
      ];
      setReports(mockReports);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintUpdate = async (complaintId: string, status: string, notes?: string) => {
    try {
      setComplaints(prev => prev.map(complaint => 
        complaint.id === complaintId 
          ? { 
              ...complaint, 
              status: status as any, 
              notes,
              resolvedAt: status === 'resolved' ? new Date().toISOString() : complaint.resolvedAt
            }
          : complaint
      ));
      toast.success('Complaint status updated successfully');
    } catch (error) {
      toast.error('Failed to update complaint status');
    }
  };

  const handleToolRequest = async (title: string, description: string, category: string, priority: string) => {
    try {
      const newRequest: ToolRequest = {
        id: `tr-${Date.now()}`,
        title,
        description,
        category: category as any,
        priority: priority as any,
        status: 'pending',
        requestedBy: currentUser?.name || 'Unknown',
        requestedAt: new Date().toISOString()
      };
      
      setToolRequests(prev => [...prev, newRequest]);
      toast.success('Tool request submitted successfully');
      setShowToolRequest(false);
    } catch (error) {
      toast.error('Failed to submit tool request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'electrical': return 'text-blue-600';
      case 'lighting': return 'text-yellow-600';
      case 'power': return 'text-red-600';
      case 'equipment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Electrician Dashboard</h1>
        <p className="text-gray-600">Manage electrical maintenance, complaints, and equipment</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{complaints.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Complaints</p>
              <p className="text-2xl font-bold text-gray-900">
                {complaints.filter(comp => comp.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(alert => alert.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tool Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {toolRequests.filter(request => request.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Zap },
              { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
              { id: 'maintenance-requests', label: 'Maintenance Requests', icon: Wrench },
              { id: 'alerts', label: 'Maintenance Alerts', icon: Bell },
              { id: 'requests', label: 'Tool Requests', icon: Package },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Complaints</h3>
                  <div className="space-y-3">
                    {complaints.slice(0, 3).map((complaint) => (
                      <div key={complaint.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{complaint.title}</p>
                          <p className="text-sm text-gray-600">{complaint.location}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowComplaintForm(true)}
                      className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100"
                    >
                      <p className="font-medium text-blue-800">Update Complaint Status</p>
                      <p className="text-sm text-blue-600">Mark as resolved/pending</p>
                    </button>
                    <button 
                      onClick={() => setShowToolRequest(true)}
                      className="w-full text-left p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100"
                    >
                      <p className="font-medium text-green-800">Request Tools/Parts</p>
                      <p className="text-sm text-green-600">Via Assistant Store Keeper</p>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100">
                      <p className="font-medium text-purple-800">Generate Monthly Report</p>
                      <p className="text-sm text-purple-600">For Principal/Admin</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">View and Update Complaint List</h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{complaint.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Location: {complaint.location}</p>
                        <p className="text-gray-600 mb-2">Reported by: {complaint.reportedBy}</p>
                        <p className="text-gray-600 mb-4">Date: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-800 mb-4">{complaint.description}</p>
                        {complaint.notes && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                            <p className="text-sm text-yellow-800">{complaint.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {complaint.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleComplaintUpdate(complaint.id, 'in_progress')}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Start Work
                            </button>
                            <button
                              onClick={() => handleComplaintUpdate(complaint.id, 'resolved')}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </button>
                          </>
                        )}
                        {complaint.status === 'in_progress' && (
                          <button
                            onClick={() => handleComplaintUpdate(complaint.id, 'resolved')}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </button>
                        )}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Requests Tab */}
          {activeTab === 'maintenance-requests' && (
            <ElectricianMaintenanceRequests />
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">View and Update Maintenance Alerts</h3>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{alert.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Location: {alert.location}</p>
                        <p className="text-gray-600 mb-2">Due Date: {new Date(alert.dueDate).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-4">Date: {new Date(alert.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-800 mb-4">{alert.description}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {alert.status === 'pending' && (
                          <button
                            onClick={() => handleComplaintUpdate(alert.id, 'in_progress')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Start Work
                          </button>
                        )}
                        {alert.status === 'in_progress' && (
                          <button
                            onClick={() => handleComplaintUpdate(alert.id, 'completed')}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Completed
                          </button>
                        )}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">View and Update Tool Requests</h3>
              <div className="space-y-4">
                {toolRequests.map((request) => (
                  <div key={request.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{request.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Requested by: {request.requestedBy}</p>
                        <p className="text-gray-600 mb-2">Requested at: {new Date(request.requestedAt).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-4">Estimated Cost: {request.estimatedCost ? `₹${request.estimatedCost}` : 'N/A'}</p>
                        <p className="text-gray-800 mb-4">{request.description}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleComplaintUpdate(request.id, 'approved')}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                        )}
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleComplaintUpdate(request.id, 'rejected')}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        )}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">View and Update Maintenance Reports</h3>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{report.month} {report.year} Report</h4>
                        </div>
                        <p className="text-gray-600 mb-2">Total Complaints: {report.totalComplaints}</p>
                        <p className="text-gray-600 mb-2">Resolved Complaints: {report.resolvedComplaints}</p>
                        <p className="text-gray-600 mb-2">Pending Complaints: {report.pendingComplaints}</p>
                        <p className="text-gray-600 mb-2">Total Alerts: {report.totalAlerts}</p>
                        <p className="text-gray-600 mb-2">Completed Alerts: {report.completedAlerts}</p>
                        <p className="text-gray-600 mb-2">Total Requests: {report.totalRequests}</p>
                        <p className="text-gray-600 mb-2">Approved Requests: {report.approvedRequests}</p>
                        <p className="text-gray-600 mb-2">Total Cost: ₹{report.totalCost}</p>
                        <p className="text-gray-600 mb-4">Created at: {new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectricianDashboard;