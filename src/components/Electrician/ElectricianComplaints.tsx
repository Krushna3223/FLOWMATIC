import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Calendar, User, MapPin, Clock, CheckCircle, XCircle, Eye, Edit, Search } from 'lucide-react';

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

// Mock API
const fetchComplaints = async (): Promise<MaintenanceComplaint[]> => [
  {
    id: '1',
    title: 'Power Outage in Computer Lab',
    description: 'Complete power failure in computer lab 101, affecting 20 computers. Students unable to work.',
    location: 'Computer Lab 101',
    reportedBy: 'Dr. Sarah Johnson',
    priority: 'urgent',
    status: 'in_progress',
    category: 'power',
    createdAt: '2024-06-01T10:30:00Z',
    assignedTo: 'John Electrician',
    notes: 'Checking main circuit breaker and wiring connections'
  },
  {
    id: '2',
    title: 'Flickering Lights in Library',
    description: 'Lights in the main library area are flickering intermittently, causing eye strain for students.',
    location: 'Main Library',
    reportedBy: 'Librarian Mike Chen',
    priority: 'medium',
    status: 'assigned',
    category: 'lighting',
    createdAt: '2024-05-30T14:15:00Z',
    assignedTo: 'John Electrician'
  },
  {
    id: '3',
    title: 'Electrical Panel Overheating',
    description: 'Electrical panel in the workshop showing signs of overheating. Safety concern.',
    location: 'Workshop Building',
    reportedBy: 'Workshop Instructor',
    priority: 'high',
    status: 'resolved',
    category: 'electrical',
    createdAt: '2024-05-29T09:00:00Z',
    resolvedAt: '2024-05-29T16:30:00Z',
    notes: 'Replaced faulty circuit breaker and cleaned panel connections'
  },
  {
    id: '4',
    title: 'Broken Power Socket',
    description: 'Power socket in classroom 205 is not working. Students cannot charge laptops.',
    location: 'Classroom 205',
    reportedBy: 'Prof. David Wilson',
    priority: 'low',
    status: 'pending',
    category: 'equipment',
    createdAt: '2024-05-28T11:45:00Z'
  }
];

const updateComplaintStatus = async (complaintId: string, status: string, notes?: string): Promise<boolean> => {
  // Mock API call
  console.log('Updating complaint:', { complaintId, status, notes });
  return true;
};

const ElectricianComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<MaintenanceComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<MaintenanceComplaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Error loading complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusUpdate = async (complaintId: string, newStatus: string, notes?: string) => {
    try {
      await updateComplaintStatus(complaintId, newStatus, notes);
      const updatedComplaints = complaints.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, status: newStatus as any, notes, resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : complaint.resolvedAt }
          : complaint
      );
      setComplaints(updatedComplaints);
      setShowModal(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
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
      case 'electrical':
        return 'bg-purple-100 text-purple-800';
      case 'lighting':
        return 'bg-blue-100 text-blue-800';
      case 'power':
        return 'bg-red-100 text-red-800';
      case 'equipment':
        return 'bg-green-100 text-green-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Maintenance Complaints</h1>
        <p className="text-gray-600">Manage and resolve electrical maintenance issues</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Electrical Complaints</h2>
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-medium text-gray-800">{complaint.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{complaint.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {complaint.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {complaint.reportedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                      {complaint.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Assigned: {complaint.assignedTo}
                        </div>
                      )}
                    </div>
                    {complaint.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Notes:</strong> {complaint.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                      {complaint.category}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Update Complaint Status</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Complaint:</strong> {selectedComplaint.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Current Status:</strong> {selectedComplaint.status.replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about the status update..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedComplaint(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const statusSelect = document.getElementById('status') as HTMLSelectElement;
                  const notesTextarea = document.getElementById('notes') as HTMLTextAreaElement;
                  handleStatusUpdate(
                    selectedComplaint.id,
                    statusSelect.value,
                    notesTextarea.value || undefined
                  );
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricianComplaints; 