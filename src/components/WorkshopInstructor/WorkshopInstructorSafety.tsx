import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Plus,
  Bell,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SafetyNotice {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'safety' | 'maintenance' | 'emergency' | 'general';
  location: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdBy: string;
}

const WorkshopInstructorSafety: React.FC = () => {
  const { currentUser } = useAuth();
  const [safetyNotices, setSafetyNotices] = useState<SafetyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    type: 'safety' as const,
    location: ''
  });

  useEffect(() => {
    fetchSafetyNotices();
  }, []);

  const fetchSafetyNotices = async () => {
    try {
      // Mock data
      const mockNotices: SafetyNotice[] = [
        {
          id: '1',
          title: 'New Safety Protocol for Welding',
          description: 'Updated safety procedures for welding operations effective immediately. All students must wear proper PPE including welding helmets, gloves, and fire-resistant clothing.',
          priority: 'high',
          type: 'safety',
          location: 'All Workshops',
          status: 'active',
          createdAt: '2024-01-20',
          createdBy: 'Workshop Instructor'
        },
        {
          id: '2',
          title: 'Equipment Maintenance Schedule',
          description: 'Monthly maintenance schedule for all workshop equipment. Please ensure all equipment is properly maintained and inspected.',
          priority: 'medium',
          type: 'maintenance',
          location: 'Workshop A & B',
          status: 'acknowledged',
          createdAt: '2024-01-18',
          acknowledgedAt: '2024-01-19',
          createdBy: 'Workshop Instructor'
        },
        {
          id: '3',
          title: 'Emergency Exit Procedures',
          description: 'Updated emergency exit procedures for all workshop areas. Please familiarize yourself with the nearest exits and evacuation routes.',
          priority: 'critical',
          type: 'emergency',
          location: 'All Workshops',
          status: 'active',
          createdAt: '2024-01-15',
          createdBy: 'Safety Officer'
        },
        {
          id: '4',
          title: 'Tool Storage Guidelines',
          description: 'New guidelines for proper tool storage and organization. All tools must be returned to their designated storage areas after use.',
          priority: 'low',
          type: 'general',
          location: 'Workshop A',
          status: 'resolved',
          createdAt: '2024-01-10',
          resolvedAt: '2024-01-12',
          createdBy: 'Workshop Instructor'
        }
      ];
      setSafetyNotices(mockNotices);
    } catch (error) {
      console.error('Error fetching safety notices:', error);
      toast.error('Failed to fetch safety notices');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (noticeId: string) => {
    try {
      setSafetyNotices(prev => 
        prev.map(notice => 
          notice.id === noticeId 
            ? { 
                ...notice, 
                status: 'acknowledged',
                acknowledgedAt: new Date().toISOString()
              }
            : notice
        )
      );
      toast.success('Safety notice acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge notice');
    }
  };

  const handleResolve = async (noticeId: string) => {
    try {
      setSafetyNotices(prev => 
        prev.map(notice => 
          notice.id === noticeId 
            ? { 
                ...notice, 
                status: 'resolved',
                resolvedAt: new Date().toISOString()
              }
            : notice
        )
      );
      toast.success('Safety notice resolved');
    } catch (error) {
      toast.error('Failed to resolve notice');
    }
  };

  const handleAddNotice = async () => {
    try {
      const newNoticeItem: SafetyNotice = {
        id: Date.now().toString(),
        ...newNotice,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'Workshop Instructor'
      };
      
      setSafetyNotices(prev => [newNoticeItem, ...prev]);
      setNewNotice({
        title: '',
        description: '',
        priority: 'medium',
        type: 'safety',
        location: ''
      });
      setShowAddModal(false);
      toast.success('Safety notice created successfully');
    } catch (error) {
      toast.error('Failed to create safety notice');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safety': return <Shield className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      case 'general': return <FileText className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotices = safetyNotices.filter(notice => {
    const matchesSearch = 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || notice.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || notice.status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Safety Notices & Protocols</h1>
        <p className="text-gray-600">Manage safety notices, protocols, and emergency procedures</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search safety notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Notice
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notices */}
      <div className="space-y-6">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notice.type)}
                      <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                      {notice.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notice.status)}`}>
                      {notice.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">{notice.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Location: {notice.location}</span>
                      <span>Created: {new Date(notice.createdAt).toLocaleDateString()}</span>
                      <span>By: {notice.createdBy}</span>
                    </div>
                    {notice.acknowledgedAt && (
                      <div className="text-sm text-gray-500 mt-1">
                        Acknowledged: {new Date(notice.acknowledgedAt).toLocaleDateString()}
                      </div>
                    )}
                    {notice.resolvedAt && (
                      <div className="text-sm text-gray-500 mt-1">
                        Resolved: {new Date(notice.resolvedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {notice.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(notice.id)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolve(notice.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {notice.status === 'acknowledged' && (
                    <button
                      onClick={() => handleResolve(notice.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Safety Notice</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddNotice();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({...newNotice, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="safety">Safety</option>
                    <option value="emergency">Emergency</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({...newNotice, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newNotice.location}
                    onChange={(e) => setNewNotice({...newNotice, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newNotice.description}
                    onChange={(e) => setNewNotice({...newNotice, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Create Notice
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopInstructorSafety; 