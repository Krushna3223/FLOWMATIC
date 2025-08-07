import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, set, get, remove, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  BarChart3,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
  Printer,
  Send
} from 'lucide-react';

interface LabReport {
  id: string;
  title: string;
  type: string;
  description: string;
  content: string;
  status: 'draft' | 'completed' | 'submitted' | 'approved';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  attachments?: string[];
  tags: string[];
}

const TechLabAsstReports: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showEditReport, setShowEditReport] = useState<LabReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('reports');

  const [reportForm, setReportForm] = useState({
    title: '',
    type: '',
    description: '',
    content: '',
    tags: [] as string[]
  });

  const reportTypes = [
    'Equipment Maintenance Report',
    'Safety Inspection Report',
    'Inventory Report',
    'Usage Statistics Report',
    'Incident Report',
    'Training Report',
    'Budget Report',
    'Monthly Summary',
    'Annual Report',
    'Other'
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Approved', color: 'bg-purple-100 text-purple-800' }
  ];

  const tagOptions = [
    'Equipment',
    'Safety',
    'Maintenance',
    'Training',
    'Budget',
    'Inventory',
    'Incident',
    'Statistics',
    'Monthly',
    'Annual'
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const db = getDatabase();
      const reportsRef = ref(db, 'labReports');
      const snapshot = await get(reportsRef);
      
      if (snapshot.exists()) {
        const reportsData = snapshot.val();
        const reportsArray = Object.keys(reportsData).map(key => ({
          id: key,
          ...reportsData[key]
        }));
        setReports(reportsArray);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportForm.title || !reportForm.type || !reportForm.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const reportsRef = ref(db, 'labReports');
      const newReportRef = push(reportsRef);
      
      const reportData = {
        ...reportForm,
        status: 'draft',
        createdBy: currentUser?.uid || '',
        createdByName: currentUser?.name || 'Tech Lab Assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newReportRef, reportData);
      toast.success('Report created successfully');
      setShowAddReport(false);
      setReportForm({
        title: '',
        type: '',
        description: '',
        content: '',
        tags: []
      });
      fetchReports();
    } catch (error) {
      console.error('Error adding report:', error);
      toast.error('Failed to create report');
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showEditReport) return;

    try {
      const db = getDatabase();
      const reportRef = ref(db, `labReports/${showEditReport.id}`);
      
      const updateData = {
        ...reportForm,
        updatedAt: new Date().toISOString()
      };

      await update(reportRef, updateData);
      toast.success('Report updated successfully');
      setShowEditReport(null);
      setReportForm({
        title: '',
        type: '',
        description: '',
        content: '',
        tags: []
      });
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleSubmitReport = async (reportId: string) => {
    try {
      const db = getDatabase();
      const reportRef = ref(db, `labReports/${reportId}`);
      await update(reportRef, {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast.success('Report submitted successfully');
      fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  const handleCompleteReport = async (reportId: string) => {
    try {
      const db = getDatabase();
      const reportRef = ref(db, `labReports/${reportId}`);
      await update(reportRef, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
      toast.success('Report marked as completed');
      fetchReports();
    } catch (error) {
      console.error('Error completing report:', error);
      toast.error('Failed to complete report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const db = getDatabase();
        const reportRef = ref(db, `labReports/${reportId}`);
        await remove(reportRef);
        toast.success('Report deleted successfully');
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        toast.error('Failed to delete report');
      }
    }
  };

  const handleEditReport = (report: LabReport) => {
    setShowEditReport(report);
    setReportForm({
      title: report.title,
      type: report.type,
      description: report.description,
      content: report.content,
      tags: report.tags || []
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = reportForm.tags;
    if (currentTags.includes(tag)) {
      setReportForm({
        ...reportForm,
        tags: currentTags.filter(t => t !== tag)
      });
    } else {
      setReportForm({
        ...reportForm,
        tags: [...currentTags, tag]
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getReportStats = () => {
    const total = reports.length;
    const draft = reports.filter(r => r.status === 'draft').length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const submitted = reports.filter(r => r.status === 'submitted').length;
    const approved = reports.filter(r => r.status === 'approved').length;

    return { total, draft, completed, submitted, approved };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getReportStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Lab Reports</h1>
              <p className="text-gray-600">Generate and manage lab reports and documentation</p>
            </div>
            <button
              onClick={() => setShowAddReport(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Report
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Send className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Submitted</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.submitted}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Approved</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.approved}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {reportTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {report.type}</span>
                      <span>•</span>
                      <span>Created by: {report.createdByName}</span>
                      <span>•</span>
                      <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    {report.tags && report.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {report.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReport(report)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Last Updated: {new Date(report.updatedAt).toLocaleDateString()}</p>
                    {report.approvedByName && (
                      <p>Approved by: {report.approvedByName}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {report.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleSubmitReport(report.id)}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => handleCompleteReport(report.id)}
                          className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    <button
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </button>
                    <button
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 flex items-center"
                    >
                      <Printer className="w-3 h-3 mr-1" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-500">No reports match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Report Modal */}
      {showAddReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Report</h3>
              <button
                onClick={() => setShowAddReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Title *</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={reportForm.content}
                  onChange={(e) => setReportForm({...reportForm, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="Enter detailed report content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        reportForm.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Create Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddReport(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Report Modal */}
      {showEditReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Report</h3>
              <button
                onClick={() => setShowEditReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Title *</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={reportForm.content}
                  onChange={(e) => setReportForm({...reportForm, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="Enter detailed report content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        reportForm.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditReport(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechLabAsstReports; 