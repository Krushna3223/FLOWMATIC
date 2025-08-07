import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, onValue } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  Users, 
  Building, 
  AlertTriangle, 
  FileText,
  Bell,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Download,
  Search,
  Filter,
  Home,
  Bed,
  Wifi,
  Droplets,
  Zap,
  Settings,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import HostelComplaintManagement from './HostelComplaintManagement';

interface Student {
  id: string;
  name: string;
  roomNumber: string;
  block: string;
  floor: string;
  course: string;
  year: string;
  contact: string;
  email: string;
  checkInDate: string;
  status: 'active' | 'inactive' | 'graduated';
  emergencyContact: string;
}

interface Room {
  id: string;
  number: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: 'single' | 'double' | 'triple';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  facilities: string[];
  monthlyRent: number;
  lastCleaned: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'cleanliness' | 'security' | 'food' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  roomNumber: string;
  block: string;
}

interface HostelReport {
  id: string;
  title: string;
  type: 'occupancy' | 'maintenance' | 'complaints' | 'financial';
  generatedAt: string;
  period: string;
  data: any;
  status: 'draft' | 'generated' | 'sent';
}

const GirlsHostelRectorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reports, setReports] = useState<HostelReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from Firebase
      const studentsRef = ref(database, 'hostel_students');
      const roomsRef = ref(database, 'hostel_rooms');
      const complaintsRef = ref(database, 'hostel_complaints');
      const reportsRef = ref(database, 'hostel_reports');

      const [studentsSnapshot, roomsSnapshot, complaintsSnapshot, reportsSnapshot] = await Promise.all([
        get(studentsRef),
        get(roomsRef),
        get(complaintsRef),
        get(reportsRef)
      ]);

      if (studentsSnapshot.exists()) {
        const studentsData = studentsSnapshot.val();
        const studentsArray = Object.entries(studentsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setStudents(studentsArray);
      } else {
        // Initialize with sample data
        const sampleStudents: Student[] = [
          {
            id: 'std-1',
            name: 'Priya Sharma',
            roomNumber: 'A-101',
            block: 'A',
            floor: '1',
            course: 'Computer Science',
            year: '3rd Year',
            contact: '+91-9876543210',
            email: 'priya.sharma@email.com',
            checkInDate: '2023-08-15',
            status: 'active',
            emergencyContact: '+91-9876543211'
          },
          {
            id: 'std-2',
            name: 'Anjali Patel',
            roomNumber: 'B-205',
            block: 'B',
            floor: '2',
            course: 'Electrical Engineering',
            year: '2nd Year',
            contact: '+91-9876543212',
            email: 'anjali.patel@email.com',
            checkInDate: '2023-08-20',
            status: 'active',
            emergencyContact: '+91-9876543213'
          },
          {
            id: 'std-3',
            name: 'Meera Singh',
            roomNumber: 'A-102',
            block: 'A',
            floor: '1',
            course: 'Mechanical Engineering',
            year: '4th Year',
            contact: '+91-9876543214',
            email: 'meera.singh@email.com',
            checkInDate: '2023-08-10',
            status: 'active',
            emergencyContact: '+91-9876543215'
          }
        ];
        setStudents(sampleStudents);
      }

      if (roomsSnapshot.exists()) {
        const roomsData = roomsSnapshot.val();
        const roomsArray = Object.entries(roomsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setRooms(roomsArray);
      } else {
        // Initialize with sample room data
        const sampleRooms: Room[] = [
          {
            id: 'room-1',
            number: 'A-101',
            block: 'A',
            floor: '1',
            capacity: 2,
            occupied: 2,
            type: 'double',
            status: 'occupied',
            facilities: ['AC', 'WiFi', 'Attached Bathroom'],
            monthlyRent: 8000,
            lastCleaned: '2024-01-20'
          },
          {
            id: 'room-2',
            number: 'A-102',
            block: 'A',
            floor: '1',
            capacity: 2,
            occupied: 1,
            type: 'double',
            status: 'occupied',
            facilities: ['AC', 'WiFi', 'Attached Bathroom'],
            monthlyRent: 8000,
            lastCleaned: '2024-01-19'
          },
          {
            id: 'room-3',
            number: 'B-205',
            block: 'B',
            floor: '2',
            capacity: 3,
            occupied: 3,
            type: 'triple',
            status: 'occupied',
            facilities: ['AC', 'WiFi', 'Attached Bathroom', 'Balcony'],
            monthlyRent: 12000,
            lastCleaned: '2024-01-18'
          }
        ];
        setRooms(sampleRooms);
      }

      if (complaintsSnapshot.exists()) {
        const complaintsData = complaintsSnapshot.val();
        const complaintsArray = Object.entries(complaintsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setComplaints(complaintsArray);
      } else {
        // Initialize with sample complaint data
        const sampleComplaints: Complaint[] = [
          {
            id: 'comp-1',
            title: 'Water Supply Issue',
            description: 'No water supply in room A-101 since morning',
            category: 'maintenance',
            priority: 'high',
            status: 'in_progress',
            reportedBy: 'Priya Sharma',
            reportedAt: '2024-01-20T08:30:00Z',
            assignedTo: 'Maintenance Team',
            roomNumber: 'A-101',
            block: 'A'
          },
          {
            id: 'comp-2',
            title: 'Cleaning Request',
            description: 'Room needs cleaning service',
            category: 'cleanliness',
            priority: 'medium',
            status: 'pending',
            reportedBy: 'Anjali Patel',
            reportedAt: '2024-01-19T14:20:00Z',
            roomNumber: 'B-205',
            block: 'B'
          }
        ];
        setComplaints(sampleComplaints);
      }

      if (reportsSnapshot.exists()) {
        const reportsData = reportsSnapshot.val();
        const reportsArray = Object.entries(reportsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setReports(reportsArray);
      } else {
        // Initialize with sample report data
        const sampleReports: HostelReport[] = [
          {
            id: 'rep-1',
            title: 'Monthly Occupancy Report',
            type: 'occupancy',
            generatedAt: '2024-01-01T00:00:00Z',
            period: 'December 2023',
            data: { occupancyRate: 85, totalRooms: 50, occupiedRooms: 42 },
            status: 'generated'
          }
        ];
        setReports(sampleReports);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'rooms', label: 'Room Management', icon: Building },
    { id: 'complaints', label: 'Complaint Management', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'graduated': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplaintPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
              <p className="text-blue-100">Total Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Occupancy Rate</p>
              <p className="text-3xl font-bold">
                {Math.round((rooms.reduce((sum, r) => sum + r.occupied, 0) / 
                  rooms.reduce((sum, r) => sum + r.capacity, 0)) * 100)}%
              </p>
            </div>
            <Building className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending Complaints</p>
              <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'pending').length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Available Rooms</p>
              <p className="text-3xl font-bold">{rooms.filter(r => r.status === 'available').length}</p>
            </div>
            <Bed className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Complaints
          </h3>
          <div className="space-y-4">
            {complaints.slice(0, 3).map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{complaint.title}</h4>
                  <p className="text-sm text-gray-600">{complaint.roomNumber}, Block {complaint.block}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(complaint.reportedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplaintPriorityColor(complaint.priority)}`}>
                  {complaint.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-600" />
            Recent Check-ins
          </h3>
          <div className="space-y-4">
            {students.slice(0, 3).map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.roomNumber}, {student.course}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Check-in: {new Date(student.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {student.status}
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
            <span className="text-blue-600 font-medium">Add Student</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Building className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-green-600 font-medium">Room Assignment</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-purple-600 font-medium">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      {/* Students Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
          <p className="text-gray-600">Manage hostel students and their information</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search students..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students
          .filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterStatus === 'all' || student.status === filterStatus)
          )
          .map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.course}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Room {student.roomNumber}, Block {student.block}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{student.year}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{student.contact}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">{student.email}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-6">
      {/* Rooms Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
          <p className="text-gray-600">Monitor room occupancy and facilities</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </button>
      </div>

      {/* Room Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => r.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => r.status === 'occupied').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(r => r.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Room {room.number}</h3>
                <p className="text-sm text-gray-600">Block {room.block}, Floor {room.floor}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                {room.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Capacity:</span>
                <span className="text-gray-800">{room.occupied}/{room.capacity}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="text-gray-800 capitalize">{room.type}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rent:</span>
                <span className="text-gray-800">₹{room.monthlyRent.toLocaleString()}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {room.facilities.map((facility, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {facility}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-gray-500">
                Last cleaned: {new Date(room.lastCleaned).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                Assign
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
          <p className="text-gray-600">Generate comprehensive hostel reports</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Occupancy Report</h3>
              <p className="text-sm text-gray-600">Room utilization analysis</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Complaint Summary</h3>
              <p className="text-sm text-gray-600">Issue tracking and resolution</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-800">Financial Report</h3>
              <p className="text-sm text-gray-600">Revenue and expense tracking</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
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
              <p className="text-sm text-gray-600">Receive updates about complaints and issues</p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Girls Hostel Rector Dashboard</h1>
          <p className="text-gray-600">Manage hostel operations, student welfare, and facility maintenance</p>
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
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'rooms' && renderRooms()}
            {activeTab === 'complaints' && <HostelComplaintManagement />}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GirlsHostelRectorDashboard; 