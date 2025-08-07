import React, { useState, useEffect } from 'react';
import { ref, get, push, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { DollarSign, Users, Calendar, FileText, BarChart3 } from 'lucide-react';

interface PayrollRequest {
  id: string;
  clerkId: string;
  clerkName: string;
  requestType: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedBy?: string;
  processedAt?: string;
  comments?: string;
}

const AccountsAsstPayroll: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<PayrollRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchPayrollRequests();
  }, []);

  const fetchPayrollRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching payroll requests...');
      const requestsRef = ref(database, 'payrollRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const allRequests: PayrollRequest[] = [];
        const data = snapshot.val();
        
        // Handle different possible data structures
        if (data) {
          Object.keys(data).forEach((clerkId) => {
            const clerkRequests = data[clerkId];
            if (clerkRequests && typeof clerkRequests === 'object') {
              Object.keys(clerkRequests).forEach((requestId) => {
                const request = clerkRequests[requestId];
                if (request) {
                  allRequests.push({
                    id: requestId,
                    clerkId,
                    ...request
                  });
                }
              });
            }
          });
        }
        
        console.log('✅ Fetched payroll requests:', allRequests.length);
        setRequests(allRequests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
        
        // Calculate stats
        setStats({
          total: allRequests.length,
          pending: allRequests.filter(r => r.status === 'pending').length,
          approved: allRequests.filter(r => r.status === 'approved').length,
          rejected: allRequests.filter(r => r.status === 'rejected').length
        });
      } else {
        console.log('⚠️ No payroll requests found');
        setRequests([]);
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('❌ Error fetching payroll requests:', error);
      toast.error('Failed to load payroll requests');
      setRequests([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'pending' | 'approved' | 'rejected', comments?: string) => {
    try {
      // Find the request to get its path
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        toast.error('Request not found');
        return;
      }

      // Update the request status
      const updateData = {
        status: newStatus,
        processedBy: currentUser?.name || currentUser?.email,
        processedAt: new Date().toISOString(),
        comments: comments || ''
      };

      // Update in Firebase
      const requestRef = ref(database, `payrollRequests/${request.clerkId}/${requestId}`);
      await update(requestRef, updateData);

      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId 
            ? { ...req, ...updateData }
            : req
        )
      );
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        pending: prevStats.pending + (newStatus === 'pending' ? 1 : -1),
        approved: prevStats.approved + (newStatus === 'approved' ? 1 : -1),
        rejected: prevStats.rejected + (newStatus === 'rejected' ? 1 : -1)
      }));
      
      toast.success(`Request ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'salary':
        return 'bg-blue-100 text-blue-800';
      case 'bonus':
        return 'bg-purple-100 text-purple-800';
      case 'overtime':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payroll Management</h1>
        <p className="text-gray-600">Manage and process payroll requests from staff members</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Payroll Requests</h2>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payroll requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.clerkName}</div>
                        <div className="text-sm text-gray-500">ID: {request.clerkId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRequestTypeColor(request.requestType)}`}>
                        {request.requestType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{request.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'approved')}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const comments = prompt('Enter rejection reason:');
                              if (comments !== null) {
                                handleStatusUpdate(request.id, 'rejected', comments);
                              }
                            }}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-gray-500 text-xs">
                          {request.processedBy && `Processed by ${request.processedBy}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsAsstPayroll; 