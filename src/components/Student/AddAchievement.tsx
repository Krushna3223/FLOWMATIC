import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, push, set } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  X, 
  Award,
  BookOpen,
  Trophy,
  Music,
  Code,
  Star
} from 'lucide-react';

interface AddAchievementProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAchievement: React.FC<AddAchievementProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic' as const,
    date: ''
  });

  const categories = [
    { value: 'academic', label: 'Academic', icon: BookOpen },
    { value: 'sports', label: 'Sports', icon: Trophy },
    { value: 'cultural', label: 'Cultural', icon: Music },
    { value: 'technical', label: 'Technical', icon: Code },
    { value: 'other', label: 'Other', icon: Star }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to add achievements');
      return;
    }

    if (!formData.title || !formData.description || !formData.date) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check if student has department set
    if (!currentUser.department) {
      toast.error('Department not set in your profile. Please contact administrator.');
      return;
    }

    setIsLoading(true);

    try {
      // Create achievement data
      const achievementData = {
        studentId: currentUser.uid,
        studentName: currentUser.name,
        studentRollNo: currentUser.rollNo || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        status: 'pending', // Requires approval workflow: Student → Teacher → HOD → Principal
        department: currentUser.department || '', // Add department field
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ensure department is set
      if (!achievementData.department) {
        console.error('❌ Student department is missing:', currentUser);
        toast.error('Your department is not set. Please contact administrator.');
        return;
      }

      console.log('📝 Submitting achievement data:', achievementData);
      console.log('📝 Current user data:', currentUser);

      // Validate required fields
      if (!achievementData.title || !achievementData.studentId || !achievementData.department) {
        console.error('❌ Missing required fields:', {
          title: achievementData.title,
          studentId: achievementData.studentId,
          department: achievementData.department
        });
        toast.error('Missing required data. Please check your profile information.');
        return;
      }

      // Save to database
      const achievementsRef = ref(database, 'achievements');
      const newAchievementRef = push(achievementsRef);
      console.log('📍 Saving to database path:', newAchievementRef.toString());
      console.log('📍 Achievement ID:', newAchievementRef.key);
      
      await set(newAchievementRef, achievementData);
      console.log('✅ Achievement saved successfully!');
      console.log('✅ Achievement ID:', newAchievementRef.key);

      toast.success('Achievement submitted successfully! It will be reviewed by your teacher.');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'academic',
        date: ''
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast.error('Failed to submit achievement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Achievement</h2>
              <p className="text-sm text-gray-600">Share your success story</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Enter achievement title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value as any }))}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 ${
                      formData.category === category.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              placeholder="Describe your achievement in detail..."
              required
            />
          </div>



          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Submit Achievement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAchievement; 