# College Admin Dashboard

A modern and responsive College Admin Dashboard built with React.js, Firebase, and Tailwind CSS. The dashboard provides role-based access for Admin and Principal users with comprehensive management features.

## Features

### 🔐 Authentication & Authorization
- Firebase Authentication with email/password login
- Role-based access control (Admin & Principal)
- Protected routes with automatic redirects
- Secure session management

### 👨‍💼 Admin Features
- **Dashboard**: Overview with statistics and recent activities
- **Student Management**: 
  - Add, edit, delete students
  - Import students via CSV
  - Search and filter functionality
  - View student details and fee status
- **Certificate Management**:
  - View certificate requests from students
  - Approve/reject requests
  - Forward approved requests to Principal
  - Upload generated certificates
- **Fee Management**: (Coming Soon)
  - View and update fee payment status
  - Upload fee receipts
  - Send payment reminders

### 👨‍🏫 Principal Features
- **Dashboard**: Statistics and pending approvals overview
- **Certificate Approvals**:
  - Review admin-approved certificate requests
  - Approve/reject final requests
  - Preview certificates before approval
- **Student Records**: View student information and records

### 🎨 UI/UX Features
- Modern, responsive design with Tailwind CSS
- Mobile-friendly layout
- Dark/Light mode toggle
- Real-time notifications
- Smooth animations and transitions
- Intuitive navigation with sidebar

## Tech Stack

- **Frontend**: React.js 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Realtime Database
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **PDF Generation**: jsPDF (for certificates)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Enable Storage (for certificate uploads)
   - Get your Firebase configuration

4. **Configure Firebase**
   - Update `src/firebase/config.ts` with your Firebase configuration:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Set up Database Structure**
   Create the following structure in Firebase Realtime Database:
   ```json
   {
     "users": {
       "admin-uid": {
         "name": "Admin User",
         "role": "admin",
         "email": "admin@college.com"
       },
       "principal-uid": {
         "name": "Principal User",
         "role": "principal",
         "email": "principal@college.com"
       }
     },
     "students": {
       "student-id": {
         "name": "Student Name",
         "rollNumber": "CS001",
         "email": "student@example.com",
         "phone": "+91 9876543210",
         "course": "B.Tech Computer Science",
         "year": "3rd Year",
         "department": "Computer Science",
         "feeStatus": "paid",
         "createdAt": "2024-01-15"
       }
     },
     "certificates": {
       "certificate-id": {
         "studentId": "student-id",
         "studentName": "Student Name",
         "studentRollNumber": "CS001",
         "certificateType": "bonafide",
         "reason": "Bank account opening",
         "status": "pending",
         "createdAt": "2024-01-15"
       }
     }
   }
   ```

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Creating Test Users

1. **Create Admin User**:
   - Go to Firebase Console > Authentication
   - Add a new user with email/password
   - Add the user data to Realtime Database under `users/{uid}`:
   ```json
   {
     "name": "Admin User",
     "role": "admin",
     "email": "admin@college.com"
   }
   ```

2. **Create Principal User**:
   - Follow the same steps but set role as "principal"

### Dashboard Navigation

- **Admin**: Access to student management, certificate requests, fee management
- **Principal**: Access to certificate approvals, student records, dashboard

## Project Structure

```
src/
├── components/
│   ├── Admin/           # Admin-specific components
│   ├── Principal/       # Principal-specific components
│   ├── Layout/          # Layout components (Sidebar, Topbar)
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── firebase/
│   └── config.ts        # Firebase configuration
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main app component with routing
└── index.tsx            # App entry point
```

## Features to Implement

- [ ] Fee Management System
- [ ] Certificate Generation with jsPDF
- [ ] Google Drive API Integration
- [ ] Email Notifications
- [ ] Advanced Search and Filtering
- [ ] Data Export Functionality
- [ ] Audit Logs
- [ ] Multi-language Support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@college.com or create an issue in the repository.

## Screenshots

(Screenshots will be added here)

---

**Note**: This is a development version. For production deployment, ensure proper security rules are configured in Firebase and environment variables are properly set.
