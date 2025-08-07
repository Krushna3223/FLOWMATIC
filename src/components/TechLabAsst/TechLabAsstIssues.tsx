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
  AlertTriangle,
  CheckCircle,
  X,
  Clock,
  User,
  Settings,
  Wrench
} from 'lucide-react';

interface TechnicalIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  equipment?: string;
  location: string;
}

const TechLabAsstIssues: React.FC = () => {
  const { currentUser } = useAuth();
  const [issues, setIssues] = useState<TechnicalIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [showEditIssue, setShowEditIssue] = useState<TechnicalIssue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    equipment: ''
  });

  const categories = [
    'Hardware Problem',
    'Software Issue',
    'Network Problem',
    'Equipment Failure',
    'Safety Issue',
    'Power Problem',
    'Environmental Issue',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'bg-red-100 text-red-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const db = getDatabase();
      const issuesRef = ref(db, 'technicalIssues');
      const snapshot = await get(issuesRef);
      
      if (snapshot.exists()) {
        const issuesData = snapshot.val();
        const issuesArray = Object.keys(issuesData).map(key => ({
          id: key,
          ...issuesData[key]
        }));
        setIssues(issuesArray);
      } else {
        setIssues([]);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueForm.title || !issueForm.description || !issueForm.category) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const db = getDatabase();
      const issuesRef = ref(db, 'technicalIssues');
      const newIssueRef = push(issuesRef);
      
      const issueData = {
        ...issueForm,
        status: 'open',
        reportedBy: currentUser?.uid || '',
        reportedByName: currentUser?.name || 'Tech Lab Assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newIssueRef, issueData);
      toast.success('Issue reported successfully');
      setShowAddIssue(false);
      setIssueForm({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: '',
        equipment: ''
      });
      fetchIssues();
    } catch (error) {
      console.error('Error adding issue:', error);
      toast.error('Failed to report issue');
    }
  };

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showEditIssue) return;

    try {
      const db = getDatabase();
      const issueRef = ref(db, `technicalIssues/${showEditIssue.id}`);
      
      const updateData = {
        ...issueForm,
        updatedAt: new Date().toISOString()
      };

      await update(issueRef, updateData);
      toast.success('Issue updated successfully');
      setShowEditIssue(null);
      setIssueForm({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        location: '',
        equipment: ''
      });
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const db = getDatabase();
      const issueRef = ref(db, `technicalIssues/${issueId}`);
      
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }

      await update(issueRef, updateData);
      toast.success('Issue status updated successfully');
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast.error('Failed to update issue status');
    }
  };

  const handleAssignIssue = async (issueId: string, assignedTo: string, assignedToName: string) => {
    try {
      const db = getDatabase();
      const issueRef = ref(db, `technicalIssues/${issueId}`);
      await update(issueRef, {
        assignedTo,
        assignedToName,
        updatedAt: new Date().toISOString()
      });
      toast.success('Issue assigned successfully');
      fetchIssues();
    } catch (error) {
      console.error('Error assigning issue:', error);
      toast.error('Failed to assign issue');
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        const db = getDatabase();
        const issueRef = ref(db, `technicalIssues/${issueId}`);
        await remove(issueRef);
        toast.success('Issue deleted successfully');
        fetchIssues();
      } catch (error) {
        console.error('Error deleting issue:', error);
        toast.error('Failed to delete issue');
      }
    }
  };

  const handleEditIssue = (issue: TechnicalIssue) => {
    setShowEditIssue(issue);
    setIssueForm({
      title: issue.title,
      description: issue.description,
      category: issue.category,
      priority: issue.priority,
      location: issue.location,
      equipment: issue.equipment || ''
    });
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Technical Issues</h1>
              <p className="text-gray-600">Track and manage technical problems in the lab</p>
            </div>
            <button
              onClick={() => setShowAddIssue(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Report Issue
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search issues..."
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
            <div className="w-full md:w-40">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {issue.category}</span>
                      <span>•</span>
                      <span>Location: {issue.location}</span>
                      {issue.equipment && (
                        <>
                          <span>•</span>
                          <span>Equipment: {issue.equipment}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditIssue(issue)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteIssue(issue.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <p>Reported by: {issue.reportedByName}</p>
                    <p>Created: {new Date(issue.createdAt).toLocaleDateString()}</p>
                    {issue.assignedToName && (
                      <p>Assigned to: {issue.assignedToName}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignIssue(issue.id, currentUser?.uid || '', currentUser?.name || '')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Assign to Me
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-500">No technical issues match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Issue Modal */}
      {showAddIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Report Technical Issue</h3>
              <button
                onClick={() => setShowAddIssue(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({...issueForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={issueForm.category}
                  onChange={(e) => setIssueForm({...issueForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={issueForm.priority}
                    onChange={(e) => setIssueForm({...issueForm, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={issueForm.location}
                    onChange={(e) => setIssueForm({...issueForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment (Optional)</label>
                <input
                  type="text"
                  value={issueForm.equipment}
                  onChange={(e) => setIssueForm({...issueForm, equipment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Report Issue
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddIssue(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {showEditIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Issue</h3>
              <button
                onClick={() => setShowEditIssue(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({...issueForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={issueForm.category}
                  onChange={(e) => setIssueForm({...issueForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={issueForm.priority}
                    onChange={(e) => setIssueForm({...issueForm, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={issueForm.location}
                    onChange={(e) => setIssueForm({...issueForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment (Optional)</label>
                <input
                  type="text"
                  value={issueForm.equipment}
                  onChange={(e) => setIssueForm({...issueForm, equipment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update Issue
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditIssue(null)}
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

export default TechLabAsstIssues; 