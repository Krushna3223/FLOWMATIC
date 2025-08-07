import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, push, get, set, update } from 'firebase/database';
import { 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Plus,
  Edit,
  Trash2,
  Book,
  Library,
  MessageSquare,
  BarChart3,
  FileText,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TimingRequest {
  id: string;
  title: string;
  description: string;
  requestedTiming: {
    startTime: string;
    endTime: string;
    days: string[];
    startDate: string;
    endDate: string;
  };
  reason: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  currentApproverRole: string;
  approvalFlow: Array<{
    role: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string | null;
    comment?: string;
  }>;
  history: Array<{
    action: string;
    by: string;
    role: string;
    timestamp: string;
    comment?: string;
  }>;
}

const AsstLibrarianTimingRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const db = getDatabase();
  
  const [timingRequests, setTimingRequests] = useState<TimingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('new-request');
  const [selectedRequest, setSelectedRequest] = useState<TimingRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    days: [] as string[],
    startDate: '',
    endDate: '',
    reason: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchTimingRequests();
  }, []);

  const fetchTimingRequests = async () => {
    try {
      const requestsRef = ref(db, 'libraryTimingRequests');
      const snapshot = await get(requestsRef);
      if (snapshot.exists()) {
        const requests: TimingRequest[] = [];
        snapshot.forEach((childSnapshot) => {
          const request = childSnapshot.val();
          if (request.createdBy === currentUser?.uid) {
            requests.push({
              id: childSnapshot.key!,
              ...request
            });
          }
        });
        setTimingRequests(requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Error fetching timing requests:', error);
      toast.error('Failed to fetch timing requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!currentUser) {
        toast.error('Please login to submit a request');
        return;
      }

      if (formData.days.length === 0) {
        toast.error('Please select at least one day');
        return;
      }

      const requestData: Omit<TimingRequest, 'id'> = {
        title: formData.title,
        description: formData.description,
        requestedTiming: {
          startTime: formData.startTime,
          endTime: formData.endTime,
          days: formData.days,
          startDate: formData.startDate,
          endDate: formData.endDate
        },
        reason: formData.reason,
        priority: formData.priority,
        status: 'pending',
        createdBy: currentUser.uid,
        createdByName: (currentUser as any).displayName || 'Assistant Librarian',
        createdAt: new Date().toISOString(),
        currentApproverRole: 'registrar',
        approvalFlow: [
          {
            role: 'registrar',
            name: 'Registrar',
            status: 'pending',
            timestamp: new Date().toISOString()
          },
          {
            role: 'principal',
            name: 'Principal',
            status: 'pending',
            timestamp: null
          }
        ],
        history: [
          {
            action: 'Request Created',
            by: (currentUser as any).displayName || 'Assistant Librarian',
            role: 'asst_librarian',
            timestamp: new Date().toISOString(),
            comment: 'Library timing request submitted'
          }
        ]
      };

      const requestsRef = ref(db, 'libraryTimingRequests');
      const newRequestRef = push(requestsRef);
      await set(newRequestRef, requestData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        days: [],
        startDate: '',
        endDate: '',
        reason: '',
        priority: 'medium'
      });

      toast.success('Library timing request submitted successfully!');
      fetchTimingRequests();
      setActiveTab('my-requests');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Library Timing Request
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit and manage library timing change requests
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          {[
            { id: 'new-request', name: 'New Request', icon: '📝' },
            { id: 'my-requests', name: 'My Requests', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* New Request Tab */}
        {activeTab === 'new-request' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Submit Library Timing Request
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Request changes to library operating hours or special timing arrangements
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Extended Library Hours for Exam Period"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the timing change request and its purpose..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days of Week *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Request *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Explain why this timing change is needed..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-6">
            {timingRequests.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">⏰</div>
                <p className="text-gray-500 dark:text-gray-400">No timing requests submitted yet</p>
              </div>
            ) : (
              timingRequests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {request.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {request.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                          <p className={`font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Time:</span>
                          <p className="font-medium">
                            {formatTime(request.requestedTiming.startTime)} - {formatTime(request.requestedTiming.endTime)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                          <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timing Details */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requested Timing:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Period:</span>
                        <p className="font-medium">
                          {new Date(request.requestedTiming.startDate).toLocaleDateString()} - {new Date(request.requestedTiming.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Days:</span>
                        <p className="font-medium capitalize">
                          {request.requestedTiming.days.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                      <p className="font-medium">{request.reason}</p>
                    </div>
                  </div>

                  {/* Approval Flow */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Approval Progress:</h4>
                    <div className="flex items-center space-x-4">
                      {request.approvalFlow.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.status === 'approved' 
                              ? 'bg-green-500 text-white' 
                              : step.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : step.status === 'pending'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✗' : index + 1}
                          </div>
                          <div className="ml-2">
                            <p className="text-xs font-medium text-gray-900 dark:text-white">{step.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{step.status}</p>
                          </div>
                          {index < request.approvalFlow.length - 1 && (
                            <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* History */}
                  {request.history && request.history.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Activity:</h4>
                      <div className="space-y-2">
                        {request.history.slice(-3).map((entry, index) => (
                          <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{entry.action}</span> by {entry.by} ({entry.role}) - {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsstLibrarianTimingRequest; 