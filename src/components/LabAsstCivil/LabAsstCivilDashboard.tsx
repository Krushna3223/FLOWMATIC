import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import { 
  HardHat, 
  Users, 
  FileText, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Plus,
  Shield,
  TestTube,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CivilEquipment {
  id: string;
  name: string;
  type: 'testing' | 'measuring' | 'safety' | 'construction' | 'other';
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  location: string;
  assignedTo?: string;
  lastCalibration: string;
  nextCalibration: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  safetyLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

interface LabExperiment {
  id: string;
  title: string;
  instructor: string;
  course: string;
  startTime: string;
  endTime: string;
  date: string;
  students: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  equipment: string[];
  safetyChecks: string[];
  notes?: string;
}

interface SafetyProtocol {
  id: string;
  title: string;
  category: 'personal' | 'equipment' | 'environmental' | 'emergency';
  status: 'active' | 'review' | 'updated';
  lastReview: string;
  nextReview: string;
  description: string;
  requirements: string[];
}

interface LabReport {
  id: string;
  experimentTitle: string;
  conductedBy: string;
  date: string;
  participants: number;
  equipmentUsed: string[];
  results: string;
  safetyIncidents: string[];
  recommendations: string[];
  status: 'draft' | 'submitted' | 'approved';
}

const LabAsstCivilDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState<CivilEquipment[]>([]);
  const [experiments, setExperiments] = useState<LabExperiment[]>([]);
  const [safetyProtocols, setSafetyProtocols] = useState<SafetyProtocol[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showScheduleExperiment, setShowScheduleExperiment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock civil lab equipment data
      const mockEquipment: CivilEquipment[] = [
        {
          id: 'eq-1',
          name: 'Universal Testing Machine',
          type: 'testing',
          status: 'available',
          location: 'Civil Lab 1',
          lastCalibration: '2024-01-15',
          nextCalibration: '2024-02-15',
          condition: 'excellent',
          safetyLevel: 'high'
        },
        {
          id: 'eq-2',
          name: 'Concrete Mixer',
          type: 'construction',
          status: 'in_use',
          location: 'Civil Lab 2',
          assignedTo: 'Dr. Smith',
          lastCalibration: '2024-01-10',
          nextCalibration: '2024-02-10',
          condition: 'good',
          safetyLevel: 'medium'
        },
        {
          id: 'eq-3',
          name: 'Safety Helmets',
          type: 'safety',
          status: 'available',
          location: 'Safety Storage',
          lastCalibration: '2024-01-05',
          nextCalibration: '2024-04-05',
          condition: 'good',
          safetyLevel: 'low'
        }
      ];
      setEquipment(mockEquipment);

      // Mock lab experiments
      const mockExperiments: LabExperiment[] = [
        {
          id: 'exp-1',
          title: 'Concrete Strength Testing',
          instructor: 'Dr. Johnson',
          course: 'Structural Analysis',
          startTime: '09:00',
          endTime: '12:00',
          date: '2024-01-20',
          students: 15,
          status: 'scheduled',
          equipment: ['Universal Testing Machine', 'Concrete Mixer'],
          safetyChecks: ['Safety helmets required', 'Eye protection mandatory']
        },
        {
          id: 'exp-2',
          title: 'Soil Compaction Test',
          instructor: 'Dr. Williams',
          course: 'Geotechnical Engineering',
          startTime: '14:00',
          endTime: '17:00',
          date: '2024-01-20',
          students: 12,
          status: 'in_progress',
          equipment: ['Proctor Test Apparatus', 'Safety Helmets'],
          safetyChecks: ['Gloves required', 'Proper ventilation']
        }
      ];
      setExperiments(mockExperiments);

      // Mock safety protocols
      const mockSafetyProtocols: SafetyProtocol[] = [
        {
          id: 'safety-1',
          title: 'Personal Protective Equipment',
          category: 'personal',
          status: 'active',
          lastReview: '2024-01-01',
          nextReview: '2024-04-01',
          description: 'Mandatory PPE for all lab activities',
          requirements: ['Safety helmets', 'Safety glasses', 'Steel-toed boots', 'Gloves']
        },
        {
          id: 'safety-2',
          title: 'Equipment Safety Guidelines',
          category: 'equipment',
          status: 'active',
          lastReview: '2024-01-01',
          nextReview: '2024-04-01',
          description: 'Safety procedures for lab equipment operation',
          requirements: ['Pre-use inspection', 'Proper training', 'Emergency shutdown procedures']
        }
      ];
      setSafetyProtocols(mockSafetyProtocols);

      // Mock lab reports
      const mockLabReports: LabReport[] = [
        {
          id: 'report-1',
          experimentTitle: 'Concrete Strength Testing',
          conductedBy: 'Dr. Johnson',
          date: '2024-01-19',
          participants: 15,
          equipmentUsed: ['Universal Testing Machine', 'Concrete Mixer'],
          results: 'Average compressive strength: 25 MPa',
          safetyIncidents: [],
          recommendations: ['Increase curing time', 'Improve mix design'],
          status: 'submitted'
        }
      ];
      setLabReports(mockLabReports);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (name: string, type: string, location: string, condition: string, safetyLevel: string) => {
    try {
      const newEquipment: CivilEquipment = {
        id: `eq-${Date.now()}`,
        name,
        type: type as any,
        status: 'available',
        location,
        condition: condition as any,
        safetyLevel: safetyLevel as any,
        lastCalibration: new Date().toISOString(),
        nextCalibration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setEquipment(prev => [...prev, newEquipment]);
      toast.success('Equipment added successfully');
      setShowAddEquipment(false);
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const handleScheduleExperiment = async (title: string, instructor: string, course: string, startTime: string, endTime: string, date: string, students: number) => {
    try {
      const newExperiment: LabExperiment = {
        id: `exp-${Date.now()}`,
        title,
        instructor,
        course,
        startTime,
        endTime,
        date,
        students,
        status: 'scheduled',
        equipment: [],
        safetyChecks: []
      };
      
      setExperiments(prev => [...prev, newExperiment]);
      toast.success('Experiment scheduled successfully');
      setShowScheduleExperiment(false);
    } catch (error) {
      toast.error('Failed to schedule experiment');
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

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getExperimentStatusColor = (status: string) => {
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lab Assistant (Civil) Dashboard</h1>
        <p className="text-gray-600">Manage civil engineering lab equipment, experiments, and safety protocols</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardHat className="h-6 w-6 text-blue-600" />
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
              <TestTube className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Experiments</p>
              <p className="text-2xl font-bold text-gray-900">
                {experiments.filter(exp => exp.date === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safety Protocols</p>
              <p className="text-2xl font-bold text-gray-900">{safetyProtocols.length}</p>
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
              { id: 'overview', label: 'Overview', icon: HardHat },
              { id: 'equipment', label: 'Lab Equipment', icon: HardHat },
              { id: 'experiments', label: 'Lab Experiments', icon: TestTube },
              { id: 'safety', label: 'Safety Protocols', icon: Shield },
              { id: 'reports', label: 'Lab Reports', icon: FileText }
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
                  <h3 className="text-lg font-semibold mb-4">Today's Experiments</h3>
                  <div className="space-y-3">
                    {experiments.filter(exp => exp.date === new Date().toISOString().split('T')[0]).slice(0, 3).map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <p className="font-medium">{exp.title}</p>
                          <p className="text-sm text-gray-600">{exp.course}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperimentStatusColor(exp.status)}`}>
                          {exp.status}
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
                      onClick={() => setShowScheduleExperiment(true)}
                      className="w-full text-left p-3 bg-green-50 rounded border border-green-200 hover:bg-green-100"
                    >
                      <p className="font-medium text-green-800">Schedule Experiment</p>
                      <p className="text-sm text-green-600">Book lab for experiments</p>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100">
                      <p className="font-medium text-purple-800">Safety Review</p>
                      <p className="text-sm text-purple-600">Review safety protocols</p>
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
                <h3 className="text-lg font-semibold">Manage Civil Lab Equipment</h3>
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
                        Safety Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Calibration
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSafetyLevelColor(eq.safetyLevel)}`}>
                            {eq.safetyLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(eq.nextCalibration).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Shield className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Experiments Tab */}
          {activeTab === 'experiments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Schedule and Track Lab Experiments</h3>
                <button 
                  onClick={() => setShowScheduleExperiment(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Schedule Experiment
                </button>
              </div>

              <div className="space-y-4">
                {experiments.map((exp) => (
                  <div key={exp.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{exp.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperimentStatusColor(exp.status)}`}>
                            {exp.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Instructor: {exp.instructor}</p>
                        <p className="text-gray-600 mb-2">Course: {exp.course}</p>
                        <p className="text-gray-600 mb-2">Date: {new Date(exp.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Time: {exp.startTime} - {exp.endTime}</p>
                        <p className="text-gray-600 mb-4">Students: {exp.students}</p>
                        
                        {exp.equipment.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Equipment:</p>
                            <div className="flex flex-wrap gap-2">
                              {exp.equipment.map((eq, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {exp.safetyChecks.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-red-700 mb-2">Safety Checks:</p>
                            <div className="flex flex-wrap gap-2">
                              {exp.safetyChecks.map((check, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                                  {check}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {exp.notes && (
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">{exp.notes}</p>
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

          {/* Safety Tab */}
          {activeTab === 'safety' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Safety Protocols and Guidelines</h3>
              
              <div className="space-y-4">
                {safetyProtocols.map((protocol) => (
                  <div key={protocol.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{protocol.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            protocol.status === 'active' ? 'bg-green-100 text-green-600' :
                            protocol.status === 'review' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {protocol.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                            {protocol.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Last Review: {new Date(protocol.lastReview).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Next Review: {new Date(protocol.nextReview).toLocaleDateString()}</p>
                        <p className="text-gray-800 mb-4">{protocol.description}</p>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {protocol.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          <Shield className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Lab Reports and Documentation</h3>
              
              <div className="space-y-4">
                {labReports.map((report) => (
                  <div key={report.id} className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium">{report.experimentTitle}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'approved' ? 'bg-green-100 text-green-600' :
                            report.status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">Conducted by: {report.conductedBy}</p>
                        <p className="text-gray-600 mb-2">Date: {new Date(report.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 mb-2">Participants: {report.participants}</p>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Equipment Used:</p>
                          <div className="flex flex-wrap gap-2">
                            {report.equipmentUsed.map((eq, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Results:</p>
                          <p className="text-sm text-gray-600">{report.results}</p>
                        </div>
                        
                        {report.safetyIncidents.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-red-700 mb-2">Safety Incidents:</p>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {report.safetyIncidents.map((incident, index) => (
                                <li key={index}>{incident}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {report.recommendations.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-green-700 mb-2">Recommendations:</p>
                            <ul className="list-disc list-inside text-sm text-green-600">
                              {report.recommendations.map((rec, index) => (
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
                formData.get('condition') as string,
                formData.get('safetyLevel') as string
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
                    <option value="testing">Testing</option>
                    <option value="measuring">Measuring</option>
                    <option value="safety">Safety</option>
                    <option value="construction">Construction</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input name="location" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                    <select name="condition" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Safety Level</label>
                    <select name="safetyLevel" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
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

      {showScheduleExperiment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Lab Experiment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleScheduleExperiment(
                formData.get('title') as string,
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experiment Title</label>
                  <input name="title" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
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
                    Schedule Experiment
                  </button>
                  <button type="button" onClick={() => setShowScheduleExperiment(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
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

export default LabAsstCivilDashboard; 