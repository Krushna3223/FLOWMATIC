import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Users,
  Building,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Wrench,
  BookOpen,
  Package,
  Database,
  Truck,
  MapPin,
  Droplets,
  Flame,
  HardHat,
  Bell,
  FlaskConical,
  Calculator,
  Cpu,
  Zap
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  status: string;
  joinDate: string;
  lastUpdated: string;
}

interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  departments: number;
  roleBreakdown: { role: string; count: number }[];
  departmentBreakdown: { department: string; count: number }[];
}

const PrincipalStaff: React.FC = () => {
  const { currentUser } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    departments: 0,
    roleBreakdown: [],
    departmentBreakdown: []
  });

  useEffect(() => {
    fetchAllStaff();
  }, []);

  const fetchAllStaff = async () => {
    try {
      setLoading(true);
      
      // Fetch all users and filter by non-teaching staff roles
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const staffData: StaffMember[] = [];
        const roleStats: { [key: string]: number } = {};
        const departmentStats: { [key: string]: number } = {};
        let activeCount = 0;
        
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          // Check if user is any staff member (non-teaching staff, teachers, or HODs)
          const allStaffRoles = [
            'workshop_instructor', 'electrician', 'computer_technician',
            'asst_librarian', 'asst_store', 'tech_lab_asst', 'lab_asst_civil',
            'clerk', 'security_guard', 'fire_operator', 'accounts_asst',
            'civil_supervisor', 'plumber', 'girls_hostel_rector', 'peon',
            'etp_operator', 'registrar', 'teacher', 'hod'
          ];
          
          if (allStaffRoles.includes(userData.role)) {
            const staffMember: StaffMember = {
              id: userSnapshot.key!,
              name: userData.name || userData.fullName || 'Unknown',
              email: userData.email || '',
              phone: userData.phone || '',
              role: userData.role || '',
              department: userData.department || 'General',
              designation: userData.designation || userData.role || '',
              status: userData.status || 'active',
              joinDate: userData.joinDate || userData.createdAt || new Date().toISOString(),
              lastUpdated: userData.updatedAt || userData.createdAt || new Date().toISOString()
            };
            
            staffData.push(staffMember);
            
            // Calculate stats
            const role = staffMember.role;
            roleStats[role] = (roleStats[role] || 0) + 1;
            
            const dept = staffMember.department;
            departmentStats[dept] = (departmentStats[dept] || 0) + 1;
            
            if (staffMember.status === 'active') {
              activeCount++;
            }
          }
        });
        
        // Calculate role breakdown
        const roleBreakdown = Object.entries(roleStats)
          .map(([role, count]) => ({ role, count }))
          .sort((a, b) => b.count - a.count);
        
        // Calculate department breakdown
        const departmentBreakdown = Object.entries(departmentStats)
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count);
        
        setStats({
          totalStaff: staffData.length,
          activeStaff: activeCount,
          departments: departmentBreakdown.length,
          roleBreakdown,
          departmentBreakdown
        });
        
        setStaff(staffData);
        console.log('👥 PrincipalStaff: Staff found:', staffData.length, 'members');
        console.log('📊 PrincipalStaff: Role breakdown:', roleBreakdown);
      } else {
        setStaff([]);
        console.log('👥 PrincipalStaff: No users found');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff data');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'workshop_instructor':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'electrician':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'computer_technician':
        return <Cpu className="h-4 w-4 text-purple-600" />;
      case 'asst_librarian':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'asst_store':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'tech_lab_asst':
        return <FlaskConical className="h-4 w-4 text-indigo-600" />;
      case 'lab_asst_civil':
        return <HardHat className="h-4 w-4 text-red-600" />;
      case 'clerk':
        return <UserCheck className="h-4 w-4 text-gray-600" />;
      case 'security_guard':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'fire_operator':
        return <Flame className="h-4 w-4 text-red-600" />;
      case 'accounts_asst':
        return <Calculator className="h-4 w-4 text-green-600" />;
      case 'civil_supervisor':
        return <Building className="h-4 w-4 text-gray-600" />;
      case 'plumber':
        return <Droplets className="h-4 w-4 text-blue-600" />;
      case 'girls_hostel_rector':
        return <Users className="h-4 w-4 text-pink-600" />;
      case 'peon':
        return <Truck className="h-4 w-4 text-gray-600" />;
      case 'etp_operator':
        return <Droplets className="h-4 w-4 text-cyan-600" />;
             case 'registrar':
         return <Database className="h-4 w-4 text-purple-600" />;
       case 'teacher':
         return <GraduationCap className="h-4 w-4 text-blue-600" />;
       case 'hod':
         return <Building className="h-4 w-4 text-indigo-600" />;
       default:
         return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getUniqueRoles = () => {
    const roles = new Set(staff.map(s => s.role));
    return Array.from(roles).sort();
  };

  const getUniqueDepartments = () => {
    const departments = new Set(staff.map(s => s.department));
    return Array.from(departments).sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
                         <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
             <p className="text-gray-600">View and manage all staff members including teachers, HODs, and non-teaching staff</p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">{stats.totalStaff}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStaff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.roleBreakdown.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              {getUniqueRoles().map(role => (
                <option key={role} value={role}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Staff Members ({filteredStaff.length})
          </h3>
        </div>
        
        {filteredStaff.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
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
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(member.role)}
                        <span className="ml-2 text-sm text-gray-900">{getRoleDisplayName(member.role)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{member.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalStaff;
