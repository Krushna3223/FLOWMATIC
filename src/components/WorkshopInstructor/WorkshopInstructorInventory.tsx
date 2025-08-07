import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  location: string;
  status: 'Working' | 'Not Working' | 'Under Maintenance';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastMaintenance: string;
  nextMaintenance: string;
  category: string;
  assignedTo?: string;
  notes?: string;
}

const WorkshopInstructorInventory: React.FC = () => {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    serialNumber: '',
    location: '',
    category: '',
    condition: 'Good' as const,
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      // Mock data
      const mockInventory: Equipment[] = [
        {
          id: '1',
          name: 'Lathe Machine',
          serialNumber: 'LAT001',
          location: 'Workshop A',
          status: 'Working',
          condition: 'Good',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15',
          category: 'Machine Tools',
          assignedTo: 'John Smith'
        },
        {
          id: '2',
          name: 'Drilling Machine',
          serialNumber: 'DRI002',
          location: 'Workshop B',
          status: 'Under Maintenance',
          condition: 'Fair',
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-02-10',
          category: 'Machine Tools'
        },
        {
          id: '3',
          name: 'Welding Machine',
          serialNumber: 'WEL003',
          location: 'Workshop A',
          status: 'Working',
          condition: 'Excellent',
          lastMaintenance: '2024-01-20',
          nextMaintenance: '2024-02-20',
          category: 'Welding Equipment',
          assignedTo: 'Mike Johnson'
        },
        {
          id: '4',
          name: 'Safety Goggles',
          serialNumber: 'SAF004',
          location: 'Safety Cabinet',
          status: 'Working',
          condition: 'Good',
          lastMaintenance: '2024-01-25',
          nextMaintenance: '2024-02-25',
          category: 'Safety Equipment'
        }
      ];
      setInventory(mockInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Equipment['status']) => {
    try {
      setInventory(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
      toast.success('Equipment status updated successfully');
    } catch (error) {
      toast.error('Failed to update equipment status');
    }
  };

  const handleAddEquipment = async () => {
    try {
      const newItem: Equipment = {
        id: Date.now().toString(),
        ...newEquipment,
        status: 'Working',
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: newEquipment.category || 'General'
      };
      
      setInventory(prev => [...prev, newItem]);
      setNewEquipment({
        name: '',
        serialNumber: '',
        location: '',
        category: '',
        condition: 'Good',
        notes: ''
      });
      setShowAddModal(false);
      toast.success('Equipment added successfully');
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working': return 'text-green-600 bg-green-100';
      case 'Under Maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'Not Working': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Equipment Inventory</h1>
        <p className="text-gray-600">Manage and track workshop equipment status</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Working">Working</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Not Working">Not Working</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">SN: {item.serialNumber}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.location}</div>
                    {item.assignedTo && (
                      <div className="text-sm text-gray-500">→ {item.assignedTo}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Last: {new Date(item.lastMaintenance).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">Next: {new Date(item.nextMaintenance).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                    onClick={() => handleStatusChange(item.id, 'Working')}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as Working"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'Under Maintenance')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Mark as Under Maintenance"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                      <button
                    onClick={() => handleStatusChange(item.id, 'Not Working')}
                        className="text-red-600 hover:text-red-900"
                        title="Mark as Not Working"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Equipment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddEquipment();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name</label>
                  <input
                    type="text"
            value={newEquipment.name}
                    onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input
                    type="text"
            value={newEquipment.serialNumber}
                    onChange={(e) => setNewEquipment({...newEquipment, serialNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
            value={newEquipment.location}
                    onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={newEquipment.category}
                    onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Machine Tools, Safety Equipment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
            value={newEquipment.condition}
                    onChange={(e) => setNewEquipment({...newEquipment, condition: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Add Equipment
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
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

export default WorkshopInstructorInventory; 