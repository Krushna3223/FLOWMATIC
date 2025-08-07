export interface HierarchyConfig {
  role: string;
  level: number;
  canSendRequestsTo: string[];
  canReceiveFrom: string[];
  canApprove: string[];
  canView: string[];
  description: string;
  department?: string;
}

export interface RequestFlow {
  fromRole: string;
  toRole: string;
  autoForward: boolean;
  requiresApproval: boolean;
  maxResponseTime?: number; // in hours
}

export interface RolePermissions {
  canViewStudents: boolean;
  canViewFaculty: boolean;
  canViewReports: boolean;
  canApproveCertificates: boolean;
  canManageInventory: boolean;
  canHandleComplaints: boolean;
  canManageFees: boolean;
  canViewAllDepartments: boolean;
  canManageStaff: boolean;
  canViewAuditLogs: boolean;
}

// Hierarchy Configuration
export const HIERARCHY_CONFIG: { [key: string]: HierarchyConfig } = {
  // Academic Hierarchy
  student: {
    role: 'student',
    level: 1,
    canSendRequestsTo: ['teacher', 'clerk', 'registrar'],
    canReceiveFrom: [],
    canApprove: [],
    canView: ['student'],
    description: 'Students can request certificates, submit complaints',
    department: 'academic'
  },
  teacher: {
    role: 'teacher',
    level: 2,
    canSendRequestsTo: ['hod', 'registrar', 'principal'],
    canReceiveFrom: ['student'],
    canApprove: ['student'],
    canView: ['student', 'teacher'],
    description: 'Class coordinators and teachers - can submit applications and complaints',
    department: 'academic'
  },
  hod: {
    role: 'hod',
    level: 3,
    canSendRequestsTo: ['principal', 'registrar'],
    canReceiveFrom: ['teacher', 'student', 'tech_lab_asst', 'lab_asst_civil'],
    canApprove: ['teacher', 'student', 'tech_lab_asst', 'lab_asst_civil'],
    canView: ['student', 'teacher', 'hod', 'tech_lab_asst', 'lab_asst_civil'],
    description: 'Head of Department - reviews teacher applications and complaints',
    department: 'academic'
  },
  principal: {
    role: 'principal',
    level: 4,
    canSendRequestsTo: [],
    canReceiveFrom: ['hod', 'registrar', 'all_staff'],
    canApprove: ['all'],
    canView: ['all'],
    description: 'Principal - Final authority',
    department: 'academic'
  },

  // Non-Teaching Staff Hierarchy
  registrar: {
    role: 'registrar',
    level: 3,
    canSendRequestsTo: ['principal'],
    canReceiveFrom: ['all_non_teaching', 'hod', 'student'],
    canApprove: ['all_non_teaching', 'student'],
    canView: ['all_non_teaching', 'student', 'hod'],
    description: 'Registrar - Handles administrative requests',
    department: 'administration'
  },
  workshop_instructor: {
    role: 'workshop_instructor',
    level: 2,
    canSendRequestsTo: ['hod', 'registrar', 'asst_store'],
    canReceiveFrom: ['student', 'tech_lab_asst'],
    canApprove: ['student'],
    canView: ['student', 'tech_lab_asst'],
    description: 'Workshop Instructor',
    department: 'mechanical'
  },
  electrician: {
    role: 'electrician',
    level: 2,
    canSendRequestsTo: ['registrar', 'civil_supervisor', 'principal'],
    canReceiveFrom: ['all_staff', 'student'],
    canApprove: [],
    canView: ['all_staff'],
    description: 'Electrician - Maintenance',
    department: 'maintenance'
  },
  computer_technician: {
    role: 'computer_technician',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['all_staff', 'student'],
    canApprove: [],
    canView: ['all_staff'],
    description: 'Computer Technician',
    department: 'it'
  },
  asst_librarian: {
    role: 'asst_librarian',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['student', 'teacher'],
    canApprove: ['student'],
    canView: ['student', 'teacher'],
    description: 'Assistant Librarian',
    department: 'library'
  },
  asst_store: {
    role: 'asst_store',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['workshop_instructor', 'tech_lab_asst', 'lab_asst_civil'],
    canApprove: ['workshop_instructor', 'tech_lab_asst', 'lab_asst_civil'],
    canView: ['workshop_instructor', 'tech_lab_asst', 'lab_asst_civil'],
    description: 'Assistant Store',
    department: 'store'
  },
  tech_lab_asst: {
    role: 'tech_lab_asst',
    level: 2,
    canSendRequestsTo: ['hod', 'workshop_instructor', 'asst_store'],
    canReceiveFrom: ['student'],
    canApprove: ['student'],
    canView: ['student'],
    description: 'Technical Lab Assistant',
    department: 'technical'
  },
  lab_asst_civil: {
    role: 'lab_asst_civil',
    level: 2,
    canSendRequestsTo: ['hod', 'asst_store'],
    canReceiveFrom: ['student'],
    canApprove: ['student'],
    canView: ['student'],
    description: 'Civil Lab Assistant',
    department: 'civil'
  },
  clerk: {
    role: 'clerk',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['all_staff', 'student'],
    canApprove: ['student'],
    canView: ['all_staff', 'student'],
    description: 'Clerk - Document processing',
    department: 'administration'
  },
  security_guard: {
    role: 'security_guard',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['all_staff', 'student'],
    canApprove: [],
    canView: ['all_staff'],
    description: 'Security Guard',
    department: 'security'
  },
  fire_operator: {
    role: 'fire_operator',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['all_staff', 'student'],
    canApprove: [],
    canView: ['all_staff'],
    description: 'Fire Operator',
    department: 'safety'
  },
  accounts_asst: {
    role: 'accounts_asst',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['student', 'clerk'],
    canApprove: ['student'],
    canView: ['student', 'clerk'],
    description: 'Accounts Assistant',
    department: 'accounts'
  },
  civil_supervisor: {
    role: 'civil_supervisor',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['hod', 'plumber', 'electrician'],
    canApprove: ['plumber', 'electrician'],
    canView: ['plumber', 'electrician'],
    description: 'Civil Supervisor',
    department: 'maintenance'
  },
  plumber: {
    role: 'plumber',
    level: 2,
    canSendRequestsTo: ['registrar', 'civil_supervisor'],
    canReceiveFrom: ['all_staff', 'student'],
    canApprove: [],
    canView: ['all_staff'],
    description: 'Plumber',
    department: 'maintenance'
  },
  girls_hostel_rector: {
    role: 'girls_hostel_rector',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['student'],
    canApprove: ['student'],
    canView: ['student'],
    description: 'Girls Hostel Rector',
    department: 'hostel'
  },
  peon: {
    role: 'peon',
    level: 1,
    canSendRequestsTo: ['registrar', 'clerk'],
    canReceiveFrom: ['all_staff'],
    canApprove: [],
    canView: ['all_staff'],
    description: 'Peon',
    department: 'general'
  },
  etp_operator: {
    role: 'etp_operator',
    level: 2,
    canSendRequestsTo: ['registrar', 'principal'],
    canReceiveFrom: ['civil_supervisor'],
    canApprove: [],
    canView: ['civil_supervisor'],
    description: 'ETP Operator',
    department: 'maintenance'
  }
};

