import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';
import { 
  Users, 
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Eye,
  Search,
  Filter,
  Building,
  GraduationCap,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DepartmentFaculty {
  id: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: number;
  status: 'active' | 'inactive';
  department: string;
}

interface FacultyStats {
  totalFaculty: number;
  activeFaculty: number;
  departments: number;
  averageExperience: number;
  departmentBreakdown: { department: string; count: number }[];
  designationBreakdown: { designation: string; count: number }[];
}

const PrincipalFaculty: React.FC = () => {
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState<DepartmentFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [stats, setStats] = useState<FacultyStats>({
    totalFaculty: 0,
    activeFaculty: 0,
    departments: 0,
    averageExperience: 0,
    departmentBreakdown: [],
    designationBreakdown: []
  });

  useEffect(() => {
    fetchAllFaculty();
  }, []);

  const fetchAllFaculty = async () => {
    try {
      setLoading(true);
      
      // Fetch all users and filter by role teacher
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const facultyData: DepartmentFaculty[] = [];
        const departmentStats: { [key: string]: number } = {};
        const designationStats: { [key: string]: number } = {};
        let totalExperience = 0;
        let activeCount = 0;
        
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          // Check if user is faculty (teacher)
          if (userData.role === 'teacher') {
            const facultyMember: DepartmentFaculty = {
              id: userSnapshot.key!,
              name: userData.name || '',
              designation: userData.designation || 'Teacher',
              email: userData.email || '',
              phone: userData.phone || '',
              subjects: userData.subjects || [],
              experience: userData.experience || 0,
              status: userData.status || 'active',
              department: userData.department || 'Unknown'
            };
            
            facultyData.push(facultyMember);
            
            // Calculate stats
            const dept = facultyMember.department;
            departmentStats[dept] = (departmentStats[dept] || 0) + 1;
            
            const designation = facultyMember.designation;
            designationStats[designation] = (designationStats[designation] || 0) + 1;
            
            totalExperience += facultyMember.experience;
            if (facultyMember.status === 'active') {
              activeCount++;
            }
          }
        });
        
        setFaculty(facultyData);
        
        // Calculate department breakdown
        const departmentBreakdown = Object.entries(departmentStats)
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count);
        
        // Calculate designation breakdown
        const designationBreakdown = Object.entries(designationStats)
          .map(([designation, count]) => ({ designation, count }))
          .sort((a, b) => b.count - a.count);
        
        setStats({
          totalFaculty: facultyData.length,
          activeFaculty: activeCount,
          departments: departmentBreakdown.length,
          averageExperience: facultyData.length > 0 ? Math.round(totalExperience / facultyData.length) : 0,
          departmentBreakdown,
          designationBreakdown
        });
        
        console.log('👥 PrincipalFaculty: Faculty found:', facultyData.length, 'across all departments');
        console.log('📊 PrincipalFaculty: Department breakdown:', departmentBreakdown);
      } else {
        setFaculty([]);
        console.log('👥 PrincipalFaculty: No users found');
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to load faculty');
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesDesignation = filterDesignation === 'all' || member.designation === filterDesignation;
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDesignation && matchesDepartment;
  });

  const getUniqueDepartments = () => {
    const departments = new Set(faculty.map(f => f.department));
    return Array.from(departments).sort();
  };

  const getUniqueDesignations = () => {
    const designations = new Set(faculty.map(f => f.designation));
    return Array.from(designations).sort();
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
            <h1 className="text-2xl font-bold text-gray-900">Principal Faculty Dashboard</h1>
            <p className="text-gray-600">View and manage faculty across all departments</p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">{stats.totalFaculty}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Faculty</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeFaculty}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-500">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Experience</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageExperience} years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department-wise Faculty Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.departmentBreakdown.map((dept, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{dept.department}</p>
                  <p className="text-sm text-gray-600">{dept.count} faculty members</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{dept.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Designations</option>
              {getUniqueDesignations().map(designation => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Faculty List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Faculty Members ({filteredFaculty.length})
          </h3>
        </div>
        
        {filteredFaculty.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No faculty members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
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
                {filteredFaculty.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{member.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{member.designation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.experience} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Designation Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Designation-wise Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.designationBreakdown.map((designation, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{designation.designation}</p>
                  <p className="text-sm text-gray-600">{designation.count} faculty members</p>
                </div>
                <div className="text-2xl font-bold text-green-600">{designation.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalFaculty; 