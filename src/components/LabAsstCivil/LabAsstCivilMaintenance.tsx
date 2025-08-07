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
  HardHat,
  Shield,
  Zap,
  MapPin,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  equipment: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'routine';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  cost?: number;
  location: string;
  notes?: string;
  parts?: string[];
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'maintenance' | 'repair' | 'retired';
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: number; // in days
  manufacturer: string;
  purchaseDate: string;
  warrantyExpiry: string;
}

const LabAsstCivilMaintenance: React.FC = () => {
  const { currentUser } = useAuth();
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tasksRef = ref(database, 'civil_lab_maintenance_tasks');
      const equipmentRef = ref(database, 'civil_lab_equipment');
      
      const [tasksSnapshot, equipmentSnapshot] = await Promise.all([
        get(tasksRef),
        get(equipmentRef)
      ]);
      
      if (tasksSnapshot.exists()) {
        const tasksData = tasksSnapshot.val();
        const tasksArray = Object.entries(tasksData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setMaintenanceTasks(tasksArray);
      } else {
        // Initialize with sample data
        const sampleTasks: MaintenanceTask[] = [
          {
            id: 'task-1',
            title: 'Universal Testing Machine Calibration',
            description: 'Annual calibration of UTM for accurate strength testing',
            equipment: 'Universal Testing Machine',
            type: 'preventive',
            priority: 'high',
            status: 'scheduled',
            assignedTo: 'Lab Technician',
            scheduledDate: '2024-02-15T09:00:00Z',
            estimatedDuration: 4,
            location: 'Civil Lab 1',
            parts: ['Calibration weights', 'Test specimens']
          },
          {
            id: 'task-2',
            title: 'Concrete Mixer Repair',
            description: 'Fix motor issue in concrete mixer',
            equipment: 'Concrete Mixer',
            type: 'corrective',
            priority: 'urgent',
            status: 'in_progress',
            assignedTo: 'Maintenance Engineer',
            scheduledDate: '2024-01-20T10:00:00Z',
            estimatedDuration: 6,
            location: 'Civil Lab 2',
            cost: 15000
          },
          {
            id: 'task-3',
            title: 'Safety Equipment Inspection',
            description: 'Monthly inspection of safety equipment',
            equipment: 'Safety Equipment',
            type: 'routine',
            priority: 'medium',
            status: 'completed',
            assignedTo: 'Safety Officer',
            scheduledDate: '2024-01-15T08:00:00Z',
            completedDate: '2024-01-15T12:00:00Z',
            estimatedDuration: 2,
            actualDuration: 2.5,
            location: 'Civil Lab 1'
          }
        ];
        setMaintenanceTasks(sampleTasks);
      }

      if (equipmentSnapshot.exists()) {
        const equipmentData = equipmentSnapshot.val();
        const equipmentArray = Object.entries(equipmentData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setEquipment(equipmentArray);
      } else {
        // Initialize with sample equipment data
        const sampleEquipment: Equipment[] = [
          {
            id: 'eq-1',
            name: 'Universal Testing Machine',
            type: 'Testing Equipment',
            model: 'UTM-5000',
            serialNumber: 'UTM2024001',
            location: 'Civil Lab 1',
            status: 'operational',
            lastMaintenance: '2024-01-15',
            nextMaintenance: '2024-02-15',
            maintenanceInterval: 30,
            manufacturer: 'Test Equipment Co.',
            purchaseDate: '2022-03-15',
            warrantyExpiry: '2025-03-15'
          },
          {
            id: 'eq-2',
            name: 'Concrete Mixer',
            type: 'Mixing Equipment',
            model: 'CM-200',
            serialNumber: 'CM2024002',
            location: 'Civil Lab 2',
            status: 'maintenance',
            lastMaintenance: '2024-01-10',
            nextMaintenance: '2024-02-10',
            maintenanceInterval: 30,
            manufacturer: 'Mixer Pro',
            purchaseDate: '2021-08-20',
            warrantyExpiry: '2024-08-20'
          }
        ];
        setEquipment(sampleEquipment);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const taskRef = ref(database, `civil_lab_maintenance_tasks/${taskId}`);
      await set(taskRef, {
        ...maintenanceTasks.find(t => t.id === taskId),
        status: newStatus,
        completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      
      setMaintenanceTasks(maintenanceTasks.map(t => 
        t.id === taskId 
          ? { ...t, status: newStatus as any, completedDate: newStatus === 'completed' ? new Date().toISOString() : t.completedDate }
          : t
      ));
      
      toast.success('Maintenance task status updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Shield className="h-4 w-4" />;
      case 'corrective': return <Wrench className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'routine': return <Settings className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesType = filterType === 'all' || task.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Civil Lab Maintenance</h1>
          <p className="text-gray-600">Manage equipment maintenance and repair tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{maintenanceTasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenanceTasks.filter(t => t.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenanceTasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {maintenanceTasks.filter(t => t.status === 'completed').length}
                </p>
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
                placeholder="Search maintenance tasks..."
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
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="emergency">Emergency</option>
              <option value="routine">Routine</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description}</div>
                        <div className="text-xs text-gray-400 mt-1">{task.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{task.equipment}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTypeIcon(task.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{task.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{task.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(task.scheduledDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {task.status === 'scheduled' && (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Details Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Maintenance Task Details</h2>
                <button
                  onClick={() => setSelectedTask(null)}
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
                  <h3 className="font-semibold text-gray-800">{selectedTask.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Equipment:</span>
                    <p className="text-sm text-gray-900">{selectedTask.equipment}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedTask.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedTask.priority}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedTask.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Assigned To:</span>
                    <p className="text-sm text-gray-900">{selectedTask.assignedTo}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <p className="text-sm text-gray-900">{selectedTask.location}</p>
                  </div>
                </div>
                
                {selectedTask.parts && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Required Parts:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTask.parts.map((part, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTask.cost && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Cost:</span>
                    <p className="text-sm text-gray-900">₹{selectedTask.cost.toLocaleString()}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Handle edit functionality
                      setSelectedTask(null);
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

export default LabAsstCivilMaintenance;
