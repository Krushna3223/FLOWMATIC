import { ref, set, get, push } from 'firebase/database';
import { database } from '../firebase/config';

// Institute Configuration
const INSTITUTE_CONFIG = {
  name: "Your Institute Name",
  address: "Institute Address",
  contact: "+91-XXXXXXXXXX",
  email: "info@institute.edu",
  website: "www.institute.edu",
  academicYear: "2024-2025",
  semester: "1st Semester"
};

// Department Configuration
const DEPARTMENTS = {
  "CSE": {
    name: "Computer Science Engineering",
    code: "CSE",
    totalStudents: 0,
    totalFaculty: 0
  },
  "AI_DS": {
    name: "AI and Data Science", 
    code: "AI_DS",
    totalStudents: 0,
    totalFaculty: 0
  },
  "MECH": {
    name: "Mechanical Engineering",
    code: "MECH", 
    totalStudents: 0,
    totalFaculty: 0
  },
  "CIVIL": {
    name: "Civil Engineering",
    code: "CIVIL",
    totalStudents: 0,
    totalFaculty: 0
  },
  "ECE": {
    name: "Electronics & Communication Engineering",
    code: "ECE",
    totalStudents: 0,
    totalFaculty: 0
  },
  "EEE": {
    name: "Electrical & Electronics Engineering",
    code: "EEE",
    totalStudents: 0,
    totalFaculty: 0
  }
};

// Course Configuration
const COURSES = {
  "B-Tech": {
    name: "Bachelor of Technology",
    duration: "4 Years",
    semesters: 8,
    departments: ["CSE", "AI_DS", "MECH", "CIVIL", "ECE", "EEE"]
  },
  "M-Tech": {
    name: "Master of Technology", 
    duration: "2 Years",
    semesters: 4,
    departments: ["CSE", "AI_DS", "MECH"]
  }
};

// Academic Year Configuration
const ACADEMIC_YEARS = {
  "2024-2025": {
    name: "2024-2025",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    isActive: true,
    semesters: {
      "1st": {
        name: "1st Semester",
        startDate: "2024-06-01",
        endDate: "2024-11-30",
        isActive: true
      },
      "2nd": {
        name: "2nd Semester", 
        startDate: "2024-12-01",
        endDate: "2025-05-31",
        isActive: false
      }
    }
  }
};

// Fee Structure Templates
const FEE_STRUCTURES = {
  "B-Tech_CSE_1st_Year": {
    course: "B-Tech",
    department: "CSE",
    year: "1st Year",
    semester: "1st Semester",
    academicYear: "2024-2025",
    totalAmount: 75000,
    breakdown: {
      tuition: 50000,
      library: 5000,
      laboratory: 10000,
      examination: 5000,
      other: 5000
    },
    dueDate: "2024-07-15",
    isActive: true
  },
  "B-Tech_AI_DS_1st_Year": {
    course: "B-Tech",
    department: "AI_DS", 
    year: "1st Year",
    semester: "1st Semester",
    academicYear: "2024-2025",
    totalAmount: 80000,
    breakdown: {
      tuition: 55000,
      library: 5000,
      laboratory: 12000,
      examination: 5000,
      other: 3000
    },
    dueDate: "2024-07-15",
    isActive: true
  }
};

/**
 * Initialize Institute Structure
 */
