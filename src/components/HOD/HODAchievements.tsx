import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, onValue, update, get, set } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Calendar,
  User,
  BookOpen,
  Trophy,
  Music,
  Code,
  Star,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Achievement } from '../../types';

const HODAchievements: React.FC = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'forwarded_to_hod' | 'approved_by_hod' | 'forwarded_to_principal' | 'rejected_by_hod'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      console.log('🔍 HODAchievements: Fetching achievements from database...');
      
      const achievementsRef = ref(database, 'achievements');
      const unsubscribe = onValue(achievementsRef, (snapshot) => {
        if (snapshot.exists()) {
          console.log('✅ HODAchievements: Found achievements data');
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
          console.log('✅ HODAchievements: Fetched', achievementsData.length, 'achievements');
      } else {
          console.log('⚠️ HODAchievements: No achievements found');
        setAchievements([]);
      }
      }, (error) => {
        console.error('❌ HODAchievements: Real-time listener error:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ HODAchievements: Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (achievementId: string, studentId: string) => {
    try {
      console.log('🔍 Approving achievement:', achievementId, 'for student:', studentId);
      
      // Find the achievement in the current list to get the correct path
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) {
        toast.error('Achievement not found');
        return;
      }

      console.log('🔍 Found achievement:', achievement);

      // Use the correct database path based on how achievements are stored
      const achievementRef = ref(database, `achievements/${studentId}/${achievementId}`);
      
      // First, get the current achievement data to preserve all existing fields
      const achievementSnapshot = await get(achievementRef);
      if (!achievementSnapshot.exists()) {
        toast.error('Achievement not found in database');
        return;
      }

      const currentData = achievementSnapshot.val();
      console.log('🔍 Current achievement data:', currentData);

      // Merge the current data with the approval data
      const updatedData = {
        ...currentData,
        status: 'approved_by_hod',
        hodComment: 'Approved by HOD',
        approvedBy: currentUser?.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔍 Updated achievement data:', updatedData);
      
      // Use set to replace the entire achievement with updated data
      await set(achievementRef, updatedData);

      toast.success('Achievement approved by HOD');
    } catch (error) {
      console.error('Error approving achievement:', error);
      toast.error('Failed to approve achievement');
    }
  };



  const handleReject = async (achievementId: string, studentId: string) => {
    try {
      console.log('🔍 Rejecting achievement:', achievementId, 'for student:', studentId);
      
      // Find the achievement in the current list to get the correct path
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) {
        toast.error('Achievement not found');
        return;
      }

      console.log('🔍 Found achievement:', achievement);

      // Use the correct database path based on how achievements are stored
      const achievementRef = ref(database, `achievements/${studentId}/${achievementId}`);
      
      // First, get the current achievement data to preserve all existing fields
      const achievementSnapshot = await get(achievementRef);
      if (!achievementSnapshot.exists()) {
        toast.error('Achievement not found in database');
        return;
      }

      const currentData = achievementSnapshot.val();
      console.log('🔍 Current achievement data:', currentData);

      // Merge the current data with the rejection data
      const updatedData = {
        ...currentData,
        status: 'rejected_by_hod',
        hodComment: 'Rejected by HOD',
        approvedBy: currentUser?.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔍 Updated achievement data:', updatedData);
      
      // Use set to replace the entire achievement with updated data
      await set(achievementRef, updatedData);

      toast.success('Achievement rejected by HOD');
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

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : Award;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = filter === 'all' || achievement.status === filter;
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    const searchMatch = 
      (achievement.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (achievement.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (achievement.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return statusMatch && categoryMatch && searchMatch;
  });

  const handleViewDetails = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Achievements</h1>
        <p className="text-gray-600">Review and approve student achievement submissions</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
            <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
              placeholder="Search by student name, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
                         <option value="all">All Status</option>
             <option value="forwarded_to_hod">Forwarded by Teacher</option>
             <option value="approved_by_hod">Approved by HOD</option>
             <option value="rejected_by_hod">Rejected by HOD</option>
          </select>
          
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
            </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <ArrowRight className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.status === 'forwarded_to_hod').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.status === 'approved_by_hod').length}
              </p>
            </div>
          </div>
        </div>
        
        
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.status === 'rejected_by_hod').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((achievement) => (
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
                           onClick={() => handleViewDetails(achievement)}
                           className="text-blue-600 hover:text-blue-900"
                           title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                         </button>
                         
                                                   {/* Show action buttons for pending or forwarded achievements */}
                          {(achievement.status === 'pending' || achievement.status === 'forwarded_to_hod' || achievement.status === 'approved_by_teacher') && (
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
                         {achievement.status === 'approved_by_hod' && (
                           <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg">
                             <CheckCircle className="h-4 w-4 mr-1" />
                             Approved by HOD
                           </span>
                         )}
                         
                         {achievement.status === 'rejected_by_hod' && (
                           <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg">
                             <XCircle className="h-4 w-4 mr-1" />
                             Rejected by HOD
                           </span>
                         )}
                         
                         {/* Show status for other processed achievements */}
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="text-gray-500">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">No achievements found</p>
                      <p className="text-sm">No achievements match your current filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAchievement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Name</label>
                  <p className="text-sm text-gray-900">{selectedAchievement.studentName}</p>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <p className="text-sm text-gray-900">{selectedAchievement.studentRollNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900">{selectedAchievement.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedAchievement.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedAchievement.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedAchievement.date).toLocaleDateString()}</p>
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700">Status</label>
                   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAchievement.status)}`}>
                     {getStatusIcon(selectedAchievement.status)}
                     <span className="ml-1">{selectedAchievement.status?.replace(/_/g, ' ') || 'Unknown'}</span>
                   </span>
                 </div>
                {selectedAchievement.teacherComment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teacher Comment</label>
                    <p className="text-sm text-gray-900">{selectedAchievement.teacherComment}</p>
                  </div>
                )}
                {selectedAchievement.hodComment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">HOD Comment</label>
                    <p className="text-sm text-gray-900">{selectedAchievement.hodComment}</p>
                  </div>
                )}
                {selectedAchievement.principalComment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Principal Comment</label>
                    <p className="text-sm text-gray-900">{selectedAchievement.principalComment}</p>
                </div>
                )}
                </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODAchievements; 