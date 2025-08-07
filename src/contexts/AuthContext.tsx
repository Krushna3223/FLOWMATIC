import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../firebase/config';
import { User } from '../types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias for currentUser for backward compatibility
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Try to restore user from localStorage on initial load
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('🔄 AuthProvider: Restored user from localStorage:', user.email);
        return user;
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    // Check if there's already a user logged in
    const currentAuthUser = auth.currentUser;
    console.log('🔍 AuthProvider: Current auth user on mount:', currentAuthUser?.email);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔄 Auth state changed:', firebaseUser?.email);
      
      if (firebaseUser) {
        try {
          console.log('✅ AuthProvider: User found, fetching user data...');
          console.log('🔍 User UID:', firebaseUser.uid);
          console.log('🔍 User email:', firebaseUser.email);
          
          // Get user role from database
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          console.log('📍 Fetching from database path: users/' + firebaseUser.uid);
          
          const snapshot = await get(userRef);
          
          console.log('📊 User data from database:', snapshot.val());
          console.log('📊 Snapshot exists:', snapshot.exists());
          console.log('📊 Snapshot key:', snapshot.key);
          console.log('📊 Snapshot ref:', snapshot.ref.toString());
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('📋 Raw user data from database:', userData);
            
            // Map staffRole to specific role if user is non_teaching_staff
            let actualRole = userData.role;
            if (userData.role === 'non_teaching_staff' && userData.staffRole) {
              // Map staffRole to the correct specific role
              const staffRoleMapping: { [key: string]: string } = {
                'REGISTRAR': 'registrar',
                'W/S INSTRU': 'workshop_instructor',
                'ELECTRICIAN': 'electrician',
                'COMP. TECH': 'computer_technician',
                'ASST. LIBRARIAN': 'asst_librarian',
                'ASST. STORE': 'asst_store',
                'TECH. LAB ASST.': 'tech_lab_asst',
                'LAB ASST (CIVIL)': 'lab_asst_civil',
                'CLERK': 'clerk',
                'SECURITY GARD': 'security_guard',
                'FIREOPERATOR': 'fire_operator',
                'ACCOUNTS ASST.': 'accounts_asst',
                'CIVIL SUPERVISOR': 'civil_supervisor',
                'PLUMBER': 'plumber',
                'Girls Hostel Rector': 'girls_hostel_rector',
                'PEON': 'peon',
                'ETP OPERATOR': 'etp_operator'
              };
              
              const mappedRole = staffRoleMapping[userData.staffRole];
              if (mappedRole) {
                actualRole = mappedRole;
                console.log(`🔄 Mapped staffRole "${userData.staffRole}" to role "${mappedRole}"`);
              } else {
                console.log(`⚠️ Unknown staffRole "${userData.staffRole}", keeping original role "${userData.role}"`);
              }
            }
            
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: actualRole,
              name: userData.name,
              phone: userData.phone,
              department: userData.department,
              staffRole: userData.staffRole,
              rollNo: userData.rollNo,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt
            };
            console.log('👤 Setting current user:', user);
            console.log('🎭 User role:', user.role);
            setCurrentUser(user);
            // Save to localStorage for persistence
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('💾 User saved to localStorage');
          } else {
            console.log('⚠️ No user data found in database for:', firebaseUser.uid);
            console.log('🔄 Retrying to fetch user data in 2 seconds...');
            
            // Set loading to true while we retry
            setLoading(true);
            
            // Retry fetching user data after a delay
            setTimeout(async () => {
              try {
                console.log('🔄 Retrying fetch for user:', firebaseUser.uid);
                const retrySnapshot = await get(ref(database, `users/${firebaseUser.uid}`));
                
                if (retrySnapshot.exists()) {
                  const userData = retrySnapshot.val();
                  console.log('✅ User data found on retry:', userData);
                  
                  // Map staffRole to specific role if user is non_teaching_staff
                  let actualRole = userData.role;
                  if (userData.role === 'non_teaching_staff' && userData.staffRole) {
                    // Map staffRole to the correct specific role
                    const staffRoleMapping: { [key: string]: string } = {
                      'REGISTRAR': 'registrar',
                      'W/S INSTRU': 'workshop_instructor',
                      'ELECTRICIAN': 'electrician',
                      'COMP. TECH': 'computer_technician',
                      'ASST. LIBRARIAN': 'asst_librarian',
                      'ASST. STORE': 'asst_store',
                      'TECH. LAB ASST.': 'tech_lab_asst',
                      'LAB ASST (CIVIL)': 'lab_asst_civil',
                      'CLERK': 'clerk',
                      'SECURITY GARD': 'security_guard',
                      'FIREOPERATOR': 'fire_operator',
                      'ACCOUNTS ASST.': 'accounts_asst',
                      'CIVIL SUPERVISOR': 'civil_supervisor',
                      'PLUMBER': 'plumber',
                      'Girls Hostel Rector': 'girls_hostel_rector',
                      'PEON': 'peon',
                      'ETP OPERATOR': 'etp_operator'
                    };
                    
                    const mappedRole = staffRoleMapping[userData.staffRole];
                    if (mappedRole) {
                      actualRole = mappedRole;
                      console.log(`🔄 Mapped staffRole "${userData.staffRole}" to role "${mappedRole}"`);
                    } else {
                      console.log(`⚠️ Unknown staffRole "${userData.staffRole}", keeping original role "${userData.role}"`);
                    }
                  }
                  
                  const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    role: actualRole,
                    name: userData.name,
                    phone: userData.phone,
                    department: userData.department,
                    staffRole: userData.staffRole,
                    rollNo: userData.rollNo,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt
                  };
                  console.log('👤 Setting current user on retry:', user);
                  console.log('🎭 User role on retry:', user.role);
                  setCurrentUser(user);
                  localStorage.setItem('currentUser', JSON.stringify(user));
                  console.log('💾 User saved to localStorage on retry');
                } else {
                  console.error('❌ User data still not found after retry. Please contact administrator.');
                  setCurrentUser(null);
                  localStorage.removeItem('currentUser');
                }
              } catch (error) {
                console.error('❌ Error during retry:', error);
                setCurrentUser(null);
                localStorage.removeItem('currentUser');
              } finally {
                setLoading(false);
              }
            }, 2000);
            
            // Don't immediately set currentUser to null - wait for retry
            console.log('⏳ Waiting for retry before setting currentUser to null');
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          // Don't immediately set currentUser to null - wait a bit and retry
          console.log('🔄 Will retry fetching user data in 3 seconds due to error...');
          
          // Set loading to true while we retry
          setLoading(true);
          
          setTimeout(async () => {
            try {
              console.log('🔄 Retrying fetch after error for user:', firebaseUser.uid);
              const retrySnapshot = await get(ref(database, `users/${firebaseUser.uid}`));
              
              if (retrySnapshot.exists()) {
                const userData = retrySnapshot.val();
                console.log('✅ User data found on error retry:', userData);
                
                // Map staffRole to specific role if user is non_teaching_staff
                let actualRole = userData.role;
                if (userData.role === 'non_teaching_staff' && userData.staffRole) {
                  // Map staffRole to the correct specific role
                  const staffRoleMapping: { [key: string]: string } = {
                    'REGISTRAR': 'registrar',
                    'W/S INSTRU': 'workshop_instructor',
                    'ELECTRICIAN': 'electrician',
                    'COMP. TECH': 'computer_technician',
                    'ASST. LIBRARIAN': 'asst_librarian',
                    'ASST. STORE': 'asst_store',
                    'TECH. LAB ASST.': 'tech_lab_asst',
                    'LAB ASST (CIVIL)': 'lab_asst_civil',
                    'CLERK': 'clerk',
                    'SECURITY GARD': 'security_guard',
                    'FIREOPERATOR': 'fire_operator',
                    'ACCOUNTS ASST.': 'accounts_asst',
                    'CIVIL SUPERVISOR': 'civil_supervisor',
                    'PLUMBER': 'plumber',
                    'Girls Hostel Rector': 'girls_hostel_rector',
                    'PEON': 'peon',
                    'ETP OPERATOR': 'etp_operator'
                  };
                  
                  const mappedRole = staffRoleMapping[userData.staffRole];
                  if (mappedRole) {
                    actualRole = mappedRole;
                    console.log(`🔄 Mapped staffRole "${userData.staffRole}" to role "${mappedRole}"`);
                  } else {
                    console.log(`⚠️ Unknown staffRole "${userData.staffRole}", keeping original role "${userData.role}"`);
                  }
                }
                
                const user: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  role: actualRole,
                  name: userData.name,
                  phone: userData.phone,
                  department: userData.department,
                  staffRole: userData.staffRole,
                  rollNo: userData.rollNo,
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt
                };
                console.log('👤 Setting current user on error retry:', user);
                console.log('🎭 User role on error retry:', user.role);
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                console.log('💾 User saved to localStorage on error retry');
              } else {
                console.error('❌ User data still not found after error retry. Please contact administrator.');
                setCurrentUser(null);
                localStorage.removeItem('currentUser');
              }
            } catch (retryError) {
              console.error('❌ Error during error retry:', retryError);
              setCurrentUser(null);
              localStorage.removeItem('currentUser');
            } finally {
              setLoading(false);
            }
          }, 3000);
        }
      } else {
        console.log('🚪 No user logged in');
        setCurrentUser(null);
        // Clear localStorage when user logs out
        localStorage.removeItem('currentUser');
      }
      
      // Only set loading to false after the first auth state check
      if (!initialized) {
        console.log('✅ AuthProvider: Initial auth check complete, setting loading to false');
        setInitialized(true);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [initialized]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful for:', email);
      
      // The auth state listener will handle the rest automatically
      // No need to manually fetch user data here
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('Logout successful');
      // Clear localStorage on logout
      localStorage.removeItem('currentUser');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    user: currentUser, // Alias for backward compatibility
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 