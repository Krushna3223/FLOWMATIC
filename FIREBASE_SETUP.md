# Firebase Setup Guide

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication and Realtime Database

## 2. Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Add your test users or use the registration system

## 3. Realtime Database Setup

1. Go to Realtime Database in Firebase Console
2. Create database in test mode (for development)
3. Set up the following security rules:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher')",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },
    "teachers": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },
    "students": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher')",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },
    "achievements": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
      ".write": "auth != null",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },
    "fees": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },
    "attendance": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher')",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher')",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'"
        }
      }
    },
    "marks": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
          ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'"
        }
      }
    },
    "events": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$eventId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "marksheets": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher')",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher')",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
          ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'"
        }
      }
    },
    "complaints": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod' || root.child('users').child(auth.uid).child('role').val() === 'teacher'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'teacher'"
        }
      }
    },
    "documents": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },
    "certificateRequests": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'"
        }
      }
    },
    "documentRequests": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal')",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal')",
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal'"
        }
      }
    },
    "departmentStudents": {
      "$department": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
        "$child": {
          ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
          ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')"
        }
      }
    },
    "departmentFaculty": {
      "$department": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
        "$child": {
          ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
          ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')"
        }
      }
    },
    "departmentStats": {
      "$department": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
        "$child": {
          ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')",
          ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'hod')"
        }
      }
    },
    "instituteStats": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal')",
      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal')",
      "$child": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal')",
        ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal')"
      }
    },
    "facilityRequests": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'"
        }
      }
    },
    "maintenanceRecords": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'non_teaching_staff'"
        }
      }
    },
    "notifications": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
        "$child": {
          ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'",
          ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin' || root.child('users').child(auth.uid).child('role').val() === 'principal' || root.child('users').child(auth.uid).child('role').val() === 'hod'"
        }
      }
    }
  }
}
```

## 4. Firebase Configuration

Update your `src/firebase/config.ts` with your Firebase project credentials:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence);
```

## 5. Test Data Structure

Your database should have this structure:

```
your-project/
├── users/
│   ├── [user-id]/
│   │   ├── email: "admin@example.com"
│   │   ├── name: "Admin User"
│   │   ├── role: "admin"
│   │   └── createdAt: "2024-01-01T00:00:00.000Z"
├── achievements/
│   ├── [achievement-id]/
│   │   ├── studentId: "student-uid"
│   │   ├── studentName: "Student Name"
│   │   ├── title: "Achievement Title"
│   │   ├── description: "Achievement Description"
│   │   ├── category: "academic"
│   │   ├── date: "2024-01-01"
│   │   ├── photoUrl: "https://..."
│   │   ├── status: "pending"
│   │   └── createdAt: "2024-01-01T00:00:00.000Z"
├── certificateRequests/
├── documentRequests/
├── fees/
├── students/
├── departmentStudents/
├── departmentFaculty/
├── facilityRequests/
└── maintenanceRecords/
```

## 6. Troubleshooting

### Permission Denied Errors
- Ensure your Firebase security rules are correctly set
- Check that the user has the correct role in the database
- Verify the database path matches the rules

### Authentication Issues
- Make sure Email/Password authentication is enabled
- Check that the user exists in the Authentication section
- Verify the user data exists in the Realtime Database

### Database Connection Issues
- Ensure the database URL is correct in your config
- Check that the database is created and accessible
- Verify the project ID matches your Firebase project 