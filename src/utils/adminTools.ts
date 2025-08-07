import { ref, update, get } from "firebase/database";
import { database } from "../firebase/config";
import { toast } from "react-hot-toast";

// Update user role
export async function updateUserRole(uid: string, newRole: string) {
  try {
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, { role: newRole });
    console.log(`Role for user ${uid} updated to ${newRole}`);
    toast.success(`User role updated to ${newRole}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role');
    return false;
  }
}

// Get all users
export async function getAllUsers() {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const users: any[] = [];
      snapshot.forEach((childSnapshot) => {
        users.push({
          uid: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return users;
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
    return [];
  }
}

// Create a test certificate request
export async function createTestCertificateRequest() {
  try {
    const testRequest = {
      studentId: 'test-student-id',
      studentName: 'Test Student',
      type: 'Bonafide',
      purpose: 'Test purpose',
      status: 'pending',
      academicYear: '2025-26',
      branch: 'Computer Science',
      course: 'B-Tech',
      rollNo: '12345',
      year: '2025',
      dob: '2000-01-01',
      refNo: '',
      createdAt: Date.now(),
      adminComment: '',
      principalComment: ''
    };
    
    // This would normally use push() to create a new entry
    // For testing, we'll use a specific key
    const testKey = 'test-request-' + Date.now();
    await update(ref(database, `documentRequests/${testKey}`), testRequest);
    
    toast.success('Test certificate request created');
    return true;
  } catch (error) {
    console.error('Error creating test request:', error);
    toast.error('Failed to create test request');
    return false;
  }
} 