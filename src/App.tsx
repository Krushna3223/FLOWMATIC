import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './components/Admin/StudentManagement';
import CertificateManagement from './components/Admin/CertificateManagement';
import FeeManagement from './components/Admin/FeeManagement';
import PrincipalDashboard from './pages/PrincipalDashboard';
import PrincipalAchievements from './components/Principal/PrincipalAchievements';
import PrincipalStudentsPage from './pages/PrincipalStudentsPage';
import PrincipalFacultyPage from './pages/PrincipalFacultyPage';
import PrincipalAchievementsPage from './pages/PrincipalAchievementsPage';
import PrincipalReportsPage from './pages/PrincipalReportsPage';
import PrincipalDepartmentsPage from './pages/PrincipalDepartmentsPage';
import PrincipalStaffPage from './pages/PrincipalStaffPage';
import RegisterPage from './pages/RegisterPage';
import TestAuth from './pages/TestAuth';
import ImageTest from './components/Test/ImageTest';
import DatabaseSetup from './components/Setup/DatabaseSetup';
import AdminTools from './pages/AdminTools';
import StaffDashboard from './pages/StaffDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAchievements from './components/Teacher/TeacherAchievements';
import TestAchievement from './pages/TestAchievement';
import DebugAuth from './components/DebugAuth';
import AdminRoleFixer from './components/AdminRoleFixer';
import HODDashboard from './pages/HODDashboard';
import HODStudents from './components/HOD/HODStudents';
import HODFaculty from './components/HOD/HODFaculty';
import HODReports from './components/HOD/HODReports';
import HODAchievements from './components/HOD/HODAchievements';
import HODAttendance from './components/HOD/HODAttendance';
import HODSettings from './components/HOD/HODSettings';
import HODCommunication from './components/HOD/HODCommunication';
import EventManagement from './components/Admin/EventManagement';
import StudentDashboard from './pages/StudentDashboard';
import StudentDocumentsPage from './pages/StudentDocumentsPage';
import StudentAchievements from './components/Student/StudentAchievements';
import FeeWaiverRequest from './components/Student/FeeWaiverRequest';
import { ref, get, update } from 'firebase/database';
import { database } from './firebase/config';
import { toast } from 'react-hot-toast';
import { Search, FileText, Check, X } from 'lucide-react';
import GoogleDriveTest from './components/Test/GoogleDriveTest';
import RegistrarDashboard from './components/Registrar/RegistrarDashboard';
import HostelComplaintReview from './components/Registrar/HostelComplaintReview';
import RegistrarStudents from './components/Registrar/RegistrarStudents';
import RegistrarDocuments from './components/Registrar/RegistrarDocuments';
import RegistrarStatistics from './components/Registrar/RegistrarStatistics';
import RegistrarCommunication from './components/Registrar/RegistrarCommunication';
import RegistrarDocumentRequests from './components/Registrar/RegistrarDocumentRequests';
import RequestManagement from './components/Common/RequestManagement';
import HierarchyOverview from './components/Common/HierarchyOverview';
import WorkshopInstructorDashboard from './components/WorkshopInstructor/WorkshopInstructorDashboard';
import WorkshopInstructorInventory from './components/WorkshopInstructor/WorkshopInstructorInventory';
import WorkshopInstructorSafety from './components/WorkshopInstructor/WorkshopInstructorSafety';
import WorkshopInstructorToolRequests from './components/WorkshopInstructor/WorkshopInstructorToolRequests';
import WorkshopInstructorGeneralStock from './components/WorkshopInstructor/WorkshopInstructorGeneralStock';
import WorkshopInstructorReports from './components/WorkshopInstructor/WorkshopInstructorReports';
import WorkshopInstructorStatistics from './components/WorkshopInstructor/WorkshopInstructorStatistics';
import WorkshopInstructorCommunication from './components/WorkshopInstructor/WorkshopInstructorCommunication';
import WorkshopInstructorMaintenance from './components/WorkshopInstructor/WorkshopInstructorMaintenance';
import WorkshopInstructorTechnology from './components/WorkshopInstructor/WorkshopInstructorTechnology';
import ElectricianDashboard from './components/Electrician/ElectricianDashboard';
import ElectricianComplaints from './components/Electrician/ElectricianComplaints';
import ElectricianToolRequestForm from './components/Electrician/ToolRequestForm';
import ElectricianMaintenanceReport from './components/Electrician/ElectricianMaintenanceReport';
import ElectricianStockRequests from './components/Electrician/ElectricianStockRequests';
import ElectricianPreventiveSchedule from './components/Electrician/ElectricianPreventiveSchedule';
import ElectricianSafetyAuditLog from './components/Electrician/ElectricianSafetyAuditLog';
import ComputerTechnicianDashboard from './components/ComputerTechnician/ComputerTechnicianDashboard';
import ComputerTechnicianComplaints from './components/ComputerTechnician/ComputerTechnicianComplaints';
import ComputerTechnicianNetwork from './components/ComputerTechnician/ComputerTechnicianNetwork';
import ComputerTechnicianAssets from './components/ComputerTechnician/ComputerTechnicianAssets';
import ComputerTechnicianStockRequests from './components/ComputerTechnician/ComputerTechnicianStockRequests';
import ComputerTechnicianReports from './components/ComputerTechnician/ComputerTechnicianReports';
import ComputerTechnicianStatistics from './components/ComputerTechnician/ComputerTechnicianStatistics';
import ComputerTechnicianCommunication from './components/ComputerTechnician/ComputerTechnicianCommunication';
import AsstLibrarianDashboard from './components/AsstLibrarian/AsstLibrarianDashboard';
import AsstLibrarianBookManagement from './components/AsstLibrarian/AsstLibrarianBookManagement';
import AsstLibrarianCommunications from './components/AsstLibrarian/AsstLibrarianCommunications';
import AsstStoreDashboard from './components/AsstStore/AsstStoreDashboard';
import TechLabAsstDashboard from './components/TechLabAsst/TechLabAsstDashboard';
import LabAsstCivilDashboard from './components/LabAsstCivil/LabAsstCivilDashboard';
import LabAsstCivilMaintenance from './components/LabAsstCivil/LabAsstCivilMaintenance';
import LabAsstCivilSafetyReport from './components/LabAsstCivil/LabAsstCivilSafetyReport';
import LabAsstCivilSiteChecks from './components/LabAsstCivil/LabAsstCivilSiteChecks';
import LabAsstCivilToolRequest from './components/LabAsstCivil/LabAsstCivilToolRequest';
import LabAsstCivilComplaints from './components/LabAsstCivil/LabAsstCivilComplaints';
import ClerkDashboard from './components/Clerk/ClerkDashboard';
import PayrollRequest from './components/Clerk/PayrollRequest';
import SecurityGuardDashboard from './components/SecurityGuard/SecurityGuardDashboard';
import FireOperatorDashboard from './components/FireOperator/FireOperatorDashboard';
import AccountsAsstDashboard from './components/AccountsAsst/AccountsAsstDashboard';

