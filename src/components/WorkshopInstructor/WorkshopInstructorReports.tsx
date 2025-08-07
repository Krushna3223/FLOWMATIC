import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportData {
  id: string;
  title: string;
  type: 'equipment' | 'safety' | 'maintenance' | 'inventory' | 'financial';
  period: string;
  generatedAt: string;
  status: 'generated' | 'pending' | 'failed';
  downloadUrl?: string;
  summary: {
    totalEquipment: number;
    functionalEquipment: number;
    maintenanceRequired: number;
    outOfOrder: number;
    safetyIncidents: number;
    totalRequests: number;
    approvedRequests: number;
    totalCost: number;
  };
}

const WorkshopInstructorReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Mock data
      const mockReports: ReportData[] = [
        {
          id: '1',
          title: 'January 2024 Equipment Report',
          type: 'equipment',
          period: 'January 2024',
          generatedAt: '2024-01-31',
          status: 'generated',
          summary: {
            totalEquipment: 25,
            functionalEquipment: 22,
            maintenanceRequired: 2,
            outOfOrder: 1,
            safetyIncidents: 0,
            totalRequests: 5,
            approvedRequests: 4,
            totalCost: 15000
          }
        },
        {
          id: '2',
          title: 'December 2023 Safety Report',
          type: 'safety',
          period: 'December 2023',
          generatedAt: '2023-12-31',
          status: 'generated',
          summary: {
            totalEquipment: 25,
            functionalEquipment: 23,
            maintenanceRequired: 1,
            outOfOrder: 1,
            safetyIncidents: 1,
            totalRequests: 3,
            approvedRequests: 3,
            totalCost: 8000
          }
        },
        {
          id: '3',
          title: 'Q4 2023 Maintenance Report',
          type: 'maintenance',
          period: 'Q4 2023',
          generatedAt: '2023-12-31',
          status: 'generated',
          summary: {
            totalEquipment: 25,
            functionalEquipment: 24,
            maintenanceRequired: 0,
            outOfOrder: 1,
            safetyIncidents: 0,
            totalRequests: 8,
            approvedRequests: 7,
            totalCost: 25000
          }
        },
        {
          id: '4',
          title: 'February 2024 Inventory Report',
          type: 'inventory',
          period: 'February 2024',
          generatedAt: '2024-02-15',
          status: 'pending',
          summary: {
            totalEquipment: 25,
            functionalEquipment: 22,
            maintenanceRequired: 2,
            outOfOrder: 1,
            safetyIncidents: 0,
            totalRequests: 2,
            approvedRequests: 1,
            totalCost: 5000
          }
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        type: reportType as any,
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        generatedAt: new Date().toISOString(),
        status: 'generated',
        summary: {
          totalEquipment: Math.floor(Math.random() * 30) + 20,
          functionalEquipment: Math.floor(Math.random() * 25) + 18,
          maintenanceRequired: Math.floor(Math.random() * 5) + 1,
          outOfOrder: Math.floor(Math.random() * 3) + 1,
          safetyIncidents: Math.floor(Math.random() * 2),
          totalRequests: Math.floor(Math.random() * 10) + 2,
          approvedRequests: Math.floor(Math.random() * 8) + 1,
          totalCost: Math.floor(Math.random() * 20000) + 5000
        }
      };
      
      setReports(prev => [newReport, ...prev]);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      // Mock download functionality
      toast.success('Report download started');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return <Wrench className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      case 'inventory': return <BarChart3 className="h-4 w-4" />;
      case 'financial': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = reportType === 'all' || report.type === reportType;
    return matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and view workshop reports and analytics</p>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Generate New Report</h2>
        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="equipment">Equipment Report</option>
              <option value="safety">Safety Report</option>
              <option value="maintenance">Maintenance Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="financial">Financial Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getTypeIcon(report.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{report.summary.totalEquipment}</p>
                      <p className="text-sm text-gray-600">Total Equipment</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{report.summary.functionalEquipment}</p>
                      <p className="text-sm text-gray-600">Functional</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{report.summary.maintenanceRequired}</p>
                      <p className="text-sm text-gray-600">Maintenance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{report.summary.outOfOrder}</p>
                      <p className="text-sm text-gray-600">Out of Order</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.summary.safetyIncidents}</p>
                      <p className="text-sm text-gray-600">Safety Incidents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.summary.totalRequests}</p>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.summary.approvedRequests}</p>
                      <p className="text-sm text-gray-600">Approved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">₹{report.summary.totalCost.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Cost</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    Generated: {new Date(report.generatedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {report.status === 'generated' && (
                    <button
                      onClick={() => downloadReport(report.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  )}
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'generated').length}
                </p>
                <p className="text-sm text-gray-600">Generated</p>
              </div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopInstructorReports; 