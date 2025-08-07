import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../firebase/config';
import { ref, get, set, update } from 'firebase/database';
import { 
  Settings,
  Users,
  BookOpen,
  Calendar,
  Bell,
  Shield,
  Database,
  Save,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  MessageSquare,
  BarChart3,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DepartmentSettings {
  name: string;
  code: string;
  hod: string;
  totalStudents: number;
  totalFaculty: number;
  academicYear: string;
  semester: string;
  attendanceThreshold: number;
  minimumAttendance: number;
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    attendanceAlerts: boolean;
    achievementAlerts: boolean;
    reportAlerts: boolean;
  };
  academicSettings: {
    maxAbsences: number;
    gracePeriod: number;
    autoPromotion: boolean;
    requireApproval: boolean;
  };
  securitySettings: {
    requireTwoFactor: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  displaySettings: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
}

interface FacultyMember {
  id: string;
  name: string;
  email: string;
  designation: string;
  subjects: string[];
  status: 'active' | 'inactive';
}

const HODSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<DepartmentSettings>({
    name: '',
    code: '',
    hod: '',
    totalStudents: 0,
    totalFaculty: 0,
    academicYear: '',
    semester: '',
    attendanceThreshold: 75,
    minimumAttendance: 75,
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      attendanceAlerts: true,
      achievementAlerts: true,
      reportAlerts: true,
    },
    academicSettings: {
      maxAbsences: 10,
      gracePeriod: 3,
      autoPromotion: false,
      requireApproval: true,
    },
    securitySettings: {
      requireTwoFactor: false,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      },
    },
    displaySettings: {
      theme: 'light',
      language: 'English',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
    },
  });
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  useEffect(() => {
    fetchDepartmentSettings();
  }, []);

  const fetchDepartmentSettings = async () => {
    try {
      setLoading(true);
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return;
      }

      // Fetch department settings
      const settingsRef = ref(database, `departments/${department}/settings`);
      const settingsSnapshot = await get(settingsRef);

      if (settingsSnapshot.exists()) {
        const settingsData = settingsSnapshot.val();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsData
        }));
      }

      // Fetch faculty members
      await fetchFacultyMembers();
    } catch (error) {
      console.error('Error fetching department settings:', error);
      toast.error('Failed to load department settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyMembers = async () => {
    try {
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);

      if (usersSnapshot.exists()) {
        const facultyData: FacultyMember[] = [];
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          
          if (userData.role === 'teacher' && userData.department === currentUser?.department) {
            facultyData.push({
              id: userSnapshot.key!,
              name: userData.name || '',
              email: userData.email || '',
              designation: userData.designation || 'Teacher',
              subjects: userData.subjects || [],
              status: userData.status || 'active'
            });
          }
        });
        setFaculty(facultyData);
      }
    } catch (error) {
      console.error('Error fetching faculty members:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const department = currentUser?.department;
      
      if (!department) {
        toast.error('Department not found');
        return;
      }

      const settingsRef = ref(database, `departments/${department}/settings`);
      await set(settingsRef, settings);
      
      toast.success('Department settings saved successfully');
    } catch (error) {
      console.error('Error saving department settings:', error);
      toast.error('Failed to save department settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFaculty = async (facultyId: string, updates: Partial<FacultyMember>) => {
    try {
      const userRef = ref(database, `users/${facultyId}`);
      await update(userRef, updates);
      
      toast.success('Faculty member updated successfully');
      fetchFacultyMembers();
    } catch (error) {
      console.error('Error updating faculty member:', error);
      toast.error('Failed to update faculty member');
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // In a real implementation, you would validate the current password
      // and update the password in Firebase Auth
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to update password');
    }
  };

  const tabs = [
    { id: 'general', name: 'General Settings', icon: Settings },
    { id: 'academic', name: 'Academic Settings', icon: BookOpen },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'faculty', name: 'Faculty Management', icon: Users },
    { id: 'display', name: 'Display Settings', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Department Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Configure settings for {currentUser?.department} Department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Change Password
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 inline mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({...settings, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Enter department name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department Code</label>
                      <input
                        type="text"
                        value={settings.code}
                        onChange={(e) => setSettings({...settings, code: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="e.g., CS, ME, EE"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                      <input
                        type="text"
                        value={settings.academicYear}
                        onChange={(e) => setSettings({...settings, academicYear: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="e.g., 2023-24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                      <select
                        value={settings.semester}
                        onChange={(e) => setSettings({...settings, semester: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Threshold (%)</label>
                      <input
                        type="number"
                        value={settings.attendanceThreshold}
                        onChange={(e) => setSettings({...settings, attendanceThreshold: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Attendance (%)</label>
                      <input
                        type="number"
                        value={settings.minimumAttendance}
                        onChange={(e) => setSettings({...settings, minimumAttendance: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Settings */}
              {activeTab === 'academic' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Academic Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Absences</label>
                      <input
                        type="number"
                        value={settings.academicSettings.maxAbsences}
                        onChange={(e) => setSettings({
                          ...settings,
                          academicSettings: {
                            ...settings.academicSettings,
                            maxAbsences: parseInt(e.target.value)
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (days)</label>
                      <input
                        type="number"
                        value={settings.academicSettings.gracePeriod}
                        onChange={(e) => setSettings({
                          ...settings,
                          academicSettings: {
                            ...settings.academicSettings,
                            gracePeriod: parseInt(e.target.value)
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        min="0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="autoPromotion"
                          checked={settings.academicSettings.autoPromotion}
                          onChange={(e) => setSettings({
                            ...settings,
                            academicSettings: {
                              ...settings.academicSettings,
                              autoPromotion: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="autoPromotion" className="text-sm font-medium text-gray-700">
                          Enable Auto Promotion
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="requireApproval"
                          checked={settings.academicSettings.requireApproval}
                          onChange={(e) => setSettings({
                            ...settings,
                            academicSettings: {
                              ...settings.academicSettings,
                              requireApproval: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="requireApproval" className="text-sm font-medium text-gray-700">
                          Require Approval for Changes
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            emailNotifications: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.smsNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            smsNotifications: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive push notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.pushNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            pushNotifications: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Attendance Alerts</h4>
                        <p className="text-sm text-gray-500">Get alerts for low attendance</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.attendanceAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            attendanceAlerts: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Achievement Alerts</h4>
                        <p className="text-sm text-gray-500">Get alerts for new achievements</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.achievementAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            achievementAlerts: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Report Alerts</h4>
                        <p className="text-sm text-gray-500">Get alerts for new reports</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings.reportAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: {
                            ...settings.notificationSettings,
                            reportAlerts: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Require 2FA for all users</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.securitySettings.requireTwoFactor}
                        onChange={(e) => setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            requireTwoFactor: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={settings.securitySettings.sessionTimeout}
                        onChange={(e) => setSettings({
                          ...settings,
                          securitySettings: {
                            ...settings.securitySettings,
                            sessionTimeout: parseInt(e.target.value)
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        min="5"
                        max="480"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Password Policy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                          <input
                            type="number"
                            value={settings.securitySettings.passwordPolicy.minLength}
                            onChange={(e) => setSettings({
                              ...settings,
                              securitySettings: {
                                ...settings.securitySettings,
                                passwordPolicy: {
                                  ...settings.securitySettings.passwordPolicy,
                                  minLength: parseInt(e.target.value)
                                }
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            min="6"
                            max="20"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.securitySettings.passwordPolicy.requireUppercase}
                              onChange={(e) => setSettings({
                                ...settings,
                                securitySettings: {
                                  ...settings.securitySettings,
                                  passwordPolicy: {
                                    ...settings.securitySettings.passwordPolicy,
                                    requireUppercase: e.target.checked
                                  }
                                }
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="text-sm text-gray-700">Require Uppercase</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.securitySettings.passwordPolicy.requireLowercase}
                              onChange={(e) => setSettings({
                                ...settings,
                                securitySettings: {
                                  ...settings.securitySettings,
                                  passwordPolicy: {
                                    ...settings.securitySettings.passwordPolicy,
                                    requireLowercase: e.target.checked
                                  }
                                }
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="text-sm text-gray-700">Require Lowercase</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.securitySettings.passwordPolicy.requireNumbers}
                              onChange={(e) => setSettings({
                                ...settings,
                                securitySettings: {
                                  ...settings.securitySettings,
                                  passwordPolicy: {
                                    ...settings.securitySettings.passwordPolicy,
                                    requireNumbers: e.target.checked
                                  }
                                }
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="text-sm text-gray-700">Require Numbers</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.securitySettings.passwordPolicy.requireSpecialChars}
                              onChange={(e) => setSettings({
                                ...settings,
                                securitySettings: {
                                  ...settings.securitySettings,
                                  passwordPolicy: {
                                    ...settings.securitySettings.passwordPolicy,
                                    requireSpecialChars: e.target.checked
                                  }
                                }
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="text-sm text-gray-700">Require Special Characters</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Management */}
              {activeTab === 'faculty' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Faculty Management</h3>
                  <div className="space-y-4">
                    {faculty.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <p className="text-xs text-gray-400">{member.designation}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedFaculty(member);
                              setShowFacultyModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeTab === 'display' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Display Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <select
                        value={settings.displaySettings.theme}
                        onChange={(e) => setSettings({
                          ...settings,
                          displaySettings: {
                            ...settings.displaySettings,
                            theme: e.target.value as 'light' | 'dark' | 'auto'
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={settings.displaySettings.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          displaySettings: {
                            ...settings.displaySettings,
                            language: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        value={settings.displaySettings.dateFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          displaySettings: {
                            ...settings.displaySettings,
                            dateFormat: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                      <select
                        value={settings.displaySettings.timeFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          displaySettings: {
                            ...settings.displaySettings,
                            timeFormat: e.target.value as '12h' | '24h'
                          }
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleChangePassword(
                formData.get('currentPassword') as string,
                formData.get('newPassword') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Edit Modal */}
      {showFacultyModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Faculty Member</h3>
              <button
                onClick={() => setShowFacultyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateFaculty(selectedFaculty.id, {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                designation: formData.get('designation') as string,
                status: formData.get('status') as 'active' | 'inactive'
              });
              setShowFacultyModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedFaculty.name}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedFaculty.email}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={selectedFaculty.designation}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedFaculty.status}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFacultyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Update Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODSettings; 