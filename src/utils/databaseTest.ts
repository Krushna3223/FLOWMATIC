import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Try to write a test value
    const testRef = ref(database, 'test/connection');
    await set(testRef, {
      timestamp: new Date().toISOString(),
      message: 'Database connection test'
    });
    console.log('✅ Database write successful');
    
    // Try to read the test value
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Database read successful:', snapshot.val());
    } else {
      console.log('❌ Database read failed - no data found');
    }
    
    // Clean up test data
    await set(testRef, null);
    console.log('✅ Database cleanup successful');
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

export const testUserData = async (userId: string) => {
  try {
    console.log('Testing user data for:', userId);
    
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      console.log('✅ User data found:', snapshot.val());
      return snapshot.val();
    } else {
      console.log('❌ No user data found for:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ User data test failed:', error);
    return null;
  }
}; 