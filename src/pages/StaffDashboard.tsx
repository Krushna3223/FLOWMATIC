import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase/config';
import { ref, get, set, push } from 'firebase/database';
import { 
  Users, 
  Building2, 
  Wrench, 
  ClipboardList, 
  Bell, 
  Calendar,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FacilityRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  requestedBy: string;
  requestedAt: string;
  assignedTo?: string;
  completedAt?: string;
}

interface MaintenanceRecord {
  id: string;
  facility: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  assignedTo: string;
}

const StaffDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [facilityRequests, setFacilityRequests] = useState<FacilityRequest[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [completedRequests, setCompletedRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchFacilityRequests(),
        fetchMaintenanceRecords(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilityRequests = async () => {
    try {
      const requestsRef = ref(database, 'facilityRequests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const requests: FacilityRequest[] = [];
        snapshot.forEach((childSnapshot) => {
          requests.push({
            id: childSnapshot.key!,
            ...childSnapshot.val()
          });
        });
        setFacilityRequests(requests);
      }
    } catch (error) {
      console.error('Error fetching facility requests:', error);
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      const recordsRef = ref(database, 'maintenanceRecords');
      const snapshot = await get(recordsRef);
      
      if (snapshot.exists()) {
        const records: MaintenanceRecord[] = [];
        snapshot.forEach((childSnapshot) => {
          records.push({
            id: childSnapshot.key!,
            ...childSnapshot.val()
          });
        });
        setMaintenanceRecords(records);
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const statsRef = ref(database, 'staffStatistics');
      const snapshot = await get(statsRef);
      
      if (snapshot.exists()) {
        const stats = snapshot.val();
        setTotalRequests(stats.totalRequests || 0);
        setPendingRequests(stats.pendingRequests || 0);
        setCompletedRequests(stats.completedRequests || 0);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'complete') => {
    try {
      const requestRef = ref(database, `facilityRequests/${requestId}`);
      
      if (action === 'complete') {
        await set(requestRef, {
          ...facilityRequests.find(r => r.id === requestId),
          status: 'completed',
          completedAt: new Date().toISOString(),
          assignedTo: currentUser?.uid
        });
        toast.success('Request marked as completed');
      } else if (action === 'approve') {
        await set(requestRef, {
          ...facilityRequests.find(r => r.id === requestId),
          status: 'in_progress',
          assignedTo: currentUser?.uid
        });
        toast.success('Request approved and assigned');
      } else {
        await set(requestRef, {
          ...facilityRequests.find(r => r.id === requestId),
          status: 'rejected'
        });
        toast.success('Request rejected');
      }
      
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard - STAFF ONLY</h1>
          <p className="text-gray-600">Manage facilities and maintenance requests</p>
          <p className="text-sm text-red-600">User Role: {currentUser?.role}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span>Welcome, {currentUser?.name}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedRequests}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="h-5 w-5 text-green-600" />
            <span className="font-medium">Add Maintenance Record</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Schedule Inspection</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Wrench className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Report Issue</span>
          </button>
        </div>
      </div>

      {/* Facility Requests */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Facility Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facilityRequests.slice(0, 5).map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'in_progress' && (
                        <button
                          onClick={() => handleRequestAction(request.id, 'complete')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Schedule</h2>
        <div className="space-y-4">
          {maintenanceRecords.slice(0, 3).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{record.facility}</h3>
                  <p className="text-sm text-gray-500">{record.description}</p>
                  <p className="text-xs text-gray-400">Scheduled: {new Date(record.scheduledDate).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 