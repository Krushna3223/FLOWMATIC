import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { 
  Monitor, 
  Users, 
  FileText, 
  Calendar, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Plus,
  AlertTriangle,
  Clock,
  Settings,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LabEquipment {
  id: string;
  name: string;
  type: 'computer' | 'printer' | 'projector' | 'scanner' | 'other';
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  location: string;
  assignedTo?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

interface LabSession {
  id: string;
  labName: string;
  instructor: string;
  course: string;
  startTime: string;
  endTime: string;
  date: string;
  students: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  equipment: string[];
  notes?: string;
}

interface LabUsage {
  id: string;
  labName: string;
  date: string;
  totalHours: number;
  sessions: number;
  students: number;
  equipmentUsed: string[];
  issues: string[];
  notes?: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'repair' | 'upgrade';
  description: string;
  performedBy: string;
  startDate: string;
  endDate?: string;
  cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  notes?: string;
}

interface LabEquipmentRequest {
  id: string;
  title: string;
  description: string;
  category: 'computer' | 'printer' | 'projector' | 'scanner' | 'software' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  estimatedCost?: number;
}

const TechLabAsstDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState<LabEquipment[]>([]);
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [usage, setUsage] = useState<LabUsage[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<LabEquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showScheduleSession, setShowScheduleSession] = useState(false);
  const [showEquipmentRequest, setShowEquipmentRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchEquipmentRequests();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      // Mock lab equipment data
      const mockEquipment: LabEquipment[] = [
        {
          id: 'eq-1',
          name: 'Computer Lab 1 - PC01',
          type: 'computer',
          status: 'available',
          location: 'Computer Lab 1',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15',
          condition: 'excellent'
        },
        {
          id: 'eq-2',
          name: 'Projector - Lab 2',
          type: 'projector',
          status: 'in_use',
          location: 'Computer Lab 2',
          assignedTo: 'Dr. Smith',
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-02-10',
          condition: 'good'
        },
        {
          id: 'eq-3',
          name: 'Printer - Admin',
          type: 'printer',
          status: 'maintenance',
          location: 'Admin Office',
          lastMaintenance: '2024-01-05',
          nextMaintenance: '2024-02-05',
          condition: 'fair',
          notes: 'Paper jam issue'
        }
      ];
      setEquipment(mockEquipment);

      // Mock lab sessions
      const mockSessions: LabSession[] = [
        {
          id: 'session-1',
          labName: 'Computer Lab 1',
          instructor: 'Dr. Johnson',
          course: 'Computer Programming',
          startTime: '09:00',
          endTime: '11:00',
          date: '2024-01-20',
          students: 25,
          status: 'scheduled',
          equipment: ['Computer Lab 1 - PC01', 'Projector - Lab 1']
        },
        {
          id: 'session-2',
          labName: 'Computer Lab 2',
          instructor: 'Dr. Smith',
          course: 'Database Management',
          startTime: '14:00',
          endTime: '16:00',
          date: '2024-01-20',
          students: 20,
          status: 'in_progress',
          equipment: ['Computer Lab 2 - PC01', 'Projector - Lab 2']
        }
      ];
      setSessions(mockSessions);

      // Mock lab usage
      const mockUsage: LabUsage[] = [
        {
          id: 'usage-1',
          labName: 'Computer Lab 1',
          date: '2024-01-19',
          totalHours: 8,
          sessions: 4,
          students: 80,
          equipmentUsed: ['Computer Lab 1 - PC01', 'Projector - Lab 1'],
          issues: []
        },
        {
          id: 'usage-2',
          labName: 'Computer Lab 2',
          date: '2024-01-19',
          totalHours: 6,
          sessions: 3,
          students: 60,
          equipmentUsed: ['Computer Lab 2 - PC01', 'Projector - Lab 2'],
          issues: ['Network connectivity issues']
        }
      ];
      setUsage(mockUsage);

      // Mock maintenance records
      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: 'maint-1',
          equipmentId: 'eq-3',
          equipmentName: 'Printer - Admin',
          type: 'repair',
          description: 'Fix paper jam and replace toner',
          performedBy: 'Tech Support',
          startDate: '2024-01-20',
          status: 'in_progress'
        },
        {
          id: 'maint-2',
          equipmentId: 'eq-1',
          equipmentName: 'Computer Lab 1 - PC01',
          type: 'preventive',
          description: 'Regular maintenance and software updates',
          performedBy: 'Tech Support',
          startDate: '2024-01-15',
          endDate: '2024-01-15',
          status: 'completed'
        }
      ];
      setMaintenance(mockMaintenance);

      // Fetch equipment requests
      // await fetchEquipmentRequests(); // This is now handled by the new useEffect

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (name: string, type: string, location: string, condition: string) => {
    try {
      const newEquipment: LabEquipment = {
        id: `eq-${Date.now()}`,
        name,
        type: type as any,
        status: 'available',
        location,
        condition: condition as any,
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setEquipment(prev => [...prev, newEquipment]);
      toast.success('Equipment added successfully');
      setShowAddEquipment(false);
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const handleScheduleSession = async (labName: string, instructor: string, course: string, startTime: string, endTime: string, date: string, students: number) => {
    try {
      const newSession: LabSession = {
        id: `session-${Date.now()}`,
        labName,
        instructor,
        course,
        startTime,
        endTime,
        date,
        students,
        status: 'scheduled',
        equipment: []
      };
      
      setSessions(prev => [...prev, newSession]);
      toast.success('Lab session scheduled successfully');
      setShowScheduleSession(false);
    } catch (error) {
      toast.error('Failed to schedule session');
    }
  };

  // Equipment Request for scalable, multi-institute ERP
  const fetchEquipmentRequests = async () => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'equipmentRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: LabEquipmentRequest[] = [];
        snapshot.forEach((child) => {
          const request = child.val();
          // Only show requests created by this tech lab assistant
          if (request.createdBy === currentUser?.uid && request.type === 'lab') {
            requests.push({
              id: child.key!,
              title: request.title,
              description: request.description,
              category: request.category,
              priority: request.priority,
              status: request.status,
              requestedBy: request.createdByName,
              requestedAt: request.createdAt,
              approvedBy: request.approvedBy,
              approvedAt: request.approvedAt,
              estimatedCost: request.estimatedCost
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

  const handleEquipmentRequest = async (title: string, description: string, category: string, priority: string) => {
    try {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;
      const instituteId = (currentUser as any)?.instituteId || 'default_institute';
      const newRequestRef = push(ref(db, 'equipmentRequests'));
      const newRequest = {
        id: newRequestRef.key,
        instituteId,
        type: 'lab',
        title,
        description,
        category,
        priority,
        status: 'pending',
        createdBy: currentUser?.uid || user?.uid || 'unknown',
        createdByName: currentUser?.name || user?.displayName || 'Tech Lab Assistant',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'asst_store',
        approvalFlow: ['tech_lab_asst', 'asst_store', 'registrar'],
        history: [
          {
            action: 'created',
            by: currentUser?.uid || user?.uid || 'unknown',
            at: new Date().toISOString(),
            role: 'tech_lab_asst',
          }
        ]
      };
      await set(newRequestRef, newRequest);
      toast.success('Lab equipment request submitted successfully');
      setShowEquipmentRequest(false);
      // Refresh the requests list after submitting
      await fetchEquipmentRequests();
    } catch (error) {
      toast.error('Failed to submit lab equipment request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'in_use': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_order': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSessionStatusColor = (status: string) => {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tech Lab Assistant Dashboard</h1>
        <p className="text-gray-600">Manage lab equipment, sessions, and maintenance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.filter(session => session.date === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(eq => new Date(eq.nextMaintenance) <= new Date()).length}
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
              <p className="text-sm font-medium text-gray-600">Available Equipment</p>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(eq => eq.status === 'available').length}
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
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'equipment', label: 'Lab Equipment', icon: Monitor },
              { id: 'sessions', label: 'Lab Sessions', icon: Calendar },
              { id: 'usage', label: 'Lab Usage', icon: Activity },
              { id: 'maintenance', label: 'Maintenance', icon: Settings },
              { id: 'requests', label: 'Equipment Requests', icon: FileText }
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
                  <h3 className="text-lg font-semibold mb-4">Today's Lab Sessions</h3>
                  <div className="space-y-3">
                    {sessions.filter(session => session.date === new Date().toISOString().split('T')[0]).slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{session.labName}</p>
                          <p className="text-sm text-gray-600">{session.course}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowAddEquipment(true)}
                      className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100"
                    >
                      <p className="font-medium text-blue-800">Add Equipment</p>
                      <p className="text-sm text-blue-600">Register new lab equipment</p>
                    </button>
                    <button 
                      onClick={() => setShowScheduleSession(true)}
                      className="w-full text-left p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100"
                    >
                      <p className="font-medium text-green-800">Schedule Session</p>
                      <p className="text-sm text-green-600">Book lab for classes</p>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100">
                      <p className="font-medium text-purple-800">Generate Reports</p>
                      <p className="text-sm text-purple-600">Lab usage and maintenance</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Manage Lab Equipment</h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
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
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_order">Out of Order</option>
                  </select>
                  <button 
                    onClick={() => setShowAddEquipment(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Maintenance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipment.map((eq) => (
                      <tr key={eq.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                            <div className="text-sm text-gray-500">{eq.location}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {eq.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                            {eq.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getConditionColor(eq.condition)}`}>
                            {eq.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(eq.nextMaintenance).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Settings className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Schedule and Track Lab Sessions</h3>
                <button 
                  onClick={() => setShowScheduleSession(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Schedule Session
                </button>
              </div>

              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{session.labName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Instructor: {session.instructor}</p>
                        <p className="text-gray-600 mb-2">Course: {session.course}</p>
                        <p className="text-gray-600 mb-2">Date: {new Date(session.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Time: {session.startTime} - {session.endTime}</p>
                        <p className="text-gray-600 mb-4">Students: {session.students}</p>
                        
                        {session.equipment.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Equipment:</p>
                            <div className="flex flex-wrap gap-2">
                              {session.equipment.map((eq, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {session.notes && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">{session.notes}</p>
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

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Track Lab Usage and Generate Reports</h3>
              
              <div className="space-y-4">
                {usage.map((labUsage) => (
                  <div key={labUsage.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{labUsage.labName}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                            {new Date(labUsage.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Hours</p>
                            <p className="text-lg font-medium">{labUsage.totalHours}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Sessions</p>
                            <p className="text-lg font-medium">{labUsage.sessions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Students</p>
                            <p className="text-lg font-medium">{labUsage.students}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Equipment Used</p>
                            <p className="text-lg font-medium">{labUsage.equipmentUsed.length}</p>
                          </div>
                        </div>
                        
                        {labUsage.equipmentUsed.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Equipment Used:</p>
                            <div className="flex flex-wrap gap-2">
                              {labUsage.equipmentUsed.map((eq, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {labUsage.issues.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-red-600 mb-2">Issues:</p>
                            <ul className="text-sm text-red-600">
                              {labUsage.issues.map((issue, index) => (
                                <li key={index}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {labUsage.notes && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">{labUsage.notes}</p>
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
              <h3 className="text-lg font-semibold mb-6">Maintenance Records and Scheduling</h3>
              
              <div className="space-y-4">
                {maintenance.map((record) => (
                  <div key={record.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{record.equipmentName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed' ? 'bg-green-100 text-green-600' :
                            record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {record.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                            {record.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Performed by: {record.performedBy}</p>
                        <p className="text-gray-600 mb-2">Start Date: {new Date(record.startDate).toLocaleDateString()}</p>
                        {record.endDate && (
                          <p className="text-gray-600 mb-2">End Date: {new Date(record.endDate).toLocaleDateString()}</p>
                        )}
                        {record.cost && (
                          <p className="text-gray-600 mb-2">Cost: ₹{record.cost.toLocaleString()}</p>
                        )}
                        <p className="text-gray-800 mb-4">{record.description}</p>
                        
                        {record.notes && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
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

          {/* Equipment Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Lab Equipment Requests</h3>
                <button 
                  onClick={() => setShowEquipmentRequest(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  New Request
                </button>
              </div>

              <div className="space-y-4">
                {equipmentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No equipment requests found</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first equipment request</p>
                  </div>
                ) : (
                  equipmentRequests.map((request) => (
                    <div key={request.id} className="bg-white border rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="text-lg font-medium">{request.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-600' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              request.status === 'ordered' ? 'bg-blue-100 text-blue-600' :
                              request.status === 'received' ? 'bg-purple-100 text-purple-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                              request.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">Category: {request.category}</p>
                          <p className="text-gray-800 mb-4">{request.description}</p>
                          <p className="text-sm text-gray-600">Requested by: {request.requestedBy}</p>
                          <p className="text-sm text-gray-600">Date: {new Date(request.requestedAt).toLocaleDateString()}</p>
                          {request.estimatedCost && (
                            <p className="text-sm text-gray-600">Estimated Cost: ₹{request.estimatedCost.toLocaleString()}</p>
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Equipment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddEquipment(
                formData.get('name') as string,
                formData.get('type') as string,
                formData.get('location') as string,
                formData.get('condition') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name</label>
                  <input name="name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="computer">Computer</option>
                    <option value="printer">Printer</option>
                    <option value="projector">Projector</option>
                    <option value="scanner">Scanner</option>
                    <option value="other">Other</option>
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
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Add Equipment
                  </button>
                  <button type="button" onClick={() => setShowAddEquipment(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScheduleSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Lab Session</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleScheduleSession(
                formData.get('labName') as string,
                formData.get('instructor') as string,
                formData.get('course') as string,
                formData.get('startTime') as string,
                formData.get('endTime') as string,
                formData.get('date') as string,
                parseInt(formData.get('students') as string)
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lab Name</label>
                  <input name="labName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                  <input name="instructor" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <input name="course" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input name="startTime" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input name="endTime" type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input name="date" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                  <input name="students" type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Schedule Session
                  </button>
                  <button type="button" onClick={() => setShowScheduleSession(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEquipmentRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Lab Equipment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleEquipmentRequest(
                formData.get('title') as string,
                formData.get('description') as string,
                formData.get('category') as string,
                formData.get('priority') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Title</label>
                  <input name="title" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="computer">Computer</option>
                    <option value="printer">Printer</option>
                    <option value="projector">Projector</option>
                    <option value="scanner">Scanner</option>
                    <option value="software">Software</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select name="priority" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Submit Request
                  </button>
                  <button type="button" onClick={() => setShowEquipmentRequest(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
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

export default TechLabAsstDashboard; 