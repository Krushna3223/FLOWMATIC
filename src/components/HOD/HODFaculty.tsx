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
  Filter
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
}

const HODFaculty: React.FC = () => {
  const { currentUser } = useAuth();
  const [faculty, setFaculty] = useState<DepartmentFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDesignation, setFilterDesignation] = useState('all');

  useEffect(() => {
    fetchDepartmentFaculty();
  }, []);

  const fetchDepartmentFaculty = async () => {
    try {
      setLoading(true);
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return;
      }

      // Fetch all users and filter by department and role
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const facultyData: DepartmentFaculty[] = [];
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          // Check if user is faculty (teacher) and belongs to this department
          if (userData.role === 'teacher' && userData.department === department) {
            facultyData.push({
              id: userSnapshot.key!,
              name: userData.name || '',
              designation: userData.designation || 'Teacher',
              email: userData.email || '',
              phone: userData.phone || '',
              subjects: userData.subjects || [],
              experience: userData.experience || 0,
              status: userData.status || 'active'
            });
          }
        });
        setFaculty(facultyData);
        console.log('👥 HODFaculty: Faculty found:', facultyData.length, 'for department:', department);
      } else {
        setFaculty([]);
        console.log('👥 HODFaculty: No users found');
      }
    } catch (error) {
      console.error('Error fetching department faculty:', error);
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
    
    return matchesSearch && matchesStatus && matchesDesignation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading faculty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600">Manage faculty members in your department</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Designations</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Faculty Members ({filteredFaculty.length})
          </h2>
          <div className="text-sm text-gray-500">
            Department: {currentUser?.department}
          </div>
        </div>
        <div className="p-6">
          {filteredFaculty.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaculty.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{member.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{member.designation}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{member.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{member.experience} years experience</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>Subjects:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.subjects.slice(0, 3).map((subject, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {subject}
                            </span>
                          ))}
                          {member.subjects.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{member.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500">No faculty found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HODFaculty; 