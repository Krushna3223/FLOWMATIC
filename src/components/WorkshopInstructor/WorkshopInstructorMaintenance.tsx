import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Calendar, User, DollarSign, CheckCircle, Clock } from 'lucide-react';

interface MaintenanceLog {
  id: number;
  equipment: string;
  issue: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  technician: string;
  cost: number;
}

// Mock API
const fetchMaintenanceLog = async (): Promise<MaintenanceLog[]> => [
  {
    id: 1,
    equipment: 'Lathe Machine',
    issue: 'Belt replacement needed',
    date: '2024-06-01',
    status: 'Completed',
    technician: 'John Doe',
    cost: 500,
  },
  {
    id: 2,
    equipment: 'Drilling Machine',
    issue: 'Motor malfunction',
    date: '2024-05-28',
    status: 'In Progress',
    technician: 'Jane Smith',
    cost: 1200,
  },
  {
    id: 3,
    equipment: 'CNC Machine',
    issue: 'Software update required',
    date: '2024-05-25',
    status: 'Pending',
    technician: 'Mike Johnson',
    cost: 300,
  },
];

const submitMaintenanceLog = async (log: Omit<MaintenanceLog, 'id' | 'date' | 'status'>): Promise<boolean> => {
  // Mock API call
  console.log('Submitting maintenance log:', log);
  return true;
};

const WorkshopInstructorMaintenance: React.FC = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({
    equipment: '',
    issue: '',
    technician: '',
    cost: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMaintenanceLog();
        setLogs(data);
      } catch (error) {
        console.error('Error loading maintenance logs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newLog.equipment || !newLog.issue || !newLog.technician) {
      return;
    }

    try {
      await submitMaintenanceLog(newLog);
      const updatedLogs = await fetchMaintenanceLog();
      setLogs(updatedLogs);
      setShowModal(false);
      setNewLog({ equipment: '', issue: '', technician: '', cost: 0 });
    } catch (error) {
      console.error('Error submitting maintenance log:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Equipment Maintenance Log</h1>
        <p className="text-gray-600">Track and manage equipment maintenance activities</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Maintenance Entry
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Maintenance Records</h2>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-800">{log.equipment}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{log.issue}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {log.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.technician}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${log.cost}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      {log.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Maintenance Entry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <input
                  type="text"
                  value={newLog.equipment}
                  onChange={(e) => setNewLog({ ...newLog, equipment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter equipment name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Description
                </label>
                <textarea
                  value={newLog.issue}
                  onChange={(e) => setNewLog({ ...newLog, issue: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the maintenance issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technician
                </label>
                <input
                  type="text"
                  value={newLog.technician}
                  onChange={(e) => setNewLog({ ...newLog, technician: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter technician name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost ($)
                </label>
                <input
                  type="number"
                  value={newLog.cost}
                  onChange={(e) => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
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
                disabled={!newLog.equipment || !newLog.issue || !newLog.technician}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopInstructorMaintenance; 