import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, push, get } from 'firebase/database';
import { 
  Clock, 
  Calendar, 
  Send, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TimingRequest {
  id: string;
  requestType: 'library_timing_change' | 'holiday_schedule' | 'exam_schedule' | 'special_hours';
  currentTiming: string;
  proposedTiming: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

const AsstLibrarianPrincipalRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<TimingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    requestType: 'library_timing_change' as const,
    currentTiming: '',
    proposedTiming: '',
    reason: '',
    urgency: 'medium' as const
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const database = getDatabase();
      const requestsRef = ref(database, 'library_timing_requests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requestsData = snapshot.val();
        const requestsList = Object.entries(requestsData).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        setRequests(requestsList);
      } else {
        // Mock data for demonstration
        const mockRequests: TimingRequest[] = [
          {
            id: 'REQ001',
            requestType: 'library_timing_change',
            currentTiming: '8:00 AM - 6:00 PM',
            proposedTiming: '7:00 AM - 8:00 PM',
            reason: 'To accommodate evening study sessions for students',
            urgency: 'medium',
            status: 'pending',
            submittedBy: currentUser?.name || 'Librarian',
            submittedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 'REQ002',
            requestType: 'special_hours',
            currentTiming: 'Regular Hours',
            proposedTiming: 'Extended hours during exam period',
            reason: 'Students need extended access during final exams',
            urgency: 'high',
            status: 'approved',
            submittedBy: currentUser?.name || 'Librarian',
            submittedAt: '2024-01-10T14:20:00Z',
            reviewedBy: 'Principal',
            reviewedAt: '2024-01-12T09:15:00Z',
            comments: 'Approved for exam period only'
          }
        ];
        setRequests(mockRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const database = getDatabase();
      const requestsRef = ref(database, 'library_timing_requests');
      
      const newRequest = {
        ...formData,
        status: 'pending',
        submittedBy: currentUser?.name || 'Librarian',
        submittedAt: new Date().toISOString()
      };
      
      await push(requestsRef, newRequest);
      
      toast.success('Request submitted successfully');
      setShowForm(false);
      setFormData({
        requestType: 'library_timing_change',
        currentTiming: '',
        proposedTiming: '',
        reason: '',
        urgency: 'medium'
      });
      fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Principal Requests</h1>
        <p className="text-gray-600">Submit requests to the principal for library timing changes and special arrangements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(req => req.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(req => req.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter(req => req.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">Submit New Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData({...formData, requestType: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="library_timing_change">Library Timing Change</option>
                  <option value="holiday_schedule">Holiday Schedule</option>
                  <option value="exam_schedule">Exam Schedule</option>
                  <option value="special_hours">Special Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Timing
                </label>
                <input
                  type="text"
                  value={formData.currentTiming}
                  onChange={(e) => setFormData({...formData, currentTiming: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 8:00 AM - 6:00 PM"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Timing
                </label>
                <input
                  type="text"
                  value={formData.proposedTiming}
                  onChange={(e) => setFormData({...formData, proposedTiming: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 7:00 AM - 8:00 PM"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Explain the reason for this request..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{request.requestType.replace(/_/g, ' ').toUpperCase()}</h3>
                    <p className="text-sm text-gray-600">Submitted: {new Date(request.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Timing</p>
                    <p className="text-sm">{request.currentTiming}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Proposed Timing</p>
                    <p className="text-sm">{request.proposedTiming}</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600">Reason</p>
                  <p className="text-sm">{request.reason}</p>
                </div>
                
                {request.comments && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600">Principal Comments</p>
                    <p className="text-sm">{request.comments}</p>
                  </div>
                )}
                
                {request.reviewedBy && (
                  <div className="text-xs text-gray-500">
                    Reviewed by {request.reviewedBy} on {new Date(request.reviewedAt || '').toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsstLibrarianPrincipalRequest; 