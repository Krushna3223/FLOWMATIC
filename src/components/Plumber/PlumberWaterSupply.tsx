import React, { useEffect, useState } from 'react';
import {
  Droplets, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  Activity,
  Zap
} from 'lucide-react';

// Mock API
const fetchWaterSupplyIssues = async () => [
  {
    id: 1,
    location: 'Hostel Block B',
    issue: 'No water supply',
    severity: 'urgent',
    status: 'in_progress',
    reportedBy: 'Hostel Warden',
    reportedAt: '2024-06-01',
    description: 'Entire block has no water supply due to main line break',
    assignedTo: 'Plumber Team A',
    estimatedCompletion: '2024-06-02',
    completedAt: null,
    waterPressure: '0 PSI',
    tankLevel: '0%',
    notes: 'Emergency water tanker arranged'
  },
  {
    id: 2,
    location: 'Admin Building',
    issue: 'Low water pressure',
    severity: 'medium',
    status: 'pending',
    reportedBy: 'Admin Staff',
    reportedAt: '2024-05-31',
    description: 'Water pressure is very low in all bathrooms',
    assignedTo: 'Plumber Team B',
    estimatedCompletion: '2024-06-03',
    completedAt: null,
    waterPressure: '15 PSI',
    tankLevel: '30%',
    notes: 'May need pump inspection'
  },
  {
    id: 3,
    location: 'Cafeteria',
    issue: 'Water tank leak',
    severity: 'high',
    status: 'resolved',
    reportedBy: 'Kitchen Staff',
    reportedAt: '2024-05-30',
    description: 'Overhead water tank leaking from bottom',
    assignedTo: 'Plumber Team C',
    estimatedCompletion: '2024-05-30',
    completedAt: '2024-05-30 14:30',
    waterPressure: '45 PSI',
    tankLevel: '85%',
    notes: 'Tank repaired and sealed'
  },
  {
    id: 4,
    location: 'Library',
    issue: 'Burst pipe',
    severity: 'urgent',
    status: 'scheduled',
    reportedBy: 'Librarian',
    reportedAt: '2024-05-29',
    description: 'Major water leak from ceiling pipe',
    assignedTo: 'Plumber Team A',
    estimatedCompletion: '2024-06-01',
    completedAt: null,
    waterPressure: '0 PSI',
    tankLevel: '0%',
    notes: 'Water supply shut off to prevent damage'
  },
  {
    id: 5,
    location: 'Sports Complex',
    issue: 'Pump failure',
    severity: 'high',
    status: 'in_progress',
    reportedBy: 'Grounds Keeper',
    reportedAt: '2024-06-01',
    description: 'Water pump not working, affecting showers',
    assignedTo: 'Plumber Team B',
    estimatedCompletion: '2024-06-02',
    completedAt: null,
    waterPressure: '5 PSI',
    tankLevel: '10%',
    notes: 'New pump being installed'
  }
];

const addWaterSupplyIssue = async (data: any) => true;
const updateIssueStatus = async (id: number, status: string) => true;

const PlumberWaterSupply: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [newIssue, setNewIssue] = useState({
    location: '',
    issue: '',
    severity: 'medium',
    reportedBy: '',
    description: '',
    assignedTo: '',
    estimatedCompletion: '',
    waterPressure: '',
    tankLevel: '',
    notes: ''
  });

  useEffect(() => {
    fetchWaterSupplyIssues().then(setIssues);
  }, []);

  const handleAddIssue = async () => {
    if (newIssue.location && newIssue.issue) {
      await addWaterSupplyIssue(newIssue);
      setShowModal(false);
      setNewIssue({
        location: '',
        issue: '',
        severity: 'medium',
        reportedBy: '',
        description: '',
        assignedTo: '',
        estimatedCompletion: '',
        waterPressure: '',
        tankLevel: '',
        notes: ''
      });
      fetchWaterSupplyIssues().then(setIssues);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateIssueStatus(id, status);
    fetchWaterSupplyIssues().then(setIssues);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
      case 'scheduled':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPressureColor = (pressure: string) => {
    const psi = parseInt(pressure);
    if (psi === 0) return 'text-red-600 bg-red-100';
    if (psi < 20) return 'text-orange-600 bg-orange-100';
    if (psi < 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getTankLevelColor = (level: string) => {
    const percent = parseInt(level);
    if (percent === 0) return 'text-red-600 bg-red-100';
    if (percent < 30) return 'text-orange-600 bg-orange-100';
    if (percent < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Water Supply Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage water supply issues, pressure, and tank levels
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
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severity</option>
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

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Water Pressure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tank Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{issue.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{issue.issue}</div>
                      <div className="text-sm text-gray-500">{issue.description}</div>
                      {issue.notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          Note: {issue.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(issue.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPressureColor(issue.waterPressure)}`}>
                        {issue.waterPressure}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Droplets className="w-4 h-4 text-gray-400 mr-2" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTankLevelColor(issue.tankLevel)}`}>
                        {issue.tankLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {issue.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(issue.id, 'scheduled')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Schedule
                      </button>
                    )}
                    {issue.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusUpdate(issue.id, 'in_progress')}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Start
                      </button>
                    )}
                    {issue.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(issue.id, 'resolved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Water Supply Issue</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
            value={newIssue.location}
                    onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Hostel Block B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                  <input
                    type="text"
            value={newIssue.issue}
                    onChange={(e) => setNewIssue({ ...newIssue, issue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., No water supply"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
              value={newIssue.severity}
              onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
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
                    placeholder="e.g., Hostel Warden"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={newIssue.assignedTo}
                    onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Plumber Team A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water Pressure</label>
                  <input
                    type="text"
                    value={newIssue.waterPressure}
                    onChange={(e) => setNewIssue({ ...newIssue, waterPressure: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 0 PSI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tank Level</label>
                  <input
                    type="text"
                    value={newIssue.tankLevel}
                    onChange={(e) => setNewIssue({ ...newIssue, tankLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 0%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed description of the water supply issue..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newIssue.notes}
                    onChange={(e) => setNewIssue({ ...newIssue, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or special requirements..."
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
                  disabled={!newIssue.location || !newIssue.issue}
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

export default PlumberWaterSupply; 