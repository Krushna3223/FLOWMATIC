import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get, update } from 'firebase/database';
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
  Star
} from 'lucide-react';
import { Achievement } from '../../types';

interface ViewAchievementsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewAchievements: React.FC<ViewAchievementsProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Categories', icon: Award },
    { value: 'academic', label: 'Academic', icon: BookOpen },
    { value: 'sports', label: 'Sports', icon: Trophy },
    { value: 'cultural', label: 'Cultural', icon: Music },
    { value: 'technical', label: 'Technical', icon: Code },
    { value: 'other', label: 'Other', icon: Star }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAchievements();
    }
  }, [isOpen]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching achievements from database...');
      
      // Try multiple possible paths and structures
      const possiblePaths = [
        'achievements',
        'studentAchievements', 
        'student_achievements',
        'achievement',
        'student_achievement',
        'studentAchievement',
        'student_achievement',
        'achievements_data',
        'student_achievements_data'
      ];
      
      for (const path of possiblePaths) {
        console.log(`📍 Trying path: ${path}`);
        const achievementsRef = ref(database, path);
        const snapshot = await get(achievementsRef);
        
        if (snapshot.exists()) {
          console.log(`✅ Found data at path: ${path}`);
          console.log('📊 Snapshot value:', snapshot.val());
          
          const achievementsData: Achievement[] = [];
          
          // Handle different data structures
          if (path === 'achievements') {
            // Structure: achievements/{userId}/{achievementId}
            snapshot.forEach((userSnapshot) => {
              const userId = userSnapshot.key;
              console.log(`🔍 Checking achievements for user: ${userId}`);
              
              userSnapshot.forEach((achievementSnapshot) => {
                const achievementData = achievementSnapshot.val();
                console.log('🏆 Achievement data:', achievementData);
                console.log('📸 Photo URL:', achievementData.photoUrl);
                achievementsData.push({
                  id: achievementSnapshot.key!,
                  ...achievementData
                });
              });
            });
          } else {
            // Structure: path/{achievementId} (flat structure)
            snapshot.forEach((childSnapshot) => {
              const achievementData = childSnapshot.val();
              console.log('🏆 Achievement data:', achievementData);
              console.log('📸 Photo URL:', achievementData.photoUrl);
              achievementsData.push({
                id: childSnapshot.key!,
                ...achievementData
              });
            });
          }
          
          console.log('📋 Total achievements found:', achievementsData.length);
          console.log('📋 Achievements:', achievementsData);
          setAchievements(achievementsData);
          return; // Exit after finding data
        } else {
          console.log(`❌ No data found at path: ${path}`);
        }
      }
      
      // Also check if achievements are saved under users/{studentId}/achievements
      console.log('🔍 Checking for achievements under users/{studentId}/achievements pattern...');
      try {
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const allAchievements: Achievement[] = [];
          
          const promises: Promise<void>[] = [];
          usersSnapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            if (userData && userData.role === 'student') {
              console.log(`🔍 Checking achievements for student: ${userData.name} (${userSnapshot.key})`);
              // Check if this student has achievements
              const studentAchievementsRef = ref(database, `users/${userSnapshot.key}/achievements`);
              const promise = get(studentAchievementsRef).then((achievementsSnapshot) => {
                if (achievementsSnapshot.exists()) {
                  console.log(`✅ Found achievements for student: ${userData.name}`);
                  achievementsSnapshot.forEach((achievementSnapshot) => {
                    const achievementData = achievementSnapshot.val();
                    console.log('🏆 Student achievement data:', achievementData);
                    allAchievements.push({
                      id: achievementSnapshot.key!,
                      ...achievementData
                    });
                  });
                }
              });
              promises.push(promise);
            }
          });
          
          // Wait for all promises to complete
          await Promise.all(promises);
          
          if (allAchievements.length > 0) {
            console.log('📋 Total achievements found under users:', allAchievements.length);
            setAchievements(allAchievements);
            return;
          }
        }
      } catch (error) {
        console.log('❌ Error checking user achievements:', error);
      }
      
      console.log('❌ No achievements found in any expected path');
      setAchievements([]);
    } catch (error) {
      console.error('❌ Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (achievementId: string, action: 'approve' | 'reject') => {
    try {
      const achievementRef = ref(database, `achievements/${achievementId}`);
      await update(achievementRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: currentUser?.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success(`Achievement ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchAchievements();
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast.error('Failed to update achievement');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : Award;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = filter === 'all' || achievement.status === filter;
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Student Achievements</h2>
              <p className="text-sm text-gray-600">View and manage student achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No achievements found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => {
                const CategoryIcon = getCategoryIcon(achievement.category);
                return (
                  <div key={achievement.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {achievement.category}
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(achievement.status)}`}>
                          {achievement.status}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {achievement.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {achievement.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{achievement.studentName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(achievement.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          // You can add a modal to show full details here
                          console.log('View achievement details:', achievement);
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAchievements; 