import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';

export const fixUserRole = async (userEmail: string, newRole: string) => {
  try {
    console.log(`🔧 Attempting to fix role for user: ${userEmail} to: ${newRole}`);
    
    // First, let's find the user by email
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      let userUid: string | null = null;
      let userData: any = null;
      
      // Find the user by email
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.email === userEmail) {
          userUid = childSnapshot.key;
          userData = data;
        }
      });
      
      if (userUid && userData) {
        console.log(`✅ Found user with UID: ${userUid}`);
        console.log(`📋 Current user data:`, userData);
        
        // Update the role
        const updatedUserData = {
          ...userData,
          role: newRole,
          updatedAt: new Date().toISOString()
        };
        
        // Save the updated user data
        await set(ref(database, `users/${userUid}`), updatedUserData);
        
        console.log(`✅ Successfully updated role for ${userEmail} to ${newRole}`);
        return true;
      } else {
        console.error(`❌ User with email ${userEmail} not found`);
        return false;
      }
    } else {
      console.error('❌ No users found in database');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fixing user role:', error);
    return false;
  }
};

// Function to fix the specific registrar user
export const fixRegistrarRole = async () => {
  return await fixUserRole('registrar@gmail.com', 'registrar');
};

// Function to fix the workshop instructor role
export const fixWorkshopInstructorRole = async () => {
  return await fixUserRole('workshop@gmail.com', 'workshop_instructor');
};

// Function to fix any user role by email
export const fixUserRoleByEmail = async (email: string, newRole: string) => {
  return await fixUserRole(email, newRole);
}; 