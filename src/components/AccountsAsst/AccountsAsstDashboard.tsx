import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';
import { 
  DollarSign, CreditCard, TrendingUp, TrendingDown, FileText, Download, 
  Users, Calendar, BarChart3, PieChart, DownloadCloud, Eye, Plus,
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FinancialSummary {
  totalFees: number;
  totalPayroll: number;
  totalExpenses: number;
  netRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  totalStudents: number;
  totalStaff: number;
}

interface RecentActivity {
  id: string;
  type: 'fee_payment' | 'payroll' | 'expense' | 'vendor_payment';
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'overdue';
}

const AccountsAsstDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalFees: 0,
    totalPayroll: 0,
    totalExpenses: 0,
    netRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalStudents: 0,
    totalStaff: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      
      // Fetch financial data from Firebase
      await fetchFinancialData();
      await fetchRecentActivity();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const db = getDatabase();
      
      // Fetch real fee data from the same sources as Admin FeeManagement
      const usersRef = ref(db, 'users');
      const feesRef = ref(db, 'fees');
      
      const [usersSnapshot, feesSnapshot] = await Promise.all([
        get(usersRef),
        get(feesRef)
      ]);
      
      let totalFees = 0;
      let totalPaid = 0;
      let totalDue = 0;
      let pendingPayments = 0;
      let overduePayments = 0;
      let totalStudents = 0;
      
      if (usersSnapshot.exists() && feesSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        const feesData = feesSnapshot.val();
        
        Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
          if (userData.role === 'student') {
            totalStudents++;
            const rollNumber = userData.rollNo || userData.rollNumber || 'N/A';
            
            // Get fee data for this student
            if (feesData[rollNumber]) {
              const studentFees = feesData[rollNumber];
              const studentTotalFees = Number(studentFees.total) || 25000; // Ensure it's a number
              const studentPaid = Number(studentFees.paid) || 0; // Ensure it's a number
              const studentDue = studentTotalFees - studentPaid;
              
              totalFees += studentTotalFees;
              totalPaid += studentPaid;
              totalDue += studentDue;
              
              if (studentDue > 0) {
                pendingPayments += studentDue;
                if (studentDue > 0 && studentPaid === 0) {
                  overduePayments += studentDue;
                }
              }
            } else {
              // If no fee record exists, assume default fee structure
              const defaultTotalFees = 25000; // Much lower default fee
              totalFees += defaultTotalFees;
              totalDue += defaultTotalFees;
              pendingPayments += defaultTotalFees;
              overduePayments += defaultTotalFees;
            }
          }
        });
      }

      // Use realistic financial metrics with much smaller numbers
      const mockData: FinancialSummary = {
        totalFees: totalFees,
        totalPayroll: Math.round(totalStudents * 15000), // Much lower payroll per student
        totalExpenses: Math.round(totalStudents * 5000), // Much lower expenses per student
        netRevenue: totalPaid - Math.round(totalStudents * 15000) - Math.round(totalStudents * 5000),
        pendingPayments: pendingPayments,
        overduePayments: overduePayments,
        totalStudents: totalStudents,
        totalStaff: Math.round(totalStudents / 30) // More realistic staff ratio
      };

      setFinancialSummary(mockData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const db = getDatabase();
      
      // Fetch real payment data from the same sources as Admin FeeManagement
      const usersRef = ref(db, 'users');
      const feesRef = ref(db, 'fees');
      
      const [usersSnapshot, feesSnapshot] = await Promise.all([
        get(usersRef),
        get(feesRef)
      ]);
      
      let recentPayments: RecentActivity[] = [];
      
      if (usersSnapshot.exists() && feesSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        const feesData = feesSnapshot.val();
        
        Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
          if (userData.role === 'student') {
            const rollNumber = userData.rollNo || userData.rollNumber || 'N/A';
            
            // Get payment history for this student
            if (feesData[rollNumber] && feesData[rollNumber].history) {
              Object.entries(feesData[rollNumber].history).forEach(([paymentId, paymentData]: [string, any]) => {
                const paymentDate = new Date(paymentData.date || Date.now());
                const daysAgo = Math.floor((Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // Only include payments from last 30 days
                if (daysAgo <= 30) {
                  recentPayments.push({
                    id: paymentId,
                    type: 'fee_payment',
                    title: `Fee Payment - ${userData.name || userData.studentName} (${userData.department || 'Unknown'})`,
                    amount: parseFloat(paymentData.amount) || 0,
                    date: paymentData.date || new Date().toISOString(),
                    status: 'completed'
                  });
                }
              });
            }
          }
        });
        
        // Sort by date (newest first) and take top 5
        recentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        recentPayments = recentPayments.slice(0, 5);
      }
      
      // Combine real payment data with mock data for other activities
      const mockActivity: RecentActivity[] = [
        ...recentPayments,
        {
          id: 'payroll-1',
          type: 'payroll',
          title: 'Staff Payroll - January 2024',
          amount: 1800000,
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        },
        {
          id: 'expense-1',
          type: 'expense',
          title: 'Equipment Purchase - Lab Supplies',
          amount: 45000,
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending'
        }
      ];
      
      // Sort by date and take top 5
      mockActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(mockActivity.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      toast.success(`${reportType} report download started`);
      
      // Generate actual report data
      const reportData = await generateDashboardReportData(reportType);
      
      // Create CSV content
      const csvContent = [
        reportData.title,
        `Generated on: ${reportData.date}`,
        '',
        reportData.headers.join(','),
        ...reportData.data.map((row: any[]) => row.join(',')),
        '',
        'Summary:',
        ...Object.entries(reportData.summary).map(([key, value]) => `${key},${value}`)
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${reportType} report downloaded successfully`);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const generateDashboardReportData = async (reportType: string) => {
    const currentDate = new Date();
    
    switch (reportType) {
      case 'Financial Summary':
        return {
          title: 'Financial Summary Report',
          date: currentDate.toLocaleDateString(),
          headers: ['Category', 'Amount', 'Status'],
          data: [
            ['Total Fees Collected', financialSummary.totalFees.toLocaleString(), 'Completed'],
            ['Total Payroll', financialSummary.totalPayroll.toLocaleString(), 'Completed'],
            ['Total Expenses', financialSummary.totalExpenses.toLocaleString(), 'Completed'],
            ['Net Revenue', financialSummary.netRevenue.toLocaleString(), 'Active'],
            ['Pending Payments', financialSummary.pendingPayments.toLocaleString(), 'Pending'],
            ['Overdue Payments', financialSummary.overduePayments.toLocaleString(), 'Overdue'],
          ],
          summary: {
            'Total Students': financialSummary.totalStudents,
            'Total Staff': financialSummary.totalStaff,
            'Payment Rate': `${((financialSummary.totalFees - financialSummary.pendingPayments - financialSummary.overduePayments) / financialSummary.totalFees * 100).toFixed(1)}%`,
            'Revenue Growth': '+12.5%'
          }
        };
        
      case 'Fee Collection Report':
        // Fetch real student fee data for the report
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        const feesRef = ref(db, 'fees');
        
        const [usersSnapshot, feesSnapshot] = await Promise.all([
          get(usersRef),
          get(feesRef)
        ]);
        
        let reportData: any[] = [];
        let totalStudents = 0;
        let totalFees = 0;
        let totalPaid = 0;
        let totalDue = 0;
        
        if (usersSnapshot.exists() && feesSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          const feesData = feesSnapshot.val();
          
          Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
            if (userData.role === 'student') {
              totalStudents++;
              const rollNumber = userData.rollNo || userData.rollNumber || 'N/A';
              
                             if (feesData[rollNumber]) {
                 const studentFees = feesData[rollNumber];
                 const studentTotalFees = studentFees.total || 75000; // Realistic fee amount
                 const studentPaid = studentFees.paid || 0;
                 const studentDue = studentTotalFees - studentPaid;
                
                totalFees += studentTotalFees;
                totalPaid += studentPaid;
                totalDue += studentDue;
                
                let status = 'Pending';
                if (studentDue <= 0) status = 'Paid';
                else if (studentPaid > 0) status = 'Partial';
                
                reportData.push([
                  rollNumber,
                  userData.name || userData.studentName || 'Unknown',
                  userData.department || 'Unknown',
                  studentTotalFees.toLocaleString(),
                  studentPaid.toLocaleString(),
                  studentDue.toLocaleString(),
                  status
                ]);
              }
            }
          });
        }
        
        return {
          title: 'Fee Collection Report',
          date: currentDate.toLocaleDateString(),
          headers: ['Student ID', 'Student Name', 'Department', 'Total Fees', 'Paid Amount', 'Due Amount', 'Status'],
          data: reportData.slice(0, 10), // Show first 10 students
          summary: {
            'Total Students': totalStudents,
            'Total Fees': totalFees.toLocaleString(),
            'Total Paid': totalPaid.toLocaleString(),
            'Total Due': totalDue.toLocaleString(),
            'Payment Rate': totalFees > 0 ? `${((totalPaid / totalFees) * 100).toFixed(1)}%` : '0%'
          }
        };
        
      case 'Payroll Report':
        return {
          title: 'Payroll Report',
          date: currentDate.toLocaleDateString(),
          headers: ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Basic Salary', 'Net Salary'],
          data: [
            ['EMP001', 'Dr. Sarah Johnson', 'CSE', 'HOD', '80000', '95000'],
            ['EMP002', 'Prof. Michael Chen', 'CSE', 'Associate Professor', '60000', '71000'],
            ['EMP003', 'Prof. Emily Davis', 'MECH', 'Assistant Professor', '50000', '59000'],
            ['EMP004', 'Prof. David Wilson', 'AI_DS', 'Associate Professor', '65000', '76500'],
            ['EMP005', 'Prof. Lisa Anderson', 'CSE', 'Assistant Professor', '48000', '56200'],
          ],
          summary: {
            'Total Employees': 5,
            'Total Basic Salary': '303000',
            'Total Net Salary': '357700',
            'Average Salary': '71540'
          }
        };
        
      case 'Expense Report':
        return {
          title: 'Expense Report',
          date: currentDate.toLocaleDateString(),
          headers: ['Expense Category', 'Description', 'Amount', 'Date', 'Status'],
          data: [
            ['Equipment', 'Lab Computers', '150000', '2024-01-15', 'Approved'],
            ['Supplies', 'Office Stationery', '25000', '2024-01-20', 'Approved'],
            ['Maintenance', 'Building Repairs', '75000', '2024-01-25', 'Approved'],
            ['Utilities', 'Electricity & Water', '50000', '2024-01-30', 'Approved'],
            ['Marketing', 'Admission Brochures', '30000', '2024-02-01', 'Approved'],
            ['Training', 'Staff Development', '70000', '2024-02-05', 'Approved'],
          ],
          summary: {
            'Total Expenses': '400000',
            'Categories': 6,
            'Average Expense': '66667',
            'Budget Utilization': '80%'
          }
        };
        
      default:
        return {
          title: reportType,
          date: currentDate.toLocaleDateString(),
          headers: ['Item', 'Value'],
          data: [['Sample Data', 'Sample Value']],
          summary: {}
        };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fee_payment': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'payroll': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'expense': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'vendor_payment': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Accounts Assistant Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your financial overview</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => downloadReport('Financial Summary')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Summary
              </button>
              <button
                onClick={() => window.location.href = '/accounts-asst/reports'}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees Collected</p>
                <p className="text-2xl font-bold text-gray-900">₹{financialSummary.totalFees.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{financialSummary.netRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8.3% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">₹{financialSummary.pendingPayments.toLocaleString()}</p>
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.ceil(financialSummary.pendingPayments / 1000)} pending
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Payments</p>
                <p className="text-2xl font-bold text-gray-900">₹{financialSummary.overduePayments.toLocaleString()}</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  -5.2% from last month
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/accounts-asst/fees'}
                className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-800">Fee Management</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => window.location.href = '/accounts-asst/payroll'}
                className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-800">Payroll Management</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => window.location.href = '/accounts-asst/vendors'}
                className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-800">Vendor Management</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => window.location.href = '/accounts-asst/reports'}
                className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="font-medium text-gray-800">Financial Reports</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getActivityIcon(activity.type)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">₹{activity.amount.toLocaleString()}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Download Reports</h3>
            <div className="space-y-3">
              <button
                onClick={() => downloadReport('Fee Collection Report')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <DownloadCloud className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-800">Fee Collection Report</span>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => downloadReport('Payroll Report')}
                className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <DownloadCloud className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-800">Payroll Report</span>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => downloadReport('Expense Report')}
                className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center">
                  <DownloadCloud className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium text-gray-800">Expense Report</span>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={() => downloadReport('Vendor Payment Report')}
                className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <DownloadCloud className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-800">Vendor Payment Report</span>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Fees:</span>
                <span className="font-semibold text-green-600">₹{financialSummary.totalFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Payroll:</span>
                <span className="font-semibold text-blue-600">₹{financialSummary.totalPayroll.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-semibold text-red-600">₹{financialSummary.totalExpenses.toLocaleString()}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-semibold">Net Revenue:</span>
                <span className="font-bold text-lg text-purple-600">₹{financialSummary.netRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-800">{financialSummary.totalStudents}</p>
                <p className="text-sm text-blue-600">Total Students</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-800">{financialSummary.totalStaff}</p>
                <p className="text-sm text-green-600">Total Staff</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-800">{Math.ceil(financialSummary.pendingPayments / 1000)}</p>
                <p className="text-sm text-yellow-600">Pending Payments</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-800">{Math.ceil(financialSummary.overduePayments / 1000)}</p>
                <p className="text-sm text-red-600">Overdue Payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsAsstDashboard; 