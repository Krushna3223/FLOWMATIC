import React, { useState, useEffect } from 'react';
import { ref, push, get, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FileText, Upload, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface FeeWaiverRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  course: string;
  waiverType: string;
  amountRequested: number;
  reason: string;
  documents: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

const FeeWaiverRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<FeeWaiverRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    waiverType: '',
    amountRequested: '',
    reason: '',
    documents: [] as string[]
  });

  // College-specific waiver types
  const waiverTypes = [
    { value: 'financial_hardship', label: 'Financial Hardship', description: 'Family income below poverty line' },
    { value: 'merit_based', label: 'Merit-based Scholarship', description: 'Academic excellence (CGPA > 8.5)' },
    { value: 'sports_excellence', label: 'Sports Excellence', description: 'State/National level sports achievements' },
    { value: 'technical_achievement', label: 'Technical Achievement', description: 'Hackathons, competitions, projects' },
    { value: 'medical_emergency', label: 'Medical Emergency', description: 'Family medical emergency' },
    { value: 'orphan_student', label: 'Orphan Student', description: 'Support for orphan students' },
    { value: 'single_parent', label: 'Single Parent', description: 'Support for single parent families' },
    { value: 'disability_support', label: 'Disability Support', description: 'Students with disabilities' }
  ];

  useEffect(() => {
    if (currentUser) {
      fetchUserRequests();
    }
  }, [currentUser]);

  const fetchUserRequests = async () => {
    if (!currentUser?.rollNo) return;
    
    try {
      setLoading(true);
      const requestsRef = ref(database, `feeWaiverRequests/${currentUser.rollNo}`);
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const requestsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setRequests(requestsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.rollNo) {
      toast.error('Student information not found');
      return;
    }

    if (!formData.waiverType || !formData.amountRequested || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Get student details
      const studentRef = ref(database, `students/${currentUser.rollNo}`);
      const studentSnapshot = await get(studentRef);
      
      if (!studentSnapshot.exists()) {
        toast.error('Student information not found');
        return;
      }

      const studentData = studentSnapshot.val();
      
      const newRequest: Omit<FeeWaiverRequest, 'id'> = {
        studentId: currentUser.uid,
        studentName: currentUser.name || studentData.name,
        rollNumber: currentUser.rollNo,
        department: studentData.department || 'CSE',
        course: studentData.course || 'B-Tech',
        waiverType: formData.waiverType,
        amountRequested: parseFloat(formData.amountRequested),
        reason: formData.reason,
        documents: formData.documents,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      const requestsRef = ref(database, `feeWaiverRequests/${currentUser.rollNo}`);
      const newRequestRef = push(requestsRef);
      
      await update(newRequestRef, newRequest);
      
      toast.success('Fee waiver request submitted successfully');
      setShowForm(false);
      setFormData({
        waiverType: '',
        amountRequested: '',
        reason: '',
        documents: []
      });
      
      fetchUserRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Fee Waiver Requests</h1>
              <p className="text-gray-600">Submit and track your fee waiver applications</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              New Request
            </button>
          </div>

          {/* Request Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Submit Fee Waiver Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waiver Type *
                    </label>
                    <select
                      value={formData.waiverType}
                      onChange={(e) => setFormData({...formData, waiverType: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select waiver type</option>
                      {waiverTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Requested (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.amountRequested}
                      onChange={(e) => setFormData({...formData, amountRequested: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Waiver *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide detailed reason for fee waiver request..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Requests List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Your Requests</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No fee waiver requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {waiverTypes.find(t => t.value === request.waiverType)?.label}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Submitted on {new Date(request.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount Requested</p>
                        <p className="font-semibold">₹{request.amountRequested.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-semibold">{request.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Course</p>
                        <p className="font-semibold">{request.course}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Reason:</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                    </div>
                    
                    {request.comments && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Comments:</p>
                        <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{request.comments}</p>
                      </div>
                    )}
                    
                    {request.reviewedBy && (
                      <div className="text-sm text-gray-600">
                        Reviewed by: {request.reviewedBy} on {new Date(request.reviewedAt!).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeWaiverRequest; 