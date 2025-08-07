import React, { useState, useEffect } from 'react';
import { ref, get, update, push, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { toast } from 'react-hot-toast';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  CreditCard,
  Receipt
} from 'lucide-react';

interface FeeStructure {
  id: string;
  course: string;
  year: string;
  department: string;
  totalAmount: number;
  breakdown: {
    tuition: number;
    library: number;
    laboratory: number;
    examination: number;
    other: number;
  };
  dueDate: string;
  academicYear: string;
}

interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  paymentMethod: 'cash' | 'online' | 'cheque' | 'card';
  receiptNumber: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

interface StudentFeeStatus {
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  year: string;
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  lastPaymentDate?: string;
  feeStatus: 'paid' | 'partial' | 'overdue' | 'pending';
  department?: string; // Added for fee status report
}

const FeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'structure' | 'payments' | 'students' | 'reports'>('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  
  // Data states
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [studentFeeStatuses, setStudentFeeStatuses] = useState<StudentFeeStatus[]>([]);
  
  // Modal states
  const [isAddFeeStructureModalOpen, setIsAddFeeStructureModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  
  // Report date range states
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    reportType: 'dateRange' as 'dateRange' | 'month' | 'all'
  });

  // Report type selection state
  const [selectedReportType, setSelectedReportType] = useState<'payment' | 'feeStatus' | 'collection' | 'studentList' | 'feeStructure' | 'paymentHistory' | 'overdueReport' | 'departmentWise' | null>(null);
  
  // Form states
  const [feeStructureForm, setFeeStructureForm] = useState({
    course: '',
    year: '',
    totalAmount: '',
    tuition: '',
    library: '',
    laboratory: '',
    examination: '',
    other: '',
    dueDate: '',
    academicYear: '',
    department: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    studentName: '',
    rollNumber: '',
    amount: '',
    paymentMethod: 'cash' as const,
    receiptNumber: '',
    notes: ''
  });

  // Refresh fee data when component mounts
  useEffect(() => {
    fetchFeeData();
  }, []);

  // Refresh fee data when user navigates to fee management
  useEffect(() => {
    const handleFocus = () => {
      fetchFeeData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      // Fetch students from users node
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      // Fetch fee data from fees node (same as Student Management)
      const feesRef = ref(database, 'fees');
      const feesSnapshot = await get(feesRef);
      
      console.log('🔍 Fetching fee data...');
      console.log('📊 Users snapshot exists:', usersSnapshot.exists());
      console.log('💰 Fees snapshot exists:', feesSnapshot.exists());
      
      if (usersSnapshot.exists()) {
        const students: StudentFeeStatus[] = [];
        const feeStructures: FeeStructure[] = [];
        const payments: PaymentRecord[] = [];
        
        const feesData = feesSnapshot.exists() ? feesSnapshot.val() : {};
        console.log('💰 Fees data:', feesData);
        
        usersSnapshot.forEach((child) => {
          const userData = child.val();
          
          // Only process students (users with role 'student')
          if (userData.role === 'student') {
            const rollNumber = userData.rollNo || userData.rollNumber || 'N/A';
            console.log(`👤 Processing student: ${userData.name} (${rollNumber})`);
            
            // Get fee data from fees node (same as Student Management)
            let totalFees = 50000; // Default
            let paidAmount = 0; // Default
            let dueAmount = totalFees; // Default
            let lastPaymentDate = userData.lastPaymentDate; // Default from user data
            
            // Check if fee data exists for this roll number
            if (feesData && feesData[rollNumber]) {
              const studentFees = feesData[rollNumber];
              console.log(`💰 Fee data for ${rollNumber}:`, studentFees);
              
              totalFees = studentFees.total || 50000;
              paidAmount = studentFees.paid || 0;
              dueAmount = totalFees - paidAmount;
              
              // Get last payment date from fees node if available
              if (studentFees.lastPaymentDate) {
                lastPaymentDate = studentFees.lastPaymentDate;
              }
              
              console.log(`💰 Calculated fees for ${rollNumber}:`, {
                totalFees,
                paidAmount,
                dueAmount,
                lastPaymentDate
              });
            } else {
              console.log(`⚠️ No fee data found for roll number: ${rollNumber}`);
            }
            
            let feeStatus: 'paid' | 'partial' | 'overdue' | 'pending' = 'pending';
            if (dueAmount <= 0) feeStatus = 'paid';
            else if (paidAmount > 0) feeStatus = 'partial';
            else if (dueAmount > 0) feeStatus = 'overdue';

            students.push({
              studentId: child.key!,
              studentName: userData.name || userData.studentName || 'Unknown Student',
              rollNumber: rollNumber,
              course: userData.course || 'B-Tech',
              year: userData.year || userData.academicYear || '1st Year',
              department: userData.department || 'CSE',
              totalFees,
              paidAmount,
              dueAmount,
              lastPaymentDate,
              feeStatus
            });

            // Create fee structure for this student's course if it doesn't exist
            const course = userData.course || 'B-Tech';
            const year = userData.year || '1st Year';
            const structureKey = `${course}-${year}`;
            const existingStructure = feeStructures.find(s => s.id === structureKey);
            if (!existingStructure) {
              feeStructures.push({
                id: structureKey,
                course: course,
                year: year,
                department: userData.department || 'CSE',
                totalAmount: totalFees,
                breakdown: {
                  tuition: Math.round(totalFees * 0.7),
                  library: Math.round(totalFees * 0.1),
                  laboratory: Math.round(totalFees * 0.15),
                  examination: Math.round(totalFees * 0.03),
                  other: Math.round(totalFees * 0.02)
                },
                dueDate: '2024-08-15',
                academicYear: userData.academicYear || '2024-25'
              });
            }

            // Read payment history from fees/{rollNumber}/history if it exists
            if (feesData && feesData[rollNumber] && feesData[rollNumber].history) {
              const historyData = feesData[rollNumber].history;
              console.log(`💰 Payment history for ${rollNumber}:`, historyData);
              
              Object.entries(historyData).forEach(([paymentId, paymentData]: [string, any]) => {
                payments.push({
                  id: paymentId,
                  studentId: child.key!,
                  studentName: userData.name || userData.studentName || 'Unknown Student',
                  rollNumber: rollNumber,
                  amount: parseFloat(paymentData.amount) || 0,
                  paymentMethod: paymentData.mode || 'cash',
                  receiptNumber: paymentData.reference || `RCP-${paymentId}`,
                  paymentDate: paymentData.date || new Date().toISOString(),
                  notes: paymentData.notes || 'Payment from history',
                  status: 'completed'
                });
              });
            }
          }
        });

        setStudentFeeStatuses(students);
        setFeeStructures(feeStructures);
        setPaymentRecords(payments);

        console.log(`✅ Loaded ${students.length} students, ${feeStructures.length} fee structures, ${payments.length} payments`);
        console.log('📊 Students data:', students);
      } else {
        console.log('❌ No users found in database');
        setStudentFeeStatuses([]);
        setFeeStructures([]);
        setPaymentRecords([]);
      }
    } catch (error) {
      console.error('❌ Error fetching fee data:', error);
      toast.error('Could not load fee data. Please check your connection and try again.');
      setStudentFeeStatuses([]);
      setFeeStructures([]);
      setPaymentRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle fee structure submission
  const handleFeeStructureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalAmount = parseFloat(feeStructureForm.totalAmount);
      const breakdown = {
        tuition: parseFloat(feeStructureForm.tuition),
        library: parseFloat(feeStructureForm.library),
        laboratory: parseFloat(feeStructureForm.laboratory),
        examination: parseFloat(feeStructureForm.examination),
        other: parseFloat(feeStructureForm.other)
      };

      const newStructure = {
        course: feeStructureForm.course,
        year: feeStructureForm.year,
        department: feeStructureForm.department,
        totalAmount,
        breakdown,
        dueDate: feeStructureForm.dueDate,
        academicYear: feeStructureForm.academicYear,
      };

      // Save to fees node for consistency with Student Management
      const feesRef = ref(database, 'fees');
      const newStructureRef = push(feesRef);
      await set(newStructureRef, newStructure);

      toast.success('Fee structure added successfully!');
      setIsAddFeeStructureModalOpen(false);
      setFeeStructureForm({
        course: '', year: '', totalAmount: '', tuition: '', library: '',
        laboratory: '', examination: '', other: '', dueDate: '', academicYear: '', department: ''
      });
      fetchFeeData();
    } catch (error) {
      console.error('Error adding fee structure:', error);
      toast.error('Failed to add fee structure');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.studentId || !paymentForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        amount: paymentForm.amount,
        date: new Date().toISOString(),
        mode: paymentForm.paymentMethod,
        reference: paymentForm.receiptNumber || `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        notes: paymentForm.notes || ''
      };

      console.log('Starting payment recording process...');

      // Get student data
      const studentRef = ref(database, `users/${paymentForm.studentId}`);
      const studentSnapshot = await get(studentRef);
      
      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.val();
        const rollNumber = studentData.rollNo || studentData.rollNumber || 'N/A';
        
        console.log('Recording payment:', {
          studentId: paymentForm.studentId,
          rollNumber,
          amount: paymentData.amount
        });

        // Update fee data in fees node (same structure as Student Management)
        const feesRef = ref(database, `fees/${rollNumber}`);
        
        // Get current fee data
        const feesSnapshot = await get(feesRef);
        let currentFees = { total: 50000, paid: 0, due: 50000 };
        
        if (feesSnapshot.exists()) {
          currentFees = feesSnapshot.val();
        }
        
        const newPaidAmount = (currentFees.paid || 0) + parseFloat(paymentData.amount);
        const totalFees = currentFees.total || 50000;
        const newDueAmount = totalFees - newPaidAmount;
        
        console.log('Step 1: Updating fees node...');
        // Update fee data in fees node
        await update(feesRef, {
          total: totalFees,
          paid: newPaidAmount,
          due: newDueAmount,
          lastPaymentDate: paymentData.date
        });
        console.log('Step 1: Fees node updated successfully');

        console.log('Step 2: Adding payment record to history...');
        // Add payment record to fees/{rollNumber}/history
        const historyRef = ref(database, `fees/${rollNumber}/history`);
        const newPaymentRef = push(historyRef);
        
        // Ensure payment data structure matches RDB format exactly
        const historyPaymentData = {
          amount: paymentData.amount.toString(), // Ensure it's a string
          date: paymentData.date,
          mode: paymentData.mode,
          reference: paymentData.reference,
          notes: paymentData.notes || ''
        };
        
        console.log('📝 Payment data to be saved:', historyPaymentData);
        console.log('📁 History path:', `fees/${rollNumber}/history`);
        
        await set(newPaymentRef, historyPaymentData);
        console.log('Step 2: Payment record added to history successfully');
        console.log('✅ Payment ID:', newPaymentRef.key);
        
        // Verify the payment was saved
        const verifyRef = ref(database, `fees/${rollNumber}/history/${newPaymentRef.key}`);
        const verifySnapshot = await get(verifyRef);
        if (verifySnapshot.exists()) {
          console.log('✅ Payment verification successful:', verifySnapshot.val());
        } else {
          console.log('❌ Payment verification failed - payment not found in database');
        }

        console.log('Payment saved to database successfully');

        // Update local state
        const updatedStudents = studentFeeStatuses.map(student => {
          if (student.studentId === paymentForm.studentId) {
            const newPaidAmount = student.paidAmount + parseFloat(paymentData.amount);
            const newDueAmount = student.totalFees - newPaidAmount;
            let newFeeStatus: 'paid' | 'partial' | 'overdue' | 'pending' = 'pending';
            if (newDueAmount <= 0) newFeeStatus = 'paid';
            else if (newPaidAmount > 0) newFeeStatus = 'partial';
            else if (newDueAmount > 0) newFeeStatus = 'overdue';

            return {
              ...student,
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              feeStatus: newFeeStatus,
              lastPaymentDate: paymentData.date
            };
          }
          return student;
        });

        setStudentFeeStatuses(updatedStudents);

        // Add to payment records
        const newPaymentRecord: PaymentRecord = {
          id: newPaymentRef.key!,
          studentId: paymentForm.studentId,
          studentName: paymentForm.studentName,
          rollNumber: paymentForm.rollNumber,
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentForm.paymentMethod,
          receiptNumber: paymentData.reference,
          paymentDate: paymentData.date,
          notes: paymentData.notes,
          status: 'completed'
        };

        setPaymentRecords(prev => [...prev, newPaymentRecord]);

        // Reset form
        setPaymentForm({
          studentId: '',
          studentName: '',
          rollNumber: '',
          amount: '',
          paymentMethod: 'cash',
          receiptNumber: '',
          notes: ''
        });

        setIsAddPaymentModalOpen(false);
        toast.success('Payment recorded successfully!');

        // Refresh data after a short delay
        setTimeout(() => {
          fetchFeeData();
        }, 1000);
      } else {
        toast.error('Student not found');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast.error('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard statistics
  const totalCollections = paymentRecords.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingFees = studentFeeStatuses.reduce((sum, student) => sum + student.dueAmount, 0);
  const totalStudents = studentFeeStatuses.length;
  const paidStudents = studentFeeStatuses.filter(s => s.feeStatus === 'paid').length;

  // Calculate actual payment method distribution
  const paymentMethodStats = paymentRecords.reduce((acc, payment) => {
    const method = payment.paymentMethod.toLowerCase();
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // If no payment records, show default distribution (all cash for current month)
  const hasPaymentRecords = paymentRecords.length > 0;

  // Calculate current month collections
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthCollections = paymentRecords.reduce((sum, payment) => {
    const paymentDate = new Date(payment.paymentDate);
    if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
      return sum + payment.amount;
    }
    return sum;
  }, 0);

  const stats = [
    {
      title: 'Total Collections',
      value: `₹${totalCollections.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Fees',
      value: `₹${pendingFees.toLocaleString()}`,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Fully Paid',
      value: `${paidStudents}/${totalStudents}`,
      icon: CheckCircle,
      color: 'bg-purple-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'online': return '💳';
      case 'cheque': return '📄';
      case 'card': return '💳';
      default: return '💰';
    }
  };

  // Add dropdown options
  const courseOptions = [
    'B-Tech',
    'M-Tech', 
    'BBA',
    'MBA',
    'BCA',
    'MCA',
    'B.Sc',
    'M.Sc',
    'B.Com',
    'M.Com'
  ];

  const yearOptions = [
    '1st Year',
    '2nd Year', 
    '3rd Year',
    '4th Year'
  ];

  const departmentOptions = [
    'AI and DS',
    'Electronics and Communication',
    'ECE',
    'Mechanical',
    'Electronics Engg (VLSI)',
    'Electrical Engg',
    'CSE',
    'Civil'
  ];

  // Handle export with date range filtering
  const handleExportWithDateRange = (format: 'csv' | 'excel' | 'pdf') => {
    // Validate date range if custom date range is selected
    if (dateRange.reportType === 'dateRange') {
      if (!dateRange.startDate || !dateRange.endDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }

    // Filter data based on date range
    const filterDataByDateRange = (data: any[], dateField: string) => {
      if (dateRange.reportType === 'all') {
        return data;
      }

      const startDate = dateRange.reportType === 'month' ? dateRange.startDate : dateRange.startDate;
      const endDate = dateRange.reportType === 'month' ? dateRange.endDate : dateRange.endDate;

      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
      });
    };

    // Call appropriate export function with filtered data
    if (selectedExportType === 'payment') {
      const filteredPayments = filterDataByDateRange(paymentRecords, 'paymentDate');
      exportPaymentReportWithData(format, filteredPayments);
    } else if (selectedExportType === 'feeStatus') {
      const filteredStudents = filterDataByDateRange(studentFeeStatuses, 'lastPaymentDate');
      exportFeeStatusReportWithData(format, filteredStudents);
    } else if (selectedExportType === 'collection') {
      const filteredPayments = filterDataByDateRange(paymentRecords, 'paymentDate');
      exportCollectionSummaryWithData(format, filteredPayments);
    } else if (selectedExportType === 'studentList') {
      const filteredStudents = filterDataByDateRange(studentFeeStatuses, 'lastPaymentDate');
      exportStudentListWithData(format, filteredStudents);
    } else if (selectedExportType === 'feeStructure') {
      exportFeeStructureWithData(format, feeStructures);
    } else if (selectedExportType === 'paymentHistory') {
      const filteredPayments = filterDataByDateRange(paymentRecords, 'paymentDate');
      exportPaymentHistoryWithData(format, filteredPayments);
    } else if (selectedExportType === 'overdueReport') {
      const overdueStudents = studentFeeStatuses.filter(s => s.feeStatus === 'overdue');
      exportOverdueReportWithData(format, overdueStudents);
    } else if (selectedExportType === 'departmentWise') {
      exportDepartmentWiseWithData(format, studentFeeStatuses, paymentRecords);
    }

    // Close modal and reset
    setShowFormatModal(false);
    setSelectedExportType(null);
    setDateRange({startDate: '', endDate: '', reportType: 'dateRange'});
  };

  // Helper function to export payment report with filtered data
  const exportPaymentReportWithData = (format: 'csv' | 'excel' | 'pdf', filteredPayments: PaymentRecord[]) => {
    const headers = ['Student Name', 'Roll Number', 'Payment Amount', 'Payment Method', 'Receipt Number', 'Payment Date', 'Status'];
    const data = filteredPayments.map(payment => [
      payment.studentName,
      payment.rollNumber,
      `₹${payment.amount.toLocaleString()}`,
      payment.paymentMethod.toUpperCase(),
      payment.receiptNumber,
      new Date(payment.paymentDate).toLocaleDateString('en-IN'),
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
    ]);

    const dateRangeText = dateRange.reportType === 'all' ? 'All Time' : 
                         dateRange.reportType === 'month' ? `Month: ${new Date(dateRange.startDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'long'})}` :
                         `Date Range: ${new Date(dateRange.startDate).toLocaleDateString('en-IN')} - ${new Date(dateRange.endDate).toLocaleDateString('en-IN')}`;

    if (format === 'csv') {
      const csvContent = [
        'PAYMENT REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'PAYMENT REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_report_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('PAYMENT REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      doc.text(`Period: ${dateRangeText}`, 105, 40, { align: 'center' });
      
      const startY = 55;
      const colWidths = [40, 25, 30, 25, 35, 25, 20];
      const headers = ['Student Name', 'Roll No', 'Amount', 'Method', 'Receipt', 'Date', 'Status'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      filteredPayments.forEach((payment, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          payment.studentName,
          payment.rollNumber,
          `₹${payment.amount.toLocaleString()}`,
          payment.paymentMethod.toUpperCase(),
          payment.receiptNumber,
          new Date(payment.paymentDate).toLocaleDateString('en-IN'),
          payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`payment_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Payment report exported successfully in ${format.toUpperCase()} format!`);
  };

  // Helper function to export fee status report with filtered data
  const exportFeeStatusReportWithData = (format: 'csv' | 'excel' | 'pdf', filteredStudents: StudentFeeStatus[]) => {
    const headers = ['Student Name', 'Roll Number', 'Course', 'Year', 'Total Fees', 'Paid Amount', 'Due Amount', 'Status', 'Last Payment Date'];
    const data = filteredStudents.map(student => [
      student.studentName,
      student.rollNumber,
      student.course,
      student.year,
      `₹${student.totalFees.toLocaleString()}`,
      `₹${student.paidAmount.toLocaleString()}`,
      `₹${student.dueAmount.toLocaleString()}`,
      student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1),
      student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
    ]);

    const dateRangeText = dateRange.reportType === 'all' ? 'All Time' : 
                         dateRange.reportType === 'month' ? `Month: ${new Date(dateRange.startDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'long'})}` :
                         `Date Range: ${new Date(dateRange.startDate).toLocaleDateString('en-IN')} - ${new Date(dateRange.endDate).toLocaleDateString('en-IN')}`;

    if (format === 'csv') {
      const csvContent = [
        'FEE STATUS REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fee_status_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'FEE STATUS REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fee_status_report_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('FEE STATUS REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      doc.text(`Period: ${dateRangeText}`, 105, 40, { align: 'center' });
      
      const startY = 55;
      const colWidths = [35, 25, 20, 15, 25, 25, 25, 20, 30];
      const headers = ['Student Name', 'Roll No', 'Course', 'Year', 'Total', 'Paid', 'Due', 'Status', 'Last Payment'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      filteredStudents.forEach((student, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          student.studentName,
          student.rollNumber,
          student.course,
          student.year,
          `₹${student.totalFees.toLocaleString()}`,
          `₹${student.paidAmount.toLocaleString()}`,
          `₹${student.dueAmount.toLocaleString()}`,
          student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1),
          student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`fee_status_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Fee status report exported successfully in ${format.toUpperCase()} format!`);
  };

  // Helper function to export collection summary with filtered data
  const exportCollectionSummaryWithData = (format: 'csv' | 'excel' | 'pdf', filteredPayments: PaymentRecord[]) => {
    const totalCollections = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingFees = studentFeeStatuses.reduce((sum, student) => sum + student.dueAmount, 0);
    const totalStudents = studentFeeStatuses.length;
    const paidStudents = studentFeeStatuses.filter(s => s.feeStatus === 'paid').length;
    const partialStudents = studentFeeStatuses.filter(s => s.feeStatus === 'partial').length;
    const overdueStudents = studentFeeStatuses.filter(s => s.feeStatus === 'overdue').length;

    const paymentMethodBreakdown = Object.entries(
      filteredPayments.reduce((acc, payment) => {
        acc[payment.paymentMethod] = acc[payment.paymentMethod] || { count: 0, amount: 0 };
        acc[payment.paymentMethod].count++;
        acc[payment.paymentMethod].amount += payment.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    );

    const dateRangeText = dateRange.reportType === 'all' ? 'All Time' : 
                         dateRange.reportType === 'month' ? `Month: ${new Date(dateRange.startDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'long'})}` :
                         `Date Range: ${new Date(dateRange.startDate).toLocaleDateString('en-IN')} - ${new Date(dateRange.endDate).toLocaleDateString('en-IN')}`;

    if (format === 'csv') {
      const csvContent = [
        'COLLECTION SUMMARY REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        'SUMMARY STATISTICS',
        `Total Collections,₹${totalCollections.toLocaleString()}`,
        `Pending Fees,₹${pendingFees.toLocaleString()}`,
        `Total Students,${totalStudents}`,
        `Fully Paid Students,${paidStudents}`,
        `Partially Paid Students,${partialStudents}`,
        `Overdue Students,${overdueStudents}`,
        '',
        'PAYMENT METHOD BREAKDOWN',
        'Payment Method,Count,Total Amount',
        ...paymentMethodBreakdown.map(([method, data]) => [
          method.toUpperCase(),
          data.count.toString(),
          `₹${data.amount.toLocaleString()}`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection_summary_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'COLLECTION SUMMARY REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        'SUMMARY STATISTICS',
        '',
        'Metric\tValue',
        `Total Collections\t₹${totalCollections.toLocaleString()}`,
        `Pending Fees\t₹${pendingFees.toLocaleString()}`,
        `Total Students\t${totalStudents}`,
        `Fully Paid Students\t${paidStudents}`,
        `Partially Paid Students\t${partialStudents}`,
        `Overdue Students\t${overdueStudents}`,
        '',
        'PAYMENT METHOD BREAKDOWN',
        '',
        'Payment Method\tCount\tTotal Amount',
        ...paymentMethodBreakdown.map(([method, data]) => [
          method.toUpperCase(),
          data.count.toString(),
          `₹${data.amount.toLocaleString()}`
        ].join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection_summary_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('COLLECTION SUMMARY REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      doc.text(`Period: ${dateRangeText}`, 105, 40, { align: 'center' });
      
      let y = 60;
      doc.setFontSize(14);
      doc.text('SUMMARY STATISTICS', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Collections: ₹${totalCollections.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Pending Fees: ₹${pendingFees.toLocaleString()}`, 20, y);
      y += 7;
      doc.text(`Total Students: ${totalStudents}`, 20, y);
      y += 7;
      doc.text(`Fully Paid Students: ${paidStudents}`, 20, y);
      y += 7;
      doc.text(`Partially Paid Students: ${partialStudents}`, 20, y);
      y += 7;
      doc.text(`Overdue Students: ${overdueStudents}`, 20, y);
      y += 15;
      
      doc.setFontSize(14);
      doc.text('PAYMENT METHOD BREAKDOWN', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      paymentMethodBreakdown.forEach(([method, data]) => {
        doc.text(`${method.toUpperCase()}: ${data.count} payments, ₹${data.amount.toLocaleString()}`, 20, y);
        y += 7;
      });
      
      doc.save(`collection_summary_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Collection summary exported successfully in ${format.toUpperCase()} format!`);
  };

  // Export Student List Report
  const exportStudentListWithData = (format: 'csv' | 'excel' | 'pdf', filteredStudents: StudentFeeStatus[]) => {
    const headers = ['Student Name', 'Roll Number', 'Course', 'Year', 'Department', 'Total Fees', 'Paid Amount', 'Due Amount', 'Status', 'Last Payment Date'];
    const data = filteredStudents.map(student => [
      student.studentName,
      student.rollNumber,
      student.course,
      student.year,
      student.department || 'N/A',
      `₹${student.totalFees.toLocaleString()}`,
      `₹${student.paidAmount.toLocaleString()}`,
      `₹${student.dueAmount.toLocaleString()}`,
      student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1),
      student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
    ]);

    const dateRangeText = dateRange.reportType === 'all' ? 'All Time' : 
                         dateRange.reportType === 'month' ? `Month: ${new Date(dateRange.startDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'long'})}` :
                         `Date Range: ${new Date(dateRange.startDate).toLocaleDateString('en-IN')} - ${new Date(dateRange.endDate).toLocaleDateString('en-IN')}`;

    if (format === 'csv') {
      const csvContent = [
        'STUDENT LIST REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_list_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'STUDENT LIST REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student_list_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('STUDENT LIST REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      doc.text(`Period: ${dateRangeText}`, 105, 40, { align: 'center' });
      
      const startY = 55;
      const colWidths = [35, 25, 20, 15, 25, 25, 25, 25, 20, 30];
      const headers = ['Student Name', 'Roll No', 'Course', 'Year', 'Department', 'Total', 'Paid', 'Due', 'Status', 'Last Payment'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      filteredStudents.forEach((student, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          student.studentName,
          student.rollNumber,
          student.course,
          student.year,
          student.department || 'N/A',
          `₹${student.totalFees.toLocaleString()}`,
          `₹${student.paidAmount.toLocaleString()}`,
          `₹${student.dueAmount.toLocaleString()}`,
          student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1),
          student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`student_list_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Student list exported successfully in ${format.toUpperCase()} format!`);
  };

  // Export Fee Structure Report
  const exportFeeStructureWithData = (format: 'csv' | 'excel' | 'pdf', feeStructures: FeeStructure[]) => {
    const headers = ['Course', 'Year', 'Department', 'Total Amount', 'Tuition', 'Library', 'Laboratory', 'Examination', 'Other', 'Due Date'];
    const data = feeStructures.map(structure => [
      structure.course,
      structure.year,
      structure.department,
      `₹${structure.totalAmount.toLocaleString()}`,
      `₹${structure.breakdown.tuition.toLocaleString()}`,
      `₹${structure.breakdown.library.toLocaleString()}`,
      `₹${structure.breakdown.laboratory.toLocaleString()}`,
      `₹${structure.breakdown.examination.toLocaleString()}`,
      `₹${structure.breakdown.other.toLocaleString()}`,
      structure.dueDate ? new Date(structure.dueDate).toLocaleDateString('en-IN') : 'N/A'
    ]);

    if (format === 'csv') {
      const csvContent = [
        'FEE STRUCTURE REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fee_structure_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'FEE STRUCTURE REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fee_structure_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('FEE STRUCTURE REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      
      const startY = 45;
      const colWidths = [25, 20, 30, 25, 20, 20, 25, 25, 15, 25];
      const headers = ['Course', 'Year', 'Department', 'Total', 'Tuition', 'Library', 'Lab', 'Exam', 'Other', 'Due Date'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      feeStructures.forEach((structure, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          structure.course,
          structure.year,
          structure.department,
          `₹${structure.totalAmount.toLocaleString()}`,
          `₹${structure.breakdown.tuition.toLocaleString()}`,
          `₹${structure.breakdown.library.toLocaleString()}`,
          `₹${structure.breakdown.laboratory.toLocaleString()}`,
          `₹${structure.breakdown.examination.toLocaleString()}`,
          `₹${structure.breakdown.other.toLocaleString()}`,
          structure.dueDate ? new Date(structure.dueDate).toLocaleDateString('en-IN') : 'N/A'
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`fee_structure_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Fee structure report exported successfully in ${format.toUpperCase()} format!`);
  };

  // Export Payment History Report
  const exportPaymentHistoryWithData = (format: 'csv' | 'excel' | 'pdf', filteredPayments: PaymentRecord[]) => {
    const headers = ['Date', 'Student Name', 'Roll Number', 'Amount', 'Payment Method', 'Receipt Number', 'Status', 'Notes'];
    const data = filteredPayments.map(payment => [
      new Date(payment.paymentDate).toLocaleDateString('en-IN'),
      payment.studentName,
      payment.rollNumber,
      `₹${payment.amount.toLocaleString()}`,
      payment.paymentMethod.toUpperCase(),
      payment.receiptNumber,
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      payment.notes || 'N/A'
    ]);

    const dateRangeText = dateRange.reportType === 'all' ? 'All Time' : 
                         dateRange.reportType === 'month' ? `Month: ${new Date(dateRange.startDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'long'})}` :
                         `Date Range: ${new Date(dateRange.startDate).toLocaleDateString('en-IN')} - ${new Date(dateRange.endDate).toLocaleDateString('en-IN')}`;

    if (format === 'csv') {
      const csvContent = [
        'PAYMENT HISTORY REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'PAYMENT HISTORY REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Period: ${dateRangeText}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_history_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('PAYMENT HISTORY REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      doc.text(`Period: ${dateRangeText}`, 105, 40, { align: 'center' });
      
      const startY = 55;
      const colWidths = [25, 35, 25, 25, 25, 35, 20, 30];
      const headers = ['Date', 'Student Name', 'Roll No', 'Amount', 'Method', 'Receipt', 'Status', 'Notes'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      filteredPayments.forEach((payment, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          new Date(payment.paymentDate).toLocaleDateString('en-IN'),
          payment.studentName,
          payment.rollNumber,
          `₹${payment.amount.toLocaleString()}`,
          payment.paymentMethod.toUpperCase(),
          payment.receiptNumber,
          payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
          payment.notes || 'N/A'
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`payment_history_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Payment history exported successfully in ${format.toUpperCase()} format!`);
  };

  // Export Overdue Report
  const exportOverdueReportWithData = (format: 'csv' | 'excel' | 'pdf', overdueStudents: StudentFeeStatus[]) => {
    const headers = ['Student Name', 'Roll Number', 'Course', 'Year', 'Department', 'Total Fees', 'Paid Amount', 'Due Amount', 'Days Overdue', 'Last Payment Date'];
    const data = overdueStudents.map(student => {
      const lastPaymentDate = student.lastPaymentDate ? new Date(student.lastPaymentDate) : null;
      const daysOverdue = lastPaymentDate ? Math.floor((new Date().getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      return [
        student.studentName,
        student.rollNumber,
        student.course,
        student.year,
        student.department || 'N/A',
        `₹${student.totalFees.toLocaleString()}`,
        `₹${student.paidAmount.toLocaleString()}`,
        `₹${student.dueAmount.toLocaleString()}`,
        daysOverdue.toString(),
        student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
      ];
    });

    if (format === 'csv') {
      const csvContent = [
        'OVERDUE FEES REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overdue_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'OVERDUE FEES REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overdue_report_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('OVERDUE FEES REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      
      const startY = 45;
      const colWidths = [35, 25, 20, 15, 25, 25, 25, 25, 20, 30];
      const headers = ['Student Name', 'Roll No', 'Course', 'Year', 'Department', 'Total', 'Paid', 'Due', 'Days Overdue', 'Last Payment'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      overdueStudents.forEach((student, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const lastPaymentDate = student.lastPaymentDate ? new Date(student.lastPaymentDate) : null;
        const daysOverdue = lastPaymentDate ? Math.floor((new Date().getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        const rowData = [
          student.studentName,
          student.rollNumber,
          student.course,
          student.year,
          student.department || 'N/A',
          `₹${student.totalFees.toLocaleString()}`,
          `₹${student.paidAmount.toLocaleString()}`,
          `₹${student.dueAmount.toLocaleString()}`,
          daysOverdue.toString(),
          student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`overdue_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Overdue report exported successfully in ${format.toUpperCase()} format!`);
  };

  // Export Department-wise Report
  const exportDepartmentWiseWithData = (format: 'csv' | 'excel' | 'pdf', studentFeeStatuses: StudentFeeStatus[], paymentRecords: PaymentRecord[]) => {
    // Group students by department
    const departmentStats = studentFeeStatuses.reduce((acc, student) => {
      const dept = student.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = {
          totalStudents: 0,
          totalFees: 0,
          totalPaid: 0,
          totalDue: 0,
          paidStudents: 0,
          partialStudents: 0,
          overdueStudents: 0
        };
      }
      
      acc[dept].totalStudents++;
      acc[dept].totalFees += student.totalFees;
      acc[dept].totalPaid += student.paidAmount;
      acc[dept].totalDue += student.dueAmount;
      
      if (student.feeStatus === 'paid') acc[dept].paidStudents++;
      else if (student.feeStatus === 'partial') acc[dept].partialStudents++;
      else if (student.feeStatus === 'overdue') acc[dept].overdueStudents++;
      
      return acc;
    }, {} as Record<string, any>);

    const headers = ['Department', 'Total Students', 'Total Fees', 'Total Paid', 'Total Due', 'Paid Students', 'Partial Students', 'Overdue Students', 'Collection Rate'];
    const data = Object.entries(departmentStats).map(([dept, stats]) => [
      dept,
      stats.totalStudents.toString(),
      `₹${stats.totalFees.toLocaleString()}`,
      `₹${stats.totalPaid.toLocaleString()}`,
      `₹${stats.totalDue.toLocaleString()}`,
      stats.paidStudents.toString(),
      stats.partialStudents.toString(),
      stats.overdueStudents.toString(),
      `${((stats.totalPaid / stats.totalFees) * 100).toFixed(1)}%`
    ]);

    if (format === 'csv') {
      const csvContent = [
        'DEPARTMENT-WISE REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department_wise_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excelContent = [
        'DEPARTMENT-WISE REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department_wise_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('DEPARTMENT-WISE REPORT', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      
      const startY = 45;
      const colWidths = [30, 25, 25, 25, 25, 25, 25, 25, 25];
      const headers = ['Department', 'Students', 'Total Fees', 'Paid', 'Due', 'Paid', 'Partial', 'Overdue', 'Rate'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      y += 10;
      Object.entries(departmentStats).forEach(([dept, stats], index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          dept,
          stats.totalStudents.toString(),
          `₹${stats.totalFees.toLocaleString()}`,
          `₹${stats.totalPaid.toLocaleString()}`,
          `₹${stats.totalDue.toLocaleString()}`,
          stats.paidStudents.toString(),
          stats.partialStudents.toString(),
          stats.overdueStudents.toString(),
          `${((stats.totalPaid / stats.totalFees) * 100).toFixed(1)}%`
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`department_wise_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Department-wise report exported successfully in ${format.toUpperCase()} format!`);
  };

  // Export functions with format selection
  const exportPaymentReport = (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    const headers = ['Student Name', 'Roll Number', 'Payment Amount', 'Payment Method', 'Receipt Number', 'Payment Date', 'Status'];
    const data = paymentRecords.map(payment => [
      payment.studentName,
      payment.rollNumber,
      `₹${payment.amount.toLocaleString()}`,
      payment.paymentMethod.toUpperCase(),
      payment.receiptNumber,
      new Date(payment.paymentDate).toLocaleDateString('en-IN'),
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
    ]);

    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Excel-like format with better structure
      const excelContent = [
        'PAYMENT REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_report_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // PDF export
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('PAYMENT REPORT', 105, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      
      // Table headers
      doc.setFontSize(10);
      const startY = 45;
      const colWidths = [40, 25, 30, 25, 35, 25, 20];
      const headers = ['Student Name', 'Roll No', 'Amount', 'Method', 'Receipt', 'Date', 'Status'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      // Table data
      y += 10;
      paymentRecords.forEach((payment, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          payment.studentName,
          payment.rollNumber,
          `₹${payment.amount.toLocaleString()}`,
          payment.paymentMethod.toUpperCase(),
          payment.receiptNumber,
          new Date(payment.paymentDate).toLocaleDateString('en-IN'),
          payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 15 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`payment_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Payment report exported successfully in ${format.toUpperCase()} format!`);
  };

  const exportFeeStatusReport = (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    const headers = ['Student Name', 'Roll Number', 'Course', 'Department', 'Year', 'Total Fees', 'Paid Amount', 'Due Amount', 'Fee Status', 'Last Payment Date'];
    const data = studentFeeStatuses.map(student => [
      student.studentName,
      student.rollNumber,
      student.course,
      student.department || 'N/A',
      student.year,
      `₹${student.totalFees.toLocaleString()}`,
      `₹${student.paidAmount.toLocaleString()}`,
      `₹${student.dueAmount.toLocaleString()}`,
      student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1),
      student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
    ]);

    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fee_status_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Excel-like format with better structure
      const excelContent = [
        'FEE STATUS REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        headers.join('\t'),
        ...data.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fee_status_report_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // PDF export
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('FEE STATUS REPORT', 105, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      
      // Table headers
      doc.setFontSize(8);
      const startY = 45;
      const colWidths = [35, 20, 20, 25, 15, 25, 25, 25, 20, 25];
      const headers = ['Student Name', 'Roll No', 'Course', 'Department', 'Year', 'Total', 'Paid', 'Due', 'Status', 'Last Payment'];
      
      let y = startY;
      headers.forEach((header, i) => {
        doc.text(header, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      
      // Table data
      y += 10;
      studentFeeStatuses.forEach((student, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const rowData = [
          student.studentName,
          student.rollNumber,
          student.course,
          student.department || 'N/A',
          student.year,
          `₹${student.totalFees.toLocaleString()}`,
          `₹${student.paidAmount.toLocaleString()}`,
          `₹${student.dueAmount.toLocaleString()}`,
          student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1),
          student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A'
        ];
        
        rowData.forEach((cell, i) => {
          doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        
        y += 7;
      });
      
      doc.save(`fee_status_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Fee status report exported successfully in ${format.toUpperCase()} format!`);
  };

  const exportCollectionSummary = (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    const totalCollections = paymentRecords.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingFees = studentFeeStatuses.reduce((sum, student) => sum + student.dueAmount, 0);
    const totalStudents = studentFeeStatuses.length;
    const paidStudents = studentFeeStatuses.filter(s => s.feeStatus === 'paid').length;
    const partialStudents = studentFeeStatuses.filter(s => s.feeStatus === 'partial').length;
    const overdueStudents = studentFeeStatuses.filter(s => s.feeStatus === 'overdue').length;

    const paymentMethodBreakdown = Object.entries(
      paymentRecords.reduce((acc, payment) => {
        acc[payment.paymentMethod] = acc[payment.paymentMethod] || { count: 0, amount: 0 };
        acc[payment.paymentMethod].count++;
        acc[payment.paymentMethod].amount += payment.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    );

    if (format === 'csv') {
      const csvContent = [
        'COLLECTION SUMMARY REPORT',
        `Generated Date,${new Date().toLocaleDateString('en-IN')}`,
        '',
        'SUMMARY STATISTICS',
        `Total Collections,₹${totalCollections.toLocaleString()}`,
        `Pending Fees,₹${pendingFees.toLocaleString()}`,
        `Total Students,${totalStudents}`,
        `Fully Paid Students,${paidStudents}`,
        `Partially Paid Students,${partialStudents}`,
        `Overdue Students,${overdueStudents}`,
        '',
        'PAYMENT METHOD BREAKDOWN',
        'Payment Method,Count,Total Amount',
        ...paymentMethodBreakdown.map(([method, data]) => [
          method.toUpperCase(),
          data.count.toString(),
          `₹${data.amount.toLocaleString()}`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection_summary_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Excel-like format with better structure
      const excelContent = [
        'COLLECTION SUMMARY REPORT',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        '',
        'SUMMARY STATISTICS',
        '',
        'Metric\tValue',
        `Total Collections\t₹${totalCollections.toLocaleString()}`,
        `Pending Fees\t₹${pendingFees.toLocaleString()}`,
        `Total Students\t${totalStudents}`,
        `Fully Paid Students\t${paidStudents}`,
        `Partially Paid Students\t${partialStudents}`,
        `Overdue Students\t${overdueStudents}`,
        '',
        'PAYMENT METHOD BREAKDOWN',
        '',
        'Payment Method\tCount\tTotal Amount',
        ...paymentMethodBreakdown.map(([method, data]) => [
          method.toUpperCase(),
          data.count.toString(),
          `₹${data.amount.toLocaleString()}`
        ].join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'text/tab-separated-values' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection_summary_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // PDF export
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('COLLECTION SUMMARY REPORT', 105, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 30, { align: 'center' });
      
      // Summary Statistics
      doc.setFontSize(14);
      doc.text('SUMMARY STATISTICS', 20, 50);
      
      doc.setFontSize(12);
      let y = 65;
      doc.text(`Total Collections: ₹${totalCollections.toLocaleString()}`, 20, y);
      y += 10;
      doc.text(`Pending Fees: ₹${pendingFees.toLocaleString()}`, 20, y);
      y += 10;
      doc.text(`Total Students: ${totalStudents}`, 20, y);
      y += 10;
      doc.text(`Fully Paid Students: ${paidStudents}`, 20, y);
      y += 10;
      doc.text(`Partially Paid Students: ${partialStudents}`, 20, y);
      y += 10;
      doc.text(`Overdue Students: ${overdueStudents}`, 20, y);
      
      // Payment Method Breakdown
      y += 20;
      doc.setFontSize(14);
      doc.text('PAYMENT METHOD BREAKDOWN', 20, y);
      
      y += 15;
      doc.setFontSize(12);
      doc.text('Method', 20, y);
      doc.text('Count', 80, y);
      doc.text('Amount', 120, y);
      
      y += 10;
      paymentMethodBreakdown.forEach(([method, data]) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(method.toUpperCase(), 20, y);
        doc.text(data.count.toString(), 80, y);
        doc.text(`₹${data.amount.toLocaleString()}`, 120, y);
        y += 10;
      });
      
      doc.save(`collection_summary_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    toast.success(`Collection summary exported successfully in ${format.toUpperCase()} format!`);
  };

  // Format selection modal state
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<'payment' | 'feeStatus' | 'collection' | null>(null);

  // Download receipt function
  const downloadReceipt = (payment: PaymentRecord) => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
    
    // Set font sizes
    const titleFontSize = 16;
    const headerFontSize = 12;
    const normalFontSize = 10;
    const smallFontSize = 8;
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let y = 20; // Starting Y position
    
    // Header Section
    doc.setFontSize(headerFontSize);
    doc.setFont('helvetica', 'normal');
    doc.text('Chhatrapati Shahu Maharaj Shikshan Sanstha\'s', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.text('Chh. Shahu College of Engineering', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(normalFontSize);
    doc.text('Kanchanwadi, Paithan Road, Chhatrapati Sambhajinagar - 431 011 (M.S.)', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    // "Original" label (top right)
    doc.setFontSize(smallFontSize);
    doc.text('Original', pageWidth - margin - 15, 25);
    
    // Receipt Title
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('FEES RECEIPT', pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Receipt Details
    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt No : ${payment.receiptNumber}`, margin, y);
    doc.text(`Receipt Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}`, pageWidth - margin - 60, y);
    y += 10;
    
    // Horizontal line
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Student Details Section
    const student = studentFeeStatuses.find(s => s.studentId === payment.studentId);
    if (student) {
      doc.text(`Student Name: ${student.studentName.toUpperCase()}`, margin, y);
      y += 6;
      doc.text(`Student Code: ${student.rollNumber}`, margin, y);
      y += 6;
      doc.text(`Batch: 2024-25`, margin, y);
      y += 6;
      doc.text(`Class: ${student.year.toUpperCase()} ${student.course}`, margin, y);
      y += 6;
      doc.text(`Academic Year: 2024-25`, margin, y);
      y += 10;
      
      // Horizontal line
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // Particulars and Amount Section
      doc.setFont('helvetica', 'bold');
      doc.text('Particulars', margin, y);
      doc.text('Amount', pageWidth - margin - 30, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.text('1) FEES RECEIVABLE ON A/C', margin, y);
      doc.text(`₹${payment.amount.toLocaleString()}`, pageWidth - margin - 30, y, { align: 'right' });
      y += 10;
      
      // Horizontal line
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // Amount in Words
      const amountInWords = numberToWords(payment.amount);
      doc.text(`Amount In Words: Rupees ${amountInWords} Only`, margin, y);
      doc.text(`₹${payment.amount.toLocaleString()}`, pageWidth - margin - 30, y, { align: 'right' });
      y += 10;
      
      // Horizontal line
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // Payment Details Section
      doc.text(`Payment Mode: ${payment.paymentMethod.toUpperCase()}`, margin, y);
      y += 6;
      doc.text(`Drawee Bank: ${payment.paymentMethod.toUpperCase()}`, margin, y);
      y += 6;
      doc.text(`CH/DD No: ${payment.receiptNumber}`, margin, y);
      y += 6;
      doc.text(`CH/DD Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}`, margin, y);
      y += 6;
      doc.text('Remarks: Payment Received', margin, y);
      y += 15;
      
      // Horizontal line
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;
      
      // Signatures Section
      const signatureY = pageHeight - 40;
      doc.text('Accountant', margin, signatureY);
      doc.text('Cashier', pageWidth - margin - 30, signatureY);
      
      // Add signature line
      doc.line(margin, signatureY + 5, margin + 50, signatureY + 5);
      doc.line(pageWidth - margin - 50, signatureY + 5, pageWidth - margin, signatureY + 5);
    }
    
    // Save the PDF
    doc.save(`receipt_${payment.receiptNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Receipt downloaded successfully!');
  };

  // Helper function to convert number to words
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      if (num % 10 === 0) return tens[Math.floor(num / 10)];
      return tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
    }
    if (num < 1000) {
      if (num % 100 === 0) return ones[Math.floor(num / 100)] + ' Hundred';
      return ones[Math.floor(num / 100)] + ' Hundred and ' + numberToWords(num % 100);
    }
    if (num < 100000) {
      if (num % 1000 === 0) return numberToWords(Math.floor(num / 1000)) + ' Thousand';
      return numberToWords(Math.floor(num / 1000)) + ' Thousand ' + numberToWords(num % 1000);
    }
    if (num < 10000000) {
      if (num % 100000 === 0) return numberToWords(Math.floor(num / 100000)) + ' Lakh';
      return numberToWords(Math.floor(num / 100000)) + ' Lakh ' + numberToWords(num % 100000);
    }
    return 'Amount too large';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Manage student fees, payments, and collections</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsAddPaymentModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </button>
          <button
            onClick={() => setIsAddFeeStructureModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Fee Structure
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'structure', label: 'Fee Structure', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'students', label: 'Student Status', icon: Users },
              { id: 'reports', label: 'Reports', icon: Receipt }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h3>
                  <div className="space-y-3">
                    {paymentRecords.length > 0 ? (
                      paymentRecords.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                          <div>
                            <p className="font-medium text-gray-900">{payment.studentName}</p>
                            <p className="text-sm text-gray-600">{payment.rollNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">₹{payment.amount}</p>
                            <p className="text-sm text-gray-500">{getPaymentMethodIcon(payment.paymentMethod)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No payment records yet</p>
                        <p className="text-sm text-gray-500 mt-1">Record your first payment to see it here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fee Status Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Status Distribution</h3>
                  <div className="space-y-3">
                    {studentFeeStatuses.length > 0 ? (
                      [
                        { status: 'paid', count: studentFeeStatuses.filter(s => s.feeStatus === 'paid').length, color: 'bg-green-500' },
                        { status: 'partial', count: studentFeeStatuses.filter(s => s.feeStatus === 'partial').length, color: 'bg-yellow-500' },
                        { status: 'overdue', count: studentFeeStatuses.filter(s => s.feeStatus === 'overdue').length, color: 'bg-red-500' },
                        { status: 'pending', count: studentFeeStatuses.filter(s => s.feeStatus === 'pending').length, color: 'bg-gray-500' }
                      ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <span className="capitalize text-gray-700">{item.status}</span>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                            <span className="font-medium">{item.count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No student data available</p>
                        <p className="text-sm text-gray-500 mt-1">Add students in Student Management to see fee status</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fee Structure Tab */}
          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Fee Structures</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search structures..."
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course & Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Breakdown</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeStructures
                      .filter(structure => 
                        structure.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        structure.year.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((structure) => (
                        <tr key={structure.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{structure.course}</div>
                              <div className="text-sm text-gray-500">{structure.year}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{structure.totalAmount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div>Tuition: ₹{structure.breakdown.tuition}</div>
                              <div>Library: ₹{structure.breakdown.library}</div>
                              <div>Lab: ₹{structure.breakdown.laboratory}</div>
                              <div>Exam: ₹{structure.breakdown.examination}</div>
                              <div>Other: ₹{structure.breakdown.other}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(structure.dueDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Payment Records</h3>
                <div className="flex space-x-2">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">All Courses</option>
                    <option value="B-Tech">B-Tech</option>
                    <option value="M-Tech">M-Tech</option>
                    <option value="MBA">MBA</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search payments..."
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentRecords
                      .filter(payment => 
                        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-sm text-gray-500">{payment.rollNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">₹{payment.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                              <span className="text-sm text-gray-900 capitalize">{payment.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.receiptNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsViewPaymentModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Payment Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => downloadReceipt(payment)}
                                className="text-green-600 hover:text-green-900"
                                title="Download Receipt"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Student Status Tab */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Student Fee Status</h3>
                <div className="flex space-x-2">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course & Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentFeeStatuses
                      .filter(student => 
                        (selectedYear === 'all' || student.year === selectedYear) &&
                        (student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((student) => (
                        <tr key={student.studentId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                              <div className="text-sm text-gray-500">{student.rollNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{student.course}</div>
                              <div className="text-sm text-gray-500">{student.year}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">₹{student.totalFees.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">₹{student.paidAmount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-red-600">₹{student.dueAmount.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.feeStatus)}`}>
                              {student.feeStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => {
                                setPaymentForm({
                                  studentId: student.studentId,
                                  studentName: student.studentName,
                                  rollNumber: student.rollNumber,
                                  amount: '',
                                  paymentMethod: 'cash',
                                  receiptNumber: '',
                                  notes: ''
                                });
                                setIsAddPaymentModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Record Payment"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collection Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Collection Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Collections</span>
                      <span className="font-medium">₹{totalCollections.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-medium">₹{thisMonthCollections.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Amount</span>
                      <span className="font-medium text-red-600">₹{pendingFees.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    {hasPaymentRecords && Object.entries(paymentMethodStats).length > 0 ? (
                      Object.entries(paymentMethodStats).map(([method, amount]) => (
                        <div key={method} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="mr-2">{getPaymentMethodIcon(method)}</span>
                            <span className="text-gray-700">{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                          </div>
                          <span className="font-medium">₹{amount.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm">
                        {hasPaymentRecords ? 'No payment records found' : 'No payments recorded yet'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
                <div className="space-y-4">
                  {/* Report Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Report Type</label>
                    <select
                      value={selectedReportType || ''}
                      onChange={(e) => setSelectedReportType(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a report type...</option>
                      <option value="payment">Payment Report</option>
                      <option value="feeStatus">Fee Status Report</option>
                      <option value="collection">Collection Summary</option>
                      <option value="studentList">Student List</option>
                      <option value="feeStructure">Fee Structure Report</option>
                      <option value="paymentHistory">Payment History</option>
                      <option value="overdueReport">Overdue Fees Report</option>
                      <option value="departmentWise">Department-wise Report</option>
                    </select>
                  </div>

                  {/* Download Button */}
                  <button 
                    onClick={() => {
                      if (!selectedReportType) {
                        toast.error('Please select a report type');
                        return;
                      }
                      setSelectedExportType(selectedReportType as any);
                      setShowFormatModal(true);
                    }}
                    disabled={!selectedReportType}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download {selectedReportType ? selectedReportType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : 'Report'} (CSV/Excel/PDF)
                  </button>

                  {/* Report Descriptions */}
                  {selectedReportType && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Report Description:</h4>
                      <p className="text-sm text-gray-600">
                        {selectedReportType === 'payment' && 'Detailed payment records with student information, payment method, and transaction details.'}
                        {selectedReportType === 'feeStatus' && 'Complete fee status of all students including paid, due, and pending amounts.'}
                        {selectedReportType === 'collection' && 'Summary of total collections, payment method breakdown, and collection statistics.'}
                        {selectedReportType === 'studentList' && 'Complete list of all students with their basic information and academic details.'}
                        {selectedReportType === 'feeStructure' && 'Fee structure details for different courses, years, and departments.'}
                        {selectedReportType === 'paymentHistory' && 'Chronological payment history with detailed transaction information.'}
                        {selectedReportType === 'overdueReport' && 'List of students with overdue fees and payment reminders.'}
                        {selectedReportType === 'departmentWise' && 'Department-wise fee collection and student distribution statistics.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Fee Structure Modal */}
      {isAddFeeStructureModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Fee Structure</h2>
            <form onSubmit={handleFeeStructureSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select
                    value={feeStructureForm.course}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, course: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Course</option>
                    {courseOptions.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    value={feeStructureForm.year}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, year: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={feeStructureForm.department || ''}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, department: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map(department => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    value={feeStructureForm.totalAmount}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, totalAmount: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={feeStructureForm.dueDate}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, dueDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                  <input
                    type="text"
                    value={feeStructureForm.academicYear}
                    onChange={(e) => setFeeStructureForm({...feeStructureForm, academicYear: e.target.value})}
                    placeholder="e.g., 2024-25"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Breakdown</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Tuition Fee</label>
                    <input
                      type="number"
                      value={feeStructureForm.tuition}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, tuition: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Library Fee</label>
                    <input
                      type="number"
                      value={feeStructureForm.library}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, library: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Laboratory Fee</label>
                    <input
                      type="number"
                      value={feeStructureForm.laboratory}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, laboratory: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Examination Fee</label>
                    <input
                      type="number"
                      value={feeStructureForm.examination}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, examination: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Other Fees</label>
                    <input
                      type="number"
                      value={feeStructureForm.other}
                      onChange={(e) => setFeeStructureForm({...feeStructureForm, other: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddFeeStructureModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {isAddPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                <select
                  value={paymentForm.studentId}
                  onChange={(e) => {
                    const selectedStudent = studentFeeStatuses.find(s => s.studentId === e.target.value);
                    if (selectedStudent) {
                      setPaymentForm({
                        ...paymentForm,
                        studentId: selectedStudent.studentId,
                        studentName: selectedStudent.studentName,
                        rollNumber: selectedStudent.rollNumber
                      });
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a student...</option>
                  {studentFeeStatuses.length > 0 ? (
                    studentFeeStatuses.map((student) => (
                      <option key={student.studentId} value={student.studentId}>
                        {student.studentName} - {student.rollNumber} ({student.course})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No students available</option>
                  )}
                </select>
                {studentFeeStatuses.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    No students found. Please add students first in the Student Management section.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Name</label>
                <input
                  type="text"
                  value={paymentForm.studentName}
                  onChange={(e) => setPaymentForm({...paymentForm, studentName: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  readOnly={!!paymentForm.studentId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                <input
                  type="text"
                  value={paymentForm.rollNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, rollNumber: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  readOnly={!!paymentForm.studentId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value as any})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                <input
                  type="text"
                  value={paymentForm.receiptNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, receiptNumber: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Optional notes about the payment"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPaymentModalOpen(false);
                    setPaymentForm({
                      studentId: '', studentName: '', rollNumber: '', amount: '',
                      paymentMethod: 'cash', receiptNumber: '', notes: ''
                    });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !paymentForm.studentId || !paymentForm.amount}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      {isViewPaymentModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Payment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student</label>
                <p className="text-sm text-gray-900">{selectedPayment.studentName}</p>
                <p className="text-sm text-gray-600">{selectedPayment.rollNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="text-lg font-bold text-green-600">₹{selectedPayment.amount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <p className="text-sm text-gray-900 capitalize">{selectedPayment.paymentMethod}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                <p className="text-sm text-gray-900">{selectedPayment.receiptNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                <p className="text-sm text-gray-900">{new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
              </div>
              {selectedPayment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewPaymentModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Export Modal with Date Range */}
      {showFormatModal && selectedExportType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Export Report</h2>
            
            {/* Date Range Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Date Range</h3>
              
              {/* Report Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Period</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="dateRange"
                      checked={dateRange.reportType === 'dateRange'}
                      onChange={(e) => setDateRange({...dateRange, reportType: e.target.value as 'dateRange' | 'month' | 'all'})}
                      className="mr-2"
                    />
                    <span className="text-sm">Custom Date Range</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="month"
                      checked={dateRange.reportType === 'month'}
                      onChange={(e) => setDateRange({...dateRange, reportType: e.target.value as 'dateRange' | 'month' | 'all'})}
                      className="mr-2"
                    />
                    <span className="text-sm">Current Month</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="all"
                      checked={dateRange.reportType === 'all'}
                      onChange={(e) => setDateRange({...dateRange, reportType: e.target.value as 'dateRange' | 'month' | 'all'})}
                      className="mr-2"
                    />
                    <span className="text-sm">All Time</span>
                  </label>
                </div>
              </div>

              {/* Date Range Inputs */}
              {dateRange.reportType === 'dateRange' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Month Selection */}
              {dateRange.reportType === 'month' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                  <input
                    type="month"
                    value={dateRange.startDate}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      const startDate = `${year}-${month}-01`;
                      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
                      setDateRange({
                        ...dateRange,
                        startDate,
                        endDate
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Format</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleExportWithDateRange('csv')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExportWithDateRange('excel')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExportWithDateRange('pdf')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
                >
                  PDF
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFormatModal(false);
                  setSelectedExportType(null);
                  setDateRange({startDate: '', endDate: '', reportType: 'dateRange'});
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement; 