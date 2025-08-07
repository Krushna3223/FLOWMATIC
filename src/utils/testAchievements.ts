import { ref, push, set, get } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-hot-toast';

export async function addTestAchievements() {
  try {
    // First, let's get the actual student IDs from the database
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    const aiDsStudents: any[] = [];
    
    if (usersSnapshot.exists()) {
      usersSnapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val();
        if (userData.role === 'student' && userData.department === 'AI and DS') {
          aiDsStudents.push({
            id: userSnapshot.key,
            ...userData
          });
        }
      });
    }
    
    console.log('🔍 Found AI and DS students:', aiDsStudents);
    
    // Use actual student IDs if available, otherwise use test IDs
    const studentIds = aiDsStudents.length > 0 
      ? aiDsStudents.map(s => s.id)
      : ['test-student-ai-ds-1', 'test-student-ai-ds-2', 'test-student-ai-ds-3'];
    
    const testAchievements = [
      {
        studentId: studentIds[0],
        studentName: aiDsStudents[0]?.name || 'Test Student AI-DS 1',
        studentRollNo: aiDsStudents[0]?.rollNumber || 'AI001',
        title: 'AI Project Competition Winner',
        description: 'Won first place in the annual AI project competition',
        category: 'technical',
        date: '2024-01-15',
        status: 'approved',
        department: 'AI and DS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        studentId: studentIds[1] || studentIds[0],
        studentName: aiDsStudents[1]?.name || 'Test Student AI-DS 2',
        studentRollNo: aiDsStudents[1]?.rollNumber || 'AI002',
        title: 'Data Science Hackathon',
        description: 'Participated and won in the Data Science hackathon',
        category: 'technical',
        date: '2024-01-20',
        status: 'approved',
        department: 'AI and DS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        studentId: studentIds[2] || studentIds[0],
        studentName: aiDsStudents[2]?.name || 'Test Student AI-DS 3',
        studentRollNo: aiDsStudents[2]?.rollNumber || 'AI003',
        title: 'Machine Learning Workshop',
        description: 'Conducted a successful machine learning workshop for juniors',
        category: 'academic',
        date: '2024-01-25',
        status: 'approved',
        department: 'AI and DS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const achievementsRef = ref(database, 'achievements');
    
    for (const achievement of testAchievements) {
      const newAchievementRef = push(achievementsRef);
      await set(newAchievementRef, achievement);
      console.log('✅ Added test achievement:', achievement.title);
    }

    toast.success('Test achievements added successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error adding test achievements:', error);
    toast.error('Failed to add test achievements');
    return false;
  }
}

export async function addTestStudents() {
  try {
    const testStudents = [
      {
        name: 'Test Student AI-DS 1',
        rollNumber: 'AI001',
        email: 'test1@ai-ds.com',
        phone: '+91 9876543210',
        course: 'B.Tech AI and DS',
        year: '3rd Year',
        department: 'AI and DS',
        role: 'student',
        feeStatus: 'paid',
        attendance: 85,
        averageMarks: 78,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Test Student AI-DS 2',
        rollNumber: 'AI002',
        email: 'test2@ai-ds.com',
        phone: '+91 9876543211',
        course: 'B.Tech AI and DS',
        year: '2nd Year',
        department: 'AI and DS',
        role: 'student',
        feeStatus: 'paid',
        attendance: 92,
        averageMarks: 85,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Test Student AI-DS 3',
        rollNumber: 'AI003',
        email: 'test3@ai-ds.com',
        phone: '+91 9876543212',
        course: 'B.Tech AI and DS',
        year: '4th Year',
        department: 'AI and DS',
        role: 'student',
        feeStatus: 'pending',
        attendance: 78,
        averageMarks: 72,
        createdAt: new Date().toISOString()
      }
    ];

    const usersRef = ref(database, 'users');
    
    for (const student of testStudents) {
      const newStudentRef = push(usersRef);
      await set(newStudentRef, student);
      console.log('✅ Added test student:', student.name);
    }

    toast.success('Test students added successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error adding test students:', error);
    toast.error('Failed to add test students');
    return false;
  }
}

