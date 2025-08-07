import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  FileText,
  User,
  MapPin,
  Calendar,
  Zap,
  HardHat,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SafetyReport {
  id: string;
  title: string;
  type: 'incident' | 'audit' | 'inspection' | 'training' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  location: string;
  description: string;
  affectedPersons?: string[];
  injuries?: string[];
  equipment?: string[];
  rootCause?: string;
  correctiveActions?: string[];
  assignedTo?: string;
  resolvedAt?: string;
  followUpDate?: string;
  attachments?: string[];
}

interface SafetyMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

const LabAsstCivilSafetyReport: React.FC = () => {
  const { currentUser } = useAuth();
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddReport, setShowAddReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportsRef = ref(database, 'civil_lab_safety_reports');
      const metricsRef = ref(database, 'civil_lab_safety_metrics');
      
      const [reportsSnapshot, metricsSnapshot] = await Promise.all([
        get(reportsRef),
        get(metricsRef)
      ]);
      
      if (reportsSnapshot.exists()) {
        const reportsData = reportsSnapshot.val();
        const reportsArray = Object.entries(reportsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setSafetyReports(reportsArray);
      } else {
        // Initialize with sample data
        const sampleReports: SafetyReport[] = [
          {
            id: 'sr-1',
            title: 'Minor Equipment Incident',
            type: 'incident',
            severity: 'low',
            status: 'resolved',
            reportedBy: 'Lab Assistant',
            reportedAt: '2024-01-20T14:30:00Z',
            location: 'Civil Lab 1',
            description: 'Minor spill during concrete testing, no injuries reported',
            affectedPersons: ['Student Group'],
            equipment: ['Concrete Mixer'],
            rootCause: 'Improper handling of wet concrete',
            correctiveActions: ['Additional safety training scheduled', 'Improved signage installed'],
            resolvedAt: '2024-01-21T10:00:00Z'
          },
          {
            id: 'sr-2',
            title: 'Safety Equipment Audit',
            type: 'audit',
            severity: 'medium',
            status: 'open',
            reportedBy: 'Safety Officer',
            reportedAt: '2024-01-19T09:00:00Z',
            location: 'Civil Lab 2',
            description: 'Monthly safety equipment inspection revealed missing safety goggles',
            equipment: ['Safety Goggles', 'Hard Hats'],
            assignedTo: 'Lab Manager',
            followUpDate: '2024-01-25T00:00:00Z'
          },
          {
            id: 'sr-3',
            title: 'Emergency Response Training',
            type: 'training',
            severity: 'low',
            status: 'closed',
            reportedBy: 'Training Coordinator',
            reportedAt: '2024-01-18T11:00:00Z',
            location: 'Training Room',
            description: 'Completed emergency response training for all lab personnel',
            affectedPersons: ['All Lab Staff'],
            resolvedAt: '2024-01-18T17:00:00Z'
          }
        ];
        setSafetyReports(sampleReports);
      }

      if (metricsSnapshot.exists()) {
        const metricsData = metricsSnapshot.val();
        const metricsArray = Object.entries(metricsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setSafetyMetrics(metricsArray);
      } else {
        // Initialize with sample metrics
        const sampleMetrics: SafetyMetric[] = [
          {
            id: 'sm-1',
            name: 'Days Without Incident',
            value: 45,
            target: 60,
            unit: 'days',
            trend: 'up',
            period: 'Last 30 days'
          },
          {
            id: 'sm-2',
            name: 'Safety Training Completion',
            value: 95,
            target: 100,
            unit: '%',
            trend: 'up',
            period: 'Current month'
          },
          {
            id: 'sm-3',
            name: 'Equipment Safety Score',
            value: 88,
            target: 90,
            unit: '%',
            trend: 'stable',
            period: 'Last audit'
          }
        ];
        setSafetyMetrics(sampleMetrics);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load safety data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      const reportRef = ref(database, `civil_lab_safety_reports/${reportId}`);
      await set(reportRef, {
        ...safetyReports.find(r => r.id === reportId),
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : undefined
      });
      
      setSafetyReports(safetyReports.map(r => 
        r.id === reportId 
          ? { ...r, status: newStatus as any, resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : r.resolvedAt }
          : r
      ));
      
      toast.success('Safety report status updated successfully');
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertTriangle className="h-4 w-4" />;
      case 'audit': return <Shield className="h-4 w-4" />;
      case 'inspection': return <CheckCircle className="h-4 w-4" />;
      case 'training': return <Activity className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredReports = safetyReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Civil Lab Safety Reports</h1>
          <p className="text-gray-600">Monitor safety incidents, audits, and compliance metrics</p>
        </div>

        {/* Safety Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {safetyMetrics.map((metric) => (
            <div key={metric.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}{metric.unit}
                  </p>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Target: {metric.target}{metric.unit}</span>
                <span className="text-gray-500">{metric.period}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    metric.value >= metric.target ? 'bg-green-600' : 'bg-yellow-600'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search safety reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="incident">Incident</option>
              <option value="audit">Audit</option>
              <option value="inspection">Inspection</option>
              <option value="training">Training</option>
              <option value="compliance">Compliance</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </button>
          </div>
        </div>

        {/* Safety Reports */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                        <div className="text-xs text-gray-400 mt-1">{report.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTypeIcon(report.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{report.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{report.reportedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.reportedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {report.status === 'open' && (
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Safety Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedReport.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedReport.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedReport.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Severity:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedReport.severity}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedReport.status}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location:</span>
                    <p className="text-sm text-gray-900">{selectedReport.location}</p>
                  </div>
                </div>
                
                {selectedReport.affectedPersons && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Affected Persons:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedReport.affectedPersons.map((person, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReport.equipment && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Equipment Involved:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedReport.equipment.map((eq, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReport.rootCause && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Root Cause:</span>
                    <p className="text-sm text-gray-900">{selectedReport.rootCause}</p>
                  </div>
                )}
                
                {selectedReport.correctiveActions && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Corrective Actions:</span>
                    <ul className="list-disc list-inside text-sm text-gray-900 mt-1">
                      {selectedReport.correctiveActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Handle edit functionality
                      setSelectedReport(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabAsstCivilSafetyReport;
