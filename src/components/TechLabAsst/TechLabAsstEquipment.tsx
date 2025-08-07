import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, set, get, remove, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Activity,
  Calendar
} from 'lucide-react';

interface LabEquipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
  addedAt: string;
  lastUpdated: string;
}

const TechLabAsstEquipment: React.FC = () => {
  const { currentUser } = useAuth();
  const [equipment, setEquipment] = useState<LabEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showEditEquipment, setShowEditEquipment] = useState<LabEquipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: '',
    model: '',
    serialNumber: '',
    location: '',
    status: 'available',
    condition: 'good',
    notes: ''
  });

  const equipmentTypes = [
    'Computer',
    'Microscope',
    'Oscilloscope',
    'Multimeter',
    'Power Supply',
    'Function Generator',
    'Soldering Station',
    'PCB Equipment',
    'Testing Equipment',
    'Other'
  ];

  const statuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'in_use', label: 'In Use', color: 'bg-blue-100 text-blue-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'out_of_order', label: 'Out of Order', color: 'bg-red-100 text-red-800' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent', color: 'text-green-600' },
    { value: 'good', label: 'Good', color: 'text-blue-600' },
    { value: 'fair', label: 'Fair', color: 'text-yellow-600' },
    { value: 'poor', label: 'Poor', color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const db = getDatabase();
      const equipmentRef = ref(db, 'labEquipment');
      const snapshot = await get(equipmentRef);
      
      if (snapshot.exists()) {
        const equipmentData = snapshot.val();
        const equipmentArray = Object.keys(equipmentData).map(key => ({
          id: key,
          ...equipmentData[key]
        }));
        setEquipment(equipmentArray);
      } else {
        setEquipment([]);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipmentForm.name || !equipmentForm.type || !equipmentForm.model) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const equipmentRef = ref(db, 'labEquipment');
      const newEquipmentRef = push(equipmentRef);
      
      const equipmentData = {
        ...equipmentForm,
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        addedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await set(newEquipmentRef, equipmentData);
      toast.success('Equipment added successfully');
      setShowAddEquipment(false);
      setEquipmentForm({
        name: '',
        type: '',
        model: '',
        serialNumber: '',
        location: '',
        status: 'available',
        condition: 'good',
        notes: ''
      });
      fetchEquipment();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    }
  };

  const handleUpdateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showEditEquipment) return;

    try {
      const db = getDatabase();
      const equipmentRef = ref(db, `labEquipment/${showEditEquipment.id}`);
      
      const updateData = {
        ...equipmentForm,
        lastUpdated: new Date().toISOString()
      };

      await update(equipmentRef, updateData);
      toast.success('Equipment updated successfully');
      setShowEditEquipment(null);
      setEquipmentForm({
        name: '',
        type: '',
        model: '',
        serialNumber: '',
        location: '',
        status: 'available',
        condition: 'good',
        notes: ''
      });
      fetchEquipment();
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        const db = getDatabase();
        const equipmentRef = ref(db, `labEquipment/${equipmentId}`);
        await remove(equipmentRef);
        toast.success('Equipment deleted successfully');
        fetchEquipment();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        toast.error('Failed to delete equipment');
      }
    }
  };

  const handleEditEquipment = (equipment: LabEquipment) => {
    setShowEditEquipment(equipment);
    setEquipmentForm({
      name: equipment.name,
      type: equipment.type,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      location: equipment.location,
      status: equipment.status,
      condition: equipment.condition,
      notes: equipment.notes
    });
  };

  const handleStatusChange = async (equipmentId: string, newStatus: string) => {
    try {
      const db = getDatabase();
      const equipmentRef = ref(db, `labEquipment/${equipmentId}`);
      await update(equipmentRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      toast.success('Equipment status updated successfully');
      fetchEquipment();
    } catch (error) {
      console.error('Error updating equipment status:', error);
      toast.error('Failed to update equipment status');
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: string) => {
    const conditionObj = conditions.find(c => c.value === condition);
    return conditionObj?.color || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Lab Equipment Management</h1>
              <p className="text-gray-600">Manage technical lab equipment and inventory</p>
            </div>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Equipment
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-1">Model: {item.model}</p>
                    <p className="text-gray-600 mb-1">Type: {item.type}</p>
                    <p className="text-gray-600 mb-1">Serial: {item.serialNumber}</p>
                    <p className="text-gray-600 mb-2">Location: {item.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditEquipment(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-medium ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Last Maintenance: {new Date(item.lastMaintenance).toLocaleDateString()}</p>
                    <p>Next Maintenance: {new Date(item.nextMaintenance).toLocaleDateString()}</p>
                  </div>
                  
                  {item.notes && (
                    <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                  )}
                  
                  <div className="flex space-x-2">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-8">
              <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
              <p className="text-gray-500">Add some equipment to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Equipment</h3>
              <button
                onClick={() => setShowAddEquipment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name *</label>
                <input
                  type="text"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={equipmentForm.type}
                  onChange={(e) => setEquipmentForm({...equipmentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <input
                  type="text"
                  value={equipmentForm.model}
                  onChange={(e) => setEquipmentForm({...equipmentForm, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={equipmentForm.serialNumber}
                  onChange={(e) => setEquipmentForm({...equipmentForm, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={equipmentForm.status}
                    onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={equipmentForm.condition}
                    onChange={(e) => setEquipmentForm({...equipmentForm, condition: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={equipmentForm.notes}
                  onChange={(e) => setEquipmentForm({...equipmentForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Add Equipment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEquipment(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Equipment</h3>
              <button
                onClick={() => setShowEditEquipment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name *</label>
                <input
                  type="text"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={equipmentForm.type}
                  onChange={(e) => setEquipmentForm({...equipmentForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <input
                  type="text"
                  value={equipmentForm.model}
                  onChange={(e) => setEquipmentForm({...equipmentForm, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={equipmentForm.serialNumber}
                  onChange={(e) => setEquipmentForm({...equipmentForm, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={equipmentForm.status}
                    onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={equipmentForm.condition}
                    onChange={(e) => setEquipmentForm({...equipmentForm, condition: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={equipmentForm.notes}
                  onChange={(e) => setEquipmentForm({...equipmentForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update Equipment
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditEquipment(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
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

export default TechLabAsstEquipment; 