import AccountsAsstPayroll from './components/AccountsAsst/AccountsAsstPayroll';
import AccountsAsstReports from './components/AccountsAsst/AccountsAsstReports';
import AccountsAsstVendors from './components/AccountsAsst/AccountsAsstVendors';
import AccountsAsstFeeManagement from './components/AccountsAsst/AccountsAsstFeeManagement';
import TeacherApplicationManagement from './components/HOD/TeacherApplicationManagement';
import TeacherApplicationReview from './components/Registrar/TeacherApplicationReview';
import TeacherApplicationFinalReview from './components/Principal/TeacherApplicationFinalReview';
import CivilSupervisorDashboard from './components/CivilSupervisor/CivilSupervisorDashboard';
import PlumberDashboard from './components/Plumber/PlumberDashboard';
import PlumberComplaints from './components/Plumber/PlumberComplaints';
import PlumberCommunication from './components/Plumber/PlumberCommunication';
import PlumberMaintenance from './components/Plumber/PlumberMaintenance';
import PlumberDrainage from './components/Plumber/PlumberDrainage';
import PlumberWaterSupply from './components/Plumber/PlumberWaterSupply';
import PlumberStockRequests from './components/Plumber/PlumberStockRequests';
import PlumberReports from './components/Plumber/PlumberReports';
import PlumberStatistics from './components/Plumber/PlumberStatistics';
import GirlsHostelRectorDashboard from './components/GirlsHostelRector/GirlsHostelRectorDashboard';
import HostelComplaintManagement from './components/GirlsHostelRector/HostelComplaintManagement';
import PeonDashboard from './components/Peon/PeonDashboard';
import EtpOperatorDashboard from './components/EtpOperator/EtpOperatorDashboard';
import AsstLibrarianStudentManagement from './components/AsstLibrarian/AsstLibrarianStudentManagement';
import AsstLibrarianFines from './components/AsstLibrarian/AsstLibrarianFines';
import AsstLibrarianHelpDesk from './components/AsstLibrarian/AsstLibrarianHelpDesk';
import AsstLibrarianNewBooks from './components/AsstLibrarian/AsstLibrarianNewBooks';
import AsstLibrarianStatistics from './components/AsstLibrarian/AsstLibrarianStatistics';
import AsstLibrarianCommunication from './components/AsstLibrarian/AsstLibrarianCommunication';
import AsstLibrarianPrincipalRequest from './components/AsstLibrarian/AsstLibrarianPrincipalRequest';
import AsstLibrarianBookOrder from './components/AsstLibrarian/AsstLibrarianBookOrder';
import AsstLibrarianResourceApproval from './components/AsstLibrarian/AsstLibrarianResourceApproval';
import AsstLibrarianTimingRequest from './components/AsstLibrarian/AsstLibrarianTimingRequest';
import RegistrarLibraryApproval from './components/Registrar/RegistrarLibraryApproval';
import PrincipalLibraryTimingApproval from './components/Principal/PrincipalLibraryTimingApproval';

