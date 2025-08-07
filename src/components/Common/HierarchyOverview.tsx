import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HIERARCHY_CONFIG, getRoleLevel, canSendRequestTo, canReceiveFrom } from '../../types/hierarchy';
import { 
  Users, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Building, 
  GraduationCap,
  Wrench,
  BookOpen,
  Package,
  Shield,
  Flame,
  Calculator,
  Droplets,
  UserCheck,
  FlaskConical,
  HardHat,
  Cpu,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';

interface HierarchyOverviewProps {
  showDetails?: boolean;
}

const HierarchyOverview: React.FC<HierarchyOverviewProps> = ({ showDetails = false }) => {
  const { currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'non-teaching' | 'flow'>('academic');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="w-5 h-5" />;
      case 'teacher': return <Users className="w-5 h-5" />;
      case 'hod': return <Building className="w-5 h-5" />;
      case 'principal': return <Shield className="w-5 h-5" />;
      case 'registrar': return <FileText className="w-5 h-5" />;
      case 'workshop_instructor': return <Wrench className="w-5 h-5" />;
      case 'electrician': return <Settings className="w-5 h-5" />;
      case 'computer_technician': return <Cpu className="w-5 h-5" />;
      case 'asst_librarian': return <BookOpen className="w-5 h-5" />;
      case 'asst_store': return <Package className="w-5 h-5" />;
      case 'tech_lab_asst': return <FlaskConical className="w-5 h-5" />;
      case 'lab_asst_civil': return <HardHat className="w-5 h-5" />;
      case 'clerk': return <FileText className="w-5 h-5" />;
      case 'security_guard': return <UserCheck className="w-5 h-5" />;
      case 'fire_operator': return <Flame className="w-5 h-5" />;
      case 'accounts_asst': return <Calculator className="w-5 h-5" />;
      case 'civil_supervisor': return <Building className="w-5 h-5" />;
      case 'plumber': return <Droplets className="w-5 h-5" />;
      case 'girls_hostel_rector': return <Users className="w-5 h-5" />;
      case 'peon': return <Package className="w-5 h-5" />;
      case 'etp_operator': return <Droplets className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    const level = getRoleLevel(role);
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const academicHierarchy = [
    { role: 'student', level: 1, description: 'Students can request certificates, submit complaints' },
    { role: 'teacher', level: 2, description: 'Class coordinators and teachers' },
    { role: 'hod', level: 3, description: 'Head of Department' },
    { role: 'principal', level: 4, description: 'Principal - Final authority' }
  ];

  const nonTeachingHierarchy = [
    { role: 'registrar', level: 3, description: 'Registrar - Handles administrative requests' },
    { role: 'workshop_instructor', level: 2, description: 'Workshop Instructor' },
    { role: 'electrician', level: 2, description: 'Electrician - Maintenance' },
    { role: 'computer_technician', level: 2, description: 'Computer Technician' },
    { role: 'asst_librarian', level: 2, description: 'Assistant Librarian' },
    { role: 'asst_store', level: 2, description: 'Assistant Store' },
    { role: 'tech_lab_asst', level: 2, description: 'Technical Lab Assistant' },
    { role: 'lab_asst_civil', level: 2, description: 'Civil Lab Assistant' },
    { role: 'clerk', level: 2, description: 'Clerk - Document processing' },
    { role: 'security_guard', level: 2, description: 'Security Guard' },
    { role: 'fire_operator', level: 2, description: 'Fire Operator' },
    { role: 'accounts_asst', level: 2, description: 'Accounts Assistant' },
    { role: 'civil_supervisor', level: 2, description: 'Civil Supervisor' },
    { role: 'plumber', level: 2, description: 'Plumber' },
    { role: 'girls_hostel_rector', level: 2, description: 'Girls Hostel Rector' },
    { role: 'peon', level: 1, description: 'Peon' },
    { role: 'etp_operator', level: 2, description: 'ETP Operator' }
  ];

  const requestFlows = [
    {
      title: 'Certificate Request Flow',
      flow: [
        { from: 'student', to: 'clerk', description: 'Student submits certificate request' },
        { from: 'clerk', to: 'registrar', description: 'Clerk forwards to registrar' },
        { from: 'registrar', to: 'principal', description: 'Registrar forwards to principal' }
      ]
    },
    {
      title: 'Maintenance Request Flow',
      flow: [
        { from: 'all_staff', to: 'electrician', description: 'Staff reports maintenance issue' },
        { from: 'electrician', to: 'civil_supervisor', description: 'Electrician escalates if needed' },
        { from: 'civil_supervisor', to: 'registrar', description: 'Supervisor reports to registrar' }
      ]
    },
    {
      title: 'Academic Request Flow',
      flow: [
        { from: 'student', to: 'teacher', description: 'Student submits academic request' },
        { from: 'teacher', to: 'hod', description: 'Teacher forwards to HOD' },
        { from: 'hod', to: 'principal', description: 'HOD forwards to principal' }
      ]
    }
  ];

  const getRoleDetails = (role: string) => {
    const config = HIERARCHY_CONFIG[role];
    if (!config) return null;

    return {
      ...config,
      canSendTo: config.canSendRequestsTo.map(targetRole => {
        const targetConfig = HIERARCHY_CONFIG[targetRole];
        return {
          role: targetRole,
          name: targetConfig?.description || targetRole,
          icon: getRoleIcon(targetRole)
        };
      }),
      canReceiveFrom: config.canReceiveFrom.map(sourceRole => {
        const sourceConfig = HIERARCHY_CONFIG[sourceRole];
        return {
          role: sourceRole,
          name: sourceConfig?.description || sourceRole,
          icon: getRoleIcon(sourceRole)
        };
      })
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hierarchy Overview</h2>
        <p className="text-gray-600">
          Understanding the role hierarchy and request flow in the ERP system
        </p>
        {currentUser && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Your Role:</strong> {currentUser.role} (Level {getRoleLevel(currentUser.role)})
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('academic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'academic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Academic Hierarchy
            </button>
            <button
              onClick={() => setActiveTab('non-teaching')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'non-teaching'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Non-Teaching Staff
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'flow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Request Flows
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Academic Hierarchy</h3>
              <div className="space-y-4">
                {academicHierarchy.map((item, index) => (
                  <div key={item.role} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(item.role)}`}>
                        {getRoleIcon(item.role)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {item.role.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500">Level {item.level}</p>
                      </div>
                    </div>
                    {index < academicHierarchy.length - 1 && (
                      <ArrowDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'non-teaching' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Non-Teaching Staff Hierarchy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonTeachingHierarchy.map((item) => (
                  <div
                    key={item.role}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole === item.role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRole(selectedRole === item.role ? null : item.role)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(item.role)}`}>
                        {getRoleIcon(item.role)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {item.role.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500">Level {item.level}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Request Flow Paths</h3>
              <div className="space-y-6">
                {requestFlows.map((flow, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">{flow.title}</h4>
                    <div className="space-y-3">
                      {flow.flow.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(step.from)}`}>
                              {step.from.replace('_', ' ')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(step.to)}`}>
                              {step.to.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">{step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Details */}
      {selectedRole && showDetails && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Role Details: {selectedRole.replace('_', ' ')}
          </h3>
          
          {(() => {
            const details = getRoleDetails(selectedRole);
            if (!details) return <p>No details available for this role.</p>;

            return (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Can Send Requests To:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {details.canSendTo.map((target, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        {target.icon}
                        <span className="text-sm font-medium">{target.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Can Receive From:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {details.canReceiveFrom.map((source, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        {source.icon}
                        <span className="text-sm font-medium">{source.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                  <p className="text-sm text-gray-600">{details.description}</p>
                </div>

                {details.department && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Department:</h4>
                    <p className="text-sm text-gray-600 capitalize">{details.department}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Quick Actions */}
      {currentUser && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/requests'}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Requests</p>
                <p className="text-sm text-gray-600">Check your requests</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/requests/create'}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Create Request</p>
                <p className="text-sm text-gray-600">Submit a new request</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/requests/approve'}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-yellow-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Approve Requests</p>
                <p className="text-sm text-gray-600">Review pending requests</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyOverview; 