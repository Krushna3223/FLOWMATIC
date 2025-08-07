export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'principal' | 'student' | 'teacher' | 'non_teaching_staff' | 'hod' | 
        'registrar' | 'workshop_instructor' | 'electrician' | 'computer_technician' | 
        'asst_librarian' | 'asst_store' | 'tech_lab_asst' | 'lab_asst_civil' | 
        'clerk' | 'security_guard' | 'fire_operator' | 'accounts_asst' | 'civil_supervisor' | 
        'plumber' | 'girls_hostel_rector' | 'peon' | 'etp_operator';
  phone?: string;
  department?: string;
  staffRole?: string;
  rollNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  course: string;
  year: string;
  department: string;
  feeStatus: 'paid' | 'pending' | 'overdue' | 'unknown';
  totalFees?: string;
  dueAmount?: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface CertificateRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  certificateType: 'bonafide' | 'tc' | 'noc' | 'character' | 'other';
  reason: string;
  status: 'pending' | 'admin_approved' | 'principal_approved' | 'rejected' | 'completed';
  adminApprovedAt?: string;
  principalApprovedAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  createdAt: string;
  adminNotes?: string;
  principalNotes?: string;
}

// New interfaces for non-teaching staff functionalities
export interface StudentAcademicHistory {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  year: string;
  semester: string;
  subjects: string[];
  grades: Record<string, string>;
  attendance: number;
  createdAt: string;
}

export interface DocumentVerification {
  id: string;
  documentType: 'admission' | 'transfer' | 'bonafide' | 'tc' | 'noc' | 'other';
  studentId: string;
  studentName: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface SemesterStatistics {
  id: string;
  semester: string;
  year: string;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  averageAttendance: number;
  totalFeesCollected: number;
  pendingFees: number;
  createdAt: string;
}

export interface WorkshopEquipment {
  id: string;
  name: string;
  category: 'machine' | 'tool' | 'safety_equipment' | 'other';
  quantity: number;
  location: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  lastMaintenance: string;
  nextMaintenance: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  createdAt: string;
}

export interface EquipmentConditionReport {
  id: string;
  equipmentId: string;
  equipmentName: string;
  reportedBy: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  description: string;
  photoUrl?: string;
  status: 'pending' | 'reviewed' | 'action_taken';
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'carpentry' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  reportedBy: string;
  assignedTo?: string;
  location: string;
  createdAt: string;
  completedAt?: string;
}

export interface LibraryInventory {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: 'textbook' | 'reference' | 'fiction' | 'non_fiction' | 'magazine' | 'other';
  quantity: number;
  available: number;
  location: string;
  addedBy: string;
  createdAt: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerId: string;
  borrowerName: string;
  borrowerType: 'student' | 'staff' | 'teacher';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
  fine?: number;
  createdAt: string;
}

export interface StoreInventory {
  id: string;
  name: string;
  category: 'lab_supplies' | 'workshop_tools' | 'office_supplies' | 'staff_materials' | 'other';
  quantity: number;
  unit: string;
  location: string;
  minQuantity: number;
  supplier?: string;
  lastUpdated: string;
  createdAt: string;
}

export interface StockEntry {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  requestedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface LabSchedule {
  id: string;
  labName: string;
  labType: 'computer' | 'civil' | 'mechanical' | 'electrical' | 'other';
  day: string;
  timeSlot: string;
  subject: string;
  teacher: string;
  class: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  category: 'safety' | 'equipment' | 'behavior' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  location: string;
  status: 'pending' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptUrl?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paidDate?: string;
  createdAt: string;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  purpose: string;
  contactPerson: string;
  entryTime: string;
  exitTime?: string;
  passNumber: string;
  status: 'inside' | 'left';
  createdAt: string;
}

export interface FireDrill {
  id: string;
  date: string;
  time: string;
  duration: number;
  participants: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface HostelAllotment {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  block: string;
  floor: string;
  checkInDate: string;
  checkOutDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TaskAssignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  pendingCertificates: number;
  approvedCertificates: number;
  totalFeesCollected: number;
  pendingFees: number;
}

export interface Achievement {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  title: string;
  description: string;
  category: 'academic' | 'sports' | 'cultural' | 'technical' | 'other';
  date: string;
  photoUrl?: string;
  status: 'pending' | 'approved_by_teacher' | 'approved_by_hod' | 'forwarded_to_hod' | 'forwarded_to_principal' | 'approved_by_principal' | 'rejected_by_teacher' | 'rejected_by_hod' | 'rejected_by_principal';
  teacherComment?: string;
  hodComment?: string;
  principalComment?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  department?: string;
} 