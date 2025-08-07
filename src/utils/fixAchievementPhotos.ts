import { ref, get, update } from 'firebase/database';
import { database } from '../firebase/config';
import { isGoogleDriveUrl, getGoogleDriveImageUrl } from './googleDriveUpload';

/**
 * Check if a URL is a real student-uploaded image or a placeholder
 */
const isRealStudentImage = (url: string): boolean => {
  if (!url) return false;

  // 1. Check for Google Drive URLs - these are real student uploads
  if (isGoogleDriveUrl(url)) {
    console.log('🔍 Google Drive URL detected - Real student image');
    return true;
  }

  // 2. Check for old ImgBB and via.placeholder.com patterns
  const oldPlaceholderPatterns = [
    /i\.ibb\.co\/[a-zA-Z0-9]+\/sports-champion\.png/,
    /i\.ibb\.co\/[a-zA-Z0-9]+\/academic-excellence\.png/,
    /i\.ibb\.co\/[a-zA-Z0-9]+\/technical-achievement\.png/,
    /i\.ibb\.co\/[a-zA-Z0-9]+\/cultural-event\.png/,
    /i\.ibb\.co\/[a-zA-Z0-9]+\/leadership-award\.png/,
    /i\.ibb\.co\/[a-zA-Z0-9]+\/innovation-prize\.png/,
    /via\.placeholder\.com/,
    /sports-champion\.png/, // generic filename check
    /academic-excellence\.png/,
    /technical-achievement\.png/,
    /cultural-event\.png/,
    /leadership-award\.png/,
    /innovation-prize\.png/
  ];
  const isOldPlaceholder = oldPlaceholderPatterns.some(pattern => pattern.test(url));

  // 3. Check for our new SVG data URLs by decoding and checking content
  let isOurNewSVGPlaceholder = false;
  if (url.startsWith('data:image/svg+xml;base64,')) {
    try {
      const base64Part = url.replace('data:image/svg+xml;base64,', '');
      const decodedSvg = atob(base64Part);
      
      const svgContentMarkers = [
        'Technical Achievement',
        'Academic Excellence',
        'Sports Champion',
        'Cultural Event',
        'Leadership Award',
        'Innovation Prize'
      ];
      
      isOurNewSVGPlaceholder = svgContentMarkers.some(marker => decodedSvg.includes(marker));

      // Debug logging for SVG detection
      console.log('🔍 SVG URL Analysis:', {
        url: url.substring(0, 100) + '...',
        decodedSvg: decodedSvg.substring(0, 100) + '...',
        isOurNewSVGPlaceholder
      });

    } catch (e) {
      console.error('Error decoding SVG base64 for detection:', e);
      isOurNewSVGPlaceholder = false; // If decoding fails, it's not our known SVG placeholder
    }
  }

  // Overall determination: if it's any of our known placeholder types, it's NOT a real student image.
  const isAnyKnownPlaceholder = isOldPlaceholder || isOurNewSVGPlaceholder;

  // Debug logging for overall check
  console.log('🔍 URL Analysis (Overall):', {
    url: url.substring(0, 100) + '...',
    isOldPlaceholder,
    isOurNewSVGPlaceholder,
    isAnyKnownPlaceholder,
    isReal: !isAnyKnownPlaceholder
  });

  return !isAnyKnownPlaceholder;
};

/**
 * Create a proper placeholder image URL for achievements without real photos
 */