// Placeholder components
const Settings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'system'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    certificateAlerts: true,
    studentUpdates: true
  });
  const [systemSettings, setSystemSettings] = useState({
    autoLogout: 30,
    theme: 'light',
    language: 'english'
  });

  // Simple translation system
  const translations = {
    english: {
      settings: 'Settings',
      manageAccount: 'Manage your account and system preferences',
      profile: 'Profile',
      security: 'Security',
      notifications: 'Notifications',
      system: 'System',
      profileInfo: 'Profile Information',
      updatePersonalInfo: 'Update your personal information',
      fullName: 'Full Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      department: 'Department',
      emailCannotBeChanged: 'Email cannot be changed',
      updateProfile: 'Update Profile',
      updating: 'Updating...',
      securitySettings: 'Security Settings',
      manageAccountSecurity: 'Manage your account security',
      changePassword: 'Change Password',
      updateAccountPassword: 'Update your account password',
      twoFactorAuth: 'Two-Factor Authentication',
      addExtraSecurity: 'Add an extra layer of security',
      enable2FA: 'Enable 2FA',
      sessionManagement: 'Session Management',
      manageActiveSessions: 'Manage your active sessions',
      viewSessions: 'View Sessions',
      notificationPreferences: 'Notification Preferences',
      chooseNotifications: 'Choose what notifications you want to receive',
      emailNotifications: 'Email Notifications',
      receiveEmailNotifications: 'Receive notifications via email',
      pushNotifications: 'Push Notifications',
      receiveBrowserNotifications: 'Receive browser push notifications',
      certificateAlerts: 'Certificate Alerts',
      getCertificateNotifications: 'Get notified about new certificate requests',
      studentUpdates: 'Student Updates',
      receiveStudentUpdates: 'Receive updates about student activities',
      systemPreferences: 'System Preferences',
      configureSystemSettings: 'Configure system-wide settings',
      autoLogout: 'Auto Logout (minutes)',
      theme: 'Theme',
      language: 'Language',
      logout: 'Logout'
    },
    hindi: {
      settings: 'सेटिंग्स',
      manageAccount: 'अपने खाते और सिस्टम प्राथमिकताओं का प्रबंधन करें',
      profile: 'प्रोफ़ाइल',
      security: 'सुरक्षा',
      notifications: 'सूचनाएं',
      system: 'सिस्टम',
      profileInfo: 'प्रोफ़ाइल जानकारी',
      updatePersonalInfo: 'अपनी व्यक्तिगत जानकारी अपडेट करें',
      fullName: 'पूरा नाम',
      email: 'ईमेल',
      phoneNumber: 'फ़ोन नंबर',
      department: 'विभाग',
      emailCannotBeChanged: 'ईमेल नहीं बदला जा सकता',
      updateProfile: 'प्रोफ़ाइल अपडेट करें',
      updating: 'अपडेट हो रहा है...',
      securitySettings: 'सुरक्षा सेटिंग्स',
      manageAccountSecurity: 'अपने खाते की सुरक्षा का प्रबंधन करें',
      changePassword: 'पासवर्ड बदलें',
      updateAccountPassword: 'अपना खाता पासवर्ड अपडेट करें',
      twoFactorAuth: 'दो-कारक प्रमाणीकरण',
      addExtraSecurity: 'सुरक्षा की एक अतिरिक्त परत जोड़ें',
      enable2FA: '2FA सक्षम करें',
      sessionManagement: 'सत्र प्रबंधन',
      manageActiveSessions: 'अपने सक्रिय सत्रों का प्रबंधन करें',
      viewSessions: 'सत्र देखें',
      notificationPreferences: 'सूचना प्राथमिकताएं',
      chooseNotifications: 'चुनें कि आप कौन सी सूचनाएं प्राप्त करना चाहते हैं',
      emailNotifications: 'ईमेल सूचनाएं',
      receiveEmailNotifications: 'ईमेल के माध्यम से सूचनाएं प्राप्त करें',
      pushNotifications: 'पुश सूचनाएं',
      receiveBrowserNotifications: 'ब्राउज़र पुश सूचनाएं प्राप्त करें',
      certificateAlerts: 'प्रमाणपत्र अलर्ट',
      getCertificateNotifications: 'नए प्रमाणपत्र अनुरोधों के बारे में सूचित किया जाए',
      studentUpdates: 'छात्र अपडेट',
      receiveStudentUpdates: 'छात्र गतिविधियों के बारे में अपडेट प्राप्त करें',
      systemPreferences: 'सिस्टम प्राथमिकताएं',
      configureSystemSettings: 'सिस्टम-व्यापी सेटिंग्स कॉन्फ़िगर करें',
      autoLogout: 'स्वचालित लॉगआउट (मिनट)',
      theme: 'थीम',
      language: 'भाषा',
      logout: 'लॉगआउट'
    },
    marathi: {
      settings: 'सेटिंग्ज',
      manageAccount: 'तुमचे खाते आणि सिस्टम प्राधान्ये व्यवस्थापित करा',
      profile: 'प्रोफाइल',
      security: 'सुरक्षा',
      notifications: 'सूचना',
      system: 'सिस्टम',
      profileInfo: 'प्रोफाइल माहिती',
      updatePersonalInfo: 'तुमची वैयक्तिक माहिती अपडेट करा',
      fullName: 'पूर्ण नाव',
      email: 'ईमेल',
      phoneNumber: 'फोन नंबर',
      department: 'विभाग',
      emailCannotBeChanged: 'ईमेल बदलता येत नाही',
      updateProfile: 'प्रोफाइल अपडेट करा',
      updating: 'अपडेट होत आहे...',
      securitySettings: 'सुरक्षा सेटिंग्ज',
      manageAccountSecurity: 'तुमच्या खात्याची सुरक्षा व्यवस्थापित करा',
      changePassword: 'पासवर्ड बदला',
      updateAccountPassword: 'तुमचा खाता पासवर्ड अपडेट करा',
      twoFactorAuth: 'दोन-कारक प्रमाणीकरण',
      addExtraSecurity: 'सुरक्षेचा अतिरिक्त स्तर जोडा',
      enable2FA: '2FA सक्षम करा',
      sessionManagement: 'सत्र व्यवस्थापन',
      manageActiveSessions: 'तुमची सक्रिय सत्रे व्यवस्थापित करा',
      viewSessions: 'सत्रे पहा',
      notificationPreferences: 'सूचना प्राधान्ये',
      chooseNotifications: 'तुम्हाला कोणत्या सूचना हव्यात ते निवडा',
      emailNotifications: 'ईमेल सूचना',
      receiveEmailNotifications: 'ईमेलद्वारे सूचना प्राप्त करा',
      pushNotifications: 'पुश सूचना',
      receiveBrowserNotifications: 'ब्राउझर पुश सूचना प्राप्त करा',
      certificateAlerts: 'प्रमाणपत्र सूचना',
      getCertificateNotifications: 'नवीन प्रमाणपत्र विनंत्यांबद्दल सूचित केले जा',
      studentUpdates: 'विद्यार्थी अपडेट्स',
      receiveStudentUpdates: 'विद्यार्थी क्रियाकलापांबद्दल अपडेट्स प्राप्त करा',
      systemPreferences: 'सिस्टम प्राधान्ये',
      configureSystemSettings: 'सिस्टम-व्यापी सेटिंग्ज कॉन्फिगर करा',
      autoLogout: 'स्वयं लॉगआउट (मिनिटे)',
      theme: 'थीम',
      language: 'भाषा',
      logout: 'लॉगआउट'
    }
  };

  const t = translations[systemSettings.language as keyof typeof translations] || translations.english;

  // Initialize settings from localStorage
  useEffect(() => {
    // Load system settings
    const savedSystemSettings = localStorage.getItem('systemSettings');
    if (savedSystemSettings) {
      const parsed = JSON.parse(savedSystemSettings);
      setSystemSettings(parsed);
      // Apply saved theme
      if (parsed.theme) {
        applyTheme(parsed.theme);
      }
    }

    // Load profile data from currentUser
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        department: currentUser.department || ''
      });
    }
  }, [currentUser]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const userRef = ref(database, `users/${currentUser?.uid}`);
      const updatedData = {
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        updatedAt: new Date().toISOString()
      };
      
      await update(userRef, updatedData);
      
      // Update the current user state with new data
      const updatedUser = {
        ...currentUser,
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        updatedAt: updatedData.updatedAt
      };
      
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      // Note: This would require Firebase Auth reauthentication
      toast.success('Password change functionality requires reauthentication');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  // Apply language changes
  const applyLanguage = (language: string) => {
    // Store language preference in localStorage
    localStorage.setItem('language', language);
    
    // Set language attribute on document
    document.documentElement.lang = language;
    
    // You can add actual language switching logic here
    console.log('Language changed to:', language);
    
    // For now, we'll just show a message about the language change
    const languageNames = {
      'english': 'English',
      'hindi': 'हिंदी',
      'marathi': 'मराठी'
    };
    
    toast.success(`Language changed to ${languageNames[language as keyof typeof languageNames] || language}`);
  };

  // Apply theme changes with better implementation
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      // Add dark mode class to body for CSS targeting
      body.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.classList.add('light');
      body.classList.add('light');
      body.setAttribute('data-theme', 'light');
    } else {
      // Auto theme - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
      } else {
        root.classList.add('light');
        body.classList.add('light');
        body.setAttribute('data-theme', 'light');
      }
    }
  };

  // Apply system settings changes
  const handleSystemSettingChange = (setting: string, value: any) => {
    const newSettings = { ...systemSettings, [setting]: value };
    setSystemSettings(newSettings);
    
    // Store in localStorage
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
    
    // Apply changes immediately
    if (setting === 'theme') {
      applyTheme(value);
      toast.success(`${t.theme} changed to ${value}`);
    } else if (setting === 'language') {
      applyLanguage(value);
      toast.success(`${t.language} changed to ${value}`);
    } else if (setting === 'autoLogout') {
      toast.success(`${t.autoLogout} set to ${value === 0 ? 'Never' : value + ' minutes'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.settings}</h1>
        <p className="text-gray-600">{t.manageAccount}</p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.profile}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.security}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.notifications}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.system}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.profileInfo}</h3>
                <p className="text-sm text-gray-600">{t.updatePersonalInfo}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.fullName}</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.email}</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t.emailCannotBeChanged}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.phoneNumber}</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.department}</label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t.updating : t.updateProfile}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.securitySettings}</h3>
                <p className="text-sm text-gray-600">{t.manageAccountSecurity}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900">{t.changePassword}</h4>
                  <p className="text-sm text-gray-600 mt-1">{t.updateAccountPassword}</p>
                  <button
                    onClick={() => handlePasswordChange('', '')}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    {t.changePassword}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.notificationPreferences}</h3>
                <p className="text-sm text-gray-600">{t.chooseNotifications}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{t.emailNotifications}</h4>
                    <p className="text-sm text-gray-600">{t.receiveEmailNotifications}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{t.pushNotifications}</h4>
                    <p className="text-sm text-gray-600">{t.receiveBrowserNotifications}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{t.certificateAlerts}</h4>
                    <p className="text-sm text-gray-600">{t.getCertificateNotifications}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.certificateAlerts}
                      onChange={(e) => setNotifications({...notifications, certificateAlerts: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{t.studentUpdates}</h4>
                    <p className="text-sm text-gray-600">{t.receiveStudentUpdates}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.studentUpdates}
                      onChange={(e) => setNotifications({...notifications, studentUpdates: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.systemPreferences}</h3>
                <p className="text-sm text-gray-600">{t.configureSystemSettings}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.autoLogout}</label>
                  <select
                    value={systemSettings.autoLogout}
                    onChange={(e) => handleSystemSettingChange('autoLogout', Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.language}</label>
                  <select
                    value={systemSettings.language}
                    onChange={(e) => handleSystemSettingChange('language', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="marathi">Marathi</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  {t.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PrincipalCertificates: React.FC = () => {
  const [certificateRequests, setCertificateRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const requestsRef = ref(database, 'documentRequests');
        const snapshot = await get(requestsRef);

        if (snapshot.exists()) {
          const requests: any[] = [];
          snapshot.forEach((userSnapshot) => {
            userSnapshot.forEach((requestSnapshot) => {
              const request = {
                id: requestSnapshot.key!,
                userId: userSnapshot.key!,
                ...requestSnapshot.val()
              };
              requests.push(request);
            });
          });
          setCertificateRequests(requests);
        } else {
          setCertificateRequests([]);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleRequestAction = async (requestId: string, userId: string, action: 'approve' | 'reject', comment: string = '') => {
    try {
      const requestRef = ref(database, `documentRequests/${userId}/${requestId}`);
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await update(requestRef, {
        status: newStatus,
        principalComment: comment,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setCertificateRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, principalComment: comment }
            : req
        )
      );
      
      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const filteredRequests = certificateRequests.filter(request => {
    const matchesSearch = 
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved_by_admin':
        return 'bg-blue-100 text-blue-800';
      case 'approved_by_registrar':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
        <p className="text-gray-600">Review and manage all certificate requests</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved_by_admin">Admin Approved</option>
              <option value="approved_by_registrar">Registrar Approved</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredRequests.length} requests found
            </span>
          </div>
        </div>
      </div>

      {/* Certificates table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading certificates...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No certificate requests found</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                        <div className="text-sm text-gray-500">{request.rollNo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{request.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {(request.status === 'approved_by_admin' || request.status === 'approved_by_registrar') && (
                          <>
                            <button
                              onClick={() => handleRequestAction(request.id, request.userId, 'approve')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.id, request.userId, 'reject')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <span className="text-green-600">✓ Approved</span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="text-red-600">✗ Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PrincipalStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'marks' | 'attendance' | 'fees'>('marks');
  const [marksheet, setMarksheet] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]); // Now an array of records
  const [fees, setFees] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState(false);

  // Function to create sample data for testing
  const createSampleData = async (studentUid: string, rollNo: string) => {
    try {
      // Create sample marks data
      const sampleMarks = {
        "Mathematics": 85,
        "Physics": 78,
        "Chemistry": 82,
        "Computer Science": 90,
        "English": 88,
        "Total": 423,
        "Percentage": 84.6,
        "Grade": "A"
      };

      // Create sample fees data
      const sampleFees = {
        "Total Fees": 50000,
        "Paid": 35000,
        "Pending": 15000,
        "Last Payment": "2024-05-15",
        "Payment Method": "Online Transfer",
        "Status": "Partial Payment",
        "Due Date": "2024-06-30"
      };

      // Save to Firebase
      await update(ref(database, `marksheets/${studentUid}`), sampleMarks);
      await update(ref(database, `fees/${studentUid}`), sampleFees);
      
      toast.success('Sample data created successfully!');
      
      // Refresh the current tab data
      if (selectedTab === 'marks') {
        setMarksheet(sampleMarks);
      } else if (selectedTab === 'fees') {
        setFees(sampleFees);
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample data');
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const studentList: any[] = [];
          snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            // Only include students (role === 'student')
            if (userData.role === 'student') {
              studentList.push({
                uid: userSnapshot.key,
                ...userData
              });
            }
          });
          setStudents(studentList);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load student records');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch extra info when modal opens or tab changes
  useEffect(() => {
    if (!isViewModalOpen || !selectedStudent) return;
    // Use rollNo for marks and fees
    const rollNo = selectedStudent.rollNo;
    setTabLoading(true);
    if (selectedTab === 'marks') {
      get(ref(database, `marksheets/${rollNo}`)).then(snapshot => {
        setMarksheet(snapshot.exists() ? snapshot.val() : null);
        setTabLoading(false);
      }).catch(() => setTabLoading(false));
    } else if (selectedTab === 'attendance') {
      get(ref(database, `attendance`)).then(snapshot => {
        if (!snapshot.exists() || !rollNo) {
          setAttendance([]);
          setTabLoading(false);
          return;
        }
        const attendanceData = snapshot.val();
        const records: any[] = [];
        Object.entries(attendanceData).forEach(([date, students]: [string, any]) => {
          if (students && students[rollNo]) {
            records.push({
              date,
              time: students[rollNo].time,
              mode: students[rollNo].mode,
              name: students[rollNo].name
            });
          }
        });
        setAttendance(records);
        setTabLoading(false);
      }).catch(() => setTabLoading(false));
    } else if (selectedTab === 'fees') {
      get(ref(database, `fees/${rollNo}`)).then(snapshot => {
        setFees(snapshot.exists() ? snapshot.val() : null);
        setTabLoading(false);
      }).catch(() => setTabLoading(false));
    }
  }, [isViewModalOpen, selectedStudent, selectedTab]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  const getCourseOptions = () => {
    const courses = Array.from(new Set(students.map(student => student.course).filter(Boolean)));
    return courses;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'graduated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Records</h1>
        <p className="text-gray-600">View and manage student information and records</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {getCourseOptions().map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              {filteredStudents.length} students found
            </span>
          </div>
        </div>
      </div>

      {/* Students table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students found</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Roll No: {student.rollNo || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{student.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{student.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{student.course || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{student.branch || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status || 'active')}`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Student Details</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedStudent(null);
                  setSelectedTab('marks');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tab Buttons */}
            <div className="flex space-x-2 mb-4">
              <button
                className={`px-4 py-2 rounded-md font-medium ${selectedTab === 'marks' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setSelectedTab('marks')}
              >
                Marks
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium ${selectedTab === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setSelectedTab('attendance')}
              >
                Attendance
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium ${selectedTab === 'fees' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => setSelectedTab('fees')}
              >
                Fees
              </button>
            </div>
            
            {/* Tab Content */}
            {tabLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading {selectedTab}...</p>
              </div>
            ) : (
              <>
                {selectedTab === 'marks' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Marks</h3>
                    {marksheet ? (
                      <div className="bg-gray-100 rounded p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(marksheet).map(([subject, marks]) => (
                            <div key={subject} className="flex justify-between items-center">
                              <span className="font-medium">{subject}:</span>
                              <span className="text-lg font-bold text-blue-600">{String(marks)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No marks data found for this student.</p>
                    )}
                  </div>
                )}
                {selectedTab === 'attendance' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Attendance</h3>
                    {attendance && attendance.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">Time</th>
                              <th className="px-4 py-2 text-left">Mode</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {attendance.map((rec, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2">{rec.date}</td>
                                <td className="px-4 py-2">{rec.time}</td>
                                <td className="px-4 py-2">{rec.mode}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600">No attendance data found for this student.</p>
                    )}
                  </div>
                )}
                {selectedTab === 'fees' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Fees</h3>
                    {fees ? (
                      <div className="bg-gray-100 rounded p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(fees).map(([field, value]) => (
                            <div key={field} className="flex justify-between items-center">
                              <span className="font-medium">{field}:</span>
                              <span className={`text-lg font-bold ${
                                field === 'Status' && String(value) === 'Paid' ? 'text-green-600' :
                                field === 'Status' && String(value) === 'Partial Payment' ? 'text-yellow-600' :
                                field === 'Status' ? 'text-red-600' : 'text-blue-600'
                              }`}>
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No fee data found for this student.</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ...existing student info can be shown below or in Marksheet tab... */}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedStudent(null);
                  setSelectedTab('marks');
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to handle role-based redirects
const RoleRedirect: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  // Show loading while authentication is being checked
  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  // If no user after loading is complete, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If user exists but no role, show error
  if (!currentUser.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">User role not found. Please contact administrator.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
    </div>
  );
}
  
  // Redirect based on user role
  let redirectPath = '/login';
  switch (currentUser.role) {
    case 'admin':
      redirectPath = '/admin';
      break;
    case 'principal':
      redirectPath = '/principal';
      break;
    case 'student':
      redirectPath = '/student';
      break;
    case 'hod':
      redirectPath = '/hod';
      break;
    case 'teacher':
      redirectPath = '/teacher';
      break;
    // Registrar role
    case 'registrar':
      redirectPath = '/registrar';
      break;
    // Non-teaching staff specific roles
    case 'workshop_instructor':
      redirectPath = '/workshop-instructor';
      break;
    case 'electrician':
      redirectPath = '/electrician';
      break;
    case 'computer_technician':
      redirectPath = '/computer-technician';
      break;
    case 'asst_librarian':
      redirectPath = '/asst-librarian';
      break;
    case 'asst_store':
      redirectPath = '/asst-store';
      break;
    case 'tech_lab_asst':
      redirectPath = '/tech-lab-asst';
      break;
    case 'lab_asst_civil':
      redirectPath = '/lab-asst-civil';
      break;
    case 'clerk':
      redirectPath = '/clerk';
      break;
    case 'security_guard':
      redirectPath = '/security-guard';
      break;
    case 'fire_operator':
      redirectPath = '/fire-operator';
      break;
    case 'accounts_asst':
      redirectPath = '/accounts-asst';
      break;
    case 'civil_supervisor':
      redirectPath = '/civil-supervisor';
      break;
    case 'plumber':
      redirectPath = '/plumber';
      break;
    case 'girls_hostel_rector':
      redirectPath = '/girls-hostel-rector';
      break;
    case 'peon':
      redirectPath = '/peon';
      break;
    case 'etp_operator':
      redirectPath = '/etp-operator';
      break;
    // Fallback for non_teaching_staff (legacy)
    case 'non_teaching_staff':
      console.log('RoleRedirect: Found legacy non_teaching_staff role, redirecting to /staff');
      redirectPath = '/staff';
      break;
    default:
      console.log('RoleRedirect: Unknown role:', currentUser.role, '- redirecting to /login');
      redirectPath = '/login';
      break;
  }
  
  return <Navigate to={redirectPath} replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            {/* Test routes */}
            <Route path="/test-auth" element={<TestAuth />} />
            <Route path="/test-achievement" element={<TestAchievement />} />
            <Route path="/admin-tools" element={<AdminTools />} />
            <Route path="/image-test" element={<ImageTest />} />
            <Route path="/gdrive-test" element={<GoogleDriveTest />} />
            <Route path="/database-setup" element={<DatabaseSetup />} />
            <Route path="/google-drive-test" element={<GoogleDriveTest />} />
            <Route path="/debug-auth" element={<DebugAuth />} />
            <Route path="/admin-role-fixer" element={<AdminRoleFixer />} />
            
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <StudentManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <CertificateManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <FeeManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <EventManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/documents"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/achievements"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <StudentAchievements />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/fee-waiver"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <FeeWaiverRequest />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected principal routes */}
            <Route
              path="/principal"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/certificates"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalCertificates />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/principal/departments"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalDepartmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/students"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalStudentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/faculty"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalFacultyPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/staff"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalStaffPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/achievements"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalAchievementsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/reports"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalReportsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/settings"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/library-timing-approval"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <PrincipalLibraryTimingApproval />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal/teacher-applications"
              element={
                <ProtectedRoute allowedRoles={['principal']}>
                  <DashboardLayout>
                    <TeacherApplicationFinalReview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
                    {/* Protected registrar routes */}
        <Route
          path="/registrar"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/hostel-complaints"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <HostelComplaintReview />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/students"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarStudents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/documents"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarDocuments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/statistics"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarStatistics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/communication"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarCommunication />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/document-requests"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarDocumentRequests />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/library-approval"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <RegistrarLibraryApproval />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrar/teacher-applications"
          element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <DashboardLayout>
                <TeacherApplicationReview />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

            {/* Protected staff routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['non_teaching_staff']}>
                  <DashboardLayout>
                    <StaffDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/inventory"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorInventory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/safety"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorSafety />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/requests"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorToolRequests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/general-stock"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorGeneralStock />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/reports"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorReports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/statistics"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorStatistics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/communication"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorCommunication />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/maintenance"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorMaintenance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop-instructor/technology"
              element={
                <ProtectedRoute allowedRoles={['workshop_instructor']}>
                  <DashboardLayout>
                    <WorkshopInstructorTechnology />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician/complaints"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianComplaints />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician/tool-request"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianToolRequestForm />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician/maintenance-report"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianMaintenanceReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician/preventive-schedule"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianPreventiveSchedule />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician/safety-audit"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianSafetyAuditLog />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/electrician/stock-requests"
              element={
                <ProtectedRoute allowedRoles={['electrician']}>
                  <DashboardLayout>
                    <ElectricianStockRequests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/complaints"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianComplaints />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/network"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianNetwork />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/assets"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianAssets />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/stock-requests"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianStockRequests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/reports"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianReports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/statistics"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianStatistics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/computer-technician/communication"
              element={
                <ProtectedRoute allowedRoles={['computer_technician']}>
                  <DashboardLayout>
                    <ComputerTechnicianCommunication />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/student-management"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianStudentManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/fines"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianFines />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/help-desk"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianHelpDesk />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/new-books"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianNewBooks />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/statistics"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianStatistics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/communication"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianCommunication />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/principal-request"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianPrincipalRequest />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/book-order"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianBookOrder />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/resource-approval"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianResourceApproval />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/timing-request"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianTimingRequest />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/books"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianBookManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-librarian/communications"
              element={
                <ProtectedRoute allowedRoles={['asst_librarian']}>
                  <DashboardLayout>
                    <AsstLibrarianCommunications />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/inventory"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/requests"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/reports"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/tools"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/equipment"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/pending"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asst-store/forwarded"
              element={
                <ProtectedRoute allowedRoles={['asst_store']}>
                  <DashboardLayout>
                    <AsstStoreDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech-lab-asst"
              element={
                <ProtectedRoute allowedRoles={['tech_lab_asst']}>
                  <DashboardLayout>
                    <TechLabAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech-lab-asst/equipment"
              element={
                <ProtectedRoute allowedRoles={['tech_lab_asst']}>
                  <DashboardLayout>
                    <TechLabAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech-lab-asst/issues"
              element={
                <ProtectedRoute allowedRoles={['tech_lab_asst']}>
                  <DashboardLayout>
                    <TechLabAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech-lab-asst/reports"
              element={
                <ProtectedRoute allowedRoles={['tech_lab_asst']}>
                  <DashboardLayout>
                    <TechLabAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech-lab-asst/requests"
              element={
                <ProtectedRoute allowedRoles={['tech_lab_asst']}>
                  <DashboardLayout>
                    <TechLabAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech-lab-asst/student-requests"
              element={
                <ProtectedRoute allowedRoles={['tech_lab_asst']}>
                  <DashboardLayout>
                    <TechLabAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-asst-civil"
              element={
                <ProtectedRoute allowedRoles={['lab_asst_civil']}>
                  <DashboardLayout>
                    <LabAsstCivilDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-asst-civil/equipment"
              element={
                <ProtectedRoute allowedRoles={['lab_asst_civil']}>
                  <DashboardLayout>
                    <LabAsstCivilMaintenance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-asst-civil/safety"
              element={
                <ProtectedRoute allowedRoles={['lab_asst_civil']}>
                  <DashboardLayout>
                    <LabAsstCivilSafetyReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-asst-civil/reports"
              element={
                <ProtectedRoute allowedRoles={['lab_asst_civil']}>
                  <DashboardLayout>
                    <LabAsstCivilSiteChecks />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-asst-civil/requests"
              element={
                <ProtectedRoute allowedRoles={['lab_asst_civil']}>
                  <DashboardLayout>
                    <LabAsstCivilToolRequest />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-asst-civil/complaints"
              element={
                <ProtectedRoute allowedRoles={['lab_asst_civil']}>
                  <DashboardLayout>
                    <LabAsstCivilComplaints />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <ClerkDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk/documents"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <ClerkDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk/attendance"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <ClerkDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk/leaves"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <ClerkDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk/notices"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <ClerkDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk/reports"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <ClerkDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clerk/payroll"
              element={
                <ProtectedRoute allowedRoles={['clerk']}>
                  <DashboardLayout>
                    <PayrollRequest />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-guard"
              element={
                <ProtectedRoute allowedRoles={['security_guard']}>
                  <DashboardLayout>
                    <SecurityGuardDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-guard/logs"
              element={
                <ProtectedRoute allowedRoles={['security_guard']}>
                  <DashboardLayout>
                    <SecurityGuardDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-guard/visitors"
              element={
                <ProtectedRoute allowedRoles={['security_guard']}>
                  <DashboardLayout>
                    <SecurityGuardDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-guard/incidents"
              element={
                <ProtectedRoute allowedRoles={['security_guard']}>
                  <DashboardLayout>
                    <SecurityGuardDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/security-guard/roster"
              element={
                <ProtectedRoute allowedRoles={['security_guard']}>
                  <DashboardLayout>
                    <SecurityGuardDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fire-operator"
              element={
                <ProtectedRoute allowedRoles={['fire_operator']}>
                  <DashboardLayout>
                    <FireOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fire-operator/equipment-checks"
              element={
                <ProtectedRoute allowedRoles={['fire_operator']}>
                  <DashboardLayout>
                    <FireOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fire-operator/drill-schedule"
              element={
                <ProtectedRoute allowedRoles={['fire_operator']}>
                  <DashboardLayout>
                    <FireOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fire-operator/incident-reports"
              element={
                <ProtectedRoute allowedRoles={['fire_operator']}>
                  <DashboardLayout>
                    <FireOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fire-operator/safety-audit"
              element={
                <ProtectedRoute allowedRoles={['fire_operator']}>
                  <DashboardLayout>
                    <FireOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fire-operator/tool-request"
              element={
                <ProtectedRoute allowedRoles={['fire_operator']}>
                  <DashboardLayout>
                    <FireOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-asst"
              element={
                <ProtectedRoute allowedRoles={['accounts_asst']}>
                  <DashboardLayout>
                    <AccountsAsstDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-asst/fees"
              element={
                <ProtectedRoute allowedRoles={['accounts_asst']}>
                  <DashboardLayout>
                    <AccountsAsstFeeManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/accounts-asst/payroll"
              element={
                <ProtectedRoute allowedRoles={['accounts_asst']}>
                  <DashboardLayout>
                    <AccountsAsstPayroll />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-asst/reports"
              element={
                <ProtectedRoute allowedRoles={['accounts_asst']}>
                  <DashboardLayout>
                    <AccountsAsstReports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts-asst/vendors"
              element={
                <ProtectedRoute allowedRoles={['accounts_asst']}>
                  <DashboardLayout>
                    <AccountsAsstVendors />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/civil-supervisor"
              element={
                <ProtectedRoute allowedRoles={['civil_supervisor']}>
                  <DashboardLayout>
                    <CivilSupervisorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/civil-supervisor/projects"
              element={
                <ProtectedRoute allowedRoles={['civil_supervisor']}>
                  <DashboardLayout>
                    <CivilSupervisorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/civil-supervisor/complaints"
              element={
                <ProtectedRoute allowedRoles={['civil_supervisor']}>
                  <DashboardLayout>
                    <CivilSupervisorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/civil-supervisor/team"
              element={
                <ProtectedRoute allowedRoles={['civil_supervisor']}>
                  <DashboardLayout>
                    <CivilSupervisorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/civil-supervisor/reports"
              element={
                <ProtectedRoute allowedRoles={['civil_supervisor']}>
                  <DashboardLayout>
                    <CivilSupervisorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/complaints"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberComplaints />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/communication"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberCommunication />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/maintenance"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberMaintenance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/drainage"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberDrainage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/water-supply"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberWaterSupply />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/stock-requests"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberStockRequests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/reports"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberReports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/plumber/statistics"
              element={
                <ProtectedRoute allowedRoles={['plumber']}>
                  <DashboardLayout>
                    <PlumberStatistics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
                    <Route
          path="/girls-hostel-rector"
          element={
            <ProtectedRoute allowedRoles={['girls_hostel_rector']}>
              <DashboardLayout>
                <GirlsHostelRectorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/girls-hostel-rector/complaints"
          element={
            <ProtectedRoute allowedRoles={['girls_hostel_rector']}>
              <DashboardLayout>
                <HostelComplaintManagement />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/girls-hostel-rector/students"
          element={
            <ProtectedRoute allowedRoles={['girls_hostel_rector']}>
              <DashboardLayout>
                <GirlsHostelRectorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/girls-hostel-rector/rooms"
          element={
            <ProtectedRoute allowedRoles={['girls_hostel_rector']}>
              <DashboardLayout>
                <GirlsHostelRectorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/girls-hostel-rector/reports"
          element={
            <ProtectedRoute allowedRoles={['girls_hostel_rector']}>
              <DashboardLayout>
                <GirlsHostelRectorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
            <Route
              path="/peon"
              element={
                <ProtectedRoute allowedRoles={['peon']}>
                  <DashboardLayout>
                    <PeonDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/peon/tasks"
              element={
                <ProtectedRoute allowedRoles={['peon']}>
                  <DashboardLayout>
                    <PeonDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/peon/delivery"
              element={
                <ProtectedRoute allowedRoles={['peon']}>
                  <DashboardLayout>
                    <PeonDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/peon/events"
              element={
                <ProtectedRoute allowedRoles={['peon']}>
                  <DashboardLayout>
                    <PeonDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/peon/reports"
              element={
                <ProtectedRoute allowedRoles={['peon']}>
                  <DashboardLayout>
                    <PeonDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/etp-operator"
              element={
                <ProtectedRoute allowedRoles={['etp_operator']}>
                  <DashboardLayout>
                    <EtpOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/etp-operator/monitoring"
              element={
                <ProtectedRoute allowedRoles={['etp_operator']}>
                  <DashboardLayout>
                    <EtpOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/etp-operator/logs"
              element={
                <ProtectedRoute allowedRoles={['etp_operator']}>
                  <DashboardLayout>
                    <EtpOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/etp-operator/maintenance"
              element={
                <ProtectedRoute allowedRoles={['etp_operator']}>
                  <DashboardLayout>
                    <EtpOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/etp-operator/reports"
              element={
                <ProtectedRoute allowedRoles={['etp_operator']}>
                  <DashboardLayout>
                    <EtpOperatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/achievements"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout>
                    <TeacherAchievements />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Protected HOD routes */}
            <Route
              path="/hod"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/students"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODStudents />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/faculty"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODFaculty />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/reports"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODReports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/achievements"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODAchievements />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/attendance"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODAttendance />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/communication"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODCommunication />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/settings"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <HODSettings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/teacher-applications"
              element={
                <ProtectedRoute allowedRoles={['hod']}>
                  <DashboardLayout>
                    <TeacherApplicationManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Request Management Routes */}
            <Route
              path="/requests"
              element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'registrar', 'hod', 'teacher', 'student', 'workshop_instructor', 'electrician', 'computer_technician', 'asst_librarian', 'asst_store', 'tech_lab_asst', 'lab_asst_civil', 'clerk', 'security_guard', 'fire_operator', 'accounts_asst', 'civil_supervisor', 'plumber', 'girls_hostel_rector', 'peon', 'etp_operator']}>
                  <DashboardLayout>
                    <RequestManagement mode="view" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'registrar', 'hod', 'teacher', 'student', 'workshop_instructor', 'electrician', 'computer_technician', 'asst_librarian', 'asst_store', 'tech_lab_asst', 'lab_asst_civil', 'clerk', 'security_guard', 'fire_operator', 'accounts_asst', 'civil_supervisor', 'plumber', 'girls_hostel_rector', 'peon', 'etp_operator']}>
                  <DashboardLayout>
                    <RequestManagement mode="create" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/approve"
              element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'registrar', 'hod', 'teacher', 'workshop_instructor', 'asst_librarian', 'asst_store', 'tech_lab_asst', 'lab_asst_civil', 'clerk', 'accounts_asst', 'civil_supervisor']}>
                  <DashboardLayout>
                    <RequestManagement mode="approve" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/all"
              element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'registrar']}>
                  <DashboardLayout>
                    <RequestManagement mode="all" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Hierarchy Overview Route */}
            <Route
              path="/hierarchy"
              element={
                <ProtectedRoute allowedRoles={['admin', 'principal', 'registrar', 'hod', 'teacher', 'student', 'workshop_instructor', 'electrician', 'computer_technician', 'asst_librarian', 'asst_store', 'tech_lab_asst', 'lab_asst_civil', 'clerk', 'security_guard', 'fire_operator', 'accounts_asst', 'civil_supervisor', 'plumber', 'girls_hostel_rector', 'peon', 'etp_operator']}>
                  <DashboardLayout>
                    <HierarchyOverview showDetails={true} />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<RoleRedirect />} />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
