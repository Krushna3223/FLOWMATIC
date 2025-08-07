import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  BookOpen, 
  Award, 
  BarChart3,
  ArrowLeft,
  GraduationCap,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  fullName: string;
  studentCount: number;
  facultyCount: number;
  color: string;
  icon: React.ComponentType<any>;
}

interface DepartmentSelectorProps {
  onDepartmentSelect: (department: string) => void;
  onBackToOverview: () => void;
  selectedDepartment: string | null;
}

const departments: Department[] = [
  {
    id: 'cse',
    name: 'CSE',
    fullName: 'Computer Science and Engineering',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-blue-500',
    icon: Building
  },
  {
    id: 'ai-ds',
    name: 'AI and DS',
    fullName: 'Artificial Intelligence and Data Science',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-purple-500',
    icon: Building
  },
  {
    id: 'electronics-communication',
    name: 'Electronics and Communication',
    fullName: 'Electronics and Communication',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-green-500',
    icon: Building
  },
  {
    id: 'ece',
    name: 'ECE',
    fullName: 'Electronics and Communication Engineering',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-indigo-500',
    icon: Building
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    fullName: 'Mechanical Engineering',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-red-500',
    icon: Building
  },
  {
    id: 'electronics-vlsi',
    name: 'Electronics Engg (VLSI)',
    fullName: 'Electronics Engineering (VLSI)',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-yellow-500',
    icon: Building
  },
  {
    id: 'electrical',
    name: 'Electrical Engg',
    fullName: 'Electrical Engineering',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-orange-500',
    icon: Building
  },
  {
    id: 'civil',
    name: 'Civil',
    fullName: 'Civil Engineering',
    studentCount: 0,
    facultyCount: 0,
    color: 'bg-teal-500',
    icon: Building
  }
];

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  onDepartmentSelect,
  onBackToOverview,
  selectedDepartment
}) => {
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null);

  const handleDepartmentClick = (departmentId: string) => {
    onDepartmentSelect(departmentId);
  };

  if (selectedDepartment) {
    const selectedDept = departments.find(dept => dept.id === selectedDepartment);
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToOverview}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Overview</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedDept?.fullName}</h1>
                <p className="text-gray-600">Department Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">{selectedDept?.name}</span>
            </div>
          </div>
        </div>

        {/* Department Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{selectedDept?.studentCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-500">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{selectedDept?.facultyCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-500">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Management Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Student Records</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span className="font-medium">Faculty Management</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Achievements</span>
            </button>
            
            <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Reports</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Selection</h1>
            <p className="text-gray-600">Select a department to view its specific data and management options</p>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">{departments.length} Departments</span>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {departments.map((department) => {
          const Icon = department.icon;
          const isHovered = hoveredDepartment === department.id;
          
          return (
            <div
              key={department.id}
              className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-300 transform ${
                isHovered ? 'scale-105 shadow-xl' : 'hover:shadow-xl'
              }`}
              onClick={() => handleDepartmentClick(department.id)}
              onMouseEnter={() => setHoveredDepartment(department.id)}
              onMouseLeave={() => setHoveredDepartment(null)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${department.color}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{department.studentCount}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                <p className="text-sm text-gray-600">{department.fullName}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{department.facultyCount} Faculty</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">85%</div>
                    <div className="text-gray-500">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">78%</div>
                    <div className="text-gray-500">Performance</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institute Overview Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Institute Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
            <div className="text-sm text-gray-600">Total Departments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {departments.reduce((sum, dept) => sum + dept.studentCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {departments.reduce((sum, dept) => sum + dept.facultyCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Faculty</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Active Departments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelector; 