// Request Flow Configuration
export const REQUEST_FLOWS: RequestFlow[] = [
  // Academic flows
  { fromRole: 'student', toRole: 'teacher', autoForward: false, requiresApproval: true },
  { fromRole: 'teacher', toRole: 'hod', autoForward: false, requiresApproval: true },
  { fromRole: 'hod', toRole: 'principal', autoForward: false, requiresApproval: true },
  
  // Certificate requests
  { fromRole: 'student', toRole: 'clerk', autoForward: false, requiresApproval: true },
  { fromRole: 'clerk', toRole: 'registrar', autoForward: true, requiresApproval: true },
  { fromRole: 'registrar', toRole: 'principal', autoForward: true, requiresApproval: true },
  
  // Maintenance flows
  { fromRole: 'all_staff', toRole: 'electrician', autoForward: false, requiresApproval: false },
  { fromRole: 'electrician', toRole: 'civil_supervisor', autoForward: true, requiresApproval: false },
  { fromRole: 'civil_supervisor', toRole: 'registrar', autoForward: true, requiresApproval: true },
  
  // Library flows
  { fromRole: 'student', toRole: 'asst_librarian', autoForward: false, requiresApproval: true },
  { fromRole: 'asst_librarian', toRole: 'registrar', autoForward: true, requiresApproval: true },
  
  // Store flows
  { fromRole: 'workshop_instructor', toRole: 'asst_store', autoForward: false, requiresApproval: true },
  { fromRole: 'asst_store', toRole: 'registrar', autoForward: true, requiresApproval: true },
  
  // Lab flows
  { fromRole: 'student', toRole: 'tech_lab_asst', autoForward: false, requiresApproval: true },
  { fromRole: 'tech_lab_asst', toRole: 'workshop_instructor', autoForward: true, requiresApproval: true },
  { fromRole: 'workshop_instructor', toRole: 'hod', autoForward: true, requiresApproval: true }
];

