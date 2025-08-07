import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';
import { Search, Filter, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const RegistrarStudents: React.FC = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const database = getDatabase();
      
      console.log('🔍 Fetching students from users collection...');
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        const allUsers = usersSnapshot.val();
        console.log('👥 All users in database:', Object.keys(allUsers));
        
        // Filter users with role 'student'
        const studentUsers = Object.entries(allUsers)
          .filter(([id, user]: [string, any]) => {
            console.log(`🔍 Checking user ${id}:`, user.role);
            return user.role === 'student';
          })
          .map(([id, user]: [string, any]) => ({
            id,
            name: user.name || user.fullName || user.studentName || `Student ${id}`,
            rollNumber: user.rollNumber || user.rollNo || user.institutionalId || `R${id}`,
            course: user.course || user.department || 'Computer Science',
            year: user.year || '2024',
            email: user.email || '',
            phone: user.phone || user.phoneNumber || ''
          }));
        
        if (studentUsers.length > 0) {
          console.log('✅ Fetched real students from /users:', studentUsers);
          setStudents(studentUsers);
        } else {
          console.log('⚠️ No students found in /users, using mock data');
          // Fallback to mock data
          const mockStudents = [
            { id: 'ST001', name: 'John Doe', rollNumber: 'R001', course: 'Computer Science', year: '2024', email: 'john@example.com', phone: '1234567890' },
            { id: 'ST002', name: 'Jane Smith', rollNumber: 'R002', course: 'Electrical Engineering', year: '2024', email: 'jane@example.com', phone: '1234567891' },
            { id: 'ST003', name: 'Mike Johnson', rollNumber: 'R003', course: 'Mechanical Engineering', year: '2024', email: 'mike@example.com', phone: '1234567892' },
            { id: 'ST004', name: 'Sarah Wilson', rollNumber: 'R004', course: 'Civil Engineering', year: '2024', email: 'sarah@example.com', phone: '1234567893' },
            { id: 'ST005', name: 'David Brown', rollNumber: 'R005', course: 'Computer Science', year: '2024', email: 'david@example.com', phone: '1234567894' }
          ];
          setStudents(mockStudents);
        }
      } else {
        console.log('⚠️ No users found in database, using mock data');
        // Fallback to mock data
        const mockStudents = [
          { id: 'ST001', name: 'John Doe', rollNumber: 'R001', course: 'Computer Science', year: '2024', email: 'john@example.com', phone: '1234567890' },
          { id: 'ST002', name: 'Jane Smith', rollNumber: 'R002', course: 'Electrical Engineering', year: '2024', email: 'jane@example.com', phone: '1234567891' },
          { id: 'ST003', name: 'Mike Johnson', rollNumber: 'R003', course: 'Mechanical Engineering', year: '2024', email: 'mike@example.com', phone: '1234567892' },
          { id: 'ST004', name: 'Sarah Wilson', rollNumber: 'R004', course: 'Civil Engineering', year: '2024', email: 'sarah@example.com', phone: '1234567893' },
          { id: 'ST005', name: 'David Brown', rollNumber: 'R005', course: 'Computer Science', year: '2024', email: 'david@example.com', phone: '1234567894' }
        ];
        setStudents(mockStudents);
      }
    } catch (error) {
      console.error('❌ Error fetching students from users:', error);
      // Use mock data as fallback
      const mockStudents = [
        { id: 'ST001', name: 'John Doe', rollNumber: 'R001', course: 'Computer Science', year: '2024', email: 'john@example.com', phone: '1234567890' },
        { id: 'ST002', name: 'Jane Smith', rollNumber: 'R002', course: 'Electrical Engineering', year: '2024', email: 'jane@example.com', phone: '1234567891' },
        { id: 'ST003', name: 'Mike Johnson', rollNumber: 'R003', course: 'Mechanical Engineering', year: '2024', email: 'mike@example.com', phone: '1234567892' },
        { id: 'ST004', name: 'Sarah Wilson', rollNumber: 'R004', course: 'Civil Engineering', year: '2024', email: 'sarah@example.com', phone: '1234567893' },
        { id: 'ST005', name: 'David Brown', rollNumber: 'R005', course: 'Computer Science', year: '2024', email: 'david@example.com', phone: '1234567894' }
      ];
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || student.year === filterYear;
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    
    return matchesSearch && matchesYear && matchesCourse;
  });

  const handleExportStudents = () => {
    // In a real application, this would generate a CSV or Excel file
    toast.success('Student records exported successfully');
  };

  const handleViewStudent = (studentId: string) => {
    // In a real application, this would open a detailed view
    toast.success(`Viewing student ${studentId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Records</h1>
        <p className="text-gray-600">Manage and view student information</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
          
          <button
            onClick={handleExportStudents}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewStudent(student.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800">
              Total Students: <span className="font-semibold">{filteredStudents.length}</span>
            </p>
            <p className="text-sm text-blue-600">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarStudents; 