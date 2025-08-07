import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  BookOpen,
  Trophy,
  Music,
  Code,
  Star,
  ArrowRight
} from 'lucide-react';
import { Achievement } from '../../types';

const StudentAchievements: React.FC = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      console.log('🔍 StudentAchievements: Fetching achievements from database...');
      
      const achievementsRef = ref(database, `achievements/${currentUser?.uid}`);
      const unsubscribe = onValue(achievementsRef, (snapshot) => {
        if (snapshot.exists()) {
          console.log('✅ StudentAchievements: Found achievements data');
          const achievementsData: Achievement[] = [];
          
          snapshot.forEach((achievementSnapshot) => {
            const achievementData = achievementSnapshot.val();
            console.log('🏆 Achievement data:', achievementData);
            achievementsData.push({
              id: achievementSnapshot.key!,
              ...achievementData
            });
          });
          
          // Sort by creation date (newest first)
          achievementsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAchievements(achievementsData);
          console.log('✅ StudentAchievements: Fetched', achievementsData.length, 'achievements');
        } else {
          console.log('⚠️ StudentAchievements: No achievements found');
          setAchievements([]);
        }
      }, (error) => {
        console.error('❌ StudentAchievements: Real-time listener error:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ StudentAchievements: Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your achievement is pending review by your teacher';
      case 'approved_by_teacher':
        return 'Your achievement has been approved by your teacher';
      case 'forwarded_to_hod':
        return 'Your achievement has been forwarded to HOD for review';
      case 'approved_by_hod':
        return 'Your achievement has been approved by HOD';
      case 'forwarded_to_principal':
        return 'Your achievement has been forwarded to Principal for final review';
      case 'approved_by_principal':
        return 'Congratulations! Your achievement has been approved by Principal';
      case 'rejected_by_teacher':
        return 'Your achievement was rejected by your teacher';
      case 'rejected_by_hod':
        return 'Your achievement was rejected by HOD';
      case 'rejected_by_principal':
        return 'Your achievement was rejected by Principal';
      default:
        return 'Status unknown';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = statusFilter === 'all' || achievement.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return statusMatch && categoryMatch;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Achievements</h1>
        <p className="text-gray-600">Track the status of your achievement submissions</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.status === 'approved_by_teacher' || a.status === 'approved_by_hod' || a.status === 'approved_by_principal').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.status === 'pending' || a.status === 'forwarded_to_hod' || a.status === 'forwarded_to_principal').length}
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
                {achievements.filter(a => a.status.includes('rejected')).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Achievements Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {React.createElement(getCategoryIcon(achievement.category), { className: "h-5 w-5 mr-2" })}
                    <span className="text-sm font-medium text-gray-900 capitalize">{achievement.category}</span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(achievement)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{achievement.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Date</span>
                    <span className="text-xs text-gray-900">{new Date(achievement.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(achievement.status)}`}>
                      {getStatusIcon(achievement.status)}
                      <span className="ml-1">{achievement.status.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-3 p-2 bg-gray-50 rounded">
                    {getStatusMessage(achievement.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No achievements found</p>
          <p className="text-sm text-gray-500">No achievements match your current filters</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAchievement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Details</h3>
              <div className="space-y-3">
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
                    <span className="ml-1">{selectedAchievement.status.replace(/_/g, ' ')}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Message</label>
                  <p className="text-sm text-gray-900">{getStatusMessage(selectedAchievement.status)}</p>
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

export default StudentAchievements; 