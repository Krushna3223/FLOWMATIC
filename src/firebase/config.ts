import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration using your actual Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyCDJ3PES6beqovsAXc5SC3Fm79SDObznZM",
  authDomain: "esp-32-sas.firebaseapp.com",
  databaseURL: "https://esp-32-sas-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp-32-sas",
  storageBucket: "esp-32-sas.firebasestorage.app",
  messagingSenderId: "16549519324",
  appId: "1:16549519324:web:0fc9a24e2959dc188bb919",
  measurementId: "G-387LHCGF4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Set persistence to LOCAL (survives page refresh)
// This must be called before any auth operations
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('❌ Error setting auth persistence:', error);
  });

// Debug: Check current auth state
auth.onAuthStateChanged((user) => {
  console.log('🔍 Firebase Auth State Check:', user ? `Logged in as ${user.email}` : 'No user');
});

export default app; 