// Role Permissions
export const ROLE_PERMISSIONS: { [key: string]: RolePermissions } = {
  principal: {
    canViewStudents: true,
    canViewFaculty: true,
    canViewReports: true,
    canApproveCertificates: true,
    canManageInventory: true,
    canHandleComplaints: true,
    canManageFees: true,
    canViewAllDepartments: true,
    canManageStaff: true,
    canViewAuditLogs: true
  },
  registrar: {
    canViewStudents: true,
    canViewFaculty: false,
    canViewReports: true,
    canApproveCertificates: true,
    canManageInventory: true,
    canHandleComplaints: true,
    canManageFees: false,
    canViewAllDepartments: true,
    canManageStaff: false,
    canViewAuditLogs: true
  },
  hod: {
    canViewStudents: true,
    canViewFaculty: true,
    canViewReports: true,
    canApproveCertificates: false,
    canManageInventory: false,
    canHandleComplaints: true,
    canManageFees: false,
    canViewAllDepartments: false,
    canManageStaff: false,
    canViewAuditLogs: false
  },
  teacher: {
    canViewStudents: true,
    canViewFaculty: false,
    canViewReports: false,
    canApproveCertificates: false,
    canManageInventory: false,
    canHandleComplaints: true,
    canManageFees: false,
    canViewAllDepartments: false,
    canManageStaff: false,
    canViewAuditLogs: false
  },
  student: {
    canViewStudents: false,
    canViewFaculty: false,
    canViewReports: false,
    canApproveCertificates: false,
    canManageInventory: false,
    canHandleComplaints: false,
    canManageFees: false,
    canViewAllDepartments: false,
    canManageStaff: false,
    canViewAuditLogs: false
  }
};

// Request Type Hierarchies
export interface RequestTypeHierarchy {
  requestType: string;
  category: string;
  hierarchy: string[];
  autoForward: boolean;
  requiresApproval: boolean;
  maxLevels: number;
  description: string;
}

