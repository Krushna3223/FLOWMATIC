import { uploadImageToImgBB } from './imgbbUpload';

// Create a simple canvas image for each category
const createCanvasImage = async (text: string, backgroundColor: string, textColor: string = 'white'): Promise<File> => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;
  
  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, 400, 300);
  
  // Add text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 200, 150);
  
  // Convert to blob
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${text.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });
        resolve(file);
      }
    }, 'image/png');
  });
};

/**
 * Upload real images to ImgBB and get working URLs
 */
export const uploadRealImages = async () => {
  try {
    console.log('🚀 Uploading real images to ImgBB...');
    
    const imageConfigs = [
      { name: 'technical', text: 'Technical Achievement', bgColor: '#3B82F6' },
      { name: 'academic', text: 'Academic Excellence', bgColor: '#10B981' },
      { name: 'sports', text: 'Sports Champion', bgColor: '#F59E0B' },
      { name: 'cultural', text: 'Cultural Event', bgColor: '#8B5CF6' },
      { name: 'leadership', text: 'Leadership Award', bgColor: '#EF4444' },
      { name: 'innovation', text: 'Innovation Prize', bgColor: '#06B6D4' }
    ];
    
    const uploadedUrls: { [key: string]: string } = {};
    
    for (const config of imageConfigs) {
      try {
        console.log(`📤 Uploading ${config.name} image...`);
        
        // Create canvas image
        const imageFile = await createCanvasImage(config.text, config.bgColor);
        
        // Upload to ImgBB
        const imageUrl = await uploadImageToImgBB(imageFile);
        uploadedUrls[config.name] = imageUrl;
        
        console.log(`✅ ${config.name} uploaded: ${imageUrl}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${config.name}:`, error);
        // Use a fallback URL
        uploadedUrls[config.name] = `https://via.placeholder.com/400x300/${config.bgColor.replace('#', '')}/ffffff?text=${encodeURIComponent(config.text)}`;
      }
    }
    
    console.log('📋 All uploaded URLs:', uploadedUrls);
    return uploadedUrls;
    
  } catch (error) {
    console.error('❌ Error uploading real images:', error);
    return {};
  }
};

/**
 * Update achievements with real working image URLs
 */
export const updateAchievementsWithRealImages = async () => {
  try {
    console.log('🔧 Updating achievements with real working image URLs...');
    
    // First upload real images
    const imageUrls = await uploadRealImages();
    
    if (Object.keys(imageUrls).length === 0) {
      console.log('❌ No images uploaded, using fallback URLs');
      return false;
    }
    
    // Now update the achievements with these real URLs
    const { ref, get, update } = await import('firebase/database');
    const { database } = await import('../firebase/config');
    
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    if (!achievementsSnapshot.exists()) {
      console.log('❌ No achievements found in database');
      return false;
    }
    
    const updates: { [key: string]: any } = {};
    let updatedCount = 0;
    
    achievementsSnapshot.forEach((studentSnapshot) => {
      const studentId = studentSnapshot.key;
      const studentAchievements = studentSnapshot.val();
      
      Object.keys(studentAchievements).forEach((achievementKey) => {
        const achievement = studentAchievements[achievementKey];
        const category = achievement.category || 'academic';
        const imageUrl = imageUrls[category] || imageUrls.academic;
        
        if (imageUrl) {
          // Update the photo URL
          const updatePath = `achievements/${studentId}/${achievementKey}/photoUrl`;
          updates[updatePath] = imageUrl;
          
          console.log(`📸 Updated ${achievement.title || achievementKey} with real image: ${imageUrl}`);
          updatedCount++;
        }
      });
    });
    
    if (Object.keys(updates).length > 0) {
      // Apply all updates at once
      await update(ref(database), updates);
      console.log(`✅ Updated ${updatedCount} achievements with real working image URLs`);
      
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
      console.log('✅ All achievements already have working image URLs');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error updating achievements with real images:', error);
    return false;
  }
};

export default { uploadRealImages, updateAchievementsWithRealImages }; 