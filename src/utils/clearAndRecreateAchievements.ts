import { ref, remove, set, get } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Clear existing achievements and recreate with proper photo URLs
 */
export const clearAndRecreateAchievements = async () => {
  try {
    console.log('🗑️ Clearing existing achievements...');
    
    // Clear existing achievements
    const achievementsRef = ref(database, 'achievements');
    await remove(achievementsRef);
    
    console.log('✅ Existing achievements cleared');
    
    // Create new achievements with proper photo URLs
    const sampleAchievements = {
      "student_sample": {
        "achievement_001": {
          achievementId: "achievement_001",
          studentId: "student_sample",
          studentName: "Sample Student",
          title: "First Prize in Coding Competition",
          description: "Won first prize in inter-college coding competition organized by TechFest 2024",
          category: "technical",
          date: "2024-01-15",
          photoUrl: "https://i.ibb.co/9vK8MpL/coding-competition.jpg",
          status: "approved",
          createdAt: "2024-01-15T10:00:00.000Z",
          approvedAt: "2024-01-15T10:30:00.000Z",
          approvedBy: "principal_uid"
        },
        "achievement_002": {
          achievementId: "achievement_002",
          studentId: "student_sample",
          studentName: "Sample Student",
          title: "Best Project Award",
          description: "Received best project award for innovative AI-based attendance system",
          category: "academic",
          date: "2024-02-20",
          photoUrl: "https://i.ibb.co/0jK8MpL/project-award.jpg",
          status: "approved",
          createdAt: "2024-02-20T14:00:00.000Z",
          approvedAt: "2024-02-20T14:30:00.000Z",
          approvedBy: "principal_uid"
        }
      },
      "CSE2024001": {
        "achievement_003": {
          achievementId: "achievement_003",
          studentId: "CSE2024001",
          studentName: "CSE Student",
          title: "Sports Championship Winner",
          description: "Won college cricket championship as team captain",
          category: "sports",
          date: "2024-03-10",
          photoUrl: "https://i.ibb.co/1jK8MpL/sports-champion.jpg",
          status: "approved",
          createdAt: "2024-03-10T09:00:00.000Z",
          approvedAt: "2024-03-10T09:30:00.000Z",
          approvedBy: "principal_uid"
        },
        "achievement_004": {
          achievementId: "achievement_004",
          studentId: "CSE2024001",
          studentName: "CSE Student",
          title: "Cultural Event Organizer",
          description: "Successfully organized annual cultural fest with 500+ participants",
          category: "cultural",
          date: "2024-04-05",
          photoUrl: "https://i.ibb.co/VqKJ8Mp/cultural-event.jpg",
          status: "approved",
          createdAt: "2024-04-05T16:00:00.000Z",
          approvedAt: "2024-04-05T16:30:00.000Z",
          approvedBy: "principal_uid"
        }
      }
    };
    
    // Save new achievements
    await set(achievementsRef, sampleAchievements);
    
    console.log('✅ New achievements created with photo URLs');
    
    // Verify the data was saved correctly
    const verifySnapshot = await get(achievementsRef);
    if (verifySnapshot.exists()) {
      console.log('🔍 Verification - Achievements saved to database:');
      verifySnapshot.forEach((studentSnapshot) => {
        const studentAchievements = studentSnapshot.val();
        Object.keys(studentAchievements).forEach((achievementKey) => {
          const achievement = studentAchievements[achievementKey];
          console.log(`📋 Achievement: ${achievement.title} - Photo URL: ${achievement.photoUrl}`);
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing and recreating achievements:', error);
    return false;
  }
};

export default clearAndRecreateAchievements; 