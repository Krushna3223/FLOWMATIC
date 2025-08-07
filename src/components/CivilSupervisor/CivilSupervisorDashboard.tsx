import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  Building2, 
  Wrench, 
  FileText, 
  Settings,
  Bell,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Plus,
  Eye,
  Download,
  Search,
  Filter,
  HardHat,
  Shield,
  Truck,
  Hammer,
  Ruler,
  Zap,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import CivilSupervisorMaintenanceRequests from './CivilSupervisorMaintenanceRequests';

interface Project {
  id: string;
  name: string;
  type: 'construction' | 'maintenance' | 'renovation' | 'repair';
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamSize: number;
  progress: number;
  description: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: 'supervisor' | 'worker' | 'technician' | 'helper';
  status: 'available' | 'busy' | 'off_duty';
  currentProject?: string;
  skills: string[];
  contact: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'in_progress' | 'completed';
  requestedBy: string;
  requestedAt: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  completionDate?: string;
}

const CivilSupervisorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects from Firebase
      const projectsRef = ref(database, 'civil_projects');
      const teamRef = ref(database, 'civil_team');
      const requestsRef = ref(database, 'civil_maintenance_requests');

      const [projectsSnapshot, teamSnapshot, requestsSnapshot] = await Promise.all([
        get(projectsRef),
        get(teamRef),
        get(requestsRef)
      ]);

      if (projectsSnapshot.exists()) {
        const projectsData = projectsSnapshot.val();
        const projectsArray = Object.entries(projectsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setProjects(projectsArray);
      } else {
        // Initialize with sample data
        const sampleProjects: Project[] = [
          {
            id: 'proj-1',
            name: 'Main Building Renovation',
            type: 'renovation',
            status: 'in_progress',
            priority: 'high',
            location: 'Main Campus',
            startDate: '2024-01-15',
            endDate: '2024-06-30',
            budget: 500000,
            spent: 320000,
            teamSize: 8,
            progress: 65,
            description: 'Complete renovation of the main academic building including electrical, plumbing, and structural improvements.'
          },
          {
            id: 'proj-2',
            name: 'Laboratory Equipment Installation',
            type: 'construction',
            status: 'planning',
            priority: 'medium',
            location: 'Science Block',
            startDate: '2024-03-01',
            endDate: '2024-04-30',
            budget: 200000,
            spent: 0,
            teamSize: 4,
            progress: 15,
            description: 'Installation of new laboratory equipment and safety systems.'
          },
          {
            id: 'proj-3',
            name: 'Parking Lot Expansion',
            type: 'construction',
            status: 'completed',
            priority: 'low',
            location: 'East Campus',
            startDate: '2023-11-01',
            endDate: '2024-02-28',
            budget: 150000,
            spent: 145000,
            teamSize: 6,
            progress: 100,
            description: 'Expansion of parking facilities to accommodate increased student population.'
          }
        ];
        setProjects(sampleProjects);
      }

      if (teamSnapshot.exists()) {
        const teamData = teamSnapshot.val();
        const teamArray = Object.entries(teamData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setTeamMembers(teamArray);
      } else {
        // Initialize with sample team data
        const sampleTeam: TeamMember[] = [
          {
            id: 'tm-1',
            name: 'Rajesh Kumar',
            role: 'supervisor',
            status: 'available',
            skills: ['Project Management', 'Structural Analysis', 'Safety Protocols'],
            contact: '+91-9876543210'
          },
          {
            id: 'tm-2',
            name: 'Amit Singh',
            role: 'technician',
            status: 'busy',
            currentProject: 'proj-1',
            skills: ['Electrical Work', 'Plumbing', 'HVAC'],
            contact: '+91-9876543211'
          },
          {
            id: 'tm-3',
            name: 'Suresh Patel',
            role: 'worker',
            status: 'available',
            skills: ['Carpentry', 'Masonry', 'Painting'],
            contact: '+91-9876543212'
          }
        ];
        setTeamMembers(sampleTeam);
      }

      if (requestsSnapshot.exists()) {
        const requestsData = requestsSnapshot.val();
        const requestsArray = Object.entries(requestsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setMaintenanceRequests(requestsArray);
      } else {
        // Initialize with sample maintenance requests
        const sampleRequests: MaintenanceRequest[] = [
          {
            id: 'req-1',
            title: 'Leaking Roof Repair',
            description: 'Water leakage in the computer lab ceiling needs immediate attention.',
            location: 'Computer Lab, Block A',
            priority: 'urgent',
            status: 'in_progress',
            requestedBy: 'Lab Assistant',
            requestedAt: '2024-01-20T10:30:00Z',
            assignedTo: 'tm-2',
            estimatedCost: 15000,
            actualCost: 12000
          },
          {
            id: 'req-2',
            title: 'Broken Window Replacement',
            description: 'Window frame damaged in classroom 101 needs replacement.',
            location: 'Classroom 101, Block B',
            priority: 'medium',
            status: 'approved',
            requestedBy: 'Teacher',
            requestedAt: '2024-01-18T14:20:00Z',
            estimatedCost: 8000
          }
        ];
        setMaintenanceRequests(sampleRequests);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'projects', label: 'Projects', icon: HardHat },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'maintenance-requests', label: 'Maintenance Requests', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
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

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Active Projects</p>
              <p className="text-3xl font-bold">{projects.filter(p => p.status === 'in_progress').length}</p>
            </div>
            <HardHat className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Team Members</p>
              <p className="text-3xl font-bold">{teamMembers.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending Requests</p>
              <p className="text-3xl font-bold">{maintenanceRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Budget Utilized</p>
              <p className="text-3xl font-bold">
                {Math.round((projects.reduce((sum, p) => sum + p.spent, 0) / 
                  projects.reduce((sum, p) => sum + p.budget, 0)) * 100)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Projects
          </h3>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.location}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-red-600" />
            Urgent Requests
          </h3>
          <div className="space-y-4">
            {maintenanceRequests
              .filter(req => req.priority === 'urgent')
              .slice(0, 3)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{request.title}</h4>
                    <p className="text-sm text-gray-600">{request.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">New Project</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-green-600 font-medium">Assign Team</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-purple-600 font-medium">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      {/* Projects Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
          <p className="text-gray-600">Monitor and manage all civil construction projects</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search projects..."
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
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects
          .filter(project => 
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterStatus === 'all' || project.status === filterStatus)
          )
          .map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="text-gray-800">{project.location}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress:</span>
                    <span className="text-gray-800">{project.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Budget:</span>
                    <span className="text-gray-800">₹{project.spent.toLocaleString()}/₹{project.budget.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Team Size:</span>
                    <span className="text-gray-800">{project.teamSize} members</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
          <p className="text-gray-600">Manage your construction and maintenance team</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Team</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Busy</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'busy').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Supervisors</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.role === 'supervisor').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{member.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTeamStatusColor(member.status)}`}>
                {member.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">
                  {member.currentProject ? `Project: ${member.currentProject}` : 'Available for assignment'}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <Zap className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{member.skills.slice(0, 2).join(', ')}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Bell className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{member.contact}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Assign
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and analytics</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Project Progress</h3>
              <p className="text-sm text-gray-600">Track project completion rates</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Team Performance</h3>
              <p className="text-sm text-gray-600">Analyze team productivity</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Budget Analysis</h3>
              <p className="text-sm text-gray-600">Financial overview and tracking</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600">Configure your dashboard preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about project status</p>
            </div>
            <button className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Auto-refresh</p>
              <p className="text-sm text-gray-600">Automatically update dashboard data</p>
            </div>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Civil Supervisor Dashboard</h1>
          <p className="text-gray-600">Manage civil works, structural maintenance, and construction projects</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
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
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'projects' && renderProjects()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'maintenance-requests' && <CivilSupervisorMaintenanceRequests />}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivilSupervisorDashboard; 