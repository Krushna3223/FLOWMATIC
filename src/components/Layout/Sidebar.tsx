import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ClipboardList,
  CreditCard,
  FileCheck,
  Wrench,
  Calendar,
  BarChart3,
  Award,
  MessageSquare,
  Zap,
  Clock,
  Package,
  BookOpen,
  Shield,
  Flame,
  Calculator,
  Building,
  Droplets,
  UserCheck,
  Bell,
  FlaskConical,
  HardHat,
  Truck,
  MapPin,
  Database,
  Archive,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Cpu,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    switch (currentUser?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin', icon: Home },
          { name: 'Student Management', href: '/admin/students', icon: Users },
          { name: 'Certificate Management', href: '/admin/certificates', icon: FileText },
          { name: 'Fee Management', href: '/admin/fees', icon: CreditCard },
          { name: 'Event Management', href: '/admin/events', icon: Calendar },
          { name: 'Request Management', href: '/requests', icon: MessageSquare },
          { name: 'All Requests', href: '/requests/all', icon: Eye },
          { name: 'Hierarchy Overview', href: '/hierarchy', icon: Users },
        ];

      case 'principal':
        return [
          { name: 'Dashboard', href: '/principal', icon: Home },
          { name: 'Achievements', href: '/principal/achievements', icon: Award },
          { name: 'Department Overview', href: '/principal/departments', icon: Building },
          { name: 'Library Timing Approval', href: '/principal/library-timing-approval', icon: Clock },
          { name: 'Teacher Applications', href: '/principal/teacher-applications', icon: FileText },
          { name: 'Reports & Analytics', href: '/principal/reports', icon: BarChart3 },
          { name: 'Staff Management', href: '/principal/staff', icon: Users },
        ];

      case 'hod':
        return [
          { name: 'Dashboard', href: '/hod', icon: Home },
          { name: 'Student Management', href: '/hod/students', icon: Users },
          { name: 'Faculty Management', href: '/hod/faculty', icon: GraduationCap },
          { name: 'Attendance Management', href: '/hod/attendance', icon: Calendar },
          { name: 'Achievement Approval', href: '/hod/achievements', icon: Award },
          { name: 'Teacher Applications', href: '/hod/teacher-applications', icon: FileText },
          { name: 'Reports & Analytics', href: '/hod/reports', icon: BarChart3 },
          { name: 'Communication Hub', href: '/hod/communication', icon: MessageSquare },
          { name: 'Department Settings', href: '/hod/settings', icon: Settings },
          { name: 'Request Management', href: '/requests', icon: MessageSquare },
          { name: 'Approve Requests', href: '/requests/approve', icon: CheckCircle },
        ];

      case 'registrar':
        return [
          { name: 'Dashboard', href: '/registrar', icon: Home },
          { name: 'Document Requests', href: '/registrar/document-requests', icon: FileText },
          { name: 'Student Records', href: '/registrar/students', icon: Users },
          { name: 'Library Approval', href: '/registrar/library-approval', icon: BookOpen },
          { name: 'Hostel Complaints', href: '/registrar/hostel-complaints', icon: AlertTriangle },
          { name: 'Teacher Applications', href: '/registrar/teacher-applications', icon: FileText },
          { name: 'Communications', href: '/registrar/communication', icon: MessageSquare },
          { name: 'Reports', href: '/registrar/statistics', icon: BarChart3 },
        ];

      case 'asst_librarian':
        return [
          { name: 'Dashboard', href: '/asst-librarian', icon: Home },
          { name: 'Student Management', href: '/asst-librarian/student-management', icon: Users },
          { name: 'Book Management', href: '/asst-librarian/books', icon: BookOpen },
          { name: 'Resource Approval', href: '/asst-librarian/resource-approval', icon: CheckCircle },
          { name: 'Timing Requests', href: '/asst-librarian/timing-request', icon: Clock },
          { name: 'Fines & Overdue', href: '/asst-librarian/fines', icon: DollarSign },
          { name: 'Statistics', href: '/asst-librarian/statistics', icon: BarChart3 },
          { name: 'Communications', href: '/asst-librarian/communications', icon: MessageSquare },
        ];

      case 'workshop_instructor':
        return [
          { name: 'Dashboard', href: '/workshop-instructor', icon: Home },
          { name: 'Equipment Inventory', href: '/workshop-instructor/inventory', icon: Wrench },
          { name: 'Safety Notices', href: '/workshop-instructor/safety', icon: AlertTriangle },
          { name: 'Tool Requests', href: '/workshop-instructor/requests', icon: Package },
          { name: 'Equipment Reports', href: '/workshop-instructor/reports', icon: FileText },
          { name: 'Statistics', href: '/workshop-instructor/statistics', icon: BarChart3 },
          { name: 'Communication', href: '/workshop-instructor/communication', icon: MessageSquare },
          { name: 'Maintenance', href: '/workshop-instructor/maintenance', icon: Settings },
          { name: 'Technology', href: '/workshop-instructor/technology', icon: Cpu },
          { name: 'Request Management', href: '/requests', icon: MessageSquare },
          { name: 'Approve Requests', href: '/requests/approve', icon: CheckCircle },
        ];

      case 'electrician':
        return [
          { name: 'Dashboard', href: '/electrician', icon: Home },
          { name: 'Complaints', href: '/electrician/complaints', icon: AlertTriangle },
          { name: 'Tool Requests', href: '/electrician/tool-request', icon: Package },
          { name: 'Stock Requests', href: '/electrician/stock-requests', icon: Package },
          { name: 'Maintenance Reports', href: '/electrician/maintenance-report', icon: FileText },
          { name: 'Preventive Schedule', href: '/electrician/preventive-schedule', icon: Calendar },
          { name: 'Safety Audit', href: '/electrician/safety-audit', icon: Shield },
        ];

      case 'computer_technician':
        return [
          { name: 'Dashboard', href: '/computer-technician', icon: Home },
          { name: 'IT Complaints', href: '/computer-technician/complaints', icon: AlertTriangle },
          { name: 'Network Issues', href: '/computer-technician/network', icon: Zap },
          { name: 'Assets Management', href: '/computer-technician/assets', icon: Database },
          { name: 'Stock Requests', href: '/computer-technician/stock-requests', icon: Package },
          { name: 'Reports', href: '/computer-technician/reports', icon: FileText },
          { name: 'Statistics', href: '/computer-technician/statistics', icon: BarChart3 },
          { name: 'Communication', href: '/computer-technician/communication', icon: MessageSquare },
        ];

      case 'asst_store':
        return [
          { name: 'Dashboard', href: '/asst-store', icon: Home },
          { name: 'Inventory Management', href: '/asst-store/inventory', icon: Package },
          { name: 'Stock Requests', href: '/asst-store/requests', icon: Clock },
          { name: 'Equipment Requests', href: '/asst-store/equipment', icon: FlaskConical },
          { name: 'Tool Requests', href: '/asst-store/tools', icon: Wrench },
          { name: 'Pending Approvals', href: '/asst-store/pending', icon: AlertTriangle },
          { name: 'Forwarded Requests', href: '/asst-store/forwarded', icon: ArrowRight },
          { name: 'Reports & Analytics', href: '/asst-store/reports', icon: BarChart3 },
        ];

      case 'tech_lab_asst':
        return [
          { name: 'Dashboard', href: '/tech-lab-asst', icon: Home },
          { name: 'Lab Equipment', href: '/tech-lab-asst/equipment', icon: FlaskConical },
          { name: 'Technical Issues', href: '/tech-lab-asst/issues', icon: AlertTriangle },
          { name: 'Lab Reports', href: '/tech-lab-asst/reports', icon: FileText },
          { name: 'Tool Requests', href: '/tech-lab-asst/requests', icon: Package },
          { name: 'Student Requests', href: '/tech-lab-asst/student-requests', icon: Users },
        ];

      case 'lab_asst_civil':
        return [
          { name: 'Dashboard', href: '/lab-asst-civil', icon: Home },
          { name: 'Lab Equipment', href: '/lab-asst-civil/equipment', icon: HardHat },
          { name: 'Safety Reports', href: '/lab-asst-civil/safety', icon: AlertTriangle },
          { name: 'Site Checks', href: '/lab-asst-civil/reports', icon: FileText },
          { name: 'Tool Requests', href: '/lab-asst-civil/requests', icon: Package },
          { name: 'Complaints', href: '/lab-asst-civil/complaints', icon: AlertTriangle },
        ];

      case 'clerk':
        return [
          { name: 'Dashboard', href: '/clerk', icon: Home },
          { name: 'Document Processing', href: '/clerk/documents', icon: FileText },
          { name: 'Attendance Management', href: '/clerk/attendance', icon: Users },
          { name: 'Leave Requests', href: '/clerk/leaves', icon: Calendar },
          { name: 'Notices & Circulars', href: '/clerk/notices', icon: Bell },
          { name: 'Reports', href: '/clerk/reports', icon: BarChart3 },
          { name: 'Request Management', href: '/requests', icon: MessageSquare },
          { name: 'Approve Requests', href: '/requests/approve', icon: CheckCircle },
        ];

      case 'security_guard':
        return [
          { name: 'Dashboard', href: '/security-guard', icon: Home },
          { name: 'Entry/Exit Logs', href: '/security-guard/logs', icon: UserCheck },
          { name: 'Visitor Management', href: '/security-guard/visitors', icon: Users },
          { name: 'Incident Reports', href: '/security-guard/incidents', icon: AlertTriangle },
          { name: 'Duty Roster', href: '/security-guard/roster', icon: Calendar },
        ];

      case 'fire_operator':
        return [
          { name: 'Dashboard', href: '/fire-operator', icon: Home },
          { name: 'Equipment Checks', href: '/fire-operator/equipment-checks', icon: Flame },
          { name: 'Drill Schedule', href: '/fire-operator/drill-schedule', icon: Calendar },
          { name: 'Incident Reports', href: '/fire-operator/incident-reports', icon: AlertTriangle },
          { name: 'Safety Audit', href: '/fire-operator/safety-audit', icon: FileText },
          { name: 'Tool Request', href: '/fire-operator/tool-request', icon: Package },
        ];

      case 'accounts_asst':
        return [
          { name: 'Dashboard', href: '/accounts-asst', icon: Home },
          { name: 'Fee Management', href: '/accounts-asst/fees', icon: DollarSign },
          { name: 'Payroll', href: '/accounts-asst/payroll', icon: CreditCard },
          { name: 'Financial Reports', href: '/accounts-asst/reports', icon: BarChart3 },
          { name: 'Vendor Management', href: '/accounts-asst/vendors', icon: Users },
        ];

      case 'civil_supervisor':
        return [
          { name: 'Dashboard', href: '/civil-supervisor', icon: Home },
          { name: 'Project Management', href: '/civil-supervisor/projects', icon: Building },
          { name: 'Complaint Management', href: '/civil-supervisor/complaints', icon: AlertTriangle },
          { name: 'Team Management', href: '/civil-supervisor/team', icon: Users },
          { name: 'Reports', href: '/civil-supervisor/reports', icon: FileText },
        ];

      case 'plumber':
        return [
          { name: 'Dashboard', href: '/plumber', icon: Home },
          { name: 'Complaints', href: '/plumber/complaints', icon: AlertTriangle },
          { name: 'Communication', href: '/plumber/communication', icon: MessageSquare },
          { name: 'Maintenance', href: '/plumber/maintenance', icon: Wrench },
          { name: 'Drainage', href: '/plumber/drainage', icon: Droplets },
          { name: 'Water Supply', href: '/plumber/water-supply', icon: Droplets },
          { name: 'Stock Requests', href: '/plumber/stock-requests', icon: Package },
          { name: 'Reports', href: '/plumber/reports', icon: FileText },
          { name: 'Statistics', href: '/plumber/statistics', icon: BarChart3 },
        ];

      case 'girls_hostel_rector':
        return [
          { name: 'Dashboard', href: '/girls-hostel-rector', icon: Home },
          { name: 'Student Management', href: '/girls-hostel-rector/students', icon: Users },
          { name: 'Room Management', href: '/girls-hostel-rector/rooms', icon: Building },
          { name: 'Complaint Management', href: '/girls-hostel-rector/complaints', icon: AlertTriangle },
          { name: 'Reports', href: '/girls-hostel-rector/reports', icon: FileText },
        ];

      case 'peon':
        return [
          { name: 'Dashboard', href: '/peon', icon: Home },
          { name: 'Task Management', href: '/peon/tasks', icon: ClipboardList },
          { name: 'File Delivery', href: '/peon/delivery', icon: Package },
          { name: 'Event Support', href: '/peon/events', icon: Calendar },
          { name: 'Reports', href: '/peon/reports', icon: FileText },
        ];

      case 'etp_operator':
        return [
          { name: 'Dashboard', href: '/etp-operator', icon: Home },
          { name: 'Plant Monitoring', href: '/etp-operator/monitoring', icon: Droplets },
          { name: 'Daily Logs', href: '/etp-operator/logs', icon: FileText },
          { name: 'Maintenance Requests', href: '/etp-operator/maintenance', icon: Wrench },
          { name: 'Reports', href: '/etp-operator/reports', icon: BarChart3 },
        ];

      case 'student':
        return [
          { name: 'Dashboard', href: '/student', icon: Home },
          { name: 'Achievements', href: '/student/achievements', icon: Award },
          { name: 'Documents', href: '/student/documents', icon: FileText },
          { name: 'Request Management', href: '/requests', icon: MessageSquare },
        ];

      default:
        return [
          { name: 'Dashboard', href: '/', icon: Home },
        ];
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">
              {currentUser?.role === 'admin' ? 'Admin Panel' : 
               currentUser?.role === 'principal' ? 'Principal Panel' :
               currentUser?.role === 'hod' ? 'HOD Panel' :
               currentUser?.role === 'registrar' ? 'Registrar Panel' :
               currentUser?.role === 'asst_librarian' ? 'Librarian Panel' :
               currentUser?.role === 'workshop_instructor' ? 'Workshop Instructor Panel' :
               currentUser?.role === 'electrician' ? 'Electrician Panel' :
               currentUser?.role === 'computer_technician' ? 'Computer Technician Panel' :
               currentUser?.role === 'asst_store' ? 'Assistant Store Panel' :
               currentUser?.role === 'tech_lab_asst' ? 'Technical Lab Assistant Panel' :
               currentUser?.role === 'lab_asst_civil' ? 'Civil Lab Assistant Panel' :
               currentUser?.role === 'clerk' ? 'Clerk Panel' :
               currentUser?.role === 'security_guard' ? 'Security Guard Panel' :
               currentUser?.role === 'fire_operator' ? 'Fire Operator Panel' :
               currentUser?.role === 'accounts_asst' ? 'Accounts Assistant Panel' :
               currentUser?.role === 'civil_supervisor' ? 'Civil Supervisor Panel' :
               currentUser?.role === 'plumber' ? 'Plumber Panel' :
               currentUser?.role === 'girls_hostel_rector' ? 'Girls Hostel Rector Panel' :
               currentUser?.role === 'peon' ? 'Peon Panel' :
               currentUser?.role === 'etp_operator' ? 'ETP Operator Panel' :
               currentUser?.role ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1).replace(/_/g, ' ')} Panel` : 'Dashboard'}
            </h1>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{currentUser?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{currentUser?.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    window.innerWidth < 1024 && onToggle();
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 