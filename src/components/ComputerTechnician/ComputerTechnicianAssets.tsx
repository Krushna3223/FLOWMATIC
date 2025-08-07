import React, { useEffect, useState } from 'react';
import { 
  Monitor, 
  Printer, 
  Projector, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  MapPin,
  Settings,
  Activity,
  Database
} from 'lucide-react';

// Mock API
const fetchAssets = async () => [
  {
    id: 1,
    asset: 'Computer PC001',
    tag: 'PC001',
    location: 'Computer Lab 101',
    status: 'Working',
    lastMaintenance: '2024-06-01',
    type: 'Desktop',
    assignedTo: 'Lab Assistant',
    purchaseDate: '2023-01-15',
    warranty: '2025-01-15',
    specifications: 'Intel i5, 8GB RAM, 256GB SSD'
  },
  {
    id: 2,
    asset: 'Printer PR001',
    tag: 'PR001',
    location: 'Admin Block',
    status: 'Needs Repair',
    lastMaintenance: '2024-05-15',
    type: 'Printer',
    assignedTo: 'Office Staff',
    purchaseDate: '2022-08-20',
    warranty: '2024-08-20',
    specifications: 'HP LaserJet Pro, Network Enabled'
  },
  {
    id: 3,
    asset: 'Projector PJ001',
    tag: 'PJ001',
    location: 'Conference Room',
    status: 'Working',
    lastMaintenance: '2024-05-20',
    type: 'Projector',
    assignedTo: 'IT Department',
    purchaseDate: '2023-03-10',
    warranty: '2025-03-10',
    specifications: 'Epson, 3500 Lumens, HD'
  },
  {
    id: 4,
    asset: 'Laptop LP001',
    tag: 'LP001',
    location: 'Faculty Room 205',
    status: 'Under Maintenance',
    lastMaintenance: '2024-05-25',
    type: 'Laptop',
    assignedTo: 'Prof. Johnson',
    purchaseDate: '2023-06-15',
    warranty: '2025-06-15',
    specifications: 'Dell Latitude, Intel i7, 16GB RAM'
  },
  {
    id: 5,
    asset: 'Scanner SC001',
    tag: 'SC001',
    location: 'Library',
    status: 'Working',
    lastMaintenance: '2024-04-10',
    type: 'Scanner',
    assignedTo: 'Librarian',
    purchaseDate: '2022-11-05',
    warranty: '2024-11-05',
    specifications: 'Canon, A4, 600 DPI'
  }
];

const updateAssetStatus = async (id: number, status: string) => true;
const addAsset = async (asset: any) => true;

const ComputerTechnicianAssets: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newAsset, setNewAsset] = useState({
    asset: '',
    tag: '',
    location: '',
    type: '',
    assignedTo: '',
    purchaseDate: '',
    warranty: '',
    specifications: ''
  });

  useEffect(() => {
    fetchAssets().then(setAssets);
  }, []);

  const handleAddAsset = async () => {
    if (newAsset.asset && newAsset.tag && newAsset.location) {
      await addAsset(newAsset);
      setShowModal(false);
      setNewAsset({
        asset: '',
        tag: '',
        location: '',
        type: '',
        assignedTo: '',
        purchaseDate: '',
        warranty: '',
        specifications: ''
      });
      fetchAssets().then(setAssets);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateAssetStatus(id, status);
    fetchAssets().then(setAssets);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'Needs Repair':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'Under Maintenance':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Working':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Needs Repair':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Under Maintenance':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Desktop':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'Laptop':
        return <Monitor className="w-4 h-4 text-green-500" />;
      case 'Printer':
        return <Printer className="w-4 h-4 text-orange-500" />;
      case 'Projector':
        return <Projector className="w-4 h-4 text-purple-500" />;
      case 'Scanner':
        return <Database className="w-4 h-4 text-indigo-500" />;
      default:
        return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Assets Management</h1>
          <p className="text-gray-600 mt-2">
            Track and manage IT hardware inventory and asset status
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assets..."
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
            <option value="Working">Working</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Desktop">Desktop</option>
            <option value="Laptop">Laptop</option>
            <option value="Printer">Printer</option>
            <option value="Projector">Projector</option>
            <option value="Scanner">Scanner</option>
          </select>
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredAssets.length} of {assets.length} assets
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getTypeIcon(asset.type)}
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{asset.asset}</h3>
                    <p className="text-sm text-gray-500">Tag: {asset.tag}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(asset.status)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Location: <span className="font-medium">{asset.location}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Assigned to: <span className="font-medium">{asset.assignedTo}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Last Maintenance: <span className="font-medium">{asset.lastMaintenance}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Type: <span className="font-medium">{asset.type}</span></span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Specifications:</span> {asset.specifications}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Purchase Date:</span> {asset.purchaseDate}
                  </div>
                  <div>
                    <span className="font-medium">Warranty Until:</span> {asset.warranty}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t">
                  {asset.status === 'Needs Repair' && (
                    <button
                      onClick={() => handleStatusUpdate(asset.id, 'Under Maintenance')}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Start Maintenance
                    </button>
                  )}
                  {asset.status === 'Under Maintenance' && (
                    <button
                      onClick={() => handleStatusUpdate(asset.id, 'Working')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Mark Working
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Asset</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={newAsset.asset}
                    onChange={(e) => setNewAsset({ ...newAsset, asset: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer PC001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag</label>
                  <input
                    type="text"
                    value={newAsset.tag}
                    onChange={(e) => setNewAsset({ ...newAsset, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PC001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer Lab 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Printer">Printer</option>
                    <option value="Projector">Projector</option>
                    <option value="Scanner">Scanner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={newAsset.assignedTo}
                    onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lab Assistant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={newAsset.purchaseDate}
                    onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Until</label>
                  <input
                    type="date"
                    value={newAsset.warranty}
                    onChange={(e) => setNewAsset({ ...newAsset, warranty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                  <textarea
                    value={newAsset.specifications}
                    onChange={(e) => setNewAsset({ ...newAsset, specifications: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Intel i5, 8GB RAM, 256GB SSD"
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
                  onClick={handleAddAsset}
                  disabled={!newAsset.asset || !newAsset.tag || !newAsset.location}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerTechnicianAssets; 