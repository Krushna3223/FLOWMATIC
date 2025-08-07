import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Plus,
  Clock,
  MapPin,
  Activity,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SecurityIncident {
  id: string;
  title: string;
  type: 'theft' | 'trespassing' | 'vandalism' | 'suspicious_activity' | 'emergency' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  location: string;
  reportedBy: string;
  reportedAt: string;
  description: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
}

interface VisitorLog {
  id: string;
  visitorName: string;
  purpose: string;
  contactPerson: string;
  entryTime: string;
  exitTime?: string;
  status: 'inside' | 'left' | 'denied';
  idProof: string;
  vehicleNumber?: string;
  notes?: string;
}

interface PatrolSchedule {
  id: string;
  guardName: string;
  area: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
  checkpoints: string[];
  completedCheckpoints: string[];
  notes?: string;
}

interface AccessControl {
  id: string;
  location: string;
  accessType: 'entry' | 'exit' | 'restricted';
  personName: string;
  personType: 'student' | 'staff' | 'visitor' | 'contractor';
  timestamp: string;
  cardId?: string;
  authorized: boolean;
  reason?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  contact: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastContacted?: string;
}

const SecurityGuardDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [patrolSchedules, setPatrolSchedules] = useState<PatrolSchedule[]>([]);
  const [accessControl, setAccessControl] = useState<AccessControl[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [showAddVisitor, setShowAddVisitor] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock security incidents data
      const mockIncidents: SecurityIncident[] = [
        {
          id: 'inc-1',
          title: 'Suspicious Person Near Gate 2',
          type: 'suspicious_activity',
          severity: 'medium',
          status: 'investigating',
          location: 'Gate 2',
          reportedBy: 'Guard John',
          reportedAt: '2024-01-20T10:30:00',
          description: 'Person loitering near gate without proper identification',
          assignedTo: 'Guard Mike'
        },
        {
          id: 'inc-2',
          title: 'Vehicle Break-in Attempt',
          type: 'theft',
          severity: 'high',
          status: 'resolved',
          location: 'Parking Lot A',
          reportedBy: 'Guard Sarah',
          reportedAt: '2024-01-19T15:45:00',
          description: 'Attempted break-in to vehicle in parking lot',
          assignedTo: 'Guard Mike',
          resolvedAt: '2024-01-19T16:30:00',
          resolution: 'Suspect apprehended and handed over to police'
        }
      ];
      setIncidents(mockIncidents);

      // Mock visitor logs
      const mockVisitorLogs: VisitorLog[] = [
        {
          id: 'vis-1',
          visitorName: 'John Smith',
          purpose: 'Meeting with HOD Computer Science',
          contactPerson: 'Dr. Johnson',
          entryTime: '2024-01-20T09:00:00',
          status: 'inside',
          idProof: 'Aadhar Card'
        },
        {
          id: 'vis-2',
          visitorName: 'Jane Doe',
          purpose: 'Equipment Delivery',
          contactPerson: 'Store Manager',
          entryTime: '2024-01-20T08:30:00',
          exitTime: '2024-01-20T11:00:00',
          status: 'left',
          idProof: 'Driving License',
          vehicleNumber: 'MH-12-AB-1234'
        }
      ];
      setVisitorLogs(mockVisitorLogs);

      // Mock patrol schedules
      const mockPatrolSchedules: PatrolSchedule[] = [
        {
          id: 'patrol-1',
          guardName: 'Guard John',
          area: 'Main Campus',
          startTime: '08:00',
          endTime: '16:00',
          date: '2024-01-20',
          status: 'in_progress',
          checkpoints: ['Gate 1', 'Admin Block', 'Library', 'Canteen', 'Parking'],
          completedCheckpoints: ['Gate 1', 'Admin Block']
        },
        {
          id: 'patrol-2',
          guardName: 'Guard Sarah',
          area: 'Hostel Area',
          startTime: '16:00',
          endTime: '00:00',
          date: '2024-01-20',
          status: 'scheduled',
          checkpoints: ['Hostel Gate', 'Mess', 'Common Area', 'Sports Ground'],
          completedCheckpoints: []
        }
      ];
      setPatrolSchedules(mockPatrolSchedules);

      // Mock access control
      const mockAccessControl: AccessControl[] = [
        {
          id: 'acc-1',
          location: 'Main Gate',
          accessType: 'entry',
          personName: 'Student 123',
          personType: 'student',
          timestamp: '2024-01-20T08:15:00',
          cardId: 'ST123456',
          authorized: true
        },
        {
          id: 'acc-2',
          location: 'Library',
          accessType: 'entry',
          personName: 'Unknown Person',
          personType: 'visitor',
          timestamp: '2024-01-20T10:30:00',
          authorized: false,
          reason: 'No valid ID proof'
        }
      ];
      setAccessControl(mockAccessControl);

      // Mock emergency contacts
      const mockEmergencyContacts: EmergencyContact[] = [
        {
          id: 'ec-1',
          name: 'Dr. Principal',
          role: 'Principal',
          contact: '+91-9876543210',
          department: 'Administration',
          priority: 'critical'
        },
        {
          id: 'ec-2',
          name: 'Security Head',
          role: 'Security Head',
          contact: '+91-9876543211',
          department: 'Security',
          priority: 'high'
        },
        {
          id: 'ec-3',
          name: 'Medical Officer',
          role: 'Medical Officer',
          contact: '+91-9876543212',
          department: 'Medical',
          priority: 'high'
        }
      ];
      setEmergencyContacts(mockEmergencyContacts);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncident = async (title: string, type: string, severity: string, location: string, description: string) => {
    try {
      const newIncident: SecurityIncident = {
        id: `inc-${Date.now()}`,
        title,
        type: type as any,
        severity: severity as any,
        status: 'reported',
        location,
        reportedBy: currentUser?.name || 'Unknown',
        reportedAt: new Date().toISOString(),
        description
      };
      
      setIncidents(prev => [...prev, newIncident]);
      toast.success('Incident reported successfully');
      setShowAddIncident(false);
    } catch (error) {
      toast.error('Failed to report incident');
    }
  };

  const handleAddVisitor = async (visitorName: string, purpose: string, contactPerson: string, idProof: string, vehicleNumber?: string) => {
    try {
      const newVisitor: VisitorLog = {
        id: `vis-${Date.now()}`,
        visitorName,
        purpose,
        contactPerson,
        entryTime: new Date().toISOString(),
        status: 'inside',
        idProof,
        vehicleNumber
      };
      
      setVisitorLogs(prev => [...prev, newVisitor]);
      toast.success('Visitor logged successfully');
      setShowAddVisitor(false);
    } catch (error) {
      toast.error('Failed to log visitor');
    }
  };

  const handleUpdateIncidentStatus = async (incidentId: string, status: string) => {
    try {
      setIncidents(prev => prev.map(inc => 
        inc.id === incidentId 
          ? { 
              ...inc, 
              status: status as any,
              resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
            }
          : inc
      ));
      toast.success('Incident status updated successfully');
    } catch (error) {
      toast.error('Failed to update incident status');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVisitorStatusColor = (status: string) => {
    switch (status) {
      case 'inside': return 'text-green-600 bg-green-100';
      case 'left': return 'text-gray-600 bg-gray-100';
      case 'denied': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPatrolStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'missed': return 'text-red-600 bg-red-100';
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Security Guard Dashboard</h1>
        <p className="text-gray-600">Manage security incidents, visitor access, and patrol schedules</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Incidents</p>
              <p className="text-2xl font-bold text-gray-900">
                {incidents.filter(inc => inc.status === 'reported' || inc.status === 'investigating').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visitors Inside</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitorLogs.filter(vis => vis.status === 'inside').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Patrols</p>
              <p className="text-2xl font-bold text-gray-900">
                {patrolSchedules.filter(patrol => patrol.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Access Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {accessControl.filter(acc => acc.authorized === false).length}
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
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'incidents', label: 'Security Incidents', icon: AlertTriangle },
              { id: 'visitors', label: 'Visitor Management', icon: Users },
              { id: 'patrols', label: 'Patrol Schedules', icon: Clock },
              { id: 'access', label: 'Access Control', icon: Camera },
              { id: 'emergency', label: 'Emergency Contacts', icon: Activity }
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
                  <h3 className="text-lg font-semibold mb-4">Recent Security Incidents</h3>
                  <div className="space-y-3">
                    {incidents.slice(0, 3).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{incident.title}</p>
                          <p className="text-sm text-gray-600">{incident.location}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowAddIncident(true)}
                      className="w-full text-left p-3 bg-red-50 rounded border border-red-200 hover:bg-red-100"
                    >
                      <p className="font-medium text-red-800">Report Incident</p>
                      <p className="text-sm text-red-600">Log security incident</p>
                    </button>
                    <button 
                      onClick={() => setShowAddVisitor(true)}
                      className="w-full text-left p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100"
                    >
                      <p className="font-medium text-green-800">Log Visitor</p>
                      <p className="text-sm text-green-600">Register new visitor</p>
                    </button>
                    <button className="w-full text-left p-3 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100">
                      <p className="font-medium text-blue-800">Start Patrol</p>
                      <p className="text-sm text-blue-600">Begin security patrol</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Security Incidents Management</h3>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search incidents..."
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
                    <option value="reported">Reported</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button 
                    onClick={() => setShowAddIncident(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{incident.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                            {incident.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Location: {incident.location}</p>
                        <p className="text-gray-600 mb-2">Reported by: {incident.reportedBy}</p>
                        <p className="text-gray-600 mb-4">Date: {new Date(incident.reportedAt).toLocaleString()}</p>
                        <p className="text-gray-800 mb-4">{incident.description}</p>
                        
                        {incident.assignedTo && (
                          <p className="text-gray-600 mb-2">Assigned to: {incident.assignedTo}</p>
                        )}
                        {incident.resolvedAt && (
                          <p className="text-gray-600 mb-2">Resolved: {new Date(incident.resolvedAt).toLocaleString()}</p>
                        )}
                        {incident.resolution && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                            <p className="text-sm text-green-800"><strong>Resolution:</strong> {incident.resolution}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {incident.status === 'reported' && (
                          <>
                            <button
                              onClick={() => handleUpdateIncidentStatus(incident.id, 'investigating')}
                              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Investigate
                            </button>
                            <button
                              onClick={() => handleUpdateIncidentStatus(incident.id, 'resolved')}
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

          {/* Visitors Tab */}
          {activeTab === 'visitors' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Visitor Management</h3>
                <button 
                  onClick={() => setShowAddVisitor(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Log Visitor
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visitor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entry Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitorLogs.map((visitor) => (
                      <tr key={visitor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{visitor.visitorName}</div>
                            <div className="text-sm text-gray-500">ID: {visitor.idProof}</div>
                            {visitor.vehicleNumber && (
                              <div className="text-sm text-gray-500">Vehicle: {visitor.vehicleNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visitor.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visitor.contactPerson}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(visitor.entryTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisitorStatusColor(visitor.status)}`}>
                            {visitor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Patrols Tab */}
          {activeTab === 'patrols' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Patrol Schedule Management</h3>
              
              <div className="space-y-4">
                {patrolSchedules.map((patrol) => (
                  <div key={patrol.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{patrol.guardName} - {patrol.area}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatrolStatusColor(patrol.status)}`}>
                            {patrol.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Date: {new Date(patrol.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Time: {patrol.startTime} - {patrol.endTime}</p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Checkpoints:</p>
                          <div className="flex flex-wrap gap-2">
                            {patrol.checkpoints.map((checkpoint, index) => (
                              <span key={index} className={`px-2 py-1 rounded text-sm ${
                                patrol.completedCheckpoints.includes(checkpoint)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {checkpoint}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {patrol.notes && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">{patrol.notes}</p>
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

          {/* Access Control Tab */}
          {activeTab === 'access' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Access Control Logs</h3>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accessControl.map((access) => (
                      <tr key={access.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{access.personName}</div>
                            <div className="text-sm text-gray-500">{access.personType}</div>
                            {access.cardId && (
                              <div className="text-sm text-gray-500">Card: {access.cardId}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {access.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {access.accessType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(access.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            access.authorized ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {access.authorized ? 'Authorized' : 'Denied'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'emergency' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Emergency Contacts</h3>
              
              <div className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{contact.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(contact.priority)}`}>
                            {contact.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Role: {contact.role}</p>
                        <p className="text-gray-600 mb-2">Department: {contact.department}</p>
                        <p className="text-gray-600 mb-4">Contact: {contact.contact}</p>
                        
                        {contact.lastContacted && (
                          <p className="text-gray-600 mb-2">Last Contacted: {new Date(contact.lastContacted).toLocaleString()}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Emergency
                        </button>
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
        </div>
      </div>

      {/* Modals */}
      {showAddIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Report Security Incident</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddIncident(
                formData.get('title') as string,
                formData.get('type') as string,
                formData.get('severity') as string,
                formData.get('location') as string,
                formData.get('description') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Title</label>
                  <input name="title" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                    <option value="theft">Theft</option>
                    <option value="trespassing">Trespassing</option>
                    <option value="vandalism">Vandalism</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select name="severity" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input name="location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                    Report Incident
                  </button>
                  <button type="button" onClick={() => setShowAddIncident(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddVisitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Log New Visitor</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddVisitor(
                formData.get('visitorName') as string,
                formData.get('purpose') as string,
                formData.get('contactPerson') as string,
                formData.get('idProof') as string,
                formData.get('vehicleNumber') as string || undefined
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name</label>
                  <input name="visitorName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <input name="purpose" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input name="contactPerson" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof</label>
                  <input name="idProof" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number (Optional)</label>
                  <input name="vehicleNumber" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                    Log Visitor
                  </button>
                  <button type="button" onClick={() => setShowAddVisitor(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
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

export default SecurityGuardDashboard; 