import { ref, get, set, push } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-hot-toast';

// Debug function to check all data in Firebase
export async function debugFirebaseData() {
  try {
    console.log('🔍 Debugging Firebase Database Structure...');
    
    // Check documentRequests (actual path used by student portal)
    const requestsRef = ref(database, 'documentRequests');
    const requestsSnapshot = await get(requestsRef);
    console.log('📋 Document Requests Data:', requestsSnapshot.val());
    
    // Check if there are any other potential locations
    const rootRef = ref(database, '/');
    const rootSnapshot = await get(rootRef);
    console.log('🏠 Root Database Structure:', rootSnapshot.val());
    
    // Check for common alternative names
    const alternativePaths = [
      'certificateRequests',
      'certificates',
      'requests', 
      'studentRequests',
      'applications'
    ];
    
    for (const path of alternativePaths) {
      try {
        const altRef = ref(database, path);
        const altSnapshot = await get(altRef);
        if (altSnapshot.exists()) {
          console.log(`📁 Found data in "${path}":`, altSnapshot.val());
        }
      } catch (error) {
        console.log(`❌ No data in "${path}"`);
      }
    }
    
    toast.success('Database debug complete - check console');
    return true;
  } catch (error) {
    console.error('❌ Error debugging database:', error);
    toast.error('Failed to debug database');
    return false;
  }
}

// Function to create a properly structured test request
export async function createProperTestRequest() {
  try {
    const testRequest = {
      studentId: 'test-student-123',
      studentName: 'Test Student',
      type: 'Bonafide',
      purpose: 'Test purpose',
      status: 'pending', // Match your student portal status
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
    
    // Use push to create a new entry with auto-generated key
    const newRequestRef = push(ref(database, 'documentRequests'));
    await set(newRequestRef, testRequest);
    
    console.log('✅ Created test request with key:', newRequestRef.key);
    toast.success('Proper test request created');
    return true;
  } catch (error) {
    console.error('❌ Error creating proper test request:', error);
    toast.error('Failed to create test request');
    return false;
  }
} 