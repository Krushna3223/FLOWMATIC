import { ref, get, update } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Fix existing achievements by adding photo URLs to them
 */
export const fixExistingAchievements = async () => {
  try {
    console.log('🔧 Fixing existing achievements by adding photo URLs...');
    
    // Get existing achievements
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    if (!achievementsSnapshot.exists()) {
      console.log('❌ No achievements found in database');
      return false;
    }
    
    const updates: { [key: string]: any } = {};
    let fixedCount = 0;
    
    // Sample photo URLs for different categories
    const photoUrls = {
      technical: "https://i.ibb.co/9vK8MpL/coding-competition.jpg",
      academic: "https://i.ibb.co/0jK8MpL/project-award.jpg",
      sports: "https://i.ibb.co/1jK8MpL/sports-champion.jpg",
      cultural: "https://i.ibb.co/VqKJ8Mp/cultural-event.jpg",
      leadership: "https://i.ibb.co/9vK8MpL/coding-competition.jpg",
      innovation: "https://i.ibb.co/0jK8MpL/project-award.jpg"
    };
    
    achievementsSnapshot.forEach((studentSnapshot) => {
      const studentId = studentSnapshot.key;
      const studentAchievements = studentSnapshot.val();
      
      Object.keys(studentAchievements).forEach((achievementKey) => {
        const achievement = studentAchievements[achievementKey];
        
        // Only add photo URL if it doesn't exist
        if (!achievement.photoUrl && !achievement.photo && !achievement.imageUrl && !achievement.image) {
          const category = achievement.category || 'academic';
          const photoUrl = photoUrls[category as keyof typeof photoUrls] || photoUrls.academic;
          
          // Create the update path
          const updatePath = `achievements/${studentId}/${achievementKey}/photoUrl`;
          updates[updatePath] = photoUrl;
          
          console.log(`📸 Adding photo URL to achievement: ${achievement.title || achievementKey}`);
          console.log(`   Category: ${category}, Photo URL: ${photoUrl}`);
          fixedCount++;
        }
      });
    });
    
    if (Object.keys(updates).length > 0) {
      // Apply all updates at once
      await update(ref(database), updates);
      console.log(`✅ Fixed ${fixedCount} achievements with photo URLs`);
      
      // Verify the updates
      const verifySnapshot = await get(achievementsRef);
      if (verifySnapshot.exists()) {
        console.log('🔍 Verification - Checking updated achievements:');
        verifySnapshot.forEach((studentSnapshot) => {
          const studentId = studentSnapshot.key;
          const studentAchievements = studentSnapshot.val();
          
          Object.keys(studentAchievements).forEach((achievementKey) => {
            const achievement = studentAchievements[achievementKey];
            console.log(`📋 ${achievement.title || achievementKey}: Photo URL = ${achievement.photoUrl || 'NOT FOUND'}`);
          });
        });
      }
      
      return true;
    } else {
      console.log('✅ All achievements already have photo URLs');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error fixing achievements:', error);
    return false;
  }
};

export default fixExistingAchievements; 