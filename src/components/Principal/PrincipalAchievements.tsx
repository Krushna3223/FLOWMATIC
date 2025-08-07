import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get, onValue, set } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  Users, 
  Trophy, 
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Download,
  X,
  BookOpen,
  Music,
  Code,
  Star,
  Building,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  User,
  FileText,
  BarChart3
} from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementStats {
  totalAchievements: number;
  totalStudents: number;
  studentsWithAchievements: number;
  thisMonthAchievements: number;
  topCategories: { category: string; count: number }[];
  departmentStats: { department: string; count: number }[];
}

const PrincipalAchievements: React.FC = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalAchievements: 0,
    totalStudents: 0,
    studentsWithAchievements: 0,
    thisMonthAchievements: 0,
    topCategories: [],
    departmentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Award },
    { value: 'academic', label: 'Academic', icon: BookOpen },
    { value: 'sports', label: 'Sports', icon: Trophy },
    { value: 'cultural', label: 'Cultural', icon: Music },
    { value: 'technical', label: 'Technical', icon: Code },
    { value: 'other', label: 'Other', icon: Star }
  ];

  useEffect(() => {
    fetchAchievements();
  }, [currentUser]);

  useEffect(() => {
    filterAchievements();
  }, [achievements, searchTerm, categoryFilter, departmentFilter, statusFilter]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      console.log('🔍 PrincipalAchievements: Fetching achievements from database...');
      
      const achievementsRef = ref(database, 'achievements');
      const unsubscribe = onValue(achievementsRef, (snapshot) => {
        if (snapshot.exists()) {
          console.log('✅ PrincipalAchievements: Found achievements data');
          const achievementsData: Achievement[] = [];
          
          snapshot.forEach((userSnapshot) => {
            const userId = userSnapshot.key;
            console.log(`🔍 Checking achievements for user: ${userId}`);
            
            userSnapshot.forEach((achievementSnapshot) => {
          const achievementData = achievementSnapshot.val();
              console.log('🏆 Achievement data:', achievementData);
              
              // Only add valid achievements with required fields
              if (achievementData && achievementData.title && achievementData.studentName) {
                achievementsData.push({
                  ...achievementData,
                  id: achievementSnapshot.key!, // Ensure Firebase key is used as ID
                  studentId: userId!, // Add the studentId for proper database operations
                });
              } else {
                console.log('⚠️ Skipping invalid achievement data:', achievementData);
              }
            });
          });
          
          // Sort by creation date (newest first)
          achievementsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAchievements(achievementsData);
          console.log('✅ PrincipalAchievements: Fetched', achievementsData.length, 'achievements');
          
          // Calculate stats
          calculateStats(achievementsData);
        } else {
          console.log('⚠️ PrincipalAchievements: No achievements found');
          setAchievements([]);
        }
      }, (error) => {
        console.error('❌ PrincipalAchievements: Real-time listener error:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ PrincipalAchievements: Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (achievementList: Achievement[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthAchievements = achievementList.filter(achievement => {
      const achievementDate = new Date(achievement.createdAt);
      return achievementDate.getMonth() === thisMonth && achievementDate.getFullYear() === thisYear;
    }).length;

    // Calculate category counts
    const categoryCounts: { [key: string]: number } = {};
    achievementList.forEach(achievement => {
      const category = achievement.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate department stats
    const departmentCounts: { [key: string]: number } = {};
    achievementList.forEach(achievement => {
      const department = achievement.department || 'Unknown';
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    const departmentStats = Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    setStats({
      totalAchievements: achievementList.length,
      totalStudents: new Set(achievementList.map(a => a.studentId)).size,
      studentsWithAchievements: new Set(achievementList.map(a => a.studentId)).size,
      thisMonthAchievements,
      topCategories,
      departmentStats
    });
  };

  const handleApprove = async (achievementId: string, studentId: string) => {
    try {
      console.log('🔍 Approving achievement:', achievementId, 'for student:', studentId);
      
      const achievementRef = ref(database, `achievements/${studentId}/${achievementId}`);
      console.log('🔍 Debug: Using path:', `achievements/${studentId}/${achievementId}`);
      
      // First, get the current achievement data to preserve all existing fields
      const achievementSnapshot = await get(achievementRef);
      if (!achievementSnapshot.exists()) {
        console.log('❌ Debug: Achievement not found at path:', `achievements/${studentId}/${achievementId}`);
        toast.error('Achievement not found in database');
        return;
      }

      const currentData = achievementSnapshot.val();
      console.log('🔍 Current achievement data:', currentData);

      // Merge the current data with the approval data
      const updatedData = {
        ...currentData,
        status: 'approved_by_principal',
        principalComment: 'Approved by Principal',
        approvedBy: currentUser?.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔍 Updated achievement data:', updatedData);
      
      // Use set to replace the entire achievement with updated data
      await set(achievementRef, updatedData);

      toast.success('Achievement approved by Principal');
    } catch (error) {
      console.error('Error approving achievement:', error);
      toast.error('Failed to approve achievement');
    }
  };

  const handleReject = async (achievementId: string, studentId: string) => {
    try {
      console.log('🔍 Rejecting achievement:', achievementId, 'for student:', studentId);
      
      const achievementRef = ref(database, `achievements/${studentId}/${achievementId}`);
      console.log('🔍 Debug: Using path:', `achievements/${studentId}/${achievementId}`);
      
      // First, get the current achievement data to preserve all existing fields
      const achievementSnapshot = await get(achievementRef);
      if (!achievementSnapshot.exists()) {
        console.log('❌ Debug: Achievement not found at path:', `achievements/${studentId}/${achievementId}`);
        toast.error('Achievement not found in database');
        return;
      }

      const currentData = achievementSnapshot.val();
      console.log('🔍 Current achievement data:', currentData);

      // Merge the current data with the rejection data
      const updatedData = {
        ...currentData,
        status: 'rejected_by_principal',
        principalComment: 'Rejected by Principal',
        approvedBy: currentUser?.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔍 Updated achievement data:', updatedData);
      
      // Use set to replace the entire achievement with updated data
      await set(achievementRef, updatedData);

      toast.success('Achievement rejected by Principal');
    } catch (error) {
      console.error('Error rejecting achievement:', error);
      toast.error('Failed to reject achievement');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved_by_teacher':
        return 'text-green-600 bg-green-100';
      case 'forwarded_to_hod':
        return 'text-blue-600 bg-blue-100';
      case 'approved_by_hod':
        return 'text-green-600 bg-green-100';
      case 'forwarded_to_principal':
        return 'text-indigo-600 bg-indigo-100';
      case 'approved_by_principal':
        return 'text-green-600 bg-green-100';
      case 'rejected_by_teacher':
        return 'text-red-600 bg-red-100';
      case 'rejected_by_hod':
        return 'text-red-600 bg-red-100';
      case 'rejected_by_principal':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved_by_teacher':
        return <CheckCircle className="h-4 w-4" />;
      case 'forwarded_to_hod':
        return <ArrowRight className="h-4 w-4" />;
      case 'approved_by_hod':
        return <CheckCircle className="h-4 w-4" />;
      case 'forwarded_to_principal':
        return <ArrowRight className="h-4 w-4" />;
      case 'approved_by_principal':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected_by_teacher':
        return <XCircle className="h-4 w-4" />;
      case 'rejected_by_hod':
        return <XCircle className="h-4 w-4" />;
      case 'rejected_by_principal':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterAchievements = () => {
    let filtered = achievements;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(achievement =>
        (achievement.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (achievement.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (achievement.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.category === categoryFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.department === departmentFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.status === statusFilter);
    }

    setFilteredAchievements(filtered);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : Award;
  };

  const handleViewAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const exportAchievements = (format: 'csv' | 'pdf') => {
    // Implementation for export functionality
    toast.success(`Exporting achievements as ${format.toUpperCase()}`);
  };

  const getUniqueCategories = () => {
    const categories = achievements.map(a => a.category).filter(Boolean);
    return Array.from(new Set(categories));
  };

  const getUniqueDepartments = () => {
    const departments = achievements.map(a => a.department).filter(Boolean);
    return Array.from(new Set(departments));
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Principal Dashboard</h1>
          <p className="text-gray-600">Manage and approve student achievements across all departments</p>
          </div>
        <div className="flex space-x-2">
            <button
              onClick={() => exportAchievements('csv')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => exportAchievements('pdf')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
            </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAchievements}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students with Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.studentsWithAchievements}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonthAchievements}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.departmentStats.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.departmentStats.map((dept) => (
            <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{dept.department}</p>
                  <p className="text-sm text-gray-600">{dept.count} achievements</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{dept.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved_by_teacher">Approved by Teacher</option>
              <option value="forwarded_to_hod">Forwarded to HOD</option>
              <option value="approved_by_hod">Approved by HOD</option>
              <option value="forwarded_to_principal">Forwarded to Principal</option>
              <option value="approved_by_principal">Approved by Principal</option>
              <option value="rejected_by_teacher">Rejected by Teacher</option>
              <option value="rejected_by_hod">Rejected by HOD</option>
              <option value="rejected_by_principal">Rejected by Principal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Achievements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Achievements ({filteredAchievements.length})
          </h3>
        </div>
        
        {filteredAchievements.length === 0 ? (
          <div className="p-6 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No achievements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Achievement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
            {filteredAchievements.map((achievement) => (
                  <tr key={achievement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{achievement.studentName}</div>
                        <div className="text-sm text-gray-500">{achievement.studentRollNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{achievement.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {React.createElement(getCategoryIcon(achievement.category), { className: "h-4 w-4 mr-2" })}
                        <span className="text-sm text-gray-900 capitalize">{achievement.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {achievement.department || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(achievement.status)}`}>
                        {getStatusIcon(achievement.status)}
                        <span className="ml-1">{achievement.status?.replace(/_/g, ' ') || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(achievement.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAchievement(achievement)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                      <Eye className="h-4 w-4" />
                        </button>
                        
                        {/* Show action buttons for achievements that can be approved by Principal */}
                        {(achievement.status === 'approved_by_hod' || achievement.status === 'forwarded_to_principal') && (
                          <>
                            <button
                              onClick={() => handleApprove(achievement.id, achievement.studentId)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 mr-2"
                              title="Approve Achievement"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(achievement.id, achievement.studentId)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                              title="Reject Achievement"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {/* Show status for processed achievements */}
                        {achievement.status === 'approved_by_principal' && (
                          <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approved by Principal
                          </span>
                        )}
                        
                        {achievement.status === 'rejected_by_principal' && (
                          <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg">
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejected by Principal
                          </span>
                        )}
                        
                        {/* Show status for other processed achievements */}
                        {achievement.status === 'approved_by_teacher' && (
                          <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approved by Teacher
                          </span>
                        )}
                        
                        {achievement.status === 'approved_by_hod' && (
                          <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approved by HOD
                          </span>
                        )}
                        
                        {/* Show for unknown status */}
                        {!achievement.status && (
                          <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg">
                            <Clock className="h-4 w-4 mr-1" />
                            Unknown Status
                          </span>
                        )}
                    </div>
                    </td>
                  </tr>
            ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Achievement Details Modal */}
      {showAchievementModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Achievement Details</h2>
              <button
                onClick={() => setShowAchievementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedAchievement.title}</h3>
                <p className="text-sm text-gray-600">{selectedAchievement.studentName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{selectedAchievement.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Category</p>
                  <p className="text-sm text-gray-900">{selectedAchievement.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Department</p>
                  <p className="text-sm text-gray-900">{selectedAchievement.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAchievement.status)}`}>
                    {getStatusIcon(selectedAchievement.status)}
                    <span className="ml-1">{selectedAchievement.status?.replace(/_/g, ' ') || 'Unknown'}</span>
                  </span>
                </div>
                {selectedAchievement.teacherComment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Teacher Comment</p>
                    <p className="text-sm text-gray-900">{selectedAchievement.teacherComment}</p>
                  </div>
                )}
                {selectedAchievement.hodComment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">HOD Comment</p>
                    <p className="text-sm text-gray-900">{selectedAchievement.hodComment}</p>
                  </div>
                )}
                {selectedAchievement.principalComment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Principal Comment</p>
                    <p className="text-sm text-gray-900">{selectedAchievement.principalComment}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedAchievement.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedAchievement.photoUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>
                  <img 
                    src={selectedAchievement.photoUrl} 
                    alt="Achievement" 
                    className="w-full max-w-md rounded-lg"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', selectedAchievement.photoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', selectedAchievement.photoUrl);
                    }}
                  />
                </div>
              )}
              {!selectedAchievement.photoUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>
                  <p className="text-sm text-gray-500">No photo uploaded for this achievement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalAchievements; 