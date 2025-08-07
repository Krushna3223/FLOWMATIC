import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getDatabase, ref, get, set, update, push } from 'firebase/database';
import { 
  Package, AlertTriangle, CheckCircle, XCircle, Clock, Search, Plus, BarChart3, Download,
  Wrench, FlaskConical, HardHat, Shield, Zap, Database, FileText, MessageSquare,
  Users, Calendar, Bell, Settings, TrendingUp, DollarSign, Eye, Edit, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';



interface StockRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'forwarded_to_principal';
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
  quantity: number;
  reason: string;
  department: string;
  location: string;
  urgency: string;
  impact: string;
  currentApproverRole: string;
  approvalFlow: string[];
  history: Array<{
    action: string;
    by: string;
    at: string;
    role: string;
  }>;
}

interface EquipmentRequest {
  id: string;
  instituteId: string;
  type: 'workshop' | 'lab' | 'computer';
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'forwarded';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: string[];
  history: Array<{
    action: string;
    by: string;
    at: string;
    role: string;
  }>;
}

interface ToolRequest {
  id: string;
  title: string;
  description: string;
  category: 'tool' | 'part' | 'equipment' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received' | 'forwarded_to_principal';
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
  quantity: number;
  reason: string;
  department: string;
  location: string;
  urgency: string;
  impact: string;
  currentApproverRole: string;
  approvalFlow: string[];
  history: Array<{
    action: string;
    by: string;
    at: string;
    role: string;
  }>;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  supplier?: string;
  cost?: number;
  lastRestocked?: string;
  expiryDate?: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  notes?: string;
}

const AsstStoreDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToolRequestModal, setShowToolRequestModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    location: '',
    supplier: '',
    cost: 0,
    condition: 'good' as const,
    notes: ''
  });
  const [newToolRequest, setNewToolRequest] = useState({
    title: '',
    description: '',
    category: 'tool' as const,
    priority: 'medium' as const,
    quantity: 1,
    reason: '',
    estimatedCost: 0,
    department: '',
    location: '',
    urgency: '',
    impact: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Set active tab based on current URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/inventory')) {
      setActiveTab('inventory');
    } else if (path.includes('/requests')) {
      setActiveTab('requests');
    } else if (path.includes('/tools')) {
      setActiveTab('tools');
    } else if (path.includes('/reports')) {
      setActiveTab('reports');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const db = getDatabase();
      
      // Fetch real-time inventory data
      await fetchInventoryData();
      
      // Fetch real-time stock requests
      await fetchStockRequestsData();
      
      // Fetch equipment requests
      await fetchEquipmentRequests();
      
      // Fetch tool requests
      await fetchToolRequests();
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const db = getDatabase();
      const inventoryRef = ref(db, 'inventory');
      const snapshot = await get(inventoryRef);
      
      if (snapshot.exists()) {
        const inventoryData: InventoryItem[] = [];
        snapshot.forEach((child) => {
          const item = child.val();
          inventoryData.push({
            id: child.key!,
            ...item
          });
        });
        setInventory(inventoryData);
      } else {
        // Initialize with sample data if no inventory exists
        const sampleInventory: InventoryItem[] = [
          {
            id: 'inv-1',
            name: 'Safety Helmets',
            category: 'safety',
            quantity: 25,
            minQuantity: 10,
            location: 'Safety Cabinet A',
            status: 'available',
            lastUpdated: new Date().toISOString(),
            supplier: 'Safety Gear Co.',
            cost: 150,
            condition: 'good',
            notes: 'Regular safety equipment'
          },
          {
            id: 'inv-2',
            name: 'Welding Machines',
            category: 'equipment',
            quantity: 3,
            minQuantity: 5,
            location: 'Equipment Room B',
            status: 'low_stock',
            lastUpdated: new Date().toISOString(),
            supplier: 'Industrial Tools Ltd.',
            cost: 2500,
            condition: 'good',
            notes: 'Professional welding equipment'
          },
          {
            id: 'inv-3',
            name: 'Cutting Tools',
            category: 'tools',
            quantity: 0,
            minQuantity: 15,
            location: 'Tool Cabinet C',
            status: 'out_of_stock',
            lastUpdated: new Date().toISOString(),
            supplier: 'Tool Master Inc.',
            cost: 75,
            condition: 'fair',
            notes: 'Various cutting tools'
          }
        ];
        setInventory(sampleInventory);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to fetch inventory data');
    }
  };

  const fetchStockRequestsData = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'stockRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requestsData: StockRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          requestsData.push({
            id: child.key!,
            ...request
          });
        });
        setStockRequests(requestsData);
      } else {
        // Initialize with sample data if no requests exist
        const sampleRequests: StockRequest[] = [
          {
            id: 'req-1',
            title: 'New Safety Helmets',
            description: 'Need 20 new safety helmets for workshop safety compliance',
            category: 'safety',
            priority: 'high',
            status: 'pending',
            requestedBy: 'workshop-instructor-1',
            requestedByName: 'Workshop Instructor',
            requestedAt: new Date().toISOString(),
            quantity: 20,
            reason: 'Workshop safety compliance requirements',
            department: 'Workshop Department',
            location: 'Main Workshop',
            urgency: 'High - Required for safety compliance',
            impact: 'Workshop activities may be halted',
            currentApproverRole: 'asst_store',
            approvalFlow: ['workshop_instructor', 'asst_store', 'principal'],
            history: [{
              action: 'Request submitted',
              by: 'Workshop Instructor',
              at: new Date().toISOString(),
              role: 'workshop_instructor'
            }]
          },
          {
            id: 'req-2',
            title: 'Welding Machine Parts',
            description: 'Replacement parts for welding machine maintenance',
            category: 'equipment',
            priority: 'medium',
            status: 'approved',
            requestedBy: 'electrician-1',
            requestedByName: 'Electrician',
            requestedAt: new Date().toISOString(),
            quantity: 5,
            reason: 'Regular maintenance of welding equipment',
            department: 'Electrical Department',
            location: 'Electrical Workshop',
            urgency: 'Medium - Needed for equipment maintenance',
            impact: 'Welding operations may be affected',
            currentApproverRole: 'asst_store',
            approvalFlow: ['electrician', 'asst_store', 'principal'],
            history: [{
              action: 'Request submitted',
              by: 'Electrician',
              at: new Date().toISOString(),
              role: 'electrician'
            }, {
              action: 'Request approved',
              by: 'Assistant Store Keeper',
              at: new Date().toISOString(),
              role: 'asst_store'
            }]
          }
        ];
        setStockRequests(sampleRequests);
      }
    } catch (error) {
      console.error('Error fetching stock requests:', error);
      toast.error('Failed to fetch stock requests');
    }
  };

  const fetchToolRequests = async () => {
    try {
      const db = getDatabase();
      const toolRequestsRef = ref(db, 'toolRequests');
      const snapshot = await get(toolRequestsRef);
      
      if (snapshot.exists()) {
        const requestsData: ToolRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          requestsData.push({
            id: child.key!,
            ...request
          });
        });
        setToolRequests(requestsData);
      } else {
        setToolRequests([]);
      }
    } catch (error) {
      console.error('Error fetching tool requests:', error);
      toast.error('Failed to fetch tool requests');
    }
  };

  const handleStockRequestUpdate = async (requestId: string, action: 'approve' | 'reject' | 'forward_to_principal') => {
    try {
      const db = getDatabase();
      const requestRef = ref(db, `stockRequests/${requestId}`);
      const request = stockRequests.find(r => r.id === requestId);
      
      if (!request) return;

      let updateData: any = {
        approvedBy: currentUser?.uid || 'unknown',
        approvedAt: new Date().toISOString(),
        history: [
          ...request.history,
          {
            action: action === 'approve' ? 'Request approved' : action === 'reject' ? 'Request rejected' : 'Request forwarded to Principal',
            by: currentUser?.email?.split('@')[0] || 'Assistant Store Keeper',
            at: new Date().toISOString(),
            role: 'asst_store'
          }
        ]
      };

      if (action === 'approve') {
        updateData.status = 'approved';
      } else if (action === 'reject') {
        updateData.status = 'rejected';
      } else if (action === 'forward_to_principal') {
        updateData.status = 'forwarded_to_principal';
        updateData.currentApproverRole = 'principal';
      }

      await update(requestRef, updateData);
      
      toast.success(`Stock request ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'forwarded to Principal'} successfully`);
      await fetchStockRequestsData();
    } catch (error) {
      console.error('Error updating stock request:', error);
      toast.error('Failed to update stock request status');
    }
  };

  // Fetch equipment requests for approval
  const fetchEquipmentRequests = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: EquipmentRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          // Only show requests that need assistant store approval
          if (request.currentApproverRole === 'asst_store' && request.status === 'pending') {
            requests.push({
              id: child.key!,
              ...request
            });
          }
        });
        setEquipmentRequests(requests);
      } else {
        setEquipmentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching equipment requests:', error);
      toast.error('Failed to fetch equipment requests');
    }
  };

  // Handle equipment request approval/rejection
  const handleEquipmentRequestAction = async (requestId: string, action: 'forward') => {
    try {
      const db = getDatabase();
      const requestRef = ref(db, `equipmentRequests/${requestId}`);
      const request = equipmentRequests.find(r => r.id === requestId);
      
      if (!request) return;

      const updateData = {
        status: 'forwarded',
        currentApproverRole: 'registrar',
        history: [
          ...request.history,
          {
            action: 'forwarded',
            by: currentUser?.uid || 'unknown',
            at: new Date().toISOString(),
            role: 'asst_store'
          }
        ]
      };

      await update(requestRef, updateData);
      
      toast.success('Equipment request forwarded to Registrar successfully');
      await fetchEquipmentRequests();
    } catch (error) {
      console.error('Error forwarding equipment request:', error);
      toast.error('Failed to forward equipment request');
    }
  };

  // Handle tool request submission
  const handleToolRequestSubmit = async () => {
    try {
      if (!newToolRequest.title || !newToolRequest.description || !newToolRequest.reason) {
        toast.error('Please fill in all required fields');
        return;
      }

      const db = getDatabase();
      const toolRequestsRef = ref(db, 'toolRequests');
      const newRequestRef = push(toolRequestsRef);
      
      const toolRequest: Omit<ToolRequest, 'id'> = {
        title: newToolRequest.title,
        description: newToolRequest.description,
        category: newToolRequest.category,
        priority: newToolRequest.priority,
        status: 'pending',
        requestedBy: currentUser?.uid || 'unknown',
        requestedByName: currentUser?.email?.split('@')[0] || 'Assistant Store Keeper',
        requestedAt: new Date().toISOString(),
        estimatedCost: newToolRequest.estimatedCost,
        quantity: newToolRequest.quantity,
        reason: newToolRequest.reason,
        department: newToolRequest.department,
        location: newToolRequest.location,
        urgency: newToolRequest.urgency,
        impact: newToolRequest.impact,
        currentApproverRole: 'asst_store',
        approvalFlow: ['asst_store', 'principal'],
        history: [{
          action: 'Request submitted',
          by: currentUser?.email?.split('@')[0] || 'Assistant Store Keeper',
          at: new Date().toISOString(),
          role: 'asst_store'
        }]
      };

      await set(newRequestRef, toolRequest);
      
      toast.success('Tool request submitted successfully');
      setShowToolRequestModal(false);
      setNewToolRequest({
        title: '',
        description: '',
        category: 'tool',
        priority: 'medium',
        quantity: 1,
        reason: '',
        estimatedCost: 0,
        department: '',
        location: '',
        urgency: '',
        impact: ''
      });
      
      await fetchToolRequests();
    } catch (error) {
      console.error('Error submitting tool request:', error);
      toast.error('Failed to submit tool request');
    }
  };

  // Handle tool request approval/rejection
  const handleToolRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'forward_to_principal') => {
    try {
      const db = getDatabase();
      const requestRef = ref(db, `toolRequests/${requestId}`);
      const request = toolRequests.find(r => r.id === requestId);
      
      if (!request) return;

      let updateData: any = {
        approvedBy: currentUser?.uid || 'unknown',
        approvedAt: new Date().toISOString()
      };

      if (action === 'approve') {
        updateData.status = 'approved';
      } else if (action === 'reject') {
        updateData.status = 'rejected';
      } else if (action === 'forward_to_principal') {
        updateData.status = 'forwarded_to_principal';
      }

      await update(requestRef, updateData);
      
      const actionText = action === 'approve' ? 'approved' : 
                        action === 'reject' ? 'rejected' : 'forwarded to Principal';
      toast.success(`Tool request ${actionText} successfully`);
      await fetchToolRequests();
    } catch (error) {
      console.error('Error updating tool request:', error);
      toast.error('Failed to update tool request');
    }
  };

  // Handle inventory item update
  const handleInventoryUpdate = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const db = getDatabase();
      const itemRef = ref(db, `inventory/${itemId}`);
      
      await update(itemRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
      
      toast.success('Inventory item updated successfully');
      await fetchInventoryData();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast.error('Failed to update inventory item');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const availableItems = inventory.filter(item => item.status === 'available').length;
  const lowStockItems = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length;
  const pendingRequests = stockRequests.filter(req => req.status === 'pending').length;
  const pendingEquipmentRequests = equipmentRequests.filter(req => req.status === 'pending').length;
  const pendingToolRequests = toolRequests.filter(req => req.status === 'pending').length;
  const forwardedRequests = stockRequests.filter(req => req.status === 'forwarded_to_principal').length + 
                           equipmentRequests.filter(req => req.status === 'forwarded').length +
                           toolRequests.filter(req => req.status === 'forwarded_to_principal').length;

  // Determine current view based on route
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/inventory')) return 'inventory';
    if (path.includes('/requests')) return 'stock-requests';
    if (path.includes('/equipment')) return 'equipment-requests';
    if (path.includes('/tools')) return 'tool-requests';
    if (path.includes('/pending')) return 'pending-approvals';
    if (path.includes('/forwarded')) return 'forwarded-requests';
    if (path.includes('/reports')) return 'reports';
    return 'overview';
  };

  const currentView = getCurrentView();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assistant Store Keeper Dashboard</h1>
          <p className="text-gray-600">Manage inventory, track issues, and handle stock requests</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Items</p>
                <p className="text-2xl font-semibold text-gray-900">{availableItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{outOfStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tool Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{toolRequests.filter(r => r.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'inventory', label: 'Inventory Management', icon: Package },
              { id: 'tools', label: 'Tools & Requests', icon: Wrench },
              { id: 'requests', label: 'Stock Requests', icon: Clock },
              { id: 'equipment', label: 'Equipment Requests', icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowToolRequestModal(true)}
              className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Wrench className="h-6 w-6 text-green-600 mr-2" />
              <p className="font-medium text-green-800">New Tool Request</p>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Plus className="h-6 w-6 text-blue-600 mr-2" />
              <p className="font-medium text-blue-800">New Stock Request</p>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <p className="font-medium text-red-800">Report Issue</p>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
              <p className="font-medium text-purple-800">Generate Report</p>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tool Requests */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    Recent Tool Requests
                  </h4>
                  <div className="space-y-3">
                    {toolRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-medium text-sm">{request.title}</p>
                          <p className="text-xs text-gray-600">By: {request.requestedByName}</p>
                          <p className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    {toolRequests.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent tool requests</p>
                    )}
                  </div>
                </div>

                {/* Recent Stock Requests */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Recent Stock Requests
                  </h4>
                  <div className="space-y-3">
                    {stockRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div>
                          <p className="font-medium text-sm">{request.title}</p>
                          <p className="text-xs text-gray-600">By: {request.requestedBy}</p>
                          <p className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                    {stockRequests.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent stock requests</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Low Stock Alerts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').slice(0, 6).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} (Min: {item.minQuantity})</p>
                        <p className="text-xs text-gray-500">{item.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  {inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock').length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 col-span-full">No low stock alerts</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Inventory Management</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowInventoryModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory
                  .filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.name}</h4>
                          <p className="text-gray-600 text-sm">Location: {item.location}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm">
                              <strong>Qty:</strong> {item.quantity}
                            </span>
                            <span className="text-sm">
                              <strong>Min:</strong> {item.minQuantity}
                            </span>
                          </div>
                          {item.supplier && (
                            <p className="text-sm text-gray-500 mt-1">Supplier: {item.supplier}</p>
                          )}
                          {item.cost && (
                            <p className="text-sm text-gray-500">Cost: ₹{item.cost.toLocaleString()}</p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.condition === 'new' ? 'bg-green-100 text-green-800' :
                            item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                            item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.condition}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowInventoryModal(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              const newQty = prompt('Enter new quantity:', item.quantity.toString());
                              if (newQty && !isNaN(Number(newQty))) {
                                handleInventoryUpdate(item.id, { quantity: Number(newQty) });
                              }
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Update Quantity"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Stock Requests</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {stockRequests
                  .filter(request => 
                    request.title.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{request.title}</h4>
                          <p className="text-gray-600">{request.description}</p>
                          <p className="text-sm text-gray-500">Requested by: {request.requestedBy}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                      {request.status === 'pending' && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => handleStockRequestUpdate(request.id, 'approve')}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStockRequestUpdate(request.id, 'reject')}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Equipment Request Approvals</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => fetchEquipmentRequests()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {equipmentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending equipment requests</p>
                    <p className="text-sm text-gray-500 mt-2">All requests have been processed</p>
                  </div>
                ) : (
                  equipmentRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-lg">{request.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.type === 'workshop' ? 'bg-blue-100 text-blue-600' :
                              request.type === 'lab' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {request.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{request.description}</p>
                          <p className="text-sm text-gray-500">Category: {request.category}</p>
                          <p className="text-sm text-gray-500">Requested by: {request.createdByName}</p>
                          <p className="text-sm text-gray-500">Date: {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEquipmentRequestAction(request.id, 'forward')}
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                        >
                          Forward to Registrar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Tools & Inventory Requests</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowToolRequestModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Tool Request
                  </button>
                  <button 
                    onClick={() => fetchToolRequests()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {toolRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tool requests found</p>
                    <p className="text-sm text-gray-500 mt-2">Create a new tool request to get started</p>
                  </div>
                ) : (
                  toolRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-lg">{request.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{request.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div>
                              <strong>Requested by:</strong> {request.requestedByName}
                            </div>
                            <div>
                              <strong>Department:</strong> {request.department}
                            </div>
                            <div>
                              <strong>Quantity:</strong> {request.quantity}
                            </div>
                            <div>
                              <strong>Cost:</strong> ₹{request.estimatedCost?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            <strong>Reason:</strong> {request.reason}
                          </div>
                          {request.urgency && (
                            <div className="mt-1 text-sm text-gray-500">
                              <strong>Urgency:</strong> {request.urgency}
                            </div>
                          )}
                          {request.impact && (
                            <div className="mt-1 text-sm text-gray-500">
                              <strong>Impact:</strong> {request.impact}
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleToolRequestAction(request.id, 'approve')}
                            className="px-4 py-2 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleToolRequestAction(request.id, 'reject')}
                            className="px-4 py-2 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleToolRequestAction(request.id, 'forward_to_principal')}
                            className="px-4 py-2 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200"
                          >
                            Forward to Principal
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Reports & Analytics</h3>
                <div className="flex space-x-2">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">Inventory Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-semibold">{inventory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-semibold text-green-600">{availableItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Stock:</span>
                      <span className="font-semibold text-yellow-600">{lowStockItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Out of Stock:</span>
                      <span className="font-semibold text-red-600">{outOfStockItems}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">Request Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Requests:</span>
                      <span className="font-semibold">{stockRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-yellow-600">{pendingRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved:</span>
                      <span className="font-semibold text-green-600">{stockRequests.filter(r => r.status === 'approved').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected:</span>
                      <span className="font-semibold text-red-600">{stockRequests.filter(r => r.status === 'rejected').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Latest Stock Request</p>
                      <p className="text-gray-600">
                        {stockRequests.length > 0 ? stockRequests[0].title : 'No requests'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Last Updated</p>
                      <p className="text-gray-600">
                        {inventory.length > 0 ? new Date(inventory[0].lastUpdated).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tool Request Modal */}
      {showToolRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">New Tool Request</h3>
              <button
                onClick={() => setShowToolRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Title *
                  </label>
                  <input
                    type="text"
                    value={newToolRequest.title}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newToolRequest.category}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tool">Tool</option>
                    <option value="part">Part</option>
                    <option value="equipment">Equipment</option>
                    <option value="safety">Safety Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newToolRequest.description}
                  onChange={(e) => setNewToolRequest({ ...newToolRequest, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the item needed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={newToolRequest.priority}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={newToolRequest.quantity}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={newToolRequest.estimatedCost}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newToolRequest.department}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CSE, MECH, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newToolRequest.location}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Lab 1, Workshop A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <input
                    type="text"
                    value={newToolRequest.urgency}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Immediate, Within week"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Impact on Operations
                  </label>
                  <input
                    type="text"
                    value={newToolRequest.impact}
                    onChange={(e) => setNewToolRequest({ ...newToolRequest, impact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Critical for lab work"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Request *
                </label>
                <textarea
                  value={newToolRequest.reason}
                  onChange={(e) => setNewToolRequest({ ...newToolRequest, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this item is needed"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowToolRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToolRequestSubmit}
                disabled={!newToolRequest.title || !newToolRequest.description || !newToolRequest.reason}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => {
                  setShowInventoryModal(false);
                  setSelectedItem(null);
                  setNewInventoryItem({
                    name: '',
                    category: '',
                    quantity: 0,
                    minQuantity: 0,
                    location: '',
                    supplier: '',
                    cost: 0,
                    condition: 'good',
                    notes: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={selectedItem ? selectedItem.name : newInventoryItem.name}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, name: e.target.value });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, name: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedItem ? selectedItem.category : newInventoryItem.category}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, category: e.target.value });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="safety">Safety Equipment</option>
                    <option value="tools">Tools</option>
                    <option value="equipment">Equipment</option>
                    <option value="parts">Parts</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={selectedItem ? selectedItem.quantity : newInventoryItem.quantity}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, quantity: Number(e.target.value) });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, quantity: Number(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Quantity *
                  </label>
                  <input
                    type="number"
                    value={selectedItem ? selectedItem.minQuantity : newInventoryItem.minQuantity}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, minQuantity: Number(e.target.value) });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, minQuantity: Number(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={selectedItem ? selectedItem.condition : newInventoryItem.condition}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, condition: e.target.value as any });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, condition: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={selectedItem ? selectedItem.location : newInventoryItem.location}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, location: e.target.value });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, location: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cabinet A, Room 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={selectedItem ? selectedItem.supplier || '' : newInventoryItem.supplier}
                    onChange={(e) => {
                      if (selectedItem) {
                        setSelectedItem({ ...selectedItem, supplier: e.target.value });
                      } else {
                        setNewInventoryItem({ ...newInventoryItem, supplier: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (₹)
                </label>
                <input
                  type="number"
                  value={selectedItem ? selectedItem.cost || 0 : newInventoryItem.cost}
                  onChange={(e) => {
                    if (selectedItem) {
                      setSelectedItem({ ...selectedItem, cost: Number(e.target.value) });
                    } else {
                      setNewInventoryItem({ ...newInventoryItem, cost: Number(e.target.value) });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={selectedItem ? selectedItem.notes || '' : newInventoryItem.notes}
                  onChange={(e) => {
                    if (selectedItem) {
                      setSelectedItem({ ...selectedItem, notes: e.target.value });
                    } else {
                      setNewInventoryItem({ ...newInventoryItem, notes: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about the item"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInventoryModal(false);
                  setSelectedItem(null);
                  setNewInventoryItem({
                    name: '',
                    category: '',
                    quantity: 0,
                    minQuantity: 0,
                    location: '',
                    supplier: '',
                    cost: 0,
                    condition: 'good',
                    notes: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedItem) {
                    await handleInventoryUpdate(selectedItem.id, selectedItem);
                  } else {
                    // Add new item logic would go here
                    toast.success('New item added successfully');
                  }
                  setShowInventoryModal(false);
                  setSelectedItem(null);
                  setNewInventoryItem({
                    name: '',
                    category: '',
                    quantity: 0,
                    minQuantity: 0,
                    location: '',
                    supplier: '',
                    cost: 0,
                    condition: 'good',
                    notes: ''
                  });
                }}
                disabled={!newInventoryItem.name || !newInventoryItem.category || !newInventoryItem.location}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {selectedItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsstStoreDashboard; 