export const REQUEST_TYPE_HIERARCHIES: RequestTypeHierarchy[] = [
  // Academic Requests
  {
    requestType: 'certificate',
    category: 'Academic',
    hierarchy: ['student', 'clerk', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Certificate requests follow academic hierarchy'
  },
  {
    requestType: 'achievement',
    category: 'Academic',
    hierarchy: ['student', 'teacher', 'hod', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Achievement submissions for verification'
  },
  {
    requestType: 'academic',
    category: 'Academic',
    hierarchy: ['student', 'teacher', 'hod', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'General academic requests'
  },
  {
    requestType: 'leave',
    category: 'Academic',
    hierarchy: ['student', 'teacher', 'hod', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Student leave applications'
  },

  // Maintenance Requests
  {
    requestType: 'maintenance',
    category: 'Technical',
    hierarchy: ['student', 'clerk', 'electrician', 'civil_supervisor', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 5,
    description: 'General maintenance requests'
  },
  {
    requestType: 'electrical',
    category: 'Technical',
    hierarchy: ['student', 'clerk', 'electrician', 'civil_supervisor', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 5,
    description: 'Electrical maintenance issues'
  },
  {
    requestType: 'plumbing',
    category: 'Technical',
    hierarchy: ['student', 'clerk', 'plumber', 'civil_supervisor', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 5,
    description: 'Plumbing and water supply issues'
  },
  {
    requestType: 'it_maintenance',
    category: 'Technical',
    hierarchy: ['student', 'clerk', 'computer_technician', 'tech_lab_asst', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 5,
    description: 'IT and computer maintenance'
  },

  // Equipment & Tool Requests
  {
    requestType: 'tool_request',
    category: 'Equipment',
    hierarchy: ['workshop_instructor', 'asst_store', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Workshop tool and equipment requests'
  },
  {
    requestType: 'lab_equipment',
    category: 'Equipment',
    hierarchy: ['tech_lab_asst', 'asst_store', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Laboratory equipment requests'
  },
  {
    requestType: 'computer_equipment',
    category: 'Equipment',
    hierarchy: ['computer_technician', 'asst_store', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Computer and IT equipment requests'
  },

  // Stock & Inventory Requests
  {
    requestType: 'stock_request',
    category: 'Inventory',
    hierarchy: ['workshop_instructor', 'asst_store', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'General stock and inventory requests'
  },
  {
    requestType: 'plumbing_stock',
    category: 'Inventory',
    hierarchy: ['plumber', 'asst_store', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Plumbing supplies and materials'
  },
  {
    requestType: 'electrical_stock',
    category: 'Inventory',
    hierarchy: ['electrician', 'asst_store', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Electrical supplies and materials'
  },

  // Library Requests
  {
    requestType: 'library_request',
    category: 'Library',
    hierarchy: ['student', 'asst_librarian', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Library book and resource requests'
  },
  {
    requestType: 'library_timing',
    category: 'Library',
    hierarchy: ['asst_librarian', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Library timing and schedule changes'
  },

  // Financial Requests
  {
    requestType: 'fee_payment',
    category: 'Financial',
    hierarchy: ['student', 'accounts_asst', 'registrar'],
    autoForward: false,
    requiresApproval: false,
    maxLevels: 3,
    description: 'Student fee payments'
  },
  {
    requestType: 'fee_waiver',
    category: 'Financial',
    hierarchy: ['student', 'accounts_asst', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Fee waiver applications'
  },
  {
    requestType: 'payroll',
    category: 'Financial',
    hierarchy: ['clerk', 'accounts_asst', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Staff payroll and salary requests'
  },

  // Security & Safety
  {
    requestType: 'security_incident',
    category: 'Security',
    hierarchy: ['security_guard', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Security incident reports'
  },
  {
    requestType: 'visitor_log',
    category: 'Security',
    hierarchy: ['security_guard', 'registrar'],
    autoForward: false,
    requiresApproval: false,
    maxLevels: 2,
    description: 'Visitor entry and exit logs'
  },
  {
    requestType: 'fire_incident',
    category: 'Safety',
    hierarchy: ['fire_operator', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Fire safety incident reports'
  },
  {
    requestType: 'safety_audit',
    category: 'Safety',
    hierarchy: ['fire_operator', 'civil_supervisor', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Safety audit and inspection reports'
  },

  // Hostel & Accommodation
  {
    requestType: 'hostel_allocation',
    category: 'Hostel',
    hierarchy: ['student', 'girls_hostel_rector', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Hostel room allocation requests'
  },
  {
    requestType: 'hostel_complaint',
    category: 'Hostel',
    hierarchy: ['student', 'girls_hostel_rector', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Hostel-related complaints'
  },

  // Staff Management
  {
    requestType: 'staff_leave',
    category: 'Administrative',
    hierarchy: ['clerk', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Staff leave applications'
  },
  {
    requestType: 'performance_review',
    category: 'Administrative',
    hierarchy: ['hod', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Faculty performance reviews'
  },

  // Technical Support
  {
    requestType: 'it_complaint',
    category: 'Technical',
    hierarchy: ['student', 'computer_technician', 'tech_lab_asst', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'IT and computer complaints'
  },
  {
    requestType: 'lab_assistance',
    category: 'Technical',
    hierarchy: ['student', 'tech_lab_asst', 'hod', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Laboratory assistance requests'
  },

  // Workshop & Industrial
  {
    requestType: 'workshop_request',
    category: 'Workshop',
    hierarchy: ['student', 'workshop_instructor', 'hod', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Workshop equipment and safety requests'
  },
  {
    requestType: 'safety_notice',
    category: 'Workshop',
    hierarchy: ['workshop_instructor', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'Workshop safety notices and protocols'
  },

  // Utility & Services
  {
    requestType: 'etp_operation',
    category: 'Utility',
    hierarchy: ['etp_operator', 'civil_supervisor', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'ETP plant operation reports'
  },
  {
    requestType: 'general_service',
    category: 'Utility',
    hierarchy: ['peon', 'clerk', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'General service and support requests'
  },

  // Teacher Applications & Complaints
  {
    requestType: 'teacher_application',
    category: 'Teacher',
    hierarchy: ['teacher', 'hod', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Teacher applications for leave, resources, permissions, etc.'
  },
  {
    requestType: 'teacher_complaint',
    category: 'Teacher',
    hierarchy: ['teacher', 'hod', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Teacher complaints about infrastructure, technology, administrative issues'
  },
  {
    requestType: 'teacher_leave',
    category: 'Teacher',
    hierarchy: ['teacher', 'hod', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Teacher leave applications'
  },
  {
    requestType: 'teacher_resource',
    category: 'Teacher',
    hierarchy: ['teacher', 'hod', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Teacher resource and equipment requests'
  },
  {
    requestType: 'teacher_permission',
    category: 'Teacher',
    hierarchy: ['teacher', 'hod', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'Teacher permission requests for schedule changes, events, etc.'
  },

  // General Requests
  {
    requestType: 'general',
    category: 'General',
    hierarchy: ['student', 'clerk', 'registrar'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 3,
    description: 'General inquiries and requests'
  },
  {
    requestType: 'complaint',
    category: 'General',
    hierarchy: ['student', 'clerk', 'registrar', 'principal'],
    autoForward: true,
    requiresApproval: true,
    maxLevels: 4,
    description: 'General complaints and grievances'
  },
  {
    requestType: 'feedback',
    category: 'General',
    hierarchy: ['student', 'clerk', 'registrar'],
    autoForward: false,
    requiresApproval: false,
    maxLevels: 3,
    description: 'Feedback and suggestions'
  }
];

// Helper function to get hierarchy for a specific request type
export const getRequestTypeHierarchy = (requestType: string): RequestTypeHierarchy | undefined => {
  return REQUEST_TYPE_HIERARCHIES.find(h => h.requestType === requestType);
};

// Helper function to get all hierarchies by category
export const getHierarchiesByCategory = (category: string): RequestTypeHierarchy[] => {
  return REQUEST_TYPE_HIERARCHIES.filter(h => h.category === category);
};

// Helper function to get next approver for a specific request type
export const getNextApproverForRequestType = (currentRole: string, requestType: string): string | null => {
  const hierarchy = getRequestTypeHierarchy(requestType);
  if (!hierarchy) return null;
  
  const currentIndex = hierarchy.hierarchy.indexOf(currentRole);
  if (currentIndex === -1 || currentIndex >= hierarchy.hierarchy.length - 1) {
    return null; // No next approver
  }
  
  return hierarchy.hierarchy[currentIndex + 1];
};

// Helper function to check if role can approve request type
export const canApproveRequestType = (role: string, requestType: string): boolean => {
  const hierarchy = getRequestTypeHierarchy(requestType);
  if (!hierarchy) return false;
  
  return hierarchy.hierarchy.includes(role);
};

// Helper function to get all request types a role can handle
export const getRequestTypesForRole = (role: string): string[] => {
  return REQUEST_TYPE_HIERARCHIES
    .filter(h => h.hierarchy.includes(role))
    .map(h => h.requestType);
};

// Helper function to get categories for a role
export const getCategoriesForRole = (role: string): string[] => {
  const categories = new Set<string>();
  REQUEST_TYPE_HIERARCHIES
    .filter(h => h.hierarchy.includes(role))
    .forEach(h => categories.add(h.category));
  return Array.from(categories);
};

// Helper functions
export const getRoleLevel = (role: string): number => {
  return HIERARCHY_CONFIG[role]?.level || 0;
};

export const canSendRequestTo = (fromRole: string, toRole: string): boolean => {
  const config = HIERARCHY_CONFIG[fromRole];
  if (!config) return false;
  
  return config.canSendRequestsTo.includes(toRole) || 
         config.canSendRequestsTo.includes('all') ||
         config.canSendRequestsTo.includes('all_staff') ||
         config.canSendRequestsTo.includes('all_non_teaching');
};

export const canReceiveFrom = (toRole: string, fromRole: string): boolean => {
  const config = HIERARCHY_CONFIG[toRole];
  if (!config) return false;
  
  return config.canReceiveFrom.includes(fromRole) || 
         config.canReceiveFrom.includes('all') ||
         config.canReceiveFrom.includes('all_staff') ||
         config.canReceiveFrom.includes('all_non_teaching');
};

export const getRolePermissions = (role: string): RolePermissions => {
  return ROLE_PERMISSIONS[role] || {
    canViewStudents: false,
    canViewFaculty: false,
    canViewReports: false,
    canApproveCertificates: false,
    canManageInventory: false,
    canHandleComplaints: false,
    canManageFees: false,
    canViewAllDepartments: false,
    canManageStaff: false,
    canViewAuditLogs: false
  };
};

export const getNextApprover = (currentRole: string, requestType: string): string | null => {
  const config = HIERARCHY_CONFIG[currentRole];
  if (!config) return null;
  
  // Find the next approver based on request type
  switch (requestType) {
    case 'certificate':
      if (currentRole === 'student') return 'clerk';
      if (currentRole === 'clerk') return 'registrar';
      if (currentRole === 'registrar') return 'principal';
      break;
    case 'maintenance':
      if (currentRole === 'all_staff') return 'electrician';
      if (currentRole === 'electrician') return 'civil_supervisor';
      if (currentRole === 'civil_supervisor') return 'registrar';
      break;
    case 'academic':
      if (currentRole === 'student') return 'teacher';
      if (currentRole === 'teacher') return 'hod';
      if (currentRole === 'hod') return 'principal';
      break;
  }
  
  return null;
}; 