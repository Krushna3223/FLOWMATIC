import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase/config';
import { ref, push } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { Award } from 'lucide-react';

const TestAchievement: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const createTestAchievement = async () => {
    if (!currentUser) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const achievementData = {
        title: 'Test Achievement',
        description: 'This is a test achievement for testing the teacher approval workflow',
        category: 'academic',
        date: new Date().toISOString(),
        studentName: 'Test Student',
        studentRollNo: 'TEST001',
        studentId: currentUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const achievementsRef = ref(database, `achievements/${currentUser.uid}`);
      await push(achievementsRef, achievementData);

      toast.success('Test achievement created successfully!');
      console.log('✅ Test achievement created:', achievementData);
    } catch (error) {
      console.error('❌ Error creating test achievement:', error);
      toast.error('Failed to create test achievement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Award className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Test Achievement Creator</h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          This page creates a test achievement with 'pending' status to test the teacher approval workflow.
        </p>

        <button
          onClick={createTestAchievement}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {loading ? 'Creating...' : 'Create Test Achievement'}
        </button>

        <div className="mt-4 text-sm text-gray-500">
          <p>After creating the test achievement:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Go to Teacher Dashboard</li>
            <li>Click on "Student Achievements"</li>
            <li>You should see the test achievement with approve/forward/reject buttons</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestAchievement; 