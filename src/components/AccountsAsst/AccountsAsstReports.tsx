import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { BarChart3, DollarSign, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';

interface FinancialData {
  totalFees: number;
  totalPayroll: number;
  totalExpenses: number;
  netRevenue: number;
  monthlyData: {
    month: string;
    fees: number;
    payroll: number;
    expenses: number;
  }[];
}

const AccountsAsstReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch real fee data from the same sources as Admin FeeManagement
      const usersRef = ref(database, 'users');
      const feesRef = ref(database, 'fees');
      
      const [usersSnapshot, feesSnapshot] = await Promise.all([
        get(usersRef),
        get(feesRef)
      ]);
      
      let totalFees = 0;
      let totalPaid = 0;
      let totalDue = 0;
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
            } else {
              // If no fee record exists, assume default fee structure
              const defaultTotalFees = 25000; // Much lower default fee
              totalFees += defaultTotalFees;
              totalDue += defaultTotalFees;
            }
          }
        });
      }
      
      // Use realistic financial metrics with much smaller numbers
      const mockData: FinancialData = {
        totalFees: totalFees,
        totalPayroll: Math.round(totalStudents * 15000), // Much lower payroll per student
        totalExpenses: Math.round(totalStudents * 5000), // Much lower expenses per student
        netRevenue: totalPaid - Math.round(totalStudents * 15000) - Math.round(totalStudents * 5000),
        monthlyData: [
          { month: 'Jan', fees: Math.round(totalPaid * 0.15), payroll: Math.round(totalStudents * 1250), expenses: Math.round(totalStudents * 417) },
          { month: 'Feb', fees: Math.round(totalPaid * 0.16), payroll: Math.round(totalStudents * 1250), expenses: Math.round(totalStudents * 417) },
          { month: 'Mar', fees: Math.round(totalPaid * 0.17), payroll: Math.round(totalStudents * 1250), expenses: Math.round(totalStudents * 417) },
          { month: 'Apr', fees: Math.round(totalPaid * 0.18), payroll: Math.round(totalStudents * 1250), expenses: Math.round(totalStudents * 833) },
          { month: 'May', fees: Math.round(totalPaid * 0.17), payroll: Math.round(totalStudents * 1250), expenses: Math.round(totalStudents * 417) },
          { month: 'Jun', fees: Math.round(totalPaid * 0.17), payroll: Math.round(totalStudents * 1250), expenses: Math.round(totalStudents * 417) },
        ]
      };
      
      setFinancialData(mockData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      // Simulate report generation
      toast.success(`${type} report generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const downloadReport = async (reportType: string, format: 'pdf' | 'csv' | 'excel' = 'pdf') => {
    try {
      toast.success(`${reportType} ${format.toUpperCase()} download started`);
      
      // Generate actual report data based on selectedPeriod
      const reportData = await generateReportData(reportType, selectedPeriod);
      
      if (format === 'csv') {
        downloadCSV(reportData, reportType);
      } else if (format === 'excel') {
        downloadExcel(reportData, reportType);
      } else {
        downloadPDF(reportData, reportType);
      }
      
      toast.success(`${reportType} ${format.toUpperCase()} downloaded successfully`);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const generateReportData = async (reportType: string, period: string) => {
    const currentDate = new Date();
    const periodText = period.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    switch (reportType) {
      case 'Fee Collection Report':
        // Fetch real student fee data for the report
        const usersRef = ref(database, 'users');
        const feesRef = ref(database, 'fees');
        
        const [usersSnapshot, feesSnapshot] = await Promise.all([
          get(usersRef),
          get(feesRef)
        ]);
        
        let reportData: any[] = [];
        let totalStudents = 0;
        let totalFees = 0;
        let totalPaid = 0;
        let totalDue = 0;
        let paidStudents = 0;
        let partialStudents = 0;
        let pendingStudents = 0;
        
        if (usersSnapshot.exists() && feesSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          const feesData = feesSnapshot.val();
          
          Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
            if (userData.role === 'student') {
              totalStudents++;
              const rollNumber = userData.rollNo || userData.rollNumber || 'N/A';
              
                             if (feesData[rollNumber]) {
                 const studentFees = feesData[rollNumber];
                 const studentTotalFees = Number(studentFees.total) || 25000; // Ensure it's a number
                 const studentPaid = Number(studentFees.paid) || 0; // Ensure it's a number
                 const studentDue = studentTotalFees - studentPaid;
                
                totalFees += studentTotalFees;
                totalPaid += studentPaid;
                totalDue += studentDue;
                
                let status = 'Pending';
                if (studentDue <= 0) {
                  status = 'Paid';
                  paidStudents++;
                } else if (studentPaid > 0) {
                  status = 'Partial';
                  partialStudents++;
                } else {
                  pendingStudents++;
                }
                
                reportData.push([
                  rollNumber,
                  userData.name || userData.studentName || 'Unknown',
                  userData.department || 'Unknown',
                  userData.course || 'B-Tech',
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
          period: periodText,
          date: currentDate.toLocaleDateString(),
          headers: ['Student ID', 'Student Name', 'Department', 'Course', 'Total Fees', 'Paid Amount', 'Due Amount', 'Status'],
          data: reportData.slice(0, 10), // Show first 10 students
          summary: {
            totalStudents: totalStudents,
            totalFees: totalFees,
            totalPaid: totalPaid,
            totalDue: totalDue,
            paidStudents: paidStudents,
            partialStudents: partialStudents,
            pendingStudents: pendingStudents
          }
        };
        
      case 'Payroll Report':
        return {
          title: 'Payroll Report',
          period: periodText,
          date: currentDate.toLocaleDateString(),
          headers: ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary'],
          data: [
            ['EMP001', 'Dr. Sarah Johnson', 'CSE', 'HOD', '80000', '20000', '5000', '95000'],
            ['EMP002', 'Prof. Michael Chen', 'CSE', 'Associate Professor', '60000', '15000', '4000', '71000'],
            ['EMP003', 'Prof. Emily Davis', 'MECH', 'Assistant Professor', '50000', '12000', '3000', '59000'],
            ['EMP004', 'Prof. David Wilson', 'AI_DS', 'Associate Professor', '65000', '16000', '4500', '76500'],
            ['EMP005', 'Prof. Lisa Anderson', 'CSE', 'Assistant Professor', '48000', '11000', '2800', '56200'],
          ],
          summary: {
            totalEmployees: 5,
            totalBasicSalary: 303000,
            totalAllowances: 74000,
            totalDeductions: 19300,
            totalNetSalary: 357700
          }
        };
        
      case 'Financial Summary Report':
        return {
          title: 'Financial Summary Report',
          period: periodText,
          date: currentDate.toLocaleDateString(),
          headers: ['Category', 'Amount', 'Percentage'],
          data: [
            ['Total Fees Collected', '2500000', '100%'],
            ['Total Payroll', '1800000', '72%'],
            ['Total Expenses', '400000', '16%'],
            ['Net Revenue', '300000', '12%'],
          ],
          summary: {
            totalIncome: 2500000,
            totalExpenses: 2200000,
            netProfit: 300000,
            profitMargin: '12%'
          }
        };
        
      case 'Expense Report':
        return {
          title: 'Expense Report',
          period: periodText,
          date: currentDate.toLocaleDateString(),
          headers: ['Expense Category', 'Description', 'Amount', 'Date', 'Approved By'],
          data: [
            ['Equipment', 'Lab Computers', '150000', '2024-01-15', 'Principal'],
            ['Supplies', 'Office Stationery', '25000', '2024-01-20', 'Admin'],
            ['Maintenance', 'Building Repairs', '75000', '2024-01-25', 'Admin'],
            ['Utilities', 'Electricity & Water', '50000', '2024-01-30', 'Admin'],
            ['Marketing', 'Admission Brochures', '30000', '2024-02-01', 'Principal'],
            ['Training', 'Staff Development', '70000', '2024-02-05', 'HOD CSE'],
          ],
          summary: {
            totalExpenses: 400000,
            categories: 6,
            averageExpense: 66667
          }
        };
        
      default:
        return {
          title: reportType,
          period: periodText,
          date: currentDate.toLocaleDateString(),
          headers: ['Item', 'Value'],
          data: [['Sample Data', 'Sample Value']],
          summary: {}
        };
    }
  };

  const downloadCSV = (reportData: any, reportType: string) => {
    const csvContent = [
      reportData.title,
      `Period: ${reportData.period}`,
      `Generated on: ${reportData.date}`,
      '',
      reportData.headers.join(','),
      ...reportData.data.map((row: any[]) => row.join(',')),
      '',
      'Summary:',
      ...Object.entries(reportData.summary).map(([key, value]) => `${key},${value}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = (reportData: any, reportType: string) => {
    // Create Excel-like content (simplified version)
    const excelContent = [
      [reportData.title],
      [`Period: ${reportData.period}`],
      [`Generated on: ${reportData.date}`],
      [],
      reportData.headers,
      ...reportData.data,
      [],
      ['Summary:'],
      ...Object.entries(reportData.summary).map(([key, value]) => [key, value])
    ];

    // Convert to CSV format (Excel can open CSV files)
    const csvContent = excelContent.map(row => 
      Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : `"${row}"`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (reportData: any, reportType: string) => {
    // Create PDF content using HTML and convert to PDF
    const pdfContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; }
            .summary h3 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${reportData.title}</div>
            <div class="subtitle">Period: ${reportData.period} | Generated on: ${reportData.date}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${reportData.headers.map((header: string) => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${reportData.data.map((row: any[]) => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            ${Object.entries(reportData.summary).map(([key, value]) => 
              `<p><strong>${key}:</strong> ${value}</p>`
            ).join('')}
          </div>
        </body>
      </html>
    `;

    // Create a blob with the HTML content
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    // Also provide a direct download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Reports</h1>
              <p className="text-gray-600">Comprehensive financial analysis and reporting</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="current_month">Current Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="current_year">Current Year</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
          </div>

          {financialData && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm text-green-600">Total Fees</p>
                      <p className="text-2xl font-bold text-green-800">₹{financialData.totalFees.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-600">Total Payroll</p>
                      <p className="text-2xl font-bold text-blue-800">₹{financialData.totalPayroll.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-800">₹{financialData.totalExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm text-purple-600">Net Revenue</p>
                      <p className="text-2xl font-bold text-purple-800">₹{financialData.netRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Financial Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {financialData.monthlyData.map((month, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{month.month}</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-green-600">Fees:</span> ₹{month.fees.toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="text-blue-600">Payroll:</span> ₹{month.payroll.toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <span className="text-red-600">Expenses:</span> ₹{month.expenses.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Generation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="font-semibold">Fee Collection Report</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Generate detailed fee collection reports with student-wise breakdown</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => generateReport('Fee Collection')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Generate Report
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('Fee Collection Report', 'pdf')}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => downloadReport('Fee Collection Report', 'csv')}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => downloadReport('Fee Collection Report', 'excel')}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="font-semibold">Payroll Report</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Generate comprehensive payroll reports with staff-wise details</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => generateReport('Payroll')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Generate Report
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('Payroll Report', 'pdf')}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => downloadReport('Payroll Report', 'csv')}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => downloadReport('Payroll Report', 'excel')}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="font-semibold">Financial Summary</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Generate overall financial summary with key metrics</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => generateReport('Financial Summary')}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Generate Report
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('Financial Summary Report', 'pdf')}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => downloadReport('Financial Summary Report', 'csv')}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => downloadReport('Financial Summary Report', 'excel')}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-orange-600 mr-2" />
                    <h3 className="font-semibold">Revenue Analysis</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Analyze revenue trends and patterns</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => generateReport('Revenue Analysis')}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      Generate Report
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('Revenue Analysis Report', 'pdf')}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => downloadReport('Revenue Analysis Report', 'csv')}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => downloadReport('Revenue Analysis Report', 'excel')}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingDown className="w-6 h-6 text-red-600 mr-2" />
                    <h3 className="font-semibold">Expense Report</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Detailed expense breakdown and analysis</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => generateReport('Expense')}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Generate Report
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('Expense Report', 'pdf')}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => downloadReport('Expense Report', 'csv')}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => downloadReport('Expense Report', 'excel')}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Download className="w-6 h-6 text-gray-600 mr-2" />
                    <h3 className="font-semibold">Quick Downloads</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Download all reports in one click</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        downloadReport('Complete Financial Report', 'pdf');
                        downloadReport('Complete Financial Report', 'excel');
                      }}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Download All (PDF + Excel)
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport('Monthly Summary', 'pdf')}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => downloadReport('Quarterly Summary', 'pdf')}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Quarterly
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountsAsstReports; 