import React, { useEffect, useState } from 'react';
import { Cpu, Plus, Calendar, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface TechnologyUpdate {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
}

// Mock API
const fetchTechnologyUpdates = async (): Promise<TechnologyUpdate[]> => [
  {
    id: 1,
    title: 'New CNC Machine Technology',
    description: 'Advanced CNC machines with better precision and automation capabilities for enhanced manufacturing processes.',
    date: '2024-06-01',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 2,
    title: '3D Printer Upgrade',
    description: 'New 3D printing technology for rapid prototyping with improved resolution and material compatibility.',
    date: '2024-05-28',
    status: 'Approved',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Laser Cutting System',
    description: 'Advanced laser cutting system for precise metal and wood cutting applications.',
    date: '2024-05-25',
    status: 'Rejected',
    priority: 'High',
  },
];

const submitTechnologyUpdate = async (update: Omit<TechnologyUpdate, 'id' | 'date' | 'status'>): Promise<boolean> => {
  // Mock API call
  console.log('Submitting technology update:', update);
  return true;
};

const WorkshopInstructorTechnology: React.FC = () => {
  const [updates, setUpdates] = useState<TechnologyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTechnologyUpdates();
        setUpdates(data);
      } catch (error) {
        console.error('Error loading technology updates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!newUpdate.title || !newUpdate.description) {
      return;
    }

    try {
      await submitTechnologyUpdate(newUpdate);
      const updatedUpdates = await fetchTechnologyUpdates();
      setUpdates(updatedUpdates);
      setShowModal(false);
      setNewUpdate({ title: '', description: '', priority: 'Medium' });
    } catch (error) {
      console.error('Error submitting technology update:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Rejected':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">New Machine Technology Updates</h1>
        <p className="text-gray-600">Submit and track new technology proposals for workshop equipment</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Submit Technology Update
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Technology Proposals</h2>
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-medium text-gray-800">{update.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{update.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {update.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(update.status)}`}>
                      {getStatusIcon(update.status)}
                      {update.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(update.priority)}`}>
                      <Zap className="w-4 h-4" />
                      {update.priority}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Submit Technology Update</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technology Title
                </label>
                <input
                  type="text"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter technology title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the technology and its benefits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newUpdate.priority}
                  onChange={(e) => setNewUpdate({ ...newUpdate, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
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
                disabled={!newUpdate.title || !newUpdate.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopInstructorTechnology; 