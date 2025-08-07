# Quick Firebase Setup Guide

## 🚀 Get Your App Working in 5 Minutes

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "college-admin-dashboard"
4. Follow the setup wizard

### Step 2: Get Your Config
1. In Firebase Console, click ⚙️ (Settings) → Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (</>)
4. Register app with name "college-dashboard"
5. Copy the config object

### Step 3: Update Configuration
**Option A: Direct Update (Quick)**
Edit `src/firebase/config.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Option B: Environment Variables (Recommended)**
Create a `.env` file in project root:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### Step 4: Enable Services
1. **Authentication**: Go to Authentication → Sign-in method → Enable Email/Password
2. **Database**: Go to Realtime Database → Create database → Start in test mode

### Step 5: Test
1. Restart your dev server: `npm start`
2. Go to `http://localhost:3000/register`
3. Create an account
4. Login and enjoy! 🎉

## 🔧 Troubleshooting

**"API key not valid" error:**
- Make sure you copied the entire API key from Firebase
- Check that you're using the correct project configuration

**"Permission denied" error:**
- Make sure Realtime Database is created
- Check that it's in test mode

**"Authentication failed" error:**
- Make sure Email/Password is enabled in Authentication
- Check your Firebase config values

## 📞 Need Help?

1. Double-check your Firebase configuration values
2. Make sure all services are enabled
3. Restart the development server after changes
4. Check browser console for detailed error messages 