export async function cleanCorruptedAchievements() {
  try {
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    if (achievementsSnapshot.exists()) {
      const corruptedAchievements: string[] = [];
      
      achievementsSnapshot.forEach((achievementSnapshot) => {
        const achievementData = achievementSnapshot.val();
        
        // Check if achievement is corrupted (missing title or studentId)
        if (!achievementData.title || !achievementData.studentId) {
          corruptedAchievements.push(achievementSnapshot.key!);
          console.log('❌ Found corrupted achievement:', achievementData);
        }
      });
      
      if (corruptedAchievements.length > 0) {
        console.log(`🧹 Found ${corruptedAchievements.length} corrupted achievements`);
        
        // Remove corrupted achievements
        for (const achievementId of corruptedAchievements) {
          const achievementRef = ref(database, `achievements/${achievementId}`);
          await set(achievementRef, null);
          console.log(`🗑️ Removed corrupted achievement: ${achievementId}`);
        }
        
        toast.success(`Cleaned up ${corruptedAchievements.length} corrupted achievements`);
      } else {
        toast.success('No corrupted achievements found');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error cleaning corrupted achievements:', error);
    toast.error('Failed to clean corrupted achievements');
    return false;
  }
}

export async function removeCorruptedAchievements() {
  try {
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    if (achievementsSnapshot.exists()) {
      const corruptedAchievements: string[] = [];
      
      achievementsSnapshot.forEach((achievementSnapshot) => {
        const achievementData = achievementSnapshot.val();
        
        // Check if achievement is corrupted (missing title or studentId)
        if (!achievementData.title || !achievementData.studentId) {
          corruptedAchievements.push(achievementSnapshot.key!);
          console.log('❌ Found corrupted achievement:', achievementData);
        }
      });
      
      if (corruptedAchievements.length > 0) {
        console.log(`🧹 Found ${corruptedAchievements.length} corrupted achievements to remove`);
        
        // Remove corrupted achievements
        for (const achievementId of corruptedAchievements) {
          const achievementRef = ref(database, `achievements/${achievementId}`);
          await set(achievementRef, null);
          console.log(`🗑️ Removed corrupted achievement: ${achievementId}`);
        }
        
        toast.success(`Removed ${corruptedAchievements.length} corrupted achievements`);
      } else {
        toast.success('No corrupted achievements found');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error removing corrupted achievements:', error);
    toast.error('Failed to remove corrupted achievements');
    return false;
  }
}

export async function debugAllAchievements() {
  try {
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    console.log('🔍 DEBUG: All achievements in database:');
    
    if (achievementsSnapshot.exists()) {
      achievementsSnapshot.forEach((achievementSnapshot) => {
        const achievementData = achievementSnapshot.val();
        console.log(`📋 Achievement ID: ${achievementSnapshot.key}`);
        console.log(`📋 Achievement Data:`, achievementData);
        console.log('---');
      });
    } else {
      console.log('❌ No achievements found in database');
    }
    
    toast.success('Check console for achievement debug info');
    return true;
  } catch (error) {
    console.error('❌ Error debugging achievements:', error);
    toast.error('Failed to debug achievements');
    return false;
  }
}

export async function fixOriginalAchievements() {
  try {
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    // Create a map of student IDs to their department
    const studentDepartmentMap = new Map<string, string>();
    
    if (usersSnapshot.exists()) {
      usersSnapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val();
        if (userData.role === 'student' && userData.department) {
          studentDepartmentMap.set(userSnapshot.key!, userData.department);
        }
      });
    }
    
    console.log('🔍 Student department map:', Object.fromEntries(studentDepartmentMap));
    
    let fixedCount = 0;
    
    if (achievementsSnapshot.exists()) {
      const promises: Promise<void>[] = [];
      
      achievementsSnapshot.forEach((achievementSnapshot) => {
        const achievementData = achievementSnapshot.val();
        const achievementId = achievementSnapshot.key!;
        
        // Skip test achievements (they already have department)
        if (achievementData.department) {
          console.log(`⏭️ Skipping test achievement: ${achievementData.title}`);
          return;
        }
        
        // Fix original achievements by adding department
        if (achievementData.studentId && studentDepartmentMap.has(achievementData.studentId)) {
          const department = studentDepartmentMap.get(achievementData.studentId);
          
          const updatedAchievement = {
            ...achievementData,
            department: department
          };
          
          const promise = (async () => {
            const achievementRef = ref(database, `achievements/${achievementId}`);
            await set(achievementRef, updatedAchievement);
            
            console.log(`✅ Fixed achievement: ${achievementData.title} - Added department: ${department}`);
            fixedCount++;
          })();
          
          promises.push(promise);
        } else {
          console.log(`❌ Could not fix achievement: ${achievementData.title} - No student found or no department`);
        }
      });
      
      // Wait for all updates to complete
      await Promise.all(promises);
    }
    
    toast.success(`Fixed ${fixedCount} original achievements`);
    return true;
  } catch (error) {
    console.error('❌ Error fixing original achievements:', error);
    toast.error('Failed to fix original achievements');
    return false;
  }
}

// Function to manually fix a specific achievement
export async function fixSpecificAchievement(achievementId: string, studentId: string, department: string) {
  try {
    const achievementRef = ref(database, `achievements/${achievementId}`);
    const achievementSnapshot = await get(achievementRef);
    
    if (!achievementSnapshot.exists()) {
      console.log(`❌ Achievement with ID ${achievementId} not found`);
      return false;
    }
    
    const achievementData = achievementSnapshot.val();
    
    // Update the achievement with the department field
    const updatedAchievement = {
      ...achievementData,
      department: department,
      studentId: studentId // Ensure studentId is set correctly
    };
    
    await set(achievementRef, updatedAchievement);
    
    console.log(`✅ Fixed achievement: ${achievementData.title} - Added department: ${department}`);
    toast.success('Achievement fixed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing specific achievement:', error);
    toast.error('Failed to fix achievement');
    return false;
  }
}

// Function to find and fix the original student achievement
export async function findAndFixOriginalAchievement() {
  try {
    console.log('🔍 Finding and fixing original student achievement...');
    
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    if (!achievementsSnapshot.exists()) {
      console.log('❌ No achievements found');
      return false;
    }
    
    // Find the original achievement (the one without department field)
    let originalAchievementId: string | null = null;
    let originalAchievementData: any = null;
    
    achievementsSnapshot.forEach((achievementSnapshot) => {
      const achievementData = achievementSnapshot.val();
      
      // Look for achievement without department field (original student achievement)
      if (!achievementData.department && achievementData.title && achievementData.studentId) {
        originalAchievementId = achievementSnapshot.key!;
        originalAchievementData = achievementData;
        console.log(`🔍 Found original achievement: ${achievementData.title}`);
      }
    });
    
    if (!originalAchievementId || !originalAchievementData) {
      console.log('❌ No original achievement found');
      return false;
    }
    
    // Get student data to find department
    const studentId = originalAchievementData.studentId;
    const studentRef = ref(database, `users/${studentId}`);
    const studentSnapshot = await get(studentRef);
    
    if (!studentSnapshot.exists()) {
      console.log(`❌ Student with ID ${studentId} not found`);
      return false;
    }
    
    const studentData = studentSnapshot.val();
    const department = studentData.department;
    
    if (!department) {
      console.log(`❌ Student ${studentData.name} has no department`);
      return false;
    }
    
    // Fix the original achievement
    const updatedAchievement = {
      ...originalAchievementData,
      department: department
    };
    
    await set(ref(database, `achievements/${originalAchievementId}`), updatedAchievement);
    
    console.log(`✅ Fixed original achievement: ${originalAchievementData.title} - Added department: ${department}`);
    toast.success('Original achievement fixed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error finding and fixing original achievement:', error);
    toast.error('Failed to fix original achievement');
    return false;
  }
}

// Comprehensive function to debug and fix all achievement issues
export async function debugAndFixAllAchievements() {
  try {
    console.log('🔧 Debugging and fixing all achievements...');
    
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!achievementsSnapshot.exists()) {
      console.log('❌ No achievements found');
      return false;
    }
    
    // Create a map of student IDs to their department
    const studentDepartmentMap = new Map<string, string>();
    
    if (usersSnapshot.exists()) {
      usersSnapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val();
        if (userData.role === 'student' && userData.department) {
          studentDepartmentMap.set(userSnapshot.key!, userData.department);
        }
      });
    }
    
    console.log('🔍 Student department map:', Object.fromEntries(studentDepartmentMap));
    
    let fixedCount = 0;
    let issuesFound = 0;
    
    achievementsSnapshot.forEach((achievementSnapshot) => {
      const achievementData = achievementSnapshot.val();
      const achievementId = achievementSnapshot.key!;
      
      console.log(`🔍 Checking achievement: ${achievementData.title || 'Unknown'}`);
      console.log(`🔍 Achievement data:`, achievementData);
      
      // Check if it's an array (corrupted)
      if (Array.isArray(achievementData)) {
        console.log(`❌ Corrupted array achievement found: ${achievementId}`);
        issuesFound++;
        
        // Try to fix it
        const actualAchievementData = achievementData[0];
        if (actualAchievementData && actualAchievementData.studentId && studentDepartmentMap.has(actualAchievementData.studentId)) {
          const department = studentDepartmentMap.get(actualAchievementData.studentId);
          const fixedAchievement = {
            ...actualAchievementData,
            department: department
          };
          
          set(ref(database, `achievements/${achievementId}`), fixedAchievement).then(() => {
            console.log(`✅ Fixed corrupted array achievement: ${actualAchievementData.title}`);
            fixedCount++;
          });
        }
        return;
      }
      
      // Check if it has no department field
      if (!achievementData.department && achievementData.studentId && studentDepartmentMap.has(achievementData.studentId)) {
        console.log(`❌ Achievement missing department: ${achievementData.title}`);
        issuesFound++;
        
        const department = studentDepartmentMap.get(achievementData.studentId);
        const updatedAchievement = {
          ...achievementData,
          department: department
        };
        
        set(ref(database, `achievements/${achievementId}`), updatedAchievement).then(() => {
          console.log(`✅ Fixed achievement missing department: ${achievementData.title}`);
          fixedCount++;
        });
      }
      
      // Check if student ID doesn't exist
      if (achievementData.studentId && !studentDepartmentMap.has(achievementData.studentId)) {
        console.log(`❌ Student not found for achievement: ${achievementData.title} - Student ID: ${achievementData.studentId}`);
        issuesFound++;
      }
      
      // Check if achievement has undefined values
      if (!achievementData.title || !achievementData.studentId) {
        console.log(`❌ Corrupted achievement with undefined values: ${achievementId}`);
        issuesFound++;
      }
    });
    
    console.log(`🔧 Debug complete. Issues found: ${issuesFound}, Fixed: ${fixedCount}`);
    toast.success(`Debug complete. Issues found: ${issuesFound}, Fixed: ${fixedCount}`);
    return true;
  } catch (error) {
    console.error('❌ Error debugging achievements:', error);
    toast.error('Failed to debug achievements');
    return false;
  }
}

