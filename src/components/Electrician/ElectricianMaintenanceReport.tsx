import React, { useEffect, useState } from 'react';
import { FileText, Plus, Calendar, User, MapPin, X } from 'lucide-react';

interface MaintenanceReport {
  id: string;
  title: string;
  description: string;
  location: string;
  equipment: string;
  workType: 'repair' | 'maintenance' | 'inspection' | 'installation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
  reportedBy: string;
  assignedTo: string;
  startDate: string;
  endDate?: string;
  cost: number;
  partsUsed: string[];
  notes: string;
  createdAt: string;
}

// Mock API
const fetchMaintenanceReports = async (): Promise<MaintenanceReport[]> => [
  {
    id: '1',
    title: 'Generator Maintenance',
    description: 'Routine maintenance and inspection of backup generator system',
    location: 'Generator Room',
    equipment: 'Backup Generator 500KVA',
    workType: 'maintenance',
    priority: 'high',
    status: 'completed',
    reportedBy: 'Facility Manager',
    assignedTo: 'John Electrician',
    startDate: '2024-06-01T08:00:00Z',
    endDate: '2024-06-01T16:00:00Z',
    cost: 450,
    partsUsed: ['Oil Filter', 'Air Filter', 'Spark Plugs'],
    notes: 'Generator running smoothly after maintenance. All systems checked and calibrated.',
    createdAt: '2024-06-01T07:30:00Z'
  },
  {
    id: '2',
    title: 'Electrical Panel Upgrade',
    description: 'Upgrading electrical panel in workshop to handle increased load',
    location: 'Workshop Building',
    equipment: 'Main Electrical Panel',
    workType: 'installation',
    priority: 'urgent',
    status: 'in_progress',
    reportedBy: 'Workshop Instructor',
    assignedTo: 'John Electrician',
    startDate: '2024-05-30T09:00:00Z',
    cost: 1200,
    partsUsed: ['Circuit Breakers', 'Bus Bars', 'Panel Box'],
    notes: 'Panel installation in progress. Need to complete wiring connections.',
    createdAt: '2024-05-29T14:00:00Z'
  }
];

const submitMaintenanceReport = async (report: Omit<MaintenanceReport, 'id' | 'createdAt'>): Promise<boolean> => {
  console.log('Submitting maintenance report:', report);
  return true;
};

const ElectricianMaintenanceReport: React.FC = () => {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MaintenanceReport | null>(null);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    location: '',
    equipment: '',
    workType: 'maintenance' as const,
    priority: 'medium' as const,
    status: 'completed' as const,
    assignedTo: 'John Electrician',
    startDate: '',
    endDate: '',
    cost: 0,
    partsUsed: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMaintenanceReports();
        setReports(data);
      } catch (error) {
        console.error('Error loading maintenance reports:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newReport.title || !newReport.description || !newReport.location) {
      return;
    }

    try {
      await submitMaintenanceReport({
        ...newReport,
        reportedBy: 'John Electrician',
        partsUsed: newReport.partsUsed ? newReport.partsUsed.split(',').map(p => p.trim()) : []
      });
      const updatedReports = await fetchMaintenanceReports();
      setReports(updatedReports);
      setShowModal(false);
      setNewReport({
        title: '',
        description: '',
        location: '',
        equipment: '',
        workType: 'maintenance',
        priority: 'medium',
        status: 'completed',
        assignedTo: 'John Electrician',
        startDate: '',
        endDate: '',
        cost: 0,
        partsUsed: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting maintenance report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Maintenance Reports</h1>
        <p className="text-gray-600">Submit and track electrical maintenance activities</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Maintenance Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Maintenance History</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-800">{report.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {report.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {report.assignedTo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.startDate).toLocaleDateString()}
                      </div>
                      {report.cost > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${report.cost}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Equipment:</strong> {report.equipment}
                    </div>
                    {report.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Notes:</strong> {report.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">New Maintenance Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Title
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter work title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the work performed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment
                  </label>
                  <input
                    type="text"
                    value={newReport.equipment}
                    onChange={(e) => setNewReport({ ...newReport, equipment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter equipment name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Type
                  </label>
                  <select
                    value={newReport.workType}
                    onChange={(e) => setNewReport({ ...newReport, workType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="installation">Installation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newReport.priority}
                    onChange={(e) => setNewReport({ ...newReport, priority: e.target.value as any })}
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
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newReport.startDate}
                    onChange={(e) => setNewReport({ ...newReport, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    value={newReport.cost}
                    onChange={(e) => setNewReport({ ...newReport, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newReport.notes}
                  onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about the work"
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
                disabled={!newReport.title || !newReport.description || !newReport.location}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">{selectedReport.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{selectedReport.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{selectedReport.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Equipment:</span>
                  <p className="text-gray-600">{selectedReport.equipment}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cost:</span>
                  <p className="text-gray-600">${selectedReport.cost}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600 capitalize">{selectedReport.status.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedReport.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-600 text-sm">{selectedReport.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricianMaintenanceReport;