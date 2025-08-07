import React, { useState, useEffect } from 'react';
import { ref, push, get, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FileText, Upload, AlertCircle, CheckCircle, Clock, XCircle, DollarSign, Calendar, Users } from 'lucide-react';

interface PayrollRequest {
  id: string;
  clerkId: string;
  clerkName: string;
  requestType: string;
  department: string;
  month: string;
  year: string;
  amount: number;
  description: string;
  documents: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  employeeCount?: number;
  overtimeHours?: number;
  allowanceType?: string;
}

const PayrollRequest: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<PayrollRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    requestType: '',
    department: '',
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
    description: '',
    employeeCount: '',
    overtimeHours: '',
    allowanceType: '',
    documents: [] as string[]
  });

  // College-specific request types
  const requestTypes = [
    { 
      value: 'salary_processing', 
      label: 'Salary Processing', 
      description: 'Monthly salary processing for all staff',
      requiresEmployeeCount: true
    },
    { 
      value: 'overtime_claims', 
      label: 'Overtime Claims', 
      description: 'Overtime payment for extra hours worked',
      requiresOvertimeHours: true
    },
    { 
      value: 'travel_allowance', 
      label: 'Travel Allowance', 
      description: 'Travel and conveyance allowance',
      requiresAllowanceType: true
    },
    { 
      value: 'medical_allowance', 
      label: 'Medical Allowance', 
      description: 'Medical and health allowance',
      requiresAllowanceType: true
    },
    { 
      value: 'house_rent_allowance', 
      label: 'House Rent Allowance', 
      description: 'HRA for eligible employees',
      requiresAllowanceType: true
    },
    { 
      value: 'leave_encashment', 
      label: 'Leave Encashment', 
      description: 'Convert unused leaves to salary',
      requiresEmployeeCount: true
    },
    { 
      value: 'performance_bonus', 
      label: 'Performance Bonus', 
      description: 'Performance-based bonus payments',
      requiresEmployeeCount: true
    },
    { 
      value: 'festival_bonus', 
      label: 'Festival Bonus', 
      description: 'Festival and special occasion bonus',
      requiresEmployeeCount: true
    }
  ];

  // College departments
  const departments = [
    'CSE', 'AI_DS', 'ECE', 'MECH', 'CIVIL', 'EEE', 'Electronics Engg (VLSI)',
    'Administration', 'Library', 'Workshop', 'Maintenance', 'Security'
  ];

  // Allowance types
  const allowanceTypes = [
    'Travel', 'Medical', 'House Rent', 'Dearness', 'Special', 'Transport'
  ];

  // Months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (currentUser) {
      fetchUserRequests();
    }
  }, [currentUser]);

  const fetchUserRequests = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      const requestsRef = ref(database, `payrollRequests/${currentUser.uid}`);
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
    
    if (!currentUser?.uid) {
      toast.error('User information not found');
      return;
    }

    if (!formData.requestType || !formData.department || !formData.amount || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const newRequest: Omit<PayrollRequest, 'id'> = {
        clerkId: currentUser.uid,
        clerkName: currentUser.name || 'Clerk',
        requestType: formData.requestType,
        department: formData.department,
        month: formData.month,
        year: formData.year,
        amount: parseFloat(formData.amount),
        description: formData.description,
        documents: formData.documents,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Add specific fields based on request type
      const selectedType = requestTypes.find(t => t.value === formData.requestType);
      if (selectedType?.requiresEmployeeCount && formData.employeeCount) {
        newRequest.employeeCount = parseInt(formData.employeeCount);
      }
      if (selectedType?.requiresOvertimeHours && formData.overtimeHours) {
        newRequest.overtimeHours = parseFloat(formData.overtimeHours);
      }
      if (selectedType?.requiresAllowanceType && formData.allowanceType) {
        newRequest.allowanceType = formData.allowanceType;
      }

      const requestsRef = ref(database, `payrollRequests/${currentUser.uid}`);
      const newRequestRef = push(requestsRef);
      
      await update(newRequestRef, newRequest);
      
      toast.success('Payroll request submitted successfully');
      setShowForm(false);
      setFormData({
        requestType: '',
        department: '',
        month: '',
        year: new Date().getFullYear().toString(),
        amount: '',
        description: '',
        employeeCount: '',
        overtimeHours: '',
        allowanceType: '',
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

  const getRequestTypeLabel = (type: string) => {
    return requestTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payroll Requests</h1>
              <p className="text-gray-600">Submit and track payroll processing requests</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              New Request
            </button>
          </div>

          {/* Request Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Submit Payroll Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Type *
                    </label>
                    <select
                      value={formData.requestType}
                      onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select request type</option>
                      {requestTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2024"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                {/* Conditional fields based on request type */}
                {formData.requestType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestTypes.find(t => t.value === formData.requestType)?.requiresEmployeeCount && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Employees
                        </label>
                        <input
                          type="number"
                          value={formData.employeeCount}
                          onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter number of employees"
                        />
                      </div>
                    )}
                    
                    {requestTypes.find(t => t.value === formData.requestType)?.requiresOvertimeHours && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overtime Hours
                        </label>
                        <input
                          type="number"
                          value={formData.overtimeHours}
                          onChange={(e) => setFormData({...formData, overtimeHours: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter overtime hours"
                        />
                      </div>
                    )}
                    
                    {requestTypes.find(t => t.value === formData.requestType)?.requiresAllowanceType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allowance Type
                        </label>
                        <select
                          value={formData.allowanceType}
                          onChange={(e) => setFormData({...formData, allowanceType: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select allowance type</option>
                          {allowanceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide detailed description of the payroll request..."
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
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payroll requests found</p>
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
                            {getRequestTypeLabel(request.requestType)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {request.department} - {request.month} {request.year}
                          </p>
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
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-lg">₹{request.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-semibold">{request.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Type</p>
                        <p className="font-semibold">{getRequestTypeLabel(request.requestType)}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Description:</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{request.description}</p>
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

export default PayrollRequest; 