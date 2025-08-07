import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  Calendar,
  MessageSquare,
  FileText
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const menuItems = [
    {
      title: 'Student Achievements',
      description: 'Review and approve student achievement submissions',
      icon: Award,
      link: '/teacher/achievements',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Students',
      description: 'View and manage student information',
      icon: Users,
      link: '/teacher/students',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Attendance',
      description: 'Manage student attendance records',
      icon: Calendar,
      link: '/teacher/attendance',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Reports',
      description: 'Generate and view academic reports',
      icon: BarChart3,
      link: '/teacher/reports',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Communication',
      description: 'Send messages to students and parents',
      icon: MessageSquare,
      link: '/teacher/communication',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      title: 'Documents',
      description: 'Manage academic documents and certificates',
      icon: FileText,
      link: '/teacher/documents',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Settings',
      description: 'Manage your profile and preferences',
      icon: Settings,
      link: '/teacher/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back! Manage your classes and student achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={index}
              to={item.link}
              className={`${item.color} text-white rounded-lg p-6 transition-all duration-200 transform hover:scale-105 shadow-lg`}
            >
              <div className="flex items-center mb-4">
                <IconComponent className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
              <p className="text-blue-100">{item.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Achievements</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Reports Due</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 