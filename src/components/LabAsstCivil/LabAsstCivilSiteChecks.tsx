import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  ClipboardList, 
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
  MapPin,
  User,
  Shield,
  Zap,
  HardHat,
  Activity,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SiteCheck {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
  location: string;
  checklist: ChecklistItem[];
  findings: Finding[];
  overallScore: number;
  notes?: string;
  attachments?: string[];
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  notes?: string;
  critical: boolean;
}

interface Finding {
  id: string;
  type: 'observation' | 'violation' | 'recommendation' | 'critical';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  actionTaken?: string;
  dueDate?: string;
}

const LabAsstCivilSiteChecks: React.FC = () => {
  const { currentUser } = useAuth();
  const [siteChecks, setSiteChecks] = useState<SiteCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddCheck, setShowAddCheck] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<SiteCheck | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const checksRef = ref(database, 'civil_lab_site_checks');
      const snapshot = await get(checksRef);
      
      if (snapshot.exists()) {
        const checksData = snapshot.val();
        const checksArray = Object.entries(checksData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setSiteChecks(checksArray);
      } else {
        // Initialize with sample data
        const sampleChecks: SiteCheck[] = [
          {
            id: 'check-1',
            title: 'Daily Lab Safety Inspection',
            type: 'daily',
            status: 'completed',
            assignedTo: 'Lab Assistant',
            scheduledDate: '2024-01-20T08:00:00Z',
            completedDate: '2024-01-20T10:30:00Z',
            location: 'Civil Lab 1 & 2',
            overallScore: 92,
            checklist: [
              {
                id: 'item-1',
                category: 'Safety Equipment',
                item: 'Safety goggles available and in good condition',
                status: 'pass',
                critical: true
              },
              {
                id: 'item-2',
                category: 'Equipment',
                item: 'Testing machines operational',
                status: 'pass',
                critical: true
              },
              {
                id: 'item-3',
                category: 'Housekeeping',
                item: 'Work areas clean and organized',
                status: 'pass',
                critical: false
              }
            ],
            findings: [
              {
                id: 'finding-1',
                type: 'observation',
                description: 'Minor dust accumulation in corner areas',
                severity: 'low',
                actionRequired: false
              }
            ],
            notes: 'All safety protocols followed. Minor housekeeping issues noted.'
          },
          {
            id: 'check-2',
            title: 'Weekly Equipment Maintenance Check',
            type: 'weekly',
            status: 'in_progress',
            assignedTo: 'Lab Technician',
            scheduledDate: '2024-01-22T09:00:00Z',
            location: 'Civil Lab 1',
            overallScore: 0,
            checklist: [
              {
                id: 'item-4',
                category: 'Equipment Maintenance',
                item: 'Universal Testing Machine calibration check',
                status: 'pending',
                critical: true
              },
              {
                id: 'item-5',
                category: 'Equipment Maintenance',
                item: 'Concrete mixer lubrication',
                status: 'pending',
                critical: false
              }
            ],
            findings: []
          },
          {
            id: 'check-3',
            title: 'Monthly Safety Audit',
            type: 'monthly',
            status: 'pending',
            assignedTo: 'Safety Officer',
            scheduledDate: '2024-01-25T10:00:00Z',
            location: 'All Civil Labs',
            overallScore: 0,
            checklist: [
              {
                id: 'item-6',
                category: 'Safety Protocols',
                item: 'Emergency procedures reviewed',
                status: 'pending',
                critical: true
              },
              {
                id: 'item-7',
                category: 'Safety Protocols',
                item: 'First aid kit inspection',
                status: 'pending',
                critical: true
              }
            ],
            findings: []
          }
        ];
        setSiteChecks(sampleChecks);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load site checks data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (checkId: string, newStatus: string) => {
    try {
      const checkRef = ref(database, `civil_lab_site_checks/${checkId}`);
      await set(checkRef, {
        ...siteChecks.find(c => c.id === checkId),
        status: newStatus,
        completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      
      setSiteChecks(siteChecks.map(c => 
        c.id === checkId 
          ? { ...c, status: newStatus as any, completedDate: newStatus === 'completed' ? new Date().toISOString() : c.completedDate }
          : c
      ));
      
      toast.success('Site check status updated successfully');
    } catch (error) {
      console.error('Error updating check:', error);
      toast.error('Failed to update check status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      case 'quarterly': return 'bg-orange-100 text-orange-800';
      case 'annual': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChecklistStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'na': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChecks = siteChecks.filter(check => {
    const matchesSearch = check.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || check.status === filterStatus;
    const matchesType = filterType === 'all' || check.type === filterType;
    
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Civil Lab Site Checks</h1>
          <p className="text-gray-600">Manage site inspections, safety checks, and compliance audits</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Checks</p>
                <p className="text-2xl font-bold text-gray-900">{siteChecks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {siteChecks.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {siteChecks.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {siteChecks.filter(c => c.status === 'overdue').length}
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
                placeholder="Search site checks..."
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
              <option value="pending">Pending</option>
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
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Check
            </button>
          </div>
        </div>

        {/* Site Checks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecks.map((check) => (
            <div key={check.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{check.title}</h3>
                    <p className="text-sm text-gray-600">{check.location}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                      {check.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(check.type)}`}>
                      {check.type}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{check.assignedTo}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(check.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{check.location}</span>
                  </div>
                  
                  {check.overallScore > 0 && (
                    <div className="flex items-center text-sm">
                      <Activity className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Score: {check.overallScore}%</span>
                    </div>
                  )}
                </div>
                
                {/* Checklist Summary */}
                {check.checklist.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Checklist Summary</h4>
                    <div className="space-y-1">
                      {check.checklist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{item.item}</span>
                          <span className={`px-1 py-0.5 rounded text-xs font-medium ${getChecklistStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                      {check.checklist.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{check.checklist.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setSelectedCheck(check)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Check Details Modal */}
        {selectedCheck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Site Check Details</h2>
                <button
                  onClick={() => setSelectedCheck(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedCheck.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedCheck.location}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedCheck.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedCheck.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Assigned To:</span>
                    <p className="text-sm text-gray-900">{selectedCheck.assignedTo}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Scheduled:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedCheck.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Checklist */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Checklist Items</h4>
                  <div className="space-y-2">
                    {selectedCheck.checklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.item}</p>
                          <p className="text-xs text-gray-600">{item.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.critical && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                              Critical
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getChecklistStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Findings */}
                {selectedCheck.findings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Findings</h4>
                    <div className="space-y-2">
                      {selectedCheck.findings.map((finding) => (
                        <div key={finding.id} className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">{finding.type}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCheck.notes && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedCheck.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setSelectedCheck(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Handle edit functionality
                      setSelectedCheck(null);
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

export default LabAsstCivilSiteChecks;
