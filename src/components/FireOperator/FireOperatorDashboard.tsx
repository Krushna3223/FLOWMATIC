import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { 
  Flame, 
  AlertTriangle, 
  Shield, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Plus,
  Clock,
  Activity,
  Settings,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FireSystem {
  id: string;
  name: string;
  type: 'sprinkler' | 'alarm' | 'extinguisher' | 'hydrant' | 'smoke_detector' | 'emergency_light';
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'fault';
  lastInspection: string;
  nextInspection: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  batteryLevel?: number;
  pressureLevel?: number;
  notes?: string;
}

interface EmergencyResponse {
  id: string;
  type: 'fire_alarm' | 'smoke_detection' | 'manual_activation' | 'system_fault' | 'drill';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'resolved' | 'false_alarm';
  location: string;
  reportedAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  description: string;
  responseTime?: number;
  actionsTaken?: string[];
}

interface SafetyInspection {
  id: string;
  inspector: string;
  area: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  findings: string[];
  violations: string[];
  recommendations: string[];
  nextInspection: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface FireDrill {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  evacuationTime?: number;
  issues: string[];
  improvements: string[];
  coordinator: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  performedAt: string;
  duration: number;
  cost: number;
  parts: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
  notes?: string;
}

const FireOperatorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [fireSystems, setFireSystems] = useState<FireSystem[]>([]);
  const [emergencyResponses, setEmergencyResponses] = useState<EmergencyResponse[]>([]);
  const [safetyInspections, setSafetyInspections] = useState<SafetyInspection[]>([]);
  const [fireDrills, setFireDrills] = useState<FireDrill[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddSystem, setShowAddSystem] = useState(false);
  const [showAddDrill, setShowAddDrill] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock fire systems data
      const mockFireSystems: FireSystem[] = [
        {
          id: 'fs-1',
          name: 'Main Building Sprinkler System',
          type: 'sprinkler',
          location: 'Main Building',
          status: 'active',
          lastInspection: '2024-01-15',
          nextInspection: '2024-02-15',
          condition: 'excellent',
          pressureLevel: 85
        },
        {
          id: 'fs-2',
          name: 'Library Smoke Detector',
          type: 'smoke_detector',
          location: 'Library',
          status: 'active',
          lastInspection: '2024-01-10',
          nextInspection: '2024-02-10',
          condition: 'good',
          batteryLevel: 90
        },
        {
          id: 'fs-3',
          name: 'Lab Fire Extinguisher',
          type: 'extinguisher',
          location: 'Chemistry Lab',
          status: 'maintenance',
          lastInspection: '2024-01-05',
          nextInspection: '2024-02-05',
          condition: 'fair'
        }
      ];
      setFireSystems(mockFireSystems);

      // Mock emergency responses
      const mockEmergencyResponses: EmergencyResponse[] = [
        {
          id: 'er-1',
          type: 'fire_alarm',
          severity: 'high',
          status: 'resolved',
          location: 'Chemistry Lab',
          reportedAt: '2024-01-20T10:30:00',
          respondedAt: '2024-01-20T10:32:00',
          resolvedAt: '2024-01-20T10:45:00',
          description: 'Fire alarm triggered due to chemical spill',
          responseTime: 2,
          actionsTaken: ['Evacuated building', 'Contained spill', 'Ventilated area']
        },
        {
          id: 'er-2',
          type: 'smoke_detection',
          severity: 'medium',
          status: 'responding',
          location: 'Canteen',
          reportedAt: '2024-01-20T14:15:00',
          description: 'Smoke detected in kitchen area'
        }
      ];
      setEmergencyResponses(mockEmergencyResponses);

      // Mock safety inspections
      const mockSafetyInspections: SafetyInspection[] = [
        {
          id: 'si-1',
          inspector: 'Fire Safety Officer',
          area: 'Main Building',
          date: '2024-01-20',
          status: 'completed',
          findings: ['All exits clear', 'Fire extinguishers in place', 'Emergency lights working'],
          violations: ['Blocked emergency exit in basement'],
          recommendations: ['Clear blocked exit', 'Install additional signage'],
          nextInspection: '2024-02-20',
          priority: 'high'
        },
        {
          id: 'si-2',
          inspector: 'Fire Safety Officer',
          area: 'Hostel Block',
          date: '2024-01-25',
          status: 'scheduled',
          findings: [],
          violations: [],
          recommendations: [],
          nextInspection: '2024-02-25',
          priority: 'medium'
        }
      ];
      setSafetyInspections(mockSafetyInspections);

      // Mock fire drills
      const mockFireDrills: FireDrill[] = [
        {
          id: 'fd-1',
          title: 'Monthly Fire Drill - Main Building',
          date: '2024-01-20',
          time: '10:00',
          location: 'Main Building',
          participants: 150,
          status: 'completed',
          evacuationTime: 3.5,
          issues: ['Slow evacuation from 3rd floor', 'Some students ignored alarm'],
          improvements: ['Add more exit signs', 'Conduct awareness sessions'],
          coordinator: 'Fire Safety Officer'
        },
        {
          id: 'fd-2',
          title: 'Hostel Fire Drill',
          date: '2024-01-25',
          time: '14:00',
          location: 'Hostel Block',
          participants: 80,
          status: 'scheduled',
          issues: [],
          improvements: [],
          coordinator: 'Fire Safety Officer'
        }
      ];
      setFireDrills(mockFireDrills);

      // Mock maintenance records
      const mockMaintenanceRecords: MaintenanceRecord[] = [
        {
          id: 'mr-1',
          equipmentId: 'fs-1',
          equipmentName: 'Main Building Sprinkler System',
          type: 'preventive',
          description: 'Annual sprinkler system maintenance and testing',
          performedBy: 'Fire Technician',
          performedAt: '2024-01-15',
          duration: 4,
          cost: 2500,
          parts: ['Pressure gauge', 'Valve seals'],
          status: 'completed'
        },
        {
          id: 'mr-2',
          equipmentId: 'fs-3',
          equipmentName: 'Lab Fire Extinguisher',
          type: 'corrective',
          description: 'Replace expired extinguisher and refill',
          performedBy: 'Fire Technician',
          performedAt: '2024-01-18',
          duration: 2,
          cost: 800,
          parts: ['New extinguisher unit', 'Refill material'],
          status: 'in_progress'
        }
      ];
      setMaintenanceRecords(mockMaintenanceRecords);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSystem = async (name: string, type: string, location: string, condition: string) => {
    try {
      const newSystem: FireSystem = {
        id: `fs-${Date.now()}`,
        name,
        type: type as any,
        location,
        status: 'active',
        condition: condition as any,
        lastInspection: new Date().toISOString(),
        nextInspection: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setFireSystems(prev => [...prev, newSystem]);
      toast.success('Fire system added successfully');
      setShowAddSystem(false);
    } catch (error) {
      toast.error('Failed to add fire system');
    }
  };

  const handleAddDrill = async (title: string, date: string, time: string, location: string, participants: number, coordinator: string) => {
    try {
      const newDrill: FireDrill = {
        id: `fd-${Date.now()}`,
        title,
        date,
        time,
        location,
        participants,
        status: 'scheduled',
        issues: [],
        improvements: [],
        coordinator
      };
      
      setFireDrills(prev => [...prev, newDrill]);
      toast.success('Fire drill scheduled successfully');
      setShowAddDrill(false);
    } catch (error) {
      toast.error('Failed to schedule fire drill');
    }
  };

  const handleUpdateEmergencyStatus = async (emergencyId: string, status: string) => {
    try {
      setEmergencyResponses(prev => prev.map(emergency => 
        emergency.id === emergencyId 
          ? { 
              ...emergency, 
              status: status as any,
              respondedAt: status === 'responding' ? new Date().toISOString() : emergency.respondedAt,
              resolvedAt: status === 'resolved' ? new Date().toISOString() : emergency.resolvedAt
            }
          : emergency
      ));
      toast.success('Emergency status updated successfully');
    } catch (error) {
      toast.error('Failed to update emergency status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'fault': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEmergencyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'responding': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'false_alarm': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDrillStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Fire Operator Dashboard</h1>
        <p className="text-gray-600">Manage fire safety systems, emergency response, and safety inspections</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Systems</p>
              <p className="text-2xl font-bold text-gray-900">
                {fireSystems.filter(sys => sys.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Emergencies</p>
              <p className="text-2xl font-bold text-gray-900">
                {emergencyResponses.filter(er => er.status === 'active' || er.status === 'responding').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Inspections</p>
              <p className="text-2xl font-bold text-gray-900">
                {safetyInspections.filter(si => si.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled Drills</p>
              <p className="text-2xl font-bold text-gray-900">
                {fireDrills.filter(drill => drill.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Flame },
              { id: 'systems', label: 'Fire Systems', icon: Settings },
              { id: 'emergencies', label: 'Emergency Response', icon: AlertTriangle },
              { id: 'inspections', label: 'Safety Inspections', icon: Shield },
              { id: 'drills', label: 'Fire Drills', icon: Activity },
              { id: 'maintenance', label: 'Maintenance', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Emergency Responses</h3>
                  <div className="space-y-3">
                    {emergencyResponses.slice(0, 3).map((emergency) => (
                      <div key={emergency.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{emergency.type}</p>
                          <p className="text-sm text-gray-600">{emergency.location}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(emergency.severity)}`}>
                          {emergency.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowAddSystem(true)}
                      className="w-full text-left p-3 bg-red-50 rounded border border-red-200 hover:bg-red-100"
                    >
                      <p className="font-medium text-red-800">Add Fire System</p>
                      <p className="text-sm text-red-600">Register new fire safety equipment</p>
                    </button>
                    <button 
                      onClick={() => setShowAddDrill(true)}
                      className="w-full text-left p-3 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100"
                    >
                      <p className="font-medium text-orange-800">Schedule Drill</p>
                      <p className="text-sm text-orange-600">Plan fire evacuation drill</p>
                    </button>
                    <button className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100">
                      <p className="font-medium text-blue-800">Emergency Response</p>
                      <p className="text-sm text-blue-600">Activate emergency protocols</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Systems Tab */}
          {activeTab === 'systems' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Fire Safety Systems Management</h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search systems..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="fault">Fault</option>
                  </select>
                  <button 
                    onClick={() => setShowAddSystem(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {fireSystems.map((system) => (
                  <div key={system.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{system.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                            {system.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                            {system.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Location: {system.location}</p>
                        <p className="text-gray-600 mb-2">Condition: {system.condition}</p>
                        <p className="text-gray-600 mb-2">Last Inspection: {new Date(system.lastInspection).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-4">Next Inspection: {new Date(system.nextInspection).toLocaleDateString()}</p>
                        
                        {system.batteryLevel && (
                          <p className="text-gray-600 mb-2">Battery Level: {system.batteryLevel}%</p>
                        )}
                        {system.pressureLevel && (
                          <p className="text-gray-600 mb-4">Pressure Level: {system.pressureLevel} PSI</p>
                        )}
                        
                        {system.notes && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">{system.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergencies Tab */}
          {activeTab === 'emergencies' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Emergency Response Management</h3>
              
              <div className="space-y-4">
                {emergencyResponses.map((emergency) => (
                  <div key={emergency.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{emergency.type}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(emergency.severity)}`}>
                            {emergency.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmergencyStatusColor(emergency.status)}`}>
                            {emergency.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Location: {emergency.location}</p>
                        <p className="text-gray-600 mb-2">Reported: {new Date(emergency.reportedAt).toLocaleString()}</p>
                        <p className="text-gray-800 mb-4">{emergency.description}</p>
                        
                        {emergency.respondedAt && (
                          <p className="text-gray-600 mb-2">Responded: {new Date(emergency.respondedAt).toLocaleString()}</p>
                        )}
                        {emergency.resolvedAt && (
                          <p className="text-gray-600 mb-2">Resolved: {new Date(emergency.resolvedAt).toLocaleString()}</p>
                        )}
                        {emergency.responseTime && (
                          <p className="text-gray-600 mb-2">Response Time: {emergency.responseTime} minutes</p>
                        )}
                        
                        {emergency.actionsTaken && emergency.actionsTaken.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Actions Taken:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {emergency.actionsTaken.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {emergency.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleUpdateEmergencyStatus(emergency.id, 'responding')}
                              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center"
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Respond
                            </button>
                            <button
                              onClick={() => handleUpdateEmergencyStatus(emergency.id, 'resolved')}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </button>
                          </>
                        )}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspections Tab */}
          {activeTab === 'inspections' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Safety Inspections</h3>
              
              <div className="space-y-4">
                {safetyInspections.map((inspection) => (
                  <div key={inspection.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{inspection.area} - {inspection.inspector}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(inspection.priority)}`}>
                            {inspection.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                            {inspection.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Date: {new Date(inspection.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Next Inspection: {new Date(inspection.nextInspection).toLocaleDateString()}</p>
                        
                        {inspection.findings.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-green-700 mb-2">Findings:</p>
                            <ul className="list-disc list-inside text-sm text-green-600">
                              {inspection.findings.map((finding, index) => (
                                <li key={index}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {inspection.violations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-red-700 mb-2">Violations:</p>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {inspection.violations.map((violation, index) => (
                                <li key={index}>{violation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {inspection.recommendations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-blue-700 mb-2">Recommendations:</p>
                            <ul className="list-disc list-inside text-sm text-blue-600">
                              {inspection.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drills Tab */}
          {activeTab === 'drills' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Fire Drill Management</h3>
                <button 
                  onClick={() => setShowAddDrill(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Schedule Drill
                </button>
              </div>

              <div className="space-y-4">
                {fireDrills.map((drill) => (
                  <div key={drill.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{drill.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDrillStatusColor(drill.status)}`}>
                            {drill.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Date: {new Date(drill.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Time: {drill.time}</p>
                        <p className="text-gray-600 mb-2">Location: {drill.location}</p>
                        <p className="text-gray-600 mb-2">Participants: {drill.participants}</p>
                        <p className="text-gray-600 mb-4">Coordinator: {drill.coordinator}</p>
                        
                        {drill.evacuationTime && (
                          <p className="text-gray-600 mb-2">Evacuation Time: {drill.evacuationTime} minutes</p>
                        )}
                        
                        {drill.issues.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-red-700 mb-2">Issues:</p>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {drill.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {drill.improvements.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-green-700 mb-2">Improvements:</p>
                            <ul className="list-disc list-inside text-sm text-green-600">
                              {drill.improvements.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Maintenance Records</h3>
              
              <div className="space-y-4">
                {maintenanceRecords.map((record) => (
                  <div key={record.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{record.equipmentName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'preventive' ? 'bg-green-100 text-green-600' :
                            record.type === 'corrective' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {record.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Performed by: {record.performedBy}</p>
                        <p className="text-gray-600 mb-2">Date: {new Date(record.performedAt).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Duration: {record.duration} hours</p>
                        <p className="text-gray-600 mb-4">Cost: ₹{record.cost.toLocaleString()}</p>
                        <p className="text-gray-800 mb-4">{record.description}</p>
                        
                        {record.parts.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Parts Used:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.parts.map((part, index) => (
                                <li key={index}>{part}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {record.notes && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">{record.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Fire Safety System</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddSystem(
                formData.get('name') as string,
                formData.get('type') as string,
                formData.get('location') as string,
                formData.get('condition') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                  <input name="name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="sprinkler">Sprinkler System</option>
                    <option value="alarm">Fire Alarm</option>
                    <option value="extinguisher">Fire Extinguisher</option>
                    <option value="hydrant">Fire Hydrant</option>
                    <option value="smoke_detector">Smoke Detector</option>
                    <option value="emergency_light">Emergency Light</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input name="location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select name="condition" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                    Add System
                  </button>
                  <button type="button" onClick={() => setShowAddSystem(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddDrill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Fire Drill</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddDrill(
                formData.get('title') as string,
                formData.get('date') as string,
                formData.get('time') as string,
                formData.get('location') as string,
                parseInt(formData.get('participants') as string),
                formData.get('coordinator') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drill Title</label>
                  <input name="title" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input name="date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input name="time" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input name="location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Participants</label>
                    <input name="participants" type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator</label>
                    <input name="coordinator" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700">
                    Schedule Drill
                  </button>
                  <button type="button" onClick={() => setShowAddDrill(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
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

export default FireOperatorDashboard; 