export const initializeInstitute = async () => {
  try {
    console.log('🏛️ Initializing institute structure...');
    
    const instituteRef = ref(database, 'institute');
    await set(instituteRef, {
      info: {
        ...INSTITUTE_CONFIG,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      departments: DEPARTMENTS,
      courses: COURSES,
      academicYears: ACADEMIC_YEARS
    });
    
    console.log('✅ Institute structure initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing institute:', error);
    return false;
  }
};

/**
 * Initialize Fee Structures
 */
export const initializeFeeStructures = async () => {
  try {
    console.log('💰 Initializing fee structures...');
    
    const feeStructuresRef = ref(database, 'finance/feeStructures');
    await set(feeStructuresRef, FEE_STRUCTURES);
    
    console.log('✅ Fee structures initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing fee structures:', error);
    return false;
  }
};

/**
 * Initialize Reports Structure
 */
export const initializeReports = async () => {
  try {
    console.log('📊 Initializing reports structure...');
    
    const reportsRef = ref(database, 'reports');
    await set(reportsRef, {
      departmentStats: {},
      instituteStats: {
        totalStudents: 0,
        totalFaculty: 0,
        totalDepartments: Object.keys(DEPARTMENTS).length,
        averageAttendance: 0,
        averageMarks: 0,
        totalCollections: 0,
        pendingFees: 0,
        lastUpdated: new Date().toISOString()
      }
    });
    
    console.log('✅ Reports structure initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing reports:', error);
    return false;
  }
};

/**
 * Initialize Academic Structure
 */
export const initializeAcademics = async () => {
  try {
    console.log('📚 Initializing academics structure...');
    
    const academicsRef = ref(database, 'academics');
    await set(academicsRef, {
      attendance: {},
      marks: {},
      marksheets: {}
    });
    
    console.log('✅ Academics structure initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing academics:', error);
    return false;
  }
};

/**
 * Initialize Certificates Structure
 */
export const initializeCertificates = async () => {
  try {
    console.log('📜 Initializing certificates structure...');
    
    const certificatesRef = ref(database, 'certificates');
    await set(certificatesRef, {
      requests: {},
      documents: {}
    });
    
    console.log('✅ Certificates structure initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing certificates:', error);
    return false;
  }
};

/**
 * Initialize Facilities Structure
 */
export const initializeFacilities = async () => {
  try {
    console.log('🏢 Initializing facilities structure...');
    
    const facilitiesRef = ref(database, 'facilities');
    await set(facilitiesRef, {
      requests: {},
      maintenance: {}
    });
    
    console.log('✅ Facilities structure initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing facilities:', error);
    return false;
  }
};

/**
 * Initialize Notifications Structure
 */
export const initializeNotifications = async () => {
  try {
    console.log('🔔 Initializing notifications structure...');
    
    const notificationsRef = ref(database, 'notifications');
    await set(notificationsRef, {});
    
    console.log('✅ Notifications structure initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
    return false;
  }
};

/**
 * Complete Database Initialization
 */
export const initializeCompleteDatabase = async () => {
  try {
    console.log('🚀 Starting complete database initialization...');
    
    const results = await Promise.all([
      initializeInstitute(),
      initializeFeeStructures(),
      initializeReports(),
      initializeAcademics(),
      initializeCertificates(),
      initializeFacilities(),
      initializeNotifications()
    ]);
    
    const successCount = results.filter(result => result).length;
    const totalCount = results.length;
    
    console.log(`✅ Database initialization completed: ${successCount}/${totalCount} successful`);
    
    return successCount === totalCount;
  } catch (error) {
    console.error('❌ Error in complete database initialization:', error);
    return false;
  }
};

/**
 * Update Department Statistics
 */
export const updateDepartmentStats = async (departmentCode: string) => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    let totalStudents = 0;
    let totalFaculty = 0;
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const userData = child.val();
        if (userData.department === departmentCode) {
          if (userData.role === 'student') {
            totalStudents++;
          } else if (userData.role === 'teacher') {
            totalFaculty++;
          }
        }
      });
    }
    
    const departmentRef = ref(database, `institute/departments/${departmentCode}`);
    await set(departmentRef, {
      ...DEPARTMENTS[departmentCode as keyof typeof DEPARTMENTS],
      totalStudents,
      totalFaculty,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`✅ Updated stats for department ${departmentCode}: ${totalStudents} students, ${totalFaculty} faculty`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating department stats for ${departmentCode}:`, error);
    return false;
  }
};

/**
 * Update Institute Statistics
 */
export const updateInstituteStats = async () => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    let totalStudents = 0;
    let totalFaculty = 0;
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const userData = child.val();
        if (userData.role === 'student') {
          totalStudents++;
        } else if (userData.role === 'teacher') {
          totalFaculty++;
        }
      });
    }
    
    const statsRef = ref(database, 'reports/instituteStats');
    await set(statsRef, {
      totalStudents,
      totalFaculty,
      totalDepartments: Object.keys(DEPARTMENTS).length,
      averageAttendance: 0,
      averageMarks: 0,
      totalCollections: 0,
      pendingFees: 0,
      lastUpdated: new Date().toISOString()
    });
    
    console.log(`✅ Updated institute stats: ${totalStudents} students, ${totalFaculty} faculty`);
    return true;
  } catch (error) {
    console.error('❌ Error updating institute stats:', error);
    return false;
  }
};

/**
 * Create Sample Data for Testing
 */
export const createSampleData = async () => {
  try {
    console.log('🧪 Creating sample data...');
    
    // Create sample admin user
    const adminRef = ref(database, 'users/admin_sample');
    await set(adminRef, {
      uid: 'admin_sample',
      name: 'System Administrator',
      email: 'admin@institute.edu',
      phone: '+91-XXXXXXXXXX',
      role: 'admin',
      department: null,
      designation: 'System Administrator',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create sample HOD
    const hodRef = ref(database, 'users/hod_cse_sample');
    await set(hodRef, {
      uid: 'hod_cse_sample',
      name: 'HOD CSE',
      email: 'hod.cse@institute.edu',
      phone: '+91-XXXXXXXXXX',
      role: 'hod',
      department: 'CSE',
      designation: 'Head of Department',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Create sample student
    const studentRef = ref(database, 'users/student_sample');
    await set(studentRef, {
      uid: 'student_sample',
      name: 'Sample Student',
      email: 'student@institute.edu',
      phone: '+91-XXXXXXXXXX',
      role: 'student',
      rollNo: 'CSE2024001',
      course: 'B-Tech',
      year: '1st Year',
      semester: '1st Semester',
      department: 'CSE',
      division: 'A',
      admissionYear: '2024',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Add student to students node
    const studentDataRef = ref(database, 'students/CSE2024001');
    await set(studentDataRef, {
      uid: 'student_sample',
      name: 'Sample Student',
      email: 'student@institute.edu',
      phone: '+91-XXXXXXXXXX',
      rollNo: 'CSE2024001',
      course: 'B-Tech',
      year: '1st Year',
      semester: '1st Semester',
      department: 'CSE',
      division: 'A',
      admissionYear: '2024',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Sample data created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return false;
  }
};

/**
 * Create Sample Achievements with Photos
 */
export const createSampleAchievements = async () => {
  try {
    console.log('🏆 Creating sample achievements with photos...');
    
    // Sample achievements with working ImgBB photos
    const sampleAchievements = {
      "student_sample": {
        "achievement_001": {
          achievementId: "achievement_001",
          studentId: "student_sample",
          studentName: "Sample Student",
          title: "First Prize in Coding Competition",
          description: "Won first prize in inter-college coding competition organized by TechFest 2024",
          category: "technical",
          date: "2024-01-15",
          photoUrl: "https://i.ibb.co/9vK8MpL/coding-competition.jpg",
          status: "approved",
          createdAt: "2024-01-15T10:00:00.000Z",
          approvedAt: "2024-01-15T10:30:00.000Z",
          approvedBy: "principal_uid"
        },
        "achievement_002": {
          achievementId: "achievement_002",
          studentId: "student_sample",
          studentName: "Sample Student",
          title: "Best Project Award",
          description: "Received best project award for innovative AI-based attendance system",
          category: "academic",
          date: "2024-02-20",
          photoUrl: "https://i.ibb.co/0jK8MpL/project-award.jpg",
          status: "approved",
          createdAt: "2024-02-20T14:00:00.000Z",
          approvedAt: "2024-02-20T14:30:00.000Z",
          approvedBy: "principal_uid"
        }
      },
      "CSE2024001": {
        "achievement_003": {
          achievementId: "achievement_003",
          studentId: "CSE2024001",
          studentName: "CSE Student",
          title: "Sports Championship Winner",
          description: "Won college cricket championship as team captain",
          category: "sports",
          date: "2024-03-10",
          photoUrl: "https://i.ibb.co/1jK8MpL/sports-champion.jpg",
          status: "approved",
          createdAt: "2024-03-10T09:00:00.000Z",
          approvedAt: "2024-03-10T09:30:00.000Z",
          approvedBy: "principal_uid"
        },
        "achievement_004": {
          achievementId: "achievement_004",
          studentId: "CSE2024001",
          studentName: "CSE Student",
          title: "Cultural Event Organizer",
          description: "Successfully organized annual cultural fest with 500+ participants",
          category: "cultural",
          date: "2024-04-05",
          photoUrl: "https://i.ibb.co/VqKJ8Mp/cultural-event.jpg",
          status: "approved",
          createdAt: "2024-04-05T16:00:00.000Z",
          approvedAt: "2024-04-05T16:30:00.000Z",
          approvedBy: "principal_uid"
        }
      }
    };
    
    // Add achievements to database
    const achievementsRef = ref(database, 'achievements');
    await set(achievementsRef, sampleAchievements);
    
    console.log('✅ Sample achievements created successfully with ImgBB photos');
    console.log('📸 Sample photo URLs:');
    console.log('- https://i.ibb.co/9vK8MpL/coding-competition.jpg');
    console.log('- https://i.ibb.co/0jK8MpL/project-award.jpg');
    console.log('- https://i.ibb.co/1jK8MpL/sports-champion.jpg');
    console.log('- https://i.ibb.co/VqKJ8Mp/cultural-event.jpg');
    
    // Verify the data was saved correctly
    const verifySnapshot = await get(achievementsRef);
    if (verifySnapshot.exists()) {
      console.log('🔍 Verification - Achievements saved to database:');
      verifySnapshot.forEach((studentSnapshot) => {
        const studentAchievements = studentSnapshot.val();
        Object.keys(studentAchievements).forEach((achievementKey) => {
          const achievement = studentAchievements[achievementKey];
          console.log(`📋 Achievement: ${achievement.title} - Photo URL: ${achievement.photoUrl}`);
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating sample achievements:', error);
    return false;
  }
};

/**
 * Validate Database Structure
 */
export const validateDatabaseStructure = async () => {
  try {
    console.log('🔍 Validating database structure...');
    
    const requiredNodes = [
      'institute',
      'users',
      'students',
      'academics',
      'finance',
      'certificates',
      'achievements',
      'facilities',
      'notifications',
      'reports'
    ];
    
    const validationResults = await Promise.all(
      requiredNodes.map(async (node) => {
        try {
          const nodeRef = ref(database, node);
          const snapshot = await get(nodeRef);
          return { node, exists: snapshot.exists() };
        } catch (error) {
          return { node, exists: false, error };
        }
      })
    );
    
    const missingNodes = validationResults.filter(result => !result.exists);
    
    if (missingNodes.length === 0) {
      console.log('✅ Database structure validation passed');
      return true;
    } else {
      console.log('❌ Missing database nodes:', missingNodes.map(n => n.node));
      return false;
    }
  } catch (error) {
    console.error('❌ Error validating database structure:', error);
    return false;
  }
};

export default {
  initializeInstitute,
  initializeFeeStructures,
  initializeReports,
  initializeAcademics,
  initializeCertificates,
  initializeFacilities,
  initializeNotifications,
  initializeCompleteDatabase,
  updateDepartmentStats,
  updateInstituteStats,
  createSampleData,
  createSampleAchievements,
  validateDatabaseStructure
}; 