const createPlaceholderUrl = (category: string): string => {
  const colors = {
    technical: '#10B981', // green
    academic: '#3B82F6', // blue
    sports: '#F59E0B', // amber
    cultural: '#8B5CF6', // purple
    leadership: '#EF4444', // red
    innovation: '#06B6D4' // cyan
  };

  const color = colors[category as keyof typeof colors] || '#6B7280';
  const title = category.charAt(0).toUpperCase() + category.slice(1) + ' Achievement';

  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Fix achievement photos by preserving real student uploads and using proper placeholders
 */
export const fixAchievementPhotos = async () => {
  try {
    console.log('🔧 Starting achievement photos fix...');
    
    const achievementsRef = ref(database, 'achievements');
    const snapshot = await get(achievementsRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No achievements found in database');
      return false;
    }

    let fixedCount = 0;
    let preservedCount = 0;
    const updates: { [key: string]: any } = {};

    snapshot.forEach((studentSnapshot) => {
      const studentId = studentSnapshot.key;
      const studentAchievements = studentSnapshot.val();
      
      Object.keys(studentAchievements).forEach((achievementKey) => {
        const achievement = studentAchievements[achievementKey];
        const photoUrl = achievement.photoUrl || achievement.photo || achievement.imageUrl || achievement.image;
        
        if (photoUrl) {
          const isReal = isRealStudentImage(photoUrl);
          
          if (!isReal) {
            // This is a placeholder, replace with a proper SVG placeholder
            const newPlaceholderUrl = createPlaceholderUrl(achievement.category || 'technical');
            
            if (!updates[studentId]) {
              updates[studentId] = {};
            }
            if (!updates[studentId][achievementKey]) {
              updates[studentId][achievementKey] = {};
            }
            
            updates[studentId][achievementKey].photoUrl = newPlaceholderUrl;
            fixedCount++;
            
            console.log(`🔧 Fixed achievement ${achievementKey} for student ${studentId}`);
          } else {
            preservedCount++;
            console.log(`✅ Preserved real photo for achievement ${achievementKey} (student ${studentId})`);
          }
        } else {
          // No photo URL, add a placeholder
          const newPlaceholderUrl = createPlaceholderUrl(achievement.category || 'technical');
          
          if (!updates[studentId]) {
            updates[studentId] = {};
          }
          if (!updates[studentId][achievementKey]) {
            updates[studentId][achievementKey] = {};
          }
          
          updates[studentId][achievementKey].photoUrl = newPlaceholderUrl;
          fixedCount++;
          
          console.log(`🔧 Added placeholder for achievement ${achievementKey} (student ${studentId})`);
        }
      });
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(database, 'achievements'), updates);
      console.log(`✅ Achievement photos fix completed: ${fixedCount} fixed, ${preservedCount} preserved`);
    } else {
      console.log('✅ No achievement photos needed fixing');
    }

    return true;
  } catch (error) {
    console.error('❌ Error fixing achievement photos:', error);
    return false;
  }
};

/**
 * Check if an achievement has a real student-uploaded photo
 */
export const hasRealStudentPhoto = (achievement: any): boolean => {
  const photoUrl = achievement.photoUrl || achievement.photo || achievement.imageUrl || achievement.image;
  const isReal = isRealStudentImage(photoUrl);
  
  // Debug logging
  console.log('🔍 Photo URL Check:', photoUrl);
  console.log('📸 Is Real Student Photo:', isReal);
  
  return isReal;
};

/**
 * Get the proper photo URL for an achievement
 */
export const getAchievementPhotoUrl = (achievement: any): string => {
  const photoUrl = achievement.photoUrl || achievement.photo || achievement.imageUrl || achievement.image;
  
  if (!photoUrl) {
    return createPlaceholderUrl(achievement.category || 'technical');
  }
  
  // If it's a Google Drive URL, convert it to a direct image URL
  if (isGoogleDriveUrl(photoUrl)) {
    return getGoogleDriveImageUrl(photoUrl);
  }
  
  return photoUrl;
};

/**
 * Test function to verify placeholder detection
 */
export const testPlaceholderDetection = () => {
  const testUrls = [
    // Our SVG placeholders (should be detected as placeholders)
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjU5RTBCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TcG9ydHMgQ2hhbXBpb248L3RleHQ+PC9zdmc+",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTBCOTgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BY2FkZW1pYyBFeGNlbGxlbmNlPC90ZXh0Pjwvc3ZnPg==",
    // Real student photos (should be detected as real)
    "https://i.ibb.co/abc123/real-student-photo.jpg",
    "https://example.com/student-upload.jpg",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k="
  ];
  
  console.log('🧪 Testing placeholder detection...');
  testUrls.forEach((url, index) => {
    const isReal = isRealStudentImage(url);
    console.log(`Test ${index + 1}: ${isReal ? '✅ Real Photo' : '❌ Placeholder'} - ${url.substring(0, 50)}...`);
  });
};

/**
 * Test function to decode base64 and check content
 */
export const testBase64Content = () => {
  const testUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjU5RTBCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TcG9ydHMgQ2hhbXBpb248L3RleHQ+PC9zdmc+";
  
  // Extract base64 part
  const base64Part = testUrl.replace('data:image/svg+xml;base64,', '');
  
  try {
    // Decode base64
    const decoded = atob(base64Part);
    console.log('🔍 Decoded SVG content:', decoded);
    
    // Check for specific text
    console.log('🔍 Contains "Sports Champion":', decoded.includes('Sports Champion'));
    console.log('🔍 Contains "Academic Excellence":', decoded.includes('Academic Excellence'));
    console.log('🔍 Contains "Technical Achievement":', decoded.includes('Technical Achievement'));
    
  } catch (error) {
    console.error('❌ Error decoding base64:', error);
  }
};

export default { fixAchievementPhotos, hasRealStudentPhoto, getAchievementPhotoUrl }; 