// Function to test new achievement submission
export async function testNewAchievementSubmission() {
  try {
    console.log('🧪 Testing new achievement submission...');
    
    const testAchievement = {
      studentId: 'test-student-id',
      studentName: 'Test Student',
      studentRollNo: 'TEST001',
      title: 'Test Achievement',
      description: 'This is a test achievement to verify the system works',
      category: 'academic',
      date: '2024-01-15',
      status: 'approved',
      department: 'AI and DS',
      photoUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const achievementsRef = ref(database, 'achievements');
    const newAchievementRef = push(achievementsRef);
    
    console.log('📍 Test achievement ID:', newAchievementRef.key);
    console.log('📍 Test achievement data:', testAchievement);
    
    await set(newAchievementRef, testAchievement);
    
    console.log('✅ Test achievement saved successfully!');
    toast.success('Test achievement created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating test achievement:', error);
    toast.error('Failed to create test achievement');
    return false;
  }
}

// Function to fix the corrupted array achievement
export async function fixCorruptedArrayAchievement() {
  try {
    console.log('🔧 Fixing corrupted array achievement...');
    
    const achievementsRef = ref(database, 'achievements');
    const achievementsSnapshot = await get(achievementsRef);
    
    if (!achievementsSnapshot.exists()) {
      console.log('❌ No achievements found');
      return false;
    }
    
    // Find the corrupted achievement (stored as array)
    let corruptedAchievementId: string | null = null;
    let corruptedAchievementData: any = null;
    
    achievementsSnapshot.forEach((achievementSnapshot) => {
      const achievementData = achievementSnapshot.val();
      
      // Check if it's an array (corrupted)
      if (Array.isArray(achievementData)) {
        corruptedAchievementId = achievementSnapshot.key!;
        corruptedAchievementData = achievementData;
        console.log(`🔍 Found corrupted array achievement with ID: ${achievementSnapshot.key}`);
      }
    });
    
    if (!corruptedAchievementId || !corruptedAchievementData) {
      console.log('❌ No corrupted array achievement found');
      return false;
    }
    
    // Get the first element of the array (should be the actual achievement data)
    const actualAchievementData = corruptedAchievementData[0];
    
    if (!actualAchievementData || !actualAchievementData.title || !actualAchievementData.studentId) {
      console.log('❌ Corrupted achievement has invalid data structure');
      return false;
    }
    
    // Get student data to find department
    const studentId = actualAchievementData.studentId;
    const studentRef = ref(database, `users/${studentId}`);
    const studentSnapshot = await get(studentRef);
    
    if (!studentSnapshot.exists()) {
      console.log(`❌ Student with ID ${studentId} not found`);
      return false;
    }
    
    const studentData = studentSnapshot.val();
    const department = studentData.department;
    
    if (!department) {
      console.log(`❌ Student ${studentData.name} has no department`);
      return false;
    }
    
    // Fix the corrupted achievement by converting array to object and adding department
    const fixedAchievement = {
      ...actualAchievementData,
      department: department
    };
    
    await set(ref(database, `achievements/${corruptedAchievementId}`), fixedAchievement);
    
    console.log(`✅ Fixed corrupted array achievement: ${actualAchievementData.title} - Added department: ${department}`);
    toast.success('Corrupted achievement fixed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing corrupted array achievement:', error);
    toast.error('Failed to fix corrupted achievement');
    return false;
  }
} 