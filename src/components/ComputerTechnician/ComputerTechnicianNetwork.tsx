import React, { useEffect, useState } from 'react';
import { 
  Wifi, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  User,
  Activity
} from 'lucide-react';

// Mock API
const fetchNetworkIssues = async () => [
  {
    id: 1,
    title: 'WiFi connectivity issue',
    description: 'No internet access in admin block, students unable to connect to network',
    status: 'in_progress',
    priority: 'high',
    location: 'Admin Block',
    reportedBy: 'Office Staff',
    reportedAt: '2024-06-01',
    assignedTo: 'Network Team A',
    estimatedResolution: '2024-06-02',
    notes: 'Router configuration needs to be checked'
  },
  {
    id: 2,
    title: 'LAN connection down',
    description: 'Computer lab network not working, all computers offline',
    status: 'resolved',
    priority: 'medium',
    location: 'Computer Lab 101',
    reportedBy: 'Lab Assistant',
    reportedAt: '2024-05-30',
    assignedTo: 'Network Team B',
    estimatedResolution: '2024-05-30',
    notes: 'Switch replaced, all connections restored'
  },
  {
    id: 3,
    title: 'Slow network speed',
    description: 'Internet speed very slow in library area',
    status: 'open',
    priority: 'low',
    location: 'Library',
    reportedBy: 'Librarian',
    reportedAt: '2024-06-01',
    assignedTo: 'Network Team A',
    estimatedResolution: '2024-06-03',
    notes: 'Bandwidth allocation issue suspected'
  },
  {
    id: 4,
    title: 'Printer network error',
    description: 'Network printer showing offline status',
    status: 'in_progress',
    priority: 'medium',
    location: 'Printing Room',
    reportedBy: 'Admin Staff',
    reportedAt: '2024-05-31',
    assignedTo: 'Network Team C',
    estimatedResolution: '2024-06-02',
    notes: 'IP address conflict detected'
  },
  {
    id: 5,
    title: 'VPN connection failed',
    description: 'Remote access VPN not working for faculty',
    status: 'open',
    priority: 'high',
    location: 'Faculty Block',
    reportedBy: 'IT Department',
    reportedAt: '2024-06-01',
    assignedTo: 'Network Team A',
    estimatedResolution: '2024-06-02',
    notes: 'Server certificate expired'
  }
];

const addNetworkIssue = async (data: any) => true;
const updateIssueStatus = async (id: number, status: string) => true;

const ComputerTechnicianNetwork: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    reportedBy: '',
    assignedTo: '',
    estimatedResolution: '',
    notes: ''
  });

  useEffect(() => {
    fetchNetworkIssues().then(setIssues);
  }, []);

  const handleAddIssue = async () => {
    if (newIssue.title && newIssue.description) {
      await addNetworkIssue(newIssue);
      setShowModal(false);
      setNewIssue({
        title: '',
        description: '',
        location: '',
        priority: 'medium',
        reportedBy: '',
        assignedTo: '',
        estimatedResolution: '',
        notes: ''
      });
      fetchNetworkIssues().then(setIssues);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateIssueStatus(id, status);
    fetchNetworkIssues().then(setIssues);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'open':
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
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network & Device Issues</h1>
          <p className="text-gray-600 mt-2">
            Track and manage network connectivity issues and device problems
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Issue
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search issues..."
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
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
            {filteredIssues.length} of {issues.length} issues
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Wifi className="w-6 h-6 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                    <p className="text-sm text-gray-500">{issue.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                  <div className="flex items-center">
                    {getStatusIcon(issue.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700">{issue.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Reported by: <span className="font-medium">{issue.reportedBy}</span></span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Location: <span className="font-medium">{issue.location}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Assigned to: <span className="font-medium">{issue.assignedTo}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Est. Resolution: <span className="font-medium">{issue.estimatedResolution}</span></span>
                  </div>
                </div>

                {issue.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {issue.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t">
                  {issue.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate(issue.id, 'in_progress')}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Start Work
                    </button>
                  )}
                  {issue.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate(issue.id, 'resolved')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Network Issue</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                  <input
                    type="text"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., WiFi connectivity issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed description of the issue..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newIssue.location}
                    onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer Lab 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                  <input
                    type="text"
                    value={newIssue.reportedBy}
                    onChange={(e) => setNewIssue({ ...newIssue, reportedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lab Assistant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={newIssue.assignedTo}
                    onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Network Team A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Resolution</label>
                  <input
                    type="date"
                    value={newIssue.estimatedResolution}
                    onChange={(e) => setNewIssue({ ...newIssue, estimatedResolution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newIssue.notes}
                    onChange={(e) => setNewIssue({ ...newIssue, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or observations..."
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
                  onClick={handleAddIssue}
                  disabled={!newIssue.title || !newIssue.description}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerTechnicianNetwork; 